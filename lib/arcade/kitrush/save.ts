/**
 * Kit Rush device save, day streak, Daily Rush claim and the results card's lines (Nov 10 2026). Pure rules with the storage
 * passed in (tests/kitrush-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-kitrush-v1.
 */
import {KR,MEDAL_NAMES,medalFor,nextMedalLine,callFor,type KitStats} from './core';

export const KITRUSH_KEY='fi2-kitrush-v1';
/** best: endless best. daily: today's Daily Rush (counted = the board run is used). streak: consecutive days with a Daily Rush.
 *  medal: best medal ever (0-4). plays: finished runs. fact: which football fact shows next. */
export type KitRushSave={v:1;best:number;medal:number;plays:number;fact:number;bestCombo:number;daily:{day:string;best:number;counted:boolean;runs:number};streak:{day:string;n:number;best:number}};
export const emptyKitRushSave=():KitRushSave=>({v:1,best:0,medal:0,plays:0,fact:0,bestCombo:0,daily:{day:'',best:0,counted:false,runs:0},streak:{day:'',n:0,best:0}});
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeKitRushSave(raw:unknown):KitRushSave{
 const out=emptyKitRushSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<KitRushSave>;
 out.best=int(r.best,400_000);out.medal=int(r.medal,KR.medals.length);out.plays=int(r.plays,1e9);out.fact=int(r.fact,1e9);out.bestCombo=int(r.bestCombo,99);
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,400_000),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
/** The calendar day before a YYYY-MM-DD day (local calendar, DST-safe: built from parts at noon). */
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
/** The streak as it stands today: alive when the last Daily Rush was today or yesterday, else 0. */
export const liveStreak=(s:KitRushSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

export type KitRushRun={score:number;daily:boolean;day:string;stats:KitStats};
export type KitRushSettled={save:KitRushSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;
 /** Daily Rush only: this run is the day's board run (the first finished one). */dailyFirst:boolean;dailyBest:number;streak:number;streakUp:boolean;fact:KitFact};
/** Applies a finished run to the save. Idempotence is the caller's job (called once per run end). */
export function settleKitRush(s:KitRushSave,run:KitRushRun):KitRushSettled{
 const score=int(run.score,400_000),next:KitRushSave={...s,daily:{...s.daily},streak:{...s.streak}};
 const medal=medalFor(score),newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);next.plays=s.plays+1;next.bestCombo=Math.max(s.bestCombo,run.stats.bestCombo);
 const fact=KIT_FACTS[s.fact%KIT_FACTS.length];next.fact=(s.fact+1)%KIT_FACTS.length;
 let newBest=false,previousBest=s.best,dailyFirst=false,streakUp=false;
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,best:0,counted:false,runs:0};
  previousBest=next.daily.best;dailyFirst=!next.daily.counted;newBest=score>next.daily.best&&score>0;
  next.daily={day:run.day,best:Math.max(next.daily.best,score),counted:true,runs:next.daily.runs+1};
  if(next.streak.day!==run.day){const n=next.streak.day===dayBefore(run.day)?next.streak.n+1:1;next.streak={day:run.day,n,best:Math.max(next.streak.best,n)};streakUp=true;}
 }else{newBest=score>s.best&&score>0;next.best=Math.max(s.best,score);}
 return {save:next,newBest,previousBest,medal,newMedal,dailyFirst,dailyBest:next.daily.day===run.day?next.daily.best:0,streak:liveStreak(next,run.day),streakUp,fact};
}

/** One football idea per results card, rotated (AGENTS.md: every feature teaches). Short enough for a 7-year-old to read. */
export type KitFact={kind:string;title:string;line:string};
export const KIT_FACTS:readonly KitFact[]=[
 {kind:'shirt',title:'Why two kits?',line:'Each team wears its own colours so players can find a team-mate with one quick look.'},
 {kind:'bib',title:'Training bibs',line:'Coaches hand out bibs so two teams can play in training. Bibs on: you know who to pass to.'},
 {kind:'whistle',title:'The whistle',line:'When the referee blows, play stops. Good players listen for it and stop straight away.'},
 {kind:'armband',title:'The captain’s armband',line:'The captain wears an armband, leads the team and speaks to the referee for everyone.'},
 {kind:'ball',title:'Look before the ball comes',line:'Top midfielders look around before they get the ball, so they already know where to play it.'},
 {kind:'shirt',title:'The keeper’s colour',line:'A goalkeeper wears a different colour from every outfield player, so the referee can spot who may use hands.'},
 {kind:'shirt',title:'Home and away',line:'If two teams’ colours look alike, the away team changes kit. Nobody should have to guess.'},
 {kind:'cone',title:'Cones',line:'Cones mark the space in training. Dribble close to them and keep your head up.'},
 {kind:'bottle',title:'Water breaks',line:'Players drink before, during and after a match. A body with water in it thinks faster.'},
 {kind:'boot',title:'Boots and studs',line:'Studs grip the grass so you can turn sharply. Clean boots grip better than muddy ones.'},
 {kind:'shirt',title:'Stripes, hoops and sashes',line:'Kits differ by pattern as well as colour. Stripes run up and down, hoops go around, a sash crosses the chest.'},
 {kind:'ball',title:'Switch!',line:'When the ball changes sides, everybody’s job changes. The fastest team to react usually wins it back.'},
];

/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;stats:KitStats;daily:boolean}):string{
 const m=nextMedalLine(o.score),close=m.next&&m.gap<=Math.max(120,KR.medals[m.medal]*.3);
 if(close)return `${m.gap} ${m.gap===1?'point':'points'} from ${m.next}`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(100,o.best*.2))return `${o.best-o.score} from your ${o.daily?'best today':'best'}`;
 const c=o.stats.bestCombo,nextCall=callFor(c+1);
 if(c>=2&&c<6&&nextCall)return `Best swipe ${c}: one more for ${nextCall.replace('!','')}`;
 if(m.next)return `${m.gap} points from ${m.next}`;
 return `You hold the ${MEDAL_NAMES[MEDAL_NAMES.length-1]} medal. Beat your best!`;
}
/** Why the run ended, as one coaching cue. */
export function coachLine(stats:KitStats):string{
 if(stats.whistle>stats.rival)return 'The whistle got you. Spot it first, then swipe around it.';
 if(stats.rival>0)return 'You hit the other team’s kit. Check the colour AND the pattern before you swipe.';
 return 'Scan first, then swipe once through your colours.';
}

/* ---- browser side ---- */
export function readKitRushSave():KitRushSave{try{return sanitizeKitRushSave(JSON.parse(localStorage.getItem(KITRUSH_KEY)??'null'));}catch{return emptyKitRushSave();}}
export function writeKitRushSave(s:KitRushSave){try{localStorage.setItem(KITRUSH_KEY,JSON.stringify(s));}catch{/* storage optional */}}
