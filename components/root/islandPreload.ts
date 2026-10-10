'use client';
import {loadGameModule,type GameModule} from './gameLoader';
import {bootMark} from '@/lib/boot/perfMarks';

/**
 * Loading the island while the player is still on the title screen (preload pass, Oct 9 2026; user: "the tan screen takes a while,
 * can that be more seamless. can we load while they are on the main page?"). Two stages, both driven from here:
 *
 *  a. prefetchIslandWhenSettled(): after the page has loaded and the title's entrance has played (SETTLE_MS), in an idle callback
 *     (requestIdleCallback with a timeout; a timer where it is missing, never rAF), the game's code and the island's first-frame
 *     picture (the vending ball atlas) go into the HTTP cache at idle priority: webpack's prefetch links (gamePrefetch.ts), or
 *     low-priority fetches where rel=prefetch is unsupported (Safari). Nothing is evaluated. Skipped on Save-Data and 2G.
 *
 *  b. warmIsland(intent): a clear intent to play builds the island off screen (lib/town/islandWarm.ts via the game module):
 *     - 'create' (Start · Get my save code): idle slices while the player makes and checks their code. Skipped on Save-Data / 2G
 *       (they warm at Play instead).
 *     - 'play' (any water-pill Play): the same, now eager (a task per slice, so the water keeps rising between them); the water fill
 *       waits for it (waterLaunch.ts), so Town takes a built island the moment the tan sheet covers the screen.
 *     - 'restore' (I have a save code / Use a different code): its Play applies the save and RELOADS the page, so only stage a helps.
 *     No work while the tab is hidden; no requestAnimationFrame anywhere (0 rAF at rest holds). A warm island nobody takes is
 *     disposed (WebGL context released) after UNUSED_MS or when the page is hidden for good (pagehide).
 *  An in-game tab never mounts the title screen, so it never prefetches or warms anything here.
 */
type Connection={saveData?:boolean;effectiveType?:string};
const connection=():Connection|undefined=>typeof navigator==='undefined'?undefined:(navigator as Navigator&{connection?:Connection}).connection;
/** Speculative downloads are off on Save-Data and on 2G / slow-2G connections. */
export function prefetchAllowed(c:Connection|undefined=connection()):boolean{
 if(!c)return true;
 if(c.saveData)return false;
 return !/(^|-)2g$/.test(c.effectiveType??'');
}

/** requestIdleCallback with a timeout, or a short timer where it is missing (Safari). Never requestAnimationFrame. Returns a cancel. */
export function whenIdle(run:()=>void,timeout=3000):()=>void{
 const w=window as Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};
 if(w.requestIdleCallback){const id=w.requestIdleCallback(()=>run(),{timeout});return()=>w.cancelIdleCallback?.(id);}
 const id=setTimeout(run,Math.min(timeout,250));return()=>clearTimeout(id);
}
/** Runs `run` now if the tab is visible, else on its next visibilitychange to visible (no work in a hidden tab). */
function whenVisible(run:()=>void):()=>void{
 if(!document.hidden){run();return()=>{};}
 const on=()=>{if(document.hidden)return;document.removeEventListener('visibilitychange',on);run();};
 document.addEventListener('visibilitychange',on);return()=>document.removeEventListener('visibilitychange',on);
}

// ── a. Idle prefetch ────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The title's entrance (TitleScene starts its calm countdown CALM_MS + 1500 ms after mount): prefetching waits until it has played. */
export const SETTLE_MS=1500;
let prefetchState:'none'|'scheduled'|'done'='none';

/** Stage a. Schedules the prefetch for when the title screen has settled; returns a cancel (TitleActions unmounting). */
export function prefetchIslandWhenSettled():()=>void{
 if(prefetchState!=='none')return()=>{};
 if(!prefetchAllowed()){bootMark('prefetch:skipped');return()=>{};}
 prefetchState='scheduled';
 let cancel=()=>{};
 const afterLoad=()=>{const t=setTimeout(()=>{cancel=whenVisible(()=>{cancel=whenIdle(prefetchIslandNow,4000);});},SETTLE_MS);cancel=()=>clearTimeout(t);};
 if(document.readyState==='complete')afterLoad();
 else{const on=()=>afterLoad();window.addEventListener('load',on,{once:true});cancel=()=>window.removeEventListener('load',on);}
 return()=>{cancel();if(prefetchState==='scheduled')prefetchState='none';};
}
const supportsPrefetch=()=>{try{return document.createElement('link').relList.supports('prefetch');}catch{return false;}};
/** Download-only, idle priority (Safari has no rel=prefetch). The body is read so the whole file lands in the HTTP cache. */
function lowFetch(url:string){
 const init:RequestInit&{priority?:string}={credentials:'same-origin',priority:'low'};
 void fetch(url,init).then(r=>r.ok?r.arrayBuffer():null).catch(()=>null);
}
/** Prefetch now (the settle timer, or a restore intent). Respects Save-Data / 2G. */
export function prefetchIslandNow(){
 if(prefetchState==='done'||!prefetchAllowed())return;
 prefetchState='done';bootMark('prefetch:start');
 const native=supportsPrefetch();
 void import('./gamePrefetch').then(({FIRST_FRAME_IMAGES})=>{
  for(const src of FIRST_FRAME_IMAGES){const img=new Image() as HTMLImageElement&{fetchPriority?:string};img.decoding='async';img.fetchPriority='low';img.src=src;}
  if(native)return;
  for(const link of document.querySelectorAll<HTMLLinkElement>('link[rel="prefetch"][as="script"]'))if(link.href.includes('/_next/static/'))lowFetch(link.href);
 },()=>{});
}

// ── b. Warm on intent ───────────────────────────────────────────────────────────────────────────────────────────────────────────
export type WarmIntent='create'|'restore'|'play';
/** A warm island not taken by Town within this long is disposed (the player wandered off without pressing Play). */
export const UNUSED_MS=180_000;
type Warm={mode:'idle'|'eager';done:Promise<void>;cancelled:boolean;wake:(()=>void)|null};
let warm:Warm|null=null,game:GameModule|null=null,unusedTimer:ReturnType<typeof setTimeout>|undefined,pagehideBound=false;

export function warmIsland(intent:WarmIntent){
 if(intent==='restore'){prefetchIslandNow();return;}
 if(intent==='create'&&!prefetchAllowed())return;
 bootMark(`warm:intent-${intent}`);
 const mode=intent==='play'?'eager':'idle';
 armUnused();
 if(warm){if(mode==='eager'&&warm.mode!=='eager'){warm.mode='eager';warm.wake?.();}return;}
 const w:Warm={mode,done:Promise.resolve(),cancelled:false,wake:null};warm=w;
 w.done=run(w);
}
/** Resolves when the warm-up has finished, failed or was never started (the water fill waits for it). */
export function islandWarmSettled():Promise<void>{return warm?.done??Promise.resolve();}

/** Wait for the next slice: idle time (create) or the next task (play); never while the tab is hidden. `wake` cuts an idle wait short. */
function gate(w:Warm):Promise<void>{
 return new Promise(resolve=>{
  let cancel=()=>{};const go=()=>{cancel();w.wake=null;resolve();};
  w.wake=go;
  cancel=whenVisible(()=>{cancel=w.mode==='eager'?(()=>{const t=setTimeout(go,0);return()=>clearTimeout(t);})():whenIdle(go,2000);});
 });
}
async function run(w:Warm):Promise<void>{
 game=await loadGameModule();
 if(!game||w.cancelled)return;
 const steps=game.warmIslandSteps();
 for(;;){
  await gate(w);if(w.cancelled)return;
  let r:IteratorResult<void|Promise<unknown>,boolean>;
  try{r=steps.next();}catch{return;}
  if(r.done)return;
  if(r.value)await r.value;
 }
}
function armUnused(){
 clearTimeout(unusedTimer);unusedTimer=setTimeout(releaseIslandWarm,UNUSED_MS);
 if(!pagehideBound){pagehideBound=true;window.addEventListener('pagehide',releaseIslandWarm);}
}
/** Dispose a warm island that was never taken (no-op once Town has it) and allow a later intent to warm again. */
export function releaseIslandWarm(){
 clearTimeout(unusedTimer);
 if(warm){warm.cancelled=true;warm.wake?.();warm=null;}
 game?.disposeWarmIsland();
}
/** Measurements (scratchpad/preload) and checks: where the warm-up is and what it holds. */
if(typeof window!=='undefined')(window as Window&{__fiWarmInfo?:()=>unknown}).__fiWarmInfo=()=>game?.warmIslandInfo()??null;
