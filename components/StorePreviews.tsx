'use client';
import {useEffect,useState} from 'react';
import * as T from 'three';
import {addBallPatches,createBallAppearance} from '@/lib/graphics/ballAppearance';
import {createVehicle} from '@/lib/graphics/vehicle';
import {ISLAND_LIGHT_PRESETS,ISLAND_SUN_POSITION} from '@/lib/graphics/islandLighting';
import {DEFAULT_CUSTOMIZATION} from '@/lib/town/customization';
import {STORE_ITEMS,type StoreItem} from '@/lib/town/store';
import {ballPictureUrl,ballPictureUrlNow,vendingBallPicture} from '@/lib/graphics/vendingProductArt';
/**
 * Ball framing (user, Sep 30 2026: "fix the perspective of the balls" / "the balls need to be the same as the real balls"):
 * a near-front camera 12° above the ball, looking from the island camera's side, the ball turned so one of the walking ball's six
 * patches sits just off centre with two more spread around it (none on the top pole or the silhouette), lit by the island's own
 * daytime hemisphere + sun (lib/graphics/islandLighting.ts) with the island's ACES tone mapping, and a soft contact shadow.
 * `view` is the ball-local direction that faces the camera; `roll` turns the ball about that line (radians). A style may override
 * it so its signature marking faces front (baked into public/vending/products/ball-<style>.png by scripts/capture-vending-products.cjs).
 */
export const BALL_VIEW={view:[.25,.25,1] as [number,number,number],roll:47*Math.PI/180};
export const BALL_VIEW_BY_STYLE:Partial<Record<string,{view:[number,number,number];roll:number}>>={
 // The laces sit around the +x patch: turn them toward the front so the stitching shows beside it.
 retro:{view:[1,.3,.5],roll:28*Math.PI/180},
};
/** Snapshot the actual island vehicle geometry once, using one temporary renderer for every card.
 *  Heat (overnight audit F6, Sep 30 2026): the first vending open used to render every store item in one ~0.9 s task (phone 4×)
 *  right as the zoom arrived. Balls with a baked picture (public/vending/products, shown by BallPicture) are skipped unless asked
 *  for by id (`onlyItem`) or by the bake script (`window.__fi2BakeBallPictures`), and the rest render over idle time, a few per
 *  slice (requestIdleCallback; Safari: a 400 ms timeout, then short timer slices). The map is still published once, complete,
 *  so callers that cache the first non-empty result (VendingMachine, Backpack) keep every picture. */
export function useStorePreviews(open:boolean,onlyItem?:string,shelfFraming=false){
 const [previews,setPreviews]=useState<Record<string,string>>({});
 useEffect(()=>{
  if(!open)return;
  const bake=(window as Window&{__fi2BakeBallPictures?:boolean}).__fi2BakeBallPictures===true;
  const items=STORE_ITEMS.filter(item=>onlyItem?item.id===onlyItem:bake||item.category!=='ball'||!vendingBallPicture(item.id));
  if(!items.length)return;
  const w=window as Window&{requestIdleCallback?:(cb:(deadline:{timeRemaining:()=>number;didTimeout:boolean})=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};
  let cancelled=false,idleId:number|undefined,timer:ReturnType<typeof setTimeout>|undefined,disposed=false;
  let renderer:T.WebGLRenderer|undefined,vehicle:ReturnType<typeof createVehicle>|undefined,patches:ReturnType<typeof addBallPatches>|undefined,shadowMap:T.CanvasTexture|undefined;
  const shadowGeometry=new T.CircleGeometry(.66,32),shadowMaterial=new T.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false});
  const geometry=new T.SphereGeometry(.58,20,16),material=new T.MeshStandardMaterial({roughness:.7});
  const ballAppearance=createBallAppearance(material);
  let source:HTMLCanvasElement|null=null,target:HTMLCanvasElement|null=null;
  const dispose=()=>{if(disposed)return;disposed=true;if(source&&target){source.width=source.height=target.width=target.height=1;}
   vehicle?.dispose();patches?.dispose();shadowMap?.dispose();shadowGeometry.dispose();shadowMaterial.dispose();ballAppearance.dispose();geometry.dispose();material.dispose();renderer?.dispose();renderer?.forceContextLoss();};
  let snap:((item:StoreItem)=>void)|null=null;
  const result:Record<string,string>={};let next=0;
  const setup=()=>{
   renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setSize(340,220);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
   const r=renderer;
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,340/220,.1,20);camera.position.set(3,2.2,3.5);camera.lookAt(0,.72,0);
   const hemi=new T.HemisphereLight('#ffebc6','#71817a',2.5);scene.add(hemi);const sun=new T.DirectionalLight('#ffdcac',3);sun.position.set(-3,5,4);scene.add(sun);
   // Balls: the island's daytime lights and sun direction, a near-front camera 12° up from the island camera's side.
   const D=ISLAND_LIGHT_PRESETS.day,ballHemi=new T.HemisphereLight(D.upper,D.lower,D.hemi),ballSun=new T.DirectionalLight(D.sun,D.direct);ballSun.position.set(...ISLAND_SUN_POSITION).normalize().multiplyScalar(10);scene.add(ballHemi,ballSun);
   const toCamera=new T.Vector3(16,0,33).normalize(),elevation=T.MathUtils.degToRad(12);toCamera.set(toCamera.x*Math.cos(elevation),Math.sin(elevation),toCamera.z*Math.cos(elevation));
   const ballCamera=new T.PerspectiveCamera(18,340/220,.1,40),ballCentre=new T.Vector3(0,.6,0);ballCamera.position.copy(ballCentre).addScaledVector(toCamera,9.2);ballCamera.lookAt(ballCentre.x,ballCentre.y+.1,ballCentre.z);
   const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;{const g=shadowCanvas.getContext('2d')!,rg=g.createRadialGradient(32,32,0,32,32,32);rg.addColorStop(0,'rgba(24,40,48,.42)');rg.addColorStop(.55,'rgba(24,40,48,.2)');rg.addColorStop(1,'rgba(24,40,48,0)');g.fillStyle=rg;g.fillRect(0,0,64,64);}
   shadowMap=new T.CanvasTexture(shadowCanvas);shadowMaterial.map=shadowMap;const shadow=new T.Mesh(shadowGeometry,shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=.004;scene.add(shadow);
   /** Turn the ball so its local `view` direction faces the camera, with local +y kept upright on screen, then `roll`. */
   const orient=(o:{view:[number,number,number];roll:number})=>{const v=new T.Vector3(...o.view).normalize(),q=new T.Quaternion().setFromUnitVectors(v,toCamera);
    const up=new T.Vector3(0,1,0).applyQuaternion(q).projectOnPlane(toCamera).normalize(),want=new T.Vector3(0,1,0).projectOnPlane(toCamera).normalize();
    const angle=Math.atan2(new T.Vector3().crossVectors(up,want).dot(toCamera),up.dot(want))+o.roll;return new T.Quaternion().setFromAxisAngle(toCamera,angle).multiply(q);};
   const v=vehicle=createVehicle();scene.add(v.root);
   // The same ball as the walking one (components/Town.tsx): skin from ballAppearance plus its six dark patches.
   const ballMesh=new T.Mesh(geometry,material);patches=addBallPatches(ballMesh,.58);const ball=new T.Group();ball.add(ballMesh);ball.position.y=.6;scene.add(ball);
   // Reuse two tiny canvases for this finite snapshot batch. Shelf framing trims
   // transparent camera margins and anchors wheels/feet at the image baseline.
   source=shelfFraming?document.createElement('canvas'):null;target=shelfFraming?document.createElement('canvas'):null;
   if(source&&target){source.width=target.width=340;source.height=target.height=220;}
   const read=source?.getContext('2d',{willReadFrequently:true}),paint=target?.getContext('2d');
   snap=item=>{
    const value={...DEFAULT_CUSTOMIZATION,[item.category]:item.option.id};v.setCustomization(value);v.update(item.mode,0,0,-.3,0,0);ball.visible=item.category==='ball';
    if(ball.visible){ballAppearance.setStyle(value.ball);ball.quaternion.copy(orient(BALL_VIEW_BY_STYLE[value.ball]??BALL_VIEW));}
    hemi.visible=sun.visible=!ball.visible;ballHemi.visible=ballSun.visible=shadow.visible=ball.visible;
    const tall=['helicopter','ironman'].includes(item.option.id),wide=item.option.id==='mini-plane';camera.position.set(wide?4.6:3,tall?2.65:wide?3:2.2,tall?4.4:wide?5.2:3.5);camera.lookAt(0,tall?1.15:.72,0);r.render(scene,ball.visible?ballCamera:camera);
    if(item.category!=='ball'&&source&&target&&read&&paint){
     read.clearRect(0,0,340,220);read.drawImage(r.domElement,0,0);
     const pixels=read.getImageData(0,0,340,220).data;let left=340,right=-1,top=220,bottom=-1;
     for(let y=0;y<220;y++)for(let x=0;x<340;x++)if(pixels[(y*340+x)*4+3]>12){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
     if(right>=left){const w=right-left+1,h=bottom-top+1,scale=Math.min(324/w,212/h),dw=w*scale,dh=h*scale;
      paint.clearRect(0,0,340,220);paint.drawImage(source,left,top,w,h,(340-dw)/2,218-dh,dw,dh);result[item.id]=target.toDataURL('image/png');
     }else result[item.id]=r.domElement.toDataURL('image/png');
    }else result[item.id]=r.domElement.toDataURL('image/png');
   };
  };
  // One slice: set up (first slice) and snapshot items until the idle budget runs out (always at least one item).
  const slice=(budget:()=>number)=>{idleId=timer=undefined;if(cancelled)return;
   try{
    if(!snap){setup();if(budget()<=0){schedule(false);return;}}
    do{snap!(items[next++]);}while(next<items.length&&budget()>0);
   }catch{/* The catalog and equip actions remain usable without a second WebGL context. */cancelled=true;dispose();return;}
   if(next<items.length){schedule(false);return;}
   dispose();setPreviews(result);
  };
  const schedule=(first:boolean)=>{
   if(w.requestIdleCallback)idleId=w.requestIdleCallback(deadline=>slice(()=>deadline.timeRemaining()-4),{timeout:first?1500:1000});
   else timer=setTimeout(()=>{const end=performance.now()+8;slice(()=>end-performance.now());},first?400:30);
  };
  schedule(true);
  return()=>{cancelled=true;if(idleId!==undefined)w.cancelIdleCallback?.(idleId);if(timer!==undefined)clearTimeout(timer);dispose();};
 },[open,onlyItem,shelfFraming]);
 return previews;
}
export function StorePreview({item,src}:{item:StoreItem;src?:string}){return src?<img src={src} width={340} height={220} alt={`${item.option.label} ${item.category==='jetpack'?'flight equipment':item.category}`} draggable={false}/>:<span role="img" aria-label={`${item.option.label} ${item.category}`} style={{color:item.option.color,fontSize:64}}>{item.category==='ball'?'⚽':item.category==='bike'?'🚲':item.category==='scooter'?'🛴':item.category==='moped'?'🛵':'✦'}</span>;}
/** A ball's baked shelf picture (baked from the snapshot above; a cell of the vending ball atlas since Oct 7 2026, copied 1:1 into a
 * blob URL so this <img> has the old ball-<style>.png's size and pixels with no extra request): the vending face, its tray and the
 * backpack show exactly what the machine's glass shows. Its bottom edge is the ball's contact shadow, so CSS can stand it on the
 * shelf line. Falls back to the live snapshot for a ball without one. */
export function BallPicture({item,src}:{item:StoreItem;src?:string}){
 const baked=!!vendingBallPicture(item.id),[pic,setPic]=useState<string|null>(()=>ballPictureUrlNow(item.id));
 useEffect(()=>{if(!baked)return;let live=true;void ballPictureUrl(item.id).then(url=>{if(live&&url)setPic(url);});return()=>{live=false;};},[baked,item.id]);
 return baked?(pic?<img src={pic} alt={`${item.option.label} ball`} data-ball-picture="" draggable={false}/>:null):<StorePreview item={item} src={src}/>;
}
