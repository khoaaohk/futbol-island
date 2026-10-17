import * as T from 'three';
import {effectiveTier,subscribeHeatTier} from './heatTier';

/**
 * Ground detail (Oct 17 2026): the island's lawn, sand and land no longer read as one flat colour. No texture is uploaded and nothing
 * runs per frame: the material's fragment shader multiplies the diffuse colour by
 *  (1) a low-frequency "mottle": 3 sine harmonics of the WORLD x/z (fixed constants, so every device and every frame agrees, and a
 *      batched or unbatched mesh looks the same), 1 ± amp (grass ±12 %, mixed Summit ground ±9.5 %, sand and sand-coloured paths ±9 %, land ±5 %; raised Oct 17 2026 so it reads from the phone follow camera) with a slight
 *      warm drift where it is brighter; the main island's sand also darkens toward the waterline from its world height (-0.11..-0.30 m);
 *  (2) a fine grain: one hash per 0.29 m world cell, ±(grain/2). The grain is skipped by a uniform branch at heat tiers 3 and 4 and in
 *      Battery saver (effectiveTier() is 4 then); it stays on at tiers 0-2.
 * Cost per fragment: mottle = 4 sin + ~14 ALU, grain = 1 sin + ~8 ALU (skipped when off), +1 varying vec3, +1 shared uniform
 * (uGroundGrain). The vertex shader adds one matrix*vec4. Documented in docs/performance-guide.md ("Ground detail").
 */
export type GroundKind='grass'|'sand'|'path'|'land'|'mixed';
export const GROUND_TINT:Record<GroundKind,{amp:number;grain:number;wet:boolean}>={
 grass:{amp:.12,grain:.14,wet:false},
 sand:{amp:.09,grain:.16,wet:true},
 /** Sand-coloured paths, promenades and plazas: exactly the sand's mottle and grain (no waterline term), colour nudged toward the sand. */
 path:{amp:.09,grain:.16,wet:false},
 /** The land base is the visible inner beach band (user Oct 17 2026: "inner sand still different"): exactly the sand's mottle and grain, no waterline term. */
 land:{amp:.09,grain:.16,wet:false},
 mixed:{amp:.095,grain:.09,wet:false},
};
/** Shared by every ground material: 1 = grain on, 0 = off (tiers 3-4, Battery saver). */
export const GROUND_GRAIN={value:1};
export const GROUND_GRAIN_OFF_TIER=3;
const syncGrain=()=>{GROUND_GRAIN.value=effectiveTier()>=GROUND_GRAIN_OFF_TIER?0:1;};
let subscribed=false;
function ensureSubscribed(){if(subscribed)return;subscribed=true;syncGrain();subscribeHeatTier(syncGrain);}

/** The mottle noise in -1..1 (the shader's `groundMottle`, kept in step by tests/ground-detail.cjs). */
export function groundMottle(x:number,z:number){
 return Math.sin(x*.31+Math.sin(z*.23)*1.3)*.4+Math.sin(z*.47-x*.29+1.7)*.3+Math.sin(x*.83+z*.71+.9)*.3;
}
/** Brightness factor for a ground kind at world x/z: always within 1 ± GROUND_TINT[kind].amp (within 1 ± amp). */
export const groundTintFactor=(x:number,z:number,kind:GroundKind)=>1+GROUND_TINT[kind].amp*groundMottle(x,z);

export const GROUND_TINT_GLSL=`float groundMottle(vec2 q){return sin(q.x*.31+sin(q.y*.23)*1.3)*.4+sin(q.y*.47-q.x*.29+1.7)*.3+sin(q.x*.83+q.y*.71+.9)*.3;}`;

export function applyGroundTint<M extends T.MeshStandardMaterial>(material:M,kind:GroundKind):M{
 ensureSubscribed();
 const {amp,grain,wet}=GROUND_TINT[kind],f=(v:number)=>v.toFixed(3);
 material.customProgramCacheKey=()=>'ground-tint-'+kind;
 material.onBeforeCompile=sh=>{
  sh.uniforms.uGroundGrain=GROUND_GRAIN;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGT;')
   .replace('#include <project_vertex>','#include <project_vertex>\nvGT=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 vGT;uniform float uGroundGrain;\n${GROUND_TINT_GLSL}`)
   .replace('#include <color_fragment>',`#include <color_fragment>
{float n=groundMottle(vGT.xz),w=max(n,0.);diffuseColor.rgb*=(1.+${f(amp)}*n)*vec3(1.+${f(amp*.5)}*w,1.,1.-${f(amp*.8)}*w);
${wet?'float wt=smoothstep(-.11,-.30,vGT.y);diffuseColor.rgb*=vec3(1.-.14*wt,1.-.12*wt,1.-.08*wt);':''}
${grain>0?`if(uGroundGrain>0.){float g=fract(sin(dot(floor(vGT.xz*3.5),vec2(12.9898,78.233)))*43758.5453);diffuseColor.rgb*=1.+${f(grain)}*uGroundGrain*(g-.5);}`:''}}`);
 };
 return material;
}

/** The beach sand colour ('#f1d6a1', fields.ts / coralCayWorld.ts); a path's cream is nudged this far toward it so the paving continues the sand. */
export const SAND_COLOR='#f1d6a1',PATH_SAND_MIX=0;// was .08: a tinted path then differed from untinted paving laid on it (roundabout-junctions coplanar check)
const tinted=new WeakMap<T.Material,Map<GroundKind,T.MeshStandardMaterial>>();
/** Give a mesh its own tinted clone of its (possibly cached and shared) material, so nothing else of that colour is tinted. */
export function tintGroundMesh(mesh:T.Mesh,kind:GroundKind){
 const source=mesh.material as T.MeshStandardMaterial;let byKind=tinted.get(source);if(!byKind){byKind=new Map();tinted.set(source,byKind);}
 let m=byKind.get(kind);if(!m){m=applyGroundTint(source.clone(),kind);if(kind==='path')m.color.lerp(new T.Color(SAND_COLOR),PATH_SAND_MIX);byKind.set(kind,m);}
 mesh.material=m;return mesh;
}
