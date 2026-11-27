// Surface craft, layer 3 (Nov 26 2026): GRASS EDGES and PATH VERGES. Pure data, no three.js.
// Owner: "add grass along with paths after that" (after the kerb depth); the process is the sand / water one: fix the transition,
// not the style. Where the lawn meets sand, a path or the town's paving there was a ruler-straight polygon edge with visible corners.
//
// What it is: a few thousand triangles joined to the island lawn's ONE mesh (fields.ts, 0 draws) that carry a per-vertex edge
// value (`aEdge`: x = 0 lawn .. 1 the bare rim, y = what lies beyond: 0 sand, 1 paving). The lawn's own program (groundTint.ts,
// `grass` kind, compiled with the edge branch only when this flag is on) breaks the grass up across that band with the detail
// tile's blotch + clump channels: scattered tufts thinning onto the sand, a darker damp lip, a soil shadow under the sward, and at
// the rim EXACTLY the neighbour's own colour maths, so there is no step where the band ends.
//  - lawnFringe: the island lawn's outline, resampled every 3 m with smoothed normals (no corner), 1.1 to 2 m wide (wandering);
//  - pathLips: along every path's outline where open lawn lies beside it: the lawn swells 2 cm over the path's edge (the path
//    reads as worn into the grass, the lawn as thick) and creeps 20 to 48 cm onto it, irregularly;
//  - the kerb depth's verge (townDepth.ts depthLawn `soft`): the same treatment where lawn meets the town's pavements.
// Nothing here is walked on: the walked height is unchanged (the lawn has thickness; feet stand in it).
//
// Dev flag `?surf=1` (default OFF: nothing is built, the lawn program's source is byte-identical). To ship: SURF_DEFAULT = true.
import {INTERIOR_GRASS} from './shoreline';
import {buildOutline,knotsOf,rowPoint,DRAWN,type Rect,type Pt,type Outline} from './townDepth';
import {CAY_LAWN} from './coralCay';
import {regionLift} from './elevation';

export const SURF_DEFAULT=true;// shipped ON (owner approval, Nov 26 2026); `?surf=0` switches it off
const query=(()=>{try{return typeof window!=='undefined'&&window.location&&typeof window.location.search==='string'?window.location.search:null;}catch{return null;}})();
let enabled=query===null?SURF_DEFAULT:/[?&]surf=1(&|$)/.test(query)||(SURF_DEFAULT&&!/[?&]surf=0(&|$)/.test(query));
/** Tests call this; the browser reads the URL once. */
export function setSurfaces(on:boolean){enabled=on;}
export const surfOn=()=>enabled;

/** The band (m) and how the shader breaks it (groundTint.ts reads these; tests/surface-edges.cjs keeps both in step). */
export const EDGE={inset:.5,minWidth:1.1,maxWidth:2,step:4,lowStep:8,rise:.02,
 /** shader: noise weights (tile A blotches, R clumps), the grass / bare threshold, the damp lip and the soil shadow */
 noise:.9,clump:.85,from:.38,to:.62,damp:.16,soil:.12,soilTo:.95,
 /** against PAVING (a path, the town's pavement; Nov 28 2026 review): a true soft blend across the whole band (grass fades into the
  *  paving's colour through a dusty band), the broken threshold kept only as fine detail: the tile's 20 cm clumps stay, its broad blotches (the torn-paper wobble) drop to `paveNoise`. */
 paveFrom:.15,paveTo:.85,paveNoise:.25} as const;
/** `over`..`over+overVar`: how far the grass creeps onto the path; `thin`: how far back from the path's edge the lawn starts to thin
 *  (a worn verge 0.5 to 0.8 m wide in all. Nov 27 2026: tried 0.8 to 1.3 m: the mean profile did not get smoother, since the tile's
 *  blotches only move the threshold by about 0.2 m, and the edge read as torn paper at night; kept tight). */
export const LIP={over:.2,overVar:.3,thin:.3,rise:.02,reach:1,step:4,lowStep:8} as const;
/** Path wear (the lawn's edge program draws it, on a thin sheet over every walkway laid on a lawn): `edge` m of darker, dustier ground
 *  beside the grass, the trodden middle lighter from `centre` m in; `gain` = the brightness swing per unit (shader). Paths wider than
 *  `max` are squares, not walkways: no wear. On raised ground the sheet follows the draped path (`liftStep` cells, `lift` m proud),
 *  and the uphill verge is a cut bank: bare soil reaching `cut`-deep into the grass, the lawn standing `bank` m over the path. */
export const WEAR={edge:.9,centre:2.1,max:7,step:5,liftStep:1.25,lift:.014,gain:.14,light:.5,taper:1.5,cutFrom:.05,cutSpan:.15,bank:.05} as const;
/** aEdge.y for a path vertex: 4 + wear (-2 the cut bank's soil .. -1 the dusty edge .. 0 plain paving .. `light` the trodden middle: the paving is pale already, so it darkens further than it lightens). Plain rims keep 0 (sand) / 1 (paving). */
export const WEAR_BASE=4;
/** The tone across a walkway, from its outline (d = 0) to `centre` m in: one smooth curve (owner, Nov 26 2026: "faded in some areas but
 *  there's clearly still a line"). It was two straight ramps meeting at `edge` m, and the sheet's lattice had a row there: the slope
 *  changed at one straight row the length of every path, which the eye reads as a ruled line (a Mach band) inside the soft edge.
 *  Now C1 (no slope step anywhere) and sampled on WEAR_ROWS so the per-vertex interpolation stays close to the curve. */
export const wearOf=(d:number)=>{const t=Math.min(1,Math.max(0,d/WEAR.centre)),s=t*t*(3-2*t);return -1+(1+WEAR.light)*s;};
/** Rows of the wear lattice, metres in from each long edge (and from each end). */
/** paths-junctions (owner shot 173, Nov 27 2026: "a faint hard seam line inside the path ~1/4 in from each edge"): with 4 rows the
 *  tone was piecewise linear with its last kink where the trodden middle went flat (1.4 m in), a ruled Mach band along every path. The
 *  curve now rises over 2.1 m (most walkways are 4-5 m: the middle is the only flat part) and is sampled on 8 rows, so the kinks are
 *  under 2 % of the swing. */
export const WEAR_ROWS=[.15,.32,.52,.75,1,1.28,1.62,2.1] as const;
/** A lawn and how its edges are built: `ground` = the drawn lawn's height over its flat plane (a raised lawn: the edges are laid on
 *  it), or null = flat lawn only (raised ground is skipped). */
export type Zone={poly:readonly Pt[];ground:((x:number,z:number)=>number)|null;/** only where this holds (the main island's raised west side: its own pass) */only?:(x:number,z:number)=>boolean};
const MAIN_ZONE:Zone={poly:INTERIOR_GRASS,ground:null};
const hash=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const insidePoly=(poly:readonly Pt[],x:number,z:number)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};

export type SurfaceInput={/** flat paths laid on the lawn (world.ts path()) */paths:Rect[];/** paving that is not a path and lies over a path's end (the Coral Cay roundabout's pavement): no wear sheet under it (it sat 1-1.5 cm under that pavement: tests/roundabout-junctions.cjs wants 4 cm) */paved?:(x:number,z:number)=>boolean;/** true where no lawn shows (road, pavement, building, court, pitch, patio) */blocked:(x:number,z:number)=>boolean};
let input:SurfaceInput|null=null;
/** world.ts registers the paths once they are final. No-op with the flag off. */
export function setSurfaceInput(i:SurfaceInput|null){input=enabled?i:null;}
export const surfaceStats:{value:Record<string,number>|null}={value:null};

/** Geometry relative to the lawn mesh (y = metres above the lawn's plane), with the edge attribute (2 per vertex). */
export type EdgePatch={position:number[];index:number[];edge:number[]};
const quadRows=(out:EdgePatch,base:number,rows:number,up:boolean)=>{for(let r=0;r<rows-1;r++){const i=base+r*2,k=i+1,m=i+2,n=i+3;if(up)out.index.push(i,k,m,k,n,m);else out.index.push(i,m,k,k,m,n);}};
const facesUp=(p:number[],b:number)=>{const A=b*3;return (p[A+5]-p[A+2])*(p[A+6]-p[A])-(p[A+3]-p[A])*(p[A+8]-p[A+2])>0;};

/** The soft rim round a lawn polygon (outward of it; `under` = what lies beyond: 0 sand, 1 paving). Returns the triangles added. */
export function lawnFringe(poly:readonly Pt[],out:EdgePatch,low=false,under=0,lifted:(x:number,z:number)=>boolean=()=>false,outerY:number=EDGE.rise){
 const n=poly.length,step=low?EDGE.lowStep:EDGE.step,pts:Pt[]=[],at:number[]=[];let area=0,s=0;
 for(let i=0;i<n;i++){const a=poly[i],b=poly[(i+1)%n];area+=a.x*b.z-b.x*a.z;const len=Math.hypot(b.x-a.x,b.z-a.z),k=Math.max(1,Math.ceil(len/step));for(let j=0;j<k;j++){pts.push({x:a.x+(b.x-a.x)*j/k,z:a.z+(b.z-a.z)*j/k});at.push(s+len*j/k);}s+=len;}
 const m=pts.length,sign=area>0?1:-1;let nx=new Float64Array(m),nz=new Float64Array(m);
 for(let i=0;i<m;i++){const a=pts[(i+m-1)%m],b=pts[(i+1)%m],tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1;nx[i]=sign*tz/l;nz[i]=-sign*tx/l;}
 // smoothed normals: the rim sweeps round every polygon corner instead of repeating it
 for(let pass=0;pass<3;pass++){const ax=new Float64Array(m),az=new Float64Array(m);for(let i=0;i<m;i++){const p=(i+m-1)%m,q=(i+1)%m,x=nx[p]+2*nx[i]+nx[q],z=nz[p]+2*nz[i]+nz[q],l=Math.hypot(x,z)||1;ax[i]=x/l;az[i]=z/l;}nx=ax;nz=az;}
 // the band's width wanders (a smooth value noise of the distance along the edge, 11 m apart)
 const width=(d:number)=>{const f=d/11,k=Math.floor(f),t=f-k,e=t*t*(3-2*t);return EDGE.minWidth+(EDGE.maxWidth-EDGE.minWidth)*(hash(k*1.7+under*5)*(1-e)+hash((k+1)*1.7+under*5)*e);};
 // a neighbour that lies ABOVE the lawn (Coral Cay's sand ring, outerY > rise): one more row just inside the outline, already at
 // the neighbour's height, so the rim never dips under it
 const high=outerY>EDGE.rise+1e-6,start=out.index.length;
 for(let i=0;i<m;i++){const j=(i+1)%m,a=pts[i],b=pts[j];if(lifted((a.x+b.x)/2,(a.z+b.z)/2))continue;const base=out.position.length/3;
  const es=(k:number)=>high?[0,(EDGE.inset-.04)/(width(at[k])+EDGE.inset),.55,1]:[0,.5,1];
  for(let r=0;r<(high?4:3);r++)for(const k of [i,j]){const e=es(k)[r],p=pts[k],u=-EDGE.inset+e*(width(at[k])+EDGE.inset);out.position.push(p.x+nx[k]*u,e?outerY:.012,p.z+nz[k]*u);out.edge.push(e,under);}
  quadRows(out,base,high?4:3,facesUp(out.position,base));}
 return (out.index.length-start)/3;
}
const outlines=new WeakMap<SurfaceInput,Outline>();
const outlineOf=(s:SurfaceInput)=>{let o=outlines.get(s);if(!o){o=buildOutline(s.paths);outlines.set(s,o);}return o;};
/** How much wear a point of paving shows (0..1): none off the walkways, inside a square, or on the simpler (lowest tier) edge; fading
 *  out over `taper` m where a walkway runs into a square. */
const wornAt=(s:SurfaceInput,x:number,z:number,low:boolean)=>{if(low)return 0;let walk=false,k=1;
 for(let i=0;i<s.paths.length;i++){const r=s.paths[i],dx=Math.abs(x-r.x)-r.w/2,dz=Math.abs(z-r.z)-r.d/2,wide=Math.min(r.w,r.d)>WEAR.max;
  if(dx<=1e-3&&dz<=1e-3){if(wide)return 0;walk=true;}else if(wide){const d=Math.hypot(Math.max(0,dx),Math.max(0,dz))/WEAR.taper;if(d<k)k=d;}}
 return walk?k:0;};
/** The lawn's lip along every path outline with open lawn beside it. Returns the triangles added. */
export function pathLips(out:EdgePatch,low=false,zone:Zone=MAIN_ZONE){const s=input;if(!s||!s.paths.length)return 0;const G=zone.ground;if(G&&low)return 0;
 const o=outlineOf(s),top=DRAWN.path-DRAWN.lawn,start=out.index.length,g=(x:number,z:number)=>G?G(x,z):0,proud=G?WEAR.lift:0;
 const lawn=(x:number,z:number)=>insidePoly(zone.poly,x,z)&&!s.blocked(x,z)&&!o.inside(x,z)&&(G!==null||regionLift(x,z)<.004)&&(!zone.only||zone.only(x,z));
 for(const seg of o.segs){const {len,knots}=knotsOf(seg,G?WEAR.liftStep:low?LIP.lowStep:LIP.step);if(len<.6)continue;
  if(!insidePoly(zone.poly,(seg.ax+seg.bx)/2,(seg.az+seg.bz)/2)&&!insidePoly(zone.poly,seg.ax,seg.az)&&!insidePoly(zone.poly,seg.bx,seg.bz))continue;
  const over=(e:number)=>{const [x,z]=rowPoint(seg,len,knots[e],0,false,false);return LIP.over+LIP.overVar*hash(Math.round((seg.nx?z:x)*2)*1.37+seg.ax*.7+seg.az);};
  // rows: [metres out from the path's edge, height over the lawn, edge value, wear]. On a slope the uphill verge is a cut bank.
  const rows=(e:number):[number,number,number,number][]=>{const ov=over(e),[x0,z0]=rowPoint(seg,len,knots[e],0,false,false),[x1,z1]=rowPoint(seg,len,knots[e],LIP.reach,false,false),[xi,zi]=rowPoint(seg,len,knots[e],-ov,false,false);
   const cut=G?Math.max(0,Math.min(1,(g(x1,z1)-g(x0,z0)-WEAR.cutFrom)/WEAR.cutSpan)):0,k=wornAt(s,xi,zi,low);
   return [[-ov,top+.016+proud,1,wearOf(ov)*k-cut],[LIP.thin,top+.03+proud+WEAR.bank*cut,.5*cut,-k-cut],[LIP.reach,0,0,-k-cut]];};
  for(let j=0;j<knots.length-1;j++){const mid=(knots[j]+knots[j+1])/2;let open=true;
   for(const u of [.3,LIP.thin+.1,LIP.reach]){const [x,z]=rowPoint(seg,len,mid,u,false,false);if(!lawn(x,z)){open=false;break;}}
   if(open&&s.paved)for(const e of [j,j+1])for(const u of [-LIP.over-LIP.overVar,0,LIP.thin,LIP.reach]){const [x,z]=rowPoint(seg,len,knots[e],u,false,false);if(s.paved(x,z))open=false;}/* no lip corner on that paving either */
   if(!open)continue;const base=out.position.length/3,ra=rows(j),rb=rows(j+1);
   for(let r=0;r<ra.length;r++)for(const e of [j,j+1]){const row=(e===j?ra:rb)[r],[x,z]=rowPoint(seg,len,knots[e],row[0],e===0,e===knots.length-1);out.position.push(x,row[1]+g(x,z),z);out.edge.push(row[2],WEAR_BASE+row[3]);}
   quadRows(out,base,ra.length,facesUp(out.position,base));}}
 return (out.index.length-start)/3;
}
/** Path wear: a thin sheet over every walkway on this lawn, drawn by the lawn's edge program as PAVING (edge value 1) whose tone
 *  follows the distance to the walkways' joined outline: dusty and darker beside the grass, lighter where feet fall, straight
 *  through junctions (one outline for all of them). One lattice per walkway, cut at every walkway it meets and never laid twice.
 *  Not built on the simpler (lowest tier) edge. Returns the triangles added. */
export function pathWear(out:EdgePatch,low=false,zone:Zone=MAIN_ZONE){const s=input;if(!s||low||!s.paths.length)return 0;
 const o=outlineOf(s),G=zone.ground,y0=DRAWN.path-DRAWN.lawn+.008+(G?WEAR.lift:0),start=out.index.length,R=s.paths,E=WEAR.edge;
 const open=(x:number,z:number)=>insidePoly(zone.poly,x,z)&&(G!==null||regionLift(x,z)<.004)&&(!zone.only||zone.only(x,z));
 const within=(r:Rect,x:number,z:number,m=0)=>Math.abs(x-r.x)<r.w/2+m&&Math.abs(z-r.z)<r.d/2+m;
 for(let i=0;i<R.length;i++){const r=R[i];if(Math.min(r.w,r.d)>WEAR.max)continue;
  if(![[0,0],[-1,-1],[1,-1],[-1,1],[1,1]].some(([a,b])=>insidePoly(zone.poly,r.x+a*r.w/2,r.z+b*r.d/2)))continue;
  const alongX=r.w>=r.d,L=alongX?r.w:r.d,W=alongX?r.d:r.w,us=new Set<number>(),vs=new Set<number>(),q=(v:number)=>Math.round(v*1000)/1000;
  const addU=(u:number)=>{if(u>-L/2+.02&&u<L/2-.02)us.add(q(u));},addV=(v:number)=>{if(v>-W/2+.02&&v<W/2-.02)vs.add(q(v));};
  us.add(-L/2);us.add(L/2);vs.add(-W/2);vs.add(W/2);addV(0);for(const d of WEAR_ROWS){addV(-W/2+d);addV(W/2-d);addU(-L/2+d);addU(L/2-d);}
  const step=G?WEAR.liftStep:WEAR.step,n=Math.max(1,Math.round(L/step));for(let k=1;k<n;k++)addU(-L/2+L*k/n);
  const paved=s.paved,pavedAt=(u:number,v:number)=>alongX?paved!(r.x+u,r.z+v):paved!(r.x+v,r.z+u);let clip=false;
  if(paved)for(const v of [-W/2,0,W/2]){let was=pavedAt(-L/2,v);clip=clip||was;for(let u=-L/2+.1;u<=L/2+1e-6;u+=.1){const now=pavedAt(u,v);if(now!==was){addU(now?u-.1:u);was=now;clip=true;}}}/* a row of cells ends where that paving begins */
  for(let j=0;j<R.length;j++){if(j===i)continue;const t=R[j];if(Math.abs(t.x-r.x)>(t.w+r.w)/2+E||Math.abs(t.z-r.z)>(t.d+r.d)/2+E)continue;
   const du=(alongX?t.x-r.x:t.z-r.z),hu=(alongX?t.w:t.d)/2,dv=(alongX?t.z-r.z:t.x-r.x),hv=(alongX?t.d:t.w)/2;for(const e of [-E,0,E]){addU(du-hu+e);addU(du+hu+e);}addV(dv-hv);addV(dv+hv);}
  const U=[...us].sort((a,b)=>a-b),V=[...vs].sort((a,b)=>a-b),base=out.position.length/3,at=(u:number,v:number)=>alongX?[r.x+u,r.z+v] as const:[r.x+v,r.z+u] as const;
  for(const u of U)for(const v of V){const [x,z]=at(u,v);out.position.push(x,y0+(G?G(x,z):0),z);out.edge.push(1,WEAR_BASE+(open(x,z)?wearOf(o.dist(x,z))*wornAt(s,x,z,false):0));}
  let up:boolean|null=null;
  for(let a=0;a<U.length-1;a++)for(let b=0;b<V.length-1;b++){const [cx,cz]=at((U[a]+U[a+1])/2,(V[b]+V[b+1])/2);if(!open(cx,cz))continue;
   if(clip&&(paved!(cx,cz)||pavedAt(U[a],V[b])||pavedAt(U[a+1],V[b])||pavedAt(U[a],V[b+1])||pavedAt(U[a+1],V[b+1])))continue;
   let taken=false;for(let j=0;j<R.length&&!taken;j++){if(j===i)continue;const t=R[j],wide=Math.min(t.w,t.d)>WEAR.max;if((wide||j<i)&&within(t,cx,cz))taken=true;}if(taken)continue;
   const p=base+a*V.length+b,k=p+1,m=p+V.length,nn=m+1;
   if(up===null){const P=out.position,ny=(P[k*3+2]-P[p*3+2])*(P[m*3]-P[p*3])-(P[k*3]-P[p*3])*(P[m*3+2]-P[p*3+2]);up=ny>0;}
   if(up)out.index.push(p,k,m,k,nn,m);else out.index.push(p,m,k,k,m,nn);}}
 return (out.index.length-start)/3;
}
/** Everything the main island's lawn gains (fields.ts joins it to the lawn mesh). null with the flag off. */
/** The coast's torn fringe is left out only where the raised west side really stands up at the lawn's edge. Leftovers A (owner shot
 *  142, Nov 26 night): at > 0.4 cm the 2 m lift lattice's 1 cm bleed past the coast cut the fringe from 12 coast segments (-238,-187,
 *  -223,-188, -179..-138,-189, -315,-22..-55, -291,-174 ...): hard straight lawn edges on the beach. */
export const FRINGE_LIFT=.05;
export function mainLawnEdges(low=false){if(!enabled)return null;const out:EdgePatch={position:[],index:[],edge:[]};
 const fringe=lawnFringe(INTERIOR_GRASS,out,low,0,(x,z)=>regionLift(x,z)>FRINGE_LIFT),lips=pathLips(out,low),wear=pathWear(out,low);
 // Review (Nov 28 2026): the raised west side (?elev=1) gets the same lips and wear, laid on its ground (as on Coral Cay); not on the simpler edge.
 const wide=(input?.paths??[]).filter(r=>Math.min(r.w,r.d)>WEAR.max),square=(x:number,z:number)=>wide.some(r=>Math.abs(x-r.x)<r.w/2+1.6&&Math.abs(z-r.z)<r.d/2+1.6);// a raised square (the stadium plaza) keeps a crisp edge: its border course (groundTint PLAZA_CREST), no grass lip under its garden walls
 const west:Zone={poly:INTERIOR_GRASS,ground:regionLift,only:(x,z)=>regionLift(x,z)>=.004&&!square(x,z)},at=out.position.length,westLips=low?0:pathLips(out,low,west),westWear=low?0:pathWear(out,low,west);
 surfaceStats.value={...(surfaceStats.value??{}),fringe,lips,wear,westLips,westWear,westAt:westLips+westWear?[out.position[at],out.position[at+2]]as unknown as number:0,low:low?1:0};return {...out,fringe,lips,wear,triangles:out.index.length/3};}
/** Coral Cay's lawn (world.ts joins it to `coral-cay-lawn` after the drape): the rim onto the sand ring, which lies `sandTop` m over
 *  the lawn's plane, the lips and the wear along its paths; laid on `ground` when the cay is raised (?elev=1). `skip`: where the
 *  lawn's outline is not sand (the boulevard, the roundabout, the railway). null with the flag off. */
export function cayLawnEdges(low:boolean,ground:((x:number,z:number)=>number)|null,skip:(x:number,z:number)=>boolean,sandTop:number){if(!enabled)return null;
 const out:EdgePatch={position:[],index:[],edge:[]},zone:Zone={poly:CAY_LAWN,ground};
 const fringe=lawnFringe(CAY_LAWN,out,low,0,skip,sandTop+EDGE.rise),lips=pathLips(out,low,zone),wear=pathWear(out,low,zone);
 surfaceStats.value={...(surfaceStats.value??{}),cayFringe:fringe,cayLips:lips,cayWear:wear};return {...out,fringe,lips,wear,triangles:out.index.length/3};}
