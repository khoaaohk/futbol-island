/**
 * Fruit on the leaves (Nov 8 2026, owner: "fix the fruit, it's not on the tree"): the real faceted surface of the low-poly canopy
 * lobes (three's IcosahedronGeometry(r, 0), whose flat faces sit up to ~20% inside the vertex radius), so hanging fruit touches the
 * leaves instead of floating on an ellipsoid round them. Used by the Summit orchard and island trees (lib/graphics/fruitTrees.ts
 * hangPoint) and Coral Cay's farm orchard. Checked by tests/fruit-on-tree.cjs.
 */
import * as T from 'three';
// Soft sweep 2 (Nov 27 2026): the orchard crowns may be detail-1 icosahedra (80 faces, smooth-shaded "soft clumps"). Faces of a
// detail-1 polyhedron sit at different depths, so each face keeps its own plane (normal, offset): the exit along u is the nearest one.
const ICO=new Map<number,{n:T.Vector3[];off:number[]}>();
/** The unit icosahedron's (three's IcosahedronGeometry(1, detail)) face planes. */
function ico(detail:number){let e=ICO.get(detail);if(e)return e;const g=new T.IcosahedronGeometry(1,detail),p=g.getAttribute('position'),n:T.Vector3[]=[],off:number[]=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
 for(let f=0;f<p.count;f+=3){a.fromBufferAttribute(p,f);b.fromBufferAttribute(p,f+1);c.fromBufferAttribute(p,f+2);
  const m=new T.Vector3().subVectors(b,a).cross(c.sub(a)).normalize();if(m.dot(a)<0)m.negate();n.push(m);off.push(m.dot(a));}
 g.dispose();e={n,off};ICO.set(detail,e);return e;}
/** Along the unit direction u from the unit icosahedron's centre: the distance to its faceted surface and the face's normal. */
function icoReach(u:T.Vector3,detail:number){const {n,off}=ico(detail);let t=Infinity,face=n[0];for(let i=0;i<n.length;i++){const d=n[i].dot(u);if(d>1e-6&&off[i]/d<t){t=off[i]/d;face=n[i];}}return {t,face};}
const IV=new T.Matrix4(),NM=new T.Matrix3(),U=new T.Vector3(),Q=new T.Vector3();
/** Is world point q inside lobe L (shrunk by `shrink`)? */
function insideLobe(L:T.Matrix4,q:T.Vector3,shrink:number,detail:number){Q.copy(q).applyMatrix4(IV.copy(L).invert());const len=Q.length();return len<1e-9||len<icoReach(Q.divideScalar(len),detail).t*shrink;}
/**
 * Where a fruit hangs on a canopy seen along world direction d from the crown's centre: on each lobe, the point of its faceted
 * surface along d (in the lobe's own squashed space), pushed out along that face's normal by `proud` (part of the fruit's radius:
 * it touches the leaves, a little sunk into them); the outermost of those not buried inside another lobe. null if every one is.
 */
/** `detail`: the lobes' IcosahedronGeometry detail (0 faceted, 1 the soft crown), one for all or one a lobe. */
export function canopyHang(lobes:readonly T.Matrix4[],c:{x:number;y:number;z:number},d:T.Vector3,proud:number,detail:number|readonly number[]=0):T.Vector3|null{
 const det=(i:number)=>typeof detail==='number'?detail:detail[i]??0;
 let best:T.Vector3|null=null,score=-Infinity;
 lobes.forEach((L,li)=>{U.copy(d).transformDirection(IV.copy(L).invert());const r=icoReach(U,det(li)),p=U.clone().multiplyScalar(r.t).applyMatrix4(L);
  if(lobes.some((o,oi)=>o!==L&&insideLobe(o,p,.98,det(oi))))return;
  const n=r.face.clone().applyMatrix3(NM.getNormalMatrix(L)).normalize();p.addScaledVector(n,proud);
  const sc=(p.x-c.x)*d.x+(p.y-c.y)*d.y+(p.z-c.z)*d.z;if(sc>score){score=sc;best=p;}});
 return best as T.Vector3|null;
}
/** A canopy lobe of radius r: three's IcosahedronGeometry(r, detail), its normals smoothed (the unit direction) when `smooth`, so a
 *  soft crown shades round while staying the exact polyhedron canopyHang seats fruit on (type and parameters unchanged: foliage). */
export function canopyLobe(r:number,detail:number,smooth:boolean):T.BufferGeometry{const g=new T.IcosahedronGeometry(r,detail);if(!smooth)return g;
 const P=g.getAttribute('position') as T.BufferAttribute,N=g.getAttribute('normal') as T.BufferAttribute,v=new T.Vector3();
 for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).normalize();N.setXYZ(i,v.x,v.y,v.z);}N.needsUpdate=true;return g;}

/**
 * Polish Nov 27 2026 (owner shot 195, "the fruits on the tree are floating in the sky"): a tree drawn from the broadleaf kit
 * (jittered clumps, size variety, lean, low-tier clump count) has no icosahedron formula, so its fruit hangs on the leaves it really
 * has: `surface` = the crown's triangles in world space (non-indexed xyz). From the crown's centre along d: the OUTERMOST hit (the
 * leaves you see from outside), pushed `proud` out along that facet's normal. null if the ray misses (it never does from inside).
 */
const SA=new T.Vector3(),SB=new T.Vector3(),SC=new T.Vector3(),E1=new T.Vector3(),E2=new T.Vector3(),PV=new T.Vector3(),TV=new T.Vector3(),QV=new T.Vector3();
export function surfaceHit(surface:ArrayLike<number>,o:{x:number;y:number;z:number},d:T.Vector3):{t:number;n:T.Vector3}|null{
 const O=new T.Vector3(o.x,o.y,o.z);let best=-Infinity,bn:T.Vector3|null=null;
 for(let i=0;i+8<surface.length;i+=9){SA.set(surface[i],surface[i+1],surface[i+2]);SB.set(surface[i+3],surface[i+4],surface[i+5]);SC.set(surface[i+6],surface[i+7],surface[i+8]);
  E1.subVectors(SB,SA);E2.subVectors(SC,SA);PV.crossVectors(d,E2);const det=E1.dot(PV);if(Math.abs(det)<1e-9)continue;const inv=1/det;
  TV.subVectors(O,SA);const u=TV.dot(PV)*inv;if(u<0||u>1)continue;QV.crossVectors(TV,E1);const v=d.dot(QV)*inv;if(v<0||u+v>1)continue;
  const t=E2.dot(QV)*inv;if(t>1e-4&&t>best){best=t;bn=new T.Vector3().crossVectors(E1,E2).normalize();if(bn.dot(d)<0)bn.negate();}}
 return bn?{t:best,n:bn}:null;}
export function surfaceHang(surface:ArrayLike<number>,c:{x:number;y:number;z:number},d:T.Vector3,proud:number):T.Vector3|null{
 const h=surfaceHit(surface,c,d);if(!h)return null;return new T.Vector3(c.x,c.y,c.z).addScaledVector(d,h.t).addScaledVector(h.n,proud);}
