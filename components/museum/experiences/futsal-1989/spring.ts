/**
 * futsal-1989 motion kit (Oct 9 2026): a damped spring you step yourself, and a frame loop that only runs while something is
 * still moving. Nothing here ticks at rest: `kick()` starts the loop, and the loop stops itself the first frame `tick` returns
 * false (everything settled), when the tab is hidden, or on `stop()`. No library: about 40 lines keeps the exhibit chunk small.
 */
export type Spring={x:number;v:number;to:number;k:number;c:number};
/** A spring with stiffness k and a damping ratio z (1 = no overshoot, below 1 = a little bounce). */
export const spring=(x:number,k=170,z=.72):Spring=>({x,v:0,to:x,k,c:2*Math.sqrt(k)*z});
/** Semi-implicit Euler in small sub-steps: stable for stiff springs at 30–120 Hz. */
export function stepSpring(s:Spring,dt:number){const n=Math.max(1,Math.ceil(dt/(1/240))),h=dt/n;
 for(let i=0;i<n;i++){const a=-s.k*(s.x-s.to)-s.c*s.v;s.v+=a*h;s.x+=s.v*h;}}
export const settled=(s:Spring,eps=.002)=>Math.abs(s.x-s.to)<eps&&Math.abs(s.v)<eps*20;
export const snap=(s:Spring)=>{s.x=s.to;s.v=0;};
/** Rubber-band a value past [lo, hi]: it keeps following, but further out it gives less (like iOS overscroll). */
export function rubber(x:number,lo:number,hi:number,give=.55,dim=60){
 if(x>hi){const d=x-hi;return hi+(1-1/(d*give/dim+1))*dim;}
 if(x<lo){const d=lo-x;return lo-(1-1/(d*give/dim+1))*dim;}return x;}
/** Pointer velocity from the last ~100 ms of samples (units per second). */
export function velocityTracker(){let pts:{t:number;x:number;y:number}[]=[];
 return{reset(){pts=[];},add(x:number,y:number){const t=performance.now();pts.push({t,x,y});while(pts.length>2&&t-pts[0].t>100)pts.shift();},
  get(){if(pts.length<2)return{x:0,y:0};const a=pts[0],b=pts[pts.length-1],dt=Math.max(.016,(b.t-a.t)/1000);return{x:(b.x-a.x)/dt,y:(b.y-a.y)/dt};}};}
/** A frame loop that sleeps at rest. `tick(dt)` returns true while anything is still moving. */
export function sleepyLoop(tick:(dt:number)=>boolean){let raf=0,last=0;
 const frame=(t:number)=>{raf=0;if(typeof document!=='undefined'&&document.hidden)return;const dt=Math.min(1/30,Math.max(0,(t-last)/1000));last=t;if(tick(dt))raf=requestAnimationFrame(frame);};
 return{kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}},stop(){if(raf)cancelAnimationFrame(raf);raf=0;},running:()=>raf!==0};}
export const prefersReduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/** A damped spring (stiffness k, damping ratio z < 1) sampled into a CSS linear() easing for one-shot Web Animations. */
export function springEase(k=260,z=.55,span=.9,n=40){const w0=Math.sqrt(k),wd=w0*Math.sqrt(1-z*z),pts:string[]=[];
 for(let i=0;i<=n;i++){const t=i/n*span,x=1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+z*w0/wd*Math.sin(wd*t));pts.push((i===n?1:x).toFixed(3));}return `linear(${pts.join(',')})`;}
