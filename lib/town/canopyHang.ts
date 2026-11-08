/**
 * Fruit on the leaves (Nov 8 2026, owner: "fix the fruit, it's not on the tree"): the real faceted surface of the low-poly canopy
 * lobes (three's IcosahedronGeometry(r, 0), whose flat faces sit up to ~20% inside the vertex radius), so hanging fruit touches the
 * leaves instead of floating on an ellipsoid round them. Used by the Summit orchard and island trees (lib/graphics/fruitTrees.ts
 * hangPoint) and Coral Cay's farm orchard. Checked by tests/fruit-on-tree.cjs.
 */
import * as T from 'three';
let ICO:{n:T.Vector3[];rin:number}|null=null;
/** The unit icosahedron's 20 face normals and its inscribed radius (≈ 0.795: the flat faces sit well inside the vertices). */
function ico(){if(ICO)return ICO;const g=new T.IcosahedronGeometry(1,0),p=g.getAttribute('position'),n:T.Vector3[]=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();let rin=1;
 for(let f=0;f<p.count;f+=3){a.fromBufferAttribute(p,f);b.fromBufferAttribute(p,f+1);c.fromBufferAttribute(p,f+2);
  const m=new T.Vector3().subVectors(b,a).cross(c.sub(a)).normalize();if(m.dot(a)<0)m.negate();n.push(m);rin=Math.min(rin,m.dot(a));}
 g.dispose();return ICO={n,rin};}
/** Along the unit direction u from the unit icosahedron's centre: the distance to its faceted surface and the face's normal. */
function icoReach(u:T.Vector3){const {n,rin}=ico();let best=1e-6,face=n[0];for(const m of n){const d=m.dot(u);if(d>best){best=d;face=m;}}return {t:rin/best,face};}
const IV=new T.Matrix4(),NM=new T.Matrix3(),U=new T.Vector3(),Q=new T.Vector3();
/** Is world point q inside lobe L (shrunk by `shrink`)? */
function insideLobe(L:T.Matrix4,q:T.Vector3,shrink:number){Q.copy(q).applyMatrix4(IV.copy(L).invert());const len=Q.length();return len<1e-9||len<icoReach(Q.divideScalar(len)).t*shrink;}
/**
 * Where a fruit hangs on a canopy seen along world direction d from the crown's centre: on each lobe, the point of its faceted
 * surface along d (in the lobe's own squashed space), pushed out along that face's normal by `proud` (part of the fruit's radius:
 * it touches the leaves, a little sunk into them); the outermost of those not buried inside another lobe. null if every one is.
 */
export function canopyHang(lobes:readonly T.Matrix4[],c:{x:number;y:number;z:number},d:T.Vector3,proud:number):T.Vector3|null{
 let best:T.Vector3|null=null,score=-Infinity;
 for(const L of lobes){U.copy(d).transformDirection(IV.copy(L).invert());const r=icoReach(U),p=U.clone().multiplyScalar(r.t).applyMatrix4(L);
  if(lobes.some(o=>o!==L&&insideLobe(o,p,.98)))continue;
  const n=r.face.clone().applyMatrix3(NM.getNormalMatrix(L)).normalize();p.addScaledVector(n,proud);
  const sc=(p.x-c.x)*d.x+(p.y-c.y)*d.y+(p.z-c.z)*d.z;if(sc>score){score=sc;best=p;}}
 return best;
}
