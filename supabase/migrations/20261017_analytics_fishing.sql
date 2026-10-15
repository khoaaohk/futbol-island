-- Futbol Island admin fishing analytics (Oct 15 2026, the spin reel): ONE new function for /admin, public.analytics_fishing_summary.
-- Run ONCE in the Supabase SQL editor (or `supabase db push`), AFTER 20261016_analytics_kit_shop_activity.sql. Paste the WHOLE
-- file. The LAST result must be one row:
--   status = OK, fishing analytics installed
--
-- Additive and safe on the live DB: it creates one function and touches no table, row, policy or existing function (analytics_ingest
-- is NOT replaced: every fishing counter — the lure by id, spin vs Easy reel fights, landed / escaped / missed, slips, runs, the
-- spin-rate bucket, Fishbook opens, requests, clues, legends; lib/analytics/countIds.ts FISHING_COUNT_EVENTS — rides the existing
-- learning-counter channel `k`, which already accepts any fixed id with no migration). Running this file twice is harmless.
--
-- What it answers (lib/analytics/fishingAdminMetrics.ts, app/admin/FishingSection.tsx): over [p_from, p_to], how many sessions
-- started a fight (fi:hook_spin + fi:hook_easy), how many fights and landings in all, and the sessions split by fights started
-- (1 / 2–3 / 4–6 / 7+). The day rollups keep totals and "sessions carrying the id" but never a per-session count, so this reads the
-- raw beats, which the nightly purge keeps for 14 days (window_days): older days in the range simply contribute nothing.
-- Aggregates only: never a session id, a fish, a spot or a size. The TypeScript side suppresses small numbers (< 5 sessions).
-- Dates: analytics_sessions.day (the UTC day the session started), applied to [p_from, p_to] as dates, like save_admin_metrics.
--
-- tests/admin-analytics-fishing.cjs replays every migration on a throwaway Postgres, ingests sessions with fishing counts and
-- checks this function's buckets and its self-check row; tests/admin-analytics-coverage.cjs replays it after the newest
-- analytics_ingest migration.

create or replace function public.analytics_fishing_summary(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with per_session as (
    select b.session_id,
           sum(coalesce((b.counts->>'fi:hook_spin')::integer, 0) + coalesce((b.counts->>'fi:hook_easy')::integer, 0)) as fights,
           sum(coalesce((b.counts->>'fi:land')::integer, 0)) as landed
      from analytics_beats b
      join analytics_sessions s on s.id = b.session_id
     where s.day between least(p_from, p_to) and greatest(p_from, p_to)
       and (b.counts ? 'fi:hook_spin' or b.counts ? 'fi:hook_easy' or b.counts ? 'fi:land')
     group by b.session_id
    having sum(coalesce((b.counts->>'fi:hook_spin')::integer, 0) + coalesce((b.counts->>'fi:hook_easy')::integer, 0)) > 0
  )
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'window_days', 14,
    'sessions', count(*),
    'fights', coalesce(sum(fights), 0),
    'landed', coalesce(sum(landed), 0),
    'buckets', jsonb_build_object(
      '1',   count(*) filter (where fights = 1),
      '2-3', count(*) filter (where fights between 2 and 3),
      '4-6', count(*) filter (where fights between 4 and 6),
      '7+',  count(*) filter (where fights >= 7)))
  from per_session;
$$;

revoke all on function public.analytics_fishing_summary(date, date) from public, anon, authenticated;
grant execute on function public.analytics_fishing_summary(date, date) to service_role;

-- Self-check: the last result of this file.
select case when to_regprocedure('public.analytics_fishing_summary(date, date)') is not null
            and (select prosrc from pg_proc where oid = to_regprocedure('public.analytics_fishing_summary(date, date)')) like '%fi:hook_spin%'
  then 'OK, fishing analytics installed' else 'NOT INSTALLED: analytics_fishing_summary' end as status;
