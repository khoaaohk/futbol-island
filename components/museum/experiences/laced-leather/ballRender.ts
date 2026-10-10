/**
 * Ball sprites for The Weather Machine, drawn as flat picture-book shapes (Oct 9 2026 variation: a 1950s–60s science
 * picture-book). Each ball is still worked out per pixel as a sphere, but the light is posterised into flat bands: a lit side, a
 * shadow crescent and one flat highlight, like a two-colour screen print. One light from the upper left for every ball.
 *  - leather: the classic 18-panel "volleyball" layout (6 cube faces × 3 strips) in two flat leather colours, navy seams with
 *    cream stitches, a laced slit on top. `wet` darkens it, grows the shiny highlight and dots it with sky-blue drops.
 *  - modern: a 32-panel ball (12 coloured pentagons, 20 white hexagons), flat and clean.
 * Sprites are cached (a handful of entries, keyed by pixel size and a quantised wetness), so a frame only re-shades when the
 * ball really changes. Nothing here runs per frame on its own.
 */
type RGB=[number,number,number];
const clamp=(v:number,a=0,b=1)=>v<a?a:v>b?b:v;
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

// Light (view space; x right, y up, z towards the viewer).
const LX=-.5,LY=.62,LZ=.6,LN=Math.hypot(LX,LY,LZ),lx=LX/LN,ly=LY/LN,lz=LZ/LN;
export const LIGHT={x:lx,y:ly};


// Object → view rotation: turned 32° and tipped 28° towards the viewer, so three faces (and the laced top) show.
const rot=(ay:number,ax:number)=>{const cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);
 // R = Rx(ax)·Ry(ay); rows are view axes in object space, so p_obj = Rᵀ·n_view.
 return [[cy,0,sy],[sx*sy,cx,-sx*cy],[-cx*sy,sx,cx*cy]];};
const RL=rot(.62,.78),RM=rot(.3,.35);

const DRY:RGB=[232,150,74],DRY2:RGB=[212,118,52],WET:RGB=[122,70,52],WET2:RGB=[104,58,44],LACE_DRY:RGB=[255,244,220],LACE_WET:RGB=[196,230,246];
const NAVY:RGB=[31,42,68];
/** Posterised light: lit, mid and shadow bands (flat, like a screen print). */
const band=(ndl:number)=>ndl>.42?1:ndl>.02?.86:.68;

function sprite(px:number){const c=document.createElement('canvas');c.width=c.height=px;return c;}

/** Leather ball sprite, `px` pixels across, wetness 0..1. */
function leather(px:number,wet:number){
 const c=sprite(px),g=c.getContext('2d')!,img=g.createImageData(px,px),d=img.data,r=px/2-1,inv=1/r;
 const base:RGB=[lerp(DRY[0],WET[0],wet),lerp(DRY[1],WET[1],wet),lerp(DRY[2],WET[2],wet)];
 const lace:RGB=[lerp(LACE_DRY[0],LACE_WET[0],wet),lerp(LACE_DRY[1],LACE_WET[1],wet),lerp(LACE_DRY[2],LACE_WET[2],wet)];
 const base2:RGB=[lerp(DRY2[0],WET2[0],wet),lerp(DRY2[1],WET2[1],wet),lerp(DRY2[2],WET2[2],wet)];
 const seamW=Math.max(.018,1.6*inv),R=RL,hiR=lerp(.06,.13,wet);
 for(let j=0;j<px;j++)for(let i=0;i<px;i++){
  const x=(i+.5-px/2)*inv,y=-(j+.5-px/2)*inv,rr=x*x+y*y;if(rr>=1+2*inv)continue;
  const edge=clamp((1-Math.sqrt(rr))*r+.5);if(edge<=0)continue;const z=Math.sqrt(Math.max(0,1-rr));
  const ox=R[0][0]*x+R[1][0]*y+R[2][0]*z,oy=R[0][1]*x+R[1][1]*y+R[2][1]*z,oz=R[0][2]*x+R[1][2]*y+R[2][2]*z;
  const a=[Math.abs(ox),Math.abs(oy),Math.abs(oz)],o=[ox,oy,oz];
  let f=0;if(a[1]>a[f])f=1;if(a[2]>a[f])f=2;const k1=(f+1)%3,k2=(f+2)%3,second=Math.max(a[k1],a[k2]),dom=a[f];
  const sAx=k1,sOther=k2,sv=o[sAx]/dom;
  const dEdge=(dom-second)*.7071,dStrip=Math.abs(Math.abs(o[sAx])-dom/3)*.9487,dSeam=Math.min(dEdge,dStrip);
  const strip=sv<-1/3?0:sv<1/3?1:2,pid=f*6+(o[f]>0?3:0)+strip;
  const t=dEdge<dStrip?o[a[k1]>a[k2]?k2:k1]:o[sOther];
  let col:RGB=(pid+strip)%2?base:base2,isLace=false,ink=false;
  if(dSeam<seamW)ink=true;// navy seam
  else if(Math.abs(dSeam-.045)<Math.max(.012,1.1*inv)&&((t*26)%1+1)%1<.5)col=lace;// cream stitches beside the seam
  if(f===1&&o[1]>0){const la=ox/oy,lb=oz/oy;
   if(Math.abs(la)<.5&&Math.abs(lb)<.16){
    if(Math.abs(lb)<.07){col=NAVY;}
    const n=6,seg=(la+.5)*n,lf=seg-Math.floor(seg),cross1=Math.abs(lb-(lf-.5)*.28),cross2=Math.abs(lb+(lf-.5)*.28);
    if(Math.min(cross1,cross2)<.032){isLace=true;col=lace;ink=false;}else if(Math.min(cross1,cross2)<.05)ink=true;}}
  const ndl=x*lx+y*ly+z*lz;let sh=ink?1:band(ndl);
  const hx2=x-lx*.55,hy2=y-ly*.55;const hi=!ink&&!isLace&&hx2*hx2*1.6+hy2*hy2<hiR*hiR;
  let R0=ink?NAVY[0]:col[0]*sh,G0=ink?NAVY[1]:col[1]*sh,B0=ink?NAVY[2]:col[2]*sh;
  if(hi){R0=lerp(R0,255,.55+wet*.3);G0=lerp(G0,250,.55+wet*.3);B0=lerp(B0,240,.55+wet*.3);}
  const q=(j*px+i)*4;d[q]=R0;d[q+1]=G0;d[q+2]=B0;d[q+3]=255*edge;}
 // a navy outline, printed a hair off-register (down-right), the picture-book way
 g.putImageData(img,0,0);g.save();g.globalCompositeOperation='destination-over';g.beginPath();g.arc(px/2+px*.012,px/2+px*.012,r,0,Math.PI*2);g.fillStyle='rgb(31,42,68)';g.fill();g.restore();
 g.lineWidth=Math.max(1,px*.012);g.strokeStyle='rgba(31,42,68,.9)';g.beginPath();g.arc(px/2,px/2,r-g.lineWidth/2,0,Math.PI*2);g.stroke();
 if(wet>.04)beads(g,px/2,px/2,r,wet,RL);
 return c;}

/** Water beads on the front of the leather, sitting on the surface (foreshortened towards the rim). */
function beads(g:CanvasRenderingContext2D,cx:number,cy:number,r:number,wet:number,R:number[][]){
 const total=60,count=Math.round(total*clamp(wet*1.25));
 for(let i=0;i<count;i++){
  const k=i*2.39996,zz=1-(i+.5)/total*1.7,rad=Math.sqrt(Math.max(0,1-zz*zz));
  const ox=Math.cos(k)*rad,oy=zz,oz=Math.sin(k)*rad;
  const vx=R[0][0]*ox+R[0][1]*oy+R[0][2]*oz,vy=R[1][0]*ox+R[1][1]*oy+R[1][2]*oz,vz=R[2][0]*ox+R[2][1]*oy+R[2][2]*oz;
  if(vz<.25)continue;
  const s=r*(.035+.03*((i*37)%7)/7),X=cx+vx*r,Y=cy-vy*r;
  // a flat teardrop of sky blue with a white dot: drops as a picture book draws them
  g.beginPath();g.moveTo(X,Y-s*1.5);g.quadraticCurveTo(X+s,Y-s*.2,X+s,Y+s*.25);g.arc(X,Y+s*.25,s,0,Math.PI);g.quadraticCurveTo(X-s,Y-s*.2,X,Y-s*1.5);
  g.fillStyle='#6cc4e8';g.fill();g.lineWidth=Math.max(.8,s*.22);g.strokeStyle='rgba(31,42,68,.8)';g.stroke();
  g.beginPath();g.arc(X-s*.35,Y,Math.max(.6,s*.28),0,Math.PI*2);g.fillStyle='#ffffff';g.fill();}
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
  const seam=(b1-b2)/b1*1.6,sw=Math.max(.02,1.4*inv);
  const col:RGB=seam<sw?NAVY:pent?A:[250,246,236];
  const ndl=x*lx+y*ly+z*lz,sh=seam<sw?1:band(ndl);const hx2=x-lx*.55,hy2=y-ly*.55,hi=seam>=sw&&hx2*hx2*1.6+hy2*hy2<.012;
  const q=(j*px+i)*4;d[q]=hi?255:col[0]*sh;d[q+1]=hi?255:col[1]*sh;d[q+2]=hi?255:col[2]*sh;d[q+3]=255*edge;}
 g.putImageData(img,0,0);g.lineWidth=Math.max(1,px*.012);g.strokeStyle='rgba(31,42,68,.9)';g.beginPath();g.arc(px/2,px/2,r-g.lineWidth/2,0,Math.PI*2);g.stroke();return c;}

const cache=new Map<string,HTMLCanvasElement>();
function remember(key:string,make:()=>HTMLCanvasElement){let c=cache.get(key);if(c){cache.delete(key);cache.set(key,c);return c;}
 c=make();cache.set(key,c);while(cache.size>10){const k=cache.keys().next().value as string;cache.delete(k);}return c;}

/** Cached leather sprite for a ball of radius `r` CSS px at pixel ratio `dpr`; wetness quantised to 1/24 steps. */
export function leatherSprite(r:number,dpr:number,wet:number){const px=Math.max(16,Math.round(r*2*dpr/8)*8),q=Math.round(clamp(wet)*24)/24;
 return remember(`L${px}:${q}`,()=>leather(px,q));}
/** Cached modern sprite (drawn scaled for the smaller sizes). */
export function modernSprite(r:number,dpr:number,accent:string){const px=Math.max(16,Math.round(r*2*dpr/8)*8);return remember(`M${px}:${accent}`,()=>modern(px,accent));}
export function clearBallCache(){cache.clear();}
