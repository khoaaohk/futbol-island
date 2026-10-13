import {buildPanels,type PanelKind} from './geometry';

/**
 * telstar-1970 · "Mexico 70 on air", the game model (Oct 12 2026 anatomy restyle; the rules are the pixel version's, unchanged).
 * Pure: no DOM, so tests/museum-exp-telstar-1970.cjs checks every rule in Node.
 *
 * Two machines, one story:
 *  1. THE STUDIO STAND. A big Telstar sits on a turntable in front of a 1970 TV camera. Each turn brings an empty gap to the
 *     front; the child stitches it with the right panel (a black pentagon or a white hexagon, dragged from two trays). 12 + 20.
 *  2. ON AIR. The camera films a pretend match on a table-top pitch. The child drags the viewfinder to keep the ball in shot. The
 *     picture is BLACK AND WHITE, like most sets in 1970: every colour becomes its luma grey, and the brown leather ball comes out
 *     the same grey as the grass (≈ 110 v ≈ 113 of 255), so it melts away; the Telstar's black and white stay at the two ends.
 *     Both halves play the same seeded match, so only the ball changes: the scores prove it.
 */
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const easeOut=(t:number)=>1-Math.pow(1-clamp(t,0,1),3);
/** Exponential follow (frame-rate independent). */
export const follow=(cur:number,target:number,dt:number,seconds:number)=>{const n=cur+(target-cur)*(1-Math.exp(-dt/seconds));return Math.abs(target-n)<.01?target:n;};

// ── The ball: 32 panels and a turning orientation ───────────────────────────────────────────────────────────────────────
export type V3=[number,number,number];
export type Quat=[number,number,number,number];// w, x, y, z
export const PANELS=buildPanels();
export const PIECES:Record<PanelKind,{name:string;sides:number;total:number}>={pent:{name:'black pentagon',sides:5,total:12},hex:{name:'white hexagon',sides:6,total:20}};
const qmul=(a:Quat,b:Quat):Quat=>[a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3],a[0]*b[1]+a[1]*b[0]+a[2]*b[3]-a[3]*b[2],a[0]*b[2]-a[1]*b[3]+a[2]*b[0]+a[3]*b[1],a[0]*b[3]+a[1]*b[2]-a[2]*b[1]+a[3]*b[0]];
const qnorm=(q:Quat):Quat=>{const l=Math.hypot(...q)||1;return [q[0]/l,q[1]/l,q[2]/l,q[3]/l];};
export function rotate(q:Quat,v:readonly number[]):V3{const p=qmul(qmul(q,[0,v[0],v[1],v[2]]),[q[0],-q[1],-q[2],-q[3]]);return [p[1],p[2],p[3]];}
/** The rotation that turns unit vector a onto unit vector b. */
export function between(a:V3,b:V3):Quat{const d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 if(d<-.9999)return [0,0,1,0];
 const c:V3=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];return qnorm([1+d,c[0],c[1],c[2]]);}
export function slerp(a:Quat,b:Quat,t:number):Quat{let d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];let B=b;if(d<0){d=-d;B=[-b[0],-b[1],-b[2],-b[3]];}
 if(d>.9995)return qnorm(a.map((x,i)=>x+(B[i]-x)*t) as Quat);
 const th=Math.acos(d),s=Math.sin(th);return a.map((x,i)=>x*Math.sin((1-t)*th)/s+B[i]*Math.sin(t*th)/s) as Quat;}
/** A turn about an axis (radians). */
export const axisQ=(ax:V3,ang:number):Quat=>{const l=Math.hypot(...ax)||1,s=Math.sin(ang/2);return [Math.cos(ang/2),ax[0]/l*s,ax[1]/l*s,ax[2]/l*s];};
export const compose=qmul;
/** The front of the ball as the camera sees it (towards the viewer, a little up). */
export const FRONT:V3=(()=>{const v:V3=[0,.18,1];const l=Math.hypot(...v);return [v[0]/l,v[1]/l,v[2]/l];})();
export const facing=(q:Quat,i:number)=>rotate(q,PANELS[i].c);
/** The orientation that brings panel i to the front, starting from q (the shortest turn). */
export const bringToFront=(q:Quat,i:number)=>qnorm(qmul(between(facing(q,i),FRONT),q));
/** The next gap to stitch: the empty panel nearest the front (so the ball turns a little each time). */
export function nextGap(q:Quat,done:ReadonlySet<number>):number|null{let best:number|null=null,bz=-9;
 PANELS.forEach((p,i)=>{if(done.has(i))return;const v=facing(q,i),z=v[0]*FRONT[0]+v[1]*FRONT[1]+v[2]*FRONT[2];if(z>bz){bz=z;best=i;}});return best;}
/** A stitch: the right shape goes in; the wrong one is refused with the reason. */
export function stitch(gap:number,piece:PanelKind){const want=PANELS[gap].kind;
 return want===piece?{ok:true as const,say:`${PIECES[piece].sides} sides`}:{ok:false as const,say:`That gap has ${PIECES[want].sides} sides. It needs a ${PIECES[want].name}.`};}
export const counts=(done:ReadonlySet<number>)=>{let pent=0,hex=0;done.forEach(i=>{if(PANELS[i].kind==='pent')pent++;else hex++;});return {pent,hex,total:pent+hex};};
export const START_Q:Quat=bringToFront([1,0,0,0],0);

/** The ball as flat screen paths (centre cx, cy, radius r px): every panel facing the viewer, back to front, with its light. */
export type BallPanel={i:number;kind:PanelKind;d:string;z:number;light:number};
const L:V3=(()=>{const v:V3=[-.5,.62,.6];const l=Math.hypot(...v);return [v[0]/l,v[1]/l,v[2]/l];})();
const r1=(n:number)=>Math.round(n*10)/10;
export function ballPanels(q:Quat,cx:number,cy:number,r:number):BallPanel[]{
 const out:BallPanel[]=[];
 PANELS.forEach((p,i)=>{const c=rotate(q,p.c);if(c[2]<-.05)return;
  const pts=p.pts.map(s=>{const v=rotate(q,s);let x=v[0],y=v[1];if(v[2]<0){const l=Math.hypot(x,y)||1;x/=l;y/=l;}return `${r1(cx+x*r)} ${r1(cy-y*r)}`;});
  out.push({i,kind:p.kind,d:'M'+pts.join('L')+'Z',z:c[2],light:c[0]*L[0]+c[1]*L[1]+c[2]*L[2]});});
 return out.sort((a,b)=>a.z-b.z);
}

// ── On air: the pretend match ───────────────────────────────────────────────────────────────────────────────────────────
export type BallKind='leather'|'telstar';
export type Picture='bw'|'colour';
export const HALF_S=20,STEPS=8,PLAYERS=6;
/** The play area (metres): x 0 → 12 along the pitch, y 0 → 8 across it. */
export const FIELD={x0:0,x1:12,y0:0,y1:8} as const;
type Seg={t0:number;t1:number;from:number;to:number;apex:number};
export type Match={seed:number;way:[number,number][][];segs:Seg[]};
/** A small seeded random (mulberry32): both halves replay the same match. */
export function rng(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
/** The match script: every player drifts between waypoints (one every 2 s) and the ball is passed about. */
export function match(seed=1970):Match{
 const r=rng(seed),way:[number,number][][]=[];
 for(let p=0;p<PLAYERS;p++){const list:[number,number][]=[];for(let k=0;k<=HALF_S/2+1;k++)list.push([1+r()*10,.8+r()*6.4]);way.push(list);}
 const segs:Seg[]=[];let t=.6,holder=0;
 while(t<HALF_S){const hold=.35+r()*.5;let to=holder;while(to===holder)to=Math.floor(r()*PLAYERS);const dur=.75+r()*.6;
  segs.push({t0:t+hold,t1:t+hold+dur,from:holder,to,apex:.2+r()*1.4});t+=hold+dur;holder=to;}
 return {seed,way,segs};
}
export function playerAt(m:Match,p:number,t:number){const w=m.way[p],k=clamp(Math.floor(t/2),0,w.length-2),u=easeOut(clamp(t/2-k,0,1));
 return {x:lerp(w[k][0],w[k+1][0],u),y:lerp(w[k][1],w[k+1][1],u),moving:Math.hypot(w[k+1][0]-w[k][0],w[k+1][1]-w[k][1])>.6&&u<.98};}
/** Where the ball is at time t (feet of the holder, or in flight between two players). z in metres. */
export function ballAt(m:Match,t:number){
 const seg=m.segs.find(s=>t>=s.t0&&t<s.t1);
 if(seg){const u=(t-seg.t0)/(seg.t1-seg.t0),a=playerAt(m,seg.from,seg.t0),b=playerAt(m,seg.to,seg.t1);return {x:lerp(a.x+.35,b.x+.35,u),y:lerp(a.y+.2,b.y+.2,u),z:4*seg.apex*u*(1-u),flying:true,holder:-1};}
 const last=[...m.segs].reverse().find(s=>s.t1<=t),h=last?last.to:0,p=playerAt(m,h,t);return {x:p.x+.35,y:p.y+.2,z:0,flying:false,holder:h};}
/** Reduced motion: the still frames to tap (the middle of eight passes). */
export const stillTimes=(m:Match)=>{const n=Math.min(STEPS,m.segs.length),pick=Array.from({length:n},(_,k)=>m.segs[Math.floor(k*m.segs.length/n)]);return pick.map(s=>s.t0+(s.t1-s.t0)*.45);};

/** The viewfinder: a screen-shaped frame (px) sized from the play area, never smaller than a thumb can steer. */
export const frameBox=(W:number,H:number)=>({w:Math.round(clamp(Math.min(W,H*1.6)*.26,120,340)),h:Math.round(clamp(Math.min(W,H*1.6)*.26,120,340)*.74)});
export const inFrame=(aim:readonly [number,number],ball:readonly [number,number],box:{w:number;h:number})=>Math.abs(ball[0]-aim[0])<=box.w/2-4&&Math.abs(ball[1]-aim[1])<=box.h/2-4;
/** A tap on a still frame finds the ball when it lands within this many px (scaled by the stage, never under 28). */
export const tapHit=(ballPx:number)=>Math.max(28,ballPx*2.6);
export const pct=(onAir:number,total:number)=>total>0?Math.round(onAir/total*100):0;
export function verdict(p:number){return p>=80?'Crystal clear':p>=60?'Good pictures':p>=35?'Hard to follow':'Lost in the grey';}
