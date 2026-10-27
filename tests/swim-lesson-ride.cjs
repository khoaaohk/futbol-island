// "Pace yourself" (the swim lesson card) must not show while riding an animal (Oct 26 2026, QA: it appeared when riding the
// whale shark). lib/town/water/waterHud.ts waterLessonHeld / swimLessonDue:
//  1. the swim card is held during a ride; the shark / ride / dive cards are not;
//  2. a swim start under a ride does not queue the swim card (Town.tsx), and SwimLessonToast blocks and hides it while riding.
// usage: node tests/swim-lesson-ride.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const H=require('../lib/town/water/waterHud.ts');

// 1. Pure rules.
assert.equal(H.SWIM_LESSON.title,'Pace yourself');
assert.equal(H.waterLessonHeld('swim',{riding:true}),true,'riding: the swim card waits');
assert.equal(H.waterLessonHeld('swim',{riding:false}),false,'swimming: the swim card may show');
for(const w of ['shark','ride','dive'])assert.equal(H.waterLessonHeld(w,{riding:true}),false,w+' card not held by a ride');
assert.equal(H.swimLessonDue(true),false,'a swim start under a ride queues nothing');
assert.equal(H.swimLessonDue(false),true,'a real swim start queues the card');

// 2. Wiring.
const town=read('components/Town.tsx');
assert(/if\(ev\.swimStarted\)\{countSwimStart\(\);if\(swimLessonDue\(animalRides\.riding\)\)waterStore\.set\(\{lesson:/.test(town),'Town bumps the swim lesson only off a ride');
const toast=read('components/SwimLessonToast.tsx');
assert(/waterLessonHeld\(which,\{riding\}\)/.test(toast),'the toast asks waterLessonHeld');
assert(/blocked=held\|\|busy\|\|rideHeld/.test(toast),'a ride blocks the card from showing');
assert(/if\(rideHeld&&shown\)setShown\(false\)/.test(toast),'a showing swim card leaves when a ride starts');
assert(/riding:true,rideLesson:/.test(town),'the ride sets waterStore.riding (what the toast reads)');
console.log('swim-lesson-ride: ok');
