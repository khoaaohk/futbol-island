/**
 * The Time-Wasting Machine (backpass-1992): two tiny matches run side by side, one under the old law ("before 1992") and one
 * under the new one ("after 1992"). This file is the pure simulation, with no DOM, no timers and no randomness, so the
 * experience can step it from its sleeping animation loop and the Node test can step it too.
 *
 * Units: metres on our own half of the pitch (x 0..68 across, y 0..52.5 from the halfway line down to our goal line).
 * Time: real seconds in, match seconds out (SPEED match seconds pass per real second, so a short loop shows a long stall).
 */
export type Era='old'|'new';
export type Phase='idle'|'back'|'hold'|'roll'|'feet'|'out'|'foul'|'stolen'|'reset';
export type Target='W'|'M';
export type Pt={x:number;y:number};
export type Actor='K'|'D'|'W'|'M'|'S'|'A';
export type SimEvent='kick'|'catch'|'whistle'|'stolen'|'intercepted'|'good'|'idle';

export const PITCH={w:68,h:52.5};
export const SPEED=6;
export const START_CLOCK=88*60;
/** Phase lengths in real seconds. */
export const DUR={back:.9,hold:4.2,roll:.9,feet:3.4,out:.75,foul:2.6,stolen:1.8,reset:1};

const HOME:Record<Actor,Pt>={K:{x:34,y:50.3},D:{x:22,y:36},W:{x:8,y:17},M:{x:46,y:15},S:{x:34,y:25},A:{x:0,y:0}};
/** Their second player marks one of our two passing options; it alternates every round so the visitor has to look. */
const markSpot=(m:Target):Pt=>m==='M'?{x:48.5,y:17.5}:{x:10.5,y:19.5};
/** The ball sits at the defender's feet, not under the shirt number. */
const BALL_D:Pt={x:24.2,y:37.2};
const FEET_SPOT:Pt={x:34,y:48.6},WAIT_SPOT:Pt={x:34,y:34.5},PRESS_SPOT:Pt={x:34,y:46.8};

export type World={
 era:Era;phase:Phase;t:number;
 clock:number;wasted:number;chances:number;goodPasses:number;handballs:number;rounds:number;
 marked:Target;target:Target|null;thief:'S'|'A';
 pos:Record<Actor,Pt>;from:Record<Actor,Pt>;ball:Pt;ballFrom:Pt;held:boolean;
 last:SimEvent|null;
};
const copy=(p:Pt):Pt=>({x:p.x,y:p.y});
const homeOf=(a:Actor,marked:Target)=>a==='A'?markSpot(marked):HOME[a];
const allHome=(marked:Target)=>Object.fromEntries((['K','D','W','M','S','A'] as Actor[]).map(a=>[a,copy(homeOf(a,marked))])) as Record<Actor,Pt>;
const ease=(t:number)=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const lerp=(a:Pt,b:Pt,k:number):Pt=>({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k});

export function createWorld(era:Era):World{
 const pos=allHome('M');
 return {era,phase:'idle',t:0,clock:START_CLOCK,wasted:0,chances:0,goodPasses:0,handballs:0,rounds:0,marked:'M',target:null,thief:'S',
  pos,from:allHome('M'),ball:copy(BALL_D),ballFrom:copy(BALL_D),held:false,last:null};
}
const enter=(w:World,phase:Phase)=>{w.phase=phase;w.t=0;w.from=Object.fromEntries(Object.entries(w.pos).map(([k,v])=>[k,copy(v)])) as Record<Actor,Pt>;w.ballFrom=copy(w.ball);};
export const isBusy=(w:World)=>w.phase!=='idle';
export const freeTarget=(w:World):Target=>w.marked==='M'?'W':'M';

/** The defender knocks it back to the keeper. Returns false when this world is already busy. */
export function passBack(w:World):boolean{if(w.phase!=='idle')return false;w.rounds++;w.held=false;enter(w,'back');w.last='kick';return true;}
/** New law only, while the ball is at the keeper's feet: pass with the feet to a team-mate. */
export function footPass(w:World,target:Target):boolean{if(w.era!=='new'||w.phase!=='feet')return false;w.target=target;enter(w,'out');w.last='kick';return true;}
/** New law only: the keeper grabs the back-pass with the hands, which is an offence (indirect free kick). */
export function pickUp(w:World):boolean{if(w.era!=='new'||w.phase!=='feet')return false;w.held=true;w.handballs++;enter(w,'foul');w.last='whistle';return true;}

/** Advance one world by dt real seconds. Returns the event that happened on this step, if any. */
export function step(w:World,dt:number):SimEvent|null{
 if(w.phase==='idle')return null;
 w.last=null;w.t+=dt;w.clock+=dt*SPEED;
 const k=(d:number)=>Math.min(1,w.t/d),e=(d:number)=>ease(k(d));
 const move=(a:Actor,to:Pt,d:number)=>{w.pos[a]=lerp(w.from[a],to,e(d));};
 switch(w.phase){
  case 'back':{
   w.ball=lerp(w.ballFrom,w.era==='old'?{x:HOME.K.x,y:HOME.K.y-.4}:FEET_SPOT,e(DUR.back));
   move('S',w.era==='old'?WAIT_SPOT:{x:34,y:31},DUR.back);
   if(k(DUR.back)>=1){
    if(w.era==='old'){w.held=true;enter(w,'hold');return w.last='catch';}
    w.chances++;enter(w,'feet');return null;
   }
   return null;}
  case 'hold':{// Old law: the keeper picks it up and nobody may challenge. The whole hold is wasted time.
   w.wasted+=dt*SPEED;
   move('S',WAIT_SPOT,DUR.hold*.4);
   if(k(DUR.hold)>=1){w.held=false;enter(w,'roll');return w.last='kick';}
   return null;}
  case 'roll':{
   w.ball=lerp(w.ballFrom,BALL_D,e(DUR.roll));
   move('S',HOME.S,DUR.roll);
   if(k(DUR.roll)>=1){enter(w,'idle');w.pos=allHome(w.marked);w.ball=copy(BALL_D);return w.last='idle';}
   return null;}
  case 'feet':{// New law: ball at the keeper's feet, their striker presses. Too slow and it's gone.
   move('S',PRESS_SPOT,DUR.feet);
   if(k(DUR.feet)>=1){w.thief='S';enter(w,'stolen');return w.last='stolen';}
   return null;}
  case 'out':{
   const t=w.target??'W',marked=t===w.marked,end=marked?lerp(w.pos[t],w.pos.A,.6):w.pos[t];
   if(marked)move('A',lerp(w.from.A,w.pos[t],.55),DUR.out);
   w.ball=lerp(w.ballFrom,end,e(DUR.out));
   if(k(DUR.out)>=1){
    if(marked){w.thief='A';enter(w,'stolen');return w.last='intercepted';}
    w.goodPasses++;enter(w,'reset');return w.last='good';
   }
   return null;}
  case 'foul':{// Play stops for the free kick: that stoppage counts as time with no football.
   w.wasted+=dt*SPEED*.5;
   if(k(DUR.foul)>=1){w.held=false;enter(w,'reset');}
   return null;}
  case 'stolen':{
   const thief=w.thief;
   w.ball=lerp(w.ballFrom,{x:w.pos[thief].x,y:w.pos[thief].y+(thief==='S'?-.2:0)},e(DUR.stolen*.3));
   if(k(DUR.stolen)>=1)enter(w,'reset');
   return null;}
  case 'reset':{
   const next:Target=w.marked==='M'?'W':'M';
   for(const a of ['K','D','W','M','S','A'] as Actor[])move(a,homeOf(a,next),DUR.reset);
   w.ball=lerp(w.ballFrom,BALL_D,e(DUR.reset));
   if(k(DUR.reset)>=1){w.marked=next;w.target=null;w.held=false;enter(w,'idle');w.pos=allHome(next);w.ball=copy(BALL_D);return w.last='idle';}
   return null;}
 }
 return null;
}
/** How much of the striker's run is left (1 = just started, 0 = arrived), for the pressure ring. */
export const pressure=(w:World)=>w.phase==='feet'?Math.max(0,1-w.t/DUR.feet):0;
export const clockText=(s:number)=>{const m=Math.floor(s/60),r=Math.floor(s%60);return `${m}:${String(r).padStart(2,'0')}`;};

// ---- The film (Oct 9 2026): one scripted back-pass clip per law, sampled by time --------------------------------------------
/**
 * The crank-and-lever film at the start of the room (the hall's zoetrope, made hands-on): the same 6.2 seconds of play under each
 * law. Old law: 4 kicks it back, the keeper picks it up, holds it while nobody may challenge, then rolls it out. New law: the same
 * back-pass, but the keeper must play it with the feet, so the ball keeps moving (two quick passes in the same time).
 * Deterministic and pure: the clip is stepped once at CLIP_FPS and cached, so scrubbing backwards and forwards (and the Node test)
 * always see the same frame for the same time.
 */
export const CLIP_LEN=DUR.back+DUR.hold+DUR.roll+.2;
export const CLIP_FPS=60;
/** When the new-law keeper plays the ball with the feet (seconds after it reaches the feet). */
export const CLIP_TOUCH=.45;
const cloneWorld=(w:World):World=>{const cp=(r:Record<Actor,Pt>)=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,copy(v)])) as Record<Actor,Pt>;
 return {...w,pos:cp(w.pos),from:cp(w.from),ball:copy(w.ball),ballFrom:copy(w.ballFrom)};};
const CLIPS=new Map<Era,World[]>();
function buildClip(era:Era):World[]{
 const w=createWorld(era),out:World[]=[];passBack(w);out.push(cloneWorld(w));
 const n=Math.round(CLIP_LEN*CLIP_FPS);
 for(let i=1;i<=n;i++){
  step(w,1/CLIP_FPS);
  if(era==='new'&&w.phase==='feet'&&w.t>=CLIP_TOUCH)footPass(w,freeTarget(w));
  if(w.phase==='idle'&&i<n-DUR.back*CLIP_FPS)passBack(w);
  out.push(cloneWorld(w));
 }
 return out;
}
/** The clip's world at time t (seconds, clamped to 0…CLIP_LEN). Treat the result as read-only. */
export function clipAt(era:Era,t:number):World{
 let c=CLIPS.get(era);if(!c){c=buildClip(era);CLIPS.set(era,c);}
 return c[Math.max(0,Math.min(c.length-1,Math.round(t*CLIP_FPS)))];
}
/** Copy a clip frame into a persistent world (so the painter's stride/trail memory carries across scrubbed frames). */
export function loadInto(dst:World,src:World){Object.assign(dst,cloneWorld(src));return dst;}
/** The times (seconds) where the clip's phase changes, plus the end: the key frames a reduced-motion PLAY steps between. */
export function clipKeys(era:Era):number[]{
 const out:number[]=[];let prev=clipAt(era,0).phase;const n=Math.round(CLIP_LEN*CLIP_FPS);
 for(let i=1;i<=n;i++){const p=clipAt(era,i/CLIP_FPS).phase;if(p!==prev){out.push(i/CLIP_FPS);prev=p;}}
 if(out[out.length-1]!==n/CLIP_FPS)out.push(n/CLIP_FPS);
 return out;
}
