// Cloudflare Turnstile verification for felixegan.me/paste.
//
// Used on both /api/auth/login and /api/auth/redeem-invite (auth.js), and
// on the two paste-create routes (wired by Workstream D's server.js). Per
// the plan's accepted trade-off ("Resolved design decisions" #... and the
// Workstream B notes), captcha here is load-bearing, not optional hardening
// — pattern-only login has no per-account lockout, so this plus the 5/min
// login rate limit are the real defenses against brute force.

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// verifyTurnstile(token, remoteIp) → Promise<boolean>
//
// POSTs form-encoded {secret, response, remoteip} to Cloudflare's siteverify
// endpoint using Node's built-in global fetch (no new dependency). Fails
// closed (returns false) on a missing token, a missing/unset
// TURNSTILE_SECRET_KEY, a network error talking to Cloudflare, or a
// malformed response — an unconfigured or unreachable captcha service must
// never be silently treated as "captcha passed."
async function verifyTurnstile(token, remoteIp) {
  if (typeof token !== "string" || !token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY || "";
  if (!secret) return false;

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  let response;
  try {
    response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch {
    return false;
  }

  if (!response.ok) return false;

  let data;
  try {
    data = await response.json();
  } catch {
    return false;
  }

  return Boolean(data && data.success === true);
}

// requireCaptcha — Express middleware. Reads req.body.turnstileToken (so it
// must run after a JSON body parser has populated req.body), verifies it,
// and either calls next() or responds with the standard captcha_failed
// error shape from the plan's "Workstream D" standard error body.
async function requireCaptcha(req, res, next) {
  const token = req.body && req.body.turnstileToken;
  const ok = await verifyTurnstile(token, req.ip);
  if (!ok) {
    res.status(403).json({
      error: "captcha_failed",
      message: "Captcha verification failed. Please try again.",
      retryAt: null,
    });
    return;
  }
  next();
}

module.exports = { verifyTurnstile, requireCaptcha };
