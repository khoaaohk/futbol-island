-- Futbol Island admin: the sponsor Overview's "by device" and "by country" drill-downs (Oct 20 2026; owner: "add more to the
-- admin portal to capture behaviour to sell sponsorships ... design it so the data is simple, then drill in").
-- Run ONCE in the Supabase SQL editor (or `supabase db push`), AFTER 20261019_analytics_day_sessions.sql. Paste the WHOLE file.
-- The LAST result must be one row:
--   status = OK, sponsor split installed
--
-- Read-only and additive; running it twice is harmless. No table, column or ingest change: the new `en:` counters
-- (lib/analytics/countIds.ts ENGAGE_*) already pass analytics_ingest's id-shape check and roll up with every other counter.
--  * public.analytics_sponsor_split(p_from date, p_to date): over the kept raw rows (sessions whose analytics_sessions.day is in
--    the range; the last 14 days only), per device class and per country: sessions, and per sponsor metric the summed counts
--    (games, shirts, cleats, cards, watched, books, quizzes) plus the pop-up book's foreground milliseconds (reading).
--    The metric of a counter id is the SAME rule as lib/analytics/sponsor.ts sponsorMetricOf (tests/admin-sponsor.cjs checks
--    both on a throwaway Postgres). A device or country row resting on fewer than 5 sessions is not listed; its sessions and
--    counts are added to `withheld` instead. service_role only (the /admin server route, behind the admin session).

create or replace function public.analytics_sponsor_metric(p_key text) returns text
language sql immutable set search_path = public as $$
  select case
    when p_key like 'en:game\_%' or p_key = 'su:kick_play' then 'games'
    when p_key = 'sh:save_jersey' then 'shirts'
    when p_key = 'sh:save_boots' then 'cleats'
    when p_key like 'en:card\_%' then 'cards'
    when p_key like 'le:%' or p_key = 'en:film_end' or p_key like 'en:bookend\_%' or p_key = 'tu:finish' then 'watched'
    when p_key like 'en:bookbuy\_%' then 'books'
    when p_key like 'ls:%' then 'quizzes'
  end;
$$;

create or replace function public.analytics_sponsor_split(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with s as (select id, coalesce(device, '(unknown)') device, coalesce(country, '(unknown)') country
               from analytics_sessions where day between least(p_from, p_to) and greatest(p_from, p_to)),
  b as (select b.session_id, b.counts, b.activity_ms from analytics_beats b join s on s.id = b.session_id),
  m as (select b.session_id, analytics_sponsor_metric(c.key) metric, sum(c.value::bigint) n
          from b, jsonb_each_text(b.counts) c where c.value ~ '^[0-9]+$' and analytics_sponsor_metric(c.key) is not null
         group by 1, 2
        union all
        select b.session_id, 'readingMs', sum((b.activity_ms->>'book')::bigint)
          from b where coalesce(b.activity_ms->>'book', '') ~ '^[0-9]+$' group by 1),
  per as (select s.id, s.device, s.country, m.metric, coalesce(m.n, 0) n from s left join m on m.session_id = s.id),
  dim as (select 'device' d, device k, id, metric, n from per union all select 'country', country, id, metric, n from per),
  tot as (select d, k, count(distinct id) sessions from dim group by 1, 2),
  met as (select d, k, metric, sum(n) n from dim where metric is not null group by 1, 2, 3),
  rows as (select t.d, t.k, t.sessions, coalesce((select jsonb_object_agg(metric, n) from met where met.d = t.d and met.k = t.k), '{}'::jsonb) metrics from tot t),
  wh as (select d, sum(sessions) sessions from rows where sessions < 5 group by 1),
  whm as (select met.d, met.metric, sum(met.n) n from met join rows r on r.d = met.d and r.k = met.k and r.sessions < 5 group by 1, 2)
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'window_days', 14, 'min_sessions', 5,
    'sessions', (select count(*) from s),
    'devices',   coalesce((select jsonb_agg(jsonb_build_object('key', k, 'sessions', sessions, 'metrics', metrics) order by sessions desc, k) from rows where d = 'device' and sessions >= 5), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'sessions', sessions, 'metrics', metrics) order by sessions desc, k) from rows where d = 'country' and sessions >= 5), '[]'::jsonb),
    'withheld', jsonb_build_object(
       'devices',   jsonb_build_object('sessions', coalesce((select sessions from wh where d = 'device'), 0),  'metrics', coalesce((select jsonb_object_agg(metric, n) from whm where d = 'device'), '{}'::jsonb)),
       'countries', jsonb_build_object('sessions', coalesce((select sessions from wh where d = 'country'), 0), 'metrics', coalesce((select jsonb_object_agg(metric, n) from whm where d = 'country'), '{}'::jsonb))));
$$;

revoke all on function public.analytics_sponsor_split(date, date) from public, anon, authenticated;
grant execute on function public.analytics_sponsor_split(date, date) to service_role;
revoke all on function public.analytics_sponsor_metric(text) from public, anon, authenticated;
grant execute on function public.analytics_sponsor_metric(text) to service_role;

-- Self-check: the last result of this file. "OK, sponsor split installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, sponsor split installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.analytics_sessions') is null then 'table analytics_sessions (run 20261007_analytics.sql first)' end,
    case when not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analytics_beats' and column_name = 'counts') then 'analytics_beats.counts (run 20261009_analytics_counts.sql first)' end,
    case when to_regprocedure('public.analytics_sponsor_split(date,date)') is null then 'analytics_sponsor_split'
         when has_function_privilege('anon', to_regprocedure('public.analytics_sponsor_split(date,date)'), 'execute') then 'anon locked out of analytics_sponsor_split'
         when has_function_privilege('authenticated', to_regprocedure('public.analytics_sponsor_split(date,date)'), 'execute') then 'authenticated locked out of analytics_sponsor_split' end
  ) as missing) x;
