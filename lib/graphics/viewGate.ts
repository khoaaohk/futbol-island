import * as T from 'three';
type Region={meshes:T.Mesh[];box:T.Box3;swept:T.Box3};
type Unit={radius:number};
/** "Only what's in view" (heat audit, Sep 30 2026). The renderer walks every visible node three times a frame whatever the camera
 * sees: the matrix refresh, the colour pass's frustum projection and the shadow pass's traversal. With 979 static chunk meshes, ~95
 * townsfolk units, 11 cars and ~100 ball-hunt spots on the island, most of that walk is spent on things far outside the view.
 *
 * For the length of ONE `renderer.render` of the island scene this gate hides:
 * - static chunk meshes, grouped by their 50 m chunk (`island-chunk-<cx>:<cz>:…`, one box per chunk), and
 * - moving units (each direct child of a registered root: a townsperson, a ride, a car, a ball-hunt spot),
 * whose volume swept along the sunlight down to y = −8 misses the camera frustum, then restores exactly what it hid (`finally`).
 * That is the same test `shadowVisibility` already applies to the shadow pass, so a hidden object is neither on screen nor able to
 * cast a shadow onto anything on screen: the frame is pixel-identical (0 differing pixels in the audit's same-frame parity check).
 * Hidden units' groups are skipped by `hiddenTransformGate` during the matrix refresh and refreshed in full when they show again.
 * Nothing persistent changes: visibility set by the app (Coral Cay gate, watch-view isolation, draw distances) is only ever read. */
export function createViewGate(renderer:{render:(scene:T.Scene,camera:T.Camera)=>void},scene:T.Scene,sun:T.DirectionalLight){
 const regions=new Map<string,Region>();
 for(const o of scene.children){if(!(o instanceof T.Mesh)||!o.name.startsWith('island-chunk-'))continue;
  const [cx,cz]=o.name.slice('island-chunk-'.length).split(':');const key=cx+':'+cz;
  let r=regions.get(key);if(!r){r={meshes:[],box:new T.Box3(),swept:new T.Box3()};regions.set(key,r);}
  o.updateMatrixWorld();r.meshes.push(o);r.box.expandByObject(o);}
 const roots:T.Object3D[]=[],units=new WeakMap<T.Object3D,Unit>(),hidden:T.Object3D[]=[];
 const frustum=new T.Frustum(),matrix=new T.Matrix4(),direction=new T.Vector3(),lastDirection=new T.Vector3(),offset=new T.Vector3();
 const volume=new T.Box3(),shifted=new T.Box3(),measure=new T.Box3(),center=new T.Vector3(),corner=new T.Vector3();
 const stats={regions:regions.size,chunks:0,units:0};let enabled=true;
 /** Padding for limbs, falls, knock-backs and small rides beyond the pose the unit was first measured in (as shadowVisibility). */
 const POSE_MARGIN=2.5,MIN_RADIUS=3;
 const sweep=(box:T.Box3,out:T.Box3)=>{offset.copy(direction).multiplyScalar(Math.max(0,(box.max.y+8)/-direction.y));return out.copy(box).union(shifted.copy(box).translate(offset)).expandByScalar(1);};
 function unitFor(object:T.Object3D){
  let unit=units.get(object);if(unit)return unit;
  object.updateWorldMatrix(true,true);measure.setFromObject(object);center.setFromMatrixPosition(object.matrixWorld);let radius=MIN_RADIUS;
  if(!measure.isEmpty())for(let i=0;i<8;i++){corner.set(i&1?measure.max.x:measure.min.x,i&2?measure.max.y:measure.min.y,i&4?measure.max.z:measure.min.z);radius=Math.max(radius,corner.distanceTo(center)+POSE_MARGIN);}
  unit={radius};units.set(object,unit);return unit;
 }
 const original=renderer.render;
 renderer.render=function(this:unknown,target:T.Scene,camera:T.Camera){
  stats.chunks=stats.units=0;
  if(!enabled||target!==scene)return original.call(this,target,camera);
  direction.subVectors(sun.target.position,sun.position).normalize();
  if(direction.y>=-.01)return original.call(this,target,camera);
  if(!direction.equals(lastDirection)){lastDirection.copy(direction);for(const r of regions.values())sweep(r.box,r.swept);}
  camera.updateMatrixWorld();matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(matrix);
  for(const r of regions.values()){if(frustum.intersectsBox(r.swept))continue;for(const mesh of r.meshes)if(mesh.visible){mesh.visible=false;hidden.push(mesh);}}
  stats.chunks=hidden.length;
  for(const root of roots){if(!root.visible)continue;
   for(const object of root.children){if(!object.visible)continue;const {radius}=unitFor(object);
    center.copy(object.position).applyMatrix4(root.matrixWorld);
    volume.min.set(center.x-radius,center.y-radius,center.z-radius);volume.max.set(center.x+radius,center.y+radius,center.z+radius);
    if(!frustum.intersectsBox(sweep(volume,volume))){object.visible=false;hidden.push(object);}
   }
  }
  stats.units=hidden.length-stats.chunks;
  try{return original.call(this,target,camera);}finally{for(const object of hidden)object.visible=true;hidden.length=0;}
 };
 return {stats,
  /** Each direct child of these roots is a unit, measured once around its own origin (like shadowVisibility's dynamic roots). */
  addUnitRoots(list:T.Object3D[]){for(const root of list)if(!roots.includes(root))roots.push(root);},
  setEnabled(value:boolean){enabled=value;},
  dispose(){renderer.render=original;}};
}
