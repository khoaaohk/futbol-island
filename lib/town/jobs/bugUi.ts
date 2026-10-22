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
export const BUG_TIP='Sneak up, then tap Swing.';
/** At Night the tool is the firefly jar (Oct 21 2026). */
export const BUG_TIP_NIGHT='Sneak up, then tap Cup.';
/** The pill's state when a shift starts: the tip only until the player has seen it once (or caught a bug). */
export function initialPill(seen:boolean):BugPill{return seen?'chip':'tip';}
/** Learning-coin notes from the Bug book are already on the story card (New! + coin): no separate banner for them. */
export function bugBookCoinNote(reason:string){return /^New in the Bug book/.test(reason);}

/* Oct 21 2026 (user, twice: "the bar is missing for bug squad, I don't know how many I have caught and can't exit"). The pill hangs
   in the island HUD stack, so anything that hides the stack (a stuck "calm" flag in Town, e.g. the vending camera's leaving flag,
   or CSS) hid the count and the End job ×. Safety net: a 2 Hz watchdog (IslandJobs) checks the pill is really on screen while a Bug
   squad run is active and no catch stage / release cinematic / dialog is up; if not, it resets the pill to its chip and, when the
   stack itself is the problem, draws the pill on its own (fixed under the coins bar) until the stack shows again. The count also
   rides on the action cluster's End button (Town.tsx), so the count and the exit are always on screen with the job buttons. */
/** The count the pill shows: the squad (day N/20, night N/8) when the run has one, else the jar. */
export function pillCount(a:{value:number;total:number;phase?:string;squad?:{value:number;total:number}|null}):string{
 return a.squad?`${a.squad.value}/${a.squad.total}`:a.phase==='deliver'?`${a.total}/${a.total}`:`${a.value}/${a.total}`;}
/** The pill state to render: a squad run only ever renders a visible state (chip, tip or full; never 'fading' or anything stale). */
export function pillShown(squad:boolean,pill:string,panel:string):string{
 if(squad)return pill==='full'||pill==='tip'?pill:'chip';return panel==='full'||panel==='fading'||panel==='chip'?panel:'full';}
export type PillCheck={running:boolean;staging:boolean;dialog:boolean;exists:boolean;visible:boolean;stackHidden:boolean};
/** The watchdog's call for one check: 'ok'; 'wait' (a catch stage, release or dialog covers it on purpose); 'reset' (it is in the
 *  stack but not visible: reset the pill state); 'detach' (the stack itself is hidden or the pill is missing: draw it on its own). */
export function pillWatch(c:PillCheck):'ok'|'wait'|'reset'|'detach'{
 if(!c.running)return 'ok';if(c.staging||c.dialog)return 'wait';if(c.exists&&c.visible)return 'ok';
 return c.stackHidden||!c.exists?'detach':'reset';}
/** The watchdog's period: 2 Hz, no per-frame work. */
export const PILL_WATCH_MS=500;
