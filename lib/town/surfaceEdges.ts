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
import {buildOutline,knotsOf,rowPoint,DRAWN,type Rect,type Pt} from './townDepth';
import {regionLift} from './elevation';

export const SURF_DEFAULT=false;
const query=(()=>{try{return typeof window!=='undefined'&&window.location&&typeof window.location.search==='string'?window.location.search:null;}catch{return null;}})();
let enabled=query===null?SURF_DEFAULT:/[?&]surf=1(&|$)/.test(query)||(SURF_DEFAULT&&!/[?&]surf=0(&|$)/.test(query));
/** Tests call this; the browser reads the URL once. */
export function setSurfaces(on:boolean){enabled=on;}
export const surfOn=()=>enabled;

/** The band (m) and how the shader breaks it (groundTint.ts reads these; tests/surface-edges.cjs keeps both in step). */
export const EDGE={inset:.5,minWidth:1.1,maxWidth:2,step:3,lowStep:6,rise:.02,
 /** shader: noise weights (tile A blotches, R clumps), the grass / bare threshold, the damp lip and the soil shadow */
 noise:.9,clump:.85,from:.38,to:.62,damp:.16,soil:.12,soilTo:.95} as const;
export const LIP={over:.2,overVar:.28,rise:.02,reach:.8,step:3,lowStep:6} as const;
const hash=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const insidePoly=(poly:readonly Pt[],x:number,z:number)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};

export type SurfaceInput={/** flat paths laid on the lawn (world.ts path()) */paths:Rect[];/** true where no lawn shows (road, pavement, building, court, pitch, patio) */blocked:(x:number,z:number)=>boolean};
let input:SurfaceInput|null=null;
/** world.ts registers the paths once they are final. No-op with the flag off. */
export function setSurfaceInput(i:SurfaceInput|null){input=enabled?i:null;}
export const surfaceStats:{value:Record<string,number>|null}={value:null};

/** Geometry relative to the lawn mesh (y = metres above the lawn's plane), with the edge attribute (2 per vertex). */
export type EdgePatch={position:number[];index:number[];edge:number[]};
const quadRows=(out:EdgePatch,base:number,rows:number,up:boolean)=>{for(let r=0;r<rows-1;r++){const i=base+r*2,k=i+1,m=i+2,n=i+3;if(up)out.index.push(i,k,m,k,n,m);else out.index.push(i,m,k,k,m,n);}};
const facesUp=(p:number[],b:number)=>{const A=b*3;return (p[A+5]-p[A+2])*(p[A+6]-p[A])-(p[A+3]-p[A])*(p[A+8]-p[A+2])>0;};

/** The soft rim round a lawn polygon (outward of it; `under` = what lies beyond: 0 sand, 1 paving). Returns the triangles added. */
export function lawnFringe(poly:readonly Pt[],out:EdgePatch,low=false,under=0,lifted:(x:number,z:number)=>boolean=()=>false){
 const n=poly.length,step=low?EDGE.lowStep:EDGE.step,pts:Pt[]=[],at:number[]=[];let area=0,s=0;
 for(let i=0;i<n;i++){const a=poly[i],b=poly[(i+1)%n];area+=a.x*b.z-b.x*a.z;const len=Math.hypot(b.x-a.x,b.z-a.z),k=Math.max(1,Math.ceil(len/step));for(let j=0;j<k;j++){pts.push({x:a.x+(b.x-a.x)*j/k,z:a.z+(b.z-a.z)*j/k});at.push(s+len*j/k);}s+=len;}
 const m=pts.length,sign=area>0?1:-1;let nx=new Float64Array(m),nz=new Float64Array(m);
 for(let i=0;i<m;i++){const a=pts[(i+m-1)%m],b=pts[(i+1)%m],tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1;nx[i]=sign*tz/l;nz[i]=-sign*tx/l;}
 // smoothed normals: the rim sweeps round every polygon corner instead of repeating it
 for(let pass=0;pass<3;pass++){const ax=new Float64Array(m),az=new Float64Array(m);for(let i=0;i<m;i++){const p=(i+m-1)%m,q=(i+1)%m,x=nx[p]+2*nx[i]+nx[q],z=nz[p]+2*nz[i]+nz[q],l=Math.hypot(x,z)||1;ax[i]=x/l;az[i]=z/l;}nx=ax;nz=az;}
 // the band's width wanders (a smooth value noise of the distance along the edge, 11 m apart)
 const width=(d:number)=>{const f=d/11,k=Math.floor(f),t=f-k,e=t*t*(3-2*t);return EDGE.minWidth+(EDGE.maxWidth-EDGE.minWidth)*(hash(k*1.7+under*5)*(1-e)+hash((k+1)*1.7+under*5)*e);};
 const es=low?[0,.5,1]:[0,.35,.7,1],start=out.index.length;
 for(let i=0;i<m;i++){const j=(i+1)%m,a=pts[i],b=pts[j];if(lifted((a.x+b.x)/2,(a.z+b.z)/2))continue;const base=out.position.length/3;
  for(const e of es)for(const k of [i,j]){const p=pts[k],u=-EDGE.inset+e*(width(at[k])+EDGE.inset);out.position.push(p.x+nx[k]*u,e?EDGE.rise:.012,p.z+nz[k]*u);out.edge.push(e,under);}
  quadRows(out,base,es.length,facesUp(out.position,base));}
 return (out.index.length-start)/3;
}
/** The lawn's lip along every path outline with open lawn beside it. Returns the triangles added. */
export function pathLips(out:EdgePatch,low=false){const s=input;if(!s||!s.paths.length)return 0;
 const o=buildOutline(s.paths),top=DRAWN.path-DRAWN.lawn,start=out.index.length;
 const lawn=(x:number,z:number)=>insidePoly(INTERIOR_GRASS,x,z)&&!s.blocked(x,z)&&!o.inside(x,z)&&regionLift(x,z)<.004;
 for(const seg of o.segs){const {len,knots}=knotsOf(seg,low?LIP.lowStep:LIP.step);if(len<.6)continue;
  const over=(e:number)=>{const [x,z]=rowPoint(seg,len,knots[e],0,false,false);return LIP.over+LIP.overVar*hash(Math.round((seg.nx?z:x)*2)*1.37+seg.ax*.7+seg.az);};
  const rows=(e:number):[number,number,number][]=>low?[[-over(e),top+.008,1],[.12,top+.012,0],[LIP.reach,0,0]]:[[-over(e),top+.008,1],[-.06,top+LIP.rise,.5],[.14,top+.012,0],[LIP.reach,0,0]];
  for(let j=0;j<knots.length-1;j++){const mid=(knots[j]+knots[j+1])/2;let open=true;
   for(const u of [.3,LIP.reach]){const [x,z]=rowPoint(seg,len,mid,u,false,false);if(!lawn(x,z)){open=false;break;}}
   if(!open)continue;const base=out.position.length/3,ra=rows(j),rb=rows(j+1);
   for(let r=0;r<ra.length;r++)for(const e of [j,j+1]){const row=(e===j?ra:rb)[r],[x,z]=rowPoint(seg,len,knots[e],row[0],e===0,e===knots.length-1);out.position.push(x,row[1],z);out.edge.push(row[2],1);}
   quadRows(out,base,ra.length,facesUp(out.position,base));}}
 return (out.index.length-start)/3;
}
/** Everything the main island's lawn gains (fields.ts joins it to the lawn mesh). null with the flag off. */
export function mainLawnEdges(low=false){if(!enabled)return null;const out:EdgePatch={position:[],index:[],edge:[]};
 const fringe=lawnFringe(INTERIOR_GRASS,out,low,0,(x,z)=>regionLift(x,z)>.004),lips=pathLips(out,low);
 surfaceStats.value={...(surfaceStats.value??{}),fringe,lips,low:low?1:0};return {...out,fringe,lips,triangles:out.index.length/3};}
