'use client';
/**
 * The HUD stack's toast lane (docs/ui/HUD_STACK.md): one transient note on screen at a time across IslandJobs (coins, garden
 * picks, daily play), CostumeMilestoneToast, RideUnlockToast, the water lessons, the reef hint, the fuel and beachcombing notes and
 * the dive's notes and edge chip. A note claims the lane while it shows and releases it when it hides; the others wait (their
 * timers do not run while they wait). Event-driven, no timers or polling of its own.
 *
 * Calm HUD (Oct 21 2026, user: "only show one at a time"): the lane now has a priority. A note that asks while the lane is busy is
 * remembered as waiting (for WAIT_MS); when the lane frees, a waiting note of a higher priority goes first (a lower one asking
 * first is told to wait). Priority: blocking card > payday > story card > hint > note (TOAST_PRIORITY). A blocking card (the dive's
 * find card, the Bug squad's story card) `hold`s the lane: while it shows, no note starts.
 */
import {useSyncExternalStore} from 'react';
/** Higher goes first when the lane frees. Unknown ids are plain notes (1). */
export const TOAST_PRIORITY:Record<string,number>={card:5,payday:4,story:3,
 reef:2,ray:2,swim:2,shark:2,ride:2,dive:2,costume:2,
 jobs:1,beach:1,fuel:1,'dive-edge':1,'dive-note':1};
/** A waiting note is forgotten after this long (it stopped asking: unmounted, or dropped as stale). */
export const WAIT_MS=6000;
/** Nov 12 2026 (owner: "only show one message at a time"): a note that just left is still on screen for its exit animation
 *  (components/HudStack.tsx HUD_EXIT_MS 260 + 80 ms until the clone goes). settle() keeps a card from opening over it. */
export const EXIT_GAP_MS=340;
let owner:string|null=null,releasedAt=-1e12;
const holds=new Set<string>(),waiting=new Map<string,number>(),listeners=new Set<()=>void>(),quietTimers=new Map<string,ReturnType<typeof setTimeout>>();
const emit=()=>listeners.forEach(fn=>fn());
const prio=(id:string)=>TOAST_PRIORITY[id]??1;
const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
const outranked=(id:string)=>{const t=now();for(const [w,at] of waiting){if(t-at>WAIT_MS){waiting.delete(w);continue;}if(w!==id&&prio(w)>prio(id))return true;}return false;};
export const toastLane={
 get owner(){return owner;},
 /** Whether a blocking card holds the lane. */
 get held(){return holds.size>0;},
 /** Take the lane (true) or learn it is busy (false, and you are remembered as waiting). Re-claiming your own lane is a no-op. */
 request(id:string){if(owner===id)return true;
  if(owner!==null||holds.size>0||outranked(id)){if(!waiting.has(id)){waiting.set(id,now());
   // a note waiting behind a higher one that never claims the lane gets asked again once that one is forgotten (one timeout)
   if(owner===null&&holds.size===0){const h=setTimeout(emit,WAIT_MS+20) as unknown as {unref?:()=>void};h?.unref?.();}}return false;}
  waiting.delete(id);owner=id;emit();return true;},
 release(id:string){waiting.delete(id);if(owner===id){owner=null;releasedAt=now();emit();}},
 /** Nov 12 2026 (the shimmer overlap): true when the last note left more than EXIT_GAP_MS ago (its exit animation is over). Otherwise
  *  false, and a short quiet hold covers the rest of the gap (ONE timeout); its end re-asks every waiting note through the lane's emit.
  *  The public cards, the people-button hint and the island life note (Match o'clock) ask this before request(). */
 settle(id:string){const left=releasedAt+EXIT_GAP_MS-now();if(left<=0)return true;toastLane.quiet(id+':exit',Math.ceil(left));return false;},
 /** A note has something to show (before it asks): it is remembered as waiting, so a lower note does not take the lane first. */
 want(id:string){if(owner!==id)waiting.set(id,now());},
 /** Stop waiting (a note dropped as stale, or unmounted). */
 cancel(id:string){waiting.delete(id);},
 /** A blocking card shows (on) or closes (off): while any hold is on, no note starts. */
 hold(id:string,on:boolean){const had=holds.has(id);if(on)holds.add(id);else holds.delete(id);if(had!==on)emit();},
 /** A short quiet hold (Nov 11 2026, owner: "only show one message at a time ... welcome back first. the shimmer shows later"): holds
  *  the lane for `ms`, then lets go (ONE timeout; calling again restarts it). The arrival settle and the gap after Welcome back. */
 quiet(id:string,ms:number){const t=quietTimers.get(id);if(t!==undefined)clearTimeout(t);toastLane.hold(id,true);
  const h=setTimeout(()=>{quietTimers.delete(id);toastLane.hold(id,false);},ms) as unknown as {unref?:()=>void};h?.unref?.();quietTimers.set(id,h as unknown as ReturnType<typeof setTimeout>);},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 /** Tests only. */
 reset(){owner=null;releasedAt=-1e12;for(const t of quietTimers.values())clearTimeout(t);quietTimers.clear();holds.clear();waiting.clear();emit();},
};
/** True while another note holds the lane, a blocking card holds it, or a higher-priority note waits for it. */
export function useToastLaneBusy(id:string){return useSyncExternalStore(toastLane.subscribe,()=>owner!==id&&(owner!==null||holds.size>0||outranked(id)),()=>false);}
/** True while a note owns the lane (Welcome back waits for it to finish before it opens and holds the lane itself). */
export function useToastLaneOwned(){return useSyncExternalStore(toastLane.subscribe,()=>owner!==null,()=>false);}
