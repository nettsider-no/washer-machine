-- Run once in Neon SQL Editor if you already have orders (adds settings for visit slots).

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
