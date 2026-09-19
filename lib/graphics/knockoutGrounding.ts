import * as T from 'three';

// Geometry bounds are cached; only active fall/return poses need support checks.
// Project each visible mesh's box onto world Y instead of scanning its vertices.
export function createKnockoutGrounding(){
 const entries=new WeakMap<T.Object3D,{active:boolean;meshes:T.Mesh[]}>();
 const rootPosition=new T.Vector3();
 return (root:T.Object3D,active:boolean,floorY:number)=>{
  let entry=entries.get(root);
  if(!active){if(entry)entry.active=false;return;}
  if(!entry){entry={active:false,meshes:[]};entries.set(root,entry);}
  if(!entry.active){
   entry.meshes.length=0;
   root.traverseVisible(object=>{if(object instanceof T.Mesh){if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();entry!.meshes.push(object);}});
   entry.active=true;
  }
  root.updateWorldMatrix(true,true);
  let minimum=Infinity;
  for(const mesh of entry.meshes){
   const b=mesh.geometry.boundingBox;if(!b)continue;
   const e=mesh.matrixWorld.elements;
   const y=e[13]+e[1]*(e[1]<0?b.max.x:b.min.x)+e[5]*(e[5]<0?b.max.y:b.min.y)+e[9]*(e[9]<0?b.max.z:b.min.z);
   minimum=Math.min(minimum,y);
  }
  if(minimum<floorY+.015){
   // Both the detached bot rigs and the main rig have unit-scale parents.
   // Convert the world-space correction so parent placement remains irrelevant.
   root.getWorldPosition(rootPosition);rootPosition.y+=floorY+.015-minimum;
   if(root.parent)root.parent.worldToLocal(rootPosition);
   root.position.copy(rootPosition);
  }
 };
}
