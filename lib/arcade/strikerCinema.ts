/** Island Strikers cinematic beats (round 3, Oct 26 2026, owner: "dynamic camera, cinematic moments", docs/ARCADE_STRIKERS_R3_OCT26.md).
 *  A tiny pure state machine, no THREE and no allocation per frame: the match loop triggers a beat on a football moment, steps it with
 *  REAL seconds, feeds `timeScale` into the sim (strikerMatch state.cinemaScale) and lets strikerScene read the camera blend.
 *
 *  - through: the kid is clean through on goal. A short slow-mo set-up (.35x for at most .6 s real), a low 3/4 push-in behind the
 *    striker, then back to 1x. The kid still has the ball, so input stays live (charge fills in real time in the sim).
 *  - charge: winding up a shot in the attacking half: the same low angle, no extra slow-mo (the sim's own charge slow-mo does that).
 *  - setpiece: our free kick / penalty / corner: low angle behind the ball while it is set up.
 *  - strike: the release: the camera whips after the ball toward goal, then pulls wide.
 *  - goal: push-in on the scorer; save: a quick push on the keeper; tackle: a short punch-in.
 *  - kickoff / fulltime: sweeping wide shots (a lateral glide, zoomed a touch out).
 *
 *  Never annoying: one slow-mo per CINEMA_SLOW_GAP seconds, every beat capped at CINEMA_MAX_LEN, small beats rate-limited, a lower
 *  priority beat never interrupts a higher one, skip() ends it at once (tap to skip). Reduced motion: nothing triggers (no slow-mo, no
 *  zoom). No motion sickness: smoothstep envelopes, no roll, zoom within ±CINEMA_ZOOM_CAP (12%), push-ins are a capped dolly toward
 *  a look point that stays between the player and the goal (strikerScene keeps ball and goal on screen). */
export type CinemaBeat='through'|'charge'|'setpiece'|'strike'|'goal'|'save'|'tackle'|'kickoff'|'fulltime';
type Spec={len:number;slow:number;slowFor:number;zoom:number;dolly:number;low:number;sweep:number;pri:number;gap:number};
export const CINEMA_SLOW_GAP=8,CINEMA_MIN_SCALE=.3,CINEMA_MAX_SLOW=.9,CINEMA_MAX_LEN=2.4,CINEMA_ZOOM_CAP=.12,CINEMA_RAMP_IN=.14,CINEMA_RAMP_OUT=.28;
export const CINEMA_SPECS:Record<CinemaBeat,Spec>={
 through:{len:1.25,slow:.35,slowFor:.6,zoom:.08,dolly:.42,low:.85,sweep:0,pri:3,gap:6},
 charge:{len:.8,slow:1,slowFor:0,zoom:.06,dolly:.3,low:.75,sweep:0,pri:3,gap:0},
 setpiece:{len:1.8,slow:1,slowFor:0,zoom:.06,dolly:.34,low:1,sweep:0,pri:3,gap:2},
 strike:{len:1,slow:1,slowFor:0,zoom:.04,dolly:.22,low:.35,sweep:0,pri:4,gap:0},
 goal:{len:1.7,slow:1,slowFor:0,zoom:.1,dolly:.4,low:.45,sweep:0,pri:5,gap:0},
 save:{len:.75,slow:1,slowFor:0,zoom:.08,dolly:.26,low:.2,sweep:0,pri:4,gap:2},
 tackle:{len:.5,slow:1,slowFor:0,zoom:.05,dolly:.14,low:0,sweep:0,pri:2,gap:3},
 kickoff:{len:1.8,slow:1,slowFor:0,zoom:-.1,dolly:0,low:0,sweep:-1,pri:1,gap:0},
 fulltime:{len:2.2,slow:1,slowFor:0,zoom:-.1,dolly:0,low:0,sweep:1,pri:5,gap:0},
};
const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};

export function createStrikerCinema(options:{reduced:boolean}){
 let spec:Spec|null=null,t=0,len=0,slowLeft=0,depth=0,slowTarget=1,clock=0,lastSlow=-1e9,released=false;
 const last:Record<string,number>={};
 const c={reduced:options.reduced,beat:'' as CinemaBeat|'',timeScale:1,amount:0,zoom:1,dolly:0,low:0,sweep:0,tx:0,tz:0,gx:0,gz:0,slowCount:0,
  /** Starts a beat at (x,z) looking toward (gx,gz) (defaults to the point itself). Returns whether it plays. */
  trigger(beat:CinemaBeat,x:number,z:number,gx=x,gz=z){
   if(c.reduced)return false;const s=CINEMA_SPECS[beat];
   if(c.beat===beat&&spec){if(beat==='charge'){t=Math.min(t,len-.45);c.tx+=(x-c.tx)*.5;c.tz+=(z-c.tz)*.5;c.gx=gx;c.gz=gz;return true;}return false;}
   if(spec&&s.pri<spec.pri&&c.amount>.05)return false;
   if(s.gap&&clock-(last[beat]??-1e9)<s.gap)return false;
   const wantsSlow=s.slow<1&&clock-lastSlow>=CINEMA_SLOW_GAP;
   if(s.slow<1&&!wantsSlow&&beat==='through')return false;// a through beat is only worth it with its slow-mo
   spec=s;c.beat=beat;t=0;len=Math.min(CINEMA_MAX_LEN,s.len);released=false;last[beat]=clock;
   c.tx=x;c.tz=z;c.gx=gx;c.gz=gz;
   if(wantsSlow){slowLeft=Math.min(CINEMA_MAX_SLOW,s.slowFor);slowTarget=Math.max(CINEMA_MIN_SCALE,s.slow);lastSlow=clock;c.slowCount++;}else slowLeft=0;
   return true;},
  /** Moves the look target (the ball after a strike); damped in update(). */
  follow(x:number,z:number){c.gx=x;c.gz=z;},
  /** The action happened (shot released): slow-mo ramps back to 1x now, the camera keeps its beat. */
  release(){released=true;slowLeft=0;},
  /** Tap to skip: back to normal play at once. */
  skip(){spec=null;c.beat='';t=len=0;slowLeft=0;depth=0;c.timeScale=1;c.amount=0;c.zoom=1;c.dolly=c.low=c.sweep=0;},
  /** Real seconds. Eases the time scale and the camera blend; no allocation. */
  update(dt:number){
   dt=Math.max(0,Math.min(.1,dt));clock+=dt;
   // Slow-mo depth 0..1: ramps in, holds while slowLeft (real seconds, capped) lasts, then ramps back to 1x. Floor CINEMA_MIN_SCALE.
   if(slowLeft>0){slowLeft-=dt;depth=Math.min(1,depth+dt/CINEMA_RAMP_IN);}else depth=Math.max(0,depth-dt/CINEMA_RAMP_OUT);
   c.timeScale=depth>0?1-(1-slowTarget)*smooth(depth):1;
   if(!spec){c.amount=0;c.zoom=1;c.dolly=c.low=c.sweep=0;return c;}
   t+=dt;const s=spec;
   // Camera envelope: in over .3 s, out over the last .45 s.
   const env=Math.min(smooth(t/.3),smooth((len-t)/.45));
   c.amount=env;c.zoom=1+Math.max(-CINEMA_ZOOM_CAP,Math.min(CINEMA_ZOOM_CAP,s.zoom))*env;c.dolly=s.dolly*env;c.low=s.low*env*(released&&c.beat!=='strike'?.6:1);
   c.sweep=s.sweep?s.sweep*(s.sweep<0?1-smooth(t/len):smooth(t/len)):0;
   if(t>=len){spec=null;c.beat='';c.amount=0;c.zoom=1;c.dolly=c.low=c.sweep=0;}
   return c;},
  /** True while a slow-mo is easing (tests, HUD). */
  get slowing(){return c.timeScale<.999;},
 };
 return c;
}
export type StrikerCinema=ReturnType<typeof createStrikerCinema>;
