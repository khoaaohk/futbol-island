'use client';
import {useEffect,useState} from 'react';
import * as T from 'three';
import {createPlayer} from '@/lib/graphics/player';
import {COIN_REWARD_ID} from '@/lib/town/coinQuest';
import {CLUB_COSTUMES} from '@/lib/town/costumes';
import type {CharacterCustomization} from '@/lib/town/customization';

// One temporary context, one snapshot per frame. Nothing animates after capture.
const previewCostumes=[{id:COIN_REWARD_ID},...CLUB_COSTUMES];
let cacheKey='',cache:Record<string,string>={};
export function useCostumePreviews(open:boolean,value:CharacterCustomization){
 const key=[value.character,value.face,value.body,value.clothing].join(':');
 const [result,setResult]=useState<Record<string,string>>({});
 useEffect(()=>{
  if(!open)return;
  if(cacheKey===key&&Object.keys(cache).length===previewCostumes.length){setResult(cache);return;}
  setResult({});
  let renderer:T.WebGLRenderer|undefined,rig:ReturnType<typeof createPlayer>|undefined,frame=0,disposed=false;
  const clean=()=>{if(disposed)return;disposed=true;cancelAnimationFrame(frame);rig?.dispose();renderer?.dispose();renderer?.forceContextLoss();};
  try{
   renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setSize(320,280);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,320/280,.1,20);
   camera.position.set(1.3,1.55,3.85);camera.lookAt(0,1.05,0);
   scene.add(new T.HemisphereLight('#fff3da','#71817a',2.7));const sun=new T.DirectionalLight('#fff0db',3);sun.position.set(-3,5,4);scene.add(sun);
   rig=createPlayer('costume-preview','home');scene.add(rig.root);
   const snapshots:Record<string,string>={};let index=0;
   const bounds=new T.Box3(),size=new T.Vector3(),center=new T.Vector3(),viewDirection=new T.Vector3(1.3,.47,3.85).normalize();
   const draw=()=>{
    if(disposed)return;
    try{
     const item=previewCostumes[index++];
     rig!.setAppearance({...value,costume:item.id});rig!.update(0,0,0,0,true,{facing:0});
     // Fit the complete mascot, including oversized heads, ears and antlers.
     bounds.setFromObject(rig!.root);bounds.getSize(size);bounds.getCenter(center);
     const distance=Math.max(size.y,size.x/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.12+size.z*.5;
     camera.position.copy(center).addScaledVector(viewDirection,distance);camera.lookAt(center);
     renderer!.render(scene,camera);
     snapshots[item.id]=renderer!.domElement.toDataURL('image/png');
     if(index%3===0||index===previewCostumes.length)setResult({...snapshots});
     if(index<previewCostumes.length)frame=requestAnimationFrame(draw);
     else{cacheKey=key;cache=snapshots;clean();}
    }catch{clean();}
   };
   frame=requestAnimationFrame(draw);
  }catch{clean();}
  return clean;
  // Only the underlying appearance changes these snapshots, not equipped gear.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[open,key]);
 return result;
}
