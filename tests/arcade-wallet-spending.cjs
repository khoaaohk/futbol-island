const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {createArcadeWallet,ARCADE_COIN_CAPS}=require('../lib/arcade/arcadeWalletCore.ts');
let saved={version:1,runs:{'island-starter-coins:0':{game:'live',paid:20,reason:'Welcome coins',at:1},'market:day:1':{game:'live',paid:10,reason:'Farmers market',at:2}},packs:[]},queue=Promise.resolve(),fail=false;
const ports={read:()=>structuredClone(saved),write:s=>{if(fail)throw Error('disk');saved=structuredClone(s);},lock:fn=>{const p=queue.then(fn);queue=p.catch(()=>{});return p;},valid:new Set(['A','B','C','D','E','F','G']),grant:()=>true,notify:()=>{},now:()=>100,id:()=>Math.random().toString(),random:()=>0};
(async()=>{
 const w=createArcadeWallet(ports),other=createArcadeWallet(ports);assert.equal(w.load().balance,30);assert.equal(w.load().byGame.island,30);assert.equal(w.load().byGame.live,0);assert.equal(ARCADE_COIN_CAPS.island,20);
 assert((await w.payArcadePlay('tennis','run1')).ok);assert.equal(w.load().balance,27);
 assert((await w.payArcadePlay('tennis','run1')).ok);assert.equal(w.load().balance,27,'retry same transaction never pays twice');
 assert((await w.spend('vending:ball',20,'Ball','vending')).ok);assert.equal(w.load().balance,7);
 assert(!(await w.purchaseMysteryPack(3,['A','B'],['C','D','E','F','G'])).ok,'packs cannot spend debited coins');
 const results=await Promise.all([w.spend('last1',5,'Play'),other.spend('last2',5,'Play')]);assert.equal(results.filter(r=>r.ok).length,1,'two tabs cannot overdraw');
 assert.equal(createArcadeWallet(ports).load().balance,2,'reload retains debits');
 fail=true;assert(!(await w.spend('fails',1,'Play')).ok);fail=false;assert.equal(createArcadeWallet(ports).load().balance,2,'failed save costs nothing');
 assert(!(await w.spend('negative',-1,'Bad')).ok);assert(!(await w.spend('float',.5,'Bad')).ok);
 await w.creditRun('job-new','island',7,'Island job');assert.equal(w.load().balance,9);assert.equal(w.load().byGame.island,37);
 await economyPass();
 console.log('PASS shared debits, 3-coin play, island-source migration, idempotency, reload, save failure and concurrent affordability; economy pass: Training meter, learning coins, free puzzles, pack top-ups, 3 packs a day');
})().catch(e=>{console.error(e);process.exit(1);});

// Economy pass (docs/economy/ECONOMY_PROPOSAL.md, applied 28 Sep 2026).
async function economyPass(){
 const {isTrainingRun,trainingPay,TRAINING_FULL_COINS,TRAINING_HALF_COINS}=require('../lib/town/dailyMeter.ts');
 const {PACKS_PER_DAY,PACK_RESTOCK_MESSAGE,MYSTERY_PACK_OPTIONS}=require('../lib/arcade/legendPacks.ts');
 const {learnAmount,learnRunId,createLearnCoins}=require('../lib/town/learnCoins.ts');
 const make=(valid=['A','B','C','D','E','F','G'],seed=null)=>{let data=seed,q=Promise.resolve(),clock=new Date(2026,8,28,10).getTime();
  const p={meter:isTrainingRun,read:()=>structuredClone(data),write:v=>{data=structuredClone(v);},lock:fn=>{const t=q.then(fn);q=t.catch(()=>{});return t;},valid:new Set(valid),grant:()=>true,notify:()=>{},now:()=>clock,id:()=>'id'+Math.random(),random:()=>0};
  return {w:createArcadeWallet(p),tick:ms=>{clock+=ms;},data:()=>data};};
 // Pure meter: full to 60, half to 120, then a 1-coin tip per earning.
 assert.equal(trainingPay(0,20),20);assert.equal(trainingPay(50,20),15,'10 full + 10 at half');assert.equal(trainingPay(119,20),1);assert.equal(trainingPay(200,20),1,'tip');assert.equal(trainingPay(200,0),0);
 assert(isTrainingRun('island-job:leaf-rake:2026-09-28:1','island')&&isTrainingRun('market:2026-09-28:3','island')&&isTrainingRun('card-trade:2026-09-28:1','island')&&isTrainingRun('x','runner')&&isTrainingRun('puzzle:a','puzzle'));
 assert(!isTrainingRun('island-starter-coins','island')&&!isTrainingRun('daily-play:2026-09-28','island')&&!isTrainingRun('learn:quiz:7v7:a','learn'),'grants and learning coins are never metered');
 {const {w,tick}=make();let total=0;for(let i=0;i<3;i++)total+=await w.creditRun(`island-job:ball-kid:2026-09-28:${i}`,'island',20,'Job');assert.equal(total,TRAINING_FULL_COINS,'three 20-coin shifts fill the full-pay line');
  assert.equal(await w.creditRun('run-a','live',20,'Match'),10,'then half pay');
  // A growing arcade run is metered as one earning, never twice.
  assert.equal(await w.creditRun('run-b','runner',4,'Goals'),2);assert.equal(await w.creditRun('run-b','runner',4,'Goals'),0,'retry pays nothing');assert.equal(await w.creditRun('run-b','runner',10,'More goals'),3);
  for(let i=0;i<20;i++)await w.creditRun(`market:2026-09-28:${i}`,'island',20,'Sale');
  assert(w.load().training.earned>=TRAINING_HALF_COINS,'the snapshot reports today\'s meter');assert.equal(w.load().training.day,'2026-09-28');
  const before=w.load().balance;assert.equal(await w.creditRun('card-trade:2026-09-28:1','island',2,'Trade-in'),1,'past the half line: a 1-coin tip');
  assert.equal(await w.creditOnce(learnRunId('quiz','7v7:scan'),'learn',learnAmount('quiz',true),'Learning'),18,'learning coins are never metered');assert.equal(w.load().balance,before+19);
  tick(86400000);assert.equal(await w.creditRun('island-job:ball-kid:2026-09-29:1','island',10,'Job'),10,'full pay again after local midnight');}
 // Learning coins: once ever, a later perfect run cannot top a lesson up; the path reward fits one run (cap 75).
 {const {w}=make();const notes=[];const learn=createLearnCoins({creditOnce:w.creditOnce,notify:d=>notes.push(d)});
  assert.equal(await learn.pay('quiz','7v7:scan','You passed ‘Scanning’'),12);assert.equal(await learn.pay('quiz','7v7:scan','You passed ‘Scanning’',true),0,'first completion decides');
  assert.equal(await learn.pay('path','7v7','You finished the 7v7 path'),75);assert.equal(await learn.pay('ball','b1','You found a hidden ball'),10,'hidden ball 5 → 10 (economy update 29 Sep 2026)');assert.equal(await learn.pay('story','s1','x'),10);assert.equal(await learn.pay('journey','j:0','x'),8);assert.equal(await learn.pay('explore','e','x'),5);
  assert.equal(notes.length,6);assert.equal(notes[0].amount,12);assert.equal(w.load().byGame.learn,120);}
 // 29 Sep 2026: the ball raise is forward-only. A ball paid 5 under the old value keeps its 5 and is never topped up or cut.
 {const old={version:1,spends:{},runs:{'learn:ball:b0':{game:'learn',paid:5,reason:'Learning · old ball',at:1}},best:{},attempts:{},visits:{},packs:[]};
  const {w}=make(undefined,old);const learn=createLearnCoins({creditOnce:w.creditOnce,notify:()=>{}});assert.equal(w.load().balance,5,'old ball coins kept');
  assert.equal(await learn.pay('ball','b0','x'),0,'an already-paid ball never pays again');assert.equal(w.load().balance,5);
  assert.equal(await learn.pay('ball','b1','x'),10,'a newly found ball pays the new 10');assert.equal(w.load().balance,15);}
 // Pass Puzzles: first solve 5 + stars, new stars only after that, repeats pay 0.
 {const {w}=make();assert.equal(ARCADE_COIN_CAPS.puzzle,8);assert.equal(await w.recordPuzzleBest('p1',3,'a1','v1'),8);assert.equal(await w.recordPuzzleBest('p2',1,'a2','v1'),6);assert.equal(await w.recordPuzzleBest('p2',2,'a3','v1'),1);
  for(let i=0;i<4;i++)assert.equal(await w.recordPuzzleBest('p1',3,'r'+i,'v1'),0,'a repeat pays 0');}
 // Packs: legend slot first, then the pack's own cards, then other missing cards; never a duplicate; top-up packs sanitize.
 {const cards=['L1','L2','R1','X1','X2','X3','X4','X5','X6','X7','X8','X9'],{w,data}=make(cards);for(let i=0;i<10;i++)await w.creditOnce('learn:path:f'+i,'learn',75,'fund');
  let r=await w.purchaseMysteryPack(3,[],['R1'],['X1','X2']);assert(r.ok,'a legend-less top-up pack');assert.deepEqual(r.pack.legends,[]);assert.equal(r.pack.player,'R1');assert.deepEqual(r.pack.cards,['R1','X1','X2']);
  r=await w.purchaseMysteryPack(5,['L1'],[],['X3']);assert(r.ok);assert.deepEqual(r.pack.cards,['L1','X3'],'fewer cards than the pack size when fewer are new');
  assert(!(await w.purchaseMysteryPack(3,[],[],['X4'])).ok,'extras alone never keep a pack on sale');
  assert((await w.purchaseMysteryPack(3,['L2'],['X4'],[])).ok);r=await w.purchaseMysteryPack(3,[],['X5'],[]);assert.equal(r.ok,false,'three packs a local day');assert.equal(r.reason,PACK_RESTOCK_MESSAGE);assert.equal(PACKS_PER_DAY,3);
  const reload=createArcadeWallet({read:()=>structuredClone(data()),write:()=>{},lock:fn=>Promise.resolve().then(fn),valid:new Set(cards),grant:()=>true,notify:()=>{},now:()=>0,id:()=>'',random:()=>0});
  assert.equal(reload.load().packs.length,3,'legend-less and short packs survive sanitising');assert.equal(reload.load().balance,750-2*MYSTERY_PACK_OPTIONS[0].price-MYSTERY_PACK_OPTIONS[1].price);}
 // Dead-end fix: a binder missing only one Icon can still be finished through a pack (vendingLedger + wallet together).
 {const {createVendingLedger}=require('../lib/town/vendingLedger.ts');const all=['Pelé','Marta','Lionel Messi','R1','R2','R3'],owned=new Set(all.filter(n=>n!=='Lionel Messi'));
  const {w}=make(all);await w.creditOnce('learn:path:x','learn',75,'fund');
  const ledger=createVendingLedger({read:()=>null,write:()=>{},readSavedLook:()=>null,readCollection:()=>[...owned],arcadeBalance:()=>w.load().balance,lock:fn=>Promise.resolve().then(fn),now:()=>1,
   buyPack:p=>w.purchaseMysteryPack(p.size,p.legends,p.regular,p.extra),iconsOpen:()=>true,tierOf:n=>['Pelé','Marta','Lionel Messi'].includes(n)?'icon':'regular',allCards:()=>all});
  const pack={id:'pack:3',kind:'pack',price:40,label:'3-card mystery pack',blurb:'t',row:'packs',pack:{size:3,legends:['Pelé','Marta'],regular:['Lionel Messi','R1','R2','R3']}};
  assert.equal(ledger.packFreshness(pack.pack).available,true,'one missing Icon keeps the pack on sale');
  const r=await ledger.buy(pack);assert(r.ok,'the last card can be bought');const got=w.load().packs.find(p=>p.id===r.packId);assert.deepEqual(got.cards,['Lionel Messi']);got.cards.forEach(n=>owned.add(n));
  assert.equal(owned.size,all.length,'binder complete');assert.equal(ledger.packFreshness(pack.pack).available,false,'then it is sold out, never a duplicate');}
}
