-- Futbol Island admin: party retention with EXACT numbers (Nov 8 2026 owner ruling: exact numbers in /admin).
--
-- Replaces public.analytics_party_retention from 20261022_analytics_party_retention.sql (run that file first): the same
-- computation, but no "<10" floor. Every count comes back as the exact number (0 included); a D1 / D7 rate is null only when
-- no player's return window has finished yet (nothing to divide by). Still aggregates only: no player id, session id or
-- per-player row in the output, and service_role only. The weekly sponsor snapshot (analytics_sponsor_weekly) is unchanged.
-- The legal sign-off in 20261022_analytics_party_retention.sql still applies (the card stays behind
-- NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1).
--
-- Run ONCE in the Supabase SQL editor (or `supabase db push`), AFTER 20261022_analytics_party_retention.sql. Paste the WHOLE file.
-- The LAST result must be one row:
--   status = OK, party retention exact
-- Running it twice is harmless. tests/admin-party-retention.cjs runs it on a throwaway Postgres against lib/analytics/partyRetention.ts.

create or replace function public.analytics_party_retention(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with w as (select greatest(least(p_from, p_to), (now() at time zone 'utc')::date - 14) f,
                    least(greatest(p_from, p_to), (now() at time zone 'utc')::date) t,
                    least(greatest(p_from, p_to), (now() at time zone 'utc')::date - 1) l),
  s as (select a.id, a.day, a.player_id, a.is_returning from analytics_sessions a, w where a.day between w.f and w.t),
  n as (select b.session_id, c.key, sum(c.value::bigint) v
          from analytics_beats b join s on s.id = b.session_id, jsonb_each_text(b.counts) c
         where c.key in ('mp:in', 'mp:open_link', 'mp:guest_new', 'mp:created') and c.value ~ '^[0-9]+$'
         group by 1, 2),
  sc as (select s.id, s.day, s.player_id, s.is_returning,
                exists (select 1 from n where n.session_id = s.id and n.key = 'mp:in' and n.v > 0) party,
                exists (select 1 from n where n.session_id = s.id and n.key in ('mp:open_link', 'mp:guest_new') and n.v > 0) invited
           from s),
  pl as (select player_id, min(day) c from sc where player_id is not null group by 1),
  pg as (select pl.player_id, pl.c,
                bool_or(sc.party and sc.day = pl.c) party,
                bool_or(sc.day = pl.c + 1) d1,
                bool_or(sc.day between pl.c + 1 and pl.c + 7) d7
           from pl join sc on sc.player_id = pl.player_id group by 1, 2),
  g as (select case when party then 'party' else 'solo' end grp, count(*) players,
               count(*) filter (where c + 1 <= w.l) d1_n, count(*) filter (where c + 1 <= w.l and d1) d1_back,
               count(*) filter (where c + 7 <= w.l) d7_n, count(*) filter (where c + 7 <= w.l and d7) d7_back
          from pg, w group by 1),
  gj as (select k.grp, jsonb_build_object(
            'players',     coalesce(g.players, 0),
            'd1_eligible', coalesce(g.d1_n, 0),
            'd1_rate',     case when coalesce(g.d1_n, 0) > 0 then round(g.d1_back::numeric / g.d1_n, 4) end,
            'd7_eligible', coalesce(g.d7_n, 0),
            'd7_rate',     case when coalesce(g.d7_n, 0) > 0 then round(g.d7_back::numeric / g.d7_n, 4) end) j
           from (values ('party'), ('solo')) k(grp) left join g on g.grp = k.grp),
  np as (select count(*) filter (where is_returning = false) total,
                count(*) filter (where is_returning = false and invited) inv,
                count(*) filter (where is_returning = false and not invited) org
           from sc),
  vt as (select coalesce(sum(v) filter (where key = 'mp:guest_new'), 0) gnew, coalesce(sum(v) filter (where key = 'mp:created'), 0) created from n)
  select jsonb_build_object(
    'from', w.f, 'to', w.t, 'last_complete_day', w.l, 'window_days', 14, 'min_group', 1,
    'groups', (select jsonb_object_agg(grp, j) from gj),
    'new_players', jsonb_build_object(
       'sessions', np.total,
       'invited',  np.inv,
       'organic',  np.org),
    'virality', jsonb_build_object(
       'guest_new', vt.gnew,
       'created',   vt.created))
  from w, np, vt;
$$;

revoke all on function public.analytics_party_retention(date, date) from public, anon, authenticated;
grant execute on function public.analytics_party_retention(date, date) to service_role;

-- Self-check: the last result of this file.
select case when to_regprocedure('public.analytics_party_retention(date,date)') is null then 'NOT INSTALLED: analytics_party_retention (run 20261022_analytics_party_retention.sql first)'
            when has_function_privilege('anon', to_regprocedure('public.analytics_party_retention(date,date)'), 'execute') then 'NOT INSTALLED: anon locked out of analytics_party_retention'
            when has_function_privilege('authenticated', to_regprocedure('public.analytics_party_retention(date,date)'), 'execute') then 'NOT INSTALLED: authenticated locked out of analytics_party_retention'
            else 'OK, party retention exact' end as status;
