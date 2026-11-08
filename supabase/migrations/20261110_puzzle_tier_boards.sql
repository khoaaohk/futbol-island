-- Futbol Island: Pass Puzzles cup boards (Nov 8 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'puzpro' and 'puzlgnd',
-- lib/passPuzzle/tiers.ts Pro Cup and Legend Cup).
-- Run once in the Supabase SQL editor (or `supabase db push`), AFTER every earlier board file: the three 20261108_*_boards.sql
-- files (Breakaway tiers, Strikers leagues, Tennis tours) and 20261109_pinball_tier_boards.sql. The file is dated 20261110 on
-- purpose: each of these files replaces the same allow-list, so the last one to run must name every board.
-- Additive in effect: it only widens the arcade_scores.game allow-list check to accept 'puzpro' and 'puzlgnd' (the constraint
-- is replaced by the same list, every earlier board included, plus the two new ids; no row, column, function or grant changes,
-- so the existing 'puzzle' star board is untouched). Running it twice is harmless.
-- The LAST result row must read "OK, puzzle cup boards installed".
--
-- Scores stay inside the table's existing ceiling (score between 1 and 400000; the cups' own rules are checked by the API in
-- lib/arcade/leaderboard.ts: ceiling 5000, minimum play time and a play token per run).

alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd'));

-- Self-check: the last result of this file. "OK, puzzle cup boards installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, puzzle cup boards installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''puzpro''%' and pg_get_constraintdef(oid) like '%''puzlgnd''%' and pg_get_constraintdef(oid) like '%''pinfinal''%'
      and pg_get_constraintdef(oid) like '%''tenlgnd''%' and pg_get_constraintdef(oid) like '%''livelgnd''%' and pg_get_constraintdef(oid) like '%''puzzle''%') then 'game check with puzpro and puzlgnd' end
  ) as missing) x;
