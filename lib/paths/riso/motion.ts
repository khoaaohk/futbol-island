/** Riso engine — motion, easing and seeded randomness.
 * Everything here is a pure function of its inputs. Nothing keeps state and
 * nothing reads a clock, so the same time always produces the same drawing. */
import type {Sheet} from './sheet';
export type Pt=[number,number];
export const TAU=Math.PI*2;
export const clamp=(v:number,a=0,b=1)=>v<a?a:v>b?b:v;
export const lerp=(a:number,b:number,t:number)=>t>=1?b:a+(b-a)*t;
/** twos: a time snapped to the 12 Hz grid. Pose drawn objects with twos(t); sample cameras and passages with t. */
export const twos=(t:number)=>Math.floor(t*12+1e-6)/12;
/** frame index on the twos grid — use it to reseed marks only while an object moves. */
export const twosIndex=(t:number)=>Math.floor(t*12+1e-6);

// ---------------- seeded randomness ----------------
/** rng(seed) → a function returning 0..1. Math.random is banned in stories: it makes textures boil. */
export function rng(seed:number){let a=(seed*1000003)>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
/** hash(k, seed): one integer → 0..1, no state. */
export function hash(k:number,seed=0){let a=(Math.imul(k|0,0x9E3779B1)+Math.imul((seed*4096)|0,0x85EBCA77))|0;a^=a>>>15;a=Math.imul(a,0x2C1B3C6D);a^=a>>>12;a=Math.imul(a,0x297A2D39);a^=a>>>15;return(a>>>0)/4294967296;}
/** noise1(x, seed): smooth 1D value noise −1..1, one bump per unit of x. */
export function noise1(x:number,seed=1){const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return lerp(hash(i,seed)*2-1,hash(i+1,seed)*2-1,u);}
/** drift: two-octave organic wander in time, about −amp..amp. */
export const drift=(t:number,seed=1,amp=1,freq=.5)=>amp*(.7*noise1(t*freq,seed)+.3*noise1(t*freq*2.7+11,seed+3));

// ---------------- easing ----------------
export type Ease=(t:number)=>number;
export const easeIO:Ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export const ease=easeIO;
export const easeOut:Ease=t=>1-Math.pow(1-t,3);
export const easeIn:Ease=t=>t*t*t;
export const easeOutQuint:Ease=t=>1-Math.pow(1-t,5);
export const easeInOutSine:Ease=t=>-(Math.cos(Math.PI*t)-1)/2;
export const easeOutBack:Ease=t=>{const s=1.70158;return 1+(s+1)*Math.pow(t-1,3)+s*Math.pow(t-1,2);};
export const easeInBack:Ease=t=>{const s=1.70158;return(s+1)*t*t*t-s*t*t;};
export const linear:Ease=t=>t;
/** sm(a,b,t): 0..1 between times a and b. */
export const sm=(a:number,b:number,t:number,e:Ease=easeIO)=>e(clamp((t-a)/(b-a)));

// ---------------- keys ----------------
/** A key is [time, value, value, ..., ease?]. An ease given as the last element eases the segment that starts at that key. */
export type Key=(number|Ease)[];
/** A key's values: its numbers after the first (the time). */
const vals=(k:Key)=>{const o:number[]=[];let first=true;for(let i=0;i<k.length;i++){const v=k[i];if(typeof v!=='number')continue;if(first){first=false;continue;}o.push(v);}return o;};
// Performance (card films, Sep 26 2026): key()/keyPath() run hundreds of times a frame and used to re-pad every key list on every call
// (padKeys + vals: ~5 arrays per key per call, up to 13% of a film's frame and most of its garbage). They now read the padded values in
// place for the usual "clean" keys ([time, v…, ease?]) — padAt() returns exactly what padKeys would have put there — and fall back to
// the original padded path for anything else. Results are identical to the last bit (tests/riso-motion-keys.cjs).
/** values count of a clean key ([time, v…, ease?]: numbers, then at most one final ease); −1 for anything else */
function cleanCount(k:Key){const n=k.length;if(!n||typeof k[0]!=='number')return -1;const end=typeof k[n-1]==='function'?n-1:n;for(let i=1;i<end;i++)if(typeof k[i]!=='number')return -1;return end-1;}
/** value j of key k as padKeys(K, d) would store it: its own value, else the default, else the previous key's (padded) value, else 0 */
function padAt(K:Key[],k:number,j:number,d?:number[]):number{for(;k>=0;k--){const x=K[k];if(j<cleanCount(x))return x[1+j] as number;const dv=d?.[j];if(dv!=null)return dv;}return 0;}
/** values per key after padding (max own count and defaults), or −1 when a key is not clean */
function padWidth(K:Key[],d?:number[]){let m=d?d.length:0;for(let k=0;k<K.length;k++){const c=cleanCount(K[k]);if(c<0)return -1;if(c>m)m=c;}return m;}
function padRow(K:Key[],k:number,m:number,d?:number[]){const o:number[]=new Array(m);for(let j=0;j<m;j++)o[j]=padAt(K,k,j,d);return o;}
/** key(t, keys, ease): each segment eases between its neighbours. One value in → number; several → array. */
export function key(t:number,K:Key[],e?:Ease):number;
export function key(t:number,K:Key[],e:Ease,many:true):number[];
export function key(t:number,K0:Key[],e:Ease=easeIO,many?:true):number|number[]{
 const N=K0.length,M=N?padWidth(K0):-1;if(M<0)return keyPadded(t,K0,e,many);
 const one=M===1&&!many;
 if(t<=(K0[0][0] as number))return one?padAt(K0,0,0):padRow(K0,0,M);
 for(let k=0;k+1<N;k++){const t0=K0[k][0] as number,t1=K0[k+1][0] as number;if(t<t1){const last=K0[k][K0[k].length-1],f=typeof last==='function'?last:e,u=f(clamp((t-t0)/(t1-t0)));
  if(one)return lerp(padAt(K0,k,0),padAt(K0,k+1,0),u);const o:number[]=new Array(M);for(let j=0;j<M;j++)o[j]=lerp(padAt(K0,k,j),padAt(K0,k+1,j),u);return o;}}
 return one?padAt(K0,N-1,0):padRow(K0,N-1,M);
}
/** the original key(): pads the keys first (any key shape) */
function keyPadded(t:number,K0:Key[],e:Ease,many?:true):number|number[]{
 const K=padKeys(K0),first=vals(K[0]),one=first.length===1&&!many,out=(v:number[])=>one?v[0]:v;
 if(t<=(K[0][0] as number))return out(first);
 for(let k=0;k+1<K.length;k++){const t0=K[k][0] as number,t1=K[k+1][0] as number;if(t<t1){const a=vals(K[k]),b=vals(K[k+1]),last=K[k][K[k].length-1],f=typeof last==='function'?last:e,u=f(clamp((t-t0)/(t1-t0)));return out(a.map((x,n)=>lerp(x,b[n],u)));}}
 return out(vals(K[K.length-1]));
}
/** padKeys: make every key carry the same number of values (missing trailing components take `defaults`, e.g. zoom 1, rot 0), keeping a per-key ease. */
export function padKeys(K:Key[],defaults:number[]=[]):Key[]{
 let n=defaults.length;const V=new Array<number[]>(K.length);for(let k=0;k<K.length;k++){const v=vals(K[k]);V[k]=v;if(v.length>n)n=v.length;}
 let prev:Key|null=null;const res=new Array<Key>(K.length);
 for(let k=0;k<K.length;k++){const src=K[k],v=V[k],last=src[src.length-1],out:Key=[src[0] as number];for(let i=0;i<v.length;i++)out.push(v[i]);
  for(let i=v.length;i<n;i++)out.push(defaults[i]??(prev?prev[1+i]:undefined)??0);prev=out;if(typeof last==='function')out.push(last);res[k]=out;}
 return res;}
/** keyPath: the same keys through a Catmull-Rom curve so a camera does not kink at a key; the ease spans the whole journey. */
export function keyPath(t:number,K0:Key[],e:Ease=easeInOutSine):number[]{return keyPathOf(t,K0,e);}
/** keyPath(t, padKeys(K0, d), e) without building the padded keys */
function keyPathOf(t:number,K0:Key[],e:Ease,d?:number[]):number[]{
 const n=K0.length,M=n?padWidth(K0,d):-1;if(M<0||n<3)return keyPathPadded(t,d?padKeys(K0,d):K0,e);
 const t0=K0[0][0] as number,t1=K0[n-1][0] as number,tm=t0+e(clamp((t-t0)/(t1-t0)))*(t1-t0);if(tm>=t1)return padRow(K0,n-1,M,d);
 let k=0;while(k+1<n-1&&tm>=(K0[k+1][0] as number))k++;
 const u=clamp((tm-(K0[k][0] as number))/((K0[k+1][0] as number)-(K0[k][0] as number))),i0=clamp(k-1,0,n-1),i1=clamp(k,0,n-1),i2=clamp(k+1,0,n-1),i3=clamp(k+2,0,n-1),u2=u*u,u3=u2*u,o:number[]=new Array(M);
 for(let j=0;j<M;j++){const p0=padAt(K0,i0,j,d),p1=padAt(K0,i1,j,d),p2=padAt(K0,i2,j,d),p3=padAt(K0,i3,j,d);o[j]=.5*(2*p1+(p2-p0)*u+(2*p0-5*p1+4*p2-p3)*u2+(3*p1-p0-3*p2+p3)*u3);}
 return o;
}
/** the original keyPath(): pads the keys first (any key shape) */
function keyPathPadded(t:number,K0:Key[],e:Ease):number[]{
 const K=padKeys(K0),n=K.length,P=(i:number)=>vals(K[clamp(i,0,n-1)]);if(n<3)return key(t,K,e,true);
 const t0=K[0][0] as number,t1=K[n-1][0] as number,tm=t0+e(clamp((t-t0)/(t1-t0)))*(t1-t0);if(tm>=t1)return P(n-1);
 let k=0;while(k+1<n-1&&tm>=(K[k+1][0] as number))k++;
 const u=clamp((tm-(K[k][0] as number))/((K[k+1][0] as number)-(K[k][0] as number))),p0=P(k-1),p1=P(k),p2=P(k+1),p3=P(k+2),u2=u*u,u3=u2*u;
 return p1.map((_,j)=>.5*(2*p1[j]+(p2[j]-p0[j])*u+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*u2+(3*p1[j]-p0[j]-3*p2[j]+p3[j])*u3));
}
const CAM_DEFAULTS=[0,0,1,0];
/** camKeys(sheet, t, [[t, x, y, zoom, rot?], ...]): the camera on a smooth curve; call with continuous t. Returns [x,y,zoom,rot]. */
export function camKeys(sheet:Sheet,t:number,K:Key[],e:Ease=easeInOutSine){const v=keyPathOf(t,K,e,CAM_DEFAULTS);const x=v[0]||0,y=v[1]||0,z=Number.isFinite(v[2])?v[2]:1,r=Number.isFinite(v[3])?v[3]:0;sheet.camera(x,y,z,r);return[x,y,z,r];}

// ---------------- principles as pure functions of time ----------------
/** anticipate(a,b,t): 0..1 between a and b with a small move the other way first (back = fraction, hold = share of time winding up). */
export function anticipate(a:number,b:number,t:number,o:{back?:number;hold?:number;e?:Ease}={}){const{back=.12,hold=.3,e=easeIO}=o,u=clamp((t-a)/(b-a));return u<hold?-back*Math.sin(u/hold*Math.PI/2):lerp(-back,1,e((u-hold)/(1-hold)));}
/** settle(t,t0): a damped wobble after t0, zero before it. Add it to whatever just stopped. */
export function settle(t:number,t0=0,o:{amp?:number;freq?:number;decay?:number;phase?:number}={}){const{amp=1,freq=3,decay=4,phase=0}=o,u=t-t0;return u<=0?0:amp*Math.exp(-decay*u)*Math.sin(TAU*freq*u+phase);}
/** spring(t): step response 0→1 with overshoot. */
export function spring(t:number,freq=2.4,damp=.55){if(t<=0)return 0;const w=TAU*freq;if(damp>=1)return 1-(1+w*t)*Math.exp(-w*t);const wd=w*Math.sqrt(1-damp*damp);return 1-Math.exp(-damp*w*t)*(Math.cos(wd*t)+damp*w/wd*Math.sin(wd*t));}
/** arc(a,b,u,lift): a point on a parabola between a and b rising by lift at the middle (up is −y). */
export const arc=(a:Pt,b:Pt,u:number,lift=80):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)-lift*4*u*(1-u)];
/** squash(k): [sx,sy] volume-preserving stretch. k>0 stretches along y (in the air), k<0 squashes (on landing). Scale about the contact point. */
export const squash=(k:number):Pt=>[1/(1+k),1+k];
/** breathe(t, period): a slow 0..1 cycle with a quick rise and a long fall — use for "breathe": scale the whole composition by 1+.04*breathe(t). */
export const breathe=(t:number,period=2.6,phase=0)=>{const u=((t/period+phase)%1+1)%1;return u<.4?Math.sin(u/.4*Math.PI/2):Math.cos((u-.4)/.6*Math.PI/2);};
/** smearPose(points, dir, amount, pivot): directional smear for a fast move — points are stretched along `dir` (radians) by `amount` units,
 * more the further they sit behind the pivot. Use for "rush": draw the smeared pose for 2–3 frames, then settle(). */
export function smearPose(pts:Pt[],dir:number,amount:number,pivot:Pt):Pt[]{const dx=Math.cos(dir),dy=Math.sin(dir);return pts.map(p=>{const back=-((p[0]-pivot[0])*dx+(p[1]-pivot[1])*dy);const k=back>0?amount*Math.min(1,back/120+.35):amount*.25;return[p[0]-dx*k,p[1]-dy*k];});}
/** pressPts(points, dir, amount, wall): deform a shape being pushed toward a wall — vertices in front of the wall plane are pushed back
 * (they sag against it) and the sides bulge out, so a pushed shape crumples instead of sliding. dir = push direction (radians),
 * wall = distance from the shape centre to the wall along dir, amount 0..1. Use for "pressure". */
export function pressPts(pts:Pt[],dir:number,amount:number,wall:number,centre?:Pt):Pt[]{const c=centre??[pts.reduce((s,p)=>s+p[0],0)/pts.length,pts.reduce((s,p)=>s+p[1],0)/pts.length],dx=Math.cos(dir),dy=Math.sin(dir);
 return pts.map(p=>{const rx=p[0]-c[0],ry=p[1]-c[1],d=rx*dx+ry*dy,side=-rx*dy+ry*dx;const over=Math.max(0,d-wall*(1-amount*.35));const push=over*amount+Math.max(0,d)*amount*.25;const bulge=(1+amount*.35*Math.max(0,1-Math.abs(d)/wall))*side-side;return[p[0]-dx*push-dy*bulge,p[1]-dy*push+dx*bulge];});}
/** follow(t, target, lag, overshoot): a camera that trails a moving target with lag (s) and overshoots its stops. Pure: samples target(t) twice.
 * Use for "look"/"follow": camera(...follow(t, tt=>ballAt(tt), .18, .35)). */
export function follow(t:number,target:(t:number)=>Pt,lag=.18,overshoot=.3):Pt{const a=target(Math.max(0,t-lag)),b=target(Math.max(0,t-lag*2));return[a[0]+(a[0]-b[0])*overshoot,a[1]+(a[1]-b[1])*overshoot];}
/** lean(velocity, k): a camera/prop rotation that leans into travel direction — rot = lean(vx, .0008). */
export const lean=(v:number,k=.0008,max=.12)=>clamp(v*k,-max,max);

// ---------------- geometry ----------------
export function ellPts(cx:number,cy:number,rx:number,ry:number,rot=0,n=40):Pt[]{const p:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,x=rx*Math.cos(a),y=ry*Math.sin(a);p.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return p;}
/** blob: an ellipse that is not quite one — low-frequency seeded radius variation. Bodies, stones, leaves, clouds. */
export function blob(cx:number,cy:number,rx:number,ry:number,seed=1,o:{amp?:number;rot?:number;n?:number}={}):Pt[]{const{amp=.05,rot=0,n=40}=o,r=rng(seed),k1=2+(r()*2|0),k2=k1+1+(r()*2|0),p1=r()*TAU,p2=r()*TAU,p3=r()*TAU,p:Pt[]=[];
 for(let i=0;i<n;i++){const a=i/n*TAU,m=1+amp*(.6*Math.sin(k1*a+p1)+.3*Math.sin(k2*a+p2)+.15*Math.sin((k2+2)*a+p3)),x=rx*m*Math.cos(a),y=ry*m*Math.sin(a);p.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return p;}
/** torn: a rectangle with torn paper edges (seeded noise along every side). amp in units. */
export function torn(x:number,y:number,w:number,h:number,seed=1,amp=14,step=28):Pt[]{const corners:Pt[]=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],out:Pt[]=[];let s=0;
 for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4],m=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/step)),nx=-(b[1]-a[1]),ny=b[0]-a[0],l=Math.hypot(nx,ny)||1;
  for(let k=0;k<m;k++){const u=k/m,d=amp*(.7*noise1(s/60+3,seed+i)+.3*noise1(s/17+40,seed+i+9));out.push([lerp(a[0],b[0],u)+nx/l*d,lerp(a[1],b[1],u)+ny/l*d]);s+=step;}}
 return out;}
/** smoothPts: a polyline into a dense Catmull-Rom curve; corners sharper than `corner` radians stay corners. */
export function smoothPts(pts:Pt[],close=false,step=6,corner=.8):Pt[]{const n=pts.length;if(n<2)return pts.map(p=>[p[0],p[1]] as Pt);const P=(i:number)=>close?pts[((i%n)+n)%n]:pts[clamp(i,0,n-1)];
 const sharp:boolean[]=[];for(let i=0;i<n;i++){if(!close&&(i===0||i===n-1)){sharp.push(true);continue;}const a=P(i-1),b=P(i),d=P(i+1);let t=Math.abs(Math.atan2(d[1]-b[1],d[0]-b[0])-Math.atan2(b[1]-a[1],b[0]-a[0]));if(t>Math.PI)t=TAU-t;sharp.push(t>corner);}
 const out:Pt[]=[],segs=close?n:n-1;
 for(let i=0;i<segs;i++){const p1=P(i),p2=P(i+1),c1=sharp[i%n],c2=sharp[(i+1)%n],p0:Pt=c1?[2*p1[0]-p2[0],2*p1[1]-p2[1]]:P(i-1),p3:Pt=c2?[2*p2[0]-p1[0],2*p2[1]-p1[1]]:P(i+2),m=Math.max(1,Math.round(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step));
  for(let k=0;k<m;k++){const t=k/m,t2=t*t,t3=t2*t;out.push([.5*(2*p1[0]+(p2[0]-p0[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(3*p1[0]-p0[0]-3*p2[0]+p3[0])*t3),.5*(2*p1[1]+(p2[1]-p0[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(3*p1[1]-p0[1]-3*p2[1]+p3[1])*t3)]);}}
 if(!close)out.push([pts[n-1][0],pts[n-1][1]]);return out;}
/** wob(points, amp, seed): the hand does not shake per point, it wanders — a slow coherent wobble along the stroke (seamless on closed shapes). Returns the displaced points. */
export function wob(pts:Pt[],amp:number,seed:number,close=false,o:{smooth?:boolean;step?:number;corner?:number;freq?:number}={}):Pt[]{const{smooth=true,step=6,corner=.8,freq=1}=o;if(pts.length<2)return pts;
 const q=smooth?smoothPts(pts,close,step,corner):pts,n=q.length,s=[0];for(let i=1;i<n;i++)s.push(s[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));
 const L=close?s[n-1]+Math.hypot(q[0][0]-q[n-1][0],q[0][1]-q[n-1][1]):s[n-1]||1,r=rng(seed),ph=[r()*TAU,r()*TAU,r()*TAU,r()*100];
 let off:(i:number)=>number;if(close){const k1=Math.max(2,Math.round(L/140*freq)),k2=k1*2+1,k3=k2*2+1;off=i=>amp*(.42*Math.sin(k1*TAU*s[i]/L+ph[0])+.26*Math.sin(k2*TAU*s[i]/L+ph[1])+.14*Math.sin(k3*TAU*s[i]/L+ph[2]));}
 else{const sc=freq/90;off=i=>amp*(.55*noise1(s[i]*sc+ph[3],seed)+.28*noise1(s[i]*sc*2.6+ph[3]*3,seed+7));}
 const out:Pt[]=new Array(n);for(let i=0;i<n;i++){const a=q[i>0?i-1:(close?n-1:0)],b=q[i<n-1?i+1:(close?0:n-1)];const nx=a[1]-b[1],ny=b[0]-a[0],l=Math.hypot(nx,ny)||1,d=off(i);out[i]=[q[i][0]+nx/l*d,q[i][1]+ny/l*d];}
 return out;}
/** Rough world-space extent of paths built by the engine helpers (polyPath, circlePath, rectPath, ribbon, crescent): the sheet's
 * "dots off the action" mode prints lines and small shapes (a ball, a boot, an arrow) as clean flat tints and keeps a fine screen for
 * large fields. `line` marks a ribbon (a drawn stroke of any length). Paths built by hand have no entry and count as fields. */
export type PathExtent={w:number;h:number;line:boolean};
export const pathExtent=new WeakMap<Path2D,PathExtent>();
/** polyPath / curvePath: points → Path2D. */
export function polyPath(pts:Pt[],close=true){const p=new Path2D();let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(let i=0;i<pts.length;i++){const q=pts[i];if(i)p.lineTo(q[0],q[1]);else p.moveTo(q[0],q[1]);if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1];}
 if(close)p.closePath();if(pts.length)pathExtent.set(p,{w:x1-x0,h:y1-y0,line:false});return p;}
export const curvePath=(pts:Pt[],close=true,corner=.8)=>polyPath(smoothPts(pts,close,5,corner),close);
export function circlePath(x:number,y:number,r:number){const p=new Path2D();p.arc(x,y,r,0,TAU);pathExtent.set(p,{w:2*Math.abs(r),h:2*Math.abs(r),line:false});return p;}
export function rectPath(x:number,y:number,w:number,h:number){const p=new Path2D();p.rect(x,y,w,h);pathExtent.set(p,{w:Math.abs(w),h:Math.abs(h),line:false});return p;}
/** ribbon: a pressure-varied ink line as one filled polygon (one path op, however long). width in units; pressure 0..1 swells and tapers;
 * taper 0..1 thins the ends; gaps = [[u0,u1],...] leave deliberate breaks (fractions of length). */
export function ribbon(pts:Pt[],width:number,o:{seed?:number;pressure?:number;taper?:number;close?:boolean;wobble?:number;gaps?:[number,number][];step?:number}={}):Path2D{
 const{seed=1,pressure=.5,taper=.7,close=false,wobble=1.4,gaps=[],step=7}=o;const path=new Path2D();if(pts.length<2)return path;
 // Performance (Sep 26 2026): every figure contour is a ribbon, so its centreline (smoothPts → wob) and edges are computed in reused flat
 // buffers instead of ~3 fresh [x,y] arrays per sample. smoothFlat/wobFlat are smoothPts/wob with the same arithmetic in the same order,
 // so the path is identical to the last bit (tests/riso-engine-perf.cjs compares it with the array version).
 let n=smoothFlat(pts,close,step,.8);if(wobble)n=wobFlat(n,wobble,seed,close);if(n<2)return path;
 const q=wobble?flatB:flatA;if(flatS.length<n)flatS=new Float64Array(n*2);const s=flatS;
 s[0]=0;for(let i=1;i<n;i++)s[i]=s[i-1]+Math.hypot(q[2*i]-q[2*i-2],q[2*i+1]-q[2*i-1]);const L=s[n-1]||1,r=rng(seed+31),ph1=r()*TAU,ph2=r()*TAU;
 const wid=(i:number)=>{const u=s[i]/L,tl=Math.max(.06,Math.min(.35,width*4/L)),e=close?1:Math.min(1,u/tl,(1-u)/tl);return Math.max(.6,width*(1-taper*.6*(1-Math.sin(e*Math.PI/2)))*(1+pressure*.28*Math.sin(u*L/55+ph1)+pressure*.12*Math.sin(u*L/17+ph2)));};
 const inGap=(u:number)=>gaps.some(([g0,g1])=>u>=g0&&u<=g1);
 // One run of samples k0..k1 (sample index k%n): the left edge goes straight into the path, the right edge waits in a reused buffer
 // and is traced back.
 const flush=(k0:number,k1:number)=>{if(k1-k0<1)return;const cnt=k1-k0+1;if(ribbonRight.length<cnt*2)ribbonRight=new Float64Array(cnt*4);const R=ribbonRight;
  for(let k=k0;k<=k1;k++){const i=k%n,w=wid(i)/2,a=Math.max(0,i-1),b=Math.min(n-1,i+1),ax=q[2*a+1]-q[2*b+1],ay=q[2*b]-q[2*a],l=Math.hypot(ax,ay)||1,nx=ax/l,ny=ay/l,px=q[2*i],py=q[2*i+1];
   if(k===k0)path.moveTo(px+nx*w,py+ny*w);else path.lineTo(px+nx*w,py+ny*w);R[(k-k0)*2]=px-nx*w;R[(k-k0)*2+1]=py-ny*w;}
  for(let k=cnt-1;k>=0;k--)path.lineTo(R[k*2],R[k*2+1]);path.closePath();};
 {let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(let i=0;i<n;i++){const x=q[2*i],y=q[2*i+1];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}pathExtent.set(path,{w:x1-x0+width,h:y1-y0+width,line:true});}
 const total=close?n+1:n;let start=-1;
 if(!gaps.length)flush(0,total-1);
 else{for(let k=0;k<total;k++){const i=k%n;if(inGap(s[i]/L)){if(start>=0)flush(start,k-1);start=-1;continue;}if(start<0)start=k;}if(start>=0)flush(start,total-1);}
 return path;}
// Flat scratch buffers for ribbon() (xy interleaved). Not re-entrant: nothing ribbon calls draws another ribbon.
let ribbonRight=new Float64Array(512),flatA=new Float64Array(1024),flatB=new Float64Array(1024),flatS=new Float64Array(512),flatSharp=new Uint8Array(256);
const growA=(n:number)=>{if(flatA.length<n){const c=new Float64Array(Math.max(n,flatA.length*2));c.set(flatA);flatA=c;}};
/** smoothPts(pts, close, step, corner) into flatA; returns the point count */
function smoothFlat(pts:Pt[],close:boolean,step:number,corner:number):number{
 const n=pts.length;if(n<2){growA(n*2);for(let i=0;i<n;i++){flatA[2*i]=pts[i][0];flatA[2*i+1]=pts[i][1];}return n;}
 const P=(i:number)=>close?pts[((i%n)+n)%n]:pts[clamp(i,0,n-1)];
 if(flatSharp.length<n)flatSharp=new Uint8Array(n*2);const sharp=flatSharp;
 for(let i=0;i<n;i++){if(!close&&(i===0||i===n-1)){sharp[i]=1;continue;}const a=P(i-1),b=P(i),d=P(i+1);let t=Math.abs(Math.atan2(d[1]-b[1],d[0]-b[0])-Math.atan2(b[1]-a[1],b[0]-a[0]));if(t>Math.PI)t=TAU-t;sharp[i]=t>corner?1:0;}
 let o=0;const segs=close?n:n-1;
 for(let i=0;i<segs;i++){const p1=P(i),p2=P(i+1),c1=sharp[i%n],c2=sharp[(i+1)%n];let p0x:number,p0y:number,p3x:number,p3y:number;
  if(c1){p0x=2*p1[0]-p2[0];p0y=2*p1[1]-p2[1];}else{const q0=P(i-1);p0x=q0[0];p0y=q0[1];}
  if(c2){p3x=2*p2[0]-p1[0];p3y=2*p2[1]-p1[1];}else{const q3=P(i+2);p3x=q3[0];p3y=q3[1];}
  const m=Math.max(1,Math.round(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step));growA((o+m+1)*2);const A=flatA;
  for(let k=0;k<m;k++){const t=k/m,t2=t*t,t3=t2*t;A[2*o]=.5*(2*p1[0]+(p2[0]-p0x)*t+(2*p0x-5*p1[0]+4*p2[0]-p3x)*t2+(3*p1[0]-p0x-3*p2[0]+p3x)*t3);A[2*o+1]=.5*(2*p1[1]+(p2[1]-p0y)*t+(2*p0y-5*p1[1]+4*p2[1]-p3y)*t2+(3*p1[1]-p0y-3*p2[1]+p3y)*t3);o++;}}
 if(!close){growA((o+1)*2);flatA[2*o]=pts[n-1][0];flatA[2*o+1]=pts[n-1][1];o++;}
 return o;}
/** wob(…, {smooth:true}) of the n points already smoothed into flatA, into flatB; returns the point count */
function wobFlat(n:number,amp:number,seed:number,close:boolean):number{
 const q=flatA;if(flatS.length<n)flatS=new Float64Array(n*2);const s=flatS;s[0]=0;for(let i=1;i<n;i++)s[i]=s[i-1]+Math.hypot(q[2*i]-q[2*i-2],q[2*i+1]-q[2*i-1]);
 const L=close?s[n-1]+Math.hypot(q[0]-q[2*n-2],q[1]-q[2*n-1]):s[n-1]||1,r=rng(seed),ph0=r()*TAU,ph1=r()*TAU,ph2=r()*TAU,ph3=r()*100;
 let off:(i:number)=>number;if(close){const k1=Math.max(2,Math.round(L/140*1)),k2=k1*2+1,k3=k2*2+1;off=i=>amp*(.42*Math.sin(k1*TAU*s[i]/L+ph0)+.26*Math.sin(k2*TAU*s[i]/L+ph1)+.14*Math.sin(k3*TAU*s[i]/L+ph2));}
 else{const sc=1/90;off=i=>amp*(.55*noise1(s[i]*sc+ph3,seed)+.28*noise1(s[i]*sc*2.6+ph3*3,seed+7));}
 if(flatB.length<n*2)flatB=new Float64Array(n*4);const B=flatB;
 for(let i=0;i<n;i++){const a=i>0?i-1:(close?n-1:0),b=i<n-1?i+1:(close?0:n-1),nx=q[2*a+1]-q[2*b+1],ny=q[2*b]-q[2*a],l=Math.hypot(nx,ny)||1,d=off(i);B[2*i]=q[2*i]+nx/l*d;B[2*i+1]=q[2*i+1]+ny/l*d;}
 return n;}
/** partial(points, u): the first u (0..1) of a polyline by arc length — for lines that draw themselves. */
export function partial(pts:Pt[],u:number):Pt[]{if(u>=1)return pts;if(u<=0||pts.length<2)return pts.slice(0,1);const s=[0];for(let i=1;i<pts.length;i++)s.push(s[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const L=s[s.length-1]*u,out:Pt[]=[pts[0]];
 for(let i=1;i<pts.length;i++){if(s[i]<=L){out.push(pts[i]);continue;}const f=(L-s[i-1])/(s[i]-s[i-1]||1);out.push([lerp(pts[i-1][0],pts[i][0],f),lerp(pts[i-1][1],pts[i][1],f)]);break;}return out;}
/** along(points, u): position and direction at fraction u of a polyline. */
export function along(pts:Pt[],u:number):{x:number;y:number;a:number}{const s=[0];for(let i=1;i<pts.length;i++)s.push(s[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const L=s[s.length-1]*clamp(u);
 for(let i=1;i<pts.length;i++){if(s[i]>=L||i===pts.length-1){const f=(L-s[i-1])/(s[i]-s[i-1]||1);return{x:lerp(pts[i-1][0],pts[i][0],f),y:lerp(pts[i-1][1],pts[i][1],f),a:Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0])};}}
 return{x:pts[0][0],y:pts[0][1],a:0};}
export const rot=(p:Pt,a:number,cx=0,cy=0):Pt=>{const c=Math.cos(a),s=Math.sin(a),x=p[0]-cx,y=p[1]-cy;return[cx+x*c-y*s,cy+x*s+y*c];};
export const scalePts=(pts:Pt[],sx:number,sy=sx,cx=0,cy=0):Pt[]=>pts.map(p=>[cx+(p[0]-cx)*sx,cy+(p[1]-cy)*sy]);
export const movePts=(pts:Pt[],dx:number,dy:number):Pt[]=>pts.map(p=>[p[0]+dx,p[1]+dy]);
export const rotPts=(pts:Pt[],a:number,cx=0,cy=0):Pt[]=>pts.map(p=>rot(p,a,cx,cy));
