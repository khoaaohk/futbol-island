import * as T from 'three';
/** Merge rigid parts sharing a material without changing normals, UVs or shading. */
export function batchRigidMeshes(parent:T.Group){
 const buckets=new Map<T.Material,T.Mesh[]>(),owned:T.BufferGeometry[]=[];parent.updateMatrixWorld(true);
 for(const child of parent.children)if(child instanceof T.Mesh&&!Array.isArray(child.material)){const parts=buckets.get(child.material)??[];parts.push(child);buckets.set(child.material,parts);}
 for(const [material,parts] of buckets){if(parts.length<2)continue;const positions:number[]=[],normals:number[]=[],uvs:number[]=[];
  for(const part of parts){part.updateMatrix();const g=(part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone()).applyMatrix4(part.matrix);const p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=g.getAttribute('uv');
   for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));uvs.push(uv?.getX(i)??0,uv?.getY(i)??0);}g.dispose();part.removeFromParent();}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.computeBoundingSphere();owned.push(g);const mesh=new T.Mesh(g,material);mesh.castShadow=parts.some(p=>p.castShadow);mesh.receiveShadow=parts.some(p=>p.receiveShadow);mesh.matrixAutoUpdate=false;parent.add(mesh);
 }
 return owned;
}
