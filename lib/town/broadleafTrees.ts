// Broadleaf trees with volume (Nov 26 2026, owner: "do an audit on these round trees and give them more volume and different shapes.
// it's too round with gradient and looks flat"). Audit + shots: .claude/worktrees/_recovery-nov20/trees/NOTE.md.
//
// Before: every park / street tree was ONE IcosahedronGeometry(1.8, 1) (80 triangles, SMOOTH normals) on a stick, painted by the
// batching pass's canopy branch as one foot-to-crown gradient: a lit disc with no inside, all the same shape, only the size varied.
// Now: a canopy is 3-6 overlapping low-poly clumps (IcosahedronGeometry(1, 0), 20 triangles each, FLAT normals, the corners pushed
// in / out a little so the outline breaks up), one of 7 shapes chosen from the tree's position (stable between sessions and players:
// no Math.random, no extra draws from the park's seeded dice), with its own yaw, squash, lean and leaf shade. The trunk forks into 2-3
// short branches that end inside the clumps. Each canopy vertex carries an occlusion factor (userData.leafShade, rgb, read by the
// batching pass in world.ts): darker toward the canopy's core and its underside, darker in the creases where clumps meet, full on the
// outer tops. The light per facet (top / side / underside, warm sun side) is added there from the flat normals.
// Heat: same meshes per tree (bark + leaves), baked into the same chunk paint batches: 0 draw calls, 0 materials, 0 textures, 0
// passes. Triangles per tree 104-120 -> 112-150 (+~25 % on the park's trees); `?trees=0` restores today's trees exactly.
import * as T from 'three';
import {mergeGeometries,mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';


export const TREES_DEFAULT=true;// `?trees=0` switches the new trees off (before / after)
const query=(()=>{try{return typeof window!=='undefined'&&window.location&&typeof window.location.search==='string'?window.location.search:null;}catch{return null;}})();
let enabled=query===null?TREES_DEFAULT:/[?&]trees=1(&|$)/.test(query)||(TREES_DEFAULT&&!/[?&]trees=0(&|$)/.test(query));
/** Tests call this; the browser reads the URL once. */
export function setBroadleafTrees(on:boolean){enabled=on;}
export const broadleafTreesOn=()=>enabled;
/** The soft sweep's `?soft=0` switch (lib/graphics/softBox.ts softOn), read here without an import: tests load this file on its own. */
let softCached:boolean|null=null;
const softOn=()=>softCached??=(()=>{try{return typeof window==='undefined'||new URLSearchParams(window.location.search).get('soft')!=='0';}catch{return true;}})();

/** Town street trees were all #5b8c5c: now one of the park's leaf greens each (all fold into the same paint batch). */
export const TREE_GREENS=['#5b8c5c','#4f7a57','#5e8c62','#6f9d6c'];
/** A stable 0..1 hash of a spot (the variant, spin, squash and shade of the tree standing there). */
export function spotHash(x:number,z:number,k=0){const v=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453;return v-Math.floor(v);}

/** One clump: centre (tree space, trunk foot at 0, scale 1) and radius, with an optional squash. */
type Lobe=[x:number,y:number,z:number,r:number,sy?:number,sxz?:number];
export type BroadleafShape={name:string;fork:number;lobes:Lobe[]};
/** The kit (each fits today's 3.6 m wide, ~5.1 m tall envelope: tree kicks, fruit debris and canopy hit tests keep their numbers).
 *  The first three lobes are the big ones: the low tier (battery saver) keeps only those and no branches. */
export const BROADLEAF_SHAPES:BroadleafShape[]=[
 {name:'round-clump',fork:1.75,lobes:[[0,3.25,0,1.3],[.85,3.05,.35,1.0],[-.7,3.15,-.55,1.02],[-.15,4.15,.25,.95],[.45,2.6,-.75,.8]]},
 {name:'tall-oval',fork:1.7,lobes:[[0,3.05,0,1.05,1.3],[.25,4.2,.1,.92,1.2],[-.5,3.55,-.35,.8],[.5,2.65,.45,.78],[-.1,5.0,-.05,.58]]},
 {name:'umbrella',fork:2.3,lobes:[[0,3.85,0,1.4,.55,1.25],[.95,3.55,.45,1.0,.6,1.1],[-.95,3.6,-.35,1.0,.6,1.1],[.15,4.35,-.25,.95,.6],[-.35,3.4,.85,.8,.6]]},
 {name:'lopsided',fork:1.8,lobes:[[-.45,3.1,0,1.35],[1.0,3.75,.3,1.05],[.2,2.55,-.7,.78],[-.95,4.05,-.25,.8]]},
 {name:'tiered',fork:1.6,lobes:[[0,2.7,0,1.42,.55,1.1],[.05,3.6,.05,1.12,.62],[-.05,4.45,0,.78,.75],[.6,3.15,.5,.7,.7]]},
 {name:'columnar',fork:1.5,lobes:[[0,3.0,0,.95,1.5],[.05,4.4,0,.75,1.4],[.4,2.4,.25,.7],[-.35,3.8,-.25,.65],[0,5.25,.05,.45]]},
 {name:'spreading',fork:1.45,lobes:[[0,2.75,0,1.2,.72,1.15],[1.05,2.5,.3,.95,.7],[-.95,2.6,-.4,1.0,.7],[.2,2.5,-.95,.85,.72],[-.25,3.35,.45,.9,.7]]},
];

/** The kit's radii were drawn for the 3.6 m ball's outline; a 20-face clump holds ~60 % of its sphere, so they grow to keep the mass. */
export const LOBE_GROW=1.17;
/** top / reach: the canopy's highest point and widest half-width (tree space): the tree's asset (leaf debris hit test) is sized from them. */
/** The merged canopy's geometry type: keeps 'Icosahedron' in it, so every foliage test (NOT_ROOF) still reads it as a crown. */
export const FOLIAGE_TYPE='BroadleafIcosahedronClumps';
export type BroadleafTree={leaves:T.BufferGeometry;shade:Float32Array;bark:T.BufferGeometry;shape:string;triangles:number;top:number;reach:number};
const up=new T.Vector3(0,1,0);
/** A low-poly clump: icosahedron corners pushed in / out by up to `jag` (a hash of the corner's direction, so shared corners stay shut). */
function clump(seed:number,jag:number,round=false){const g=round?new T.DodecahedronGeometry(1,0):new T.IcosahedronGeometry(1,0),p=g.getAttribute('position') as T.BufferAttribute;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+jag*(spotHash(x*7.1+seed,z*5.3+y*3.7,seed)*2-1);p.setXYZ(i,x*k,y*k,z*k);}
 return g;}

/** One broadleaf tree in tree space (trunk foot at the origin), scale s. `low`: the battery-saver tier (the 3 big clumps, no branches). */
/** Tree size variety (soft sweep, owner Nov 27 2026: "fix the heights of trees. many are the same. some need to be taller than others"):
 *  a deterministic height factor per spot, ~0.75x-1.35x, with about one tree in eight a taller "hero" (to ~1.45x; `hero` widens that
 *  for palms to ~1.5x), and an independent crown factor 0.88-1.14. 1 / 1 with `?soft=0`. Colliders do not change (trunk radius). */
export function treeSize(x:number,z:number,o:{hero?:number;range?:number}={}):{height:number;crown:number}{
 if(!softOn())return {height:1,crown:1};
 const a=spotHash(x,z,91),b=spotHash(x,z,92),c=spotHash(x,z,93),range=o.range??1;
 // a smooth-ish bell between 0.75 and 1.2 (two hashes averaged), a hero bump for the top eighth
 let height=.75+.45*((a+b)/2)*range+(1-range)*.225;if(c>.875)height=1.25+(o.hero??.2)*(c-.875)/.125;
 return {height,crown:.88+.26*spotHash(x,z,94)};
}
export function broadleafTree(x:number,z:number,s:number,o:{trunkTop?:number;trunkFoot?:number;sides?:number;low?:boolean}={}):BroadleafTree{
 const h=(k:number)=>spotHash(x,z,k),shape=BROADLEAF_SHAPES[Math.floor(h(1)*BROADLEAF_SHAPES.length)%BROADLEAF_SHAPES.length];
 // The tree's own pose: a yaw, a squash (wider or taller), a lean of up to ~4 degrees, all applied to clumps, branches and trunk alike.
 const size=treeSize(x,z);s*=size.height;
 const yaw=h(2)*Math.PI*2,sx=s*(.92+.16*h(3))*size.crown,sy=s*(.9+.2*h(4)),lean=(h(5)-.5)*.14,leanDir=h(6)*Math.PI*2;
 const pose=new T.Matrix4().compose(new T.Vector3(),new T.Quaternion().setFromEuler(new T.Euler(Math.cos(leanDir)*lean,yaw,Math.sin(leanDir)*lean,'YXZ')),new T.Vector3(sx,sy,sx));
 const lobes=o.low?shape.lobes.slice(0,3):shape.lobes,parts:T.BufferGeometry[]=[],centres:{c:T.Vector3;r:number}[]=[];
 lobes.forEach(([lx,ly,lz,r,sqy=1,sqxz=1],k)=>{const g=clump(k*13+Math.floor(h(7)*97),.09,k===0);r*=LOBE_GROW;
  const m=new T.Matrix4().compose(new T.Vector3(lx,ly,lz),new T.Quaternion().setFromEuler(new T.Euler(h(10+k)*.6,h(20+k)*6.28,h(30+k)*.6)),new T.Vector3(r*sqxz,r*sqy,r*sqxz));
  g.applyMatrix4(m.premultiply(pose));parts.push(g);
  const c=new T.Vector3(lx,ly,lz).applyMatrix4(pose);centres.push({c,r:r*Math.max(sqy,sqxz)*(sx+sy)/2});});
 const leaves=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());leaves.computeVertexNormals();
 // Nov 26 2026: still foliage to the landing code (canopySurfaces.ts / tests/roof-landing.cjs NOT_ROOF match 'Icosahedron', as the old single
 // IcosahedronGeometry crown did): a merged crown's level facets are not a roof; parachute / jetpack landings pass through to the ground.
 (leaves as unknown as {type:string}).type=FOLIAGE_TYPE;// non-indexed: one flat normal per facet
 // Occlusion (rgb multiplier per vertex): the canopy's core and underside darker, the creases between clumps darker, the outer tops full;
 // a per-tree value / warmth shift so neighbours of the same colour still differ.
 const P=leaves.getAttribute('position') as T.BufferAttribute,n=P.count,shade=new Float32Array(n*3);
 leaves.computeBoundingBox();const bb=leaves.boundingBox!,mid=new T.Vector3();bb.getCenter(mid);const hy=Math.max(.01,bb.max.y-bb.min.y),rad=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z)/2;
 const value=.97+.12*h(8),warm=(h(9)-.5)*.08,v=new T.Vector3();
 for(let i=0;i<n;i++){v.fromBufferAttribute(P,i);
  const t=(v.y-bb.min.y)/hy,out=Math.min(1,Math.hypot(v.x-mid.x,v.z-mid.z)/rad);
  let f=(.7+.3*Math.min(1,t*1.15))*(.85+.15*out);
  // creases: a corner sitting close to ANOTHER clump's surface is tucked into the canopy (its own clump measures ~1, so the
  // second-nearest clump decides)
  let near=9,second=9;for(const L of centres){const d=v.distanceTo(L.c)/L.r;if(d<near){second=near;near=d;}else if(d<second)second=d;}
  if(second<1.25)f*=.72+.28*Math.max(0,(second-.85)/.4);
  f*=value;
  shade[i*3]=f*(1+warm);shade[i*3+1]=f;shade[i*3+2]=f*(1-warm);}
 // The trunk forks at `fork` into 2-3 short open branches that end inside the clumps (they show in the gaps between them).
 const fork=shape.fork,bark:T.BufferGeometry[]=[],sides=o.sides??6,foot=o.trunkFoot??.2,top=o.trunkTop??.12;
 const trunk=new T.CylinderGeometry(top,foot,fork,sides,1,true);trunk.translate(0,fork/2,0);trunk.applyMatrix4(new T.Matrix4().makeScale(s,s,s));
 // the trunk takes the pose's lean and yaw but not its squash (a squashed trunk would thicken)
 trunk.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(Math.cos(leanDir)*lean,yaw,Math.sin(leanDir)*lean,'YXZ')));bark.push(trunk);
 if(!o.low){const forkAt=new T.Vector3(0,fork*s,0).applyEuler(new T.Euler(Math.cos(leanDir)*lean,yaw,Math.sin(leanDir)*lean,'YXZ'));
  const ends=centres.slice(0,Math.min(3,centres.length)).map(L=>L.c);
  for(const e of ends){const dir=e.clone().sub(forkAt),len=dir.length()*.72;if(len<.3)continue;
   const b=new T.CylinderGeometry(top*.55*s,top*.95*s,len,5,1,true);b.translate(0,len/2,0);
   b.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(up,dir.normalize())));b.translate(forkAt.x,forkAt.y-.05*s,forkAt.z);bark.push(b);}}
 const barkGeo=mergeGeometries(bark)!;bark.forEach(g=>g.dispose());
 const tri=(g:T.BufferGeometry)=>(g.index?g.index.count:g.getAttribute('position').count)/3;
 return {leaves,shade,bark:barkGeo,shape:shape.name,triangles:tri(leaves)+tri(barkGeo),top:bb.max.y,reach:rad};
}

/** A round bush / planter shrub: 3 overlapping clumps in place of one ball (radius r, centre height y0 above its foot).
 *  Leftovers B (Nov 26 2026 night): `soft` = rounder clumps for the bushes the owner sees up close (a detail-1 icosahedron each, corners
 *  jittered 4 %, smooth normals: no "rock" facets); `lobes` / `stretch` shape it (a tall ramp bush, a long planter row); `low` = the
 *  battery-saver tier (detail-0 clumps). The creases between clumps and the underside are darker (per-vertex shade, as the trees). */
export const BUSH_LOBES:Lobe[]=[[0,0,0,.82],[.48,-.12,.22,.62],[-.38,.1,-.32,.6]];
/** The plaza planters' shrub row (r 1: the three 0.6 m balls it replaces stood at dx -0.7 / 0 / 0.7). */
export const PLANTER_LOBES:Lobe[]=[[-.7,0,.02,.6,.8],[0,.06,-.03,.64,.82],[.7,0,.03,.58,.8]];
/** The tall bushes at the landing ramp's high end (r 0.7, stretch 0.85 / 1.9 / 0.95: the old pair of stretched balls' envelope). */
export const RAMP_BUSH_LOBES:Lobe[]=[[0,-.35,0,.95,.9],[.2,.45,.12,.78,.9],[-.15,.08,-.2,.7,.9]];
/** A Coral Cay shrub pair / trio (r 1; the old balls were 0.6-0.8 m, squashed 0.75 tall). */
export const CAY_PAIR_LOBES:Lobe[]=[[-.6,0,0,.7,.75],[.5,-.03,.05,.6,.75],[-.05,.12,-.2,.5,.8]];
export const CAY_TRIO_LOBES:Lobe[]=[[-.9,0,0,.55,.75],[0,0,.5,.67,.75],[.9,0,0,.79,.75]];
/** Soft sweep (owner Nov 27 2026: planter shrubs "not one soft loaf"): 2-4 distinct clumps of different sizes along the planter, with
 *  small gaps and heights that differ, picked per spot. */
function planterClumps(x:number,z:number):Lobe[]{const h=(k:number)=>spotHash(x,z,70+k),n=2+Math.floor(h(0)*2.999),out:Lobe[]=[];
 for(let i=0;i<n;i++){const t=n===1?0:i/(n-1)-.5,r=(n>3?.42:n>2?.5:.6)*(.8+.4*h(1+i));out.push([t*(n>2?1.55:1.1)+(h(10+i)-.5)*.15,(h(20+i)-.5)*.18,(h(30+i)-.5)*.2,r,.78+.18*h(40+i)]);}
 return out;}
export function broadleafBush(x:number,z:number,r:number,o:{soft?:boolean;low?:boolean;lobes?:Lobe[];stretch?:readonly [number,number,number]}={}):{leaves:T.BufferGeometry;shade:Float32Array;triangles:number}{
 const h=(k:number)=>spotHash(x,z,40+k),parts:T.BufferGeometry[]=[],yaw=o.lobes?0:h(0)*6.28,L=o.lobes===PLANTER_LOBES&&softOn()?planterClumps(x,z):o.lobes??BUSH_LOBES,soft=!!o.soft&&!o.low,st=o.stretch??[1,1,1],centres:{c:T.Vector3;r:number}[]=[];
 for(const [k,[lx,ly,lz,lr,sqy=.9,sqxz=1]] of L.entries()){const g=soft?softClump(k*7+Math.floor(h(1)*50)):clump(k*7+Math.floor(h(1)*50),.09,k===0);
  const c=new T.Vector3(lx*r*st[0],ly*r*st[1],lz*r*st[2]).applyAxisAngle(up,yaw),q=1+.12*(h(12+k)-.5);
  g.applyMatrix4(new T.Matrix4().compose(c,new T.Quaternion().setFromEuler(new T.Euler(soft?0:h(2+k),h(5+k)*6.28,0)),new T.Vector3(lr*r*sqxz*st[0]*q,lr*r*sqy*st[1]*q,lr*r*sqxz*st[2]*q)));parts.push(g);
  centres.push({c,r:lr*r*q*Math.max(st[0],st[1],st[2])});}
 const leaves=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());if(!soft)leaves.computeVertexNormals();(leaves as unknown as {type:string}).type=FOLIAGE_TYPE;
 const P=leaves.getAttribute('position') as T.BufferAttribute,n=P.count,shade=new Float32Array(n*3);leaves.computeBoundingBox();const bb=leaves.boundingBox!,hy=Math.max(.01,bb.max.y-bb.min.y),value=.94+.12*h(9),v=new T.Vector3();
 for(let i=0;i<n;i++){v.fromBufferAttribute(P,i);const t=(v.y-bb.min.y)/hy;let f=(.68+.32*Math.min(1,t*1.2))*value;
  if(soft){let near=9,second=9;for(const C of centres){const d=v.distanceTo(C.c)/C.r;if(d<near){second=near;near=d;}else if(d<second)second=d;}if(second<1.2)f*=.8+.2*Math.max(0,(second-.85)/.35);}
  shade[i*3]=f;shade[i*3+1]=f;shade[i*3+2]=f;}
 const triangles=(leaves.index?leaves.index.count:P.count)/3;
 return {leaves,shade,triangles};
}
/** A soft clump: detail-1 icosahedron (80 faces), corners pushed in / out 4 % by direction (shared corners stay shut), smooth normals. */
function softClump(seed:number){const ico=new T.IcosahedronGeometry(1,1);ico.deleteAttribute('uv');ico.deleteAttribute('normal');const g=mergeVertices(ico),p=g.getAttribute('position') as T.BufferAttribute;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.04*(spotHash(x*7.1+seed,z*5.3+y*3.7,seed)*2-1);p.setXYZ(i,x*k,y*k,z*k);}
 g.computeVertexNormals();const flat=g.toNonIndexed();g.dispose();return flat;}// non-indexed like every polyhedron (smooth normals kept)

/** Pine (Leftovers B, Nov 26 2026 night): the one cone becomes 3 stacked tiers (2 on the low tier), each a little offset and turned,
 *  narrower going up, with a dark underside and the lit tip (per-vertex shade). Tree space: trunk foot at 0; `s` = the old cone's
 *  scale (radius 1.6 s, 4.2 s tall from 1.9 s), so the silhouette's envelope, the asset and the collider stay where they were. */
export function pineTiers(x:number,z:number,s:number,o:{low?:boolean;base?:number}={}):{leaves:T.BufferGeometry;shade:Float32Array;triangles:number;top:number}{
 const h=(k:number)=>spotHash(x,z,60+k),size=treeSize(x,z),parts:T.BufferGeometry[]=[];s*=size.height;const base=(o.base??1.9)*s;
 // [bottom (above base), height, radius] in units of s: the tiers overlap by ~40 % so no trunk shows between them
 const tiers:[number,number,number][]=o.low?[[0,2.4,1.6],[1.6,2.6,1.05]]:[[0,1.9,1.62],[1.05,1.75,1.25],[2.05,2.15,.85]];
 // Soft sweep (owner Nov 27 2026: "pines less Christmas tree"): each tier a rounded skirt (a lathe: tucked underside, a soft rounded
 // rim that droops in 3-4 scallops, a convex shoulder up to the tip; smooth normals) instead of a straight 6-sided cone, tiers a bit
 // less regular. 6 sides x 3 profile steps = 24 triangles a tier (the cone was 12 + its 6-triangle base).
 const softTier=softOn()&&!o.low;
 tiers.forEach(([b,ht,rr],k)=>{const R=rr*s*(.94+.12*h(k))*size.crown*(softTier?.97+.1*h(50+k):1),H=ht*s*(softTier?.9+.16*h(55+k):1);let g:T.BufferGeometry;
  if(softTier){const prof=[new T.Vector2(0,H*.28),new T.Vector2(R,0),new T.Vector2(R*.6,H*.42),new T.Vector2(0,H)];
   const lathe=new T.LatheGeometry(prof,6);lathe.deleteAttribute('uv');lathe.deleteAttribute('normal');const ix=mergeVertices(lathe,1e-4),P=ix.getAttribute('position') as T.BufferAttribute,sc=3+Math.floor(h(60+k)*2),ph=h(65+k)*6.28;
   for(let i=0;i<P.count;i++){const px=P.getX(i),pz=P.getZ(i),rad=Math.hypot(px,pz);if(rad>R*.95){const a=Math.atan2(pz,px);P.setY(i,P.getY(i)-H*(.05+.06*(.5+.5*Math.sin(sc*a+ph))));}}
   {const I=ix.index!.array,keep:number[]=[];for(let i=0;i<I.length;i+=3)if(I[i]!==I[i+1]&&I[i+1]!==I[i+2]&&I[i]!==I[i+2])keep.push(I[i],I[i+1],I[i+2]);ix.setIndex(keep);}// the lathe's axis triangles are degenerate
   ix.computeVertexNormals();g=ix.toNonIndexed();ix.dispose();lathe.dispose();g.translate(0,-H/2,0);}
  else g=new T.ConeGeometry(R,H,6,1,false).toNonIndexed();
  const ox=(h(10+k)-.5)*.22*s*(k?1:0),oz=(h(20+k)-.5)*.22*s*(k?1:0);
  g.rotateY(h(30+k)*6.28);g.rotateZ((h(40+k)-.5)*(softTier?.1:.06));g.translate(ox,base+b*s+ht*s/2,oz);parts.push(g);});
 const leaves=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());if(!softTier)leaves.computeVertexNormals();(leaves as unknown as {type:string}).type=FOLIAGE_TYPE;
 const P=leaves.getAttribute('position') as T.BufferAttribute,n=P.count,shade=new Float32Array(n*3),value=.95+.1*h(9),N=leaves.getAttribute('normal') as T.BufferAttribute;
 leaves.computeBoundingBox();const bb=leaves.boundingBox!,hy=Math.max(.01,bb.max.y-bb.min.y);
 for(let i=0;i<n;i++){const t=(P.getY(i)-bb.min.y)/hy,under=N.getY(i)<-.5;let f=(.74+.3*t)*value;if(under)f*=.62;shade[i*3]=f*1.02;shade[i*3+1]=f;shade[i*3+2]=f*.98;}
 return {leaves,shade,triangles:n/3,top:bb.max.y};
}

/** A hedge-top swell (Leftovers B): an octahedron (8 faces: the west stadium's triangle budget), corners jittered 6 %, smooth normals
 *  (flattened and stretched along the hedge it reads as a soft swell, not a rock). Unit radius. */
export function hedgeClump(seed:number){const ico=new T.OctahedronGeometry(1,0);ico.deleteAttribute('uv');ico.deleteAttribute('normal');const g=mergeVertices(ico),p=g.getAttribute('position') as T.BufferAttribute;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.06*(spotHash(x*7.1+seed,z*5.3+y*3.7,seed)*2-1);p.setXYZ(i,x*k,y*k,z*k);}
 g.computeVertexNormals();const flat=g.toNonIndexed();g.dispose();(flat as unknown as {type:string}).type=FOLIAGE_TYPE;return flat;}
