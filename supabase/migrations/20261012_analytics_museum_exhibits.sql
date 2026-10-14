-- Futbol Island admin analytics (Oct 12 2026): two museum exhibits were replaced, so their activity keys change.
--   exhibit_cards-1970    -> exhibit_stadiums  ("Stadiums of the World" replaced the yellow and red cards)
--   exhibit_backpass-1992 -> exhibit_boots     ("Boots through time" replaced the back-pass rule)
-- Run ONCE in the Supabase SQL editor, AFTER 20261009_analytics_counts.sql (and 20261009_analytics_start.sql). Paste the WHOLE
-- file. The LAST result must be one row:   status = OK, museum exhibits updated
--
-- Additive and safe on the live DB: analytics_ingest is replaced in place (same signature, the same body as in
-- 20261009_analytics_counts.sql except the two activity keys in its allowlist; lib/analytics/islandIds.ts ACTIVITIES is the
-- reference). Nothing is dropped or rewritten: old rows keep their exhibit_cards-1970 / exhibit_backpass-1992 totals, and
-- analytics_schema_version() stays as it is. Until this runs, time in the two new exhibits is simply not counted.

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
             where key in ('island','paths','arcade','museum','konbini','controller','other') and value ~ '^[0-9]{1,7}$'),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'place_ms') = 'object' then p->'place_ms' else '{}'::jsonb end)
             where key in ('island_square','arcade','konbini','coaches','library_square','community_park','old_town','field_7v7','field_futsal','palm_coast','west_side','field_9v9','club_grounds','community_hall','community_garden','farmers_market','east_jetty','field_11v11','school','museum','south_pier','ferry_dock','north_beach','town','causeway','sandbars','deep_sea_boat','cay_town','cay_konbini','hostel','farm','beach_court','sharks_beach','coral_cay','sea')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'activity_ms') = 'object' then p->'activity_ms' else '{}'::jsonb end)
             where key in ('walk','ride','fly','boat','fishing','job','lesson','watch','quiz','book','cards','films','vending','talk','coaches','paths','menu','arcade_lobby','arcade_live','arcade_runner','arcade_tennis','arcade_pinball','arcade_puzzle','museum_hall','exhibit_timeline','exhibit_laws-1863','exhibit_penalty-1891','exhibit_stadiums','exhibit_boots','exhibit_var-2018','exhibit_worldcup-1930','exhibit_wwc-1991','exhibit_futsal-1989','exhibit_laced-leather','exhibit_telstar-1970','exhibit_shirts','exhibit_hall-of-fame','konbini_shop','controller','other','idle')
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
select case when exists (select 1 from pg_proc where proname = 'analytics_ingest' and prosrc like '%exhibit_stadiums%' and prosrc like '%exhibit_boots%' and prosrc like '%counts%')
  then 'OK, museum exhibits updated' else 'NOT INSTALLED: analytics_ingest (exhibit_stadiums, exhibit_boots)' end as status;
