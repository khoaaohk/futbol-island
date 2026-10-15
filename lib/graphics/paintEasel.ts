/**
 * Summit Isle painting easel runtime (Oct 14 2026). Rules and placement: lib/town/paintEasel.ts; the static prop:
 * lib/town/paintEaselWorld.ts; the UI: components/PaintEasel.tsx (they talk through lib/town/paintEaselStore.ts).
 *
 * "Paint the view" (a world-anchored prompt through the HUD arbiter, like the telescope) seats the player: the camera eases to a calm
 * framing behind the canvas, out over the sea to the main island, and holds still. The view stays the star: the painting card covers
 * only the bottom of a phone (or the right of a desktop) and the projection centre shifts so the view sits in the open part.
 * "Just look" hides everything and the view breathes with a slow drift (none with reduced motion).
 *
 * Heat:
 *  - idle (not seated): update() costs one x-compare off Summit Isle, two distances on it; applyCamera() one boolean. No rAF, no timers.
 *  - seated: Town's focus mode holds the background still (traffic, matches, townsfolk; no chunks hidden, the view is far), the
 *    island renders at the 20 fps idle cap (frameMs), and with nothing left moving (reduced motion or the static-ambience heat
 *    tiers, while painting) the loop sleeps outright (still); every UI command wakes it for one frame.
 *  - one extra render on arrival: the view snapshot (copied from the drawing buffer right after the render, ≤ 360 px) that the
 *    eyedropper and "trace" read. Never again unless the layout changes.
 *  - the board's painting: one 256×192 CanvasTexture quad, created only once a painting exists, updated only when one is saved.
 */
import * as T from 'three';
import {easelSpot,easelPoint,canvasPose,easelCamera,easelFov,easelDrift,EASEL_CAMERA,EASEL_LAYOUT,EASEL_REACH,readPaintings,type EaselSpot} from '../town/paintEasel';
import {easelStore,installEaselActions,type EaselLayout} from '../town/paintEaselStore';
import {IDLE_RIDE_FRAME_MS} from '../town/idleRide';
import {countEaselOpen} from '../analytics/summitEvents';

type Ports={
 /** Wake Town's render loop (it may be asleep while the seated view is still). */
 wake:()=>void;
 /** The player's root (hidden while seated: the camera stands where the painter's head is). */
 player:()=>T.Object3D|null;
};
export type EaselUpdate={
 x:number;z:number;
 /** Walking or on a ground ride (not flying, falling or on a truck). */
 onGround:boolean;canEnter:boolean;
 camera:T.Camera;width:number;height:number;
 /** The HUD arbiter's current 'enter' key (lib/ui/hudStack.ts), so exactly one prompt shows. */
 focusKey:string|null;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
};
const cue=(detail:string)=>{if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail}));};
const smooth=(t:number)=>{const c=Math.max(0,Math.min(1,t));return c*c*(3-2*c);};
const BOARD_W=256,BOARD_H=192;

export function createPaintEasel(scene:T.Scene,renderer:T.WebGLRenderer|null,ports:Ports){
 let spot:EaselSpot|null=null;const ensure=()=>spot??(spot=easelSpot());
 const anchor=new T.Vector3();
 // ---- seated state
 let driftOn=true,seated=false,mode:'paint'|'look'='paint',blend=0,leaving=0,arrived=false,clock=0,revision=0,captureKey='',captureRev=0;
 const target:EaselLayout={bottom:0,right:0},cur:EaselLayout={bottom:0,right:0};
 const start={p:new T.Vector3(),q:new T.Quaternion(),fov:40},normal={fov:40,far:500},seat={p:new T.Vector3(),q:new T.Quaternion(),fov:40};
 const aimer=new T.PerspectiveCamera(),eyeV=new T.Vector3(),lookV=new T.Vector3(),targetQ=new T.Quaternion();
 let captureCanvas:HTMLCanvasElement|null=null;
 /** The card's room has eased to where the UI wants it (none in "Just look"). */
 const settled=()=>{const b=mode==='look'?0:target.bottom,r=mode==='look'?0:target.right;return cur.bottom===b&&cur.right===r;};

 // ---- the painting on the board (lazy: only once a painting exists, read when the player first comes to Summit Isle)
 let board:T.Mesh|null=null,boardTex:T.CanvasTexture|null=null,boardCanvas:HTMLCanvasElement|null=null,boardLoaded=false,boardImg='';
 function showOnBoard(img:string){
  if(!img||img===boardImg||typeof document==='undefined'||typeof Image==='undefined')return;boardImg=img;
  const pic=new Image();pic.decoding='async';
  pic.onload=()=>{if(disposed||boardImg!==img)return;
   if(!boardCanvas){boardCanvas=document.createElement('canvas');boardCanvas.width=BOARD_W;boardCanvas.height=BOARD_H;}
   const g=boardCanvas.getContext('2d');if(!g)return;g.drawImage(pic,0,0,BOARD_W,BOARD_H);
   if(!boardTex){boardTex=new T.CanvasTexture(boardCanvas);boardTex.colorSpace=T.SRGBColorSpace;boardTex.generateMipmaps=false;boardTex.minFilter=T.LinearFilter;}else boardTex.needsUpdate=true;
   if(!board){const s=ensure(),C=canvasPose(s),geo=new T.PlaneGeometry(C.w-.05,C.h-.05),mat=new T.MeshLambertMaterial({map:boardTex});
    board=new T.Mesh(geo,mat);board.name='paint-easel-board';board.castShadow=false;board.receiveShadow=false;
    const n=new T.Vector3(C.nx,C.ny,C.nz),r=new T.Vector3(s.rx,0,s.rz),u=new T.Vector3().crossVectors(n,r).normalize();
    board.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(r,u,n));board.position.set(C.x,C.y,C.z).addScaledVector(n,.0205);
    board.matrixAutoUpdate=false;board.updateMatrix();scene.add(board);}
   ports.wake();};
  pic.src=img;
 }
 function loadBoard(){if(boardLoaded)return;boardLoaded=true;const latest=readPaintings().items[0];if(latest)showOnBoard(latest.img);}

 // ---- commands from the UI
 function open(){if(seated)return;ensure();seated=true;mode='paint';blend=0;leaving=0;arrived=false;clock=0;captureKey='';revision++;
  easelStore.set({seated:true,mode:'paint',arrived:false,capture:null});cue('category');countEaselOpen();ports.wake();}
 function exit(){if(!seated)return;seated=false;leaving=1;arrived=false;revision++;easelStore.set({seated:false,arrived:false,mode:'paint',capture:null});cue('previous');ports.wake();}
 function setMode(m:'paint'|'look'){if(!seated||m===mode)return;mode=m;revision++;easelStore.set({mode:m});ports.wake();}
 function layout(l:EaselLayout){const b=Math.max(0,Math.min(.7,l.bottom||0)),r=Math.max(0,Math.min(.6,l.right||0));if(b===target.bottom&&r===target.right)return;target.bottom=b;target.right=r;revision++;ports.wake();}
 function saved(img:string){boardLoaded=true;showOnBoard(img);}
 let disposed=false;
 const off=installEaselActions({open,exit,setMode,layout,saved});

 function capture(camera:T.PerspectiveCamera){
  if(!renderer||typeof document==='undefined')return;const src=renderer.domElement,W=src.width,H=src.height;if(!W||!H)return;
  const sw=Math.max(1,Math.round(W*(1-cur.right))),sh=Math.max(1,Math.round(H*(1-cur.bottom))),k=Math.min(1,360/Math.max(sw,sh));
  if(!captureCanvas)captureCanvas=document.createElement('canvas');
  const c=captureCanvas;c.width=Math.max(1,Math.round(sw*k));c.height=Math.max(1,Math.round(sh*k));
  const g=c.getContext('2d',{willReadFrequently:true});if(!g)return;
  // Drawn right after a render in the same task, the drawing buffer is still readable (no preserveDrawingBuffer needed).
  renderer.render(scene,camera);try{g.drawImage(src,0,0,sw,sh,0,0,c.width,c.height);}catch{return;}
  const r=src.getBoundingClientRect();captureRev++;
  easelStore.set({capture:{canvas:c,rect:{left:r.left,top:r.top,width:r.width*(1-cur.right),height:r.height*(1-cur.bottom)},rev:captureRev}});
 }

 return {
  get seated(){return seated;},get mode(){return mode;},
  /** Town's focus mode (the background holds still) once the camera has arrived; `stand` is where it centres. */
  get focused(){return seated&&arrived;},
  get stand(){const s=ensure();return easelPoint(s,EASEL_LAYOUT.stand.f,EASEL_LAYOUT.stand.r);},
  get spot(){return ensure();},
  /** The 20 fps idle cap while seated and still (the camera has arrived; "Just look" drifts slowly at it too). 0 = normal rate. */
  get frameMs(){return seated&&arrived&&!leaving?IDLE_RIDE_FRAME_MS:0;},
  /** Nothing on screen will move (painting, the camera settled, and the water and life held still by `staticScene`: reduced
   *  motion or a static-ambience heat tier): Town's loop may sleep until a command wakes it. */
  still(staticScene:boolean){return seated&&arrived&&!leaving&&staticScene&&(mode==='paint'||!driftOn)&&settled()&&captureKey!=='';},
  /** Changes whenever a command changes what the seated view should show (part of Town's sleep key). */
  get revision(){return revision;},
  /** Seated: the stick and keys do nothing (no walking off mid-stroke). True = skip the walk this tick. */
  holdPlayer(input:{x:number;z:number;kick:boolean;juggle:boolean;shotPower?:number;charging?:boolean}){
   if(!seated)return false;input.kick=input.juggle=false;input.shotPower=0;input.charging=false;return true;
  },
  /** Per frame (Town's HUD block): the "Paint the view" prompt. */
  update(c:EaselUpdate):{key:string;distance:number}|null{
   const prompt=c.ui<HTMLButtonElement>('[data-easel-open]');
   // Summit Isle only (x > 400): the main island never computes the spot.
   if(c.x<=400){if(prompt&&!prompt.hidden)c.hide(prompt,true);return null;}
   loadBoard();
   const s=ensure(),d=Math.hypot(c.x-s.x,c.z-s.z);
   const want=c.onGround&&c.canEnter&&!seated&&!leaving&&d<EASEL_REACH?{key:'easel',distance:d}:null;
   if(prompt){let hidden=!(want&&c.focusKey==='easel');
    if(!hidden){anchor.set(s.x,s.ground+2.45,s.z).project(c.camera);hidden=anchor.z< -1||anchor.z>1;
     if(!hidden)c.place(prompt,T.MathUtils.clamp((anchor.x+1)*c.width/2,75,c.width-75),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
    c.hide(prompt,hidden);}
   return want;
  },
  /** Call after the follow camera (and the telescope's) is placed: the seated framing, or the way back to the follow camera. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   if(!seated&&!leaving)return;
   driftOn=!reduced;
   if(seated){const pl=ports.player();if(pl&&pl.visible)pl.visible=false;}
   // Ease the card's room (the projection centre shift) toward the UI's layout; none in "Just look".
   const want=mode==='look'?{bottom:0,right:0}:target,k=reduced?1:1-Math.exp(-dt*7);
   cur.bottom+=(want.bottom-cur.bottom)*k;cur.right+=(want.right-cur.right)*k;
   if(Math.abs(cur.bottom-want.bottom)<1e-3)cur.bottom=want.bottom;if(Math.abs(cur.right-want.right)<1e-3)cur.right=want.right;
   if(leaving){
    // Back to the follow camera Town placed this frame: position, facing, FOV and the centre shift ease out together.
    leaving=reduced?0:Math.max(0,leaving-dt/EASEL_CAMERA.blendOut);const e=smooth(1-leaving);
    camera.position.lerpVectors(seat.p,camera.position,e);camera.quaternion.slerpQuaternions(seat.q,camera.quaternion,e);
    if(leaving>0){camera.fov=seat.fov+(normal.fov-seat.fov)*e;camera.setViewOffset(1,1,cur.right/2*(1-e),cur.bottom/2*(1-e),1,1);}
    else{camera.fov=normal.fov;camera.far=normal.far;camera.clearViewOffset();cur.bottom=cur.right=0;}
    camera.updateProjectionMatrix();camera.updateMatrixWorld();return;
   }
   const s=ensure();
   if(blend===0){start.p.copy(camera.position);start.q.copy(camera.quaternion);start.fov=camera.fov;normal.fov=camera.fov;normal.far=camera.far;}
   blend=reduced?1:Math.min(1,blend+dt/EASEL_CAMERA.blendIn);const e=smooth(blend);
   clock+=dt;const drift=mode==='look'?easelDrift(clock,reduced):{yaw:0,pitch:0};
   const cam=easelCamera(s),yaw=cam.yaw+drift.yaw,pitch=cam.pitch+drift.pitch;
   eyeV.set(cam.x,cam.y,cam.z);lookV.set(cam.x+Math.sin(yaw)*Math.cos(pitch),cam.y+Math.sin(pitch),cam.z+Math.cos(yaw)*Math.cos(pitch));
   aimer.position.copy(eyeV);aimer.up.set(0,1,0);aimer.lookAt(lookV);targetQ.copy(aimer.quaternion);
   camera.position.lerpVectors(start.p,eyeV,e);camera.quaternion.slerpQuaternions(start.q,targetQ,e);
   const visAspect=camera.aspect*(1-cur.right)/Math.max(.3,1-cur.bottom),fov=easelFov(visAspect,1-cur.bottom);
   camera.fov=start.fov+(fov-start.fov)*e;camera.far=EASEL_CAMERA.far;
   camera.setViewOffset(1,1,cur.right/2*e,cur.bottom/2*e,1,1);camera.updateProjectionMatrix();camera.updateMatrixWorld();
   seat.p.copy(camera.position);seat.q.copy(camera.quaternion);seat.fov=camera.fov;
   if(blend>=1&&!arrived){arrived=true;easelStore.set({arrived:true});}
   // The view snapshot: once the camera has arrived and the card's room has settled (again only if the layout changes).
   const key=`${target.bottom.toFixed(3)}:${target.right.toFixed(3)}:${camera.aspect.toFixed(3)}`;
   if(arrived&&mode==='paint'&&captureKey!==key&&cur.bottom===target.bottom&&cur.right===target.right){captureKey=key;capture(camera);}
  },
  dispose(){disposed=true;off();if(board){board.removeFromParent();board.geometry.dispose();(board.material as T.Material).dispose();board=null;}boardTex?.dispose();boardTex=null;seated=false;leaving=0;},
 };
}
export type PaintEasel=ReturnType<typeof createPaintEasel>;
