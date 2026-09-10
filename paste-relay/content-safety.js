// Scan/hash/encrypt orchestration for paste-relay content. See
// ../.claude/plans/change-the-google-oauth-tidy-lovelace.md, "Content
// encryption, keyed by the PIN" and "Workstream C — Content pipeline" for
// the full contract this implements.
//
// Two entry points, matching the plan's split between the async file
// pipeline and the synchronous text pipeline:
//   - processUploadAsync(itemId)          — files, fire-and-forget after
//                                            POST .../complete
//   - processTextSync(itemId, plaintext)  — text pastes, awaited inline
//                                            during POST /api/paste/text
//
// Both run the same three plaintext-time steps in the same order (filter
// is log-only and file-pipeline-only; scan and encrypt apply to both):
// filterText (text only, log-only) -> AV scan -> AES-256-GCM encrypt. The
// AV scan MUST see plaintext and MUST run before encryption, and a scan
// error is treated exactly like an infected result (fail closed) — never
// silently treated as clean.

const crypto = require("crypto");
const fs = require("fs");
const fsp = fs.promises;
const net = require("net");
const { PassThrough, Readable, Writable } = require("stream");

const db = require("./db");
const storage = require("./storage");
const itemCrypto = require("./item-crypto");

const CLAMD_HOST = process.env.CLAMD_HOST || "clamav";
const CLAMD_PORT = Number(process.env.CLAMD_PORT || 3310);

// ---------------------------------------------------------------------------
// Text filter — log-only, NOT a security boundary. Pasted text is only ever
// rendered via <Textarea value={...}> on the frontend, never
// dangerouslySetInnerHTML, so it is never interpreted as markup or
// executed. This exists purely to flag oddities into audit_log.detail for
// Felix's own visibility; it must never throw and must never cause a
// rejection by itself.
// ---------------------------------------------------------------------------

const SUSPICIOUS_SUBSTRINGS = ["<script", "javascript:", "onerror="];

function filterText(content) {
  const haystack = String(content || "").toLowerCase();
  const hits = SUSPICIOUS_SUBSTRINGS.filter((needle) => haystack.includes(needle));
  if (hits.length === 0) return { suspicious: false, detail: null };
  return { suspicious: true, detail: `heuristic match: ${hits.join(", ")}` };
}

// ---------------------------------------------------------------------------
// Hand-rolled clamd INSTREAM client. No subprocess/execFile anywhere —
// sidesteps command-injection risk entirely. Protocol:
//   1. connect, send the literal bytes "zINSTREAM\0"
//   2. for each chunk: a 4-byte big-endian length prefix, then the chunk
//   3. on input end: a zero-length chunk to terminate
//   4. read the reply: "stream: OK" (clean), "stream: <name> FOUND"
//      (infected), anything else (including any connection-level error) is
//      treated as a scan error and MUST fail closed — never "clean".
// ---------------------------------------------------------------------------

function scanStream(readableStream, { host, port } = {}) {
  const targetHost = host || CLAMD_HOST;
  const targetPort = port || CLAMD_PORT;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    let socket;
    try {
      socket = net.createConnection({ host: targetHost, port: targetPort });
    } catch (err) {
      finish({ clean: false, error: true });
      return;
    }

    const failClosed = () => {
      finish({ clean: false, error: true });
      socket.destroy();
      // Stop pulling more bytes from upstream once we've given up — avoids
      // leaving the source stream flowing into nowhere.
      readableStream.removeAllListeners("data");
      readableStream.pause();
    };

    let responseChunks = [];

    socket.on("error", failClosed);

    socket.on("connect", () => {
      socket.write("zINSTREAM\0");

      const onData = (chunk) => {
        const lenPrefix = Buffer.alloc(4);
        lenPrefix.writeUInt32BE(chunk.length, 0);
        const wroteLen = socket.write(lenPrefix);
        const wroteData = socket.write(chunk);
        if (!wroteLen || !wroteData) {
          readableStream.pause();
        }
      };
      const onEnd = () => {
        // Zero-length chunk terminates an INSTREAM session.
        socket.write(Buffer.alloc(4));
      };
      const onSourceError = () => failClosed();

      socket.on("drain", () => readableStream.resume());
      readableStream.on("data", onData);
      readableStream.on("end", onEnd);
      readableStream.on("error", onSourceError);
    });

    socket.on("data", (chunk) => {
      responseChunks.push(chunk);
    });

    socket.on("end", () => {
      const response = Buffer.concat(responseChunks)
        .toString("utf8")
        .replace(/\0/g, "")
        .trim();

      if (/stream:\s*OK\b/.test(response)) {
        finish({ clean: true, error: false });
        return;
      }
      const foundMatch = response.match(/stream:\s*(.+?)\s+FOUND/);
      if (foundMatch) {
        finish({ clean: false, error: false, signature: foundMatch[1] });
        return;
      }
      // Empty/garbled/unexpected reply — fail closed, never assume clean.
      finish({ clean: false, error: true });
    });

    socket.on("close", () => {
      // If neither 'end' (parsed a reply) nor an earlier error already
      // settled us, the connection dropped mid-scan — fail closed.
      failClosed();
    });
  });
}

// ---------------------------------------------------------------------------
// In-memory-only pending-pin registry, shared by BOTH pipelines.
//
// db.js's `items` schema has no column for the plaintext PIN (by design —
// see the plan's "even paste-relay itself never persists the plaintext
// PIN anywhere" property; db.reserveItem() only accepts `pinSalt`/
// `blobFilename`, never a raw `pin`). Yet both processUploadAsync(itemId)
// and processTextSync(itemId, plaintext) below take only an item id (to
// match Workstream D's server.js, which already calls them that way) and
// need the actual PIN to derive the encryption key. The PIN has to live
// *somewhere* reachable by id in the meantime; this in-process Map is that
// "somewhere" — plaintext PINs never touch disk or the DB, only RAM.
//
// REQUIRED caller contract for Workstream D: call
// `registerUploadPin(item.id, pin)` immediately after EVERY successful
// `db.reserveItem()` call — for text pastes as well as file uploads, right
// alongside generating the pin/pinSalt that get passed into reserveItem
// (via item-crypto.generatePin()/generatePinSalt() — use those rather
// than a locally-reimplemented pin generator, so there's one source of
// truth for what a "valid pin" looks like). Both processUploadAsync and
// processTextSync consume (pop) their entry exactly once. If the process
// restarts between reservation and processing, the map is simply empty on
// the other side — harmless, because storage.js's init() already
// force-rejects anything left `uploading`/`pending_scan` across a restart
// via db.rejectAllStuckUploads(), and processTextSync (synchronous, no
// restart window) would never hit this path in practice.
// ---------------------------------------------------------------------------

const pendingUploadPins = new Map();

function registerUploadPin(itemId, pin) {
  pendingUploadPins.set(itemId, pin);
}

function takeUploadPin(itemId) {
  const pin = pendingUploadPins.get(itemId);
  pendingUploadPins.delete(itemId);
  return pin || null;
}

async function safeUnlink(filePath) {
  if (!filePath) return;
  await fsp.rm(filePath, { force: true });
}

// db.js's rejectItem()/activateItem() jsdoc explicitly leaves audit_log
// writes for these transitions to the caller ("the caller is expected to
// write its own audit_log entry ... since only the caller (content-
// safety.js) knows why") — these two helpers do that, defensively: an
// audit-log write failure must never undo a real activation or trigger a
// spurious second rejection, so both are try/catch-and-log-only.
function auditActivated(item, { sha256 = null, detail = null } = {}) {
  try {
    db.writeAudit({
      eventType: "item_activated",
      accountId: item.ownerAccountId,
      itemId: item.id,
      filename: item.filename,
      sha256,
      sizeBytes: item.sizeBytes,
      sourceIp: item.sourceIp,
      detail,
    });
  } catch (err) {
    console.error(`writeAudit(item_activated) failed for item ${item.id}`, err);
  }
}

function auditRejected(item, reason, detail = null) {
  try {
    db.writeAudit({
      eventType: "item_rejected",
      accountId: item.ownerAccountId,
      itemId: item.id,
      filename: item.filename,
      sha256: item.sha256 || null,
      sizeBytes: item.sizeBytes,
      sourceIp: item.sourceIp,
      detail: detail || reason,
    });
  } catch (err) {
    console.error(`writeAudit(item_rejected) failed for item ${item.id}`, err);
  }
}

/**
 * Async orchestrator for a completed file upload. Called fire-and-forget
 * (NOT awaited) by Workstream D right after POST .../complete. Reads the
 * item's pinSalt/blobFilename from db.getItemById(itemId), recovers the
 * plaintext PIN from the in-memory registry above, then reads the
 * plaintext `.part` file ONCE, fanning it out to three simultaneous
 * consumers (a running SHA-256, the clamd scan, and item-crypto's AES-GCM
 * cipher writing straight to the final blob path) so a multi-GB file is
 * only ever read from disk a single time.
 *
 * Integration note (matches the actual, now-landed db.js — see its
 * reserveItem()/activateItem() jsdoc): `pin_salt` and `blob_filename` are
 * decided up front, at item-creation time, because db.reserveItem() takes
 * them as insert-time params (`{..., pinSalt, blobFilename}}`) — so
 * whoever calls reserveItem() for a file item (Workstream D's
 * POST /api/paste/file/init handler) must call item-crypto's
 * generatePin()/generatePinSalt()/deriveBlobFilename(pin, pinSalt) BEFORE
 * that call, then `registerUploadPin(item.id, pin)` (below) so this
 * function can recover the pin later. By the time this function runs,
 * item.pinSalt and item.blobFilename already exist on the row (note:
 * db.js's getItemById returns camelCase fields — `pinSalt`/
 * `blobFilename`/`expiresAt`, not `pin_salt`/`blob_filename`/
 * `expires_at`); only the AES-GCM key itself, plus content_iv/
 * content_auth_tag, are computed here, since those depend on the actual
 * plaintext bytes.
 *
 * On a clean scan: db.activateItem(itemId, {sha256, contentIv,
 * contentAuthTag}) (db.js's real param names — note NOT `iv`/`authTag`,
 * and blobFilename is never passed here since it was already set at
 * reserveItem() time), delete the plaintext `.part`, schedule the item's
 * precise expiry timer. On an infected or errored scan (scan errors FAIL
 * CLOSED, same as infected): db.rejectItem(itemId, 'av_positive' |
 * 'av_error'), delete both the plaintext `.part` and any partial
 * ciphertext.
 */
async function processUploadAsync(itemId) {
  const item = db.getItemById(itemId);
  if (!item) {
    // Item vanished from under us (shouldn't normally happen) — nothing
    // sane to do; make sure we don't leak the pin registry entry.
    takeUploadPin(itemId);
    return;
  }

  const plaintextPath = storage.partPath(itemId);
  const pin = takeUploadPin(itemId);

  if (!pin || !item.blobFilename) {
    // No registered PIN in memory (most likely a restart between upload
    // and scan — storage.init()'s rejectAllStuckUploads() should already
    // have caught this at startup, but guard here too defensively rather
    // than ever guessing/fabricating a PIN), or a caller bug left
    // blob_filename unset at reserveItem() time. Either way, fail closed.
    await safeUnlink(plaintextPath);
    db.rejectItem(itemId, "av_error");
    auditRejected(item, "av_error", "missing in-memory pin or blob_filename at scan time");
    return;
  }

  let destPath = null;
  try {
    const key = itemCrypto.derivePinKey(pin, item.pinSalt);
    destPath = storage.blobPath(item.blobFilename);

    const source = fs.createReadStream(plaintextPath);
    const hash = crypto.createHash("sha256");
    const hashSink = new Writable({
      write(chunk, _enc, cb) {
        hash.update(chunk);
        cb();
      },
    });
    const scanIn = new PassThrough();
    const encryptIn = new PassThrough();

    // A single Readable can be piped to multiple destinations; Node reads
    // the underlying file once and fans the same chunks out to all three
    // pipe destinations — this is the "one read pass, three consumers"
    // requirement for multi-GB-file efficiency.
    source.pipe(hashSink);
    source.pipe(scanIn);
    source.pipe(encryptIn);

    source.on("error", (err) => {
      hashSink.destroy(err);
      scanIn.destroy(err);
      encryptIn.destroy(err);
    });

    const hashDone = new Promise((resolve, reject) => {
      hashSink.on("finish", resolve);
      hashSink.on("error", reject);
    });

    const [scanResult, encryptResult] = await Promise.all([
      scanStream(scanIn, { host: CLAMD_HOST, port: CLAMD_PORT }),
      itemCrypto.encryptToFile(encryptIn, key, destPath),
      hashDone,
    ]);

    const sha256 = hash.digest("hex");

    if (!scanResult.clean) {
      await Promise.all([safeUnlink(plaintextPath), safeUnlink(destPath)]);
      const reason = scanResult.error ? "av_error" : "av_positive";
      db.rejectItem(itemId, reason);
      auditRejected(item, reason, scanResult.signature ? `clamd: ${scanResult.signature}` : null);
      return;
    }

    await safeUnlink(plaintextPath);
    db.activateItem(itemId, {
      sha256,
      contentIv: encryptResult.iv,
      contentAuthTag: encryptResult.authTag,
    });
    auditActivated(item, { sha256 });

    // Precise in-memory expiry timer, generalized from the old single-slot
    // design to this one item (see storage.js's scheduleItemExpiry doc).
    const activated = db.getItemById(itemId);
    if (activated && activated.expiresAt) {
      storage.scheduleItemExpiry(activated.expiresAt);
    }
  } catch (err) {
    console.error(`processUploadAsync failed for item ${itemId}`, err);
    await Promise.all([safeUnlink(plaintextPath), safeUnlink(destPath)]);
    db.rejectItem(itemId, "av_error");
    auditRejected(item, "av_error", `unexpected error: ${err.message}`);
  }
}

/**
 * Synchronous text-paste pipeline: filterText (log-only) + AV scan +
 * AES-256-GCM encryption of `plaintext`, run inline during
 * `POST /api/paste/text` and awaited (small content, per the plan — no
 * async complete/scan-pending step for text; the route must return an
 * immediate `expiresAt`).
 *
 * Chosen shape (function name/signature invented for this workstream,
 * since the plan describes the behavior but not a literal name).
 * Mirrors processUploadAsync's `(itemId)`-only shape and does its own
 * db.activateItem()/db.rejectItem()/writeAudit() calls internally, rather
 * than returning raw crypto material for the caller to store — this is
 * NOT what a from-scratch design here would necessarily pick (accepting
 * an already-derived key would be simpler), but it's what Workstream D's
 * server.js already calls it as (`await
 * contentSafety.processTextSync(item.id, content)`, checking
 * `processed.status === "active"` and reading `processed.expiresAt`), and
 * matching that beats an isolated "cleaner" design given both files land
 * independently:
 *
 *   processTextSync(itemId: string, plaintext: string) => Promise<Item | null>
 *
 * where `Item` is db.getItemById()'s row shape (status will be 'active'
 * on success, 'rejected' on an infected/errored scan) and `null` only if
 * itemId doesn't exist at all.
 *
 * REQUIRED caller contract (see the pending-pin-registry block above):
 *   const pin = itemCrypto.generatePin();
 *   const pinSalt = itemCrypto.generatePinSalt();
 *   const item = db.reserveItem({ ..., kind: 'text', pinSalt, blobFilename: null }); // FIRST statement, atomic
 *   contentSafety.registerUploadPin(item.id, pin); // BEFORE calling processTextSync
 *   const processed = await contentSafety.processTextSync(item.id, content);
 *   if (!processed || processed.status !== 'active') { ...respond content_rejected...; return; }
 *   ...respond 201 with { pin, expiresAt: processed.expiresAt } (only time
 *   the PIN is ever shown)...
 *
 * `item.textContent` is written as HEX (matching Workstream D's existing
 * `Buffer.from(item.textContent, "hex")` on the decrypt side in
 * pinAttemptMiddleware) — NOT base64.
 */
async function processTextSync(itemId, plaintext) {
  const item = db.getItemById(itemId);
  if (!item) return null;

  const pin = takeUploadPin(itemId);
  if (!pin) {
    // No registered PIN — caller skipped registerUploadPin(). Fail closed
    // rather than ever guessing/fabricating a PIN.
    db.rejectItem(itemId, "av_error");
    auditRejected(item, "av_error", "missing in-memory pin (registerUploadPin not called?)");
    return db.getItemById(itemId);
  }

  const { suspicious, detail } = filterText(plaintext);
  const buffer = Buffer.from(String(plaintext), "utf8");
  const scanResult = await scanStream(Readable.from(buffer), { host: CLAMD_HOST, port: CLAMD_PORT });

  if (!scanResult.clean) {
    const reason = scanResult.error ? "av_error" : "av_positive";
    db.rejectItem(itemId, reason);
    auditRejected(item, reason, scanResult.signature ? `clamd: ${scanResult.signature}` : detail);
    return db.getItemById(itemId);
  }

  const key = itemCrypto.derivePinKey(pin, item.pinSalt);
  const { ciphertext, iv, authTag } = itemCrypto.encryptBuffer(buffer, key);

  db.activateItem(itemId, {
    textContent: ciphertext.toString("hex"),
    contentIv: iv,
    contentAuthTag: authTag,
  });
  auditActivated(item, { detail: suspicious ? detail : null });

  const activated = db.getItemById(itemId);
  if (activated && activated.expiresAt) {
    storage.scheduleItemExpiry(activated.expiresAt);
  }
  return activated;
}

module.exports = {
  filterText,
  scanStream,
  registerUploadPin,
  processUploadAsync,
  processTextSync,
};
