-- Minimal schema for Telegram mini-CRM on Vercel (Supabase Postgres)

-- Orders table
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

-- Simple per-user session storage for edit dialogs
create table if not exists public.tg_sessions (
  user_id bigint primary key,
  session jsonb not null,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists tg_sessions_expires_idx on public.tg_sessions(expires_at);

