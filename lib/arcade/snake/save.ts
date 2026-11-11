/**
 * Squad Snake device save, day streak, Daily Squad claim and the results card's lines (Nov 10 2026). Pure rules with the storage
 * passed in (tests/snake-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-snake-v1.
 */
import {SN,SHAPES,CALLS,MEDAL_NAMES,POS,POS_NAME,medalFor,nextMedalLine,shapeOfCode,shapeName,type SnakeStats} from './core';

export const SNAKE_KEY='fi2-snake-v1';
/** best: endless best. daily: today's Daily Squad (counted = the board run is used). streak: consecutive days with a Daily Squad.
 *  medal: best medal ever (0-4). plays: finished runs. fact: which fact shows next. shapes: bit i = SHAPES[i] built at least once.
 *  squads: most Full Squads in one run. pad: the on-screen d-pad setting. */
export type SnakeSave={v:1;best:number;medal:number;plays:number;fact:number;shapes:number;squads:number;pad:boolean;daily:{day:string;best:number;counted:boolean;runs:number};streak:{day:string;n:number;best:number}};
export const emptySnakeSave=():SnakeSave=>({v:1,best:0,medal:0,plays:0,fact:0,shapes:0,squads:0,pad:false,daily:{day:'',best:0,counted:false,runs:0},streak:{day:'',n:0,best:0}});
export const SNAKE_SCORE_MAX=3_000_000;
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeSnakeSave(raw:unknown):SnakeSave{
 const out=emptySnakeSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<SnakeSave>;
 out.best=int(r.best,SNAKE_SCORE_MAX);out.medal=int(r.medal,SN.medals.length);out.plays=int(r.plays,1e9);out.fact=int(r.fact,1e9);out.shapes=int(r.shapes,(1<<SHAPES.length)-1);out.squads=int(r.squads,9999);out.pad=r.pad===true;
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,SNAKE_SCORE_MAX),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
/** The calendar day before a YYYY-MM-DD day (local calendar, DST-safe: built from parts at noon). */
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
/** The streak as it stands today: alive when the last Daily Squad was today or yesterday, else 0. */
export const liveStreak=(s:SnakeSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

/** line = the positions joined when the run ended [gk, d, m, f]; level = the level reached; cause = core CAUSE. */
export type SnakeRun={score:number;daily:boolean;day:string;stats:SnakeStats;joined:number;line:readonly [number,number,number,number];level:number;cause:number;call:number};
export type SnakeSettled={save:SnakeSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;newShape:boolean;
 /** Daily Squad only: this run is the day's board run (the first finished one). */dailyFirst:boolean;dailyBest:number;streak:number;streakUp:boolean;fact:SnakeFact};
/** Applies a finished run to the save. Idempotence is the caller's job (called once per run end). */
export function settleSnake(s:SnakeSave,run:SnakeRun):SnakeSettled{
 const score=int(run.score,SNAKE_SCORE_MAX),next:SnakeSave={...s,daily:{...s.daily},streak:{...s.streak}};
 const medal=medalFor(score),newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);next.plays=s.plays+1;next.squads=Math.max(s.squads,run.stats.squads);
 const shapes=int(run.stats.shapes,(1<<SHAPES.length)-1),newShape=(shapes&~s.shapes)!==0;next.shapes=s.shapes|shapes;
 const fact=factFor(run,s.fact);next.fact=s.fact+1;
 let newBest=false,previousBest=s.best,dailyFirst=false,streakUp=false;
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,best:0,counted:false,runs:0};
  previousBest=next.daily.best;dailyFirst=!next.daily.counted;newBest=score>next.daily.best&&score>0;
  next.daily={day:run.day,best:Math.max(next.daily.best,score),counted:true,runs:next.daily.runs+1};
  if(next.streak.day!==run.day){const n=next.streak.day===dayBefore(run.day)?next.streak.n+1:1;next.streak={day:run.day,n,best:Math.max(next.streak.best,n)};streakUp=true;}
 }else{newBest=score>s.best&&score>0;next.best=Math.max(s.best,score);}
 return {save:next,newBest,previousBest,medal,newMedal,newShape,dailyFirst,dailyBest:next.daily.day===run.day?next.daily.best:0,streak:liveStreak(next,run.day),streakUp,fact};
}

/** One football idea per results card (AGENTS.md: every feature teaches). Short enough for a 7-year-old to read. `key` is a shape
 *  ('4-4-2'), a position ('gk' | 'def' | 'mid' | 'fwd') or 'numbers'. */
export type SnakeFact={key:string;title:string;line:string};
export const SNAKE_FACTS:readonly SnakeFact[]=[
 {key:'4-4-2',title:'4-4-2',line:'Four defenders, four midfielders, two strikers. Two lines of four are hard to pass through, and the strikers hunt as a pair.'},
 {key:'4-4-2',title:'4-4-2: the strike pair',line:'With two strikers, one can drop short for the ball while the other runs in behind the defenders.'},
 {key:'4-3-3',title:'4-3-3',line:'Three forwards stretch the pitch. The two wingers stay wide near the touchlines, which opens space in the middle.'},
 {key:'4-3-3',title:'4-3-3: the midfield three',line:'Three midfielders make triangles, so the player on the ball always has two team-mates to pass to.'},
 {key:'3-5-2',title:'3-5-2',line:'Five in midfield means lots of passing options. The two wide ones are wing-backs: they run the whole touchline to attack and defend.'},
 {key:'3-5-2',title:'3-5-2: three at the back',line:'Three centre-backs cover each other: one goes to the ball, the other two guard the space behind.'},
 {key:'3-4-3',title:'3-4-3',line:'Three at the back and three up front: a brave, attacking shape. Everybody has to be comfortable on the ball.'},
 {key:'4-5-1',title:'4-5-1',line:'One striker up front and five in midfield. The lone striker shields the ball until team-mates arrive to help.'},
 {key:'5-3-2',title:'5-3-2',line:'Five defenders are very hard to score against. The team wins the ball, then breaks forward fast: a counter-attack.'},
 {key:'5-4-1',title:'5-4-1',line:'The most careful shape: nine players behind the ball. Teams use it to protect a lead late in a match.'},
 {key:'numbers',title:'Reading the numbers',line:'A formation counts from the back: defenders, then midfielders, then forwards. The goalkeeper is never counted.'},
 {key:'gk',title:'The goalkeeper',line:'The keeper is the only player who may use hands, and only inside their own penalty area.'},
 {key:'gk',title:'Number 1',line:'The keeper sees the whole pitch, so good keepers talk all match and tell defenders where to stand.'},
 {key:'def',title:'Defenders',line:'Defenders protect the goal. A good one stays between the attacker and the goal, and waits for the right moment to tackle.'},
 {key:'def',title:'Full-backs',line:'The defenders on the left and right are full-backs. They defend the wide areas and often join the attack.'},
 {key:'mid',title:'Midfielders',line:'Midfielders link defence and attack. They run the most, and look around before the ball arrives.'},
 {key:'mid',title:'The engine room',line:'The middle of the pitch is where most passes go through. Win the midfield and you usually have more of the ball.'},
 {key:'fwd',title:'Forwards',line:'Forwards play closest to the other goal. Their runs pull defenders out of place, even when they do not get the ball.'},
 {key:'fwd',title:'Strikers and wingers',line:'A striker plays in the middle and finishes chances. A winger plays wide, runs at defenders and crosses the ball.'},
];
const POS_KEY=['gk','gk','def','mid','fwd'] as const;
/** The fact for a run: about the best shape built; with no squad, about the position the child was collecting (rotates by `turn`). */
export function factFor(run:Pick<SnakeRun,'stats'|'line'>,turn:number):SnakeFact{
 const shape=shapeOfCode(run.stats.bestCode),[gk,d,m,f]=run.line;
 let key:string=shape||POS_KEY[f>0?POS.fwd:m>0?POS.mid:d>0?POS.def:gk?POS.def:POS.gk];
 if(shape&&turn%4===3)key='numbers';// every fourth card explains how the numbers are read
 const pool=SNAKE_FACTS.filter(x=>x.key===key);return pool.length?pool[turn%pool.length]:SNAKE_FACTS[turn%SNAKE_FACTS.length];
}

/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;joined:number;stats:SnakeStats;daily:boolean;call:number}):string{
 const left=SN.squad-o.joined,m=nextMedalLine(o.score),close=m.next&&m.gap<=Math.max(80,SN.medals[m.medal]*.25),call=CALLS[o.call]??CALLS[0];
 if(o.joined>=6&&left>0)return `${left} ${left===1?'player':'players'} from a Full Squad`;
 if(close)return `${m.gap} ${m.gap===1?'point':'points'} from ${m.next}`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(100,o.best*.2))return `${o.best-o.score} from your ${o.daily?'best today':'best'}`;
 if(o.joined>=2&&left>0)return `${left} players from a Full Squad`;
 if(o.stats.squads>0&&o.stats.calls===0)return `Build the coach’s ${shapeName(call[0],call[1],call[2])} for double points`;
 if(m.next)return `${m.gap} points from ${m.next}`;
 return `You hold the ${MEDAL_NAMES[MEDAL_NAMES.length-1]} medal. Beat your best!`;
}
/** Why the run ended, as one coaching cue. cause: core CAUSE (1 touchline, 2 own line, 3 tackled). */
export function coachLine(cause:number):string{
 if(cause===1)return 'You ran out of the pitch. Turn one cell early: swipe before the touchline.';
 if(cause===2)return 'You ran into your own line. Leave a lane open behind you, like a team keeping its shape.';
 if(cause===3)return 'A pressing defender got you. Watch their lane and cross it just after they pass.';
 return 'Head up: look where the space is before you turn.';
}
/** What the child built, for the results card: "4-3-3" or, without a squad, the line so far ("GK + 3 defenders"). */
export function builtLine(stats:SnakeStats,line:readonly [number,number,number,number]):string{
 const shape=shapeOfCode(stats.bestCode);if(shape)return shape;const [gk,d,m,f]=line;
 if(!gk)return 'No keeper yet';const parts=[`${d} ${POS_NAME[POS.def].toLowerCase()}${d===1?'':'s'}`];if(m)parts.push(`${m} mid`);if(f)parts.push(`${f} fwd`);return d?`Keeper + ${parts.join(' + ')}`:'Keeper in goal';
}

/* ---- browser side ---- */
export function readSnakeSave():SnakeSave{try{return sanitizeSnakeSave(JSON.parse(localStorage.getItem(SNAKE_KEY)??'null'));}catch{return emptySnakeSave();}}
export function writeSnakeSave(s:SnakeSave){try{localStorage.setItem(SNAKE_KEY,JSON.stringify(s));}catch{/* storage optional */}}
