/**
 * Riding the Island Line (train Phase 3, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md §5 Riding, §8 Learning).
 *  - "Board" (the island's action-prompt style, through the HUD arbiter, like the zipline tower and the stadium seats) while a train
 *    stands at the platform the player is on with its doors open. The player takes the nearest free seat (friends' seats are taken)
 *    and sits in the island's bench pose (npcSeatPose 'bench', the stadium seat's pose), facing the aisle. Input is locked; the stick
 *    and a drag look around (the zipline's ZIP_LOOK spring and soft limit).
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
import {TRAIN_COUNT,TRAIN_STOPS} from './trainSchedule';
import {TRAIN_SEATS,type SeatPose} from './trainRunning';
import {npcSeatPose} from '../graphics/npcSeatPose';
import type {TrickPose} from '../graphics/trickPose';
import {ZIP_LOOK,softLook,springTo} from './zipline';
import {camClearFraction,camCeiling,trussLift} from './trainCamClear';

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
/** The quiz comes this long (s) after the doors close, and only on a run at least QUIZ_MIN_RUN s long (every run is 45 s or more). */
export const QUIZ_AFTER=6,QUIZ_MIN_RUN=30;
/** Owner (Nov 25 2026): no between-stops quiz while riding (no card, no 2-coin reward, the quiz library is never loaded for the
 *  train). Off by this constant rather than deleted tonight (the release is frozen); the "Next stop … Did you know?" facts stay. */
export const TRAIN_QUIZ=false;
const wallS=()=>(typeof performance!=='undefined'?performance.now():Date.now())/1000;
/** Board only while the doors are this open and the train waits at least this long (s) more. */
const DOORS_OPEN=.5,BOARD_LEFT=1.5,GET_OFF_LEFT=.8;
/** The ride camera: on the rider's window side, back along the train and up (m); portrait phones a step further out. In the tunnel
 *  it comes in close (inside the tube). */
// Portrait phones (AAA audit, Nov 24 2026): the narrow view (±11° across at fov 40) looked 4 m up the line from 5 m back, so a rider
// across the aisle sat ~21° off the view axis (NDC x ≈ 2.2, off screen) and my own rider hid behind the car side. Portrait now opens
// the fov to PORTRAIT_FOV with the blend (the stadium seat's precedent; restored exactly), stands squarer to the window
// (portraitBack) and aims between me and the far bench (portraitIn, portraitAhead): me ≈5°, the far rider ≈9° off the axis (±15° fits).
const CAM={out:7.5,back:5,up:3.6,portraitOut:1.6,portraitBack:3.5,portraitAhead:1.5,portraitIn:1.15,tunnelOut:2.4,tunnelBack:2,tunnelUp:1.6,ahead:4,eye:1.25} as const;
const PORTRAIT_FOV=58;

export type TrainQuizQ={id:string;q:string;options:string[];correct:number;explain:string};
export type TrainQuiz=TrainQuizQ&{picked:number};
export type TrainRideView={riding:boolean;canGetOff:boolean;note:string;notes:number;quiz:TrainQuiz|null};
const IDLE:TrainRideView={riding:false,canGetOff:false,note:'',notes:0,quiz:null};
let view=IDLE;const listeners=new Set<()=>void>();
/** The HUD bridge (components/TrainRideHud.tsx): written only when something shown changes, never per frame. */
export const trainRideStore={
 get:()=>view,server:()=>IDLE,
 set(patch:Partial<TrainRideView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
 reset(){if(view===IDLE)return;view=IDLE;listeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
};
export type TrainActionId='getoff'|'horn';
/** The prompt's tap, the cluster's buttons and the quiz answer; the island runtime installs the real ones. */
export const trainRideActions={board:()=>{},press:(_id:TrainActionId,_phase:'tap'|'down'|'up')=>{},answer:(_i:number)=>{}};
/** The action cluster while riding (the zipline's ZIP_BUTTONS pattern): Get off (only at a stop) and the horn. */
export function trainButtons(canGetOff:boolean){
 return [{slot:'ride',key:'E',id:'getoff',label:canGetOff?'Get off here':'Get off at the next stop',icon:'trainoff',enabled:canGetOff},
  {slot:'shoot',key:'Space',id:'horn',label:'Sound the horn',icon:'horn',enabled:true}] as const;
}
export function trainKeyAction(code:string,key:string):TrainActionId|null{
 const k=key.toLowerCase();if(k==='e'||code==='Digit1')return 'getoff';if(code==='Space'||k==='h'||code==='Digit2')return 'horn';return null;
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
/** The spot on station i's platform level with track s (2.6 m from the line): where a rider steps off. */
export function platformSpot(i:number,s:number,out:{x:number;y:number;z:number;yaw:number}){
 const st=TRAIN_STATIONS[i],du=((s-st.s)%TRACK.length+TRACK.length*1.5)%TRACK.length-TRACK.length/2,u=Math.max(-STATION_HALF+1.5,Math.min(STATION_HALF-1.5,du));
 const c=trackAt(st.s+u),nx=c.tz*st.side,nz=-c.tx*st.side;out.x=c.x+nx*2.6;out.z=c.z+nz*2.6;out.y=bedAt(L.profile,st.s)+STATION_PLATFORM_Y;out.yaw=Math.atan2(nx,nz);return out;
}

type Run={states:readonly {s:number;at:number;doors:number;dwellLeft:number;next:number}[];seatPose(k:number,j:number,out:SeatPose,now?:number):SeatPose;ridden:Uint8Array};
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
 let k=-1,j=-1,blend=0,camOn=false,lastAt=-2,quizIn=-1,lastWall=-1,quizzes:TrainQuizQ[]|null=null,quizLoading=false,quizNo=0,near=-1,nearTrain=-1;
 const pose:SeatPose={x:0,y:0,z:0,yaw:0},probe:SeatPose={x:0,y:0,z:0,yaw:0},spot={x:0,y:0,z:0,yaw:0},me={x:0,z:0,h:0};
 const anchor={train:0,seat:0,x:0,y:0,z:0,yaw:0},tp={x:0,z:0,tx:1,tz:0};
 const trick:TrickPose=npcSeatPose('bench');trick.w=0;
 const lookS={x:0,v:0},tight={x:0,v:0};let stickAim=0,dragAim=0,dragging=false,dragId=-1,dragX=0,fovSaved=0,arm=-1;
 const ceil={w:0,y:0},camPos=new T.Vector3(),camLook=new T.Vector3(),aimer=new T.PerspectiveCamera(),camQ=new T.Quaternion(),normalPos=new T.Vector3(),normalQ=new T.Quaternion(),v=new T.Vector3();
 try{quizNo=Number(localStorage.getItem('fi-train-quiz'))||0;}catch{quizNo=0;}
 const riding=()=>k>=0;
 function setNote(note:string){trainRideStore.set({note,notes:view.notes+1});}
 function ensureQuiz(){if(!TRAIN_QUIZ||quizzes||quizLoading)return;quizLoading=true;ports.loadQuiz().then(q=>{quizzes=q;}).catch(()=>{quizLoading=false;});}
 function askQuiz(){if(!quizzes?.length){ensureQuiz();/* Phase 4: a failed load is asked again (ensureQuiz skips while one is loading) */if(riding()&&lastAt<0)quizIn=1;return;}/* still loading (first ride): try again in 1 s, until the next stop */const q=quizzes[quizNo%quizzes.length];quizNo++;try{localStorage.setItem('fi-train-quiz',String(quizNo));}catch{/* private mode */}
  trainRideStore.set({quiz:{...q,picked:-1}});}
 function board(){
  const run=ports.run();if(riding()||!run||near<0||nearTrain<0)return false;
  const st=run.states[nearTrain];if(st.at<0||st.doors<DOORS_OPEN||st.dwellLeft<BOARD_LEFT)return false;
  let best=-1,bd=Infinity;for(let s=0;s<TRAIN_SEATS;s++){if(ports.taken(nearTrain,s))continue;run.seatPose(nearTrain,s,probe);const d=Math.hypot(probe.x-me.x,probe.z-me.z);if(d<bd){bd=d;best=s;}}
  if(best<0){setNote('This train is full. The next one comes in 2 minutes.');return false;}
  ports.dismount?.();// on a scooter / bike / moped: on foot first, boarded in the same press
  k=nearTrain;j=best;lastAt=st.at;quizIn=-1;lastWall=-1;run.ridden[k]=1;run.seatPose(k,j,pose);
  anchor.train=k;anchor.seat=j;anchor.x=pose.x;anchor.y=pose.y;anchor.z=pose.z;anchor.yaw=pose.yaw;
  lookS.x=lookS.v=0;stickAim=dragAim=0;tight.x=inTunnelS(run.states[k].s)?1:0;tight.v=0;
  trainRideStore.set({riding:true,canGetOff:false,quiz:null});setNote(TRAIN_NOTES.board);ports.hold?.(true);ports.haptic?.();ensureQuiz();
  if(typeof window!=='undefined'&&!listening){listening=true;window.addEventListener('pointerdown',onDown,true);window.addEventListener('pointermove',onMove,true);window.addEventListener('pointerup',onUp,true);window.addEventListener('pointercancel',onUp,true);}
  return true;
 }
 /** Off the train. force: fast travel / a teleport (Town places the player); otherwise only while the doors are open at a stop. */
 function getOff(force=false){
  if(!riding())return false;const run=ports.run();const st=run?.states[k];
  if(!force){if(!run||!st||st.at<0||st.doors<DOORS_OPEN||st.dwellLeft<GET_OFF_LEFT){setNote(TRAIN_NOTES.wait);return false;}
   const si=TRAIN_STATIONS.indexOf(TRAIN_STOPS[st.at].station);platformSpot(si,trainSeatS(run),spot);ports.place(spot.x,spot.z,spot.y,spot.yaw);ports.haptic?.();}
  if(run)run.ridden[k]=0;k=-1;j=-1;quizIn=-1;ports.hold?.(false);trainRideStore.set({riding:false,canGetOff:false,quiz:null});
  if(force)blend=0;return true;
 }
 /** The track s level with my seat (the train's front minus how far back my car is). */
 function trainSeatS(run:Run){return wrapS(run.states[k].s-(j>>2)*12.4-6);}
 function press(id:TrainActionId,phase:'tap'|'down'|'up'){if(!riding()||phase==='up')return;
  if(id==='getoff')getOff(false);else if(id==='horn')ports.cue('train-horn',.9);}
 function answer(i:number){const q=view.quiz;if(!q||q.picked>=0)return;trainRideStore.set({quiz:{...q,picked:i}});if(i===q.correct)ports.pay(q.id);}
 // ---- looking around: the stick (Town's shaped stick) and a drag on the canvas, through the zipline's soft limit and spring
 let listening=false;
 function onDown(e:PointerEvent){const el=e.target as Element|null;if(!riding()||dragging||e.button>0||!el||el.tagName!=='CANVAS')return;dragging=true;dragId=e.pointerId;dragX=e.clientX;}
 function onMove(e:PointerEvent){if(!dragging||e.pointerId!==dragId)return;const w=Math.max(320,Math.min(ZIP_LOOK.dragWidth,typeof window!=='undefined'?window.innerWidth:390));
  dragAim=Math.max(-ZIP_LOOK.maxAim,Math.min(ZIP_LOOK.maxAim,dragAim+(e.clientX-dragX)*ZIP_LOOK.drag/(ZIP_LOOK.dragSpan*w)));dragX=e.clientX;}
 function onUp(e:PointerEvent){if(dragging&&e.pointerId===dragId){dragging=false;dragId=-1;}}
 function unlisten(){if(!listening||typeof window==='undefined')return;listening=false;window.removeEventListener('pointerdown',onDown,true);window.removeEventListener('pointermove',onMove,true);window.removeEventListener('pointerup',onUp,true);window.removeEventListener('pointercancel',onUp,true);}
 let promptShown=false;const lastWant={x:0,z:0,y:0,can:false,n:0};
 /** E on the platform while the Board button shows (the zipline tower's key). */
 function onKey(e:KeyboardEvent){if(e.key.toLowerCase()!=='e'||e.repeat||!promptShown||riding())return;const el=e.target as HTMLElement|null;if(el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable))return;if(board())e.preventDefault();}
 if(typeof window!=='undefined')window.addEventListener('keydown',onKey);
 return {
  get active(){return riding();},get train(){return k;},get seat(){return j;},get blend(){return blend;},
  board,getOff,press,answer,
  /** The Board offer (Town's HUD tick): standing on a platform where a train waits with its doors open. One bounded track test. */
  want(x:number,z:number,y:number,canBoard:boolean):{key:string;distance:number}|null{
   me.x=x;me.z=z;me.h=y;near=-1;nearTrain=-1;lastWant.x=x;lastWant.z=z;lastWant.y=y;lastWant.can=canBoard;lastWant.n++;if(riding()||!canBoard)return null;
   const run=ports.run();if(!run)return null;
   let quick=false;for(const st of TRAIN_STATIONS){const c=trackAt(st.s,tp);if(Math.abs(c.x-x)<STATION_HALF+8&&Math.abs(c.z-z)<STATION_HALF+8){quick=true;break;}}
   if(!quick)return null;
   const si=platformAt(x,z,y);if(si<0)return null;const stop=TRAIN_STOPS.findIndex(s=>s.station===TRAIN_STATIONS[si]);
   for(let i=0;i<TRAIN_COUNT;i++){const st=run.states[i];if(st.at===stop&&st.doors>=DOORS_OPEN&&st.dwellLeft>=BOARD_LEFT){near=si;nearTrain=i;
     const c=trackAt(TRAIN_STATIONS[si].s,tp);return {key:TRAIN_BOARD_KEY,distance:Math.max(0,Math.hypot(c.x-x,c.z-z)-3)};}}
   return null;
  },
  /** The Board button over the player's head (the stadium Sit prompt's placement). */
  prompt(el:HTMLButtonElement|null|undefined,show:boolean,camera:T.Camera,width:number,height:number,place:(el:HTMLElement,x:number,y:number)=>void,hide:(el:HTMLElement,hidden:boolean)=>void){
   if(!el)return;let hidden=!show||riding()||near<0;
   if(!hidden){v.set(me.x,me.h+2.1,me.z).project(camera);hidden=v.z< -1||v.z>1;if(!hidden)place(el,T.MathUtils.clamp((v.x+1)*width/2,90,width-90),T.MathUtils.clamp((1-v.y)*height/2-14,90,height-160));}
   hide(el,hidden);promptShown=!hidden;
  },
  /** Town's movement tick: riding locks input (the stick looks around instead). */
  holdPlayer(stickX:number){if(!riding())return false;stickAim=Math.max(-1,Math.min(1,stickX));return true;},
  /** The seated pose for the rig (blended in and out). */
  trick():TrickPose|undefined{if(blend<=0)return undefined;trick.w=blend*blend*(3-2*blend);return trick;},
  /** After Town's train update this frame: the seat, the stop events (announcement, quiz, Get off), the HUD. */
  frame(dt:number,reduced:boolean){
   if(!riding()){if(blend>0)blend=Math.max(0,blend-dt*(reduced?6:2.5));if(blend<=0)unlisten();return;}
   const run=ports.run();if(!run){getOff(true);return;}
   blend=Math.min(1,blend+dt*(reduced?6:2.5));run.ridden[k]=1;
   const st=run.states[k];run.seatPose(k,j,pose);ports.seat(pose);
   if(st.at!==lastAt){
    if(st.at>=0){anchor.x=pose.x;anchor.y=pose.y;anchor.z=pose.z;anchor.yaw=pose.yaw;quizIn=-1;setNote(arriveLine(st.at));if(view.quiz)trainRideStore.set({quiz:null});}
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
   if(!riding()&&blend<=0){if(camOn){camOn=false;lookS.x=lookS.v=0;arm=-1;}if(fovSaved){camera.fov=fovSaved;fovSaved=0;camera.updateProjectionMatrix();}return;}
   const run=ports.run();if(!run)return;camOn=true;const h=Math.max(0,Math.min(dt,.1));
   if(!dragging)dragAim*=Math.exp(-ZIP_LOOK.back*h);
   springTo(lookS,softLook(stickAim*ZIP_LOOK.stick+dragAim),(dragging?ZIP_LOOK.dragRate:stickAim!==0?ZIP_LOOK.stickRate:ZIP_LOOK.returnRate)*(reduced?ZIP_LOOK.reducedRate:1),h);
   const kk=k>=0?k:anchor.train,s=run.states[kk].s;springTo(tight,inTunnelS(wrapS(s-12))?1:0,3,h);
   const t=trackAt(s),fx=Math.sin(pose.yaw),fz=Math.cos(pose.yaw),portrait=camera.aspect<1,tk=tight.x;// f: the rider faces the aisle; the window is behind them
   const out=(CAM.out+(portrait?CAM.portraitOut:0))*(1-tk)+CAM.tunnelOut*tk,back=(portrait?CAM.portraitBack:CAM.back)*(1-tk)+CAM.tunnelBack*tk,up=CAM.up*(1-tk)+CAM.tunnelUp*tk;
   const ox=-fx*out-t.tx*back,oz=-fz*out-t.tz*back,a=-lookS.x,ca=Math.cos(a),sa=Math.sin(a);// the look orbits the camera round the rider
   camPos.set(pose.x+ox*ca-oz*sa,pose.y+up,pose.z+ox*sa+oz*ca);{const ah=portrait?CAM.portraitAhead:CAM.ahead,inn=portrait?CAM.portraitIn*(1-tk):0;camLook.set(pose.x+t.tx*ah+fx*inn,pose.y+CAM.eye,pose.z+t.tz*ah+fz*inn);}
   // Polish (Nov 24 2026, AAA audit #8): never inside a station roof, the tunnel's rock, the hill or a bridge truss. A spring arm from
   // the rider's head (trainCamClear.ts): it comes in fast (~0.07 s) when something is in the way and eases back out slowly, so the
   // camera never pops; the station boxes reach 1.5 m past the eaves so it is already in before the roof arrives.
   camCeiling(camPos.x,camPos.z,ceil);if(ceil.w>0&&camPos.y>ceil.y)camPos.y+=(ceil.y-camPos.y)*ceil.w;// beside a station house: down under the eaves first
   {const hx=pose.x,hy=pose.y+CAM.eye,hz=pose.z,f=camClearFraction(hx,hy,hz,camPos.x,camPos.y,camPos.z,ports.ground);
    arm=arm<0?f:arm+(f-arm)*(1-Math.exp(-(f<arm?14:2.5)*h));
    camPos.set(hx+(camPos.x-hx)*arm,hy+(camPos.y-hy)*arm,hz+(camPos.z-hz)*arm);camPos.y+=trussLift(camPos.x,camPos.y,camPos.z);}
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
