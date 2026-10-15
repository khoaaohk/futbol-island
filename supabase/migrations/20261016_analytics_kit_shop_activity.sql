-- Futbol Island admin analytics (Oct 16 2026): the Kit Shop's own activities. Time inside the Kit Shop (/shop) was booked as
-- "Other / loading" in "What they're doing", because the shop had no activity id of its own. Two activity keys are added:
--   kit_shop    walking around the Kit Shop (lib/analytics/tracker.ts: the 'shop' area's default activity)
--   kit_studio  designing in the jersey, boot or ball studio (components/shop/ShopRoom.tsx, while a studio is open)
-- Run ONCE in the Supabase SQL editor (or `supabase db push`), AFTER 20261015_analytics_summit_kit.sql. Paste the WHOLE file.
-- The LAST result must be one row:
--   status = OK, kit shop activities installed
--
-- Additive and safe on the live DB, and safe to run twice: analytics_ingest is replaced in place (same signature, the same
-- body as in 20261015_analytics_summit_kit.sql except the two new keys in the activity_ms allow-list; every key allowed
-- before is still allowed). lib/analytics/core.ts AREAS and lib/analytics/islandIds.ts PLACES / ACTIVITIES are the reference;
-- tests/admin-analytics-coverage.cjs checks that every key the client can send is in the LATEST analytics_ingest and replays
-- every migration into a throwaway Postgres to prove none is dropped. Nothing is dropped or rewritten: old rows are untouched,
-- and analytics_schema_version() stays as it is.
--
-- The app works before and after this runs: until then, the two new activity keys are silently dropped by the old allow-list
-- (never an error; the beat, its area time and everything else in it still count), so Kit Shop time is simply missing from
-- the activity chart instead of showing as "Other / loading". The Island Tutorial's new counters (tu:open, tu:finish) ride the
-- existing learning-counter channel (`k`) and need no migration.

create or replace function public.analytics_ingest(p jsonb) returns void
language plpgsql security invoker set search_path = public as $$
declare
  v_id text := p->>'session';
  v_e  integer;
begin
  if p->>'type' = 'start' then
    insert into analytics_sessions (id, day, visitor_hash, entry_path, country, region, device, source,
                                    referrer_host, utm_source, utm_medium, utm_campaign, flags)
    select v_id, (p->>'day')::date, p->>'visitor_hash', p->>'path', p->>'country', p->>'region', p->>'device', p->>'source',
           p->>'referrer_host', p->>'utm_source', p->>'utm_medium', p->>'utm_campaign',
           (select coalesce(jsonb_object_agg(key, value::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'flags') = 'object' then p->'flags' else '{}'::jsonb end)
             where (key = 'p' and value in ('0','1','2','3')) or (key = 'g' and value in ('0','1','2','3','4'))
                or (key = 's' and value ~ '^([0-9]|1[0-5])$') or (key = 'v' and value in ('0','1','2','3')))
    where (select count(*) from analytics_sessions where day = (p->>'day')::date and visitor_hash = p->>'visitor_hash') < 150
    on conflict (id) do nothing;
  elsif p->>'type' = 'beat' then
    v_e := least(greatest(coalesce((p->>'engaged_ms')::integer, 0), 0), 300000);
    insert into analytics_beats (session_id, engaged_ms, pageviews, area_ms, place_ms, activity_ms, cells, counts)
    select s.id,
           v_e,
           least(greatest(coalesce((p->>'pageviews')::integer, 0), 0), 100),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, 300000)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'area_ms') = 'object' then p->'area_ms' else '{}'::jsonb end)
             where key in ('island','paths','arcade','museum','konbini','shop','controller','other') and value ~ '^[0-9]{1,7}$'),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'place_ms') = 'object' then p->'place_ms' else '{}'::jsonb end)
             where key in ('island_square','arcade','konbini','coaches','library_square','community_park','old_town','field_7v7','field_futsal','palm_coast','west_side','field_9v9','club_grounds','community_hall','community_garden','farmers_market','east_jetty','field_11v11','school','museum','south_pier','ferry_dock','north_beach','town','causeway','sandbars','deep_sea_boat','cay_town','cay_konbini','hostel','farm','beach_court','sharks_beach','coral_cay','summit_sandbar','summit_pitch','summit_isle','sea')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'activity_ms') = 'object' then p->'activity_ms' else '{}'::jsonb end)
             where key in ('walk','ride','fly','boat','fishing','job','lesson','watch','quiz','book','cards','films','vending','talk','coaches','paths','menu','arcade_lobby','arcade_live','arcade_runner','arcade_tennis','arcade_pinball','arcade_puzzle','museum_hall','exhibit_timeline','exhibit_laws-1863','exhibit_penalty-1891','exhibit_stadiums','exhibit_boots','exhibit_var-2018','exhibit_worldcup-1930','exhibit_wwc-1991','exhibit_futsal-1989','exhibit_laced-leather','exhibit_telstar-1970','exhibit_shirts','exhibit_hall-of-fame','exhibit_ballon-dor','exhibit_first-international-1872','exhibit_offside-rules','exhibit_formations-history','exhibit_floodlights-1878','exhibit_copa-america-1916','exhibit_keeper-hands-1912','exhibit_free-kick-wall','exhibit_ball-curve','exhibit_throw-in','konbini_shop','kit_shop','kit_studio','controller','other','idle')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, v), '{}'::jsonb) from (
              select key, least(value::integer, v_e / 1000) v
                from jsonb_each_text(case when jsonb_typeof(p->'cells') = 'object' then p->'cells' else '{}'::jsonb end)
               where key ~ '^(0|[1-9][0-9]{0,3})$' and key::integer < 1612 and value ~ '^[0-9]{1,4}$' and value::integer > 0
               order by value::integer desc, key::integer limit 64) c where v > 0),
           (select coalesce(jsonb_object_agg(key, v), '{}'::jsonb) from (
              select key, least(value::integer, 50) v
                from jsonb_each_text(case when jsonb_typeof(p->'counts') = 'object' then p->'counts' else '{}'::jsonb end)
               where key ~ '^[a-z]{1,2}:[A-Za-z0-9_]{1,40}(:[A-Za-z0-9_]{1,12}){0,2}$' and value ~ '^[0-9]{1,6}$' and value::integer > 0
               order by value::integer desc, key collate "C" limit 64) k)
      from analytics_sessions s
     where s.id = v_id
       and s.started_at > now() - interval '24 hours'
       and (select count(*) from analytics_beats b where b.session_id = s.id) < 300;
  end if;
end $$;

revoke all on function public.analytics_ingest(jsonb) from public, anon, authenticated;
grant execute on function public.analytics_ingest(jsonb) to service_role;

-- Self-check: the last result of this file.
select case when exists (select 1 from pg_proc where proname = 'analytics_ingest' and prosrc like '%kit_studio%' and prosrc like '%kit_shop%'
    and prosrc like '%''shop''%' and prosrc like '%summit_sandbar%' and prosrc like '%exhibit_throw-in%' and prosrc like '%konbini_shop%')
  then 'OK, kit shop activities installed' else 'NOT INSTALLED: analytics_ingest (kit_shop / kit_studio activities)' end as status;
