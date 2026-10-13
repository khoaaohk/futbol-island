const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v)),lerp=(a:number,b:number,u:number)=>a+(b-a)*u,easeOut=(u:number)=>1-(1-u)*(1-u);
import {CLOCK_END,HOLD_RATE,hold as holdBoard,newGame,play as playBoard,type Game} from './board';
import {choose,current,newPress,pressMs,resolve,tooSlow,type Choice,type Outcome,type Press,type Rally} from './pressRules';

/**
 * backpass-1992 · the match moment's rules in the world (Oct 10 2026; kept through the Oct 12 2026 anatomy Paper rebuild, the drawing
 * is now scene.ts). Pure: tests/museum-exp-backpass-1992.cjs plays it in Node. Your penalty area in metres: your goal on the line
 * x = 0, your keeper (1), your number 4 who plays the ball back, your 7 and 8 out wide, their 9 who presses, their 6 (and 10)
 * who mark. The rules are the two pure models already in this folder:
 *  - ROUND 1 · 1990 "Kill the clock" (board.ts): you lead 1–0 at 88:00. Kick it back, the keeper picks it up, and while you HOLD
 *    the button the match clock runs (HOLD_RATE match seconds a second), nobody may tackle, and the crowd falls asleep.
 *  - ROUND 2 · 1992 "Beat the press" (pressRules.ts): eight balls come back KICKED (feet only) or HEADED (hands allowed). Their 9
 *    runs at the keeper: drag from the ball to the free team-mate, drag up the pitch to boot it long, or tap the keeper to pick
 *    it up. The law decides what is legal; the press decides how long you have.
 * This file only adds the world: where everyone stands, how the ball and the players move between those rules' states, and
 * the scene. Metres and seconds; x runs to the screen's lower right (up the pitch), y to the lower left.
 */
export type V={x:number;y:number};
export const POST_A=2.3,GOAL_W=7.32,POST_B=POST_A+GOAL_W,MID=(POST_A+POST_B)/2;
export type Who='K'|'D'|'L'|'R'|'S'|'M'|'N';
/** Home spots (metres). L = your 7 (screen left), R = your 8 (screen right). */
export const SPOT:Record<Who,V>={K:{x:1.3,y:MID},D:{x:8.4,y:4.2},L:{x:7.6,y:12.4},R:{x:7.2,y:.4},S:{x:9.6,y:7.6},M:{x:12,y:6},N:{x:13,y:3}};
/** Where a marker stands to mark a team-mate: a step inside and goal-side of them. */
export const markSpot=(m:'L'|'R'):V=>m==='L'?{x:SPOT.L.x-.7,y:SPOT.L.y-1}:{x:SPOT.R.x-.6,y:SPOT.R.y+1};
export const LONG_TO:V={x:24,y:MID+1};
/** Their 9's press: from his spot to the keeper's feet. */
export const PRESS_END:V={x:SPOT.K.x+.9,y:SPOT.K.y+.3};

export type Flight={from:V&{z:number};to:V&{z:number};t:number;dur:number;arc:number};
export type BP={
 mode:'r1'|'r2';t:number;frame:number;
 game:Game;// round 1 (board.ts)
 press:Press;// round 2 (pressRules.ts)
 phase:'incoming'|'decide'|'outcome'|'over'|'idle';
 ms:number;// time spent deciding (ms)
 outcome:Outcome|null;choice:Choice|null;
 pos:Record<Who,V>;want:Record<Who,V>;
 ball:V&{z:number};flight:Flight|null;inHands:boolean;
 reduced:boolean;holding:boolean;bounce:number;
};
const clone=(o:Record<Who,V>)=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,{...v}])) as Record<Who,V>;
export function newBP(mode:'r1'|'r2',seed=1,reduced=false):BP{
 const s:BP={mode,t:0,frame:0,game:newGame('1990'),press:newPress(seed),phase:'idle',ms:0,outcome:null,choice:null,pos:clone(SPOT),want:clone(SPOT),
  ball:{...feet(SPOT.D),z:0},flight:null,inHands:false,reduced,holding:false,bounce:0};
 if(mode==='r2')startRally(s);
 return s;}
const feet=(p:V)=>({x:p.x+.35,y:p.y+.15});
const d2=(a:V,b:V)=>Math.hypot(a.x-b.x,a.y-b.y);

/** Where everyone wants to be for this rally: markers on the marked team-mates (their 10 joins when both are marked). */
export function placesFor(r:Rally|null):Record<Who,V>{const w=clone(SPOT);if(!r)return w;
 if(r.marked==='both'){w.M=markSpot('L');w.N=markSpot('R');}else{w.M=markSpot(r.marked);}return w;}
function fly(s:BP,to:V&{z:number},dur:number,arc=0){s.flight={from:{...s.ball},to,t:0,dur:s.reduced?0:dur,arc};}

// ── Round 1 · 1990 · Kill the clock (board.ts drives the rules) ───────────────────────────────────────────────────────────
export function kickBack(s:BP){if(s.mode!=='r1')return false;const g=playBoard(s.game,'kickBack');if(g===s.game)return false;s.game=g;s.inHands=false;
 fly(s,{...feet(SPOT.K),z:0},.8);s.phase='incoming';return true;}
export function rollOut(s:BP){if(s.mode!=='r1')return false;const g=playBoard(s.game,'rollOut');if(g===s.game)return false;s.game=g;s.inHands=false;
 fly(s,{...feet(SPOT.D),z:0},.9);s.phase='incoming';return true;}
/** Hold for `secs` real seconds (×HOLD_RATE match seconds). */
export function holdFor(s:BP,secs:number){if(s.mode!=='r1'||s.game.step!=='held')return;s.game=holdBoard(s.game,secs*HOLD_RATE);}

// ── Round 2 · 1992 · Beat the press (pressRules.ts drives the rules) ──────────────────────────────────────────────────────
export function startRally(s:BP){const r=current(s.press);if(!r){s.phase='over';return;}
 s.want=placesFor(r);s.outcome=null;s.choice=null;s.ms=0;s.inHands=false;s.pos.S={...SPOT.S};
 s.ball={...feet(SPOT.D),z:r.kind==='head'?1.75:0};fly(s,r.kind==='head'?{x:SPOT.K.x+.15,y:SPOT.K.y,z:1.1}:{...feet(SPOT.K),z:0},r.kind==='head'?.9:.75,r.kind==='head'?1.2:0);
 s.phase='incoming';}
/** The keeper's choice. Returns the outcome, or null when it is not the moment. */
export function decide(s:BP,c:Choice):Outcome|null{if(s.mode!=='r2'||s.phase!=='decide')return null;const r=current(s.press)!;
 const o=resolve(r,c);s.press=choose(s.press,c,s.reduced?null:Math.round(s.ms));s.outcome=o;s.choice=c;startOutcome(s,o,c);return o;}
function startOutcome(s:BP,o:Outcome,c:Choice|null){s.phase='outcome';s.t=0;const K=SPOT.K;
 if(o==='pass'){const m=c==='L'?s.pos.L:s.pos.R;fly(s,{...feet(m),z:0},.7);}
 else if(o==='intercepted'){const m=c==='L'?s.pos.L:s.pos.R,cut={x:(feet(K).x+m.x)/2+1.5,y:(K.y+m.y)/2};s.want.M=cut;fly(s,{...cut,z:0},.6);}
 else if(o==='long')fly(s,{...LONG_TO,z:0},1.1,4.5);
 else if(o==='catch'||o==='freeKick'){s.inHands=true;s.ball={x:K.x+.1,y:K.y,z:1};}
 else if(o==='stolen'){s.want.S={x:K.x+.6,y:K.y+.4};fly(s,{x:K.x+3,y:K.y+1.5,z:0},.8);}
}
export const OUTCOME_S=1.2;

/** One step (dt s). Returns true while something moves (the loop sleeps otherwise). */
export function stepBP(s:BP,dt:number):boolean{
 s.t+=dt;s.frame=Math.floor(s.t*8);let moving=false;
 // Ball flight (an arc for headers and long balls).
 const f=s.flight;if(f){f.t+=dt;const u=f.dur<=0?1:clamp(f.t/f.dur,0,1),e=f.arc?u:easeOut(u);
  s.ball={x:lerp(f.from.x,f.to.x,e),y:lerp(f.from.y,f.to.y,e),z:lerp(f.from.z,f.to.z,e)+4*f.arc*u*(1-u)};
  if(u>=1)s.flight=null;else moving=true;}
 // Players ease toward where they want to be (the 9's press is driven by the clock below).
 for(const w of Object.keys(s.want) as Who[]){if(w==='S'&&s.mode==='r2'&&s.phase==='decide')continue;const p=s.pos[w],t=s.want[w],d=d2(p,t);if(d>.01){const k=Math.min(1,dt*(s.reduced?999:3.2));p.x+=(t.x-p.x)*k;p.y+=(t.y-p.y)*k;moving=true;}else{p.x=t.x;p.y=t.y;}}
 if(s.mode==='r1'){
  if(s.phase==='incoming'&&!s.flight){s.phase='idle';s.inHands=s.game.step==='held';if(s.inHands)s.ball={x:SPOT.K.x+.1,y:SPOT.K.y,z:1};}
  // 1990: nobody may tackle the keeper while he holds it: their 9 stands off at 4 m.
  s.want.S=s.game.step==='held'?{x:SPOT.K.x+4,y:SPOT.K.y+.8}:{...SPOT.S};
  if(s.holding&&s.game.step==='held'){holdFor(s,dt);s.bounce+=dt;s.ball.z=1-Math.abs(Math.sin(s.bounce*4))*.7;moving=true;}
  return moving||s.holding;}
 // Round 2.
 if(s.phase==='incoming'&&!s.flight){s.phase='decide';s.ms=0;if(current(s.press)?.kind==='head')s.ball={x:SPOT.K.x+.4,y:SPOT.K.y,z:0};}
 if(s.phase==='decide'){if(s.reduced)return moving;// turn-based: number 9 never arrives
  s.ms+=dt*1000;const lim=pressMs(s.press),u=clamp(s.ms/lim,0,1);s.pos.S={x:lerp(SPOT.S.x,PRESS_END.x,u),y:lerp(SPOT.S.y,PRESS_END.y,u)};
  if(s.ms>=lim){s.press=tooSlow(s.press);s.outcome='stolen';startOutcome(s,'stolen',null);}return true;}
 if(s.phase==='outcome'){if(s.t>=OUTCOME_S||s.reduced){if(s.press.over){s.phase='over';return moving;}startRally(s);return true;}return true;}
 return moving;}
/** Run until the next decision (or the end): reduced motion / tests. */
export function settle(s:BP){for(let i=0;i<2000&&stepBP(s,1/30);i++){if(s.mode==='r2'&&s.phase==='decide'&&s.reduced)break;}return s;}

/** Aim a drag from the ball: the angle picks a team-mate (within 30°), or up the pitch (long), or null. */
export function aimFrom(s:BP,to:V):Choice|null{const from=feet(SPOT.K),dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy);if(len<.9)return null;
 const ang=(p:V)=>Math.atan2(p.y-from.y,p.x-from.x),a=Math.atan2(dy,dx),diff=(b:number)=>{let d=Math.abs(a-b);if(d>Math.PI)d=Math.PI*2-d;return d*180/Math.PI;};
 const opts:[Choice,number][]=[['L',diff(ang(s.pos.L))],['R',diff(ang(s.pos.R))],['long',diff(ang(LONG_TO))]];opts.sort((x,y)=>x[1]-y[1]);
 const [c,d]=opts[0];if(c==='long')return d<=16&&len>=3?'long':null;return d<=30?c:null;}

export {HOLD_RATE,CLOCK_END};
