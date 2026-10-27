/**
 * Natural swimming (Oct 27 2026; docs/SWIM_NATURAL_OCT27.md). Owner: "Improve the swimming mechanics to be more natural ... while
 * swimming under water normally and also while in the reef."
 *
 * The shared, pure motion maths for the three swims: (a) at the surface (waterDepth.ts swimStep, waterState.ts), (b) the open-water
 * duck-dive (waterState.ts) and (c) the reef room (diveSession.ts, diveRoom.ts's camera). Water has momentum: the swimmer's HEADING
 * turns at a limited rate (a turn is an arc, never a snap round), speed eases up with drag and sheds a little in a hard turn, each arm
 * pull gives a small surge, the body banks into the turn, pitch changes are rate-limited, buoyancy eases you up (fast when deep, slow
 * as the head nears the surface), solids are slid along with a little friction, and the camera's FOV eases on a burst.
 *
 * Pure: no three.js, no DOM, no timers; nothing here allocates (helpers that return two numbers write into the caller's object).
 * Tests: tests/swim-natural-oct27.cjs.
 */

/** Tuning (all SI: m, s, rad). See docs/SWIM_NATURAL_OCT27.md for what each one feels like. */
export const SWIM_MOTION={
 /** Surface / open-water heading: the most it turns (rad/s) when slow → at top speed, how quickly it eases onto the stick's heading
  *  (per s), how much speed a hard turn sheds (×, at a 90° and wider difference), and under this speed (m/s) the heading simply
  *  follows the stick (a start from still water pushes off in the stick's direction at once). */
 turn:{slow:4.2,fast:2.4,ease:9,shed:.35,still:.6},
 /** The stroke surge: each arm's pull adds up to `amp` × the speed (the mean over a stroke is 1: no faster on average). */
 surge:{amp:.08},
 /** The stroke clock (rad/s of the pose phase): treading, the slowest crawl (a light stick) → the full stick, Swim fast; under water
  *  × `under` (a slower, longer kick). */
 stroke:{tread:2.2,min:3.4,max:6.2,fast:9,under:.72},
 /** The gentle bob at the surface (m): `amp` at rest over `period` s, × (1 − `move`) at full speed, plus a small heave with each stroke. */
 bob:{amp:.035,period:2.6,move:.55,heave:.012},
 /** Under the water (the open-water duck-dive) the drag of a let-go stick is × `glide` (a kick carries further). */
 drag:{glide:.55},
 /** Pitch: the most it changes (rad/s) and the ease (per s); `climb` rad of nose up per m/s of rise (a body follows its path). */
 pitch:{rate:1.6,ease:5,climb:.35,max:.5},
 /** Buoyancy on the way up from a duck-dive: the rise speed × (`top` near the surface .. `deep` from the bottom of the dive). */
 buoy:{deep:1.45,top:.55},
 /** The reef's turn: angular momentum (rad/s² ease per s) and the bank (rad at full turn rate and speed). */
 reefTurn:{ease:5.5,bank:.5},
 /** Near coral (the clearance over the reef under the diver, m: `far` → `near`): the top speed × (1 − `speed`), the turn eases
  *  `turn` × faster and the drag × (1 + `drag`): a slower, tighter, more precise swim where it matters. */
 reefNear:{far:.9,near:.3,speed:.2,turn:.6,drag:.5},
 /** The reef current's push on the diver (m/s, along diveCurrent.ts DIVE_CURRENT.dir; × the swell 0.6..1). */
 current:{push:.12},
 /** Sliding along a solid: the speed kept along it per contact (a soft scrape, never a stop). */
 contact:{keep:.9},
 /** The camera: FOV kick (degrees) at a full burst, its ease (per s) and the smallest change worth a projection update. */
 fov:{kick:3,ease:2.5,eps:.02},
} as const;

const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
/** Exponential approach factor: the share of the gap closed in dt at `rate` per s (0..1). */
export const approach=(rate:number,dt:number)=>1-Math.exp(-Math.max(0,rate)*Math.max(0,dt));
/** Wrap an angle to −π..π. */
export const wrapAngle=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
/** Smoothstep 0..1 of x between e0 and e1 (e0 > e1 works: a falling edge). */
export const smooth01=(x:number,e0:number,e1:number)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);};

/** The heading after dt: eases toward `target`, never faster than the turn rate for this speed (`ratio` = speed / top, 0..1). */
export function turnHeading(heading:number,target:number,ratio:number,dt:number){
 const T=SWIM_MOTION.turn,d=wrapAngle(target-heading),maxStep=(T.slow+(T.fast-T.slow)*clamp(ratio,0,1))*Math.max(0,dt);
 return wrapAngle(heading+clamp(d*approach(T.ease,dt),-maxStep,maxStep));
}
/** How much of the wanted speed a turn keeps (1 straight on .. 1 − shed at 90° and wider): a hard turn costs a little pace. */
export function turnKeep(delta:number){const c=Math.cos(Math.min(Math.PI/2,Math.abs(wrapAngle(delta))));return 1-SWIM_MOTION.turn.shed*(1-c);}

/**
 * One momentum step of a swimmer's velocity (in place). `ix, iz` the stick's unit direction and `want` the speed it asks for
 * (m/s, 0 = let go). Speed eases up at `accel`, down at `brake` (water drag); the heading turns at a limited rate (turnHeading), so
 * pushing the stick the other way swims an arc instead of snapping round. From (nearly) still water the push goes straight off in the
 * stick's direction. Returns the new speed.
 */
export function swimVelocity(v:{x:number;z:number},ix:number,iz:number,want:number,accel:number,brake:number,top:number,dt:number){
 const s=Math.hypot(v.x,v.z);
 if(want<=0){const k=Math.exp(-Math.max(0,brake)*Math.max(0,dt));v.x*=k;v.z*=k;return s*k;}
 const h=Math.atan2(ix,iz);
 if(s<SWIM_MOTION.turn.still){
  // Pushing off from (nearly) still: the plain eased blend toward the stick (no arc to swim).
  const k=approach(accel,dt);v.x+=(Math.sin(h)*want-v.x)*k;v.z+=(Math.cos(h)*want-v.z)*k;return Math.hypot(v.x,v.z);}
 const h0=Math.atan2(v.x,v.z),nh=turnHeading(h0,h,top>0?s/top:1,dt),goal=want*turnKeep(h-nh);
 const ns=s+(goal-s)*approach(goal>s?accel:brake,dt);
 v.x=Math.sin(nh)*ns;v.z=Math.cos(nh)*ns;return ns;
}

/** The stroke surge multiplier (mean ≈ 1 over a stroke): a pulse as each arm pulls (twice per 2π of the stroke clock), × effort. */
export function strokeSurge(phase:number,effort:number){
 // |sin|³ averages 4/(3π) ≈ 0.4244 over a cycle; centred and scaled so the pull peaks at +amp and the recovery dips a little.
 const s=Math.abs(Math.sin(phase)),p=s*s*s;return 1+SWIM_MOTION.surge.amp*clamp(effort,0,1)*(p-.4244)/.5756;
}
/** The stroke clock's rate (rad/s): faster with the stick (a light push = a slow, lazy stroke), Swim fast quickest, slower under. */
export function strokeRate(stick:number,speedRatio:number,fast:boolean,under:number,tread:boolean){
 const S=SWIM_MOTION.stroke;if(tread)return S.tread;
 const m=clamp(Math.max(stick,speedRatio),0,1),r=fast?S.fast:S.min+(S.max-S.min)*m;
 return r*(1-(1-S.under)*clamp(under,0,1));
}
/** The surface bob (m, + = up) at time t: a slow rise and fall, smaller while swimming fast, plus a small heave with each stroke. */
export function surfaceBob(t:number,speedRatio:number,phase:number){
 const B=SWIM_MOTION.bob,m=clamp(speedRatio,0,1);
 return B.amp*(1-B.move*m)*Math.sin(t*Math.PI*2/B.period)+B.heave*m*Math.cos(phase*2);
}
/** Rate-limited pitch: eases toward `target` but never faster than SWIM_MOTION.pitch.rate (rad/s). */
export function pitchToward(pitch:number,target:number,dt:number,rate:number=SWIM_MOTION.pitch.rate){
 const P=SWIM_MOTION.pitch,step=(target-pitch)*approach(P.ease,dt),lim=rate*Math.max(0,dt);return pitch+clamp(step,-lim,lim);
}
/** The pitch a body takes from its vertical speed (m/s, + = rising → nose up = negative pitch), capped. */
export function climbPitch(vy:number){const P=SWIM_MOTION.pitch;return clamp(-vy*P.climb,-P.max,P.max);}
/** The duck-dive's arc (rad, + = head down): head down into the dive, head up on the way back, flat when settled (u 0..1 progress). */
export function diveArcPitch(u:number,goingDown:boolean,tilt:number){return (goingDown?1:-.8)*tilt*Math.sin(Math.PI*clamp(u,0,1));}
/** Buoyancy: the rise-rate multiplier at dive progress u (1 = deepest): brisk from the bottom, easing as the head nears the top. */
export function buoyancyRate(u:number){const B=SWIM_MOTION.buoy;return B.top+(B.deep-B.top)*clamp(u,0,1);}
/** The bank (roll, rad) for a turn rate (rad/s, + = turning left / yaw growing) at speed ratio 0..1: into the turn, capped at `max`. */
export function bankFor(yawRate:number,speedRatio:number,max:number,fullRate:number){
 return clamp(-yawRate/Math.max(1e-3,fullRate)*max*(.3+.7*clamp(speedRatio,0,1)),-max,max);
}
/** The reef's angular momentum: the turn rate (rad/s) eases toward the stick's (`want`), quicker when `near` coral (0..1). */
export function reefYawRate(rate:number,want:number,near:number,dt:number){
 const R=SWIM_MOTION.reefTurn;return rate+(want-rate)*approach(R.ease*(1+SWIM_MOTION.reefNear.turn*clamp(near,0,1)),dt);
}
/** How near the coral the diver is (0 open water .. 1 brushing it) from the clearance (m) over the reef under them. */
export const reefNear=(clearance:number)=>smooth01(clearance,SWIM_MOTION.reefNear.far,SWIM_MOTION.reefNear.near);
/** The reef current's push (m/s along the current's direction) at the swell phase s (−1..1). */
export const reefCurrent=(swell:number)=>SWIM_MOTION.current.push*(.8+.2*clamp(swell,-1,1));
/** Slide along a solid (in place): remove the velocity into the surface normal (nx, nz, unit), keep `keep` of the rest. */
export function slideAlong(v:{vx:number;vz:number},nx:number,nz:number,keep:number=SWIM_MOTION.contact.keep){
 const vn=v.vx*nx+v.vz*nz;if(vn<0){v.vx-=nx*vn;v.vz-=nz*vn;v.vx*=keep;v.vz*=keep;return true;}return false;
}
/** The camera's FOV offset (degrees) wanted for a burst (0..1); 0 when effects are off (heat tier 2+, Battery saver, reduced motion). */
export const fovKick=(burst:number,on:boolean)=>on?SWIM_MOTION.fov.kick*clamp(burst,0,1):0;
/** Ease the FOV offset toward `target` (degrees); snaps to the target once within the update threshold (then no more updates). */
export function easeFov(cur:number,target:number,dt:number){const n=cur+(target-cur)*approach(SWIM_MOTION.fov.ease,dt);return Math.abs(n-target)<SWIM_MOTION.fov.eps?target:n;}
