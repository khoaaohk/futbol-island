const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
let preview=false,writes=0;const data=new Map(),cache=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{data.set(k,v);writes++;}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports:m.exports,module:m,Set,Map,JSON,window:{addEventListener(){},removeEventListener(){}},localStorage:storage,require:id=>id==='react'?{useMemo:f=>f(),useSyncExternalStore:(_,get)=>get()}:id==='./learningProgress'?{isLearningPreview:()=>preview}:id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id))):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const activity=load('lib/town/exploreActivity.ts'),model=load('lib/town/exploreChecklist.ts'),quest=load('lib/town/questModel.ts');
for(let i=0;i<3;i++)activity.recordExploreActivity('character','npc-'+i);for(let i=0;i<20;i++)activity.recordExploreActivity('character','npc-0');assert.equal(writes,3,'Duplicate chats must not write or count');assert.equal(activity.useExploreActivity().characters.length,3);
preview=true;activity.recordExploreActivity('store');assert.equal(activity.useExploreActivity().store,false);preview=false;
for(const kind of ['store','arcade','ramp']){activity.recordExploreActivity(kind);activity.recordExploreActivity(kind);}assert.equal(writes,6,'One write per newly finished activity');for(let i=3;i<15;i++)activity.recordExploreActivity('character','npc-'+i);assert.equal(activity.useExploreActivity().characters.length,10);assert.equal(writes,13);
assert.equal(activity.sanitizeExploreActivity({}).knockoutWins,0,'Older saves start new counters at zero');
for(const kind of ['truck','target','parachute','roofDrop']){activity.recordExploreActivity(kind);activity.recordExploreActivity(kind);}
activity.recordExploreKnockover(false);assert.equal(activity.useExploreActivity().knockovers,0);
for(let i=0;i<19;i++)activity.recordExploreKnockover(true);
for(let i=0;i<4;i++)activity.recordExploreActivity('knockoutWins');
assert.equal(activity.useExploreActivity().knockovers,19);assert.equal(activity.useExploreActivity().knockoutWins,4);
preview=true;activity.recordExploreActivity('knockoutWins');assert.equal(activity.useExploreActivity().knockoutWins,4);preview=false;
activity.recordExploreKnockover(true);activity.recordExploreActivity('knockoutWins');const cappedWrites=writes;
for(let i=0;i<10;i++){activity.recordExploreKnockover(true);activity.recordExploreActivity('knockoutWins');}
assert.equal(writes,cappedWrites,'Completed counters do not keep writing');
const lessons=JSON.parse(fs.readFileSync('lib/town/questLessonManifest.json')),quizzes=JSON.parse(fs.readFileSync('lib/town/quizManifest.json'));const evidence={visits:[...quest.QUEST_FORMATS],steps:[],equipment:false},keys=new Set();
for(const [id,n]of Object.entries(lessons.futsal).slice(0,5))for(let i=0;i<n;i++)evidence.steps.push(`futsal:${id}:${i}`);
for(const [id,n]of Object.entries(quizzes.futsal).slice(0,5))for(let i=0;i<n;i++)keys.add(`futsal:${id}:${i}`);
const targets=load('lib/town/coinQuest.ts').COIN_QUEST.filter(s=>s.wall).slice(0,5).map(s=>s.id);
assert.equal(targets.length,5);
const targetRow=ids=>model.exploreProgress(evidence,keys,activity.useExploreActivity(),ids).find(r=>r.id==='shoot-target');
assert.equal(targetRow([]).value,1,'Keep the old single-target credit');
assert.equal(targetRow([...targets.slice(0,4),targets[0]]).value,4,'Repeated IDs cannot double count');
assert.equal(targetRow(targets.slice(0,4)).complete,false);
assert.equal(targetRow(targets).complete,true,'Five distinct opened targets complete automatically');
const rows=model.exploreProgress(evidence,keys,activity.useExploreActivity(),targets);assert.equal(rows.length,16);assert(rows.every(row=>row.complete),'All sixteen tasks complete from evidence');assert.equal(rows.find(r=>r.id==='try-quizzes').value,5,'Count whole quiz sets, not questions');evidence.steps.pop();keys.delete([...keys].at(-1));const partial=model.exploreProgress(evidence,keys,activity.useExploreActivity());assert.equal(partial.find(r=>r.id==='watch-plays').value,4);assert.equal(partial.find(r=>r.id==='try-quizzes').value,4);data.set('fi2-explore-checklist-v1','["watch-plays"]');assert.equal(model.exploreProgress({...evidence,steps:[]},new Set(),activity.useExploreActivity()).find(r=>r.id==='watch-plays').value,0,'Legacy manual checks cannot invent activity');console.log('EXPLORE_AUTO_PASS: 16 tasks, capped knockovers and wins, distinct chats, complete lessons/quizzes, preview isolation, idempotent persistence, no manual credit');
