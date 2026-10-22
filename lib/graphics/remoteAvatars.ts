// Remote friends (multiplayer, docs/multiplayer-design.md 2.3, 2.5, 4.7, 5.1). Heat rules, all of them:
//  - ONE playerBatch (capacity 8) for every remote: a bean rig per friend, drawn as instances, never in the scene graph itself;
//  - the islandNpcs.ts fixes: hidden classic geometry released + detached, far posing at 10 Hz (> 20 m) / 5 Hz (> 60 m),
//    not drawn beyond 160 m, nothing drawn or solved off screen;
//  - the batched meshes never cast shadows and nothing here is registered with any shadow culling;
//  - the cap is applied when a friend is ADMITTED (never removes a friend already shown); Battery saver fades everyone out;
//  - a name label is one Sprite per friend with a CanvasTexture made once on upsert; only the nearest 8 on screen within 25 m are visible, and at most 6 emote bubbles at once (big parties);
//  - a friend beyond the rig cap (5 on most phones) is not a rig: the colour ring + label only (ring-only, within 90 m), same one ring draw call;
//  - ONE instanced colour ring (capacity party max + 1 = 21, no shadows, one draw call) lies at each shown friend's feet, and at the local player's
//    while in a party; the instance colour is the member's name colour, so friends can be told apart from far away;
//  - update() allocates nothing for ordinary movement (scratch objects are module level / per entry).
import * as T from 'three';
import {createPlayer,type PlayerMotion,type PlayerRig} from './player';
import {playerBatch} from './playerBatch';
import {effectiveTier,batterySaverOn,type HeatTier} from './heatTier';
import {emoteSeconds} from '../town/emoteReact';import {applyEmoteArms,emoteBody} from './emotePose';
import {applyHighFive} from './highFivePose';import {clearBallMotion,createPassBallOut,friendBallMotion,pickBallRoutine,type PassBallOut} from '../town/emotePass';import {applyRideEmote} from './celebrations';import {flourishAt,flourishForWire,type Flourish} from '../town/emoteContexts';import {cycleFrame,type BubbleFrame} from '../town/emoteBubbleMotion';
import {HIGH_FIVES,createHighFiveBag,highFivePlan,highFiveSkill} from '../town/highFive';
import type {SkillMotion} from './skillMoves';
import {beanLookFor,playerOutfit} from '../town/customization';
import {wireToLook} from '../multiplayer/look';
import type {RemotePose} from '../multiplayer/interp';
import {Emote,Mode,Zone,PARTY_MAX,type Look,type MemberId} from '../../multiplayer/protocol';
import type {TravelMode} from '../town/travelModes';

/** Remotes shown at once by effective heat tier at admission: phones 5/5/3/1/0, desktop 5, Battery saver 0 (design 2.5). */
export function remoteCap(tier:HeatTier,phone:boolean,saver:boolean):number{
 if(saver)return 0;
 if(!phone)return 5;
 return tier<=1?5:tier===2?3:tier===3?1:0;
}

/** The member's colour (hex): the label's dot and rim and the ground ring. The label text is the first name (or the colour name). */
export interface MemberStyle{hex:string}
export interface LocalRing{x:number;y:number;z:number;hex:string}
export interface RemoteAvatars{
 readonly root:T.Object3D;
 /** `style` = the member's name colour (hex): drawn on the label and as the ground ring. */
 upsert(id:MemberId,look:Look,name:string,style?:MemberStyle):void;
 remove(id:MemberId):void;
 /** Local choices (PartyHost Hide / Mute): hidden friends are not drawn at all (avatar, ring, label, emote bubble); muted friends' emotes are not shown. */
 setHidden(ids:ReadonlySet<MemberId>):void;
 setMuted(ids:ReadonlySet<MemberId>):void;
 emote(id:MemberId,e:Emote):void;
 /** `local`: the local player's feet + colour while in a live party (ring only); null / omitted = none. */
 update(dt:number,poses:Map<MemberId,RemotePose>,camera:T.Camera,reduced:boolean,local?:LocalRing|null):void;
 readonly shown:number;
 dispose():void;
}

const HF_SKILL={type:'highFive' as const,progress:0,side:1 as -1|1};
const FACE_CAMERA=Math.atan2(16,33),hfBag=createHighFiveBag();
const BATCH_CAPACITY=8,FAR_POSE=20,MID_POSE=60,FAR_HZ=10,FARTHER_HZ=5,DRAW_RANGE=160,LABEL_RANGE=25,LABEL_MAX=8,BUBBLE_MAX=6,RING_ONLY_RANGE=90,ADMIT_RECHECK=1,SAVER_FADE_SECONDS=1,BODY_SCALE=1.12,RING_CAPACITY=PARTY_MAX+1,RING_RADIUS=.55,RING_FAR_M=25,RING_MAX_GROW=4,RING_LIFT=.05;
const EMOTE_ICON:Record<number,string>={[Emote.Wave]:'\u{1F44B}',[Emote.Cheer]:'\u{1F389}',[Emote.HighFive]:'\u{1F64C}',[Emote.JuggleWithMe]:'\u{1F939}',[Emote.ShowOff]:'\u{1F31F}',[Emote.WellPlayed]:'\u{1F44F}',[Emote.PassBall]:'\u{26BD}',[Emote.Laugh]:'\u{1F602}',[Emote.Dance]:'\u{1F483}',[Emote.Thanks]:'\u{1F64F}'};

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
 id:MemberId;name:string;lookKey:string;look:Look;style:MemberStyle|null;colour:T.Color;
 rig:PlayerRig|null;label:T.Sprite|null;labelTexture:T.CanvasTexture|null;bubble:T.Sprite|null;
 admitted:boolean;shown:boolean;
 motion:PlayerMotion;swim:SwimPose;
 emote:number;emoteAge:number;hidden:boolean;muted:boolean;
 /** The sender's last mode (so a wire emote picks the flying / swimming flourish) and whether a flourish rotation is on the rig. */
 lastMode:number;flOn:boolean;
 /** The high five variation this friend is playing (0..9; -1 none). The wire format has no spare field, so each screen picks its own. */
 hf:number;
 /** A Pass it / Juggle with me routine this friend's body plays (picked locally; no ball on their side), made on the first ball emote. */
 ball:PassBallOut|null;
 acc:number;slot:number;needResume:boolean;d2:number;
};

const LABEL_W=256;
const labelH=(_style:MemberStyle|null)=>64;
function makeLabelTexture(text:string,style:MemberStyle|null){
 const H=labelH(style);
 const canvas=document.createElement('canvas');canvas.width=LABEL_W;canvas.height=H;
 const g=canvas.getContext('2d');
 if(g){
  const label=text;
  g.clearRect(0,0,LABEL_W,H);g.font='700 27px system-ui, sans-serif';g.textAlign='center';g.textBaseline='middle';
  const dot=style?30:0;
  let w=Math.min(244,g.measureText(label).width+28+dot);
  const x0=128-w/2,ph=H-16,cy=32;
  g.fillStyle='rgba(20,34,46,.72)';g.beginPath();g.roundRect?g.roundRect(x0,8,w,ph,24):g.rect(x0,8,w,ph);g.fill();
  if(style){
   g.lineWidth=3;g.strokeStyle=style.hex;g.stroke(); // coloured rim = the ring colour
   g.fillStyle=style.hex;g.beginPath();g.arc(x0+22,cy,9,0,Math.PI*2);g.fill();g.lineWidth=2;g.strokeStyle='rgba(20,34,46,.9)';g.stroke();
  }
  g.fillStyle='#ffffff';g.fillText(label,128+dot/2,cy+1,230-dot);
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
const iconTextures=new Map<number,T.CanvasTexture>();
function iconTexture(e:number){
 let t=iconTextures.get(e);
 if(!t){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const g=canvas.getContext('2d');
  if(g){g.font='58px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='rgba(40,30,10,.4)';g.shadowBlur=7;g.shadowOffsetY=2;g.fillText(EMOTE_ICON[e]??'',48,52);/* the emoji alone, no disc (user, Oct 22 2026) */}
  t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;iconTextures.set(e,t);
 }
 return t;
}

function hideEntry(e:Entry){e.shown=false;if(e.label)e.label.visible=false;if(e.bubble)e.bubble.visible=false;e.needResume=true;}
// Per-frame scratch (module level: nothing allocated while updating).
const ringM=new T.Matrix4(),ringPos=new T.Vector3(),ringScale=new T.Vector3(),ringQ=new T.Quaternion(),localColour=new T.Color();
const frustum=new T.Frustum(),projection=new T.Matrix4(),sphere=new T.Sphere(),camPos=new T.Vector3();

/** A flat annulus with a soft outer glow: vertex alpha only (no texture), r 0.62..1.0 in the XZ plane. */
function ringGeometry(){
 const radii=[.6,.68,.86,1],alpha=[0,1,1,0],seg=40,pos:number[]=[],col:number[]=[],idx:number[]=[];
 for(let r=0;r<radii.length;r++)for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2;pos.push(Math.cos(a)*radii[r],0,Math.sin(a)*radii[r]);col.push(1,1,1,alpha[r]);}
 for(let r=0;r<radii.length-1;r++)for(let i=0;i<seg;i++){const a=r*(seg+1)+i,b=a+seg+1;idx.push(a,a+1,b,a+1,b+1,b);}
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,4));geo.setIndex(idx);
 return geo;
}

const FL:Flourish={roll:0,pitch:0,yaw:0,lift:0,ripple:0},BF:BubbleFrame={visible:false,dx:0,dy:0,scale:1,opacity:0};
export function createRemoteAvatars(scene:T.Scene,opts:{phone:boolean;maxFor:(tier:HeatTier,phone:boolean)=>number}):RemoteAvatars{
 const root=new T.Group();root.name='remote-avatars';scene.add(root);
 const drawn=new T.Scene();drawn.name='remote-avatars-batch';root.add(drawn);
 const batch=playerBatch(drawn,BATCH_CAPACITY);
 const ringGeo=ringGeometry();
 const ringMat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const rings=new T.InstancedMesh(ringGeo,ringMat,RING_CAPACITY);rings.name='remote-avatar-rings';rings.frustumCulled=false;rings.castShadow=false;rings.receiveShadow=false;rings.count=0;rings.renderOrder=2;
 rings.raycast=()=>{};rings.setColorAt(0,localColour.set('#ffffff'));root.add(rings);
 let ringN=0;
 function ringAdd(x:number,y:number,z:number,dist:number,c:T.Color,pulse:number,k:number){
  if(ringN>=RING_CAPACITY)return;
  const sc=RING_RADIUS*Math.min(RING_MAX_GROW,Math.max(1,dist/RING_FAR_M))*pulse*k;
  ringScale.set(sc,1,sc);ringPos.set(x,y+RING_LIFT,z);ringM.compose(ringPos,ringQ,ringScale);
  rings.setMatrixAt(ringN,ringM);rings.setColorAt(ringN,c);ringN++;
 }
 function ringsEnd(){rings.count=ringN;rings.instanceMatrix.needsUpdate=true;if(rings.instanceColor)rings.instanceColor.needsUpdate=true;}
 const candL:Entry[]=[],candB:Entry[]=[];
 /** Label + emote bubble placement. Both are only CANDIDATES here: the nearest LABEL_MAX labels (within LABEL_RANGE) and BUBBLE_MAX bubbles are made visible by pickVisible after the pass. */
 function placeLabel(e:Entry,pose:RemotePose,k:number,reduced:boolean){
  const label=e.label!,bubble=e.bubble!,d2=e.d2;
  label.visible=false;bubble.visible=false;
  if(d2<LABEL_RANGE*LABEL_RANGE){label.position.set(pose.x,pose.y+2.35*k,pose.z);(label.material as T.SpriteMaterial).opacity=k;candL.push(e);}
  if(e.emote>=0){
   if(bubble.userData.icon!==e.emote){bubble.userData.icon=e.emote;const m=bubble.material as T.SpriteMaterial;m.map=iconTexture(e.emote);m.needsUpdate=true;}
   const fs=e.rig?flourishForWire(e.emote,e.lastMode):undefined;
   const dur=fs?fs.seconds:e.hf>=0?HIGH_FIVES[e.hf].duration:emoteSeconds(e.emote),f=cycleFrame(e.emoteAge,dur,reduced,BF);// pops in, floats up with a sway, dissipates; repeats through the emote
   if(f.visible){bubble.position.set(pose.x+f.dx,pose.y+2.9*k+f.dy,pose.z);bubble.scale.setScalar(.72*f.scale);(bubble.material as T.SpriteMaterial).opacity=f.opacity;candB.push(e);}
  }
 }
 /** Shows only the nearest `max` candidates (insertion sort by squared distance; no allocation). Label candidates drive `label`, bubble candidates `bubble`. */
 function pickVisible(c:Entry[],max:number){
  for(let i=1;i<c.length;i++){const x=c[i];let j=i-1;while(j>=0&&c[j].d2>x.d2){c[j+1]=c[j];j--;}c[j+1]=x;}
  const isLabel=c===candL;
  for(let i=0;i<c.length&&i<max;i++){const e=c[i];if(isLabel)e.label!.visible=true;else e.bubble!.visible=true;}
 }
 const labels=new T.Group();labels.name='remote-avatar-labels';root.add(labels);
 const byId=new Map<MemberId,Entry>();const list:Entry[]=[];
 let localHex='',clock=0,recheck=0,saverFade=1,shownCount=0,disposed=false;

 function admit(e:Entry){
  if(e.admitted||disposed)return;
  const rig=createPlayer('remote-'+e.id,'home');
  const c=wireToLook(e.look);rig.setAppearance(c);rig.setBeanLook(beanLookFor(c),playerOutfit(c));
  releaseHiddenClassic(rig.root);rig.root.scale.setScalar(BODY_SCALE);
  e.rig=rig;e.admitted=true;
 }
 function ensureLabel(e:Entry){
  if(e.label||disposed)return;
  const mat=new T.SpriteMaterial({map:e.labelTexture,transparent:true,depthWrite:false});
  const label=new T.Sprite(mat);label.scale.set(1.5,1.5*labelH(e.style)/LABEL_W,1);label.visible=false;label.raycast=()=>{};label.name='remote-name';labels.add(label);e.label=label;
  const bubble=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false}));bubble.scale.set(.6,.6,1);bubble.visible=false;bubble.raycast=()=>{};bubble.name='remote-emote';labels.add(bubble);e.bubble=bubble;
 }
 const capNow=()=>batterySaverOn()?0:opts.maxFor(effectiveTier(),opts.phone);
 const admittedCount=()=>{let n=0;for(let i=0;i<list.length;i++)if(list[i].admitted)n++;return n;};
 function tryAdmit(e:Entry){if(!e.admitted&&admittedCount()<capNow())admit(e);}
 function setLabel(e:Entry){
  e.labelTexture?.dispose();e.labelTexture=makeLabelTexture(e.name,e.style);
  if(e.label){const m=e.label.material as T.SpriteMaterial;m.map=e.labelTexture;m.needsUpdate=true;e.label.scale.set(1.5,1.5*labelH(e.style)/LABEL_W,1);}
 }
 function release(e:Entry){
  e.rig?.dispose();e.rig=null;e.label?.removeFromParent();(e.label?.material as T.SpriteMaterial|undefined)?.dispose();
  e.bubble?.removeFromParent();(e.bubble?.material as T.SpriteMaterial|undefined)?.dispose();
  e.labelTexture?.dispose();e.label=e.bubble=null;e.labelTexture=null;e.admitted=false;
 }

 function addLocalRing(l:LocalRing,cam:T.Vector3){
  if(l.hex!==localHex){localHex=l.hex;localColour.set(l.hex);}
  const dx=l.x-cam.x,dz=l.z-cam.z;
  ringAdd(l.x,l.y,l.z,Math.sqrt(dx*dx+dz*dz),localColour,1,1);
 }
 return {
  root,
  get shown(){return shownCount;},
  upsert(id,look,name,style){
   if(disposed)return;
   let e=byId.get(id);const key=look.join(',');const st=style??null;
   if(!e){
    e={id,name,lookKey:key,look:look.slice(),style:st,colour:new T.Color(st?st.hex:'#ffffff'),rig:null,label:null,labelTexture:null,bubble:null,admitted:false,shown:false,
     motion:{facing:0},swim:{w:1,kind:'tread',phase:0,effort:0,fast:0,entry:'feet',shake:0},emote:-1,emoteAge:0,lastMode:0,flOn:false,hf:-1,ball:null,hidden:false,muted:false,acc:0,slot:(id*.618034)%1,needResume:true,d2:0};
    byId.set(id,e);list.push(e);e.labelTexture=makeLabelTexture(name,e.style);ensureLabel(e);tryAdmit(e);return;
   }
   if(e.name!==name||(st?.hex!==e.style?.hex)){e.name=name;e.style=st;e.colour.set(st?st.hex:'#ffffff');if(e.labelTexture)setLabel(e);}
   if(e.lookKey!==key){e.lookKey=key;e.look=look.slice();if(e.rig){const c=wireToLook(look);e.rig.setAppearance(c);e.rig.setBeanLook(beanLookFor(c),playerOutfit(c));releaseHiddenClassic(e.rig.root);}}
  },
  remove(id){
   const e=byId.get(id);if(!e)return;
   byId.delete(id);const i=list.indexOf(e);if(i>=0)list.splice(i,1);release(e);
  },
  setHidden(ids){for(let i=0;i<list.length;i++){const e=list[i],h=ids.has(e.id);if(h!==e.hidden){e.hidden=h;if(h){hideEntry(e);if(e.emote>=0){e.emote=-1;e.rig?.setExpression('neutral');}}}}},
  setMuted(ids){for(let i=0;i<list.length;i++){const e=list[i],m=ids.has(e.id);e.muted=m;if(m&&e.emote>=0){e.emote=-1;e.rig?.setExpression('neutral');}}},
  emote(id,em){const e=byId.get(id);if(!e||e.muted||e.hidden)return;e.emote=em;e.emoteAge=0;e.hf=!flourishForWire(em,e.lastMode)?highFivePlan(em,false,Math.random,hfBag):-1;if(em===Emote.PassBall||em===Emote.JuggleWithMe){e.ball??=createPassBallOut();pickBallRoutine(e.ball,em===Emote.PassBall?'pass':'solo');}e.rig?.setExpression('happy');},
  update(dt,poses,camera,reduced,local){
   if(disposed)return;
   ringN=0;candL.length=0;candB.length=0;
   if(list.length===0){
    shownCount=0;
    if(local&&!batterySaverOn()){camera.updateMatrixWorld();camPos.setFromMatrixPosition(camera.matrixWorld);addLocalRing(local,camPos);}
    ringsEnd();return;
   }
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
    // Emote age advances before every early-out (off screen, indoors, far): a hidden friend's emote must not freeze and pop back later.
    const fs0=e.emote>=0?flourishForWire(e.emote,e.lastMode):undefined;
    if(e.emote>=0){e.emoteAge+=dt;if(e.emoteAge>=(fs0?fs0.seconds:e.hf>=0?HIGH_FIVES[e.hf].duration:emoteSeconds(e.emote))){e.emote=-1;e.hf=-1;rig?.setExpression('neutral');}}
    if(!e.label||!e.bubble)continue;
    if(e.hidden){hideEntry(e);continue;} // Hide: no avatar, ring, label or emote bubble
    const pose=poses.get(e.id);
    if(!pose||saverFade<=0||pose.zone===Zone.Indoors){hideEntry(e);continue;}
    const dx=pose.x-camPos.x,dz=pose.z-camPos.z,d2=dx*dx+dz*dz;
    if(d2>DRAW_RANGE*DRAW_RANGE){hideEntry(e);continue;}
    sphere.center.set(pose.x,pose.y+1,pose.z);sphere.radius=2;
    if(!frustum.intersectsSphere(sphere)){hideEntry(e);continue;}
    const k=Math.max(.001,pose.fade*saverFade);
    e.d2=d2;
    if(!rig){ // beyond the rig cap: colour ring + label (+ emote bubble) only, no body
     e.shown=false;e.needResume=true;
     if(d2<=RING_ONLY_RANGE*RING_ONLY_RANGE)ringAdd(pose.x,pose.y,pose.z,Math.sqrt(d2),e.colour,1,k);
     placeLabel(e,pose,k,reduced);continue;
    }
    // Far friends solve their pose at 10 Hz (> 20 m) / 5 Hz (> 60 m); the root still follows every frame.
    const root3=rig.root,motion=e.motion;
    root3.position.set(pose.x,pose.y,pose.z);root3.scale.setScalar(BODY_SCALE*k);
    e.acc+=dt;
    const period=e.hf>=0&&!reduced?0:d2>MID_POSE*MID_POSE?1/FARTHER_HZ:d2>FAR_POSE*FAR_POSE?1/FAR_HZ:0;
    const moving=pose.speed>.3;
    if(period===0||e.acc>=period+e.slot*period||e.needResume){
     const step=Math.min(e.acc,.1);e.acc=0;
     const mode=pose.mode;e.lastMode=mode;
     motion.facing=pose.yaw;motion.resumePose=e.needResume;motion.travelMode=travelFor(mode);
     motion.parachute=mode===Mode.Parachute||mode===Mode.Zipline;
     motion.called=0;motion.jump=undefined;motion.skill=e.hf>=0&&!reduced&&highFiveSkill(HF_SKILL,e.hf,0,e.emoteAge)?HF_SKILL as SkillMotion:undefined;
     if(mode===Mode.Swim||mode===Mode.Dive){
      const s=e.swim;s.kind=moving?'crawl':'tread';s.effort=moving?Math.min(1,pose.speed/3):0;s.phase=reduced?0:s.phase+step*(moving?5:1.5);s.under=mode===Mode.Dive?.7:0;motion.swim=s;
     }else motion.swim=undefined;
     // Emotes: JuggleWithMe/Wave/HighFive raise the "called" arm; Cheer/WellPlayed celebrate. Reduced motion keeps only the bubble.
     if(e.emote>=0&&!reduced){
      const em=e.emote,age=e.emoteAge;
      if(e.hf<0&&!fs0){const b=emoteBody(em,age,emoteSeconds(em));motion.jump=b.jump;motion.called=b.called;}
      if(e.hf<0&&!fs0&&e.ball&&(em===Emote.PassBall||em===Emote.JuggleWithMe))friendBallMotion(e.ball,em===Emote.JuggleWithMe,age,pose.yaw,motion);/* the ball routines' body (lib/town/emoteBallPlay.ts) */
     }
     if(e.ball&&(reduced||!(e.emote===Emote.PassBall||e.emote===Emote.JuggleWithMe))&&motion.turnSmoothing!==undefined)clearBallMotion(motion);
     rig.update(pose.x,pose.z,step,clock,reduced,motion);
     if(e.emote>=0&&!reduced&&e.hf<0&&!fs0&&e.emote!==Emote.JuggleWithMe&&e.emote!==Emote.PassBall)applyEmoteArms(rig.root,e.emote,e.emoteAge,emoteSeconds(e.emote));
     else if(fs0&&!reduced&&fs0.arm>=0&&e.emoteAge>=fs0.armFrom)applyRideEmote(rig.root,fs0.arm,e.emoteAge,Math.max(0,Math.min(1,(e.emoteAge-fs0.armFrom)/.2,(fs0.seconds-e.emoteAge)/.2)));
     root3.position.set(pose.x,pose.y,pose.z);
     // A friend's high five: an "air five" toward the camera side (their own random variation, shown on every screen alike).
     if(e.hf>=0&&!reduced)applyHighFive(rig.root,e.hf,0,e.emoteAge,1,FACE_CAMERA,BODY_SCALE*k);
     e.needResume=false;
    }
    // A flying / swimming friend's emote (their mode picks it from the same wire value): roll / pitch / lift on the rig root, every frame, gone with the emote.
    if(fs0&&!reduced){flourishAt(fs0.emote,e.emoteAge,fs0.seconds,FL,1);root3.rotation.order='YXZ';root3.rotation.x=FL.pitch;root3.rotation.z=FL.roll;root3.position.y+=FL.lift*k;e.flOn=true;}
    else if(e.flOn){root3.rotation.x=0;root3.rotation.z=0;e.flOn=false;}
    batch.draw(root3);e.shown=true;shown++;
    // Colour ring at the feet; the emote pulse is skipped under reduced motion.
    ringAdd(pose.x,pose.y,pose.z,Math.sqrt(d2),e.colour,e.emote>=0&&!reduced?1+.18*Math.sin(e.emoteAge*14):1,k);
    placeLabel(e,pose,k,reduced);
   }
   pickVisible(candL,LABEL_MAX);pickVisible(candB,BUBBLE_MAX);
   if(local&&saverFade>0)addLocalRing(local,camPos);
   ringsEnd();
   batch.end();shownCount=shown;
   // The batch makes its meshes lazily and defaults them to casting: friends never cast (no shadow registration anywhere).
   for(let i=0;i<drawn.children.length;i++)drawn.children[i].castShadow=false;
  },
  dispose(){
   if(disposed)return;disposed=true;
   for(let i=0;i<list.length;i++)release(list[i]);
   list.length=0;byId.clear();batch.dispose();rings.dispose();ringGeo.dispose();ringMat.dispose();
   for(const t of iconTextures.values())t.dispose();iconTextures.clear();
   root.removeFromParent();
  },
 };
}
