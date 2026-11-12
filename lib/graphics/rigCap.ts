// Continuous friend-rig cap (multiplayer heat recheck, Oct 22 2026; docs/performance-guide.md "Friend rig cap, re-checked").
// Before: the cap (remoteCap 5/5/3/1/0 by heat tier) applied only when a friend was first ADMITTED, so a phone that heated up mid-party
// kept drawing every friend it already showed. Now remoteAvatars.ts re-checks once a second (no per-frame cost, no allocation):
//  - the effective cap DROPS at once (heat matters now) and RISES only after the higher cap has held for READMIT_HOLD s, so a tier
//    flapping between two values never thrashes rig creation;
//  - over the cap: the FARTHEST friends drawn as rigs are demoted to ring + label only (their rig is released after a short fade);
//  - under the cap: the NEAREST waiting friends within range get a rig; a friend already drawn is never swapped for a nearer one (no churn).
// Pure: no three.js, no DOM (tests/mp-avatars.cjs drives it directly).

/** Seconds a higher cap must hold before friends are re-admitted (hysteresis). */
export const READMIT_HOLD=10;
/** Seconds a demoted friend's body takes to shrink away (instant under reduced motion). */
export const DEMOTE_FADE=.4;

export type CapGate={eff:number;hold:number};
export function capGate(raw:number):CapGate{return {eff:raw,hold:0};}
/** One recheck: the effective cap after `dt` s with the raw (tier) cap `raw`. Drops at once; rises after `hold` s at a higher value. */
export function stepCapGate(g:CapGate,raw:number,dt:number,hold=READMIT_HOLD):number{
 if(raw<g.eff){g.eff=raw;g.hold=0;}
 else if(raw>g.eff){g.hold+=dt;if(g.hold>=hold){g.eff=raw;g.hold=0;}}
 else g.hold=0;
 return g.eff;
}

/** `pd2`: squared distance used for priority (Infinity = hidden / indoors / no pose: demoted first, never admitted).
 *  `plan` is written: -1 demote, 1 admit, 0 keep. */
export interface RigSlot{admitted:boolean;pd2:number;plan:number}
/** Plans one recheck. `order` is a reused scratch array (refilled, insertion-sorted nearest first: no allocation once grown).
 *  Returns the number of changes planned. */
export function planRigs<S extends RigSlot>(slots:readonly S[],order:S[],cap:number,range2:number):number{
 order.length=0;let n=0;
 for(let i=0;i<slots.length;i++){const s=slots[i];s.plan=0;order.push(s);if(s.admitted)n++;}
 for(let i=1;i<order.length;i++){const x=order[i];let j=i-1;while(j>=0&&order[j].pd2>x.pd2){order[j+1]=order[j];j--;}order[j+1]=x;}
 let changes=0;
 if(n>cap){for(let i=order.length-1;i>=0&&n>cap;i--)if(order[i].admitted){order[i].plan=-1;n--;changes++;}}
 else for(let i=0;i<order.length&&n<cap;i++){const s=order[i];if(!s.admitted&&s.pd2<=range2){s.plan=1;n++;changes++;}}
 return changes;
}

// ---- Public island (phase 1, Nov 11 2026; docs/multiplayer-public-island-plan-2026-11-11.md) ----------------------------------------
// Strangers are not "friends who joined first": the nearest ones should be the ones drawn as rigs (and, in a room, drawn at all). A
// party keeps planRigs above (never swaps). planNearest adds a swap step WITH hysteresis: a waiting slot replaces the farthest held one
// only when it is nearer by more than `hystM` metres, and at most `maxSwaps` per recheck, so two players at about the same distance
// never flicker between rig and ring (or drawn and not drawn in a room). Same scratch `order`, no allocation once grown.

/** Metres a waiting stranger must be nearer than the farthest held one before they swap (outdoors / in an 11 x 10 m room). */
export const RIG_HYST_M=4,ROOM_HYST_M=1;
/** Swaps per once-a-second recheck: a demoted rig shrinks for DEMOTE_FADE (0.4 s < 1 s), so the batch holds at most cap + this. */
export const MAX_SWAPS=1;
export interface NearSlot{pd2:number;plan:number}
/** `on(s)` = held now (a rig, or drawn in the room). Writes `plan` (-1 drop, 1 take, 0 keep) and returns the number of changes. */
export function planNearest<S extends NearSlot>(slots:readonly S[],order:S[],on:(s:S)=>boolean,max:number,range2:number,hystM:number,maxSwaps=MAX_SWAPS):number{
 order.length=0;let n=0;
 for(let i=0;i<slots.length;i++){const s=slots[i];s.plan=0;order.push(s);if(on(s))n++;}
 for(let i=1;i<order.length;i++){const x=order[i];let j=i-1;while(j>=0&&order[j].pd2>x.pd2){order[j+1]=order[j];j--;}order[j+1]=x;}
 let changes=0;
 if(n>max){for(let i=order.length-1;i>=0&&n>max;i--)if(on(order[i])){order[i].plan=-1;n--;changes++;}return changes;}
 for(let i=0;i<order.length&&n<max;i++){const s=order[i];if(!on(s)&&s.pd2<=range2&&s.pd2<Infinity){s.plan=1;n++;changes++;}}
 let lo=0,hi=order.length-1;
 for(let k=0;k<maxSwaps;k++){
  while(lo<order.length&&(on(order[lo])||order[lo].plan!==0||!(order[lo].pd2<=range2&&order[lo].pd2<Infinity)))lo++;
  while(hi>=0&&(!on(order[hi])||order[hi].plan!==0))hi--;
  if(lo>=order.length||hi<0||lo>hi)break;
  const w=order[lo],h=order[hi];
  if(!(Math.sqrt(w.pd2)+hystM<Math.sqrt(h.pd2)))break;
  w.plan=1;h.plan=-1;changes+=2;lo++;hi--;
 }
 return changes;
}
