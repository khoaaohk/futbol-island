// The Café by the Sea view seat (Nov 25 2026, owner: "also add a table where you can sit and enjoy the view facing the summit").
// The bench behind the deck's corner table (seasideCafe.ts CAFE_VIEW_SEAT) faces Summit Isle across the sea. It reuses the West
// Stadium's sit pieces (stadiumSeats.ts: the sit machine and its ease; npcSeatPose 'bench'): "Sit" through the HUD arbiter when the
// player stands by it on the deck, the bench pose, and the camera eases to a calm framed view over the sea toward the summit; the
// stick / keys / "Stand up" / a ride / a teleport get up. Reduced motion: the ease snaps both ways (sitDown / standUp).
// Teaching (AGENTS.md): each sit shows one line from CAFE_VIEW_NOTES (rotating), about the Summit 5s / small-sided football.
// Heat: idle = one squared-distance test per frame (and only on Coral Cay's east point); nothing allocated per frame; the pose is
// made once. Multiplayer: the seat is local only (the stadium's seat share is not used): friends see the player standing by the bench.
import * as T from 'three';
import {npcSeatPose} from '../graphics/npcSeatPose';
import type {TrickPose} from '../graphics/trickPose';
import {createSitMachine,sitDown,standUp,stepSit,type Seat} from './stadiumSeats';
import {CAFE_VIEW_SEAT} from './seasideCafe';

export const CAFE_SEAT_KEY=CAFE_VIEW_SEAT.key;
/** The seat as the sit machine's Seat (stand / row unused here). */
const SEAT={id:CAFE_VIEW_SEAT.key,stand:'south',row:0,x:CAFE_VIEW_SEAT.sit.x,z:CAFE_VIEW_SEAT.sit.z,y:CAFE_VIEW_SEAT.sit.y,yaw:CAFE_VIEW_SEAT.yaw} as Seat;
/** The view camera: back / up from the sit point (m); portrait phones sit a little further back and higher (a narrower frame). */
export const CAFE_VIEW_CAM={back:2.3,up:1.75,portraitBack:3.4,portraitUp:2.3} as const;
/** One line per sit, in turn (sources: CAFE_VIEW_SOURCES). Kid-friendly, one line each. */
export const CAFE_VIEW_NOTES:readonly {text:string;source:keyof typeof CAFE_VIEW_SOURCES}[]=[
 {text:'That pitch up on Summit Isle is the Summit 5s: five a side, so everyone gets plenty of touches of the ball.',source:'island'},
 {text:'The Summit 5s goals are 3.66 m wide: half a full-size goal, which is 7.32 m.',source:'law1'},
 {text:'In a full match, half-time can last up to 15 minutes. Time for a sip of water and a chat about the plan.',source:'law7'},
 {text:'Watching from far away helps you see space. Before a pass arrives, good players look for the gap.',source:'tip'},
];
export const CAFE_VIEW_SOURCES={
 island:{title:'Futbol Island: the Summit 5s pitch (lib/town/summitIsle.ts SUMMIT_PITCH)',url:''},
 law1:{title:'IFAB Laws of the Game, Law 1: The Field of Play (goals 7.32 m apart)',url:'https://www.theifab.com/laws/latest/the-field-of-play/'},
 law7:{title:'IFAB Laws of the Game, Law 7: The Duration of the Match (half-time interval not more than 15 minutes)',url:'https://www.theifab.com/laws/latest/the-duration-of-the-match/'},
 tip:{title:'Coaching tip (scanning before receiving), no factual claim',url:''},
} as const;
const MOVE_KEYS=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'] as const;
/** The Sit offer shows within REACH m of the sit point, on the deck (feet at the deck's height). */
export function cafeSeatNear(x:number,z:number,height:number){const V=CAFE_VIEW_SEAT;return Math.abs(height-V.sit.y)<.25&&(x-V.sit.x)**2+(z-V.sit.z)**2<V.reach*V.reach;}
/** The camera's seated frame (pure: tests read it). */
export function cafeViewFrame(portrait:boolean){const V=CAFE_VIEW_SEAT,b=portrait?CAFE_VIEW_CAM.portraitBack:CAFE_VIEW_CAM.back,u=portrait?CAFE_VIEW_CAM.portraitUp:CAFE_VIEW_CAM.up;
 return {x:V.sit.x-V.ux*b,y:V.sit.y+u,z:V.sit.z-V.uz*b,lx:V.look.x,ly:V.look.y,lz:V.look.z};}

export function createCafeSeat(ports:{wake:()=>void;note?:(text:string)=>void}){
 const m=createSitMachine(),pose:TrickPose=npcSeatPose('bench');pose.w=0;
 let near=false,sits=0,promptSeated:boolean|null=null;
 const cam=new T.PerspectiveCamera(),camQ=new T.Quaternion(),camP=new T.Vector3(),v=new T.Vector3();let framed:boolean|null=null;
 const held=()=>m.phase==='sitting'||m.phase==='seated';
 return {
  get seated(){return held();},get seat(){return m.seat;},get yaw(){return SEAT.yaw;},
  trick():TrickPose|undefined{if(m.blend<=0)return undefined;pose.w=m.blend*m.blend*(3-2*m.blend);return pose;},
  /** Each frame: the prompt's offer (null = nothing). canSit: on foot, on the ground, not falling, no menu. */
  want(x:number,z:number,height:number,canSit:boolean):{key:string;distance:number}|null{
   if(held())return {key:CAFE_SEAT_KEY,distance:0};
   near=canSit&&cafeSeatNear(x,z,height);
   return near?{key:CAFE_SEAT_KEY,distance:Math.hypot(x-SEAT.x,z-SEAT.z)}:null;
  },
  /** Sit / Stand up. Returns the seat when the player sat (Town puts them there), else null. */
  press(reduced:boolean):Seat|null{
   if(held()){standUp(m,reduced);ports.wake();return null;}
   if(!near||!sitDown(m,SEAT,reduced))return null;ports.wake();
   const n=CAFE_VIEW_NOTES[sits++%CAFE_VIEW_NOTES.length];ports.note?.(n.text);return SEAT;
  },
  /** Movement tick: while seated, holds the player (returns true); the stick, the keys, a ride or a move away get up. */
  holdPlayer(dt:number,input:{x:number;z:number},keys:ReadonlySet<string>,o:{walk:boolean;x:number;z:number;reduced:boolean}){
   if(m.phase==='standing')return false;
   let push=Math.hypot(input.x,input.z);for(const k of MOVE_KEYS)if(keys.has(k))push=1;
   const away=Math.hypot(o.x-SEAT.x,o.z-SEAT.z)>.6;
   const hold=stepSit(m,dt,{push,walk:o.walk,away,reduced:o.reduced});
   if((m.phase as string)!=='standing')ports.wake();
   return hold;
  },
  /** Ease the camera to the view (smoothstep of the sit blend, like the stand view): nothing while standing. */
  applyCamera(camera:T.PerspectiveCamera){
   if(m.blend<=0)return;const portrait=camera.aspect<1;
   if(framed!==portrait){framed=portrait;const f=cafeViewFrame(portrait);camP.set(f.x,f.y,f.z);cam.position.copy(camP);cam.lookAt(v.set(f.lx,f.ly,f.lz));camQ.copy(cam.quaternion);}
   const k=m.blend*m.blend*(3-2*m.blend);camera.position.lerp(camP,k);camera.quaternion.slerp(camQ,k);
  },
  /** Place the Sit / Stand up prompt (Town's placeEntryPrompt): over the bench, or bottom-centre while seated. */
  prompt(el:HTMLButtonElement|null|undefined,show:boolean,camera:T.Camera,width:number,height:number,place:(el:HTMLElement,x:number,y:number)=>void,hide:(el:HTMLElement,hidden:boolean)=>void){
   if(!el)return;const seated=held();let hidden=!(show&&(seated||near));
   if(!hidden){
    if(seated)place(el,width/2,height-150);
    else{v.set(SEAT.x,SEAT.y+2.3,SEAT.z).project(camera);hidden=v.z< -1||v.z>1;if(!hidden)place(el,T.MathUtils.clamp((v.x+1)*width/2,90,width-90),T.MathUtils.clamp((1-v.y)*height/2,90,height-160));}
    if(seated!==promptSeated){promptSeated=seated;el.textContent=seated?'Stand up':'Sit';el.setAttribute('aria-label',seated?'Stand up':'Sit and enjoy the view of Summit Isle');}
   }
   if(el.hidden!==hidden)hide(el,hidden);
  },
 };
}
export type CafeSeat=ReturnType<typeof createCafeSeat>;
