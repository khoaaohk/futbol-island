-- Futbol Island admin: how the island is played, per day (Nov 13 2026; owner: "per-mode split" on the day view and Players tab).
--
-- Run ONCE in the Supabase SQL editor (or `supabase db push`), after 20261019_analytics_day_sessions.sql. Paste the WHOLE file.
-- The LAST result must be one row:
--   status = OK, play modes installed
--
-- Additive; running it twice is harmless. No table, column or ingest change: since Nov 13 2026 the ingest stores each beat's play
-- mode as the counter pm:<s|w|p> = 1 in analytics_beats.counts (lib/analytics/countIds.ts PLAY_MODES; s = Just me, w = Public,
-- with other players, p = Party, with friends). The daily rollups (analytics_daily / analytics_daily_pt) and analytics_session_rows
-- do NOT carry pm: (their counts are a fixed list), so this reads the kept raw rows (the last 14 days only).
--  * public.analytics_play_modes(p_from date, p_to date) -> jsonb, Pacific days, sessions that STARTED in the range:
--      days[]: { day, sessions (all), with_mode (sessions with any pm: beat),
--                modes: { s|w|p: { sessions, seconds (foreground time of the beats in that mode), players (distinct player ids),
--                                  returning (sessions marked returning) } } }
--      totals: the same over the whole range (a session that switched mode counts once per mode it played).
--    Aggregates only: never a session id, player id or code. Before this file runs the app shows "Mode split not installed yet".
--    service_role only (the /admin server route, behind the admin session).

create or replace function public.analytics_play_modes(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with b as (select least(p_from, p_to) f, greatest(p_from, p_to) t, (now() at time zone 'America/Los_Angeles')::date today),
  r as (select (b.f::timestamp at time zone 'America/Los_Angeles') lo, ((b.t + 1)::timestamp at time zone 'America/Los_Angeles') hi from b),
  s as (select s.id, s.player_id, s.is_returning, (s.started_at at time zone 'America/Los_Angeles')::date d
          from analytics_sessions s, r where s.started_at >= r.lo and s.started_at < r.hi),
  bm as (select s.d, s.id, s.player_id, s.is_returning, substr(c.key, 4) m, coalesce(bb.engaged_ms, 0)::bigint e
           from analytics_beats bb join s on s.id = bb.session_id, jsonb_each_text(bb.counts) c
          where c.key in ('pm:s', 'pm:w', 'pm:p') and c.value ~ '^[1-9][0-9]*$'),
  dm as (select d, m, count(distinct id) n, sum(e) / 1000 sec, count(distinct player_id) p,
                count(distinct id) filter (where is_returning) ret
           from bm group by d, m),
  tm as (select m, count(distinct id) n, sum(e) / 1000 sec, count(distinct player_id) p,
                count(distinct id) filter (where is_returning) ret
           from bm group by m),
  dd as (select d, count(*) n from s group by d),
  dw as (select d, count(distinct id) n from bm group by d)
  select jsonb_build_object(
    'from', (select f from b), 'to', (select t from b), 'generated_at', now(), 'window_days', 14,
    'oldest_day', (select today - 14 from b),
    'days', coalesce((select jsonb_agg(jsonb_build_object('day', dd.d, 'sessions', dd.n, 'with_mode', coalesce(dw.n, 0),
              'modes', coalesce((select jsonb_object_agg(dm.m, jsonb_build_object('sessions', dm.n, 'seconds', dm.sec, 'players', dm.p, 'returning', dm.ret))
                                   from dm where dm.d = dd.d), '{}'::jsonb)) order by dd.d)
             from dd left join dw on dw.d = dd.d), '[]'::jsonb),
    'totals', jsonb_build_object('sessions', (select count(*) from s), 'with_mode', (select count(distinct id) from bm),
              'modes', coalesce((select jsonb_object_agg(m, jsonb_build_object('sessions', n, 'seconds', sec, 'players', p, 'returning', ret)) from tm), '{}'::jsonb)));
$$;

revoke all on function public.analytics_play_modes(date, date) from public, anon, authenticated;
grant execute on function public.analytics_play_modes(date, date) to service_role;

select case when exists (select 1 from pg_proc where proname = 'analytics_play_modes')
  then 'OK, play modes installed' else 'analytics_play_modes is missing' end as status;
