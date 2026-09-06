# paste-relay

Backend for `felixegan.me/paste`. Implements the contract in
[`../docs/theta-paste-relay-plan.md`](../docs/theta-paste-relay-plan.md)
against `src/lib/pasteApi.ts`. Runs on Theta as a Docker container joined to
the same `cloudflare_origins` network as `docuseal`/`twenty-crm`, reachable
publicly at `files.felixegan.me` through the existing Cloudflare Tunnel.

## Deploy on Theta

```bash
cd paste-relay
cp .env.example .env   # fill in ALLOWED_EMAILS and GOOGLE_OAUTH_CLIENT_ID
docker compose up -d --build
```

No `sudo` required — everything runs under the `docker` group, matching the
existing services on this box. Storage lives in the named volume
`paste-relay_paste_relay_data`, not a bind mount, so there's no host
directory to create by hand.

## Cloudflare Tunnel

Add a Public Hostname in the same tunnel that already serves
`crm.felixegan.me` / docuseal (Zero Trust dashboard → Networks → Tunnels →
that tunnel → Public Hostname):

| Field | Value |
|---|---|
| Subdomain | `files` |
| Domain | `felixegan.me` |
| Service type | `HTTP` |
| URL | `paste-relay:8787` |

The service resolves by its Docker network alias (`paste-relay`), same as
`twenty-crm` does for `crm.felixegan.me`.

## Updating

```bash
git pull
cd paste-relay
docker compose up -d --build
```

## Logs / troubleshooting

```bash
docker logs -f paste-relay
```

Logs never include pasted content — only method, path, status, and the
caller's email.
