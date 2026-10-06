// Clear path (Oct 4 2026, user-approved): ONE first step (onboarding, the HUD pitch card and Paths' "Start here" all point at
// lesson 1 of the player's path; the opening story stays an optional map stop), "Next lesson" at the quiz end (including the end
// of a path: graduation, the next path, the Ferry), and Paths' small Warm-up row (due count / All caught up / before any quiz).
// usage: node tests/clear-path.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(ROOT,rel),'utf8');
// Load the REAL modules, TypeScript first (Node's own resolution would pick formatPaths.json over formatPaths.ts).
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 new Function('exports','module','require',out)(mod.exports,mod,id=>{
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);});
 return mod.exports;
}
const lib=rel=>load(path.join(ROOT,rel));
const C=lib('lib/paths/pathContinue.ts'),F=lib('lib/paths/formatPaths.ts'),R=lib('lib/learning/review.ts'),W=lib('lib/learning/warmUpRow.ts');
const memory=(init={})=>{const m=new Map(Object.entries(init));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v))};};
const pathOf=f=>F.FORMAT_PATHS.find(p=>p.format===f),coreOf=f=>pathOf(f).chapters.flatMap(c=>c.lessons);
const pass=(set,f,l)=>{for(let i=0;i<l.questions;i++)set.add(`${f}:${l.id}:${i}`);return set;};
const passPath=(set,f)=>{for(const l of coreOf(f))pass(set,f,l);return set;};
const none=new Set(),seven=coreOf('7v7');

// ---- 1. One first step ------------------------------------------------------------------------------------------------------
{
 const first=C.suggestedNextStep(memory(),none,none);
 assert.equal(first.kind,'lesson');assert.equal(first.format,'7v7');assert.equal(first.lesson.id,seven[0].id,'a fresh save starts at 7v7 lesson 1');
 assert.equal(first.label,'Start here');assert.ok(pathOf('7v7').openingStory,'7v7 still has its opening story (optional, not the start)');
 assert.deepEqual(C.continueAction(first),{action:'Start lesson 1',name:seven[0].name},'onboarding / HUD card say what they do');
 const card=C.pitchCardTarget('7v7',none,none,{});assert.equal(card.lesson.id,first.lesson.id,'the HUD pitch card at Old Town Ground = the same lesson 1');
 assert.equal(C.pitchCardTarget('9v9',none,none,{}).lesson.id,coreOf('9v9')[0].id,'another pitch starts its own path');
 assert.equal(C.pitchCardTarget('7v7',none,passPath(new Set(),'7v7'),{}),null,'a finished path keeps the free Plays viewer');
 // Labels follow the one Continue rule.
 const a=pass(new Set(),'7v7',seven[0]);
 assert.equal(C.continueAction(C.pitchCardTarget('7v7',none,a,{'7v7':seven[0].id})).action,'Next: lesson 2');
 a.add(`7v7:${seven[1].id}:0`);
 assert.equal(C.continueAction(C.pitchCardTarget('7v7',none,a,{'7v7':seven[1].id})).action,'Continue lesson 2');
 // Launch detail: a fresh lesson plays from the top; a half-done quiz resumes on its question; a replay starts over.
 assert.deepEqual(C.pathLaunchDetail('7v7',seven[0],none,none,false,1),{format:'7v7',lessonId:seven[0].id,step:0,quiz:false,question:0,nonce:1});
 const watched=new Set(Array.from({length:seven[0].steps},(_,i)=>`7v7:${seven[0].id}:${i}`)),half=new Set([`7v7:${seven[0].id}:0`,`7v7:${seven[0].id}:1`]);
 assert.deepEqual(C.pathLaunchDetail('7v7',seven[0],watched,half,false,2),{format:'7v7',lessonId:seven[0].id,step:0,quiz:true,question:2,nonce:2});
 assert.deepEqual(C.pathLaunchDetail('7v7',seven[0],watched,half,true,3),{format:'7v7',lessonId:seven[0].id,step:0,quiz:false,question:0,nonce:3});
 // The surfaces are wired to it.
 const qlp=read('components/QuestLearningPath.tsx'),onb=read('components/IslandOnboarding.tsx'),town=read('components/Town.tsx'),card2=read('components/FieldPathCard.tsx'),quests=read('components/IslandQuests.tsx');
 assert.doesNotMatch(qlp,/data-path-opening-story/,'Paths "Start here" is no longer the opening story');
 assert.match(qlp,/\{resumeLesson&&target\.kind==='lesson'\?<button type="button" data-path-continue onClick=\{\(\)=>launch\(resumeLesson\)\}>/,'Start here launches the Continue lesson');
 assert.match(qlp,/\.\.\.\(path\.openingStory\?\[\{lesson:core\[0\],story:path\.openingStory,index:-1\}\]:\[\]\)/,'the opening story stays on the map as an optional stop');
 assert.match(onb,/label=\{last\?'Explore':'Next'\}/,'onboarding ends on Explore (Oct 6 2026, user)');assert.doesNotMatch(onb,/launchPathLesson/,'Explore drops into the island, no lesson launch');
 assert.match(town,/\{VENUES\.map\(v=><FieldPathCard key=\{v\.id\} venue=\{v\}/,'Town renders the pitch cards from FieldPathCard');
 assert.match(card2,/pitchCardTarget\(venue\.id,/);assert.match(card2,/if\(target\)launchPathLesson\(venue\.id,target\.lesson,steps,answers\);else onPlays\(\);/,'the card launches the lesson, or the free viewer when the path is done');
 assert.match(quests,/<div ref=\{setLandingSlot\} className=\{journey\.landingSlot\}\/>\n <section ref=\{arrivalRef\}/,'the landing slot sits above the hero art');
 assert.match(qlp,/return landingSlot\?createPortal\(landing,landingSlot\):landing;/,'the landing card renders into that slot');
}

// ---- 2. "Next lesson" at the quiz end, including the end of a path --------------------------------------------------------
{
 const empty={formats:{},finale:null},seen=(...fs)=>({formats:Object.fromEntries(fs.map(f=>[f,{at:1,seen:true}])),finale:null});
 // The stores have not caught up yet: the finished lesson still counts as done.
 let n=C.quizEndNext('7v7',seven[0].id,none,none,{'7v7':seven[0].id},empty);
 assert.equal(n.kind,'lesson');assert.equal(n.lesson.id,seven[1].id);assert.equal(n.index,1);assert.equal(n.label,'Next lesson');
 const mid=new Set();for(const l of seven.slice(0,5))pass(mid,'7v7',l);
 n=C.quizEndNext('7v7',seven[4].id,none,mid,{'7v7':seven[4].id},empty);assert.equal(n.lesson.id,seven[5].id,'lesson 5 → lesson 6');
 // A replay of an early lesson goes to the first unfinished one; a Go-deeper lesson leads back to the starter path.
 n=C.quizEndNext('7v7',seven[0].id,none,mid,{'7v7':seven[0].id},empty);assert.equal(n.lesson.id,seven[5].id,'a replay continues at the first unfinished lesson');
 n=C.quizEndNext('7v7',pathOf('7v7').depth[0].id,none,mid,{},empty);assert.equal(n.lesson.id,seven[5].id,'a Go-deeper lesson leads back to the path');
 // Another lesson left half-done stays the "where you left off" step.
 const partial=new Set(mid);partial.add(`7v7:${seven[7].id}:0`);
 n=C.quizEndNext('7v7',seven[2].id,none,partial,{'7v7':seven[7].id},empty);assert.equal(n.lesson.id,seven[7].id);
 // End of a path: the last lesson (stores lagging) → Graduate! while the ceremony has not been seen…
 const almost=passPath(new Set(),'7v7');for(let i=0;i<seven.at(-1).questions;i++)almost.delete(`7v7:${seven.at(-1).id}:${i}`);
 n=C.quizEndNext('7v7',seven.at(-1).id,none,almost,{},empty);assert.deepEqual(n,{kind:'graduate',format:'7v7',label:'Graduate!'});
 n=C.quizEndNext('7v7',seven.at(-1).id,none,almost,{},{formats:{'7v7':{at:1,seen:false}},finale:null});assert.equal(n.kind,'graduate','an unseen ceremony still comes first');
 // …then the next path (7v7 → 9v9), on its own Continue lesson.
 n=C.quizEndNext('7v7',seven.at(-1).id,none,passPath(new Set(),'7v7'),{},seen('7v7'));
 assert.equal(n.kind,'lesson');assert.equal(n.format,'9v9');assert.equal(n.lesson.id,coreOf('9v9')[0].id);assert.equal(n.label,'Start 9v9');
 // Every path done: the Ferry until the final is done, then only Back to Paths.
 const all=new Set();for(const f of C.PATH_ORDER)passPath(all,f);
 n=C.quizEndNext('futsal',coreOf('futsal').at(-1).id,none,all,{},seen(...C.PATH_ORDER));assert.deepEqual(n,{kind:'ferry',label:'Board the ferry'});
 n=C.quizEndNext('futsal',coreOf('futsal').at(-1).id,none,all,{},{...seen(...C.PATH_ORDER),finale:{at:1,firstTry:8,total:8,runs:1,seen:true}});assert.deepEqual(n,{kind:'none'});
 // FieldLearning: the pathRequest branch launches through the usual event; Back to Paths stays as the second button.
 const fl=read('components/FieldLearning.tsx'),qr=read('components/QuizReplay.tsx');
 assert.match(fl,/quizEndNext\(format,chosen\.id,/);assert.match(fl,/if\(exit!=='paths'&&pathNext\?\.kind==='lesson'\)\{launchPathLesson\(pathNext\.format,pathNext\.lesson,/);
 assert.match(fl,/secondaryLabel=\{pathNext\?\.kind==='lesson'\|\|pathNext\?\.kind==='ferry'\?'Back to Paths':undefined\}/);
 assert.match(read('lib/paths/pathLaunch.ts'),/window\.dispatchEvent\(new CustomEvent\(FORMAT_PATH_LAUNCH,\{detail:pathLaunchDetail\(/,'Next lesson uses the usual Paths launch event');
 assert.match(qr,/data-quiz-secondary onClick=\{onSecondary\}/);
}

// ---- 3. Warm-up row: due count, All caught up, before the first quiz --------------------------------------------------------
{
 const T0=new Date(2026,9,4,9).getTime(),DAY=R.DAY;
 let s=R.emptyReview();
 assert.equal(W.warmUpRow(s,T0).kind,'empty','no quiz passed yet: a calm hint');
 s=R.enrollPassed(s,['7v7:learn7_roles'],T0);
 let row=W.warmUpRow(s,T0);assert.equal(row.kind,'caught-up');assert.equal(row.days,1);assert.equal(row.title,'All caught up');assert.equal(row.detail,'Next warm-up in 1 day.');
 row=W.warmUpRow(s,T0+DAY+1);assert.equal(row.kind,'due');assert.equal(row.due,1);assert.equal(row.questions,1);assert.equal(row.title,'1 quick question ready');
 s=R.enrollPassed(s,['7v7:learn7_shape','7v7:learn7_buildout','7v7:learn7_receive','7v7:learn7_carry'],T0);
 row=W.warmUpRow(s,T0+DAY+1);assert.equal(row.due,5,'the badge knows how many are due');assert.equal(row.questions,R.REVIEW_SESSION_SIZE,'…but promises one warm-up (3 questions)');assert.equal(row.title,'3 quick questions ready');
 // Answering moves a lesson out of "due" (3 days later); with nothing else due the row is caught up again.
 let one=R.enrollPassed(R.emptyReview(),['7v7:learn7_roles'],T0);one=R.answerReview(one,'7v7:learn7_roles',true,T0+DAY+1);
 row=W.warmUpRow(one,T0+DAY+2);assert.equal(row.kind,'caught-up');assert.equal(row.days,3);
 const css=read('components/PathWarmUpRow.module.css');assert.doesNotMatch(css,/#(?:e0|f0|ff)[0-4][0-4][0-4][0-4]\b|\bred\b|animation/i,'no red alarms and no animation loop');
 assert.doesNotMatch(read('components/PathWarmUpRow.tsx'),/setInterval|setTimeout|requestAnimationFrame/,'no timers');
}
console.log('PASS clear path: one first step (HUD card = Start here = lesson 1; onboarding ends on Explore), Next lesson at the quiz end (graduate / next path / Ferry), Warm-up row states');
