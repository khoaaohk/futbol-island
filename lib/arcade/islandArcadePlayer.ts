import * as T from 'three';
import {createPlayer,profileFor,PLAYER_KICK_CONTACT,type PlayerMotion} from '../graphics/player';
import {loadCustomization,beanLookFor,playerOutfit} from '../town/customization';
import {teamedLook,type BeanDress} from '../town/beanLooks';
import {getQuizProgress} from '../town/quizProgress';
import {createArcadePlayerMotion,type ArcadePoseOptions} from './arcadePlayerMotion';

/** Island character motion adapted to arcade/treadmill coordinates. */
export function createIslandArcadePlayer(color:string,reduced:boolean,index:number,dress?:BeanDress){
 const rig=createPlayer(index===0?'you':`arcade-${index}`,'home',true,true),root=rig.root,body=new T.Group();
 body.name='arcade-body-offset';const pelvis=root.getObjectByName('player-pelvis') as T.Group;root.remove(pelvis);body.add(pelvis);root.add(body);
 rig.setProfile(profileFor(index===0?'you':'npc',index));
 const jersey=root.getObjectByName('player-jersey') as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;jersey.material.color.set(color);
 // Team games: team body + kit. Index 0 is the player's own character: own shape/hair/face, team colours.
 const mainCustomization=()=>{const progress=getQuizProgress();return loadCustomization(progress.completed,progress.total);};
 const applyDress=(main?:ReturnType<typeof loadCustomization>)=>{if(!dress)return;const d=index===0?teamedLook(beanLookFor(main??mainCustomization()),dress):dress;rig.setBeanLook(d.look,d.outfit);};applyDress();
 const joint=(name:string)=>root.getObjectByName(name) as T.Group;
 const legs=['left','right'].map(s=>({hip:joint(`${s}-hip`),knee:joint(`${s}-knee`),ankle:joint(`${s}-ankle`)}));
 const arms=['left','right'].map(s=>({shoulder:joint(`${s}-shoulder`),elbow:joint(`${s}-elbow`)}));
 const motion=createArcadePlayerMotion(),intent:PlayerMotion={travelMode:'walk',facing:0};
 let virtualX=0,virtualZ=0,time=0,lastKick=0,strike=1,strikePower=.35,lastCharge=0,slideAge=0,lastSlide=0;
 let strikeX=0,strikeZ=.65,strikeKind:PlayerMotion['actionKind']='shot';
 const jumpPose={progress:0,height:0}; // Root height stays authoritative in each arcade simulation.
 root.userData.islandRig=true;root.userData.motion=motion;
 const useMainAppearance=()=>{const main=mainCustomization();rig.setAppearance(main);if(dress)applyDress(main);else rig.setBeanLook(beanLookFor(main),playerOutfit(main));};
 function pose(dt:number,speed:number,facing:number,kick=0,jump=0,lean=0,o?:ArcadePoseOptions){
  const x=root.position.x,z=root.position.z;dt=Math.max(0,Math.min(.05,dt));time+=dt;
  const vx=o?.vx??Math.sin(facing)*speed,vz=o?.vz??Math.cos(facing)*speed;
  root.position.set(virtualX,0,virtualZ);virtualX+=vx*dt;virtualZ+=vz*dt;
  if(kick>.1&&(lastKick<=.1||kick>lastKick+.4)){strike=PLAYER_KICK_CONTACT;strikePower=o?.shotPower??(lastCharge||.35);strikeX=o?.strikeX??0;strikeZ=o?.strikeZ??.65/Math.max(.1,root.scale.x);strikeKind=o?.actionKind??'shot';}
  else if(strike<1)strike=Math.min(1,strike+dt/ .46);
  const slide=o?.slide??0;if(slide>.04){if(lastSlide<=.04)slideAge=0;slideAge+=dt;}else slideAge=0;
  intent.facing=facing;intent.intentHeading=Math.hypot(vx,vz)>.1?Math.atan2(vx,vz):undefined;
  intent.dribbling=!!o?.dribbling&&jump<.05&&slide<.1;intent.actionKind=strikeKind;intent.kick=strike<1?strike:undefined;
  intent.shotCharge=(o?.charge??0)>.001?o?.charge:undefined;intent.shotPower=(o?.charge??0)>0?o?.charge:strikePower;intent.powerKick=strike<1;
  intent.strikeX=(o?.charge??0)>0?(o?.strikeX??0):strikeX;intent.strikeZ=(o?.charge??0)>0?(o?.strikeZ??.65/Math.max(.1,root.scale.x)):strikeZ;intent.ready=o?.anticipate??0;intent.called=o?.celebrate??0;
  intent.dive=o?.dive;intent.keeper=o?.keeper??0;intent.jockey=o?.jockey??0;
  jumpPose.progress=o?.jumpProgress??0;jumpPose.height=o?.jumpHeight??0;intent.jump=o?.jumpProgress===undefined?undefined:jumpPose;
  intent.skill=o?.skill;intent.move=o?.move;
  rig.setExpression((o?.stun??0)>.1?'beaten':(o?.celebrate??0)>.1?'happy':(o?.charge??0)>.1?'determined':(o?.anticipate??0)>.2||o?.dive?'focused':'neutral');
  intent.reaction=slide>.04?'slide':(o?.stun??0)>.1?'stumble':o?.reaction;intent.reactionProgress=slide>.04?Math.min(.9,slideAge/.75):(o?.stun??0)>.1?(1-(o?.stun??0))*.7:o?.reactionProgress;
  body.position.set(0,0,0);body.rotation.set(0,0,0);body.scale.setScalar(1);
  rig.update(virtualX,virtualZ,dt,time,reduced,intent);
  root.position.set(x,jump,z);
  if(jump>.02&&o?.jumpProgress===undefined){const air=Math.min(1,jump*3);for(const leg of legs){leg.hip.rotation.x-=air*.22;leg.knee.rotation.x+=air*.4;}}
  body.rotation.z+=reduced?0:-lean*.035;
  motion.slide=slide;motion.bodyY=pelvis.position.y-.88;motion.stride=o?.stride??motion.stride+Math.hypot(vx,vz)*dt*2;motion.yaw=root.rotation.y;
  for(let i=0;i<2;i++){motion.hips[i]=legs[i].hip.rotation.x;motion.knees[i]=legs[i].knee.rotation.x;}
  lastKick=kick;lastSlide=slide;lastCharge=o?.charge??0;
 }
 function resetPose(){const x=root.position.x,y=root.position.y,z=root.position.z;virtualX=virtualZ=time=lastKick=slideAge=lastSlide=0;strike=1;lastCharge=0;strikePower=.35;strikeKind='shot';body.position.set(0,0,0);body.rotation.set(0,0,0);body.scale.setScalar(1);root.rotation.x=root.rotation.z=0;for(const key of Object.keys(intent) as (keyof PlayerMotion)[])delete intent[key];intent.travelMode='walk';intent.facing=root.rotation.y;intent.resumePose=true;rig.update(0,0,0,0,reduced,intent);intent.resumePose=undefined;motion.stride=0;root.position.set(x,y,z);}
 // Update once after an intentional game-owned overlay before reading world-space attachments.
 const finalizePose=()=>root.updateWorldMatrix(true,true);
 const setDress=(next:BeanDress)=>{dress=next;applyDress();};
 return{root,body,head:joint('player-head'),motion,legs,arms,pose,resetPose,finalizePose,setDress,useMainAppearance,dribbleContact:rig.dribbleContact,dispose:rig.dispose};
}
