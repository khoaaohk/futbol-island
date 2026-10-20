/**
 * The bug swarm's materials (Oct 20 2026, bugSwarm.ts): one MeshStandardMaterial for every bug model (vertex colours, no
 * textures) whose vertex shader flaps wings / lifts wing cases / walks legs per instance (iFlap, iPose; model attributes aWing,
 * aMisc from bugModels.ts), and an additive glow sprite for the fireflies. Every bug mesh shares one compiled program.
 */
import * as T from 'three';

const SHADER_KEY='bug-swarm-shader-v1';
export type BugUniforms={uTime:{value:number};uFade:{value:number}};
/** The shared bug material: flapping / walking vertex shader, sheen and lantern glow in the fragment. */
export function bugMaterial(u:BugUniforms){
 const m=new T.MeshStandardMaterial({color:'#ffffff',roughness:.62,metalness:0,vertexColors:true,side:T.DoubleSide});
 m.onBeforeCompile=s=>{s.uniforms.uTime=u.uTime;s.uniforms.uFade=u.uFade;
  s.vertexShader=s.vertexShader.replace('#include <common>',`#include <common>
attribute vec4 aWing;attribute vec4 aMisc;attribute vec4 iFlap;attribute vec4 iPose;uniform float uTime;uniform float uFade;varying float vSheen;varying float vGlow;`)
   .replace('#include <beginnormal_vertex>',`vec3 objectNormal=vec3(normal);
#ifdef USE_TANGENT
vec3 objectTangent=vec3(tangent.xyz);
#endif
vec3 bugP=position;
{float kind=aWing.y;
 if(kind>.5){float side=aWing.x;float ph=uTime*iFlap.x*6.2831853+iFlap.w;float ang;float span=1.;
  if(kind<1.5)ang=iFlap.z+iFlap.y*sin(ph);
  else if(kind<2.5)ang=iFlap.z+iFlap.y*sin(ph-.55);
  else if(kind<3.5)ang=iPose.x*.95;
  else{ang=mix(-.2,iFlap.z+iFlap.y*sin(ph-.3),iPose.x);span=iPose.x;}
  vec2 h=aWing.zw;vec2 q=vec2(h.x+(bugP.x-h.x)*span,bugP.y)-h;float a=side*ang;float c=cos(a);float s=sin(a);
  bugP.xy=vec2(c*q.x-s*q.y,s*q.x+c*q.y)+h;objectNormal.xy=vec2(c*objectNormal.x-s*objectNormal.y,s*objectNormal.x+c*objectNormal.y);}
 if(aMisc.y>0.){float lt=uTime*iPose.w+iPose.y;bugP.z+=sin(lt)*iPose.z*aMisc.y*6.;bugP.y+=max(0.,cos(lt))*iPose.z*aMisc.y*4.;}
 bugP*=uFade;vSheen=aMisc.z;
 vGlow=aMisc.w*(.12+pow(max(0.,sin(uTime*(1.3+fract(iPose.y*.173)*.8)+iPose.y)),4.));}`)
   .replace('#include <begin_vertex>','vec3 transformed=bugP;\n#ifdef USE_ALPHAHASH\nvPosition=vec3(position);\n#endif');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying float vSheen;varying float vGlow;')
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
{float fr=1.-abs(dot(normalize(vNormal),normalize(vViewPosition)));
 totalEmissiveRadiance+=vSheen*vec3(.10,.34,.95)*(.12+1.3*fr*fr);totalEmissiveRadiance+=vGlow*vec3(.85,1.,.35)*2.6;}`);};
 m.customProgramCacheKey=()=>SHADER_KEY;
 return m;
}
/** Firefly glow: an additive camera-facing sprite per firefly, pulsing with the lantern. */
export function glowMaterial(u:BugUniforms){
 return new T.ShaderMaterial({uniforms:{uTime:u.uTime,uFade:u.uFade},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  vertexShader:`attribute vec4 iPose;uniform float uTime;uniform float uFade;varying vec2 vUv;varying float vA;
void main(){vUv=uv-.5;float pulse=pow(max(0.,sin(uTime*(1.3+fract(iPose.y*.173)*.8)+iPose.y)),4.);
 vec4 mv=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);float sc=length(instanceMatrix[0].xyz)*(.6+pulse*.6)*uFade;
 mv.xy+=position.xy*sc;vA=(.3+pulse*.9)*uFade;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying vec2 vUv;varying float vA;void main(){float d=length(vUv)*2.;float a=(exp(-d*d*9.)*.8+exp(-d*d*2.5)*.35)*vA;gl_FragColor=vec4(vec3(.82,1.,.38)*a,a);}`});
}
