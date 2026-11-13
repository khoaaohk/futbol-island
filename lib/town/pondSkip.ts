/**
 * Ball skipping on the Stadium Park pond (Nov 13 2026, owner: "a fast, low ball hitting the water should skip"). Pure rules shared
 * by the walking ball (lib/town/walkBall.ts, the shot physics' substeps) and tests/pond-skip.cjs; no three.js, no allocation.
 *
 *  - A fast, low ball (horizontal speed ≥ POND_SKIP.minSpeed, coming in no steeper than POND_SKIP.maxDescent, a rolling ball too)
 *    skips 2–5 times, the count set at its first touch by its speed. Each hop is lower (hopShrink) and slower (keep) than the last;
 *    every touch reports a splash ring. After the last skip it sits in the water and floats.
 *  - A slow or steep ball floats at once (most of its speed is lost in the splash).
 *  - Floating: the ball's speed bleeds away and the pond pushes it toward the nearest bank (the ellipse's outward normal), with a
 *    small bob. At the bank it rolls out onto the grass, then rests and comes back to the player like any shot. A long float, or the
 *    player walking off, recalls it.
 * Local only, like the sea float (ballSea.ts): the walking ball is never shared in multiplayer, and the rules are deterministic
 * (no random numbers), so the same kick always skips the same way.
 */
export const POND_SKIP={
 /** Horizontal speed needed to skip (m/s) and the steepest way in (radians below the horizontal). */
 minSpeed:9,maxDescent:.55,
 /** Skips: 2 at minSpeed, one more every `perSkip` m/s, at most `max`. */
 min:2,max:5,perSkip:7,
 /** First hop's upward speed: base + per × speed (m/s), at most `hopMax`; each later hop × hopShrink. Horizontal speed × keep a skip. */
 hopBase:.8,hopPer:.07,hopMax:3,hopShrink:.72,keep:.6,
 /** On settling into the water the ball keeps this share of its speed. */
 settleKeep:.35,
 /** The floating ball's centre over the water (m: a little under its radius, it sits low), its bob (m, rad/s). */
 floatY:.11,bob:.02,bobSpeed:3.4,
 /** The float: speed decay (1/s), the push toward the bank (m/s²) and its top drift speed (m/s). */
 damp:1,push:2,drift:1.8,
 /** Reaching the bank: at least this speed onto the grass (m/s), so it rolls out a little before it rests. */
 rollOut:2.6,
 /** Recalled after floating this long (s), or once the player is this far from the ball (m). */
 floatMax:24,leash:45,
} as const;

/** The pond as the ball sees it: the water's level (y), its ellipse (centre, radii) and q(x, z) < 1 inside the water. */
export type BallPond={level:number;x:number;z:number;rx:number;rz:number;q:(x:number,z:number)=>number};
/** The ball's pond state (lives on walkBall's state): skipsLeft −1 = not touched the water yet this shot. */
export type PondBall={x:number;y:number;z:number;vx:number;vy:number;vz:number;pondSkipsLeft:number;pondSkip:number;pondFloat:number};

/** How many times a ball that first meets the water at horizontal speed `h` (m/s) falling at `vy` skips: 0 = it floats at once. */
export function skipCount(h:number,vy:number){
 if(!(h>=POND_SKIP.minSpeed)||-vy>h*Math.tan(POND_SKIP.maxDescent))return 0;
 return Math.min(POND_SKIP.max,POND_SKIP.min+Math.floor((h-POND_SKIP.minSpeed)/POND_SKIP.perSkip));
}
/** The upward speed of hop number k (0 = the first) for a ball touching at horizontal speed h. */
export const hopSpeed=(h:number,k:number)=>Math.min(POND_SKIP.hopMax,POND_SKIP.hopBase+POND_SKIP.hopPer*h)*POND_SKIP.hopShrink**k;

/**
 * The ball (centre at b.y) has reached the water's surface: skip it or settle it to float. Returns 'skip' or 'float' (the caller
 * reports the splash ring at (b.x, b.z)). Mutates b only.
 */
export function pondTouch(b:PondBall,pond:BallPond,radius:number):'skip'|'float'{
 const h=Math.hypot(b.vx,b.vz);
 if(b.pondSkipsLeft<0){b.pondSkipsLeft=skipCount(h,b.vy);b.pondSkip=0;}
 if(b.pondSkipsLeft>0){b.pondSkipsLeft--;b.vy=hopSpeed(h,b.pondSkip);b.pondSkip++;b.vx*=POND_SKIP.keep;b.vz*=POND_SKIP.keep;b.y=pond.level+radius;return 'skip';}
 b.pondSkipsLeft=0;b.y=pond.level+POND_SKIP.floatY;b.vy=0;b.vx*=POND_SKIP.settleKeep;b.vz*=POND_SKIP.settleKeep;b.pondFloat=1e-3;return 'float';
}

/**
 * One float step: the speed bleeds away, the pond pushes the ball toward the nearest bank (the ellipse's outward normal at the
 * ball), it bobs. Returns true when the ball has reached the bank this step (the caller rolls it out); b.x / b.z stay in the water.
 */
export function pondFloatStep(b:PondBall,pond:BallPond,dt:number):boolean{
 b.pondFloat+=dt;const damp=Math.exp(-POND_SKIP.damp*dt);b.vx*=damp;b.vz*=damp;
 let nx=(b.x-pond.x)/(pond.rx*pond.rx),nz=(b.z-pond.z)/(pond.rz*pond.rz);const l=Math.hypot(nx,nz);
 if(l>1e-9){nx/=l;nz/=l;}else{nx=1;nz=0;}
 b.vx+=nx*POND_SKIP.push*dt;b.vz+=nz*POND_SKIP.push*dt;
 const sp=Math.hypot(b.vx,b.vz),out=b.vx*nx+b.vz*nz;
 if(out>POND_SKIP.drift&&sp>1e-9){const k=POND_SKIP.drift/out;b.vx*=k;b.vz*=k;}// the bank-ward drift never runs away
 const x=b.x+b.vx*dt,z=b.z+b.vz*dt;
 b.y=pond.level+POND_SKIP.floatY+Math.sin(b.pondFloat*POND_SKIP.bobSpeed)*POND_SKIP.bob;
 if(pond.q(x,z)>=1){// the bank: out of the water, rolling on at least rollOut away from the pond
  const v=Math.max(POND_SKIP.rollOut,Math.hypot(b.vx,b.vz)),dx=b.vx/(Math.hypot(b.vx,b.vz)||1),dz=b.vz/(Math.hypot(b.vx,b.vz)||1);
  const ux=dx*nx+dz*nz>0?dx:nx,uz=dx*nx+dz*nz>0?dz:nz;b.vx=ux*v;b.vz=uz*v;b.x=x;b.z=z;b.pondFloat=0;return true;}
 b.x=x;b.z=z;return false;
}

/** A tiny event hook for each splash (skip, settle, roll-out), e.g. for a sound. Unwired today (stadium audio lives elsewhere). */
export type PondSkipEvent={kind:'skip'|'float'|'out';x:number;z:number;strength:number;skip:number};
const listeners=new Set<(e:PondSkipEvent)=>void>();
const shared:PondSkipEvent={kind:'skip',x:0,z:0,strength:0,skip:0};
export const pondSkipEvents={
 on(fn:(e:PondSkipEvent)=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 /** Reuses one event object (no allocation per splash); listeners must not keep it. */
 emit(kind:PondSkipEvent['kind'],x:number,z:number,strength:number,skip:number){if(!listeners.size)return;shared.kind=kind;shared.x=x;shared.z=z;shared.strength=strength;shared.skip=skip;listeners.forEach(fn=>fn(shared));},
};
