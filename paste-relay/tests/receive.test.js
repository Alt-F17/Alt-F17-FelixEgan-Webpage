// Receive-side behaviour. The 4-digit PIN is both the item identifier and the
// decryption key: POST /api/paste/open and GET /api/paste/download take only
// the PIN, while GET /api/paste/items/:id is the owner-visible metadata route.

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  startRelay,
  uploadFile,
  waitForStatus,
  openByPin,
  downloadByPin,
} = require("./helpers/harness");

test("receive", async (t) => {
  const relay = await startRelay({ ttlSeconds: 120 });
  t.after(() => relay.stop());

  await t.test("a live item is retrievable by its id", async () => {
    const up = await uploadFile(relay, { filename: "doc.pdf", bytes: "pdf-bytes" });
    const got = await waitForStatus(relay, up.id, "active");
    assert.equal(got.status, 200);
    assert.equal(got.body.id, up.id);
    assert.equal(got.body.filename, "doc.pdf");
  });

  await t.test("an item is visible while still pending_scan", async () => {
    relay.clamd.setDelay(1500);
    try {
      const up = await uploadFile(relay, { filename: "slow.bin", bytes: "x".repeat(64) });
      const during = await relay.api(`/api/paste/items/${up.id}`);
      assert.equal(during.status, 200, "item must be visible during scan");
      assert.equal(during.body.status, "pending_scan");
      await waitForStatus(relay, up.id, "active", 10000);
    } finally {
      relay.clamd.setDelay(0);
    }
  });

  await t.test("a well-formed but unknown id is a genuine 404", async () => {
    const res = await relay.api("/api/paste/items/11111111-2222-4333-8444-555555555555");
    assert.equal(res.status, 404);
    assert.equal(res.body.error, "not_found");
  });

  await t.test("the item list reflects a newly uploaded item", async () => {
    const before = await relay.api("/api/paste/items");
    const beforeIds = before.body.items.map((i) => i.id);
    const up = await uploadFile(relay, { filename: "fresh.txt", bytes: "fresh" });
    await waitForStatus(relay, up.id, "active");
    const after = await relay.api("/api/paste/items");
    const afterIds = after.body.items.map((i) => i.id);
    assert.ok(!beforeIds.includes(up.id));
    assert.ok(afterIds.includes(up.id), "new item must appear in the owner's list");
  });

  await t.test("text content round-trips through open with the right PIN", async () => {
    const created = await relay.api("/api/paste/text", {
      method: "POST",
      body: JSON.stringify({ content: "the quick brown fox" }),
    });
    assert.equal(created.status, 201);
    const opened = await openByPin(relay, created.body.pin);
    assert.equal(opened.status, 200);
    assert.equal(opened.body.kind, "text");
    assert.equal(opened.body.content, "the quick brown fox");
  });

  await t.test("opening a file PIN returns its metadata, not the bytes", async () => {
    const up = await uploadFile(relay, { filename: "meta.bin", bytes: "twelve bytes", mime: "text/plain" });
    await waitForStatus(relay, up.id, "active");
    const opened = await openByPin(relay, up.pin);
    assert.equal(opened.status, 200);
    assert.equal(opened.body.kind, "file");
    assert.equal(opened.body.filename, "meta.bin");
    assert.equal(opened.body.size, 12);
    assert.equal(opened.body.content, undefined, "open must not inline file bytes");
  });

  await t.test("file content round-trips through download with the right PIN", async () => {
    const payload = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
    const up = await uploadFile(relay, { filename: "blob.bin", bytes: payload });
    await waitForStatus(relay, up.id, "active");
    const res = await downloadByPin(relay, up.pin);
    assert.equal(res.status, 200);
    const got = Buffer.from(await res.arrayBuffer());
    assert.deepEqual(got, payload, "downloaded bytes must match what was uploaded");
  });

  await t.test("download refuses a text item", async () => {
    const created = await relay.api("/api/paste/text", {
      method: "POST",
      body: JSON.stringify({ content: "not a file" }),
    });
    const res = await downloadByPin(relay, created.body.pin);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, "invalid_request");
  });

  await t.test("authenticated item responses are not shared-cacheable", async () => {
    // The relay sits behind a Cloudflare Tunnel that keys cache entries on
    // URL + Origin and cannot see the Bearer token, so every per-account
    // response must opt out of shared caching and Vary on Authorization
    // without dropping the CORS middleware's Vary: Origin.
    const up = await uploadFile(relay, { filename: "cache.txt", bytes: "cache" });
    await waitForStatus(relay, up.id, "active");
    const text = await relay.api("/api/paste/text", {
      method: "POST",
      body: JSON.stringify({ content: "cache me not" }),
    });

    const responses = {
      "GET /api/paste/items": await relay.api("/api/paste/items"),
      "GET /api/paste/items/:id": await relay.api(`/api/paste/items/${up.id}`),
      "GET /api/paste/items/:id (404)": await relay.api(
        "/api/paste/items/11111111-2222-4333-8444-555555555555",
      ),
      "POST /api/paste/open": await openByPin(relay, text.body.pin),
    };
    const download = await downloadByPin(relay, up.pin);
    await download.arrayBuffer();

    const headerSets = Object.entries(responses).map(([name, res]) => [name, res.headers]);
    headerSets.push(["GET /api/paste/download", download.headers]);

    for (const [name, headers] of headerSets) {
      const cc = String(headers.get("cache-control") || "");
      assert.match(cc, /no-store/, `${name} must be no-store (Cache-Control was ${cc || "absent"})`);

      const vary = String(headers.get("vary") || "").toLowerCase();
      assert.match(vary, /authorization/, `${name} must Vary on Authorization (Vary was ${vary || "absent"})`);
      assert.match(vary, /origin/, `${name} must keep Vary: Origin from CORS (Vary was ${vary || "absent"})`);
    }
  });
});
