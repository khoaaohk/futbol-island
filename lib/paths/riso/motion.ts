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
const vals=(k:Key)=>k.filter(v=>typeof v==='number').slice(1) as number[];
/** key(t, keys, ease): each segment eases between its neighbours. One value in → number; several → array. */
export function key(t:number,K:Key[],e?:Ease):number;
export function key(t:number,K:Key[],e:Ease,many:true):number[];
export function key(t:number,K0:Key[],e:Ease=easeIO,many?:true):number|number[]{
 const K=padKeys(K0),first=vals(K[0]),one=first.length===1&&!many,out=(v:number[])=>one?v[0]:v;
 if(t<=(K[0][0] as number))return out(first);
 for(let k=0;k+1<K.length;k++){const t0=K[k][0] as number,t1=K[k+1][0] as number;if(t<t1){const a=vals(K[k]),b=vals(K[k+1]),last=K[k][K[k].length-1],f=typeof last==='function'?last:e,u=f(clamp((t-t0)/(t1-t0)));return out(a.map((x,n)=>lerp(x,b[n],u)));}}
 return out(vals(K[K.length-1]));
}
/** padKeys: make every key carry the same number of values (missing trailing components take `defaults`, e.g. zoom 1, rot 0), keeping a per-key ease. */
export function padKeys(K:Key[],defaults:number[]=[]):Key[]{const n=Math.max(...K.map(k=>vals(k).length),defaults.length);let prev:number[]=[];return K.map(k=>{const v=vals(k),last=k[k.length-1],out:Key=[k[0] as number,...v];for(let i=v.length;i<n;i++)out.push(defaults[i]??prev[i]??0);prev=out.slice(1) as number[];if(typeof last==='function')out.push(last);return out;});}
/** keyPath: the same keys through a Catmull-Rom curve so a camera does not kink at a key; the ease spans the whole journey. */
export function keyPath(t:number,K0:Key[],e:Ease=easeInOutSine):number[]{
 const K=padKeys(K0),n=K.length,P=(i:number)=>vals(K[clamp(i,0,n-1)]);if(n<3)return key(t,K,e,true);
 const t0=K[0][0] as number,t1=K[n-1][0] as number,tm=t0+e(clamp((t-t0)/(t1-t0)))*(t1-t0);if(tm>=t1)return P(n-1);
 let k=0;while(k+1<n-1&&tm>=(K[k+1][0] as number))k++;
 const u=clamp((tm-(K[k][0] as number))/((K[k+1][0] as number)-(K[k][0] as number))),p0=P(k-1),p1=P(k),p2=P(k+1),p3=P(k+2),u2=u*u,u3=u2*u;
 return p1.map((_,j)=>.5*(2*p1[j]+(p2[j]-p0[j])*u+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*u2+(3*p1[j]-p0[j]-3*p2[j]+p3[j])*u3));
}
/** camKeys(sheet, t, [[t, x, y, zoom, rot?], ...]): the camera on a smooth curve; call with continuous t. Returns [x,y,zoom,rot]. */
export function camKeys(sheet:Sheet,t:number,K:Key[],e:Ease=easeInOutSine){const v=keyPath(t,padKeys(K,[0,0,1,0]),e);const x=v[0]||0,y=v[1]||0,z=Number.isFinite(v[2])?v[2]:1,r=Number.isFinite(v[3])?v[3]:0;sheet.camera(x,y,z,r);return[x,y,z,r];}

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
/** polyPath / curvePath: points → Path2D. */
export function polyPath(pts:Pt[],close=true){const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));if(close)p.closePath();return p;}
export const curvePath=(pts:Pt[],close=true,corner=.8)=>polyPath(smoothPts(pts,close,5,corner),close);
export function circlePath(x:number,y:number,r:number){const p=new Path2D();p.arc(x,y,r,0,TAU);return p;}
export function rectPath(x:number,y:number,w:number,h:number){const p=new Path2D();p.rect(x,y,w,h);return p;}
/** ribbon: a pressure-varied ink line as one filled polygon (one path op, however long). width in units; pressure 0..1 swells and tapers;
 * taper 0..1 thins the ends; gaps = [[u0,u1],...] leave deliberate breaks (fractions of length). */
export function ribbon(pts:Pt[],width:number,o:{seed?:number;pressure?:number;taper?:number;close?:boolean;wobble?:number;gaps?:[number,number][];step?:number}={}):Path2D{
 const{seed=1,pressure=.5,taper=.7,close=false,wobble=1.4,gaps=[],step=7}=o;const q=wobble?wob(pts,wobble,seed,close,{step}):smoothPts(pts,close,step);const n=q.length,path=new Path2D();if(n<2)return path;
 const s=[0];for(let i=1;i<n;i++)s.push(s[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));const L=s[n-1]||1,r=rng(seed+31),ph1=r()*TAU,ph2=r()*TAU;
 const wid=(i:number)=>{const u=s[i]/L,tl=Math.max(.06,Math.min(.35,width*4/L)),e=close?1:Math.min(1,u/tl,(1-u)/tl);return Math.max(.6,width*(1-taper*.6*(1-Math.sin(e*Math.PI/2)))*(1+pressure*.28*Math.sin(u*L/55+ph1)+pressure*.12*Math.sin(u*L/17+ph2)));};
 const normal=(i:number):Pt=>{const a=q[Math.max(0,i-1)],b=q[Math.min(n-1,i+1)],nx=a[1]-b[1],ny=b[0]-a[0],l=Math.hypot(nx,ny)||1;return[nx/l,ny/l];};
 const inGap=(u:number)=>gaps.some(([g0,g1])=>u>=g0&&u<=g1);
 let run:number[]=[];const flush=()=>{if(run.length<2){run=[];return;}const left:Pt[]=[],right:Pt[]=[];for(const i of run){const w=wid(i)/2,[nx,ny]=normal(i);left.push([q[i][0]+nx*w,q[i][1]+ny*w]);right.push([q[i][0]-nx*w,q[i][1]-ny*w]);}
  path.moveTo(left[0][0],left[0][1]);for(let k=1;k<left.length;k++)path.lineTo(left[k][0],left[k][1]);for(let k=right.length-1;k>=0;k--)path.lineTo(right[k][0],right[k][1]);path.closePath();run=[];};
 const total=close?n+1:n;for(let k=0;k<total;k++){const i=k%n;if(inGap(s[i]/L)){flush();continue;}run.push(i);}flush();
 return path;}
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
