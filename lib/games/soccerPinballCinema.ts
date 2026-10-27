import type {PinballState} from './soccerPinball';
import type {PinballShot} from './soccerPinballCamera';

/* Futbol Pinball cinematic beats (round 3, Oct 26 2026, docs/ARCADE_PINBALL_R3_OCT26.md).
 *
 * A beat is a short camera push (dolly toward an anchor) with an optional slow-motion set-up:
 *   keeper   ball about to reach the goal / keeper     slow .4x  .70 s  push on the goal mouth
 *   launch   a charged plunger release (>= 86%)         slow .5x  .55 s  follow the ball up the lane
 *   save     the goal-line saver clears a ball          slow .4x  .60 s  push on the saver
 *   target   a shot starts multiball / drops in the dugout scoop / hits the skill shot   slow .5x .60 s
 *   drain    "bullet time": a falling ball clips a resting flipper tip   slow .3x .50 s  follow the ball
 *   goal     replay-style push on the net (the sim is already stopped)   no slow  1.2 s
 *   mode     a bonus mode starts: sweep from the goal down the table and back   no slow  1.6 s
 *
 * Caps so it is never annoying: one beat at a time; slow-motion beats at most once per SLOW_GAP (6 s of real time);
 * camera-only beats at most once per CAM_GAP. Skip: any flipper press (pinball's tap anywhere is a flipper press)
 * ends the slow-mo on the spot, so the bats are never slowed while a kid is playing them, and the camera eases back.
 * Reduced motion: nothing ever triggers. Camera limits live in soccerPinballCamera (damped, rate-capped, no roll,
 * no FOV change; the live ball is always kept above the thumb pads by its safety pass). No allocation per frame.
 */

export type CinemaKind='keeper'|'launch'|'save'|'target'|'drain'|'goal'|'mode';
type BeatSpec={slow:number;dur:number;k:number;follow:boolean};
export const CINEMA_BEATS:Record<CinemaKind,BeatSpec>={
 keeper:{slow:.4,dur:.7,k:.26,follow:false},
 launch:{slow:.5,dur:.55,k:.2,follow:true},
 save:{slow:.4,dur:.6,k:.24,follow:false},
 target:{slow:.5,dur:.6,k:.22,follow:true},
 drain:{slow:.3,dur:.5,k:.26,follow:true},
 goal:{slow:1,dur:1.2,k:.34,follow:false},
 mode:{slow:1,dur:1.6,k:.12,follow:false},
};
export const SLOW_GAP=6, CAM_GAP=2.5, SLOW_IN=.1, EASE_OUT=.3, SKIP_OUT=.25;

export type PinballCinema={
 kind:CinemaKind|null;age:number;dur:number;slow:number;k:number;follow:boolean;ax:number;ay:number;az:number;
 /** Real-time clock; and when the last slow / camera beat started. */
 clock:number;lastSlow:number;lastCam:number;
 /** >0 while a skipped beat's camera eases out (seconds left). */
 skipped:number;
 enabled:boolean;
 /** Diff memory for the watcher (counters seen last frame). */
 seen:{phase:PinballState['phase'];saver:number;mb:number;dugout:number;skill:number;tip:number;mode:number;hit:number;shotArmed:boolean};
 count:number;
};
export function createPinballCinema(reduced=false):PinballCinema{
 return{kind:null,age:0,dur:0,slow:1,k:0,follow:false,ax:0,ay:0,az:0,clock:0,lastSlow:-99,lastCam:-99,skipped:0,enabled:!reduced,
  seen:{phase:'ready',saver:0,mb:0,dugout:0,skill:0,tip:0,mode:0,hit:0,shotArmed:true},count:0};
}
export function resetPinballCinema(c:PinballCinema){c.kind=null;c.age=c.dur=c.k=c.skipped=0;c.slow=1;c.lastSlow=c.lastCam=-99;c.seen.phase='ready';c.seen.shotArmed=true;}
const wx=(x:number)=>(x-180)/30,wz=(y:number)=>(y-310)/30;
/** Start a beat if the caps allow it. Returns true when it started. */
export function triggerCinema(c:PinballCinema,kind:CinemaKind,x:number,y:number):boolean{
 if(!c.enabled)return false;
 const spec=CINEMA_BEATS[kind],slow=spec.slow<1;
 if(c.kind&&!(kind==='goal'&&c.kind!=='goal'))return false;
 if(slow?c.clock-c.lastSlow<SLOW_GAP:c.clock-c.lastCam<CAM_GAP)return false;
 c.kind=kind;c.age=0;c.dur=spec.dur;c.slow=spec.slow;c.k=spec.k;c.follow=spec.follow;c.skipped=0;
 c.ax=wx(x);c.az=wz(y);c.ay=kind==='goal'||kind==='keeper'?.8:0;
 if(slow)c.lastSlow=c.clock;else c.lastCam=c.clock;c.count++;
 return true;
}
/** Flipper press / tap: the slow-mo ends now; the camera eases back over SKIP_OUT. */
export function skipCinema(c:PinballCinema){if(!c.kind||c.skipped>0)return;c.slow=1;c.skipped=SKIP_OUT;}
/** 0..1 envelope: quick in, hold, ease out over the last EASE_OUT of the beat (or the skip). */
export function cinemaWeight(c:PinballCinema){
 if(!c.kind)return 0;
 if(c.skipped>0)return Math.min(1,c.age/SLOW_IN)*(c.skipped/SKIP_OUT);
 const inn=Math.min(1,c.age/SLOW_IN),out=Math.min(1,Math.max(0,(c.dur-c.age)/(c.dur*EASE_OUT)));
 const w=Math.min(inn,out);return w*w*(3-2*w);
}
/** Simulation time scale for this frame (1 = normal). Flippers are never slowed: a press calls skipCinema first. */
export function cinemaTimeScale(c:PinballCinema){if(!c.kind||c.slow>=1)return 1;return 1-(1-c.slow)*cinemaWeight(c);}
export function cinemaActive(c:PinballCinema){return c.kind!==null;}
/** Advance by REAL dt (not slowed). */
export function stepPinballCinema(c:PinballCinema,dt:number,s:PinballState){
 c.clock+=dt;
 if(!c.kind)return;
 c.age+=dt;
 if(c.follow&&s.phase==='playing'){c.ax=wx(s.ball.x);c.az=wz(s.ball.y);}
 if(c.skipped>0){c.skipped=Math.max(0,c.skipped-dt);if(c.skipped===0)c.kind=null;return;}
 if(c.age>=c.dur){c.kind=null;c.slow=1;}
}
/** Blend the beat into the camera's wanted shot (called after pinballShot). */
export function cinemaShot(c:PinballCinema,out:PinballShot){
 const w=cinemaWeight(c);if(w<=0)return out;
 let ax=c.ax,az=c.az,k=c.k;
 if(c.kind==='mode'){// Sweep: goal end -> flippers -> back, a slow look over the whole table.
  const t=Math.min(1,c.age/c.dur);az=wz(90)+(wz(470)-wz(90))*Math.sin(Math.PI*t);ax=.42;}
 out.k=out.k+(k-out.k)*w;out.ax=out.ax+(ax-out.ax)*w;out.az=out.az+(az-out.az)*w;out.ay=out.ay+(c.ay-out.ay)*w;out.tilt*=1-w;
 if(w>.3)out.name='cinema';
 return out;
}
/** Watch the game state for beat moments (diffs counters; call once per frame after stepPinball). */
export function watchPinballCinema(c:PinballCinema,s:PinballState){
 const n=c.seen,t=s.table.sfx,b=s.ball;
 if(c.enabled){
  if(n.phase==='ready'&&s.phase==='playing'&&s.launchPower>=.86)triggerCinema(c,'launch',b.x,b.y);
  if(s.phase==='goal'&&n.phase!=='goal')triggerCinema(c,'goal',s.hitX,60);
  else if(s.hitId!==n.hit&&s.cue==='mbGoal')triggerCinema(c,'goal',s.hitX,60);
  if(t.saver>n.saver)triggerCinema(c,'save',180,560);
  if(t.mode>n.mode)triggerCinema(c,'mode',180,300);
  if(s.stats.mbStarts>n.mb&&s.level<6||t.dugout>n.dugout||t.skill>n.skill)triggerCinema(c,'target',b.x,b.y);
  if(s.sfx.tip>n.tip)triggerCinema(c,'drain',b.x,b.y);
  // A shot about to reach the goal: rising fast in the top third, heading inside the posts, under .35 s away.
  if(s.phase==='playing'&&b.x<341){
   if(b.vy>0)n.shotArmed=true;
   else if(n.shotArmed&&b.vy<-300&&b.y<230&&b.y>100){const eta=(83-b.y)/b.vy,x=b.x+b.vx*eta;if(eta<.35&&x>104&&x<256){n.shotArmed=false;triggerCinema(c,'keeper',x,83);}}
  }
 }
 n.phase=s.phase;n.saver=t.saver;n.mb=s.stats.mbStarts;n.dugout=t.dugout;n.skill=t.skill;n.tip=s.sfx.tip;n.mode=t.mode;n.hit=s.hitId;
}
