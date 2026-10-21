/**
 * Bug squad HUD rules (Oct 21 2026; docs/island-jobs.md §15 "One UI thing at a time"). User: "there's so much going on, this UI
 * with bug squad and the bug info is too much. only show one at a time". Pure: IslandJobs.tsx renders what these pick.
 *
 *  - One message surface at a time, in priority order: the story card, then the payday card, then the single toast slot (banners
 *    like "New in the Bug book" and short notices like a repeat catch or a miss share it, one replacing the other). The others wait.
 *  - The job pill is one line by default ("Bug squad 9/20" + hint + End job); the long help, today's jar and Net down live in its
 *    expanded state (a tap opens it, it folds back by itself). The very first shift shows a one-line tip for a few seconds instead.
 */
export type BugSurface='card'|'payday'|'toast'|null;
export const BUG_SURFACE_ORDER:readonly Exclude<BugSurface,null>[]=['card','payday','toast'];
/** The one message surface to show now (null = none wants to). */
export function pickSurface(want:{card:boolean;payday:boolean;toast:boolean}):BugSurface{
 for(const s of BUG_SURFACE_ORDER)if(want[s])return s;return null;}
/** How long a Bug squad note stays (ms): a short one-liner. */
export const BUG_NOTE_MS=2500;
/** The pill's states: 'chip' = one line (default), 'tip' = the first shift's one-line tip, 'full' = expanded on a tap. */
export type BugPill='chip'|'tip'|'full';
/** First shift ever: the tip shows this long (ms), then the pill folds; an expanded pill folds back after this long. */
export const BUG_PILL={tipMs:8000,openMs:6000,key:'fi2-bug-pill-v1'} as const;
export const BUG_TIP='Sneak up on a bug, then tap Swing.';
/** The pill's state when a shift starts: the tip only until the player has seen it once (or caught a bug). */
export function initialPill(seen:boolean):BugPill{return seen?'chip':'tip';}
/** Learning-coin notes from the Bug book are already on the story card (New! + coin): no separate banner for them. */
export function bugBookCoinNote(reason:string){return /^New in the Bug book/.test(reason);}
