'use client';
import {useEffect,useState} from 'react';
import Town from './Town';
import IslandReturnLoading from './IslandReturnLoading';
import {disposeWarmIsland,warmIslandSteps} from '@/lib/town/islandWarm';
import {bootMark} from '@/lib/boot/perfMarks';
/**
 * The room-trip return (/play?from=arcade|konbini|museum|shop → /island-return; Nov 10 2026 heat pass, docs/performance-guide.md
 * "Room trips: warm return"). Before, Town mounted at once with no warm island, so it built the whole world in one main-thread task
 * and every shader compiled in the first frame. Now the return loading screen shows while the island is built in short task-sized
 * slices (lib/town/islandWarm.ts warmIslandSteps, the title screen's warm-up) and its shaders compile with renderer.compileAsync;
 * Town then mounts and takes the built island (takeWarmIsland). No requestAnimationFrame; no work while the tab is hidden.
 * Fallbacks: after RETURN_WARM_MAX_MS Town mounts anyway (takeWarmIsland finishes any slices left, or Town builds as before);
 * `?returnWarm=0` keeps the old path (A/B measurements).
 */
export const RETURN_WARM_MAX_MS=8000;
/** Main-thread budget per task: slices run back to back until it is spent, then the page gets a turn (the loading screen animates). */
export const RETURN_SLICE_MS=24;
// A MessageChannel task, not setTimeout(0): nested timers are clamped to 4 ms each, which added ~0.5 s over the island's slices.
const nextSlice=()=>new Promise<void>(resolve=>{
 const go=()=>{const ch=new MessageChannel();ch.port1.onmessage=()=>{ch.port1.close();resolve();};ch.port2.postMessage(0);};
 if(!document.hidden){go();return;}
 const on=()=>{if(document.hidden)return;document.removeEventListener('visibilitychange',on);go();};document.addEventListener('visibilitychange',on);
});
export default function IslandReturnWarm(){
 const [mount,setMount]=useState(false);
 useEffect(()=>{
  let cancelled=false,taken=false;const done=()=>{if(cancelled||taken)return;taken=true;
   // Town renders its own copy of this loading screen: it must not replay the sign's arrival (IslandReturnLoading.module.css).
   document.documentElement.dataset.returnWarm='1';setMount(true);};
  try{if(new URLSearchParams(window.location.search).get('returnWarm')==='0'){done();return;}}catch{}
  bootMark('return-warm:start');
  const timer=setTimeout(done,RETURN_WARM_MAX_MS);
  void (async()=>{
   const steps=warmIslandSteps();
   for(;;){
    await nextSlice();if(cancelled||taken)return;
    const t0=performance.now();let r:IteratorResult<void|Promise<unknown>,boolean>|null=null;
    try{do{r=steps.next();}while(!r.done&&!r.value&&performance.now()-t0<RETURN_SLICE_MS);}catch{break;}
    if(r.done)break;
    if(r.value)await r.value;
   }
   bootMark('return-warm:ready');clearTimeout(timer);done();
  })();
  // Unmounted before Town took it (navigating away): free the warm renderer and scene. After the hand-off this is a no-op.
  return()=>{cancelled=true;clearTimeout(timer);if(!taken)disposeWarmIsland();};
 },[]);
 return mount?<Town returningFromArcade/>:<IslandReturnLoading/>;
}
