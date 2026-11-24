/**
 * The Island Line's running trains (train Phase 2, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md §4, §5, §7).
 * Added to the scene after the batching pass (world.ts), like the tunnel tube. Positions come from the shared timetable
 * (trainSchedule.ts), so nothing here is sent over the network.
 *
 * Draw calls (heat, AGENTS.md): ONE InstancedMesh for every car of all three trains (body, doors, bogies and wheels, pantograph,
 * lamps and the destination board are one geometry; a 3-row livery atlas and two per-instance attributes pick the livery, the
 * car's end, the doors, the wheel roll and the destination tile), ONE merged mesh for all five crossings' barrier arms and lamps
 * (a uniform per crossing), and the five departure boards (one shared canvas texture; one draw where one is seen). No shadows.
 *  - Trains past HIDE_RANGE m or off-screen are left out of the instance list (no draw when none is left); wheels, doors and lamps
 *    move only within ANIMATE_RANGE m. A train far from the camera is never simulated: it is wherever the timetable says.
 *  - Crossings: lamps flash and the arms come down CROSSING_WARN s before a train; the bell rings only within BELL_RANGE m
 *    (the island sound kit's 'fi2-job-cue', so mute and volume apply). The crossing mesh is hidden past XING_SHOW m.
 *  - People on the track (the local player and drawn remote players): a train looks LOOK_AHEAD m ahead (±LOOK_HALF m), sounds
 *    its horn, slows and stops STOP_SHORT m short; after 5 s it asks the local player to step off and slides them gently aside.
 *  - Departure boards: "Next train: 1 min · to Coral Cay" and the following train, redrawn at BOARD_HZ (1 Hz) only for stations
 *    within BOARD_SHOW m, uploaded only when a line changes.
 *  - Night: the window band glows warm and the headlamps brighten with the shared night factor (MACHINE_NIGHT): no lights.
 */
import * as T from 'three';
import {TRACK,TRAIN_STATIONS,TRAIN_CROSSINGS,STATION_HALF,STATION_PLATFORM_Y,trackAt,trackNearest,leftNormal,wrapS,bedAt} from './trainTrack';
import {trainLayout} from './trainLayout';
import {RAIL_TOP} from './trainWorld';
import {TRAIN_COUNT,TRAIN_CARS,CAR_LENGTH,CAR_GAP,TRAIN_LENGTH,LOOK_AHEAD,LOOK_HALF,STOP_SHORT,TRAIN_STOPS,createTrainRunner,newTrainState,trainAt,trainPhase,scheduleAt,
 crossingFor,nextTrains,waitText,trainClockSec,ahead,type TrainState} from './trainSchedule';
import {MACHINE_NIGHT,MACHINE_GLOW} from '../graphics/machineNightGlow';

export const ANIMATE_RANGE=80,HIDE_RANGE=400,SIM_RANGE=260,BELL_RANGE=60,HORN_RANGE=220,XING_SHOW=160,BOARD_SHOW=150,BOARD_HZ=1;
/** Seconds held for a person before the local player is asked to step off and slid aside. */
export const STEP_OFF_AFTER=5,SLIDE_SPEED=1.2;
const WHEEL_R=.43,BOGIE_HALF=4.5,HALF_W=1.4;

// ---------------------------------------------------------------- livery atlas (1024 × 960; rows of ROW_H px, one per livery)
const ATLAS=1024,ATLAS_H=960,ROW_H=300,DEST_Y=905,DEST_H=48,DEST_W=204;
/** Cells inside a row (px; y relative to the row top). */
const CELL={side:[0,0,800,200],cab:[800,0,1024,270],rear:[0,200,200,300],roof:[220,210,300,290],under:[320,210,380,290],door:[460,200,540,300],
 metal:[560,210,600,290],lamp:[620,210,660,290],marker:[680,210,720,290],dark:[740,210,780,290]} as const;
type Livery={upper:string;lower:string;stripes:[number,number,string][];/* y (m) centre, height (m), colour */roof:string;plate:string;emblem:boolean};
/** A: cream / maroon, two cream lines, our ball emblem headmark (from ref 9.png). B: sea-green / sky-blue, red line (ref 8.png).
 *  C: cream / ocean-blue, sunflower line. All original: no real company's logo, number or emblem. */
export const LIVERIES:readonly Livery[]=[
 {upper:'#f2e9d2',lower:'#8c2a2f',stripes:[[1.62,.05,'#f2e9d2'],[1.78,.05,'#f2e9d2']],roof:'#b8bbbe',plate:'FI 01',emblem:true},
 {upper:'#a3dccb',lower:'#5aa8de',stripes:[[2.05,.08,'#d6343a']],roof:'#bfc3c4',plate:'FI 02',emblem:false},
 {upper:'#f2e9d2',lower:'#1f5c9c',stripes:[[2.05,.1,'#f5c21b']],roof:'#b8bbbe',plate:'FI 03',emblem:false},
];
const GLASS='#3a5367',WINDSCREEN='#1c2630',INTERIOR='#2a2b30';
/** Doors along one side (centre z, m from the car's middle; the cab is at +z) and the window panels between them. */
const DOORS=[-3.7,-.2,3.1],DOOR_HALF=.65,DOOR_Y0=1.12,DOOR_Y1=3.02,WIN_Y0=2.18,WIN_Y1=3.0,BODY_Y0=1.05,SIDE_TOP=3.4,ROOF_TOP=3.75;
function drawAtlas(){
 const cv=document.createElement('canvas');cv.width=ATLAS;cv.height=ATLAS_H;const g=cv.getContext('2d');if(!g)return cv;
 const sans='system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
 LIVERIES.forEach((lv,r)=>{const y0=r*ROW_H;
  // a < 1: window glass (alpha .9 on a cleared patch, so it stays .9): the shader's night-glow mask
  const fill=(c:string,x:number,y:number,w:number,h:number,a=1)=>{if(a<1)g.clearRect(x,y0+y,w,h);g.globalAlpha=a;g.fillStyle=c;g.fillRect(x,y0+y,w,h);g.globalAlpha=1;};
  // ---- side: x = (z + 6) × 800 / 12, y = (SIDE_TOP − y) × 200 / (SIDE_TOP − BODY_Y0)
  {const [cx0,,cx1]=CELL.side,X=(z:number)=>cx0+(z+6)*(cx1-cx0)/12,Y=(y:number)=>(SIDE_TOP-y)*200/(SIDE_TOP-BODY_Y0);
   fill(lv.upper,cx0,0,cx1-cx0,Y(2.05));fill(lv.lower,cx0,Y(2.05),cx1-cx0,200-Y(2.05));
   for(const [y,h,c] of lv.stripes)fill(c,cx0,Y(y+h/2),cx1-cx0,Math.max(3,h*85));
   fill('#00000022',cx0,Y(1.12),cx1-cx0,3);
   // windows between the doors (and the cab's small side window at the +z end)
   const runs:[number,number][]=[[-5.75,DOORS[0]-DOOR_HALF-.25],[DOORS[0]+DOOR_HALF+.25,DOORS[1]-DOOR_HALF-.25],[DOORS[1]+DOOR_HALF+.25,DOORS[2]-DOOR_HALF-.25]];
   for(const [a,b] of runs){const n=Math.max(1,Math.round((b-a)/1.15)),w=(b-a)/n;for(let k=0;k<n;k++){fill(GLASS,X(a+k*w+.07),Y(WIN_Y1),(w-.14)*800/12,Y(WIN_Y0)-Y(WIN_Y1),.9);}}
   fill(WINDSCREEN,X(4.95),Y(2.95),.62*800/12,Y(2.25)-Y(2.95));
   for(const z of DOORS)fill(INTERIOR,X(z-DOOR_HALF),Y(DOOR_Y1),2*DOOR_HALF*800/12,Y(DOOR_Y0)-Y(DOOR_Y1));
   fill('#00000030',cx0,0,cx1-cx0,4);}
  // ---- cab end: x = (v + 1.2) × 224 / 2.4 (v across, left of travel = +), y = (ROOF_TOP − y) × 100
  {const [cx0,,cx1]=CELL.cab,X=(v:number)=>cx0+(v+1.2)*(cx1-cx0)/2.4,Y=(y:number)=>(ROOF_TOP-y)*100;
   fill(lv.upper,cx0,0,cx1-cx0,Y(2.05));fill(lv.lower,cx0,Y(2.05),cx1-cx0,270-Y(2.05));
   for(const [y,h,c] of lv.stripes)fill(c,cx0,Y(y+h/2),cx1-cx0,Math.max(3,h*100));
   fill(lv.roof,cx0,0,cx1-cx0,Y(3.55));
   fill('#202326',X(-1.06),Y(3.2),X(1.06)-X(-1.06),Y(2.28)-Y(3.2));// windscreen frame
   for(const [a,b] of [[-1,-.05],[.05,1]] as const)fill(WINDSCREEN,X(a),Y(3.14),X(b)-X(a),Y(2.34)-Y(3.14));
   g.strokeStyle='#111';g.lineWidth=3;for(const v of [-.55,.55]){g.beginPath();g.moveTo(X(v-.32),y0+Y(2.38));g.lineTo(X(v+.18),y0+Y(2.9));g.stroke();}// wipers
   fill('#111',X(-.64),Y(3.58),X(.64)-X(-.64),Y(3.28)-Y(3.58));// destination board recess (the lit tile sits on it)
   // headmark: our ball emblem (A) or a plain round plate; the number plate below
   const hx=X(0),hy=y0+Y(1.66);
   if(lv.emblem){g.fillStyle='#d9b45a';g.beginPath();g.arc(hx,hy,22,0,Math.PI*2);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(hx,hy,18,0,Math.PI*2);g.fill();
    g.fillStyle='#1d1d1d';g.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+k*Math.PI*2/5;g.lineTo(hx+Math.cos(a)*6.5,hy+Math.sin(a)*6.5);}g.closePath();g.fill();
    for(let k=0;k<5;k++){const a=-Math.PI/2+k*Math.PI*2/5;g.beginPath();g.moveTo(hx+Math.cos(a)*6.5,hy+Math.sin(a)*6.5);g.lineTo(hx+Math.cos(a)*18,hy+Math.sin(a)*18);g.strokeStyle='#1d1d1d';g.lineWidth=2;g.stroke();}}
   g.fillStyle='#f7f4ea';g.fillRect(hx-26,y0+Y(1.32),52,16);g.fillStyle='#1d1d1d';g.font=`800 13px ${sans}`;g.textAlign='center';g.textBaseline='middle';g.fillText(lv.plate,hx,y0+Y(1.32)+8.5);}
  // ---- inner end (gangway): x = (v + 1.4) × 200 / 2.8, y = (ROOF_TOP − y) × 100 / 2.7
  {const [cx0,cy0,cx1]=CELL.rear,X=(v:number)=>cx0+(v+1.4)*(cx1-cx0)/2.8,Y=(y:number)=>cy0+(ROOF_TOP-y)*100/2.7;
   fill(lv.upper,cx0,cy0,cx1-cx0,Y(2.05)-cy0);fill(lv.lower,cx0,Y(2.05),cx1-cx0,cy0+100-Y(2.05));fill(lv.roof,cx0,cy0,cx1-cx0,Y(3.5)-cy0);
   fill('#3b3c40',X(-.45),Y(3.05),X(.45)-X(-.45),Y(1.1)-Y(3.05));fill(GLASS,X(-.3),Y(2.95),X(.3)-X(-.3),Y(2.3)-Y(2.95),.9);}
  // ---- door leaf: the body colours with a tall window (alpha .9: it glows at night like the others)
  {const [cx0,cy0,cx1,cy1]=CELL.door,h=cy1-cy0,Y=(y:number)=>cy0+(DOOR_Y1-y)*h/(DOOR_Y1-DOOR_Y0);
   fill(lv.upper,cx0,cy0,cx1-cx0,Y(2.05)-cy0);fill(lv.lower,cx0,Y(2.05),cx1-cx0,cy1-Y(2.05));
   for(const [y,hh,c] of lv.stripes)if(y-hh/2>DOOR_Y0)fill(c,cx0,Y(y+hh/2),cx1-cx0,Math.max(2,hh*50));
   fill(GLASS,cx0+14,Y(2.95),cx1-cx0-28,Y(2.25)-Y(2.95),.9);fill('#00000040',cx0,cy0,2,h);fill('#00000040',cx1-2,cy0,2,h);}
  fill(lv.roof,...rect(CELL.roof));fill('#2f3135',...rect(CELL.under));fill('#8d9297',...rect(CELL.metal));fill('#fff4d6',...rect(CELL.lamp));fill('#ff8a24',...rect(CELL.marker));fill('#1f2022',...rect(CELL.dark));
 });
 // ---- destination tiles (shared by every livery): one per station, amber on black
 TRAIN_STATIONS.forEach((st,k)=>{const x=k*DEST_W;g.fillStyle='#0d0d0d';g.fillRect(x,DEST_Y,DEST_W-4,DEST_H);g.fillStyle='#ffb43a';g.font=`800 ${st.name.length>9?24:28}px ${sans}`;g.textAlign='center';g.textBaseline='middle';g.fillText(st.name,x+(DEST_W-4)/2,DEST_Y+DEST_H/2+1);});
 return cv;
}
const rect=(c:readonly number[]):[number,number,number,number]=>[c[0],c[1],c[2]-c[0],c[3]-c[1]];

// ---------------------------------------------------------------- one car's geometry (local: +z toward its cab, +x left, y up from the rail top)
/** aFx.x kinds: 0 body (row-shifted; alpha < 1 = window glass that glows at night), 1 door leaf (aFx.y = slide direction along z),
 *  2 wheel (aFx.y = axle z), 3 pantograph (folded away on the second car), 4 headlamp, 5 marker / tail lamp, 6 destination tile. */
const K={body:0,door:1,wheel:2,panto:3,head:4,marker:5,dest:6} as const;
class CarGeo{
 p:number[]=[];n:number[]=[];uv:number[]=[];fx:number[]=[];
 tri(a:number[],b:number[],c:number[],ua:number[],ub:number[],uc:number[],kind:number,param=0,inside?:number[]){
  const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  if(inside){const mx=(a[0]+b[0]+c[0])/3-inside[0],my=(a[1]+b[1]+c[1])/3-inside[1],mz=(a[2]+b[2]+c[2])/3-inside[2];if(nx*mx+ny*my+nz*mz<0){[b,c]=[c,b];[ub,uc]=[uc,ub];nx=-nx;ny=-ny;nz=-nz;}}
  const l=Math.hypot(nx,ny,nz)||1;this.p.push(...a,...b,...c);this.uv.push(...ua,...ub,...uc);for(let i=0;i<3;i++){this.n.push(nx/l,ny/l,nz/l);this.fx.push(kind,param);}}
 quad(a:number[],b:number[],c:number[],d:number[],ua:number[],ub:number[],uc:number[],ud:number[],kind:number,param:number,inside:number[]){this.tri(a,b,c,ua,ub,uc,kind,param,inside);this.tri(a,c,d,ua,uc,ud,kind,param,inside);}
 /** A box (centre, half sizes) in one solid cell. */
 box(cx:number,cy:number,cz:number,hx:number,hy:number,hz:number,uv:number[],kind:number,param=0,skipBottom=true){
  const P=(a:number,b:number,c:number)=>[cx+hx*a,cy+hy*b,cz+hz*c],C=[cx,cy,cz],u=uv;
  const f=(a:number[],b:number[],c:number[],d:number[])=>this.quad(a,b,c,d,u,u,u,u,kind,param,C);
  f(P(-1,1,-1),P(1,1,-1),P(1,1,1),P(-1,1,1));if(!skipBottom)f(P(-1,-1,-1),P(1,-1,-1),P(1,-1,1),P(-1,-1,1));
  f(P(-1,-1,-1),P(1,-1,-1),P(1,1,-1),P(-1,1,-1));f(P(-1,-1,1),P(1,-1,1),P(1,1,1),P(-1,1,1));
  f(P(-1,-1,-1),P(-1,1,-1),P(-1,1,1),P(-1,-1,1));f(P(1,-1,-1),P(1,1,-1),P(1,1,1),P(1,-1,1));}
 /** An 8-sided disc / short cylinder along `axis` ('x' or 'z'). */
 cyl(cx:number,cy:number,cz:number,r:number,half:number,axis:'x'|'z',uv:number[],kind:number,param=0,caps=2){
  const N=8,at=(k:number,s:number)=>{const a=k/N*Math.PI*2,c=Math.cos(a)*r,d=Math.sin(a)*r;return axis==='x'?[cx+s*half,cy+d,cz+c]:[cx+c,cy+d,cz+s*half];},C=[cx,cy,cz],u=uv;
  for(let k=0;k<N;k++){this.quad(at(k,-1),at(k+1,-1),at(k+1,1),at(k,1),u,u,u,u,kind,param,C);}
  for(const s of caps===2?[-1,1]:caps===1?[1]:[]){const c=axis==='x'?[cx+s*half,cy,cz]:[cx,cy,cz+s*half],inside=axis==='x'?[cx-s,cy,cz]:[cx,cy,cz-s];for(let k=1;k<N-1;k++)this.tri(at(0,s),at(k,s),at(k+1,s),u,u,u,kind,param,inside);void c;}}
 beam(a:number[],b:number[],r:number,uv:number[],kind:number){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz)||1e-6,d=[dx/l,dy/l,dz/l];
  const up=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],s1=[d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]],l1=Math.hypot(...s1);for(let i=0;i<3;i++)s1[i]/=l1;
  const s2=[d[1]*s1[2]-d[2]*s1[1],d[2]*s1[0]-d[0]*s1[2],d[0]*s1[1]-d[1]*s1[0]],c=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
  const P=(e:number[],i:number,j:number)=>[e[0]+(s1[0]*i+s2[0]*j)*r,e[1]+(s1[1]*i+s2[1]*j)*r,e[2]+(s1[2]*i+s2[2]*j)*r];
  for(const [i,j,k,m] of [[1,1,1,-1],[1,-1,-1,-1],[-1,-1,-1,1],[-1,1,1,1]])this.quad(P(a,i,j),P(b,i,j),P(b,k,m),P(a,k,m),uv,uv,uv,uv,kind,0,c);}
 build(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(this.uv,2));g.setAttribute('aFx',new T.Float32BufferAttribute(this.fx,2));return g;}
 get tris(){return this.p.length/9;}
}
/** Atlas px → uv (row 0; the shader moves other liveries down by whole rows). flipY: v = 1 − y / ATLAS_H. */
const UV=(x:number,y:number)=>[x/ATLAS,1-y/ATLAS_H];
const mid=(c:readonly number[])=>UV((c[0]+c[2])/2,(c[1]+c[3])/2);
export function buildCarGeometry(){
 const g=new CarGeo();
 // ---- the shell: a rounded section extruded along the car; the cab end narrows a little (rounded corners seen from above).
 const prof:[number,number][]=[[-HALF_W,BODY_Y0],[-HALF_W,3.1],[-1.33,SIDE_TOP],[-1.08,3.6],[-.58,3.72],[0,ROOF_TOP],[.58,3.72],[1.08,3.6],[1.33,SIDE_TOP],[HALF_W,3.1],[HALF_W,BODY_Y0]];
 const rings:[number,number][]=[[-6,.985],[-5.9,1],[5.62,1],[5.88,.95],[6,.86]];// z, width scale
 const sideU=(z:number)=>(CELL.side[0]+(z+6)*(CELL.side[2]-CELL.side[0])/12)/ATLAS,sideV=(y:number)=>1-(Math.max(0,Math.min(200,(SIDE_TOP-y)*200/(SIDE_TOP-BODY_Y0))))/ATLAS_H;
 const roof=mid(CELL.roof);
 for(let r=0;r<rings.length-1;r++){const [z0,k0]=rings[r],[z1,k1]=rings[r+1];
  for(let k=0;k<prof.length-1;k++){const [xa,ya]=prof[k],[xb,yb]=prof[k+1],A=[xa*k0,ya,z0],B=[xb*k0,yb,z0],C=[xb*k1,yb,z1],D=[xa*k1,ya,z1],inside=[0,2.4,(z0+z1)/2];
   const isRoof=ya>=SIDE_TOP-.01&&yb>=SIDE_TOP-.01;
   if(isRoof)g.quad(A,B,C,D,roof,roof,roof,roof,K.body,0,inside);
   else g.quad(A,B,C,D,[sideU(z0),sideV(ya)],[sideU(z0),sideV(yb)],[sideU(z1),sideV(yb)],[sideU(z1),sideV(ya)],K.body,0,inside);}}
 // under the floor: a closed bottom and an equipment box between the bogies
 {const u=mid(CELL.under);g.quad([-HALF_W,BODY_Y0,-6],[HALF_W,BODY_Y0,-6],[HALF_W*.86,BODY_Y0,6],[-HALF_W*.86,BODY_Y0,6],u,u,u,u,K.body,0,[0,3,0]);
  g.box(0,.86,0,1.15,.2,2.6,u,K.body);}
 // the two ends: cab (+z, narrowed) and the gangway end (−z); fans from the middle of each section
 for(const [z,k,cab] of [[6,.86,true],[-6,.985,false]] as const){
  const c=cab?CELL.cab:CELL.rear,cu=(x:number)=>(c[0]+(x/(cab?1.2:HALF_W*k)+1)/2*(c[2]-c[0]))/ATLAS,cv=(y:number)=>1-(c[1]+(ROOF_TOP-y)*(c[3]-c[1])/(ROOF_TOP-BODY_Y0))/ATLAS_H;
  // seen from outside the cab (+z), local +x is on the viewer's right: the image maps straight on (the plate reads correctly)
  const U=cu,O=[0,2.4,z],inside=[0,2.4,z-Math.sign(z)];
  for(let i=0;i<prof.length-1;i++){const [xa,ya]=prof[i],[xb,yb]=prof[i+1];g.tri(O,[xa*k,ya,z],[xb*k,yb,z],[U(0),cv(2.4)],[U(xa*k),cv(ya)],[U(xb*k),cv(yb)],K.body,0,inside);}
  g.tri(O,[HALF_W*k,BODY_Y0,z],[-HALF_W*k,BODY_Y0,z],[U(0),cv(2.4)],[U(HALF_W*k),cv(BODY_Y0)],[U(-HALF_W*k),cv(BODY_Y0)],K.body,0,inside);}
 // ---- cab front details: destination tile, headlamps (high), marker lamps (low), grab rail, skirt, coupler
 {const z=6.02,d0=UV(0,DEST_Y+2),d1=UV(DEST_W-6,DEST_Y+DEST_H-2);
  g.quad([.6,3.29,z],[-.6,3.29,z],[-.6,3.57,z],[.6,3.57,z],[d1[0],d1[1]],[d0[0],d1[1]],[d0[0],d0[1]],[d1[0],d0[1]],K.dest,0,[0,3.4,5]);
  for(const x of [-.86,.86]){g.cyl(x,3.42,5.98,.12,.07,'z',mid(CELL.lamp),K.head);g.box(x*1.1,1.42,5.97,.1,.07,.05,mid(CELL.marker),K.marker);}
  g.beam([-.5,2.12,6.06],[.5,2.12,6.06],.025,mid(CELL.metal),K.body);
  const sk=mid(CELL.dark);g.quad([-1.15,BODY_Y0,6.02],[1.15,BODY_Y0,6.02],[1.0,.42,6.2],[-1.0,.42,6.2],sk,sk,sk,sk,K.body,0,[0,.7,5]);
  g.box(0,.72,6.25,.14,.12,.25,sk,K.body);g.box(0,.72,-6.2,.14,.12,.22,sk,K.body);}
 // ---- doors: three per side, two leaves each, 2 cm proud of the side; they slide apart over the doorway's dark interior
 {const [x0,y0,x1,y1]=CELL.door,ua=[x0/ATLAS,1-y1/ATLAS_H],ub=[x1/ATLAS,1-y1/ATLAS_H],uc=[x1/ATLAS,1-y0/ATLAS_H],ud=[x0/ATLAS,1-y0/ATLAS_H];
  for(const side of [-1,1])for(const zc of DOORS)for(const dir of [-1,1]){const x=side*(HALF_W+.02),za=zc,zb=zc+dir*DOOR_HALF,inside=[0,2,zc];
   g.quad([x,DOOR_Y0,Math.min(za,zb)],[x,DOOR_Y0,Math.max(za,zb)],[x,DOOR_Y1,Math.max(za,zb)],[x,DOOR_Y1,Math.min(za,zb)],side>0?ub:ua,side>0?ua:ub,side>0?ud:uc,side>0?uc:ud,K.door,dir,inside);}}
 // ---- bogies: a frame and four wheels each (the wheels roll in the shader about their own axle)
 {const dk=mid(CELL.dark),un=mid(CELL.under);
  for(const bz of [-BOGIE_HALF,BOGIE_HALF]){g.box(0,.62,bz,1.0,.16,1.35,un,K.body);g.box(0,.42,bz,.08,.06,1.25,dk,K.body);
   for(const az of [bz-1.05,bz+1.05])for(const x of [-.68,.68])g.cyl(x,WHEEL_R,az,WHEEL_R,.06,'x',dk,K.wheel,az,2);}}
 // ---- roof: two cooler boxes and the single-arm pantograph on the lead car's roof (folded away in the shader on the other car)
 {const r=mid(CELL.metal);for(const z of [-2.6,1.4])g.box(0,ROOF_TOP+.12,z,.55,.14,.8,r,K.body);
  const pz=-.6,y=ROOF_TOP+.05;g.box(0,y+.04,pz,.55,.05,.45,r,K.panto);
  g.beam([0,y+.1,pz-.3],[0,4.3,pz+1.0],.04,r,K.panto);g.beam([0,4.3,pz+1.0],[0,4.78,pz-.1],.03,r,K.panto);
  g.beam([-.8,4.8,pz-.1],[.8,4.8,pz-.1],.035,r,K.panto);g.beam([-.8,4.8,pz-.1],[-.95,4.72,pz-.1],.025,r,K.panto);g.beam([.8,4.8,pz-.1],[.95,4.72,pz-.1],.025,r,K.panto);}
 const geo=g.build();geo.computeBoundingSphere();
 return {geometry:geo,triangles:g.tris};
}

// ---------------------------------------------------------------- the material (instanced livery, doors, wheels, lamps, night)
function trainMaterial(map:T.Texture){
 const m=new T.MeshLambertMaterial({map});
 const rowStep=(ROW_H/ATLAS_H).toFixed(5),destStep=(DEST_W/ATLAS).toFixed(5),[wr,wg,wb]=MACHINE_GLOW.warm;
 m.onBeforeCompile=s=>{s.uniforms.uNight=MACHINE_NIGHT;
  s.vertexShader=s.vertexShader.replace('#include <common>',`#include <common>
attribute vec4 aCar;attribute vec4 aCar2;attribute vec2 aFx;varying float vKind;varying float vLead;
vec3 trainRoll(vec3 p,float az,float a){float c=cos(a),s=sin(a);vec2 q=vec2(p.y-${WHEEL_R.toFixed(3)},p.z-az);return vec3(p.x,${WHEEL_R.toFixed(3)}+q.x*c-q.y*s,az+q.x*s+q.y*c);}`)
   .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
if(aFx.x>1.5&&aFx.x<2.5){float c=cos(aCar.w),s=sin(aCar.w);objectNormal=vec3(objectNormal.x,objectNormal.y*c-objectNormal.z*s,objectNormal.y*s+objectNormal.z*c);}`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>
vKind=aFx.x;vLead=1.-aCar.y;
if(aFx.x>.5&&aFx.x<1.5){float open=aCar.z*sign(position.x);transformed.z+=aFx.y*max(open,0.)*${(DOOR_HALF*.95).toFixed(3)};}
else if(aFx.x>1.5&&aFx.x<2.5){transformed=trainRoll(transformed,aFx.y,aCar.w);}
else if(aFx.x>2.5&&aFx.x<3.5&&aCar.y>.5){transformed=vec3(transformed.x*.01,${(ROOF_TOP+.05).toFixed(2)},transformed.z);}`)
   .replace('#include <uv_vertex>',`#include <uv_vertex>
#ifdef USE_MAP
if(aFx.x>5.5)vMapUv.x+=aCar2.x*${destStep};else vMapUv.y-=aCar.x*${rowStep};
#endif`);
  s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
uniform float uNight;varying float vKind;varying float vLead;`)
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
{float glass=vKind<1.5?clamp((.985-diffuseColor.a)*12.,0.,1.):0.;
 totalEmissiveRadiance+=vec3(${wr.toFixed(3)},${wg.toFixed(3)},${wb.toFixed(3)})*glass*uNight*.85;
 if(vKind>3.5&&vKind<4.5)totalEmissiveRadiance+=vLead>.5?vec3(1.,.93,.75)*(.55+.9*uNight):vec3(0.);
 if(vKind>4.5&&vKind<5.5)totalEmissiveRadiance+=vLead>.5?vec3(.9,.42,.08)*(.25+.5*uNight):vec3(.85,.08,.05)*(.5+.6*uNight);
 if(vKind>5.5)totalEmissiveRadiance+=diffuseColor.rgb*(.35+.6*uNight);
 diffuseColor.a=1.;}`);
 };
 m.customProgramCacheKey=()=>'island-line-train-v1';
 return m;
}

// ---------------------------------------------------------------- crossings: barrier arms and flashing lamps (one merged mesh)
function buildCrossings(){
 const L=trainLayout(),pos:number[]=[],nor:number[]=[],col:number[]=[],info:number[]=[],pivot:number[]=[],axis:number[]=[];
 const yellow=new T.Color('#f2c230'),black=new T.Color('#26231f'),red=new T.Color('#7a2420'),weight=new T.Color('#5b5f63');
 const v3=new T.Vector3();
 // A box with its own frame (centre c, axes ex/ey/ez with half sizes), every vertex tagged with the crossing, kind, pivot and axis.
 const box=(c:number[],ex:number[],ey:number[],ez:number[],hx:number,hy:number,hz:number,color:T.Color,ci:number,kind:number,pv:number[],ax:number[])=>{
  const P=(a:number,b:number,d:number)=>[c[0]+ex[0]*hx*a+ey[0]*hy*b+ez[0]*hz*d,c[1]+ex[1]*hx*a+ey[1]*hy*b+ez[1]*hz*d,c[2]+ex[2]*hx*a+ey[2]*hy*b+ez[2]*hz*d];
  const faces:[number[],number[],number[],number[]][]=[[P(-1,1,-1),P(1,1,-1),P(1,1,1),P(-1,1,1)],[P(-1,-1,-1),P(1,-1,-1),P(1,-1,1),P(-1,-1,1)],[P(-1,-1,-1),P(1,-1,-1),P(1,1,-1),P(-1,1,-1)],
   [P(-1,-1,1),P(1,-1,1),P(1,1,1),P(-1,1,1)],[P(-1,-1,-1),P(-1,1,-1),P(-1,1,1),P(-1,-1,1)],[P(1,-1,-1),P(1,1,-1),P(1,1,1),P(1,-1,1)]];
  for(const [a,b,cc,d] of faces){for(let [p,q,r] of [[a,b,cc],[a,cc,d]]){v3.set(q[0]-p[0],q[1]-p[1],q[2]-p[2]).cross(new T.Vector3(r[0]-p[0],r[1]-p[1],r[2]-p[2])).normalize();
    const m=[(p[0]+q[0]+r[0])/3-c[0],(p[1]+q[1]+r[1])/3-c[1],(p[2]+q[2]+r[2])/3-c[2]];if(v3.x*m[0]+v3.y*m[1]+v3.z*m[2]<0){[q,r]=[r,q];v3.negate();}
    for(const w of [p,q,r]){pos.push(...w);nor.push(v3.x,v3.y,v3.z);col.push(color.r,color.g,color.b);info.push(ci,kind);pivot.push(...pv);axis.push(...ax);}}}};
 TRAIN_CROSSINGS.forEach((c,ci)=>{const a=trackAt(c.s),i=Math.round(c.s/TRACK.length*TRACK.n)%TRACK.n,bed=L.profile.bed[i],t=[a.tx,0,a.tz],nrm=[a.tz,0,-a.tx],up=[0,1,0];
  for(const [u,v] of [[-(c.width/2+.5),2.6],[c.width/2+.5,-2.6]]){const x=a.x+a.tx*u+a.tz*v,z=a.z+a.tz*u-a.tx*v,base=bed;
   // lamps (the two over the static ones, a touch larger): kinds 2 and 3 flash in turn
   const fx=a.tx*Math.sign(u)*-1,fz=a.tz*Math.sign(u)*-1;
   box([x+fx*.12+a.tz*.32,base+2.05,z+fz*.12-a.tx*.32],t,up,nrm,.07,.145,.145,red,ci,2,[0,0,0],[0,0,0]);
   box([x+fx*.12-a.tz*.32,base+2.05,z+fz*.12+a.tx*.32],t,up,nrm,.07,.145,.145,red,ci,3,[0,0,0],[0,0,0]);
   // the barrier arm, built DOWN (along the track, across the path) and raised in the shader about its pivot on the pole
   const dir=-Math.sign(u),d=[a.tx*dir,0,a.tz*dir],off=v>0?-.22:.22,pv=[x+a.tz*off,base+1.0,z-a.tx*off],len=c.width+.6,seg=Math.max(4,Math.round(len/.6));
   const k=new T.Vector3(d[0],0,d[2]).cross(new T.Vector3(0,1,0)).normalize();// d × up: a positive turn lifts the tip
   for(let s=0;s<seg;s++){const f=(s+.5)/seg*len;box([pv[0]+d[0]*f,pv[1],pv[2]+d[2]*f],d,up,nrm,len/seg/2,.05,.04,s%2?black:yellow,ci,1,pv,[k.x,k.y,k.z]);}
   box([pv[0]-d[0]*.35,pv[1],pv[2]-d[2]*.35],d,up,nrm,.25,.09,.07,weight,ci,1,pv,[k.x,k.y,k.z]);// counterweight
   box(pv,d,up,nrm,.14,.18,.12,black,ci,0,[0,0,0],[0,0,0]);}});// the arm's motor box (static)
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
 g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('aXing',new T.Float32BufferAttribute(info,2));g.setAttribute('aPivot',new T.Float32BufferAttribute(pivot,3));g.setAttribute('aAxis',new T.Float32BufferAttribute(axis,3));
 g.computeBoundingSphere();
 const uniforms={uXing:{value:TRAIN_CROSSINGS.map(()=>new T.Vector2(0,0))},uFlash:{value:0}};
 const m=new T.MeshLambertMaterial({vertexColors:true});
 m.onBeforeCompile=s=>{Object.assign(s.uniforms,uniforms);const N=TRAIN_CROSSINGS.length;
  s.vertexShader=s.vertexShader.replace('#include <common>',`#include <common>
attribute vec2 aXing;attribute vec3 aPivot;attribute vec3 aAxis;uniform vec2 uXing[${N}];uniform float uFlash;varying float vLit;
vec3 xingRot(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}`)
   .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
vec2 xs=uXing[int(aXing.x+.5)];float xa=(1.-xs.x)*1.5533;if(aXing.y>.5&&aXing.y<1.5)objectNormal=xingRot(objectNormal,aAxis,xa);`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>
if(aXing.y>.5&&aXing.y<1.5)transformed=aPivot+xingRot(transformed-aPivot,aAxis,xa);
vLit=aXing.y>1.5?xs.y*(aXing.y<2.5?uFlash:1.-uFlash):0.;`);
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying float vLit;')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(1.,.12,.06)*vLit*1.6;');};
 m.customProgramCacheKey=()=>'island-line-crossings-v1';
 const mesh=new T.Mesh(g,m);mesh.name='train-crossings';mesh.matrixAutoUpdate=false;mesh.castShadow=false;mesh.receiveShadow=false;mesh.frustumCulled=false;mesh.visible=false;
 const centres=TRAIN_CROSSINGS.map(c=>{const a=trackAt(c.s);return {x:a.x,z:a.z};});
 return {mesh,uniforms,centres};
}

// ---------------------------------------------------------------- departure boards (one canvas: a row per station)
const BOARD_W=512,BOARD_ROW=160;
function buildBoards(){
 const L=trainLayout(),cv=document.createElement('canvas');cv.width=BOARD_W;cv.height=BOARD_ROW*TRAIN_STATIONS.length+16;
 const g=cv.getContext('2d');if(g){g.fillStyle='#16191c';g.fillRect(0,0,cv.width,cv.height);}
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;tex.generateMipmaps=false;tex.minFilter=T.LinearFilter;
 const mat=new T.MeshBasicMaterial({map:tex});
 const meshes=TRAIN_STATIONS.map((st,r)=>{
  const c=trackAt(st.s),bed=L.profile.bed[Math.round(st.s/TRACK.length*TRACK.n)%TRACK.n],top=bed+STATION_PLATFORM_Y,south=st.id==='south',sg=st.side,nrm=leftNormal(c.tx,c.tz);
  // Under the station house's front eave (trainWorld.ts buildStation: house front hv0, eave at top + 3.04), between the middle lanterns.
  const hv0=south?8.1-3.8:5.45,v=hv0-.72,P=(u:number,vv:number,y:number)=>new T.Vector3(c.x+c.tx*u+nrm.x*sg*vv,y,c.z+c.tz*u+nrm.z*sg*vv);
  const w=1.6,h=.5,yc=top+2.36,g2=new T.BufferGeometry(),pos:number[]=[],uv:number[]=[];
  const v0=1-(r*BOARD_ROW)/cv.height,v1=1-((r+1)*BOARD_ROW)/cv.height,dark=1-(cv.height-8)/cv.height;
  const face=(u0:number,u1:number,y0:number,y1:number,vt:number,vb:number,uu0=0,uu1=1)=>{const a=P(u0,v,y0),b=P(u1,v,y0),cc=P(u1,v,y1),d=P(u0,v,y1);
   // Facing the track: seen from there the viewer's right is +u × side, so the corners go round anticlockwise in that order.
   const q=sg>0?[a,b,cc,d]:[b,a,d,cc],t=[[uu0,vb],[uu1,vb],[uu1,vt],[uu0,vt]];
   for(const k of [0,1,2,0,2,3]){pos.push(q[k].x,q[k].y,q[k].z);uv.push(t[k][0],t[k][1]);}};
  face(-w/2,w/2,yc-h/2,yc+h/2,v0,v1);
  for(const u of [-.62,.62])face(u-.02,u+.02,yc+h/2,top+2.98,dark,dark,.5,.5);// the two hanging rods
  g2.setAttribute('position',new T.Float32BufferAttribute(pos,3));g2.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g2.computeBoundingSphere();
  const m=new T.Mesh(g2,mat);m.name='train-board-'+st.id;m.matrixAutoUpdate=false;m.visible=false;return {mesh:m,x:c.x,z:c.z,text:''};});
 const draw=(r:number,l1:string,l2:string)=>{if(!g)return;const y=r*BOARD_ROW,sans='system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  g.fillStyle='#16191c';g.fillRect(0,y,BOARD_W,BOARD_ROW);g.fillStyle='#2f7d5b';g.fillRect(0,y,BOARD_W,8);g.fillStyle='#000';g.fillRect(0,y+BOARD_ROW-6,BOARD_W,6);
  g.textAlign='left';g.textBaseline='middle';g.fillStyle='#ffb43a';g.font=`800 40px ${sans}`;g.fillText(l1,18,y+58,BOARD_W-30);
  g.fillStyle='#e9eef0';g.font=`700 30px ${sans}`;g.fillText(l2,18,y+116,BOARD_W-30);
  g.fillStyle='#16191c';g.fillRect(0,cv.height-16,BOARD_W,16);};
 return {meshes,mat,tex,draw};
}

// ---------------------------------------------------------------- the runtime
export type TrainPerson={x:number;y:number;z:number;local:boolean};
export type TrainFrame={dt:number;camera:T.Camera;player:{x:number;y:number;z:number};
 /** Remote players drawn on this screen (x, y, z). */eachRemote?:(cb:(x:number,y:number,z:number)=>void)=>void;
 /** Tests only: the shared clock (s) instead of trainClockSec(). */nowSec?:number};
export type TrainFrameResult={/** gentle slide for the local player (m this frame) */nudgeX:number;nudgeZ:number;/** a note to show once */note:string|null};
export function createTrainRunning(scene:T.Scene){
 const L=trainLayout(),root=new T.Group();root.name='island-line-trains';scene.add(root);
 const atlas=drawAtlas(),tex=new T.CanvasTexture(atlas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
 const {geometry,triangles}=buildCarGeometry(),COUNT=TRAIN_COUNT*TRAIN_CARS;
 const aCar=new T.InstancedBufferAttribute(new Float32Array(COUNT*4),4),aCar2=new T.InstancedBufferAttribute(new Float32Array(COUNT*4),4);
 aCar.setUsage(T.DynamicDrawUsage);aCar2.setUsage(T.DynamicDrawUsage);geometry.setAttribute('aCar',aCar);geometry.setAttribute('aCar2',aCar2);
 const material=trainMaterial(tex),cars=new T.InstancedMesh(geometry,material,COUNT);cars.name='train-cars';cars.instanceMatrix.setUsage(T.DynamicDrawUsage);
 cars.castShadow=false;cars.receiveShadow=false;cars.frustumCulled=false;cars.count=0;cars.visible=false;root.add(cars);
 const xing=buildCrossings();root.add(xing.mesh);
 const boards=buildBoards();for(const b of boards.meshes)root.add(b.mesh);
 const runner=createTrainRunner(),states:TrainState[]=Array.from({length:TRAIN_COUNT},newTrainState);
 const roll=new Float64Array(COUNT),hornAt=new Float64Array(TRAIN_COUNT).fill(-1e9),noted=new Uint8Array(TRAIN_COUNT),wasBlocked=new Uint8Array(TRAIN_COUNT);
 const cam=new T.Vector3(),frustum=new T.Frustum(),pv=new T.Matrix4(),sphere=new T.Sphere(),m4=new T.Matrix4(),bx=new T.Vector3(),by=new T.Vector3(),bz=new T.Vector3();
 const pa={x:0,z:0,tx:1,tz:0},pb={x:0,z:0,tx:1,tz:0},pc={x:0,z:0,tx:1,tz:0},xs={lamps:false,arm:0};
 const people:TrainPerson[]=Array.from({length:17},()=>({x:0,y:0,z:0,local:false}));let nPeople=0;
 const addRemote=(x:number,y:number,z:number)=>{if(nPeople>=people.length)return;const p=people[nPeople++];p.x=x;p.y=y;p.z=z;p.local=false;};
 const result:TrainFrameResult={nudgeX:0,nudgeZ:0,note:null};
 let clock=0,bellWait=0,boardWait=0,flashT=0,lastNow=0;
 const stationLimit=(s:number,side:number)=>{for(const st of TRAIN_STATIONS){if(Math.abs(((s-st.s)%TRACK.length+TRACK.length*1.5)%TRACK.length-TRACK.length/2)<STATION_HALF+1&&side===st.side)return 1.4;}return LOOK_HALF;};
 /** The nearest person ahead of train front `s` (within LOOK_AHEAD + STOP_SHORT): their track s, or NaN; who (index) in `who`. */
 const who={i:-1,side:0,d:0};
 function personAhead(s:number){let best=Infinity,bs=NaN;who.i=-1;
  for(let k=0;k<nPeople;k++){const p=people[k],hit=trackNearest(p.x,p.z,LOOK_HALF+.05);if(!hit||hit.d>stationLimit(hit.s,hit.side))continue;
   const gap=ahead(s,hit.s);if(gap>LOOK_AHEAD+STOP_SHORT||gap>=best)continue;const bed=bedAt(L.profile,hit.s);if(p.y>bed+4.2||p.y<bed-1.2)continue;
   best=gap;bs=hit.s;who.i=k;who.side=hit.side;who.d=hit.d;}
  return bs;}
 const cue=(name:string,gain:number)=>{if(typeof document!=='undefined'&&typeof CustomEvent!=='undefined')document.dispatchEvent(new CustomEvent('fi2-job-cue',{detail:{cue:name,gain}}));};
 const api={
  root,triangles,runner,states,
  /** Debug / gfx views only (window.__fi2.trains.cluster = s): all three trains pinned close together at track s; NaN = the timetable. */
  cluster:NaN,
  update(f:TrainFrame):TrainFrameResult{
   result.nudgeX=result.nudgeZ=0;result.note=null;const dt=Math.max(0,Math.min(f.dt,.25));clock+=dt;
   const now=f.nowSec??trainClockSec();lastNow=now;f.camera.getWorldPosition(cam);
   pv.multiplyMatrices(f.camera.projectionMatrix,f.camera.matrixWorldInverse);frustum.setFromProjectionMatrix(pv);
   nPeople=0;{const p=people[nPeople++];p.x=f.player.x;p.y=f.player.y;p.z=f.player.z;p.local=true;}f.eachRemote?.(addRemote);
   // ---- trains: simulate the ones near the camera (people, catch-up); the rest are where the timetable says
   const cluster=Number.isFinite(api.cluster);
   for(let i=0;i<TRAIN_COUNT;i++){const st=states[i];
    if(cluster){trainAt(0,now,st);st.s=wrapS(api.cluster+i*(TRAIN_LENGTH+14));st.v=0;st.at=-1;st.doors=0;runner.t[i]=trainPhase(i,now);continue;}
    scheduleAt(trainPhase(i,now)-runner.behind(i),st);trackAt(st.s-TRAIN_LENGTH/2,pc);const d=Math.hypot(pc.x-cam.x,pc.z-cam.z);// where it is on THIS screen (held trains run late)
    if(d>SIM_RANGE&&!(runner.behind(i)>0&&d<HIDE_RANGE)){runner.reset(i);runner.t[i]=trainPhase(i,now);noted[i]=0;wasBlocked[i]=0;continue;}
    const stopAt=personAhead(st.s);runner.step(i,now,dt,stopAt,st);
    const blocked=Number.isFinite(stopAt);
    if(blocked&&!wasBlocked[i]&&st.v>1&&d<HORN_RANGE&&clock-hornAt[i]>6){hornAt[i]=clock;cue('train-horn',Math.max(.25,1-d/HORN_RANGE));}
    wasBlocked[i]=blocked?1:0;
    // Held for the LOCAL player: after STEP_OFF_AFTER s, ask once and slide them gently off the track (never a knock).
    if(blocked&&who.i===0&&runner.heldFor(i)>=STEP_OFF_AFTER){if(!noted[i]){noted[i]=1;result.note='Please step off the track';}
     if(who.d<LOOK_HALF+.4){const t=trackAt(stopAt,pa),n=leftNormal(t.tx,t.tz),sd=who.side||1,k=SLIDE_SPEED*dt;result.nudgeX+=n.x*sd*k;result.nudgeZ+=n.z*sd*k;}}
    else if(!blocked)noted[i]=0;}
   // ---- the local player never stands inside a car: pushed out to the side (a train running into the player's side)
   {const p=people[0],hit=trackNearest(p.x,p.z,HALF_W+.4);if(hit){for(let i=0;i<TRAIN_COUNT;i++){const back=ahead(hit.s,states[i].s);if(back>TRAIN_LENGTH+.3)continue;
     const bed=bedAt(L.profile,hit.s);if(p.y>bed+4.2||p.y<bed-1.2)continue;const t=trackAt(hit.s,pa),n=leftNormal(t.tx,t.tz),push=HALF_W+.45-hit.d;
     if(push>0){result.nudgeX+=n.x*hit.side*push;result.nudgeZ+=n.z*hit.side*push;}break;}}}
   // ---- crossings: lamps and arms from every train's (local) lap time; the bell within BELL_RANGE m of the player
   let nearX=Infinity,bellX=Infinity;for(const c of xing.centres){const d=Math.hypot(c.x-cam.x,c.z-cam.z);if(d<nearX)nearX=d;}
   const showX=nearX<XING_SHOW;if(xing.mesh.visible!==showX)xing.mesh.visible=showX;
   flashT+=dt;xing.uniforms.uFlash.value=Math.floor(flashT/.5)%2;
   for(let ci=0;ci<TRAIN_CROSSINGS.length;ci++){let lamps=false,arm=0;
    for(let i=0;i<TRAIN_COUNT;i++){if(cluster)break;crossingFor(ci,runner.t[i],xs);if(xs.lamps)lamps=true;if(xs.arm>arm)arm=xs.arm;}
    xing.uniforms.uXing.value[ci].set(arm,lamps?1:0);
    if(lamps){const c=xing.centres[ci],d=Math.hypot(c.x-f.player.x,c.z-f.player.z);if(d<bellX)bellX=d;}}
   bellWait-=dt;if(bellX<BELL_RANGE&&bellWait<=0){bellWait=.55;cue('train-bell',Math.max(.15,1-bellX/BELL_RANGE));}
   // ---- departure boards: 1 Hz, near stations only, uploaded on a change
   boardWait-=dt;if(boardWait<=0){boardWait=1/BOARD_HZ;let dirty=false;
    boards.meshes.forEach((b,r)=>{const near=Math.hypot(b.x-cam.x,b.z-cam.z)<BOARD_SHOW;if(b.mesh.visible!==near)b.mesh.visible=near;if(!near)return;
     const stop=TRAIN_STOPS.findIndex(s=>s.station===TRAIN_STATIONS[r]),n=nextTrains(stop,runner.t,2),to=TRAIN_STOPS[(stop+1)%TRAIN_STOPS.length].station.name;
     const l1=`Next train: ${waitText(n[0])} · to ${to}`,l2=`Then: ${waitText(n[1])}`,text=l1+'|'+l2;
     if(text!==b.text){b.text=text;boards.draw(r,l1,l2);dirty=true;}});
    if(dirty)boards.tex.needsUpdate=true;}
   // ---- draw: only trains on screen and within HIDE_RANGE m; wheels and doors move within ANIMATE_RANGE m
   let k=0;
   for(let i=0;i<TRAIN_COUNT;i++){const st=states[i];trackAt(st.s-TRAIN_LENGTH/2,pc);const d=Math.hypot(pc.x-cam.x,pc.z-cam.z);if(d>HIDE_RANGE)continue;
    sphere.center.set(pc.x,bedAt(L.profile,st.s-TRAIN_LENGTH/2)+2,pc.z);sphere.radius=TRAIN_LENGTH/2+3;if(!frustum.intersectsSphere(sphere))continue;
    const animate=d<ANIMATE_RANGE,stop=st.at>=0?TRAIN_STOPS[st.at]:null,side=stop?stop.station.side:1;
    for(let c=0;c<TRAIN_CARS;c++){const sc=st.s-c*(CAR_LENGTH+CAR_GAP)-CAR_LENGTH/2,sa=sc+BOGIE_HALF,sb=sc-BOGIE_HALF;trackAt(sa,pa);trackAt(sb,pb);
     const ya=bedAt(L.profile,sa)+RAIL_TOP,yb=bedAt(L.profile,sb)+RAIL_TOP,rev=c%2===1?-1:1;
     bz.set((pa.x-pb.x)*rev,(ya-yb)*rev,(pa.z-pb.z)*rev).normalize();by.set(0,1,0);bx.crossVectors(by,bz).normalize();by.crossVectors(bz,bx);
     m4.makeBasis(bx,by,bz);m4.setPosition((pa.x+pb.x)/2,(ya+yb)/2,(pa.z+pb.z)/2);cars.setMatrixAt(k,m4);
     const id=i*TRAIN_CARS+c;if(animate)roll[id]=(st.s/WHEEL_R*rev)%(Math.PI*2);
     aCar.setXYZW(k,i%LIVERIES.length,c,animate?st.doors*side*rev:0,roll[id]);
     const dest=TRAIN_STATIONS.indexOf(TRAIN_STOPS[st.next].station);aCar2.setXYZW(k,dest,0,0,0);k++;}}
   if(cars.count!==k)cars.count=k;const vis=k>0;if(cars.visible!==vis)cars.visible=vis;
   if(vis){cars.instanceMatrix.needsUpdate=true;aCar.needsUpdate=true;aCar2.needsUpdate=true;}
   return result;
  },
  /** For tests and the gfx probe: what is drawn right now. */
  get drawn(){return {cars:cars.visible?cars.count:0,crossings:xing.mesh.visible,boards:boards.meshes.filter(b=>b.mesh.visible).length,now:lastNow};},
  dispose(){geometry.dispose();material.dispose();tex.dispose();xing.mesh.geometry.dispose();(xing.mesh.material as T.Material).dispose();
   for(const b of boards.meshes)b.mesh.geometry.dispose();boards.mat.dispose();boards.tex.dispose();cars.dispose();root.removeFromParent();},
 };
 return api;
}
export type TrainRunning=ReturnType<typeof createTrainRunning>;
