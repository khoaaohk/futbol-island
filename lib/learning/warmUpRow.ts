import {dueCount,isEnrolled,localDaysBetween,nextDue,REVIEW_SESSION_SIZE,type ReviewState} from './review';
/**
 * Paths' small Warm-up row (Oct 4 2026, clear path; the user approved bringing back a way in after the Oct 1 removal). Pure.
 * Calm by design: a count when lessons are due (capped at one warm-up, REVIEW_SESSION_SIZE questions), "All caught up" when
 * nothing is due, and a hint before the first quiz is passed. No streaks, no red, no timers: it is read when Paths renders.
 */
export type WarmUpRow=
 |{kind:'due';due:number;questions:number;title:string;detail:string}
 |{kind:'caught-up';days:number|null;title:string;detail:string}
 |{kind:'empty';title:string;detail:string};
export function warmUpRow(state:ReviewState,now:number):WarmUpRow{
 const due=dueCount(state,now);
 if(due>0){const questions=Math.min(due,REVIEW_SESSION_SIZE);return {kind:'due',due,questions,title:`${questions} quick ${questions===1?'question':'questions'} ready`,detail:'Remember a lesson you passed.'};}
 if(!Object.values(state.lessons).some(isEnrolled))return {kind:'empty',title:'Pass a quiz to start',detail:'Each lesson you pass comes back for one quick question.'};
 const next=nextDue(state),days=next===null?null:Math.max(1,localDaysBetween(now,next));
 return {kind:'caught-up',days,title:'All caught up',detail:days?`Next warm-up in ${days===1?'1 day':`${days} days`}.`:'Nice remembering!'};
}
