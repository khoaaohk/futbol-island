/** Watch-through stepping for Ball Hunt lesson cards: every step must be played before "Got it" appears. */
export type LessonStepper={step:number;played:number;count:number};
export type LessonStepKey='primary'|'previous'|'forward'|null;

/** A lesson with no steps still shows one (empty) frame, so there is always something to finish. */
export function startLessonStepper(stepCount:number):LessonStepper{return {step:0,played:0,count:Math.max(1,Math.floor(stepCount)||0)};}
export const isLastStep=(s:LessonStepper)=>s.step>=s.count-1;
/** Got it is only reachable once the final step has been played and is on screen. */
export const canFinishLesson=(s:LessonStepper)=>s.played>=s.count-1&&isLastStep(s);
export const canGoBack=(s:LessonStepper)=>s.step>0;
export const canGoForward=(s:LessonStepper)=>s.step<s.played;
/** Plays the next step (the bottom button); a no-op on the final step, where the button is Got it. */
export function advanceLesson(s:LessonStepper):LessonStepper{if(isLastStep(s))return s;const step=s.step+1;return {...s,step,played:Math.max(s.played,step)};}
export function previousLessonStep(s:LessonStepper):LessonStepper{return canGoBack(s)?{...s,step:s.step-1}:s;}
/** Arrow-key forward only revisits steps that were already played; it never skips ahead. */
export function forwardLessonStep(s:LessonStepper):LessonStepper{return canGoForward(s)?{...s,step:s.step+1}:s;}
/** The bottom button label: the step's own action, else a generic prompt, else Got it at the end. */
export function lessonPrimaryLabel(s:LessonStepper,actions:readonly string[]=[]):string{return canFinishLesson(s)?'Got it':actions[s.step]?.trim()||'Next step';}
/** Keyboard map. Enter/Space on a focused control keeps native activation (returns null). */
export function lessonStepKey(key:string,onControl:boolean):LessonStepKey{
 if(key==='ArrowLeft')return 'previous';
 if(key==='ArrowRight')return 'forward';
 if((key==='Enter'||key===' '||key==='Spacebar')&&!onControl)return 'primary';
 return null;
}
