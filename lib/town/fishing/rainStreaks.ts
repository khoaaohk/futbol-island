import * as T from 'three';
import {readWeather} from './weather';

/**
 * Light rain at the fishing spot (Oct 15 2026, C4 weather): a handful of thin streaks just in front of the fishing camera.
 * HEAT (the only medium-heat item in docs/fishing-research.md):
 *  - ONE instanced draw of RAIN_COUNT thin quads, built lazily the first time it is needed and only drawn while fishing in the rain
 *    on heat tiers 0–1 without reduced motion; otherwise invisible (no draw) and nothing runs.
 *  - The fall is animated in the vertex shader from one time uniform: per frame the CPU only writes that uniform and copies the
 *    camera's position into the mesh (one matrix). No per-streak CPU work, no particles, no textures, no new passes.
 *  - Small, thin and faint (additive-free plain alpha, depthWrite off), so overdraw stays tiny.
 */
export const RAIN_COUNT=48;
const BOX={w:8,h:6,d:6,near:1.2};
export type RainStreaks={update(on:boolean,camera:T.Camera,dt:number):void;readonly drawing:boolean;dispose():void};
export function createRainStreaks(scene:T.Scene):RainStreaks{
 let mesh:T.InstancedMesh|null=null,material:T.ShaderMaterial|null=null,drawing=false;
 const fwd=new T.Vector3();
 function build(){
  const geo=new T.PlaneGeometry(.022,.6);const offsets=new Float32Array(RAIN_COUNT*3);
  for(let i=0;i<RAIN_COUNT;i++){const h=(n:number)=>{const s=Math.sin((i+1)*n)*43758.5453;return s-Math.floor(s);};offsets[i*3]=(h(12.9)-.5)*BOX.w;offsets[i*3+1]=h(78.2)*BOX.h;offsets[i*3+2]=BOX.near+h(37.7)*BOX.d;}
  geo.setAttribute('aOffset',new T.InstancedBufferAttribute(offsets,3));
  material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{uTime:{value:0},uFwd:{value:new T.Vector3(0,0,-1)}},
   vertexShader:`attribute vec3 aOffset;uniform float uTime;uniform vec3 uFwd;varying float vA;
void main(){vec3 side=normalize(vec3(-uFwd.z,0.,uFwd.x));float y=mod(aOffset.y-uTime*7.5,${BOX.h.toFixed(1)})-2.;
vec3 p=side*aOffset.x+normalize(vec3(uFwd.x,0.,uFwd.z))*aOffset.z+vec3(0.,y,0.);
vA=.5*smoothstep(-2.,-1.,y)*(1.-smoothstep(${(BOX.h-2.6).toFixed(1)},${(BOX.h-2).toFixed(1)},y));
gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(p+position+side*(.06*position.y),1.);}`,
   fragmentShader:'varying float vA;void main(){gl_FragColor=vec4(.86,.9,.95,vA);}'});
  mesh=new T.InstancedMesh(geo,material,RAIN_COUNT);mesh.name='fishing-rain';mesh.frustumCulled=false;mesh.matrixAutoUpdate=false;mesh.visible=false;mesh.renderOrder=5;
  // The per-instance matrices stay identity: the shader places each streak from its own offset.
  scene.add(mesh);
 }
 return {
  get drawing(){return drawing;},
  update(on,camera,dt){
   if(!on){if(mesh&&mesh.visible)mesh.visible=false;drawing=false;return;}
   if(!mesh)build();
   const m=mesh!,u=material!.uniforms;u.uTime.value=(u.uTime.value+Math.min(dt,.05))%1000;
   camera.getWorldDirection(fwd);(u.uFwd.value as T.Vector3).copy(fwd);
   camera.getWorldPosition(m.position);m.updateMatrix();m.visible=true;drawing=true;
  },
  dispose(){if(mesh){mesh.removeFromParent();mesh.geometry.dispose();material?.dispose();}mesh=null;material=null;drawing=false;},
 };
}
/** The pure gate (tests): rain streaks only while fishing, in the rain, on heat tiers 0–1, without reduced motion or still water. */
export const rainVisible=(o:{fishing:boolean;weather:string;tier:number;reduced:boolean;waterDetail:number})=>o.fishing&&o.weather==='rain'&&o.tier<=1&&!o.reduced&&o.waterDetail>=.5;
let weatherAt=-1e9,weatherNow='clear';
/** Today's weather for the rain gate, re-read at most every 5 s while fishing (never per frame from storage). `nowMs` is any clock (only the interval). */
export function rainWeather(nowMs:number){if(nowMs-weatherAt>5000||nowMs<weatherAt){weatherAt=nowMs;weatherNow=readWeather();}return weatherNow;}
