import * as T from 'three';
/** Same procedural body parts/material colours, consolidated across visible players. */
export function playerBatch(scene:T.Scene,capacity=1024){
 const geometryKeys=new WeakMap<T.BufferGeometry,string>();
 type Batch={mesh:T.InstancedMesh;colorStart:number;colorEnd:number};
 const groups=new Map<string,Batch>(),parts=new WeakMap<T.Object3D,T.Mesh[]>();
 type Binding={geometry:T.BufferGeometry;material:T.Material;roughness:number;side:T.Side;batch:Batch};
 const bindings=new WeakMap<T.Mesh,Binding>();
 function collect(root:T.Object3D){let meshes=parts.get(root);if(!meshes){meshes=[];root.traverse(o=>{if(o instanceof T.Mesh)meshes!.push(o);});parts.set(root,meshes);}return meshes;}
 return {
  begin(){for(const b of groups.values()){b.mesh.count=0;b.colorStart=Infinity;b.colorEnd=0;}},
  draw(root:T.Object3D){
   root.updateMatrixWorld(true);
   for(const mesh of collect(root)){
    let visible=true;for(let node:T.Object3D|null=mesh;node;node=node.parent){if(!node.visible){visible=false;break;}if(node===root)break;}if(!visible)continue;
    const material=mesh.material as T.MeshStandardMaterial,g=mesh.geometry as T.BufferGeometry&{parameters?:unknown};
    // Geometry/material grouping is stable across animation frames. Retain the
    // binding, but refresh it if an appearance replaces geometry or material.
    let binding=bindings.get(mesh);
    if(!binding||binding.geometry!==g||binding.material!==material||binding.roughness!==material.roughness||binding.side!==material.side){
     let geometryKey=geometryKeys.get(g);if(geometryKey===undefined){geometryKey=g.type+JSON.stringify(g.parameters??g.uuid);geometryKeys.set(g,geometryKey);}
     const key=geometryKey+':'+material.roughness+':'+material.side;let group=groups.get(key);
     if(!group){const mat=material.clone();mat.color.set('#ffffff');const instance=new T.InstancedMesh(g.clone(),mat,capacity);instance.count=0;instance.castShadow=true;instance.receiveShadow=true;instance.frustumCulled=false;instance.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(instance);group={mesh:instance,colorStart:Infinity,colorEnd:0};groups.set(key,group);}
     binding={geometry:g,material,roughness:material.roughness,side:material.side,batch:group};bindings.set(mesh,binding);
    }
    const b=binding.batch;
    const batch=b.mesh,i=batch.count++;batch.setMatrixAt(i,mesh.matrixWorld);
    // Slots may change owners after culling/reordering: compare the actual RGB values.
    const offset=i*3,color=material.color,data=batch.instanceColor?.array;
    if(!data||data[offset]!==Math.fround(color.r)||data[offset+1]!==Math.fround(color.g)||data[offset+2]!==Math.fround(color.b)){
     batch.setColorAt(i,color);b.colorStart=Math.min(b.colorStart,offset);b.colorEnd=Math.max(b.colorEnd,offset+3);
    }
   }
  },
  end(){for(const b of groups.values()){const mesh=b.mesh;mesh.visible=mesh.count>0;if(!mesh.visible)continue;
   // Capacity includes unused slots. Upload only this frame's populated prefix;
   // every visible slot is rewritten by draw, including after reordering/growth.
   mesh.instanceMatrix.clearUpdateRanges();mesh.instanceMatrix.addUpdateRange(0,mesh.count*16);mesh.instanceMatrix.needsUpdate=true;
   if(mesh.instanceColor&&b.colorStart!==Infinity){mesh.instanceColor.setUsage(T.DynamicDrawUsage);mesh.instanceColor.clearUpdateRanges();mesh.instanceColor.addUpdateRange(b.colorStart,b.colorEnd-b.colorStart);mesh.instanceColor.needsUpdate=true;}
  }},
  dispose(){for(const {mesh:b} of groups.values()){b.removeFromParent();b.geometry.dispose();(b.material as T.Material).dispose();b.dispose();}}
 };
}
