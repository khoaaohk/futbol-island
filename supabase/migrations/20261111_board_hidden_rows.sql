-- Nov 10 2026 (abuse audit: faked arcade scores had no removal). NOT APPLIED: the owner runs it in the Supabase SQL editor.
-- Dated after 20261110_puzzle_tier_boards.sql so it runs last. Safe to re-run.
--  * arcade_scores.hidden_at: a soft-delete flag set from /admin ("Remove row"). A hidden row is never shown, never counts
--    toward a rank and never blocks a real score from the top 10; it stays until the nightly purge like any other row, so a
--    mistaken removal can be undone ("Restore").
--  * board_top / board_submit: identical to 20261013_arcade_leaderboards.sql except they skip hidden rows.
--  * board_hide(id, hidden) and board_admin_list(game, limit): service-role only, called by /api/admin/board.
-- Until this runs the site keeps working: /admin's list falls back to board_top (no hidden flags) and "Remove row" answers
-- "migration needed" (lib/arcade/leaderboardStore.ts).
alter table public.arcade_scores add column if not exists hidden_at timestamptz null;

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
      where id = p_replace_id and game = p_game and claim_hash = p_replace_claim_hash and score <= p_score and hidden_at is null;
  end if;
  select count(*) + 1 into r_all from arcade_scores where game = p_game and hidden_at is null and score >= p_score and id is distinct from old_id;
  select count(*) + 1 into r_week from arcade_scores where game = p_game and hidden_at is null and week = p_week and score >= p_score and id is distinct from old_id;
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

create or replace function public.board_top(p_game text, p_week date) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'all', coalesce((select jsonb_agg(board_row(t) order by t.score desc, t.id) from
      (select * from arcade_scores where game = p_game and hidden_at is null order by score desc, id limit 10) t), '[]'::jsonb),
    'week', coalesce((select jsonb_agg(board_row(t) order by t.score desc, t.id) from
      (select * from arcade_scores where game = p_game and hidden_at is null and week = p_week order by score desc, id limit 10) t), '[]'::jsonb))
$$;

create or replace function public.board_hide(p_id bigint, p_hidden boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update arcade_scores set hidden_at = case when p_hidden then now() end where id = p_id;
  get diagnostics n = row_count;
  return jsonb_build_object('ok', n = 1);
end $$;

-- The best p_limit rows of one game (hidden ones included and marked), for the admin list.
create or replace function public.board_admin_list(p_game text, p_limit integer) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(board_row(t) || jsonb_build_object('hidden', t.hidden_at is not null, 'week', to_char(t.week, 'YYYY-MM-DD'))
    order by t.score desc, t.id), '[]'::jsonb)
  from (select * from arcade_scores where game = p_game order by score desc, id limit least(greatest(p_limit, 1), 100)) t
$$;

revoke all on function public.board_hide(bigint, boolean), public.board_admin_list(text, integer) from public, anon, authenticated;
grant execute on function public.board_hide(bigint, boolean), public.board_admin_list(text, integer) to service_role;

-- Self-check: the last result of this file. "OK, board hidden rows installed" or "NOT INSTALLED: <what is missing>".
select case when missing = '' then 'OK, board hidden rows installed' else 'NOT INSTALLED: ' || missing end as status
  from (select concat_ws(', ',
    case when not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'arcade_scores' and column_name = 'hidden_at') then 'column arcade_scores.hidden_at' end,
    case when to_regprocedure('public.board_hide(bigint, boolean)') is null then 'function board_hide' end,
    case when to_regprocedure('public.board_admin_list(text, integer)') is null then 'function board_admin_list' end,
    case when position('hidden_at is null' in pg_get_functiondef(to_regprocedure('public.board_top(text, date)'))) = 0 then 'board_top skipping hidden rows' end
  ) as missing) x;
