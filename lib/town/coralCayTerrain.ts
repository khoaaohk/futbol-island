// Coral Cay elevation pilot (?elev=1; heights in coralCayElevation.ts): the drawn side. Build-time only, no per-frame work, and
// no new material, texture or draw: the raised lawn replaces the flat lawn mesh in the same batch, and the flat ground layers
// built on the cay (paths, paving, kerbs, soil rows, road ribbons, fence rails) are draped over the same height function.
import * as T from 'three';
import {CAY_LAWN,CAY_CENTER} from './coralCay';
import {cayGround,cayBuild} from './coralCayElevation';

/** Rings from the dune line to the centre (the lawn is star-shaped about CAY_CENTER, like the sand ring it meets edge to edge).
 *  224 bearings x LAWN_RINGS: cells of about 2.7 m x 2-3 m, so the drawn grass stays within a few cm of the walked height. */
export const LAWN_RINGS=30;
/** The raised lawn: same outline, colour and y datum (`y0`) as the flat lawn; geometry relative to CAY_CENTER. */
export function buildCayLawnGeometry(y0:number,rings=LAWN_RINGS){
 const C=CAY_CENTER,n=CAY_LAWN.length,pos:number[]=[],idx:number[]=[];
 for(let j=0;j<rings;j++){const f=1-j/rings;for(let i=0;i<n;i++){const p=CAY_LAWN[i],x=C.x+(p.x-C.x)*f,z=C.z+(p.z-C.z)*f;pos.push(x-C.x,y0+(j?cayGround(x,z):0),z-C.z);}}
 pos.push(0,y0+cayGround(C.x,C.z),0);const centre=rings*n;
 for(let j=0;j<rings-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;idx.push(a,c,b,b,c,d);}
 for(let i=0;i<n;i++)idx.push((rings-1)*n+i,centre,(rings-1)*n+(i+1)%n);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 // Winding follows the outline's direction: face up.
 if(g.getAttribute('normal').getY(centre)<0){for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;}g.setIndex(idx);g.computeVertexNormals();}
 return g;
}

const SKIP=new Set(['coral-cay-foundation','coral-cay-sand','coral-cay-lawn']);
/** Drape the flat pieces built on the cay over the raised ground. A piece is "flat" when it is thin (≤ 0.3 m) and long (≥ 2.5 m)
 *  and was not built as part of an anchored prop; one whose ground varies by less than 1.5 cm stays as it is (a rigid lift).
 *  Boxes are re-cut into ≤ 2 m cells first. Returns the triangles added by the re-cut (for the heat notes). */
export function drapeCayPieces(){
 let added=0,draped=0;const v=new T.Vector3(),size=new T.Vector3();
 for(const piece of cayBuild.pieces as {mesh:T.Mesh;lift:number;anchored?:boolean}[]){
  const m=piece.mesh;if(piece.anchored||SKIP.has(m.name)||Math.abs(m.rotation.x)>1e-4||Math.abs(m.rotation.z)>1e-4)continue;
  let g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();g.boundingBox!.getSize(size);
  if(size.y>.3||Math.max(size.x,size.z)<2.5)continue;
  m.updateMatrix();const e=m.matrix.elements,at=(x:number,z:number)=>cayGround(e[0]*x+e[8]*z+e[12],e[2]*x+e[10]*z+e[14]);
  // Does the ground vary under it? (corners, edge mids, a 2 m lattice.)
  const b=g.boundingBox!;let lo=Infinity,hi=-Infinity;const nx=Math.max(1,Math.ceil(size.x/2)),nz=Math.max(1,Math.ceil(size.z/2));
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const h=at(b.min.x+size.x*i/nx,b.min.z+size.z*j/nz);if(h<lo)lo=h;if(h>hi)hi=h;}
  if(hi-lo<.015)continue;
  if(g instanceof T.BoxGeometry){const p=g.parameters,before=g.index!.count/3;g.dispose();g=m.geometry=new T.BoxGeometry(p.width,p.height,p.depth,Math.max(1,Math.ceil(p.width/2)),1,Math.max(1,Math.ceil(p.depth/2)));added+=g.index!.count/3-before;}
  const pos=g.getAttribute('position') as T.BufferAttribute;
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);pos.setY(i,v.y+at(v.x,v.z)-piece.lift);}
  pos.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();draped++;
 }
 return {added,draped};
}
