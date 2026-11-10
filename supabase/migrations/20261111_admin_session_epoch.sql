-- Nov 10 2026 (abuse audit: admin "Sign out everywhere"). NOT APPLIED: the owner runs it in the Supabase SQL editor. Safe to re-run.
-- One row holding the admin session epoch. lib/analytics/adminSession.ts reads it (cached 15 s per instance) and mixes it into
-- the admin cookie key (lib/analytics/adminAuth.ts); /api/admin/signout-all bumps it, so every earlier admin cookie stops working.
-- Until this runs, the epoch is 0 (sessions behave exactly as before) and "Sign out everywhere" answers "migration needed".
create table if not exists public.admin_state (
  id            smallint primary key default 1 check (id = 1),
  session_epoch integer not null default 0 check (session_epoch >= 0)
);
insert into public.admin_state (id, session_epoch) values (1, 0) on conflict (id) do nothing;
alter table public.admin_state enable row level security;
revoke all on public.admin_state from anon, authenticated;

create or replace function public.admin_session_epoch() returns integer
language sql stable security definer set search_path = public as $$ select coalesce((select session_epoch from admin_state where id = 1), 0) $$;

create or replace function public.admin_bump_session_epoch() returns integer
language sql volatile security definer set search_path = public as $$
  insert into admin_state (id, session_epoch) values (1, 1)
    on conflict (id) do update set session_epoch = admin_state.session_epoch + 1
  returning session_epoch
$$;

revoke all on function public.admin_session_epoch(), public.admin_bump_session_epoch() from public, anon, authenticated;
grant execute on function public.admin_session_epoch(), public.admin_bump_session_epoch() to service_role;

-- Self-check: the last result of this file. "OK, admin session epoch installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, admin session epoch installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.admin_state') is null then 'table admin_state' end,
    case when to_regprocedure('public.admin_session_epoch()') is null then 'function admin_session_epoch' end,
    case when to_regprocedure('public.admin_bump_session_epoch()') is null then 'function admin_bump_session_epoch' end
  ) as missing) x;
