// West Stadium at night (Nov 13 2026, owner: "at night the stadium's floodlights are not on and the pitch is not lit").
// The night factor fieldLighting.ts already ramps for the island pitches (0 by day, 1 at full night) is copied into one shared
// uniform; the stadium's own paint (its chunk batches, world.ts) and its turf read it in a load-time shader patch: each fragment
// adds its own colour back as light (the island pitches' night emission, fieldLighting: emissive = surface colour), strongest on
// the pitch and the lower rows and fading up the bowl, with the near-white paint on the grass (the line markings) lifted the most. One uniform write
// per night-blend step; no light, no texture, no per-frame work, and the shader is compiled once at load (no variant switch).
import type * as T from 'three';

/** 0 by day … 1 at full night: written by fieldLighting.ts with its night blend, read by every stadium-night shader. */
export const STADIUM_NIGHT={value:0};

/** Night fill gains: the paint (stands, seats, lines, goals, boards) and the turf (its ground tint keeps the mottle). */
export const STADIUM_NIGHT_GAIN={paint:.3,turf:.2,lines:2.6} as const;

/** Adds the stadium's night fill to a MeshStandardMaterial (vertex-colour paint or the tinted turf), chaining any existing patch.
 *  The batched pieces sit at the origin unrotated (world.ts), so the vertex height is the world height. */
export function patchStadiumNight<M extends T.Material>(material:M,gain:number):M{
 const previous=material.onBeforeCompile,previousKey=material.customProgramCacheKey.bind(material),g=gain.toFixed(3),lines=STADIUM_NIGHT_GAIN.lines.toFixed(2);
 material.onBeforeCompile=(shader,renderer)=>{previous.call(material,shader,renderer);
  shader.uniforms.uStadiumNight=STADIUM_NIGHT;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float vStadiumY;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvStadiumY=transformed.y;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vStadiumY;uniform float uStadiumNight;')
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
if(uStadiumNight>0.){vec3 sc=diffuseColor.rgb;float lift=step(.72,min(sc.r,min(sc.g,sc.b)))*step(vStadiumY,.2)*${lines};
 totalEmissiveRadiance+=sc*uStadiumNight*${g}*mix(1.,.3,smoothstep(7.,22.,vStadiumY))*(1.+lift);}`);
 };
 material.customProgramCacheKey=()=>previousKey()+'|stadium-night-'+g;
 return material;
}
