/**
 * backpass-1992 · a tiny, pure motion kit for the film's crank and lever (Oct 9 2026). No library: a semi-implicit Euler
 * damped spring (velocity-aware and interruptible: it starts from whatever position and velocity the hand left), exponential
 * friction for the crank's momentum, and a rubber band for dragging past either end of the film. Pure so the Node test can run it.
 */
export type Spring={x:number;v:number};
/** Advance a damped spring toward `to` by dt seconds (sub-stepped so a slow frame never explodes). */
export function springStep(s:Spring,to:number,dt:number,k=170,c=22):Spring{
 let {x,v}=s;const n=Math.max(1,Math.ceil(dt/(1/120))),h=dt/n;
 for(let i=0;i<n;i++){v+=(-k*(x-to)-c*v)*h;x+=v*h;}
 return {x,v};
}
export const settled=(s:Spring,to:number,eps=.002)=>Math.abs(s.x-to)<eps&&Math.abs(s.v)<eps*10;
/** Momentum: velocity decays by `friction` per second. */
export const coast=(s:Spring,dt:number,friction=3.2):Spring=>{const v=s.v*Math.exp(-friction*dt);return {x:s.x+v*dt,v};};
/** Rubber band: past [lo,hi] the hand moves the film less and less (like pulling elastic). */
export function rubber(x:number,lo:number,hi:number,give=.6){
 if(x<lo){const d=lo-x;return lo-give*d/(1+d/give);}
 if(x>hi){const d=x-hi;return hi+give*d/(1+d/give);}
 return x;
}
/** Angle (radians) of point (px,py) around a centre, and the shortest signed difference between two angles. */
export const angleOf=(px:number,py:number,cx:number,cy:number)=>Math.atan2(py-cy,px-cx);
export const angleDiff=(a:number,b:number)=>{let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;};
/** A spring from 0 to 1 sampled into progress keyframes for the Web Animations API (FLIP): {p,offset}[] and its duration (ms). */
export function springSamples(k=210,c=20,v0=0,maxT=1.4,n=36){
 let s:Spring={x:0,v:v0},T=maxT;const raw:number[]=[0];const dt=1/120;
 for(let t=dt;t<=maxT;t+=dt){s=springStep(s,1,dt,k,c);raw.push(s.x);if(settled(s,1,.001)){T=t;break;}}
 const out:{p:number;offset:number}[]=[];for(let i=0;i<=n;i++){const j=Math.round(i/n*(raw.length-1));out.push({p:i===n?1:raw[j],offset:i/n});}
 return {frames:out,ms:Math.round(T*1000)};
}
