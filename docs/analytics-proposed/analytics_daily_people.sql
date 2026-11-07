-- PROPOSED, NOT APPLIED (Nov 6 2026, the daily data layer: docs/analytics-roadmap.md "Daily data layer and export").
-- Kept out of supabase/migrations on purpose: the owner decides whether to run it (it adds one read-only function, nothing
-- else; additive, idempotent). Until it runs, /api/admin/export says "needs SQL" for these series and lists them as gaps.
--
-- public.analytics_daily_people(p_from date, p_to date) → jsonb {days:[…], cohorts:[…]}, from raw session rows (kept 14 days):
--   days[]    per Pacific day: sessions, players (distinct player_id; sessions without one left out), returning / new / unknown
--             sessions (is_returning true / false / null). Exact counts (admin-only; no small-number masking).
--   cohorts[] per Pacific day d inside the raw window: players first seen on d (first seen WITHIN the window: a player who played
--             before the window looks new, so early cohorts read high), and of those, how many played again on d+1 (D1) and on
--             d+7 (D7). d+1 / d+7 null while that day has not ended. D30 is impossible: raw rows are kept 14 days.
-- service_role only, like every analytics function.
create or replace function public.analytics_daily_people(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with b as (select least(p_from, p_to) lo, greatest(p_from, p_to) hi, (now() at time zone 'America/Los_Angeles')::date today),
  s as (select (started_at at time zone 'America/Los_Angeles')::date d, player_id, is_returning from analytics_sessions),
  days as (
    select s.d as day, count(*) as sessions, count(distinct s.player_id) players,
           count(*) filter (where s.is_returning is true) returning_n,
           count(*) filter (where s.is_returning is false) new_n,
           count(*) filter (where s.is_returning is null) unknown_n
      from s, b where s.d between b.lo and b.hi group by s.d),
  pd as (select distinct player_id, d from s where player_id is not null),
  first_seen as (select player_id, min(d) d0 from pd group by player_id),
  cohorts as (
    select f.d0 as day, count(*) as players,
           case when f.d0 + 1 < (select today from b) then count(*) filter (where exists (select 1 from pd where pd.player_id = f.player_id and pd.d = f.d0 + 1)) end as d1,
           case when f.d0 + 7 < (select today from b) then count(*) filter (where exists (select 1 from pd where pd.player_id = f.player_id and pd.d = f.d0 + 7)) end as d7
      from first_seen f, b where f.d0 between b.lo and b.hi group by f.d0)
  select jsonb_build_object(
    'window_days', 14, 'from', (select lo from b), 'to', (select hi from b),
    'days', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'sessions', sessions, 'players', players, 'returning', returning_n, 'new', new_n, 'unknown', unknown_n) order by day) from days), '[]'::jsonb),
    'cohorts', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'players', players, 'd1', d1, 'd7', d7) order by day) from cohorts), '[]'::jsonb));
$$;
revoke all on function public.analytics_daily_people(date, date) from public, anon, authenticated;
grant execute on function public.analytics_daily_people(date, date) to service_role;
select 'OK, analytics_daily_people installed (proposed Nov 6 2026)' as result;
