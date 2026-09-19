'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {createPlayer} from '@/lib/graphics/player';
import {createIslandLighting} from '@/lib/graphics/islandLighting';
import {CUSTOMIZATION_OPTIONS,type CharacterCustomization} from '@/lib/town/customization';
import styles from './CharacterCustomizer.module.css';

/** Uses the exact island rig. One small renderer exists only while the drawer is open. */
export default function CharacterPreview({open,value}:{open:boolean;value:CharacterCustomization}){
 const host=useRef<HTMLDivElement>(null),appearance=useRef(value),refresh=useRef<(()=>void)|null>(null);
 const [failed,setFailed]=useState(false);
 appearance.current=value;
 useEffect(()=>{refresh.current?.();},[value]);
 useEffect(()=>{
  const element=host.current;if(!open||!element)return;
  setFailed(false);
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.dataset.characterPreview='true';element.appendChild(renderer.domElement);
  const scene=new T.Scene();scene.background=new T.Color('#e8b98b');
  const camera=new T.PerspectiveCamera(32,1,.1,20);camera.position.set(2.2,1.85,4.7);camera.lookAt(0,.9,0);
  const hemi=new T.HemisphereLight(),sun=new T.DirectionalLight();sun.position.set(-3,6,4);sun.castShadow=true;sun.shadow.mapSize.set(512,512);Object.assign(sun.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:.1,far:15});sun.shadow.bias=-.001;scene.add(hemi,sun);
  createIslandLighting(scene,hemi,sun,renderer).update('sunset',0,true);
  const rig=createPlayer('you','home');scene.add(rig.root);
  const groundGeometry=new T.CircleGeometry(2,48),groundMaterial=new T.MeshStandardMaterial({color:'#d6c891',roughness:1});
  const ground=new T.Mesh(groundGeometry,groundMaterial);ground.rotation.x=-Math.PI/2;ground.position.y=-.01;ground.receiveShadow=true;scene.add(ground);
  // Frame the visible equipped rig, including tall ears, horns and oversized heads.
  // Refit only after appearance or viewport changes, not during the idle animation.
  let needsFit=true,needsAppearance=true;
  const bounds=new T.Box3(),center=new T.Vector3(),offset=new T.Vector3(2.2,.95,4.7).normalize();
  const right=new T.Vector3().crossVectors(camera.up,offset).normalize(),up=new T.Vector3().crossVectors(offset,right).normalize();
  const fit=()=>{
   rig.root.updateMatrixWorld(true);bounds.makeEmpty();
   rig.root.traverseVisible(object=>{if(object instanceof T.Mesh)bounds.expandByObject(object);});
   if(bounds.isEmpty())return;
   bounds.getCenter(center);const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));let distance=0;
   for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const point=new T.Vector3(x,y,z).sub(center),depth=point.dot(offset);
    distance=Math.max(distance,depth+Math.abs(point.dot(up))*1.18/tan,depth+Math.abs(point.dot(right))*1.18/(tan*camera.aspect));
   }
   camera.position.copy(center).addScaledVector(offset,Math.max(2,distance));camera.lookAt(center);camera.far=Math.max(20,distance+bounds.getSize(new T.Vector3()).length()+5);camera.updateProjectionMatrix();
  };
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,last=0,elapsed=0,visible=true,disposed=false;
  const draw=()=>{if(disposed||document.hidden||!visible)return;if(needsAppearance){scene.background=new T.Color(appearance.current.character==='male'?'#a9cfe5':'#e8b6aa');groundMaterial.color.set(appearance.current.character==='male'?'#83afc5':'#d8bea0');rig.setAppearance(appearance.current);needsAppearance=false;}rig.update(0,0,0,elapsed,reduced.matches,{facing:0});if(needsFit){fit();needsFit=false;}renderer.render(scene,camera);};
  const animate=(time:number)=>{frame=0;if(disposed||document.hidden||!visible||reduced.matches)return;if(time-last>=1000/24){elapsed+=Math.min((time-last)/1000,.05);last=time;draw();}frame=requestAnimationFrame(animate);};
  const resume=()=>{cancelAnimationFrame(frame);frame=0;if(document.hidden||!visible)return;draw();if(!reduced.matches){last=performance.now();frame=requestAnimationFrame(animate);}};
  const resize=()=>{const width=element.clientWidth,height=element.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();needsFit=true;draw();};
  refresh.current=()=>{needsFit=true;needsAppearance=true;if(!document.hidden&&visible)draw();};
  const observer=new ResizeObserver(resize);observer.observe(element);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;resume();});intersection.observe(element);
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);resize();resume();
  return()=>{disposed=true;refresh.current=null;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',resume);rig.dispose();groundGeometry.dispose();groundMaterial.dispose();sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[open]);
 const name=CUSTOMIZATION_OPTIONS.character.find(option=>option.id===value.character)?.label;
 const clothing=CUSTOMIZATION_OPTIONS.clothing.find(option=>option.id===value.clothing)?.label;
 return <div ref={host} className={styles.preview} role="img" aria-label={`3D preview: ${name} character, ${value.face} face, ${value.body} body, ${clothing}.`}>{failed&&<p className={styles.previewFallback}>Your {name?.toLowerCase()} character is wearing {clothing?.toLowerCase()}. The 3D preview is unavailable on this device; your choices still update on the island.</p>}</div>;
}
