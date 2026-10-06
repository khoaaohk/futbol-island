import {newQuizRun,type QuizRun} from './quizProgress';
/**
 * A lesson quiz run that survives a pause (G-05, Sep 30 2026). The card rule stays the user's (Sep 24 2026): a 5+ question quiz,
 * every question right on the FIRST try, in one run (CARD_QUIZ_FIRST_TRY). What changed is what "one run" means: phones pause
 * (a reload, a closed tab, "Save and return to Paths"), and resuming used to start an empty in-memory run, so a clean 5/5 read
 * "1 right first time" and paid no card. Now the run's first-try answers are saved per lesson as they happen and restored on
 * resume; a fresh start ("Quiz yourself", Watch again → quiz) clears it, and finishing the quiz clears it.
 *
 * Storage: `fi2-quiz-runs-v1` = {"<fmt>:<lessonId>": {tried:number[], firstTry:number[], correct:number[]}}. Small (one entry per
 * unfinished quiz, capped at MAX_SAVED_RUNS), written only on an answer, never per frame. Pure core with a storage port for tests.
 */
export const QUIZ_RUNS_KEY='fi2-quiz-runs-v1';
export const MAX_SAVED_RUNS=24;
type SavedRun={tried:number[];firstTry:number[];correct:number[];at?:number};
type Store=Pick<Storage,'getItem'|'setItem'>;
const ints=(v:unknown)=>Array.isArray(v)?[...new Set(v.filter((n):n is number=>Number.isInteger(n)&&n>=0&&n<64))]:[];
function readAll(storage:Store|null):Record<string,SavedRun>{
 if(!storage)return {};
 try{const v=JSON.parse(storage.getItem(QUIZ_RUNS_KEY)??'{}');if(!v||typeof v!=='object'||Array.isArray(v))return {};
  const out:Record<string,SavedRun>={};for(const [k,r] of Object.entries(v as Record<string,Partial<SavedRun>>))if(typeof k==='string'&&k.includes(':')&&r&&typeof r==='object')out[k]={tried:ints(r.tried),firstTry:ints(r.firstTry),correct:ints(r.correct),at:typeof r.at==='number'?r.at:0};
  return out;}catch{return {};}
}
function writeAll(storage:Store|null,all:Record<string,SavedRun>){
 if(!storage)return;
 const entries=Object.entries(all).sort((a,b)=>(b[1].at??0)-(a[1].at??0)).slice(0,MAX_SAVED_RUNS);
 try{storage.setItem(QUIZ_RUNS_KEY,JSON.stringify(Object.fromEntries(entries)));}catch{}
}
const browser=():Store|null=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
const keyOf=(format:string,lessonId:string)=>`${format}:${lessonId}`;
/** The saved run for this lesson (an empty run when none): first-try answers before the pause still count. */
export function loadQuizRun(format:string,lessonId:string,storage:Store|null=browser()):QuizRun{
 const run=newQuizRun(lessonId),saved=readAll(storage)[keyOf(format,lessonId)];
 if(saved){saved.tried.forEach(i=>run.tried.add(i));saved.firstTry.filter(i=>run.tried.has(i)).forEach(i=>run.firstTry.add(i));saved.correct.forEach(i=>run.correct.add(i));}
 return run;
}
/** Save the run after an answer. */
export function saveQuizRun(format:string,run:QuizRun,storage:Store|null=browser(),now=Date.now()){
 if(!run.lessonId)return;const all=readAll(storage);
 all[keyOf(format,run.lessonId)]={tried:[...run.tried],firstTry:[...run.firstTry],correct:[...run.correct],at:now};writeAll(storage,all);
}
/** Forget the run (a fresh start, or the quiz is finished and has paid out). */
export function clearQuizRun(format:string,lessonId:string,storage:Store|null=browser()){
 const all=readAll(storage),key=keyOf(format,lessonId);if(!(key in all))return;delete all[key];writeAll(storage,all);
}
/** Answer feedback sound (Oct 3 2026 play-through: quizzes were silent). Reuses the island kit's one-shot cues in
 *  lib/audio/islandSound.ts: a right answer `ding`, a wrong one a soft `nope`, and the last question right (the quiz is done)
 *  the three-note `finish` fanfare that jobs and fishing already use. One event per answer; no loop. */
export function quizAnswerCue(right:boolean,lastQuestion:boolean):{event:'fi2-job-cue'|'fi2-story-cue';detail:string}{
 if(right&&lastQuestion)return {event:'fi2-story-cue',detail:'finish'};
 return {event:'fi2-job-cue',detail:right?'ding':'nope'};
}
/** "Quiz done" line under the last answer: positive, and says what earns the card without guilt. */
export function quizDoneLine(questions:number,firstTry:number,cardsOn:boolean):string{
 const base=`Quiz done: all ${questions} answered! ${firstTry} of ${questions} right first time.`;
 if(!cardsOn)return base;
 return firstTry>=questions?`${base} Perfect!`:`${base} Replay it any time and get all ${questions} first time to earn a card.`;
}
