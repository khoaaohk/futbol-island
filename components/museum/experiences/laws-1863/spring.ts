/**
 * laws-1863 · tiny spring physics for direct manipulation (Oct 9 2026 motion pass; the same helper as penalty-1891/motion.ts, kept per exhibit so each chunk stays independent). No library: a damped spring integrated with
 * fixed 1/120 s sub-steps (stable at any frame rate), velocity-aware (a flick carries its speed into the spring) and interruptible
 * (a new target just moves `target`; position and velocity carry on). `loop` drives one requestAnimationFrame chain that stops by
 * itself the moment every spring is at rest, so nothing runs while the visitor isn't touching anything (rAF also never fires in a
 * hidden tab). Pure enough to test in Node.
 */
export type Spring={x:number;v:number;target:number};
export const spring=(x=0):Spring=>({x,v:0,target:x});
/** Advance a spring by dt seconds. k = stiffness, c = damping. Returns true once it is at rest (and snaps it exactly onto target). */
export function stepSpring(s:Spring,dt:number,k=320,c=26,eps=.0005){
 const n=Math.max(1,Math.ceil(dt*120)),h=dt/n;
 for(let i=0;i<n;i++){const a=-k*(s.x-s.target)-c*s.v;s.v+=a*h;s.x+=s.v*h;}
 if(Math.abs(s.x-s.target)<eps&&Math.abs(s.v)<eps*10){s.x=s.target;s.v=0;return true;}
 return false;
}
/** Rubber band: past a bound the value moves with growing resistance and never goes more than `r` beyond it (iOS-style). */
export function rubber(v:number,lo:number,hi:number,r:number){
 if(v<lo){const d=lo-v;return lo-(1-1/(d/r*.55+1))*r;}
 if(v>hi){const d=v-hi;return hi+(1-1/(d/r*.55+1))*r;}
 return v;
}
/** One rAF chain: `tick(dt)` returns true while it still has work; the chain stops (and frees itself) when it returns false. */
export function loop(tick:(dt:number)=>boolean){
 let raf=0,last=0,stopped=false;
 const f=(now:number)=>{raf=0;if(stopped)return;const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;if(tick(dt))raf=requestAnimationFrame(f);else stopped=true;};
 raf=requestAnimationFrame(f);
 return {stop(){stopped=true;cancelAnimationFrame(raf);raf=0;},get running(){return !stopped;}};
}
