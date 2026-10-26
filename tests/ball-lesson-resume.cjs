// Found-ball lessons survive a reload mid-lesson (Oct 26 2026, owner): the coin save (version 8) keeps the open card's ball id and
// step; older saves migrate to null; Town reopens the card at that step; Got it clears it. Also: the Ball Studio draw intro is a
// device key. Run: node tests/ball-lesson-resume.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
function environment(initial={}){
 const data=new Map(Object.entries(initial)),cache=new Map();
 const context=vm.createContext({console,Set,Map,localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},window:{addEventListener(){},removeEventListener(){}}});
 function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:load(path.resolve(path.dirname(file),id+'.ts')));cache.set(file,mod.exports);return mod.exports;}
 return {load,data};
}
const e=environment(),q=e.load('lib/town/coinQuest.ts'),ids=q.COIN_QUEST.map(c=>c.id);
assert.equal(q.emptyCoinProgress().version,8);assert.equal(q.emptyCoinProgress().pendingLesson,null);
// Migration: a version-7 save has no pending lesson.
const v7=q.sanitizeCoinProgress({version:7,collected:ids.slice(0,3),revealed:[],hint:null,celebrated:false});
assert.equal(v7.version,8);assert.equal(v7.pendingLesson,null);assert.equal(v7.collected.length,3);
// Kept when it names a collected ball; dropped for unknown / uncollected ids; a bad step falls back to 0.
assert.equal(JSON.stringify(q.sanitizeCoinProgress({version:8,collected:[ids[0]],pendingLesson:{id:ids[0],step:2}}).pendingLesson),JSON.stringify({id:ids[0],step:2}));
assert.equal(q.sanitizeCoinProgress({version:8,collected:[ids[0]],pendingLesson:{id:ids[1],step:1}}).pendingLesson,null,'uncollected ball');
assert.equal(q.sanitizeCoinProgress({version:8,collected:[ids[0]],pendingLesson:{id:'fake',step:1}}).pendingLesson,null);
assert.equal(q.sanitizeCoinProgress({version:8,collected:[ids[0]],pendingLesson:{id:ids[0],step:-3}}).pendingLesson.step,0);
assert.equal(q.sanitizeCoinProgress({version:8,collected:[ids[0]],pendingLesson:'oops'}).pendingLesson,null);
// The store: save on open/step, survive a "reload" (a fresh environment over the same storage), clear on Got it.
const p=e.load('lib/town/coinProgress.ts');
p.recordCoin(ids[0],"reveal");p.recordCoin(ids[0],'collect');
p.setPendingBallLesson({id:ids[0],step:0});p.setPendingBallLesson({id:ids[0],step:2});
const reloaded=environment(Object.fromEntries(e.data)).load('lib/town/coinProgress.ts').readCoinProgress();
assert.ok(reloaded.collected.includes(ids[0]),"collected");assert.equal(JSON.stringify(reloaded.pendingLesson),JSON.stringify({id:ids[0],step:2}),'reload resumes at step 2');
p.setPendingBallLesson(null);assert.equal(JSON.parse(e.data.get(q.COIN_STORAGE_KEY)).pendingLesson,null,'Got it clears it');
// The card resumes at the saved step with every earlier step counted as played.
const s=e.load('lib/town/ballLessonStepper.ts'),r=s.resumeLessonStepper(4,2);
assert.equal(r.step,2);assert.equal(r.played,2);assert.equal(s.resumeLessonStepper(3,9).step,2,'clamped');assert.equal(s.resumeLessonStepper(3,-1).step,0);
// Wiring.
const town=read('components/Town.tsx'),card=read('components/BallHuntLesson.tsx');
assert.ok(town.includes('readCoinProgress().pendingLesson')&&town.includes('onStep={ballStep}')&&town.includes('setPendingBallLesson(ballFront?'),'Town saves and resumes the card');
assert.ok(card.includes('resumeLessonStepper(stepCount,startStep)')&&card.includes('onStep?.(stepper.step)'),'the card seeds and reports its step');
assert.ok(/'fi2-ball-draw-intro'/.test(read('lib/saves/snapshot.ts').split('export const DEVICE_KEYS')[1]),'draw intro is a device key');
console.log('ball-lesson-resume ok');
