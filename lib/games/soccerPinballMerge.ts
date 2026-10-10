import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Bakes static meshes that share one material into a single mesh (one draw call). Each source mesh is removed
 * from its parent; its geometry is cloned in world space, so shared primitive geometries stay untouched. Meshes
 * whose material differs from the first are left alone. Returns the merged mesh, or null when fewer than two
 * meshes qualify. The merged geometry belongs to the scene, so the stage's dispose() frees it. */
export function mergePinballStatic(meshes:readonly T.Mesh[],name:string):T.Mesh|null{
 const first=meshes[0];if(!first)return null;
 const material=first.material,parent=first.parent;
 const same=meshes.filter(m=>m.material===material&&m.parent===parent&&!Array.isArray(m.material));
 if(same.length<2||!parent)return null;
 const geometries=same.map(m=>{m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);for(const key of Object.keys(g.attributes))if(key!=='position'&&key!=='normal')g.deleteAttribute(key);return g;});
 const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
 if(!merged)return null;
 for(const m of same)parent.remove(m);
 const mesh=new T.Mesh(merged,material);mesh.name=name;mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.matrixAutoUpdate=false;mesh.updateMatrix();
 parent.add(mesh);return mesh;
}
