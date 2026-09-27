// Path progression rules (user, Sep 26 2026: "When completing a quiz, the next item in the path needs to unlock").
// Drives the real stores (quizProgress / questProgress over a fake localStorage) and the real rules (lessonEvidence,
// pathLessonLocked, pathProgressFrom) for every format. usage: node tests/path-progress.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const storage=new Map();
const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const STUBS={react:{useMemo:f=>f(),useSyncExternalStore:(_s,get)=>get()},'lib/town/learningProgress.ts':{isLearningPreview:()=>false}};
// A fresh module graph per load() = a page reload (module state gone, localStorage kept).
function loader(){
 const cache=new Map();
 function load(file){
  const rel=path.relative(root,file);if(STUBS[rel])return STUBS[rel];if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};cache.set(file,mod);
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
  vm.runInNewContext(out,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,localStorage,window:{addEventListener(){},removeEventListener(){}},process:{env:{NODE_ENV:'production'}},
   require:id=>{if(STUBS[id])return STUBS[id];if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
    for(const f of [base,base+'.ts',base+'.tsx',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);throw new Error('Cannot resolve '+id+' from '+file);}});
  return mod.exports;
 }
 const at=f=>load(path.join(root,f));
 return {paths:at('lib/paths/formatPaths.ts'),quiz:at('lib/town/quizProgress.ts'),quest:at('lib/town/questProgress.ts'),tiers:at('lib/town/cardTiers.ts'),rides:at('lib/town/rideUnlocks.ts')};
}
let api=loader();
const {FORMAT_PATHS}=api.paths;
// Evidence exactly as the Paths screen reads it: from the stores' saved keys.
const evidence=()=>({steps:new Set(JSON.parse(storage.get(api.quest.QUEST_STORAGE_KEY)??'{"steps":[]}').steps),answers:new Set(JSON.parse(storage.get(api.quiz.QUIZ_STORAGE_KEY)??'[]'))});
const core=p=>p.chapters.flatMap(c=>c.lessons);
const locked=(p,l)=>{const e=evidence();return api.paths.pathLessonLocked(p,l,e.steps,e.answers);};
const status=(p,l)=>{const e=evidence();return api.paths.lessonEvidence(p.format,l,e.steps,e.answers);};
const passQuiz=(p,l,skip=-1)=>{for(let i=0;i<l.questions;i++)if(i!==skip)api.quiz.recordCorrectQuizAnswer(p.format,l.id,i);};
const watchAll=(p,l)=>{for(let i=0;i<l.steps;i++)api.quest.recordQuestStep(p.format,l.id,i);};
const openStops=p=>core(p).filter(l=>!locked(p,l)).map(l=>l.id);
const reset=()=>{storage.clear();api=loader();};
const same=(a,b,msg)=>assert.equal(JSON.stringify(a),JSON.stringify(b),msg);

assert.equal(FORMAT_PATHS.length,4,'futsal, 7v7, 9v9, 11v11');
for(const p of FORMAT_PATHS){
 reset();const lessons=core(p);assert.equal(lessons.length,12,`${p.format}: 12 starter lessons`);
 // Fresh: only the first stop is open; depth lessons are never locked.
 same(openStops(p),[lessons[0].id],`${p.format}: a fresh path opens stop 1 only`);
 for(const l of p.depth)assert.equal(locked(p,l),false,`${p.format}: go-deeper ${l.id} is never locked`);
 // Watching alone does not complete a lesson that has a quiz, and the stop resumes in the quiz.
 watchAll(p,lessons[0]);assert.equal(status(p,lessons[0]).complete,false,`${p.format}: watching alone is not enough`);
 assert.equal(status(p,lessons[0]).quiz,true,`${p.format}: a watched lesson resumes in its quiz`);assert.equal(locked(p,lessons[1]),true);
 reset();
 // A failed / unfinished quiz (one question never answered right) does not unlock; the stop resumes at that question.
 passQuiz(p,lessons[0],lessons[0].questions-1);
 assert.equal(status(p,lessons[0]).complete,false,`${p.format}: an unfinished quiz is not complete`);
 assert.equal(locked(p,lessons[1]),true,`${p.format}: an unfinished quiz does not unlock stop 2`);
 assert.equal(status(p,lessons[0]).quiz,true,`${p.format}: a started quiz resumes in the quiz, even unwatched`);
 assert.equal(status(p,lessons[0]).question,lessons[0].questions-1,`${p.format}: ...at the question still to get right`);
 // Wrong answers are never saved (FieldLearning only records right ones), and unknown keys are rejected.
 api.quiz.recordCorrectQuizAnswer(p.format,lessons[0].id,999);api.quiz.recordCorrectQuizAnswer(p.format,'nope',0);
 assert.equal(status(p,lessons[0]).complete,false);
 // Passing the quiz (no watch-through: the child tapped Next to "Quiz yourself") completes it and opens exactly the next stop.
 passQuiz(p,lessons[0]);
 assert.equal(status(p,lessons[0]).complete,true,`${p.format}: passing the quiz completes the lesson without a watch-through`);
 same(openStops(p),[lessons[0].id,lessons[1].id],`${p.format}: passing quiz 1 unlocks stop 2 (and only stop 2)`);
 // Persists across a reload (fresh module graph, same storage).
 api=loader();same(openStops(p),[lessons[0].id,lessons[1].id],`${p.format}: unlock survives a reload`);
 assert.equal(api.quiz.hasCorrectQuizAnswer(p.format,lessons[0].id,0),true,`${p.format}: the store reloads saved answers`);
 // Replaying (re-watching, re-answering) never re-locks or un-completes anything.
 watchAll(p,lessons[0]);passQuiz(p,lessons[0]);
 assert.equal(status(p,lessons[0]).complete,true);assert.equal(locked(p,lessons[1]),false,`${p.format}: replay keeps stop 2 open`);
 // Walk the rest of the path: each passed quiz opens the next stop and nothing further.
 for(let i=1;i<lessons.length;i++){
  assert.equal(locked(p,lessons[i]),false,`${p.format}: stop ${i+1} open before its quiz`);
  if(i+1<lessons.length)assert.equal(locked(p,lessons[i+1]),true,`${p.format}: stop ${i+2} locked before quiz ${i+1}`);
  const e=evidence(),before=api.tiers.pathProgressFrom(e.steps,e.answers).byFormat[p.format];
  passQuiz(p,lessons[i]);
  const after=evidence(),prog=api.tiers.pathProgressFrom(after.steps,after.answers);
  assert.ok(prog.byFormat[p.format]>before,`${p.format}: lesson ${i+1} moves path progress (card tiers)`);
  if(i+1<lessons.length)assert.equal(locked(p,lessons[i+1]),false,`${p.format}: quiz ${i+1} unlocks stop ${i+2}`);
 }
 // Finishing the path marks it complete for card tiers and ride unlocks.
 const e=evidence(),prog=api.tiers.pathProgressFrom(e.steps,e.answers);
 same(prog.finished,[p.format],`${p.format}: finishing the path marks it finished`);
 assert.equal(prog.byFormat[p.format],1);assert.equal(prog.best,1,`${p.format}: card tiers see a complete path`);
 assert.equal(api.tiers.readPathProgress(),1,`${p.format}: readPathProgress (card tier gate) reads it from storage`);
 assert.equal(api.rides.readFinishedPaths(),1,`${p.format}: ride unlocks count the finished path`);
 assert.equal(api.rides.readRideUnlocks().isUnlocked('scooter',api.rides.RIDE_ORDER.scooter[1]),true,`${p.format}: first path opens the second ride`);
 // Depth lessons do not count toward the path.
 const depthOnly=new Set();for(const l of p.depth)for(let i=0;i<l.questions;i++)depthOnly.add(`${p.format}:${l.id}:${i}`);
 assert.equal(api.tiers.pathProgressFrom(new Set(),depthOnly).byFormat[p.format],0,`${p.format}: go-deeper lessons don't count`);
}
// A stop whose previous stop is complete is open, even if an earlier stop is still unfinished (lessons can be finished from
// the pitch's plays picker, outside the path order). Started stops stay open too.
{reset();const p=FORMAT_PATHS[0],l=core(p);passQuiz(p,l[1]);
 assert.equal(locked(p,l[2]),false,'previous stop complete → open');assert.equal(locked(p,l[1]),false,'a complete stop is open');
 assert.equal(locked(p,l[3]),true,'previous stop not complete → locked');
 api.quest.recordQuestStep(p.format,l[5].id,0);assert.equal(locked(p,l[5]),false,'a started stop stays open');}
// All four paths → every ride category's final ride.
{reset();for(const p of FORMAT_PATHS)for(const l of core(p))passQuiz(p,l);
 assert.equal(api.rides.readFinishedPaths(),4);const r=api.rides.readRideUnlocks();
 for(const c of api.rides.RIDE_CATEGORIES){const order=api.rides.RIDE_ORDER[c];assert.equal(r.isUnlocked(c,order[order.length-1]),true,`${c}: final ride open after all paths`);}}
// Lessons without questions (none ship today) complete on a full watch-through.
{const p={format:'7v7',chapters:[{title:'x',lessons:[{id:'a',name:'a',steps:2,questions:0},{id:'b',name:'b',steps:1,questions:0}]}],depth:[]};
 const L=api.paths.lessonEvidence;assert.equal(L('7v7',p.chapters[0].lessons[0],new Set(['7v7:a:0']),new Set()).complete,false);
 assert.equal(L('7v7',p.chapters[0].lessons[0],new Set(['7v7:a:0','7v7:a:1']),new Set()).complete,true);
 assert.equal(api.paths.pathLessonLocked(p,p.chapters[0].lessons[1],new Set(['7v7:a:0','7v7:a:1']),new Set()),false);}

// Wiring: every consumer reads the one rule; path unlocking never uses the card first-try rule.
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const field=read('components/FieldLearning.tsx');
assert.match(field,/if\(right\)recordCorrectQuizAnswer\(chosen\.fmt,chosen\.id,question\)/,'FieldLearning saves every right answer (retries included) under the lesson key');
assert.doesNotMatch(read('lib/paths/formatPaths.ts').replace(/\/\*[\s\S]*?\*\//g,''),/CARD_QUIZ_FIRST_TRY|firstTry/,'the path rule does not use the card first-try rule');
assert.match(read('components/QuestLearningPath.tsx'),/locked=!stop\.upcoming&&!stop\.story&&pathLessonLocked\(path,stop\.lesson,steps,answers\)/,'Paths lock state comes from pathLessonLocked');
assert.match(read('components/QuestLearningPath.tsx'),/useQuizCompletions\(\)/,'Paths re-reads quiz answers reactively (no reload needed)');
assert.match(read('lib/town/cardTiers.ts'),/lessonEvidence\(path\.format,lesson,steps,answers\)\.complete/,'card tiers use lessonEvidence');
assert.match(read('lib/town/rideUnlocks.ts'),/pathProgressFrom\(steps,answers\)\.finished\.length/,'ride unlocks use pathProgressFrom');
assert.match(read('components/Town.tsx'),/setPathsRequest\(\{nonce:Date\.now\(\)\}\);setSettingsOpen\(true\)/,'finishing a path lesson returns to Paths');
console.log('Path progress: quiz pass unlocks the next stop in all 4 paths, no watch-through needed, persists over reload, replay never re-locks, failed quiz stays locked, finished paths feed card tiers and rides — passed.');
