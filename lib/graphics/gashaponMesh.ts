/**
 * The one shared gashapon capsule machine (round 2, Nov 8 2026; docs/gashapon-design.md): a cabinet in the machine's colour, a
 * cream front panel with the crank and coin slot, a pick-up tray, a glass globe of coloured capsules on an accent collar, a cap
 * and a small themed topper (an onigiri, a daruma, a trophy…). Machine-local metres: ground centre at the origin, front +z.
 * Nov 10 2026: six body styles built from that machine (classic, retro, double, tower, counter, twin; `STYLE_UNITS`, `styleExtras`,
 * lib/gashapon/machines.ts GASHA_LOOK), so the 14 machines differ in silhouette and size, not just colour.
 *
 * Pure geometry, no materials, no scene: `gashaponPieces` lists primitive pieces (shared base geometries are cloned and
 * transformed per piece) so each scene adapter batches them its own way:
 *  - the island (lib/town/world.ts `buildGashaponProps`): the solid pieces go through the town's `put`, so they join the SAME
 *    50 m vertex-colour paint batches as every other static prop (no new draw call); the glass globes share ONE transparent
 *    material, which the batching pass merges per 50 m cell (one draw per cell that has machines, e.g. one for a Konbini pair);
 *  - the arcade room (lib/arcade/arcadeRoomProps.ts): `mergedGashapon` → one vertex-coloured solid mesh + one glass mesh for
 *    the pair (two draws).
 * No lights, no textures, no animation, nothing per frame.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {GASHA_SIZE,GASHA_STYLE_SIZE,gashaStyleOf,gashaTrimOf,type GashaponMachine,type GashaponMachineId,type GashaponStyle} from '../gashapon/machines';

export type GashaPiece={geometry:T.BufferGeometry;color:string;glass?:boolean;shadow?:boolean};
/**
 * Visual scale (owner, Nov 8 2026, round 3A): the machines read ~1.2× bigger. Heights, the globe, cap and topper scale 1.2×; the
 * cabinet's width and depth only 1.075× (0.86 × 0.645 m), so it stays inside its unchanged collider (GASHA_SIZE + 3 cm a side,
 * `gashaponFootprint`), a pair keeps a 6 cm gap between cabinets and a Konbini pair still clears the shopfront. Same pieces, so
 * the same draw calls.
 */
export const GASHA_SCALE=1.2,GASHA_CABINET_XZ=1.075;
/** Unscaled layout heights the pieces are written in. */
const BASE={cabinetH:.72,globeY:1.07,globeR:.3,capTop:1.42} as const;
/** Heights (m, as built, scale included): cabinet top, globe centre and radius, top of the cap. */
export const GASHA_MESH={cabinetH:BASE.cabinetH*GASHA_SCALE,globeY:BASE.globeY*GASHA_SCALE,globeR:BASE.globeR*GASHA_SCALE,capTop:BASE.capTop*GASHA_SCALE} as const;
/** The six capsule colours (a real gashapon mix), cycled per machine so neighbours differ. */
const CAPSULES=['#ff6b6b','#ffd447','#4fc3f7','#7ed957','#ff9ff3','#ffa94d'];
const METAL='#c9d1d6',DARK='#2f93cc',CREAM='#fff6e4';

type Topper='onigiri'|'daruma'|'sweet'|'bento'|'star'|'pixel'|'ball'|'shell'|'trophy'|'wheel'|'bug'|'fin'|'peak'|'boot';
const TOPPER:Record<GashaponMachineId,Topper>={
 'gs-square-snacks':'onigiri','gs-square-lucky':'daruma','gs-cay-sweets':'sweet','gs-cay-bento':'bento',
 'gs-arcade-heroes':'star','gs-arcade-pixel':'pixel','gs-westbeach':'ball','gs-northbeach':'shell','gs-eleven':'boot',
 'gs-oldtown':'trophy','gs-jetty':'wheel','gs-cayplaza':'bug','gs-sharks':'fin','gs-summit':'peak',
};

const m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),s=new T.Vector3();
function piece(base:T.BufferGeometry,color:string,x:number,y:number,z:number,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,extra:Partial<GashaPiece>={}):GashaPiece{
 const g=base.clone();m4.compose(p.set(x,y,z),q.setFromEuler(e.set(rx,ry,rz)),s.set(sx,sy,sz));g.applyMatrix4(m4);return {geometry:g,color,...extra};
}

/** Shared unit primitives, made once per call of `gashaponPieces` batch (disposed by `disposeBases`). */
function bases(){return {
 box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(1,1,1,14),ball:new T.SphereGeometry(1,10,7),
 capTop:new T.SphereGeometry(1,8,4,0,Math.PI*2,0,Math.PI/2),capBottom:new T.SphereGeometry(1,8,4,0,Math.PI*2,Math.PI/2,Math.PI/2),
 globe:new T.SphereGeometry(1,20,14),cone:new T.ConeGeometry(1,1,10),tri:new T.CylinderGeometry(1,1,1,3),torus:new T.TorusGeometry(1,.32,6,14),
};}
type Bases=ReturnType<typeof bases>;

function topper(b:Bases,kind:Topper,m:GashaponMachine,y:number):GashaPiece[]{
 const c=m.color,a=m.accent,out:GashaPiece[]=[];const add=(x:GashaPiece)=>out.push(x);
 switch(kind){
  case 'onigiri':add(piece(b.tri,'#f7f4ea',0,y+.11,0,.16,.1,.16,Math.PI/2,Math.PI,0));/* apex up */add(piece(b.box,'#3f9a63',0,y+.05,.06,.12,.07,.02));break;
  case 'daruma':add(piece(b.ball,'#d8342c',0,y+.12,0,.12,.13,.11));add(piece(b.ball,'#fff1d6',0,y+.15,.07,.07,.06,.05));break;
  case 'sweet':add(piece(b.ball,'#f28cb8',0,y+.11,0,.1,.1,.1));for(const sx of [-1,1])add(piece(b.cone,'#fff6fb',sx*.14,y+.11,0,.06,.09,.06,0,0,sx*Math.PI/2));break;
  case 'bento':add(piece(b.box,'#e8913a',0,y+.06,0,.26,.1,.18));add(piece(b.box,a,0,y+.125,0,.27,.03,.19));add(piece(b.box,'#e2452f',0,y+.06,.092,.04,.1,.01));break;
  case 'star':for(let i=0;i<5;i++)add(piece(b.cone,a,Math.sin(i*1.2566)*.07,y+.13+Math.cos(i*1.2566)*.07,0,.045,.11,.03,0,0,-i*1.2566));add(piece(b.ball,a,0,y+.13,0,.06,.06,.035));break;
  case 'pixel':for(const [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]] as const)add(piece(b.box,dx===0&&dy===0?'#3aa9d6':'#ffffff',dx*.07,y+.12+dy*.07,0,.07,.07,.07));break;
  case 'ball':add(piece(b.ball,'#ffffff',0,y+.11,0,.11,.11,.11));for(const [dx,dy,dz] of [[0,.02,.1],[-.08,.06,.05],[.08,.06,.05]] as const)add(piece(b.ball,'#1d1d2c',dx,y+.11+dy,dz,.03,.03,.02));break;
  case 'shell':add(piece(b.cone,'#f7d7c4',0,y+.1,0,.13,.2,.05,0,0,Math.PI));add(piece(b.box,a,0,y+.02,0,.06,.03,.05));break;
  case 'trophy':add(piece(b.cyl,'#d9b13b',0,y+.03,0,.08,.05,.08));add(piece(b.cyl,'#d9b13b',0,y+.09,0,.02,.08,.02));add(piece(b.cone,'#f1cf5a',0,y+.19,0,.09,.14,.09,Math.PI,0,0));
   for(const sx of [-1,1])add(piece(b.torus,'#f1cf5a',sx*.09,y+.2,0,.035,.035,.035,0,Math.PI/2,0));break;
  case 'wheel':add(piece(b.torus,'#6f8fb0',0,y+.12,0,.09,.09,.12));add(piece(b.cyl,a,0,y+.12,0,.05,.04,.05,Math.PI/2,0,0));break;
  case 'bug':add(piece(b.capTop,'#d8342c',0,y,0,.13,.12,.15));add(piece(b.ball,'#1d1d2c',0,y+.03,.14,.06,.05,.05));for(const [dx,dz] of [[-.06,.03],[.06,.03],[0,-.06]] as const)add(piece(b.ball,'#1d1d2c',dx,y+.09,dz,.025,.02,.025));break;
  case 'fin':add(piece(b.cone,'#5d7f99',0,y+.11,0,.1,.22,.03,0,0,-.25));add(piece(b.box,'#5d7f99',0,y+.01,0,.2,.02,.06));break;
  case 'peak':add(piece(b.cone,'#5b7d5c',0,y+.11,0,.14,.22,.14));add(piece(b.cone,'#ffffff',0,y+.19,0,.06,.07,.06));break;
  case 'boot':add(piece(b.box,'#ff6b6b',0,y+.07,-.02,.09,.14,.1));add(piece(b.box,'#ff6b6b',0,y+.03,.06,.09,.06,.16));add(piece(b.box,a,0,y+.07,.02,.092,.02,.1));for(const dz of [-.03,.05,.12])add(piece(b.cyl,'#ffffff',0,y-.005,dz,.012,.01,.012));break;
 }
 for(const x of out)x.shadow=false;
 // Its own colour shows on a little plinth so every topper reads against the sky.
 out.push(piece(b.cyl,c,0,y-.012,0,.13,.025,.13,0,0,0,{shadow:false}));
 return out;
}

/**
 * The front, rebuilt for the machine-as-interface (owner, Nov 9 2026: "the gashapon spin and price should be part of the machine";
 * "the machine needs to interact to show the gashapon being dropped down"). Unscaled metres on the cream panel (front +z):
 * the turn-knob on the left with the coin plate under it; on the right a dark chute window the capsule slides down, ending
 * in the pick-up tray with its swing flap. lib/graphics/gashaponLive.ts animates the moving parts (crank, capsule pool, the
 * next capsule, flap) on the open machine only; the HTML controls (components/GashaponMachineFace.tsx) sit on `gashaFace(m)`.
 */
const FRONT={knob:{x:-.15,y:.52},coin:{x:-.15,y:.27},chute:{x:.15,y0:.31,y1:.63,w:.18},tray:{x:.15,y:.2,w:.26,h:.16},flapHinge:.28} as const;
/** Moving parts (lib/graphics/gashaponLive.ts); everything else is 'body'. 'next' = the capsule at the bottom of the globe. */
export type GashaPart='body'|'crank'|'pool'|'next'|'flap';
const SX=GASHA_CABINET_XZ,SY=GASHA_SCALE,FZ=GASHA_SIZE.d/2*SX;
/**
 * The classic machine's front as built (scale included): where the HTML controls are anchored and the pivots the open machine
 * animates around. `next` is the capsule waiting at the bottom of the globe (radius `capsuleR`). Other styles: `gashaFace(m)`.
 */
export const GASHA_FACE={front:FZ,halfW:GASHA_SIZE.w/2*SX,cabinetTop:BASE.cabinetH*SY,
 knob:{x:FRONT.knob.x*SX,y:FRONT.knob.y*SY,z:FZ+.03*SX,r:.11*SY},coin:{x:FRONT.coin.x*SX,y:FRONT.coin.y*SY,z:FZ+.02},
 chute:{x:FRONT.chute.x*SX,top:FRONT.chute.y1*SY,bottom:FRONT.chute.y0*SY,z:FZ+.012},tray:{x:FRONT.tray.x*SX,y:FRONT.tray.y*SY,z:FZ+.05,w:FRONT.tray.w*SX,h:FRONT.tray.h*SY},
 flapHinge:{y:FRONT.flapHinge*SY,z:FZ+.045*SX},globe:{y:BASE.globeY*SY,r:BASE.globeR*SY},next:{y:(BASE.globeY-.17)*SY},capsuleR:.075*SY} as const;

/**
 * The style kit (owner, Nov 10 2026; lib/gashapon/machines.ts GASHA_LOOK). Each style is one or two UNITS (the classic machine
 * scaled evenly by `k` round its ground centre, then moved by ox / lift / oz; `column` raises its globe inside the unit) plus a few
 * extra solid pieces (`styleExtras`). Only the first unit is live (its crank, pool, next capsule and flap move); a second unit is
 * all 'body'. Same primitives, same two materials (paint batch + the shared glass), so no new draw call.
 */
type Unit={k:number;ox:number;lift:number;oz:number;column:number;cabinet:boolean;front:boolean;cap:boolean;dome:boolean;live:boolean;mix:number};
const unit=(u:Partial<Unit>):Unit=>({k:1,ox:0,lift:0,oz:0,column:0,cabinet:true,front:true,cap:true,dome:false,live:true,mix:0,...u});
const CAB_TOP=BASE.cabinetH*SY,CAB_W=GASHA_SIZE.w*SX,CAB_D=GASHA_SIZE.d*SX;
/** Counter: the stool's seat height. Double: the deck shelf's top. Twin: the two globes' x and their scale. */
const STOOL=.45,DECK=1.45,TWIN_X=.35,TWIN_K=.82,TOWER_K=.82,TOWER_COLUMN=.5,DOUBLE_K=.85,UPPER_K=.72,COUNTER_K=.66;
const STYLE_UNITS:Readonly<Record<GashaponStyle,readonly Unit[]>>={
 classic:[unit({})],
 retro:[unit({cabinet:false})],
 double:[unit({k:DOUBLE_K,cap:false}),unit({k:UPPER_K,lift:DECK-UPPER_K*CAB_TOP,cabinet:false,front:false,live:false,mix:3})],
 tower:[unit({k:TOWER_K,column:TOWER_COLUMN,cap:false,dome:true})],
 counter:[unit({k:COUNTER_K,lift:STOOL})],
 twin:[unit({k:TWIN_K,ox:-TWIN_X,oz:FZ*(1-TWIN_K),cabinet:false}),unit({k:TWIN_K,ox:TWIN_X,oz:FZ*(1-TWIN_K),cabinet:false,live:false,mix:3})],
};
/**
 * Each style's overall size as built (m): body width and depth, the cabinet top, the front plane, and the very top (topper,
 * canopy). The camera close-up, the hover box and the prompt bubble use these; tests/gashapon-styles.cjs checks them against
 * the geometry.
 */
export const GASHA_STYLE_DIMS:Readonly<Record<GashaponStyle,{w:number;d:number;cabinetTop:number;front:number;top:number}>>={
 classic:{w:CAB_W,d:CAB_D,cabinetTop:CAB_TOP,front:FZ,top:2},
 retro:{w:CAB_W,d:CAB_D,cabinetTop:CAB_TOP,front:FZ,top:2.25},
 double:{w:CAB_W*DOUBLE_K,d:CAB_D*DOUBLE_K,cabinetTop:CAB_TOP*DOUBLE_K,front:FZ*DOUBLE_K,top:2.2},
 tower:{w:CAB_W*TOWER_K,d:CAB_D*TOWER_K,cabinetTop:CAB_TOP*TOWER_K,front:FZ*TOWER_K,top:2.08},
 counter:{w:.6,d:.49,cabinetTop:STOOL+CAB_TOP*COUNTER_K,front:FZ*COUNTER_K,top:1.78},
 twin:{w:1.4,d:CAB_D,cabinetTop:CAB_TOP*TWIN_K,front:FZ,top:1.65},
};
export const gashaStyleDims=(m:{id:string})=>GASHA_STYLE_DIMS[gashaStyleOf(m)];
/** Number of glass globes per style (the second unit of a double / twin has its own). */
export const GASHA_STYLE_GLOBES:Readonly<Record<GashaponStyle,number>>={classic:1,retro:1,double:2,tower:1,counter:1,twin:2};

/** The live unit's front for machine `m` (machine-local metres as built): GASHA_FACE moved and scaled onto that style. */
export function gashaFace(m:{id:string}){
 const st=gashaStyleOf(m),u=STYLE_UNITS[st][0],C=GASHA_FACE,D=GASHA_STYLE_DIMS[st],k=u.k;
 const X=(x:number)=>u.ox+k*x,Y=(y:number)=>u.lift+k*y,Z=(z:number)=>u.oz+k*z,G=(y:number)=>u.lift+k*(y+u.column);
 return {style:st,front:D.front,halfW:D.w/2,cabinetTop:D.cabinetTop,top:D.top,
  knob:{x:X(C.knob.x),y:Y(C.knob.y),z:Z(C.knob.z),r:k*C.knob.r},coin:{x:X(C.coin.x),y:Y(C.coin.y),z:Z(C.coin.z)},
  chute:{x:X(C.chute.x),top:Y(C.chute.top),bottom:Y(C.chute.bottom),z:Z(C.chute.z)},tray:{x:X(C.tray.x),y:Y(C.tray.y),z:Z(C.tray.z),w:k*C.tray.w,h:k*C.tray.h},
  flapHinge:{y:Y(C.flapHinge.y),z:Z(C.flapHinge.z)},globe:{x:X(0),y:G(C.globe.y),z:Z(0),r:k*C.globe.r},next:{x:X(0),y:G(C.next.y),z:Z(0)},capsuleR:k*C.capsuleR};
}
export type GashaFace=ReturnType<typeof gashaFace>;

/** One unit's pieces, machine-local as built. */
function unitPieces(m:GashaponMachine,index:number,b:Bases,u:Unit):(GashaPiece&{part:GashaPart})[]{
 const {w,d}=GASHA_SIZE,H=BASE,F=FRONT,out:(GashaPiece&{part:GashaPart})[]=[],space:('cab'|'knob'|'up')[]=[];
 let part:GashaPart='body',sp:'cab'|'knob'|'up'='cab';const add=(x:GashaPiece)=>{out.push({...x,part:u.live?part:'body'});space.push(sp);};
 if(u.cabinet){// Cabinet: body, darker plinth; the collar in the accent colour.
  add(piece(b.box,m.color,0,H.cabinetH/2+.04,0,w,H.cabinetH-.08,d));
  add(piece(b.box,DARK,0,.03,0,w-.04,.06,d-.04));
  add(piece(b.box,m.accent,0,H.cabinetH+.02,0,w+.02,.05,d+.02));}
 if(u.front){// A cream front panel; the coin plate under the knob (the price shows on it in HTML); the chute window and the tray.
  add(piece(b.box,CREAM,0,.42,d/2+.006,w-.16,.5,.012,0,0,0,{shadow:false}));
  add(piece(b.box,METAL,F.coin.x,F.coin.y,d/2+.016,.15,.13,.02,0,0,0,{shadow:false}));
  add(piece(b.box,DARK,F.coin.x,F.coin.y+.02,d/2+.028,.07,.02,.01,0,0,0,{shadow:false}));
  add(piece(b.box,m.color,F.coin.x,F.coin.y-.035,d/2+.028,.1,.025,.01,0,0,0,{shadow:false}));
  const cy=(F.chute.y0+F.chute.y1)/2,ch=F.chute.y1-F.chute.y0;
  add(piece(b.box,METAL,F.chute.x,cy,d/2+.009,F.chute.w+.04,ch+.04,.012,0,0,0,{shadow:false}));
  add(piece(b.box,DARK,F.chute.x,cy,d/2+.014,F.chute.w,ch,.008,0,0,0,{shadow:false}));
  add(piece(b.box,DARK,F.tray.x,F.tray.y,d/2+.02,F.tray.w,F.tray.h,.04,0,0,0,{shadow:false}));
  add(piece(b.box,m.accent,F.tray.x,F.tray.y-.08,d/2+.05,F.tray.w+.04,.035,.08,0,0,0,{shadow:false}));
  part='flap';add(piece(b.box,'#b9d4de',F.tray.x,F.flapHinge-.065,d/2+.045,F.tray.w-.02,.13,.012,0,0,0,{shadow:false}));
  // Turn-knob (left): metal rosette, a bar and a grip in the machine colour; scaled evenly round its centre so it turns true.
  part='crank';sp='knob';
  add(piece(b.cyl,METAL,F.knob.x,F.knob.y,d/2+.03,.11,.04,.11,Math.PI/2,0,0,{shadow:false}));
  add(piece(b.box,METAL,F.knob.x,F.knob.y,d/2+.06,.2,.045,.035,0,0,.5,{shadow:false}));
  add(piece(b.ball,m.color,F.knob.x+Math.cos(.5)*.1,F.knob.y+Math.sin(.5)*.1,d/2+.08,.035,.035,.035,0,0,0,{shadow:false}));}
 part='body';sp='up';
 // Globe seat, the capsules inside (two-tone halves: colour on top, white under), the glass and the cap (or the tower's dome).
 add(piece(b.cyl,m.accent,0,H.cabinetH+.07,0,H.globeR*.82,.06,H.globeR*.82));
 const r=.075,slots:[number,number,number][]=[[0,-.17,0],[-.13,-.15,.06],[.13,-.15,-.05],[.05,-.15,.14],[-.06,-.16,-.14],[.15,-.14,.1],
  [-.08,-.04,.08],[.08,-.04,-.08],[0,-.03,-.02],[-.15,-.03,-.06],[.12,-.02,.12],[-.02,.08,.06],[.06,.09,-.05]];
 slots.forEach(([x,y,z],i)=>{const col=CAPSULES[(i+index*2)%CAPSULES.length],ry=i*1.7,tilt=(i%3-1)*.6;part=i===0?'next':'pool';
  add(piece(b.capTop,col,x,H.globeY+y,z,r,r,r,tilt,ry,0,{shadow:false}));add(piece(b.capBottom,'#fbfbf6',x,H.globeY+y,z,r,r,r,tilt,ry,0,{shadow:false}));});
 part='body';
 add(piece(b.globe,'#e4f6ff',0,H.globeY,0,H.globeR,H.globeR,H.globeR,0,0,0,{glass:true,shadow:false}));
 if(u.cap){add(piece(b.cyl,m.color,0,H.globeY+H.globeR+.01,0,.11,.05,.11,0,0,0,{shadow:false}));
  add(piece(b.ball,m.accent,0,H.globeY+H.globeR+.04,0,.05,.03,.05,0,0,0,{shadow:false}));
  for(const t of topper(b,TOPPER[m.id],m,H.capTop+.03))add(t);}
 if(u.dome){// Tower: a dome in the machine colour over the globe's crown, an accent band, the topper on top.
  add(piece(b.capTop,m.color,0,H.globeY+H.globeR-.07,0,.17,.14,.17,0,0,0,{shadow:false}));
  add(piece(b.cyl,m.accent,0,H.globeY+H.globeR-.065,0,.175,.03,.175,0,0,0,{shadow:false}));
  for(const t of topper(b,TOPPER[m.id],m,H.globeY+H.globeR+.09))add(t);}
 // The 1.2× visual scale (see GASHA_SCALE): the cabinet keeps its footprint, everything above it grows evenly; the knob grows
 // evenly round its own (footprint-scaled) centre. Then the unit's own scale and place.
 const cab=new T.Matrix4().makeScale(SX,SY,SX),up=new T.Matrix4().makeScale(SY,SY,SY),knob=new T.Matrix4().makeTranslation(F.knob.x*SX,F.knob.y*SY,d/2*SX).multiply(up).multiply(new T.Matrix4().makeTranslation(-F.knob.x,-F.knob.y,-d/2));
 const raise=new T.Matrix4().makeTranslation(0,u.column,0),place=new T.Matrix4().makeTranslation(u.ox,u.lift,u.oz).multiply(new T.Matrix4().makeScale(u.k,u.k,u.k));
 const moved=u.k!==1||u.ox!==0||u.lift!==0||u.oz!==0;
 out.forEach((x,i)=>{x.geometry.applyMatrix4(space[i]==='knob'?knob:space[i]==='cab'?cab:up);if(space[i]==='up'&&u.column)x.geometry.applyMatrix4(raise);if(moved)x.geometry.applyMatrix4(place);});
 return out;
}

/** The solid extras that make each style's silhouette (machine-local as built, all 'body'). */
function styleExtras(st:GashaponStyle,m:GashaponMachine,b:Bases):GashaPiece[]{
 const out:GashaPiece[]=[],add=(x:GashaPiece)=>out.push(x),trim=gashaTrimOf(m),c=m.color,a=m.accent;
 if(st==='retro'){// Round shoulders: a lower body, a narrower top and two rounded edges; a striped canopy sign on two back posts.
  add(piece(b.box,DARK,0,.036,0,CAB_W-.04,.072,CAB_D-.04));
  add(piece(b.box,c,0,.428,0,CAB_W,.664,CAB_D));
  add(piece(b.box,c,0,.812,0,CAB_W,.104,CAB_D-.2));
  for(const z of [-1,1])add(piece(b.cyl,c,0,.764,z*(CAB_D/2-.1),.1,CAB_W,.1,0,0,Math.PI/2));
  add(piece(b.box,a,0,.11,0,CAB_W+.01,.04,CAB_D+.01));
  for(const x of [-1,1])add(piece(b.cyl,METAL,x*(CAB_W/2-.05),1.49,-CAB_D/2+.05,.022,1.26,.022));
  add(piece(b.box,c,0,2.14,-.03,CAB_W+.02,.04,.56));
  for(let i=0;i<6;i++)add(piece(b.box,i%2?trim:a,-CAB_W/2+.0717+i*.1433,2.07,.255,.1433,.12,.02,0,0,0,{shadow:false}));
  add(piece(b.box,trim,0,2.2,-.03,.5,.09,.04,0,0,0,{shadow:false}));
 }else if(st==='double'){// Four posts from the cabinet top to a deck shelf; a band in the machine colour along its front.
  const k=DOUBLE_K,hw=CAB_W*k/2-.03,hd=CAB_D*k/2-.03,y0=CAB_TOP*k,y1=DECK-.04;
  for(const x of [-1,1])for(const z of [-1,1])add(piece(b.cyl,METAL,x*hw,(y0+y1)/2,z*hd,.018,y1-y0,.018));
  add(piece(b.box,trim,0,DECK-.02,0,CAB_W*k+.04,.04,CAB_D*k+.04));
  add(piece(b.box,c,0,DECK-.05,CAB_D*k/2+.025,CAB_W*k+.04,.05,.012,0,0,0,{shadow:false}));
  add(piece(b.box,a,0,DECK-.05,CAB_D*k/2+.033,CAB_W*k*.5,.022,.006,0,0,0,{shadow:false}));
 }else if(st==='tower'){// The column that lifts the globe, in bands of the machine colour and the trim.
  const k=TOWER_K,y0=CAB_TOP*k,y1=(BASE.cabinetH+.04)*SY*k+TOWER_COLUMN*k,n=4,h=(y1-y0)/n;
  for(let i=0;i<n;i++)add(piece(b.cyl,i%2?trim:c,0,y0+h*(i+.5),0,.19,h,.19));
  add(piece(b.cyl,a,0,y0+.015,0,.23,.03,.23));
 }else if(st==='counter'){// A stool: seat in the trim colour, four metal legs, a foot rail.
  add(piece(b.box,trim,0,STOOL-.025,0,.6,.05,.49));
  for(const x of [-1,1])for(const z of [-1,1])add(piece(b.cyl,METAL,x*.25,(STOOL-.05)/2,z*.19,.022,STOOL-.05,.022));
  for(const z of [-1,1])add(piece(b.box,METAL,0,.14,z*.19,.5,.025,.025));
  add(piece(b.box,a,0,STOOL-.06,.245,.6,.02,.01,0,0,0,{shadow:false}));
 }else if(st==='twin'){// One wide base under both globes, a trim stripe low down and a divider between the two fronts.
  const top=CAB_TOP*TWIN_K;
  add(piece(b.box,DARK,0,.036,0,1.36,.072,CAB_D-.04));
  add(piece(b.box,c,0,(top+.072)/2,0,1.4,top-.072,CAB_D));
  add(piece(b.box,a,0,top+.02,0,1.42,.05,CAB_D+.02));
  add(piece(b.box,trim,0,.11,0,1.41,.05,CAB_D+.01));
  add(piece(b.box,trim,0,top*.55,CAB_D/2+.006,.04,top*.7,.012,0,0,0,{shadow:false}));
 }
 return out;
}

/** Every piece of one machine, machine-local (front +z), in its style. `index` varies the capsule mix. */
export function gashaponPieces(m:GashaponMachine,index=0,b:Bases=bases()):(GashaPiece&{part:GashaPart})[]{
 const st=gashaStyleOf(m),out:(GashaPiece&{part:GashaPart})[]=[];
 for(const u of STYLE_UNITS[st])out.push(...unitPieces(m,index+u.mix,b,u));
 for(const x of styleExtras(st,m,b))out.push({...x,part:'body'});
 return out;
}
export const gashaponBases=bases;
export function disposeBases(b:Bases){for(const g of Object.values(b))g.dispose();}

const paint=(g:T.BufferGeometry,hex:string)=>{const c=new T.Color(hex),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)c.toArray(a,i*3);g.setAttribute('color',new T.BufferAttribute(a,3));return g;};
const plain=(g:T.BufferGeometry)=>{const n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();for(const k of Object.keys(n.attributes))if(k!=='position'&&k!=='normal')n.deleteAttribute(k);return n;};

/**
 * Several machines merged in world (or room) space: one vertex-coloured solid geometry and one glass geometry. The caller owns
 * both (dispose them with its meshes).
 */
export function mergedGashapon(machines:readonly GashaponMachine[]):{solid:T.BufferGeometry;glass:T.BufferGeometry}{
 const b=bases(),solid:T.BufferGeometry[]=[],glass:T.BufferGeometry[]=[],place=new T.Matrix4();
 machines.forEach((m,i)=>{place.compose(p.set(m.x,m.y,m.z),q.setFromEuler(e.set(0,m.yaw,0)),s.set(1,1,1));
  for(const x of gashaponPieces(m,i,b)){const g=plain(x.geometry);g.applyMatrix4(place);(x.glass?glass:solid).push(x.glass?g:paint(g,x.color));}});
 disposeBases(b);
 const merge=(list:T.BufferGeometry[])=>{const g=mergeGeometries(list,false)!;list.forEach(x=>x.dispose());g.computeBoundingSphere();return g;};
 return {solid:merge(solid),glass:merge(glass)};
}
/** The glass look shared by every globe: pale, see-through, no depth write (so the capsules behind show), lit by the scene's own lights. */
export function gashaponGlassMaterial(){return new T.MeshStandardMaterial({color:'#e4f6ff',transparent:true,opacity:.26,roughness:.08,metalness:0,depthWrite:false,name:'gashapon-glass'});}
/** Axis-aligned collider covering the rotated cabinet of its style (+ a small margin), in the island's {x,z,w,d} shape. */
export function gashaponFootprint(m:Pick<GashaponMachine,'x'|'z'|'yaw'>&{id?:string}){const c=Math.abs(Math.cos(m.yaw)),sn=Math.abs(Math.sin(m.yaw)),S=m.id?GASHA_STYLE_SIZE[gashaStyleOf({id:m.id})]:GASHA_SIZE,w=S.w+.06,d=S.d+.06;return {x:m.x,z:m.z,w:+(c*w+sn*d).toFixed(2),d:+(sn*w+c*d).toFixed(2)};}
