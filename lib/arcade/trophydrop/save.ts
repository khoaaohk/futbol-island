/**
 * Trophy Drop device save, day streak, Daily Drop and the results card's lines (Nov 17 2026). Pure rules with the storage passed in
 * (tests/trophydrop-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-trophydrop-v1.
 */
import {TD,TIERS,MEDAL_NAMES,medalFor,nextMedalLine,type TrophyStats} from './core';

export const TROPHY_KEY='fi2-trophydrop-v1';
/** best: best score (any run). top: the biggest tier ever made (0-8). daily: today's Daily Drop. streak: days in a row with a Daily
 *  Drop. medal: best medal ever (0-3). plays: finished runs. fact: which fact shows next. doubles: golden doubles ever. */
export type TrophySave={v:1;best:number;top:number;medal:number;plays:number;fact:number;doubles:number;daily:{day:string;best:number;runs:number};streak:{day:string;n:number;best:number}};
export const emptyTrophySave=():TrophySave=>({v:1,best:0,top:0,medal:0,plays:0,fact:0,doubles:0,daily:{day:'',best:0,runs:0},streak:{day:'',n:0,best:0}});
export const TROPHY_SCORE_MAX=2_000_000;
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeTrophySave(raw:unknown):TrophySave{
 const out=emptyTrophySave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<TrophySave>;
 out.best=int(r.best,TROPHY_SCORE_MAX);out.top=int(r.top,TIERS.length-1);out.medal=int(r.medal,TD.medals.length);out.plays=int(r.plays,1e9);out.fact=int(r.fact,1e9);out.doubles=int(r.doubles,1e6);
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,TROPHY_SCORE_MAX),runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
/** The calendar day before a YYYY-MM-DD day (local calendar, DST-safe: built from parts at noon). */
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
/** The streak as it stands today: alive when the last Daily Drop was today or yesterday, else 0. */
export const liveStreak=(s:TrophySave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

export type TrophyRun={score:number;daily:boolean;day:string;stats:TrophyStats};
export type TrophySettled={save:TrophySave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;newTop:boolean;
 /** Daily Drop only: the first finished run today, and today's best */dailyFirst:boolean;dailyBest:number;streak:number;fact:TrophyFact};
/** Applies a finished run to the save (call once per run end). Every run counts for the all-time best (one board, owner Nov 17 2026);
 *  a Daily Drop also keeps today's best and the day streak. */
export function settleTrophy(s:TrophySave,run:TrophyRun):TrophySettled{
 const score=int(run.score,TROPHY_SCORE_MAX),next:TrophySave={...s,daily:{...s.daily},streak:{...s.streak}};
 const medal=medalFor(score),newMedal=medal>s.medal,top=int(run.stats.bestTier,TIERS.length-1),newTop=top>s.top;
 next.medal=Math.max(s.medal,medal);next.top=Math.max(s.top,top);next.plays=s.plays+1;next.doubles=s.doubles+int(run.stats.doubles,1e6);
 const fact=TROPHY_FACTS[s.fact%TROPHY_FACTS.length];next.fact=s.fact+1;
 const newBest=score>s.best&&score>0,previousBest=s.best;next.best=Math.max(s.best,score);
 let dailyFirst=false;
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,best:0,runs:0};
  dailyFirst=next.daily.runs===0;next.daily={day:run.day,best:Math.max(next.daily.best,score),runs:next.daily.runs+1};
  if(next.streak.day!==run.day){const n=next.streak.day===dayBefore(run.day)?next.streak.n+1:1;next.streak={day:run.day,n,best:Math.max(next.streak.best,n)};}
 }
 return {save:next,newBest,previousBest,medal,newMedal,newTop,dailyFirst,dailyBest:next.daily.day===run.day?next.daily.best:0,streak:liveStreak(next,run.day),fact};
}

/** One football idea per results card (AGENTS.md: every feature teaches): the lesson "Small touches add up to big wins." */
export type TrophyFact={title:string;line:string};
export const TROPHY_FACTS:readonly TrophyFact[]=[
 {title:'Small touches',line:'Good dribblers use many small touches. The ball stays close, so a defender cannot steal it.'},
 {title:'Practice adds up',line:'Ten minutes of juggling every day is better than one long session a week. Your feet learn a little each day.'},
 {title:'The first touch',line:'A soft first touch puts the ball where you want it. Then your next pass or shot is easy.'},
 {title:'Short passes',line:'Lots of short, safe passes move the whole team up the pitch. One big kick often gives the ball away.'},
 {title:'Weak foot',line:'Kick with your weaker foot a few times every practice. One day it will feel as strong as the other.'},
 {title:'Keep going',line:'Teams that win trophies keep doing the small jobs: tracking back, talking, getting into space.'},
 {title:'Clean sheets',line:'A keeper wins games by saving the small chances too. Every save counts as much as a goal.'},
];

/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;stats:TrophyStats;daily:boolean;dailyBest:number}):string{
 const m=nextMedalLine(o.score),close=m.next&&m.gap<=Math.max(150,TD.medals[m.medal]*.2);
 if(o.newBest&&o.best>0)return `New best by ${o.score-o.best} ${o.score-o.best===1?'point':'points'}!`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(200,o.best*.2))return `${o.best-o.score} ${o.best-o.score===1?'point':'points'} from your best`;
 if(close)return `${m.gap} ${m.gap===1?'point':'points'} from ${m.next}`;
 if(o.newBest)return 'Your first best score. Play again and beat it!';
 const t=o.stats.bestTier;if(t<TIERS.length-1)return `Next goal: make a ${TIERS[t+1].name.toLowerCase()}`;
 if(m.next)return `${m.gap} points from ${m.next}`;
 return `You hold the ${MEDAL_NAMES[MEDAL_NAMES.length-1]} medal. Beat your best!`;
}
/** One coaching cue for the next run. */
export function coachLine(stats:TrophyStats):string{
 if(stats.bestChain<2)return 'Drop next to its twin. When a new item lands on another twin, that is a chain: double points.';
 if(stats.bestTier<5)return 'Keep the big items on one side and the small ones on the other. Then twins meet more often.';
 return 'Watch the top line. When it flashes, drop small items into the gaps to make room.';
}

/* ---- browser side ---- */
export function readTrophySave():TrophySave{try{return sanitizeTrophySave(JSON.parse(localStorage.getItem(TROPHY_KEY)??'null'));}catch{return emptyTrophySave();}}
export function writeTrophySave(s:TrophySave){try{localStorage.setItem(TROPHY_KEY,JSON.stringify(s));}catch{/* storage optional */}}
