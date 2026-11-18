/**
 * Clear the Box device save, day streak, Daily Drill claim and the results card's lines (Nov 17 2026). Pure rules with the storage
 * passed in (tests/clearbox-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-clearbox-v1.
 */
import {CB,MEDAL_NAMES,medalFor,nextMedalLine,type BoxStats} from './core';

export const CLEARBOX_KEY='fi2-clearbox-v1';
/** best: endless best. daily: today's Daily Drill (counted = the board run is used). streak: days in a row with a Daily Drill.
 *  medal: best medal ever (0-3). plays: finished runs. boxes / clean: most boxes in one run, longest clean-box streak. tip: next fact. */
export type ClearboxSave={v:1;best:number;medal:number;plays:number;boxes:number;clean:number;tip:number;daily:{day:string;best:number;counted:boolean;runs:number};streak:{day:string;n:number;best:number}};
export const emptyClearboxSave=():ClearboxSave=>({v:1,best:0,medal:0,plays:0,boxes:0,clean:0,tip:0,daily:{day:'',best:0,counted:false,runs:0},streak:{day:'',n:0,best:0}});
export const CLEARBOX_SCORE_MAX=3_000_000;
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeClearboxSave(raw:unknown):ClearboxSave{
 const out=emptyClearboxSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<ClearboxSave>;
 out.best=int(r.best,CLEARBOX_SCORE_MAX);out.medal=int(r.medal,CB.medals.length);out.plays=int(r.plays,1e9);out.boxes=int(r.boxes,1e6);out.clean=int(r.clean,1e6);out.tip=int(r.tip,1e9);
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,CLEARBOX_SCORE_MAX),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
export const liveStreak=(s:ClearboxSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

export type ClearboxRun={score:number;daily:boolean;day:string;stats:BoxStats;level:number};
export type ClearboxSettled={save:ClearboxSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;
 /** Daily only: this run is the day's board run (the first finished one). */dailyFirst:boolean;dailyBest:number;streak:number;streakUp:boolean;tip:ClearboxTip};
export function settleClearbox(s:ClearboxSave,run:ClearboxRun):ClearboxSettled{
 const score=int(run.score,CLEARBOX_SCORE_MAX),next:ClearboxSave={...s,daily:{...s.daily},streak:{...s.streak}};
 const medal=medalFor(score),newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);next.plays=s.plays+1;
 next.boxes=Math.max(s.boxes,run.stats.boxes);next.clean=Math.max(s.clean,run.stats.bestClean);const tip=CLEARBOX_TIPS[s.tip%CLEARBOX_TIPS.length];next.tip=s.tip+1;
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
export type ClearboxTip={title:string;line:string};
export const CLEARBOX_TIPS:readonly ClearboxTip[]=[
 {title:'Run into space',line:'A run only works if there is space to run into. Look up before you go.'},
 {title:'Make the space',line:'When one player runs away, they leave space behind them. A team-mate can use it.'},
 {title:'Time your run',line:'Go too early and you run into a defender. Wait for the gap, then go.'},
 {title:'Read the box',line:'At a corner kick the box is crowded. Good players find the one free lane.'},
 {title:'Defenders hold',line:'Some defenders never move. You cannot run through them. Run around them.'},
 {title:'Check your shoulder',line:'Before you get the ball, look over your shoulder. Know where the free space is.'},
 {title:'Clear the lines',line:'A team that moves the ball fast pulls defenders away and opens lanes for others.'},
];

/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;daily:boolean;stats:BoxStats}):string{
 const m=nextMedalLine(o.score),close=m.next&&m.gap<=Math.max(150,CB.medals[m.medal]*.25);
 if(o.newBest&&o.best>0)return `New best by ${o.score-o.best}. Can you do it again?`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(200,o.best*.2))return `${o.best-o.score} points from your ${o.daily?'best today':'best'}`;
 if(close)return `${m.gap} ${m.gap===1?'point':'points'} from ${m.next}`;
 if(o.stats.bestClean<2&&o.stats.boxes>=2)return 'Clear two boxes in a row with no foul for a clean streak';
 if(m.next)return `${m.gap} points from ${m.next}`;
 return `You hold the ${MEDAL_NAMES[MEDAL_NAMES.length-1]} medal. Beat your best!`;
}
/** One coaching cue for the end of the run. */
export function coachLine(stats:BoxStats,why:''|'fouls'|'clock'):string{
 if(why==='clock')return 'The clock ran out. Start with the beans on the edge: they have the shortest run.';
 if(stats.boxes===0)return 'Look along the arrow first. Only tap a bean when nobody stands in its lane.';
 if(stats.fouls>=3)return 'Three fouls end the run. Check the whole lane before you tap.';
 return 'Clear the beans that block others first. Each one that leaves makes space.';
}

/* ---- browser side ---- */
export function readClearboxSave():ClearboxSave{try{return sanitizeClearboxSave(JSON.parse(localStorage.getItem(CLEARBOX_KEY)??'null'));}catch{return emptyClearboxSave();}}
export function writeClearboxSave(s:ClearboxSave){try{localStorage.setItem(CLEARBOX_KEY,JSON.stringify(s));}catch{/* storage optional */}}
