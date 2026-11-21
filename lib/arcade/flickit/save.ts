/**
 * Flick It device save (Nov 21 2026). Pure rules with the storage passed in (tests/flickit-core.cjs); the browser wrappers at the
 * bottom read localStorage. One key: fi2-flickit-v1.
 */
import {FK,STAGES,type FlickMode,type FlickResult} from './core';

export const FLICKIT_KEY='fi2-flickit-v1';
/** best: the Tour's best total (the board score). stars / bests: per stage, best ever. daily: today's Daily Flick. tricks: lifetime
 *  count of trick shots (curl, round the wall, over, bank, long). plays: runs finished. */
export type FlickitSave={v:1;best:number;stars:number[];bests:number[];plays:number;tricks:number;daily:{day:string;best:number;stars:number;runs:number};streak:{day:string;n:number;best:number}};
export const emptyFlickitSave=():FlickitSave=>({v:1,best:0,stars:STAGES.map(()=>0),bests:STAGES.map(()=>0),plays:0,tricks:0,daily:{day:'',best:0,stars:0,runs:0},streak:{day:'',n:0,best:0}});
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeFlickitSave(raw:unknown):FlickitSave{
 const out=emptyFlickitSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<FlickitSave>;
 out.best=int(r.best,FK.scoreMax);out.plays=int(r.plays,1e9);out.tricks=int(r.tricks,1e9);
 if(Array.isArray(r.stars))out.stars=out.stars.map((_,i)=>int(r.stars![i],3));if(Array.isArray(r.bests))out.bests=out.bests.map((_,i)=>int(r.bests![i],FK.scoreMax));
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,FK.scoreMax),stars:int(r.daily.stars,3),runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
export const liveStreak=(s:FlickitSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;
/** A stage can be practised once the one before it has a star (the first is always open). */
export const stageOpen=(s:FlickitSave,i:number)=>i<=0||s.stars[i-1]>0;
export const totalStars=(s:FlickitSave)=>s.stars.reduce((a,b)=>a+b,0);

export type FlickitRun={mode:FlickMode;day:string;total:number;results:readonly FlickResult[]};
export type FlickitSettled={save:FlickitSave;newBest:boolean;previousBest:number;newStars:number;dailyBest:number;streak:number};
export function settleFlickit(s:FlickitSave,run:FlickitRun):FlickitSettled{
 const total=int(run.total,FK.scoreMax),next:FlickitSave={...s,stars:[...s.stars],bests:[...s.bests],daily:{...s.daily},streak:{...s.streak}};next.plays=s.plays+1;
 let newBest=false,previousBest=s.best,newStars=0;
 for(const r of run.results){next.tricks+=r.stats.curls+r.stats.arounds+r.stats.overs+r.stats.banks+r.stats.longs;const i=STAGES.findIndex(d=>d.id===r.stage);if(i<0)continue;
  if(r.stars>next.stars[i]){newStars+=r.stars-next.stars[i];next.stars[i]=r.stars;}next.bests[i]=Math.max(next.bests[i],int(r.score,FK.scoreMax));}
 if(run.mode==='daily'){const r=run.results[0];if(next.daily.day!==run.day)next.daily={day:run.day,best:0,stars:0,runs:0};previousBest=next.daily.best;newBest=total>next.daily.best&&total>0;
  next.daily={day:run.day,best:Math.max(next.daily.best,total),stars:Math.max(next.daily.stars,r?r.stars:0),runs:next.daily.runs+1};
  if(next.streak.day!==run.day){const n=next.streak.day===dayBefore(run.day)?next.streak.n+1:1;next.streak={day:run.day,n,best:Math.max(next.streak.best,n)};}}
 else if(run.mode==='tour'){newBest=total>s.best&&total>0;next.best=Math.max(s.best,total);}
 else{const i=STAGES.findIndex(d=>d.id===run.results[0]?.stage);previousBest=i>=0?s.bests[i]:0;newBest=total>previousBest&&total>0;}
 return {save:next,newBest,previousBest,newStars,dailyBest:next.daily.day===run.day?next.daily.best:0,streak:liveStreak(next,run.day)};
}

export function readFlickitSave():FlickitSave{if(typeof window==='undefined')return emptyFlickitSave();try{return sanitizeFlickitSave(JSON.parse(window.localStorage.getItem(FLICKIT_KEY)||'null'));}catch{return emptyFlickitSave();}}
export function writeFlickitSave(s:FlickitSave){if(typeof window==='undefined')return;try{window.localStorage.setItem(FLICKIT_KEY,JSON.stringify(s));}catch{/* private mode: the run still counts on screen */}}
