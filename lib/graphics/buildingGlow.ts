import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Architectural edges and a soft upward wash, updated by the island's existing loop. */
export function createBuildingGlow(root:T.Group,width:number,depth:number,height:number,kind:'store'|'arcade'|'coaches'|'museum'|'arena'|'ferry'){
 const arcade=kind==='arcade',coaches=kind==='coaches';
 const effect=new T.Group();effect.name='building-outline-glow';effect.visible=false;root.add(effect);
 const uniforms={strength:{value:0},rise:{value:-2},tint:{value:new T.Color('#35ed8b')},moving:{value:1}};
 const vertexShader='varying vec3 localPoint; void main(){localPoint=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
 const material=(halo:boolean)=>new T.ShaderMaterial({uniforms,vertexShader,fragmentShader:`varying vec3 localPoint; uniform float strength; uniform float rise; uniform float moving; uniform vec3 tint; void main(){float band=exp(-pow((localPoint.y-rise)/1.1,2.0));float alpha=strength*${halo?'0.13':'0.7'}*(0.6+band*0.8);gl_FragColor=vec4(mix(tint,vec3(0.65,1.0,0.72),band*0.2),alpha);}`,transparent:true,depthWrite:false,blending:halo?T.AdditiveBlending:T.NormalBlending,toneMapped:false});
 const materials=[material(false),material(true)];
 const shapes=kind==='ferry'?[
  {w:8.4,d:17.4,h:1.7,x:0,y:.6,z:0},
  {w:6.15,d:10.15,h:3.15,x:0,y:3,z:0},
  {w:6.65,d:10.65,h:.28,x:0,y:4.6,z:0}
 ]:[
  {w:width+.22,d:depth+.24,h:height+.2,x:0,y:(height+.2)/2,z:0},
  {w:width+.56,d:depth+.6,h:.23,x:0,y:height+.08,z:0},
  ...(!coaches?[{w:width*.35+.12,d:depth*.42+.12,h:1.57,x:-width*.16,y:height+.78,z:-depth*.12}]:[]),
  {w:coaches?14.32:arcade?12.52:13.32,d:arcade?.52:.42,h:coaches?2.52:arcade?2.72:2.52,x:0,y:coaches?9.7:arcade?8.8:9.1,z:depth/2+.2}
 ];
 const geometries:T.BufferGeometry[]=[];
 for(const [layer,radius] of [.045,.14].entries()){
  const parts:T.BufferGeometry[]=[];
  for(const shape of shapes){
   const box=new T.BoxGeometry(shape.w,shape.h,shape.d),edges=new T.EdgesGeometry(box),points=edges.getAttribute('position');
   for(let i=0;i<points.count;i+=2){const a=new T.Vector3().fromBufferAttribute(points,i).add(new T.Vector3(shape.x,shape.y,shape.z)),b=new T.Vector3().fromBufferAttribute(points,i+1).add(new T.Vector3(shape.x,shape.y,shape.z));parts.push(new T.TubeGeometry(new T.LineCurve3(a,b),1,radius,6,false));}
   edges.dispose();box.dispose();
  }
  const geometry=mergeGeometries(parts)!;parts.forEach(part=>part.dispose());geometries.push(geometry);
  const mesh=new T.Mesh(geometry,materials[layer]);mesh.name=layer?'building-edge-halo':'building-edge-outline';mesh.raycast=()=>{};effect.add(mesh);
 }
 const wallGeometry=kind==='ferry'?(()=>{const parts=shapes.map(s=>new T.BoxGeometry(s.w,s.h,s.d).translate(s.x,s.y,s.z));const merged=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());return merged;})():new T.BoxGeometry(width+.16,height,depth+.18).translate(0,height/2,0);geometries.push(wallGeometry);
 const wallMaterial=new T.ShaderMaterial({uniforms,vertexShader,fragmentShader:'varying vec3 localPoint; uniform float strength; uniform float rise; uniform float moving; uniform vec3 tint; void main(){float band=exp(-pow((localPoint.y-rise)/0.8,2.0));float trail=exp(-pow((localPoint.y-rise+0.9)/1.5,2.0));float alpha=strength*moving*(band*0.17+trail*0.035);gl_FragColor=vec4(tint,alpha);}',transparent:true,depthWrite:false,side:T.FrontSide,blending:T.AdditiveBlending,toneMapped:false});
 const walls=new T.Mesh(wallGeometry,wallMaterial);walls.name='building-rising-glow';walls.raycast=()=>{};effect.add(walls);
 let amount=0,phase=0,wasHovered=false;
 return {update(hovered:boolean,dt:number,reduced:boolean){
  const step=Math.min(Math.max(dt,0),.05);if(hovered&&!wasHovered)phase=0;wasHovered=hovered;
  amount=reduced?Number(hovered):T.MathUtils.damp(amount,Number(hovered),10,step);
  if(!reduced&&amount>.01)phase=(phase+step*.38)%1;
  effect.visible=amount>.01;uniforms.strength.value=amount;uniforms.moving.value=reduced?0:1;uniforms.rise.value=reduced?-5:phase*((coaches?11:arcade?10.3:10.5)+4)-2;
 },dispose(){effect.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());wallMaterial.dispose();}};
}
