create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_type text not null check (lead_type in ('discovery_call', 'quote', 'testimonial')),
  full_name text not null,
  email text not null,
  company text not null,
  phone text,
  preferred_contact text not null check (preferred_contact in ('email', 'phone')),
  website_url text,
  budget_range text not null check (budget_range in ('under_2k', '2k_5k', '5k_10k', '10k_plus', 'unknown')),
  timeline text not null check (timeline in ('asap', '1_month', '2_3_months', 'flexible')),
  services text[] not null default '{}',
  message text not null,
  locale text not null check (locale in ('en', 'fr')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  status text not null default 'new' check (status in ('new', 'approved', 'rejected')),
  ip_hash text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_type_status_idx on public.leads (lead_type, status);

create table if not exists public.lead_rate_limits (
  ip_hash text primary key,
  created_at timestamptz not null default now()
);

create index if not exists lead_rate_limits_created_at_idx on public.lead_rate_limits (created_at desc);
