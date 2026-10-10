/**
 * cards-1970 · tiny motion kit (Oct 9 2026 motion pass), no dependencies so the Node test can run it.
 *
 * - `springStep`: one semi-implicit Euler step of a damped spring. Used by the clip's requestAnimationFrame loop for direct
 *   manipulation (the scrub playhead): velocity-aware, interruptible, and it reports when it has settled so the loop can stop.
 * - `coastStep`: exponential friction for a flick (the playhead keeps the release velocity and slows down).
 * - `rubber`: the iOS-style rubber band past a bound (the further you pull, the less it moves).
 * - `springKeyframes`: the same spring sampled at 60 Hz into Web Animations keyframe offsets, so one-shot hero moments (the
 *   card FLIP and flip) run on the compositor with real spring physics and no JavaScript loop at all.
 */
export type Spring={k:number;c:number;m?:number};
export const SPRING={
 /** the playhead snapping to a time: quick, a whisper of overshoot */
 snap:{k:320,c:30},
 /** rubber band back to a bound after a flick */
 band:{k:240,c:30},
 /** the card flying from the lamp to the referee's hand */
 fly:{k:190,c:19},
 /** the card turning over: slower, a satisfying overshoot */
 flip:{k:140,c:11},
} satisfies Record<string,Spring>;

export function springStep(x:number,v:number,target:number,s:Spring,dt:number):[number,number]{
 const m=s.m??1,a=(-s.k*(x-target)-s.c*v)/m;v+=a*dt;x+=v*dt;return [x,v];
}
export const settled=(x:number,v:number,target:number,eps=1e-3)=>Math.abs(x-target)<eps&&Math.abs(v)<eps*10;

/** Friction: velocity halves about every 0.17 s. */
export function coastStep(x:number,v:number,dt:number,friction=4):[number,number]{v*=Math.exp(-friction*dt);return [x+v*dt,v];}

/** Rubber band: an overshoot `over` (≥0) shown as a shrinking distance that never passes `d`. */
export const rubber=(over:number,d:number)=>over<=0?0:d*(1-1/(over*.55/d+1));

/** Sample a spring from 0 to 1 (with a starting velocity, in units per second) until it settles. */
export function springCurve(s:Spring,v0=0,maxT=2.5){
 const dt=1/60,out:number[]=[0];let x=0,v=v0,t=0;
 while(t<maxT){[x,v]=springStep(x,v,1,s,dt);t+=dt;out.push(x);if(settled(x,v,1,5e-4)&&t>.1)break;}
 out[out.length-1]=1;return {values:out,duration:Math.round(t*1000)};
}
/** WAAPI keyframes for a spring: `frame(u)` turns the spring's progress (0→1, may overshoot) into a keyframe. */
export function springKeyframes(s:Spring,frame:(u:number)=>Keyframe,v0=0){
 const {values,duration}=springCurve(s,v0);
 return {keyframes:values.map((u,i)=>({...frame(u),offset:i/(values.length-1)})),duration};
}
