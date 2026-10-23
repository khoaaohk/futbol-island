/**
 * Close-control dribbling footwork (Oct 23 2026, owner: "make the dribble like real futbol"). Pure curves, no three.js, no
 * allocation per step: one mutable DribbleFeel per rig, stepped from what every rig already knows (its speed, body yaw, the
 * heading it is turning to, and the gait phase). The same code drives the local player, friends' avatars (derived from their
 * pose stream, no protocol change) and match NPCs, so a stop or a turn looks the same on every screen.
 *
 * Teaching purpose: the three moves a young player learns first with the ball at their feet.
 *  - Touch rhythm: small touches every step while walking (ball close), a bigger push every third step at running pace, the
 *    feet alternating (an odd step count always swaps the foot).
 *  - Sole stop (foot trap): the sole lands on top of the ball, the ball settles under it, a brief hold, the foot lifts away.
 *  - Drag-back turn: for a sharp change of direction (> ~92 deg) the sole rolls the ball back across the body while the body
 *    pivots over the planted foot, then dribbling carries on in the new direction. Gentle turns (> ~29 deg of accumulated
 *    heading change since the last touch) use an inside or outside-of-the-boot touch instead.
 *
 * Coordinates: distances are in rig units (metres at scale 1) from the hips; `ballYaw` is a world heading (same convention as the
 * rig: forward = (sin yaw, cos yaw)), `ballSide` a lateral offset in that ball frame (+ = the rig's local +x side).
 */
export const DRIBBLE={
 /** Ball centre ahead of the hips at the moment of a rolling touch (where the swinging boot meets it; the old fixed lane). */
 contact:.6,
 /** Where a stop parks the ball: in front of the boots, clear of the toes. */
 rest:.52,
 /** Hard bounds for the ball's distance from the hips (rolling never goes below `rest`; a drag-back may come to `drag`). */
 minDist:.36,maxDist:1.05,
 /** Push per touch: walking keeps it close, running pushes it ahead (then the runner catches it up). */
 pushWalk:.05,pushRun:.38,
 /** At / above this speed (m/s) a touch goes every third step instead of every step (hysteresis .3 m/s below). */
 runFrom:1.6,
 /** A sole stop starts when the speed drops under `stopBelow` after recently moving at `stopFrom` or more. */
 stopFrom:.9,stopBelow:.45,
 stopTime:.72,stopTimeReduced:.42,
 /** Heading change (rad) to the target that triggers a drag-back; accumulated change since the last touch for a cut touch. */
 turnSharp:1.6,turnGentle:.5,
 turnTime:.7,turnTimeReduced:.42,
 /** Drag-back: how close the sole pulls the ball (from the hips). */
 drag:.42,
 /** Ankle lift that puts the sole on top of the ball (ball top .38 m, ankle .075 m above the sole). */
 soleLift:.36,
 /** The ankle sits this far behind the ball centre, so the forefoot covers the top of the ball. */
 soleBack:.09,
 /** No new stop / turn for this long after one ends (it cannot retrigger every frame). */
 cooldown:.35,
} as const;

export const MOVE_ROLL=0,MOVE_STOP=1,MOVE_TURN=2;
/** Touch styles in the rolling rhythm. */
export const TOUCH_LACES=0,TOUCH_INSIDE=1,TOUCH_OUTSIDE=2;

export type DribbleFeel={
 init:boolean;move:number;t:number;dur:number;cooldown:number;peak:number;
 /** Active move: the foot (-1 left / 1 right), turn direction, headings. */
 side:number;dir:number;fromYaw:number;toYaw:number;fromDist:number;reduced:boolean;
 /** Rhythm: gait step clock (phase / pi), the step of the last touch, steps per touch, its push, style, foot. */
 lastStep:number;touchStep:number;perTouch:number;push:number;style:number;touchSide:number;cutRef:number;cutSign:number;
 /** Outputs: the ball (world heading, distance, lateral offset, press 0..1 for a squash) and the body turn-rate scale. */
 ballYaw:number;ballDist:number;ballSide:number;press:number;yawScale:number;
 /** Outputs: the foot on the ball (0 = none) and its weight / lift / toe pitch (+ = toe down). */
 foot:number;footW:number;footLift:number;footToe:number;
 /** Outputs: an additive accent for the rolling touch foot (rig units: forward reach, outward reach, lift). */
 accSide:number;accFwd:number;accX:number;accLift:number;
};

export function createDribbleFeel():DribbleFeel{
 return {init:false,move:MOVE_ROLL,t:0,dur:1,cooldown:0,peak:0,side:1,dir:1,fromYaw:0,toYaw:0,fromDist:DRIBBLE.contact,reduced:false,
  lastStep:0,touchStep:0,perTouch:1,push:DRIBBLE.pushWalk,style:TOUCH_LACES,touchSide:1,cutRef:0,cutSign:0,
  ballYaw:0,ballDist:DRIBBLE.contact,ballSide:0,press:0,yawScale:1,foot:0,footW:0,footLift:0,footToe:0,accSide:0,accFwd:0,accX:0,accLift:0};
}

const wrap=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
const clamp01=(v:number)=>v<0?0:v>1?1:v;
const smooth=(v:number)=>{const x=clamp01(v);return x*x*(3-2*x);};
const damp=(a:number,b:number,rate:number,dt:number)=>a+(b-a)*(1-Math.exp(-rate*dt));
/** Rolling ball lead over one touch cycle (u 0..1): out fast after the touch, back to the boot by the next one (peak 1 at u = 1/3). */
export const rollCurve=(u:number)=>{const x=clamp01(u);return 6.75*x*(1-x)*(1-x);};
/** Push per touch for a speed (m/s); reduced motion / lite keeps half. */
export const pushFor=(speed:number,reduced:boolean)=>(DRIBBLE.pushWalk+(DRIBBLE.pushRun-DRIBBLE.pushWalk)*smooth((speed-.8)/4))*(reduced?.5:1);
/** Steps per touch: 1 while walking, 3 at running pace (odd, so the touching foot always alternates). */
export const stepsPerTouch=(speed:number,current:number)=>current>=3?(speed<DRIBBLE.runFrom-.3?1:3):(speed>=DRIBBLE.runFrom?3:1);
/** Which kind of turn a heading change asks for: 0 none, 1 a cut touch (inside / outside), 2 a drag-back. */
export const turnKind=(change:number)=>{const a=Math.abs(wrap(change));return a>=DRIBBLE.turnSharp?2:a>=DRIBBLE.turnGentle?1:0;};

/** Snap to a neutral rolling state (a teleport, a fresh possession, a ride). */
export function resetDribbleFeel(f:DribbleFeel,yaw:number,phase:number){
 f.init=true;f.move=MOVE_ROLL;f.t=0;f.cooldown=0;f.peak=0;f.ballYaw=yaw;f.ballDist=DRIBBLE.contact;f.ballSide=0;f.press=0;f.yawScale=1;
 f.foot=0;f.footW=0;f.footLift=0;f.footToe=0;f.accSide=0;f.accFwd=f.accX=f.accLift=0;
 const step=Math.floor(phase/Math.PI+.2);f.lastStep=f.touchStep=step;f.perTouch=1;f.push=DRIBBLE.pushWalk;f.style=TOUCH_LACES;f.touchSide=step%2?1:-1;f.cutRef=yaw;f.cutSign=0;
}

function startStop(f:DribbleFeel,reduced:boolean){
 f.move=MOVE_STOP;f.t=0;f.reduced=reduced;f.dur=reduced?DRIBBLE.stopTimeReduced:DRIBBLE.stopTime;
 f.side=-f.touchSide||1;f.fromDist=f.ballDist;f.fromYaw=f.ballYaw;
}
function startTurn(f:DribbleFeel,target:number,reduced:boolean){
 const change=wrap(target-f.ballYaw);
 f.move=MOVE_TURN;f.t=0;f.reduced=reduced;f.dur=reduced?DRIBBLE.turnTimeReduced:DRIBBLE.turnTime;
 f.dir=change>=0?1:-1;f.side=-f.dir; // the ball lags on the far side of the turn: that boot drags it, the other is the pivot
 f.fromYaw=f.ballYaw;f.toYaw=f.ballYaw+change;f.fromDist=f.ballDist;
}

/**
 * One frame. `speed` m/s (the rig's smoothed speed), `yaw` the body yaw after this frame's turn, `target` the heading the body is
 * turning to, `phase` the gait phase (radians, two steps per 2 pi), `reduced` = reduced motion or a heat-lite tier.
 * dt <= 0 holds every output (a paused frame).
 */
export function stepDribbleFeel(f:DribbleFeel,dt:number,speed:number,yaw:number,target:number,phase:number,reduced:boolean){
 if(!f.init)resetDribbleFeel(f,yaw,phase);
 if(!(dt>0))return;
 f.cooldown=Math.max(0,f.cooldown-dt);
 f.peak=Math.max(speed,f.peak*Math.exp(-dt/.5));
 // Step clock: a touch sits just before the touching boot sets down (.2 step early), so the swinging boot meets the ball.
 const stepF=phase/Math.PI+.2,step=Math.floor(stepF);
 const crossed=step!==f.lastStep;f.lastStep=step;
 f.accSide=0;f.accFwd=f.accX=f.accLift=0;f.press=0;
 if(f.move===MOVE_ROLL&&f.cooldown<=0){
  const change=wrap(target-f.ballYaw);
  if(turnKind(change)===2&&speed>.15)startTurn(f,target,reduced);
  else if(speed<DRIBBLE.stopBelow&&f.peak>=DRIBBLE.stopFrom)startStop(f,reduced);
 }
 if(f.move===MOVE_STOP){stepStop(f,dt,speed);if(f.move===MOVE_STOP)return;}
 else if(f.move===MOVE_TURN){stepTurn(f,dt,target,stepF,speed);if(f.move===MOVE_TURN)return;}
 // Rolling rhythm.
 f.foot=0;f.footW=Math.max(0,f.footW-dt/.12);f.yawScale=1;
 if(Math.abs(wrap(yaw-f.cutRef))>=DRIBBLE.turnGentle&&speed>.6&&!f.cutSign)f.cutSign=wrap(yaw-f.cutRef)>0?1:-1;
 if(crossed&&speed>.15&&(step-f.touchStep>=f.perTouch||f.cutSign)){
  const side=step%2?1:-1;
  f.touchStep=step;f.touchSide=side;f.perTouch=stepsPerTouch(speed,f.perTouch);f.push=pushFor(speed,reduced);
  f.style=f.cutSign?(side===f.cutSign?TOUCH_OUTSIDE:TOUCH_INSIDE):TOUCH_LACES;f.cutSign=0;f.cutRef=yaw;
 }
 if(speed<=.15){f.touchStep=step;f.cutRef=yaw;f.cutSign=0;}
 const u=(stepF-f.touchStep)/f.perTouch,move=smooth((speed-.15)/.75);
 const lead=DRIBBLE.contact+f.push*rollCurve(u);
 f.ballDist=Math.min(DRIBBLE.maxDist,Math.max(DRIBBLE.rest,damp(f.ballDist,DRIBBLE.rest+(lead-DRIBBLE.rest)*move,16,dt)));
 // A cut touch nudges the ball toward the new line for the first part of the cycle.
 const cut=f.style===TOUCH_LACES?0:Math.sin(Math.PI*clamp01(u*2))*(reduced?.03:.06)*(f.style===TOUCH_OUTSIDE?f.touchSide:-f.touchSide);
 f.ballSide=damp(f.ballSide,cut*move,12,dt);
 // The ball line follows the body (quickly: it is touched every step or three), never snapping after a stop / turn.
 f.ballYaw=yaw+wrap(f.ballYaw-yaw)*Math.exp(-12*dt);
 // The touch foot's accent: in the last .4 step before the touch it reaches through to the ball (forward for the laces, across for
 // an inside touch, out for the outside of the boot).
 const toNext=f.touchStep+f.perTouch-stepF;
 if(move>0&&toNext<=.4&&toNext>=0){
  const a=Math.sin(Math.PI*(1-toNext/.4))*move*(reduced?.5:1),next=(f.touchStep+f.perTouch)%2?1:-1;
  f.accSide=next;f.accFwd=.06*a+.25*f.push*a;f.accLift=.03*a;
  f.accX=f.cutSign?(next===f.cutSign?.05:-.06)*a:0;
 }
}

function stepStop(f:DribbleFeel,dt:number,speed:number){
 f.t+=dt;
 // Moving off again before the hold ends: skip to the lift-away, the boot leaves the ball smoothly.
 if(speed>1.2&&f.t<.62*f.dur)f.t=.62*f.dur;
 const p=f.t/f.dur,size=f.reduced?.75:1;
 // The ball rolls on and slows to rest under the sole (ease-out, settled by p .36: the sole lands at p .3).
 const settle=1-(1-clamp01(p/.36))**3;
 f.ballDist=Math.max(DRIBBLE.rest,f.fromDist+(DRIBBLE.rest-f.fromDist)*settle);
 f.ballSide=damp(f.ballSide,f.side*.05,10,dt);f.yawScale=1;
 f.foot=f.side;f.ballYaw=f.fromYaw;
 // Weight: up over .3 (lift and reach), held, away from .62.
 f.footW=p<.62?smooth(p/.22):1-smooth((p-.62)/.38);
 // Lift: an arc over the ball that lands on its top, sinks a touch into it (the press), then rises as the boot leaves.
 const land=DRIBBLE.soleLift*size;
 f.footLift=p<.3?land+.07*size*Math.sin(Math.PI*p/.3):p<.62?land-.015*Math.sin(Math.PI*clamp01((p-.3)/.32)):land+.05*smooth((p-.62)/.2);
 f.footToe=.18*f.footW;
 f.press=p>=.28&&p<.62?Math.sin(Math.PI*clamp01((p-.28)/.34)):0;
 if(p>=1){f.move=MOVE_ROLL;f.cooldown=DRIBBLE.cooldown;f.peak=0;f.foot=0;}
}

function stepTurn(f:DribbleFeel,dt:number,target:number,stepF:number,speed:number){
 f.t+=dt;
 const p=f.t/f.dur;
 // The new heading may still settle during the reach: follow it (same turn direction).
 if(p<.4){let c=wrap(target-f.fromYaw);if(c*f.dir<0&&Math.abs(c)>2.6)c+=f.dir*Math.PI*2;if(Math.abs(c)>=DRIBBLE.turnGentle)f.toYaw=f.fromYaw+c;}
 const span=f.toYaw-f.fromYaw;
 // The ball stays on the dragging boot's side, clear of the pivot boot.
 f.foot=f.side;f.ballSide=damp(f.ballSide,f.side*.07,10,dt);
 if(p<.22){ // reach: the sole comes onto the ball as it is pulled in
  const q=smooth(p/.22);f.ballYaw=f.fromYaw;f.ballDist=f.fromDist+(DRIBBLE.drag-f.fromDist)*q;f.footW=q;
  f.footLift=DRIBBLE.soleLift+.05*Math.sin(Math.PI*p/.22);f.yawScale=.7;f.press=0;
 }else if(p<.78){ // drag: the sole rolls the ball across the body; the body pivots over the planted boot
  const q=smooth((p-.22)/.56);f.ballYaw=f.fromYaw+span*q;f.ballDist=DRIBBLE.drag+.04*Math.sin(Math.PI*q);f.footW=1;
  f.footLift=DRIBBLE.soleLift-.02;f.yawScale=.55;f.press=.5*Math.sin(Math.PI*q);
 }else{ // push away in the new direction; the boot lifts off
  const q=smooth((p-.78)/.22);f.ballYaw=f.toYaw;f.ballDist=DRIBBLE.drag+(DRIBBLE.contact-DRIBBLE.drag)*q;f.footW=1-q;
  f.footLift=DRIBBLE.soleLift+.04*q;f.yawScale=1;f.press=0;
 }
 f.footToe=(.12+.12*Math.sin(Math.PI*clamp01((p-.22)/.56)))*f.footW;
 if(p>=1){
  f.move=MOVE_ROLL;f.cooldown=DRIBBLE.cooldown+.1;f.ballYaw=f.toYaw;f.foot=0;
  // The push out of the turn is a touch by the dragging boot: the rhythm restarts from it.
  f.touchStep=Math.floor(stepF);f.touchSide=f.side;f.perTouch=stepsPerTouch(speed,1);f.push=pushFor(speed,f.reduced);f.style=TOUCH_LACES;f.cutRef=f.toYaw;f.cutSign=0;
 }
}
