import * as T from 'three';
import {CLEAR_WIN,CLEAR_WIN_GLSL,CLEAR_WIN_UNIFORMS,SHORE_GLSL,WATER_UNIFORMS,clearWinK,clearWinNoise} from '../../graphics/waterSurface';
import {createOceanBlend} from '../../graphics/swimClear';
import type {IsleCpuField} from '../../graphics/islandShore';
import {CLEAR_CORAL,CLEAR_LOOK,CLEAR_SHARE,UNDERWATER_GLSL,UW_LIGHT_GLSL,UW_SURFACE,UW_UNIFORMS,clearReefKit,coralFamily,uwDepthAt,type ClearReefKind} from '../fishing/underwater';
import {createWaterNoise} from '../fishing/shoreWater';
import {creatureGeometry,type CreatureKind} from './clearCreatures';
import {distanceToLandableDeck} from '../landableDecks';
import {FISH_SPOTS} from '../fishing/fishCatalog';

/**
 * The clear water window (Oct 19 2026, user: the turquoise bay water near the beaches should be see-through with a sea floor and
 * coral, "Tide Bound" look; docs/water-look-research.md §3, docs/performance-guide.md "Clear water window").
 *
 * Round the point the camera looks at (smoothed, within CLEAR_TIERS reach of the player), only over the shallows (the shore field's first ~20 m off the drawn waterline), the island ocean turns
 * see-through (waterSurface.ts CLEAR_WIN: its blended program, alpha by depth, soft light bands, back to opaque over the last 12 m)
 * and shows:
 *  - ONE seabed sheet (4 m cells, 232 m square): a flat grid that re-snaps to the window centre in 18 m steps; its vertex shader drops each vertex to
 *    the seabed depth of the island shore field (uwDepthAt of the drawn-waterline distance, the same texture the ocean reads), so
 *    nothing is rebuilt on the CPU. Pale sand, the fishing caustic network (uwCaustic: 1 noise read on phones, 2 desktop), the
 *    fishing depth look (absorption and tint toward the deeper blue).
 *  - coral and sea grass: the fishing reef kit (underwater.ts clearReefKit), scattered from a seeded WORLD grid (the same coral at
 *    the same place every time) over the window, nearest first, capped (CLEAR_REEF): ONE InstancedMesh per kind, static, the tips
 *    sway in the vertex shader off the shared water clock (held on the still path and with reduced motion).
 * Gate: heat tiers 0-2 (tier 2: coral only within CLEAR_REEF.near m), never at tiers 3-4 / Battery saver (effective tier 4), never
 * while fishing (its own clear water owns the ocean then), and only while the player is near the shallows. Off: the ocean's render
 * state is restored exactly (the shared createOceanBlend count), every mesh hidden, the uniform's strength 0: today's opaque sea.
 * Per frame: one field lookup, one Vector4 write; the scatter runs only on a 16 m snap or a tier change. No allocation per frame.
 */
export const CLEAR_BED={cell:4,half:116,snap:20,floor:4.2} as const;// floor = underwater.ts CLEAR_LOOK.floor (the fishing catch and schools use it when the window serves)
/**
 * Per heat tier (Oct 19 2026, "see more coral" from the high jetpack view): the window's radius (m, shrinks with a low camera),
 * how far ahead of the player it may reach toward where the camera looks, and the coral caps. Tiers 3-4 / Battery saver: off.
 */
/** The seabed depth under UW_SURFACE at (x, z) as the bed mesh draws it (Oct 19 2026, the dive's floor: waterState.ts diveBedRoom):
 *  its vertices sit on the global CLEAR_BED.cell lattice (the snapped centre and the half size are multiples of it) at uwDepthAt of
 *  the field distance, and each cell is the PlaneGeometry's two triangles (split along (x0, z0+c)–(x0+c, z0)), linear between. */
export function clearBedDepthAt(f:IsleCpuField,x:number,z:number){
 const c=CLEAR_BED.cell,x0=Math.floor(x/c)*c,z0=Math.floor(z/c)*c,u=(x-x0)/c,v=(z-z0)/c,at=(px:number,pz:number)=>uwDepthAt(f.distance(px,pz),CLEAR_BED.floor);
 const B=at(x0,z0+c),D=at(x0+c,z0);
 if(u+v<=1){const A=at(x0,z0);return A+(D-A)*u+(B-A)*v;}
 const C=at(x0+c,z0+c);return C+(B-C)*(1-u)+(D-C)*(1-v);
}
export const CLEAR_TIERS=[{win:100,reach:60,cap:200,grass:260},{win:70,reach:40,cap:70,grass:90},{win:28,reach:12,cap:40,grass:56}] as const;
/**
 * Ambient sea life per heat tier [tier 0, tier 1] (tier 2+, reduced motion, the still path: none). Fish go in schools of `per`.
 * Placement depth bands are the water depth (m) at the home point; `d` is the minimum distance off the waterline.
 */
export const CLEAR_LIFE={fish:{per:6,max:24,tier:[24,12],cell:20,odds:.75,R:[6,12],minD:2.5,periods:[70,100,125,140]},turtle:{max:3,tier:[3,2],cell:40,odds:.7,R:[8,13],minD:3,periods:[175,250]},jelly:{max:6,tier:[6,3],cell:30,odds:.5,R:[3,6],minD:3,periods:[125,175]},crab:{max:10,tier:[10,5],cell:10,odds:.35,depth:[.9,2.4]}} as const;
export const CLEAR_REEF={cap:200,grassCap:260,cell:4.5,far:.3,depth:[.8,6] as const,grassDepth:[.6,4.1] as const,fade:.6} as const;
const KINDS:ClearReefKind[]=['mound','branch','fan'],ALL:ClearReefKind[]=[...KINDS,'grass'];
/** Teal and turquoise with plenty of pink / purple / orange / yellow / coral accents (Oct 19 2026: "more colourful coral") (linear-ish, multiplied by the kit's neutral paint). */
// Shared with the fishing spots' own reefs (underwater.ts CLEAR_CORAL), so walking water and every fishing spot show one coral palette.
const REEF_COLOURS=CLEAR_CORAL.teal.map(c=>new T.Color(c));
const ACCENTS=CLEAR_CORAL.accents.map(c=>new T.Color(c));
const JELLY_COLOURS=['#e8b4d8','#bfaee6','#eed6ea','#aee0dc'].map(c=>new T.Color(c));
const CRAB_COLOURS=['#d98a6a','#cf9a68','#c97a66','#d8b277'].map(c=>new T.Color(c));
const KIND_SALT={fish:0,turtle:100,jelly:200,crab:300};
const FISH_COLOURS=['#d9c46a','#6f9fd8','#d89a62','#dbe8ee','#8fcfc2'].map(c=>new T.Color(c));
const GRASS_COLOURS=CLEAR_CORAL.grass.map(c=>new T.Color(c));

/**
 * Reef boost round every shore fishing spot (Oct 20 2026, user: "at each of the fishing spots, we need to have more concentration
 * of coral and more colours"): within `core` m of the spot's float (its buoy) the scatter places up to `extra` more formations per
 * world cell (patchy, on the same patch noise), now and then a big hero mound, plus small satellites, easing back to the normal
 * density by `R` m; about `fam` of them take the spot's hue family (underwater.ts REEF_HUE). Kept playable: nothing within
 * `clear` m of the float or of the quick-cast stretch of the cast line (from `pool` of the way out), and no boost pieces within `lane` m of the line from the angler to it (the float, rings, fish shadows and
 * the schools stay readable). A function of the world cell only (seeded, world-anchored), the same coral walking by and fishing.
 * Same four InstancedMeshes, same caps: no extra draw.
 */
export const REEF_BOOST={core:11,R:21,clear:6,pool:.62,lane:2.5,extra:3,odds:.55,hero:.3,fam:.6} as const;
const BOOST_SPOTS=FISH_SPOTS.filter(s=>!s.deep).map(s=>({x:s.buoy.x,z:s.buoy.z,sx:s.x,sz:s.z,fam:coralFamily(s.reef).map(c=>new T.Color(c))}));
/** Scratch result of reefBoostAt (no allocation per cell). */
const RB={b:0,clear:false,lane:false,fam:ACCENTS as T.Color[]};
/** The reef boost at (x, z): its strength 0..1, whether the point is in a float's clear disc or an angler's lane, the hue family. */
export function reefBoostAt(x:number,z:number){RB.b=0;RB.clear=RB.lane=false;RB.fam=ACCENTS;
 for(const s of BOOST_SPOTS){const dx=x-s.x,dz=z-s.z;if(Math.abs(dx)>REEF_BOOST.R||Math.abs(dz)>REEF_BOOST.R)continue;const d=Math.hypot(dx,dz);
  // The cast line (angler → float): u along it (0..1), p across it. The quick-cast landings (fishingAim.ts quickCast: the last
  // ~30 % of the line, a metre or two to the side) and the float stay in a clear sandy pool.
  const lx=s.x-s.sx,lz=s.z-s.sz,L2=lx*lx+lz*lz||1,u=Math.min(1,Math.max(0,((x-s.sx)*lx+(z-s.sz)*lz)/L2)),p=Math.hypot(x-s.sx-lx*u,z-s.sz-lz*u);
  if(d<REEF_BOOST.clear||(u>=REEF_BOOST.pool&&p<REEF_BOOST.clear)){RB.clear=true;continue;}
  if(p<REEF_BOOST.lane)RB.lane=true;
  const t=Math.min(1,Math.max(0,(REEF_BOOST.R-d)/(REEF_BOOST.R-REEF_BOOST.core))),b=t*t*(3-2*t);
  if(b>RB.b){RB.b=b;RB.fam=s.fam;}}
 return RB;}

const hash=(i:number,j:number,k:number)=>{let h=Math.imul(i|0,73856093)^Math.imul(j|0,19349663)^Math.imul(k,83492791);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};

/** Shared GLSL for the sheet and the coral: caustics, the depth look and the fade toward the window's deep blue. */
const CLEAR_UNDER=(absorb:number,caustic:number,sat:string,soft:number,over:number)=>/* glsl */`{
 ${UW_LIGHT_GLSL}
 float cwH=max(0.,UW_Y-vCwPos.y);
 // Caustics on the window's scale (one network cell ~1.5 m, read from the camera height; the fishing one is 4x finer):
 // 1 noise read on phones, 2 on desktop, none on the still path.
 float cwC=cwCaustic(vCwPos.xz)*uwCausticFade(cwH*.35)*max(dot(normal,uwUp),0.);
 outgoingLight+=(reflectedLight.directDiffuse+uwIrr*RECIPROCAL_PI*.35)*cwC*${caustic.toFixed(2)};
 // Soft look (Oct 19 2026, "corals too sharp, not enough depth"): flat-shaded facets relax toward their flat colour with depth
 // (no hard dark undersides), the silhouette melts into the water, saturation and contrast fall with depth.
 float cwSoft=${soft.toFixed(2)}*smoothstep(0.,1.6,cwH);
 outgoingLight=mix(outgoingLight,diffuseColor.rgb*(uwIrr*RECIPROCAL_PI*.75+.22),cwSoft);
 outgoingLight=uwDesat(outgoingLight,cwH,vec2(${sat}));
 vec3 cwT=uwTrans(cwH*${absorb.toFixed(2)},cwH*1.4*${absorb.toFixed(2)});
 outgoingLight=outgoingLight*cwT+uwTint(cwH)*(uwIrr*RECIPROCAL_PI*.85+UW_GLOW)*(1.-cwT);
 float cwFr=pow(1.-clamp(abs(normal.z),0.,1.),2.)*smoothstep(0.,1.5,cwH)*${(soft*.8).toFixed(2)};
 outgoingLight=mix(outgoingLight,uwTint(cwH)*(uwIrr*RECIPROCAL_PI*.85+UW_GLOW),cwFr);
 ${over>=1?'// Light shafts, lite: very soft slow diagonal bands across the bed.\n outgoingLight+=vec3(.9,.95,.8)*(uwIrr*RECIPROCAL_PI)*.045*smoothstep(.55,.95,.5+.5*sin((vCwPos.x*.7+vCwPos.z)*.11+uWaterTime*.13))*uwCausticFade(cwH*.4);':''}
 // The surface over it (the fishing pattern: its light shafts, swell and ripple lines, sky reflection, glints), weaker on coral than on the bed.
 vec3 cwV=normalize(vCwPos-cameraPosition);float cwVy=max(.12,-cwV.y);
 if(cwH>0.){vec3 cwO=uwSurfaceOver(outgoingLight,vCwPos.xz-cwV.xz/cwVy*cwH,isleSample(vCwPos.xz),cwVy,cwH/cwVy,cwH,uwIrr*RECIPROCAL_PI);outgoingLight=mix(outgoingLight,cwO,${over.toFixed(2)});}
}`;

const CW_CAUSTIC=/* glsl */`
float cwCaustic(vec2 xz){if(uWaterDetail<.5)return 0.;float t=uWaterTime;vec2 uv=xz*.13;
 float c=texture2D(uWaterNoise,uv+vec2(t*.006,t*.004)).r;
 if(uWaterDetail>1.5){float c2=texture2D(uWaterNoise,uv*.83+vec2(.37-t*.004,.11+t*.006)).r;c=max(c,c2)*.8+c*c2*.4;}
 // A soft halo round the lines, a crisper white core on them (the web network, Oct 19 2026 "Tide Bound" floor) and a twinkle on
 // the brightest crossings: a phase-offset sparkle, off on the still path. Same reads, a few ALU.
 
 return smoothstep(.4,.9,c)*.6+smoothstep(.74,.9,c)*.55;}// the blinking twinkle on the crossings is gone (Oct 20 2026)
`;
/**
 * Ambient sea life (Oct 19 2026, "fish and other sea creatures moving"): fish, sea turtles, jellyfish and crabs (clearCreatures.ts),
 * one InstancedMesh each, every loop computed in the vertex shader off the shared water clock (no CPU per frame, no allocation).
 * The instance matrix is the creature's home (x, surface, z); aFish = (phase, angular speed, size m, loop radius), aFish2 =
 * (depth below the surface, ellipse squash, direction, wobble radius), per-vertex aW weights the flap / wag / sway. Loop periods
 * divide the clock's wrap (3500 s), so nothing jumps. Size grows from 0 with the window strength (uFishK): no blend needed.
 */
// Fishing hand-off (Oct 19 2026): inside the fishing session's shore box the clear window's coral and sea life shrink away by uShore
// (the fishing props and fish take over, no double draw); uniforms the water already shares, no extra draw.
const FISH_BOX='uniform float uShore;uniform vec4 uShoreBox;\nfloat cwBoxK(vec2 xz){vec2 uv=(xz-uShoreBox.xy)/uShoreBox.zw;return 1.-uShore*smoothstep(0.,.14,min(min(uv.x,uv.y),min(1.-uv.x,1.-uv.y)));}\n';
const LIFE_HEAD=FISH_BOX+'uniform float uWaterTime,uWaterDetail,uFishK;uniform vec4 uClearWin;attribute vec4 aFish,aFish2;attribute float aW;\n';
const LIFE_FADE='float lfk=uFishK*cwBoxK(instanceMatrix[3].xz)*(1.-smoothstep(.85,1.,distance(instanceMatrix[3].xz,uClearWin.xy)/max(uClearWin.w,1.)));\n';
/**
 * Per kind: `fa` (loop angle), `fv` (facing, unit xz) in the normal stage, then the body stage places the vertex. aFish = (phase, signed
 * angular speed rad/s, size m, loop radius), aFish2 = (depth below the surface, ellipse squash, loop rotation, wobble radius).
 * The loop is a world-space ellipse round the home (the instance matrix), rotated by aFish2.z; creatures face their travel direction.
 */
const LIFE_GLSL:Record<CreatureKind,{normal:string;body:string}>={
 fish:{normal:`${LIFE_FADE}float fa=aFish.y*uWaterTime+aFish.x;float frc=cos(aFish2.z),frs=sin(aFish2.z);
 vec2 fvr=sign(aFish.y)*(vec2(-sin(fa),aFish2.y*cos(fa))*aFish.w+aFish2.w*vec2(3.*cos(3.*fa+2.*aFish.x),-2.*sin(2.*fa+aFish.x))*.5);
 vec2 fv=normalize(vec2(frc*fvr.x-frs*fvr.y,frs*fvr.x+frc*fvr.y)+1e-5);`,
  body:`vec2 for0=aFish.w*vec2(cos(fa),aFish2.y*sin(fa))+aFish2.w*vec2(sin(3.*fa+2.*aFish.x),cos(2.*fa+aFish.x));vec2 fo=vec2(frc*for0.x-frs*for0.y,frs*for0.x+frc*for0.y);
 vec3 fq=transformed*aFish.z*lfk;fq.z+=step(.5,uWaterDetail)*sin(uWaterTime*7.+aFish.x*3.)*.05*aFish.z*lfk*pow(smoothstep(-.1,.5,transformed.x),2.);
 float fy=-aFish2.x+.07*sin(fa*2.+aFish.x);`},
 turtle:{normal:`${LIFE_FADE}float fa=aFish.y*uWaterTime+aFish.x;float frc=cos(aFish2.z),frs=sin(aFish2.z);
 vec2 fvr=sign(aFish.y)*(vec2(-sin(fa),aFish2.y*cos(fa))*aFish.w+aFish2.w*vec2(3.*cos(3.*fa+2.*aFish.x),-2.*sin(2.*fa+aFish.x))*.5);
 vec2 fv=normalize(vec2(frc*fvr.x-frs*fvr.y,frs*fvr.x+frc*fvr.y)+1e-5);`,
  body:`vec2 for0=aFish.w*vec2(cos(fa),aFish2.y*sin(fa))+aFish2.w*vec2(sin(3.*fa+2.*aFish.x),cos(2.*fa+aFish.x));vec2 fo=vec2(frc*for0.x-frs*for0.y,frs*for0.x+frc*for0.y);
 vec3 fq=transformed*aFish.z*lfk;fq.y+=sin(uWaterTime*2.4+aFish.x)*aW*.14*aFish.z*lfk*sign(transformed.z)*step(.5,uWaterDetail);fq.y-=aW*.05*aFish.z*lfk*step(.5,uWaterDetail);
 float fy=-aFish2.x+.1*sin(fa*3.+aFish.x);`},
 jelly:{normal:`${LIFE_FADE}float fa=uWaterTime*1.2566+aFish.x;
 vec2 fv=vec2(cos(aFish.x*3.),sin(aFish.x*3.));`,
  body:`float fd=aFish.y*uWaterTime+aFish.x;float frc=cos(aFish2.z),frs=sin(aFish2.z);vec2 for0=aFish.w*vec2(cos(fd),aFish2.y*sin(fd));vec2 fo=vec2(frc*for0.x-frs*for0.y,frs*for0.x+frc*for0.y);
 float pu=sin(fa)*step(.5,uWaterDetail);vec3 fq=transformed*aFish.z*lfk;float bell=1.-aW;fq.xz*=1.+bell*.14*pu;fq.y*=1.-bell*.18*pu;fq.xz+=aW*.05*aFish.z*lfk*vec2(sin(uWaterTime*1.4+aFish.x+transformed.y*6.),cos(uWaterTime*1.1+aFish.x+transformed.y*6.));
 float fy=-aFish2.x+.35*sin(fa+1.);`},
 crab:{normal:`${LIFE_FADE}float fa=uWaterTime*.25+aFish.x;
 vec2 fv=vec2(cos(aFish.x*5.),sin(aFish.x*5.));`,
  body:`// Sideways shuffle in bursts (rests between), legs stepping.
 float fb=smoothstep(.1,.6,sin(fa*.5+aFish.x));vec2 fo=vec2(-fv.y,fv.x)*aFish.w*sin(fa)*fb;
 vec3 fq=transformed*aFish.z*lfk;fq.y+=step(.5,uWaterDetail)*aW*.025*aFish.z*lfk*sin(uWaterTime*12.+transformed.x*40.)*fb;
 float fy=-aFish2.x;`},
};
const lifeBody=(kind:CreatureKind)=>LIFE_GLSL[kind].body+`transformed=vec3(-fq.x*fv.x+fq.z*fv.y+fo.x,fq.y+fy,-fq.x*fv.y-fq.z*fv.x+fo.y);\n`;
const lifeNormal=(kind:CreatureKind)=>LIFE_GLSL[kind].normal+`\n objectNormal=vec3(-objectNormal.x*fv.x+objectNormal.z*fv.y,objectNormal.y,-objectNormal.x*fv.y-objectNormal.z*fv.x);\n`;
function underMaterial(kind:'bed'|'reef'|CreatureKind,uniforms:Record<string,T.IUniform>){
 const m=new T.MeshLambertMaterial({color:'#ffffff',vertexColors:kind!=='bed'});
 m.onBeforeCompile=sh=>{
  Object.assign(sh.uniforms,WATER_UNIFORMS,UW_UNIFORMS,CLEAR_WIN_UNIFORMS,uniforms);
  const vHead='varying vec3 vCwPos;varying vec2 vCwN;\n'+(kind==='bed'?SHORE_GLSL:kind!=='reef'?LIFE_HEAD:FISH_BOX+'uniform float uWaterTime,uWaterDetail;uniform vec4 uClearWin;\nattribute float aSway;\n');
  const vBody=kind==='bed'
   // The seabed: each vertex at the field's depth (the same texture and curve the CPU scatter uses).
   ?`{vec2 wxz=(modelMatrix*vec4(transformed,1.)).xz;vec4 f=isleSample(wxz);vCwN=f.gb;transformed.y-=.05+${CLEAR_BED.floor.toFixed(2)}*(1.-exp(-max(f.r,0.)/3.4));}`
   // Coral and grass: tips sway off the water clock (periods 5 s and 4 s divide its wrap), not on the still path.
   :kind!=='reef'?lifeBody(kind)+'vCwN=vec2(0.);'
   :`vCwN=vec2(0.);
    #ifdef USE_INSTANCING
    // Shrinks to nothing over the window's outer fringe (where the sea is opaque anyway), so the placement set never pops.
    transformed*=cwBoxK(instanceMatrix[3].xz)*(1.-smoothstep(.85,1.,distance(instanceMatrix[3].xz,uClearWin.xy)/max(uClearWin.w,1.)));
    if(uWaterDetail>.5){vec2 ip=instanceMatrix[3].xz;transformed.xz+=aSway*vec2(sin(uWaterTime*1.256637+ip.x*.7),cos(uWaterTime*1.570796+ip.y*.6))*.07;}
    #endif`;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+vHead).replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n'+(kind!=='bed'&&kind!=='reef'?lifeNormal(kind):''))
   .replace('#include <begin_vertex>','#include <begin_vertex>\n'+vBody)
   .replace('#include <project_vertex>',`#include <project_vertex>\n{vec4 cwp=vec4(transformed,1.);\n#ifdef USE_INSTANCING\ncwp=instanceMatrix*cwp;\n#endif\nvCwPos=(modelMatrix*cwp).xyz;
// Refraction: seen through moving water, deeper things shimmer more (display only; vCwPos stays put).
float cwWh=min(max(0.,${UW_SURFACE.toFixed(3)}-vCwPos.y),2.5);if(cwWh>0.&&uWaterDetail>.5){float cwt=uWaterTime;vec2 cwB=vec2(sin(vCwPos.x*1.7+vCwPos.z*.9+cwt*1.256637)+.5*sin(vCwPos.z*2.3-cwt*.897598),cos(vCwPos.z*1.9-vCwPos.x*.7+cwt*1.570796)+.5*cos(vCwPos.x*2.1+cwt*.897598))*cwWh*.03;gl_Position=projectionMatrix*viewMatrix*vec4(vCwPos.x+cwB.x,vCwPos.y,vCwPos.z+cwB.y,1.);}}`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCwPos;varying vec2 vCwN;\n'+CLEAR_WIN_GLSL+SHORE_GLSL+UNDERWATER_GLSL+CW_CAUSTIC)
   .replace('#include <color_fragment>',kind==='bed'
    // Pale sand, a little patchy on the field's 14 m / 5 m noise.
    ?`#include <color_fragment>\ndiffuseColor.rgb=mix(vec3(.72,.68,.52),vec3(.86,.82,.66),smoothstep(.3,.75,vCwN.x*.6+vCwN.y*.5));
    // Past the shallows (the swim disc can show this floor out at sea) the sand sinks into the dark sea: no pale patch.
    // Sand at the beach, teal over the first metres, deep blue by ~12-24 m, and a gentle darkening toward the window's outer edge.
    {float cwD=clearWinD(vCwPos.xz,isleSample(vCwPos.xz).r);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.2,.5,.52),smoothstep(1.5,9.,cwD)*.75);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.08,.36,.42),smoothstep(9.,24.,cwD));
     diffuseColor.rgb*=1.-.45*smoothstep(.7,1.,distance(vCwPos.xz,uClearWin.xy)/max(uClearWin.w,1.));}`
    :'#include <color_fragment>')
   .replace('#include <opaque_fragment>',(kind==='bed'?CLEAR_UNDER(.7,1.5,'1.,.7',.25,1):kind==='reef'?CLEAR_UNDER(.3,.8,'1.15,.85',.4,.35)/* Oct 19 2026 audit: less absorb / desat / surface-over so the coral keeps its colour */:CLEAR_UNDER(.4,.6,'1.,.7',.35,.4))+'\n#include <opaque_fragment>');
 };
 m.customProgramCacheKey=()=>'clear-window-'+kind+'-v4';
 return m;
}

export function createClearWindow(scene:T.Scene,field:()=>IsleCpuField|null){
 const blend=createOceanBlend(scene),group=new T.Group();group.name='clear-water-window';group.visible=false;scene.add(group);
 const noise=createWaterNoise();
 // Own copies of the fishing water look (fixed, not the last fishing spot's theme), the noise texture included.
 const uniforms={uWaterNoise:{value:noise as T.Texture},uUwShallow:{value:new T.Vector3(...CLEAR_LOOK.shallow)},uUwDeep:{value:new T.Vector3(...CLEAR_LOOK.deep)},uUwClear:{value:CLEAR_LOOK.clear},uUwFloor:{value:CLEAR_BED.floor},uFishK:{value:0}};
 const n=Math.round(CLEAR_BED.half*2/CLEAR_BED.cell),bedGeo=new T.PlaneGeometry(CLEAR_BED.half*2,CLEAR_BED.half*2,n,n);bedGeo.rotateX(-Math.PI/2);bedGeo.deleteAttribute('uv');
 const bedMat=underMaterial('bed',uniforms),bed=new T.Mesh(bedGeo,bedMat);bed.name='clear-window-seabed';
 bed.frustumCulled=false;bed.castShadow=bed.receiveShadow=false;bed.matrixAutoUpdate=false;bed.raycast=()=>{};group.add(bed);
 const kit=clearReefKit(),reefMat=underMaterial('reef',uniforms),meshes={} as Record<ClearReefKind,T.InstancedMesh>,kitTop={} as Record<ClearReefKind,number>;
 for(const kind of ALL){
  const g=kit[kind];g.computeBoundingBox();kitTop[kind]=g.boundingBox!.max.y;
  const mesh=new T.InstancedMesh(g,reefMat,kind==='grass'?CLEAR_REEF.grassCap:CLEAR_REEF.cap);mesh.name='clear-window-'+kind;mesh.count=0;
  mesh.instanceColor=new T.InstancedBufferAttribute(new Float32Array(mesh.instanceMatrix.count*3),3);
  mesh.castShadow=mesh.receiveShadow=false;mesh.raycast=()=>{};mesh.matrixAutoUpdate=false;meshes[kind]=mesh;group.add(mesh);
 }
 // Ambient sea life: one InstancedMesh per kind, static instance data (home + loop parameters), looped in the vertex shader.
 const LIFE_KINDS:CreatureKind[]=['fish','turtle','jelly','crab'],life={} as Record<CreatureKind,{mesh:T.InstancedMesh;a:T.InstancedBufferAttribute;b:T.InstancedBufferAttribute;want:number;found:number}>;
 for(const kind of LIFE_KINDS){const g=creatureGeometry(kind),n=CLEAR_LIFE[kind].max,a=new T.InstancedBufferAttribute(new Float32Array(n*4),4),b=new T.InstancedBufferAttribute(new Float32Array(n*4),4);g.setAttribute('aFish',a);g.setAttribute('aFish2',b);
  const mesh=new T.InstancedMesh(g,underMaterial(kind,uniforms),n);mesh.name='clear-window-'+kind+'-life';mesh.count=0;mesh.visible=false;mesh.instanceColor=new T.InstancedBufferAttribute(new Float32Array(n*3),3);
  mesh.castShadow=mesh.receiveShadow=false;mesh.raycast=()=>{};mesh.matrixAutoUpdate=false;mesh.frustumCulled=false;group.add(mesh);life[kind]={mesh,a,b,want:0,found:0};}
 const reducedMotion=typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let k=0,cx=NaN,cz=NaN,radius=0,formations=0,capF=0,capG=0,lx=0,lz=0,look=false,winR=0;
 const M=new T.Matrix4(),Q=new T.Quaternion(),P=new T.Vector3(),S=new T.Vector3(),UP=new T.Vector3(0,1,0),COL=new T.Color();
 const placeOk=(f:IsleCpuField,x:number,z:number,lo:number,hi:number)=>{const d=f.distance(x,z);if(d<1.5||d*clearWinK(x,z)>CLEAR_WIN.band[0]+2)return -1;
  const depth=uwDepthAt(d,CLEAR_BED.floor);if(depth<lo||depth>hi||f.lift(x,z)>-.45||distanceToLandableDeck(x,z)<2.5)return -1;return depth;};
 /**
  * Sea life homes on a WORLD grid per kind (cell size CLEAR_LIFE[kind].cell, one seeded candidate per cell, so the same creatures live
  * in the same places wherever the camera is): a loop (world-space ellipse, 8-18 m for fish and turtles) must stay over water at least
  * minD m off the sand all the way round. Nearest rings first; the set only changes at the window's outer fringe.
  */
 const lifeScatter=(f:IsleCpuField)=>{
  for(const kind of LIFE_KINDS){const L=life[kind],lc=CLEAR_LIFE[kind];
   const cs=lc.cell,ci=Math.round(cx/cs),cj=Math.round(cz/cs),rings=Math.ceil(radius/cs);
   ring:for(let r=0;r<=rings;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){
    if(L.found>=L.want)break ring;if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const i=ci+di,j=cj+dj;
    if(hash(i,j,21+KIND_SALT[kind])>=lc.odds)continue;
    const x=(i+.15+.7*hash(i,j,22))*cs,z=(j+.15+.7*hash(i,j,23))*cs;if(Math.hypot(x-cx,z-cz)>radius-4)continue;
    const h0=hash(i,j,24),h1=hash(i,j,25),h2=hash(i,j,26);
    if(kind==='crab'){const depth=placeOk(f,x,z,CLEAR_LIFE.crab.depth[0],CLEAR_LIFE.crab.depth[1]);if(depth<0)continue;const q=L.found++;
     M.makeTranslation(x,UW_SURFACE,z);L.mesh.setMatrixAt(q,M);L.a.setXYZW(q,h1*6.283,0,.55+h0*.5,.5+h2*.6);L.b.setXYZW(q,depth+.01,0,0,0);COL.copy(CRAB_COLOURS[Math.floor(h2*CRAB_COLOURS.length)]);L.mesh.setColorAt(q,COL);continue;}
    const lm=CLEAR_LIFE[kind as 'fish'],R=lm.R[0]+h0*(lm.R[1]-lm.R[0]),sq=.55+h1*.35,rot=h2*6.283,cr=Math.cos(rot),sr=Math.sin(rot),dA=f.distance(x,z);
    if(dA<lm.minD||dA>CLEAR_WIN.band[1])continue;
    let okLoop=true;for(let t=0;t<8&&okLoop;t++){const ang=t*.7854,ex=R*1.15*Math.cos(ang),ez=R*1.15*sq*Math.sin(ang),px=x+ex*cr-ez*sr,pz=z+ex*sr+ez*cr;okLoop=f.distance(px,pz)>=lm.minD&&f.lift(px,pz)<-.2;}
    if(!okLoop)continue;
    const per=kind==='fish'?CLEAR_LIFE.fish.per:1;if(L.found+per>L.want)continue;
    const T0=lm.periods[Math.floor(hash(i,j,27)*lm.periods.length)],dir=hash(i,j,28)<.5?-1:1,ph=hash(i,j,29)*6.283;
    M.makeTranslation(x,UW_SURFACE,z);
    for(let m=0;m<per;m++){const q=L.found+m,a=hash(i,j,30+m*7),b=hash(i,j,31+m*7);L.mesh.setMatrixAt(q,M);
     if(kind==='fish'){L.a.setXYZW(q,ph+(a-.5)*.7,dir*6.2832/T0,.5+b*.3,R*(.9+a*.2));L.b.setXYZW(q,.55+hash(i,j,32+m*7)*.5,sq,rot,.15+b*.5);COL.copy(FISH_COLOURS[Math.floor((m&1?hash(i,j,29):hash(i,j,33+m*7))*FISH_COLOURS.length)]);}
     else if(kind==='turtle'){L.a.setXYZW(q,ph,dir*6.2832/T0,.9+h1*.5,R);L.b.setXYZW(q,.9+h0*.5,sq,rot,.4);COL.setRGB(1,1,1);}
     else{L.a.setXYZW(q,ph,dir*6.2832/T0,.8+h1*.7,R);L.b.setXYZW(q,.7+h0*.8,sq,rot,0);COL.copy(JELLY_COLOURS[Math.floor(h2*JELLY_COLOURS.length)]);}
     L.mesh.setColorAt(q,COL);}
    L.found+=per;}
  }
 };
 /** The seeded scatter round (cx, cz), nearest rings first, capped. Runs on a snap or a tier change only. */
 const scatter=(f:IsleCpuField)=>{
  for(const kind of ALL)meshes[kind].count=0;formations=0;for(const kind of LIFE_KINDS)life[kind].found=0;
  const c=CLEAR_REEF.cell,ci=Math.round(cx/c),cj=Math.round(cz/c),rings=Math.ceil(radius/c);
  for(let ring=0;ring<=rings;ring++)for(let dj=-ring;dj<=ring;dj++)for(let di=-ring;di<=ring;di++){
   if(Math.max(Math.abs(di),Math.abs(dj))!==ring)continue;const i=ci+di,j=cj+dj;
   // Formation: about one cell in three (more round a fishing spot: REEF_BOOST).
   if(formations<capF){const x=(i+hash(i,j,2)-.5)*c,z=(j+hash(i,j,3)-.5)*c,pn=clearWinNoise(x,z,.085,.23,77),patch=pn,rb=reefBoostAt(x,z),b=rb.b,fam=rb.fam;
    // Light clumping only (patch noise): a little denser in some stretches, never big bare gaps.
    if(!rb.clear&&hash(i,j,1)<.42*(.6+.4*patch)*(1+.8*b)&&Math.hypot(x-cx,z-cz)<=radius){const depth=placeOk(f,x,z,CLEAR_REEF.depth[0],CLEAR_REEF.depth[1]);
     if(depth>0){const h4=hash(i,j,4),
      // The kind is a function of the world cell only (never of the camera): the cheap fan and branch dominate, the mound is the accent.
      kind=h4<.45?'fan':h4<.85?'branch':'mound',mesh=meshes[kind];
      // Chunky (1.6-3.2× the kit), never up through the surface.
      const s=Math.min(1.5+hash(i,j,5)*1.3,(depth-.3)/kitTop[kind]);
      if(s>.5){P.set(x,UW_SURFACE-depth-.04,z);Q.setFromAxisAngle(UP,hash(i,j,6)*6.283);S.set(s,s*(.8+hash(i,j,7)*.4),s);mesh.setMatrixAt(mesh.count,M.compose(P,Q,S));
       const a=hash(i,j,8);COL.copy(b>0&&hash(i,j,10)<REEF_BOOST.fam*b?fam[Math.floor(hash(i,j,9)*fam.length)]:a<CLEAR_CORAL.accentShare?ACCENTS[Math.floor(a*27)%ACCENTS.length]:REEF_COLOURS[Math.floor(hash(i,j,9)*REEF_COLOURS.length)]);mesh.setColorAt(mesh.count,COL);mesh.count++;formations++;}}}
    // The reef boost's clumps round a fishing spot: hero mounds and small bright satellites beside the cell's own formation.
    if(b>0&&!rb.lane&&!rb.clear)for(let m=1;m<=REEF_BOOST.extra&&formations<capF;m++){const hm=40+m*7;if(hash(i,j,hm)>=b*REEF_BOOST.odds*(.45+.9*patch))continue;
     const ex=x+(hash(i,j,hm+1)-.5)*c*.9,ez=z+(hash(i,j,hm+2)-.5)*c*.9;if(Math.hypot(ex-cx,ez-cz)>radius)continue;const eb=reefBoostAt(ex,ez);if(eb.clear||eb.lane)continue;
     const depth=placeOk(f,ex,ez,CLEAR_REEF.depth[0],CLEAR_REEF.depth[1]);if(depth<=0)continue;
     const hero=m===1&&hash(i,j,hm+3)<REEF_BOOST.hero*b,h5=hash(i,j,hm+4),kind:ClearReefKind=hero?'mound':h5<.4?'branch':h5<.75?'fan':'mound',mesh=meshes[kind];
     const s=Math.min(hero?2.4+hash(i,j,hm+5)*1:.8+hash(i,j,hm+5)*.7,(depth-.3)/kitTop[kind]);if(s<=.5)continue;
     P.set(ex,UW_SURFACE-depth-.04,ez);Q.setFromAxisAngle(UP,hash(i,j,hm+6)*6.283);S.set(s,s*(.8+hash(i,j,hm+4)*.4),s);mesh.setMatrixAt(mesh.count,M.compose(P,Q,S));
     COL.copy(hash(i,j,hm+5)<.72?fam[Math.floor(hash(i,j,hm+6)*fam.length)]:ACCENTS[Math.floor(hash(i,j,hm+3)*ACCENTS.length)]);mesh.setColorAt(mesh.count,COL);mesh.count++;formations++;}}
   // Sea grass: tufts in about one cell in two, shallower water.
   const grass=meshes.grass;
   if(grass.count<capG&&hash(i,j,11)<.3+.25*clearWinNoise((i+.5)*c,(j+.5)*c,.1,.21,13)){const x=(i+hash(i,j,12)-.5)*c,z=(j+hash(i,j,13)-.5)*c;
    if(Math.hypot(x-cx,z-cz)<=radius){const depth=placeOk(f,x,z,CLEAR_REEF.grassDepth[0],CLEAR_REEF.grassDepth[1]);
     if(depth>0){const s=Math.min(1.4+hash(i,j,14)*1.4,(depth-.25)/kitTop.grass);
      if(s>.5){P.set(x,UW_SURFACE-depth-.02,z);Q.setFromAxisAngle(UP,hash(i,j,15)*6.283);S.set(s,s,s);grass.setMatrixAt(grass.count,M.compose(P,Q,S));
       grass.setColorAt(grass.count,GRASS_COLOURS[Math.floor(hash(i,j,16)*GRASS_COLOURS.length)]);grass.count++;}}}}
  }
  for(const kind of ALL){const mesh=meshes[kind];mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.visible=mesh.count>0;if(mesh.count)mesh.computeBoundingSphere();}
  lifeScatter(f);
  for(const kind of LIFE_KINDS){const L=life[kind];L.mesh.instanceMatrix.needsUpdate=true;L.mesh.instanceColor!.needsUpdate=true;L.a.needsUpdate=L.b.needsUpdate=true;L.mesh.count=L.found;L.mesh.visible=L.found>0;}
 };
 const U=CLEAR_WIN_UNIFORMS.uClearWin.value;
 const off=()=>{group.visible=false;U.z=0;uniforms.uFishK.value=0;blend.release();};
 return {
  /**
   * Once per rendered frame: the player's (x, z), the effective heat tier (4 with Battery saver), whether a fishing session owns
   * the water, and the camera (the window centres on the water point it looks at, smoothed; without one, on the player).
   */
  update(dt:number,x:number,z:number,tier:number,fishing:boolean|number,camera?:T.Camera|null){
   const f=field(),tc=CLEAR_TIERS[tier<3?Math.max(0,tier):0],fs=typeof fishing==='number'?Math.min(1,Math.max(0,fishing)):fishing?1:0;
   let target=0;
   // Whether the window can show the water here (a fishing session lets it serve as the fishing water then: underwater.ts CLEAR_SHARE).
   const near=!!f&&tier<3&&(()=>{const d=f.distance(x,z);return d>-tc.win&&d<CLEAR_WIN.band[1]+tc.win;})();CLEAR_SHARE.available=near;
   if(near&&fs<1)target=1-fs;
   if(target===0&&k===0){if(group.visible||blend.held)off();look=false;return;}
   if(target>k)k=Math.min(1,k+dt/CLEAR_REEF.fade);else if(target<k)k=Math.max(0,k-dt/CLEAR_REEF.fade);
   k=Math.min(k,1-fs);// cross-fade with the fishing water (its strength eases over ~0.8 s): never both at full strength
   if(k<=0||!f){k=0;look=false;off();return;}
   blend.hold();group.visible=true;
   // Where the camera looks: its forward ray down to the water, kept within `reach` of the player, eased (no jumps on a turn).
   let tx=x,tz=z,camH=0;
   if(camera){const e=camera.matrixWorld.elements,dy=-e[9];camH=camera.position.y-UW_SURFACE;
    if(dy<-.05&&camH>0){const t=camH/-dy;tx=camera.position.x-e[8]*t;tz=camera.position.z-e[10]*t;
     const ox=tx-x,oz=tz-z,od=Math.hypot(ox,oz);if(od>tc.reach){tx=x+ox/od*tc.reach;tz=z+oz/od*tc.reach;}}}
   if(!look||!camera){lx=tx;lz=tz;look=true;}else{const a=1-Math.exp(-3*Math.min(dt,.1));lx+=(tx-lx)*a;lz+=(tz-lz)*a;}
   // Radius: the tier's, smaller with a low camera (the screen sees less water then).
   const h=Math.min(1,Math.max(0,(camH-8)/22));winR=tc.win*(camera?.7+.3*h:1);
   const sx=Math.round(lx/CLEAR_BED.snap)*CLEAR_BED.snap,sz=Math.round(lz/CLEAR_BED.snap)*CLEAR_BED.snap,want=tc.win+16;
   const lifeOn=!reducedMotion&&tier<2&&WATER_UNIFORMS.uWaterDetail.value>=.5;let lifeChanged=false;
   for(const kind of LIFE_KINDS){const w=lifeOn?CLEAR_LIFE[kind].tier[tier<1?0:1]:0;if(w!==life[kind].want){life[kind].want=w;lifeChanged=true;}}
   if(sx!==cx||sz!==cz||want!==radius||lifeChanged){cx=sx;cz=sz;radius=want;capF=tc.cap;capG=tc.grass;bed.position.set(cx,UW_SURFACE,cz);bed.updateMatrix();scatter(f);}
   // Serving a fishing session: its own fish schools take over, the ambient sea life fades out (and stops drawing once gone).
   const ke=k*k*(3-2*k),served=CLEAR_SHARE.served;U.set(lx,lz,ke,winR);uniforms.uFishK.value=ke*(1-served);
   for(const kind of LIFE_KINDS){const L=life[kind];L.mesh.visible=L.found>0&&served<.999;}
  },
  get strength(){return k;},
  get open(){return blend.held;},
  get stats(){return {fish:life.fish.found,turtles:life.turtle.found,jellies:life.jelly.found,crabs:life.crab.found,formations,grass:meshes.grass.count,bedTriangles:n*n*2,center:[cx,cz] as const,radius,look:[lx,lz] as const,winRadius:winR};},
  meshes,bed,life,
  dispose(){off();group.removeFromParent();bedGeo.dispose();bedMat.dispose();reefMat.dispose();for(const kind of LIFE_KINDS){life[kind].mesh.geometry.dispose();(life[kind].mesh.material as T.Material).dispose();}for(const g of Object.values(kit))g.dispose();noise.dispose();},
 };
}
export type ClearWindow=ReturnType<typeof createClearWindow>;
