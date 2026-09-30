/**
 * Isometric drawing kit for the Konbini food and drink art (user, Sep 29 2026: "The Konbini items need better graphics, at an
 * angle to see more depth. Also add more details."). Original art in a chunky voxel / low-poly style:
 *  - a true isometric 3/4 view (30°): the top face and two side faces show;
 *  - flat shading per face from ONE base colour: top lightest, left (+Y) the base, right (+X) darkest (`lightOf`);
 *  - small seeded pixel-speckle textures (grill marks, rice grains, sesame, crumbs) that never change between paints;
 *  - vessels (trays, plates, slates, bags, cups) and a soft cast shadow give context and depth.
 *
 * World: X runs to the screen's lower right, Y to the lower left, Z up. One world unit ≈ one unit of the 64-unit art cell, so
 * the same painter serves the shelf atlas (64 px cells), the collection tiles and the reveal (the caller scales the context).
 * Everything here is pure Canvas 2D and deterministic (no Math.random, no time): paint once, cache the bitmap.
 */
export type C=CanvasRenderingContext2D;
export type V3=[number,number,number];
export type P2=[number,number];
export const TAU=Math.PI*2;
const K=Math.cos(Math.PI/6),S=.5;

// ---- Colour ---------------------------------------------------------------------------------------------------------------
const parsed=new Map<string,[number,number,number,number]>(),toned=new Map<string,string>();
function rgba(hex:string):[number,number,number,number]{
 let v=parsed.get(hex);if(v)return v;
 let h=hex.replace('#','');if(h.length<=4)h=h.split('').map(ch=>ch+ch).join('');
 const n=parseInt(h.slice(0,6),16);v=[n>>16&255,n>>8&255,n&255,h.length===8?parseInt(h.slice(6,8),16)/255:1];parsed.set(hex,v);return v;
}
const LIGHT=[255,253,246],DARK=[40,26,22];
/** Lighten (amt > 0, toward warm white) or darken (amt < 0, toward a warm brown-black) a hex colour; alpha is kept. */
export function tone(hex:string,amt:number):string{
 if(!amt||hex[0]!=='#')return hex;const a=Math.round(amt*50)/50,key=hex+a;let out=toned.get(key);if(out)return out;
 const [r,g,b,al]=rgba(hex),t=a>0?LIGHT:DARK,k=Math.min(1,Math.abs(a)),m=(x:number,y:number)=>Math.round(x+(y-x)*k);
 out=al<1?`rgba(${m(r,t[0])},${m(g,t[1])},${m(b,t[2])},${al.toFixed(3)})`:`rgb(${m(r,t[0])},${m(g,t[1])},${m(b,t[2])})`;toned.set(key,out);return out;
}
export const opaque=(hex:string)=>hex[0]!=='#'||rgba(hex)[3]>=1;
/** Face brightness from its outward normal: top +0.16, left (+Y) 0, right (+X) −0.24, blended for anything in between. */
export function lightOf(n:V3){const h=Math.hypot(n[0],n[1]);return .16*n[2]+(-.12-.12*((n[0]-n[1])/(h||1)))*h;}

// ---- Deterministic noise ----------------------------------------------------------------------------------------------------
export function hash(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
export type Rng=()=>number;
/** mulberry32: the same seed always gives the same speckles. */
export function rng(seed:string|number):Rng{let a=typeof seed==='number'?seed>>>0:hash(seed);return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

// ---- Vector helpers -------------------------------------------------------------------------------------------------------
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
const mid=(pts:V3[]):V3=>{let x=0,y=0,z=0;for(const p of pts){x+=p[0];y+=p[1];z+=p[2];}const n=pts.length||1;return [x/n,y/n,z/n];};
function newell(pts:V3[]):V3{let x=0,y=0,z=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1]);}return norm([x,y,z]);}
export const lerp3=(a:V3,b:V3,t:number):V3=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
function inPoly(p:P2,poly:P2[]){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>p[1])!==(yj>p[1])&&p[0]<(xj-xi)*(p[1]-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
/** A regular polygon (or ellipse) outline in a plane, counter-clockwise, with one edge facing +45° (toward the viewer). */
export function ngon(r:number,n:number,sx=1,sy=1,cx=0,cy=0):P2[]{const rot=Math.PI/4-Math.PI/n;return Array.from({length:n},(_,i)=>{const a=rot+i*TAU/n;return [cx+Math.cos(a)*r*sx,cy+Math.sin(a)*r*sy] as P2;});}

export type Face={pts:V3[];col:string;n?:V3;flat?:boolean};
export type Plane='xy'|'xz'|'yz';
const planeMap=(pl:Plane)=>(u:number,v:number,w:number):V3=>pl==='xy'?[u,v,w]:pl==='xz'?[u,w,v]:[w,u,v];
const planeDir=(pl:Plane)=>(du:number,dv:number,dw:number):V3=>pl==='xy'?[du,dv,dw]:pl==='xz'?[du,dw,dv]:[dw,du,dv];

/**
 * One painter per drawing: `new Iso(c, x, y)` puts the world origin (the item's ground centre) at canvas point (x, y).
 * Shapes cull the faces that turn away from the viewer, sort the rest back to front and shade them by their normal.
 */
export class Iso{
 constructor(readonly c:C,readonly x:number,readonly y:number){}
 p(X:number,Y:number,Z:number):P2{return [this.x+(X-Y)*K,this.y+(X+Y)*S-Z];}
 path(pts:V3[]){const c=this.c;c.beginPath();for(let i=0;i<pts.length;i++){const [a,b]=this.p(pts[i][0],pts[i][1],pts[i][2]);if(i)c.lineTo(a,b);else c.moveTo(a,b);}c.closePath();}
 /** A flat face, toned by `light`. Opaque faces get a hairline of their own colour so neighbours never show seams. */
 face(pts:V3[],col:string,light=0){const c=this.c,f=tone(col,light);c.fillStyle=f;this.path(pts);c.fill();if(opaque(col)){c.strokeStyle=f;c.lineWidth=.45;c.lineJoin='round';c.stroke();}}
 /** Cull, sort (far → near) and shade a set of faces. `center` orients faces without an explicit normal (convex pieces). */
 faces(fs:Face[],center?:V3){
  const vis:{f:Face;n:V3;d:number}[]=[];
  for(const f of fs){if(f.pts.length<3)continue;const m=mid(f.pts);let n=f.n??newell(f.pts);if(!f.n&&center&&dot(n,sub(m,center))<0)n=[-n[0],-n[1],-n[2]];
   if(n[0]+n[1]+n[2]<=1e-3)continue;vis.push({f,n,d:m[0]+m[1]+m[2]});}
  vis.sort((a,b)=>a.d-b.d);for(const v of vis)this.face(v.f.pts,v.f.col,v.f.flat?0:lightOf(v.n));return vis;
 }
 /** Axis-aligned box centred on (cx, cy), standing on z. Only the three visible faces are drawn; `skip` e.g. 'r' leaves one out. */
 box(cx:number,cy:number,z:number,w:number,d:number,h:number,col:string,o:{top?:string;left?:string;right?:string;skip?:string}={}){
  const x0=cx-w/2,x1=cx+w/2,y0=cy-d/2,y1=cy+d/2,z1=z+h;
  const top:V3[]=[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],left:V3[]=[[x0,y1,z],[x1,y1,z],[x1,y1,z1],[x0,y1,z1]],right:V3[]=[[x1,y0,z],[x1,y1,z],[x1,y1,z1],[x1,y0,z1]];
  const skip=o.skip??'';
  if(h>0&&!skip.includes('l'))this.face(left,o.left??col,0);if(h>0&&!skip.includes('r'))this.face(right,o.right??col,-.24);if(!skip.includes('t'))this.face(top,o.top??col,.16);
  return {top,left,right};
 }
 /**
  * A polygon outline (counter-clockwise or not) extruded along the plane's third axis from w to w + h: 'xy' stands it up in Z
  * (trays, discs, pancakes), 'xz' makes a front-facing slab (onigiri), 'yz' a right-facing slab. `side(i)` recolours edge i.
  */
 extrude(poly:P2[],w:number,h:number,col:string,o:{plane?:Plane;top?:string;side?:(i:number)=>string|undefined;draw?:boolean}={}){
  const pl=o.plane??'xy',M=planeMap(pl),D=planeDir(pl);let area=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];area+=a[0]*b[1]-b[0]*a[1];}
  const P=area<0?[...poly].reverse():poly,sideCol=o.side,fs:Face[]=[];
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],du=b[0]-a[0],dv=b[1]-a[1];const k=area<0?(2*P.length-2-i)%P.length:i;
   fs.push({pts:[M(a[0],a[1],w),M(b[0],b[1],w),M(b[0],b[1],w+h),M(a[0],a[1],w+h)],col:sideCol?.(k)??col,n:norm(D(dv,-du,0))});}
  const cap=P.map(q=>M(q[0],q[1],w+h));fs.push({pts:cap,col:o.top??col,n:norm(D(0,0,1))});fs.push({pts:P.map(q=>M(q[0],q[1],w)),col,n:norm(D(0,0,-1))});
  if(o.draw!==false)this.faces(fs);return {cap,map:(u:number,v:number,ww=w+h)=>M(u,v,ww),faces:fs};
 }
 /**
  * A solid of revolution around the axis a → b (cups, bottles, domes, buns, potatoes, skewers): `prof` lists [t along the axis
  * 0..1, radius]. Low-poly facets (`segs`), optional ellipse squash (sx along the first basis axis, sy along the second),
  * per-vertex seeded `wobble` for lumpy food, a partial sweep `th` (radians) for halves, `colAt(ring, seg)` for bands.
  */
 lathe(a:V3,b:V3,prof:[number,number][],col:string,o:{segs?:number;sx?:number;sy?:number;rot?:number;cap?:boolean|string;base?:boolean;colAt?:(ring:number,seg:number)=>string|undefined;th?:[number,number];wobble?:{r:Rng;amt:number};draw?:boolean}={}){
  const segs=o.segs??10,ax=norm(sub(b,a)),L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
  let u:V3,v:V3;if(Math.abs(ax[2])>.97){u=[1,0,0];v=[0,1,0];if(ax[2]<0)v=[0,-1,0];}else{u=norm(cross(ax,[0,0,1]));v=norm(cross(u,ax));}
  const full=!o.th,th0=o.th?.[0]??(o.rot??Math.PI/4-Math.PI/segs),th1=o.th?.[1]??th0+TAU,count=full?segs:segs+1,sx=o.sx??1,sy=o.sy??1;
  const noise:number[]=o.wobble?Array.from({length:prof.length*count},()=>1+(o.wobble!.r()-.5)*o.wobble!.amt):[];
  const rings:V3[][]=prof.map(([t,r],ri)=>{const c=lerp3(a,b,t);return Array.from({length:count},(_,s)=>{const ang=th0+(th1-th0)*s/(full?segs:segs),k=noise.length?noise[ri*count+s]:1;
   return [c[0]+(u[0]*Math.cos(ang)*sx+v[0]*Math.sin(ang)*sy)*r*k,c[1]+(u[1]*Math.cos(ang)*sx+v[1]*Math.sin(ang)*sy)*r*k,c[2]+(u[2]*Math.cos(ang)*sx+v[2]*Math.sin(ang)*sy)*r*k] as V3;});});
  const fs:Face[]=[];
  for(let i=0;i<prof.length-1;i++){const dA=(prof[i+1][0]-prof[i][0])*L,dR=prof[i+1][1]-prof[i][1];
   for(let s=0;s<(full?segs:segs);s++){const s2=full?(s+1)%segs:s+1,pts:V3[]=[rings[i][s],rings[i][s2],rings[i+1][s2],rings[i+1][s]];
    const m=mid(pts),c=lerp3(a,b,(prof[i][0]+prof[i+1][0])/2),rad=norm(sub(m,c)),want:V3=[ax[0]*-dR+rad[0]*dA,ax[1]*-dR+rad[1]*dA,ax[2]*-dR+rad[2]*dA];
    let n=newell(pts);if(dot(n,want)<0)n=[-n[0],-n[1],-n[2]];fs.push({pts,col:o.colAt?.(i,s)??col,n});}}
  const last=prof.length-1;
  if(o.cap!==false&&prof[last][1]>.01)fs.push({pts:rings[last],col:typeof o.cap==='string'?o.cap:col,n:ax});
  if(o.base&&prof[0][1]>.01)fs.push({pts:[...rings[0]].reverse(),col,n:[-ax[0],-ax[1],-ax[2]]});
  if(o.draw!==false)this.faces(fs);return {rings,faces:fs};
 }
 /** A soft low-poly dome (buns, mochi, karaage): radius rx × ry, height h, bulging `shape` profile [height 0..1, radius 0..1]. */
 dome(cx:number,cy:number,z:number,rx:number,ry:number,h:number,col:string,o:{shape?:[number,number][];segs?:number;wobble?:{r:Rng;amt:number};colAt?:(ring:number,seg:number)=>string|undefined;draw?:boolean}={}){
  const shape=o.shape??[[0,.86],[.22,1],[.55,.88],[.82,.56],[1,0]];
  return this.lathe([cx,cy,z],[cx,cy,z+h],shape.map(([t,r])=>[t,r*rx] as [number,number]),col,{segs:o.segs??12,sy:ry/rx,wobble:o.wobble,colAt:o.colAt,draw:o.draw});
 }
 /** Pixel speckles (1-unit squares by default) at world points. */
 dots(pts:V3[],cols:string|string[],w=1,h=w){const c=this.c,list=typeof cols==='string'?[cols]:cols;pts.forEach((q,i)=>{const [x,y]=this.p(q[0],q[1],q[2]);c.fillStyle=list[i%list.length];c.fillRect(x-w/2,y-h/2,w,h);});}
 /** n seeded speckles inside a quad (bilinear), kept a margin away from its edges. */
 speckQuad(q:V3[],n:number,cols:string|string[],r:Rng,w=1,h=w,margin=.08){const pts:V3[]=[];for(let i=0;i<n;i++){const s=margin+r()*(1-2*margin),t=margin+r()*(1-2*margin);pts.push(lerp3(lerp3(q[0],q[1],s),lerp3(q[3],q[2],s),t));}this.dots(pts,cols,w,h);}
 /** n seeded speckles inside a 2D outline mapped into the world (`map(u, v)`). */
 speckPoly(poly:P2[],map:(u:number,v:number)=>V3,n:number,cols:string|string[],r:Rng,w=1,h=w){
  let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;for(const [u,v] of poly){x0=Math.min(x0,u);x1=Math.max(x1,u);y0=Math.min(y0,v);y1=Math.max(y1,v);}
  const pts:V3[]=[];for(let k=0;k<n*6&&pts.length<n;k++){const u=x0+r()*(x1-x0),v=y0+r()*(y1-y0);if(inPoly([u,v],poly))pts.push(map(u,v));}this.dots(pts,cols,w,h);
 }
 /** Speckles on a horizontal ellipse (tops of discs, broth, sugar on a bun). */
 speckDisc(cx:number,cy:number,z:number,rx:number,ry:number,n:number,cols:string|string[],r:Rng,w=1,h=w,zf?:(d:number)=>number){const pts:V3[]=[];for(let i=0;i<n;i++){const a=r()*TAU,d=Math.sqrt(r())*.9;pts.push([cx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d,z+(zf?zf(d):0)]);}this.dots(pts,cols,w,h);}
 /** A polyline through world points. */
 line(pts:V3[],col:string,w=1,cap:CanvasLineCap='round'){const c=this.c;c.beginPath();pts.forEach((q,i)=>{const [x,y]=this.p(q[0],q[1],q[2]);if(i)c.lineTo(x,y);else c.moveTo(x,y);});c.strokeStyle=col;c.lineWidth=w;c.lineCap=cap;c.lineJoin='round';c.stroke();}
 /** An unshaded filled polygon through world points (glaze, broth, labels already toned by the caller). */
 fill(pts:V3[],col:string){this.c.fillStyle=col;this.path(pts);this.c.fill();}
 /** Text printed on a face: 'front' faces the viewer (normal +X+Y), 'left' is the +Y face, 'right' the +X face. */
 text(str:string,at:V3,plane:'front'|'left'|'right',size:number,col:string,maxW?:number,weight='900'){
  const c=this.c,[x,y]=this.p(at[0],at[1],at[2]);c.save();c.translate(x,y);if(plane==='left')c.transform(K,S,0,1,0,0);else if(plane==='right')c.transform(K,-S,0,1,0,0);
  c.fillStyle=col;c.font=`${weight} ${size}px system-ui,-apple-system,"Segoe UI",sans-serif`;c.textAlign='center';c.textBaseline='middle';if(maxW)c.fillText(str,0,0,maxW);else c.fillText(str,0,0);c.restore();
 }
}

// ---- Shared finishing touches -------------------------------------------------------------------------------------------------
/** The soft cast shadow under a vessel (light from the upper left, so it leans a little to the lower right). */
export function softShadow(c:C,x:number,y:number,rx:number,ry:number,alpha=1){
 c.save();c.globalAlpha*=alpha;c.fillStyle='rgba(70,48,30,.13)';c.beginPath();c.ellipse(x+2.2,y+1.4,rx*1.08,ry*1.08,0,0,TAU);c.fill();
 c.fillStyle='rgba(70,48,30,.12)';c.beginPath();c.ellipse(x+1.2,y+.8,rx*.8,ry*.8,0,0,TAU);c.fill();c.restore();
}
/** Steam: three pixel-edged wisps; `t` 0..1 grows them (the reveal), 1 = the finished puff. Grey-blue edge + white core so it
 *  reads on the off-white card and the pale shelves. */
export function steam(c:C,x:number,y:number,t=1,spread=7,height=16){
 c.save();c.lineCap='round';
 for(const [k,dx] of [[0,-spread],[1,0],[2,spread]] as const){const top=y-height*(.55+.45*t)-(k===1?4:0),x0=x+dx;
  c.beginPath();c.moveTo(x0,y);c.bezierCurveTo(x0-4,y-height*.3,x0+4,y-height*.55,x0,top);
  c.strokeStyle=`rgba(150,170,178,${.55*t})`;c.lineWidth=3.2;c.stroke();c.strokeStyle=`rgba(255,255,255,${.95*t})`;c.lineWidth=1.6;c.stroke();}
 c.restore();
}
/** Glossy highlight: a short bright dash plus a pixel (glaze, broth, bottles). */
export function sheen(c:C,x:number,y:number,len=4,col='rgba(255,255,255,.85)'){c.fillStyle=col;c.fillRect(x,y,len,1);c.fillRect(x+len+1,y,1,1);c.fillRect(x+1,y+1.6,len*.5,.8);}
