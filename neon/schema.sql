-- Neon Postgres (create via Vercel → Storage → Neon, then run this in Neon SQL Editor)

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  status text not null check (status in ('new','in_progress','done','cancelled')),
  locale text,

  name text not null,
  phone text not null,
  address text,
  brand text,
  model text,
  issue text not null,
  error_code text,

  preferred_window text check (preferred_window in ('today','tomorrow','soon')),
  preferred_comment text,

  visit_date text,
  visit_time text,
  visit_comment text,

  tg_chat_id text,
  tg_message_id integer
);

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_visit_idx on public.orders(visit_date, visit_time);

-- Один активный заказ на пару visit_date + visit_time (защита от двойной брони).
create unique index if not exists orders_active_visit_slot_unique
  on public.orders (visit_date, visit_time)
  where status in ('new', 'in_progress')
    and visit_date is not null
    and visit_time is not null;

create table if not exists public.tg_sessions (
  user_id bigint primary key,
  session jsonb not null,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists tg_sessions_expires_idx on public.tg_sessions(expires_at);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
