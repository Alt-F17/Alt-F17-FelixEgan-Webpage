'use strict';

// Workstream E (admin dashboard). Zero-dependency HTTP client for
// Workstream F's `docker-socket-proxy` (tecnativa/docker-socket-proxy),
// which fronts the real Docker Engine API over plain HTTP on the
// internal `paste_relay_internal` network. We only ever call the single
// read endpoint the plan specifies:
//
//   GET /containers/json?all=1
//
// Field names below (Names, Image, State, Status, Created) were verified
// against a live Docker Engine (API v1.52) response for this exact
// endpoint, not guessed:
//
//   [{ "Id": "...", "Names": ["/paste-relay"], "Image": "paste-relay:latest",
//      "ImageID": "...", "Command": "...", "Created": 1788732019,
//      "Ports": [...], "Labels": {...}, "State": "running",
//      "Status": "Up 3 days (healthy)", "HostConfig": {...},
//      "NetworkSettings": {...}, "Mounts": [...] }, ...]
//
// Notably, this list endpoint has NO `StartedAt` field — that only
// exists on the single-container inspect endpoint
// (`/containers/{id}/json` → `State.StartedAt`), which the plan does not
// call here (one list call for the whole host, not one inspect call per
// container). See `simplify()` below for how `startedAt` is derived.

const http = require('node:http');

const REQUEST_TIMEOUT_MS = 5000;

function fetchRawContainers() {
  return new Promise((resolve, reject) => {
    const host = process.env.DOCKER_PROXY_HOST;
    const port = process.env.DOCKER_PROXY_PORT;

    if (!host || !port) {
      reject(new Error('DOCKER_PROXY_HOST/DOCKER_PROXY_PORT not configured'));
      return;
    }

    const req = http.request(
      {
        host,
        port: Number(port),
        path: '/containers/json?all=1',
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode !== 200) {
            reject(
              new Error(
                `docker-socket-proxy GET /containers/json responded ${res.statusCode}: ${body.slice(0, 200)}`
              )
            );
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(new Error(`docker-socket-proxy returned invalid JSON: ${err.message}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('docker-socket-proxy request timed out'));
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Reduce Docker's verbose ContainerSummary objects down to what the
 * dashboard needs. Left broad on purpose (every container on Theta, not
 * just paste-relay's own) per the plan — the proxy's CONTAINERS allow-list
 * is daemon-wide, so this naturally surfaces docuseal/twenty-crm/ntfy/
 * cloudflared etc. too.
 */
function simplify(rawContainers) {
  return rawContainers.map((c) => {
    const rawName = Array.isArray(c.Names) && c.Names.length > 0 ? c.Names[0] : '';
    const name = rawName.startsWith('/') ? rawName.slice(1) : rawName || c.Id?.slice(0, 12) || 'unknown';

    return {
      name,
      image: c.Image ?? null,
      state: c.State ?? null,
      status: c.Status ?? null,
      // Derived from `Created` (container creation time, Unix seconds —
      // the only timestamp this list endpoint provides). Exact for a
      // container that has never been stopped/restarted; for one that
      // was restarted without being recreated, this reflects creation
      // time rather than the most recent start. Accepted approximation
      // for an uptime-at-a-glance view — see module comment above.
      startedAt: typeof c.Created === 'number' ? new Date(c.Created * 1000).toISOString() : null,
    };
  });
}

async function getContainerStatuses() {
  const raw = await fetchRawContainers();
  return simplify(raw);
}

module.exports = { getContainerStatuses };
