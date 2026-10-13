/**
 * backpass-1992 · "Beat the press" (Oct 10 2026; user: the old pixel penalty "was more interactive", "the other exhibits need to
 * be more interactive"). The scored round that comes after the two Kill-the-Clock rounds: the 1992 law, played for points.
 * Pure, so tests/museum-exp-backpass-1992.cjs can play it in Node.
 *
 * Eight balls come back to your keeper, one at a time. Each one is either KICKED back (feet only) or HEADED back (hands allowed:
 * the law is about kicks). Their number 9 presses the keeper; their 6 (and sometimes their 10 too) marks your team-mates.
 * You AIM the keeper's next touch: drag from the ball to the free team-mate (a pass with the feet), drag it up the pitch (boot it
 * long), or tap the keeper (pick it up). The rule decides what is legal; the press decides how long you have:
 *  - a pass to the FREE team-mate: 100, plus up to 50 for a quick decision, times your combo;
 *  - a HEADED back-pass caught in the hands: legal, the same points (the only safe answer when both team-mates are marked);
 *  - boot it long: safe but you give the ball away upfield, 40, and the combo holds (when it was KICKED back and BOTH team-mates
 *    are marked it is the right call, and scores like a pass);
 *  - pass to a MARKED team-mate: intercepted, 0, the combo resets;
 *  - pick up a KICKED back-pass: indirect free kick to them, −50, the combo resets;
 *  - too slow: number 9 takes it off your toes, 0, the combo resets.
 * Every good pass makes number 9 a little faster (the press tightens), so a long combo is harder to keep.
 * Board coordinates are percent of the board, as board.ts (your goal at the bottom).
 */
import type {Pt} from './board';
export type Kind='kick'|'head';
export type Mate='L'|'R';
export type Rally={kind:Kind;marked:Mate|'both'};
export type Choice='L'|'R'|'hands'|'long';
export type Outcome='pass'|'catch'|'long'|'intercepted'|'freeKick'|'stolen';
export type Entry={kind:Kind;outcome:Outcome;points:number;ms:number|null;combo:number};
export type Press={rallies:readonly Rally[];i:number;score:number;streak:number;bestStreak:number;log:Entry[];over:boolean};

export const BALLS=8;
export const PRESS_START=3200,PRESS_STEP=220,PRESS_MIN=1700;
export const BASE=100,SPEED_BONUS=50,LONG=40,FOUL=-50;

/** A tiny seeded generator (mulberry32), so a round can be replayed and tested. */
export function rng(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
/**
 * The eight balls of one round. Always: the first ball is a plain kicked back-pass with one team-mate free (learn the move),
 * at least two headers, at least one header with BOTH team-mates marked (catch it!), and at least one kick with both marked
 * (no hands: boot it long). The rest are shuffled by the seed.
 */
export function rallies(seed:number):Rally[]{
 const r=rng(seed),side=():Mate=>r()<.5?'L':'R';
 const must:Rally[]=[{kind:'head',marked:'both'},{kind:'kick',marked:'both'},{kind:'head',marked:side()}];
 const rest:Rally[]=Array.from({length:BALLS-1-must.length},()=>({kind:r()<.25?'head':'kick',marked:side()}));
 const mid=[...must,...rest];for(let i=mid.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[mid[i],mid[j]]=[mid[j],mid[i]];}
 return [{kind:'kick',marked:side()},...mid];
}
export const newPress=(seed:number):Press=>({rallies:rallies(seed),i:0,score:0,streak:0,bestStreak:0,log:[],over:false});
export const current=(p:Press):Rally|null=>p.over?null:p.rallies[p.i]??null;
/** How long their number 9 takes to reach your keeper (ms): the press tightens with every ball you keep. */
export const pressMs=(p:Press)=>Math.max(PRESS_MIN,PRESS_START-PRESS_STEP*p.streak);
/** Combo multiplier: ×1, ×1.25 … up to ×2 after four in a row. */
export const combo=(streak:number)=>1+Math.min(4,Math.max(0,streak))*.25;
export const free=(r:Rally):Mate|null=>r.marked==='both'?null:r.marked==='L'?'R':'L';

/** What the referee (and the other team) make of the keeper's choice. The law: a KICKED back-pass may not be handled. */
export function resolve(r:Rally,c:Choice):Outcome{
 if(c==='long')return 'long';
 if(c==='hands')return r.kind==='head'?'catch':'freeKick';
 return r.marked==='both'||r.marked===c?'intercepted':'pass';
}
/** Points for an outcome. `ms` is how long the keeper took (null = turn-based, reduced motion: no speed bonus). */
export function pointsFor(o:Outcome,streak:number,ms:number|null,limit:number){
 if(o==='pass'||o==='catch'){const quick=ms==null?0:Math.round(SPEED_BONUS*Math.max(0,1-ms/limit));return Math.round((BASE+quick)*combo(streak));}
 return o==='long'?LONG:o==='freeKick'?FOUL:0;
}
/** Booting it long is the RIGHT call when it was kicked back and nobody is free (no hands, no pass): then it scores like a pass. */
export const onlyLong=(r:Rally)=>r.kind==='kick'&&r.marked==='both';
const good=(o:Outcome,r:Rally)=>o==='pass'||o==='catch'||(o==='long'&&onlyLong(r));
function settle(p:Press,o:Outcome,ms:number|null):Press{
 const r=current(p);if(!r)return p;
 const pts=o==='long'&&onlyLong(r)?pointsFor('pass',p.streak,ms,pressMs(p)):pointsFor(o,p.streak,ms,pressMs(p)),streak=good(o,r)?p.streak+1:o==='long'?p.streak:0;
 const log=[...p.log,{kind:r.kind,outcome:o,points:pts,ms,combo:combo(p.streak)}],i=p.i+1;
 return {...p,i,score:Math.max(0,p.score+pts),streak,bestStreak:Math.max(p.bestStreak,streak),log,over:i>=p.rallies.length};
}
/** The keeper makes a choice after `ms` milliseconds (null when turn-based). */
export const choose=(p:Press,c:Choice,ms:number|null)=>settle(p,resolve(current(p)??{kind:'kick',marked:'L'},c),ms);
/** Number 9 got there first. */
export const tooSlow=(p:Press)=>settle(p,'stolen',null);

/** Where everyone stands for this ball (percent of the board). Their 10 only steps in when both team-mates are marked. */
export const SPOT={K:{x:50,y:85},D:{x:27,y:60},L:{x:17,y:27},R:{x:81,y:31},S:{x:60,y:44},press:{x:54,y:76},long:{x:52,y:6}} as const;
export function placesFor(r:Rally|null){
 const m=(s:Mate):Pt=>s==='L'?{x:28,y:33}:{x:70,y:36};
 const marker=r?.marked==='both'?m('L'):m(r?.marked??'R'),second=r?.marked==='both'?m('R'):{x:50,y:20};
 return {M:marker,N:second};
}
/**
 * Aim: a drag from the keeper's ball towards a point. Returns the choice it points at, or null when it is too short or points at
 * nothing. Within 34° of a team-mate = a pass to them; pointing up the pitch (and long enough) = boot it long.
 */
export function aimAt(from:Pt,to:Pt,minLen=7):Choice|null{
 const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy);if(len<minLen)return null;
 const ang=(p:Pt)=>Math.atan2(p.y-from.y,p.x-from.x),a=Math.atan2(dy,dx),diff=(b:number)=>{let d=Math.abs(a-b);if(d>Math.PI)d=Math.PI*2-d;return d*180/Math.PI;};
 const opts:[Choice,number][]=[['L',diff(ang(SPOT.L))],['R',diff(ang(SPOT.R))],['long',diff(-Math.PI/2)]];
 opts.sort((x,y)=>x[1]-y[1]);const [c,d]=opts[0];
 if(c==='long')return d<=20&&len>=22?'long':null;
 return d<=34?c:null;
}
/** The round's verdict as one gallery word, and the best-score key (per-viewer convenience, localStorage). */
export const verdict=(score:number)=>score>=1500?'Total football':score>=1000?'Flowing':score>=550?'Steady':'Keep practising';
export const BEST_KEY='fi2-museum-backpass-press-best';
export const outcomeText:Record<Outcome,string>={
 pass:'Good feet. Pass completed.',catch:'Header back: hands allowed. Caught it.',long:'Booted long. Safe, but you gave it away.',
 intercepted:'Intercepted. That team-mate was marked.',freeKick:'Whistle! Hands on a kicked back-pass: free kick to them.',stolen:'Too slow. Number 9 took it.',
};
