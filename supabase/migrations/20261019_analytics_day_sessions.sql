-- Futbol Island admin: players by day and by player (Oct 16 2026; user: "for players today, can we have that be clickable and
-- into more detail and list each user. same as the on now. show where they came from, time, how long they played for, if they
-- use code, devices and so on", then "i basically want to know by individual level").
-- Run ONCE in the Supabase SQL editor (or `supabase db push`), AFTER 20261018_analytics_live.sql. Paste the WHOLE file. The LAST
-- result must be one row:
--   status = OK, day sessions installed
--
-- Additive and safe on the live DB; running it twice is harmless:
--  * one nullable column analytics_sessions.player_id (32 hex) + a partial index. It is a keyed one-way hash made on the server
--    (lib/analytics/playerId.ts) from the start's one player key: the save code's own keyed hash when a code is active, else the
--    device's random install id (fi2-install-v1). Never the code, the code hash (the save store's key), the install id, an IP or
--    a name. Rows before this file (and tabs that send no key) stay null. It is deleted with its session after 14 days, as before.
--  * public.analytics_ingest(jsonb) replaced: identical to 20261018_analytics_live.sql except that a start also keeps player_id
--    (a 32-hex string only; anything else is null). Same signature, so the server works before and after this runs.
--  * public.analytics_session_rows(text[]): the per-session columns, now in ONE place. analytics_live_sessions is replaced to use
--    it (same output, plus `pid`), and the three new reads below use it too.
--  * public.analytics_day_sessions(p_day, p_limit): every session that STARTED on that Pacific day (midnight to midnight, Los
--    Angeles: the same day the "Players" tile counts), newest first, each with the live columns (anonymous 6-hex `sid`, start,
--    last seen, foreground seconds, device, country/region, source, new/returning, code yes/no, seconds per area and activity,
--    8 counts, `pid`), and the day's totals by area, country, source, device, new vs returning, code vs no code. A day older than
--    the 14 kept days has no session rows any more: it comes back with `partial: true`, no rows, and the totals the frozen day
--    rollup still holds (sessions, visitors, country, region, source class, device, seconds per area).
--  * public.analytics_players(p_from, p_to, p_limit): one row per player id seen in the range (newest first): `pid` (12 hex of
--    a further hash, shown as 6), first and last seen, sessions, days played, foreground time, top areas, devices, countries,
--    regions, sources, code yes/no, returning, counts.
--  * public.analytics_player_sessions(p_pid, p_limit): one player's sessions (same columns), newest first, and their totals;
--    `partial` when their history may reach past the 14 kept days.
-- All reads are service_role only (the /admin server routes, behind the admin session).
--
-- tests/admin-analytics-day.cjs replays every migration on a throwaway Postgres and checks these functions and the self-check
-- row; tests/admin-analytics-coverage.cjs replays this file as the newest analytics_ingest.

alter table public.analytics_sessions add column if not exists player_id text check (player_id ~ '^[0-9a-f]{32}$');
create index if not exists analytics_sessions_player_idx on public.analytics_sessions (player_id, started_at) where player_id is not null;

create or replace function public.analytics_ingest(p jsonb) returns void
language plpgsql security invoker set search_path = public as $$
declare
  v_id text := p->>'session';
  v_e  integer;
begin
  if p->>'type' = 'start' then
    insert into analytics_sessions (id, day, visitor_hash, entry_path, country, region, device, source,
                                    referrer_host, utm_source, utm_medium, utm_campaign, is_returning, has_code, player_id, flags)
    select v_id, (p->>'day')::date, p->>'visitor_hash', p->>'path', p->>'country', p->>'region', p->>'device', p->>'source',
           p->>'referrer_host', p->>'utm_source', p->>'utm_medium', p->>'utm_campaign',
           case when jsonb_typeof(p->'is_returning') = 'boolean' then (p->>'is_returning')::boolean end,
           case when jsonb_typeof(p->'has_code') = 'boolean' then (p->>'has_code')::boolean end,
           case when jsonb_typeof(p->'player_id') = 'string' and p->>'player_id' ~ '^[0-9a-f]{32}$' then p->>'player_id' end,
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

-- The per-session columns (shared by the live, day and player reads). `seen` = the last beat (or the start).
create or replace function public.analytics_session_rows(p_ids text[])
returns table (id text, r jsonb, started_at timestamptz, seen timestamptz)
language sql stable security definer set search_path = public as $$
  with
  bt as (
    select b.session_id, b.id, b.ts, b.engaged_ms, b.area_ms, b.activity_ms, b.counts,
           (select key from jsonb_each_text(b.area_ms) where value ~ '^[0-9]+$' and value::bigint > 0 order by value::bigint desc, key limit 1) as area,
           (select key from jsonb_each_text(b.activity_ms) where key <> 'idle' and value ~ '^[0-9]+$' and value::bigint > 0 order by value::bigint desc, key limit 1) as activity
      from analytics_beats b where b.session_id = any(p_ids)),
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
            from analytics_sessions s where s.id = any(p_ids)),
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
             'device_today_sessions', dev.sessions, 'device_today_seconds', dev.seconds,
             'pid', case when s.player_id is not null then left(encode(sha256(convert_to(s.player_id || ':futbol-island-player-v1', 'UTF8')), 'hex'), 12) end) as r,
           s.started_at,
           greatest(s.started_at, coalesce(agg.last_beat, s.started_at)) as seen
      from analytics_sessions s
      left join agg on agg.session_id = s.id left join cur on cur.session_id = s.id left join cur_act on cur_act.session_id = s.id
      left join prev on prev.session_id = s.id left join cs on cs.session_id = s.id left join ar on ar.session_id = s.id
      left join ac on ac.session_id = s.id left join dev on dev.id = s.id
     where s.id = any(p_ids))
  select id, r, started_at, seen from sess_rows;
$$;

create or replace function public.analytics_live_sessions(p_minutes integer default 5) returns jsonb
language sql stable security definer set search_path = public as $$
  with w as (select now() - make_interval(mins => least(greatest(coalesce(p_minutes, 5), 1), 60)) as since),
  ids as (select id from analytics_sessions, w where started_at >= w.since
          union select session_id from analytics_beats, w where ts >= w.since),
  sess_rows as (select * from analytics_session_rows(array(select id from ids))),
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

-- Totals over a set of session rows (the day panel's strips and a player's header). Raw rows only.
create or replace function public.analytics_rows_totals(p_rows jsonb) returns jsonb
language sql immutable security definer set search_path = public as $$
  with x as (select e as r from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) e),
  cc as (select coalesce(r->>'country', '(unknown)') c, r->>'region' rg from x),
  ar as (select a.key, count(*) filter (where a.value::bigint > 0) n, sum(a.value::bigint) s
           from x, jsonb_each_text(x.r->'areas') a where a.value ~ '^[0-9]+$' group by a.key)
  select jsonb_build_object(
    'sessions', (select count(*) from x),
    'players', (select count(distinct r->>'pid') from x where r->>'pid' is not null),
    'seconds', (select coalesce(sum((r->>'seconds_active')::bigint), 0) from x),
    'by_area', coalesce((select jsonb_agg(jsonb_build_object('key', key, 'n', n, 'seconds', s) order by s desc, key) from ar where s > 0), '[]'::jsonb),
    'by_country', coalesce((select jsonb_agg(jsonb_build_object('country', y.c, 'n', y.n,
                    'regions', coalesce((select jsonb_agg(jsonb_build_object('region', z.rg, 'n', z.rn) order by z.rn desc, z.rg)
                                           from (select rg, count(*) rn from cc where cc.c = y.c and rg is not null group by rg) z), '[]'::jsonb))
                    order by y.n desc, y.c)
                  from (select c, count(*) n from cc group by c) y), '[]'::jsonb),
    'by_source', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from
                (select coalesce(r->>'campaign', r->>'referrer_host', 'direct') k, count(*) n from x group by 1) y), '[]'::jsonb),
    'by_device', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from
                (select coalesce(r->>'device', 'unknown') k, count(*) n from x group by 1) y), '[]'::jsonb),
    'returning', jsonb_build_object(
       'new',       (select count(*) from x where r->'returning' = 'false'::jsonb),
       'returning', (select count(*) from x where r->'returning' = 'true'::jsonb),
       'unknown',   (select count(*) from x where coalesce(r->'returning', 'null'::jsonb) = 'null'::jsonb)),
    'code', jsonb_build_object(
       'with',      (select count(*) from x where r->'has_code' = 'true'::jsonb),
       'without',   (select count(*) from x where r->'has_code' = 'false'::jsonb),
       'unknown',   (select count(*) from x where coalesce(r->'has_code', 'null'::jsonb) = 'null'::jsonb)),
    'counts', (select jsonb_object_agg(k, n) from (
                 select c.key k, sum(c.value::bigint) n from x, jsonb_each_text(x.r->'counts') c where c.value ~ '^[0-9]+$' group by c.key) q));
$$;

create or replace function public.analytics_day_sessions(p_day date, p_limit integer default 500) returns jsonb
language sql stable security definer set search_path = public as $$
  with b as (select (p_day::timestamp at time zone 'America/Los_Angeles') lo, ((p_day + 1)::timestamp at time zone 'America/Los_Angeles') hi,
                    (now() at time zone 'America/Los_Angeles')::date today),
  ids as (select s.id from analytics_sessions s, b where s.started_at >= b.lo and s.started_at < b.hi),
  sr as (select * from analytics_session_rows(array(select id from ids))),
  lim as (select least(greatest(coalesce(p_limit, 500), 1), 2000) n),
  top_rows as (select r, started_at from sr order by started_at desc, id limit (select n from lim)),
  t as (select analytics_rows_totals(coalesce((select jsonb_agg(r) from sr), '[]'::jsonb)) j),
  part as (select p_day < b.today - 14 and not exists (select 1 from sr) as partial, b.today from b),
  roll as (select data from (select data, 1 o from analytics_daily_pt where day = p_day
                             union all select data, 2 from analytics_daily where day = p_day) q order by o limit 1),
  dim as (select d.key dim, e.key k, coalesce((e.value->>'s')::bigint, 0) n
            from roll, jsonb_each(case when jsonb_typeof(roll.data->'dims') = 'object' then roll.data->'dims' else '{}'::jsonb end) d,
                 jsonb_each(case when jsonb_typeof(d.value) = 'object' then d.value else '{}'::jsonb end) e)
  select case when (select partial from part) then jsonb_build_object(
    'day', p_day, 'generated_at', now(), 'partial', true, 'window_days', 14, 'oldest_day', (select today - 14 from part),
    'tz', coalesce((select data->>'tz' from roll), case when exists (select 1 from roll) then 'UTC' end),
    'sessions', coalesce((select (data->>'sessions')::bigint from roll), 0),
    'visitors', coalesce((select (data->>'visitors')::bigint from roll), 0),
    'players', null, 'seconds', coalesce((select (data->>'engagedMs')::bigint / 1000 from roll), 0),
    'by_area', coalesce((select jsonb_agg(jsonb_build_object('key', a.key, 'n', null, 'seconds', a.value::bigint / 1000) order by a.value::bigint desc, a.key)
                  from roll, jsonb_each_text(case when jsonb_typeof(roll.data->'areaMs') = 'object' then roll.data->'areaMs' else '{}'::jsonb end) a
                 where a.value ~ '^[0-9]+$' and a.value::bigint >= 1000), '[]'::jsonb),
    'by_country', coalesce((select jsonb_agg(jsonb_build_object('country', c.k, 'n', c.n,
                    'regions', coalesce((select jsonb_agg(jsonb_build_object('region', split_part(g.k, '-', 2), 'n', g.n) order by g.n desc, g.k)
                                           from dim g where g.dim = 'region' and split_part(g.k, '-', 1) = c.k), '[]'::jsonb)) order by c.n desc, c.k)
                  from dim c where c.dim = 'country'), '[]'::jsonb),
    'by_source', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from dim where dim = 'source'), '[]'::jsonb),
    'by_device', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k) from dim where dim = 'device'), '[]'::jsonb),
    'returning', null, 'code', null, 'rows', '[]'::jsonb, 'truncated', false)
  else (select j from t) || jsonb_build_object(
    'day', p_day, 'generated_at', now(), 'partial', false, 'window_days', 14, 'oldest_day', (select today - 14 from part),
    'tz', 'America/Los_Angeles',
    'visitors', (select count(distinct visitor_hash) from analytics_sessions where id in (select id from ids)),
    'rows', coalesce((select jsonb_agg(r order by started_at desc) from top_rows), '[]'::jsonb),
    'truncated', (select count(*) from sr) > (select n from lim))
  end;
$$;

create or replace function public.analytics_players(p_from date, p_to date, p_limit integer default 300) returns jsonb
language sql stable security definer set search_path = public as $$
  with b as (select (least(p_from, p_to)::timestamp at time zone 'America/Los_Angeles') lo, ((greatest(p_from, p_to) + 1)::timestamp at time zone 'America/Los_Angeles') hi,
                    (now() at time zone 'America/Los_Angeles')::date today),
  s as (select s.* from analytics_sessions s, b where s.started_at >= b.lo and s.started_at < b.hi),
  ps as (select * from s where player_id is not null),
  bt as (select bb.session_id, coalesce(sum(bb.engaged_ms), 0)::bigint e, max(bb.ts) last
           from analytics_beats bb where bb.session_id in (select id from ps) group by bb.session_id),
  ar as (select ps.player_id, e.key, sum(e.value::bigint) / 1000 sec
           from analytics_beats bb join ps on ps.id = bb.session_id, jsonb_each_text(bb.area_ms) e
          where e.value ~ '^[0-9]+$' group by 1, 2),
  cn as (select ps.player_id, c.key, sum(c.value::bigint) n
           from analytics_beats bb join ps on ps.id = bb.session_id, jsonb_each_text(bb.counts) c
          where c.value ~ '^[0-9]+$' group by 1, 2),
  fs as (select player_id, min(started_at) first_seen from analytics_sessions
          where player_id in (select player_id from ps) group by player_id),
  p as (select ps.player_id,
               max(greatest(ps.started_at, coalesce(bt.last, ps.started_at))) last_seen,
               count(*) sessions,
               count(distinct (ps.started_at at time zone 'America/Los_Angeles')::date) days,
               coalesce(sum(bt.e), 0) / 1000 seconds,
               coalesce(array_agg(distinct ps.device) filter (where ps.device is not null), '{}') devices,
               coalesce(array_agg(distinct ps.country) filter (where ps.country is not null), '{}') countries,
               coalesce(array_agg(distinct ps.country || '-' || ps.region) filter (where ps.country is not null and ps.region is not null), '{}') regions,
               array_agg(distinct coalesce(ps.utm_source, ps.utm_campaign, ps.referrer_host, 'direct')) sources,
               bool_or(ps.has_code) has_code, bool_or(ps.is_returning) is_ret
          from ps left join bt on bt.session_id = ps.id group by ps.player_id),
  lim as (select least(greatest(coalesce(p_limit, 300), 1), 2000) n),
  top_p as (select * from p order by last_seen desc, player_id limit (select n from lim))
  select jsonb_build_object(
    'from', least(p_from, p_to), 'to', greatest(p_from, p_to), 'generated_at', now(), 'window_days', 14,
    'oldest_day', (select today - 14 from b),
    'partial', least(p_from, p_to) < (select today - 14 from b),
    'players', (select count(*) from p),
    'sessions', (select count(*) from s),
    'unattributed', (select count(*) from s where player_id is null),
    'truncated', (select count(*) from p) > (select n from lim),
    'rows', coalesce((select jsonb_agg(jsonb_build_object(
        'pid', left(encode(sha256(convert_to(top_p.player_id || ':futbol-island-player-v1', 'UTF8')), 'hex'), 12),
        'first_seen', fs.first_seen, 'last_seen', top_p.last_seen, 'sessions', top_p.sessions, 'days_played', top_p.days,
        'seconds', top_p.seconds,
        'areas', coalesce((select jsonb_agg(jsonb_build_object('key', q.key, 'seconds', q.sec) order by q.sec desc, q.key)
                             from (select key, sec from ar where ar.player_id = top_p.player_id and sec > 0 order by sec desc, key limit 3) q), '[]'::jsonb),
        'devices', to_jsonb(top_p.devices), 'countries', to_jsonb(top_p.countries), 'regions', to_jsonb(top_p.regions),
        'sources', to_jsonb(top_p.sources), 'has_code', top_p.has_code, 'returning', top_p.is_ret,
        'counts', jsonb_build_object(
           'balls',     coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'su:ball_find'), 0),
           'fish',      coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'fi:land'), 0),
           'lessons',   coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key like 'lo:%'), 0),
           'quizzes',   coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key like 'lf:%'), 0),
           'swims',     coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'wa:swim_start'), 0),
           'paintings', coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'su:easel_save'), 0),
           'fruit',     coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key like 'su:fruit\_%'), 0),
           'kicks',     coalesce((select sum(n) from cn where cn.player_id = top_p.player_id and key = 'su:kick_play'), 0)))
        order by top_p.last_seen desc, top_p.player_id)
      from top_p join fs on fs.player_id = top_p.player_id), '[]'::jsonb));
$$;

create or replace function public.analytics_player_sessions(p_pid text, p_limit integer default 200) returns jsonb
language sql stable security definer set search_path = public as $$
  with pl as (select distinct player_id from analytics_sessions
               where coalesce(p_pid, '') ~ '^[0-9a-f]{12}$' and player_id is not null
                 and left(encode(sha256(convert_to(player_id || ':futbol-island-player-v1', 'UTF8')), 'hex'), 12) = p_pid),
  ids as (select id from analytics_sessions where player_id in (select player_id from pl)),
  sr as (select * from analytics_session_rows(array(select id from ids))),
  lim as (select least(greatest(coalesce(p_limit, 200), 1), 1000) n),
  top_rows as (select r, started_at from sr order by started_at desc, id limit (select n from lim)),
  b as (select (now() at time zone 'America/Los_Angeles')::date today)
  select analytics_rows_totals(coalesce((select jsonb_agg(r) from sr), '[]'::jsonb)) || jsonb_build_object(
    'pid', case when exists (select 1 from pl) then p_pid end,
    'generated_at', now(), 'window_days', 14, 'oldest_day', (select today - 14 from b),
    'first_seen', (select min(started_at) from sr), 'last_seen', (select max(seen) from sr),
    'days_played', (select count(distinct (started_at at time zone 'America/Los_Angeles')::date) from sr),
    -- Their history may go back further than the kept rows: the first kept session is within a day of the purge line.
    'partial', coalesce((select min(started_at) from sr) < (((select today - 13 from b))::timestamp at time zone 'America/Los_Angeles'), false),
    'truncated', (select count(*) from sr) > (select n from lim),
    'rows', coalesce((select jsonb_agg(r order by started_at desc) from top_rows), '[]'::jsonb));
$$;

revoke all on function public.analytics_session_rows(text[]), public.analytics_rows_totals(jsonb), public.analytics_live_sessions(integer),
  public.analytics_day_sessions(date, integer), public.analytics_players(date, date, integer), public.analytics_player_sessions(text, integer)
  from public, anon, authenticated;
grant execute on function public.analytics_session_rows(text[]), public.analytics_rows_totals(jsonb), public.analytics_live_sessions(integer),
  public.analytics_day_sessions(date, integer), public.analytics_players(date, date, integer), public.analytics_player_sessions(text, integer)
  to service_role;

-- Self-check: the last result of this file.
select case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analytics_sessions' and column_name = 'player_id')
            and (select prosrc from pg_proc where oid = to_regprocedure('public.analytics_ingest(jsonb)')) like '%player_id%'
            and (select prosrc from pg_proc where oid = to_regprocedure('public.analytics_live_sessions(integer)')) like '%analytics_session_rows%'
            and to_regprocedure('public.analytics_session_rows(text[])') is not null
            and to_regprocedure('public.analytics_rows_totals(jsonb)') is not null
            and to_regprocedure('public.analytics_day_sessions(date, integer)') is not null
            and to_regprocedure('public.analytics_players(date, date, integer)') is not null
            and to_regprocedure('public.analytics_player_sessions(text, integer)') is not null
  then 'OK, day sessions installed' else 'NOT INSTALLED: day sessions' end as status;
