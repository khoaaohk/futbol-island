'use client';
import {useEffect,useState} from 'react';
import * as T from 'three';
import {createBallAppearance} from '@/lib/graphics/ballAppearance';
import {createVehicle} from '@/lib/graphics/vehicle';
import {DEFAULT_CUSTOMIZATION} from '@/lib/town/customization';
import {STORE_ITEMS,type StoreItem} from '@/lib/town/store';
/** Snapshot the actual island vehicle geometry once, using one temporary renderer for every card. */
export function useStorePreviews(open:boolean,onlyItem?:string,shelfFraming=false){
 const [previews,setPreviews]=useState<Record<string,string>>({});
 useEffect(()=>{
  if(!open)return;
  let renderer:T.WebGLRenderer|undefined,vehicle:ReturnType<typeof createVehicle>|undefined;
  const geometry=new T.SphereGeometry(.58,20,16),material=new T.MeshStandardMaterial({roughness:.7});
  const ballAppearance=createBallAppearance(material);
  try{
   renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setSize(340,220);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,340/220,.1,20);camera.position.set(3,2.2,3.5);camera.lookAt(0,.72,0);
   scene.add(new T.HemisphereLight('#ffebc6','#71817a',2.5));const sun=new T.DirectionalLight('#ffdcac',3);sun.position.set(-3,5,4);scene.add(sun);
   vehicle=createVehicle();scene.add(vehicle.root);
   const ball=new T.Group();ball.add(new T.Mesh(geometry,material));ball.position.y=.6;scene.add(ball);
   const result:Record<string,string>={};
   // Reuse two tiny canvases for this finite snapshot batch. Shelf framing trims
   // transparent camera margins and anchors wheels/feet at the image baseline.
   const source=shelfFraming?document.createElement('canvas'):null,target=shelfFraming?document.createElement('canvas'):null;
   if(source&&target){source.width=target.width=340;source.height=target.height=220;}
   const read=source?.getContext('2d',{willReadFrequently:true}),paint=target?.getContext('2d');

   for(const item of STORE_ITEMS.filter(item=>!onlyItem||item.id===onlyItem)){
    const value={...DEFAULT_CUSTOMIZATION,[item.category]:item.option.id};vehicle.setCustomization(value);vehicle.update(item.mode,0,0,-.3,0,0);ball.visible=item.category==='ball';
    if(ball.visible)ballAppearance.setStyle(value.ball);
    const tall=['helicopter','ironman'].includes(item.option.id),wide=item.option.id==='mini-plane';camera.position.set(wide?4.6:3,tall?2.65:wide?3:2.2,tall?4.4:wide?5.2:3.5);camera.lookAt(0,tall?1.15:.72,0);renderer.render(scene,camera);
    if(item.category!=='ball'&&source&&target&&read&&paint){
     read.clearRect(0,0,340,220);read.drawImage(renderer.domElement,0,0);
     const pixels=read.getImageData(0,0,340,220).data;let left=340,right=-1,top=220,bottom=-1;
     for(let y=0;y<220;y++)for(let x=0;x<340;x++)if(pixels[(y*340+x)*4+3]>12){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
     if(right>=left){const w=right-left+1,h=bottom-top+1,scale=Math.min(324/w,212/h),dw=w*scale,dh=h*scale;
      paint.clearRect(0,0,340,220);paint.drawImage(source,left,top,w,h,(340-dw)/2,218-dh,dw,dh);result[item.id]=target.toDataURL('image/png');
     }else result[item.id]=renderer.domElement.toDataURL('image/png');
    }else result[item.id]=renderer.domElement.toDataURL('image/png');
   }
   if(source&&target){source.width=source.height=target.width=target.height=1;}
   setPreviews(result);
  }catch{/* The catalog and equip actions remain usable without a second WebGL context. */}
  finally{vehicle?.dispose();ballAppearance.dispose();geometry.dispose();material.dispose();renderer?.dispose();renderer?.forceContextLoss();}
 },[open,onlyItem,shelfFraming]);
 return previews;
}
export function StorePreview({item,src}:{item:StoreItem;src?:string}){return src?<img src={src} width={340} height={220} alt={`${item.option.label} ${item.category==='jetpack'?'flight equipment':item.category}`} draggable={false}/>:<span role="img" aria-label={`${item.option.label} ${item.category}`} style={{color:item.option.color,fontSize:64}}>{item.category==='ball'?'⚽':item.category==='bike'?'🚲':item.category==='scooter'?'🛴':item.category==='moped'?'🛵':'✦'}</span>;}
