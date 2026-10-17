-- Futbol Island admin: "Returning save codes" follows the selected range (Oct 20 2026). Run once in the Supabase SQL editor (or
-- `supabase db push`), AFTER 20261011_admin_save_metrics.sql. It REPLACES public.save_admin_metrics(date, date) with the same
-- body plus two keys inside 'range'; every other key is unchanged. No table, row or other function is touched. Running it twice
-- is harmless. The LAST result row must read "OK, returning in range installed".
--
-- Why: the old 'returning' (all codes with last_used_on > created_on) ignores the range, so the tile showed the same number on
-- Today, Yesterday, 7, 30 and 90 days. It stays (all time, for other consumers). New, range-aware keys:
--   range.returning       codes made BEFORE the range start (created_on < p_from) whose last use (last_used_on) is inside [p_from, p_to]
--   range.prev_returning  the same for the window just before: made before it starts, last used inside [from - len, from - 1]
-- Limit: game_saves keeps only the LATEST use date. A code that came back inside a past range but was used again afterwards
-- is counted in the later window instead, so older ranges can read low. For Today it is "made before today, used today".
-- Dates are UTC (current_date on Supabase).
--
-- tests/admin-save-metrics.cjs runs every migration in order and checks this function against memorySaveMetrics in lib/saves/metrics.ts.

create or replace function public.save_admin_metrics(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  t date := current_date;
  f date := least(p_from, p_to);
  e date := least(greatest(p_from, p_to), current_date);
  len integer;
  out jsonb;
begin
  if f > e then f := e; end if;
  if e - f > 399 then f := e - 399; end if;
  len := e - f + 1;
  select jsonb_build_object(
    'today', t, 'from', f, 'to', e,
    'total', count(*),
    'active_1', count(*) filter (where last_used_on >= t),
    'active_7', count(*) filter (where last_used_on >= t - 6),
    'active_30', count(*) filter (where last_used_on >= t - 29),
    'returning', count(*) filter (where last_used_on > created_on),
    'eligible', count(*) filter (where created_on < t),
    'never_returned', count(*) filter (where created_on < t and last_used_on <= created_on),
    'retention', jsonb_build_object(
      'd1',  jsonb_build_object('eligible', count(*) filter (where created_on <= t - 1),  'kept', count(*) filter (where created_on <= t - 1  and last_used_on >= created_on + 1)),
      'd7',  jsonb_build_object('eligible', count(*) filter (where created_on <= t - 7),  'kept', count(*) filter (where created_on <= t - 7  and last_used_on >= created_on + 7)),
      'd30', jsonb_build_object('eligible', count(*) filter (where created_on <= t - 30), 'kept', count(*) filter (where created_on <= t - 30 and last_used_on >= created_on + 30))),
    'median_age_days', coalesce(round((percentile_cont(0.5) within group (order by (t - created_on)))::numeric, 1), 0),
    'median_lifetime_days', coalesce(round((percentile_cont(0.5) within group (order by (last_used_on - created_on)))::numeric, 1), 0),
    'expiring_30', count(*) filter (where last_used_on <= ((t + 30) - interval '12 months')::date),
    'expiring_90', count(*) filter (where last_used_on <= ((t + 90) - interval '12 months')::date),
    'idle_180', count(*) filter (where last_used_on < t - 180),
    'syncs', coalesce(sum(rev - 1), 0),
    'avg_bytes', coalesce(round(avg(snapshot_bytes)), 0),
    'total_bytes', coalesce(sum(snapshot_bytes), 0),
    'range', jsonb_build_object(
      'created', count(*) filter (where created_on between f and e),
      'returned', count(*) filter (where created_on between f and e and last_used_on > created_on),
      'prev_created', count(*) filter (where created_on between f - len and f - 1),
      'prev_returned', count(*) filter (where created_on between f - len and f - 1 and last_used_on > created_on),
      'returning', count(*) filter (where created_on < f and last_used_on between f and e),
      'prev_returning', count(*) filter (where created_on < f - len and last_used_on between f - len and f - 1))
  ) into out from game_saves;

  out := out || jsonb_build_object(
    'table_bytes', pg_total_relation_size('public.game_saves'),
    'by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'created', (select count(*) from game_saves where created_on = d::date)) order by d), '[]'::jsonb)
                 from generate_series(f, e, interval '1 day') d),
    'weeks', (select coalesce(jsonb_agg(jsonb_build_object('week', w::date, 'created', (select count(*) from game_saves where created_on >= w::date and created_on < w::date + 7)) order by w), '[]'::jsonb)
                from generate_series(date_trunc('week', t::timestamp) - interval '11 weeks', date_trunc('week', t::timestamp), interval '1 week') w),
    'throttle', (select jsonb_build_object(
        'failed_tries',    coalesce(sum(failures) filter (where bucket = 'f:global'), 0),
        'ip_locks',        count(*) filter (where bucket like 'f:ip:%' and failures >= 10),
        'breaker_hours',   count(*) filter (where bucket = 'f:global' and failures >= 500),
        'hard_stop_hours', count(*) filter (where bucket = 'f:global' and failures >= 600),
        'create_cap_ip',   count(*) filter (where bucket like 'c:ip:%' and failures > 60),
        'create_cap_day',  count(*) filter (where bucket = 'c:global' and failures > 2000),
        'mail_cap_ip',     count(*) filter (where bucket like 'm:ip:%' and failures > 3),
        'mail_cap_day',    count(*) filter (where bucket = 'm:global' and failures > 300),
        'creates',         coalesce(sum(failures) filter (where bucket = 'c:global'), 0))
      from save_throttle where win >= now() - interval '24 hours'));
  return out;
end $$;

revoke all on function public.save_admin_metrics(date, date) from public, anon, authenticated;
grant execute on function public.save_admin_metrics(date, date) to service_role;

-- Self-check: the last result of this file. "OK, returning in range installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, returning in range installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.game_saves') is null then 'table game_saves (run 20261010_game_saves.sql first)' end,
    case when to_regclass('public.save_throttle') is null then 'table save_throttle (run 20261010_game_saves.sql first)' end,
    case when to_regprocedure('public.save_admin_metrics(date,date)') is null then 'save_admin_metrics'
         when has_function_privilege('anon', to_regprocedure('public.save_admin_metrics(date,date)'), 'execute') then 'anon locked out of save_admin_metrics'
         when has_function_privilege('authenticated', to_regprocedure('public.save_admin_metrics(date,date)'), 'execute') then 'authenticated locked out of save_admin_metrics'
         when not (select prosecdef from pg_proc where oid = to_regprocedure('public.save_admin_metrics(date,date)')) then 'save_admin_metrics security definer' end
    ,case when to_regprocedure('public.save_admin_metrics(date,date)') is not null and position('prev_returning' in pg_get_functiondef(to_regprocedure('public.save_admin_metrics(date,date)'))) = 0 then 'save_admin_metrics without returning in range' end
  ) as missing) x;
