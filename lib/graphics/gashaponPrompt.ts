/**
 * The island's gashapon prompt (round 2, Nov 8 2026): the world-anchored "Gashapon" button over the nearest of the 12 island
 * machines when you stand at its glass, placed like the Ball Cannon's / easel's prompt and arbitrated by the HUD stack
 * (lib/ui/hudStack.ts, kind 'enter', key GASHAPON_FOCUS_KEY). Tapping it zooms onto the machine (its controls: components/GashaponMachineFace.tsx).
 *
 * Round 4 (owner, Nov 9 2026):
 *  - Desktop hover: one shared green glow (lib/graphics/buildingGlow.ts 'vending', the vending machines' recipe) moved to the
 *    hovered machine; `hover(ray)` = 12 ray/box tests, only while the pointer is over the canvas. A hovered machine wants the
 *    slot as explicit intent (distance -1), so its button shows from anywhere and beats the Konbini behind it.
 *  - Opening zooms the camera onto the machine's glass first (like the vending machines, `focus`/`release`/`applyCamera`), then
 *    the panel opens on arrival; closing the panel zooms back out. Reduced motion: the camera cuts there and back (no travel).
 *
 * Round 5 (owner, Nov 9 2026: "not a modal. like the vending machine"; "the machine needs to interact"): the machine IS the
 * interface. When a zoom starts, the machine's static copy is folded out of the town batches (`statics.hide`, world.ts
 * gashaponStatic) and its animated live copy (lib/graphics/gashaponLive.ts) stands in; while the camera is on it, the front's
 * anchor points are projected for the HTML controls (lib/gashapon/gashaponFace.ts → components/GashaponMachineFace.tsx), only
 * when the camera or the machine moved. Backing out disposes the live copy and folds the static one back.
 *
 * Heat: no rAF or timers; a keydown listener lives only while a zoom is under way (Escape backs out). Town's HUD block calls
 * update(). Idle cost: 12 squared-distance checks per frame (no sqrt unless one is in reach) and, only while one is in reach and
 * the stack gave us the slot, one projection for the button. The glow adds no light and draws only while shown.
 */
import * as T from 'three';
import {islandGashaponMachines,GASHA_SIZE,type GashaponMachine} from '../gashapon/machines';
import {GASHA_MESH,GASHA_CABINET_XZ,gashaFace,gashaStyleDims} from './gashaponMesh';
import {createBuildingGlow} from './buildingGlow';
import {createGashaponLive} from './gashaponLive';
import {gashaponFace,gashaponFx,type FaceAnchors,type FacePoint} from '../gashapon/gashaponFace';

export const GASHAPON_FOCUS_KEY='gashapon';
/** Metres from the walk-up spot (0.9 m in front of the glass) that count as "at the machine". */
export const GASHAPON_REACH=1.6;
/** The classic machine's hover / glow box (as built, the 1.2× scale included): cabinet width, the globe's depth, up past the topper. Each
 * style has its own (gashaStyleDims: body width and depth, up past its top; the one glow is scaled to it). */
export const GASHA_HOVER_BOX={w:+(GASHA_SIZE.w*GASHA_CABINET_XZ).toFixed(3),d:+(GASHA_MESH.globeR*2).toFixed(3),h:+(GASHA_MESH.capTop+.3).toFixed(3)} as const;
export type GashaponPromptUpdate={x:number;z:number;groundY:number;onFoot:boolean;canEnter:boolean;
 /** The HUD arbiter's current 'enter' key: the prompt shows only when it is ours. */
 focusKey:string|null;
 /** A gashapon panel is open (the prompt hides). */
 panelOpen:boolean;
 camera:T.Camera;width:number;height:number;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
 /** Frame step and reduced motion, for the hover glow (optional: tests). */
 dt?:number;reduced?:boolean};

/** ms a machine stays hovered after the pointer leaves its box (on the way up to its button). */
export const HOVER_GRACE=600;
const ease=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;// the vending zoom's curve

/** The town's static copies (world.ts gashaponStatic): fold one machine out of / back into the batches. */
export type GashaponStatics={hide(id:string):void;show(id:string):void};
export function createGashaponPrompt(scene?:T.Object3D,statics?:GashaponStatics){
 const B=GASHA_HOVER_BOX;
 const spots=islandGashaponMachines().map(m=>{const D=gashaStyleDims(m),bw=D.w,bd=Math.max(D.d,B.d*Math.min(1,D.w/B.w)),bh=D.top+.05,c=Math.abs(Math.cos(m.yaw)),s=Math.abs(Math.sin(m.yaw)),hx=(c*bw+s*bd)/2,hz=(s*bw+c*bd)/2;
  return {m,fx:m.x+Math.sin(m.yaw)*.9,fz:m.z+Math.cos(m.yaw)*.9,scale:new T.Vector3(bw/B.w,bh/B.h,bd/B.d),box:new T.Box3(new T.Vector3(m.x-hx,m.y,m.z-hz),new T.Vector3(m.x+hx,m.y+bh,m.z+hz))};});
 const anchor=new T.Vector3(),hit=new T.Vector3(),R2=GASHAPON_REACH*GASHAPON_REACH;let near:GashaponMachine|null=null,shown:string|null=null;
 let hovered:GashaponMachine|null=null,hoverDistance=Infinity,hoverUntil=0,glowAt:string|null=null;
 const glowRoot=scene?new T.Group():null,glow=glowRoot?createBuildingGlow(glowRoot,B.w,B.d,B.h,'vending'):null;
 if(glowRoot){glowRoot.name='gashapon-selection';scene!.add(glowRoot);}
 const pick=(ray:T.Raycaster)=>{let best:GashaponMachine|null=null,bestD=Infinity;
  for(const s of spots)if(ray.ray.intersectBox(s.box,hit)){const d=hit.distanceTo(ray.ray.origin);if(d<bestD){bestD=d;best=s.m;}}
  return {machine:best,distance:bestD};};
 // ---- Camera zoom onto the glass (the vending machines' shape: t 0→1 eased, then the panel; dir −1 backs out). ----
 let zoom:{m:GashaponMachine;t:number;dir:1|-1;onArrive?:()=>void;onDone?:()=>void}|null=null,arrived=false,lastReduced=false;
 const zoomPos=new T.Vector3(),zoomLook=new T.Vector3(),followLook=new T.Vector3(),mixLook=new T.Vector3(),forward=new T.Vector3();
 let escape:((e:KeyboardEvent)=>void)|null=null;
 // ---- The live machine + its face anchors (round 5) ----
 const live=scene?createGashaponLive(scene):null,islandIndex=new Map(islandGashaponMachines().map((m,i)=>[m.id,i]));
 const liveOn=(m:GashaponMachine)=>{if(!live||live.open===m.id)return;if(live.open)liveOff();live.show(m,islandIndex.get(m.id)??0);statics?.hide(m.id);};
 const liveOff=()=>{if(!live?.open)return;statics?.show(live.open);live.hide();gashaponFace.emit(null);lastKey='';};
 if(live)gashaponFx.set({
  spin:(id,arrived)=>{if(live.open!==id)return false;live.spin(arrived);return true;},
  drop:id=>{if(live.open!==id)return false;live.drop();return true;},
  cancel:id=>{if(live.open===id)live.cancel();},
  crack:id=>{if(live.open!==id||live.phase!=='tray')return false;live.crack();return true;},
  turn:(id,angle)=>{if(live.open!==id||live.phase!=='idle')return false;live.hold(angle);return true;},
  release:(id,reduced)=>{if(live.open===id)live.letGo(reduced);},
 });
 const local=new T.Vector3(),pt=(m:GashaponMachine,camera:T.Camera,x:number,y:number,z:number):FacePoint=>{const c=Math.cos(m.yaw),sn=Math.sin(m.yaw);
  local.set(m.x+x*c+z*sn,m.y+y,m.z-x*sn+z*c).project(camera);return {x:+local.x.toFixed(4),y:+local.y.toFixed(4)};};
 let lastKey='',lastAspect=0;const lastPos=new T.Vector3(),lastQuat=new T.Quaternion();
 const emitFace=(m:GashaponMachine,camera:T.PerspectiveCamera)=>{
  if(lastKey&&lastAspect===camera.aspect&&lastPos.equals(camera.position)&&lastQuat.equals(camera.quaternion))return;// nothing moved: no projection
  lastAspect=camera.aspect;lastPos.copy(camera.position);lastQuat.copy(camera.quaternion);camera.updateMatrixWorld();const F=gashaFace(m);
  const a:FaceAnchors={id:m.id,knob:pt(m,camera,F.knob.x,F.knob.y,F.knob.z),knobEdge:pt(m,camera,F.knob.x+F.knob.r,F.knob.y+F.knob.r,F.knob.z),coin:pt(m,camera,F.coin.x,F.coin.y,F.coin.z),
   tray:pt(m,camera,F.tray.x,F.tray.y-F.tray.h*.18,F.tray.z+F.capsuleR*.4),trayEdge:pt(m,camera,F.tray.x+F.capsuleR*1.7,F.tray.y-F.tray.h*.18+F.capsuleR*1.5,F.tray.z+F.capsuleR*.4),/* the ring rides the resting capsule (gashaponLive's tray point), not the tray box */crown:pt(m,camera,0,F.top+.04,0),
   right:pt(m,camera,F.halfW,F.cabinetTop*.6,F.front),base:pt(m,camera,0,0,F.front)};
  const key=JSON.stringify(a);if(key===lastKey)return;lastKey=key;gashaponFace.emit(a);};
 const unlisten=()=>{if(escape&&typeof window!=='undefined')window.removeEventListener('keydown',escape,true);escape=null;};
 const release=(onDone?:()=>void)=>{unlisten();if(!zoom){liveOff();onDone?.();return;}zoom.dir=-1;zoom.onArrive=undefined;zoom.onDone=onDone;arrived=false;};
  /**
  * A light three-quarter view of the whole machine, which is the interface (round 5): on a landscape screen it stands a little
  * left of centre with room on its right for the toy card and under it for the status chips; on a portrait phone its front
  * fills the upper part of the screen, the chips and the card below it.
  */
 const pose=(m:GashaponMachine,camera:T.PerspectiveCamera)=>{
  const W=typeof window==='undefined'?1280:window.innerWidth,tanV=Math.tan(T.MathUtils.degToRad(camera.fov)/2),aspect=camera.aspect||1;
  // Portrait phones: the width decides (0.7 m each side of the machine, so the cabinet is ~60% of the screen wide), the machine a
  // little right of centre (the knob's label sits left of the knob) and its front in the upper part (the toy card docks below).
  // Nov 10 2026: each body style frames to its own height and width (gashaStyleDims), the look point following its middle.
  const D=gashaStyleDims(m),tall=D.top/2,wide=Math.max(1,D.w/.86*.8),look=1.02+(D.top-2)*.5;
  let fit=.86,ndcX=0,ndcY=-.02,half=.95*wide,lift=.2;
  if(aspect<.85){fit=1.55;ndcX=.12;ndcY=.24;half=.57*wide;lift=.26;}else if(W>=760){ndcX=-.2;ndcY=.1;}
  const dist=Math.max(2.1*tall/(fit*2*tanV),half/(tanV*aspect));
  const a=-.3,fx=Math.sin(m.yaw),fz=Math.cos(m.yaw),sx=Math.cos(m.yaw),sz=-Math.sin(m.yaw),dx=fx*Math.cos(a)+sx*Math.sin(a),dz=fz*Math.cos(a)+sz*Math.sin(a);
  // Sideways: pan camera and target together (+right moves the machine left on screen). Upwards (phones): the camera stays high
  // (over the planters in front of a Konbini) and only the target drops, tilting the machine into the top of the screen.
  const side=-ndcX*tanV*aspect*dist,drop=ndcY*tanV*dist,rx=dz,rz=-dx;
  zoomLook.set(m.x+rx*side,m.y+look-drop,m.z+rz*side);zoomPos.set(m.x+dx*dist+rx*side,m.y+look+dist*lift,m.z+dz*dist+rz*side);};
 return {
  get near(){return near;},
  /** The machine under the pointer at the last hover() (desktop), or null. */
  get hovered(){return hovered;},
  /** Metres along the pointer ray to the hovered machine's box (Infinity when none). */
  get hoverDistance(){return hoverDistance;},
  /**
   * Ray/box test against the 12 island machines; null clears the hover. A machine stays hovered for HOVER_GRACE ms after the
   * pointer leaves its box, so the pointer can travel up to its button without the Konbini behind taking over. Returns it.
   */
  hover(ray:T.Raycaster|null,now=0){const p=ray?pick(ray):null;
   if(p?.machine){hovered=p.machine;hoverDistance=p.distance;hoverUntil=now+HOVER_GRACE;}
   else if(!ray||now>=hoverUntil){hovered=null;hoverDistance=Infinity;}
   return hovered;},
  /** The pointer sits on the Gashapon button: keep its machine hovered (the canvas gets no pointer moves meanwhile). */
  holdHover(id:string|undefined,now=0){const s=id?spots.find(x=>x.m.id===id):undefined;if(s){hovered=s.m;hoverUntil=now+HOVER_GRACE;}return hovered;},
  /** The machine a tap/click ray hits (nearest box), or null. */
  pick(ray:T.Raycaster){return pick(ray).machine;},
  /** The camera is moving (in or out): the island holds still, like a vending zoom. */
  get zooming(){return zoom!==null&&(zoom.dir===-1||zoom.t<1);},
  /** A zoom is in progress or held at the machine. */
  get focused(){return zoom?.m.id??null;},
  /** The close-up would look through the player: hide them (and their ride) once the zoom is under way. */
  get hidesPlayer(){return zoom!==null&&zoom.t>.5;},
  /**
   * Zoom onto `id`'s glass, then run `onArrive` (open the panel). Reduced motion: no zoom, `onArrive` at once. Escape during the
   * zoom-in backs out without opening anything. A second call for the same machine while zooming is ignored (no double open).
   */
  focus(id:string,onArrive:()=>void,reduced=lastReduced){
   const s=spots.find(x=>x.m.id===id);if(!s){onArrive();return;}lastReduced=reduced;
   if(zoom&&zoom.m.id===id&&zoom.dir===1)return;
   zoom={m:s.m,t:zoom?.m.id===id?zoom.t:0,dir:1,onArrive};arrived=false;liveOn(s.m);
   if(typeof window!=='undefined'&&!escape){escape=e=>{if(e.key==='Escape'&&zoom&&zoom.dir===1&&!arrived){e.preventDefault();e.stopPropagation();release();}};window.addEventListener('keydown',escape,true);}
  },
  release,
  /** Drop the zoom at once (the island tore down, the player was teleported). */
  cancel(){unlisten();zoom=null;arrived=false;liveOff();},
  /** The live (animated) copy of the open machine, for checks. */
  get live(){return live;},
  /** Call right after the follow camera is placed (beside the vending one); returns true while it owns the camera. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   lastReduced=reduced;if(!zoom)return false;
   zoom.t=reduced?(zoom.dir>0?1:0):T.MathUtils.clamp(zoom.t+zoom.dir*Math.min(dt,.05)/(zoom.dir>0?1:.8),0,1);
   const k=ease(zoom.t);pose(zoom.m,camera);
   camera.getWorldDirection(forward);followLook.copy(camera.position).addScaledVector(forward,40);
   camera.position.lerp(zoomPos,k);mixLook.lerpVectors(followLook,zoomLook,k);camera.lookAt(mixLook);
   live?.update(dt,reduced);
   if(zoom.dir>0)emitFace(zoom.m,camera);else if(lastKey){lastKey='';gashaponFace.emit(null);}
   if(zoom.dir>0&&zoom.t>=1&&zoom.onArrive){const fn=zoom.onArrive;zoom.onArrive=undefined;arrived=true;unlisten();fn();}
   if(zoom.dir<0&&zoom.t<=0){const fn=zoom.onDone;zoom=null;liveOff();fn?.();}
   return true;
  },
  update(c:GashaponPromptUpdate):{key:string;distance:number}|null{
   // The panel closed while zoomed in: back out (Close, Escape, the scrim).
   if(zoom&&arrived&&!c.panelOpen)release();
   near=null;let best=R2;const live=c.canEnter&&!c.panelOpen&&!zoom;
   const over=live&&hovered&&Math.abs(c.groundY-hovered.y)<40?hovered:null;
   if(over)near=over;
   else if(live&&c.onFoot)for(const s of spots){const dx=c.x-s.fx,dz=c.z-s.fz,d2=dx*dx+dz*dz;if(d2<best&&Math.abs(c.groundY-s.m.y)<1.2){best=d2;near=s.m;}}
   // The glow: the hovered machine (desktop), held while the pointer sits on its button.
   if(glow&&glowRoot){const target=over;
    if(target&&target.id!==glowAt){glowAt=target.id;glowRoot.position.set(target.x,target.y,target.z);glowRoot.rotation.y=target.yaw;const sc=spots.find(x=>x.m.id===target.id)?.scale;if(sc)glowRoot.scale.copy(sc);glowRoot.updateMatrixWorld(true);}
    glow.update(Boolean(target),c.dt??1/60,c.reduced??false);}
   const want=near?{key:GASHAPON_FOCUS_KEY,distance:over?-1:Math.sqrt(best)}:null;
   const el=c.ui<HTMLButtonElement>('[data-gashapon-go]');
   if(el){let hidden=!(near&&c.focusKey===GASHAPON_FOCUS_KEY);
    if(!hidden&&near){anchor.set(near.x,near.y+gashaStyleDims(near).top+.27,near.z).project(c.camera);hidden=anchor.z< -1||anchor.z>1;
     if(!hidden){c.place(el,T.MathUtils.clamp((anchor.x+1)*c.width/2,75,c.width-75),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));
      if(shown!==near.id){shown=near.id;el.dataset.gashaponGo=near.id;el.setAttribute('aria-label',`Open the ${near.name} capsule machine`);}}}
    c.hide(el,hidden);}
   return want;
  },
  dispose(){unlisten();liveOff();live?.dispose();if(live)gashaponFx.set(null);glow?.dispose();glowRoot?.removeFromParent();},
 };
}
export type GashaponPrompt=ReturnType<typeof createGashaponPrompt>;
