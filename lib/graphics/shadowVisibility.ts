import * as T from 'three';
type Unit={object:T.Object3D;radius:number};
/** Cull shadow casters whose entire shadow volume misses the visible view: fixed scenery chunks, plus (heat audit pass 2)
 * moving units registered with `addDynamicRoots` — each direct child of such a root (a townsperson rig, a ride, a car)
 * is a unit. A unit's bounding sphere is measured once around its own origin, padded for poses, then swept along the
 * sunlight to below the lowest island surface each shadow frame; a unit whose volume misses the view is hidden for the
 * shadow pass only (its whole subtree is skipped) and restored in `finally`. Its shadow could not reach a visible pixel,
 * so the image is unchanged; the colour pass and the simulation are untouched. */
export function createShadowVisibility(renderer:T.WebGLRenderer,scene:T.Scene,sun:T.DirectionalLight){
 const casters=scene.children.filter((o):o is T.Mesh=>o instanceof T.Mesh&&o.name.startsWith('island-chunk-')&&o.castShadow).map(mesh=>({mesh,box:new T.Box3().setFromObject(mesh)}));
 const frustum=new T.Frustum(),matrix=new T.Matrix4(),volume=new T.Box3(),shifted=new T.Box3(),direction=new T.Vector3(),offset=new T.Vector3(),removed:T.Mesh[]=[];
 const dynamicRoots:T.Object3D[]=[],units=new WeakMap<T.Object3D,Unit>(),hidden:T.Object3D[]=[],center=new T.Vector3(),measure=new T.Box3(),corner=new T.Vector3();
 const original=renderer.shadowMap.render,stats={culled:0,dynamicCulled:0};let enabled=true,dynamic=true;
 /** Padding for limbs, falls, knock-backs and small rides beyond the pose the unit was first measured in. */
 const POSE_MARGIN=2.5,MIN_RADIUS=3;
 function unitFor(object:T.Object3D){
  let unit=units.get(object);if(unit)return unit;
  measure.setFromObject(object);center.setFromMatrixPosition(object.matrixWorld);let radius=MIN_RADIUS;
  if(!measure.isEmpty())for(let i=0;i<8;i++){corner.set(i&1?measure.max.x:measure.min.x,i&2?measure.max.y:measure.min.y,i&4?measure.max.z:measure.min.z);radius=Math.max(radius,corner.distanceTo(center)+POSE_MARGIN);}
  unit={object,radius};units.set(object,unit);return unit;
 }
 renderer.shadowMap.render=function(lights,world,camera){
  stats.culled=0;stats.dynamicCulled=0;if(!enabled||!lights.includes(sun))return original.call(this,lights,world,camera);
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
  if(dynamic)for(const root of dynamicRoots){if(!root.visible)continue;
   for(const object of root.children){if(!object.visible)continue;const {radius}=unitFor(object);
    center.setFromMatrixPosition(object.matrixWorld);
    volume.min.set(center.x-radius,center.y-radius,center.z-radius);volume.max.set(center.x+radius,center.y+radius,center.z+radius);
    offset.copy(direction).multiplyScalar(Math.max(0,(volume.max.y+8)/-direction.y));
    volume.union(shifted.copy(volume).translate(offset)).expandByScalar(1);
    if(!frustum.intersectsBox(volume)){object.visible=false;hidden.push(object);}
   }
  }
  stats.dynamicCulled=hidden.length;
  try{return original.call(this,lights,world,camera);}finally{for(const mesh of removed)mesh.castShadow=true;removed.length=0;for(const object of hidden)object.visible=true;hidden.length=0;}
 };
 return {stats,setEnabled(value:boolean){enabled=value;},setDynamic(value:boolean){dynamic=value;},addDynamicRoots(roots:T.Object3D[]){for(const root of roots)if(!dynamicRoots.includes(root))dynamicRoots.push(root);},dispose(){renderer.shadowMap.render=original;}};
}
