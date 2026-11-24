/**
 * Riding the Island Line (train Phase 3, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md §5 Riding, §8 Learning).
 *  - "Board" (the island's action-prompt style, through the HUD arbiter, like the zipline tower and the stadium seats) while a train
 *    stands at the platform the player is on with its doors open. The player takes the nearest free seat (friends' seats are taken)
 *    and sits in the island's bench pose (npcSeatPose 'bench', the stadium seat's pose), facing the aisle. Input is locked; the stick
 *    and a drag look around. Gameplay 2 (owner, Nov 24 2026): a FREE ride camera (orbit 360° round the rider, pitch, zoom; it stays
 *    where it is left; Recenter / a double tap eases it back; the tunnel eases it to the default and restores it after).
 *  - "Get off" (the action cluster, E) works at any stop while the doors are open; fast travel while riding gets off first (Town).
 *    "Horn" (Space / H) sounds the train's horn (the island sound kit's train-horn cue).
 *  - Learning (AGENTS.md): on leaving each stop an announcement ("Next stop: … Did you know …") and, a few seconds later, ONE question
 *    from the site's quiz library (lib/site/quizBank.ts, loaded on the first ride only) with a small coin reward (learnCoins 'train',
 *    paid once ever per question).
 *  - Multiplayer: wire() is what presence sends (multiplayer/protocol/seat.ts trainWire): the train, the seat and where I sat at the
 *    last stop. It changes once per stop; friends draw me in the moving seat from the shared clock.
 * Heat: off a platform the whole thing is one nearest-track test per HUD tick (trackNearest, bounded), nothing per frame; riding, one
 * seat pose (a few multiply-adds) and the camera per frame. No allocation per frame, no timers, no rAF of its own.
 */
import * as T from 'three';
import {TRAIN_STATIONS,STATION_HALF,STATION_PLATFORM_Y,TRACK,trackAt,trackNearest,wrapS,bedAt,inTunnelS,type TrainStation} from './trainTrack';
import {trainLayout} from './trainLayout';
import {TRAIN_COUNT,TRAIN_STOPS,DOOR_DELAY,DOOR_MOVE,LAP} from './trainSchedule';
import {TRAIN_SEATS,CAR_FLOOR_Y,SEAT_TABLE,PLAYER_SEATS,type SeatPose} from './trainRunning';
import {trainRiderPose,trainStrapPose,swayStrapPose} from '../graphics/trainSeatPose';
import {toCar,fromCar,stepWalk,seatAisle,nearestFreeSeat,nearDoor,trackSOfU,WALK_IN,NEAR_SEAT,GLOW_SEAT,type TrainLocal} from './trainWalk';
import type {TrickPose} from '../graphics/trickPose';
import {springTo} from './zipline';
import {camClearFraction,camCeiling,trussLift,interiorClearFraction} from './trainCamClear';

export const TRAIN_BOARD_KEY='train-board';
/** Owner (Nov 25 2026): Board is offered on foot and from the scooter, bike and moped (never from the jetpack: it lands first).
 *  Boarding from one of them switches to walking first (Ports.dismount: Town's R travel-mode switch) in the same press; Get off
 *  leaves you on foot (as fast travel does: the vehicle is not restored). */
export const TRAIN_BOARD_FROM=['walk','scooter','bike','moped'] as const;
export const canBoardFrom=(mode:string)=>(TRAIN_BOARD_FROM as readonly string[]).includes(mode);
/** One football fact per stop, read in the "Next stop" announcement (AGENTS.md: the ride teaches). */
export const STOP_FACTS:Record<TrainStation['id'],string>={
 north:'match-day trains carry fans to games together, in Japan, the UK and all over the world.',
 west:'a match is two halves of 45 minutes, and half-time lasts no more than 15 minutes.',
 south:'the first official international match was Scotland v England in 1872. It finished 0-0.',
 summit:'small-sided games like five-a-side give every player more touches of the ball than 11 v 11.',
 cay:'each team has 11 players on the pitch, and one of them is the goalkeeper.',
};
export const nextStopLine=(stop:number)=>{const st=TRAIN_STOPS[stop].station;return `Next stop: ${st.name}. Did you know? ${cap(STOP_FACTS[st.id])}`;};
export const arriveLine=(stop:number)=>{const st=TRAIN_STOPS[stop].station;return `${st.name} · ${st.sub}. Tap Get off to step out, or stay on board.`;};
const cap=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);
export const TRAIN_NOTES={board:'All aboard! Drag or use the stick to look around.',wait:'The doors open at the next stop.'} as const;
/** Gameplay 3: the walk notes; a tap within SEAT_TAP_PX px of a glowing seat sits there. */
export const WALK_NOTES={up:'Hold on to a strap! Walk the aisle, and tap a glowing seat (or Sit) to sit down.',sit:'Walk to a glowing seat to sit down.'} as const;
export const SEAT_TAP_PX=56;
/** The quiz comes this long (s) after the doors close, and only on a run at least QUIZ_MIN_RUN s long (every run is 45 s or more). */
export const QUIZ_AFTER=6,QUIZ_MIN_RUN=30;
/** Owner (Nov 25 2026): no between-stops quiz while riding (no card, no 2-coin reward, the quiz library is never loaded for the
 *  train). Off by this constant rather than deleted tonight (the release is frozen); the "Next stop … Did you know?" facts stay. */
export const TRAIN_QUIZ=false;
const wallS=()=>(typeof performance!=='undefined'?performance.now():Date.now())/1000;
/** Board only while the doors are this open and the train waits at least this long (s) more. */
const DOORS_OPEN=.5,BOARD_LEFT=1.5,GET_OFF_LEFT=.8;
/** Easier boarding (owner, Nov 24 2026): the Board zone is the whole platform ± BOARD_ENDS m and up to BOARD_DEPTH m back from its
 *  edge (PLATFORM_EDGE m from the line); Board shows BOARD_EARLY s before the doors open (a train braking in) and a press then
 *  waits for them; Board walks you to the nearest open door in WALK_MAX s at most (WALK_SPEED m/s, smooth) and on into the seat. */
export const BOARD_ENDS=2,BOARD_DEPTH=4,PLATFORM_EDGE=1.45,BOARD_EARLY=4,WALK_SPEED=7,WALK_MIN=.35,WALK_MAX=.95;
/** Seconds until train state st's doors are open enough to board at stop `stop` (0: open now; Infinity: not coming within a lap). */
export function boardIn(st:{at:number;next:number;t:number;doors:number;dwellLeft:number},stop:number){
 const usable=DOOR_DELAY+DOOR_MOVE*DOORS_OPEN;
 if(st.at===stop){if(st.doors>=DOORS_OPEN)return st.dwellLeft>=BOARD_LEFT?0:Infinity;return st.dwellLeft>DOOR_DELAY+DOOR_MOVE?Math.max(0,usable-(TRAIN_STOPS[stop].depart-TRAIN_STOPS[stop].arrive-st.dwellLeft)):Infinity;}
 if(st.at>=0||st.next!==stop)return Infinity;
 return ((TRAIN_STOPS[stop].arrive-st.t)%LAP+LAP)%LAP+usable;
}
/** The ride camera: on the rider's window side, back along the train and up (m); portrait phones a step further out. In the tunnel
 *  it comes in close (inside the tube). */
// Portrait phones (AAA audit, Nov 24 2026): the narrow view (±11° across at fov 40) looked 4 m up the line from 5 m back, so a rider
// across the aisle sat ~21° off the view axis (NDC x ≈ 2.2, off screen) and my own rider hid behind the car side. Portrait now opens
// the fov to PORTRAIT_FOV with the blend (the stadium seat's precedent; restored exactly), stands squarer to the window
// (portraitBack) and aims between me and the far bench (portraitIn, portraitAhead): me ≈5°, the far rider ≈9° off the axis (±15° fits).
const CAM={out:7.5,back:5,up:3.6,portraitOut:1.6,portraitBack:3.5,portraitAhead:1.5,portraitIn:1.15,tunnelOut:2.4,tunnelBack:2,tunnelUp:1.6,ahead:4,eye:1.25} as const;
const PORTRAIT_FOV=58;
/** Gameplay 3: the standing camera inside the car: distance (× zoom), eye over the floor, how far ahead of you it looks (m). */
const STAND_CAM={dist:2.4,eye:1.3,ahead:1.2} as const;
/** The free ride camera (Gameplay 2): elevation limits (rad: a little under the horizontal … ~60° down), zoom (× the default
 *  distance: window close-up … wide), drag and key / stick rates, inertia decay (none with reduced motion), the Recenter ease. */
export const ORBIT={pitchMin:-.09,pitchMax:1.05,zoomMin:.38,zoomMax:2.6,drag:5.2,keyYaw:1.9,keyPitch:1.1,wheel:.0016,decay:4.5,recenter:4,tap2:.32,tapPx:30,moved:.06} as const;
const wrapPi=(a:number)=>((a%(Math.PI*2))+Math.PI*3)%(Math.PI*2)-Math.PI;

export type TrainQuizQ={id:string;q:string;options:string[];correct:number;explain:string};
export type TrainQuiz=TrainQuizQ&{picked:number};
export type TrainRideView={riding:boolean;canGetOff:boolean;note:string;notes:number;quiz:TrainQuiz|null;/** the free camera is off its default (Recenter enabled) */moved:boolean;
 /** Gameplay 3: standing in the aisle; a free seat within reach (Sit); by a door bay (Get off becomes the primary at a stop) */standing:boolean;nearSeat:boolean;nearDoor:boolean};
const IDLE:TrainRideView={riding:false,canGetOff:false,note:'',notes:0,quiz:null,moved:false,standing:false,nearSeat:false,nearDoor:false};
let view=IDLE;const listeners=new Set<()=>void>();
/** The HUD bridge (components/TrainRideHud.tsx): written only when something shown changes, never per frame. */
export const trainRideStore={
 get:()=>view,server:()=>IDLE,
 set(patch:Partial<TrainRideView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
 reset(){if(view===IDLE)return;view=IDLE;listeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
};
export type TrainActionId='getoff'|'horn'|'recenter'|'walk';
/** The prompt's tap, the cluster's buttons and the quiz answer; the island runtime installs the real ones. */
export const trainRideActions={board:()=>{},press:(_id:TrainActionId,_phase:'tap'|'down'|'up')=>{},answer:(_i:number)=>{}};
/** The action cluster while riding (the zipline's ZIP_BUTTONS pattern): Get off (only at a stop), the horn, Recenter and (Gameplay 3)
 *  Walk / Sit (the 'extra' slot, key Q). Standing by a door bay at a stop with the doors open, Get off becomes the primary button. */
export function trainButtons(canGetOff:boolean,moved=false,standing=false,nearSeat=false,nearDoor=false){
 const offFirst=standing&&nearDoor&&canGetOff;
 return [{slot:offFirst?'shoot':'ride',key:'E',id:'getoff',label:canGetOff?'Get off here':'Get off at the next stop',icon:'trainoff',enabled:canGetOff},
  {slot:offFirst?'ride':'shoot',key:'Space',id:'horn',label:'Sound the horn',icon:'horn',enabled:true},
  {slot:'juggle',key:'R',id:'recenter',label:'Recenter the camera',icon:'recenter',enabled:moved},
  {slot:'extra',key:'Q',id:'walk',label:!standing?'Stand up and walk around the train':nearSeat?'Sit in this seat':'Walk to a glowing seat to sit',icon:standing?'sit':'walk',enabled:!standing||nearSeat}] as const;
}
export function trainKeyAction(code:string,key:string):TrainActionId|null{
 const k=key.toLowerCase();if(k==='e'||code==='Digit1')return 'getoff';if(code==='Space'||k==='h'||code==='Digit2')return 'horn';if(k==='r'||code==='Digit3')return 'recenter';if(k==='q'||code==='Digit4')return 'walk';return null;
}

/** Where on the platforms (x, z, standing height) a station is (allocation-free): the station the point stands on, or -1. */
const L=trainLayout();
export function platformAt(x:number,z:number,y:number){
 const hit=trackNearest(x,z,8);if(!hit)return -1;
 for(let i=0;i<TRAIN_STATIONS.length;i++){const st=TRAIN_STATIONS[i],du=((hit.s-st.s)%TRACK.length+TRACK.length*1.5)%TRACK.length-TRACK.length/2;
  if(Math.abs(du)>STATION_HALF||hit.side!==st.side||hit.d<1.1||hit.d>(st.id==='south'?8.1:5.6))continue;
  const top=bedAt(L.profile,st.s)+STATION_PLATFORM_Y;if(Math.abs(y-top)>1.2)continue;return i;}
 return -1;
}
/** The Board zone (owner, Nov 24 2026): station i whose platform (± BOARD_ENDS m past its ends, up to BOARD_DEPTH m back from the
 *  edge; the South deck to its back) the point stands on, or -1. Allocation-free. */
export function boardZoneAt(x:number,z:number,y:number){
 const hit=trackNearest(x,z,PLATFORM_EDGE+BOARD_DEPTH+3);if(!hit)return -1;
 for(let i=0;i<TRAIN_STATIONS.length;i++){const st=TRAIN_STATIONS[i],du=((hit.s-st.s)%TRACK.length+TRACK.length*1.5)%TRACK.length-TRACK.length/2;
  if(Math.abs(du)>STATION_HALF+BOARD_ENDS||hit.side!==st.side||hit.d<1.1||hit.d>Math.max(PLATFORM_EDGE+BOARD_DEPTH,st.id==='south'?8.1:0))continue;
  const top=bedAt(L.profile,st.s)+STATION_PLATFORM_Y;if(Math.abs(y-top)>1.2)continue;return i;}
 return -1;
}
/** The spot on station i's platform level with track s (2.6 m from the line): where a rider steps off. */
export function platformSpot(i:number,s:number,out:{x:number;y:number;z:number;yaw:number}){
 const st=TRAIN_STATIONS[i],du=((s-st.s)%TRACK.length+TRACK.length*1.5)%TRACK.length-TRACK.length/2,u=Math.max(-STATION_HALF+1.5,Math.min(STATION_HALF-1.5,du));
 const c=trackAt(st.s+u),nx=c.tz*st.side,nz=-c.tx*st.side;out.x=c.x+nx*2.6;out.z=c.z+nz*2.6;out.y=bedAt(L.profile,st.s)+STATION_PLATFORM_Y;out.yaw=Math.atan2(nx,nz);return out;
}

type DoorSpot={x:number;y:number;z:number;yaw:number;car:number;door:number};
type Run={states:readonly {s:number;at:number;doors:number;dwellLeft:number;next:number;t:number}[];seatPose(k:number,j:number,out:SeatPose,now?:number):SeatPose;ridden:Uint8Array;
 /** Car c of train k's matrix this frame (Gameplay 3: the standing rider's train-relative spot). */carMatrixOf?(k:number,c:number,out:T.Matrix4):T.Matrix4;
 /** The open door nearest x, z (trainRunning.doorSpot); null while the train runs. */doorSpot?(k:number,x:number,z:number,out:DoorSpot):DoorSpot|null};
type Ports={
 run:()=>Run|null;
 /** Put the player at x, z on height y (boarding, getting off): Town's location, rooftop and facing. */
 place:(x:number,z:number,y:number,yaw:number)=>void;
 /** Every riding frame: the seat (Town writes location, the drawn root and the standing height; no rooftop reset). */
 seat:(p:SeatPose)=>void;
 /** Is seat j of train k taken by a friend drawn there (townBridge trainSeat)? */
 taken:(k:number,j:number)=>boolean;
 cue:(name:string,gain:number)=>void;haptic?:()=>void;
 /** The quiz library (dynamic import, first ride only). */
 loadQuiz:()=>Promise<TrainQuizQ[]>;
 /** A right answer: learning coins once ever for this question. */
 pay:(id:string)=>void;
 /** Camera / shadow fit hold while riding (the zipline's). */
 hold?:(on:boolean)=>void;
 /** Boarding from the scooter / bike / moped: switch to walking first (Town's travel-mode switch, the vehicle stowed as R does). */
 dismount?:()=>void;
 /** Ground height (Town: fieldSurfaceHeight, Summit Isle's hill and cutting): the ride camera stays above it. */
 ground?:(x:number,z:number)=>number;
};
export function createTrainRide(ports:Ports){
 let k=-1,j=-1,blend=0,camOn=false,lastAt=-2,queued=-1,hoverK=-1,ready=false,walkT=-1,walkDur=0,walkA=0,quizIn=-1,lastWall=-1,quizzes:TrainQuizQ[]|null=null,quizLoading=false,quizNo=0,near=-1,nearTrain=-1;
 const pose:SeatPose={x:0,y:0,z:0,yaw:0},probe:SeatPose={x:0,y:0,z:0,yaw:0},spot={x:0,y:0,z:0,yaw:0},me={x:0,z:0,h:0};
 const anchor={train:0,seat:0,x:0,y:0,z:0,yaw:0},tp={x:0,z:0,tx:1,tz:0};
 const door:DoorSpot={x:0,y:0,z:0,yaw:0,car:0,door:0},from={x:0,y:0,z:0},walkPose:SeatPose={x:0,y:0,z:0,yaw:0};
 // Gameplay 2: riders kneel up on the bench facing out of their window, turned a little toward the way the train runs
 const tricks:[TrickPose,TrickPose]=[trainRiderPose(-1),trainRiderPose(1)];tricks[0].w=tricks[1].w=0;
 const tight={x:0,v:0};let dragging=false,dragId=-1,dragX=0,dragY=0,dragT=0,fovSaved=0,arm=-1;
 // the free camera: yaw round the rider (unlimited), added elevation, zoom; yaw inertia; key / stick input; pinch; double tap
 const orb={yaw:0,pitch:0,zoom:1,vy:0};let keyYaw=0,keyPitch=0,recentering=false,pinchId=-1,pinchX=0,pinchY=0,pinchD=0,pinchZ=1,tapT=-1,tapX=0,tapY=0;
 const ceil={w:0,y:0},camPos=new T.Vector3(),camLook=new T.Vector3(),aimer=new T.PerspectiveCamera(),camQ=new T.Quaternion(),normalPos=new T.Vector3(),normalQ=new T.Quaternion(),v=new T.Vector3();
 try{quizNo=Number(localStorage.getItem('fi-train-quiz'))||0;}catch{quizNo=0;}
 // Gameplay 3: standing in the aisle. sp = the train-frame spot (trainWalk.ts: x across, u along car 0), moved by the stick / WASD
 // relative to the camera; tw = the stand-up / sit-down ease (twSit: the seat being sat in, -1 standing up); the strap pose fades in
 // when you stop; gait = the frame Town poses the rig in (the rig walks in the train, then is put back in the world).
 let standing=false,tw=-1,twDur=.35,twSit=-1,strapW=0,gaitYaw=0,gaitMove=0,camBase=0,standCam=0,camFwd=0,nearSeatJ=-1,lean=0,lastCam:T.Camera|null=null,meCar=0;
 const sp={x:0,u:0},twFrom={x:0,u:0},twTo={x:0,u:0},mv={x:0,z:0},carL:TrainLocal={car:0,x:0,z:0},carM=new T.Matrix4(),pv=new T.Vector3(),aisle={x:0,z:0},gp:SeatPose={x:0,y:0,z:0,yaw:0};
 const straps:[TrickPose,TrickPose]=[trainStrapPose(-1),trainStrapPose(1)];
 const gait={on:false,x:0,z:0,facing:NaN};
 /** Free player seats near the standing rider: world spot (on the cushion) and glow 0 … 1 (lib/graphics/trainSeatGlow.ts draws them). */
 const glows=Array.from({length:TRAIN_SEATS},()=>({x:0,y:0,z:0,yaw:0,w:0}));
 const riding=()=>k>=0;
 function setNote(note:string){trainRideStore.set({note,notes:view.notes+1});}
 function ensureQuiz(){if(!TRAIN_QUIZ||quizzes||quizLoading)return;quizLoading=true;ports.loadQuiz().then(q=>{quizzes=q;}).catch(()=>{quizLoading=false;});}
 function askQuiz(){if(!quizzes?.length){ensureQuiz();/* Phase 4: a failed load is asked again (ensureQuiz skips while one is loading) */if(riding()&&lastAt<0)quizIn=1;return;}/* still loading (first ride): try again in 1 s, until the next stop */const q=quizzes[quizNo%quizzes.length];quizNo++;try{localStorage.setItem('fi-train-quiz',String(quizNo));}catch{/* private mode */}
  trainRideStore.set({quiz:{...q,picked:-1}});}
 function board(){
  const run=ports.run();if(riding()||!run||near<0||nearTrain<0)return false;
  const st=run.states[nearTrain];
  // braking in / doors still opening: the press waits for them (want() boards on the HUD tick the doors are open)
  if(!ready){queued=nearTrain;return true;}
  if(st.at<0||st.doors<DOORS_OPEN||st.dwellLeft<BOARD_LEFT)return false;
  // the nearest open door, then the free seat nearest that door (both cars' doors open onto this platform)
  const ds=run.doorSpot?.(nearTrain,me.x,me.z,door)??null;const ax=ds?ds.x:me.x,az=ds?ds.z:me.z;
  let best=-1,bd=Infinity;for(let s=0;s<TRAIN_SEATS;s++){if(ports.taken(nearTrain,s))continue;run.seatPose(nearTrain,s,probe);const d=Math.hypot(probe.x-ax,probe.z-az);if(d<bd){bd=d;best=s;}}
  if(best<0){queued=-1;setNote('This train is full. The next one comes in 2 minutes.');return false;}
  ports.dismount?.();// on a scooter / bike / moped: on foot first, boarded in the same press
  queued=-1;k=nearTrain;j=best;run.seatPose(k,j,probe);standing=false;tw=-1;gait.on=false;standCam=0;
  // the walk: me → the door → the seat, WALK_SPEED m/s, WALK_MIN … WALK_MAX s in all (eased, so it starts and ends soft)
  from.x=me.x;from.y=me.h;from.z=me.z;if(!ds){door.x=me.x;door.z=me.z;door.y=me.h;door.yaw=probe.yaw;}
  {const a=Math.hypot(door.x-from.x,door.z-from.z),b=Math.hypot(probe.x-door.x,probe.z-door.z);walkA=a/Math.max(.01,a+b);walkDur=Math.max(WALK_MIN,Math.min(WALK_MAX,(a+b)/WALK_SPEED));walkT=0;}lastAt=st.at;quizIn=-1;lastWall=-1;run.ridden[k]=1;run.seatPose(k,j,pose);
  anchor.train=k;anchor.seat=j;anchor.x=pose.x;anchor.y=pose.y;anchor.z=pose.z;anchor.yaw=pose.yaw;
  orb.yaw=orb.pitch=orb.vy=0;orb.zoom=1;recentering=false;keyYaw=keyPitch=0;tight.x=inTunnelS(run.states[k].s)?1:0;tight.v=0;
  trainRideStore.set({riding:true,canGetOff:false,quiz:null});setNote(TRAIN_NOTES.board);ports.hold?.(true);ports.haptic?.();ensureQuiz();
  if(typeof window!=='undefined'&&!listening){listening=true;window.addEventListener('pointerdown',onDown,true);window.addEventListener('pointermove',onMove,true);window.addEventListener('pointerup',onUp,true);window.addEventListener('pointercancel',onUp,true);window.addEventListener('wheel',onWheel,{capture:true,passive:true});}
  return true;
 }
 /** Off the train. force: fast travel / a teleport (Town places the player); otherwise only while the doors are open at a stop. */
 function getOff(force=false){
  if(!riding())return false;const run=ports.run();const st=run?.states[k];
  if(!force){if(!run||!st||st.at<0||st.doors<DOORS_OPEN||st.dwellLeft<GET_OFF_LEFT){setNote(TRAIN_NOTES.wait);return false;}
   const si=TRAIN_STATIONS.indexOf(TRAIN_STOPS[st.at].station);platformSpot(si,standing?wrapS(trackSOfU(st.s,sp.u)):trainSeatS(run),spot);ports.place(spot.x,spot.z,spot.y,spot.yaw);ports.haptic?.();}
  if(run)run.ridden[k]=0;k=-1;j=-1;walkT=-1;quizIn=-1;ports.hold?.(false);standing=false;tw=-1;gait.on=false;strapW=0;for(const g of glows)g.w=0;
  trainRideStore.set({riding:false,canGetOff:false,quiz:null,standing:false,nearSeat:false,nearDoor:false});
  if(force)blend=0;return true;
 }
 /** The track s level with my seat (the train's front minus how far back my car is). */
 function trainSeatS(run:Run){return wrapS(run.states[k].s-(j>>2)*12.4-6);}
 function press(id:TrainActionId,phase:'tap'|'down'|'up'){if(!riding()||phase==='up')return;
  if(id==='getoff')getOff(false);else if(id==='horn')ports.cue('train-horn',.9);else if(id==='recenter')recenter();
  else if(id==='walk'){if(!standing)standUp();else if(nearSeatJ>=0)sitDown(nearSeatJ);else setNote(WALK_NOTES.sit);}}
 /** Gameplay 3: up from the seat into the aisle in front of it (a short ease; the kneel fades out). */
 function standUp(){
  const run=ports.run();if(!riding()||standing||walkT>=0||!run?.carMatrixOf)return false;
  const seat=SEAT_TABLE[PLAYER_SEATS[j]];fromCar(seat.car,seat.x,seat.z,aisle);twFrom.x=aisle.x;twFrom.u=aisle.z;seatAisle(j,aisle);twTo.x=aisle.x;twTo.u=aisle.z;sp.x=twFrom.x;sp.u=twFrom.u;
  standing=true;twSit=-1;tw=0;twDur=.35;strapW=0;mv.x=mv.z=0;gaitMove=0;
  // face across the aisle, the camera looking along the car toward the cab ahead of you
  gaitYaw=twTo.x>0?-Math.PI/2:Math.PI/2;gait.facing=gaitYaw;camBase=twTo.u<-6.2?Math.PI:0;
  trainRideStore.set({standing:true,nearSeat:false,nearDoor:false});setNote(WALK_NOTES.up);ports.haptic?.();return true;
 }
 /** Gameplay 3: into free player seat jj (eased from where you stand; the kneel blends in). Presence sends the new seat. */
 function sitDown(jj:number){
  if(!standing||tw>=0||jj<0||jj>=TRAIN_SEATS||ports.taken(k,jj))return false;
  const seat=SEAT_TABLE[PLAYER_SEATS[jj]];twFrom.x=sp.x;twFrom.u=sp.u;fromCar(seat.car,seat.x,seat.z,aisle);twTo.x=aisle.x;twTo.u=aisle.z;
  twSit=jj;tw=0;twDur=Math.max(.35,Math.min(1.4,Math.hypot(twTo.x-twFrom.x,twTo.u-twFrom.u)/WALK_IN));ports.haptic?.();return true;
 }
 function finishSit(run:Run){
  standing=false;gait.on=false;j=twSit;twSit=-1;tw=-1;strapW=0;for(const g of glows)g.w=0;
  run.seatPose(k,j,pose);anchor.seat=j;anchor.x=pose.x;anchor.y=pose.y;anchor.z=pose.z;anchor.yaw=pose.yaw;// presence: the new seat code
  trainRideStore.set({standing:false,nearSeat:false,nearDoor:false});
 }
 /** Gameplay 3, every standing frame: the walk (camera-relative), the world spot from the car's matrix, the strap pose and its curve
  *  sway, the seats that glow, the Sit / Get off offers. A few multiply-adds and up to 8 seat poses; no allocation. */
 function standFrame(run:Run,dt:number,reduced:boolean){
  const h=Math.max(0,Math.min(dt,.1)),u0=sp.u,x0=sp.x;
  if(tw>=0){tw=Math.min(1,tw+h/twDur);const e=tw*tw*(3-2*tw);sp.x=twFrom.x+(twTo.x-twFrom.x)*e;sp.u=twFrom.u+(twTo.u-twFrom.u)*e;blend=twSit>=0?Math.max(0,(e-.55)/.45):Math.min(blend,1-e);
   if(tw>=1){if(twSit>=0){finishSit(run);return;}tw=-1;}}
  else{blend=Math.max(0,blend-h*6);const m=Math.hypot(mv.x,mv.z);
   if(m>.05){const sc=WALK_IN*Math.min(1,m)*h/m,c=Math.cos(camFwd),s=Math.sin(camFwd);stepWalk(sp,(mv.z*s-mv.x*c)*sc,(mv.z*c+mv.x*s)*sc);}}
  const moved=h>0?Math.hypot(sp.x-x0,sp.u-u0)/h:0;gaitMove+=((moved>.25?1:0)-gaitMove)*Math.min(1,h*8);
  strapW+=((tw<0&&moved<.25?1:0)-strapW)*Math.min(1,h*(reduced?12:4));
  toCar(sp.x,sp.u,carL);meCar=carL.car;run.carMatrixOf!(k,carL.car,carM);pv.set(carL.x,CAR_FLOOR_Y,carL.z).applyMatrix4(carM);const e=carM.elements;
  pose.x=pv.x;pose.y=pv.y;pose.z=pv.z;pose.yaw=Math.atan2(e[8],e[10])+gaitYaw+(carL.car%2?Math.PI:0);pose.lean=1;
  lean=reduced?0:e[1];swayStrapPose(straps[0],lean);swayStrapPose(straps[1],lean);
  gait.on=true;gait.x=sp.x;gait.z=sp.u;ports.seat(pose);
  // the free seats you pass glow (the nearest within reach the brightest: Sit); friends' seats are skipped
  nearSeatJ=tw<0?nearestFreeSeat(sp.x,sp.u,NEAR_SEAT,s=>ports.taken(k,s)):-1;
  for(let s=0;s<TRAIN_SEATS;s++){const g=glows[s];let w=0;if(tw<0&&!ports.taken(k,s)){seatAisle(s,aisle);const d=Math.hypot(aisle.x-sp.x,aisle.z-sp.u);if(d<GLOW_SEAT)w=s===nearSeatJ?1:.35*(1-d/GLOW_SEAT);}
   g.w+=(w-g.w)*Math.min(1,h*(reduced?20:6));if(g.w<.01)g.w=0;if(g.w>0){run.seatPose(k,s,gp);g.x=gp.x;g.y=gp.y;g.z=gp.z;g.yaw=gp.yaw;}}
  const st=run.states[k],door=st.at>=0&&st.doors>=DOORS_OPEN&&tw<0&&nearDoor(sp.x,sp.u)>=0;
  if(view.nearSeat!==(nearSeatJ>=0)||view.nearDoor!==door)trainRideStore.set({nearSeat:nearSeatJ>=0,nearDoor:door});
 }
 /** A tap on a glowing seat while standing: walk over and sit (the nearest on screen within SEAT_TAP_PX). */
 function tapSeat(cx:number,cy:number,el:Element){
  if(!standing||tw>=0||!lastCam)return false;const r=el.getBoundingClientRect();let best=-1,bd=SEAT_TAP_PX;
  for(let s=0;s<TRAIN_SEATS;s++){const g=glows[s];if(g.w<=0||ports.taken(k,s))continue;v.set(g.x,g.y+.75,g.z).project(lastCam);if(v.z< -1||v.z>1)continue;
   const d=Math.hypot(r.left+(v.x+1)*r.width/2-cx,r.top+(1-v.y)*r.height/2-cy);if(d<bd){bd=d;best=s;}}
  return best>=0&&sitDown(best);
 }
 /** Ease the free camera back to the default framing (Recenter, a double tap). */
 function recenter(){recentering=true;orb.vy=0;}
 function answer(i:number){const q=view.quiz;if(!q||q.picked>=0)return;trainRideStore.set({quiz:{...q,picked:i}});if(i===q.correct)ports.pay(q.id);}
 // ---- looking around: the stick (Town's shaped stick) and a drag on the canvas, through the zipline's soft limit and spring
 let listening=false;
 // Only presses that start on the canvas (never a HUD button); a second finger pinches; two quick taps recenter.
 const span=()=>Math.max(320,Math.min(1100,typeof window!=='undefined'?Math.min(window.innerWidth,window.innerHeight*1.4):390));
 function onDown(e:PointerEvent){const el=e.target as Element|null;if(!riding()||e.button>0||!el||el.tagName!=='CANVAS')return;
  if(dragging&&e.pointerId!==dragId&&pinchId<0){pinchId=e.pointerId;pinchX=e.clientX;pinchY=e.clientY;pinchD=Math.max(10,Math.hypot(pinchX-dragX,pinchY-dragY));pinchZ=orb.zoom;orb.vy=0;return;}
  if(dragging)return;const now=e.timeStamp/1000;
  if(tapT>=0&&now-tapT<ORBIT.tap2&&Math.hypot(e.clientX-tapX,e.clientY-tapY)<ORBIT.tapPx){tapT=-1;recenter();return;}
  tapT=now;tapX=e.clientX;tapY=e.clientY;dragging=true;dragId=e.pointerId;dragX=e.clientX;dragY=e.clientY;dragT=now;orb.vy=0;recentering=false;}
 function onMove(e:PointerEvent){
  if(e.pointerId===pinchId){pinchX=e.clientX;pinchY=e.clientY;orb.zoom=Math.max(ORBIT.zoomMin,Math.min(ORBIT.zoomMax,pinchZ*pinchD/Math.max(10,Math.hypot(pinchX-dragX,pinchY-dragY))));return;}
  if(!dragging||e.pointerId!==dragId)return;if(pinchId>=0){dragX=e.clientX;dragY=e.clientY;orb.zoom=Math.max(ORBIT.zoomMin,Math.min(ORBIT.zoomMax,pinchZ*pinchD/Math.max(10,Math.hypot(pinchX-dragX,pinchY-dragY))));return;}
  const w=span(),dx=(e.clientX-dragX)/w,dy=(e.clientY-dragY)/w,now=e.timeStamp/1000,dts=Math.max(.008,now-dragT);
  if(Math.abs(e.clientX-tapX)+Math.abs(e.clientY-tapY)>ORBIT.tapPx)tapT=-1;// a drag is not a tap
  orb.yaw=wrapPi(orb.yaw-dx*ORBIT.drag);orb.pitch=Math.max(ORBIT.pitchMin,Math.min(ORBIT.pitchMax,orb.pitch+dy*ORBIT.drag*.6));
  orb.vy=orb.vy*.5+(-dx*ORBIT.drag/dts)*.5;dragX=e.clientX;dragY=e.clientY;dragT=now;}
 function onUp(e:PointerEvent){if(e.pointerId===pinchId){pinchId=-1;return;}if(dragging&&e.pointerId===dragId){
   // Gameplay 3: standing, a quick tap (no drag) on a glowing seat sits there
   if(standing&&tapT>=0&&e.timeStamp/1000-tapT<.4&&Math.hypot(e.clientX-tapX,e.clientY-tapY)<ORBIT.tapPx&&e.target instanceof Element&&tapSeat(e.clientX,e.clientY,e.target))tapT=-1;
   dragging=false;dragId=-1;if(pinchId>=0){pinchId=-1;orb.vy=0;}if(e.timeStamp/1000-dragT>.08)orb.vy=0;}}
 function onWheel(e:WheelEvent){const el=e.target as Element|null;if(!riding()||!el||el.tagName!=='CANVAS')return;orb.zoom=Math.max(ORBIT.zoomMin,Math.min(ORBIT.zoomMax,orb.zoom*Math.exp(e.deltaY*ORBIT.wheel)));recentering=false;}
 function unlisten(){if(!listening||typeof window==='undefined')return;listening=false;window.removeEventListener('pointerdown',onDown,true);window.removeEventListener('pointermove',onMove,true);window.removeEventListener('pointerup',onUp,true);window.removeEventListener('pointercancel',onUp,true);window.removeEventListener('wheel',onWheel,true);dragging=false;dragId=pinchId=-1;}
 let promptShown=false;const lastWant={x:0,z:0,y:0,can:false,n:0};
 /** E on the platform while the Board button shows (the zipline tower's key). */
 function onKey(e:KeyboardEvent){if(e.key.toLowerCase()!=='e'||e.repeat||!promptShown||riding())return;const el=e.target as HTMLElement|null;if(el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable))return;if(board())e.preventDefault();}
 if(typeof window!=='undefined')window.addEventListener('keydown',onKey);
 return {
  get active(){return riding();},get train(){return k;},get seat(){return j;},get blend(){return blend;},
  /** Gameplay 2: the train whose doors this client holds open (walking aboard it, or waiting for it on its platform), else -1. */
  get waiting(){return riding()?(walkT>=0?k:-1):near>=0?nearTrain:-1;},
  /** Gameplay 2: walking to the door (0 … 1), -1 when not; and a Board press waiting for the doors (train index, -1). */
  get walking(){return walkT;},get queued(){return queued;},
  /** Gameplay 2: the train under the pointer (lib/graphics/trainHover.ts; Town writes it), -1: none. Board then wins as a hover. */
  get hoverTrain(){return hoverK;},set hoverTrain(v:number){hoverK=v;},
  board,getOff,press,answer,
  /** The Board offer (Town's HUD tick): standing on a platform where a train waits with its doors open. One bounded track test. */
  want(x:number,z:number,y:number,canBoard:boolean):{key:string;distance:number}|null{
   me.x=x;me.z=z;me.h=y;near=-1;nearTrain=-1;ready=false;lastWant.x=x;lastWant.z=z;lastWant.y=y;lastWant.can=canBoard;lastWant.n++;if(riding())return null;if(!canBoard){queued=-1;return null;}
   const run=ports.run();if(!run)return null;
   let quick=false;for(const st of TRAIN_STATIONS){const c=trackAt(st.s,tp);if(Math.abs(c.x-x)<STATION_HALF+8&&Math.abs(c.z-z)<STATION_HALF+8){quick=true;break;}}
   if(!quick)return null;
   const si=boardZoneAt(x,z,y);if(si<0){queued=-1;return null;}const stop=TRAIN_STOPS.findIndex(s=>s.station===TRAIN_STATIONS[si]);
   for(let i=0;i<TRAIN_COUNT;i++){const w=boardIn(run.states[i],stop);if(!(w<=BOARD_EARLY))continue;near=si;nearTrain=i;ready=w<=0;
     if(queued===i&&ready&&board())return null;// a press while it braked in: on board as the doors open
     const c=trackAt(TRAIN_STATIONS[si].s,tp);return {key:TRAIN_BOARD_KEY,distance:hoverK===i?-1:Math.max(0,Math.hypot(c.x-x,c.z-z)-3)};}// the hovered train (trainHover.ts): explicit intent
   queued=-1;return null;
  },
  /** The Board button over the player's head (the stadium Sit prompt's placement). */
  prompt(el:HTMLButtonElement|null|undefined,show:boolean,camera:T.Camera,width:number,height:number,place:(el:HTMLElement,x:number,y:number)=>void,hide:(el:HTMLElement,hidden:boolean)=>void){
   if(!el)return;let hidden=!show||riding()||near<0;
   if(!hidden){const q=queued>=0?'1':'';if((el.dataset.queued??'')!==q){el.dataset.queued=q;el.textContent=q?'Doors opening…':'Board';}v.set(me.x,me.h+2.1,me.z).project(camera);hidden=v.z< -1||v.z>1;if(!hidden)place(el,T.MathUtils.clamp((v.x+1)*width/2,90,width-90),T.MathUtils.clamp((1-v.y)*height/2-14,90,height-160));}
   hide(el,hidden);promptShown=!hidden;
  },
  /** Town's movement tick: riding locks input (the stick looks around instead). */
  holdPlayer(stickX:number,stickZ=0,keys?:ReadonlySet<string>){if(!riding())return false;
   const kx=keys?(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0):0,kz=keys?(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0):0;
   // Gameplay 3: standing, the stick and WASD / arrows walk (relative to the camera); a drag still turns the camera
   if(standing){mv.x=Math.max(-1,Math.min(1,stickX+kx));mv.z=Math.max(-1,Math.min(1,kz-stickZ));keyYaw=keyPitch=0;if(mv.x||mv.z)recentering=false;return true;}
   keyYaw=Math.max(-1,Math.min(1,stickX+kx));keyPitch=Math.max(-1,Math.min(1,kz-stickZ));if(keyYaw||keyPitch)recentering=false;return true;},
  /** The seated pose for the rig (blended in and out). */
  trick():TrickPose|undefined{
   // Gameplay 3: standing, one hand up on the strap on the nearer rail (blended out while walking, and while the kneel fades)
   if(standing&&blend<=.02){if(strapW<=.01)return undefined;const t=straps[sp.x*(meCar%2?-1:1)>0?1:0];t.w=strapW*strapW*(3-2*strapW);return t;}
   if(blend<=0)return undefined;const t=tricks[(pose.lean??1)>0?1:0];t.w=blend*blend*(3-2*blend);return t;},
  /** Gameplay 3: standing in the aisle; the rig's gait frame (Town poses the rig at gait.x, gait.z in the train frame, facing once
   *  gait.facing, then hands its yaw back through gaitYaw and puts the root back in the world). */
  get standing(){return standing;},get gait(){return gait;},set gaitYaw(y:number){if(standing&&tw<0)gaitYaw=y;},
  /** Gameplay 3: the free seats' glow (lib/graphics/trainSeatGlow.ts), the seat Sit would take (-1), Stand up / Sit for checks. */
  get glows(){return glows;},get nearSeat(){return nearSeatJ;},standUp,sitDown,
  /** Gameplay 3 debug / checks: the standing spot in the train frame (x across, u along car 0). */
  get spot(){return sp;},
  /** After Town's train update this frame: the seat, the stop events (announcement, quiz, Get off), the HUD. */
  frame(dt:number,reduced:boolean){
   if(!riding()){if(blend>0)blend=Math.max(0,blend-dt*(reduced?6:2.5));if(blend<=0)unlisten();return;}
   const run=ports.run();if(!run){getOff(true);return;}
   // Gameplay 2: the walk from the platform to the door and on into the seat (the sitting pose blends in over its last 40 %)
   if(walkT>=0){walkT=Math.min(1,walkT+dt/walkDur);const u=walkT*walkT*(3-2*walkT);run.ridden[k]=1;run.seatPose(k,j,pose);
    if(u<walkA){const q=u/walkA,dx=door.x-from.x,dz=door.z-from.z;walkPose.x=from.x+dx*q;walkPose.y=from.y+(door.y-from.y)*q;walkPose.z=from.z+dz*q;walkPose.yaw=Math.hypot(dx,dz)>.05?Math.atan2(dx,dz):door.yaw;}
    else{const q=(u-walkA)/Math.max(1e-3,1-walkA),dy=((pose.yaw-door.yaw)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;walkPose.x=door.x+(pose.x-door.x)*q;walkPose.y=door.y+(pose.y-door.y)*q;walkPose.z=door.z+(pose.z-door.z)*q;walkPose.yaw=door.yaw+dy*q;}
    blend=Math.max(blend,Math.min(1,(u-.6)/.4));ports.seat(walkPose);if(walkT>=1)walkT=-1;return;}
   run.ridden[k]=1;const st=run.states[k];
   if(standing&&run.carMatrixOf)standFrame(run,dt,reduced);
   if(!riding())return;
   if(!standing){blend=Math.min(1,blend+dt*(reduced?6:2.5));run.seatPose(k,j,pose);ports.seat(pose);}
   if(st.at!==lastAt){
    if(st.at>=0){run.seatPose(k,j,probe);anchor.x=probe.x;anchor.y=probe.y;anchor.z=probe.z;anchor.yaw=probe.yaw;quizIn=-1;setNote(arriveLine(st.at));if(view.quiz)trainRideStore.set({quiz:null});}
    else if(lastAt>=0){setNote(nextStopLine(st.next));const stop=TRAIN_STOPS[st.next],from=TRAIN_STOPS[lastAt];const run2=((stop.arrive-from.depart)%360+360)%360;quizIn=TRAIN_QUIZ&&run2>=QUIZ_MIN_RUN?QUIZ_AFTER:-1;ensureQuiz();}
    lastAt=st.at;}
   // Nov 24 2026: the quiz delay runs on the wall clock, not the summed frame dt. Town caps dt per frame, so on a slow device (or a
   // headless check at 2-4 fps) 6 s of dt took most of the run and the train reached the next stop first: the card never showed.
   // Paused frames (dt 0: map, settings, a zoomed machine) still hold it.
   {const w=wallS(),wd=lastWall<0?dt:Math.min(1,Math.max(0,w-lastWall));lastWall=w;if(quizIn>=0&&dt>0){quizIn-=Math.max(dt,wd);if(quizIn<0)askQuiz();}}
   const can=st.at>=0&&st.doors>=DOORS_OPEN&&st.dwellLeft>=GET_OFF_LEFT;if(can!==view.canGetOff)trainRideStore.set({canGetOff:can});
  },
  /** After the follow camera: the ride camera on the rider's window side (blended in and out), the look spring stepped once. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   if(!riding()&&blend<=0){if(camOn){camOn=false;orb.yaw=orb.pitch=orb.vy=0;orb.zoom=1;arm=-1;}if(fovSaved){camera.fov=fovSaved;fovSaved=0;camera.updateProjectionMatrix();}return;}
   const run=ports.run();if(!run)return;camOn=true;const h=Math.max(0,Math.min(dt,.1));
   // the free camera: keys / stick turn it at a steady rate; a flick keeps turning and slows (no inertia with reduced motion); it
   // stays where it is left; Recenter eases it home.
   if(keyYaw||keyPitch){orb.yaw=wrapPi(orb.yaw-keyYaw*ORBIT.keyYaw*h);orb.pitch=Math.max(ORBIT.pitchMin,Math.min(ORBIT.pitchMax,orb.pitch+keyPitch*ORBIT.keyPitch*h));}
   if(!dragging&&orb.vy!==0){if(reduced)orb.vy=0;else{orb.yaw=wrapPi(orb.yaw+orb.vy*h);orb.vy*=Math.exp(-ORBIT.decay*h);if(Math.abs(orb.vy)<.02)orb.vy=0;}}
   if(recentering){const q=reduced?1:1-Math.exp(-ORBIT.recenter*h);orb.yaw-=wrapPi(orb.yaw)*q;orb.pitch-=orb.pitch*q;orb.zoom+=(1-orb.zoom)*q;
    if(Math.abs(orb.yaw)<.005&&Math.abs(orb.pitch)<.005&&Math.abs(orb.zoom-1)<.005){orb.yaw=orb.pitch=0;orb.zoom=1;recentering=false;}}
   {const moved=Math.abs(orb.yaw)>ORBIT.moved||Math.abs(orb.pitch)>ORBIT.moved||Math.abs(orb.zoom-1)>ORBIT.moved;if(moved!==view.moved)trainRideStore.set({moved});}
   const kk=k>=0?k:anchor.train,s=run.states[kk].s;springTo(tight,inTunnelS(wrapS(s-12))?1:0,3,h);
   const t=trackAt(s),fx=-Math.sin(pose.yaw),fz=-Math.cos(pose.yaw),portrait=camera.aspect<1,tk=tight.x;// f: toward the aisle (Gameplay 2: the rider faces OUT of the window, so the camera outside it sees their face)
   const out=(CAM.out+(portrait?CAM.portraitOut:0))*(1-tk)+CAM.tunnelOut*tk,back=(portrait?CAM.portraitBack:CAM.back)*(1-tk)+CAM.tunnelBack*tk,up=CAM.up*(1-tk)+CAM.tunnelUp*tk;
   // the default framing (offset from the rider's head), then the free camera on top of it: in the tunnel (tk) it eases back to the
   // default and comes out again after (the orbit is kept, only its weight fades)
   const ox=-fx*out-t.tx*back,oz=-fz*out-t.tz*back,oy=up-CAM.eye,ow=1-tk,ya=orb.yaw*ow,ca=Math.cos(ya),sa=Math.sin(ya);
   const rx=ox*ca-oz*sa,rz=ox*sa+oz*ca,hl=Math.hypot(rx,rz),len=Math.hypot(hl,oy)*Math.pow(orb.zoom,ow),el=Math.max(ORBIT.pitchMin,Math.min(ORBIT.pitchMax,Math.atan2(oy,hl)+orb.pitch*ow));
   const hx0=pose.x,hy0=pose.y+CAM.eye,hz0=pose.z,ch=Math.cos(el)*len/Math.max(1e-3,hl);
   camPos.set(hx0+rx*ch,hy0+Math.sin(el)*len,hz0+rz*ch);
   {const ah=portrait?CAM.portraitAhead:CAM.ahead,inn=portrait?CAM.portraitIn*(1-tk):0,lx=t.tx*ah+fx*inn,lz=t.tz*ah+fz*inn,lk=Math.min(1,Math.pow(orb.zoom,ow));// the look turns with the orbit; close-ups centre on the rider
    camLook.set(hx0+(lx*ca-lz*sa)*lk,hy0,hz0+(lx*sa+lz*ca)*lk);}
   // Polish (Nov 24 2026, AAA audit #8): never inside a station roof, the tunnel's rock, the hill or a bridge truss. A spring arm from
   // the rider's head (trainCamClear.ts): it comes in fast (~0.07 s) when something is in the way and eases back out slowly, so the
   // camera never pops; the station boxes reach 1.5 m past the eaves so it is already in before the roof arrives.
   camCeiling(camPos.x,camPos.z,ceil);if(ceil.w>0&&camPos.y>ceil.y)camPos.y+=(ceil.y-camPos.y)*ceil.w;// beside a station house: down under the eaves first
   {const hx=pose.x,hy=pose.y+CAM.eye,hz=pose.z,f=camClearFraction(hx,hy,hz,camPos.x,camPos.y,camPos.z,ports.ground);
    arm=arm<0?f:arm+(f-arm)*(1-Math.exp(-(f<arm?14:2.5)*h));
    camPos.set(hx+(camPos.x-hx)*arm,hy+(camPos.y-hy)*arm,hz+(camPos.z-hz)*arm);camPos.y+=trussLift(camPos.x,camPos.y,camPos.z);}
   // Gameplay 3: standing, the camera comes inside: behind you along the way you last walked (the free orbit on top), a little
   // closer than the seated framing, kept inside the car's room (trainCamClear.interiorClearFraction: a slab test in car-local
   // space, the same spring arm). It eases between the two framings as you stand up and sit down.
   lastCam=camera;standCam+=((standing?1:0)-standCam)*(reduced?1:1-Math.exp(-3.5*h));if(standCam<.002)standCam=0;
   if(standing&&run.carMatrixOf){if(gaitMove>.05&&!dragging){const q=1-Math.exp(-1.6*h*gaitMove);camBase+=wrapPi(gaitYaw-camBase)*q;}camFwd=wrapPi(camBase+orb.yaw);}
   if(standCam>0&&run.carMatrixOf){
    run.carMatrixOf(kk,meCar,carM);const e=carM.elements,W=Math.atan2(e[8],e[10])+camFwd+(meCar%2?Math.PI:0),el=Math.max(.05,Math.min(1.05,.34+orb.pitch)),len=STAND_CAM.dist*orb.zoom;
    const hx=pose.x,hy=pose.y+STAND_CAM.eye,hz=pose.z,sw=Math.sin(W),cw=Math.cos(W),ce=Math.cos(el)*len;
    let cx=hx-sw*ce,cy=hy+Math.sin(el)*len,cz=hz-cw*ce;
    // into car-local space (the basis is orthonormal: dot with its axes), the room's slab test, then back along the same line
    const tx=e[12],ty=e[13],tz=e[14],lx=(a:number,b:number,c:number,i:number)=>(a-tx)*e[i]+(b-ty)*e[i+1]+(c-tz)*e[i+2];
    const f=interiorClearFraction(lx(hx,hy,hz,0),lx(hx,hy,hz,4)-CAR_FLOOR_Y,lx(hx,hy,hz,8),lx(cx,cy,cz,0),lx(cx,cy,cz,4)-CAR_FLOOR_Y,lx(cx,cy,cz,8))*.94;
    cx=hx+(cx-hx)*f;cy=hy+(cy-hy)*f;cz=hz+(cz-hz)*f;const b=standCam*standCam*(3-2*standCam);
    camPos.set(camPos.x+(cx-camPos.x)*b,camPos.y+(cy-camPos.y)*b,camPos.z+(cz-camPos.z)*b);
    camLook.set(camLook.x+(hx+sw*STAND_CAM.ahead-camLook.x)*b,camLook.y+(hy-.15-camLook.y)*b,camLook.z+(hz+cw*STAND_CAM.ahead-camLook.z)*b);}
   aimer.position.copy(camPos);aimer.up.set(0,1,0);aimer.lookAt(camLook);camQ.copy(aimer.quaternion);
   const e=blend*blend*(3-2*blend);
   if(portrait){if(!fovSaved)fovSaved=camera.fov;const f=fovSaved+(PORTRAIT_FOV-fovSaved)*e;if(Math.abs(camera.fov-f)>.01){camera.fov=f;camera.updateProjectionMatrix();}}
   else if(fovSaved){camera.fov=fovSaved;fovSaved=0;camera.updateProjectionMatrix();}
   normalPos.copy(camera.position);normalQ.copy(camera.quaternion);
   camera.position.lerpVectors(normalPos,camPos,e);camera.quaternion.slerpQuaternions(normalQ,camQ,e);camera.updateMatrixWorld();
  },
  /** Presence (multiplayer/protocol/seat.ts trainWire): the seat and where I sat at the last stop, or null when not riding. */
  wire(){return riding()?anchor:null;},
  /** Keyboard: E gets off (at a stop), Space / H sounds the horn. True when the key was the ride's. */
  key(e:{code:string;key:string;repeat:boolean;preventDefault():void},down:boolean){
   if(!riding())return false;const id=trainKeyAction(e.code,e.key);if(!id)return false;e.preventDefault();if(down&&!e.repeat)press(id,'tap');return true;},
  /** A friend took my seat at the same moment (lower member id keeps it, as in the stadium): shuffle to a free one. */
  bump(){if(!riding())return;const run=ports.run();if(!run)return;for(let s=0;s<TRAIN_SEATS;s++)if(s!==j&&!ports.taken(k,s)){j=s;anchor.seat=s;run.seatPose(k,j,pose);anchor.x=pose.x;anchor.y=pose.y;anchor.z=pose.z;anchor.yaw=pose.yaw;return;}},
  /** Tests / headless checks: station i's step-off spot level with its platform centre + du m. */
  stationSpot(i:number,du=0){return platformSpot(i,TRAIN_STATIONS[i].s+du,{x:0,y:0,z:0,yaw:0});},
  /** Debug / checks: the camera's spring-arm fraction (1: the full ride framing, less: pulled in clear of a roof / the rock). */
  get arm(){return arm;},
  /** Debug: the last Board offer's inputs. */
  get lastWant(){return lastWant;},
  finish(){getOff(true);},
  dispose(){if(riding())getOff(true);unlisten();if(typeof window!=='undefined')window.removeEventListener('keydown',onKey);trainRideStore.reset();},
 };
}
export type TrainRide=ReturnType<typeof createTrainRide>;
