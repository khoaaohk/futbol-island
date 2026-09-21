import {Color,MathUtils,type HemisphereLight,type DirectionalLight,type Scene,type WebGLRenderer} from 'three';
export type TimeOfDay='day'|'sunset'|'night';
const presets={
 // Original golden sunset treatment, cooled slightly for warm daylight.
 day:{sky:'#e8c5a6',upper:'#ffe8c5',lower:'#a18a74',sun:'#ffd39c',hemi:2,direct:3,exposure:1},
 // Golden-hour sunlight with a pink sky and rose bounce in shaded surfaces.
 sunset:{sky:'#f29cac',upper:'#ffd4c6',lower:'#ad6f91',sun:'#ffad70',hemi:1.7,direct:2.95,exposure:1},
 // Keep the night sky while warm broad fill reaches trees, paths and pitches.
 // Reusing these lights brightens shadowed scenery without extra light passes.
 night:{sky:'#0d1830',upper:'#d4c6af',lower:'#706653',sun:'#c8d0e4',hemi:1.15,direct:1.05,exposure:.98},
};
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
