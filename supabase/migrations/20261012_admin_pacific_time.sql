-- Futbol Island admin analytics, part 5 (Oct 12 2026): PACIFIC-TIME DAYS. /admin's days now run midnight to midnight in
-- America/Los_Angeles (PST or PDT as the date has it: the spring-forward day has 23 hours, the fall-back day 25), instead of
-- midnight to midnight UTC (which is 5 pm to 5 pm Pacific in summer, 4 pm to 4 pm in winter).
-- Run ONCE in the Supabase SQL editor, AFTER 20261007_analytics.sql, 20261008_analytics_places.sql,
-- 20261009_analytics_counts.sql and 20261009_analytics_start.sql. Paste the WHOLE file.
-- The LAST result must be one row:   status = OK, admin pacific time installed
-- Anything else (no row, an error, or "NOT INSTALLED: …") means it did not finish: run the whole file again (it is idempotent).
--
-- Additive and safe on the live DB:
--  * one NEW table, analytics_daily_pt (frozen Pacific days; RLS on, no policies, service_role only, like analytics_daily);
--  * NEW functions only (analytics_window_rollup, analytics_pt_day_rollup, analytics_pt_days, analytics_pt_hourly,
--    analytics_pt_finalize, analytics_pacific_version); no existing table, column, row or function is changed or dropped.
--    analytics_daily keeps every UTC day frozen so far, untouched, and the old UTC functions keep working;
--  * the app switches itself over when it sees analytics_pacific_version() (within 10 minutes): the ingest salts the visitor
--    hash per PACIFIC day from then on (so it rotates at Pacific midnight), and the nightly cron calls analytics_pt_finalize.
-- Until this runs the dashboard keeps working on UTC days and says so in a banner.
--
-- Why it is exact for recent days: sessions keep their exact start time (started_at), so any Pacific day whose raw rows are
-- still kept (the last 14 days) is rebuilt exactly by start time, DST included. The first nightly run after this file freezes
-- those days into analytics_daily_pt. Older days only exist as UTC-day totals (analytics_daily) and cannot be re-cut: the
-- dashboard shows them as UTC days, marked as such.
-- Unique visitors: a visitor hash is only stable within one salt day. Before this migration the salt rotated at UTC midnight,
-- so on those Pacific days someone who played before and after 5 pm (4 pm in winter) counts as two visitors. Each Pacific
-- rollup says whether its visitors are exact (`exactVisitors`: every session of the day was salted for that same day).
--
-- Privacy: nothing new is stored. Aggregates only leave the database; salts are still deleted every night (now once the
-- Pacific day is over).
--
-- tests/admin-analytics-pacific.cjs runs every migration in order on a throwaway Postgres and checks these functions against
-- the TypeScript reference (lib/analytics/core.ts rollupPacificDay / hourlySeries 'pacific'), DST days included.

create table if not exists public.analytics_daily_pt (
  day         date primary key,           -- the Pacific (America/Los_Angeles) day
  data        jsonb not null,             -- DailyRollup in lib/analytics/core.ts, with tz + exactVisitors
  computed_at timestamptz not null default now()
);
alter table public.analytics_daily_pt enable row level security;
-- No policies on purpose. Belt and braces: remove the default grants from the public roles too.
revoke all on public.analytics_daily_pt from anon, authenticated;
grant select, insert, update, delete on public.analytics_daily_pt to service_role;

-- Which Pacific-time SQL is installed (lib/analytics/store.ts timeMode(): a missing function means "still on UTC days").
create or replace function public.analytics_pacific_version() returns integer
language sql immutable security invoker set search_path = public as $$ select 1 $$;

-- The rollup of the sessions that STARTED in [p_lo, p_hi), labelled p_day: the same shape and rules as
-- analytics_day_rollup (20261009_analytics_start.sql) and rollupDay in lib/analytics/core.ts, plus `tz` and `exactVisitors`.
-- A whole Pacific day is analytics_pt_day_rollup below; a part of one is the "same time yesterday" comparison on /admin.
create or replace function public.analytics_window_rollup(p_day date, p_lo timestamptz, p_hi timestamptz) returns jsonb
language sql stable security invoker set search_path = public as $$
with ss as (
  select * from analytics_sessions where started_at >= p_lo and started_at < p_hi
), b as (
  select bb.session_id, sum(bb.engaged_ms) e, sum(bb.pageviews) n, max(bb.ts) last
    from analytics_beats bb join ss s on s.id = bb.session_id
   group by bb.session_id
), t as (
  select s.*,
         case when b.session_id is null then 0
              else least(b.e, greatest(0, floor(extract(epoch from (b.last - s.started_at)) * 1000))::bigint + 60000) end as engaged,
         1 + coalesce(b.n, 0) as pages
    from ss s left join b on b.session_id = s.id
), keyed as (
            select visitor_hash, pages, 'country'  as dim, coalesce(country, '(unknown)') as k from t
  union all select visitor_hash, pages, 'region',   country || '-' || region from t where country is not null and region is not null
  union all select visitor_hash, pages, 'source',   source from t
  union all select visitor_hash, pages, 'referrer', referrer_host from t where referrer_host is not null
  union all select visitor_hash, pages, 'campaign', coalesce(utm_campaign, '(no campaign)') || ' · ' || coalesce(utm_source, '—') || ' / ' || coalesce(utm_medium, '—')
              from t where coalesce(utm_source, utm_medium, utm_campaign) is not null
  union all select visitor_hash, pages, 'device',   device from t
  union all select visitor_hash, pages, 'entry',    entry_path from t
), dimc as (
  select dim, k, count(*) s, count(distinct visitor_hash) v, sum(pages) pv,
         row_number() over (partition by dim order by count(*) desc, k collate "C") rn
    from keyed group by dim, k
), dims as (
  select jsonb_object_agg(d.dim, coalesce(x.obj, '{}'::jsonb)) obj
    from (values ('country'), ('region'), ('source'), ('referrer'), ('campaign'), ('device'), ('entry')) d(dim)
    left join (select dim, jsonb_object_agg(k, jsonb_build_object('s', s, 'v', v, 'pv', pv)) obj from dimc where rn <= case when dim = 'region' then 1000 else 100 end group by dim) x
      on x.dim = d.dim
), hist as (
  select jsonb_agg(coalesce(h.c, 0) order by g) arr
    from generate_series(1, 23) g
    left join (select width_bucket(engaged / 1000.0,
                 array[0,5,10,15,20,30,45,60,90,120,180,240,300,420,600,900,1200,1800,2700,3600,5400,7200,10800]::numeric[]) b,
                 count(*) c
                 from t group by 1) h on h.b = g
), pb as (
  select bb.session_id, bb.area_ms, bb.place_ms, bb.activity_ms, bb.cells, bb.counts
    from analytics_beats bb join ss s on s.id = bb.session_id
), places as (
  select coalesce(jsonb_object_agg(key, total), '{}'::jsonb) ms, coalesce(jsonb_object_agg(key, n), '{}'::jsonb) sessions from (
    select a.key, sum(a.value::numeric)::bigint total, count(distinct pb.session_id) n
      from pb, jsonb_each_text(pb.place_ms) a group by a.key having sum(a.value::numeric) > 0) z
), acts as (
  select coalesce(jsonb_object_agg(key, total), '{}'::jsonb) obj from (
    select a.key, sum(a.value::numeric)::bigint total from pb, jsonb_each_text(pb.activity_ms) a group by a.key having sum(a.value::numeric) > 0) z
), cellsum as (
  select coalesce(jsonb_object_agg(key, total), '{}'::jsonb) obj from (
    select a.key, sum(a.value::numeric)::bigint total from pb, jsonb_each_text(pb.cells) a group by a.key having sum(a.value::numeric) > 0) z
), cnt as (
  select coalesce(jsonb_object_agg(key, total), '{}'::jsonb) sums, coalesce(jsonb_object_agg(key, n), '{}'::jsonb) sess from (
    select a.key, sum(a.value::numeric)::bigint total, count(distinct pb.session_id) n
      from pb, jsonb_each_text(pb.counts) a group by a.key having sum(a.value::numeric) > 0) z
), fl as (
  select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) obj from (
    select k, count(*) n from (
      select unnest(array['n']
               || case when f ? 'p' then array['p' || (f->>'p')] else array[]::text[] end
               || case when f ? 'g' then array['g' || (f->>'g')] else array[]::text[] end
               || case when f ? 'v' then array['v' || (f->>'v')] else array[]::text[] end
               || case when ((f->>'s')::int & 1) > 0 then array['sm'] else array[]::text[] end
               || case when ((f->>'s')::int & 2) > 0 then array['mo'] else array[]::text[] end
               || case when ((f->>'s')::int & 4) > 0 then array['vo'] else array[]::text[] end
               || case when ((f->>'s')::int & 8) > 0 then array['cf'] else array[]::text[] end) k
        from (select flags f from t where flags <> '{}'::jsonb) x) y
     group by k) z
), sv as (
  select t.* from t
   where t.entry_path = '/start'
      or exists (select 1 from analytics_beats bb where bb.session_id = t.id and bb.counts ? 'st:view' and (bb.counts->>'st:view')::numeric > 0)
), skeyed as (
            select visitor_hash, pages, 'country'  as dim, coalesce(country, '(unknown)') as k from sv
  union all select visitor_hash, pages, 'source',   source from sv
  union all select visitor_hash, pages, 'referrer', referrer_host from sv where referrer_host is not null
  union all select visitor_hash, pages, 'campaign', coalesce(utm_campaign, '(no campaign)') || ' · ' || coalesce(utm_source, '—') || ' / ' || coalesce(utm_medium, '—')
              from sv where coalesce(utm_source, utm_medium, utm_campaign) is not null
  union all select visitor_hash, pages, 'device',   device from sv
), sdimc as (
  select dim, k, count(*) s, count(distinct visitor_hash) v, sum(pages) pv,
         row_number() over (partition by dim order by count(*) desc, k collate "C") rn
    from skeyed group by dim, k
), sdims as (
  select jsonb_object_agg(d.dim, coalesce(x.obj, '{}'::jsonb)) obj
    from (values ('country'), ('source'), ('referrer'), ('campaign'), ('device')) d(dim)
    left join (select dim, jsonb_object_agg(k, jsonb_build_object('s', s, 'v', v, 'pv', pv)) obj from sdimc where rn <= 100 group by dim) x
      on x.dim = d.dim
), areas as (
  select coalesce(jsonb_object_agg(key, total), '{}'::jsonb) obj from (
    select a.key, sum(a.value::numeric)::bigint total from pb, jsonb_each_text(pb.area_ms) a group by a.key having sum(a.value::numeric) > 0) z
)
select jsonb_build_object(
  'day',       p_day,
  'tz',        'America/Los_Angeles',
  'exactVisitors', (select coalesce(bool_and(day = p_day), true) from t),
  'visitors',  (select count(distinct visitor_hash) from t),
  'sessions',  (select count(*) from t),
  'pageviews', (select coalesce(sum(pages), 0) from t),
  'bounces',   (select count(*) from t where pages <= 1 and engaged < 10000),
  'engagedMs', (select coalesce(sum(engaged), 0) from t),
  'hist',      (select arr from hist),
  'dims',      (select obj from dims),
  'areaMs',    (select obj from areas),
  'placeMs',   (select ms from places),
  'placeSessions', (select sessions from places),
  'activityMs', (select obj from acts),
  'cells',     (select obj from cellsum),
  'counts',    (select sums from cnt),
  'countSessions', (select sess from cnt),
  'flags',     (select obj from fl),
  'start',     jsonb_build_object(
                 'visitors',  (select count(distinct visitor_hash) from sv),
                 'sessions',  (select count(*) from sv),
                 'pageviews', (select coalesce(sum(pages), 0) from sv),
                 'dims',      (select obj from sdims)));
$$;

-- One whole Pacific day: from that date's Los Angeles midnight to the next one (23, 24 or 25 hours).
create or replace function public.analytics_pt_day_rollup(p_day date) returns jsonb
language sql stable security invoker set search_path = public as $$
  select analytics_window_rollup(p_day, p_day::timestamp at time zone 'America/Los_Angeles', (p_day + 1)::timestamp at time zone 'America/Los_Angeles');
$$;

-- Pacific days computed now from raw rows, for [p_from, p_to] within the last 14 Pacific days (today and the 13 before, whose
-- raw rows are always complete). Not saved.
create or replace function public.analytics_pt_days(p_from date, p_to date) returns jsonb
language sql stable security invoker set search_path = public as $$
  select coalesce(jsonb_agg(analytics_pt_day_rollup(d::date) order by d), '[]'::jsonb)
    from generate_series(greatest(p_from, (now() at time zone 'America/Los_Angeles')::date - 13),
                         least(p_to, (now() at time zone 'America/Los_Angeles')::date), interval '1 day') d;
$$;

-- Hourly series for one Pacific day: one row per real hour (23, 24 or 25), keyed by the UTC instant the hour starts (the
-- repeated 1 am of the fall-back day gets two keys). Sessions/visitors by start hour; page views = starts + beats' counts by
-- the hour of the beat (beats after the day ends are left out of the hours, as in hourlySeries).
create or replace function public.analytics_pt_hourly(p_day date) returns jsonb
language sql stable security invoker set search_path = public as $$
with w as (
  select p_day::timestamp at time zone 'America/Los_Angeles' lo, (p_day + 1)::timestamp at time zone 'America/Los_Angeles' hi
), s as (
  select a.* from analytics_sessions a, w where a.started_at >= w.lo and a.started_at < w.hi
), hs as (
  select date_trunc('hour', started_at, 'UTC') h, count(*) n, count(distinct visitor_hash) v from s group by 1
), hb as (
  select date_trunc('hour', b.ts, 'UTC') h, sum(b.pageviews) n
    from analytics_beats b join s on s.id = b.session_id, w
   where b.ts >= w.lo and b.ts < w.hi group by 1
)
select coalesce(jsonb_agg(jsonb_build_object('key', to_char(g at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                                    'visitors', coalesce(hs.v, 0), 'sessions', coalesce(hs.n, 0),
                                    'pageviews', coalesce(hs.n, 0) + coalesce(hb.n, 0)) order by g), '[]'::jsonb)
  from w, generate_series(w.lo, w.hi - interval '1 hour', interval '1 hour') g
  left join hs on hs.h = g left join hb on hb.h = g;
$$;

-- Nightly (Vercel Cron → /api/cron/analytics, 10:30 UTC = 3:30 am PDT / 2:30 am PST): freeze every final, unfrozen Pacific
-- day of the 13 before p_today (the Pacific date) into analytics_daily_pt. A day is final once its sessions' 24 h beat window
-- has closed: the next Pacific midnight + 24 h + 2 h margin. Then purge raw rows that started before the Pacific day 14 days
-- ago and every salt from before the Pacific today. Returns the days it froze.
create or replace function public.analytics_pt_finalize(p_today date) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare d date; frozen jsonb := '[]'::jsonb;
begin
  for d in select g::date from generate_series(p_today - 13, p_today - 1, interval '1 day') g loop
    if now() >= ((d + 1)::timestamp at time zone 'America/Los_Angeles') + interval '26 hours'
       and not exists (select 1 from analytics_daily_pt where day = d) then
      insert into analytics_daily_pt (day, data) values (d, analytics_pt_day_rollup(d)) on conflict (day) do nothing;
      frozen := frozen || to_jsonb(d::text);
    end if;
  end loop;
  delete from analytics_sessions where started_at < ((p_today - 14)::timestamp at time zone 'America/Los_Angeles');   -- beats cascade
  delete from analytics_salts where day < p_today;
  return frozen;
end $$;

revoke all on function public.analytics_pacific_version(), public.analytics_window_rollup(date, timestamptz, timestamptz), public.analytics_pt_day_rollup(date), public.analytics_pt_days(date, date), public.analytics_pt_hourly(date), public.analytics_pt_finalize(date) from public, anon, authenticated;
grant execute on function public.analytics_pacific_version(), public.analytics_window_rollup(date, timestamptz, timestamptz), public.analytics_pt_day_rollup(date), public.analytics_pt_days(date, date), public.analytics_pt_hourly(date), public.analytics_pt_finalize(date) to service_role;

-- Self-check: the last result of this file. "OK, admin pacific time installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, admin pacific time installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analytics_beats' and column_name = 'counts') then 'analytics_beats.counts (run 20261009_analytics_counts.sql first)' end,
    case when to_regclass('public.analytics_daily_pt') is null then 'table analytics_daily_pt' end,
    case when not coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.analytics_daily_pt')), false) then 'analytics_daily_pt row level security' end,
    case when to_regprocedure('public.analytics_pacific_version()') is null or public.analytics_pacific_version() is distinct from 1 then 'analytics_pacific_version() = 1' end,
    case when to_regprocedure('public.analytics_window_rollup(date,timestamptz,timestamptz)') is null then 'analytics_window_rollup' end,
    case when to_regprocedure('public.analytics_pt_days(date,date)') is null then 'analytics_pt_days' end,
    case when to_regprocedure('public.analytics_pt_finalize(date)') is null then 'analytics_pt_finalize' end,
    case when to_regprocedure('public.analytics_pt_hourly(date)') is null
           or jsonb_array_length(public.analytics_pt_hourly('2026-11-01')) <> 25 or jsonb_array_length(public.analytics_pt_hourly('2026-03-08')) <> 23
         then 'analytics_pt_hourly (DST: 25 hours on Nov 1 2026, 23 on Mar 8 2026)' end,
    case when to_regprocedure('public.analytics_pt_day_rollup(date)') is null
           or not (public.analytics_pt_day_rollup((now() at time zone 'America/Los_Angeles')::date) ?& array['tz', 'exactVisitors', 'counts', 'start'])
         then 'analytics_pt_day_rollup' end,
    case when to_regprocedure('public.analytics_pt_days(date,date)') is null then null
         when has_function_privilege('anon', to_regprocedure('public.analytics_pt_days(date,date)'), 'execute') then 'anon locked out of analytics_pt_days'
         when has_function_privilege('authenticated', to_regprocedure('public.analytics_window_rollup(date,timestamptz,timestamptz)'), 'execute') then 'authenticated locked out of analytics_window_rollup' end
  ) as missing) x;
