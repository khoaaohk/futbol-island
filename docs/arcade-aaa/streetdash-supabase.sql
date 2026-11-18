-- Futbol Island: Street Dash, the arcade's side-scrolling run (Nov 17 2026; lib/arcade/streetdash/core.ts, lib/arcade/leaderboard.ts
-- BOARD_GAMES 'streetdash', lib/analytics/islandIds.ts 'arcade_streetdash').
-- A SUPERSET of docs/arcade-aaa/lineup-supabase.sql: the same statements with 'streetdash' added after 'lineup' in the board allow-list
-- and 'arcade_streetdash' after 'arcade_lineup' in analytics_ingest. Paste THIS file instead of the Line Up! one (or after it; both
-- orders end in the same state). Safe to run twice.
-- NOT APPLIED. Paste once into the Supabase SQL editor, AFTER every other board and analytics file. It does two things:
--   1. the board ids 'lineup' and 'streetdash' in the arcade_scores game allow-list (Street Dash's one all-time board; the Daily
--      Dash's first run of the day posts to the same board, later daily runs are practice);
--   2. the activity keys 'arcade_lineup' and 'arcade_streetdash' in analytics_ingest (play time in the admin activity chart). The
--      function is replaced in place by the body of supabase/migrations/20261119_analytics_stadium.sql (the newest analytics_ingest
--      before these games) with those keys added; every key, place and cell allowed before is still allowed.
-- Additive in effect: no row, column or grant changes; no board is renamed or reset and every existing score stays.
-- Until it runs: the Street Dash board answers "unavailable" and the game keeps the best score on the device; its play time is
-- simply missing from the admin activity chart. Nothing else changes.
-- supabase/migrations/20261125_streetdash_boards.sql and 20261126_analytics_streetdash.sql are the same statements, kept so the
-- migrations folder, replayed in order, ends complete.
-- NOTE for the coordinator: trophydrop and clearbox widen the same allow-list and the same function on their own branches;
-- whichever file runs LAST must name every id, so merge their lists into one file before the owner pastes it.
-- The LAST result row must read "OK, Street Dash board installed".

-- 0. The score ceiling (the same block as docs/arcade-aaa/airhockey-supabase.sql; Line Up! and Street Dash are endless, ceiling 3,000,000). The first migration declared the check inline, so Postgres named it arcade_scores_score_check; the loop
--    also removes it under any other name (any check on this table that reads the score column), then the one check is added back.
do $$
declare c record;
begin
  if to_regclass('public.arcade_scores') is null then return; end if;
  for c in select conname from pg_constraint
    where conrelid = to_regclass('public.arcade_scores') and contype = 'c'
      and pg_get_constraintdef(oid) like '%score >= 1%' and pg_get_constraintdef(oid) like '%score <=%'
  loop
    execute format('alter table public.arcade_scores drop constraint %I', c.conname);
  end loop;
  alter table public.arcade_scores add constraint arcade_scores_score_check check (score between 1 and 9000000);
end $$;

-- 1. The game allow-list: every board id in lib/arcade/leaderboard.ts BOARD_GAMES, with 'lineup' (Line Up!) and 'streetdash' (Street Dash) added.
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily', 'airhockey', 'lineup', 'streetdash'));

-- 2. The arcade activity key for the admin analytics (skipped when the analytics tables are not installed).
do $guard$
begin
  if to_regclass('public.analytics_sessions') is null then return; end if;
  execute $ingest$
create or replace function public.analytics_ingest(p jsonb) returns void
language plpgsql security invoker set search_path = public as $$
declare
  v_id text := p->>'session';
  v_e  integer;
begin
  if p->>'type' = 'start' then
    insert into analytics_sessions (id, day, visitor_hash, entry_path, country, region, device, source,
                                    referrer_host, utm_source, utm_medium, utm_campaign, is_returning, has_code, player_id, flags)
    select v_id, (p->>'day')::date, p->>'visitor_hash', p->>'path', p->>'country', p->>'region', p->>'device', p->>'source',
           p->>'referrer_host', p->>'utm_source', p->>'utm_medium', p->>'utm_campaign',
           case when jsonb_typeof(p->'is_returning') = 'boolean' then (p->>'is_returning')::boolean end,
           case when jsonb_typeof(p->'has_code') = 'boolean' then (p->>'has_code')::boolean end,
           case when jsonb_typeof(p->'player_id') = 'string' and p->>'player_id' ~ '^[0-9a-f]{32}$' then p->>'player_id' end,
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
             where key in ('island_square','arcade','konbini','coaches','library_square','community_park','old_town','field_7v7','field_futsal','palm_coast','west_side','field_9v9','club_grounds','community_hall','community_garden','farmers_market','east_jetty','field_11v11','school','museum','south_pier','ferry_dock','north_beach','town','causeway','sandbars','deep_sea_boat','cay_town','cay_konbini','hostel','farm','beach_court','sharks_beach','coral_cay','summit_sandbar','summit_pitch','summit_isle','stadium','stadium_plaza','stadium_park','west_beach','sea')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'activity_ms') = 'object' then p->'activity_ms' else '{}'::jsonb end)
             where key in ('walk','ride','fly','boat','fishing','job','lesson','watch','quiz','book','cards','films','vending','talk','coaches','paths','menu','arcade_lobby','arcade_live','arcade_runner','arcade_tennis','arcade_pinball','arcade_puzzle','arcade_snake','arcade_airhockey','arcade_lineup','arcade_streetdash','museum_hall','exhibit_timeline','exhibit_laws-1863','exhibit_penalty-1891','exhibit_stadiums','exhibit_boots','exhibit_var-2018','exhibit_worldcup-1930','exhibit_wwc-1991','exhibit_futsal-1989','exhibit_laced-leather','exhibit_telstar-1970','exhibit_shirts','exhibit_hall-of-fame','exhibit_ballon-dor','exhibit_first-international-1872','exhibit_offside-rules','exhibit_formations-history','exhibit_floodlights-1878','exhibit_copa-america-1916','exhibit_keeper-hands-1912','exhibit_free-kick-wall','exhibit_ball-curve','exhibit_throw-in','konbini_shop','kit_shop','kit_studio','swim','controller','other','idle')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, v), '{}'::jsonb) from (
              select key, least(value::integer, v_e / 1000) v
                from jsonb_each_text(case when jsonb_typeof(p->'cells') = 'object' then p->'cells' else '{}'::jsonb end)
               where key ~ '^(0|[1-9][0-9]{0,3})$' and key::integer < 1891 and value ~ '^[0-9]{1,4}$' and value::integer > 0
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
$ingest$;
  execute 'revoke all on function public.analytics_ingest(jsonb) from public, anon, authenticated';
  execute 'grant execute on function public.analytics_ingest(jsonb) to service_role';
end $guard$;

-- Self-check: the last result. "OK, Street Dash board installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, Street Dash board installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_score_check'
      and pg_get_constraintdef(oid) like '%9000000%') then 'score check 1..9000000' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''snakedaily''%' and pg_get_constraintdef(oid) like '%''airhockey''%'
      and pg_get_constraintdef(oid) like '%''lineup''%' and pg_get_constraintdef(oid) like '%''streetdash''%') then 'game check with every board id (lineup and streetdash included)' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_airhockey%' and prosrc like '%arcade_lineup%' and prosrc like '%arcade_streetdash%' and prosrc like '%stadium_plaza%' and prosrc like '%< 1891%') then 'analytics_ingest with the arcade_lineup and arcade_streetdash activities' end
  ) as missing) x;
