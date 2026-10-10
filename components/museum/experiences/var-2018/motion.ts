/**
 * var-2018 · tiny motion kit (Oct 9 2026), no DOM, no dependencies, so tests/museum-exp-var-2018.cjs can run it in Node.
 * - a damped spring stepped by real time (velocity-aware and interruptible: it starts from whatever position AND velocity the
 *   visitor's finger left behind);
 * - rubber-banding past a bound (iOS-style resistance: the further you pull, the less it follows);
 * - flick projection (where a released fling would come to rest) and exponential coasting;
 * - a CSS `linear()` easing sampled from the same spring, for one-shot WAAPI moves (the camera FLIP).
 * Nothing here schedules frames; the experience runs one rAF loop only while something is still moving.
 */
export type Spring={stiffness:number;damping:number;mass?:number};
export type SpringState={x:number;v:number};
/** Snappy, slightly under-damped (ζ ≈ 0.73): a line lands on a body part with one small overshoot. */
export const SNAP_SPRING:Spring={stiffness:420,damping:30};
/** Softer and critically damped-ish: the monitor springs back from an over-scrub. */
export const EDGE_SPRING:Spring={stiffness:300,damping:32};
/** The camera feed grows from its thumbnail into the monitor. */
export const FLIP_SPRING:Spring={stiffness:260,damping:24};

/** Advance a spring toward `target` by dt seconds (semi-implicit Euler in ≤ 4 ms sub-steps, stable for any frame time). */
export function stepSpring(s:SpringState,target:number,dt:number,c:Spring){
 const m=c.mass??1;let t=Math.min(dt,.064);
 while(t>1e-6){const h=Math.min(t,1/250),a=(-c.stiffness*(s.x-target)-c.damping*s.v)/m;s.v+=a*h;s.x+=s.v*h;t-=h;}
 return s;
}
/** At rest: close enough and slow enough that one more frame would not move a pixel. */
export const atRest=(s:SpringState,target:number,eps=.002,veps=.02)=>Math.abs(s.x-target)<eps&&Math.abs(s.v)<veps;

/** Resistance past an edge: `over` units beyond the bound show as less, never more than `dim`. */
export const rubber=(over:number,dim:number,k=.55)=>Math.sign(over)*(1-1/(Math.abs(over)*k/dim+1))*dim;
/** A value dragged inside [min,max] follows the finger; past a bound it rubber-bands. */
export function rubberClamp(x:number,min:number,max:number,dim:number){
 if(x<min)return min+rubber(x-min,dim);if(x>max)return max+rubber(x-max,dim);return x;
}
/** Where a fling released at velocity v (units/s) comes to rest with a deceleration rate per ms (Apple's .998 "normal"). */
export const project=(x:number,v:number,decel=.998)=>x+(v/1000)*decel/(1-decel);
/** Coast one step: friction decays the velocity exponentially (time constant tau seconds). */
export function coast(s:SpringState,dt:number,tau=.32){s.x+=s.v*dt;s.v*=Math.exp(-dt/tau);return s;}

/** Velocity from the last ~100 ms of pointer samples (units per second). */
export function velocity(samples:readonly {t:number;x:number}[],window=100){
 if(samples.length<2)return 0;const last=samples[samples.length-1];let first=samples[samples.length-2];
 for(let i=samples.length-2;i>=0;i--){if(last.t-samples[i].t>window)break;first=samples[i];}
 const dt=(last.t-first.t)/1000;return dt>0?(last.x-first.x)/dt:0;
}

/** The spring's 0→1 response as a CSS linear() easing plus its settling time, for WAAPI one-shots. */
export function springEasing(c:Spring,maxMs=900){
 const s:SpringState={x:0,v:0},pts:number[]=[0];let ms=0;
 while(ms<maxMs){stepSpring(s,1,1/60,c);ms+=1000/60;pts.push(+s.x.toFixed(4));if(atRest(s,1,.001,.01))break;}
 pts[pts.length-1]=1;
 return {easing:`linear(${pts.join(',')})`,duration:Math.round(ms)};
}
