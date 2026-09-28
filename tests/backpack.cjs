// Make it yours → Backpack (user, Sep 28 2026): a view of everything the player owns, derived from the existing ownership stores,
// plus a one-time starter kit. usage: node tests/backpack.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const storage=new Map(),localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const events=[];const window={dispatchEvent:e=>{events.push(e);return true;},addEventListener(){},removeEventListener(){},location:{search:''}};
class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail;}}
// Browser stores the backpack reads, replaced by plain data the test controls.
const vending={ready:true,owned:[],spent:0,found:[],history:[]},wallet={balance:0,packs:[],vendingPurchases:[]};
const STUBS={
 'lib/arcade/arcadeWallet.ts':{readArcadeWallet:()=>wallet,useArcadeWallet:()=>wallet,purchaseMysteryPack:async()=>({ok:false,reason:'stub'}),ARCADE_WALLET_KEY:'fi2-arcade-wallet-v1'},
 'lib/town/vendingWallet.ts':{readVending:()=>vending,useVending:()=>vending},
 'lib/town/cardRewardStore.ts':{CARD_ADDED:'fi2-card-added'},
 'lib/town/market/cardSellingStore.ts':{CARD_REMOVED:'fi2-card-removed'},
};
const cache=new Map();
function load(file){
 const rel=path.relative(root,file);if(STUBS[rel])return STUBS[rel];if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,console,localStorage,window,CustomEvent,URLSearchParams,location:window.location,navigator:undefined,queueMicrotask,setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'}},
  require:id=>{
   if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
   const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.js',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const B=load(path.join(root,'lib/town/backpack.ts'));
const S=load(path.join(root,'lib/town/backpackStore.ts'));
const {CARD_ENTRIES,CARD_STORAGE_KEY}=load(path.join(root,'lib/town/cardCollection.ts'));
const {PLAYER_BOOKS,STARTER_BOOKS}=load(path.join(root,'lib/books/catalog.ts'));
const {VENDING_STARTERS}=load(path.join(root,'lib/town/vendingLedger.ts'));
const {RIDE_ORDER,pathsNeeded}=load(path.join(root,'lib/town/rideUnlocks.ts'));
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const ids=groups=>groups.flatMap(g=>g.items.map(i=>i.id));
const group=(groups,kind)=>groups.find(g=>g.kind===kind);
const sources=(over={})=>({owned:[],history:[],cards:[],packs:[],starter:null,...over});

// 1. Starter kit contents: the island intro book, three real starter-friendly cards (a team spine), base scooter/bike/moped/jetpack.
{
 assert.equal(B.STARTER_BOOK,'island');assert(PLAYER_BOOKS.island,'the island intro book is in the catalog');assert(STARTER_BOOKS.includes('island'));
 assert.equal(B.STARTER_CARDS.length,3);
 const roles=B.STARTER_CARDS.map(n=>{const c=CARD_ENTRIES.find(e=>e.name===n);assert(c,n+' is a real card');assert.equal(c.era,'current',n+' is a current player');return c.role;});
 same(roles,['goalkeeper','midfielder','striker'],'keeper, midfielder, striker: the spine of a team');
 same([...B.STARTER_RIDES],['scooter:classic','bike:classic','moped:classic','jetpack:classic']);
 for(const id of B.STARTER_RIDES){assert(VENDING_STARTERS.has(id),id+' is a free vending starter (owned, equippable)');const [c,o]=id.split(':');assert.equal(RIDE_ORDER[c][0],o);assert.equal(pathsNeeded(c,o),0,id+' needs no path');}
}
// 2. Grant once, idempotent, no coins; the three cards go into the real card collection.
{
 storage.clear();events.length=0;
 assert.equal(S.ensureStarterKit(1000),true,'first run grants the kit');
 const cards=JSON.parse(storage.get(CARD_STORAGE_KEY));same(cards,[...B.STARTER_CARDS],'the cards join the collection');
 assert(events.some(e=>e.type==='fi2-card-added'),'open card views are told');
 const saved=JSON.parse(storage.get(S.BACKPACK_KEY));assert.equal(saved.starter.at,1000);same(saved.starter.cards,[...B.STARTER_CARDS]);
 assert.equal(S.ensureStarterKit(2000),false,'second run does nothing');assert.equal(JSON.parse(storage.get(S.BACKPACK_KEY)).starter.at,1000);
 // Selling a starter card later does not bring it back.
 storage.set(CARD_STORAGE_KEY,JSON.stringify(B.STARTER_CARDS.slice(1)));assert.equal(S.ensureStarterKit(3000),false);assert.equal(JSON.parse(storage.get(CARD_STORAGE_KEY)).length,2,'the kit is not re-granted');
 assert.equal(wallet.balance,0,'no coins');assert(![...storage.keys()].some(k=>k.includes('wallet')),'the wallet is never written');
 // Existing player: a card they already had is not duplicated, and what they owned before is already "seen" (only the kit is New).
 storage.clear();storage.set(CARD_STORAGE_KEY,JSON.stringify(['Mary Earps','Lionel Messi']));vending.owned=['ball:frost'];vending.history=[{id:'ball:frost',at:50,cost:15}];
 assert.equal(S.ensureStarterKit(4000),true);
 same(JSON.parse(storage.get(CARD_STORAGE_KEY)),['Mary Earps','Lionel Messi','Martin Ødegaard','Ada Hegerberg']);
 const state=B.sanitizeBackpack(JSON.parse(storage.get(S.BACKPACK_KEY)));
 assert(state.seen.includes('ball:frost')&&state.seen.includes('card:Lionel Messi'),'old items are marked seen');
 for(const id of B.STARTER_KIT_IDS)assert(!state.seen.includes(id),id+' shows as New');
 // Preview testing session never grants.
 storage.clear();window.location.search='?preview=all';assert.equal(S.ensureStarterKit(5000),false);assert(!storage.has(S.BACKPACK_KEY));window.location.search='';
 vending.owned=[];vending.history=[];
}
// 3. Derived from the existing ownership sources, sorted into categories.
{
 const starter={at:1000,book:'island',cards:[...B.STARTER_CARDS]};
 const g=B.buildBackpack(sources({starter,cards:[...B.STARTER_CARDS]}));
 same(g.map(x=>x.kind).slice(0,5),['book','card','ride','ball','costume'],'section order');assert(!g.some(x=>x.kind==='display'),'no Home items category');
 same(group(g,'book').items.map(i=>i.ref),['island']);assert.equal(group(g,'book').items[0].source,'starter');
 same(group(g,'card').items.map(i=>i.ref).sort(),[...B.STARTER_CARDS].sort());assert(group(g,'card').items.every(i=>i.source==='starter'&&i.detail));
 same(group(g,'ride').items.map(i=>i.id),[...B.STARTER_RIDES],'the four base rides');assert(group(g,'ride').items.every(i=>i.source==='starter'&&i.acquiredAt===1000));
 same(group(g,'ball').items.map(i=>i.id),['ball:classic'],'the free starter ball');
 assert.equal(group(g,'costume').items.length,0);
 for(const x of g)assert(x.emptyHint.length>20&&x.lesson.length>20,x.kind+' has a lesson and a where-to-get-more hint');
 assert.equal(new Set(ids(g)).size,ids(g).length,'ids are unique across kinds');
 // Starter books exist even before the receipt (catalog STARTER_BOOKS).
 same(group(B.buildBackpack(sources()),'book').items.map(i=>i.ref),['island']);
}
// 4. New purchases and rewards appear automatically.
{
 const starter={at:1000,book:'island',cards:[...B.STARTER_CARDS]};
 const owned=['scooter:coast','ball:frost','costume:matchday-fox','display:plaza:book','display:rooftop:book'];
 const history=[{id:'scooter:coast',at:2000},{id:'ball:frost',at:2100},{id:'display:plaza:book',at:2200},{id:'display:rooftop:book',at:2300}];
 const pack={id:'p',player:'Pelé',cards:['Pelé','Kylian Mbappé','Rodri'],legends:['Pelé'],cost:30,at:2400};
 const g=B.buildBackpack(sources({starter,owned,history,cards:[...B.STARTER_CARDS,...pack.cards,'Lionel Messi'],packs:[pack]}));
 assert(group(g,'ride').items.some(i=>i.id==='scooter:coast'&&i.source==='bought'&&i.acquiredAt===2000),'a bought ride');
 assert(group(g,'ball').items.some(i=>i.id==='ball:frost'&&i.source==='bought'));
 same(group(g,'costume').items.map(i=>[i.ref,i.source]),[['matchday-fox','reward']],'an earned island animal');
 same(group(g,'book').items.map(i=>i.ref).sort(),['falcao','island','messi'],'bought books join Books');
 
 const cards=group(g,'card').items;assert.equal(cards.length,7);
 assert.equal(cards.find(i=>i.ref==='Pelé').source,'bought');assert.equal(cards.find(i=>i.ref==='Pelé').acquiredAt,2400);assert.equal(cards.find(i=>i.ref==='Lionel Messi').source,'reward');
 assert.equal(cards[0].ref,'Lionel Messi','newest card first');
 // Unknown ids in the sources are ignored.
 const odd=B.buildBackpack(sources({owned:['scooter:alien','costume:none'],cards:['Not A Player']}));
 assert(!ids(odd).includes('scooter:alien')&&!ids(odd).includes('costume:none')&&!ids(odd).some(i=>i.startsWith('card:')));
}
// 5. The registry is extensible: a new kind plugs in with one registration.
{
 B.registerBackpackCategory({kind:'boots',label:'Boots',order:35,lesson:'Boots with studs grip grass; flat soles are for futsal courts.',emptyHint:'Boots arrive in a later update of the vending machines.',
  collect:s=>s.owned.filter(id=>id.startsWith('boots:')).map(id=>({id,kind:'boots',ref:id,label:'Studs',source:'bought',acquiredAt:0}))});
 const g=B.buildBackpack(sources({owned:['boots:studs']}));
 same(g.map(x=>x.kind).slice(0,4),['book','card','ride','boots'],'ordered by `order`');same(group(g,'boots').items.map(i=>i.id),['boots:studs']);
 assert(B.backpackCategory('boots'));
}
// 6. Sanitising and migration of the backpack's own receipt.
{
 for(const bad of [null,undefined,42,'x',[],{version:2},{version:1,starter:'yes',seen:'all'}]){const s=B.sanitizeBackpack(bad);assert.equal(s.version,1);assert.equal(s.starter,null);same(s.seen,[]);}
 const s=B.sanitizeBackpack({version:1,starter:{at:'12',book:'',cards:['A','A',7,'x'.repeat(200)]},seen:['a','a',5,'b','x'.repeat(300)]});
 assert.equal(s.starter.at,12);assert.equal(s.starter.book,'island');same(s.starter.cards,['A']);same(s.seen,['a','b']);
 assert.equal(B.sanitizeBackpack({version:1,starter:{at:-1},seen:[]}).starter,null);
 const big=B.sanitizeBackpack({version:1,starter:null,seen:Array.from({length:5000},(_,i)=>'id'+i)});assert(big.seen.length<=4000,'seen is bounded');
 const blank=B.sanitizeBackpack(null);assert.equal(B.markSeen(blank,[]),blank,'no-op keeps the object');
 storage.set(S.BACKPACK_KEY,'{not json');assert.equal(S.ensureStarterKit(9000),true,'a corrupt receipt is replaced, not a crash');
}
// 7. UI wiring: Make it yours has the Look | Backpack toggle; every built-in kind has art and a tap action.
{
 const c=read('components/CharacterCustomizer.tsx'),b=read('components/Backpack.tsx');
 assert(/CharacterToggle value=\{view\}[^\n]*\{value:'look',label:'Look'\},\{value:'backpack',label:'Backpack'\}/.test(c),'top toggle Look | Backpack');
 assert(c.includes('ensureStarterKit()'),'the kit is granted when the island loads');
 assert(c.includes('<PlayerPopUpBook bookId={book}'),'books open the pop-up reader');
 assert(c.includes('<CharacterPreview'),'the look builder is kept');
 for(const kind of ['book','card','ride','ball','costume'])assert(new RegExp(`\\n ${kind}:\\{art:`).test(b),kind+' renderer');
 assert(!/setInterval|requestAnimationFrame/.test(b+read('lib/town/backpackStore.ts')),'no polling or animation loops');
}
console.log('Backpack: starter kit (book, 3 cards, 4 base rides) granted once and idempotent, items derived from vending/cards/packs, new purchases appear, registry extensible, sanitising, UI wiring passed.');
