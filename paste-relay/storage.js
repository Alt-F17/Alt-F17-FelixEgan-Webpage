// Single-slot paste state: at most one text blob or one file exists at a
// time, and it always has an expiry. See ../docs/theta-paste-relay-plan.md
// for the full contract this implements.

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const STORAGE_DIR = process.env.STORAGE_DIR || "/var/lib/paste-relay";
const TMP_DIR = path.join(STORAGE_DIR, "tmp");
const CURRENT_PATH = path.join(STORAGE_DIR, "current.bin");
const META_PATH = path.join(STORAGE_DIR, "meta.json");
const SWEEP_MS = 30_000;

let expiryTimer = null;

const ensureDirs = () => {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });
};

const readMeta = async () => {
  try {
    return JSON.parse(await fsp.readFile(META_PATH, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
};

const clearSlot = async () => {
  if (expiryTimer) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
  await Promise.all([
    fsp.rm(CURRENT_PATH, { force: true }),
    fsp.rm(META_PATH, { force: true }),
  ]);
};

const scheduleExpiry = (expiresAt) => {
  if (expiryTimer) clearTimeout(expiryTimer);
  const delay = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  // setTimeout's delay is a 32-bit signed int; TTLs here are always short
  // (minutes), so this is just a defensive clamp, not a real limit.
  expiryTimer = setTimeout(() => {
    clearSlot().catch((err) => console.error("expiry sweep failed", err));
  }, Math.min(delay, 2 ** 31 - 1));
};

// Deletes the slot if its recorded expiry has already passed. Called before
// every read and on a background interval, independent of any timer that may
// have been lost to a process restart.
const expireIfDue = async () => {
  const meta = await readMeta();
  if (!meta) return null;
  if (new Date(meta.expiresAt).getTime() <= Date.now()) {
    await clearSlot();
    return null;
  }
  return meta;
};

const writeMeta = async (meta) => {
  await fsp.writeFile(META_PATH, JSON.stringify(meta), "utf8");
  scheduleExpiry(meta.expiresAt);
};

const init = async () => {
  ensureDirs();
  await fsp.rm(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const meta = await expireIfDue();
  if (meta) scheduleExpiry(meta.expiresAt);
  setInterval(() => {
    expireIfDue().catch((err) => console.error("background sweep failed", err));
  }, SWEEP_MS).unref();
};

const freeBytes = () => {
  const stats = fs.statfsSync(STORAGE_DIR);
  return stats.bavail * stats.bsize;
};

const tmpPartPath = (uploadId) => path.join(TMP_DIR, `${uploadId}.part`);
const tmpInitPath = (uploadId) => path.join(TMP_DIR, `${uploadId}.init.json`);

// Upload-in-progress metadata (filename/size/mime declared at `init`) lives
// as a sidecar file next to the `.part` bytes rather than an in-memory map,
// so status/chunk/complete share one source of truth on disk. `init()`
// still wipes `tmp/` on startup (see below) — abandoned in-progress uploads
// don't survive a restart, they just don't accumulate forever either.
const writeUploadInit = (uploadId, meta) => fsp.writeFile(tmpInitPath(uploadId), JSON.stringify(meta), "utf8");

const readUploadInit = async (uploadId) => {
  try {
    return JSON.parse(await fsp.readFile(tmpInitPath(uploadId), "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
};

const removeUploadInit = (uploadId) => fsp.rm(tmpInitPath(uploadId), { force: true });

module.exports = {
  STORAGE_DIR,
  CURRENT_PATH,
  TMP_DIR,
  init,
  readMeta,
  writeMeta,
  clearSlot,
  expireIfDue,
  freeBytes,
  tmpPartPath,
  writeUploadInit,
  readUploadInit,
  removeUploadInit,
};
