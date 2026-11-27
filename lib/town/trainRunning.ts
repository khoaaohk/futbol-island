/**
 * The Island Line's running trains (train Phase 2, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md §4, §5, §7).
 * Added to the scene after the batching pass (world.ts), like the tunnel tube. Positions come from the shared timetable
 * (trainSchedule.ts): nothing is sent over the network.
 *
 * Heat first (owner, Nov 23 2026: the PLAN numbers are ceilings) and NO new shader code: everything here draws with the road
 * traffic's own vehicle material (lib/graphics/trafficVehicles.ts createVehicleMaterial: vertex colours, wheels that spin about a
 * per-vertex pivot, head / tail / indicator lamps that glow from uniforms) or the station boards' existing board material.
 *  - Trains: one InstancedMesh per train (its two cars, its livery in vertex colours, its own wheel + lamp uniforms) and ONE
 *    InstancedMesh for every door leaf: at most 4 draws for all three trains, no lights, no shadow casters (a dark contact strip
 *    under each car is part of the car). Past LOD_RANGE m a train swaps to one 12-triangle box per car (same material, same
 *    program); past HIDE_RANGE m or off-screen it is not drawn at all. Wheels and doors move only within ANIMATE_RANGE m.
 *  - Windows glow at night (the indicator-lamp channel, driven by the shared night factor MACHINE_NIGHT); headlamps always.
 *  - Crossings: one small mesh per crossing with the same vehicle material: the barrier arms are its "wheels" (they turn about
 *    their pivot), the twin lamps its left / right indicators (they flash in turn). State is worked out at XING_HZ and on events;
 *    an arm only needs per-frame uniforms during its 3 s swing, and only while that crossing is drawn (within XING_SHOW m).
 *    The bell rings only within BELL_RANGE m, through the island sound kit (mute and volume apply).
 *  - People on the track (owner, Nov 24 2026: "trains won't wait since it's on the schedule and other players will be using it"):
 *    walking on the line is allowed and a train NEVER changes speed for anyone. It looks WARN_AHEAD m ahead (±LOOK_HALF m): within
 *    WARN_S s of reaching the local player it honks (louder the closer) and Conductor Kenji shouts a warning (once per approach,
 *    WARN_COOLDOWN s apart); a remote player ahead hears the horn. A moving car that reaches the local player (or a stopped one hit at
 *    speed on a ride) reports a knock (result.knock): Town throws them clear with the shared train bonk (trainBonk.ts).
 *  - Departure boards: "Next train: 1 min · to Coral Cay" and the following train, redrawn at BOARD_HZ (1 Hz) only for stations
 *    within BOARD_SHOW m, uploaded only when a line changes (Nov 24 polish: a 0.3 s split-flap flip of the changed line within
 *    FLIP_RANGE m, 6 uploads, none with reduced motion). Free-standing (own post and collider) on the platform.
 *  - No allocation per frame; every mesh is built at load and warm() lets Town compile the programs before a train is seen.
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {inSouthBridgeS,TRACK,TRACK_DS,TRAIN_STATIONS,TRAIN_CROSSINGS,STATION_HALF,STATION_PLATFORM_Y,TrackKind,TUNNEL,TUNNEL_HALF_WIDTH,trackAt,leftNormal,wrapS,bedAt} from './trainTrack';
import {trainLayout,trainWalkHeight,trainDeckAt,swimDeckBlocked,trainSwimBlocked,bridgeHeads} from './trainLayout';
import {TRAIN_COUNT,TRAIN_CARS,CAR_LENGTH,CAR_GAP,TRAIN_LENGTH,LOOK_HALF,TRAIN_STOPS,createTrainRunner,newTrainState,trainAt,trainPhase,
 scheduleAt,crossingFor,nextTrains,waitText,trainClockSec,LAP,type TrainState} from './trainSchedule';
import {createVehicleMaterial,PART} from '../graphics/trafficVehicles';
import {MACHINE_NIGHT} from '../graphics/machineNightGlow';
/** The front from 20 m short of the west portal until the rear has left the east one (trains run west → east through the hill). */
/** AAA 4: the car's light by section (material colour): in the tunnel, the truss's deepest shade, and the interior lamp lift there. */
const SHADE={tunnel:.74,truss:.09,lamp:1.1} as const,DOOR_BOUNCE=[.32,.28] as const;
/** The car (0 / 1) of train i that sparks in this 0.4 s bucket, or −1 (seeded: about one bucket in 23). */
const sparkCar=(i:number,clock:number)=>{const b=Math.floor(clock*2.5),h=Math.imul(b+i*97,2654435761)>>>0;return h%23===0?(h>>>8)&1:-1;};
const tunnelLamps=(s:number)=>{const a=wrapS(s-TUNNEL.west.s+20);return a<TUNNEL.east.s-TUNNEL.west.s+20+TRAIN_LENGTH;};

/** Phase 4: wheel clack within CLACK_RANGE m (one per CLACK_STEP m run), door chime within DOOR_SOUND m, arrival melody within ARRIVE_SOUND m. */
export const CLACK_RANGE=45,CLACK_STEP=CAR_LENGTH+CAR_GAP,DOOR_SOUND=35,ARRIVE_SOUND=70;
/** Platform announcements (Nov 24 polish): within ON_PLATFORM m of the platform's middle, ANNOUNCE_S s before the train pulls in. */
export const ON_PLATFORM=22,ANNOUNCE_S=10;
/** Owner bug (Nov 25 2026): the box tier showed on a train clearly close on screen from the high overview camera (it was chosen by the
 *  camera's ground distance). Now by on-screen size: a car's length over the screen's half-height (12.4 m · P[5] / 3-D distance).
 *  The box only below LOD_FAR_IN (~40 px on an 800 px tall screen), back to full detail above LOD_NEAR_OUT (hysteresis, no flicker). */
export const LOD_FAR_IN=.10,LOD_NEAR_OUT=.125;
export const ANIMATE_RANGE=80,LOD_RANGE=150,HIDE_RANGE=400,SIM_RANGE=260,BELL_RANGE=60,HORN_RANGE=220,XING_SHOW=160,XING_SHOW_PED=110,XING_HZ=4,BOARD_SHOW=150,BOARD_HZ=1;
/** Board flips (Nov 24 polish): within FLIP_RANGE m, FLIP_S s long, redrawn at FLIP_HZ while flipping. */
export const FLIP_RANGE=45,FLIP_S=.3,FLIP_HZ=20;
/** People on the line: warn within WARN_S s (looking WARN_AHEAD m ahead), at most once per approach and WARN_COOLDOWN s apart; a
 *  car moving faster than KNOCK_V m/s (or any car hit by a ride faster than Town's FAST) knocks you clear instead of blocking. */
export const WARN_S=4,WARN_AHEAD=52,WARN_COOLDOWN=8,KNOCK_V=.5;
/** The car model and its dimensions live in trainCarModel.ts (Nov 24 2026 split). */
import {RAIL_TOP,WHEEL_R,BOGIE_HALF,HALF_W,DOORS,DOOR_HALF,DOOR_Y0,DOOR_Y1,CAR_FLOOR_Y,BENCH_BACK,SEAT_SLOTS_Z,COL,VGeo,POSTERS,coveCorner,coveNormal,CHIME,type V,buildCarGeometry,buildCarBox,buildDoorLeaf,createTrainGlass,CLOSE_RANGE,INTERIOR_GLOW} from './trainCarModel';
const LEAN=.012,LEAN_MAX=.035;
/** Looks 2 (Nov 24 2026): the departure / arrival feel, visual and sound only (the timetable is untouched; every client works it out
 *  from the shared lap time, so all see the same jolt). Pulling out: the couplers' slack takes up, car 0 nudged AMP0 m forward and
 *  settling (a damped wobble of PERIOD s, DECAY 1/s), car 1 AMP1 m LAG s later, the bodies pitching back up to PITCH rad, and the
 *  wheels slip through one extra turn in SLIP s (spin + 2π: no jump after). Pulling in: the mirror (a forward settle, nose down).
 *  Riders, standing passengers and Kenji (seatAt / standAt / carMatrixOf) follow only RIDE of the nudge, so they sway back a little
 *  in the car and the ride camera kicks ≤ 2 cm. None with reduced motion. Per train: a few scalars once a frame, no allocation. */
export const JOLT={amp0:.04,amp1:.05,lag:.15,period:.55,decay:3.5,pitch:.0087,len:1.4,slip:.4,ride:.4,sound:45} as const;
/** The nudge (m, + along the travel) and pitch (rad, + nose up) of a car `tau` s after its slack takes up; arrive: the mirror. */
export function joltAt(tau:number,amp:number,arrive:boolean,out={z:0,p:0}){out.z=out.p=0;if(tau<0||tau>=JOLT.len)return out;
 const e=Math.exp(-JOLT.decay*tau),w=Math.sin(2*Math.PI*tau/JOLT.period),rise=Math.min(1,tau/.1);// the pitch: up in 0.1 s, then easing back
 out.z=(arrive?.8:1)*amp*e*w;out.p=(arrive?-.7:1)*JOLT.pitch*Math.exp(-4*Math.max(0,tau-.1))*rise;return out;}
/** A standAt height over this (m over the rail top) is a roof spot (Town passes roofY(x)); the floor is CAR_FLOOR_Y. */
const ROOF_WALK_Y=CAR_FLOOR_Y+1.5;
/** THE seat table (Gameplay 2, owner Nov 24 2026; used by riding, presence, the walk aboard and, later, NPC passengers and changing
 *  seat), on the car model's benches (trainCarModel.ts SEAT_SLOTS_Z: 7 slots a side, 14 a car, the same z on both sides). Riders kneel
 *  up on the bench facing OUT of their window (lib/graphics/trainSeatPose.ts), knees short of the backrest (BENCH_BACK), chest over
 *  the sill: the root stands on the floor RIDER_ROOT_X from the centre line, yaw out of the window, `lean` the side the train runs
 *  toward (the head and torso turn a little that way).
 *  Seat t of a car (0 … SEATS_PER_CAR−1): side (t&1 ? +x : −x), slot t>>1. Table index of a train = car·SEATS_PER_CAR + t.
 *  Players take any seat (PLAYER_SEATS: all 28; the wire carries them all, multiplayer/protocol/seat.ts); NPC passengers use
 *  NPC_SEATS (all but the slots either side of the middle door). */
export const SEATS_PER_CAR=SEAT_SLOTS_Z.length*2,SEAT_TABLE_SIZE=TRAIN_CARS*SEATS_PER_CAR;
export {CAR_FLOOR_Y};
/** The rider's root |x|: the kneeling pose's knees fold ~.4 m out from the root, so they rest on the cushion just short of the backrest. */
export const RIDER_ROOT_X=BENCH_BACK-.48;
export type SeatSpot={car:number;side:-1|1;slot:number;x:number;z:number;/** +1 / -1: the rider's rig +x / −x is the way the train runs */lean:number};
export const SEAT_TABLE:readonly SeatSpot[]=Array.from({length:SEAT_TABLE_SIZE},(_,i)=>{const car=Math.floor(i/SEATS_PER_CAR),t=i%SEATS_PER_CAR,side=(t&1?1:-1) as -1|1,slot=t>>1,rev=car%2===1?-1:1;
 return {car,side,slot,x:side*RIDER_ROOT_X,z:SEAT_SLOTS_Z[slot],lean:-side*rev};});
/** The slots either side of the middle door (DOORS[1]): the players' seats. */
const MID_SLOTS=(()=>{const below=SEAT_SLOTS_Z.filter(z=>z<DOORS[1]),above=SEAT_SLOTS_Z.filter(z=>z>DOORS[1]);return [SEAT_SLOTS_Z.indexOf(below[below.length-1]),SEAT_SLOTS_Z.indexOf(above[0])];})();
/** Player seat j (0 … TRAIN_SEATS−1) → its SEAT_TABLE index; the NPC passengers' indices. */
/** Nov 24 2026: players may take ANY of the 28 seats a train (the wire carries all of them: multiplayer/protocol/seat.ts); a seat an
 *  NPC passenger or a friend sits in is skipped. NPC passengers keep to NPC_SEATS, so the 8 by the middle doors are always left for players. */
export const PLAYER_SEATS:readonly number[]=SEAT_TABLE.map((s,i)=>i);
export const NPC_SEATS:readonly number[]=SEAT_TABLE.map((s,i)=>i).filter(i=>!MID_SLOTS.includes(SEAT_TABLE[i].slot));
export const TRAIN_SEATS=PLAYER_SEATS.length;
export type SeatPose={x:number;y:number;z:number;yaw:number;/** SeatSpot.lean (riding poses) */lean?:number};

import {LIVERIES} from './trainLiveries';
import {softOn} from '../graphics/softBox';
import {ROOF_HALF,ROOF_END_PAD,roofY,roofLift} from './trainRoof';
import {KENJI,kenjiWarn,KENJI_SEAT} from './trainConductor';
import {createTrainNightGlow} from './trainNightGlow';
import {createTrainWraps} from './trainWraps';// WRAPS (train-wraps, Nov 24 2026): the kindness wraps, one mesh
/** Gameplay 2: the player's radius against a car's box (block and slide); a car's box: ±HALF_W across, ±CAR_LENGTH/2 along. */
export const PLAYER_R=.35;
export {LIVERIES};
export {buildCarGeometry,buildCarBox};
// ---------------------------------------------------------------- crossings (one mesh each; arms = "wheels", lamps = indicators)
function buildCrossing(ci:number,obstacles:Obstacle[]|null){const XSOFT=softOn();
 const L=trainLayout(),c=TRAIN_CROSSINGS[ci],a=trackAt(c.s),i=Math.round(wrapS(c.s)/TRACK_DS)%TRACK.n,bed=L.profile.bed[i],g=new VGeo();
 // local frame: +z along the line (the arms lie along it, across the path), +x left of travel, y up from the bed
 const uBase=-(c.width/2+.5),len=c.width+.6;
 // Phase 4: a footpath crossing's machine is smaller (5 post bands, lamps at 1.5 m, the arm at 0.85 m: hip height for walkers).
 const bands=c.ped?5:7,lampY=c.ped?1.5:2.05,barY=c.ped?1.74:2.32,armY=c.ped?.85:1;
 // A skewed footpath (c.skew: metres along the line per metre across it) shifts each side's post and arm with the path, so the
 // post stands beside the path on both sides and the arm spans it.
 for(const v of [-3.1,3.1]){const u0=uBase+(c.skew??0)*v;
  const pv:V=[v-Math.sign(v)*.2,armY,u0],seg=Math.max(4,Math.round(len/.6));
  if(XSOFT){// Rail + beach props (Nov 27, owner 186: "more rounded and less blocky"): a round striped pole with a ball cap on a rounded
   // foot, round lamp housings (lens front and back, little visors), a rounded lamp bar, motor box and counterweight, and a round
   // striped arm with a rounded tip. Same parts (lamps PART.left / right, the arm PART.rearWheel about pv): timing and logic unchanged.
   g.shade=.7;g.bead(v,.02,u0,.07,.13,.07,COL.metal,10,3);
   for(let k=0;k<bands;k++)g.rbeam([v,k?.04+k*.32:0,u0],[v,.36+k*.32,u0],.072,k%2?COL.post:COL.yellow,0,undefined,10);
   g.bead(v,.36+(bands-1)*.32,u0,0,.072,.05,COL.yellow,10,2);
   g.rbox(v,barY,u0,.05,.04,.3,COL.post,.035,1);
   for(const [dz,P] of [[-.12,PART.left],[.12,PART.right]] as const){const zc=u0+dz;g.rbeam([v,lampY,zc-.06],[v,lampY,zc+.06],.125,COL.post,0,undefined,12);// the round housing
    for(const f of [-1,1]){const zf=zc+f*.061;for(let k=0;k<12;k++){const t0=k/12*Math.PI*2,t1=(k+1)/12*Math.PI*2,r=.105;g.tri([v,lampY,zf],[v+Math.cos(t0)*r,lampY+Math.sin(t0)*r,zf],[v+Math.cos(t1)*r,lampY+Math.sin(t1)*r,zf],COL.lamp,[v,lampY,zf-f],P);}// lens
     for(let k=0;k<6;k++){const t0=k/6*Math.PI,t1=(k+1)/6*Math.PI,r=.13,A:V=[v+Math.cos(t0)*r,lampY+Math.sin(t0)*r,zf],B:V=[v+Math.cos(t1)*r,lampY+Math.sin(t1)*r,zf],C:V=[B[0],B[1],zf+f*.07],D:V=[A[0],A[1],zf+f*.07];
      g.quad(A,B,C,D,COL.post,[v,lampY,zf+f*.035]);g.quad(A,D,C,B,COL.post,[v,lampY+1,zf+f*.035]);}}}// the visor (both sides seen)
   g.rbox(pv[0],pv[1],pv[2],.12,.18,.14,COL.post,.06,1);// the arm's motor box (still)
   for(let s=0;s<seg;s++){const z0=u0+s/seg*len,z1=u0+(s+1)/seg*len;g.rbeam([pv[0],pv[1],z0],[pv[0],pv[1],z1],.048,s%2?COL.post:COL.yellow,PART.rearWheel,pv,8);}
   g.rbox(pv[0],pv[1],u0+len,.048,.048,.048,(seg-1)%2?COL.post:COL.yellow,.046,1,PART.rearWheel,pv);// the arm's round tip
   g.rbox(pv[0],pv[1],u0-.35,.07,.09,.25,COL.metal,.06,1,PART.rearWheel,pv);g.shade=0;}// counterweight
  else{
  for(let k=0;k<bands;k++)g.box(v,.2+k*.32,u0,.075,.16,.075,k%2?COL.post:COL.yellow);// the machine's striped post
  g.box(v,lampY,u0-.12,.13,.13,.06,COL.lamp,PART.left);g.box(v,lampY,u0+.12,.13,.13,.06,COL.lamp,PART.right);// twin lamps, flashing in turn
  g.box(v,barY,u0,.05,.04,.3,COL.post);
  g.box(pv[0],pv[1],pv[2],.12,.18,.14,COL.post);// the arm's motor box (still)
  for(let s=0;s<seg;s++){const z=u0+(s+.5)/seg*len;g.box(pv[0],pv[1],z,.04,.05,len/seg/2,s%2?COL.post:COL.yellow,PART.rearWheel,pv);}
  g.box(pv[0],pv[1],u0-.35,.07,.09,.25,COL.metal,PART.rearWheel,pv);}// counterweight
  if(obstacles&&L.profile.kind[i]!==TrackKind.Sea)obstacles.push({x:a.x+a.tz*v+a.tx*u0,z:a.z-a.tx*v+a.tz*u0,w:.3,d:.3,train:true} as Obstacle);}
 const look=createVehicleMaterial(),mesh=new T.Mesh(g.build(),look.material);mesh.name='train-crossing-'+c.id;mesh.matrixAutoUpdate=false;mesh.castShadow=false;mesh.receiveShadow=false;
 const z=new T.Vector3(a.tx,0,a.tz),y=new T.Vector3(0,1,0),x=new T.Vector3().crossVectors(y,z);mesh.matrix.makeBasis(x,y,z).setPosition(a.x,bed,a.z);mesh.matrixWorldNeedsUpdate=true;
 mesh.visible=false;look.lamp.set(0,0,0,0);look.wheel.set(Math.cos(1.55),-Math.sin(1.55),0,0);
 return {mesh,look,x:a.x,z:a.z,show:c.ped?XING_SHOW_PED:XING_SHOW,lamps:false,arm:0,target:0,moving:false,flash:0};
}

// ---------------------------------------------------------------- departure boards (one canvas: a row per station; the board material's program)
const BOARD_W=512,BOARD_ROW=160;
/** Phase 3: the trains' destination plates are rows of the same canvas (one per stop name, under the board rows): no new texture,
 *  material or program; the plate quads take a row's UVs. */
const PLATE_ROW=40,PLATE_TOP=BOARD_ROW*TRAIN_STATIONS.length+16;
/** Gameplay 3 (interior finishing): the four posters' readable titles, the route map's body (the line and its 5 stops, in lap
 *  order, North at its North Beach spot) and one lit door-chime cell, as more rows of the same canvas (the plates' mesh draws them:
 *  no new texture, material, program or draw call). */
const POSTER_TOP=PLATE_TOP+PLATE_ROW*TRAIN_STATIONS.length,POSTER_ROW=48,ROUTE_TOP=POSTER_TOP+POSTER_ROW*4,ROUTE_ROW=160,CHIME_TOP=ROUTE_TOP+ROUTE_ROW,CHIME_ROW=24,BOARD_H=CHIME_TOP+CHIME_ROW;
export const POSTER_TITLES=['ISLAND LEAGUE · FIXTURES','HISTORY MUSEUM · VISIT','KIT SHOP · NEW BOOTS','ISLAND LINE · ROUTE MAP'] as const;
const POSTER_LOOK=[['#f6e9b8','#1f4d33'],['#7a4b2f','#f6e9b8'],['#fff3df','#c2441f'],['#1f5c9c','#ffffff']] as const;
/** Gameplay 3: the interior quads of one car (car-local corners in reading order: bottom-left, bottom-right, top-right, top-left as
 *  seen from the aisle; the normal; the canvas UVs): each poster's title over its header band, the route map posters' body (the
 *  line and the 5 stops), and a lit chime lamp over every doorway (side: car-local x sign; drawn only while that side's doors open). */
function insideQuads(){
 const out:{p:number[];n:number[];uv:number[];chime:boolean;side:number}[]=[];const H=BOARD_H,row=(top:number,h:number)=>[1-(top+h-2)/H,1-(top+2)/H];
 const add=(s:number,u0:number,u1:number,z0:number,z1:number,off:number,top:number,h:number)=>{const [vb,vt]=row(top,h),zl=s>0?z0:z1,zr=s>0?z1:z0;
  out.push({p:[...coveCorner(s,u0,zl,off),...coveCorner(s,u0,zr,off),...coveCorner(s,u1,zr,off),...coveCorner(s,u1,zl,off)],n:[...coveNormal(s)],uv:[0,vb,1,vb,1,vt,0,vt],chime:false,side:s});};
 for(const ps of POSTERS){const L=ps.z1-ps.z0,a=ps.z0+L*.05,b=ps.z1-L*.05;add(ps.s,.66,.84,a,b,.02,POSTER_TOP+ps.kind*POSTER_ROW,POSTER_ROW);
  if(ps.kind===3)add(ps.s,.17,.6,ps.z0+L*.04,ps.z1-L*.04,.02,ROUTE_TOP,ROUTE_ROW);}
 for(const s of [1,-1])for(const zc of DOORS){const x=s*CHIME.x,zl=s>0?zc-CHIME.hz:zc+CHIME.hz,zr=s>0?zc+CHIME.hz:zc-CHIME.hz,[vb,vt]=row(CHIME_TOP,CHIME_ROW);
  out.push({p:[x,CHIME.y-CHIME.hy,zl,x,CHIME.y-CHIME.hy,zr,x,CHIME.y+CHIME.hy,zr,x,CHIME.y+CHIME.hy,zl],n:[-s,0,0],uv:[.3,vb,.7,vb,.7,vt,.3,vt],chime:true,side:s});}
 return out;
}
function buildBoards(obstacles:Obstacle[]|null){
 const L=trainLayout(),cv=document.createElement('canvas');cv.width=BOARD_W;cv.height=BOARD_H;
 const g=cv.getContext('2d');if(g){g.fillStyle='#16191c';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#3a2c20';g.fillRect(0,PLATE_TOP-16,cv.width,16);
  // destination plates (amber on black, the plate's lit look), one row per stop in TRAIN_STOPS order
  g.textAlign='center';g.textBaseline='middle';for(let r=0;r<TRAIN_STOPS.length;r++){const y=PLATE_TOP+r*PLATE_ROW;g.fillStyle='#1b1712';g.fillRect(0,y,BOARD_W,PLATE_ROW);
   g.fillStyle='#ffb43a';g.font='800 30px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';g.fillText(TRAIN_STOPS[r].station.name.toUpperCase(),BOARD_W/2,y+PLATE_ROW/2+1,BOARD_W-24);}
  // Gameplay 3: poster titles (each on its poster's header colour), the route map body, the lit chime cell
  for(let r=0;r<4;r++){const y=POSTER_TOP+r*POSTER_ROW;g.fillStyle=POSTER_LOOK[r][0];g.fillRect(0,y,BOARD_W,POSTER_ROW);g.fillStyle=POSTER_LOOK[r][1];
   g.font='900 30px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';g.fillText(POSTER_TITLES[r],BOARD_W/2,y+POSTER_ROW/2+1,BOARD_W-20);}
  {const y=ROUTE_TOP,n=TRAIN_STOPS.length,x0=44,x1=BOARD_W-44,ly=y+58;g.fillStyle='#f8f5ee';g.fillRect(0,y,BOARD_W,ROUTE_ROW);g.fillStyle='#1f5c9c';g.fillRect(x0,ly-5,x1-x0,10);
   const cols=['#d6343a','#f5c21b','#3f9a5f','#e2683c','#5aa8de'];g.font='800 19px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
   for(let k=0;k<n;k++){const st=TRAIN_STOPS[k].station,x=x0+(x1-x0)*k/(n-1);g.fillStyle='#ffffff';g.beginPath();g.arc(x,ly,15,0,Math.PI*2);g.fill();g.fillStyle=cols[k%cols.length];g.beginPath();g.arc(x,ly,11,0,Math.PI*2);g.fill();
    g.fillStyle='#1d2a3a';g.fillText(st.name.replace(/ station$/i,''),x,ly+32+(k%2)*24,96);}
   g.font='700 15px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';g.fillStyle='#5a6470';g.fillText('Round the island in 6 minutes · a train every 2 minutes',BOARD_W/2,y+18,BOARD_W-20);}
  {const y=CHIME_TOP,gr=g.createRadialGradient(BOARD_W/2,y+CHIME_ROW/2,1,BOARD_W/2,y+CHIME_ROW/2,BOARD_W/2);gr.addColorStop(0,'#fff6c8');gr.addColorStop(.5,'#ffc54a');gr.addColorStop(1,'#f39a1f');g.fillStyle=gr;g.fillRect(0,y,BOARD_W,CHIME_ROW);}}
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
 // The same settings as the station name boards (world.ts boardMaterial): the same shader program, night glow by emissiveIntensity.
 const mat=new T.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:'#ffe1aa',emissiveIntensity:0,roughness:.9});
 const meshes=TRAIN_STATIONS.map((st,r)=>{
  const c=trackAt(st.s),bed=L.profile.bed[Math.round(wrapS(st.s)/TRACK_DS)%TRACK.n],top=bed+STATION_PLATFORM_Y,sg=st.side,nrm=leftNormal(c.tx,c.tz);
  // On its own post at the platform's back half, between the bench and the house (independent of the station house's shape).
  const U=-6.2,Vv=4.6,P=(u:number,v:number,y:number)=>new T.Vector3(c.x+c.tx*u+nrm.x*sg*v,y,c.z+c.tz*u+nrm.z*sg*v);
  const w=1.6,h=.5,yc=top+2.25,pos:number[]=[],uv:number[]=[],nor:number[]=[];
  const vt=1-(r*BOARD_ROW)/cv.height,vb=1-((r+1)*BOARD_ROW)/cv.height,dark=1-(PLATE_TOP-6)/cv.height;
  // A face in the plane at v, seen from the track side (toward) or from behind: anticlockwise for its viewer, reading left to right.
  const face=(u0:number,u1:number,v:number,y0:number,y1:number,uu0:number,uu1:number,t0:number,t1:number,toward:boolean)=>{
   const A=P(u0,v,y0),B=P(u1,v,y0),C=P(u1,v,y1),D=P(u0,v,y1),rightIsPlusU=(toward?1:-1)*sg>0;
   const q=rightIsPlusU?[A,B,C,D]:[B,A,D,C],t=[[uu0,t1],[uu1,t1],[uu1,t0],[uu0,t0]],k=toward?-1:1,nx=nrm.x*sg*k,nz=nrm.z*sg*k;
   for(const j of [0,1,2,0,2,3]){pos.push(q[j].x,q[j].y,q[j].z);uv.push(t[j][0],t[j][1]);nor.push(nx,0,nz);}};
  face(U-w/2,U+w/2,Vv-.02,yc-h/2,yc+h/2,0,1,vt,vb,true);face(U-w/2,U+w/2,Vv+.02,yc-h/2,yc+h/2,0,1,vt,vb,false);
  for(const tw of [true,false])face(U-.05,U+.05,Vv+(tw?-.03:.03),top,yc-h/2,.5,.5,dark,dark,tw);// the post (dark strip of the canvas)
  const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(pos,3));g2.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g2.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g2.computeBoundingSphere();
  const m=new T.Mesh(g2,mat);m.name='train-board-'+st.id;m.matrixAutoUpdate=false;m.visible=false;
  {const pp=P(U,Vv,0);obstacles?.push({x:pp.x,z:pp.z,w:.3,d:.3,train:true} as Obstacle);}
  return {mesh:m,x:c.x,z:c.z,text:'',stop:TRAIN_STOPS.findIndex(s=>s.station===st),to:'',l1:'',l2:'',o1:'',o2:'',flip:-1};});
 for(const b of meshes)b.to=TRAIN_STOPS[(b.stop+1)%TRAIN_STOPS.length].station.name;
 const sans='system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
 // Polish (Nov 24 2026): a split-flap flip when a line changes. `p` 0 … 1: a changed line's old text folds shut about its middle
 // (the hinge) over the first half and the new one opens over the second; unchanged lines are drawn still. p = 1: the plain board.
 const line=(text:string,o:string,cy:number,font:string,fill:string,p:number)=>{if(!g)return;g.font=font;g.fillStyle=fill;
  if(p>=1||text===o){g.fillText(text,16,cy,BOARD_W-28);return;}
  const sc=p<.5?1-2*p:2*p-1;g.save();g.translate(0,cy);g.scale(1,Math.max(.02,sc));g.fillText(p<.5?o:text,16,0,BOARD_W-28);g.restore();
  g.fillStyle='#000';g.fillRect(10,cy-1,BOARD_W-20,2);};
 const draw=(r:number,l1:string,l2:string,o1=l1,o2=l2,p=1)=>{if(!g)return;const y=r*BOARD_ROW;
  g.fillStyle='#16191c';g.fillRect(0,y,BOARD_W,BOARD_ROW);g.fillStyle='#2f7d5b';g.fillRect(0,y,BOARD_W,8);g.fillStyle='#000';g.fillRect(0,y+BOARD_ROW-6,BOARD_W,6);
  g.textAlign='left';g.textBaseline='middle';line(l1,o1,y+58,`800 38px ${sans}`,'#ffb43a',p);line(l2,o2,y+116,`700 30px ${sans}`,'#e9eef0',p);};
 return {meshes,mat,tex,draw};
}

// ---------------------------------------------------------------- the runtime
export type TrainFrame={dt:number;camera:T.Camera;player:{x:number;y:number;z:number};
 /** Nov 24 2026 (owner shots 39-41, 44: the ridden train vanished in the Back / Left / From above views): the LAST RENDERED camera's
  *  view-projection and world position. Town updates the trains before the ride camera is applied, so f.camera then still holds the
  *  follow camera's matrices (the walk camera behind the seat): culling with it hid every train the ride view looked at. One frame
  *  old (≤ 0.5 m of train travel; the cull sphere is 23 m). */viewProj?:T.Matrix4;camPos?:T.Vector3;
 /** Remote players drawn on this screen (x, y, z). */eachRemote?:(cb:(x:number,y:number,z:number)=>void)=>void;
 /** The shared clock (s) for this frame (AAA 2: Town passes trainFrameClock at the rAF timestamp; tests pass their own); else trainClockSec(). */nowSec?:number;
 /** Phase 3: the train the local player rides (-1: none): they are not a person on the track and are never pushed out of it. */riding?:number;
 /** prefers-reduced-motion: the boards change without the flip. */reduced?:boolean;
 /** Nov 24 2026: the local player stands on a train's roof (trainRoof.ts): not a person on the track, never pushed. */onRoof?:boolean;/** AAA 2: the local player is in the air (jetpack, a fall, a jump, easing down to land): not blocked or knocked by the cars. */air?:boolean;
 /** Nov 24 2026: the local player is on a ride faster than Town's bonk speed: a stopped car bonks instead of blocking. */fast?:boolean;
 /** AAA 4: Town's effective heat tier (0 best … 4 lowest): the spark and the glass sheen are off on the lowest. */tier?:number;
 /** Gameplay 2 (owner, Nov 24 2026): the train the local player is boarding or waiting for on its platform (-1: none): its doors
  *  are held open up to DOOR_HOLD s past their closing time (trainSchedule runner). */boardHold?:number};
export type TrainFrameResult={/** gentle slide for the local player (m this frame) */nudgeX:number;nudgeZ:number;/** POLISH 4: walked into an open doorway from the platform (train, car, door; -1 none): Town boards you standing */walkInTrain:number;walkInCar:number;walkInDoor:number;/** a note to show once */note:string|null;
 /** Gameplay 2: Conductor Kenji's new line this frame (trainConductor.ts), or null; the train he speaks from (-1: none) and its cab
  *  top (where Town keeps the bubble while that train holds for the local player). */say:string|null;sayTrain:number;cabX:number;cabY:number;cabZ:number;
 /** Nov 24 2026: a car hit the local player this frame: 'track' (the lead car's front swept them) or 'side' (a moving car's side, or
  *  a stopped one hit at speed), the way to throw them (knockX, knockZ: unit, away from the train, across it), the train's own
  *  heading (dirX, dirZ) and speed (m/s). Null: no hit. Town runs the bonk; the train never changes speed. */
 knock:null|'track'|'side';knockX:number;knockZ:number;dirX:number;dirZ:number;knockV:number;knockTrain:number};
type Person={x:number;y:number;z:number};
export function createTrainRunning(scene:T.Scene,obstacles:Obstacle[]|null=null){
 const L=trainLayout(),root=new T.Group();root.name='island-line-trains';scene.add(root);
 // ---- trains: per train one InstancedMesh (2 cars) with the vehicle material; the far tier swaps in the box geometry
 const detail=LIVERIES.map(lv=>buildCarGeometry(lv)),boxes=LIVERIES.map(buildCarBox),leaf=buildDoorLeaf();
 // The open (ridden) variant per livery, built the first time someone rides that livery (CPU only; same program, no compile).
 const openGeo:(T.BufferGeometry|null)[]=LIVERIES.map(()=>null),openOf=(lv:number)=>openGeo[lv]??(openGeo[lv]=buildCarGeometry(LIVERIES[lv],true).geometry);
 const trains=Array.from({length:TRAIN_COUNT},(_,i)=>{const look=createVehicleMaterial(),lv=i%LIVERIES.length,mesh=new T.InstancedMesh(detail[lv].geometry,look.material,TRAIN_CARS);
  mesh.name='train-'+'abc'[i];mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.castShadow=false;mesh.receiveShadow=false;mesh.frustumCulled=false;mesh.visible=false;
  look.lamp.set(1,.9,0,0);root.add(mesh);return {mesh,look,lv,far:false,spin:0,tun:0,tw:0,flick:-9,shade:1,dPrev:0,openAt:-9,shutAt:-9};});
 const doorLook=createVehicleMaterial(),DOOR_LEAVES=TRAIN_CARS*DOORS.length*4,doors=new T.InstancedMesh(leaf,doorLook.material,TRAIN_COUNT*DOOR_LEAVES);
 doors.name='train-doors';doors.instanceMatrix.setUsage(T.DynamicDrawUsage);doors.castShadow=false;doors.receiveShadow=false;doors.frustumCulled=false;doors.visible=false;doors.count=0;root.add(doors);
 const glass=createTrainGlass(TRAIN_COUNT*TRAIN_CARS,TRAIN_COUNT*DOOR_LEAVES);root.add(glass.mesh);// train visuals (Nov 24): every pane + the soft shadows, one draw
 const nightGlow=createTrainNightGlow(TRAIN_COUNT);root.add(nightGlow.mesh);// POLISH 3: the night lights, one additive draw (trainNightGlow.ts)
 const gp={x:0,z:0,tx:1,tz:0};
 const crossings=TRAIN_CROSSINGS.map((_,ci)=>buildCrossing(ci,obstacles));for(const x of crossings)root.add(x.mesh);
 const boards=buildBoards(obstacles);for(const b of boards.meshes)root.add(b.mesh);
 const wraps=createTrainWraps();root.add(wraps.mesh);// WRAPS: every train's kindness wrap, one draw (trainWraps.ts)
 // Destination plates (Phase 3): ONE mesh for every cab (2 per train) with the boards' material and canvas; its 4 corners per cab
 // are rewritten only for trains drawn in the near tier, the UVs only when a train's next stop changes.
 // Gameplay 3: after the cab plates, INSIDE_QUADS a car of interior quads (the poster titles, the route map bodies, the chime lamps),
 // car-local corners and UVs built once; written in world space only for the ridden / close-up trains (the rest stay collapsed).
 const CABS=TRAIN_COUNT*TRAIN_CARS,IQ=insideQuads(),INSIDE_QUADS=IQ.length,QUADS=CABS+CABS*INSIDE_QUADS;
 const platePos=new Float32Array(QUADS*4*3),plateUv=new Float32Array(QUADS*4*2),plateNor=new Float32Array(QUADS*4*3),plateIdx:number[]=[];
 for(let q=0;q<QUADS;q++){const o=q*4;plateIdx.push(o,o+1,o+2,o,o+2,o+3);}
 for(let q=0;q<CABS;q++)for(let k=0;k<INSIDE_QUADS;k++)plateUv.set(IQ[k].uv,(CABS+q*INSIDE_QUADS+k)*8);
 const plateGeo=new T.BufferGeometry();plateGeo.setAttribute('position',new T.BufferAttribute(platePos,3).setUsage(T.DynamicDrawUsage));plateGeo.setAttribute('normal',new T.BufferAttribute(plateNor,3).setUsage(T.DynamicDrawUsage));
 plateGeo.setAttribute('uv',new T.BufferAttribute(plateUv,2).setUsage(T.DynamicDrawUsage));plateGeo.setIndex(plateIdx);
 const plates=new T.Mesh(plateGeo,boards.mat);plates.name='train-plates';plates.frustumCulled=false;plates.matrixAutoUpdate=false;plates.visible=false;plates.castShadow=false;plates.receiveShadow=false;root.add(plates);
 const plateStop=new Int8Array(TRAIN_COUNT).fill(-1),PLATE_HW=.56,PLATE_HH=.1,PLATE_Y=3.43,PLATE_Z=6.012,pv3=new T.Vector3();
 const setPlateUv=(i:number,stop:number)=>{const h=BOARD_H,t=1-(PLATE_TOP+stop*PLATE_ROW+3)/h,b=1-(PLATE_TOP+(stop+1)*PLATE_ROW-3)/h;
  for(let c=0;c<TRAIN_CARS;c++){const o=(i*TRAIN_CARS+c)*8;plateUv.set([0,b,1,b,1,t,0,t],o);}};
 const plateCorner=(m:T.Matrix4,o:number,x:number,y:number)=>{pv3.set(x,y,PLATE_Z).applyMatrix4(m);platePos[o]=pv3.x;platePos[o+1]=pv3.y;platePos[o+2]=pv3.z;};
 /** Write cab c of train i's plate from its car matrix (allocation-free; the plate faces the car's +z). */
 /** Gameplay 3: car c of train i's interior quads in world space (close: the posters' titles; doorsOpen: the chime lamps lit on
  *  the open side `openSide`, car-local), or collapsed. Allocation-free. */
 const writeInside=(i:number,c:number,m:T.Matrix4,close:boolean,openSide:number)=>{const base=(CABS+(i*TRAIN_CARS+c)*INSIDE_QUADS)*12;
  if(!close){platePos.fill(0,base,base+INSIDE_QUADS*12);return;}const e=m.elements;
  for(let k=0;k<INSIDE_QUADS;k++){const q=IQ[k],o=base+k*12;if(q.chime&&q.side!==openSide){platePos.fill(0,o,o+12);continue;}
   for(let v=0;v<4;v++){pv3.set(q.p[v*3],q.p[v*3+1],q.p[v*3+2]).applyMatrix4(m);platePos[o+v*3]=pv3.x;platePos[o+v*3+1]=pv3.y;platePos[o+v*3+2]=pv3.z;
    const nx=q.n[0],ny=q.n[1],nz=q.n[2];plateNor[o+v*3]=e[0]*nx+e[4]*ny+e[8]*nz;plateNor[o+v*3+1]=e[1]*nx+e[5]*ny+e[9]*nz;plateNor[o+v*3+2]=e[2]*nx+e[6]*ny+e[10]*nz;}}};
 const writePlate=(i:number,c:number,m:T.Matrix4)=>{const q=i*TRAIN_CARS+c,o=q*12;plateCorner(m,o,-PLATE_HW,PLATE_Y-PLATE_HH);plateCorner(m,o+3,PLATE_HW,PLATE_Y-PLATE_HH);plateCorner(m,o+6,PLATE_HW,PLATE_Y+PLATE_HH);plateCorner(m,o+9,-PLATE_HW,PLATE_Y+PLATE_HH);
  const e=m.elements;for(let k=0;k<4;k++){plateNor[o+k*3]=e[8];plateNor[o+k*3+1]=e[9];plateNor[o+k*3+2]=e[10];}};
 const runner=createTrainRunner(),states:TrainState[]=Array.from({length:TRAIN_COUNT},newTrainState);
 const hornAt=new Float64Array(TRAIN_COUNT).fill(-1e9),noted=new Uint8Array(TRAIN_COUNT),wasBlocked=new Uint8Array(TRAIN_COUNT);
 // Phase 4 sounds (the island sound kit's synth cues, so mute and volume apply): the wheels' "ka-tan" over each rail joint (one per
 // car length, so its pace follows the speed), the door chime as the doors start to open or close, and the arrival melody.
 const clackRun=new Float32Array(TRAIN_COUNT),soundAt=new Int8Array(TRAIN_COUNT).fill(-2),doorWas=new Float32Array(TRAIN_COUNT).fill(-1);
 // Looks 2 (JOLT): per car the nudge and pitch, per train the wheel slip and the time since it last pulled out (sound edge)
 const joltZ=new Float32Array(TRAIN_COUNT*TRAIN_CARS),joltP=new Float32Array(TRAIN_COUNT*TRAIN_CARS),slip=new Float32Array(TRAIN_COUNT),depWas=new Float32Array(TRAIN_COUNT).fill(1e9),jo={z:0,p:0},jv=new T.Vector3();
 // platform announcements: the stop index last announced per train (arriving / leaving), the platforms' middles (3.5 m in from the line)
 const annIn=new Int8Array(TRAIN_COUNT).fill(-1),annOut=new Int8Array(TRAIN_COUNT).fill(-1);
 const PLAT=TRAIN_STOPS.map(sp=>{const c=trackAt(sp.station.s),n=leftNormal(c.tx,c.tz);return {x:c.x+n.x*sp.station.side*3.5,z:c.z+n.z*sp.station.side*3.5};});
 const onPlatform=(k:number,p:{x:number;z:number})=>Math.hypot(PLAT[k].x-p.x,PLAT[k].z-p.z)<ON_PLATFORM;
 const destOf=(k:number)=>TRAIN_STOPS[(k+1)%TRAIN_STOPS.length].station.name;
 const cam=new T.Vector3(),frustum=new T.Frustum(),pv=new T.Matrix4(),sphere=new T.Sphere(),m4=new T.Matrix4(),dm=new T.Matrix4(),flip=new T.Matrix4().makeRotationY(Math.PI),bx=new T.Vector3(),by=new T.Vector3(),bz=new T.Vector3();
 const pa={x:0,z:0,tx:1,tz:0},pb={x:0,z:0,tx:1,tz:0},pc={x:0,z:0,tx:1,tz:0},xs={lamps:false,arm:0};
 const people:Person[]=Array.from({length:17},()=>({x:0,y:0,z:0}));let nPeople=0;
 const addRemote=(x:number,y:number,z:number)=>{if(nPeople>=people.length)return;const p=people[nPeople++];p.x=x;p.y=y;p.z=z;};
 const result:TrainFrameResult={nudgeX:0,nudgeZ:0,walkInTrain:-1,walkInCar:-1,walkInDoor:-1,note:null,say:null,sayTrain:-1,cabX:0,cabY:0,cabZ:0,knock:null,knockX:0,knockZ:0,dirX:0,dirZ:0,knockV:0,knockTrain:-1},hit={gap:0,side:0,d:0,s:0};
 // Conductor Kenji's warning: warned this approach (per train), the bubble's seconds left, the line counter, the last shout (clock s)
 const warned=new Uint8Array(TRAIN_COUNT),sayLeft=new Float32Array(TRAIN_COUNT);let kenjiN=0,kenjiQuiet=-1e9;
 /** Seconds until train i's front (local phase runner.t) reaches `gap` m ahead of where it is now, up to `most` s (Infinity: later). */
 const eta=(i:number,front:number,gap:number,most:number)=>{for(let tau=.25;tau<=most+1e-6;tau+=.25){scheduleAt(runner.t[i]+tau,fresh);if(((fresh.s-front)%TRACK.length+TRACK.length)%TRACK.length>=gap)return tau;}return Infinity;};
 let primeLeft=0,clock=0,bellWait=0,boardWait=0,flipWait=0,xingWait=0,lastNow=0,warming=false;
 const onPlatformSide=(s:number,side:number)=>{for(const st of TRAIN_STATIONS)if(side===st.side&&Math.abs(((s-st.s)%TRACK.length+TRACK.length*1.5)%TRACK.length-TRACK.length/2)<STATION_HALF+1)return true;return false;};
 /** Allocation-free: is person p on the line between front + from and front + to (m along)? Fills `hit` (gap along, side, distance). */
 function onLine(p:Person,front:number,from:number,to:number,reach:number){
  const mid=trackAt(front+(from+to)/2,pc);if(Math.abs(p.x-mid.x)+Math.abs(p.z-mid.z)>(to-from)/2+reach+4)return false;
  for(let d=from;d<=to;d+=TRACK_DS){const s=wrapS(front+d),k=Math.floor(s/TRACK_DS)%TRACK.n,rx=TRACK.x[k],rz=TRACK.z[k],tx=TRACK.tx[k],tz=TRACK.tz[k];
   const along=(p.x-rx)*tx+(p.z-rz)*tz;if(along<-TRACK_DS*.55||along>TRACK_DS*.55)continue;const lat=(p.x-rx)*tz-(p.z-rz)*tx,side=lat>=0?1:-1,ad=Math.abs(lat);
   const limit=reach<LOOK_HALF+.01&&onPlatformSide(s,side)?1.4:reach;if(ad>limit)continue;
   const bed=bedAt(L.profile,s);if(p.y>bed+4.2||p.y<bed-1.2)continue;
   hit.s=wrapS(k*TRACK_DS+along);const g=((hit.s-front)%TRACK.length+TRACK.length*1.5)%TRACK.length-TRACK.length/2;hit.gap=g;hit.side=side;hit.d=ad;return true;}
  return false;}
 /** The nearest person ahead of train front `s`: their track s (NaN: clear); `who` = their index. */
 let who=-1,bestGap=Infinity;const whoHit={side:0,d:0};
 function personAhead(s:number){let best=Infinity,bs=NaN;who=-1;
  for(let k=0;k<nPeople;k++)if(onLine(people[k],s,0,WARN_AHEAD,LOOK_HALF)&&hit.gap<best){best=hit.gap;bs=hit.s;who=k;whoHit.side=hit.side;whoHit.d=hit.d;}
  bestGap=best;return bs;}
 const cue=(name:string,gain:number)=>{if(typeof document!=='undefined'&&typeof CustomEvent!=='undefined')document.dispatchEvent(new CustomEvent('fi2-job-cue',{detail:{cue:name,gain}}));};
 const all:T.Object3D[]=[...trains.map(t=>t.mesh),doors,glass.mesh,...crossings.map(x=>x.mesh),...boards.meshes.map(b=>b.mesh),plates,wraps.mesh/* WRAPS */];
 /** Car c of a train whose front is at track s: its matrix (local +z toward its cab; car 1 runs reversed). Allocation-free. */
 function carMatrix(s:number,c:number,out:T.Matrix4,v=0,ti=-1,w=1){const sc=s-c*(CAR_LENGTH+CAR_GAP)-CAR_LENGTH/2,sa=sc+BOGIE_HALF,sb=sc-BOGIE_HALF;trackAt(sa,pa);trackAt(sb,pb);
  const ya=bedAt(L.profile,sa)+RAIL_TOP,yb=bedAt(L.profile,sb)+RAIL_TOP,rev=c%2===1?-1:1;
  // AAA audit (Nov 24 2026): the body leans into a curve with the speed (the cant a real line gives its curves): v² × curvature,
  // at most LEAN_MAX rad (≈1.5° at 8 m/s on the tightest 30 m curve). Seats use the same matrix, so riders lean with the car.
  const lx=pb.tz,lz=-pb.tx,k=((pa.tx-pb.tx)*lx+(pa.tz-pb.tz)*lz)/(2*BOGIE_HALF),th=Math.max(-LEAN_MAX,Math.min(LEAN_MAX,v*v*k*LEAN));
  bz.set((pa.x-pb.x)*rev,(ya-yb)*rev,(pa.z-pb.z)*rev).normalize();by.set(lx*th,1,lz*th);bx.crossVectors(by,bz).normalize();by.crossVectors(bz,bx);
  let px=(pa.x+pb.x)/2,py=(ya+yb)/2,pz=(pa.z+pb.z)/2;
  // Looks 2: the departure / arrival jolt (JOLT): a nudge along the travel and a pitch about the car's cross axis (w: RIDE for riders)
  if(ti>=0){const o=ti*TRAIN_CARS+c,j=joltZ[o]*w*rev,p=joltP[o]*w*rev;if(j!==0){px+=bz.x*j;py+=bz.y*j;pz+=bz.z*j;}
   if(p!==0){const cs=Math.cos(p),sn=Math.sin(p);jv.copy(bz).multiplyScalar(cs).addScaledVector(by,sn);by.multiplyScalar(cs).addScaledVector(bz,-sn);bz.copy(jv);}}
  out.makeBasis(bx,by,bz);out.setPosition(px,py,pz);return out;}
 const seatM=new T.Matrix4(),roofM=new T.Matrix4(),seatV=new T.Vector3(),fresh=newTrainState();
 const api={
  root,triangles:detail[0].triangles,runner,states,
  /** Phase 3: 1 while someone (me or a drawn friend) rides train i: it draws its open variant (window holes, seats). Town writes it. */
  ridden:new Uint8Array(TRAIN_COUNT),
  /** Phase 3: where seat j of train k is (root on the car floor, facing the aisle). `now`: worked out for that clock from the
   *  timetable and the runner's lag (friends are posed before this frame's update); without it, from this frame's states. */
  seatPose(k:number,j:number,out:SeatPose,now?:number):SeatPose{return api.seatAt(k,PLAYER_SEATS[Math.max(0,Math.min(TRAIN_SEATS-1,j))],out,now);},
  /** Gameplay 2: SEAT_TABLE index i of train k (players: seatPose; NPC passengers and seat changes use this). Facing out of the window. */
  seatAt(k:number,i:number,out:SeatPose,now?:number):SeatPose{
   let s:number;if(now===undefined)s=states[k].s;else if(Number.isFinite(api.cluster))s=states[k].s;else s=scheduleAt(trainPhase(k,now)-runner.behind(k),fresh).s;
   const st=SEAT_TABLE[i];carMatrix(s,st.car,seatM,states[k].v,k,JOLT.ride);seatV.set(st.x,CAR_FLOOR_Y,st.z).applyMatrix4(seatM);
   const e=seatM.elements;out.x=seatV.x;out.y=seatV.y;out.z=seatV.z;out.yaw=Math.atan2(st.side*e[0],st.side*e[2]);out.lean=st.lean;return out;},
  /** Nov 24 2026: a standing rider at train-frame (x across, u along car 0; trainWalk.ts) of train k, facing `yaw` (train frame): the
   *  world spot on the floor and yaw. `now` as seatPose (friends are posed before this frame's update). Allocation-free. */
  standAt(k:number,x:number,u:number,yaw:number,out:SeatPose,now?:number,y=CAR_FLOOR_Y):SeatPose{
   let s:number;if(now===undefined)s=states[k].s;else if(Number.isFinite(api.cluster))s=states[k].s;else s=scheduleAt(trainPhase(k,now)-runner.behind(k),fresh).s;
   // Looks 2 (Nov 24 2026): on the roof (y over the car's sides: Town passes roofY(x)) the AC lids and the pantograph base are step-ups
   const pitch=CAR_LENGTH+CAR_GAP,c=u>=-pitch/2||TRAIN_CARS<2?0:1,lx=c?-x:x,lz=c?-pitch-u:u;if(y>ROOF_WALK_Y)y+=roofLift(x,u);carMatrix(s,c,seatM,states[k].v,k,JOLT.ride);seatV.set(lx,y,lz).applyMatrix4(seatM);
   const e=seatM.elements;out.x=seatV.x;out.y=seatV.y;out.z=seatV.z;out.yaw=Math.atan2(e[8],e[10])+yaw+(c?Math.PI:0);out.lean=1;return out;},
  /** Roof riding (trainRoof.ts, Nov 24 2026): the roof under world (x, z) of any train (a box test per car, only for trains within
   *  reach): out.k, the train-frame spot (out.x across, out.u along car 0) and the roof's world height there (out.y). False: none.
   *  `ahead` s (the landing ring's prediction): where the trains will be that long from now at their present speeds. */
  roofAt(x:number,z:number,out:{k:number;x:number;u:number;y:number},pad=0,ahead=0):boolean{
   for(let k=0;k<TRAIN_COUNT;k++){const st=states[k],s=ahead?wrapS(st.s+st.v*ahead):st.s;trackAt(s-TRAIN_LENGTH/2,pc);if(Math.abs(pc.x-x)+Math.abs(pc.z-z)>TRAIN_LENGTH+3)continue;
    for(let c=0;c<TRAIN_CARS;c++){carMatrix(s,c,roofM,st.v,k);const e=roofM.elements,dx=x-e[12],dz=z-e[14],ax=Math.hypot(e[0],e[2])||1,az=Math.hypot(e[8],e[10])||1;
     // POLISH 3 (the train-roof test's clock flake was real): the roof is ~4 m over the car's origin, and on a grade (the South Bridge,
     // 4.5%) or leaning into a curve the car's up axis tilts, so the plain horizontal projection put the spot up to 0.18 m off along
     // (and 0.1 m across) the car. Take the roof height's share of the tilted up axis out first.
     const hy=roofY(0),lx=((dx*e[0]+dz*e[2])/ax-hy*(e[4]*e[0]+e[6]*e[2])/ax)/ax,lz=((dx*e[8]+dz*e[10])/az-hy*(e[4]*e[8]+e[6]*e[10])/az)/az;
     if(Math.abs(lx)>ROOF_HALF+pad||Math.abs(lz)>CAR_LENGTH/2-ROOF_END_PAD+pad)continue;
     const cx=Math.max(-ROOF_HALF,Math.min(ROOF_HALF,lx));if(c%2===0){out.x=cx;out.u=lz;}else{out.x=-cx;out.u=-(CAR_LENGTH+CAR_GAP)-lz;}
     seatV.set(cx,roofY(cx)+roofLift(out.x,out.u),lz).applyMatrix4(roofM);out.k=k;out.y=seatV.y;return true;}}
   return false;},
  /** The landing ring's prediction (Nov 24 2026): a body at (x, y, z) moving at (vx, vy, vz) m/s (a parachute's glide and sink, a fall),
   *  stepped `step` s at a time up to `horizon` s: the first moment it meets a roof where the trains will be then (roofAt `ahead`), before
   *  it reaches `floor` (the ground / sea under it). out as roofAt (the train-frame spot) plus out.t (s from now). False: no roof on the way. */
  roofTouch(x:number,y:number,z:number,vx:number,vy:number,vz:number,floor:(x:number,z:number)=>number,out:{k:number;x:number;u:number;y:number;t:number},horizon=4,step=.1):boolean{
   let near=false;for(let k=0;k<TRAIN_COUNT;k++){trackAt(states[k].s-TRAIN_LENGTH/2,pc);if(Math.abs(pc.x-x)+Math.abs(pc.z-z)<TRAIN_LENGTH+3+horizon*(Math.abs(states[k].v)+Math.hypot(vx,vz))*1.5){near=true;break;}}
   if(!near)return false;
   for(let t=step;t<=horizon+1e-6;t+=step){const px=x+vx*t,pz=z+vz*t,py=y+vy*t;
    if(api.roofAt(px,pz,out,0,t)&&py<=out.y+.05){out.t=t;return true;}
    if(py<=floor(px,pz))return false;}
   return false;},
  /** Gameplay 2: car c of train k's matrix this frame (the hover outline, the car colliders). Allocation-free. */
  carMatrixOf(k:number,c:number,out:T.Matrix4){return carMatrix(states[k].s,c,out,states[k].v,k,JOLT.ride);},
  /** Gameplay 2: the open door of train k (standing at a stop) nearest x, z: a spot on the platform just outside it, facing in
   *  (out.yaw), and which car / door it is. Null while the train runs. Allocation-free. */
  /** AAA 4: the platform top (world y) of the stop train k stands at (the passengers' step down), NaN while it runs. */
  platformTop(k:number){const st=states[k];return st&&st.at>=0?bedAt(L.profile,TRAIN_STOPS[st.at].station.s)+STATION_PLATFORM_Y:NaN;},
  doorSpot(k:number,x:number,z:number,out:{x:number;y:number;z:number;yaw:number;car:number;door:number}){
   const st=states[k];if(st.at<0)return null;const side=TRAIN_STOPS[st.at].station.side,top=bedAt(L.profile,TRAIN_STOPS[st.at].station.s)+STATION_PLATFORM_Y;let best=Infinity;
   for(let c=0;c<TRAIN_CARS;c++){const sx=side*(c%2===1?-1:1);carMatrix(st.s,c,seatM,0,k);const e=seatM.elements;
    for(let d=0;d<DOORS.length;d++){seatV.set(sx*(HALF_W+.55),0,DOORS[d]).applyMatrix4(seatM);const dd=Math.hypot(seatV.x-x,seatV.z-z);
     if(dd<best){best=dd;out.x=seatV.x;out.z=seatV.z;out.y=top;out.yaw=Math.atan2(-sx*e[0],-sx*e[2]);out.car=c;out.door=d;}}}
   return out;},
  /** Debug / gfx views only (window.__fi2.trains.cluster = s): all three trains pinned close together at track s; NaN = the timetable. */
  cluster:NaN,
  /** When the priming frame was drawn (performance.now(); NaN until then). */
  primedAt:NaN,
  /** Town's warm-up: show everything for one compileAsync (programs ready before a train is first seen), then hide again. */
  /** Draw every train part for one frame in the real pass, 600 m under the island (never seen): pipeline set-up at load, not on first sight. */
  prime(){primeLeft=1;},
  /** Debug / checks only: true hides the night glow (the draw-count A/B in check-train-aaa night). */
  glowOff:false,
  /** POLISH 3: the street lamps' light-pool material (world.ts), shared by the trains' night glow. */
  useNightPool(mat:T.Material){nightGlow.use(mat);},
  warm(on:boolean){warming=on;for(const o of all)o.visible=on;for(const t of trains)t.mesh.count=TRAIN_CARS;doors.count=on?1:0;glass.warm(on);nightGlow.warm(on);},
  update(f:TrainFrame):TrainFrameResult{
   result.nudgeX=result.nudgeZ=0;result.walkInTrain=-1;result.note=null;result.say=null;result.sayTrain=-1;result.knock=null;result.knockTrain=-1;if(warming)return result;
   if(primeLeft>0){primeLeft--;api.primedAt=typeof performance!=='undefined'?performance.now():0;m4.makeTranslation(0,-600,0);
    for(const t of trains){t.mesh.visible=true;t.mesh.count=TRAIN_CARS;for(let c=0;c<TRAIN_CARS;c++)t.mesh.setMatrixAt(c,m4);t.mesh.instanceMatrix.needsUpdate=true;}
    doors.visible=true;doors.count=1;doors.setMatrixAt(0,m4);doors.instanceMatrix.needsUpdate=true;glass.prime(m4);wraps.prime(m4)/* WRAPS */;return result;}const dt=Math.max(0,Math.min(f.dt,.25));clock+=dt;
   const now=f.nowSec??trainClockSec();lastNow=now;if(f.camPos)cam.copy(f.camPos);else f.camera.getWorldPosition(cam);
   if(f.viewProj)pv.copy(f.viewProj);else pv.multiplyMatrices(f.camera.projectionMatrix,f.camera.matrixWorldInverse);frustum.setFromProjectionMatrix(pv);
   const riding=f.riding??-1;nPeople=0;bestGap=Infinity;{const p=people[nPeople++];p.x=f.player.x;p.y=riding>=0||f.onRoof?-999:f.player.y;p.z=f.player.z;}f.eachRemote?.(addRemote);// riding: never on the track
   const cluster=Number.isFinite(api.cluster),night=MACHINE_NIGHT.value as number;
   // ---- trains near the camera are simulated (people, catch-up); the rest are exactly where the timetable says
   for(let i=0;i<TRAIN_COUNT;i++){const st=states[i];
    if(cluster){trainAt(0,now,st);st.s=wrapS(api.cluster+i*(TRAIN_LENGTH+14));st.v=0;st.at=-1;st.doors=0;runner.t[i]=trainPhase(i,now);continue;}
    scheduleAt(trainPhase(i,now)-runner.behind(i),st);trackAt(st.s-TRAIN_LENGTH/2,pc);const d=Math.hypot(pc.x-cam.x,pc.z-cam.z);// where it is on THIS screen
    if(d>SIM_RANGE&&!(runner.behind(i)>0&&d<HIDE_RANGE)){runner.reset(i);runner.t[i]=trainPhase(i,now);noted[i]=0;wasBlocked[i]=0;warned[i]=0;continue;}
    // Never held for people (owner, Nov 24 2026): the runner only keeps the local door hold for a boarder (paid back by its catch-up).
    const personS=personAhead(st.s);runner.step(i,now,dt,NaN,st,f.boardHold===i);
    const ahead=Number.isFinite(personS),gap=ahead?bestGap:Infinity,soon=ahead?eta(i,st.s,gap,WARN_S):Infinity;
    // A remote player ahead: the horn as the train comes within WARN_S s of them (as before, once per approach).
    if(ahead&&who>0&&soon<=WARN_S&&!wasBlocked[i]&&d<HORN_RANGE&&clock-hornAt[i]>6){hornAt[i]=clock;cue('train-horn',Math.max(.25,1-gap/WARN_AHEAD));}
    wasBlocked[i]=ahead&&soon<=WARN_S?1:0;
    // The local player: once per approach, within WARN_S s: the horn (louder the closer) and Kenji's shout from the cab.
    if(ahead&&who===0){if(soon<=WARN_S&&!warned[i]){warned[i]=1;if(clock-hornAt[i]>2){hornAt[i]=clock;cue('train-horn',Math.max(.35,1-gap/WARN_AHEAD));}
      if(clock-kenjiQuiet>WARN_COOLDOWN){kenjiQuiet=clock;sayLeft[i]=KENJI.bubbleS;result.say=kenjiWarn(kenjiN++);}}}
    else warned[i]=0;
    if(sayLeft[i]>0){sayLeft[i]-=dt;result.sayTrain=i;carMatrix(st.s,0,m4,0,i,JOLT.ride);pv3.set(KENJI_SEAT.x,3.75+.5,KENJI_SEAT.z).applyMatrix4(m4)/* over Kenji in the cab (lib/graphics/trainKenji.ts) */;result.cabX=pv3.x;result.cabY=pv3.y;result.cabZ=pv3.z;}
    {const dp=riding===i?0:Math.hypot(pc.x-f.player.x,pc.z-f.player.z);// Phase 4 sounds, for the trains near the player (riding: the ridden one)
     if(st.v>.8&&dp<CLACK_RANGE){clackRun[i]+=st.v*dt;if(clackRun[i]>=CLACK_STEP){clackRun[i]-=CLACK_STEP;cue('train-clack',(riding===i?.55:1-dp/CLACK_RANGE)*Math.min(1.2,.4+st.v/12));}}
     if(st.at!==soundAt[i]){if(st.at>=0&&soundAt[i]!==-2&&(riding===i||dp<ARRIVE_SOUND))cue('train-arrive',riding===i?.8:Math.max(.25,1-dp/ARRIVE_SOUND));
      if(st.at>=0&&soundAt[i]!==-2&&(riding===i||dp<JOLT.sound))cue('train-halt',riding===i?.7:Math.max(.25,1-dp/JOLT.sound));soundAt[i]=st.at;}// Looks 2: the brake sigh + a soft clunk as it settles
     const closing=st.doors<1&&doorWas[i]===1;
     if((st.doors>0&&doorWas[i]===0||closing)&&(riding===i||dp<DOOR_SOUND))cue('train-chime',riding===i?.8:Math.max(.25,1-dp/DOOR_SOUND));doorWas[i]=st.doors;
     // Polish (Nov 24 2026): the platform announcement, as a caption (no voice files) for someone standing on that platform (not
     // riding): the chime and "The train for … is arriving" ANNOUNCE_S s before it pulls in; "… is leaving" as its doors close.
     if(riding<0){if(st.at>=0){annIn[i]=-1;const k=st.at;if(closing&&annOut[i]!==k&&onPlatform(k,f.player)){annOut[i]=k;result.note??=`The train for ${destOf(k)} is leaving.`;}}
      else{annOut[i]=-1;const k=st.next,w=((TRAIN_STOPS[k].arrive-st.t)%360+360)%360;
       if(w<=ANNOUNCE_S&&annIn[i]!==k&&onPlatform(k,f.player)){annIn[i]=k;cue('train-chime',.7);result.note??=`The train for ${destOf(k)} is arriving. Please stand behind the yellow line.`;}}}}
   }
   // ---- Gameplay 2: solid trains. One oriented box per car (its timetable pose, ±HALF_W × ±CAR_LENGTH/2 grown by PLAYER_R): the
   // local player on foot or on a scooter / bike / moped is pushed out along the shallower axis every frame (block and slide: they
   // never pass through and never stand inside a car). Riders are not tested. A few dot products per car near the player.
   // Nov 24 2026: a MOVING car (over KNOCK_V m/s), or any car hit by a fast ride (f.fast), knocks instead (result.knock: thrown
   // across, away from the car; 'track' when it is the lead car's front). Walking into a stopped car's side still just blocks.
   if(riding<0&&!f.onRoof&&!f.air){const P=f.player;for(let i=0;i<TRAIN_COUNT;i++){const st=states[i];trackAt(st.s-TRAIN_LENGTH/2,pc);if(Math.abs(pc.x-P.x)+Math.abs(pc.z-P.z)>TRAIN_LENGTH+4)continue;
    for(let c=0;c<TRAIN_CARS;c++){carMatrix(st.s,c,m4,st.v);const e=m4.elements,dx=P.x+result.nudgeX-e[12],dy=P.y-e[13],dz=P.z+result.nudgeZ-e[14];if(dy< -1.2||dy>3.2)continue;/* AAA 2: feet above the body side (3.1 m: on / over the roof) are not blocked (was 3.9: a roof lander was pushed sideways each frame) */
     const ax=Math.hypot(e[0],e[2])||1,az=Math.hypot(e[8],e[10])||1,lx=(dx*e[0]+dz*e[2])/ax,lz=(dx*e[8]+dz*e[10])/az,hx=HALF_W+PLAYER_R,hz=CAR_LENGTH/2+PLAYER_R;
     if(Math.abs(lx)>=hx||Math.abs(lz)>=hz)continue;const px=hx-Math.abs(lx),pz=hz-Math.abs(lz);
     // POLISH 4 (owner shot 69): at a stop with the doors open, an open doorway on the platform side is not solid: stepping 0.3 m into
     // it boards you standing (Town; a ride is stowed). Closed doors, the car's sides between doors and the far side stay solid.
     if(st.at>=0&&(st.doors??0)>.9&&Math.sign(lx)===TRAIN_STOPS[st.at].station.side*(c%2===1?-1:1)){let d=-1;for(let q=0;q<DOORS.length;q++)if(Math.abs(lz-DOORS[q])<DOOR_HALF-.1){d=q;break;}
      if(d>=0){if(px>.3&&result.walkInTrain<0){result.walkInTrain=i;result.walkInCar=c;result.walkInDoor=d;}continue;}}
     if((st.v>KNOCK_V||f.fast)&&!result.knock){const sg=Math.sign(lx||1)/ax,rev=c%2===1?-1:1;result.knock=c===0&&lz>CAR_LENGTH/2-1.4&&st.v>KNOCK_V?'track':'side';
      result.knockX=e[0]*sg;result.knockZ=e[2]*sg;result.dirX=e[8]/az*rev;result.dirZ=e[10]/az*rev;result.knockV=st.v;result.knockTrain=i;}
     if(px<=pz){const k=Math.sign(lx||1)*px/ax;result.nudgeX+=e[0]*k;result.nudgeZ+=e[2]*k;}else{const k=Math.sign(lz||1)*pz/az;result.nudgeX+=e[8]*k;result.nudgeZ+=e[10]*k;}}}}
   // ---- crossings: state at XING_HZ (events), arm swing per frame only while moving and drawn; the bell within BELL_RANGE m
   xingWait-=dt;const tick=xingWait<=0;if(tick)xingWait=1/XING_HZ;let bellX=Infinity;
   for(let ci=0;ci<crossings.length;ci++){const x=crossings[ci],show=Math.hypot(x.x-cam.x,x.z-cam.z)<x.show;if(x.mesh.visible!==show)x.mesh.visible=show;
    if(tick){let lamps=false,arm=0;if(!cluster)for(let i=0;i<TRAIN_COUNT;i++){crossingFor(ci,runner.t[i],xs);if(xs.lamps)lamps=true;if(xs.arm>arm)arm=xs.arm;}
     x.target=arm>.01?1:0;if(lamps!==x.lamps){x.lamps=lamps;x.flash=0;if(!lamps)x.look.lamp.z=0;}if(x.target!==x.arm)x.moving=true;}
    if(x.lamps){x.flash-=dt;if(x.flash<=0){x.flash=.5;x.look.lamp.z=x.look.lamp.z>0?-1.8:1.8;}const dp=Math.hypot(x.x-f.player.x,x.z-f.player.z);if(dp<bellX)bellX=dp;}
    if(x.moving){x.arm+=Math.sign(x.target-x.arm)*Math.min(Math.abs(x.target-x.arm),dt/3);if(x.arm===x.target)x.moving=false;
     const e=x.arm*x.arm*(3-2*x.arm),a=(1-e)*1.55;x.look.wheel.x=Math.cos(a);x.look.wheel.y=-Math.sin(a);}}// Phase 4: eased (smoothstep), never a snap
   bellWait-=dt;if(bellX<BELL_RANGE&&bellWait<=0){bellWait=.55;cue('train-bell',Math.max(.15,1-bellX/BELL_RANGE));}
   // ---- departure boards: 1 Hz, near stations only, uploaded on a change
   boardWait-=dt;if(boardWait<=0){boardWait=1/BOARD_HZ;let dirty=false;boards.mat.emissiveIntensity=night*.75;
    for(let r=0;r<boards.meshes.length;r++){const b=boards.meshes[r],near=Math.hypot(b.x-cam.x,b.z-cam.z)<BOARD_SHOW;if(b.mesh.visible!==near)b.mesh.visible=near;if(!near)continue;
     const n=nextTrains(b.stop,runner.t,2),l1=`Next train: ${waitText(n[0])} · to ${b.to}`,l2=`Then: ${waitText(n[1])}`,text=l1+'|'+l2;
     if(text!==b.text){const doFlip=b.text!==''&&!f.reduced&&Math.hypot(b.x-cam.x,b.z-cam.z)<FLIP_RANGE;b.o1=b.l1;b.o2=b.l2;b.text=text;b.l1=l1;b.l2=l2;
      if(doFlip)b.flip=0;else{b.flip=-1;boards.draw(r,l1,l2);dirty=true;}}}
    if(dirty)boards.tex.needsUpdate=true;}
   // the flips: ~FLIP_S s, redrawn at FLIP_HZ (one upload per step, only while a near board is flipping; off with reduced motion)
   flipWait-=dt;if(flipWait<=0){flipWait=1/FLIP_HZ;let dirty=false;
    for(let r=0;r<boards.meshes.length;r++){const b=boards.meshes[r];if(b.flip<0)continue;b.flip+=1/FLIP_HZ;const p=Math.min(1,b.flip/FLIP_S);
     boards.draw(r,b.l1,b.l2,b.o1,b.o2,p);dirty=true;if(p>=1)b.flip=-1;}
    if(dirty)boards.tex.needsUpdate=true;}
   // ---- Looks 2: the departure / arrival feel (JOLT), from the lap time; the pull-out sound (air release + couplers) in earshot
   for(let i=0;i<TRAIN_COUNT;i++){const st=states[i];let dep=Infinity;for(const sp of TRAIN_STOPS){const a=((st.t-sp.depart)%LAP+LAP)%LAP;if(a<dep)dep=a;}
    const arr=st.at>=0?((st.t-TRAIN_STOPS[st.at].arrive)%LAP+LAP)%LAP:Infinity,still=cluster||f.reduced;
    for(let c=0;c<TRAIN_CARS;c++){const o=i*TRAIN_CARS+c,amp=c===0?JOLT.amp0:JOLT.amp1,lag=c*JOLT.lag;
     if(still){joltZ[o]=joltP[o]=0;continue;}joltAt(dep-lag,amp,false,jo);let z=jo.z,p=jo.p;joltAt(arr-lag,amp,true,jo);joltZ[o]=z+jo.z;joltP[o]=p+jo.p;}
    {const k=Math.max(0,Math.min(1,(dep-.05)/JOLT.slip));slip[i]=still||dep>=JOLT.slip+.05?0:Math.PI*2*k*k*(3-2*k);}
    if(!cluster&&dep<.5&&depWas[i]>=.5){trackAt(st.s-TRAIN_LENGTH/2,pc);const dp=riding===i?0:Math.hypot(pc.x-f.player.x,pc.z-f.player.z);if(dp<JOLT.sound)cue('train-depart',riding===i?.75:Math.max(.25,1-dp/JOLT.sound));}
    depWas[i]=dep;}
   // ---- draw: on screen and within HIDE_RANGE m; the box tier past LOD_RANGE m; wheels and doors move within ANIMATE_RANGE m
   let nd=0,np=0;glass.begin();wraps.begin();/* WRAPS */const glow=nightGlow.begin(night,cam)&&!api.glowOff;
   for(let i=0;i<TRAIN_COUNT;i++){const st=states[i],tr=trains[i];trackAt(st.s-TRAIN_LENGTH/2,pc);const d=Math.hypot(pc.x-cam.x,pc.z-cam.z);
    sphere.center.set(pc.x,bedAt(L.profile,st.s-TRAIN_LENGTH/2)+2,pc.z);sphere.radius=TRAIN_LENGTH/2+3;
    const show=i===riding||d<HIDE_RANGE&&frustum.intersectsSphere(sphere);/* the train I ride: always drawn */if(tr.mesh.visible!==show)tr.mesh.visible=show;if(!show)continue;
    const d3=Math.hypot(d,sphere.center.y-cam.y),size=12.4*f.camera.projectionMatrix.elements[5]/Math.max(1,d3);
    const far=tr.far?size<LOD_NEAR_OUT:size<LOD_FAR_IN;tr.far=far;{const g=far?boxes[tr.lv]:api.ridden[i]||d3<CLOSE_RANGE?openOf(tr.lv):detail[tr.lv].geometry;if(tr.mesh.geometry!==g)tr.mesh.geometry=g;}
    if(!far&&plateStop[i]!==st.next){plateStop[i]=st.next;setPlateUv(i,st.next);(plateGeo.attributes.uv as T.BufferAttribute).needsUpdate=true;}
    const animate=d<ANIMATE_RANGE,stop=st.at>=0?TRAIN_STOPS[st.at]:null,side=stop?stop.station.side:1;
    // AAA 4: the door leaves ease (smoothstep), give a small cushion past fully open and a rebound as they meet (none with reduced motion)
    const dn=st.doors;if(dn>=1&&tr.dPrev<1)tr.openAt=clock;if(dn<=0&&tr.dPrev>0)tr.shutAt=clock;tr.dPrev=dn;
    let leaf=dn*dn*(3-2*dn);if(!f.reduced&&stop){const a=clock-tr.openAt,b=clock-tr.shutAt;if(a<DOOR_BOUNCE[0])leaf+=.045*Math.sin(Math.PI*a/DOOR_BOUNCE[0]);if(b<DOOR_BOUNCE[1])leaf+=.05*Math.sin(Math.PI*b/DOOR_BOUNCE[1]);}
    const open=animate?Math.max(0,leaf):0;
    if(animate){tr.spin=(st.s/WHEEL_R+slip[i])%(Math.PI*2);tr.look.wheel.x=Math.cos(tr.spin);tr.look.wheel.y=Math.sin(tr.spin);}
    // AAA 4 (interior feel): the light over the car by track section, eased: dimmer in the tunnel (the car's own lamps take over: the
    // interior / window channel comes up), a soft pulse of shade under the South Bridge's truss members; the material's colour only
    const sm=st.s-TRAIN_LENGTH/2,inTun=sm>TUNNEL.west.s&&sm<TUNNEL.east.s,truss=inSouthBridgeS(sm)&&!f.reduced?.5+.5*Math.sin(sm*Math.PI*2/3.6):0;
    const shadeTo=inTun?SHADE.tunnel:1-SHADE.truss*truss*truss;tr.shade+=(shadeTo-tr.shade)*(1-Math.exp(-(inTun?3:9)*dt));tr.look.material.color.setScalar(tr.shade);
    tr.look.lamp.z=night*INTERIOR_GLOW+(1-tr.shade)*SHADE.lamp;// the window band: the indicator channel, lit by the shared night factor
    // AAA 4: the pantograph arm folds a little with the car's bounce on the rail joints (vehicle shader PART.panto), at speed only
    tr.look.sway.y=f.reduced||!animate?0:Math.min(1,st.v/8)*(.028*Math.sin(st.s*1.7+i)+.014*Math.sin(st.s*4.3));
    // Polish (Nov 24 2026): headlamps up at night and full in the tunnel (from 20 m before the west mouth until the rear is out of
    // the east one), eased over ~0.3 s: the head / tail lamp channels of the same uniform, no light, no new shader.
    {const want=tunnelLamps(st.s)?1:0;tr.tun+=(want-tr.tun)*(1-Math.exp(-3*dt));if(want!==tr.tw){tr.tw=want;tr.flick=clock;}
     // AAA 4: the headlamps flicker for ~0.5 s as they switch up / down at the tunnel mouth (a cheap channel multiply; not reduced motion)
     const fk=animate&&!f.reduced&&clock-tr.flick<.5?(Math.sin(clock*71+i)*Math.sin(clock*43)>.15?.5:1):1;tr.look.lamp.x=(1+.6*night+1.4*tr.tun)*fk;tr.look.lamp.y=.9+.5*tr.tun;}
    if(glow){// POLISH 3: the headlamp beam on the track ahead of the leading cab (on the curve's own tangent) and on the tunnel walls
     for(let b=0;b<3;b++){const sb=st.s+9+b*5;trackAt(sb,gp);const y=bedAt(L.profile,sb)+RAIL_TOP,w=(.85-b*.2)*(1+.4*tr.tun);nightGlow.beam(gp.x,y,gp.z,gp.tx,gp.tz,w);
      if(sb>TUNNEL.west.s&&sb<TUNNEL.east.s){nightGlow.wall(gp.x,y,gp.z,gp.tx,gp.tz,TUNNEL_HALF_WIDTH-.06,w);nightGlow.wall(gp.x,y,gp.z,gp.tx,gp.tz,-(TUNNEL_HALF_WIDTH-.06),w);}}}
    for(let c=0;c<TRAIN_CARS;c++){const rev=c%2===1?-1:1;carMatrix(st.s,c,m4,st.v,i);tr.mesh.setMatrixAt(c,m4);glass.shadow(m4);
     if(glow){const sc=st.s-c*(CAR_LENGTH+CAR_GAP)-CAR_LENGTH/2,kind=L.profile.kind[Math.round(wrapS(sc)/TRACK_DS)%TRACK.n];let ps=0;
      for(const ts of TRAIN_STATIONS){const ds=Math.abs(((sc-ts.s)%TRACK.length+TRACK.length*1.5)%TRACK.length-TRACK.length/2);if(ds<STATION_HALF){ps=ts.side*rev;break;}}
      nightGlow.car(m4,-RAIL_TOP,ps,STATION_PLATFORM_Y-RAIL_TOP,c===0,c===TRAIN_CARS-1,kind!==TrackKind.Sea);
      // AAA 4: now and then (one 0.4 s bucket in ~23, a train at speed) a tiny blue-white spark where the pan meets the wire; not on the lowest tier
      if(c===sparkCar(i,clock)&&st.v>4&&(f.tier??0)<4&&!f.reduced)nightGlow.spark(m4,0,4.8,-.7,.55+.35*Math.abs(Math.sin(clock*57)),1);}
     if(far){writeInside(i,c,m4,false,0);continue;}glass.car(m4);writePlate(i,c,m4);np++;wraps.car(i,c,m4,size);// WRAPS: faded by on-screen size
     writeInside(i,c,m4,!!api.ridden[i]||d3<CLOSE_RANGE,open>0?side*rev:0);// Gameplay 3: poster titles + chime lamps (lit while the doors open)// doors: drawn only in the near tier; open on the platform side while standing
     for(let s=-1;s<=1;s+=2){const o=open>0&&s===side*rev?open:0;
      for(let dI=0;dI<DOORS.length;dI++)for(let dir=-1;dir<=1;dir+=2){dm.makeTranslation(s*(HALF_W+.02),(DOOR_Y0+DOOR_Y1)/2,DOORS[dI]+dir*(DOOR_HALF/2+o*DOOR_HALF*.95));if(s<0)dm.multiply(flip);dm.premultiply(m4);doors.setMatrixAt(nd++,dm);glass.door(dm);}}}
    tr.mesh.instanceMatrix.needsUpdate=true;}
   // plates: the near-tier cabs only (the rest collapse to nothing); one upload a frame while any is drawn
   const pvis=np>0;if(plates.visible!==pvis)plates.visible=pvis;
   if(pvis){for(let i=0;i<TRAIN_COUNT;i++)if(!trains[i].mesh.visible||trains[i].far){platePos.fill(0,i*TRAIN_CARS*12,(i+1)*TRAIN_CARS*12);const b=(CABS+i*TRAIN_CARS*INSIDE_QUADS)*12;platePos.fill(0,b,b+TRAIN_CARS*INSIDE_QUADS*12);}
    (plateGeo.attributes.position as T.BufferAttribute).needsUpdate=true;(plateGeo.attributes.normal as T.BufferAttribute).needsUpdate=true;}
   if(doors.count!==nd)doors.count=nd;const dv=nd>0;if(doors.visible!==dv)doors.visible=dv;if(dv)doors.instanceMatrix.needsUpdate=true;
   doorLook.lamp.z=night*2.6;doorLook.material.color.setScalar(riding>=0&&riding<TRAIN_COUNT?trains[riding].shade:1);glass.sheen.w=(f.tier??0)>=4?0:1-night*.75;glass.end();nightGlow.end();wraps.end(night);// WRAPS
   return result;
  },
  /** Phase 3: crossing ci's lamps are flashing or its arms are not up (road traffic stops at it: the causeway's cayTraffic). */
  crossingClosed(ci:number){const x=crossings[ci];return !!x&&(x.lamps||x.arm>.02||x.target>0);},
  /** Headless checks only (read, never per frame): every crossing's live state, and the pure timetable functions. */
  get xings(){return crossings.map((x,ci)=>({id:TRAIN_CROSSINGS[ci].id,lamps:x.lamps,arm:+x.arm.toFixed(3),target:x.target,x:x.x,z:x.z,shown:x.mesh.visible}));},
  sched:{trainAt,crossingFor,trainPhase,clock:()=>trainClockSec(),stops:TRAIN_STOPS,crossings:TRAIN_CROSSINGS,trackAt:(s:number)=>trackAt(s,{x:0,z:0,tx:1,tz:0}),bed:(s:number)=>bedAt(L.profile,s),
   /** headless checks (check-train-aaa track / roof parts): the row kind at s (TrackKind), the walk top, deck tests */kind:(s:number)=>L.profile.kind[Math.round(wrapS(s)/TRACK_DS)%TRACK.n],tunnelS:[TUNNEL.west.s,TUNNEL.east.s],walkTop:trainWalkHeight,deckAt:trainDeckAt,swimDeckBlocked,swimBlocked:trainSwimBlocked,heads:bridgeHeads},
  /** For tests and the gfx probe: what is drawn right now. */
  get drawn(){let cars=0,far=0;for(const t of trains)if(t.mesh.visible){cars+=TRAIN_CARS;if(t.far)far+=TRAIN_CARS;}
   return {cars,far,plates:plates.visible,ridden:api.ridden.reduce((a,b)=>a+b,0),doors:doors.visible?doors.count:0,crossings:crossings.filter(x=>x.mesh.visible).length,boards:boards.meshes.filter(b=>b.mesh.visible).length,wraps:wraps.drawn,wrapArt:wraps.clubArt/* WRAPS */,now:lastNow};},
  dispose(){nightGlow.dispose();for(const d of detail)d.geometry.dispose();for(const g of openGeo)g?.dispose();plateGeo.dispose();for(const b of boxes)b.dispose();leaf.dispose();for(const t of trains){t.look.material.dispose();t.mesh.dispose();}
   doorLook.material.dispose();doors.dispose();glass.dispose();for(const x of crossings){x.mesh.geometry.dispose();x.look.material.dispose();}
   for(const b of boards.meshes)b.mesh.geometry.dispose();boards.mat.dispose();boards.tex.dispose();wraps.dispose()/* WRAPS */;root.removeFromParent();},
 };
 return api;
}
export type TrainRunning=ReturnType<typeof createTrainRunning>;
