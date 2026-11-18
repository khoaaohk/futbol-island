-- Futbol Island: Trophy Drop's board id (Nov 17 2026). The migrations-folder copy of part 2 of
-- docs/arcade-aaa/trophydrop-supabase.sql (the ONE file the owner pastes; it also restates the endless score ceiling, which the
-- migrations folder leaves to docs/arcade-aaa/endless-supabase.sql); 20261124_analytics_trophydrop.sql is part 3.
-- Kept so the migrations folder, replayed in order, ends complete. Safe to run twice. The LAST result row must read
-- "OK, Trophy Drop board installed".

-- 2. The game allow-list: every board id in lib/arcade/leaderboard.ts BOARD_GAMES, with 'trophydrop' added.
alter table public.arcade_scores drop constraint if exists arcade_scores_game_check;
alter table public.arcade_scores add constraint arcade_scores_game_check
  check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle', 'kick', 'cupfinal', 'legend', 'livepro', 'livelgnd',
    'tenpro', 'tenlgnd', 'pinderby', 'pinfinal', 'puzpro', 'puzlgnd', 'runwarm', 'runnight', 'runstorm', 'rundaily',
    'kitrush', 'kitdaily', 'snake', 'snakedaily', 'airhockey', 'trophydrop'));

-- Self-check.
select case when exists (select 1 from pg_constraint where conrelid = to_regclass('public.arcade_scores') and conname = 'arcade_scores_game_check'
    and pg_get_constraintdef(oid) like '%''airhockey''%' and pg_get_constraintdef(oid) like '%''trophydrop''%')
  then 'OK, Trophy Drop board installed' else 'NOT INSTALLED: game allow-list with trophydrop' end as status;
