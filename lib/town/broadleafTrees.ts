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
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const TREES_DEFAULT=true;// `?trees=0` switches the new trees off (before / after)
const query=(()=>{try{return typeof window!=='undefined'&&window.location&&typeof window.location.search==='string'?window.location.search:null;}catch{return null;}})();
let enabled=query===null?TREES_DEFAULT:/[?&]trees=1(&|$)/.test(query)||(TREES_DEFAULT&&!/[?&]trees=0(&|$)/.test(query));
/** Tests call this; the browser reads the URL once. */
export function setBroadleafTrees(on:boolean){enabled=on;}
export const broadleafTreesOn=()=>enabled;

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
export type BroadleafTree={leaves:T.BufferGeometry;shade:Float32Array;bark:T.BufferGeometry;shape:string;triangles:number;top:number;reach:number};
const up=new T.Vector3(0,1,0);
/** A low-poly clump: icosahedron corners pushed in / out by up to `jag` (a hash of the corner's direction, so shared corners stay shut). */
function clump(seed:number,jag:number,round=false){const g=round?new T.DodecahedronGeometry(1,0):new T.IcosahedronGeometry(1,0),p=g.getAttribute('position') as T.BufferAttribute;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+jag*(spotHash(x*7.1+seed,z*5.3+y*3.7,seed)*2-1);p.setXYZ(i,x*k,y*k,z*k);}
 return g;}

/** One broadleaf tree in tree space (trunk foot at the origin), scale s. `low`: the battery-saver tier (the 3 big clumps, no branches). */
export function broadleafTree(x:number,z:number,s:number,o:{trunkTop?:number;trunkFoot?:number;sides?:number;low?:boolean}={}):BroadleafTree{
 const h=(k:number)=>spotHash(x,z,k),shape=BROADLEAF_SHAPES[Math.floor(h(1)*BROADLEAF_SHAPES.length)%BROADLEAF_SHAPES.length];
 // The tree's own pose: a yaw, a squash (wider or taller), a lean of up to ~4 degrees, all applied to clumps, branches and trunk alike.
 const yaw=h(2)*Math.PI*2,sx=s*(.92+.16*h(3)),sy=s*(.9+.2*h(4)),lean=(h(5)-.5)*.14,leanDir=h(6)*Math.PI*2;
 const pose=new T.Matrix4().compose(new T.Vector3(),new T.Quaternion().setFromEuler(new T.Euler(Math.cos(leanDir)*lean,yaw,Math.sin(leanDir)*lean,'YXZ')),new T.Vector3(sx,sy,sx));
 const lobes=o.low?shape.lobes.slice(0,3):shape.lobes,parts:T.BufferGeometry[]=[],centres:{c:T.Vector3;r:number}[]=[];
 lobes.forEach(([lx,ly,lz,r,sqy=1,sqxz=1],k)=>{const g=clump(k*13+Math.floor(h(7)*97),.09,k===0);r*=LOBE_GROW;
  const m=new T.Matrix4().compose(new T.Vector3(lx,ly,lz),new T.Quaternion().setFromEuler(new T.Euler(h(10+k)*.6,h(20+k)*6.28,h(30+k)*.6)),new T.Vector3(r*sqxz,r*sqy,r*sqxz));
  g.applyMatrix4(m.premultiply(pose));parts.push(g);
  const c=new T.Vector3(lx,ly,lz).applyMatrix4(pose);centres.push({c,r:r*Math.max(sqy,sqxz)*(sx+sy)/2});});
 const leaves=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());leaves.computeVertexNormals();// non-indexed: one flat normal per facet
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

/** A round bush / planter shrub: 3 overlapping clumps in place of one ball (radius r, centre height y0 above its foot). */
export function broadleafBush(x:number,z:number,r:number):{leaves:T.BufferGeometry;shade:Float32Array}{
 const h=(k:number)=>spotHash(x,z,40+k),parts:T.BufferGeometry[]=[],yaw=h(0)*6.28;
 const L:Lobe[]=[[0,0,0,.82],[.48,-.12,.22,.62],[-.38,.1,-.32,.6]];
 for(const [k,[lx,ly,lz,lr]] of L.entries()){const g=clump(k*7+Math.floor(h(1)*50),.09,k===0);g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(lx*r,ly*r,lz*r).applyAxisAngle(up,yaw),new T.Quaternion().setFromEuler(new T.Euler(h(2+k),h(5+k)*6.28,0)),new T.Vector3(lr*r,lr*r*.9,lr*r)));parts.push(g);}
 const leaves=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());leaves.computeVertexNormals();
 const P=leaves.getAttribute('position') as T.BufferAttribute,n=P.count,shade=new Float32Array(n*3);leaves.computeBoundingBox();const bb=leaves.boundingBox!,hy=Math.max(.01,bb.max.y-bb.min.y),value=.94+.12*h(9);
 for(let i=0;i<n;i++){const t=(P.getY(i)-bb.min.y)/hy,f=(.68+.32*Math.min(1,t*1.2))*value;shade[i*3]=f;shade[i*3+1]=f;shade[i*3+2]=f;}
 return {leaves,shade};
}
