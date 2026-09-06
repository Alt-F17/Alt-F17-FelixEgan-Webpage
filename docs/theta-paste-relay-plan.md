# Theta paste relay — implementation plan for the Ubuntu server side

## What this is for

`felixegan.me/paste` (implemented in this repo: `src/pages/PastePage.tsx`,
`src/lib/pasteApi.ts`) is a temporary cross-device clipboard: paste text or
a file (up to 5GB) on one device, and it's readable from any signed-in
device for 5 minutes, then it's gone with no trace. The frontend is built
and calls a backend that doesn't exist yet. This document specifies that
backend: a relay service running on Felix's Ubuntu home server ("Theta"),
reachable publicly at `files.felixegan.me` through the same Cloudflare
Tunnel that already serves `crm.felixegan.me` and the DocuSign route.

**This document was written by an agent with no direct access to Theta** —
no SSH, no Tailscale, no Cloudflare account, no Google Cloud Console. It
defines the exact contract the frontend already expects and a recommended
implementation; the executing agent (or Felix) should verify assumptions
about Theta's current setup (existing `cloudflared` config location, OS
user conventions, etc.) against the real machine rather than trusting this
document blindly on those specifics.

## Prerequisites

1. **Reach Theta.** It's reachable over Felix's tailnet via Tailscale
   MagicDNS (get the exact hostname from Felix or `tailscale status` on
   another tailnet member) — that's the access path for *setting this up*,
   not for production traffic.
2. **Find the existing Cloudflare Tunnel config** on Theta (likely
   `/etc/cloudflared/config.yml` or under `~/.cloudflared/`) — it already
   has ingress rules for `crm.felixegan.me` and the DocuSign route. Reuse
   the same tunnel; add a new ingress hostname, don't create a second
   tunnel.
3. **Google OAuth client ID.** Felix needs to create this himself in
   Google Cloud Console (agents shouldn't need Console access for this) —
   an OAuth 2.0 Client ID of type "Web application", with Authorized
   JavaScript origins `https://www.felixegan.me` and
   `https://felixegan.me`. No redirect URI is needed — the frontend uses
   Google Identity Services' implicit ID-token flow
   (`src/lib/googleAuth.ts`), not an authorization-code redirect. Once
   created, the client ID goes into two places: this repo's
   `VITE_GOOGLE_OAUTH_CLIENT_ID` (Vercel env var) and Theta's
   `GOOGLE_OAUTH_CLIENT_ID` (used server-side to verify token audience).

## Service design

Node.js (matches the existing `simon-api-wrapper/` glue code already in
this repo/on Theta's side of things) implementing the API contract below.
Express + a raw body handler for chunk uploads (avoid buffering full
chunks in memory beyond the 8MB chunk size the frontend sends) is a
reasonable default; any stack that satisfies the contract works.

### Storage

Single fixed location, e.g. `/var/lib/paste-relay/`:
- `current.bin` — the active file's bytes (or absent for a text-only slot)
- `meta.json` — `{ type: "text" | "file", content?, filename?, mime?, size?, expiresAt }`
- Uploads-in-progress live in a `tmp/` subdirectory keyed by `uploadId`
  until `complete` is called, at which point the temp file is renamed over
  `current.bin` (atomic replace — never leaves a half-written file as the
  "current" one).

A new paste (text or file) **replaces** whatever was there — there is
never more than one slot and never a history table. This is what makes
"no trace" true by construction rather than by a cleanup job's diligence.

### API contract

Every request except `OPTIONS` requires `Authorization: Bearer <google-id-token>`.
Verify the token (signature + `aud` == `GOOGLE_OAUTH_CLIENT_ID` +
`email_verified` + not expired) using `google-auth-library`'s
`OAuth2Client.verifyIdToken`, then check the token's `email` claim against
`ALLOWED_EMAILS` (comma-separated env var). **Fail closed**: if
`ALLOWED_EMAILS` is unset or empty, reject everything with 500, don't
default-allow.

| Method & path | Body | Response | Notes |
|---|---|---|---|
| `GET /api/paste` | — | `{ empty: true }` or `{ type: "text", content, expiresAt }` or `{ type: "file", filename, size, mime, expiresAt }` | Lazily expire first: if `meta.expiresAt` is past, delete `current.bin` + `meta.json` before responding. |
| `POST /api/paste/text` | `{ content: string }` | `{ expiresAt }` | Deletes any existing file, writes `meta.json` only, `expiresAt = now + TTL_SECONDS`. |
| `POST /api/paste/file/init` | `{ filename, size, mime }` | `{ uploadId }` | Reject if `size > MAX_FILE_BYTES`. Check free disk space ≥ `size * 1.05` before accepting; reject with 507 if insufficient. |
| `PUT /api/paste/file/:uploadId/chunk?offset=N` | raw bytes | `204` | Append/write at `offset` into `tmp/<uploadId>.part`. Reject if `offset` doesn't match the file's current length (client must resume from the true offset — see `status`). |
| `GET /api/paste/file/:uploadId/status` | — | `{ receivedBytes }` | Lets the client resume after a dropped connection instead of restarting the whole upload. |
| `POST /api/paste/file/:uploadId/complete` | — | `{ expiresAt }` | Verify `tmp/<uploadId>.part` size matches the size declared at `init`; atomically rename it over `current.bin`, write `meta.json`, `expiresAt = now + TTL_SECONDS` **starting from this call**, delete the tmp entry. |
| `GET /api/paste/file/download` | — | file stream | `Content-Disposition: attachment; filename="..."`, `Content-Type: application/octet-stream` (always — never trust/reflect the stored mime into a type that a browser might render inline), support `Range` for resumable/large downloads. 404 if empty or expired. |
| `DELETE /api/paste` | — | `204` | Manual "clear now" — deletes `current.bin` + `meta.json` immediately. |

### Expiry enforcement (defense in depth — "no trace" is the whole point)

1. An in-memory timer scheduled at write time (`saveText` / `complete`) to
   delete the slot at `expiresAt`.
2. `expiresAt` persisted in `meta.json` so a service/host restart doesn't
   lose the deadline — on startup, read `meta.json`; if already expired,
   delete immediately; otherwise reschedule the remaining timer.
3. Lazy expire-on-read: every `GET /api/paste` and `GET /api/paste/file/download`
   checks `expiresAt` before responding, deleting if past due.
4. A background sweep every 30s as a backstop independent of any request
   arriving (covers the case where nobody hits the endpoint again after
   expiry).

## Security checklist (this is a home server, exposed publicly)

- **Auth fail-closed** as above — no `ALLOWED_EMAILS` means no access, not
  open access.
- **CORS**: `Access-Control-Allow-Origin` restricted to
  `https://www.felixegan.me` and `https://felixegan.me` only.
- **Rate limiting**: per-IP and per-account limits on `init` and `text`
  (e.g. a handful of requests per minute) — cheap to add with
  `express-rate-limit`, prevents someone hammering Theta with upload
  attempts or disk-filling init calls even before hitting the auth check
  isn't the point (auth already blocks non-Felix accounts) — this is about
  throttling Felix's own clients misbehaving (e.g. a runaway retry loop),
  not about stopping outsiders, since outsiders are already rejected by
  auth.
- **Disk guard**: refuse `init` if free space is insufficient (see table
  above) — don't let a single upload fill Theta's disk.
- **Max size enforced server-side**, not just trusted from the client's
  declared `size` — track actual bytes written per chunk and abort/reject
  if the running total would exceed `MAX_FILE_BYTES`.
- **No other public ingress** to the relay's port — it should only be
  reachable through the Cloudflare Tunnel, same as the CRM/DocuSign
  services; confirm no router port-forward or other exposure exists for
  this port.
- **Process isolation**: run under a dedicated unprivileged Linux user, as
  a systemd service:
  ```ini
  [Service]
  User=paste-relay
  Group=paste-relay
  ProtectSystem=strict
  ReadWritePaths=/var/lib/paste-relay
  NoNewPrivileges=true
  PrivateTmp=true
  ```
- **Never log content** — request logs may record timestamp, email,
  action, and size, but never the pasted text or file bytes/name beyond
  what's operationally necessary for abuse triage.

## Cloudflare Tunnel change

Add an ingress rule for the new hostname to the existing tunnel config
(alongside the current `crm.felixegan.me` / DocuSign entries), pointing at
the relay's local port, e.g.:

```yaml
ingress:
  - hostname: files.felixegan.me
    service: http://localhost:8787
  # ...existing rules (crm.felixegan.me, DocuSign) stay as-is, must be
  # listed before the catch-all
  - service: http_status:404
```

Then add a DNS record for `files.felixegan.me` pointed at the tunnel
(`cloudflared tunnel route dns <tunnel-name> files.felixegan.me`), and
restart/reload the `cloudflared` service.

## Environment variables

| Variable | Example | Purpose |
|---|---|---|
| `ALLOWED_EMAILS` | `felix.egan@icloud.com` | Comma-separated allowlist. Fail closed if unset. |
| `GOOGLE_OAUTH_CLIENT_ID` | (from Google Cloud Console) | Expected `aud` claim on ID tokens. |
| `STORAGE_DIR` | `/var/lib/paste-relay` | Where `current.bin`/`meta.json`/`tmp/` live. |
| `MAX_FILE_BYTES` | `5368709120` | 5GB. |
| `TTL_SECONDS` | `300` | 5 minutes. |
| `PORT` | `8787` | Local port the tunnel forwards to. |

## Verification checklist

Run these against the deployed service (via `files.felixegan.me` once the
tunnel/DNS is live, or `localhost:8787` directly on Theta first):

- [ ] Request with no `Authorization` header → 401.
- [ ] Request with a valid Google ID token for an email **not** in
      `ALLOWED_EMAILS` → 403.
- [ ] `POST /api/paste/text` then `GET /api/paste` → content matches.
- [ ] Small file: `init` → `chunk` (single chunk) → `complete` → `download`
      → bytes match the original file (checksum compare).
- [ ] Kill the connection mid-upload, call `status`, resume from the
      reported `receivedBytes`, `complete` succeeds with correct final
      size.
- [ ] Wait past `TTL_SECONDS`, then `GET /api/paste` → `{ empty: true }`,
      and confirm `current.bin`/`meta.json` are actually gone from disk
      (`ls /var/lib/paste-relay`).
- [ ] Restart the relay service mid-TTL (simulating a host reboot) →
      content still expires on schedule, not later and not stranded
      forever.
- [ ] `DELETE /api/paste` immediately empties the slot.
- [ ] Upload attempt larger than `MAX_FILE_BYTES` → rejected at `init`.
- [ ] Fill available disk close to the limit (or mock free-space check) →
      `init` rejected with 507 rather than the write failing halfway
      through.
