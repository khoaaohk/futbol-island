-- Futbol Island: Island Strikers league boards (Nov 8 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'livepro' and 'livelgnd',
-- lib/arcade/strikerTiers.ts Pro League and Legend League).
-- Run once in the Supabase SQL editor (or `supabase db push`), AFTER 20261108_runner_tier_boards.sql (file order already does this).
-- Additive in effect: it only widens the arcade_scores.game allow-list check to accept 'livepro' and 'livelgnd' (the constraint is
-- replaced by the same list, Breakaway's Nov 8 tiers included, plus the two new ids; no row, column, function or grant changes, so
-- the existing 'live' board is untouched). Running it twice is harmless.
-- The LAST result row must read "OK, strikers league boards installed".
--
-- Scores stay inside the table's existing ceiling (score between 1 and 400000; the leagues' own ceilings are 40000 and 60000,
-- checked by the API in lib/arcade/leaderboard.ts with the rest of the rules: rate, minimum play time and a play token per match).

alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd'));

-- Self-check: the last result of this file. "OK, strikers league boards installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, strikers league boards installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''livepro''%' and pg_get_constraintdef(oid) like '%''livelgnd''%' and pg_get_constraintdef(oid) like '%''cupfinal''%'
      and pg_get_constraintdef(oid) like '%''live''%' and pg_get_constraintdef(oid) like '%''runner''%') then 'game check with livepro and livelgnd' end
  ) as missing) x;
