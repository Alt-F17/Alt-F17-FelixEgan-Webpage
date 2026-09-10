// Filesystem plumbing for paste-relay's multi-item content pipeline. Pure
// storage/path concerns only — item lifecycle, quota, and TTL bookkeeping
// live in db.js (Workstream A); this module just knows about directories,
// path derivation, and scheduling calls into db.js's sweep functions.
//
// Generalizes the original single-slot design (one global current.bin +
// meta.json) to N concurrent items, one per row in db.js's `items` table.
// See ../.claude/plans/change-the-google-oauth-tidy-lovelace.md, "Shared
// data model" and "Workstream C — Content pipeline" for the full contract.

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const db = require("./db");

const STORAGE_DIR = process.env.STORAGE_DIR || "/var/lib/paste-relay";
// Final, encrypted ciphertext blobs — named via
// item-crypto.deriveBlobFilename(pin, pinSalt), never the item's UUID or
// original filename. Survive restarts; their expiry is DB-tracked and
// enforced by the sweep below.
const itemsDir = path.join(STORAGE_DIR, "items");
// In-progress PLAINTEXT `.part` files, keyed by item id. Wiped wholesale on
// every restart (see init()) — matches the original single-slot behavior
// of not surviving abandoned uploads across a restart.
const tmpDir = path.join(STORAGE_DIR, "tmp");

const SWEEP_MS = 30_000;
const PENDING_SCAN_DEADLOCK_MS = Number(process.env.PENDING_SCAN_DEADLOCK_MS || 30 * 60 * 1000);

const ensureDirs = () => {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  fs.mkdirSync(itemsDir, { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });
};

// Path to the in-progress plaintext part file for an upload, keyed by the
// item's id (== the id db.reserveItem() hands back at file/init time) —
// NOT by pin/blob-filename, since that mapping only exists once the item's
// PIN has been generated and the item is far enough along to be encrypted.
// Only the FINAL blob is named via deriveBlobFilename; see item-crypto.js.
const partPath = (id) => path.join(tmpDir, `${id}.part`);

// Path to an item's final encrypted blob, given its already-derived
// blob_filename (item-crypto.deriveBlobFilename(pin, pinSalt)).
const blobPath = (blobFilename) => path.join(itemsDir, blobFilename);

// One-off, unref'd timer that proactively re-runs the expiry sweep at the
// exact moment a specific item's TTL elapses, rather than waiting for the
// next periodic tick. This is the "in-memory timer" layer of the original
// single-slot design's four-layer TTL pattern, generalized from one global
// slot to N items: instead of one timer owning slot-clearing directly (as
// the old scheduleExpiry()/clearSlot() pair did), each item gets its own
// fire-once timer that just triggers the same shared, idempotent
// db.sweepExpiredItems() call db.js already needs for the background sweep
// and for lazy-expire-on-read. Safe to call redundantly; cheap no-op if
// nothing is actually expired yet when it fires.
//
// Callers: content-safety.js's processUploadAsync calls this right after
// db.activateItem() for file items; Workstream D's synchronous text-paste
// handler should call this right after its own activation step too, so
// text pastes (which skip the async pipeline entirely) get the same
// precise expiry behavior instead of relying solely on the 30s sweep.
const scheduleItemExpiry = (expiresAt) => {
  const delay = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  // setTimeout's delay is a 32-bit signed int; TTLs here are always short
  // (minutes), so this is just a defensive clamp, not a real limit.
  const timer = setTimeout(() => {
    try {
      db.sweepExpiredItems();
    } catch (err) {
      console.error("scheduled item-expiry sweep failed", err);
    }
  }, Math.min(delay, 2 ** 31 - 1));
  timer.unref();
  return timer;
};

let sweepTimer = null;

/**
 * One-time startup: ensure directories exist, wipe tmpDir entirely
 * (abandoned in-progress uploads don't survive a restart — matches the
 * original single-slot behavior), mark any DB rows left `uploading`/
 * `pending_scan` from before the restart as `rejected` (`server_restarted`)
 * so they stop counting against quota, then start the 30s background
 * sweep covering both item expiry and deadlocked scans.
 *
 * Together with scheduleItemExpiry() above, this rebuilds the original
 * single-slot four-layer TTL pattern for the N-item model:
 *   1. in-memory timer      — scheduleItemExpiry(), one per activated item
 *   2. persisted expiry     — items.expires_at (db.js, source of truth)
 *   3. lazy-expire-on-read  — db.js's read paths are expected to check
 *                             expires_at themselves before returning a row
 *   4. background sweep     — the 30s setInterval below
 */
const init = async () => {
  ensureDirs();
  await fsp.rm(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  db.rejectAllStuckUploads();

  sweepTimer = setInterval(() => {
    try {
      db.sweepExpiredItems();
    } catch (err) {
      console.error("background sweepExpiredItems failed", err);
    }
    try {
      db.sweepStuckPendingScans(PENDING_SCAN_DEADLOCK_MS);
    } catch (err) {
      console.error("background sweepStuckPendingScans failed", err);
    }
  }, SWEEP_MS);
  sweepTimer.unref();
};

// Real-disk-space guard, kept exactly as the original single-slot
// implementation. Used ALONGSIDE (not instead of) the DB-tracked logical
// 20GB quota (db.getTotalActiveBytes() vs TOTAL_QUOTA_BYTES) — these check
// different things: this is "does Theta's disk actually have room," the DB
// quota is "are we over our own logical budget regardless of real disk
// space." Both matter; neither substitutes for the other.
const freeBytes = () => {
  const stats = fs.statfsSync(STORAGE_DIR);
  return stats.bavail * stats.bsize;
};

module.exports = {
  STORAGE_DIR,
  itemsDir,
  tmpDir,
  init,
  partPath,
  blobPath,
  scheduleItemExpiry,
  freeBytes,
};
