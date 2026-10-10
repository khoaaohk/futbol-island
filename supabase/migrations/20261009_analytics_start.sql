-- Futbol Island admin analytics, part 4 (Oct 9 2026): START-PAGE traffic. The day's rollup gains a `start` object: visitors,
-- sessions, page views and the country / source / referrer / campaign / device split for the sessions that entered on /start
-- or viewed it later (an `st:view` counter in a beat), so /admin can show who visits the title screen.
-- Run ONCE in the Supabase SQL editor, AFTER 20261007_analytics.sql, 20261008_analytics_places.sql and
-- 20261009_analytics_counts.sql. Paste the WHOLE file.
-- The LAST result must be one row:   status = OK, start page installed (analytics schema 4)
-- Anything else (no row, an error, or "NOT INSTALLED: …") means it did not finish: run the whole file again (it is idempotent).
--
-- Additive and safe on the live DB:
--  * no table or column changes at all;
--  * analytics_day_rollup is replaced in place (same signature, so grants, analytics_days, analytics_finalize and the cron are
--    untouched); every key it returned before is returned exactly as before, plus `start`;
--  * analytics_schema_version() now returns 4 (the dashboard's "storage needs update" banner checks it);
--  * nothing is dropped, renamed or rewritten; already-frozen analytics_daily rows simply have no `start` object.
-- The app works before and after this runs: until then the Start page section shows its tap counts (the counters ride the
-- existing `counts` column; analytics_ingest only checks an id's SHAPE, the server enforces the allowlist) but not the
-- start-only countries, sources and devices.
--
-- Privacy: nothing new is stored. The start-page taps are fixed counter ids (lib/analytics/startIds.ts: st:*, sg:*, sp:*),
-- totals only, in the counts column added by 20261009_analytics_counts.sql.

-- Which analytics SQL is installed (the dashboard compares it with SCHEMA_VERSION in lib/analytics/core.ts).
create or replace function public.analytics_schema_version() returns integer
language sql immutable security invoker set search_path = public as $$ select 4 $$;

-- One UTC day's rollup: as in 20261009_analytics_counts.sql, plus the /start subset (same rules as rollupDay / startRollup in
-- lib/analytics/core.ts).
create or replace function public.analytics_day_rollup(p_day date) returns jsonb
language sql stable security invoker set search_path = public as $$
with b as (
  select bb.session_id, sum(bb.engaged_ms) e, sum(bb.pageviews) n, max(bb.ts) last
    from analytics_beats bb join analytics_sessions s on s.id = bb.session_id
   where s.day = p_day group by bb.session_id
), t as (
  select s.*,
         case when b.session_id is null then 0
              else least(b.e, greatest(0, floor(extract(epoch from (b.last - s.started_at)) * 1000))::bigint + 60000) end as engaged,
         1 + coalesce(b.n, 0) as pages
    from analytics_sessions s left join b on b.session_id = s.id
   where s.day = p_day
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
  select bb.session_id, bb.place_ms, bb.activity_ms, bb.cells, bb.counts
    from analytics_beats bb join analytics_sessions s on s.id = bb.session_id
   where s.day = p_day
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
  -- The /start subset (Oct 9 2026): sessions that entered on /start, or viewed it later (an `st:view` counter in any beat).
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
    select a.key, sum(a.value::numeric)::bigint total
      from analytics_beats bb join analytics_sessions s on s.id = bb.session_id, jsonb_each_text(bb.area_ms) a
     where s.day = p_day group by a.key having sum(a.value::numeric) > 0) z
)
select jsonb_build_object(
  'day',       p_day,
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

revoke all on function public.analytics_day_rollup(date), public.analytics_schema_version() from public, anon, authenticated;
grant execute on function public.analytics_day_rollup(date), public.analytics_schema_version() to service_role;

-- Self-check: the last result of this file. "OK, start page installed (analytics schema 4)" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, start page installed (analytics schema 4)' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analytics_beats' and column_name = 'counts') then 'analytics_beats.counts (run 20261009_analytics_counts.sql first)' end,
    case when public.analytics_schema_version() is distinct from 4 then 'analytics_schema_version() = 4' end,
    case when not (public.analytics_day_rollup((now() at time zone 'utc')::date) ?& array['counts', 'countSessions', 'flags', 'start']) then 'analytics_day_rollup (start key)' end,
    case when not ((public.analytics_day_rollup((now() at time zone 'utc')::date) -> 'start' -> 'dims') ?& array['country', 'source', 'referrer', 'campaign', 'device']) then 'analytics_day_rollup (start dims)' end
  ) as missing) x;
