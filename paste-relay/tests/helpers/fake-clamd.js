// Minimal clamd INSTREAM server for tests.
//
// Speaks the exact subset content-safety.js::scanStream expects:
//   client -> "zINSTREAM\0", then {4-byte BE length, chunk}*, then a
//             zero-length chunk to terminate
//   server -> "stream: OK\0" | "stream: <sig> FOUND\0", then FIN
//
// scanStream only parses the reply on the socket's 'end' event, so the
// reply MUST be followed by end() or the client hangs until its close
// handler fails it closed.

const net = require("net");

/**
 * @param {object} opts
 * @param {"clean"|"infected"|"garbage"|"hang"|"drop"} [opts.verdict]
 * @param {number} [opts.delayMs] delay before replying, to simulate a slow scan
 */
function startFakeClamd(opts = {}) {
  const state = {
    verdict: opts.verdict || "clean",
    delayMs: opts.delayMs || 0,
    signature: opts.signature || "Eicar-Test-Signature",
    scans: 0,
    bytesReceived: 0,
  };

  const server = net.createServer((socket) => {
    let sawHeader = false;
    let pending = Buffer.alloc(0);
    let terminated = false;

    socket.on("data", (chunk) => {
      pending = Buffer.concat([pending, chunk]);

      if (!sawHeader) {
        const idx = pending.indexOf("\0");
        if (idx === -1) return;
        sawHeader = true;
        pending = pending.subarray(idx + 1);
      }

      // Consume length-prefixed frames; a zero length ends the stream.
      while (pending.length >= 4 && !terminated) {
        const len = pending.readUInt32BE(0);
        if (len === 0) {
          terminated = true;
          pending = pending.subarray(4);
          break;
        }
        if (pending.length < 4 + len) return;
        state.bytesReceived += len;
        pending = pending.subarray(4 + len);
      }

      if (terminated) {
        state.scans += 1;
        respond(socket);
      }
    });

    socket.on("error", () => {});
  });

  function respond(socket) {
    const send = () => {
      if (state.verdict === "hang") return; // never reply
      if (state.verdict === "drop") {
        socket.destroy(); // connection dies mid-scan
        return;
      }
      if (state.verdict === "garbage") {
        socket.end("something unexpected\0");
        return;
      }
      if (state.verdict === "infected") {
        socket.end(`stream: ${state.signature} FOUND\0`);
        return;
      }
      socket.end("stream: OK\0");
    };
    if (state.delayMs > 0) setTimeout(send, state.delayMs);
    else send();
  }

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({
        port: server.address().port,
        host: "127.0.0.1",
        state,
        setVerdict(v) {
          state.verdict = v;
        },
        setDelay(ms) {
          state.delayMs = ms;
        },
        close() {
          return new Promise((r) => server.close(r));
        },
      });
    });
  });
}

module.exports = { startFakeClamd };
