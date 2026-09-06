// Backend for felixegan.me/paste. Implements the contract in
// ../docs/theta-paste-relay-plan.md against src/lib/pasteApi.ts.

const crypto = require("crypto");
const fs = require("fs");
const fsp = fs.promises;
const express = require("express");
const rateLimit = require("express-rate-limit");

const storage = require("./storage");
const { requireAuth } = require("./auth");

const PORT = Number(process.env.PORT || 8787);
const TTL_SECONDS = Number(process.env.TTL_SECONDS || 300);
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES || 5 * 1024 * 1024 * 1024);
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || "https://felixegan.me,https://www.felixegan.me")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const app = express();
// Only the Cloudflare Tunnel sits in front of this service (no other public
// ingress — see security checklist in the plan doc), so its X-Forwarded-For
// is trustworthy for rate-limit keying.
app.set("trust proxy", true);

// Minimal request logging: never the pasted content, per the plan's "never
// log content" rule.
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(`${req.method} ${req.path} -> ${res.statusCode} (${req.userEmail || "-"})`);
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
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.status(204).end();
    return;
  }
  next();
});

app.get("/healthz", (req, res) => res.status(200).send("ok"));

const writeLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/paste", requireAuth, async (req, res) => {
  const meta = await storage.expireIfDue();
  if (!meta) {
    res.json({ empty: true });
    return;
  }
  if (meta.type === "text") {
    res.json({ type: "text", content: meta.content, expiresAt: meta.expiresAt });
    return;
  }
  res.json({ type: "file", filename: meta.filename, size: meta.size, mime: meta.mime, expiresAt: meta.expiresAt });
});

app.post("/api/paste/text", writeLimiter, requireAuth, express.json({ limit: "15mb" }), async (req, res) => {
  const { content } = req.body || {};
  if (typeof content !== "string") {
    res.status(400).send("content must be a string");
    return;
  }
  await storage.clearSlot();
  const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString();
  await storage.writeMeta({ type: "text", content, expiresAt });
  res.json({ expiresAt });
});

app.delete("/api/paste", requireAuth, async (req, res) => {
  await storage.clearSlot();
  res.status(204).end();
});

app.post("/api/paste/file/init", writeLimiter, requireAuth, express.json({ limit: "10kb" }), async (req, res) => {
  const { filename, size, mime } = req.body || {};
  if (
    typeof filename !== "string" ||
    !filename ||
    typeof size !== "number" ||
    !Number.isFinite(size) ||
    size <= 0 ||
    typeof mime !== "string"
  ) {
    res.status(400).send("Invalid init payload");
    return;
  }
  if (size > MAX_FILE_BYTES) {
    res.status(413).send("File exceeds MAX_FILE_BYTES");
    return;
  }
  if (storage.freeBytes() < size * 1.05) {
    res.status(507).send("Insufficient storage on Theta for this upload");
    return;
  }

  const uploadId = crypto.randomUUID();
  await storage.writeUploadInit(uploadId, { filename, size, mime });
  await fsp.writeFile(storage.tmpPartPath(uploadId), Buffer.alloc(0));
  res.json({ uploadId });
});

app.put("/api/paste/file/:uploadId/chunk", requireAuth, async (req, res) => {
  const { uploadId } = req.params;
  const offset = Number(req.query.offset);
  if (!Number.isInteger(offset) || offset < 0) {
    res.status(400).send("Invalid offset");
    return;
  }

  const uploadMeta = await storage.readUploadInit(uploadId);
  if (!uploadMeta) {
    res.status(404).send("Unknown upload");
    return;
  }

  const partPath = storage.tmpPartPath(uploadId);
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
  if (currentSize + contentLength > uploadMeta.size || currentSize + contentLength > MAX_FILE_BYTES) {
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

app.get("/api/paste/file/:uploadId/status", requireAuth, async (req, res) => {
  const { uploadId } = req.params;
  const uploadMeta = await storage.readUploadInit(uploadId);
  if (!uploadMeta) {
    res.status(404).send("Unknown upload");
    return;
  }
  let receivedBytes = 0;
  try {
    receivedBytes = (await fsp.stat(storage.tmpPartPath(uploadId))).size;
  } catch {
    // Init happened but no chunk has landed yet — 0 is correct.
  }
  res.json({ receivedBytes });
});

app.post("/api/paste/file/:uploadId/complete", requireAuth, async (req, res) => {
  const { uploadId } = req.params;
  const uploadMeta = await storage.readUploadInit(uploadId);
  if (!uploadMeta) {
    res.status(404).send("Unknown upload");
    return;
  }

  const partPath = storage.tmpPartPath(uploadId);
  let stat;
  try {
    stat = await fsp.stat(partPath);
  } catch {
    res.status(404).send("Unknown upload");
    return;
  }
  if (stat.size !== uploadMeta.size) {
    res.status(409).send(`Received ${stat.size} bytes, expected ${uploadMeta.size}`);
    return;
  }

  await storage.clearSlot();
  await fsp.rename(partPath, storage.CURRENT_PATH);
  const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString();
  await storage.writeMeta({
    type: "file",
    filename: uploadMeta.filename,
    mime: uploadMeta.mime,
    size: uploadMeta.size,
    expiresAt,
  });
  await storage.removeUploadInit(uploadId);

  res.json({ expiresAt });
});

app.get("/api/paste/file/download", requireAuth, async (req, res) => {
  const meta = await storage.expireIfDue();
  if (!meta || meta.type !== "file") {
    res.status(404).send("Not found");
    return;
  }

  const safeFilename = meta.filename.replace(/[\r\n"]/g, "");
  res.sendFile(
    storage.CURRENT_PATH,
    {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    },
    (err) => {
      if (err && !res.headersSent) res.status(500).end();
    },
  );
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
