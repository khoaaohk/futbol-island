-- Futbol Island admin live sessions (Oct 15 2026; user: "on click 3 on now, opens slide out to show all that info", "how much
-- time they have spent so far", "if they are a returning user with saved codes or not").
-- Run ONCE in the Supabase SQL editor (or `supabase db push`), AFTER 20261017_analytics_water.sql. Paste the WHOLE file. The LAST
-- result must be one row:
--   status = OK, live sessions installed
--
-- Additive and safe on the live DB; running it twice is harmless:
--  * two nullable boolean columns on analytics_sessions: `is_returning` (this device has played here before: a last-visit day, saved
--    progress or a save code exist in the game's own storage) and `has_code` (a save code is active on it). A yes/no each, read
--    once at a session's start; never the code, never a device id. Null = the tab did not say (older tabs, rows before this file).
--  * public.analytics_ingest(jsonb) replaced: identical to 20261017_analytics_water.sql except that a start also keeps those two
--    booleans (jsonb booleans only; anything else is null). Same signature, so the server works before and after this runs.
--  * public.analytics_live_sessions(p_minutes) and public.analytics_sources_summary(p_from, p_to): reads only, service_role only.
--
-- What is already captured (since 20261007_analytics.sql) and only read here: the country and region a session connects from
-- (Vercel's x-vercel-ip-country / x-vercel-ip-country-region headers, read on the server at the session start; never the IP,
-- never the city), the referring site's host (no path, no query) and the utm_* / `?from=` tag (lib/analytics/tracker.ts sends
-- `?from=flyer` as the source when no utm_source is present). Raw rows are kept 14 days (analytics_finalize), as before.
--
-- Live (/admin "N on now" → the slide-out; lib/analytics/live.ts, app/api/admin/live): one row per session with a start or a beat
-- in the last p_minutes (1–60, default 5: the same rule as analytics_live, so the tile and the panel agree). A session is shown
-- by `sid`, the first 6 hex of sha256(id || a fixed salt): never its id, never the visitor hash. Time is foreground time
-- (the sum of the beats' engaged_ms: hidden tabs and 10+ idle minutes do not count), so a tab left open in the background does
-- not grow. "Same device today" sums the sessions sharing the day's visitor hash (daily salt + IP + browser; a school network on
-- identical iPads looks like one device); there is no "all time" because that hash rotates every day by design.
-- Sources (the day view): sessions in [p_from, p_to] (by analytics_sessions.day, last 14 days of raw rows) by country (with
-- regions), by source (campaign tag, else referring host, else direct), new vs returning, with a code vs without. Any row under 3
-- sessions comes back as null (shown "<3"), like the fishing section does under 5.
--
-- tests/admin-analytics-live.cjs replays every migration on a throwaway Postgres and checks both functions and the self-check row;
-- tests/admin-analytics-coverage.cjs replays this file as the newest analytics_ingest.

alter table public.analytics_sessions add column if not exists is_returning boolean;
alter table public.analytics_sessions add column if not exists has_code  boolean;

create or replace function public.analytics_ingest(p jsonb) returns void
language plpgsql security invoker set search_path = public as $$
declare
  v_id text := p->>'session';
  v_e  integer;
begin
  if p->>'type' = 'start' then
    insert into analytics_sessions (id, day, visitor_hash, entry_path, country, region, device, source,
                                    referrer_host, utm_source, utm_medium, utm_campaign, is_returning, has_code, flags)
    select v_id, (p->>'day')::date, p->>'visitor_hash', p->>'path', p->>'country', p->>'region', p->>'device', p->>'source',
           p->>'referrer_host', p->>'utm_source', p->>'utm_medium', p->>'utm_campaign',
           case when jsonb_typeof(p->'is_returning') = 'boolean' then (p->>'is_returning')::boolean end,
           case when jsonb_typeof(p->'has_code') = 'boolean' then (p->>'has_code')::boolean end,
           (select coalesce(jsonb_object_agg(key, value::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'flags') = 'object' then p->'flags' else '{}'::jsonb end)
             where (key = 'p' and value in ('0','1','2','3')) or (key = 'g' and value in ('0','1','2','3','4'))
                or (key = 's' and value ~ '^([0-9]|1[0-5])$') or (key = 'v' and value in ('0','1','2','3')))
    where (select count(*) from analytics_sessions where day = (p->>'day')::date and visitor_hash = p->>'visitor_hash') < 150
    on conflict (id) do nothing;
  elsif p->>'type' = 'beat' then
    v_e := least(greatest(coalesce((p->>'engaged_ms')::integer, 0), 0), 300000);
    insert into analytics_beats (session_id, engaged_ms, pageviews, area_ms, place_ms, activity_ms, cells, counts)
    select s.id,
           v_e,
           least(greatest(coalesce((p->>'pageviews')::integer, 0), 0), 100),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, 300000)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'area_ms') = 'object' then p->'area_ms' else '{}'::jsonb end)
             where key in ('island','paths','arcade','museum','konbini','shop','controller','other') and value ~ '^[0-9]{1,7}$'),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'place_ms') = 'object' then p->'place_ms' else '{}'::jsonb end)
             where key in ('island_square','arcade','konbini','coaches','library_square','community_park','old_town','field_7v7','field_futsal','palm_coast','west_side','field_9v9','club_grounds','community_hall','community_garden','farmers_market','east_jetty','field_11v11','school','museum','south_pier','ferry_dock','north_beach','town','causeway','sandbars','deep_sea_boat','cay_town','cay_konbini','hostel','farm','beach_court','sharks_beach','coral_cay','summit_sandbar','summit_pitch','summit_isle','sea')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, v_e)::integer), '{}'::jsonb)
              from jsonb_each_text(case when jsonb_typeof(p->'activity_ms') = 'object' then p->'activity_ms' else '{}'::jsonb end)
             where key in ('walk','ride','fly','boat','fishing','job','lesson','watch','quiz','book','cards','films','vending','talk','coaches','paths','menu','arcade_lobby','arcade_live','arcade_runner','arcade_tennis','arcade_pinball','arcade_puzzle','museum_hall','exhibit_timeline','exhibit_laws-1863','exhibit_penalty-1891','exhibit_stadiums','exhibit_boots','exhibit_var-2018','exhibit_worldcup-1930','exhibit_wwc-1991','exhibit_futsal-1989','exhibit_laced-leather','exhibit_telstar-1970','exhibit_shirts','exhibit_hall-of-fame','exhibit_ballon-dor','exhibit_first-international-1872','exhibit_offside-rules','exhibit_formations-history','exhibit_floodlights-1878','exhibit_copa-america-1916','exhibit_keeper-hands-1912','exhibit_free-kick-wall','exhibit_ball-curve','exhibit_throw-in','konbini_shop','kit_shop','kit_studio','swim','controller','other','idle')
               and value ~ '^[0-9]{1,7}$' and value::integer > 0),
           (select coalesce(jsonb_object_agg(key, v), '{}'::jsonb) from (
              select key, least(value::integer, v_e / 1000) v
                from jsonb_each_text(case when jsonb_typeof(p->'cells') = 'object' then p->'cells' else '{}'::jsonb end)
               where key ~ '^(0|[1-9][0-9]{0,3})$' and key::integer < 1612 and value ~ '^[0-9]{1,4}$' and value::integer > 0
               order by value::integer desc, key::integer limit 64) c where v > 0),
           (select coalesce(jsonb_object_agg(key, v), '{}'::jsonb) from (
              select key, least(value::integer, 50) v
                from jsonb_each_text(case when jsonb_typeof(p->'counts') = 'object' then p->'counts' else '{}'::jsonb end)
               where key ~ '^[a-z]{1,2}:[A-Za-z0-9_]{1,40}(:[A-Za-z0-9_]{1,12}){0,2}$' and value ~ '^[0-9]{1,6}$' and value::integer > 0
               order by value::integer desc, key collate "C" limit 64) k)
      from analytics_sessions s
     where s.id = v_id
       and s.started_at > now() - interval '24 hours'
       and (select count(*) from analytics_beats b where b.session_id = s.id) < 300;
  end if;
end $$;

revoke all on function public.analytics_ingest(jsonb) from public, anon, authenticated;
grant execute on function public.analytics_ingest(jsonb) to service_role;

create or replace function public.analytics_live_sessions(p_minutes integer default 5) returns jsonb
language sql stable security definer set search_path = public as $$
  with w as (select now() - make_interval(mins => least(greatest(coalesce(p_minutes, 5), 1), 60)) as since),
  ids as (select id from analytics_sessions, w where started_at >= w.since
          union select session_id from analytics_beats, w where ts >= w.since),
  bt as (
    select b.session_id, b.id, b.ts, b.engaged_ms, b.area_ms, b.activity_ms, b.counts,
           (select key from jsonb_each_text(b.area_ms) where value ~ '^[0-9]+$' and value::bigint > 0 order by value::bigint desc, key limit 1) as area,
           (select key from jsonb_each_text(b.activity_ms) where key <> 'idle' and value ~ '^[0-9]+$' and value::bigint > 0 order by value::bigint desc, key limit 1) as activity
      from analytics_beats b where b.session_id in (select id from ids)),
  cur as (select distinct on (session_id) session_id, area, id from bt where area is not null order by session_id, ts desc, id desc),
  cur_act as (select distinct on (session_id) session_id, activity from bt where activity is not null order by session_id, ts desc, id desc),
  prev as (select distinct on (bt.session_id) bt.session_id, bt.area from bt join cur on cur.session_id = bt.session_id
            where bt.area is not null and bt.area <> cur.area and bt.id < cur.id order by bt.session_id, bt.ts desc, bt.id desc),
  agg as (select session_id, max(ts) as last_beat, min(ts) as first_beat, sum(engaged_ms)::bigint as engaged, count(*) as beats
            from bt group by session_id),
  cnt as (select bt.session_id, c.key, sum(c.value::bigint) as n from bt, jsonb_each_text(bt.counts) c
           where c.value ~ '^[0-9]+$' group by bt.session_id, c.key),
  cs as (select session_id, jsonb_build_object(
           'balls',     coalesce(sum(n) filter (where key = 'su:ball_find'), 0),
           'fish',      coalesce(sum(n) filter (where key = 'fi:land'), 0),
           'lessons',   coalesce(sum(n) filter (where key like 'lo:%'), 0),
           'quizzes',   coalesce(sum(n) filter (where key like 'lf:%'), 0),
           'swims',     coalesce(sum(n) filter (where key = 'wa:swim_start'), 0),
           'paintings', coalesce(sum(n) filter (where key = 'su:easel_save'), 0),
           'fruit',     coalesce(sum(n) filter (where key like 'su:fruit\_%'), 0),
           'kicks',     coalesce(sum(n) filter (where key = 'su:kick_play'), 0)) as counts
           from cnt group by session_id),
  ar as (select a.session_id, jsonb_object_agg(a.key, a.s) as areas from (
           select bt.session_id, e.key, (sum(e.value::bigint) / 1000)::bigint as s from bt, jsonb_each_text(bt.area_ms) e
            where e.value ~ '^[0-9]+$' group by bt.session_id, e.key) a
          where a.s > 0 group by a.session_id),
  ac as (select a.session_id, jsonb_object_agg(a.key, a.s) as activities from (
           select bt.session_id, e.key, (sum(e.value::bigint) / 1000)::bigint as s from bt, jsonb_each_text(bt.activity_ms) e
            where e.value ~ '^[0-9]+$' group by bt.session_id, e.key) a
          where a.s > 0 group by a.session_id),
  dev as (select s.id, (select count(*) from analytics_sessions o where o.day = s.day and o.visitor_hash = s.visitor_hash) as sessions,
                 (select coalesce(sum(b.engaged_ms), 0) / 1000 from analytics_beats b join analytics_sessions o on o.id = b.session_id
                   where o.day = s.day and o.visitor_hash = s.visitor_hash) as seconds
            from analytics_sessions s where s.id in (select id from ids)),
  sess_rows as (
    select s.id, jsonb_build_object(
             'sid', left(encode(sha256(convert_to(s.id || ':futbol-island-live-v1', 'UTF8')), 'hex'), 6),
             'started_at', s.started_at,
             'last_seen', greatest(s.started_at, coalesce(agg.last_beat, s.started_at)),
             'seconds_active', coalesce(agg.engaged, 0) / 1000,
             'span_seconds', floor(extract(epoch from greatest(s.started_at, coalesce(agg.last_beat, s.started_at)) - s.started_at))::bigint,
             'beats', coalesce(agg.beats, 0),
             'device', s.device, 'entry_path', s.entry_path,
             'country', s.country, 'region', s.region,
             'source', s.source, 'referrer_host', s.referrer_host, 'campaign', coalesce(s.utm_source, s.utm_campaign),
             'returning', s.is_returning, 'has_code', s.has_code,
             'area', cur.area, 'activity', cur_act.activity, 'previous_area', prev.area,
             'spot', case when cur.area = 'island' and cur_act.activity is not null and cur_act.activity not in ('walk', 'menu', 'other') then cur_act.activity else cur.area end,
             'areas', coalesce(ar.areas, '{}'::jsonb), 'activities', coalesce(ac.activities, '{}'::jsonb),
             'counts', coalesce(cs.counts, '{"balls":0,"fish":0,"lessons":0,"quizzes":0,"swims":0,"paintings":0,"fruit":0,"kicks":0}'::jsonb),
             'device_today_sessions', dev.sessions, 'device_today_seconds', dev.seconds) as r,
           greatest(s.started_at, coalesce(agg.last_beat, s.started_at)) as seen
      from analytics_sessions s
      left join agg on agg.session_id = s.id left join cur on cur.session_id = s.id left join cur_act on cur_act.session_id = s.id
      left join prev on prev.session_id = s.id left join cs on cs.session_id = s.id left join ar on ar.session_id = s.id
      left join ac on ac.session_id = s.id left join dev on dev.id = s.id
     where s.id in (select id from ids)),
  cc as (select coalesce(r->>'country', '(unknown)') c, r->>'region' rg from sess_rows),
  top_rows as (select r, seen from sess_rows order by seen desc limit 200)
  select jsonb_build_object(
    'minutes', least(greatest(coalesce(p_minutes, 5), 1), 60),
    'generated_at', now(),
    'sessions', (select count(*) from sess_rows),
    'by_area', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from
                (select coalesce(r->>'spot', 'starting') k, count(*) n from sess_rows group by 1) x), '[]'::jsonb),
    'by_country', coalesce((select jsonb_agg(jsonb_build_object('country', x.c, 'n', x.n,
                    'regions', coalesce((select jsonb_agg(jsonb_build_object('region', y.rg, 'n', y.rn) order by y.rn desc, y.rg)
                                           from (select rg, count(*) rn from cc where cc.c = x.c and rg is not null group by rg) y), '[]'::jsonb))
                    order by x.n desc, x.c)
                  from (select c, count(*) n from cc group by c) x), '[]'::jsonb),
    'by_source', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from
                (select coalesce(r->>'campaign', r->>'referrer_host', 'direct') k, count(*) n from sess_rows group by 1) x), '[]'::jsonb),
    'rows', coalesce((select jsonb_agg(r order by seen desc) from top_rows), '[]'::jsonb));
$$;

create or replace function public.analytics_sources_summary(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with s as (select * from analytics_sessions where day between least(p_from, p_to) and greatest(p_from, p_to)),
  sup as (select 3 as k),
  c as (select coalesce(country, '(unknown)') country, count(*) n from s group by 1),
  rg as (select coalesce(country, '(unknown)') country, region, count(*) n from s where region is not null group by 1, 2),
  src as (select coalesce(utm_source, utm_campaign, referrer_host, 'direct') k, count(*) n from s group by 1)
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'window_days', 14, 'min_sessions', (select k from sup),
    'sessions', (select count(*) from s),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('country', c.country, 'n', c.n,
                   'regions', coalesce((select jsonb_agg(jsonb_build_object('region', rg.region, 'n', case when rg.n >= 3 then rg.n end) order by rg.n desc, rg.region)
                                         from rg where rg.country = c.country), '[]'::jsonb)) order by c.n desc, c.country)
                   from c where c.n >= 3), '[]'::jsonb),
    'countries_suppressed', (select coalesce(sum(n), 0) from c where n < 3),
    'sources', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from src where n >= 3), '[]'::jsonb),
    'sources_suppressed', (select coalesce(sum(n), 0) from src where n < 3),
    'returning', jsonb_build_object(
       'new',       (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where is_returning is false),
       'returning', (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where is_returning is true),
       'unknown',   (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where is_returning is null)),
    'code', jsonb_build_object(
       'with',      (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where has_code is true),
       'without',   (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where has_code is false),
       'unknown',   (select case when count(*) >= 3 or count(*) = 0 then count(*) end from s where has_code is null)));
$$;

revoke all on function public.analytics_live_sessions(integer), public.analytics_sources_summary(date, date) from public, anon, authenticated;
grant execute on function public.analytics_live_sessions(integer), public.analytics_sources_summary(date, date) to service_role;

-- Self-check: the last result of this file.
select case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analytics_sessions' and column_name = 'is_returning')
            and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analytics_sessions' and column_name = 'has_code')
            and (select prosrc from pg_proc where oid = to_regprocedure('public.analytics_ingest(jsonb)')) like '%has_code%'
            and to_regprocedure('public.analytics_live_sessions(integer)') is not null
            and to_regprocedure('public.analytics_sources_summary(date, date)') is not null
  then 'OK, live sessions installed' else 'NOT INSTALLED: live sessions' end as status;
