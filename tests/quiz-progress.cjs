const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
const manifest=require('../lib/town/quizManifest.json');
for(const [format,lessons] of Object.entries(manifest))assert.deepEqual(lessons,Object.fromEntries(JSON.parse(fs.readFileSync(`public/lessons/${format}.json`)).map(l=>[l.id,l.questions.length])),'Unlock manifest matches shipped catalog');
const storage=new Map();
function load(){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/quizProgress.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:mod,exports:mod.exports,window:{},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},require:id=>id==='react'?{}:id==='./learningProgress'?{isLearningPreview:()=>false}:manifest});return mod.exports;}
let api=load();assert.equal(api.getQuizProgress().completed,0);assert.equal(api.TOTAL_QUIZ_QUESTIONS,Object.values(manifest).flatMap(Object.values).reduce((a,b)=>a+b,0));
const [format,lessons]=Object.entries(manifest)[0],id=Object.keys(lessons)[0];
api.recordCorrectQuizAnswer(format,id,0);api.recordCorrectQuizAnswer(format,id,0);api.recordCorrectQuizAnswer(format,id,999);api.recordCorrectQuizAnswer('bogus',id,0);assert.equal(api.getQuizProgress().completed,1,'Deduplicate and reject unknown questions');
api=load();assert.equal(api.getQuizProgress().completed,1,'Saved mastery survives reload');
for(const [f,ls] of Object.entries(manifest))for(const [lesson,count] of Object.entries(ls))for(let i=0;i<count;i++)api.recordCorrectQuizAnswer(f,lesson,i);
assert.equal(api.getQuizProgress().completed,api.TOTAL_QUIZ_QUESTIONS);storage.set(api.QUIZ_STORAGE_KEY,'["fake",null,{},"fake"]');assert.equal(load().getQuizProgress().completed,0,'Reject invalid saved keys');
const first=load(),second=load();storage.set(first.QUIZ_STORAGE_KEY,'[]');first.getQuizProgress();second.getQuizProgress();first.recordCorrectQuizAnswer(format,id,0);second.recordCorrectQuizAnswer(format,id,1);assert.equal(JSON.parse(storage.get(first.QUIZ_STORAGE_KEY)).length,2,'Concurrent tabs merge correct answers');
// Quiz growth migration: a pre-6th-question save that passed a grown lesson 5/5 keeps it passed (no Paths re-lock); a partial
// pass, a new device and a second load get nothing extra.
{const growth=load().QUIZ_GROWTH,[grown,before]=Object.entries(growth)[0],[other]=Object.entries(growth)[1],[gf,gid]=grown.split(':');
 assert.equal(manifest[gf][gid],before+1,'the grown lesson now has one more question');
 storage.clear();storage.set(api.QUIZ_STORAGE_KEY,JSON.stringify([...Array.from({length:before},(_,i)=>`${grown}:${i}`),`${other}:0`]));
 let m=load();assert(m.hasCorrectQuizAnswer(gf,gid,before),'old 5/5 save: the added question is credited');const [of,oid]=other.split(':');assert(!m.hasCorrectQuizAnswer(of,oid,before),'a partly answered lesson gets nothing');
 assert(JSON.parse(storage.get(api.QUIZ_STORAGE_KEY)).includes(`${grown}:${before}`),'the credit is saved for raw-storage readers (cardTiers, rideUnlocks)');
 storage.set(api.QUIZ_STORAGE_KEY,JSON.stringify(Array.from({length:before},(_,i)=>`${grown}:${i}`)));m=load();assert(!m.hasCorrectQuizAnswer(gf,gid,before),'the migration runs once per device');
 storage.clear();m=load();storage.set(api.QUIZ_STORAGE_KEY,JSON.stringify(Array.from({length:before},(_,i)=>`${grown}:${i}`)));m=load();assert(!m.hasCorrectQuizAnswer(gf,gid,before),'a new player still answers every question');}
console.log('Quiz progress: catalog parity, deduplication, persistence, full mastery, invalid storage, growth migration passed.');
