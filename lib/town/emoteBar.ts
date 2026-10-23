// The emote bar's paging (owner, Oct 23 2026): FIVE emotes per page, evenly spaced; swipe / scroll the bar or tap the arrows (one page = 5).
// The left arrow is disabled at the start, the right one at the end (scroll position with a small tolerance); five or fewer emotes = one page,
// no arrows. Pure helpers, no DOM: components/party/EmoteWheel.tsx feeds them the strip's scroll numbers.
export const EMOTES_PER_PAGE = 5, EDGE_TOLERANCE = 2;
/** The list cut into pages of five (the last page may be shorter). */
export function emotePages<T>(list: readonly T[], per = EMOTES_PER_PAGE): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += per) out.push(list.slice(i, i + per));
  return out;
}
export interface ScrollModel {scrollLeft: number; clientWidth: number; scrollWidth: number}
export interface ArrowState {
  /** No arrows at all: everything fits one page. */
  single: boolean;
  /** The left arrow can scroll back / the right one forward. */
  left: boolean; right: boolean;
  /** The page in view (0-based) and the number of pages. */
  page: number; pages: number;
}
/** Arrow states from the strip's scroll numbers (`count` = emotes in the bar). */
export function arrowState(m: ScrollModel, count: number, tol = EDGE_TOLERANCE, per = EMOTES_PER_PAGE): ArrowState {
  const pages = Math.max(1, Math.ceil(count / per));
  if (pages <= 1 || m.scrollWidth <= m.clientWidth + tol) return {single: pages <= 1, left: false, right: false, page: 0, pages};
  const max = m.scrollWidth - m.clientWidth, x = Math.max(0, Math.min(max, m.scrollLeft));
  const page = m.clientWidth > 0 ? Math.min(pages - 1, Math.round(x / m.clientWidth)) : 0;
  return {single: false, left: x > tol, right: x < max - tol, page, pages};
}
/** Where an arrow tap scrolls to: one page (five emotes) back or forward, snapped to a page start and clamped. */
export function arrowTarget(m: ScrollModel, dir: 1 | -1): number {
  const w = m.clientWidth; if (w <= 0) return 0;
  const max = Math.max(0, m.scrollWidth - w), page = Math.round(m.scrollLeft / w);
  return Math.max(0, Math.min(max, (page + dir) * w));
}
