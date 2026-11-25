import {Color,MathUtils,type HemisphereLight,type DirectionalLight,type Scene,type WebGLRenderer} from 'three';
export type TimeOfDay='day'|'sunset'|'night';
const presets={
 // Clear daytime: blue sky, neutral sunlight and a soft natural ground bounce.
 // Nov 10 2026: a touch more sun and less flat fill so faces separate (was lower '#929887', hemi 2, direct 3).
 // Nov 21 2026 (zero-heat graphics batch 1, numbers only): less fill and more sun, a bluer sky colour so shadows read blue, a warmer
 // green bounce. Was upper '#eaf4ff', lower '#8a8f7c', hemi 1.6, direct 3.4. Sunset was hemi 1.45, direct 3.2. Night was upper '#9fb0cf',
 // lower '#4a5163', hemi 1.15 (darker, bluer ambient; the town's window and lamp glow in lib/town/world.ts went up to carry it).
 // Nov 24 2026 (owner: day "looks too saturated"): the same light ratio with greyer colours, so every surface and shadow carries
 // less tint: sky '#a9d4ed' -> '#b4d3e3', fill '#d3e6ff' -> '#e1e8f1' (shade still a touch blue), bounce '#a2ab7c' -> '#a7a68f'
 // (no green cast on walls and people), sun '#fff5e6' -> '#fff7ee'.
 day:{sky:'#b4d3e3',upper:'#e1e8f1',lower:'#a7a68f',sun:'#fff7ee',hemi:1.5,direct:3.7,exposure:1},
 // Honey-gold sunlight, apricot sky and warm ochre bounce across the island.
 sunset:{sky:'#efb477',upper:'#ffdda6',lower:'#ad8254',sun:'#ffbf72',hemi:1.3,direct:3.45,exposure:1},// Nov 10 2026: was hemi 1.7, direct 2.95
 // Keep the night sky while warm broad fill reaches trees, paths and pitches.
 // Reusing these lights brightens shadowed scenery without extra light passes.
 // Nov 10 2026: a cooler moonlit fill. One-line revert to the earlier deliberate warm night fill:
 // night:{sky:'#0d1830',upper:'#d4c6af',lower:'#706653',sun:'#c8d0e4',hemi:1.15,direct:1.05,exposure:.98},
 // Nov 24 2026 (owner: night "feels darker and not as good ... needs to feel warmer and more inviting, it's too dark"; the darkening
 // was the Nov 21 batch-1 item B above, 234531cb): a cosy seaside evening bright enough for kids. Fill 0.9 -> 1.3 (+44 %) in a warm
 // lavender, a warm brown ground bounce instead of slate blue, a violet-teal sky (it is also the haze colour, so far streets sink into
 // a warm dusk instead of navy), a softer moon. Was sky '#0d1830', upper '#8098c8', lower '#3c4660', sun '#a8bce6', direct .85, exposure .98.
 night:{sky:'#2f3352',upper:'#b3abcb',lower:'#6a5646',sun:'#bcc6e6',hemi:1.3,direct:.9,exposure:1},
};
/** The island's light presets, shared with the shop snapshots (components/StorePreviews.tsx) so a ball picture is lit like the island. */
export const ISLAND_LIGHT_PRESETS=presets;
/** The island sun's fixed direction (components/Town.tsx `sun.position`). */
export const ISLAND_SUN_POSITION=[-288,252,198] as const;
/** Reuses the scene's existing lights and fixed shadow direction. */
export function createIslandLighting(scene:Scene,hemi:HemisphereLight,sun:DirectionalLight,renderer:WebGLRenderer){
 const colors=Object.fromEntries(Object.entries(presets).map(([key,p])=>[key,{sky:new Color(p.sky),upper:new Color(p.upper),lower:new Color(p.lower),sun:new Color(p.sun)}])) as Record<TimeOfDay,{sky:Color;upper:Color;lower:Color;sun:Color}>;
 let lastMode:TimeOfDay|undefined,settled=false,transitionAge=0;
 return {update(mode:TimeOfDay,dt:number,immediate=false){
  if(mode===lastMode&&settled)return;
  if(mode!==lastMode){lastMode=mode;settled=false;transitionAge=0;}
  transitionAge+=Math.max(0,dt);
  const p=presets[mode],c=colors[mode];
  const close=(a:Color,b:Color)=>Math.max(Math.abs(a.r-b.r),Math.abs(a.g-b.g),Math.abs(a.b-b.b))<1e-7;
  // Finish the imperceptible exponential tail before Town's three-second menu sleep.
  settled=immediate||transitionAge>=2.9||(close(scene.background as Color,c.sky)&&close(hemi.color,c.upper)&&close(hemi.groundColor,c.lower)&&close(sun.color,c.sun)&&Math.abs(hemi.intensity-p.hemi)<1e-7&&Math.abs(sun.intensity-p.direct)<1e-7&&Math.abs(renderer.toneMappingExposure-p.exposure)<1e-7);
  const t=settled?1:1-Math.exp(-dt*4);
  (scene.background as Color).lerp(c.sky,t);hemi.color.lerp(c.upper,t);hemi.groundColor.lerp(c.lower,t);sun.color.lerp(c.sun,t);
  hemi.intensity=MathUtils.lerp(hemi.intensity,p.hemi,t);sun.intensity=MathUtils.lerp(sun.intensity,p.direct,t);renderer.toneMappingExposure=MathUtils.lerp(renderer.toneMappingExposure,p.exposure,t);
 }};
}
