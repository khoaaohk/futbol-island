/**
 * Jobs upgrade (Oct 25 2026, docs/JOBS_UPGRADE_OCT25.md): the small, pure helpers that make a shift easier to follow and a bit more
 * fun, without touching pay (jobEconomy.ts is unchanged; everything here is cosmetic).
 *
 * - `coachLine`: the one-line "what now" for the moments between actions (walking to the next pile, carrying to the box, heading to
 *   the bin). Before, the panel fell back to the job's whole how-to sentence there; now it names the next target, points at the
 *   arrow and says how many are left.
 * - `createJobStreak`: a rhythm streak (items finished close together) with three capped milestones. Cosmetic only: a line, a chime
 *   and a sparkle, never coins. The offside job counts right calls in a row instead (a wrong call starts again).
 * - `jobPar`: a par time per job (the shift's own play estimate) for a "beat the par" line on the payday card.
 * Heat: no timers and no allocation per frame; `hit` runs once per finished item.
 */
import type {JobRun} from './jobRules';
import {JOB_MINUTES,type JobId} from './jobEconomy';

/** What one target is called in the coach line, per job (a target the player walks to). */
const NOUN:Record<string,[one:string,many:string]>={
 'leaf-rake':['leaf pile','leaf piles'],'cone-setup':['glowing mark','cones'],'court-cleanup':['bottle','bottles'],
 'trail-cleanup':['bit of litter','bits of litter'],'goal-anchor':['glowing peg spot','pegs'],
};
const plural=(n:number,[one,many]:[string,string])=>`${n} ${n===1?one:many}`;

/** The next-step line while walking (no target armed). '' = nothing to add (the caller keeps its own text). */
export function coachLine(r:JobRun):string{
 const d=r.def;if(r.phase==='done'||d.swing)return '';
 if(r.phase==='deliver'&&d.deliver){if(r.at===-2)return '';const act=d.work?.deliver?.label;
  return `All done here! Walk to the ${d.deliver.label} (follow the arrow)${act?` and tap ${act}`:''}.`;}
 if(r.phase!=='work'||r.at!==-1)return '';
 if(d.kind==='carry'){const n=d.targets.length;
  return r.carrying>=0?`Got it! Carry it to the ${d.deliver?.label??'drop-off'} (follow the arrow).`:`Run to loose ball ${Math.min(n,r.next+1)} of ${n} (follow the arrow).`;}
 if(d.kind==='collect'){const noun=NOUN[d.id];if(!noun)return '';const left=r.got.filter(g=>!g).length;if(!left)return '';
  // A pile already raked but not bagged yet: send the player back to finish it first.
  const steps=d.work?.target??[],half=steps.length>1?r.stage.findIndex((s,i)=>s>0&&!r.got[i]):-1;
  if(half>=0)return `Go back to the ${noun[0]} you started and ${steps[r.stage[half]]?.label??'finish it'}.`;
  return `Next: the nearest ${noun[0]} (follow the arrow). ${plural(left,noun)} to go.`;}
 return '';
}

// ---- Rhythm streak ----
/** Seconds allowed between two finished items for the streak to carry on (walks between targets are 2–5 s on most jobs). */
export const STREAK_GAP=7;
/** Milestones (the line, the chime and the sparkle fire only on these; the count is capped at the last). */
export const STREAK_STEPS=[3,5,8] as const;
const STREAK_LINES:Record<number,string>={
 3:'Quick feet! 3 in a row, like a one-two.',
 5:'On a roll! 5 in a row: that is match tempo.',
 8:'Unstoppable! 8 in a row: a captain\'s work rate.',
};
const CALL_LINES:Record<number,string>={
 3:'3 right calls in a row: sharp eyes, ref!',
 5:'5 right calls in a row: World Cup linesman form!',
};
export type StreakHit={count:number;milestone:boolean;line:string};
/** `inRow`: count consecutive successes (offside calls) instead of a time window. */
export function createJobStreak(inRow=false){
 let count=0,last=-Infinity;const out:StreakHit={count:0,milestone:false,line:''};
 return {
  /** One item finished at `now` (the run's seconds). The same result object is reused. */
  hit(now:number):StreakHit{count=inRow||now-last<=STREAK_GAP?Math.min(count+1,STREAK_STEPS[STREAK_STEPS.length-1]):1;last=now;
   const lines=inRow?CALL_LINES:STREAK_LINES,line=lines[count]??'';const fresh=!!line&&count!==out.count;
   out.count=count;out.milestone=fresh;out.line=fresh?line:'';return out;},
  /** A miss / wrong call (offside) or a new shift. */
  reset(){count=0;last=-Infinity;out.count=0;out.milestone=false;out.line='';},
  get count(){return count;},
 };
}
export type JobStreak=ReturnType<typeof createJobStreak>;
/** Which job events count as "one item finished" for the rhythm streak (null = no streak on this job). */
export function streakEvent(def:{id:string;kind:string;prop:string;swing?:boolean},type:string):boolean{
 if(def.swing||def.kind==='trail'||def.kind==='pump'||def.kind==='offside'||def.kind==='rebound')return false;
 if(def.kind==='collect')return type==='collect';
 if(def.kind==='carry'||def.kind==='sort')return type==='return';
 if(def.kind==='garden')return type==='pluck';
 if(def.kind==='harvest')return type==='gather'||type==='twist'||type==='cut';
 return false;
}

// ---- Par time ----
/** The par for a shift (seconds, rounded to 5): 1.5 times the job's own play estimate, so a child who walks still gets there (jobEconomy JOB_MINUTES). Null for the Bug squad,
 *  whose shift length depends on where the swarm is. */
export function jobPar(id:string):number|null{
 if(id==='bug-scout')return null;const m=(JOB_MINUTES as Record<string,number>)[id as JobId];if(!m)return null;
 return Math.max(15,Math.round(m*60*1.5/5)*5);
}
/** The payday line for the time against par ('' = no par for this job). */
export function parLine(id:string,seconds:number):string{
 const p=jobPar(id);if(p===null||!Number.isFinite(seconds)||seconds<=0)return '';
 return seconds<=p?`Under par (${Math.floor(p/60)}:${String(p%60).padStart(2,'0')})! Pro pace.`:`Par is ${Math.floor(p/60)}:${String(p%60).padStart(2,'0')}. Try it again to beat it!`;
}
