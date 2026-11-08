-- Futbol Island: Futbol Pinball elite tier boards (Nov 8 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'pinderby' and 'pinfinal',
-- lib/games/soccerPinballTiers.ts Derby Night and World Final).
-- Run once in the Supabase SQL editor (or `supabase db push`), AFTER the three 20261108_*_boards.sql files (Breakaway tiers,
-- Strikers leagues, Tennis tours). The file is dated 20261109 on purpose: each of these files replaces the same allow-list, so
-- the last one to run must name every board, and a 20261108_pinball_* name would sort (and run) before them and be undone.
-- Additive in effect: it only widens the arcade_scores.game allow-list check to accept 'pinderby' and 'pinfinal' (the constraint
-- is replaced by the same list, every earlier board included, plus the two new ids; no row, column, function or grant changes,
-- so the existing 'pinball' board is untouched). Running it twice is harmless.
-- The LAST result row must read "OK, pinball tier boards installed".
--
-- Scores stay inside the table's existing ceiling (score between 1 and 400000; the tiers' own rules are checked by the API in
-- lib/arcade/leaderboard.ts: ceiling, rate, minimum play time and a play token per run).

alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal'));

-- Self-check: the last result of this file. "OK, pinball tier boards installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, pinball tier boards installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''pinderby''%' and pg_get_constraintdef(oid) like '%''pinfinal''%' and pg_get_constraintdef(oid) like '%''tenlgnd''%'
      and pg_get_constraintdef(oid) like '%''livelgnd''%' and pg_get_constraintdef(oid) like '%''pinball''%') then 'game check with pinderby and pinfinal' end
  ) as missing) x;
