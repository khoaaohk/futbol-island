import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {VENUES,FIELD_SURFACE_Y,type Format,type Venue} from './venues';
import {KNOCKOUT_ROOF} from '../games/rooftopKnockout';
import {createPitchVisibility} from './pitchVisibility';

type LightingVenue=Omit<Venue,'id'>&{id:Format|'knockout'};
type FieldEntry={venue:LightingVenue;root:T.Group;surface?:T.MeshStandardMaterial;height:number;side:number;dayColor:T.Color;nightColor:T.Color;nightEmission:T.Color};
/** Four visible floodlight banks per court, with four shared real non-shadow lights
 * shared by the relevant pitch. Far pitches retain a modest material fill.
 * Fixed light count avoids shader recompiles during time-of-day changes. */
export function createFieldLighting(scene:T.Scene,roots:Map<string,T.Group>,surfaces:Map<string,T.MeshStandardMaterial>,goal:T.MeshStandardMaterial,markings:T.LineBasicMaterial){
 const dayMarkings=markings.color.clone(),nightMarkings=new T.Color().setRGB(2,2,2);
 const steel=new T.MeshStandardMaterial({color:'#596269',roughness:.72});
 const lenses=new T.MeshStandardMaterial({color:'#f5eed5',emissive:'#fff0cf',emissiveIntensity:0,roughness:.45});
 const owned:T.BufferGeometry[]=[],entries:FieldEntry[]=[];
 const roofRoot=new T.Group();roofRoot.name='rooftop-floodlights';roofRoot.position.set(KNOCKOUT_ROOF.x,KNOCKOUT_ROOF.height,KNOCKOUT_ROOF.z);scene.add(roofRoot);
 const roofVenue:LightingVenue={id:'knockout',name:'Rooftop Knockout',x:KNOCKOUT_ROOF.x,z:KNOCKOUT_ROOF.z,elevation:KNOCKOUT_ROOF.height,width:24,length:44,players:7,goalWidth:0,goalHeight:0,surface:'#648c72',shape:''};
 for(const v of [...VENUES,roofVenue]){
  const root=v.id==='knockout'?roofRoot:roots.get(v.id)!,body:T.BufferGeometry[]=[],glass:T.BufferGeometry[]=[];
  const height=v.id==='futsal'||v.id==='knockout'?8:v.id==='11v11'?21:15,side=v.width/2+(v.id==='knockout'?.7:2.3);
  const box=(list:T.BufferGeometry[],w:number,h:number,d:number,x:number,y:number,z:number,tilt=0)=>{const g=new T.BoxGeometry(w,h,d);g.rotateZ(tilt);g.translate(x,y,z);list.push(g);};
  for(const hand of[-1,1])for(const end of[-1,1]){
   const x=hand*side,z=end*(v.length/2+(v.id==='knockout'?1.5:2.3));
   const pole=new T.CylinderGeometry(.13,.22,height,8);pole.translate(x,FIELD_SURFACE_Y+height/2,z);body.push(pole);
   box(body,.75,.28,.75,x,FIELD_SURFACE_Y+.14,z);
   box(body,1.6,.14,.22,x-hand*.5,height+.08,z);
   // The bank tilts inward; its pale lower face visibly explains pitch illumination.
   const tilt=hand*.22,bankX=x-hand*.7;
   box(body,2.05,.55,.52,bankX,height,z,tilt);
   for(let panel=0;panel<3;panel++){box(glass,.52,.12,.44,bankX+(panel-1)*.61,height-.3,z,tilt);box(glass,.52,.045,.44,bankX+(panel-1)*.61,height+.3,z,tilt);}
  }
  for(const [list,material,name]of [[body,steel,'floodlight-structure'],[glass,lenses,'floodlight-panels']] as const){
   const geometry=mergeGeometries(list)!;list.forEach(g=>g.dispose());geometry.computeBoundingSphere();owned.push(geometry);
   const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.castShadow=false;mesh.receiveShadow=false;mesh.matrixAutoUpdate=false;root.add(mesh);
  }
  const surface=surfaces.get(v.id);if(surface){surface.emissive.copy(surface.color);surface.emissiveIntensity=0;}
  const dayColor=surface?.color.clone()??new T.Color(v.surface),nightColor=dayColor.clone(),nightEmission=v.id==='futsal'?dayColor.clone():new T.Color('#d0ccb7');
  entries.push({venue:v,root,surface,height,side,dayColor,nightColor,nightEmission});
 }
 const lightRoot=new T.Group();lightRoot.name='field-floodlight-pool';scene.add(lightRoot);
 const spots=[0,1,2,3].map(i=>{const light=new T.SpotLight('#fff0d5',0,180,1.18,.72,2);light.name='shared-pitch-floodlight-'+i;light.castShadow=false;lightRoot.add(light,light.target);return light;});
 const visibility=createPitchVisibility();let chosen:FieldEntry|undefined,lastMode='',blend=0,scanAge=1;
 let lightGain=0,strength=0,settled=false;goal.emissive.set('#fff0d5');
 function select(camera:T.Camera,isolated:Format|null,roofActive:boolean,player?:{x:number;y:number;z:number}){
  if(isolated)return entries.find(e=>e.venue.id===isolated);
  if(roofActive)return entries.find(e=>e.venue.id==='knockout');
  // Projected corners can cross the near plane when walking on a large pitch.
  // Occupancy wins before camera scoring, with a wider exit margin to avoid edge flicker.
  if(player)for(const entry of entries){const v=entry.venue,margin=entry===chosen?5:2;if(entry.root.visible&&Math.abs(player.y-((v.elevation??0)+FIELD_SURFACE_Y))<4&&Math.abs(player.x-v.x)<=v.width/2+margin&&Math.abs(player.z-v.z)<=v.length/2+margin)return entry;}
  let best:FieldEntry|undefined,bestScore=Infinity,currentScore=Infinity;
  camera.updateMatrixWorld();
  for(const entry of entries){if(!entry.root.visible)continue;const v=entry.venue,score=visibility(camera,v.x,(v.elevation??0)+FIELD_SURFACE_Y,v.z,v.width,v.length);if(entry===chosen)currentScore=score;if(score<bestScore){bestScore=score;best=entry;}}
  return chosen&&currentScore<bestScore+.12?chosen:best;
 }
 function place(entry:FieldEntry){const v=entry.venue,y=(v.elevation??0)+entry.height;
  for(let i=0;i<4;i++){const hand=i%2?1:-1,end=i<2?-1:1;spots[i].position.set(v.x+hand*(entry.side-.7),y,v.z+end*(v.length/2+(v.id==='knockout'?1.5:2.3)));spots[i].target.position.set(v.x-hand*v.width*.12,(v.elevation??0)+FIELD_SURFACE_Y,v.z-end*v.length*.12);spots[i].distance=Math.hypot(v.width,v.length)+entry.height+15;}
  strength=Math.pow(Math.hypot(entry.side-.7,v.length/2+(v.id==='knockout'?1.5:2.3),entry.height),2)*.85*(v.id==='futsal'?.82:.5);lightRoot.userData.format=v.id;
 }
 return {update(mode:string,camera:T.Camera,isolated:Format|null,dt:number,reduced=false,roofActive=false,player?:{x:number;y:number;z:number}){
  roofRoot.visible=!isolated;
  const night=mode==='night',changed=mode!==lastMode;lastMode=mode;
  if(!night&&blend===0&&settled)return;
  scanAge+=dt;let next=chosen;
  if(night&&(changed||isolated!==null||roofActive||scanAge>=.12)){next=select(camera,isolated,roofActive,player);scanAge=0;}
  const targetChanged=next!==chosen;if(targetChanged){chosen=next;lightGain=0;if(chosen)place(chosen);else{strength=0;lightRoot.userData.format=null;}}
  const oldBlend=blend,oldGain=lightGain;const target=night?1:0,k=reduced?1:1-Math.exp(-Math.min(.1,dt)*4);
  blend=T.MathUtils.lerp(blend,target,k);if(Math.abs(blend-target)<.0005)blend=target;
  const targetGain=night&&chosen?1:0;lightGain=T.MathUtils.lerp(lightGain,targetGain,k);if(Math.abs(lightGain-targetGain)<.0005)lightGain=targetGain;
  if(changed||oldBlend!==blend){lenses.emissiveIntensity=blend*2.1;
  for(const entry of entries){if(!entry.surface)continue;entry.surface.color.copy(entry.dayColor).lerp(entry.nightColor,blend);entry.surface.emissive.copy(entry.nightEmission);entry.surface.emissiveIntensity=blend*(entry.venue.id==='futsal'?.246:.025);}
  goal.emissiveIntensity=blend*.16;markings.color.copy(dayMarkings).lerp(nightMarkings,blend);}
  if(changed||targetChanged||oldBlend!==blend||oldGain!==lightGain)for(const spot of spots)spot.intensity=strength*blend*lightGain;
  settled=blend===target;lightRoot.userData.blend=blend;lightRoot.userData.active=chosen?.venue.id??null;
 },dispose(){for(const geometry of owned)geometry.dispose();steel.dispose();lenses.dispose();lightRoot.removeFromParent();roofRoot.removeFromParent();}};
}
