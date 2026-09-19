'use client';
import {useEffect,useState} from 'react';
import * as T from 'three';
import {createBallAppearance} from '@/lib/graphics/ballAppearance';
import {createVehicle} from '@/lib/graphics/vehicle';
import {DEFAULT_CUSTOMIZATION} from '@/lib/town/customization';
import {STORE_ITEMS,type StoreItem} from '@/lib/town/store';
/** Snapshot the actual island vehicle geometry once, using one temporary renderer for every card. */
export function useStorePreviews(open:boolean,onlyItem?:string){
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
   for(const item of STORE_ITEMS.filter(item=>!onlyItem||item.id===onlyItem)){
    const value={...DEFAULT_CUSTOMIZATION,[item.category]:item.option.id};vehicle.setCustomization(value);vehicle.update(item.mode,0,0,-.3,0,0);ball.visible=item.category==='ball';
    if(ball.visible)ballAppearance.setStyle(value.ball);
    const tall=['helicopter','ironman'].includes(item.option.id),wide=item.option.id==='mini-plane';camera.position.set(wide?4.6:3,tall?2.65:wide?3:2.2,tall?4.4:wide?5.2:3.5);camera.lookAt(0,tall?1.15:.72,0);renderer.render(scene,camera);result[item.id]=renderer.domElement.toDataURL('image/png');
   }
   setPreviews(result);
  }catch{/* The catalog and equip actions remain usable without a second WebGL context. */}
  finally{vehicle?.dispose();ballAppearance.dispose();geometry.dispose();material.dispose();renderer?.dispose();renderer?.forceContextLoss();}
 },[open,onlyItem]);
 return previews;
}
export function StorePreview({item,src}:{item:StoreItem;src?:string}){return src?<img src={src} width={340} height={220} alt={`${item.option.label} ${item.category==='jetpack'?'flight equipment':item.category}`} draggable={false}/>:<span role="img" aria-label={`${item.option.label} ${item.category}`} style={{color:item.option.color,fontSize:64}}>{item.category==='ball'?'⚽':item.category==='bike'?'🚲':item.category==='scooter'?'🛴':item.category==='moped'?'🛵':'✦'}</span>;}
