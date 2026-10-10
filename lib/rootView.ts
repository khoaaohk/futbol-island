/**
 * What `/` shows (Oct 9 2026; user: "the start screen must be at https://futbolisland.app/, not /start"): the title screen
 * (components/landing) or the game, at the same URL. /start no longer exists.
 *
 *  - Every visit and every reload shows the title screen, with its water-fill Play for a returning player (user, Oct 9 2026:
 *    the old loader must not show on a reload). The only reload that goes straight to the game is the game's own hand-off
 *    reload (a restored save: markTanReload → sessionStorage fi2-island-handoff, read here or already moved onto <html
 *    data-island-handoff> by the loader's boot script), which lands on the tan sheet.
 *  - Links the game itself makes also open the game: `?from=` (the Arcade / Konbini / Museum return, normally rewritten to
 *    /island-return before it gets here) and `?panel=` (Settings → About, e.g. the Stripe return of a donation made from the
 *    game, which opens in a new tab).
 *  - ROOT_VIEW_BOOT decides BEFORE first paint (an inline script at the top of app/page.tsx sets <html data-root-view>, which
 *    globals.css uses to show one of the two prerendered screens), so neither screen ever flashes. The page stays static.
 *  - On the client, components/root/RootSwitch.tsx reads the same rule (isInGame) and switches in place on enterGame().
 */
export const IN_GAME_KEY='fi2-in-game';
/** Query keys only the game's own links carry. */
export const GAME_QUERY_KEYS=['from','panel'] as const;
export type RootView='landing'|'game';

/** Inline, pre-paint: <html data-root-view="game|landing">. Mirrors isInGame(). */
export const ROOT_VIEW_BOOT=`try{var g=!!document.documentElement.dataset.islandHandoff;try{g=g||!!sessionStorage.getItem('fi2-island-handoff')}catch(e){}if(!g){var q=new URLSearchParams(location.search);g=${JSON.stringify(GAME_QUERY_KEYS)}.some(function(k){return q.has(k)})}document.documentElement.dataset.rootView=g?'game':'landing'}catch(e){}`;

/** Set when sessionStorage is unavailable (private modes that throw), so the switch still holds for this page's life. */
let entered=false;
const listeners=new Set<()=>void>();

export function isInGame(search:string=typeof location==='undefined'?'':location.search):boolean{
 if(entered)return true;
 if(typeof document!=='undefined'&&document.documentElement.dataset.islandHandoff)return true;
 try{const q=new URLSearchParams(search);return GAME_QUERY_KEYS.some(k=>q.has(k));}catch{return false;}
}
/** Remember that this tab is in the game (no re-render): Town calls it on mount; a restore calls it before its reload. */
export function rememberInGame(){try{sessionStorage.setItem(IN_GAME_KEY,'1');}catch{/* the in-memory flag covers this page */}}
/** Play: remember it and switch `/` to the game in place (RootSwitch re-renders synchronously). */
export function enterGame(){rememberInGame();entered=true;for(const f of [...listeners])f();}
export function subscribeRootView(f:()=>void){listeners.add(f);return()=>{listeners.delete(f);};}
export const rootViewSnapshot=():RootView=>isInGame()?'game':'landing';
