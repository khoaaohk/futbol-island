-- Futbol Island admin analytics (Oct 7 2026). Run once in the Supabase SQL editor (or `supabase db push`).
--
-- Privacy: no IP address, user agent, cookie id, email, name, city or coordinates is ever stored. A visitor is a 32-hex
-- hash of (daily salt + IP + UA + host) computed on the server; each day's salt is random, lives in analytics_salts and is
-- deleted by the nightly analytics_finalize(), so hashes from different days cannot be linked.
--
-- Write path: append-only. One insert per event (a session `start`, or a `beat` carrying foreground time, an area split
-- and a page-view count); no row locks, no read-modify-write. Soft caps in SQL: 150 sessions per visitor hash per day,
-- 300 beats per session, beats only within 24 h of the session start.
-- Read path: aggregates only (analytics_days / analytics_hourly / analytics_live); raw rows never leave the database.
-- Retention: raw rows 14 days; the nightly cron (/api/cron/analytics → analytics_finalize) freezes each final day into
-- analytics_daily, which is kept for good.
--
-- Access: RLS is on with NO policies and anon/authenticated have no grants, so the public anon key used by the phone
-- controller cannot read or write any of this. Only the server (SUPABASE_SERVICE_ROLE_KEY) can, through these functions.
--
-- tests/admin-analytics.cjs runs this file on a throwaway Postgres and checks the aggregates against lib/analytics/core.ts.

create table if not exists public.analytics_sessions (
  id            text primary key check (id ~ '^[A-Za-z0-9_-]{16,32}$'),   -- per-tab random id (sessionStorage), dies with the tab
  day           date not null,                                             -- UTC day the session started
  visitor_hash  text not null check (visitor_hash ~ '^[0-9a-f]{32}$'),
  started_at    timestamptz not null default now(),
  entry_path    text not null check (length(entry_path) <= 32),
  country       text check (country ~ '^[A-Z]{2}$'),
  region        text check (region ~ '^[A-Z0-9]{1,3}$'),
  device        text not null check (device in ('phone','tablet','desktop')),
  source        text not null check (source in ('direct','search','social','referral','campaign')),
  referrer_host text check (length(referrer_host) <= 253),
  utm_source    text check (length(utm_source) <= 60),
  utm_medium    text check (length(utm_medium) <= 60),
  utm_campaign  text check (length(utm_campaign) <= 60)
);
create index if not exists analytics_sessions_day_hash_idx on public.analytics_sessions (day, visitor_hash);
create index if not exists analytics_sessions_started_idx on public.analytics_sessions (started_at);

create table if not exists public.analytics_beats (
  id         bigint generated always as identity primary key,
  session_id text not null references public.analytics_sessions (id) on delete cascade,
  ts         timestamptz not null default now(),
  engaged_ms integer not null default 0 check (engaged_ms between 0 and 300000),
  pageviews  smallint not null default 0 check (pageviews between 0 and 100),
  area_ms    jsonb not null default '{}'::jsonb
);
create index if not exists analytics_beats_session_idx on public.analytics_beats (session_id);
create index if not exists analytics_beats_ts_idx on public.analytics_beats (ts);

create table if not exists public.analytics_daily (
  day         date primary key,
  data        jsonb not null,             -- DailyRollup in lib/analytics/core.ts
  computed_at timestamptz not null default now()
);

create table if not exists public.analytics_salts (
  day  date primary key,
  salt text not null
);

alter table public.analytics_sessions enable row level security;
alter table public.analytics_beats    enable row level security;
alter table public.analytics_daily    enable row level security;
alter table public.analytics_salts    enable row level security;
-- No policies on purpose. Belt and braces: remove the default grants from the public roles too.
revoke all on public.analytics_sessions, public.analytics_beats, public.analytics_daily, public.analytics_salts from anon, authenticated;

-- Today's salt, created on first use (two v4 UUIDs: 244 random bits, no extension needed).
create or replace function public.analytics_salt(p_day date) returns text
language plpgsql security invoker set search_path = public as $$
declare s text;
begin
  insert into analytics_salts (day, salt) values (p_day, replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
  on conflict (day) do nothing;
  select salt into s from analytics_salts where day = p_day;
  return s;
end $$;

-- One event, one insert. The server has already validated and clamped everything; the caps here are the last line.
create or replace function public.analytics_ingest(p jsonb) returns void
language plpgsql security invoker set search_path = public as $$
declare
  v_id text := p->>'session';
begin
  if p->>'type' = 'start' then
    insert into analytics_sessions (id, day, visitor_hash, entry_path, country, region, device, source,
                                    referrer_host, utm_source, utm_medium, utm_campaign)
    select v_id, (p->>'day')::date, p->>'visitor_hash', p->>'path', p->>'country', p->>'region', p->>'device', p->>'source',
           p->>'referrer_host', p->>'utm_source', p->>'utm_medium', p->>'utm_campaign'
    where (select count(*) from analytics_sessions where day = (p->>'day')::date and visitor_hash = p->>'visitor_hash') < 150
    on conflict (id) do nothing;
  elsif p->>'type' = 'beat' then
    insert into analytics_beats (session_id, engaged_ms, pageviews, area_ms)
    select s.id,
           least(greatest(coalesce((p->>'engaged_ms')::integer, 0), 0), 300000),
           least(greatest(coalesce((p->>'pageviews')::integer, 0), 0), 100),
           (select coalesce(jsonb_object_agg(key, least(value::numeric, 300000)::integer), '{}'::jsonb)
              from jsonb_each_text(coalesce(p->'area_ms', '{}'::jsonb))
             where key in ('island','paths','arcade','museum','konbini','controller','other') and value ~ '^[0-9]{1,7}$')
      from analytics_sessions s
     where s.id = v_id
       and s.started_at > now() - interval '24 hours'
       and (select count(*) from analytics_beats b where b.session_id = s.id) < 300;
  end if;
end $$;

-- One UTC day's rollup (same shape and rules as rollupDay/deriveSessions in lib/analytics/core.ts). A session's foreground
-- time is the sum of its beats, capped at (last beat - start) + 60 s; page views are 1 + the beats' counts.
create or replace function public.analytics_day_rollup(p_day date) returns jsonb
language sql stable security invoker set search_path = public as $$
with b as (
  select bb.session_id, sum(bb.engaged_ms) e, sum(bb.pageviews) n, max(bb.ts) last
    from analytics_beats bb join analytics_sessions s on s.id = bb.session_id
   where s.day = p_day group by bb.session_id
), t as (
  select s.*,
         case when b.session_id is null then 0
              else least(b.e, greatest(0, floor(extract(epoch from (b.last - s.started_at)) * 1000))::bigint + 60000) end as engaged,
         1 + coalesce(b.n, 0) as pages
    from analytics_sessions s left join b on b.session_id = s.id
   where s.day = p_day
), keyed as (
            select visitor_hash, pages, 'country'  as dim, coalesce(country, '(unknown)') as k from t
  union all select visitor_hash, pages, 'region',   country || '-' || region from t where country is not null and region is not null
  union all select visitor_hash, pages, 'source',   source from t
  union all select visitor_hash, pages, 'referrer', referrer_host from t where referrer_host is not null
  union all select visitor_hash, pages, 'campaign', coalesce(utm_campaign, '(no campaign)') || ' · ' || coalesce(utm_source, '—') || ' / ' || coalesce(utm_medium, '—')
              from t where coalesce(utm_source, utm_medium, utm_campaign) is not null
  union all select visitor_hash, pages, 'device',   device from t
  union all select visitor_hash, pages, 'entry',    entry_path from t
), dimc as (
  select dim, k, count(*) s, count(distinct visitor_hash) v, sum(pages) pv,
         row_number() over (partition by dim order by count(*) desc, k collate "C") rn
    from keyed group by dim, k
), dims as (
  select jsonb_object_agg(d.dim, coalesce(x.obj, '{}'::jsonb)) obj
    from (values ('country'), ('region'), ('source'), ('referrer'), ('campaign'), ('device'), ('entry')) d(dim)
    left join (select dim, jsonb_object_agg(k, jsonb_build_object('s', s, 'v', v, 'pv', pv)) obj from dimc where rn <= 100 group by dim) x
      on x.dim = d.dim
), hist as (
  select jsonb_agg(coalesce(h.c, 0) order by g) arr
    from generate_series(1, 23) g
    left join (select width_bucket(engaged / 1000.0,
                 array[0,5,10,15,20,30,45,60,90,120,180,240,300,420,600,900,1200,1800,2700,3600,5400,7200,10800]::numeric[]) b,
                 count(*) c
                 from t group by 1) h on h.b = g
), areas as (
  select coalesce(jsonb_object_agg(key, total), '{}'::jsonb) obj from (
    select a.key, sum(a.value::numeric)::bigint total
      from analytics_beats bb join analytics_sessions s on s.id = bb.session_id, jsonb_each_text(bb.area_ms) a
     where s.day = p_day group by a.key having sum(a.value::numeric) > 0) z
)
select jsonb_build_object(
  'day',       p_day,
  'visitors',  (select count(distinct visitor_hash) from t),
  'sessions',  (select count(*) from t),
  'pageviews', (select coalesce(sum(pages), 0) from t),
  'bounces',   (select count(*) from t where pages <= 1 and engaged < 10000),
  'engagedMs', (select coalesce(sum(engaged), 0) from t),
  'hist',      (select arr from hist),
  'dims',      (select obj from dims),
  'areaMs',    (select obj from areas));
$$;

-- Rollups computed now for raw-retained days in [p_from, p_to] (the dashboard's not-yet-frozen days). Not saved.
create or replace function public.analytics_days(p_from date, p_to date) returns jsonb
language sql stable security invoker set search_path = public as $$
  select coalesce(jsonb_agg(analytics_day_rollup(d::date) order by d), '[]'::jsonb)
    from generate_series(greatest(p_from, (now() at time zone 'utc')::date - 14), least(p_to, (now() at time zone 'utc')::date), interval '1 day') d;
$$;

-- Hourly series for one day: sessions/visitors by start hour; page views = starts + beats' counts by hour.
create or replace function public.analytics_hourly(p_day date) returns jsonb
language sql stable security invoker set search_path = public as $$
with s as (select * from analytics_sessions where day = p_day),
hs as (select extract(hour from started_at at time zone 'utc')::int h, count(*) n, count(distinct visitor_hash) v from s group by 1),
hb as (select extract(hour from b.ts at time zone 'utc')::int h, sum(b.pageviews) n
         from analytics_beats b join s on s.id = b.session_id
        where (b.ts at time zone 'utc')::date = p_day group by 1)
select jsonb_agg(jsonb_build_object('key', to_char(p_day, 'YYYY-MM-DD') || 'T' || lpad(g::text, 2, '0'),
                                    'visitors', coalesce(hs.v, 0), 'sessions', coalesce(hs.n, 0),
                                    'pageviews', coalesce(hs.n, 0) + coalesce(hb.n, 0)) order by g)
  from generate_series(0, 23) g left join hs on hs.h = g left join hb on hb.h = g;
$$;

-- "On now": sessions with any event since p_since (the server passes now - 5 min).
create or replace function public.analytics_live(p_since timestamptz) returns integer
language sql stable security invoker set search_path = public as $$
  select count(*)::integer from (select id from analytics_sessions where started_at >= p_since
                                 union select session_id from analytics_beats where ts >= p_since) x;
$$;

-- Nightly (Vercel Cron → /api/cron/analytics): freeze every final, unfrozen day of the last 14 into analytics_daily
-- (a day is final at D+2 02:00 UTC, once its sessions' 24 h beat window has closed), then purge raw rows older than
-- 14 days and every salt from before today. Returns the days it froze.
create or replace function public.analytics_finalize(p_today date) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare d date; frozen jsonb := '[]'::jsonb;
begin
  for d in select g::date from generate_series(p_today - 14, p_today - 1, interval '1 day') g loop
    if now() >= ((d + 2)::timestamp at time zone 'utc') + interval '2 hours'
       and not exists (select 1 from analytics_daily where day = d) then
      insert into analytics_daily (day, data) values (d, analytics_day_rollup(d)) on conflict (day) do nothing;
      frozen := frozen || to_jsonb(d::text);
    end if;
  end loop;
  delete from analytics_sessions where day < p_today - 14;   -- beats cascade
  delete from analytics_salts where day < p_today;
  return frozen;
end $$;

revoke all on function public.analytics_salt(date), public.analytics_ingest(jsonb), public.analytics_day_rollup(date), public.analytics_days(date, date), public.analytics_hourly(date), public.analytics_live(timestamptz), public.analytics_finalize(date) from public, anon, authenticated;
grant execute on function public.analytics_salt(date), public.analytics_ingest(jsonb), public.analytics_day_rollup(date), public.analytics_days(date, date), public.analytics_hourly(date), public.analytics_live(timestamptz), public.analytics_finalize(date) to service_role;
grant select, insert, update, delete on public.analytics_sessions, public.analytics_beats, public.analytics_daily, public.analytics_salts to service_role;
