import type {Rect} from './pitch';

/**
 * Chip motion for the tactics board. Pure maths, unit-tested (tests/coaches-board.cjs).
 *
 * A released chip is a damped spring toward its resting point. With a critically damped spring of angular frequency ω, a
 * chip released with velocity v toward the point p + v/ω moves exactly like friction (x = x0·e^(−ωt)), so momentum, the
 * glide and the settle are one closed-form motion: no integration error, frame-rate independent and jitter-free. A small
 * under-damping (ζ < 1) gives the soft "clack" overshoot of a magnet settling, and the same spring pulls a chip back inside
 * the pitch (rubber-banding) or apart from a neighbour (the soft nudge).
 */
export type Spring={omega:number;zeta:number};
/** Glide after a flick: ω 8 → a 1000 px/s flick travels ~125 px and settles in ~0.6 s. */
export const GLIDE:Spring={omega:8,zeta:.86};
/** Moving between steps, undo/redo, a format change: quick and with no overshoot. */
export const STEP:Spring={omega:13,zeta:1};
export const MAX_RELEASE_SPEED=2200;// px/s

/** Advances one axis of a damped spring (x is the position relative to its target) by dt seconds, exactly. */
export function springAxis(x:number,v:number,dt:number,{omega:w,zeta:z}:Spring):[number,number]{
 if(dt<=0)return [x,v];
 if(z>=1){// critically damped (over-damping is not used)
  const e=Math.exp(-w*dt),c=v+w*x;
  return [(x+c*dt)*e,(c-w*(x+c*dt))*e];
 }
 const wd=w*Math.sqrt(1-z*z),e=Math.exp(-z*w*dt),cos=Math.cos(wd*dt),sin=Math.sin(wd*dt),b=(v+z*w*x)/wd;
 const nx=e*(x*cos+b*sin);
 const nv=e*((-x*wd*sin+b*wd*cos)-z*w*(x*cos+b*sin));
 return [nx,nv];
}
export type Body={x:number;y:number;vx:number;vy:number;tx:number;ty:number;spring:Spring};
/** Advances a body toward its target. Returns true once it has settled (and puts it exactly on the target). */
export function stepBody(b:Body,dt:number,eps=.015,epsV=.08):boolean{
 const [x,vx]=springAxis(b.x-b.tx,b.vx,dt,b.spring),[y,vy]=springAxis(b.y-b.ty,b.vy,dt,b.spring);
 b.x=b.tx+x;b.y=b.ty+y;b.vx=vx;b.vy=vy;
 if(Math.hypot(x,y)<eps&&Math.hypot(vx,vy)<epsV){b.x=b.tx;b.y=b.ty;b.vx=0;b.vy=0;return true;}
 return false;
}
/** Where a flick comes to rest before any clamping: p + v/ω. */
export const projectRest=(p:number,v:number,s:Spring=GLIDE)=>p+v/s.omega;

/** iOS-style rubber band: the further past the edge, the less the chip follows (never more than `limit` past it). */
export function rubber(value:number,min:number,max:number,limit:number):number{
 if(value<min){const d=min-value;return min-limit*(1-1/(d/limit*.55+1));}
 if(value>max){const d=value-max;return max+limit*(1-1/(d/limit*.55+1));}
 return value;
}
export const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
export const clampTo=(r:Rect,x:number,y:number):[number,number]=>[clamp(x,r.x0,r.x1),clamp(y,r.y0,r.y1)];

/**
 * Release velocity from the last ~90 ms of pointer samples (time in ms). A finger that stopped before lifting (the newest
 * sample is more than 60 ms old) has no momentum.
 */
export class VelocityTracker{
 private s:{t:number;x:number;y:number}[]=[];
 reset(){this.s.length=0;}
 add(t:number,x:number,y:number){this.s.push({t,x,y});while(this.s.length>2&&t-this.s[0].t>90)this.s.shift();}
 velocity(now:number):[number,number]{
  const s=this.s;if(s.length<2)return [0,0];
  const last=s[s.length-1];if(now-last.t>60)return [0,0];
  const first=s[0],dt=(last.t-first.t)/1000;if(dt<=0.004)return [0,0];
  let vx=(last.x-first.x)/dt,vy=(last.y-first.y)/dt;const sp=Math.hypot(vx,vy);
  if(sp>MAX_RELEASE_SPEED){vx*=MAX_RELEASE_SPEED/sp;vy*=MAX_RELEASE_SPEED/sp;}
  return [vx,vy];
 }
}

/**
 * Nudges a resting point so it never fully covers another chip: pushed out to `min(a,b)` from each neighbour (a few passes,
 * then clamped back inside the bounds). Deterministic: two chips on exactly the same spot separate sideways.
 */
export function separate(p:[number,number],others:{x:number;y:number;min:number}[],bounds:Rect,passes=4):[number,number]{
 let [x,y]=p;
 for(let k=0;k<passes;k++){
  let moved=false;
  for(const o of others){let dx=x-o.x,dy=y-o.y,d=Math.hypot(dx,dy);
   if(d>=o.min-1e-6)continue;
   if(d<1e-6){dx=1;dy=.35;d=Math.hypot(dx,dy);}
   x=o.x+dx/d*o.min;y=o.y+dy/d*o.min;moved=true;}
  [x,y]=clampTo(bounds,x,y);
  if(!moved)break;
 }
 return [x,y];
}
/** Snap to a light grid of `step` metres. */
export const snapGrid=([x,y]:[number,number],step:number):[number,number]=>[Math.round(x/step)*step,Math.round(y/step)*step];
/** Snap to the nearest of a set of slots when it is within `reach`, otherwise unchanged. */
export function snapSlots(p:[number,number],slots:[number,number][],reach:number):[number,number]{
 let best:[number,number]|null=null,bd=reach;for(const s of slots){const d=Math.hypot(s[0]-p[0],s[1]-p[1]);if(d<bd){bd=d;best=s;}}
 return best?[best[0],best[1]]:p;
}
