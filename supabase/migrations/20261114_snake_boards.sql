-- Futbol Island: Squad Snake boards (Nov 10 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'snake' and 'snakedaily',
-- lib/arcade/snake/core.ts). Squad Snake is the arcade's sixth cabinet.
-- NOT APPLIED. The owner pastes ONE file instead of this one: docs/arcade-aaa/endless-supabase.sql holds the same allow-list
-- (plus the endless score ceiling and the analytics key). This copy exists so the migrations folder, replayed in order, ends with
-- an allow-list that names every board (each board file replaces the same check, so the last one to run must name them all).
-- Additive in effect: it only widens the arcade_scores.game allow-list check to accept the two new ids (the constraint is replaced
-- by the same list, every earlier board included, plus 'snake' and 'snakedaily'). No row, column, function or grant changes.
-- Running it twice is harmless. Until it (or the docs file) runs, the API answers the two Squad Snake boards with "unavailable"
-- and the game keeps scores on the device (the This device tab), like every board before its migration.
-- The LAST result row must read "OK, Squad Snake boards installed".

alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily'));

-- Self-check: the last result. "OK, Squad Snake boards installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, Squad Snake boards installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores (run 20261013_arcade_leaderboards.sql first)' end,
    case when not exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
      and pg_get_constraintdef(oid) like '%''snake''%' and pg_get_constraintdef(oid) like '%''snakedaily''%'
      and pg_get_constraintdef(oid) like '%''kitrush''%' and pg_get_constraintdef(oid) like '%''kitdaily''%'
      and pg_get_constraintdef(oid) like '%''rundaily''%' and pg_get_constraintdef(oid) like '%''runner''%') then 'game check with snake and snakedaily' end
  ) as missing) x;
