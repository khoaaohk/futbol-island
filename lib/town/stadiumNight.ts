// West Stadium at night (Nov 13 2026, owner: "at night the stadium's floodlights are not on and the pitch is not lit").
// The night factor fieldLighting.ts already ramps for the island pitches (0 by day, 1 at full night) is copied into one shared
// uniform; the stadium's own paint (its chunk batches, world.ts) and its turf read it in a load-time shader patch: each fragment
// adds its own colour back as light (the island pitches' night emission, fieldLighting: emissive = surface colour), strongest on
// the pitch and the lower rows and fading up the bowl, with the near-white paint on the grass (the line markings) lifted the most. One uniform write
// per night-blend step; no light, no texture, no per-frame work, and the shader is compiled once at load (no variant switch).
// Night lights (Nov 13 2026, owner: "make the stadium look alive at night", stadiumLights.ts): the same patch paints, from the
// fragment's world position, warm pools on the seats under the two roofs (one per roof lamp), the roof beams' hits along the
// pitch edge and the uplights' scalloped washes up the stands' outer walls. A few ALU ops behind the same night branch.
import type * as T from 'three';
import {STADIUM} from './westParkLayout';
import {ROOF,STANDS,standBack} from './stadiumSeats';

/** 0 by day … 1 at full night: written by fieldLighting.ts with its night blend, read by every stadium-night shader. */
export const STADIUM_NIGHT={value:0};

/** Night fill gains: the paint (stands, seats, lines, goals, boards) and the turf (its ground tint keeps the mottle). */
export const STADIUM_NIGHT_GAIN={paint:.3,turf:.2,lines:2.6} as const;

/** The night lights painted by the patch (stadium-local metres): roof lamps every `lampEvery` m along (beams on every other one,
 *  landing `beamHit` m out from the centre line), wall uplights every `washEvery` m; gains are emission × the surface colour. */
export const STADIUM_NIGHT_LIGHTS={lampEvery:4,lampSpan:52,beamHit:33,washEvery:8,roofGain:.75,beamGain:.55,washGain:1.1,warm:[1,.8,.55]} as const;

/** Objects shown only while the night factor is up (the roof beams and glows, stadiumLights.ts): fieldLighting.ts refreshes them
 *  with its night blend (no per-frame work); `allowed` is checked then too (phones on heat tier 2+ drop the beams). */
const nightObjects=new Map<T.Object3D,()=>boolean>();let nightHidden=false;
export function registerStadiumNightObject(object:T.Object3D,allowed:()=>boolean=()=>true){nightObjects.set(object,allowed);refreshStadiumNightObjects();return ()=>{nightObjects.delete(object);};}
export function refreshStadiumNightObjects(){for(const [o,allowed] of nightObjects)o.visible=STADIUM_NIGHT.value>0&&!nightHidden&&allowed();}
/** fieldLighting.ts's night blend (and whether a lesson view hides the stadium's night dressing). */
export function setStadiumNight(value:number,hidden=nightHidden){if(value===STADIUM_NIGHT.value&&hidden===nightHidden)return;STADIUM_NIGHT.value=value;nightHidden=hidden;refreshStadiumNightObjects();}

const f=(n:number)=>n.toFixed(3);
/** The night-lights GLSL (world position w, surface colour sc): see STADIUM_NIGHT_LIGHTS. */
function nightLightsGlsl(){
 const L=STADIUM_NIGHT_LIGHTS,long=standBack(STANDS[0]),end=standBack(STANDS[2]),along=STANDS[2].to,[r,g,b]=L.warm;
 const period=(p:number)=>f(Math.PI*2/p);
 return `{vec2 rel=vStadiumW.xz-vec2(${f(STADIUM.x)},${f(STADIUM.z)});float dl=abs(rel.x),al=rel.y,de=abs(rel.y),ae=rel.x,yy=vStadiumW.y,lit=0.;
 float inLong=step(abs(al),${f(L.lampSpan+2)});
 lit+=inLong*smoothstep(${f(ROOF.front-2)},${f(ROOF.front)},dl)*(1.-smoothstep(${f(ROOF.back-1.5)},${f(ROOF.back)},dl))*step(yy,${f(ROOF.y-1)})
  *(.35+.65*pow(.5+.5*cos(al*${period(L.lampEvery)}),2.))*mix(1.,.55,smoothstep(${f(ROOF.front)},${f(ROOF.back)},dl))*${f(L.roofGain)};
 float hit=(dl-${f(L.beamHit)})/3.;lit+=inLong*exp(-hit*hit)*step(yy,1.5)*pow(.5+.5*cos((al+${f(L.lampSpan)})*${period(L.lampEvery*2)}),3.)*${f(L.beamGain)};
 float washL=step(abs(al),${f(L.lampSpan)})*smoothstep(${f(long-.9)},${f(long-.2)},dl)*(1.-smoothstep(${f(long+.4)},${f(long+1.2)},dl));
 float washE=step(abs(ae),${f(along)})*smoothstep(${f(end-.9)},${f(end-.2)},de)*(1.-smoothstep(${f(end+.4)},${f(end+1.2)},de));
 lit+=(washL*(.3+.7*pow(.5+.5*cos(al*${period(L.washEvery)}),2.))+washE*(.3+.7*pow(.5+.5*cos(ae*${period(L.washEvery)}),2.)))*(1.-smoothstep(.2,6.5,yy))*${f(L.washGain)};
 totalEmissiveRadiance+=sc*vec3(${f(r)},${f(g)},${f(b)})*lit*uStadiumNight;}`;
}

/** onGrass: the gain for non-white paint at grass level (the mown stripes match the turf's fill; the white lines are lifted).
 *  Adds the stadium's night fill to a MeshStandardMaterial (vertex-colour paint or the tinted turf), chaining any existing patch.
 *  The batched pieces sit at the origin unrotated (world.ts), so the vertex height is the world height. */
export function patchStadiumNight<M extends T.Material>(material:M,gain:number,onGrass=gain):M{
 const ground=(1-onGrass/gain).toFixed(3),previous=material.onBeforeCompile,previousKey=material.customProgramCacheKey.bind(material),g=gain.toFixed(3),lines=STADIUM_NIGHT_GAIN.lines.toFixed(2);
 material.onBeforeCompile=(shader,renderer)=>{previous.call(material,shader,renderer);
  shader.uniforms.uStadiumNight=STADIUM_NIGHT;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float vStadiumY;varying vec3 vStadiumW;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvStadiumY=transformed.y;vStadiumW=(modelMatrix*vec4(transformed,1.)).xyz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vStadiumY;varying vec3 vStadiumW;uniform float uStadiumNight;')
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
if(uStadiumNight>0.){vec3 sc=diffuseColor.rgb;float grass=step(vStadiumY,.2),white=step(.72,min(sc.r,min(sc.g,sc.b)))*grass;
 totalEmissiveRadiance+=sc*uStadiumNight*${g}*mix(1.,.3,smoothstep(7.,22.,vStadiumY))*mix(1.-grass*${ground},1.+${lines},white);
 ${nightLightsGlsl()}}`);
 };
 material.customProgramCacheKey=()=>previousKey()+'|stadium-night-'+g+'-'+ground+'-lights';
 return material;
}

/** The lamp glow (the roof lamps in the roof meshes, stadiumWorld.ts, and the lamp hardware mesh, stadiumLights.ts): vertices with
 *  aGlow 1 are lenses that light up warm on the night factor (the masts' lens strength), the rest stays plain paint. */
export const LAMP_GLOW={colour:[1,.9,.72],strength:2.2} as const;
export function patchLampGlow<M extends T.Material>(material:M):M{
 const previous=material.onBeforeCompile,previousKey=material.customProgramCacheKey.bind(material),[r,g,b]=LAMP_GLOW.colour;
 material.onBeforeCompile=(shader,renderer)=>{previous.call(material,shader,renderer);
  shader.uniforms.uStadiumNight=STADIUM_NIGHT;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float aGlow;varying float vGlow;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvGlow=aGlow;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vGlow;uniform float uStadiumNight;')
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
totalEmissiveRadiance+=vec3(${f(r)},${f(g)},${f(b)})*vGlow*uStadiumNight*${f(LAMP_GLOW.strength)};`);
 };
 material.customProgramCacheKey=()=>previousKey()+'|stadium-lamp-glow';
 return material;
}
