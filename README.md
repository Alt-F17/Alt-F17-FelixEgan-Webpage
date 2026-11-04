# Felix Egan Studio Website

Hybrid personal + studio website focused on local SMB web development in Montreal.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Vercel API route for Studio discovery-call intake
- Supabase (quote/testimonial lead intake edge function + Postgres)
- Theta (home server) relay behind Cloudflare Tunnel for `/paste`'s file
  storage — see `docs/theta-paste-relay-plan.md`
- Plausible analytics
- `react-helmet-async` for route-level SEO

## Main Routes

- `/` Original portfolio homepage
- `/projects/:projectId` Original portfolio project page
- `/studio` New business/studio subpage
- `/studio/case-studies/:slug`
- `/studio/blog`
- `/studio/blog/:slug`
- `/studio/testimonials`
- `/paste` Temporary cross-device clipboard (text or file up to 5GB, 5-minute
  TTL), Google-sign-in gated, backed by a relay on Theta — see
  `docs/theta-paste-relay-plan.md`

## Environment Variables

Create `.env`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PASTE_API_BASE=https://files.felixegan.me
VITE_GOOGLE_OAUTH_CLIENT_ID=
```

Server-only environment:

```bash
TWENTY_INTAKE_BASE_URL=
TWENTY_API_KEY=
```

The production intake base URL is `https://crm.felixegan.me/lead-intake`.
It is a restricted server-to-server proxy and must not expose the Twenty API
key to browser code.

Supabase edge function environment:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
LEAD_ALERT_TO=
LEAD_ALERT_FROM=
```

## Supabase Setup

1. Apply SQL migration: `supabase/migrations/20260225_create_leads.sql`
2. Deploy edge function: `supabase/functions/lead-intake/index.ts`
3. Point frontend to project URL and anon key.

## Development

```bash
npm install
npm run dev
```

## SEO Notes

- `public/sitemap.xml` is included
- `public/robots.txt` disallows legacy utility pages
- Legacy pages include `noindex,nofollow` meta
