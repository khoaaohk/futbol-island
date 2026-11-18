import * as T from 'three';
import {effectiveTier,subscribeHeatTier} from './heatTier';
import {gfxFlag} from './gfxFlags';
import {sunHighlightGlsl,ggxA2} from './sunHighlight';
import {STADIUM,STADIUM_PLAZA} from '../town/westParkLayout';

/**
 * Ground detail (Oct 17 2026; detail tile and surface kinds Nov 17 2026): the island's lawn, sand and land do not read as one flat
 * colour. Nothing runs per frame: the material's fragment shader multiplies the diffuse colour by
 *  (1) a low-frequency "mottle": 3 sine harmonics of the WORLD x/z (fixed constants, so every device and every frame agrees, and a
 *      batched or unbatched mesh looks the same), 1 ± amp (grass ±12 %, mixed Summit ground ±9.5 %, sand and sand-coloured paths ±9 %, land ±5 %; raised Oct 17 2026 so it reads from the phone follow camera) with a slight
 *      warm drift where it is brighter; sloped sand also darkens toward the waterline from its world height (-0.11..-0.30 m);
 *  (2) a fine detail TILE (Nov 17 2026, plan T4): ONE read of a tileable 64x64 RGBA noise (groundTileData: R clumps, G wind ripples,
 *      B speckle, A broad blotches; 16 KB, mipmapped so it fades to its mean with distance instead of shimmering). It replaces the
 *      one-hash-per-0.29 m grain, which could not be filtered and was therefore switched off from heat tier 1: a warm phone showed
 *      flat lawns. The tile stays on at tiers 0-2 and is skipped by a uniform branch at tiers 3-4 and in Battery saver;
 *  (3) drifting cloud shade (Nov 10 2026), tier 0 only, as before;
 *  (4) what the surface is (plan T5 / T3 notes), inside the same draw: slab joints and a per-slab tone on the stadium plaza and
 *      concourse (world-space rectangles, `path` kind), a worn edging line and a noise-broken blend into the lawn along the park
 *      trails (`trail` kind, a per-vertex edge attribute), a wet band with a noise-broken edge and a wet sheen along the main
 *      island's beach (`beach` kind, a per-vertex inland distance).
 * Lighting: three's LAMBERT program + the GGX sun highlight (see GROUND_SUN below), not the physical light loop.
 * Cost per fragment: pinned for every kind and tier by tests/ground-shader-cost.cjs (whole program). No new draw, mesh or program;
 * one 64x64 texture. Documented in docs/performance-guide.md ("Ground detail", "Nov 17 2026: terrain and surfaces").
 */
export type GroundKind='grass'|'sand'|'beach'|'path'|'trail'|'land'|'mixed'|'asphalt';
export const GROUND_TINT:Record<GroundKind,{amp:number;grain:number;wet:boolean}>={
 // Nov 10 2026: grain .14/.16/.09 -> .09/.11/.07 with a rotated cell (the axis-aligned 0.29 m cells read as a pixel checkerboard).
 grass:{amp:.12,grain:.09,wet:false},
 sand:{amp:.09,grain:.11,wet:true},
 /** The main island's beach ribbon (fields.ts): the sand's look, with the wet band driven by the ribbon's per-vertex inland distance. */
 beach:{amp:.09,grain:.11,wet:false},
 /** Sand-coloured paths, promenades and plazas: exactly the sand's mottle and grain (no waterline term), colour nudged toward the sand. */
 path:{amp:.09,grain:.11,wet:false},
 /** Stadium Park trails (westPark.ts): the path's look plus the edge treatment. */
 trail:{amp:.09,grain:.11,wet:false},
 /** The land base is the visible inner beach band (user Oct 17 2026: "inner sand still different"): exactly the sand's mottle and grain, no waterline term. */
 land:{amp:.09,grain:.11,wet:false},
 mixed:{amp:.095,grain:.07,wet:false},
 /** Carriageways (Nov 10 2026): a faint patchy wear and fine aggregate, so the roads are not one flat grey. */
 asphalt:{amp:.06,grain:.07,wet:false},
};
/** Shared by every ground material: 1 = cloud shade on, 0 = off (tiers 1-4, Battery saver). Heat offsets Oct 19 2026: off from tier 1
 * (was 3). Until Nov 17 2026 this also carried the hash grain; the detail tile (GROUND_DETAIL) replaced it. */
export const GROUND_GRAIN={value:1};
export const GROUND_GRAIN_OFF_TIER=1;
/** The detail tile's switch: 1 at tiers 0-2, 0 at tiers 3-4 and in Battery saver (effectiveTier() is 4 then): no texture read at all there. */
export const GROUND_DETAIL={value:1};
export const GROUND_DETAIL_OFF_TIER=3;
/** Cloud shadows (Nov 10 2026): seconds for the slow drift, wrapped at the pattern's period (2*PI/0.02 s) so it never jumps.
 *  Advanced from the island's existing water step (stepWaterTime, rendered frames only) at most 10 times a second; frozen when the water is still. */
export const GROUND_TIME={value:0};
export const GROUND_TIME_WRAP=Math.PI*2/.02;
let groundTimeAcc=0;
export function stepGroundTime(dt:number,still:boolean){if(still||!(dt>0))return;groundTimeAcc+=Math.min(dt,.1);if(groundTimeAcc<.1)return;GROUND_TIME.value=(GROUND_TIME.value+groundTimeAcc)%GROUND_TIME_WRAP;groundTimeAcc=0;}
const syncGrain=()=>{GROUND_GRAIN.value=effectiveTier()>=GROUND_GRAIN_OFF_TIER?0:1;GROUND_DETAIL.value=effectiveTier()>=GROUND_DETAIL_OFF_TIER?0:1;};
let subscribed=false;
function ensureSubscribed(){if(subscribed)return;subscribed=true;syncGrain();subscribeHeatTier(syncGrain);}

/** The mottle noise in -1..1 (the shader's `groundMottle`, kept in step by tests/ground-detail.cjs). */
export function groundMottle(x:number,z:number){
 return Math.sin(x*.31+Math.sin(z*.23)*1.3)*.4+Math.sin(z*.47-x*.29+1.7)*.3+Math.sin(x*.83+z*.71+.9)*.3;
}
/** Brightness factor for a ground kind at world x/z: always within 1 ± GROUND_TINT[kind].amp (within 1 ± amp). */
export const groundTintFactor=(x:number,z:number,kind:GroundKind)=>1+GROUND_TINT[kind].amp*groundMottle(x,z);

export const GROUND_TINT_GLSL=`float groundMottle(vec2 q){return sin(q.x*.31+sin(q.y*.23)*1.3)*.4+sin(q.y*.47-q.x*.29+1.7)*.3+sin(q.x*.83+q.y*.71+.9)*.3;}`;

// ---- The detail tile -------------------------------------------------------------------------------------------------------------
/** Texels per side, and the tile's size on the ground (m): 10 cm texels, about two screen pixels near the player from the follow camera. */
export const GROUND_TILE={size:64,metres:6.4} as const;
/** Tileable value noise, period `n` texels, `cell` texels per lattice step (n % cell === 0), deterministic from `seed`. */
function tileNoise(n:number,cell:number,seed:number){
 const g=n/cell,lat=new Float32Array(g*g),out=new Float32Array(n*n);let s=seed|0;
 for(let i=0;i<lat.length;i++){s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;lat[i]=((t^t>>>14)>>>0)/4294967296;}
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),jx=(ix+1)%g,jy=(iy+1)%g;
  out[y*n+x]=(lat[iy*g+ix]*(1-sx)+lat[iy*g+jx]*sx)*(1-sy)+(lat[jy*g+ix]*(1-sx)+lat[jy*g+jx]*sx)*sy;}
 return out;
}
/**
 * The 64x64 RGBA8 detail tile, built once on the CPU (about 1 ms), seamless on both axes. Every channel is shifted to a mean of
 * exactly .5, and the shader only ever uses (value - .5): at a distance the mip chain averages the tile to .5 and the detail fades
 * to nothing by itself (no shimmer, no visible repeat from the jetpack).
 *  R clumps: 2-texel and 8-texel noise (grass tufts, the fine grain of sand and paving)
 *  G wind ripples: 8 warped stripes per tile (0.8 m apart), for sand
 *  B speckle: sparse 2-texel dots (pebbles, aggregate, clover flecks)
 *  A blotches: 16- and 8-texel noise (the broken edges of the wet band and of the trail verges)
 */
export function groundTileData(){
 const n=GROUND_TILE.size,a=tileNoise(n,2,11),b=tileNoise(n,8,23),w=tileNoise(n,16,37),c=tileNoise(n,2,53),d=tileNoise(n,16,71),e=tileNoise(n,8,89),ch=[new Float32Array(n*n),new Float32Array(n*n),new Float32Array(n*n),new Float32Array(n*n)];
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x;
  ch[0][i]=a[i]*.55+b[i]*.45;
  ch[1][i]=.5+.5*Math.sin((y+(w[i]-.5)*9)*Math.PI*2*8/n)*(.55+.45*b[i]);
  ch[2][i]=Math.min(1,Math.max(0,(c[i]-.74)/.16));
  ch[3][i]=d[i]*.6+e[i]*.4;}
 const data=new Uint8Array(n*n*4);
 ch.forEach((f,k)=>{let mean=0;for(let i=0;i<f.length;i++)mean+=f[i];mean/=f.length;
  // two passes: clamping after the shift moves the mean a little, the second shift takes that out
  let shift=.5-mean;for(let pass=0;pass<3;pass++){let m=0;for(let i=0;i<f.length;i++)m+=Math.min(1,Math.max(0,f[i]+shift));shift+=.5-m/f.length;}
  for(let i=0;i<f.length;i++)data[i*4+k]=Math.round(Math.min(1,Math.max(0,f[i]+shift))*255);});
 return data;
}
/** Shared by every ground material (one texture for the whole island). Created on first use; lives as long as the page, like the water tiles. */
const GROUND_TILE_UNIFORM:{value:T.Texture|null}={value:null};
function groundTile(){
 if(!GROUND_TILE_UNIFORM.value){const t=new T.DataTexture(groundTileData(),GROUND_TILE.size,GROUND_TILE.size,T.RGBAFormat);t.name='ground-detail-tile';
  t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;GROUND_TILE_UNIFORM.value=t;}
 return GROUND_TILE_UNIFORM;
}
/** How each kind reads the tile: brightness weights for (R clumps, G ripples, B speckle), scaled by the kind's `grain`. */
export const GROUND_DETAIL_MIX:Record<GroundKind,readonly [number,number,number]>={
 grass:[2.2,0,.5],sand:[.5,1.3,1],beach:[.5,1.3,1],land:[.5,1.3,1],path:[1.1,0,1],trail:[1.1,0,1],mixed:[2,0,.6],asphalt:[.9,0,1.6]};

// ---- What the surface is ---------------------------------------------------------------------------------------------------------
/** Slab joints (plan T5): the stadium plaza (with the gate's walk-in) and the pitch-level concourse inside the bowl. World-space
 *  rectangles {centre x, centre z, half width, half depth}; `path` pieces inside them show 2.4 m slabs. Everything else is untouched. */
export const GROUND_SLAB={size:2.4,joint:.03,rects:[
 [(STADIUM.x+40+-50.7)/2,STADIUM_PLAZA.minZ/2+STADIUM_PLAZA.maxZ/2,(-50.7-(STADIUM.x+40))/2,(STADIUM_PLAZA.maxZ-STADIUM_PLAZA.minZ)/2],
 [STADIUM.x,STADIUM.z,40,57.5],
] as readonly (readonly [number,number,number,number])[]} as const;
/** The beach's wet band (m inland of the sand ribbon's outline; the still waterline is about 1.1 m seaward of it and the moving shore
 *  strip covers the first metre or so): fully wet below `from`, dry above `to`, the edge moved ±0.75 m by the tile's blotches (a
 *  straight edge at tiers 3-4, where the tile is not read). Darkening as the old waterline term, a little stronger, plus a wet sheen. */
export const BEACH_WET={from:1.4,to:3.1,noise:1.5,dark:[.2,.17,.11],a2:.14,f0:.065} as const;
/** The trail verge (m from the ribbon's edge): the paving breaks into the lawn over `blend`, with a worn edging line at `line`. */
export const TRAIL_EDGE={blend:.42,noise:.5,line:.62,lineWidth:.16,lineDark:.07} as const;
/** The lawn's colour under the trails (shoreline.ts INTERIOR_GRASS_COLOR), for the verge blend. */
const LAWN_COLOR='#6e9678';

/**
 * Ground lighting without three's PBR path (Nov 17 2026, docs/graphics/island-graphics-plan-nov17.md T2). Ground is roughness .85-1,
 * metalness 0, no environment map: of the whole physical light loop only two things reach the picture, the Lambert diffuse and a faint
 * broad sun highlight (strongest looking toward a low sun). The ground program is therefore built from three's LAMBERT shader source
 * (same diffuse, hemisphere, shadow, fog and tone code) plus lib/graphics/sunHighlight.ts: the same GGX sun highlight three computed
 * (D, Smith V, Schlick F with F0 .04), for the one sun, with the material's roughness as a uniform. What is gone: the roughness-from-normal-
 * derivative clamp, the PhysicalMaterial set-up and the indirect-specular / multiscatter maths that multiplied a zero environment.
 * The material object stays a MeshStandardMaterial (callers, clones and the paint batch keep working); only its shader source
 * changes, inside onBeforeCompile. `?gfx=pbr-ground` on a dev build keeps the old program for side-by-side shots.
 * Estimated cost (tests/ground-shader-cost.cjs, whole fragment program): see the table that test prints.
 */
export const GROUND_SUN_GLSL=sunHighlightGlsl('uGroundA2','.04');
const f=(v:number)=>v.toFixed(3);
const lin=(hex:string)=>{const c=new T.Color(hex);return `vec3(${c.r.toFixed(4)},${c.g.toFixed(4)},${c.b.toFixed(4)})`;};

export function applyGroundTint<M extends T.MeshStandardMaterial>(material:M,kind:GroundKind):M{
 ensureSubscribed();
 const {amp,grain,wet}=GROUND_TINT[kind],[mr,mg,mb]=GROUND_DETAIL_MIX[kind];
 const pbr=gfxFlag('pbr-ground'),beach=kind==='beach',trail=kind==='trail';
 material.customProgramCacheKey=()=>'ground-tint-'+kind+(pbr?'-pbr':'');
 const extraVary=beach?'varying float vShore;':trail?'varying vec3 vVerge;':'';
 const detail=[mr?`${f(grain*mr)}*(gt.r-.5)`:'',mg?`${f(grain*mg)}*(gt.g-.5)`:'',mb?`${f(grain*mb)}*(gt.b-.5)`:''].filter(Boolean).join('+');
 const B=BEACH_WET,E=TRAIL_EDGE,S=GROUND_SLAB;
 material.onBeforeCompile=sh=>{
  sh.uniforms.uGroundGrain=GROUND_GRAIN;sh.uniforms.uGroundTime=GROUND_TIME;sh.uniforms.uGroundDetail=GROUND_DETAIL;sh.uniforms.uGroundTile=groundTile();
  if(!pbr){sh.uniforms.uGroundA2={value:ggxA2(material.roughness)};sh.vertexShader=T.ShaderLib.lambert.vertexShader;
   sh.fragmentShader=T.ShaderLib.lambert.fragmentShader.replace('#include <common>','#include <common>\nuniform float uGroundA2;')
    .replace('#include <lights_fragment_end>','#include <lights_fragment_end>'+(beach?sunHighlightGlsl(`mix(uGroundA2,${f(B.a2)},gWet)`,`mix(.04,${f(B.f0)},gWet)`):GROUND_SUN_GLSL));}
  sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>\nvarying vec3 vGT;${beach?'attribute float aShore;':trail?'attribute vec3 aVerge;':''}${extraVary}`)
   .replace('#include <project_vertex>',`#include <project_vertex>\nvGT=(modelMatrix*vec4(transformed,1.)).xyz;${beach?'vShore=aShore;':trail?'vVerge=aVerge;':''}`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 vGT;${extraVary}uniform float uGroundGrain,uGroundTime,uGroundDetail;uniform sampler2D uGroundTile;\n${GROUND_TINT_GLSL}`)
   .replace('#include <color_fragment>',`#include <color_fragment>
float gWet=0.;
{float n=groundMottle(vGT.xz),w=max(n,0.);diffuseColor.rgb*=(1.+${f(amp)}*n)*vec3(1.+${f(amp*.5)}*w,1.,1.-${f(amp*.8)}*w);
${kind==='grass'?'diffuseColor.rgb*=mix(vec3(.94,.99,1.03),vec3(1.07,1.05,.9),.5+.5*n);':''}
vec4 gt=vec4(.5);
if(uGroundDetail>0.){gt=texture2D(uGroundTile,mat2(.83,.56,-.56,.83)*vGT.xz*${(1/GROUND_TILE.metres).toFixed(5)}+n*.11);
 ${kind==='grass'?`float gd=${detail};diffuseColor.rgb*=vec3(1.+gd*.8,1.+gd,1.+gd*.45);`:`diffuseColor.rgb*=1.+${detail};`}}
${wet?'float wt=smoothstep(-.11,-.30,vGT.y);diffuseColor.rgb*=vec3(1.-.14*wt,1.-.12*wt,1.-.08*wt);':''}
${beach?`gWet=1.-smoothstep(${f(B.from)},${f(B.to)},vShore+(gt.a-.5)*${f(B.noise)}+(gt.r-.5)*.3);diffuseColor.rgb*=vec3(1.-${f(B.dark[0])}*gWet,1.-${f(B.dark[1])}*gWet,1.-${f(B.dark[2])}*gWet);`:''}
${trail?`{float ed=vVerge.y>.01?vVerge.y-abs(vVerge.x):9.;if(ed<1.){float ek=smoothstep(.02,${f(E.blend)},ed+(gt.a-.5)*${f(E.noise)}+(gt.r-.5)*.2);
 diffuseColor.rgb*=1.-${f(E.lineDark)}*(1.-smoothstep(0.,${f(E.lineWidth)},abs(ed-${f(E.line)})))*ek;
 vec3 lawn=${lin(LAWN_COLOR)}*(1.+.12*n)*vec3(1.+.06*w,1.,1.-.096*w)*mix(vec3(.94,.99,1.03),vec3(1.07,1.05,.9),.5+.5*n);
 diffuseColor.rgb=mix(diffuseColor.rgb,lawn,(1.-ek)*vVerge.z);}}`:''}
${kind==='path'?`{vec2 sa=abs(vGT.xz-vec2(${f(S.rects[0][0])},${f(S.rects[0][1])}))-vec2(${f(S.rects[0][2])},${f(S.rects[0][3])}),sb=abs(vGT.xz-vec2(${f(S.rects[1][0])},${f(S.rects[1][1])}))-vec2(${f(S.rects[1][2])},${f(S.rects[1][3])});
 if(min(max(sa.x,sa.y),max(sb.x,sb.y))<0.){vec2 sp=vGT.xz*${(1/S.size).toFixed(5)},sc=floor(sp),sf=abs(fract(sp)-.5);
  // joint: distance to the nearest slab edge (m), widened to the pixel's footprint on the ground and faded as it goes under a pixel
  // per-slab tone: a low-discrepancy sequence of the slab index (no sin hash), ±2.5 %
  float px=.0011/gl_FragCoord.w,dj=(.5-max(sf.x,sf.y))*${f(S.size)},jl=(1.-smoothstep(0.,max(px,${f(S.joint)})*1.5,dj))*min(1.,${f(S.joint*2)}/px);
  diffuseColor.rgb*=(1.+.05*(fract(dot(sc,vec2(.754877,.569840)))-.5))*(1.-.16*jl);}}`:''}
if(uGroundGrain>0.){vec2 q=vGT.xz;diffuseColor.rgb*=1.-.07*smoothstep(.35,.8,sin(q.x*.013+uGroundTime*.02+sin(q.y*.011)*1.5)*.5+.5);}}`);
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
