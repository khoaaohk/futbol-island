-- Futbol Island admin fishing funnel (Nov 6 2026): ONE new function for /admin, public.analytics_fishing_sessions.
-- Run ONCE in the Supabase SQL editor (or `supabase db push`), AFTER 20261017_analytics_fishing.sql. Paste the WHOLE file.
-- The LAST result must be one row:
--   status = OK, fishing sessions installed
--
-- Additive and safe on the live DB: it creates one NEW function and touches no table, row, policy or existing function
-- (analytics_fishing_summary from 20261017 is left exactly as it is; analytics_ingest is NOT replaced: the new funnel ids
-- fi:start, fi:cast, fi:bite, fi:miss_early, fi:miss_late, fi:land_<rarity>, fi:new_species, fi:basket_full, fi:tutorial_done,
-- fi:tutorial_skip and fi:sold ride the existing counter channel `k`, which accepts any fixed id with no migration).
-- Running this file twice is harmless.
--
-- Why: analytics_fishing_summary keeps only sessions that started a fight (its HAVING fights > 0), so a child who tapped Fish and
-- cast but never hooked anything was invisible there. This function counts every session that fished at all (tapped Fish, cast,
-- fought or landed) over [p_from, p_to], with the sessions that never hooked a fish as their own bucket '0', the sessions that
-- cast but never hooked, and fights / landings in all (lib/analytics/fishingAdminMetrics.ts, app/admin/FishingSection.tsx).
-- It reads the raw beats, which the nightly purge keeps for 14 days (window_days), like analytics_fishing_summary.
-- Aggregates only: never a session id, a fish, a spot or a size. Exact counts (owner rule, Nov 5 2026).
-- Dates: analytics_sessions.day (the UTC day the session started), applied to [p_from, p_to] as dates.
--
-- tests/admin-analytics-fishing.cjs replays every migration on a throwaway Postgres and checks this function and its self-check row.

create or replace function public.analytics_fishing_sessions(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with per_session as (
    select b.session_id,
           sum(coalesce((b.counts->>'fi:start')::integer, 0)) as starts,
           sum(coalesce((b.counts->>'fi:cast')::integer, 0)) as casts,
           sum(coalesce((b.counts->>'fi:hook_spin')::integer, 0) + coalesce((b.counts->>'fi:hook_easy')::integer, 0)) as fights,
           sum(coalesce((b.counts->>'fi:land')::integer, 0)) as landed
      from analytics_beats b
      join analytics_sessions s on s.id = b.session_id
     where s.day between least(p_from, p_to) and greatest(p_from, p_to)
       and (b.counts ? 'fi:start' or b.counts ? 'fi:cast' or b.counts ? 'fi:hook_spin' or b.counts ? 'fi:hook_easy' or b.counts ? 'fi:land')
     group by b.session_id
  )
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'window_days', 14,
    'sessions', count(*),
    'never_hooked', count(*) filter (where fights = 0),
    'cast_never_hooked', count(*) filter (where casts > 0 and fights = 0),
    'fights', coalesce(sum(fights), 0),
    'landed', coalesce(sum(landed), 0),
    'buckets', jsonb_build_object(
      '0',   count(*) filter (where fights = 0),
      '1',   count(*) filter (where fights = 1),
      '2-3', count(*) filter (where fights between 2 and 3),
      '4-6', count(*) filter (where fights between 4 and 6),
      '7+',  count(*) filter (where fights >= 7)))
  from per_session;
$$;

revoke all on function public.analytics_fishing_sessions(date, date) from public, anon, authenticated;
grant execute on function public.analytics_fishing_sessions(date, date) to service_role;

-- Self-check: the last result of this file.
select case when to_regprocedure('public.analytics_fishing_sessions(date, date)') is not null
            and (select prosrc from pg_proc where oid = to_regprocedure('public.analytics_fishing_sessions(date, date)')) like '%fi:start%'
  then 'OK, fishing sessions installed' else 'NOT INSTALLED: analytics_fishing_sessions' end as status;
