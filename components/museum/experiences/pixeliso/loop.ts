/**
 * pixeliso · the sleep-aware play loop and calm motion (Oct 10 2026). HARD RULE: 0 requestAnimationFrame at rest.
 *
 * createPlayLoop(tick) owns ONE rAF chain. It runs only after wake() and stops by itself the moment tick() returns false (the
 * ball has landed, the spring has settled). setVisible(false) (an IntersectionObserver: observe(el)) parks it with no frames at
 * all and resumes on return; dispose() ends it for good (call it on unmount). `fps` caps the cadence (30 = the penalty
 * cabinet's sprite-like rate). `reduced` (prefers-reduced-motion) never starts a chain: wake() runs the simulation straight to
 * its end in one synchronous pass, so the result appears at once (turn-based / static play).
 *
 * Springs and follows are the penalty cabinet's (motion.ts) and the anatomy kit's (live.tsx): fixed sub-steps, interruptible,
 * snap exactly to rest so the loop can sleep.
 */
export type Tick=(dt:number,now:number)=>boolean;
export type PlayLoop={wake():void;stop():void;setVisible(v:boolean):void;setReduced(r:boolean):void;observe(el:Element|null):()=>void;dispose():void;
 readonly running:boolean;readonly frames:number;readonly asleep:boolean};

const raf=(f:FrameRequestCallback)=>typeof requestAnimationFrame==='function'?requestAnimationFrame(f):(setTimeout(()=>f(Date.now()),16) as unknown as number);
const caf=(id:number)=>typeof cancelAnimationFrame==='function'?cancelAnimationFrame(id):clearTimeout(id);

export function createPlayLoop(tick:Tick,{fps=60,reduced=false,maxSteps=2400}:{fps?:number;reduced?:boolean;maxSteps?:number}={}):PlayLoop{
 let id=0,last=0,acc=0,wanted=false,visible=true,disposed=false,frames=0,calm=reduced;
 const step=1/fps;
 const frame=(now:number)=>{id=0;if(disposed||!visible)return;
  const dt=last?Math.min(.1,(now-last)/1000):step;last=now;acc+=dt;
  if(fps<60&&acc<step-.002){id=raf(frame);return;}
  const use=Math.min(.1,acc);acc=0;frames++;
  let more=false;try{more=tick(use,now);}catch(e){wanted=false;throw e;}
  if(more&&!disposed){id=raf(frame);}else{wanted=false;last=0;}};
 const settle=()=>{let n=0;while(n++<maxSteps&&tick(1/30,n*33.3)){/* run to the end */}wanted=false;};
 const api:PlayLoop={
  wake(){if(disposed)return;if(calm){settle();return;}wanted=true;if(!id&&visible){last=0;acc=0;id=raf(frame);}},
  stop(){wanted=false;if(id){caf(id);id=0;}last=0;},
  setVisible(v){visible=v;if(!v){if(id){caf(id);id=0;}last=0;}else if(wanted&&!id&&!disposed){last=0;id=raf(frame);}},
  setReduced(r){calm=r;if(r&&(wanted||id)){api.stop();settle();}},
  observe(el){if(!el||typeof IntersectionObserver==='undefined')return()=>{};
   const io=new IntersectionObserver(es=>{const e=es[es.length-1];api.setVisible(!!e&&e.isIntersecting);},{threshold:0});io.observe(el);return()=>io.disconnect();},
  dispose(){disposed=true;api.stop();},
  get running(){return !!id;},get frames(){return frames;},get asleep(){return !id;},
 };
 return api;
}

// ── Calm motion ──────────────────────────────────────────────────────────────────────────────────────────────────────────
export type Spring={x:number;v:number;target:number};
export const spring=(x=0):Spring=>({x,v:0,target:x});
/** Advance a damped spring by dt (fixed 1/120 s sub-steps). Returns true at rest (snapped exactly onto target). */
export function stepSpring(s:Spring,dt:number,k=170,c=24,eps=.0005){
 const n=Math.max(1,Math.ceil(dt*120)),h=dt/n;
 for(let i=0;i<n;i++){const a=-k*(s.x-s.target)-c*s.v;s.v+=a*h;s.x+=s.v*h;}
 if(Math.abs(s.x-s.target)<eps&&Math.abs(s.v)<eps*10){s.x=s.target;s.v=0;return true;}
 return false;}
/** Exponential follow (time constant `tau` s); snaps when within eps. */
export function follow(cur:number,target:number,dt:number,tau=.12,eps=1e-3){const n=cur+(target-cur)*(1-Math.exp(-dt/tau));return Math.abs(target-n)<eps?target:n;}
/** Rubber band past a bound (never more than r beyond it). */
export function rubber(v:number,lo:number,hi:number,r:number){
 if(v<lo){const d=lo-v;return lo-(1-1/(d/r*.55+1))*r;}if(v>hi){const d=v-hi;return hi+(1-1/(d/r*.55+1))*r;}return v;}
export const easeOut=(t:number)=>1-(1-Math.min(1,Math.max(0,t)))**3;
export const easeInOut=(t:number)=>{t=Math.min(1,Math.max(0,t));return t<.5?4*t*t*t:1-(-2*t+2)**3/2;};
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/**
 * A ball flight: from (x0,y0) to (x1,y1) over `t` seconds with apex `apex` metres (a parabola). Returns position at time s.
 */
export function flight(from:readonly [number,number],to:readonly [number,number],t:number,apex:number){
 return (s:number)=>{const u=clamp(s/t,0,1);return {x:lerp(from[0],to[0],u),y:lerp(from[1],to[1],u),z:4*apex*u*(1-u),done:u>=1};};}
