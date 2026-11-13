// Remote friends (multiplayer, docs/multiplayer-design.md 2.3, 2.5, 4.7, 5.1). Heat rules, all of them:
//  - ONE playerBatch (capacity 8) for every remote: a bean rig per friend, drawn as instances, never in the scene graph itself;
//  - the islandNpcs.ts fixes: hidden classic geometry released + detached, far posing at 10 Hz (> 20 m) / 5 Hz (> 60 m),
//    not drawn beyond 160 m, nothing drawn or solved off screen;
//  - the batched meshes never cast shadows and nothing here is registered with any shadow culling;
//  - the cap is RE-CHECKED once a second (rigCap.ts, Oct 22 2026; before, it applied only at admission): a heat-tier drop demotes the
//    farthest rigs to ring + label (0.4 s shrink, instant under reduced motion, then the rig is released), a recovered tier re-admits
//    the nearest in range after 10 s at the higher cap (no thrash on a flapping tier); Battery saver fades everyone out;
//  - a name label is one Sprite per friend with a CanvasTexture made once on upsert; only the nearest 8 on screen within 25 m are visible, and at most 6 emote bubbles at once (big parties);
//    live feel (Oct 23 2026): the label is as big as the townsfolk's name tags (readable from the phone's island camera);
//  - friends' balls (relay v1.2): at most BALL_MAX (4) ball meshes, nearest first, sharing the island ball's geometry + material, no shadows;
//    relay v1.7 (Cap.Kit): a friend's Kit Shop ball (design only, never their drawing) is ONE baked skin per design, at most KIT_SKINS (2)
//    alive (least recently drawn evicted + disposed), baked on the S.Kit that brings it (shopBallSkin.ts loaded on demand), never per frame;
//    their jersey colours, number and boot colour go into the rig's own outfit slots (setBeanLook on a change only);
//  - flying friends' jet plumes: ONE shared instanced pool (remoteJets.ts) for the nearest 3 flying friends;
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
import {DEMOTE_FADE,capGate,planNearest,planRigs,stepCapGate,RIG_HYST_M,ROOM_HYST_M} from './rigCap';
import {devRegisterLayer,publicDraw,strangerLabel} from './remotePublic';
import {emoteSeconds} from '../town/emoteReact';import {applyEmoteArms,emoteBody} from './emotePose';
import {applyHighFive} from './highFivePose';import {actorMotion,clearBallMotion,createPassBallOut,friendBallMotion,pickBallRoutine,type PassBallOut} from '../town/emotePass';import {createDuetOut,duetAt,duetSeconds,type DuetOut} from '../town/emoteDuet';import {applyRideEmote} from './celebrations';import {createIdleWave,stepIdleWave,IDLE_SPEED,type IdleWave} from '../town/jetpackIdleWave';import {applyIdleGesture} from './jetpackIdlePose';import {emoteCtxOfMode,flourishAt,flourishForWire,friendFlourishLapsed,type Flourish} from '../town/emoteContexts';import {cycleFrame,type BubbleFrame} from '../town/emoteBubbleMotion';import {MOVE_ROLE,friendMoveEnd,moveForWire,moveWeight,pickMoveVariant} from '../town/moveEmotes';import {applyMoveEmote} from './moveEmotePose';
import {HIGH_FIVES,createHighFiveBag,highFivePlan,highFiveSkill} from '../town/highFive';
import type {SkillMotion} from './skillMoves';
import {beanLookFor,playerOutfit} from '../town/customization';
import {CLASSIC_BALL,createClassicBallGeometry,createClassicBallMaterial} from './ballAppearance';
import {kitBall,kitBallKey,kitKey,kitOutfit} from '../multiplayer/kit';
import {wireToLook} from '../multiplayer/look';
import type {RemotePose} from '../multiplayer/interp';
import {BallState,Emote,Mode,Zone,PARTY_MAX,WORLD_HARD,WORLD_SEE_M,presenceOf,shielded,type Kit,type Look,type MemberId} from '../../multiplayer/protocol';
import {presenceIconAt,presenceTextAt} from '../multiplayer/presence';
import {createForceFields} from './forceField';
import {createRemoteJets} from './remoteJets';
import type {TravelMode} from '../town/travelModes';
import {RIDE_SCALE,bikeCrankRate,createRemoteRides,rideKindFor} from './remoteRides';import {createRiderSpots,type RiderSpots} from './rideSplash';import {beanShapeOf} from './beanGearFit';
import {applyBump,createFriendBumps,unBump,type LocalBump} from './friendBump';import {applyTumbleRoot,createFriendTumbles} from './ballTumble';import {createBumpReact,type BumpReact} from '../town/friendBump';

/** Remotes drawn as rigs at once by effective heat tier: phones 5/5/3/1/0, desktop 5, Battery saver 0 (design 2.5). Re-checked once a second. */
export function remoteCap(tier:HeatTier,phone:boolean,saver:boolean):number{
 if(saver)return 0;
 if(!phone)return 5;
 return tier<=1?5:tier===2?3:tier===3?1:0;
}

/** The member's colour (hex): the label's dot and rim and the ground ring. The label text is the first name (or the colour name). */
export interface MemberStyle{hex:string}
/** `pitch` (rad, + leans forward) and `yaw` = the local body's real flight pitch / heading: the ring follows the body while flying (Mode.Jetpack). */
/** A friend's sampled ball (lib/multiplayer/roomParty.ts): state = BallState; x / y / z (m) for a Free ball. */
export interface RemoteBall{state:number;x:number;y:number;z:number}
export interface LocalRing{x:number;y:number;z:number;hex:string;mode?:number;pitch?:number;yaw?:number}
export interface RemoteAvatars{
 readonly root:T.Object3D;
 /** The label / status / emote sprites (each at its friend's position): the only children the view gate may treat as units. */
 readonly labels:T.Object3D;
 /** `style` = the member's name colour (hex): drawn on the label and as the ground ring. */
 upsert(id:MemberId,look:Look,name:string,style?:MemberStyle):void;
 /** Relay v1.7 (Cap.Kit): this friend's worn Kit Shop gear (null = none): shirt / trim / shorts / socks / number / boots on their rig,
  *  their ball skinned with the design. A no-op when unchanged or unknown (call after upsert). */
 setKit(id:MemberId,kit:Kit|null):void;
 /** Friends' Kit Shop ball skins alive (at most KIT_SKINS; tests / heat checks). */
 readonly kitSkins:number;
 remove(id:MemberId):void;
 /** Local choices (PartyHost Hide / Mute): hidden friends are not drawn at all (avatar, ring, label, emote bubble); muted friends' emotes are not shown. */
 setHidden(ids:ReadonlySet<MemberId>):void;
 setMuted(ids:ReadonlySet<MemberId>):void;
 /** Plays a friend's emote; false when it is not shown (muted, hidden, inside a force field, unknown). */
 emote(id:MemberId,e:Emote):boolean;
 /** Relay v1.4: this friend plays a two-ball duet (lib/town/emoteDuet.ts) with `partner` (another friend's id, or -1 = the local player, whose
  *  feet come from the `local` ring each frame) as `role` (0 = the asker). Their body and their own ball follow the shared routine (the ball
  *  is drawn here from the routine, not from the network, so it meets their foot). Ends by itself, or when either one moves away. */
 duet(id:MemberId,partner:number,role:number,emote:number,seed:number):boolean;
 endDuet(id:MemberId):void;
 /** The island ball hit this friend's force field: a short damped shake and a ripple from the impact normal (dome space). */
 bumpField(id:MemberId,nx:number,ny:number,nz:number):void;
 /** Relay v1.6 (Cap.Hit): a friend's ball knocked this friend over: the ~1 s cartoon tumble toward `dir` (rad, atan2(vx, vz)) on their
  *  rig (lib/graphics/ballTumble.ts); reduced motion = a small wobble. False when not shown here (hidden, inside the force field, unknown). */
 tumble(id:MemberId,dir:number,reduced:boolean):boolean;
 /** Friends tumbling right now (tests / headless checks). */
 readonly tumbling:number;
 /** `local`: the local player's feet + colour while in a live party (ring only); null / omitted = none. */
 update(dt:number,poses:Map<MemberId,RemotePose>,camera:T.Camera,reduced:boolean,local?:LocalRing|null,balls?:ReadonlyMap<MemberId,RemoteBall>|null):void;
 /** Friends' balls drawn last frame, and flying friends with a plume (heat checks / tests). */
 readonly ballsShown:number;readonly jetsShown:number;
 readonly shown:number;
 /** Rigs alive (admitted + still shrinking after a demotion): the heat checks' leak counter. */
 readonly rigs:number;
 /** Tests / headless checks only (allocates): each friend's emote state and drawn spot. */
 debugEmotes():{id:MemberId;emote:number;age:number;x:number;z:number;yaw:number}[];
 /** The townsperson whose name tag / speech bubble shows now (Town, from islandNpcs.taggedId), or on=false for none: a friend's name
  *  label and status line within NPC_TAG_CLEAR m of it stay hidden so they never cover the NPC's label (live QA Nov 12 2026: a
  *  remote tag sat over "Captain of the Deep Sea Boat" and her bubble). */
 avoidLabelsNear(x:number,y:number,z:number,on:boolean):void;
 /** Friend bumps (friendBump.ts): the local player's cosmetic overlay this frame (Town applies it around the render only) and bumps so far. */
 readonly localBump:LocalBump;readonly bumps:number;
 /** Friends drawn on a ride last frame (rideSplash.ts: the splash in the shallows); preallocated, `n` = how many. */
 readonly riders:RiderSpots;
 /** Public island: strangers still fading out after remove() (a bridge that stops updating when the socket closes may keep calling
  *  update while this is true, so "Just me" fades everyone over ~1 s), and rigs drawn at the personal-space alpha last frame. */
 readonly fading:boolean;readonly ghosts:number;
 /** Tests / heat checks only (allocates). */
 debugPublic():{pub:boolean;room:boolean;strangers:number;drawn:number;leaving:number;ghosts:number;ghostRings:number;rings:number;labels:string[]};
 /** Tap on a player (remotePick.ts; allocates, on a tap only): who was drawn last frame (body, or ring + label) with their feet spot and
  *  drawn scale, and that frame's camera. Hidden, leaving and over-the-room-cap players are never listed. */
 tapSpots():{camera:T.Camera|null;spots:{id:MemberId;x:number;y:number;z:number;k:number;d:number}[]};
 dispose():void;
}

const HF_SKILL={type:'highFive' as const,progress:0,side:1 as -1|1};
const FACE_CAMERA=Math.atan2(16,33),hfBag=createHighFiveBag();
/** Public island: a world holds WORLD_HARD (30) members, a party PARTY_MAX (20); every per-member pool is sized for the larger. */
export const MAX_REMOTE=Math.max(PARTY_MAX,WORLD_HARD);
/** Strangers only (public mode): within PERSONAL_SPACE_M (horizontal) of me, or standing between a room's camera and my spot, a remote
*  fades to PERSONAL_ALPHA over PERSONAL_FADE_S (nobody can block the view or crowd; there is no collision and none is added). At most
*  ROOM_CAP strangers are drawn in a room (nearest first); at most STRANGER_EMOTES_PER_MIN emotes per sender reach the scene. */
export const PERSONAL_SPACE_M=1.2,PERSONAL_ALPHA=.4,PERSONAL_FADE_S=.25,ROOM_CAP=6,GHOST_CAPACITY=5,GHOST_RING_CAPACITY=8,STRANGER_EMOTES_PER_MIN=6,OCCLUDE_HALF_W=.7,OCCLUDE_PAST_M=1.5,FAR_FADE_M=10;
const PS2=PERSONAL_SPACE_M*PERSONAL_SPACE_M;
/** True when (px, pz) stands on the camera's sight line to the focus (my spot), up to OCCLUDE_PAST_M beyond it (the machine I face). */
export function inSightLine(cx:number,cz:number,fx:number,fz:number,px:number,pz:number):boolean{
const dx=fx-cx,dz=fz-cz,L=Math.hypot(dx,dz);if(L<1e-3)return false;
const ux=dx/L,uz=dz/L,ax=px-cx,az=pz-cz,t=ax*ux+az*uz;
return t>.3&&t<L+OCCLUDE_PAST_M&&Math.abs(ax*uz-az*ux)<OCCLUDE_HALF_W;
}
/** One frame of the personal-space fade toward `target` (linear, PERSONAL_FADE_S for the whole way; reduced motion: at once). */
export function stepPersonal(ps:number,target:number,dt:number,reduced:boolean):number{if(reduced)return target;const r=(1-PERSONAL_ALPHA)/PERSONAL_FADE_S*dt;return ps<target?Math.min(target,ps+r):Math.max(target,ps-r);}
/** Fade a stranger out over the last FAR_FADE_M before the relay's WORLD_SEE_M cut-off (squared metres in). */
export function farFade(d2:number):number{return Math.min(1,Math.max(0,(WORLD_SEE_M-Math.sqrt(d2))/FAR_FADE_M));}
const isSel=(e:{sel:boolean})=>e.sel,isAdmitted=(e:{admitted:boolean})=>e.admitted;
const BATCH_CAPACITY=8,FAR_POSE=20,MID_POSE=60,FAR_HZ=10,FARTHER_HZ=5,DRAW_RANGE=160,LABEL_RANGE=25,LABEL_MAX=8,BUBBLE_MAX=6,RING_ONLY_RANGE=90,ADMIT_RECHECK=1,SAVER_FADE_SECONDS=1,BODY_SCALE=1.12,DUET_DRIFT=1.5,RING_CAPACITY=MAX_REMOTE+1,RING_RADIUS=1,RING_FAR_M=60,RING_MAX_GROW=4,RING_LIFT=.10,RING_PITCH_LIMIT=1.45,RING_TILT_K=.6,RING_TILT_MAX=.9,RING_BODY_LIFT=.2,RING_BODY_FWD=.05,FRIEND_PITCH_MAX=1.1;
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
 /** Relay v1.7: the worn kit (null none), its key, and its ball part's key ('' = the classic ball). */
 kit:Kit|null;kitKey:string;ballKey:string;
 rig:PlayerRig|null;label:T.Sprite|null;labelTexture:T.CanvasTexture|null;bubble:T.Sprite|null;
 admitted:boolean;shown:boolean;
 /** Cap recheck (rigCap.ts): priority distance², the planned change, demoting (shrinking, rig still held) and its scale 1..0. */
 pd2:number;plan:number;dem:boolean;out:number;
 motion:PlayerMotion;swim:SwimPose;
 emote:number;emoteAge:number;hidden:boolean;muted:boolean;
 /** Jetpack idle gestures (Nov 8 2026): the same machine as the local player, driven by their mode + speed (no extra network field). */
 iw:IdleWave;
 /** The sender's last mode (so a wire emote picks the flying / swimming flourish) and whether a flourish rotation is on the rig. */
 lastMode:number;flOn:boolean;/** the drawing guard (drawnAs, last pose solve): swim / jetpack pose allowed, and the lift that keeps a refused swimmer on the ground */wet:boolean;jet:boolean;lift:number;
 /** The sender's mode when the emote arrived: its flourish is picked from this and ends when their context changes (friendFlourishLapsed). */
 emMode:number;
 /** A moving emote (lib/town/moveEmotes.ts: the sender walked / ran when it arrived): its local id (-1 none), variant (their own bag here), length, and the friend's last speed. */
 mv:number;mvV:number;mvDur:number;spd:number;
 /** Smoothed estimated flight pitch (rad) of a Jetpack friend, for the colour ring. */
 rp:number;
 /** The high five variation this friend is playing (0..9; -1 none). The wire format has no spare field, so each screen picks its own. */
 hf:number;
 /** A Pass it / Juggle with me routine this friend's body plays (picked locally; no ball on their side), made on the first ball emote. */
 ball:PassBallOut|null;
 /** A two-ball duet (relay v1.4): partner (-1 = the local player), role, the shared routine's emote / seed, age / length, where both stood, and the reused output. */
 du:{on:boolean;was:boolean;partner:number;role:number;emote:number;seed:number;age:number;dur:number;sx:number;sz:number;px:number;pz:number;started:boolean;out:DuetOut;a:{x:number;y:number;z:number};b:{x:number;y:number;z:number}}|null;
 acc:number;slot:number;needResume:boolean;d2:number;/** squared horizontal distance from the LOCAL player (the label range; d2 is from the camera, ~35 m back on the island) */ld2:number;
 /** Presence: inside the force field now; field 0..1 (eased), door 1..0 (indoors fade), shake / ripple of a ball hit, the status sprite + its line. */
 shield:boolean;field:number;door:number;shake:number;ripple:number;hx:number;hy:number;hz:number;status:T.Sprite|null;statusKey:string;
 /** The status line, rebuilt only when the presence or activity changes (was a string concat per busy friend per frame). */
 prWas:string;actWas:number;lineWas:string;
 /** Live feel: this friend's ball last frame (for the roll), whether it was drawn, its spin. */
 bx:number;by:number;bz:number;bOn:boolean;bq:T.Quaternion;
 /** A friend bump's cosmetic reaction (friendBump.ts; made once on upsert). */
 bump:BumpReact;
 /** Their ride (remoteRides.ts): the bean seat fit (set with the look) and the rolled distance that spins the wheels. */
 rb:boolean;ra:number;
 /** Their bean bike's crank angle (rad), turned at the rig's pedalling cadence (remoteRides.ts bikeCrankRate). */
 ca:number;
 /** Public island: a stranger (all remotes while the page is in a world); the name upsert passed (drawn for party friends only); the
  *  user's Hide; the personal-space alpha 1..PERSONAL_ALPHA; leaving (removed: fades out over SAVER_FADE_SECONDS at the last pose `lp`)
  *  and that fade 1..0; drawn in the room (room cap); the last 6 stranger emote times (layer clock, s); the label's cached name pair. */
 st:boolean;given:string;uh:boolean;ps:number;leaving:boolean;lv:number;lp:RemotePose;sel:boolean;em:Float64Array;emI:number;pc:number;pa:number;
};

// Live feel (Oct 23 2026): the old 256 x 64 canvas at 27 px drawn 1.5 m wide made a name ~0.16 m tall, unreadable from the phone's
// island camera (~35 m back). Now a 512 x 128 canvas at 60 px, drawn LABEL_WORLD_W (3.4 m) wide: the name is ~0.4 m tall, a bit bigger
// than a townsfolk name tag (43 px on a 3.5 m wide 512 canvas = 0.29 m). Still ONE sprite + ONE texture per friend, made on upsert.
export const LABEL_W=512,LABEL_H=128,LABEL_FONT_PX=60,LABEL_WORLD_W=3.4,LABEL_Y=2.62;
/** The label keeps its world size up to LABEL_NEAR_M (m) from the camera (the phone's island view), then grows with the distance up to LABEL_FAR_GROW x. */
export const LABEL_NEAR_M=34,LABEL_FAR_GROW=1.7;
const labelH=(_style:MemberStyle|null)=>LABEL_H;
/** World height (m) of the name's letters (tests compare it with the townsfolk tag). */
export const labelTextWorldHeight=()=>LABEL_FONT_PX/LABEL_W*LABEL_WORLD_W;
function makeLabelTexture(text:string,style:MemberStyle|null){
 const H=labelH(style),W=LABEL_W,cx=W/2;
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 const g=canvas.getContext('2d');
 if(g){
  const label=text;
  g.clearRect(0,0,W,H);g.font=`800 ${LABEL_FONT_PX}px system-ui, sans-serif`;g.textAlign='center';g.textBaseline='middle';
  const dot=style?54:0;
  let w=Math.min(W-12,g.measureText(label).width+52+dot);
  const x0=cx-w/2,ph=H-20,cy=H/2;
  g.fillStyle='rgba(20,34,46,.8)';g.beginPath();g.roundRect?g.roundRect(x0,10,w,ph,ph/2):g.rect(x0,10,w,ph);g.fill();
  if(style){
   g.lineWidth=6;g.strokeStyle=style.hex;g.stroke(); // coloured rim = the ring colour
   g.fillStyle=style.hex;g.beginPath();g.arc(x0+40,cy,17,0,Math.PI*2);g.fill();g.lineWidth=3;g.strokeStyle='rgba(20,34,46,.9)';g.stroke();
  }
  g.lineWidth=7;g.lineJoin='round';g.strokeStyle='rgba(10,20,28,.55)';g.strokeText(label,cx+dot/2,cy+2,W-60-dot);
  g.fillStyle='#ffffff';g.fillText(label,cx+dot/2,cy+2,W-60-dot);
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=2;return texture;
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
const frustum=new T.Frustum(),projection=new T.Matrix4(),sphere=new T.Sphere(),camPos=new T.Vector3(),camDir=new T.Vector3();

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
/** Friends' balls: at most BALL_MAX drawn (nearest to the camera), within BALL_DRAW_RANGE; plumes for flying friends within JET_RANGE. */
export const BALL_MAX=4,BALL_DRAW_RANGE=70,JET_RANGE=70,BALL_RADIUS=.19;
/** A jetpack pose closer than this to the ground is drawn as walking / standing (no backpack hover, no plume). */
export const JET_MIN_AGL=1;
/** Nov 12 2026 (public island review, Low): what a remote's body may show, whatever its wire mode says. A swim / dive (or an away
 *  friend in the sea) only off dry land (`land` = the island's onLand at their x, z); a jetpack only >= JET_MIN_AGL above the ground
 *  (`agl` = their y minus groundAt; NaN = unknown, allowed). Otherwise the walk / idle body, so a modified client or a bot cannot swim
 *  down a street or hover a jetpack at ground level. Cosmetic only: the wire and the relay are unchanged. */
export function drawnAs(mode:number,zone:number,shield:boolean,land:boolean,agl:number):{wet:boolean;jet:boolean}{
 const swimish=mode===Mode.Swim||mode===Mode.Dive||shield&&zone===Zone.Sea;
 return {wet:swimish&&!land,jet:mode===Mode.Jetpack&&!(agl<JET_MIN_AGL)};
}
/** Relay v1.7: friends' Kit Shop ball skins alive at once (each one 256x128 texture + one material). */
export const KIT_SKINS=2;
const ballAxis=new T.Vector3(),ballSpin=new T.Quaternion(),feelSpot=new T.Vector3();
const onFoot=(mode:number)=>mode===Mode.Walk||mode===Mode.Run||mode===Mode.Idle;
/** Where a friend's ball is drawn (writes out.x/y/z; false = not drawn): Free at its own spot, Feet in front of their feet, Juggle bobbing over them. Exported for tests. */
export function friendBallSpot(state:number,b:{x:number;y:number;z:number},pose:{x:number;y:number;z:number;yaw:number;mode:number},clock:number,phase:number,out:{x:number;y:number;z:number}):boolean{
 if(state===BallState.Free){out.x=b.x;out.y=b.y;out.z=b.z;return true;}
 if(state!==BallState.Feet&&state!==BallState.Juggle||!onFoot(pose.mode))return false;
 const fwd=state===BallState.Feet?.55:.32;
 out.x=pose.x+Math.sin(pose.yaw)*fwd;out.z=pose.z+Math.cos(pose.yaw)*fwd;
 out.y=state===BallState.Feet?pose.y+BALL_RADIUS:pose.y+.45+Math.abs(Math.sin(clock*5.2+phase*6))*.7;
 return true;
}
/** `fieldScale`: the force field size (rooms use ~0.7: an r 0.8 m dome in a small room instead of the island's 1.15 m).
 *  `groundAt`: the island's ground height (m) under x, z, where a flying friend's plume settles (none: it falls 3 m and fades). */
export function createRemoteAvatars(scene:T.Scene,opts:{phone:boolean;maxFor:(tier:HeatTier,phone:boolean)=>number;fieldScale?:number;groundAt?:(x:number,z:number)=>number;/** dry land at x, z (the island passes onLand): gates the swim pose (drawnAs) */landAt?:(x:number,z:number)=>boolean;
/** A room page (the stranger room cap of ROOM_CAP); default: a layer with a fieldScale (only rooms pass one, createRoomParty). */room?:boolean}):RemoteAvatars{
 const FS=opts.fieldScale??1;
 const root=new T.Group();root.name='remote-avatars';scene.add(root);
 const drawn=new T.Scene();drawn.name='remote-avatars-batch';root.add(drawn);
 const batch=playerBatch(drawn,BATCH_CAPACITY);
 const ringGeo=ringGeometry();
 const ringMat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const rings=new T.InstancedMesh(ringGeo,ringMat,RING_CAPACITY);rings.name='remote-avatar-rings';rings.frustumCulled=false;rings.castShadow=false;rings.receiveShadow=false;rings.count=0;rings.renderOrder=2;
 rings.raycast=()=>{};rings.setColorAt(0,localColour.set('#ffffff'));root.add(rings);
 // Public island, the personal-space fade: a near stranger's ring goes to this small second ring mesh and their rig to a second batch
 // (ghost) whose cloned materials are made transparent once, both at PERSONAL_ALPHA (the lowest alpha drawn). Empty = no draw call.
 const ghostRingMat=ringMat.clone();ghostRingMat.opacity=PERSONAL_ALPHA;
 const ghostRings=new T.InstancedMesh(ringGeo,ghostRingMat,GHOST_RING_CAPACITY);ghostRings.name='remote-avatar-rings-near';ghostRings.frustumCulled=false;ghostRings.castShadow=false;ghostRings.receiveShadow=false;ghostRings.count=0;ghostRings.visible=false;ghostRings.renderOrder=2;ghostRings.raycast=()=>{};ghostRings.setColorAt(0,localColour);root.add(ghostRings);
 const ghostDrawn=new T.Scene();ghostDrawn.name='remote-avatars-near';root.add(ghostDrawn);
 const ghost=playerBatch(ghostDrawn,GHOST_CAPACITY);let ghostRingN=0,ghostRingA=1,ghostN=0,ghostA=1,ghostPrepared=0,ghostWas=-1;
 function prepGhost(){
  const ch=ghostDrawn.children;
  if(ch.length>ghostPrepared){for(let i=ghostPrepared;i<ch.length;i++){const m=ch[i] as T.Mesh,mat=m.material as T.Material;m.castShadow=false;m.receiveShadow=false;mat.transparent=true;mat.depthWrite=true;mat.needsUpdate=true;}ghostPrepared=ch.length;ghostWas=-1;}
  const a=ghostN>0?ghostA:1;
  if(a!==ghostWas){ghostWas=a;for(let i=0;i<ch.length;i++)((ch[i] as T.Mesh).material as T.Material).opacity=a;}
 }
 const fields=createForceFields(MAX_REMOTE);root.add(fields.mesh);
 const jets=createRemoteJets();root.add(jets.root);
 const bumps=createFriendBumps(root);
 // Friends' scooters / bikes / mopeds under the shown rigs only (same cap as the bodies): instanced, baked on the first friend ride.
 const rides=createRemoteRides(BATCH_CAPACITY);root.add(rides.root);const riders=createRiderSpots(BATCH_CAPACITY);
 // Friends' balls: BALL_MAX meshes sharing ONE geometry + material: the classic island ball (cream + six pentagons baked as
 // vertex colours, lib/graphics/ballAppearance.ts), on the island and in every room. The wire carries no skin, so never the local skin.
 const ballGeo=createClassicBallGeometry(BALL_RADIUS),ballMat=createClassicBallMaterial();
 const ballMeshes:T.Mesh[]=[];
 for(let i=0;i<BALL_MAX;i++){const m=new T.Mesh(ballGeo,ballMat);m.name='remote-ball';m.visible=false;m.castShadow=false;m.receiveShadow=false;m.raycast=()=>{};m.frustumCulled=false;root.add(m);ballMeshes.push(m);}
 const candBall:Entry[]=[],candJet:Entry[]=[],ballSpot={x:0,y:0,z:0},ballD2=new Float64Array(MAX_REMOTE+12);
 let ballsShown=0,jetsShown=0;
 let ringN=0;
 function ringAdd(x:number,y:number,z:number,dist:number,c:T.Color,pulse:number,k:number,pitch=0,yaw=0,alpha=1){
  const near=alpha<.985&&ghostRingN<GHOST_RING_CAPACITY;
  if(!near&&ringN>=RING_CAPACITY)return;
  const sc=RING_RADIUS*Math.min(RING_MAX_GROW,Math.max(1,dist/RING_FAR_M))*pulse*k;
  ringScale.set(sc,1,sc);ringPlacement(x,y,z,pitch,yaw,ringQ,ringPos);ringM.compose(ringPos,ringQ,ringScale);
  if(near){ghostRings.setMatrixAt(ghostRingN,ringM);ghostRings.setColorAt(ghostRingN,c);ghostRingN++;if(alpha<ghostRingA)ghostRingA=alpha;return;}
  rings.setMatrixAt(ringN,ringM);rings.setColorAt(ringN,c);ringN++;
 }
 function ringsEnd(){rings.count=ringN;rings.instanceMatrix.needsUpdate=true;if(rings.instanceColor)rings.instanceColor.needsUpdate=true;
  ghostRings.count=ghostRingN;ghostRings.visible=ghostRingN>0;if(ghostRingN>0){ghostRings.instanceMatrix.needsUpdate=true;if(ghostRings.instanceColor)ghostRings.instanceColor.needsUpdate=true;ghostRingMat.opacity=ghostRingA;}}
 const candL:Entry[]=[],candB:Entry[]=[];
 const npcTag={on:false,x:0,y:0,z:0},NPC_TAG_CLEAR=2.6;
 const nearNpcTag=(p:RemotePose)=>{if(!npcTag.on)return false;const dx=p.x-npcTag.x,dz=p.z-npcTag.z;return dx*dx+dz*dz<NPC_TAG_CLEAR*NPC_TAG_CLEAR&&Math.abs(p.y-npcTag.y)<2.5;};
 /** Label + emote bubble placement. Both are only CANDIDATES here: the nearest LABEL_MAX labels (within LABEL_RANGE) and BUBBLE_MAX bubbles are made visible by pickVisible after the pass. */
 function placeLabel(e:Entry,pose:RemotePose,k:number,reduced:boolean){
  const label=e.label!,bubble=e.bubble!,d2=e.d2,ld2=e.ld2;
  label.visible=false;bubble.visible=false;
  const underNpc=nearNpcTag(pose);
  if(ld2<LABEL_RANGE*LABEL_RANGE&&!underNpc){label.position.set(pose.x,pose.y+LABEL_Y*k,pose.z);/* a far camera (the desktop island view sits higher than the phone's) grows the label up to LABEL_FAR_GROW so it never shrinks below the phone size on screen */const cy=pose.y+LABEL_Y-camPos.y,ls=LABEL_WORLD_W*Math.min(LABEL_FAR_GROW,Math.max(1,Math.sqrt(d2+cy*cy)/LABEL_NEAR_M));label.scale.set(ls,ls*LABEL_H/LABEL_W,1);(label.material as T.SpriteMaterial).opacity=k*e.ps;candL.push(e);}
  // The status line ("Taking a lesson", "Away") is THE information about a busy friend: shown to STATUS_RANGE (only busy friends have one),
  // sitting above the name label at a constant screen size (sizeAttenuation off), so it reads from the usual walking camera (~40 m).
  if(e.status){const show=!!e.statusKey&&d2<STATUS_RANGE*STATUS_RANGE&&!underNpc;e.status.visible=show;
   if(show){e.status.position.set(pose.x,pose.y+LABEL_Y*k+.62,pose.z);(e.status.material as T.SpriteMaterial).opacity=k;}}
  if(e.emote>=0){
   if(bubble.userData.icon!==e.emote){bubble.userData.icon=e.emote;const m=bubble.material as T.SpriteMaterial;m.map=iconTexture(e.emote);m.needsUpdate=true;}
   const fs=e.rig?flourishForWire(e.emote,e.emMode):undefined;
   const dur=e.mv>=0?e.mvDur:fs?fs.seconds:e.hf>=0?HIGH_FIVES[e.hf].duration:emoteSeconds(e.emote),f=cycleFrame(e.emoteAge,dur,reduced,BF);// pops in, floats up with a sway, dissipates; repeats through the emote
   if(f.visible){bubble.position.set(pose.x+f.dx,pose.y+3.3*k+f.dy,pose.z);bubble.scale.setScalar(.72*f.scale);(bubble.material as T.SpriteMaterial).opacity=f.opacity;candB.push(e);}
  }
 }
 /** Shows only the nearest `max` candidates (insertion sort by squared distance; no allocation). Label candidates drive `label`, bubble candidates `bubble`. */
 function pickVisible(c:Entry[],max:number){
  const isLabel=c===candL;
  for(let i=1;i<c.length;i++){const x=c[i];let j=i-1;while(j>=0&&(isLabel?c[j].ld2>x.ld2:c[j].d2>x.d2)){c[j+1]=c[j];j--;}c[j+1]=x;}
  for(let i=0;i<c.length&&i<max;i++){const e=c[i];if(isLabel)e.label!.visible=true;else e.bubble!.visible=true;}
 }
 const labels=new T.Group();labels.name='remote-avatar-labels';root.add(labels);
 const byId=new Map<MemberId,Entry>();const list:Entry[]=[];let duets=0;/* entries playing a duet now */
 let localHex='',clock=0,recheck=0,saverFade=1,shownCount=0,disposed=false;
 // Public island: the mode (every remote is a stranger), re-read when the source's version changes and once a second (rechecks).
 const inRoom=opts.room??opts.fieldScale!==undefined;
 let pub=false,pubVer=NaN,leavingN=0;
 /** The label text: a stranger's generated pair (never the name upsert passed), a party friend's given name. Caches the pair. */
 function labelText(e:Entry):string{if(!e.st){e.pc=e.pa=-1;return e.given;}const idx=publicDraw.nameIdx(e.id);e.pc=idx?idx[0]:-2;e.pa=idx?idx[1]:-2;return strangerLabel(idx,e.style?.hex);}
 /** Rebuilds the label only when the text changes (no allocation while the pair is unchanged). */
 function relabel(e:Entry){
  if(e.st){const idx=publicDraw.nameIdx(e.id);if((idx?idx[0]:-2)===e.pc&&(idx?idx[1]:-2)===e.pa)return;}
  else if(e.pc===-1&&e.name===e.given)return;
  const t=labelText(e);if(t!==e.name){e.name=t;if(e.labelTexture)setLabel(e);}
 }
 function syncPublic(force:boolean){
  const v=publicDraw.version();if(v===pubVer&&!force)return;
  pubVer=v;pub=publicDraw.isPublic();
  for(let i=0;i<list.length;i++){const e=list[i];if(e.leaving)continue;if(e.st!==pub){e.st=pub;if(!pub)e.sel=true;}relabel(e);}
 }
 const selCount=()=>{let n=0;for(let i=0;i<list.length;i++)if(list[i].sel&&!list[i].leaving)n++;return n;};
 function applyHidden(e:Entry,h:boolean){e.hidden=h;if(h){hideEntry(e);if(e.emote>=0){e.emote=-1;e.rig?.setExpression('neutral');}}}

 /** The friend's look on their rig, their Kit Shop kit (relay v1.7) on top of its outfit slots. On a change only. */
 function dress(e:Entry,rig:PlayerRig){const c=wireToLook(e.look);rig.setAppearance(c);rig.setBeanLook(beanLookFor(c),kitOutfit(playerOutfit(c),e.kit));releaseHiddenClassic(rig.root);}
 // Friends' Kit Shop balls (relay v1.7): at most KIT_SKINS baked skins, each shared by every friend wearing that design. A skin is made on
 // the S.Kit that brings a new design (shopBallSkin.ts is imported on demand, so a party without shop balls never loads it); drawing never
 // bakes. Over the cap, the skin drawn least recently is disposed (its friends fall back to the classic ball until their next change).
 type Skin={key:string;mat:T.MeshStandardMaterial|null;used:number};
 const skins:Skin[]=[];let skinGeo:T.SphereGeometry|null=null;
 function dropSkin(s:Skin){const i=skins.indexOf(s);if(i>=0)skins.splice(i,1);for(const m of ballMeshes)if(m.material===s.mat){m.geometry=ballGeo;m.material=ballMat;}s.mat?.map?.dispose();s.mat?.dispose();s.mat=null;}
 function wantSkin(key:string,kit:Kit){
  if(!key||disposed)return;
  for(let i=0;i<skins.length;i++)if(skins[i].key===key){skins[i].used=clock;return;}
  while(skins.length>=KIT_SKINS){let old=skins[0];for(const s of skins)if(s.used<old.used)old=s;dropSkin(old);}
  const s:Skin={key,mat:null,used:clock};skins.push(s);
  const d=kitBall(kit);if(!d)return;
  import('./shopBallSkin').then(mod=>{if(disposed||skins.indexOf(s)<0)return;skinGeo??=new T.SphereGeometry(BALL_RADIUS,CLASSIC_BALL.widthSegments,CLASSIC_BALL.heightSegments);s.mat=mod.friendBallMaterial(d,key);}).catch(()=>{/* offline chunk: the classic ball stays */});
 }
 function skinFor(key:string):T.MeshStandardMaterial|null{
  if(!key)return null;
  for(let i=0;i<skins.length;i++){const s=skins[i];if(s.key===key){if(!s.mat)return null;s.used=clock;return s.mat;}}
  return null;
 }
 function admit(e:Entry){
  if(e.admitted||disposed)return;
  if(e.rig){e.admitted=true;e.dem=false;e.out=1;return;} // still shrinking from a demotion: keep the same rig
  const rig=createPlayer('remote-'+e.id,'home');
  dress(e,rig);rig.root.scale.setScalar(BODY_SCALE);
  rig.setDribbleFeel?.(true);/* their sole stops / drag-backs / touches, derived from the pose stream (lib/town/dribbleStop.ts) */
  e.rig=rig;e.rb=!!beanShapeOf(rig.root);e.admitted=true;
 }
 function ensureLabel(e:Entry){
  if(e.label||disposed)return;
  const mat=new T.SpriteMaterial({map:e.labelTexture,transparent:true,depthWrite:false});
  const label=new T.Sprite(mat);label.scale.set(LABEL_WORLD_W,LABEL_WORLD_W*labelH(e.style)/LABEL_W,1);label.visible=false;label.raycast=()=>{};label.renderOrder=3;/* after the transparent sea (renderOrder .5): the name must never sit behind the waves */label.name='remote-name';labels.add(label);e.label=label;
  const bubble=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false}));bubble.scale.set(.6,.6,1);bubble.visible=false;bubble.raycast=()=>{};bubble.renderOrder=3;bubble.name='remote-emote';labels.add(bubble);e.bubble=bubble;
  const status=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false,depthTest:false,sizeAttenuation:false}));status.scale.set(STATUS_SCREEN,STATUS_SCREEN*STATUS_H/STATUS_W,1);status.renderOrder=4;status.visible=false;status.raycast=()=>{};status.name='remote-status';labels.add(status);e.status=status;
 }
 const capNow=()=>batterySaverOn()?0:opts.maxFor(effectiveTier(),opts.phone);
 const admittedCount=()=>{let n=0;for(let i=0;i<list.length;i++)if(list[i].admitted)n++;return n;};
 // The effective cap (rigCap.ts): drops at once, rises after 10 s at the higher value. A joiner is admitted at once while below it.
 // Battery saver stays outside the gate (its own 1 s fade, nobody admitted); turning it off is a choice, not heat: the gate resets.
 const tierCap=()=>opts.maxFor(effectiveTier(),opts.phone);
 const gate=capGate(capNow());const order:Entry[]=[];let saverWas=batterySaverOn();
 function tryAdmit(e:Entry){if(e.sel&&!e.leaving&&!e.admitted&&!batterySaverOn()&&admittedCount()<stepCapGate(gate,tierCap(),0))admit(e);} // a drop counts at once, a rise waits
 /** Demoted: ring + label only. The body shrinks over DEMOTE_FADE s (update), then the rig is released; reduced motion: at once. */
 function demote(e:Entry,reduced:boolean){if(!e.admitted)return;e.admitted=false;e.dem=true;e.out=1;if(reduced)dropRig(e);}
 function dropRig(e:Entry){e.rig?.dispose();e.rig=null;e.dem=false;e.out=1;e.flOn=false;e.shown=false;e.needResume=true;}
 /** Once a second (never per frame): priority = squared distance from the local player (the camera when none); hidden, indoors or
  *  pose-less friends count as farthest. Demotes beyond the cap (farthest first), admits the nearest waiting within the draw range. */
 function recheckCaps(dt:number,reduced:boolean,poses:Map<MemberId,RemotePose>,local:LocalRing|null|undefined){
  const cap=stepCapGate(gate,tierCap(),dt),ox=local?local.x:camPos.x,oz=local?local.z:camPos.z;
  syncPublic(true);
  for(let i=0;i<list.length;i++){const e=list[i],p=poses.get(e.id);e.pd2=e.leaving||!p||e.hidden||p.zone===Zone.Indoors?Infinity:(p.x-ox)*(p.x-ox)+(p.z-oz)*(p.z-oz);}
  // Public island, a room: only the nearest ROOM_CAP strangers are drawn at all (hysteresis ROOM_HYST_M), and only they may hold a rig.
  if(pub&&inRoom){if(planNearest(list,order,isSel,ROOM_CAP,Infinity,ROOM_HYST_M)>0)for(let i=0;i<list.length;i++){const e=list[i];if(e.plan<0)e.sel=false;else if(e.plan>0)e.sel=true;}
   for(let i=0;i<list.length;i++)if(!list[i].sel)list[i].pd2=Infinity;}
  else for(let i=0;i<list.length;i++)list[i].sel=true;
  // Strangers: the NEAREST hold the rigs (a waiting one swaps in when nearer by RIG_HYST_M); a party keeps its first-come rigs (planRigs).
  if((pub?planNearest(list,order,isAdmitted,cap,DRAW_RANGE*DRAW_RANGE,inRoom?ROOM_HYST_M:RIG_HYST_M):planRigs(list,order,cap,DRAW_RANGE*DRAW_RANGE))===0)return;
  for(let i=0;i<list.length;i++){const e=list[i];if(e.plan<0)demote(e,reduced);else if(e.plan>0)admit(e);}
 }
 function setLabel(e:Entry){
  e.labelTexture?.dispose();e.labelTexture=makeLabelTexture(e.name,e.style);
  if(e.label){const m=e.label.material as T.SpriteMaterial;m.map=e.labelTexture;m.needsUpdate=true;e.label.scale.set(LABEL_WORLD_W,LABEL_WORLD_W*labelH(e.style)/LABEL_W,1);}
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
 /** A duet's frame (before every early-out, so an off-screen one still ends on time): ages it, ends it when it is over or either player moved
  *  more than DUET_DRIFT m from where they started (or left / went busy), else samples both bodies and balls into e.du.out. */
 function stepDuet(e:Entry,dt:number,poses:Map<MemberId,RemotePose>,local:LocalRing|null){
  const d=e.du!,me=poses.get(e.id),pp=d.partner<0?local:poses.get(d.partner);
  d.age+=dt;
  if(d.age>=d.dur||!me||!pp||e.shield||e.hidden||!onFoot(me.mode)){d.on=false;duets--;e.rig?.setExpression('neutral');return;}
  if(!d.started){d.started=true;d.sx=me.x;d.sz=me.z;d.px=pp.x;d.pz=pp.z;}
  if(Math.hypot(me.x-d.sx,me.z-d.sz)>DUET_DRIFT||Math.hypot(pp.x-d.px,pp.z-d.pz)>DUET_DRIFT){d.on=false;duets--;e.rig?.setExpression('neutral');return;}
  const mine=d.role===0?d.a:d.b,theirs=d.role===0?d.b:d.a;mine.x=me.x;mine.y=me.y;mine.z=me.z;theirs.x=pp.x;theirs.y=pp.y;theirs.z=pp.z;
  duetAt(d.emote,d.seed,d.age,d.a,d.b,d.out);
 }
 /** Friends' balls (after the friend pass: e.shield / e.door are this frame's). Nearest BALL_MAX on screen within BALL_DRAW_RANGE. */
 function drawBalls(poses:Map<MemberId,RemotePose>,balls:ReadonlyMap<MemberId,RemoteBall>|null){
  candBall.length=0;/* hidden, over the room cap or leaving: no ball */
  if((balls&&balls.size||duets>0)&&saverFade>0)for(let i=0;i<list.length;i++){
   const e=list[i];if(e.hidden||!e.sel||e.leaving||e.shield||e.door<1){e.bOn=false;continue;}
   const b=balls?balls.get(e.id):undefined,pose=poses.get(e.id),du=e.du&&e.du.on?e.du:null;
   if(du){const q=du.out.balls[du.role];ballSpot.x=q.x;ballSpot.y=q.y;ballSpot.z=q.z;}/* a duet: their own ball from the shared routine (the network copy lags it) */
   else if(!b||!pose||pose.zone===Zone.Indoors||!friendBallSpot(b.state,b,pose,clock,e.slot,ballSpot)){e.bOn=false;continue;}
   if(!du&&b&&b.state===BallState.Feet&&e.rig?.setDribbleFeel&&e.shown&&e.motion.dribbling){e.rig.dribbleContact(feelSpot);ballSpot.x=feelSpot.x;ballSpot.z=feelSpot.z;}/* the ball where their footwork has it */
   const dx=ballSpot.x-camPos.x,dz=ballSpot.z-camPos.z,d2=dx*dx+dz*dz;
   sphere.center.set(ballSpot.x,ballSpot.y,ballSpot.z);sphere.radius=.4;
   if(d2>BALL_DRAW_RANGE*BALL_DRAW_RANGE||!frustum.intersectsSphere(sphere)){e.bOn=false;continue;}
   // roll: turn about the horizontal axis across the motion by distance / radius (a fresh ball does not spin from its old spot)
   if(e.bOn){const mx=ballSpot.x-e.bx,mz=ballSpot.z-e.bz,m=Math.hypot(mx,mz);if(m>1e-4&&m<3){ballAxis.set(mz/m,0,-mx/m);ballSpin.setFromAxisAngle(ballAxis,m/BALL_RADIUS);e.bq.premultiply(ballSpin);}}
   e.bx=ballSpot.x;e.by=ballSpot.y;e.bz=ballSpot.z;e.bOn=true;
   ballD2[candBall.length]=d2;candBall.push(e);
  }
  // nearest first (insertion sort on the parallel distance array; no allocation)
  for(let i=1;i<candBall.length;i++){const x=candBall[i],xd=ballD2[i];let j=i-1;while(j>=0&&ballD2[j]>xd){candBall[j+1]=candBall[j];ballD2[j+1]=ballD2[j];j--;}candBall[j+1]=x;ballD2[j+1]=xd;}
  let n=0;
  for(;n<candBall.length&&n<BALL_MAX;n++){const e=candBall[n],m=ballMeshes[n],sk=e.ballKey?skinFor(e.ballKey):null;/* relay v1.7: their Kit Shop ball */
   if(sk&&skinGeo){m.geometry=skinGeo;m.material=sk;}else if(m.material!==ballMat){m.geometry=ballGeo;m.material=ballMat;}
   m.position.set(e.bx,e.by,e.bz);m.quaternion.copy(e.bq);m.visible=true;}
  for(let i=n;i<BALL_MAX;i++)ballMeshes[i].visible=false;
  ballsShown=n;candBall.length=0;
 }
 function addLocalRing(l:LocalRing,cam:T.Vector3){
  if(l.hex!==localHex){localHex=l.hex;localColour.set(l.hex);}
  const dx=l.x-cam.x,dz=l.z-cam.z;
  ringAdd(l.x,l.y,l.z,0,localColour,ringSizeFor(l.mode??0),1,ringPitchFor(l.mode??0,l.pitch??0),l.yaw??0);/* my own ring never grows with the camera distance: it matches the island's foot ring exactly */
 }
 const tumbles=createFriendTumbles();// ball knock-overs (relay v1.6): one small state per friend, made on their first knock
 let tapCam:T.Camera|null=null;// tapSpots: the camera of the last update (no per-frame work beyond keeping the reference)
 const api:RemoteAvatars={
  root,labels,riders,
  get fading(){return leavingN>0;},get ghosts(){return ghostN;},
  debugPublic(){let st=0,dr=0;const names:string[]=[];for(const e of list){if(e.st)st++;if(e.shown||e.label?.visible)dr++;if(e.label?.visible)names.push(e.name);}return {pub,room:inRoom,strangers:st,drawn:dr,leaving:leavingN,ghosts:ghostN,ghostRings:ghostRings.count,rings:rings.count,labels:names};},
  get shown(){return shownCount;},
  tapSpots(){const spots=[];for(const e of list){if(e.hidden||e.leaving||!e.sel)continue;
   if(e.shown&&e.rig){const r=e.rig.root;spots.push({id:e.id,x:r.position.x,y:r.position.y,z:r.position.z,k:r.scale.y/BODY_SCALE,d:Math.sqrt(e.ld2)});}
   else if(e.label?.visible){const l=e.label,k=(l.material as T.SpriteMaterial).opacity/Math.max(.001,e.ps);spots.push({id:e.id,x:l.position.x,y:l.position.y-LABEL_Y*k,z:l.position.z,k,d:Math.sqrt(e.ld2)});}}
   return {camera:root.visible?tapCam:null,spots};},
  get tumbling(){return tumbles.active;},
  tumble(id,dir,reduced){const e=byId.get(id);if(!e||e.st/* no knock-overs between strangers */||e.hidden||e.shield||e.door<1)return false;return tumbles.start(id,dir,reduced);},
  get ballsShown(){return ballsShown;},
  get jetsShown(){return jetsShown;},
  get localBump(){return bumps.local;},
  get bumps(){return bumps.fired;},
  avoidLabelsNear(x,y,z,on){npcTag.on=on;npcTag.x=x;npcTag.y=y;npcTag.z=z;},
  debugEmotes(){return list.map(e=>({id:e.id,emote:e.emote,age:+e.emoteAge.toFixed(2),x:+(e.rig?.root.position.x??NaN).toFixed(2),z:+(e.rig?.root.position.z??NaN).toFixed(2),yaw:+(e.rig?.root.rotation.y??NaN).toFixed(2)}));},
  duet(id,partner,role,emote,seed){const e=byId.get(id);if(!e||e.hidden||e.shield||!e.sel||e.st&&inRoom/* no stranger duets indoors */)return false;
   const d=e.du??(e.du={on:false,was:false,partner:-1,role:0,emote:0,seed:0,age:0,dur:0,sx:0,sz:0,px:0,pz:0,started:false,out:createDuetOut(),a:{x:0,y:0,z:0},b:{x:0,y:0,z:0}});
   d.on=true;d.started=false;d.partner=partner;d.role=role;d.emote=emote;d.seed=seed;d.age=0;d.dur=duetSeconds(emote,seed);e.emote=-1;e.hf=-1;e.mv=-1;e.rig?.setExpression('happy');duets++;return true;},
  endDuet(id){const e=byId.get(id);if(e?.du?.on){e.du.on=false;duets--;e.rig?.setExpression('neutral');}},
  get rigs(){let n=0;for(let i=0;i<list.length;i++)if(list[i].rig)n++;return n;},
  upsert(id,look,name,style){
   if(disposed)return;
   let e=byId.get(id);const key=look.join(',');const st=style??null;
   if(!e){
    e={id,name,lookKey:key,look:look.slice(),style:st,kit:null,kitKey:'',ballKey:'',colour:new T.Color(st?st.hex:'#ffffff'),rig:null,label:null,labelTexture:null,bubble:null,admitted:false,shown:false,pd2:0,plan:0,dem:false,out:1,
     motion:{facing:0},swim:{w:1,kind:'tread',phase:0,effort:0,fast:0,entry:'feet',shake:0},emote:-1,emoteAge:0,iw:createIdleWave(id*2654435761),du:null,lastMode:0,emMode:0,flOn:false,wet:true,jet:true,lift:0,mv:-1,mvV:0,mvDur:0,spd:0,rp:0,hf:-1,ball:null,hidden:false,muted:false,acc:0,slot:(id*.618034)%1,needResume:true,ld2:0,d2:0,
shield:false,field:0,door:1,shake:0,ripple:1,hx:0,hy:1,hz:0,status:null,statusKey:'',prWas:'',actWas:-1,lineWas:'',bx:0,by:0,bz:0,bOn:false,bq:new T.Quaternion(),bump:createBumpReact(),rb:false,ra:0,ca:0,
     st:false,given:name,uh:false,ps:1,leaving:false,lv:1,lp:{x:0,y:0,z:0,yaw:0,speed:0,mode:Mode.Idle,zone:Zone.Main,fade:0,flags:0,activity:0},sel:true,em:new Float64Array(STRANGER_EMOTES_PER_MIN).fill(-Infinity),emI:0,pc:-1,pa:-1};
    syncPublic(false);e.st=pub;if(pub&&inRoom)e.sel=selCount()<ROOM_CAP;e.name=labelText(e);/* a stranger: the generated pair, never `name` */
    byId.set(id,e);list.push(e);e.labelTexture=makeLabelTexture(e.name,e.style);ensureLabel(e);tryAdmit(e);return;
   }
   if(e.given!==name||(st?.hex!==e.style?.hex)){e.given=name;e.style=st;e.colour.set(st?st.hex:'#ffffff');e.name=labelText(e);if(e.labelTexture)setLabel(e);}
   if(e.lookKey!==key){e.lookKey=key;e.look=look.slice();if(e.rig){dress(e,e.rig);e.rb=!!beanShapeOf(e.rig.root);}}
  },
  get kitSkins(){return skins.length;},
  setKit(id,kit){
   const e=byId.get(id);if(!e||disposed)return;
   const key=kitKey(kit);if(key===e.kitKey)return;
   e.kit=kit?kit.slice():null;e.kitKey=key;e.ballKey=kitBallKey(kit);
   if(e.rig){dress(e,e.rig);e.rb=!!beanShapeOf(e.rig.root);}
   if(e.ballKey&&e.kit)wantSkin(e.ballKey,e.kit);
  },
  remove(id){
   const e=byId.get(id);if(!e)return;
   if(e.du?.on){e.du.on=false;duets--;}
   byId.delete(id);
   // A stranger (left, out of sight, Just me): fades out at their last spot over SAVER_FADE_SECONDS, then released in update.
   if(e.st&&!disposed){e.leaving=true;e.lv=1;e.admitted=false;if(e.emote>=0){e.emote=-1;e.hf=-1;e.mv=-1;}leavingN++;return;}
   const i=list.indexOf(e);if(i>=0)list.splice(i,1);release(e);
  },
  setHidden(ids){for(let i=0;i<list.length;i++){const e=list[i];e.uh=ids.has(e.id);const h=e.uh||e.st&&publicDraw.hidden(e.id);if(h!==e.hidden)applyHidden(e,h);}},
  setMuted(ids){for(let i=0;i<list.length;i++){const e=list[i],m=ids.has(e.id);e.muted=m;if(m&&e.emote>=0){e.emote=-1;e.rig?.setExpression('neutral');}}},
  bumpField(id,nx,ny,nz){const e=byId.get(id);if(!e||!e.shield)return;e.shake=1;e.ripple=0;e.hx=nx;e.hy=ny;e.hz=nz;},
  emote(id,em){const e=byId.get(id);if(!e||e.muted||e.hidden||e.shield||!e.sel||e.st&&publicDraw.hidden(id))return false;
   if(e.st){if(clock-e.em[e.emI]<60)return false;e.em[e.emI]=clock;e.emI=(e.emI+1)%STRANGER_EMOTES_PER_MIN;}/* at most 6 a minute per stranger reach the scene (the client drops extras first) */
   /* inside the force field: no emotes from them */e.emote=em;e.emoteAge=0;e.emMode=e.lastMode;const ms=moveForWire(em,e.lastMode,e.spd);e.mv=ms?ms.emote:-1;e.mvDur=ms?ms.seconds:0;if(ms)e.mvV=pickMoveVariant(ms.emote,MOVE_ROLE.Friend);/* walking / running: the moving version over their walk cycle */const fl=flourishForWire(em,e.lastMode);e.hf=!ms&&!fl?highFivePlan(em,false,Math.random,hfBag):-1;if(!ms&&!fl&&(em===Emote.PassBall||em===Emote.JuggleWithMe)){/* flying / swimming / riding: the ball-free version (their flourish), no ball *//* the moving Call for it / Juggle are mimes: no ball */e.ball??=createPassBallOut();pickBallRoutine(e.ball,em===Emote.PassBall?'pass':'solo');}e.rig?.setExpression('happy');return true;},
  update(dt,poses,camera,reduced,local,balls){
   if(disposed)return;
   ringN=0;ghostRingN=0;ghostRingA=1;candL.length=0;candB.length=0;syncPublic(false);
   if(list.length===0){
    // The batch's instanced bodies hold last frame's count until begin()/end() clear them: the last friend leaving (timeout, Leave)
    // must empty it here too, or their body stays drawn forever (ghost, Oct 23 2026) while the field, ring and label are gone.
    batch.begin();batch.end();ghost.begin();ghostN=0;ghost.end();prepGhost();rides.begin();rides.end();riders.n=0;
    shownCount=0;fields.begin();fields.end(dt,reduced);jets.begin();jets.end(dt,reduced);jetsShown=0;drawBalls(poses,null);bumps.detect(dt,list,poses,null,reduced,true);bumps.update(dt);
    if(local&&!batterySaverOn()){camera.updateMatrixWorld();camPos.setFromMatrixPosition(camera.matrixWorld);addLocalRing(local,camPos);}
    ringsEnd();return;
   }
   clock+=dt;
   const saver=batterySaverOn();
   if(saver!==saverWas){saverWas=saver;if(!saver){gate.eff=tierCap();gate.hold=0;}}
   saverFade=saver?Math.max(0,saverFade-dt/SAVER_FADE_SECONDS):Math.min(1,saverFade+dt/SAVER_FADE_SECONDS);
   tapCam=camera;camera.updateMatrixWorld();projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);
   camPos.setFromMatrixPosition(camera.matrixWorld);
   // The cap re-check (once a second; Battery saver keeps its own 1 s fade-out and admits nobody, as before).
   recheck+=dt;
   if(recheck>=ADMIT_RECHECK){const step=recheck;recheck=0;if(!saver)recheckCaps(step,reduced,poses,local);}
   tumbles.step(dt);bumps.detect(dt,list,poses,local,reduced,saver||pub);/* no bumps between strangers *//* friend bumps: last frame's shown states, before the pass that applies them */
   batch.begin();ghost.begin();ghostN=0;ghostA=1;fields.begin();let shown=0;rides.begin();riders.n=0;
   // The personal-space focus: my spot, or in a room without one (at a machine) where the camera's centre ray meets the floor.
   let focusOn=false,fx=0,fz=0;
   if(pub){if(local){focusOn=true;fx=local.x;fz=local.z;}else if(inRoom){camera.getWorldDirection(camDir);if(camDir.y<-.05){const t=-camPos.y/camDir.y;fx=camPos.x+camDir.x*t;fz=camPos.z+camDir.z*t;focusOn=true;}}}
   for(let i=0;i<list.length;i++){
    const e=list[i];
    // A demoted friend's body shrinks away (before every early-out, so an off-screen one still finishes), then the rig is released.
    if(e.dem){e.out=reduced?0:Math.max(0,e.out-dt/DEMOTE_FADE);if(e.out<=0)dropRig(e);}
    const rig=e.rig;
    // Emote age advances before every early-out (off screen, indoors, far): a hidden friend's emote must not freeze and pop back later.
    let fs0=e.emote>=0?flourishForWire(e.emote,e.emMode):undefined;
    // Like yours: a moving emote eases out over MOVE_STOP_FADE once they stop (their streamed speed) and ends off their feet; a flying / swimming /
    // ride flourish ends when they land, leave the water or get off (the standing emote never restarts: it only ends).
    if(e.emote>=0){e.emoteAge+=dt;if(e.mv>=0)e.mvDur=friendMoveEnd(e.emoteAge,e.mvDur,e.spd,emoteCtxOfMode(e.lastMode)===0);
     if((fs0!==undefined&&friendFlourishLapsed(e.emMode,e.lastMode))||e.emoteAge>=(e.mv>=0?e.mvDur:fs0?fs0.seconds:e.hf>=0?HIGH_FIVES[e.hf].duration:emoteSeconds(e.emote))){e.emote=-1;e.hf=-1;e.mv=-1;fs0=undefined;rig?.setExpression('neutral');}}
    if(e.du&&e.du.on)stepDuet(e,dt,poses,local??null);
    if(!e.label||!e.bubble)continue;
    if(e.leaving){e.lv=reduced?0:Math.max(0,e.lv-dt/SAVER_FADE_SECONDS);if(e.lv<=0){hideEntry(e);continue;}}
    if(e.st){const h=e.uh||publicDraw.hidden(e.id);if(h!==e.hidden)applyHidden(e,h);}
    if(e.hidden||!e.sel){hideEntry(e);continue;} // Hide (and a stranger over the room cap): no avatar, ring, label or emote bubble
    const pose=e.leaving?e.lp:poses.get(e.id);
    if(!pose||saverFade<=0){hideEntry(e);continue;}
    if(e.st&&!e.leaving){const q=e.lp;q.x=pose.x;q.y=pose.y;q.z=pose.z;q.yaw=pose.yaw;q.speed=0;q.mode=pose.mode;q.zone=pose.zone;q.fade=pose.fade;q.flags=pose.flags??0;q.activity=pose.activity??0;}
    // Presence: indoors = fade out at the door; busy / away = inside the green force field, still, with a status line.
    const pr=presenceOf(pose.mode,pose.zone,pose.flags??0),shield=shielded(pr);
    if(pose.zone===Zone.Indoors){e.door=reduced?0:Math.max(0,e.door-dt/DOOR_FADE);if(e.door<=0){e.field=0;hideEntry(e);continue;}}else e.door=1;
    if(shield!==e.shield){e.shield=shield;if(shield&&e.emote>=0){e.emote=-1;e.hf=-1;}rig?.setExpression(shield&&pr==='busy'?'focused':'neutral');}
    const act=pose.activity??0;if(pr!==e.prWas||act!==e.actWas){e.prWas=pr;e.actWas=act;e.lineWas=pr==='active'?'':presenceIconAt(pr,act,pose.x,pose.z)+' '+presenceTextAt(pr,act,pose.x,pose.z);}
    const line=e.lineWas;
    if(line!==e.statusKey&&e.status){e.statusKey=line;if(line){const m=e.status.material as T.SpriteMaterial;m.map=statusTexture(line);m.needsUpdate=true;}}
    e.field=reduced?(shield?1:0):shield?Math.min(1,e.field+dt/FIELD_FADE):Math.max(0,e.field-dt/FIELD_FADE);
    e.shake=Math.max(0,e.shake-dt/SHAKE_SECONDS);e.ripple=Math.min(1,e.ripple+dt/RIPPLE_SECONDS);
    const dx=pose.x-camPos.x,dz=pose.z-camPos.z,d2=dx*dx+dz*dz;
    if(d2>DRAW_RANGE*DRAW_RANGE){hideEntry(e);continue;}
    sphere.center.set(pose.x,pose.y+1,pose.z);sphere.radius=2;
    if(!frustum.intersectsSphere(sphere)){hideEntry(e);continue;}
    e.d2=d2;e.ld2=local?(pose.x-local.x)*(pose.x-local.x)+(pose.z-local.z)*(pose.z-local.z):d2;
    const k=Math.max(.001,pose.fade*saverFade*e.door*(e.st?e.lv*farFade(e.ld2):1));
    if(e.st){const near=local?e.ld2<PS2:focusOn&&(pose.x-fx)*(pose.x-fx)+(pose.z-fz)*(pose.z-fz)<PS2;
     e.ps=stepPersonal(e.ps,near||inRoom&&focusOn&&inSightLine(camPos.x,camPos.z,fx,fz,pose.x,pose.z)?PERSONAL_ALPHA:1,dt,reduced);}else e.ps=1;
    if(pose.mode===Mode.Jetpack&&e.jet&&e.door>=1&&d2<JET_RANGE*JET_RANGE&&candJet.length<MAX_REMOTE&&!e.leaving)candJet.push(e);
    // The dome: grows in as they go busy, pops (swells and fades) as they come back; the ball's shake is skipped under reduced motion.
    if(e.field>.002)fields.add(pose.x,pose.y,pose.z,e.field*k,FS*(shield?.86+.14*e.field:1+(1-e.field)*.28),reduced?0:e.shake*e.shake,reduced?1:e.ripple,e.hx,e.hy,e.hz,e.slot);
    if(!rig||shown>=BATCH_CAPACITY){ // beyond the rig cap (or a full batch): colour ring + label (+ emote bubble) only, no body
     e.shown=false;e.needResume=true;
     if(d2<=RING_ONLY_RANGE*RING_ONLY_RANGE)ringAdd(pose.x,pose.y,pose.z,Math.sqrt(d2),e.colour,ringSizeFor(pose.mode),k,friendRingPitch(e,pose,dt),pose.yaw,e.ps);
     placeLabel(e,pose,k,reduced);continue;
    }
    // Far friends solve their pose at 10 Hz (> 20 m) / 5 Hz (> 60 m); the root still follows every frame.
    const root3=rig.root,motion=e.motion;unBump(root3,e.bump);
    root3.position.set(pose.x,pose.y+e.lift,pose.z);root3.scale.setScalar(BODY_SCALE*k*e.out);
    e.acc+=dt;
    // Live feel: the tier goes by the distance from the LOCAL player (ld2), not the camera: on the island the camera sits ~35 m back, so a
    // friend right next to you was posed at 10 Hz (legs stepping in jerks while the body glided). Near friends now pose every frame.
    const pd=e.ld2,period=e.hf>=0&&!reduced?0:pd>MID_POSE*MID_POSE?1/FARTHER_HZ:pd>FAR_POSE*FAR_POSE?1/FAR_HZ:0;
    const moving=!shield&&pose.speed>.3; // inside the field they stand still (the speed byte carries the activity)
    e.spd=shield?0:pose.speed;
    if(period===0||e.acc>=period+e.slot*period||e.needResume){
     const step=Math.min(e.acc,.1),idleStep=Math.min(e.acc,.6)/* a far friend updates less often: the idle gestures keep real time */;e.acc=0;
     const mode=pose.mode;e.lastMode=mode;
     {const sw=mode===Mode.Swim||mode===Mode.Dive||shield&&pose.zone===Zone.Sea,jp=mode===Mode.Jetpack;/* one lookup per pose solve, only in those modes */
      const land=sw&&!!opts.landAt&&opts.landAt(pose.x,pose.z),g=(jp||land)&&opts.groundAt?opts.groundAt(pose.x,pose.z):NaN,dr=drawnAs(mode,pose.zone,shield,land,pose.y-g);
      e.wet=dr.wet;e.jet=dr.jet;e.lift=land&&g>pose.y?g-pose.y:0;}
     motion.facing=pose.yaw;motion.resumePose=e.needResume;motion.travelMode=shield&&mode!==Mode.Jetpack||mode===Mode.Jetpack&&!e.jet?undefined:travelFor(mode);/* an away friend keeps the jetpack backpack (and the blue downwash while hovering); rides are not drawn inside the field, so they stand */
     motion.parachute=!shield&&(mode===Mode.Parachute||mode===Mode.Zipline);
     motion.dribbling=!shield&&onFoot(mode)&&balls?.get(e.id)?.state===BallState.Feet&&pose.zone!==Zone.Indoors;/* only with a ball at their feet */
     motion.called=0;motion.jump=undefined;motion.skill=e.hf>=0&&!reduced&&highFiveSkill(HF_SKILL,e.hf,0,e.emoteAge)?HF_SKILL as SkillMotion:undefined;
     if(e.wet){
      const s=e.swim;s.kind=moving?'crawl':'tread';s.effort=moving?Math.min(1,pose.speed/3):0;s.phase=reduced?0:s.phase+step*(moving?5:1.5);s.under=mode===Mode.Dive?.7:0;motion.swim=s;
     }else motion.swim=undefined;
     // Emotes: JuggleWithMe/Wave/HighFive raise the "called" arm; Cheer/WellPlayed celebrate. Reduced motion keeps only the bubble.
     if(e.emote>=0&&!reduced){
      const em=e.emote,age=e.emoteAge;
      if(e.hf<0&&!fs0&&e.mv<0){const b=emoteBody(em,age,emoteSeconds(em));motion.jump=b.jump;motion.called=b.called;}
      if(e.hf<0&&!fs0&&e.mv<0&&e.ball&&(em===Emote.PassBall||em===Emote.JuggleWithMe))friendBallMotion(e.ball,em===Emote.JuggleWithMe,age,pose.yaw,motion);/* the ball routines' body (lib/town/emoteBallPlay.ts) */
     }
     if(e.ball&&(reduced||e.mv>=0||!(e.emote===Emote.PassBall||e.emote===Emote.JuggleWithMe))&&motion.turnSmoothing!==undefined)clearBallMotion(motion);
     {const du=e.du;if(du&&du.on){const pa=du.role===0?du.b:du.a;actorMotion(du.out.actors[du.role],Math.atan2(pa.x-pose.x,pa.z-pose.z),motion);motion.dribbling=false;du.was=true;}/* a duet: the shared routine's body, facing the partner */
      else if(du&&du.was){du.was=false;clearBallMotion(motion);}}
     rig.update(pose.x,pose.z,step,clock,reduced,motion);
     if(e.emote>=0&&e.mv>=0&&!reduced)applyMoveEmote(rig.root,e.mv,e.mvV,e.emoteAge,moveWeight(e.emoteAge,e.mvDur));/* a moving emote: layered on their own walk / run cycle */
     else if(e.emote>=0&&!reduced&&e.hf<0&&!fs0&&e.emote!==Emote.JuggleWithMe&&e.emote!==Emote.PassBall)applyEmoteArms(rig.root,e.emote,e.emoteAge,emoteSeconds(e.emote));
     else if(fs0&&!reduced&&fs0.arm>=0&&e.emoteAge>=fs0.armFrom)applyRideEmote(rig.root,fs0.arm,e.emoteAge,Math.max(0,Math.min(1,(e.emoteAge-fs0.armFrom)/.2,(fs0.seconds-e.emoteAge)/.2)));
     {const iw=e.iw;if(mode===Mode.Jetpack||iw.kind>=0){if(stepIdleWave(iw,idleStep,mode===Mode.Jetpack&&e.jet&&!shield&&pose.speed<IDLE_SPEED&&e.emote<0&&!(e.du&&e.du.on),reduced)>0)applyIdleGesture(rig.root,iw.kind,iw.age,iw.w);}}/* a hovering friend waves too (lib/town/jetpackIdleWave.ts) */
     root3.position.set(pose.x,pose.y+e.lift,pose.z);
     // A friend's high five: an "air five" toward the camera side (their own random variation, shown on every screen alike).
     if(e.hf>=0&&!reduced)applyHighFive(rig.root,e.hf,0,e.emoteAge,1,FACE_CAMERA,BODY_SCALE*k*e.out);
     e.needResume=false;
    }
    // A flying / swimming friend's emote (their mode picks it from the same wire value): roll / pitch / lift on the rig root, every frame, gone with the emote.
    if(fs0&&!reduced){flourishAt(fs0.emote,e.emoteAge,fs0.seconds,FL,1);root3.rotation.order='YXZ';root3.rotation.x=FL.pitch;root3.rotation.z=FL.roll;root3.position.y+=FL.lift*k;e.flOn=true;}
    else if(e.flOn){root3.rotation.x=0;root3.rotation.z=0;e.flOn=false;}
    if(e.bump.on&&applyBump(root3,e.bump,reduced,BODY_SCALE*k*e.out))e.flOn=true;/* a friend bump: cosmetic, gone with the reaction */
    if(tumbles.active){const tb=tumbles.get(e.id);if(tb&&!shield&&applyTumbleRoot(root3,tb,pose.y))e.flOn=true;}/* a ball knock-over (ballTumble.ts): cosmetic, gone with the tumble */
    if(e.ps<.985&&ghostN<GHOST_CAPACITY){ghost.draw(root3);ghostN++;if(e.ps<ghostA)ghostA=e.ps;}else batch.draw(root3);e.shown=true;shown++;
    // Their ride under them (none inside the force field: the pose drops the ride there too); it follows the root, so flourishes and bump wobbles / skids carry it.
    const rk=shield?-1:rideKindFor(pose.mode);
    if(rk>=0){/* a ride trick (their flourish): extra wheel spin, the vehicle alone turning (tail-whip) and back on the deck under a lifted rider */
     const tr=fs0!==undefined&&!reduced,sdt=Math.min(dt,.1);e.ra+=sdt*(pose.speed+(tr?FL.wheel??0:0));if(e.ra>1e5)e.ra=0;
     if(rk===1&&e.rb&&!reduced){e.ca+=sdt*bikeCrankRate(pose.speed);if(e.ca>1e4)e.ca-=Math.PI*2*1000;}
     rides.add(rk,e.rb,root3,RIDE_SCALE*BODY_SCALE*k*e.out,e.ra,e.ca,tr?FL.vyaw??0:0,tr?-(FL.rlift??0)*k:0);if(riders.n<BATCH_CAPACITY){const j=riders.n++;riders.x[j]=root3.position.x;riders.y[j]=root3.position.y;riders.z[j]=root3.position.z;riders.yaw[j]=root3.rotation.y;riders.speed[j]=pose.speed;}}
    // Colour ring at the feet; the emote pulse is skipped under reduced motion.
    ringAdd(pose.x,pose.y,pose.z,Math.sqrt(d2),e.colour,(e.emote>=0&&!reduced?1+.18*Math.sin(e.emoteAge*14):1)*ringSizeFor(pose.mode),k,friendRingPitch(e,pose,dt),pose.yaw,e.ps);
    placeLabel(e,pose,k,reduced);
   }
   if(leavingN>0)for(let i=list.length-1;i>=0;i--){const e=list[i];if(e.leaving&&e.lv<=0){list.splice(i,1);release(e);leavingN--;}}
   pickVisible(candL,LABEL_MAX);pickVisible(candB,BUBBLE_MAX);
   // Flying friends' plumes: the nearest REMOTE_JET_MAX (by distance from me) into the one shared pool.
   jets.begin();jetsShown=0;
   if(candJet.length&&saverFade>0){
    for(let i=1;i<candJet.length;i++){const x=candJet[i];let j=i-1;while(j>=0&&candJet[j].ld2>x.ld2){candJet[j+1]=candJet[j];j--;}candJet[j+1]=x;}
    for(let i=0;i<candJet.length&&i<3;i++){const e=candJet[i],p=poses.get(e.id)!;jets.emit(e.id,p.x,p.y,p.z,p.yaw,opts.groundAt?opts.groundAt(p.x,p.z):p.y-3,p.speed>14);jetsShown++;}
   }
   jets.end(dt,reduced);candJet.length=0;
   drawBalls(poses,balls??null);
   if(local&&saverFade>0)addLocalRing(local,camPos);
   ringsEnd();fields.end(dt,reduced);bumps.update(dt);rides.end();
   batch.end();ghost.end();prepGhost();shownCount=shown;
   // The batch makes its meshes lazily and defaults them to casting: friends never cast (no shadow registration anywhere).
   for(let i=0;i<drawn.children.length;i++)drawn.children[i].castShadow=false;
   for(let i=0;i<ghostDrawn.children.length;i++)ghostDrawn.children[i].castShadow=false;
  },
  dispose(){
   if(disposed)return;disposed=true;
   for(let i=0;i<list.length;i++)release(list[i]);
   list.length=0;byId.clear();batch.dispose();ghost.dispose();ghostRings.dispose();ghostRingMat.dispose();rings.dispose();ringGeo.dispose();ringMat.dispose();fields.dispose();jets.dispose();bumps.dispose();rides.dispose();tumbles.clear();
   for(const m of ballMeshes)m.removeFromParent();ballGeo.dispose();ballMat.dispose();
   while(skins.length)dropSkin(skins[0]);skinGeo?.dispose();skinGeo=null;
   for(const t of statusTextures.values())t.dispose();statusTextures.clear();
   for(const t of iconTextures.values())t.dispose();iconTextures.clear();
   root.removeFromParent();
  },
 };
 devRegisterLayer(api);
 return api;
}
