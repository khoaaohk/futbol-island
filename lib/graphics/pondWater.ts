import * as T from 'three';
import {WATER_UNIFORMS} from './waterSurface';
import {applyGroundTint} from './groundTint';

/**
 * Stadium Park's lily pond (Nov 13 2026, owner: "make it lifelike"): the pond's materials. No texture, no per-frame CPU work: the
 * water and the lily pads move off the island's one water clock (WATER_UNIFORMS.uWaterTime, stepped once per rendered frame by
 * world.updateWater and held still for reduced motion and the static-ambience heat tiers), so they only cost anything while the
 * pond's chunk is drawn (frustum-culled, behind the west region gate).
 *  - Water: see-through (the pond bed's shallow-to-deep colours show under it), two crossing wind-ripple trains and up to
 *    POND_RIPPLES expanding rings (pushPondRipple: a wading foot, a ball landing) perturb the normal; a sky-tinted fresnel sheen and
 *    the sun's specular match the sea; the night tint is the sea's (uWaterNight). aEdge (1 open water, 0 at the bank) fades the
 *    water into the bank: a soft shoreline, no hard line. Cost: ~6 sin + 4 ring terms per fragment, on the pond only.
 *  - Lily pads: every pad drifts on its own slow loop (aPad = phase) in the vertex shader.
 */
export const POND_RIPPLES=4;
/** Ring sources: x, z, start time (uWaterTime s), strength (0 = off). Written by pushPondRipple only (events, never per frame). */
export const POND_UNIFORMS={uPondRip:{value:Array.from({length:POND_RIPPLES},()=>new T.Vector4(0,0,-99,0))}};
let next=0;
/** A ripple ring from (x, z): strength 0..1. */
export function pushPondRipple(x:number,z:number,strength:number){const v=POND_UNIFORMS.uPondRip.value[next];v.set(x,z,WATER_UNIFORMS.uWaterTime.value,strength);next=(next+1)%POND_RIPPLES;}
/** Ring speed (m/s) and life (s), shared by the shader and the tests. */
export const POND_RING={speed:1.6,life:2.6} as const;

export function createPondWaterMaterial(){
 const m=new T.MeshStandardMaterial({color:'#3d8fae',roughness:.1,metalness:.06,transparent:true,opacity:.8});
 m.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{uWaterTime:WATER_UNIFORMS.uWaterTime,uWaterNight:WATER_UNIFORMS.uWaterNight,uPondRip:POND_UNIFORMS.uPondRip});
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute float aEdge;varying float vEdge;varying vec2 vPondXZ;')
   .replace('#include <project_vertex>','#include <project_vertex>\nvEdge=aEdge;vPondXZ=(modelMatrix*vec4(transformed,1.)).xz;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
uniform float uWaterTime;uniform vec3 uWaterNight;uniform vec4 uPondRip[${POND_RIPPLES}];varying float vEdge;varying vec2 vPondXZ;`)
   .replace('#include <color_fragment>',`#include <color_fragment>
{float e=smoothstep(0.,1.,vEdge);diffuseColor.rgb=mix(vec3(.47,.6,.5),diffuseColor.rgb,e)*uWaterNight;diffuseColor.a*=mix(.18,1.,e);}`)
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
{vec2 p=vPondXZ;float t=uWaterTime;
 vec2 g=vec2(cos(p.x*1.7+p.y*.6+t*1.9),cos(p.y*1.9-p.x*.5+t*1.6))*.06+vec2(cos(p.x*3.9-p.y*2.3-t*2.7),cos(p.y*3.4+p.x*2.1-t*2.4))*.03;
 for(int i=0;i<${POND_RIPPLES};i++){vec4 r=uPondRip[i];float age=t-r.z;if(r.w>0.&&age>0.&&age<${POND_RING.life.toFixed(1)}){vec2 d=p-r.xy;float l=length(d)+1e-3,front=age*${POND_RING.speed.toFixed(1)};
  float k=r.w*(1.-age/${POND_RING.life.toFixed(1)})*exp(-abs(l-front)*2.6);g+=d/l*cos((l-front)*9.)*k*.5;}}
 g*=smoothstep(0.,.5,vEdge);normal=normalize(normal+(viewMatrix*vec4(g.x,0.,g.y,0.)).xyz);}`)
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
{float fr=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);totalEmissiveRadiance+=vec3(.42,.6,.72)*fr*.55*uWaterNight*smoothstep(0.,.6,vEdge);}`);
 };
 m.customProgramCacheKey=()=>'park-pond-water-v1';
 return m;
}

export function createPondPadMaterial(){
 const m=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.6});
 m.onBeforeCompile=s=>{s.uniforms.uWaterTime=WATER_UNIFORMS.uWaterTime;
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute float aPad;uniform float uWaterTime;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n{float t=uWaterTime;transformed.xz+=vec2(sin(t*.19+aPad),cos(t*.15+aPad*1.7))*.32;transformed.y+=sin(t*1.1+aPad*3.)*.004;}');};
 m.customProgramCacheKey=()=>'park-pond-pads-v1';
 return m;
}
/** The pond bed (vertex colours: sandy shallows to a deep green-brown middle), ground-tinted like the lawn. */
export function createPondBedMaterial(){return applyGroundTint(new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:1}),'mixed');}
/** The trails' paving: vertex colours (the cream path, blending to the beach sand where a trail runs onto the beach). */
export function createTrailMaterial(){return applyGroundTint(new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.85}),'path');}
