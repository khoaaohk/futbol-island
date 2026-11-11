-- Futbol Island: endless Futbol Pinball score ceiling (Nov 10 2026; lib/games/soccerPinballEndless.ts, lib/arcade/leaderboard.ts
-- BOARD_RULES 'pinball' 3000000, 'pinderby' 6000000, 'pinfinal' 9000000).
-- NOT APPLIED. Paste once into the Supabase SQL editor, AFTER every board migration in supabase/migrations/ (the last one is
-- 20261113_kitrush_boards.sql) and after docs/arcade-aaa/kitrush-supabase.sql if that has not run yet.
-- A pinball run now ends only when the last ball is lost, so a long run can pass the table's old ceiling (score between 1 and
-- 400000). This widens that one check to 1..9000000 (the highest pinball board's ceiling). Each game's own ceiling, scoring rate,
-- minimum play time and play token are still checked by the API (lib/arcade/leaderboard.ts) before a row is written.
-- Additive in effect: no row, column, function or grant changes; no board is renamed or reset and every existing score stays
-- (every existing row is inside 1..400000, so it passes the wider check). Running it twice is harmless.
-- It also re-states the game allow-list with every current board id, so it is safe as the last file run.
-- Nov 10 2026, Squad Snake (the sixth cabinet): the allow-list now also names 'snake' and 'snakedaily' (until this runs those two
-- boards answer "unavailable" and the game keeps scores on the device), and section 3 teaches the analytics ingest the one new
-- activity key 'arcade_snake' (until then Squad Snake time is simply missing from the admin activity chart). This ONE file
-- replaces supabase/migrations/20261114_snake_boards.sql and 20261115_analytics_snake.sql, which are the same statements.
-- Until it runs, a pinball score over 400000 is refused by the table: the API answers "unavailable" and the game keeps that
-- score on the device (the This device tab). Scores up to 400000 post as before.
-- The LAST result row must read "OK, endless pinball ceiling installed".

-- 1. The score ceiling. The first migration declared the check inline, so Postgres named it arcade_scores_score_check; the loop
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

-- 2. The game allow-list, unchanged in content: every board id in lib/arcade/leaderboard.ts BOARD_GAMES.
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily'));

-- 3. Squad Snake's activity key for the admin analytics (Nov 10 2026). analytics_ingest is replaced in place: the same signature
--    and the same body as supabase/migrations/20261019_analytics_day_sessions.sql, with one more key ('arcade_snake') in the
--    activity allow-list (supabase/migrations/20261115_analytics_snake.sql is the same function). Skipped when the analytics
--    tables are not installed. Every statement inside the function is the ingest's own (it writes only analytics rows).
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
             where key in ('island_square','arcade','konbini','coaches','library_square','community_park','old_town','field_7v7','field_futsal','palm_coast','west_side','field_9v9','club_grounds','community_hall','community_garden','farmers_market','east_jetty','field_11v11','school','museum','south_pier','ferry_dock','north_beach','town','causeway','sandbars','deep_sea_boat','cay_town','cay_konbini','hostel','farm','beach_court','sharks_beach','coral_cay','summit_sandbar','summit_pitch','summit_isle','sea')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'activity_ms') = 'object' then p->'activity_ms' else '{}'::jsonb end)
             where key in ('walk','ride','fly','boat','fishing','job','lesson','watch','quiz','book','cards','films','vending','talk','coaches','paths','menu','arcade_lobby','arcade_live','arcade_runner','arcade_tennis','arcade_pinball','arcade_puzzle','arcade_snake','museum_hall','exhibit_timeline','exhibit_laws-1863','exhibit_penalty-1891','exhibit_stadiums','exhibit_boots','exhibit_var-2018','exhibit_worldcup-1930','exhibit_wwc-1991','exhibit_futsal-1989','exhibit_laced-leather','exhibit_telstar-1970','exhibit_shirts','exhibit_hall-of-fame','exhibit_ballon-dor','exhibit_first-international-1872','exhibit_offside-rules','exhibit_formations-history','exhibit_floodlights-1878','exhibit_copa-america-1916','exhibit_keeper-hands-1912','exhibit_free-kick-wall','exhibit_ball-curve','exhibit_throw-in','konbini_shop','kit_shop','kit_studio','swim','controller','other','idle')
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
end $$
$ingest$;
  execute 'revoke all on function public.analytics_ingest(jsonb) from public, anon, authenticated';
  execute 'grant execute on function public.analytics_ingest(jsonb) to service_role';
end $guard$;

-- Self-check: the last result. "OK, endless pinball ceiling installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, endless pinball ceiling installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_score_check'
      and pg_get_constraintdef(oid) like '%9000000%') then 'score check 1..9000000' end,
    case when exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and contype = 'c'
      and pg_get_constraintdef(oid) like '%400000%') then 'the old 400000 score check is still there' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''kitrush''%' and pg_get_constraintdef(oid) like '%''kitdaily''%'
      and pg_get_constraintdef(oid) like '%''pinball''%' and pg_get_constraintdef(oid) like '%''pinderby''%'
      and pg_get_constraintdef(oid) like '%''pinfinal''%' and pg_get_constraintdef(oid) like '%''rundaily''%'
      and pg_get_constraintdef(oid) like '%''runner''%'
      and pg_get_constraintdef(oid) like '%''snake''%' and pg_get_constraintdef(oid) like '%''snakedaily''%') then 'game check with every board id' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_snake%') then 'analytics_ingest with the arcade_snake activity' end
  ) as missing) x;
