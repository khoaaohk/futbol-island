// Town kerb depth (Nov 26 2026, owner on the Nursery crossing: "it feels too flat, there's no depth or raised grounds to the grass
// paths, roads"). Pure data, no three.js. Built ON TOP of the elevation system: elevation.ts groundLift() adds depthLift(), so the
// walked height (venues.ts fieldSurfaceHeight: player, rides, ball floor, landing, NPC helpers, camera) and traffic read ONE height.
//
// What it is: the CARRIAGEWAY SINKS 15 cm below the pavement (which keeps today's height, so no building, lamp, bench or tree moves):
//  - a bevelled kerb shoulder (0.24 m run: a slope that lights and shades, not a vertical lip), a 3 cm camber to the crown;
//  - dropped kerbs at every zebra (the pavement ramps down over 1.5 m to a 2 cm upstand);
//  - pins: the road eases back to today's height at the Island Line (7.5 m clear + 5 m ease) and over the last 7 m of a dead end.
// The lawn beside a pavement rises 5 cm above it (lawnRise: DRAWN ONLY, grass has thickness: feet and wheels sink into the sward
// like real grass; props stand in it), with a rounded lip, and falls back to today's lawn 3.3 m out.
//
// Dev flag `?depth=1` (default OFF: depthLift is 0 after one comparison, nothing is built differently). Independent of `?elev`.
// To ship: DEPTH_DEFAULT = true (one line); `?depth=0` then switches it off for a before / after.
import {TRACK} from './trainTrack';
import {INTERIOR_GRASS} from './shoreline';

export const DEPTH_DEFAULT=true;// shipped ON (owner approval, Nov 26 2026); `?depth=0` switches it off
const query=(()=>{try{return typeof window!=='undefined'&&window.location&&typeof window.location.search==='string'?window.location.search:null;}catch{return null;}})();
let enabled=query===null?DEPTH_DEFAULT:/[?&]depth=1(&|$)/.test(query)||(DEPTH_DEFAULT&&!/[?&]depth=0(&|$)/.test(query));
/** Tests call this (before the streets are registered); the browser reads the URL once. */
export function setTownDepth(on:boolean){enabled=on;}
export const townDepthOn=()=>enabled;
/** Lowest tier at world build (Battery saver): simpler kerb, no small objects, coarser verge. */
export const depthLowTier=()=>{try{return typeof localStorage!=='undefined'&&localStorage.getItem('fi2-battery-saver')==='on';}catch{return false;}};

export const KERB={gutter:.15,crown:.12,bevel:.24,camber:3.4,up:.02,ramp:1.5,dropHalf:1.1,dropTaper:.7,channel:.5,stone:.22,railClear:7.5,railEase:5,endEase:7} as const;
export const VERGE={lip:.05,reach:3.3,flat:1.3} as const;
/** Drawn heights of today's flat layers (world.ts roadSurface, fields.ts lawn, world.ts path()). */
export const DRAWN={pave:-.02,asphalt:-.01,lawn:-.112,path:-.0375} as const;

export type Rect={x:number;z:number;w:number;d:number};
export type Pt={x:number;z:number};
/** A zebra: `vertical` = its street runs along z (people cross along x). */
export type Crossing={x:number;z:number;vertical:boolean};
/** a → b, (nx, nz) points OUT of the union; s0 / s1: the corner at each end (+1 convex, -1 concave, 0 none). */
export type Seg={ax:number;az:number;bx:number;bz:number;nx:number;nz:number;s0:number;s1:number};
const smooth=(t:number)=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const q3=(v:number)=>Math.round(v*1000)/1000;
const boxDist=(x:number,z:number,r:Rect)=>Math.hypot(Math.max(0,Math.abs(x-r.x)-r.w/2),Math.max(0,Math.abs(z-r.z)-r.d/2));
const insidePoly=(poly:readonly Pt[],x:number,z:number)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};
const hash=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};

// ---- Outline of a union of axis-aligned rectangles: boundary segments + a binned distance query --------------------------------
const CELL=8,CAP=4.6;
/** Rounded street corner (owner, Nov 26 2026: "we need to round the corners on the street corners"). At a concave corner of the
 *  asphalt (a pavement corner sticking out into the road) the kerb follows a quarter circle: V the old square corner, (ax, az) the
 *  outward normal of the kerb along x (0, +-1 in z), (bx, bz) the one along z (+-1, 0); centre (cx, cz) = V + r (a + b), on the
 *  pavement. The asphalt fills the square [V, C] outside the circle; the two kerb segments start at the tangent points. */
export type Fillet={vx:number;vz:number;ax:number;az:number;bx:number;bz:number;r:number;cx:number;cz:number};
/** Quarter-circle steps of a rounded corner (the kerb, the asphalt patch and the pavement's cut all use these same angles). */
export const FILLET_STEPS=8;
export type Outline={rects:Rect[];segs:Seg[];fillets:Fillet[];inside(x:number,z:number):boolean;dist(x:number,z:number):number;
 /** The rounded corner whose curve is the nearest kerb to (x, z) (the point lies in its quarter, within 2 m of the curve), else undefined. */
 arcAt(x:number,z:number):Fillet|undefined};
/** Point on a fillet's circle at step k (0: the tangent point on the kerb along x; FILLET_STEPS: the one on the kerb along z), `rho` from the centre. */
export function filletPoint(f:Fillet,k:number,rho:number){const t=k/FILLET_STEPS*Math.PI/2,s=Math.sin(t),c=Math.cos(t);return [f.cx-(s*f.bx+c*f.ax)*rho,f.cz-(s*f.bz+c*f.az)*rho] as const;}
const inFillet=(f:Fillet,x:number,z:number)=>{const u=(x-f.vx)*f.bx+(z-f.vz)*f.bz,w=(x-f.vx)*f.ax+(z-f.vz)*f.az;return u>=-1e-9&&w>=-1e-9&&u<f.r&&w<f.r&&Math.hypot(x-f.cx,z-f.cz)>f.r;};
/** Radius chooser for buildOutline: the corner V, the outward normal of the kerb along x (z component), of the kerb along z (x component), and the two kerbs' lengths. 0: keep it square. */
export type FilletRadius=(v:Pt,nz:number,nx:number,lenX:number,lenZ:number)=>number;
export function buildOutline(rects:Rect[],radius?:FilletRadius):Outline{
 const inside=(x:number,z:number)=>{for(let i=0;i<rects.length;i++){const r=rects[i];if(Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2)return true;}return false;};
 const E=1e-4,uniq=(a:number[])=>[...new Set(a.map(q3))].sort((p,q)=>p-q),xs=uniq(rects.flatMap(r=>[r.x-r.w/2,r.x+r.w/2])),zs=uniq(rects.flatMap(r=>[r.z-r.d/2,r.z+r.d/2])),segs:Seg[]=[];
 for(const along of [false,true]){const lines=along?zs:xs,knots=along?xs:zs;// along: segments run along x on a line z = e
  for(const e of lines){let run:{from:number;to:number;n:number}|null=null;
   const flush=()=>{if(run)segs.push(along?{ax:run.from,az:e,bx:run.to,bz:e,nx:0,nz:run.n,s0:0,s1:0}:{ax:e,az:run.from,bx:e,bz:run.to,nx:run.n,nz:0,s0:0,s1:0});run=null;};
   for(let i=0;i<knots.length-1;i++){const a=knots[i],b=knots[i+1],m=(a+b)/2,lo=along?inside(m,e-E):inside(e-E,m),hi=along?inside(m,e+E):inside(e+E,m),n=lo===hi?0:lo?1:-1;
    if(run&&n&&run.n===n&&Math.abs(run.to-a)<1e-6)run.to=b;else{flush();if(n)run={from:a,to:b,n};}}
   flush();}}
 const ends=new Map<string,{s:Seg;end:0|1}[]>(),key=(x:number,z:number)=>q3(x)+','+q3(z);
 for(const s of segs)for(const end of [0,1] as const){const k=end?key(s.bx,s.bz):key(s.ax,s.az),l=ends.get(k);if(l)l.push({s,end});else ends.set(k,[{s,end}]);}
 for(const s of segs)for(const end of [0,1] as const){const o=(ends.get(end?key(s.bx,s.bz):key(s.ax,s.az))??[]).find(o=>o.s!==s&&(o.s.nx!==0)!==(s.nx!==0));if(!o)continue;
  const dx=(o.end?o.s.ax-o.s.bx:o.s.bx-o.s.ax),dz=(o.end?o.s.az-o.s.bz:o.s.bz-o.s.az),type=dx*s.nx+dz*s.nz<0?1:-1;if(end)s.s1=type;else s.s0=type;}
 const fillets:Fillet[]=[];
 if(radius)for(const s of segs)if(s.nz)for(const end of [0,1] as const){if((end?s.s1:s.s0)!==-1)continue;
  const vx=end?s.bx:s.ax,vz=end?s.bz:s.az,o=(ends.get(key(vx,vz))??[]).find(q=>q.s!==s&&q.s.nx!==0);if(!o)continue;
  const r=radius({x:vx,z:vz},s.nz,o.s.nx,Math.abs(s.bx-s.ax),Math.abs(o.s.bz-o.s.az));if(!(r>0))continue;
  fillets.push({vx,vz,ax:0,az:s.nz,bx:o.s.nx,bz:0,r,cx:vx+r*o.s.nx,cz:vz+r*s.nz});
  if(end){s.bx+=r*o.s.nx;s.s1=0;}else{s.ax+=r*o.s.nx;s.s0=0;}
  if(o.end){o.s.bz+=r*s.nz;o.s.s1=0;}else{o.s.az+=r*s.nz;o.s.s0=0;}}
 const fBins=new Map<number,Fillet[]>();
 const bins=new Map<number,Seg[]>(),bk=(cx:number,cz:number)=>(cx+2048)*4096+(cz+2048);
 for(const f of fillets){const x0=Math.min(f.vx,f.cx),x1=Math.max(f.vx,f.cx),z0=Math.min(f.vz,f.cz),z1=Math.max(f.vz,f.cz);
  for(let cx=Math.floor((x0-CAP)/CELL);cx<=Math.floor((x1+CAP)/CELL);cx++)for(let cz=Math.floor((z0-CAP)/CELL);cz<=Math.floor((z1+CAP)/CELL);cz++){const k=bk(cx,cz),l=fBins.get(k);if(l)l.push(f);else fBins.set(k,[f]);}}
 for(const s of segs)for(let cx=Math.floor((Math.min(s.ax,s.bx)-CAP)/CELL);cx<=Math.floor((Math.max(s.ax,s.bx)+CAP)/CELL);cx++)for(let cz=Math.floor((Math.min(s.az,s.bz)-CAP)/CELL);cz<=Math.floor((Math.max(s.az,s.bz)+CAP)/CELL);cz++){const k=bk(cx,cz),l=bins.get(k);if(l)l.push(s);else bins.set(k,[s]);}
 const dist=(x:number,z:number)=>{const l=bins.get(bk(Math.floor(x/CELL),Math.floor(z/CELL)));if(!l)return CAP;let best=CAP;
  for(let i=0;i<l.length;i++){const s=l[i],d=s.nx?Math.hypot(x-s.ax,z<s.az?s.az-z:z>s.bz?z-s.bz:0):Math.hypot(z-s.az,x<s.ax?s.ax-x:x>s.bx?x-s.bx:0);if(d<best)best=d;}
  const fl=fillets.length?fBins.get(bk(Math.floor(x/CELL),Math.floor(z/CELL))):undefined;
  if(fl)for(let i=0;i<fl.length;i++){const f=fl[i],px=x-f.cx,pz=z-f.cz;if(px*f.ax+pz*f.az>0||px*f.bx+pz*f.bz>0)continue;const d=Math.abs(Math.hypot(px,pz)-f.r);if(d<best)best=d;}
  return best;};
 const insideRects=inside,insideAll=(x:number,z:number)=>{if(insideRects(x,z))return true;const fl=fillets.length?fBins.get(bk(Math.floor(x/CELL),Math.floor(z/CELL))):undefined;
  if(fl)for(let i=0;i<fl.length;i++)if(inFillet(fl[i],x,z))return true;return false;};
 const arcAt=(x:number,z:number)=>{const fl=fillets.length?fBins.get(bk(Math.floor(x/CELL),Math.floor(z/CELL))):undefined;if(!fl)return undefined;
  for(let i=0;i<fl.length;i++){const f=fl[i],px=x-f.cx,pz=z-f.cz;if(px*f.ax+pz*f.az>0||px*f.bx+pz*f.bz>0)continue;if(Math.abs(Math.hypot(px,pz)-f.r)<2)return f;}return undefined;};
 return {rects,segs,fillets,inside:insideAll,dist,arcAt};
}
/** Closed loops of an outline. `block`: the loop encloses ground OUTSIDE the union (a city block inside the street network). */
export function outlineLoops(o:Outline){
 const key=(x:number,z:number)=>q3(x)+','+q3(z),from=new Map<string,Seg[]>(),used=new Set<Seg>(),loops:{pts:Pt[];block:boolean}[]=[];
 for(const s of o.segs)for(const k of [key(s.ax,s.az),key(s.bx,s.bz)]){const l=from.get(k);if(l)l.push(s);else from.set(k,[s]);}
 for(const first of o.segs){if(used.has(first))continue;const pts:Pt[]=[{x:first.ax,z:first.az}];let s=first,x=first.bx,z=first.bz;used.add(first);
  for(let guard=0;guard<10000;guard++){pts.push({x,z});const next=(from.get(key(x,z))??[]).find(c=>!used.has(c));if(!next)break;used.add(next);const atA=Math.abs(next.ax-x)<1e-3&&Math.abs(next.az-z)<1e-3;x=atA?next.bx:next.ax;z=atA?next.bz:next.az;s=next;}
  void s;if(Math.abs(pts[0].x-pts[pts.length-1].x)<1e-3&&Math.abs(pts[0].z-pts[pts.length-1].z)<1e-3)pts.pop();if(pts.length<4)continue;
  const mx=(first.ax+first.bx)/2+first.nx*.01,mz=(first.az+first.bz)/2+first.nz*.01;loops.push({pts,block:insidePoly(pts,mx,mz)});}
 return loops;
}

// ---- The registered streets ------------------------------------------------------------------------------------------------------
type Bins={get(x:number,z:number):Rect[]|undefined};
function binRects(rects:Rect[],reach:number):Bins{const m=new Map<number,Rect[]>(),bk=(cx:number,cz:number)=>(cx+2048)*4096+(cz+2048);
 for(const r of rects)for(let cx=Math.floor((r.x-r.w/2-reach)/CELL);cx<=Math.floor((r.x+r.w/2+reach)/CELL);cx++)for(let cz=Math.floor((r.z-r.d/2-reach)/CELL);cz<=Math.floor((r.z+r.d/2+reach)/CELL);cz++){const k=bk(cx,cz),l=m.get(k);if(l)l.push(r);else m.set(k,[r]);}
 return {get:(x,z)=>m.get(bk(Math.floor(x/CELL),Math.floor(z/CELL)))};}
export type HardArea=Rect&{kind:string};
type Streets={asphalt:Outline;foot:Outline;crossings:Crossing[];landings:Rect[];paths:Bins;solid:Bins;solidAll:HardArea[];box:{minX:number;maxX:number;minZ:number;maxZ:number};wx0:number;wz0:number;wnx:number;wnz:number;w:Float32Array;ends:Rect[]};
let S:Streets|null=null;
export const depthStreets=()=>S;
/** What the last world build made (world.ts fills it; the page's debug hook and NOTE.md's counts read it). */
export const depthStats:{value:Record<string,unknown>|null}={value:null};
export type StreetInput={roads:(Rect&{vertical:boolean;carriageway:number})[];junctions:Pt[];crossings:Crossing[];
 /** Flat surfaces laid on the lawn: `path` (the lawn dips under it), anything else (sand, court, pitch, patio: no verge there). */
 hard:HardArea[];
 /** Small things standing on the pavement (signal poles, lamps, benches): a rounded corner keeps its kerb 45 cm clear of them. */
 keep?:Rect[]};
/** Rounded street corners: the radius on an 8 m carriageway (scaled with the carriageway), the one beside a zebra (the junction's
 *  zebras are 2 m off the corner and their dropped kerbs already meet at it, so the curve is one long dropped kerb: the stripes end
 *  0.7 m short of the kerb and the curve only moves the kerb back from them), and the smallest worth drawing. A corner shrinks in
 *  0.25 m steps until it clears its signal pole / lamp / bench (`clear`) and stays on paving. */
export const CORNER={radius:3,zebra:3,zebraNear:6,min:1,clear:.45} as const;
/** Paving sheets laid ACROSS a carriageway (a path that comes over a kerb at least 1.5 m onto the asphalt, at most 14 m along the street) are crossings too:
 *  each gets dropped kerbs like a zebra (reviewer pass: two of them met a full kerb). Skips one within 5 m of a known crossing. */
export function sheetCrossings(roads:StreetInput['roads'],paths:Rect[],known:Crossing[]){const out:Crossing[]=[];
 for(const a of paths)for(const r of roads){const h=r.carriageway/2,v=r.vertical;
  const across0=v?a.x-a.w/2:a.z-a.d/2,across1=v?a.x+a.w/2:a.z+a.d/2,c=v?r.x:r.z,along=v?a.z:a.x,alongLen=v?a.d:a.w,lo=v?r.z-r.d/2:r.x-r.w/2,hi=v?r.z+r.d/2:r.x+r.w/2;
  if(!(across0<c-h-.3&&across1>c-h+1.5)&&!(across1>c+h+.3&&across0<c+h-1.5)||alongLen>14||alongLen<2.2||along<lo+3||along>hi-3)continue;
  const k={x:v?r.x:along,z:v?along:r.z,vertical:v};if([...known,...out].some(o=>o.vertical===v&&Math.hypot(o.x-k.x,o.z-k.z)<5))continue;out.push(k);}
 return out;}
/** Path into the street (owner, Nov 26 2026: "fix this going into the street"): a footpath ENDS where it meets a street. Several path
 *  slabs were laid a few metres past the pavement onto the carriageway; flat, the road (1-3 cm higher) hid that end, but with the
 *  carriageway sunk 12-15 cm (and the pavement dropped at a crossing) the slab's end showed as a pale tongue out on the asphalt.
 *  Returns the part of `r` that is off every `cover` rectangle (the streets: carriageway + pavements, junction squares): a cover
 *  that spans the slab's width and holds one of its ends trims that end back to the cover's edge. `whole` false: nothing is left;
 *  `stuck` true: a cover lies across the slab's middle or over a corner only (left as it is; tests/path-on-road.cjs reports it). */
/** The path slabs world.ts trimmed on the last build: [x, z, w, d] of the area and what is left (0 0: hidden). */
export const pathClips:{value:number[][]}={value:[]};
export function clipToStreets(r:Rect,cover:readonly Rect[],eps=.03){let x0=r.x-r.w/2,x1=r.x+r.w/2,z0=r.z-r.d/2,z1=r.z+r.d/2,stuck=false,changed=true;
 for(let pass=0;changed&&pass<8;pass++){changed=false;
  for(const c of cover){const cx0=c.x-c.w/2,cx1=c.x+c.w/2,cz0=c.z-c.d/2,cz1=c.z+c.d/2;
   if(Math.min(x1,cx1)-Math.max(x0,cx0)<=eps||Math.min(z1,cz1)-Math.max(z0,cz0)<=eps||x1-x0<=eps||z1-z0<=eps)continue;
   const spanZ=cz0<=z0+eps&&cz1>=z1-eps,spanX=cx0<=x0+eps&&cx1>=x1-eps;
   if(spanZ&&cx0<=x0+eps){x0=Math.max(x0,cx1);changed=true;}else if(spanZ&&cx1>=x1-eps){x1=Math.min(x1,cx0);changed=true;}
   else if(spanX&&cz0<=z0+eps){z0=Math.max(z0,cz1);changed=true;}else if(spanX&&cz1>=z1-eps){z1=Math.min(z1,cz0);changed=true;}
   else stuck=true;}}
 const whole=x1-x0>eps&&z1-z0>eps;return {x:(x0+x1)/2,z:(z0+z1)/2,w:Math.max(0,x1-x0),d:Math.max(0,z1-z0),whole,stuck,trimmed:Math.abs(x1-x0-r.w)>1e-6||Math.abs(z1-z0-r.d)>1e-6};}
/** world.ts calls this once the streets are final (before any height is asked for in play). No-op with the flag off. */
export function setDepthStreets(input:StreetInput|null){
 if(!enabled||!input){S=null;return;}
 const half=(r:StreetInput['roads'][number])=>r.carriageway/2,asphaltRects:Rect[]=[...input.roads.map(r=>({x:r.x,z:r.z,w:r.vertical?r.carriageway:r.w,d:r.vertical?r.d:r.carriageway})),...input.junctions.map(j=>({x:j.x,z:j.z,w:8,d:8}))];
 const footRects:Rect[]=[...input.roads.map(r=>({x:r.x,z:r.z,w:r.w,d:r.d})),...input.junctions.map(j=>({x:j.x,z:j.z,w:12,d:12}))];
 // Dead ends: a street end that is not inside another street eases back to today's height (no kerb across the end).
 const ends:Rect[]=[];
 for(const r of input.roads)for(const side of [-1,1]){const ex=r.vertical?r.x:r.x+side*r.w/2,ez=r.vertical?r.z+side*r.d/2:r.z;
  if(input.roads.some(o=>o!==r&&Math.abs(ex-o.x)<o.w/2+.01&&Math.abs(ez-o.z)<o.d/2+.01)||input.junctions.some(j=>Math.abs(ex-j.x)<6.01&&Math.abs(ez-j.z)<6.01))continue;
  ends.push({x:ex,z:ez,w:r.vertical?r.w:0,d:r.vertical?0:r.d});void half;}
 const landings=input.crossings.flatMap(k=>[-1,1].map(side=>k.vertical?{x:k.x+side*5,z:k.z,w:2,d:2*(KERB.dropHalf+KERB.dropTaper)+.2}:{x:k.x,z:k.z+side*5,w:2*(KERB.dropHalf+KERB.dropTaper)+.2,d:2}));
 const minX=Math.min(...footRects.map(r=>r.x-r.w/2))-8,maxX=Math.max(...footRects.map(r=>r.x+r.w/2))+8,minZ=Math.min(...footRects.map(r=>r.z-r.d/2))-8,maxZ=Math.max(...footRects.map(r=>r.z+r.d/2))+8;
 const wx0=Math.floor(minX),wz0=Math.floor(minZ),wnx=Math.ceil(maxX-wx0)+2,wnz=Math.ceil(maxZ-wz0)+2,w=new Float32Array(wnx*wnz).fill(1);
 // Island Line: nothing changes inside railClear of the rails; eased over railEase beyond it.
 const tx:number[]=[],tz:number[]=[];for(let i=0;i<TRACK.n;i++){const x=TRACK.x[i],z=TRACK.z[i];if(x>minX-14&&x<maxX+14&&z>minZ-14&&z<maxZ+14){tx.push(x);tz.push(z);}}
 const reach=KERB.railClear+KERB.railEase;
 for(let n=0;n<tx.length;n++){const i0=Math.max(0,Math.floor(tx[n]-reach-wx0)),i1=Math.min(wnx-1,Math.ceil(tx[n]+reach-wx0)),j0=Math.max(0,Math.floor(tz[n]-reach-wz0)),j1=Math.min(wnz-1,Math.ceil(tz[n]+reach-wz0));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const v=smooth((Math.hypot(wx0+i-tx[n],wz0+j-tz[n])-KERB.railClear-1/* the 2 m sample spacing */)/KERB.railEase);if(v<w[j*wnx+i])w[j*wnx+i]=v;}}
 for(const e of ends){const i0=Math.max(0,Math.floor(e.x-e.w/2-9-wx0)),i1=Math.min(wnx-1,Math.ceil(e.x+e.w/2+9-wx0)),j0=Math.max(0,Math.floor(e.z-e.d/2-9-wz0)),j1=Math.min(wnz-1,Math.ceil(e.z+e.d/2+9-wz0));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const v=smooth((boxDist(wx0+i,wz0+j,e)-1)/KERB.endEase);if(v<w[j*wnx+i])w[j*wnx+i]=v;}}
 const footIn=(x:number,z:number)=>footRects.some(r=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2),solids=input.hard.filter(h=>h.kind!=='path'),keep=input.keep??[];
 const radius:FilletRadius=(v,nz,nx,lenX,lenZ)=>{const near=input.roads.filter(r=>Math.abs(v.x-r.x)<r.w/2+.01&&Math.abs(v.z-r.z)<r.d/2+.01),cw=near.length?Math.min(...near.map(r=>r.carriageway)):8;
  let r=Math.min((input.crossings.some(k=>Math.hypot(k.x-v.x,k.z-v.z)<CORNER.zebraNear)?CORNER.zebra:CORNER.radius)*cw/8,lenX/2-.1,lenZ/2-.1);
  for(;r>=CORNER.min-1e-9;r-=.25){const cx=v.x+r*nx,cz=v.z+r*nz,f={vx:v.x,vz:v.z,ax:0,az:nz,bx:nx,bz:0,r,cx,cz};let ok=true;
   for(let i=0;i<=6&&ok;i++)for(let j=0;j<=6&&ok;j++){const x=v.x+nx*r*(i+.5)/7.5,z=v.z+nz*r*(j+.5)/7.5;if(!inFillet(f,x,z))continue;if(!footIn(x,z)||solids.some(h=>Math.abs(x-h.x)<h.w/2&&Math.abs(z-h.z)<h.d/2))ok=false;}
   for(const k of keep){if(!ok)break;for(const [px,pz] of [[k.x,k.z],[k.x-k.w/2,k.z-k.d/2],[k.x+k.w/2,k.z-k.d/2],[k.x-k.w/2,k.z+k.d/2],[k.x+k.w/2,k.z+k.d/2]]){const u=(px-v.x)*nx,w=(pz-v.z)*nz;
    if(u>-CORNER.clear&&w>-CORNER.clear&&u<r+CORNER.clear&&w<r+CORNER.clear&&Math.hypot(px-cx,pz-cz)>r-CORNER.clear){ok=false;break;}}}
   if(ok)return r;}
  return 0;};
 S={asphalt:buildOutline(asphaltRects,radius),foot:buildOutline(footRects),crossings:input.crossings,landings,paths:binRects(input.hard.filter(h=>h.kind==='path'),1),solid:binRects(input.hard.filter(h=>h.kind!=='path'),1),solidAll:input.hard.filter(h=>h.kind!=='path'),
  box:{minX,maxX,minZ,maxZ},wx0,wz0,wnx,wnz,w,ends};
}
/** 0 on pinned ground (rails, dead ends, outside the town), 1 where the full depth applies. */
/** Unit normal of the height function at (x, z), sampled a little toward (cx, cz) so a vertex on a kerb line takes its own side's
 *  slope (world.ts: the road and pavement meshes are unindexed; face normals showed every triangle of a ramp). */
export function depthNormal(x:number,z:number,cx:number,cz:number,out:number[]){const l=Math.hypot(cx-x,cz-z)||1,qx=x+(cx-x)/l*.04,qz=z+(cz-z)/l*.04,e=.025,dx=(depthLift(qx+e,qz)-depthLift(qx-e,qz))/(2*e),dz=(depthLift(qx,qz+e)-depthLift(qx,qz-e))/(2*e),n=1/Math.hypot(dx,1,dz);out.push(-dx*n,n,-dz*n);return out;}
export function depthWeight(x:number,z:number){const s=S;if(!s||x<=s.box.minX||x>=s.box.maxX||z<=s.box.minZ||z>=s.box.maxZ)return 0;
 const fx=x-s.wx0,fz=z-s.wz0,i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=s.wnx-1||j>=s.wnz-1)return 0;
 const tx=fx-i,tz=fz-j,o=j*s.wnx+i,a=s.w[o],b=s.w[o+1],c=s.w[o+s.wnx],d=s.w[o+s.wnx+1];return (a+(b-a)*tx)*(1-tz)+(c+(d-c)*tx)*tz;}
/** 0..1: how far the kerb is dropped at (x, z) (1 on a zebra's landing, tapering along the kerb). */
function dropAt(s:Streets,x:number,z:number){let best=0;
 // round a rounded corner, the drop is the one at the nearest point of the curved kerb (the dropped kerb and its ramp follow the bend)
 const f=s.asphalt.fillets.length?s.asphalt.arcAt(x,z):undefined;if(f){const px=x-f.cx,pz=z-f.cz,l=Math.hypot(px,pz)||1;x=f.cx+px*f.r/l;z=f.cz+pz*f.r/l;}
 for(let i=0;i<s.crossings.length;i++){const k=s.crossings[i],along=Math.abs(k.vertical?z-k.z:x-k.x);if(along>=KERB.dropHalf+KERB.dropTaper)continue;const across=Math.abs(k.vertical?x-k.x:z-k.z);if(across<3.4||across>4.2+KERB.ramp)continue;
  const v=1-smooth((along-KERB.dropHalf)/KERB.dropTaper);if(v>best)best=v;}
 return best;}
/** THE height: metres above (negative: below) today's flat datum at (x, z). The carriageway, its kerb bevel and the dropped kerbs.
 *  0 with the flag off, off the streets and on every pin. */
export function depthLift(x:number,z:number){
 const s=S;if(!s||!enabled||x<=s.box.minX||x>=s.box.maxX||z<=s.box.minZ||z>=s.box.maxZ)return 0;
 const d=s.asphalt.dist(x,z);
 if(s.asphalt.inside(x,z)){const w=depthWeight(x,z);if(w<=0)return 0;
  if(d>=KERB.bevel)return -(KERB.gutter-(KERB.gutter-KERB.crown)*smooth((d-KERB.bevel)/KERB.camber))*w;
  const edge=-(KERB.gutter-KERB.up)*dropAt(s,x,z);return (edge+(-KERB.gutter-edge)*d/KERB.bevel)*w;}
 if(d>=KERB.ramp)return 0;const drop=dropAt(s,x,z);if(!drop)return 0;
 return -(KERB.gutter-KERB.up)*drop*(1-smooth(d/KERB.ramp))*depthWeight(x,z);
}
const vergeProfile=(o:number)=>o<.12?.08+(.118-.08)*o/.12:o<.32?.118+(.092+VERGE.lip-.118)*(o-.12)/.2:(.092+VERGE.lip)*(1-smooth((o-VERGE.flat)/(VERGE.reach-VERGE.flat)));
const rectIn=(l:Rect[]|undefined,x:number,z:number,pad=0)=>{if(l)for(let i=0;i<l.length;i++){const r=l[i];if(Math.abs(x-r.x)<r.w/2+pad&&Math.abs(z-r.z)<r.d/2+pad)return true;}return false;};
/** DRAWN lawn only: metres the grass stands above today's lawn (-0.112) at (x, z): the verge beside a pavement, dipping under paths. */
export function lawnRise(x:number,z:number){
 const s=S;if(!s||!enabled||x<=s.box.minX||x>=s.box.maxX||z<=s.box.minZ||z>=s.box.maxZ)return 0;
 const o=s.foot.dist(x,z);if(o>=VERGE.reach||s.foot.inside(x,z))return 0;
 let h=vergeProfile(o)*depthWeight(x,z);if(h<=0)return 0;
 const l=s.paths.get(x,z);if(l){let dp=9;for(let i=0;i<l.length;i++){const v=boxDist(x,z,l[i]);if(v<dp)dp=v;}
  if(dp<.5){const cap=dp<=0?.03:.058+(.092+VERGE.lip-.058)*smooth(dp/.5);if(cap<h)h=cap;}}
 return h;
}
/** Open lawn (a verge may be drawn here): inside the island's lawn, not on sand / a court / a pitch / a patio. */
function isLawn(s:Streets,x:number,z:number){return !rectIn(s.solid.get(x,z),x,z,.3)&&insidePoly(INTERIOR_GRASS,x,z);}

// ---- Colours (linear, as the paint batches store them) with the ground shader's mottle (groundTint.ts groundMottle + warm drift) --
const lin=(hex:string)=>{const n=parseInt(hex.slice(1),16),c=(v:number)=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};return [c(n>>16&255),c(n>>8&255),c(n&255)] as const;};
const mottle=(x:number,z:number)=>Math.sin(x*.31+Math.sin(z*.23)*1.3)*.4+Math.sin(z*.47-x*.29+1.7)*.3+Math.sin(x*.83+z*.71+.9)*.3;
export type GroundSort='asphalt'|'pave'|'lawn';
const BASE:Record<GroundSort,{c:readonly [number,number,number];amp:number}>={asphalt:{c:lin('#737c75'),amp:.06},pave:{c:lin('#eddfbb'),amp:.09},lawn:{c:lin('#608870'),amp:.12}};
/** Calibration of a paint-batch colour against the tinted ground material beside it (measured in the page, NOTE.md). */
export const GROUND_MATCH:Record<GroundSort,number>={asphalt:1,pave:1,lawn:.97};
export function groundColor(sort:GroundSort,x:number,z:number,k=1,out:number[]=[]){const b=BASE[sort],n=mottle(x,z),w=n>0?n:0,f=(1+b.amp*n)*k*GROUND_MATCH[sort];
 out.push(b.c[0]*f*(1+b.amp*.5*w),b.c[1]*f,b.c[2]*f*(1-b.amp*.8*w));return out;}
// Reviewer pass (Nov 26 2026): the kerb stone is the PAVEMENT's hue, a step lighter on its lit top edge and darker on its face. The
// first stone ('#ddd8c8', a neutral grey) reflected the blue night light more than the warm paving and read lilac and lighter at night.
const PAVE_LIN=lin('#eddfbb'),STONE=[PAVE_LIN[0]*.93,PAVE_LIN[1]*.945,PAVE_LIN[2]*.97] as const,STONE_EDGE=[Math.min(1,PAVE_LIN[0]*1.13),Math.min(1,PAVE_LIN[1]*1.135),Math.min(1,PAVE_LIN[2]*1.15)] as const,DUST=lin('#b9ac8c'),SOIL=lin('#4f4b30');
/** How the kerb reads from the ~32 degree play camera (no more height): a joint line where the stone meets the paving, the lit top
 *  edge, the shaded face, the dark foot / gutter line. */
export const KERB_READ={joint:.86,face:.66,foot:.6,dust:.42} as const;
/** Why groundAt answers as it does (headless audits). */
export function depthProbe(x:number,z:number){const s=S;if(!s)return null;return {asphalt:s.asphalt.inside(x,z),foot:s.foot.inside(x,z),solid:(s.solid.get(x,z)??[]).filter(r=>Math.abs(x-r.x)<r.w/2+.05&&Math.abs(z-r.z)<r.d/2+.05),path:rectIn(s.paths.get(x,z),x,z),grass:insidePoly(INTERIOR_GRASS,x,z),weight:depthWeight(x,z)};}
/** What is drawn at (x, z) and how high: the layer a contact shade or a small object lies on. null: leave it alone. */
export function groundAt(x:number,z:number):{sort:GroundSort;y:number}|null{
 const s=S;if(!s)return null;
 if(s.asphalt.inside(x,z))return {sort:'asphalt',y:DRAWN.asphalt+depthLift(x,z)};
 if(s.foot.inside(x,z))return {sort:'pave',y:DRAWN.pave+depthLift(x,z)};
 if(rectIn(s.solid.get(x,z),x,z,.05))return null;
 if(rectIn(s.paths.get(x,z),x,z))return {sort:'pave',y:DRAWN.path};
 if(!insidePoly(INTERIOR_GRASS,x,z))return null;
 return {sort:'lawn',y:DRAWN.lawn+lawnRise(x,z)};
}

// ---- Mesh data ---------------------------------------------------------------------------------------------------------------------
/** Vertex-coloured triangles for the plain-paint batches, split by 50 m chunk (the batch key), positions relative to the chunk. */
export type ChunkMesh={x:number;z:number;positions:number[];colors:number[];indices:number[]};
export class Sink{cells=new Map<string,ChunkMesh>();triangles=0;
 cell(x:number,z:number){const ox=Math.floor(x/50)*50,oz=Math.floor(z/50)*50,k=ox+':'+oz;let c=this.cells.get(k);if(!c){c={x:ox+25,z:oz+25,positions:[],colors:[],indices:[]};this.cells.set(k,c);}return c;}
 /** A grid of rows x cols vertices ([x, y, z, r, g, b] each), facing up whatever the order. */
 grid(rows:number,cols:number,v:number[][]){const c=this.cell((v[0][0]+v[v.length-1][0])/2,(v[0][2]+v[v.length-1][2])/2),base=c.positions.length/3;
  for(const p of v){c.positions.push(p[0]-c.x,p[1],p[2]-c.z);c.colors.push(p[3],p[4],p[5]);}
  let area=0;for(let r=0;r<rows-1;r++)for(let k=0;k<cols-1;k++){const a=v[r*cols+k],b=v[r*cols+k+1],d=v[(r+1)*cols+k+1],e=v[(r+1)*cols+k];area+=(b[2]-a[2])*(e[0]-a[0])-(b[0]-a[0])*(e[2]-a[2])+(e[2]-d[2])*(b[0]-d[0])-(e[0]-d[0])*(b[2]-d[2]);}
  const up=area>0;
  for(let r=0;r<rows-1;r++)for(let k=0;k<cols-1;k++){const i=base+r*cols+k,j=i+1,m=i+cols,n=m+1;if(up)c.indices.push(i,j,m,j,n,m);else c.indices.push(i,m,j,j,m,n);this.triangles+=2;}}
 /** A fan of free triangles (each 3 vertices). */
 tris(v:number[][]){const c=this.cell(v[0][0],v[0][2]),base=c.positions.length/3;for(const p of v){c.positions.push(p[0]-c.x,p[1],p[2]-c.z);c.colors.push(p[3],p[4],p[5]);}
  for(let i=0;i+2<v.length;i+=3){const a=v[i],b=v[i+1],d=v[i+2],up=(b[2]-a[2])*(d[0]-a[0])-(b[0]-a[0])*(d[2]-a[2])>0;if(up)c.indices.push(base+i,base+i+1,base+i+2);else c.indices.push(base+i,base+i+2,base+i+1);this.triangles++;}}
}
/** Along-knots of a segment: every `step`, plus `extra` (world coordinate along the segment's axis). */
export function knotsOf(s:Seg,step:number,extra:number[]=[]){const len=Math.hypot(s.bx-s.ax,s.bz-s.az),n=Math.max(1,Math.round(len/step)),k:number[]=[];for(let i=0;i<=n;i++)k.push(len*i/n);
 const a0=s.nx?s.az:s.ax;for(const e of extra){const t=e-a0;if(t>.05&&t<len-.05&&!k.some(q=>Math.abs(q-t)<.05))k.push(t);}return {len,knots:k.sort((p,q)=>p-q)};}
/** Row point: `along` metres from a, `u` metres along the outward normal; the first / last knot is mitred into its corner. */
export function rowPoint(s:Seg,len:number,along:number,u:number,first:boolean,last:boolean){const lo=-s.s0*u,hi=len+s.s1*u;let t=first?lo:last?hi:along;if(t<lo)t=lo;if(t>hi)t=hi;if(hi<lo)t=(lo+hi)/2;
 const dx=(s.bx-s.ax)/len,dz=(s.bz-s.az)/len;return [s.ax+dx*t+s.nx*u,s.az+dz*t+s.nz*u] as const;}

/** A: the kerb. Per asphalt edge: stone top, the bevel face, a dark foot, a dusty gutter channel fading into the asphalt colour.
 *  The asphalt mesh itself starts KERB.channel inside the edge (asphaltBand), so nothing here lies on another surface. */
export function kerbStrips(sink:Sink,low=false){const s=S;if(!s)return;
 const FACE=-KERB.bevel+.05,rows=low?[KERB.stone,.02,-KERB.bevel,-KERB.channel]:[KERB.stone,.02,FACE,-KERB.bevel,-KERB.channel];
 for(const seg of s.asphalt.segs){const extra=s.crossings.filter(k=>k.vertical===(seg.nx!==0)).flatMap(k=>{const c=seg.nx?k.z:k.x;return low?[c-KERB.dropHalf-KERB.dropTaper,c,c+KERB.dropHalf+KERB.dropTaper]:[c-KERB.dropHalf-KERB.dropTaper,c-KERB.dropHalf,c+KERB.dropHalf,c+KERB.dropHalf+KERB.dropTaper];});
  const {len,knots}=knotsOf(seg,low?14:10,extra);
  for(let j=0;j<knots.length-1;j++){const v:number[][]=[];
   const [mx,mz]=rowPoint(seg,len,(knots[j]+knots[j+1])/2,.5,false,false),paved=s.foot.inside(mx,mz);// a dead end has no pavement across it
   for(let r=paved?0:1;r<rows.length;r++)for(const e of [j,j+1]){const u=paved?rows[r]:r===1?0:rows[r],[x,z]=rowPoint(seg,len,knots[e],u,e===0,e===knots.length-1);v.push(vert(x,z,u,r));}
   sink.grid(paved?rows.length:rows.length-1,2,v);}}
 // Rounded corners: the same rows round the quarter circle (FILLET_STEPS columns; u is toward the centre, on the pavement).
 for(const f of s.asphalt.fillets){const v:number[][]=[];for(let r=0;r<rows.length;r++)for(let k=0;k<=FILLET_STEPS;k++){const [x,z]=filletPoint(f,k,f.r-rows[r]);v.push(vert(x,z,rows[r],r));}
  sink.grid(rows.length,FILLET_STEPS+1,v);}
 function vert(x:number,z:number,u:number,r:number){const n=hash(x*3.1+z*7.7),p=[x,0,z],w=depthWeight(x,z);
    if(u>0){p[1]=DRAWN.pave+depthLift(x,z)+.006;const c=r===0?STONE:STONE_EDGE,f=(.96+.08*n)*(r===0?KERB_READ.joint:1),g=groundColor('pave',x,z),m=Math.min(1,w*2.5);p.push(g[0]+(c[0]*f-g[0])*m,g[1]+(c[1]*f-g[1])*m,g[2]+(c[2]*f-g[2])*m);}
    else{p[1]=DRAWN.asphalt+depthLift(x,z);const a=groundColor('asphalt',x,z,1);
     if(u===FACE&&!low){const f=(KERB_READ.face+.06*n);p.push(a[0]+(STONE[0]*f-a[0])*Math.min(1,w*2.5),a[1]+(STONE[1]*f-a[1])*Math.min(1,w*2.5),a[2]+(STONE[2]*f-a[2])*Math.min(1,w*2.5));}// the kerb's face is stone down to its foot
     else if(u===-KERB.bevel){const f=1-(KERB_READ.foot-.12*n)*w,m=(.1+.25*n)*w;p.push((a[0]+(DUST[0]-a[0])*m)*f,(a[1]+(DUST[1]-a[1])*m)*f,(a[2]+(DUST[2]-a[2])*m)*f);}// the dark foot of the kerb: baked contact shade + dirt
     else if(u===-KERB.channel||u===0)p.push(a[0],a[1],a[2]);
     else{const m=(KERB_READ.dust+.3*n)*w;p.push(a[0]+(DUST[0]-a[0])*m,a[1]+(DUST[1]-a[1])*m,a[2]+(DUST[2]-a[2])*m);}}
    return p;}
}
/** True where the kerb strips cover the asphalt (the asphalt mesh leaves these cells out). */
export function asphaltBand(x:number,z:number){const s=S;if(!s)return false;const B=KERB.channel-1e-4;
 for(const f of s.asphalt.fillets){const u=(x-f.vx)*f.bx+(z-f.vz)*f.bz,w=(x-f.vx)*f.ax+(z-f.vz)*f.az;if(u>-B&&w>-B&&u<f.r&&w<f.r)return true;}// the corner patch (asphaltCorners)
 for(const g of s.asphalt.segs){const perp=g.nx?(g.ax-x)*g.nx:(g.az-z)*g.nz;if(perp<=0||perp>=B)continue;const t=g.nx?z-g.az:x-g.ax,len=g.nx?g.bz-g.az:g.bx-g.ax;if(t>-(g.s0<0?B:0)&&t<len+(g.s1<0?B:0))return true;}
 return false;}
/** Knots the asphalt cells are cut on (world.ts roadSurface): the band edge, the camber, and a regular step for the pins' easing. */
export function asphaltKnots(){const xs:number[]=[],zs:number[]=[],xSeg:Seg[]=[],zSeg:Seg[]=[],s=S;if(!s)return {xs,zs,xSeg,zSeg};
 for(const g of s.asphalt.segs){const e=g.nx?g.ax:g.az,n=-(g.nx||g.nz);for(const o of [KERB.channel,2.1]){if(g.nx){xs.push(q3(e+n*o));xSeg.push(g);}else{zs.push(q3(e+n*o));zSeg.push(g);}}}
 // a rounded corner's patch square [V - channel, V + r] on both axes: its edges are cut lines too (a pseudo segment spans its extent)
 for(const f of s.asphalt.fillets){const B=KERB.channel,x0=Math.min(f.vx-f.bx*B,f.cx),x1=Math.max(f.vx-f.bx*B,f.cx),z0=Math.min(f.vz-f.az*B,f.cz),z1=Math.max(f.vz-f.az*B,f.cz),g:Seg={ax:x0,az:z0,bx:x1,bz:z1,nx:0,nz:0,s0:0,s1:0};
  for(const x of [x0,x1]){xs.push(q3(x));xSeg.push(g);}for(const z of [z0,z1]){zs.push(q3(z));zSeg.push(g);}}
 return {xs,zs,xSeg,zSeg};}
/** Rounded corners: the asphalt of each corner's patch square that the kerb strip leaves (beyond the channel), as world triangles
 *  [x, y, z, ...] on the height function, facing up. Two rings from the patch's outer corner to the channel's arc. */
export function asphaltCorners():{x:number;z:number;tris:number[]}[]{const s=S;if(!s)return [];const out:{x:number;z:number;tris:number[]}[]=[],B=KERB.channel;
 for(const f of s.asphalt.fillets){const t:number[]=[],ox=f.vx-(f.bx+f.ax)*B,oz=f.vz-(f.bz+f.az)*B,arc:number[][]=[],mid:number[][]=[];
  for(let k=0;k<=FILLET_STEPS;k++){const [x,z]=filletPoint(f,k,f.r+B);arc.push([x,z]);mid.push([(x+ox)/2,(z+oz)/2]);}
  const tri=(a:number[],b:number[],c:number[])=>{if((b[1]-a[1])*(c[0]-a[0])-(b[0]-a[0])*(c[1]-a[1])<0){const q=b;b=c;c=q;}for(const p of [a,b,c])t.push(p[0],DRAWN.asphalt+depthLift(p[0],p[1]),p[1]);};
  for(let k=0;k<FILLET_STEPS;k++){tri(arc[k],arc[k+1],mid[k+1]);tri(arc[k],mid[k+1],mid[k]);tri([ox,oz],mid[k],mid[k+1]);}
  out.push({x:(f.vx+f.cx)/2,z:(f.vz+f.cz)/2,tris:t});}
 return out;}
/** Rounded corners: a pavement cell's triangles (world [x, y, z, ...]) less every rounded corner's asphalt (the square [V, C] outside
 *  the circle, cut on the kerb's own chords). Returns the input when no corner touches the cell. */
export function pavementTrim(x0:number,x1:number,z0:number,z1:number,tris:number[]):number[]{const s=S;if(!s)return tris;
 const hit=s.asphalt.fillets.filter(f=>Math.min(f.vx,f.cx)<x1-1e-6&&Math.max(f.vx,f.cx)>x0+1e-6&&Math.min(f.vz,f.cz)<z1-1e-6&&Math.max(f.vz,f.cz)>z0+1e-6);if(!hit.length)return tris;
 type P3=[number,number,number];
 const clip=(poly:P3[],a:number,b:number,c:number)=>{const o:P3[]=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=a*p[0]+b*p[2]+c,dq=a*q[0]+b*q[2]+c;
  if(dp>=0)o.push(p);if((dp>=0)!==(dq>=0)){const t=dp/(dp-dq);o.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t]);}}return o;};
 let polys:P3[][]=[];for(let i=0;i<tris.length;i+=9)polys.push([[tris[i],tris[i+1],tris[i+2]],[tris[i+3],tris[i+4],tris[i+5]],[tris[i+6],tris[i+7],tris[i+8]]]);
 for(const f of hit){const next:P3[][]=[];
  for(const p of polys){// u = (x - V).b <= r and w = (x - V).a <= r: the corner square (the pavement only lies at u, w >= 0 here)
   const cu=f.r+f.vx*f.bx+f.vz*f.bz,cw=f.r+f.vx*f.ax+f.vz*f.az,outU=clip(p,f.bx,f.bz,-cu),inU=clip(p,-f.bx,-f.bz,cu);if(outU.length>2)next.push(outU);
   const outW=clip(inU,f.ax,f.az,-cw),inW=clip(inU,-f.ax,-f.az,cw);if(outW.length>2)next.push(outW);
   let disc=inW;for(let k=0;k<4*FILLET_STEPS&&disc.length>2;k++){const t=(k+.5)/FILLET_STEPS*Math.PI/2,h=f.r*Math.cos(Math.PI/4/FILLET_STEPS),nx=Math.cos(t),nz=Math.sin(t);
    disc=clip(disc,-nx,-nz,h+nx*f.cx+nz*f.cz);}// the 4N-gon whose vertices are the kerb's: half-planes n.(p - C) <= r cos(pi / 4N), n at the mid angles
   if(disc.length>2)next.push(disc);}
  polys=next;}
 const out:number[]=[];for(const p of polys)for(let i=1;i+1<p.length;i++){let a=p[0],b=p[i],c=p[i+1];if((b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])<0){const q=b;b=c;c=q;}if(Math.abs((b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]))<1e-9)continue;out.push(...a,...b,...c);}
 return out;}
/** A pavement cell [x0, x1] x [z0, z1]: null when flat, else the triangles (world x, y, z) with the dropped kerb's ramp cut in. */
export function pavementCell(x0:number,x1:number,z0:number,z1:number):number[]|null{const s=S;if(!s)return null;
 const hit=s.landings.filter(l=>l.x-l.w/2<x1-1e-6&&l.x+l.w/2>x0+1e-6&&l.z-l.d/2<z1-1e-6&&l.z+l.d/2>z0+1e-6);if(!hit.length)return null;
 const cut=(a:number,b:number,edges:number[])=>[...new Set([a,b,...edges.filter(e=>e>a+1e-6&&e<b-1e-6)].map(q3))].sort((p,q)=>p-q);
 const xs=cut(x0,x1,hit.flatMap(l=>[l.x-l.w/2,l.x+l.w/2])),zs=cut(z0,z1,hit.flatMap(l=>[l.z-l.d/2,l.z+l.d/2])),out:number[]=[];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const a=xs[i],b=xs[i+1],c=zs[j],d=zs[j+1],inside=hit.some(l=>Math.abs((a+b)/2-l.x)<l.w/2&&Math.abs((c+d)/2-l.z)<l.d/2);
  const nx=inside?Math.max(1,Math.ceil((b-a)/.7)):1,nz=inside?Math.max(1,Math.ceil((d-c)/.7)):1,y=(x:number,z:number)=>DRAWN.pave+(inside?depthLift(x,z):0);
  for(let p=0;p<nx;p++)for(let q=0;q<nz;q++){const xa=a+(b-a)*p/nx,xb=a+(b-a)*(p+1)/nx,za=c+(d-c)*q/nz,zb=c+(d-c)*(q+1)/nz;
   out.push(xa,y(xa,za),za,xa,y(xa,zb),zb,xb,y(xb,zb),zb,xa,y(xa,za),za,xb,y(xb,zb),zb,xb,y(xb,za),za);}}
 return out;}

/** The lawn: holes where the sunk carriageway (and a dropped kerb's ramp) lies below it, the blocks inside the street network, and
 *  the verge patch (geometry y = rise above the lawn mesh; the soil lip goes to `sink`). null with the flag off. */
export function depthLawn(sink:Sink|null,low=false,soft=false){const s=S;if(!s)return null;const rim:number[]=[],rimMid:number[]=[],rimIn:number[]=[];/* soft (?surf=1, surfaceEdges.ts): the grass creeps 12 to 42 cm over the paving and the lawn shader breaks that rim up (aEdge on the `rim` vertices); no soil strip then */
 const cut:Rect[]=[...s.asphalt.rects.map(r=>({x:r.x,z:r.z,w:r.w-.2,d:r.d-.2})),...s.crossings.flatMap(k=>[-1,1].map(side=>k.vertical?{x:k.x+side*4.45,z:k.z,w:1.1,d:2*(KERB.dropHalf+KERB.dropTaper)+.6}:{x:k.x,z:k.z+side*4.45,w:2*(KERB.dropHalf+KERB.dropTaper)+.6,d:1.1}))];
 const loops=outlineLoops(buildOutline(cut)),ok=loops.every(l=>l.pts.every(p=>insidePoly(INTERIOR_GRASS,p.x,p.z)));
 const position:number[]=[],index:number[]=[];let soil=0;
 const rows=low?[-.04,.14,.34,VERGE.reach]:[-.04,.14,.34,VERGE.flat,VERGE.reach];
 for(const seg of s.foot.segs){const horizontal=seg.nx===0,extra:number[]=[];
  // knots where a path meets this edge (its two sides, and half a metre beyond for the lip beside it)
  {const lo=Math.min(horizontal?seg.ax:seg.az,horizontal?seg.bx:seg.bz),hi=Math.max(horizontal?seg.ax:seg.az,horizontal?seg.bx:seg.bz),line=horizontal?seg.az:seg.ax;
   for(let t=lo;t<hi;t+=CELL){const l=s.paths.get(horizontal?t:line+ (seg.nx)*1,horizontal?line+seg.nz*1:t);if(!l)continue;
    for(const r of l){const near=horizontal?Math.abs(line-r.z)-r.d/2:Math.abs(line-r.x)-r.w/2;if(near>VERGE.reach)continue;const c=horizontal?r.x:r.z,hw=(horizontal?r.w:r.d)/2;extra.push(c-hw-.5,c-hw,c+hw,c+hw+.5);}}}
  const {len,knots}=knotsOf(seg,low?8:4,extra),pt=(e:number,u:number)=>rowPoint(seg,len,knots[e],u,e===0,e===knots.length-1);
  for(let j=0;j<knots.length-1;j++){
   // a column is drawn only over open lawn (every row point) and where the depth applies
   let open=true;const mid=(knots[j]+knots[j+1])/2;for(const u of [.3,1.2,2.4,VERGE.reach]){const [x,z]=rowPoint(seg,len,mid,u,false,false);if(!isLawn(s,x,z)){open=false;break;}}
   {const [x,z]=rowPoint(seg,len,mid,.3,false,false);if(depthWeight(x,z)<.02)open=false;}
   if(!open)continue;
   const base=position.length/3;
   for(let r=0;r<rows.length;r++)for(const e of [j,j+1]){let u=rows[r];const [fx,fz]=pt(e,.2);const onPath=rectIn(s.paths.get(fx,fz),fx,fz,.55);
    if(r===0){u=onPath?0:-((soft?.2:.02)+(soft?.34:.07)*hash(Math.round((seg.nx?fz:fx)*2)*1.37+seg.ax+seg.az));if(!onPath)rim.push(position.length/3);}
    else if(soft&&!onPath&&r<3)(r===1?rimMid:rimIn).push(position.length/3);// the soft blend's two inner rows: 0.46 to 0.76 m of fade in all (surfaceEdges.ts)// the grass creeps a little over the paving, irregularly
    const [x,z]=pt(e,u),w=depthWeight(x,z);position.push(x,r===0?(onPath?lawnRise(x+seg.nx*.01,z+seg.nz*.01):.08*w+.021*Math.min(1,w*4)):r===rows.length-1?0:lawnRise(x,z),z);}
   const A=base*3,up=(position[A+5]-position[A+2])*(position[A+6]-position[A])-(position[A+3]-position[A])*(position[A+8]-position[A+2])>0;
   for(let r=0;r<rows.length-1;r++){const i=base+r*2,k=i+1,m=i+2,n=i+3;if(up)index.push(i,k,m,k,n,m);else index.push(i,m,k,k,m,n);}
   // the darker, slightly irregular lip where grass meets paving: a soil line peeping out under the grass edge
   if(sink&&!low&&!soft){const [fx,fz]=pt(j,.2),[gx,gz]=pt(j+1,.2);if(!rectIn(s.paths.get(fx,fz),fx,fz,.55)&&!rectIn(s.paths.get(gx,gz),gx,gz,.55)){
     const ov=(x:number,z:number)=>.02+.07*hash(Math.round((seg.nx?z:x)*2)*1.37+seg.ax+seg.az),o0=ov(fx,fz),o1=ov(gx,gz),first=j===0,last=j===knots.length-2,v:number[][]=[];
     for(const side of [0,1])for(let e=0;e<=2;e+=2){const t=e/2,along=knots[j]+(knots[j+1]-knots[j])*t,o=o0+(o1-o0)*t,wd=.012+.05*hash(Math.round(along*2)*3.7+seg.ax*1.3+seg.az);
      const [x,z]=rowPoint(seg,len,along,side?-o+.025:-o-wd,first&&e===0,last&&e===2),g=groundColor('lawn',x,z,.5+.12*hash(x*5.3+z*1.9));v.push([x,DRAWN.pave+.006,z,(g[0]+SOIL[0])/2,(g[1]+SOIL[1])/2,(g[2]+SOIL[2])/2]);}
     sink.grid(2,2,v);soil+=2;}}
  }}
 return {holes:ok?loops.filter(l=>!l.block).map(l=>l.pts):[],blocks:ok?loops.filter(l=>l.block).map(l=>l.pts):[],holesOk:ok,patch:{position,index,triangles:index.length/3},soil,rim,rimMid,rimIn};
}

export type GroundedObject={kind:string;x:number;z:number;w?:number;d?:number;r?:number;yaw?:number};
const RING:Record<string,{spread:number;k:number}>={building:{spread:.6,k:.62},tree:{spread:.55,k:.6},'small-tree':{spread:.4,k:.65},bench:{spread:.28,k:.66},planter:{spread:.32,k:.62},'street-lamp':{spread:.3,k:.62},'terrace-lamp':{spread:.3,k:.62},'traffic-signal':{spread:.34,k:.6},table:{spread:.3,k:.7},vending:{spread:.34,k:.6},palm:{spread:.5,k:.64},sign:{spread:.25,k:.66}};
/** C: baked contact shade. A skirt on the ground round each object's foot: the ground's own colour, darkened at the foot and
 *  fading to nothing at the rim (so it needs no blending and no new material). Skipped where the foot stands across two surfaces. */
export function contactShade(sink:Sink,objects:GroundedObject[]){let made=0;
 for(const o of objects){const spec=RING[o.kind];if(!spec)continue;const round=o.r!==undefined,n=10,cs=Math.cos(o.yaw??0),sn=Math.sin(o.yaw??0);
  const inner:[number,number][]=[],outer:[number,number][]=[];
  if(round)for(let i=0;i<n;i++){const a=i/n*Math.PI*2+.3,wob=1+.18*(hash(o.x*1.3+o.z*2.1+i)-.5);inner.push([o.x+Math.cos(a)*o.r!,o.z+Math.sin(a)*o.r!]);outer.push([o.x+Math.cos(a)*(o.r!+spec.spread*wob),o.z+Math.sin(a)*(o.r!+spec.spread*wob)]);}
  else{const hw=o.w!/2,hd=o.d!/2,sides=[[-hw,-hd,1,0,0,-1,o.w!],[hw,-hd,0,1,1,0,o.d!],[hw,hd,-1,0,0,1,o.w!],[-hw,hd,0,-1,-1,0,o.d!]];// start corner, direction, outward, length
   sides.forEach((sd,k)=>{const prev=sides[(k+3)%4],steps=Math.max(1,Math.min(8,Math.round(sd[6]/2.5)));
    for(let i=0;i<steps;i++){const t=i/steps*sd[6],lx=sd[0]+sd[2]*t,lz=sd[1]+sd[3]*t,ox=i?sd[4]:(sd[4]+prev[4])*.75,oz=i?sd[5]:(sd[5]+prev[5])*.75;
     const sp=spec.spread*(1+.2*(hash(o.x+o.z*1.7+i*3.3+k)-.5)),ex=lx+ox*sp,ez=lz+oz*sp;
     inner.push([o.x+lx*cs+lz*sn,o.z-lx*sn+lz*cs]);outer.push([o.x+ex*cs+ez*sn,o.z-ex*sn+ez*cs]);}});}
  const m=inner.length;
  for(let i=0;i<m;i++){const j=(i+1)%m,pts=[inner[i],inner[j],outer[i],outer[j]],g=pts.map(p=>groundAt(p[0],p[1]));
   if(g.some(q=>!q)||g.some(q=>q!.sort!==g[0]!.sort))continue;
   const v=pts.map((p,e)=>{const c=groundColor(g[e]!.sort,p[0],p[1],e<2?spec.k:1);return [p[0],g[e]!.y+.012,p[1],c[0],c[1],c[2]];});
   sink.grid(2,2,v);made++;}}
 return made;
}
/** C: small things on the ground with their own shadows (as the beach has stones): drain grates in the gutter, manhole covers,
 *  fallen leaves under the town's trees, pebbles along the lawn's edge. Deterministic; skipped on the lowest tier. */
export function smallObjects(sink:Sink,trees:Pt[],pebbleStones=true){const s=S;if(!s)return {grates:0,manholes:0,leaves:0,pebbles:0};let grates=0,manholes=0,leaves=0,pebbles=0;
 const IRON=lin('#3b3d3a'),IRON_LIGHT=lin('#565955'),flat=(x:number,z:number,hw:number,hd:number,y:number,c:readonly number[],f=1)=>sink.grid(2,2,[[x-hw,y,z-hd,c[0]*f,c[1]*f,c[2]*f],[x+hw,y,z-hd,c[0]*f,c[1]*f,c[2]*f],[x-hw,y,z+hd,c[0]*f,c[1]*f,c[2]*f],[x+hw,y,z+hd,c[0]*f,c[1]*f,c[2]*f]]);
 for(const seg of s.asphalt.segs){const len=Math.hypot(seg.bx-seg.ax,seg.bz-seg.az);
  for(let t=9+8*hash(seg.ax+seg.az*1.3);t<len-6;t+=22+10*hash(t+seg.ax)){const [x,z]=rowPoint(seg,len,t,-.36,false,false);if(depthWeight(x,z)<.95||dropAt(s,x-seg.nx*.4,z-seg.nz*.4)>0)continue;
   const y=DRAWN.asphalt+depthLift(x,z)+.014,along=seg.nx?0:1;flat(x,z,along?.26:.13,along?.13:.26,y,IRON_LIGHT);
   for(const k of [-1,0,1])flat(x+(along?k*.15:0),z+(along?0:k*.15),along?.045:.09,along?.09:.045,y+.004,IRON,.7);grates++;}}
 for(const r of s.asphalt.rects){const vertical=r.d>r.w,len=vertical?r.d:r.w;if(len<20)continue;
  for(let t=14+9*hash(r.x*.7+r.z);t<len-12;t+=38+16*hash(t+r.x)){const side=hash(t*1.9)>.5?1.7:-1.7,x=vertical?r.x+side:r.x-len/2+t,z=vertical?r.z-len/2+t:r.z+side;
   if(depthWeight(x,z)<.95||s.asphalt.dist(x,z)<1.2||s.crossings.some(k=>Math.hypot(k.x-x,k.z-z)<7))continue;
   const y=DRAWN.asphalt+depthLift(x,z)+.014,v:number[][]=[],a0=groundColor('asphalt',x,z,.8);
   for(let i=0;i<10;i++){const a=i/10*Math.PI*2,b=(i+1)/10*Math.PI*2;v.push([x,y+.004,z,IRON_LIGHT[0],IRON_LIGHT[1],IRON_LIGHT[2]],[x+Math.cos(a)*.34,y,z+Math.sin(a)*.34,IRON[0],IRON[1],IRON[2]],[x+Math.cos(b)*.34,y,z+Math.sin(b)*.34,IRON[0],IRON[1],IRON[2]]);
    v.push([x+Math.cos(a)*.34,y,z+Math.sin(a)*.34,IRON[0],IRON[1],IRON[2]],[x+Math.cos(a)*.43,y-.004,z+Math.sin(a)*.43,a0[0],a0[1],a0[2]],[x+Math.cos(b)*.34,y,z+Math.sin(b)*.34,IRON[0],IRON[1],IRON[2]]);}
   sink.tris(v);manholes++;}}
 const LEAF=[lin('#b98a3a'),lin('#8d7a34'),lin('#a5612f'),lin('#6f7f3a')];
 for(const t of trees){if(depthWeight(t.x,t.z)<=0&&s.foot.dist(t.x,t.z)>=CAP)continue;const count=2+Math.floor(hash(t.x*3.3+t.z)*4);
  for(let i=0;i<count;i++){const a=hash(t.x+i*7.1+t.z*.3)*Math.PI*2,rad=.7+2.1*hash(t.z+i*3.7),x=t.x+Math.cos(a)*rad,z=t.z+Math.sin(a)*rad,g=groundAt(x,z);if(!g)continue;
   const c=LEAF[Math.floor(hash(i+t.x*9.1)*4)%4],yaw=hash(x*4.4+z)*Math.PI,sz=.07+.05*hash(x+z*2.2),cx=Math.cos(yaw)*sz,cz=Math.sin(yaw)*sz,y=g.y+.016;
   sink.tris([[x-cx,y,z-cz,c[0],c[1],c[2]],[x+cz*.55,y+.012,z-cx*.55,c[0]*1.15,c[1]*1.15,c[2]*1.15],[x+cx,y+.03,z+cz,c[0],c[1],c[2]],[x-cx,y,z-cz,c[0],c[1],c[2]],[x+cx,y+.03,z+cz,c[0],c[1],c[2]],[x-cz*.55,y+.012,z+cx*.55,c[0]*.8,c[1]*.8,c[2]*.8]]);leaves++;}}
 const PEBBLE=[lin('#b8b2a2'),lin('#8f8a7c'),lin('#cfc6ad')];
 if(pebbleStones)for(const seg of s.foot.segs){const len=Math.hypot(seg.bx-seg.ax,seg.bz-seg.az);
  for(let t=3+5*hash(seg.ax*1.1+seg.az);t<len-3;t+=7+9*hash(t*1.3+seg.az)){const u=.16+.4*hash(t+seg.ax*.7),[x,z]=rowPoint(seg,len,t,u,false,false);if(depthWeight(x,z)<.5||!isLawn(s,x,z)||rectIn(s.paths.get(x,z),x,z,.4))continue;
   const n=1+Math.floor(hash(t*2.7)*2.4);
   for(let i=0;i<n;i++){const px=x+(hash(t+i*5.5)-.5)*.5,pz=z+(hash(t*1.7+i*2.3)-.5)*.5,g=groundAt(px,pz);if(!g||g.sort!=='lawn')continue;
    const r=.05+.05*hash(px*7+pz),h=r*(.7+.5*hash(pz*3.1)),c=PEBBLE[Math.floor(hash(px+pz*4)*3)%3],y=g.y-.01,yaw=hash(px*2+pz*5)*6.28,P=[0,1,2].map(k=>[px+Math.cos(yaw+k*2.094)*r,y,pz+Math.sin(yaw+k*2.094)*r]),top=[px+(hash(px)-.5)*r*.5,y+h+.01,pz+(hash(pz)-.5)*r*.5];
    for(let k=0;k<3;k++){const a=P[k],b=P[(k+1)%3],f=.78+.2*k;sink.tris([[a[0],a[1],a[2],c[0]*f*.8,c[1]*f*.8,c[2]*f*.8],[top[0],top[1],top[2],c[0]*1.08,c[1]*1.08,c[2]*1.08],[b[0],b[1],b[2],c[0]*f*.8,c[1]*f*.8,c[2]*f*.8]]);}
    pebbles++;}}}
 return {grates,manholes,leaves,pebbles};
}
