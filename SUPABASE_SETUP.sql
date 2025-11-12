-- Existing Supabase setup (keep your current content above; this file is rewritten here with BlackBox schema appended)
-- NOTE: Ensure this file is applied once to your Supabase project (via dashboard or CLI).

-- =========================================
-- BlackBox Events: Persistent Memory Store
-- =========================================

create table if not exists public.blackbox_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  session_id text not null,
  event_time timestamptz not null,
  event_type text not null,
  source_app text not null default 'plant-saathi-web',
  device_type text null,
  network_quality text null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  retained_until timestamptz null
);

-- Indexes for common access patterns
create index if not exists idx_blackbox_user_time
  on public.blackbox_events (user_id, event_time desc);

create index if not exists idx_blackbox_user_type_time
  on public.blackbox_events (user_id, event_type, event_time desc);

create index if not exists idx_blackbox_session
  on public.blackbox_events (session_id);

-- Enable Row Level Security
alter table public.blackbox_events enable row level security;

-- Policy: allow authenticated users to insert their own events
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'blackbox_events' and policyname = 'insert_own_blackbox_events'
  ) then
    create policy "insert_own_blackbox_events"
      on public.blackbox_events
      for insert
      with check (
        auth.uid() is null
        or user_id is null
        or user_id = auth.uid()
      );
  end if;
end$$;

-- Policy: allow users to read only their own events (optional: comment out if you do NOT want user-readable memory)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'blackbox_events' and policyname = 'select_own_blackbox_events'
  ) then
    create policy "select_own_blackbox_events"
      on public.blackbox_events
      for select
      using (
        user_id = auth.uid()
      );
  end if;
end$$;

-- Note:
-- - Service role key (on backend only) can read all rows for training/analytics.
-- - You can implement soft retention by setting retained_until and running a scheduled delete/archive.
