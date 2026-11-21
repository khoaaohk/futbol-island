-- Futbol Island: Pop-Up Shot board (working id 'popup', Nov 21 2026; lib/arcade/leaderboard.ts BOARD_GAMES 'popup', lib/arcade/popup/core.ts).
-- NOT APPLIED. The owner pastes ONE file instead of this one: docs/arcade-aaa/new-games-nov22-supabase.sql holds the same allow-list plus the analytics key.
-- This copy exists so the migrations folder, replayed in order, ends with an allow-list that names every board.
-- A superset of 20261213_footgolf_boards.sql (Nov 22 2026 release: renumbered from 20261211 after Flick It's and FootGolf's copies): the same list plus 'popup' ('holdtheline' is kept). Running it twice is harmless.
-- The LAST result row must read "OK, Pop-Up Shot board installed".
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily', 'airhockey', 'lineup', 'trophydrop', 'clearbox', 'streetdash', 'rollball', 'ballblaster', 'keepyuppy', 'holdtheline', 'flickit', 'footgolf', 'popup'));

select case when exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
    and pg_get_constraintdef(oid) like '%''airhockey''%' and pg_get_constraintdef(oid) like '%''lineup''%' and pg_get_constraintdef(oid) like '%''trophydrop''%'
    and pg_get_constraintdef(oid) like '%''clearbox''%' and pg_get_constraintdef(oid) like '%''streetdash''%' and pg_get_constraintdef(oid) like '%''rollball''%' and pg_get_constraintdef(oid) like '%''ballblaster''%' and pg_get_constraintdef(oid) like '%''keepyuppy''%' and pg_get_constraintdef(oid) like '%''flickit''%' and pg_get_constraintdef(oid) like '%''footgolf''%' and pg_get_constraintdef(oid) like '%''popup''%')
  then 'OK, Pop-Up Shot board installed' else 'NOT INSTALLED: game check with popup' end as status;
