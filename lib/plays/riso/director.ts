/** director — the shared camera director for the card films (Oct 4 2026, "closer, more engaging angles").
 *
 * Not a film (exports no `default`). Films opt in; a film that does not import it is unchanged. Camera MATH only: it never draws, adds no
 * loop and no clock, and every function is a pure function of its inputs (so seeking, reduced motion and the 15 fps player behave as before).
 *
 * Why: an audit of all 400 films (card-films PLAN.md) found chapter 1 — the live broadcast — prints the players at a median 12 % of the
 * window height for ~10 s; the user asked for closer, more engaging angles. The teaching rule stays: PULL OUT for the pass or the run (the
 * viewer must see the space and the decision), PUSH IN for the touch.
 *
 * Shot grammar (the presets below, % = the hero's height as a share of the window height):
 *   wide      as authored — the establishing broadcast shot, ≤ 1.5–2 s at the start of chapter 1
 *   follow    ~34 %  the carrier with space ahead of him, eye lowered a little
 *   space     ~22 %  pulled out for a pass / long ball: passer and target both in frame (give `keep` points)
 *   tight     ~55 %  knee-to-head at the decisive touch, low angle (eye ~1.7 m), a moderate lens
 *   detail    ~80 %  the technique close-up (foot and ball), low, centred between hero and ball
 *   reaction  ~50 %  the scorer / keeper after the result, eye level
 *   lesson    ~36 %  the lesson chapter: marks and arrows stay readable
 * Motion: every change eases (easeInOutSine) over max(.7 s, |Δlog size| / .9) — zoom ≤ ~2.5× a second; the azimuth offset is capped at
 * ±35° and blends at the same rate; roll is always 0 (world up, stable horizon). Reduced motion: hard cuts (no tween) between beats.
 * Safety: after reframing, the hero's feet and head, the ball and any `keep` points are projected; if one leaves the inner `margin` of the
 * window (or goes behind the near plane) the move is backed off by bisection — a subject is never cropped by the director.
 *
 * Use (3D films — any camera that is "an eye, an aim point and a focal length in screen units"):
 *   const B1=beats([[0,'wide'],[CUE(0,'runs')-.3,'follow'],[CUE(0,'shoots')-.4,'tight'],[CUE(0,'goal')+.3,'reaction']]);
 *   const p=reframe({eye:C,target:T,F},{hero:[x,0,z],ball},shotAt(t,B1,reduced),{w:s.W/z,h:s.H/z});  → p.eye, p.target, p.F
 * Films whose cameras are `{P,T,fov}` Shots (the carvajal pattern / the kits) use `directShot(shot,subj,params,view,size)`.
 * Films with a 2D stage use `push2D(s,pts,params)` right after their own `s.camera(...)`. */
import type {Sheet} from '../../paths/riso/sheet';
import type {V3} from './athlete';

type Pt=[number,number];
const DEG=Math.PI/180,clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a:number,b:number,u:number)=>a+(b-a)*u;
const easeInOutSine=(u:number)=>-(Math.cos(Math.PI*u)-1)/2;
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const len=(a:V3)=>Math.hypot(a[0],a[1],a[2]),nrm=(a:V3):V3=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const mix=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];

// ---------------------------------------------------------------- shots and beats
/** k: how much of the director's framing is applied (0 = the authored camera); size: hero height ÷ window height; low: 0 authored
 * elevation … 1 eye at ~1.7 m; lens: 0 keep the authored focal … 1 a ~30° vertical lens (only ever widens a long lens);
 * ball: focus weight on the ball (0 = the hero's chest); az: degrees to swing round the focus (over-the-shoulder), ±35 max */
export type ShotParams={k:number;size:number;low:number;lens:number;ball:number;az:number};
export type ShotKind='wide'|'follow'|'space'|'tight'|'detail'|'reaction'|'lesson';
export const SHOTS:Record<ShotKind,ShotParams>={
 wide:{k:0,size:.12,low:0,lens:0,ball:.3,az:0},
 follow:{k:1,size:.34,low:.3,lens:.35,ball:.35,az:0},
 space:{k:1,size:.22,low:0,lens:.2,ball:.5,az:0},
 tight:{k:1,size:.55,low:.75,lens:.6,ball:.4,az:0},
 detail:{k:1,size:.8,low:1,lens:.7,ball:.6,az:0},
 reaction:{k:1,size:.5,low:.5,lens:.5,ball:0,az:0},
 lesson:{k:1,size:.36,low:.3,lens:.35,ball:.35,az:0},
};
/** a beat: from time t move to this shot; `dur` (s) overrides the automatic move length — use it when the authored wide is much farther
 * than the 12 % the rate limit assumes (e.g. a 3 % bowl shot), so the push-in still respects ~2.5× a second */
export type Beat=[number,ShotKind|(Partial<ShotParams>&{from?:ShotKind;dur?:number})];
export type Beats={t:number[];p:ShotParams[];d:number[]};
const resolve=(b:Beat[1]):ShotParams=>{if(typeof b==='string')return SHOTS[b];const{from,dur:_d,...rest}=b;return{...SHOTS[from??'follow'],...rest};};
const ZOOM_RATE=.9,MIN_MOVE=.7;
/** prepare a beat list once (module scope): sorted, each move's duration from the zoom-rate limit */
export function beats(list:Beat[]):Beats{
 const L=[...list].sort((a,b)=>a[0]-b[0]),t:number[]=[],p:ShotParams[]=[],d:number[]=[];
 for(const[ti,b] of L){const q=resolve(b),prev=p.length?p[p.length-1]:q;
  const s0=prev.k<.01?SHOTS.wide.size:prev.size,s1=q.k<.01?SHOTS.wide.size:q.size;
  const auto=Math.max(MIN_MOVE,Math.abs(Math.log(s1/s0))/ZOOM_RATE,Math.abs(q.az-prev.az)/25);t.push(ti);p.push(q);d.push(typeof b==='object'&&b.dur?Math.max(MIN_MOVE,b.dur):auto);}
 return{t,p,d};
}
const blend=(a:ShotParams,b:ShotParams,u:number):ShotParams=>u<=0?a:u>=1?b:{k:lerp(a.k,b.k,u),
 size:a.k<.01?b.size:b.k<.01?a.size:Math.exp(lerp(Math.log(a.size),Math.log(b.size),u)),low:lerp(a.low,b.low,u),lens:lerp(a.lens,b.lens,u),ball:lerp(a.ball,b.ball,u),az:lerp(a.az,b.az,u)};
/** the shot at time t: eased moves between beats (reduced motion: hard cuts) */
export function shotAt(t:number,B:Beats,reduced=false):ShotParams{
 if(!B.p.length)return SHOTS.wide;let cur=B.p[0];
 for(let i=1;i<B.p.length;i++){const a=B.t[i];if(t<a)break;const u=reduced?1:easeInOutSine(clamp((t-a)/B.d[i]));cur=blend(cur,B.p[i],u);}
 return cur;
}

// ---------------------------------------------------------------- 3D reframing
/** a pinhole camera as the films author it: eye, aim point, focal length in screen units (screen = F·x/z) */
export type Pin={eye:V3;target:V3;F:number};
/** hero: the ground point under the key player; ball: the ball centre; keep: points that must stay in frame (the receiver, the goal
 * mouth, the defender being beaten; {P,w} = a soft point, w 0..1 — see near()); height: the hero's height in metres (1.8) */
export type Keep=V3|{P:V3;w:number};
export type Subject={hero:V3;ball?:V3|null;keep?:Keep[];height?:number};
/** soft keep points: the feet and head of each other player near the hero, weighted 1 inside r0 metres fading to 0 at r1 — so the
 * defender being beaten (or the receiver) stays in frame, and nothing jumps when someone walks in or out of range */
export function near(hero:V3,others:V3[],r0=4,r1=8,height=1.8):Keep[]{const out:Keep[]=[];
 for(const o of others){const d=Math.hypot(o[0]-hero[0],o[2]-hero[2]),w=1-clamp((d-r0)/(r1-r0));if(w<=.01)continue;const u=w*w*(3-2*w);
  out.push({P:[o[0],0,o[2]],w:u},{P:[o[0],height,o[2]],w:u});}return out;}
/** view: the window size in the camera's screen units (frame()-pattern films: {w:s.W,h:s.H}; cam(s,0,0,z) films: {w:s.W/z,h:s.H/z}) */
export type View={w:number;h:number};
/** recenter (0..1, opt-in): aim between the focus and the centre of the hard points (hero, ball, keeps with w = 1) instead of at the
 * focus — for pass / cross beats where the receiver sits at the edge of the authored frame, so the camera can still push in on the
 * whole group (and for authored cameras that lead the hero) */
export type ReframeOpts={margin?:number;minDist?:number;minEye?:number;eyeLow?:number;near?:number;recenter?:number};
function place(cam:Pin,subj:Subject,p:ShotParams,view:View,o:ReframeOpts,k:number,back=1):Pin{
 if(k<=1e-4)return cam;
 const h=subj.height??1.8,chest:V3=[subj.hero[0],h*.55,subj.hero[2]],b=subj.ball,
  focus=b?mix(chest,[b[0],clamp(b[1],0,h),b[2]],p.ball):chest;
 const F0=cam.F,FT=(view.h/2)/Math.tan(15*DEG),F1=F0>FT?Math.exp(lerp(Math.log(F0),Math.log(FT),p.lens)):F0,F=Math.exp(lerp(Math.log(F0),Math.log(F1),k));
 const v0=sub(cam.eye,focus),d0=Math.max(1e-3,len(v0));
 // the distance that prints the hero at `size` with focal F; never farther than "the authored size with this focal" (the director
 // only ever moves closer than the author, never pulls out past the authored framing)
 const dT=F*h/(p.size*view.h),dKeep=d0*F/F0,d1=Math.max(o.minDist??2.5,Math.min(dT,dKeep));
 // the back-off scales with k: a nearly-authored shot (k→0) is never pushed out, and k→0 meets the authored camera continuously
 const d=Math.exp(lerp(Math.log(d0*F/F0),Math.log(d1),k))*(1+(back-1)*k);
 const a0=Math.atan2(v0[2],v0[0]),e0=Math.asin(clamp(v0[1]/d0,-1,1));
 // the lowered elevation comes from the un-backed distance, so a back-off stays on one axis (fits() stays monotonic in it)
 const eLow=Math.asin(clamp(((o.eyeLow??1.7)-focus[1])/(d/(1+(back-1)*k)),-.2,.95)),e=Math.min(e0,lerp(e0,eLow,p.low*k)),a=a0+clamp(p.az,-35,35)*DEG*k;
 const eye:V3=[focus[0]+d*Math.cos(e)*Math.cos(a),Math.max(o.minEye??.6,focus[1]+d*Math.sin(e)),focus[2]+d*Math.cos(e)*Math.sin(a)];
 let aim=focus;const rc=clamp(o.recenter??0);
 if(rc>0){let x=0,y=0,z=0,W=0;for(const[P,w] of hardPts(subj)){x+=P[0]*w;y+=P[1]*w;z+=P[2]*w;W+=w;}aim=mix(focus,[x/W,y/W,z/W],rc);}
 return{eye,target:mix(cam.target,aim,k),F};
}
/** the points recenter aims between, each with a weight: soft keeps join smoothly as w rises through .9 → 1 (no cliff) */
const hardPts=(subj:Subject):[V3,number][]=>{const h=subj.height??1.8;return[[[subj.hero[0],h*.5,subj.hero[2]],1],...(subj.ball?[[subj.ball,1] as [V3,number]]:[]),
 ...(subj.keep??[]).map(k=>Array.isArray(k)?[k as V3,1] as [V3,number]:[(k as {P:V3}).P,(()=>{const u=clamp(((k as {w:number}).w-.9)/.1);return u*u*(3-2*u);})()] as [V3,number])];};
function fits(c:Pin,subj:Subject,view:View,m:number,nearZ:number){
 // the camera basis once per test (not per point): heat — this runs a few dozen times a frame inside the back-off and steady()
 const f=nrm(sub(c.target,c.eye));let r=cross(f,[0,1,0]);if(len(r)<1e-6)r=[1,0,0];r=nrm(r);const u=cross(r,f),F=c.F,hw=view.w/2,hh=view.h/2,e=c.eye;
 const test=(P:V3,w:number)=>{if(w<=.01)return true;const dx=P[0]-e[0],dy=P[1]-e[1],dz=P[2]-e[2],z=dx*f[0]+dy*f[1]+dz*f[2];// a soft point may slip behind the lens the less it matters (the allowed depth fades smoothly with w, no switch)
  if(z<nearZ*w-40*(1-w)/(w+.01))return false;if(z<.1)return true;
  // a soft point just in front of the lens counts less until it is a few metres in (continuous with 'behind the lens is allowed')
  if(w<.99){w*=clamp((z-.1)/3);if(w<=.01)return true;}const L=m/w,iz=F/Math.max(1e-3,z);return Math.abs((dx*r[0]+dy*r[1]+dz*r[2])*iz)<=L*hw&&Math.abs((dx*u[0]+dy*u[1]+dz*u[2])*iz)<=L*hh;};
 const h=subj.height??1.8,H=subj.hero;if(!test([H[0],0,H[2]],1)||!test([H[0],h*1.04,H[2]],1))return false;if(subj.ball&&!test(subj.ball,1))return false;
 for(const k of subj.keep??[]){if(Array.isArray(k)){if(!test(k as V3,1))return false;}else if(!test((k as {P:V3}).P,(k as {w:number}).w))return false;}
 return true;
}
/** move the authored camera toward the shot; if the hero, ball or keep points would leave the window it dollies back out along the same
 * axis (continuous), and only if that cannot hold them falls back to less of the move (k) */
export function reframe(cam:Pin,subj:Subject,p:ShotParams,view:View,o:ReframeOpts={}):Pin{
 const k=clamp(p.k);if(k<=1e-4)return cam;const m=o.margin??.88,near=o.near??1;
 let c=place(cam,subj,p,view,o,k);if(fits(c,subj,view,m,near))return c;
 // back off along the shot's own axis (same angle, same aim) until everything fits: monotonic in the distance, so the answer moves
 // continuously as the players move — no snaps
 // the SMALLEST back-off that fits, searched upward (fits is not monotonic in the distance when a player stands near the camera's path,
 // so a bisection over [1,8] could jump straight to a far answer), then refined
 {let lo=1;for(let b=1.12;b<=8.01;b*=1.12){if(fits(place(cam,subj,p,view,o,k,b),subj,view,m,near)){let hi=b;for(let j=0;j<5;j++){const mid=Math.sqrt(lo*hi);if(fits(place(cam,subj,p,view,o,k,mid),subj,view,m,near))hi=mid;else lo=mid;}
   return place(cam,subj,p,view,o,k,hi);}lo=b;}}
 // the largest k that fits: scan down from the top (fits(k) is not monotonic when the authored camera does not hold the hero, so a plain
 // bisection from 0 would collapse to the authored shot and then snap), then refine between the last failing and the first fitting step
 const N=20;for(let i=1;i<=N;i++){const lo0=k*(1-i/N);if(lo0<=1e-4)break;if(!fits(place(cam,subj,p,view,o,lo0),subj,view,m,near))continue;
  let lo=lo0,hi=k*(1-(i-1)/N);for(let j=0;j<7;j++){const mid=(lo+hi)/2;if(fits(place(cam,subj,p,view,o,mid),subj,view,m,near))lo=mid;else hi=mid;}
  return place(cam,subj,p,view,o,lo);}
 return cam;
}
/** focal ↔ field of view for cameras built as makeCamera({fov,size}) (F = size/2 / tan(fov/2)) */
export const focalOf=(fov:number,size:number)=>(size/2)/Math.tan(Math.max(.1,fov)*DEG/2);
export const fovOf=(F:number,size:number)=>2*Math.atan((size/2)/F)/DEG;
/** the same move for `{P,T,fov}` Shots (plan()/cam3 films): size = the makeCamera size (1080·LENS) */
export function directShot(sh:{P:V3;T:V3;fov:number},subj:Subject,p:ShotParams,view:View,size:number,o:ReframeOpts={}):{P:V3;T:V3;fov:number}{
 if(p.k<=1e-4)return sh;const r=reframe({eye:sh.P,target:sh.T,F:focalOf(sh.fov,size)},subj,p,view,o);return{P:r.eye,T:r.target,fov:fovOf(r.F,size)};
}

// ---------------------------------------------------------------- 2D push-in (stage / figureCam films)
/** After the film's own s.camera(...): push in about the subject. pts = the subject's outline points in the current world coordinates
 * (e.g. the hero's head and feet, the ball). Equivalent to a narrower lens re-aimed at the subject; clamped so the subject stays inside the
 * inner `margin` of the window. Uses only the sheet's public translate/scale (forwarded to every plate). */
export function push2D(s:Sheet,pts:Pt[],p:ShotParams,o:{margin?:number;maxZoom?:number}={}){
 const k=clamp(p.k);if(k<=1e-4||!pts.length)return;
 const M=s.getTransform(),W=s.width*s.dpr,H=s.height*s.dpr,mg=o.margin??.88;
 let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(const q of pts){const X=M.a*q[0]+M.c*q[1]+M.e,Y=M.b*q[0]+M.d*q[1]+M.f;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y);}
 const bh=Math.max(1,y1-y0),bw=Math.max(1,x1-x0);
 let z=Math.exp(k*Math.log(clamp(p.size*H/bh,1,o.maxZoom??3)));z=Math.min(z,mg*H/bh,mg*W/bw);if(z<=1.001)return;
 const qx=(x0+x1)/2,qy=(y0+y1)/2;let cx=lerp(qx,W/2,k*.85),cy=lerp(qy,H/2,k*.85);
 // keep the zoomed subject box inside the margin
 const hx=bw*z/2,hy=bh*z/2,lx=W*(1-mg)/2,ly=H*(1-mg)/2;cx=clamp(cx,lx+hx,W-lx-hx);cy=clamp(cy,ly+hy,H-ly-hy);
 // world-space equivalent of the device move  D(P) = z·(P − q) + c :  translate(t) then scale(z), t = A⁻¹(z·b − z·q + c − b)
 const vx=z*M.e-z*qx+cx-M.e,vy=z*M.f-z*qy+cy-M.f,det=M.a*M.d-M.b*M.c;if(Math.abs(det)<1e-9)return;
 s.translate((M.d*vx-M.c*vy)/det,(-M.b*vx+M.a*vy)/det);s.scale(z);
}

// ---------------------------------------------------------------- temporal steadiness
/** The fit clamp can change its answer quickly (a keep point arriving, the ball crossing the frame edge); averaging the directed camera
 * over a short window (triangle weights, n samples within ±half seconds, all pure functions of t) turns those into smooth moves.
 * Use around the whole directed camera:  const p=steady(t,u=>reframe(authored(u),subj(u),shotAt(u,B),DV));  then rebuild once.
 * Cost: n × the camera math (no drawing). Heat: n=5 is ~5 × ~40 flops. Reduced motion (stills): pass half=0. */
export function steady(t:number,f:(t:number)=>Pin,half=.35,n=5):Pin{
 if(half<=0||n<2)return f(t);let w=0,ex=0,ey=0,ez=0,tx=0,ty=0,tz=0,lf=0;
 for(let i=0;i<n;i++){const u=-1+2*i/(n-1),wi=1-Math.abs(u)*.75,p=f(t+u*half);w+=wi;ex+=p.eye[0]*wi;ey+=p.eye[1]*wi;ez+=p.eye[2]*wi;tx+=p.target[0]*wi;ty+=p.target[1]*wi;tz+=p.target[2]*wi;lf+=Math.log(p.F)*wi;}
 return{eye:[ex/w,ey/w,ez/w],target:[tx/w,ty/w,tz/w],F:Math.exp(lf/w)};
}
