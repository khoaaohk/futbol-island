// Economy guard rails (docs/economy/ECONOMY_UPDATE_2026-09-29.md). Runs the real-constant simulator (scripts/economy-sim.cjs)
// and checks the Sep 28 goals still hold after each content expansion: something to buy every session, no grind wall, no
// income loop, books reachable, learning paying better than repetition. Deterministic (seeded); about 5 s.
const assert=require('node:assert/strict');
const S=require('../scripts/economy-sim.cjs');
const {LEARN_COINS}=require('../lib/town/learnCoins.ts');
const {TRAINING_FULL_COINS,TRAINING_HALF_COINS,trainingPay,isTrainingRun}=require('../lib/town/dailyMeter.ts');
const jobs=require('../lib/town/jobs/jobEconomy.ts'),fish=require('../lib/town/fishing/fishCatalog.ts'),market=require('../lib/town/market/market.ts');
const {BOOK_PRICE}=require('../lib/books/catalog.ts');

// 1. Learning beats repetition per minute: a lesson quiz pays best, a hidden ball (now 10) is next, and both are uncapped.
{const m=S.ASSUME.min,quizPerMin=(LEARN_COINS.quiz+LEARN_COINS.quizPerfect*S.ASSUME.perfectFirstTry)/m.lesson,ballPerMin=LEARN_COINS.ball/3.5;
 assert.equal(LEARN_COINS.ball,10,'hidden ball pays 10 learning coins (29 Sep 2026)');
 assert(ballPerMin<quizPerMin,'a lesson quiz still pays more per minute than a hidden ball');
 const arcadeBest=Math.max(...['runner','pinball','tennis','live'].map(g=>(S.CURRENT.arcadeCaps[g]*.55-S.CURRENT.arcadeCost)/(g==='live'?m.liveRound:m.arcadeRound)));
 assert(ballPerMin>arcadeBest,'a hidden ball out-earns the best arcade round per minute');
 assert(!isTrainingRun('learn:ball:x','learn'),'learning coins are never metered');}

// 2. No income loop from more jobs: the Training meter is one daily budget across every job, so extra jobs add tips only.
{const base=S.jobCeiling(S.BEFORE),now=S.jobCeiling(S.AFTER_FULL);
 assert(base.shiftsToFillMeter<=base.jobs*(jobs.FULL_PAY_PER_DAY+jobs.HALF_PAY_PER_DAY),'9 jobs could already fill the meter');
 // Above the meter's half line every shift is a 1-coin tip, whatever the job count: pay minus tips never passes the budget.
 for(const c of [base,now]){const tips=(c.totalShifts-c.shiftsToFillMeter)*jobs.TIP_COINS;
  assert(c.meteredJobCeiling-tips<=TRAINING_HALF_COINS+Math.max(...Object.values(jobs.JOB_BASE_PAY)),`${c.jobs} jobs: ${c.meteredJobCeiling} = budget + ${tips} tips`);}
 assert(now.meteredJobCeiling-base.meteredJobCeiling<=now.totalShifts-base.totalShifts+4,'two more jobs add only a handful of tip coins');
 let paid=0;for(let i=0;i<200;i++)paid+=trainingPay(paid,10);assert(paid<=TRAINING_HALF_COINS+200,'past the half line every earning is a 1-coin tip');
 assert.equal(trainingPay(TRAINING_HALF_COINS,20),1);assert.equal(trainingPay(0,TRAINING_FULL_COINS),TRAINING_FULL_COINS);
 assert(jobs.JOB_IDS.every(id=>id==='wall-rebounds'||jobs.JOB_BASE_PAY[id]>=7&&jobs.JOB_BASE_PAY[id]<=10),'every short job pays inside the 7–10 band');
 // Wall rebounds (30 Sep 2026): a ~3.5-min drill paid per minute like the middle of the others, never above the best of them.
 const rate=jobs.jobCoinsPerMinute,others=jobs.JOB_IDS.filter(id=>id!=='wall-rebounds').map(rate);
 assert(rate('wall-rebounds')<=Math.max(...others),'wall rebounds is not the best-paid job per minute');}

// 3. The Deep Sea Boat is not a farming spot: its mean catch matches the shore, and fish sell through the capped market.
{const shore=S.fishEV(fish.SHORE_SPOTS),boat=S.fishEV(fish.FISH_SPOTS.filter(s=>s.boat));
 assert(Math.abs(boat-shore)/shore<.1,`boat ${boat.toFixed(2)} vs shore ${shore.toFixed(2)} coins per catch`);
 assert.equal(market.MARKET_FULL_PRICE_COINS,40);assert(isTrainingRun('market:2026-09-29:1','island'),'market sales are metered');}

// 4. Sinks: books stay 100 and the own-everything total is known; the four new books are the only new sink.
{assert.equal(BOOK_PRICE,100);const before=S.sinkTotal(S.BEFORE),after=S.sinkTotal(S.AFTER_FULL);
 assert.equal(after-before,4*BOOK_PRICE,'Coral Cay adds four 100-coin books and nothing else to buy');
 assert.equal(S.learnPool(S.AFTER_FULL)-S.learnPool(S.BEFORE),100*LEARN_COINS.ball-80*5,'100 balls at 10 vs 80 at 5');}

// 5. Pace (5-seed means, 200 days): the expansion does not slow completion, a book is ≤ 2 sessions of saving, no dry spells.
{const run=(cfg,who)=>S.averaged(cfg,who,200,5);
 for(const who of ['casual15','regular','keen']){const b=run(S.BEFORE,who),a=run(S.AFTER_FULL,who);
  assert(a.allBought<=b.allBought+3,`${who}: own everything by day ${a.allBought} (before ${b.allBought})`);
  assert(a.saveDaysPerBook<=2,`${who}: a book is ${a.saveDaysPerBook} days of income`);
  assert(a.learnPct>=40,`${who}: learning is ${a.learnPct}% of coins in days 8–30`);
  assert(a.emptyBeforeDone<=10,`${who}: ${a.emptyBeforeDone} empty sessions in 200 days`);}
 const reg=run(S.AFTER_FULL,'regular');assert(reg.allBought>=60&&reg.allBought<=90,`regular player owns everything in the 60–90 day target (day ${reg.allBought})`);
 const keen=S.summarize(S.AFTER_FULL,'keen',200);assert.equal(keen.floodedBeforeAllBought,0,'never flooded before everything is bought');}

// 6. Drink machines (29 Sep 2026, lib/town/drinkMachines.ts): a small everyday sink, not a wall. Prices 3–6; the whole "Drink
//    machines" collection costs less than one casual day's income and the 3-a-day limit spreads it over at least 4 play days,
//    within the 1–2 week casual target; no collection reward, so no new coin source.
{const D=require('../lib/town/drinkMachines.ts'),casualPerDay=81;
 assert(D.DRINKS.every(d=>d.price>=3&&d.price<=6),'drink prices 3–6');
 const total=D.DRINKS.reduce((n,d)=>n+d.price,0),minDays=Math.ceil(D.DRINKS.length/D.DRINKS_PER_DAY);
 assert(total<=casualPerDay,`all ${D.DRINKS.length} drinks cost ${total}: less than a casual day (${casualPerDay})`);
 assert(minDays>=4&&minDays<=14,`collecting every drink takes at least ${minDays} play days (1–2 week casual target)`);
 assert(Math.ceil(total/(casualPerDay*.1))<=14,'even spending only a tenth of daily income on drinks finishes inside two weeks');
 assert(D.DRINKS_PER_DAY*6<BOOK_PRICE*.25,'a full day of the priciest drinks is under a quarter of a book');}

// 7. Lane 3 learning loop (30 Sep 2026, docs/economy/ECONOMY_UPDATE_2026-09-30.md): the Daily warm-up pays LEARN_COINS.review
//    for at most REVIEW_PAID_PER_DAY right answers a day (the only daily-repeatable learning coins), and each book's "Take it to
//    your game" check pays LEARN_COINS.book once. Worst case = every day's warm-up fully paid from day 1 plus every book check.
{const {REVIEW_PAID_PER_DAY}=require('../lib/learning/review.ts');const casualPerDay=74;
 const dailyMax=LEARN_COINS.review*REVIEW_PAID_PER_DAY,bookPool=36*LEARN_COINS.book;
 assert(dailyMax<=casualPerDay*.1,`warm-up coins (${dailyMax}/day) stay under a tenth of a casual day`);
 assert(dailyMax<LEARN_COINS.quiz,'a whole day of warm-ups pays less than one new lesson quiz: new learning still pays best');
 assert(LEARN_COINS.book<BOOK_PRICE*.1,'a book check returns under a tenth of the book');assert(bookPool<=S.sinkTotal(S.AFTER_FULL)*.05,'all book checks are under 5% of the sink');
 assert(!isTrainingRun('learn:review:2026-09-30:1','learn')&&!isTrainingRun('learn:book:cafu','learn'),'learning coins, never metered');
 const worst={...S.AFTER_FULL,name:'lane3-worst',dailyPlay:S.AFTER_FULL.dailyPlay+dailyMax,starter:S.AFTER_FULL.starter+bookPool};
 const reg=S.averaged(worst,'regular',200,5),cas=S.averaged(worst,'casual15',200,5),casBase=S.averaged(S.AFTER_FULL,'casual15',200,5);
 assert(reg.allBought>=60&&reg.allBought<=90,`worst case: regular still owns everything inside 60–90 days (day ${reg.allBought})`);
 assert(casBase.allBought-cas.allBought<=14,`worst case: casual finishes at most two weeks sooner (${casBase.allBought} → ${cas.allBought})`);
 assert(cas.emptyBeforeDone<=10,'no new dry spells');}

// 8. Harvest day's farmer's share (30 Sep 2026, ECONOMY_UPDATE_2026-09-29.md §8): 3/2/1 produce by pay tier, worth ≤ the job pay at
//    full price, sold through the market allowance and the Training meter (market runs are metered). Job pay is unchanged. It must
//    not speed completion by more than 2 days for any archetype, nor lift the metered daily ceiling.
{const H=require('../lib/town/jobs/harvestShare.ts'),goods=require('../lib/town/market/goods.ts');
 assert.equal(jobs.JOB_BASE_PAY['farm-harvest'],8,'Harvest day pay unchanged');
 const worst=Math.max(...[0,1,2,3,4,5,6].map(l=>H.jobShare('farm-harvest','full',l).reduce((n,x)=>n+goods.goodById(x.id).price*x.count,0)));
 assert(worst<=jobs.JOB_BASE_PAY['farm-harvest'],`a full-pay share is worth ${worst} ≤ the job pay: the pay stays the main reward`);
 assert.deepEqual(['full','half','tip'].map(t=>H.jobShare('farm-harvest',t,0).reduce((n,x)=>n+x.count,0)),[3,2,1],'the share follows the pay tier');
 assert(isTrainingRun('market:2026-09-30:1','island'),'selling the share is metered like any sale');
 for(const who of ['casual15','regular','keen']){const a=S.averaged(S.AFTER_FULL,who,200,5),b=S.averaged(S.NO_SHARE,who,200,5);
  assert(b.allBought-a.allBought<=2,`${who}: the share speeds completion by ${b.allBought-a.allBought} days (≤ 2)`);assert(a.learnPct>=40,`${who}: learning still ${a.learnPct}%`);}
 const reg=S.averaged(S.AFTER_FULL,'regular',200,5);assert(reg.allBought>=60&&reg.allBought<=90,`regular still inside 60–90 days (day ${reg.allBought})`);}

// 9. Fuel (30 Sep 2026, docs/economy/FUEL_2026-09-30.md): fuel spending is a small everyday sink, never a wall. Even when every
//    missing bit of fuel is bought (the coin worst case) it stays a small share of income, completion slips by at most a week,
//    the regular player stays inside 60–90 days, and a child who never buys refuels with breakfast + free garden fruit in a few
//    minutes a day with no day short of fuel. Learning drains nothing (the sim drains only the travel minutes).
{const F=require('../lib/town/fuel.ts');
 assert(F.FUEL_RATE.jetpack>F.FUEL_RATE.moped&&F.FUEL_RATE.moped>F.FUEL_RATE.bike&&F.FUEL_RATE.bike>F.FUEL_RATE.scooter&&F.FUEL_RATE.scooter>F.FUEL_RATE.walk,'easier travel costs more: fly > rides > walk');
 assert(S.FUEL_SHOP.some(i=>i.price<=4&&i.fuel>=20),'a 3–4 coin rice snack refuels at least 20');assert.equal(S.FUEL_SHOP.find(i=>i.id==='onigiri-ume')?.fuel,F.FUEL_BY_GROUP.carb,'the sim reads the refuel values from lib/town/fuel.ts');
 for(const who of ['casual15','regular','keen']){const base=S.averaged(S.AFTER_FULL,who,200,5),buy=S.averaged(S.FUEL_BUY,who,200,5),free=S.averaged(S.FUEL_FREE,who,200,5);
  assert(buy.fuelSharePct<=12,`${who}: fuel costs ${buy.fuelSharePct}% of income even when every refill is bought (≤ 12%)`);
  assert(buy.allBought-base.allBought<=7,`${who}: buying all fuel delays owning everything by ${buy.allBought-base.allBought} days (≤ 7)`);
  assert(buy.learnPct>=40,`${who}: learning still ${buy.learnPct}% of coins`);assert(buy.emptyBeforeDone<=10,`${who}: no new dry spells`);
  assert.equal(free.fuelShortDays,0,`${who}: the zero-coin path (breakfast + garden fruit) never leaves a day short`);
  assert(free.freeMinPerDay<=3,`${who}: the free refuel costs ${free.freeMinPerDay} min a day of picking (≤ 3)`);}
 const reg=S.averaged(S.FUEL_BUY,'regular',200,5);assert(reg.allBought>=60&&reg.allBought<=90,`fuel: regular still inside 60–90 days (day ${reg.allBought})`);
 // Zero-coin stress (fountains removed Sep 30 2026): a 90-minute heavy flyer still refuels for free with breakfast + a few garden picks.
 const heavy=S.fuelStress({minutes:90,fly:.5});assert.equal(heavy.fountainSips,0);assert(heavy.freeMinutes<=5,`heavy flyer: ${heavy.freeMinutes} min of free refuelling (≤ 5)`);}

// 10. Garden shift (30 Sep 2026, docs/island-jobs.md §13): a paid job at per-minute parity, its 8 picks taken from the same garden
//     pool as free picking, a 2/1/1 gardener's share. It must not speed owning everything by more than 2 days, nor lift the metered
//     daily ceiling by more than a few tip coins; the regular player stays inside 60–90 days.
{assert.equal(jobs.JOB_BASE_PAY['garden-shift'],10);assert(S.SEP30_GARDEN&&S.NO_GARDEN_SHIFT,'the sim models the garden shift');
 const a=S.jobCeiling(S.NO_GARDEN_SHIFT),b=S.jobCeiling(S.AFTER_FULL);assert(b.meteredJobCeiling-a.meteredJobCeiling<=5,`the garden shift adds ${b.meteredJobCeiling-a.meteredJobCeiling} metered coins a day (≤ 5)`);
 for(const who of ['casual15','regular','keen']){const x=S.averaged(S.NO_GARDEN_SHIFT,who,200,5),y=S.averaged(S.AFTER_FULL,who,200,5);
  assert(Math.abs(y.allBought-x.allBought)<=2,`${who}: the garden shift moves owning everything by ${y.allBought-x.allBought} days (≤ 2)`);assert(y.learnPct>=40,`${who}: learning still ${y.learnPct}%`);}
 const reg=S.averaged(S.AFTER_FULL,'regular',200,5);assert(reg.allBought>=60&&reg.allBought<=90,`garden shift: regular inside 60–90 days (day ${reg.allBought})`);}
console.log('PASS economy: learning beats repetition, one daily training budget across all jobs, deep-sea boat ≈ shore, +4 books only new sink, completion pace unchanged by Coral Cay, drink machines a small paced sink, warm-up + book-check coins capped and inside the pace targets, harvest share small and metered, fuel a small everyday sink with a free path');
