'use strict';

// Workstream E (admin dashboard). Opens the SAME paste-relay.db file
// Workstream A's paste-relay/db.js manages, but as an entirely separate
// process/container — we never require() or call into paste-relay's
// db.js, we just open the SQLite file directly via node:sqlite and read
// (mostly) the same tables. Column names below are copied verbatim from
// the plan's "Shared data model" section (the frozen contract both
// Workstream A and this workstream build against independently).
//
// This connection is read-write ONLY because createInvite() below needs
// to INSERT into pending_invites — that is the single write this whole
// admin container ever performs. Every other export here is read-only,
// and this module must NEVER write to accounts/items/sessions — those
// stay paste-relay's exclusive responsibility.

const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(
  process.env.PASTE_RELAY_DB_PATH || '/var/lib/paste-relay/paste-relay.db'
);

const db = new DatabaseSync(DB_PATH);
// Matches Workstream A's db.js (WAL mode) so both processes can safely
// read/write the same file concurrently.
db.exec('PRAGMA journal_mode = WAL;');

const INVITE_TTL_MS = 24 * 60 * 60 * 1000; // 24h, per the plan

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;

function clampLimit(limit) {
  const n = Number(limit);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

// Every "*_at" column in the shared schema is stored as an epoch-millisecond
// INTEGER (see paste-relay/db.js's own now()/toIso() helpers) — matching
// that storage convention is what the createInvite() fix above is about.
// These read paths convert back to ISO strings at the boundary, the same
// place paste-relay's own db.js does it, so both the JSON API and the raw
// HTML table renderer in server.js (which just does `escapeHtml(r.created_at)`
// with no date formatting of its own) display real dates instead of raw
// millisecond integers.
function toIso(ms) {
  return ms === null || ms === undefined ? null : new Date(ms).toISOString();
}

/**
 * The ONLY write this admin container performs. Generates a fresh invite
 * token (this IS pending_invites.id, per the plan — a
 * crypto.randomBytes(24) base64url string, not a separate token column),
 * inserts a pending_invites row with a 24h expiry, and returns enough
 * for admin/server.js to build the invite URL it hands back to Felix.
 *
 * Signature matches Workstream A's frozen `createInvite(label)` export —
 * both workstreams implement this independently against the same schema.
 *
 * IMPORTANT: created_at/expires_at are stored as epoch-millisecond
 * INTEGERS, not ISO strings — matching exactly how paste-relay's own
 * db.js stores and compares every "*_at" column (see its `now()`/`toIso()`
 * helpers). This was originally written storing ISO strings here; that's a
 * real cross-container bug, not just a style mismatch: paste-relay's
 * redeemInvite() checks `invite.expires_at <= now()` where `now()` is a
 * plain `Date.now()` number, and SQLite's cross-type comparison rules rank
 * ANY text value above ANY numeric value — so a TEXT expires_at would
 * NEVER compare `<=` a numeric now(), meaning admin-issued invites would
 * silently never expire. Fixed to store the same epoch-ms integers, and
 * convert to ISO only in this function's return value (for the JSON API
 * response), mirroring paste-relay/db.js's own toIso()-at-the-boundary
 * pattern.
 */
function createInvite(label) {
  const id = crypto.randomBytes(24).toString('base64url');
  const createdAtMs = Date.now();
  const expiresAtMs = createdAtMs + INVITE_TTL_MS;
  const normalizedLabel = label == null || label === '' ? null : String(label);

  db.prepare(
    `INSERT INTO pending_invites
       (id, label, created_at, expires_at, redeemed_at, redeemed_account_id)
     VALUES (?, ?, ?, ?, NULL, NULL)`
  ).run(id, normalizedLabel, createdAtMs, expiresAtMs);

  return {
    id,
    label: normalizedLabel,
    createdAt: new Date(createdAtMs).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

/**
 * Recent audit_log rows — this is what backs the dashboard's item/file
 * history, since it's append-only and survives the live `items` row
 * (and its on-disk blob) being purged at TTL expiry.
 */
function getRecentAuditLog(limit) {
  return db
    .prepare(
      `SELECT id, event_type, account_id, item_id, filename, sha256,
              size_bytes, source_ip, detail, created_at
         FROM audit_log
        ORDER BY created_at DESC, id DESC
        LIMIT ?`
    )
    .all(clampLimit(limit))
    .map((row) => ({ ...row, created_at: toIso(row.created_at) }));
}

/** Recent login_attempts rows (per-IP throttle log, admin visibility). */
function getRecentLoginAttempts(limit) {
  return db
    .prepare(
      `SELECT id, source_ip, attempted_at, success
         FROM login_attempts
        ORDER BY attempted_at DESC, id DESC
        LIMIT ?`
    )
    .all(clampLimit(limit))
    .map((row) => ({ ...row, attempted_at: toIso(row.attempted_at) }));
}

/**
 * Account list for the dashboard. Deliberately never selects
 * salt/pattern_hash — those must never leave paste-relay's own process,
 * not even to the admin dashboard.
 */
function getAccountSummaries() {
  return db
    .prepare(
      `SELECT id, label, created_at, last_login_at
         FROM accounts
        ORDER BY created_at DESC`
    )
    .all()
    .map((row) => ({ ...row, created_at: toIso(row.created_at), last_login_at: toIso(row.last_login_at) }));
}

module.exports = {
  createInvite,
  getRecentAuditLog,
  getRecentLoginAttempts,
  getAccountSummaries,
};
