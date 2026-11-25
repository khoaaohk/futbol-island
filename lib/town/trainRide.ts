/**
 * Riding the Island Line (train Phase 3, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md §5 Riding, §8 Learning).
 *  - "Board" (the island's action-prompt style, through the HUD arbiter, like the zipline tower and the stadium seats) while a train
 *    stands at the platform the player is on with its doors open. The player takes the nearest free seat (friends' seats are taken)
 *    and sits in the island's bench pose (npcSeatPose 'bench', the stadium seat's pose), facing the aisle. Input is locked; the stick
 *    and a drag look around. Gameplay 2 (owner, Nov 24 2026): a FREE ride camera (orbit 360° round the rider, pitch, zoom; it stays
 *    where it is left; Recenter / a double tap eases it back; the tunnel eases it to the default and restores it after).
 *  - "Get off" (the action cluster, E) works at any stop while the doors are open; fast travel while riding gets off first (Town).
 *    "Horn" (Space / H) sounds the train's horn (the island sound kit's train-horn cue).
 *  - Learning (AGENTS.md): on leaving each stop an announcement ("Next stop: … Did you know …"). The between-stops quiz is gone
 *    (owner, Nov 25 2026: no quiz card, no quiz coins, the quiz library is never loaded for the train).
 *  - Multiplayer: wire() is what presence sends (multiplayer/protocol/seat.ts trainWire): the train, the seat and where I sat at the
 *    last stop. It changes once per stop; friends draw me in the moving seat from the shared clock.
 * Heat: off a platform the whole thing is one nearest-track test per HUD tick (trackNearest, bounded), nothing per frame; riding, one
 * seat pose (a few multiply-adds) and the camera per frame. No allocation per frame, no timers, no rAF of its own.
 */
import * as T from 'three';
import {TRAIN_STATIONS,STATION_HALF,STATION_PLATFORM_Y,TRACK,trackAt,trackNearest,wrapS,bedAt,inTunnelS,type TrainStation} from './trainTrack';
import {trainLayout} from './trainLayout';
import {TRAIN_COUNT,TRAIN_STOPS,DOOR_DELAY,DOOR_MOVE,DOOR_HOLD,LAP,TRAIN_LENGTH} from './trainSchedule';
import {TRAIN_SEATS,CAR_FLOOR_Y,SEAT_TABLE,PLAYER_SEATS,type SeatPose} from './trainRunning';
import {HALF_W,DOORS} from './trainCarModel';
import {trainRiderPose,trainStrapPose,swayStrapPose} from '../graphics/trainSeatPose';
import {toCar,fromCar,stepWalk,seatAisle,nearestFreeSeat,nearDoor,trackSOfU,WALK_IN,NEAR_SEAT,GLOW_SEAT,BAY_X,type TrainLocal} from './trainWalk';
import type {TrickPose} from '../graphics/trickPose';
import {springTo} from './zipline';
import {camClearFraction,camCeiling,trussLift} from './trainCamClear';
import {PHONE_STICK_QUERY} from './floatingStick';
import {wrapBoardNote} from './trainWraps';// WRAPS (train-wraps)

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
export const TRAIN_NOTES={board:'All aboard! Drag or use the stick to look around.',wait:'The doors open at the next stop.',closing:'Doors closing. Please stand clear.'} as const;
/** Easy exit (owner, Nov 24 2026: "it's hard to exit the train at a stop"): the big "Get off at <Station>" pill shows EXIT_EARLY s
 *  before the doors open (braking in) until they start to close; a press before they open is queued ("Doors opening…") and you step
 *  out as they open. The doors are held (the boarders' DOOR_HOLD, paid back by the runner's catch-up) for a rider at a stop, and
 *  EXIT_WARN s before they shut the chime sounds with "Doors closing". The step-out walk goes from wherever you are (seat, aisle, the
 *  other car) to the nearest open door and on onto the platform, facing away from the train, in EXIT_MIN … WALK_MAX s. */
export const EXIT_EARLY=4,EXIT_WARN=3,EXIT_MIN=.45,EXIT_IN=1.95,EXIT_OUT=1.4;
/** Gameplay 3: the walk notes; a tap within SEAT_TAP_PX px of a free seat in reach sits there (RIDE 3: no seat glow, owner shot 48). */
export const WALK_NOTES={up:'Hold on to a strap! Walk the aisle; by a free seat, tap Sit.',sit:'Walk up to a free seat, then tap Sit.'} as const;
export const SEAT_TAP_PX=56;
/** Board only while the doors are this open and the train waits at least this long (s) more. */
const DOORS_OPEN=.5,BOARD_LEFT=1.5,GET_OFF_LEFT=.8;
/** Easier boarding (owner, Nov 24 2026): the Board zone is the whole platform ± BOARD_ENDS m and up to BOARD_DEPTH m back from its
 *  edge (PLATFORM_EDGE m from the line); Board shows BOARD_EARLY s before the doors open (a train braking in) and a press then
 *  waits for them; Board walks you to the nearest open door in WALK_MAX s at most (WALK_SPEED m/s, smooth) and on into the seat. */
/** AAA 3 (Nov 25 2026, owner: "smooth boarding/alighting walks, no sliding feet"): a brisk walk (4.2 m/s, was a 7 m/s dash in under
 *  a second) so the rig's stride matches the ground it covers; still capped so a far door never makes Board feel slow. */
export const BOARD_ENDS=2,BOARD_DEPTH=4,PLATFORM_EDGE=1.45,BOARD_EARLY=4,WALK_SPEED=4.2,WALK_MIN=.45,WALK_MAX=1.3;
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
/** Gameplay 3: the standing camera inside the car: distance (× zoom), eye over the floor, how far ahead of you it looks (m).
 *  Portrait phones (final verify Nov 24 2026: the kid filled the lower half) sit a step further back and higher, looking a little further on. */
/** The Inside view, RIDE 3 (owner, Nov 24 2026: first person): your own eyes, `eye` m over the car floor at your standing spot, no
 *  cutaway (roof and both walls stay). Drag (or the right side) turns it all the way round and `pitch` rad up / down; the stick /
 *  WASD walk the way you look (the aisle, door bays and gangway: trainWalk.ts). Your body is not drawn (the near-camera fade). Wider
 *  `fov` (portrait `portraitFov`) inside a 2.4 m car; it eases in and out with the view change. */
/** AAA 2: first person turn rate on ← / → (rad/s). */
export const FP_KEY_TURN=2.2;
export const FP={eye:1.36,pitch:1.05,fov:68,portraitFov:76,look:4,near:.16} as const;
/** (The island camera's near plane is 1 m: in first person the cab partition, a bench end or a door post 0.3-1 m away was cut open,
 *  so while the Inside view is on the near plane is FP.near m; it is put back the moment the view changes or you get off.) */
/** The ride's camera views (owner, Nov 24 2026), in the order the camera button cycles them. */
export const TRAIN_VIEWS=['seat','driver','front','back','left','right','above','inside'] as const;
/** AAA 2 (owner, Nov 24 2026: "a camera view in front of the train, facing forward, from the conductor's point of view, with no
 *  conductor"): the Driver's view. The eye in the leading cab (car 0's +z end: the line runs one way round, so it always faces where
 *  the train is going), driver's height, a little back from the windscreen so its frame, the wipers and the desk's top edge show;
 *  locked to this frame's car matrix (no smoothing, no bob); a small look round (±35° / ±15°) that eases back when let go. Kenji is
 *  hidden in it (his warnings come as the ride's note). */
// POLISH 3 (owner shot 67: "remove the wipers, the divider and the bottom piece, just the view of the train moving forward"): the eye
// is 0.35 m AHEAD of the windscreen (cab face z 6.0, wipers 6.02), so no cab part is in frame even at the full ±35° / ±15° look
// (the cab sides are > 100° off the look; the coupler and skirt far below the lowest pitch); it stays locked to car 0's matrix.
export const DRIVER={x:0,eye:1.5,z:6.35,look:20,down:.05,yaw:.61,pitch:.26,fov:62,portraitFov:78,back:2.5} as const;
export type TrainView=typeof TRAIN_VIEWS[number];
export const TRAIN_VIEW_LABEL:Record<TrainView,string>={seat:'Seat view',front:'Front view',back:'Back view',left:'Left side',right:'Right side',above:'From above',inside:'Inside view',driver:"Driver's view"};
/** The outside views: the look point (m behind the train's nose, height over the rail bed), the camera's bearing from it (rad: 0 ahead
 *  of the train, π behind, +π/2 on its left), elevation (rad), distance (m; portrait × `portrait`), how far the orbit turns either way
 *  (rad) and the zoom range. The side shots fit the whole train (24.4 m) with scenery round it. */
// RIDE 3: a portrait phone's side shot (28° across) cannot fit the 24.4 m train square on without going tiny: the sides there
// look from a three-quarter bearing behind the train (`pAz`), so the whole train fits (check-train-aaa framing).
export const OUTSIDE:Record<'front'|'back'|'left'|'right'|'above',{at:number;lh:number;az:number;pAz?:number;el:number;dist:number;portrait:number;yaw:number;zMin:number;zMax:number}>={
 front:{at:4.5,lh:2.4,az:0,el:.26,dist:13,portrait:1.15,yaw:1.25,zMin:.55,zMax:1.8},
 back:{at:TRAIN_LENGTH-4.5,lh:2.4,az:Math.PI,el:.26,dist:13,portrait:1.15,yaw:1.25,zMin:.55,zMax:1.8},
 left:{at:TRAIN_LENGTH/2,lh:2.2,az:Math.PI/2,pAz:Math.PI-.62,el:.2,dist:24,portrait:1.6,yaw:1.2,zMin:.5,zMax:1.6},
 right:{at:TRAIN_LENGTH/2,lh:2.2,az:-Math.PI/2,pAz:.62-Math.PI,el:.2,dist:24,portrait:1.6,yaw:1.2,zMin:.5,zMax:1.6},
 above:{at:TRAIN_LENGTH/2,lh:1.5,az:Math.PI,el:1.32,dist:44,portrait:1.3,yaw:Math.PI,zMin:.5,zMax:1.5}};
/** RIDE 3 (owner, Nov 24 2026: "camera angles don't have the train and only show the riders"): in the Summit tunnel the outside
 *  views have no outside: the rock pulled their spring arm in to the train's centre line, inside the car. While any part of the
 *  train is in the tube they ease (TUBE.rate /s) to a shot along the tube: Front from `ahead` m before the nose looking back at the
 *  cab; Back, the sides and From above from `behind` m after the tail looking up the train over its roof. */
export const TUBE={ahead:7.5,aheadUp:3.4,behind:7.5,behindUp:4.3,lookIn:4,lookUp:2.3,rate:3} as const;
/** RIDE 3: switching views eases over VIEW_EASE s (smootherstep; reduced motion VIEW_EASE_REDUCED s): round an eased look point
 *  (bearing the shortest way, elevation and log distance), all relative to the moving train (its nose and heading), lifted over
 *  station roofs / the hill when the swing would pass through them (trainCamClear), the field of view eased with it. Getting off
 *  eases back to the follow camera over EXIT_EASE s. */
export const VIEW_EASE=1.05,VIEW_EASE_REDUCED=.25,EXIT_EASE=1;
const smoother=(t:number)=>t*t*t*(t*(t*6-15)+10);
/** Near-camera fade (owner, Nov 24 2026): a body within FADE_NEAR m of the camera is hidden, shown again past FADE_FAR m. */
export const FADE_NEAR=.75,FADE_FAR=1.1;
/** The camera's distance (m) to a body standing or sitting with its root at x, y, z (the axis from lo to hi m over the root). */
export function bodyDist(cx:number,cy:number,cz:number,x:number,y:number,z:number,lo=.25,hi=1.35){const yy=Math.max(y+lo,Math.min(y+hi,cy));return Math.hypot(cx-x,cy-yy,cz-z);}
/** Hidden this frame? (hysteresis: hidden under FADE_NEAR, shown again past FADE_FAR) */
export const nearHide=(was:boolean,d:number)=>was?d<FADE_FAR:d<FADE_NEAR;
/** The free ride camera (Gameplay 2): elevation limits (rad: a little under the horizontal … ~60° down), zoom (× the default
 *  distance: window close-up … wide), drag and key / stick rates, inertia decay (none with reduced motion), the Recenter ease. */
export const ORBIT={pitchMin:-.09,pitchMax:1.05,zoomMin:.38,zoomMax:2.6,drag:5.2,keyYaw:1.9,keyPitch:1.1,wheel:.0016,decay:4.5,recenter:4,tap2:.32,tapPx:30,moved:.06} as const;
const wrapPi=(a:number)=>((a%(Math.PI*2))+Math.PI*3)%(Math.PI*2)-Math.PI;

export type TrainRideView={riding:boolean;canGetOff:boolean;note:string;notes:number;/** the free camera is off its default (Recenter enabled) */moved:boolean;
 /** Easy exit: the station the Get off pill names ('' : no pill), a press waiting for the doors, the doors-closing warning */exitTo:string;exitQueued:boolean;closing:boolean;
 /** The camera view and a counter bumped on every change (the HUD's "Front view" toast) */camView:TrainView;viewNo:number;
 /** Gameplay 3: standing in the aisle; a free seat within reach (Sit); by a door bay (Get off becomes the primary at a stop) */standing:boolean;nearSeat:boolean;nearDoor:boolean};
const IDLE:TrainRideView={riding:false,canGetOff:false,note:'',notes:0,moved:false,standing:false,nearSeat:false,nearDoor:false,exitTo:'',exitQueued:false,closing:false,camView:'seat',viewNo:0};
let view=IDLE;const listeners=new Set<()=>void>();
/** The HUD bridge (components/TrainRideHud.tsx): written only when something shown changes, never per frame. */
export const trainRideStore={
 get:()=>view,server:()=>IDLE,
 set(patch:Partial<TrainRideView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
 reset(){if(view===IDLE)return;view=IDLE;listeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
};
export type TrainActionId='getoff'|'horn'|'recenter'|'walk'|'camera';
/** The prompt's tap, the cluster's buttons and the camera view menu; the island runtime installs the real ones. */
export const trainRideActions={board:()=>{},press:(_id:TrainActionId,_phase:'tap'|'down'|'up')=>{},view:(_v:TrainView)=>{}};
/** The action cluster while riding (the zipline's ZIP_BUTTONS pattern): Get off (only at a stop), the horn, Recenter and (Gameplay 3)
 *  Walk / Sit (the 'extra' slot, key Q). Standing by a door bay at a stop with the doors open, Get off becomes the primary button. */
export function trainButtons(canGetOff:boolean,moved=false,standing=false,nearSeat=false,nearDoor=false,exitTo=''){
 // AAA 2 (owner shot 52, Nov 24 2026): no Get off button in the cluster: the "Get off at <station>" pill (TrainRideHud), E / Enter
 // and walking out of an open door in first person get you off. The cluster: Recenter | Map over Walk-or-Sit | Horn (globals.css).
 void canGetOff;void nearDoor;void exitTo;
 return [{slot:'shoot',key:'Space',id:'horn',label:'Sound the horn',icon:'horn',enabled:true},
  {slot:'juggle',key:'R',id:'recenter',label:'Recenter the camera',icon:'recenter',enabled:moved},
  {slot:'extra',key:'Q',id:'walk',label:!standing?'Walk around inside (Inside view)':nearSeat?'Sit in this seat':'Walk up to a free seat to sit',icon:standing?'sit':'walk',enabled:!standing||nearSeat}] as const;
}
export function trainKeyAction(code:string,key:string):TrainActionId|null{
 const k=key.toLowerCase();if(k==='e'||k==='enter'||code==='Digit1')return 'getoff';if(code==='Space'||k==='h'||code==='Digit2')return 'horn';if(k==='r'||code==='Digit3')return 'recenter';if(k==='q'||code==='Digit4')return 'walk';if(k==='c')return 'camera';return null;
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
/** Where a station pin on the travel map lands you (AAA 3, Nov 25 2026; live audit: the old spot, u +6, was 3.0 m from the drink
 *  machine's walk-up spot, inside its 3.2 m "Go" reach, so a click right after landing could open the machine and zoom the camera
 *  onto it): u −2 along the platform, by the house's window, more than 5 m from every station machine's front (tests/train-aaa3.cjs),
 *  clear of the islanders (u −6.2, −9), the boards (u 9.5, −12.5) and the platform edge. */
export const STATION_ARRIVAL_DU=-2;
export function platformSpot(i:number,s:number,out:{x:number;y:number;z:number;yaw:number}){
 const st=TRAIN_STATIONS[i],du=((s-st.s)%TRACK.length+TRACK.length*1.5)%TRACK.length-TRACK.length/2,u=Math.max(-STATION_HALF+1.5,Math.min(STATION_HALF-1.5,du));
 const c=trackAt(st.s+u),nx=c.tz*st.side,nz=-c.tx*st.side;out.x=c.x+nx*2.6;out.z=c.z+nz*2.6;out.y=bedAt(L.profile,st.s)+STATION_PLATFORM_Y;out.yaw=Math.atan2(nx,nz);return out;
}

type DoorSpot={x:number;y:number;z:number;yaw:number;car:number;door:number};
type Run={states:readonly {s:number;at:number;doors:number;dwellLeft:number;next:number;t:number}[];seatPose(k:number,j:number,out:SeatPose,now?:number):SeatPose;ridden:Uint8Array;
 /** The local runner (door hold for a rider: how long train i's doors have been held at this stop). */runner?:{doorHeldFor(i:number):number};
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
 /** Camera / shadow fit hold while riding (the zipline's). */
 hold?:(on:boolean)=>void;
 /** Boarding from the scooter / bike / moped: switch to walking first (Town's travel-mode switch, the vehicle stowed as R does). */
 dismount?:()=>void;
 /** Ground height (Town: fieldSurfaceHeight, Summit Isle's hill and cutting): the ride camera stays above it. */
 ground?:(x:number,z:number)=>number;
};
export function createTrainRide(ports:Ports){
 let k=-1,j=-1,blend=0,camOn=false,lastAt=-2,queued=-1,hoverK=-1,ready=false,walkT=-1,walkDur=0,walkA=0,near=-1,nearTrain=-1;
 const pose:SeatPose={x:0,y:0,z:0,yaw:0},probe:SeatPose={x:0,y:0,z:0,yaw:0},spot={x:0,y:0,z:0,yaw:0},me={x:0,z:0,h:0};
 const anchor={train:0,seat:0,x:0,y:0,z:0,yaw:0,standing:false,u:0,sx:0,face:0}/* presence (seat.ts): standing → the train-frame spot and facing */,tp={x:0,z:0,tx:1,tz:0};
 const door:DoorSpot={x:0,y:0,z:0,yaw:0,car:0,door:0},from={x:0,y:0,z:0},walkPose:SeatPose={x:0,y:0,z:0,yaw:0};
 // Gameplay 2: riders kneel up on the bench facing out of their window, turned a little toward the way the train runs
 const tricks:[TrickPose,TrickPose]=[trainRiderPose(-1),trainRiderPose(1)];tricks[0].w=tricks[1].w=0;
 const tight={x:0,v:0};let dragging=false,dragId=-1,dragX=0,dragY=0,dragT=0,fovSaved=0,arm=-1;
 // the free camera: yaw round the rider (unlimited), added elevation, zoom; yaw inertia; key / stick input; pinch; double tap
 const orb={yaw:0,pitch:0,zoom:1,vy:0};let keyYaw=0,keyPitch=0,recentering=false,pinchId=-1,pinchX=0,pinchY=0,pinchD=0,pinchZ=1,tapT=-1,tapX=0,tapY=0;
 const ceil={w:0,y:0},camPos=new T.Vector3(),camLook=new T.Vector3(),aimer=new T.PerspectiveCamera(),camQ=new T.Quaternion(),normalPos=new T.Vector3(),normalQ=new T.Quaternion(),v=new T.Vector3();
 // Gameplay 3: standing in the aisle. sp = the train-frame spot (trainWalk.ts: x across, u along car 0), moved by the stick / WASD
 // relative to the camera; tw = the stand-up / sit-down ease (twSit: the seat being sat in, -1 standing up); the strap pose fades in
 // when you stop; gait = the frame Town poses the rig in (the rig walks in the train, then is put back in the world).
 let standing=false,tw=-1,twDur=.35,twSit=-1,strapW=0,gaitYaw=0,gaitMove=0,camBase=0,camFwd=0,nearSeatJ=-1,lean=0,lastCam:T.Camera|null=null,meCar=0;
 const sp={x:0,u:0},twFrom={x:0,u:0},twTo={x:0,u:0},mv={x:0,z:0},carL:TrainLocal={car:0,x:0,z:0},carM=new T.Matrix4(),pv=new T.Vector3(),aisle={x:0,z:0},gp:SeatPose={x:0,y:0,z:0,yaw:0};
 const straps:[TrickPose,TrickPose]=[trainStrapPose(-1),trainStrapPose(1)];
 const gait={on:false,x:0,z:0,facing:NaN};
 /** Free player seats near the standing rider: world spot (on the cushion) and reach 0 … 1 (a tap near one sits; nothing is drawn). */
 const glows=Array.from({length:TRAIN_SEATS},()=>({x:0,y:0,z:0,yaw:0,w:0}));
 // Easy exit (owner, Nov 24 2026): exitQ a press waiting for the doors; exitT the step-out walk (0 … 1, -1: none) along ex[0] (where
 // you are) → ex[1] (the aisle by the door) → ex[2] (the doorway, on the platform) → ex[3] (out on the platform), exL the legs (m).
 let exitQ=false,exitT=-1,exitDur=0,exitYaw=0,warnedAt=-2;
 const ex=[{x:0,y:0,z:0},{x:0,y:0,z:0},{x:0,y:0,z:0},{x:0,y:0,z:0}],exL=[0,0,0];
 // Camera views (owner, Nov 24 2026): the view, the ease from the last frame's camera (snap: train-relative position, its rotation;
 // viewT 0 … 1), the last applied pose and the train nose it was relative to; the Inside view's follow point (train frame) and side
 // (+1: the camera on the train frame's +x side); the outside / inside views' spring arms.
 let tubeW=0,camView:TrainView='seat',viewT=1,lift=0,liftWant=0,liftIn=0,liftSnap=true,refX=0,refZ=0,refTx=1,refTz=0,armO=-1,havePose=false,lastFov=0,fovFrom=0,outT=1,outFov=0,swingLift=0,nearSaved=0;
 const snapP=new T.Vector3(),snapL=new T.Vector3(),lastP=new T.Vector3(),lastL=new T.Vector3(),lastQ=new T.Quaternion(),outP=new T.Vector3(),outQ=new T.Quaternion(),fromP=new T.Vector3(),fromL=new T.Vector3(),o1=new T.Vector3(),o2=new T.Vector3(),carL2:TrainLocal={car:0,x:0,z:0},carM2=new T.Matrix4(),pv2=new T.Vector3(),tpo={x:0,z:0,tx:1,tz:0},tpn={x:0,z:0,tx:1,tz:0},tpc={x:0,z:0,tx:1,tz:0},ceil2={w:0,y:0},pr=[0,0];
 const riding=()=>k>=0;
 function setNote(note:string){trainRideStore.set({note,notes:view.notes+1});}
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
  queued=-1;k=nearTrain;j=best;anchor.standing=false;run.seatPose(k,j,probe);standing=false;tw=-1;gait.on=false;
  // the walk: me → the door → the seat, WALK_SPEED m/s, WALK_MIN … WALK_MAX s in all (eased, so it starts and ends soft)
  from.x=me.x;from.y=me.h;from.z=me.z;if(!ds){door.x=me.x;door.z=me.z;door.y=me.h;door.yaw=probe.yaw;}
  {const a=Math.hypot(door.x-from.x,door.z-from.z),b=Math.hypot(probe.x-door.x,probe.z-door.z);walkA=a/Math.max(.01,a+b);walkDur=Math.max(WALK_MIN,Math.min(WALK_MAX,(a+b)/WALK_SPEED));walkT=0;}lastAt=st.at;run.ridden[k]=1;run.seatPose(k,j,pose);
  anchor.train=k;anchor.seat=j;anchor.x=pose.x;anchor.y=pose.y;anchor.z=pose.z;anchor.yaw=pose.yaw;
  orb.yaw=orb.pitch=orb.vy=0;orb.zoom=1;recentering=false;keyYaw=keyPitch=0;tight.x=inTunnelS(run.states[k].s)?1:0;tight.v=0;camView='seat';viewT=1;havePose=false;armO=-1;outT=1;
  trainRideStore.set({riding:true,canGetOff:false,camView:'seat'});setNote(wrapBoardNote(k,TRAIN_NOTES.board)/* WRAPS: the train's kindness theme, once a theme */);ports.hold?.(true);ports.haptic?.();
  if(typeof window!=='undefined'&&!listening){listening=true;window.addEventListener('pointerdown',onDown,true);window.addEventListener('pointermove',onMove,true);window.addEventListener('pointerup',onUp,true);window.addEventListener('pointercancel',onUp,true);window.addEventListener('wheel',onWheel,{capture:true,passive:true});}
  return true;
 }
 /** POLISH 4 (owner shot 69): walking (or riding: stowed) through an open door from the platform boards you STANDING in that door's bay,
  *  first person (Inside), easing in from the doorway; the free seat nearest you is still yours (presence, Sit). trainRunning reports
  *  the doorway (its solid-car test lets you into an open one on the platform side). */
 function walkIn(kk:number,car:number,d:number){
  const run=ports.run();if(riding()||!run?.carMatrixOf||kk<0||kk>=TRAIN_COUNT)return false;const st=run.states[kk];
  if(st.at<0||st.doors<DOORS_OPEN||st.dwellLeft<BOARD_LEFT||d<0||d>=DOORS.length)return false;
  let best=-1,bd=Infinity;for(let s=0;s<TRAIN_SEATS;s++){if(ports.taken(kk,s))continue;run.seatPose(kk,s,probe);const dd=Math.hypot(probe.x-me.x,probe.z-me.z);if(dd<bd){bd=dd;best=s;}}
  if(best<0){setNote('This train is full. The next one comes in 2 minutes.');return false;}
  ports.dismount?.();queued=-1;k=kk;j=best;walkT=-1;lastAt=st.at;run.ridden[k]=1;run.seatPose(k,j,pose);
  anchor.train=k;anchor.seat=j;anchor.x=pose.x;anchor.y=pose.y;anchor.z=pose.z;anchor.yaw=pose.yaw;anchor.standing=true;
  const sx=TRAIN_STOPS[st.at].station.side*(car%2===1?-1:1);
  fromCar(car,sx*HALF_W,DOORS[d],aisle);twFrom.x=aisle.x;twFrom.u=aisle.z;fromCar(car,sx*(BAY_X-.35),DOORS[d],aisle);twTo.x=aisle.x;twTo.u=aisle.z;sp.x=twFrom.x;sp.u=twFrom.u;
  standing=true;twSit=-1;tw=0;twDur=.45;strapW=0;mv.x=mv.z=0;gaitMove=0;gaitYaw=0;gait.facing=gaitYaw;camBase=0;
  orb.yaw=orb.pitch=orb.vy=0;orb.zoom=1;recentering=false;keyYaw=keyPitch=0;tight.x=inTunnelS(st.s)?1:0;tight.v=0;camView='inside';viewT=1;havePose=false;armO=-1;outT=1;
  trainRideStore.set({riding:true,canGetOff:false,camView:'inside',standing:true,nearSeat:false,nearDoor:false});setNote(wrapBoardNote(k,TRAIN_NOTES.board));ports.hold?.(true);ports.haptic?.();
  if(typeof window!=='undefined'&&!listening){listening=true;window.addEventListener('pointerdown',onDown,true);window.addEventListener('pointermove',onMove,true);window.addEventListener('pointerup',onUp,true);window.addEventListener('pointercancel',onUp,true);window.addEventListener('wheel',onWheel,{capture:true,passive:true});}
  return true;
 }
 /** Off the train. force: fast travel / a teleport (Town places the player); otherwise only while the doors are open at a stop. */
 function getOff(force=false){
  if(!riding())return false;const run=ports.run();const st=run?.states[k];
  if(!force){if(!run||!st||!doorsOpen(st)){setNote(TRAIN_NOTES.wait);return false;}
   const si=TRAIN_STATIONS.indexOf(TRAIN_STOPS[st.at].station);platformSpot(si,standing?wrapS(trackSOfU(st.s,sp.u)):trainSeatS(run),spot);ports.place(spot.x,spot.z,spot.y,spot.yaw);ports.haptic?.();}
  leave(run);if(force){blend=0;outT=1;}return true;
 }
 function leave(run:Run|null){
  if(run){run.ridden[k]=0;}k=-1;j=-1;walkT=-1;ports.hold?.(false);standing=false;tw=-1;gait.on=false;strapW=0;for(const g of glows)g.w=0;exitQ=false;exitT=-1;warnedAt=-2;
  trainRideStore.set({riding:false,canGetOff:false,standing:false,nearSeat:false,nearDoor:false,exitTo:'',exitQueued:false,closing:false});
  // RIDE 3: the camera eases from where it was back to the follow camera (applyCamera), the seat blend is done
  if(havePose){outT=0;outP.copy(lastP);outQ.copy(lastQ);outFov=lastFov;}blend=0;
 }
 const doorsOpen=(st:Run['states'][number])=>st.at>=0&&st.doors>=DOORS_OPEN&&st.dwellLeft>=GET_OFF_LEFT;
 /** Easy exit: the Get off pill shows from EXIT_EARLY s before the doors open (braking in) until they start to close. */
 const exitOffer=(st:Run['states'][number])=>st.at>=0?st.dwellLeft>=DOOR_DELAY+DOOR_MOVE*DOORS_OPEN:boardIn(st,st.next)<=EXIT_EARLY;
 /** Get off (the pill, the cluster, E / Enter): at once when the doors are open, queued while the train brakes in. */
 function requestExit(){
  if(!riding()||walkT>=0)return false;if(exitT>=0)return true;const run=ports.run(),st=run?.states[k];if(!run||!st)return false;
  if(doorsOpen(st))return startExit(run);
  if(exitOffer(st)){if(!exitQ){exitQ=true;trainRideStore.set({exitQueued:true});ports.haptic?.();}return true;}
  setNote(TRAIN_NOTES.wait);return false;
 }
 /** The step-out walk: from wherever you are to the nearest open door (in its aisle bay), through it and onto the platform. */
 function startExit(run:Run){
  const ds=run.doorSpot?.(k,pose.x,pose.z,door)??null;if(!ds)return getOff(false);// no door data (tests): straight onto the platform
  const ix=Math.sin(door.yaw),iz=Math.cos(door.yaw);// door.yaw faces into the car
  ex[0].x=pose.x;ex[0].y=pose.y;ex[0].z=pose.z;ex[1].x=door.x+ix*EXIT_IN;ex[1].y=pose.y;ex[1].z=door.z+iz*EXIT_IN;
  ex[2].x=door.x;ex[2].y=door.y;ex[2].z=door.z;ex[3].x=door.x-ix*EXIT_OUT;ex[3].y=door.y;ex[3].z=door.z-iz*EXIT_OUT;
  let len=0;for(let i=0;i<3;i++){exL[i]=Math.hypot(ex[i+1].x-ex[i].x,ex[i+1].z-ex[i].z);len+=exL[i];}
  exitDur=Math.max(EXIT_MIN,Math.min(WALK_MAX,len/WALK_SPEED));exitT=0;exitQ=false;exitYaw=door.yaw+Math.PI;
  if(standing){standing=false;tw=-1;twSit=-1;gait.on=false;strapW=0;for(const g of glows)g.w=0;}
  trainRideStore.set({exitTo:'',exitQueued:false,standing:false,nearSeat:false,nearDoor:false});ports.haptic?.();return true;
 }
 /** One step-out frame (eased; the kneel fades at once); on the platform at the end, or at once if the train is leaving. */
 function exitFrame(run:Run,dt:number){
  exitT=Math.min(1,exitT+dt/exitDur);const u=exitT*exitT*(3-2*exitT);let d=u*(exL[0]+exL[1]+exL[2]),i=0;while(i<2&&d>exL[i]){d-=exL[i];i++;}
  const a=ex[i],b=ex[i+1],q=exL[i]>1e-4?Math.min(1,d/exL[i]):1,dx=b.x-a.x,dz=b.z-a.z;
  walkPose.x=a.x+dx*q;walkPose.y=a.y+(b.y-a.y)*q;walkPose.z=a.z+dz*q;walkPose.yaw=i<2&&Math.hypot(dx,dz)>.05?Math.atan2(dx,dz):exitYaw;
  blend=Math.max(0,blend-dt*8);
  if(exitT>=1||run.states[k].at<0){ports.place(ex[3].x,ex[3].z,ex[3].y,exitYaw);leave(run);return;}
  ports.seat(walkPose);
 }
 /** The track s level with my seat (the train's front minus how far back my car is). */
 function trainSeatS(run:Run){return wrapS(run.states[k].s-(j>>2)*12.4-6);}
 /** The camera's ease starts from wherever it is now (train-relative), over VIEW_EASE s. */
 function snapshot(){if(!havePose){viewT=1;return;}toTrain(lastP,snapP);toTrain(lastL,snapL);fovFrom=lastFov;viewT=0;swingLift=0;}
 /** World point ⇄ the train's frame (along its heading at the nose, across, height): a view change eases in this frame. */
 function toTrain(w:T.Vector3,out:T.Vector3){const dx=w.x-refX,dz=w.z-refZ;return out.set(dx*refTx+dz*refTz,w.y,dx*refTz-dz*refTx);}
 function fromTrain(t:T.Vector3,out:T.Vector3){return out.set(refX+t.x*refTx+t.z*refTz,t.y,refZ+t.x*refTz-t.z*refTx);}
 function viewChanged(v:TrainView){if(v===camView)return;snapshot();camView=v;lift=liftWant=liftIn=0;liftSnap=true;orb.yaw=orb.pitch=orb.vy=0;orb.zoom=1;recentering=false;keyYaw=keyPitch=0;armO=-1;trainRideStore.set({camView:v,viewNo:view.viewNo+1});}
 /** Pick a camera view: Inside stands you up in the aisle (the cutaway); any other view sits you back down (your seat if it is still
  *  free, else the nearest free one). False while that cannot happen (walking aboard, stepping off, no free seat). */
 function setView(v:TrainView){
  // POLISH 3 (phone first person): Inside while still walking over to sit (a long aisle walk is up to 1.4 s) stays on your feet
  // instead of being refused (the press did nothing and the next W / stick walk sat still in the seat view)
  if(riding()&&walkT<0&&exitT<0&&tw>=0&&twSit>=0&&v==='inside'){twSit=-1;tw=-1;viewChanged('inside');trainRideStore.set({standing:true});return true;}
  if(!riding()||walkT>=0||exitT>=0||tw>=0)return false;if(v===camView&&(v==='inside')===standing)return true;
  if(v==='inside'){if(!standing&&!standUp())return false;viewChanged('inside');return true;}
  if(standing){const jj=!ports.taken(k,j)?j:nearestFreeSeat(sp.x,sp.u,99,s=>ports.taken(k,s));if(jj<0||!sitDown(jj))return false;}
  viewChanged(v);return true;
 }
 function cycleView(){const i=TRAIN_VIEWS.indexOf(camView);for(let n=1;n<TRAIN_VIEWS.length;n++)if(setView(TRAIN_VIEWS[(i+n)%TRAIN_VIEWS.length]))return true;return false;}
 /** The orbit's elevation range (added to the view's default), zoom range and turn limit (rad either way; ≥ π: free) for this view. */
 function pitchRange(){if(camView==='driver'){pr[0]=-DRIVER.pitch;pr[1]=DRIVER.pitch;}else if(camView==='inside'){pr[0]=-FP.pitch;pr[1]=FP.pitch;}else if(camView==='seat'){pr[0]=ORBIT.pitchMin;pr[1]=ORBIT.pitchMax;}else{const o=OUTSIDE[camView];pr[0]=.06-o.el;pr[1]=1.45-o.el;}return pr;}
 function zoomRange(){if(camView==='inside'||camView==='driver'){pr[0]=pr[1]=1;}else if(camView==='seat'){pr[0]=ORBIT.zoomMin;pr[1]=ORBIT.zoomMax;}else{const o=OUTSIDE[camView];pr[0]=o.zMin;pr[1]=o.zMax;}return pr;}
 const yawLimit=()=>camView==='inside'||camView==='seat'?Math.PI:camView==='driver'?DRIVER.yaw:OUTSIDE[camView].yaw;
 function clampYaw(){const l=yawLimit();if(l<Math.PI&&Math.abs(orb.yaw)>l){orb.yaw=Math.sign(orb.yaw)*l;orb.vy=0;}}
 function setPitch(p:number){const r=pitchRange();orb.pitch=Math.max(r[0],Math.min(r[1],p));}
 function setZoom(z:number){const r=zoomRange();orb.zoom=Math.max(r[0],Math.min(r[1],z));}
 function press(id:TrainActionId,phase:'tap'|'down'|'up'){if(!riding()||phase==='up')return;
  if(id==='getoff')requestExit();else if(id==='horn')ports.cue('train-horn',.9);else if(id==='recenter')recenter();else if(id==='camera')cycleView();
  else if(id==='walk'){if(!standing)setView('inside');else if(nearSeatJ>=0)sitDown(nearSeatJ);else setNote(WALK_NOTES.sit);}}
 /** Gameplay 3: up from the seat into the aisle in front of it (a short ease; the kneel fades out). */
 function standUp(){
  const run=ports.run();if(!riding()||standing||walkT>=0||!run?.carMatrixOf)return false;
  const seat=SEAT_TABLE[PLAYER_SEATS[j]];fromCar(seat.car,seat.x,seat.z,aisle);twFrom.x=aisle.x;twFrom.u=aisle.z;seatAisle(j,aisle);twTo.x=aisle.x;twTo.u=aisle.z;sp.x=twFrom.x;sp.u=twFrom.u;
  standing=true;twSit=-1;tw=0;twDur=.35;strapW=0;mv.x=mv.z=0;gaitMove=0;
  // RIDE 3: first person: you step into the aisle and look along the car toward the cab (train frame +u); the body turns that way
  gaitYaw=0;gait.facing=gaitYaw;camBase=0;
  trainRideStore.set({standing:true,nearSeat:false,nearDoor:false});setNote(WALK_NOTES.up);ports.haptic?.();viewChanged('inside');return true;
 }
 /** Gameplay 3: into free player seat jj (eased from where you stand; the kneel blends in). Presence sends the new seat. */
 function sitDown(jj:number){
  if(!standing||tw>=0||jj<0||jj>=TRAIN_SEATS||ports.taken(k,jj))return false;
  const seat=SEAT_TABLE[PLAYER_SEATS[jj]];twFrom.x=sp.x;twFrom.u=sp.u;fromCar(seat.car,seat.x,seat.z,aisle);twTo.x=aisle.x;twTo.u=aisle.z;
  twSit=jj;tw=0;twDur=Math.max(.35,Math.min(1.4,Math.hypot(twTo.x-twFrom.x,twTo.u-twFrom.u)/WALK_IN));ports.haptic?.();return true;
 }
 function finishSit(run:Run){
  standing=false;gait.on=false;j=twSit;twSit=-1;tw=-1;strapW=0;for(const g of glows)g.w=0;anchor.standing=false;
  run.seatPose(k,j,pose);anchor.seat=j;anchor.x=pose.x;anchor.y=pose.y;anchor.z=pose.z;anchor.yaw=pose.yaw;// presence: the new seat code
  trainRideStore.set({standing:false,nearSeat:false,nearDoor:false});if(camView==='inside')viewChanged('seat');
 }
 /** Gameplay 3, every standing frame: the walk (camera-relative), the world spot from the car's matrix, the strap pose and its curve
  *  sway, the seats that glow, the Sit / Get off offers. A few multiply-adds and up to 8 seat poses; no allocation. */
 function standFrame(run:Run,dt:number,reduced:boolean){
  const h=Math.max(0,Math.min(dt,.1)),u0=sp.u,x0=sp.x;
  if(tw>=0){tw=Math.min(1,tw+h/twDur);const e=tw*tw*(3-2*tw);sp.x=twFrom.x+(twTo.x-twFrom.x)*e;sp.u=twFrom.u+(twTo.u-twFrom.u)*e;blend=twSit>=0?Math.max(0,(e-.55)/.45):Math.min(blend,1-e);
   if(tw>=1){if(twSit>=0){finishSit(run);return;}tw=-1;}}
  else{blend=Math.max(0,blend-h*6);const m=Math.hypot(mv.x,mv.z);
   if(m>.05){const sc=WALK_IN*Math.min(1,m)*h/m,c=Math.cos(camFwd),s=Math.sin(camFwd),dx=(mv.z*s-mv.x*c)*sc;stepWalk(sp,dx,(mv.z*c+mv.x*s)*sc);
    // RIDE 3 (owner: "walk out to exit"): at a stop with the doors open, walking on through an open doorway (in a door bay, pushing
    // out past the bay's edge toward the platform) gets you off: the step-out walk takes you onto the platform. Between stops (and
    // on the side away from the platform) the doors stay solid: the walk is clamped to the bay (trainWalk.ts).
    if(Math.abs(dx)>1e-4&&Math.sign(dx)===Math.sign(sp.x)&&Math.abs(sp.x)>=BAY_X-.02&&nearDoor(sp.x,sp.u,0)>=0&&doorsOpen(run.states[k])){
     const ds=run.doorSpot?.(k,pose.x,pose.z,door)??null;if(ds&&Math.hypot(ds.x-pose.x,ds.z-pose.z)<1.6&&startExit(run)){exitFrame(run,0);return;}}}}
  const moved=h>0?Math.hypot(sp.x-x0,sp.u-u0)/h:0;gaitMove+=((moved>.25?1:0)-gaitMove)*Math.min(1,h*8);
  strapW+=((tw<0&&moved<.25?1:0)-strapW)*Math.min(1,h*(reduced?12:4));
  toCar(sp.x,sp.u,carL);meCar=carL.car;run.carMatrixOf!(k,carL.car,carM);pv.set(carL.x,CAR_FLOOR_Y,carL.z).applyMatrix4(carM);const e=carM.elements;
  pose.x=pv.x;pose.y=pv.y;pose.z=pv.z;pose.yaw=Math.atan2(e[8],e[10])+gaitYaw+(carL.car%2?Math.PI:0);pose.lean=1;
  lean=reduced?0:e[1];swayStrapPose(straps[0],lean);swayStrapPose(straps[1],lean);
  gait.on=true;gait.x=sp.x;gait.z=sp.u;ports.seat(pose);anchor.standing=true;anchor.u=sp.u;anchor.sx=sp.x;anchor.face=gaitYaw;
  // the free seats you pass glow (the nearest within reach the brightest: Sit); friends' seats are skipped
  nearSeatJ=tw<0?nearestFreeSeat(sp.x,sp.u,NEAR_SEAT,s=>ports.taken(k,s)):-1;
  for(let s=0;s<TRAIN_SEATS;s++){const g=glows[s];let w=0;if(tw<0&&!ports.taken(k,s)){seatAisle(s,aisle);const d=Math.hypot(aisle.x-sp.x,aisle.z-sp.u);if(d<GLOW_SEAT)w=s===nearSeatJ?1:.35*(1-d/GLOW_SEAT);}
   g.w+=(w-g.w)*Math.min(1,h*(reduced?20:6));if(g.w<.01)g.w=0;if(g.w>0){run.seatPose(k,s,gp);g.x=gp.x;g.y=gp.y;g.z=gp.z;g.yaw=gp.yaw;}}
  const st=run.states[k],atDoor=st.at>=0&&st.doors>=DOORS_OPEN&&tw<0&&nearDoor(sp.x,sp.u)>=0;
  if(view.nearSeat!==(nearSeatJ>=0)||view.nearDoor!==atDoor)trainRideStore.set({nearSeat:nearSeatJ>=0,nearDoor:atDoor});
 }
 /** A tap on a free seat in reach while standing: walk over and sit (the nearest on screen within SEAT_TAP_PX). */
 function tapSeat(cx:number,cy:number,el:Element){
  if(!standing||tw>=0||!lastCam)return false;const r=el.getBoundingClientRect();let best=-1,bd=SEAT_TAP_PX;
  for(let s=0;s<TRAIN_SEATS;s++){const g=glows[s];if(g.w<=0||ports.taken(k,s))continue;v.set(g.x,g.y+.75,g.z).project(lastCam);if(v.z< -1||v.z>1)continue;
   const d=Math.hypot(r.left+(v.x+1)*r.width/2-cx,r.top+(1-v.y)*r.height/2-cy);if(d<bd){bd=d;best=s;}}
  return best>=0&&sitDown(best);
 }
 /** The outside views' clearance from look point h to camera c (in place): under a station's eaves first, then a spring arm
  *  (in fast, out slow, as the seat view's) clear of roofs, the tunnel rock, the hill and the truss, then over a truss chord. */
 function clearArm(hx:number,hy:number,hz:number,c:T.Vector3,h:number){
  camCeiling(c.x,c.z,ceil2);if(ceil2.w>0&&c.y>ceil2.y)c.y+=(ceil2.y-c.y)*ceil2.w;
  const f=camClearFraction(hx,hy,hz,c.x,c.y,c.z,ports.ground);let a=armO;a=a<0?f:a+(f-a)*(1-Math.exp(-(f<a?14:2.5)*h));armO=a;
  c.set(hx+(c.x-hx)*a,hy+(c.y-hy)*a,hz+(c.z-hz)*a);c.y+=trussLift(c.x,c.y,c.z);
 }
 /** Ease the free camera back to the default framing (Recenter, a double tap). */
 function recenter(){recentering=true;orb.vy=0;}
 // ---- looking around: the stick (Town's shaped stick) and a drag on the canvas, through the zipline's soft limit and spring
 let listening=false;
 // Only presses that start on the canvas (never a HUD button); a second finger pinches; two quick taps recenter.
 const span=()=>Math.max(320,Math.min(1100,typeof window!=='undefined'?Math.min(window.innerWidth,window.innerHeight*1.4):390));
 function onDown(e:PointerEvent){const el=e.target as Element|null;if(!riding()||e.button>0||!el||el.tagName!=='CANVAS')return;
  // AAA 2 (owner shot 51): first person on a phone, a touch on the left half is the floating stick's (it walks), the right half looks
  if(standing&&e.pointerType==='touch'&&e.clientX<window.innerWidth*.5&&window.matchMedia?.(PHONE_STICK_QUERY).matches)return;
  if(dragging&&e.pointerId!==dragId&&pinchId<0){pinchId=e.pointerId;pinchX=e.clientX;pinchY=e.clientY;pinchD=Math.max(10,Math.hypot(pinchX-dragX,pinchY-dragY));pinchZ=orb.zoom;orb.vy=0;return;}
  if(dragging)return;const now=e.timeStamp/1000;
  if(tapT>=0&&now-tapT<ORBIT.tap2&&Math.hypot(e.clientX-tapX,e.clientY-tapY)<ORBIT.tapPx){tapT=-1;recenter();return;}
  tapT=now;tapX=e.clientX;tapY=e.clientY;dragging=true;dragId=e.pointerId;dragX=e.clientX;dragY=e.clientY;dragT=now;orb.vy=0;recentering=false;}
 function onMove(e:PointerEvent){
  if(e.pointerId===pinchId){pinchX=e.clientX;pinchY=e.clientY;setZoom(pinchZ*pinchD/Math.max(10,Math.hypot(pinchX-dragX,pinchY-dragY)));return;}
  if(!dragging||e.pointerId!==dragId)return;if(pinchId>=0){dragX=e.clientX;dragY=e.clientY;setZoom(pinchZ*pinchD/Math.max(10,Math.hypot(pinchX-dragX,pinchY-dragY)));return;}
  const w=span(),dx=(e.clientX-dragX)/w,dy=(e.clientY-dragY)/w,now=e.timeStamp/1000,dts=Math.max(.008,now-dragT);
  if(Math.abs(e.clientX-tapX)+Math.abs(e.clientY-tapY)>ORBIT.tapPx)tapT=-1;// a drag is not a tap
  orb.yaw=wrapPi(orb.yaw-dx*ORBIT.drag);clampYaw();setPitch(orb.pitch+dy*ORBIT.drag*.6);
  orb.vy=orb.vy*.5+(-dx*ORBIT.drag/dts)*.5;dragX=e.clientX;dragY=e.clientY;dragT=now;}
 function onUp(e:PointerEvent){if(e.pointerId===pinchId){pinchId=-1;return;}if(dragging&&e.pointerId===dragId){
   // Gameplay 3: standing, a quick tap (no drag) on a free seat in reach sits there
   if(standing&&tapT>=0&&e.timeStamp/1000-tapT<.4&&Math.hypot(e.clientX-tapX,e.clientY-tapY)<ORBIT.tapPx&&e.target instanceof Element&&tapSeat(e.clientX,e.clientY,e.target))tapT=-1;
   // POLISH 3 (owner, phone first person: a 90° drag turned 134°): first person (Inside, Driver's view) stops on release, no flick
   dragging=false;dragId=-1;if(pinchId>=0){pinchId=-1;orb.vy=0;}if(e.timeStamp/1000-dragT>.08||standing||camView==='inside'||camView==='driver')orb.vy=0;}}
 function onWheel(e:WheelEvent){const el=e.target as Element|null;if(!riding()||!el||el.tagName!=='CANVAS')return;setZoom(orb.zoom*Math.exp(e.deltaY*ORBIT.wheel));recentering=false;}
 function unlisten(){if(!listening||typeof window==='undefined')return;listening=false;window.removeEventListener('pointerdown',onDown,true);window.removeEventListener('pointermove',onMove,true);window.removeEventListener('pointerup',onUp,true);window.removeEventListener('pointercancel',onUp,true);window.removeEventListener('wheel',onWheel,true);dragging=false;dragId=pinchId=-1;}
 let promptShown=false;const lastWant={x:0,z:0,y:0,can:false,n:0};
 /** E on the platform while the Board button shows (the zipline tower's key). */
 function onKey(e:KeyboardEvent){if(e.key.toLowerCase()!=='e'||e.repeat||!promptShown||riding())return;const el=e.target as HTMLElement|null;if(el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable))return;if(board())e.preventDefault();}
 if(typeof window!=='undefined')window.addEventListener('keydown',onKey);
 return {
  get active(){return riding();},get train(){return k;},get seat(){return j;},get blend(){return blend;},
  /** Gameplay 2: the train whose doors this client holds open (walking aboard it, or waiting for it on its platform), else -1. */
  get waiting(){return riding()?(walkT>=0||exitT>=0||ports.run()?.states[k].at!==-1?k:-1):near>=0?nearTrain:-1;},
  /** Easy exit: the step-out walk (0 … 1, -1 when not) and a Get off press waiting for the doors. */
  get exiting(){return exitT;},get exitQueued(){return exitQ;},requestExit,
  /** Camera views: the view, pick one (Inside stands you up, others sit you down), cycle (the camera button / C), the ease (0 … 1). */
  get view(){return camView;},setView,cycleView,get viewEase(){return viewT;},
  /** Gameplay 2: walking to the door (0 … 1), -1 when not; and a Board press waiting for the doors (train index, -1). */
  get walking(){return walkT;},get queued(){return queued;},
  /** Gameplay 2: the train under the pointer (lib/graphics/trainHover.ts; Town writes it), -1: none. Board then wins as a hover. */
  get hoverTrain(){return hoverK;},set hoverTrain(v:number){hoverK=v;},
  board,walkIn,getOff,press,
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
   // AAA 2 (owner shot 51, "unable to turn while inside"): first person keys: W / S (and ↑ / ↓) walk, A / D step sideways, ← / → turn
   // (FP_KEY_TURN rad/s, the drag turns too); the stick walks (as on the island: stick moves, a drag looks)
   if(standing){const sx=keys?(keys.has('d')?1:0)-(keys.has('a')?1:0):0,turn=keys?(keys.has('arrowright')?1:0)-(keys.has('arrowleft')?1:0):0;
    mv.x=Math.max(-1,Math.min(1,stickX+sx));mv.z=Math.max(-1,Math.min(1,kz-stickZ));keyYaw=turn*FP_KEY_TURN/ORBIT.keyYaw;keyPitch=0;if(mv.x||mv.z||turn)recentering=false;return true;}
   keyYaw=Math.max(-1,Math.min(1,stickX+kx));keyPitch=Math.max(-1,Math.min(1,kz-stickZ));if(keyYaw||keyPitch)recentering=false;return true;},
  /** The seated pose for the rig (blended in and out). */
  trick():TrickPose|undefined{
   // Gameplay 3: standing, one hand up on the strap on the nearer rail (blended out while walking, and while the kneel fades)
   if(standing&&blend<=.02){if(strapW<=.01)return undefined;const t=straps[sp.x*(meCar%2?-1:1)>0?1:0];t.w=strapW*strapW*(3-2*strapW);return t;}
   if(blend<=0)return undefined;const t=tricks[(pose.lean??1)>0?1:0];t.w=blend*blend*(3-2*blend);return t;},
  /** Gameplay 3: standing in the aisle; the rig's gait frame (Town poses the rig at gait.x, gait.z in the train frame, facing once
   *  gait.facing, then hands its yaw back through gaitYaw and puts the root back in the world). */
  get standing(){return standing;},get gait(){return gait;},set gaitYaw(y:number){if(standing&&tw<0)gaitYaw=y;},
  /** Gameplay 3: the free seats' reach weights, the seat Sit would take (-1), Stand up / Sit for checks. */
  get glows(){return glows;},get nearSeat(){return nearSeatJ;},standUp,sitDown,
  /** Gameplay 3 debug / checks: the standing spot in the train frame (x across, u along car 0). */
  get spot(){return sp;},
  /** Gameplay 3 debug: the walk input (x right, z forward, camera-relative) and the camera's forward in the train frame. */
  get walkInput(){return mv;},get camForward(){return camFwd;},
  /** After Town's train update this frame: the seat, the stop events (announcement, Get off), the HUD. */
  frame(dt:number,reduced:boolean){
   if(!riding()){if(blend>0)blend=Math.max(0,blend-dt*(reduced?6:2.5));if(blend<=0)unlisten();return;}
   const run=ports.run();if(!run){getOff(true);return;}
   // Gameplay 2: the walk from the platform to the door and on into the seat (the sitting pose blends in over its last 40 %)
   if(walkT>=0){walkT=Math.min(1,walkT+dt/walkDur);const u=walkT*walkT*(3-2*walkT);run.ridden[k]=1;run.seatPose(k,j,pose);
    if(u<walkA){const q=u/walkA,dx=door.x-from.x,dz=door.z-from.z;walkPose.x=from.x+dx*q;walkPose.y=from.y+(door.y-from.y)*q;walkPose.z=from.z+dz*q;walkPose.yaw=Math.hypot(dx,dz)>.05?Math.atan2(dx,dz):door.yaw;}
    else{const q=(u-walkA)/Math.max(1e-3,1-walkA),dy=((pose.yaw-door.yaw)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;walkPose.x=door.x+(pose.x-door.x)*q;walkPose.y=door.y+(pose.y-door.y)*q;walkPose.z=door.z+(pose.z-door.z)*q;walkPose.yaw=door.yaw+dy*q;}
    blend=Math.max(blend,Math.min(1,(u-.6)/.4));ports.seat(walkPose);if(walkT>=1)walkT=-1;return;}
   run.ridden[k]=1;const st=run.states[k];
   if(exitT>=0){exitFrame(run,dt);return;}
   if(exitQ&&doorsOpen(st)&&startExit(run)){if(exitT>=0)exitFrame(run,0);return;}
   {const offer=exitOffer(st),to=offer?TRAIN_STOPS[st.at>=0?st.at:st.next].station.name:'';if(!offer)exitQ=false;
    // the doors-closing warning: EXIT_WARN s before they start to shut (the hold for a rider included)
    let closing=false;if(st.at>=0&&offer){const left=Math.max(0,st.dwellLeft-(DOOR_DELAY+DOOR_MOVE+.1))+Math.max(0,DOOR_HOLD-(run.runner?.doorHeldFor(k)??DOOR_HOLD));
     closing=left<=EXIT_WARN;if(closing&&warnedAt!==st.at){warnedAt=st.at;ports.cue('train-chime',.8);setNote(TRAIN_NOTES.closing);}}
    if(st.at<0)warnedAt=-2;
    if(view.exitTo!==to||view.exitQueued!==exitQ||view.closing!==closing)trainRideStore.set({exitTo:to,exitQueued:exitQ,closing});}
   if(standing&&run.carMatrixOf)standFrame(run,dt,reduced);
   if(!riding())return;
   if(!standing){blend=Math.min(1,blend+dt*(reduced?6:2.5));run.seatPose(k,j,pose);ports.seat(pose);}
   if(st.at!==lastAt){
    if(st.at>=0){run.seatPose(k,j,probe);anchor.x=probe.x;anchor.y=probe.y;anchor.z=probe.z;anchor.yaw=probe.yaw;setNote(arriveLine(st.at));}
    else if(lastAt>=0){setNote(nextStopLine(st.next));}
    lastAt=st.at;}
   const can=st.at>=0&&st.doors>=DOORS_OPEN&&st.dwellLeft>=GET_OFF_LEFT;if(can!==view.canGetOff)trainRideStore.set({canGetOff:can});
  },
  /** After the follow camera: the ride camera on the rider's window side (blended in and out), the look spring stepped once. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   if(!riding()&&blend<=0){if(camOn){camOn=false;orb.yaw=orb.pitch=orb.vy=0;orb.zoom=1;arm=-1;}if(nearSaved){camera.near=nearSaved;nearSaved=0;camera.updateProjectionMatrix();}
    // RIDE 3: off the train, the camera eases from its last ride pose back to the follow camera (and the fov back to normal)
    if(outT<1&&fovSaved){outT=reduced?Math.min(1,outT+Math.max(0,Math.min(dt,.1))/VIEW_EASE_REDUCED):Math.min(1,outT+Math.max(0,Math.min(dt,.1))/EXIT_EASE);const ev=smoother(outT);
     const f=outFov+(fovSaved-outFov)*ev;if(Math.abs(camera.fov-f)>.01){camera.fov=f;camera.updateProjectionMatrix();}
     camera.position.lerpVectors(outP,normalPos.copy(camera.position),ev);camera.quaternion.slerpQuaternions(outQ,normalQ.copy(camera.quaternion),ev);camera.updateMatrixWorld();if(outT<1)return;}
    outT=1;if(fovSaved){camera.fov=fovSaved;fovSaved=0;camera.updateProjectionMatrix();}return;}
   const run=ports.run();if(!run)return;camOn=true;const h=Math.max(0,Math.min(dt,.1));
   // the free camera: keys / stick turn it at a steady rate; a flick keeps turning and slows (no inertia with reduced motion); it
   // stays where it is left; Recenter eases it home.
   if(keyYaw||keyPitch){orb.yaw=wrapPi(orb.yaw-keyYaw*ORBIT.keyYaw*h);setPitch(orb.pitch+keyPitch*ORBIT.keyPitch*h);}
   if(!dragging&&orb.vy!==0){if(reduced)orb.vy=0;else{orb.yaw=wrapPi(orb.yaw+orb.vy*h);orb.vy*=Math.exp(-ORBIT.decay*h);if(Math.abs(orb.vy)<.02)orb.vy=0;}}
   clampYaw();
   if(camView==='driver'&&!dragging&&!keyYaw&&!keyPitch){const q=reduced?1:1-Math.exp(-DRIVER.back*h);orb.yaw-=orb.yaw*q;orb.pitch-=orb.pitch*q;orb.vy=0;}
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
   // Gameplay 3 / the Inside view: standing, the camera eases between the seated framing and the room view (below) as you stand up
   // and sit down; you walk relative to it (camFwd: square to the aisle, the orbit's turn on top).
   lastCam=camera;if(standing)camFwd=wrapPi(camBase+orb.yaw);
   // The Inside view, RIDE 3 (owner, Nov 24 2026): FIRST PERSON. The eye FP.eye m over the floor at your standing spot (no lag: the
   // camera is you), from this frame's car matrix, looking camFwd (train frame) and the orbit's pitch. No cutaway: roof and walls
   // stay (no cutaway). Your body is hidden by Town's near-camera fade; walls and poles: the walkable floor.
   if(camView==='inside'&&exitT>=0){// stepping out through the door: your eyes go with you (then the camera eases back out)
    camPos.set(walkPose.x,walkPose.y+FP.eye,walkPose.z);camLook.set(camPos.x+Math.sin(walkPose.yaw)*FP.look,camPos.y-.4,camPos.z+Math.cos(walkPose.yaw)*FP.look);}
   else if(camView==='inside'&&run.carMatrixOf){
    toCar(sp.x,sp.u,carL2);run.carMatrixOf(kk,carL2.car,carM2);pv2.set(carL2.x,CAR_FLOOR_Y+FP.eye,carL2.z).applyMatrix4(carM2);const e=carM2.elements,W=Math.atan2(e[8],e[10])+camFwd+(carL2.car%2?Math.PI:0);
    const pt=Math.max(-FP.pitch,Math.min(FP.pitch,orb.pitch)),cp=Math.cos(pt);
    camPos.copy(pv2);camLook.set(pv2.x+Math.sin(W)*cp*FP.look,pv2.y-Math.sin(pt)*FP.look,pv2.z+Math.cos(W)*cp*FP.look);}
   // The outside views (OUTSIDE): a look point on the train (from its nose back along the track), the camera on a bearing from it,
   // the orbit on top, kept clear of roofs, rock, the hill and the truss by its own spring arm.
   if(camView==='driver'&&run.carMatrixOf){
    run.carMatrixOf(kk,0,carM2);pv2.set(DRIVER.x,CAR_FLOOR_Y+DRIVER.eye,DRIVER.z).applyMatrix4(carM2);const e=carM2.elements,W=Math.atan2(e[8],e[10])+orb.yaw,pt=orb.pitch-DRIVER.down,cp=Math.cos(pt);
    camPos.copy(pv2);camLook.set(pv2.x+Math.sin(W)*cp*DRIVER.look,pv2.y+Math.sin(pt)*DRIVER.look,pv2.z+Math.cos(W)*cp*DRIVER.look);}
   if(camView!=='seat'&&camView!=='inside'&&camView!=='driver'){
    const o=OUTSIDE[camView],sl=wrapS(s-o.at),c=trackAt(sl,tpo),hy=bedAt(L.profile,sl)+o.lh,az=(portrait&&o.pAz!==undefined?o.pAz:o.az)+orb.yaw,ca=Math.cos(az),sa=Math.sin(az);
    const el0=Math.max(.06,Math.min(1.45,o.el+orb.pitch)),len=o.dist*(portrait?o.portrait:1)*orb.zoom,hx=ca*c.tx+sa*c.tz,hz=ca*c.tz-sa*c.tx;
    // a station house between a platform-side camera and the train: rather than pull in against the cars, the camera rises over its
    // roof (the least extra elevation that clears, re-checked 4× a second, eased up fast and down slowly); the spring arm stays the net
    liftIn-=h;if(liftIn<=0){liftIn=.25;liftWant=0;for(let x=0;x<=1.2;x+=.1){const e2=Math.min(1.45,el0+x),c2=Math.cos(e2)*len;if(camClearFraction(c.x,hy,c.z,c.x+hx*c2,hy+Math.sin(e2)*len,c.z+hz*c2,ports.ground)>=1){liftWant=x;break;}}}
    if(liftSnap){lift=liftWant;liftSnap=false;}else lift+=(liftWant-lift)*(reduced?1:1-Math.exp(-(liftWant>lift?6:1.5)*h));
    const el=Math.min(1.45,el0+lift),ce=Math.cos(el)*len;
    v.set(c.x+hx*ce,hy+Math.sin(el)*len,c.z+hz*ce);clearArm(c.x,hy,c.z,v,h);camPos.copy(v);camLook.set(c.x,hy,c.z);
    // in the tunnel: along the tube at the train's end (TUBE), so the shot is always of the train
    const tubeOn=inTunnelS(wrapS(s+2))||inTunnelS(wrapS(s-TRAIN_LENGTH/2))||inTunnelS(wrapS(s-TRAIN_LENGTH-2));
    tubeW=reduced?(tubeOn?1:0):tubeW+((tubeOn?1:0)-tubeW)*(1-Math.exp(-TUBE.rate*h));if(tubeW<.002)tubeW=0;else if(tubeW>.998)tubeW=1;
    if(tubeW>0){const fr=camView==='front',sc=wrapS(fr?s+TUBE.ahead:s-TRAIN_LENGTH-TUBE.behind),sl=wrapS(fr?s-TUBE.lookIn:s-TRAIN_LENGTH+TUBE.lookIn);
     const a=trackAt(sc,tpc),ax=a.x,az=a.z,b=trackAt(sl,tpc),w=tubeW*tubeW*(3-2*tubeW);
     camPos.set(camPos.x+(ax-camPos.x)*w,camPos.y+(bedAt(L.profile,sc)+(fr?TUBE.aheadUp:TUBE.behindUp)-camPos.y)*w,camPos.z+(az-camPos.z)*w);
     camLook.set(camLook.x+(b.x-camLook.x)*w,camLook.y+(bedAt(L.profile,sl)+TUBE.lookUp-camLook.y)*w,camLook.z+(b.z-camLook.z)*w);}}
   else tubeW=0;
   // RIDE 3: a view change eases round an eased look point, in the train's frame (its nose and heading now), so it keeps up with the
   // train and its curves: bearing (the shortest way), elevation and log distance; lifted over a station roof / the hill on the way
   {const n=trackAt(s,tpn);refX=n.x;refZ=n.z;refTx=n.tx;refTz=n.tz;}
   const vFov=camView==='inside'?(portrait?FP.portraitFov:FP.fov):camView==='driver'?(portrait?DRIVER.portraitFov:DRIVER.fov):portrait?PORTRAIT_FOV:(fovSaved||camera.fov);let rideFov=vFov;
   if(viewT<1){viewT=Math.min(1,viewT+h/(reduced?VIEW_EASE_REDUCED:VIEW_EASE));const ev=smoother(viewT);
    fromTrain(snapP,fromP);fromTrain(snapL,fromL);o1.subVectors(fromP,fromL);o2.subVectors(camPos,camLook);
    const r1=Math.max(.05,o1.length()),r2=Math.max(.05,o2.length()),a1=Math.atan2(o1.x,o1.z),a2=Math.atan2(o2.x,o2.z),e1=Math.asin(Math.max(-1,Math.min(1,o1.y/r1))),e2=Math.asin(Math.max(-1,Math.min(1,o2.y/r2)));
    const az=a1+wrapPi(a2-a1)*ev,r=Math.exp(Math.log(r1)+(Math.log(r2)-Math.log(r1))*ev);let el=e1+(e2-e1)*ev;
    camLook.lerpVectors(fromL,camLook,ev);
    // over a roof / the hill rather than through it (up to ~50° more, gone by the end of the ease); a few clearance marches a frame
    // (the wanted lift is found in .15 rad steps; the applied one eases to it, quick up and slower down, so it never steps)
    if(!reduced){const fade=Math.min(1,(1-ev)*4);let want=0;if(fade>0)for(let x=0;x<=.9;x+=.15){const e3=Math.min(1.5,el+x),c3=Math.cos(e3)*r;want=x;if(camClearFraction(camLook.x,camLook.y,camLook.z,camLook.x+Math.sin(az)*c3,camLook.y+Math.sin(e3)*r,camLook.z+Math.cos(az)*c3,ports.ground)>=1)break;}
     swingLift+=(want-swingLift)*(1-Math.exp(-(want>swingLift?9:4)*h));el=Math.min(1.5,el+swingLift*fade);}
    const ce=Math.cos(el)*r;camPos.set(camLook.x+Math.sin(az)*ce,camLook.y+Math.sin(el)*r,camLook.z+Math.cos(az)*ce);
    rideFov=fovFrom+(vFov-fovFrom)*ev;}
   aimer.position.copy(camPos);aimer.up.set(0,1,0);aimer.lookAt(camLook);camQ.copy(aimer.quaternion);
   lastP.copy(camPos);lastL.copy(camLook);lastQ.copy(camQ);havePose=true;lastFov=rideFov;
   // the ride camera's weight: the seat blend (boarding), or 1 while standing / walking to a seat / stepping out (then the exit ease)
   const wc=Math.max(blend,standing||exitT>=0?1:0),e=wc*wc*(3-2*wc);
   if(!fovSaved)fovSaved=camera.fov;{const f=fovSaved+(rideFov-fovSaved)*e;if(Math.abs(camera.fov-f)>.01){camera.fov=f;camera.updateProjectionMatrix();}}
   {const fp=(camView==='inside'||camView==='driver')&&e>.5;if(fp&&!nearSaved){nearSaved=camera.near;camera.near=FP.near;camera.updateProjectionMatrix();}else if(!fp&&nearSaved){camera.near=nearSaved;nearSaved=0;camera.updateProjectionMatrix();}}
   normalPos.copy(camera.position);normalQ.copy(camera.quaternion);
   camera.position.lerpVectors(normalPos,camPos,e);camera.quaternion.slerpQuaternions(normalQ,camQ,e);camera.updateMatrixWorld();
  },
  /** Presence (multiplayer/protocol/seat.ts trainWire): the seat and where I sat at the last stop, or null when not riding. */
  wire(){return riding()?anchor:null;},
  /** Keyboard: E gets off (at a stop), Space / H sounds the horn. True when the key was the ride's. */
  key(e:{code:string;key:string;repeat:boolean;preventDefault():void},down:boolean){
   if(!riding())return false;const id=trainKeyAction(e.code,e.key);if(!id)return false;e.preventDefault();if(down&&!e.repeat)press(id,'tap');return true;},
  /** A friend took my seat at the same moment (lower member id keeps it, as in the stadium): shuffle to a free one. */
  bump(){if(!riding()||standing)return;const run=ports.run();if(!run)return;for(let s=0;s<TRAIN_SEATS;s++)if(s!==j&&!ports.taken(k,s)){j=s;anchor.seat=s;run.seatPose(k,j,pose);anchor.x=pose.x;anchor.y=pose.y;anchor.z=pose.z;anchor.yaw=pose.yaw;return;}},
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
