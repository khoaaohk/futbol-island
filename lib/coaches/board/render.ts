import type {ArrowKind} from './types';

/**
 * Marker-pen drawing for the tactics board, in screen pixels. Pure string builders: the same functions draw the live board
 * (SVG paths) and the PNG export, so they always match.
 *
 * The hand-drawn feel is a small, smooth wobble across the line that is tied to the curve parameter and seeded by the
 * arrow's id: it never shimmers while a chip (and its arrow) moves, and the same arrow always looks the same.
 */
export type P=[number,number];
const f=(n:number)=>Math.round(n*10)/10;
export function seeded(seed:string){let h=2166136261;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}
 return ()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return ((h>>>0)%10000)/10000;};}
export const quadAt=(p0:P,c:P,p2:P,t:number):P=>{const a=(1-t)*(1-t),b=2*(1-t)*t,d=t*t;return [a*p0[0]+b*c[0]+d*p2[0],a*p0[1]+b*c[1]+d*p2[1]];};
export const quadTangent=(p0:P,c:P,p2:P,t:number):P=>[2*(1-t)*(c[0]-p0[0])+2*t*(p2[0]-c[0]),2*(1-t)*(c[1]-p0[1])+2*t*(p2[1]-c[1])];
/** Arc length of a quadratic, by sampling. */
export function quadLength(p0:P,c:P,p2:P,n=16){let L=0,prev=p0;for(let i=1;i<=n;i++){const q=quadAt(p0,c,p2,i/n);L+=Math.hypot(q[0]-prev[0],q[1]-prev[1]);prev=q;}return L;}
/** The parameter t at which `dist` px of the curve has been travelled from the start (dist<0: from the end). */
export function tAtDistance(p0:P,c:P,p2:P,dist:number,n=24):number{
 const pts=[0];let prev=p0;for(let i=1;i<=n;i++){const q=quadAt(p0,c,p2,i/n);pts.push(pts[i-1]+Math.hypot(q[0]-prev[0],q[1]-prev[1]));prev=q;}
 const L=pts[n],d=dist<0?L+dist:dist;if(d<=0)return 0;if(d>=L)return 1;
 let i=1;while(pts[i]<d)i++;return (i-1+(d-pts[i-1])/(pts[i]-pts[i-1]))/n;
}
/** Trims a quadratic by `a` px at the start and `b` px at the end (for arrows attached to chips), keeping its shape. */
export function trimQuad(p0:P,c:P,p2:P,a:number,b:number):[P,P,P]|null{
 const L=quadLength(p0,c,p2);if(L<=a+b+4)return null;
 const t0=a>0?tAtDistance(p0,c,p2,a):0,t1=b>0?tAtDistance(p0,c,p2,-b):1;
 // The sub-curve between t0 and t1 of a quadratic is a quadratic: its control is the tangents' intersection (blossom).
 const s=quadAt(p0,c,p2,t0),e=quadAt(p0,c,p2,t1),mc:P=[(1-t0)*((1-t1)*p0[0]+t1*c[0])+t0*((1-t1)*c[0]+t1*p2[0]),(1-t0)*((1-t1)*p0[1]+t1*c[1])+t0*((1-t1)*c[1]+t1*p2[1])];
 return [s,mc,e];
}
/** Catmull-Rom through the points, as cubic Béziers (smooth freehand). */
export function smoothPath(pts:P[],closed=false):string{
 if(pts.length<2)return '';
 if(pts.length===2)return `M${f(pts[0][0])} ${f(pts[0][1])}L${f(pts[1][0])} ${f(pts[1][1])}`;
 const n=pts.length,at=(i:number)=>closed?pts[(i+n)%n]:pts[Math.max(0,Math.min(n-1,i))];
 let d=`M${f(pts[0][0])} ${f(pts[0][1])}`;const last=closed?n:n-1;
 for(let i=0;i<last;i++){const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2);
  d+=`C${f(p1[0]+(p2[0]-p0[0])/6)} ${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)} ${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])} ${f(p2[1])}`;}
 return closed?d+'Z':d;
}
/** Ramer–Douglas–Peucker simplification (keeps freehand strokes small for storage and share links). */
export function simplify(pts:P[],eps:number):P[]{
 if(pts.length<3)return pts.slice();
 const keep=new Uint8Array(pts.length);keep[0]=keep[pts.length-1]=1;const stack:[number,number][]=[[0,pts.length-1]];
 while(stack.length){const [a,b]=stack.pop()!;let idx=-1,best=eps;const [ax,ay]=pts[a],[bx,by]=pts[b],len=Math.hypot(bx-ax,by-ay)||1e-9;
  for(let i=a+1;i<b;i++){const d=Math.abs((bx-ax)*(ay-pts[i][1])-(ax-pts[i][0])*(by-ay))/len;if(d>best){best=d;idx=i;}}
  if(idx>=0){keep[idx]=1;stack.push([a,idx],[idx,b]);}}
 return pts.filter((_,i)=>keep[i]);
}
/**
 * One marker arrow: the body path (solid pass, dashed run, wavy dribble) and an open arrowhead, both with the seeded
 * wobble. `w` is the marker width in px.
 */
export function arrowPaths(kind:ArrowKind,p0:P,c:P,p2:P,seed:string,w=3):{body:string;head:string;dash:string|null}{
 const rnd=seeded(seed),L=quadLength(p0,c,p2),n=Math.max(8,Math.min(90,Math.round(L/(kind==='dribble'?2.2:6))));
 const amp=Math.min(1.4,L/90)*w/3,ph=[rnd()*6.28,rnd()*6.28],fr=[1.2+rnd()*1.3,2.6+rnd()*2];
 const headLen=Math.min(Math.max(9,w*4.2),L*.45);
 const tHead=kind==='dribble'?tAtDistance(p0,c,p2,-headLen*1.25):1;
 const pts:P[]=[];
 for(let i=0;i<=n;i++){const t=i/n,q=quadAt(p0,c,p2,t),tg=quadTangent(p0,c,p2,t),tl=Math.hypot(tg[0],tg[1])||1,nx=-tg[1]/tl,ny=tg[0]/tl;
  let off=amp*(Math.sin(ph[0]+t*fr[0]*6.28)*.7+Math.sin(ph[1]+t*fr[1]*6.28)*.3)*Math.sin(Math.PI*Math.min(1,t*1.15));
  if(kind==='dribble'&&t<tHead){const s=t*L,wave=Math.sin(s/(w*4.2)*Math.PI*2)*w*1.2,fade=Math.min(1,s/8,(tHead-t)*L/10);off+=wave*Math.max(0,fade);}
  pts.push([q[0]+nx*off,q[1]+ny*off]);}
 const body=kind==='dribble'?pts.map((p,i)=>`${i?'L':'M'}${f(p[0])} ${f(p[1])}`).join(''):smoothPath(simplify(pts,.25));
 const tg=quadTangent(p0,c,p2,.999),tl=Math.hypot(tg[0],tg[1])||1,ux=tg[0]/tl,uy=tg[1]/tl,tip=pts[pts.length-1];
 const spread=.48+rnd()*.08,s1=Math.sin(spread),c1=Math.cos(spread);
 const wing=(sign:number):P=>[tip[0]-headLen*(ux*c1-sign*uy*s1),tip[1]-headLen*(uy*c1+sign*ux*s1)];
 const l=wing(1),r=wing(-1),bow=(a:P,b:P,k:number):P=>[(a[0]+b[0])/2+(b[1]-a[1])*k,(a[1]+b[1])/2-(b[0]-a[0])*k];
 const head=`M${f(l[0])} ${f(l[1])}Q${f(bow(l,tip,.06)[0])} ${f(bow(l,tip,.06)[1])} ${f(tip[0])} ${f(tip[1])}Q${f(bow(tip,r,.06)[0])} ${f(bow(tip,r,.06)[1])} ${f(r[0])} ${f(r[1])}`;
 return {body,head,dash:kind==='run'?`${f(w*3.2)} ${f(w*2.6)}`:null};
}
/** Distance from a point to a polyline (hit-testing arrows and marker strokes). */
export function distToPolyline(p:P,pts:P[]):number{
 let best=Infinity;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;
  const t=l2?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2)):0;best=Math.min(best,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy));}
 return pts.length===1?Math.hypot(p[0]-pts[0][0],p[1]-pts[0][1]):best;
}
export function pointInPolygon(p:P,poly:P[]):boolean{
 let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];
  if((yi>p[1])!==(yj>p[1])&&p[0]<(xj-xi)*(p[1]-yi)/(yj-yi||1e-9)+xi)inside=!inside;}
 return inside;
}
export const sampleQuad=(p0:P,c:P,p2:P,n=20):P[]=>Array.from({length:n+1},(_,i)=>quadAt(p0,c,p2,i/n));
