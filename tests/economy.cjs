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
  assert(c.meteredJobCeiling-tips<=TRAINING_HALF_COINS+jobs.JOB_BASE_PAY['ball-kid'],`${c.jobs} jobs: ${c.meteredJobCeiling} = budget + ${tips} tips`);}
 assert(now.meteredJobCeiling-base.meteredJobCeiling<=now.totalShifts-base.totalShifts+4,'two more jobs add only a handful of tip coins');
 let paid=0;for(let i=0;i<200;i++)paid+=trainingPay(paid,10);assert(paid<=TRAINING_HALF_COINS+200,'past the half line every earning is a 1-coin tip');
 assert.equal(trainingPay(TRAINING_HALF_COINS,20),1);assert.equal(trainingPay(0,TRAINING_FULL_COINS),TRAINING_FULL_COINS);
 assert(jobs.JOB_IDS.every(id=>jobs.JOB_BASE_PAY[id]>=7&&jobs.JOB_BASE_PAY[id]<=10),'every job pays inside the 7–10 band');}

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

console.log('PASS economy: learning beats repetition, one daily training budget across all jobs, deep-sea boat ≈ shore, +4 books only new sink, completion pace unchanged by Coral Cay, drink machines a small paced sink');
