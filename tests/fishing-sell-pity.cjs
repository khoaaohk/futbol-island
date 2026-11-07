// Fishing audit follow-ups (Nov 6 2026, docs/fishing.md "Bad-luck protection, request nudge, night switch, sell where you fish"):
//  6  legendary bad-luck protection (fishingOdds.ts PITY, counts in the fishing log),
//  8  the first-cast request toast (fishingLog.ts requestNudge, FishingLureButton.tsx FishingCatchToast),
//  9  the Fishbook's night fish Day / Sunset / Night switch (timeOfDay.ts requestTimeOfDay, Town.tsx listener),
// 10  Mele and the two boat captains buy fish through the ONE market state (lib/economy.ts MARKET_BUYERS).
// Pure checks plus source scans (no browser). The coin guard for pity is checked here AND in tests/economy.cjs §12.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
require('../scripts/economy-sim.cjs');// registers the .ts / '@/' require hooks
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let checks=0;const ok=(c,m)=>{checks++;assert(c,m);};
const cat=require('../lib/town/fishing/fishCatalog.ts'),O=require('../lib/town/fishing/fishingOdds.ts'),LOG=require('../lib/town/fishing/fishingLog.ts');
const RQ=require('../lib/town/fishing/requests.ts'),E=require('../lib/economy.ts'),MS=require('../lib/town/market/marketStand.ts'),M=require('../lib/town/market/market.ts');
const CAP=require('../lib/town/fishing/boatCaptains.ts'),CAY=require('../lib/town/coralCay.ts'),TD=require('../lib/town/fishing/timeOfDay.ts');
const {FISH_SPOTS,fishById,spotById}=cat;
const kidText=t=>!/%|percent|chance|odds|probab|\b1 in \d|https?:/i.test(t);

// ---- 6. Bad-luck protection ----
let seed=12345;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
const roll=w=>{const e=Object.entries(w),t=e.reduce((a,[,x])=>a+x,0);let p=rnd()*t;for(const [id,x] of e){if(p<x)return id;p-=x;}return e[e.length-1][0];};
/** Mean casts to the first catch of each legendary at a spot, over `runs` fresh players (pity counts exactly as the store keeps them). */
function castsToFirst(spot,runs,pity){const L=O.pitySpecies(spot),tot=Object.fromEntries(L.map(id=>[id,0]));
 for(let r=0;r<runs;r++){let log=LOG.emptyLog();const first={};let n=0;
  while(Object.keys(first).length<L.length&&n<6000){n++;const unc=L.filter(id=>!first[id]),ctx={time:'day',lure:null,legends:[]};
   if(pity){const p=LOG.pityFor(log,spot.id,unc);if(Object.keys(p).length)ctx.pity=p;}
   const id=roll(O.catchWeights(spot,0,ctx));if(pity)log=LOG.bumpPity(log,spot.id,unc,id);
   if(unc.includes(id)){first[id]=n;log=LOG.logCatch(log,{id,size:100,spot:spot.id,now:1,day:'2026-11-06',speciesCaught:1}).log;}}
  for(const id of L)tot[id]+=(first[id]??n)/runs;}
 return tot;}
const RUNS=5000;
{const hw=spotById('harbour-wall'),nr=spotById('north-rocks');
 const base=castsToFirst(hw,RUNS,false)['great-white'],withPity=castsToFirst(hw,RUNS,true)['great-white'];
 ok(base>270&&base<340,`Great White without pity takes about 300 casts (${base.toFixed(0)})`);
 ok(withPity>=150&&withPity<=200,`Great White with pity: 150–200 casts on average (${withPity.toFixed(0)})`);
 const st=castsToFirst(nr,RUNS,true)['sand-tiger'];ok(st>=150&&st<=200,`Sand Tiger with pity: 150–200 casts (${st.toFixed(0)})`);
 // Sharks stay hard: every legendary shark still takes 150+ casts at its spot, and the sharks keep the slowest place among the specials.
 for(const s of FISH_SPOTS){const tot=Object.values(s.weights).reduce((x,y)=>x+y,0);
  // the rare-legendary sharks (under 0.5 % a cast); Summit Cove's Red Reef Shark is a common-ish 2 % special and barely moves (44 → ~38).
  const L=O.pitySpecies(s).filter(id=>fishById(id).group==='shark'&&s.weights[id]/tot<.005);if(!L.length)continue;
  const t=castsToFirst(s,1000,true);for(const id of L)ok(t[id]>=140,`${id} at ${s.id}: still ~150+ casts with pity (${t[id].toFixed(0)}): sharks stay hard`);}
 const coel=castsToFirst(spotById('west-cove'),RUNS,true).coelacanth;ok(coel<withPity,'the Great White stays harder to find than the Coelacanth');}
// No pity, no change: an empty or zero pity is the neutral table, and commons keep their exact ratios under any pity.
for(const s of FISH_SPOTS){
 ok(O.catchWeights(s,0,{time:'day',lure:null,legends:[],pity:{}})===s.weights,`${s.id}: empty pity = the spot's own table`);
 const L=O.pitySpecies(s);if(!L.length)continue;
 const max=Object.fromEntries(L.map(id=>[id,400])),w=O.catchWeights(s,0,{time:'day',lure:null,legends:[],pity:max});
 for(const [id,x] of Object.entries(s.weights))if(fishById(id).rarity!=='legendary')ok(Math.abs(w[id]-x)<1e-12,`${s.id} ${id}: pity never touches a non-legendary weight`);
 for(const id of L)ok(w[id]>=s.weights[id]&&w[id]<=s.weights[id]*O.PITY.cap+1e-9,`${s.id} ${id}: pity at most ${O.PITY.cap}×`);
 // A common id in the pity map is ignored (only legendaries ever gain).
 const c=Object.keys(s.weights).find(id=>fishById(id).rarity==='common');ok(O.catchWeights(s,0,{time:'day',lure:null,legends:[],pity:{[c]:400}})[c]===s.weights[c],`${s.id}: a common never gains pity`);
 // The coin guard: even with every legendary at full pity, under every time × lure mix, the mean catch stays within ±3 % (§12).
 const p0=O.meanPrice(s.weights),v0=O.meanSellValue(s.weights);
 for(const time of ['day','sunset','night'])for(const lure of [null,'panenka','knuckleball','rabona','nutmeg']){const x=O.catchWeights(s,0,{time,lure,legends:[],pity:max});
  ok(Math.abs(O.meanPrice(x)-p0)<=p0*.03+1e-9&&Math.abs(O.meanSellValue(x)-v0)<=v0*.03+1e-9,`${s.id} ${time}/${lure}: full pity keeps the mean catch within ±3 % (${p0.toFixed(2)} → ${O.meanPrice(x).toFixed(2)})`);}}
ok(O.pityMultiplier(0)===1&&O.pityMultiplier(1e6)===O.PITY.cap&&O.pityMultiplier(100)>1,'the multiplier starts at 1 and is capped');
// The log: counts per spot|species, capped, sanitized, merged, cleared on a catch; old saves load with no pity.
{const old=LOG.sanitizeLog({version:1,kinds:{},clues:[]});ok(JSON.stringify(old.pity)==='{}','an old save has no pity yet');
 const bad=LOG.sanitizeLog({pity:{'harbour-wall|great-white':99999,'harbour-wall|mackerel':5,'nowhere|great-white':3,'x':1,'harbour-wall|great-white|x':2,'north-rocks|sand-tiger':-4}});
 ok(bad.pity['harbour-wall|great-white']===400&&Object.keys(bad.pity).length===1,'sanitize keeps only legendary spot|species keys, capped at 400');
 let log=LOG.emptyLog();log=LOG.bumpPity(log,'harbour-wall',['great-white'],'mackerel');log=LOG.bumpPity(log,'harbour-wall',['great-white'],'great-white');
 ok(log.pity['harbour-wall|great-white']===1,'a cast that rolled it does not add a count (it may still swim off: the count stays)');
 const merged=LOG.mergeLogs(log,{...LOG.emptyLog(),pity:{'harbour-wall|great-white':7}});ok(merged.pity['harbour-wall|great-white']===7,'two tabs: the larger count wins');
 const after=LOG.logCatch({...merged,pity:{...merged.pity,'south-pier|octopus':3,'west-pier|octopus':9}},{id:'octopus',size:50,spot:'west-pier',now:1,day:'2026-11-06',speciesCaught:1}).log;
 ok(!after.pity['south-pier|octopus']&&!after.pity['west-pier|octopus']&&after.pity['harbour-wall|great-white']===7,'catching a species clears its pity everywhere, and only its own');
 const store=read('lib/town/fishing/fishingLogStore.ts');
 ok(/uncaughtLegendaries/.test(store)&&/FISHBOOK_STORAGE_KEY/.test(store)&&/bumpPity\(/.test(store)&&/catchWeights\(spot,hot,liveContext\(spot\)\)/.test(store),'the live roll passes the uncaught legendaries\' pity and counts every cast');
 ok(/writeQuiet\(next\)/.test(store),'counting a cast saves quietly (no re-render per bite)');}

// ---- 8. The first-cast request toast ----
{const day='2026-11-06',reqs=RQ.requestsForDay(day);let hits=0;
 for(let d=1;d<=60;d++){const k=`2026-${String(9+Math.floor((d-1)/30)).padStart(2,'0')}-${String((d-1)%30+1).padStart(2,'0')}`,q=RQ.requestsForDay(k)[0];
  for(const s of cat.SHORE_SPOTS){const t=LOG.requestNudge(LOG.emptyLog(),k,s.id);
   if(q.kind==='kinds'){ok(t===null,'a "3 different kinds" request fits any spot: no nudge');continue;}
   if(q.kind==='species'&&fishById(q.target).spots.includes(s.id))ok(t===null,`${k} ${s.id}: this spot already has the fish, no nudge`);
   if(q.kind==='spot'&&q.target===s.id)ok(t===null,`${k}: already at the asked spot, no nudge`);
   if(t){hits++;ok(t.startsWith(q.who)&&t.length<=120&&kidText(t)&&!/\n/.test(t),`${k} ${s.id}: one calm line from ${q.who} (${t})`);}}}
 ok(hits>100,'the nudge shows on most days at most spots');
 const done={...LOG.emptyLog(),req:{day,progress:{},done:reqs.map(q=>q.id),kinds:[]}};ok(cat.SHORE_SPOTS.every(s=>LOG.requestNudge(done,day,s.id)===null),'nothing once every request is done');
 const firstDone={...LOG.emptyLog(),req:{day,progress:{},done:[reqs[0].id],kinds:[]}},t2=LOG.requestNudge(firstDone,day,'farm-beach');ok(!t2||t2.startsWith(reqs[1].who),'it skips to the first UNFINISHED request');
 // A species request names where to look: "Rosa wants a Red Snapper: try Harbour Wall."
 {let seen=0;for(let d=1;d<=28;d++)for(const m of ['01','02','03','04']){const k=`2027-${m}-${String(d).padStart(2,'0')}`,q=RQ.requestsForDay(k)[0];if(q.kind!=='species')continue;
  const away=cat.SHORE_SPOTS.find(s=>!fishById(q.target).spots.includes(s.id)),t=LOG.requestNudge(LOG.emptyLog(),k,away.id);
  ok(t===`${q.text.replace(/\.$/,'')}: try ${fishById(q.target).spots.slice(0,2).map(id=>spotById(id).name).join(' or ')}.`,`species nudge names the spots (${t})`);seen++;}
  ok(seen>5,'species nudges checked');}
 const toast=read('components/FishingLureButton.tsx');
 ok(/requestNudge\(todaysLog\(now\),dayKey\(now\),e\.spot\)/.test(toast)&&/e\.type==='cast'&&!nudged\.current/.test(toast)&&/nudged=useRef\(false\)/.test(toast),'the toast nudges on the FIRST cast of a session only (a ref per mounted HUD)');
 ok(/ms:3000,kind:'request'/.test(toast),'the request nudge shows for 3 s');
 ok(!/data-request-chip|requestChip/.test(read('components/FishingHost.tsx')+toast),'no HUD request chip came back');}

// ---- 9. The Fishbook's night fish switch ----
{const book=read('components/Fishbook.tsx'),css=read('components/Fishbook.module.css'),town=read('components/Town.tsx');
 ok(/sec\.id==='night'&&<TimeSwitch/.test(book)&&/requestTimeOfDay\(t\)/.test(book)&&/readTimeOfDay\(\)/.test(book),'the night section has a Day / Sunset / Night switch writing the island setting');
 ok(/Switch the island to \$\{WHEN_WORD\[f\.when\]\} to find it\./.test(book)&&/Out now/.test(book),'each night or sunset card says how to find it');
 ok(/SET_TIME_EVENT/.test(town)&&/changeTime\(m\)/.test(town),'the island listens and switches its own time (the same changeTime as Settings)');
 ok(TD.SET_TIME_EVENT==='fi2-set-time-of-day'&&TD.TIME_KEY==='fi2-time-of-day','one setting, one event');
 const sw=css.slice(css.indexOf('.timeSwitch'));ok(/min-height:44px/.test(sw),'44 px targets');
 ok((sw.match(/transition:[^;}]+/g)||[]).every(t=>/^transition:(transform|opacity|none)/.test(t)),'the switch animates transform / opacity only');
 ok(!/IslandBrush/.test(sw),'regular sans on the switch buttons');
 ok(CAP.BOAT_CAPTAINS.some(c=>c.lines.some(l=>/Night/.test(l)&&/Fishbook/.test(l))),'a captain tells you about the Fishbook\'s night switch');}

// ---- 10. Sell where you fish ----
{ok(JSON.stringify(Object.keys(E.MARKET_BUYERS))===JSON.stringify(['rosa','farm','marina','kofi']),'four buyers');
 ok(E.buyerTakes('farm','fish')&&E.buyerTakes('farm','produce')&&!E.buyerTakes('farm','beach')&&!E.buyerTakes('farm','cards'),'Mele buys fish and produce');
 for(const b of ['marina','kofi'])ok(E.buyerTakes(b,'fish')&&!E.buyerTakes(b,'produce')&&!E.buyerTakes(b,'cards'),`${b} buys fish only`);
 ok(['fish','produce','beach','cards'].every(k=>E.buyerTakes('rosa',k)),'Rosa still buys everything');
 ok(E.isMarketBuyer('kofi')&&!E.isMarketBuyer('toString')&&!E.isMarketBuyer('shop'),'buyer ids are checked');
 // One source of truth: the quote and the sale know nothing about WHERE you sell, so no buyer can pay more or open a second allowance.
 ok(M.quoteSale.length<=2&&!/place|buyer/.test(M.quoteSale.toString()),'quoteSale has no place: the same prices, ladder and allowance everywhere');
 const stand=read('components/MarketStand.tsx');
 ok(/islandMarket\.sell\(kind\)/.test(stand)&&/sellOneGood\(id,sellPorts\)/.test(stand)&&!/sellOneGood\([^)]*place/.test(stand)&&!/islandMarket\.sell\([^)]*place/.test(stand),'every buyer sells through the same market state and wallet runs');
 ok(/filter\(t=>buyerTakes\(place,t\.id\)\)/.test(stand)&&/rosa&&<MarketCardsSection/.test(stand),'tabs from the buyer table; cards only at Rosa\'s');
 ok(/fishSold\(fishCount\)/.test(stand)&&/fishSold/.test(read('lib/analytics/fishingEvents.ts')),'fish sales count through fishingEvents.fishSold (the number only)');
 ok(!/size/.test(stand.replace(/size=\{\d+\}/g,'')),'no price by size at any stand');
 // Per fish and total: "Sell 1 (… each)" lines and "Sell all fish · N coins" (the same quoteSale).
 ok(/eachText/.test(stand)&&/Sell all \{kind/.test(stand),'shows each fish\'s price and the total');
 // A sale at Mele's or a captain's is the same as at Rosa's: same state in, same coins out (the planner has no place).
 const s0=M.sanitizeMarket({version:1,day:'2026-11-06',basket:{mackerel:3,'red-snapper':1},soldToday:0,sales:0,lifetime:0},'2026-11-06');
 const q=M.quoteSale(s0,'fish'),one=MS.planSellOne(s0,'mackerel');ok(q.coins>0&&one.coins<=q.coins,'one quote for every buyer');
 // The nearest buyer for a full basket: boats → their captain, Coral Cay / causeway end / Summit → Mele, main island → Rosa.
 ok(MS.nearestFishBuyer('deep-sea-boat')==='marina'&&MS.nearestFishBuyer('deep-sea-boat-west')==='kofi','on a boat: its captain');
 for(const id of ['coral-garden','sharks-beach','farm-beach','turtle-bank','summit-cove','summit-palm','summit-lookout','summit-ledge'])ok(MS.nearestFishBuyer(id)==='farm',`${id}: Mele's farm stand is nearer than Rosa`);
 for(const id of ['south-pier','west-pier','harbour-wall','north-rocks','west-cove'])ok(MS.nearestFishBuyer(id)==='rosa',`${id}: Rosa`);
 ok(FISH_SPOTS.filter(s=>!s.deep).every(s=>!['marina','kofi'].includes(MS.nearestFishBuyer(s.id))),'a shore angler is never sent out to a boat');
 ok(MS.FARM_STAND_AT.x===CAY.FARM.stand.x&&MS.FARM_STAND_AT.z===CAY.FARM.stand.z,'the farm stand position matches Coral Cay\'s');
 for(const s of FISH_SPOTS){const t=MS.basketFullLine(s.id);ok(/basket is full/.test(t)&&kidText(t)&&t.length<=140,`${s.id}: basket-full line (${t})`);}
 ok(/Mele/.test(MS.basketFullLine('farm-beach'))&&/Captain Marina/.test(MS.basketFullLine('deep-sea-boat')),'the line names the buyer');
 const toast=read('components/FishingLureButton.tsx');ok(/e\.type==='catch'&&e\.inBasket===false/.test(toast)&&/basketFullLine\(e\.spot\)/.test(toast),'a full basket on a catch shows the line');
 // The captains: a "Sell my fish" action in their chat opens the stand as that captain.
 const acts=CAP.captainSellActions({id:'boat-captain-marina'},()=>{});ok(acts&&acts.length===1&&acts[0].label==='Sell my fish','Captain Marina offers to buy fish');
 ok(CAP.captainSellActions({id:'boat-skipper-kofi'},()=>{})&&!CAP.captainSellActions({id:'farm-mele'},()=>{})&&!CAP.captainSellActions(null,()=>{}),'only the captains');
 ok(/actions=\{captainSellActions\(talkingNpc/.test(read('components/Town.tsx')),'the island conversation passes the captain actions');
 ok(/isMarketBuyer\(pl\)\?pl:'rosa'/.test(read('components/FishingHost.tsx')),'the stand opens for any buyer from the shared event');
 ok(/Sell fish &amp; produce/.test(read('components/IslandJobs.tsx')),'the farm stand prompt says fish and produce');}

console.log(`PASS fishing-sell-pity: ${checks} checks (bad-luck protection, first-cast request nudge, night switch, sell where you fish)`);
