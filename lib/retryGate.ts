/**
 * Retry pacing for a lazy part that is asked for from a per-frame or per-tick check (QA robust pass, Nov 14 2026).
 *
 * The fishing visuals, the dive room and the stadium sponsor boards load on approach and forget a failed load so a later
 * approach can retry. But the approach check runs every frame / HUD tick: offline (a phone losing signal at the pier), a failed
 * chunk was requested again on EVERY frame, about 20 script requests a second, each one a DOM insert, a network error and a
 * rejected promise, for as long as the kid stood there. A gate allows one try, then waits `ms` after a failure; the browser
 * coming back online opens it at once.
 */
export function retryGate(ms=5000,now:()=>number=()=>Date.now()){
 let until=0;
 if(typeof window!=='undefined'&&typeof window.addEventListener==='function')window.addEventListener('online',()=>{until=0;});
 return {
  /** May a load start now? */ready:()=>now()>=until,
  /** A load failed: hold further tries for `ms`. */fail:()=>{until=now()+ms;},
 };
}
