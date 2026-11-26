// Island elevation system, the drawn side (heights: elevation.ts). Build-time only: no per-frame work, no new material, texture
// or draw. A region's terrain mesh replaces its flat ground mesh in the same batch (buildStarTerrain), and after its builder
// has run, drapePieces() lays the flat layers it placed (paths, paving, kerbs, soil rows, road ribbons, fence rails) over the
// same height function (never below the drawn terrain), so no two ground layers ever cross.
import * as T from 'three';
import {regionLift as groundLift,elevBuild,type Pt} from './elevation';
import {createDrawnGround} from './drawnGround';

export const TERRAIN_RINGS=36;
/** Terrain for a star-shaped outline (every point visible from `centre`), rings from the outline in to the centre. The outer
 *  ring is the outline itself at the datum, so it meets the beach ring edge to edge. Geometry is relative to `centre`; y is the
 *  ground height (place the mesh at the old flat ground's y). Cells ≈ outline spacing x (radius / rings). */
export function buildStarTerrain(outline:readonly Pt[],centre:Pt,ground:(x:number,z:number)=>number,rings=TERRAIN_RINGS){
 const C=centre,n=outline.length,pos:number[]=[],idx:number[]=[];
 for(let j=0;j<rings;j++){const f=1-j/rings;for(let i=0;i<n;i++){const p=outline[i],x=C.x+(p.x-C.x)*f,z=C.z+(p.z-C.z)*f;pos.push(x-C.x,j?ground(x,z):0,z-C.z);}}
 pos.push(0,ground(C.x,C.z),0);const mid=rings*n;
 for(let j=0;j<rings-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;idx.push(a,c,b,b,c,d);}
 for(let i=0;i<n;i++)idx.push((rings-1)*n+i,mid,(rings-1)*n+(i+1)%n);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 if(g.getAttribute('normal').getY(mid)<0){for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;}g.setIndex(idx);g.computeVertexNormals();}
 return g;
}

/** Draped layers ride this far above the ground (on top of their own built height). */
export const DRAPE_UP=.02;
type Piece={mesh:T.Mesh;lift:number;anchored:boolean};
/** Lay the flat pieces recorded in elevBuild.pieces over the raised ground. A piece is "flat" when it is thin (≤ 0.3 m), long
 *  (≥ 2.5 m), has no tilt and was not built inside anchored(); where its ground varies by less than 1.5 cm it stays as placed (a
 *  rigid lift). Boxes are re-cut into ≤ 1.25 m cells first (2 m along a rail or kerb) (a ground sheet ≤ 5 cm thick keeps only its top face), and each vertex
 *  takes the HIGHER of the height function and the drawn terrain under it (`terrains`: mesh names; a terrain is a coarser
 *  triangulation of the function, so at the foot of a slope it stands a few cm above it): no ground layer ever dips under the grass.
 *  `skip`: meshes that carry their own heights. Returns the triangles added by the re-cuts (for the heat notes). */
export function drapePieces(skip:string[],terrains:string[]=[]){
 let added=0,draped=0;const v=new T.Vector3(),size=new T.Vector3(),pieces=elevBuild.pieces as Piece[];
 const laid:{mesh:T.Mesh;top0:number;box:T.Box3}[]=[],done=new Set<T.Mesh>();
 const drawn=pieces.filter(p=>terrains.includes(p.mesh.name)).map(p=>({y:p.mesh.position.y,ground:createDrawnGround(()=>[p.mesh])}));
 const top=(x:number,z:number)=>{let h=groundLift(x,z);for(const d of drawn){const y=d.ground.height(x,z)-d.y;if(y>h)h=y;}return h;};
 for(const piece of pieces){
  const m=piece.mesh;if(piece.anchored||terrains.includes(m.name)||skip.includes(m.name)||Math.abs(m.rotation.x)>1e-4||Math.abs(m.rotation.z)>1e-4)continue;
  let g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();g.boundingBox!.getSize(size);
  if(size.y>.3||Math.max(size.x,size.z)<2.5)continue;
  m.updateMatrix();const e=m.matrix.elements,at=(x:number,z:number)=>top(e[0]*x+e[8]*z+e[12],e[2]*x+e[10]*z+e[14]);
  const b=g.boundingBox!;let lo=Infinity,hi=-Infinity;const nx=Math.max(1,Math.ceil(size.x/2)),nz=Math.max(1,Math.ceil(size.z/2));
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const h=at(b.min.x+size.x*i/nx,b.min.z+size.z*j/nz);if(h<lo)lo=h;if(h>hi)hi=h;}
  if(hi-lo<.015)continue;
  done.add(m);const top0=m.position.y-piece.lift+b.max.y;/* the piece's flat top as designed (before the lift and the drape) */
  if(g instanceof T.BoxGeometry){const p=g.parameters,before=g.index!.count/3,cell=(m.userData.drapeCell as number|undefined)??(Math.min(p.width,p.depth)<1?2:1.25)/* a rail or kerb: 2 m; a ground sheet: 1.25 m */,sx=Math.max(1,Math.ceil(p.width/cell)),sz=Math.max(1,Math.ceil(p.depth/cell));g.dispose();
   g=m.geometry=p.height<=.05?new T.PlaneGeometry(p.width,p.depth,sx,sz).rotateX(-Math.PI/2).translate(0,p.height/2,0):new T.BoxGeometry(p.width,p.height,p.depth,sx,1,sz);added+=g.index!.count/3-before;}
  const pos=g.getAttribute('position') as T.BufferAttribute;
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);pos.setY(i,v.y+at(v.x,v.z)-piece.lift+DRAPE_UP);}
  pos.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();draped++;m.updateMatrixWorld(true);laid.push({mesh:m,top0,box:new T.Box3().copy(g.boundingBox!).applyMatrix4(m.matrixWorld)});
  // Opt-in (`userData.drapeLean`, the west plaza's sheet): upward normals lean that much further than the ground, so a gentle paved grade takes light and shade like the lawn beside it (westTerrain.ts LAWN_TILT). Normals only.
  {const k=m.userData.drapeLean as number|undefined;if(k){const n=g.getAttribute('normal') as T.BufferAttribute;for(let i=0;i<n.count;i++){const y=n.getY(i);if(y<.5)continue;const x=n.getX(i)*k,z=n.getZ(i)*k,l=Math.hypot(x,y,z);n.setXYZ(i,x/l,y/l,z/l);}n.needsUpdate=true;}}
 }
 // Paint on a draped layer (Nov 26 2026, ship triage: with the layers on, the Coral Cay boulevard's centre dashes were buried up to
 // 12 cm / floated up to 10 cm, and the roundabout's zebra and give-way stripes sat under the asphalt, because a marking is too short
 // to drape and took one rigid lift at its own centre while the road under it followed the slope and rode DRAPE_UP higher). Every thin
 // piece (<= 5 cm: road paint, a mat) that was not draped itself and lies on a draped layer keeps its DESIGNED clearance over that
 // layer at each of its corners: corner height = its flat height + (the draped surface under the corner - that surface's flat top).
 let marks=0;if(laid.length){const rc=new T.Raycaster(),from=new T.Vector3(),down=new T.Vector3(0,-1,0),w=new T.Vector3(),markBox=new T.Box3();
  for(const piece of pieces){const m=piece.mesh;if(done.has(m)||piece.anchored||terrains.includes(m.name)||skip.includes(m.name)||Math.abs(m.rotation.x)>1e-4||Math.abs(m.rotation.z)>1e-4)continue;
   const g0=m.geometry;if(!g0.boundingBox)g0.computeBoundingBox();g0.boundingBox!.getSize(size);if(size.y>.05)continue;
   m.updateMatrixWorld(true);const mb=markBox.copy(g0.boundingBox!).applyMatrix4(m.matrixWorld),base=mb.min.y-piece.lift;
   const under=laid.filter(l=>l.mesh!==m&&mb.max.x>=l.box.min.x&&mb.min.x<=l.box.max.x&&mb.max.z>=l.box.min.z&&mb.min.z<=l.box.max.z&&base>=l.top0-.005&&base-l.top0<.06);if(!under.length)continue;
   const meshes=under.map(l=>l.mesh),hit=(px:number,pz:number)=>{from.set(px,mb.max.y+2,pz);rc.set(from,down);const h=rc.intersectObjects(meshes,false)[0];return h?h.point.y-under[meshes.indexOf(h.object as T.Mesh)].top0:null;};
   // Each corner once; a corner that hangs off the layer's edge takes the first height found (a ring's lane line is centred on the island, not on the asphalt, so there is no "centre" to ask).
   const p0=g0.getAttribute('position') as T.BufferAttribute,seen=new Map<string,number|null>(),keys:string[]=[];let any:number|null=null;
   for(let i=0;i<p0.count;i++){w.fromBufferAttribute(p0,i).applyMatrix4(m.matrixWorld);const key=w.x.toFixed(3)+','+w.z.toFixed(3);keys.push(key);if(!seen.has(key)){const h=hit(w.x,w.z);seen.set(key,h);if(any===null&&h!==null)any=h;}}
   if(any===null)continue;
   const g=m.geometry=g0.clone(),pos=g.getAttribute('position') as T.BufferAttribute;
   for(let i=0;i<pos.count;i++)pos.setY(i,pos.getY(i)+(seen.get(keys[i])??any)-piece.lift);
   pos.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();marks++;}}
 return {added,draped,marks};
}
