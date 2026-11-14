/**
 * Shops and machines that light up at night (owner request, Nov 13 2026: "at night the Konbini, its vending machines and its gashapon
 * machines all look dark"). Emissive only: no light, no texture, no new draw call, no per-frame work.
 *
 * One shared night factor drives everything: STADIUM_NIGHT (lib/town/stadiumNight.ts), the 0 → 1 night blend fieldLighting.ts
 * already writes for the island pitches and the stadium (0 by day and at sunset, 1 at full night, eased between). Each shader reads
 * it as a uniform, so a frame costs nothing beyond that one shared value.
 *
 *  - The town's paint batches (world.ts): a piece marked with `markMachineGlow` (the Konbini windows, doors, shelves, stripe band
 *    and fascia, the gashapon front panels) carries its glow weight in the uv slot the plain paint never uses (the island wind's
 *    trees use the same slot with a NEGATIVE flag, islandWind.ts SWAY_FLAG): uv = (weight, flag). The patch adds emission
 *    = weight × night × (the piece's own colour, or a warm interior white for flag 2000). Unmarked pieces (uv 0, 0) add nothing.
 *    Same batches, same material count: the pieces stay in the chunk they were in.
 *  - The vending machines (vendingMachines.ts): the printed face (glass, LED, coin panel) brightens and the cabinet gets a soft
 *    self-light, as a real machine's lit front does at night.
 *  - The gashapon globes (gashaponMesh.ts glass): a soft warm glow, a little more opaque at night so the lit dome reads.
 */
import type * as T from 'three';
import {STADIUM_NIGHT} from '../town/stadiumNight';

/** uv.y flags (the island wind uses −1000): 1000 = glow in the piece's own colour, 2000 = glow warm white (a lit interior). */
export const MACHINE_GLOW_FLAG=1000,MACHINE_GLOW_WARM_FLAG=2000;
/** The warm interior white (linear) and how strongly each kind of machine glows at full night. */
export const MACHINE_GLOW={warm:[1,.82,.58],vendingFace:.3,vendingCabinet:.32,gashaGlass:.5,gashaGlassOpacity:.48} as const;
/** The shared night factor (0 by day): the same object every patch binds as its uniform. */
export const MACHINE_NIGHT=STADIUM_NIGHT;

/** Mark a world-space piece (with a uv attribute) as glowing at night, `weight` 0…1; warm: a lit-interior white, else its own colour. */
export function markMachineGlow(g:T.BufferGeometry,weight:number,warm=false){
 const uv=g.getAttribute('uv');if(!uv)return;const flag=warm?MACHINE_GLOW_WARM_FLAG:MACHINE_GLOW_FLAG;
 for(let i=0;i<uv.count;i++)uv.setXY(i,weight,flag);uv.needsUpdate=true;
}
const f=(n:number)=>n.toFixed(3);
/** Chain a patch onto a material's existing onBeforeCompile / cache key (the island wind's, for the paint). */
function chain(m:T.Material,key:string,fn:(s:T.WebGLProgramParametersWithUniforms)=>void){
 if(m.userData.machineGlow)return m;m.userData.machineGlow=key;
 const previous=m.onBeforeCompile,previousKey=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=(s,r)=>{previous.call(m,s,r);s.uniforms.uMachineNight=MACHINE_NIGHT;fn(s);};
 m.customProgramCacheKey=()=>previousKey()+'|'+key;return m;
}
/** The merged chunks' plain paint (world.ts): marked vertices glow with the night factor. */
export function patchMachineGlowPaint<M extends T.Material>(m:M):M{
 const [r,g,b]=MACHINE_GLOW.warm;
 return chain(m,'machine-glow-paint-v1',s=>{
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vMachineGlow;')
   .replace('#include <begin_vertex>',`#include <begin_vertex>\nvMachineGlow=uv.y>${f(MACHINE_GLOW_FLAG/2)}?vec2(uv.x,uv.y>${f((MACHINE_GLOW_FLAG+MACHINE_GLOW_WARM_FLAG)/2)}?1.:0.):vec2(0.);`);
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vMachineGlow;uniform float uMachineNight;')
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>\nif(vMachineGlow.x>0.&&uMachineNight>0.)totalEmissiveRadiance+=mix(diffuseColor.rgb,vec3(${f(r)},${f(g)},${f(b)}),vMachineGlow.y)*vMachineGlow.x*uMachineNight;`);
 }) as M;
}
/** The vending machines' shared material: `faceTest` is the GLSL condition its printed-face patch already uses. */
export function patchVendingNight<M extends T.Material>(m:M,faceTest:string):M{
 return chain(m,'vending-night-v1',s=>{
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform float uMachineNight;')
   .replace('#include <tonemapping_fragment>',`if(uMachineNight>0.){
 #ifdef USE_MAP
 if(${faceTest})gl_FragColor.rgb*=1.+${f(MACHINE_GLOW.vendingFace)}*uMachineNight;else
 #endif
 gl_FragColor.rgb+=diffuseColor.rgb*${f(MACHINE_GLOW.vendingCabinet)}*uMachineNight;}
#include <tonemapping_fragment>`);
 }) as M;
}
/** The gashapon globes' shared glass: a soft warm glow and a little more body at night. */
export function patchGashaGlassNight<M extends T.Material>(m:M):M{
 const [r,g,b]=MACHINE_GLOW.warm;
 return chain(m,'gasha-glass-night-v1',s=>{
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform float uMachineNight;')
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(${f(r)},${f(g)},${f(b)})*${f(MACHINE_GLOW.gashaGlass)}*uMachineNight;\ndiffuseColor.a=mix(diffuseColor.a,max(diffuseColor.a,${f(MACHINE_GLOW.gashaGlassOpacity)}),uMachineNight);`);
 }) as M;
}
