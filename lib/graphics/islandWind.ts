/**
 * Island wind (Nov 8 2026, owner: "make the island feel more alive without adding more heat ... trees moving"): a gentle shared
 * vertex-shader sway for the main island's trees, palms and bushes (inside the merged static chunks, lib/town/world.ts) and the
 * grass tufts of the ground decals (groundDecals.ts, every island). No new mesh, material, draw call, light or texture: the hook
 * patches materials that already exist, and per-vertex sway weights ride in the plain-paint chunks' UV slot (those materials have
 * no map, so the UVs were unused), flagged with SWAY_FLAG so nothing else moves.
 *
 * Motion (world space, so it needs no per-tree data): a slow two-sine sway with a phase from each vertex's position, a broad gust
 * wave rolling across the island, and a small quick leaf flutter near the tips; weight 0 at the base rising to 1 at the top, so
 * trunks bend and canopies never come apart. Amplitude ≤ ~0.2 m at the top of a 6 m palm.
 *
 * Heat: one sin-heavy branch per patched vertex (a few hundred thousand vertices at most, only of chunks the view gate draws); the
 * clock advances from world.updateWater (the frames that already render), and the amplitude eases to 0 and the clock stops under
 * reduced motion, heat tiers 2-3 static ambience, and a slow governor (the same `still` flag as the water). CPU: two uniforms.
 */
import * as T from 'three';

/** UV.y value marking a swaying vertex (UV.x = its weight 0..1). Far outside any real UV (primitive 0..1, extrude shape coords). */
export const SWAY_FLAG=-1000;
/** Sway amplitude (m at weight 1) by prop kind; kinds not listed stay still. */
export const WIND_SWAY_KINDS:Readonly<Record<string,number>>={palm:1,tree:.6,bush:.35};
/** Shared uniforms: clock (s, wrapped) and the eased amplitude (m). */
export const ISLAND_WIND={uWindT:{value:0},uWindAmp:{value:0}};
export const WIND_AMP=.16,WIND_WRAP=628.3185307;
const KEY='island-wind-v1';

/** Advance the wind (world.updateWater, every rendered frame). `still`: reduced motion / static ambience / slow governor. */
export function stepIslandWind(dt:number,still:boolean){
 if(!(dt>0))return;const d=Math.min(dt,.1),target=still?0:WIND_AMP,a=ISLAND_WIND.uWindAmp;
 a.value+=(target-a.value)*(1-Math.exp(-d*1.5));if(still&&a.value<.002)a.value=0;
 if(a.value>0)ISLAND_WIND.uWindT.value=(ISLAND_WIND.uWindT.value+d)%WIND_WRAP;
}

/** Mark one prop piece (a world-space geometry with a uv attribute) as swaying: weight ((y - base) / height)² × amp per vertex. */
export function markSway(g:T.BufferGeometry,baseY:number,height:number,amp:number){
 const p=g.getAttribute('position'),uv=g.getAttribute('uv');if(!p||!uv)return;const h=Math.max(.5,height);
 for(let i=0;i<p.count;i++){const k=Math.max(0,Math.min(1,(p.getY(i)-baseY)/h));uv.setXY(i,k*k*amp,SWAY_FLAG);}
 uv.needsUpdate=true;
}

const GLSL=`uniform float uWindT;uniform float uWindAmp;
vec3 islandWind(vec3 p,float w){float t=uWindT;
 float g=.55+.45*sin(dot(p.xz,vec2(.045,.03))-t*.55);g*=g;
 float ph=p.x*.21+p.z*.17;float s=sin(t*1.25+ph)*.7+sin(t*2.3+ph*1.7)*.3;
 float fl=sin(t*7.3+p.x*2.1+p.y*3.3+p.z*1.7)*.18*w;
 float a=uWindAmp*w*(s*.55+g*.75+fl);return vec3(.83*a,-abs(a)*.12,.56*a);}`;
function project(weight:string){return `vec4 mvPosition=vec4(transformed,1.0);
#ifdef USE_BATCHING
mvPosition=batchingMatrix*mvPosition;
#endif
#ifdef USE_INSTANCING
mvPosition=instanceMatrix*mvPosition;
#endif
{float iwW=${weight};if(iwW>0.&&uWindAmp>0.)mvPosition.xyz+=islandWind((modelMatrix*mvPosition).xyz,iwW);}
mvPosition=modelViewMatrix*mvPosition;
gl_Position=projectionMatrix*mvPosition;`;}
function patch(m:T.Material,weight:string,key:string){
 if(m.userData.islandWind)return m;m.userData.islandWind=true;
 m.onBeforeCompile=s=>{s.uniforms.uWindT=ISLAND_WIND.uWindT;s.uniforms.uWindAmp=ISLAND_WIND.uWindAmp;
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\n'+GLSL).replace('#include <project_vertex>',project(weight));};
 m.customProgramCacheKey=()=>key;return m;
}
/** The merged chunks' plain-paint material (world.ts): only SWAY_FLAG-marked vertices move. Chunks sit at the origin unrotated. */
export const patchIslandWind=(m:T.Material)=>patch(m,`uv.y<${SWAY_FLAG/2}.?uv.x:0.`,KEY+'-paint');
/** Grass tufts (groundDecals.ts): blade tips (model y = 1) move, roots stay; a little less than the trees. */
export const patchTuftWind=(m:T.Material)=>patch(m,'position.y*.45',KEY+'-tuft');
