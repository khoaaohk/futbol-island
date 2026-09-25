import * as T from 'three';
import type {MatchSim} from './match/matchSim';
import {shotProgress,shotHeightAt,shotOffsetAt} from './shotPlacement';

/** The walking character's ball constants (walkBall.ts): gravity 13 m/s², bounce restitution .53, settles under .8 m/s. */
export const BALL_GRAVITY=13,BALL_RESTITUTION=.53,BALL_SETTLE=.8,BALL_RADIUS=.19;

/**
 * Render-only vertical physics for a live-match ball. The sim still owns x/y and every gameplay
 * decision; this turns its scripted height (a sine loft, a linear sink after shots) into a real
 * gravity arc with bounces, integrated in sim time so a loft still lands exactly when the sim says.
 * `timeScale` is the live playback speed (sim seconds per real second).
 */
export function createLiveBallPhysics(timeScale:number,goal?:{goalHeight:number;goalWidth:number;width:number}){
 const G=BALL_GRAVITY/(timeScale*timeScale),settle=BALL_SETTLE/timeScale;
 let h=0,v=0,g=G,kicks=-1,simHeight=0,landing=0,shotOffset=0,wasPlacedShot=false,frameSerial=0;
 const axis=new T.Vector3(1,0,0),turn=new T.Quaternion();let spin=0,lastX=NaN,lastZ=NaN;
 /** Returns the ball's height above the pitch; `landing` is the last bounce's impact speed (m/s, 0 if none). */
 function step(sim:MatchSim,dt:number,loose:boolean){
  landing=0;
  if(!loose){h=sim.ball.height;v=0;g=G;kicks=sim.kicks;simHeight=sim.ball.height;shotOffset=0;wasPlacedShot=false;frameSerial=sim.frameContact?.serial??0;return h;}
  if(sim.kicks!==kicks){
   kicks=sim.kicks;const k=sim.lastKick;shotOffset=0;wasPlacedShot=false;
   // Lofted: the same apex and flight time as the sim's arc, as a true parabola. Driven: rise to the sim's height under gravity.
   if(k.loft>0&&k.dur>0){g=8*k.loft/(k.dur*k.dur);v=4*k.loft/k.dur;h=0;}
   else{g=G;h=0;v=k.height>0?Math.sqrt(2*G*k.height):0;}
  }else if(sim.ball.height>simHeight+.15){g=G;v=Math.max(v,Math.sqrt(2*G*Math.max(0,sim.ball.height-h)));}
  simHeight=sim.ball.height;
  if(sim.frameContact&&sim.frameContact.serial!==frameSerial){
   frameSerial=sim.frameContact.serial;h=sim.frameContact.height;v=sim.frameContact.vy;g=G;
   shotOffset=0;wasPlacedShot=false;landing=4;return h;
  }
  const k=sim.lastKick;
  if(goal&&k.shotHeight>0&&(sim.shotActive||sim.goalHold>0)){
   const p=shotProgress(k,sim.ball.y);
   // A distance-sampled rising arc reaches its intended height AT the goal line,
   // including short-range finishes and long shots slowed by the tactical simulation.
   const next=shotHeightAt(k,p,goal.goalHeight);
   shotOffset=shotOffsetAt(k,p,goal.goalWidth,goal.width);
   if(sim.shotActive){if(dt>0)v=(next-h)/dt;h=next;g=G;wasPlacedShot=true;return h;}
   // On net contact, start at the crossing height, then drop and bounce naturally.
   if(wasPlacedShot){h=next;v=0;wasPlacedShot=false;}
  }else if(shotOffset!==0&&dt>0)shotOffset*=Math.exp(-dt/(timeScale*.12));
  if(dt>0&&(h>0||v>0)){
   // Exact constant-gravity kinematics (no integration drift, so a loft lands on the sim's schedule).
   const h0=h,v0=v;h+=v*dt-.5*g*dt*dt;v-=g*dt;
   if(h<=0){v=-Math.sqrt(Math.max(0,v0*v0+2*g*h0));h=0;if(v<-settle){landing=-v*timeScale;v=-v*BALL_RESTITUTION;g=G;}else v=0;}
  }
  return h;
 }
 /** Rolls the mesh about the axis perpendicular to travel while grounded; keeps its spin in the air. */
 function roll(ball:T.Object3D,grounded:boolean,dt=1/60){
  const dx=ball.position.x-lastX,dz=ball.position.z-lastZ,d=Math.hypot(dx,dz);lastX=ball.position.x;lastZ=ball.position.z;
  if(!(d<2)||dt<=0)return;
  if(grounded){spin=d>1e-5?d/(BALL_RADIUS*dt):0;if(d>1e-5)axis.set(dz/d,0,-dx/d);}
  else{if(d>1e-5&&spin===0){axis.set(dz/d,0,-dx/d);spin=Math.min(35,d/(BALL_RADIUS*dt));}spin*=Math.exp(-.9*dt);}
  if(spin>1e-5)ball.quaternion.premultiply(turn.setFromAxisAngle(axis,spin*dt));
 }
 return {step,roll,get landing(){return landing;},get height(){return h;},get shotOffset(){return shotOffset;}};
}
