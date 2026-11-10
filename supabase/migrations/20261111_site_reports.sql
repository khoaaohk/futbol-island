-- Nov 10 2026 (security audit: CSP reports and a first-party error beacon). NOT APPLIED: the owner runs it in the Supabase SQL
-- editor. Safe to re-run.
-- Daily counts only: (day, kind, key) -> n, where kind is 'csp' or 'err' and key is a short fixed-shape string made on the
-- server (lib/siteReports.ts): csp = "<directive>|<blocked host>|<page path>", err = "<8-hex hash>|<route path>" plus the
-- message's first line and top frame (file:line) kept as the row's label. Never a full URL with a query string, a user agent,
-- an IP, a stack or an id. At most 500 distinct keys per kind per day (further new keys are dropped, existing ones still count)
-- and each count stops at 1,000,000. Rows older than 30 days are deleted by site_report_hit itself.
-- Why not the visit counters: those ride a visitor's session (analytics_sessions); a server-made report has no session and
-- would otherwise be counted as a fake visit.
-- Until this runs, the routes keep per-instance counts in memory (/admin shows "needs migration").
create table if not exists public.site_reports (
  day   date not null,
  kind  text not null check (kind in ('csp', 'err')),
  key   text not null check (length(key) <= 200),
  label text not null default '' check (length(label) <= 240),
  n     integer not null default 0,
  primary key (day, kind, key)
);
alter table public.site_reports enable row level security;
revoke all on public.site_reports from anon, authenticated;

create or replace function public.site_report_hit(p_kind text, p_key text, p_label text) returns boolean
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'utc')::date;
begin
  if p_kind not in ('csp', 'err') or length(p_key) > 200 then return false; end if;
  update site_reports set n = least(n + 1, 1000000) where day = d and kind = p_kind and key = p_key;
  if found then return true; end if;
  if (select count(*) from site_reports where day = d and kind = p_kind) >= 500 then return false; end if;
  insert into site_reports (day, kind, key, label, n) values (d, p_kind, p_key, left(coalesce(p_label, ''), 240), 1)
    on conflict (day, kind, key) do update set n = least(site_reports.n + 1, 1000000);
  if random() < 0.01 then delete from site_reports where day < d - 30; end if;
  return true;
end $$;

create or replace function public.site_report_top(p_kind text, p_days integer, p_limit integer) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('key', key, 'label', label, 'n', n, 'last', last) order by n desc, key), '[]'::jsonb)
  from (select key, max(label) as label, sum(n)::integer as n, to_char(max(day), 'YYYY-MM-DD') as last from site_reports
        where kind = p_kind and day >= (now() at time zone 'utc')::date - greatest(least(p_days, 30), 1) + 1
        group by key order by sum(n) desc, key limit least(greatest(p_limit, 1), 100)) t
$$;

revoke all on function public.site_report_hit(text, text, text), public.site_report_top(text, integer, integer) from public, anon, authenticated;
grant execute on function public.site_report_hit(text, text, text), public.site_report_top(text, integer, integer) to service_role;

-- Self-check: the last result of this file. "OK, site reports installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, site reports installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.site_reports') is null then 'table site_reports' end,
    case when to_regprocedure('public.site_report_hit(text, text, text)') is null then 'function site_report_hit' end,
    case when to_regprocedure('public.site_report_top(text, integer, integer)') is null then 'function site_report_top' end
  ) as missing) x;
