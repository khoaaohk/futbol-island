/**
 * The easel's picture styles (Oct 15 2026; user: "can we make this pink btn show the painting in different styles, alternate
 * through: pastel, water colour, sketch, and a few more"). Pure pixel maths, no DOM and no three.js (tests/paint-easel.cjs runs them
 * on a small fixture): each style turns the ONE view snapshot the easel takes when you sit down into a picture, once, on the CPU.
 * The runtime (lib/graphics/paintEasel.ts) caches the result per style: a tap costs one filter run and one board upload, nothing
 * per frame, nothing at rest.
 *
 * The pink button cycles: Blank paper → Trace (the faint view, a guide under the paint) → Pastel → Watercolour → Sketch → Oil paint
 * → Comic → Dots (pointillism) → Blank paper. The art styles are a full picture under the kid's paint: a "starting canvas" they
 * paint over (the eraser only takes off their own paint, so the picture shows through again), and what you see is what you save.
 * Trace stays a faint guide and is not saved (like tracing paper).
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

// ------------------------------------------------------------------------------------------------------------------- helpers
/** A stable hash of an integer cell: 0…1. */
function hash(x:number,y:number,seed:number){let h=(x|0)*374761393+(y|0)*668265263+(seed|0)*2147483647;h=(h^(h>>>13))*1274126177;h^=h>>>16;return (h>>>0)/4294967296;}
/** Smooth value noise (cell size 1), 0…1. */
function noise(x:number,y:number,seed:number){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=hash(xi,yi,seed),b=hash(xi+1,yi,seed),c=hash(xi,yi+1,seed),d=hash(xi+1,yi+1,seed);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
const fbm=(x:number,y:number,seed:number)=>(noise(x,y,seed)*.6+noise(x*2.1,y*2.1,seed+7)*.3+noise(x*4.3,y*4.3,seed+13)*.1);
const clamp=(v:number)=>v<0?0:v>255?255:v;
const smoothstep=(a:number,b:number,v:number)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
type Planes={r:Float32Array;g:Float32Array;b:Float32Array;w:number;h:number};
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
/** Sobel gradient magnitude of a plane. */
function sobel(l:Float32Array,w:number,h:number){const o=new Float32Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const X0=Math.max(0,x-1),X1=Math.min(w-1,x+1),Y0=Math.max(0,y-1)*w,Y1=Math.min(h-1,y+1)*w,Y=y*w;
  const gx=l[Y0+X1]+2*l[Y+X1]+l[Y1+X1]-l[Y0+X0]-2*l[Y+X0]-l[Y1+X0],gy=l[Y1+X0]+2*l[Y1+x]+l[Y1+X1]-l[Y0+X0]-2*l[Y0+x]-l[Y0+X1];
  o[Y+x]=Math.sqrt(gx*gx+gy*gy);}
 return o;}
/** Kuwahara filter (radius r): each pixel takes the mean colour of the calmest of its four overlapping quadrants: flat, painterly
 *  patches with crisp edges. Summed-area tables keep it O(pixels) whatever the radius. */
function kuwahara(p:Planes,r:number):Planes{
 const {w,h}=p,W=w+1,n=W*(h+1),L=lum(p);const S=[new Float64Array(n),new Float64Array(n),new Float64Array(n),new Float64Array(n),new Float64Array(n)];
 const ch=[p.r,p.g,p.b,L];
 for(let y=0;y<h;y++){const rs=[0,0,0,0,0];for(let x=0;x<w;x++){const i=y*w+x;for(let c=0;c<4;c++)rs[c]+=ch[c][i];rs[4]+=L[i]*L[i];
  const o=(y+1)*W+x+1;for(let c=0;c<5;c++)S[c][o]=S[c][o-W]+rs[c];}}
 const box=(c:number,x0:number,y0:number,x1:number,y1:number)=>S[c][y1*W+x1]-S[c][y0*W+x1]-S[c][y1*W+x0]+S[c][y0*W+x0];
 const out:Planes={r:new Float32Array(w*h),g:new Float32Array(w*h),b:new Float32Array(w*h),w,h};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let best=Infinity,bi=0,bx0=0,by0=0,bx1=0,by1=0;
  for(let q=0;q<4;q++){const x0=Math.max(0,q&1?x:x-r),x1=Math.min(w,(q&1?x+r:x)+1),y0=Math.max(0,q&2?y:y-r),y1=Math.min(h,(q&2?y+r:y)+1);
   const cnt=(x1-x0)*(y1-y0),m=box(3,x0,y0,x1,y1)/cnt,v=box(4,x0,y0,x1,y1)/cnt-m*m;if(v<best){best=v;bi=cnt;bx0=x0;by0=y0;bx1=x1;by1=y1;}}
  const i=y*w+x;out.r[i]=box(0,bx0,by0,bx1,by1)/bi;out.g[i]=box(1,bx0,by0,bx1,by1)/bi;out.b[i]=box(2,bx0,by0,bx1,by1)/bi;}
 return out;}
function saturate(p:Planes,k:number,lift=0,gain=1){const n=p.w*p.h;for(let i=0;i<n;i++){const l=.299*p.r[i]+.587*p.g[i]+.114*p.b[i];
 p.r[i]=(l+(p.r[i]-l)*k)*gain+lift;p.g[i]=(l+(p.g[i]-l)*k)*gain+lift;p.b[i]=(l+(p.b[i]-l)*k)*gain+lift;}return p;}
/** Bilinear sample of a plane. */
function sample(a:Float32Array,w:number,h:number,x:number,y:number){x=Math.max(0,Math.min(w-1.001,x));y=Math.max(0,Math.min(h-1.001,y));
 const xi=x|0,yi=y|0,fx=x-xi,fy=y-yi,i=yi*w+xi;return a[i]*(1-fx)*(1-fy)+a[i+1]*fx*(1-fy)+a[i+w]*(1-fx)*fy+a[i+w+1]*fx*fy;}
function toPixels(p:Planes):Pixels{const n=p.w*p.h,d=new Uint8ClampedArray(n*4);for(let i=0;i<n;i++){d[i*4]=p.r[i];d[i*4+1]=p.g[i];d[i*4+2]=p.b[i];d[i*4+3]=255;}
 return {data:d,width:p.w,height:p.h};}
/** Paper colours. */
const CREAM=[251,246,234],SKETCH_PAPER=[247,241,224],GRAPHITE=[58,60,70];

// ------------------------------------------------------------------------------------------------------------------- the styles
/** Pastel: soft, light and chalky; colours lifted and muted, short broad chalk strokes on the diagonal, the paper's tooth showing
 *  through where the chalk skipped. */
function pastel(src:Planes,seed:number):Planes{
 const {w,h}=src,p=saturate(blurPlanes(src,2),.95);const k=Math.max(w,h)/512;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;
  // Chalk strokes: noise stretched along the diagonal, in short broad dabs.
  const u=(x+y)/k,v=(x-y)/k,streak=(noise(u/16,v/4.5,seed)-.5)*.9+(noise(u/7,v/2.2,seed+1)-.5)*.6;
  // The paper's tooth: small blobs of grain the chalk rides over (more of it in the light parts).
  const tooth=noise(x/(1.8*k),y/(1.8*k),seed+3)*.7+hash(x,y,seed+4)*.3;
  const l=.299*p.r[i]+.587*p.g[i]+.114*p.b[i],skip=smoothstep(.76,.95,tooth+.08*smoothstep(150,240,l)+.12*Math.max(0,streak))*.55;
  for(const c of ['r','g','b'] as const){let val=p[c][i]*.7+255*.3+streak*34;val=val*(1-skip)+CREAM[c==='r'?0:c==='g'?1:2]*skip;p[c][i]=val;}}
 return p;}
/** Watercolour: soft washes with wobbly bleeding edges, pigment pooling darker at the edges of each wash, the paper's grain, and
 *  an uneven white border where the wash runs out. */
function watercolour(src:Planes,seed:number):Planes{
 const {w,h}=src,k=Math.max(w,h)/512;
 // Bleed: sample through a slow wobble, then soften into flat washes.
 const wob:Planes={r:new Float32Array(w*h),g:new Float32Array(w*h),b:new Float32Array(w*h),w,h};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,dx=(noise(x/(22*k),y/(22*k),seed)-.5)*7*k,dy=(noise(x/(22*k),y/(22*k),seed+5)-.5)*7*k;
  wob.r[i]=sample(src.r,w,h,x+dx,y+dy);wob.g[i]=sample(src.g,w,h,x+dx,y+dy);wob.b[i]=sample(src.b,w,h,x+dx,y+dy);}
 const wash=kuwahara(blurPlanes(wob,1),Math.round(4*k));saturate(wash,1.15);
 const L=lum(wash),edge=sobel(blur(L,w,h,1),w,h),soft=blur(L,w,h,Math.round(6*k));
 const out:Planes={r:new Float32Array(w*h),g:new Float32Array(w*h),b:new Float32Array(w*h),w,h};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;
  // Pigment pools at the wash's edge (darker rim) and where it is darker than its surroundings.
  const pool=1-Math.min(.32,edge[i]/255*.55)-Math.max(0,Math.min(.1,(soft[i]-L[i])/255*.6));
  const grain=.94+.06*fbm(x/(9*k),y/(9*k),seed+11)+(hash(x,y,seed+17)-.5)*.035;
  // The border: the wash fades to bare paper unevenly near the edges.
  const e=Math.min(x,y,w-1-x,h-1-y)/k+(fbm(x/(30*k),y/(30*k),seed+23)-.5)*22,cover=smoothstep(4,16,e);
  const cols=[wash.r[i],wash.g[i],wash.b[i]];
  for(let c=0;c<3;c++){const paper=CREAM[c],ink=255-(255-cols[c])*.86;let v=paper-(paper-ink*pool)*grain;v=paper+(v-paper)*cover;(c===0?out.r:c===1?out.g:out.b)[i]=v;}}
 return out;}
/** Sketch: pencil lines where the picture has edges, cross-hatching in its darker parts, on cream paper. */
function sketch(src:Planes,seed:number):Planes{
 const {w,h}=src,k=Math.max(w,h)/512,L=blur(lum(src),w,h,1),E=sobel(L,w,h),Ls=blur(L,w,h,Math.max(1,Math.round(2*k)));
 const out:Planes={r:new Float32Array(w*h),g:new Float32Array(w*h),b:new Float32Array(w*h),w,h};
 // Spread the tones over the whole range so a pale view still gets some hatching.
 let lo=255,hi=0;for(let i=0;i<w*h;i+=7){lo=Math.min(lo,Ls[i]);hi=Math.max(hi,Ls[i]);}const span=Math.max(40,hi-lo);
 const P=Math.max(4,Math.round(6*k));
 const line=(t:number)=>{const d=((t%P)+P)%P;return Math.max(0,1-Math.abs(d-P/2)/.9);};// a ~2 px pencil line every P px
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,dark=1-(Ls[i]-lo)/span;
  // Each hatch line is a run of short strokes: it lifts off the paper now and then, and presses harder or lighter along its length.
  const broken=(t:number,along:number,salt:number)=>{const n=noise(along/(9*k),Math.floor(t/P)*1.7,seed+salt);return smoothstep(.28,.4,n)*(.65+.35*n);};
  let ink=Math.min(1,Math.max(0,(E[i]-18)/70))*.85;
  if(dark>.34)ink=Math.max(ink,line(x+y)*broken(x+y,x-y,1)*.58*smoothstep(.34,.5,dark));
  if(dark>.6)ink=Math.max(ink,line(x-y+3)*broken(x-y+3,x+y,2)*.55*smoothstep(.6,.75,dark));
  if(dark>.8)ink=Math.max(ink,line(x+2)*.45*smoothstep(.8,.92,dark));
  const grain=(hash(x,y,seed+5)-.5)*10*(1-ink)+(fbm(x/(14*k),y/(14*k),seed+9)-.5)*8;
  for(let c=0;c<3;c++)(c===0?out.r:c===1?out.g:out.b)[i]=SKETCH_PAPER[c]+(GRAPHITE[c]-SKETCH_PAPER[c])*ink+grain;}
 return out;}
/** Oil paint (impasto): a Kuwahara underpainting covered in short thick brush strokes that follow the shapes (along the edges,
 *  level across the sea and sky), each with bristle ridges and a lit edge, so the paint looks laid on thick. */
function oil(src:Planes,seed:number):Planes{
 const {w,h}=src,k=Math.max(w,h)/512,base=saturate(kuwahara(src,Math.round(4*k)),1.3,-4,1.04);
 const out:Planes={r:base.r.slice(),g:base.g.slice(),b:base.b.slice(),w,h};
 const L=blur(lum(src),w,h,Math.round(3*k));
 const step=5.5*k,len=7*k,half=2.6*k;
 for(let pass=0;pass<2;pass++)for(let gy=-1;gy*step<h+step;gy++)for(let gx=-1;gx*step<w+step;gx++){
  const id=gx*7919+gy*104729+pass*15485863;
  const cx=(gx+(pass?.5:0)+(hash(gx,gy,seed+pass)-.5))*step,cy=(gy+(pass?.5:0)+(hash(gy,gx,seed+pass+2)-.5))*step;
  const sx=Math.max(1,Math.min(w-2,Math.round(cx))),sy=Math.max(1,Math.min(h-2,Math.round(cy))),si=sy*w+sx;
  // Along the edges where there are any; otherwise nearly level with a little wander.
  const gxv=L[si+1]-L[si-1],gyv=L[si+w]-L[si-w],gm=Math.hypot(gxv,gyv);
  const free=(noise(cx/(80*k),cy/(80*k),seed+9)-.5)*.9;const ang=gm>6?Math.atan2(gyv,gxv)+Math.PI/2:free;
  const ca=Math.cos(ang),sa=Math.sin(ang),L2=len*(.75+hash(gx,gy,seed+5+pass)*.5),H2=half*(.8+hash(gy,gx,seed+6+pass)*.4);
  const cr=base.r[si],cg=base.g[si],cb=base.b[si],tint=(hash(gx,gy,seed+8+pass)-.5)*14;
  const ext=Math.ceil(L2+H2);
  for(let y=Math.max(0,Math.floor(cy-ext));y<=Math.min(h-1,Math.ceil(cy+ext));y++)for(let x=Math.max(0,Math.floor(cx-ext));x<=Math.min(w-1,Math.ceil(cx+ext));x++){
   const dx=x-cx,dy=y-cy,along=dx*ca+dy*sa,across=-dx*sa+dy*ca;if(Math.abs(along)>L2||Math.abs(across)>H2)continue;
   const t=across/H2,end=1-smoothstep(.7,1,Math.abs(along)/L2),a=Math.min(1,(1-Math.abs(t))*3)*end;if(a<=0)continue;
   // Bristle ridges along the stroke, and the light catching its upper edge.
   const bristle=(hash(id,Math.floor((t+1)*3.5),seed)-.5)*16+(noise(along/(2.5*k),(t+1)*4,seed+id%97)-.5)*10,lit=-t*9+tint;
   const i=y*w+x;out.r[i]+=(cr+bristle+lit-out.r[i])*a;out.g[i]+=(cg+bristle+lit-out.g[i])*a;out.b[i]+=(cb+bristle+lit-out.b[i])*a;}}
 // The canvas weave, faintly, under everything.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,wv=((x>>1)+(y>>1))%2?2.5:-2.5;out.r[i]+=wv;out.g[i]+=wv;out.b[i]+=wv;}
 return out;}
/** Comic: flat cel-shaded colours (3 tones), bold black outlines, halftone dots in the shadows. */
function comic(src:Planes,seed:number):Planes{
 void seed;const {w,h}=src,k=Math.max(w,h)/512,p=saturate(kuwahara(src,Math.round(3*k)),1.3,0,1);
 const L=lum(p),E=sobel(blur(L,w,h,1),w,h);
 // Outlines: strong edges, thickened by one pixel.
 const ink=new Uint8Array(w*h);for(let i=0;i<w*h;i++)if(E[i]>90)ink[i]=1;
 const bold=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!ink[y*w+x])continue;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<w&&Y<h)bold[Y*w+X]=1;}}
 const out:Planes={r:new Float32Array(w*h),g:new Float32Array(w*h),b:new Float32Array(w*h),w,h};const D=Math.max(4,Math.round(6*k));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,l=Math.max(1,L[i]);
  // Three tones per colour: shadow, mid and light, keeping the hue.
  const band=l<90?0:l<178?1:2,tone=[72,134,212][band],s=Math.min(1.5,tone/l);
  let r=p.r[i]*s,g=p.g[i]*s,b=p.b[i]*s;
  if(band===0){const cx=(x%D)-D/2+.5,cy=(y%D)-D/2+.5;if(cx*cx+cy*cy<D*D*.09){r*=.45;g*=.45;b*=.5;}}
  if(bold[i]){r=24;g=26;b=34;}
  out.r[i]=r;out.g[i]=g;out.b[i]=b;}
 return out;}
/** Dots (pointillism): the picture built from small dabs of bright colour, each a little different, on cream paper. */
function dots(src:Planes,seed:number):Planes{
 const {w,h}=src,k=Math.max(w,h)/512,p=saturate(blurPlanes(src,Math.max(1,Math.round(2*k))),1.6,0,1.04);
 const out:Planes={r:new Float32Array(w*h).fill(CREAM[0]),g:new Float32Array(w*h).fill(CREAM[1]),b:new Float32Array(w*h).fill(CREAM[2]),w,h};
 const step=5.2*k,R=3*k;
 for(let pass=0;pass<2;pass++)for(let gy=0;gy*step<h+step;gy++)for(let gx=0;gx*step<w+step;gx++){
  const cx=(gx+(pass?.5:0)+(hash(gx,gy,seed+pass*31)-.5)*.8)*step,cy=(gy+(pass?.5:0)+(hash(gy,gx,seed+pass*37)-.5)*.8)*step;
  const sx=Math.max(0,Math.min(w-1,Math.round(cx))),sy=Math.max(0,Math.min(h-1,Math.round(cy))),si=sy*w+sx;
  // Each dab nudged toward a neighbouring hue (the eye mixes them back).
  const jr=(hash(gx,gy,seed+41+pass)-.5)*46,jg=(hash(gx,gy,seed+43+pass)-.5)*46,jb=(hash(gx,gy,seed+47+pass)-.5)*46;
  const cr=clamp(p.r[si]+jr),cg=clamp(p.g[si]+jg),cb=clamp(p.b[si]+jb),rad=R*(.85+hash(gx,gy,seed+53+pass)*.35);
  for(let y=Math.max(0,Math.floor(cy-rad));y<=Math.min(h-1,Math.ceil(cy+rad));y++)for(let x=Math.max(0,Math.floor(cx-rad));x<=Math.min(w-1,Math.ceil(cx+rad));x++){
   const d=Math.hypot(x-cx,y-cy),a=Math.max(0,Math.min(1,rad-d+.5))*.92;if(a<=0)continue;const i=y*w+x;
   out.r[i]+=(cr-out.r[i])*a;out.g[i]+=(cg-out.g[i])*a;out.b[i]+=(cb-out.b[i])*a;}}
 return out;}

const FILTERS:Record<Exclude<PaintStyleId,'off'|'trace'>,(p:Planes,seed:number)=>Planes>={pastel,watercolour,sketch,oil,comic,dots};
/** The picture for an art style, made from the view snapshot (opaque RGBA, same size). Null for Blank paper and Trace (no picture). */
export function applyPaintStyle(id:PaintStyleId,src:Pixels,seed=7):Pixels|null{
 if(!isPictureStyle(id))return null;const f=FILTERS[id as keyof typeof FILTERS];if(!f||!src.width||!src.height)return null;
 return toPixels(f(planes(src),seed));
}
