// Remote friends (multiplayer, docs/multiplayer-design.md 2.3, 2.5, 4.7, 5.1). Heat rules, all of them:
//  - ONE playerBatch (capacity 8) for every remote: a bean rig per friend, drawn as instances, never in the scene graph itself;
//  - the islandNpcs.ts fixes: hidden classic geometry released + detached, far posing at 10 Hz (> 20 m) / 5 Hz (> 60 m),
//    not drawn beyond 160 m, nothing drawn or solved off screen;
//  - the batched meshes never cast shadows and nothing here is registered with any shadow culling;
//  - the cap is applied when a friend is ADMITTED (never removes a friend already shown); Battery saver fades everyone out;
//  - a name label is one Sprite per friend with a CanvasTexture made once on upsert (hidden beyond 40 m);
//  - update() allocates nothing for ordinary movement (scratch objects are module level / per entry).
import * as T from 'three';
import {createPlayer,type PlayerMotion,type PlayerRig} from './player';
import {playerBatch} from './playerBatch';
import {effectiveTier,batterySaverOn,type HeatTier} from './heatTier';
import {applyCelebrationArms,celebrationMotion} from './celebrations';
import {beanLookFor,playerOutfit} from '../town/customization';
import {wireToLook} from '../multiplayer/look';
import type {RemotePose} from '../multiplayer/interp';
import {Emote,Mode,Zone,type Look,type MemberId} from '../../multiplayer/protocol';
import type {TravelMode} from '../town/travelModes';

/** Remotes shown at once by effective heat tier at admission: phones 5/5/3/1/0, desktop 5, Battery saver 0 (design 2.5). */
export function remoteCap(tier:HeatTier,phone:boolean,saver:boolean):number{
 if(saver)return 0;
 if(!phone)return 5;
 return tier<=1?5:tier===2?3:tier===3?1:0;
}

export interface RemoteAvatars{
 readonly root:T.Object3D;
 upsert(id:MemberId,look:Look,name:string):void;
 remove(id:MemberId):void;
 emote(id:MemberId,e:Emote):void;
 update(dt:number,poses:Map<MemberId,RemotePose>,camera:T.Camera,reduced:boolean):void;
 readonly shown:number;
 dispose():void;
}

const BATCH_CAPACITY=8,FAR_POSE=20,MID_POSE=60,FAR_HZ=10,FARTHER_HZ=5,DRAW_RANGE=160,LABEL_RANGE=40,EMOTE_SECONDS=1.5,ADMIT_RECHECK=1,SAVER_FADE_SECONDS=1,BODY_SCALE=1.12;
const EMOTE_ICON:Record<number,string>={[Emote.Wave]:'\u{1F44B}',[Emote.Cheer]:'\u{1F389}',[Emote.HighFive]:'\u{1F64C}',[Emote.PassToMe]:'\u{261D}\u{FE0F}',[Emote.Space]:'\u{1F4A8}',[Emote.WellPlayed]:'\u{1F44F}'};

// Released hidden classic geometry (copied from islandNpcs.ts: heat pass 5 + NPC heat fix 2). A friend never takes a costume,
// so the classic body the bean skin hides can never show again.
const RELEASED=new T.BufferGeometry();
const classicOnly=(o:T.Object3D):boolean=>o.userData.beanHidden===true||(o instanceof T.Mesh&&!o.visible&&!o.userData.beanPart&&o.children.every(classicOnly))||(o.name==='female-long-hair'&&o.children.every(classicOnly));
function releaseHiddenClassic(root:T.Object3D){
 root.traverse(o=>{if(o instanceof T.Mesh&&o.userData.beanHidden&&o.geometry!==RELEASED){o.geometry.dispose();o.geometry=RELEASED;o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;}});
 const off:T.Object3D[]=[];
 const visit=(o:T.Object3D)=>{for(const child of o.children){if(classicOnly(child))off.push(child);else visit(child);}};
 visit(root);for(const o of off)o.removeFromParent();
}

function travelFor(mode:number):TravelMode|undefined{
 return mode===Mode.Scooter?'scooter':mode===Mode.Bike?'bike':mode===Mode.Moped?'moped':mode===Mode.Jetpack?'jetpack':undefined;
}

type SwimPose=NonNullable<PlayerMotion['swim']>;
type Entry={
 id:MemberId;name:string;lookKey:string;look:Look;
 rig:PlayerRig|null;label:T.Sprite|null;labelTexture:T.CanvasTexture|null;bubble:T.Sprite|null;
 admitted:boolean;shown:boolean;
 motion:PlayerMotion;swim:SwimPose;
 emote:number;emoteAge:number;
 acc:number;slot:number;needResume:boolean;
};

function makeLabelTexture(text:string){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
 const g=canvas.getContext('2d');
 if(g){
  g.clearRect(0,0,256,64);g.font='700 30px system-ui, sans-serif';g.textAlign='center';g.textBaseline='middle';
  const w=Math.min(244,g.measureText(text).width+28);
  g.fillStyle='rgba(20,34,46,.72)';g.beginPath();g.roundRect?g.roundRect(128-w/2,8,w,48,24):g.rect(128-w/2,8,w,48);g.fill();
  g.fillStyle='#ffffff';g.fillText(text,128,33,230);
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
const iconTextures=new Map<number,T.CanvasTexture>();
function iconTexture(e:number){
 let t=iconTextures.get(e);
 if(!t){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const g=canvas.getContext('2d');
  if(g){g.fillStyle='rgba(255,255,255,.92)';g.beginPath();g.arc(48,48,44,0,Math.PI*2);g.fill();g.font='52px system-ui, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(EMOTE_ICON[e]??'',48,52);}
  t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;iconTextures.set(e,t);
 }
 return t;
}

function hideEntry(e:Entry){e.shown=false;if(e.label)e.label.visible=false;if(e.bubble)e.bubble.visible=false;e.needResume=true;}
// Per-frame scratch (module level: nothing allocated while updating).
const frustum=new T.Frustum(),projection=new T.Matrix4(),sphere=new T.Sphere(),camPos=new T.Vector3();

export function createRemoteAvatars(scene:T.Scene,opts:{phone:boolean;maxFor:(tier:HeatTier,phone:boolean)=>number}):RemoteAvatars{
 const root=new T.Group();root.name='remote-avatars';scene.add(root);
 const drawn=new T.Scene();drawn.name='remote-avatars-batch';root.add(drawn);
 const batch=playerBatch(drawn,BATCH_CAPACITY);
 const labels=new T.Group();labels.name='remote-avatar-labels';root.add(labels);
 const byId=new Map<MemberId,Entry>();const list:Entry[]=[];
 let clock=0,recheck=0,saverFade=1,shownCount=0,disposed=false;

 function admit(e:Entry){
  if(e.admitted||disposed)return;
  const rig=createPlayer('remote-'+e.id,'home');
  const c=wireToLook(e.look);rig.setAppearance(c);rig.setBeanLook(beanLookFor(c),playerOutfit(c));
  releaseHiddenClassic(rig.root);rig.root.scale.setScalar(BODY_SCALE);
  e.rig=rig;e.admitted=true;
  const mat=new T.SpriteMaterial({map:e.labelTexture,transparent:true,depthWrite:false});
  const label=new T.Sprite(mat);label.scale.set(1.5,.375,1);label.visible=false;label.raycast=()=>{};label.name='remote-name';labels.add(label);e.label=label;
  const bubble=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false}));bubble.scale.set(.6,.6,1);bubble.visible=false;bubble.raycast=()=>{};bubble.name='remote-emote';labels.add(bubble);e.bubble=bubble;
 }
 const capNow=()=>batterySaverOn()?0:opts.maxFor(effectiveTier(),opts.phone);
 const admittedCount=()=>{let n=0;for(let i=0;i<list.length;i++)if(list[i].admitted)n++;return n;};
 function tryAdmit(e:Entry){if(!e.admitted&&admittedCount()<capNow())admit(e);}
 function setLabel(e:Entry){
  e.labelTexture?.dispose();e.labelTexture=makeLabelTexture(e.name);
  if(e.label){const m=e.label.material as T.SpriteMaterial;m.map=e.labelTexture;m.needsUpdate=true;}
 }
 function release(e:Entry){
  e.rig?.dispose();e.rig=null;e.label?.removeFromParent();(e.label?.material as T.SpriteMaterial|undefined)?.dispose();
  e.bubble?.removeFromParent();(e.bubble?.material as T.SpriteMaterial|undefined)?.dispose();
  e.labelTexture?.dispose();e.label=e.bubble=null;e.labelTexture=null;e.admitted=false;
 }

 return {
  root,
  get shown(){return shownCount;},
  upsert(id,look,name){
   if(disposed)return;
   let e=byId.get(id);const key=look.join(',');
   if(!e){
    e={id,name,lookKey:key,look:look.slice(),rig:null,label:null,labelTexture:null,bubble:null,admitted:false,shown:false,
     motion:{facing:0},swim:{w:1,kind:'tread',phase:0,effort:0,fast:0,entry:'feet',shake:0},emote:-1,emoteAge:0,acc:0,slot:(id*.618034)%1,needResume:true};
    byId.set(id,e);list.push(e);e.labelTexture=makeLabelTexture(name);tryAdmit(e);return;
   }
   if(e.name!==name){e.name=name;if(e.labelTexture)setLabel(e);}
   if(e.lookKey!==key){e.lookKey=key;e.look=look.slice();if(e.rig){const c=wireToLook(look);e.rig.setAppearance(c);e.rig.setBeanLook(beanLookFor(c),playerOutfit(c));releaseHiddenClassic(e.rig.root);}}
  },
  remove(id){
   const e=byId.get(id);if(!e)return;
   byId.delete(id);const i=list.indexOf(e);if(i>=0)list.splice(i,1);release(e);
  },
  emote(id,em){const e=byId.get(id);if(!e)return;e.emote=em;e.emoteAge=0;e.rig?.setExpression('happy');},
  update(dt,poses,camera,reduced){
   if(disposed)return;
   if(list.length===0){shownCount=0;return;}
   clock+=dt;
   const saver=batterySaverOn();
   saverFade=saver?Math.max(0,saverFade-dt/SAVER_FADE_SECONDS):Math.min(1,saverFade+dt/SAVER_FADE_SECONDS);
   recheck+=dt;
   if(recheck>=ADMIT_RECHECK){recheck=0;if(!saver)for(let i=0;i<list.length;i++)tryAdmit(list[i]);}
   camera.updateMatrixWorld();projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);
   camPos.setFromMatrixPosition(camera.matrixWorld);
   batch.begin();let shown=0;
   for(let i=0;i<list.length;i++){
    const e=list[i],rig=e.rig;
    if(!rig||!e.label||!e.bubble)continue;
    const pose=poses.get(e.id);
    if(!pose||saverFade<=0||pose.zone===Zone.Indoors){hideEntry(e);continue;}
    const dx=pose.x-camPos.x,dz=pose.z-camPos.z,d2=dx*dx+dz*dz;
    if(d2>DRAW_RANGE*DRAW_RANGE){hideEntry(e);continue;}
    sphere.center.set(pose.x,pose.y+1,pose.z);sphere.radius=2;
    if(!frustum.intersectsSphere(sphere)){hideEntry(e);continue;}
    const k=Math.max(.001,pose.fade*saverFade);
    // Far friends solve their pose at 10 Hz (> 20 m) / 5 Hz (> 60 m); the root still follows every frame.
    const root3=rig.root,motion=e.motion;
    root3.position.set(pose.x,pose.y,pose.z);root3.scale.setScalar(BODY_SCALE*k);
    e.acc+=dt;
    const period=d2>MID_POSE*MID_POSE?1/FARTHER_HZ:d2>FAR_POSE*FAR_POSE?1/FAR_HZ:0;
    const moving=pose.speed>.3;
    if(e.emote>=0){e.emoteAge+=dt;if(e.emoteAge>=EMOTE_SECONDS){e.emote=-1;rig.setExpression('neutral');}}
    if(period===0||e.acc>=period+e.slot*period||e.needResume){
     const step=Math.min(e.acc,.1);e.acc=0;
     const mode=pose.mode;
     motion.facing=pose.yaw;motion.resumePose=e.needResume;motion.travelMode=travelFor(mode);
     motion.parachute=mode===Mode.Parachute||mode===Mode.Zipline;
     motion.called=0;motion.jump=undefined;
     if(mode===Mode.Swim||mode===Mode.Dive){
      const s=e.swim;s.kind=moving?'crawl':'tread';s.effort=moving?Math.min(1,pose.speed/3):0;s.phase=reduced?0:s.phase+step*(moving?5:1.5);s.under=mode===Mode.Dive?.7:0;motion.swim=s;
     }else motion.swim=undefined;
     // Emotes: PassToMe/Space/Wave/HighFive raise the "called" arm; Cheer/WellPlayed celebrate. Reduced motion keeps only the bubble.
     if(e.emote>=0&&!reduced){
      const em=e.emote,age=e.emoteAge;
      if(em===Emote.Cheer||em===Emote.WellPlayed)celebrationMotion(Math.min(1,age/EMOTE_SECONDS),motion,false);
      else motion.called=Math.min(1,age/.2,(EMOTE_SECONDS-age)/.2);
     }
     rig.update(pose.x,pose.z,step,clock,reduced,motion);
     if(e.emote>=0&&!reduced&&(e.emote===Emote.Cheer||e.emote===Emote.WellPlayed))applyCelebrationArms(rig.root,Math.min(1,e.emoteAge/EMOTE_SECONDS));
     root3.position.set(pose.x,pose.y,pose.z);e.needResume=false;
    }
    batch.draw(root3);e.shown=true;shown++;
    const near=d2<LABEL_RANGE*LABEL_RANGE;
    const label=e.label;label.visible=near;
    if(near){label.position.set(pose.x,pose.y+2.35*k,pose.z);(label.material as T.SpriteMaterial).opacity=k;}
    const bubble=e.bubble;
    if(e.emote>=0&&d2<DRAW_RANGE*DRAW_RANGE){
     if(bubble.userData.icon!==e.emote){bubble.userData.icon=e.emote;const m=bubble.material as T.SpriteMaterial;m.map=iconTexture(e.emote);m.needsUpdate=true;}
     bubble.visible=true;bubble.position.set(pose.x,pose.y+2.9*k,pose.z);
    }else bubble.visible=false;
   }
   batch.end();shownCount=shown;
   // The batch makes its meshes lazily and defaults them to casting: friends never cast (no shadow registration anywhere).
   for(let i=0;i<drawn.children.length;i++)drawn.children[i].castShadow=false;
  },
  dispose(){
   if(disposed)return;disposed=true;
   for(let i=0;i<list.length;i++)release(list[i]);
   list.length=0;byId.clear();batch.dispose();
   for(const t of iconTextures.values())t.dispose();iconTextures.clear();
   root.removeFromParent();
  },
 };
}
