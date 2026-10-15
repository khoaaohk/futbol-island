/**
 * The Ball Cannon's runtime (Summit Isle, Oct 14 2026): sitting in the seat, aiming the barrel, firing footballs, launching clay
 * discs from the trap, knocking them out (a little shard burst and a pop), the camera behind the barrel, the "Sit in the ball
 * cannon" prompt. Rules: lib/town/ballCannon.ts; static prop: lib/town/ballCannonWorld.ts; HUD: components/BallCannonHud.tsx
 * (through lib/town/ballCannonStore.ts). Purely for fun: no score, no coins, no records.
 *
 * Heat: no rAF, timers or listeners of its own; Town's loop calls it.
 *  - At rest (nobody seated, nothing flying): update() is one box test off Summit Isle, and on it one distance to the base for the
 *    prompt; holdPlayer() / pose() / applyCamera() are one flag check. The only thing drawn is the barrel (one small mesh, the
 *    turning piece of the prop, frustum culled like anything else; its matrix only changes while you aim).
 *  - Seated and idle: the same, plus the camera behind the barrel (a few vector ops) and the aim arc (16 points, rewritten only
 *    when the aim changes).
 *  - Only while something is in flight: the balls (≤ 8), discs (≤ 6) and shards (≤ 24) are three instanced meshes, each drawn
 *    only while it has something in the air, written only then, and built on the first sit, disposed when you leave and the last
 *    ball has landed. No shadows (no extra shadow draws); one shared vertex-coloured material.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {CANNON,cannonLayout,startAim,clampAim,aimYaw,aimDir,aimByDrag,aimBySteer,fireBall,throwDisc,flightAt,surfaceAt,discHit,hitWord,type Aim,type CannonLayout,type Flight,type Vec3} from '../town/ballCannon';
import {cannonStore,installCannonActions} from '../town/ballCannonStore';
import {CANNON_COLORS} from '../town/ballCannonWorld';
import {npcSeatPose} from './npcSeatPose';
import type {TrickPose} from './trickPose';
import type {PlayerMotion} from './player';
import {countCannonSit,countCannonHit} from '../analytics/summitEvents';

type Ports={
 /** Moves the player (on foot) to x, z facing `yaw` (into the seat, or back out beside it). */
 teleport:(x:number,z:number,yaw:number)=>void;
 /** The cannon's thump as a ball leaves (Town's ball kick sound). */
 kick:()=>void;
 /** A small burst (Town's ball effects): a disc knocked out, a ball landing on grass. */
 impact:(x:number,y:number,z:number)=>void;
 /** A splash ring where a ball or disc drops into the sea. */
 splash:(x:number,y:number,z:number)=>void;
};
export type CannonUpdate={
 dt:number;reduced:boolean;camera:T.Camera;width:number;height:number;x:number;z:number;
 /** On foot on the ground (not riding, flying or falling) and free to start something. */
 onFoot:boolean;canEnter:boolean;
 /** The HUD arbiter's current 'enter' key (lib/ui/hudStack.ts): the prompt shows only when it is ours. */
 focusKey:string|null;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
};
/** The focus arbiter's key for the prompt. */
export const CANNON_FOCUS_KEY='ball-cannon';
const cue=(detail:string)=>{if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail}));};
const paint=(g:T.BufferGeometry,hex:string|((p:T.Vector3,i:number)=>string))=>{const n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();const p=n.getAttribute('position'),a=new Float32Array(p.count*3),c=new T.Color(),v=new T.Vector3();
 for(let i=0;i<p.count;i++){c.set(typeof hex==='string'?hex:hex(v.fromBufferAttribute(p,i),i));a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}n.setAttribute('color',new T.BufferAttribute(a,3));n.deleteAttribute('uv');return n;};

/** The barrel: along +z from the ball joint (origin), breech behind it, handles for the sitter, a flared cream muzzle. */
function barrelGeometry(){
 const C=CANNON_COLORS,parts:T.BufferGeometry[]=[],along=(g:T.BufferGeometry,z:number)=>{g.rotateX(Math.PI/2);g.translate(0,0,z);return g;};
 parts.push(paint(along(new T.CylinderGeometry(.19,.21,1.3,14,1,true),0.48),C.green));
 for(const z of [.05,.62,1.02])parts.push(paint(along(new T.CylinderGeometry(.225,.225,.09,14),z),C.yellow));
 parts.push(paint(along(new T.CylinderGeometry(.27,.2,.2,14,1,true),CANNON.muzzle-.08),C.cream));
 parts.push(paint(along(new T.CylinderGeometry(.27,.27,.04,14),CANNON.muzzle+.01),C.cream));
 parts.push(paint(along(new T.CircleGeometry(.2,14),CANNON.muzzle+.035),'#1d2b28'));
 {const b=new T.SphereGeometry(.22,12,8,0,Math.PI*2,0,Math.PI/2);b.rotateX(-Math.PI/2);b.translate(0,0,-.17);parts.push(paint(b,C.yellow));}
 // A yoke round the joint and two handles back toward the seat.
 parts.push(paint(new T.BoxGeometry(.5,.1,.16).translate(0,-.12,0),C.iron));
 for(const s of [-1,1]){parts.push(paint(new T.CylinderGeometry(.03,.03,.42,6).rotateX(Math.PI/2).translate(s*.2,.02,-.48),C.iron));
  parts.push(paint(new T.CylinderGeometry(.045,.045,.16,8).translate(s*.2,-.04,-.7),C.seat));}
 const g=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());g.computeVertexNormals();g.computeBoundingSphere();return g;
}
/** A football: white with dark pentagon patches (the triangles round the icosahedron's 12 corners). */
function ballGeometry(r:number){
 const g=new T.IcosahedronGeometry(r,2),corners=new T.IcosahedronGeometry(1,0).getAttribute('position'),dirs:T.Vector3[]=[];
 for(let i=0;i<corners.count;i++){const d=new T.Vector3().fromBufferAttribute(corners,i).normalize();if(!dirs.some(o=>o.distanceTo(d)<1e-3))dirs.push(d);}
 const p=g.getAttribute('position'),dark=new Set<number>(),v=new T.Vector3();
 for(let t=0;t<p.count/3;t++){for(let k=0;k<3;k++){v.fromBufferAttribute(p,t*3+k).normalize();if(dirs.some(d=>d.dot(v)>.999)){dark.add(t);break;}}}
 return paint(g,(_,i)=>dark.has(Math.floor(i/3))?'#2a3431':'#fff8ea');
}
function discGeometry(){const g=new T.CylinderGeometry(CANNON.discR,CANNON.discR*.84,.055,14);return paint(g,p=>p.y>.02&&Math.hypot(p.x,p.z)<.13?'#ffd9a8':p.y>.02?CANNON_COLORS.clay:'#c75a26');}
function shardGeometry(){const g=new T.TetrahedronGeometry(.11,0);g.scale(1.3,.45,1);return paint(g,CANNON_COLORS.clay);}

type Ball={alive:boolean;f:Flight;prev:Vec3;cur:Vec3;spin:number};
type Disc={alive:boolean;f:Flight;prev:Vec3;cur:Vec3;tilt:number};
type Shard={alive:boolean;p:Vec3;v:Vec3;age:number;life:number;rx:number;ry:number;spin:number};
const v3=():Vec3=>({x:0,y:0,z:0});

export function createBallCannon(scene:T.Scene,ports:Ports){
 let L:CannonLayout|null=null;const layout=()=>L??(L=cannonLayout());
 const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.8});mat.name='ball-cannon';
 // ---- The barrel (the prop's one turning piece): always there, its matrix written only when the aim changes.
 let aim:Aim=startAim();
 const barrelGeo=barrelGeometry(),barrel=new T.Mesh(barrelGeo,mat);barrel.name='ball-cannon-barrel';barrel.castShadow=false;barrel.receiveShadow=true;barrel.matrixAutoUpdate=false;
 let recoil=0;
 const placeBarrel=()=>{const J=layout().joint,d=aimDir(aim),back=recoil>0?Math.sin(Math.min(1,recoil/.16)*Math.PI)*.16:0;
  barrel.position.set(J.x-d.x*back,J.y-d.y*back,J.z-d.z*back);barrel.rotation.set(-aim.pitch,aimYaw(aim),0,'YXZ');barrel.updateMatrix();barrel.updateMatrixWorld(true);};
 let built=false;const ensureBarrel=()=>{if(built)return;built=true;placeBarrel();scene.add(barrel);};

 // ---- Flight pools (built on the first sit, gone when you leave and the last thing has landed).
 const ARC_POINTS=16;
 let pools:null|{balls:Ball[];discs:Disc[];shards:Shard[];ballMesh:T.InstancedMesh;discMesh:T.InstancedMesh;shardMesh:T.InstancedMesh;arc:T.Points;arcGeo:T.BufferGeometry;arcMat:T.PointsMaterial}=null;
 function buildPools(){if(pools)return pools;
  const mk=(g:T.BufferGeometry,n:number,name:string)=>{const m=new T.InstancedMesh(g,mat,n);m.name=name;m.count=0;m.visible=false;m.frustumCulled=false;m.castShadow=m.receiveShadow=false;m.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(m);return m;};
  const arcGeo=new T.BufferGeometry();arcGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(ARC_POINTS*3),3));
  const arcMat=new T.PointsMaterial({color:'#fff3df',size:.16,sizeAttenuation:true,transparent:true,opacity:.75,depthWrite:false});
  const arc=new T.Points(arcGeo,arcMat);arc.name='ball-cannon-aim';arc.frustumCulled=false;arc.visible=false;scene.add(arc);
  pools={balls:Array.from({length:CANNON.balls},()=>({alive:false,f:null as unknown as Flight,prev:v3(),cur:v3(),spin:0})),
   discs:Array.from({length:CANNON.discs},()=>({alive:false,f:null as unknown as Flight,prev:v3(),cur:v3(),tilt:0})),
   shards:Array.from({length:CANNON.shards},()=>({alive:false,p:v3(),v:v3(),age:0,life:1,rx:0,ry:0,spin:0})),
   ballMesh:mk(ballGeometry(CANNON.ballR),CANNON.balls,'ball-cannon-balls'),discMesh:mk(discGeometry(),CANNON.discs,'ball-cannon-discs'),shardMesh:mk(shardGeometry(),CANNON.shards,'ball-cannon-shards'),arc,arcGeo,arcMat};
  return pools;}
 function disposePools(){if(!pools)return;for(const m of [pools.ballMesh,pools.discMesh,pools.shardMesh]){m.removeFromParent();m.geometry.dispose();m.dispose();}
  pools.arc.removeFromParent();pools.arcGeo.dispose();pools.arcMat.dispose();pools=null;}

 /** The aim arc: the first ~1.2 s of the ball's path as dots (rewritten only when the aim changes). */
 function drawArc(){if(!pools)return;const f=fireBall(layout(),aim,0),a=pools.arcGeo.getAttribute('position') as T.BufferAttribute,p=v3();
  for(let i=0;i<ARC_POINTS;i++){flightAt(f,.06+i*.075,p);a.setXYZ(i,p.x,p.y,p.z);}a.needsUpdate=true;pools.arcGeo.computeBoundingSphere();}

 // ---- State
 let seated=false,near=false,clock=0,lastShot=-1,discNo=0,hits=0,shots=0;
 const pendingDiscs:number[]=[];
 let teleport:{x:number;z:number;yaw:number}|null=null,aimChanged=false;
 const flying=()=>!!pools&&(pools.balls.some(b=>b.alive)||pools.discs.some(d=>d.alive)||pools.shards.some(s=>s.alive)||pendingDiscs.length>0);
 const anchor=new T.Vector3();
 // The sitting pose (the island benches' pose: hips on a seat 0.64 m up), arms reaching forward to the barrel's handles.
 const poses=new Map<number,TrickPose>();
 const seatPose=(scale:number)=>{const k=Math.round(scale*100)/100;let p=poses.get(k);if(!p){p=npcSeatPose('bench',k);p.w=1;for(const a of p.arms){a.sx=-1.05;a.sz=.22;a.el=-.55;a.w=1;}p.torsoPitch=.08;p.headPitch=-.05;poses.set(k,p);}return p;};

 function sit(){if(seated||!near)return;const Lc=layout();seated=true;aim=startAim();aimChanged=true;hits=0;shots=0;
  teleport={x:Lc.seat.x,z:Lc.seat.z,yaw:aimYaw(aim)};buildPools();cam.blend=0;cam.restoring=false;
  cannonStore.set({seated:true,shots:0,hits:0,word:''});cue('select');countCannonSit();}
 function leave(){if(!seated)return;const Lc=layout();seated=false;teleport={x:Lc.stand.x,z:Lc.stand.z,yaw:Lc.seat.yaw};
  if(pools)pools.arc.visible=false;pendingDiscs.length=0;cam.restoring=cam.blend>0;cam.restore=0;cannonStore.set({seated:false});cue('previous');}
 function fire(){if(!seated||!pools)return;if(lastShot>=0&&clock-lastShot<CANNON.cooldown)return;lastShot=clock;
  const slot=pools.balls.find(b=>!b.alive)??pools.balls.reduce((a,b)=>a.f.t0<=b.f.t0?a:b);
  slot.f=fireBall(layout(),aim,clock,pools.discs.filter(d=>d.alive).map(d=>d.f));slot.alive=true;slot.spin=0;flightAt(slot.f,clock,slot.prev);flightAt(slot.f,clock,slot.cur);
  recoil=.32;shots++;cannonStore.set({shots:Math.min(shots,1)});ports.kick();/* the HUD only needs 0 vs 1+ (its how-to line): one re-render per sitting */}
 function launchDisc(){if(!pools)return;const slot=pools.discs.find(d=>!d.alive)??pools.discs.reduce((a,b)=>a.f.t0<=b.f.t0?a:b);
  slot.f=throwDisc(layout(),discNo++,clock);slot.alive=true;slot.tilt=(discNo%3-1)*.18;flightAt(slot.f,clock,slot.prev);flightAt(slot.f,clock,slot.cur);cue('thunk');}
 function release(count:1|2){if(!seated||!pools)return;if(pendingDiscs.length>=2)return;for(let k=0;k<count;k++)pendingDiscs.push(clock+k*CANNON.pullGap);}
 function aimBy(dx:number,dy:number){if(!seated)return;const next=aimByDrag(aim,dx,dy);if(next.yaw!==aim.yaw||next.pitch!==aim.pitch){aim=next;aimChanged=true;}}
 function shatter(d:Disc,ball:Ball,reduced:boolean){if(!pools)return;const n=reduced?CANNON.shardsReduced:CANNON.shardsPerHit,life=reduced?CANNON.shardLifeReduced:CANNON.shardLife;
  const dv={x:d.f.v.x+d.f.a.x*(clock-d.f.t0),y:d.f.v.y+d.f.a.y*(clock-d.f.t0),z:d.f.v.z+d.f.a.z*(clock-d.f.t0)};
  for(let k=0;k<n;k++){const s=pools.shards.find(x=>!x.alive)??pools.shards.reduce((a,b)=>a.age>=b.age?a:b),a=(k/n+hits*.13)*Math.PI*2;
   s.alive=true;s.age=0;s.life=life*(.8+.4*((k*37+hits)%5)/5);s.p={...d.cur};s.rx=k*1.7;s.ry=k*2.3;s.spin=6+k*2;
   s.v={x:dv.x*.35+ball.f.v.x*.08+Math.cos(a)*3.2,y:dv.y*.3+2.6+(k%3)*.9,z:dv.z*.35+ball.f.v.z*.08+Math.sin(a)*3.2};}}

 const off=installCannonActions({sit,leave,fire,release,aim:aimBy});
 const cam={blend:1,restore:0,restoring:false,start:{p:new T.Vector3(),q:new T.Quaternion()},last:{p:new T.Vector3(),q:new T.Quaternion()},normalFov:0,yaw:0,pitch:0};
 const aimer=new T.PerspectiveCamera(),eyeV=new T.Vector3(),lookV=new T.Vector3(),targetQ=new T.Quaternion();
 const M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),P=new T.Vector3(),S=new T.Vector3();

 /** Writes one instanced mesh from its live items; drawn only while it has any. */
 function write<I extends {alive:boolean}>(mesh:T.InstancedMesh,items:I[],place:(it:I)=>void){let n=0;for(const it of items){if(!it.alive)continue;place(it);M.compose(P,Q,S);mesh.setMatrixAt(n++,M);}
  mesh.count=n;mesh.visible=n>0;if(n)mesh.instanceMatrix.needsUpdate=true;}

 return {
  get seated(){return seated;},get layout(){return layout();},get aim(){return aim;},
  /** True while anything is flying (tests, and Town never needs it: the island loop runs anyway). */
  get busy(){return flying();},
  /** Seated: the stick and arrow keys aim the barrel, the player stays in the seat. True = skip the walk this tick. */
  holdPlayer(input:{x:number;z:number;kick:boolean;juggle:boolean;shotPower?:number;charging?:boolean},keys:ReadonlySet<string>,dt:number){
   if(teleport){const t=teleport;teleport=null;ports.teleport(t.x,t.z,t.yaw);}
   if(!seated)return false;
   const kx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.x,kz=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+input.z;
   if(kx||kz){const next=aimBySteer(aim,Math.max(-1,Math.min(1,kx)),Math.max(-1,Math.min(1,kz)),dt);if(next.yaw!==aim.yaw||next.pitch!==aim.pitch){aim=next;aimChanged=true;}}
   input.kick=input.juggle=false;input.shotPower=0;input.charging=false;return true;
  },
  /** The player's motion while seated: the sitting pose, facing the barrel, no ball work. Untouched otherwise. */
  pose(m:PlayerMotion,scale:number):PlayerMotion{
   if(!seated)return m;m.trick=seatPose(scale);m.facing=aimYaw(aim);m.intentHeading=undefined;m.juggle=undefined;m.dribbling=false;m.kick=undefined;m.actionKind=undefined;m.shotCharge=undefined;m.powerKick=false;m.shotStep=undefined;return m;
  },
  /** Per frame (Town's HUD block): the prompt; flights only while something is in the air. */
  update(c:CannonUpdate):{key:string;distance:number}|null{
   if(c.x>400&&!built)ensureBarrel();
   // ---- flights
   if(seated||pools){
    clock+=c.dt;
    if(recoil>0){recoil=Math.max(0,recoil-c.dt);aimChanged=true;}
    if(aimChanged){aimChanged=false;placeBarrel();drawArc();}
    if(pools){pools.arc.visible=seated;
     while(pendingDiscs.length&&pendingDiscs[0]<=clock){pendingDiscs.shift();launchDisc();}
     for(const b of pools.balls)if(b.alive){const t=b.prev;b.prev=b.cur;b.cur=t;flightAt(b.f,clock,b.cur);b.spin+=c.dt*14;}
     for(const d of pools.discs)if(d.alive){const t=d.prev;d.prev=d.cur;d.cur=t;flightAt(d.f,clock,d.cur);}
     // Knock-outs: each live ball against each live disc (≤ 8 × 6 closest-approach tests, only while both fly).
     for(const b of pools.balls){if(!b.alive)continue;for(const d of pools.discs){if(!d.alive||!discHit(b.prev,b.cur,d.prev,d.cur))continue;
      d.alive=false;hits++;shatter(d,b,c.reduced);ports.impact(d.cur.x,d.cur.y,d.cur.z);cue('pop');try{navigator.vibrate?.(15);}catch{/* no vibration */}
      cannonStore.set({hits,word:hitWord(hits-1)});countCannonHit();}}
     // Landing: into the sea (a splash) or onto the island (a puff); anything flying too long is put away.
     for(const b of pools.balls)if(b.alive&&clock-b.f.t0>.1){const s=surfaceAt(b.cur.x,b.cur.z);if(b.cur.y<=s.y+CANNON.ballR*.5||clock-b.f.t0>CANNON.maxFlight){b.alive=false;if(s.sea)ports.splash(b.cur.x,0,b.cur.z);else ports.impact(b.cur.x,s.y+.1,b.cur.z);}}
     for(const d of pools.discs)if(d.alive&&clock-d.f.t0>.1){const s=surfaceAt(d.cur.x,d.cur.z);if(d.cur.y<=s.y+.03||clock-d.f.t0>CANNON.maxFlight){d.alive=false;if(s.sea&&!c.reduced)ports.splash(d.cur.x,0,d.cur.z);}}
     for(const s of pools.shards)if(s.alive){s.age+=c.dt;if(s.age>=s.life){s.alive=false;continue;}s.v.y-=CANNON.gravity*c.dt;s.p.x+=s.v.x*c.dt;s.p.y+=s.v.y*c.dt;s.p.z+=s.v.z*c.dt;s.rx+=s.spin*c.dt;s.ry+=s.spin*.7*c.dt;}
     write(pools.ballMesh,pools.balls,b=>{P.set(b.cur.x,b.cur.y,b.cur.z);Q.setFromEuler(E.set(b.spin,b.spin*.6,0));S.set(1,1,1);});
     write(pools.discMesh,pools.discs,d=>{P.set(d.cur.x,d.cur.y,d.cur.z);Q.setFromEuler(E.set(d.tilt,(clock-d.f.t0)*(c.reduced?3:16),d.tilt*.5));S.set(1,1,1);});
     write(pools.shardMesh,pools.shards,s=>{P.set(s.p.x,s.p.y,s.p.z);Q.setFromEuler(E.set(s.rx,s.ry,0));S.setScalar(Math.max(.05,1-Math.pow(s.age/s.life,2)));});
     if(!seated&&!flying()){disposePools();clock=0;lastShot=-1;}}
   }
   // ---- the prompt (world-anchored, like the telescope's)
   const el=c.ui<HTMLButtonElement>('[data-ball-cannon-sit]');
   let want:{key:string;distance:number}|null=null;near=false;
   if(!seated&&c.onFoot&&c.canEnter&&c.x>400){const Lc=layout(),d=Math.hypot(c.x-Lc.x,c.z-Lc.z);if(d<CANNON.reach){near=true;want={key:CANNON_FOCUS_KEY,distance:d};}}
   if(el){let hidden=!(want&&c.focusKey===CANNON_FOCUS_KEY);
    if(!hidden){const Lc=layout();anchor.set(Lc.x,Lc.deck+2.1,Lc.z).project(c.camera);hidden=anchor.z< -1||anchor.z>1;
     if(!hidden)c.place(el,T.MathUtils.clamp((anchor.x+1)*c.width/2,75,c.width-75),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
    c.hide(el,hidden);}
   return want;
  },
  /** After the follow camera is placed (like the telescope's): behind the barrel while seated, and an ease back after. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   if(!seated){
    if(!cam.restoring)return;
    // The first frame back: the normal lens again; then the follow camera takes over, eased from where the seat view was.
    if(cam.restore===0){camera.fov=cam.normalFov;camera.updateProjectionMatrix();if(reduced){cam.restoring=false;return;}}
    cam.restore=Math.min(1,cam.restore+dt/.55);const e=cam.restore*cam.restore*(3-2*cam.restore);
    camera.position.lerpVectors(cam.last.p,camera.position,e);camera.quaternion.slerpQuaternions(cam.last.q,camera.quaternion,e);camera.updateMatrixWorld();
    if(cam.restore>=1)cam.restoring=false;return;}
   const Lc=layout();
   if(cam.blend===0){cam.start.p.copy(camera.position);cam.start.q.copy(camera.quaternion);cam.normalFov=camera.fov;cam.yaw=aimYaw(aim);cam.pitch=aim.pitch;}
   cam.blend=reduced?1:Math.min(1,cam.blend+dt/.65);const e=cam.blend*cam.blend*(3-2*cam.blend);
   // The view follows the aim (eased), so what you aim at stays in the middle.
   const k=reduced?1:1-Math.exp(-dt*7);cam.yaw+=(aimYaw(aim)-cam.yaw)*k;cam.pitch+=(aim.pitch-cam.pitch)*k;
   const fx=Math.sin(cam.yaw),fz=Math.cos(cam.yaw),J=Lc.joint,look=(-1+(cam.pitch*180/Math.PI-CANNON.pitchStart)*.4)*Math.PI/180;
   eyeV.set(J.x-fx*5.4,J.y+2.3,J.z-fz*5.4);lookV.set(eyeV.x+fx*Math.cos(look)*10,eyeV.y+Math.sin(look)*10,eyeV.z+fz*Math.cos(look)*10);
   aimer.position.copy(eyeV);aimer.up.set(0,1,0);aimer.lookAt(lookV);targetQ.copy(aimer.quaternion);
   camera.position.lerpVectors(cam.start.p,eyeV,e);camera.quaternion.slerpQuaternions(cam.start.q,targetQ,e);
   // Portrait phones see a narrow slice sideways: open the lens a little while seated (restored on the way out).
   const fov=cam.normalFov+((camera.aspect<.8?58:50)-cam.normalFov)*e;if(Math.abs(camera.fov-fov)>1e-3){camera.fov=fov;camera.updateProjectionMatrix();}
   camera.updateMatrixWorld();cam.last.p.copy(camera.position);cam.last.q.copy(camera.quaternion);
  },
  dispose(){off();disposePools();barrel.removeFromParent();barrelGeo.dispose();mat.dispose();seated=false;teleport=null;pendingDiscs.length=0;},
 };
}
export type BallCannon=ReturnType<typeof createBallCannon>;
