// Remote friends (multiplayer, docs/multiplayer-design.md 2.3, 2.5, 4.7, 5.1). Heat rules, all of them:
//  - ONE playerBatch (capacity 8) for every remote: a bean rig per friend, drawn as instances, never in the scene graph itself;
//  - the islandNpcs.ts fixes: hidden classic geometry released + detached, far posing at 10 Hz (> 20 m) / 5 Hz (> 60 m),
//    not drawn beyond 160 m, nothing drawn or solved off screen;
//  - the batched meshes never cast shadows and nothing here is registered with any shadow culling;
//  - the cap is RE-CHECKED once a second (rigCap.ts, Oct 22 2026; before, it applied only at admission): a heat-tier drop demotes the
//    farthest rigs to ring + label (0.4 s shrink, instant under reduced motion, then the rig is released), a recovered tier re-admits
//    the nearest in range after 10 s at the higher cap (no thrash on a flapping tier); Battery saver fades everyone out;
//  - a name label is one Sprite per friend with a CanvasTexture made once on upsert; only the nearest 8 on screen within 25 m are visible, and at most 6 emote bubbles at once (big parties);
//  - a friend beyond the rig cap (5 on most phones) is not a rig: the colour ring + label only (ring-only, within 90 m), same one ring draw call;
//  - ONE instanced colour ring (capacity party max + 1 = 21, no shadows, one draw call) lies at each shown friend's feet, and at the local player's
//    while in a party; the instance colour is the member's name colour, so friends can be told apart from far away;
//  - update() allocates nothing for ordinary movement (scratch objects are module level / per entry);
//  - presence (design 4.4.1): a busy / away friend stands still inside ONE shared instanced green force field (forceField.ts) with a
//    status line over the name ("Taking a lesson", "Away"; one cached texture per line, shared); emotes to / from them are ignored;
//    a friend who goes indoors fades out at the door (no fade with reduced motion); the field pops when they come back.
import * as T from 'three';
import {createPlayer,type PlayerMotion,type PlayerRig} from './player';
import {playerBatch} from './playerBatch';
import {effectiveTier,batterySaverOn,type HeatTier} from './heatTier';
import {DEMOTE_FADE,capGate,planRigs,stepCapGate} from './rigCap';
import {emoteSeconds} from '../town/emoteReact';import {applyEmoteArms,emoteBody} from './emotePose';
import {applyHighFive} from './highFivePose';import {clearBallMotion,createPassBallOut,friendBallMotion,pickBallRoutine,type PassBallOut} from '../town/emotePass';import {applyRideEmote} from './celebrations';import {flourishAt,flourishForWire,type Flourish} from '../town/emoteContexts';import {cycleFrame,type BubbleFrame} from '../town/emoteBubbleMotion';import {MOVE_ROLE,moveForWire,moveWeight,pickMoveVariant} from '../town/moveEmotes';import {applyMoveEmote} from './moveEmotePose';
import {HIGH_FIVES,createHighFiveBag,highFivePlan,highFiveSkill} from '../town/highFive';
import type {SkillMotion} from './skillMoves';
import {beanLookFor,playerOutfit} from '../town/customization';
import {wireToLook} from '../multiplayer/look';
import type {RemotePose} from '../multiplayer/interp';
import {Emote,Mode,Zone,PARTY_MAX,presenceOf,shielded,type Look,type MemberId} from '../../multiplayer/protocol';
import {presenceIcon,presenceText} from '../multiplayer/presence';
import {createForceFields} from './forceField';
import type {TravelMode} from '../town/travelModes';

/** Remotes drawn as rigs at once by effective heat tier: phones 5/5/3/1/0, desktop 5, Battery saver 0 (design 2.5). Re-checked once a second. */
export function remoteCap(tier:HeatTier,phone:boolean,saver:boolean):number{
 if(saver)return 0;
 if(!phone)return 5;
 return tier<=1?5:tier===2?3:tier===3?1:0;
}

/** The member's colour (hex): the label's dot and rim and the ground ring. The label text is the first name (or the colour name). */
export interface MemberStyle{hex:string}
/** `pitch` (rad, + leans forward) and `yaw` = the local body's real flight pitch / heading: the ring follows the body while flying (Mode.Jetpack). */
export interface LocalRing{x:number;y:number;z:number;hex:string;mode?:number;pitch?:number;yaw?:number}
export interface RemoteAvatars{
 readonly root:T.Object3D;
 /** The label / status / emote sprites (each at its friend's position): the only children the view gate may treat as units. */
 readonly labels:T.Object3D;
 /** `style` = the member's name colour (hex): drawn on the label and as the ground ring. */
 upsert(id:MemberId,look:Look,name:string,style?:MemberStyle):void;
 remove(id:MemberId):void;
 /** Local choices (PartyHost Hide / Mute): hidden friends are not drawn at all (avatar, ring, label, emote bubble); muted friends' emotes are not shown. */
 setHidden(ids:ReadonlySet<MemberId>):void;
 setMuted(ids:ReadonlySet<MemberId>):void;
 /** Plays a friend's emote; false when it is not shown (muted, hidden, inside a force field, unknown). */
 emote(id:MemberId,e:Emote):boolean;
 /** The island ball hit this friend's force field: a short damped shake and a ripple from the impact normal (dome space). */
 bumpField(id:MemberId,nx:number,ny:number,nz:number):void;
 /** `local`: the local player's feet + colour while in a live party (ring only); null / omitted = none. */
 update(dt:number,poses:Map<MemberId,RemotePose>,camera:T.Camera,reduced:boolean,local?:LocalRing|null):void;
 readonly shown:number;
 /** Rigs alive (admitted + still shrinking after a demotion): the heat checks' leak counter. */
 readonly rigs:number;
 dispose():void;
}

const HF_SKILL={type:'highFive' as const,progress:0,side:1 as -1|1};
const FACE_CAMERA=Math.atan2(16,33),hfBag=createHighFiveBag();
const BATCH_CAPACITY=8,FAR_POSE=20,MID_POSE=60,FAR_HZ=10,FARTHER_HZ=5,DRAW_RANGE=160,LABEL_RANGE=25,LABEL_MAX=8,BUBBLE_MAX=6,RING_ONLY_RANGE=90,ADMIT_RECHECK=1,SAVER_FADE_SECONDS=1,BODY_SCALE=1.12,RING_CAPACITY=PARTY_MAX+1,RING_RADIUS=1,RING_FAR_M=60,RING_MAX_GROW=4,RING_LIFT=.10,RING_PITCH_LIMIT=1.45,RING_TILT_K=.6,RING_TILT_MAX=.9,RING_BODY_LIFT=.2,RING_BODY_FWD=.05,FRIEND_PITCH_MAX=1.1;
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
 /** Cap recheck (rigCap.ts): priority distance², the planned change, demoting (shrinking, rig still held) and its scale 1..0. */
 pd2:number;plan:number;dem:boolean;out:number;
 motion:PlayerMotion;swim:SwimPose;
 emote:number;emoteAge:number;hidden:boolean;muted:boolean;
 /** The sender's last mode (so a wire emote picks the flying / swimming flourish) and whether a flourish rotation is on the rig. */
 lastMode:number;flOn:boolean;
 /** A moving emote (lib/town/moveEmotes.ts: the sender walked / ran when it arrived): its local id (-1 none), variant (their own bag here), length, and the friend's last speed. */
 mv:number;mvV:number;mvDur:number;spd:number;
 /** Smoothed estimated flight pitch (rad) of a Jetpack friend, for the colour ring. */
 rp:number;
 /** The high five variation this friend is playing (0..9; -1 none). The wire format has no spare field, so each screen picks its own. */
 hf:number;
 /** A Pass it / Juggle with me routine this friend's body plays (picked locally; no ball on their side), made on the first ball emote. */
 ball:PassBallOut|null;
 acc:number;slot:number;needResume:boolean;d2:number;/** squared horizontal distance from the LOCAL player (the label range; d2 is from the camera, ~35 m back on the island) */ld2:number;
 /** Presence: inside the force field now; field 0..1 (eased), door 1..0 (indoors fade), shake / ripple of a ball hit, the status sprite + its line. */
 shield:boolean;field:number;door:number;shake:number;ripple:number;hx:number;hy:number;hz:number;status:T.Sprite|null;statusKey:string;
 /** The status line, rebuilt only when the presence or activity changes (was a string concat per busy friend per frame). */
 prWas:string;actWas:number;lineWas:string;
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

function hideEntry(e:Entry){e.shown=false;if(e.label)e.label.visible=false;if(e.bubble)e.bubble.visible=false;if(e.status)e.status.visible=false;e.needResume=true;}
// Status lines over a busy friend's name ("📖 Taking a lesson", "💤 Away"): one canvas texture per distinct line, shared by every friend.
const STATUS_W=320,STATUS_H=64,STATUS_RANGE=70,STATUS_SCREEN=.21,FIELD_FADE=.35,DOOR_FADE=.6,SHAKE_SECONDS=.4,RIPPLE_SECONDS=.5;
const statusTextures=new Map<string,T.CanvasTexture>();
function statusTexture(line:string){
 let t=statusTextures.get(line);
 if(!t){
  const canvas=document.createElement('canvas');canvas.width=STATUS_W;canvas.height=STATUS_H;const g=canvas.getContext('2d');
  if(g){
   g.font='700 26px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';g.textAlign='center';g.textBaseline='middle';
   const w=Math.min(STATUS_W-8,g.measureText(line).width+34),x0=STATUS_W/2-w/2;
   g.fillStyle='rgba(236,255,244,.94)';g.beginPath();g.roundRect?g.roundRect(x0,8,w,STATUS_H-16,22):g.rect(x0,8,w,STATUS_H-16);g.fill();
   g.lineWidth=3;g.strokeStyle='#38c87a';g.stroke();
   g.fillStyle='#14412a';g.fillText(line,STATUS_W/2,33,STATUS_W-24);
  }
  t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;statusTextures.set(line,t);
 }
 return t;
}
// Per-frame scratch (module level: nothing allocated while updating).
const ringM=new T.Matrix4(),ringPos=new T.Vector3(),ringScale=new T.Vector3(),ringQ=new T.Quaternion(),ringE=new T.Euler(0,0,0,'YXZ'),localColour=new T.Color();
const frustum=new T.Frustum(),projection=new T.Matrix4(),sphere=new T.Sphere(),camPos=new T.Vector3();

/** A flat annulus with a soft outer glow: vertex alpha only (no texture), r 0.62..1.0 in the XZ plane. */
function ringGeometry(){
 // The SAME ring as the island's own foot ring (Town.tsx 'player-foot-ring': RingGeometry(.48,.54,48), 80% opaque): thin, crisp, 1.08 m across.
 const radii=[.48,.54],alpha=[.8,.8],seg=48,pos:number[]=[],col:number[]=[],idx:number[]=[];
 for(let r=0;r<radii.length;r++)for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2;pos.push(Math.cos(a)*radii[r],0,Math.sin(a)*radii[r]);col.push(1,1,1,alpha[r]);}
 for(let r=0;r<radii.length-1;r++)for(let i=0;i<seg;i++){const a=r*(seg+1)+i,b=a+seg+1;idx.push(a,a+1,b,a+1,b+1,b);}
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,4));geo.setIndex(idx);
 return geo;
}
/** Friends' flight pitch has no wire field: hover upright at low speed, cruise tilt rising smoothly with speed (the rig's cruise lean / orbitPitch family). */
export function friendFlightPitch(speed:number):number{const t=Math.min(1,Math.max(0,(speed-3)/15));return FRIEND_PITCH_MAX*t*t*(3-2*t);}
/** Ring tilt for a mode: only free flight (Jetpack) follows the body; every other mode stays flat. Parachute / zipline / swim keep the flat ring. */
export function ringPitchFor(mode:number,pitch:number):number{return mode===Mode.Jetpack?Math.min(RING_PITCH_LIMIT,Math.max(0,pitch)):0;}
/** Ring quaternion + centre for a body pitched `pitch` about the horizontal axis perpendicular to heading `yaw` (writes ringQ / ringPos). Exported for tests. */
export function ringPlacement(x:number,y:number,z:number,pitch:number,yaw:number,qOut:T.Quaternion,pOut:T.Vector3){
 if(pitch<.0005){qOut.identity();pOut.set(x,y+RING_LIFT,z);return;}
 // The ring leans only PART of the way with the body (never edge-on, so it stays visible from above and behind), and sits low (feet to hips).
 const tilt=Math.min(RING_TILT_MAX,pitch*RING_TILT_K);ringE.set(tilt,yaw,0,'YXZ');qOut.setFromEuler(ringE);
 const s=Math.sin(tilt);pOut.set(x+Math.sin(yaw)*RING_BODY_FWD*s,y+RING_LIFT+RING_BODY_LIFT*s,z+Math.cos(yaw)*RING_BODY_FWD*s);
}
/** Ring size by ride, as the island's own foot ring (Town.tsx ringSize): walk 1, scooter 1.65, bike 2.15, moped 2.3. */
const ringSizeFor=(mode:number):number=>mode===Mode.Scooter?1.65:mode===Mode.Bike?2.15:mode===Mode.Moped?2.3:1;

const FL:Flourish={roll:0,pitch:0,yaw:0,lift:0,ripple:0},BF:BubbleFrame={visible:false,dx:0,dy:0,scale:1,opacity:0};
/** `fieldScale`: the force field size (rooms use ~0.7: an r 0.8 m dome in a small room instead of the island's 1.15 m). */
export function createRemoteAvatars(scene:T.Scene,opts:{phone:boolean;maxFor:(tier:HeatTier,phone:boolean)=>number;fieldScale?:number}):RemoteAvatars{
 const FS=opts.fieldScale??1;
 const root=new T.Group();root.name='remote-avatars';scene.add(root);
 const drawn=new T.Scene();drawn.name='remote-avatars-batch';root.add(drawn);
 const batch=playerBatch(drawn,BATCH_CAPACITY);
 const ringGeo=ringGeometry();
 const ringMat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const rings=new T.InstancedMesh(ringGeo,ringMat,RING_CAPACITY);rings.name='remote-avatar-rings';rings.frustumCulled=false;rings.castShadow=false;rings.receiveShadow=false;rings.count=0;rings.renderOrder=2;
 rings.raycast=()=>{};rings.setColorAt(0,localColour.set('#ffffff'));root.add(rings);
 const fields=createForceFields(PARTY_MAX);root.add(fields.mesh);
 let ringN=0;
 function ringAdd(x:number,y:number,z:number,dist:number,c:T.Color,pulse:number,k:number,pitch=0,yaw=0){
  if(ringN>=RING_CAPACITY)return;
  const sc=RING_RADIUS*Math.min(RING_MAX_GROW,Math.max(1,dist/RING_FAR_M))*pulse*k;
  ringScale.set(sc,1,sc);ringPlacement(x,y,z,pitch,yaw,ringQ,ringPos);ringM.compose(ringPos,ringQ,ringScale);
  rings.setMatrixAt(ringN,ringM);rings.setColorAt(ringN,c);ringN++;
 }
 function ringsEnd(){rings.count=ringN;rings.instanceMatrix.needsUpdate=true;if(rings.instanceColor)rings.instanceColor.needsUpdate=true;}
 const candL:Entry[]=[],candB:Entry[]=[];
 /** Label + emote bubble placement. Both are only CANDIDATES here: the nearest LABEL_MAX labels (within LABEL_RANGE) and BUBBLE_MAX bubbles are made visible by pickVisible after the pass. */
 function placeLabel(e:Entry,pose:RemotePose,k:number,reduced:boolean){
  const label=e.label!,bubble=e.bubble!,d2=e.d2,ld2=e.ld2;
  label.visible=false;bubble.visible=false;
  if(ld2<LABEL_RANGE*LABEL_RANGE){label.position.set(pose.x,pose.y+2.35*k,pose.z);(label.material as T.SpriteMaterial).opacity=k;candL.push(e);}
  // The status line ("Taking a lesson", "Away") is THE information about a busy friend: shown to STATUS_RANGE (only busy friends have one),
  // sitting above the name label at a constant screen size (sizeAttenuation off), so it reads from the usual walking camera (~40 m).
  if(e.status){const show=!!e.statusKey&&d2<STATUS_RANGE*STATUS_RANGE;e.status.visible=show;
   if(show){e.status.position.set(pose.x,pose.y+2.35*k+.3,pose.z);(e.status.material as T.SpriteMaterial).opacity=k;}}
  if(e.emote>=0){
   if(bubble.userData.icon!==e.emote){bubble.userData.icon=e.emote;const m=bubble.material as T.SpriteMaterial;m.map=iconTexture(e.emote);m.needsUpdate=true;}
   const fs=e.rig?flourishForWire(e.emote,e.lastMode):undefined;
   const dur=e.mv>=0?e.mvDur:fs?fs.seconds:e.hf>=0?HIGH_FIVES[e.hf].duration:emoteSeconds(e.emote),f=cycleFrame(e.emoteAge,dur,reduced,BF);// pops in, floats up with a sway, dissipates; repeats through the emote
   if(f.visible){bubble.position.set(pose.x+f.dx,pose.y+2.9*k+f.dy,pose.z);bubble.scale.setScalar(.72*f.scale);(bubble.material as T.SpriteMaterial).opacity=f.opacity;candB.push(e);}
  }
 }
 /** Shows only the nearest `max` candidates (insertion sort by squared distance; no allocation). Label candidates drive `label`, bubble candidates `bubble`. */
 function pickVisible(c:Entry[],max:number){
  const isLabel=c===candL;
  for(let i=1;i<c.length;i++){const x=c[i];let j=i-1;while(j>=0&&(isLabel?c[j].ld2>x.ld2:c[j].d2>x.d2)){c[j+1]=c[j];j--;}c[j+1]=x;}
  for(let i=0;i<c.length&&i<max;i++){const e=c[i];if(isLabel)e.label!.visible=true;else e.bubble!.visible=true;}
 }
 const labels=new T.Group();labels.name='remote-avatar-labels';root.add(labels);
 const byId=new Map<MemberId,Entry>();const list:Entry[]=[];
 let localHex='',clock=0,recheck=0,saverFade=1,shownCount=0,disposed=false;

 function admit(e:Entry){
  if(e.admitted||disposed)return;
  if(e.rig){e.admitted=true;e.dem=false;e.out=1;return;} // still shrinking from a demotion: keep the same rig
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
  const status=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false,depthTest:false,sizeAttenuation:false}));status.scale.set(STATUS_SCREEN,STATUS_SCREEN*STATUS_H/STATUS_W,1);status.renderOrder=4;status.visible=false;status.raycast=()=>{};status.name='remote-status';labels.add(status);e.status=status;
 }
 const capNow=()=>batterySaverOn()?0:opts.maxFor(effectiveTier(),opts.phone);
 const admittedCount=()=>{let n=0;for(let i=0;i<list.length;i++)if(list[i].admitted)n++;return n;};
 // The effective cap (rigCap.ts): drops at once, rises after 10 s at the higher value. A joiner is admitted at once while below it.
 // Battery saver stays outside the gate (its own 1 s fade, nobody admitted); turning it off is a choice, not heat: the gate resets.
 const tierCap=()=>opts.maxFor(effectiveTier(),opts.phone);
 const gate=capGate(capNow());const order:Entry[]=[];let saverWas=batterySaverOn();
 function tryAdmit(e:Entry){if(!e.admitted&&!batterySaverOn()&&admittedCount()<stepCapGate(gate,tierCap(),0))admit(e);} // a drop counts at once, a rise waits
 /** Demoted: ring + label only. The body shrinks over DEMOTE_FADE s (update), then the rig is released; reduced motion: at once. */
 function demote(e:Entry,reduced:boolean){if(!e.admitted)return;e.admitted=false;e.dem=true;e.out=1;if(reduced)dropRig(e);}
 function dropRig(e:Entry){e.rig?.dispose();e.rig=null;e.dem=false;e.out=1;e.flOn=false;e.shown=false;e.needResume=true;}
 /** Once a second (never per frame): priority = squared distance from the local player (the camera when none); hidden, indoors or
  *  pose-less friends count as farthest. Demotes beyond the cap (farthest first), admits the nearest waiting within the draw range. */
 function recheckCaps(dt:number,reduced:boolean,poses:Map<MemberId,RemotePose>,local:LocalRing|null|undefined){
  const cap=stepCapGate(gate,tierCap(),dt),ox=local?local.x:camPos.x,oz=local?local.z:camPos.z;
  for(let i=0;i<list.length;i++){const e=list[i],p=poses.get(e.id);e.pd2=!p||e.hidden||p.zone===Zone.Indoors?Infinity:(p.x-ox)*(p.x-ox)+(p.z-oz)*(p.z-oz);}
  if(planRigs(list,order,cap,DRAW_RANGE*DRAW_RANGE)===0)return;
  for(let i=0;i<list.length;i++){const e=list[i];if(e.plan<0)demote(e,reduced);else if(e.plan>0)admit(e);}
 }
 function setLabel(e:Entry){
  e.labelTexture?.dispose();e.labelTexture=makeLabelTexture(e.name,e.style);
  if(e.label){const m=e.label.material as T.SpriteMaterial;m.map=e.labelTexture;m.needsUpdate=true;e.label.scale.set(1.5,1.5*labelH(e.style)/LABEL_W,1);}
 }
 function release(e:Entry){
  e.rig?.dispose();e.rig=null;e.label?.removeFromParent();(e.label?.material as T.SpriteMaterial|undefined)?.dispose();
  e.bubble?.removeFromParent();(e.bubble?.material as T.SpriteMaterial|undefined)?.dispose();
  e.status?.removeFromParent();(e.status?.material as T.SpriteMaterial|undefined)?.dispose();e.status=null;e.statusKey='';
  e.labelTexture?.dispose();e.label=e.bubble=null;e.labelTexture=null;e.admitted=false;e.dem=false;
 }

 function friendRingPitch(e:Entry,pose:RemotePose,dt:number):number{
  const target=pose.mode===Mode.Jetpack&&!e.shield?friendFlightPitch(pose.speed):0;
  e.rp+=(target-e.rp)*(1-Math.exp(-4*dt)); // damped, no allocation
  return ringPitchFor(pose.mode,e.rp);
 }
 function addLocalRing(l:LocalRing,cam:T.Vector3){
  if(l.hex!==localHex){localHex=l.hex;localColour.set(l.hex);}
  const dx=l.x-cam.x,dz=l.z-cam.z;
  ringAdd(l.x,l.y,l.z,0,localColour,ringSizeFor(l.mode??0),1,ringPitchFor(l.mode??0,l.pitch??0),l.yaw??0);/* my own ring never grows with the camera distance: it matches the island's foot ring exactly */
 }
 return {
  root,labels,
  get shown(){return shownCount;},
  get rigs(){let n=0;for(let i=0;i<list.length;i++)if(list[i].rig)n++;return n;},
  upsert(id,look,name,style){
   if(disposed)return;
   let e=byId.get(id);const key=look.join(',');const st=style??null;
   if(!e){
    e={id,name,lookKey:key,look:look.slice(),style:st,colour:new T.Color(st?st.hex:'#ffffff'),rig:null,label:null,labelTexture:null,bubble:null,admitted:false,shown:false,pd2:0,plan:0,dem:false,out:1,
     motion:{facing:0},swim:{w:1,kind:'tread',phase:0,effort:0,fast:0,entry:'feet',shake:0},emote:-1,emoteAge:0,lastMode:0,flOn:false,mv:-1,mvV:0,mvDur:0,spd:0,rp:0,hf:-1,ball:null,hidden:false,muted:false,acc:0,slot:(id*.618034)%1,needResume:true,ld2:0,d2:0,
shield:false,field:0,door:1,shake:0,ripple:1,hx:0,hy:1,hz:0,status:null,statusKey:'',prWas:'',actWas:-1,lineWas:''};
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
  bumpField(id,nx,ny,nz){const e=byId.get(id);if(!e||!e.shield)return;e.shake=1;e.ripple=0;e.hx=nx;e.hy=ny;e.hz=nz;},
  emote(id,em){const e=byId.get(id);if(!e||e.muted||e.hidden||e.shield)return false;/* inside the force field: no emotes from them */e.emote=em;e.emoteAge=0;const ms=moveForWire(em,e.lastMode,e.spd);e.mv=ms?ms.emote:-1;e.mvDur=ms?ms.seconds:0;if(ms)e.mvV=pickMoveVariant(ms.emote,MOVE_ROLE.Friend);/* walking / running: the moving version over their walk cycle */e.hf=!ms&&!flourishForWire(em,e.lastMode)?highFivePlan(em,false,Math.random,hfBag):-1;if(!ms&&em===Emote.PassBall||em===Emote.JuggleWithMe){e.ball??=createPassBallOut();pickBallRoutine(e.ball,em===Emote.PassBall?'pass':'solo');}e.rig?.setExpression('happy');return true;},
  update(dt,poses,camera,reduced,local){
   if(disposed)return;
   ringN=0;candL.length=0;candB.length=0;
   if(list.length===0){
    shownCount=0;fields.begin();fields.end(dt,reduced);
    if(local&&!batterySaverOn()){camera.updateMatrixWorld();camPos.setFromMatrixPosition(camera.matrixWorld);addLocalRing(local,camPos);}
    ringsEnd();return;
   }
   clock+=dt;
   const saver=batterySaverOn();
   if(saver!==saverWas){saverWas=saver;if(!saver){gate.eff=tierCap();gate.hold=0;}}
   saverFade=saver?Math.max(0,saverFade-dt/SAVER_FADE_SECONDS):Math.min(1,saverFade+dt/SAVER_FADE_SECONDS);
   camera.updateMatrixWorld();projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);
   camPos.setFromMatrixPosition(camera.matrixWorld);
   // The cap re-check (once a second; Battery saver keeps its own 1 s fade-out and admits nobody, as before).
   recheck+=dt;
   if(recheck>=ADMIT_RECHECK){const step=recheck;recheck=0;if(!saver)recheckCaps(step,reduced,poses,local);}
   batch.begin();fields.begin();let shown=0;
   for(let i=0;i<list.length;i++){
    const e=list[i];
    // A demoted friend's body shrinks away (before every early-out, so an off-screen one still finishes), then the rig is released.
    if(e.dem){e.out=reduced?0:Math.max(0,e.out-dt/DEMOTE_FADE);if(e.out<=0)dropRig(e);}
    const rig=e.rig;
    // Emote age advances before every early-out (off screen, indoors, far): a hidden friend's emote must not freeze and pop back later.
    const fs0=e.emote>=0?flourishForWire(e.emote,e.lastMode):undefined;
    if(e.emote>=0){e.emoteAge+=dt;if(e.emoteAge>=(e.mv>=0?e.mvDur:fs0?fs0.seconds:e.hf>=0?HIGH_FIVES[e.hf].duration:emoteSeconds(e.emote))){e.emote=-1;e.hf=-1;e.mv=-1;rig?.setExpression('neutral');}}
    if(!e.label||!e.bubble)continue;
    if(e.hidden){hideEntry(e);continue;} // Hide: no avatar, ring, label or emote bubble
    const pose=poses.get(e.id);
    if(!pose||saverFade<=0){hideEntry(e);continue;}
    // Presence: indoors = fade out at the door; busy / away = inside the green force field, still, with a status line.
    const pr=presenceOf(pose.mode,pose.zone,pose.flags??0),shield=shielded(pr);
    if(pose.zone===Zone.Indoors){e.door=reduced?0:Math.max(0,e.door-dt/DOOR_FADE);if(e.door<=0){e.field=0;hideEntry(e);continue;}}else e.door=1;
    if(shield!==e.shield){e.shield=shield;if(shield&&e.emote>=0){e.emote=-1;e.hf=-1;}rig?.setExpression(shield&&pr==='busy'?'focused':'neutral');}
    const act=pose.activity??0;if(pr!==e.prWas||act!==e.actWas){e.prWas=pr;e.actWas=act;e.lineWas=pr==='active'?'':presenceIcon(pr,act)+' '+presenceText(pr,act);}
    const line=e.lineWas;
    if(line!==e.statusKey&&e.status){e.statusKey=line;if(line){const m=e.status.material as T.SpriteMaterial;m.map=statusTexture(line);m.needsUpdate=true;}}
    e.field=reduced?(shield?1:0):shield?Math.min(1,e.field+dt/FIELD_FADE):Math.max(0,e.field-dt/FIELD_FADE);
    e.shake=Math.max(0,e.shake-dt/SHAKE_SECONDS);e.ripple=Math.min(1,e.ripple+dt/RIPPLE_SECONDS);
    const dx=pose.x-camPos.x,dz=pose.z-camPos.z,d2=dx*dx+dz*dz;
    if(d2>DRAW_RANGE*DRAW_RANGE){hideEntry(e);continue;}
    sphere.center.set(pose.x,pose.y+1,pose.z);sphere.radius=2;
    if(!frustum.intersectsSphere(sphere)){hideEntry(e);continue;}
    const k=Math.max(.001,pose.fade*saverFade*e.door);
    e.d2=d2;e.ld2=local?(pose.x-local.x)*(pose.x-local.x)+(pose.z-local.z)*(pose.z-local.z):d2;
    // The dome: grows in as they go busy, pops (swells and fades) as they come back; the ball's shake is skipped under reduced motion.
    if(e.field>.002)fields.add(pose.x,pose.y,pose.z,e.field*k,FS*(shield?.86+.14*e.field:1+(1-e.field)*.28),reduced?0:e.shake*e.shake,reduced?1:e.ripple,e.hx,e.hy,e.hz,e.slot);
    if(!rig){ // beyond the rig cap: colour ring + label (+ emote bubble) only, no body
     e.shown=false;e.needResume=true;
     if(d2<=RING_ONLY_RANGE*RING_ONLY_RANGE)ringAdd(pose.x,pose.y,pose.z,Math.sqrt(d2),e.colour,ringSizeFor(pose.mode),k,friendRingPitch(e,pose,dt),pose.yaw);
     placeLabel(e,pose,k,reduced);continue;
    }
    // Far friends solve their pose at 10 Hz (> 20 m) / 5 Hz (> 60 m); the root still follows every frame.
    const root3=rig.root,motion=e.motion;
    root3.position.set(pose.x,pose.y,pose.z);root3.scale.setScalar(BODY_SCALE*k*e.out);
    e.acc+=dt;
    const period=e.hf>=0&&!reduced?0:d2>MID_POSE*MID_POSE?1/FARTHER_HZ:d2>FAR_POSE*FAR_POSE?1/FAR_HZ:0;
    const moving=!shield&&pose.speed>.3; // inside the field they stand still (the speed byte carries the activity)
    e.spd=shield?0:pose.speed;
    if(period===0||e.acc>=period+e.slot*period||e.needResume){
     const step=Math.min(e.acc,.1);e.acc=0;
     const mode=pose.mode;e.lastMode=mode;
     motion.facing=pose.yaw;motion.resumePose=e.needResume;motion.travelMode=shield?undefined:travelFor(mode);
     motion.parachute=!shield&&(mode===Mode.Parachute||mode===Mode.Zipline);
     motion.called=0;motion.jump=undefined;motion.skill=e.hf>=0&&!reduced&&highFiveSkill(HF_SKILL,e.hf,0,e.emoteAge)?HF_SKILL as SkillMotion:undefined;
     if(mode===Mode.Swim||mode===Mode.Dive||shield&&pose.zone===Zone.Sea){
      const s=e.swim;s.kind=moving?'crawl':'tread';s.effort=moving?Math.min(1,pose.speed/3):0;s.phase=reduced?0:s.phase+step*(moving?5:1.5);s.under=mode===Mode.Dive?.7:0;motion.swim=s;
     }else motion.swim=undefined;
     // Emotes: JuggleWithMe/Wave/HighFive raise the "called" arm; Cheer/WellPlayed celebrate. Reduced motion keeps only the bubble.
     if(e.emote>=0&&!reduced){
      const em=e.emote,age=e.emoteAge;
      if(e.hf<0&&!fs0&&e.mv<0){const b=emoteBody(em,age,emoteSeconds(em));motion.jump=b.jump;motion.called=b.called;}
      if(e.hf<0&&!fs0&&e.ball&&(em===Emote.PassBall||em===Emote.JuggleWithMe))friendBallMotion(e.ball,em===Emote.JuggleWithMe,age,pose.yaw,motion);/* the ball routines' body (lib/town/emoteBallPlay.ts) */
     }
     if(e.ball&&(reduced||!(e.emote===Emote.PassBall||e.emote===Emote.JuggleWithMe))&&motion.turnSmoothing!==undefined)clearBallMotion(motion);
     rig.update(pose.x,pose.z,step,clock,reduced,motion);
     if(e.emote>=0&&e.mv>=0&&!reduced)applyMoveEmote(rig.root,e.mv,e.mvV,e.emoteAge,moveWeight(e.emoteAge,e.mvDur));/* a moving emote: layered on their own walk / run cycle */
     else if(e.emote>=0&&!reduced&&e.hf<0&&!fs0&&e.emote!==Emote.JuggleWithMe&&e.emote!==Emote.PassBall)applyEmoteArms(rig.root,e.emote,e.emoteAge,emoteSeconds(e.emote));
     else if(fs0&&!reduced&&fs0.arm>=0&&e.emoteAge>=fs0.armFrom)applyRideEmote(rig.root,fs0.arm,e.emoteAge,Math.max(0,Math.min(1,(e.emoteAge-fs0.armFrom)/.2,(fs0.seconds-e.emoteAge)/.2)));
     root3.position.set(pose.x,pose.y,pose.z);
     // A friend's high five: an "air five" toward the camera side (their own random variation, shown on every screen alike).
     if(e.hf>=0&&!reduced)applyHighFive(rig.root,e.hf,0,e.emoteAge,1,FACE_CAMERA,BODY_SCALE*k*e.out);
     e.needResume=false;
    }
    // A flying / swimming friend's emote (their mode picks it from the same wire value): roll / pitch / lift on the rig root, every frame, gone with the emote.
    if(fs0&&!reduced){flourishAt(fs0.emote,e.emoteAge,fs0.seconds,FL,1);root3.rotation.order='YXZ';root3.rotation.x=FL.pitch;root3.rotation.z=FL.roll;root3.position.y+=FL.lift*k;e.flOn=true;}
    else if(e.flOn){root3.rotation.x=0;root3.rotation.z=0;e.flOn=false;}
    batch.draw(root3);e.shown=true;shown++;
    // Colour ring at the feet; the emote pulse is skipped under reduced motion.
    ringAdd(pose.x,pose.y,pose.z,Math.sqrt(d2),e.colour,(e.emote>=0&&!reduced?1+.18*Math.sin(e.emoteAge*14):1)*ringSizeFor(pose.mode),k,friendRingPitch(e,pose,dt),pose.yaw);
    placeLabel(e,pose,k,reduced);
   }
   pickVisible(candL,LABEL_MAX);pickVisible(candB,BUBBLE_MAX);
   if(local&&saverFade>0)addLocalRing(local,camPos);
   ringsEnd();fields.end(dt,reduced);
   batch.end();shownCount=shown;
   // The batch makes its meshes lazily and defaults them to casting: friends never cast (no shadow registration anywhere).
   for(let i=0;i<drawn.children.length;i++)drawn.children[i].castShadow=false;
  },
  dispose(){
   if(disposed)return;disposed=true;
   for(let i=0;i<list.length;i++)release(list[i]);
   list.length=0;byId.clear();batch.dispose();rings.dispose();ringGeo.dispose();ringMat.dispose();fields.dispose();
   for(const t of statusTextures.values())t.dispose();statusTextures.clear();
   for(const t of iconTextures.values())t.dispose();iconTextures.clear();
   root.removeFromParent();
  },
 };
}
