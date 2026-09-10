// Auth for felixegan.me/paste: admin-issued invites + pattern-hash login,
// replacing the old Google OAuth allowlist entirely. Implements Workstream
// B of /home/felix/.claude/plans/change-the-google-oauth-tidy-lovelace.md
// against the frozen schema/functions in that plan's "Shared data model".
//
// Session tokens are a minimal hand-rolled HMAC-signed opaque token, not a
// JWT library: base64url(JSON payload) + "." + base64url(HMAC-SHA256 of the
// payload). The payload carries {accountId, sid, expiresAt}, where `sid`
// matches the `id` of a row in db.js's `sessions` table, so a session can
// be revoked server-side (logout, future admin action) even though the
// token itself is checked for signature+expiry purely locally, with no DB
// hit, in verifySessionToken.

const crypto = require("crypto");
const express = require("express");
const rateLimit = require("express-rate-limit");

const db = require("./db");
const { requireCaptcha } = require("./captcha");

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 86400);

// -----------------------------------------------------------------------
// Pattern-hash crypto helpers (deriveServerHash / verifyServerHash)
//
// Resolved during integration: db.js (Workstream A) ended up implementing
// this same scrypt-based derivation inline (see its redeemInvite/
// findAccountByPatternHash) rather than requiring this module, so the
// circular-require risk originally flagged here never materialized — db.js
// has no `require("./auth")` anywhere. These two helpers are kept as the
// auth-crypto module's own exports (unused by db.js, but available to any
// future caller that needs the same derivation) rather than deleted, since
// removing them isn't necessary and they cost nothing to keep.
// -----------------------------------------------------------------------

function deriveServerHash(clientHashHex, salt) {
  return crypto.scryptSync(clientHashHex, salt, 64).toString("hex");
}

function verifyServerHash(clientHashHex, salt, storedHash) {
  const candidate = Buffer.from(deriveServerHash(clientHashHex, salt), "hex");
  const stored = Buffer.from(storedHash, "hex");
  if (candidate.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidate, stored);
}

// -----------------------------------------------------------------------
// Session token issuance/verification (pure crypto; verify does no DB hit)
// -----------------------------------------------------------------------

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return secret;
}

function signPayload(payloadB64, secret) {
  return crypto.createHmac("sha256", secret).update(payloadB64).digest();
}

// issueSessionToken(accountId, sid) → {token, sid, expiresAt}
//
// Deviation from the plan's shorthand `issueSessionToken(accountId)`
// listing, flagged here and called out in the final report: this function
// takes the session id (`sid`) as an explicit second argument rather than
// generating it itself or calling db.createSession internally. Rationale:
// `sid` must exactly equal the `id` column of the row that
// db.createSession(accountId, ip) inserts into `sessions` — that's what
// makes db.isSessionRevoked(sid) / db.revokeSession(sid) find the right row
// later — so the natural place to generate it is db.createSession itself
// (assumed to return the generated hex id), not this function. Call sites
// (this file's /redeem-invite and /login handlers, and eventually any other
// code that needs to mint a session) do:
//   const sid = db.createSession(accountId, req.ip);
//   const { token, expiresAt } = issueSessionToken(accountId, sid);
// This also keeps issueSessionToken a pure function of its arguments plus
// SESSION_SECRET/SESSION_TTL_SECONDS — no DB access at all — which is what
// makes it (and verifySessionToken) independently unit-testable with zero
// dependency on db.js ever existing.
function issueSessionToken(accountId, sid) {
  const secret = getSessionSecret();
  const expiresAtMs = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = { accountId, sid, expiresAt: expiresAtMs };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sigB64 = signPayload(payloadB64, secret).toString("base64url");
  return {
    token: `${payloadB64}.${sigB64}`,
    sid,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

// verifySessionToken(token) → {accountId, sid} | null
//
// Signature + expiry check only — deliberately no DB hit here (see the
// plan's note that this is used internally by requireAuth, which follows a
// successful verify with a separate db.isSessionRevoked(sid) check). Never
// throws: any malformed input just yields null.
function verifySessionToken(token) {
  if (typeof token !== "string" || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  let secret;
  try {
    secret = getSessionSecret();
  } catch {
    return null;
  }

  let expectedSig;
  let providedSig;
  try {
    expectedSig = signPayload(payloadB64, secret);
    providedSig = Buffer.from(sigB64, "base64url");
  } catch {
    return null;
  }

  if (
    providedSig.length !== expectedSig.length ||
    !crypto.timingSafeEqual(providedSig, expectedSig)
  ) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    !payload ||
    typeof payload.accountId === "undefined" ||
    payload.accountId === null ||
    typeof payload.sid !== "string" ||
    !payload.sid ||
    typeof payload.expiresAt !== "number"
  ) {
    return null;
  }

  if (Date.now() >= payload.expiresAt) return null;

  return { accountId: payload.accountId, sid: payload.sid };
}

// -----------------------------------------------------------------------
// requireAuth middleware
// -----------------------------------------------------------------------

// Fail closed: an unset SESSION_SECRET means nobody gets in, not "everyone"
// — same philosophy as the old Google-OAuth auth.js's
// ALLOWED_EMAILS/GOOGLE_OAUTH_CLIENT_ID check it replaces.
function requireAuth(req, res, next) {
  if (!process.env.SESSION_SECRET) {
    res.status(500).json({
      error: "server_misconfigured",
      message: "Relay is not configured (SESSION_SECRET)",
    });
    return;
  }

  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "unauthorized", message: "Missing bearer token" });
    return;
  }

  const verified = verifySessionToken(token);
  if (!verified) {
    res.status(401).json({ error: "unauthorized", message: "Invalid or expired session" });
    return;
  }

  let revoked;
  try {
    revoked = db.isSessionRevoked(verified.sid);
  } catch {
    res.status(500).json({ error: "server_error", message: "Session check failed" });
    return;
  }
  if (revoked) {
    res.status(401).json({ error: "unauthorized", message: "Session has been revoked" });
    return;
  }

  req.session = { accountId: verified.accountId, sessionId: verified.sid };
  next();
}

// -----------------------------------------------------------------------
// authRouter — mounted whole at /api/auth by Workstream D (server.js).
// -----------------------------------------------------------------------

const authRouter = express.Router();

// All three routes below read JSON bodies (logout doesn't strictly need
// one, but parsing an absent/empty body is harmless).
authRouter.use(express.json({ limit: "10kb" }));

// Login-specific rate limit: the plan's main compensating control for
// pattern-only auth having no per-account lockout (there's no account to
// lock until a match is found — see plan "Accepted trade-off"). Mounted
// before requireCaptcha on /login — cheapest/local check before the
// external Turnstile network call, matching the ordering rationale in
// Workstream D ("cheapest/local checks first, external captcha call last").
const loginLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "rate_limited",
      message: "Too many login attempts. Please wait before trying again.",
      retryAt:
        req.rateLimit && req.rateLimit.resetTime
          ? new Date(req.rateLimit.resetTime).toISOString()
          : null,
    });
  },
});

// POST /redeem-invite  {inviteToken, patternHashClient, turnstileToken}
//   → 201 {token, expiresAt}
authRouter.post("/redeem-invite", requireCaptcha, (req, res) => {
  const { inviteToken, patternHashClient } = req.body || {};
  if (
    typeof inviteToken !== "string" ||
    !inviteToken ||
    typeof patternHashClient !== "string" ||
    !patternHashClient
  ) {
    res.status(400).json({ error: "invalid_request", message: "Missing invite token or pattern." });
    return;
  }

  // One generic error for expired/already-redeemed/unknown tokens alike —
  // deliberately not distinguishing which, per the plan: this avoids
  // handing an attacker an oracle for enumerating valid-but-expired vs.
  // never-existed invite tokens.
  let account = null;
  try {
    account = db.redeemInvite(inviteToken, patternHashClient, req.ip);
  } catch {
    account = null;
  }
  if (!account) {
    res.status(400).json({
      error: "invite_invalid",
      message: "This invite link is invalid or has expired.",
    });
    return;
  }

  const sid = db.createSession(account.id, req.ip);
  const { token, expiresAt } = issueSessionToken(account.id, sid);
  res.status(201).json({ token, expiresAt });
});

// POST /login  {patternHashClient, turnstileToken} → 200 {token, expiresAt}
authRouter.post("/login", loginLimiter, requireCaptcha, (req, res) => {
  const { patternHashClient } = req.body || {};
  if (typeof patternHashClient !== "string" || !patternHashClient) {
    res.status(400).json({ error: "invalid_request", message: "Missing pattern." });
    return;
  }

  let account = null;
  try {
    account = db.findAccountByPatternHash(patternHashClient);
  } catch {
    account = null;
  }
  const success = Boolean(account);

  // Logged either way — recordLoginAttempt backs the per-IP throttle and
  // admin-dashboard visibility; writeAudit backs the permanent audit trail.
  // Never let a logging failure block or change the auth decision itself.
  try {
    db.recordLoginAttempt(req.ip, success);
  } catch {
    // ignore
  }
  try {
    db.writeAudit({
      event_type: success ? "login_success" : "login_failed",
      account_id: success ? account.id : null,
      source_ip: req.ip,
      detail: success ? null : "pattern_mismatch",
    });
  } catch {
    // ignore
  }

  if (!success) {
    res.status(401).json({ error: "login_failed", message: "Pattern not recognized." });
    return;
  }

  const sid = db.createSession(account.id, req.ip);
  const { token, expiresAt } = issueSessionToken(account.id, sid);
  res.status(200).json({ token, expiresAt });
});

// POST /logout — requires a valid session; revokes it.
authRouter.post("/logout", requireAuth, (req, res) => {
  try {
    db.revokeSession(req.session.sessionId);
  } catch {
    res.status(500).json({ error: "server_error", message: "Failed to revoke session" });
    return;
  }
  res.status(204).end();
});

module.exports = {
  authRouter,
  requireAuth,
  issueSessionToken,
  verifySessionToken,
  deriveServerHash,
  verifyServerHash,
};
