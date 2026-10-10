'use client';
// Splash cast renderer (dev page, not linked from the island): poses the real bean rig with the preview move driver
// and renders ONE transparent still on demand, cropped to the character. Used by scripts/render-splash-characters.cjs
// to bake public/splash/*.webp for the loading screen. No render loop: `window.__fiSplash.render(spec)` draws once.
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {createPlayer} from '@/lib/graphics/player';
import {createMatchBallTexture} from '@/lib/graphics/matchBallTexture';
import {applyCelebrationArms} from '@/lib/graphics/celebrations';
import {createPreviewDriver,type PreviewMoveId,type PreviewProbe} from '@/lib/graphics/previewMoves';
import {DEFAULT_CUSTOMIZATION,BEAN_PRESETS,beanLookFor,playerOutfit,type CharacterCustomization} from '@/lib/town/customization';
import {matchPlayerDress} from '@/lib/town/beanLooks';
import type {BeanExpression,BeanLook,Outfit} from '@/lib/graphics/beanLook';
import {CLASSIC_GROUND,createTrickCtx,createTrickFrame,sampleTrick,trickById} from '@/lib/graphics/freestyleTricks';

export type SplashSpec={
 /** Main-character builder look (plus an optional club costume), or a match player (team side + keeper). */
 custom?:Partial<CharacterCustomization>;
 match?:{key:string;side:'home'|'away';keeper?:boolean;number:number;look?:Partial<BeanLook>};
 outfit?:Partial<Outfit>;look?:Partial<BeanLook>;number?:number;move:PreviewMoveId;at:number;yaw:number;expression?:BeanExpression;
 /** Camera: azimuth around the rig (radians) and height; `px` = output pixels per metre. */
 azimuth?:number;height?:number;px?:number;ball?:boolean;
 /** Optional island freestyle trick (lib/graphics/freestyleTricks.ts id) posed instead of the preview `move`; `at` = seconds into the trick. */
 trick?:{id:string;side?:-1|1;
  /** Loop sampling: [t0, period] = one cycle of the trick. The rig plays to t0, then repeats that cycle `warm` times (default 6) so
   *  its smoothing settles, then plays `at` seconds further (0 ≤ at < period): frames sampled this way tile seamlessly. */
  cycle?:readonly [number,number];warm?:number};
};

export default function SplashLab(){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const node=host.current;if(!node)return;
  const W=1400,H=1400;
  const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);renderer.setSize(W,H);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;node.appendChild(renderer.domElement);
  const scene=new T.Scene();
  // Warm key from the upper left, cool sky fill, a soft rim from behind so the silhouette pops on the blue backdrop.
  const hemi=new T.HemisphereLight('#fff4dc','#6f86b8',1.9);
  const key=new T.DirectionalLight('#fff0d6',2.8);key.position.set(-3.2,6.5,4.2);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.radius=6;
  Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.1,far:20});key.shadow.bias=-.0008;
  const rim=new T.DirectionalLight('#cfe6ff',1.6);rim.position.set(3.5,3.2,-4);
  scene.add(hemi,key,key.target,rim);
  const ground=new T.Mesh(new T.PlaneGeometry(12,12),new T.ShadowMaterial({opacity:.28,color:'#0b1a4a'}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const ballMap=createMatchBallTexture(),ball=new T.Mesh(new T.SphereGeometry(.19,32,24),new T.MeshStandardMaterial({map:ballMap,roughness:.62}));ball.castShadow=true;scene.add(ball);
  const camera=new T.PerspectiveCamera(20,W/H,.1,60);
  const crop=document.createElement('canvas'),ctx=crop.getContext('2d',{willReadFrequently:true})!;
  let rig:ReturnType<typeof createPlayer>|null=null;
  const render=(spec:SplashSpec)=>{
   if(rig){scene.remove(rig.root);rig.dispose();}
   const r=createPlayer('splash-'+(spec.match?.key??spec.custom?.character??'you'),spec.match?.side??'home');rig=r;scene.add(r.root);
   let look:BeanLook,outfit:Outfit;
   if(spec.match){const d=matchPlayerDress(spec.match.key,spec.match.side,!!spec.match.keeper,spec.match.number);look={...d.look,...spec.match.look};outfit=d.outfit;}
   else{const c={...DEFAULT_CUSTOMIZATION,...BEAN_PRESETS[spec.custom?.character==='female'?'female':'male'],clothing:'classic' as const,...spec.custom} as CharacterCustomization;r.setAppearance(c);look=beanLookFor(c);outfit={...playerOutfit(c),number:spec.number??10};}
   look={...look,...spec.look};outfit={...outfit,...spec.outfit};r.setBeanLook(look,outfit);r.setShirtNumber(outfit.number??null);
   r.root.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=true;});
   // Pose: step the real preview driver to `at` seconds, then settle the face.
   const driver=createPreviewDriver();driver.set(spec.move);const tA=new T.Vector3(),tB=new T.Vector3();
   const probe:PreviewProbe={ankle:(sd,o)=>{r.root.getObjectByName(sd<0?'left-ankle':'right-ankle')!.getWorldPosition(tA);o.x=tA.x;o.y=tA.y;o.z=tA.z;return o;},hands:o=>{r.handPositions(tA,tB);o.x=(tA.x+tB.x)/2;o.y=(tA.y+tB.y)/2;o.z=(tA.z+tB.z)/2;return o;}};
   const dt=1/60;let f=driver.step(0,probe),el=0;
   const apply=()=>{r.update(f.x,f.z,dt,el,false,f.motion);if(f.celebrate>=0)applyCelebrationArms(r.root,f.celebrate);};
   apply();
   const trick=spec.trick?trickById(spec.trick.id):undefined;
   if(trick){
    // Same drive as /skill-lab?skill=<trick>: the trick pose rides PlayerMotion.trick, the ball follows the trick's frame.
    const sd=spec.trick!.side??1,tf=createTrickFrame(),sc=()=>Math.abs(r.root.scale.y)||1;
    const ctx=()=>{const s=sc(),legs=r.profile.legs;return createTrickCtx({legs,pelvisRest:.88+(legs-1)*.83,headTop:r.headTop!==undefined?r.headTop/s:.88+(legs-1)*.83+1.01,ground:(r.root.userData.beanBody as {ground?:number[]}|undefined)?.ground??CLASSIC_GROUND});};
    const tstep=(t:number)=>{sampleTrick(trick,Math.min(trick.seconds,t),sd,ctx(),tf,'solo');r.update(0,0,dt,el,false,{facing:0,trick:tf.pose,juggle:0,juggleTouch:'foot',kickSide:sd} as unknown as typeof f.motion);};
    const cyc=spec.trick!.cycle,end=cyc?cyc[0]+(spec.trick!.warm??6)*cyc[1]+spec.at:spec.at;
    const tt=(s:number)=>!cyc||s<=cyc[0]?s:cyc[0]+((s-cyc[0])%cyc[1]);
    const n=Math.round(end/dt);tstep(0);for(let i=1;i<=n;i++){el+=dt;tstep(tt(i===n?end:i*dt));}
    f={...f,x:0,z:0,ball:{x:tf.ball.x*sc(),y:tf.ball.y*sc(),z:tf.ball.z*sc()},ballVisible:true};
   }
   else for(let s=0;s<spec.at;s+=dt){el+=dt;probe.headTop=r.headTop;probe.juggleHead=r.juggleHead;f=driver.step(dt,probe);apply();}
   r.setExpression(spec.expression??'happy');
   // Turn the whole stage (rig + ball) so the pose faces the camera nicely.
   const yaw=spec.yaw;const rot=(x:number,z:number)=>({x:x*Math.cos(yaw)+z*Math.sin(yaw),z:-x*Math.sin(yaw)+z*Math.cos(yaw)});
   const stage=new T.Group();scene.add(stage);stage.rotation.y=yaw;stage.add(r.root);
   ball.visible=(spec.ball??true)&&f.ballVisible;const b=rot(f.ball.x,f.ball.z);ball.position.set(b.x,f.ball.y,b.z);ball.rotation.set(.6,yaw+.8,.2);
   const c=rot(f.x,f.z);
   // Camera: fixed distance so every character shares one scale (px per metre), slightly low for a heroic read.
   const az=spec.azimuth??.42,hgt=spec.height??1.05,dist=11;
   camera.position.set(c.x+Math.sin(az)*dist,hgt,c.z+Math.cos(az)*dist);camera.lookAt(c.x,.95,c.z);
   key.target.position.set(c.x,0,c.z);key.position.set(c.x-1.8,8,c.z+2.6);rim.position.set(c.x+3.5,3.2,c.z-4);
   renderer.render(scene,camera);
   scene.add(r.root);scene.remove(stage);
   // Crop to the visible pixels (alpha > 2) with a small margin.
   crop.width=W;crop.height=H;ctx.clearRect(0,0,W,H);ctx.drawImage(renderer.domElement,0,0);
   const data=ctx.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=0,y1=0;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(data[(y*W+x)*4+3]>2){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
   const m=6;x0=Math.max(0,x0-m);y0=Math.max(0,y0-m);x1=Math.min(W-1,x1+m);y1=Math.min(H-1,y1+m);
   const out=document.createElement('canvas');out.width=x1-x0+1;out.height=y1-y0+1;out.getContext('2d')!.drawImage(crop,x0,y0,out.width,out.height,0,0,out.width,out.height);
   return {url:out.toDataURL('image/png'),width:out.width,height:out.height,box:[x0,y0,x1,y1]};
  };
  (window as unknown as {__fiSplash?:unknown}).__fiSplash={render};
  return()=>{delete (window as unknown as {__fiSplash?:unknown}).__fiSplash;rig?.dispose();ballMap.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <main style={{background:'#2b53e5',minHeight:'100vh'}}><div ref={host} data-splash-lab style={{width:700,height:700,overflow:'hidden',WebkitTouchCallout:'none',WebkitUserSelect:'none',userSelect:'none'}}/></main>;
}
