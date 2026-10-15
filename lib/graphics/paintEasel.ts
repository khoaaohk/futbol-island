/**
 * Summit Isle painting easel runtime (Oct 14 2026). Rules and placement: lib/town/paintEasel.ts; the static prop:
 * lib/town/paintEaselWorld.ts; the UI: components/PaintEasel.tsx (they talk through lib/town/paintEaselStore.ts).
 *
 * "Paint the view" (a world-anchored prompt through the HUD arbiter, like the telescope) seats the player: the camera eases to a calm
 * framing over the painter's shoulder with the easel's board large in the foreground (the lower part of a phone, the lower left of a
 * wide screen) and the sea and the main island open beyond it. The board IS the paper ("the painting portion should be on the easel,
 * not two separate"): its texture is the paper, the faint "trace" view and the paint (the `sheet` canvas the UI draws into), and a
 * screen point maps to the paper by intersecting the board's plane. "Just look" pulls the camera back to the full view and it breathes
 * with a slow drift (none with reduced motion).
 *
 * Heat:
 *  - idle (not seated): update() costs one x-compare off Summit Isle, two distances on it; applyCamera() one boolean. No rAF, no timers.
 *  - seated: Town's focus mode holds the background still (traffic, matches, townsfolk; no chunks hidden, the view is far), the
 *    island renders at the 20 fps idle cap (frameMs), and with nothing left moving (reduced motion or the static-ambience heat
 *    tiers, while painting) the loop sleeps outright (still); every UI command wakes it for one frame.
 *  - the board's texture (one 512×384 canvas) uploads only when the paper changed: painted() marks it, the next rendered frame
 *    composites and uploads once (so at most one upload per island frame while a finger paints, none at rest).
 *  - the plane intersection runs only from pointer events (hit()), never per frame.
 *  - two extra renders on arrival: the seated screen (the eyedropper) and the view from the easel (trace), each copied from the
 *    drawing buffer right after its render, small. Never again unless the screen's shape changes.
 */
import * as T from 'three';
import {easelSpot,easelPoint,canvasPose,easelCamera,easelFov,easelDrift,easelPaintCamera,easelViewCamera,boardToPaper,EASEL_CAMERA,EASEL_LAYOUT,EASEL_REACH,
 PAINT_W,PAINT_H,PAINT_PAPER,readPaintings,type EaselSpot} from '../town/paintEasel';
import {easelStore,installEaselActions,type PaperHit} from '../town/paintEaselStore';
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
/** The trace snapshot (4:3) and the screen snapshot's longest side (px). */
const VIEW_W=384,VIEW_H=288,SCREEN_MAX=360;
/** How faint the traced view sits under the paint. */
const TRACE_ALPHA=.3;
/** The seated near plane (m): the board is ~1–1.7 m from the eye, inside the island camera's usual 1 m near plane. */
const SEATED_NEAR=.35;
type Pose={p:T.Vector3;q:T.Quaternion;fov:number};

export function createPaintEasel(scene:T.Scene,renderer:T.WebGLRenderer|null,ports:Ports){
 let spot:EaselSpot|null=null;const ensure=()=>spot??(spot=easelSpot());
 const anchor=new T.Vector3();
 // ---- seated state
 let driftOn=true,seated=false,mode:'paint'|'look'='paint',blend=0,leaving=0,arrived=false,clock=0,revision=0,captureKey='',captureRev=0,lookT=0;
 const start={p:new T.Vector3(),q:new T.Quaternion(),fov:40},normal={fov:40,far:500,near:1},seat:Pose={p:new T.Vector3(),q:new T.Quaternion(),fov:40};
 const aimer=new T.PerspectiveCamera(),targetP=new T.Vector3(),targetQ=new T.Quaternion();
 /** The painting framing, cached per screen shape (plain maths, recomputed only when the aspect changes). */
 const paintPose:Pose={p:new T.Vector3(),q:new T.Quaternion(),fov:50},lookPose:Pose={p:new T.Vector3(),q:new T.Quaternion(),fov:50},viewPose:Pose={p:new T.Vector3(),q:new T.Quaternion(),fov:50};let paintAspect=-1;
 const aim=(out:Pose,x:number,y:number,z:number,yaw:number,pitch:number,fov:number)=>{out.p.set(x,y,z);aimer.position.copy(out.p);aimer.up.set(0,1,0);
  aimer.lookAt(x+Math.sin(yaw)*Math.cos(pitch),y+Math.sin(pitch),z+Math.cos(yaw)*Math.cos(pitch));out.q.copy(aimer.quaternion);out.fov=fov;};
 let screenCanvas:HTMLCanvasElement|null=null,viewCanvas:HTMLCanvasElement|null=null,viewCam:T.PerspectiveCamera|null=null;
 let lastCamera:T.PerspectiveCamera|null=null;

 // ---- the board: the paper while seated, the latest saved painting afterwards (lazy: made the first time either exists)
 let board:T.Mesh|null=null,boardTex:T.CanvasTexture|null=null,boardCanvas:HTMLCanvasElement|null=null,sheet:HTMLCanvasElement|null=null;
 let seatMat:T.MeshBasicMaterial|null=null,worldMat:T.MeshLambertMaterial|null=null,boardDirty=false,traceOn=false,savedThisSeat=false;
 let boardLoaded=false,boardImg='',boardPic:HTMLImageElement|null=null;
 const boardFrame={centre:new T.Vector3(),n:new T.Vector3(),r:new T.Vector3(),u:new T.Vector3(),w:1,h:1};
 const canvas2d=()=>{const c=document.createElement('canvas');c.width=PAINT_W;c.height=PAINT_H;return c;};
 const ctxOf=(c:HTMLCanvasElement)=>c.getContext('2d',{willReadFrequently:true});
 function ensureBoard(){
  if(board||typeof document==='undefined')return board;
  boardCanvas=canvas2d();boardTex=new T.CanvasTexture(boardCanvas);boardTex.colorSpace=T.SRGBColorSpace;boardTex.generateMipmaps=false;boardTex.minFilter=T.LinearFilter;
  // Seated: the paint's true colours (no light, no tone mapping). In the world: lit like the board it hangs on.
  seatMat=new T.MeshBasicMaterial({map:boardTex,toneMapped:false});worldMat=new T.MeshLambertMaterial({map:boardTex});
  const s=ensure(),C=canvasPose(s),F=boardFrame;F.w=C.w;F.h=C.h;
  F.n.set(C.nx,C.ny,C.nz);F.r.set(s.rx,0,s.rz);F.u.crossVectors(F.n,F.r).normalize();F.centre.set(C.x,C.y,C.z).addScaledVector(F.n,.0205);
  board=new T.Mesh(new T.PlaneGeometry(F.w,F.h),worldMat);board.name='paint-easel-board';board.castShadow=false;board.receiveShadow=false;
  board.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(F.r,F.u,F.n));board.position.copy(F.centre);
  board.matrixAutoUpdate=false;board.updateMatrix();scene.add(board);
  return board;
 }
 /** Paper, the faint view (trace) and the paint, into the board's canvas; one texture upload. */
 function composite(withTrace:boolean){
  if(!boardCanvas||!boardTex)return;const g=boardCanvas.getContext('2d');if(!g)return;
  g.globalAlpha=1;g.fillStyle=PAINT_PAPER;g.fillRect(0,0,PAINT_W,PAINT_H);
  if(withTrace&&viewCanvas){g.globalAlpha=TRACE_ALPHA;g.drawImage(viewCanvas,0,0,PAINT_W,PAINT_H);g.globalAlpha=1;}
  if(sheet)g.drawImage(sheet,0,0);
  boardTex.needsUpdate=true;
 }
 function drawPicture(pic:HTMLImageElement){
  if(!ensureBoard()||!boardCanvas||!boardTex)return;const g=boardCanvas.getContext('2d');if(!g)return;
  g.globalAlpha=1;g.fillStyle=PAINT_PAPER;g.fillRect(0,0,PAINT_W,PAINT_H);g.drawImage(pic,0,0,PAINT_W,PAINT_H);boardTex.needsUpdate=true;board!.visible=true;
 }
 function showOnBoard(img:string){
  if(!img||img===boardImg||typeof document==='undefined'||typeof Image==='undefined')return;boardImg=img;
  const pic=new Image();pic.decoding='async';
  pic.onload=()=>{if(disposed||boardImg!==img)return;boardPic=pic;if(!seated&&!savedThisSeat){drawPicture(pic);ports.wake();}};
  pic.src=img;
 }
 function loadBoard(){if(boardLoaded)return;boardLoaded=true;const latest=readPaintings().items[0];if(latest)showOnBoard(latest.img);}

 // ---- commands from the UI
 function open(){if(seated)return;ensure();seated=true;mode='paint';blend=0;leaving=0;arrived=false;clock=0;captureKey='';lookT=0;traceOn=false;savedThisSeat=false;revision++;
  if(!sheet&&typeof document!=='undefined')sheet=canvas2d();
  if(ensureBoard()){board!.material=seatMat!;board!.visible=true;composite(false);}
  easelStore.set({seated:true,mode:'paint',arrived:false,sheet,boardRect:null,capture:null});cue('category');countEaselOpen();ports.wake();}
 function exit(){if(!seated)return;seated=false;leaving=1;arrived=false;revision++;traceOn=false;boardDirty=false;
  // The board in the world: what was just painted and saved, else the latest saved painting, else the bare board.
  if(board){board.material=worldMat!;if(savedThisSeat)composite(false);else if(boardPic)drawPicture(boardPic);else board.visible=false;}
  savedThisSeat=false;
  easelStore.set({seated:false,arrived:false,mode:'paint',boardRect:null,capture:null});cue('previous');ports.wake();}
 function setMode(m:'paint'|'look'){if(!seated||m===mode)return;mode=m;revision++;easelStore.set({mode:m});ports.wake();}
 function painted(){if(!seated)return;boardDirty=true;revision++;ports.wake();}
 function trace(on:boolean){if(!seated||on===traceOn)return;traceOn=on;painted();}
 function saved(img:string){boardLoaded=true;if(seated)savedThisSeat=true;showOnBoard(img);}
 const hitO=new T.Vector3(),hitD=new T.Vector3(),hitP=new T.Vector3();
 function hit(clientX:number,clientY:number):PaperHit|null{
  const cam=lastCamera;if(!seated||!arrived||mode!=='paint'||!cam||!board||!renderer)return null;
  const r=renderer.domElement.getBoundingClientRect();if(!r.width||!r.height)return null;
  hitO.setFromMatrixPosition(cam.matrixWorld);
  hitD.set((clientX-r.left)/r.width*2-1,-((clientY-r.top)/r.height*2-1),.5).unproject(cam).sub(hitO).normalize();
  const F=boardFrame,den=hitD.dot(F.n);if(Math.abs(den)<1e-6)return null;
  const t=hitP.copy(F.centre).sub(hitO).dot(F.n)/den;if(t<=0)return null;
  hitP.copy(hitO).addScaledVector(hitD,t).sub(F.centre);const a=hitP.dot(F.r),b=hitP.dot(F.u);
  return {...boardToPaper(a,b,F.w,F.h),inside:Math.abs(a)<=F.w/2&&Math.abs(b)<=F.h/2};
 }
 let disposed=false;
 const off=installEaselActions({open,exit,setMode,hit,painted,trace,saved});

 /** Copies the drawing buffer right after a render in the same task (still readable: no preserveDrawingBuffer needed). */
 function snap(cam:T.Camera,into:HTMLCanvasElement,sx:number,sy:number,sw:number,sh:number){
  const g=into.getContext('2d',{willReadFrequently:true});if(!g||!renderer)return false;renderer.render(scene,cam);
  try{g.drawImage(renderer.domElement,sx,sy,sw,sh,0,0,into.width,into.height);return true;}catch{return false;}
 }
 function capture(camera:T.PerspectiveCamera){
  if(!renderer||typeof document==='undefined')return;const src=renderer.domElement,W=src.width,H=src.height;if(!W||!H)return;
  const s=ensure();
  // The view from the easel (trace): its own camera, a 4:3 centre crop of the drawing buffer.
  viewCanvas??=document.createElement('canvas');viewCanvas.width=VIEW_W;viewCanvas.height=VIEW_H;
  const v=easelViewCamera(s,W/H);viewCam??=new T.PerspectiveCamera();viewCam.near=.5;viewCam.far=EASEL_CAMERA.far;viewCam.aspect=W/H;
  aim(viewPose,v.x,v.y,v.z,v.yaw,v.pitch,v.fov);viewCam.position.copy(viewPose.p);viewCam.quaternion.copy(viewPose.q);viewCam.fov=v.fov;viewCam.updateProjectionMatrix();viewCam.updateMatrixWorld();
  const a=PAINT_W/PAINT_H;let cw=W,ch=W/a;if(ch>H){ch=H;cw=H*a;}
  const viewOk=snap(viewCam,viewCanvas,(W-cw)/2,(H-ch)/2,cw,ch);
  // The seated screen (the eyedropper on the view).
  const k=Math.min(1,SCREEN_MAX/Math.max(W,H));screenCanvas??=document.createElement('canvas');
  screenCanvas.width=Math.max(1,Math.round(W*k));screenCanvas.height=Math.max(1,Math.round(H*k));
  if(!snap(camera,screenCanvas,0,0,W,H))return;
  const r=src.getBoundingClientRect();captureRev++;
  // Where the board sits on screen (the wide-screen tray stands beside it).
  let l=Infinity,t=Infinity,rt=-Infinity,b=-Infinity;const F=boardFrame;
  for(const [du,dv] of [[-1,-1],[1,-1],[-1,1],[1,1]]){anchor.copy(F.centre).addScaledVector(F.r,du*F.w/2).addScaledVector(F.u,dv*F.h/2).project(camera);
   const x=r.left+(anchor.x+1)/2*r.width,y=r.top+(1-anchor.y)/2*r.height;l=Math.min(l,x);rt=Math.max(rt,x);t=Math.min(t,y);b=Math.max(b,y);}
  easelStore.set({capture:{canvas:screenCanvas,view:viewOk?viewCanvas:null,rect:{left:r.left,top:r.top,width:r.width,height:r.height},rev:captureRev},boardRect:{left:l,top:t,right:rt,bottom:b}});
  if(traceOn)boardDirty=true;
 }

 return {
  get seated(){return seated;},get mode(){return mode;},
  /** Town's focus mode (the background holds still) once the camera has arrived; `stand` is where it centres. */
  get focused(){return seated&&arrived;},
  get stand(){const s=ensure();return easelPoint(s,EASEL_LAYOUT.stand.f,EASEL_LAYOUT.stand.r);},
  get spot(){return ensure();},
  /** The board mesh and its texture (tests and Town's diagnostics). */
  get board(){return board;},
  /** The 20 fps idle cap while seated (the camera has arrived; "Just look" drifts slowly at it too). 0 = normal rate. */
  get frameMs(){return seated&&arrived&&!leaving?IDLE_RIDE_FRAME_MS:0;},
  /** Nothing on screen will move (painting, the camera settled, no paper waiting to upload, and the water and life held still by
   *  `staticScene`: reduced motion or a static-ambience heat tier): Town's loop may sleep until a command wakes it. */
  still(staticScene:boolean){return seated&&arrived&&!leaving&&staticScene&&!boardDirty&&(mode==='paint'?lookT===0&&captureKey!=='':!driftOn&&lookT===1);},
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
   if(leaving){
    // Back to the follow camera Town placed this frame: position, facing and FOV ease out together.
    leaving=reduced?0:Math.max(0,leaving-dt/EASEL_CAMERA.blendOut);const e=smooth(1-leaving);
    camera.position.lerpVectors(seat.p,camera.position,e);camera.quaternion.slerpQuaternions(seat.q,camera.quaternion,e);
    if(leaving>0)camera.fov=seat.fov+(normal.fov-seat.fov)*e;else{camera.fov=normal.fov;camera.far=normal.far;camera.near=normal.near;}
    camera.updateProjectionMatrix();camera.updateMatrixWorld();return;
   }
   const s=ensure();
   if(blend===0){start.p.copy(camera.position);start.q.copy(camera.quaternion);start.fov=camera.fov;normal.fov=camera.fov;normal.far=camera.far;normal.near=camera.near;}
   blend=reduced?1:Math.min(1,blend+dt/EASEL_CAMERA.blendIn);const e=smooth(blend);
   // Painting ↔ "Just look": ease between the board framing and the full view (at once with reduced motion).
   const wantLook=mode==='look'?1:0,k=reduced?1:1-Math.exp(-dt*3.2);lookT+=(wantLook-lookT)*k;if(Math.abs(lookT-wantLook)<1e-3)lookT=wantLook;
   if(paintAspect!==camera.aspect){paintAspect=camera.aspect;const P=easelPaintCamera(s,camera.aspect);aim(paintPose,P.x,P.y,P.z,P.yaw,P.pitch,P.fov);}
   if(lookT>0){clock+=dt;const drift=easelDrift(clock,reduced),L=easelCamera(s);aim(lookPose,L.x,L.y,L.z,L.yaw+drift.yaw,L.pitch+drift.pitch,easelFov(camera.aspect,1));}
   const m=smooth(lookT);targetP.lerpVectors(paintPose.p,lookPose.p,m);targetQ.slerpQuaternions(paintPose.q,lookPose.q,m);
   camera.position.lerpVectors(start.p,targetP,e);camera.quaternion.slerpQuaternions(start.q,targetQ,e);
   camera.fov=start.fov+(paintPose.fov+(lookPose.fov-paintPose.fov)*m-start.fov)*e;camera.far=EASEL_CAMERA.far;camera.near=SEATED_NEAR;
   camera.updateProjectionMatrix();camera.updateMatrixWorld();lastCamera=camera;
   seat.p.copy(camera.position);seat.q.copy(camera.quaternion);seat.fov=camera.fov;
   if(blend>=1&&!arrived){arrived=true;easelStore.set({arrived:true});}
   // The snapshots: once the camera has arrived at the board (again only if the screen's shape changes).
   const key=`${camera.aspect.toFixed(3)}:${renderer?.domElement.width??0}`;
   if(arrived&&mode==='paint'&&lookT===0&&captureKey!==key){captureKey=key;capture(camera);}
   // The paper changed since the last frame: one composite, one upload.
   if(boardDirty){boardDirty=false;composite(traceOn);}
  },
  dispose(){disposed=true;off();if(board){board.removeFromParent();board.geometry.dispose();board=null;}seatMat?.dispose();worldMat?.dispose();seatMat=worldMat=null;boardTex?.dispose();boardTex=null;seated=false;leaving=0;},
 };
}
export type PaintEasel=ReturnType<typeof createPaintEasel>;
