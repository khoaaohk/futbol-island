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
import {createSitMachine,inGate,nearestSeat,seatView,sitDown,standUp,stepSit,stadiumSponsorLayout,GATE_ARCH_X,type Seat} from './stadiumSeats';
import {ensureStadiumSponsors,SPONSOR_LOAD_RADIUS} from '../stadium/sponsors/index';
import {countStadiumVisit} from '../analytics/sponsorEvents';

export const SIT_KEY='stadium-seat';
/** The camera's far plane while seated (m): the whole bowl (the far stand's back is ~115 m away, the end stand from the other end ~150 m). */
export const SEAT_FAR=175;
const MOVE_KEYS=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'] as const;

export function createStadiumSit(ports:{parent:T.Object3D;wake:()=>void}){
 const m=createSitMachine(),pose:TrickPose=npcSeatPose('bench');pose.w=0;
 let farSaved=0,near:Seat|null=null,view:ReturnType<typeof seatView>|null=null,sponsorAsked=false,wasOutside=true,promptSeated=false;
 const cam=new T.PerspectiveCamera(),/* a camera: lookAt aims its -Z (an Object3D's would aim +Z, away from the pitch) */ camQ=new T.Quaternion(),camP=new T.Vector3(),v=new T.Vector3();
 const held=()=>m.phase==='sitting'||m.phase==='seated';
 return {
  get seated(){return held();},get phase(){return m.phase;},get seat(){return m.seat;},
  /** The seated pose (blended in and out with the camera), or undefined when standing. */
  trick():TrickPose|undefined{if(m.blend<=0)return undefined;pose.w=m.blend*m.blend*(3-2*m.blend);return pose;},
  get yaw(){return m.seat?.yaw??0;},
  /** Each frame (next to the ladder's prompt): what the prompt offers (null = nothing), the sponsor load and the gate count. canSit: on foot, on the ground,
   *  not falling, no menu. */
  want(x:number,z:number,height:number,canSit:boolean):{key:string;distance:number}|null{
   const dc=Math.hypot(x-STADIUM.x,z-STADIUM.z);
   if(!sponsorAsked&&dc<SPONSOR_LOAD_RADIUS){sponsorAsked=true;
    ensureStadiumSponsors(ports.parent,stadiumSponsorLayout()).then(s=>{s.group.position.set(STADIUM.x,-.045,STADIUM.z);s.setScreenSponsor(true);ports.wake();}).catch(()=>{sponsorAsked=false;});}
   const gate=inGate(x,z);if(gate&&wasOutside)countStadiumVisit();if(gate)wasOutside=false;else if(x>GATE_ARCH_X||dc>140)wasOutside=true;
   if(held())return {key:SIT_KEY,distance:0};
   near=canSit&&dc<110&&height>.2?nearestSeat(x,z,height):null;
   return near?{key:SIT_KEY,distance:Math.hypot(near.x-x,near.z-z)}:null;
  },
  /** The prompt pressed: sit on the offered seat (returns it: Town moves the player there) or stand up (returns null). */
  press(reduced:boolean):Seat|null{
   if(held()){standUp(m,reduced);ports.wake();return null;}
   if(!near||!sitDown(m,near,reduced))return null;view=seatView(near);ports.wake();return near;
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
  /** After the follow camera is placed: ease to the stand view and back. */
  applyCamera(camera:T.PerspectiveCamera){
   // Heat: the stand view looks level across the island (the follow camera looks down on ~100 m of it), so the far plane comes in
   // to SEAT_FAR while seated: the far stands' backs and roofs hide what it cuts; without it ~900 draw calls (desktop) on screen.
   if(m.blend>.5){if(!farSaved){farSaved=camera.far;camera.far=SEAT_FAR;camera.updateProjectionMatrix();}}
   else if(farSaved){camera.far=farSaved;farSaved=0;camera.updateProjectionMatrix();}
   if(m.blend<=0||!view)return;const k=m.blend*m.blend*(3-2*m.blend);
   camP.set(view.x,view.y,view.z);cam.position.copy(camP);cam.lookAt(v.set(view.lx,view.ly,view.lz));camQ.copy(cam.quaternion);
   camera.position.lerp(camP,k);camera.quaternion.slerp(camQ,k);
  },
  /** Place the Sit / Stand up prompt (Town's placeEntryPrompt) over the seat. */
  prompt(el:HTMLButtonElement|null|undefined,show:boolean,camera:T.Camera,width:number,height:number,place:(el:HTMLElement,x:number,y:number)=>void,hide:(el:HTMLElement,hidden:boolean)=>void){
   if(!el)return;const seat=held()?m.seat:near;let hidden=!(show&&seat);
   if(!hidden&&seat){
    if(held()){place(el,width/2,height-150);}
    else{v.set(seat.x,seat.y+1.7,seat.z).project(camera);hidden=v.z< -1||v.z>1;if(!hidden)place(el,T.MathUtils.clamp((v.x+1)*width/2,90,width-90),T.MathUtils.clamp((1-v.y)*height/2,90,height-160));}
    const seatedNow=held();if(seatedNow!==promptSeated||!el.dataset.ready){promptSeated=seatedNow;el.dataset.ready='1';el.textContent=seatedNow?'Stand up':'Sit';el.setAttribute('aria-label',seatedNow?'Stand up':'Sit down and watch');}
   }
   if(el.hidden!==hidden)hide(el,hidden);
  },
 };
}
export type StadiumSit=ReturnType<typeof createStadiumSit>;
