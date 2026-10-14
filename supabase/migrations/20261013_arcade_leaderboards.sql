-- Futbol Island arcade leaderboards (Oct 13 2026; docs/arcade-leaderboards.md). Run once in the Supabase SQL editor (or
-- `supabase db push`), AFTER 20261010_game_saves.sql (it reuses save_salt and save_hit for its rate limit). Additive only: it
-- creates one table and five functions and touches nothing that exists. Running it twice is harmless.
-- The LAST result row must read "OK, arcade leaderboards installed".
--
-- What is stored per entry: the game, the score, three letters A–Z picked on arcade letter wheels (never typed text; the
-- server also refuses a blocklist of rude or hurtful combinations), an optional picture id from a fixed list, the day and
-- week it was played, the play session's random nonce (so one play posts once) and an optional sha256 of a random "claim"
-- that only the posting device holds (so it can replace its own older entry). Never: a name, a save code, an IP address, a
-- device id, a user agent or any free text.
-- Only scores that make a game's all-time or this week's top 10 are kept, and the nightly purge (board_purge, called from
-- /api/cron/analytics) keeps each game's best 50 of all time plus this week and last week.
--
-- Access: RLS is on with NO policies and anon/authenticated have no grants. Only the server, with SUPABASE_SERVICE_ROLE_KEY,
-- reaches the data, through the security-definer functions below.
--
-- tests/arcade-leaderboard.cjs runs every migration in order on a throwaway Postgres and checks these functions against the
-- TypeScript twin in lib/arcade/leaderboardStore.ts (createMemoryBoardStore), including this file's self-check row.

create table if not exists public.arcade_scores (
  id            bigint generated always as identity primary key,
  game          text not null check (game in ('runner', 'pinball', 'tennis', 'live', 'puzzle')),
  score         integer not null check (score between 1 and 400000),
  initials      text not null check (initials ~ '^[A-Z]{3}$'),        -- three letters from the wheels
  icon          text not null default '' check (icon ~ '^[a-z]{0,12}$'), -- a picture id from a fixed list, or ''
  played_on     date not null,                                          -- day granularity only
  week          date not null check (extract(isodow from week) = 1),    -- the Monday (UTC) of that week
  session_nonce text not null unique check (session_nonce ~ '^[0-9a-f]{32}$'),
  claim_hash    text null check (claim_hash is null or claim_hash ~ '^[0-9a-f]{64}$')
);
create index if not exists arcade_scores_all_idx on public.arcade_scores (game, score desc, id);
create index if not exists arcade_scores_week_idx on public.arcade_scores (game, week, score desc, id);

alter table public.arcade_scores enable row level security;
-- No policies on purpose. Belt and braces: remove the default grants from the public roles too.
revoke all on public.arcade_scores from anon, authenticated;

create or replace function public.board_schema_version() returns integer
language sql immutable security definer set search_path = public as $$ select 1 $$;

-- One row as the API shows it.
create or replace function public.board_row(r public.arcade_scores) returns jsonb
language sql immutable security definer set search_path = public as $$
  select jsonb_build_object('id', r.id, 'initials', r.initials, 'icon', r.icon, 'score', r.score, 'day', to_char(r.played_on, 'YYYY-MM-DD'))
$$;

-- Keeps a score only if it makes the all-time or this week's top 10 (a tie goes below the scores already there). A session
-- nonce posts once. The posting device's own older entry (same game, matching claim, not higher) makes way first.
create or replace function public.board_submit(p_game text, p_score integer, p_initials text, p_icon text, p_nonce text,
  p_claim_hash text, p_replace_id bigint, p_replace_claim_hash text, p_day date, p_week date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare old_id bigint; r_all integer; r_week integer; new_id bigint;
begin
  perform pg_advisory_xact_lock(hashtext('arcade_board:' || p_game));
  if exists (select 1 from arcade_scores where session_nonce = p_nonce) then
    return jsonb_build_object('ok', false, 'reason', 'used');
  end if;
  if p_replace_id is not null and p_replace_claim_hash is not null then
    select id into old_id from arcade_scores
      where id = p_replace_id and game = p_game and claim_hash = p_replace_claim_hash and score <= p_score;
  end if;
  select count(*) + 1 into r_all from arcade_scores where game = p_game and score >= p_score and id is distinct from old_id;
  select count(*) + 1 into r_week from arcade_scores where game = p_game and week = p_week and score >= p_score and id is distinct from old_id;
  if r_all > 10 and r_week > 10 then
    return jsonb_build_object('ok', false, 'reason', 'not-top');
  end if;
  if old_id is not null then delete from arcade_scores where id = old_id; end if;
  insert into arcade_scores (game, score, initials, icon, played_on, week, session_nonce, claim_hash)
    values (p_game, p_score, p_initials, coalesce(p_icon, ''), p_day, p_week, p_nonce, p_claim_hash)
    returning id into new_id;
  return jsonb_build_object('ok', true, 'id', new_id,
    'rank_all', case when r_all <= 10 then r_all end, 'rank_week', case when r_week <= 10 then r_week end);
end $$;

-- Both boards for one game: the all-time top 10 and this week's top 10 (higher score first, then the earlier entry).
create or replace function public.board_top(p_game text, p_week date) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'all', coalesce((select jsonb_agg(board_row(t) order by t.score desc, t.id) from
      (select * from arcade_scores where game = p_game order by score desc, id limit 10) t), '[]'::jsonb),
    'week', coalesce((select jsonb_agg(board_row(t) order by t.score desc, t.id) from
      (select * from arcade_scores where game = p_game and week = p_week order by score desc, id limit 10) t), '[]'::jsonb))
$$;

-- Nightly: keep each game's best 50 of all time, and everything from this week and last week.
create or replace function public.board_purge(p_week date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from arcade_scores s where s.week < p_week - 7 and s.id not in (
    select id from (select id, row_number() over (partition by game order by score desc, id) as rn from arcade_scores) k where k.rn <= 50);
  get diagnostics n = row_count;
  return jsonb_build_object('rows', n);
end $$;

revoke all on function public.board_schema_version(), public.board_row(public.arcade_scores),
  public.board_submit(text, integer, text, text, text, text, bigint, text, date, date), public.board_top(text, date), public.board_purge(date)
  from public, anon, authenticated;
grant execute on function public.board_schema_version(), public.board_submit(text, integer, text, text, text, text, bigint, text, date, date),
  public.board_top(text, date), public.board_purge(date)
  to service_role;

-- Self-check: the last result of this file. "OK, arcade leaderboards installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, arcade leaderboards installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when to_regclass('public.arcade_scores') is null then 'table arcade_scores' end,
    case when exists (select 1 from pg_class where oid = to_regclass('public.arcade_scores') and not relrowsecurity) then 'row level security' end,
    case when exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'arcade_scores') then 'no policies (one exists)' end,
    case when to_regclass('public.arcade_scores') is not null and (has_table_privilege('anon', 'public.arcade_scores', 'select') or has_table_privilege('authenticated', 'public.arcade_scores', 'select')) then 'anon/authenticated locked out of arcade_scores' end,
    case when to_regprocedure('public.board_schema_version()') is null then 'board_schema_version()' end,
    case when to_regprocedure('public.board_submit(text,integer,text,text,text,text,bigint,text,date,date)') is null then 'board_submit'
         when has_function_privilege('anon', to_regprocedure('public.board_submit(text,integer,text,text,text,text,bigint,text,date,date)'), 'execute') then 'anon locked out of board_submit' end,
    case when to_regprocedure('public.board_top(text,date)') is null then 'board_top' end,
    case when to_regprocedure('public.board_purge(date)') is null then 'board_purge' end,
    case when to_regprocedure('public.save_salt(date)') is null or to_regprocedure('public.save_hit(text,integer,integer)') is null then 'save_salt/save_hit (run 20261010_game_saves.sql first)' end
  ) as missing) x;
