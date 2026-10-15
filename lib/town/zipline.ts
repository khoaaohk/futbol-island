/**
 * The Summit Isle → Coral Cay zipline (Oct 14 2026; user: "move the telescope here and in its place add a zipline that goes all
 * the way to coral island. make the zipline interactive. so that while sliding down there is animations, that you're zipping
 * down", then: "have the zipline go all the way to the top of Cay guesthouse").
 *
 * Pure rules, no three.js and no DOM (tests/zipline.cjs). Static props: ./ziplineWorld.ts; runtime (prompt, ride, camera,
 * effects): ../graphics/zipline.ts; HUD: components/ZiplineHud.tsx; map line: components/ZiplineMapMark.tsx.
 *
 *  - The start tower stands where the lookout telescope stood (the lookout + ZIP_TOWER_OFFSET), on the summit's north-west
 *    shoulder: a timber platform with a step up on its uphill (east) side, a gantry holding the cable, a sign.
 *  - The cable runs one span (no poles: nothing stands in the sea, the whale shark's or the mantas' water) north over the beach,
 *    the sandbar channel and the cove to a deck on the CORAL CAY HOSTEL's roof, and sags as a parabola (ZIP_SAG). It is steep
 *    off the tower (the rider drops away and speeds up) and flattens toward the roof (the rider eases in).
 *  - The rider hangs ZIP_HANG below the trolley (hands up on the handle); the ride takes ZIP_RIDE.seconds whatever the frame rate:
 *    clip on (walk onto the launch spot, grab the handle), the ride (a fixed speed profile: quick acceleration, a long ease-out
 *    into the brake), the landing (feet on the deck, let go).
 *  - On the roof: the landing deck (one step up from the roof), and an outside stair down the hostel's east wall to the path by
 *    the verandah. The roof is an ordinary walkable roof, so the jetpack and parachute work from it as from any other.
 *  - Free: it is gravity (no fuel). One-way: Summit Isle → Coral Cay.
 */
import {SUMMIT_LANDMARKS,summitGround} from './summitIsle';
import {HOSTEL} from './coralCay';
import {STICK_WALK_FLOOR} from './walkControl';

export type ZipPoint={x:number;y:number;z:number};
type Box={x:number;z:number;w:number;d:number};
export const ZIP_NAME='Zipline to Coral Cay';

// ---- The start tower -------------------------------------------------------------------------------------------------------
/** Where the tower stands: the telescope's old stand on the lookout's north-west shoulder (the telescope moved down the slope). */
export const ZIP_TOWER_OFFSET={dx:-9.2,dz:-1.75} as const;
/** The tower platform: a square this wide, its deck this far above the highest ground under it (a launch with some drop: the
 *  rider swings off well clear of the grass). */
export const ZIP_PLATFORM={size:2.8,lift:1.2} as const;
/** Rise of a stair tread (the walk solver steps ≤ 0.35 m). */
export const ZIP_TREAD_RISE=.3;
const L0=SUMMIT_LANDMARKS.lookout;
export const ZIP_TOWER=(()=>{
 const x=L0.x+ZIP_TOWER_OFFSET.dx,z=L0.z+ZIP_TOWER_OFFSET.dz,h=ZIP_PLATFORM.size/2;let top=-Infinity,low=Infinity;
 for(const a of [-1,-.5,0,.5,1])for(const b of [-1,-.5,0,.5,1]){const g=summitGround(x+a*h,z+b*h);top=Math.max(top,g);low=Math.min(low,g);}
 const deck=top+ZIP_PLATFORM.lift;
 // Steps on the uphill (east) side: treads .45 m deep stepping down ZIP_TREAD_RISE until they meet the ground.
 const steps:(Box&{height:number})[]=[];
 for(let k=0;k<6;k++){const tx=x+h+.45*(k+.5),height=deck-ZIP_TREAD_RISE*(k+1),under=Math.max(...[-1,0,1].map(b=>summitGround(tx,z+b*h)));
  if(k>0&&height<=under+.05)break;steps.push({x:tx,z,w:.45,d:ZIP_PLATFORM.size,height});}
 return {x,z,ground:summitGround(x,z),low,deck,steps,box:{x,z,w:ZIP_PLATFORM.size,d:ZIP_PLATFORM.size}};
})();

// ---- The roof landing ---------------------------------------------------------------------------------------------------------
/** The hostel's roof (world.ts building(): the walkable height is the walls plus the roof slab). */
export const HOSTEL_ROOF=HOSTEL.h+.23;
/** The landing deck on the roof's east half, clear of the roof tank (x ≤ 560.6) and the stepped roof room (x ≤ 556.3): one step up. */
export const ZIP_DECK={x:562.7,z:-122.3,w:3.4,d:5.4,height:HOSTEL_ROOF+ZIP_TREAD_RISE} as const;
/** Where the rider stops and lets go (the deck's middle, a little south of the anchor mast). */
export const ZIP_LAND={x:562.7,z:-121.6} as const;
/** The outside stair down the hostel's east wall: a top landing at roof height overlapping the roof's edge, then treads down
 *  south to the path along the verandah. `rail` is its outer handrail line (x), just inside the kit washing line's post (x 567). */
export const ZIP_STAIR=(()=>{
 const wall=HOSTEL.x+HOSTEL.w/2,x0=wall-.6,x1=wall+1.6,landing={x:(x0+x1)/2,z:-124.5,w:x1-x0,d:1.8,height:HOSTEL_ROOF};
 const top=landing.z+landing.d/2,n=Math.ceil(HOSTEL_ROOF/ZIP_TREAD_RISE),run=.38,rise=HOSTEL_ROOF/n;
 const treads:(Box&{height:number})[]=[];
 // Tread i (1 … n-1) at height roof − i·rise; the last one is a single rise above the path.
 for(let i=1;i<n;i++)treads.push({x:wall+.8,z:top+(i-.5)*run,w:1.6,d:run,height:HOSTEL_ROOF-i*rise});
 return {wall,x0,x1,landing,treads,rise,run,bottom:{x:wall+.8,z:top+(n-1)*run+.6},rail:x1+.06,north:landing.z-landing.d/2};
})();

// ---- The cable -------------------------------------------------------------------------------------------------------------------
/** The rider's feet hang this far below the cable (the trolley, a strap and the handle; hands up). */
export const ZIP_HANG=2.2;
/** The cable's sag (m) below the straight line between the launch and the landing, at mid-span. */
export const ZIP_SAG=5.5;
/** Horizontal direction of travel (unit), launch → landing. */
const LAUNCH_BACK=.9;
const dir0=(()=>{const dx=ZIP_LAND.x-ZIP_TOWER.x,dz=ZIP_LAND.z-ZIP_TOWER.z,l=Math.hypot(dx,dz);return {x:dx/l,z:dz/l};})();
/** Where the rider clips on (their feet on the tower deck, near its north edge, under the cable). */
export const ZIP_LAUNCH={x:ZIP_TOWER.x+dir0.x*LAUNCH_BACK,z:ZIP_TOWER.z+dir0.z*LAUNCH_BACK,y:ZIP_TOWER.deck};
export const ZIP_DIR=(()=>{const dx=ZIP_LAND.x-ZIP_LAUNCH.x,dz=ZIP_LAND.z-ZIP_LAUNCH.z,l=Math.hypot(dx,dz);return {x:dx/l,z:dz/l,yaw:Math.atan2(dx,dz)};})();
/** The ridden span (horizontal metres, launch → landing). */
export const ZIP_SPAN=Math.hypot(ZIP_LAND.x-ZIP_LAUNCH.x,ZIP_LAND.z-ZIP_LAUNCH.z);
const Y0=ZIP_TOWER.deck+ZIP_HANG,Y1=ZIP_DECK.height+ZIP_HANG;
/** The cable at fraction t of the ridden span (t < 0: behind the launch, to the tower's gantry; t > 1: on to the roof mast). */
export function cableAt(t:number):ZipPoint{
 return {x:ZIP_LAUNCH.x+(ZIP_LAND.x-ZIP_LAUNCH.x)*t,y:Y0+(Y1-Y0)*t-4*ZIP_SAG*t*(1-t),z:ZIP_LAUNCH.z+(ZIP_LAND.z-ZIP_LAUNCH.z)*t};
}
/** dy/ds of the cable (per horizontal metre) at fraction t. */
export const cableGrade=(t:number)=>((Y1-Y0)-4*ZIP_SAG*(1-2*t))/ZIP_SPAN;
/** The anchors: the gantry beam on the tower (just behind the launch) and the mast on the roof deck (past the landing). */
export const ZIP_ANCHOR_TOWER=cableAt(-.7/ZIP_SPAN),ZIP_ANCHOR_ROOF=cableAt(1+1.5/ZIP_SPAN);
/** The cable's full length (anchor to anchor) and its fractions at the anchors. */
export const ZIP_T0=-.7/ZIP_SPAN,ZIP_T1=1+1.5/ZIP_SPAN;

// ---- The ride ----------------------------------------------------------------------------------------------------------------
/** Timings (s): walk onto the launch spot and grab the handle, the ride, feet down and let go. Prompt reach (m from the tower's
 *  platform and step) on foot / riding. */
export const ZIP_RIDE={clip:.8,seconds:13.5,land:.6,reach:2.4,reachRide:3.4} as const;
/** Speed profile: v(τ) ∝ sin(π·w(τ)) with w = 1 − (1 − τ)^K: a firm push off the tower (a finite ~0.9 g, so the swing kicks back
 *  without a jolt), the top speed at τ ≈ 0.4, then a long, gentle ease-out into the brake (w′(1) = 0). */
const K=1.35,N=4096;
const W=(u:number)=>1-Math.pow(1-Math.max(0,Math.min(1,u)),K),VS=(u:number)=>Math.sin(Math.PI*W(u));
const PROFILE=(()=>{const s=new Float64Array(N+1);let acc=0;
 for(let i=1;i<=N;i++){const a=(i-1)/N,b=i/N;acc+=(VS(a)+4*VS((a+b)/2)+VS(b))/6/N;s[i]=acc;}for(let i=0;i<=N;i++)s[i]/=acc;return {s,norm:acc};})();
/** Fraction of the span covered after fraction τ of the ride time (0 → 0, 1 → 1, monotonic, eased at both ends). */
export function rideProgress(tau:number){if(tau<=0)return 0;if(tau>=1)return 1;const f=tau*N,i=Math.floor(f),k=f-i;return PROFILE.s[i]+(PROFILE.s[Math.min(N,i+1)]-PROFILE.s[i])*k;}
/** Along-cable speed (m/s, horizontal) at fraction τ. */
export function rideSpeed(tau:number){return VS(tau)/PROFILE.norm*ZIP_SPAN/ZIP_RIDE.seconds;}
/** Peak speed (m/s). */
export const ZIP_TOP_SPEED=(()=>{let m=0;for(let i=0;i<=200;i++)m=Math.max(m,rideSpeed(i/200));return m;})();

/** cableAt without an allocation (the ride's 60 Hz tick). */
export function cableInto(t:number,out:ZipPoint):ZipPoint{
 out.x=ZIP_LAUNCH.x+(ZIP_LAND.x-ZIP_LAUNCH.x)*t;out.y=Y0+(Y1-Y0)*t-4*ZIP_SAG*t*(1-t);out.z=ZIP_LAUNCH.z+(ZIP_LAND.z-ZIP_LAUNCH.z)*t;return out;
}
/** The trolley (on the cable) and the rider's feet at ride time `t` (s, 0 … ZIP_RIDE.seconds). */
export function ridePoint(t:number){
 const tau=t/ZIP_RIDE.seconds,f=rideProgress(tau),c=cableAt(f);
 return {f,trolley:c,feet:{x:c.x,y:c.y-ZIP_HANG,z:c.z},speed:rideSpeed(tau),grade:cableGrade(f)};
}

/** The tower prompt: within reach of the tower (its platform and step: at the foot of the step, on it or on the deck), on foot or
 *  (a little further) on a ground ride. Returns the distance to the tower's footprint, or null. */
export function towerReach(x:number,z:number,onFoot:boolean){
 const T=ZIP_TOWER,h=ZIP_PLATFORM.size/2,east=T.x+h+T.steps.length*.45;
 const dx=Math.max(T.x-h-x,0,x-east),dz=Math.max(T.z-h-z,0,z-(T.z+h)),d=Math.hypot(dx,dz);
 return d<=(onFoot?ZIP_RIDE.reach:ZIP_RIDE.reachRide)?d:null;
}
/** A cheap box test first (the prompt runs every HUD frame): within 12 m of the tower. */
export const nearTower=(x:number,z:number)=>Math.abs(x-ZIP_TOWER.x)<12&&Math.abs(z-ZIP_TOWER.z)<12;

/** Clearance samples along the ridden span: the cable, the rider's feet (with the swing allowance) at n+1 points. */
export function cableSamples(n=240){const out:{t:number;x:number;z:number;cable:number;feet:number}[]=[];
 for(let i=0;i<=n;i++){const t=i/n,c=cableAt(t);out.push({t,x:c.x,z:c.z,cable:c.y,feet:c.y-ZIP_HANG-.3});}return out;}

/** Map line (world x/z, drawn on the island maps): the tower to the roof. */
export const ZIP_MAP={from:{x:ZIP_TOWER.x,z:ZIP_TOWER.z},to:{x:ZIP_DECK.x,z:ZIP_DECK.z}} as const;

// ---- The grip and the rider's actions (Oct 14 2026, user after riding it: "the arms are not on the handle", "the body needs to
// animate with the movements more", "when ziplining, remove the actions and change those to three different actions that are more
// related to the zipline"). ------------------------------------------------------------------------------------------------------
/** The handle bar in the rider's own (rig-local, unscaled) frame: both hands close round it here every frame (player.ts solves the
 *  arms to it; lib/graphics/zipline.ts places the body so this point IS the bar). `half` is each hand's distance from the middle;
 *  `pull` how far the body pulls up toward the bar in a tuck; the bar is `length` long. */
export const ZIP_GRIP={y:1.8,z:.05,half:.2,pull:.14,length:.62,radius:.026} as const;
/** The trolley body's underside (below the cable) and the strap from it to the bar: the feet still hang ZIP_HANG under the cable. */
export const ZIP_TROLLEY_DROP=.23;
export const ZIP_STRAP=ZIP_HANG-ZIP_TROLLEY_DROP-ZIP_GRIP.y;
/** The rider's pose for player.ts (rig-local radians and metres; written in place by the runtime every frame, never allocated).
 *  `w` fades the whole pose (1 = hanging; it falls to 0 as the rider lets go on the deck). One hand can let go (`free`: −1 left,
 *  +1 right) for a wave, blended by `wave` with its rhythm in `wavePhase`. */
export type ZipRigPose={w:number;barY:number;barZ:number;half:number;free:-1|1;wave:number;wavePhase:number;
 py:number;pz:number;pike:number;tx:number;ty:number;tz:number;hx:number;hy:number;spread:number;
 hipL:number;hipR:number;kneeL:number;kneeR:number;ankleL:number;ankleR:number};
/** The three ride actions (they take the Kick / Juggle / Ride slots of the HUD action cluster while riding; Space / Q / E, or 1 / 2 / 3):
 *  Tuck (hold: knees up, a little faster, within the safe top speed and only before the brake), Spin (a 360° turn on the swivel)
 *  and Wave (one hand lets go and waves; the other never leaves the bar). Pure fun: no score, and none of them can stop the ride,
 *  slow it, or change the landing. */
export type ZipActionId='tuck'|'spin'|'wave';
export const ZIP_BUTTONS=[
 {slot:'shoot',key:'Space',id:'tuck',label:'Hold to tuck and go faster',icon:'ziptuck',hold:true,enabled:true},
 {slot:'juggle',key:'Q',id:'spin',label:'Spin on the handle',icon:'zipspin',enabled:true},
 {slot:'ride',key:'E',id:'wave',label:'Wave with one hand',icon:'zipwave',enabled:true},
] as const;
/** Keyboard: Space or 1 = tuck (hold), Q or 2 = spin, E or 3 = wave. */
export function zipKeyAction(code:string,key:string):ZipActionId|null{
 if(code==='Space'||code==='Digit1'||code==='Numpad1')return 'tuck';
 const k=key.toLowerCase();if(k==='q'||code==='Digit2'||code==='Numpad2')return 'spin';if(k==='e'||code==='Digit3'||code==='Numpad3')return 'wave';return null;
}
/** Tuck: up to `boost` faster (eased in and out at `ease`/s), never above `maxSpeed` m/s, only before `until` of the ride time (the
 *  brake into the roof is never touched). Spin: one turn in `seconds` (`reduced` with reduced motion), none in the last `lastGap` s.
 *  Wave: `seconds` long, none in the last `lastGap` s; it is always finished (the hand back on the bar) before the landing. */
export const ZIP_TUCK={boost:.14,maxSpeed:30,until:.6,ease:2.5} as const;
export const ZIP_SPIN={seconds:1.15,reduced:1.9,lastGap:.6} as const;
export const ZIP_WAVE={seconds:2.2,lastGap:1.3} as const;
/** The tuck's time-rate target at ride fraction τ (base speed v): 1 + boost, capped so v·rate ≤ maxSpeed; 1 from `until` on. */
export function tuckRate(tau:number,v:number,held:boolean){
 if(!held||tau>=ZIP_TUCK.until)return 1;return Math.max(1,Math.min(1+ZIP_TUCK.boost,ZIP_TUCK.maxSpeed/Math.max(1,v)));
}

// ---- Smooth drawing and looking around (Oct 15 2026, user on an iPhone: "when using the zipline, it can still be a little jittery.
// also when moving around while on the zipline should be smoother"). -------------------------------------------------------------
/**
 * The drawn ride's clock. The ride camera is locked to the trolley, so at 25 m/s the whole island streams past and any error in
 * WHEN a frame is drawn shows as the whole screen juddering. A phone at the 30 fps cap shows its frames on the display's refresh
 * (iOS Safari runs rAF at 60 Hz, ProMotion included): 33.3 ms apart, 50 after a missed refresh, the 24 fps tier alternating the
 * two. Town measures dt from the rAF timestamps, which wobble by a few ms (Safari stamps the start of its rendering update, after
 * whatever main-thread work came first), and draws the 60 Hz ticks at exactly that wobbling instant: ±3 ms of timestamp noise was
 * ±8–14 m/s of camera velocity change from frame to frame (tests/zipline.cjs "jitter").
 * At capped rates (the recent median frame ≥ `capped` s) the clock steps by whole refreshes (`vsync`) to the refresh nearest
 * Town's instant (a missed refresh is real: drawn at once); the rest, under half a refresh, is timestamp noise and only pulls the
 * clock's phase (≤ `noise`: `minGain` a frame, ≥ `follow`: `maxGain`). Timestamp noise is white (no lag-1 correlation of that
 * rest); a frame clock that really is uneven (a variable-refresh display, a browser whose timestamps are exact) drifts, its rest
 * strongly correlated: then the clock hands over to Town's instant (`steady` → 0). A jump over `snap` (a stall, a new ride, a
 * test) snaps. Faster displays (desktop 60–144 Hz,
 * whose timestamps are the refresh's own) are drawn at Town's instant exactly. Pure.
 */
export const ZIP_CLOCK={vsync:1/60,capped:.025,noise:.003,follow:.008,minGain:.08,maxGain:.4,snap:.05,window:5,corr:.08,blendRate:.04} as const;
export type RideClock={reset():void;step(target:number):number;readonly time:number;readonly period:number;readonly steady:number};
export function createRideClock():RideClock{
 const W=ZIP_CLOCK.window,ds=new Float64Array(W),tmp=new Float64Array(W);
 let r=NaN,g=NaN,last=NaN,n=0,k=0,period=1/60,prevRest=0,c=0,v=0,w=1;
 /** How much of the frame-to-frame wobble is timestamp noise on a steady refresh grid (1) rather than a genuinely uneven frame
  *  clock (0): white noise around the grid has no lag-1 correlation, a drifting clock's offset is strongly correlated. */
 const steadiness=()=>{const rho=v>1e-12?c/v:0;const u=Math.max(0,Math.min(1,(rho-.3)/.35));return 1-u*u*(3-2*u);};
 return {
  reset(){r=g=last=NaN;n=0;k=0;period=1/60;prevRest=c=v=0;w=1;},
  get time(){return r;},get period(){return period;},get steady(){return w;},
  /** `target` = the instant Town's tick blend would draw (s). The same target twice is the same frame (the same instant back). */
  step(target:number){
   if(!Number.isFinite(r)||!(target>=last-1e-9)){r=g=last=target;n=0;k=0;prevRest=c=v=0;w=1;return r;}
   const d=target-last;if(d<=1e-9)return r;last=target;
   ds[k]=d;k=(k+1)%W;if(n<W)n++;
   for(let i=0;i<n;i++){const x=ds[i];let j=i-1;while(j>=0&&tmp[j]>x){tmp[j+1]=tmp[j];j--;}tmp[j+1]=x;}
   period=tmp[n>>1];
   if(n<3||period<ZIP_CLOCK.capped||Math.abs(target-g)>ZIP_CLOCK.snap+ZIP_CLOCK.vsync){r=g=target;prevRest=0;return r;}
   // The grid clock moves in whole refreshes, to the refresh (on its own phase) nearest Town's instant; the rest, under half a
   // refresh, is timestamp noise and only pulls the phase gently (a real change of phase is followed within a few frames).
   const q=ZIP_CLOCK.vsync;g+=Math.max(d>q*.5?1:0,Math.round((target-g)/q))*q;
   const rest=target-g,a=Math.abs(rest),u=Math.max(0,Math.min(1,(a-ZIP_CLOCK.noise)/(ZIP_CLOCK.follow-ZIP_CLOCK.noise)));
   g+=rest*(ZIP_CLOCK.minGain+(ZIP_CLOCK.maxGain-ZIP_CLOCK.minGain)*u*u*(3-2*u));
   c+=(rest*prevRest-c)*ZIP_CLOCK.corr;v+=(rest*rest-v)*ZIP_CLOCK.corr;prevRest=rest;
   // Drawn: the grid clock while the wobble looks like timestamp noise, Town's instant itself when the frames really are uneven;
   // the hand-over moves `blendRate` a frame (never a jump of the drawn instant).
   w+=Math.max(-ZIP_CLOCK.blendRate,Math.min(ZIP_CLOCK.blendRate,steadiness()-w));
   r=target+(g-target)*w;
   return r;
  },
 };
}
/**
 * Looking around while riding: the stick (or A/D, ←/→) and a drag on the scene turn the ride camera round the trolley (and the
 * rider's head). The look is a critically damped spring (velocity continuous: no jolt as a thumb lands or lifts), solved exactly
 * per frame (the same motion at 20 or 120 fps). Its aim goes through a soft limit (tanh: it slows into the edge, never clamps).
 *  - stick: `stick` × the deflection (the walk floor taken back out, so it starts from zero at the dead zone); released → back.
 *  - drag: `drag` of aim across `dragSpan` of the screen width (≤ `dragWidth` px: a 390 px phone swipes ~270 px, a mouse ~630 px),
 *    the spring following the finger at `dragRate`; let go and a fling carries on (`friction`), holds a moment (`hold`) and eases
 *    back (`back`/s).
 *  - rates (ω, 1/s): `stickRate` toward a held aim, `dragRate` after a finger, `returnRate` back to the default view; the aim itself
 *    eases in first (`ease`, `dragEase` /s) so the turn starts without a kick (its acceleration grows from zero too).
 */
export const ZIP_LOOK={limit:1.2,stick:1.6,drag:1.6,dragSpan:.7,dragWidth:900,maxAim:2.6,maxFling:5,friction:6,hold:.45,back:2.6,
 ease:10,dragEase:30,stickRate:6,dragRate:16,returnRate:3.6,reducedRate:.6,head:.7} as const;
/** The soft edge: aim (rad) → look (rad), slope 1 at the centre, approaching ±limit. */
export const softLook=(aim:number)=>ZIP_LOOK.limit*Math.tanh(aim/ZIP_LOOK.limit);
/** The stick's sideways look (−1 … 1) from Town's shaped stick (shapeStick: dead zone, then a 0.36 walk floor): the floor taken
 *  back out, so the look grows from zero as the thumb leaves the dead zone instead of jumping to a third of the way. */
export function stickLook(x:number,z:number){const m=Math.hypot(x,z);if(m<1e-6)return 0;
 const u=Math.max(0,Math.min(1,(Math.min(1,m)-STICK_WALK_FLOOR)/(1-STICK_WALK_FLOOR)));return x/m*u;}
/** One exact step of a critically damped spring toward `want` (constant over the step): {x, v} changed in place. */
export function springTo(s:{x:number;v:number},want:number,omega:number,h:number){
 if(!(h>0))return s;const x=s.x-want,e=Math.exp(-omega*h),c=s.v+omega*x;
 s.x=want+(x+c*h)*e;s.v=(s.v-omega*c*h)*e;return s;
}

// ---- The HUD bridge (components/ZiplineHud.tsx): written only when something shown changes, never per frame. ----------------
export type ZipView={
 /** A short note ("Hold on tight!", "Welcome to Coral Cay!"), its counter (a new note restarts the CSS fade) and whether riding. */
 note:string;notes:number;riding:boolean;
};
const IDLE_VIEW:ZipView={note:'',notes:0,riding:false};
let zipView=IDLE_VIEW;const zipListeners=new Set<()=>void>();
export const zipStore={
 get:()=>zipView,server:()=>IDLE_VIEW,
 set(patch:Partial<ZipView>){let changed=false;for(const k in patch)if(!Object.is((zipView as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;zipView={...zipView,...patch};zipListeners.forEach(fn=>fn());},
 reset(){if(zipView===IDLE_VIEW)return;zipView=IDLE_VIEW;zipListeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){zipListeners.add(fn);return()=>{zipListeners.delete(fn);};},
};
/** The prompt's tap and the ride's three actions; the runtime installs the real ones while the island is up. */
export const zipActions={ride:()=>{},press:(_id:ZipActionId,_phase:'tap'|'down'|'up')=>{}};
export const ZIP_NOTES={
 start:'Hold on tight! Zipping to Coral Cay. Tuck, spin or wave; drag or use the stick to look around.',
 land:'Welcome to the Coral Cay Hostel roof! The stairs down are on the east side.',
} as const;
