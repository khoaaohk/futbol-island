/**
 * Street Dash device save, day streak, Daily Dash claim and the results card's lines (Nov 17 2026). Pure rules with the storage passed
 * in (tests/streetdash-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-streetdash-v1.
 */
import {SD,MEDAL_NAMES,medalFor,nextMedalLine,type DashStats} from './core';

export const STREETDASH_KEY='fi2-streetdash-v1';
/** best: endless best. far: longest run in metres. goals: most volleys on target in one run. daily: today's Daily Dash
 *  (counted = the board run is used). streak: days in a row with a Daily Dash. medal: best medal ever (0-3). tip: next fact. */
export type StreetdashSave={v:1;best:number;far:number;goals:number;medal:number;plays:number;tip:number;daily:{day:string;best:number;counted:boolean;runs:number};streak:{day:string;n:number;best:number}};
export const emptyStreetdashSave=():StreetdashSave=>({v:1,best:0,far:0,goals:0,medal:0,plays:0,tip:0,daily:{day:'',best:0,counted:false,runs:0},streak:{day:'',n:0,best:0}});
export const STREETDASH_SCORE_MAX=3_000_000;
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeStreetdashSave(raw:unknown):StreetdashSave{
 const out=emptyStreetdashSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<StreetdashSave>;
 out.best=int(r.best,STREETDASH_SCORE_MAX);out.far=int(r.far,1e7);out.goals=int(r.goals,1e6);out.medal=int(r.medal,SD.medals.length);out.plays=int(r.plays,1e9);out.tip=int(r.tip,1e9);
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,STREETDASH_SCORE_MAX),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
export const liveStreak=(s:StreetdashSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

export type StreetdashRun={score:number;daily:boolean;day:string;dist:number;stats:DashStats};
export type StreetdashSettled={save:StreetdashSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;newFar:boolean;
 /** Daily only: this run is the day's board run (the first finished one). */dailyFirst:boolean;dailyBest:number;streak:number;streakUp:boolean;tip:StreetdashTip};
export function settleStreetdash(s:StreetdashSave,run:StreetdashRun):StreetdashSettled{
 const score=int(run.score,STREETDASH_SCORE_MAX),dist=int(run.dist,1e7),next:StreetdashSave={...s,daily:{...s.daily},streak:{...s.streak}};
 const medal=medalFor(score),newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);next.plays=s.plays+1;
 const newFar=dist>s.far&&s.far>0;next.far=Math.max(s.far,dist);next.goals=Math.max(s.goals,run.stats.goals+run.stats.crates+run.stats.gates);
 const tip=STREETDASH_TIPS[s.tip%STREETDASH_TIPS.length];next.tip=s.tip+1;
 let newBest=false,previousBest=s.best,dailyFirst=false,streakUp=false;
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,best:0,counted:false,runs:0};
  previousBest=next.daily.best;dailyFirst=!next.daily.counted;newBest=score>next.daily.best&&score>0;
  next.daily={day:run.day,best:Math.max(next.daily.best,score),counted:true,runs:next.daily.runs+1};
  if(next.streak.day!==run.day){const n=next.streak.day===dayBefore(run.day)?next.streak.n+1:1;next.streak={day:run.day,n,best:Math.max(next.streak.best,n)};streakUp=true;}
 }else{newBest=score>s.best&&score>0;next.best=Math.max(s.best,score);}
 return {save:next,newBest,previousBest,medal,newMedal,newFar,dailyFirst,dailyBest:next.daily.day===run.day?next.daily.best:0,streak:liveStreak(next,run.day),streakUp,tip};
}

/** One football idea per results card (AGENTS.md: every feature teaches). Short sentences, no idioms. */
export type StreetdashTip={title:string;line:string};
export const STREETDASH_TIPS:readonly StreetdashTip[]=[
 {title:'Close control',line:'A good dribbler touches the ball with almost every step. The ball never rolls far from the feet.'},
 {title:'Look up early',line:'Look up before the ball reaches you. Then you already know where the space is.'},
 {title:'Ride the tackle',line:'When a defender slides in, a quick hop keeps you and the ball out of the tackle.'},
 {title:'Shoot from the run',line:'A shot struck while running needs the ball just in front of your standing foot.'},
 {title:'Street football',line:'Many great players learned in streets and on beaches. Small spaces teach quick feet.'},
 {title:'Change of pace',line:'Slow down to draw a defender in, then speed up past them. Pace changes beat tackles.'},
 {title:'Beach football',line:'Sand slows the ball. Beach players lift it and volley it more than players on grass.'},
];

/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;daily:boolean;stats:DashStats}):string{
 const m=nextMedalLine(o.score),close=m.next&&m.gap<=Math.max(150,SD.medals[m.medal]*.25);
 if(o.newBest&&o.best>0)return `New best by ${o.score-o.best}. Can you do it again?`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(200,o.best*.2))return `${o.best-o.score} points from your ${o.daily?'best today':'best'}`;
 if(close)return `${m.gap} ${m.gap===1?'point':'points'} from ${m.next}`;
 if(o.stats.volleys===0)return 'Tap the glowing target to shoot. Goals score big.';
 if(o.stats.bestStreak<3)return 'Hit three targets without a hit for a x2.5 streak';
 if(m.next)return `${m.gap} points from ${m.next}`;
 return `You hold the ${MEDAL_NAMES[MEDAL_NAMES.length-1]} medal. Beat your best!`;
}
/** One coaching cue for the end of the run, from what ended it. */
export function coachLine(stats:DashStats,lastHit:string):string{
 if(lastHit==='fall')return 'Jump at the edge of a gap. Hold the tap to fly further.';
 if(lastHit==='banner')return 'Swipe down to slide under banners.';
 if(lastHit==='dog')return 'Jump over the dog before it reaches the ball.';
 if(lastHit==='tackle')return 'Tackles slide in fast. Jump as they start to slide.';
 if(lastHit==='puddle')return 'Jump puddles. A slide splashes too.';
 if(lastHit==='gate')return 'Shoot the cone gate open, or hold the tap for a big jump.';
 if(stats.near===0)return 'Jump late, just before a hazard, for a near-miss bonus.';
 return 'Look at the right edge of the screen. The next hazard shows there first.';
}

/* ---- browser side ---- */
export function readStreetdashSave():StreetdashSave{try{return sanitizeStreetdashSave(JSON.parse(localStorage.getItem(STREETDASH_KEY)??'null'));}catch{return emptyStreetdashSave();}}
export function writeStreetdashSave(s:StreetdashSave){try{localStorage.setItem(STREETDASH_KEY,JSON.stringify(s));}catch{/* storage optional */}}
