/**
 * Cinematic beats (round 3, Oct 26 2026): a tiny, allocation-free director for Pass Puzzles.
 *
 * It owns three numbers the game reads every frame:
 *   timeScale  0.3..1   how fast the sim runs (slow-mo on the strike and at the arrival)
 *   push       0..MAX   how far the broadcast camera leans in (scene.setReplayFocus amount)
 *   focus      {x,z}    where it leans (moves with a capped speed: a gentle whip, never a jump)
 *
 * Beats: 'intro' (freeze-frame tour: carrier, then the free teammate), 'strike', 'arrive' (the ball
 * reaches the receiver or a defender), 'goal', 'miss', 'hint'. Every beat has a hard real-time cap, the
 * slow-mo of one attempt is budgeted (SLOW_BUDGET), and skip() returns to 1x and wide at once, so a beat
 * never blocks a retry. Reduced motion: no slow-mo and no push at all (a plain cut).
 *
 * Motion-sickness rules: damped push (no overshoot), capped focus speed, no roll; the scene maps push to
 * camera zoom 1 + push*0.18, so MAX_PUSH 0.65 keeps the field-of-view change under 12%.
 */
export type CineBeat='intro'|'strike'|'arrive'|'goal'|'miss'|'hint';
type BeatSpec={slow:number;hold:number;push:number};
export const MAX_PUSH=.65,MIN_SCALE=.3,SLOW_BUDGET=1.6,FOCUS_SPEED=26,PUSH_RATE=4,SCALE_RATE=5,ZOOM_PER_PUSH=.18;
export const BEATS:Record<CineBeat,BeatSpec>={
  intro:{slow:1,hold:.75,push:.5},
  strike:{slow:.4,hold:.32,push:.35},
  arrive:{slow:.45,hold:.38,push:.5},
  goal:{slow:.5,hold:.8,push:.6},
  miss:{slow:.6,hold:.6,push:.5},
  hint:{slow:1,hold:.9,push:.3},
};
export type Cinematic={
  readonly timeScale:number;readonly push:number;readonly focus:{x:number;z:number};
  /** True while anything is still moving (the render loop keeps frames only while true). */
  readonly active:boolean;readonly beat:CineBeat|null;
  /** Start a beat at a pitch point (replaces the current one). */
  play(kind:CineBeat,x:number,z:number):void;
  /** Intro tour: up to 3 stops (filled in place, no arrays kept). */
  intro(ax:number,az:number,bx?:number,bz?:number):void;
  /** While the ball flies: keep the focus on it (only moves the target; capped speed applies). */
  follow(x:number,z:number):void;
  update(dt:number):boolean;
  skip():void;
  /** New attempt: the slow-mo budget refills. */
  resetBudget():void;
  setReduced(on:boolean):void;
};
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;

export function createCinematic(reduced=false):Cinematic{
  let timeScale=1,push=0,hold=0,targetSlow=1,targetPush=0,budget=SLOW_BUDGET,beat:CineBeat|null=null,isReduced=reduced,following=false;
  const focus={x:0,z:0},target={x:0,z:0};
  // The intro's second stop (the free teammate), kept as plain numbers.
  let nextX=0,nextZ=0,hasNext=false;
  const start=(kind:CineBeat,x:number,z:number,snap:boolean)=>{
    if(isReduced){beat=null;timeScale=1;push=0;targetPush=0;targetSlow=1;hold=0;return;}
    const b=BEATS[kind];beat=kind;hold=b.hold;targetPush=Math.min(MAX_PUSH,b.push);
    targetSlow=budget>0?Math.max(MIN_SCALE,b.slow):1;target.x=x;target.z=z;following=false;
    if(snap||push<.02){focus.x=x;focus.z=z;}
  };
  const api:Cinematic={
    get timeScale(){return timeScale;},get push(){return push;},focus,
    get active(){return hold>0||push>.002||timeScale<.999||hasNext;},
    get beat(){return beat;},
    play(kind,x,z){start(kind,x,z,false);},
    intro(ax,az,bx,bz){hasNext=bx!==undefined&&bz!==undefined&&!isReduced;nextX=bx??0;nextZ=bz??0;start('intro',ax,az,true);},
    follow(x,z){if(isReduced)return;target.x=x;target.z=z;following=true;},
    update(dt){
      if(dt<=0)return api.active;dt=Math.min(dt,.1);
      if(hold>0){hold=Math.max(0,hold-dt);if(timeScale<1)budget=Math.max(0,budget-dt);
        if(hold===0){if(hasNext){hasNext=false;start('intro',nextX,nextZ,false);}else{targetSlow=1;targetPush=0;beat=null;}}
        if(budget<=0)targetSlow=1;}
      // Ease time back toward the target (exponential, no overshoot).
      timeScale+= (targetSlow-timeScale)*Math.min(1,dt*SCALE_RATE);if(Math.abs(timeScale-targetSlow)<.002)timeScale=targetSlow;
      timeScale=clamp(timeScale,MIN_SCALE,1);
      // Push: damped toward the target with a capped rate.
      const dp=targetPush-push,maxStep=dt*PUSH_RATE*.4;push+=clamp(dp*Math.min(1,dt*PUSH_RATE),-maxStep,maxStep);if(Math.abs(targetPush-push)<.002)push=targetPush;
      push=clamp(push,0,MAX_PUSH);
      // Focus: capped speed (m/s), a gentle whip along the pass lane.
      const fx=target.x-focus.x,fz=target.z-focus.z,d=Math.hypot(fx,fz),step=FOCUS_SPEED*dt*(following?1.2:1);
      if(d<=step){focus.x=target.x;focus.z=target.z;}else{focus.x+=fx/d*step;focus.z+=fz/d*step;}
      return api.active;
    },
    skip(){hold=0;hasNext=false;beat=null;timeScale=1;targetSlow=1;push=0;targetPush=0;following=false;},
    resetBudget(){budget=SLOW_BUDGET;},
    setReduced(on){isReduced=on;if(on)api.skip();},
  };
  return api;
}
/** The camera zoom a push maps to (scene.setReplayFocus): never more than +12%. */
export const zoomFor=(push:number)=>1+clamp(push,0,MAX_PUSH)*ZOOM_PER_PUSH;
