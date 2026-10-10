-- Futbol Island save codes (Oct 10 2026; docs/accounts-design.md, docs/save-codes.md). Run once in the Supabase SQL editor
-- (or `supabase db push`), AFTER the three analytics migrations. Additive only: it creates new tables and functions and
-- touches nothing that exists. Running it twice is harmless. The LAST result row must read "OK, game saves installed".
--
-- What is stored: a keyed hash of the save code (HMAC-SHA256 with SAVE_CODE_PEPPER, a Vercel secret that is NOT in this
-- database, so a leaked database cannot be brute-forced offline), the game progress snapshot (allowlisted keys only, no
-- coach-plan text), a revision number and two day-granularity dates. Never: the code itself, a name, email, IP address,
-- user agent or anything typed by a child.
-- Throttling: save_throttle holds counters per 'ip:' + sha256(daily salt + IP) bucket and site-wide; each day's salt
-- (save_salts) and every throttle row older than a day are deleted by the nightly purge, so buckets cannot be linked across days.
-- Retention: save_purge() (nightly, /api/cron/analytics) deletes saves not used for 12 months.
--
-- Access: RLS is on with NO policies and anon/authenticated have no grants (as the analytics tables). Only the server, with
-- SUPABASE_SERVICE_ROLE_KEY, can reach the data, through the security-definer functions below, each one atomic.
--
-- tests/game-saves.cjs runs every migration in order on a throwaway Postgres and checks these functions against the
-- TypeScript twin in lib/saves/store.ts (createMemorySaveStore), including this file's own self-check row.

create table if not exists public.game_saves (
  id             uuid primary key default gen_random_uuid(),
  code_hash      bytea not null unique check (octet_length(code_hash) = 32),  -- HMAC-SHA256(SAVE_CODE_PEPPER, 'v1:' || normalised code)
  code_version   smallint not null default 1,                                -- word-list version (lists only ever grow)
  snapshot       jsonb not null,                                             -- {format, game, keys}: allowlisted keys only
  snapshot_bytes integer not null check (snapshot_bytes between 2 and 524288),
  rev            integer not null default 1 check (rev >= 1),
  created_on     date not null default current_date,                         -- day granularity only
  last_used_on   date not null default current_date,                         -- drives the 12-month deletion
  guardian_id    uuid null                                                   -- reserved for phase 2b (grown-up accounts); always null now
);
create index if not exists game_saves_last_used_idx on public.game_saves (last_used_on);

create table if not exists public.save_throttle (
  bucket   text not null check (length(bucket) <= 48),   -- 'f:ip:<hash>', 'f:global' (failed tries), 'c:…' (creates), 'm:…' (emails)
  win      timestamptz not null,                          -- window start (10 minutes, an hour or a day)
  failures integer not null default 0,                    -- the count in that window
  primary key (bucket, win)
);

create table if not exists public.save_salts (
  day  date primary key,
  salt text not null
);

alter table public.game_saves    enable row level security;
alter table public.save_throttle enable row level security;
alter table public.save_salts    enable row level security;
-- No policies on purpose. Belt and braces: remove the default grants from the public roles too.
revoke all on public.game_saves, public.save_throttle, public.save_salts from anon, authenticated;

create or replace function public.save_schema_version() returns integer
language sql immutable security definer set search_path = public as $$ select 1 $$;

-- Today's salt for IP buckets, created on first use (two v4 UUIDs: 244 random bits).
create or replace function public.save_salt(p_day date) returns text
language plpgsql security definer set search_path = public as $$
declare s text;
begin
  insert into save_salts (day, salt) values (p_day, replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
  on conflict (day) do nothing;
  select salt into s from save_salts where day = p_day;
  return s;
end $$;

-- The 32-byte hash from its hex form, or null for anything else (which matches no save).
create or replace function public.save_hash(p_hash text) returns bytea
language sql immutable security definer set search_path = public as $$
  select case when p_hash ~ '^[0-9a-f]{64}$' then decode(p_hash, 'hex') end
$$;

-- Window start for a window of p_minutes (10, 60, 1440).
create or replace function public.save_window(p_minutes integer) returns timestamptz
language sql stable security definer set search_path = public as $$
  select to_timestamp(floor(extract(epoch from now()) / (p_minutes * 60)) * (p_minutes * 60))
$$;

-- One hit in a bucket (creates, emails). True while the window's count is within p_limit.
create or replace function public.save_hit(p_bucket text, p_limit integer, p_minutes integer) returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into save_throttle (bucket, win, failures) values (left(p_bucket, 48), save_window(p_minutes), 1)
  on conflict (bucket, win) do update set failures = save_throttle.failures + 1
  returning failures into n;
  return n <= p_limit;
end $$;

-- May this IP bucket try a code now? 10 failures per 10 minutes per bucket; past 500 failures in the hour site-wide only a
-- grown-up request from a bucket with < 3 failures; past 600, nothing (doc §5.2). Same rules as LIMITS in lib/saves/store.ts.
create or replace function public.save_allowed(p_bucket text, p_grownup boolean) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare ip integer; glob integer;
begin
  ip   := coalesce((select failures from save_throttle where bucket = left('f:' || p_bucket, 48) and win = save_window(10)), 0);
  glob := coalesce((select failures from save_throttle where bucket = 'f:global' and win = save_window(60)), 0);
  if ip >= 10 or glob >= 600 then return false; end if;
  if glob >= 500 and (not p_grownup or ip >= 3) then return false; end if;
  return true;
end $$;

create or replace function public.save_fail(p_bucket text) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into save_throttle (bucket, win, failures) values (left('f:' || p_bucket, 48), save_window(10), 1)
  on conflict (bucket, win) do update set failures = save_throttle.failures + 1;
  insert into save_throttle (bucket, win, failures) values ('f:global', save_window(60), 1)
  on conflict (bucket, win) do update set failures = save_throttle.failures + 1;
end $$;

-- A new save. {ok:false} when the hash exists (a code collision: the server draws another code).
create or replace function public.save_create(p_hash text, p_snapshot jsonb, p_bytes integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r integer;
begin
  if p_hash !~ '^[0-9a-f]{64}$' then return '{"ok":false}'::jsonb; end if;
  insert into game_saves (code_hash, snapshot, snapshot_bytes) values (decode(p_hash, 'hex'), p_snapshot, p_bytes)
  on conflict (code_hash) do nothing
  returning rev into r;
  return case when r is null then '{"ok":false}'::jsonb else jsonb_build_object('ok', true, 'rev', r) end;
end $$;

-- Check (p_want = false) or restore (p_want = true). The answer for a wrong code and for a throttled bucket is the same.
create or replace function public.save_lookup(p_hash text, p_bucket text, p_grownup boolean, p_want boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s game_saves%rowtype;
begin
  if not save_allowed(p_bucket, p_grownup) then return '{"ok":false}'::jsonb; end if;
  update game_saves set last_used_on = current_date
   where code_hash = save_hash(p_hash)
  returning * into s;
  if s.id is null then perform save_fail(p_bucket); return '{"ok":false}'::jsonb; end if;
  delete from save_throttle where bucket = left('f:' || p_bucket, 48) and win = save_window(10);   -- success resets the bucket
  return case when p_want then jsonb_build_object('ok', true, 'rev', s.rev, 'snapshot', s.snapshot)
              else jsonb_build_object('ok', true, 'rev', s.rev) end;
end $$;

-- Compare-and-set save. {ok,rev} | {ok:false, conflict:true, rev} (another device saved first) | {ok:false}.
create or replace function public.save_put(p_hash text, p_base_rev integer, p_snapshot jsonb, p_bytes integer, p_bucket text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r integer; cur integer;
begin
  if not save_allowed(p_bucket, true) then return '{"ok":false}'::jsonb; end if;
  update game_saves set snapshot = p_snapshot, snapshot_bytes = p_bytes, rev = rev + 1, last_used_on = current_date
   where code_hash = save_hash(p_hash) and rev = p_base_rev
  returning rev into r;
  if r is not null then return jsonb_build_object('ok', true, 'rev', r); end if;
  update game_saves set last_used_on = current_date where code_hash = save_hash(p_hash) returning rev into cur;
  if cur is null then perform save_fail(p_bucket); return '{"ok":false}'::jsonb; end if;
  return jsonb_build_object('ok', false, 'conflict', true, 'rev', cur);
end $$;

-- Hard delete. Always answers {ok:true}; a missing save counts as a failed try, so delete can't be used to guess codes.
create or replace function public.save_delete(p_hash text, p_bucket text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if not save_allowed(p_bucket, true) then return '{"ok":true}'::jsonb; end if;
  delete from game_saves where code_hash = save_hash(p_hash);
  get diagnostics n = row_count;
  if n = 0 then perform save_fail(p_bucket); end if;
  return '{"ok":true}'::jsonb;
end $$;

-- Nightly (Vercel Cron → /api/cron/analytics): saves unused for 12 months, throttle rows older than a day, old salts.
create or replace function public.save_purge() returns jsonb
language plpgsql security definer set search_path = public as $$
declare a integer; b integer;
begin
  delete from game_saves where last_used_on < current_date - interval '12 months';
  get diagnostics a = row_count;
  delete from save_throttle where win < now() - interval '1 day';
  get diagnostics b = row_count;
  delete from save_salts where day < (now() at time zone 'utc')::date;
  return jsonb_build_object('saves', a, 'throttle', b);
end $$;

-- For the /admin status line: a count only, never a code, hash or snapshot.
create or replace function public.save_stats() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('saves', (select count(*) from game_saves))
$$;

revoke all on function public.save_schema_version(), public.save_salt(date), public.save_hash(text), public.save_window(integer), public.save_hit(text, integer, integer),
  public.save_allowed(text, boolean), public.save_fail(text), public.save_create(text, jsonb, integer), public.save_lookup(text, text, boolean, boolean),
  public.save_put(text, integer, jsonb, integer, text), public.save_delete(text, text), public.save_purge(), public.save_stats()
  from public, anon, authenticated;
grant execute on function public.save_schema_version(), public.save_salt(date), public.save_hit(text, integer, integer),
  public.save_create(text, jsonb, integer), public.save_lookup(text, text, boolean, boolean), public.save_put(text, integer, jsonb, integer, text),
  public.save_delete(text, text), public.save_purge(), public.save_stats()
  to service_role;

-- Self-check: the last result of this file. "OK, game saves installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, game saves installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.game_saves') is null then 'table game_saves' end,
    case when to_regclass('public.save_throttle') is null then 'table save_throttle' end,
    case when to_regclass('public.save_salts') is null then 'table save_salts' end,
    case when exists (select 1 from pg_class where oid in (to_regclass('public.game_saves'), to_regclass('public.save_throttle'), to_regclass('public.save_salts')) and not relrowsecurity) then 'row level security' end,
    case when exists (select 1 from pg_policies where schemaname = 'public' and tablename in ('game_saves', 'save_throttle', 'save_salts')) then 'no policies (one exists)' end,
    case when to_regclass('public.game_saves') is not null and (has_table_privilege('anon', 'public.game_saves', 'select') or has_table_privilege('authenticated', 'public.game_saves', 'select')) then 'anon/authenticated locked out of game_saves' end,
    case when not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'game_saves' and column_name = 'guardian_id') then 'game_saves.guardian_id' end,
    case when to_regprocedure('public.save_schema_version()') is null then 'save_schema_version()'
         when (select prosrc from pg_proc where oid = to_regprocedure('public.save_schema_version()')) not like '%select 1%' then 'save_schema_version() = 1' end,
    case when to_regprocedure('public.save_lookup(text,text,boolean,boolean)') is null then 'save_lookup'
         when has_function_privilege('anon', to_regprocedure('public.save_lookup(text,text,boolean,boolean)'), 'execute') then 'anon locked out of save_lookup' end,
    case when to_regprocedure('public.save_put(text,integer,jsonb,integer,text)') is null then 'save_put' end,
    case when to_regprocedure('public.save_create(text,jsonb,integer)') is null then 'save_create' end,
    case when to_regprocedure('public.save_delete(text,text)') is null then 'save_delete' end,
    case when to_regprocedure('public.save_purge()') is null then 'save_purge' end,
    case when to_regprocedure('public.save_hit(text,integer,integer)') is null then 'save_hit' end,
    case when to_regprocedure('public.save_salt(date)') is null then 'save_salt' end,
    case when to_regprocedure('public.save_stats()') is null then 'save_stats' end
  ) as missing) x;
