import * as T from 'three';
/** Per-instance data a bean skin part carries (beanSkin.ts): one row of `width` RGBA texels. */
type BeanRowSource={array:Float32Array;width:number;staticWidth?:number};
type BeanDataMaterial=T.Material&{setBeanData?:(t:T.Texture,dynamic?:T.Texture)=>void};
/**
 * Same procedural body parts/material colours, consolidated across visible players.
 * Bean skin parts also carry a data row (colours, face cell, number, spine and limb control points): each such
 * batch owns two float textures with a row per instance (gl_InstanceID), grown in powers of two: the static texels
 * (appearance) and the per-frame ones (pose), each uploaded only when one of its rows changed. The rig's `root.userData.beanSync` refreshes its row source after the world matrices.
 */
/** root.updateMatrixWorld(true) for a batched rig, skipping the childless classic meshes the bean skin hid (userData.beanHidden):
 * nothing reads their matrices while hidden, and they were 42 of a live rig's 45 meshes (heat pass 4, audit F8). A mesh shown again
 * (costume, classic style) loses the flag and is updated on the same call. */
export function updateRigMatrices(o:T.Object3D){
 if(o.matrixAutoUpdate)o.updateMatrix();
 if(o.parent===null)o.matrixWorld.copy(o.matrix);else o.matrixWorld.multiplyMatrices(o.parent.matrixWorld,o.matrix);
 o.matrixWorldNeedsUpdate=false;const children=o.children;
 for(let i=0;i<children.length;i++){const child=children[i];if(child.userData.beanHidden)continue;updateRigMatrices(child);}
}
/** Budget pass (Sep 27 2026): bean hair and hat geometries hold every style and collapse the unused ones in the vertex shader, so a
 * batched player spent ~60 % of its vertex work (colour and hat shadow) on styles nobody sees. Styles are built one after another,
 * so each style is one contiguous index range: a hair/hat batch is keyed by style and draws only that range. Null when a style is
 * not contiguous (then the whole geometry is drawn, as before). The row texel holding the style id: hair 10, hat 11 (beanSkin BD). */
const STYLE_TEXEL:Record<string,number>={'bean-hair':10,'bean-hat':11};
const styleRanges=new WeakMap<T.BufferGeometry,Map<number,{start:number;count:number}|null>>();
export function styleIndexRange(g:T.BufferGeometry,style:number){
 let byStyle=styleRanges.get(g);if(!byStyle){byStyle=new Map();styleRanges.set(g,byStyle);}
 if(byStyle.has(style))return byStyle.get(style)!;
 const index=g.index,anchor=g.getAttribute('beanAnchor');let range:{start:number;count:number}|null=null;
 if(index&&anchor){let first=-1,last=-1,n=0;for(let i=0;i<index.count;i++)if(Math.round(anchor.getW(index.getX(i)))===style){if(first<0)first=i;last=i;n++;}
  if(n>0&&n===last-first+1)range={start:first,count:n};}
 byStyle.set(style,range);return range;
}
export function playerBatch(scene:T.Scene,capacity=1024){
 const geometryKeys=new WeakMap<T.BufferGeometry,string>();
 type RowTex={width:number;texture:T.DataTexture;dirty:boolean};
 type BeanRows={rows:number;fixed:RowTex;pose:RowTex};
 type Batch={mesh:T.InstancedMesh;colorStart:number;colorEnd:number;morphDirty:boolean;bean?:BeanRows};
 const groups=new Map<string,Batch>(),parts=new WeakMap<T.Object3D,T.Mesh[]>();
 type Binding={geometry:T.BufferGeometry;material:T.Material;roughness:number;side:T.Side;style:number;batch:Batch};
 const bindings=new WeakMap<T.Mesh,Binding>();
 function rowTex(width:number,rows:number,old?:RowTex):RowTex{
  const texture=new T.DataTexture(new Float32Array(width*rows*4),width,rows,T.RGBAFormat,T.FloatType);
  texture.minFilter=texture.magFilter=T.NearestFilter;texture.generateMipmaps=false;texture.needsUpdate=true;texture.name='bean-batch-rows';
  if(old){(texture.image.data as unknown as Float32Array).set(old.texture.image.data as unknown as Float32Array);old.texture.dispose();}
  return {width,texture,dirty:!!old};
 }
 function beanRows(fixedW:number,poseW:number,rows:number):BeanRows{return {rows,fixed:rowTex(fixedW,rows),pose:rowTex(poseW,rows)};}
 function copyRow(t:RowTex,i:number,array:Float32Array,from:number){
  const data=t.texture.image.data as unknown as Float32Array,n=t.width*4,offset=i*n;
  for(let k=0;k<n;k++)if(data[offset+k]!==array[from+k]){data.set(array.subarray(from,from+n),offset);t.dirty=true;return;}
 }
 function writeBeanRow(b:Batch,i:number,array:Float32Array){
  const rows=b.bean!;
  if(i>=rows.rows){
   // Grow (powers of two, up to capacity): keep earlier rows, rebind both the colour and shadow materials.
   rows.rows=Math.min(capacity,Math.max(rows.rows*2,i+1));rows.fixed=rowTex(rows.fixed.width,rows.rows,rows.fixed);rows.pose=rowTex(rows.pose.width,rows.rows,rows.pose);
   (b.mesh.material as BeanDataMaterial).setBeanData?.(rows.fixed.texture,rows.pose.texture);(b.mesh.customDepthMaterial as BeanDataMaterial|undefined)?.setBeanData?.(rows.fixed.texture,rows.pose.texture);
  }
  copyRow(rows.fixed,i,array,0);copyRow(rows.pose,i,array,rows.fixed.width*4);
 }
 function collect(root:T.Object3D){let meshes=parts.get(root);if(!meshes){meshes=[];root.traverse(o=>{if(o instanceof T.Mesh)meshes!.push(o);});parts.set(root,meshes);}return meshes;}
 return {
  begin(){for(const b of groups.values()){b.mesh.count=0;b.colorStart=Infinity;b.colorEnd=0;b.morphDirty=false;}},
  draw(root:T.Object3D){
   updateRigMatrices(root);(root.userData.beanSync as (()=>void)|undefined)?.();
   for(const mesh of collect(root)){
    let visible=true;for(let node:T.Object3D|null=mesh;node;node=node.parent){if(!node.visible){visible=false;break;}if(node===root)break;}if(!visible)continue;
    const material=mesh.material as T.MeshStandardMaterial,g=mesh.geometry as T.BufferGeometry&{parameters?:unknown};
    // Geometry/material grouping is stable across animation frames. Retain the
    // binding, but refresh it if an appearance replaces geometry or material.
    let binding=bindings.get(mesh);
    // A bean skin's hair/hat mesh may hold a per-style view of the shared geometry (beanSkin beanStyleView): key, range and clone use its base, so batches group as before.
    const base=(g.userData.beanStyleBase as T.BufferGeometry|undefined)??g;
    const styleTexel=STYLE_TEXEL[base.name],styleSource=styleTexel!==undefined?mesh.userData.beanData as BeanRowSource|undefined:undefined;
    const style=styleSource?Math.round(styleSource.array[styleTexel*4+3]):-1,range=style>=0?styleIndexRange(base,style):null;
    if(!binding||binding.geometry!==g||binding.material!==material||binding.roughness!==material.roughness||binding.side!==material.side||binding.style!==style){
     let geometryKey=geometryKeys.get(base);if(geometryKey===undefined){geometryKey=base.type+JSON.stringify((base as typeof g).parameters??base.uuid);geometryKeys.set(base,geometryKey);}
     const key=geometryKey+':'+material.roughness+':'+material.side+(range?':style'+style:'');let group=groups.get(key);
     if(!group){const mat=material.clone();mat.color.set('#ffffff');const own=base.clone();if(range)own.setDrawRange(range.start,range.count);const instance=new T.InstancedMesh(own,mat,capacity);if(mesh.morphTargetInfluences?.length){instance.count=Math.min(capacity,32);instance.setMorphAt(0,mesh);instance.morphTexture!.needsUpdate=true;}instance.count=0;instance.castShadow=mesh.userData.batchShadow!==false;instance.receiveShadow=true;instance.frustumCulled=false;instance.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(instance);group={mesh:instance,colorStart:Infinity,colorEnd:0,morphDirty:false};groups.set(key,group);
      const source=mesh.userData.beanData as BeanRowSource|undefined;
      if(source){const fixedW=Math.min(source.width,source.staticWidth??source.width);group.bean=beanRows(fixedW,Math.max(1,source.width-fixedW),32);(mat as BeanDataMaterial).setBeanData?.(group.bean.fixed.texture,group.bean.pose.texture);
       if(mesh.customDepthMaterial){const depth=mesh.customDepthMaterial.clone() as BeanDataMaterial;depth.setBeanData?.(group.bean.fixed.texture,group.bean.pose.texture);instance.customDepthMaterial=depth;}}}
     binding={geometry:g,material,roughness:material.roughness,side:material.side,style,batch:group};bindings.set(mesh,binding);
    }
    const b=binding.batch;
    const batch=b.mesh,i=batch.count++;batch.setMatrixAt(i,mesh.matrixWorld);
    if(b.bean){const source=mesh.userData.beanData as BeanRowSource|undefined;if(source)writeBeanRow(b,i,source.array);}
    if(mesh.morphTargetInfluences?.length){
     const weights=mesh.morphTargetInfluences;
     if(i>=batch.morphTexture!.image.height){
      const old=batch.morphTexture!,height=Math.min(capacity,old.image.height*2),data=new Float32Array((weights.length+1)*height);
      data.set(old.image.data as unknown as Float32Array);batch.morphTexture=new T.DataTexture(data,weights.length+1,height,T.RedFormat,T.FloatType);old.dispose();b.morphDirty=true;
     }
     const data=batch.morphTexture!.image.data as unknown as Float32Array,offset=i*(weights.length+1)+1;
     let changed=data[offset-1]!==1;for(let k=0;k<weights.length;k++)if(data[offset+k]!==Math.fround(weights[k])){changed=true;break;}
     if(changed){batch.setMorphAt(i,mesh);b.morphDirty=true;}
    }
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
   if(b.morphDirty)mesh.morphTexture!.needsUpdate=true;
   if(b.bean)for(const t of [b.bean.fixed,b.bean.pose])if(t.dirty){t.texture.needsUpdate=true;t.dirty=false;}
   if(mesh.instanceColor&&b.colorStart!==Infinity){mesh.instanceColor.setUsage(T.DynamicDrawUsage);
    // Keep earlier ranges that have not been rendered yet (two updates before one render): the renderer
    // merges and clears them after uploading. Clearing here left changed slots stale on the GPU.
    const pending=mesh.instanceColor.updateRanges;
    if(pending.length>=16){for(const r of pending){b.colorStart=Math.min(b.colorStart,r.start);b.colorEnd=Math.max(b.colorEnd,r.start+r.count);}mesh.instanceColor.clearUpdateRanges();}
    mesh.instanceColor.addUpdateRange(b.colorStart,b.colorEnd-b.colorStart);mesh.instanceColor.needsUpdate=true;}
  }},
  dispose(){for(const {mesh:b,bean} of groups.values()){b.removeFromParent();b.geometry.dispose();(b.material as T.Material).dispose();b.customDepthMaterial?.dispose();bean?.fixed.texture.dispose();bean?.pose.texture.dispose();b.dispose();}}
 };
}
