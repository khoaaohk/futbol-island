-- Futbol Island admin analytics (Nov 13 2026; owner: "keep my own devices out of all analytics … go back and retroactively fix
-- that to exclude my numbers"). Staff devices and players are left out of EVERY admin number: players, sessions, time, the live
-- "On now" list, the player cards, the day view, fishing, sponsor, party, play modes and the people/cohort function.
--
-- NOT APPLIED. The owner pastes this WHOLE file into the Supabase SQL editor (after 20261120_analytics_play_modes.sql). The LAST
-- result must be one row:   status = OK, staff exclusion installed
-- Then, once, to rewrite the frozen days still inside the raw window (see analytics_recompute_rollups below):
--   select public.analytics_recompute_rollups(current_date - 14, current_date);
--
-- Safe:
--  * No raw row is deleted or changed. Exclusion is a FILTER: public.analytics_excluded holds short player hashes (the 6–12 hex
--    "#1537da" the admin shows, a prefix of the 12-hex `pid` of 20261019_analytics_day_sessions.sql). Delete a row and that
--    player counts again everywhere at once (frozen days recomputed while excluded stay as recomputed until recomputed again).
--  * Two read-only views, analytics_sessions_counted / analytics_beats_counted, are the raw tables minus excluded players. Every
--    READ function below is the latest version from its migration with only its raw-table reads pointed at those views (same
--    signature, same output, same grants; diff any of them against its source file to check). The writers (analytics_ingest,
--    analytics_finalize, analytics_pt_finalize) are untouched: rows keep arriving and the nightly purge keeps deleting raw rows
--    after 14 days as before.
--  * analytics_pt_day_rollup adds "staffExcluded": true to the rollup it returns, so /admin can tell which frozen days were
--    frozen BEFORE this ran (those may include staff visits) from days computed with the filter.
--  * analytics_recompute_rollups(p_from, p_to) rewrites ONLY the frozen Pacific rollups (analytics_daily_pt) of days whose raw
--    rows are still complete (the Pacific today − 13 and later, before today), from those raw rows, with the filter. Idempotent.
--    Days before that cut-off cannot be corrected (their raw rows are gone): /admin says "Days before <date> may include staff
--    visits". Old UTC-day rollups (analytics_daily) are never touched.
-- The app works before and after this runs: until then /admin shows "Staff exclusion needs a database update" next to the
-- "This device is mine" switch, and devices flagged as staff already send nothing.
-- Player ids rotate every 90 days (lib/analytics/playerId.ts); an excluded hash covers its period. Re-open /admin on each device
-- after a rotation (the switch re-registers the device) or exclude the new #hash from its player card.

create table if not exists public.analytics_excluded (
  pid      text primary key check (pid ~ '^[0-9a-f]{6,12}$'),   -- a prefix of the 12-hex pid the admin shows
  label    text check (label is null or length(label) <= 80),
  added_at timestamptz not null default now()
);
alter table public.analytics_excluded enable row level security;
revoke all on public.analytics_excluded from anon, authenticated;
grant select, insert, update, delete on public.analytics_excluded to service_role;
-- The owner's main desktop (player #1537da, California, save code; owner request Nov 13 2026).
insert into public.analytics_excluded (pid, label) values ('1537da', 'Owner desktop (pre-loaded)') on conflict (pid) do nothing;

-- The 12-hex admin pid of a stored player id (same formula as analytics_day_sessions' `pid`).
create or replace function public.analytics_pid(p_player_id text) returns text
language sql immutable security invoker set search_path = public as $$
  select case when p_player_id is null then null else left(encode(sha256(convert_to(p_player_id || ':futbol-island-player-v1', 'UTF8')), 'hex'), 12) end
$$;
-- True when the player id belongs to an excluded (staff) player.
create or replace function public.analytics_is_staff(p_player_id text) returns boolean
language sql stable security invoker set search_path = public as $$
  select p_player_id is not null and exists (select 1 from analytics_excluded e where left(analytics_pid(p_player_id), length(e.pid)) = e.pid)
$$;

create or replace view public.analytics_sessions_counted as
  select s.* from public.analytics_sessions s where not public.analytics_is_staff(s.player_id);
create or replace view public.analytics_beats_counted as
  select b.* from public.analytics_beats b
   where not exists (select 1 from public.analytics_sessions s where s.id = b.session_id and public.analytics_is_staff(s.player_id));
revoke all on public.analytics_sessions_counted, public.analytics_beats_counted from public, anon, authenticated;
grant select on public.analytics_sessions_counted, public.analytics_beats_counted to service_role;
-- Postgres 15+ (Supabase): the views check the caller's rights on the raw tables too.
do $$ begin
  if current_setting('server_version_num')::int >= 150000 then
    execute 'alter view public.analytics_sessions_counted set (security_invoker = true)';
    execute 'alter view public.analytics_beats_counted set (security_invoker = true)';
  end if;
end $$;
revoke all on function public.analytics_pid(text), public.analytics_is_staff(text) from public, anon, authenticated;
grant execute on function public.analytics_pid(text), public.analytics_is_staff(text) to service_role;

-- ---- The read functions, filtered ----------------------------------------------------------------------------------------

-- analytics_day_rollup: as in 20261009_analytics_start.sql (8 raw-table reads now go through the *_counted views)
create or replace function public.analytics_day_rollup(p_day date) returns jsonb
language sql stable security invoker set search_path = public as $$
with b as (
  select bb.session_id, sum(bb.engaged_ms) e, sum(bb.pageviews) n, max(bb.ts) last
    from analytics_beats_counted bb join analytics_sessions_counted s on s.id = bb.session_id
   where s.day = p_day group by bb.session_id
), t as (
  select s.*,
         case when b.session_id is null then 0
              else least(b.e, greatest(0, floor(extract(epoch from (b.last - s.started_at)) * 1000))::bigint + 60000) end as engaged,
         1 + coalesce(b.n, 0) as pages
    from analytics_sessions_counted s left join b on b.session_id = s.id
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
    from analytics_beats_counted bb join analytics_sessions_counted s on s.id = bb.session_id
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
      or exists (select 1 from analytics_beats_counted bb where bb.session_id = t.id and bb.counts ? 'st:view' and (bb.counts->>'st:view')::numeric > 0)
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
      from analytics_beats_counted bb join analytics_sessions_counted s on s.id = bb.session_id, jsonb_each_text(bb.area_ms) a
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

-- analytics_hourly: as in 20261007_analytics.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_hourly(p_day date) returns jsonb
language sql stable security invoker set search_path = public as $$
with s as (select * from analytics_sessions_counted where day = p_day),
hs as (select extract(hour from started_at at time zone 'utc')::int h, count(*) n, count(distinct visitor_hash) v from s group by 1),
hb as (select extract(hour from b.ts at time zone 'utc')::int h, sum(b.pageviews) n
         from analytics_beats_counted b join s on s.id = b.session_id
        where (b.ts at time zone 'utc')::date = p_day group by 1)
select jsonb_agg(jsonb_build_object('key', to_char(p_day, 'YYYY-MM-DD') || 'T' || lpad(g::text, 2, '0'),
                                    'visitors', coalesce(hs.v, 0), 'sessions', coalesce(hs.n, 0),
                                    'pageviews', coalesce(hs.n, 0) + coalesce(hb.n, 0)) order by g)
  from generate_series(0, 23) g left join hs on hs.h = g left join hb on hb.h = g;
$$;

-- analytics_live: as in 20261007_analytics.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_live(p_since timestamptz) returns integer
language sql stable security invoker set search_path = public as $$
  select count(*)::integer from (select id from analytics_sessions_counted where started_at >= p_since
                                 union select session_id from analytics_beats_counted where ts >= p_since) x;
$$;

-- analytics_window_rollup: as in 20261012_admin_pacific_time.sql (4 raw-table reads now go through the *_counted views)
create or replace function public.analytics_window_rollup(p_day date, p_lo timestamptz, p_hi timestamptz) returns jsonb
language sql stable security invoker set search_path = public as $$
with ss as (
  select * from analytics_sessions_counted where started_at >= p_lo and started_at < p_hi
), b as (
  select bb.session_id, sum(bb.engaged_ms) e, sum(bb.pageviews) n, max(bb.ts) last
    from analytics_beats_counted bb join ss s on s.id = bb.session_id
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
    from analytics_beats_counted bb join ss s on s.id = bb.session_id
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
      or exists (select 1 from analytics_beats_counted bb where bb.session_id = t.id and bb.counts ? 'st:view' and (bb.counts->>'st:view')::numeric > 0)
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

-- analytics_pt_hourly: as in 20261012_admin_pacific_time.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_pt_hourly(p_day date) returns jsonb
language sql stable security invoker set search_path = public as $$
with w as (
  select p_day::timestamp at time zone 'America/Los_Angeles' lo, (p_day + 1)::timestamp at time zone 'America/Los_Angeles' hi
), s as (
  select a.* from analytics_sessions_counted a, w where a.started_at >= w.lo and a.started_at < w.hi
), hs as (
  select date_trunc('hour', started_at, 'UTC') h, count(*) n, count(distinct visitor_hash) v from s group by 1
), hb as (
  select date_trunc('hour', b.ts, 'UTC') h, sum(b.pageviews) n
    from analytics_beats_counted b join s on s.id = b.session_id, w
   where b.ts >= w.lo and b.ts < w.hi group by 1
)
select coalesce(jsonb_agg(jsonb_build_object('key', to_char(g at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                                    'visitors', coalesce(hs.v, 0), 'sessions', coalesce(hs.n, 0),
                                    'pageviews', coalesce(hs.n, 0) + coalesce(hb.n, 0)) order by g), '[]'::jsonb)
  from w, generate_series(w.lo, w.hi - interval '1 hour', interval '1 hour') g
  left join hs on hs.h = g left join hb on hb.h = g;
$$;

-- analytics_fishing_summary: as in 20261017_analytics_fishing.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_fishing_summary(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with per_session as (
    select b.session_id,
           sum(coalesce((b.counts->>'fi:hook_spin')::integer, 0) + coalesce((b.counts->>'fi:hook_easy')::integer, 0)) as fights,
           sum(coalesce((b.counts->>'fi:land')::integer, 0)) as landed
      from analytics_beats_counted b
      join analytics_sessions_counted s on s.id = b.session_id
     where s.day between least(p_from, p_to) and greatest(p_from, p_to)
       and (b.counts ? 'fi:hook_spin' or b.counts ? 'fi:hook_easy' or b.counts ? 'fi:land')
     group by b.session_id
    having sum(coalesce((b.counts->>'fi:hook_spin')::integer, 0) + coalesce((b.counts->>'fi:hook_easy')::integer, 0)) > 0
  )
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'window_days', 14,
    'sessions', count(*),
    'fights', coalesce(sum(fights), 0),
    'landed', coalesce(sum(landed), 0),
    'buckets', jsonb_build_object(
      '1',   count(*) filter (where fights = 1),
      '2-3', count(*) filter (where fights between 2 and 3),
      '4-6', count(*) filter (where fights between 4 and 6),
      '7+',  count(*) filter (where fights >= 7)))
  from per_session;
$$;

-- analytics_live_sessions: as in 20261019_analytics_day_sessions.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_live_sessions(p_minutes integer default 5) returns jsonb
language sql stable security definer set search_path = public as $$
  with w as (select now() - make_interval(mins => least(greatest(coalesce(p_minutes, 5), 1), 60)) as since),
  ids as (select id from analytics_sessions_counted, w where started_at >= w.since
          union select session_id from analytics_beats_counted, w where ts >= w.since),
  sess_rows as (select * from analytics_session_rows(array(select id from ids))),
  cc as (select coalesce(r->>'country', '(unknown)') c, r->>'region' rg from sess_rows),
  top_rows as (select r, seen from sess_rows order by seen desc limit 200)
  select jsonb_build_object(
    'minutes', least(greatest(coalesce(p_minutes, 5), 1), 60),
    'generated_at', now(),
    'sessions', (select count(*) from sess_rows),
    'by_area', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from
                (select coalesce(r->>'spot', 'starting') k, count(*) n from sess_rows group by 1) x), '[]'::jsonb),
    'by_country', coalesce((select jsonb_agg(jsonb_build_object('country', x.c, 'n', x.n,
                    'regions', coalesce((select jsonb_agg(jsonb_build_object('region', y.rg, 'n', y.rn) order by y.rn desc, y.rg)
                                           from (select rg, count(*) rn from cc where cc.c = x.c and rg is not null group by rg) y), '[]'::jsonb))
                    order by x.n desc, x.c)
                  from (select c, count(*) n from cc group by c) x), '[]'::jsonb),
    'by_source', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from
                (select coalesce(r->>'campaign', r->>'referrer_host', 'direct') k, count(*) n from sess_rows group by 1) x), '[]'::jsonb),
    'rows', coalesce((select jsonb_agg(r order by seen desc) from top_rows), '[]'::jsonb));
$$;

-- analytics_sources_summary: as in 20261018_analytics_live.sql (1 raw-table reads now go through the *_counted views)
create or replace function public.analytics_sources_summary(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with s as (select * from analytics_sessions_counted where day between least(p_from, p_to) and greatest(p_from, p_to)),
  sup as (select 3 as k),
  c as (select coalesce(country, '(unknown)') country, count(*) n from s group by 1),
  rg as (select coalesce(country, '(unknown)') country, region, count(*) n from s where region is not null group by 1, 2),
  src as (select coalesce(utm_source, utm_campaign, referrer_host, 'direct') k, count(*) n from s group by 1)
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'window_days', 14, 'min_sessions', (select k from sup),
    'sessions', (select count(*) from s),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('country', c.country, 'n', c.n,
                   'regions', coalesce((select jsonb_agg(jsonb_build_object('region', rg.region, 'n', case when rg.n >= 3 then rg.n end) order by rg.n desc, rg.region)
                                         from rg where rg.country = c.country), '[]'::jsonb)) order by c.n desc, c.country)
                   from c where c.n >= 3), '[]'::jsonb),
    'countries_suppressed', (select coalesce(sum(n), 0) from c where n < 3),
    'sources', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from src where n >= 3), '[]'::jsonb),
    'sources_suppressed', (select coalesce(sum(n), 0) from src where n < 3),
    'returning', jsonb_build_object(
       'new',       (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where is_returning is false),
       'returning', (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where is_returning is true),
       'unknown',   (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where is_returning is null)),
    'code', jsonb_build_object(
       'with',      (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where has_code is true),
       'without',   (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where has_code is false),
       'unknown',   (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where has_code is null)));
$$;

-- analytics_session_rows: as in 20261019_analytics_day_sessions.sql (6 raw-table reads now go through the *_counted views)
create or replace function public.analytics_session_rows(p_ids text[])
returns table (id text, r jsonb, started_at timestamptz, seen timestamptz)
language sql stable security definer set search_path = public as $$
  with
  bt as (
    select b.session_id, b.id, b.ts, b.engaged_ms, b.area_ms, b.activity_ms, b.counts,
           (select key from jsonb_each_text(b.area_ms) where value ~ '^[0-9]+$' and value::bigint > 0 order by value::bigint desc, key limit 1) as area,
           (select key from jsonb_each_text(b.activity_ms) where key <> 'idle' and value ~ '^[0-9]+$' and value::bigint > 0 order by value::bigint desc, key limit 1) as activity
      from analytics_beats_counted b where b.session_id = any(p_ids)),
  cur as (select distinct on (session_id) session_id, area, id from bt where area is not null order by session_id, ts desc, id desc),
  cur_act as (select distinct on (session_id) session_id, activity from bt where activity is not null order by session_id, ts desc, id desc),
  prev as (select distinct on (bt.session_id) bt.session_id, bt.area from bt join cur on cur.session_id = bt.session_id
            where bt.area is not null and bt.area <> cur.area and bt.id < cur.id order by bt.session_id, bt.ts desc, bt.id desc),
  agg as (select session_id, max(ts) as last_beat, min(ts) as first_beat, sum(engaged_ms)::bigint as engaged, count(*) as beats
            from bt group by session_id),
  cnt as (select bt.session_id, c.key, sum(c.value::bigint) as n from bt, jsonb_each_text(bt.counts) c
           where c.value ~ '^[0-9]+$' group by bt.session_id, c.key),
  cs as (select session_id, jsonb_build_object(
           'balls',     coalesce(sum(n) filter (where key = 'su:ball_find'), 0),
           'fish',      coalesce(sum(n) filter (where key = 'fi:land'), 0),
           'lessons',   coalesce(sum(n) filter (where key like 'lo:%'), 0),
           'quizzes',   coalesce(sum(n) filter (where key like 'lf:%'), 0),
           'swims',     coalesce(sum(n) filter (where key = 'wa:swim_start'), 0),
           'paintings', coalesce(sum(n) filter (where key = 'su:easel_save'), 0),
           'fruit',     coalesce(sum(n) filter (where key like 'su:fruit\_%'), 0),
           'kicks',     coalesce(sum(n) filter (where key = 'su:kick_play'), 0)) as counts
           from cnt group by session_id),
  ar as (select a.session_id, jsonb_object_agg(a.key, a.s) as areas from (
           select bt.session_id, e.key, (sum(e.value::bigint) / 1000)::bigint as s from bt, jsonb_each_text(bt.area_ms) e
            where e.value ~ '^[0-9]+$' group by bt.session_id, e.key) a
          where a.s > 0 group by a.session_id),
  ac as (select a.session_id, jsonb_object_agg(a.key, a.s) as activities from (
           select bt.session_id, e.key, (sum(e.value::bigint) / 1000)::bigint as s from bt, jsonb_each_text(bt.activity_ms) e
            where e.value ~ '^[0-9]+$' group by bt.session_id, e.key) a
          where a.s > 0 group by a.session_id),
  dev as (select s.id, (select count(*) from analytics_sessions_counted o where o.day = s.day and o.visitor_hash = s.visitor_hash) as sessions,
                 (select coalesce(sum(b.engaged_ms), 0) / 1000 from analytics_beats_counted b join analytics_sessions_counted o on o.id = b.session_id
                   where o.day = s.day and o.visitor_hash = s.visitor_hash) as seconds
            from analytics_sessions_counted s where s.id = any(p_ids)),
  sess_rows as (
    select s.id, jsonb_build_object(
             'sid', left(encode(sha256(convert_to(s.id || ':futbol-island-live-v1', 'UTF8')), 'hex'), 6),
             'started_at', s.started_at,
             'last_seen', greatest(s.started_at, coalesce(agg.last_beat, s.started_at)),
             'seconds_active', coalesce(agg.engaged, 0) / 1000,
             'span_seconds', floor(extract(epoch from greatest(s.started_at, coalesce(agg.last_beat, s.started_at)) - s.started_at))::bigint,
             'beats', coalesce(agg.beats, 0),
             'device', s.device, 'entry_path', s.entry_path,
             'country', s.country, 'region', s.region,
             'source', s.source, 'referrer_host', s.referrer_host, 'campaign', coalesce(s.utm_source, s.utm_campaign),
             'returning', s.is_returning, 'has_code', s.has_code,
             'area', cur.area, 'activity', cur_act.activity, 'previous_area', prev.area,
             'spot', case when cur.area = 'island' and cur_act.activity is not null and cur_act.activity not in ('walk', 'menu', 'other') then cur_act.activity else cur.area end,
             'areas', coalesce(ar.areas, '{}'::jsonb), 'activities', coalesce(ac.activities, '{}'::jsonb),
             'counts', coalesce(cs.counts, '{"balls":0,"fish":0,"lessons":0,"quizzes":0,"swims":0,"paintings":0,"fruit":0,"kicks":0}'::jsonb),
             'device_today_sessions', dev.sessions, 'device_today_seconds', dev.seconds,
             'pid', case when s.player_id is not null then left(encode(sha256(convert_to(s.player_id || ':futbol-island-player-v1', 'UTF8')), 'hex'), 12) end) as r,
           s.started_at,
           greatest(s.started_at, coalesce(agg.last_beat, s.started_at)) as seen
      from analytics_sessions_counted s
      left join agg on agg.session_id = s.id left join cur on cur.session_id = s.id left join cur_act on cur_act.session_id = s.id
      left join prev on prev.session_id = s.id left join cs on cs.session_id = s.id left join ar on ar.session_id = s.id
      left join ac on ac.session_id = s.id left join dev on dev.id = s.id
     where s.id = any(p_ids))
  select id, r, started_at, seen from sess_rows;
$$;

-- analytics_day_sessions: as in 20261019_analytics_day_sessions.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_day_sessions(p_day date, p_limit integer default 500) returns jsonb
language sql stable security definer set search_path = public as $$
  with b as (select (p_day::timestamp at time zone 'America/Los_Angeles') lo, ((p_day + 1)::timestamp at time zone 'America/Los_Angeles') hi,
                    (now() at time zone 'America/Los_Angeles')::date today),
  ids as (select s.id from analytics_sessions_counted s, b where s.started_at >= b.lo and s.started_at < b.hi),
  sr as (select * from analytics_session_rows(array(select id from ids))),
  lim as (select least(greatest(coalesce(p_limit, 500), 1), 2000) n),
  top_rows as (select r, started_at from sr order by started_at desc, id limit (select n from lim)),
  t as (select analytics_rows_totals(coalesce((select jsonb_agg(r) from sr), '[]'::jsonb)) j),
  part as (select p_day < b.today - 14 and not exists (select 1 from sr) as partial, b.today from b),
  roll as (select data from (select data, 1 o from analytics_daily_pt where day = p_day
                             union all select data, 2 from analytics_daily where day = p_day) q order by o limit 1),
  dim as (select d.key dim, e.key k, coalesce((e.value->>'s')::bigint, 0) n
            from roll, jsonb_each(case when jsonb_typeof(roll.data->'dims') = 'object' then roll.data->'dims' else '{}'::jsonb end) d,
                 jsonb_each(case when jsonb_typeof(d.value) = 'object' then d.value else '{}'::jsonb end) e)
  select case when (select partial from part) then jsonb_build_object(
    'day', p_day, 'generated_at', now(), 'partial', true, 'window_days', 14, 'oldest_day', (select today - 14 from part),
    'tz', coalesce((select data->>'tz' from roll), case when exists (select 1 from roll) then 'UTC' end),
    'sessions', coalesce((select (data->>'sessions')::bigint from roll), 0),
    'visitors', coalesce((select (data->>'visitors')::bigint from roll), 0),
    'players', null, 'seconds', coalesce((select (data->>'engagedMs')::bigint / 1000 from roll), 0),
    'by_area', coalesce((select jsonb_agg(jsonb_build_object('key', a.key, 'n', null, 'seconds', a.value::bigint / 1000) order by a.value::bigint desc, a.key)
                  from roll, jsonb_each_text(case when jsonb_typeof(roll.data->'areaMs') = 'object' then roll.data->'areaMs' else '{}'::jsonb end) a
                 where a.value ~ '^[0-9]+$' and a.value::bigint >= 1000), '[]'::jsonb),
    'by_country', coalesce((select jsonb_agg(jsonb_build_object('country', c.k, 'n', c.n,
                    'regions', coalesce((select jsonb_agg(jsonb_build_object('region', split_part(g.k, '-', 2), 'n', g.n) order by g.n desc, g.k)
                                           from dim g where g.dim = 'region' and split_part(g.k, '-', 1) = c.k), '[]'::jsonb)) order by c.n desc, c.k)
                  from dim c where c.dim = 'country'), '[]'::jsonb),
    'by_source', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from dim where dim = 'source'), '[]'::jsonb),
    'by_device', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from dim where dim = 'device'), '[]'::jsonb),
    'returning', null, 'code', null, 'rows', '[]'::jsonb, 'truncated', false)
  else (select j from t) || jsonb_build_object(
    'day', p_day, 'generated_at', now(), 'partial', false, 'window_days', 14, 'oldest_day', (select today - 14 from part),
    'tz', 'America/Los_Angeles',
    'visitors', (select count(distinct visitor_hash) from analytics_sessions_counted where id in (select id from ids)),
    'rows', coalesce((select jsonb_agg(r order by started_at desc) from top_rows), '[]'::jsonb),
    'truncated', (select count(*) from sr) > (select n from lim))
  end;
$$;

-- analytics_players: as in 20261019_analytics_day_sessions.sql (5 raw-table reads now go through the *_counted views)
create or replace function public.analytics_players(p_from date, p_to date, p_limit integer default 300) returns jsonb
language sql stable security definer set search_path = public as $$
  with b as (select (least(p_from, p_to)::timestamp at time zone 'America/Los_Angeles') lo, ((greatest(p_from, p_to) + 1)::timestamp at time zone 'America/Los_Angeles') hi,
                    (now() at time zone 'America/Los_Angeles')::date today),
  s as (select s.* from analytics_sessions_counted s, b where s.started_at >= b.lo and s.started_at < b.hi),
  ps as (select * from s where player_id is not null),
  bt as (select bb.session_id, coalesce(sum(bb.engaged_ms), 0)::bigint e, max(bb.ts) last
           from analytics_beats_counted bb where bb.session_id in (select id from ps) group by bb.session_id),
  ar as (select ps.player_id, e.key, sum(e.value::bigint) / 1000 sec
           from analytics_beats_counted bb join ps on ps.id = bb.session_id, jsonb_each_text(bb.area_ms) e
          where e.value ~ '^[0-9]+$' group by 1, 2),
  cn as (select ps.player_id, c.key, sum(c.value::bigint) n
           from analytics_beats_counted bb join ps on ps.id = bb.session_id, jsonb_each_text(bb.counts) c
          where c.value ~ '^[0-9]+$' group by 1, 2),
  fs as (select player_id, min(started_at) first_seen from analytics_sessions_counted
          where player_id in (select player_id from ps) group by player_id),
  p as (select ps.player_id,
               max(greatest(ps.started_at, coalesce(bt.last, ps.started_at))) last_seen,
               count(*) sessions,
               count(distinct (ps.started_at at time zone 'America/Los_Angeles')::date) days,
               coalesce(sum(bt.e), 0) / 1000 seconds,
               coalesce(array_agg(distinct ps.device) filter (where ps.device is not null), '{}') devices,
               coalesce(array_agg(distinct ps.country) filter (where ps.country is not null), '{}') countries,
               coalesce(array_agg(distinct ps.country || '-' || ps.region) filter (where ps.country is not null and ps.region is not null), '{}') regions,
               array_agg(distinct coalesce(ps.utm_source, ps.utm_campaign, ps.referrer_host, 'direct')) sources,
               bool_or(ps.has_code) has_code, bool_or(ps.is_returning) is_ret
          from ps left join bt on bt.session_id = ps.id group by ps.player_id),
  lim as (select least(greatest(coalesce(p_limit, 300), 1), 2000) n),
  top_p as (select * from p order by last_seen desc, player_id limit (select n from lim))
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'generated_at', now(), 'window_days', 14,
    'oldest_day', (select today - 14 from b),
    'partial', least(p_from, p_to) < (select today - 14 from b),
    'players', (select count(*) from p),
    'sessions', (select count(*) from s),
    'unattributed', (select count(*) from s where player_id is null),
    'truncated', (select count(*) from p) > (select n from lim),
    'rows', coalesce((select jsonb_agg(jsonb_build_object(
        'pid', left(encode(sha256(convert_to(top_p.player_id || ':futbol-island-player-v1', 'UTF8')), 'hex'), 12),
        'first_seen', fs.first_seen, 'last_seen', top_p.last_seen, 'sessions', top_p.sessions, 'days_played', top_p.days,
        'seconds', top_p.seconds,
        'areas', coalesce((select jsonb_agg(jsonb_build_object('key', q.key, 'seconds', q.sec) order by q.sec desc, q.key)
                             from (select key, sec from ar where ar.player_id = top_p.player_id and sec > 0 order by sec desc, key limit 3) q), '[]'::jsonb),
        'devices', to_jsonb(top_p.devices), 'countries', to_jsonb(top_p.countries), 'regions', to_jsonb(top_p.regions),
        'sources', to_jsonb(top_p.sources), 'has_code', top_p.has_code, 'returning', top_p.is_ret,
        'counts', jsonb_build_object(
           'balls',     coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'su:ball_find'), 0),
           'fish',      coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'fi:land'), 0),
           'lessons',   coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key like 'lo:%'), 0),
           'quizzes',   coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key like 'lf:%'), 0),
           'swims',     coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'wa:swim_start'), 0),
           'paintings', coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'su:easel_save'), 0),
           'fruit',     coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key like 'su:fruit\_%'), 0),
           'kicks',     coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'su:kick_play'), 0)))
        order by top_p.last_seen desc, top_p.player_id)
      from top_p join fs on fs.player_id = top_p.player_id), '[]'::jsonb));
$$;

-- analytics_player_sessions: as in 20261019_analytics_day_sessions.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_player_sessions(p_pid text, p_limit integer default 200) returns jsonb
language sql stable security definer set search_path = public as $$
  with pl as (select distinct player_id from analytics_sessions_counted
               where coalesce(p_pid, '') ~ '^[0-9a-f]{12}$' and player_id is not null
                 and left(encode(sha256(convert_to(player_id || ':futbol-island-player-v1', 'UTF8')), 'hex'), 12) = p_pid),
  ids as (select id from analytics_sessions_counted where player_id in (select player_id from pl)),
  sr as (select * from analytics_session_rows(array(select id from ids))),
  lim as (select least(greatest(coalesce(p_limit, 200), 1), 1000) n),
  top_rows as (select r, started_at from sr order by started_at desc, id limit (select n from lim)),
  b as (select (now() at time zone 'America/Los_Angeles')::date today)
  select analytics_rows_totals(coalesce((select jsonb_agg(r) from sr), '[]'::jsonb)) || jsonb_build_object(
    'pid', case when exists (select 1 from pl) then p_pid end,
    'generated_at', now(), 'window_days', 14, 'oldest_day', (select today - 14 from b),
    'first_seen', (select min(started_at) from sr), 'last_seen', (select max(seen) from sr),
    'days_played', (select count(distinct (started_at at time zone 'America/Los_Angeles')::date) from sr),
    -- Their history may go back further than the kept rows: the first kept session is within a day of the purge line.
    'partial', coalesce((select min(started_at) from sr) < (((select today - 13 from b))::timestamp at time zone 'America/Los_Angeles'), false),
    'truncated', (select count(*) from sr) > (select n from lim),
    'rows', coalesce((select jsonb_agg(r order by started_at desc) from top_rows), '[]'::jsonb));
$$;

-- analytics_sponsor_split: as in 20261021_analytics_sponsor_split.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_sponsor_split(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with s as (select id, coalesce(device, '(unknown)') device, coalesce(country, '(unknown)') country
               from analytics_sessions_counted where day between least(p_from, p_to) and greatest(p_from, p_to)),
  b as (select b.session_id, b.counts, b.activity_ms from analytics_beats_counted b join s on s.id = b.session_id),
  m as (select b.session_id, analytics_sponsor_metric(c.key) metric, sum(c.value::bigint) n
          from b, jsonb_each_text(b.counts) c where c.value ~ '^[0-9]+$' and analytics_sponsor_metric(c.key) is not null
         group by 1, 2
        union all
        select b.session_id, 'readingMs', sum((b.activity_ms->>'book')::bigint)
          from b where coalesce(b.activity_ms->>'book', '') ~ '^[0-9]+$' group by 1),
  per as (select s.id, s.device, s.country, m.metric, coalesce(m.n, 0) n from s left join m on m.session_id = s.id),
  dim as (select 'device' d, device k, id, metric, n from per union all select 'country', country, id, metric, n from per),
  tot as (select d, k, count(distinct id) sessions from dim group by 1, 2),
  met as (select d, k, metric, sum(n) n from dim where metric is not null group by 1, 2, 3),
  rows as (select t.d, t.k, t.sessions, coalesce((select jsonb_object_agg(metric, n) from met where met.d = t.d and met.k = t.k), '{}'::jsonb) metrics from tot t),
  wh as (select d, sum(sessions) sessions from rows where sessions < 5 group by 1),
  whm as (select met.d, met.metric, sum(met.n) n from met join rows r on r.d = met.d and r.k = met.k and r.sessions < 5 group by 1, 2)
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'window_days', 14, 'min_sessions', 5,
    'sessions', (select count(*) from s),
    'devices',   coalesce((select jsonb_agg(jsonb_build_object('key', k, 'sessions', sessions, 'metrics', metrics) order by sessions desc, k) from rows where d = 'device' and sessions >= 5), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'sessions', sessions, 'metrics', metrics) order by sessions desc, k) from rows where d = 'country' and sessions >= 5), '[]'::jsonb),
    'withheld', jsonb_build_object(
       'devices',   jsonb_build_object('sessions', coalesce((select sessions from wh where d = 'device'), 0),  'metrics', coalesce((select jsonb_object_agg(metric, n) from whm where d = 'device'), '{}'::jsonb)),
       'countries', jsonb_build_object('sessions', coalesce((select sessions from wh where d = 'country'), 0), 'metrics', coalesce((select jsonb_object_agg(metric, n) from whm where d = 'country'), '{}'::jsonb))));
$$;

-- analytics_party_retention: as in 20261108_party_retention_exact.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_party_retention(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with w as (select greatest(least(p_from, p_to), (now() at time zone 'utc')::date - 14) f,
                    least(greatest(p_from, p_to), (now() at time zone 'utc')::date) t,
                    least(greatest(p_from, p_to), (now() at time zone 'utc')::date - 1) l),
  s as (select a.id, a.day, a.player_id, a.is_returning from analytics_sessions_counted a, w where a.day between w.f and w.t),
  n as (select b.session_id, c.key, sum(c.value::bigint) v
          from analytics_beats_counted b join s on s.id = b.session_id, jsonb_each_text(b.counts) c
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
            'players',     coalesce(g.players, 0),
            'd1_eligible', coalesce(g.d1_n, 0),
            'd1_rate',     case when coalesce(g.d1_n, 0) > 0 then round(g.d1_back::numeric / g.d1_n, 4) end,
            'd7_eligible', coalesce(g.d7_n, 0),
            'd7_rate',     case when coalesce(g.d7_n, 0) > 0 then round(g.d7_back::numeric / g.d7_n, 4) end) j
           from (values ('party'), ('solo')) k(grp) left join g on g.grp = k.grp),
  np as (select count(*) filter (where is_returning = false) total,
                count(*) filter (where is_returning = false and invited) inv,
                count(*) filter (where is_returning = false and not invited) org
           from sc),
  vt as (select coalesce(sum(v) filter (where key = 'mp:guest_new'), 0) gnew, coalesce(sum(v) filter (where key = 'mp:created'), 0) created from n)
  select jsonb_build_object(
    'from', w.f, 'to', w.t, 'last_complete_day', w.l, 'window_days', 14, 'min_group', 1,
    'groups', (select jsonb_object_agg(grp, j) from gj),
    'new_players', jsonb_build_object(
       'sessions', np.total,
       'invited',  np.inv,
       'organic',  np.org),
    'virality', jsonb_build_object(
       'guest_new', vt.gnew,
       'created',   vt.created))
  from w, np, vt;
$$;

-- analytics_sponsor_week_snapshot: as in 20261022_analytics_party_retention.sql (2 raw-table reads now go through the *_counted views)
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
      from analytics_sessions_counted s
      cross join lateral (select coalesce(sum(b.engaged_ms), 0) ms,
                                 coalesce(bool_or(coalesce(b.counts->>'mp:in', '') ~ '^[1-9][0-9]*$'), false) party
                            from analytics_beats_counted b where b.session_id = s.id) p
     where s.day between wk and wk + 6
    on conflict (week_start) do nothing;
    if found then stored := stored + 1; end if;
  end loop;
  return stored;
end;
$$;

-- analytics_fishing_sessions: as in 20261106_analytics_fishing_sessions.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_fishing_sessions(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with per_session as (
    select b.session_id,
           sum(coalesce((b.counts->>'fi:start')::integer, 0)) as starts,
           sum(coalesce((b.counts->>'fi:cast')::integer, 0)) as casts,
           sum(coalesce((b.counts->>'fi:hook_spin')::integer, 0) + coalesce((b.counts->>'fi:hook_easy')::integer, 0)) as fights,
           sum(coalesce((b.counts->>'fi:land')::integer, 0)) as landed
      from analytics_beats_counted b
      join analytics_sessions_counted s on s.id = b.session_id
     where s.day between least(p_from, p_to) and greatest(p_from, p_to)
       and (b.counts ? 'fi:start' or b.counts ? 'fi:cast' or b.counts ? 'fi:hook_spin' or b.counts ? 'fi:hook_easy' or b.counts ? 'fi:land')
     group by b.session_id
  )
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'window_days', 14,
    'sessions', count(*),
    'never_hooked', count(*) filter (where fights = 0),
    'cast_never_hooked', count(*) filter (where casts > 0 and fights = 0),
    'fights', coalesce(sum(fights), 0),
    'landed', coalesce(sum(landed), 0),
    'buckets', jsonb_build_object(
      '0',   count(*) filter (where fights = 0),
      '1',   count(*) filter (where fights = 1),
      '2-3', count(*) filter (where fights between 2 and 3),
      '4-6', count(*) filter (where fights between 4 and 6),
      '7+',  count(*) filter (where fights >= 7)))
  from per_session;
$$;

-- analytics_play_modes: as in 20261120_analytics_play_modes.sql (2 raw-table reads now go through the *_counted views)
create or replace function public.analytics_play_modes(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with b as (select least(p_from, p_to) f, greatest(p_from, p_to) t, (now() at time zone 'America/Los_Angeles')::date today),
  r as (select (b.f::timestamp at time zone 'America/Los_Angeles') lo, ((b.t + 1)::timestamp at time zone 'America/Los_Angeles') hi from b),
  s as (select s.id, s.player_id, s.is_returning, (s.started_at at time zone 'America/Los_Angeles')::date d
          from analytics_sessions_counted s, r where s.started_at >= r.lo and s.started_at < r.hi),
  bm as (select s.d, s.id, s.player_id, s.is_returning, substr(c.key, 4) m, coalesce(bb.engaged_ms, 0)::bigint e
           from analytics_beats_counted bb join s on s.id = bb.session_id, jsonb_each_text(bb.counts) c
          where c.key in ('pm:s', 'pm:w', 'pm:p') and c.value ~ '^[1-9][0-9]*$'),
  dm as (select d, m, count(distinct id) n, sum(e) / 1000 sec, count(distinct player_id) p,
                count(distinct id) filter (where is_returning) ret
           from bm group by d, m),
  tm as (select m, count(distinct id) n, sum(e) / 1000 sec, count(distinct player_id) p,
                count(distinct id) filter (where is_returning) ret
           from bm group by m),
  dd as (select d, count(*) n from s group by d),
  dw as (select d, count(distinct id) n from bm group by d)
  select jsonb_build_object(
    'from', (select f from b), 'to', (select t from b), 'generated_at', now(), 'window_days', 14,
    'oldest_day', (select today - 14 from b),
    'days', coalesce((select jsonb_agg(jsonb_build_object('day', dd.d, 'sessions', dd.n, 'with_mode', coalesce(dw.n, 0),
              'modes', coalesce((select jsonb_object_agg(dm.m, jsonb_build_object('sessions', dm.n, 'seconds', dm.sec, 'players', dm.p, 'returning', dm.ret))
                                   from dm where dm.d = dd.d), '{}'::jsonb)) order by dd.d)
             from dd left join dw on dw.d = dd.d), '[]'::jsonb),
    'totals', jsonb_build_object('sessions', (select count(*) from s), 'with_mode', (select count(distinct id) from bm),
              'modes', coalesce((select jsonb_object_agg(m, jsonb_build_object('sessions', n, 'seconds', sec, 'players', p, 'returning', ret)) from tm), '{}'::jsonb)));
$$;

-- analytics_daily_people (docs/analytics-proposed/analytics_daily_people.sql): filtered only if it is already installed, so this
-- file never turns on a function the owner has not chosen to run.
do $outer$ begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'analytics_daily_people') then
    execute $fn$
create or replace function public.analytics_daily_people(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with b as (select least(p_from, p_to) lo, greatest(p_from, p_to) hi, (now() at time zone 'America/Los_Angeles')::date today),
  s as (select (started_at at time zone 'America/Los_Angeles')::date d, player_id, is_returning from analytics_sessions_counted),
  days as (
    select s.d as day, count(*) as sessions, count(distinct s.player_id) players,
           count(*) filter (where s.is_returning is true) returning_n,
           count(*) filter (where s.is_returning is false) new_n,
           count(*) filter (where s.is_returning is null) unknown_n
      from s, b where s.d between b.lo and b.hi group by s.d),
  pd as (select distinct player_id, d from s where player_id is not null),
  first_seen as (select player_id, min(d) d0 from pd group by player_id),
  cohorts as (
    select f.d0 as day, count(*) as players,
           case when f.d0 + 1 < (select today from b) then count(*) filter (where exists (select 1 from pd where pd.player_id = f.player_id and pd.d = f.d0 + 1)) end as d1,
           case when f.d0 + 7 < (select today from b) then count(*) filter (where exists (select 1 from pd where pd.player_id = f.player_id and pd.d = f.d0 + 7)) end as d7
      from first_seen f, b where f.d0 between b.lo and b.hi group by f.d0)
  select jsonb_build_object(
    'window_days', 14, 'from', (select lo from b), 'to', (select hi from b),
    'days', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'sessions', sessions, 'players', players, 'returning', returning_n, 'new', new_n, 'unknown', unknown_n) order by day) from days), '[]'::jsonb),
    'cohorts', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'players', players, 'd1', d1, 'd7', d7) order by day) from cohorts), '[]'::jsonb));
$$;
    $fn$;
  end if;
end $outer$;

-- One whole Pacific day, as in 20261012_admin_pacific_time.sql, marked as computed with staff left out.
create or replace function public.analytics_pt_day_rollup(p_day date) returns jsonb
language sql stable security invoker set search_path = public as $$
  select analytics_window_rollup(p_day, p_day::timestamp at time zone 'America/Los_Angeles', (p_day + 1)::timestamp at time zone 'America/Los_Angeles')
         || jsonb_build_object('staffExcluded', true);
$$;

-- Rewrite the frozen Pacific rollups of [p_from, p_to] from the raw rows, with staff left out. Only days whose raw rows are
-- complete (the Pacific today − 13 … yesterday) and that are already frozen; any other day in the range is skipped and listed.
-- Returns {recomputed:[days], skipped:[days], oldest_possible:<date>}. Idempotent: run it as often as you like.
create or replace function public.analytics_recompute_rollups(p_from date, p_to date) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare
  today date := (now() at time zone 'America/Los_Angeles')::date;
  lo date := least(p_from, p_to); hi date := greatest(p_from, p_to);
  d date; done jsonb := '[]'::jsonb; skipped jsonb := '[]'::jsonb;
begin
  if hi - lo > 60 then raise exception 'at most 60 days at a time'; end if;
  for d in select g::date from generate_series(lo, hi, interval '1 day') g loop
    if d >= today - 13 and d < today and exists (select 1 from analytics_daily_pt where day = d) then
      update analytics_daily_pt set data = analytics_pt_day_rollup(d), computed_at = now() where day = d;
      done := done || to_jsonb(d::text);
    else
      skipped := skipped || to_jsonb(d::text);
    end if;
  end loop;
  return jsonb_build_object('recomputed', done, 'skipped', skipped, 'oldest_possible', today - 13);
end $$;

revoke all on function public.analytics_pt_day_rollup(date), public.analytics_recompute_rollups(date, date) from public, anon, authenticated;
grant execute on function public.analytics_pt_day_rollup(date), public.analytics_recompute_rollups(date, date) to service_role;

-- Self-check: the last result of this file.
select case when exists (select 1 from pg_class where relname = 'analytics_excluded')
    and exists (select 1 from pg_views where viewname = 'analytics_sessions_counted')
    and exists (select 1 from pg_proc where proname = 'analytics_window_rollup' and prosrc like '%analytics_sessions_counted%')
    and exists (select 1 from pg_proc where proname = 'analytics_live_sessions' and prosrc like '%analytics_sessions_counted%')
    and exists (select 1 from pg_proc where proname = 'analytics_players' and prosrc like '%analytics_sessions_counted%')
    and exists (select 1 from pg_proc where proname = 'analytics_pt_day_rollup' and prosrc like '%staffExcluded%')
    and exists (select 1 from pg_proc where proname = 'analytics_recompute_rollups')
  then 'OK, staff exclusion installed' else 'NOT INSTALLED: staff exclusion' end as status;
