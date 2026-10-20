#!/usr/bin/env node
/**
 * Play-session economy model (Oct 14 2026 rebalance, docs/economy.md). Companion to scripts/economy-sim.cjs (the 200-day
 * collection sim): this one answers "how many coins does ONE session earn, and how many sessions does a thing cost?"
 *
 *   node scripts/economy-sessions.cjs          # tables: per-minute rates, sessions, sessions-to-buy, before / now / after
 *   node scripts/economy-sessions.cjs --json
 *
 * Three configs:
 *  - before: the game on 11 Oct 2026, before the recent earning boosts (13 shore/boat/cay fishing spots and the old cast,
 *            no Summit Isle fruit trees, no Summit Kick, no beachcombing): the 28 Sep – 30 Sep economy values.
 *  - now:    the game on 14 Oct 2026 BEFORE this rebalance: 16 spots and the farther, quicker cast, the fruit trees (8 a day),
 *            Summit Kick (2 a hoop + 4), beachcombing at its placeholder values, every price and pay unchanged.
 *  - after:  the same content with lib/economy.ts as it is now (read live, plus the real market quote and Training meter).
 * Every number in `after` is read from the game code; `before` / `now` are literal snapshots of the old values (they no longer
 * exist in the code). Minutes per activity are ESTIMATES (ASSUME below), not playtest data: they are what the targets are
 * measured against, and tests/economy.cjs asserts the targets on this model.
 *
 * Deterministic: catches and finds are drawn from the real spot / beach weights with a seeded RNG, averaged over SEEDS sessions.
 */
'use strict';
const path=require('path'),fs=require('fs'),Module=require('module');
const ROOT=path.resolve(__dirname,'..');
const ts=require(path.join(ROOT,'node_modules/typescript'));
if(!require.extensions['.ts'])require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText,f);
const resolve=Module._resolveFilename;
if(!Module._resolveFilename.__fiSessions){Module._resolveFilename=function(request,parent,...rest){
 if(request.startsWith('@/'))request=path.join(ROOT,request.slice(2));
 if((request.startsWith('.')||path.isAbsolute(request))&&!path.extname(request)&&parent?.filename){const abs=path.resolve(path.dirname(parent.filename),request);for(const ext of ['.ts','.tsx'])if(fs.existsSync(abs+ext))return abs+ext;}
 return resolve.call(this,request,parent,...rest);};Module._resolveFilename.__fiSessions=true;}
if(!global.localStorage){const mem=new Map();global.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};}
const req=p=>require(path.join(ROOT,p));

const E=req('lib/economy.ts');
const jobs=req('lib/town/jobs/jobEconomy.ts');
const meter=req('lib/town/dailyMeter.ts');
const market=req('lib/town/market/market.ts');
const goods=req('lib/town/market/goods.ts');
const fish=req('lib/town/fishing/fishCatalog.ts');
const garden=req('lib/town/jobs/garden.ts');
const forage=req('lib/town/summitForage.ts');
const kick=req('lib/town/summitKick.ts');
const learn=req('lib/town/learnCoins.ts');
let beach=null;try{beach=req('lib/town/beachcombing.ts');}catch{/* beachcombing not in this checkout: modelled from the economy table */}

// ---- Assumptions (estimates) ---------------------------------------------------------------------------------------------
const ASSUME={
 min:{
  lesson:4,ball:3.5,dailyPlay:.5,
  /** One cast to a landed-or-missed fish incl. walking between spots and the amortised trip to Rosa (basket 20). Before 12 Oct:
   *  13 spots, shorter casts, more walking between posts: .75. Now: 16 spots (a post is always near) and the quicker cast loop: .6. */
  fishCastBefore:.75,fishCast:.6,
  /** A Summit Isle fruit incl. the walk between fruit trees and the amortised trip off the island to a farm stand. */
  forageFruit:.5,
  /** A community-garden pick incl. walking between beds and the trip to Rosa's stand 50 m away with a full basket. */
  gardenPick:.2,
  /** A beach find incl. walking the sand between finds (23 a day over three islands) and the amortised trip to Rosa. */
  beachFind:.5,
  arcadeRound:3,liveRound:3.8,kickRound:1.5,
 },
 fishLand:.8,perfectFirstTry:.65,
 arcadeSkill:{typical:.55,grinder:.7},
 kickHits:{typical:3,grinder:4.2},
};
const SEEDS=60;

// ---- Configs -------------------------------------------------------------------------------------------------------------
/** Old values (the code before 14 Oct 2026). */
const OLD={
 learn:{quiz:12,quizPerfect:6,ball:10},daily:30,meter:{full:60,half:120},
 jobPay:{'leaf-rake':8,'wall-rebounds':26,'ball-kid':10,'cone-setup':7,'line-painter':8,'court-cleanup':7,'offside-flag':9,'ball-pump':10,'goal-anchor':8,'farm-harvest':8,'match-day-snacks':8,'garden-shift':10,'trail-cleanup':8},
 produce:{orange:3,cherry:3,strawberry:2,tomato:2,carrot:2,banana:2,mango:3,pepper:2,greens:2,'sweet-potato':2,coconut:3,papaya:3,lime:2,guava:3,avocado:3},
 beach:{common:2,uncommon:3,rare:5,legendary:10},
 kick:{perHoop:2,perfect:4},allowance:40,
 prices:{pack3:40,arcade:3,ball:150,boots:200,jersey:300},
};
const SHORE_BEFORE=fish.FISH_SPOTS.filter(s=>s.area!=='summit');// 13 spots before Summit Isle's three (12–13 Oct)
const CONFIGS={
 before:{name:'before',label:'Before (11 Oct)',learn:OLD.learn,daily:OLD.daily,meter:OLD.meter,jobPay:OLD.jobPay,allowance:OLD.allowance,ladder:false,
  fishValue:f=>f.price,produceValue:id=>OLD.produce[id]??2,beachValue:null,fishSpots:SHORE_BEFORE,fishCast:ASSUME.min.fishCastBefore,forage:false,kick:null,prices:OLD.prices},
 now:{name:'now',label:'Now, no rebalance (14 Oct)',learn:OLD.learn,daily:OLD.daily,meter:OLD.meter,jobPay:OLD.jobPay,allowance:OLD.allowance,ladder:false,
  fishValue:f=>f.price,produceValue:id=>OLD.produce[id]??2,beachValue:f=>f.care==='sell'?OLD.beach[f.rarity]:0,fishSpots:fish.FISH_SPOTS,fishCast:ASSUME.min.fishCast,forage:true,kick:OLD.kick,prices:OLD.prices},
 after:{name:'after',label:'After rebalance',learn:{quiz:learn.LEARN_COINS.quiz,quizPerfect:learn.LEARN_COINS.quizPerfect,ball:learn.LEARN_COINS.ball},daily:E.DAILY_PLAY_COINS,
  meter:{full:meter.TRAINING_FULL_COINS,half:meter.TRAINING_HALF_COINS},jobPay:jobs.JOB_BASE_PAY,allowance:market.MARKET_FULL_PRICE_COINS,ladder:true,
  fishValue:f=>goods.goodById(f.id).price,produceValue:id=>goods.goodById(id)?.price??E.produceSellValue(id,2),beachValue:f=>f.care==='sell'?(goods.goodById(f.id)?.price??E.beachFindValue(f)):0,
  fishSpots:fish.FISH_SPOTS,fishCast:ASSUME.min.fishCast,forage:true,kick:kick.KICK_COINS,
  prices:{pack3:E.PACK_PRICES.pack3,arcade:E.ARCADE_PLAY_COST,ball:E.BALL_PRICES.base,boots:E.BOOT_PRICES.base,jersey:E.JERSEY_PRICES.base}},
};

// ---- Helpers -------------------------------------------------------------------------------------------------------------
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const pick=(entries,r)=>{const tot=entries.reduce((n,[,w])=>n+w,0);let v=r()*tot;for(const [k,w] of entries){v-=w;if(v<=0)return k;}return entries[entries.length-1][0];};
const median=a=>{const b=[...a].sort((x,y)=>x-y),m=b.length>>1;return b.length%2?b[m]:(b[m-1]+b[m])/2;};
/** Jobs in the order a kid would pick them (best coins a minute first); a rotation keeps every shift at full pay. */
// Only the jobs that existed in that config (the 'before' table predates Summit Isle's bug jobs, 20 Oct 2026).
const jobOrder=cfg=>[...jobs.JOB_IDS].filter(id=>cfg.jobPay[id]!=null).sort((a,b)=>cfg.jobPay[b]/jobs.jobShiftMinutes(b)-cfg.jobPay[a]/jobs.jobShiftMinutes(a));
const fishTable=spots=>{const w=new Map();for(const s of spots){const ent=Object.entries(s.weights),tot=ent.reduce((n,[,x])=>n+x,0);for(const [id,x] of ent)w.set(id,(w.get(id)||0)+x/tot/spots.length);}return [...w];};
const FRUIT=forage.FRUIT_KINDS??['mango','orange','coconut'];
const GARDEN_GOODS=garden.GARDEN_SPOTS.map(s=>s.good);
const beachPool=()=>beach?beach.BEACH_FINDS.map(f=>[f,f.weight??beach.BEACH_RARITY_WEIGHT[f.rarity]]):[];

/**
 * The model's farmers market: a basket of good ids sold at the end of the session, by the config's rules. For `after` this IS the
 * game's quoteSale (lib/town/market/market.ts) on a fresh day; for the old configs it is the old rule (full price, then half after
 * the allowance, at least 1).
 */
function sellBasket(cfg,ids,priceOf,day){
 if(cfg.ladder){const basket={};for(const id of ids)basket[id]=(basket[id]||0)+1;
  const s={...(day.state??market.emptyMarket('2026-10-14')),basket},q=market.quoteSale(s);
  day.state=market.withTallies({...s,basket:{},soldToday:s.soldToday+q.coins},q);return q.coins;}
 let coins=0;for(const id of ids){const p=priceOf(id),pay=(day.sold||0)>=cfg.allowance?Math.max(1,Math.floor(p/2)):p;day.sold=(day.sold||0)+pay;coins+=pay;}return coins;
}
const meterPay=(cfg,paid,raw)=>{const start=Math.max(0,paid),amount=Math.max(0,Math.floor(raw));if(!amount)return 0;let pay=0;
 for(let i=0;i<amount;i++){const t=start+pay;if(t<cfg.meter.full)pay+=1;else if(t<cfg.meter.half)pay+=.5;else break;}return Math.max(1,Math.floor(pay));};

// ---- Sessions ------------------------------------------------------------------------------------------------------------
/** Minutes per activity. A config without an activity gives its minutes to the nearest one it has (forage → garden, beach →
 *  fishing, kick → arcade). `jobs`/`arcade` minutes are spent shift by shift / round by round. */
const PROFILES={
 typical15:{label:'Typical kid, 15 min',who:'typical',minutes:15,plan:{daily:.5,lesson:4,ball:3.5,jobs:1.6,fish:3,forage:2.2}},
 grinder15:{label:'Grinder, 15 min',who:'grinder',minutes:15,plan:{daily:.5,fish:7,forage:4,jobs:3.5}},
 typical45:{label:'Typical kid, 45 min',who:'typical',minutes:45,plan:{daily:.5,lesson:12,ball:7,jobs:5,fish:7,forage:4,beach:3,arcade:3,kick:3.5}},
 grinder45:{label:'Grinder, 45 min',who:'grinder',minutes:45,plan:{daily:.5,fish:16,forage:5,garden:3,beach:6,jobs:10,kick:4.5}},
};
function session(cfg,profileId,seed){
 const P=PROFILES[profileId],r=rng(seed*7919+profileId.length),out={learn:0,daily:0,jobs:0,market:0,arcade:0,kick:0,total:0,raw:{}};
 const plan={...P.plan};
 if(!cfg.forage&&plan.forage){plan.garden=(plan.garden||0)+plan.forage;delete plan.forage;}
 if(!cfg.beachValue&&plan.beach){plan.fish=(plan.fish||0)+plan.beach;delete plan.beach;}
 if(!cfg.kick&&plan.kick){plan.arcade=(plan.arcade||0)+plan.kick;delete plan.kick;}
 let metered=0;const repeat=(k,raw)=>{const p=meterPay(cfg,metered,raw);metered+=p;out[k]+=p;out.raw[k]=(out.raw[k]||0)+raw;};
 const basket=[];const prices=new Map();
 // learning first (a typical kid's session starts with the day's lesson), then chores, then gathering; sold at the end.
 out.daily+=cfg.daily;
 for(let m=plan.lesson||0;m>=ASSUME.min.lesson-1e-9;m-=ASSUME.min.lesson)out.learn+=cfg.learn.quiz+(r()<ASSUME.perfectFirstTry?cfg.learn.quizPerfect:0);
 for(let m=plan.ball||0;m>=ASSUME.min.ball-1e-9;m-=ASSUME.min.ball)out.learn+=cfg.learn.ball;
 const order=jobOrder(cfg);let jm=plan.jobs||0,k=0;
 while(jm>0&&k<order.length*4){const id=order[k%order.length],tier=Math.floor(k/order.length),min=jobs.jobShiftMinutes(id);if(min>jm+.3&&k<order.length){k++;continue;}if(min>jm+.3)break;
  const base=cfg.jobPay[id],pay=tier<1?base:tier<2?Math.ceil(base/2):1;// 2 full shifts per job: a rotation over 13 jobs never gets past full pay in one session
  repeat('jobs',pay);jm-=min;k++;}
 const games=['runner','pinball','tennis','live'];let am=plan.arcade||0,g=0;
 while(am>=ASSUME.min.arcadeRound-1e-9){const id=games[g++%4],min=id==='live'?ASSUME.min.liveRound:ASSUME.min.arcadeRound;if(min>am+.3)break;am-=min;
  out.arcade-=cfg.prices.arcade;repeat('arcade',Math.round(E.ARCADE_COIN_CAPS[id]*ASSUME.arcadeSkill[P.who]*(.8+.4*r())));}
 for(let m=plan.kick||0;m>=ASSUME.min.kickRound-1e-9;m-=ASSUME.min.kickRound){const mean=ASSUME.kickHits[P.who],hits=Math.min(5,Math.max(0,Math.round(mean+(r()-.5)*2)));
  repeat('kick',hits*cfg.kick.perHoop+(hits===5?cfg.kick.perfect:0));}
 const FT=fishTable(cfg.fishSpots);
 for(let m=plan.fish||0;m>=cfg.fishCast-1e-9;m-=cfg.fishCast)if(r()<ASSUME.fishLand){const id=pick(FT,r);basket.push(id);prices.set(id,cfg.fishValue(fish.fishById(id)));}
 let fruit=0;for(let m=plan.forage||0;m>=ASSUME.min.forageFruit-1e-9&&fruit<forage.FORAGE.dailyCap;m-=ASSUME.min.forageFruit,fruit++){const id=FRUIT[Math.floor(r()*FRUIT.length)];basket.push(id);prices.set(id,cfg.produceValue(id));}
 const gardenMin=(plan.garden||0)+Math.max(0,(plan.forage||0)-fruit*ASSUME.min.forageFruit);// fruit past the daily cap: the garden instead
 for(let m=gardenMin;m>=ASSUME.min.gardenPick-1e-9;m-=ASSUME.min.gardenPick){const id=GARDEN_GOODS[Math.floor(r()*GARDEN_GOODS.length)];basket.push(id);prices.set(id,cfg.produceValue(id));}
 if(cfg.beachValue&&beach){const pool=beachPool();let n=0;for(let m=plan.beach||0;m>=ASSUME.min.beachFind-1e-9&&n<23;m-=ASSUME.min.beachFind,n++){const f=pick(pool,r);if(f.care==='sell'){basket.push(f.id);prices.set(f.id,cfg.beachValue(f));}}}
 const day={};for(let i=0;i<basket.length;i+=20)repeat('market',sellBasket(cfg,basket.slice(i,i+20),id=>prices.get(id),day));// a full basket is sold, then the rest
 out.total=out.learn+out.daily+out.jobs+out.market+out.arcade+out.kick;return out;
}
function averageSession(cfg,profileId,seeds=SEEDS){
 const acc={learn:0,daily:0,jobs:0,market:0,arcade:0,kick:0,total:0};
 for(let s=1;s<=seeds;s++){const o=session(cfg,profileId,s);for(const k in acc)acc[k]+=o[k];}
 return Object.fromEntries(Object.entries(acc).map(([k,v])=>[k,Math.round(v/seeds*10)/10]));
}
/** Sessions to afford each thing (no spending in between). */
function sessionsToBuy(cfg,profileId){const c=averageSession(cfg,profileId).total,p=cfg.prices;
 return {coins:c,pack3:+(p.pack3/c).toFixed(2),arcadePlays:Math.floor(c/p.arcade),kitBall:+(p.ball/c).toFixed(2),kitBoots:+(p.boots/c).toFixed(2),kitJersey:+(p.jersey/c).toFixed(2)};}

/**
 * Coins a minute for doing ONLY this activity for `minutes` on a fresh day (after the market's rules and the Training meter, so
 * a capped activity is measured as it really pays). `full` = the first-minute rate at full price, before any cap.
 */
function activityRate(cfg,activity,minutes=15,seeds=SEEDS){
 const plan={daily:0,[activity]:minutes};let tot=0;
 for(let s=1;s<=seeds;s++){const saved=PROFILES.__rate;PROFILES.__rate={label:'rate',who:'typical',minutes,plan};const o=session(cfg,'__rate',s);tot+=o.total-o.daily;PROFILES.__rate=saved;}
 delete PROFILES.__rate;return +(tot/seeds/minutes).toFixed(2);
}
/** Full-price coins a minute (no caps, no ladder): what an activity pays at its best. */
function fullRates(cfg){
 const FT=fishTable(cfg.fishSpots),fishEV=FT.reduce((n,[id,w])=>n+w*cfg.fishValue(fish.fishById(id)),0);
 const fruitEV=FRUIT.reduce((n,id)=>n+cfg.produceValue(id),0)/FRUIT.length,gardenEV=GARDEN_GOODS.reduce((n,id)=>n+cfg.produceValue(id),0)/GARDEN_GOODS.length;
 const pool=beachPool(),tot=pool.reduce((n,[,w])=>n+w,0),beachEV=cfg.beachValue&&tot?pool.reduce((n,[f,w])=>n+w/tot*cfg.beachValue(f),0):0;
 const jobRates=jobs.JOB_IDS.filter(id=>cfg.jobPay[id]!=null).map(id=>cfg.jobPay[id]/jobs.jobShiftMinutes(id));
 const arcade=Object.fromEntries(['runner','pinball','tennis','live'].map(g=>[g,(E.ARCADE_COIN_CAPS[g]*ASSUME.arcadeSkill.typical-cfg.prices.arcade)/(g==='live'?ASSUME.min.liveRound:ASSUME.min.arcadeRound)]));
 const r=x=>+x.toFixed(2);
 return {quiz:r((cfg.learn.quiz+cfg.learn.quizPerfect*ASSUME.perfectFirstTry)/ASSUME.min.lesson),ball:r(cfg.learn.ball/ASSUME.min.ball),
  jobMedian:r(median(jobRates)),jobMax:r(Math.max(...jobRates)),fish:r(fishEV*ASSUME.fishLand/cfg.fishCast),forage:cfg.forage?r(fruitEV/ASSUME.min.forageFruit):0,
  garden:r(gardenEV/ASSUME.min.gardenPick),beach:r(beachEV/ASSUME.min.beachFind),
  kick:cfg.kick?r((ASSUME.kickHits.typical*cfg.kick.perHoop)/ASSUME.min.kickRound):0,arcadeBest:r(Math.max(...Object.values(arcade))),
  fishEV:r(fishEV),fruitEV:r(fruitEV),gardenEV:r(gardenEV),beachEV:r(beachEV)};
}
/** Block lengths for activityRate: whole lessons (3 × 4 min) and whole balls (4 × 3.5 min). */
const RATE_MINUTES={lesson:12,ball:14};
/** The most a day of repeatable earning can pay (Training meter: full, then half, then tips), excluding tips. */
const dailyRepeatCeiling=cfg=>cfg.meter.full+(cfg.meter.half-cfg.meter.full);

function report(){
 const cfgs=Object.values(CONFIGS),profiles=Object.keys(PROFILES);
 return {assume:ASSUME,
  rates:Object.fromEntries(cfgs.map(c=>[c.name,fullRates(c)])),
  sessionRates:Object.fromEntries(cfgs.map(c=>[c.name,Object.fromEntries(['lesson','ball','jobs','fish','forage','garden','beach','kick'].map(a=>[a,activityRate(c,a,RATE_MINUTES[a]??15)]))])),
  sessions:Object.fromEntries(cfgs.map(c=>[c.name,Object.fromEntries(profiles.map(p=>[p,averageSession(c,p)]))])),
  toBuy:Object.fromEntries(cfgs.map(c=>[c.name,Object.fromEntries(profiles.map(p=>[p,sessionsToBuy(c,p)]))])),
  ceilings:Object.fromEntries(cfgs.map(c=>[c.name,dailyRepeatCeiling(c)]))};
}
if(require.main===module){
 const R=report();if(process.argv.includes('--json')){console.log(JSON.stringify(R,null,1));process.exit(0);}
 console.log('== Full-price coins a minute (no caps)');console.table(R.rates);
 console.log('== Coins a minute doing only this for 15 min on a fresh day (market rules + Training meter)');console.table(R.sessionRates);
 for(const c of Object.keys(R.sessions)){console.log(`== Sessions: ${CONFIGS[c].label}`);console.table(R.sessions[c]);console.table(R.toBuy[c]);}
 console.log('== Daily repeatable ceiling (excl. 1-coin tips)',R.ceilings);
}
module.exports={RATE_MINUTES,ASSUME,CONFIGS,OLD,PROFILES,session,averageSession,sessionsToBuy,activityRate,fullRates,sellBasket,dailyRepeatCeiling,report,fishTable};
