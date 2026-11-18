-- Futbol Island: the NEW ARCADE GAMES owner file (Nov 17 2026). THE ONE FILE TO PASTE into the Supabase SQL editor.
-- It replaces pasting these one by one (each stays in the repo for reference; this file is a superset of all of them):
--   docs/arcade-aaa/board-top20-supabase.sql   (supabase/migrations/20261122_board_top20.sql: island boards hold a top 20)
--   docs/arcade-aaa/lineup-supabase.sql        (20261123_lineup_boards.sql + 20261124_analytics_lineup.sql)
--   docs/arcade-aaa/trophydrop-supabase.sql    (20261125_trophydrop_board.sql + 20261126_analytics_trophydrop.sql)
--   docs/arcade-aaa/clearbox-supabase.sql      (20261127_clearbox_boards.sql + 20261128_analytics_clearbox.sql)
--   docs/arcade-aaa/streetdash-supabase.sql    (20261129_streetdash_boards.sql + 20261130_analytics_streetdash.sql)
--   docs/arcade-aaa/rollball-supabase.sql      (20261201_rollball_boards.sql + 20261202_analytics_rollball.sql)
-- Nov 17 2026: Street Dash (streetdash) merged: its board id and activity key are in parts 3 and 4 and in the self-check. If an
-- earlier copy of this file was pasted already, paste this one once more (it is safe to run again).
-- Nov 17 2026: Roll It In (rollball) merged the same way: board id 'rollball' in part 3, activity key 'arcade_rollball' in part 4.
-- NOT APPLIED. Paste once, AFTER every older board and analytics file (it is safe as the LAST file run). Requires
-- 20261013_arcade_leaderboards.sql and 20261111_board_hidden_rows.sql. Idempotent: running it twice is harmless.
-- What it does:
--   1. board_submit / board_top keep and show a top 20 per board (was 10);
--   2. keeps the endless score ceiling (score between 1 and 9000000);
--   3. the board ids 'lineup' (Line Up!), 'trophydrop' (Trophy Drop), 'clearbox' (Clear the Box) and 'streetdash' (Street Dash) in
--      the arcade_scores game allow-list (one all-time board each);
--   4. the activity keys 'arcade_lineup', 'arcade_trophydrop', 'arcade_clearbox' and 'arcade_streetdash' in analytics_ingest (play
--      time in the admin activity chart). The function body is the newest one, supabase/migrations/20261130_analytics_streetdash.sql; every key, place
--      and cell allowed before is still allowed.
-- Additive in effect: no row, column or grant changes; no board is renamed or reset and every existing score stays.
-- The LAST result row must read "OK, new arcade games installed".

-- 1. Top 20 boards (the same statements as docs/arcade-aaa/board-top20-supabase.sql).
create or replace function public.board_submit(p_game text, p_score integer, p_initials text, p_icon text, p_nonce text,
  p_claim_hash text, p_replace_id bigint, p_replace_claim_hash text, p_day date, p_week date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare old_id bigint; r_all integer; r_week integer; new_id bigint;
begin
  perform pg_advisory_xact_lock(hashtext('arcade_board:' || p_game));
  if exists (select 1 from arcade_scores where session_nonce = p_nonce) then
    return jsonb_build_object('ok', false, 'reason', 'used');
  end if;
  if p_replace_id is not null and p_replace_claim_hash is not null then
    select id into old_id from arcade_scores
      where id = p_replace_id and game = p_game and claim_hash = p_replace_claim_hash and score <= p_score and hidden_at is null;
  end if;
  select count(*) + 1 into r_all from arcade_scores where game = p_game and hidden_at is null and score >= p_score and id is distinct from old_id;
  select count(*) + 1 into r_week from arcade_scores where game = p_game and hidden_at is null and week = p_week and score >= p_score and id is distinct from old_id;
  if r_all > 20 and r_week > 20 then
    return jsonb_build_object('ok', false, 'reason', 'not-top');
  end if;
  if old_id is not null then delete from arcade_scores where id = old_id; end if;
  insert into arcade_scores (game, score, initials, icon, played_on, week, session_nonce, claim_hash)
    values (p_game, p_score, p_initials, coalesce(p_icon, ''), p_day, p_week, p_nonce, p_claim_hash)
    returning id into new_id;
  return jsonb_build_object('ok', true, 'id', new_id,
    'rank_all', case when r_all <= 20 then r_all end, 'rank_week', case when r_week <= 20 then r_week end);
end $$;

create or replace function public.board_top(p_game text, p_week date) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'size', 20,
    'all', coalesce((select jsonb_agg(board_row(t) order by t.score desc, t.id) from
      (select * from arcade_scores where game = p_game and hidden_at is null order by score desc, id limit 20) t), '[]'::jsonb),
    'week', coalesce((select jsonb_agg(board_row(t) order by t.score desc, t.id) from
      (select * from arcade_scores where game = p_game and hidden_at is null and week = p_week order by score desc, id limit 20) t), '[]'::jsonb))
$$;

-- 2. The score ceiling (the same block as docs/arcade-aaa/airhockey-supabase.sql; Line Up!, Trophy Drop, Clear the Box and Street Dash are endless, ceiling 3,000,000). The first migration declared the check inline, so Postgres named it arcade_scores_score_check; the loop
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

-- 3. The game allow-list: every board id in lib/arcade/leaderboard.ts BOARD_GAMES, with 'lineup' (Line Up!), 'trophydrop' (Trophy Drop), 'clearbox' (Clear the Box) and 'streetdash' (Street Dash) added.
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily', 'airhockey', 'lineup', 'trophydrop', 'clearbox', 'streetdash', 'rollball'));

-- 4. The arcade activity keys for the admin analytics (skipped when the analytics tables are not installed).
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
             where key in ('walk','ride','fly','boat','fishing','job','lesson','watch','quiz','book','cards','films','vending','talk','coaches','paths','menu','arcade_lobby','arcade_live','arcade_runner','arcade_tennis','arcade_pinball','arcade_puzzle','arcade_snake','arcade_airhockey','arcade_lineup','arcade_trophydrop','arcade_clearbox','arcade_streetdash','arcade_rollball','museum_hall','exhibit_timeline','exhibit_laws-1863','exhibit_penalty-1891','exhibit_stadiums','exhibit_boots','exhibit_var-2018','exhibit_worldcup-1930','exhibit_wwc-1991','exhibit_futsal-1989','exhibit_laced-leather','exhibit_telstar-1970','exhibit_shirts','exhibit_hall-of-fame','exhibit_ballon-dor','exhibit_first-international-1872','exhibit_offside-rules','exhibit_formations-history','exhibit_floodlights-1878','exhibit_copa-america-1916','exhibit_keeper-hands-1912','exhibit_free-kick-wall','exhibit_ball-curve','exhibit_throw-in','konbini_shop','kit_shop','kit_studio','swim','controller','other','idle')
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

-- Self-check: the last result. "OK, new arcade games installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, new arcade games installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when to_regprocedure('public.board_top(text, date)') is null
      or position('''size'', 20' in pg_get_functiondef(to_regprocedure('public.board_top(text, date)'))) = 0 then 'board_top with size 20' end,
    case when to_regprocedure('public.board_submit(text, integer, text, text, text, text, bigint, text, date, date)') is null
      or position('r_all > 20' in pg_get_functiondef(to_regprocedure('public.board_submit(text, integer, text, text, text, text, bigint, text, date, date)'))) = 0 then 'board_submit keeping a top 20' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_score_check'
      and pg_get_constraintdef(oid) like '%9000000%') then 'score check 1..9000000' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''snakedaily''%' and pg_get_constraintdef(oid) like '%''airhockey''%'
      and pg_get_constraintdef(oid) like '%''lineup''%' and pg_get_constraintdef(oid) like '%''trophydrop''%'
      and pg_get_constraintdef(oid) like '%''clearbox''%' and pg_get_constraintdef(oid) like '%''streetdash''%' and pg_get_constraintdef(oid) like '%''rollball''%') then 'game allow-list with lineup, trophydrop, clearbox and streetdash' end,
    case when to_regclass('public.analytics_sessions') is not null and not exists (select 1 from pg_proc where proname = 'analytics_ingest'
      and prosrc like '%arcade_airhockey%' and prosrc like '%arcade_lineup%' and prosrc like '%arcade_trophydrop%' and prosrc like '%arcade_clearbox%'
      and prosrc like '%arcade_streetdash%' and prosrc like '%arcade_rollball%' and prosrc like '%stadium_plaza%' and prosrc like '%< 1891%') then 'analytics_ingest with arcade_lineup, arcade_trophydrop, arcade_clearbox and arcade_streetdash' end
  ) as missing) x;
