// Ball Hunt lesson card: children must play every diagram step before "Got it" appears.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
function load(file){const code=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;const mod={exports:{}};new Function('exports','module','require',code)(mod.exports,mod,require);return mod.exports;}
const S=load('lib/town/ballLessonStepper.ts');
const actions=['Move the ball','Rebuild the triangle'];

// Got it is absent until the last step; each press advances one step.
let s=S.startLessonStepper(3);
assert.equal(s.step,0);assert.equal(S.canFinishLesson(s),false);assert.equal(S.lessonPrimaryLabel(s,actions),'Move the ball');
assert.equal(S.canGoBack(s),false,'previous is disabled on step 1');
s=S.advanceLesson(s);assert.deepEqual([s.step,s.played],[1,1]);assert.equal(S.canFinishLesson(s),false);assert.equal(S.lessonPrimaryLabel(s,actions),'Rebuild the triangle');
s=S.advanceLesson(s);assert.deepEqual([s.step,s.played],[2,2]);assert.equal(S.canFinishLesson(s),true);assert.equal(S.lessonPrimaryLabel(s,actions),'Got it');
assert.deepEqual(S.advanceLesson(s),s,'the final step does not wrap around');

// Previous goes back; the bottom button then plays forward again, and arrows only revisit played steps.
s=S.previousLessonStep(s);assert.equal(s.step,1);assert.equal(s.played,2);assert.equal(S.canFinishLesson(s),false,'Got it is only shown on the final step');
s=S.previousLessonStep(s);assert.equal(s.step,0);assert.deepEqual(S.previousLessonStep(s),s,'cannot go before step 1');
s=S.forwardLessonStep(S.forwardLessonStep(S.forwardLessonStep(s)));assert.equal(s.step,2,'arrow forward revisits played steps');
let fresh=S.forwardLessonStep(S.startLessonStepper(3));assert.equal(fresh.step,0,'arrow forward never skips unplayed steps');

// Missing action labels fall back to a generic prompt.
assert.equal(S.lessonPrimaryLabel(S.startLessonStepper(4),['Only one']),'Only one');
assert.equal(S.lessonPrimaryLabel(S.advanceLesson(S.startLessonStepper(4)),['Only one']),'Next step');

// Single-step and empty lessons: nothing to play, so Got it shows straight away.
for(const count of [1,0,NaN]){const one=S.startLessonStepper(count);assert.equal(one.count,1);assert.equal(S.canFinishLesson(one),true);assert.equal(S.lessonPrimaryLabel(one,[]),'Got it');assert.equal(S.canGoBack(one),false);}
// A long (new) lesson needs every press.
let long=S.startLessonStepper(6),presses=0;while(!S.canFinishLesson(long)){long=S.advanceLesson(long);presses++;}assert.equal(presses,5);

// Keyboard: Enter/Space press the bottom button unless a control has focus (native activation); arrows step.
assert.equal(S.lessonStepKey('Enter',false),'primary');assert.equal(S.lessonStepKey(' ',false),'primary');
assert.equal(S.lessonStepKey('Enter',true),null);assert.equal(S.lessonStepKey('ArrowLeft',true),'previous');assert.equal(S.lessonStepKey('ArrowRight',false),'forward');
assert.equal(S.lessonStepKey('Escape',false),null,'Escape is not a dismiss key');

// The component wires the guard: no early dismiss, Escape cancelled, and the shared paper pills.
const src=fs.readFileSync(path.resolve(__dirname,'../components/BallHuntLesson.tsx'),'utf8');
assert.match(src,/const dismiss=\(\)=>\{if\(!finished\)return;/,'dismiss is guarded until the last step');
assert.match(src,/onCancel=\{event=>\{event\.preventDefault\(\);/,'Escape (dialog cancel) never closes the card');
assert.match(src,/lessonPrimaryLabel\(stepper,lesson\.actions\)/,'one bottom button switches from the step action to Got it');
assert.match(src,/navStyles\.button/,'the bottom button reuses the DoneButton gold paper pill');
assert.match(src,/className=\{styles\.previousArrow\} aria-label="Previous step"[^>]*disabled=\{!canGoBack\(stepper\)\}/,'previous is a round arrow button (Sep 30 2026), labelled "Previous step" and disabled on the first step');
assert.doesNotMatch(src,/%3\)|\/ 3</,'no hard-coded three-step assumptions');
assert.doesNotMatch(src,/Try it again/,'no wrap-around replay button that skips the finish');
console.log('PASS ball hunt lesson steps: Got it only after the last step, next/previous/arrows, single-step lessons, no early dismiss');
