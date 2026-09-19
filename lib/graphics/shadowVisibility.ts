import * as T from 'three';
/** Cull only fixed scenery whose entire shadow volume misses the visible view. */
export function createShadowVisibility(renderer:T.WebGLRenderer,scene:T.Scene,sun:T.DirectionalLight){
 const casters=scene.children.filter((o):o is T.Mesh=>o instanceof T.Mesh&&o.name.startsWith('island-chunk-')&&o.castShadow).map(mesh=>({mesh,box:new T.Box3().setFromObject(mesh)}));
 const frustum=new T.Frustum(),matrix=new T.Matrix4(),volume=new T.Box3(),shifted=new T.Box3(),direction=new T.Vector3(),offset=new T.Vector3(),removed:T.Mesh[]=[];
 const original=renderer.shadowMap.render,stats={culled:0};let enabled=true;
 renderer.shadowMap.render=function(lights,world,camera){
  stats.culled=0;if(!enabled||!lights.includes(sun))return original.call(this,lights,world,camera);
  matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(matrix);
  direction.subVectors(sun.target.position,sun.position).normalize();
  if(direction.y>=-.01)return original.call(this,lights,world,camera);
  for(const {mesh,box} of casters){if(!mesh.castShadow||!mesh.visible)continue;
   // Extrude to below the lowest island surface; include tall off-screen casters.
   offset.copy(direction).multiplyScalar(Math.max(0,(box.max.y+8)/-direction.y));
   volume.copy(box).union(shifted.copy(box).translate(offset)).expandByScalar(1);
   if(!frustum.intersectsBox(volume)){mesh.castShadow=false;removed.push(mesh);}
  }
  stats.culled=removed.length;
  try{return original.call(this,lights,world,camera);}finally{for(const mesh of removed)mesh.castShadow=true;removed.length=0;}
 };
 return {stats,setEnabled(value:boolean){enabled=value;},dispose(){renderer.shadowMap.render=original;}};
}
