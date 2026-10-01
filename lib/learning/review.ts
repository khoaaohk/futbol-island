/**
 * Spaced review for the Paths lessons (docs/learning/spaced-review.md). Pure rules: no storage, no timers.
 *
 * A lesson joins the review schedule the first time its quiz is passed (every question has a saved correct answer). It is
 * then due from the start of the next local day; each correct review moves it to the next box (1 → 3 → 7 → 14 → 30 days), a missed review drops it
 * one box and brings it back tomorrow. The Daily warm-up asks ONE short question per due lesson, at most
 * REVIEW_SESSION_SIZE lessons at a time. No streaks, no penalty for missed days: an overdue lesson simply waits.
 *
 * Mastery stages (same names as the pilot journeys, lib/town/learningJourneys.ts):
 *   Introduced — watched some of it, answered some of it, or spotted it around the island;
 *   Practicing — passed the lesson quiz (retries are practice);
 *   Applied    — got it right in a new setting: a spaced review, or a book "Take it to your game" check;
 *   Remembered — right again at two spaced reviews (the second at least 3 days after the first), so days later.
 */
export const DAY=24*60*60*1000;
/**
 * Local midnight `days` local days after the local day of `t` (QA11: reviews are due from the START of the day, so a lesson
 * passed at 17:30 is due first thing tomorrow, not at 17:30 tomorrow). Built from calendar fields, never `+ n*DAY`, so month
 * ends and DST days (23 or 25 hours) land on the right midnight in the player's own time zone.
 */
export function localDayStart(t:number,days=0):number{const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),d.getDate()+days).getTime();}
/** Whole local days from the day of `from` to the day of `to` (DST-safe: rounds the 23/25-hour days). */
export const localDaysBetween=(from:number,to:number)=>Math.round((localDayStart(to)-localDayStart(from))/DAY);
export const REVIEW_INTERVALS_DAYS=[1,3,7,14,30] as const;
/** Lessons in one warm-up. */
export const REVIEW_SESSION_SIZE=3;
/** How many correct warm-up answers are paid per local day (LEARN_COINS.review each; docs/economy/ECONOMY_UPDATE_2026-09-30.md). */
export const REVIEW_PAID_PER_DAY=3;
/** Box reached after the review that proves "Remembered". */
export const REMEMBERED_BOX=2;
export type Stage='new'|'introduced'|'practicing'|'applied'|'remembered';
export const STAGES:Stage[]=['new','introduced','practicing','applied','remembered'];
export const STAGE_LABEL:Record<Stage,string>={new:'Not started',introduced:'Introduced',practicing:'Practicing',applied:'Applied',remembered:'Remembered'};
export const STAGE_DETAIL:Record<Stage,string>={
 new:'Not tried yet.',
 introduced:'You have seen this idea.',
 practicing:'You passed the quiz. Retries count as practice.',
 applied:'You used the idea in a new place: a review or a book check.',
 remembered:'You still knew it days later. That is real learning!',
};
export type ReviewRecord={enrolled:number;box:number;due:number;right:number;wrong:number;last?:number;
 /** The last review was missed: the warm-up asks it first. */
 missed?:boolean;
 /** Right answers in a new setting outside the warm-up (book checks). */
 applied?:number;
 /** "Seen around the island": magazines, jobs, fishing, the ball hunt, match callouts tapped. Evidence only, never schedule. */
 ticks?:number;sources?:string[]};
export type ReviewState={version:1;lessons:Record<string,ReviewRecord>;paid:{day:string;count:number}};
export const emptyReview=():ReviewState=>({version:1,lessons:{},paid:{day:'',count:0}});

const num=(v:unknown,min=0)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,v):min;
export function sanitizeReview(raw:unknown,validKey:(key:string)=>boolean=()=>true):ReviewState{
 const out=emptyReview();if(!raw||typeof raw!=='object')return out;const v=raw as Partial<ReviewState>;
 if(v.lessons&&typeof v.lessons==='object')for(const [key,r] of Object.entries(v.lessons)){if(!validKey(key)||!r||typeof r!=='object')continue;const rec=r as ReviewRecord;
  out.lessons[key]={enrolled:num(rec.enrolled),box:Math.min(REVIEW_INTERVALS_DAYS.length-1,Math.floor(num(rec.box))),due:num(rec.due),right:Math.floor(num(rec.right)),wrong:Math.floor(num(rec.wrong)),
   ...(rec.last?{last:num(rec.last)}:{}),...(rec.missed===true?{missed:true}:{}),...(rec.applied?{applied:Math.floor(num(rec.applied))}:{}),...(rec.ticks?{ticks:Math.floor(num(rec.ticks))}:{}),
   ...(Array.isArray(rec.sources)?{sources:rec.sources.filter(s=>typeof s==='string').slice(-12)}:{})};}
 if(v.paid&&typeof v.paid.day==='string')out.paid={day:v.paid.day.slice(0,10),count:Math.floor(num(v.paid.count))};
 return out;
}
const put=(s:ReviewState,key:string,rec:ReviewRecord):ReviewState=>({...s,lessons:{...s.lessons,[key]:rec}});
/** A lesson not enrolled yet has only evidence fields (ticks/applied) and enrolled=0. */
export const isEnrolled=(r?:ReviewRecord)=>!!r&&r.enrolled>0;
/** Enroll every passed lesson that is not enrolled yet (first review tomorrow). Idempotent. */
export function enrollPassed(s:ReviewState,passed:Iterable<string>,now:number):ReviewState{
 let next=s;for(const key of passed){const r=next.lessons[key];if(isEnrolled(r))continue;next=put(next,key,{...(r??{box:0,right:0,wrong:0}),enrolled:now,box:0,due:localDayStart(now,REVIEW_INTERVALS_DAYS[0]),right:r?.right??0,wrong:r?.wrong??0});}
 return next;
}
/** Lessons due now: missed ones first, then the longest overdue. */
export function dueKeys(s:ReviewState,now:number,limit=REVIEW_SESSION_SIZE):string[]{
 return Object.entries(s.lessons).filter(([,r])=>isEnrolled(r)&&r.due<=now).sort(([,a],[,b])=>Number(!!b.missed)-Number(!!a.missed)||a.due-b.due).slice(0,limit).map(([k])=>k);
}
export const dueCount=(s:ReviewState,now:number)=>Object.values(s.lessons).filter(r=>isEnrolled(r)&&r.due<=now).length;
/** Next due time among enrolled lessons (for "next warm-up in 2 days"). */
export function nextDue(s:ReviewState):number|null{const d=Object.values(s.lessons).filter(isEnrolled).map(r=>r.due);return d.length?Math.min(...d):null;}
/**
 * Apply a warm-up answer (the FIRST answer to the question; retries are practice and are not passed here).
 * Only a due lesson moves boxes, so answering early can never skip the spacing.
 */
export function answerReview(s:ReviewState,key:string,correct:boolean,now:number):ReviewState{
 const r=s.lessons[key];if(!isEnrolled(r))return s;
 if(r!.due>now)return put(s,key,{...r!,last:now});
 const box=correct?Math.min(REVIEW_INTERVALS_DAYS.length-1,r!.box+1):Math.max(0,r!.box-1);
 const due=localDayStart(now,correct?REVIEW_INTERVALS_DAYS[box]:1);
 const {missed:_m,...rest}=r!;
 return put(s,key,{...rest,box,due,last:now,right:r!.right+(correct?1:0),wrong:r!.wrong+(correct?0:1),...(correct?{}:{missed:true})});
}
/**
 * A right answer in a new setting outside the warm-up (a book check). If the lesson is enrolled and due, it counts as that
 * lesson's review; otherwise it is recorded as "applied" evidence (it can lift the stage, never skip the spacing).
 */
export function applyElsewhere(s:ReviewState,key:string,now:number,source:string):ReviewState{
 const r=s.lessons[key];
 if(isEnrolled(r)&&r!.due<=now){const next=answerReview(s,key,true,now);return put(next,key,{...next.lessons[key],applied:(r!.applied??0)+1});}
 return put(s,key,{...(r??{enrolled:0,box:0,due:0,right:0,wrong:0}),applied:(r?.applied??0)+1,sources:r?.sources?.includes(source)?r.sources:[...(r?.sources??[]),source].slice(-12)});
}
/** "Seen around the island" tick: evidence only (Introduced for an untouched lesson), never changes the schedule. */
export function tick(s:ReviewState,key:string,source:string):ReviewState{
 const r=s.lessons[key]??{enrolled:0,box:0,due:0,right:0,wrong:0};
 if(r.sources?.includes(source))return s; // one tick per source, ever: re-reading a magazine doesn't farm ticks
 return put(s,key,{...r,ticks:(r.ticks??0)+1,sources:[...(r.sources??[]),source].slice(-12)});
}
/** Whether a correct warm-up answer today is still paid, and the state after paying it. */
export function payReview(s:ReviewState,day:string):{pay:boolean;state:ReviewState;index:number}{
 const count=s.paid.day===day?s.paid.count:0;if(count>=REVIEW_PAID_PER_DAY)return {pay:false,state:s,index:count};
 return {pay:true,state:{...s,paid:{day,count:count+1}},index:count+1};
}
export type LessonEvidence={watched:number;correct:number;complete:boolean};
/** The mastery stage from the quiz/steps evidence (lib/paths/formatPaths lessonEvidence) plus the review record. */
export function stageOf(e:LessonEvidence,r?:ReviewRecord):Stage{
 if(e.complete||isEnrolled(r)){
  if(r&&r.box>=REMEMBERED_BOX&&r.right>=2)return 'remembered';
  if(r&&(r.box>=1||(r.applied??0)>0))return 'applied';
  return 'practicing';
 }
 return e.watched>0||e.correct>0||(r?.ticks??0)>0||(r?.applied??0)>0?'introduced':'new';
}
/** Human "next review" line for the mastery screen. */
export function dueLabel(r:ReviewRecord|undefined,now:number):string|null{
 if(!isEnrolled(r))return null;const d=r!.due-now;
 if(d<=0)return 'Review due';const days=localDaysBetween(now,r!.due);return days<=1?'Review tomorrow':`Review in ${days} days`;
}
