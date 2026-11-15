// Fishing "come back tomorrow" (Nov 14 2026, docs/fishing.md "Come back tomorrow"): fish of the day (double coins inside the soft
// cap), the sea's condition (value-guarded family mix), the weekly visitor, ten new Fishbook sets with floats, personal bests, the
// small synced save, the analytics counters and the admin card. Pure checks: no browser.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const cache=new Map();
const ctx=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,Intl,structuredClone,queueMicrotask,Float32Array,Float64Array,Uint8Array,Uint16Array,Int32Array});
function load(name){const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',ctx)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,g)=>g()}:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):id.startsWith('@/')?load(id.slice(2)+'.ts'):require(id));
 cache.set(file,mod.exports);return mod.exports;}
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++;};
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const cat=load('lib/town/fishing/fishCatalog.ts'),C=load('lib/town/fishing/comeback.ts'),D=load('lib/town/fishing/fishDaily.ts'),K=load('lib/town/fishing/fishConditions.ts');
const O=load('lib/town/fishing/fishingOdds.ts'),H=load('lib/town/fishing/fishingHooks.ts'),LOG=load('lib/town/fishing/fishingLog.ts'),M=load('lib/town/market/market.ts'),G=load('lib/town/market/goods.ts');
const {LURES}=load('lib/town/fishing/lures.ts'),{MARKET}=load('lib/economy.ts');
const {FISH,FISH_SPOTS,SHORE_SPOTS,fishById}=cat;
const days=Array.from({length:60},(_,i)=>{const d=new Date(2026,10,1+i,12);return D.localDay(d);});

// ---- 1. Fish of the day
{ok(C.FOTD_POOL.length>=50,`a wide pool (${C.FOTD_POOL.length})`);
 for(const f of C.FOTD_POOL){ok(f.rarity!=='legendary'&&!f.when,`${f.id}: not legendary, any time`);ok(SHORE_SPOTS.some(s=>f.id in s.weights),`${f.id}: reachable from the shore`);}
 const picks=days.map(d=>C.fishOfTheDay(d).id);ok(new Set(picks).size>=25,`varies day to day (${new Set(picks).size} in 60 days)`);
 ok(days.every((d,i)=>C.fishOfTheDay(d).id===picks[i]),'deterministic from the date');
 ok(C.fishOfTheDay(new Date(2026,10,14,1)).id===C.fishOfTheDay(new Date(2026,10,14,23)).id,'the same all local day');
 ok(C.fishOfTheDay(new Date(2026,10,14,9).getTime()).id===C.fishOfTheDay('2026-11-14').id,'timestamp, Date and day string agree');
 ok(!C.isFishOfTheDay(picks[0],'')&&!C.isFishOfTheDay(picks[0],undefined),'no day = no fish of the day (sims stay neutral)');
 ok(C.FOTD_MULT===2,'double coins');}

// ---- 2. Double pay inside the shared soft cap (market.ts)
{ok(MARKET.allowance===30,'the real daily soft cap is 30 coins');
 const day='2026-11-14',f=C.fishOfTheDay(day),g=G.goodById(f.id);ok(g&&g.kind==='fish','the fish of the day is a market good');
 const fresh={...M.emptyMarket(day),basket:{[f.id]:1}},plain={...M.emptyMarket(''),basket:{[f.id]:1}};
 ok(M.nextUnitValue(fresh,g)===2*M.nextUnitValue(plain,g),'pays double on its day');
 const other=G.FISH_GOODS.find(x=>x.id!==f.id);ok(M.nextUnitValue({...M.emptyMarket(day)},other)===M.nextUnitValue(M.emptyMarket(''),other),'other fish pay the usual price');
 const capped={...M.emptyMarket(day),soldToday:MARKET.allowance,basket:{[f.id]:1}};ok(M.nextUnitValue(capped,g)===M.nextUnitValue(fresh,g)*MARKET.halfFactor,'past the cap it is halved like everything else');
 const q=M.quoteSale({...M.emptyMarket(day),basket:{[f.id]:20}});const qp=M.quoteSale({...M.emptyMarket(''),basket:{[f.id]:20}});
 ok(q.coins<=2*qp.coins&&q.halfPrice,'a basket of them still runs into the shared allowance');
 ok(/fotdFactor\(s\.day,g\)/.test(read('lib/town/market/marketStand.ts')),'the stand shows the doubled price');
 ok(/data-market-fotd/.test(read('components/MarketStand.tsx'))&&/data-fishbook-fotd/.test(read('components/FishbookExtras.tsx')),'shown at the stand and in the Fishbook');
 ok(!/fishingHooks|comeback'/.test(read('lib/town/market/market.ts')),'the market reads fishDaily only, never the hooks');}

// ---- 3. Conditions: deterministic, every 3 hours, value-guarded, rarity shares fixed
{ok(K.CONDITIONS.length>=5,'several conditions');const seen=new Set();
 for(const d of days.slice(0,14))for(let h=0;h<24;h++){const c=K.conditionFor(d,h);seen.add(c.id);if(h%3)ok(c.id===K.conditionFor(d,h-1).id,'one condition per 3-hour block');}
 ok(seen.size===K.CONDITIONS.length,'every condition comes up');
 for(const c of K.CONDITIONS){ok(c.line.length<70&&!/\d+ ?%|chance|odds/i.test(c.line),`${c.id}: a plain line, no numbers`);ok(c.mood.clear>=.8&&c.mood.clear<=1.1,`${c.id}: a light water hint`);}
 const share=(w,r)=>{let t=0,x=0;for(const [id,v] of Object.entries(w)){t+=v;if(fishById(id)?.rarity===r)x+=v;}return x/t;};
 for(const s of FISH_SPOTS){const base=O.catchWeights(s,0,O.NEUTRAL_CONTEXT),p0=O.meanSellValue(base);
  for(const c of K.CONDITIONS)for(const lure of [null,...LURES.map(l=>l.id)]){const w=O.catchWeights(s,0,{time:'day',lure,legends:[],condition:c.id});
   ok(Math.abs(O.meanSellValue(w)-p0)<=p0*.03+1e-9,`${s.id} ${c.id} ${lure}: mean catch value within ±3 %`);
   for(const r of ['common','uncommon','rare','legendary'])ok(Math.abs(share(w,r)-share(base,r))<1e-9,`${s.id} ${c.id}: ${r} share unchanged`);}}
 const s=FISH_SPOTS.find(x=>x.id==='harbour-wall'),mist=O.catchWeights(s,0,{time:'day',lure:null,legends:[],condition:'mist'}),b=s.weights;
 const fav=Object.keys(b).filter(id=>K.conditionById('mist').favors(fishById(id)));if(fav.length)ok(fav.some(id=>mist[id]/b[id]>1.05),'mist brings its families closer');
 ok(/data-fishing-condition/.test(read('components/FishingHost.tsx')),'the HUD shows the condition in words');
 ok(/conditionAt\(now\)\.mood/.test(read('lib/town/fishing/waterMood.ts')),'a light water tint, once a session');}

// ---- 4. Weekly visitor
{ok(D.isoWeek(new Date(2026,0,1,12))==='2026-W01'&&D.isoWeek(new Date(2024,11,30,12))==='2025-W01'&&D.isoWeek(new Date(2026,10,14,12))==='2026-W46','ISO weeks');
 ok(D.isoWeek(new Date(2026,10,16,9))===D.isoWeek(new Date(2026,10,22,20)),'Monday to Sunday is one week');
 const weeks=[...new Set(days.map(d=>D.isoWeek(d)))];
 for(const wk of weeks){const v=C.weeklyVisitorFor(wk);ok(v.fish.rarity==='rare'||v.fish.rarity==='legendary','Rare or Legendary');ok(!v.fish.when,'any time of day');
  const spot=FISH_SPOTS.find(s=>s.id===v.spot);ok(spot&&!spot.boat&&v.fish.id in spot.weights,`${wk}: at a shore spot it lives at (${v.spot})`);ok(v.spotName&&v.spotName!==v.spot,'a named spot');
  const base=spot.weights,w=O.catchWeights(spot,0,{time:'day',lure:null,legends:[],visitor:{id:v.fish.id,spot:v.spot}}),p0=O.meanSellValue(base);
  ok(w[v.fish.id]/Object.values(w).reduce((a,x)=>a+x,0)>=base[v.fish.id]/Object.values(base).reduce((a,x)=>a+x,0),`${wk}: it comes a little more often there`);
  ok(Math.abs(O.meanSellValue(w)-p0)<=p0*.03+1e-9,`${wk}: value-guarded`);
  const elsewhere=FISH_SPOTS.find(s=>s.id!==v.spot);ok(O.catchWeights(elsewhere,0,{time:'day',lure:null,legends:[],visitor:{id:v.fish.id,spot:v.spot}})===elsewhere.weights,'no change at any other spot');}
 ok(C.VISITOR_BOOST===O.FAMILY_BOOST.visitor,'one boost value');
 ok(O.catchWeights(FISH_SPOTS[0],0,O.NEUTRAL_CONTEXT)===FISH_SPOTS[0].weights,'the neutral context is untouched');}

// ---- 5. Sets: ten new sets of 5-8 with their own float; helpers
{const added=H.FISH_SETS.filter(s=>/^(club-|theme-(reef-sharks|rays-eels|squid|oddballs|cups|crests))/.test(s.id));ok(added.length===10,'ten new sets');
 for(const s of added){ok(s.species.length>=5&&s.species.length<=8,`${s.id}: 5-8 animals (${s.species.length})`);ok(s.species.every(id=>FISH.some(f=>f.id===id)),`${s.id}: Fishbook species`);
  ok(s.float&&s.float in LOG.FLOAT_SKINS,`${s.id}: a real float`);}
 ok(LOG.sanitizeLog({floats:Object.keys(LOG.FLOAT_SKINS)}).floats.length===Object.keys(LOG.FLOAT_SKINS).length,'the log keeps every float');
 const set=added[0],book={species:Object.fromEntries(set.species.slice(0,-1).map(id=>[id,{count:1,biggest:10}]))};
 const p=C.setsProgress({book}).find(x=>x.set.id===set.id);ok(p.got===set.species.length-1&&p.left===1&&!p.done,'progress per set');
 ok(C.nearlyDoneSets({book}).some(x=>x.set.id===set.id),'nearly done sets');ok(C.setProgress===C.setsProgress,'setProgress(save) alias');
 ok(!C.nearlyDoneSets({book,claimed:[set.id]}).some(x=>x.set.id===set.id),'claimed sets are done');}

// ---- 6. Personal bests and the save
{ok(C.newRecord(20,21)&&!C.newRecord(0,21)&&!C.newRecord(21,21),'a record beats an earlier best');
 const now=new Date(2026,10,14,10).getTime(),f=C.fishOfTheDay(now),v=C.weeklyVisitor(now);
 let r=C.comebackCatch(C.emptyComeback(),{id:f.id,spot:'south-pier',size:10,now,prevBest:9});ok(r.effects.fotd&&r.effects.fotdFirstToday&&r.effects.record,'fish of the day + record');
 r=C.comebackCatch(r.save,{id:f.id,spot:'south-pier',size:10,now});ok(r.effects.fotd&&!r.effects.fotdFirstToday&&r.save.fotdDays===1,'counted once a day');
 r=C.comebackCatch(r.save,{id:v.fish.id,spot:v.spot,size:50,now});ok(r.effects.visitor&&r.save.visitorWeeks===1,'the visitor at its spot');
 ok(!C.comebackCatch(r.save,{id:v.fish.id,spot:v.spot,size:50,now}).effects.visitor,'once a week');
 const other=FISH_SPOTS.find(s=>s.id!==v.spot).id;ok(!C.comebackCatch(C.emptyComeback(),{id:v.fish.id,spot:other,size:50,now}).effects.visitor,'only at its named spot');
 const bad=C.sanitizeComeback({fotdDay:'x',fotdDays:-4,visitorWeek:'2026-W46',visitorWeeks:1e9,extra:'y'});ok(bad.fotdDay===''&&bad.fotdDays===0&&bad.visitorWeek==='2026-W46'&&bad.visitorWeeks===1e5&&!('extra' in bad),'sanitised');
 const m=C.mergeComeback({version:1,fotdDay:'2026-11-13',fotdDays:3,visitorWeek:'',visitorWeeks:0},{version:1,fotdDay:'2026-11-14',fotdDays:2,visitorWeek:'2026-W46',visitorWeeks:1});
 ok(m.fotdDay==='2026-11-14'&&m.fotdDays===3&&m.visitorWeeks===1,'merge keeps the later day and the larger totals');
 ok(JSON.stringify({...r.save,fotdDay:'2026-11-14',visitorWeek:'2026-W46',fotdDays:99999,visitorWeeks:99999}).length<160,'tiny save');
 const snap=load('lib/saves/snapshot.ts');ok(snap.SYNC_KEYS.includes(C.COMEBACK_KEY),'the save is synced');ok(read('docs/accounts-design.md').includes(C.COMEBACK_KEY),'documented in accounts-design');
 ok(/prevBest/.test(read('lib/town/fishing/fishingStore.ts'))&&/data-fish-record/.test(read('components/FishingHost.tsx'))&&/data-trophy-record/.test(read('components/FishingTrophy.tsx')),'New record! on the catch card and the trophy card');
 ok(/data-fish-best/.test(read('components/Fishbook.tsx')),'the best size in the Fishbook');}

// ---- 7. Analytics + admin, phone trophy fix, docs
{const CID=load('lib/analytics/countIds.ts');for(const id of ['fotd_catch','set_done','new_record','visitor_week'])ok(CID.isCountId('fi:'+id)&&CID.FIXED_COUNT_IDS.includes('fi:'+id),'registered fi:'+id);
 ok(/'fi:fotd_catch','fi:set_done','fi:new_record','fi:visitor_week'/.test(read('app/admin/FishingSection.tsx')),'the admin Fishing tab shows them');
 ok(/countSetDone/.test(read('lib/town/fishing/fishingHooksStore.ts'))&&/countFotdCatch/.test(read('lib/town/fishing/comebackStore.ts')),'counted where they happen');
 ok(/\.status:empty\{margin:0\}/.test(read('components/FishingTrophy.module.css'))&&!/min-height:1\.3em/.test(read('components/FishingTrophy.module.css')),'no empty band under the trophy buttons');
 const doc=read('docs/fishing.md');ok(/## Come back tomorrow/.test(doc)&&!/40-coin daily soft cap/.test(doc)&&!/which is 40 coins/.test(doc),'documented, cap wording fixed');}
console.log(`PASS fishing-comeback (${n} checks): fish of the day ×2 inside the 30-coin cap, conditions value-guarded, weekly visitor, 10 new sets, records, save, counters`);
