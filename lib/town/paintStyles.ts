/**
 * The easel's picture styles (Oct 15 2026; user: "can we make this pink btn show the painting in different styles, alternate
 * through: pastel, water colour, sketch, and a few more", then "not restyle, but give the art style of the view … show the view
 * painted in each of those styles and then the user can modify if they want, or paint their own using a blank"). Pure pixel maths,
 * no DOM and no three.js (tests/paint-easel.cjs runs them on a small fixture, scratch harnesses on a real capture): each style turns
 * the ONE view snapshot the easel takes when you sit down (1024×768, lib/graphics/paintEasel.ts) into a finished picture of the sea,
 * the main island, the lighthouse and the beach, once, on the CPU. The runtime caches the result per style at the paper's size: a tap
 * costs one filter run and one board upload, nothing per frame, nothing at rest.
 *
 * The pink button cycles: Blank paper → Trace (the faint view, a guide under the paint) → Pastel → Watercolour → Sketch → Oil paint
 * → Comic → Dots (pointillism) → Blank paper. The art styles are a full picture under the kid's paint: a "starting canvas" they
 * paint over (the eraser only takes off their own paint, so the picture shows through again), and what you see is what you save.
 * Trace stays a faint guide and is not saved (like tracing paper).
 *
 * Cost (the board shows 512×384, so each style picks its working size): the edge styles (Sketch, Comic, Dots) keep the full 1024×768
 * for clean lines and round dots and are downscaled once by the runtime; the soft styles (Pastel, Watercolour, Oil) work at 512×384
 * from a box-downsampled source. Measured in lib/graphics/paintEasel.ts (`styleMs`); the numbers are in docs/performance-guide.md.
 */
export type PaintStyleId='off'|'trace'|'pastel'|'watercolour'|'sketch'|'oil'|'comic'|'dots';
/** `layer`: 'none' (blank paper), 'guide' (faint, not saved) or 'picture' (the full stylised view under the paint, saved with it). */
export const PAINT_STYLES:readonly {id:PaintStyleId;name:string;layer:'none'|'guide'|'picture'}[]=[
 {id:'off',name:'Blank paper',layer:'none'},
 {id:'trace',name:'Trace',layer:'guide'},
 {id:'pastel',name:'Pastel',layer:'picture'},
 {id:'watercolour',name:'Watercolour',layer:'picture'},
 {id:'sketch',name:'Sketch',layer:'picture'},
 {id:'oil',name:'Oil paint',layer:'picture'},
 {id:'comic',name:'Comic',layer:'picture'},
 {id:'dots',name:'Dots',layer:'picture'},
];
/** How faint the traced view sits under the paint. */
export const TRACE_ALPHA=.3;
export const paintStyle=(id:PaintStyleId)=>PAINT_STYLES.find(s=>s.id===id)??PAINT_STYLES[0];
export const nextPaintStyle=(id:PaintStyleId):PaintStyleId=>{const i=PAINT_STYLES.findIndex(s=>s.id===id);return PAINT_STYLES[(i+1)%PAINT_STYLES.length].id;};
export const isPictureStyle=(id:PaintStyleId)=>paintStyle(id).layer==='picture';

export type Pixels={data:Uint8ClampedArray;width:number;height:number};

// --------------------------------------------------------------------------------------------------------------- the capture
/** A snapshot whose brightness spread (the luma's standard deviation, 0…~80 for a real view) is under this is not the view: an
 *  empty buffer, or sky alone (the scene not drawn yet). The runtime throws it away and tries again on the next frame. */
export const CAPTURE_MIN_SPREAD=6;
/** The luma spread of a picture (standard deviation, on a sparse sample): 0 for a blank or uniform one. */
export function pixelSpread(p:Pixels){
 const d=p.data,n=p.width*p.height;if(!n)return 0;const step=Math.max(1,Math.floor(n/4096));let s=0,s2=0,c=0;
 for(let i=0;i<n;i+=step){const j=i*4,l=.299*d[j]+.587*d[j+1]+.114*d[j+2];s+=l;s2+=l*l;c++;}
 const m=s/c;return Math.sqrt(Math.max(0,s2/c-m*m));
}
/** GPU read-backs come bottom row first: into top row first, and opaque. */
export function flipRows(src:ArrayLike<number>,dst:Uint8ClampedArray,w:number,h:number){
 const row=w*4;for(let y=0;y<h;y++){const s=(h-1-y)*row,t=y*row;for(let x=0;x<row;x+=4){dst[t+x]=src[s+x];dst[t+x+1]=src[s+x+1];dst[t+x+2]=src[s+x+2];dst[t+x+3]=255;}}
}

// ------------------------------------------------------------------------------------------------------------------- helpers
/** A stable hash of an integer cell: 0…1. */
function hash(x:number,y:number,seed:number){let h=(x|0)*374761393+(y|0)*668265263+(seed|0)*2147483647;h=(h^(h>>>13))*1274126177;h^=h>>>16;return (h>>>0)/4294967296;}
/** Smooth value noise (cell size 1), 0…1. */
function noise(x:number,y:number,seed:number){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=hash(xi,yi,seed),b=hash(xi+1,yi,seed),c=hash(xi,yi+1,seed),d=hash(xi+1,yi+1,seed);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
const fbm=(x:number,y:number,seed:number)=>(noise(x,y,seed)*.6+noise(x*2.1,y*2.1,seed+7)*.3+noise(x*4.3,y*4.3,seed+13)*.1);
const clamp=(v:number)=>v<0?0:v>255?255:v;
const clamp01=(v:number)=>v<0?0:v>1?1:v;
const smoothstep=(a:number,b:number,v:number)=>{const t=clamp01((v-a)/(b-a));return t*t*(3-2*t);};
type Planes={r:Float32Array;g:Float32Array;b:Float32Array;w:number;h:number};
const newPlanes=(w:number,h:number,fill?:readonly number[]):Planes=>({r:new Float32Array(w*h).fill(fill?fill[0]:0),g:new Float32Array(w*h).fill(fill?fill[1]:0),b:new Float32Array(w*h).fill(fill?fill[2]:0),w,h});
function planes(src:Pixels):Planes{const n=src.width*src.height,r=new Float32Array(n),g=new Float32Array(n),b=new Float32Array(n),d=src.data;
 for(let i=0;i<n;i++){r[i]=d[i*4];g[i]=d[i*4+1];b[i]=d[i*4+2];}return {r,g,b,w:src.width,h:src.height};}
const lum=(p:Planes)=>{const n=p.w*p.h,l=new Float32Array(n);for(let i=0;i<n;i++)l[i]=.299*p.r[i]+.587*p.g[i]+.114*p.b[i];return l;};
/** Separable box blur of one plane (radius r, edges clamped). */
function blur(a:Float32Array,w:number,h:number,r:number){if(r<1)return a.slice();const t=new Float32Array(w*h),o=new Float32Array(w*h),k=1/(2*r+1);
 for(let y=0;y<h;y++){const row=y*w;let s=0;for(let i=-r;i<=r;i++)s+=a[row+Math.min(w-1,Math.max(0,i))];
  for(let x=0;x<w;x++){t[row+x]=s*k;s+=a[row+Math.min(w-1,x+r+1)]-a[row+Math.max(0,x-r)];}}
 for(let x=0;x<w;x++){let s=0;for(let i=-r;i<=r;i++)s+=t[Math.min(h-1,Math.max(0,i))*w+x];
  for(let y=0;y<h;y++){o[y*w+x]=s*k;s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x];}}
 return o;}
const blurPlanes=(p:Planes,r:number):Planes=>({r:blur(p.r,p.w,p.h,r),g:blur(p.g,p.w,p.h,r),b:blur(p.b,p.w,p.h,r),w:p.w,h:p.h});
/** Sobel gradient of a plane: magnitude and direction components. */
function sobel(l:Float32Array,w:number,h:number){const m=new Float32Array(w*h),gx=new Float32Array(w*h),gy=new Float32Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const X0=Math.max(0,x-1),X1=Math.min(w-1,x+1),Y0=Math.max(0,y-1)*w,Y1=Math.min(h-1,y+1)*w,Y=y*w;
  const a=l[Y0+X1]+2*l[Y+X1]+l[Y1+X1]-l[Y0+X0]-2*l[Y+X0]-l[Y1+X0],b=l[Y1+X0]+2*l[Y1+x]+l[Y1+X1]-l[Y0+X0]-2*l[Y0+x]-l[Y0+X1];
  gx[Y+x]=a;gy[Y+x]=b;m[Y+x]=Math.sqrt(a*a+b*b);}
 return {m,gx,gy};}
/** Box-downsample by an integer factor (the soft styles work at the paper's size from the 1024×768 capture). */
function downsample(p:Planes,f:number):Planes{if(f<=1)return p;const w=Math.floor(p.w/f),h=Math.floor(p.h/f),o=newPlanes(w,h),k=1/(f*f);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let r=0,g=0,b=0;for(let j=0;j<f;j++){const row=(y*f+j)*p.w+x*f;for(let i=0;i<f;i++){r+=p.r[row+i];g+=p.g[row+i];b+=p.b[row+i];}}
  const i=y*w+x;o.r[i]=r*k;o.g[i]=g*k;o.b[i]=b*k;}
 return o;}
/** The planes at about `target` px on the long side (a whole-number downsample), for the styles that work small. */
const fit=(p:Planes,target:number)=>downsample(p,Math.max(1,Math.floor(Math.max(p.w,p.h)/target)));
/** Bilinear sample of a plane. */
function sample(a:Float32Array,w:number,h:number,x:number,y:number){x=x<0?0:x>w-1.001?w-1.001:x;y=y<0?0:y>h-1.001?h-1.001:y;
 const xi=x|0,yi=y|0,fx=x-xi,fy=y-yi,i=yi*w+xi;return a[i]*(1-fx)*(1-fy)+a[i+1]*fx*(1-fy)+a[i+w]*(1-fx)*fy+a[i+w+1]*fx*fy;}
/** A plane of smooth noise at a coarse grid (cell px), to be sampled bilinearly: the cheap way to put noise under every pixel. */
function noisePlane(w:number,h:number,cell:number,scale:number,seed:number,octaves=1){const gw=Math.ceil(w/cell)+1,gh=Math.ceil(h/cell)+1,o=new Float32Array(gw*gh);
 for(let y=0;y<gh;y++)for(let x=0;x<gw;x++)o[y*gw+x]=octaves>1?fbm(x*cell/scale,y*cell/scale,seed):noise(x*cell/scale,y*cell/scale,seed);return {a:o,gw,gh,cell};}
type NoisePlane=ReturnType<typeof noisePlane>;
const at=(n:NoisePlane,x:number,y:number)=>sample(n.a,n.gw,n.gh,x/n.cell,y/n.cell);
/** Kuwahara filter (radius r): each pixel takes the mean colour of the calmest of its four overlapping quadrants: flat, painterly
 *  patches with crisp edges. Summed-area tables keep it O(pixels) whatever the radius. */
function kuwahara(p:Planes,r:number):Planes{
 const {w,h}=p,W=w+1,n=W*(h+1),L=lum(p);const S=[new Float64Array(n),new Float64Array(n),new Float64Array(n),new Float64Array(n),new Float64Array(n)];
 const ch=[p.r,p.g,p.b,L];
 for(let y=0;y<h;y++){const rs=[0,0,0,0,0];for(let x=0;x<w;x++){const i=y*w+x;for(let c=0;c<4;c++)rs[c]+=ch[c][i];rs[4]+=L[i]*L[i];
  const o=(y+1)*W+x+1;for(let c=0;c<5;c++)S[c][o]=S[c][o-W]+rs[c];}}
 const box=(c:number,x0:number,y0:number,x1:number,y1:number)=>S[c][y1*W+x1]-S[c][y0*W+x1]-S[c][y1*W+x0]+S[c][y0*W+x0];
 const out=newPlanes(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let best=Infinity,bi=0,bx0=0,by0=0,bx1=0,by1=0;
  for(let q=0;q<4;q++){const x0=Math.max(0,q&1?x:x-r),x1=Math.min(w,(q&1?x+r:x)+1),y0=Math.max(0,q&2?y:y-r),y1=Math.min(h,(q&2?y+r:y)+1);
   const cnt=(x1-x0)*(y1-y0),m=box(3,x0,y0,x1,y1)/cnt,v=box(4,x0,y0,x1,y1)/cnt-m*m;if(v<best){best=v;bi=cnt;bx0=x0;by0=y0;bx1=x1;by1=y1;}}
  const i=y*w+x;out.r[i]=box(0,bx0,by0,bx1,by1)/bi;out.g[i]=box(1,bx0,by0,bx1,by1)/bi;out.b[i]=box(2,bx0,by0,bx1,by1)/bi;}
 return out;}
function saturate(p:Planes,k:number,lift=0,gain=1){const n=p.w*p.h;for(let i=0;i<n;i++){const l=.299*p.r[i]+.587*p.g[i]+.114*p.b[i];
 p.r[i]=(l+(p.r[i]-l)*k)*gain+lift;p.g[i]=(l+(p.g[i]-l)*k)*gain+lift;p.b[i]=(l+(p.b[i]-l)*k)*gain+lift;}return p;}
/** Thin, clean outlines from a gradient: non-maximum suppression along the gradient, hysteresis (weak edges kept only next to
 *  strong ones), then speckle removal (a kept pixel needs company in its 5×5). Returns 0…1 line strength per pixel. */
function outlines(g:{m:Float32Array;gx:Float32Array;gy:Float32Array},w:number,h:number,lo:number,hi:number){
 const {m,gx,gy}=g,keep=new Uint8Array(w*h);
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,v=m[i];if(v<lo)continue;const ax=Math.abs(gx[i]),ay=Math.abs(gy[i]);let a:number,b:number;
  if(ax>2.414*ay){a=m[i-1];b=m[i+1];}else if(ay>2.414*ax){a=m[i-w];b=m[i+w];}else if((gx[i]>0)===(gy[i]>0)){a=m[i-w-1];b=m[i+w+1];}else{a=m[i-w+1];b=m[i+w-1];}
  if(v>=a&&v>=b)keep[i]=v>=hi?2:1;}
 // Hysteresis: weak pixels touching strong ones become strong (two passes reach along a line).
 for(let pass=0;pass<2;pass++)for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(keep[i]!==1)continue;
  if(keep[i-1]===2||keep[i+1]===2||keep[i-w]===2||keep[i+w]===2||keep[i-w-1]===2||keep[i-w+1]===2||keep[i+w-1]===2||keep[i+w+1]===2)keep[i]=2;}
 const out=new Float32Array(w*h);
 for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){const i=y*w+x;if(keep[i]!==2)continue;let c=0;
  for(let j=-2;j<=2;j++)for(let k=-2;k<=2;k++)if(keep[i+j*w+k]===2)c++;
  if(c>=4)out[i]=smoothstep(lo,hi*2,m[i]);}
 return out;}
/** Thickens lines: the max over a (2r+1) square (separable), so a thin outline becomes a bold one. */
function thicken(a:Float32Array,w:number,h:number,r:number){if(r<1)return a;const t=new Float32Array(w*h),o=new Float32Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let m=0;for(let i=Math.max(0,x-r);i<=Math.min(w-1,x+r);i++)if(a[y*w+i]>m)m=a[y*w+i];t[y*w+x]=m;}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let m=0;for(let j=Math.max(0,y-r);j<=Math.min(h-1,y+r);j++)if(t[j*w+x]>m)m=t[j*w+x];o[y*w+x]=m;}
 return o;}
function toPixels(p:Planes):Pixels{const n=p.w*p.h,d=new Uint8ClampedArray(n*4);for(let i=0;i<n;i++){d[i*4]=p.r[i];d[i*4+1]=p.g[i];d[i*4+2]=p.b[i];d[i*4+3]=255;}
 return {data:d,width:p.w,height:p.h};}
/** Paper and canvas colours. */
const CREAM=[251,246,234],SKETCH_PAPER=[247,241,224],GRAPHITE=[52,54,64],INK=[22,24,30],CANVAS=[244,238,222];
/** A 64×64 tile of hashed grain, looked up by (x, y): bristles, tooth and granulation without a hash per pixel. */
function grainTile(seed:number){const t=new Float32Array(4096);for(let i=0;i<4096;i++)t[i]=hash(i&63,i>>6,seed);return t;}
const grainAt=(t:Float32Array,x:number,y:number)=>t[((y&63)<<6)|(x&63)];

// ------------------------------------------------------------------------------------------------------------------- the styles
/** Pastel (works at 512): soft chalk on toothy paper. The shapes are simplified and smudged along the diagonal, the colours lifted
 *  and muted, broad diagonal chalk strokes lighten and darken the colour, the paper's tooth shows through where the chalk skipped,
 *  and the light parts get chalk-white highlights. */
function pastel(src:Planes,seed:number):Planes{
 const p=fit(src,512),{w,h}=p,k=Math.max(w,h)/512,soft=saturate(kuwahara(blurPlanes(p,1),Math.max(1,Math.round(2*k))),.95);
 const streak=noisePlane(w,h,2,1,seed),fine=noisePlane(w,h,2,1,seed+1),smear=noisePlane(w,h,4,11*k,seed+2),press=noisePlane(w,h,4,26*k,seed+3,2);
 // The streak planes are read along the diagonal: (x+y) runs along a stroke, (x−y) across it (long and thin).
 const out=newPlanes(w,h),tile=grainTile(seed+4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,u=(x+.3*y)/k,v=(y-.3*x)/k;
  const raw=(sample(streak.a,streak.gw,streak.gh,u/40,v/7)-.5)*.8+(sample(fine.a,fine.gw,fine.gh,u/12,v/3.2)-.5)*.5;
  // Chalk strokes have edges: the streak noise is banded into light and dark strokes rather than a smooth shimmer.
  const st=(smoothstep(-.14,.14,raw)*2-1)*.5+raw*.5;
  // Smudged edges: the colour is read a little way along the diagonal, by a slow wander.
  const sm=(at(smear,x,y)-.5)*3.5*k,sx=x+sm,sy=y+sm*.3;
  const cr=sample(soft.r,w,h,sx,sy),cg=sample(soft.g,w,h,sx,sy),cb=sample(soft.b,w,h,sx,sy),l=(.299*cr+.587*cg+.114*cb)/255;
  const tooth=grainAt(tile,x,y)*.7+at(press,x,y)*.3,skip=smoothstep(.72,.96,tooth+.08*smoothstep(.55,.95,l)+.12*Math.max(0,st))*.65;
  const hi=smoothstep(.6,.9,l)*smoothstep(.1,.35,st)*.4;
  const cols=[cr,cg,cb];for(let c=0;c<3;c++){let val=cols[c]*.8+255*.2+st*30;val+=(255-val)*hi;val=val*(1-skip)+CREAM[c]*skip;(c===0?out.r:c===1?out.g:out.b)[i]=val;}}
 return out;}
/** Watercolour (works at 512): transparent washes on cream paper. The colours bleed across edges (read through a wobble, then
 *  mixed with a blurred copy), pigment pools darker along every wash's edge and in hollows, the paper granulates the wash, the
 *  brightest parts are left as bare paper, and the wash runs out before the paper's edge (a loose, uneven border). */
function watercolour(src:Planes,seed:number):Planes{
 const p=fit(src,512),{w,h}=p,k=Math.max(w,h)/512;
 const wx=noisePlane(w,h,4,20*k,seed),wy=noisePlane(w,h,4,20*k,seed+5),mix=noisePlane(w,h,4,34*k,seed+6),gran=noisePlane(w,h,2,6*k,seed+11,2),rim=noisePlane(w,h,4,28*k,seed+23,2);
 const wob=newPlanes(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,dx=(at(wx,x,y)-.5)*6*k,dy=(at(wy,x,y)-.5)*6*k;
  wob.r[i]=sample(p.r,w,h,x+dx,y+dy);wob.g[i]=sample(p.g,w,h,x+dx,y+dy);wob.b[i]=sample(p.b,w,h,x+dx,y+dy);}
 const wash=saturate(kuwahara(blurPlanes(wob,1),Math.round(3*k)),1.3),bleed=blurPlanes(wash,Math.round(5*k));
 const L=lum(wash),edge=sobel(blur(L,w,h,1),w,h).m,soft=blur(L,w,h,Math.round(6*k)),out=newPlanes(w,h),tile=grainTile(seed+17);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,m=.3+.45*at(mix,x,y);
  const cr=wash.r[i]+(bleed.r[i]-wash.r[i])*m,cg=wash.g[i]+(bleed.g[i]-wash.g[i])*m,cb=wash.b[i]+(bleed.b[i]-wash.b[i])*m,l=.299*cr+.587*cg+.114*cb;
  // Pigment pools at a wash's edge (a darker rim) and where it is darker than its surroundings; the brightest parts stay bare paper.
  const pool=1+smoothstep(12,90,edge[i])*.34+Math.max(0,Math.min(.14,(soft[i]-L[i])/255*.8));
  const grain=.9+.14*at(gran,x,y)+(grainAt(tile,x,y)-.5)*.08;
  const bare=1-smoothstep(205,248,l)*.9;
  // The border: the wash fades to bare paper unevenly near the edges, pooling darker just inside its outline.
  const e=Math.min(x,y,w-1-x,h-1-y)/k+(at(rim,x,y)-.5)*26,cover=smoothstep(5,15,e),wet=1+.3*smoothstep(4,9,e)*(1-smoothstep(9,18,e));
  const density=Math.min(1.25,pool*grain*wet)*bare*cover,cols=[cr,cg,cb];
  for(let c=0;c<3;c++){const paper=CREAM[c],ink=255-(255-cols[c])*.92;(c===0?out.r:c===1?out.g:out.b)[i]=paper-(paper-ink)*density;}}
 return out;}
/** Sketch (works at the capture's full size): a pencil drawing on cream paper. Thin continuous graphite outlines where the picture
 *  has edges, hatching in the darker parts (one way, then cross-hatched, then a third set in the darkest), a faint graphite tone
 *  over the mid-tones so the sea and the beach still read, and the paper's grain. No colour. */
function sketch(src:Planes,seed:number):Planes{
 const {w,h}=src,k=Math.max(w,h)/512,L=blur(lum(src),w,h,1),g=sobel(L,w,h);
 const lines=thicken(outlines(g,w,h,22,55),w,h,Math.max(0,Math.round(k*.6))),Ls=blur(L,w,h,Math.max(1,Math.round(3*k)));
 const out=newPlanes(w,h),tile=grainTile(seed+5),brk=noisePlane(w,h,4,7*k,seed+1),brk2=noisePlane(w,h,4,7*k,seed+2),wash=noisePlane(w,h,8,30*k,seed+9,2);
 // Spread the tones over the whole range so a pale view still gets some hatching.
 let lo=255,hi=0;for(let i=0;i<w*h;i+=7){lo=Math.min(lo,Ls[i]);hi=Math.max(hi,Ls[i]);}const span=Math.max(40,hi-lo);
 const P=Math.max(4,Math.round(7*k)),half=Math.max(.8,1.1*k);
 const line=(t:number)=>{const d=((t%P)+P)%P;return clamp01(1-Math.abs(d-P/2)/half);};// a ~2k px pencil line every P px
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,dark=1-(Ls[i]-lo)/span;
  // Each hatch line is a run of short strokes: it lifts off the paper now and then, and presses harder or lighter along its length.
  let ink=lines[i]*.92;const wv=at(wash,x,y);
  if(dark>.38){const b1=smoothstep(.3,.42,at(brk,x,y)),b2=smoothstep(.3,.42,at(brk2,x,y));
   ink=Math.max(ink,line(x+y)*b1*(.4+.25*b2)*smoothstep(.38,.52,dark));
   if(dark>.6)ink=Math.max(ink,line(x-y+3)*b2*(.4+.25*b1)*smoothstep(.6,.74,dark));
   if(dark>.8)ink=Math.max(ink,line(x+2)*.5*smoothstep(.8,.92,dark));}
  ink=Math.max(ink,smoothstep(.2,.9,dark)*.13*(.7+.6*wv));
  const grain=(grainAt(tile,x,y)-.5)*9*(1-ink)+(wv-.5)*7;
  for(let c=0;c<3;c++)(c===0?out.r:c===1?out.g:out.b)[i]=SKETCH_PAPER[c]+(GRAPHITE[c]-SKETCH_PAPER[c])*ink+grain;}
 return out;}
/** Oil paint (works at 512): thick brush strokes on canvas. A Kuwahara underpainting in saturated colour, then two passes of short
 *  strokes that follow the shapes (along the edges where there are any, long and nearly level across the sea and sky), each with
 *  bristle ridges, a lit upper edge and a shaded lower one (impasto), a finer pass along the edges so they stay crisp, and the
 *  canvas weave under it all. */
function oil(src:Planes,seed:number):Planes{
 const p=fit(src,512),{w,h}=p,k=Math.max(w,h)/512,base=saturate(kuwahara(p,Math.max(1,Math.round(2*k))),1.5,-8,1.1);
 const out=newPlanes(w,h,CANVAS);
 const g=sobel(blur(lum(p),w,h,Math.round(3*k)),w,h),flow=noisePlane(w,h,8,70*k,seed+9),tile=grainTile(seed),inv=1/Math.max(.5,k);
 const stroke=(cx:number,cy:number,len:number,half:number,id:number,strength:number,detail:boolean)=>{
  const sx=Math.max(1,Math.min(w-2,Math.round(cx))),sy=Math.max(1,Math.min(h-2,Math.round(cy))),si=sy*w+sx;
  // Along the edges where there are any; otherwise nearly level with a little wander. Short dabs where there is detail (the
  // town, the lighthouse, the palms), so the shapes keep their colour; the detail pass keeps the colour as it is.
  const gm=g.m[si],free=(at(flow,cx,cy)-.5)*.7,ang=gm>9?Math.atan2(g.gy[si],g.gx[si])+Math.PI/2:free;
  if(!detail)len*=1/(1+gm/24);
  const ca=Math.cos(ang),sa=Math.sin(ang),tint=detail?0:(hash(id,7,seed)-.5)*26,val=(hash(id,8,seed)-.5)*(detail?10:28);
  const cr=base.r[si]+tint+val,cg=base.g[si]-tint*.5+val,cb=base.b[si]-tint*.3+val;
  const ext=Math.ceil(len+half),x0=Math.max(0,Math.floor(cx-ext)),x1=Math.min(w-1,Math.ceil(cx+ext)),y0=Math.max(0,Math.floor(cy-ext)),y1=Math.min(h-1,Math.ceil(cy+ext));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const dx=x-cx,dy=y-cy,along=dx*ca+dy*sa,across=-dx*sa+dy*ca;
   const aa=along<0?-along:along,ac=across<0?-across:across;if(aa>len||ac>half)continue;
   const a=clamp01((half-ac)*inv*1.5)*clamp01((len-aa)*inv*.6)*strength;if(a<=0)continue;
   // Thick paint: bristle ridges along the stroke, the light catching its upper edge, a shadow under its lower one.
   const t=across/half,bristle=(grainAt(tile,Math.round((t+1)*2.5)+id*3,id+Math.round(along*inv*.06))-.5)*22,ridge=t<-.4?30*((-t-.4)/.6):t>.45?-28*((t-.45)/.55):0;
   const i=y*w+x;out.r[i]+=(cr+bristle+ridge-out.r[i])*a;out.g[i]+=(cg+bristle+ridge-out.g[i])*a;out.b[i]+=(cb+bristle+ridge-out.b[i])*a;}};
 // Pass 1: broad strokes everywhere (two staggered grids). Pass 2: short fine strokes along the edges, so the shapes stay crisp.
 const step=8*k;let id=0;
 for(let pass=0;pass<2;pass++)for(let gy=-1;gy*step<h+step;gy++)for(let gx=-1;gx*step<w+step;gx++){id++;
  const cx=(gx+(pass?.5:0)+(hash(gx,gy,seed+pass)-.5)*.8)*step,cy=(gy+(pass?.5:0)+(hash(gy,gx,seed+pass+2)-.5)*.8)*step;
  stroke(cx,cy,(8+hash(gx,gy,seed+5+pass)*8)*k,(3+hash(gy,gx,seed+6+pass)*1.6)*k,id,1,false);}
 const fine=3.5*k;
 for(let gy=0;gy*fine<h;gy++)for(let gx=0;gx*fine<w;gx++){const cx=(gx+hash(gx,gy,seed+31)-.5)*fine,cy=(gy+hash(gy,gx,seed+32)-.5)*fine;
  const si=Math.max(0,Math.min(h-1,Math.round(cy)))*w+Math.max(0,Math.min(w-1,Math.round(cx)));if(g.m[si]<14)continue;id++;
  stroke(cx,cy,(3+hash(gx,gy,seed+33)*3)*k,(1.4+hash(gy,gx,seed+34)*.8)*k,id,.95,true);}
 // The canvas weave, faintly, under everything.
 const wv=Math.max(1,Math.round(k));for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,v=(((x/wv)|0)+((y/wv)|0))%2?2.5:-2.5;out.r[i]+=v;out.g[i]+=v;out.b[i]+=v;}
 return out;}
/** Comic (ink at the capture's full size, colour from a Kuwahara at 512): flat posterised colours (6 levels a channel), bold clean
 *  black outlines (thinned edges, no speckle, thickened), halftone dots in the shadows, and a thin black panel border. */
function comic(src:Planes,seed:number):Planes{
 void seed;const {w,h}=src,k=Math.max(w,h)/512,small=saturate(kuwahara(fit(src,512),3),1.35),sx=small.w/w,sy=small.h/h;
 const L=blur(lum(src),w,h,1),lines=thicken(outlines(sobel(L,w,h),w,h,34,95),w,h,Math.max(1,Math.round(k)));
 const out=newPlanes(w,h),D=Math.max(4,Math.round(9*k)),inset=Math.round(8*k),bw=Math.max(2,Math.round(3*k));
 const post=(v:number)=>Math.round(v/51)*51;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,X=x*sx,Y=y*sy;
  let r=post(sample(small.r,small.w,small.h,X,Y)),g=post(sample(small.g,small.w,small.h,X,Y)),b=post(sample(small.b,small.w,small.h,X,Y));
  const l=.299*r+.587*g+.114*b;
  // Halftone in the shadows: bigger dots the darker it is, in a darker tint of the colour under them.
  if(l<112){const cx=(x%D)-D/2+.5,cy=(y%D)-D/2+.5,rad=D*.52*Math.sqrt((112-l)/112);if(cx*cx+cy*cy<rad*rad){r*=.5;g*=.5;b*=.55;}}
  const edge=Math.min(x,y,w-1-x,h-1-y),ink=Math.max(lines[i],edge>=inset&&edge<inset+bw?1:0);
  out.r[i]=r+(INK[0]-r)*ink;out.g[i]=g+(INK[1]-g)*ink;out.b[i]=b+(INK[2]-b)*ink;}
 return out;}
/** Dots, pointillism (at the capture's full size): the picture built from round dabs in three sizes on cream paper, big ones over
 *  the sea and the sky, small ones where there is detail (the island, the palms, the beach line), each in the local colour nudged
 *  a little, with complementary accents here and there (the eye mixes them back). */
function dots(src:Planes,seed:number):Planes{
 const {w,h}=src,k=Math.max(w,h)/512,base=saturate(blurPlanes(fit(src,512),1),1.45,0,1.03),bx=base.w/w,by=base.h/h;
 const detail=sobel(blur(lum(base),base.w,base.h,1),base.w,base.h).m,out=newPlanes(w,h,CREAM);
 const passes=[{step:7.2*k,rad:4.4*k,min:0},{step:4.6*k,rad:2.9*k,min:0},{step:2.6*k,rad:1.5*k,min:12}];
 for(let pass=0;pass<passes.length;pass++){const {step,rad:R,min}=passes[pass];
  for(let gy=0;gy*step<h+step;gy++)for(let gx=0;gx*step<w+step;gx++){
   const cx=(gx+(hash(gx,gy,seed+pass*31)-.5)*.9)*step,cy=(gy+(hash(gy,gx,seed+pass*37)-.5)*.9)*step,X=cx*bx,Y=cy*by;
   if(min&&sample(detail,base.w,base.h,X,Y)<min)continue;
   let cr=sample(base.r,base.w,base.h,X,Y),cg=sample(base.g,base.w,base.h,X,Y),cb=sample(base.b,base.w,base.h,X,Y);
   const j=hash(gx,gy,seed+41+pass),accent=j<.02&&pass===1&&.299*cr+.587*cg+.114*cb<190;// not over the pale sky
   if(accent){// a complementary accent now and then, softened toward the dot's own colour
    const l=.299*cr+.587*cg+.114*cb;cr=(255-cr)*.3+l*.7;cg=(255-cg)*.3+l*.7;cb=(255-cb)*.3+l*.7;}
   else{const jit=pass<2?36:22;cr+=(hash(gx,gy,seed+43+pass)-.5)*jit;cg+=(hash(gx,gy,seed+47+pass)-.5)*jit;cb+=(hash(gx,gy,seed+53+pass)-.5)*jit;}
   cr=clamp(cr);cg=clamp(cg);cb=clamp(cb);const rad=R*(.8+hash(gx,gy,seed+59+pass)*.4),alpha=accent?.75:.95,r2=(rad+.5)*(rad+.5),rin=rad-.5;
   // Row spans: only the rim needs the square root.
   for(let y=Math.max(0,Math.ceil(cy-rad-.5));y<=Math.min(h-1,Math.floor(cy+rad+.5));y++){const dy=y-cy,hw=Math.sqrt(Math.max(0,r2-dy*dy));
    for(let x=Math.max(0,Math.ceil(cx-hw));x<=Math.min(w-1,Math.floor(cx+hw));x++){const dx=x-cx,d2=dx*dx+dy*dy;
     const a=(d2<rin*rin?1:clamp01(rad-Math.sqrt(d2)+.5))*alpha;if(a<=0)continue;const i=y*w+x;
     out.r[i]+=(cr-out.r[i])*a;out.g[i]+=(cg-out.g[i])*a;out.b[i]+=(cb-out.b[i])*a;}}}}
 return out;}

const FILTERS:Record<Exclude<PaintStyleId,'off'|'trace'>,(p:Planes,seed:number)=>Planes>={pastel,watercolour,sketch,oil,comic,dots};
/** The picture for an art style, made from the view snapshot (opaque RGBA; the same 4:3 shape, at the style's working size: the
 *  source's, or a whole-number fraction of it). Null for Blank paper and Trace (no picture). */
export function applyPaintStyle(id:PaintStyleId,src:Pixels,seed=7):Pixels|null{
 if(!isPictureStyle(id))return null;const f=FILTERS[id as keyof typeof FILTERS];if(!f||!src.width||!src.height)return null;
 return toPixels(f(planes(src),seed));
}
