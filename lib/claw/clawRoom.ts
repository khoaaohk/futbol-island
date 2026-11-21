/**
 * The Claw Club in the arcade room (Nov 21 2026): walk up, "Play claw", the camera zooms onto the machine front (the vending /
 * Konbini zoom feel: lib/konbini/konbiniZoom.ts easeZoom, ~1 s in, 0.8 s out) while the room holds still, then the try plays out
 * with the physics in lib/claw/clawPhysics.ts. Owns: the perspective zoom camera, the detailed machine (built on the first zoom,
 * lib/claw/clawMachine3d.ts), the sim stepping, sounds, haptics, the win shake, and a tiny snapshot store the HUD reads
 * (components/ClawMachineHud.tsx). Coins and prizes are the HUD's job (lib/claw/clawStore.ts).
 *
 * Heat: nothing runs in the room view (the room's cheap LOD has no per-frame work beyond the old idle carriage). While zoomed the
 * sim steps only while something moves (`sim.sleeping` → no steps, no mesh updates); the room scene renders at its active cadence.
 */
import * as T from 'three';
import {easeZoom,ZOOM_IN_SECONDS,ZOOM_OUT_SECONDS} from '../konbini/konbiniZoom';
import {createClawSim,hashSeed,ClawEvent,CLAW_AIM_SECONDS,type ClawPhase,type ClawSim} from './clawPhysics';
import {clawPile,clawPrize,clawToyBody,nextRefill} from './clawPrizes';
import {buildClawDetail,CLAW_SIZE,type ClawDetail} from './clawMachine3d';
import {createClawSound} from './clawSound';
import {localPlayDay} from '../town/dailyPlay';

export type ClawMode='room'|'in'|'zoom'|'out';
export type ClawSnapshot={near:boolean;mode:ClawMode;phase:ClawPhase;time:number;ready:boolean;failed:boolean;result:{slot:number;toy:string|null}|null;tries:number};
const vibrate=(p:number|number[])=>{try{navigator.vibrate?.(p);}catch{/* not allowed */}};

export function createClawRoom(opts:{scene:T.Scene;renderer:T.WebGLRenderer;placement:T.Object3D;lod:T.Object3D;mobile:boolean;reduced:boolean}){
 const {renderer,placement,lod,reduced}=opts;
 const camera=new T.PerspectiveCamera(40,1,.05,220);
 let snap:ClawSnapshot={near:false,mode:'room',phase:'home',time:CLAW_AIM_SECONDS,ready:false,failed:false,result:null,tries:0};
 const listeners=new Set<()=>void>();
 function set(p:Partial<ClawSnapshot>){let changed=false;for(const k of Object.keys(p) as (keyof ClawSnapshot)[])if(snap[k]!==p[k]){changed=true;break;}if(!changed)return;snap={...snap,...p};listeners.forEach(f=>f());}
 // ---- machine + sim (lazy) ----
 let sim:ClawSim|null=null,detail:ClawDetail|null=null,pile:string[]=[],refill:string[]=[],lastPhase:ClawPhase='home',pendingSlot=-1;
 const sound=createClawSound();
 function ensure(){
  if(detail)return true;
  try{const seed=hashSeed(`claw|${localPlayDay(Date.now())}`),p=clawPile(seed);pile=p.pile;refill=p.refill;
   sim=createClawSim(seed,pile.map(id=>clawToyBody(clawPrize(id)!)));detail=buildClawDetail(renderer,pile,sim);placement.add(detail.group);detail.group.visible=false;return true;}
  catch(err){console.warn('claw machine failed to build',err);sim=null;detail=null;set({failed:true});return false;}
 }
 // ---- camera poses ----
 const start={pos:new T.Vector3(),look:new T.Vector3(),fov:12},end={pos:new T.Vector3(),look:new T.Vector3(),fov:40},look=new T.Vector3(),dir=new T.Vector3(),tmp=new T.Vector3();
 let blend=0,aspect=1,shake=0;
 function endPose(){
  const portrait=aspect<1,fov=portrait?44:36,t=Math.tan(T.MathUtils.degToRad(fov/2));
  const hw=1.22,hh=portrait?1.95:1.62,dist=Math.max(hh/t,hw/(t*aspect)),cy=portrait?1.55:1.95;
  end.fov=fov;end.look.set(0,cy,0);placement.localToWorld(end.look);
  end.pos.set(0,cy+dist*.16,CLAW_SIZE.front+dist);placement.localToWorld(end.pos);
 }
 function startPose(ortho:T.OrthographicCamera){
  ortho.getWorldDirection(dir);const halfH=(ortho.top-ortho.bottom)/2/ortho.zoom,o=ortho.position;
  const toFloor=o.y/Math.max(.05,-dir.y);start.look.copy(o).addScaledVector(dir,toFloor);
  start.fov=12;const D=halfH/Math.tan(T.MathUtils.degToRad(start.fov/2));start.pos.copy(start.look).addScaledVector(dir,-D);
 }
 function applyCamera(k:number,time:number){
  camera.fov=start.fov+(end.fov-start.fov)*k;camera.aspect=aspect;camera.updateProjectionMatrix();
  camera.position.lerpVectors(start.pos,end.pos,k);look.lerpVectors(start.look,end.look,k);
  if(shake>0&&!reduced){const a=.03*shake;camera.position.x+=Math.sin(time*71)*a;camera.position.y+=Math.sin(time*53+1)*a;}
  camera.lookAt(look);camera.updateMatrixWorld();
 }
 // ---- input ----
 const input={x:0,z:0,pressed:0};let stickX=0,stickZ=0,keyX=0,keyZ=0,dropQueued=0;const keys=new Set<string>();
 function readKeys(){keyX=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));keyZ=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));}
 let time=0,lastSecond=-1,fresh=true;
 function handleEvents(){
  if(!sim)return;const ev=sim.events;
  for(let i=0;i<ev.count;i++){const c=ev.code[i],v=ev.value[i];
   switch(c){
    case ClawEvent.MotorOn:sound.click(.5);break;case ClawEvent.MotorOff:sound.click(.35);break;
    case ClawEvent.Bump:sound.bump(v);vibrate(8);break;
    case ClawEvent.Drop:sound.click(.8);break;
    case ClawEvent.Clack:sound.clack(v);vibrate(10);break;
    case ClawEvent.Grab:vibrate(14);break;
    case ClawEvent.Top:sound.bump(.4);break;
    case ClawEvent.Release:sound.clack(.6);break;
    case ClawEvent.Land:sound.thump(v);break;
    case ClawEvent.Chute:sound.clunk(Math.max(.5,v));break;
    case ClawEvent.Flap:sound.flap(v);break;
    case ClawEvent.Slip:if(v>=1)sound.miss();break;
    case ClawEvent.Deliver:sound.clunk(1);sound.win();shake=1;vibrate([30,50,80]);detail?.celebrate(3.5);break;
   }}
  ev.clear();
 }
 function stepMachine(dt:number){
  if(!sim||!detail)return;
  const ix=Math.max(-1,Math.min(1,stickX+keyX)),iz=Math.max(-1,Math.min(1,stickZ+keyZ)),drop=dropQueued>0;
  dropQueued=Math.max(0,dropQueued-dt);input.pressed=Math.max(0,input.pressed-dt*5);
  const aiming=sim.state.phase==='aim';input.x=aiming?ix:0;input.z=aiming?iz:0;
  if(!sim.sleeping||aiming||drop||fresh){sim.advance(dt,ix,iz,drop);fresh=false;}
  handleEvents();
  const s=sim.state;sound.levels(Math.hypot(s.vx,s.vz)/.5,s.phase==='drop'||s.phase==='lift'?Math.min(1,Math.abs(s.Lv)/.45):0);
  detail.update(dt,input);
  const sec=Math.ceil(s.aimLeft);
  if(s.phase==='aim'){detail.display(`TIME ${String(sec).padStart(2,'0')}`);}else if(s.phase==='done'&&s.result>=0)detail.display('WINNER!');else if(s.phase==='home'||s.phase==='done')detail.display('INSERT 10');else detail.display('GOOD LUCK');
  if(s.phase!==lastPhase){
   if(s.phase==='done'&&lastPhase!=='aim'){const slot=s.result;set({result:{slot,toy:slot>=0?pile[slot]:null}});pendingSlot=slot;if(slot<0)sound.miss();}
   lastPhase=s.phase;
  }
  if(sec!==lastSecond||snap.phase!==s.phase){lastSecond=sec;set({phase:s.phase,time:sec});}
 }

 return {
  camera,
  get active(){return snap.mode!=='room';},
  get snapshot(){return snap;},
  subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
  getSnapshot:()=>snap,
  /** Walk-up spot in front of the coin door (room coordinates) and the prompt's anchor above the marquee. */
  near(x:number,z:number){tmp.set(0,0,CLAW_SIZE.front+.95);placement.localToWorld(tmp);return Math.hypot(x-tmp.x,z-tmp.z)<1.45;},
  setNear(v:boolean){set({near:v});},
  /** The HUD places its "Play claw" button here (screen px, like the gashapon prompt); the room calls it each frame while near. */
  promptSink:null as ((x:number,y:number,visible:boolean)=>void)|null,
  promptAnchor(out:T.Vector3){out.set(0,CLAW_SIZE.top+.25,.6);return placement.localToWorld(out);},
  resize(w:number,h:number){aspect=w/Math.max(1,h);if(snap.mode!=='room')endPose();},
  /** Zoom in (from the room camera's current view). False when the machine could not be built. */
  open(ortho:T.OrthographicCamera){if(snap.mode==='zoom'||snap.mode==='in')return true;if(!ensure())return false;sound.unlock();
   startPose(ortho);endPose();detail!.group.visible=true;lod.visible=false;blend=snap.mode==='out'?blend:0;fresh=true;set({mode:reduced?'zoom':'in',ready:false,result:null});if(reduced)blend=1;return true;},
  close(){if(snap.mode==='room'||snap.mode==='out')return;set({mode:reduced?'room':'out',ready:false});if(reduced)finishClose();},
  /** Pay → begin: the claw is live, the timer runs. `firm`: the pity rule. */
  begin(playId:string,firm:boolean){if(!sim||!detail)return false;
   if(pendingSlot>=0){const won=pile[pendingSlot],next=nextRefill(pile,refill,won);pile[pendingSlot]=next;sim.replace(pendingSlot,clawToyBody(clawPrize(next)!));detail.setToy(pendingSlot,next);}
   pendingSlot=-1;const ok=sim.begin({firm,jitterSeed:hashSeed(playId)});if(!ok)return false;lastPhase='aim';sound.unlock();sound.coin();set({phase:'aim',result:null,tries:snap.tries+1,time:CLAW_AIM_SECONDS});return true;},
  /** Before the drop: stop the try (the HUD refunds it). After the drop: play it out at once and report the result. */
  abort(){return !!sim?.abort();},
  fastForward(){if(!sim)return;sim.finish();handleEvents();stepMachine(0);},
  setStick(x:number,y:number){stickX=x;stickZ=y;},
  drop(){if(!sim||sim.state.phase!=='aim')return;dropQueued=.15;input.pressed=1;sound.unlock();},
  /** Room key handler forwards here while zoomed. Returns true when it used the key. */
  key(e:KeyboardEvent){const code=e.code,down=e.type==='keydown';
   if(/^(Key[WASD]|Arrow(Up|Down|Left|Right))$/.test(code)){if(down)keys.add(code);else keys.delete(code);readKeys();return true;}
   if((code==='Space'||code==='Enter'||code==='NumpadEnter')&&!(e.target instanceof HTMLButtonElement)){if(down&&!e.repeat)this.drop();return true;}
   return false;},
  clearInput(){keys.clear();readKeys();stickX=stickZ=0;},
  setMuted:(v:boolean)=>sound.setMuted(v),
  /** Per room frame while active. Returns false once the zoom-out has finished (the room takes over again). */
  update(dt:number){
   time+=dt;shake=Math.max(0,shake-dt/.45);
   if(snap.mode==='in'){blend=Math.min(1,blend+dt/ZOOM_IN_SECONDS);if(blend>=1)set({mode:'zoom',ready:true});}
   else if(snap.mode==='out'){blend=Math.max(0,blend-dt/ZOOM_OUT_SECONDS);if(blend<=0){finishClose();return false;}}
   else if(snap.mode==='zoom'&&!snap.ready)set({ready:true});
   stepMachine(dt);applyCamera(easeZoom(blend),time);return true;},
  /** True while the zoomed view has something moving (the room loop keeps its active cadence). */
  get busy(){return snap.mode==='in'||snap.mode==='out'||shake>0||!!sim&&(!sim.sleeping||sim.state.phase==='aim')||!!input.pressed;},
  /** Check hook: the zoomed machine's draws / triangles (null before the first zoom). */
  stats:()=>detail?.stats()??null,
  debug:()=>sim?{phase:sim.state.phase,held:sim.state.held,quality:sim.state.quality,carriage:[sim.state.cx,sim.state.cz],hub:[sim.state.hx,sim.state.hy,sim.state.hz],result:sim.state.result,sleeping:sim.sleeping,pile:[...pile]}:null,
  dispose(){sound.dispose();detail?.dispose();detail=null;sim=null;listeners.clear();},
 };
 function finishClose(){blend=0;if(detail)detail.group.visible=false;lod.visible=true;sound.levels(0,0);sound.suspend();set({mode:'room',ready:false});}
}
export type ClawRoom=ReturnType<typeof createClawRoom>;
