-- Futbol Island: the arcade release of Nov 22 2026: Flick It ('flickit', flick free kicks), FootGolf Island ('footgolf', nine holes
-- of footgolf), Pop-Up Shot ('popup', volleys and headers; it takes Hold the Line's machine) and the Claw Club (the claw machine).
-- FOR THE OWNER. Paste this whole file into the Supabase SQL editor and press Run. Paste it once; running it again is harmless.
-- It REPLACES the per-game files (flickit/footgolf/popup-supabase.sql): paste only this one.
-- What it does (additive; nothing is dropped and no row is touched):
--   1. the arcade_scores game allow-list: every board id the site uses, now with 'flickit', 'footgolf' and 'popup'
--      (one all-time board each). Every earlier board id is kept, 'holdtheline' too, so Hold the Line's old scores stay valid.
--   2. analytics_ingest with 'arcade_flickit', 'arcade_footgolf' and 'arcade_popup' (play time in the admin activity chart).
--      Every earlier key is kept (arcade_holdtheline too). The Claw Club needs no key: it is counted inside the arcade room
--      ('arcade_lobby') and its plays are saved with the gashapon collection on the device.
--      Skipped when the analytics tables are not installed.
-- The games work before this is pasted: scores save on the device, only the island board refuses the score.
-- The LAST result must be one row:
--   status = OK, Flick It, FootGolf, Pop-Up Shot and the claw machine installed

-- 1. The game allow-list: every board id in lib/arcade/leaderboard.ts BOARD_GAMES.
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd', 'tenpro',
    'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily', 'kitrush',
    'kitdaily', 'snake', 'snakedaily', 'airhockey', 'lineup', 'trophydrop', 'clearbox', 'streetdash', 'rollball',
    'ballblaster', 'keepyuppy', 'holdtheline', 'footgolf', 'flickit', 'popup'));

-- 2. analytics_ingest with 'arcade_flickit', 'arcade_footgolf' and 'arcade_popup' (and every earlier key) (skipped when the analytics tables are not installed).
do $guard$
begin
  if to_regclass('public.analytics_sessions') is null then
    raise notice 'analytics tables not installed: analytics_ingest left as it is';
    return;
  end if;
  execute $fn$
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
             where key in ('walk','ride','fly','boat','fishing','job','lesson','watch','quiz','book','cards','films','vending','talk','coaches','paths','menu','arcade_lobby','arcade_live','arcade_runner','arcade_tennis','arcade_pinball','arcade_puzzle','arcade_snake','arcade_airhockey','arcade_lineup','arcade_trophydrop','arcade_clearbox','arcade_streetdash','arcade_rollball','arcade_ballblaster','arcade_keepyuppy','arcade_holdtheline','arcade_flickit','arcade_footgolf','arcade_popup','museum_hall','exhibit_timeline','exhibit_laws-1863','exhibit_penalty-1891','exhibit_stadiums','exhibit_boots','exhibit_var-2018','exhibit_worldcup-1930','exhibit_wwc-1991','exhibit_futsal-1989','exhibit_laced-leather','exhibit_telstar-1970','exhibit_shirts','exhibit_hall-of-fame','exhibit_ballon-dor','exhibit_first-international-1872','exhibit_offside-rules','exhibit_formations-history','exhibit_floodlights-1878','exhibit_copa-america-1916','exhibit_keeper-hands-1912','exhibit_free-kick-wall','exhibit_ball-curve','exhibit_throw-in','konbini_shop','kit_shop','kit_studio','swim','controller','other','idle')
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
end $$
$fn$;
  execute 'revoke all on function public.analytics_ingest(jsonb) from public, anon, authenticated';
  execute 'grant execute on function public.analytics_ingest(jsonb) to service_role';
end $guard$;

-- Self-check: the last result of this file. Lists anything missing.
select case when missing = '' then 'OK, Flick It, FootGolf, Pop-Up Shot and the claw machine installed' else 'NOT INSTALLED: ' || missing end as status from (
  select concat_ws(', ',
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''rollball''%') then 'board rollball' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''ballblaster''%') then 'board ballblaster' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''keepyuppy''%') then 'board keepyuppy' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''holdtheline''%') then 'board holdtheline' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''flickit''%') then 'board flickit' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''footgolf''%') then 'board footgolf' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''popup''%') then 'board popup' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''clearbox''%' and pg_get_constraintdef(oid) like '%''streetdash''%' and pg_get_constraintdef(oid) like '%''snakedaily''%') then 'older board ids' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_rollball%') then 'analytics key arcade_rollball' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_ballblaster%') then 'analytics key arcade_ballblaster' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_keepyuppy%') then 'analytics key arcade_keepyuppy' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_holdtheline%') then 'analytics key arcade_holdtheline' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_flickit%') then 'analytics key arcade_flickit' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_footgolf%') then 'analytics key arcade_footgolf' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_popup%') then 'analytics key arcade_popup' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_streetdash%' and prosrc like '%stadium_plaza%' and prosrc like '%< 1891%') then 'older analytics keys' end
  ) as missing) x;
