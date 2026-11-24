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
 *  - People on the track (the local player and drawn remote players): a train looks LOOK_AHEAD m ahead (±LOOK_HALF m), sounds its
 *    horn, slows and stops STOP_SHORT m short; after 5 s it asks the local player to step off and slides them gently aside.
 *  - Departure boards: "Next train: 1 min · to Coral Cay" and the following train, redrawn at BOARD_HZ (1 Hz) only for stations
 *    within BOARD_SHOW m, uploaded only when a line changes (Nov 24 polish: a 0.3 s split-flap flip of the changed line within
 *    FLIP_RANGE m, 6 uploads, none with reduced motion). Free-standing (own post and collider) on the platform.
 *  - No allocation per frame; every mesh is built at load and warm() lets Town compile the programs before a train is seen.
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {TRACK,TRACK_DS,TRAIN_STATIONS,TRAIN_CROSSINGS,STATION_HALF,STATION_PLATFORM_Y,TrackKind,TUNNEL,trackAt,leftNormal,wrapS,bedAt} from './trainTrack';
import {trainLayout} from './trainLayout';
import {TRAIN_COUNT,TRAIN_CARS,CAR_LENGTH,CAR_GAP,TRAIN_LENGTH,LOOK_AHEAD,LOOK_HALF,STOP_SHORT,TRAIN_STOPS,createTrainRunner,newTrainState,trainAt,trainPhase,
 scheduleAt,crossingFor,nextTrains,waitText,trainClockSec,type TrainState} from './trainSchedule';
import {createVehicleMaterial,PART} from '../graphics/trafficVehicles';
import {MACHINE_NIGHT} from '../graphics/machineNightGlow';
/** The front from 20 m short of the west portal until the rear has left the east one (trains run west → east through the hill). */
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
/** Seconds held for a person before the local player is asked to step off and slid aside. */
export const STEP_OFF_AFTER=5,SLIDE_SPEED=1.2;
/** The car model and its dimensions live in trainCarModel.ts (Nov 24 2026 split). */
import {RAIL_TOP,WHEEL_R,BOGIE_HALF,HALF_W,DOORS,DOOR_HALF,DOOR_Y0,DOOR_Y1,WIN_RUNS,CAR_FLOOR_Y,BENCH_X,COL,VGeo,type V,buildCarGeometry,buildCarBox,buildDoorLeaf,createTrainGlass,CLOSE_RANGE,INTERIOR_GLOW} from './trainCarModel';
const LEAN=.012,LEAN_MAX=.035;
/** Seats (Phase 3): long benches along the walls (a Japanese local train), one rider per bench run, facing the aisle; 4 per car.
 *  Seat j of a train: car j>>2, side (j&1 ? +x : -x), bench run 1 + ((j>>1)&1). The rider's root stands on the floor, BENCH.rootZ
 *  in front of the bench centre (npcSeatPose 'bench': seat top .64 above the root), so the island's bench pose fits as it is. */
export const SEATS_PER_CAR=4,TRAIN_SEATS=TRAIN_CARS*SEATS_PER_CAR;
export {CAR_FLOOR_Y};
const SEAT_ROOT_X=BENCH_X-.05;
const seatZ=(j:number)=>{const [a,b]=WIN_RUNS[1+((j>>1)&1)];return (a+b)/2;};
export type SeatPose={x:number;y:number;z:number;yaw:number};

import {LIVERIES} from './trainLiveries';
export {LIVERIES};
export {buildCarGeometry,buildCarBox};
// ---------------------------------------------------------------- crossings (one mesh each; arms = "wheels", lamps = indicators)
function buildCrossing(ci:number,obstacles:Obstacle[]|null){
 const L=trainLayout(),c=TRAIN_CROSSINGS[ci],a=trackAt(c.s),i=Math.round(wrapS(c.s)/TRACK_DS)%TRACK.n,bed=L.profile.bed[i],g=new VGeo();
 // local frame: +z along the line (the arms lie along it, across the path), +x left of travel, y up from the bed
 const uBase=-(c.width/2+.5),len=c.width+.6;
 // Phase 4: a footpath crossing's machine is smaller (5 post bands, lamps at 1.5 m, the arm at 0.85 m: hip height for walkers).
 const bands=c.ped?5:7,lampY=c.ped?1.5:2.05,barY=c.ped?1.74:2.32,armY=c.ped?.85:1;
 // A skewed footpath (c.skew: metres along the line per metre across it) shifts each side's post and arm with the path, so the
 // post stands beside the path on both sides and the arm spans it.
 for(const v of [-3.1,3.1]){const u0=uBase+(c.skew??0)*v;
  for(let k=0;k<bands;k++)g.box(v,.2+k*.32,u0,.075,.16,.075,k%2?COL.post:COL.yellow);// the machine's striped post
  g.box(v,lampY,u0-.12,.13,.13,.06,COL.lamp,PART.left);g.box(v,lampY,u0+.12,.13,.13,.06,COL.lamp,PART.right);// twin lamps, flashing in turn
  g.box(v,barY,u0,.05,.04,.3,COL.post);
  const pv:V=[v-Math.sign(v)*.2,armY,u0];g.box(pv[0],pv[1],pv[2],.12,.18,.14,COL.post);// the arm's motor box (still)
  const seg=Math.max(4,Math.round(len/.6));for(let s=0;s<seg;s++){const z=u0+(s+.5)/seg*len;g.box(pv[0],pv[1],z,.04,.05,len/seg/2,s%2?COL.post:COL.yellow,PART.rearWheel,pv);}
  g.box(pv[0],pv[1],u0-.35,.07,.09,.25,COL.metal,PART.rearWheel,pv);// counterweight
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
const PLATE_ROW=40,PLATE_TOP=BOARD_ROW*TRAIN_STATIONS.length+16,BOARD_H=PLATE_TOP+PLATE_ROW*TRAIN_STATIONS.length;
function buildBoards(obstacles:Obstacle[]|null){
 const L=trainLayout(),cv=document.createElement('canvas');cv.width=BOARD_W;cv.height=BOARD_H;
 const g=cv.getContext('2d');if(g){g.fillStyle='#16191c';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#3a2c20';g.fillRect(0,PLATE_TOP-16,cv.width,16);
  // destination plates (amber on black, the plate's lit look), one row per stop in TRAIN_STOPS order
  g.textAlign='center';g.textBaseline='middle';for(let r=0;r<TRAIN_STOPS.length;r++){const y=PLATE_TOP+r*PLATE_ROW;g.fillStyle='#1b1712';g.fillRect(0,y,BOARD_W,PLATE_ROW);
   g.fillStyle='#ffb43a';g.font='800 30px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';g.fillText(TRAIN_STOPS[r].station.name.toUpperCase(),BOARD_W/2,y+PLATE_ROW/2+1,BOARD_W-24);}}
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
 /** Remote players drawn on this screen (x, y, z). */eachRemote?:(cb:(x:number,y:number,z:number)=>void)=>void;
 /** Tests only: the shared clock (s) instead of trainClockSec(). */nowSec?:number;
 /** Phase 3: the train the local player rides (-1: none): they are not a person on the track and are never pushed out of it. */riding?:number;
 /** prefers-reduced-motion: the boards change without the flip. */reduced?:boolean};
export type TrainFrameResult={/** gentle slide for the local player (m this frame) */nudgeX:number;nudgeZ:number;/** a note to show once */note:string|null};
type Person={x:number;y:number;z:number};
export function createTrainRunning(scene:T.Scene,obstacles:Obstacle[]|null=null){
 const L=trainLayout(),root=new T.Group();root.name='island-line-trains';scene.add(root);
 // ---- trains: per train one InstancedMesh (2 cars) with the vehicle material; the far tier swaps in the box geometry
 const detail=LIVERIES.map(lv=>buildCarGeometry(lv)),boxes=LIVERIES.map(buildCarBox),leaf=buildDoorLeaf();
 // The open (ridden) variant per livery, built the first time someone rides that livery (CPU only; same program, no compile).
 const openGeo:(T.BufferGeometry|null)[]=LIVERIES.map(()=>null),openOf=(lv:number)=>openGeo[lv]??(openGeo[lv]=buildCarGeometry(LIVERIES[lv],true).geometry);
 const trains=Array.from({length:TRAIN_COUNT},(_,i)=>{const look=createVehicleMaterial(),lv=i%LIVERIES.length,mesh=new T.InstancedMesh(detail[lv].geometry,look.material,TRAIN_CARS);
  mesh.name='train-'+'abc'[i];mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.castShadow=false;mesh.receiveShadow=false;mesh.frustumCulled=false;mesh.visible=false;
  look.lamp.set(1,.9,0,0);root.add(mesh);return {mesh,look,lv,far:false,spin:0,tun:0};});
 const doorLook=createVehicleMaterial(),DOOR_LEAVES=TRAIN_CARS*DOORS.length*4,doors=new T.InstancedMesh(leaf,doorLook.material,TRAIN_COUNT*DOOR_LEAVES);
 doors.name='train-doors';doors.instanceMatrix.setUsage(T.DynamicDrawUsage);doors.castShadow=false;doors.receiveShadow=false;doors.frustumCulled=false;doors.visible=false;doors.count=0;root.add(doors);
 const glass=createTrainGlass(TRAIN_COUNT*TRAIN_CARS,TRAIN_COUNT*DOOR_LEAVES);root.add(glass.mesh);// train visuals (Nov 24): every pane + the soft shadows, one draw
 const crossings=TRAIN_CROSSINGS.map((_,ci)=>buildCrossing(ci,obstacles));for(const x of crossings)root.add(x.mesh);
 const boards=buildBoards(obstacles);for(const b of boards.meshes)root.add(b.mesh);
 // Destination plates (Phase 3): ONE mesh for every cab (2 per train) with the boards' material and canvas; its 4 corners per cab
 // are rewritten only for trains drawn in the near tier, the UVs only when a train's next stop changes.
 const CABS=TRAIN_COUNT*TRAIN_CARS,platePos=new Float32Array(CABS*4*3),plateUv=new Float32Array(CABS*4*2),plateNor=new Float32Array(CABS*4*3),plateIdx:number[]=[];
 for(let q=0;q<CABS;q++){const o=q*4;plateIdx.push(o,o+1,o+2,o,o+2,o+3);}
 const plateGeo=new T.BufferGeometry();plateGeo.setAttribute('position',new T.BufferAttribute(platePos,3).setUsage(T.DynamicDrawUsage));plateGeo.setAttribute('normal',new T.BufferAttribute(plateNor,3).setUsage(T.DynamicDrawUsage));
 plateGeo.setAttribute('uv',new T.BufferAttribute(plateUv,2).setUsage(T.DynamicDrawUsage));plateGeo.setIndex(plateIdx);
 const plates=new T.Mesh(plateGeo,boards.mat);plates.name='train-plates';plates.frustumCulled=false;plates.matrixAutoUpdate=false;plates.visible=false;plates.castShadow=false;plates.receiveShadow=false;root.add(plates);
 const plateStop=new Int8Array(TRAIN_COUNT).fill(-1),PLATE_HW=.56,PLATE_HH=.1,PLATE_Y=3.43,PLATE_Z=6.012,pv3=new T.Vector3();
 const setPlateUv=(i:number,stop:number)=>{const h=BOARD_H,t=1-(PLATE_TOP+stop*PLATE_ROW+3)/h,b=1-(PLATE_TOP+(stop+1)*PLATE_ROW-3)/h;
  for(let c=0;c<TRAIN_CARS;c++){const o=(i*TRAIN_CARS+c)*8;plateUv.set([0,b,1,b,1,t,0,t],o);}};
 const plateCorner=(m:T.Matrix4,o:number,x:number,y:number)=>{pv3.set(x,y,PLATE_Z).applyMatrix4(m);platePos[o]=pv3.x;platePos[o+1]=pv3.y;platePos[o+2]=pv3.z;};
 /** Write cab c of train i's plate from its car matrix (allocation-free; the plate faces the car's +z). */
 const writePlate=(i:number,c:number,m:T.Matrix4)=>{const q=i*TRAIN_CARS+c,o=q*12;plateCorner(m,o,-PLATE_HW,PLATE_Y-PLATE_HH);plateCorner(m,o+3,PLATE_HW,PLATE_Y-PLATE_HH);plateCorner(m,o+6,PLATE_HW,PLATE_Y+PLATE_HH);plateCorner(m,o+9,-PLATE_HW,PLATE_Y+PLATE_HH);
  const e=m.elements;for(let k=0;k<4;k++){plateNor[o+k*3]=e[8];plateNor[o+k*3+1]=e[9];plateNor[o+k*3+2]=e[10];}};
 const runner=createTrainRunner(),states:TrainState[]=Array.from({length:TRAIN_COUNT},newTrainState);
 const hornAt=new Float64Array(TRAIN_COUNT).fill(-1e9),noted=new Uint8Array(TRAIN_COUNT),wasBlocked=new Uint8Array(TRAIN_COUNT);
 // Phase 4 sounds (the island sound kit's synth cues, so mute and volume apply): the wheels' "ka-tan" over each rail joint (one per
 // car length, so its pace follows the speed), the door chime as the doors start to open or close, and the arrival melody.
 const clackRun=new Float32Array(TRAIN_COUNT),soundAt=new Int8Array(TRAIN_COUNT).fill(-2),doorWas=new Float32Array(TRAIN_COUNT).fill(-1);
 // platform announcements: the stop index last announced per train (arriving / leaving), the platforms' middles (3.5 m in from the line)
 const annIn=new Int8Array(TRAIN_COUNT).fill(-1),annOut=new Int8Array(TRAIN_COUNT).fill(-1);
 const PLAT=TRAIN_STOPS.map(sp=>{const c=trackAt(sp.station.s),n=leftNormal(c.tx,c.tz);return {x:c.x+n.x*sp.station.side*3.5,z:c.z+n.z*sp.station.side*3.5};});
 const onPlatform=(k:number,p:{x:number;z:number})=>Math.hypot(PLAT[k].x-p.x,PLAT[k].z-p.z)<ON_PLATFORM;
 const destOf=(k:number)=>TRAIN_STOPS[(k+1)%TRAIN_STOPS.length].station.name;
 const cam=new T.Vector3(),frustum=new T.Frustum(),pv=new T.Matrix4(),sphere=new T.Sphere(),m4=new T.Matrix4(),dm=new T.Matrix4(),flip=new T.Matrix4().makeRotationY(Math.PI),bx=new T.Vector3(),by=new T.Vector3(),bz=new T.Vector3();
 const pa={x:0,z:0,tx:1,tz:0},pb={x:0,z:0,tx:1,tz:0},pc={x:0,z:0,tx:1,tz:0},xs={lamps:false,arm:0};
 const people:Person[]=Array.from({length:17},()=>({x:0,y:0,z:0}));let nPeople=0;
 const addRemote=(x:number,y:number,z:number)=>{if(nPeople>=people.length)return;const p=people[nPeople++];p.x=x;p.y=y;p.z=z;};
 const result:TrainFrameResult={nudgeX:0,nudgeZ:0,note:null},hit={gap:0,side:0,d:0,s:0};
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
 let who=-1;const whoHit={side:0,d:0};
 function personAhead(s:number){let best=Infinity,bs=NaN;who=-1;
  for(let k=0;k<nPeople;k++)if(onLine(people[k],s,0,LOOK_AHEAD+STOP_SHORT,LOOK_HALF)&&hit.gap<best){best=hit.gap;bs=hit.s;who=k;whoHit.side=hit.side;whoHit.d=hit.d;}
  return bs;}
 const cue=(name:string,gain:number)=>{if(typeof document!=='undefined'&&typeof CustomEvent!=='undefined')document.dispatchEvent(new CustomEvent('fi2-job-cue',{detail:{cue:name,gain}}));};
 const all:T.Object3D[]=[...trains.map(t=>t.mesh),doors,glass.mesh,...crossings.map(x=>x.mesh),...boards.meshes.map(b=>b.mesh),plates];
 /** Car c of a train whose front is at track s: its matrix (local +z toward its cab; car 1 runs reversed). Allocation-free. */
 function carMatrix(s:number,c:number,out:T.Matrix4,v=0){const sc=s-c*(CAR_LENGTH+CAR_GAP)-CAR_LENGTH/2,sa=sc+BOGIE_HALF,sb=sc-BOGIE_HALF;trackAt(sa,pa);trackAt(sb,pb);
  const ya=bedAt(L.profile,sa)+RAIL_TOP,yb=bedAt(L.profile,sb)+RAIL_TOP,rev=c%2===1?-1:1;
  // AAA audit (Nov 24 2026): the body leans into a curve with the speed (the cant a real line gives its curves): v² × curvature,
  // at most LEAN_MAX rad (≈1.5° at 8 m/s on the tightest 30 m curve). Seats use the same matrix, so riders lean with the car.
  const lx=pb.tz,lz=-pb.tx,k=((pa.tx-pb.tx)*lx+(pa.tz-pb.tz)*lz)/(2*BOGIE_HALF),th=Math.max(-LEAN_MAX,Math.min(LEAN_MAX,v*v*k*LEAN));
  bz.set((pa.x-pb.x)*rev,(ya-yb)*rev,(pa.z-pb.z)*rev).normalize();by.set(lx*th,1,lz*th);bx.crossVectors(by,bz).normalize();by.crossVectors(bz,bx);
  out.makeBasis(bx,by,bz);out.setPosition((pa.x+pb.x)/2,(ya+yb)/2,(pa.z+pb.z)/2);return out;}
 const seatM=new T.Matrix4(),seatV=new T.Vector3(),fresh=newTrainState();
 const api={
  root,triangles:detail[0].triangles,runner,states,
  /** Phase 3: 1 while someone (me or a drawn friend) rides train i: it draws its open variant (window holes, seats). Town writes it. */
  ridden:new Uint8Array(TRAIN_COUNT),
  /** Phase 3: where seat j of train k is (root on the car floor, facing the aisle). `now`: worked out for that clock from the
   *  timetable and the runner's lag (friends are posed before this frame's update); without it, from this frame's states. */
  seatPose(k:number,j:number,out:SeatPose,now?:number):SeatPose{
   let s:number;if(now===undefined)s=states[k].s;else if(Number.isFinite(api.cluster))s=states[k].s;else s=scheduleAt(trainPhase(k,now)-runner.behind(k),fresh).s;
   const c=Math.min(TRAIN_CARS-1,j>>2),side=(j&1)?1:-1;carMatrix(s,c,seatM,states[k].v);seatV.set(side*SEAT_ROOT_X,CAR_FLOOR_Y,seatZ(j)).applyMatrix4(seatM);
   const e=seatM.elements;out.x=seatV.x;out.y=seatV.y;out.z=seatV.z;out.yaw=Math.atan2(-side*e[0],-side*e[2]);return out;},
  /** Debug / gfx views only (window.__fi2.trains.cluster = s): all three trains pinned close together at track s; NaN = the timetable. */
  cluster:NaN,
  /** When the priming frame was drawn (performance.now(); NaN until then). */
  primedAt:NaN,
  /** Town's warm-up: show everything for one compileAsync (programs ready before a train is first seen), then hide again. */
  /** Draw every train part for one frame in the real pass, 600 m under the island (never seen): pipeline set-up at load, not on first sight. */
  prime(){primeLeft=1;},
  warm(on:boolean){warming=on;for(const o of all)o.visible=on;for(const t of trains)t.mesh.count=TRAIN_CARS;doors.count=on?1:0;glass.warm(on);},
  update(f:TrainFrame):TrainFrameResult{
   result.nudgeX=result.nudgeZ=0;result.note=null;if(warming)return result;
   if(primeLeft>0){primeLeft--;api.primedAt=typeof performance!=='undefined'?performance.now():0;m4.makeTranslation(0,-600,0);
    for(const t of trains){t.mesh.visible=true;t.mesh.count=TRAIN_CARS;for(let c=0;c<TRAIN_CARS;c++)t.mesh.setMatrixAt(c,m4);t.mesh.instanceMatrix.needsUpdate=true;}
    doors.visible=true;doors.count=1;doors.setMatrixAt(0,m4);doors.instanceMatrix.needsUpdate=true;glass.prime(m4);return result;}const dt=Math.max(0,Math.min(f.dt,.25));clock+=dt;
   const now=f.nowSec??trainClockSec();lastNow=now;f.camera.getWorldPosition(cam);
   pv.multiplyMatrices(f.camera.projectionMatrix,f.camera.matrixWorldInverse);frustum.setFromProjectionMatrix(pv);
   const riding=f.riding??-1;nPeople=0;{const p=people[nPeople++];p.x=f.player.x;p.y=riding>=0?-999:f.player.y;p.z=f.player.z;}f.eachRemote?.(addRemote);// riding: never on the track
   const cluster=Number.isFinite(api.cluster),night=MACHINE_NIGHT.value as number;
   // ---- trains near the camera are simulated (people, catch-up); the rest are exactly where the timetable says
   for(let i=0;i<TRAIN_COUNT;i++){const st=states[i];
    if(cluster){trainAt(0,now,st);st.s=wrapS(api.cluster+i*(TRAIN_LENGTH+14));st.v=0;st.at=-1;st.doors=0;runner.t[i]=trainPhase(i,now);continue;}
    scheduleAt(trainPhase(i,now)-runner.behind(i),st);trackAt(st.s-TRAIN_LENGTH/2,pc);const d=Math.hypot(pc.x-cam.x,pc.z-cam.z);// where it is on THIS screen
    if(d>SIM_RANGE&&!(runner.behind(i)>0&&d<HIDE_RANGE)){runner.reset(i);runner.t[i]=trainPhase(i,now);noted[i]=0;wasBlocked[i]=0;continue;}
    const stopAt=personAhead(st.s);runner.step(i,now,dt,stopAt,st);
    const blocked=Number.isFinite(stopAt);
    if(blocked&&!wasBlocked[i]&&st.v>1&&d<HORN_RANGE&&clock-hornAt[i]>6){hornAt[i]=clock;cue('train-horn',Math.max(.25,1-d/HORN_RANGE));}
    wasBlocked[i]=blocked?1:0;
    {const dp=riding===i?0:Math.hypot(pc.x-f.player.x,pc.z-f.player.z);// Phase 4 sounds, for the trains near the player (riding: the ridden one)
     if(st.v>.8&&dp<CLACK_RANGE){clackRun[i]+=st.v*dt;if(clackRun[i]>=CLACK_STEP){clackRun[i]-=CLACK_STEP;cue('train-clack',(riding===i?.55:1-dp/CLACK_RANGE)*Math.min(1.2,.4+st.v/12));}}
     if(st.at!==soundAt[i]){if(st.at>=0&&soundAt[i]!==-2&&(riding===i||dp<ARRIVE_SOUND))cue('train-arrive',riding===i?.8:Math.max(.25,1-dp/ARRIVE_SOUND));soundAt[i]=st.at;}
     const closing=st.doors<1&&doorWas[i]===1;
     if((st.doors>0&&doorWas[i]===0||closing)&&(riding===i||dp<DOOR_SOUND))cue('train-chime',riding===i?.8:Math.max(.25,1-dp/DOOR_SOUND));doorWas[i]=st.doors;
     // Polish (Nov 24 2026): the platform announcement, as a caption (no voice files) for someone standing on that platform (not
     // riding): the chime and "The train for … is arriving" ANNOUNCE_S s before it pulls in; "… is leaving" as its doors close.
     if(riding<0){if(st.at>=0){annIn[i]=-1;const k=st.at;if(closing&&annOut[i]!==k&&onPlatform(k,f.player)){annOut[i]=k;result.note??=`The train for ${destOf(k)} is leaving.`;}}
      else{annOut[i]=-1;const k=st.next,w=((TRAIN_STOPS[k].arrive-st.t)%360+360)%360;
       if(w<=ANNOUNCE_S&&annIn[i]!==k&&onPlatform(k,f.player)){annIn[i]=k;cue('train-chime',.7);result.note??=`The train for ${destOf(k)} is arriving. Please stand behind the yellow line.`;}}}}
    // Held for the LOCAL player: after STEP_OFF_AFTER s, ask once and slide them gently off the track (never a knock).
    if(blocked&&who===0&&runner.heldFor(i)>=STEP_OFF_AFTER){if(!noted[i]){noted[i]=1;result.note='Please step off the track';}
     if(whoHit.d<LOOK_HALF+.4){const t=trackAt(stopAt,pa),k=SLIDE_SPEED*dt*(whoHit.side||1);result.nudgeX+=t.tz*k;result.nudgeZ+=-t.tx*k;}}
    else if(!blocked)noted[i]=0;}
   // ---- the local player never stands inside a car: pushed out to the side
   if(riding<0)for(let i=0;i<TRAIN_COUNT;i++){if(onLine(people[0],states[i].s,-TRAIN_LENGTH-.3,0,HALF_W+.4)){const push=HALF_W+.45-hit.d,t=trackAt(hit.s,pa);if(push>0){result.nudgeX+=t.tz*hit.side*push;result.nudgeZ+=-t.tx*hit.side*push;}break;}}
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
   // ---- draw: on screen and within HIDE_RANGE m; the box tier past LOD_RANGE m; wheels and doors move within ANIMATE_RANGE m
   let nd=0,np=0;glass.begin();
   for(let i=0;i<TRAIN_COUNT;i++){const st=states[i],tr=trains[i];trackAt(st.s-TRAIN_LENGTH/2,pc);const d=Math.hypot(pc.x-cam.x,pc.z-cam.z);
    sphere.center.set(pc.x,bedAt(L.profile,st.s-TRAIN_LENGTH/2)+2,pc.z);sphere.radius=TRAIN_LENGTH/2+3;
    const show=d<HIDE_RANGE&&frustum.intersectsSphere(sphere);if(tr.mesh.visible!==show)tr.mesh.visible=show;if(!show)continue;
    const d3=Math.hypot(d,sphere.center.y-cam.y),size=12.4*f.camera.projectionMatrix.elements[5]/Math.max(1,d3);
    const far=tr.far?size<LOD_NEAR_OUT:size<LOD_FAR_IN;tr.far=far;{const g=far?boxes[tr.lv]:api.ridden[i]||d3<CLOSE_RANGE?openOf(tr.lv):detail[tr.lv].geometry;if(tr.mesh.geometry!==g)tr.mesh.geometry=g;}
    if(!far&&plateStop[i]!==st.next){plateStop[i]=st.next;setPlateUv(i,st.next);(plateGeo.attributes.uv as T.BufferAttribute).needsUpdate=true;}
    const animate=d<ANIMATE_RANGE,stop=st.at>=0?TRAIN_STOPS[st.at]:null,side=stop?stop.station.side:1,open=animate?st.doors:0;
    if(animate){tr.spin=(st.s/WHEEL_R)%(Math.PI*2);tr.look.wheel.x=Math.cos(tr.spin);tr.look.wheel.y=Math.sin(tr.spin);}
    tr.look.lamp.z=night*INTERIOR_GLOW;// the window band: the indicator channel, lit by the shared night factor
    // Polish (Nov 24 2026): headlamps up at night and full in the tunnel (from 20 m before the west mouth until the rear is out of
    // the east one), eased over ~0.3 s: the head / tail lamp channels of the same uniform, no light, no new shader.
    {const want=tunnelLamps(st.s)?1:0;tr.tun+=(want-tr.tun)*(1-Math.exp(-3*dt));tr.look.lamp.x=1+.6*night+1.4*tr.tun;tr.look.lamp.y=.9+.5*tr.tun;}
    for(let c=0;c<TRAIN_CARS;c++){const rev=c%2===1?-1:1;carMatrix(st.s,c,m4,st.v);tr.mesh.setMatrixAt(c,m4);glass.shadow(m4);
     if(far)continue;glass.car(m4);writePlate(i,c,m4);np++;// doors: drawn only in the near tier; open on the platform side while standing
     for(let s=-1;s<=1;s+=2){const o=open>0&&s===side*rev?open:0;
      for(let dI=0;dI<DOORS.length;dI++)for(let dir=-1;dir<=1;dir+=2){dm.makeTranslation(s*(HALF_W+.02),(DOOR_Y0+DOOR_Y1)/2,DOORS[dI]+dir*(DOOR_HALF/2+o*DOOR_HALF*.95));if(s<0)dm.multiply(flip);dm.premultiply(m4);doors.setMatrixAt(nd++,dm);glass.door(dm);}}}
    tr.mesh.instanceMatrix.needsUpdate=true;}
   // plates: the near-tier cabs only (the rest collapse to nothing); one upload a frame while any is drawn
   const pvis=np>0;if(plates.visible!==pvis)plates.visible=pvis;
   if(pvis){for(let i=0;i<TRAIN_COUNT;i++)if(!trains[i].mesh.visible||trains[i].far)platePos.fill(0,i*TRAIN_CARS*12,(i+1)*TRAIN_CARS*12);
    (plateGeo.attributes.position as T.BufferAttribute).needsUpdate=true;(plateGeo.attributes.normal as T.BufferAttribute).needsUpdate=true;}
   if(doors.count!==nd)doors.count=nd;const dv=nd>0;if(doors.visible!==dv)doors.visible=dv;if(dv)doors.instanceMatrix.needsUpdate=true;
   doorLook.lamp.z=night*2.6;glass.end();
   return result;
  },
  /** Phase 3: crossing ci's lamps are flashing or its arms are not up (road traffic stops at it: the causeway's cayTraffic). */
  crossingClosed(ci:number){const x=crossings[ci];return !!x&&(x.lamps||x.arm>.02||x.target>0);},
  /** Headless checks only (read, never per frame): every crossing's live state, and the pure timetable functions. */
  get xings(){return crossings.map((x,ci)=>({id:TRAIN_CROSSINGS[ci].id,lamps:x.lamps,arm:+x.arm.toFixed(3),target:x.target,x:x.x,z:x.z,shown:x.mesh.visible}));},
  sched:{trainAt,crossingFor,trainPhase,clock:()=>trainClockSec(),stops:TRAIN_STOPS,crossings:TRAIN_CROSSINGS,trackAt:(s:number)=>trackAt(s,{x:0,z:0,tx:1,tz:0}),bed:(s:number)=>bedAt(L.profile,s)},
  /** For tests and the gfx probe: what is drawn right now. */
  get drawn(){let cars=0,far=0;for(const t of trains)if(t.mesh.visible){cars+=TRAIN_CARS;if(t.far)far+=TRAIN_CARS;}
   return {cars,far,plates:plates.visible,ridden:api.ridden.reduce((a,b)=>a+b,0),doors:doors.visible?doors.count:0,crossings:crossings.filter(x=>x.mesh.visible).length,boards:boards.meshes.filter(b=>b.mesh.visible).length,now:lastNow};},
  dispose(){for(const d of detail)d.geometry.dispose();for(const g of openGeo)g?.dispose();plateGeo.dispose();for(const b of boxes)b.dispose();leaf.dispose();for(const t of trains){t.look.material.dispose();t.mesh.dispose();}
   doorLook.material.dispose();doors.dispose();glass.dispose();for(const x of crossings){x.mesh.geometry.dispose();x.look.material.dispose();}
   for(const b of boards.meshes)b.mesh.geometry.dispose();boards.mat.dispose();boards.tex.dispose();root.removeFromParent();},
 };
 return api;
}
export type TrainRunning=ReturnType<typeof createTrainRunning>;
