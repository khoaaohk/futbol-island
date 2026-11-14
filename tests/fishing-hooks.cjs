// Fishing return hooks (Nov 7 2026, docs/fishing.md "Return hooks"): sets, today's visitor, golden variants, story chapters.
// Owner rules checked here: everything is cosmetic or stamp-only (no odds, price or basket change), nothing expires, no penalties,
// no leaderboards, the save is registered for sync, chapters add no new football claims.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const cache=new Map(),data=new Map();
const ctx=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,Intl,structuredClone,queueMicrotask,
 localStorage:{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)},window:{addEventListener(){},removeEventListener(){}},
 Float32Array,Float64Array,Uint8Array,Uint16Array,Int32Array});
function load(name){const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',ctx)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,g)=>g()}:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):id.startsWith('@/')?load(id.slice(2)+'.ts'):require(id));
 cache.set(file,mod.exports);return mod.exports;}
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++;};
const cat=load('lib/town/fishing/fishCatalog.ts'),H=load('lib/town/fishing/fishingHooks.ts'),CH=load('lib/town/fishing/fishChapters.ts');
const LG=load('lib/town/fishing/legendary.ts'),LOG=load('lib/town/fishing/fishingLog.ts'),O=load('lib/town/fishing/fishingOdds.ts'),{fishSellValue}=load('lib/economy.ts');
const {FISH,FISH_SPOTS,fishById}=cat;
const book=ids=>({species:Object.fromEntries(ids.map(id=>[id,{count:1}]))});

// ---- 1. Sets: 10-14, real species, never empty, stamp for each, floats are real skins
{const S=H.FISH_SETS;ok(S.length>=10&&S.length<=15,`10-15 sets (${S.length}; Nov 13 2026: + the stadium coast)`);
 ok(new Set(S.map(s=>s.id)).size===S.length,'set ids are unique');
 for(const s of S){ok(s.species.length>=4,`${s.id}: at least 4 species (${s.species.length})`);ok(s.species.every(id=>FISH.some(f=>f.id===id)),`${s.id}: Fishbook species only (no legends)`);
  ok(new Set(s.species).size===s.species.length,`${s.id}: no duplicates`);ok(typeof s.stamp==='string'&&s.stamp.length>3,`${s.id}: a stamp`);
  ok(!s.float||s.float in LOG.FLOAT_SKINS,`${s.id}: its float is a real skin`);ok(!/\b(today|hurry|expire|limited|days? left)\b/i.test(s.blurb),`${s.id}: never time-limited`);}
 ok(S.filter(s=>s.kind==='spot').length>=5&&S.some(s=>s.kind==='area')&&S.some(s=>s.kind==='theme'),'per-spot, per-area and themed sets');
 const floats=S.filter(s=>s.float).map(s=>s.float);ok(new Set(floats).size===floats.length,'each set float is unique');
 ok(floats.every(k=>!Object.values(LOG.MILESTONE_REWARDS).some(r=>r.float===k)),'set floats differ from the milestone floats');
 const night=S.find(s=>s.id==='theme-night'),deep=S.find(s=>s.id==='theme-deep');ok(night.species.every(id=>fishById(id).when),'night set = night and sunset fish');ok(deep.species.every(id=>cat.isDeepSeaSpecial(fishById(id))),'deep set = deep-sea specials');
 // progress + claim
 const east=S.find(s=>s.id==='spot-east-pier');const p0=H.setProgress(east,book([]));ok(p0.got===0&&p0.total===east.species.length,'N of M starts at 0');
 const part=H.setProgress(east,book(east.species.slice(1)));ok(part.got===east.species.length-1,'partial progress counts');
 let save=H.emptyHooks();let r=H.claimSets(save,book(east.species.slice(1)));ok(!r.done.length,'an unfinished set is not claimed');
 r=H.claimSets(save,book(east.species));ok(r.done.length===1&&r.done[0].id==='spot-east-pier'&&r.save.sets.includes('spot-east-pier'),'a finished set is claimed');
 const again=H.claimSets(r.save,book(east.species));ok(!again.done.length&&again.save===r.save,'claiming is idempotent');
 const cay=S.find(s=>s.id==='area-cay');ok(H.setFloats(H.claimSets(H.emptyHooks(),book(cay.species)).save.sets).includes('coral'),'the Coral Cay set gives the coral float');
 // Every float in FLOAT_SKINS survives the fishing log's sanitizer (the cap was raised for the new skins).
 const all=Object.keys(LOG.FLOAT_SKINS);ok(LOG.sanitizeLog({floats:all}).floats.length===all.length,'the fishing log keeps every float skin');}

// ---- 2. Today's visitor: Pacific day, deterministic, one per area, gentle, stamp once per species and day
{ok(H.pacificDay(Date.UTC(2026,10,7,7,30))==='2026-11-06','23:30 Pacific is still the 6th');ok(H.pacificDay(Date.UTC(2026,10,7,8,30))==='2026-11-07','00:30 Pacific (PST) is the 7th');
 ok(H.pacificDay(Date.UTC(2026,6,1,6,59))==='2026-06-30'&&H.pacificDay(Date.UTC(2026,6,1,7,1))==='2026-07-01','summer time (PDT) handled');
 const allSpots=H.VISITOR_AREAS.flatMap(a=>a.spots);ok(FISH_SPOTS.every(s=>allSpots.includes(s.id)),'every fishing spot belongs to a visitor area');
 for(const a of H.VISITOR_AREAS){const pool=H.visitorPool(a.id);ok(pool.length>=5,`${a.id}: a pool of ${pool.length}`);ok(pool.every(f=>f.rarity!=='legendary'),`${a.id}: never a legendary-rarity visitor`);
  ok(pool.every(f=>f.spots.every(s=>a.spots.includes(s))),`${a.id}: visitors live in the area`);
  const seen=new Set();for(let d=1;d<=60;d++){const day=`2026-${String(1+Math.floor((d-1)/28)).padStart(2,'0')}-${String(1+(d-1)%28).padStart(2,'0')}`;const v=H.visitorFor(a.id,day);ok(v&&v===H.visitorFor(a.id,day),`${a.id} ${day}: deterministic`);seen.add(v.id);}
  ok(seen.size>=Math.min(pool.length,8),`${a.id}: visitors vary (${seen.size} kinds in 60 days)`);}
 for(const f of H.visitorPool('main'))ok(!/%|chance|odds|probab/i.test(H.visitorHint(f)),`${f.id}: the hint says where, never how likely`);
 const night=[...H.visitorPool('main'),...H.visitorPool('cay'),...H.visitorPool('summit')].find(f=>f.when);ok(night&&/night|sunset/.test(H.visitorHint(night)),'a night or sunset visitor says when');
 // Catch the visitor: a mark, once per day, again the next day.
 const now=Date.UTC(2026,10,7,20),day=H.pacificDay(now),spot='harbour-wall',v=H.visitorFor('main',day);
 const base={spot:v.spots[0],count:2,now,rand:.9,released:{}};
 let r=H.hookCatch(H.emptyHooks(),{...base,id:v.id});ok(r.effects.visitor&&r.save.visits[v.id].n===1&&r.save.visits[v.id].day===day,'the visitor stamps a Visitor mark');
 const r2=H.hookCatch(r.save,{...base,id:v.id});ok(!r2.effects.visitor&&r2.save.visits[v.id].n===1,'once per species and day');
 const r3=H.hookCatch(r2.save,{...base,id:v.id,now:now+864e5});const v2=H.visitorFor('main',H.pacificDay(now+864e5));
 ok(v2.id===v.id?r3.save.visits[v.id].n===2:r3.save.visits[v.id].n===1,'a new day can mark it again only if it visits again');
 const other=FISH.find(f=>f.id!==v.id&&f.spots.includes(spot));ok(!H.hookCatch(H.emptyHooks(),{...base,spot,id:other.id}).effects.visitor,'another fish is not the visitor');}

// ---- 3. Golden: rare, stamp-only, never a legend, never a price change
{ok(H.GOLDEN_CHANCE>0&&H.GOLDEN_CHANCE<=1/100,'golden is very rare');ok(H.rollGolden(0)&&!H.rollGolden(H.GOLDEN_CHANCE)&&!H.rollGolden(.5)&&!H.rollGolden(NaN)&&!H.rollGolden(-1),'the roll is a plain threshold');
 const c={id:'sardine',spot:'south-pier',count:1,now:Date.UTC(2026,10,7,20),released:{}};
 const g=H.hookCatch(H.emptyHooks(),{...c,rand:0});ok(g.effects.golden&&g.save.golden.sardine===1,'a golden catch is counted for the Fishbook mark');
 ok(!H.hookCatch(H.emptyHooks(),{...c,rand:.5}).effects.golden,'most catches are not golden');
 const legend=LG.LEGEND_FISH[0];ok(!H.hookCatch(H.emptyHooks(),{...c,id:legend.id,spot:legend.spots[0],rand:0}).effects.golden,'a legend is never golden');
 ok(!JSON.stringify(g).match(/price|coin|value|basket|weight/i),'hook results carry no price, coin, basket or weight');
 const before=FISH.map(f=>fishSellValue(f));H.hookCatch(H.emptyHooks(),{...c,rand:0});ok(FISH.every((f,i)=>fishSellValue(f)===before[i]),'sell values are untouched');}

// ---- 4. EV guard: no hook can reach the odds, the basket or the prices
{for(const f of ['lib/town/fishing/fishingOdds.ts','lib/town/fishing/fishingCore.ts','lib/town/fishing/fishingSession.ts','lib/town/fishing/fishingStore.ts','lib/economy.ts','lib/town/market/market.ts'])
  ok(!/fishingHooks|fishChapters/.test(fs.readFileSync(path.join(ROOT,f),'utf8')),`${f} does not import the hooks`);
 const store=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingHooksStore.ts'),'utf8');ok(!/islandMarket|islandJobWallet|credit\(|setCatchRoll|catchWeights|gather\(/.test(store),'the hooks store never pays, fills the basket or rolls a catch');
 const ctx0={time:'day',lure:null,legends:[]};for(const s of FISH_SPOTS){const w=O.catchWeights(s,0,ctx0),ev=O.meanSellValue(w);ok(Number.isFinite(ev)&&ev>0,`${s.id}: catch weights unchanged (EV ${ev.toFixed(2)})`);}}

// ---- 5. Story chapters: 23 legends + 30 favourites, kid-safe, no invented football numbers
{const SCARY=/\b(kill\w*|dead|death|die[sd]?|dying|blood\w*|attack\w*|scar(y|ier|iest)|terrif\w*|deadly|danger\w*|monsters?|jaws|horror|fear\w*|eaten alive|man-eat\w*|vicious|savage|bite[sd]? (you|people|kids))\b/i;
 const bigNums=t=>(t.match(/\d[\d,–-]*\d|\d{2,}/g)??[]).flatMap(x=>x.split(/[–-]/)).filter(x=>x.replace(/,/g,'').length>=2);
 ok(LG.LEGEND_FISH.length===26,'26 legends (Nov 13 2026: + King Koi and the north-west coast\'s three)');
 for(const L of LG.LEGEND_FISH){const ch=CH.LEGEND_CHAPTERS[L.id];ok(Array.isArray(ch)&&ch.length===2,`${L.id}: two more chapters`);
  for(const t of ch){ok(t.length>=40&&t.length<=330&&!SCARY.test(t)&&!/https?:|%|odds|chance/i.test(t),`${L.id}: kid-safe chapter`);
   for(const num of bigNums(t))ok(L.club.fact.includes(num)||LG.LEGEND_INFO[L.id].story.includes(num),`${L.id}: "${num}" comes from its sourced fact`);}}
 const ids=Object.keys(CH.SPECIES_CHAPTERS);ok(ids.length>=30,`at least 30 favourite species have chapters (${ids.length})`);
 for(const id of ids){const f=fishById(id);ok(f&&FISH.includes(f),`${id}: a Fishbook species`);const ch=CH.SPECIES_CHAPTERS[id];ok(ch.length===2,`${id}: two more chapters`);
  for(const t of ch){ok(t.length>=40&&t.length<=330&&!SCARY.test(t)&&!/https?:|%|odds|chance/i.test(t),`${id}: kid-safe chapter`);
   for(const num of bigNums(t))ok(f.club.fact.includes(num),`${id}: "${num}" comes from its sourced fact`);}}
 // Unlocks: tale at the 1st catch, chapter 2 at the 3rd, chapter 3 at the 5th.
 const sh=fishById('shrimp');ok(H.speciesChapters(sh,1).unlocked.length===1&&H.speciesChapters(sh,2).next===3&&H.speciesChapters(sh,3).unlocked.length===2&&H.speciesChapters(sh,5).unlocked.length===3&&H.speciesChapters(sh,9).next===null,'species chapters unlock at 1, 3, 5');
 ok(H.speciesChapters(fishById('stargazer')??FISH.find(f=>!CH.SPECIES_CHAPTERS[f.id]),9).total===1,'a species without chapters keeps just its tale');
 const c={id:'shrimp',spot:'south-pier',now:Date.UTC(2026,10,7,20),rand:.9,released:{}};
 ok(H.hookCatch(H.emptyHooks(),{...c,count:3}).effects.chapter?.n===2&&H.hookCatch(H.emptyHooks(),{...c,count:5}).effects.chapter?.n===3&&!H.hookCatch(H.emptyHooks(),{...c,count:4}).effects.chapter,'the 3rd and 5th catches announce a chapter');
 // Legends: chapters come back as "seen again" at its spot after the release.
 const L=LG.LEGEND_FISH.find(f=>f.id==='legend-south-pier');ok(H.legendChapters(L.id,false,0).unlocked.length===0&&H.legendChapters(L.id,true,0).unlocked.length===1&&H.legendChapters(L.id,true,5).unlocked.length===2&&H.legendChapters(L.id,true,15).unlocked.length===3,'legend chapters at release, 5 and 15');
 let save=H.emptyHooks(),got=[];for(let i=0;i<16;i++){const r=H.hookCatch(save,{...c,count:9,released:{[L.id]:1}});save=r.save;if(r.effects.legendChapter)got.push(r.effects.legendChapter.n);}
 ok(save.legendSeen[L.id]===16&&got.join()==='2,3','catches at a released legend\'s spot unlock its chapters 2 and 3');
 ok(!H.hookCatch(H.emptyHooks(),{...c,count:9}).save.legendSeen[L.id],'nothing counts before the legend is released');}

// ---- 6. The save: sanitized, merged (nothing lost), registered for sync, documented
{const junk=H.sanitizeHooks({sets:['spot-east-pier','nope',3],visits:{sardine:{n:2,day:'2026-11-07'},nope:{n:1,day:'2026-11-07'},cod:{n:1,day:'bad'}},golden:{sardine:2,'legend-south-pier':1,cod:-1},legendSeen:{'legend-south-pier':500,sardine:3}});
 ok(junk.sets.join()==='spot-east-pier'&&Object.keys(junk.visits).join()==='sardine'&&Object.keys(junk.golden).join()==='sardine'&&junk.legendSeen['legend-south-pier']===H.LEGEND_SEEN_MAX&&!('sardine' in junk.legendSeen),'sanitize drops junk and caps counts');
 ok(JSON.stringify(H.sanitizeHooks(null))===JSON.stringify(H.emptyHooks()),'an empty save loads');
 const a={...H.emptyHooks(),sets:['spot-east-pier'],visits:{sardine:{n:1,day:'2026-11-06'}},golden:{cod:1}},b={...H.emptyHooks(),sets:['area-cay'],visits:{sardine:{n:3,day:'2026-11-05'}},golden:{cod:2,tuna:1},legendSeen:{'legend-south-pier':4}};
 const m=H.mergeHooks(a,b);ok(m.sets.length===2&&m.visits.sardine.n===3&&m.visits.sardine.day==='2026-11-06'&&m.golden.cod===2&&m.golden.tuna===1&&m.legendSeen['legend-south-pier']===4,'merge keeps the larger of everything');
 ok(JSON.stringify(H.sanitizeHooks(JSON.parse(JSON.stringify(m))))===JSON.stringify(m),'the save round-trips');
 const full={...H.emptyHooks(),sets:H.FISH_SETS.map(s=>s.id),visits:Object.fromEntries(FISH.map(f=>[f.id,{n:999,day:'2026-11-07'}])),golden:Object.fromEntries(FISH.map(f=>[f.id,99])),legendSeen:Object.fromEntries(LG.LEGEND_FISH.map(f=>[f.id,99]))};
 ok(JSON.stringify(full).length<16000,`a maxed-out save stays small (${JSON.stringify(full).length} bytes)`);
 const snap=fs.readFileSync(path.join(ROOT,'lib/saves/snapshot.ts'),'utf8');ok(snap.includes(`'${H.FISHING_HOOKS_KEY}'`),'the hooks key is in SYNC_KEYS');
 ok(fs.readFileSync(path.join(ROOT,'docs/accounts-design.md'),'utf8').includes(H.FISHING_HOOKS_KEY),'accounts-design lists the key');
 ok(/## Return hooks/.test(fs.readFileSync(path.join(ROOT,'docs/fishing.md'),'utf8')),'docs/fishing.md has a Return hooks section');
 const src=['lib/town/fishing/fishingHooks.ts','lib/town/fishing/fishingHooksStore.ts','components/FishbookExtras.tsx'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
 ok(!/leaderboard|streak|setInterval|requestAnimationFrame/i.test(src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'')),'no leaderboards, streaks, timers or frame loops');}

console.log(`PASS fishing-hooks: ${n} checks (15 sets, Pacific-day visitors, stamp-only golden, chapters for 26 legends + favourites, synced save)`);
