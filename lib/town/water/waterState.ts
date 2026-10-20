/**
 * The water state machine (P0, Oct 15 2026; docs/swimming-research.md §2.1–2.3): land → wade (ankle / knee / waist, with
 * hysteresis) → swim → back out, plus the splash-down sequence from a fall or the jetpack "Drop in" (under → surface → swim),
 * Dive (tap: under; tap again: back up; Oct 19 2026, it replaced the Float toggle and its lazy circle), the Swim fast hold, the parked ball (decision 3) and the rig's pose
 * descriptor. Getting out of the sea is swimming to a beach or the jetpack (the host's ride switcher): there is no auto-swim.
 *
 * Pure: no three.js, no DOM, no timers; `step` allocates nothing (one events object is reused and cleared each tick). The host
 * (components/Town.tsx) owns movement and the rig; this only decides what the water is doing to the player.
 * Tests: tests/water-swim.cjs, tests/heat-water.cjs.
 */
import {DEPTH_MAX,SWIM_ROOT_DEPTH,SWIM_ROOT_Y,SWIM_SPEED,WATER_ROOT_BLEND,wadeRootY,wadeSpeedScale,wadeZone,type WadeZone,type WaterProbe} from './waterDepth';
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
/**
 * Dive (Oct 19 2026, user: "change the float on your back action to dive down into the water"; it replaced the Float toggle and
 * its lazy circle). A tap of Dive eases the swimmer down over DIVE.ease s to DIVE.depth m under the surface, head down on the way
 * in, then level, swimming with the stick as at the surface (Sprint works too); a tap of Surface (the same button) eases back up,
 * head up, with the surfacing head-shake. The depth is bounded by the seabed (diveRoom) and, in the shallows, by the shelf
 * (waterDepth.ts waterDepthAt via the probe: under DIVE.minWater the button is greyed). Auto-surface (no failure states, a heat
 * bound): after DIVE.maxTime s, when the shelf gets too shallow (a shore), and when a ride grab or the jetpack starts (quick:
 * DIVE.quick s). Bubbles: one small surface ring every DIVE.bubble s while under (the host's ring pool).
 */
export const DIVE={depth:1.6,/* was 2.2 (user, Oct 19 2026: the body could not be seen that deep) */ease:1.2,quick:.5,minWater:1.2,maxTime:45,deepSea:1.1,clearance:.45,bed:4.2,tilt:.6,bubble:.45,body:.4,minRoom:.2,ahead:1.2,bedNear:2.9,bedFar:3.9} as const;
/** How deep the body may dive at shore distance d (m): the clear water window's seabed curve (clearWindow.ts CLEAR_BED.floor 4.2,
 *  the fishing uwDepthAt shape; tests/water-dive.cjs pins it) less DIVE.clearance, at most DIVE.depth. The analytic shelf
 *  (waterDepthAt) stops at DEPTH_MAX 1.6 m, so it only bounds the dive in the shallows (diveShore). Out past the clear shallows
 *  (8 → 20 m off the shore) the cap eases to DIVE.deepSea m: the open sea's water is less see-through (waterSurface deepAlpha). */
export const diveRoom=(d:number)=>{const far=Math.max(0,Math.min(1,(d-8)/12)),deep=DIVE.depth-(DIVE.depth-DIVE.deepSea)*far*far*(3-2*far);
 return Math.max(0,Math.min(deep,.05+DIVE.bed*(1-Math.exp(-Math.max(d,0)/3.4))-DIVE.clearance));};
/** The dive the drawn seabed allows (Oct 19 2026, user: "when diving and headed to the shore, diver goes missing"): `bed` is the seabed
 *  depth under the water line at the body (the clear window's bed mesh as drawn, Town.tsx via clearWindow.ts clearBedDepthAt); the
 *  root (the body's lowest point) keeps DIVE.body m above it. The analytic shelf / probe distance alone let the body sink into the
 *  bed where the drawn waterline runs further out than the logical land (Coral Cay's Sharks Beach). The bed shelves steeply, so the
 *  body also rises as the bed comes up from DIVE.bedFar to DIVE.bedNear m (≈ 9 → 4 m off the drawn waterline): the paler, more
 *  opaque shore band of the water hid a diver still deep under it. Under DIVE.minRoom the dive surfaces (and Dive is greyed). */
export const diveBedRoom=(bed:number)=>{const t=Math.max(0,Math.min(1,(bed-DIVE.bedNear)/(DIVE.bedFar-DIVE.bedNear)));
 return Math.max(0,Math.min(bed-SWIM_ROOT_DEPTH-DIVE.body,DIVE.depth*t*t*(3-2*t)));};
/** The shelf's share of the dive (0 at DIVE.minWater − 0.1 m of water, 1 at the shelf's DEPTH_MAX): the diver rises toward a shore. */
export const diveShore=(depth:number)=>{const t=Math.max(0,Math.min(1,(depth-(DIVE.minWater-.1))/(DEPTH_MAX-(DIVE.minWater-.1))));return t*t*(3-2*t);};
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
 /** Dive / Swim fast were just used (once per use, for analytics). */
 dived:boolean;sped:boolean;
 /** Back at the surface after a dive (the drips, the plip, the head-shake) / a bubble ring is due over the diver. */
 rose:boolean;bubble:boolean;
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

/** `seabed` (optional): the drawn seabed's depth under the water line at (x, z), m (Infinity / omitted = no bound but the shelf). */
export function createWaterState(probe:WaterProbe,reduced:()=>boolean,seabed?:(x:number,z:number)=>number){
 const state={phase:'land' as WaterPhase,zone:'none' as WadeZone,depth:0,rootY:0,fast:false,
  entry:'feet' as EntryStyle,source:'fall' as SplashSource,
  /** Dive: `diving` = wants to be under; `under` the eased 0..1 progress; `dive` the body's depth under its surface place (m);
   *  `room` the eased bound (diveRoom × diveShore); `diveFor` seconds in this dive; `tilt` the body pitch (rad, + = head down). */
  diving:false,under:0,dive:0,room:0,diveFor:0,tilt:0,
  /** The dive the drawn seabed allows here and just ahead (diveBedRoom; 9 = unbounded). */
  bedRoom:9,
  /** Where the ball waits on the sand (decision 3): the last dry spot and a facing whose 0.56 m lead stays on land. */
  park:null as {x:number;z:number;y:number;yaw:number}|null,
  /** Time in the current phase, in the water altogether, in this swim; the surfacing head-shake and the belly-flop shake left (s). */
  age:0,wet:0,swimFor:0,bob:0,shake:0,dazed:0,tintLeft:0,
  /** The camera's eased dip offset (m, ≤ 0) and the dip's current depth (m, ≥ 0). */
  camDip:0,dip:0};
 const events:WaterEvents={entered:false,left:false,swimStarted:false,ripple:0,splash:0,surfaced:false,tint:false,swimSeconds:0,dived:false,sped:false,rose:false,bubble:false,stroke:0,wake:false,flew:false};
 const pose:SwimRigPose={w:0,kind:'tread',phase:0,effort:0,fast:0,entry:'feet',shake:0,under:0,tilt:0};
 const lastLand={x:NaN,z:NaN,y:0,yaw:0};
 let rippleClock=0,wakeClock=0,bubbleClock=0,strokeIndex=0,splashPower=0,pendDive=false,pendSped=false,pendSplash=0,pendTint=false,pendFly=false,diveRate=1/DIVE.ease,riseShake=0,lastX=NaN,lastZ=NaN;
 /** diveBedRoom at (x, z) and DIVE.ahead m along the travel (the slope ahead), the lower; 9 without a seabed. */
 let bedHere=9;const bedRoomAt=(x:number,z:number)=>{if(!seabed)return bedHere=9;let b=seabed(x,z);bedHere=Math.min(9,diveBedRoom(b));const mx=x-lastX,mz=z-lastZ,m=Math.hypot(mx,mz);
  if(m>1e-4&&m<2){const k=DIVE.ahead/m;b=Math.min(b,seabed(x+mx*k,z+mz*k));}return Math.min(9,diveBedRoom(b));};
 const clear=()=>{events.entered=events.left=events.swimStarted=events.surfaced=events.tint=events.dived=events.sped=events.rose=events.bubble=events.wake=events.flew=false;events.ripple=events.splash=events.swimSeconds=events.stroke=0;};
 /** Drop the dive at once (leaving the swim: the wade blend, a splash-down, the jetpack); `rose` when the body was under. */
 const endDive=()=>{if(state.under>0)events.rose=true;state.diving=false;state.under=0;state.dive=0;state.diveFor=0;state.tilt=0;riseShake=0;bubbleClock=0;pose.under=0;pose.tilt=0;};
 const leaveWater=()=>{if(state.phase==='swim'||state.phase==='surface'||state.phase==='under'){events.swimSeconds=state.swimFor;}
  state.phase='land';state.zone='none';state.depth=0;state.fast=false;endDive();state.park=null;state.swimFor=0;state.wet=0;state.bob=0;state.dip=0;state.tintLeft=0;pose.w=0;events.left=true;};
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
  if(pendDive){events.dived=true;pendDive=false;}if(pendSped){events.sped=true;pendSped=false;}
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
  if(zone==='swim')startSwim();else if(state.phase==='swim'){events.swimSeconds=state.swimFor;state.phase='wade';state.age=0;state.fast=false;endDive();state.bob=0;state.swimFor=0;pose.w=0;}
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
  // Dive: the clock and the auto-surface (time, a shore), the eased progress, the seabed / shelf bound, the pitch.
  state.bedRoom=bedRoomAt(x,z);lastX=x;lastZ=z;
  if(state.diving){state.diveFor+=dt;if(state.diveFor>=DIVE.maxTime||state.depth<DIVE.minWater-.05||state.bedRoom<DIVE.minRoom){state.diving=false;diveRate=1/DIVE.ease;}}
  const goal=state.diving?1:0,was=state.under;
  if(was!==goal){state.under=goal>was?Math.min(1,was+dt*diveRate):Math.max(0,was-dt*diveRate);
   if(was>0&&state.under===0){events.rose=true;events.ripple=.3;riseShake=SURFACE_TIME;state.diveFor=0;bubbleClock=0;}}
  // The bound eases (deeper slowly, shallower fast) and never passes the drawn seabed: the body glides up the slope to a shore.
  const roomTo=Math.min(diveRoom(probe.d)*diveShore(state.depth),state.bedRoom);state.room+=(roomTo-state.room)*(1-Math.exp(-dt*(roomTo<state.room?6:4)));
  if(state.room>bedHere)state.room=bedHere;
  const u=state.under,ue=u*u*(3-2*u);state.dive=state.room*ue;
  state.tilt=r||u===goal?0:(goal>u?1:-.8)*DIVE.tilt*Math.sin(Math.PI*u);
  if(riseShake>0)riseShake=Math.max(0,riseShake-dt);
  if(state.bob>0)state.bob=Math.max(0,state.bob-dt);
  state.rootY+=(SWIM_ROOT_Y-state.dive-state.rootY)*k;if(state.rootY<SWIM_ROOT_Y-bedHere)state.rootY=SWIM_ROOT_Y-bedHere;
  const moving=input.moving||input.stick>.05;
  pose.w=1;pose.kind=u>0||moving?'crawl':'tread';pose.entry=state.entry;pose.shake=r?0:riseShake/SURFACE_TIME;
  pose.under=ue;pose.tilt=state.tilt;
  pose.effort=u>0?Math.max(.4,Math.min(1,input.speed/SWIM_SPEED)):Math.min(1,input.speed/SWIM_SPEED);pose.fast=state.fast&&moving?1:0;
  const rate=r?0:pose.kind==='tread'?2.2:pose.fast?9:5.5*(.5+.5*pose.effort)*(u>0?.7:1);
  pose.phase=(pose.phase+dt*rate)%(Math.PI*2*6);
  if(u>.3){
   // Under: no wake or arm splashes at the surface, only a small bubble ring over the diver now and then (≤ 1 / DIVE.bubble s).
   wakeClock=0;rippleClock=0;bubbleClock+=dt;if(bubbleClock>=DIVE.bubble){bubbleClock=0;events.bubble=true;}
  }else if(pose.kind==='crawl'){
   // The wake: a bow ripple + the V pair behind every WAKE_STEP (events.wake), and an arm splash as each arm enters (every π of
   // the stroke clock; none with reduced motion, where the clock stands still).
   wakeClock+=dt;if(wakeClock>=(pose.fast?WAKE_STEP_FAST:WAKE_STEP)){wakeClock=0;events.wake=true;}
   const idx=Math.floor(pose.phase/Math.PI);if(idx!==strokeIndex){strokeIndex=idx;events.stroke=idx%2?1:-1;}
  }else{
   wakeClock=0;rippleClock+=dt;if(rippleClock>=RIPPLE.tread){rippleClock=0;events.ripple=.15;}
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
  state.phase='under';state.age=0;state.zone='swim';state.fast=false;endDive();events.rose=false;state.swimFor=0;
  state.dip=0;state.rootY=SWIM_ROOT_Y;state.camDip=0;state.tintLeft=r?0:UNDER_TINT_MS/1000;
  state.shake=state.entry==='belly'&&!r?BELLY_SHAKE_TIME:0;state.dazed=state.entry==='belly'?BELLY_DAZED:0;
  // Raised on the next step (the host calls splashDown mid-tick, before its water step): the ring, the sound, the tint.
  pendSplash=splashPower;pendTint=!r;
 }
 /** Swim fast (hold: `down` / `up`) and Dive (a tap: under, and again: back up). Dive is greyed in the shallows (canDive). */
 function press(id:'swimfast'|'dive',phase:'tap'|'down'|'up'){
  if(state.phase==='land')return false;
  if(id==='swimfast'){const on=phase==='down';if(on&&!state.fast&&state.phase==='swim')pendSped=true;state.fast=on&&state.phase==='swim';return true;}
  if(id==='dive'){
   if(phase==='up')return false;
   if(state.diving)return surfaceDive();
   if(!canDive())return false;
   state.diving=true;state.diveFor=0;diveRate=1/DIVE.ease;state.fast=false;if(state.under===0)state.room=Math.min(diveRoom(probe.d)*diveShore(state.depth),state.bedRoom);pendDive=true;return true;}
  return false;
 }
 /** Dive is live: swimming in at least DIVE.minWater of shelf water, over a drawn seabed with DIVE.minRoom of room. */
 function canDive(){return state.phase==='swim'&&state.depth>=DIVE.minWater&&state.bedRoom>=DIVE.minRoom;}
 /** Ease back up (Surface, a ride grab: `quick` for the jetpack). False when already at the surface. */
 function surfaceDive(quick=false){if(!state.diving&&state.under===0)return false;state.diving=false;diveRate=1/(quick?DIVE.quick:DIVE.ease);return true;}
 /** Fly up: the jetpack takes off straight out of the water (the host checks fuel, switches the ride and splashes). Raised on the
  *  next step as `flew`, like the presses; false when not in the water. */
 function takeOff(){if(state.phase==='land')return false;pendFly=true;return true;}
 return {state,events,pose,step,splashDown,press,takeOff,canDive,surfaceDive,
  get inWater(){return state.phase!=='land';},
  get swimming(){return state.phase==='swim'||state.phase==='under'||state.phase==='surface';},
  /** Swimming (at the surface or settled under, not mid-dive): the 20 fps idle rule may apply once the stick has been still for 4 s
   *  (lib/town/idleRide.ts: it waits for no input and no travel on its own). */
  resting(){return state.phase==='swim'&&(state.under===0||state.under===1&&state.diving);},
  /** Under the surface or on the way (the HUD's Surface button, the camera, the bubbles). */
  get diveActive(){return state.diving||state.under>0;},
  /** Walking speed scale while wading (1 when not). */
  get speedScale(){return state.phase==='wade'?wadeSpeedScale(state.zone):1;},
  reset(){pendFly=pendDive=pendSped=false;pendSplash=0;endDive();state.room=0;state.phase='land';state.zone='none';state.depth=0;state.fast=false;state.park=null;state.swimFor=0;state.wet=0;state.bob=0;state.dip=0;state.camDip=0;state.shake=0;state.dazed=0;state.tintLeft=0;pose.w=0;probe.reset();},
 };
}
/** Which analytics bucket a swim's seconds fall in: 'time_10s' | 'time_30s' | 'time_60s' | 'time_120s' | 'time_long'. */
export function swimTimeBucket(seconds:number){
 for(const b of SWIM_TIME_BUCKETS)if(seconds<b)return `time_${b}s`;
 return 'time_long';
}
