import * as T from 'three';
import type {ShoreField} from './rideSplash';

// Shore foam interactions (owner, Oct 26 2026: "make the wave foam more dynamic ... improve the interactions with it", without more
// heat). The island swash is drawn by ONE shader on the existing shore strip (islandShore.ts); this module only feeds it a handful
// of uniforms so the foam reacts to the player and the ball:
// - the foam parts round the player's ankles where the swash washes over them and bunches up in a soft ring just outside;
// - footsteps through the swash and the ball rolling / landing in it leave small foam rings that spread and fade (a 4-slot ring
//   buffer, oldest recycled first). A ball dropping into the swash also asks the host for ONE pooled splash (ballEffects.splash,
//   existing rings: no new mesh, no new draw call).
// Cost: no mesh, no texture, no draw call. update() allocates nothing (preallocated Vector4s, scalar maths) and writes 5 vec4 +
// 1 float uniform; away from the shore (or with everything faded) it sets uFoamFxOn = 0 and the shader skips the whole block on a
// uniform branch. Off in Battery saver and at heat tier >= 3; reduced motion = calm (the parting only, no rings, no spray).

export const SHORE_FOAM={
 /** Ring slots in the shader (a small fixed loop). */
 rings:4,
 /** The swash band on the drawn waterline distance (m, + sea): the foam can reach from `swashIn` (up the sand) out to `swashOut`. */
 swashIn:-2.6,swashOut:2.4,
 /** Ground at least this high over the water in that 2 m cell (decks, rocks, kerbs) has no swash (the strip's `high`). */
 highLift:.38,
 /** Feet within this height (m) of the sand count as standing in the swash; a ball centre within `ballLow` counts as in the foam. */
 footLow:.45,ballLow:.6,
 /** Parting radius round the ankles (m). */
 partR:.7,
 /** Seconds between footstep rings at walking pace (faster when running), the walking speed (m/s) that counts as a step. */
 stepEvery:.42,stepSpeed:.8,
 /** Ring life (s), its spread (m) for a step / a rolling ball / a ball landing, and the gap between rolling-ball rings (s). */
 ringLife:1.25,stepSize:.55,rollSize:.7,dropSize:1.25,rollEvery:.3,
 /** The ball must move this fast (m/s) to mark the foam while rolling; a drop = it was at least `dropFrom` m up just before. */
 ballSpeed:1.6,dropFrom:.9,
 /** At most one host splash every `sprayEvery` s. */
 sprayEvery:.6,
 /** Camera further than this from the player (map view, high flight): nothing to see, everything off. */
 camFar:70,
} as const;

/** The uniforms the strip shader reads (Object.assign'd into its program next to WATER_UNIFORMS). */
export const SHORE_FOAM_UNIFORMS={
 /** 0 = skip the whole interaction block (uniform branch). */uFoamFxOn:{value:0},
 /** x, z, strength 0..1, radius m. */uFoamPlayer:{value:new T.Vector4(0,0,0,SHORE_FOAM.partR)},
 /** Per slot: x, z, radius m, strength 0..1 (0 = off). */uFoamRings:{value:Array.from({length:SHORE_FOAM.rings},()=>new T.Vector4())},
};
/** GLSL for the strip (after `cover` and `foam` exist): `foamFx(xz,cover)` returns (cut 0..1, extra foam 0..1). */
export const SHORE_FOAM_GLSL=/* glsl */`
uniform float uFoamFxOn;uniform vec4 uFoamPlayer;uniform vec4 uFoamRings[${SHORE_FOAM.rings}];
vec2 foamFx(vec2 xz,float cover){
 vec2 p=xz-uFoamPlayer.xy;float r=uFoamPlayer.w,l=length(p),k=uFoamPlayer.z;
 float cut=k*(1.-smoothstep(r*.45,r,l)),add=k*smoothstep(r*.7,r,l)*(1.-smoothstep(r,r*1.7,l))*.6;
 for(int i=0;i<${SHORE_FOAM.rings};i++){vec4 q=uFoamRings[i];if(q.w<=0.)continue;float lq=length(xz-q.xy);
  add=max(add,q.w*(1.-smoothstep(0.,.1+.06*q.z,abs(lq-q.z))));cut=max(cut,q.w*.7*(1.-smoothstep(q.z*.5,q.z*.9,lq)));}
 return vec2(cut,add*cover);
}
`;

/** 0 = off (Battery saver, heat tier >= 3), 1 = calm (reduced motion: the parting only), 2 = lite (tier 2: rings, no spray), 3 = full. */
export type ShoreFoamMode=0|1|2|3;
export function shoreFoamMode(tier:number,saver:boolean,reduced:boolean):ShoreFoamMode{
 if(saver||tier>=3)return 0;if(reduced)return 1;return tier>=2?2:3;
}
const smooth=(a:number,b:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
/** 0..1: how much swash can reach this spot (drawn waterline distance `d`, the cell's highest ground `lift`). */
export function inSwash(d:number,lift:number){
 if(!(d>SHORE_FOAM.swashIn&&d<SHORE_FOAM.swashOut)||lift>=SHORE_FOAM.highLift)return 0;
 return smooth(SHORE_FOAM.swashIn,SHORE_FOAM.swashIn+.6,d)*(1-smooth(SHORE_FOAM.swashOut-.8,SHORE_FOAM.swashOut,d));
}

export function createShoreFoamFx(field:()=>ShoreField|null,uniforms=SHORE_FOAM_UNIFORMS){
 const C=SHORE_FOAM,n=C.rings;
 // Ring state: x, z, age, size per slot (age >= life = free).
 const rx=new Float32Array(n),rz=new Float32Array(n),age=new Float32Array(n).fill(C.ringLife),size=new Float32Array(n);
 let cursor=0,stepT=0,rollT=0,sprayT=0,part=0,ballWasHigh=false,live=0;
 const ring=(x:number,z:number,s:number)=>{const i=cursor++%n;rx[i]=x;rz[i]=z;age[i]=0;size[i]=s;stats.rings++;};
 const stats={rings:0,sprays:0};
 return {
  stats,
  /** Live rings (for tests and the debug panel). */
  get live(){return live;},
  /**
   * Once per rendered frame. Player at (px, py, pz) moving at `speed` m/s on heading `yaw`; the ball at (bx, by, bz) moving at
   * `ballSpeed` m/s (`ballFree` = not held / carried); `camDist` = camera to player (m). Returns true when the host should play
   * one pooled splash at the ball (a drop into the swash; never in calm/lite mode, at most every SHORE_FOAM.sprayEvery s).
   */
  update(dt:number,mode:ShoreFoamMode,px:number,py:number,pz:number,speed:number,yaw:number,bx:number,by:number,bz:number,ballSpeed:number,ballFree:boolean,camDist:number):boolean{
   const f=field();let spray=false;
   const on=mode>0&&f!==null&&camDist<C.camFar;
   // The player: parting eases in/out (no pop when stepping into the band).
   let target=0;
   if(on){const lift=f.lift(px,pz),ground=Math.max(0,lift)-.42;target=py-ground<C.footLow?inSwash(f.distance(px,pz),lift):0;}
   part+=(target-part)*Math.min(1,dt*6);if(part<.002)part=0;
   if(on&&mode>=2){
    // Footsteps: alternate feet, quicker when running.
    if(part>.3&&speed>C.stepSpeed){stepT-=dt;if(stepT<=0){stepT=C.stepEvery*Math.min(1,2.4/speed);const side=(stats.rings&1)?.18:-.18;ring(px+Math.cos(yaw)*side,pz-Math.sin(yaw)*side,C.stepSize);}}else stepT=0;
    // The ball: a trail of rings while it rolls through the foam, a big one (and one splash) when it drops in.
    if(ballFree){const lift=f.lift(bx,bz),ground=Math.max(0,lift)-.42,h=by-ground,w=inSwash(f.distance(bx,bz),lift);
     if(w>.3&&h<C.ballLow){
      if(ballWasHigh){ring(bx,bz,C.dropSize);rollT=C.rollEvery;if(mode===3&&sprayT<=0){spray=true;sprayT=C.sprayEvery;stats.sprays++;}}
      else if(ballSpeed>C.ballSpeed){rollT-=dt;if(rollT<=0){rollT=C.rollEvery;ring(bx,bz,C.rollSize);}}}
     ballWasHigh=h>C.dropFrom;}else ballWasHigh=false;
   }
   if(sprayT>0)sprayT-=dt;
   // Uniforms: radius grows fast then slows (sqrt), strength fades out (quadratic).
   live=0;const R=uniforms.uFoamRings.value;
   for(let i=0;i<n;i++){if(age[i]<C.ringLife)age[i]+=dt;const k=age[i]>=C.ringLife?0:1-age[i]/C.ringLife;
    if(k>0&&mode>=2){live++;R[i].set(rx[i],rz[i],size[i]*(.25+.75*Math.sqrt(1-k)),k*k*.85);}else R[i].w=0;}
   uniforms.uFoamPlayer.value.set(px,pz,part,C.partR);
   uniforms.uFoamFxOn.value=part>0||live>0?1:0;
   return spray;
  },
  /** Everything off (leaving the island, dispose). */
  reset(){age.fill(C.ringLife);part=0;live=0;ballWasHigh=false;uniforms.uFoamFxOn.value=0;uniforms.uFoamPlayer.value.z=0;for(const r of uniforms.uFoamRings.value)r.w=0;},
 };
}
