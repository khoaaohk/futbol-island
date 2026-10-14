// Hops off Summit Isle's crests (Oct 13 2026, user: "when going down the mountain, have it jump off ledges and animate the landing").
// Going downhill at speed (a ride, or running), where the ground falls away faster than the rider can follow (a convex crest, a
// ridge, a trail bank's edge, a drop between spurs), the rider leaves the ground instead of being glued to it:
//  - Launch: the ballistic path from here (the current vertical speed along the slope plus a small pop, gravity HOP_GRAVITY) clears
//    the ground ahead by HOP_DROP m or more within LOOK s; only downhill (grade below -HOP_MIN_GRADE) and at HOP_MIN_SPEED or faster,
//    so a crawl or a climb never leaves the ground. Three look-ahead reads of the 2 m height grid per tick, and only then.
//  - Air: simple ballistic gravity, integrated at the caller's fixed tick (Town: 60 Hz, so the same hop at every frame rate). Never
//    higher than HOP_MAX_GAP m over the ground for long (gravity grows past it), never longer than HOP_MAX_TIME s, never below the
//    ground. The horizontal move and its collisions are the caller's (stepPlayer), so trees and props still stop a hop.
//  - Landing: `landImpact` (m/s, the closing speed with the ground) on the touchdown tick, for the squash, the dust and the thud.
import {summitGridGround} from './summitIsle';
import {nearSummit} from './rideSlope';
import type {TravelMode} from './travelModes';

export const HOP_GRAVITY=24,HOP_MIN_GRADE=.08,HOP_MAX_TIME=1.5,HOP_MAX_GAP=1.6,HOP_CEILING=2.6,HOP_COOLDOWN=.3,HOP_MAX_IMPACT=14;
/** How far the ground must fall away below the ballistic path for a hop (m): walkers hop off smaller crests (they are slower). */
export const HOP_DROP:Record<TravelMode,number>={walk:.25,scooter:.6,bike:.6,moped:.6,jetpack:Infinity};
/** Slowest a hop starts at (m/s): rides above a brisk roll, walkers only when running (the sprint is 6). */
export const HOP_MIN_SPEED:Record<TravelMode,number>={walk:4.8,scooter:7,bike:7,moped:7,jetpack:Infinity};
const LOOK=[.1,.2,.3];
const popFor=(speed:number)=>Math.min(1.4,.4+.04*speed);
export type SlopeHopState={air:boolean;time:number;vy:number;landImpact:number;lastAir:number;hops:number;peakGap:number};
export function createSlopeHop(){
 const state:SlopeHopState={air:false,time:0,vy:0,landImpact:0,lastAir:0,hops:0,peakGap:0};let cooldown=0;
 /** Grade (rise per metre) along the unit heading (ux, uz) from the grid, ±1 m. */
 const grade=(x:number,z:number,ux:number,uz:number)=>(summitGridGround(x+ux,z+uz)-summitGridGround(x-ux,z-uz))/2;
 return {state,
  reset(){state.air=false;state.time=state.vy=state.landImpact=state.peakGap=0;cooldown=0;},
  /** After this tick's horizontal move to (x, z) at velocity (vx, vz): the height to draw and stand the rider at (`floor`, the
   *  ground there, unless a hop is under way). `height` is last tick's. */
  step(dt:number,mode:TravelMode,x:number,z:number,vx:number,vz:number,height:number,floor:number){
   state.landImpact=0;cooldown=Math.max(0,cooldown-dt);if(!(dt>0))return state.air?Math.max(height,floor):floor;
   const speed=Math.hypot(vx,vz);
   if(state.air){state.time+=dt;const gap=height-floor;
    const g=HOP_GRAVITY+(gap>HOP_MAX_GAP?45*(gap-HOP_MAX_GAP):0)+(state.time>HOP_MAX_TIME*.7?80*(state.time-HOP_MAX_TIME*.7):0);
    state.vy-=g*dt;let h=height+state.vy*dt;
    // Never absurdly high: where the ground drops away from under a hop, it follows the ground down from HOP_CEILING m over it.
    if(h-floor>HOP_CEILING){h=floor+HOP_CEILING;state.vy=Math.min(state.vy,0);}
    state.peakGap=Math.max(state.peakGap,h-floor);
    if(h>floor&&state.time<HOP_MAX_TIME)return h;
    // Touchdown: the closing speed is the fall less the ground's own drop under the rider.
    const groundVy=speed>.1&&nearSummit(x,z)?speed*grade(x,z,vx/speed,vz/speed):0;
    state.landImpact=Math.min(HOP_MAX_IMPACT,Math.max(.3,groundVy-state.vy));state.lastAir=state.time;state.air=false;state.vy=0;cooldown=HOP_COOLDOWN;return floor;}
   if(cooldown>0||speed<HOP_MIN_SPEED[mode]||!nearSummit(x,z))return floor;
   const ux=vx/speed,uz=vz/speed,g0=grade(x,z,ux,uz);if(g0>-HOP_MIN_GRADE)return floor;
   // The ballistic path against the ground ahead (the grid lined up with the real ground here).
   const vy=speed*g0+popFor(speed),off=floor-summitGridGround(x,z);let clear=0;
   for(const t of LOOK){const ahead=summitGridGround(x+vx*t,z+vz*t)+off,path=floor+vy*t-.5*HOP_GRAVITY*t*t;clear=Math.max(clear,path-ahead);}
   if(clear<HOP_DROP[mode])return floor;
   state.air=true;state.time=0;state.vy=vy;state.peakGap=0;state.hops++;return floor;}};
}
