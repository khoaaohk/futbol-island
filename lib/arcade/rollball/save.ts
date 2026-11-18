/**
 * Roll It In device save, day streak, Daily Roll claim and the results card's lines (Nov 17 2026). Pure rules with the storage
 * passed in (tests/rollball-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-rollball-v1.
 */
import {RB,MEDAL_NAMES,medalFor,nextMedalLine,type RollStats} from './core';

export const ROLLBALL_KEY='fi2-rollball-v1';
/** best: endless best. daily: today's Daily Roll (counted = the board run is used). streak: days in a row with a Daily Roll.
 *  medal: best medal ever (0-3). plays: finished runs. levels / stars: most levels and stars in one run. tip: next fact. */
export type RollballSave={v:1;best:number;medal:number;plays:number;levels:number;stars:number;tip:number;daily:{day:string;best:number;counted:boolean;runs:number};streak:{day:string;n:number;best:number}};
export const emptyRollballSave=():RollballSave=>({v:1,best:0,medal:0,plays:0,levels:0,stars:0,tip:0,daily:{day:'',best:0,counted:false,runs:0},streak:{day:'',n:0,best:0}});
export const ROLLBALL_SCORE_MAX=3_000_000;
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeRollballSave(raw:unknown):RollballSave{
 const out=emptyRollballSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<RollballSave>;
 out.best=int(r.best,ROLLBALL_SCORE_MAX);out.medal=int(r.medal,RB.medals.length);out.plays=int(r.plays,1e9);out.levels=int(r.levels,1e6);out.stars=int(r.stars,1e6);out.tip=int(r.tip,1e9);
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,ROLLBALL_SCORE_MAX),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
export const liveStreak=(s:RollballSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

export type RollballRun={score:number;daily:boolean;day:string;stats:RollStats;level:number};
export type RollballSettled={save:RollballSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;
 /** Daily only: this run is the day's board run (the first finished one). */dailyFirst:boolean;dailyBest:number;streak:number;streakUp:boolean;tip:RollballTip};
export function settleRollball(s:RollballSave,run:RollballRun):RollballSettled{
 const score=int(run.score,ROLLBALL_SCORE_MAX),next:RollballSave={...s,daily:{...s.daily},streak:{...s.streak}};
 const medal=medalFor(score),newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);next.plays=s.plays+1;
 next.levels=Math.max(s.levels,run.stats.levels);next.stars=Math.max(s.stars,run.stats.stars);const tip=ROLLBALL_TIPS[s.tip%ROLLBALL_TIPS.length];next.tip=s.tip+1;
 let newBest=false,previousBest=s.best,dailyFirst=false,streakUp=false;
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,best:0,counted:false,runs:0};
  previousBest=next.daily.best;dailyFirst=!next.daily.counted;newBest=score>next.daily.best&&score>0;
  next.daily={day:run.day,best:Math.max(next.daily.best,score),counted:true,runs:next.daily.runs+1};
  if(next.streak.day!==run.day){const n=next.streak.day===dayBefore(run.day)?next.streak.n+1:1;next.streak={day:run.day,n,best:Math.max(next.streak.best,n)};streakUp=true;}
 }else{newBest=score>s.best&&score>0;next.best=Math.max(s.best,score);}
 return {save:next,newBest,previousBest,medal,newMedal,dailyFirst,dailyBest:next.daily.day===run.day?next.daily.best:0,streak:liveStreak(next,run.day),streakUp,tip};
}

/** One football idea per results card (AGENTS.md: every feature teaches). Short sentences, no idioms. */
export type RollballTip={title:string;line:string};
export const ROLLBALL_TIPS:readonly RollballTip[]=[
 {title:'Look before you roll',line:'Good players look up before the ball comes. They already know where the next pass goes.'},
 {title:'The pitch matters',line:'A ball rolls fast on short wet grass and slow on long dry grass. Players pass harder on a slow pitch.'},
 {title:'Weight of pass',line:'Too soft and the pass stops short. Too hard and it runs away. Coaches call this the weight of the pass.'},
 {title:'Plan the next touch',line:'Your first touch should move the ball where you want to go next, not just stop it.'},
 {title:'Slopes are real',line:'Some old pitches have a slope. Teams often choose to attack downhill in the second half.'},
 {title:'Sand is hard work',line:'Beach football is played on sand. The ball hardly rolls, so players lift it and play it in the air.'},
 {title:'Rain changes the game',line:'On a wet pitch the ball skids and keeps going. Defenders must stay on their toes.'},
];

/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;daily:boolean;stats:RollStats}):string{
 const m=nextMedalLine(o.score),close=m.next&&m.gap<=Math.max(150,RB.medals[m.medal]*.25);
 if(o.newBest&&o.best>0)return `New best by ${o.score-o.best}. Can you do it again?`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(200,o.best*.2))return `${o.best-o.score} points from your ${o.daily?'best today':'best'}`;
 if(close)return `${m.gap} ${m.gap===1?'point':'points'} from ${m.next}`;
 if(o.stats.perfect<1&&o.stats.levels>=1)return 'Finish a level without losing a heart for a streak bonus';
 if(m.next)return `${m.gap} points from ${m.next}`;
 return `You hold the ${MEDAL_NAMES[MEDAL_NAMES.length-1]} medal. Beat your best!`;
}
/** One coaching cue for the end of the run. */
export function coachLine(stats:RollStats,why:''|'water'|'clock'):string{
 if(why==='clock')return 'The clock ran out. Solve the puzzle first, then roll fast to the goal.';
 if(stats.levels===0)return 'Roll onto the yellow plate. It opens the gate.';
 if(stats.falls>=2)return 'Slow down near the edges. Let go of the stick and the ball slows.';
 return 'Look at the whole puzzle first. Which plate opens which gate?';
}

/* ---- browser side ---- */
export function readRollballSave():RollballSave{try{return sanitizeRollballSave(JSON.parse(localStorage.getItem(ROLLBALL_KEY)??'null'));}catch{return emptyRollballSave();}}
export function writeRollballSave(s:RollballSave){try{localStorage.setItem(ROLLBALL_KEY,JSON.stringify(s));}catch{/* storage optional */}}
