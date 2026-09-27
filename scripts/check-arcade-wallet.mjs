import './register-local-ts.mjs';
import assert from 'node:assert/strict';
const {createArcadeWallet,arcadeCoinTarget,sanitizeArcadeWallet}=await import('../lib/arcade/arcadeWalletCore.ts');
let saved=null,queue=Promise.resolve(),serial=0,fail=false,grantFails=false;const owned=new Set(),notices=[];
const names=['A','B','C','D','E','F'],valid=new Set(names);
const lock=fn=>{const task=queue.then(fn);queue=task.catch(()=>{});return task;};
const make=()=>createArcadeWallet({read:()=>structuredClone(saved),write:v=>{if(fail)throw Error('quota');saved=structuredClone(v);},lock,valid,grant:n=>{if(grantFails)return false;owned.add(n);return true;},notify:n=>notices.push(n),now:()=>1700000000000+serial,id:()=>`id-${++serial}`,random:()=>0});
const a=make(),b=make();
assert.equal(await a.creditRun('same','runner',4,'First goals'),4);
assert.equal(await a.creditRun('same','runner',2,'stale'),0);
assert.deepEqual(await Promise.all([a.creditRun('same','runner',9,'more'),b.creditRun('same','runner',9,'repeat')]),[5,0]);
assert.equal(await b.creditRun('same','live',20,'wrong game'),0);
assert.equal(await a.creditRun('same','runner',999,'cap'),3);
assert.equal(a.load().balance,12);
assert.equal(arcadeCoinTarget('runner',{goals:3,collected:20}),10);
assert.equal(arcadeCoinTarget('pinball',{goals:4,moves:4}),15);
assert.equal(arcadeCoinTarget('tennis',{cleanReturns:9,points:4,won:true}),15);
assert.equal(arcadeCoinTarget('live',{goals:9,passes:30,finished:true,won:true,engaged:false}),0);
assert.equal(arcadeCoinTarget('live',{goals:9,passes:30,finished:true,won:true,engaged:true}),20);
assert.equal(await a.recordPuzzleBest('p1',2,'attempt1','visit1'),6);
assert.equal(await b.recordPuzzleBest('p1',2,'attempt1','visit1'),0);
assert.equal(await a.recordPuzzleBest('p1',3,'attempt2','visit1'),1);
for(let i=0;i<8;i++)assert.equal(await a.recordPuzzleBest('p1',3,`repeat${i}`,'visit1'),i<6?1:0);
assert.equal(await a.recordPuzzleBest('p1',3,'newvisit','visit2'),1);
assert.equal(await a.recordPuzzleBest('p2',0,'fail','visit2'),0);
// Two tabs buy against one shared wallet: exactly one succeeds with 30–59 coins.
await a.creditRun('fund','live',20,'match');b.refresh();const before=a.load().balance;
const purchases=await Promise.all([a.purchaseLegendPack(names),b.purchaseLegendPack(names)]);
assert.equal(purchases.filter(p=>p.ok).length,1);a.refresh();assert.equal(a.load().balance,before-30);assert.equal(owned.size,1);assert.equal(notices.length,1);
const restart=make();restart.load();await restart.reconcilePacks();assert.equal(notices.length,1,'reload does not grant/announce again');
// Failed canonical grant is recoverable from the persisted pack without a reroll/debit.
await a.creditRun('fund2','live',20,'match');grantFails=true;const pending=await a.purchaseLegendPack(names);assert(pending.ok);const chosen=pending.pack.player,balance=a.load().balance;assert(!owned.has(chosen));grantFails=false;await restart.reconcilePacks();assert(owned.has(chosen));assert.equal(restart.load().balance,balance);
// Failed wallet write never consumes coins or creates a revealed pack.
await a.creditRun('fund3','live',20,'match');await a.creditRun('fund4','live',20,'match');const stable=a.load();fail=true;const failed=await a.purchaseLegendPack(names);assert(!failed.ok);assert.equal(a.load().balance,stable.balance);assert.equal(a.load().packs.length,stable.packs.length);
assert.equal(await a.creditRun('volatile','runner',2,'memory fallback'),2);assert.equal(a.load().balance,stable.balance+2);fail=false;
for(let i=0;i<10;i++)await a.creditRun(`topup${i}`,'live',20,'match');for(let i=0;i<4;i++)assert((await a.purchaseLegendPack(names)).ok);const full=a.load();assert.equal(full.packs.length,6);assert.equal(new Set(full.packs.map(p=>p.player)).size,6);assert(!(await a.purchaseLegendPack(names)).ok);assert.equal(a.load().balance,full.balance);
const corrupted=sanitizeArcadeWallet({runs:{x:{game:'live',paid:-10},y:{game:'runner',paid:Infinity},z:{game:'pinball',paid:900,at:NaN}},packs:[{id:'bad',player:'A',cost:30,at:0}],best:{x:-3},visits:{x:999}},valid);assert.equal(corrupted.runs.z.paid,15);assert.equal(corrupted.packs.length,0);assert.equal(corrupted.best.x,0);assert.equal(corrupted.visits.x,6);
console.log('ARCADE_WALLET_PASS: monotonic coins, all5 policies, puzzle dedupe/repeat cap, concurrent tabs, save failure, pending-grant recovery, no duplicate packs, malformed data');
// Multi-card offers: one debit per receipt, guaranteed legends, fixed odds boundary, and durable recovery.
for(const roll of [0,.249,.25,.9]){
 let data=null,seq=0,broken=false,grantBroken=false;const granted=new Set(),pool=['L1','L2','L3','P1','P2','P3','P4','P5','P6'];
 const ports={read:()=>data,write:v=>{if(broken)throw Error('quota');data=structuredClone(v);},lock,valid:new Set(pool),grant:n=>{if(grantBroken&&n==='P1')return false;granted.add(n);return true;},notify:()=>{},now:()=>1,id:()=>`multi-${++seq}`,random:()=>roll};
 const wallet=createArcadeWallet(ports);for(let i=0;i<8;i++)await wallet.creditRun(`fund-${i}`,'live',20,'fixture');
 const small=await wallet.purchaseMysteryPack(3,pool.slice(0,3),pool.slice(3));assert(small.ok);assert.equal(small.pack.cards.length,3);assert.equal(small.pack.legends.length,1);assert.equal(wallet.load().balance,130);
 const large=await wallet.purchaseMysteryPack(5,pool.slice(0,3),pool.slice(3));assert(large.ok);assert.equal(large.pack.cards.length,5);assert.equal(new Set(large.pack.cards).size,5);assert.equal(large.pack.legends.length,roll<.25?2:1);assert.equal(wallet.load().balance,80);assert(large.pack.cards.every(n=>granted.has(n)));
 const restarted=createArcadeWallet(ports);assert.deepEqual(restarted.load().packs[1],large.pack,'reload keeps the exact five-card result');
 broken=true;assert(!(await wallet.purchaseMysteryPack(5,pool.slice(0,3),pool.slice(3))).ok);assert.equal(wallet.load().balance,80);broken=false;
 const buys=await Promise.all([wallet.purchaseMysteryPack(5,pool.slice(0,3),pool.slice(3)),restarted.purchaseMysteryPack(5,pool.slice(0,3),pool.slice(3))]);assert.equal(buys.filter(p=>p.ok).length,1);restarted.refresh();assert.equal(restarted.load().balance,30);
}
console.log('MYSTERY_PACKS_PASS: 3/5 cards, 30/50 coins, guaranteed legend, 25% second legend boundary, unique contents, persistence, failures, concurrent purchases');
{
 let data=null,seq=0,grantFails=true;const owned=new Set(),names=['L1','L2','P1','P2','P3','P4'];
 const ports={read:()=>data,write:v=>{data=structuredClone(v);},lock,valid:new Set(names),grant:n=>{if(grantFails&&n==='P1')return false;owned.add(n);return true;},notify:()=>{},now:()=>1,id:()=>`recover-${++seq}`,random:()=>0};
 const first=createArcadeWallet(ports);await first.creditRun('one','live',20,'fixture');await first.creditRun('two','live',20,'fixture');const result=await first.purchaseMysteryPack(3,names.slice(0,2),names.slice(2));assert(result.ok);assert.equal(first.load().balance,10);assert(!owned.has('P1'));grantFails=false;const restored=createArcadeWallet(ports);await restored.reconcilePacks();assert(result.pack.cards.every(n=>owned.has(n)));assert.equal(restored.load().balance,10);assert.deepEqual(restored.load().packs[0],result.pack);
}
console.log('MYSTERY_PACK_RECOVERY_PASS: partial collection grant retries without a reroll or second debit');
