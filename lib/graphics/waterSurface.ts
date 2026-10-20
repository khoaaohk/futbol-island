import * as T from 'three';
import {DIVE_SLOTS,DIVE_BLOB_MAX,diveBlobParams} from '../town/water/diveSpots';
import {SHOAL_HEART_D,SHOAL_OPAQUE_D} from './waterTokens';
/** The dive patch's blob test (diveSpots.ts diveBlobR, same formula): q < 1 inside; q > 1 past the widest reach skips the atan. */
// Oct 20 2026 (user: "look more like the shore where it's see through", "blend in more on the edges"): the patch's look reaches past
// the dive blob (q < 1, where Dive shows) and dissolves over a wide noise-broken band out to q = DIVE_SHOAL.fade, so the quick reject
// reaches DIVE_BLOB_MAX x fade (q is meaningful there; 2 = far).
/** The see-through shoal look: the soft edge's start / end (in blob q, 1 = the dive outline), how much the edge noise moves it, the
 *  ocean's alpha at the shoal's heart (blended program only; the shore window is .14-.42) and the opaque-path tint strength. */
export const DIVE_SHOAL={inner:.25,fade:1.32,wobble:.34,heart:SHOAL_HEART_D} as const;
/** Oct 20 2026 (user: "shallow places in the middle of dark ocean"): a shoal is drawn as the shore's own shallows. Its heart reads as
 *  water DIVE_SHOAL.heart m off a beach, and the open sea's distance eases back in through the soft band (the same palette, depth
 *  tint, light net and see-through alpha as the shore window). Shared with divePreview.ts so the seabed under it agrees. */
export const diveShoreD=(d:number,k:number)=>d+(DIVE_SHOAL.heart-d)*k;
const DIVE_GLSL=`uniform vec4 uDiveSpots[${DIVE_SLOTS}];uniform vec3 uDiveTint[${DIVE_SLOTS}];uniform vec4 uDiveBlob[${DIVE_SLOTS}];uniform float uDiveClear[${DIVE_SLOTS}];
float diveBlobQ(vec2 xz,int i){vec4 sp=uDiveSpots[i];vec2 d=xz-sp.xy;float l=length(d);if(l>sp.z*${(DIVE_BLOB_MAX*DIVE_SHOAL.fade).toFixed(2)})return 2.;
 vec4 b=uDiveBlob[i];float a=atan(d.y,d.x);return l/(sp.z*(1.+b.x*sin(2.*a+b.w)+b.y*sin(3.*a+1.7*b.w+1.)+b.z*sin(5.*a+2.3*b.w+2.)));}
`;

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
 *   light streaks and, as an accent, sun glitter (WATER_GLIMMER_GLSL).
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
 /** Diving spots (water P2, lib/town/water/diveSpots.ts): per slot (x, z, radius, strength 0 = off) and the patch colour. Written
  *  once when the island is built (setDiveSpots); the ocean tints a soft lighter disc there. Ocean only (not SHORE_GLSL). */
 uDiveSpots:{value:Array.from({length:DIVE_SLOTS},()=>new T.Vector4(0,0,1,0))},uDiveTint:{value:Array.from({length:DIVE_SLOTS},()=>new T.Color())},uDiveBlob:{value:Array.from({length:DIVE_SLOTS},()=>new T.Vector4())},
 /** Per slot 0..1: how see-through the shoal is (lib/graphics/divePreview.ts eases it while its seabed preview draws; blended program only). */
 uDiveClear:{value:Array.from({length:DIVE_SLOTS},()=>0)},
};
/** Light the diving spots' patches on the ocean: one write per slot, at build time only (never per frame). Unused slots are off. */
export function setDiveSpots(spots:readonly {x:number;z:number;radius:number;blob:number;tint:string}[]){
 for(let i=0;i<DIVE_SLOTS;i++){const s=spots[i];if(s){WATER_UNIFORMS.uDiveSpots.value[i].set(s.x,s.z,s.radius,1);WATER_UNIFORMS.uDiveTint.value[i].set(s.tint);WATER_UNIFORMS.uDiveBlob.value[i].fromArray(diveBlobParams(s.blob));}else WATER_UNIFORMS.uDiveSpots.value[i].w=0;}
}
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

/**
 * The swimmer's clear disc (lib/graphics/swimClear.ts, Oct 19 2026, docs/water-look-research.md §4): within SWIM_CLEAR.radius of
 * `uSwimXZ` the ocean's alpha falls to SWIM_CLEAR.minAlpha (soft over the last SWIM_CLEAR.edge m), scaled by the eased strength
 * `uSwimClear`. It is read only by the blended program swimClear switches to while swimming; the normal (opaque) program never
 * runs it, so the sea is exactly today's whenever nobody swims.
 */
// Oct 19 2026 (deep-sea circle): wider, softer disc; out past the shallows (shore distance 7-20 m) it only thins to deepAlpha, so the
// quad under it never reads as a pale patch on the dark sea (swimClear.ts darkens the quad with depth too).
export const SWIM_CLEAR={radius:9.5,edge:5.5,minAlpha:.32,deepAlpha:.86,diveAlpha:.36} as const;
// Diving (uSwimDive 0..1, swimClear.ts eases it with the dive): out in deep water the disc clears down to SWIM_CLEAR.diveAlpha so the
// submerged body reads (not a faint shape under a bubble ring); same radius and soft edge.
export const SWIM_CLEAR_UNIFORMS={uSwimClear:{value:0},uSwimXZ:{value:new T.Vector2()},uSwimDive:{value:0}};
const SWIM_CLEAR_GLSL=/* glsl */`
uniform float uSwimClear,uSwimDive;uniform vec2 uSwimXZ;
float swimClearAlpha(vec2 xz,float d){float r=distance(xz,uSwimXZ),a=mix(${SWIM_CLEAR.minAlpha.toFixed(2)},mix(${SWIM_CLEAR.deepAlpha.toFixed(2)},${SWIM_CLEAR.diveAlpha.toFixed(2)},uSwimDive),smoothstep(7.,20.,d));
 return 1.-uSwimClear*(1.-smoothstep(${(SWIM_CLEAR.radius-SWIM_CLEAR.edge).toFixed(2)},${SWIM_CLEAR.radius.toFixed(2)},r))*(1.-a);}
`;
/**
 * The clear water window (lib/town/water/clearWindow.ts, Oct 19 2026, docs/water-look-research.md §3): round the player
 * (`uClearWin` x, z), only over the shallows of the shore field (drawn-waterline distance CLEAR_WIN.band), the ocean's alpha drops
 * so the seabed, coral and sharks under it show, fading back to opaque over the last CLEAR_WIN.fade of its radius (no edge). Centre .xy (the point the camera looks at), strength in .z
 * (eased; 0 = the window is off), radius in .w (m, set per heat tier and camera height). ONE vec4 uniform. Like the swim disc, only the blended program runs it.
 */
export const CLEAR_WIN={radius:35,fade:.3,band:[16,26] as const,alpha:[.14,.42] as const} as const;// Oct 19 2026 audit: .16/.5 -> .14/.42, the coral colour reads through
/**
 * Low-frequency world noise (two octaves, ~90 m and ~140 m, domain-warped sines; GLSL `clearWinW` is the same formula) that
 * gently varies the clear band's outer edge: `clearWinK` scales the shore distance (0.85 = a long smooth bay about 5 m wider,
 * 1.2 = about 5 m narrower; no jagged or patchy edge). The coral scatter (clearWindow.ts) uses the same functions, so coral and the clear water agree.
 */
export function clearWinNoise(x:number,z:number,s1=.07,s2=.045,o=31){
 const w=(a:number,b:number)=>.5+.5*Math.sin(a+1.7*Math.sin(b*.8))*Math.sin(b*1.2+1.7*Math.sin(a*.7));
 const n=w(x*s1,z*s1)*.62+w(x*s2+o,z*s2+o*.55)*.38;return Math.min(1,Math.max(0,(n-.5)*1.9+.5));}
export const clearWinK=(x:number,z:number)=>.85+.35*clearWinNoise(x,z);
export const CLEAR_WIN_UNIFORMS={uClearWin:{value:new T.Vector4(0,0,0,0)}};
export const CLEAR_WIN_GLSL=/* glsl */`
uniform vec4 uClearWin;
float clearWinW(vec2 p,float s1,float s2,float o){vec2 a=p*s1,b=p*s2+vec2(o,o*.55);
 float n1=.5+.5*sin(a.x+1.7*sin(a.y*.8))*sin(a.y*1.2+1.7*sin(a.x*.7)),n2=.5+.5*sin(b.x+1.7*sin(b.y*.8))*sin(b.y*1.2+1.7*sin(b.x*.7));
 return clamp((n1*.62+n2*.38-.5)*1.9+.5,0.,1.);}
/** The shore distance as the window sees it: scaled by the low-frequency noise so the band's edge meanders (bays and hugging stretches). */
float clearWinD(vec2 xz,float d){float n=clearWinW(xz,.07,.045,31.);return d>0.?d*(.85+.35*n):d;}
/** 1 - how see-through the window is here (d = drawn-waterline distance, + at sea). */
float clearWinMask(vec2 xz,float d0){if(uClearWin.z<=0.)return 0.;float r=distance(xz,uClearWin.xy),d=clearWinD(xz,d0);
 return uClearWin.z*(1.-smoothstep(uClearWin.w*${(1-CLEAR_WIN.fade).toFixed(2)},uClearWin.w,r))*(1.-smoothstep(${CLEAR_WIN.band[0].toFixed(1)},${CLEAR_WIN.band[1].toFixed(1)},d))*smoothstep(-.6,.4,d0);}
float clearWinAlpha(float m,float d){return mix(1.,mix(${CLEAR_WIN.alpha[0].toFixed(2)},${CLEAR_WIN.alpha[1].toFixed(2)},smoothstep(1.,${CLEAR_WIN.band[0].toFixed(1)},d)),m);}
`;
/**
 * Surface glimmer (Oct 19 2026, "what about the glimmer on top of the water?" then "more like the light streaks you can see in
 * the water", the Tide Bound reference; docs/performance-guide.md "Surface light streaks").
 * - Light streaks (the main look, Oct 19 2026 retune): a sparse caustic net of thin pale lines round ~6 m cells (waterRibbon:
 *   drifting Voronoi edges, ALU only; earlier lozenge ribbons and a warped-sine net both read as thick stripes from high up). Bent by the field and sea noise so they never line up, drifting slowly sideways. Desktop: two layers at two
 *   sizes and headings; phone and the still path (heat tiers 3-4, reduced motion, governor slow): one layer, the still path
 *   faint and static (the clock is held). A diffuse tint, not glare, strongest within ~100 m of the camera's look point (from
 *   viewMatrix), soft right under the camera, out of the foam, none on land, a little brighter toward the sun's reflection.
 *   Over the clear window the alpha rises on them so they sit ON the water above the coral (not over the swim disc).
 * - Glitter: a very light accent of sun specks (one cell layer, ALU only, a 0.33-0.8 s flash each, >= ~1.3 px and faded out
 *   before the cells get small, so no aliasing), coloured by the sun light (directionalLights[0] = colour x intensity from
 *   islandLighting's time of day): warm white by day, honey at sunset, moon-pale and ~a quarter as bright at night.
 */
export const WATER_GLIMMER_GLSL=/* glsl */`
float glimHash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
/** The point the camera looks at on the water (the view ray through the screen centre). */
vec2 waterLook(){vec3 fw=-vec3(viewMatrix[0][2],viewMatrix[1][2],viewMatrix[2][2]);return cameraPosition.xz+fw.xz*(max(cameraPosition.y+.43,1.)/max(-fw.y,.15));}
/** Sun-reflection weight, a wide lobe for a steep (jetpack) camera so it never vanishes. */
float waterSunLobe(vec2 xz){vec3 v=normalize(vec3(xz.x,-.43,xz.y)-cameraPosition);float r=max(dot(vec3(v.x,-v.y,v.z),uSunDir),0.);
 return mix(.35+.65*r*r*r,.7+.3*r,smoothstep(.7,.95,-v.y));}
/** One layer of the caustic net (q: world, turned; sc: size): a sparse web of thin pale lines round ~6 m cells (x sc), like
 *  sunlight on a pool floor: the edges of a drifting Voronoi net (9 hashes, ALU only), bent by a slow warp and the field / sea
 *  noise n. Lines ~0.27 m wide (never under ~1.5 px: they widen and fade with the pixel footprint), each stretch breathing in
 *  and out on its own, so most of the water stays clear and the coral / sand read through. */
float waterRibbon(vec2 q,float n,float t,float sc,float pxm){
 // Oct 19 2026 (user, "Tide Bound" caustic reference; the warped-sine net read as thick parallel stripes from the jetpack).
 float cs=sc*2.1;vec2 p=q/cs;p+=.18*vec2(sin(p.y*2.1+t*.6+n*3.),sin(p.x*1.9-t*.5-n*3.));
 vec2 c=floor(p),f=p-c;float d1=8.,d2=8.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 o=vec2(x,y),h=fract(vec2(glimHash(c+o),glimHash(c+o+17.3)));
  vec2 r=o+.5+.38*sin(t*(.3+.3*h)+6.2832*h)-f;float e=dot(r,r);if(e<d1){d2=d1;d1=e;}else d2=min(d2,e);}
 float w=.034+1.5*pxm/cs;// pxm: the pixel footprint (m), taken outside any branch
 return (1.-smoothstep(0.,w,sqrt(d2)-sqrt(d1)))*min(1.,.045/w*1.6)*(.3+.7*smoothstep(-.4,.9,sin(t*.7+p.x*2.3-p.y*1.7+n*4.)));}
/** Sparse sun glitter (accent only): additive light, ALU only. */
vec3 waterGlimmer(vec2 xz,float d,float lobe){
 #if NUM_DIR_LIGHTS>0
 if(uWaterDetail<.5)return vec3(0.);
 return vec3(0.);// Oct 20 2026 (user: "remove those blinking glimmer"): the sparkle specks are off; the light net is the surface light now
 float pxm=max(length(dFdx(xz)),length(dFdy(xz))),k=(1.-smoothstep(.08,.2,pxm/.75))*smoothstep(1.5,6.,d);if(k<=0.)return vec3(0.);
 vec2 p=xz/.75+uWaterTime*vec2(.07,.03),c=floor(p),f=p-c;float h=glimHash(c),dens=.04+.06*lobe;if(h>dens)return vec3(0.);
 float h2=fract(h*61.7+.13),h3=fract(h*23.3+.37),ph=fract(uWaterTime*(1.25+1.75*h2)+h3),rad=max(.11,1.3*pxm/.75);
 float g=smoothstep(0.,.18,ph)*(1.-smoothstep(.18,.5,ph))*(1.-smoothstep(rad*.4,rad,length(f-.2-.6*vec2(h2,h3))));
 vec3 sunL=directionalLights[0].color*.333;return vec3(1.,.96,.88)*mix(vec3(dot(sunL,vec3(.3,.59,.11))),sunL,.3)*(g*k*lobe*1.1);
 #else
 return vec3(0.);
 #endif
}
`;
/** Patch the island ocean material (MeshStandardMaterial with the ripple tile as `map`). Safe to call once per material. */
export function patchOceanMaterial(material:T.MeshStandardMaterial){
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,WATER_UNIFORMS,SWIM_CLEAR_UNIFORMS,CLEAR_WIN_UNIFORMS);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vWaterXZ;')
   .replace('#include <project_vertex>','#include <project_vertex>\nvWaterXZ=(modelMatrix*vec4(transformed,1.)).xz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vWaterXZ;\n'+DIVE_GLSL+SHORE_GLSL+SWIM_CLEAR_GLSL+CLEAR_WIN_GLSL)
   .replace('#include <lights_pars_begin>','#include <lights_pars_begin>\n'+WATER_GLIMMER_GLSL)
   .replace('#include <map_fragment>',/* glsl */`
    // Fishing clear water (lib/town/fishing/shoreWater.ts, Oct 12 2026): the opaque fishing strip covers the ocean here, skip its shading.
    if(uShore>.999&&shoreEdge(vWaterXZ)>.999){float cd=shoreSample(vWaterXZ).r;if(cd>.02&&cd<14.9){gl_FragColor=vec4(0.,0.,0.,1.);return;}}
    float waterStreak=0.,waterLobe=.5;vec4 ripple=vec4(1.);vec4 s=waterField(vWaterXZ);float d=s.r;
    // Dive shoals (water P2; Oct 20 2026 see-through rework): diveK = the shoal's weight here (1 at the heart, dissolving over a wide
    // band broken by low-frequency noise: no rim, no hard line), diveClr = how see-through (uDiveClear, the preview's seabed under it).
    // DIVE_SLOTS (2) nearest zones; a distance reject per slot, the atan + three sines only inside a lit slot's reach. Not motion: also on the still path.
    float diveK=0.,diveClr=0.;
    for(int i=0;i<${DIVE_SLOTS};i++){vec4 sp=uDiveSpots[i];if(sp.w>0.){float q=diveBlobQ(vWaterXZ,i);if(q<${DIVE_SHOAL.fade.toFixed(2)}){
     float qn=q+(clearWinW(vWaterXZ,.19,.31,7.)-.5)*${DIVE_SHOAL.wobble.toFixed(2)}*smoothstep(.3,.8,q),k=sp.w*(1.-smoothstep(${DIVE_SHOAL.inner.toFixed(2)},${DIVE_SHOAL.fade.toFixed(2)},qn));k*=k*(3.-2.*k);
     diveK=max(diveK,k);diveClr=max(diveClr,uDiveClear[i]*k);}}}
    // The shore distance the shoal looks like (diveShoreD): the depth colour, light net and alpha below all read it.
    // Where the seabed preview is off (heat tiers 3-4, Battery saver, out of range, the opaque program) the heart reads as
    // SHOAL_OPAQUE_D instead: a flat muted turquoise a little lighter than the sea, never a pale khaki sandbar (water audit #10).
    float dd=mix(d,mix(${SHOAL_OPAQUE_D.toFixed(1)},${DIVE_SHOAL.heart.toFixed(1)},clamp(diveClr/max(diveK,1e-3),0.,1.)),diveK);
    #ifdef USE_MAP
    // Two drifting layers of the painted ripple tile (one on phones and on the still path), their strokes bent by the field's
    // noise so they read as wavy ripples instead of long straight streaks.
    // (Two domain-warped sines stand in for the field's noise out at sea, past the field's rect.)
    vec2 wq=vWaterXZ*.11;float seaN=.5+.5*sin(wq.x+1.7*sin(wq.y*.8))*sin(wq.y*1.2+1.7*sin(wq.x*.7));
    vec2 rUv=vMapUv+(s.gb-.5)*.24+(seaN-.5)*vec2(.12,-.1);
    vec4 rippleA=texture2D(map,rUv+uWaterTime*vec2(.014,.006));ripple=rippleA;
    if(uWaterDetail>1.5){vec4 rippleB=texture2D(map,vec2(rUv.y,-rUv.x)*1.37+uWaterTime*vec2(-.008,.012));ripple=max(rippleA,rippleB);}
    // The tile repeats every 32 m: patches of it fade out on the 14 m noise, so its strokes never line up into long streaks.
    diffuseColor*=mix(vec4(.95),ripple,.3+.7*smoothstep(.3,.7,s.g*.45+s.b*.4+seaN*.5-.15));
    #endif
    {
     // Depth: pale sandy shallows at the waterline, turquoise over the first metres, back to the open-sea teal by ~24 m.
     vec3 shallowC=mix(vec3(.17,.56,.57),vec3(.05,.42,.53),smoothstep(.3,5.,dd));
     float nearK=1.-smoothstep(3.,24.,dd);
     diffuseColor.rgb=mix(diffuseColor.rgb,shallowC*(.92+.08*ripple.r),nearK*.85);
     // Open sea (Oct 19 2026 audit, Tide Bound "deeper blue past the drop-off"): past ~40 m the teal sinks toward a deeper blue. 2 ALU.
     diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.02,.19,.4),smoothstep(25.,110.,dd)*.55);
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
     }
     #ifdef USE_MAP
     // Light streaks (WATER_GLIMMER_GLSL notes): soft ribbons, ALU only (no texture read), one layer on phones / the still path,
     // two on desktop; each fades to its mean sheen before its bands get thinner than ~2 px (no moire out at sea).
     float H=max(cameraPosition.y+.43,8.),lr=distance(vWaterXZ,waterLook()),cr=distance(vWaterXZ,cameraPosition.xz);
     float reachS=smoothstep(1.5,7.,dd)*(1.-smoothstep(.5*H+15.,1.5*H+50.,lr))*(.5+.5*smoothstep(3.,.8*H+8.,cr));
     waterLobe=waterSunLobe(vWaterXZ);
     float pxS=max(length(dFdx(vWaterXZ)),length(dFdy(vWaterXZ))),nS=seaN+s.g-.5;
     if(reachS>0.){float t=uWaterTime;
      float k1=1.-smoothstep(.25,.6,pxS),st=k1*waterRibbon(mat2(.86,.51,-.51,.86)*vWaterXZ,nS,t,1.,pxS)+.04*(1.-k1);
      if(uWaterDetail>1.5){float k2=1.-smoothstep(.4,.9,pxS);st=max(st,.6*k2*waterRibbon(mat2(.93,.37,-.37,.93)*vWaterXZ+vec2(37.,11.),-nS,-t*.8,1.45,pxS));}
      float nearS=1.-smoothstep(10.,45.,dd);// the shoals get the shallows' light net too (no extra reads)// Oct 19 2026: the net reads strongest in the shallows by the beaches
      // A low camera (the fishing view, ~5 m up; Oct 19 2026 one shore) sees the ribbons big and near: they read as a white fog
      // over the clear window, so they fade to a hint below ~18 m of camera height (the walking / flying views are unchanged).
      // A high (jetpack) camera sees many cells at once: the net eases to ~60% above ~20 m so it never becomes a sheet.
      waterStreak=st*reachS*(.75+.25*waterLobe)*(.2+1.3*nearS)*mix(.8,1.,smoothstep(7.,18.,cameraPosition.y+.43))*mix(1.,.6,smoothstep(20.,60.,H))*(uWaterDetail<.5?.55:1.);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.55,.86,.9),min(waterStreak*.17,.27));}// peak ~26% lighter in the shallows, ~6% at sea (the net is a shallows thing; the open sea reads as depth, not cracked glass)
     #endif
     // Dive shoals: no tint of their own; the depth colour above already reads dd (the shore's shallows palette).
    }`)
   // Swimming (swimClear.ts) and the clear window (clearWindow.ts): only the blended program (no OPAQUE define, used while either
   // is open) writes an alpha: it follows depth (clearer over the sand, bluer further out) and rises on the light streaks, so they
   // read as ribbons on the surface above the coral (they replace the window's old stretched light bands: one read fewer).
   .replace('#include <opaque_fragment>',`vec3 waterGlim=waterGlimmer(vWaterXZ,d,waterLobe);
    #ifndef OPAQUE
    {float wm=clearWinMask(vWaterXZ,d);outgoingLight+=min(waterStreak,1.2)*max(wm,diveClr)*vec3(.05,.07,.07);// the ribbons a touch lighter over the window
     diffuseColor.a=min(min(swimClearAlpha(vWaterXZ,d),clearWinAlpha(wm,clearWinD(vWaterXZ,d))),mix(1.,clearWinAlpha(1.,dd),diveClr));
     diffuseColor.a+=(1.-diffuseColor.a)*min(waterStreak*.2,.25)*(1.-uSwimClear*(1.-smoothstep(4.,${SWIM_CLEAR.radius.toFixed(1)},distance(vWaterXZ,uSwimXZ))));}
    #endif
    // Glimmer last, ON the surface: over the see-through window the blend would scale it by the low alpha, so the alpha rises
    // by the glimmer's own brightness and the colour is rebalanced (= src*a + glimmer over the coral, an exact additive speck).
    #ifdef OPAQUE
    outgoingLight+=waterGlim;
    #else
    {float ga=diffuseColor.a,a2=ga+(1.-ga)*clamp(dot(waterGlim,vec3(.3,.59,.11)),0.,1.);outgoingLight=(outgoingLight*ga+waterGlim)/max(a2,.001);diffuseColor.a=a2;}
    #endif
    #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=>'island-ocean-water-v9';
 material.needsUpdate=true;
}
