// After a job ends: "Pick a card" first, then payday, never a payday flash in between (QA 4, Oct 26 2026).
// The first shift ever earns the Explore "Finish an island job" card. That offer used to arrive a few React commits after payday
// (ledger write -> explore signal -> checklist watcher effect -> offer store -> CardOfferHost effect -> Town state), so payday
// painted first and was then covered. Now IslandJobs earns the offer in the same effect that sets payday, and payday waits while
// any offer is open or pending (cardOfferHold.ts paydayWaits).
// usage: node tests/payday-after-pick.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const compile=f=>ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
function load(f,requireFn,globals={}){const mod={exports:{}};vm.runInNewContext(compile(f),{module:mod,exports:mod.exports,require:requireFn,...globals});return mod.exports;}

// 1. The rule: payday waits while an offer is open or pending, and shows once neither is.
const hold=load('lib/town/cardOfferHold.ts',id=>id==='react'?{useSyncExternalStore:(s,g)=>g()}:require(id));
assert.equal(hold.paydayWaits({offerOpen:false,offerPending:false}),false,'no pick: payday shows');
assert.equal(hold.paydayWaits({offerOpen:false,offerPending:true}),true,'offer earned, not open yet: payday waits (the old flash)');
assert.equal(hold.paydayWaits({offerOpen:true,offerPending:true}),true,'pick open: payday waits');
assert.equal(hold.paydayWaits({offerOpen:true,offerPending:false}),true,'pick closing: payday waits for the host');

// 2. The explore flag flips synchronously inside payJob's ledger write (the signal is a sync window event), so an offer earned
//    right after payJob() returns is in the store before React paints payday.
const listeners={};const win={addEventListener:(t,f)=>(listeners[t]??=[]).push(f),removeEventListener(){},dispatchEvent:e=>{(listeners[e.type]??[]).forEach(f=>f(e));return true;}};
const store=new Map(),localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail;}}
const env={window:win,localStorage,CustomEvent};
const signals=load('lib/town/exploreSignals.ts',require,env);
const activity=load('lib/town/exploreActivity.ts',id=>id==='react'?{useSyncExternalStore:(s,g)=>g()}:id==='./learningProgress'?{isLearningPreview:()=>false}:id==='./exploreSignals'?signals:require(id),env);
assert.equal(activity.exploreActivityNow().job,false,'fresh save: no job yet');
signals.signalExplore('job');
assert.equal(activity.exploreActivityNow().job,true,'the job signal ticks the checklist synchronously');

// 3. The wiring in IslandJobs: earn in the payday effect (first job only, before any await), and gate payday on paydayWaits.
const jobs=read('components/IslandJobs.tsx');
const effect=jobs.slice(jobs.indexOf('// Payday: pay once per finished shift.'),jobs.indexOf('// Garden pick notes'));
const iSet=effect.indexOf('setPayday({id:def.id,seconds:done.seconds,pay:null'),iPay=effect.indexOf('paying=islandJobWallet.payJob('),iEarn=effect.indexOf("if(firstJob&&exploreActivityNow().job)earnForExplore('island-job');"),iThen=effect.indexOf('void paying.then(');
assert.ok(iSet>=0&&iPay>iSet&&iEarn>iPay&&iThen>iEarn,'payday set, ledger written, offer earned, then the async pay result');
assert.ok(effect.includes('const firstJob=!exploreActivityNow().job,'),'only the first shift ever earns (no catch-up card for older saves)');
assert.ok(jobs.includes('const offerPending=useCardOffers().length>0;'),'any pending offer (they stay pending until a card is chosen)');
assert.ok(jobs.includes('payday:!!payday&&!paydayWaits({offerOpen:cardOfferOpen,offerPending:offerPending})'),'payday surface waits');
// The checklist watcher may call earnForExplore again for the same item: the store pays a source once ever.
assert.match(read('lib/town/cardRewards.ts'),/sourceKey=\(kind:RewardKind,id:string,day:string\)=>kind==='npc'\?`npc:\$\{day\}:\$\{id\}`:`\$\{kind\}:\$\{id\}`/,'explore sources are once ever');
assert.match(read('lib/town/cardRewardStore.ts'),/if\(current\.paid\.includes\(key\)\)return 'paid';/);
console.log('payday-after-pick ok: Pick a card, then payday, no flash');
