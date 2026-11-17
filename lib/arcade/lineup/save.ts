/**
 * Line Up! device save, day streak, Daily Line-Up claim and the results card's lines (Nov 17 2026). Pure rules with the storage
 * passed in (tests/lineup-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-lineup-v1.
 */
import {LU,MEDAL_NAMES,medalFor,nextMedalLine,type LineStats} from './core';

export const LINEUP_KEY='fi2-lineup-v1';
/** best: endless best. daily: today's Daily Line-Up (counted = the board run is used). streak: days in a row with a Daily Line-Up.
 *  medal: best medal ever (0-3). plays: finished runs. lines / combo: most lines in one run, most lines with one piece. tip: next fact. */
export type LineupSave={v:1;best:number;medal:number;plays:number;lines:number;combo:number;tip:number;daily:{day:string;best:number;counted:boolean;runs:number};streak:{day:string;n:number;best:number}};
export const emptyLineupSave=():LineupSave=>({v:1,best:0,medal:0,plays:0,lines:0,combo:0,tip:0,daily:{day:'',best:0,counted:false,runs:0},streak:{day:'',n:0,best:0}});
export const LINEUP_SCORE_MAX=3_000_000;
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeLineupSave(raw:unknown):LineupSave{
 const out=emptyLineupSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<LineupSave>;
 out.best=int(r.best,LINEUP_SCORE_MAX);out.medal=int(r.medal,LU.medals.length);out.plays=int(r.plays,1e9);out.lines=int(r.lines,1e6);out.combo=int(r.combo,16);out.tip=int(r.tip,1e9);
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,LINEUP_SCORE_MAX),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
export const liveStreak=(s:LineupSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

export type LineupRun={score:number;daily:boolean;day:string;stats:LineStats;level:number};
export type LineupSettled={save:LineupSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;
 /** Daily only: this run is the day's board run (the first finished one). */dailyFirst:boolean;dailyBest:number;streak:number;streakUp:boolean;tip:LineupTip};
export function settleLineup(s:LineupSave,run:LineupRun):LineupSettled{
 const score=int(run.score,LINEUP_SCORE_MAX),next:LineupSave={...s,daily:{...s.daily},streak:{...s.streak}};
 const medal=medalFor(score),newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);next.plays=s.plays+1;
 next.lines=Math.max(s.lines,run.stats.lines);next.combo=Math.max(s.combo,run.stats.bestCombo);const tip=LINEUP_TIPS[s.tip%LINEUP_TIPS.length];next.tip=s.tip+1;
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
export type LineupTip={title:string;line:string};
export const LINEUP_TIPS:readonly LineupTip[]=[
 {title:'The back line',line:'Defenders stand in a line across the pitch. A gap in the line is where an attacker runs through.'},
 {title:'Keep your shape',line:'A team that keeps its shape is hard to beat. Every player knows their space and stays close to it.'},
 {title:'Step up together',line:'When the back line steps forward, all four step at the same time. One player left behind breaks the line.'},
 {title:'Two banks of four',line:'Many teams defend with two lines of four: defenders, then midfielders just in front of them.'},
 {title:'Fill the space',line:'When a team-mate leaves their place, the nearest player slides over to fill the gap.'},
 {title:'Width',line:'In attack, the team spreads out wide. In defence, it squeezes in close. Good teams switch fast.'},
 {title:'The referee',line:'The referee runs into the best spot to see the play. Players must play around the referee.'},
];

/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;daily:boolean;stats:LineStats}):string{
 const m=nextMedalLine(o.score),close=m.next&&m.gap<=Math.max(150,LU.medals[m.medal]*.25);
 if(o.newBest&&o.best>0)return `New best by ${o.score-o.best}. Can you do it again?`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(200,o.best*.2))return `${o.best-o.score} points from your ${o.daily?'best today':'best'}`;
 if(close)return `${m.gap} ${m.gap===1?'point':'points'} from ${m.next}`;
 if(o.stats.bestCombo<2&&o.stats.lines>=2)return 'Clear two lines with one piece for a combo';
 if(o.stats.bestStreak<2&&o.stats.lines>=2)return 'Clear on two placements in a row for a streak';
 if(m.next)return `${m.gap} points from ${m.next}`;
 return `You hold the ${MEDAL_NAMES[MEDAL_NAMES.length-1]} medal. Beat your best!`;
}
/** One coaching cue for the end of the run. */
export function coachLine(stats:LineStats,filled:number):string{
 if(stats.lines===0)return 'Fill a whole row or column to clear it. Start along one edge.';
 if(filled>=40)return 'The pitch got crowded. Clear lines early and keep the middle open for big shapes.';
 if(stats.bestCombo<2)return 'Build two lines side by side, then finish both with one piece.';
 return 'Look at all three shapes first. Place the big one while there is room.';
}

/* ---- browser side ---- */
export function readLineupSave():LineupSave{try{return sanitizeLineupSave(JSON.parse(localStorage.getItem(LINEUP_KEY)??'null'));}catch{return emptyLineupSave();}}
export function writeLineupSave(s:LineupSave){try{localStorage.setItem(LINEUP_KEY,JSON.stringify(s));}catch{/* storage optional */}}
