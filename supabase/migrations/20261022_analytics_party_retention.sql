-- Futbol Island admin: Play with friends retention and virality (Oct 22 2026; docs/analytics-multiplayer-plan.md §6, §10 Phase C).
--
-- !! LEGAL SIGN-OFF REQUIRED BEFORE THIS IS RUN OR SWITCHED ON !!
-- The retention report links party play to the anonymous, keyed player id (analytics_sessions.player_id) on the server. It only
-- ever RETURNS aggregate rates and totals (no player id, no session id, no code, no day per player), but it reads per-player
-- rows to compute them. components/privacy/PrivacyPolicy.tsx carries the [LAWYER] draft sentence that must be approved first.
-- The game sends the Phase C ids (mp:guest_new, mp:rtt_*, mp:reconnect, mp:min_away) and /admin shows the card ONLY when the
-- build sets NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1. Installing this file alone changes nothing a player or visitor sees.
--
-- Run ONCE in the Supabase SQL editor (or `supabase db push`), AFTER 20261021_analytics_sponsor_split.sql. Paste the WHOLE file.
-- The LAST result must be one row:
--   status = OK, party retention installed
--
-- Additive; running it twice is harmless. No change to analytics_ingest (the new mp: ids already pass its id-shape check).
--  * public.analytics_party_retention(p_from date, p_to date) -> jsonb, over the kept raw rows (the last 14 days only):
--      - per player id seen in the range, the cohort day = their first session day in the range; the group = "party" when a
--        session on that day counted mp:in, else "solo"; D1 = played again the next day; D7 = played again within 7 days.
--        A cohort counts toward D1 / D7 only when that whole return window has finished (the last COMPLETE day, never today),
--        so D7 is a rolling cohort and D30 is impossible by design (14-day retention).
--      - new players: sessions whose start said "this device has not played here before" (is_returning = false), split into
--        invited (the session opened an invite link, mp:open_link, or went live as a new guest, mp:guest_new) and organic.
--      - virality: total mp:guest_new and mp:created in the range (the k-factor estimate = guest_new / created).
--    AGGREGATES ONLY: every count under 10 (players, eligible players, sessions, totals) comes back as null, and so does a rate
--    resting on fewer than 10 eligible players. There is no player id, session id or per-player row in the output.
--  * public.analytics_sponsor_weekly: one row per finished ISO week (Monday start): the sponsor reach figures, rounded the
--    sponsor way (under 10 = null; nearest 10 under 1,000, else nearest 100), so reach survives the 14-day raw-row deletion.
--    RLS on with no policies, and no grants to anon / authenticated: service_role only.
--  * public.analytics_sponsor_week_snapshot() -> integer: stores every finished week still fully inside the raw rows that is not
--    stored yet (never overwrites a stored week); returns how many it stored. public.analytics_sponsor_weekly_read(p_limit)
--    -> jsonb: the newest weeks. All three functions: service_role only (the /admin server route, behind the admin session).
-- tests/admin-party-retention.cjs runs this file on a throwaway Postgres and checks it against lib/analytics/partyRetention.ts.

create or replace function public.analytics_party_retention(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with w as (select greatest(least(p_from, p_to), (now() at time zone 'utc')::date - 14) f,
                    least(greatest(p_from, p_to), (now() at time zone 'utc')::date) t,
                    least(greatest(p_from, p_to), (now() at time zone 'utc')::date - 1) l),
  s as (select a.id, a.day, a.player_id, a.is_returning from analytics_sessions a, w where a.day between w.f and w.t),
  n as (select b.session_id, c.key, sum(c.value::bigint) v
          from analytics_beats b join s on s.id = b.session_id, jsonb_each_text(b.counts) c
         where c.key in ('mp:in', 'mp:open_link', 'mp:guest_new', 'mp:created') and c.value ~ '^[0-9]+$'
         group by 1, 2),
  sc as (select s.id, s.day, s.player_id, s.is_returning,
                exists (select 1 from n where n.session_id = s.id and n.key = 'mp:in' and n.v > 0) party,
                exists (select 1 from n where n.session_id = s.id and n.key in ('mp:open_link', 'mp:guest_new') and n.v > 0) invited
           from s),
  pl as (select player_id, min(day) c from sc where player_id is not null group by 1),
  pg as (select pl.player_id, pl.c,
                bool_or(sc.party and sc.day = pl.c) party,
                bool_or(sc.day = pl.c + 1) d1,
                bool_or(sc.day between pl.c + 1 and pl.c + 7) d7
           from pl join sc on sc.player_id = pl.player_id group by 1, 2),
  g as (select case when party then 'party' else 'solo' end grp, count(*) players,
               count(*) filter (where c + 1 <= w.l) d1_n, count(*) filter (where c + 1 <= w.l and d1) d1_back,
               count(*) filter (where c + 7 <= w.l) d7_n, count(*) filter (where c + 7 <= w.l and d7) d7_back
          from pg, w group by 1),
  gj as (select k.grp, jsonb_build_object(
            'players',     case when coalesce(g.players, 0) >= 10 then g.players end,
            'd1_eligible', case when coalesce(g.d1_n, 0) >= 10 then g.d1_n end,
            'd1_rate',     case when coalesce(g.d1_n, 0) >= 10 then round(g.d1_back::numeric / g.d1_n, 4) end,
            'd7_eligible', case when coalesce(g.d7_n, 0) >= 10 then g.d7_n end,
            'd7_rate',     case when coalesce(g.d7_n, 0) >= 10 then round(g.d7_back::numeric / g.d7_n, 4) end) j
           from (values ('party'), ('solo')) k(grp) left join g on g.grp = k.grp),
  np as (select count(*) filter (where is_returning = false) total,
                count(*) filter (where is_returning = false and invited) inv,
                count(*) filter (where is_returning = false and not invited) org
           from sc),
  vt as (select coalesce(sum(v) filter (where key = 'mp:guest_new'), 0) gnew, coalesce(sum(v) filter (where key = 'mp:created'), 0) created from n)
  select jsonb_build_object(
    'from', w.f, 'to', w.t, 'last_complete_day', w.l, 'window_days', 14, 'min_group', 10,
    'groups', (select jsonb_object_agg(grp, j) from gj),
    'new_players', jsonb_build_object(
       'sessions', case when np.total >= 10 then np.total end,
       'invited',  case when np.inv >= 10 then np.inv end,
       'organic',  case when np.org >= 10 then np.org end),
    'virality', jsonb_build_object(
       'guest_new', case when vt.gnew >= 10 then vt.gnew end,
       'created',   case when vt.created >= 10 then vt.created end))
  from w, np, vt;
$$;

revoke all on function public.analytics_party_retention(date, date) from public, anon, authenticated;
grant execute on function public.analytics_party_retention(date, date) to service_role;

-- Weekly sponsor reach (kept past the 14-day raw rows; rounded the sponsor way at write time).
create table if not exists public.analytics_sponsor_weekly (
  week_start  date primary key check (extract(isodow from week_start) = 1),
  data        jsonb not null,
  computed_at timestamptz not null default now()
);
alter table public.analytics_sponsor_weekly enable row level security;
revoke all on table public.analytics_sponsor_weekly from public, anon, authenticated;
grant select, insert, update, delete on table public.analytics_sponsor_weekly to service_role;

create or replace function public.analytics_sponsor_round(p_n bigint) returns bigint
language sql immutable set search_path = public as $$
  select case when p_n is null or p_n < 10 then null when p_n < 1000 then round(p_n / 10.0) * 10 else round(p_n / 100.0) * 100 end::bigint;
$$;

create or replace function public.analytics_sponsor_week_snapshot() returns integer
language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'utc')::date;
  wk date;
  stored integer := 0;
begin
  -- Finished weeks (their last day at least one full day ago) whose first day is still inside the 14 days of raw rows.
  for wk in select g::date from generate_series(date_trunc('week', (today - 14)::timestamp), (today - 8)::timestamp, interval '7 days') g
             where g::date >= today - 14 and g::date + 6 <= today - 2 loop
    insert into analytics_sponsor_weekly (week_start, data)
    select wk, jsonb_build_object(
             'sessions',      analytics_sponsor_round(count(*)),
             'players',       analytics_sponsor_round(count(distinct s.player_id)),
             'party_players', analytics_sponsor_round(count(distinct s.player_id) filter (where p.party)),
             'party_sessions',analytics_sponsor_round(count(*) filter (where p.party)),
             'minutes',       analytics_sponsor_round(floor(coalesce(sum(p.ms), 0) / 60000)::bigint))
      from analytics_sessions s
      cross join lateral (select coalesce(sum(b.engaged_ms), 0) ms,
                                 coalesce(bool_or(coalesce(b.counts->>'mp:in', '') ~ '^[1-9][0-9]*$'), false) party
                            from analytics_beats b where b.session_id = s.id) p
     where s.day between wk and wk + 6
    on conflict (week_start) do nothing;
    if found then stored := stored + 1; end if;
  end loop;
  return stored;
end;
$$;

create or replace function public.analytics_sponsor_weekly_read(p_limit integer default 12) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('week_start', week_start, 'data', data) order by week_start desc), '[]'::jsonb)
    from (select week_start, data from analytics_sponsor_weekly order by week_start desc limit greatest(1, least(coalesce(p_limit, 12), 60))) x;
$$;

revoke all on function public.analytics_sponsor_round(bigint) from public, anon, authenticated;
grant execute on function public.analytics_sponsor_round(bigint) to service_role;
revoke all on function public.analytics_sponsor_week_snapshot() from public, anon, authenticated;
grant execute on function public.analytics_sponsor_week_snapshot() to service_role;
revoke all on function public.analytics_sponsor_weekly_read(integer) from public, anon, authenticated;
grant execute on function public.analytics_sponsor_weekly_read(integer) to service_role;

-- Self-check: the last result of this file. "OK, party retention installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, party retention installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.analytics_sessions') is null then 'table analytics_sessions (run 20261007_analytics.sql first)' end,
    case when not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analytics_sessions' and column_name = 'player_id') then 'analytics_sessions.player_id (run 20261019_analytics_day_sessions.sql first)' end,
    case when not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analytics_sessions' and column_name = 'is_returning') then 'analytics_sessions.is_returning (run 20261018_analytics_live.sql first)' end,
    case when to_regprocedure('public.analytics_party_retention(date,date)') is null then 'analytics_party_retention'
         when has_function_privilege('anon', to_regprocedure('public.analytics_party_retention(date,date)'), 'execute') then 'anon locked out of analytics_party_retention'
         when has_function_privilege('authenticated', to_regprocedure('public.analytics_party_retention(date,date)'), 'execute') then 'authenticated locked out of analytics_party_retention' end,
    case when to_regprocedure('public.analytics_sponsor_week_snapshot()') is null then 'analytics_sponsor_week_snapshot'
         when has_function_privilege('anon', to_regprocedure('public.analytics_sponsor_week_snapshot()'), 'execute') then 'anon locked out of analytics_sponsor_week_snapshot' end,
    case when to_regprocedure('public.analytics_sponsor_weekly_read(integer)') is null then 'analytics_sponsor_weekly_read'
         when has_function_privilege('anon', to_regprocedure('public.analytics_sponsor_weekly_read(integer)'), 'execute') then 'anon locked out of analytics_sponsor_weekly_read' end,
    case when to_regclass('public.analytics_sponsor_weekly') is null then 'table analytics_sponsor_weekly'
         when not (select relrowsecurity from pg_class where oid = 'public.analytics_sponsor_weekly'::regclass) then 'row level security on analytics_sponsor_weekly'
         when has_table_privilege('anon', 'public.analytics_sponsor_weekly', 'select') or has_table_privilege('authenticated', 'public.analytics_sponsor_weekly', 'select') then 'anon / authenticated locked out of analytics_sponsor_weekly' end
  ) as missing) x;
