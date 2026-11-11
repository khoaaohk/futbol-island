-- Futbol Island: Kit Rush boards (Nov 10 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'kitrush' and 'kitdaily',
-- lib/arcade/kitrush/core.ts). Kit Rush took Island Strikers' cabinet in the arcade.
-- NOT APPLIED. Paste once into the Supabase SQL editor, AFTER every board migration in supabase/migrations/ (the last one is
-- 20261112_runner_route_boards.sql). Each of those files replaces the same allow-list, so the last one to run must name every board.
-- Additive in effect: it only widens the arcade_scores.game allow-list check to accept the two new ids (the constraint is replaced
-- by the same list, every earlier board included, plus 'kitrush' and 'kitdaily'). No row, column, function or grant changes: the
-- 'live', 'livepro' and 'livelgnd' boards and their rows are untouched and still readable. Running it twice is harmless.
-- Until it runs, the API answers the two Kit Rush boards with "unavailable" and the game keeps scores on the device
-- (the This device tab), like every board before its migration.
-- The LAST result row must read "OK, Kit Rush boards installed".
--
-- Scores stay inside the table's existing ceiling (score between 1 and 400000; Kit Rush's own ceiling is 60000, with its rate,
-- minimum play time and play token per run checked by the API in lib/arcade/leaderboard.ts).

alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily'));

-- Self-check: the last result. "OK, Kit Rush boards installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, Kit Rush boards installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''kitrush''%' and pg_get_constraintdef(oid) like '%''kitdaily''%'
      and pg_get_constraintdef(oid) like '%''rundaily''%' and pg_get_constraintdef(oid) like '%''live''%'
      and pg_get_constraintdef(oid) like '%''runner''%') then 'game check with kitrush and kitdaily' end
  ) as missing) x;
