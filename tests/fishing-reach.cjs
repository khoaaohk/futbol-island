#!/usr/bin/env node
// Fishing reach and fixes (Nov 14 2026, docs/fishing.md "Reach and fixes", lib/town/fishing/fishingReach.ts): Go fishing (the
// Welcome back note's suggestion + the island map) travels to the nearest shore spot; a device's first catch is a guaranteed
// common; never-fished players see discovery ripples within 8 m; a run is easier to let go of in time and says "Nice!"; a full
// basket offers one tap to the nearest buyer; the stand shows prices and what is left at full price; the tutorial ends by doing;
// the new counters are registered, counted and shown in /admin.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
const counted=[];const stubs=new Map([[path.resolve(ROOT,'lib/analytics/tracker.ts'),{count:(id,k=1)=>counted.push([id,k])}]]);const cache=new Map();
function resolve(from,id){const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);for(const f of [base+'.ts',base+'.tsx',base])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id+' from '+from);}
function load(name){const file=path.resolve(ROOT,name);if(stubs.has(file))return stubs.get(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext('(function(exports,module,require){'+code+'\n})',{console,Set,Map,Math,Date,JSON,Object,Array,Number,String,Error,process:{env:{}}})(m.exports,m,id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id));
 cache.set(file,m.exports);return m.exports;}

const R=load('lib/town/fishing/fishingReach.ts'),S=load('lib/town/fishing/fishSpots.ts'),C=load('lib/town/fishing/fishCatalog.ts');
// 1. Go fishing: the nearest shore spot, never a boat.
ok(R.GO_FISHING_SPOTS.length>5&&R.GO_FISHING_SPOTS.every(s=>!s.boat),'Go fishing lands at shore spots only');
for(const s of R.GO_FISHING_SPOTS)ok(R.nearestFishingSpot(s.x+1,s.z-1).id===s.id,'nearest spot to '+s.id);
ok(R.nearestFishingSpot(230,35).id==='harbour-wall','from the market: Harbour Wall');
// 2. The first catch: a common that lives at the spot, for every shore spot.
for(const s of R.GO_FISHING_SPOTS){const id=R.firstCatchFish(s);ok(id&&C.fishById(id).rarity==='common'&&s.weights[id]>0,'first catch at '+s.id+': '+id);}
ok(R.firstCatchOwed(false,0)&&!R.firstCatchOwed(true,0)&&!R.firstCatchOwed(false,3),'owed only on a device that never landed one with an empty Fishbook');
ok(R.isNewAngler()===false,'no window: never a new angler (sims and the economy guard keep the neutral roll)');
ok(R.DISCOVER_RANGE===8,'discovery ripples within 8 m');
// 3. The run: a resting finger (jitter under RUN_STILL_RATE) counts as let go; letting go pops "tired" and winds in a little.
const F=load('lib/town/fishing/fishingFight.ts');const lcg=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
{const r=lcg(5),f=F.createFight({group:'shark',shape:'shark',rarity:'rare',size:[50,90]},70,r);F.setHold(f,true,.5);f.progress=f.runAt[0]+.001;F.stepFight(f,.02,r);ok(f.run,'a run');
 F.setHold(f,true,F.RUN_STILL_RATE*.6);const before=f.progress;let tired=false;for(let i=0;i<200&&f.run;i++)tired=F.stepFight(f,1/30,r).includes('tired')||tired;
 ok(tired&&f.runsStopped===1&&f.runsSpun===0,'a finger resting on the reel during a run counts as let go, and says tired');
 ok(f.progress>before-.2,'the bonus offsets the take-back');
 F.setHold(f,true,1);f.progress=f.runAt[0]+.001;F.stepFight(f,.02,r);let t2=false;for(let i=0;i<200&&f.run;i++)t2=F.stepFight(f,1/30,r).includes('tired')||t2;ok(!t2&&f.runsSpun===1,'spinning through a run: no tired');}
ok(F.RUN_STOP_SHARE<.5&&F.RUN_TIRED_BONUS>0&&F.RUN_TIRED_BONUS<=.05,'easier to stop in time, a small bonus, never harder');
const core=read('lib/town/fishing/fishingCore.ts'),sess=read('lib/town/fishing/fishingSession.ts');
ok(/s\.fight\.holding\|\|s\.fight\.run\?0:/.test(core),'letting go during a run never counts as an idle reel');
ok(/e==='tired'\)\{cue\('reel'\);fightHint=TIRED_HINT;emit\('tired'\);\}/.test(sess)&&/Stop spinning/.test(sess),'the session says Nice and emits tired; the run hint says stop spinning');
// 4. Welcome suggestion: on-device, pure.
// Nov 14 2026 (smart welcome, tests/welcome-suggestions.cjs has the picker): a never-fished new player is offered fishing first.
const W=load('lib/welcomeSuggestion.ts'),WH=load('lib/welcome/hooks.ts'),WT=load('lib/welcome/tally.ts'),WL=load('lib/welcome/learn.ts');
const wctx=f=>({arm:'on',tally:WT.emptyTally(),learn:WL.emptyLearn(),today:20000,facts:{fishing:f}});
ok(W.pickWelcomeSuggestion(wctx({species:0,nearSet:null})).action.to==='fish'&&W.pickWelcomeSuggestion({...wctx({species:0,nearSet:null}),arm:'hold'})===null,'fishing suggested to new players (not the holdout)');
ok(!/fetch\(|count\(/.test(read('lib/welcomeSuggestion.ts')+read('lib/welcome/hooks.ts')+read('lib/welcome/tally.ts')),'decided on the device, never sent');
const wb=read('components/WelcomeBack.tsx'),wa=read('lib/welcome/act.ts');ok((wb.match(/<button\b/g)||[]).length===1&&/requestGoFishing\(a\.spots\)/.test(wa)&&/countGoFishing\('welcome'\)/.test(wa)&&/data-welcome-suggest-line/.test(wb),'the Welcome back note stays one tap target; with a suggestion it goes fishing');
ok(!/welcomeSuggestion|GoFishing/.test(read('components/landing/TitleActions.tsx')),'the title screen card is unchanged');
// 5. Wiring.
const town=read('components/Town.tsx');ok(/window\.addEventListener\(GO_FISHING_EVENT,on\)/.test(town)&&/goFishingTarget\(location\.x,location\.z,goFishSpots\.current\)/.test(town)&&/goFishSpots\.current=\(e as CustomEvent/.test(town),'Town travels on Go fishing (to the named fish\'s spot when the event carries spots)');
const map=read('components/IslandTravelMap.tsx');ok(!/data-map-go-fishing|requestGoFishing|Go fishing/.test(map),'the map has no Go fishing button (owner, Nov 20 2026: removed; the Welcome back note still offers it)');
const log=read('lib/town/fishing/fishingLogStore.ts');ok(/if\(isNewAngler\(\)\)\{const first=firstCatchFish\(spot\);if\(first\)return first;\}/.test(log)&&/markFirstCatch\(\);countFirstCatch\(\)/.test(log),'the live roll guarantees the first catch and counts it');
const world=read('lib/town/fishing/fishingWorld.ts');ok(/closestPost<DISCOVER_RANGE&&isNewAngler\(\)/.test(world)&&/if\(i===discoverSpot\)countRippleStart\(\)/.test(world)&&/easy:c\.reduced\|\|session\.easyBite\|\|isNewAngler\(\)/.test(world),'discovery ripples, ripple starts and an easy first bite');
ok(!/new T\.(Mesh|InstancedMesh)\(/.test(world.slice(world.indexOf('discoverSpot=!fishing'))),'no new meshes for discovery (heat)');
const host=read('components/FishingHost.tsx');
ok(/data-fish-basket-full/.test(host)&&/countFullSell\(\);setTab\('fish'\);setPlace\(b\)/.test(host)&&/nearestFishBuyer\(view\.spotId\)/.test(host),'a full basket: one tap to the nearest buyer');
ok(/data-fish-let-go/.test(host)&&/data-fish-tired/.test(host)&&/data-fish-run-hint/.test(host)&&/markRunHint\(\);countRunHint\(\)/.test(host),'the run badge, the Nice pop and the once-per-device run hint');
ok(/countFishTutorial\('done'\);finishFishingTutorial\(\);setTutorialCatch\(catchKey\)/.test(host),'the tutorial finishes on the first catch by itself');
const stand=read('components/MarketStand.tsx');ok(/data-market-cap-left/.test(stand)&&/left at full price today/.test(stand)&&/data-market-price/.test(stand),'the stand shows each price and what is left at full price');
const snap=read('lib/saves/snapshot.ts');ok(/'fi2-fish-first-catch-v1','fi2-fish-run-hint-v1'/.test(snap),'the new keys are DEVICE keys');
// 6. Analytics.
const CID=load('lib/analytics/countIds.ts'),FE=load('lib/analytics/fishingEvents.ts');
for(const id of ['go_welcome','go_map','first_catch','ripple_start','run_hint','full_sell','run_stopped'])ok(CID.isCountId('fi:'+id)&&CID.FIXED_COUNT_IDS.includes('fi:'+id),'registered fi:'+id);
counted.length=0;FE.countGoFishing('welcome');FE.countGoFishing('map');FE.countFirstCatch();FE.countRippleStart();FE.countRunHint();FE.countFullSell();
assert.deepEqual(counted.map(c=>c[0]),['fi:go_welcome','fi:go_map','fi:first_catch','fi:ripple_start','fi:run_hint','fi:full_sell']);n++;
const adm=read('app/admin/FishingSection.tsx');ok(/'fi:go_welcome','fi:go_map','fi:first_catch','fi:ripple_start','fi:run_hint','fi:run_stopped','fi:full_sell'/.test(adm)&&/data-fishing-reach/.test(adm),'the admin Fishing tab shows the reach counters');
// 6. A named fish's spot (Nov 14 2026, fish-comeback x smart-welcome): Go fishing with spot ids travels to the nearest of THOSE.
{const far=R.GO_FISHING_SPOTS.find(s=>s.id==='summit-palm'),near=R.GO_FISHING_SPOTS.find(s=>s.id!=='summit-palm');
 ok(far&&R.goFishingTarget(near.x,near.z,['summit-palm']).id==='summit-palm','a named spot wins over the nearest (Palm Point on Summit Isle)');
 ok(R.goFishingTarget(near.x,near.z,null).id===near.id&&R.goFishingTarget(near.x,near.z,[]).id===near.id&&R.goFishingTarget(near.x,near.z,['deep-sea-boat']).id===near.id,'no / boat-only ids: the nearest shore spot');}
{const F=load('lib/welcome/fishingFacts.ts'),H=load('lib/welcome/hooks.ts'),CB=load('lib/town/fishing/comeback.ts');
 const sun=new Date(2026,10,15,10).getTime(),mon=new Date(2026,10,9,10).getTime();// Sunday / Monday of ISO week 46
 ok(F.visitorDaysLeft(mon)===7&&F.visitorDaysLeft(sun)===1,'visitor days left in the ISO week');
 const fd=CB.fishOfTheDay(CB.localDay(sun)),v=CB.weeklyVisitor(sun);
 const a=F.fishingFacts({version:1,species:{}},{now:sun,time:'sunset'});
 ok(a.fishOfDay&&a.fishOfDay.name===fd.name&&a.fishOfDay.spots.length>0&&a.fishOfDay.spots.every(id=>R.GO_FISHING_SPOTS.some(s=>s.id===id&&fd.id in s.weights)),'fish of the day with its shore spots');
 ok(a.visitorLeaving&&a.visitorLeaving.name===v.fish.name&&a.visitorLeaving.spot===v.spot&&a.visitorLeaving.days===1,'the weekly visitor on its last day, at its spot');
 ok(a.sunsetSpot&&R.GO_FISHING_SPOTS.some(s=>s.id===a.sunsetSpot.spot&&s.name===a.sunsetSpot.name),'a sunset fish spot while the island is at sunset');
 const b=F.fishingFacts({version:1,species:{}},{now:mon,time:'day',comeback:{version:1,fotdDay:CB.localDay(mon),fotdDays:1,visitorWeek:'',visitorWeeks:0}});
 ok(b.fishOfDay===null&&b.visitorLeaving===null&&b.sunsetSpot===null,'caught today / not leaving soon / daytime: no line');
 const set=CB.setsProgress({book:{species:{}}}).map(x=>x.set).find(x=>x.species.length>=3);
 if(set){const book={version:1,species:Object.fromEntries(set.species.slice(0,set.species.length-2).map(id=>[id,{count:1}]))};
  const c=F.fishingFacts(book,{now:mon,time:'day'}),d=F.fishingFacts(book,{now:mon,time:'day',hooks:{version:1,sets:[set.id],visits:{},golden:{},legendSeen:{}}});
  ok(c.nearSet&&c.nearSet.left<=2,'nearly-done set via nearlyDoneSets');ok(!d.nearSet||d.nearSet.title!==set.title,'a claimed set is not nearly done');}
 ok(H.setName('Every shark')==='Every Shark'&&H.setName('The shared ten')==='Shared Ten'&&H.setName('Night and sunset fish')==='Night and Sunset Fish','set names read naturally');
 const hs=H.hooksFor('fishing',{fishing:{species:4,nearSet:{title:'Every shark',left:2},fishOfDay:{name:'Moon Ray',spots:['summit-palm']},visitorLeaving:null,sunsetSpot:null}});
 ok(hs[0].line==='2 more fish to finish your Every Shark set!','set line copy');
 const day=hs.find(h=>h.kind==='fish_day');ok(day.action.to==='fish'&&day.action.spots.join()==='summit-palm','the fish of the day travels to its spot');
 ok(!('spots' in hs.find(h=>h.kind==='fish_go').action),'plain Go fishing: the nearest spot');}
console.log(`FISHING_REACH_PASS ${n} checks (Go fishing, first catch, discovery ripples, runs, full basket, stand prices, tutorial, counters)`);
