import * as T from 'three';
import {LANDMARK_BUILDINGS,nameHash} from './buildingStyles';

/**
 * Soft building silhouettes (Oct 12 2026, user: "many of them are sharp and angular. change that to be more round and have
 * variations. Keep in mind the heat issue").
 *
 * Shapes only, baked once at load: every piece is a plain palette mesh that world.ts's batching pass folds into the same 50 m
 * vertex-colour chunks, so a silhouette adds no draw call, material, texture or per-frame work, only a few triangles. Corners
 * use 1–3 segments (a chamfer is 1), not three.js ExtrudeGeometry's 16 per corner.
 *
 * Gameplay data is untouched: world.ts still records the same footprint, height, obstacle and roof data per building. Every
 * shape stays inside the footprint and under the walkable roof (roof furniture keeps its old bounding box), so collisions,
 * rooftop travel, coin spots and doors are the same.
 */

/** Corner radius (m) and arc segments; seg 1 = a straight chamfer, r 0 = a sharp corner. */
export type Corner={r:number;seg:number};
/** Corners: 0 front-right (+x,+z), 1 front-left (-x,+z), 2 back-left (-x,-z), 3 back-right (+x,-z). */
export type Corners=[Corner,Corner,Corner,Corner];
/** A profile ring: outward offset from the footprint outline and its height. */
export type Ring={o:number;y:number};

export const corners=(front:Corner,back:Corner=front):Corners=>[front,front,back,back];

/**
 * A rounded-rectangle prism swept through `rings` (bottom to top): walls are 2 rings, a pillowy cornice or plinth 3–4.
 * Smooth normals round the arcs and up the profile; flat on straight runs and chamfers. Indexed, position + normal only
 * (the batching pass adds the empty uv and the paint colour). Local origin: footprint centre, y as given.
 */
export function softPrism(w:number,d:number,rings:Ring[],cs:Corners,{top=false,bottom=false}:{top?:boolean;bottom?:boolean}={}){
  const a=w/2,b=d/2,signs:[number,number][]=[[1,1],[-1,1],[-1,-1],[1,-1]];
  // Outline samples shared by every ring: corner centre, unit direction, radius.
  type S={cx:number;cz:number;ux:number;uz:number;r:number;corner:number};
  const samples:S[]=[];
  cs.forEach(({r,seg},k)=>{
    const [sx,sz]=signs[k],rr=Math.min(r,a,b);
    if(rr<=1e-4){samples.push({cx:sx*a,cz:sz*b,ux:sx*Math.SQRT1_2,uz:sz*Math.SQRT1_2,r:0,corner:-1});return;}
    const cx=sx*(a-rr),cz=sz*(b-rr),n=Math.max(1,seg);
    for(let i=0;i<=n;i++){const t=(k+i/n)*Math.PI/2;samples.push({cx,cz,ux:Math.cos(t),uz:Math.sin(t),r:rr,corner:n>1?k:-2-k});}
  });
  // Point of sample s on a ring offset by o. Sharp corners offset diagonally (by o·√2) so faces stay parallel.
  const at=(s:S,o:number):[number,number]=>s.r?[s.cx+s.ux*(s.r+o),s.cz+s.uz*(s.r+o)]:[s.cx+s.ux*o*Math.SQRT2,s.cz+s.uz*o*Math.SQRT2];
  // Drop zero-length runs (a pill end meeting the next corner).
  const pts:S[]=[];for(const s of samples){const p=pts[pts.length-1];if(p){const [x0,z0]=at(p,0),[x1,z1]=at(s,0);if(Math.hypot(x1-x0,z1-z0)<1e-4)continue;}pts.push(s);}
  {const [x0,z0]=at(pts[0],0),[x1,z1]=at(pts[pts.length-1],0);if(pts.length>1&&Math.hypot(x1-x0,z1-z0)<1e-4)pts.pop();}
  const N=pts.length,R=rings.length;
  // Profile normals (horizontal, vertical) per ring, averaged over the bands either side.
  const band=rings.slice(1).map((q,j)=>{const p=rings[j],dy=q.y-p.y,dO=q.o-p.o,l=Math.hypot(dy,dO)||1;return [dy/l,-dO/l];});
  const ringN=rings.map((_,j)=>{const s=[0,0];for(const k of [j-1,j])if(band[k]){s[0]+=band[k][0];s[1]+=band[k][1];}const l=Math.hypot(s[0],s[1])||1;return [s[0]/l,s[1]/l];});
  const pos:number[]=[],nor:number[]=[],idx:number[]=[];
  const vert=(x:number,y:number,z:number,nx:number,ny:number,nz:number)=>{pos.push(x,y,z);nor.push(nx,ny,nz);return pos.length/3-1;};
  for(let i=0;i<N;i++){
    const P=pts[i],Q=pts[(i+1)%N];
    const smooth=P.corner>=0&&P.corner===Q.corner;
    const [px,pz]=at(P,0),[qx,qz]=at(Q,0),dx=qx-px,dz=qz-pz,l=Math.hypot(dx,dz)||1,fx=dz/l,fz=-dx/l;
    const hP=smooth?[P.ux,P.uz]:[fx,fz],hQ=smooth?[Q.ux,Q.uz]:[fx,fz];
    const col:number[][]=[];
    for(let j=0;j<R;j++){const {o,y}=rings[j],[h,v]=ringN[j],[x0,z0]=at(P,o),[x1,z1]=at(Q,o);
      col.push([vert(x0,y,z0,hP[0]*h,v,hP[1]*h),vert(x1,y,z1,hQ[0]*h,v,hQ[1]*h)]);}
    for(let j=0;j<R-1;j++){const [p0,q0]=col[j],[p1,q1]=col[j+1];idx.push(p0,q1,q0,p0,p1,q1);}
  }
  const cap=(j:number,up:boolean)=>{const {o,y}=rings[j],base=pos.length/3;for(const s of pts){const [x,z]=at(s,o);vert(x,y,z,0,up?1:-1,0);}
    for(let i=1;i<N-1;i++)up?idx.push(base,base+i+1,base+i):idx.push(base,base+i,base+i+1);};
  if(top)cap(R-1,true);if(bottom)cap(0,false);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setIndex(idx);
  return g;
}

/** A simple solid block (top and bottom caps) with the given corners, base at y0. */
export const softBlock=(w:number,h:number,d:number,cs:Corners,y0=0)=>softPrism(w,d,[{o:0,y:y0},{o:0,y:y0+h}],cs,{top:true,bottom:true});

/**
 * Two-sided curved awning strip: a quarter-ellipse falling from the wall (z 0, y 0) to its lip (z depth, y −drop), `width`
 * along x. Both faces carry their own normals, so it reads from the street and from the play camera above.
 */
export function barrelStrip(width:number,depth:number,drop:number,segs=3){
  const pos:number[]=[],nor:number[]=[],idx:number[]=[],h=width/2;
  for(const side of [1,-1]){const base=pos.length/3;
    for(let i=0;i<=segs;i++){const t=i/segs*Math.PI/2,z=Math.sin(t)*depth,y=-(1-Math.cos(t))*drop;
      // Outward normal of the ellipse (z/depth)²+((y+drop)/drop)²=1 at this point.
      let nz=Math.sin(t)/depth,ny=Math.cos(t)/drop;const l=Math.hypot(nz,ny);nz/=l;ny/=l;
      for(const x of [-h,h]){pos.push(x,y,z);nor.push(0,ny*side,nz*side);}}
    for(let i=0;i<segs;i++){const p=base+i*2,q=p+2;side>0?idx.push(p,q+1,p+1,p,q,q+1):idx.push(p,p+1,q+1,p,q+1,q);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setIndex(idx);return g;
}

/**
 * Half-disc slab facing +z (an arch top for a window or door canopy): radius r, thickness t, centred on its flat bottom edge.
 * `segs` around the half circle.
 */
export function archSlab(r:number,t:number,segs=6){
  const g=new T.CylinderGeometry(r,r,t,segs,1,false,-Math.PI/2,Math.PI);
  g.rotateX(-Math.PI/2);g.deleteAttribute('uv');return g;
}

/**
 * A building's silhouette = an outline (plan shape and corners) + a facade detail. Outlines: crisp (square corners and a
 * square cornice slab, user Oct 12 2026: "mix in some straight edge buildings"), soft (small/medium corner radius), round
 * ends (large radius), corner tower, chamfer. Details: plain, rounded bay windows, arched windows, portholes (seaside only).
 */
export type Outline='crisp'|'soft'|'roundEnds'|'cornerTower'|'chamfer';
export type Detail='plain'|'bays'|'arches'|'portholes';
export type BuildingShape={outline:Outline;detail:Detail;/** Corner radius for 'soft'. */ radius:number};
const ROUNDED_OUTLINES:readonly Outline[]=['soft','soft','roundEnds','cornerTower','chamfer'];
const SOFT_RADII=[.7,1.1,1.5];

/** Seaside streets (Palm Coast front, the beach row, the pier and Coral Cay): the only ones that get porthole windows. */
export const SEASIDE_BUILDINGS=new Set(['CAFÉ MARÉ','PALM HOUSE','SURF & SOLE','COAST ROOMS','PROMENADE CAFÉ','FISH MARKET',
  'BEACH KITCHEN','SURF & REPAIR','PIER BAKERY','COAST CAFÉ','COCONUT CAFÉ','SURF SHOP','CAY GUESTHOUSE']);

/**
 * Shape picker for one town build (call in build order, like createSchemePicker; build order follows the streets). Landmarks
 * get null: they keep their look. Each pick is a salted name hash (independent of the paint scheme; stable on every load and
 * device). About 40% of buildings are crisp; the street never runs 3 rounded (or 3 crisp) in a row, and neighbours never
 * share a rounded outline or a non-plain detail. Buildings with a rounded collision corner (dataRadius) can be crisp too: the
 * Palm Coast row is all data-rounded and must mix as well; their crisp corner gets a 0.35 m ease (softHouses.ts).
 */
export function createShapePicker(){
  const recent:boolean[]=[];let lastOutline:Outline|null=null,lastDetail:Detail|null=null;
  return (label:string,dataRadius:number):BuildingShape|null=>{
    if(LANDMARK_BUILDINGS.has(label))return null;
    const hash=(salt:string)=>nameHash(label+'|'+salt);
    const [p1,p2]=[recent[recent.length-1],recent[recent.length-2]];
    let crisp=hash('crisp')%100<40;
    if(p1===false&&p2===false)crisp=true;
    if(p1===true&&p2===true)crisp=false;
    let outline:Outline='crisp';
    if(!crisp){
      const pool=ROUNDED_OUTLINES;
      let i=hash('outline')%pool.length;
      for(let n=0;n<pool.length&&pool[i]===lastOutline;n++)i=(i+1)%pool.length;
      outline=pool[i];
    }
    const details:Detail[]=crisp?['plain','plain','bays','arches']:['plain','bays','arches'];
    if(SEASIDE_BUILDINGS.has(label))details.push('portholes');
    let j=hash('detail')%details.length;
    for(let n=0;n<details.length&&details[j]!=='plain'&&details[j]===lastDetail;n++)j=(j+1)%details.length;
    const detail=details[j],radius=Math.max(dataRadius,SOFT_RADII[hash('radius')%SOFT_RADII.length]);
    recent.push(crisp);lastOutline=outline;lastDetail=detail;
    return {outline,detail,radius};
  };
}
