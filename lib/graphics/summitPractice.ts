/**
 * Summit 5s practice area runtime (owner, Nov 24 2026). Rules + drills + ball physics: lib/town/summitPractice.ts; HUD:
 * components/SummitPracticeHud.tsx (through lib/town/summitPracticeStore.ts); Town wires the ports and five calls.
 *
 * - Walk onto the pitch (inside the fence) → practice mode: the island's paths / settings / map / ride buttons hide (CSS on
 *   .town-app[data-practice]), the live games' camera button cycles Follow → Tactical → Behind goal → Side-on, the drill's cones,
 *   mannequins and balls appear. Walk off (or Exit, which steps you out of the gate) → normal walking with your own ball.
 * - No ball of your own (owner Nov 25 2026): your dribble ball is stowed on entry. Walk up to any loose (white) practice ball and
 *   it becomes your dribble ball (a small pickup cue); a kick (or a dropped keep-up) lets it go: it rolls on and stays where it
 *   stops, and you walk to a ball (the same or another) to have one again. Walk into one while dribbling and you knock it on.
 *   Exit (or walking off) gives you your own ball back. Every ball bounces off the fence, goals, mannequins and the other balls; cones topple.
 * - Edit mode: the tactical camera over the pitch; drag props (0.5 m grid), tap to select (rotate / colour / remove), add from
 *   the tray, Reset drill, Done. Two fingers / right-drag / wheel move the camera. The layout is saved per drill.
 *
 * Heat: nothing exists until you step on the pitch (Town's per-frame cost while off: one x > 400 test, then one box test on
 * Summit Isle). While practising: three InstancedMeshes (cones, mannequins, balls: +3 draws, no shadows), +2 in edit mode (grid,
 * selection ring); matrices are rewritten only on frames where something moved; physics only for awake balls; no timers, no rAF
 * of its own, no allocation per frame, no network. Everything is disposed when you leave the pitch.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createClassicBallGeometry,CLASSIC_BALL} from './ballAppearance';
import {SUMMIT_PITCH,PITCH_HEIGHT} from '../town/summitIsle';
import {
 PRACTICE_LIMITS,PRACTICE_SAVE_KEY,PRACTICE_BALL,PRACTICE_BALL_WHITE,CONE_HEX,HALF_U,HALF_V,
 practiceZone,insidePracticeFence,gateExit,sanitizePracticeSave,enterDrill,shuffleDrill,layoutFor,saveLayout,resetLayout,drillById,
 buildPracticeWorld,resetPracticeWorld,stepPractice,createPracticeStep,hitProps,kickBall,touchBall,countKind,
 moveProp,rotateProp,removeProp,addProp,pickProp,
 type PracticeSave,type PracticeProp,type PracticeWorld,type PBall,type DrillId,type ConeColor,type PropKind,
} from '../town/summitPractice';
import {practiceStore,installPracticeActions} from '../town/summitPracticeStore';
import {createJoinCamera,createJoinCamFrame,joinCamFrame,turnStick,type JoinCamAngle,type JoinCamPitch} from '../town/liveJoinCamera';

type WalkBallLike={state:{x:number;y:number;z:number;vx:number;vy:number;vz:number;mode:string};reset(p:{x:number;y:number;z:number;yaw:number}):void};
export type PracticePorts={
 canvas:()=>HTMLCanvasElement|null;
 root:()=>HTMLElement|null;
 walkBall:WalkBallLike;
 /** The player now: feet position, facing (atan2(x, z)) and walking velocity (m/s). */
 player:()=>{x:number;y:number;z:number;yaw:number;vx:number;vz:number};
 /** Exit: put the player here (outside the gate), facing yaw, the ball at the feet. */
 place:(x:number,z:number,yaw:number)=>void;
 /** Slide the player to (x, z) (a mannequin's push-out); the ball is untouched. */
 nudge:(x:number,z:number)=>void;
 /** A scooter / bike / moped ridden onto the pitch is stowed (you walk on the pitch). */
 stowRide:()=>void;
 /** The walking ball's look: 'white' = a practice ball picked up, null = the player's own ball again. */
 setBallStyle:(style:'white'|null)=>void;
 impact:(x:number,y:number,z:number)=>void;
 /** A loose ball scored: Town's goal cheer (the same as the walking ball's). */
 goal:()=>void;
 /** Wake Town's loop (a HUD press while the island idles). */
 wake:()=>void;
};
export type PracticeFrame={dt:number;reduced:boolean;camera:T.PerspectiveCamera;
 /** Town: on the ground on foot or a ground ride, nothing else running (live match, Summit Kick, train, water, a menu). */
 allowed:boolean};

const CAMS:readonly JoinCamAngle[]=['broadcast','wide','behind','side'];
export const PRACTICE_CAM_LABEL:Record<string,string>={broadcast:'Follow',wide:'Tactical',behind:'Behind goal',side:'Side-on'};
const CAM_KEY='fi2-practice-cam';
const cue=(detail:string)=>{if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail}));};

// ------------------------------------------------------------------------------------------------------------ geometry
function paint(g:T.BufferGeometry,c:string|number){const col=new T.Color(c),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b;}g.setAttribute('color',new T.BufferAttribute(a,3));if(g.getAttribute('uv'))g.deleteAttribute('uv');return g;}
const at=(g:T.BufferGeometry,x:number,y:number,z:number)=>{g.translate(x,y,z);return g;};
const merged=(parts:T.BufferGeometry[])=>{const ns=parts.map(p=>p.index?p.toNonIndexed():p);const m=mergeGeometries(ns)!;parts.forEach(p=>p.dispose());ns.forEach(p=>p.dispose());return m;};
/** A training cone (white body for the instance tint, a slightly darker square base). Origin at the ground. */
/* Owner Nov 25 2026: "make the cones a little larger": 1.3x (0.43 m tall, 0.39 m base). */
const CS=1.3;
function coneGeometry(){return merged([paint(at(new T.CylinderGeometry(.022*CS,.13*CS,.3*CS,10),0,.03*CS+.15*CS,0),'#ffffff'),paint(at(new T.BoxGeometry(.3*CS,.03*CS,.3*CS),0,.015*CS,0),'#b8b8b8')]);}
/** A free-kick wall mannequin, an original look: a sunny yellow silhouette with a navy chest band and a white chest disc (its
 *  front), on a pole and a spring base. Origin at the ground, facing +z, ~1.84 m tall. */
function manGeometry(){
 const Y='#f3c623',NAVY='#1d3557';
 return merged([
  paint(at(new T.CylinderGeometry(.24,.28,.08,12),0,.04,0),'#3b3f46'),
  paint(at(new T.CylinderGeometry(.045,.045,.5,6),0,.33,0),'#9aa0a6'),
  paint(at(new T.BoxGeometry(.36,.52,.12),0,.84,0),Y),
  paint(at(new T.BoxGeometry(.48,.56,.14),0,1.36,0),Y),
  paint(at(new T.BoxGeometry(.49,.08,.15),0,1.5,0),NAVY),
  paint(at(new T.BoxGeometry(.1,.5,.1),-.3,1.3,0),Y),paint(at(new T.BoxGeometry(.1,.5,.1),.3,1.3,0),Y),
  paint(at(new T.SphereGeometry(.13,10,8),0,1.74,0),Y),
  paint(at(new T.CircleGeometry(.09,12),0,1.3,.071),'#ffffff'),
 ]);
}
/** The island's classic ball as one geometry, its cream turned white so each instance's tint is the ball design's colour. */
function ballGeometry(){
 const g=createClassicBallGeometry(),c=g.getAttribute('color') as T.BufferAttribute,cream=new T.Color(CLASSIC_BALL.color);
 for(let i=0;i<c.count;i++)if(Math.abs(c.getX(i)-cream.r)<.01&&Math.abs(c.getY(i)-cream.g)<.01&&Math.abs(c.getZ(i)-cream.b)<.01)c.setXYZ(i,1,1,1);
 return g;
}

export function createSummitPractice(scene:T.Scene,ports:PracticePorts){
 const P=SUMMIT_PITCH,g=PITCH_HEIGHT,R=PRACTICE_BALL.radius;
 let mode:'off'|'play'|'edit'='off',suppress=false;
 let save:PracticeSave=readSave(),drill:DrillId='slalom',layout:PracticeProp[]=[],world:PracticeWorld={balls:[],cones:[],men:[]};
 /** The practice ball at your feet (taken out of world.balls while carried); null = bare feet (Town hides the walking ball). */
 let carried:PBall|null=null,pickupWait=0,goals=0,hello=0;
 const step=createPracticeStep();
 // ---- meshes (built on entry, disposed on exit)
 let root:T.Group|null=null,cones:T.InstancedMesh|null=null,men:T.InstancedMesh|null=null,balls:T.InstancedMesh|null=null,mat:T.MeshStandardMaterial|null=null;
 let grid:T.LineSegments|null=null,ring:T.Mesh|null=null;
 const ballQ:T.Quaternion[]=Array.from({length:PRACTICE_LIMITS.ball},()=>new T.Quaternion());
 const m4=new T.Matrix4(),q=new T.Quaternion(),q2=new T.Quaternion(),pos=new T.Vector3(),one=new T.Vector3(1,1,1),axis=new T.Vector3(),col=new T.Color();
 const UP=new T.Vector3(0,1,0);
 let dirty=true,tintDirty=true;

 function readSave(){try{return sanitizePracticeSave(JSON.parse(localStorage.getItem(PRACTICE_SAVE_KEY)??'null'));}catch{return sanitizePracticeSave(null);}}
 function writeSave(){try{localStorage.setItem(PRACTICE_SAVE_KEY,JSON.stringify(save));}catch{/* private mode */}}
 function build(){
  disposeMeshes();
  mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.78});mat.name='summit-practice';
  root=new T.Group();root.name='summit-practice';
  const mk=(geo:T.BufferGeometry,n:number,name:string)=>{const m=new T.InstancedMesh(geo,mat!,n);m.name=name;m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.castShadow=m.receiveShadow=false;m.frustumCulled=false;m.count=0;
   m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);root!.add(m);return m;};
  cones=mk(coneGeometry(),PRACTICE_LIMITS.cone,'practice-cones');men=mk(manGeometry(),PRACTICE_LIMITS.man,'practice-mannequins');balls=mk(ballGeometry(),PRACTICE_LIMITS.ball,'practice-balls');
  scene.add(root);dirty=tintDirty=true;
 }
 function disposeMeshes(){
  disposeEditMeshes();
  if(root){root.removeFromParent();for(const m of [cones,men,balls])m?.geometry.dispose();root=null;}
  cones=men=balls=null;mat?.dispose();mat=null;
 }
 function disposeEditMeshes(){for(const o of [grid,ring]){if(!o)continue;o.removeFromParent();o.geometry.dispose();(o.material as T.Material).dispose();}grid=null;ring=null;}
 function buildEditMeshes(){
  disposeEditMeshes();if(!root)return;
  // The 0.5 m snap grid over the pitch (one LineSegments), faint; and the selection ring.
  const pts:number[]=[],y=g+.02;
  for(let u=-P.length/2;u<=P.length/2+1e-6;u+=1)pts.push(P.x+u,y,P.z-P.width/2,P.x+u,y,P.z+P.width/2);
  for(let v=-P.width/2;v<=P.width/2+1e-6;v+=1)pts.push(P.x-P.length/2,y,P.z+v,P.x+P.length/2,y,P.z+v);
  const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(pts,3));
  grid=new T.LineSegments(gg,new T.LineBasicMaterial({color:'#fff6dc',transparent:true,opacity:.22,depthWrite:false}));grid.name='practice-grid';grid.renderOrder=1;root.add(grid);
  const rg=new T.RingGeometry(.46,.6,28);rg.rotateX(-Math.PI/2);
  ring=new T.Mesh(rg,new T.MeshBasicMaterial({color:'#ffd27a',transparent:true,opacity:.95,depthWrite:false,toneMapped:false}));ring.name='practice-select';ring.renderOrder=2;ring.visible=false;root.add(ring);
 }
 function rebuildWorld(){if(carried){carried=null;ports.setBallStyle(null);}world=buildPracticeWorld(layout);for(const q0 of ballQ)q0.identity();dirty=tintDirty=true;}
 function writeMatrices(){
  if(!cones||!men||!balls)return;
  if(tintDirty){
   for(let i=0;i<world.cones.length;i++)cones.setColorAt(i,col.set(CONE_HEX[world.cones[i].c]));
   for(let i=0;i<world.men.length;i++)men.setColorAt(i,col.set('#ffffff'));
   for(let i=0;i<world.balls.length;i++){const b=world.balls[i];balls.setColorAt(i,col.set(PRACTICE_BALL_WHITE));}
   for(const m of [cones,men,balls])if(m.instanceColor)m.instanceColor.needsUpdate=true;tintDirty=false;}
  cones.count=world.cones.length;men.count=world.men.length;balls.count=world.balls.length;
  for(let i=0;i<world.cones.length;i++){const c=world.cones[i];
   if(c.down){const a=c.fall*1.28;axis.set(c.dz,0,-c.dx).normalize();q.setFromAxisAngle(axis,a);pos.set(c.x+c.dx*.1*CS*c.fall,g+Math.sin(a)*.1*CS,c.z+c.dz*.1*CS*c.fall);}
   else{q.identity();pos.set(c.x,g,c.z);}
   cones.setMatrixAt(i,m4.compose(pos,q,one));}
  for(let i=0;i<world.men.length;i++){const m=world.men[i];q.setFromAxisAngle(UP,m.yaw);if(m.tilt){axis.set(m.az,0,-m.ax);q2.setFromAxisAngle(axis,m.tilt);q.premultiply(q2);}pos.set(m.x,g,m.z);men.setMatrixAt(i,m4.compose(pos,q,one));}
  for(let i=0;i<world.balls.length;i++){const b=world.balls[i];pos.set(b.x,b.y,b.z);balls.setMatrixAt(i,m4.compose(pos,ballQ[i],one));}
  cones.instanceMatrix.needsUpdate=men.instanceMatrix.needsUpdate=balls.instanceMatrix.needsUpdate=true;dirty=false;
 }
 function rollBalls(dt:number){for(let i=0;i<world.balls.length;i++){const b=world.balls[i];if(!b.awake||b.spin<.05)continue;axis.set(b.vz,0,-b.vx).normalize();q.setFromAxisAngle(axis,b.spin*dt/R);ballQ[i].premultiply(q);}}

 // ---- the HUD view
 const counts=()=>({cones:countKind(layout,'cone'),men:countKind(layout,'man'),balls:countKind(layout,'ball')});
 function publish(extra:Partial<ReturnType<typeof practiceStore.get>>={}){
  const d=drillById(drill)!;
  practiceStore.set({mode,drill,name:d.name,tip:d.tip,cam:PRACTICE_CAM_LABEL[camCtl.angle]??'Follow',hello,goals,selected:selected>=0?layout[selected]?.k??null:null,...counts(),edited:!!save.layouts[drill],...extra});
 }
 const app=(attr:string,on:boolean)=>{const r=ports.root();if(!r)return;if(on)r.setAttribute(attr,'');else r.removeAttribute(attr);};

 // ---- enter / leave
 function enter(){
  save=readSave();const e=enterDrill(save);save=e.save;drill=e.drill;writeSave();
  layout=layoutFor(save,drill);build();rebuildWorld();pickupWait=0;mode='play';hello++;selected=-1;
  ports.stowRide();app('data-practice',true);
  try{const a=sessionStorage.getItem(CAM_KEY);if(a&&CAMS.includes(a as JoinCamAngle))camCtl.set(a as JoinCamAngle,0);}catch{}
  addKeys();publish();cue('select');
 }
 function leave(stepOut:boolean,ballHome=true){
  if(mode==='off')return;
  if(mode==='edit')endEdit();
  mode='off';disposeMeshes();world={balls:[],cones:[],men:[]};
  if(carried){carried=null;ports.setBallStyle(null);}
  app('data-practice',false);app('data-practice-edit',false);removeKeys();camCtl.set('broadcast',0);
  const p=ports.player();
  if(stepOut){const o=gateExit();ports.place(o.x,o.z,o.yaw);suppress=true;}
  else if(ballHome){const wb=ports.walkBall.state.mode;if(wb!=='attached')ports.walkBall.reset({x:p.x,y:p.y,z:p.z,yaw:p.yaw});}
  practiceStore.reset();
 }
 function shuffle(){if(mode==='off')return;if(mode==='edit')endEdit();const e=shuffleDrill(save);save=e.save;drill=e.drill;writeSave();layout=layoutFor(save,drill);rebuildWorld();publish();cue('confirm');ports.wake();}

 // ---- edit mode
 let selected=-1,prevCam:JoinCamAngle='broadcast',zoom=1,panU=0,panV=0;
 function beginEdit(){if(mode!=='play')return;mode='edit';prevCam=camCtl.angle;camCtl.set('wide',0);zoom=1;panU=panV=0;selected=-1;
  layout=layoutFor(save,drill);rebuildWorld();buildEditMeshes();app('data-practice-edit',true);addPointers();publish();cue('select');ports.wake();}
 function endEdit(){if(mode!=='edit')return;removePointers();disposeEditMeshes();mode='play';selected=-1;camCtl.set(prevCam,0);app('data-practice-edit',false);rebuildWorld();}
 function edited(){save=saveLayout(save,drill,layout);writeSave();rebuildWorld();publish();ports.wake();}
 const actionsOff=installPracticeActions({
  shuffle,
  exit:()=>{leave(true);cue('confirm');ports.wake();},
  edit:beginEdit,
  done:()=>{endEdit();publish();cue('confirm');ports.wake();},
  reset:()=>{if(mode!=='edit')return;save=resetLayout(save,drill);writeSave();layout=layoutFor(save,drill);selected=-1;rebuildWorld();publish();cue('confirm');ports.wake();},
  camera:()=>cycleCamera(),
  add:(kind:PropKind,color?:ConeColor)=>{if(mode!=='edit')return;const i=addProp(layout,kind,panU,panV,color);if(i<0){cue('error');return;}selected=i;edited();cue('pop');},
  rotate:()=>{if(mode!=='edit'||selected<0)return;if(rotateProp(layout,selected))edited();},
  remove:()=>{if(mode!=='edit'||selected<0)return;removeProp(layout,selected);selected=-1;edited();},
  deselect:()=>{selected=-1;publish();},
 });

 // ---- keys: C cycles the camera (as in live games); Esc leaves the editor.
 let keysOn=false;
 const onKey=(e:KeyboardEvent)=>{const t=e.target as HTMLElement|null;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(e.metaKey||e.ctrlKey||e.altKey||e.repeat)return;
  if((e.key==='c'||e.key==='C')&&mode==='play'){e.preventDefault();e.stopPropagation();cycleCamera();}
  else if(e.key==='Escape'&&mode==='edit'){e.preventDefault();e.stopPropagation();endEdit();publish();ports.wake();}};
 function cycleCamera(){if(mode!=='play')return;const a=CAMS[(CAMS.indexOf(camCtl.angle)+1)%CAMS.length];camCtl.set(a,stickLen);try{sessionStorage.setItem(CAM_KEY,a);}catch{}publish();ports.wake();}
 function addKeys(){if(keysOn||typeof window==='undefined')return;keysOn=true;window.addEventListener('keydown',onKey,true);}
 function removeKeys(){if(!keysOn)return;keysOn=false;window.removeEventListener('keydown',onKey,true);}

 // ---- edit input: props drag on the ground; two fingers / right-drag / wheel move the camera.
 const ptrs=new Map<number,{x:number;y:number;sx:number;sy:number;t:number;button:number}>();
 let drag:{id:number;i:number;du:number;dv:number;moved:boolean}|null=null,pan:{x:number;y:number;u:number;v:number}|null=null,pinch:{d:number;zoom:number;mx:number;my:number;u:number;v:number}|null=null;
 let lastCam:T.PerspectiveCamera|null=null,pointersOn=false;
 const ray=new T.Raycaster(),ndc=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),-g),hit=new T.Vector3(),camRight=new T.Vector3(),camFwd=new T.Vector3();
 function ground(clientX:number,clientY:number){const c=ports.canvas(),cam=lastCam;if(!c||!cam)return null;const r=c.getBoundingClientRect();
  ndc.set((clientX-r.left)/r.width*2-1,-((clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,cam);return ray.ray.intersectPlane(plane,hit)?{u:hit.x-P.x,v:hit.z-P.z}:null;}
 /** Metres per screen pixel at the pitch (the 44 px touch target's reach, and camera pans). */
 function mpp(){const c=ports.canvas(),cam=lastCam;if(!c||!cam)return .05;const d=cam.position.distanceTo(pos.set(P.x+panU,g,P.z+panV));return 2*d*Math.tan(cam.fov*Math.PI/360)/Math.max(1,c.clientHeight);}
 function panBy(dxPx:number,dyPx:number,u0:number,v0:number){const cam=lastCam;if(!cam)return;const k=mpp();
  camRight.setFromMatrixColumn(cam.matrixWorld,0);camRight.y=0;camRight.normalize();camFwd.setFromMatrixColumn(cam.matrixWorld,2).negate();camFwd.y=0;camFwd.normalize();
  panU=Math.max(-HALF_U,Math.min(HALF_U,u0-(camRight.x*dxPx-camFwd.x*dyPx)*k));panV=Math.max(-HALF_V,Math.min(HALF_V,v0-(camRight.z*dxPx-camFwd.z*dyPx)*k));ports.wake();}
 const onDown=(e:PointerEvent)=>{
  const c=ports.canvas();if(mode!=='edit'||!c||e.target!==c)return;e.preventDefault();e.stopPropagation();try{c.setPointerCapture(e.pointerId);}catch{}
  ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now(),button:e.button});
  if(ptrs.size>=2){drag=null;pan=null;const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,zoom,mx:(a.x+b.x)/2,my:(a.y+b.y)/2,u:panU,v:panV};return;}
  if(e.button===2||e.button===1){pan={x:e.clientX,y:e.clientY,u:panU,v:panV};return;}
  const gp=ground(e.clientX,e.clientY);if(!gp)return;
  const i=pickProp(layout,gp.u,gp.v,Math.max(.55,22*mpp()));
  if(i>=0){drag={id:e.pointerId,i,du:layout[i].u-gp.u,dv:layout[i].v-gp.v,moved:false};selected=i;publish();}
  else pan={x:e.clientX,y:e.clientY,u:panU,v:panV};// one finger on the grass also slides the view
 };
 const onMove=(e:PointerEvent)=>{
  const p=ptrs.get(e.pointerId);if(mode!=='edit'||!p)return;e.preventDefault();e.stopPropagation();p.x=e.clientX;p.y=e.clientY;
  if(pinch&&ptrs.size>=2){const [a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1;zoom=Math.max(.4,Math.min(1.5,pinch.zoom*pinch.d/d));panBy((a.x+b.x)/2-pinch.mx,(a.y+b.y)/2-pinch.my,pinch.u,pinch.v);return;}
  if(drag&&drag.id===e.pointerId){if(Math.hypot(p.x-p.sx,p.y-p.sy)<6&&!drag.moved)return;drag.moved=true;const gp=ground(e.clientX,e.clientY);if(!gp)return;
   const before=layout[drag.i];const bu=before.u,bv=before.v;moveProp(layout,drag.i,gp.u+drag.du,gp.v+drag.dv);if(before.u!==bu||before.v!==bv){rebuildWorld();ports.wake();}return;}
  if(pan)panBy(e.clientX-pan.x,e.clientY-pan.y,pan.u,pan.v);
 };
 const onUp=(e:PointerEvent)=>{
  const p=ptrs.get(e.pointerId);if(!p)return;if(mode==='edit'){e.preventDefault();e.stopPropagation();}ptrs.delete(e.pointerId);
  const tap=Math.hypot(e.clientX-p.sx,e.clientY-p.sy)<8&&performance.now()-p.t<450&&!pinch;
  if(drag&&drag.id===e.pointerId){if(drag.moved)edited();drag=null;}
  else if(tap&&p.button===0&&mode==='edit'){const gp=ground(e.clientX,e.clientY);selected=gp?pickProp(layout,gp.u,gp.v,Math.max(.55,22*mpp())):-1;publish();ports.wake();}
  if(ptrs.size<2)pinch=null;if(ptrs.size===0)pan=null;
 };
 const onWheel=(e:WheelEvent)=>{const c=ports.canvas();if(mode!=='edit'||!c||e.target!==c)return;e.preventDefault();e.stopPropagation();zoom=Math.max(.4,Math.min(1.5,zoom*Math.exp(e.deltaY*.0012)));ports.wake();};
 const onMenu=(e:Event)=>{const c=ports.canvas();if(mode==='edit'&&c&&e.target===c)e.preventDefault();};
 function addPointers(){if(pointersOn||typeof window==='undefined')return;pointersOn=true;
  window.addEventListener('pointerdown',onDown,true);window.addEventListener('pointermove',onMove,true);window.addEventListener('pointerup',onUp,true);window.addEventListener('pointercancel',onUp,true);
  window.addEventListener('wheel',onWheel,{capture:true,passive:false});window.addEventListener('contextmenu',onMenu,true);}
 function removePointers(){if(!pointersOn)return;pointersOn=false;ptrs.clear();drag=null;pan=null;pinch=null;
  window.removeEventListener('pointerdown',onDown,true);window.removeEventListener('pointermove',onMove,true);window.removeEventListener('pointerup',onUp,true);window.removeEventListener('pointercancel',onUp,true);
  window.removeEventListener('wheel',onWheel,true);window.removeEventListener('contextmenu',onMenu,true);}

 // ---- the camera (the live games' controller; Behind goal and the editor's view are this area's own frames)
 const camCtl=createJoinCamera(),camGoal=createJoinCamFrame(),camOut=createJoinCamFrame(),camBase={x:0,y:0,z:0},stickOut={x:0,z:0};
 const camPitch:JoinCamPitch={x:P.x,z:P.z,width:P.width,length:P.length,yaw:Math.PI/2,ground:g};
 let camSaved=false,camDelta=0,stickLen=0,endSide:1|-1=1;
 function editFrame(aspect:number){
  const portrait=aspect<1,t=Math.tan(20*Math.PI/180),pitchA=64*Math.PI/180;
  const across=(portrait?P.width:P.length)/2+2,along=(portrait?P.length:P.width)/2+2;
  const d=Math.max(across/(t*Math.max(.3,aspect)),along*Math.sin(pitchA)/t+4)*zoom;
  const cx=P.x+panU,cz=P.z+panV,h=Math.cos(pitchA)*d;
  camGoal.lx=cx;camGoal.ly=g;camGoal.lz=cz;camGoal.ey=g+Math.sin(pitchA)*d;
  if(portrait){camGoal.ex=cx+h;camGoal.ez=cz;}else{camGoal.ex=cx;camGoal.ez=cz+h;}
  return camGoal;
 }
 function behindFrame(px:number,pz:number){
  const u=px-P.x;if(u>4)endSide=1;else if(u< -4)endSide=-1;
  const back=P.x-endSide*(P.length/2+7.5),gx=P.x+endSide*P.length/2;
  camGoal.ex=back;camGoal.ey=g+6.5;camGoal.ez=P.z+(pz-P.z)*.35;camGoal.lx=px*.55+gx*.45;camGoal.ly=g+.6;camGoal.lz=pz*.7+P.z*.3;return camGoal;
 }

 // ---- the frame
 return {
  get active(){return mode!=='off';},
  get editing(){return mode==='edit';},
  get mode(){return mode;},
  /** Town's rest gate: balls rolling, props settling or the editor open keep the island awake. */
  get busy(){return mode==='edit'||mode==='play'&&(step.moving||dirty);},
  get world(){return world;},
  get layout(){return layout;},
  get drill(){return drill;},
  /** 0 = carrying a practice ball, -1 = not (checks). */
  get heldStyle(){return carried?0:-1;},
  /** Practising with bare feet: Town hides the walking ball and ignores Kick / Juggle until you walk up to a ball. */
  get bare(){return mode!=='off'&&!carried;},
  get carrying(){return !!carried;},
  get cameraAngle(){return camCtl.angle;},
  /** The pitch centre (checks and tools teleport here). */
  get pitch(){return {x:P.x,z:P.z};},
  /** At the start of each island tick: the editor holds the player still (balls freeze too). */
  holdPlayer(){return mode==='edit';},
  /** Screen-relative steering under the practice cameras (the live games' rule): writes the turned stick into `stick`. */
  stick:stickOut,
  steer(ix:number,iz:number,dt:number){stickLen=Math.hypot(ix,iz);if(mode==='off'&&camCtl.w<=0){stickOut.x=ix;stickOut.z=iz;return stickOut;}
   return turnStick(ix,iz,camCtl.control(dt,camDelta,stickLen),stickOut);},
  update(f:PracticeFrame){
   const p=ports.player();lastCam=f.camera;
   if(mode==='off'){
    if(p.x<400)return;// the main island never pays more than this
    const inside=insidePracticeFence(p.x,p.z,-.35);if(!inside)suppress=false;
    if(!suppress&&f.allowed&&practiceZone(false,p.x,p.z))enter();
    return;
   }
   if(!f.allowed||!practiceZone(true,p.x,p.z)){leave(false,f.allowed);return;}
   if(mode==='edit'){
    if(dirty)writeMatrices();
    if(ring){const s=selected>=0?layout[selected]:null;ring.visible=!!s;if(s){ring.position.set(P.x+s.u,g+.03,P.z+s.v);}}
    return;
   }
   const dt=Math.min(f.dt,1/20);if(!(dt>0)){if(dirty)writeMatrices();return;}
   // Loose balls, cones, mannequins.
   stepPractice(world,dt,step);rollBalls(dt);
   if(step.goals>0){goals+=step.goals;ports.impact(step.gx,step.gy,step.gz);ports.goal();publish();}
   if(step.knocks>0)cue('pop');
   // The walking ball against the props and the loose balls (shots and drops only: the magic return passes through).
   const wb=ports.walkBall.state,flying=wb.mode==='shot'||wb.mode==='drop';
   if(flying){const before=step.knocks;hitProps(world,wb,step);if(step.knocks>before)cue('pop');
    for(const b of world.balls){const dx=b.x-wb.x,dz=b.z-wb.z,d=Math.hypot(dx,dz);if(d<2*R&&d>1e-6&&Math.abs(b.y-wb.y)<2*R){const nx=dx/d,nz=dz/d,vn=wb.vx*nx+wb.vz*nz;if(vn>0){kickBall(b,b.vx+nx*vn*.85,Math.max(b.vy,wb.vy*.3),b.vz+nz*vn*.85);wb.vx-=nx*vn*.7;wb.vz-=nz*vn*.7;}}}}
   // The player against the mannequins (they stand on a base: you walk round them).
   for(const m of world.men){const dx=p.x-m.x,dz=p.z-m.z,d=Math.hypot(dx,dz),r=PRACTICE_BALL.man+.3;if(d<r&&d>1e-6){ports.nudge(m.x+dx/d*r,m.z+dz/d*r);}}
   // A kick (or a keep-up that fell) lets the carried ball go: it carries on as a loose ball from where the walking ball is now,
   // and the walking ball goes back to the (bare) feet, hidden.
   if(carried&&(wb.mode==='shot'||wb.mode==='drop')){const b=carried;carried=null;
    b.x=wb.x;b.y=Math.max(g+PRACTICE_BALL.rest,wb.y);b.z=wb.z;b.vx=wb.vx;b.vy=wb.vy;b.vz=wb.vz;b.awake=true;b.out=0;b.spin=Math.hypot(wb.vx,wb.vz);
    world.balls.push(b);pickupWait=.6;ports.setBallStyle(null);ports.walkBall.reset({x:p.x,y:p.y,z:p.z,yaw:p.yaw});dirty=true;}
   if(pickupWait>0)pickupWait-=dt;
   // The player's feet on a loose ball: pick it up (bare feet) or knock it on (you're dribbling one).
   const k=touchBall(world,p.x+Math.sin(p.yaw)*.25,p.z+Math.cos(p.yaw)*.25,.5);
   if(k>=0){const b=world.balls[k];
    if(!carried){if(pickupWait<=0&&b.vx*b.vx+b.vz*b.vz<36){
     // Pick up: the ball leaves the loose set (its spin slot moves to the end) and is your dribble ball, white.
     world.balls.splice(k,1);const q0=ballQ.splice(k,1)[0];ballQ.push(q0);carried=b;
     ports.setBallStyle('white');ports.walkBall.reset({x:p.x,y:p.y,z:p.z,yaw:p.yaw});ports.impact(b.x,b.y-PRACTICE_BALL.rest+.02,b.z);cue('select');dirty=true;}}
    else if(wb.mode!=='shot'&&wb.mode!=='return'&&wb.mode!=='drop'){const dx=b.x-p.x,dz=b.z-p.z,d=Math.hypot(dx,dz)||1,sp=Math.hypot(p.vx,p.vz),push=Math.max(1.4,sp*1.35);
     if(b.vx*dx+b.vz*dz<push*d*.5){kickBall(b,dx/d*push+p.vx*.3,.4,dz/d*push+p.vz*.3);dirty=true;}}
   }
   if(step.moving||dirty||tintDirty)writeMatrices();// only frames where something moved
  },
  /** Town, before its follow lerp: put back the follow camera's own position (cameraApply moved it). */
  cameraRestore(camera:T.Camera){if(!camSaved)return;camera.position.set(camBase.x,camBase.y,camBase.z);camSaved=false;},
  /** Town, after its lookAt: the practice camera angle (eased); the editor's view over the pitch. */
  cameraApply(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   lastCam=camera;
   if(camCtl.w<=0&&(mode==='off'||camCtl.angle==='broadcast')){camDelta=0;return;}
   let goal=null;const p=ports.player();
   if(mode==='edit')goal=editFrame(camera.aspect);
   else if(mode==='play'&&camCtl.angle==='behind')goal=behindFrame(p.x,p.z);
   else if(mode==='play'&&camCtl.angle!=='broadcast'){const base=Math.hypot(camera.position.x-p.x,camera.position.y-g,camera.position.z-p.z);if(joinCamFrame(camCtl.angle,p.x,p.z,1,0,camPitch,camera.aspect,base,camGoal))goal=camGoal;}
   camCtl.step(dt,reduced,goal);if(camCtl.w<=0){camDelta=0;return;}
   const c=camera.position;camBase.x=c.x;camBase.y=c.y;camBase.z=c.z;camSaved=true;
   camDelta=camCtl.blend(c.x,c.y,c.z,camOut);c.set(camOut.ex,camOut.ey,camOut.ez);camera.lookAt(camOut.lx,camOut.ly,camOut.lz);camera.updateMatrixWorld();
  },
  /** Leave practice now (Town: a teleport, the island closing). */
  stop(){leave(false);},
  dispose(){leave(false);removePointers();removeKeys();actionsOff();},
 };
}
export type SummitPractice=ReturnType<typeof createSummitPractice>;
