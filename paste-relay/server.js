// Backend for felixegan.me/paste. Implements Workstream D ("API server &
// route wiring") of the plan at
// .claude/plans/change-the-google-oauth-tidy-lovelace.md, which supersedes
// ../docs/theta-paste-relay-plan.md (that doc still needs updating/removal
// per the plan's closing note — not this workstream's file to touch).
//
// This file is the integration point where Workstream A (db.js),
// Workstream B (auth.js/captcha.js) and Workstream C
// (storage.js/item-crypto.js/content-safety.js) contracts meet. This was
// originally drafted against documented-but-unverified assumptions about
// the other workstreams' exact shapes (see git history for the original
// ASSUMPTIONS block); those have since been reconciled against the real,
// landed code from all three workstreams during the integration pass.
// Notable fixes made during that pass (kept here since they're easy to
// silently regress):
//   - Every db.reserveItem() call MUST be followed by
//     contentSafety.registerUploadPin(item.id, pin) — content-safety.js
//     recovers the raw PIN from that in-memory registry, since db.js never
//     stores it. Omitting this call makes every paste/upload fail closed.
//   - pin/pinSalt generation uses itemCrypto.generatePin()/
//     generatePinSalt() (the single source of truth for "what a valid PIN
//     looks like"), not a locally-reimplemented generator.
//   - pinAttemptMiddleware's PIN-attempt bookkeeping is deliberately
//     asymmetric between text and file items — see the long comment above
//     that function for why a file's wrong-PIN detection can't happen
//     until the download stream itself resolves (GCM's auth tag is only
//     verified at the end of a streaming decrypt), and how attempt
//     recording is deferred to the download route accordingly.

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");

const storage = require("./storage");
const db = require("./db");
const { authRouter, requireAuth } = require("./auth");
const { requireCaptcha } = require("./captcha");
const contentSafety = require("./content-safety");
const itemCrypto = require("./item-crypto");

const PORT = Number(process.env.PORT || 8787);
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES || 5 * 1024 * 1024 * 1024);
const CREATE_RATE_LIMIT_PER_MIN = Number(process.env.CREATE_RATE_LIMIT_PER_MIN || 1);
const PIN_MAX_ATTEMPTS = Number(process.env.PIN_MAX_ATTEMPTS || 5);
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || "https://felixegan.me,https://www.felixegan.me")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const LIVE_STATUSES = ["uploading", "pending_scan", "active"];

const app = express();
// Only the Cloudflare Tunnel sits in front of this service (no other public
// ingress — see the security checklist in the plan doc), so its
// X-Forwarded-For is trustworthy for rate-limit keying. Unchanged from
// before this rewrite.
app.set("trust proxy", true);

// Minimal request logging: never the pasted content, per the plan's "never
// log content" rule. req.session is attached by requireAuth, which (for
// authenticated routes) runs before this listener fires on "finish", even
// though this middleware is registered first.
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.path} -> ${res.statusCode} (account:${(req.session && req.session.accountId) || "-"})`,
    );
  });
  next();
});

app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,X-Paste-Pin");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.status(204).end();
    return;
  }
  next();
});

app.get("/healthz", (req, res) => res.status(200).send("ok"));

app.use("/api/auth", authRouter);

// Replaces the old 30/min writeLimiter: 1/min/IP, shared by both create
// routes (text paste and file init), per the plan's tighter abuse budget.
const createLimiter = rateLimit({
  windowMs: 60_000,
  max: CREATE_RATE_LIMIT_PER_MIN,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "rate_limited",
      message: "Too many paste/upload attempts from this address. Try again soon.",
      retryAt: req.rateLimit && req.rateLimit.resetTime ? req.rateLimit.resetTime.toISOString() : null,
    });
  },
});

function normalizeRetryAt(value) {
  if (!value) return null;
  return typeof value.toISOString === "function" ? value.toISOString() : value;
}

function respondReservationError(res, reason, sourceIp) {
  const retryAt = normalizeRetryAt(db.computeRetryAt(reason, sourceIp));
  const messages = {
    quota_exceeded: "Total storage quota reached. Try again once older items expire.",
    ip_limit_exceeded: "You already have the maximum number of active items from this network.",
  };
  const status = reason === "quota_exceeded" ? 507 : 429;
  res.status(status).json({
    error: reason,
    message: messages[reason] || "This item could not be reserved.",
    retryAt,
  });
}

// Public shape for item metadata: never text_content, pin, pin_salt,
// content_iv, content_auth_tag, or anything else crypto/PIN-related.
function toPublicItem(item) {
  return {
    id: item.id,
    kind: item.kind,
    filename: item.filename,
    mime: item.mime,
    size: item.sizeBytes,
    status: item.status,
    createdAt: item.createdAt,
    readyAt: item.readyAt,
    expiresAt: item.expiresAt,
  };
}

// ---------------------------------------------------------------------
// Paste item routes
// ---------------------------------------------------------------------

// Caller's own items only.
app.get("/api/paste/items", requireAuth, (req, res) => {
  const items = db
    .getItemsByOwner(req.session.accountId)
    .filter((item) => LIVE_STATUSES.includes(item.status))
    .map(toPublicItem);
  res.json({ items });
});

// Any authenticated account — the cross-account sharing route
// (felixegan.me/paste/i/<id>). Metadata only, same shape as above.
app.get("/api/paste/items/:id", requireAuth, (req, res) => {
  const item = db.getItemById(req.params.id);
  if (!item || item.deletedAt || !LIVE_STATUSES.includes(item.status)) {
    res.status(404).json({ error: "not_found", message: "Item not found.", retryAt: null });
    return;
  }
  res.json(toPublicItem(item));
});

app.post(
  "/api/paste/text",
  createLimiter,
  requireAuth,
  express.json({ limit: "15mb" }),
  requireCaptcha,
  async (req, res) => {
    const { content } = req.body || {};
    if (typeof content !== "string") {
      res.status(400).json({ error: "invalid_request", message: "content must be a string", retryAt: null });
      return;
    }

    const pin = itemCrypto.generatePin();
    const pinSalt = itemCrypto.generatePinSalt();

    // Atomic quota + IP-cap check + row insert — must be the very first
    // statement in the handler and a single non-yielding call (see the
    // plan's Atomicity note: node:sqlite is fully synchronous and Node is
    // single-threaded, so a function with no `await` inside can't be
    // interleaved with another request).
    const reservation = db.reserveItem({
      ownerAccountId: req.session.accountId,
      sourceIp: req.ip,
      kind: "text",
      filename: null,
      mime: null,
      sizeBytes: Buffer.byteLength(content, "utf8"),
      pin,
      pinSalt,
    });

    if (!reservation.ok) {
      respondReservationError(res, reservation.reason, req.ip);
      return;
    }

    const item = reservation.item;
    // REQUIRED per content-safety.js's pending-pin-registry contract: the
    // raw PIN is never stored in the DB, so processTextSync/processUploadAsync
    // can only recover it from this in-memory map, keyed by item id.
    // Without this call, every paste/upload fails closed with "missing
    // in-memory pin" (content-safety.js's own guard against ever guessing
    // one). Must happen before calling processTextSync below.
    contentSafety.registerUploadPin(item.id, pin);

    let processed;
    try {
      // Synchronous (awaited) unlike the file pipeline: text pastes must
      // return an immediate expiresAt, so there's no 202-pending_scan step
      // here. See ASSUMPTION 4 above re: processTextSync.
      processed = await contentSafety.processTextSync(item.id, content);
    } catch (err) {
      console.error(`text paste processing failed for item ${item.id}`, err);
      db.rejectItem(item.id, "processing_error");
      res.status(500).json({ error: "internal_error", message: "Failed to process paste.", retryAt: null });
      return;
    }

    if (!processed || processed.status !== "active") {
      res.status(422).json({
        error: "content_rejected",
        message: "This paste was rejected by content scanning.",
        retryAt: null,
      });
      return;
    }

    res.status(201).json({ id: item.id, pin, status: processed.status, expiresAt: processed.expiresAt });
  },
);

app.post(
  "/api/paste/file/init",
  createLimiter,
  requireAuth,
  express.json({ limit: "10kb" }),
  requireCaptcha,
  (req, res) => {
    const { filename, size, mime } = req.body || {};
    if (
      typeof filename !== "string" ||
      !filename ||
      typeof size !== "number" ||
      !Number.isFinite(size) ||
      size <= 0 ||
      typeof mime !== "string"
    ) {
      res.status(400).json({ error: "invalid_request", message: "Invalid init payload", retryAt: null });
      return;
    }
    if (size > MAX_FILE_BYTES) {
      res.status(413).json({ error: "file_too_large", message: "File exceeds MAX_FILE_BYTES", retryAt: null });
      return;
    }
    if (storage.freeBytes() < size * 1.05) {
      res.status(507).json({
        error: "insufficient_storage",
        message: "Insufficient storage on Theta for this upload",
        retryAt: null,
      });
      return;
    }

    const pin = itemCrypto.generatePin();
    const pinSalt = itemCrypto.generatePinSalt();

    // Same atomicity requirement as the text route above — first statement,
    // one non-yielding call.
    const reservation = db.reserveItem({
      ownerAccountId: req.session.accountId,
      sourceIp: req.ip,
      kind: "file",
      filename,
      mime,
      sizeBytes: size,
      pin,
      pinSalt,
    });

    if (!reservation.ok) {
      respondReservationError(res, reservation.reason, req.ip);
      return;
    }

    const item = reservation.item;
    // REQUIRED per content-safety.js's pending-pin-registry contract — see
    // the identical comment on the text route above. processUploadAsync
    // (fired after /complete) recovers this PIN to derive the encryption
    // key; without registering it here first, the scan/encrypt pipeline
    // fails closed for every file upload.
    contentSafety.registerUploadPin(item.id, pin);
    fs.writeFile(storage.partPath(item.id), Buffer.alloc(0), (err) => {
      if (err) {
        console.error(`failed to create tmp part file for item ${item.id}`, err);
        db.rejectItem(item.id, "storage_error");
        res.status(500).json({ error: "internal_error", message: "Failed to start upload.", retryAt: null });
        return;
      }
      res.status(201).json({ id: item.id, pin, status: item.status, expiresAt: item.expiresAt });
    });
  },
);

// Raw stream straight to storage's tmp part path. Append-only,
// offset-must-match-current-size mechanics preserved verbatim from the
// pre-rewrite version of this file (only the identifier source changed:
// the item id now doubles as what used to be a separate uploadId).
app.put("/api/paste/items/:id/chunk", requireAuth, async (req, res) => {
  const { id } = req.params;
  const offset = Number(req.query.offset);
  if (!Number.isInteger(offset) || offset < 0) {
    res.status(400).send("Invalid offset");
    return;
  }

  const item = db.getItemById(id);
  if (!item || item.ownerAccountId !== req.session.accountId || item.status !== "uploading") {
    res.status(404).send("Unknown upload");
    return;
  }

  const partPath = storage.partPath(id);
  let currentSize;
  try {
    currentSize = (await fsp.stat(partPath)).size;
  } catch {
    res.status(404).send("Unknown upload");
    return;
  }

  if (offset !== currentSize) {
    res.status(409).send("Offset does not match received bytes; GET status to resync");
    return;
  }

  const contentLength = Number(req.get("content-length") || 0);
  if (currentSize + contentLength > item.sizeBytes || currentSize + contentLength > MAX_FILE_BYTES) {
    res.status(413).send("Chunk would exceed the declared file size");
    return;
  }

  try {
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(partPath, { flags: "a" });
      req.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("finish", resolve);
      req.pipe(writeStream);
    });
  } catch {
    res.status(500).send("Write failed");
    return;
  }

  res.status(204).end();
});

app.get("/api/paste/items/:id/status", requireAuth, async (req, res) => {
  const item = db.getItemById(req.params.id);
  if (!item || item.ownerAccountId !== req.session.accountId) {
    res.status(404).json({ error: "not_found", message: "Unknown upload", retryAt: null });
    return;
  }

  let receivedBytes = 0;
  if (item.status === "uploading") {
    try {
      receivedBytes = (await fsp.stat(storage.partPath(item.id))).size;
    } catch {
      // Init happened but no chunk has landed yet — 0 is correct.
    }
  }

  res.json({ ...toPublicItem(item), receivedBytes });
});

app.post("/api/paste/items/:id/complete", requireAuth, async (req, res) => {
  const item = db.getItemById(req.params.id);
  if (!item || item.ownerAccountId !== req.session.accountId || item.status !== "uploading") {
    res.status(404).json({ error: "not_found", message: "Unknown upload", retryAt: null });
    return;
  }

  const partPath = storage.partPath(item.id);
  let stat;
  try {
    stat = await fsp.stat(partPath);
  } catch {
    res.status(404).json({ error: "not_found", message: "Unknown upload", retryAt: null });
    return;
  }
  if (stat.size !== item.sizeBytes) {
    res.status(409).json({
      error: "size_mismatch",
      message: `Received ${stat.size} bytes, expected ${item.sizeBytes}`,
      retryAt: null,
    });
    return;
  }

  db.markItemPendingScan(item.id);
  res.status(202).json({ id: item.id, status: "pending_scan" });

  // Fire-and-forget, deliberately not awaited: holding this HTTP request
  // open through a multi-GB AV scan risks the Cloudflare Tunnel's edge
  // timeout. processUploadAsync fails closed internally (scan errors ->
  // db.rejectItem), so the only thing left to do here is log an
  // unexpected throw.
  contentSafety.processUploadAsync(item.id).catch((err) => {
    console.error(`processUploadAsync failed for item ${item.id}`, err);
  });
});

// Records one PIN attempt (success or failure) via db.recordPinAttempt,
// and on a failure that crosses the lockout threshold, destroys the
// on-disk blob (db.js never touches the filesystem) and writes the
// pin_locked audit row. Shared by the text (synchronous) and file
// (deferred, see below) paths so both count against the same 5-attempt
// budget the same way. Returns `{locked, attemptsRemaining}`.
function recordPinOutcome(req, item, success) {
  // See ASSUMPTION 3 at the top of this file re: recordPinAttempt's return
  // shape and the getItemById fallback.
  const attemptResult = db.recordPinAttempt(item.id, success);
  let locked;
  let attemptsRemaining;
  if (attemptResult && typeof attemptResult === "object" && "locked" in attemptResult) {
    locked = Boolean(attemptResult.locked);
    attemptsRemaining = attemptResult.attemptsRemaining;
  } else {
    const refreshed = db.getItemById(item.id);
    locked = !refreshed || Boolean(refreshed.pinLockedAt) || refreshed.status === "rejected";
    const attemptsSoFar = refreshed ? refreshed.pinAttempts : PIN_MAX_ATTEMPTS;
    attemptsRemaining = Math.max(0, PIN_MAX_ATTEMPTS - attemptsSoFar);
  }

  if (!success && locked) {
    if (item.kind === "file" && item.blobFilename) {
      fsp.unlink(path.join(storage.itemsDir, item.blobFilename)).catch(() => {});
    }
    db.writeAudit({
      eventType: "pin_locked",
      accountId: req.session.accountId,
      itemId: item.id,
      filename: item.filename,
      sha256: item.sha256,
      sizeBytes: item.sizeBytes,
      sourceIp: req.ip,
      detail: "5 consecutive wrong PIN attempts",
    });
  }

  return { locked, attemptsRemaining };
}

// Shared by both /unlock and /download so PIN brute-force throttling can't
// be bypassed by hitting one route instead of the other. A GCM auth-tag
// failure on the decrypt attempt *is* "wrong PIN" (see item-crypto.js).
//
// IMPORTANT asymmetry between kinds, load-bearing for correct attempt
// counting: `decryptBuffer` (text) decrypts fully in memory and throws
// *synchronously* on a wrong key, so text attempts can be recorded right
// here, before any response is sent. `decryptFromFile` (file) returns a
// stream immediately and only verifies the GCM auth tag once the *entire*
// ciphertext has been read (Node's streaming decipher emits plaintext
// optimistically, before authenticity is confirmed — see item-crypto.js's
// docs) — so for files, success/failure genuinely cannot be known yet at
// this point. Recording an attempt here unconditionally for files (as an
// earlier draft did) is a real bug: it always "succeeds" synchronously
// (since decryptFromFile never throws/returns null up front), which both
// fails to count wrong guesses AND resets the attempt counter on every
// wrong guess via the always-true success branch — completely bypassing
// the 5-attempt lockout for file downloads. The fix: attach the stream and
// defer recording to the download route handler below, which listens for
// the stream's 'error' (AuthTagMismatchError = wrong PIN) vs. the
// response's 'finish' (success) event.
async function pinAttemptMiddleware(req, res, next) {
  const pin = (req.body && req.body.pin) || req.get("X-Paste-Pin");
  if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    res.status(400).json({ error: "invalid_request", message: "A 4-digit pin is required.", retryAt: null });
    return;
  }

  const item = db.getItemById(req.params.id);
  if (!item || item.deletedAt || item.status !== "active") {
    res.status(404).json({ error: "not_found", message: "Item not found.", retryAt: null });
    return;
  }
  if (item.pinLockedAt) {
    res.status(410).json({
      error: "pin_locked",
      message: "This item was already destroyed after too many wrong PIN attempts.",
      retryAt: null,
    });
    return;
  }

  const key = itemCrypto.derivePinKey(pin, item.pinSalt);

  if (item.kind === "text") {
    const ciphertext = Buffer.from(item.textContent, "hex");
    let plaintext;
    try {
      // decryptBuffer (not decryptFromFile) for text: it decrypts fully in
      // memory and verifies the auth tag synchronously, so a wrong PIN is
      // known before any response is sent — see item-crypto.js's docs on
      // why this is the correct function for the "small content" case.
      plaintext = itemCrypto.decryptBuffer(ciphertext, key, item.contentIv, item.contentAuthTag);
    } catch (err) {
      if (!(err instanceof itemCrypto.AuthTagMismatchError)) {
        console.error(`pin decrypt attempt errored for item ${item.id}`, err);
      }
      const { locked, attemptsRemaining } = recordPinOutcome(req, item, false);
      if (locked) {
        res.status(410).json({
          error: "pin_locked",
          message: "This item was destroyed after too many wrong PIN attempts.",
          retryAt: null,
        });
      } else {
        res.status(403).json({ error: "pin_wrong", attemptsRemaining });
      }
      return;
    }
    recordPinOutcome(req, item, true);
    req.pasteItem = item;
    req.pasteContent = plaintext;
    next();
    return;
  }

  // File kind: attach the decrypting stream and let the download route
  // below record the outcome once it's actually known.
  const blobPath = path.join(storage.itemsDir, item.blobFilename);
  req.pasteItem = item;
  req.pasteContent = itemCrypto.decryptFromFile(blobPath, key, item.contentIv, item.contentAuthTag);
  next();
}

app.post(
  "/api/paste/items/:id/unlock",
  requireAuth,
  express.json({ limit: "1kb" }),
  pinAttemptMiddleware,
  (req, res) => {
    const item = req.pasteItem;
    if (item.kind !== "text") {
      // The middleware already attached a live decrypt stream for a file
      // item without recording any attempt (see above) — this route never
      // consumes it, so tear it down rather than leaking the underlying
      // file descriptor.
      if (req.pasteContent && typeof req.pasteContent.destroy === "function") {
        req.pasteContent.destroy();
      }
      res.status(400).json({
        error: "invalid_request",
        message: "Only text pastes unlock inline; use /download for files.",
        retryAt: null,
      });
      return;
    }
    res.json({ id: item.id, kind: "text", content: req.pasteContent.toString("utf8") });
  },
);

app.get("/api/paste/items/:id/download", requireAuth, pinAttemptMiddleware, (req, res) => {
  const item = req.pasteItem;
  if (item.kind !== "file") {
    res.status(400).json({ error: "invalid_request", message: "Only file items can be downloaded.", retryAt: null });
    return;
  }

  const safeFilename = (item.filename || "download").replace(/[\r\n"]/g, "");
  res.setHeader("Content-Type", item.mime || "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);

  const plaintext = req.pasteContent;
  let settled = false;

  // Success is only known once every byte has been flushed to the
  // response — pipe() doesn't propagate a source 'error' into the
  // destination's 'finish', so these two listeners are mutually exclusive
  // in practice (see the long comment on pinAttemptMiddleware above for
  // why this can't be known any earlier for files).
  res.on("finish", () => {
    if (settled) return;
    settled = true;
    recordPinOutcome(req, item, true);
  });

  plaintext.on("error", (err) => {
    if (settled) return;
    settled = true;
    if (err instanceof itemCrypto.AuthTagMismatchError) {
      const { locked, attemptsRemaining } = recordPinOutcome(req, item, false);
      // The response may already be partially sent by this point (GCM only
      // verifies at the very end of the stream) — there's no clean JSON
      // error left to send; the client sees a truncated/corrupted
      // download, which is the accepted failure mode item-crypto.js
      // documents for this case. What matters is that the attempt is now
      // correctly counted and the lockout still fires at 5 wrong guesses.
      console.error(
        `wrong PIN detected mid-stream for item ${item.id} (locked=${locked}, attemptsRemaining=${attemptsRemaining})`,
      );
    } else {
      console.error(`download stream error for item ${item.id}`, err);
    }
    if (!res.headersSent) res.status(500).end();
    else res.destroy();
  });

  plaintext.pipe(res);
});

app.delete("/api/paste/items/:id", requireAuth, async (req, res) => {
  const item = db.getItemById(req.params.id);
  if (!item || item.ownerAccountId !== req.session.accountId) {
    res.status(404).json({ error: "not_found", message: "Item not found.", retryAt: null });
    return;
  }

  if (item.kind === "file" && item.blobFilename) {
    await fsp.unlink(path.join(storage.itemsDir, item.blobFilename)).catch(() => {});
  }
  if (item.status === "uploading") {
    await fsp.unlink(storage.partPath(item.id)).catch(() => {});
  }

  db.deleteItem(item.id);
  res.status(204).end();
});

storage
  .init()
  .then(() => {
    app.listen(PORT, () => console.log(`paste-relay listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to initialize storage", err);
    process.exit(1);
  });
