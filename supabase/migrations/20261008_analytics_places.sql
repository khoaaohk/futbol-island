-- Futbol Island admin analytics, part 2 (Oct 8 2026): WHERE on the island players spend their time.
-- Run ONCE in the Supabase SQL editor, AFTER 20261007_analytics.sql (which is already live). Additive and safe on the live DB:
--  * three new jsonb columns on analytics_beats with a '{}' default (a metadata-only change; existing rows read as empty);
--  * analytics_ingest and analytics_day_rollup are replaced in place (same signatures, so grants and the cron are untouched);
--  * nothing is dropped, renamed or rewritten; already-frozen analytics_daily rows simply have no place data.
-- The app works before and after this runs: until then the old ingest ignores the new keys.
--
-- What is stored (privacy, a kids' game): per beat, ms per FIXED place id, ms per FIXED activity id and seconds per 20 m
-- heat-map cell (an index into a fixed grid, at most 64 per beat). Never a position list, an order of places, or a time
-- per position, so no route can be rebuilt. Raw beats still go after 14 days; the nightly analytics_finalize() freezes the
-- daily totals (placeMs, placeSessions, activityMs, cells) into analytics_daily, kept for good.
-- Ids and limits mirror lib/analytics/islandIds.ts (tests/admin-analytics-places.cjs checks they agree).
-- Also: the region dimension keeps up to 1000 keys per day (was 100) for the per-country state/province breakdown.

alter table public.analytics_beats add column if not exists place_ms    jsonb not null default '{}'::jsonb;
alter table public.analytics_beats add column if not exists activity_ms jsonb not null default '{}'::jsonb;
alter table public.analytics_beats add column if not exists cells       jsonb not null default '{}'::jsonb;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'analytics_beats_place_split_shape') then
    alter table public.analytics_beats add constraint analytics_beats_place_split_shape
      check (jsonb_typeof(place_ms) = 'object' and jsonb_typeof(activity_ms) = 'object' and jsonb_typeof(cells) = 'object');
  end if;
end $$;

-- One event, one insert (unchanged for starts). A beat's place/activity split keeps known ids only, each value capped at the
-- beat's clamped foreground ms; cells keep valid grid indices (0..1611), whole seconds capped at the beat's
-- seconds, the busiest 64 only.
create or replace function public.analytics_ingest(p jsonb) returns void
language plpgsql security invoker set search_path = public as $$
declare
  v_id text := p->>'session';
  v_e  integer;
begin
  if p->>'type' = 'start' then
    insert into analytics_sessions (id, day, visitor_hash, entry_path, country, region, device, source,
                                    referrer_host, utm_source, utm_medium, utm_campaign)
    select v_id, (p->>'day')::date, p->>'visitor_hash', p->>'path', p->>'country', p->>'region', p->>'device', p->>'source',
           p->>'referrer_host', p->>'utm_source', p->>'utm_medium', p->>'utm_campaign'
    where (select count(*) from analytics_sessions where day = (p->>'day')::date and visitor_hash = p->>'visitor_hash') < 150
    on conflict (id) do nothing;
  elsif p->>'type' = 'beat' then
    v_e := least(greatest(coalesce((p->>'engaged_ms')::integer, 0), 0), 300000);
    insert into analytics_beats (session_id, engaged_ms, pageviews, area_ms, place_ms, activity_ms, cells)
    select s.id,
           v_e,
           least(greatest(coalesce((p->>'pageviews')::integer, 0), 0), 100),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, 300000)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'area_ms') = 'object' then p->'area_ms' else '{}'::jsonb end)
             where key in ('island','paths','arcade','museum','konbini','controller','other') and value ~ '^[0-9]{1,7}$'),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'place_ms') = 'object' then p->'place_ms' else '{}'::jsonb end)
             where key in ('island_square','arcade','konbini','coaches','library_square','community_park','old_town','field_7v7','field_futsal','palm_coast','west_side','field_9v9','club_grounds','community_hall','community_garden','farmers_market','east_jetty','field_11v11','school','museum','south_pier','ferry_dock','north_beach','town','causeway','sandbars','deep_sea_boat','cay_town','cay_konbini','hostel','farm','beach_court','sharks_beach','coral_cay','sea')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'activity_ms') = 'object' then p->'activity_ms' else '{}'::jsonb end)
             where key in ('walk','ride','fly','boat','fishing','job','lesson','watch','quiz','book','cards','films','vending','talk','coaches','paths','menu','arcade_lobby','arcade_live','arcade_runner','arcade_tennis','arcade_pinball','arcade_puzzle','museum_hall','exhibit_timeline','exhibit_laws-1863','exhibit_penalty-1891','exhibit_cards-1970','exhibit_backpass-1992','exhibit_var-2018','exhibit_worldcup-1930','exhibit_wwc-1991','exhibit_futsal-1989','exhibit_laced-leather','exhibit_telstar-1970','exhibit_shirts','exhibit_hall-of-fame','konbini_shop','controller','other','idle')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, v), '{}'::jsonb) from (
              select key, least(value::integer, v_e / 1000) v
                from jsonb_each_text(case when jsonb_typeof(p->'cells') = 'object' then p->'cells' else '{}'::jsonb end)
               where key ~ '^(0|[1-9][0-9]{0,3})$' and key::integer < 1612 and value ~ '^[0-9]{1,4}$' and value::integer > 0
               order by value::integer desc, key::integer limit 64) c where v > 0)
      from analytics_sessions s
     where s.id = v_id
       and s.started_at > now() - interval '24 hours'
       and (select count(*) from analytics_beats b where b.session_id = s.id) < 300;
  end if;
end $$;

-- One UTC day's rollup, now with the place/activity/cell totals (same rules as rollupDay in lib/analytics/core.ts): placeMs
-- and placeSessions (sessions that spent any time there, for the per-session average), activityMs, and cells (seconds per
-- grid cell). The nightly analytics_finalize() calls this, so frozen days keep these totals for good.
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
  select bb.session_id, bb.place_ms, bb.activity_ms, bb.cells
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
  'cells',     (select obj from cellsum));
$$;

revoke all on function public.analytics_ingest(jsonb), public.analytics_day_rollup(date) from public, anon, authenticated;
grant execute on function public.analytics_ingest(jsonb), public.analytics_day_rollup(date) to service_role;
