// Dev-only "unlock everything" (lib/dev/unlockAll.ts, gate lib/dev/devUnlockGate.ts): gating (a no-op in production builds and
// off localhost), what it grants, idempotence, and the reset. Loads the REAL stores with an in-memory localStorage.
// usage: node tests/dev-unlock.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');

function memoryStorage(){const m=new Map();return {m,get length(){return m.size;},key:i=>[...m.keys()][i]??null,getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()};}
/** A fresh module graph for one environment (NODE_ENV + hostname), sharing the given storage. */
function world({nodeEnv,hostname,search='',local=memoryStorage(),session=memoryStorage()}){
 const location={hostname,search,href:`http://${hostname}:8092/${search}`,pathname:'/',hash:'',replace(){}};
 const window={location,dispatchEvent:()=>true,addEventListener(){},removeEventListener(){},confirm:()=>true};
 class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail;}}
 const deleted=[];const indexedDB={databases:async()=>[{name:'fi2-test-db'}],deleteDatabase:n=>{deleted.push(n);}};
 const cache=new Map();
 const globals={Math,JSON,Set,Map,WeakMap,Object,Array,Number,String,Symbol,Promise,Error,TypeError,RegExp,Date,Boolean,Infinity,NaN,isFinite,parseFloat,parseInt,encodeURIComponent,
  console,localStorage:local,sessionStorage:session,window,CustomEvent,URL,URLSearchParams,location,navigator:undefined,document:undefined,indexedDB,
  queueMicrotask,setTimeout,clearTimeout,globalThis:{},crypto:require('node:crypto'),process:{env:{NODE_ENV:nodeEnv}},history:{replaceState(){}}};
 function load(file){
  if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};cache.set(file,mod);
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
  vm.runInNewContext(out,{...globals,exports:mod.exports,module:mod,require:id=>{
   if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
   const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.js',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
  return mod.exports;
 }
 return {local,session,deleted,load:rel=>load(path.join(root,rel))};
}
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const snapshot=s=>JSON.stringify([...s.m.entries()].sort());

(async()=>{
 // ---- Gate (pure) ----------------------------------------------------------------------------------------------------------
 const G=world({nodeEnv:'development',hostname:'localhost'}).load('lib/dev/devUnlockGate.ts');
 const req=(nodeEnv,hostname,search)=>G.devUnlockRequest({nodeEnv,hostname,search});
 same(req('development','localhost','?unlock=all'),{mode:'all',balls:false,paths:false,fish:false,resetDaily:false});
 same(req('development','127.0.0.1','?unlock=all&balls=1&paths=1&fish=1&resetDaily=1'),{mode:'all',balls:true,paths:true,fish:true,resetDaily:true});
 same(req('development','localhost','?unlock=reset'),{mode:'reset'});
 assert.equal(req('production','localhost','?unlock=all'),null,'production build: inert even on localhost');
 assert.equal(req('production','localhost','?unlock=reset'),null,'production build: reset inert');
 for(const host of ['futbolisland.app','www.futbolisland.app','futbol-island.vercel.app','192.168.1.20','localhost.evil.com','0.0.0.0'])
  assert.equal(req('development',host,'?unlock=all'),null,`host ${host} is refused`);
 assert.equal(req('development','localhost',''),null,'no flag, no unlock');
 assert.equal(req('development','localhost','?unlock=yes'),null,'only the exact flag');
 assert.equal(G.stripDevUnlockParams('http://localhost:8092/?unlock=all&balls=1&from=arcade'),'/?from=arcade');

 // ---- The unlock module refuses to run off localhost / in production (storage untouched) ---------------------------------
 for(const env of [{nodeEnv:'production',hostname:'localhost'},{nodeEnv:'development',hostname:'futbolisland.app'},{nodeEnv:'production',hostname:'futbolisland.app'}]){
  const w=world(env);w.local.setItem('fi2-keep-me','1');
  // (Loading the game's own stores runs their normal module-load migrations, e.g. the quiz-growth marker; snapshot after.)
  const U=w.load('lib/dev/unlockAll.ts');const before=snapshot(w.local);
  const r=await U.runDevUnlockAll({balls:true,paths:true,fish:true,resetDaily:true});
  assert.equal(r.ran,false,`${env.nodeEnv}@${env.hostname}: unlock refused`);
  const reset=await U.devResetSave();assert.equal(reset.ran,false,`${env.nodeEnv}@${env.hostname}: reset refused`);
  await U.handleDevUnlock({mode:'all',balls:true,paths:true,fish:true,resetDaily:true});
  assert.equal(snapshot(w.local),before,`${env.nodeEnv}@${env.hostname}: nothing written`);
  assert.equal(w.deleted.length,0,'no IndexedDB touched');
 }

 // ---- Unlock on localhost: everything granted through the real stores ----------------------------------------------------
 const w=world({nodeEnv:'development',hostname:'localhost'});
 const U=w.load('lib/dev/unlockAll.ts');
 const first=await U.runDevUnlockAll({});
 assert.equal(first.ran,true);
 const json=k=>JSON.parse(w.local.getItem(k));
 const {VENDING_ITEMS,VENDING_SPECIALS}=w.load('lib/town/vendingCatalog.ts');
 const {readableBook}=w.load('lib/books/catalog.ts');
 const vending=json('fi2-vending-v1');
 const expected=[...VENDING_ITEMS,...VENDING_SPECIALS].filter(i=>i.kind==='gear'||(i.kind==='costume'&&i.costume!=='none')||(i.kind==='display'&&readableBook(i))).map(i=>i.id)
  .filter(id=>!['ball:classic','scooter:classic','bike:classic','moped:classic','jetpack:classic'].includes(id));
 for(const id of expected)assert.ok(vending.owned.includes(id),`owned: ${id}`);
 const books=vending.owned.filter(id=>id.startsWith('display:'));
 assert.equal(books.length,first.books,'every readable book owned');assert.ok(books.length>=36,`at least 36 buyable books (got ${books.length})`);
 // The page reloads after the unlock, so every store starts fresh: check through a fresh module graph on the same storage.
 const fresh=world({nodeEnv:'development',hostname:'localhost',local:w.local,session:w.session});
 const {isVendingOwned}=fresh.load('lib/town/vendingWallet.ts');
 assert.ok(isVendingOwned('jetpack:ironman')&&isVendingOwned('costume:matchday-fox')&&isVendingOwned(books[0]),'the ledger itself reports ownership');
 const {readRideUnlocks,RIDE_ORDER,RIDE_CATEGORIES}=w.load('lib/town/rideUnlocks.ts');
 for(const c of RIDE_CATEGORIES)for(const id of RIDE_ORDER[c])assert.ok(readRideUnlocks().isUnlocked(c,id),`ride unlocked: ${c}:${id}`);
 const {costumeEarned,COIN_REWARD_ID}=w.load('lib/town/coinQuest.ts');const {CLUB_COSTUMES}=w.load('lib/town/costumes.ts');
 const coins=json('fi2-matchday-coins-v1');
 for(const c of [...CLUB_COSTUMES.map(c=>c.id),COIN_REWARD_ID])assert.ok(costumeEarned(coins,c),`costume earned: ${c}`);
 assert.equal(coins.collected.length,0,'ball hunt untouched without &balls=1');
 const {ALL_PLAYERS}=w.load('lib/town/cardCollection.ts');
 assert.equal(json('fi2-player-cards-v1').length,ALL_PLAYERS.length,'every card in the binder');
 const {FOOD_MENU,POUCH_SIZE,pouch,boughtToday}=w.load('lib/konbini/food.ts');const {DRINKS}=w.load('lib/town/drinkMachines.ts');const {localPlayDay}=w.load('lib/town/dailyPlay.ts');
 const collection=json('fi2-konbini-collection-v1'),konbini=json('fi2-konbini-v1');
 for(const id of [...FOOD_MENU.map(f=>f.id),...DRINKS.map(d=>d.id)])assert.ok(collection.items[id],`Konbini Collection: ${id}`);
 assert.equal(pouch(konbini).length,POUCH_SIZE,'Snacks pouch full');
 assert.equal(boughtToday(konbini,Date.now(),localPlayDay),0,'pouch snacks do not use today’s food limit');
 assert.equal(first.coinsGranted,50000);assert.equal(first.balance,50000,'50,000 coin balance');
 assert.equal(w.local.getItem('fi2-fishbook-v1'),null,'Fishbook untouched without &fish=1');
 assert.equal(first.paths,0,'paths untouched without &paths=1');

 // ---- Idempotent: a second run changes nothing -------------------------------------------------------------------------
 const once=snapshot(w.local);const second=await U.runDevUnlockAll({});
 assert.equal(snapshot(w.local),once,'second run writes nothing new');
 assert.equal(second.coinsGranted,0,'coins granted once');assert.equal(second.balance,50000);

 // ---- Optional flags ----------------------------------------------------------------------------------------------------
 const extra=await U.runDevUnlockAll({balls:true,paths:true,fish:true});
 const {COIN_QUEST}=w.load('lib/town/coinQuest.ts');
 assert.equal(json('fi2-matchday-coins-v1').collected.length,COIN_QUEST.length,'&balls=1: every hidden ball found');
 const {FISH}=w.load('lib/town/fishing/fishCatalog.ts');
 assert.equal(Object.keys(json('fi2-fishbook-v1').species).length,FISH.length,'&fish=1: every species in the Fishbook');
 assert.equal(w.load('lib/town/rideUnlocks.ts').readFinishedPaths(),extra.paths,'&paths=1: every path finished');
 assert.ok(extra.paths>=4);
 const full=snapshot(w.local);await U.runDevUnlockAll({balls:true,paths:true,fish:true});
 assert.equal(snapshot(w.local),full,'all flags: second run writes nothing new');

 // ---- &resetDaily=1 clears today's food / drink / job limits ------------------------------------------------------------
 const now=Date.now(),day=localPlayDay(now);
 const k=json('fi2-konbini-v1');k.purchases.push({id:'today-1',item:'drink-water',price:3,at:now,paid:true,fate:'eaten'},{id:'today-2',item:DRINKS[0].id,price:DRINKS[0].price,at:now,paid:true,fate:'eaten'});
 w.local.setItem('fi2-konbini-v1',JSON.stringify(k));
 const {localDay}=w.load('lib/town/jobs/jobEconomy.ts');
 w.local.setItem('fi2-island-jobs-v1',JSON.stringify({version:1,day:localDay(now),today:{'leaf-rake':4},lifetime:{'leaf-rake':9},earned:30,best:{},starter:true}));
 assert.equal(boughtToday(json('fi2-konbini-v1'),now,localPlayDay),1);
 await U.runDevUnlockAll({resetDaily:true});
 const after=json('fi2-konbini-v1');
 assert.equal(boughtToday(after,now,localPlayDay),0,'food limit cleared');assert.equal(boughtToday(after,now,localPlayDay,'drinks'),0,'drink limit cleared');
 assert.equal(after.purchases.length,k.purchases.length,'no purchase history lost');
 const jobs=json('fi2-island-jobs-v1');same(jobs.today,{},'job limits cleared');assert.equal(jobs.lifetime['leaf-rake'],9,'lifetime kept');assert.equal(jobs.day,day);

 // ---- Reset: every save key and IndexedDB database, nothing else ---------------------------------------------------------
 w.local.setItem('other-app-key','keep');w.session.setItem('fi2-arcade-loader-cast','x');
 const reset=await U.devResetSave();
 assert.equal(reset.ran,true);
 same([...w.local.m.keys()],['other-app-key'],'only non-game keys survive');
 assert.equal(w.session.getItem('fi2-arcade-loader-cast'),null,'session save cleared');
 same(w.deleted,['fi2-test-db'],'IndexedDB cleared');

 console.log(`dev-unlock: ok (gate, production + host no-op, ${expected.length} ownable ids incl. ${books.length} books, ${ALL_PLAYERS.length} cards, idempotent, flags, resetDaily, reset)`);
})().catch(e=>{console.error(e);process.exit(1);});
