-- Futbol Island: Breakaway Run route boards and the Daily Run board (Nov 10 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'runwarm',
-- 'runnight', 'runstorm' and 'rundaily', lib/arcade/runnerModes.ts Warm-up, Night Derby, Storm Final and Daily Run).
-- NOT APPLIED. Run once in the Supabase SQL editor (or `supabase db push`), AFTER every earlier board file (the 20261108_*_boards.sql
-- files, 20261109_pinball_tier_boards.sql and 20261110_puzzle_tier_boards.sql). The file is dated 20261112 on purpose: each of these
-- files replaces the same allow-list, so the last one to run must name every board.
-- Additive in effect: it only widens the arcade_scores.game allow-list check to accept the four new ids (the constraint is replaced
-- by the same list, every earlier board included, plus the new ids; no row, column, function or grant changes, so the existing
-- 'runner' board and its rows are untouched). Running it twice is harmless. Until it runs, the API answers these boards with
-- "unavailable" and the game keeps the score on the device (the This device tab), like every board before its migration.
-- The LAST result row must read "OK, runner route boards installed".
--
-- Scores stay inside the table's existing ceiling (score between 1 and 400000; each board's own ceiling, rate, minimum play time
-- and play token per run are checked by the API in lib/arcade/leaderboard.ts).

alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily'));

-- Self-check: the last result of this file. "OK, runner route boards installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, runner route boards installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''runwarm''%' and pg_get_constraintdef(oid) like '%''runnight''%' and pg_get_constraintdef(oid) like '%''runstorm''%'
      and pg_get_constraintdef(oid) like '%''rundaily''%' and pg_get_constraintdef(oid) like '%''puzlgnd''%' and pg_get_constraintdef(oid) like '%''pinfinal''%'
      and pg_get_constraintdef(oid) like '%''runner''%') then 'game check with runwarm, runnight, runstorm and rundaily' end
  ) as missing) x;
