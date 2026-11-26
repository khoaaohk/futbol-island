// Island elevation system (Nov 25 2026, owner: "the island needs more elevation along with the depth"). Pure data, no three.js.
//
// ONE height function per region (createRegion → region.ground), all summed by groundLift(x, z), which venues.ts
// fieldSurfaceHeight adds to the walked height: so the player, rides, landing, the camera, NPC helpers and the tests agree, and
// the drawn side (elevationDrape.ts: the terrain mesh, every placed piece, the draped flat layers) reads the same function.
//
// A region is "terraces + slopes":
//  - depth(x, z): metres INTO the raised ground. 0 keeps the old datum: beaches, and everything PINNED at sea level (a pitch,
//    a station and its rails, a junction). Build it with insidePolygon / ringDistance / boxDistance / pathDistance and Math.min.
//  - profile(d, x, z): height for a depth (the graded slope: a dune band, then the long climb, plus any undulation).
//  - ribbons: carriageways. Level ACROSS (cars, kerbs and paving stay square), graded ALONG at the profile's own height on the
//    centre line, blended into the ground beside them. Give the profile a longer band near a ribbon for a gentle road grade.
//  - pads: terraces. A level rectangle (a building and its walk-round, a plaza, a pitch at a chosen `level`), the ground
//    blending up or down to it over padBlend metres. Without `level` a pad takes the mean of its centre and its lowest corner.
//  - PINS WIN: every height is capped at capSlope (0.3) x depth, so pinned ground is exact and a pad beside a pin sits low enough to stay level.
// The result is sampled ONCE (first query) into a `step` grid and read bilinearly: that grid IS the definition (cheap per frame).
//
// Dev flag `?elev=1` (default OFF: groundLift is 0 after one comparison and nothing is built differently). To ship: make
// ELEVATION_DEFAULT true (one line); `?elev=0` then switches it off for a before/after.
export const ELEVATION_DEFAULT=false;
const query=(()=>{try{return typeof window!=='undefined'&&window.location&&typeof window.location.search==='string'?window.location.search:null;}catch{return null;}})();
let enabled=query===null?ELEVATION_DEFAULT:/[?&]elev=1(&|$)/.test(query)||(ELEVATION_DEFAULT&&!/[?&]elev=0(&|$)/.test(query));
/** Tests call this (before anything asks for a height); the browser reads the URL once. */
export function setElevation(on:boolean){enabled=on;}
export const elevationOn=()=>enabled;

export type Pt={x:number;z:number};
export type Box={x:number;z:number;w:number;d:number};
export type Pad=Box&{level?:number};
export type Ribbon={path:readonly Pt[];half:number;blend:number};
export const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function insidePolygon(poly:readonly Pt[],x:number,z:number){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;}
/** Nearest point on an open path (closed: a ring): distance and the point itself. */
export function pathNearest(path:readonly Pt[],x:number,z:number,closed=false){let best=Infinity,px=x,pz=z;const n=closed?path.length:path.length-1;
 for(let i=0;i<n;i++){const a=path[i],b=path[(i+1)%path.length],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1))),qx=a.x+t*dx,qz=a.z+t*dz,d=Math.hypot(x-qx,z-qz);if(d<best){best=d;px=qx;pz=qz;}}
 return {d:best,x:px,z:pz};}
export const ringDistance=(poly:readonly Pt[],x:number,z:number)=>pathNearest(poly,x,z,true).d;
export const boxDistance=(x:number,z:number,b:Box)=>Math.hypot(Math.max(0,Math.abs(x-b.x)-b.w/2),Math.max(0,Math.abs(z-b.z)-b.d/2));

export type RegionSpec={id:string;box:{minX:number;maxX:number;minZ:number;maxZ:number};depth:(x:number,z:number)=>number;profile:(d:number,x:number,z:number)=>number;
 ribbons?:Ribbon[];pads?:Pad[];padBlend?:number;capSlope?:number;step?:number};
export type Region={id:string;spec:RegionSpec;ground(x:number,z:number):number;slope(x:number,z:number):number;peak():number;padLevel(i:number):number};
export function createRegion(spec:RegionSpec):Region{
 const {box,depth,profile}=spec,ribbons=spec.ribbons??[],pads=spec.pads??[],blend=spec.padBlend??6,step=spec.step??2;
 const base=(x:number,z:number)=>{const d=depth(x,z);return d>0?profile(d,x,z):0;};
 // Pins win: nothing (a pad, a ribbon, a blend) may stand higher than `cap` x the distance to pinned ground, so the datum is exact
 // on every pin and no bank beside one is steeper than `cap`.
 const cap=spec.capSlope??.3;
 let levels:number[]|null=null;
 const padLevel=(i:number)=>(levels??=(()=>{const rooms:number[]=[],out=pads.map(p=>{const pts=[-1,0,1].flatMap(a=>[-1,0,1].map(b=>[p.x+a*p.w/2,p.z+b*p.d/2])),room=cap*Math.min(...pts.map(([x,z])=>Math.max(0,depth(x,z))));rooms.push(room);
  if(p.level!==undefined)return Math.min(p.level,room);const c=base(p.x,p.z),low=Math.min(...pts.map(([x,z])=>base(x,z)));return Math.min((c+low)/2,room);});
  // Neighbouring pads: touching or overlapping (within 1.5 m) they are ONE terrace (a shop on a plaza's corner); closer than the
  // blend they may differ by at most 0.3 x the gap, so the bank between two terraces stays walkable. The two meet in the middle
  // (the lower one rises as far as its pins allow, the higher one comes down). A pad with an explicit `level` never moves.
  const gap=(a:Pad,b:Pad)=>Math.hypot(Math.max(0,Math.abs(a.x-b.x)-(a.w+b.w)/2),Math.max(0,Math.abs(a.z-b.z)-(a.d+b.d)/2));
  for(let n=0,again=true;again&&n<400;n++){again=false;for(let i=0;i<pads.length;i++)for(let j=0;j<pads.length;j++){if(i===j)continue;const g=gap(pads[i],pads[j]);if(g>=blend)continue;
   const over=out[i]-out[j]-(g<1.5?0:.3*g);if(over<=1e-4)continue;again=true;const up=pads[j].level!==undefined?0:Math.min(over/2,rooms[j]-out[j]);out[j]+=up;if(pads[i].level===undefined)out[i]-=over-up;}}
  return out;})())[i];
 // Pads: inside one, exactly its level; between neighbours, a weighted mix (weights grow without bound toward a pad's edge, so
 // two terraces whose blends overlap each stay level and the bank between them is one smooth S).
 let inPad=false;
 const padded=(x:number,z:number)=>{inPad=false;
  const d0=depth(x,z);if(d0<=0)return 0;let h=profile(d0,x,z),top=0,sum=0,mix=0;
  for(let i=0;i<pads.length;i++){const d=boxDistance(x,z,pads[i]);if(d>=blend)continue;
   if(d<=0){inPad=true;return Math.max(0,Math.min(padLevel(i),cap*d0));}const w=1-smooth(d/blend),p=w/(1-w+1e-6);if(w>top)top=w;sum+=p;mix+=p*padLevel(i);}
  if(sum>0)h+=(mix/sum-h)*top;
  return Math.max(0,Math.min(h,cap*d0));};
 // Ribbons last: a carriageway is level across whatever stands beside it, at the ground's own height on its centre line (so it
 // arrives at a plaza's level where it ends on one). Inside a pad the pad wins. Keep building pads clear of half + blend.
 const raw=(x:number,z:number)=>{
  let h=padded(x,z);if(inPad||!ribbons.length)return h;const d0=depth(x,z);if(d0<=0)return 0;
  for(const r of ribbons){const q=pathNearest(r.path,x,z);if(q.d<r.half+r.blend)h+=(padded(q.x,q.z)-h)*(1-smooth((q.d-r.half)/r.blend));}
  return Math.max(0,Math.min(h,cap*d0));};
 type Grid={x0:number;z0:number;nx:number;nz:number;h:Float32Array;peak:number};let grid:Grid|null=null;
 const build=():Grid=>{const x0=Math.floor(box.minX)-step,z0=Math.floor(box.minZ)-step,nx=Math.ceil((box.maxX-x0)/step)+2,nz=Math.ceil((box.maxZ-z0)/step)+2,h=new Float32Array(nx*nz);let peak=0;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const v=raw(x0+i*step,z0+j*step);h[j*nx+i]=v;if(v>peak)peak=v;}return {x0,z0,nx,nz,h,peak};};
 const ground=(x:number,z:number)=>{
  if(!enabled||x<box.minX||x>box.maxX||z<box.minZ||z>box.maxZ)return 0;
  const g=grid??=build(),fx=(x-g.x0)/step,fz=(z-g.z0)/step,i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=g.nx-1||j>=g.nz-1)return 0;
  const tx=fx-i,tz=fz-j,o=j*g.nx+i,a=g.h[o],b=g.h[o+1],c=g.h[o+g.nx],d=g.h[o+g.nx+1];return (a+(b-a)*tx)*(1-tz)+(c+(d-c)*tx)*tz;};
 return {id:spec.id,spec,ground,slope:(x,z)=>Math.hypot(ground(x+1,z)-ground(x-1,z),ground(x,z+1)-ground(x,z-1))/2,peak:()=>enabled?(grid??=build()).peak:0,padLevel};
}

const regions:Region[]=[];
export function registerRegion(r:Region){if(!regions.some(q=>q.id===r.id))regions.push(r);return r;}
export const elevationRegions=():readonly Region[]=>regions;
/** Height of the raised ground at (x, z) above the old flat datum, over every region. 0 with the flag off. */
export function groundLift(x:number,z:number){if(!enabled)return 0;let h=0;for(let i=0;i<regions.length;i++)h+=regions[i].ground(x,z);return h;}
export const groundSlope=(x:number,z:number)=>Math.hypot(groundLift(x+1,z)-groundLift(x-1,z),groundLift(x,z+1)-groundLift(x,z-1))/2;
/** A placed record ({x, z, y}: a vending machine, a hidden ball, a gashapon) standing on the raised ground: y plus the lift at
 *  its spot (and a `wall` target's y with it). The same object back where the ground is not raised. Use at the data's definition. */
export function onGround<S extends {x:number;z:number;y:number;wall?:{y:number}}>(o:S):S{const g=groundLift(o.x,o.z);return g?{...o,y:o.y+g,...(o.wall?{wall:{...o.wall,y:o.wall.y+g}}:{})}:o;}

// ---- Build-time placement (world.ts `put` / `sign`). While `active`, every piece a builder places is lifted to the ground at
// its own spot, or to `anchor` (ONE height for a whole prop: a palm, a house, a table: wrap its builder in anchored()).
// `pieces` records what was built so the flat layers can be draped afterwards (elevationDrape.ts drapePieces).
export const elevBuild:{active:boolean;anchor:number|null;pieces:{mesh:unknown;lift:number;anchored:boolean}[]}={active:false,anchor:null,pieces:[]};
export const buildLift=(x:number,z:number)=>elevBuild.active?elevBuild.anchor??groundLift(x,z):0;
export function anchored<R>(x:number,z:number,build:()=>R):R{if(!elevBuild.active||elevBuild.anchor!==null)return build();elevBuild.anchor=groundLift(x,z);try{return build();}finally{elevBuild.anchor=null;}}
/** Pieces that carry their own heights (a terrain mesh, a shore ring): built with no lift. */
export function unlifted<R>(build:()=>R):R{if(!elevBuild.active)return build();const was=elevBuild.anchor;elevBuild.anchor=0;try{return build();}finally{elevBuild.anchor=was;}}
