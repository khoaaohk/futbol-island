// Heat audit 2026-09-25 regressions (docs/performance-guide.md, "Heat audit — September 25"): source checks for work that must not
// run while nothing visible changes. Browser measurements live in the audit note; this guards the implementation choices.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');

const bottle=read('components/IslandBottle.tsx'),bottleCss=read('components/IslandBottle.module.css');
assert.ok(!/globalCompositeOperation\s*=\s*'multiply'/.test(bottle),'bottle waves: no per-frame full-canvas multiply grain fill');
assert.match(bottleCss,/\.waveGrain\{[^}]*mix-blend-mode:multiply[^}]*opacity:\.36[^}]*clip-path:inset\(0 0 100% 0\)/,'bottle grain is a static multiply layer, clipped until drawn');
assert.match(bottle,/grainEl\.style\.clipPath=clip/,'the grain layer follows the drawn water edge');
assert.match(bottle,/const tick=\(now:number\)=>\{if\(!w\|\|!h\)\{frame=0;return;\}/,'wave loop stops on a zero-size canvas');
assert.match(bottle,/host\.addEventListener\('close',closed\)/,'closing the dialog under the bottle closes the bottle (loop + ocean stop)');

const scenery=read('lib/sceneryRest.ts');
assert.match(scenery,/closest\('dialog:modal,\[role=dialog\]\[aria-modal=true\]'\)/,'in-page modal layers cover resting art');

const hud=read('components/IslandSettings.module.css'),live=read('components/LiveArcadeMatch.tsx');
assert.match(live,/data-fullscreen-game/,'Island Strikers marks itself as a full-screen game');
assert.match(hud,/body:has\(\[data-fullscreen-game\]\)\) \.questsTrigger,[^{]*pathIconCycle>span\{animation-play-state:paused\}/,'HUD loops pause under a full-screen game');
assert.match(hud,/body:has\(\[data-fullscreen-game\]\)\) \.questsTrigger::before,[^{]*::after\{animation-play-state:paused\}/,'HUD sparkles pause under a full-screen game');
// Approved follow-up (same day): HUD loops, field prompt pulse and offer stars rest 6 s after input; no backdrop blur over the 3D view.
const settings=read('components/IslandSettings.tsx'),globals=read('app/globals.css'),offer=read('components/CardOffer.tsx'),offerCss=read('components/CardOffer.module.css');
assert.match(settings,/useSceneryRest\(triggers,styles\.hudRest,hudSettle(,hudHold)?\)/,'Paths button loops rest after input (heat pass 3 adds the gameplay hold)');
assert.match(settings,/phase>=250&&phase<=2350\?0/,'HUD rests between icon swaps and shakes');
assert.match(hud,/\.hudRest \.questsTrigger::before,\.hudRest \.questsTrigger::after\{animation-play-state:paused;filter:opacity\(0\)\}/,'resting sparkle dots fade out');
assert.match(globals,/body:has\(\[data-hud-triggers\]\[data-scenery=rest\]\) \.field-learn-card:not\(\[hidden\]\)\{animation-play-state:running,paused\}/,'field prompt pulse rests with the HUD');
assert.ok(!/\.field-learn-card[^{]*\{[^}]*backdrop-filter:blur/.test(globals),'no backdrop blur on the field prompt');
assert.match(offer,/setTimeout\(\(\)=>\{el\.classList\.add\(styles\.sparklesRest\);el\.dataset\.scenery='rest';\},SCENERY_AWAKE_MS\)/,'offer stars rest after 6 s');assert.doesNotMatch(offer,/useSceneryRest|key=\{`spark-/,'offer stars twinkle once: no input or deck swipe wakes them (Oct 1 2026, items C/G)');
assert.match(offerCss,/\.sparklesRest span\{animation-play-state:paused\}/,'resting stars freeze');
assert.match(read('components/FieldLearning.tsx'),/<FieldVisualBeat session=\{session\} hidden=\{!chosen\|\|/,'no lesson-beat timer without a lesson');
console.log('HEAT_IDLE_PASS bottle grain layer, zero-size/closed-dialog wave stop, modal-layer scenery rest, HUD pause under Strikers, HUD/pulse/star rest, no field-card blur, no idle beat timer');
