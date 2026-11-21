-- Futbol Island: Hold the Line board (Nov 21 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'holdtheline', lib/arcade/holdtheline/core.ts).
-- NOT APPLIED. The owner pastes ONE file instead of this one: docs/arcade-aaa/new-games-nov21-supabase.sql (all three new games; it replaces holdtheline-supabase.sql) holds the same allow-list plus the
-- analytics key. This copy exists so the migrations folder, replayed in order, ends with an allow-list that names every board.
-- A superset of 20261207_keepyuppy_boards.sql (renumbered from 20261207 on Nov 21 2026 when Keepy-Uppy Beat took that date): the same list plus 'holdtheline'. Running it twice is harmless.
-- The LAST result row must read "OK, Hold the Line board installed".
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily', 'airhockey', 'lineup', 'trophydrop', 'clearbox', 'streetdash', 'rollball', 'ballblaster', 'safehands', 'keepyuppy', 'holdtheline'));

select case when exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
    and pg_get_constraintdef(oid) like '%''airhockey''%' and pg_get_constraintdef(oid) like '%''lineup''%' and pg_get_constraintdef(oid) like '%''trophydrop''%'
    and pg_get_constraintdef(oid) like '%''clearbox''%' and pg_get_constraintdef(oid) like '%''streetdash''%' and pg_get_constraintdef(oid) like '%''rollball''%' and pg_get_constraintdef(oid) like '%''ballblaster''%' and pg_get_constraintdef(oid) like '%''safehands''%' and pg_get_constraintdef(oid) like '%''keepyuppy''%' and pg_get_constraintdef(oid) like '%''holdtheline''%')
  then 'OK, Hold the Line board installed' else 'NOT INSTALLED: game check with holdtheline' end as status;
