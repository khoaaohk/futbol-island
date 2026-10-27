/** Futbol Tennis cinematic beats (round 3, Oct 26 2026). A tiny, allocation-free director that the frame loop asks
 * each frame for four numbers: the game-clock scale (slow motion), how far to swing into the close 3/4 shot, how far
 * the look target has whipped from the player to the ball, and a gentle dolly push-in. Pure (no three.js), so tests
 * drive it directly.
 *
 * Rules that keep it from ever being annoying or sickening:
 * - Slow motion only AFTER your own strike (the ball is leaving you), never while the rival's return is coming or
 *   while you hold a wind-up (the charge window runs on game time, so slowing it would move the gold band). Input stays
 *   live: the stick and buttons work in slow-mo, and any tap skips the beat.
 * - Hard caps: one slow-mo per TENNIS_BEAT.slowGap seconds, one push-in per pushGap, slow part ≤ slowMax s real time,
 *   scale never below slowScale, and every curve is a smoothstep (bounded camera speed, no roll, no FOV punch: the
 *   push is a ≤ pushMax dolly toward the subject).
 * - Reduced motion: no slow-mo, no close-up, no push; a beat becomes a short `flash` (0..1) for a light flare only. */
export const TENNIS_BEAT={slowScale:.3,slowMin:.4,slowMax:.7,rampIn:.07,rampOut:.35,slowGap:6,pushGap:2.5,pushTime:.9,pushMax:.1,close:.62,serveClose:.42,flashTime:.35} as const;
export type TennisBeatKind=''|'strike'|'push';
export type TennisBeatState={scale:number;close:number;follow:number;push:number;flash:number;kind:TennisBeatKind};
const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/Math.max(1e-6,b-a)));return x*x*(3-2*x);};

export function createTennisCinema(reduced:boolean){
 const out:TennisBeatState={scale:1,close:0,follow:0,push:0,flash:0,kind:''};
 let clock=0,kind:TennisBeatKind='',age=0,hold=0,power=0,lastSlow=-99,lastPush=-99,pushAge=9,pushPower=0,flashAge=9,windup=0,skipped=false,exitScale=1,exitClose=0;
 /** Your strike. `strength` 0..1 (a sweet power strike or a golden touch is 1, a slam ~.8). Returns true if a slow-mo
  * beat started (false = capped or reduced motion: the caller keeps its plain hit-stop). */
 function strike(strength:number){
  if(reduced){flashAge=0;return false;}
  if(clock-lastSlow<TENNIS_BEAT.slowGap)return push(strength*.7);
  kind='strike';age=0;skipped=false;power=Math.max(0,Math.min(1,strength));hold=TENNIS_BEAT.slowMin+(TENNIS_BEAT.slowMax-TENNIS_BEAT.slowMin)*power;lastSlow=clock;return true;}
 /** A short push-in + settle (match point, ace, save, long rally). Capped; ignored during a strike beat. */
 function push(strength=1){
  if(reduced){flashAge=0;return false;}
  if(kind==='strike'||clock-lastPush<TENNIS_BEAT.pushGap)return false;
  pushAge=0;pushPower=Math.max(.3,Math.min(1,strength));lastPush=clock;return true;}
 /** Any tap: hand the clock straight back (a quick .12 s ramp from wherever the beat is). */
 function skip(){if(kind==='strike'&&!skipped){skipped=true;exitScale=out.scale;exitClose=out.close;age=0;}pushAge=Math.max(pushAge,TENNIS_BEAT.pushTime*.7);}
 /** Call once per real frame. `charging`: you hold a wind-up; `serving`: it is your serve; `rivalBall`: the rival has
  * struck and the ball is coming to you (the critical return: any slow-mo is cancelled at once). */
 function update(dt:number,charging:boolean,serving:boolean,rivalBall:boolean){
  clock+=dt;
  if(kind==='strike'&&rivalBall&&!skipped)skip();
  if(kind==='strike'){age+=dt;
   if(skipped){const k=smooth(0,.12,age);out.scale=exitScale+(1-exitScale)*k;out.close=exitClose*(1-k);out.follow=1;if(k>=1){kind='';}}
   else{const end=hold+TENNIS_BEAT.rampOut;
    out.scale=age<TENNIS_BEAT.rampIn?1-(1-TENNIS_BEAT.slowScale)*smooth(0,TENNIS_BEAT.rampIn,age):age<hold?TENNIS_BEAT.slowScale:TENNIS_BEAT.slowScale+(1-TENNIS_BEAT.slowScale)*smooth(hold,end,age);
    out.close=Math.max(windup,TENNIS_BEAT.close*(.75+.25*power)*(1-smooth(hold*.45,end,age)));
    out.follow=smooth(.04,hold*.9,age); // whip pan from you to the ball as it leaves
    if(age>=end){kind='';out.scale=1;}}
  }
  if(kind!=='strike'){out.scale=1;out.follow=Math.max(0,out.follow-dt*3);
   // Wind-up: on your serve, swing gently into the 3/4 shot; in a rally only a small dolly (you must see the ball).
   const want=reduced?0:charging&&serving?TENNIS_BEAT.serveClose:0;windup+=(want-windup)*Math.min(1,dt*4);out.close=windup;}
  else windup=Math.max(0,windup-dt*2);
  pushAge+=dt;const pIn=smooth(0,.25,pushAge),pOut=1-smooth(.45,TENNIS_BEAT.pushTime,pushAge);
  const rallyWind=reduced||serving?0:charging?.35:0;
  out.push=reduced?0:Math.min(1,Math.max(pIn*pOut*pushPower,rallyWind))*TENNIS_BEAT.pushMax;
  flashAge+=dt;out.flash=flashAge<TENNIS_BEAT.flashTime?1-flashAge/TENNIS_BEAT.flashTime:0;
  out.kind=kind||(out.push>0?'push':'');
  return out;}
 function active(){return kind!==''||windup>.002||out.follow>0||pushAge<TENNIS_BEAT.pushTime||flashAge<TENNIS_BEAT.flashTime;}
 function reset(){kind='';age=0;windup=0;pushAge=9;flashAge=9;skipped=false;out.scale=1;out.close=out.follow=out.push=out.flash=0;out.kind='';}
 return{strike,push,skip,update,active,reset,state:out,
  /** Seconds of real time since the last slow-mo (tests + debug). */
  sinceSlow:()=>clock-lastSlow};
}
