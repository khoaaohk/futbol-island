// Museum exhibits are modal (Oct 9 2026 QA). Tab x25 inside an open exhibit escaped into the hall 7 to 17 times (timeline,
// laced-leather, telstar, futsal, wwc, shirts). Now: the stage is a labelled modal dialog with focus guards at both ends, focus
// lands on the experience's Back once the curtain lifts, the hall's content (not the stage, not native <dialog>s) is inert while
// an experience is up, and focus returns to the control that opened it. Browser check: Tab x25 and Shift+Tab x25 in all 13
// exhibits never leave [data-museum-stage]; timeline -> exhibit -> Back returns to the timeline; closing refocuses Step inside.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const stage=fs.readFileSync(path.join(__dirname,'../components/museum/experiences/ExperienceStage.tsx'),'utf8');
assert.match(stage,/role="dialog" aria-modal="true" aria-label=\{info\.title\}/,'the stage is a modal dialog named by the exhibit title');
assert.match(stage,/data-stage-guard="start"/,'a focus guard opens the stage');
assert.match(stage,/data-stage-guard="end"/,'and one closes it');
assert.ok(stage.indexOf('data-stage-guard="start"')<stage.indexOf('children(close)')&&stage.indexOf('children(close)')<stage.indexOf('data-stage-guard="end"'),'the guards wrap the experience');
assert.match(stage,/end===inside\?nodes\[0\]:nodes\[nodes\.length-1\]/,'Tab past the end wraps to the first control, Shift+Tab past the start to the last');
assert.match(stage,/querySelector<HTMLElement>\('\[data-experience-back\]'\)/,'focus moves to the experience Back');
assert.match(stage,/phase!=='out'&&phase!=='live'/,'once the curtain lifts (after the experience focuses its own root)');
// The curtain is untouched: still aria-hidden, still the same spring phases.
assert.match(stage,/className=\{styles\.veil\} aria-hidden="true"/,'curtain stays aria-hidden');
for(const p of["'in'","'hold'","'out'","'live'","'leave'"])assert.ok(stage.includes(p),'phase '+p);
const css=fs.readFileSync(path.join(__dirname,'../components/museum/experiences/ExperienceStage.module.css'),'utf8');
assert.match(css,/\.guard\{[^}]*clip-path:inset\(50%\)/,'guards are invisible');
const room=fs.readFileSync(path.join(__dirname,'../components/MuseumRoom.tsx'),'utf8');
assert.match(room,/<main ref=\{rootRef\}/,'the hall root is reachable');
assert.match(room,/const want=!!experience&&!el\.hasAttribute\('data-museum-stage'\)&&el\.tagName!=='DIALOG';if\(el\.inert!==want\)el\.inert=want;/,'hall content (not the stage or a native dialog) is inert while an experience is up');
assert.match(room,/new MutationObserver\(apply\)/,'re-applied when the hall children change');
assert.match(room,/if\(!o\.covered\)\{const a=document\.activeElement;trigger\.current=/,'the opening control is remembered (not on timeline <-> exhibit hand-overs)');
assert.match(room,/refocus\.current='trigger';setExperience\(null\)/,'closing hands focus back to it');
assert.match(room,/data-museum-step-inside="\$\{t\.id\}"/,'falling back to that case\'s Step inside');
assert.match(room,/if\(!tl&&stage\.from==='timeline'\)\{openExperience\('timeline',\{covered:true/,'Back from an exhibit entered from the timeline still returns to the timeline');
console.log('PASS museum stage focus: exhibits are modal, Tab stays inside, focus returns to the trigger');
