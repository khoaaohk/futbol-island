/**
 * Every kind a Welcome back suggestion can be (Nov 14 2026, lib/welcome/hooks.ts). Fixed, tiny and dependency-free: the analytics
 * counters ws:s_<kind> (shown), ws:t_<kind> (tapped) and ws:a_<kind> (acted: the player got there) are built from this list
 * (lib/analytics/countIds.ts WELCOME_COUNT_IDS), so adding a kind here adds its counters.
 */
export const WELCOME_KINDS=['fish_set','fish_day','fish_visitor','fish_sunset','fish_go','lesson_grad','lesson_streak','lesson_next','lesson_weekend',
 'arcade_pennant','arcade_daily','arcade_go','kit_news','kit_design','cross_fish_lesson','cross_arcade_lesson','cross_lesson_arcade','cross_roam_fish','cross_kit_arcade'] as const;
export type WelcomeKind=typeof WELCOME_KINDS[number];
