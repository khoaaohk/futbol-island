const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
const manifest=require('../lib/town/quizManifest.json');
for(const [format,lessons] of Object.entries(manifest))assert.deepEqual(lessons,Object.fromEntries(JSON.parse(fs.readFileSync(`public/lessons/${format}.json`)).map(l=>[l.id,l.questions.length])),'Unlock manifest matches shipped catalog');
const storage=new Map();
function load(){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/quizProgress.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:mod,exports:mod.exports,window:{},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},require:id=>id==='react'?{}:id==='./learningProgress'?{isLearningPreview:()=>false}:manifest});return mod.exports;}
let api=load();assert.equal(api.getQuizProgress().completed,0);assert.equal(api.TOTAL_QUIZ_QUESTIONS,193);
const [format,lessons]=Object.entries(manifest)[0],id=Object.keys(lessons)[0];
api.recordCorrectQuizAnswer(format,id,0);api.recordCorrectQuizAnswer(format,id,0);api.recordCorrectQuizAnswer(format,id,999);api.recordCorrectQuizAnswer('bogus',id,0);assert.equal(api.getQuizProgress().completed,1,'Deduplicate and reject unknown questions');
api=load();assert.equal(api.getQuizProgress().completed,1,'Saved mastery survives reload');
for(const [f,ls] of Object.entries(manifest))for(const [lesson,count] of Object.entries(ls))for(let i=0;i<count;i++)api.recordCorrectQuizAnswer(f,lesson,i);
assert.equal(api.getQuizProgress().completed,193);storage.set(api.QUIZ_STORAGE_KEY,'["fake",null,{},"fake"]');assert.equal(load().getQuizProgress().completed,0,'Reject invalid saved keys');
const first=load(),second=load();storage.set(first.QUIZ_STORAGE_KEY,'[]');first.getQuizProgress();second.getQuizProgress();first.recordCorrectQuizAnswer(format,id,0);second.recordCorrectQuizAnswer(format,id,1);assert.equal(JSON.parse(storage.get(first.QUIZ_STORAGE_KEY)).length,2,'Concurrent tabs merge correct answers');
console.log('Quiz progress: catalog parity, deduplication, persistence, full mastery, invalid storage passed.');
