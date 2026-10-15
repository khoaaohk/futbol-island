#!/usr/bin/env node
// Admin analytics: the Kit Shop, the Sandbar and Summit Isle (Oct 15 2026). New area 'shop', new places summit_isle /
// summit_pitch / summit_sandbar, new learning-counter ids for Kit Shop / Sandbar / Summit Isle / beachcombing events, the
// overview's new count rows, and the Summit Kick arcade-board read. Graceful degradation (migration not run yet, leaderboard
// table missing, env not configured) is checked alongside the happy path. Companion to tests/admin-analytics-places.cjs,
// which checks the SQL migration itself (20261015_analytics_summit_kit.sql) against these same ids.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const loaded=new Map();
/** Shared across every sandboxed module (vm.runInNewContext gives each load() its own realm, so a real process.env change in
 *  this file would never reach a module's closed-over copy unless they all share this one object). */
const SANDBOX_ENV={};
function resolve(from,id){
 const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;
 throw Error('cannot resolve '+id+' from '+from);
}
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const v={default:JSON.parse(fs.readFileSync(file,'utf8'))};loaded.set(file,v);return v;}
 const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext('(function(module,exports,require){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText+'\n})',
  // `fetch` is only a default-parameter reference (lib/arcade/kickAdminMetrics.ts): declared so it is never a ReferenceError,
  // even though every call in this file passes its own fetchImpl and this default is never actually invoked.
  {Buffer,URL,URLSearchParams,TextDecoder,Date,Math,JSON,process:{env:SANDBOX_ENV},console,performance:{now:()=>0},fetch:undefined})(m,m.exports,id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id));
 loaded.set(file,m.exports);return m.exports;}
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x));
let passed=0;const ok=(name,fn)=>Promise.resolve().then(fn).then(()=>passed++,e=>{console.error('FAIL',name);throw e;});

const IDS=load('lib/analytics/islandIds.ts'),CID=load('lib/analytics/countIds.ts'),C=load('lib/analytics/core.ts'),P=load('lib/analytics/islandPlaces.ts');
const SUMMIT=load('lib/town/summitIsle.ts');
const OV=load('lib/analytics/overview.ts');
const KICK=load('lib/arcade/kickAdminMetrics.ts');

(async()=>{

// 1. The three new places: fixed ids, labelled, reachable at known Summit Isle coordinates (the island's own landmarks, so
// this tracks any future reshaping of the island instead of a frozen x/z snapshot).
await ok('new places',()=>{
 for(const id of ['summit_sandbar','summit_pitch','summit_isle'])assert(IDS.PLACE_IDS.includes(id)&&IDS.PLACE_LABEL[id],id);
 assert.equal(new Set(IDS.PLACE_IDS).size,IDS.PLACE_IDS.length,'no duplicate place ids');
 const L=SUMMIT.SUMMIT_LANDMARKS;
 assert.equal(P.placeAt(L.pitch.x,L.pitch.z),'summit_pitch','the Summit 5s pitch');
 assert.equal(P.placeAt(L.sandbarMiddle.x,L.sandbarMiddle.z),'summit_sandbar','mid-sandbar');
 assert.equal(P.placeAt(L.northBeach.x,L.northBeach.z),'summit_isle','the island elsewhere');
 assert.equal(P.placeAt(L.southBeach.x,L.southBeach.z),'summit_isle','the south beach, well clear of the pitch');
 // The lookout shares the pitch's small terrace (just past its fence): close, but still "elsewhere on the island", not "on the pitch".
 assert.equal(P.placeAt(L.lookout.x,L.lookout.z),'summit_isle','the lookout, off the pitch');
 // Off Summit Isle entirely: the main island and Coral Cay still resolve as before (no regression from the new checks).
 assert.equal(P.placeAt(85,-35),'island_square');assert.equal(P.placeAt(-140,0),'sea');
 // Every place the lookup can return (including the new ones) is reachable somewhere on the map, like admin-analytics-places.cjs's own sweep.
 const seen=new Set();for(let x=-160;x<880;x+=4)for(let z=-320;z<300;z+=4)seen.add(P.placeAt(x,z));
 for(const id of ['summit_sandbar','summit_pitch','summit_isle'])assert(seen.has(id),id+' reachable in the scanned box');
});

// 2. The new 'shop' area: AREAS, KNOWN_PATHS, sanitizePath, and the tracker's areaOf (via a start + beat on /shop).
await ok('shop area',()=>{
 assert(C.AREAS.includes('shop'));assert(C.KNOWN_PATHS.includes('/shop'));
 assert.equal(C.sanitizePath('/shop'),'/shop');assert.equal(C.sanitizePath('/shop/anything'),'/shop','sub-routes keep the top segment');
 assert.equal(C.validateEvent(JSON.stringify({v:1,t:'beat',s:'ShopAreaSession000001',p:'/shop',e:1000,a:{shop:1000}})).ok,true,'the "shop" area validates');
});

// 3. Every new learning-counter id (Kit Shop, Sandbar, Summit Isle, fruit by kind/method, beachcombing) is well-formed,
// on the fixed allowlist, and matches the SQL's counts regex (lib/analytics/countIds.ts COUNT_KEY_RE).
await ok('new count ids',()=>{
 const prefixed=[...CID.SHOP_COUNT_EVENTS.map(([e])=>'sh:'+e),...CID.SANDBAR_COUNT_EVENTS.map(([e])=>'sb:'+e),
  ...CID.SUMMIT_COUNT_EVENTS.map(([e])=>'su:'+e),...CID.FRUIT_SHAKE_IDS.map(id=>'su:'+id),...CID.BEACH_COUNT_EVENTS.map(([e])=>'bc:pickup_'+e)];
 assert(prefixed.length>0);
 for(const id of prefixed){
  assert(CID.COUNT_KEY_RE.test(id),id+' matches the counts shape');
  assert(CID.isCountId(id),id+' is on the allowlist');
  assert(CID.FIXED_COUNT_IDS.includes(id),id+' is in FIXED_COUNT_IDS');
 }
 assert.equal(new Set(CID.FIXED_COUNT_IDS).size,CID.FIXED_COUNT_IDS.length,'no duplicate fixed ids');
 assert.equal(CID.FRUIT_SHAKE_IDS.length,CID.FORAGE_FRUIT_KINDS.length*2,'hand + ball for every fruit kind');
 assert(!CID.isCountId('su:madeup'),'unknown ids are still rejected');
 assert(!CID.isCountId('sh:open_jersey:extra:segments:toomany'),'too many segments are rejected');
});

// 4. The overview's new count rows: suppressed below MIN_SESSIONS (shown as null, like every other admin number), the
// total once there are enough sessions, and every row has a human label.
await ok('overview rows',()=>{
 const counts={'sh:open_jersey':7,'sh:buy_jersey':3,'sh:spend':450,'su:kick_play':2,'su:fruit_mango:hand':9,'su:fruit_mango:ball':1,'bc:pickup_summit':4};
 const countSessions={'sh:open_jersey':6,'sh:buy_jersey':6,'sh:spend':6,'su:kick_play':2,'su:fruit_mango:hand':5,'su:fruit_mango:ball':2,'bc:pickup_summit':5};
 const merged={totals:{visitors:0,sessions:0,pageviews:0,engagedMs:0,bounceRate:0,avgMs:0,medianMs:0},hist:[],dims:{country:{},region:{},source:{},referrer:{},campaign:{},device:{},entry:{}},
  areas:[],places:[],activities:[],cells:[],counts,countSessions,flags:{},
  start:{visitors:0,sessions:0,pageviews:0,dims:{country:{},source:{},referrer:{},campaign:{},device:{}},days:0}};
 const o=OV.buildOverview({merged,rollups:[],from:'2026-10-01',to:'2026-10-07'},null);
 const shOpen=o.shop.find(r=>r.id==='sh:open_jersey'),shSpend=o.shop.find(r=>r.id==='sh:spend'),kick=o.summit.find(r=>r.id==='su:kick_play');
 assert.equal(shOpen.value,7,'6 sessions ≥ MIN_SESSIONS: the total shows');
 assert.equal(shSpend.value,450);
 assert.equal(kick.value,null,'only 2 sessions: suppressed');
 for(const r of [...o.shop,...o.sandbar,...o.summit,...o.beach])assert(r.label&&typeof r.label==='string'&&r.label.length>0,r.id+' has a label');
 const mango=o.fruit.find(f=>f.kind==='mango');assert.equal(mango.hand,9,'5 sessions: shown');assert.equal(mango.ball,null,'2 sessions: suppressed');
 assert.equal(o.fruit.length,CID.FORAGE_FRUIT_KINDS.length);
});

// 5. Summit Kick metrics (lib/arcade/kickAdminMetrics.ts): not configured without env, parses the best score + play count
// from PostgREST, a missing table degrades to "not configured", and a network failure never throws.
await ok('kick admin metrics',async()=>{
 assert.deepEqual(J(await KICK.loadSummitKickMetrics('2026-10-01','2026-10-07')),J(KICK.EMPTY_KICK_METRICS),'no env: not-configured, never throws');
 SANDBOX_ENV.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';SANDBOX_ENV.SUPABASE_SERVICE_ROLE_KEY='test-key';
 try{
  let calls=0;
  const fetchOk=async(url)=>{calls++;
   if(String(url).includes('order=score.desc'))return {ok:true,status:200,headers:new Map(),json:async()=>[{score:742}]};
   return {ok:true,status:200,headers:{get:k=>k.toLowerCase()==='content-range'?'0-0/13':null}};
  };
  const r=await KICK.loadSummitKickMetrics('2026-10-01','2026-10-07',fetchOk);
  assert.deepEqual(J(r),{status:'ok',plays:13,best:742});assert.equal(calls,2,'one read for the best score, one for the count');
  const fetch404=async()=>({ok:false,status:404,headers:new Map(),json:async()=>[]});
  assert.deepEqual(J(await KICK.loadSummitKickMetrics('2026-10-01','2026-10-07',fetch404)),J(KICK.EMPTY_KICK_METRICS),'table missing (migration not run): not-configured, no error');
  const fetchBoom=async()=>{throw new Error('network down');};
  assert.deepEqual(J(await KICK.loadSummitKickMetrics('2026-10-01','2026-10-07',fetchBoom)),{status:'error',plays:null,best:null},'never throws');
 }finally{delete SANDBOX_ENV.NEXT_PUBLIC_SUPABASE_URL;delete SANDBOX_ENV.SUPABASE_SERVICE_ROLE_KEY;}
});

// 6. Wiring: the admin dashboard mounts the new section and labels the new area; the new section names the migration in its
// empty state (so a reader who hasn't run it yet knows why); the geometry-free invariant still holds for tracker/islandIds/core.
await ok('wiring', ()=>{
 const dash=read('app/admin/AnalyticsDashboard.tsx');
 assert(/SummitKitSection/.test(dash),'the dashboard mounts the new section');
 assert(/shop:\s*'Kit Shop'/.test(dash),'the area label names the Kit Shop');
 const section=read('app/admin/SummitKitSection.tsx');
 for(const word of ['Kit Shop','Sandbar','Summit Isle'])assert(section.includes(word),'the section labels '+word);
 assert(/20261015_analytics_summit_kit\.sql/.test(section),'the empty state names the migration to run');
 assert(!/^import[^\n]*(islandPlaces|lib\/town|\.\.\/town)/m.test(read('lib/analytics/tracker.ts')+read('lib/analytics/islandIds.ts')+read('lib/analytics/core.ts')),
  'tracker/core/islandIds still never import the island geometry (islandPlaces.ts and summitEvents.ts are the exception, loaded only with the island)');
 // One-line call sites exist where the design calls for them (no per-frame tracking: each is inside a discrete action, not a loop).
 assert(/countStudioOpen\(/.test(read('components/shop/ShopRoom.tsx'))&&/countMyKitOpen\(/.test(read('components/shop/ShopRoom.tsx'))&&/countPurchase\(/.test(read('components/shop/ShopRoom.tsx')));
 for(const [f,fn] of [['components/shop/JerseyStudio.tsx','jersey'],['components/shop/BootStudio.tsx','boots'],['components/shop/BallStudio.tsx','ball']])
  assert(read(f).includes(`countDesignSave('${fn}')`),f+' marks a design saved');
 assert(/countKioskPurchase\(/.test(read('components/VendingMachine.tsx')),'the summit snack kiosk');
 assert(/countKioskPurchase\(/.test(read('components/DrinkMachine.tsx')),'the summit drink machine beside it');
 // The telescope (su:scope_open, su:glint_spot, su:glint_collect) was removed on Oct 14 2026; the zipline counts its rides.
 assert(/countKickPlay\(\)/.test(read('lib/graphics/summitActivities.ts'))&&!/countScopeOpen|countGlint/.test(read('lib/analytics/summitEvents.ts')));
 assert(/countZiplineRide\(\)/.test(read('lib/graphics/zipline.ts')),'the zipline: one ride counted at the launch');
 assert(/countFruitShake\(/.test(read('lib/graphics/fruitTrees.ts')));
 assert(/countSummitFishCatch\(/.test(read('lib/town/fishing/fishingSession.ts')));
 assert(/count\('bc:pickup_'/.test(read('lib/town/beachcombing.ts')),'beachcombing: exactly one tracking call added');
 assert(/summitTravel\.sample\(/.test(read('components/Town.tsx')),'Town.tsx: the Sandbar/Summit arrival hook sits beside islandFrame()');
 for(const f of ['app/admin/page.tsx','app/api/admin/analytics/route.ts'])assert(read(f).includes('loadSummitKickMetrics'),f+' reads Summit Kick metrics too');
});

console.log(`admin-analytics-summit-kit: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
