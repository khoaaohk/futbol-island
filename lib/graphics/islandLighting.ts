import {Color,MathUtils,type HemisphereLight,type DirectionalLight,type Scene,type WebGLRenderer} from 'three';
export type TimeOfDay='day'|'sunset'|'night';
const presets={
 day:{sky:'#b5dbe6',upper:'#e6f3ff',lower:'#b3a889',sun:'#fff2d5',hemi:2.1,direct:3.2,exposure:1},
 sunset:{sky:'#e8b98b',upper:'#ffe0aa',lower:'#9b785c',sun:'#ffc477',hemi:2,direct:3,exposure:1},
 night:{sky:'#142039',upper:'#9ebbe3',lower:'#34445f',sun:'#a4bde8',hemi:.85,direct:.95,exposure:.9},
};
/** Reuses the scene's existing lights and fixed shadow direction. */
export function createIslandLighting(scene:Scene,hemi:HemisphereLight,sun:DirectionalLight,renderer:WebGLRenderer){
 const colors=Object.fromEntries(Object.entries(presets).map(([key,p])=>[key,{sky:new Color(p.sky),upper:new Color(p.upper),lower:new Color(p.lower),sun:new Color(p.sun)}])) as Record<TimeOfDay,{sky:Color;upper:Color;lower:Color;sun:Color}>;
 let lastMode:TimeOfDay|undefined,settled=false;
 return {update(mode:TimeOfDay,dt:number,immediate=false){
  if(mode===lastMode&&settled)return;
  if(mode!==lastMode){lastMode=mode;settled=false;}
  const p=presets[mode],c=colors[mode];
  const close=(a:Color,b:Color)=>Math.max(Math.abs(a.r-b.r),Math.abs(a.g-b.g),Math.abs(a.b-b.b))<1e-7;
  settled=immediate||(close(scene.background as Color,c.sky)&&close(hemi.color,c.upper)&&close(hemi.groundColor,c.lower)&&close(sun.color,c.sun)&&Math.abs(hemi.intensity-p.hemi)<1e-7&&Math.abs(sun.intensity-p.direct)<1e-7&&Math.abs(renderer.toneMappingExposure-p.exposure)<1e-7);
  const t=settled?1:1-Math.exp(-dt*4);
  (scene.background as Color).lerp(c.sky,t);hemi.color.lerp(c.upper,t);hemi.groundColor.lerp(c.lower,t);sun.color.lerp(c.sun,t);
  hemi.intensity=MathUtils.lerp(hemi.intensity,p.hemi,t);sun.intensity=MathUtils.lerp(sun.intensity,p.direct,t);renderer.toneMappingExposure=MathUtils.lerp(renderer.toneMappingExposure,p.exposure,t);
 }};
}
