-- Nov 12 2026 (west stadium, phase 4: sponsor slots; lib/stadium/sponsors). NOT APPLIED: the owner runs it in the Supabase SQL
-- editor (paste the whole file). Safe to re-run. Until it runs the game shows its own placeholder panels and /admin says
-- "needs migration".
-- One row per sponsor picture on a stadium slot: which slot, the sponsor's name (for /admin only; the game shows only the word
-- "Sponsor"), the picture's path in the public `stadium-sponsors` bucket, the Pacific days it is active (inclusive; ends_on null =
-- no end) and its order within the slot. Pictures only: no link, no click-through and no tracking column exists, on purpose.
-- Access: anyone may READ the rows that are active today (the game's read API uses the anon key); nobody but the service role
-- (the /admin routes on the server) may insert, update or delete. The bucket is public to read (fixed pictures served by URL);
-- only the service role may write to it. png / webp / jpg, at most 1 MB.
create table if not exists public.stadium_sponsors (
  id         uuid primary key default gen_random_uuid(),
  slot       text not null check (slot in ('board', 'screen', 'gate', 'fascia', 'flag', 'centre')),
  label      text not null check (length(label) between 1 and 60),
  image_path text not null check (image_path ~ '^(board|screen|gate|fascia|flag|centre)/[0-9a-f-]{36}\.(png|webp|jpg)$'),
  starts_on  date not null default ((now() at time zone 'America/Los_Angeles')::date),
  ends_on    date,
  position   smallint not null default 0 check (position between 0 and 99),
  created_at timestamptz not null default now(),
  constraint stadium_sponsors_dates check (ends_on is null or ends_on >= starts_on)
);
create index if not exists stadium_sponsors_slot on public.stadium_sponsors (slot, position, created_at desc);

alter table public.stadium_sponsors enable row level security;
revoke all on public.stadium_sponsors from public, anon, authenticated;
grant select on public.stadium_sponsors to anon, authenticated;
grant all on public.stadium_sponsors to service_role;

-- Public read of ACTIVE rows only (today in Pacific time, the admin's day). There is no insert, update or delete policy, so with
-- RLS on, anon and authenticated can never write; the service role bypasses RLS.
drop policy if exists stadium_sponsors_public_read on public.stadium_sponsors;
create policy stadium_sponsors_public_read on public.stadium_sponsors
  for select to anon, authenticated
  using (starts_on <= (now() at time zone 'America/Los_Angeles')::date
         and (ends_on is null or ends_on >= (now() at time zone 'America/Los_Angeles')::date));

-- The picture bucket: public read by URL, 1 MB, three image types. No storage.objects policy for anon / authenticated, so only
-- the service role can upload, replace or delete.
-- (Guarded so a plain Postgres without Supabase's storage schema, like the test replay, can run the file.)
do $$ begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      values ('stadium-sponsors', 'stadium-sponsors', true, 1000000, array['image/png', 'image/webp', 'image/jpeg'])
      on conflict (id) do update set public = true, file_size_limit = 1000000,
        allowed_mime_types = array['image/png', 'image/webp', 'image/jpeg'];
  end if;
end $$;
-- For the self-check below (dynamic, so the file still parses where storage.buckets does not exist).
create temp table if not exists stadium_sponsors_bucket_check (ok boolean);
truncate stadium_sponsors_bucket_check;
do $$ declare found boolean := false; begin
  if to_regclass('storage.buckets') is not null then
    execute 'select exists (select 1 from storage.buckets where id = ''stadium-sponsors'' and public)' into found;
  end if;
  insert into stadium_sponsors_bucket_check values (found);
end $$;

-- Self-check: the last result of this file. "OK, stadium sponsors installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, stadium sponsors installed' || case when to_regclass('storage.buckets') is null then ' (no storage schema here: bucket skipped)' else '' end else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.stadium_sponsors') is null then 'table stadium_sponsors' end,
    case when not exists (select 1 from pg_class where relname = 'stadium_sponsors' and relrowsecurity) then 'row level security' end,
    case when not exists (select 1 from pg_policies where tablename = 'stadium_sponsors' and policyname = 'stadium_sponsors_public_read') then 'read policy' end,
    case when exists (select 1 from pg_policies where tablename = 'stadium_sponsors' and cmd <> 'SELECT') then 'a write policy that should not exist' end,
    case when to_regclass('storage.buckets') is not null and not (select ok from stadium_sponsors_bucket_check limit 1) then 'bucket stadium-sponsors' end
  ) as missing) s;
