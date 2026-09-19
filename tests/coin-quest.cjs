const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..');
function environment(initial={},browser=true){
 const data=new Map(Object.entries(initial)),events=new Map(),cache=new Map();let blocked=false;
 const context=vm.createContext({console,Set,Map,localStorage:{getItem:key=>{if(blocked)throw Error('storage blocked');return data.get(key)??null},setItem:(key,value)=>{if(blocked)throw Error('storage blocked');data.set(key,value)}}});
 const window={addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:(name,fn)=>{if(events.get(name)===fn)events.delete(name)}};
 if(browser)context.window=window;
 function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const wrapper=vm.runInContext('(function(exports,module,require){'+code+'\n})',context);wrapper(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get,server)=>context.window?get():server()}:load(path.resolve(path.dirname(file),id+'.ts')));cache.set(file,mod.exports);return mod.exports;}
 return {load,data,events,hydrate:()=>{context.window=window},block:()=>{blocked=true},storage:key=>events.get('storage')?.({key})};
}
const e=environment(),q=e.load('lib/town/coinQuest.ts'),{COIN_QUEST,COIN_STORAGE_KEY,COIN_REWARD_ID,emptyCoinProgress,sanitizeCoinProgress,applyCoinEvent,coinRewardEarned}=q;
assert.equal(new Set(COIN_QUEST.map(c=>c.teaching)).size,COIN_QUEST.length,'Every found ball teaches a different idea');
const ids=COIN_QUEST.map(c=>c.id),hidden=COIN_QUEST.find(c=>c.kind==='hidden').id,parcel=COIN_QUEST.find(c=>c.kind==='kick').id;
assert.equal(ids.length,55);assert.equal(new Set(ids).size,55);assert(COIN_QUEST.every(c=>Number.isFinite(c.x+c.y+c.z)&&c.clue&&c.detail&&c.teaching));
for(const raw of [null,undefined,false,1,'oops'])assert.equal(sanitizeCoinProgress(raw).collected.length,0);
const dirty=sanitizeCoinProgress({revealed:[parcel,parcel,'fake',4],collected:[hidden,hidden,'fake',null],hint:'fake',celebrated:true});
assert.equal(dirty.collected.length,1);assert(dirty.revealed.includes(hidden));assert.equal(dirty.revealed.length,2);assert.equal(dirty.hint,null);assert.equal(dirty.celebrated,false);
const oldTen=sanitizeCoinProgress({revealed:ids.slice(0,10),collected:ids.slice(0,10),hint:null,celebrated:true});assert.equal(oldTen.collected.length,10,'previous ten collectibles persist');assert(!coinRewardEarned(oldTen),'new goal requires fifty');assert(!oldTen.celebrated);
const nineteen=sanitizeCoinProgress({version:2,collected:ids.slice(0,-1)});assert.equal(nineteen.collected.length,54);assert(!coinRewardEarned(nineteen));
let s=emptyCoinProgress();assert.equal(applyCoinEvent(s,'fake','collect'),s);assert.equal(applyCoinEvent(s,parcel,'collect'),s,'cannot collect closed parcel');
s=applyCoinEvent({...s,hint:hidden},hidden,'collect');assert(s.collected.includes(hidden));assert.equal(s.hint,null);assert.equal(applyCoinEvent(s,hidden,'collect'),s,'duplicate pickup no-op');
s=applyCoinEvent(s,parcel,'reveal');assert.equal(applyCoinEvent(s,parcel,'reveal'),s);assert(!s.collected.includes(parcel));s=applyCoinEvent(s,parcel,'collect');assert(s.collected.includes(parcel));
for(const id of ids){if(s.collected.includes(id))continue;s=applyCoinEvent(s,id,'reveal');if(s.collected.length<COIN_QUEST.length-1)assert(!coinRewardEarned(s));s=applyCoinEvent(s,id,'collect');}
assert(coinRewardEarned(s));assert.equal(s.collected.length,COIN_QUEST.length);
const p=e.load('lib/town/coinProgress.ts');assert(!p.recordCoin(parcel,'collect'));assert(p.recordCoin(hidden,'collect'));assert(!p.recordCoin(hidden,'collect'));assert.equal(JSON.parse(e.data.get(COIN_STORAGE_KEY)).collected.length,1);
p.setCoinHint(parcel);assert.equal(p.readCoinProgress().hint,parcel);p.recordCoin(parcel,'reveal');assert.equal(p.readCoinProgress().collected.length,1);
const reload=environment(Object.fromEntries(e.data)),rp=reload.load('lib/town/coinProgress.ts');assert.equal(rp.readCoinProgress().hint,parcel);assert(rp.readCoinProgress().revealed.includes(parcel));assert(rp.recordCoin(parcel,'collect'));assert.equal(rp.readCoinProgress().hint,null);
let notices=0;const unsubscribe=p.subscribeCoins(()=>notices++);e.data.set(COIN_STORAGE_KEY,reload.data.get(COIN_STORAGE_KEY));e.storage(COIN_STORAGE_KEY);assert.equal(p.readCoinProgress().collected.length,2);assert.equal(notices,1);
// A write merges another tab's saved facts even before its storage event arrives.
const third=ids.find(id=>id!==hidden&&id!==parcel);e.data.set(COIN_STORAGE_KEY,JSON.stringify({revealed:[hidden,parcel,third],collected:[hidden,parcel,third],hint:null,celebrated:false}));p.setCoinHint(ids[4]);assert(p.readCoinProgress().collected.includes(third));p.dismissCoinCelebration();assert(!p.readCoinProgress().celebrated);
for(const id of ids){p.recordCoin(id,'reveal');p.recordCoin(id,'collect');}p.dismissCoinCelebration();assert(p.readCoinProgress().celebrated);assert(coinRewardEarned(p.readCoinProgress()));unsubscribe();assert(!e.events.has('storage'));
// SSR reads must not mark storage loaded before browser hydration.
const ssr=environment({[COIN_STORAGE_KEY]:JSON.stringify(s)},false),sp=ssr.load('lib/town/coinProgress.ts'),custom=ssr.load('lib/town/customization.ts');assert.equal(sp.readCoinProgress().collected.length,0);assert.equal(custom.sanitizeCustomization({costume:COIN_REWARD_ID}).costume,'none');ssr.hydrate();assert.equal(sp.readCoinProgress().collected.length,COIN_QUEST.length);assert.equal(custom.sanitizeCustomization({costume:COIN_REWARD_ID}).costume,COIN_REWARD_ID);
const broken=environment({[COIN_STORAGE_KEY]:'not JSON'}),bp=broken.load('lib/town/coinProgress.ts');assert.equal(bp.readCoinProgress().collected.length,0);broken.block();assert(bp.recordCoin(hidden,'collect'));assert(bp.readCoinProgress().collected.includes(hidden),'private browsing retains session progress');
console.log('PASS coin quest: 55 locations, sanitization, reveal/collect gating, duplicates, hints, persistence, cross-tab merge, completion, SSR hydration, blocked storage');

// Expanding the hunt never takes an already-earned costume away.
const legacy40={revealed:ids.slice(0,40),collected:ids.slice(0,40),hint:null,celebrated:true};
const migrated=sanitizeCoinProgress(legacy40);assert.equal(migrated.version,3);assert(migrated.rewardUnlocked);assert(coinRewardEarned(migrated));assert.equal(migrated.collected.length,40);assert(!migrated.celebrated,'new fifty-ball finale remains available');
assert(!coinRewardEarned(sanitizeCoinProgress({...legacy40,collected:ids.slice(0,39)})),'incomplete old save does not unlock');
assert(!coinRewardEarned(sanitizeCoinProgress({...legacy40,version:2,rewardUnlocked:false})),'new players need all fifty');
const legacyEnv=environment({[COIN_STORAGE_KEY]:JSON.stringify(legacy40)}),legacyProgress=legacyEnv.load('lib/town/coinProgress.ts');assert(coinRewardEarned(legacyProgress.readCoinProgress()));legacyProgress.setCoinHint(ids[40]);const persisted=JSON.parse(legacyEnv.data.get(COIN_STORAGE_KEY));assert.equal(persisted.version,3);assert(persisted.rewardUnlocked);assert(coinRewardEarned(sanitizeCoinProgress(persisted)));
console.log('PASS fifty-ball migration: completed original40 keeps reward, partial40 does not, new saves require50');

assert(!q.allCostumesEarned({...emptyCoinProgress(),collected:ids.slice(0,49)}));assert(q.allCostumesEarned({...emptyCoinProgress(),collected:ids}));assert(!q.allCostumesEarned({...emptyCoinProgress(),collected:ids.slice(0,40),rewardUnlocked:true}),'Legacy fox reward does not skip the new all-costume goal');console.log('PASS all costumes unlock at 50; legacy fox remains separate');

const oldFull=sanitizeCoinProgress({version:2,collected:ids.slice(0,50)});assert(q.allCostumesEarned(oldFull),"previous completed fifty-ball saves keep costumes");assert(!q.allCostumesEarned(sanitizeCoinProgress({version:3,collected:ids.slice(0,50)})),"new saves need fifty-five");
