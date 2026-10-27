import * as T from 'three';
import type {PinballState} from './soccerPinball';
import {cinemaShot,cinemaWeight,type PinballCinema} from './soccerPinballCinema';

/* Futbol Pinball action camera (Oct 26 2026, docs/ARCADE_PINBALL_UPGRADE2_OCT26.md).
 *
 * Home framing (solved on resize only): the table fills the screen width and runs from just under the HUD to the
 * flipper tips, which sit just above the overlaid thumb pads; the drain strip below the flippers lives behind the
 * translucent pads. The solver picks the lowest pitch (most cabinet depth) that still fits the playfield width.
 *
 * Per frame (no allocation): a "shot" is chosen from the game state (launch lane, flipper zone, goal mouth, wide for
 * multiball / idle), damped toward with capped rates, and composed as home pose + pan + pitch offset + a dolly
 * toward an anchor point. A dolly keeps its anchor fixed on screen, so pushing in at the flippers never slides the
 * flippers under the pads. A last safety pass pans just enough to keep every live ball inside the safe rectangle
 * (below the HUD, above the pads, inside the screen edges). Reduced motion: fixed home framing, no pushes/tilts.
 */

/** Screen bands for the home framing, in CSS px. Shared with tests/pinball-camera-*.cjs. */
export function pinballCameraLayout(w:number,h:number,mobile:boolean){
 const landscape=w>h*1.15,short=h<520;
 // Header row (Arcade / score / pause) ends ~64 px down on phones, ~76 px on desktop.
 const top=short?50:mobile?70:82;
 // Pads: 120 px tall on touch portrait (+14 px gap), 96 px on desktop, beside the table in landscape.
 const pads=landscape?(short?0:24):mobile?Math.round(Math.min(150,Math.max(132,h*.16))):118;
 const flip=h-pads-(landscape?28:10);
 return {top,flip,safeTop:top-6,safeBottom:flip+18,edge:8,pitchMin:landscape?.84:.74,pitchMax:landscape?1.05:1.3,landscape};
}

export type PinballShot={k:number;ax:number;ay:number;az:number;tilt:number;name:'launch'|'wide'|'flippers'|'goal'|'play'|'multiball'|'celebrate'|'cinema'};
const wx=(x:number)=>(x-180)/30,wz=(y:number)=>(y-310)/30;
const smooth=(a:number,b:number,v:number)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};
/** The shot the camera wants this frame. Pure; writes into `out`. */
export function pinballShot(s:PinballState,out:PinballShot,reduced=false):PinballShot{
 out.tilt=0;out.ax=.42;out.ay=0;out.az=0;out.k=0;out.name='wide';
 if(reduced)return out;
 if(s.phase==='ready'){out.name='launch';out.ax=wx(354);out.az=wz(560);out.k=.2;out.tilt=-.13;return out;}
 if(s.phase==='goal'){const age=1.5-s.timer;if(age<.95){out.name='celebrate';out.ax=0;out.ay=1.1;out.az=wz(70);out.k=.18;out.tilt=.05;}return out;}
 if(s.phase!=='playing')return out;
 const b=s.ball;
 if(s.extraLive){out.name='multiball';out.ax=(wx(b.x)+wx(s.extra.x))/2;out.az=(wz(b.y)+wz(s.extra.y))/2;out.k=0;return out;}
 // Look a little ahead along the ball's path, bounded to the table.
 const lx=Math.min(6,Math.max(-5.2,wx(b.x+b.vx*.14))),lz=Math.min(8.4,Math.max(-9.6,wz(b.y+b.vy*.14))),speed=Math.hypot(b.vx,b.vy)/30;
 if(b.x>=341&&b.y>150){out.name='launch';out.ax=wx(354);out.az=lz;out.k=.1;out.tilt=-.06;return out;}
 const toward=b.vy>0?1:.55,f=smooth(1.5,6.8,lz)*toward,g=smooth(-2.5,-7.5,lz);
 out.name=f>.5?'flippers':g>.5?'goal':'play';
 out.k=Math.max(0,.13*f+.1*g-Math.max(0,speed-24)*.005);
 // Flipper push anchors on the flipper line (keeps both flippers put); goal push anchors on the goal mouth.
 out.ax=lx+(.42-lx)*(.45+.3*f);out.az=lz+(7.6-lz)*f*.75+(-8.4-lz)*g*.55;
 out.ay=g;out.tilt=-.07*f+.035*g;
 return out;
}

export function createPinballCamera(camera:T.PerspectiveCamera,mobile:boolean,reduced:boolean){
 const L0=new T.Vector3(),pos=new T.Vector3(),look=new T.Vector3(),anchor=new T.Vector3(),probe=new T.Vector3();
 let D0=30,pitch0=1,w=1,h=1,layout=pinballCameraLayout(1,1,mobile);
 const cur={k:0,ax:.42,ay:0,az:0,tilt:0,panX:0,panZ:0},want:PinballShot={k:0,ax:.42,ay:0,az:0,tilt:0,name:'wide'};let settled=true;
 function place(lx:number,lz:number,d:number,pitch:number){look.set(lx,0,lz);camera.position.set(lx,d*Math.sin(pitch),lz+d*Math.cos(pitch));camera.lookAt(look);camera.updateMatrixWorld();}
 function sy(x:number,y:number,z:number){probe.set(x,y,z).project(camera);return(1-probe.y)/2*h;}
 function sx(x:number,y:number,z:number){probe.set(x,y,z).project(camera);return(probe.x+1)/2*w;}
 // Goal crossbar top (y 2.1 over the goal line) to the flipper tips (z 8.9 incl. the flipper bodies).
 function solveLz(d:number,pitch:number,top:number){let lo=-40,hi=40;for(let i=0;i<26;i++){const mid=(lo+hi)/2;place(.42,mid,d,pitch);if(sy(0,2.1,-8.8)>top)lo=mid;else hi=mid;}return(lo+hi)/2;}
 function frame(pitch:number,top:number,flip:number){let lo=4,hi=160,lz=0;for(let i=0;i<24;i++){const d=(lo+hi)/2;lz=solveLz(d,pitch,top);if(sy(0,.3,8.9)>flip)lo=d;else hi=d;}const d=hi;lz=solveLz(d,pitch,top);return{d,lz};}
 // Playfield rails stay on screen down to the flipper line: the left wall (x -5.33) runs to z 4.8 before it slants in
 // to the flipper, the plunger lane wall (6.2) to the drain. Only the cabinet apron and the drain corners (behind the
 // translucent pads) bleed off the edges.
 const widthOk=()=>sx(-5.45,0,4.8)>=layout.edge-4&&sx(6.32,0,8.5)<=w-layout.edge+4;
 function fit(width:number,height:number){
  w=Math.max(1,width);h=Math.max(1,height);layout=pinballCameraLayout(w,h,mobile);camera.clearViewOffset();camera.updateProjectionMatrix();
  let chosen:{d:number;lz:number;pitch:number}|null=null;
  for(let pitch=layout.pitchMin;pitch<=layout.pitchMax+1e-6;pitch+=.035){const f=frame(pitch,layout.top,layout.flip);place(.42,f.lz,f.d,pitch);if(widthOk()){chosen={...f,pitch};break;}}
  if(!chosen){// Tall portrait: width-limited. Fit the width at the most overhead pitch and share the spare height.
   const pitch=layout.pitchMax;let top=layout.top,d=30,lz=0;
   for(let round=0;round<2;round++){let lo=4,hi=160;for(let i=0;i<24;i++){const mid=(lo+hi)/2;lz=solveLz(mid,pitch,top);place(.42,lz,mid,pitch);if(widthOk())hi=mid;else lo=mid;}d=hi;lz=solveLz(d,pitch,top);place(.42,lz,d,pitch);const spare=layout.flip-sy(0,.3,8.9);top=layout.top+Math.max(0,spare)*.5;}
   chosen={d,lz,pitch};
  }
  D0=chosen.d;pitch0=chosen.pitch;L0.set(.42,0,chosen.lz);camera.far=Math.max(180,D0+120);camera.updateProjectionMatrix();
  compose();
 }
 function compose(){
  place(L0.x+cur.panX,L0.z+cur.panZ,D0,pitch0+cur.tilt);
  if(cur.k>0){anchor.set(cur.ax,cur.ay,cur.az);pos.copy(camera.position);pos.lerp(anchor,cur.k);camera.position.copy(pos);camera.updateMatrixWorld();}
 }
 // Pan just enough to bring one point inside the safe rectangle. Returns true when it moved.
 function keep(x:number,z:number,bottom:boolean,height=.25){
  let moved=false;const y=sy(x,height,z),slope=y-sy(x,height,z-1);
  if(slope>.5){const over=bottom&&y>layout.safeBottom?y-layout.safeBottom:y<layout.safeTop?y-layout.safeTop:0;if(over){cur.panZ+=over/slope;moved=true;}}
  const px=sx(x,height,z),slopeX=px-sx(x-1,height,z);
  if(slopeX>.5){const over=px<layout.edge?px-layout.edge:px>w-layout.edge?px-(w-layout.edge):0;if(over){cur.panX+=over/slopeX;moved=true;}}
  return moved;
 }
 // Both frame lines (goal crossbar under the HUD, flipper tips above the pads) fit at zoom k?
 const lines=()=>sy(0,2.1,-8.8)>=layout.safeTop-1&&sy(0,.3,8.9)<=layout.safeBottom+1;
 function safety(s:PinballState){
  const b=s.ball,live=s.phase==='playing'||s.phase==='goal';
  if(live){
   // Every shot but the flipper push and the goal celebration keeps the whole table: if no pan can fit both lines,
   // back the zoom off to the largest k that does (bisection, only on those frames). On tall phones there is room for
   // the goal push; on height-limited screens it shrinks instead of hiding the flippers.
   if(cur.k>0&&want.name!=='flippers'&&want.name!=='celebrate'&&want.name!=='cinema'){
    const saved=cur.panZ;let fits=false;
    for(let i=0;i<2&&!fits;i++){fits=lines();if(!fits){keep(0,-8.8,false,2.1);compose();keep(0,8.9,true,.3);compose();}}
    if(!lines()){let lo=0,hi=cur.k;for(let i=0;i<7;i++){cur.k=(lo+hi)/2;cur.panZ=saved;compose();keep(0,-8.8,false,2.1);compose();keep(0,8.9,true,.3);compose();if(lines())lo=cur.k;else hi=cur.k;}cur.k=lo;cur.panZ=saved;compose();keep(0,-8.8,false,2.1);compose();keep(0,8.9,true,.3);compose();}
   }
   // Otherwise the end where the action is stays framed: the goal while the ball is up top or a goal is on, the
   // flippers while it is lower down.
   else if(s.phase==='goal'||b.y<260){if(keep(0,-8.8,false,2.1))compose();}
   else if(keep(0,8.9,true,.3))compose();
  }
  // Every live ball last, so it always wins (the drain strip below the flippers is allowed behind the pads).
  for(let pass=0;pass<2;pass++){let moved=false;
   if(s.phase==='ready'||s.phase==='playing'&&b.y<566)moved=keep(wx(b.x),wz(b.y),true)||moved;
   if(s.phase==='playing'&&s.extraLive&&s.extra.y<566)moved=keep(wx(s.extra.x),wz(s.extra.y),true)||moved;
   if(!moved)break;compose();}
 }
 const step=(value:number,target:number,lambda:number,rate:number,dt:number)=>{const next=T.MathUtils.damp(value,target,lambda,dt),cap=rate*dt;return value+Math.max(-cap,Math.min(cap,next-value));};
 /** `cine`: round 3 cinematic beats (soccerPinballCinema) blend into the shot; while one runs the zoom/pan caps are a
  * little higher (1.5/s, 18 u/s) so a short push can land, still damped and capped. Never under reduced motion. */
 function update(dt:number,s:PinballState,cine?:PinballCinema){
  pinballShot(s,want,reduced);
  const beat=!reduced&&cine?cinemaWeight(cine):0;if(beat>0&&cine)cinemaShot(cine,want);
  const before=cur.k+cur.ax+cur.ay+cur.az+cur.tilt+cur.panX+cur.panZ;
  if(dt>0){
   const zoomCap=beat>0?1.5:.62,panCap=beat>0?18:12;
   cur.k=step(cur.k,want.k,beat>0?6:3,zoomCap,dt);cur.ax=step(cur.ax,want.ax,4.5,panCap,dt);cur.az=step(cur.az,want.az,4.5,panCap,dt);cur.ay=step(cur.ay,want.ay,4.5,4,dt);cur.tilt=step(cur.tilt,want.tilt,2.6,.32,dt);
   // Safety pans relax back to home during play; on the plunger they hold so the waiting table can sleep.
   if(s.phase==='playing'||s.phase==='goal'||s.phase==='lost'){const fade=Math.exp(-dt*1.6);cur.panX*=fade;cur.panZ*=fade;if(Math.abs(cur.panX)<.002)cur.panX=0;if(Math.abs(cur.panZ)<.002)cur.panZ=0;}
  }
  compose();safety(s);
  const after=cur.k+cur.ax+cur.ay+cur.az+cur.tilt+cur.panX+cur.panZ;
  settled=beat===0&&Math.abs(after-before)<1e-4&&Math.abs(cur.k-want.k)<.003&&Math.abs(cur.tilt-want.tilt)<.002&&(cur.k<.003||Math.abs(cur.ax-want.ax)+Math.abs(cur.az-want.az)<.01);
 }
 /** Jump straight to the shot (new game / resize), no easing. */
 function snap(s:PinballState){pinballShot(s,want,reduced);cur.k=want.k;cur.ax=want.ax;cur.ay=want.ay;cur.az=want.az;cur.tilt=want.tilt;cur.panX=cur.panZ=0;compose();for(let i=0;i<3;i++)safety(s);settled=true;}
 return{fit,update,snap,moving:()=>!settled,shot:()=>want.name,
  /** Debug/QA: the solved home framing and live offsets. */
  info:()=>({pitch:pitch0,distance:D0,lookZ:L0.z,k:cur.k,tilt:cur.tilt,panX:cur.panX,panZ:cur.panZ,shot:want.name,layout})};
}
