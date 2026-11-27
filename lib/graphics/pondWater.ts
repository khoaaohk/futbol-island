import * as T from 'three';
import {WATER_UNIFORMS,SEA_WATER_LOOK,SEA_GLSL,SEA_RIPPLE_PER_M} from './waterSurface';
import {POND_DEPTH,PARK_POND} from '../town/westParkLayout';
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
uniform float uWaterTime,uWaterDetail;uniform vec3 uWaterNight;uniform vec4 uPondRip[${POND_RIPPLES}];varying float vEdge,vSea;varying vec2 vPondXZ;float pFoam=0.;vec2 pRip=vec2(0.);`)
   .replace('#include <map_fragment>',`
#ifdef USE_MAP
 {vec2 rUv=vPondXZ*${SEA_RIPPLE_PER_M.toFixed(6)};float rp=texture2D(map,rUv+uWaterTime*vec2(.014,.006)).r;
  if(uWaterDetail>1.5)rp=max(rp,texture2D(map,vec2(rUv.y,-rUv.x)*1.37+uWaterTime*vec2(-.008,.012)).g);
  diffuseColor.rgb*=mix(vec3(.95),mix(${SEA_GLSL.rippleTint},vec3(1.),rp),.5);}
#endif`)
   .replace('#include <color_fragment>',`#include <color_fragment>
{float dd=vSea,e=smoothstep(0.,1.,vEdge);
 vec3 shallowC=mix(${SEA_GLSL.lagoon},${SEA_GLSL.aqua},smoothstep(.3,5.,dd));diffuseColor.rgb=mix(diffuseColor.rgb,shallowC,(1.-smoothstep(3.,24.,dd))*.7);
 diffuseColor.rgb=mix(diffuseColor.rgb,${SEA_GLSL.deep}*.8,smoothstep(8.,30.,dd)*.92);
 diffuseColor.rgb=mix(vec3(.5,.62,.52),diffuseColor.rgb,e)*uWaterNight;diffuseColor.a*=mix(.18,1.,e)*mix(.38,1.,smoothstep(1.5,22.,dd));
 // polish Nov 27 2026 (owner: "more depth and visually more appealing"): a soft broken foam ring a little in from the bank
 // (vEdge .1-.5 = ~0.2-0.8 m out) that breathes with the ripple clock.
 {vec2 p=vPondXZ;float t=uWaterTime,band=smoothstep(.04,.18,vEdge)*(1.-smoothstep(.3,.62,vEdge));
  float br=.55+.45*sin(p.x*2.3+p.y*1.7+t*1.3)*sin(p.y*2.9-p.x*1.1-t*.9);pFoam=band*smoothstep(.15,.75,br);
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.93,.96,.94)*uWaterNight,pFoam*.75);diffuseColor.a=max(diffuseColor.a,pFoam*.85);}}`)
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
{vec2 p=vPondXZ;float t=uWaterTime;
 vec2 g=vec2(cos(p.x*1.7+p.y*.6+t*1.9),cos(p.y*1.9-p.x*.5+t*1.6))*.06+vec2(cos(p.x*3.9-p.y*2.3-t*2.7),cos(p.y*3.4+p.x*2.1-t*2.4))*.03;
 for(int i=0;i<${POND_RIPPLES};i++){vec4 r=uPondRip[i];float age=t-r.z;if(r.w>0.&&age>0.&&age<${POND_RING.life.toFixed(1)}){vec2 d=p-r.xy;float l=length(d)+1e-3,front=age*${POND_RING.speed.toFixed(1)};
  float k=r.w*(1.-age/${POND_RING.life.toFixed(1)})*exp(-abs(l-front)*2.6);g+=d/l*cos((l-front)*9.)*k*.5;}}
 g*=smoothstep(0.,.5,vEdge);pRip=g;normal=normalize(normal+(viewMatrix*vec4(g.x,0.,g.y,0.)).xyz);}`)
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
{float fr=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);totalEmissiveRadiance+=vec3(.42,.6,.72)*fr*mix(.3,.17,smoothstep(8.,30.,vSea))*uWaterNight*smoothstep(0.,.6,vEdge);
 // polish Nov 27 2026: surface sparkle: a few sun glints a 0.3 m cell that wink with the ripples (crests of the wind ripple field), by day.
 {vec2 c=floor(vPondXZ*3.3),f=fract(vPondXZ*3.3)-.5;float h=fract(sin(dot(c,vec2(127.1,311.7)))*43758.55),tw=sin(uWaterTime*2.6+h*40.+(pRip.x+pRip.y)*30.);
  float day=smoothstep(.55,.95,dot(uWaterNight,vec3(.3333)));totalEmissiveRadiance+=vec3(1.,.97,.88)*step(.82,h)*smoothstep(.9,1.,tw)*smoothstep(.16,.04,length(f))*day*.9*smoothstep(.35,.8,vEdge);}}`);
 };
 m.customProgramCacheKey=()=>'park-pond-water-v3-foam';
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
/** The pond bed (vertex colours: sandy shallows to a deep green-brown middle), ground-tinted like the lawn.
 *  Polish Nov 27 2026 (owner: "fix the pond near the stadium to have more depth and visually more appealing"), all in this one
 *  program (no texture, light, reflection or render target; per-vertex `aBedDepth` m): pebbles and stones (a 0.45 m hash cell, a
 *  rounded stone in about half of them) and dark water-weed patches, both fading out with depth; soft moving caustic light (a twice
 *  domain-warped sine net, bright by day, gone at night, weaker in the deep); and POND_FISH fish shadows gliding round the deep
 *  water on their own closed loops. ~40 ALU + 6 sin a fragment over the bed only (the pond's chunk, behind the west gate).
 *  The clock is the island's water clock (held still for reduced motion and the static heat tiers). */
export const POND_FISH=3;
/** After the albedo is final: the ground tint swaps the bed to its own Lambert program (no roughness chunk there). */
const BED_HOOK=(frag:string)=>frag.includes('#include <specularmap_fragment>')?'#include <specularmap_fragment>':'#include <roughnessmap_fragment>';
export function createPondBedMaterial(){
 const m=applyGroundTint(new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:1}),'mixed'),prev=m.onBeforeCompile,key=m.customProgramCacheKey;
 const P=PARK_POND,F=(v:number)=>v.toFixed(3);
 m.onBeforeCompile=(s,r)=>{prev.call(m,s,r);Object.assign(s.uniforms,{uWaterTime:WATER_UNIFORMS.uWaterTime,uWaterNight:WATER_UNIFORMS.uWaterNight});
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute float aBedDepth;varying float vBedDepth;varying vec2 vBedXZ;')
   .replace('#include <project_vertex>','#include <project_vertex>\nvBedDepth=aBedDepth;vBedXZ=(modelMatrix*vec4(transformed,1.)).xz;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWaterTime;uniform vec3 uWaterNight;varying float vBedDepth;varying vec2 vBedXZ;')
   .replace(BED_HOOK(s.fragmentShader),`${BED_HOOK(s.fragmentShader)}
{float dep=vBedDepth,t=uWaterTime;vec2 p=vBedXZ;
 float near=1.-smoothstep(.25,2.,dep);
 vec2 ce=floor(p*2.2),fc=fract(p*2.2)-.5;float h=fract(sin(dot(ce,vec2(127.1,311.7)))*43758.55);vec2 o=vec2(fract(h*13.1),fract(h*7.7))-.5;
 float st=smoothstep(.2+.12*h,.1,length((fc-o*.45)*vec2(1.,1.35)))*step(.48,h);
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*(.62+.6*fract(h*5.3)),st*near*.85);
 float w=sin(p.x*.9+1.7*sin(p.y*.63))*sin(p.y*.81+1.3*sin(p.x*.47));float weed=smoothstep(.45,.8,w)*smoothstep(.15,.7,dep)*(1.-smoothstep(1.6,2.8,dep));
 weed*=.6+.4*sin(p.x*7.+p.y*3.+sin(t*.8+p.y)*.6);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.16,.3,.15),weed*.6);
 for(int i=0;i<${POND_FISH};i++){float fi=float(i),sp=.11+.035*fi,ph=fi*2.1+t*sp*(mod(fi,2.)>.5?-1.:1.);
  vec2 rad=vec2(${F(P.rx)},${F(P.rz)})*(.22+.12*fi),c=vec2(${F(P.x)},${F(P.z)})+vec2(cos(ph),sin(ph*1.)+.25*sin(ph*2.))*rad;
  vec2 dir=normalize(vec2(-sin(ph),cos(ph)+.5*cos(ph*2.))*rad*(mod(fi,2.)>.5?-1.:1.)),d=p-c;float a=dot(d,dir),b=dot(d,vec2(-dir.y,dir.x))+.05*sin(t*6.+fi)*a;
  float body=smoothstep(1.,.55,length(vec2(a/.42,b/.13)))+smoothstep(1.,.4,length(vec2((a+.48)/.14,b/(.06+.12*clamp(-(a+.4)/.2,0.,1.)))));
  diffuseColor.rgb*=1.-.42*clamp(body,0.,1.)*smoothstep(.5,1.4,dep);}
 vec2 q=p*.95;q+=.45*vec2(sin(q.y*1.3+t*.7),sin(q.x*1.2-t*.6));q+=.25*vec2(sin(q.y*2.7-t*.9),sin(q.x*2.5+t*.8));
 float ca=pow(1.-.5*abs(sin(q.x*2.4)+sin(q.y*2.4)),9.);float day=smoothstep(.55,.95,dot(uWaterNight,vec3(.3333)));
 diffuseColor.rgb+=vec3(.95,1.,.86)*ca*day*(.03+.3*(1.-smoothstep(.3,2.2,dep)))*smoothstep(.02,.25,dep);}`);};
 m.customProgramCacheKey=()=>key.call(m)+'-pondbed-v1';
 return m;}
/** The trails' paving: vertex colours (the cream path, blending to the beach sand where a trail runs onto the beach). */
export function createTrailMaterial(){return applyGroundTint(new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.85}),'trail');}
