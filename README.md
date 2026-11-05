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
- `/projects` All projects, ranked (order and featured count come from
  `work.projects` / `work.featuredCount` in `public/content/site.json`)
- `/projects/:projectId` Portfolio project page
- `/studio` New business/studio subpage
- `/studio/case-studies/:slug`
- `/studio/blog`
- `/studio/blog/:slug`
- `/studio/testimonials`
- `/paste` Temporary cross-device clipboard (text or file up to 5GB, 5-minute
  TTL), Google-sign-in gated, backed by a relay on Theta — see
  `docs/theta-paste-relay-plan.md`
- `/qr` Full-screen QR code for sharing the site

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

## Off-site Apps

Standalone demos, tools and write-ups no longer live in this repo. They are
served from GitHub Pages and linked by their direct `https://alt-f17.github.io/...`
URL everywhere on the site (`site.json`, `src/content/projectDetails.ts`,
`public/portfolio.ai.map`):

- `alt-f17.github.io/other-projects/` — SF Study Tools, Theta Map, Aura,
  PDGE, Arrow Puzzle, the lightning talk, the robot-arm demo and the other
  small apps
- `alt-f17.github.io/dawson-schedule-builder/`
- `alt-f17.github.io/P.L.U.T.O.-Personal-Assistant/`

Old `felixegan.me` URLs for those apps are permanent (301) redirects in
`vercel.json`. Redirects only run on Vercel, not under `npm run dev` or
`npm run preview`. When moving another page off-site, add its redirect there
and delete the file from `public/`.

## SEO Notes

- `public/sitemap.xml` lists only real in-app routes. When a project is added
  to `site.json`, add its `/projects/<slug>` entry here and in
  `public/portfolio.ai.map` so the three stay in sync; likewise
  `public/studio.ai.map` for Studio pages
- Never list a redirected or off-site URL in the sitemap
- `public/robots.txt` allows everything except `/paste` and the legacy
  `previousWebpagePleaseNoOneFindThis.html` page (which carries
  `noindex,nofollow` meta), and points to the sitemap
