// Spawns a real paste-relay server against a throwaway STORAGE_DIR and a
// fake clamd, and mints a real session token for it.
//
// Black-box on purpose: every bug this suite chases (404s, 304s, status
// transitions, expiry) is observable only at the HTTP layer, which is also
// where the frontend sees them.

const { spawn } = require("child_process");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const { startFakeClamd } = require("./fake-clamd");

const REPO_ROOT = path.resolve(__dirname, "..", "..");

/**
 * @param {object} [opts]
 * @param {number} [opts.ttlSeconds]        item TTL (default 120)
 * @param {number} [opts.createRatePerMin]  create rate limit (default 10000)
 * @param {string} [opts.clamdVerdict]      clean | infected | garbage | drop | hang
 * @param {number} [opts.clamdDelayMs]
 * @param {object} [opts.env]               extra env overrides
 */
async function startRelay(opts = {}) {
  const storageDir = await fsp.mkdtemp(path.join(os.tmpdir(), "paste-relay-test-"));
  const clamd = await startFakeClamd({
    verdict: opts.clamdVerdict || "clean",
    delayMs: opts.clamdDelayMs || 0,
  });

  const env = {
    ...process.env,
    PORT: "0", // replaced below; server.js reads PORT, so pick a free one first
    STORAGE_DIR: storageDir,
    CLAMD_HOST: clamd.host,
    CLAMD_PORT: String(clamd.port),
    ENCRYPTION_PEPPER: crypto.randomBytes(32).toString("hex"),
    SESSION_SECRET: crypto.randomBytes(32).toString("hex"),
    TTL_SECONDS: String(opts.ttlSeconds ?? 120),
    CREATE_RATE_LIMIT_PER_MIN: String(opts.createRatePerMin ?? 10000),
    ALLOWED_ORIGINS: "http://localhost:5173",
    MAX_FILE_BYTES: String(opts.maxFileBytes ?? 10 * 1024 * 1024),
    TOTAL_QUOTA_BYTES: String(opts.totalQuotaBytes ?? 100 * 1024 * 1024),
    MAX_ITEMS_PER_IP: String(opts.maxItemsPerIp ?? 1000),
    ...(opts.env || {}),
  };

  const port = await freePort();
  env.PORT = String(port);

  const child = spawn(process.execPath, [path.join(REPO_ROOT, "server.js")], {
    cwd: REPO_ROOT,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const logs = [];
  child.stdout.on("data", (b) => logs.push(b.toString()));
  child.stderr.on("data", (b) => logs.push(b.toString()));

  await waitFor(() => logs.join("").includes("listening on"), 15000, () =>
    new Error("server did not start:\n" + logs.join("")),
  );

  const baseUrl = `http://127.0.0.1:${port}`;

  // Mint a real account + session by driving db.js/auth.js directly against
  // the same STORAGE_DIR. Login itself is captcha-gated (Turnstile fails
  // closed with no secret configured), and that gate is covered by its own
  // test rather than worked around here.
  const account = await mintAccount(storageDir, env);

  return {
    baseUrl,
    storageDir,
    clamd,
    token: account.token,
    accountId: account.accountId,
    logs,
    logText: () => logs.join(""),
    async stop() {
      child.kill("SIGKILL");
      await clamd.close();
      await fsp.rm(storageDir, { recursive: true, force: true }).catch(() => {});
    },
    // Convenience fetch that attaches auth + origin.
    async api(pathname, init = {}) {
      const headers = {
        Origin: "http://localhost:5173",
        ...(init.headers || {}),
      };
      // Only supply the harness token when the caller neither opted out
      // (auth:false) nor supplied its own Authorization — otherwise a test
      // that deliberately sends a bad token would silently be handed a good
      // one and could never fail for the reason it was written for.
      const callerSuppliedAuth = Object.keys(init.headers || {}).some(
        (h) => h.toLowerCase() === "authorization",
      );
      if (init.auth !== false && !callerSuppliedAuth) {
        headers.Authorization = `Bearer ${account.token}`;
      }
      if (init.body && typeof init.body === "string" && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      const res = await fetch(baseUrl + pathname, { ...init, headers });
      let body = null;
      const text = await res.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }
      return { status: res.status, body, headers: res.headers, raw: text };
    },
  };
}

// Runs db.js + auth.js in a child process so their module-level
// STORAGE_DIR/SESSION_SECRET capture matches the server's env exactly.
function mintAccount(storageDir, env) {
  return new Promise((resolve, reject) => {
    const script = `
      const db = require(${JSON.stringify(path.join(REPO_ROOT, "db.js"))});
      const auth = require(${JSON.stringify(path.join(REPO_ROOT, "auth.js"))});
      const invite = db.createInvite("test-harness");
      const patternHash = require("crypto").randomBytes(32).toString("hex");
      const account = db.redeemInvite(invite.token, patternHash, "127.0.0.1");
      const sid = db.createSession(account.id, "127.0.0.1");
      const issued = auth.issueSessionToken(account.id, sid);
      process.stdout.write(JSON.stringify({
        accountId: account.id, token: issued.token, patternHash,
      }));
    `;
    const p = spawn(process.execPath, ["-e", script], { cwd: REPO_ROOT, env });
    let out = "";
    let err = "";
    p.stdout.on("data", (b) => (out += b));
    p.stderr.on("data", (b) => (err += b));
    p.on("close", (code) => {
      if (code !== 0) return reject(new Error("mintAccount failed: " + err));
      try {
        resolve(JSON.parse(out));
      } catch (e) {
        reject(new Error("mintAccount bad output: " + out + err));
      }
    });
  });
}

function freePort() {
  const net = require("net");
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const p = s.address().port;
      s.close(() => resolve(p));
    });
  });
}

async function waitFor(pred, timeoutMs, onTimeout) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await pred()) return;
    if (Date.now() > deadline) throw onTimeout ? onTimeout() : new Error("timeout");
    await sleep(25);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Polls an item until it leaves pending_scan (or the deadline passes). */
async function waitForStatus(relay, id, wanted, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  for (;;) {
    const res = await relay.api(`/api/paste/items/${id}`);
    last = res;
    if (res.status === 200 && res.body && res.body.status === wanted) return res;
    if (Date.now() > deadline) {
      throw new Error(
        `item ${id} never reached ${wanted}; last = ${res.status} ${JSON.stringify(res.body)}`,
      );
    }
    await sleep(50);
  }
}

/** Full three-step file upload. Returns {id, pin, status}. */
async function uploadFile(relay, { filename, bytes, mime = "application/octet-stream" }) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const init = await relay.api("/api/paste/file/init", {
    method: "POST",
    body: JSON.stringify({ filename, size: buf.length, mime }),
  });
  if (init.status !== 201) {
    throw new Error(`file/init failed: ${init.status} ${JSON.stringify(init.body)}`);
  }
  const id = init.body.id;
  const chunk = await relay.api(`/api/paste/items/${id}/chunk?offset=0`, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: buf,
  });
  if (chunk.status !== 204) {
    throw new Error(`chunk failed: ${chunk.status} ${JSON.stringify(chunk.body)}`);
  }
  const complete = await relay.api(`/api/paste/items/${id}/complete`, { method: "POST" });
  return { id, pin: init.body.pin, initStatus: init.status, complete };
}

/** POST /api/paste/open — the PIN alone identifies and unlocks the item. */
function openByPin(relay, pin) {
  return relay.api("/api/paste/open", { method: "POST", body: JSON.stringify({ pin }) });
}

/**
 * GET /api/paste/download with the PIN in X-Paste-Pin. Returns the raw fetch
 * Response; callers must consume the body so the server records the outcome.
 */
function downloadByPin(relay, pin) {
  return fetch(`${relay.baseUrl}/api/paste/download`, {
    headers: {
      Origin: "http://localhost:5173",
      Authorization: `Bearer ${relay.token}`,
      "X-Paste-Pin": pin,
    },
  });
}

/** A syntactically valid PIN that is not in `taken`, for guaranteed misses. */
function pinNotIn(taken) {
  for (let n = 0; n < 10000; n += 1) {
    const pin = String(n).padStart(4, "0");
    if (!taken.has(pin)) return pin;
  }
  throw new Error("every 4-digit PIN is taken");
}

module.exports = {
  startRelay,
  sleep,
  waitFor,
  waitForStatus,
  uploadFile,
  openByPin,
  downloadByPin,
  pinNotIn,
};
