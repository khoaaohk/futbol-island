#!/usr/bin/env node
/**
 * Futbol Island economy simulation (docs/economy/ECONOMY_PROPOSAL.md).
 *
 *   node scripts/economy-sim.cjs            # current vs proposed, all archetypes, 90 days
 *   node scripts/economy-sim.cjs --days 60  # other horizon
 *   node scripts/economy-sim.cjs --json     # machine-readable results
 *
 * Deterministic (seeded RNG). Loads the REAL constants from the game code with the same ts.transpileModule pattern the tests
 * use (lib/town/jobs/jobEconomy.ts, lib/arcade/arcadeWalletCore.ts, lib/town/market/*, lib/town/fishing/fishCatalog.ts,
 * lib/town/jobs/garden.ts, lib/town/vendingCatalog.ts, lib/books/catalog.ts, lib/town/coinQuest.ts, lib/town/rideUnlocks.ts,
 * lib/town/cardCollection.ts, lib/town/cardTiers.ts, lib/town/cardRewards.ts, lib/paths/formatPaths.json, quizManifest.json).
 * It never writes game state and never edits gameplay constants: the PROPOSED block below is a what-if overlay.
 *
 * What is modelled vs assumed:
 *  - Modelled from code: every coin value, cap, soft cap, price, unlock gate (rides = finished paths, animals = found balls),
 *    pack sizes/prices/legend pools/fresh-only draws and "pack available" rule, card offer tier gates, NPC picks per day,
 *    the 80 hidden balls, 96 lesson quizzes (48 path core lessons), 10 jobs, fish weights, garden spots.
 *  - Assumed (edit ASSUME): minutes per activity, how children split their time, arcade skill, first-try quiz accuracy,
 *    and a spend-as-soon-as-you-can purchase policy. These are estimates, not playtest measurements.
 */
'use strict';
const path=require('path'),fs=require('fs'),Module=require('module');
const ROOT=path.resolve(__dirname,'..');
const ts=require(path.join(ROOT,'node_modules/typescript'));
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText,f);
const resolve=Module._resolveFilename;
// '@/x' → project root; an extensionless relative import prefers x.ts over a same-named x.json (formatPaths, cardTiers).
Module._resolveFilename=function(request,parent,...rest){
 if(request.startsWith('@/'))request=path.join(ROOT,request.slice(2));
 if((request.startsWith('.')||path.isAbsolute(request))&&!path.extname(request)&&parent?.filename){const abs=path.resolve(path.dirname(parent.filename),request);for(const ext of ['.ts','.tsx'])if(fs.existsSync(abs+ext))return abs+ext;}
 return resolve.call(this,request,parent,...rest);};
const mem=new Map();global.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
const req=p=>require(path.join(ROOT,p));

// ---- Real constants -----------------------------------------------------------------------------------------------------

const jobs=req('lib/town/jobs/jobEconomy.ts');
const wallet=req('lib/arcade/arcadeWalletCore.ts');
const daily=req('lib/town/dailyPlay.ts');
const market=req('lib/town/market/market.ts');
const goods=req('lib/town/market/goods.ts');
const fish=req('lib/town/fishing/fishCatalog.ts');
const garden=req('lib/town/jobs/garden.ts');
const packs=req('lib/arcade/legendPacks.ts');
const trade=req('lib/town/market/cardSelling.ts');
const vending=req('lib/town/vendingCatalog.ts');
const books=req('lib/books/catalog.ts');
const readyBooks=req('lib/books/registry.ids.generated.ts').READY_BOOKS;
const quest=req('lib/town/coinQuest.ts');
const rides=req('lib/town/rideUnlocks.ts');
const cards=req('lib/town/cardCollection.ts');
const tiers=req('lib/town/cardTiers.ts');
const rewards=req('lib/town/cardRewards.ts');
const explore=req('lib/town/exploreChecklist.ts');
const journeys=req('lib/town/learningJourneys.ts');
const meter=req('lib/town/dailyMeter.ts');
const learnCoins=req('lib/town/learnCoins.ts');
const stories=req('lib/paths/stories.ts'),upcoming=req('lib/paths/upcomingStories.ts');
const FORMAT_PATHS=req('lib/paths/formatPaths.json');
const QUIZZES=req('lib/town/quizManifest.json');

const CARD_LIST=cards.ALL_PLAYERS.map(name=>({name,tier:tiers.cardTier(name)}));
const TIER_OF=new Map(CARD_LIST.map(c=>[c.name,c.tier]));
const PACK_ITEMS=[...vending.VENDING_ITEMS,...vending.VENDING_SPECIALS].filter(i=>i.kind==='pack');
const NO_CARD_EXPLORE=new Set(['knock-characters','visit-futsal','visit-7v7','visit-9v9','visit-11v11','use-parachute','visit-store','ride-truck','roof-drop','ramp-trick']);
const CONTENT={
 cards:CARD_LIST.length,
 balls:quest.COIN_QUEST.length,
 lessons:Object.values(QUIZZES).reduce((n,q)=>n+Object.keys(q).length,0),
 coreLessons:FORMAT_PATHS.map(p=>p.chapters.flatMap(c=>c.lessons).length),
 paths:FORMAT_PATHS.length,
 exploreCards:explore.EXPLORE_ITEMS.filter(i=>!NO_CARD_EXPLORE.has(i.id)).length,
 journeyStages:journeys.LEARNING_JOURNEYS.length*6,
 stories:stories.STORY_CARDS.length+Object.values(upcoming.UPCOMING_STORIES).flat().length,
 jobs:jobs.JOB_IDS.length,
 arcadeGames:Object.keys(wallet.ARCADE_COIN_CAPS).filter(g=>g!=='island'&&g!=='learn').length,
 puzzles:(fs.readFileSync(path.join(ROOT,'lib/passPuzzle/scenarios.ts'),'utf8').match(/\bid:'[^']+'/g)||[]).length,
 books:Object.values(books.PLAYER_BOOKS).filter(b=>b.machine).length,readyBooks:readyBooks.filter(id=>books.PLAYER_BOOKS[id]?.machine).length,
 gardenSpots:garden.GARDEN_SPOTS.length,
};

// ---- Assumptions (not in code) ------------------------------------------------------------------------------------------
const ASSUME={
 min:{lesson:4,npc:1.5,story:4,journey:3,explore:2,job:1.5,fishCast:.6,gardenPick:.15,sell:.5,arcadeRound:3,liveRound:3.8,puzzle:1.5,dailyPlay:.5,shop:.7},
 ballMinutes:i=>2+3*i/80,          // hidden balls get harder: 2 min for the first, 5 for the last
 fishSuccess:.8,                    // share of casts that land a fish (bite window 0.7–1.0 s)
 perfectFirstTry:.65,               // quizzes answered perfectly on the first run (earns the card)
 arcadeSkill:{casual:.45,regular:.55,keen:.7}, // share of each game's per-round cap actually earned
 puzzleStars:2.2,
};
// How each archetype splits a session (share of minutes). Exhausted activities hand their time to the others.
const ARCHETYPES={
 casual:{label:'Casual · 10 min, 4 days/week',minutes:10,plays:d=>[0,2,4,5].includes(d%7),mix:{balls:25,lessons:15,npc:10,story:3,jobs:15,arcade:17,fish:8,garden:7}},
 regular:{label:'Regular · 20 min daily',minutes:20,plays:()=>true,mix:{balls:20,lessons:20,npc:10,story:5,jobs:15,arcade:14,fish:8,garden:8}},
 keen:{label:'Keen · 45 min daily',minutes:45,plays:()=>true,mix:{balls:15,lessons:20,npc:7,story:5,jobs:18,arcade:17,fish:9,garden:9}},
};
const REPEATABLE=['jobs','arcade','fish','garden'];

// ---- Configs --------------------------------------------------------------------------------------------------------------
// CURRENT = the game as coded now. The economy pass was applied 28 Sep 2026 (user decisions: books stay 100, no Matchday
// calendar, trade-ins kept, light Icon gate in packs), so CURRENT reads every applied value from the game code.
const L=learnCoins.LEARN_COINS;
const CURRENT={
 name:'current',
 starter:jobs.STARTER_COINS,dailyPlay:daily.DAILY_PLAY_COINS,calendar:null,
 jobBase:jobs.JOB_BASE_PAY,fullPay:jobs.FULL_PAY_PER_DAY,halfPay:jobs.HALF_PAY_PER_DAY,tip:jobs.TIP_COINS,firstJob:jobs.FIRST_JOB_BONUS,
 arcadeCaps:wallet.ARCADE_COIN_CAPS,arcadeCost:wallet.ARCADE_PLAY_COST,puzzleCost:0,puzzleFirst:wallet.PUZZLE_FIRST_SOLVE_COINS,puzzleRepeat:0, // puzzles are free; a repeat pays 0 (useArcadeEntry, recordPuzzleBest)
 marketFull:market.MARKET_FULL_PRICE_COINS,basket:market.BASKET_LIMIT,
 learn:{lesson:L.quiz,perfect:L.quizPerfect,ball:L.ball,story:L.story,journey:L.journey,path:L.path,explore:L.explore},
 softCap:{full:meter.TRAINING_FULL_COINS,half:meter.TRAINING_HALF_COINS}, // Training meter (lib/town/dailyMeter.ts)
 npcPicks:rewards.NPC_PICKS_PER_DAY,
 prices:{pack3:packs.MYSTERY_PACK_OPTIONS[0].price,pack5:packs.MYSTERY_PACK_OPTIONS[1].price,ball:vending.VENDING_PRICES.ball,specialBall:vending.VENDING_PRICES.specialBall,
  scooter:vending.VENDING_PRICES.scooter,bike:vending.VENDING_PRICES.bike,moped:vending.VENDING_PRICES.moped,jetpack:vending.VENDING_PRICES.jetpack,
  costume:vending.VENDING_PRICES.costume,book:books.BOOK_PRICE},
 packsPerDay:packs.PACKS_PER_DAY,packRule:'relaxed', // pack top-ups (vendingLedger.packFreshness) + 3 a day
};
/** The original recommendation (docs/economy/ECONOMY_PROPOSAL.md §5) as a what-if overlay: it differs from CURRENT only in the
 *  two parts the user declined (the Matchday calendar and 120-coin books). */
const PROPOSED={
 ...CURRENT,name:'proposed',
 calendar:{every:5,reward:'pack3'},               // Matchday calendar: every 5th play day (not consecutive) → free 3-card pack
 prices:{...CURRENT.prices,book:120},
};
const withAllBooks=cfg=>({...cfg,name:cfg.name+'+32books',allBooks:true});

// ---- Helpers -------------------------------------------------------------------------------------------------------------
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const FISH_EV=(()=>{const spotEV=fish.FISH_SPOTS.map(s=>{const w=Object.entries(s.weights),tot=w.reduce((n,[,x])=>n+x,0);return w.reduce((n,[id,x])=>n+x/tot*fish.fishById(id).price,0);});return spotEV.reduce((a,b)=>a+b,0)/spotEV.length;})();
const GARDEN_VALUE=garden.GARDEN_SPOTS.map(s=>goods.goodById(s.good).price);
const pickWeighted=(pool,weight,r)=>{const tot=pool.reduce((n,x)=>n+weight(x),0);if(!tot)return null;let v=r()*tot;for(const x of pool){v-=weight(x);if(v<=0)return x;}return pool[pool.length-1];};

// ---- One player ------------------------------------------------------------------------------------------------------------
function simulate(cfg,archName,days,seed=7){
 const A=ARCHETYPES[archName],r=rng(seed+archName.length*101);
 const s={balance:0,earned:0,spent:0,owned:new Set(),cards:new Set(),balls:0,lessonsDone:0,core:FORMAT_PATHS.map(()=>0),pathOrder:[1,2,0,3],
  finishedPaths:0,cardSrc:{},stories:0,journeys:0,explores:0,jobLife:{},puzzles:0,playDays:0,packsBought:0,firsts:{},log:[]};
 const P=cfg.prices;
 // Catalogue of buyable things (ids + category + price + gate).
 const catalog=[];
 for(const it of vending.VENDING_ITEMS){
  if(it.kind==='gear'){const cat=it.storeItem.category,id=it.storeItem.option.id;if(`${cat}:${id}`===`${cat}:classic`)continue;
   if(cat==='ball')catalog.push({id:it.id,cat:'ball',price:P.ball});else catalog.push({id:it.id,cat:'ride',price:P[cat],gate:()=>rides.pathsNeeded(cat,id,CONTENT.paths)<=s.finishedPaths});}
  if(it.kind==='costume')catalog.push({id:it.id,cat:'costume',price:P.costume,gate:()=>s.balls>=quest.costumeUnlockBalls(it.costume)});
 }
 for(const it of vending.VENDING_SPECIALS){
  if(it.kind==='gear')catalog.push({id:it.id,cat:'specialBall',price:P.specialBall});
  if(it.kind==='display')catalog.push({id:it.id,cat:'book',price:P.book,gate:()=>!!it.storyId||!!cfg.allBooks,future:!it.storyId&&!cfg.allBooks});
 }
 // Pack availability = vendingLedger.packFreshness (≥2 fresh legends and ≥size−1 fresh regulars). The proposed 'relaxed' rule keeps
 // a pack on sale while ANY card it can give is still missing and tops up the other slots with other missing cards, so the binder
 // can always finish (today the last Icons can become unobtainable: see ECONOMY_PROPOSAL.md §2).
 const packFresh=spec=>{const legends=spec.legends.filter(n=>!s.cards.has(n));let regular=spec.regular.filter(n=>!s.cards.has(n)&&!legends.includes(n));
  if(cfg.packRule==='relaxed'){const own=legends.length+regular.length>0;
   if(regular.length<spec.size-1)regular=[...regular,...CARD_LIST.map(c=>c.name).filter(n=>!s.cards.has(n)&&!legends.includes(n)&&!regular.includes(n))];
   return {legends,regular,ok:own};}
  return {legends,regular,ok:legends.length>=2&&regular.length>=spec.size-1};};
 const openPack=(spec)=>{const f=packFresh(spec);if(!f.ok)return 0;const two=Math.min(f.legends.length,spec.size===5&&r()<.25?2:1),got=[];
  for(let i=0;i<two;i++){const pool=f.legends.filter(n=>!got.includes(n));got.push(pool[Math.floor(r()*pool.length)]);}
  for(let i=0;i<spec.size-two;i++){const pool=[...f.regular,...f.legends].filter(n=>!got.includes(n));if(!pool.length)break;got.push(pool[Math.floor(r()*pool.length)]);}
  let n=0;for(const c of got)if(c&&!s.cards.has(c)){s.cards.add(c);n++;}s.cardSrc.pack=(s.cardSrc.pack||0)+n;return n;};
 const bestProgress=()=>Math.max(...s.core.map((d,i)=>d/CONTENT.coreLessons[i]));
 const earnCard=kind=>{ // learning offer: 3 face-down new cards, tier-gated (cardRewards.ts), child opens one
  if(s.cards.size>=CONTENT.cards)return 0;const gate=rewards.tierGate(bestProgress(),kind);
  let pool=CARD_LIST.filter(c=>!s.cards.has(c.name));
  if(gate.iconOffer){const icons=pool.filter(c=>c.tier==='icon'),elite=pool.filter(c=>c.tier==='elite');pool=icons.length?icons:elite.length?elite:pool;}
  else pool=pool.filter(c=>c.tier==='regular'||c.tier==='elite'&&gate.elite||c.tier==='icon'&&gate.icon);
  if(!pool.length)pool=CARD_LIST.filter(c=>!s.cards.has(c.name)&&c.tier!=='icon');
  if(!pool.length)return 0;
  const c=pickWeighted(pool,x=>rewards.TIER_WEIGHT[x.tier],r);s.cards.add(c.name);s.cardSrc[kind]=(s.cardSrc[kind]||0)+1;return 1;};
 const mark=(key,day)=>{if(!(key in s.firsts))s.firsts[key]=day;};

 const out={days:[],sessions:0,empty:0,flooded:0,longestDry:0,idleCoins:0,emptyPre:0,floodedPre:0};
 let dry=0;
 for(let day=1;day<=days;day++){
  const rec={day,played:false,earned:0,learnCoins:0,repeatCoins:0,cards:0,bought:[],balance:0,avail:0};
  if(!A.plays(day-1)){rec.balance=s.balance;out.days.push(rec);continue;}
  rec.played=true;s.playDays++;out.sessions++;
  const cardsBefore=s.cards.size,unlockBefore=s.finishedPaths*100+Math.floor(s.balls/10);
  let repeatToday=0,marketSold=0,npcToday=0,packsToday=0;
  const credit=(n,kind)=>{if(n<=0)return 0;let pay=n;
   if(kind==='repeat'&&cfg.softCap){pay=0;for(let i=0;i<n;i++){const t=repeatToday+pay;pay+=t<cfg.softCap.full?1:t<cfg.softCap.half?.5:0;}pay=Math.floor(pay)||(n>0&&repeatToday>=cfg.softCap.half?1:0);}
   if(kind==='repeat')repeatToday+=pay;s.balance+=pay;s.earned+=pay;rec.earned+=pay;if(kind==='learn')rec.learnCoins+=pay;if(kind==='repeat')rec.repeatCoins+=pay;return pay;};
  if(day===1)credit(cfg.starter,'grant');
  let minutes=A.minutes;
  credit(cfg.dailyPlay,'grant');minutes-=ASSUME.min.dailyPlay;
  if(cfg.calendar&&s.playDays%cfg.calendar.every===0){s.freePacks=(s.freePacks||0)+1;}
  minutes-=ASSUME.min.shop; // a vending visit per session
  // What is still available to do today.
  const jobsToday={};let basket=0,gardenLeft=[...GARDEN_VALUE],arcadeGame=0;
  const nextLesson=()=>{const p=s.pathOrder.find(i=>s.core[i]<CONTENT.coreLessons[i]);return p!==undefined?{core:p}:s.lessonsDone<CONTENT.lessons?{extra:true}:null;};
  const can={
   balls:()=>s.balls<CONTENT.balls,lessons:()=>!!nextLesson(),npc:()=>npcToday<cfg.npcPicks,
   story:()=>s.stories<CONTENT.stories||s.journeys<CONTENT.journeyStages||s.explores<CONTENT.exploreCards,
   jobs:()=>true,arcade:()=>true,fish:()=>true,garden:()=>gardenLeft.length>0,
  };
  const sellBasket=()=>{if(!basket)return;let coins=0;const items=basket;for(const v of items.list){const p=marketSold>=cfg.marketFull?Math.max(1,Math.floor(v/2)):v;coins+=p;marketSold+=p;}basket=0;credit(coins,'repeat');};
  const addGood=v=>{if(!basket)basket={list:[]};basket.list.push(v);if(basket.list.length>=cfg.basket){minutes-=ASSUME.min.sell;sellBasket();}};
  const step={
   balls:()=>{minutes-=ASSUME.ballMinutes(s.balls);s.balls++;credit(cfg.learn.ball,'learn');rec.cards+=earnCard('ball');},
   lessons:()=>{const l=nextLesson();minutes-=ASSUME.min.lesson;s.lessonsDone++;if(l.core!==undefined){s.core[l.core]++;if(s.core[l.core]===CONTENT.coreLessons[l.core]){s.finishedPaths++;credit(cfg.learn.path,'learn');rec.cards+=earnCard('path');mark('path'+s.finishedPaths,day);}}
    const perfect=r()<ASSUME.perfectFirstTry;credit(cfg.learn.lesson+(perfect?cfg.learn.perfect:0),'learn');if(perfect)rec.cards+=earnCard('quiz');},
   npc:()=>{minutes-=ASSUME.min.npc;npcToday++;rec.cards+=earnCard('npc');},
   story:()=>{if(s.explores<CONTENT.exploreCards){minutes-=ASSUME.min.explore;s.explores++;credit(cfg.learn.explore,'learn');rec.cards+=earnCard('explore');}
    else if(s.journeys<CONTENT.journeyStages&&(s.journeys<=s.stories*1.5||s.stories>=CONTENT.stories)){minutes-=ASSUME.min.journey;s.journeys++;credit(cfg.learn.journey,'learn');rec.cards+=earnCard('journey');}
    else{minutes-=ASSUME.min.story;s.stories++;credit(cfg.learn.story,'learn');rec.cards+=earnCard('story');}},
   jobs:()=>{minutes-=ASSUME.min.job;const pay=id=>{const done=jobsToday[id]||0,base=cfg.jobBase[id];return (done<cfg.fullPay?base:done<cfg.fullPay+cfg.halfPay?Math.ceil(base/2):cfg.tip)+(s.jobLife[id]?0:cfg.firstJob);};
    const id=jobs.JOB_IDS.reduce((b,x)=>pay(x)>pay(b)?x:b,jobs.JOB_IDS[Math.floor(r()*jobs.JOB_IDS.length)]);credit(pay(id),'repeat');jobsToday[id]=(jobsToday[id]||0)+1;s.jobLife[id]=(s.jobLife[id]||0)+1;},
   arcade:()=>{const games=['runner','pinball','tennis','live','puzzle'],g=games[arcadeGame++%games.length];
    if(g==='puzzle'){minutes-=ASSUME.min.puzzle;s.balance-=cfg.puzzleCost;s.spent+=cfg.puzzleCost;if(s.puzzles<CONTENT.puzzles){s.puzzles++;credit(cfg.puzzleFirst+Math.round(ASSUME.puzzleStars),'repeat');}else credit(cfg.puzzleRepeat,'repeat');return;}
    if(s.balance<cfg.arcadeCost){minutes-=.2;return;}
    minutes-=g==='live'?ASSUME.min.liveRound:ASSUME.min.arcadeRound;s.balance-=cfg.arcadeCost;s.spent+=cfg.arcadeCost;credit(Math.round(cfg.arcadeCaps[g]*ASSUME.arcadeSkill[archName]*(.8+.4*r())),'repeat');},
   fish:()=>{minutes-=ASSUME.min.fishCast;if(r()<ASSUME.fishSuccess)addGood(Math.round(FISH_EV*(.6+.8*r())));},
   garden:()=>{minutes-=ASSUME.min.gardenPick;addGood(gardenLeft.pop());},
  };
  let guard=0;
  while(minutes>0.2&&guard++<500){
   const open=Object.entries(A.mix).filter(([k])=>can[k]());if(!open.length)break;
   const [k]=pickWeighted(open,([,w])=>w,r);step[k]();
  }
  sellBasket();
  // Spend: free calendar packs first, then the goal rotation below.
  const offers=()=>{const list=catalog.filter(c=>!s.owned.has(c.id)&&(!c.gate||c.gate())).map(c=>({...c}));
   if(packsToday<cfg.packsPerDay)for(const it of PACK_ITEMS){if(packFresh(it.pack).ok)list.push({id:it.id,cat:'pack',price:it.pack.size===5?P.pack5:P.pack3,pack:it.pack});}
   return list;};
  while(s.freePacks>0){const it=PACK_ITEMS.find(i=>i.pack.size===3&&packFresh(i.pack).ok);if(!it)break;s.freePacks--;rec.cards+=openPack(it.pack);mark('freePack',day);}
  // Goal rotation: the child works toward one category at a time (pack → new unlock → book → ball …), buys the cheapest item
  // in it once affordable, then moves on. Categories with nothing on sale are skipped. A just-unlocked ride/animal jumps the queue.
  const ROTATION=['pack','unlock','book','pack','ball'];
  for(let guard2=0;guard2<40;guard2++){
   const list=offers(),inCat=cat=>list.filter(o=>cat==='unlock'?o.cat==='ride'||o.cat==='costume':cat==='ball'?o.cat==='ball'||o.cat==='specialBall':o.cat===cat).sort((a,b)=>a.price-b.price);
   let goal=null;for(let k=0;k<ROTATION.length&&!goal;k++){const cat=ROTATION[(s.goalIx||0)%ROTATION.length];const c=inCat(cat);if(c.length)goal=c[0];else s.goalIx=(s.goalIx||0)+1;}
   const o=goal;if(!o||o.price>s.balance)break;
   s.balance-=o.price;s.spent+=o.price;rec.bought.push(o.cat);mark(o.cat,day);s.goalIx=(s.goalIx||0)+1;
   if(o.cat==='pack'){packsToday++;s.packsBought++;rec.cards+=openPack(o.pack);}else s.owned.add(o.id);}
  const remaining=offers();rec.avail=remaining.reduce((n,o)=>n+o.price,0);
  const cheapest=remaining.length?Math.min(...remaining.map(o=>o.price)):Infinity;
  rec.balance=s.balance;rec.cardTotal=s.cards.size;rec.ownedPct=Math.floor(100*catalog.filter(c=>s.owned.has(c.id)).length/catalog.filter(c=>!c.future).length);
  const newStuff=s.cards.size>cardsBefore||rec.bought.length>0||s.finishedPaths*100+Math.floor(s.balls/10)>unlockBefore;
  const done=('allBought' in s.firsts)&&s.cards.size>=CONTENT.cards;
  if(!newStuff){out.empty++;if(!done){out.emptyPre++;dry++;}}else dry=0;out.longestDry=Math.max(out.longestDry,dry);
  // Flooded: coins pile up with nothing left to buy now (balance ≥ 150 and ≥ everything currently on sale).
  if(s.balance>=150&&s.balance>=rec.avail){out.flooded++;if(!('allBought' in s.firsts))out.floodedPre++;out.idleCoins=Math.max(out.idleCoins,s.balance);}
  if(!remaining.length&&catalog.every(c=>s.owned.has(c.id)||c.future)&&!('allBought' in s.firsts))mark('allBought',day);
  if(s.cards.size>=CONTENT.cards)mark('allCards',day);
  out.days.push(rec);
 }
 out.state=s;return out;
}

// ---- Report --------------------------------------------------------------------------------------------------------------
function summarize(cfg,arch,days){
 const res=simulate(cfg,arch,days),played=res.days.filter(d=>d.played);
 const avg=(from,to,f=d=>d.earned)=>{const x=played.filter(d=>d.day>=from&&d.day<=to);return x.length?Math.round(x.reduce((n,d)=>n+f(d),0)/x.length):0;};
 const pct=day=>{const d=res.days[Math.min(day,days)-1];return d?Math.floor(100*(d.cardTotal??[...res.days.slice(0,day)].reverse().find(x=>x.cardTotal)?.cardTotal??0)/CONTENT.cards):0;};
 const f=res.state.firsts;
 return {config:cfg.name,archetype:arch,
  coinsPerSession:{day1:avg(1,1),wk1:avg(1,7),d8_30:avg(8,30),d31_90:avg(31,90)},
  learnShare:Math.round(100*played.reduce((n,d)=>n+d.learnCoins,0)/Math.max(1,played.reduce((n,d)=>n+d.earned,0))),
  firstPack:f.pack??f.freePack??null,firstBook:f.book??null,firstRide:f.ride??null,firstCostume:f.costume??null,
  cardsPct:{d7:pct(7),d30:pct(30),d60:pct(Math.min(60,days)),d90:pct(Math.min(90,days))},
  itemsPct:Object.fromEntries([7,30,60,90].filter(d=>d<=days).map(d=>['d'+d,[...res.days.slice(0,d)].reverse().find(x=>x.ownedPct!==undefined)?.ownedPct??0])),
  learnShare30:Math.round(100*played.filter(d=>d.day<=30).reduce((n,d)=>n+d.learnCoins,0)/Math.max(1,played.filter(d=>d.day<=30).reduce((n,d)=>n+d.earned,0))),
  allCards:f.allCards??null,allBought:f.allBought??null,paths:res.state.finishedPaths,balls:res.state.balls,packs:res.state.packsBought,
  emptySessions:res.empty,emptyBeforeDone:res.emptyPre,floodedBeforeAllBought:res.floodedPre,sessions:res.sessions,longestDry:res.longestDry,floodedSessions:res.flooded,peakIdle:res.idleCoins,
  earned:res.state.earned,spent:res.state.spent,endBalance:res.state.balance,cardSources:res.state.cardSrc};
}
function sinkTable(cfg){
 const P=cfg.prices,n=(cat)=>{let c=0;for(const it of vending.VENDING_ITEMS){if(it.kind==='gear'&&it.storeItem.option.id!=='classic'&&(cat==='ball'?it.storeItem.category==='ball':it.storeItem.category===cat))c++;if(cat==='costume'&&it.kind==='costume')c++;}return c;};
 const rows=[['Balls',n('ball'),P.ball],['Special balls',8,P.specialBall],['Scooters',n('scooter'),P.scooter],['Bikes',n('bike'),P.bike],['Mopeds',n('moped'),P.moped],['Flight',n('jetpack'),P.jetpack],['Island animals',n('costume'),P.costume],['Books (ready now)',CONTENT.readyBooks,P.book],['Books (all 32)',CONTENT.books,P.book]];
 return rows.map(([k,c,p])=>({item:k,count:c,price:p,total:c*p}));
}
function sourceTable(cfg){
 const jobAvg=Object.values(cfg.jobBase).reduce((a,b)=>a+b,0)/CONTENT.jobs,m=ASSUME.min;
 const rows=[
  ['Island job (full pay)',`${Math.min(...Object.values(cfg.jobBase))}–${Math.max(...Object.values(cfg.jobBase))} (avg ${jobAvg.toFixed(1)})`,m.job,jobAvg/m.job*60,`${cfg.fullPay} full + ${cfg.halfPay} half per job, then ${cfg.tip}; +${cfg.firstJob} first time`],
  ['Fishing (per cast)',`${FISH_EV.toFixed(1)} avg/fish`,m.fishCast,FISH_EV*ASSUME.fishSuccess/m.fishCast*60,`market: full price to ${cfg.marketFull}/day, then half`],
  ['Garden (per pick)',`${(GARDEN_VALUE.reduce((a,b)=>a+b,0)/GARDEN_VALUE.length).toFixed(1)} avg`,m.gardenPick,GARDEN_VALUE.reduce((a,b)=>a+b,0)/GARDEN_VALUE.length/m.gardenPick*60,`${GARDEN_VALUE.length} spots, regrow 3–4 min; shares market cap`],
  ...['runner','pinball','tennis','live'].map(g=>[`Arcade ${g} (net of ${cfg.arcadeCost})`,`cap ${cfg.arcadeCaps[g]}`,g==='live'?m.liveRound:m.arcadeRound,(cfg.arcadeCaps[g]*.55-cfg.arcadeCost)/(g==='live'?m.liveRound:m.arcadeRound)*60,'no daily cap'+(cfg.softCap?' (proposed: global soft cap)':'')]),
  ['Pass puzzle first solve',`${cfg.puzzleFirst}+stars (entry ${cfg.puzzleCost})`,m.puzzle,(cfg.puzzleFirst+ASSUME.puzzleStars-cfg.puzzleCost)/m.puzzle*60,`${CONTENT.puzzles} puzzles once; repeat pays ${cfg.puzzleRepeat}`],
  ['Daily play',`${cfg.dailyPlay}`,m.dailyPlay,null,'once a day after 30 s walking'],
  ['Lesson quiz',`${cfg.learn.lesson}+${cfg.learn.perfect} perfect`,m.lesson,(cfg.learn.lesson+cfg.learn.perfect*ASSUME.perfectFirstTry)/m.lesson*60,`${CONTENT.lessons} lessons once each (+card if perfect)`],
  ['Hidden ball',`${cfg.learn.ball}`,3.5,cfg.learn.ball/3.5*60,`${CONTENT.balls} once each (+card)`],
 ];
 return rows.map(([k,v,min,ph,cap])=>({source:k,coins:v,minutes:min,perHour:ph==null?'—':Math.round(ph),cap}));
}

if(require.main===module){
 const argv=process.argv.slice(2),days=Number(argv[argv.indexOf('--days')+1])||90,json=argv.includes('--json');
 const results=[];for(const cfg of [CURRENT,PROPOSED,withAllBooks(CURRENT),withAllBooks(PROPOSED)])for(const a of Object.keys(ARCHETYPES))results.push(summarize(cfg,a,days));
 if(json){console.log(JSON.stringify({content:CONTENT,assume:{...ASSUME,ballMinutes:'2+3*i/80'},results,sinks:{current:sinkTable(CURRENT),proposed:sinkTable(PROPOSED)},sources:{current:sourceTable(CURRENT),proposed:sourceTable(PROPOSED)}},null,1));process.exit(0);}
 console.log('CONTENT',JSON.stringify(CONTENT));
 console.log(`\nFish EV per catch ${FISH_EV.toFixed(2)} · garden full harvest ${GARDEN_VALUE.reduce((a,b)=>a+b,0)} coins · card trade-in ${trade.CARD_TRADE_COINS}×${trade.CARD_TRADES_PER_DAY}/day`);
 for(const cfg of [CURRENT,PROPOSED]){console.log(`\n== SOURCES (${cfg.name})`);console.table(sourceTable(cfg));console.log(`== SINKS (${cfg.name})`);const t=sinkTable(cfg);console.table(t);console.log('non-pack total (ready books):',t.filter(x=>x.item!=='Books (all 32)').reduce((n,x)=>n+x.total,0),' (all 32 books):',t.filter(x=>x.item!=='Books (ready now)').reduce((n,x)=>n+x.total,0));}
 console.log(`\n== SIMULATION (${days} days)`);
 console.table(results.map(r=>({cfg:r.config,who:r.archetype,'c/sess d1':r.coinsPerSession.day1,'wk1':r.coinsPerSession.wk1,'d8-30':r.coinsPerSession.d8_30,'d31-90':r.coinsPerSession.d31_90,'learn% d1-30':r.learnShare30,pack:r.firstPack,book:r.firstBook,ride:r.firstRide,animal:r.firstCostume,'cards d7%':r.cardsPct.d7,'d30%':r.cardsPct.d30,'d60%':r.cardsPct.d60,'d90%':r.cardsPct.d90,'items d30%':r.itemsPct.d30,'d60%i':r.itemsPct.d60,'d90%i':r.itemsPct.d90,allCards:r.allCards??'-',allBought:r.allBought??'-'})));
 console.table(results.map(r=>({cfg:r.config,who:r.archetype,sessions:r.sessions,empty:r.emptySessions,'empty<done':r.emptyBeforeDone,longestDry:r.longestDry,flooded:r.floodedSessions,'flood<allBought':r.floodedBeforeAllBought,peakIdle:r.peakIdle,paths:r.paths,balls:r.balls,packs:r.packs,earned:r.earned,spent:r.spent,end:r.endBalance})));
}
module.exports={simulate,summarize,withAllBooks,CURRENT,PROPOSED,CONTENT,ASSUME,ARCHETYPES,CARD_LIST,PACK_ITEMS};
