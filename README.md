# Felix Egan Studio Website

Hybrid personal + studio website focused on local SMB web development in Montreal.

## Positioning Values (from feasibility study)

- Target market size: `80,000-110,000` small businesses in greater Montreal
- Underserved pool estimate: `20,000-35,000` businesses needing modern websites
- Bilingual default: English + French
- Recommended niche emphasis: trades and home services
- Founding client promo: `20%` discount for early testimonials/case studies

### Package Pricing Baseline (CAD)

- Starter (brochure): `1,200-1,800`
- Growth (site + CMS/funnel): `2,000-2,800`
- Premium (advanced/custom): `3,000-4,500`
- Landing page: `600-900`
- Redesign baseline: `1,200-1,800`
- Maintenance retainer: `100-150/month`

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (lead intake edge function + Postgres)
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

## Environment Variables

Create `.env`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CALENDLY_URL=
```

Edge function environment:

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
