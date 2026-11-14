import * as T from 'three';
import {WATER_UNIFORMS,SEA_WATER_LOOK,SEA_GLSL,SEA_RIPPLE_PER_M} from './waterSurface';
import {POND_DEPTH} from '../town/westParkLayout';
import {applyGroundTint} from './groundTint';

/**
 * Stadium Park's lily pond (Nov 13 2026, owner: "make it lifelike"): the pond's materials. No texture, no per-frame CPU work: the
 * water and the lily pads move off the island's one water clock (WATER_UNIFORMS.uWaterTime, stepped once per rendered frame by
 * world.updateWater and held still for reduced motion and the static-ambience heat tiers), so they only cost anything while the
 * pond's chunk is drawn (frustum-culled, behind the west region gate).
 *  - Water (Nov 13 2026: the sea's look, createPondWaterMaterial below): see-through (the pond bed's shallow-to-deep colours show under it), two crossing wind-ripple trains and up to
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

/** The sea's shore distance (m) that matches a pond depth (m): the sea's colour runs off the distance to the shore (waterSurface.ts:
 *  the lagoon turquoise at the waterline, the aqua over the first metres, the teal by ~24 m), so the pond's shelf (up to POND_DEPTH
 *  .shelf) reads as the sea's pale shallows (0–3 m out) and its deep middle as the sea ~30 m out. */
export function pondSeaDistance(depth:number){const sh=POND_DEPTH.shelf;return depth<=0?0:depth<=sh?depth/sh*3:3+Math.min(1,(depth-sh)/(POND_DEPTH.deep-sh))*29;}
/**
 * The pond's water (Nov 13 2026, owner: "tie it to the ocean so the water is the same colour"): the ocean's own look, from the same
 * numbers (waterSurface.ts SEA_WATER_LOOK for the material, SEA_TINT / SEA_GLSL for the shallow-to-deep colour ramp), the same ripple
 * tile (`map`: the ocean's texture, world.ts, sampled in world space at the ocean's scale and drift, a second layer on the top detail
 * level as the sea has) and the same clock and night tint. Per vertex `aSea` is the depth as the sea's shore distance
 * (pondSeaDistance), so the shelf is the sea's pale lagoon and the middle its teal; the shelf is also more see-through (the sandy
 * bed shows: lighter), the deep middle nearly opaque. The pond keeps its own wind ripples, rings (pushPondRipple) and soft bank.
 * Cost: 1–2 texture reads, ~6 sin and 4 ring terms per fragment, on the pond only (no per-frame CPU work).
 */
export function createPondWaterMaterial(map?:T.Texture){
 const m=new T.MeshStandardMaterial({...SEA_WATER_LOOK,transparent:true,opacity:.92});if(map)m.map=map;
 m.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{uWaterTime:WATER_UNIFORMS.uWaterTime,uWaterNight:WATER_UNIFORMS.uWaterNight,uWaterDetail:WATER_UNIFORMS.uWaterDetail,uPondRip:POND_UNIFORMS.uPondRip});
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute float aEdge,aSea;varying float vEdge,vSea;varying vec2 vPondXZ;')
   .replace('#include <project_vertex>','#include <project_vertex>\nvEdge=aEdge;vSea=aSea;vPondXZ=(modelMatrix*vec4(transformed,1.)).xz;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
uniform float uWaterTime,uWaterDetail;uniform vec3 uWaterNight;uniform vec4 uPondRip[${POND_RIPPLES}];varying float vEdge,vSea;varying vec2 vPondXZ;`)
   .replace('#include <map_fragment>',`
#ifdef USE_MAP
 {vec2 rUv=vPondXZ*${SEA_RIPPLE_PER_M.toFixed(6)};float rp=texture2D(map,rUv+uWaterTime*vec2(.014,.006)).r;
  if(uWaterDetail>1.5)rp=max(rp,texture2D(map,vec2(rUv.y,-rUv.x)*1.37+uWaterTime*vec2(-.008,.012)).g);
  diffuseColor.rgb*=mix(vec3(.95),mix(${SEA_GLSL.rippleTint},vec3(1.),rp),.5);}
#endif`)
   .replace('#include <color_fragment>',`#include <color_fragment>
{float dd=vSea,e=smoothstep(0.,1.,vEdge);
 vec3 shallowC=mix(${SEA_GLSL.lagoon},${SEA_GLSL.aqua},smoothstep(.3,5.,dd));diffuseColor.rgb=mix(diffuseColor.rgb,shallowC,(1.-smoothstep(3.,24.,dd))*.85);
 diffuseColor.rgb=mix(diffuseColor.rgb,${SEA_GLSL.deep},smoothstep(25.,110.,dd)*.55);
 diffuseColor.rgb=mix(vec3(.5,.62,.52),diffuseColor.rgb,e)*uWaterNight;diffuseColor.a*=mix(.18,1.,e)*mix(.6,1.,smoothstep(2.,18.,dd));}`)
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
{vec2 p=vPondXZ;float t=uWaterTime;
 vec2 g=vec2(cos(p.x*1.7+p.y*.6+t*1.9),cos(p.y*1.9-p.x*.5+t*1.6))*.06+vec2(cos(p.x*3.9-p.y*2.3-t*2.7),cos(p.y*3.4+p.x*2.1-t*2.4))*.03;
 for(int i=0;i<${POND_RIPPLES};i++){vec4 r=uPondRip[i];float age=t-r.z;if(r.w>0.&&age>0.&&age<${POND_RING.life.toFixed(1)}){vec2 d=p-r.xy;float l=length(d)+1e-3,front=age*${POND_RING.speed.toFixed(1)};
  float k=r.w*(1.-age/${POND_RING.life.toFixed(1)})*exp(-abs(l-front)*2.6);g+=d/l*cos((l-front)*9.)*k*.5;}}
 g*=smoothstep(0.,.5,vEdge);normal=normalize(normal+(viewMatrix*vec4(g.x,0.,g.y,0.)).xyz);}`)
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
{float fr=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);totalEmissiveRadiance+=vec3(.42,.6,.72)*fr*.3*uWaterNight*smoothstep(0.,.6,vEdge);}`);
 };
 m.customProgramCacheKey=()=>'park-pond-water-v2-sea';
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
