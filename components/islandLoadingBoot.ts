/** sessionStorage → <html data-island-handoff> before first paint (the title screen → game hand-off after a full reload, e.g. a
 *  restored save; key shared with components/landing/waterLaunch.ts HANDOFF_KEY and handoffMotion.ts HANDOFF_STORAGE_KEY).
 *  A plain module (not 'use client') so the server-rendered loader placeholder (IslandLoadingStatic) can inline it too. */
// "pill:x,y,w,h" (Nov 5 2026, waterLaunch.ts markPillReload: a restored save's reload): the loader starts as the title screen's last
// frame, its sea with the full "Loading…" pill at that same viewport box (CSS vars --handoff-pill-*; components/LoadingHandoffPill.tsx).
export const HANDOFF_BOOT="try{var v=sessionStorage.getItem('fi2-island-handoff');if(v){sessionStorage.removeItem('fi2-island-handoff');var h=document.documentElement;if(v.slice(0,4)==='pill'){h.dataset.islandHandoff='pill';var b=v.slice(5).split(',');if(b.length===4)['x','y','w','h'].forEach(function(k,i){var n=+b[i];if(n===n)h.style.setProperty('--handoff-pill-'+k,n+'px')})}else document.documentElement.dataset.islandHandoff=v==='tan'?'tan':'reload'}}catch(e){}";

/** The next IslandLoading to mount continues the CSS animations of a placeholder that was on screen until now (components/root/
 *  RootSwitch.tsx: `/` paints IslandLoadingStatic before the game's code has loaded, then swaps in Town's loader): every animation
 *  in the new screen gets the placeholder's start time, so the swap is invisible. One-shot. Kept here, not in IslandLoading.tsx,
 *  so RootSwitch does not pull the loader (and its inline cast images) into the title screen's first load. */
let continueAt:number|null=null;
export function continueLoaderFrom(start:number|null){continueAt=start;}
export function takeLoaderContinuation(){const t=continueAt;continueAt=null;return t;}

/** Play → island without a loader (user, Nov 4 2026: "we should not be displaying this loader… it's right before the island
 *  loads"). The title screen no longer ends on a plain tan sheet that Town's tan loader holds while the island builds: WaterPill
 *  marks <html data-island-cover> and `/` switches to the game UNDER the still-mounted title screen (RootSwitch keeps it as a
 *  fixed cover), Town's tan loader stays invisible under it, and when that loader starts its exit (the island's first frame is
 *  drawn) or goes away (a failed load) it calls islandCoverDone(): the cover cross-fades straight into the island. */
export const ISLAND_COVER_DONE='fi2-island-cover-done';
/** The value is the title screen's scroll offset, so the fixed cover keeps the exact frame the player saw. */
export const markIslandCover=()=>{document.documentElement.dataset.islandCover=String(Math.round(window.scrollY||0));};
export const islandCovered=()=>typeof document!=='undefined'&&document.documentElement.dataset.islandCover!==undefined;
export function islandCoverDone(){if(islandCovered())window.dispatchEvent(new Event(ISLAND_COVER_DONE));}
