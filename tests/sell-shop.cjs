// Farmers-market sell stand (docs/sell-shop.md): goods sell through the shared registry and the market's soft cap, and card
// trade-ins follow the kid-safety rules (flag ships off, Icons and pack legends protected, confirmation, daily limit, no money loop).
// usage: node tests/sell-shop.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cache={};
function load(file){
 if(cache[file])return cache[file];
 const out=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache[file]=mod.exports;
 const req=spec=>{if(!spec.startsWith('.'))throw new Error(`unexpected import ${spec} in ${file}`);return load(path.join(path.dirname(file),spec)+'.ts');};
 vm.runInNewContext(out,{exports:mod.exports,module:mod,require:req,Math,Date,Number,Object,Array,Set,Map,JSON,String,Promise});
 return cache[file]=mod.exports;
}
const G=load('lib/town/market/goods.ts'),M=load('lib/town/market/market.ts'),C=load('lib/town/market/cardSelling.ts'),P=load('lib/arcade/legendPacks.ts');

(async()=>{
 // ---- Goods: one registry, the market's prices and soft cap, coins through the credit port ----
 {
  let saved=null;const credits=[];const day=new Date(2026,8,27,10).getTime();
  const market=M.createMarket({read:()=>saved,write:v=>{saved=JSON.parse(JSON.stringify(v));},credit:async(id,amount,reason)=>{credits.push({id,amount,reason});return amount;},now:()=>day});
  assert.equal(market.gather('not-a-good',3),0,'only registry goods can be gathered or sold');
  const orange=G.goodById('orange');assert.ok(orange&&orange.price>0,'produce comes from the shared registry');
  assert.equal(market.gather('orange',2),2);
  const sale=await market.sell();
  assert.equal(sale.ok,true);assert.equal(sale.coins,orange.price*2,'sale uses the registry price');
  assert.equal(credits[0].amount,orange.price*2,'wallet credited through the port');assert.match(credits[0].id,/^market:2026-09-27:1$/,'deterministic wallet run id');
  assert.equal(M.basketCount(market.read()),0,'sold goods leave the basket');
  assert.equal((await market.sell()).ok,false,'an empty basket sells nothing');
  // Soft cap: after MARKET_FULL_PRICE_COINS of sales in a day, items earn half (at least 1 coin); a new day resets it.
  let s=M.emptyMarket('2026-09-27');s={...s,soldToday:M.MARKET_FULL_PRICE_COINS,basket:{orange:2}};
  const q=M.quoteSale(s);assert.equal(q.halfPrice,true);assert.equal(q.coins,2*Math.max(1,Math.floor(orange.price/2)),'half price after the soft cap');
  assert.equal(M.sanitizeMarket({...s,day:'2026-09-26'},'2026-09-27').soldToday,0,'soft cap resets at local midnight');
  for(const g of G.GOODS){assert.ok(Number.isInteger(g.price)&&g.price>=1&&g.price<=M.MARKET_FULL_PRICE_COINS/2,`${g.id} price is a whole number no bigger than half the daily soft cap`);assert.ok(g.lesson.length>20,`${g.id} teaches football`);}
  assert.equal(new Set(G.GOODS.map(g=>g.id)).size,G.GOODS.length,'no duplicate goods ids');
 }

 // ---- Card trade-ins: shipped flag and pure rules ----
 assert.equal(C.CARD_TRADE_MODE,'trade-in','card trade-ins switched on by the user (Sep 27 2026)');
 assert.ok(C.CARD_TRADE_COINS>=1&&C.CARD_TRADE_COINS<=3,'trade-in value stays tiny');
 assert.ok(C.CARD_TRADES_PER_DAY>=1&&C.CARD_TRADES_PER_DAY<=3,'small daily limit');
 // No money loop: every pack (vending and arcade use the wallet's pack prices) costs more than its cards could ever trade for,
 // even if nothing were protected; a whole day of trade-ins never buys a pack.
 const packs=[...P.MYSTERY_PACK_OPTIONS.map(p=>({size:p.size,price:p.price})),{size:1,price:P.LEGEND_PACK_PRICE}];
 assert.equal(C.noPackLoop(packs),true,'buy pack -> trade cards always loses coins');
 for(const p of packs)assert.ok(C.maxPackTradeValue(p.size)*3<=p.price,`pack of ${p.size} trades for at most a third of its ${p.price}-coin price`);
 assert.ok(C.CARD_TRADES_PER_DAY*C.CARD_TRADE_COINS<Math.min(...packs.map(p=>p.price)),'a full day of trade-ins is less than the cheapest pack');
 assert.equal(C.noPackLoop([{size:20,price:30}]),false,'the loop check really detects a loop');

 const tiers=JSON.parse(read('lib/town/cardTiers.json'));
 const icon=n=>tiers.overrides[n]==='icon'||(!tiers.overrides[n]&&(tiers.cards[n]?.demand??0)>=tiers.thresholds.icon);
 const legends=new Set(P.LEGEND_PACK_CANDIDATES);
 const isProtected=n=>icon(n)||legends.has(n);
 const regular=Object.keys(tiers.cards).filter(n=>!isProtected(n)).slice(0,5);
 assert.equal(regular.length,5);
 function harness(mode='trade-in',opts={}){
  const state={ledger:null,collection:new Set([...regular,'Lionel Messi','Pelé','Marta']),credits:[],now:new Date(2026,8,27,9).getTime()};
  const trade=C.createCardTrade({mode:()=>mode,readLedger:()=>state.ledger,writeLedger:v=>{if(opts.failWrite)throw new Error('full');state.ledger=JSON.parse(JSON.stringify(v));},
   readCollection:()=>[...state.collection],removeCard:n=>{if(opts.failRemove)return false;return state.collection.delete(n);},isProtected,
   credit:async(id,amount,reason)=>{state.credits.push({id,amount,reason});return amount;},day:t=>M.localMarketDay(t),now:()=>state.now});
  return {state,trade};
 }
 {
  const {state,trade}=harness('off');
  assert.equal(trade.tradeable().length,0,'nothing is listed while trade-ins are off');
  const r=await trade.trade(regular[0]);assert.equal(r.ok,false);assert.equal(r.reason,'off');
  assert.ok(state.collection.has(regular[0]),'the binder is untouched while off');assert.equal(state.credits.length,0);
 }
 {
  const {state,trade}=harness();
  const list=[...trade.tradeable()];
  assert.ok(!list.includes('Lionel Messi')&&!list.includes('Pelé')&&!list.includes('Marta'),'Icons and pack legends are never listed');
  assert.deepEqual(list.sort(),[...regular].sort());
  for(const n of ['Lionel Messi','Pelé','Marta']){const r=await trade.trade(n);assert.equal(r.reason,'protected',`${n} is protected`);}
  assert.equal((await trade.trade('Nobody')).reason,'not-owned');
  const first=await trade.trade(regular[0]);
  assert.equal(first.ok,true);assert.equal(first.coins,C.CARD_TRADE_COINS);assert.equal(first.credited,C.CARD_TRADE_COINS);
  assert.ok(!state.collection.has(regular[0]),'a traded card leaves the binder');
  assert.equal(state.credits[0].id,'card-trade:2026-09-27:1');assert.match(state.credits[0].reason,/Card trade-in/);
  assert.equal((await trade.trade(regular[0])).reason,'not-owned','the same card cannot be sold twice');
  await trade.trade(regular[1]);const third=await trade.trade(regular[2]);assert.equal(third.ok,true);assert.equal(third.left,0);
  const fourth=await trade.trade(regular[3]);assert.equal(fourth.reason,'day-limit','daily limit');
  assert.ok(state.collection.has(regular[3]),'a blocked trade keeps the card');
  assert.deepEqual(state.credits.map(c=>c.id),['card-trade:2026-09-27:1','card-trade:2026-09-27:2','card-trade:2026-09-27:3'],'unique idempotent run ids');
  assert.equal(state.credits.reduce((a,c)=>a+c.amount,0),C.CARD_TRADES_PER_DAY*C.CARD_TRADE_COINS);
  state.now+=24*3600e3;
  const next=await trade.trade(regular[3]);assert.equal(next.ok,true,'limit resets the next day');assert.equal(state.credits.at(-1).id,'card-trade:2026-09-28:4','run ids never repeat across days');
  assert.equal(trade.ledger().lifetime,4*C.CARD_TRADE_COINS);
 }
 {
  const {state,trade}=harness('trade-in',{failRemove:true});
  const r=await trade.trade(regular[0]);assert.equal(r.ok,false);assert.equal(r.reason,'storage');
  assert.equal(state.credits.length,0,'no coins when the card could not be removed');assert.equal(C.sanitizeCardTradeLedger(state.ledger,'2026-09-27').today.length,0,'ledger rolled back');
 }
 {
  const {state,trade}=harness('trade-in',{failWrite:true});
  const r=await trade.trade(regular[0]);assert.equal(r.reason,'storage');assert.ok(state.collection.has(regular[0]),'unsaved trade keeps the card');assert.equal(state.credits.length,0);
 }
 // Ledger sanitising: bad data, other days and over-limit lists never grant extra trades.
 const l=C.sanitizeCardTradeLedger({day:'2026-09-27',today:['a','a','b','c','d'],trades:-4,lifetime:'x',history:[{name:'a',coins:999,at:1}]},'2026-09-27');
 assert.deepEqual([...l.today],['a','b','c']);assert.equal(l.lifetime,0);assert.equal(l.history[0].coins,C.CARD_TRADE_COINS);
 assert.equal(C.sanitizeCardTradeLedger({day:'2026-09-26',today:['a']},'2026-09-27').today.length,0);

 // ---- Browser binding and UI: source checks ----
 const store=read('lib/town/market/cardSellingStore.ts'),ui=read('components/MarketCardsSection.tsx'),doc=read('docs/sell-shop.md');
 assert.match(store,/UNLOCK_ALL_CARDS&&!cardDevEarn\(\)\)return 'off'/,'trade-ins stay off while every card is unlocked for testing');
 assert.match(store,/NODE_ENV==='production'[^\n]*return false/,'dev preview override never runs in production');
 assert.match(store,/cardTier\(name\)==='icon'\|\|LEGENDS\.has\(name\)/,'Icons and the six legends are protected');
 assert.match(store,/p\.legends\?\?\[\]\)\.includes\(name\)/,'every coin-bought pack legend is protected');
 assert.match(store,/islandJobWallet\.credit/,'coins go through the island wallet bridge, not Astra\'s internals');
 assert.doesNotMatch(store,/localStorage\.setItem\(ARCADE_WALLET_KEY/,'never writes the arcade wallet directly');
 assert.match(ui,/if\(!active\|\|!view\)return null/,'the section does no work while closed');
 assert.doesNotMatch(ui,/setInterval|requestAnimationFrame/,'no timers or frame loops');
 assert.match(ui,/Keep it/);assert.match(ui,/data-card-confirm/,'every trade asks for confirmation');
 assert.doesNotMatch(ui,/\b(odds|rarity|rare|chance|%\s*chance)\b/i,'no odds or rarity copy');
 for(const k of ['CARD_TRADE_MODE','CARD_TRADE_COINS','CARD_TRADES_PER_DAY','money loop','Panini','solidarity'])assert.ok(doc.includes(k),`docs/sell-shop.md covers ${k}`);
 console.log('sell-shop: ok');
})().catch(e=>{console.error(e);process.exit(1);});
