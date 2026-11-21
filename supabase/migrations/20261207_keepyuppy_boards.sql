-- Futbol Island: Keepy-Uppy Beat board (Nov 21 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'keepyuppy', lib/arcade/keepyuppy/core.ts).
-- NOT APPLIED. The owner pastes ONE file instead of this one: docs/arcade-aaa/new-games-nov21-supabase.sql (Keepy-Uppy Beat and Hold the Line) holds the same allow-list plus the
-- analytics key. This copy exists so the migrations folder, replayed in order, ends with an allow-list that names every board.
-- A superset of 20261203_ballblaster_boards.sql: the same list plus 'keepyuppy'. Running it twice is harmless.
-- The LAST result row must read "OK, Keepy-Uppy Beat board installed".
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily', 'airhockey', 'lineup', 'trophydrop', 'clearbox', 'streetdash', 'rollball', 'ballblaster', 'keepyuppy'));

select case when exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
    and pg_get_constraintdef(oid) like '%''airhockey''%' and pg_get_constraintdef(oid) like '%''lineup''%' and pg_get_constraintdef(oid) like '%''trophydrop''%'
    and pg_get_constraintdef(oid) like '%''clearbox''%' and pg_get_constraintdef(oid) like '%''streetdash''%' and pg_get_constraintdef(oid) like '%''rollball''%' and pg_get_constraintdef(oid) like '%''ballblaster''%' and pg_get_constraintdef(oid) like '%''keepyuppy''%')
  then 'OK, Keepy-Uppy Beat board installed' else 'NOT INSTALLED: game check with keepyuppy' end as status;
