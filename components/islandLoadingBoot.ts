/** sessionStorage → <html data-island-handoff> before first paint (the title screen → game hand-off after a full reload, e.g. a
 *  restored save; key shared with components/landing/waterLaunch.ts HANDOFF_KEY and handoffMotion.ts HANDOFF_STORAGE_KEY).
 *  A plain module (not 'use client') so the server-rendered loader placeholder (IslandLoadingStatic) can inline it too. */
export const HANDOFF_BOOT="try{var v=sessionStorage.getItem('fi2-island-handoff');if(v){sessionStorage.removeItem('fi2-island-handoff');document.documentElement.dataset.islandHandoff=v==='tan'?'tan':'reload'}}catch(e){}";

/** The next IslandLoading to mount continues the CSS animations of a placeholder that was on screen until now (components/root/
 *  RootSwitch.tsx: `/` paints IslandLoadingStatic before the game's code has loaded, then swaps in Town's loader): every animation
 *  in the new screen gets the placeholder's start time, so the swap is invisible. One-shot. Kept here, not in IslandLoading.tsx,
 *  so RootSwitch does not pull the loader (and its inline cast images) into the title screen's first load. */
let continueAt:number|null=null;
export function continueLoaderFrom(start:number|null){continueAt=start;}
export function takeLoaderContinuation(){const t=continueAt;continueAt=null;return t;}
