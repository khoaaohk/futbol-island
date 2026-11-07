// Fishing audit fixes (Nov 6 2026, docs/fishing.md "Audit fixes, 6 Nov 2026"): the reel reads Wait… and ignores taps while a fish
// comes in / nibbles (1); a hooked fish lost by not spinning says "Keep spinning!" and Cast after a catch waits out the read time
// without restarting it (2); the Summit headlands have real tables and legends stay out of the Fishbook total (3); the catch card's
// coins come from the market rules (5); the late-miss help and the Easy bite setting, with sharks still harder than commons (7).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..'),src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const data=new Map(),cache=new Map();
const context=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,structuredClone,queueMicrotask,
 localStorage:{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)},
 window:{addEventListener(){},removeEventListener(){}},Float32Array,Float64Array,Uint8Array,Uint16Array,Int32Array});
const stubs=new Map([['lib/town/jobs/islandWallet.ts',{islandMarket:{gather:()=>1}}],['lib/town/exploreSignals.ts',{signalExplore(){}}],['lib/analytics/summitEvents.ts',{countSummitFishCatch(){}}]].map(([k,v])=>[path.resolve(ROOT,k),v]));
function load(name){const file=path.resolve(ROOT,name);if(stubs.has(file))return stubs.get(file);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id));
 cache.set(file,mod.exports);return mod.exports;}
const lcg=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const cat=load('lib/town/fishing/fishCatalog.ts'),core=load('lib/town/fishing/fishingCore.ts'),sessMod=load('lib/town/fishing/fishingSession.ts'),FF=load('lib/town/fishing/fishingFight.ts');
const straight=(r,f)=>{const pts=[];for(let i=0;i<=8;i++)pts.push({x:3-(3-cat.SHADOW_LENGTH[f.shadow]*.5-.05)*i/8,z:0});return {points:pts,circles:false,angle:0};};
const spawn={approach:straight,out:{x:1,z:0}},spot=cat.spotById('west-cove');
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
const mkApi=()=>{const events=[];const api=sessMod.createFishingSession(()=>({isNew:true,isBiggest:false,inBasket:true}));api.onFishingEvent(e=>events.push(e));api.begin(spot.id);return {api,events};};
const stepUntil=(api,r,pred,max=6000,dt=1/30)=>{let k=0;while(!pred(api.session)&&k++<max)api.handle(core.stepSession(api.session,spot,dt,r,{...spawn,easy:api.easyBite}));return pred(api.session);};
const land=(api,r)=>{let k=0;while(api.session.phase==='reeling'&&k++<30*90){const f=api.session.fight;if(f){if(FF.running(f)||f.tension>.85)api.hold(false);else if(f.tension<.5)api.hold(true);}api.handle(core.stepSession(api.session,spot,1/30,r,spawn));}api.hold(false);};

// ---- 1. Wait… is honest ----
{const {api,events}=mkApi(),r=lcg(3);api.tap();ok(api.session.phase==='casting','cast');
 stepUntil(api,r,s=>s.phase==='floating');api.tap();ok(api.session.phase==='ready','floating: the tap reels the line in (the button reads Reel in)');
 api.tap();stepUntil(api,r,s=>s.phase==='approach');const nEsc=()=>events.filter(e=>e.type==='escape').length;
 for(let i=0;i<5;i++)api.tap();ok(api.session.phase==='approach'&&nEsc()===0,'approach: taps are ignored, no scare');
 stepUntil(api,r,s=>s.phase==='nibble');for(let i=0;i<5;i++){api.tap();api.handle(core.stepSession(api.session,spot,.05,r,spawn));}
 ok(['nibble','bite'].includes(api.session.phase)&&nEsc()===0,'nibble: taps are ignored, no scare, no lesson penalty');
 stepUntil(api,r,s=>s.phase==='bite');api.tap();ok(api.session.phase==='reeling','bite: Hook! hooks');
 const host=src('components/FishingHost.tsx');
 ok(/floating:'Reel in',approach:'Wait…',nibble:'Wait…',bite:'Hook!'/.test(host),'labels: Reel in / Wait… / Hook!');
 ok(/const waiting=[^;]*view\.phase==='approach'\|\|view\.phase==='nibble'\|\|view\.castLock;/.test(host)&&/aria-disabled=\{waiting\}/.test(host),'Wait… is aria-disabled');
 ok(/\.controls \.reel\[aria-disabled=true\]:active\{translate:none;scale:none\}/.test(src('components/FishingHost.module.css')),'no press effect while disabled');}
{const tut=src('components/FishingTutorial.tsx');ok(/wait:'The button says Wait… while it nibbles/.test(tut)&&/onDone\(step==='done'\?'done':'skip'\)/.test(tut),'tutorial copy names Wait…; done vs skip is reported');
 ok(/tStep==='now'\|\|tStep==='reel'\?<span className=\{styles\.ghostButton\}/.test(src('components/FishingHost.tsx')),'the ghost hand shows on Hook! and the spin only, never on Wait…');}

// ---- 2. Lost fish says Keep spinning; late bite says too late; stale hints gone; Cast lock does not restart ----
{const {api,events}=mkApi(),r=lcg(11);api.tap();stepUntil(api,r,s=>s.phase==='bite');api.tap();ok(api.session.phase==='reeling','hooked');
 stepUntil(api,r,s=>s.phase!=='reeling',30*12);ok(api.session.phase==='escaped','an idle fight lets the hooked fish go');
 ok(api.getView().hint===sessMod.LOST_HINT&&/Keep spinning/.test(api.getView().hint),'hint: Keep spinning (not "Too late")');
 ok(api.getView().lesson&&api.getView().lesson.title==='Keep spinning!'&&/keep the reel turning/.test(api.getView().lesson.text),'the spin lesson');
 ok(events.at(-1).type==='escape'&&events.at(-1).hooked===true,'the escape is a hooked one');
 stepUntil(api,r,s=>s.phase==='bite');stepUntil(api,r,s=>s.phase==='escaped');
 ok(/Too late/.test(api.getView().hint)&&api.getView().lesson.title==='A touch too late','a missed bite keeps the late lesson');}
{const s=src('lib/town/fishing/fishingSession.ts'),c=src('lib/town/fishing/fishingCore.ts').slice(0,1600);
 ok(!/Keep tapping Reel|Now! Reel it in/.test(s),'no stale tap hints');ok(!/Easy\s*\*?\s*reel" option|tapping the reel N times/.test(c),'the core header no longer describes the Easy reel');
 ok(cat.KEEPER_LESSONS.lost.title==='Keep spinning!','KEEPER_LESSONS.lost');ok(/'lost'/.test(src('lib/learning/conceptMap.ts')),'the lost lesson credits the keeper concept');}
{const {api}=mkApi(),r=lcg(5);api.tap();stepUntil(api,r,s=>s.phase==='bite');api.tap();land(api,r);ok(api.session.phase==='caught','landed');
 ok(api.getView().castLock===true,'Cast waits while the fact is read');let t=0;
 while(api.session.t<core.CATCH_READ_TIME-.1){api.tap();api.handle(core.stepSession(api.session,spot,.1,r,spawn));t++;}
 ok(api.session.phase==='caught'&&api.getView().castLock,'taps in the read time do nothing');
 api.handle(core.stepSession(api.session,spot,.15,r,spawn));ok(api.getView().castLock===false,'the castable event unlocks Cast (the view republishes)');
 api.tap();ok(api.session.phase==='casting','the very next tap casts: the burst never extended the lock');
 ok(/view\.castLock\?'Wait…'/.test(src('components/FishingHost.tsx')),'the reel reads Wait… while locked');}

// ---- 3. Summit headlands: real tables, the 3-kinds clue can fire, means unchanged; legends never bump the Fishbook ----
{const O=load('lib/town/fishing/fishingOdds.ts'),LOG=load('lib/town/fishing/fishingLog.ts'),L=load('lib/town/fishing/legendary.ts');
 for(const s of cat.FISH_SPOTS)ok(Object.keys(s.weights).length>=L.LEGEND_CLUE_KINDS,`${s.id}: at least ${L.LEGEND_CLUE_KINDS} kinds, so its legend clue can turn up`);
 // Deliberate snapshot (Nov 6 2026): Palm Point gains mackerel + sea bass (+ the stargazer at night), Lookout Rocks shrimp +
 // sardine (+ the bigeye at night); same-price commons, so each mean catch is exactly what it was (4.00 and 3.00).
 // Updated deliberately for the wave-3 signature species (Nov 6 2026): each headland's own day species join, mean catch within
 // ±1.5 % of the old 4.00 / 3.00 (the milkfish and capelin come at sunset / night and swap for a same-price shared common).
 const SNAP={'summit-palm':[['mackerel','sea-bass','mealy-crab','sand-bubbler-crab','ribbontail-ray','zebra-shark'],4],'summit-lookout':[['shrimp','sardine','bloater','smelt','garfish','atlantic-salmon'],3]};
 for(const [id,[kinds,mean]] of Object.entries(SNAP)){const s=cat.spotById(id);ok(JSON.stringify(Object.keys(s.weights).sort())===JSON.stringify([...kinds].sort()),`${id}: table`);
  const m0=O.meanPrice(s.weights);ok(Math.abs(m0-mean)<=mean*.015,`${id}: mean catch ≈ ${mean} (${m0.toFixed(3)})`);
  for(const time of ['sunset','night'])ok(Math.abs(O.meanPrice(O.catchWeights(s,0,{time,lure:null,legends:[]}))-m0)<1e-9,`${id} ${time}: unchanged`);
  let log=LOG.emptyLog(),clue=[];kinds.forEach((k,i)=>{const r=LOG.logCatch(log,{id:k,size:10,spot:id,now:1+i,day:'2026-11-06',speciesCaught:i+1});log=r.log;clue.push(...r.effects.newClues);});
  ok(clue.join()===id&&!!L.legendForSpot(id),`${id}: the "3 kinds at a spot" clue fires`);}
 ok(cat.fishById('stargazer').spots.includes('summit-palm')&&cat.fishById('bigeye').spots.includes('summit-lookout'),'a night fish visits each headland');
 const leg=L.legendId('summit-palm'),book=core.recordCatch(core.emptyFishbook(),'cod',50,1).book,r=core.recordCatch(book,leg,200,2);
 ok(r.book===book&&r.book.total===1&&!r.isNew&&!cat.isFishbookSpecies(leg),'a released legend never bumps the Fishbook (no stray +1 that a reload drops)');
 ok(core.sanitizeFishbook(JSON.parse(JSON.stringify(r.book))).total===r.book.total,'the total survives a reload');}

// ---- 5. Catch card coins: what a buyer actually pays (the same-kind ladder, half price past the allowance) ----
{const M=load('lib/town/market/market.ts'),ms=load('lib/town/market/marketStand.ts'),E=load('lib/economy.ts');
 const st={version:1,day:'2026-11-06',basket:{sardine:6},soldToday:0,sales:0,lifetime:0};
 ok(ms.newestUnitValue({...st,basket:{sardine:1}},'sardine')===2,'the first sardine: full price');
 ok(ms.newestUnitValue(st,'sardine')===1,'the 6th sardine in the basket fetches the ladder price');
 ok(M.quoteSale(st,'fish').lines[0].coins===4*2+2*1,'the same rules as selling');
 ok(ms.newestUnitValue({...st,basket:{sardine:1},soldToday:M.MARKET_FULL_PRICE_COINS},'sardine')===1,'half price past the allowance');
 ok(ms.newestUnitValue(st,'cod')===null,'not in the basket: unknown (the card says "up to")');
 ok(ms.coinsText(1)==='1 coin'&&ms.coinsText(.5)==='2 for 1 coin'&&E.fishSellValue(cat.fishById('sardine'))===2,'coin words');
 const host=src('components/FishingHost.tsx');ok(/newestUnitValue\(market,fish\.id\)/.test(host)&&/`up to \$\{coinsText\(fishSellValue\(fish\)\)\}`/.test(host)&&!/\{fishSellValue\(fish\)\} coin/.test(host),'the card reads the market, not the full price');}

// ---- 7. Kid bite window: late-miss help, Easy bite; sharks still harder ----
{ok(core.missHelp(0)===0&&core.missHelp(1)===0&&Math.abs(core.missHelp(2)-.3)<1e-9&&Math.abs(core.missHelp(3)-.45)<1e-9&&Math.abs(core.missHelp(9)-.45)<1e-9,'+0.3 s after 2 late misses, capped at +0.45');
 const {api}=mkApi(),r=lcg(21);api.tap();const windows=[];
 for(let i=0;i<3;i++){stepUntil(api,r,s=>s.phase==='bite');const f=cat.fishById(api.session.fish.id);windows.push([api.session.window,core.BITE_WINDOW[f.rarity]]);stepUntil(api,r,s=>s.phase==='escaped');stepUntil(api,r,s=>s.phase==='floating'||s.phase==='ready');if(api.session.phase==='ready')api.tap();}
 ok(Math.abs(windows[0][0]-windows[0][1])<1e-9&&Math.abs(windows[1][0]-windows[1][1])<1e-9,'no help for the first two bites');
 ok(Math.abs(windows[2][0]-windows[2][1]-.3)<1e-9,'the third bite after two late misses: +0.3 s');ok(api.session.lateMisses===3);
 stepUntil(api,r,s=>s.phase==='bite');ok(Math.abs(api.session.window-core.BITE_WINDOW[cat.fishById(api.session.fish.id).rarity]-.45)<1e-9,'capped at +0.45');
 api.tap();ok(api.session.lateMisses===0,'a hook resets the help');
 api.setEasyBite(true);ok(api.easyBite===true,'Easy bite reaches the session');
 ok(/easy:c\.reduced\|\|session\.easyBite/.test(src('lib/town/fishing/fishingWorld.ts')),'the world passes Easy bite (or reduced motion) to the core');
 // Sharks keep their rarity's window as the base: under the same help, every shark is harder (a shorter window) than any common.
 const sharks=cat.FISH.filter(f=>f.group==='shark'),commons=cat.FISH.filter(f=>f.rarity==='common'&&f.group!=='shark');ok(sharks.some(f=>f.id==='great-white'),'Great White is a shark');
 for(const easy of [false,true])for(const m of [0,2,3,9])for(const sh of sharks)ok(core.biteWindow(sh.rarity,easy,m)<core.biteWindow(commons[0].rarity,easy,m),`${sh.id}: shorter window than a common (easy ${easy}, ${m} misses)`);
 ok(core.biteWindow('legendary',false,0)===core.BITE_WINDOW.legendary,'Great White base window untouched');
 const store=load('lib/town/fishing/fishingStore.ts');ok(store.fishingPrefs().easyBite===false,'Easy bite defaults off');store.setEasyBite(true);ok(store.fishingPrefs().easyBite===true&&data.get(store.FISH_EASY_BITE_KEY)==='1','saved per device');store.setEasyBite(false);ok(!data.has(store.FISH_EASY_BITE_KEY));
 ok(/'fi2-fish-easy-bite-v1'/.test(src('lib/saves/snapshot.ts'))&&/`fi2-fish-easy-bite-v1`/.test(src('docs/accounts-design.md')),'a DEVICE key (snapshot + accounts design)');
 const set=src('components/IslandSettings.tsx');ok(/data-easy-bite onClick=\{\(\)=>setEasyBite\(!easyBite\)\}/.test(set)&&/<h3>Fishing<\/h3>/.test(set),'Island settings → Fishing → Easy bite');
 ok(/fishingSession\.setEasyBite\(prefs\.easyBite\)/.test(src('components/FishingHost.tsx')),'the HUD pushes the setting into the session');
 // Rarity odds are untouched by either: catch weights never read the bite help.
 ok(!/missHelp|easyBite|EASY_BONUS/.test(src('lib/town/fishing/fishingOdds.ts')),'odds never read the bite help');}

console.log(`FISHING_NOV6_PASS: ${n} checks (Wait… honest, Keep spinning, cast lock, Summit tables + legend total, catch-card coins, bite help + Easy bite)`);
