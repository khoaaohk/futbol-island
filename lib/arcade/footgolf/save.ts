/**
 * FootGolf Island device save (Nov 21 2026). Pure rules with the storage passed in (tests/footgolf-core.cjs); the browser wrappers at
 * the bottom read localStorage. One key: fi2-footgolf-v1.
 */
import {FG,HOLES,type FgMode,type FgResult} from './core';

export const FOOTGOLF_KEY='fi2-footgolf-v1';
/** best: the course's best points (the board score). bestKicks: the fewest kicks round the nine (0 = never finished). holes: best
 *  kicks per hole (0 = not played). daily: today's Daily Hole. aces / birdies: lifetime counts. */
export type FootgolfSave={v:1;best:number;bestKicks:number;holes:number[];plays:number;aces:number;birdies:number;daily:{day:string;best:number;kicks:number;runs:number};streak:{day:string;n:number;best:number}};
export const emptyFootgolfSave=():FootgolfSave=>({v:1,best:0,bestKicks:0,holes:HOLES.map(()=>0),plays:0,aces:0,birdies:0,daily:{day:'',best:0,kicks:0,runs:0},streak:{day:'',n:0,best:0}});
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeFootgolfSave(raw:unknown):FootgolfSave{
 const out=emptyFootgolfSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<FootgolfSave>;
 out.best=int(r.best,FG.scoreMax);out.bestKicks=int(r.bestKicks,200);out.plays=int(r.plays,1e9);out.aces=int(r.aces,1e6);out.birdies=int(r.birdies,1e6);
 if(Array.isArray(r.holes))out.holes=out.holes.map((_,i)=>int(r.holes![i],FG.maxKicks));
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,FG.scoreMax),kicks:int(r.daily.kicks,FG.maxKicks+1),runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
export const liveStreak=(s:FootgolfSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

export type FootgolfRun={mode:FgMode;day:string;total:number;results:readonly FgResult[];complete:boolean};
export type FootgolfSettled={save:FootgolfSave;newBest:boolean;previousBest:number;newHoleBests:string[];dailyBest:number;streak:number};
export function settleFootgolf(s:FootgolfSave,run:FootgolfRun):FootgolfSettled{
 const total=int(run.total,FG.scoreMax),next:FootgolfSave={...s,holes:[...s.holes],daily:{...s.daily},streak:{...s.streak}};next.plays=s.plays+1;
 let newBest=false,previousBest=s.best;const newHoleBests:string[]=[];
 for(const r of run.results){if(!r.holed)continue;const i=r.ix;if(next.holes[i]===0||r.kicks<next.holes[i]){if(next.holes[i]>0)newHoleBests.push(HOLES[i].name);next.holes[i]=r.kicks;}
  if(r.kicks===1)next.aces++;else if(r.kicks<r.par)next.birdies++;}
 if(run.mode==='daily'){const r=run.results[0];if(next.daily.day!==run.day)next.daily={day:run.day,best:0,kicks:0,runs:0};previousBest=next.daily.best;newBest=total>next.daily.best&&total>0;
  const k=r?r.kicks:0;next.daily={day:run.day,best:Math.max(next.daily.best,total),kicks:next.daily.kicks===0?k:Math.min(next.daily.kicks,k),runs:next.daily.runs+1};
  if(next.streak.day!==run.day){const n=next.streak.day===dayBefore(run.day)?next.streak.n+1:1;next.streak={day:run.day,n,best:Math.max(next.streak.best,n)};}}
 else if(run.mode==='course'&&run.complete){newBest=total>s.best&&total>0;next.best=Math.max(s.best,total);const kicks=run.results.reduce((a,r)=>a+r.kicks,0);next.bestKicks=s.bestKicks===0?kicks:Math.min(s.bestKicks,kicks);}
 else if(run.mode==='hole'){const r=run.results[0];previousBest=r?s.holes[r.ix]:0;newBest=!!r&&r.holed&&(previousBest===0||r.kicks<previousBest);}
 return {save:next,newBest,previousBest,newHoleBests,dailyBest:next.daily.day===run.day?next.daily.best:0,streak:liveStreak(next,run.day)};
}

export function readFootgolfSave():FootgolfSave{if(typeof window==='undefined')return emptyFootgolfSave();try{return sanitizeFootgolfSave(JSON.parse(window.localStorage.getItem(FOOTGOLF_KEY)||'null'));}catch{return emptyFootgolfSave();}}
export function writeFootgolfSave(s:FootgolfSave){if(typeof window==='undefined')return;try{window.localStorage.setItem(FOOTGOLF_KEY,JSON.stringify(s));}catch{/* private mode: the round still counts on screen */}}
