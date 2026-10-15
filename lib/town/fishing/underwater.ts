import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {SHORE_GLSL,WATER_UNIFORMS} from '../../graphics/waterSurface';
import {distanceToLandableDeck} from '../landableDecks';

/**
 * Clear water for the fishing view (Oct 12 2026, "make the water more see-through where we can see coral and the fish and not just
 * shadows"). No refraction target, no extra pass:
 * - The shore strip (shoreWater.ts) is the see-through layer: for each water pixel it follows the view ray down to a sloping seabed
 *   (depth from the shore field, `uwDepthAt`), shades sand, ripples and caustics there and tints it by the water it crossed. Clear at
 *   the waterline, turquoise over the first metres, teal further out, then it fades into the island ocean.
 * - While fishing, the island ocean stops writing depth and draws after the other opaque meshes (`createOceanClear`), so everything
 *   under the surface (seabed props, fish, crabs, the catch) draws after the strip and shows through. Each of those shaders tints
 *   itself by its own depth with the same functions (`UNDERWATER_GLSL`), so coral, fish and sand agree.
 * - The seabed props (`buildSeabedProps`) are ONE merged, vertex-coloured mesh per spot: coral, sea grass and kelp (sway in the
 *   vertex shader, desktop only), starfish, shells, pebbles, rocks, urchins, and old pier piles with barnacles at the piers.
 * Detail follows the shared water uniform: 2 desktop (sway, two-read caustics), 1 phone (one-read caustics, no sway), 0 the governor's
 * slow / still path (no sway, no caustics). Reduced motion holds the water clock, so everything is still.
 */
export const UW_SURFACE=-.42;
/**
 * Depth (Oct 14 2026, user: "the coral looks like it's on top of the water. anything we can do to make it have more depth?").
 * The seabed's floor depth is per spot (a theme's `floor`, Drop-off Ledge drops deeper); `applyReefWater` sets it for the CPU
 * (placement, fish) and the shaders (uUwFloor) together, so the strip's seabed, the reef and the fish always agree.
 */
export const UW_DEPTH={floor:3.2};
/** Seabed depth (m below the surface) at signed shore distance d (m). Shared with the GLSL below. */
export const uwDepthAt=(d:number,floor=UW_DEPTH.floor)=>.05+floor*(1-Math.exp(-Math.max(d,0)/3.4));
/**
 * Shared noise texture (shoreWater.createWaterNoise), set when the fishing water builds it, and the spot's water look (Oct 13 2026,
 * "fix all the fishing spots so they don't all look the same"): the depth tint (shallow / deep colour, linear), how clear the water
 * is (absorption scale) and the sand seen through it. One set of uniform objects shared by every underwater material and the strip,
 * written once per session by `applyReefWater` (no recompile, no extra draw).
 * Oct 14 2026 (depth): how much of the water's absorption the reef and the fish take (per theme), the floor depth, and the float's
 * shadow on the seabed (uUwFloat: float x, z, angler x, z; uUwFloatOn 0..1), written per frame while fishing (uniforms only).
 */
export const UW_UNIFORMS={uWaterNoise:{value:null as T.Texture|null},
 uUwShallow:{value:new T.Vector3(0,.42,.62)},uUwDeep:{value:new T.Vector3(.004,.16,.32)},uUwClear:{value:1},
 uUwReef:{value:.55},uUwFish:{value:.4},uUwFloor:{value:3.2},uUwFloat:{value:new T.Vector4(0,0,0,0)},uUwFloatOn:{value:0},
 uSandA:{value:new T.Vector3(.55,.55,.49)},uSandB:{value:new T.Vector3(.67,.66,.59)},uSandWeed:{value:new T.Vector4(.24,.3,.15,.55)}};

/**
 * The depth look of anything under the water (Oct 14 2026): colour first loses saturation with depth (only the shallowest pieces
 * stay vivid), then the water absorbs it per channel and adds its own tint (`uwTrans` / `uwTint`). Exported with the GLSL built
 * from the same numbers, so tests/fishing.cjs can check the curve (`uwDepthLook`).
 * - sat: colour saturation [in the shallows, at depth]; `DEPTH_K`: the depth range (m) it eases over.
 */
// Oct 14 2026 (user chose the middle ground): about half of the vividness back after the depth pass; deep coral stays visibly
// underwater but keeps more colour (was absorb .22 / deep saturation .88; now .155 / .92).
export const UW_LOOK={reefSat:[1.35,.92] as [number,number],fishSat:[1.2,.85] as [number,number],depthK:[.4,3] as [number,number],
 /** How much of the water's own colour the reef takes where the water absorbed its light (the sand takes 1): less, so deep
  *  pieces go darker and bluer instead of grey (pink + cyan = grey). */
 reefHaze:.5,
 /** Absorption per metre of path (L) and of depth (h), per channel: red goes first, so things turn aqua. */
 pathK:[.36,.16,.07] as V3,depthAbs:[.36,.12,.05] as V3,
 /** The reef and fish count the slant path only up to pathCap × depth + 0.3 m (see patchUnderwater). */
 pathCap:1.5};
const f3=(v:number[])=>`vec3(${v.map(x=>x.toFixed(3)).join(',')})`;
const smooth=(a:number,b:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
/**
 * CPU mirror of the shader's depth look (unlit, for tests): a linear colour `rgb` at depth h (m) seen along L metres of water, for
 * a theme (`absorb` = reef or fish share). Returns the colour the eye gets (before the scene light).
 */
export function uwDepthLook(rgb:V3,h:number,L:number,theme:ReefTheme,kind:'reef'|'fish'='reef'):V3{
 const [s0,s1]=kind==='reef'?UW_LOOK.reefSat:UW_LOOK.fishSat,sat=s0+(s1-s0)*smooth(UW_LOOK.depthK[0],UW_LOOK.depthK[1],h);
 const lum=rgb[0]*.3+rgb[1]*.59+rgb[2]*.11,c=rgb.map(x=>Math.max(0,lum+(x-lum)*sat));
 const a=(kind==='reef'?reefAbsorb(theme):fishAbsorb(theme))*theme.clear,k=smooth(1,3.1,h),tint=theme.water[0].map((x,i)=>x+(theme.water[1][i]-x)*k);
 const Lc=Math.min(L,h*UW_LOOK.pathCap+.3);
 const haze=kind==='reef'?UW_LOOK.reefHaze:1;
 return c.map((x,i)=>{const tr=Math.exp(-(Lc*a*UW_LOOK.pathK[i]+h*a*UW_LOOK.depthAbs[i]));return x*tr+tint[i]*(1-tr)*haze;}) as V3;
}

export const UNDERWATER_GLSL=/* glsl */`
uniform sampler2D uWaterNoise;uniform vec3 uUwShallow,uUwDeep;uniform float uUwClear,uUwReef,uUwFish,uUwFloor,uUwFloatOn;uniform vec4 uUwFloat;
const float UW_Y=${UW_SURFACE.toFixed(3)};
// The water's own glow (like the island ocean's blue emissive): keeps it blue under the orange sunset light.
const float UW_GLOW=.45;
const float UW_PATH_CAP=${UW_LOOK.pathCap.toFixed(2)};
float uwDepthAt(float d){return .05+uUwFloor*(1.-exp(-max(d,0.)/3.4));}
// Water colour by depth: the spot's shallow colour (clear turquoise by default), its deep colour further down (linear).
vec3 uwTint(float h){return mix(uUwShallow,uUwDeep,smoothstep(1.,3.1,h));}
// What survives the water on the way to the eye (per channel: red goes first, so things turn aqua but keep their contrast);
// the rest is the water's own colour: col·T + tint·(1 − T). L = path length under water, h = depth.
vec3 uwTrans(float h,float L){return exp((-L*${f3(UW_LOOK.pathK)}-h*${f3(UW_LOOK.depthAbs)})*uUwClear);}
// Saturation by depth (Oct 14 2026): vivid in the shallows, greyer (then blue, from uwTrans) further down.
vec3 uwDesat(vec3 c,float h,vec2 sat){float l=dot(c,vec3(.3,.59,.11));return max(mix(vec3(l),c,mix(sat.x,sat.y,smoothstep(${UW_LOOK.depthK[0].toFixed(2)},${UW_LOOK.depthK[1].toFixed(2)},h))),0.);}
// Moving caustics: a network of light lines from the noise texture's cell edges, wobbled by its soft channel (desktop: 2 reads,
// phone: 1, still/slow: none). Scroll rates are multiples of 1/500 per second, so the water clock's wrap never jumps.
float uwCaustic(vec2 xz){
 if(uWaterDetail<.5)return 0.;float t=uWaterTime;vec2 uv=xz*.5;
 float c=texture2D(uWaterNoise,uv+vec2(t*.012,t*.006)).r;
 // Desktop: a second network drifting the other way; where the two cross the light gathers and shimmers.
 if(uWaterDetail>1.5){float c2=texture2D(uWaterNoise,uv*.83+vec2(.37-t*.008,.11+t*.01)).r;c=c*.62+c2*.62+c*c2*.5;}
 return smoothstep(.3,.95,c);
}
// Caustic strength by depth: bright in the shallows, gone by the floor (squared, so deep pieces lose them fast).
float uwCausticFade(float h){float k=smoothstep(3.3,.1,h);return k*k;}
`+UW_WOBBLE_GLSL()+/* glsl */`
// The water surface over something under it (Oct 14 2026: "the coral looks like it's on top of the water"): where the view ray
// crossed the surface (S), the same swells, ripple lines, breaking foam, sky reflection and (desktop) glints the strip draws round
// it, so a piece is seen THROUGH the surface. F = the shore field at the piece (it stands in for the field at S: one read fewer),
// lit = the light on the surface (irradiance / π), vy = how steeply the eye looks down. One noise read (two on desktop).
vec3 uwSurfaceOver(vec3 col,vec2 S,vec4 F,float vy,float L,float h,vec3 lit){
 float t=uWaterTime,d=F.r;vec4 lc=texture2D(uWaterNoise,S*.21+vec2(t*.004,t*.002));float lace=lc.g;
 // Light shafts (in-scattering): brighter where the light came in through a bright patch of surface, more over a longer path.
 col+=uwTint(h)*(lit+UW_GLOW*.4)*smoothstep(.45,.85,lc.b)*(1.-exp(-min(L,h*1.5+.3)*.35))*.07;
 float swell=smoothstep(.84,1.,swellPhase(d,F.g))*smoothstep(.2,1.5,d)*smoothstep(32.,6.,d);
 float lines=smoothstep(.5,.56,lace)*smoothstep(.64,.58,lace)*smoothstep(.3,2.,d);
 // Half the strip's crest brightening: a passing swell must not wash a whole fan pale (it reads as the coral losing colour).
 col=mix(col,vec3(.42,.72,.7)*lit+uwTint(0.)*UW_GLOW*.3,swell*.14+lines*.08);
 // Fresnel: more sky the flatter the eye looks across the water (far side of the view), see-through looking straight down.
 // (Slightly under the strip's 0.3 so far pieces keep their colour for kids; the sand round them carries the full reflection.)
 col=mix(col,vec3(.2,.42,.47)*lit+vec3(.03,.07,.08),pow(1.-vy,3.)*.24);
 // The swell breaking over the last metres (the strip's breaker band).
 float ph=fract(t/SWASH_P+F.g*.35),dc=SWELL_L*(1.-ph);
 float foam=exp(-abs(d-dc)/(.35+.25*dc))*smoothstep(3.4,.6,dc)*smoothstep(.25,.7,lace+.15)*step(-.2,d)*step(d,3.8);
 col=mix(col,vec3(.97,.98,.96)*(lit+.22),clamp(foam,0.,1.)*.8);
 if(uWaterDetail>1.5){float g2=texture2D(uWaterNoise,S*.33-vec2(t*.01,t*.004)).g;col+=smoothstep(.8,.9,min(lace,g2))*smoothstep(1.,4.,d)*(.4+.6*swell)*.9*vec3(1.,.97,.9);}
 return col;
}
`;
/** Refraction (Oct 14 2026): what lies under the moving surface sways a little, more the deeper it is. Periods 5, 7 and 4 s divide
 *  the water clock's 3500 s wrap, so it never jumps; held on the still path (detail 0). Vertex (patchUnderwater) and fragment (strip). */
function UW_WOBBLE_GLSL(){return /* glsl */`
vec2 uwWobble(vec2 xz,float h){if(uWaterDetail<.5||h<=0.)return vec2(0.);float t=uWaterTime;
 return vec2(sin(xz.x*1.7+xz.y*.9+t*1.256637)+.5*sin(xz.y*2.3-t*.897598),cos(xz.y*1.9-xz.x*.7+t*1.570796)+.5*cos(xz.x*2.1+t*.897598))*min(h,2.5)*.018;}
`;}
/** Up-facing irradiance from the scene lights, so the water colour follows the time of day exactly like the lit strip. */
const UW_LIGHT=/* glsl */`
 vec3 uwUp=normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz);vec3 uwIrr=ambientLightColor;
 #if NUM_HEMI_LIGHTS>0
 uwIrr+=getHemisphereLightIrradiance(hemisphereLights[0],uwUp);
 #endif
 #if NUM_DIR_LIGHTS>0
 uwIrr+=directionalLights[0].color*max(dot(uwUp,directionalLights[0].direction),0.);
 #endif
`;
/**
 * Patch a lit (Lambert / Standard) material that sits under the water: world position varying, refraction sway, caustics on
 * up-facing surfaces, the depth look (saturation, absorption, tint) and the water surface drawn over it.
 * `extraVertex` / `extraFragment` add the caller's own declarations.
 */
export function patchUnderwater(sh:T.WebGLProgramParametersWithUniforms,extra:{uniforms?:Record<string,T.IUniform>;vertexHead?:string;vertexBody?:string;fragmentHead?:string;colorBody?:string;beforeTint?:string;
 /** Caustic strength on up-facing surfaces (1.1 default). */
 caustic?:number;
 /** How much of the water's absorption the object takes: a number, or a GLSL expression (the reef / fish uniforms per theme). */
 absorb?:number|string;
 /** Saturation [shallow, deep] (Oct 14 2026 depth look). */
 sat?:[number,number];
 /** The reef (Oct 14 2026): cut away below the seabed (rocks and corals sit IN the sand) and darken the foot (contact shade). */
 bury?:boolean;
 /** Share of the water's own colour added where light was absorbed (1 default; the reef less, UW_LOOK.reefHaze). */
 haze?:number}={}){
 const caustic=(extra.caustic??1.1).toFixed(2),absorb=typeof extra.absorb==='string'?extra.absorb:(extra.absorb??.45).toFixed(2),sat=extra.sat??UW_LOOK.fishSat;
 Object.assign(sh.uniforms,WATER_UNIFORMS,UW_UNIFORMS,extra.uniforms??{});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vUwPos;uniform float uWaterTime,uWaterDetail;\n'+UW_WOBBLE_GLSL()+(extra.vertexHead??''))
  .replace('#include <begin_vertex>','#include <begin_vertex>\n'+(extra.vertexBody??''))
  // Refraction: the drawn position sways (vUwPos stays put, so caustics and the depth look stick to the piece).
  .replace('#include <project_vertex>',`#include <project_vertex>\n{vec4 uwp=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nuwp=instanceMatrix*uwp;\n#endif\nvUwPos=(modelMatrix*uwp).xyz;
   float uwHv=${UW_SURFACE.toFixed(3)}-vUwPos.y;if(uwHv>0.){vec3 uww=vUwPos;uww.xz+=uwWobble(uww.xz,uwHv);gl_Position=projectionMatrix*viewMatrix*vec4(uww,1.);}}`);
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vUwPos;\n'+SHORE_GLSL+UNDERWATER_GLSL+(extra.fragmentHead??''))
  .replace('#include <color_fragment>','#include <color_fragment>\n'+(extra.colorBody??''))
  .replace('#include <opaque_fragment>',/* glsl */`{
   float uwH=max(0.,UW_Y-vUwPos.y);vec3 uwV=normalize(vUwPos-cameraPosition);float uwVy=max(.12,-uwV.y),uwL=uwH/uwVy;
   vec4 uwF=shoreSample(vUwPos.xz);
   ${UW_LIGHT}
   ${extra.bury?/* glsl */`// Sits IN the seabed: nothing shows below the sand (the strip draws the sand), and the foot is shaded.
   float uwBed=UW_Y-uwDepthAt(uwF.r);if(uShore>0.&&vUwPos.y<uwBed-.025)discard;outgoingLight*=mix(.5,1.,smoothstep(0.,.2,vUwPos.y-uwBed));`:''}
   float uwC=uwCaustic(vUwPos.xz)*max(dot(normal,uwUp),0.)*uwCausticFade(uwH);
   outgoingLight+=reflectedLight.directDiffuse*uwC*${caustic}+uwIrr*RECIPROCAL_PI*diffuseColor.rgb*uwC*.25;
   ${extra.beforeTint??''}
   // Depth look: saturation falls off with depth, then the water's absorption and its own tint (the reef and fish take a share of
   // the sand's full absorption, per theme: the shallows stay vivid, deeper pieces go bluer and softer).
   outgoingLight=uwDesat(outgoingLight,uwH,vec2(${sat[0].toFixed(2)},${sat[1].toFixed(2)}));
   // The path counts only up to ~1.5× the depth: at the camera's low angle the full slant path would turn everything past the
   // shallows the same grey-blue; capped, the look follows depth (what reads as "deeper" on screen) and stays colourful.
   float uwA=${absorb};vec3 uwT=uwTrans(uwH*uwA,min(uwL,uwH*UW_PATH_CAP+.3)*uwA);outgoingLight=outgoingLight*uwT+uwTint(uwH)*(uwIrr*RECIPROCAL_PI*.85+UW_GLOW)*(1.-uwT)*${(extra.haze??1).toFixed(2)};
   // The water surface over it (seen through it, not pasted on it).
   if(uwH>0.)outgoingLight=uwSurfaceOver(outgoingLight,vUwPos.xz-uwV.xz/uwVy*uwH,uwF,uwVy,uwL,uwH,uwIrr*RECIPROCAL_PI);
  }
  #include <opaque_fragment>`);
}
/** The light snippet for the strip shader (it needs the same lit water colour). */
export const UW_LIGHT_GLSL=UW_LIGHT;

/**
 * While fishing, the island ocean (world.ts 'surrounding-ocean', owned elsewhere) must not hide what is under the surface: it stops
 * writing depth and draws after the other opaque meshes (so opaque island geometry below the waterline stays covered). Two render
 * state flags, no shader change, no recompile; restored exactly when the fishing water has faded out.
 */
export function createOceanClear(scene:T.Scene){
 let ocean:T.Mesh|null=null,saved:{depthWrite:boolean;renderOrder:number}|null=null;
 return {
  set(on:boolean){
   if(on===!!saved)return;
   ocean??=(scene.getObjectByName('surrounding-ocean') as T.Mesh|undefined)??null;const m=ocean?.material as T.Material|undefined;if(!ocean||!m||Array.isArray(m))return;
   if(on){saved={depthWrite:m.depthWrite,renderOrder:ocean.renderOrder};m.depthWrite=false;ocean.renderOrder=Math.max(ocean.renderOrder,.25);}
   else if(saved){m.depthWrite=saved.depthWrite;ocean.renderOrder=saved.renderOrder;saved=null;}
  },
 };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Seabed props: one reef theme per spot
//
// Oct 13 2026 ("fix all the fishing spots so they don't all look the same … make the coral feel more tropical"): every spot names
// its own `reef` theme (fishCatalog.ts FISH_SPOTS), and the theme picks the layout (a ring reef, a coral wall on the drop-off, a
// sandy channel through sea grass, pier pilings, a kelp corridor, a boulder field …), the formation count and size, a vivid reef
// palette, the sand and water tint, the fish (fishSchools.ts) and one or two signature props. Same prop kit, same cost: still ONE
// merged, vertex-coloured mesh per spot, triangles within +15 % of the old per-style counts (tests/fishing.cjs).
export type SeabedStyle='cay'|'causeway'|'beach'|'pier';
export const PIER_SPOTS=new Set(['east-pier','south-pier','west-pier','harbour-wall']);
export function seabedStyle(spot:{id:string;area?:string}):SeabedStyle{return spot.area==='cay'?'cay':spot.area==='causeway'?'causeway':PIER_SPOTS.has(spot.id)?'pier':'beach';}
export type ReefLayout='pilings'|'lagoon'|'wall'|'flat'|'channel'|'open'|'kelp'|'rubble'|'tables'|'meadow'|'ring'|'patches'|'garden'|'boulders'|'staghorn'|'line'
 /** Oct 14 2026: open deep sea (the deep-sea boats): no seabed at all, the water column instead (deepSeaScene.ts). */
 |'abyss'
 /** Oct 14 2026: a rocky ledge where the sand drops away (Summit Isle's Drop-off Ledge). */
 |'ledge';
export type CoralKind='brain'|'branch'|'stag'|'fan'|'table'|'anemone'|'tube'|'soft';
export type Signature='football'|'anchor'|'stars'|'clam'|'goal';
type V3=[number,number,number];
export type ReefTheme={
 id:string;name:string;layout:ReefLayout;
 /** Reef colours (sRGB hex). A cluster leads with one and varies it light / dark piece by piece. */
 coral:string[];
 /** Relative weights of the coral shapes. */
 kinds:Partial<Record<CoralKind,number>>;
 /** Coral clusters, pieces per cluster [min, max], cluster radius (m) and a size scale for the pieces. */
 clusters:number;items:[number,number];spread:number;scale:number;
 grass:number;kelp:number;rocks:number;rockSize:[number,number];pebbles:number;stars:number;shells:number;urchins:number;piles:number;
 /** Anemones in view with a clownfish pair living in them (fishSchools.ts). */
 anemones:number;
 grassCol:[string,string];rock:string;algae:string;urchin:[string,string];
 /** Sand seen through the water (linear: light, dark) and weed patches (linear rgb, amount 0..1). */
 sand:[V3,V3];weed:[number,number,number,number];
 /** Water tint (linear: shallow, deep) and absorption scale (below 1 = clearer). */
 water:[V3,V3];clear:number;
 /** Ambient fish (fishSchools.ts LOOKS ids): three schools, the solo cruisers, the occasional glider. */
 fish:{schools:[string,string,string];cruisers:string[];glider:'ray'|'turtle'|'both'|null};
 signature:Signature[];
 /** Open deep sea (layout 'abyss', the deep-sea boats, Oct 14 2026: "update the water scene for the boat"): no seabed pieces;
  *  the water column (deepSeaScene.ts: light shafts, plankton, jellyfish) and deep life (fishSchools.ts deep mode: a bait ball,
  *  big silhouettes far below, a manta or turtle). `coral` tints the jellyfish and the plankton glints. */
 deep?:{bait:string;big:[string,string];shafts:number;jellies:number;plankton:string;jelly:string};
 /** Depth (Oct 14 2026, "make it have more depth"): the seabed's floor depth in metres (3.2 default) and how much of the water's
  *  absorption the reef and the fish take (0.55 / 0.4 default; times `clear`). Higher = bluer, softer at depth. */
 floor?:number;reefAbsorb?:number;fishAbsorb?:number;
};
const T_SAND:[V3,V3]=[[.55,.55,.49],[.67,.66,.59]];
/** The 19 themes (docs/fishing-visuals-HANDOFF.md has the table; Oct 14 2026: the two deep-sea boats and Drop-off Ledge). Shapes: brain, branch, stag (staghorn), fan, table, anemone, tube (sponges), soft (swaying soft coral). */
export const REEF_THEMES:Record<string,ReefTheme>={
 'barnacle-pilings':{id:'barnacle-pilings',name:'Barnacle pilings',layout:'pilings',coral:['#ffd000','#8a2cc0','#ffe65a','#b04cff','#ff9d00'],
  kinds:{tube:3,anemone:3,soft:2,brain:1},clusters:16,items:[3,4],spread:.7,scale:.9,grass:4,kelp:2,rocks:7,rockSize:[.14,.3],pebbles:4,stars:7,shells:6,urchins:4,piles:9,anemones:1,
  grassCol:['#2f6a3a','#8fc06a'],rock:'#857f74',algae:'#7a8a4a',urchin:['#24142e','#5a2f78'],sand:[[.56,.52,.42],[.66,.62,.5]],weed:[.22,.28,.14,.4],
  water:[[0,.4,.56],[0,.14,.3]],clear:.95,fish:{schools:['sardine','sergeant','bream'],cruisers:['mackerel','bass','garibaldi','butterfly'],glider:null},signature:['anchor']},
 'lifebuoy-lagoon':{id:'lifebuoy-lagoon',name:'Sandy turquoise lagoon',layout:'lagoon',coral:['#ff5d7a','#ffd23a','#ff9a3c','#ff7aa8'],
  kinds:{brain:3,branch:2,anemone:1,soft:1},clusters:9,items:[3,5],spread:.8,scale:1.5,grass:3,kelp:0,rocks:4,rockSize:[.12,.24],pebbles:3,stars:16,shells:18,urchins:1,piles:5,anemones:1,
  grassCol:['#3f8a3a','#a8e07a'],rock:'#a49a8a',algae:'#9aa86a',urchin:['#2a1a3a','#6a4f90'],sand:[[.78,.76,.68],[.88,.86,.78]],weed:[.3,.4,.2,.12],
  water:[[.06,.68,.7],[0,.36,.48]],clear:.7,fish:{schools:['sardine','sergeant','blueTang'],cruisers:['bream','garibaldi','butterfly','bass'],glider:null},signature:['stars']},
 'harbour-fan-wall':{id:'harbour-fan-wall',name:'Sea-fan wall',layout:'wall',coral:['#d4142e','#8f2cff','#ff3f6e','#6a1fd0','#ff6a3d'],
  kinds:{fan:5,tube:2,branch:2,soft:1},clusters:15,items:[3,5],spread:.65,scale:1.15,grass:2,kelp:2,rocks:8,rockSize:[.16,.32],pebbles:3,stars:6,shells:5,urchins:4,piles:6,anemones:0,
  grassCol:['#2a5a3a','#6aa06a'],rock:'#6f6e6a',algae:'#5f6f4a',urchin:['#1a1020','#4a2a5a'],sand:[[.4,.41,.4],[.5,.5,.48]],weed:[.18,.22,.16,.4],
  water:[[0,.26,.42],[0,.07,.18]],clear:1.1,fish:{schools:['sardine','mackerel','anthias'],cruisers:['bass','grouper','snapper','mackerel'],glider:null},signature:['anchor'],floor:3.8,reefAbsorb:.3},
 'tidepool-flat':{id:'tidepool-flat',name:'Rocky reef flat',layout:'flat',coral:['#ff6a00','#ff2f6e','#ffd000','#b02cff'],
  kinds:{brain:2,anemone:3,soft:2,tube:1},clusters:18,items:[2,3],spread:.6,scale:0.9,grass:3,kelp:1,rocks:24,rockSize:[.14,.36],pebbles:6,stars:12,shells:6,urchins:9,piles:0,anemones:1,
  grassCol:['#3a6a2a','#9ac05a'],rock:'#8a7a68',algae:'#b0503a',urchin:['#4a0a14','#c0283a'],sand:[[.52,.46,.38],[.62,.56,.46]],weed:[.3,.2,.12,.45],
  water:[[0,.4,.5],[0,.15,.26]],clear:1,fish:{schools:['sergeant','bream','damsel'],cruisers:['garibaldi','grouper','wrasse','bass'],glider:null},signature:['stars']},
 'stream-channel':{id:'stream-channel',name:'Sandy channel through sea grass',layout:'channel',coral:['#b04cff','#ff7ad0','#c8f040','#8a3cff'],
  kinds:{soft:3,fan:2,anemone:1,brain:1},clusters:14,items:[2,4],spread:.6,scale:.9,grass:30,kelp:2,rocks:6,rockSize:[.14,.28],pebbles:5,stars:5,shells:6,urchins:1,piles:0,anemones:0,
  grassCol:['#2f7a2a','#a8e05a'],rock:'#80786a',algae:'#6a8a3a',urchin:['#2a1a3a','#6a4f90'],sand:[[.52,.5,.38],[.62,.6,.46]],weed:[.18,.34,.12,.9],
  water:[[.06,.44,.36],[.02,.18,.16]],clear:1.05,fish:{schools:['sardine','bream','wrasse'],cruisers:['bass','mackerel','parrot','garibaldi'],glider:'ray'},signature:['football']},
 // The deep-sea boats (Oct 14 2026, user: "update the water scene for the boat. it doesn't look good"): no seabed — the water
 // darkens with depth into a blue (or green) haze, with light shafts, plankton, jellyfish and deep life instead (deepSeaScene.ts,
 // fishSchools.ts deep mode). The sand colours are the haze itself, so the shore strip's seabed reads as deep water.
 'blue-abyss':{id:'blue-abyss',name:'Deep blue open sea',layout:'abyss',coral:['#7ad8ff','#b48cff','#3fa8ff'],
  kinds:{},clusters:0,items:[0,0],spread:0,scale:1,grass:0,kelp:0,rocks:0,rockSize:[.3,.5],pebbles:0,stars:0,shells:0,urchins:0,piles:0,anemones:0,
  grassCol:['#2a5a3a','#6aa06a'],rock:'#4a5260',algae:'#3a5a5a',urchin:['#1a1020','#4a2a5a'],sand:[[.01,.04,.13],[.015,.05,.15]],weed:[0,0,0,0],
  water:[[0,.16,.42],[0,.035,.17]],clear:1.9,fish:{schools:['baitfish','baitfish','baitfish'],cruisers:['tuna','marlin'],glider:'ray'},signature:[],
  deep:{bait:'baitfish',big:['tuna','marlin'],shafts:1,jellies:2,plankton:'#cfefff',jelly:'#c9a6ff'}},
 // The Summit Deep Boat's variant: greener, darker water, a mackerel ball and a turtle far down.
 'abyss-green':{id:'abyss-green',name:'Deep green channel',layout:'abyss',coral:['#7affd0','#ffd27a','#3fe0b0'],
  kinds:{},clusters:0,items:[0,0],spread:0,scale:1,grass:0,kelp:0,rocks:0,rockSize:[.3,.5],pebbles:0,stars:0,shells:0,urchins:0,piles:0,anemones:0,
  grassCol:['#2a5a3a','#6aa06a'],rock:'#4a5a50',algae:'#3a5a4a',urchin:['#1a1020','#4a2a5a'],sand:[[.01,.07,.08],[.015,.08,.09]],weed:[0,0,0,0],
  water:[[0,.24,.3],[0,.06,.1]],clear:2.1,fish:{schools:['mackerel','mackerel','mackerel'],cruisers:['marlin','tuna'],glider:'turtle'},signature:[],
  deep:{bait:'mackerel',big:['marlin','tuna'],shafts:.8,jellies:1,plankton:'#d8ffe8',jelly:'#ffb37a'}},
 'jetty-kelp':{id:'jetty-kelp',name:'Kelp corridor',layout:'kelp',coral:['#ff5a1a','#c4122e','#ffb02e','#ff3f6e'],
  kinds:{anemone:2,soft:2,tube:1,brain:1},clusters:13,items:[2,3],spread:.6,scale:.85,grass:3,kelp:12,rocks:7,rockSize:[.16,.3],pebbles:3,stars:6,shells:5,urchins:4,piles:7,anemones:0,
  grassCol:['#3a6a2a','#9ac05a'],rock:'#77736c',algae:'#6a7a3a',urchin:['#24142e','#5a2f78'],sand:[[.48,.48,.46],[.58,.58,.55]],weed:[.24,.28,.14,.4],
  water:[[0,.36,.5],[0,.12,.26]],clear:1,fish:{schools:['sardine','mackerel','sergeant'],cruisers:['garibaldi','bass','snapper','garibaldi'],glider:null},signature:['clam']},
 'seawall-rubble':{id:'seawall-rubble',name:'Seawall rubble and shallows',layout:'rubble',coral:['#ff8ab8','#5ad6ff','#ffe06a','#ff5aa0','#3fb8ff'],
  kinds:{brain:2,branch:2,soft:2,anemone:2,tube:1},clusters:14,items:[2,4],spread:.7,scale:.85,grass:4,kelp:0,rocks:20,rockSize:[.18,.34],pebbles:5,stars:8,shells:8,urchins:3,piles:0,anemones:1,
  grassCol:['#3a8a3a','#a0e07a'],rock:'#9a948a',algae:'#8aa05a',urchin:['#2a1a3a','#6a4f90'],sand:[[.74,.68,.56],[.84,.78,.64]],weed:[.26,.34,.18,.3],
  water:[[.02,.52,.66],[0,.22,.4]],clear:.8,fish:{schools:['damsel','yellowTang','sardine'],cruisers:['wrasse','parrotPink','butterfly','bream'],glider:'ray'},signature:['football']},
 'channel-tables':{id:'channel-tables',name:'Table-coral terraces',layout:'tables',coral:['#1e7bff','#00c2d4','#3fa0ff','#14e0c8','#5a6cff'],
  kinds:{table:5,branch:1,tube:2,fan:1},clusters:18,items:[2,4],spread:.7,scale:1.2,grass:2,kelp:0,rocks:5,rockSize:[.14,.28],pebbles:3,stars:6,shells:5,urchins:2,piles:0,anemones:0,
  grassCol:['#2a6a4a','#6ac0a0'],rock:'#7a8088',algae:'#5a8a7a',urchin:['#101a2e','#2a4a7a'],sand:[[.56,.58,.58],[.66,.68,.67]],weed:[.16,.26,.2,.25],
  water:[[0,.3,.66],[0,.08,.38]],clear:1,fish:{schools:['damsel','blueTang','sardine'],cruisers:['barracuda','mackerel','queenAngel','parrot'],glider:'ray'},signature:['goal']},
 'turtle-meadow':{id:'turtle-meadow',name:'Green sea-grass meadow',layout:'meadow',coral:['#9be22a','#ffe03a','#3fd07a','#c8f040'],
  kinds:{brain:2,soft:2,branch:1},clusters:8,items:[2,3],spread:.6,scale:.85,grass:40,kelp:0,rocks:4,rockSize:[.12,.24],pebbles:3,stars:6,shells:8,urchins:1,piles:0,anemones:0,
  grassCol:['#1f8a2a','#b8f06a'],rock:'#a09a88',algae:'#7aa04a',urchin:['#2a1a3a','#6a4f90'],sand:[[.66,.64,.54],[.76,.74,.62]],weed:[.14,.38,.1,1],
  water:[[.03,.56,.6],[0,.26,.36]],clear:.75,fish:{schools:['sardine','wrasse','yellowTang'],cruisers:['parrot','bream','wrasse','bass'],glider:'turtle'},signature:['stars']},
 'pink-ring':{id:'pink-ring',name:'Hot-pink ring reef',layout:'ring',coral:['#ff2fa8','#c03cff','#ff5fd0','#8a3cff','#ff8ad8','#e01e8c'],
  kinds:{branch:2,stag:2,brain:2,fan:2,soft:2,tube:1,table:1},clusters:21,items:[4,6],spread:.85,scale:1.05,grass:3,kelp:0,rocks:6,rockSize:[.14,.28],pebbles:4,stars:10,shells:8,urchins:3,piles:0,anemones:2,
  grassCol:['#3a8a3a','#a0e07a'],rock:'#a49a8e',algae:'#9aa86a',urchin:['#2a1a3a','#6a4f90'],sand:[[.72,.7,.64],[.84,.82,.76]],weed:[.26,.34,.18,.2],
  water:[[0,.5,.66],[0,.2,.4]],clear:.85,fish:{schools:['anthias','royalGramma','blueTang'],cruisers:['parrotPink','butterfly','queenAngel','parrot'],glider:'turtle'},signature:['clam']},
 'sunlit-patches':{id:'sunlit-patches',name:'Sunlit patch reef',layout:'patches',coral:['#ff8a00','#ffc400','#ffe14a','#ff6a1a','#ffb000','#fff07a'],
  kinds:{branch:2,brain:2,table:1,stag:1,soft:2,anemone:1,fan:1},clusters:39,items:[2,4],spread:.55,scale:.8,grass:4,kelp:0,rocks:6,rockSize:[.12,.26],pebbles:4,stars:10,shells:10,urchins:3,piles:0,anemones:2,
  grassCol:['#3a8a3a','#a0e07a'],rock:'#a8987e',algae:'#a0a05a',urchin:['#2a1a3a','#6a4f90'],sand:[[.68,.58,.42],[.78,.68,.5]],weed:[.28,.32,.16,.25],
  water:[[.02,.55,.62],[0,.24,.38]],clear:.8,fish:{schools:['yellowTang','sergeant','damsel'],cruisers:['parrot','butterfly','garibaldi','barracuda'],glider:'ray'},signature:['football']},
 'fruit-garden':{id:'fruit-garden',name:'Red and coral garden',layout:'garden',coral:['#ff3b3b','#ff6f61','#ff9a7a','#e8204a','#ff5a8a','#ffb08a'],
  kinds:{soft:4,fan:3,anemone:2,branch:2,brain:1,tube:1},clusters:24,items:[4,6],spread:.75,scale:.9,grass:3,kelp:0,rocks:5,rockSize:[.12,.26],pebbles:4,stars:10,shells:8,urchins:3,piles:0,anemones:2,
  grassCol:['#3a8a3a','#a0e07a'],rock:'#a8968a',algae:'#a08a6a',urchin:['#2a1a3a','#6a4f90'],sand:[[.72,.6,.54],[.82,.7,.63]],weed:[.3,.26,.16,.2],
  water:[[0,.47,.58],[0,.2,.34]],clear:.9,fish:{schools:['anthias','yellowTang','snapper'],cruisers:['snapper','parrotPink','butterfly','bass'],glider:'both'},signature:['goal']},
 'boulder-cove':{id:'boulder-cove',name:'Lilac boulder field',layout:'boulders',coral:['#a36bff','#d9b8ff','#c8f040','#7a3cff'],
  kinds:{brain:2,soft:2,anemone:2,fan:1,tube:1},clusters:16,items:[2,4],spread:.7,scale:.9,grass:3,kelp:1,rocks:10,rockSize:[.45,.85],pebbles:5,stars:6,shells:5,urchins:5,piles:0,anemones:1,
  grassCol:['#2f6a3a','#8fc06a'],rock:'#6a6870',algae:'#5a7a4a',urchin:['#1a1020','#4a2a5a'],sand:[[.36,.36,.4],[.46,.46,.5]],weed:[.2,.26,.18,.35],
  water:[[0,.36,.54],[0,.12,.3]],clear:.95,fish:{schools:['royalGramma','sardine','damsel'],cruisers:['grouper','parrot','wrasse','queenAngel'],glider:null},signature:['anchor']},
 'palm-staghorn':{id:'palm-staghorn',name:'Peach and aqua staghorn thickets',layout:'staghorn',coral:['#ff9a6a','#20d8c8','#ffc49a','#00b8d4','#ff7a5a'],
  kinds:{stag:6,branch:1,brain:1,anemone:1},clusters:11,items:[3,5],spread:.6,scale:1,grass:4,kelp:0,rocks:6,rockSize:[.14,.28],pebbles:4,stars:7,shells:7,urchins:2,piles:0,anemones:1,
  grassCol:['#3a8a3a','#a0e07a'],rock:'#a49a8a',algae:'#9aa86a',urchin:['#2a1a3a','#6a4f90'],sand:[[.74,.72,.62],[.84,.82,.72]],weed:[.26,.34,.18,.2],
  water:[[.02,.54,.64],[0,.24,.4]],clear:.8,fish:{schools:['yellowTang','anthias','sergeant'],cruisers:['butterfly','parrotPink','wrasse','parrot'],glider:'turtle'},signature:['stars']},
 // Summit Isle's Drop-off Ledge (Oct 14 2026): a stepped rocky ledge where the sand drops into deep blue; big groupers and a
 // ray cruise the edge.
 'ledge-dropoff':{id:'ledge-dropoff',name:'Ledge drop-off',layout:'ledge',coral:['#ff4fd8','#ffb02e','#7a5cff','#ff7a5a','#2fe0ff'],
  kinds:{fan:3,brain:2,tube:2,soft:1},clusters:14,items:[3,5],spread:.7,scale:1.1,grass:2,kelp:1,rocks:16,rockSize:[.3,.6],pebbles:3,stars:4,shells:3,urchins:4,piles:0,anemones:0,
  grassCol:['#2f6a3a','#8fc06a'],rock:'#5f5a62',algae:'#5a6a4a',urchin:['#1a1020','#4a2a5a'],sand:[[.46,.44,.4],[.56,.54,.49]],weed:[.2,.24,.16,.3],
  water:[[0,.38,.6],[0,.08,.26]],clear:1.15,fish:{schools:['sardine','anthias','damsel'],cruisers:['grouper','grouper','snapper','barracuda'],glider:'ray'},signature:['anchor'],
  // The ledge drops deeper than any other shore spot, and its far pieces fade hardest into the blue.
  floor:3.9,reefAbsorb:.24,fishAbsorb:.32},
 'lookout-bommies':{id:'lookout-bommies',name:'Stepping-stone bommies',layout:'line',coral:['#2a7fff','#ff7a1a','#5aa8ff','#ffa040','#1fd0ff'],
  kinds:{brain:3,branch:2,table:1,tube:1,anemone:1,fan:1},clusters:12,items:[5,7],spread:.65,scale:1,grass:3,kelp:0,rocks:6,rockSize:[.14,.28],pebbles:4,stars:7,shells:7,urchins:3,piles:0,anemones:1,
  grassCol:['#3a8a3a','#a0e07a'],rock:'#9a9080',algae:'#8a9a5a',urchin:['#2a1a3a','#6a4f90'],sand:[[.7,.64,.52],[.8,.74,.6]],weed:[.26,.32,.18,.25],
  water:[[0,.44,.66],[0,.16,.38]],clear:.9,fish:{schools:['blueTang','sardine','sergeant'],cruisers:['queenAngel','garibaldi','barracuda','parrot'],glider:'ray'},signature:['clam']},
};
/** Old per-style look, for a spot without a `reef` id. */
const STYLE_THEME:Record<SeabedStyle,string>={cay:'sunlit-patches',causeway:'seawall-rubble',beach:'stream-channel',pier:'barnacle-pilings'};
export function reefTheme(spot:{id:string;area?:string;reef?:string}):ReefTheme{return REEF_THEMES[spot.reef??'']??REEF_THEMES[STYLE_THEME[seabedStyle(spot)]];}
/** Deterministic seed from the spot id (FNV-1a). */
export function reefSeed(id:string){let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)%2147483646+1;}
/** The spot's water and sand (shared uniforms: the strip, the reef, the fish and the catch all follow). */
export function applyReefWater(t:ReefTheme){const u=UW_UNIFORMS;u.uUwShallow.value.set(...t.water[0]);u.uUwDeep.value.set(...t.water[1]);u.uUwClear.value=t.clear;
 u.uSandA.value.set(...t.sand[0]);u.uSandB.value.set(...t.sand[1]);u.uSandWeed.value.set(...t.weed);
 u.uUwReef.value=reefAbsorb(t);u.uUwFish.value=fishAbsorb(t);UW_DEPTH.floor=u.uUwFloor.value=t.floor??3.2;}
/** The reef's and the fish's share of the water's absorption for a theme (Oct 14 2026 depth look). */
export function reefAbsorb(t:ReefTheme){return t.reefAbsorb??.155;}
export function fishAbsorb(t:ReefTheme){return t.fishAbsorb??(t.deep?.7:.26);}

type Field={box:T.Vector4;n:number;size:number;lift:Float32Array;distance(x:number,z:number):number};
const C=(hex:string)=>new T.Color(hex),WHITE=new T.Color(1,1,1);
// Light / dark facets (`jit`): each triangle a little brighter or darker, so a coral reads textured without a texture.
let jitSeed=1;const jr=()=>{jitSeed=(jitSeed*16807)%2147483647;return (jitSeed-1)/2147483646;};
/** One prop piece: local geometry (y up from its base), colour from base to tip, sway weight by height (0 = rigid). */
function paint(g:T.BufferGeometry,base:T.Color,tip:T.Color,sway:number,twoSided=false,jit=0){
 let geo=g.index?g.toNonIndexed():g;if(geo!==g)g.dispose();geo.deleteAttribute('uv');geo.deleteAttribute('normal');
 // Thin pieces (blades, ribbons, fans) get both windings, so the mesh can cull back faces (closed shapes never shade their hidden side).
 if(twoSided){const a=geo.getAttribute('position').array as ArrayLike<number>,n=a.length,out=new Float32Array(n*2);out.set(a as Float32Array);
  for(let i=0;i<n;i+=9){out[n+i]=a[i];out[n+i+1]=a[i+1];out[n+i+2]=a[i+2];out[n+i+3]=a[i+6];out[n+i+4]=a[i+7];out[n+i+5]=a[i+8];out[n+i+6]=a[i+3];out[n+i+7]=a[i+4];out[n+i+8]=a[i+5];}
  const d=new T.BufferGeometry();d.setAttribute('position',new T.BufferAttribute(out,3));geo.dispose();geo=d;}
 geo.computeBoundingBox();const bb=geo.boundingBox!,h=Math.max(.001,bb.max.y-bb.min.y),p=geo.getAttribute('position'),n=p.count;
 const col=new Float32Array(n*3),sw=new Float32Array(n),c=new T.Color();let f=1;
 for(let i=0;i<n;i++){if(i%3===0)f=jit?1+jit*(jr()*2-1):1;const k=T.MathUtils.clamp((p.getY(i)-bb.min.y)/h,0,1);c.copy(base).lerp(tip,k).multiplyScalar(f);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;sw[i]=sway*k;}
 geo.setAttribute('color',new T.BufferAttribute(col,3));geo.setAttribute('aSway',new T.BufferAttribute(sw,1));
 if(!geo.getAttribute('normal'))geo.computeVertexNormals();return geo;
}
const M4=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),S=new T.Vector3(),AX=new T.Vector3(0,0,1),AY=new T.Vector3(0,1,0);
const put=(g:T.BufferGeometry,x:number,y:number,z:number,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>g.applyMatrix4(M4.compose(V.set(x,y,z),Q.setFromEuler(E.set(rx,ry,rz)),S.set(sx,sy,sz)));
const merged=(parts:T.BufferGeometry[])=>{const g=mergeGeometries(parts.map(p=>p.index?p.toNonIndexed():p))!;parts.forEach(p=>p.dispose());return g;};
const PALETTE={
 star:['#ff7a2e','#e2453a','#9a4fd0','#3f7fe0','#ffb02e','#ff3fa0'].map(C),
 shell:['#fff1dc','#ffd2c8','#f4e3b5','#ffe9f0'].map(C),
 kelp:C('#6a5a1e'),kelpTip:C('#d8bc3a'),wood:C('#4a3a2a'),woodTip:C('#6a5a40'),barnacle:C('#e9e4d6'),mussel:C('#1f2533'),
};
type Rng=()=>number;
const shade=(c:T.Color,k:number)=>c.clone().multiplyScalar(k),lighten=(c:T.Color,k:number)=>c.clone().lerp(WHITE,k);
function rock(r:Rng,s:number,col:T.Color,algae:T.Color|null,flat=.55){const c=col.clone().multiplyScalar(.85+r()*.3);
 return paint(put(new T.IcosahedronGeometry(s,0),0,s*.06,0,(r()-.5)*.4,r()*6,(r()-.5)*.4,1,flat,1+r()*.3),c,algae?c.clone().lerp(algae,.6):c.clone().multiplyScalar(1.15),0,false,.12);}
function pebbles(r:Rng,parts:T.BufferGeometry[],x:number,y:number,z:number,count:number,col:T.Color){for(let i=0;i<count;i++){const s=.04+r()*.06;parts.push(put(paint(new T.OctahedronGeometry(s,0),col.clone().multiplyScalar(.9+r()*.4),PALETTE.shell[0],0),x+(r()-.5)*.6,y+s*.3,z+(r()-.5)*.6,(r()-.5)*.5,r()*3,0,1,.7,1));}}
// ---- Coral shapes (each a list of painted parts, base at y 0).
function brain(r:Rng,s:number,c:T.Color){return [paint(put(new T.IcosahedronGeometry(s,1),0,s*.2,0,0,r()*6,0,1,.6+r()*.15,1),shade(c,.62),lighten(c,.3),0,false,.2)];}
/** Arms from the base: open tubes, each with a fork part way up (tip found by the same rotations, so forks stay attached). */
function arms(r:Rng,h:number,n:number,tilt:[number,number],rad:number,forks:number,radial=4){
 const parts:T.BufferGeometry[]=[];
 for(let i=0;i<n;i++){const len=h*(.6+r()*.45),a=i/n*Math.PI*2+r()*.8,t=tilt[0]+r()*(tilt[1]-tilt[0]);
  const g=new T.CylinderGeometry(rad*.45,rad,len,radial,1,true).translate(0,len/2,0);g.rotateZ(t);g.rotateY(a);parts.push(g);
  for(let f=0;f<forks;f++)if(r()<.75){const at=.45+r()*.3,l2=len*(.4+r()*.2),p=new T.Vector3(0,len*at,0).applyAxisAngle(AX,t).applyAxisAngle(AY,a);
   const g2=new T.CylinderGeometry(rad*.35,rad*.6,l2,3,1,true).translate(0,l2/2,0);g2.rotateZ(t+(f?-.5:.55));g2.rotateY(a+(r()-.5)*.8);g2.translate(p.x,p.y,p.z);parts.push(g2);}}
 return merged(parts);}
function branch(r:Rng,h:number,c:T.Color){return [paint(arms(r,h,4+Math.floor(r()*3),[.25,.8],.045,1),shade(c,.65),lighten(c,.35),0,false,.1)];}
/** Staghorn: upright antlers that fork twice, with pale tips. */
function stag(r:Rng,h:number,c:T.Color){return [paint(arms(r,h*1.15,5+Math.floor(r()*2),[.08,.42],.032,2,3),shade(c,.7),lighten(c,.6),0,false,.08)];}
function fan(r:Rng,h:number,c:T.Color){const g=new T.CircleGeometry(h,8,0,Math.PI);g.scale(1.3,1,1);g.rotateY(r()*Math.PI);return [paint(g,shade(c,.7),lighten(c,.3),.5,true,.14)];}
function table(r:Rng,s:number,c:T.Color){const top=new T.CylinderGeometry(s,s*.8,.05,8).translate(0,s*.55,0),stem=new T.CylinderGeometry(.04,.07,s*.55,5,1,true).translate(0,s*.275,0);
 const g=merged([top,stem]);g.rotateY(r()*6);return [paint(g,shade(c,.55),lighten(c,.28),0,false,.16)];}
/** Anemone: a short column and a ring of tentacles with bright tips (they sway on desktop). */
function anemone(r:Rng,s:number,c:T.Color,foot:T.Color){const t:T.BufferGeometry[]=[],n=10;
 for(let i=0;i<n;i++){const g=new T.ConeGeometry(.026,s,3,1,true).translate(0,s/2,0);g.rotateZ(.25+r()*.5);g.rotateY(i/n*Math.PI*2+r()*.3);g.translate(0,.05,0);t.push(g);}
 return [paint(merged(t),shade(c,.85),lighten(c,.55),.8),paint(new T.CylinderGeometry(.07,.085,.06,6).translate(0,.03,0),foot,shade(foot,1.2),0)];}
/** Tube sponges: a few open tubes, dark inside. */
function tube(r:Rng,h:number,c:T.Color){const tubes:T.BufferGeometry[]=[],holes:T.BufferGeometry[]=[],n=3+Math.floor(r()*3);
 for(let i=0;i<n;i++){const rr=.035+r()*.03,hh=h*(.5+r()*.65),x=(r()-.5)*.16,z=(r()-.5)*.16;tubes.push(new T.CylinderGeometry(rr,rr*1.15,hh,6,1,true).translate(x,hh/2,z));
  holes.push(new T.CircleGeometry(rr*.92,6).rotateX(-Math.PI/2).translate(x,hh-.02,z));}
 return [paint(merged(tubes),shade(c,.6),lighten(c,.15),0,false,.1),paint(merged(holes),shade(c,.18),shade(c,.18),0)];}
/** Soft coral: fat fronds that sway (desktop). */
function soft(r:Rng,h:number,c:T.Color){const pos:number[]=[],n=5+Math.floor(r()*3);
 for(let i=0;i<n;i++){const a=r()*Math.PI*2,x=Math.cos(a)*.05,z=Math.sin(a)*.05,hh=h*(.6+r()*.5),lx=Math.cos(a)*hh*.35,lz=Math.sin(a)*hh*.35,w=.04+r()*.02,ca=Math.cos(a+1.57)*w,sa=Math.sin(a+1.57)*w,m=.55;
  const b0=[x-ca,0,z-sa],b1=[x+ca,0,z+sa],m0=[x+lx*m-ca*1.4,hh*m,z+lz*m-sa*1.4],m1=[x+lx*m+ca*1.4,hh*m,z+lz*m+sa*1.4],tp=[x+lx,hh,z+lz];
  pos.push(...b0,...b1,...m1,...b0,...m1,...m0,...m0,...m1,...tp);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));return [paint(g,shade(c,.7),lighten(c,.45),1,true,.1)];}
function grass(r:Rng,h:number,base:T.Color,tip:T.Color){const pos:number[]=[],n=5+Math.floor(r()*5);
 for(let i=0;i<n;i++){const a=r()*Math.PI*2,x=Math.cos(a)*.08*r(),z=Math.sin(a)*.08*r(),hh=h*(.6+r()*.5),lean=(r()-.5)*.25,w=.025+r()*.015,ca=Math.cos(a+1.57),sa=Math.sin(a+1.57);
  pos.push(x-ca*w,0,z-sa*w, x+ca*w,0,z+sa*w, x+lean,hh,z+lean*.5);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));return paint(g,base,tip,1,true);}
function kelp(r:Rng,h:number){const pos:number[]=[],strands=3+Math.floor(r()*3);
 // Narrow wavy ribbons, each turning a little as it rises, with a small leaf every other segment.
 for(let s=0;s<strands;s++){const a=r()*Math.PI*2,ox=Math.cos(a)*.14*r(),oz=Math.sin(a)*.14*r(),w=.028+r()*.018,seg=6,hh=h*(.65+r()*.35);let yaw=r()*Math.PI;
  for(let i=0;i<seg;i++){const y0=hh*i/seg,y1=hh*(i+1)/seg,b0=Math.sin(i*1.1+a)*.07,b1=Math.sin((i+1)*1.1+a)*.07,y2=yaw+.35;const c0=Math.cos(yaw)*w,s0=Math.sin(yaw)*w,c1=Math.cos(y2)*w,s1=Math.sin(y2)*w;
   pos.push(ox-c0+b0,y0,oz-s0, ox+c0+b0,y0,oz+s0, ox+c1+b1,y1,oz+s1, ox-c0+b0,y0,oz-s0, ox+c1+b1,y1,oz+s1, ox-c1+b1,y1,oz-s1);
   if(i%2===1){const lx=ox+b1,ly=y1,lz=oz,dir=i%4===1?1:-1;pos.push(lx,ly,lz, lx+dir*Math.cos(yaw)*.14,ly+.05,lz+dir*Math.sin(yaw)*.14, lx,ly+.1,lz);}
   yaw=y2;}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));return paint(g,PALETTE.kelp,PALETTE.kelpTip,1,true);}
let starShape:T.Shape|null=null;
function star(r:Rng,s:number){starShape??=new T.Shape(Array.from({length:10},(_,i)=>{const a=i/10*Math.PI*2,rr=i%2?.38:1;return new T.Vector2(Math.sin(a)*rr,Math.cos(a)*rr);}));
 const g=new T.ExtrudeGeometry(starShape,{depth:.25,bevelEnabled:false,steps:1});g.rotateX(-Math.PI/2);g.scale(s,s,s);g.rotateY(r()*6);const c=PALETTE.star[Math.floor(r()*PALETTE.star.length)];return paint(g,c.clone().multiplyScalar(.85),c.clone().lerp(C('#fff0d8'),.25),0);}
function shell(r:Rng){const c=PALETTE.shell[Math.floor(r()*4)];
 if(r()<.55){const s=.05+r()*.04,g=new T.SphereGeometry(s,6,3,0,Math.PI*2,0,Math.PI/2);g.scale(1,.4,.85);g.rotateY(r()*6);return paint(g,c.clone().multiplyScalar(.85),c,0);}
 const g=new T.ConeGeometry(.04,.13,6);g.rotateZ(Math.PI/2+.2);g.translate(0,.035,0);g.rotateY(r()*6);return paint(g,c,C('#ffb08a'),0);}
function urchin(r:Rng,body:T.Color,tip:T.Color){const parts:T.BufferGeometry[]=[new T.IcosahedronGeometry(.07,0)];for(let i=0;i<10;i++){const g=new T.ConeGeometry(.012,.12,3,1,true).translate(0,.1,0);g.rotateX(r()*Math.PI);g.rotateY(r()*6);parts.push(g);}
 const g=merged(parts);g.translate(0,.05,0);return paint(g,body,tip,0);}
function pile(r:Rng,h:number){const parts:T.BufferGeometry[]=[paint(new T.CylinderGeometry(.15,.17,h,7,1,true).translate(0,h/2,0),PALETTE.wood,PALETTE.woodTip,0,false,.1)];
 for(let i=0;i<14;i++){const a=r()*Math.PI*2,y=h*(.25+r()*.7),g=new T.ConeGeometry(.035,.045,5,1,true).rotateZ(-Math.PI/2).translate(.16,y,0);g.rotateY(a);parts.push(paint(g,PALETTE.barnacle.clone().multiplyScalar(.85),PALETTE.barnacle,0));}
 for(let i=0;i<9;i++){const a=r()*Math.PI*2,y=h*(.1+r()*.45),g=new T.OctahedronGeometry(.04,0).scale(.7,1.5,.7).translate(.17,y,0);g.rotateY(a);parts.push(paint(g,PALETTE.mussel,PALETTE.mussel.clone().lerp(C('#3d4f7a'),.6),0));}
 return parts;}
// ---- Signature props (one or two per spot, for character).
/** A lost old football, half sunk in the sand: white with its twelve dark patches (the icosahedron's corners). */
function football(r:Rng){const g=paint(new T.IcosahedronGeometry(.17,1),C('#f2efe2'),C('#f2efe2'),0),ico=new T.IcosahedronGeometry(1,0).getAttribute('position'),dirs:T.Vector3[]=[];
 for(let i=0;i<ico.count;i++){const v=new T.Vector3().fromBufferAttribute(ico,i).normalize();if(!dirs.some(d=>d.distanceTo(v)<.01))dirs.push(v);}
 const p=g.getAttribute('position'),c=g.getAttribute('color'),v=new T.Vector3(),moss=C('#9aa86a');
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();const dark=dirs.some(d=>d.dot(v)>.97);const k=dark?C('#1d1d22'):C('#f2efe2').lerp(moss,v.y<0?.4:.12);c.setXYZ(i,k.r,k.g,k.b);}
 return [put(g,0,.1,0,r()*3,r()*3,0)];}
function anchor(r:Rng){const rust=C('#7a3b1e'),rustTip=C('#c0703a'),parts=[
 new T.CylinderGeometry(.03,.03,.9,5,1,true).translate(0,.45,0),new T.CylinderGeometry(.022,.022,.5,5,1,true).rotateZ(Math.PI/2).translate(0,.78,0),
 new T.CylinderGeometry(.025,.03,.36,5,1,true).translate(0,.18,0).rotateZ(1.05).translate(0,.04,0),new T.CylinderGeometry(.025,.03,.36,5,1,true).translate(0,.18,0).rotateZ(-1.05).translate(0,.04,0),
 new T.ConeGeometry(.07,.14,3).rotateZ(1.2).translate(-.33,.24,0),new T.ConeGeometry(.07,.14,3).rotateZ(-1.2).translate(.33,.24,0),new T.TorusGeometry(.07,.016,3,6).translate(0,.97,0)];
 const g=paint(merged(parts),rust,rustTip,0,false,.25);g.rotateX(-1.35);g.rotateY(r()*6);g.translate(0,.06,0);return [g];}
function clam(r:Rng,mantle:T.Color){const shellC=C('#e8e2d2');
 const lo=new T.SphereGeometry(.26,7,2,0,Math.PI*2,Math.PI/2,Math.PI/2).scale(1,.4,.62),hi=new T.SphereGeometry(.26,7,2,0,Math.PI*2,0,Math.PI/2).scale(1,.32,.62).rotateX(-.5).translate(0,.05,-.06);
 const m=new T.CircleGeometry(.22,8).scale(1,.5,1).rotateX(-Math.PI/2).rotateX(-.25).translate(0,.04,.02);
 const g=merged([paint(lo,shade(shellC,.8),shellC,0,false,.15),paint(hi,shellC,shade(shellC,.85),0,false,.15),paint(m,shade(mantle,.8),lighten(mantle,.25),0,false,.4)]);g.translate(0,.1,0);g.rotateY(r()*6);return [g];}
/** An old training goal lost to the sea: two posts and a bar, crusted with algae. */
function goal(r:Rng){const w=C('#efeee6'),moss=C('#7a9a4a'),parts=[new T.CylinderGeometry(.03,.03,.62,5,1,true).translate(-.55,.31,0),new T.CylinderGeometry(.03,.03,.62,5,1,true).translate(.55,.31,0),new T.CylinderGeometry(.03,.03,1.13,5,1,true).rotateZ(Math.PI/2).translate(0,.62,0)];
 const g=paint(merged(parts),w.clone().lerp(moss,.6),w,0,false,.15);g.rotateZ((r()-.5)*.2);g.rotateX(-.25);g.rotateY(r()*6);g.translate(0,-.08,0);return [g];}

export type SeabedProps={mesh:T.Mesh;triangles:number;
 /** Every placed piece (Oct 14 2026, tests): its base point (on the seabed) and its top (m, world y). */
 pieces:{x:number;y:number;z:number;top:number}[];
 /** Anemones with a clownfish pair (world position of the tentacle tops), for fishSchools.ts. */
 homes:{x:number;y:number;z:number}[];
 dispose():void};
/**
 * Build the merged seabed for one spot: the theme's layout round the angler's view of the water (seeded by spot id, so it never
 * changes), on the same seabed the strip draws (uwDepthAt of the shore field), kept under the surface, away from underwater ground.
 *
 * `aView` (Oct 13 2026, "cast farther out"): the forward reach of the scatter, in metres (the spot's cast distance + a few metres).
 * Every count is fixed per theme, so a bigger `aView` spreads the same triangle budget wider instead of adding pieces.
 */
export function buildSeabedProps(field:Field,themeIn:ReefTheme|SeabedStyle,stand:{x:number;z:number},dir:{x:number;z:number},phone:boolean,seed:number,halfWidth=9,aView=halfWidth<6?11:15):SeabedProps{
 const theme=typeof themeIn==='string'?REEF_THEMES[STYLE_THEME[themeIn]]:themeIn;
 let s=Math.abs(Math.floor(seed))%2147483646+1;const r:Rng=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};jitSeed=s;
 const {box,n}=field,texel=field.size/n,parts:T.BufferGeometry[]=[],k=phone?.55:1,ux=dir.x,uz=dir.z,homes:{x:number;y:number;z:number}[]=[];
 const pal=theme.coral.map(C),rockC=C(theme.rock),algaeC=C(theme.algae),grassA=C(theme.grassCol[0]),grassB=C(theme.grassCol[1]),urchinA=C(theme.urchin[0]),urchinB=C(theme.urchin[1]);
 const liftAt=(x:number,z:number)=>{const i=Math.floor((x-box.x)/texel),j=Math.floor((z-box.y)/texel);return i<0||j<0||i>=n||j>=n?-.5:field.lift[j*n+i];};
 type P={x:number;z:number;d:number;depth:number;y:number};
 // The theme's own floor depth (the same one applyReefWater gives the shaders), so every piece stands ON the seabed the strip draws.
 const floor=theme.floor??3.2;
 const water=(x:number,z:number):P|null=>{const d=field.distance(x,z);if(d<.3||liftAt(x,z)>=-.45)return null;const depth=uwDepthAt(d,floor);return {x,z,d,depth,y:UW_SURFACE-depth};};
 // a along the cast (out from the angler), b across it.
 const ab=(a:number,b:number)=>water(stand.x+ux*a+uz*b,stand.z+uz*a-ux*b);
 const across=(p:{x:number;z:number})=>(p.x-stand.x)*uz-(p.z-stand.z)*ux;
 // Landscape: the camera looks back from out to the side, so the view widens with distance out (a wedge, like the fish). Portrait
 // phones: the camera hangs straight back over the far water, so the view NARROWS toward it (more of the reef stays on screen).
 const wedge=(a:number)=>halfWidth<6?halfWidth*Math.max(.45,1.25-.8*Math.max(0,a)/aView):halfWidth*(.65+Math.max(0,a)/14);
 const at=(dMin:number,dMax:number,aMax=aView,spread=1,aMin=-1)=>{for(let t=0;t<40;t++){const a=aMin+r()*(aMax-aMin),p=ab(a,(r()*2-1)*wedge(a)*spread);if(p&&p.d>=dMin&&p.d<=dMax)return p;}return null;};
 const near=(c:{x:number;z:number},rad:number,dMin=1.2)=>{for(let t=0;t<10;t++){const p=water(c.x+(r()*2-1)*rad,c.z+(r()*2-1)*rad);if(p&&p.d>=dMin)return p;}return null;};
 const pieces:SeabedProps['pieces']=[];
 const add=(gs:T.BufferGeometry|T.BufferGeometry[],p:{x:number;y:number;z:number},scale=1)=>{let top=-Infinity;
  for(const g of Array.isArray(gs)?gs:[gs]){parts.push(put(g,p.x,p.y,p.z,0,0,0,scale,scale,scale));g.computeBoundingBox();top=Math.max(top,g.boundingBox!.max.y);}
  pieces.push({x:p.x,y:p.y,z:p.z,top});};
 /** Keep a piece of height h under the surface (10 cm clearance): shrink it in shallow water. */
 const fit=(h:number,depth:number)=>Math.min(1,Math.max(.25,(depth-.12)/h));
 const N=(v:number)=>Math.max(v?1:0,Math.round(v*k));
 const kinds=Object.entries(theme.kinds) as [CoralKind,number][],kTotal=kinds.reduce((a,[,w])=>a+w,0);
 const pickKind=()=>{let x=r()*kTotal;for(const [kd,w] of kinds){x-=w;if(x<=0)return kd;}return kinds[0][0];};
 // Light / dark variation inside a cluster: one lead colour, now and then a neighbour from the palette.
 const tone=(lead:number)=>{const c=pal[r()<.72?lead:Math.floor(r()*pal.length)].clone();return c.multiplyScalar(.8+r()*.4);};
 const foot=(c:T.Color)=>c.clone().lerp(pal[(pal.length-1)],.5).multiplyScalar(.6);
 const coral=(q:P,kind:CoralKind,c:T.Color,szIn:number)=>{const sz=szIn*(phone?1.6:1.35);
  switch(kind){
   case 'brain':{const h=.24*sz;add(brain(r,h,c),q,fit(h*1.2,q.depth));break;}
   case 'branch':{const h=.48*sz;add(branch(r,h,c),q,fit(h,q.depth));break;}
   case 'stag':{const h=.5*sz;add(stag(r,h,c),q,fit(h*1.1,q.depth));break;}
   case 'fan':{const h=.42*sz;add(fan(r,h,c),q,fit(h,q.depth));break;}
   case 'table':{const h=.3*sz;add(table(r,h,c),q,fit(h*.7,q.depth));break;}
   case 'anemone':{const h=.22*sz;add(anemone(r,h,c,foot(c)),q,fit(h,q.depth));break;}
   case 'tube':{const h=.4*sz;add(tube(r,h,c),q,fit(h*1.15,q.depth));break;}
   case 'soft':{const h=.34*sz;add(soft(r,h,c),q,fit(h,q.depth));break;}
  }};
 const cluster=(c:{x:number;z:number}|null,scaleMul=1)=>{if(!c)return;const lead=Math.floor(r()*pal.length),items=theme.items[0]+Math.floor(r()*(theme.items[1]-theme.items[0]+1));
  for(let i=0;i<items;i++){const q=near(c,theme.spread);if(q)coral(q,pickKind(),tone(lead),theme.scale*scaleMul*(.75+r()*.6));}};
 const rockAt=(p:P|null,sz:number,flat=.55)=>{if(p)add(rock(r,sz,rockC,r()<.45?algaeC:null,flat),p,fit(sz*.8,p.depth));};
 // ---- Layout: where the coral clusters go (and the big pieces that shape the spot).
 // The whole view, out past the float: on phones the camera hangs over the far water, so the reef must reach it to be seen.
 const nC=N(theme.clusters),L=theme.layout,far=aView,cast=Math.max(6,aView-5);
 const centres:(P|null)[]=[];
 // Open deep sea ('abyss'): every count in the theme is zero, so nothing is placed and the mesh stays empty and hidden (the
 // water column is deepSeaScene.ts).
 if(L==='ring'){// A ring of bommies round a sandy pool, the float near its middle.
  const ca=cast*.85,R=phone?2.6:3.6;for(let i=0;i<nC;i++){const g=i/nC*Math.PI*2+r()*.3;centres.push(ab(ca+Math.cos(g)*R*1.3,Math.sin(g)*R*1.2)??at(1.4,99));}}
 else if(L==='wall'){// A wall along the drop-off: the clusters follow the 4.5 m depth contour across the whole view.
  const dWall=Math.max(4.5,cast*.55);for(let i=0;i<nC;i++){const b=(-1+2*(i+.5)/nC)*wedge(dWall)*1.1+(r()-.5)*.5,d0=dWall+(r()-.5)*.8;let p:P|null=null;for(let a=0;a<aView;a+=.3){const q=ab(a,b);if(q&&q.d>=d0){p=q;break;}}centres.push(p);}}
 else if(L==='line'){// Stepping-stone bommies straight out along the cast.
  for(let i=0;i<nC;i++){const a=2.5+i*(far-3)/Math.max(1,nC-1);centres.push(ab(a,(i%2?.7:-.7)+(r()-.5)*.6));}}
 else if(L==='tables'){const rows=[cast*.4,cast*.7,cast];for(let i=0;i<nC;i++){const a=Math.min(far,rows[i%3]+(r()-.5));centres.push(ab(a,(r()*2-1)*wedge(a)*.85));}}
 else if(L==='channel'||L==='kelp'){for(let i=0;i<nC;i++){const a=2+r()*(far-2.5),side=i%2?1:-1;centres.push(ab(a,side*(L==='kelp'?2.9:1.8)+side*r()*.8));}}
 else if(L==='garden')for(let i=0;i<nC;i++)centres.push(at(2.2,99,far,.75,cast*.3));
 else if(L==='open')for(let i=0;i<nC;i++){const a=4+r()*(aView-4);centres.push(ab(a,(r()*2-1)*wedge(a)*.8));}
 else if(L==='ledge'){// Two steps across the view where the sand drops away: boulders along each edge, coral on their lips.
  for(let i=0;i<nC;i++){const step=i%2,dEdge=step?Math.max(4.5,cast*.6):Math.max(2.4,cast*.3),b=(-1+2*((i>>1)+.5)/Math.ceil(nC/2))*wedge(dEdge)*1.05+(r()-.5)*.6;
   let p:P|null=null;for(let a=0;a<aView;a+=.3){const q=ab(a,b);if(q&&q.d>=dEdge){p=q;break;}}
   if(p){const sz=theme.rockSize[0]+r()*(theme.rockSize[1]-theme.rockSize[0]);rockAt(p,sz,.6);}centres.push(p);}}
 else if(L==='boulders'){// Big boulders first; the coral nestles round their feet.
  for(let i=0;i<N(theme.rocks);i++){const p=at(1,99,far,.9);if(!p)continue;const sz=theme.rockSize[0]+r()*(theme.rockSize[1]-theme.rockSize[0]);rockAt(p,sz,.7);if(i<nC)centres.push(near(p,sz+.3));}}
 else for(let i=0;i<nC;i++)centres.push(at(1.4,99,far,1,L==='lagoon'?cast*.3:-1));
 for(const c of centres)cluster(c,L==='lagoon'||L==='line'?1.15:1);
 // ---- Sea grass: everywhere, in a meadow (bigger tufts), or on both sides of a sandy channel along the cast.
 for(let i=0;i<N(theme.grass);i++){const p=at(.9,99);if(!p)continue;if(L==='channel'&&Math.abs(across(p))<1.5)continue;
  const tufts=L==='meadow'?3+Math.floor(r()*3):2+Math.floor(r()*3);
  for(let j=0;j<tufts;j++){const q=near(p,.6,.7);if(!q)continue;if(L==='channel'&&Math.abs(across(q))<1.3)continue;const h=.25+r()*.3;add(grass(r,h,grassA,grassB),q,fit(h,q.depth));}}
 // ---- Kelp: two rows lining a corridor along the cast, or here and there.
 for(let i=0;i<N(theme.kelp);i++){const p=L==='kelp'?ab(3+Math.floor(i/2)*(far-3)/Math.max(1,Math.ceil(N(theme.kelp)/2)),(i%2?1:-1)*(1.7+r()*.5)):at(3,99);
  if(!p||p.d<2.5)continue;const h=Math.min(1.5,p.depth-.35)*(.7+r()*.3);if(h>.4)add(kelp(r,h),p);}
 // ---- Rocks: a rubble line by the shore, a rocky flat, or a scatter (the boulder field placed its own above).
 if(L!=='boulders')for(let i=0;i<N(theme.rocks);i++){const p=L==='rubble'?at(.6,2.6):at(.6,99);const sz=theme.rockSize[0]+r()*(theme.rockSize[1]-theme.rockSize[0]);rockAt(p,sz,L==='flat'?.4:.55);
  if(p&&theme.piles&&r()<.5)for(let j=0;j<5;j++){const g=new T.ConeGeometry(.03,.04,5,1,true);g.translate((r()-.5)*sz,sz*.45,(r()-.5)*sz);parts.push(put(paint(g,PALETTE.barnacle.clone().multiplyScalar(.85),PALETTE.barnacle,0),p.x,p.y,p.z));}}
 for(let i=0;i<N(theme.pebbles);i++){const p=at(.4,9);if(p)pebbles(r,parts,p.x,p.y,p.z,3+Math.floor(r()*3),rockC);}
 for(let i=0;i<N(theme.stars);i++){const p=at(.6,99);if(p)add(star(r,.08+r()*.06),p);}
 for(let i=0;i<N(theme.shells);i++){const p=at(.3,8);if(p)add(shell(r),p);}
 for(let i=0;i<N(theme.urchins);i++){const p=L==='flat'||L==='boulders'?near(centres[i%Math.max(1,centres.length)]??{x:stand.x+ux*5,z:stand.z+uz*5},1):at(1.2,99);if(p)add(urchin(r,urchinA,urchinB),p);}
 // ---- Anemones with clownfish: where the camera sees them and the fish can swim (2.6 m+ out, see fishSchools.ts).
 for(let i=0;i<(theme.anemones?Math.max(1,N(theme.anemones)):0);i++){const p=at(3,99,aView,.45,cast*.45);if(!p)continue;const lead=Math.floor(r()*pal.length),h=.36*fit(.36,p.depth);
  add(anemone(r,.36,lighten(tone(lead),.15),foot(pal[lead])),p,fit(.36,p.depth));const q=near(p,.4);if(q)add(anemone(r,.28,tone(lead),foot(pal[lead])),q,fit(.28,q.depth));homes.push({x:p.x,y:p.y+h,z:p.z});}
 // ---- Old piles off the pier edge: cut off under the surface, crusted with barnacles and mussels (pilings: anemones and sponges too).
 if(theme.piles){let made=0;for(let t=0;t<220&&made<N(theme.piles);t++){const p=at(.5,4.5,aView+4,1.6);if(!p)continue;if(distanceToLandableDeck(p.x,p.z)>2.2)continue;const h=Math.min(p.depth-.25,.5+r()*.8);if(h<.3)continue;
  add(pile(r,h),p);
  if(L==='pilings'){const a=r()*Math.PI*2,q={x:p.x+Math.cos(a)*.3,y:p.y,z:p.z+Math.sin(a)*.3},c=tone(Math.floor(r()*pal.length));add(r()<.5?tube(r,.3,c):anemone(r,.2,c,foot(c)),q);}
  made++;}}
 // ---- Signature props.
 for(const sig of theme.signature){const p=at(2.2,99,aView,.5,cast*.4);if(!p)continue;
  if(sig==='football')add(football(r),p);else if(sig==='anchor')add(anchor(r),p);else if(sig==='clam')add(clam(r,pal[0]),p);else if(sig==='goal')add(goal(r),p);
  else for(let i=0;i<6;i++){const q=near(p,.45,.6);if(q)add(star(r,.07+r()*.06),q);}}
 const geometry=parts.length?mergeGeometries(parts)!:new T.BufferGeometry();parts.forEach(g=>g.dispose());geometry.computeBoundingSphere();
 const material=new T.MeshLambertMaterial({vertexColors:true,flatShading:true,transparent:true});
 material.onBeforeCompile=sh=>patchUnderwater(sh,{vertexHead:'attribute float aSway;',
  // Sea grass, kelp, fans, anemones and soft corals sway (desktop only; phones and the slow/still path hold them).
  vertexBody:'if(uWaterDetail>1.5&&aSway>0.){float ph=position.x*.71+position.z*.53,w=aSway*aSway;transformed.x+=w*.11*sin(uWaterTime*1.256+ph);transformed.z+=w*.07*sin(uWaterTime*1.004+ph*1.7);}',
  // Depth (Oct 14 2026, "the coral looks like it's on top of the water"): the reef takes the theme's share of the water's
  // absorption (0.22-0.34 × the theme's clarity, was 0.09) and its saturation falls with depth (1.55 in the shallows to 0.88 deep), so only the shallowest
  // pieces are vivid; it sits IN the sand (bury); caustics fade with depth; the surface is drawn over it (patchUnderwater).
  fragmentHead:'',caustic:1.4,absorb:'uUwReef',sat:UW_LOOK.reefSat,bury:true,haze:UW_LOOK.reefHaze,
  // Tropical reef colours: a little of the piece's own colour as glow, so shaded sides stay colourful, not brown.
  beforeTint:'outgoingLight+=diffuseColor.rgb*.16;'});
 material.customProgramCacheKey=()=>'fishing-seabed-props-v3';
 const mesh=new T.Mesh(geometry,material);mesh.name='fishing-seabed';mesh.renderOrder=.55;mesh.matrixAutoUpdate=false;mesh.raycast=()=>{};mesh.visible=parts.length>0;
 const pos=geometry.getAttribute('position');
 return {mesh,triangles:pos?pos.count/3:0,homes,pieces,dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();}};
}
