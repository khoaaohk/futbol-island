// Ride unlocks (user, Sep 25 2026): each finished path unlocks the next ride in every ride category, whichever path it was;
// all paths open each category's final ride; island animals stay on the ball rule. usage: node tests/ride-unlocks.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const storage=new Map();
const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
// Path progress is stubbed at the cardTiers boundary: `finishedPaths` is the list pathProgressFrom reports.
let finishedPaths=[];
const STUBS={
 'lib/town/cardTiers.ts':{pathProgressFrom:()=>({best:0,finished:[...finishedPaths],byFormat:{}})},
 'lib/town/questModel.ts':{sanitizeQuestEvidence:()=>({visits:[],steps:[],equipment:false})},
 'lib/town/questProgress.ts':{QUEST_STORAGE_KEY:'futbol-island-quests-v1',useQuestEvidence:()=>({steps:[]})},
 'lib/town/quizProgress.ts':{QUIZ_STORAGE_KEY:'futbol-island-quiz-progress-v1',useQuizCompletions:()=>new Set()},
};
const cache=new Map();
function load(file){
 const rel=path.relative(root,file);if(STUBS[rel])return STUBS[rel];if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 vm.runInNewContext(out,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,localStorage,process:{env:{NODE_ENV:'production'}},
  require:id=>{if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const R=load(path.join(root,'lib/town/rideUnlocks.ts'));
const C=load(path.join(root,'lib/town/customization.ts'));
const S=load(path.join(root,'lib/town/store.ts'));
const P=JSON.parse(fs.readFileSync(path.join(root,'lib/paths/formatPaths.json'),'utf8'));
const ALL=['futsal','7v7','9v9','11v11'];
const same=(a,b,msg)=>assert.equal(JSON.stringify(a),JSON.stringify(b),msg);
const reset=()=>{storage.clear();finishedPaths=[];};

// Path count and order data.
assert.equal(R.PATH_COUNT,P.length);assert.equal(R.PATH_COUNT,4,'futsal, 7v7, 9v9, 11v11');
for(const c of R.RIDE_CATEGORIES){
 same([...R.RIDE_ORDER[c]],C.CUSTOMIZATION_OPTIONS[c].map(o=>o.id),`${c}: unlock order matches the listed options (store shows them in unlock order)`);
 assert.equal(R.RIDE_ORDER[c][0],'classic',`${c}: starter first`);
}
same(C.CUSTOMIZATION_OPTIONS.scooter.map(o=>o.label),['Street','Coast cruiser','Sunset sport','Mint','Stunt','Comet'],'user-stated scooter order');

// 0 paths → starters only; N paths → first N+1; final needs every path.
const expected={0:1,1:2,2:3,3:4,4:6};
for(let n=0;n<=4;n++)for(const c of R.RIDE_CATEGORIES){
 const open=R.ridesOpenAt(c,n);same([...open],R.RIDE_ORDER[c].slice(0,expected[n]),`${c} at ${n} paths`);
 if(n<4)assert.ok(!open.includes(R.RIDE_ORDER[c].at(-1)),`${c}: final ride stays locked until every path is done`);
}
assert.equal(R.pathsNeeded('scooter','comet'),4);assert.equal(R.pathsNeeded('scooter','stunt'),4);assert.equal(R.pathsNeeded('scooter','coast'),1);
for(const c of R.RIDE_CATEGORIES)assert.equal(R.ridesOpenedBy(1)[c].length,1,'each path opens one ride per category');
same([...R.ridesOpenedBy(4).scooter],['stunt','comet'],'the last path opens the remaining ride and the final');
assert.equal(R.rideLockedLabel('scooter','comet'),'Finish every path to unlock');assert.equal(R.rideLockedLabel('scooter','mint'),'Finish a path to unlock');
assert.equal(R.rideProgressLine(2),'2/4 paths finished · next ride unlocks with your next path');
assert.equal(R.rideProgressLine(4),'4/4 paths finished · every ride unlocked');

// Live state from storage: starters only for a new player; order-independent counts.
reset();let u=R.readRideUnlocks();
for(const c of R.RIDE_CATEGORIES)for(const id of R.RIDE_ORDER[c])assert.equal(u.isUnlocked(c,id),id==='classic',`new player: ${c}:${id}`);
const unlockedSet=()=>{const x=R.readRideUnlocks();return R.RIDE_CATEGORIES.flatMap(c=>R.RIDE_ORDER[c].filter(id=>x.isUnlocked(c,id)).map(id=>c+':'+id)).sort().join();};
const orders=[['futsal','7v7'],['11v11','9v9'],['9v9','futsal']];const sets=orders.map(o=>{reset();finishedPaths=o;return unlockedSet();});
assert.ok(sets.every(s=>s===sets[0]),'which two paths were finished does not matter');
reset();finishedPaths=ALL;u=R.readRideUnlocks();for(const c of R.RIDE_CATEGORIES)for(const id of R.RIDE_ORDER[c])assert.ok(u.isUnlocked(c,id),`all paths: ${c}:${id}`);

// Never re-locks: real progress is remembered even if the count later drops (e.g. new lessons added to a path).
reset();finishedPaths=['7v7','9v9'];R.readRideUnlocks();finishedPaths=[];u=R.readRideUnlocks();
assert.ok(u.isUnlocked('bike','sunset')&&u.isUnlocked('jetpack','rocketboard'),'granted rides stay unlocked');assert.ok(!u.isUnlocked('bike','bmx'));

// Old saves: rides equipped before the rule stay unlocked (first run seeds grants from the raw saved look).
reset();storage.set('futbol-island-customization-v1',JSON.stringify({...C.DEFAULT_CUSTOMIZATION,scooter:'comet',jetpack:'ironman',bike:'mountain',moped:'sport'}));
const loaded=R.enforceRideUnlocks(C.loadCustomization());assert.equal(loaded.scooter,'comet');assert.equal(loaded.jetpack,'ironman');assert.equal(loaded.bike,'mountain');assert.equal(loaded.moped,'sport');
u=R.readRideUnlocks();assert.ok(u.isUnlocked('scooter','comet')&&!u.isUnlocked('scooter','mint'),'only what the save had is grandfathered');
reset();storage.set('futbol-island-customization-v1',JSON.stringify({...C.DEFAULT_CUSTOMIZATION,jetpack:'hovercraft'}));assert.equal(R.enforceRideUnlocks(C.loadCustomization()).jetpack,'helicopter','legacy hovercraft → helicopter keeps its grant');

// Selecting a locked ride is impossible: Town runs every look (store equip, customizer, saved look) through enforceRideUnlocks.
const town=v=>R.enforceRideUnlocks(C.sanitizeCustomization(v));
reset();assert.equal(town({...C.DEFAULT_CUSTOMIZATION,scooter:'comet'}).scooter,'classic');
assert.equal(town(S.equipStoreItem(C.DEFAULT_CUSTOMIZATION,'scooter:coast').value).scooter,'classic','store equip of a locked ride falls back');
assert.equal(town(S.equipStoreItem(C.DEFAULT_CUSTOMIZATION,'ball:cosmic').value).ball,'cosmic','balls stay free');
finishedPaths=['futsal'];assert.equal(town({...C.DEFAULT_CUSTOMIZATION,scooter:'coast'}).scooter,'coast');assert.equal(town({...C.DEFAULT_CUSTOMIZATION,scooter:'sunset'}).scooter,'classic');
const same1=town({...C.DEFAULT_CUSTOMIZATION,bike:'coast',moped:'coast',jetpack:'helicopter'});assert.equal(same1.bike+same1.moped+same1.jetpack,'coastcoasthelicopter');

// Island animals are unaffected: costumes follow the ball rule whatever the path count.
const Q=load(path.join(root,'lib/town/coinQuest.ts'));
assert.ok(!/rideUnlocks/.test(fs.readFileSync(path.join(root,'lib/town/coinQuest.ts'),'utf8')),'coinQuest does not use the ride rule');
const costume=C.CUSTOMIZATION_OPTIONS.costume.find(o=>o.coinReward);
const costumeAt=n=>{reset();finishedPaths=n;return town({...C.DEFAULT_CUSTOMIZATION,costume:Q.COSTUME_UNLOCK_ORDER[0]}).costume+'|'+C.isCustomizationUnlocked(costume,0,0);};
assert.equal(costumeAt([]),costumeAt(ALL),'costume locks ignore path progress');
assert.ok(!/from '\.\/rideUnlocks'/.test(fs.readFileSync(path.join(root,'lib/town/customization.ts'),'utf8')),'costume rule untouched');
console.log('Ride unlocks: 4 paths; starters only at 0; N paths open N+1 rides; order-independent; finals need every path; grants never re-lock; old saves keep equipped rides; locked rides cannot be equipped; balls free; animals on the ball rule. PASS');
