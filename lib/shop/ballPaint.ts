/**
 * Football shop · Ball studio paint engine (Oct 12 2026): the "Draw" step paints straight onto the ball.
 *
 * The drawing is one equirectangular RGBA layer (DRAW_W × DRAW_H, row 0 = the north pole, u = atan2(z,−x)/2π, exactly the
 * mapping lib/shop/ballShader.ts samples with), held PREMULTIPLIED in a plain Uint8ClampedArray. The stage uploads the dirty
 * rectangle only (texSubImage2D via renderer.copyTextureToTexture), throttled to ~30 uploads a second.
 *
 * Every tool works on the sphere, not on the flat map, so strokes stay round all the way to the poles:
 *  - brush / soft marker / eraser: a capsule (3D point-to-chord distance ≈ angle for short chords) per pointer segment,
 *    long segments split into short ones; coverage is a per-stroke max, so a marker never darkens where it overlaps itself;
 *  - line: the same capsule from the start point to the finger, redrawn from the pre-stroke pixels on every move;
 *  - stamps (star, heart, circle, lightning): a signed-distance polygon in the tangent plane, upright on screen;
 *  - symmetry: mirror (across the screen's vertical plane) and radial ×5 (around the screen's up axis), both frozen per stroke.
 * Fill-a-panel is not raster: it is a per-panel colour (design.art.fills, lib/shop/ballPanels.ts) the shader applies.
 *
 * Undo/redo is per stroke: a stroke's dirty rectangle before and after (memory-capped). Pure apart from encode/decode, which
 * take a document; tests/shop-ball.cjs runs the rest in Node.
 */
import {DRAW_MAX_CHARS,DRAW_URL,isDrawUrl} from './ball';
export {DRAW_MAX_CHARS,isDrawUrl,artHash} from './ball';
export const DRAW_W=1024,DRAW_H=512;
export type Vec3=[number,number,number];
export type PaintTool='brush'|'marker'|'eraser'|'fill'|'line'|'stamp';
export type StampKind='star'|'heart'|'circle'|'bolt';
export type Symmetry='off'|'mirror'|'radial5';
export type Rect={x0:number;y0:number;x1:number;y1:number};
/** Brush radii in radians (≈ sphere radii): small, medium, large. */
export const BRUSH_SIZES=[.02,.042,.08] as const;
/** Stamp half-sizes (radians) for the same three sizes. */
export const STAMP_SIZES=[.075,.12,.19] as const;
export const STAMPS:readonly StampKind[]=['star','heart','circle','bolt'];
/** History memory cap (bytes of saved pixels) and step cap. */
export const HISTORY_BYTES=24*1024*1024,HISTORY_STEPS=40;

type Shape={poly:number[][]|null;circle?:number};
/** Stamp outlines in a [-1,1]² box, y up. */
function starPoly(n=5,R=1,r=.45){const o:number[][]=[];for(let i=0;i<n*2;i++){const a=Math.PI/2+i*Math.PI/n,rr=i%2?r:R;o.push([Math.cos(a)*rr,Math.sin(a)*rr]);}return o;}
function heartPoly(){const o:number[][]=[];for(let i=0;i<48;i++){const t=i/48*Math.PI*2;const x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);o.push([x/17,(y+2.5)/16]);}return o;}
const SHAPES:Record<StampKind,Shape>={
 star:{poly:starPoly()},heart:{poly:heartPoly()},circle:{poly:null,circle:.92},
 bolt:{poly:[[.28,1],[-.62,-.08],[-.04,-.08],[-.34,-1],[.66,.2],[.06,.2],[.48,1]]},
};
/** Signed distance to a polygon (positive inside), in box units. */
function polySd(P:number[][],x:number,y:number){let d=1e9,inside=false;
 for(let i=0,j=P.length-1;i<P.length;j=i++){const ax=P[j][0],ay=P[j][1],bx=P[i][0],by=P[i][1];
  if((by>y)!==(ay>y)&&x<(ax-bx)*(y-by)/(ay-by)+bx)inside=!inside;
  const ex=bx-ax,ey=by-ay,t=Math.max(0,Math.min(1,((x-ax)*ex+(y-ay)*ey)/(ex*ex+ey*ey||1))),dx=x-ax-ex*t,dy=y-ay-ey*t;d=Math.min(d,dx*dx+dy*dy);}
 d=Math.sqrt(d);return inside?d:-d;}

// ---- vectors ------------------------------------------------------------------------------------------------------------
const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm=(a:Vec3):Vec3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** Reflect across the plane through the centre with unit normal n. */
export const reflect=(p:Vec3,n:Vec3):Vec3=>{const k=2*dot(p,n);return [p[0]-k*n[0],p[1]-k*n[1],p[2]-k*n[2]];};
/** Rotate p about the unit axis a by angle t (Rodrigues). */
export function rotate(p:Vec3,a:Vec3,t:number):Vec3{const c=Math.cos(t),s=Math.sin(t),d=dot(p,a)*(1-c),x=cross(a,p);
 return [p[0]*c+x[0]*s+a[0]*d,p[1]*c+x[1]*s+a[1]*d,p[2]*c+x[2]*s+a[2]*d];}
/** The ball-space transforms a symmetry mode makes of one point (the identity first). `right`/`up` are the screen axes in
 *  ball space when the stroke started: mirror reflects across the plane holding `up` and the view; radial turns about `up`. */
export function symmetryMaps(sym:Symmetry,right:Vec3,up:Vec3):((p:Vec3)=>Vec3)[]{
 if(sym==='mirror')return [p=>p,p=>reflect(p,right)];
 if(sym==='radial5')return [0,1,2,3,4].map(k=>k?(p:Vec3)=>rotate(p,up,k*Math.PI*2/5):(p:Vec3)=>p);
 return [p=>p];
}
/** Equirect texel centre (i,j) → unit direction, the same chart the shader samples (u = atan2(z,−x)/2π, row 0 = north). */
export function texelDir(i:number,j:number,W=DRAW_W,H=DRAW_H):Vec3{const ph=(i+.5)/W*Math.PI*2,th=(j+.5)/H*Math.PI,s=Math.sin(th);return [-Math.cos(ph)*s,Math.cos(th),Math.sin(ph)*s];}
/** Unit direction → equirect (u in [0,1), t in [0,1] from north). */
export function dirUV(d:Vec3):[number,number]{let u=Math.atan2(d[2],-d[0])/(Math.PI*2);if(u<0)u+=1;return [u,Math.acos(Math.max(-1,Math.min(1,d[1])))/Math.PI];}

export type StrokeOpts={tool:Exclude<PaintTool,'fill'>;rgb:[number,number,number];size:number;sym:Symmetry;right:Vec3;up:Vec3;stamp?:StampKind};
export type Patch={rect:Rect;before:Uint8ClampedArray;after:Uint8ClampedArray};

export type Painter=ReturnType<typeof createPainter>;
export function createPainter(W=DRAW_W,H=DRAW_H){
 const buf=new Uint8ClampedArray(W*H*4);
 const before=new Uint8ClampedArray(W*H*4);
 const mask=new Uint8Array(W*H);
 // Per-column and per-row trig tables, so a texel's direction is 3 multiplies.
 const cphi=new Float32Array(W),sphi=new Float32Array(W),sth=new Float32Array(H),cth=new Float32Array(H);
 for(let i=0;i<W;i++){const ph=(i+.5)/W*Math.PI*2;cphi[i]=Math.cos(ph);sphi[i]=Math.sin(ph);}
 for(let j=0;j<H;j++){const th=(j+.5)/H*Math.PI;sth[j]=Math.sin(th);cth[j]=Math.cos(th);}
 const texel=Math.PI/H;
 let stroke:{o:StrokeOpts;maps:((p:Vec3)=>Vec3)[];last:Vec3|null;start:Vec3|null;rect:Rect|null;lineRect:Rect|null;cols:[number,number,number];alpha:number;soft:number}|null=null;
 let dirty:Rect|null=null;
 const undoStack:Patch[]=[],redoStack:Patch[]=[];let histBytes=0;
 let empty=true;

 const union=(a:Rect|null,b:Rect):Rect=>a?{x0:Math.min(a.x0,b.x0),y0:Math.min(a.y0,b.y0),x1:Math.max(a.x1,b.x1),y1:Math.max(a.y1,b.y1)}:{...b};
 const markDirty=(r:Rect)=>{dirty=union(dirty,r);};

 /** Texel rows/columns that can lie within angle `rad` of the given points (columns may wrap: returned unwrapped). */
 function bounds(pts:Vec3[],rad:number):{j0:number;j1:number;i0:number;i1:number}{
  let tmin=9,tmax=-9,uref=-1,umin=9,umax=-9;
  for(const p of pts){const [u,t]=dirUV(p);tmin=Math.min(tmin,t);tmax=Math.max(tmax,t);let uu=u;if(uref<0)uref=u;else{if(uu-uref>.5)uu-=1;else if(uref-uu>.5)uu+=1;}umin=Math.min(umin,uu);umax=Math.max(umax,uu);}
  const th0=tmin*Math.PI-rad,th1=tmax*Math.PI+rad;const j0=Math.max(0,Math.floor(th0/Math.PI*H)-1),j1=Math.min(H-1,Math.ceil(th1/Math.PI*H)+1);
  const smin=Math.min(Math.sin(Math.max(0,th0)),Math.sin(Math.min(Math.PI,th1)));
  if(th0<=texel*2||th1>=Math.PI-texel*2||smin<.06)return {j0,j1,i0:0,i1:W-1};
  const du=rad/smin/(Math.PI*2);let i0=Math.floor((umin-du)*W)-1,i1=Math.ceil((umax+du)*W)+1;if(i1-i0>=W-1){i0=0;i1=W-1;}
  return {j0,j1,i0,i1};}
 const rectOf=(b:{j0:number;j1:number;i0:number;i1:number}):Rect=>b.i0<0||b.i1>=W?{x0:0,y0:b.j0,x1:W,y1:b.j1+1}:{x0:b.i0,y0:b.j0,x1:b.i1+1,y1:b.j1+1};

 /** Blend one texel from the pre-stroke pixels with this stroke's coverage. */
 function put(idx:number,cov:number){if(cov<=mask[idx])return;mask[idx]=cov;const s=stroke!,o=idx*4,c=cov/255*s.alpha;
  if(s.o.tool==='eraser'){const k=1-c;buf[o]=before[o]*k;buf[o+1]=before[o+1]*k;buf[o+2]=before[o+2]*k;buf[o+3]=before[o+3]*k;return;}
  const k=1-c;buf[o]=before[o]*k+s.cols[0]*c;buf[o+1]=before[o+1]*k+s.cols[1]*c;buf[o+2]=before[o+2]*k+s.cols[2]*c;buf[o+3]=before[o+3]*k+255*c;}

 /** A capsule of radius r round the chord a→b (short chords only). */
 function capsule(a:Vec3,b:Vec3,r:number){const s=stroke!;const bb=bounds([a,b,nrm([(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2])],r+texel*2);
  const ex=b[0]-a[0],ey=b[1]-a[1],ez=b[2]-a[2],ee=ex*ex+ey*ey+ez*ez||1e-12,aa=s.soft;
  for(let j=bb.j0;j<=bb.j1;j++){const st=sth[j],y=cth[j];
   for(let ii=bb.i0;ii<=bb.i1;ii++){const i=((ii%W)+W)%W;const x=-cphi[i]*st,z=sphi[i]*st;
    let t=((x-a[0])*ex+(y-a[1])*ey+(z-a[2])*ez)/ee;t=t<0?0:t>1?1:t;const dx=x-a[0]-ex*t,dy=y-a[1]-ey*t,dz=z-a[2]-ez*t;const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(d>=r+aa)continue;const cov=d<=r-aa?255:Math.round(255*(r+aa-d)/(2*aa));if(cov>0)put(j*W+i,cov);}}
  const rc=rectOf(bb);s.rect=union(s.rect,rc);markDirty(rc);return rc;}
 /** Split a→b into chords ≤ 0.06 rad (so the chord stays close to the sphere) and draw each. */
 function segment(a:Vec3,b:Vec3,r:number){const ang=Math.acos(Math.max(-1,Math.min(1,dot(a,b))));const n=Math.max(1,Math.ceil(ang/.06));let prev=a;let rect:Rect|null=null;
  for(let k=1;k<=n;k++){const t=k/n,so=Math.sin(ang);let p:Vec3;if(so<1e-6)p=b;else{const w1=Math.sin((1-t)*ang)/so,w2=Math.sin(t*ang)/so;p=nrm([a[0]*w1+b[0]*w2,a[1]*w1+b[1]*w2,a[2]*w1+b[2]*w2]);}
   rect=union(rect,capsule(prev,p,r));prev=p;}
  return rect;}
 /** A stamp centred on d, upright along `up` (projected to the tangent plane), mirrored when `flip`. */
 function stampAt(d:Vec3,up:Vec3,R:number,kind:StampKind,flip=false){const s=stroke!;const sh=SHAPES[kind];
  let u:Vec3=[up[0]-d[0]*dot(up,d),up[1]-d[1]*dot(up,d),up[2]-d[2]*dot(up,d)];if(Math.hypot(...u)<1e-4)u=Math.abs(d[1])<.9?[0,1,0]:[0,0,1];u=nrm(u);
  const r=cross(u,d);// screen right (u × d with d toward the viewer)
  const bb=bounds([d],R*1.45+texel*2),aa=s.soft/R;
  for(let j=bb.j0;j<=bb.j1;j++){const st=sth[j],y=cth[j];
   for(let ii=bb.i0;ii<=bb.i1;ii++){const i=((ii%W)+W)%W;const x=-cphi[i]*st,z=sphi[i]*st;const cd=x*d[0]+y*d[1]+z*d[2];if(cd<.3)continue;
    const lx=(flip?-1:1)*Math.atan2(x*r[0]+y*r[1]+z*r[2],cd)/R,ly=Math.atan2(x*u[0]+y*u[1]+z*u[2],cd)/R;if(lx<-1.1||lx>1.1||ly<-1.1||ly>1.1)continue;
    const sd=sh.poly?polySd(sh.poly,lx,ly):sh.circle!-Math.hypot(lx,ly);if(sd<=-aa)continue;const cov=sd>=aa?255:Math.round(255*(sd+aa)/(2*aa));if(cov>0)put(j*W+i,cov);}}
  const rc=rectOf(bb);s.rect=union(s.rect,rc);markDirty(rc);}

 function pushPatch(p:Patch){undoStack.push(p);histBytes+=p.before.length*2;redoStack.length=0;
  while(undoStack.length>HISTORY_STEPS||(histBytes>HISTORY_BYTES&&undoStack.length>1)){const x=undoStack.shift()!;histBytes-=x.before.length*2;}}
 function grab(src:Uint8ClampedArray,r:Rect){const w=r.x1-r.x0,out=new Uint8ClampedArray(w*(r.y1-r.y0)*4);for(let y=r.y0;y<r.y1;y++)out.set(src.subarray((y*W+r.x0)*4,(y*W+r.x1)*4),(y-r.y0)*w*4);return out;}
 function blit(px:Uint8ClampedArray,r:Rect){const w=r.x1-r.x0;for(let y=r.y0;y<r.y1;y++)buf.set(px.subarray((y-r.y0)*w*4,(y-r.y0+1)*w*4),(y*W+r.x0)*4);markDirty(r);}
 function clearMask(r:Rect){for(let y=r.y0;y<r.y1;y++)mask.fill(0,y*W+r.x0,y*W+r.x1);}
 function restore(r:Rect){for(let y=r.y0;y<r.y1;y++)buf.set(before.subarray((y*W+r.x0)*4,(y*W+r.x1)*4),(y*W+r.x0)*4);markDirty(r);}
 const scanEmpty=()=>{for(let i=3;i<buf.length;i+=4)if(buf[i])return false;return true;};

 return {
  W,H,buf,
  /** Start a stroke at ball-space direction p (brush, marker, eraser, line) or stamp at p (stamp). */
  begin(o:StrokeOpts,p:Vec3){before.set(buf);const maps=symmetryMaps(o.sym,o.right,o.up);
   stroke={o,maps,last:p,start:p,rect:null,lineRect:null,cols:o.rgb,alpha:o.tool==='marker'?.5:1,soft:o.tool==='marker'?Math.max(texel*1.5,o.size*.45):texel*.9};
   // Each copy maps the centre and the up vector; the mirrored copy is drawn flipped (a true mirror image).
   if(o.tool==='stamp'){maps.forEach((m,k)=>stampAt(nrm(m(p)),m(o.up),o.size,o.stamp??'star',o.sym==='mirror'&&k===1));}
   else if(o.tool!=='line')for(const m of maps)segment(nrm(m(p)),nrm(m(p)),o.size);},
  /** Continue the stroke to p (brush/marker/eraser), or move the line's end to p (line). */
  to(p:Vec3){const s=stroke;if(!s||s.o.tool==='stamp')return;
   if(s.o.tool==='line'){if(s.lineRect){restore(s.lineRect);clearMask(s.lineRect);}let r:Rect|null=null;for(const m of s.maps){const x=segment(nrm(m(s.start!)),nrm(m(p)),s.o.size);if(x)r=union(r,x);}s.lineRect=r;s.last=p;return;}
   const a=s.last!;for(const m of s.maps)segment(nrm(m(a)),nrm(m(p)),s.o.size);s.last=p;},
  /** Lift without ending the stroke (the finger slid off the ball): the next point starts a new segment. */
  jump(p:Vec3){if(stroke&&stroke.o.tool!=='line')stroke.last=p;},
  /** Finish the stroke: one undo step. Returns false when nothing changed. */
  end():boolean{const s=stroke;stroke=null;if(!s||!s.rect)return false;const r=s.rect;clearMask({x0:0,y0:r.y0,x1:W,y1:r.y1});
   pushPatch({rect:r,before:grab(before,r),after:grab(buf,r)});empty=scanEmpty();return true;},
  /** Drop the stroke in progress (a second finger landed: that was a spin, not a paint). */
  cancel(){const s=stroke;stroke=null;if(!s||!s.rect)return;restore(s.rect);clearMask({x0:0,y0:s.rect.y0,x1:W,y1:s.rect.y1});},
  get drawing(){return !!stroke;},
  undo():boolean{const p=undoStack.pop();if(!p)return false;blit(p.before,p.rect);redoStack.push(p);empty=scanEmpty();return true;},
  redo():boolean{const p=redoStack.pop();if(!p)return false;blit(p.after,p.rect);undoStack.push(p);empty=scanEmpty();return true;},
  get canUndo(){return undoStack.length>0;},get canRedo(){return redoStack.length>0;},
  get historyBytes(){return histBytes;},get steps(){return undoStack.length;},
  /** Wipe the drawing as one undo step. */
  clear():boolean{if(empty)return false;const r={x0:0,y0:0,x1:W,y1:H};pushPatch({rect:r,before:buf.slice(),after:new Uint8ClampedArray(W*H*4)});buf.fill(0);markDirty(r);empty=true;return true;},
  /** Replace the pixels (straight-alpha RGBA, W×H) and forget the history: a loaded design. */
  load(straight:Uint8ClampedArray|null){undoStack.length=redoStack.length=0;histBytes=0;stroke=null;
   if(!straight||straight.length!==buf.length){buf.fill(0);}else for(let i=0;i<buf.length;i+=4){const a=straight[i+3]/255;buf[i]=straight[i]*a;buf[i+1]=straight[i+1]*a;buf[i+2]=straight[i+2]*a;buf[i+3]=straight[i+3];}
   empty=scanEmpty();markDirty({x0:0,y0:0,x1:W,y1:H});},
  /** Forget undo/redo (the design changed underneath, e.g. a slot was loaded). */
  resetHistory(){undoStack.length=redoStack.length=0;histBytes=0;},
  get empty(){return empty;},
  /** The dirty rectangle since the last call (for the texture upload), or null. */
  takeDirty():Rect|null{const d=dirty;dirty=null;return d;},
  /** Straight-alpha RGBA at half resolution (box filter): what gets encoded and saved. */
  half():Uint8ClampedArray{const w=W/2,h=H/2,out=new Uint8ClampedArray(w*h*4);
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const o=((y*2)*W+x*2)*4,o2=o+W*4;let r=0,g=0,b=0,a=0;
    for(const k of [o,o+4,o2,o2+4]){r+=buf[k];g+=buf[k+1];b+=buf[k+2];a+=buf[k+3];}const q=(y*w+x)*4;
    if(a>0){out[q]=r*255/a;out[q+1]=g*255/a;out[q+2]=b*255/a;out[q+3]=a/4;}}
   return out;},
 };
}

// ---- Encode / decode (browser) ------------------------------------------------------------------------------------------
/** Posterise an RGBA buffer to 16 levels (PNG compresses kid art much better; invisible on a ball). */
function posterise(px:Uint8ClampedArray){for(let i=0;i<px.length;i++)px[i]=Math.round(px[i]/17)*17;}
/**
 * Encode the painter's pixels to a data URL under DRAW_MAX_CHARS: 512×256 WebP at falling quality, then smaller sizes; PNG
 * (posterised) where the browser can't write WebP (Safari). Returns '' for an empty drawing, null when it can't fit at all.
 */
export function encodeDrawing(p:Painter,doc:Document=document):string|null{
 if(p.empty)return '';
 const half=p.half(),w=p.W/2,h=p.H/2;const c=doc.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d')!;g.putImageData(new ImageData(half,w,h),0,0);
 const tries:[number,number][]=[[1,.82],[1,.62],[1,.45],[.75,.6],[.5,.6],[.375,.5]];
 let webp=true;
 for(const [scale,q] of tries){let src:HTMLCanvasElement=c;
  if(scale<1){src=doc.createElement('canvas');src.width=Math.round(w*scale);src.height=Math.round(h*scale);const g2=src.getContext('2d')!;g2.imageSmoothingQuality='high';g2.drawImage(c,0,0,src.width,src.height);}
  let url=webp?src.toDataURL('image/webp',q):'';
  if(!url.startsWith('data:image/webp')){webp=false;const g3=src.getContext('2d')!;const id=g3.getImageData(0,0,src.width,src.height);posterise(id.data);g3.putImageData(id,0,0);url=src.toDataURL('image/png');}
  if(url.length<=DRAW_MAX_CHARS&&DRAW_URL.test(url))return url;}
 return null;
}
/** Decode a stored drawing into straight-alpha RGBA at the painter's size (null when it isn't a valid drawing). */
export function decodeDrawing(url:string,W=DRAW_W,H=DRAW_H,doc:Document=document):Promise<Uint8ClampedArray|null>{
 if(!isDrawUrl(url))return Promise.resolve(null);
 return new Promise(res=>{const img=new Image();img.onload=()=>{
   if(!img.naturalWidth||img.naturalWidth>2048||Math.abs(img.naturalWidth/img.naturalHeight-2)>.05){res(null);return;}
   const c=doc.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true})!;g.imageSmoothingQuality='high';g.drawImage(img,0,0,W,H);
   try{res(g.getImageData(0,0,W,H).data);}catch{res(null);}c.width=c.height=1;};
  img.onerror=()=>res(null);img.src=url;});
}
