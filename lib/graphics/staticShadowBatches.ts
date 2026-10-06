import * as T from 'three';
/** Opaque static scenery needs shape, not its many paint materials, in the depth pass. */
export function createStaticShadowBatches(renderer:T.WebGLRenderer,scene:T.Scene,enabled:boolean){
 const stats={groups:0,casters:0,savedCalls:0};
 if(!enabled)return {stats,setEnabled(_value:boolean){},dispose(){}};
 const buckets=new Map<string,T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>[]>();
 for(const object of scene.children){
  if(!(object instanceof T.Mesh)||!object.name.startsWith('island-chunk-')||!object.castShadow||Array.isArray(object.material))continue;
  const m=object.material as T.MeshStandardMaterial;
  if(m.transparent||m.alphaTest>0||m.alphaMap||m.displacementMap||m.clippingPlanes?.length||object.customDepthMaterial)continue;
  const key=object.name.split(':').slice(0,2).join(':')+':'+m.side+':'+m.shadowSide;
  const bucket=buckets.get(key)??[];bucket.push(object);buckets.set(key,bucket);
 }
 const groups:{members:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>[];proxy:T.Mesh;material:T.MeshBasicMaterial;geometry:T.BufferGeometry}[]=[];
 for(const members of buckets.values()){
  if(members.length<2)continue;
  let vertexCount=0,indexCount=0;
  for(const m of members){vertexCount+=m.geometry.getAttribute('position').count;indexCount+=m.geometry.index?.count??m.geometry.getAttribute('position').count;}
  const positions=new Float32Array(vertexCount*3),indices=new Uint32Array(indexCount);let vertex=0,index=0;
  for(const m of members){const p=m.geometry.getAttribute('position'),idx=m.geometry.index;m.updateMatrixWorld(true);const v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);positions.set(v.toArray(),(vertex+i)*3);}for(let i=0;i<(idx?.count??p.count);i++)indices[index++]=vertex+(idx?idx.getX(i):i);vertex+=p.count;}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setIndex(new T.BufferAttribute(indices,1));geometry.computeBoundingSphere();
  const material=new T.MeshBasicMaterial({side:members[0].material.side});material.shadowSide=members[0].material.shadowSide;
  const proxy=new T.Mesh(geometry,material);proxy.name='static-shadow-batch';proxy.castShadow=true;proxy.visible=false;proxy.matrixAutoUpdate=false;scene.add(proxy);proxy.updateMatrixWorld(true);proxy.matrixWorldAutoUpdate=false;
  groups.push({members,proxy,material,geometry});stats.casters+=members.length;
 }
 stats.groups=groups.length;
 const original=renderer.shadowMap.render;
 renderer.shadowMap.render=function(...args){
  stats.savedCalls=0;if(!enabled)return original.apply(this,args);
  // Heat pass 6: a member culled by shadowVisibility (`userData.shadowCulled`, its shadow cannot reach the view) no longer breaks the
  // group into one depth draw per remaining member; the proxy draws it too, which adds only shadow texels nothing on screen samples.
  for(const group of groups){let live=0;for(const m of group.members){if(!m.visible||!m.material.visible||!(m.castShadow||m.userData.shadowCulled===true)){live=-1;break;}if(m.castShadow)live++;}
   if(live<2)continue;/* one surviving member: its own draw is the same single call with fewer triangles */group.proxy.visible=true;for(const m of group.members)m.castShadow=false;stats.savedCalls+=live-1;}
  try{return original.apply(this,args);}finally{for(const group of groups)if(group.proxy.visible){group.proxy.visible=false;for(const m of group.members)m.castShadow=m.userData.shadowCulled!==true;}}
 };
 return {stats,setEnabled(value:boolean){enabled=value;},dispose(){renderer.shadowMap.render=original;for(const {proxy,geometry,material} of groups){proxy.removeFromParent();geometry.dispose();material.dispose();}}};
}
