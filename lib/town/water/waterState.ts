/**
 * The water state machine (P0, Oct 15 2026; docs/swimming-research.md §2.1–2.3): land → wade (ankle / knee / waist, with
 * hysteresis) → swim → back out, plus the splash-down sequence from a fall or the jetpack "Drop in" (under → surface → swim),
 * the Float tap (on the back) and hold (a slow lazy circle), the Swim fast hold, the parked ball (decision 3) and the rig's pose
 * descriptor. Getting out of the sea is swimming to a beach or the jetpack (the host's ride switcher): there is no auto-swim.
 *
 * Pure: no three.js, no DOM, no timers; `step` allocates nothing (one events object is reused and cleared each tick). The host
 * (components/Town.tsx) owns movement and the rig; this only decides what the water is doing to the player.
 * Tests: tests/water-swim.cjs, tests/heat-water.cjs.
 */
import {SWIM_ROOT_Y,SWIM_SPEED,WATER_ROOT_BLEND,wadeRootY,wadeSpeedScale,wadeZone,type WadeZone,type WaterProbe} from './waterDepth';
import type {SwimRigPose,EntryStyle} from '../../graphics/swimPose';

export type WaterPhase='land'|'wade'|'swim'|'under'|'surface';
/** Where a splash-down came from (analytics ids wa:splash_<source>, lib/analytics/waterEvents.ts). */
export type SplashSource='fall'|'roof'|'launch'|'dropin';
/** The dip: the root sinks UNDER_DOWN s, rises UNDER_UP s (the opaque sea hides the body: "under" without an underwater render),
 *  then a SURFACE_TIME s head-shake into treading water. Reduced motion: no dip, a UNDER_REDUCED s cross-fade instead. */
export const UNDER_DOWN=.35,UNDER_UP=.5,UNDER_DEPTH=1.2,UNDER_REDUCED=.3,SURFACE_TIME=.4;
/** The on-screen aqua tint for the "under" moment (CSS, opacity only; none with reduced motion). */
export const UNDER_TINT_MS=450;
/** The follow camera's target eases down this far with the dip and back; a belly-flop adds a short shake. */
export const CAM_DIP=1.2,BELLY_SHAKE=.08,BELLY_SHAKE_TIME=.12,BELLY_DAZED=.4;
/** Ripple cadence (s between rings) by what the body is doing; sizes are the ring pool's `power`. */
export const RIPPLE={ankle:.7,knee:.45,waist:.5,crawl:.8,fast:.55,tread:1.6,float:2.4,circle:1.1} as const;
/** The wake while swimming (user, Oct 15 2026: "add animation for the water moving"): a bow ripple ahead and a V pair behind every
 *  WAKE_STEP s (quicker on Swim fast), and a small splash from each arm as it enters (one per stroke). All from the ring pool. */
export const WAKE_STEP=.38,WAKE_STEP_FAST=.26;
/** Entry styles: a jetpack drop from this high enters clean (streamlined); a roof fall from this high belly-flops. */
export const CLEAN_ENTRY_HEIGHT=12,BELLY_FALL_HEIGHT=2.5;
/** The Float tap's little bob under before floating on the back (s, m). */
export const FLOAT_BOB_TIME=.5,FLOAT_BOB_DEPTH=.35;
/** Float held longer than FLOAT_HOLD_S (user, Oct 15 2026: "holding floats makes you float in a circle"): on the back, drifting
 *  round a circle of CIRCLE_RADIUS m once every CIRCLE_PERIOD s (≈ 1.1 m/s), a soft ring every RIPPLE.circle s; release = treading. */
export const FLOAT_HOLD_S=.28,CIRCLE_RADIUS=1.2,CIRCLE_PERIOD=7;
/** The circle's drift as a stick length for the swim step (2πR/T over the crawl speed). */
export const CIRCLE_INPUT=2*Math.PI*CIRCLE_RADIUS/CIRCLE_PERIOD/SWIM_SPEED;
/** How big a splash-down is by the entry style (× the drop's power): feet first < a belly-flop < a clean dive from high up. */
export const SPLASH_SCALE={feet:.8,belly:1,clean:1.25} as const;
/** Time-in-the-water buckets for analytics (upper bounds, seconds; the last is "longer"). */
export const SWIM_TIME_BUCKETS=[10,30,60,120] as const;

export type WaterEvents={
 /** The feet just went into the sea / just came back onto dry land. */
 entered:boolean;left:boolean;
 /** Swimming just started (from wading in, or surfacing after a splash). */
 swimStarted:boolean;
 /** A ripple ring is due at the body (0 = none, else its power). */
 ripple:number;
 /** The splash-down just hit the water (power 0..1) / the head just broke the surface. */
 splash:number;surfaced:boolean;
 /** The under tint should flash now. */
 tint:boolean;
 /** Seconds spent swimming in the swim that just ended (0 otherwise). */
 swimSeconds:number;
 /** Float / Swim fast were just used (once per use, for analytics); the lazy circle just began. */
 floated:boolean;sped:boolean;circled:boolean;
 /** An arm just entered the water (−1 left, +1 right; 0 none) / the wake pair is due. */
 stroke:number;wake:boolean;
 /** The jetpack just took off out of the water (the host switches the ride). */
 flew:boolean;
};
export type WaterStepInput={
 /** Stick length 0..1 (any input, including keys) and whether the body is really moving (> 0.15 m/s). */
 stick:number;moving:boolean;speed:number;
 /** The walker's ground height on land (seeds the root blend when the feet go in). */
 landY:number;
 /** The player's facing (for the parked ball). */
 yaw:number;
 /** Airborne (a fall, a jump, a hop): the water is ignored until the landing. */
 airborne:boolean;
};

export function createWaterState(probe:WaterProbe,reduced:()=>boolean){
 const state={phase:'land' as WaterPhase,zone:'none' as WadeZone,depth:0,rootY:0,fast:false,floating:false,
  entry:'feet' as EntryStyle,source:'fall' as SplashSource,
  /** Float held: drifting round the lazy circle; `circle` its angle (rad) and (circleX, circleZ) the unit heading the host swims along. */
  circling:false,circle:0,circleX:0,circleZ:1,
  /** Where the ball waits on the sand (decision 3): the last dry spot and a facing whose 0.56 m lead stays on land. */
  park:null as {x:number;z:number;y:number;yaw:number}|null,
  /** Time in the current phase, in the water altogether, in this swim; the Float bob and the belly-flop shake left (s). */
  age:0,wet:0,swimFor:0,bob:0,shake:0,dazed:0,tintLeft:0,
  /** The camera's eased dip offset (m, ≤ 0) and the dip's current depth (m, ≥ 0). */
  camDip:0,dip:0};
 const events:WaterEvents={entered:false,left:false,swimStarted:false,ripple:0,splash:0,surfaced:false,tint:false,swimSeconds:0,floated:false,sped:false,circled:false,stroke:0,wake:false,flew:false};
 const pose:SwimRigPose={w:0,kind:'tread',phase:0,effort:0,fast:0,entry:'feet',shake:0};
 const lastLand={x:NaN,z:NaN,y:0,yaw:0};
 let rippleClock=0,wakeClock=0,strokeIndex=0,splashPower=0,pendFloat=false,pendSped=false,pendCircle=false,pendSplash=0,pendTint=false,pendFly=false,floatHeld=false,heldFor=0;
 const clear=()=>{events.entered=events.left=events.swimStarted=events.surfaced=events.tint=events.floated=events.sped=events.circled=events.wake=events.flew=false;events.ripple=events.splash=events.swimSeconds=events.stroke=0;};
 const stopCircle=()=>{state.circling=false;floatHeld=false;heldFor=0;};
 const leaveWater=()=>{if(state.phase==='swim'||state.phase==='surface'||state.phase==='under'){events.swimSeconds=state.swimFor;}
  state.phase='land';state.zone='none';state.depth=0;state.fast=false;state.floating=false;stopCircle();state.park=null;state.swimFor=0;state.wet=0;state.bob=0;state.dip=0;state.tintLeft=0;pose.w=0;events.left=true;};
 const enterWater=(x:number,z:number,yaw:number)=>{
  // Park the ball on the last dry spot (decision 3): lead the facing that keeps its 0.56 m lead on land (else turn it round).
  // (No dry spot known yet, e.g. a splash-down straight from the jetpack: the host parks it at the nearest landing.)
  const lead=.56,ahead=Number.isFinite(lastLand.x)&&probe.isLand(lastLand.x+Math.sin(yaw)*lead,lastLand.z+Math.cos(yaw)*lead);
  state.park=Number.isFinite(lastLand.x)?{x:lastLand.x,z:lastLand.z,y:lastLand.y,yaw:ahead?yaw:yaw+Math.PI}:null;
  state.phase='wade';state.age=0;state.wet=0;rippleClock=0;events.entered=true;void x;void z;};
 const startSwim=()=>{if(state.phase==='swim')return;state.phase='swim';state.age=0;state.swimFor=0;pose.kind='tread';pose.shake=0;events.swimStarted=true;};
 function step(dt:number,x:number,z:number,input:WaterStepInput):WaterEvents{
  clear();dt=Math.max(0,Math.min(dt,.25));
  // Presses land between ticks: their events are raised on the next step so the host sees them once.
  if(pendFloat){events.floated=true;pendFloat=false;}if(pendSped){events.sped=true;pendSped=false;}if(pendCircle){events.circled=true;pendCircle=false;}
  if(pendSplash>0){events.splash=pendSplash;events.tint=pendTint;pendSplash=0;}
  if(pendFly){pendFly=false;if(state.phase!=='land'){leaveWater();events.flew=true;return events;}}
  const r=reduced();
  if(state.phase==='land'){
   // Dry feet: remember the spot (the ball parks there). Airborne over anything: wait for the landing (the host decides a splash).
   if(probe.isLand(x,z)){lastLand.x=x;lastLand.z=z;lastLand.y=input.landY;lastLand.yaw=input.yaw;state.rootY=input.landY;probe.sample(x,z,dt);return events;}
   if(input.airborne){state.rootY=input.landY;return events;}
   // The feet crossed the coast: into the shallows.
   state.depth=probe.sample(x,z,dt,true);state.zone=wadeZone(state.depth,'none');state.rootY=input.landY;enterWater(x,z,input.yaw);
  }
  state.age+=dt;state.wet+=dt;
  if(state.phase==='under'){
   // The dip: down, then up; the tint flashes at the hit; reduced motion is a short cross-fade with no dip at all.
   const total=r?UNDER_REDUCED:UNDER_DOWN+UNDER_UP;
   state.dip=r?0:state.age<UNDER_DOWN?UNDER_DEPTH*Math.sin(state.age/UNDER_DOWN*Math.PI/2):UNDER_DEPTH*Math.max(0,Math.cos((state.age-UNDER_DOWN)/UNDER_UP*Math.PI/2));
   state.rootY=SWIM_ROOT_Y-state.dip;state.camDip=r?0:-CAM_DIP*state.dip/UNDER_DEPTH;
   if(state.shake>0)state.shake=Math.max(0,state.shake-dt);if(state.dazed>0)state.dazed=Math.max(0,state.dazed-dt);
   pose.w=1;pose.kind='entry';pose.entry=state.entry;pose.phase=state.age;pose.effort=0;pose.fast=0;pose.shake=0;
   if(state.age>=total){state.phase='surface';state.age=0;state.dip=0;state.rootY=SWIM_ROOT_Y;events.surfaced=true;events.ripple=.35;}
   return events;
  }
  if(state.phase==='surface'){
   state.camDip*=Math.exp(-dt*8);if(Math.abs(state.camDip)<1e-3)state.camDip=0;
   if(state.dazed>0)state.dazed=Math.max(0,state.dazed-dt);
   state.rootY=SWIM_ROOT_Y;pose.w=1;pose.kind='entry';pose.entry=state.entry;pose.phase=UNDER_DOWN+UNDER_UP+state.age;pose.shake=r?0:1-state.age/SURFACE_TIME;
   if(state.age>=(r?.1:SURFACE_TIME)){startSwim();}
   return events;
  }
  // Wading or swimming: read the depth (the probe asks distanceToLand at most 10× a second) and the zone with hysteresis.
  state.depth=probe.sample(x,z,dt);
  const zone=wadeZone(state.depth,state.zone);
  if(zone==='none'){leaveWater();lastLand.x=x;lastLand.z=z;lastLand.y=input.landY;lastLand.yaw=input.yaw;state.rootY=input.landY;return events;}
  if(zone!==state.zone){state.zone=zone;rippleClock=0;}
  if(zone==='swim')startSwim();else if(state.phase==='swim'){events.swimSeconds=state.swimFor;state.phase='wade';state.age=0;state.fast=false;state.floating=false;stopCircle();state.bob=0;state.swimFor=0;pose.w=0;}
  if(state.camDip)state.camDip*=Math.exp(-dt*8);
  const k=1-Math.exp(-dt/WATER_ROOT_BLEND);
  if(state.phase==='wade'){
   state.rootY+=(wadeRootY(state.depth)-state.rootY)*k;
   const cadence=zone==='ankle'?RIPPLE.ankle:zone==='knee'?RIPPLE.knee:RIPPLE.waist;
   if(input.moving){rippleClock+=dt;if(rippleClock>=cadence){rippleClock=0;events.ripple=zone==='ankle'?.12:zone==='knee'?.2:.28;}}
   pose.w=0;return events;
  }
  // Swimming.
  state.swimFor+=dt;
  // Float held past FLOAT_HOLD_S: the lazy circle begins (the stick is ignored while it runs; release ends it: treading).
  if(floatHeld){heldFor+=dt;if(!state.circling&&heldFor>=FLOAT_HOLD_S){state.circling=true;state.fast=false;if(!state.floating){state.floating=true;state.bob=FLOAT_BOB_TIME;}pendCircle=true;rippleClock=0;}}
  if(state.circling){state.circle=(state.circle+dt*2*Math.PI/CIRCLE_PERIOD)%(Math.PI*2);state.circleX=Math.cos(state.circle);state.circleZ=-Math.sin(state.circle);}
  if(state.floating&&!state.circling&&input.stick>.05)state.floating=false;
  if(state.bob>0)state.bob=Math.max(0,state.bob-dt);
  const bobDip=state.bob>0&&!r?FLOAT_BOB_DEPTH*Math.sin(state.bob/FLOAT_BOB_TIME*Math.PI):0;
  state.rootY+=(SWIM_ROOT_Y-bobDip-state.rootY)*k;
  const moving=!state.circling&&(input.moving||input.stick>.05);
  pose.w=1;pose.kind=state.floating?'float':moving?'crawl':'tread';pose.entry=state.entry;pose.shake=0;
  pose.effort=Math.min(1,input.speed/SWIM_SPEED);pose.fast=state.fast&&moving?1:0;
  const rate=r?0:pose.kind==='tread'?2.2:pose.kind==='float'?1.2:pose.fast?9:5.5*(.5+.5*pose.effort);
  pose.phase=(pose.phase+dt*rate)%(Math.PI*2*6);
  if(pose.kind==='crawl'){
   // The wake: a bow ripple + the V pair behind every WAKE_STEP (events.wake), and an arm splash as each arm enters (every π of
   // the stroke clock; none with reduced motion, where the clock stands still).
   wakeClock+=dt;if(wakeClock>=(pose.fast?WAKE_STEP_FAST:WAKE_STEP)){wakeClock=0;events.wake=true;}
   const idx=Math.floor(pose.phase/Math.PI);if(idx!==strokeIndex){strokeIndex=idx;events.stroke=idx%2?1:-1;}
  }else{
   wakeClock=0;const cadence=state.circling?RIPPLE.circle:pose.kind==='float'?RIPPLE.float:RIPPLE.tread;
   rippleClock+=dt;if(rippleClock>=cadence){rippleClock=0;events.ripple=state.circling?.22:.15;}
  }
  return events;
 }
 /** A fall, a rooftop launch or the jetpack "Drop in" just hit the water at (x, z): the splash, the dip, the surface. `height`
  * is the drop (m) for the splash size and the entry style; `canopy` = the fall began with a cut parachute. */
 function splashDown(x:number,z:number,source:SplashSource,height:number,yaw:number,canopy=false){
  const r=reduced();
  if(state.phase==='land'){probe.sample(x,z,0,true);lastLand.yaw=yaw;enterWater(x,z,yaw);}
  state.source=source;
  // Entry style by how the body arrives (docs/swimming-research.md §2.2): a clean streamlined entry from a high jetpack drop,
  // a belly-flop from a cut canopy, a ride launch or a flat roof fall, feet first from a short drop.
  state.entry=canopy||source==='launch'?'belly':source==='dropin'?(height>=CLEAN_ENTRY_HEIGHT?'clean':'feet'):height>=BELLY_FALL_HEIGHT?'belly':'feet';
  splashPower=Math.min(1,.35+height/20);
  state.phase='under';state.age=0;state.zone='swim';state.fast=false;state.floating=false;stopCircle();state.swimFor=0;
  state.dip=0;state.rootY=SWIM_ROOT_Y;state.camDip=0;state.tintLeft=r?0:UNDER_TINT_MS/1000;
  state.shake=state.entry==='belly'&&!r?BELLY_SHAKE_TIME:0;state.dazed=state.entry==='belly'?BELLY_DAZED:0;
  // Raised on the next step (the host calls splashDown mid-tick, before its water step): the ring, the sound, the tint.
  pendSplash=splashPower;pendTint=!r;
 }
 /** Float: `down` starts the hold clock, `up` within FLOAT_HOLD_S is a tap (toggle the back float), later it ends the circle;
  *  `tap` (a keyboard press) toggles at once. */
 function press(id:'swimfast'|'float',phase:'tap'|'down'|'up'){
  if(state.phase==='land')return false;
  if(id==='swimfast'){const on=phase==='down';if(on&&!state.fast&&state.phase==='swim')pendSped=true;state.fast=on&&state.phase==='swim';if(on){state.floating=false;stopCircle();}return true;}
  if(id==='float'){
   if(state.phase!=='swim'){stopCircle();return false;}
   if(phase==='down'){floatHeld=true;heldFor=0;return true;}
   if(phase==='up'){const wasCircling=state.circling,tap=floatHeld&&!wasCircling&&heldFor<FLOAT_HOLD_S;stopCircle();if(wasCircling){state.floating=false;return true;}if(!tap)return false;}
   state.floating=!state.floating;if(state.floating){state.bob=FLOAT_BOB_TIME;pendFloat=true;}state.fast=false;return true;}
  return false;
 }
 /** Fly up: the jetpack takes off straight out of the water (the host checks fuel, switches the ride and splashes). Raised on the
  *  next step as `flew`, like the presses; false when not in the water. */
 function takeOff(){if(state.phase==='land')return false;pendFly=true;return true;}
 return {state,events,pose,step,splashDown,press,takeOff,
  get inWater(){return state.phase!=='land';},
  get swimming(){return state.phase==='swim'||state.phase==='under'||state.phase==='surface';},
  /** Swimming freely (not drifting round the Float circle): the 20 fps idle rule may apply once the stick has been still for 4 s
   *  (lib/town/idleRide.ts: it waits for no input and no travel on its own). */
  resting(){return state.phase==='swim'&&!state.circling;},
  /** Walking speed scale while wading (1 when not). */
  get speedScale(){return state.phase==='wade'?wadeSpeedScale(state.zone):1;},
  reset(){pendFly=pendFloat=pendSped=pendCircle=false;pendSplash=0;stopCircle();state.phase='land';state.zone='none';state.depth=0;state.fast=false;state.floating=false;state.park=null;state.swimFor=0;state.wet=0;state.bob=0;state.dip=0;state.camDip=0;state.shake=0;state.dazed=0;state.tintLeft=0;pose.w=0;probe.reset();},
 };
}
/** Which analytics bucket a swim's seconds fall in: 'time_10s' | 'time_30s' | 'time_60s' | 'time_120s' | 'time_long'. */
export function swimTimeBucket(seconds:number){
 for(const b of SWIM_TIME_BUCKETS)if(seconds<b)return `time_${b}s`;
 return 'time_long';
}
