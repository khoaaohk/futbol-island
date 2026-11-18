-- Futbol Island: Ball Blaster board (Nov 17 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'ballblaster', lib/arcade/ballblaster/core.ts).
-- NOT APPLIED. The owner pastes ONE file instead of this one: docs/arcade-aaa/ballblaster-supabase.sql holds the same allow-list plus the
-- analytics key. This copy exists so the migrations folder, replayed in order, ends with an allow-list that names every board.
-- A superset of 20261129_streetdash_boards.sql: the same list (Street Dash included) plus 'ballblaster'.
-- Additive in effect: the arcade_scores.game check is replaced by that list. Running it twice is harmless.
-- The LAST result row must read "OK, Ball Blaster board installed".
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily', 'airhockey', 'lineup', 'trophydrop', 'clearbox', 'streetdash', 'ballblaster'));

select case when exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
    and pg_get_constraintdef(oid) like '%''airhockey''%' and pg_get_constraintdef(oid) like '%''lineup''%' and pg_get_constraintdef(oid) like '%''trophydrop''%'
    and pg_get_constraintdef(oid) like '%''clearbox''%' and pg_get_constraintdef(oid) like '%''streetdash''%' and pg_get_constraintdef(oid) like '%''ballblaster''%')
  then 'OK, Ball Blaster board installed' else 'NOT INSTALLED: game check with ballblaster' end as status;
