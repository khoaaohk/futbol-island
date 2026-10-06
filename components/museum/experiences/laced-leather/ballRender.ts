/**
 * Ball sprites for The Weather Machine: each ball is shaded per pixel as a real sphere (one light from the upper left, the
 * lightbox's cool bounce light on the rim), so the leather and the modern ball share one light direction and read as objects.
 *  - leather: the classic 18-panel "volleyball" layout (6 cube faces × 3 strips), stuffed panels that dip into stitched seams,
 *    grain and scuffs from a small noise tile, a laced slit on top. `wet` darkens it, tightens the highlight into a wet gloss
 *    and beads it with water.
 *  - modern: a 32-panel ball (12 coloured pentagons, 20 white hexagons) with a smooth glossy finish.
 * Sprites are cached (a handful of entries, keyed by pixel size and a quantised wetness), so a frame only re-shades when the
 * ball really changes. Nothing here runs per frame on its own.
 */
type RGB=[number,number,number];
const clamp=(v:number,a=0,b=1)=>v<a?a:v>b?b:v;
const smooth=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

// Light (view space; x right, y up, z towards the viewer) and the Blinn half vector.
const LX=-.5,LY=.62,LZ=.6,LN=Math.hypot(LX,LY,LZ),lx=LX/LN,ly=LY/LN,lz=LZ/LN;
const HN=Math.hypot(lx,ly,lz+1),hx=lx/HN,hy=ly/HN,hz=(lz+1)/HN;
export const LIGHT={x:lx,y:ly};

// A 64×64 tile of smooth value noise for grain and scuffs (deterministic).
const N=64,tile=new Float32Array(N*N);
{let s=1234567;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};const raw=new Float32Array(N*N);for(let i=0;i<raw.length;i++)raw[i]=rnd();
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let a=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)a+=raw[((y+dy+N)%N)*N+(x+dx+N)%N];tile[y*N+x]=a/9;}}
const noise=(u:number,v:number)=>{u=((u%N)+N)%N;v=((v%N)+N)%N;const x0=u|0,y0=v|0,fx=u-x0,fy=v-y0,x1=(x0+1)%N,y1=(y0+1)%N;
 return lerp(lerp(tile[y0*N+x0],tile[y0*N+x1],fx),lerp(tile[y1*N+x0],tile[y1*N+x1],fx),fy);};

// Object → view rotation: turned 32° and tipped 28° towards the viewer, so three faces (and the laced top) show.
const rot=(ay:number,ax:number)=>{const cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);
 // R = Rx(ax)·Ry(ay); rows are view axes in object space, so p_obj = Rᵀ·n_view.
 return [[cy,0,sy],[sx*sy,cx,-sx*cy],[-cx*sy,sx,cx*cy]];};
const RL=rot(.62,.78),RM=rot(.3,.35);

const DRY:RGB=[184,121,62],WET:RGB=[74,41,20],LACE_DRY:RGB=[236,220,186],LACE_WET:RGB=[148,124,94];

function sprite(px:number){const c=document.createElement('canvas');c.width=c.height=px;return c;}

/** Leather ball sprite, `px` pixels across, wetness 0..1. */
function leather(px:number,wet:number){
 const c=sprite(px),g=c.getContext('2d')!,img=g.createImageData(px,px),d=img.data,r=px/2-1,inv=1/r;
 const base:RGB=[lerp(DRY[0],WET[0],wet),lerp(DRY[1],WET[1],wet),lerp(DRY[2],WET[2],wet)];
 const lace:RGB=[lerp(LACE_DRY[0],LACE_WET[0],wet),lerp(LACE_DRY[1],LACE_WET[1],wet),lerp(LACE_DRY[2],LACE_WET[2],wet)];
 const shin=lerp(9,70,wet),ks=lerp(.1,1.05,wet),sheen=lerp(.05,.0,wet),seamW=Math.max(.012,1.4*inv),R=RL;
 for(let j=0;j<px;j++)for(let i=0;i<px;i++){
  const x=(i+.5-px/2)*inv,y=-(j+.5-px/2)*inv,rr=x*x+y*y;if(rr>=1+2*inv)continue;
  const edge=clamp((1-Math.sqrt(rr))*r+.5);if(edge<=0)continue;const z=Math.sqrt(Math.max(0,1-rr));
  // object-space point
  const ox=R[0][0]*x+R[1][0]*y+R[2][0]*z,oy=R[0][1]*x+R[1][1]*y+R[2][1]*z,oz=R[0][2]*x+R[1][2]*y+R[2][2]*z;
  const a=[Math.abs(ox),Math.abs(oy),Math.abs(oz)],o=[ox,oy,oz];
  let f=0;if(a[1]>a[f])f=1;if(a[2]>a[f])f=2;const k1=(f+1)%3,k2=(f+2)%3,second=Math.max(a[k1],a[k2]),dom=a[f];
  // strips: face X splits along y, Y along z, Z along x (cyclic, like a volleyball)
  const sAx=k1,sOther=k2,sv=o[sAx]/dom;
  const dEdge=(dom-second)*.7071,dStrip=Math.abs(Math.abs(o[sAx])-dom/3)*.9487,dSeam=Math.min(dEdge,dStrip);
  const strip=sv<-1/3?0:sv<1/3?1:2,pid=f*6+(o[f]>0?3:0)+strip;
  // along-seam coordinate for the stitches
  const t=dEdge<dStrip?o[a[k1]>a[k2]?k2:k1]:o[sOther];
  let col0=base[0],col1=base[1],col2=base[2];
  const tone=1+(((pid*73)%11)/11-.5)*.12;// panels were cut from different parts of the hide
  const fu=(o[k1]/dom)*14+f*17,fv=(o[k2]/dom)*14+(o[f]>0?31:0);
  const grain=1+(noise(fu*3.1,fv*3.1)-.5)*.32*(1-wet*.5),scuff=1-smooth(.55,.75,noise(fu*.45+7,fv*.45+3))*.16*(1-wet*.6);
  let shade=tone*grain*scuff;
  // stuffed panels: they dip into the seams
  const pillow=smooth(0,.11,dSeam);shade*=.62+.38*pillow;
  // the seam groove itself, and the stitch rows beside it
  if(dSeam<seamW)shade*=.35+.4*(dSeam/seamW);
  const stitchBand=Math.abs(dSeam-.032)<Math.max(.008,.9*inv),stitchOn=((t*30)%1+1)%1<.5;
  let isLace=false;
  // laced slit on the +Y face, middle strip, running along x
  if(f===1&&o[1]>0){const la=ox/oy,lb=oz/oy;
   if(Math.abs(la)<.5&&Math.abs(lb)<.15){
    if(Math.abs(lb)<.075)shade*=.28;// the opening
    const n=6,seg=(la+.5)*n,lf=seg-Math.floor(seg),cross1=Math.abs(lb-(lf-.5)*.26),cross2=Math.abs(lb+(lf-.5)*.26);
    if(Math.min(cross1,cross2)<.03){isLace=true;const across=Math.min(cross1,cross2)/.03;shade=(1-across*across*.45)*(1+(noise(seg*8,lb*40)-.5)*.2);}
    else if(Math.abs(Math.abs(lb)-.11)<.018&&Math.abs(lf-.5)>.38)shade*=.35;}// eyelets
   else if(Math.abs(la)<.56&&Math.abs(lb)<.2)shade*=.82;}
  if(isLace){col0=lace[0];col1=lace[1];col2=lace[2];}
  else if(stitchBand&&stitchOn&&dSeam>seamW){const th=lerp(.95,.55,wet);col0=lerp(col0,226*th,.72);col1=lerp(col1,200*th,.72);col2=lerp(col2,150*th,.72);shade=Math.max(shade,.92);}
  // lighting (normal = view position on a unit sphere; panel pillows tilt it a little towards the panel centre)
  const ndl=x*lx+y*ly+z*lz,diff=clamp(ndl),wrap=clamp((ndl+.35)/1.35);
  const light=.2+.42*wrap+.62*diff;
  const ndh=clamp(x*hx+y*hy+z*hz),spec=Math.pow(ndh,shin)*ks*(isLace?.4:pillow*.7+.3),broad=Math.pow(ndh,4)*sheen;
  const rim=Math.pow(1-z,2.6)*lerp(.22,.32,wet),occl=.55+.45*clamp(z+.25);
  let R0=col0*shade*light*occl,G0=col1*shade*light*occl,B0=col2*shade*light*occl;
  R0+=255*(spec+broad)+190*rim;G0+=255*(spec+broad)+215*rim;B0+=255*(spec*.98+broad)+245*rim;
  const q=(j*px+i)*4;d[q]=R0>255?255:R0;d[q+1]=G0>255?255:G0;d[q+2]=B0>255?255:B0;d[q+3]=255*edge;}
 g.putImageData(img,0,0);
 if(wet>.04)beads(g,px/2,px/2,r,wet,RL);
 return c;}

/** Water beads on the front of the leather, sitting on the surface (foreshortened towards the rim). */
function beads(g:CanvasRenderingContext2D,cx:number,cy:number,r:number,wet:number,R:number[][]){
 const total=80,count=Math.round(total*clamp(wet*1.25));
 for(let i=0;i<count;i++){
  // golden-spiral points over the sphere in object space, then into view space
  const k=i*2.39996,zz=1-(i+.5)/total*1.7,rad=Math.sqrt(Math.max(0,1-zz*zz));
  const ox=Math.cos(k)*rad,oy=zz,oz=Math.sin(k)*rad;
  const vx=R[0][0]*ox+R[0][1]*oy+R[0][2]*oz,vy=R[1][0]*ox+R[1][1]*oy+R[1][2]*oz,vz=R[2][0]*ox+R[2][1]*oy+R[2][2]*oz;
  if(vz<.18)continue;
  const s=r*(.032+.034*((i*37)%7)/7)*(.6+.4*wet),X=cx+vx*r,Y=cy-vy*r,ang=Math.atan2(-vy,vx);
  const run=i%5===0?1.9:1;// a few beads have started to run downhill
  g.save();g.translate(X,Y);g.rotate(ang);g.scale(Math.max(.35,vz),1);g.rotate(-ang);
  g.beginPath();g.ellipse(0,s*(run-1)*.5,s,s*run,0,0,Math.PI*2);
  const bg=g.createRadialGradient(0,s*.25,s*.1,0,0,s*run);bg.addColorStop(0,'rgba(12,6,2,.32)');bg.addColorStop(.75,'rgba(12,6,2,.12)');bg.addColorStop(1,'rgba(255,240,220,.35)');g.fillStyle=bg;g.fill();// the lens darkens the leather, a bright rim
  g.beginPath();g.ellipse(s*.15,s*.45+s*(run-1)*.9,s*.55,s*.22,0,0,Math.PI*2);g.fillStyle='rgba(255,230,200,.28)';g.fill();// caustic at the bottom
  g.beginPath();g.arc(LIGHT.x*s*.42,-LIGHT.y*s*.42,Math.max(.6,s*.26),0,Math.PI*2);g.fillStyle='rgba(255,255,255,.95)';g.fill();// highlight
  g.restore();}
}

// Truncated-icosahedron panel centres: 12 pentagons (icosahedron vertices) + 20 hexagons (dodecahedron vertices).
const PHI=(1+Math.sqrt(5))/2;
const norm=(v:number[])=>{const l=Math.hypot(v[0],v[1],v[2]);return [v[0]/l,v[1]/l,v[2]/l];};
const PENT:number[][]=[],HEX:number[][]=[];
for(const s1 of [-1,1])for(const s2 of [-1,1]){PENT.push(norm([0,s1,s2*PHI]),norm([s1,s2*PHI,0]),norm([s2*PHI,0,s1]));}
for(const a of [-1,1])for(const b of [-1,1])for(const c of [-1,1])HEX.push(norm([a,b,c]));
for(const s1 of [-1,1])for(const s2 of [-1,1]){HEX.push(norm([0,s1*PHI,s2/PHI]),norm([s2/PHI,0,s1*PHI]),norm([s1*PHI,s2/PHI,0]));}
// Face-plane distances of a truncated icosahedron (edge 1): the face a ray from the centre meets first is the panel.
const PD=2.32743,HD=2.26728;

function hexRGB(h:string):RGB{const n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}

/** Modern ball sprite, `px` pixels across, pentagons in `accent`. */
function modern(px:number,accent:string){
 const c=sprite(px),g=c.getContext('2d')!,img=g.createImageData(px,px),d=img.data,r=px/2-1,inv=1/r,A=hexRGB(accent),R=RM;
 for(let j=0;j<px;j++)for(let i=0;i<px;i++){
  const x=(i+.5-px/2)*inv,y=-(j+.5-px/2)*inv,rr=x*x+y*y;if(rr>=1+2*inv)continue;
  const edge=clamp((1-Math.sqrt(rr))*r+.5);if(edge<=0)continue;const z=Math.sqrt(Math.max(0,1-rr));
  const ox=R[0][0]*x+R[1][0]*y+R[2][0]*z,oy=R[0][1]*x+R[1][1]*y+R[2][1]*z,oz=R[0][2]*x+R[1][2]*y+R[2][2]*z;
  let b1=-9,b2=-9,pent=false;
  for(const p of PENT){const v=(p[0]*ox+p[1]*oy+p[2]*oz)/PD;if(v>b1){b2=b1;b1=v;pent=true;}else if(v>b2)b2=v;}
  for(const p of HEX){const v=(p[0]*ox+p[1]*oy+p[2]*oz)/HD;if(v>b1){b2=b1;b1=v;pent=false;}else if(v>b2)b2=v;}
  const seam=(b1-b2)/b1*1.6,sw=Math.max(.012,1.2*inv);
  let col:RGB=pent?A:[243,244,246],shade=1;
  shade*=.86+.14*smooth(0,.06,seam);if(seam<sw)shade*=.45+.4*seam/sw;
  const ndl=x*lx+y*ly+z*lz,diff=clamp(ndl),wrap=clamp((ndl+.4)/1.4),light=.3+.36*wrap+.5*diff;
  const ndh=clamp(x*hx+y*hy+z*hz),spec=Math.pow(ndh,46)*.75+Math.pow(ndh,6)*.06,rim=Math.pow(1-z,2.6)*.28,occl=.6+.4*clamp(z+.2);
  const q=(j*px+i)*4,f=shade*light*occl;
  d[q]=Math.min(255,col[0]*f+255*spec+180*rim);d[q+1]=Math.min(255,col[1]*f+255*spec+205*rim);d[q+2]=Math.min(255,col[2]*f+255*spec+240*rim);d[q+3]=255*edge;}
 g.putImageData(img,0,0);return c;}

const cache=new Map<string,HTMLCanvasElement>();
function remember(key:string,make:()=>HTMLCanvasElement){let c=cache.get(key);if(c){cache.delete(key);cache.set(key,c);return c;}
 c=make();cache.set(key,c);while(cache.size>10){const k=cache.keys().next().value as string;cache.delete(k);}return c;}

/** Cached leather sprite for a ball of radius `r` CSS px at pixel ratio `dpr`; wetness quantised to 1/24 steps. */
export function leatherSprite(r:number,dpr:number,wet:number){const px=Math.max(16,Math.round(r*2*dpr/8)*8),q=Math.round(clamp(wet)*24)/24;
 return remember(`L${px}:${q}`,()=>leather(px,q));}
/** Cached modern sprite (drawn scaled for the smaller sizes). */
export function modernSprite(r:number,dpr:number,accent:string){const px=Math.max(16,Math.round(r*2*dpr/8)*8);return remember(`M${px}:${accent}`,()=>modern(px,accent));}
export function clearBallCache(){cache.clear();}
