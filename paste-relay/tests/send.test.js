// Send-side behaviour: text pastes and the three-step file upload, plus the
// fail-closed guarantees around AV scanning.

const test = require("node:test");
const assert = require("node:assert/strict");

const { startRelay, uploadFile, waitForStatus, sleep, downloadByPin } = require("./helpers/harness");

test("send: text", async (t) => {
  const relay = await startRelay();
  t.after(() => relay.stop());

  await t.test("a text paste is created active with a 4-digit PIN", async () => {
    const res = await relay.api("/api/paste/text", {
      method: "POST",
      body: JSON.stringify({ content: "hello" }),
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.status, "active");
    assert.match(res.body.pin, /^\d{4}$/, "PIN must be exactly 4 digits, zero-padded");
    assert.ok(res.body.expiresAt, "a text paste must return an expiry immediately");
  });

  await t.test("non-string content is rejected", async () => {
    for (const content of [42, null, { a: 1 }, ["x"]]) {
      const res = await relay.api("/api/paste/text", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(content)}`);
    }
  });

  await t.test("suspicious-looking text is still accepted (filter is log-only)", async () => {
    const res = await relay.api("/api/paste/text", {
      method: "POST",
      body: JSON.stringify({ content: "<script>alert(1)</script>" }),
    });
    assert.equal(res.status, 201, "the text filter is explicitly log-only, not a gate");
  });
});

test("send: file upload", async (t) => {
  const relay = await startRelay();
  t.after(() => relay.stop());

  await t.test("the three-step upload reaches active and preserves size", async () => {
    const bytes = Buffer.from("a".repeat(5000));
    const up = await uploadFile(relay, { filename: "big.txt", bytes });
    assert.equal(up.complete.status, 202);
    const active = await waitForStatus(relay, up.id, "active");
    assert.equal(active.body.size, bytes.length);
  });

  await t.test("complete rejects a size mismatch", async () => {
    const init = await relay.api("/api/paste/file/init", {
      method: "POST",
      body: JSON.stringify({ filename: "short.txt", size: 100, mime: "text/plain" }),
    });
    assert.equal(init.status, 201);
    await relay.api(`/api/paste/items/${init.body.id}/chunk?offset=0`, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: Buffer.from("only-ten!!"),
    });
    const done = await relay.api(`/api/paste/items/${init.body.id}/complete`, { method: "POST" });
    assert.equal(done.status, 409);
    assert.equal(done.body.error, "size_mismatch");
  });

  await t.test("out-of-order chunks are assembled by absolute offset", async () => {
    const init = await relay.api("/api/paste/file/init", {
      method: "POST",
      body: JSON.stringify({ filename: "ooo.txt", size: 10, mime: "text/plain" }),
    });
    assert.equal(init.status, 201);
    for (const [offset, body] of [
      [5, "56789"],
      [0, "01234"],
    ]) {
      const res = await relay.api(`/api/paste/items/${init.body.id}/chunk?offset=${offset}`, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: Buffer.from(body),
      });
      assert.equal(res.status, 204, `chunk at offset ${offset}`);
    }
    const done = await relay.api(`/api/paste/items/${init.body.id}/complete`, { method: "POST" });
    assert.equal(done.status, 202);
    await waitForStatus(relay, init.body.id, "active");
    const res = await downloadByPin(relay, init.body.pin);
    assert.equal(res.status, 200);
    assert.equal(Buffer.from(await res.arrayBuffer()).toString(), "0123456789");
  });

  await t.test("complete refuses an upload with a gap between chunks", async () => {
    const init = await relay.api("/api/paste/file/init", {
      method: "POST",
      body: JSON.stringify({ filename: "gap.txt", size: 10, mime: "text/plain" }),
    });
    await relay.api(`/api/paste/items/${init.body.id}/chunk?offset=5`, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: Buffer.from("56789"),
    });
    const done = await relay.api(`/api/paste/items/${init.body.id}/complete`, { method: "POST" });
    assert.equal(done.status, 409, "an unfilled gap must not silently become zero bytes");
    assert.equal(done.body.error, "size_mismatch");
  });

  await t.test("a chunk running past the declared size is rejected with 413", async () => {
    const init = await relay.api("/api/paste/file/init", {
      method: "POST",
      body: JSON.stringify({ filename: "over.txt", size: 10, mime: "text/plain" }),
    });
    const res = await relay.api(`/api/paste/items/${init.body.id}/chunk?offset=5`, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: Buffer.from("123456"),
    });
    assert.equal(res.status, 413);
  });

  await t.test("a missing, negative or non-integer chunk offset is rejected with 400", async () => {
    const init = await relay.api("/api/paste/file/init", {
      method: "POST",
      body: JSON.stringify({ filename: "badoff.txt", size: 10, mime: "text/plain" }),
    });
    for (const query of ["", "?offset=-1", "?offset=1.5", "?offset=abc"]) {
      const res = await relay.api(`/api/paste/items/${init.body.id}/chunk${query}`, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: Buffer.from("xxxxx"),
      });
      assert.equal(res.status, 400, `expected 400 for offset query ${JSON.stringify(query)}`);
    }
  });

  await t.test("init rejects a file larger than MAX_FILE_BYTES", async () => {
    const res = await relay.api("/api/paste/file/init", {
      method: "POST",
      body: JSON.stringify({ filename: "huge.bin", size: 11 * 1024 * 1024, mime: "application/octet-stream" }),
    });
    assert.equal(res.status, 413);
    assert.equal(res.body.error, "file_too_large");
  });

  await t.test("init rejects a malformed payload", async () => {
    const bad = [
      { filename: "", size: 10, mime: "text/plain" },
      { filename: "x", size: 0, mime: "text/plain" },
      { filename: "x", size: -1, mime: "text/plain" },
      { filename: "x", size: "10", mime: "text/plain" },
      { filename: "x", size: 10 },
    ];
    for (const body of bad) {
      const res = await relay.api("/api/paste/file/init", {
        method: "POST",
        body: JSON.stringify(body),
      });
      assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
    }
  });
});

test("send: scanning fails closed", async (t) => {
  await t.test("an infected file is rejected and never becomes retrievable", async () => {
    const relay = await startRelay({ clamdVerdict: "infected" });
    try {
      const up = await uploadFile(relay, { filename: "evil.exe", bytes: "malware" });
      assert.equal(up.complete.status, 202);
      await sleep(1500);
      const res = await relay.api(`/api/paste/items/${up.id}`);
      assert.notEqual(res.status, 200, "an infected item must never be served");
      const list = await relay.api("/api/paste/items");
      assert.ok(
        !list.body.items.some((i) => i.id === up.id),
        "an infected item must not appear in the owner's list",
      );
    } finally {
      await relay.stop();
    }
  });

  await t.test("a garbled scanner reply is treated as infected, never as clean", async () => {
    const relay = await startRelay({ clamdVerdict: "garbage" });
    try {
      const up = await uploadFile(relay, { filename: "odd.bin", bytes: "data" });
      await sleep(1500);
      const res = await relay.api(`/api/paste/items/${up.id}`);
      assert.notEqual(res.status, 200, "an unparseable scan result must fail closed");
    } finally {
      await relay.stop();
    }
  });

  await t.test("a scanner that drops the connection fails closed", async () => {
    const relay = await startRelay({ clamdVerdict: "drop" });
    try {
      const up = await uploadFile(relay, { filename: "drop.bin", bytes: "data" });
      await sleep(1500);
      const res = await relay.api(`/api/paste/items/${up.id}`);
      assert.notEqual(res.status, 200, "a dropped scan connection must fail closed");
    } finally {
      await relay.stop();
    }
  });
});

test("send: auth is required", async (t) => {
  const relay = await startRelay();
  t.after(() => relay.stop());

  await t.test("every item route refuses an unauthenticated caller", async () => {
    const routes = [
      ["GET", "/api/paste/items"],
      ["GET", "/api/paste/items/11111111-2222-4333-8444-555555555555"],
      ["POST", "/api/paste/text"],
      ["POST", "/api/paste/file/init"],
    ];
    for (const [method, pathname] of routes) {
      const res = await relay.api(pathname, {
        method,
        auth: false,
        body: method === "POST" ? JSON.stringify({}) : undefined,
      });
      assert.equal(res.status, 401, `${method} ${pathname} must be 401 without a token`);
    }
  });

  await t.test("a garbage bearer token is refused", async () => {
    const res = await relay.api("/api/paste/items", {
      headers: { Authorization: "Bearer not.a.token" },
    });
    assert.equal(res.status, 401);
  });
});
