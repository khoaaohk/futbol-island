/**
 * The water model for wading, swimming and splash-downs (P0, Oct 15 2026; design: docs/swimming-research.md §2.1–2.3).
 *
 * Pure numbers and small pure functions, no three.js and no DOM (tests/water-depth.cjs). There is no seabed under the open sea
 * and the shore field is GPU-only at run time, so depth is a made-up shelf read off the analytic distance to land:
 *   depth(x,z) = 0 on land, else min(DEPTH_MAX, SHELF_SLOPE · distanceToLand(x,z))
 * That is the same idea as the fishing strip's virtual seabed, so what you see roughly agrees with what you feel. No textures
 * are read back, no raycasts: one distanceToLand (~30 µs) per probe sample, and the probe samples at WATER_PROBE_HZ, not per
 * frame (createWaterProbe below; the 60 Hz step interpolates nothing, it just reads the last sample, which at ≤ 2.6 m/s is at
 * most 0.26 m stale, well inside the 0.05 m zone hysteresis plus the 0.25 s root blend).
 *
 * Heat (AGENTS.md): no loop, no timer, no allocation in step functions; every function here is a few comparisons.
 */
import {diveSpotAt} from './diveSpots';
import {onLand,distanceToLand} from '../landmass';
import {flightBlocked} from '../simulation';

/** The ocean plane (lib/town/world.ts, ballSea.ts SEA_LEVEL; tests/water-depth.cjs pins them equal). */
export const WATER_LEVEL=-.43;
/** The virtual beach: depth gained per metre offshore (chest-deep about 2.7 m out). */
export const SHELF_SLOPE=.45;
/** Deepest the shelf goes: "swimming" everywhere past it. */
export const DEPTH_MAX=1.6;
/** Zone edges (m of water): ankle < knee < waist < swim; WADE_HYSTERESIS keeps the state from flickering on the line. */
export const ZONE_ANKLE=0,ZONE_KNEE=.25,ZONE_WAIST=.6,ZONE_SWIM=1,WADE_HYSTERESIS=.05;
/**
 * Decision 4 (user, Oct 15 2026, widened the same day after a far drop left a kid standing in the open sea with the land
 * HUD): falls, cut parachutes, rooftop jumps, ride launches and the jetpack "Drop in" splash down over ANY open water inside
 * the flyable world that is at least knee-deep: there is no range; deep water is always the swim state. Guided landings and the
 * landing marker stay land-first.
 */
export const SPLASH_ANYWHERE=true;
/** How far out you can swim (m from land); past it the water eases you back (swimStep's outward fade). A swimmer who was
 *  dropped farther out than this (a far jetpack fall) may only swim inward (the probe's `allowed`). */
export const SWIM_RANGE=60;
/** Splash-downs need at least this much water (a drop into ankle water is an ordinary landing). */
export const SPLASH_MIN_DEPTH=ZONE_KNEE;
/** How often the depth probe asks distanceToLand while in or near the water (Hz). */
export const WATER_PROBE_HZ=10;
/** Walking speed scale per wade zone (walk 3.7 m/s, travelModes.ts); knee and waist water never sprint. */
export const WADE_SPEED={ankle:.9,knee:.7,waist:.5} as const;
/** Swim speeds (m/s): the head-up crawl, and the Swim fast hold (user, Oct 15 2026: "swim fast isn't moving faster": 1.72× now);
 *  acceleration (quicker on the hold) and braking per second (water carries momentum). */
/** SWIM_SPEED is the player's crawl and SWIM_SPRINT the player's Swim fast; SWIM_FAST_SPEED (6.2) is the sprint the animal rides were tuned against (animalRides.ts), kept so the rides do not change when the player swims faster. */
export const SWIM_SPEED=4.8,SWIM_SPRINT=8.2,SWIM_FAST_SPEED=6.2,SWIM_ACCEL=6.5,SWIM_FAST_ACCEL=10,SWIM_BRAKE=3.4;// Oct 21 2026 (user: "increase the regular swim speed more and the faster swim speed"): 3.7 / 6.2 -> 4.8 / 8.2 (still 1.7x). Oct 15 2026 (user: "make the swimming speed faster and also make the faster speed even faster"): was 1.8 / 3.1, then 2.6 / 4.6; now the walk speed 3.7 and a sprint well above it (user: "increase the swim speed to match the walking speeds")
/** The rig root while swimming sits this far under the water line (shoulders at the surface, head above it). 1.0 since Oct 19 2026
 *  (was 1.27): the body is seen through the swimmer's clear disc now (swimClear.ts); the pose heights follow swimPose WATER_LINE. */
export const SWIM_ROOT_DEPTH=1.0;
/** Wading: the feet stand on the virtual seabed (the beach outline sits at −0.12). */
export const WADE_FOOT_Y=-.12;
/** Root height blend between zones (s): never a pop. */
export const WATER_ROOT_BLEND=.25;
/** Decision 3 (user, Oct 15 2026): the ball never floats with the swimmer; it stays parked on the sand where you went in. */
export const BALL_STAYS_ON_SAND=true;

export type WadeZone='none'|'ankle'|'knee'|'waist'|'swim';

/** Depth of water at (x, z) from the analytic distance to land (0 on land). One distanceToLand call off land. */
export function waterDepthAt(x:number,z:number){
 if(onLand(x,z))return 0;
 return Math.min(DEPTH_MAX,SHELF_SLOPE*distanceToLand(x,z));
}
/** Depth for a known distance to land (the probe's cached sample). */
export const depthForDistance=(d:number)=>d<=0?0:Math.min(DEPTH_MAX,SHELF_SLOPE*d);

const ZONE_ORDER:readonly WadeZone[]=['none','ankle','knee','waist','swim'];
const ZONE_EDGE=[ZONE_ANKLE,ZONE_KNEE,ZONE_WAIST,ZONE_SWIM];
/**
 * The wade zone for a depth, with hysteresis against the previous zone: a zone is only left once the depth is WADE_HYSTERESIS
 * past its edge, so a walker standing on the knee line does not flicker between gaits.
 */
export function wadeZone(depth:number,previous:WadeZone='none'):WadeZone{
 if(depth<=0)return 'none';
 let i=ZONE_ORDER.indexOf(previous);if(i<0)i=0;
 // Deeper: cross the next edge plus the hysteresis. Shallower: fall below this zone's own edge minus it.
 while(i<ZONE_EDGE.length&&depth>ZONE_EDGE[i]+(i===0?0:WADE_HYSTERESIS))i++;
 while(i>0&&depth<ZONE_EDGE[i-1]-(i-1===0?0:WADE_HYSTERESIS))i--;
 // 'none' needs depth 0 exactly (the coast polygon is the line); any water is at least ankle water.
 if(i===0&&depth>0)i=1;
 return ZONE_ORDER[i];
}
/** Walking speed scale while wading in a zone (1 on land; swimming has its own step). */
export function wadeSpeedScale(zone:WadeZone){
 return zone==='ankle'?WADE_SPEED.ankle:zone==='knee'?WADE_SPEED.knee:zone==='waist'?WADE_SPEED.waist:1;
}
/** The rig's root height while wading at this depth (the feet on the shelf). */
export const wadeRootY=(depth:number)=>WADE_FOOT_Y-depth;
/** The rig's root height while swimming. */
export const SWIM_ROOT_Y=WATER_LEVEL-SWIM_ROOT_DEPTH;

/**
 * Whether a fall, a cut parachute, a launch or the jetpack "Drop in" ending at (x, z) becomes a water landing (decision 4):
 * open water inside the flyable world, at least knee-deep, however far from land. One distanceToLand call; called once per
 * touchdown, never per frame.
 */
export function canSplashDown(x:number,z:number){
 if(flightBlocked(x,z)||onLand(x,z))return false;
 return depthForDistance(distanceToLand(x,z))>=SPLASH_MIN_DEPTH;
}

export type WaterProbe={
 /** Distance to land at the last sample (0 on land) and where it was taken. */
 readonly d:number;readonly x:number;readonly z:number;readonly depth:number;readonly land:boolean;
 /** Ask again at most WATER_PROBE_HZ times a second (or at once when `force`); onLand is read every call (cheap). */
 sample(x:number,z:number,dt:number,force?:boolean):number;
 /** Swimmable water at (x, z): off land, inside the flyable world, within SWIM_RANGE of land. Uses the cached distance as a
  *  bound (|d(a) − d(b)| ≤ |a − b|), so it costs one distanceToLand only right at the range edge. Already farther out than the
  *  range (a far splash-down): only points no farther from land than the last sample, so the swimmer can always come home. */
 allowed(x:number,z:number):boolean;
 /** Dry land at (x, z) (the injected land test; cheap: polygon and box tests). */
 isLand(x:number,z:number):boolean;
 /** How many distanceToLand calls so far (tests, the ?heat readout). */
 readonly calls:number;
 reset():void;
};
/** The cached 10 Hz depth probe. `distance` and `land` default to the island's real tests (injectable for tests). */
export function createWaterProbe(distance:(x:number,z:number)=>number=distanceToLand,land:(x:number,z:number)=>boolean=onLand,blockedAt:(x:number,z:number)=>boolean=flightBlocked):WaterProbe{
 let d=0,px=NaN,pz=NaN,acc=Infinity,calls=0,isLand=true;
 const probe:WaterProbe={
  get d(){return d;},get x(){return px;},get z(){return pz;},get depth(){return depthForDistance(d);},get land(){return isLand;},get calls(){return calls;},isLand:land,
  sample(x,z,dt,force=false){
   const nowLand=land(x,z);
   if(nowLand){if(!isLand||d!==0){isLand=true;d=0;px=x;pz=z;acc=0;}else{px=x;pz=z;}return 0;}
   acc+=dt;
   if(force||isLand||acc>=1/WATER_PROBE_HZ-1e-6||!Number.isFinite(px)){acc=0;isLand=false;d=distance(x,z);px=x;pz=z;calls++;}
   return depthForDistance(d);
  },
  allowed(x,z){
   if(blockedAt(x,z)||land(x,z))return false;
   const reach=Number.isFinite(px)?d+Math.hypot(x-px,z-pz):Infinity;
   if(reach<=SWIM_RANGE)return true;
   // Dive zones out at sea (Oct 20 2026, the user's map circles; lib/town/water/diveSpots.ts): open water inside a zone's blob is
   // swimmable however far from land (you reach them with the jetpack's Drop in). A distance reject per zone; only past the range.
   if(diveSpotAt(x,z))return true;
   if(!Number.isFinite(px))return false;
   const limit=Math.max(SWIM_RANGE,d+.02);/* 2 cm of slack per sample: sliding along the edge, never a swim outward */
   if(d-Math.hypot(x-px,z-pz)>limit)return false;
   calls++;return distance(x,z)<=limit;
  },
  reset(){d=0;px=pz=NaN;acc=Infinity;isLand=true;},
 };
 return probe;
}

/**
 * One swim tick (the sim's own `stepPlayer` keeps walking, wading and rides; swimming is simpler: no obstacles in the sea).
 * `input` is the stick (camera-relative, length ≤ 1); `fast` is the Swim fast hold; `allowed` says whether a point is
 * swimmable water (the probe's test); `land` whether it is dry land (a climb-out is allowed: the state machine takes over).
 * Momentum: the velocity eases to the stick at SWIM_ACCEL (SWIM_BRAKE when released). Near SWIM_RANGE a current slows the
 * swimmer: the top speed fades to SWIM_EDGE_KEEP of itself over the last SWIM_EDGE_FADE m, and `allowed` is the soft wall at
 * the range itself (the step slides along it). No allocation.
 */
export const SWIM_EDGE_FADE=6,SWIM_EDGE_KEEP=.35;
export function swimStep(position:{x:number;z:number},velocity:{x:number;z:number},input:{x:number;z:number},fast:boolean,dt:number,allowed:(x:number,z:number)=>boolean,land:(x:number,z:number)=>boolean,distanceOut=0){
 dt=Math.max(0,Math.min(dt,.25));
 let ix=input.x,iz=input.z;let len=Math.hypot(ix,iz);
 if(len>1){ix/=len;iz/=len;len=1;}
 const edge=Math.max(0,Math.min(1,(SWIM_RANGE-distanceOut)/SWIM_EDGE_FADE));
 const top=(fast?SWIM_SPRINT:SWIM_SPEED)*len*(SWIM_EDGE_KEEP+(1-SWIM_EDGE_KEEP)*edge);
 const targetX=len>0?ix/len*top:0,targetZ=len>0?iz/len*top:0;
 const blend=1-Math.exp(-dt*(len>0?(fast?SWIM_FAST_ACCEL:SWIM_ACCEL):SWIM_BRAKE));
 velocity.x+=(targetX-velocity.x)*blend;velocity.z+=(targetZ-velocity.z)*blend;
 const nx=position.x+velocity.x*dt,nz=position.z+velocity.z*dt;
 const ok=(x:number,z:number)=>allowed(x,z)||land(x,z);
 if(ok(nx,nz)){position.x=nx;position.z=nz;}
 else{
  // Slide along whichever axis is still open (the range edge, the world's edge); the other axis stops.
  if(ok(nx,position.z))position.x=nx;else velocity.x=0;
  if(ok(position.x,nz))position.z=nz;else velocity.z=0;
 }
 return Math.hypot(velocity.x,velocity.z);
}
