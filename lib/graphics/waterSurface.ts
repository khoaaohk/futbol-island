import * as T from 'three';

/**
 * Animated water, shared by the island ocean, the island-wide shoreline (lib/graphics/islandShore.ts) and the fishing shoreline
 * (Oct 12 2026, "animate the water so it's moving and washing ashore", then "tier B" island-wide: docs/performance-guide.md
 * "Island-wide moving water").
 *
 * Stylised, in the existing draws: no render targets per frame, no reflection/refraction, no extra passes. Everything runs off ONE
 * time uniform that only advances when the island renders a frame (world.updateWater, already gated by `active`, reduced motion,
 * the governor's "slow" state and the heat tier's static ambience), so a sleeping or capped island costs nothing more.
 *
 * - The ocean (one plane, island-wide) samples its painted ripple tile once (phones) or twice in two directions and speeds
 *   (desktop), and reads ONE whole-island signed distance-to-shore texture (`uIsleTex`, baked once at load by islandShore.ts):
 *   a sand-to-turquoise-to-teal depth gradient, Animal Crossing-style ripple lines drifting toward every beach, whitecaps close in
 *   and, on desktop only, sun sparkles.
 * - While fishing, a sharper local field round the spot (`uShoreTex` in `uShoreBox`, lib/town/fishing/shoreWater.ts) overrides the
 *   island field inside its box (blended over the box's edge), and the fishing strip takes over from the island strip there.
 *
 * Detail (uniform set by Town each frame, no recompiles): 2 = desktop (two ripple layers, sparkle, swash), 1 = phone (one ripple
 * layer, swash, no sparkle), 0 = the cheap still path (reduced motion, the governor's "slow" state, heat tiers 3–4): one ripple
 * read + the field read, the depth gradient and a soft static foam line; the clock is held too, so the image is static.
 */
export const SWASH_PERIOD=5.6,SWELL_LENGTH=5.5;
/** The clock wraps here: a whole number of swash cycles (625) and of every scroll (all rates are multiples of 1/500 per second), so the wrap never jumps. */
export const WATER_WRAP=3500;
const empty=new T.DataTexture(new Uint8Array([0,0,0,0]),1,1);empty.needsUpdate=true;
export const WATER_UNIFORMS={
 uWaterTime:{value:0},
 /** 0..2, see above. */uWaterDetail:{value:2},
 /** 0..1 strength of the shore effects (fades in/out with a fishing session). */uShore:{value:0},
 uShoreTex:{value:empty as T.Texture},
 /** World rect of the shore texture: minX, minZ, sizeX, sizeZ. */uShoreBox:{value:new T.Vector4(0,0,1,1)},
 /** Direction toward the sun (world). */uSunDir:{value:new T.Vector3(-288,252,198).normalize()},
 /** Whole-island shore field (islandShore.ts), its world rect (minX, minZ, sizeX, sizeZ) and 1 once baked. */
 uIsleTex:{value:empty as T.Texture},uIsleBox:{value:new T.Vector4(0,0,1,1)},uIsle:{value:0},
};
/** Advance the shared water clock. Call once per rendered frame; `still` (reduced motion, static-ambience heat tiers) holds it. */
export function stepWaterTime(dt:number,still:boolean){if(!still&&dt>0)WATER_UNIFORMS.uWaterTime.value=(WATER_UNIFORMS.uWaterTime.value+Math.min(dt,.05))%WATER_WRAP;}
export function setWaterDetail(level:number){WATER_UNIFORMS.uWaterDetail.value=level;}
export function setIsleField(texture:T.Texture|null,box:T.Vector4|null){
 WATER_UNIFORMS.uIsleTex.value=texture??empty;if(box)WATER_UNIFORMS.uIsleBox.value.copy(box);WATER_UNIFORMS.uIsle.value=texture?1:0;
}
export function setShore(texture:T.Texture|null,box:T.Vector4|null,strength:number){
 WATER_UNIFORMS.uShoreTex.value=texture??empty;if(box)WATER_UNIFORMS.uShoreBox.value.copy(box);WATER_UNIFORMS.uShore.value=texture?strength:0;
}

/** GLSL shared by the ocean and the shoreline strip. `shoreSample(xz)` returns (signed distance m, noise, noise, beach 1 / hard edge 0). */
export const SHORE_GLSL=/* glsl */`
uniform float uWaterTime,uWaterDetail,uShore,uIsle;uniform sampler2D uShoreTex,uIsleTex;uniform vec4 uShoreBox,uIsleBox;uniform vec3 uSunDir;
const float SWASH_P=${SWASH_PERIOD.toFixed(2)},SWELL_L=${SWELL_LENGTH.toFixed(2)};
vec4 shoreSample(vec2 xz){return texture2D(uShoreTex,clamp((xz-uShoreBox.xy)/uShoreBox.zw,0.,1.));}
/** 0 outside the box, rising to 1 a little inside it (no hard edge where the box ends). */
float shoreEdge(vec2 xz){vec2 uv=(xz-uShoreBox.xy)/uShoreBox.zw;return smoothstep(0.,.14,min(min(uv.x,uv.y),min(1.-uv.x,1.-uv.y)));}
float waterHash(float n){return fract(sin(n*127.1)*43758.5453);}
/** The whole-island field: (signed distance m, noise, noise, beach). Outside its rect (or before the bake) it reads as open sea. */
vec4 isleSample(vec2 xz){vec2 uv=(xz-uIsleBox.xy)/uIsleBox.zw;vec4 s=texture2D(uIsleTex,clamp(uv,0.,1.));
 float inside=uIsle*smoothstep(0.,.03,min(min(uv.x,uv.y),min(1.-uv.x,1.-uv.y)));return mix(vec4(40.,.5,.5,1.),s,inside);}
/** The field the ocean uses: the island's, with the sharper fishing field blended in over its box while fishing. */
vec4 waterField(vec2 xz){vec4 s=isleSample(xz);if(uShore>0.){float k=uShore*shoreEdge(xz);if(k>0.)s=mix(s,shoreSample(xz),k);}return s;}
/** Swell phase at signed distance d: crests where fract == 0, travelling toward the shore (d decreasing) once per SWASH_P. */
float swellPhase(float d,float alongNoise){return fract(d/SWELL_L+uWaterTime/SWASH_P+alongNoise*.35);}
`;

/** Ground counts as land where it stands above this (m over WATER_Y = −0.42): the ocean plane (−0.43) meets it right there, so the
 *  shore fields' zero line is the waterline actually drawn (Oct 12 2026 seam fix; it was +0.03, 0.2–0.35 m up the slopes). */
export const SHORE_LAND_LIFT=-.008;
/** The waterline drawn on beaches (beach waves, Oct 12 2026): the edge of the flat sand, where the skirt starts sloping into the sea.
 *  Ground counts as sea for it when it is low (under SHORE_VIS_LIFT over the water) and slopes like a skirt (a rise per metre in
 *  SHORE_VIS_SLOPE): the main coast's skirt (0.27 m/m from 0.3 m), Coral Cay's (0.12 from 0.31), the sandbars' (0.16 from 0.37) and
 *  the causeway banks' (0.2 from 0.4). Flat sand stays land however low (West Cove's beach is 0.24 m over the water), and so do rocks.
 *  The island strip paints the skirt as shallow water, and the foam laps from its top. */
export const SHORE_VIS_LIFT=.34,SHORE_VIS_SLOPE=[.07,.45] as const;
/** Ground this high (decks, kerbs, piers, rocks, walls: 0.4 m over the water) is never draped by a shore strip. */
export const SHORE_HIGH=.4;
/** 1 where the ground is not beach: high (decks, kerbs, piers, walls) or steep (rocks and boulders: over 0.45 m rise per metre
 *  to a neighbour). Gentle slopes (the coast's and the cay's skirts, the causeway banks, the pier's armour) stay 0. */
export function shoreRough(lift:Float32Array,n:number,rows:number,cell:number){
 const rough=new Uint8Array(n*rows),at=(x:number,z:number)=>Math.max(0,lift[z*n+x]);
 for(let z=0;z<rows;z++)for(let x=0;x<n;x++){const h=at(x,z);if(h>SHORE_HIGH){rough[z*n+x]=1;continue;}if(h<=.02)continue;
  let rise=0;if(x>0)rise=Math.max(rise,Math.abs(h-at(x-1,z)));if(x<n-1)rise=Math.max(rise,Math.abs(h-at(x+1,z)));if(z>0)rise=Math.max(rise,Math.abs(h-at(x,z-1)));if(z<rows-1)rise=Math.max(rise,Math.abs(h-at(x,z+1)));
  if(rise/cell>.45)rough[z*n+x]=1;}
 return rough;
}
/**
 * Where a shore-strip vertex sits (seam fix, Oct 12 2026). `lift` (height over the water, m), `sdf` (signed distance, + at sea)
 * and `rough` (shoreRough) are n×rows grids; returns [y, lift for the shader, open]. Water: just over the ocean. Beach (sand,
 * gentle slopes): draped 2 cm over it. Rough ground (a deck, a pier, a kerb, a rock): the strip never climbs it (that drew a
 * see-through ramp in front of every deck face and a tent over rocks): round a rock on the sand it stays at the sand's height,
 * anywhere near the water it stays at the water, hidden underneath, and its shader lift is high so its land colour fades out.
 * `open` is 1 where no rough ground is within `reach` cells: only there may the strip be pulled forward and drawn opaque across
 * the waterline (SHORE_PULL_GLSL), so rocks and pier piles keep their own crisp edge in the water instead of being swallowed.
 */
export function shoreDrape(lift:Float32Array,sdf:Float32Array,rough:Uint8Array,n:number,rows:number,x:number,z:number,waterY:number,stripY:number,reach:number):[number,number,number]{
 const k=z*n+x,h=Math.max(0,lift[k]);let low=Infinity,open=1,wet=false,nextToRough=false;
 for(let dz=-reach;dz<=reach;dz++)for(let dx=-reach;dx<=reach;dx++){const xx=x+dx,zz=z+dz;if(xx<0||zz<0||xx>=n||zz>=rows)continue;const i=zz*n+xx,l=Math.max(0,lift[i]);
  if(rough[i])open=0;if(l<=.02)wet=true;if(Math.abs(dx)<=1&&Math.abs(dz)<=1){if(rough[i])nextToRough=true;else low=Math.min(low,l);}}
 if(sdf[k]>0)return [stripY,h,open];
 if(!rough[k])return wet&&nextToRough?[stripY,SHORE_HIGH+.05,0]:[waterY+h+.02,h,open];
 return !wet&&low>.02&&low<=SHORE_HIGH?[waterY+low+.02,low,0]:[stripY,SHORE_HIGH+.05,0];
}
/** Vertex GLSL for the shore strips: pull the strip toward the camera along the view ray (depth only: nothing moves on screen) by
 *  up to 0.3 m at the waterline and 0.15 m up the beach, so ground poking a few cm through the draped strip (slope creases, the
 *  cay's skirt facets) can no longer cut zig-zag teeth into it; the water's own alpha draws the edge instead. Call after
 *  project_vertex with the vertex's signed shore distance and its `open` flag (shoreDrape: 0 near rocks, decks and piers). */
export const SHORE_PULL_GLSL=/* glsl */`
void shorePull(vec4 mv,float d,float open){float k=open*mix(.15,.3,smoothstep(-1.5,-.3,d))*(1.-smoothstep(.6,1.6,d));gl_Position=projectionMatrix*vec4(mv.xyz*(1.-k/max(length(mv.xyz),1.)),1.);}
`;

/** Patch the island ocean material (MeshStandardMaterial with the ripple tile as `map`). Safe to call once per material. */
export function patchOceanMaterial(material:T.MeshStandardMaterial){
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,WATER_UNIFORMS);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vWaterXZ;')
   .replace('#include <project_vertex>','#include <project_vertex>\nvWaterXZ=(modelMatrix*vec4(transformed,1.)).xz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vWaterXZ;\n'+SHORE_GLSL)
   .replace('#include <map_fragment>',/* glsl */`
    // Fishing clear water (lib/town/fishing/shoreWater.ts, Oct 12 2026): the opaque fishing strip covers the ocean here, skip its shading.
    if(uShore>.999&&shoreEdge(vWaterXZ)>.999){float cd=shoreSample(vWaterXZ).r;if(cd>.02&&cd<14.9){gl_FragColor=vec4(0.,0.,0.,1.);return;}}
    float waterGlint=0.;vec4 ripple=vec4(1.);vec4 s=waterField(vWaterXZ);float d=s.r;
    #ifdef USE_MAP
    // Two drifting layers of the painted ripple tile (one on phones and on the still path), their strokes bent by the field's
    // noise so they read as wavy ripples instead of long straight streaks.
    // (Two domain-warped sines stand in for the field's noise out at sea, past the field's rect.)
    vec2 wq=vWaterXZ*.11;float seaN=.5+.5*sin(wq.x+1.7*sin(wq.y*.8))*sin(wq.y*1.2+1.7*sin(wq.x*.7));
    vec2 rUv=vMapUv+(s.gb-.5)*.24+(seaN-.5)*vec2(.12,-.1);
    vec4 rippleA=texture2D(map,rUv+uWaterTime*vec2(.014,.006));ripple=rippleA;
    if(uWaterDetail>1.5){vec4 rippleB=texture2D(map,vec2(rUv.y,-rUv.x)*1.37+uWaterTime*vec2(-.008,.012));ripple=max(rippleA,rippleB);
     waterGlint=smoothstep(.93,1.,min(rippleA.g,rippleB.g)+.02);}
    // The tile repeats every 32 m: patches of it fade out on the 14 m noise, so its strokes never line up into long streaks.
    diffuseColor*=mix(vec4(.95),ripple,.3+.7*smoothstep(.3,.7,s.g*.45+s.b*.4+seaN*.5-.15));
    #endif
    {
     // Depth: pale sandy shallows at the waterline, turquoise over the first metres, back to the open-sea teal by ~24 m.
     vec3 shallowC=mix(vec3(.17,.56,.57),vec3(.05,.42,.53),smoothstep(.3,5.,d));
     float nearK=1.-smoothstep(3.,24.,d);
     diffuseColor.rgb=mix(diffuseColor.rgb,shallowC*(.92+.08*ripple.r),nearK*.85);
     float crest=0.;
     if(uWaterDetail>.5){
      // Swells rolling in toward every shore as broken crest lines, not evenly spaced contour rings (beach waves, Oct 12 2026): each
      // crest's strength varies wave to wave and along the shore (14 m sets, blended so nothing seams), it breaks into pieces on the
      // 5 m noise and bends with it (less so close in, where it meets the swash in step), and it fades out at sea and close in.
      float cyc=swellPhase(d,s.g)+(s.b-.5)*.45*smoothstep(1.,9.,d),ph=fract(cyc),wi=floor(d/SWELL_L+uWaterTime/SWASH_P+s.g*.35+.5);
      float nb=s.g*4.,fb=floor(nb),wset=mix(waterHash(wi*1.7+fb),waterHash(wi*1.7+fb+1.),smoothstep(0.,1.,nb-fb));
      crest=smoothstep(.8,1.,ph)+1.-smoothstep(0.,.07,ph);
      float reach=smoothstep(22.,8.,d)*smoothstep(.8,3.5,d)*wset*smoothstep(.3,.62,s.b+.45*wset-.2);
      diffuseColor.rgb+=reach*crest*vec3(.1,.14,.12);
      // Animal Crossing-style white ripple lines on the crest close in, broken up by the ripple tile and the noise.
      diffuseColor.rgb+=reach*smoothstep(.9,1.,ph)*smoothstep(11.,3.,d)*smoothstep(.9,1.,ripple.r+.1*s.b)*vec3(.35);
      // Sun sparkle (desktop only): glints where the two ripple layers cross, brightest toward the sun's reflection.
      if(uWaterDetail>1.5){vec3 v=normalize(vec3(vWaterXZ.x,-.43,vWaterXZ.y)-cameraPosition);float sun=max(dot(vec3(v.x,-v.y,v.z),uSunDir),0.);
       waterGlint*=(.3+.7*sun*sun*sun)*(.6+.8*crest)*smoothstep(4.,9.,d);}
     }
     if(uWaterDetail<1.5)waterGlint=0.;
    }`)
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=waterGlint*vec3(1.,.96,.88)*1.4;');
 };
 material.customProgramCacheKey=()=>'island-ocean-water-v3';
 material.needsUpdate=true;
}
