-- Nov 17 2026 (owner: "show up to top 20"): the island arcade boards hold 20 rows instead of 10. NOT APPLIED: the owner pastes
-- it in the Supabase SQL editor (a paste-ready copy is docs/arcade-aaa/board-top20-supabase.sql). Dated after
-- 20261121_analytics_staff_exclusion.sql so it runs last. Safe to re-run. Requires 20261111_board_hidden_rows.sql first.
--  * board_submit: identical to 20261111_board_hidden_rows.sql except a score is kept when it makes a top 20 (was 10).
--  * board_top: identical except it returns up to 20 rows per board and a 'size' of 20, which tells the site the new size.
-- Until this runs the site keeps working: board_top has no 'size', the server reports 10, and the game offers the
-- "New high score!" entry only for a top-10 place (lib/arcade/leaderboardStore.ts, lib/arcade/boardClient.ts).
-- The nightly purge already keeps each game's best 50 of all time, so no purge change is needed.

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
  if r_all > 20 and r_week > 20 then
    return jsonb_build_object('ok', false, 'reason', 'not-top');
  end if;
  if old_id is not null then delete from arcade_scores where id = old_id; end if;
  insert into arcade_scores (game, score, initials, icon, played_on, week, session_nonce, claim_hash)
    values (p_game, p_score, p_initials, coalesce(p_icon, ''), p_day, p_week, p_nonce, p_claim_hash)
    returning id into new_id;
  return jsonb_build_object('ok', true, 'id', new_id,
    'rank_all', case when r_all <= 20 then r_all end, 'rank_week', case when r_week <= 20 then r_week end);
end $$;

create or replace function public.board_top(p_game text, p_week date) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'size', 20,
    'all', coalesce((select jsonb_agg(board_row(t) order by t.score desc, t.id) from
      (select * from arcade_scores where game = p_game and hidden_at is null order by score desc, id limit 20) t), '[]'::jsonb),
    'week', coalesce((select jsonb_agg(board_row(t) order by t.score desc, t.id) from
      (select * from arcade_scores where game = p_game and hidden_at is null and week = p_week order by score desc, id limit 20) t), '[]'::jsonb))
$$;

-- Check (should return no rows):
select 'board_top without size 20' as missing
  where position('''size'', 20' in pg_get_functiondef(to_regprocedure('public.board_top(text, date)'))) = 0
union all
select 'board_submit still top 10'
  where position('r_all > 20' in pg_get_functiondef(to_regprocedure('public.board_submit(text, integer, text, text, text, text, bigint, text, date, date)'))) = 0;
