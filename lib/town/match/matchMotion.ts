/**
 * Live-match body motion (Nov 4 2026, ahead of "join a live game", docs/join-live-game-design.md): small pure helpers the render
 * layer uses so the match players (and later the human in the match) move like footballers. No three.js, no allocation per call:
 * every stateful helper mutates one object owned by its rig. Runtime cost: a handful of multiplies per posed player per frame.
 *
 * Teaching purpose: what a coach asks of a young player's body. Turn the hips before the ball arrives, slow down to take it,
 * put a foot on it (sole control) when there is time, run with longer and quicker steps as the pace builds, and plant the
 * support foot before the strike.
 *
 *  - Turning: the body yaw eases toward its target but never faster than a speed-dependent maximum turn rate, with a short
 *    angular acceleration (slow-in / slow-out). A sprinter turns in a wider arc than a player at walking pace; a strike or a
 *    first touch may turn quickly (the set-up is part of the action).
 *  - Stride: stride length and cadence follow the actual speed (the rig drives its gait phase from travelled distance, so the
 *    feet never skate); `gaitStride` is the single formula the rig uses.
 *  - Control: a tiny state machine per receiver: approach → cushion (the sim's first touch) → sole (the foot steps on the ball and
 *    holds it for a beat) → carry. A receiver arriving fast takes the ball in stride instead (no stop, the touch rolls ahead).
 */

const clamp01=(v:number)=>v<0?0:v>1?1:v;
const smooth=(v:number)=>{const x=clamp01(v);return x*x*(3-2*x);};
const wrap=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));

export const MOTION={
 /** Max body turn rate (rad/s) standing / walking, and at a full sprint (`sprintSpeed` m/s and above). */
 turnSlow:13,turnSprint:5.2,sprintSpeed:5,
 /** A strike, a wind-up or a first touch may turn this fast (the action owns the timing; never later than the contact). */
 turnAction:22,
 /** Angular acceleration (rad/s²): the turn builds up over ~.15 s instead of snapping to full rate. */
 turnAccel:85,turnAccelAction:420,
 /** Sole control: only when the receiver comes out of the cushion at or below this speed (m/s); faster = a touch in stride. */
 soleMaxSpeed:1.5,
 /** Seconds the control phase stays "sole" (the rig's own hold is in lib/town/dribbleStop.ts). */
 soleHold:.6,
 /** A receiver arriving slowly keeps to this walking pace (m/s) through the first touch (matchSim.receiveSettle), so he can
  *  stop and put a foot on the ball; arriving faster than twice it he takes the ball in stride. */
 settleSpeed:.95,
} as const;

/** matchSim.receiveSettle (sim units/s) for a pitch `widthMetres` wide (250 sim units across) played at `timeScale`. */
export const settlePace=(widthMetres:number,timeScale:number)=>widthMetres>0&&timeScale>0?MOTION.settleSpeed/(widthMetres/250*timeScale):0;

/** Max body turn rate (rad/s) at `speed` m/s; `agility` is the profile's (≈.9 … 1.15); `action` = a strike / first touch. */
export function maxTurnRate(speed:number,agility=1,action=false){
 if(action)return MOTION.turnAction*agility;
 return (MOTION.turnSlow+(MOTION.turnSprint-MOTION.turnSlow)*smooth(speed/MOTION.sprintSpeed))*agility;
}

export type YawState={yaw:number;rate:number};
export function createYawState(yaw=0):YawState{return {yaw,rate:0};}

/**
 * One frame of a turn: the wanted rate is the exponential ease (`smoothing` per second, the rig's old behaviour) toward `target`,
 * capped at `maxRate`, reached with at most `accel` rad/s². Never overshoots the target. dt <= 0 holds.
 */
export function stepYaw(s:YawState,target:number,dt:number,smoothing:number,maxRate:number,accel:number){
 if(!(dt>0))return s.yaw;
 const delta=wrap(target-s.yaw);
 // The exact exponential step expressed as a rate, so a small turn keeps the rig's familiar ease-out.
 let want=delta*(1-Math.exp(-dt*smoothing))/dt;
 if(want>maxRate)want=maxRate;else if(want< -maxRate)want=-maxRate;
 const dv=accel*dt;
 s.rate=want>s.rate+dv?s.rate+dv:want<s.rate-dv?s.rate-dv:want;
 // Arriving: never carry the rate past the target (a reversal keeps its momentum for the few frames it takes to slow).
 let step=s.rate*dt;
 if(step*delta>0&&Math.abs(step)>Math.abs(delta)){step=delta;s.rate=delta/dt;}
 s.yaw+=step;
 return s.yaw;
}

/**
 * The rig's stride length (m per two steps, before reach limits): longer as the run builds, shorter while compact (backpedal,
 * shuffle, defending), with the ball, when accelerating hard (short quick drive steps), backpedalling or setting up a cut.
 */
export function gaitStride(run:number,compact:number,dribbling:boolean,drive:number,backpedal:number,strideScale:number,cut:number,opening:number){
 return (1.1+.8*run)*(1-.38*compact)*(dribbling?.82:1)*(1-.14*Math.max(0,drive))*(1-.4*backpedal)*strideScale*(1-.12*Math.abs(cut)-.15*opening);
}
/** Steps per second at `speed` m/s for a stride (two steps per stride). */
export const gaitCadence=(speed:number,stride:number)=>stride>0?2*speed/stride:0;

export const CONTROL_IDLE=0,CONTROL_APPROACH=1,CONTROL_CUSHION=2,CONTROL_SOLE=3,CONTROL_CARRY=4;
export type ControlState={phase:number;t:number;side:number;fired:boolean};
export function createControlState():ControlState{return {phase:CONTROL_IDLE,t:0,side:1,fired:false};}
export type ControlInput={
 /** The ball is coming to this player (pass target or interceptor). */
 approaching:boolean;
 /** The sim's first-touch cushion is running for this player. */
 cushion:boolean;
 /** This player has the ball at his feet. */
 owner:boolean;
 /** A wind-up or strike is running (a first-time pass skips the sole). */
 striking:boolean;
 /** The rig's speed (m/s) and the receiving foot (-1 left, +1 right). */
 speed:number;foot:number;
};

/**
 * One frame of the receiver's control state machine. Returns the sole-control foot (-1 / +1) while the sole phase lasts (from the
 * frame the cushion ends), else 0. The host passes it to the rig (PlayerMotion.soleControl); the rig reads it once, on the frame
 * its close-control footwork starts, and runs the stop in dribbleStop.ts (startSoleControl).
 */
export function stepControl(s:ControlState,dt:number,i:ControlInput):number{
 if(dt>0)s.t+=dt;
 if(i.striking){if(s.phase!==CONTROL_IDLE){s.phase=CONTROL_CARRY;}return 0;}
 switch(s.phase){
  case CONTROL_IDLE:case CONTROL_CARRY:
   if(i.cushion){s.phase=CONTROL_CUSHION;s.t=0;s.side=i.foot<0?-1:1;s.fired=false;}
   else if(i.approaching){s.phase=CONTROL_APPROACH;s.t=0;}
   else if(!i.owner)s.phase=CONTROL_IDLE;
   return 0;
  case CONTROL_APPROACH:
   if(i.cushion){s.phase=CONTROL_CUSHION;s.t=0;s.side=i.foot<0?-1:1;s.fired=false;}
   else if(!i.approaching&&!i.owner)s.phase=CONTROL_IDLE;
   return 0;
  case CONTROL_CUSHION:
   if(i.cushion)return 0;
   if(!i.owner){s.phase=CONTROL_IDLE;return 0;}
   s.t=0;
   if(i.speed<=MOTION.soleMaxSpeed&&!s.fired){s.phase=CONTROL_SOLE;s.fired=true;return s.side;}
   s.phase=CONTROL_CARRY;return 0;
  case CONTROL_SOLE:
   if(!i.owner){s.phase=CONTROL_IDLE;return 0;}
   if(i.cushion){s.phase=CONTROL_CUSHION;s.t=0;s.side=i.foot<0?-1:1;s.fired=false;return 0;}
   if(s.t>=MOTION.soleHold){s.phase=CONTROL_CARRY;return 0;}
   return s.side;
 }
 return 0;
}
