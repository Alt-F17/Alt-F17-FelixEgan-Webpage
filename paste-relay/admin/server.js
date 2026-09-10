'use strict';

// Workstream E (admin dashboard) — paste-relay/admin/server.js
//
// A zero-dependency Node built-in `http` server (no Express — the route
// count is tiny). This container is reached ONLY over Tailscale, at
// Theta's tailnet IP 100.68.4.105:4120 (Workstream F binds the published
// port explicitly to that address, never "4120:4120"/every interface).
// It never joins `cloudflare_origins` and is never reachable through the
// public Cloudflare Tunnel. Because Tailscale itself is the access
// control here, we do NOT set any trust-proxy-equivalent behavior and
// don't bother trying to recover a "real" client IP from proxy headers —
// there is no reverse proxy in front of this process.
//
// Routes:
//   GET  /              server-rendered HTML dashboard
//   GET  /api/history   JSON: recent audit_log rows (?limit=, default 200)
//   GET  /api/logins    JSON: recent login_attempts rows (?limit=, default 200)
//   GET  /api/uptime    JSON: per-container status via docker-status.js
//   POST /api/invites   {label?} -> {inviteUrl, expiresAt}, requires X-Admin-Key
//   GET  /healthz       plain 200, no auth

const http = require('node:http');
const crypto = require('node:crypto');

const db = require('./db');
const dockerStatus = require('./docker-status');

const PORT = Number(process.env.ADMIN_PORT) || 4120;
const MAX_INVITE_BODY_BYTES = 16 * 1024;

// ---------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
  });
  res.end(html);
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseLimit(url, fallback) {
  const raw = url.searchParams.get('limit');
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function readJsonBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        req.destroy();
        reject(Object.assign(new Error('payload_too_large'), { statusCode: 413 }));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (raw === '') {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed && typeof parsed === 'object' ? parsed : {});
      } catch {
        reject(Object.assign(new Error('invalid_json'), { statusCode: 400 }));
      }
    });

    req.on('error', reject);
  });
}

/**
 * Constant-time X-Admin-Key check. Fails closed if ADMIN_API_KEY isn't
 * set at all (same fail-closed philosophy as the rest of this system) —
 * an unset key must reject every request, never open access. Uses
 * crypto.timingSafeEqual rather than `===` to avoid a timing
 * side-channel; a length mismatch is compared against a same-length
 * dummy buffer first so even the "wrong length" path takes a
 * timingSafeEqual-shaped amount of time before returning false.
 */
function isValidAdminKey(providedKey) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false;
  if (typeof providedKey !== 'string' || providedKey.length === 0) return false;

  const expectedBuf = Buffer.from(expected, 'utf8');
  const providedBuf = Buffer.from(providedKey, 'utf8');

  if (expectedBuf.length !== providedBuf.length) {
    crypto.timingSafeEqual(expectedBuf, Buffer.alloc(expectedBuf.length));
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

// ---------------------------------------------------------------------
// HTML dashboard
// ---------------------------------------------------------------------

const PAGE_STYLE = `
  :root { color-scheme: light dark; }
  body {
    font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 24px 32px 64px;
    background: #0f1115;
    color: #e6e8eb;
  }
  h1 { font-size: 1.4rem; margin-bottom: 4px; }
  .subtitle { color: #9aa1ac; margin-top: 0; margin-bottom: 28px; font-size: 0.9rem; }
  h2 { font-size: 1.05rem; margin: 32px 0 10px; border-bottom: 1px solid #2a2e37; padding-bottom: 6px; }
  table { border-collapse: collapse; width: 100%; font-size: 0.85rem; }
  th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #21242c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px; }
  th { color: #9aa1ac; font-weight: 600; }
  tr:hover td { background: #171a21; }
  .empty { color: #6b7280; font-style: italic; padding: 10px 0; }
  .badge { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 0.75rem; }
  .badge-ok { background: #123321; color: #4ade80; }
  .badge-bad { background: #3a1414; color: #f87171; }
  .badge-state-running { background: #123321; color: #4ade80; }
  .badge-state-exited { background: #3a1414; color: #f87171; }
  .badge-state-other { background: #2a2e37; color: #d1d5db; }
  .error { color: #f87171; }
  .wrap { overflow-x: auto; }
`;

function renderAuditLogRows(rows) {
  if (rows.length === 0) return `<tr><td colspan="7" class="empty">No history yet.</td></tr>`;
  return rows
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.created_at)}</td>
        <td>${escapeHtml(r.event_type)}</td>
        <td>${escapeHtml(r.filename)}</td>
        <td>${escapeHtml(r.sha256)}</td>
        <td>${r.size_bytes ?? ''}</td>
        <td>${escapeHtml(r.source_ip)}</td>
        <td>${escapeHtml(r.detail)}</td>
      </tr>`
    )
    .join('\n');
}

function renderLoginRows(rows) {
  if (rows.length === 0) return `<tr><td colspan="3" class="empty">No login attempts yet.</td></tr>`;
  return rows
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.attempted_at)}</td>
        <td>${escapeHtml(r.source_ip)}</td>
        <td><span class="badge ${r.success ? 'badge-ok' : 'badge-bad'}">${r.success ? 'success' : 'failed'}</span></td>
      </tr>`
    )
    .join('\n');
}

function renderAccountRows(rows) {
  if (rows.length === 0) return `<tr><td colspan="4" class="empty">No accounts yet.</td></tr>`;
  return rows
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.id)}</td>
        <td>${escapeHtml(r.label)}</td>
        <td>${escapeHtml(r.created_at)}</td>
        <td>${escapeHtml(r.last_login_at) || '<em>never</em>'}</td>
      </tr>`
    )
    .join('\n');
}

function stateBadgeClass(state) {
  if (state === 'running') return 'badge-state-running';
  if (state === 'exited' || state === 'dead') return 'badge-state-exited';
  return 'badge-state-other';
}

function renderUptimeRows(containers, uptimeError) {
  if (uptimeError) {
    return `<tr><td colspan="5" class="error">docker-socket-proxy unavailable: ${escapeHtml(uptimeError.message)}</td></tr>`;
  }
  if (containers.length === 0) return `<tr><td colspan="5" class="empty">No containers reported.</td></tr>`;
  return containers
    .map(
      (c) => `<tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.image)}</td>
        <td><span class="badge ${stateBadgeClass(c.state)}">${escapeHtml(c.state)}</span></td>
        <td>${escapeHtml(c.status)}</td>
        <td>${escapeHtml(c.startedAt)}</td>
      </tr>`
    )
    .join('\n');
}

async function renderDashboard() {
  const auditRows = db.getRecentAuditLog(200);
  const loginRows = db.getRecentLoginAttempts(200);
  const accountRows = db.getAccountSummaries();

  let containers = [];
  let uptimeError = null;
  try {
    containers = await dockerStatus.getContainerStatuses();
  } catch (err) {
    uptimeError = err;
  }

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>paste-relay admin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${PAGE_STYLE}</style>
</head>
<body>
  <h1>paste-relay admin</h1>
  <p class="subtitle">Tailscale-only. Reachable only at 100.68.4.105:4120.</p>

  <h2>Container uptime</h2>
  <div class="wrap">
    <table>
      <thead><tr><th>Name</th><th>Image</th><th>State</th><th>Status</th><th>Started</th></tr></thead>
      <tbody>${renderUptimeRows(containers, uptimeError)}</tbody>
    </table>
  </div>

  <h2>Item / file history (audit log)</h2>
  <div class="wrap">
    <table>
      <thead><tr><th>Time</th><th>Event</th><th>Filename</th><th>SHA-256</th><th>Size</th><th>Source IP</th><th>Detail</th></tr></thead>
      <tbody>${renderAuditLogRows(auditRows)}</tbody>
    </table>
  </div>

  <h2>Login attempts</h2>
  <div class="wrap">
    <table>
      <thead><tr><th>Time</th><th>Source IP</th><th>Result</th></tr></thead>
      <tbody>${renderLoginRows(loginRows)}</tbody>
    </table>
  </div>

  <h2>Accounts</h2>
  <div class="wrap">
    <table>
      <thead><tr><th>ID</th><th>Label</th><th>Created</th><th>Last login</th></tr></thead>
      <tbody>${renderAccountRows(accountRows)}</tbody>
    </table>
  </div>

  <h2>Create invite</h2>
  <p class="subtitle">
    POST /api/invites with header <code>X-Admin-Key</code> and optional JSON body
    <code>{"label": "..."}</code>. This dashboard page does not embed the admin key
    client-side; run it from a terminal on the tailnet, e.g.:<br>
    <code>curl -X POST -H "X-Admin-Key: $ADMIN_API_KEY" -H "Content-Type: application/json" -d '{"label":"for Sarah"}' http://100.68.4.105:4120/api/invites</code>
  </p>
</body>
</html>`;
}

// ---------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------

async function handleDashboard(req, res) {
  const html = await renderDashboard();
  sendHtml(res, 200, html);
}

function handleHistory(req, res, url) {
  const rows = db.getRecentAuditLog(parseLimit(url, 200));
  sendJson(res, 200, rows);
}

function handleLogins(req, res, url) {
  const rows = db.getRecentLoginAttempts(parseLimit(url, 200));
  sendJson(res, 200, rows);
}

async function handleUptime(req, res) {
  try {
    const containers = await dockerStatus.getContainerStatuses();
    sendJson(res, 200, containers);
  } catch (err) {
    sendJson(res, 502, { error: 'docker_status_unavailable', message: err.message });
  }
}

async function handleCreateInvite(req, res) {
  if (!isValidAdminKey(req.headers['x-admin-key'])) {
    sendJson(res, 401, { error: 'unauthorized' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_INVITE_BODY_BYTES);
  } catch (err) {
    sendJson(res, err.statusCode || 400, { error: 'bad_request', message: err.message });
    return;
  }

  const label = typeof body.label === 'string' && body.label.trim() !== '' ? body.label.trim() : null;
  const invite = db.createInvite(label);

  sendJson(res, 201, {
    inviteUrl: `https://felixegan.me/paste?invite=${invite.id}`,
    expiresAt: invite.expiresAt,
  });
}

function handleHealthz(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('ok');
}

// ---------------------------------------------------------------------
// Server / dispatch
// ---------------------------------------------------------------------

const server = http.createServer((req, res) => {
  let url;
  try {
    url = new URL(req.url, 'http://internal');
  } catch {
    sendJson(res, 400, { error: 'bad_request', message: 'invalid URL' });
    return;
  }

  Promise.resolve()
    .then(() => {
      if (req.method === 'GET' && url.pathname === '/healthz') return handleHealthz(req, res);
      if (req.method === 'GET' && url.pathname === '/') return handleDashboard(req, res);
      if (req.method === 'GET' && url.pathname === '/api/history') return handleHistory(req, res, url);
      if (req.method === 'GET' && url.pathname === '/api/logins') return handleLogins(req, res, url);
      if (req.method === 'GET' && url.pathname === '/api/uptime') return handleUptime(req, res);
      if (req.method === 'POST' && url.pathname === '/api/invites') return handleCreateInvite(req, res);
      sendJson(res, 404, { error: 'not_found' });
      return undefined;
    })
    .catch((err) => {
      console.error('[admin] unhandled error:', err);
      if (!res.headersSent) {
        sendJson(res, 500, { error: 'internal_error' });
      } else {
        res.end();
      }
    });
});

server.listen(PORT, () => {
  // Binding 0.0.0.0 inside the container is fine and expected — Workstream
  // F's compose file is what actually restricts external reachability, by
  // publishing this port only on Theta's Tailscale IP
  // (100.68.4.105:4120:4120), never "4120:4120" (every interface).
  console.log(`[admin] paste-relay admin dashboard listening on :${PORT}`);
  if (!process.env.ADMIN_API_KEY) {
    console.warn('[admin] ADMIN_API_KEY is not set — POST /api/invites will reject all requests (fail closed).');
  }
});

module.exports = server;
