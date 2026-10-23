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
