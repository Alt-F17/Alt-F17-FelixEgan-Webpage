// paste-relay data layer (Workstream A of
// docs/theta-paste-relay-plan.md's replacement design — see
// /home/felix/.claude/plans/change-the-google-oauth-tidy-lovelace.md,
// "Shared data model" + "Workstream A" sections for the frozen contract
// this file implements).
//
// Every other backend module (auth.js, storage.js, item-crypto.js,
// content-safety.js, server.js) reads/writes SQLite exclusively through the
// functions exported here — nothing outside this file touches the database
// directly. Uses Node 22's built-in `node:sqlite` (DatabaseSync), so this
// adds zero new npm dependencies. No migration framework: single-owner app,
// small enough that "add a column, bump nothing" is an accepted
// simplification (see plan).

"use strict";

const crypto = require("node:crypto");
const path = require("node:path");
const fs = require("node:fs");
const { DatabaseSync } = require("node:sqlite");

const STORAGE_DIR = process.env.STORAGE_DIR || "/var/lib/paste-relay";
const DB_PATH = path.join(STORAGE_DIR, "paste-relay.db");

const TTL_SECONDS = Number(process.env.TTL_SECONDS || 300);
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 86400);
// Fixed by the plan text ("expires_at (24h)") — not made configurable via
// env because no other workstream's env section lists an invite-TTL var.
const INVITE_TTL_SECONDS = 24 * 60 * 60;
const TOTAL_QUOTA_BYTES = Number(process.env.TOTAL_QUOTA_BYTES || 21474836480); // 20GB
const MAX_ITEMS_PER_IP = Number(process.env.MAX_ITEMS_PER_IP || 3);
const PIN_MAX_ATTEMPTS = Number(process.env.PIN_MAX_ATTEMPTS || 5);

// Statuses that must still count against the 20GB logical quota and the
// per-IP item cap: an in-flight upload ('uploading'), a file mid-scan
// ('pending_scan'), and a live item ('active') all occupy real space or a
// real slot. Only 'rejected'/'expired' (rows are deleted outright, see
// sweep functions below) and soft-deleted rows fall out of this set.
const RESERVING_STATUSES = ["uploading", "pending_scan", "active"];

fs.mkdirSync(STORAGE_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS pending_invites (
    id TEXT PRIMARY KEY,
    label TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    redeemed_at INTEGER,
    redeemed_account_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    salt TEXT NOT NULL,
    pattern_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    created_ip TEXT,
    last_login_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_ip TEXT NOT NULL,
    attempted_at INTEGER NOT NULL,
    success INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    revoked_at INTEGER,
    created_ip TEXT
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    owner_account_id INTEGER NOT NULL,
    source_ip TEXT NOT NULL,
    kind TEXT NOT NULL,
    filename TEXT,
    mime TEXT,
    size_bytes INTEGER NOT NULL,
    text_content TEXT,
    sha256 TEXT,
    blob_filename TEXT,
    pin_salt TEXT NOT NULL,
    content_iv TEXT,
    content_auth_tag TEXT,
    pin_attempts INTEGER NOT NULL DEFAULT 0,
    pin_locked_at INTEGER,
    status TEXT NOT NULL,
    reject_reason TEXT,
    created_at INTEGER NOT NULL,
    ready_at INTEGER,
    expires_at INTEGER,
    deleted_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_items_status_expires ON items(status, expires_at);
  CREATE INDEX IF NOT EXISTS idx_items_source_ip_status ON items(source_ip, status);
  CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_account_id);

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    account_id INTEGER,
    item_id TEXT,
    filename TEXT,
    sha256 TEXT,
    size_bytes INTEGER,
    source_ip TEXT,
    detail TEXT,
    created_at INTEGER NOT NULL
  );
`);

// ---- small helpers -------------------------------------------------------

const now = () => Date.now();
// All "*_at" columns are stored as integer epoch-millis (simplest to
// compare/sort correctly in SQLite); every function here converts them to
// ISO strings on the way out, since that's the shape the API layer and
// frontend deal in throughout the rest of the plan (e.g. the standard
// error body's `retryAt: "ISO timestamp or null"`).
const toIso = (ms) => (ms === null || ms === undefined ? null : new Date(ms).toISOString());

function mapAccount(row) {
  if (!row) return null;
  return {
    id: row.id,
    label: row.label,
    salt: row.salt,
    patternHash: row.pattern_hash,
    createdAt: toIso(row.created_at),
    createdIp: row.created_ip,
    lastLoginAt: toIso(row.last_login_at),
  };
}

function mapItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerAccountId: row.owner_account_id,
    sourceIp: row.source_ip,
    kind: row.kind,
    filename: row.filename,
    mime: row.mime,
    sizeBytes: row.size_bytes,
    textContent: row.text_content,
    sha256: row.sha256,
    blobFilename: row.blob_filename,
    pinSalt: row.pin_salt,
    contentIv: row.content_iv,
    contentAuthTag: row.content_auth_tag,
    pinAttempts: row.pin_attempts,
    pinLockedAt: toIso(row.pin_locked_at),
    status: row.status,
    rejectReason: row.reject_reason,
    createdAt: toIso(row.created_at),
    readyAt: toIso(row.ready_at),
    expiresAt: toIso(row.expires_at),
    deletedAt: toIso(row.deleted_at),
  };
}

function getItemRow(id) {
  return db.prepare("SELECT * FROM items WHERE id = ?").get(id);
}

// Blob-filename derivation is conceptually item-crypto.js's job per the plan
// (Workstream C: deriveBlobFilename(pin, pinSalt), HMAC-SHA256, base64url),
// and reserveItem() below accepts an already-derived `blobFilename` from a
// caller that did it that way. This fallback exists because reserveItem is
// documented as the *first* statement in a create-route handler (before any
// scanning/encryption work), so a caller may instead just hand reserveItem
// the raw `pin` + `pinSalt` and let it derive the filename itself. Safe to
// duplicate: the plan is explicit that blob_filename is "a naming/
// obfuscation convention... not itself a security boundary", and nothing
// downstream ever recomputes it independently — every other module reads
// `item.blobFilename` back from the DB rather than deriving it a second
// time. The raw PIN itself is still never written to any column either way.
const ENCRYPTION_PEPPER = process.env.ENCRYPTION_PEPPER || "";
function deriveBlobFilenameFallback(pin, pinSalt) {
  return crypto.createHmac("sha256", ENCRYPTION_PEPPER).update(`blob:${pin}${pinSalt}`).digest("base64url");
}

// ---- invites / accounts / login ------------------------------------------

function createInvite(label = null) {
  const id = crypto.randomBytes(24).toString("base64url");
  const ts = now();
  const expiresAt = ts + INVITE_TTL_SECONDS * 1000;
  db.prepare("INSERT INTO pending_invites (id, label, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    id,
    label,
    ts,
    expiresAt,
  );
  return { token: id, label, createdAt: toIso(ts), expiresAt: toIso(expiresAt) };
}

function redeemInvite(token, patternHashClient, ip) {
  const invite = db.prepare("SELECT * FROM pending_invites WHERE id = ?").get(token);
  if (!invite) return null;
  if (invite.redeemed_at !== null) return null;
  if (invite.expires_at <= now()) return null;

  // Same derivation as findAccountByPatternHash below: a fresh random salt
  // per account, scrypt over the client-supplied pattern hash.
  const salt = crypto.randomBytes(16).toString("hex");
  const patternHash = crypto.scryptSync(patternHashClient, salt, 64).toString("hex");
  const ts = now();

  const result = db
    .prepare("INSERT INTO accounts (label, salt, pattern_hash, created_at, created_ip) VALUES (?, ?, ?, ?, ?)")
    .run(invite.label, salt, patternHash, ts, ip);

  db.prepare("UPDATE pending_invites SET redeemed_at = ?, redeemed_account_id = ? WHERE id = ?").run(
    ts,
    result.lastInsertRowid,
    token,
  );

  return mapAccount(db.prepare("SELECT * FROM accounts WHERE id = ?").get(result.lastInsertRowid));
}

// O(n) in account count, by design: pattern-only login has no username to
// index by, so every account's hash has to be recomputed with its own salt
// and compared. Accepted per the plan — signup is admin-only, so account
// counts stay in the tens/hundreds; revisit (e.g. bring back a username)
// if that ever grows past a few hundred.
function findAccountByPatternHash(patternHashClient) {
  const accounts = db.prepare("SELECT * FROM accounts").all();
  for (const row of accounts) {
    const candidate = crypto.scryptSync(patternHashClient, row.salt, 64);
    const stored = Buffer.from(row.pattern_hash, "hex");
    if (candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored)) {
      return mapAccount(row);
    }
  }
  return null;
}

function recordLoginAttempt(ip, success) {
  db.prepare("INSERT INTO login_attempts (source_ip, attempted_at, success) VALUES (?, ?, ?)").run(
    ip,
    now(),
    success ? 1 : 0,
  );
}

function createSession(accountId, ip) {
  const sid = crypto.randomBytes(32).toString("hex");
  const ts = now();
  const expiresAt = ts + SESSION_TTL_SECONDS * 1000;
  db.prepare("INSERT INTO sessions (id, account_id, created_at, expires_at, created_ip) VALUES (?, ?, ?, ?, ?)").run(
    sid,
    accountId,
    ts,
    expiresAt,
    ip,
  );
  // Only column that ever gets updated after account creation on this path;
  // both login and invite-redemption call createSession, so this is the one
  // place that needs to touch it.
  db.prepare("UPDATE accounts SET last_login_at = ? WHERE id = ?").run(ts, accountId);
  // Returns the bare sid string (not an object) — auth.js's issueSessionToken
  // embeds this directly as the token payload's `sid` field and computes its
  // own token expiresAt independently from SESSION_TTL_SECONDS, so it never
  // needs anything else back from this call.
  return sid;
}

// Named for the revocation check specifically (matching the frozen export
// name), but this is also the *only* full-validity gate in the frozen
// contract — there's no separate isSessionExpired export — so requireAuth
// is expected to treat a `true` return as "reject this session" whether the
// underlying reason is revocation, expiry, or the id simply not existing.
function isSessionRevoked(sid) {
  const row = db.prepare("SELECT revoked_at, expires_at FROM sessions WHERE id = ?").get(sid);
  if (!row) return true;
  if (row.revoked_at !== null) return true;
  if (row.expires_at <= now()) return true;
  return false;
}

function revokeSession(sid) {
  const result = db.prepare("UPDATE sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL").run(now(), sid);
  return result.changes > 0;
}

// ---- quota / IP-cap accounting -------------------------------------------

function countActiveItemsForIp(ip) {
  const placeholders = RESERVING_STATUSES.map(() => "?").join(", ");
  const row = db
    .prepare(`SELECT COUNT(*) AS n FROM items WHERE source_ip = ? AND deleted_at IS NULL AND status IN (${placeholders})`)
    .get(ip, ...RESERVING_STATUSES);
  return row.n;
}

function getTotalActiveBytes() {
  const placeholders = RESERVING_STATUSES.map(() => "?").join(", ");
  const row = db
    .prepare(`SELECT COALESCE(SUM(size_bytes), 0) AS total FROM items WHERE deleted_at IS NULL AND status IN (${placeholders})`)
    .get(...RESERVING_STATUSES);
  return row.total;
}

// reason: "ip_limit_exceeded" | "quota_exceeded" (the standard error body's
// `error` values). Soonest expires_at among the items actually blocking —
// only 'active' items have a known expires_at (uploading/pending_scan don't
// yet), so this returns null when everything blocking is still mid-scan,
// per the plan's "null when nothing blocking has a known expiry yet" rule.
function computeRetryAt(reason, sourceIp) {
  let sql = "SELECT MIN(expires_at) AS soonest FROM items WHERE status = 'active' AND deleted_at IS NULL";
  const params = [];
  if (reason === "ip_limit_exceeded") {
    sql += " AND source_ip = ?";
    params.push(sourceIp);
  } else if (reason !== "quota_exceeded") {
    return null;
  }
  const row = db.prepare(sql).get(...params);
  return row && row.soonest != null ? toIso(row.soonest) : null;
}

// ---- items ----------------------------------------------------------------

// LOAD-BEARING ATOMICITY — do not add `await` anywhere in this function.
// node:sqlite is fully synchronous and Node is single-threaded, so as long
// as this function never yields the event loop, no other request's handler
// can run between the IP-cap/quota checks below and the INSERT that
// reserves the slot. That's what makes "check both caps, then insert" a
// single race-free unit without an explicit BEGIN/COMMIT transaction: two
// concurrent uploads from the same IP, or two uploads that would together
// exceed the 20GB quota, cannot both pass the check and both insert. If
// this function ever gains an `await` (e.g. to call out to another
// service before inserting), that guarantee is gone and the caps become
// racy.
//
// Returns `{ ok: true, item }` on success or `{ ok: false, reason }` — where
// `reason` is "ip_limit_exceeded" | "quota_exceeded", the same strings used
// as the standard error body's `error` field — for the two *expected*
// failure modes. Deliberately does not throw for those two cases (a caller
// is expected to branch on `.ok`, not wrap this in try/catch); it still
// throws for genuine programmer error (e.g. a non-numeric sizeBytes).
//
// `blobFilename` (file kind only) may be passed pre-derived, or this
// function will derive it itself from `pin`+`pinSalt` if `pin` is given
// instead — see deriveBlobFilenameFallback() above for why both are
// accepted. The raw PIN is never stored in any column regardless of which
// form the caller uses.
function reserveItem({
  ownerAccountId,
  sourceIp,
  kind,
  filename = null,
  mime = null,
  sizeBytes,
  pin = null,
  pinSalt,
  blobFilename = null,
}) {
  if (!Number.isFinite(sizeBytes) || sizeBytes < 0) {
    throw new Error("reserveItem: sizeBytes must be a non-negative number");
  }

  let resolvedBlobFilename = blobFilename;
  if (!resolvedBlobFilename && kind === "file" && pin) {
    resolvedBlobFilename = deriveBlobFilenameFallback(pin, pinSalt);
  }
  if (kind === "file" && !resolvedBlobFilename) {
    throw new Error("reserveItem: kind='file' requires blobFilename (or pin+pinSalt to derive one)");
  }

  if (countActiveItemsForIp(sourceIp) >= MAX_ITEMS_PER_IP) {
    return { ok: false, reason: "ip_limit_exceeded" };
  }
  if (getTotalActiveBytes() + sizeBytes > TOTAL_QUOTA_BYTES) {
    return { ok: false, reason: "quota_exceeded" };
  }

  const id = crypto.randomUUID();
  const ts = now();
  db.prepare(
    `INSERT INTO items
       (id, owner_account_id, source_ip, kind, filename, mime, size_bytes, pin_salt, blob_filename, pin_attempts, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'uploading', ?)`,
  ).run(id, ownerAccountId, sourceIp, kind, filename, mime, sizeBytes, pinSalt, resolvedBlobFilename, ts);

  return { ok: true, item: mapItem(getItemRow(id)) };
}

function markItemPendingScan(id) {
  db.prepare("UPDATE items SET status = 'pending_scan' WHERE id = ? AND status = 'uploading'").run(id);
  return getItemById(id);
}

// {sha256, contentIv, contentAuthTag, textContent} — sha256/textContent are
// file-only/text-only respectively per the schema (whichever doesn't apply
// stays null). ready_at is set here, to *now*, which is what starts the TTL
// clock (expires_at = ready_at + TTL_SECONDS) — per the plan's explicit
// "only after detected/filtered/scanned/ready" requirement, this must only
// be called once the content-safety pipeline has actually cleared the item.
function activateItem(id, { sha256 = null, contentIv = null, contentAuthTag = null, textContent = null } = {}) {
  const ts = now();
  const expiresAt = ts + TTL_SECONDS * 1000;
  db.prepare(
    `UPDATE items
     SET status = 'active', sha256 = ?, content_iv = ?, content_auth_tag = ?, text_content = ?,
         ready_at = ?, expires_at = ?
     WHERE id = ?`,
  ).run(sha256, contentIv, contentAuthTag, textContent, ts, expiresAt, id);
  return getItemById(id);
}

// Marks the item rejected and immediately soft-deletes it (it was never
// active/downloadable, so there's nothing worth keeping visible to its
// owner) — the caller is expected to write its own audit_log entry (via
// writeAudit) with whatever detail it has (e.g. "infected", "scan_error"),
// since only the caller (content-safety.js) knows why.
function rejectItem(id, reason) {
  const existing = getItemRow(id);
  if (!existing) return null;
  db.prepare("UPDATE items SET status = 'rejected', reject_reason = ?, deleted_at = ? WHERE id = ?").run(
    reason,
    now(),
    id,
  );
  return getItemById(id);
}

// LOAD-BEARING ATOMICITY — do not add `await` anywhere in this function.
// Same reasoning as reserveItem() above: node:sqlite is synchronous and
// Node is single-threaded, so "read attempts, increment, check the lockout
// threshold, and conditionally destroy the row" runs as one unit that no
// other request can interleave with. Without that guarantee, two concurrent
// wrong-PIN requests could both read pin_attempts=4, both compute 5, and
// both believe *they* are the one crossing PIN_MAX_ATTEMPTS (or a destroy
// could be missed entirely) — do not add an `await` here.
// Returns { found, locked, attempts, attemptsRemaining, item }. `locked`
// and `attemptsRemaining` are the two fields a pinAttemptMiddleware-style
// caller needs directly: on lockout, destroy already happened (see below)
// and `item` is a pre-deletion snapshot for audit logging.
function recordPinAttempt(id, success) {
  const item = getItemRow(id);
  if (!item) {
    // Nothing left to update — most likely a race with another request's
    // lockout-triggered destroy in between the caller's own lookup and this
    // call. Reported as locked/destroyed rather than "wrong PIN, try
    // again", since the item genuinely no longer exists either way.
    return { found: false, locked: true, attempts: PIN_MAX_ATTEMPTS, attemptsRemaining: 0, item: null };
  }

  if (success) {
    // A correct PIN resets the "consecutive wrong guesses" streak.
    db.prepare("UPDATE items SET pin_attempts = 0 WHERE id = ?").run(id);
    return { found: true, locked: false, attempts: 0, attemptsRemaining: PIN_MAX_ATTEMPTS, item: getItemById(id) };
  }

  const attempts = item.pin_attempts + 1;
  if (attempts >= PIN_MAX_ATTEMPTS) {
    // Destroy immediately rather than freeze — appropriate for a
    // 5-minute-lifespan item; a locked-but-retained item would just sit
    // there un-openable until it expired anyway. Snapshot before deleting
    // so the caller can still write a pin_locked audit entry with the
    // item's details.
    db.prepare("UPDATE items SET pin_attempts = ?, pin_locked_at = ? WHERE id = ?").run(attempts, now(), id);
    const snapshot = mapItem(getItemRow(id));
    db.prepare("DELETE FROM items WHERE id = ?").run(id);
    return { found: true, locked: true, attempts, attemptsRemaining: 0, item: snapshot };
  }

  db.prepare("UPDATE items SET pin_attempts = ? WHERE id = ?").run(attempts, id);
  return {
    found: true,
    locked: false,
    attempts,
    attemptsRemaining: Math.max(0, PIN_MAX_ATTEMPTS - attempts),
    item: getItemById(id),
  };
}

function getItemsByOwner(accountId) {
  return db
    .prepare("SELECT * FROM items WHERE owner_account_id = ? AND deleted_at IS NULL ORDER BY created_at DESC")
    .all(accountId)
    .map(mapItem);
}

function getItemById(id) {
  return mapItem(getItemRow(id));
}

// Soft-deletes (sets deleted_at) rather than hard-deleting the row —
// user-initiated deletion of a still-active item is common enough that
// keeping a short-lived trace seems worth it; audit_log is the permanent
// record either way. Returns the post-update row (including blobFilename)
// so the caller can unlink the on-disk blob, if any.
function deleteItem(id) {
  const existing = getItemRow(id);
  if (!existing || existing.deleted_at !== null) return null;
  db.prepare("UPDATE items SET deleted_at = ? WHERE id = ?").run(now(), id);
  return getItemById(id);
}

// ---- sweeps (called from storage.js's background timer / startup) --------
//
// These run with no external orchestrator watching to log the transition,
// so unlike reserveItem/activateItem/rejectItem/deleteItem above, these
// three write their own audit_log entries as part of the same sweep.

function sweepExpiredItems() {
  const rows = db
    .prepare(
      "SELECT * FROM items WHERE status = 'active' AND deleted_at IS NULL AND expires_at IS NOT NULL AND expires_at <= ?",
    )
    .all(now());

  const swept = [];
  for (const row of rows) {
    writeAudit({
      eventType: "item_expired",
      accountId: row.owner_account_id,
      itemId: row.id,
      filename: row.filename,
      sha256: row.sha256,
      sizeBytes: row.size_bytes,
      sourceIp: row.source_ip,
    });
    db.prepare("DELETE FROM items WHERE id = ?").run(row.id);
    swept.push(mapItem(row));
  }
  return swept;
}

// Force-rejects anything that's been stuck in pending_scan for longer than
// deadlineMs (a crashed/hung scan should not count against quota forever).
// Uses created_at as the reference point (there's no dedicated
// "entered pending_scan at" column in the frozen schema) — for a file this
// is upload-init time, which is a slightly earlier point than when scanning
// actually began, so this is a conservative (slightly early) trigger, never
// a late one.
function sweepStuckPendingScans(deadlineMs) {
  const cutoff = now() - deadlineMs;
  const rows = db
    .prepare("SELECT * FROM items WHERE status = 'pending_scan' AND deleted_at IS NULL AND created_at <= ?")
    .all(cutoff);

  const swept = [];
  for (const row of rows) {
    writeAudit({
      eventType: "item_rejected",
      accountId: row.owner_account_id,
      itemId: row.id,
      filename: row.filename,
      sha256: row.sha256,
      sizeBytes: row.size_bytes,
      sourceIp: row.source_ip,
      detail: "scan_timeout",
    });
    db.prepare("DELETE FROM items WHERE id = ?").run(row.id);
    swept.push(mapItem(row));
  }
  return swept;
}

// Called once at startup (storage.js's init()) to reject anything left in
// 'uploading' by a crashed previous process — these never got as far as
// pending_scan, so sweepStuckPendingScans() wouldn't catch them.
function rejectAllStuckUploads() {
  const rows = db.prepare("SELECT * FROM items WHERE status = 'uploading' AND deleted_at IS NULL").all();

  const swept = [];
  for (const row of rows) {
    writeAudit({
      eventType: "item_rejected",
      accountId: row.owner_account_id,
      itemId: row.id,
      filename: row.filename,
      sha256: row.sha256,
      sizeBytes: row.size_bytes,
      sourceIp: row.source_ip,
      detail: "server_restarted",
    });
    db.prepare("DELETE FROM items WHERE id = ?").run(row.id);
    swept.push(mapItem(row));
  }
  return swept;
}

// ---- audit log --------------------------------------------------------

// Accepts both camelCase (eventType/accountId/itemId/sizeBytes/sourceIp —
// the convention used everywhere else in this file, and by
// server.js/content-safety.js's calls) and snake_case (event_type/
// account_id/item_id/size_bytes/source_ip — matching the audit_log column
// names verbatim, which is how auth.js's calls happen to be written).
// Rather than pick one and let the other silently insert nulls/undefined
// (a real, observed mismatch between those two call sites), both are
// coalesced here; camelCase wins if a caller somehow sets both.
function writeAudit(params = {}) {
  const eventType = params.eventType ?? params.event_type ?? null;
  const accountId = params.accountId ?? params.account_id ?? null;
  const itemId = params.itemId ?? params.item_id ?? null;
  const filename = params.filename ?? null;
  const sha256 = params.sha256 ?? null;
  const sizeBytes = params.sizeBytes ?? params.size_bytes ?? null;
  const sourceIp = params.sourceIp ?? params.source_ip ?? null;
  const detail = params.detail ?? null;

  const result = db
    .prepare(
      `INSERT INTO audit_log (event_type, account_id, item_id, filename, sha256, size_bytes, source_ip, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(eventType, accountId, itemId, filename, sha256, sizeBytes, sourceIp, detail, now());
  return result.lastInsertRowid;
}

module.exports = {
  db,
  DB_PATH,
  createInvite,
  redeemInvite,
  findAccountByPatternHash,
  recordLoginAttempt,
  createSession,
  isSessionRevoked,
  revokeSession,
  reserveItem,
  markItemPendingScan,
  activateItem,
  rejectItem,
  recordPinAttempt,
  getItemsByOwner,
  getItemById,
  deleteItem,
  sweepExpiredItems,
  sweepStuckPendingScans,
  rejectAllStuckUploads,
  getTotalActiveBytes,
  countActiveItemsForIp,
  computeRetryAt,
  writeAudit,
};
