// Edge cases around PINs, the open-attempt lockout, filenames, lifecycle and
// expiry. The PIN is the item identifier, so a wrong PIN is indistinguishable
// from "no such item" (404 not_found) and is throttled per account and IP.

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  startRelay,
  uploadFile,
  waitForStatus,
  sleep,
  openByPin,
  downloadByPin,
  pinNotIn,
} = require("./helpers/harness");

const OPEN_MAX_ATTEMPTS = 10;

async function createText(relay, content) {
  const created = await relay.api("/api/paste/text", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  assert.equal(created.status, 201, `text create failed: ${JSON.stringify(created.body)}`);
  return created.body;
}

test("edge: PIN handling", async (t) => {
  const relay = await startRelay();
  t.after(() => relay.stop());
  const taken = new Set();
  const text = async (content) => {
    const item = await createText(relay, content);
    taken.add(item.pin);
    return item;
  };

  await t.test("a wrong PIN is a 404 and does not leak content", async () => {
    await text("secret text");
    const res = await openByPin(relay, pinNotIn(taken));
    assert.equal(res.status, 404);
    assert.equal(res.body.error, "not_found");
    assert.ok(!String(res.raw).includes("secret text"), "a failed open must not echo content");
  });

  await t.test("a non-4-digit PIN is a 400, not a consumed attempt", async () => {
    const item = await text("x");
    const miss = pinNotIn(taken);
    const first = await openByPin(relay, miss);
    assert.equal(first.status, 404);

    const malformed = ["12", "123456", "abcd", "", "12 4", "١٢٣٤", 1234, null];
    for (const pin of malformed) {
      const res = await openByPin(relay, pin);
      assert.equal(res.status, 400, `PIN ${JSON.stringify(pin)} should be a 400`);
      assert.equal(res.body.error, "invalid_request");
    }
    const noBody = await relay.api("/api/paste/open", { method: "POST", body: JSON.stringify({}) });
    assert.equal(noBody.status, 400);
    const badHeader = await downloadByPin(relay, "12a4");
    assert.equal(badHeader.status, 400);
    await badHeader.arrayBuffer();

    const second = await openByPin(relay, miss);
    assert.equal(
      second.body.attemptsRemaining,
      first.body.attemptsRemaining - 1,
      "malformed PINs must not have consumed the open-attempt budget",
    );

    const ok = await openByPin(relay, item.pin);
    assert.equal(ok.status, 200);
  });

  await t.test("a PIN with a leading zero is accepted as a string", async () => {
    // generatePin() zero-pads, so "0042" is a legitimate PIN. Anything that
    // coerces it to a Number would turn it into 42 and miss the item. With
    // 100 draws the chance of never seeing one is about 3 in 100,000.
    let found = null;
    for (let i = 0; i < 100 && !found; i += 1) {
      const content = `leading-zero probe ${i}`;
      const item = await text(content);
      if (item.pin.startsWith("0")) found = { ...item, content };
    }
    assert.ok(found, "no leading-zero PIN drawn in 100 creates");
    const res = await openByPin(relay, found.pin);
    assert.equal(res.status, 200, `leading-zero PIN ${found.pin} must open`);
    assert.equal(res.body.content, found.content);
  });
});

test("edge: open-attempt lockout", async (t) => {
  await t.test("ten wrong PINs lock the requester out, even for the correct PIN", async () => {
    const relay = await startRelay();
    try {
      const item = await createText(relay, "lock me out");
      const miss = pinNotIn(new Set([item.pin]));

      for (let i = 1; i <= OPEN_MAX_ATTEMPTS; i += 1) {
        const res = await openByPin(relay, miss);
        assert.equal(res.status, 404, `wrong PIN #${i}`);
        assert.equal(res.body.attemptsRemaining, OPEN_MAX_ATTEMPTS - i);
      }

      const locked = await openByPin(relay, item.pin);
      assert.equal(locked.status, 429, "the correct PIN must not get through once locked out");
      assert.equal(locked.body.error, "too_many_attempts");
      assert.ok(locked.body.retryAt, "a lockout must say when to retry");
      assert.ok(!String(locked.raw).includes("lock me out"));

      const download = await downloadByPin(relay, item.pin);
      assert.equal(download.status, 429, "the lockout is shared across open and download");
      await download.arrayBuffer();
    } finally {
      await relay.stop();
    }
  });

  await t.test("a successful open resets the failed-attempt budget", async () => {
    const relay = await startRelay();
    try {
      const item = await createText(relay, "reset me");
      const miss = pinNotIn(new Set([item.pin]));

      for (let i = 0; i < 5; i += 1) {
        assert.equal((await openByPin(relay, miss)).status, 404);
      }
      assert.equal((await openByPin(relay, item.pin)).status, 200);

      const after = await openByPin(relay, miss);
      assert.equal(after.status, 404);
      assert.equal(after.body.attemptsRemaining, OPEN_MAX_ATTEMPTS - 1);
    } finally {
      await relay.stop();
    }
  });
});

test("edge: filenames and content", async (t) => {
  const relay = await startRelay();
  t.after(() => relay.stop());

  await t.test("a path-traversal filename cannot escape the storage dir", async () => {
    const up = await uploadFile(relay, { filename: "../../../etc/passwd", bytes: "nope" });
    const active = await waitForStatus(relay, up.id, "active");
    assert.equal(active.status, 200);
    // The blob is named from a hash, never from the client filename, so the
    // only real risk is the Content-Disposition header on download.
    const res = await downloadByPin(relay, up.pin);
    assert.equal(res.status, 200);
    const cd = res.headers.get("content-disposition") || "";
    assert.ok(!/\r|\n/.test(cd), "Content-Disposition must not contain CR/LF");
    await res.arrayBuffer();
  });

  await t.test("a CRLF-injecting filename is neutralised in headers", async () => {
    const up = await uploadFile(relay, {
      filename: 'evil"\r\nX-Injected: yes\r\n',
      bytes: "x",
    });
    await waitForStatus(relay, up.id, "active");
    const res = await downloadByPin(relay, up.pin);
    assert.equal(res.headers.get("x-injected"), null, "header injection must not succeed");
    await res.arrayBuffer();
  });

  await t.test("unicode and emoji text round-trip byte-for-byte", async () => {
    const content = "héllo 世界 \u{1F389} — naïve café\nline two\t tabbed";
    const created = await createText(relay, content);
    const opened = await openByPin(relay, created.pin);
    assert.equal(opened.status, 200);
    assert.equal(opened.body.content, content);
  });

  await t.test("an empty text paste is handled deterministically", async () => {
    const res = await relay.api("/api/paste/text", {
      method: "POST",
      body: JSON.stringify({ content: "" }),
    });
    assert.ok(
      res.status === 201 || res.status === 400,
      `empty content must be either accepted or explicitly rejected, got ${res.status}`,
    );
    if (res.status === 201) {
      const opened = await openByPin(relay, res.body.pin);
      assert.equal(opened.status, 200);
      assert.equal(opened.body.content, "");
    }
  });

  await t.test("a very long filename does not break the pipeline", async () => {
    const up = await uploadFile(relay, { filename: "a".repeat(600) + ".txt", bytes: "x" });
    const active = await waitForStatus(relay, up.id, "active");
    assert.equal(active.status, 200);
  });
});

test("edge: lifecycle and idempotency", async (t) => {
  const relay = await startRelay();
  t.after(() => relay.stop());

  await t.test("completing twice does not corrupt the item", async () => {
    const up = await uploadFile(relay, { filename: "twice.txt", bytes: "hello twice" });
    const second = await relay.api(`/api/paste/items/${up.id}/complete`, { method: "POST" });
    assert.ok(
      second.status === 404 || second.status === 409 || second.status === 202,
      `a duplicate complete must be handled, got ${second.status}`,
    );
    const active = await waitForStatus(relay, up.id, "active");
    assert.equal(active.body.status, "active");
  });

  await t.test("completing an upload with no chunk written is refused", async () => {
    const init = await relay.api("/api/paste/file/init", {
      method: "POST",
      body: JSON.stringify({ filename: "empty.txt", size: 5, mime: "text/plain" }),
    });
    const done = await relay.api(`/api/paste/items/${init.body.id}/complete`, { method: "POST" });
    assert.equal(done.status, 409, "0 bytes written against a declared 5 must be a size mismatch");
  });

  await t.test("a deleted item is gone from lookup, list and PIN open", async () => {
    const up = await uploadFile(relay, { filename: "gone.txt", bytes: "delete me" });
    await waitForStatus(relay, up.id, "active");
    const del = await relay.api(`/api/paste/items/${up.id}`, { method: "DELETE" });
    assert.equal(del.status, 204);
    const after = await relay.api(`/api/paste/items/${up.id}`);
    assert.equal(after.status, 404);
    const list = await relay.api("/api/paste/items");
    assert.ok(!list.body.items.some((i) => i.id === up.id));
    const opened = await openByPin(relay, up.pin);
    assert.equal(opened.status, 404, "a deleted item's PIN must no longer open anything");
  });

  await t.test("a delete with a token signed by another relay is refused", async () => {
    const other = await startRelay();
    try {
      const up = await uploadFile(relay, { filename: "mine.txt", bytes: "mine" });
      await waitForStatus(relay, up.id, "active");
      // A token from a different relay instance is signed with a different
      // SESSION_SECRET, so it must be rejected outright.
      const res = await relay.api(`/api/paste/items/${up.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${other.token}` },
      });
      assert.equal(res.status, 401);
    } finally {
      await other.stop();
    }
  });
});

test("edge: expiry sweeps", async (t) => {
  const relay = await startRelay({ ttlSeconds: 2 });
  t.after(() => relay.stop());

  const listed = await createText(relay, "ephemeral");
  const opened = await createText(relay, "also ephemeral");
  const before = await relay.api("/api/paste/items");
  assert.ok(before.body.items.some((i) => i.id === listed.id), "item must be listed while live");
  assert.equal((await relay.api(`/api/paste/items/${listed.id}`)).status, 200);

  await sleep(5000);

  await t.test("an expired item leaves the owner's list and 404s by id", async () => {
    const after = await relay.api("/api/paste/items");
    assert.ok(
      !after.body.items.some((i) => i.id === listed.id),
      "an expired item must not remain listed",
    );
    const byId = await relay.api(`/api/paste/items/${listed.id}`);
    assert.equal(byId.status, 404);
    assert.equal(byId.body.error, "not_found");
  });

  await t.test("an expired item cannot be opened with the correct PIN", async () => {
    const res = await openByPin(relay, opened.pin);
    assert.equal(res.status, 404, "expired content must not be recoverable");
    assert.equal(res.body.error, "not_found");
  });
});
