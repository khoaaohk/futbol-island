-- Futbol Island: FootGolf Island board (Nov 21 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'footgolf', lib/arcade/footgolf/core.ts).
-- NOT APPLIED. The owner pastes ONE file instead of this one: docs/arcade-aaa/footgolf-supabase.sql holds the same allow-list plus the analytics key.
-- This copy exists so the migrations folder, replayed in order, ends with an allow-list that names every board.
-- A superset of 20261209_holdtheline_boards.sql: the same list plus 'footgolf'. Running it twice is harmless. (Numbered after Flick It's 20261211/20261212 on
-- branch game-flickit, so the two never collide; whichever merges second must add the other's id to its list.)
-- The LAST result row must read "OK, FootGolf Island board installed".
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily', 'airhockey', 'lineup', 'trophydrop', 'clearbox', 'streetdash', 'rollball', 'ballblaster', 'keepyuppy', 'holdtheline', 'footgolf'));

select case when exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
    and pg_get_constraintdef(oid) like '%''airhockey''%' and pg_get_constraintdef(oid) like '%''lineup''%' and pg_get_constraintdef(oid) like '%''trophydrop''%'
    and pg_get_constraintdef(oid) like '%''clearbox''%' and pg_get_constraintdef(oid) like '%''streetdash''%' and pg_get_constraintdef(oid) like '%''rollball''%' and pg_get_constraintdef(oid) like '%''ballblaster''%' and pg_get_constraintdef(oid) like '%''keepyuppy''%' and pg_get_constraintdef(oid) like '%''holdtheline''%' and pg_get_constraintdef(oid) like '%''footgolf''%')
  then 'OK, FootGolf Island board installed' else 'NOT INSTALLED: game check with footgolf' end as status;
