/**
 * Kit Shop · "Draw your own design" ops (Oct 12 2026). SHARED HELPER, written for the Jersey studio; the Ball studio (or any
 * other studio) can reuse it. Owner: the jersey studio (lib/shop/jersey*.ts, components/shop/jerseyScene.ts).
 *
 * WHAT IT IS
 *  A drawing is a short list of VECTOR OPS over a unit square (the item's texture atlas, x right, y down, 0..1). Ops are stored
 *  compactly inside the design (so they sync with the save code) and replayed into a transparent "art layer" canvas that the
 *  studio composites between its pattern and its crisp prints. Vector ops (not a PNG) because:
 *   - small: a busy kid drawing is 3–10 KB of JSON (a 512² PNG/WebP is 40–150 KB and does not gzip), and the whole synced
 *     snapshot is capped at 512 KB raw / 192 KB gzip (lib/saves/snapshot.ts MAX_SNAPSHOT_BYTES / MAX_GZIP_BYTES; one key ≤ 256 KB);
 *   - resolution-free: replays crisp at 1024² (phones) and 2048² (desktop);
 *   - per-stroke undo/redo is just the op list.
 *  Hard caps (validateArt / artFits): ART_MAX_CHARS of JSON, ART_MAX_POINTS points, ART_MAX_OPS ops, ART_MAX_FILLS fills.
 *
 * OPS (JSON arrays, coordinates are ints on a 4096 grid = ART_GRID)
 *  ['b'|'s'|'e', size, '#rrggbb', mirror, points]   brush (opaque round) | spray (soft airbrush dabs) | eraser.  A straight line
 *                                                     is a brush op with two points.
 *  ['p', shape, '#rrggbb', mirror, x, y, size]       stamp: 'c' circle, 't' star, 'h' heart, 'r' stripe band across the region
 *  ['f', '#rrggbb', mirror, x, y]                    fill bucket: floods the connected area of the ART LAYER (empty or one colour)
 *                                                     inside the region that was tapped (so an empty panel fills whole, a drawn
 *                                                     ring fills inside). Computed at FILL_RES so phones and desktops agree.
 *  size is 0|1|2 (small/medium/large; the surface says what that means). mirror 1 = also paint the surface's mirror image.
 *  points: a string, see encodePoints(): '!'+4 chars = absolute point after a pen-up, '*'+4 chars = absolute point joined to the
 *  last one, 2 chars = a small delta (−32..31 per axis). Alphabet: base64url.
 *
 * SURFACES: the caller describes its atlas with an ArtSurface (regions, mirror map, brush widths). Strokes never join points in
 * different regions and every mark is clipped to its region, so paint can't leak across the atlas.
 *
 * Safety: free drawing can't contain typed text from us; drawings are user-generated images that live only in the child's own
 * save (no public sharing). Pure + DOM-canvas only (no three.js). Node tests use the encode/validate half (no canvas needed).
 */

export const ART_GRID=4096;
export const ART_MAX_CHARS=12000;
export const ART_MAX_POINTS=4000;
export const ART_MAX_OPS=300;
export const ART_MAX_FILLS=12;
/** Fill bucket resolution (unit square → FILL_RES²). Fixed so every device computes the same area. */
export const FILL_RES=1024;

export type ArtSize=0|1|2;
export type ArtStrokeKind='b'|'s'|'e';
export type ArtShape='c'|'t'|'h'|'r';
export type ArtStroke=[ArtStrokeKind,ArtSize,string,0|1,string];
export type ArtStamp=['p',ArtShape,string,0|1,number,number,ArtSize];
export type ArtFill=['f',string,0|1,number,number];
export type ArtOp=ArtStroke|ArtStamp|ArtFill;
export interface Art{v:1;ops:ArtOp[]}
/** A point on the grid. up = the pen was lifted before this point (a new sub-path). */
export interface ArtPoint{x:number;y:number;up?:boolean}

const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const IDX=new Int16Array(128).fill(-1);for(let i=0;i<64;i++)IDX[B64.charCodeAt(i)]=i;
const idx=(c:number)=>c<128?IDX[c]:-1;
const gridInt=(n:number)=>Math.max(0,Math.min(ART_GRID-1,Math.round(n)));
const abs4=(x:number,y:number)=>B64[x>>6]+B64[x&63]+B64[y>>6]+B64[y&63];
const isHex=(s:unknown):s is string=>typeof s==='string'&&/^#[0-9a-f]{6}$/.test(s);

/** Packs grid points: about 2 chars per point while the pen moves smoothly. */
export function encodePoints(pts:readonly ArtPoint[]):string{
 let s='',px=0,py=0;
 pts.forEach((p,i)=>{
  const x=gridInt(p.x),y=gridInt(p.y),dx=x-px,dy=y-py;
  if(i===0||p.up)s+='!'+abs4(x,y);
  else if(dx>=-32&&dx<=31&&dy>=-32&&dy<=31)s+=B64[dx+32]+B64[dy+32];
  else s+='*'+abs4(x,y);
  px=x;py=y;
 });
 return s;
}
/** The inverse of encodePoints; null for anything malformed (bad chars, truncated, off the grid, no leading '!'). */
export function decodePoints(s:string):ArtPoint[]|null{
 if(typeof s!=='string'||s[0]!=='!')return null;
 const out:ArtPoint[]=[];let i=0,x=0,y=0;
 while(i<s.length){
  const c=s[i];
  if(c==='!'||c==='*'){
   if(i+5>s.length)return null;
   const a=idx(s.charCodeAt(i+1)),b=idx(s.charCodeAt(i+2)),e=idx(s.charCodeAt(i+3)),f=idx(s.charCodeAt(i+4));
   if(a<0||b<0||e<0||f<0)return null;
   x=a*64+b;y=e*64+f;out.push(c==='!'?{x,y,up:true}:{x,y});i+=5;
  }else{
   if(i+2>s.length)return null;
   const a=idx(s.charCodeAt(i)),b=idx(s.charCodeAt(i+1));if(a<0||b<0)return null;
   x+=a-32;y+=b-32;if(x<0||y<0||x>=ART_GRID||y>=ART_GRID)return null;
   out.push({x,y});i+=2;
  }
 }
 return out;
}

/** Size + counts, for the "paint left" meter and the caps. */
export function artStats(art:Art|undefined|null):{ops:number;points:number;fills:number;chars:number}{
 if(!art||!art.ops.length)return{ops:0,points:0,fills:0,chars:0};
 let points=0,fills=0;
 for(const op of art.ops){if(op[0]==='f'){fills++;points++;}else if(op[0]==='p')points++;else points+=countPoints(op[4]);}
 return{ops:art.ops.length,points,fills,chars:JSON.stringify(art).length};
}
/** Cheap point count of an encoded string (no allocation). */
export function countPoints(s:string):number{let n=0;for(let i=0;i<s.length;){const c=s[i];i+=c==='!'||c==='*'?5:2;n++;}return n;}
export function artFits(art:Art):boolean{const s=artStats(art);return s.ops<=ART_MAX_OPS&&s.points<=ART_MAX_POINTS&&s.fills<=ART_MAX_FILLS&&s.chars<=ART_MAX_CHARS;}
/** 0..1: how full the drawing is (the larger of the char and point budgets). */
export function artFullness(art:Art|undefined|null):number{
 const s=artStats(art);return Math.min(1,Math.max(s.chars/ART_MAX_CHARS,s.points/ART_MAX_POINTS,s.ops/ART_MAX_OPS,s.fills/ART_MAX_FILLS));
}

/** One op checked field by field; returns a clean copy or null. */
export function validateOp(v:unknown):ArtOp|null{
 if(!Array.isArray(v))return null;
 const sz=(n:unknown):n is ArtSize=>n===0||n===1||n===2;
 const mir=(n:unknown):n is 0|1=>n===0||n===1;
 const g=(n:unknown):n is number=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<ART_GRID;
 const k=v[0];
 if((k==='b'||k==='s'||k==='e')&&v.length===5&&sz(v[1])&&isHex(v[2])&&mir(v[3])&&typeof v[4]==='string'&&v[4].length<=ART_MAX_CHARS){
  const pts=decodePoints(v[4]);if(!pts||!pts.length)return null;return[k,v[1],v[2],v[3],v[4]];}
 if(k==='p'&&v.length===7&&(v[1]==='c'||v[1]==='t'||v[1]==='h'||v[1]==='r')&&isHex(v[2])&&mir(v[3])&&g(v[4])&&g(v[5])&&sz(v[6]))return['p',v[1],v[2],v[3],v[4],v[5],v[6]];
 if(k==='f'&&v.length===5&&isHex(v[1])&&mir(v[2])&&g(v[3])&&g(v[4]))return['f',v[1],v[2],v[3],v[4]];
 return null;
}
export interface ArtValidation{art:Art|undefined;ok:boolean;error?:string}
/**
 * Checks a stored drawing (type, every op, the size caps). Anything wrong drops the WHOLE drawing (a half-drawing would be a
 * surprise) and reports why; `undefined`/`null` is simply "no drawing". Never throws.
 */
export function validateArt(input:unknown):ArtValidation{
 if(input===undefined||input===null)return{art:undefined,ok:true};
 try{
  if(typeof input!=='object'||Array.isArray(input))return{art:undefined,ok:false,error:'type'};
  const o=input as Record<string,unknown>;
  if(o.v!==1||!Array.isArray(o.ops))return{art:undefined,ok:false,error:'type'};
  if(o.ops.length>ART_MAX_OPS)return{art:undefined,ok:false,error:'size'};
  // a quick size check before decoding anything big
  let raw=0;for(const op of o.ops){if(Array.isArray(op)&&typeof op[4]==='string')raw+=op[4].length;}
  if(raw>ART_MAX_CHARS)return{art:undefined,ok:false,error:'size'};
  const ops:ArtOp[]=[];
  for(const op of o.ops){const c=validateOp(op);if(!c)return{art:undefined,ok:false,error:'op'};ops.push(c);}
  if(!ops.length)return{art:undefined,ok:true};
  const art:Art={v:1,ops};
  if(!artFits(art))return{art:undefined,ok:false,error:'size'};
  return{art,ok:true};
 }catch{return{art:undefined,ok:false,error:'type'};}
}

// ---- rendering -------------------------------------------------------------------------------------------------------------
export interface UnitRect{x:number;y:number;w:number;h:number}
export interface ArtSurface{
 /** Region index under a unit point, or −1 (outside every region). */
 regionAt(u:number,v:number):number;
 rect(region:number):UnitRect;
 /** The mirror image of a unit point (e.g. left/right symmetry), with its region; null when it has none. */
 mirror(u:number,v:number,region:number):[number,number,number]|null;
 /** Brush widths, stamp radii and stripe-band thicknesses in unit lengths, for sizes 0/1/2. */
 brush:readonly[number,number,number];stamp:readonly[number,number,number];band:readonly[number,number,number];
 /** 'h' = a band runs across the region horizontally (constant y); 'v' = vertically (constant x). */
 bandAxis(region:number):'h'|'v';
}
export type Ctx2D=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
type AnyCanvas=HTMLCanvasElement|OffscreenCanvas;
export interface PxRect{x0:number;y0:number;x1:number;y1:number}
export const unionRect=(a:PxRect|null,b:PxRect|null):PxRect|null=>!a?b:!b?a:{x0:Math.min(a.x0,b.x0),y0:Math.min(a.y0,b.y0),x1:Math.max(a.x1,b.x1),y1:Math.max(a.y1,b.y1)};

export function makeCanvas(w:number,h:number):AnyCanvas{
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 return new OffscreenCanvas(w,h);
}
const ctx2d=(c:AnyCanvas)=>c.getContext('2d',{willReadFrequently:false}) as Ctx2D;

/** Soft airbrush dab sprites, cached per colour and pixel radius. */
const dabs=new Map<string,AnyCanvas>();
function dab(color:string,r:number):AnyCanvas{
 const R=Math.max(1,Math.round(r)),key=color+R;let c=dabs.get(key);if(c)return c;
 if(dabs.size>24)dabs.clear();
 c=makeCanvas(R*2,R*2);const x=ctx2d(c),n=parseInt(color.slice(1),16),rgb=`${(n>>16)&255},${(n>>8)&255},${n&255}`;
 const g=x.createRadialGradient(R,R,0,R,R,R);g.addColorStop(0,`rgba(${rgb},.34)`);g.addColorStop(.55,`rgba(${rgb},.2)`);g.addColorStop(1,`rgba(${rgb},0)`);
 x.fillStyle=g;x.fillRect(0,0,R*2,R*2);dabs.set(key,c);return c;
}

/**
 * Draws one stroke point by point, both live (pointer moves) and when replaying a saved op, so the two always match.
 * add() returns the pixel rect it touched (for dirty-rect texture uploads).
 */
export class StrokePainter{
 private last:[{x:number;y:number;r:number}|null,{x:number;y:number;r:number}|null]=[null,null];
 private carry=[0,0];
 constructor(private ctx:Ctx2D,private surf:ArtSurface,private size:number,readonly kind:ArtStrokeKind,readonly sz:ArtSize,readonly color:string,readonly mirror:0|1){}
 /** Grid point in; up = start a new sub-path here. */
 add(gx:number,gy:number,up=false):PxRect|null{
  const u=gx/ART_GRID,v=gy/ART_GRID,r=this.surf.regionAt(u,v);
  if(r<0){this.last=[null,null];return null;}
  let dirty:PxRect|null=this.seg(0,u,v,r,up);
  if(this.mirror){const m=this.surf.mirror(u,v,r);if(m)dirty=unionRect(dirty,this.seg(1,m[0],m[1],m[2],up));else this.last[1]=null;}
  return dirty;
 }
 private seg(k:0|1,u:number,v:number,region:number,up:boolean):PxRect{
  const {ctx,size}=this,x=u*size,y=v*size,w=this.surf.brush[this.sz]*size*(this.kind==='s'?1.7:1);
  const prev=this.last[k],joined=!!prev&&!up&&prev.r===region;
  const rc=this.surf.rect(region);
  ctx.save();ctx.beginPath();ctx.rect(rc.x*size,rc.y*size,rc.w*size,rc.h*size);ctx.clip();
  if(this.kind==='s'){
   const R=w/2,step=Math.max(1,R*.32),sprite=dab(this.color,R);
   if(!joined){ctx.drawImage(sprite as CanvasImageSource,x-R,y-R);this.carry[k]=0;}
   else{const dx=x-prev!.x,dy=y-prev!.y,L=Math.hypot(dx,dy);let t=step-this.carry[k];
    while(t<=L){ctx.drawImage(sprite as CanvasImageSource,prev!.x+dx*t/L-R,prev!.y+dy*t/L-R);t+=step;}
    this.carry[k]=L-(t-step);}
  }else{
   ctx.globalCompositeOperation=this.kind==='e'?'destination-out':'source-over';
   ctx.fillStyle=ctx.strokeStyle=this.kind==='e'?'#000':this.color;
   if(!joined){ctx.beginPath();ctx.arc(x,y,w/2,0,Math.PI*2);ctx.fill();}
   else{ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(prev!.x,prev!.y);ctx.lineTo(x,y);ctx.stroke();}
  }
  ctx.restore();
  this.last[k]={x,y,r:region};
  const p=w/2+2,ax=joined?Math.min(prev!.x,x):x,ay=joined?Math.min(prev!.y,y):y,bx=joined?Math.max(prev!.x,x):x,by=joined?Math.max(prev!.y,y):y;
  return{x0:ax-p,y0:ay-p,x1:bx+p,y1:by+p};
 }
}

function starPath(ctx:Ctx2D,x:number,y:number,r:number){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i&1?r*.45:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();}
function heartPath(ctx:Ctx2D,x:number,y:number,r:number){
 ctx.beginPath();ctx.moveTo(x,y+r*.9);
 ctx.bezierCurveTo(x-r*1.25,y+r*.05,x-r*.95,y-r*.95,x,y-r*.42);
 ctx.bezierCurveTo(x+r*.95,y-r*.95,x+r*1.25,y+r*.05,x,y+r*.9);ctx.closePath();
}
function stampOne(ctx:Ctx2D,surf:ArtSurface,size:number,shape:ArtShape,color:string,u:number,v:number,region:number,sz:ArtSize):PxRect{
 const rc=surf.rect(region),x=u*size,y=v*size;
 ctx.save();ctx.beginPath();ctx.rect(rc.x*size,rc.y*size,rc.w*size,rc.h*size);ctx.clip();ctx.fillStyle=color;
 let out:PxRect;
 if(shape==='r'){
  const t=surf.band[sz]*size;
  if(surf.bandAxis(region)==='h'){ctx.fillRect(rc.x*size,y-t/2,rc.w*size,t);out={x0:rc.x*size,y0:y-t/2-1,x1:(rc.x+rc.w)*size,y1:y+t/2+1};}
  else{ctx.fillRect(x-t/2,rc.y*size,t,rc.h*size);out={x0:x-t/2-1,y0:rc.y*size,x1:x+t/2+1,y1:(rc.y+rc.h)*size};}
 }else{
  const r=surf.stamp[sz]*size;
  if(shape==='c'){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);}else if(shape==='t')starPath(ctx,x,y,r);else heartPath(ctx,x,y,r);
  ctx.fill();out={x0:x-r*1.3-1,y0:y-r*1.3-1,x1:x+r*1.3+1,y1:y+r*1.3+1};
 }
 ctx.restore();return out;
}
export function drawStamp(ctx:Ctx2D,surf:ArtSurface,size:number,op:ArtStamp):PxRect|null{
 const u=op[4]/ART_GRID,v=op[5]/ART_GRID,r=surf.regionAt(u,v);if(r<0)return null;
 let d:PxRect|null=stampOne(ctx,surf,size,op[1],op[2],u,v,r,op[6]);
 if(op[3]){const m=surf.mirror(u,v,r);if(m)d=unionRect(d,stampOne(ctx,surf,size,op[1],op[2],m[0],m[1],m[2],op[6]));}
 return d;
}

// ---- fill bucket --------------------------------------------------------------------------------------------------------------
interface FillMask{canvas:AnyCanvas;rect:UnitRect}
const fillCache=new WeakMap<ArtFill,FillMask[]>();
/** Flood fill of the art layer at FILL_RES inside one region; returns a coloured mask canvas for that region (or null). */
function floodMask(layer:AnyCanvas,layerSize:number,surf:ArtSurface,u:number,v:number,region:number,color:string):FillMask|null{
 const rc=surf.rect(region),N=FILL_RES;
 const x0=Math.floor(rc.x*N),y0=Math.floor(rc.y*N),w=Math.max(1,Math.ceil((rc.x+rc.w)*N)-x0),h=Math.max(1,Math.ceil((rc.y+rc.h)*N)-y0);
 const scratch=makeCanvas(w,h),sx=ctx2d(scratch);
 const k=layerSize/N;
 sx.imageSmoothingEnabled=true;
 sx.drawImage(layer as CanvasImageSource,x0*k,y0*k,w*k,h*k,0,0,w,h);
 const img=sx.getImageData(0,0,w,h),px=img.data;
 const seedX=Math.min(w-1,Math.max(0,Math.floor(u*N)-x0)),seedY=Math.min(h-1,Math.max(0,Math.floor(v*N)-y0));
 const si=(seedY*w+seedX)*4,empty=px[si+3]<64,sr=px[si],sg=px[si+1],sb=px[si+2];
 const match=(i:number)=>{const a=px[i*4+3];if(empty)return a<64;return a>=64&&Math.abs(px[i*4]-sr)+Math.abs(px[i*4+1]-sg)+Math.abs(px[i*4+2]-sb)<96;};
 const mask=new Uint8Array(w*h),stack=[seedX,seedY];
 while(stack.length){
  const y=stack.pop()!,x0s=stack.pop()!;let x=x0s;
  while(x>0&&!mask[y*w+x-1]&&match(y*w+x-1))x--;
  let up=false,down=false;
  for(;x<w&&!mask[y*w+x]&&match(y*w+x);x++){
   mask[y*w+x]=1;
   if(y>0){const m=!mask[(y-1)*w+x]&&match((y-1)*w+x);if(m&&!up){stack.push(x,y-1);up=true;}else if(!m)up=false;}
   if(y<h-1){const m=!mask[(y+1)*w+x]&&match((y+1)*w+x);if(m&&!down){stack.push(x,y+1);down=true;}else if(!m)down=false;}
  }
 }
 // grow by one pixel so no hairline gap shows against the anti-aliased edge of the outline
 const n=parseInt(color.slice(1),16),R=(n>>16)&255,G=(n>>8)&255,B=n&255;
 let any=false;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x;
  const on=mask[i]||(x>0&&mask[i-1])||(x<w-1&&mask[i+1])||(y>0&&mask[i-w])||(y<h-1&&mask[i+w]);
  const o=i*4;if(on){px[o]=R;px[o+1]=G;px[o+2]=B;px[o+3]=255;any=true;}else px[o+3]=0;
 }
 if(!any)return null;
 sx.putImageData(img,0,0);
 return{canvas:scratch,rect:{x:x0/N,y:y0/N,w:w/N,h:h/N}};
}
/** Applies a fill op to the layer (`layerCtx` draws into `layer`). Masks are cached per op, so undo/redo replays are instant. */
export function drawFill(layerCtx:Ctx2D,layer:AnyCanvas,size:number,surf:ArtSurface,op:ArtFill):PxRect|null{
 let masks=fillCache.get(op);
 const u=op[3]/ART_GRID,v=op[4]/ART_GRID,r=surf.regionAt(u,v);if(r<0)return null;
 const apply=(m:FillMask|null)=>{if(!m)return null;
  layerCtx.save();layerCtx.imageSmoothingEnabled=true;layerCtx.globalCompositeOperation='source-over';
  const rc=surf.rect(surf.regionAt(m.rect.x+m.rect.w/2,m.rect.y+m.rect.h/2));
  layerCtx.beginPath();layerCtx.rect(rc.x*size,rc.y*size,rc.w*size,rc.h*size);layerCtx.clip();
  layerCtx.drawImage(m.canvas as CanvasImageSource,m.rect.x*size,m.rect.y*size,m.rect.w*size,m.rect.h*size);layerCtx.restore();
  return{x0:m.rect.x*size-1,y0:m.rect.y*size-1,x1:(m.rect.x+m.rect.w)*size+1,y1:(m.rect.y+m.rect.h)*size+1} as PxRect;};
 if(masks){let d:PxRect|null=null;for(const m of masks)d=unionRect(d,apply(m));return d;}
 masks=[];
 const a=floodMask(layer,size,surf,u,v,r,op[1]);if(a)masks.push(a);let d=apply(a);
 if(op[2]){const m=surf.mirror(u,v,r);if(m){const b=floodMask(layer,size,surf,m[0],m[1],m[2],op[1]);if(b)masks.push(b);d=unionRect(d,apply(b));}}
 fillCache.set(op,masks);
 return d;
}

/** Replays one op into a layer canvas of side `size`. */
export function drawOp(layerCtx:Ctx2D,layer:AnyCanvas,size:number,surf:ArtSurface,op:ArtOp):PxRect|null{
 if(op[0]==='p')return drawStamp(layerCtx,surf,size,op);
 if(op[0]==='f')return drawFill(layerCtx,layer,size,surf,op);
 const pts=decodePoints(op[4]);if(!pts)return null;
 const sp=new StrokePainter(layerCtx,surf,size,op[0],op[1],op[2],op[3]);
 let d:PxRect|null=null;for(const p of pts)d=unionRect(d,sp.add(p.x,p.y,!!p.up));
 return d;
}
/** Clears the layer and replays every op. */
export function renderArt(layerCtx:Ctx2D,layer:AnyCanvas,size:number,surf:ArtSurface,art:Art|undefined|null){
 layerCtx.save();layerCtx.setTransform(1,0,0,1,0,0);layerCtx.clearRect(0,0,size,size);layerCtx.restore();
 if(art)for(const op of art.ops)drawOp(layerCtx,layer,size,surf,op);
}
