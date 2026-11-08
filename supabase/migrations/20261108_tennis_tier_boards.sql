-- Futbol Island: Futbol Tennis tour boards (Nov 8 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'tenpro' and 'tenlgnd',
-- lib/games/soccerTennis.ts TENNIS_TOURS Pro Tour and Legend Tour).
-- Run once in the Supabase SQL editor (or `supabase db push`), AFTER 20261108_runner_tier_boards.sql and
-- 20261108_strikers_league_boards.sql (file order already does this). Additive in effect: it only widens the arcade_scores.game
-- allow-list check to accept 'tenpro' and 'tenlgnd' (the constraint is replaced by the same list, Breakaway's and Strikers' Nov 8
-- tiers included, plus the two new ids; no row, column, function or grant changes, so the existing 'tennis' board is untouched).
-- The list also keeps 'pinderby' and 'pinfinal' (Futbol Pinball's Nov 8 tiers, lib/games/soccerPinballTiers.ts, built at the same
-- time): this file sorts after theirs, so it must not drop them. Allowing an id early is harmless. Running it twice is harmless.
-- The LAST result row must read "OK, tennis tour boards installed".
--
-- Scores stay inside the table's existing ceiling (score between 1 and 400000; the tours' own ceilings are 200000 and 300000,
-- checked by the API in lib/arcade/leaderboard.ts with the rest of the rules: rate, minimum play time and a play token per run).

alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
                  'pinderby', 'pinfinal', 'tenpro', 'tenlgnd'));

-- Self-check: the last result of this file. "OK, tennis tour boards installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, tennis tour boards installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''tenpro''%' and pg_get_constraintdef(oid) like '%''tenlgnd''%'
      and pg_get_constraintdef(oid) like '%''livelgnd''%' and pg_get_constraintdef(oid) like '%''legend''%'
      and pg_get_constraintdef(oid) like '%''tennis''%') then 'game check with tenpro and tenlgnd' end
  ) as missing) x;
