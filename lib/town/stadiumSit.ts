// West Stadium, phase 2 (Nov 12 2026, docs/stadium/PLAN.md): sitting in the stands, the stadium's sponsor load and its gate count.
// Town drives it; the seats, the state machine and the stand view are pure data (stadiumSeats.ts).
//  - "Sit" (the island's action-prompt style, through the HUD arbiter) on any seat row: the player snaps to the nearest free seat,
//    facing the pitch, in the bench pose (npcSeatPose.ts), and the camera eases to a stand view of the pitch. "Stand up", the stick
//    or the keys, a ride, the jetpack or any teleport get up. Reduced motion: no ease (both ways snap).
//  - Sponsors: ensureStadiumSponsors once the player is within SPONSOR_LOAD_RADIUS (one distance test per HUD tick); the visit is
//    counted when the player walks in through the gate.
// Heat: idle = one distance test per frame off the stadium; on it, nearestSeat() (a few dozen comparisons) per frame. No rAF,
// no timers, nothing allocated per frame; the pose is made once.
import * as T from 'three';
import {npcSeatPose} from '../graphics/npcSeatPose';
import type {TrickPose} from '../graphics/trickPose';
import {STADIUM} from './westParkLayout';
import {createStadiumCrowd,CROWD_RADIUS} from './stadiumCrowd';
import {createSitMachine,inGate,nearestSeat,seatView,followLook,portraitLook,PORTRAIT_FOV,sitDown,standUp,stepSit,stadiumSponsorLayout,GATE_ARCH_X,FOLLOW_RATE,type Seat} from './stadiumSeats';
import {createStadiumFeed} from './stadiumFeed';
import {createStadiumScreen,screenMinute,stadiumBarText,type ScreenScore} from './stadiumScreen';
import {remoteSeatsTaken,remoteSeatSpots} from './stadiumSeatShare';
import {BIB_COLOURS} from './beanLooks';
import {ensureStadiumSponsors,SPONSOR_LOAD_RADIUS} from '../stadium/sponsors/index';
import {countStadiumVisit} from '../analytics/sponsorEvents';
import {STADIUM_NAME} from '../stadium/dripfc';

export const SIT_KEY='stadium-seat';
/** HUD tick (ms) in the bowl (Town's is 150 elsewhere): the Sit offer enters the focus arbiter on that tick, so it shows within ~one tick of stopping. */
export const HOT_HUD_MS=50;
/** The Sit button hangs this far (px) above the head of the player's screen position; the head is PLAYER_HEAD m above their feet. */
const PROMPT_GAP=14,PLAYER_HEAD=2.1;
/** The camera's far plane while seated (m): the whole bowl (the far stand's back is ~115 m away, the end stand from the other end ~150 m). */
export const SEAT_FAR=175;
/** The big screen's score shows within this distance of the stadium centre (m); beyond it the plane hides (heat). */
export const SCREEN_RADIUS=190;
/** What Town hands over each frame while the stadium's match is awake (fieldRuntime's entry): its sim and its ball. */
/** humans / puppet (phase 3b): the entry's human slots (me and any friends) and a friend's phone running it: neither = an
 *  all-AI exhibition. */
export type StadiumMatch={sim:{score:{gold:number;blue:number};clock:number};ball:{position:{x:number;z:number}};humans?:{size:number};puppet?:unknown};
/** The stadium crowd loop (phase 3b): full within AMBIENCE_FULL m of the pitch's edge, silent past AMBIENCE_RADIUS. */
export const AMBIENCE_RADIUS=60,AMBIENCE_FULL=12;
export function ambienceLevel(x:number,z:number){const d=Math.hypot(Math.max(0,Math.abs(x-STADIUM.x)-STADIUM.pitchW/2),Math.max(0,Math.abs(z-STADIUM.z)-STADIUM.pitchL/2));
 return d>=AMBIENCE_RADIUS?0:Math.min(1,(AMBIENCE_RADIUS-d)/(AMBIENCE_RADIUS-AMBIENCE_FULL));}
const MOVE_KEYS=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'] as const;

/** phone: a coarse-pointer device (fewer fans); goal: a goal at the stadium while the match is near (Town plays the cheer). */
export function createStadiumSit(ports:{parent:T.Object3D;wake:()=>void;phone?:boolean;goal?:()=>void}){
 const m=createSitMachine(),pose:TrickPose=npcSeatPose('bench');pose.w=0;
 let farSaved=0,near:Seat|null=null,view:ReturnType<typeof seatView>|null=null,sponsorAsked=false,wasOutside=true,promptSeated:boolean|null=null,promptLive=false;
 let dc=Infinity,live=false,sponsors:{setScreenSponsor:(on:boolean)=>void}|null=null,screenSponsor=true,looking=false;
 const screen=createStadiumScreen(ports.parent,{home:BIB_COLOURS.stadium.home,away:BIB_COLOURS.stadium.away}),score:ScreenScore={home:'Red',away:'Blue',gold:0,blue:0,minute:0};
 const ball={x:0,z:0},look={x:0,y:0,z:0},want={x:0,y:0,z:0},me={x:0,z:0,h:0};let fovSaved=0;
 const crowd=createStadiumCrowd(ports.parent,!!ports.phone),feed=createStadiumFeed(ports.parent,{phone:!!ports.phone});let goals=-1,lastMs=-1,exhibition=true,barShown='',ambience=0;
 const cam=new T.PerspectiveCamera(),/* a camera: lookAt aims its -Z (an Object3D's would aim +Z, away from the pitch) */ camQ=new T.Quaternion(),camP=new T.Vector3(),v=new T.Vector3();
 const held=()=>m.phase==='sitting'||m.phase==='seated';
 return {
  get seated(){return held();},get phase(){return m.phase;},get seat(){return m.seat;},
  /** The seated pose (blended in and out with the camera), or undefined when standing. */
  trick():TrickPose|undefined{if(m.blend<=0)return undefined;pose.w=m.blend*m.blend*(3-2*m.blend);return pose;},
  get yaw(){return m.seat?.yaw??0;},
  /** In or beside the bowl on a raised surface: Town runs its HUD tick at HOT_HUD_MS here so the Sit prompt appears fast (one compare a frame). */
  get hot(){return dc<75&&me.h>.2;},
  /** Each frame (next to the ladder's prompt): what the prompt offers (null = nothing), the sponsor load and the gate count. canSit: on foot, on the ground,
   *  not falling, no menu. */
  want(x:number,z:number,height:number,canSit:boolean):{key:string;distance:number}|null{
   dc=Math.hypot(x-STADIUM.x,z-STADIUM.z);me.x=x;me.z=z;me.h=height;
   if(!sponsorAsked&&dc<SPONSOR_LOAD_RADIUS){sponsorAsked=true;
    ensureStadiumSponsors(ports.parent,stadiumSponsorLayout()).then(s=>{s.group.position.set(STADIUM.x,-.045,STADIUM.z);sponsors=s;screenSponsor=!live;s.setScreenSponsor(screenSponsor);ports.wake();}).catch(()=>{sponsorAsked=false;});}
   const gate=inGate(x,z);if(gate&&wasOutside)countStadiumVisit();if(gate)wasOutside=false;else if(x>GATE_ARCH_X||dc>140)wasOutside=true;
   if(held())return {key:SIT_KEY,distance:0};
   near=canSit&&dc<110&&height>.2?nearestSeat(x,z,height,remoteSeatsTaken()):null;// phase 5: never a seat another player sits in
   return near?{key:SIT_KEY,distance:Math.hypot(near.x-x,near.z-z)}:null;
  },
  /** The prompt pressed: sit on the offered seat (returns it: Town moves the player there) or stand up (returns null). */
  press(reduced:boolean):Seat|null{
   if(held()){standUp(m,reduced);ports.wake();return null;}
   if(!near||!sitDown(m,near,reduced))return null;view=null;looking=false;ports.wake();return near;
  },
  /** Movement tick: while seated, holds the player (returns true); the stick, the keys, a ride or a move away get up. */
  holdPlayer(dt:number,input:{x:number;z:number;kick:boolean;juggle:boolean;shotPower?:number;charging?:boolean},keys:ReadonlySet<string>,o:{walk:boolean;x:number;z:number;reduced:boolean}){
   if(m.phase==='standing')return false;
   let push=Math.hypot(input.x,input.z);for(const k of MOVE_KEYS)if(keys.has(k))push=1;
   const away=!!m.seat&&Math.hypot(o.x-m.seat.x,o.z-m.seat.z)>.6;
   const hold=stepSit(m,dt,{push,walk:o.walk,away,reduced:o.reduced});
   if((m.phase as string)!=='standing')ports.wake();// the ease in / out needs frames
   if(hold){input.kick=input.juggle=false;input.shotPower=0;input.charging=false;}
   return hold;
  },
  /** Each frame (Town, next to want()): the stadium's match while it is awake (null = no match on / asleep). The big screen
   *  shows its score and minute near the stadium, the sponsor card otherwise; the stand view follows its ball. */
  match(e:StadiumMatch|null,nowMs:number,reduced=false){
   live=!!e;if(e){ball.x=e.ball.position.x;ball.z=e.ball.position.z;score.gold=e.sim.score.gold;score.blue=e.sim.score.blue;score.minute=screenMinute(e.sim.clock);
    exhibition=!(e.humans?.size)&&!e.puppet;score.exhibition=exhibition;
    const total=score.gold+score.blue;if(goals>=0&&total>goals&&dc<CROWD_RADIUS){crowd.cheer();ports.goal?.();}goals=total;}else goals=-1;
   // The crowd (stadiumCrowd.ts): near the stadium only; the fans round me clear while I am up in the stands.
   const dt=lastMs<0?0:Math.min(.1,Math.max(0,(nowMs-lastMs)/1000));lastMs=nowMs;
   crowd.update(dc,me.x,me.z,me.h>.2&&dc<110,dt,reduced,remoteSeatSpots());
   ambience=live?ambienceLevel(me.x,me.z):0;
   if(sponsors&&screenSponsor===live){screenSponsor=!live;sponsors.setScreenSponsor(screenSponsor);}
   screen.update(live&&dc<SCREEN_RADIUS,live?score:null,nowMs);
  },
  /** Right before the main render (Town): the big screen's back face, the broadcast feed while a match is live and the back face is
   *  in view near the stadium, the static card otherwise (stadiumFeed.ts). tier = the heat tier. */
  feed(renderer:T.WebGLRenderer,scene:T.Scene,camera:T.Camera,nowMs:number,tier:number){return feed.update(renderer,scene,camera,nowMs,dc,live?ball:null,tier,[screen.mesh,crowd.mesh]);},
  get broadcast(){return feed;},
  /** Teardown: the crowd, both screen faces and the feed's render target. */
  dispose(){crowd.dispose();screen.dispose();feed.dispose();},
  /** A match is on at the stadium (the prompt says "Sit and watch"). */
  get live(){return live;},
  /** No human in the stadium match (an all-AI exhibition). */
  get exhibition(){return live&&exhibition;},
  /** The crowd loop's level (0 = silent): a match on and the player within AMBIENCE_RADIUS of the pitch. */
  get ambience(){return ambience;},
  get crowd(){return crowd;},
  /** The stadium's pitch bar (FieldPathCard): Exhibition vs Big match, written only on change. */
  bar(el:HTMLElement|null|undefined){if(!el)return;const t=stadiumBarText(live&&exhibition),key=t.tag+t.action;if(key===barShown)return;barShown=key;
   const tag=el.querySelector('[data-bar-tag]'),act=el.querySelector('[data-bar-action]');if(tag)tag.textContent=t.tag;if(act)act.textContent=t.action;el.setAttribute('aria-label',`${STADIUM_NAME}: ${t.action.toLowerCase()}`);},
  /** After the follow camera is placed: ease to the stand view and back. */
  applyCamera(camera:T.PerspectiveCamera,dt=1/60){
   // Heat: the stand view looks level across the island (the follow camera looks down on ~100 m of it), so the far plane comes in
   // to SEAT_FAR while seated: the far stands' backs and roofs hide what it cuts; without it ~900 draw calls (desktop) on screen.
   if(m.blend>.5){if(!farSaved){farSaved=camera.far;camera.far=SEAT_FAR;camera.updateProjectionMatrix();}}
   else if(farSaved){camera.far=farSaved;farSaved=0;camera.updateProjectionMatrix();}
   // Portrait phones (phase 3b): the FOV opens to PORTRAIT_FOV with the ease and comes back with it (restored exactly at 0).
   const portrait=camera.aspect<1;
   if(m.blend>0&&portrait){if(!fovSaved)fovSaved=camera.fov;const k0=m.blend*m.blend*(3-2*m.blend),f=fovSaved+(PORTRAIT_FOV-fovSaved)*k0;if(Math.abs(camera.fov-f)>.01){camera.fov=f;camera.updateProjectionMatrix();}}
   else if(fovSaved){camera.fov=fovSaved;fovSaved=0;camera.updateProjectionMatrix();}
   if(m.blend<=0||!m.seat)return;view??=seatView(m.seat,portrait);// portrait phone: the raised view (stadiumSeats SEAT_VIEW)
   const k=m.blend*m.blend*(3-2*m.blend);
   // Watching a match: the look point eases toward the ball (smooth, two multiplies a frame); otherwise the seat's pitch point.
   // Portrait: the framed look (portraitLook keeps the centre spot and the big screen in frame).
   if(portrait)portraitLook(view,m.seat,live?ball:null,camera.aspect,want);else{followLook(view,live?ball:null,want);want.y=view.ly;}
   if(!looking){look.x=want.x;look.y=want.y;look.z=want.z;looking=true;}else{const f=1-Math.exp(-FOLLOW_RATE*Math.min(dt,.1));look.x+=(want.x-look.x)*f;look.y+=(want.y-look.y)*f;look.z+=(want.z-look.z)*f;}
   camP.set(view.x,view.y,view.z);cam.position.copy(camP);cam.lookAt(v.set(look.x,look.y,look.z));camQ.copy(cam.quaternion);
   camera.position.lerp(camP,k);camera.quaternion.slerp(camQ,k);
  },
  /** Place the Sit / Stand up prompt (Town's placeEntryPrompt) over the seat. */
  prompt(el:HTMLButtonElement|null|undefined,show:boolean,camera:T.Camera,width:number,height:number,place:(el:HTMLElement,x:number,y:number)=>void,hide:(el:HTMLElement,hidden:boolean)=>void){
   if(!el)return;const seat=held()?m.seat:near;let hidden=!(show&&seat);
   if(!hidden&&seat){
    if(held()){place(el,width/2,height-150);}
    else{// the button hangs from its point (translate -50% / -100%): put that point above the player's head as well as the seat's, so it never covers the player
     v.set(seat.x,seat.y+1.7,seat.z).project(camera);hidden=v.z< -1||v.z>1;
     if(!hidden){const seatTop=(1-v.y)*height/2;v.set(me.x,me.h+PLAYER_HEAD,me.z).project(camera);const top=Math.min(seatTop,v.z>-1&&v.z<1?(1-v.y)*height/2-PROMPT_GAP:seatTop);
      place(el,T.MathUtils.clamp((v.x+1)*width/2,90,width-90),T.MathUtils.clamp(top,90,height-160));}}
    const seatedNow=held();if(seatedNow!==promptSeated||live!==promptLive){promptSeated=seatedNow;promptLive=live;const label=seatedNow?'Stand up':live?'Sit and watch':'Sit';el.textContent=label;el.setAttribute('aria-label',seatedNow?'Stand up':live?'Sit down and watch the match':'Sit down');}
   }
   if(el.hidden!==hidden)hide(el,hidden);
  },
 };
}
export type StadiumSit=ReturnType<typeof createStadiumSit>;
