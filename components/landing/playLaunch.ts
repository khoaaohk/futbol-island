'use client';
/**
 * Getting from /start into the game quickly (Oct 9 2026). The game is the island at `/` (static, CDN-cached).
 *  - warmGame(): once per page view, on idle (or the first hover / focus / touch of a Play button), asks the App Router to prefetch
 *    `/` and loads the hand-off chunk (with the island loading screen), so Play starts the hand-off at once and the route is ready.
 *    Skipped on Save-Data. Nothing loops or polls; it runs at most once.
 *  - The game itself (three.js / Babylon, the island assets) is NOT downloaded here: it starts loading behind the game's own
 *    loading screen, exactly as on a direct visit to `/`.
 */
export const GAME_HREF='/';
let warmed=false;
type Prefetcher={prefetch:(href:string)=>void};
export function warmGame(router:Prefetcher){
 if(warmed)return;warmed=true;
 const connection=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection;
 if(connection?.saveData)return;
 try{router.prefetch(GAME_HREF);}catch{/* prefetch is a hint */}
 void import('../IslandLoading').catch(()=>{});
}
/** requestIdleCallback with a timeout, or a short timer where it is missing (Safari). Returns a cancel function. */
export function onIdle(run:()=>void,timeout=2500):()=>void{
 const w=window as Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};
 if(w.requestIdleCallback){const id=w.requestIdleCallback(run,{timeout});return()=>w.cancelIdleCallback?.(id);}
 const id=setTimeout(run,1200);return()=>clearTimeout(id);
}
