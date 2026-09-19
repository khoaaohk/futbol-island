import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
/** Shared pickup silhouette; the same upward highlight language as enterable buildings. */
export function createTruckLandingGlowAssets(){
 const shapes=[{w:2.1,h:.58,d:4.5,y:.72,z:0},{w:1.98,h:.85,d:1.5,y:1.35,z:.8}];
 const geometries=[.028,.085].map(radius=>{const parts:T.BufferGeometry[]=[];for(const s of shapes){const box=new T.BoxGeometry(s.w,s.h,s.d),edges=new T.EdgesGeometry(box),p=edges.getAttribute('position');for(let i=0;i<p.count;i+=2){const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1);a.y+=s.y;b.y+=s.y;a.z+=s.z;b.z+=s.z;parts.push(new T.TubeGeometry(new T.LineCurve3(a,b),1,radius,4,false));}box.dispose();edges.dispose();}const merged=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());return merged;});
 const wash=new T.BoxGeometry(2.12,1.7,4.52);wash.translate(0,.95,0);geometries.push(wash);
 function create(){const root=new T.Group();root.name='truck-landing-indicator';root.visible=false;
  const uniforms={tint:{value:new T.Color('#70edbd')},rise:{value:0},moving:{value:1}};
  const vertexShader='varying float height; void main(){height=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
  const materials=geometries.map((g,i)=>{const m=new T.ShaderMaterial({uniforms,vertexShader,fragmentShader:`varying float height;uniform vec3 tint;uniform float rise;uniform float moving;void main(){float band=exp(-pow((height-rise)/.35,2.));float alpha=${i===0?'.6+band*.25':i===1?'.10+band*.12':'moving*band*.12'};gl_FragColor=vec4(tint,alpha);}`,transparent:true,depthWrite:false,toneMapped:false,blending:i===0?T.NormalBlending:T.AdditiveBlending});const mesh=new T.Mesh(g,m);mesh.raycast=()=>{};root.add(mesh);return m;});
  return {root,update(visible:boolean,ready:boolean,time:number,reduced:boolean){root.visible=visible;if(!visible)return;uniforms.tint.value.set(ready?'#70edbd':'#ffd166');uniforms.rise.value=reduced?-5:(time*.5%1)*2.8-.4;uniforms.moving.value=reduced?0:1;},dispose(){root.removeFromParent();materials.forEach(m=>m.dispose());}};
 }
 return {create,dispose(){geometries.forEach(g=>g.dispose());}};
}
