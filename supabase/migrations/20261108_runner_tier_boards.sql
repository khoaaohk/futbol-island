-- Futbol Island: Breakaway Run elite tier boards (Nov 8 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'cupfinal' and 'legend',
-- lib/arcade/runnerModes.ts Cup Final and Legend routes).
-- Run once in the Supabase SQL editor (or `supabase db push`), AFTER 20261014_summit_kick_board.sql. Additive in effect: it only
-- widens the arcade_scores.game allow-list check to accept 'cupfinal' and 'legend' (the constraint is replaced by the same list plus
-- the two new ids; no row, column, function or grant changes, so the existing 'runner' board is untouched). Running it twice is harmless.
-- The LAST result row must read "OK, runner tier boards installed".
--
-- Scores stay inside the table's existing ceiling (score between 1 and 400000; both tiers' own ceiling is 400000, checked by the API
-- in lib/arcade/leaderboard.ts with the rest of the rules: rate, minimum play time and a play token per run).

alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend'));

-- Self-check: the last result of this file. "OK, runner tier boards installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, runner tier boards installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''cupfinal''%' and pg_get_constraintdef(oid) like '%''legend''%' and pg_get_constraintdef(oid) like '%''kick''%'
      and pg_get_constraintdef(oid) like '%''runner''%') then 'game check with cupfinal and legend' end
  ) as missing) x;
