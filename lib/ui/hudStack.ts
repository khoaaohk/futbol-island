/**
 * Island HUD stack arbiter (docs/ui/HUD_STACK.md). Pure logic, no DOM: Town calls `choose` on its existing ~150 ms HUD tick and
 * only writes the DOM / React state when the answer changes. Everything under the coins bar lives in one flex column
 * (`.hud-stack`, Town.tsx) in this slot order:
 *   1 task   — the job panel and job cards (Start job / Job done), Hop off / Land on truck, the rooftop knockout status
 *   2 focus  — exactly ONE of: a job sign, a proximity action (Talk, Enter, Fish, Sell, Go, Drink water), Spot it, the ball-hunt hint, Learn Plays
 *   3 toast  — one transient note at a time (coins, garden picks, unlocks), queued and merged; the garden line rests here
 *   4 guide  — the once-a-day welcome-back card
 * World-anchored actions (Enter / Fish / Sell / Go) keep following their door or post on screen, but never rise above the stack.
 */

/** Everything that can hold the focus slot, strongest first within each tier. */
export type HudFocus='hop-off'|'land-truck'|'talk'|'enter'|'fish'|'sell'|'vending'|'job-offer'|'spot'|'hint'|'learn';
export type HudCandidate={kind:HudFocus;/** metres from the player; hover (explicit desktop intent) uses -1 */distance:number;key?:string};
export type HudContext={
 /** riding in a truck bed */ridingTruck:boolean;
 /** jetpack/flying (ground prompts sleep; building doors and vending machines are fly-in destinations by design) */flying:boolean;
 /** an island job is running, or its Start job / Job done card is open: the job owns the stack and other prompts wait */jobActive:boolean;
 /** inside the Community Garden: the garden line replaces Learn Plays */inGarden:boolean;
};

/** Tiers: a ride action or a job sign always wins (the child chose to act here: a job ranks with the job panel), then proximity
 *  actions (nearest wins), then the short Spot-it card, the hint, and last the ambient Learn Plays card (shown whenever a pitch is
 *  in view, so anything the player is actually standing at outranks it). */
export const FOCUS_TIER:Record<HudFocus,number>={'hop-off':0,'land-truck':0,'job-offer':0,talk:1,enter:1,fish:1,sell:1,vending:1,spot:2,hint:3,learn:4};
/** Actions drawn by the world (they follow their door or post) rather than in the stack's focus slot. */
export const WORLD_ANCHORED:ReadonlySet<HudFocus>=new Set(['enter','fish','sell','vending']);
/** Ground prompts that sleep while flying. */
const GROUND:ReadonlySet<HudFocus>=new Set(['talk','fish','sell','job-offer']);

/** Context rules (docs/ui/HUD_STACK.md §Context): which candidates may compete at all. */
export function eligible(kind:HudFocus,ctx:HudContext):boolean{
 if(ctx.ridingTruck)return kind==='hop-off';
 if(ctx.jobActive)return kind==='hop-off'||kind==='land-truck';
 if(ctx.flying&&GROUND.has(kind))return false;
 if(ctx.inGarden&&kind==='learn')return false;
 return true;
}

/**
 * One focus at a time, with hysteresis so walking between two targets does not flicker:
 *  - a lower tier always wins at once (Hop off beats Talk, Talk beats Learn Plays);
 *  - inside a tier, hover (distance -1) wins at once; otherwise a challenger replaces the current choice only when it is
 *    `margin` metres closer, or once the current one has been gone for `holdMs` (a candidate that blinks out for one tick
 *    — a door projecting behind the camera for a frame — keeps its place).
 */
export function createFocusArbiter({margin=1.5,holdMs=300}:{margin?:number;holdMs?:number}={}){
 let current:HudCandidate|null=null,lostAt=-1;
 const same=(a:HudCandidate,b:HudCandidate)=>a.kind===b.kind&&(a.key??'')===(b.key??'');
 function choose(candidates:readonly HudCandidate[],ctx:HudContext,now:number):HudCandidate|null{
  let best:HudCandidate|null=null;
  for(const c of candidates){if(!eligible(c.kind,ctx))continue;
   if(!best||FOCUS_TIER[c.kind]<FOCUS_TIER[best.kind]||FOCUS_TIER[c.kind]===FOCUS_TIER[best.kind]&&c.distance<best.distance)best=c;}
  const kept=current?candidates.find(c=>same(c,current!)&&eligible(c.kind,ctx)):undefined;
  if(current&&!kept){
   // Briefly keep a vanished choice only if nothing stronger arrived.
   if(lostAt<0)lostAt=now;
   if(now-lostAt<holdMs&&(!best||FOCUS_TIER[best.kind]>=FOCUS_TIER[current.kind]))return current;
   current=null;lostAt=-1;
  }else lostAt=-1;
  if(!best){current=null;return null;}
  if(kept){
   const tb=FOCUS_TIER[best.kind],tk=FOCUS_TIER[kept.kind];
   const switchNow=tb<tk||tb===tk&&!same(best,kept)&&(best.distance<0||best.distance+margin<kept.distance);
   current=switchNow?best:kept;return current;
  }
  current=best;return current;
 }
 return {choose,reset(){current=null;lostAt=-1;},get current(){return current;}};
}

/** Transient notes: one visible at a time. A note with the same `merge` key as the one on screen folds into it ("+3 Strawberry"),
 *  anything else waits in a short queue (oldest dropped past `max`). Pure data; IslandJobs owns the timer. */
export type HudToast={title:string;detail:string;merge?:string;count?:number;/** builds the merged title from the running count */retitle?:(count:number)=>string};
export function pushToast(queue:readonly HudToast[],next:HudToast,max=3):HudToast[]{
 const head=queue[0];
 if(head&&next.merge&&head.merge===next.merge){const count=(head.count??1)+(next.count??1);
  // The first note's detail stays (a first pick teaches its lesson; later picks only add to the count).
  return [{...next,count,title:next.retitle?next.retitle(count):next.title,detail:head.detail},...queue.slice(1)];}
 // A queued (not yet shown) note of the same kind merges too, so ten quick picks never become ten notes.
 const i=next.merge?queue.findIndex((t,k)=>k>0&&t.merge===next.merge):-1;
 if(i>0){const t=queue[i],count=(t.count??1)+(next.count??1),copy=queue.slice();copy[i]={...next,count,title:next.retitle?next.retitle(count):next.title};return copy;}
 const out=[...queue,next];
 while(out.length>max)out.splice(1,1);// keep the one on screen, drop the oldest waiting
 return out;
}
/** Shorter display while others wait, so a burst drains in a few seconds. */
export const toastDuration=(waiting:number)=>waiting>0?2600:5200;
