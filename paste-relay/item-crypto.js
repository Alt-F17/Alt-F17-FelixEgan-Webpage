// PIN-derived encryption core for paste-relay items. See
// ../.claude/plans/change-the-google-oauth-tidy-lovelace.md, "Content
// encryption, keyed by the PIN" for the full contract this implements.
//
// Every item's plaintext is encrypted at rest with a key derived from its
// own 4-digit PIN + a random per-item salt, via AES-256-GCM. The raw PIN
// itself is NEVER persisted anywhere by this module or its callers — it
// exists only transiently in request bodies/headers (and, for the
// file-upload async pipeline, in content-safety.js's in-memory-only
// pending-pin map). A database dump alone, without a live attacker-supplied
// PIN guess, must reveal no content.
//
// PIN verification and decryption are the same operation: derive a
// candidate key from the submitted PIN + the stored pin_salt, then attempt
// AES-GCM decryption using the stored content_iv/content_auth_tag. GCM's
// built-in tag check fails closed if the candidate key is wrong.

const crypto = require("crypto");
const fs = require("fs");
const { PassThrough } = require("stream");

const KEY_LENGTH = 32; // AES-256
const IV_LENGTH = 12; // 96-bit GCM nonce, the recommended size
const ALGO = "aes-256-gcm";

function getPepper() {
  const pepper = process.env.ENCRYPTION_PEPPER;
  if (!pepper) {
    // Fail loud, not closed-but-silent: scrypt/HMAC against an
    // empty/undefined pepper would still "work" and produce a key, which
    // is exactly the dangerous failure mode (silently weaker crypto). Refuse
    // instead.
    throw new Error("ENCRYPTION_PEPPER is not set — refusing to derive PIN-based keys/filenames");
  }
  return pepper;
}

// A decrypt failure caused by an AES-GCM auth-tag mismatch — i.e. "wrong
// PIN" — distinguishable from a generic I/O or data error (corrupted file,
// truncated stream, bad hex). Callers (Workstream D's pinAttemptMiddleware)
// should treat only this error type as "wrong PIN" for lockout-counting
// purposes; anything else is an operational failure, not a guess.
class AuthTagMismatchError extends Error {
  constructor(cause) {
    super("AES-GCM auth tag verification failed (wrong key/PIN or corrupted ciphertext)");
    this.name = "AuthTagMismatchError";
    this.code = "EAUTHTAGMISMATCH";
    if (cause) this.cause = cause;
  }
}

// Node's OpenSSL binding throws a generic Error (no stable `code`) with this
// message when GCM's tag check fails inside cipher.final(). Detected by
// message text because that's the only stable signal across Node versions;
// verified empirically against the running Node version (see the
// round-trip self-test used to build this file).
function isAuthTagFailure(err) {
  return !!err && typeof err.message === "string" && /unable to authenticate data/i.test(err.message);
}

function wrapDecryptError(err) {
  return isAuthTagFailure(err) ? new AuthTagMismatchError(err) : err;
}

/** Generates a fresh 4-digit PIN as a zero-padded string, e.g. "0042". */
function generatePin() {
  return crypto.randomInt(0, 10000).toString().padStart(4, "0");
}

/** Generates a fresh per-item pin_salt (16 random bytes, hex-encoded). */
function generatePinSalt() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Derives the 32-byte AES-256 key for an item from its PIN + pin_salt,
 * mixed with the server-wide ENCRYPTION_PEPPER via scrypt (a proper KDF —
 * not the raw 4 digits used directly as key material).
 */
function derivePinKey(pin, pinSalt) {
  return crypto.scryptSync(pin + pinSalt, getPepper(), KEY_LENGTH);
}

/**
 * Derives the on-disk blob filename for an item from the same (pin,
 * pinSalt) pair, but via HMAC-SHA256 with a domain-separation prefix
 * ("blob:") so this value can never collide with / be confused for the
 * encryption key above, even though both consume identical inputs. This is
 * a naming/obfuscation convention at the storage layer, NOT itself a
 * security boundary — see the plan doc.
 */
function deriveBlobFilename(pin, pinSalt) {
  return crypto
    .createHmac("sha256", getPepper())
    .update("blob:" + pin + pinSalt)
    .digest("base64url");
}

/**
 * Streams `plaintextReadStream` through AES-256-GCM into a new file at
 * `destPath`, generating a random 12-byte IV. Resolves with `{iv,
 * authTag}` (hex strings) once the ciphertext has been fully flushed to
 * disk. Rejects on any read/write/cipher error.
 */
function encryptToFile(plaintextReadStream, key, destPath) {
  return new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const dest = fs.createWriteStream(destPath);

    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    plaintextReadStream.on("error", fail);
    cipher.on("error", fail);
    dest.on("error", fail);

    dest.on("finish", () => {
      if (settled) return;
      settled = true;
      resolve({ iv: iv.toString("hex"), authTag: cipher.getAuthTag().toString("hex") });
    });

    plaintextReadStream.pipe(cipher).pipe(dest);
  });
}

/**
 * Returns a readable stream of plaintext, decrypting `blobPath` with
 * AES-256-GCM as bytes are read.
 *
 * IMPORTANT caveat, by design: Node's streaming GCM decipher only verifies
 * the auth tag inside `.final()`, which fires after ALL ciphertext bytes
 * have been fed through — i.e. it emits decrypted chunks optimistically,
 * before authenticity is confirmed. For a wrong key/PIN, that means the
 * consumer may already have received some (garbage — a wrong key does not
 * reproduce the original plaintext, it produces noise) bytes before the
 * returned stream emits an `AuthTagMismatchError` and aborts. That is the
 * accepted failure mode for the file-download streaming case: a truncated/
 * errored download, not a silently-wrong file. Callers that need a
 * reliable go/no-go BEFORE any bytes are released (e.g. text unlock,
 * where content is small) should use `decryptBuffer` instead, which
 * decrypts fully in memory and only returns once the tag check has
 * already passed.
 */
function decryptFromFile(blobPath, key, ivHex, authTagHex) {
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);

  const source = fs.createReadStream(blobPath);
  const output = new PassThrough();

  let settled = false;
  const forwardError = (err) => {
    if (settled) return;
    settled = true;
    output.emit("error", wrapDecryptError(err));
  };

  source.on("error", forwardError);
  decipher.on("error", forwardError);

  source.pipe(decipher).pipe(output);

  return output;
}

/**
 * Encrypts a small in-memory buffer (used for text pastes, which are
 * stored as a ciphertext DB column rather than a file blob). Returns
 * `{ciphertext: Buffer, iv, authTag}` (iv/authTag as hex strings).
 */
function encryptBuffer(plaintextBuffer, key) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
  return { ciphertext, iv: iv.toString("hex"), authTag: cipher.getAuthTag().toString("hex") };
}

/**
 * Decrypts a small in-memory buffer (the text-paste counterpart to
 * `decryptFromFile`). Unlike the streaming version, `.final()` runs
 * synchronously right here, so a wrong key/PIN reliably throws
 * `AuthTagMismatchError` before this function returns anything — no
 * partial-plaintext exposure is possible. This is the function
 * `pinAttemptMiddleware` should call for `kind === 'text'` items;
 * `decryptFromFile` is for `kind === 'file'` items only (there is no file
 * on disk for a text item to decrypt "from").
 */
function decryptBuffer(ciphertextBuffer, key, ivHex, authTagHex) {
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  try {
    return Buffer.concat([decipher.update(ciphertextBuffer), decipher.final()]);
  } catch (err) {
    throw wrapDecryptError(err);
  }
}

module.exports = {
  AuthTagMismatchError,
  generatePin,
  generatePinSalt,
  derivePinKey,
  deriveBlobFilename,
  encryptToFile,
  decryptFromFile,
  encryptBuffer,
  decryptBuffer,
};
