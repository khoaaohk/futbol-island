// Landable canopies (Oct 14 2026, user: "allow landing on the patio roof. right now it's going through it", then "apply that
// throughout all other buildings"). A building is a solid block whose roof is its height (rooftopTravel.ts), and props standing on
// a roof are landable at their tops (world.ts roofObstacles), but a canopy over open ground (the Coral Cay Hostel's verandah roof,
// shop awnings, market and bus-stop canopies, kiosk roofs, balconies) was only a picture: a jetpack or parachute landing aimed at it
// went straight through to the porch or the pavement below.
//
// Built once, with the town (world.ts, in the pass that already measures every mesh for the roof props): every flat-topped mesh you
// can see from above becomes an overhead surface (`overhead: true`), which rooftopTravel counts only from above (a rider at or above
// it, or landing from the sky), so the porch, the pavement and the market under it stay walkable for players, NPCs and balls.
//  - What counts: boxes, upright cylinders, extrusions and custom (merged) meshes whose top faces face up (within 18°), at least
//    CANOPY_MIN_SIDE m across both ways and CANOPY_MIN_AREA m², whose top is CANOPY_MIN_LIFT m or more above the ground.
//  - What does not (documented exclusions): anything smaller (signs, lamps, rails, posts, boards: under 1 m wide or 1.5 m²), lower
//    (benches, tables, walls: you walk round those), rounded or pointed (tree and palm crowns, umbrellas, cones on huts: a landing
//    there is moved to the nearest landable spot, as before), animated or excluded meshes (userData.skipRoofObstacle, the ferry),
//    anything on or inside a building (its roof covers it; roof props are world.ts roofObstacles), and any part with something else
//    above it.
//  - Shape: sampled on a grid (CANOPY_CELL m, a little coarser on big pieces; a sampled piece over CANOPY_MAX_SAMPLED_AREA m² is a
//    merged batch, Summit Isle's baked props, and is skipped), so a turned box, a round roof or a sloped panel is covered
//    where it really is; a gently sloped panel (the verandah's tin roof, under 18°) becomes level strips a few cm apart, walkable
//    like a gentle stair. Runs of equal height merge into rectangles: a plain awning is one surface.
//  - Pitched roofs over open ground (a pavilion's pyramid, a kiosk's or a hut's cone, a steep panel): the main island's houses stand
//    their pitched roofs on solid buildings (landable at the top, world.ts roofObstacles); over open ground the rider slides off
//    instead: those faces (`steep: true`) refuse a landing from the sky, which is moved to the nearest landable spot beside them.
//    Walking under them is untouched. Roof-like cones only (no taller than 1.3 × their radius): a pine's cone is foliage; and only
//    pieces of their own (cones, boxes, extrusions): a merged mesh (Summit Isle's baked props) gives its level faces only.
// Heat: data only, made once at load (axis-aligned boxes need no ray at all; others a few dozen rays each); nothing per frame.
import * as T from 'three';
import {fieldSurfaceHeight} from './venues';

export type Canopy={x:number;z:number;w:number;d:number;height:number;overhead:true;steep?:true};
export const CANOPY_MIN_SIDE=1,CANOPY_MIN_AREA=1.5,CANOPY_MIN_LIFT=1.6,CANOPY_CELL=.5,CANOPY_MAX_CELLS=600;
/** Pieces sampled by rays (not a plain level box) bigger than this (m²) are whole merged batches or terrain, never one canopy. */
export const CANOPY_MAX_SAMPLED_AREA=300;
/** Faces this close to level (cos 18°) are floors; steeper ones, up to CANOPY_STEEP_UP (cos 78°), are pitched roofs to slide off. */
export const CANOPY_FLAT_UP=.95,CANOPY_STEEP_UP=.2;
/** Rounded or flat-sheet geometry never makes a canopy (tree and palm crowns, signs' planes, cables, rings). */
const NOT_ROOF=/Sphere|Icosahedron|Dodecahedron|Octahedron|Tetrahedron|Torus|Tube|Plane|Circle|Ring|Capsule|Lathe/;
type Building={x:number;z:number;w:number;d:number;height:number};
type Entry={mesh:T.Mesh;minX:number;maxX:number;minZ:number;maxZ:number;minY:number;maxY:number};
const GRID=8;
/** A cone is a roof (a hut's, a kiosk's, a pavilion's pyramid) when it is no taller than 1.3 × its radius (a pine's is foliage). */
export const roofLikeCone=(w:number,d:number,h:number)=>h<=1.3*Math.max(w,d)/2;

export function createCanopyCollector(buildings:readonly Building[]){
 const candidates:Entry[]=[],cells=new Map<string,Entry[]>();
 const up=new T.Vector3(),normal=new T.Matrix3(),q=new T.Quaternion(),pos=new T.Vector3(),scl=new T.Vector3(),yAxis=new T.Vector3(0,1,0);
 const index=(e:Entry)=>{for(let i=Math.floor(e.minX/GRID);i<=Math.floor(e.maxX/GRID);i++)for(let j=Math.floor(e.minZ/GRID);j<=Math.floor(e.maxZ/GRID);j++){const k=i+','+j;let l=cells.get(k);if(!l)cells.set(k,l=[]);l.push(e);}};
 const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0),from=new T.Vector3(),hits:T.Intersection[]=[];
 /** The highest face of `mesh` straight down at (x, z) (null when none): its height and how level it is (normal's y). */
 const top=(mesh:T.Mesh,x:number,z:number,maxY:number,minY:number)=>{from.set(x,maxY+.5,z);ray.set(from,down);ray.far=maxY-minY+1;hits.length=0;mesh.raycast(ray,hits);
  let best:T.Intersection|undefined;for(const h of hits)if(!best||h.distance<best.distance)best=h;if(!best||!best.face)return null;
  normal.getNormalMatrix(mesh.matrixWorld);return {y:best.point.y,up:Math.abs(best.face.normal.clone().applyMatrix3(normal).normalize().y)};};
 return {
  /** Every mesh of the town, with its world bounds (world.ts's roof-prop pass). */
  consider(mesh:T.Mesh,box:T.Box3){
   if(box.isEmpty())return;
   const e:Entry={mesh,minX:box.min.x,maxX:box.max.x,minZ:box.min.z,maxZ:box.max.z,minY:box.min.y,maxY:box.max.y};
   const w=e.maxX-e.minX,d=e.maxZ-e.minZ,cx=(e.minX+e.maxX)/2,cz=(e.minZ+e.maxZ)/2,type=mesh.geometry.type;
   // Everything tall enough to stand over a canopy can hide it (a sign on a parapet, a tree crown over an awning, a pyramid roof).
   if(e.maxY>CANOPY_MIN_LIFT-.5)index(e);
   if(w<CANOPY_MIN_SIDE||d<CANOPY_MIN_SIDE||w*d<CANOPY_MIN_AREA||NOT_ROOF.test(type)||Array.isArray(mesh.material))return;
   if(type==='CylinderGeometry'&&(mesh.geometry as T.CylinderGeometry).parameters.radiusTop<.5)return;
   if(type==='ConeGeometry'&&!roofLikeCone(w,d,e.maxY-e.minY))return;
   if(e.maxY-fieldSurfaceHeight(cx,cz)<CANOPY_MIN_LIFT)return;
   // On or inside a building's footprint: its own roof covers it, or it is a roof prop (world.ts roofObstacles, landable already).
   if(buildings.some(b=>Math.abs(cx-b.x)<b.w/2&&Math.abs(cz-b.z)<b.d/2))return;
   mesh.matrixWorld.decompose(pos,q,scl);up.copy(yAxis).applyQuaternion(q);if(Math.abs(up.y)<Math.cos(.3)&&type!=='ConeGeometry')return;// tipped over
   candidates.push(e);
  },
  /** The canopies (and pitched roofs to slide off), once every mesh has been considered. */
  finish():Canopy[]{
   const out:Canopy[]=[];
   for(const c of candidates){
    const w=c.maxX-c.minX,d=c.maxZ-c.minZ,step=Math.max(CANOPY_CELL,Math.sqrt(w*d/CANOPY_MAX_CELLS)),nx=Math.max(1,Math.round(w/step)),nz=Math.max(1,Math.round(d/step)),sx=w/nx,sz=d/nz;
    // A box turned only about y by a quarter turn (or not at all) and level: its top is its bounds' top everywhere, no ray needed.
    c.mesh.matrixWorld.decompose(pos,q,scl);const e=new T.Euler().setFromQuaternion(q,'YXZ'),quarter=Math.abs(Math.sin(2*e.y))<1e-3&&Math.abs(e.x)<1e-3&&Math.abs(e.z)<1e-3;
    const plain=c.mesh.geometry.type==='BoxGeometry'&&quarter;if(!plain&&w*d>CANOPY_MAX_SAMPLED_AREA)continue;
    // Only a roof piece of its own pitches (a cone, a box, an extrusion); a custom or merged mesh (Summit Isle's baked trees, rocks
    // and huts) gives its level faces only: a tree crown's facets are not a roof to slide off.
    const pitchable=/Cone|Box|Extrude|Cylinder|Shape/.test(c.mesh.geometry.type);
    // Per cell: its height, and 1 a floor / 2 a pitched face to slide off / 0 nothing seen from above.
    const heights=new Float64Array(nx*nz),kinds=new Uint8Array(nx*nz);
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=c.minX+(i+.5)*sx,z=c.minZ+(j+.5)*sz;
     const t=plain?{y:c.maxY,up:1}:top(c.mesh,x,z,c.maxY,c.minY);if(!t||t.up<CANOPY_STEEP_UP||t.y-fieldSurfaceHeight(x,z)<CANOPY_MIN_LIFT)continue;
     // Anything else higher straight above this spot hides it: not a surface you can see from above.
     let hidden=false;for(const o of cells.get(Math.floor(x/GRID)+','+Math.floor(z/GRID))??[]){if(o===c||o.maxY<=t.y+.05||x<=o.minX||x>=o.maxX||z<=o.minZ||z>=o.maxZ)continue;
      if(o.minY>t.y+.05){hidden=true;break;}const h=top(o.mesh,x,z,o.maxY,o.minY);if(h&&h.y>t.y+.05){hidden=true;break;}}
     if(!hidden&&(t.up>=CANOPY_FLAT_UP||pitchable)){heights[j*nx+i]=t.y;kinds[j*nx+i]=t.up>=CANOPY_FLAT_UP?1:2;}}
    // Runs along x of one kind (and, for floors, one height), then equal runs on successive rows, become rectangles.
    type Run={i0:number;i1:number;j0:number;h:number;k:number};let rows:Run[]=[];
    const flush=(r:Run,j1:number)=>out.push({x:c.minX+(r.i0+r.i1+1)/2*sx,z:c.minZ+(r.j0+j1+1)/2*sz,w:(r.i1-r.i0+1)*sx,d:(j1-r.j0+1)*sz,height:r.h,overhead:true,...(r.k===2?{steep:true as const}:{})});
    const same=(a:{h:number;k:number},b:{h:number;k:number})=>a.k===b.k&&(a.k===2||Math.abs(a.h-b.h)<.02);
    for(let j=0;j<=nz;j++){const runs:Run[]=[];
     if(j<nz)for(let i=0;i<nx;i++){const k=kinds[j*nx+i];if(!k)continue;const h=heights[j*nx+i],last=runs[runs.length-1];if(last&&last.i1===i-1&&same(last,{h,k})){last.i1=i;last.h=Math.max(last.h,h);}else runs.push({i0:i,i1:i,j0:j,h,k});}
     const next:Run[]=[];
     for(const r of runs){const m=rows.findIndex(p=>p.i0===r.i0&&p.i1===r.i1&&same(p,r));if(m>=0){rows[m].h=Math.max(rows[m].h,r.h);next.push(rows[m]);rows.splice(m,1);}else next.push(r);}
     for(const p of rows)flush(p,j-1);rows=next;}}
   return out;
  }};
}
