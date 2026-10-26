import * as T from 'three';
import type {TennisState} from '@/lib/games/soccerTennis';

/** Futbol Tennis dynamic camera (Oct 26 2026).
 * - SERVE: a raised, more tilted view from behind your baseline, solved on resize so the whole court (far
 *   baseline, both service boxes, both players) fits between the HUD and the controls.
 * - RALLY: a lower-tilt view that frames the play about to happen (you, the ball and its bounce spot): it pushes
 *   in as the ball comes to you and pulls back to the wide shot when the ball is far or the point is over. The
 *   framing never leaves the court: the near baseline stays at or below the controls band and the far baseline
 *   at or above the HUD band, so a push-in shows more court, never dead floor.
 * Everything is damped with capped pan speed and zoom rate. Reduced motion: a fixed rally shot (no pan, no
 * push-in) and a plain cut between the serve and rally views.
 * Cost: binary searches on resize only; per frame a few vector ops, no allocation. */
export type TennisCameraLayout={width:number;length:number;top:number;bottom:number;rallyTilt:number;serveTilt:number;limitX:number;zoom:number};
/** Layout per screen class. Portrait phones get a tighter court frame (10.5 m for the 10 m court). */
export function tennisCameraLayout(w:number,h:number,mobile:boolean):TennisCameraLayout{
 const portrait=h>w*1.15,short=h<520;
 if(short)return {width:10.8,length:17.2,top:56,bottom:96,rallyTilt:.95,serveTilt:1.15,limitX:.97,zoom:1.12};
 if(mobile&&portrait&&w>600)return {width:10.8,length:17.2,top:80,bottom:212,rallyTilt:.5,serveTilt:.82,limitX:.97,zoom:1.18}; // tablets: the court is already big
 if(mobile&&portrait)return {width:10.5,length:17,top:66,bottom:192,rallyTilt:.42,serveTilt:.8,limitX:.99,zoom:1.32};
 if(portrait)return {width:10.8,length:17.2,top:80,bottom:170,rallyTilt:.5,serveTilt:.82,limitX:.96,zoom:1.24};
 return {width:11.2,length:17.4,top:80,bottom:140,rallyTilt:.58,serveTilt:.86,limitX:.9,zoom:1.1};
}
export type TennisCameraAim={x:number;z:number;zoom:number;serve:number};
/** Where the camera wants to look and how close (before the court clamp). Pure: exported for tests.
 * Frames the box around you, the ball and the bounce spot: a small box (the ball arriving) = push in. */
export function tennisCameraAim(s:TennisState,sweet:{x:number;y:number}|null,out:TennisCameraAim,maxZoom:number,courtLength=17){
 const b=s.ball,you=s.you;
 if(s.phase==='serve'||s.phase==='ready'){out.x=0;out.z=0;out.zoom=1;out.serve=1;return out;}
 out.serve=0;
 if(s.phase!=='rally'){out.x=0;out.z=0;out.zoom=1;return out;} // between points: back to the wide shot
 let x0=Math.min(you.x,b.x),x1=Math.max(you.x,b.x),z0=Math.min(you.y,b.y),z1=Math.max(you.y,b.y);
 if(sweet&&b.last==='rival'){x0=Math.min(x0,sweet.x);x1=Math.max(x1,sweet.x);z0=Math.min(z0,sweet.y);z1=Math.max(z1,sweet.y);}
 // Your shot flying away: keep the rival in the box so you can read its reply.
 if(b.last==='you'){z0=Math.min(z0,s.rival.y);x0=Math.min(x0,s.rival.x);x1=Math.max(x1,s.rival.x);}
 const span=Math.max(z1-z0,(x1-x0)*1.2)+5.5;
 out.zoom=Math.max(1,Math.min(maxZoom,courtLength/span));out.x=(x0+x1)*.5*.7;out.z=(z0+z1)*.5;
 return out;
}
type Pose={dir:T.Vector3;dist:number;quat:T.Quaternion;offsetY:number};
const pose=():Pose=>({dir:new T.Vector3(0,1,0),dist:20,quat:new T.Quaternion(),offsetY:0});
/** Zoom samples for the court clamp table (focus range per zoom), solved on resize. */
const SAMPLES=5;
export function createTennisCamera(camera:T.PerspectiveCamera,mobile:boolean,reduced:boolean){
 const serve=pose(),rally=pose(),corner=new T.Vector3(),look=new T.Vector3(),focus=new T.Vector3(),rallyPos=new T.Vector3(),servePos=new T.Vector3(),q=new T.Quaternion();
 const zMin=new Float32Array(SAMPLES),zMax=new Float32Array(SAMPLES);
 const aim:TennisCameraAim={x:0,z:0,zoom:1,serve:1};let layout=tennisCameraLayout(1,1,mobile),w=1,h=1,zoom=1,blend=1,ready=false,moving=false;
 /** Same solve as the arcade stage fit: the largest view that keeps the court inside the safe band. */
 function solve(p:Pose,tilt:number){
  const {width,length,top,bottom,limitX}=layout,usable=Math.max(1,h-top-bottom),room=Math.max(.3,usable/h);let low=5,high=250;look.set(0,0,0);
  camera.clearViewOffset();camera.updateProjectionMatrix();
  for(let i=0;i<22;i++){const d=(low+high)/2;camera.position.set(0,d,d*tilt);camera.lookAt(look);camera.updateMatrixWorld();let fits=true,minY=Infinity,maxY=-Infinity;
   for(let c=0;c<4;c++){corner.set(c&1?width/2:-width/2,0,c&2?length/2:-length/2).project(camera);minY=Math.min(minY,corner.y);maxY=Math.max(maxY,corner.y);if(Math.abs(corner.x)>limitX)fits=false;}
   if(maxY-minY>room*2)fits=false;if(fits)high=d;else low=d;}
  camera.position.set(0,high,high*tilt);camera.lookAt(look);camera.updateMatrixWorld();
  let minY=Infinity,maxY=-Infinity;for(let c=0;c<2;c++){corner.set(0,0,c?length/2:-length/2).project(camera);minY=Math.min(minY,corner.y);maxY=Math.max(maxY,corner.y);}
  p.dir.copy(camera.position).normalize();p.dist=camera.position.length();p.quat.copy(camera.quaternion);p.offsetY=(bottom-top)/2-(minY+maxY)*h/4;
 }
 /** Screen y (NDC, view offset applied) of a baseline for the rally pose at this focus z and zoom. */
 function baselineY(fz:number,z:number,baseline:number){camera.position.copy(rally.dir).multiplyScalar(rally.dist/z);camera.position.z+=fz;camera.quaternion.copy(rally.quat);camera.updateMatrixWorld();return corner.set(0,0,baseline).project(camera).y;}
 /** Per zoom sample: the focus-z range that keeps the near baseline at/below the controls band and the far one at/above the HUD band. */
 function solveRange(){
  const top=1-2*layout.top/h,bottom=-1+2*layout.bottom/h,half=layout.length/2;camera.setViewOffset(w,h,0,rally.offsetY,w,h);camera.updateProjectionMatrix();
  for(let i=0;i<SAMPLES;i++){const z=1+(layout.zoom-1)*i/(SAMPLES-1);let lo=-6,hi=6;
   for(let k=0;k<24;k++){const m=(lo+hi)/2;if(baselineY(m,z,half)<=bottom+.002)lo=m;else hi=m;}zMax[i]=lo; // focus toward you lifts the near baseline
   lo=-6;hi=6;for(let k=0;k<24;k++){const m=(lo+hi)/2;if(baselineY(m,z,-half)>=top-.002)hi=m;else lo=m;}zMin[i]=hi;}
 }
 function fit(width:number,height:number){w=Math.max(1,width);h=Math.max(1,height);layout=tennisCameraLayout(w,h,mobile);solve(rally,layout.rallyTilt);solve(serve,layout.serveTilt);solveRange();ready=true;}
 /** Clamp a focus to the court for this zoom (the table is linear between samples). */
 function clampAim(){const t=Math.max(0,Math.min(SAMPLES-1,(aim.zoom-1)/Math.max(1e-6,layout.zoom-1)*(SAMPLES-1))),i=Math.min(SAMPLES-2,Math.floor(t)),f=t-i;
  const lo=zMin[i]+(zMin[i+1]-zMin[i])*f,hi=zMax[i]+(zMax[i+1]-zMax[i])*f;aim.z=lo>hi?(lo+hi)/2:Math.max(lo,Math.min(hi,aim.z));
  const xm=layout.width/2*(1-1/aim.zoom);aim.x=Math.max(-xm,Math.min(xm,aim.x));}
 /** Place the camera for this frame. `snap` jumps straight to the target (first frame, resize, reset). */
 function update(dt:number,s:TennisState,sweet:{x:number;y:number}|null,snap=false){
  if(!ready)return;
  tennisCameraAim(s,sweet,aim,layout.zoom,layout.length);
  if(reduced){aim.x=0;aim.zoom=1;}
  clampAim();
  if(snap||dt<=0){focus.set(aim.x,0,aim.z);zoom=aim.zoom;blend=aim.serve;}
  else{
   // Damped follow with a capped pan speed (m/s) and zoom rate (/s): smooth, never a whip-pan.
   const k=1-Math.exp(-2.6*dt),maxStep=6*dt;let dx=(aim.x-focus.x)*k,dz=(aim.z-focus.z)*k;const len=Math.hypot(dx,dz);if(len>maxStep){dx*=maxStep/len;dz*=maxStep/len;}focus.x+=dx;focus.z+=dz;
   const dzm=(aim.zoom-zoom)*(1-Math.exp(-2*dt));zoom+=Math.max(-.5*dt,Math.min(.5*dt,dzm));
   blend=reduced?aim.serve:blend+(aim.serve-blend)*(1-Math.exp(-(aim.serve>blend?3.2:2.6)*dt));if(Math.abs(blend-aim.serve)<.01)blend=aim.serve;
  }
  moving=!(blend===aim.serve&&Math.abs(zoom-aim.zoom)<.003&&Math.abs(focus.x-aim.x)<.01&&Math.abs(focus.z-aim.z)<.01);
  const e=blend*blend*(3-2*blend);
  rallyPos.copy(rally.dir).multiplyScalar(rally.dist/zoom).add(focus);servePos.copy(serve.dir).multiplyScalar(serve.dist);
  camera.position.copy(rallyPos).lerp(servePos,e);q.copy(rally.quat).slerp(serve.quat,e);camera.quaternion.copy(q);
  camera.setViewOffset(w,h,0,rally.offsetY+(serve.offsetY-rally.offsetY)*e,w,h);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 }
 return {fit,update,moving:()=>moving,state:()=>({zoom,blend,x:focus.x,z:focus.z}),layout:()=>layout,range:()=>({zMin:Array.from(zMin),zMax:Array.from(zMax)})};
}
