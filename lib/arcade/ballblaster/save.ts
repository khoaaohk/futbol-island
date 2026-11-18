/**
 * Ball Blaster device save, day streak, Daily Blast claim and the results card's lines (Nov 17 2026). Pure rules with the storage passed
 * in (tests/ballblaster-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-ballblaster-v1.
 */
import {BB,K,MEDAL_NAMES,medalFor,nextMedalLine,type BlastStats} from './core';

export const BALLBLASTER_KEY='fi2-ballblaster-v1';
/** best: endless best. wave: furthest wave reached. trick: most breaks with one ball. daily: today's Daily Blast (counted = the board
 *  run is used). streak: days in a row with a Daily Blast. medal: best medal ever (0-3). tip: next fact. */
export type BallblasterSave={v:1;best:number;wave:number;trick:number;medal:number;plays:number;tip:number;daily:{day:string;best:number;counted:boolean;runs:number};streak:{day:string;n:number;best:number}};
export const emptyBallblasterSave=():BallblasterSave=>({v:1,best:0,wave:0,trick:0,medal:0,plays:0,tip:0,daily:{day:'',best:0,counted:false,runs:0},streak:{day:'',n:0,best:0}});
export const BALLBLASTER_SCORE_MAX=9_000_000;
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeBallblasterSave(raw:unknown):BallblasterSave{
 const out=emptyBallblasterSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<BallblasterSave>;
 out.best=int(r.best,BALLBLASTER_SCORE_MAX);out.wave=int(r.wave,1e5);out.trick=int(r.trick,1e4);out.medal=int(r.medal,BB.medals.length);out.plays=int(r.plays,1e9);out.tip=int(r.tip,1e9);
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,BALLBLASTER_SCORE_MAX),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
export const liveStreak=(s:BallblasterSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

export type BallblasterRun={score:number;daily:boolean;day:string;wave:number;stats:BlastStats};
export type BallblasterSettled={save:BallblasterSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;newWave:boolean;
 /** Daily only: this run is the day's board run (the first finished one). */dailyFirst:boolean;dailyBest:number;streak:number;streakUp:boolean;tip:BallblasterTip};
export function settleBallblaster(s:BallblasterSave,run:BallblasterRun):BallblasterSettled{
 const score=int(run.score,BALLBLASTER_SCORE_MAX),wave=int(run.wave,1e5),next:BallblasterSave={...s,daily:{...s.daily},streak:{...s.streak}};
 const medal=medalFor(score),newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);next.plays=s.plays+1;
 const newWave=wave>s.wave&&s.wave>0;next.wave=Math.max(s.wave,wave);next.trick=Math.max(s.trick,int(run.stats.bestTrick,1e4));
 const tip=BALLBLASTER_TIPS[s.tip%BALLBLASTER_TIPS.length];next.tip=s.tip+1;
 let newBest=false,previousBest=s.best,dailyFirst=false,streakUp=false;
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,best:0,counted:false,runs:0};
  previousBest=next.daily.best;dailyFirst=!next.daily.counted;newBest=score>next.daily.best&&score>0;
  next.daily={day:run.day,best:Math.max(next.daily.best,score),counted:true,runs:next.daily.runs+1};
  if(next.streak.day!==run.day){const n=next.streak.day===dayBefore(run.day)?next.streak.n+1:1;next.streak={day:run.day,n,best:Math.max(next.streak.best,n)};streakUp=true;}
 }else{newBest=score>s.best&&score>0;next.best=Math.max(s.best,score);}
 return {save:next,newBest,previousBest,medal,newMedal,newWave,dailyFirst,dailyBest:next.daily.day===run.day?next.daily.best:0,streak:liveStreak(next,run.day),streakUp,tip};
}

/** One football idea per results card (AGENTS.md: every feature teaches). Short sentences, no idioms. */
export type BallblasterTip={title:string;line:string};
export const BALLBLASTER_TIPS:readonly BallblasterTip[]=[
 {title:'Pick your target',line:'Good strikers choose where the ball will go before they kick. Look at the spot, then shoot.'},
 {title:'Strike through the ball',line:'Keep your eyes on the ball and follow through toward the target. The ball goes where your foot points.'},
 {title:'Laces for power',line:'A shot with the laces is the hardest kick. Point your toe down and lock your ankle.'},
 {title:'Inside foot for the curl',line:'Kick across the ball with the inside of your foot and it spins and bends. Players curl free kicks around a wall.'},
 {title:'Accuracy beats power',line:'A shot on target can score. A hard shot that misses never does. Pick a corner first.'},
 {title:'Rebounds',line:'Many goals come from a rebound. Strikers follow their shot in case the ball bounces back.'},
 {title:'Keep calm',line:'When many things happen at once, deal with the closest danger first. Defenders do the same.'},
];

/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;daily:boolean;stats:BlastStats}):string{
 const m=nextMedalLine(o.score),close=m.next&&m.gap<=Math.max(500,BB.medals[m.medal]*.25);
 if(o.newBest&&o.best>0)return `New best by ${o.score-o.best}. Can you do it again?`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(500,o.best*.2))return `${o.best-o.score} points from your ${o.daily?'best today':'best'}`;
 if(close)return `${m.gap} ${m.gap===1?'point':'points'} from ${m.next}`;
 if(o.stats.tricks===0)return 'Break two things with one ball for a trick bonus.';
 if(o.stats.bestCombo<4)return 'Break things quickly, one after another, to build the combo.';
 if(m.next)return `${m.gap} points from ${m.next}`;
 return `You hold the ${MEDAL_NAMES[MEDAL_NAMES.length-1]} medal. Beat your best!`;
}
/** One coaching cue for the end of the run, from the machine that got through last. */
export function coachLine(stats:BlastStats,lastLeak:number):string{
 if(lastLeak===K.cone)return 'Cone-bots are fast. Shoot them first, while they are still far away.';
 if(lastLeak===K.dummy)return 'Dummies hop. Shoot when they land, or aim a little lower.';
 if(lastLeak===K.drone)return 'Drones fly. Aim at the drone itself, not the grass under it.';
 if(lastLeak===K.shield)return 'Shields block straight shots. Flick sideways as you let go to curl the ball round.';
 if(lastLeak===K.dodger)return 'Dodgers jump aside. Shoot just beside them, where they will step.';
 if(lastLeak===K.armour)return 'Armour needs two hits. Hold longer for a full-power shot that breaks it at once.';
 if(lastLeak===K.boss)return 'Hit the Mega Mannequin early and often. Clear its helpers when they come.';
 if(stats.shots>0&&stats.hits/stats.shots<.5)return 'Aim at the middle of the target. Fewer, calmer shots save balls.';
 return 'Watch the machine closest to your goal. That one is the danger.';
}

/* ---- browser side ---- */
export function readBallblasterSave():BallblasterSave{try{return sanitizeBallblasterSave(JSON.parse(localStorage.getItem(BALLBLASTER_KEY)??'null'));}catch{return emptyBallblasterSave();}}
export function writeBallblasterSave(s:BallblasterSave){try{localStorage.setItem(BALLBLASTER_KEY,JSON.stringify(s));}catch{/* storage optional */}}
