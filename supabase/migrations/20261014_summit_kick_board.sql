-- Futbol Island: the Summit Kick island board (Oct 12 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'kick', lib/town/summitKick.ts).
-- Run once in the Supabase SQL editor (or `supabase db push`), AFTER 20261013_arcade_leaderboards.sql. Additive in effect: it only
-- widens the arcade_scores.game allow-list check to accept 'kick' (the constraint is replaced by the same list plus 'kick'; no row,
-- column, function or grant changes). Running it twice is harmless.
-- The LAST result row must read "OK, summit kick board installed".
--
-- Scores stay inside the table's existing ceiling (score between 1 and 400000; Summit Kick's own ceiling is 1000, checked by the
-- API in lib/arcade/leaderboard.ts with the rest of the game's rules: rate, minimum play time and a play token per round).

alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick'));

-- Self-check: the last result of this file. "OK, summit kick board installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, summit kick board installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''kick''%' and pg_get_constraintdef(oid) like '%''runner''%' and pg_get_constraintdef(oid) like '%''puzzle''%') then 'game check with kick' end
  ) as missing) x;
