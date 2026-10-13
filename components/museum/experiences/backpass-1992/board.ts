/**
 * backpass-1992 · "Kill the Clock" (Oct 10 2026): the rules of the exhibit's little game, pure so the Node test can play it.
 * (The game is drawn as an abstract gallery piece: circles for players, a red dot for the ball, lines for passes.)
 *
 * The visitor's team leads 1–0 with two minutes to go and the mission is the sneaky one teams really used: run down the clock.
 * Round 1 is played with the 1990 rulebook: kick it back, the keeper picks it up, and while he HOLDS it the match clock runs and
 * nobody may tackle him; the flow meter sinks to "stopped". Round 2 is the same moment with the 1992 rulebook: a ball KICKED
 * back can't be handled (picking it up gives the other team an indirect free kick), so the keeper must pass with his feet before
 * their striker arrives; a HEADED back-pass may still be caught (the law is about kicks). The ball keeps moving and the flow
 * meter climbs: that is WHY the law changed.
 *
 * Board coordinates are percent of the board (x 0–100 left to right, y 0–100 top to bottom; your goal is at the bottom).
 */
export type Rules='1990'|'1992';
export type Step='start'|'held'|'feet'|'caught'|'freeKick'|'stolen'|'intercepted'|'moving'|'fullTime';
export type Card='kickBack'|'headBack'|'hold'|'rollOut'|'passL'|'passR'|'pickUp'|'throwOut'|'playOn'|'tryAgain';
export type Holder='D'|'K'|'L'|'R'|'S'|'M';
export type Side='L'|'R';
export type Game={
 rules:Rules;step:Step;
 /** match seconds since 88:00 (full time at CLOCK_END) */
 clock:number;
 /** match seconds the keeper held the ball in his hands */
 held:number;
 /** the flow meter, 0 (stopped) … 10 (non-stop football) */
 crowd:number;
 ball:Holder;
 /** which of your team-mates (7 on the left, 8 on the right) their number 6 is marking this time */
 marked:Side;
 attempts:number;goodPasses:number;whistles:number;headers:number;lost:number;
};
export const CLOCK_END=120;// 88:00 → 90:00
export const HOLD_RATE=10;// match seconds per real second of holding
export const STEP_HOLD=15;// reduced motion: one tap holds it for 15 match seconds
export const CROWD_START=6,CROWD_MAX=10;
export const PASSES_TO_WIN=2;// round 2 ends when the ball has been kept moving twice
/** How long their striker takes to reach your keeper in round 2 (ms). Generous for 7-year-olds. */
export const CHARGE_MS=4200;
export type Pt={x:number;y:number};
export const HOME:Record<'K'|'D'|'L'|'R'|'S',Pt>={K:{x:50,y:85},D:{x:27,y:60},L:{x:17,y:27},R:{x:81,y:31},S:{x:60,y:44}};
/** where their striker ends up if the keeper dawdles */
export const CHARGE:Pt={x:54,y:75};
/** their number 6, standing next to whichever team-mate he marks */
export const markerAt=(side:Side):Pt=>side==='L'?{x:28,y:33}:{x:70,y:36};
export const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
export const clockText=(clock:number)=>{const s=88*60+Math.floor(clamp(clock,0,CLOCK_END));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
export const free=(g:Game):Side=>g.marked==='L'?'R':'L';

export function newGame(rules:Rules):Game{
 return {rules,step:'start',clock:0,held:0,crowd:CROWD_START,ball:'D',marked:'R',attempts:0,goodPasses:0,whistles:0,headers:0,lost:0};
}
/** The cards in the visitor's hand right now. */
export function hand(g:Game):Card[]{
 switch(g.step){
  case 'start':return g.rules==='1990'?['kickBack']:['kickBack','headBack'];
  case 'held':return ['hold','rollOut'];
  case 'feet':return ['passL','passR','pickUp'];
  case 'caught':return ['throwOut'];
  case 'moving':return ['playOn'];
  case 'freeKick':case 'stolen':case 'intercepted':return ['tryAgain'];
  default:return [];
 }
}
const tick=(g:Game,secs:number):Game=>{const clock=Math.min(CLOCK_END,g.clock+secs);return {...g,clock,step:g.rules==='1990'&&clock>=CLOCK_END?'fullTime':g.step};};
const cheer=(g:Game,d:number):Game=>({...g,crowd:clamp(g.crowd+d,0,CROWD_MAX)});
/** Play a card. Cards that aren't in the hand change nothing (returns the same object). */
export function play(g:Game,card:Card):Game{
 if(!hand(g).includes(card))return g;
 switch(card){
  case 'kickBack':{
   const n={...g,attempts:g.attempts+1,ball:'K' as Holder,marked:(g.attempts%2?'L':'R') as Side};
   return tick({...n,step:g.rules==='1990'?'held':'feet'},3);
  }
  case 'headBack':return tick({...g,ball:'K',step:'caught',headers:g.headers+1},3);
  case 'rollOut':return tick(cheer({...g,ball:'D',step:'start'},-.5),3);
  case 'pickUp':return cheer({...g,step:'freeKick',whistles:g.whistles+1,ball:'S'},1);
  case 'throwOut':return tick(cheer({...g,step:'moving',ball:free(g),goodPasses:g.goodPasses+1},1.5),4);
  case 'passL':case 'passR':{
   const to:Side=card==='passL'?'L':'R';
   if(to===g.marked)return cheer({...g,step:'intercepted',ball:'M',lost:g.lost+1},1);
   return tick(cheer({...g,step:'moving',ball:to,goodPasses:g.goodPasses+1},2),4);
  }
  case 'playOn':return g.goodPasses>=PASSES_TO_WIN?{...g,step:'fullTime'}:{...g,step:'start',ball:'D'};
  case 'tryAgain':return {...g,step:'start',ball:'D'};
  default:return g;
 }
}
/** 1990 only: the keeper holds the ball for `secs` match seconds. The clock runs, nobody may tackle, the crowd nods off. */
export function hold(g:Game,secs:number):Game{
 if(g.step!=='held'||secs<=0)return g;
 const s=Math.min(secs,CLOCK_END-g.clock);
 return tick({...g,held:g.held+s,crowd:clamp(g.crowd-s/14,0,CROWD_MAX)},s);
}
/** 1992 only: the keeper dawdled with the ball at his feet and their striker took it. */
export function tooSlow(g:Game):Game{
 if(g.step!=='feet')return g;
 return cheer({...g,step:'stolen',ball:'S',lost:g.lost+1},1.5);
}
/** The pass lines the board draws: where the ball went from and to (and whether the other team got it). */
export type Trail={from:Holder;to:Holder;lost:boolean};
export function trailOf(before:Game,after:Game):Trail|null{
 if(before.ball===after.ball)return null;
 return {from:before.ball,to:after.ball,lost:after.ball==='S'||after.ball==='M'};
}
/** Where each piece stands for this game state (the board draws exactly this). */
export function layout(g:Game):Record<'K'|'D'|'L'|'R'|'S'|'M',Pt>{
 const striker=g.step==='feet'||g.step==='stolen'?CHARGE:g.step==='freeKick'?{x:50,y:66}:HOME.S;
 return {...HOME,S:striker,M:markerAt(g.marked)};
}
/** The flow meter reads the same 0–10 value as words: how much football is being played. */
export const flowWord=(c:number)=>c<1.5?'stopped':c<3.5?'slow':c<6.5?'steady':c<8.5?'flowing':'non-stop';
