#!/usr/bin/env node
/**
 * Futbol Island economy simulation (docs/economy/ECONOMY_PROPOSAL.md).
 *
 *   node scripts/economy-sim.cjs            # current vs proposed, all archetypes, 90 days
 *   node scripts/economy-sim.cjs --days 60  # other horizon
 *   node scripts/economy-sim.cjs --json     # machine-readable results
 *   node scripts/economy-sim.cjs --days 180 # long horizon (casual players)
 *
 * 29 Sep 2026 (docs/economy/ECONOMY_UPDATE_2026-09-29.md): configs are now BEFORE (the game on 28 Sep: 9 jobs, 80 balls, 32 books,
 * shore fishing only), CURRENT (read live: Coral Cay's Harvest day job, 100 balls, 36 books, the Deep Sea Boat), AFTER_FULL
 * (CURRENT + the Match-day snacks job that is still being added) and PROPOSED (the 29 Sep recommendation). New archetypes
 * casual15 (15 min daily) and the "engaged" label on keen (45 min daily), plus a daily-ceiling table for the job count.
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
const harvestShare=req('lib/town/jobs/harvestShare.ts');
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
// Water fountains were removed (user, Sep 30 2026); kept as a zero-sip stub so the free path reads: breakfast, then garden fruit.
const fountains={FOUNTAIN_FUEL:25};// the water-drink value, unused while fountainSips is 0
const fuel=req('lib/town/fuel.ts'),food=req('lib/konbini/food.ts'),drinkMachines=req('lib/town/drinkMachines.ts');
const stories=req('lib/paths/stories.ts'),upcoming=req('lib/paths/upcomingStories.ts');
const FORMAT_PATHS=req('lib/paths/formatPaths.json');
const QUIZZES=req('lib/town/quizManifest.json');
/** Coral Cay additions (29 Sep 2026) removed again to rebuild the 28 Sep game for the BEFORE config. */
const SEP29={jobs:['farm-harvest','match-day-snacks'],books:['cafu','nadim','kante','oshoala'],ballsBefore:quest.PRE_CORAL_CAY_IDS.length,
 /** Match-day snacks is being added to lib/town/jobs/* by the Coral Cay agent; until it lands the sim assumes the median pay 8. */
 snacksPay:jobs.JOB_BASE_PAY['match-day-snacks']??8};
/** The Garden shift (30 Sep 2026, docs/island-jobs.md §13): the Community Garden as a paid job. Its 8 picks come out of the same
 *  beds as free picking (the session's garden pool), and its gardener's share (2/1/1 items) goes to the basket. */
const SEP30_GARDEN={job:'garden-shift',picks:8};

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
 min:{lesson:4,npc:1.5,story:4,journey:3,explore:2,job:1.5,fishCast:.6,gardenPick:.15,sell:.5,arcadeRound:3,liveRound:3.8,puzzle:1.5,dailyPlay:.5,shop:.7,fountainSip:.15},
 ballMinutes:i=>2+3*i/80,          // hidden balls get harder: 2 min for the first, 5 for the last
 fishSuccess:.8,                    // share of casts that land a fish (bite window 0.7–1.0 s)
 perfectFirstTry:.65,               // quizzes answered perfectly on the first run (earns the card)
 arcadeSkill:{casual:.45,regular:.55,keen:.7}, // share of each game's per-round cap actually earned
 puzzleStars:2.2,
 /** Fuel (30 Sep 2026, docs/economy/FUEL_2026-09-30.md): share of session minutes spent MOVING in each mode (the rest is lessons,
  *  jobs at a spot, fishing, talking, standing). Rides use the bike's rate as their middle. Estimates, not playtest data. */
 travel:{jetpack:.18,bike:.14,sprint:.03,walk:.30},
 /** Water fountains (30 Sep 2026): free sips a child takes in one session. Six fountains stand on the main routes (square, two
  *  pitches, North Beach, Coral Cay court, East Jetty) and each rests 90 s, so a sip is a short stop on the way (min.fountainSip). */
 fountainSips:0,// fountains removed (Sep 30 2026)
};
// How each archetype splits a session (share of minutes). Exhausted activities hand their time to the others.
const ARCHETYPES={
 casual15:{label:'Casual · 15 min daily',minutes:15,plays:()=>true,mix:{balls:25,lessons:15,npc:10,story:3,jobs:15,arcade:17,fish:8,garden:7}},
 casual:{label:'Casual · 10 min, 4 days/week',minutes:10,plays:d=>[0,2,4,5].includes(d%7),mix:{balls:25,lessons:15,npc:10,story:3,jobs:15,arcade:17,fish:8,garden:7}},
 regular:{label:'Regular · 20 min daily',minutes:20,plays:()=>true,mix:{balls:20,lessons:20,npc:10,story:5,jobs:15,arcade:14,fish:8,garden:8}},
 keen:{label:'Engaged (keen) · 45 min daily',minutes:45,plays:()=>true,mix:{balls:15,lessons:20,npc:7,story:5,jobs:18,arcade:17,fish:9,garden:9}},
};
const REPEATABLE=['jobs','arcade','fish','garden'];
/** Minutes one shift of a job takes (lib/town/jobs/jobEconomy.ts JOB_MINUTES + JOB_SHIFT_OVERHEAD_MINUTES; 30 Sep 2026). Jobs the
 *  table does not know (a what-if config) take the old flat ASSUME.min.job. */
const jobMin=id=>id in jobs.JOB_MINUTES?jobs.jobShiftMinutes(id):ASSUME.min.job;

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
 jobIds:jobs.JOB_IDS,balls:CONTENT.balls,excludeBooks:[],fishSpots:fish.FISH_SPOTS,costumeBalls:quest.costumeUnlockBalls,
 /** Harvest day's farmer's share (30 Sep 2026): produce into the basket, sold through the market cap + Training meter. */
 jobShare:harvestShare.jobShare,
};
/** The game on 28 Sep 2026, before Coral Cay: 9 jobs, 80 hidden balls (fox at 80), 32 books, shore fishing only. */
const BEFORE={
 ...CURRENT,name:'before',jobShare:null,learn:{...CURRENT.learn,ball:5},
 jobIds:jobs.JOB_IDS.filter(id=>!SEP29.jobs.includes(id)&&id!==SEP30_GARDEN.job),balls:SEP29.ballsBefore,excludeBooks:SEP29.books,fishSpots:fish.SHORE_SPOTS,
 costumeBalls:id=>{if(id===quest.COIN_REWARD_ID)return SEP29.ballsBefore;const i=quest.COSTUME_UNLOCK_ORDER.indexOf(id);return i<0?SEP29.ballsBefore:Math.min(SEP29.ballsBefore,(Math.floor(i/3)+1)*10);},
};
/** CURRENT plus the second Coral Cay farm job (Match-day snacks), which is still being added: the full 29 Sep game. */
const AFTER_FULL={
 ...CURRENT,name:'after+snacks',
 jobIds:[...new Set([...CURRENT.jobIds,'match-day-snacks'])],jobBase:{...CURRENT.jobBase,'match-day-snacks':SEP29.snacksPay},
};
/** The original recommendation (docs/economy/ECONOMY_PROPOSAL.md §5) as a what-if overlay: it differs from CURRENT only in the
 *  two parts the user declined (the Matchday calendar and 120-coin books). */
const SEP28_PROPOSAL={
 ...CURRENT,name:'sep28-proposal',
 calendar:{every:5,reward:'pack3'},               // Matchday calendar: every 5th play day (not consecutive) → free 3-card pack
 prices:{...CURRENT.prices,book:120},
};
const withAllBooks=cfg=>({...cfg,name:cfg.name+'+allbooks',allBooks:true});
/** The 29 Sep recommendation (ECONOMY_UPDATE_2026-09-29.md: hidden ball 5 → 10 learning coins) is applied in lib/town/learnCoins.ts,
 *  so CURRENT/AFTER_FULL read it live. AFTER_UNCHANGED is the full 29 Sep game WITHOUT it (ball 5), for comparison. */
const AFTER_UNCHANGED={...AFTER_FULL,name:'after,no-change',learn:{...AFTER_FULL.learn,ball:5}};
/** The live game without Harvest day's farmer's share (30 Sep 2026), to measure what the share adds. */
const NO_SHARE={...AFTER_FULL,name:'after,no-share',jobShare:null};
/** The live game without the Garden shift (30 Sep 2026), to measure what the new job adds. */
const NO_GARDEN_SHIFT={...AFTER_FULL,name:'after,no-garden-shift',jobIds:AFTER_FULL.jobIds.filter(id=>id!==SEP30_GARDEN.job)};
const PROPOSED=AFTER_FULL;
/** Fuel (30 Sep 2026): the live game plus fuel spending. policy 'buy' = every missing bit of fuel is bought at the Konbini and drink
 *  machines (the coin worst case); 'mixed' = eat the day's garden picks first (each eaten fruit is a sale given up), then buy;
 *  'free' = a child with no coins to spare: breakfast + garden fruit only, never buys. */
const FUEL_CFG=policy=>({...AFTER_FULL,name:`fuel-${policy}`,fuel:{policy}});
const FUEL_BUY=FUEL_CFG('buy'),FUEL_MIXED=FUEL_CFG('mixed'),FUEL_FREE=FUEL_CFG('free');

// ---- Helpers -------------------------------------------------------------------------------------------------------------
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const fishEV=spots=>{const spotEV=spots.map(s=>{const w=Object.entries(s.weights),tot=w.reduce((n,[,x])=>n+x,0);return w.reduce((n,[id,x])=>n+x/tot*fish.fishById(id).price,0);});return spotEV.reduce((a,b)=>a+b,0)/spotEV.length;};
const FISH_EV=fishEV(fish.FISH_SPOTS);
const GARDEN_VALUE=garden.GARDEN_SPOTS.map(s=>goods.goodById(s.good).price);
/** The book id behind a vending display item (`display:<machine>:book…`). */
const bookOf=it=>it.storyId??Object.entries(books.PLAYER_BOOKS).find(([,b])=>b.itemId===it.id)?.[0];
const pickWeighted=(pool,weight,r)=>{const tot=pool.reduce((n,x)=>n+weight(x),0);if(!tot)return null;let v=r()*tot;for(const x of pool){v-=weight(x);if(v<=0)return x;}return pool[pool.length-1];};

/** Konbini food and machine drinks a child can buy for fuel, best fuel per coin first, with their daily-limit bucket. */
const FUEL_SHOP=[...food.FOOD_MENU.filter(f=>f.shops.includes('main')),...drinkMachines.DRINKS.filter(d=>d.machine==='drinksplaza')]
 .map(f=>({id:f.id,price:f.price,fuel:fuel.foodFuel(f),bucket:f.limit?.key??'food',per:f.limit?.perDay??food.FOOD_PER_DAY}))
 .sort((a,b)=>b.fuel/b.price-a.fuel/a.price||a.price-b.price);
/** Fuel one session uses: minutes × the travel mix × the per-second rates (lib/town/fuel.ts). Learning time drains nothing. */
const fuelDrain=minutes=>Object.entries(ASSUME.travel).reduce((n,[mode,share])=>n+minutes*60*share*fuel.FUEL_RATE[mode],0);
/** A heavy-flyer stress day for the zero-coin path (30 Sep 2026): `minutes` of play, `fly` of it on the jetpack, `walk` on foot.
 *  Breakfast fills the tank, then free fountain sips, then garden fruit cover the rest. Analytic (no RNG); the archetypes above
 *  never drain past breakfast at the current rates, so this is where the fountains show. */
function fuelStress({minutes=90,fly=.5,walk=.3,sips=ASSUME.fountainSips}={}){
 const drain=minutes*60*(fly*fuel.FUEL_RATE.jetpack+walk*fuel.FUEL_RATE.walk),need=Math.max(0,drain-fuel.FUEL_NEW_DAY);
 const used=Math.min(sips,Math.ceil(need/fountains.FOUNTAIN_FUEL)),left=Math.max(0,need-used*fountains.FOUNTAIN_FUEL),picks=Math.ceil(left/FRUIT_FUEL),noFountainPicks=Math.ceil(need/FRUIT_FUEL);
 const garden=n=>n?1+n*ASSUME.min.gardenPick:0;
 return {minutes,flyShare:fly,drain:Math.round(drain),breakfast:fuel.FUEL_NEW_DAY,fountainSips:used,gardenPicks:picks,freeMinutes:+(used*ASSUME.min.fountainSip+garden(picks)).toFixed(2),
  freeMinutesWithoutFountains:+garden(noFountainPicks).toFixed(2)};
}
const FRUIT_FUEL=Object.values(fuel.PRODUCE_FUEL).reduce((a,b)=>a+b,0)/Object.keys(fuel.PRODUCE_FUEL).length;

// ---- One player ------------------------------------------------------------------------------------------------------------
function simulate(cfg,archName,days,seed=7){
 const A=ARCHETYPES[archName],r=rng(seed+archName.length*101),EV=fishEV(cfg.fishSpots),JOBS=cfg.jobIds;
 const s={balance:0,earned:0,spent:0,owned:new Set(),cards:new Set(),balls:0,lessonsDone:0,core:FORMAT_PATHS.map(()=>0),pathOrder:[1,2,0,3],
  finishedPaths:0,cardSrc:{},stories:0,journeys:0,explores:0,jobLife:{},puzzles:0,playDays:0,packsBought:0,firsts:{},log:[],fuel:fuel.FUEL_MAX,fuelCoins:0,fuelShort:0,fuelBought:0,fruitEaten:0};
 const P=cfg.prices;
 // Catalogue of buyable things (ids + category + price + gate).
 const catalog=[];
 for(const it of vending.VENDING_ITEMS){
  if(it.kind==='gear'){const cat=it.storeItem.category,id=it.storeItem.option.id;if(`${cat}:${id}`===`${cat}:classic`)continue;
   if(cat==='ball')catalog.push({id:it.id,cat:'ball',price:P.ball});else catalog.push({id:it.id,cat:'ride',price:P[cat],gate:()=>rides.pathsNeeded(cat,id,CONTENT.paths)<=s.finishedPaths});}
  if(it.kind==='costume')catalog.push({id:it.id,cat:'costume',price:P.costume,gate:()=>s.balls>=cfg.costumeBalls(it.costume)});
 }
 for(const it of vending.VENDING_SPECIALS){
  if(it.kind==='gear')catalog.push({id:it.id,cat:'specialBall',price:P.specialBall});
  if(it.kind==='display'&&!cfg.excludeBooks.includes(bookOf(it)))catalog.push({id:it.id,cat:'book',price:P.book,gate:()=>!!it.storyId||!!cfg.allBooks,future:!it.storyId&&!cfg.allBooks});
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
  let repeatToday=0,marketSold=0,npcToday=0,packsToday=0,picksToday=0;
  const credit=(n,kind)=>{if(n<=0)return 0;let pay=n;
   if(kind==='repeat'&&cfg.softCap){pay=0;for(let i=0;i<n;i++){const t=repeatToday+pay;pay+=t<cfg.softCap.full?1:t<cfg.softCap.half?.5:0;}pay=Math.floor(pay)||(n>0&&repeatToday>=cfg.softCap.half?1:0);}
   if(kind==='repeat')repeatToday+=pay;s.balance+=pay;s.earned+=pay;rec.earned+=pay;if(kind==='learn')rec.learnCoins+=pay;if(kind==='repeat')rec.repeatCoins+=pay;return pay;};
  if(day===1)credit(cfg.starter,'grant');
  let minutes=A.minutes;
  // Fuel 'free' policy: a child with no coins to spare picks extra garden fruit to cover the day (walk there + picks), paid in
  // minutes instead of coins (docs/economy/FUEL_2026-09-30.md, the zero-coin path).
  // Water fountains first (30 Sep 2026, lib/town/waterFountains.ts): free sips at the fountains passed on the way (each rests
  // between sips), then garden fruit for anything still missing.
  if(cfg.fuel&&cfg.fuel.policy==='free'){let need=fuelDrain(A.minutes)-Math.max(s.fuel,fuel.FUEL_NEW_DAY);
   if(need>0){const sips=Math.min(ASSUME.fountainSips,Math.ceil(need/fountains.FOUNTAIN_FUEL));s.fountainSips=(s.fountainSips||0)+sips;s.freeMinutes=(s.freeMinutes||0)+sips*ASSUME.min.fountainSip;minutes-=sips*ASSUME.min.fountainSip;s.fuel=Math.max(s.fuel,fuel.FUEL_NEW_DAY)+sips*fountains.FOUNTAIN_FUEL;need-=sips*fountains.FOUNTAIN_FUEL;}
   if(need>0){const picks=Math.ceil(need/FRUIT_FUEL);s.freePicks=(s.freePicks||0)+picks;s.freeMinutes=(s.freeMinutes||0)+1+picks*ASSUME.min.gardenPick;minutes-=1+picks*ASSUME.min.gardenPick;s.fuel=Math.max(s.fuel,fuel.FUEL_NEW_DAY)+picks*FRUIT_FUEL;s.fruitEaten+=picks;}}
  credit(cfg.dailyPlay,'grant');minutes-=ASSUME.min.dailyPlay;
  if(cfg.calendar&&s.playDays%cfg.calendar.every===0){s.freePacks=(s.freePacks||0)+1;}
  minutes-=ASSUME.min.shop; // a vending visit per session
  // What is still available to do today.
  const jobsToday={};let basket=0,gardenLeft=[...GARDEN_VALUE],arcadeGame=0;
  const nextLesson=()=>{const p=s.pathOrder.find(i=>s.core[i]<CONTENT.coreLessons[i]);return p!==undefined?{core:p}:s.lessonsDone<CONTENT.lessons?{extra:true}:null;};
  const can={
   balls:()=>s.balls<cfg.balls,lessons:()=>!!nextLesson(),npc:()=>npcToday<cfg.npcPicks,
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
   jobs:()=>{const pay=id=>{const done=jobsToday[id]||0,base=cfg.jobBase[id];return (done<cfg.fullPay?base:done<cfg.fullPay+cfg.halfPay?Math.ceil(base/2):cfg.tip)+(s.jobLife[id]?0:cfg.firstJob);};
    // 30 Sep 2026: each job takes its own shift time (jobEconomy JOB_MINUTES + overhead; the short jobs still average 1.5 min).
    // The child picks the best pay per minute among the jobs that fit the time left (a 4-min drill is not started at the bell).
    const fit=JOBS.filter(x=>jobMin(x)<=minutes+.5),pool=fit.length?fit:JOBS;
    const id=pool.reduce((b,x)=>pay(x)/jobMin(x)>pay(b)/jobMin(b)?x:b,pool[Math.floor(r()*pool.length)]);minutes-=jobMin(id);credit(pay(id),'repeat');
    if(cfg.jobShare){const done=jobsToday[id]||0,tier=done<cfg.fullPay?'full':done<cfg.fullPay+cfg.halfPay?'half':'tip';for(const l of cfg.jobShare(id,tier,s.jobLife[id]||0,[]))for(let k=0;k<l.count;k++)addGood(goods.goodById(l.id).price);}
    if(id===SEP30_GARDEN.job)gardenLeft.splice(0,SEP30_GARDEN.picks);// the shift's picks go to the crate, not the basket
    jobsToday[id]=(jobsToday[id]||0)+1;s.jobLife[id]=(s.jobLife[id]||0)+1;},
   arcade:()=>{const games=['runner','pinball','tennis','live','puzzle'],g=games[arcadeGame++%games.length];
    if(g==='puzzle'){minutes-=ASSUME.min.puzzle;s.balance-=cfg.puzzleCost;s.spent+=cfg.puzzleCost;if(s.puzzles<CONTENT.puzzles){s.puzzles++;credit(cfg.puzzleFirst+Math.round(ASSUME.puzzleStars),'repeat');}else credit(cfg.puzzleRepeat,'repeat');return;}
    if(s.balance<cfg.arcadeCost){minutes-=.2;return;}
    minutes-=g==='live'?ASSUME.min.liveRound:ASSUME.min.arcadeRound;s.balance-=cfg.arcadeCost;s.spent+=cfg.arcadeCost;credit(Math.round(cfg.arcadeCaps[g]*ASSUME.arcadeSkill[archName]*(.8+.4*r())),'repeat');},
   fish:()=>{minutes-=ASSUME.min.fishCast;if(r()<ASSUME.fishSuccess)addGood(Math.round(EV*(.6+.8*r())));},
   garden:()=>{minutes-=ASSUME.min.gardenPick;picksToday++;addGood(gardenLeft.pop());},
  };
  let guard=0;
  while(minutes>0.2&&guard++<500){
   const open=Object.entries(A.mix).filter(([k])=>can[k]());if(!open.length)break;
   const [k]=pickWeighted(open,([,w])=>w,r);step[k]();
  }
  sellBasket();
  // Fuel (docs/economy/FUEL_2026-09-30.md): breakfast lifts the tank to FUEL_NEW_DAY, the session's travel drains it, and the
  // child refuels by the config's policy before spending on goals. Walking always works, so a shortfall only means more walking.
  if(cfg.fuel){let f=Math.max(s.fuel,fuel.FUEL_NEW_DAY);const drain=fuelDrain(A.minutes);let need=drain-f+fuel.FUEL_LOW*.4;// keep a little in the tank
   if(need>0&&cfg.fuel.policy!=='buy'){const fruit=Math.min(picksToday,Math.ceil(need/FRUIT_FUEL));if(fruit>0){const lost=Math.round(fruit*GARDEN_VALUE.reduce((a,b)=>a+b,0)/GARDEN_VALUE.length);
     s.balance-=Math.min(lost,s.balance);s.fruitEaten+=fruit;f+=fruit*FRUIT_FUEL;need-=fruit*FRUIT_FUEL;}}
   if(need>0&&cfg.fuel.policy!=='free'){const used={};for(const it of FUEL_SHOP){while(need>0&&(used[it.bucket]||0)<it.per&&s.balance>=it.price){used[it.bucket]=(used[it.bucket]||0)+1;s.balance-=it.price;s.spent+=it.price;s.fuelCoins+=it.price;rec.fuelCoins=(rec.fuelCoins||0)+it.price;s.fuelBought++;f+=it.fuel;need-=it.fuel;}}}
   if(f<drain)s.fuelShort++;
   s.fuel=Math.max(0,Math.min(fuel.FUEL_MAX,f-drain));}
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
/** Mean of the headline numbers over several seeds (a single seed moves "all bought" by a few days either way). */
function averaged(cfg,arch,days,seeds=20){
 const acc={coinsPerDay:0,coinsPerWeek:0,learnPct:0,firstBook:0,saveDaysPerBook:0,allCards:0,allBought:0,emptyBeforeDone:0,fuelCoinsPerDay:0,fuelSharePct:0,fuelShortDays:0,fruitPerDay:0,freeMinPerDay:0,fountainPerDay:0};
 for(let seed=1;seed<=seeds;seed++){const r=simulate(cfg,arch,days,seed),f=r.state.firsts,p=r.days.filter(d=>d.played&&d.day>=8&&d.day<=30),w=r.days.filter(d=>d.day>=8&&d.day<=28);
  const perDay=p.reduce((n,d)=>n+d.earned,0)/p.length,learn=p.reduce((n,d)=>n+d.learnCoins,0)/Math.max(1,p.reduce((n,d)=>n+d.earned,0));
  acc.coinsPerDay+=perDay;acc.coinsPerWeek+=w.reduce((n,d)=>n+d.earned,0)/3;acc.learnPct+=100*learn;acc.firstBook+=f.book??days;acc.saveDaysPerBook+=cfg.prices.book/perDay;
  acc.allCards+=f.allCards??days;acc.allBought+=f.allBought??days;acc.emptyBeforeDone+=r.emptyPre;
  const fc=p.reduce((n,d)=>n+(d.fuelCoins||0),0)/p.length;acc.fuelCoinsPerDay+=fc;acc.fuelSharePct+=100*fc/perDay;acc.fuelShortDays+=r.state.fuelShort;acc.fruitPerDay+=r.state.fruitEaten/Math.max(1,r.sessions);acc.freeMinPerDay+=(r.state.freeMinutes||0)/Math.max(1,r.sessions);acc.fountainPerDay+=(r.state.fountainSips||0)/Math.max(1,r.sessions);}
 return Object.fromEntries(Object.entries(acc).map(([k,v])=>[k,+(v/seeds).toFixed(k==='saveDaysPerBook'||k==='fuelCoinsPerDay'||k==='fruitPerDay'||k==='freeMinPerDay'||k==='fountainPerDay'?1:0)]));
}
function sinkTable(cfg){
 const P=cfg.prices,n=(cat)=>{let c=0;for(const it of vending.VENDING_ITEMS){if(it.kind==='gear'&&it.storeItem.option.id!=='classic'&&(cat==='ball'?it.storeItem.category==='ball':it.storeItem.category===cat))c++;if(cat==='costume'&&it.kind==='costume')c++;}return c;};
 const specials=vending.VENDING_SPECIALS.filter(i=>i.kind==='gear').length;
 const bookCount=vending.VENDING_SPECIALS.filter(i=>i.kind==='display'&&(i.storyId||cfg.allBooks)&&!cfg.excludeBooks.includes(bookOf(i))).length;
 const rows=[['Balls',n('ball'),P.ball],['Special balls',specials,P.specialBall],['Scooters',n('scooter'),P.scooter],['Bikes',n('bike'),P.bike],['Mopeds',n('moped'),P.moped],['Flight',n('jetpack'),P.jetpack],['Island animals',n('costume'),P.costume],['Books',bookCount,P.book]];
 return rows.map(([k,c,p])=>({item:k,count:c,price:p,total:c*p}));
}
const sinkTotal=cfg=>sinkTable(cfg).reduce((n,x)=>n+x.total,0);
/** Coins one full learning run pays (every lesson, ball, story, stage, explore item and path once), at the assumed perfect rate. */
function learnPool(cfg){const L=cfg.learn;return Math.round(CONTENT.lessons*(L.lesson+L.perfect*ASSUME.perfectFirstTry)+cfg.balls*L.ball+CONTENT.stories*L.story+CONTENT.journeyStages*L.journey+CONTENT.exploreCards*L.explore+CONTENT.paths*L.path);}
/**
 * The most a player can earn from island jobs in one day (the "daily ceiling" question: does every new job add 2 more full-pay
 * shifts?). Raw = every job's 2 full + 2 half shifts, no Training meter; metered = the same shifts through dailyMeter.trainingPay
 * (the one daily budget shared by jobs, arcade payouts, market sales and trade-ins). First-job bonuses excluded (one-off).
 */
function jobCeiling(cfg){
 const shifts=[];for(const id of cfg.jobIds){const b=cfg.jobBase[id]??8;for(let k=0;k<cfg.fullPay;k++)shifts.push(b);for(let k=0;k<cfg.halfPay;k++)shifts.push(Math.ceil(b/2));}
 shifts.sort((a,b)=>b-a);const raw=shifts.reduce((a,b)=>a+b,0);let paid=0;for(const c of shifts)paid+=meter.trainingPay(paid,c);
 return {jobs:cfg.jobIds.length,rawJobCeiling:raw,meteredJobCeiling:paid,trainingBudget:`${cfg.softCap.full} full, then half pay until ${cfg.softCap.half} paid, then 1-coin tips`,
  firstJobBonuses:cfg.jobIds.length*cfg.firstJob,totalShifts:shifts.length,
  shiftsToFillMeter:(()=>{let p=0,k=0;while(meter.trainingTier(p)!=='tip'&&k<shifts.length)p+=meter.trainingPay(p,shifts[k++]);return k;})()};
}
function sourceTable(cfg){
 const ids=cfg.jobIds,jobAvg=ids.reduce((a,id)=>a+(cfg.jobBase[id]??8),0)/ids.length,jobMinAvg=ids.reduce((a,id)=>a+jobMin(id),0)/ids.length,m=ASSUME.min,pays=ids.map(id=>cfg.jobBase[id]??8),EV=fishEV(cfg.fishSpots);
 const rows=[
  ['Island job (full pay)',`${Math.min(...pays)}–${Math.max(...pays)} (avg ${jobAvg.toFixed(1)}), ${ids.length} jobs`,+jobMinAvg.toFixed(2),jobAvg/jobMinAvg*60,`${cfg.fullPay} full + ${cfg.halfPay} half per job, then ${cfg.tip}; +${cfg.firstJob} first time; Training meter`],
  ['Fishing (per cast)',`${EV.toFixed(1)} avg/fish (${cfg.fishSpots.length} spots)`,m.fishCast,EV*ASSUME.fishSuccess/m.fishCast*60,`market: full price to ${cfg.marketFull}/day, then half; Training meter`],
  ['Garden (per pick)',`${(GARDEN_VALUE.reduce((a,b)=>a+b,0)/GARDEN_VALUE.length).toFixed(1)} avg`,m.gardenPick,GARDEN_VALUE.reduce((a,b)=>a+b,0)/GARDEN_VALUE.length/m.gardenPick*60,`${GARDEN_VALUE.length} spots, regrow 3–4 min; shares market cap`],
  ...['runner','pinball','tennis','live'].map(g=>[`Arcade ${g} (net of ${cfg.arcadeCost})`,`cap ${cfg.arcadeCaps[g]}`,g==='live'?m.liveRound:m.arcadeRound,(cfg.arcadeCaps[g]*.55-cfg.arcadeCost)/(g==='live'?m.liveRound:m.arcadeRound)*60,'Training meter']),
  ['Pass puzzle first solve',`${cfg.puzzleFirst}+stars (entry ${cfg.puzzleCost})`,m.puzzle,(cfg.puzzleFirst+ASSUME.puzzleStars-cfg.puzzleCost)/m.puzzle*60,`${CONTENT.puzzles} puzzles once; repeat pays ${cfg.puzzleRepeat}`],
  ['Daily play',`${cfg.dailyPlay}`,m.dailyPlay,null,'once a day after 30 s walking'],
  ['Lesson quiz',`${cfg.learn.lesson}+${cfg.learn.perfect} perfect`,m.lesson,(cfg.learn.lesson+cfg.learn.perfect*ASSUME.perfectFirstTry)/m.lesson*60,`${CONTENT.lessons} lessons once each (+card if perfect)`],
  ['Hidden ball',`${cfg.learn.ball}`,3.5,cfg.learn.ball/3.5*60,`${cfg.balls} once each (+card)`],
 ];
 return rows.map(([k,v,min,ph,cap])=>({source:k,coins:v,minutes:min,perHour:ph==null?'—':Math.round(ph),cap}));
}

if(require.main===module){
 const argv=process.argv.slice(2),days=Number(argv[argv.indexOf('--days')+1])||90,json=argv.includes('--json');
 const CONFIGS=[BEFORE,AFTER_UNCHANGED,CURRENT,NO_GARDEN_SHIFT,AFTER_FULL],WHO=['casual15','keen','casual','regular'];
 const seeds=Number(argv[argv.indexOf('--seeds')+1])||20;
 const results=[];for(const cfg of CONFIGS)for(const a of WHO)results.push(summarize(cfg,a,days));
 const budget=CONFIGS.map(c=>({config:c.name,ownEverything:sinkTotal(c),learnPool:learnPool(c),...jobCeiling(c),fishEV:+fishEV(c.fishSpots).toFixed(2)}));
 if(json){console.log(JSON.stringify({content:CONTENT,assume:{...ASSUME,ballMinutes:'2+3*i/80'},results,budget,sinks:Object.fromEntries(CONFIGS.map(c=>[c.name,sinkTable(c)])),sources:Object.fromEntries(CONFIGS.map(c=>[c.name,sourceTable(c)]))},null,1));process.exit(0);}
 console.log('CONTENT',JSON.stringify(CONTENT));
 console.log(`\nFish EV per catch: shore ${fishEV(fish.SHORE_SPOTS).toFixed(2)}, deep-sea boat ${fishEV(fish.FISH_SPOTS.filter(s=>s.boat)).toFixed(2)}, all spots ${FISH_EV.toFixed(2)} · garden full harvest ${GARDEN_VALUE.reduce((a,b)=>a+b,0)} coins · card trade-in ${trade.CARD_TRADE_COINS}×${trade.CARD_TRADES_PER_DAY}/day`);
 for(const cfg of [BEFORE,AFTER_FULL]){console.log(`\n== SOURCES (${cfg.name})`);console.table(sourceTable(cfg));console.log(`== SINKS (${cfg.name})`);console.table(sinkTable(cfg));console.log('own-everything total (excl. packs):',sinkTotal(cfg));}
 console.log('\n== JOB PAY PER MINUTE (full pay ÷ shift minutes; 30 Sep 2026 wall-rebounds parity)');
 console.table(jobs.JOB_IDS.map(id=>({job:id,pay:jobs.JOB_BASE_PAY[id],playMin:jobs.JOB_MINUTES[id],shiftMin:+jobMin(id).toFixed(2),coinsPerMin:+jobs.jobCoinsPerMinute(id).toFixed(2)})));
 console.log('\n== BUDGET: own-everything cost, one-off learning pool, daily job ceiling (raw vs Training meter)');console.table(budget);
 console.log(`\n== ${seeds}-SEED AVERAGES (${Math.max(days,200)} days; single runs vary by ±3 days)`);
 console.table(CONFIGS.flatMap(c=>['casual15','regular','keen'].map(a=>({cfg:c.name,who:a,...averaged(c,a,Math.max(days,200),seeds)}))));
 console.log(`\n== FUEL (${seeds}-seed means, ${Math.max(days,200)} days): drain per session = ${['casual15','regular','keen'].map(a=>`${a} ${Math.round(fuelDrain(ARCHETYPES[a].minutes))}`).join(', ')} fuel; breakfast ${fuel.FUEL_NEW_DAY}`);
 console.table([AFTER_FULL,FUEL_BUY,FUEL_MIXED,FUEL_FREE].flatMap(c=>['casual15','regular','keen'].map(a=>{const r=averaged(c,a,Math.max(days,200),seeds);return {cfg:c.name,who:a,coinsPerDay:r.coinsPerDay,fuelCoinsPerDay:r.fuelCoinsPerDay,'fuel % of income':r.fuelSharePct,fruitPerDay:r.fruitPerDay,fountainSipsPerDay:r.fountainPerDay,'free refuel min/day':r.freeMinPerDay,shortDays:r.fuelShortDays,allBought:r.allBought,emptyBeforeDone:r.emptyBeforeDone};})));
 console.log('\n== ZERO-COIN PATH STRESS (heavy flyers; breakfast → water fountains → garden fruit)');
 console.table([{minutes:45,fly:.5},{minutes:90,fly:.5},{minutes:120,fly:.6}].map(o=>fuelStress(o)));
 console.log(`\n== SIMULATION (${days} days, seed 7)`);
 console.table(results.map(r=>({cfg:r.config,who:r.archetype,'c/sess d1':r.coinsPerSession.day1,'wk1':r.coinsPerSession.wk1,'d8-30':r.coinsPerSession.d8_30,'d31-90':r.coinsPerSession.d31_90,'learn% d1-30':r.learnShare30,pack:r.firstPack,book:r.firstBook,ride:r.firstRide,animal:r.firstCostume,'cards d30%':r.cardsPct.d30,'d90%':r.cardsPct.d90,'items d30%':r.itemsPct.d30,'d90%i':r.itemsPct.d90,allCards:r.allCards??'-',allBought:r.allBought??'-'})));
 console.table(results.map(r=>({cfg:r.config,who:r.archetype,sessions:r.sessions,'empty<done':r.emptyBeforeDone,longestDry:r.longestDry,'flood<allBought':r.floodedBeforeAllBought,peakIdle:r.peakIdle,paths:r.paths,balls:r.balls,packs:r.packs,earned:r.earned,spent:r.spent,end:r.endBalance})));
}
module.exports={jobMin,fuelStress,NO_SHARE,NO_GARDEN_SHIFT,SEP30_GARDEN,FUEL_BUY,FUEL_MIXED,FUEL_FREE,FUEL_SHOP,fuelDrain,simulate,summarize,averaged,withAllBooks,AFTER_UNCHANGED,sinkTable,sinkTotal,sourceTable,jobCeiling,learnPool,fishEV,BEFORE,CURRENT,AFTER_FULL,PROPOSED,SEP28_PROPOSAL,SEP29,CONTENT,ASSUME,ARCHETYPES,CARD_LIST,PACK_ITEMS};
