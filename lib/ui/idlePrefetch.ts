/**
 * Parts of the island that load on first use (lazy-load pass, Oct 7 2026; docs/performance-guide.md).
 *
 * `prefetchPart(load)` starts a chunk import once and remembers the promise (a failed load is forgotten so a later trigger
 * retries). `prefetchOnIdle(loads, delay)` is the one idle warm-up: `delay` ms after the island is interactive, while the tab
 * is visible, it imports each part in its own idle callback, in order, then stops for good. No polling, no timers left
 * running, no animation frames: a hidden tab waits on ONE `visibilitychange` listener, and cancelling clears everything.
 */
type Load=()=>Promise<unknown>;
type IdleWindow=Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};

const started=new Map<Load,Promise<unknown>>();

/** Starts (or joins) one part's chunk import. Safe to call from any trigger: the import runs once. */
export function prefetchPart(load:Load):Promise<unknown>{
  let pending=started.get(load);
  if(!pending){pending=load().catch(()=>{started.delete(load);});started.set(load,pending);}
  return pending;
}

/** A trigger that is not urgent (the player is next to something): start the import in the next idle moment (≤ 1 s). */
export function prefetchWhenIdle(load:Load){
  if(started.has(load))return;
  const w=window as IdleWindow;if(w.requestIdleCallback)w.requestIdleCallback(()=>{void prefetchPart(load);},{timeout:1000});else void prefetchPart(load);
}

/** True once `load` was started (tests and debugging). */
export const partStarted=(load:Load)=>started.has(load);

/** One-shot idle warm-up of `loads` (in order) `delay` ms from now. Returns a cancel function. */
export function prefetchOnIdle(loads:readonly Load[],delay:number):()=>void{
  const w=window as IdleWindow;
  let cancelled=false,idle:number|undefined,waitingForVisible=false,next=0;
  const step=(i:number)=>{
    next=i;
    if(cancelled||i>=loads.length)return;
    if(document.hidden){waitingForVisible=true;document.addEventListener('visibilitychange',resume,{once:true});return;}
    const run=()=>{idle=undefined;if(cancelled)return;void prefetchPart(loads[i]).then(()=>step(i+1));};
    if(w.requestIdleCallback)idle=w.requestIdleCallback(run,{timeout:4000});else run();
  };
  function resume(){waitingForVisible=false;step(next);}
  const timer=setTimeout(()=>step(0),delay);
  return ()=>{
    cancelled=true;clearTimeout(timer);
    if(idle!==undefined)w.cancelIdleCallback?.(idle);
    if(waitingForVisible)document.removeEventListener('visibilitychange',resume);
  };
}
