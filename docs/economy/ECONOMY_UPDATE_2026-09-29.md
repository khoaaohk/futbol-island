# Economy update after the Coral Cay expansion (29 Sep 2026)

Local only: nothing here is committed or deployed. This follows the [28 Sep economy pass](ECONOMY_PROPOSAL.md) and keeps its goals.

**Short version:** Coral Cay adds **400 coins of new things to buy** (4 books) but, before this change, only **100 coins of new earning** (20 balls × 5). Every other addition either adds nothing to buy or is limited by the daily Training meter. Left alone, a 15-minute daily player would own everything about **7 days later** (day 121 → 128) and a 20-minute player about **6 days later** (84 → 90, the upper edge of the 60–90 day target). **One change:** a hidden ball now pays **10 learning coins instead of 5** (`lib/town/learnCoins.ts`). That brings completion back to pre-Coral-Cay days and makes the ball hunt out-earn the arcade per minute. Prices, fish values, job pay and the daily caps stay as they are. Two job-file edits are handed over (§5) because another agent is editing `lib/town/jobs/*`.

Reproduce: `node scripts/economy-sim.cjs --days 200` (20-seed means plus one seeded run) and `node tests/economy.cjs`.

---

## 1. What Coral Cay changed in the economy

| Addition | Earning | Spending | Economy effect |
|---|---|---|---|
| Harvest day job (pay 8, +4 first time) | +1 job | — | One-off +4. The daily ceiling does not change (§3) |
| Match-day snacks job (being added) | +1 job | — | Same as above. Modelled at pay 8 until it lands |
| Deep Sea Boat, 8 species | mean catch **3.94** (shore **4.01**) | — | Sold at Rosa's stand like any fish: 40-coin full-price allowance, then half, then the Training meter. The boat is about 174 m from the stand (flight needed), so there is no fast sell loop |
| Ball hunt 80 → 100 | +20 × learning coins, +20 cards | — | More free cards means about 3 fewer packs to fill the binder (−120 coins of sink). Costumes unchanged (24; fox now at 100) |
| 4 books (Cafu, Nadim, Kanté, Oshoala) | — | **+400** | 36 books are sold (37 including the free island starter book) |
| 5 machines (4 book machines + a Konbini) | — | — | Book machines sell only the book above. The Konbini sells regular stock only, so it adds convenience, not a new sink |
| Beach 5-a-side match | — | — | Watch/teach only. No coin grants in `lib/town/match/*` |

Every coin source in the code (grep of `creditRun` / `creditOnce` / `spend` callers): welcome coins, daily play, learning coins (`learnCoins.ts`), island jobs (`jobWallet.ts`), market sales of fish and produce (`market.ts` through `islandWallet.ts`), card trade-ins (`cardSellingStore.ts`), arcade rounds and Pass Puzzles (`lib/arcade/*`, Astra). Every sink: vending items (`vendingWallet.ts` → `buyVendingWithCoins`), packs (`purchaseMysteryPack`) and arcade entry (`payArcadePlay`, free for puzzles). Coral Cay adds no new source or sink type.

## 2. Sources and sinks, before and after

### Sinks (the cost to own everything)

| Item | Count | Price | Before (28 Sep) | After (29 Sep) |
|---|---|---|---|---|
| Balls (classic free) | 5 | 20 | 100 | 100 |
| Special balls | 8 | 35 | 280 | 280 |
| Scooters / Bikes / Mopeds / Flight | 5 each | 30 / 40 / 50 / 70 | 950 | 950 |
| Island animals | 24 | 30 | 720 | 720 |
| Books | 32 → **36** | 100 | 3,200 | **3,600** |
| **Total excluding packs** | | | **5,250** | **5,650** (+7.6%) |
| Card packs to finish the binder alongside learning cards (sim) | | 40 | ~63 packs ≈ 2,500 | ~60–63 packs ≈ 2,400–2,500 |

### Sources

| Source | Pay | ~Coins per hour | Limit |
|---|---|---|---|
| Lesson quiz (96) | 12, +6 if perfect first try | 239 | once each |
| **Hidden ball (80 → 100)** | **5 → 10** | **86 → 171** | once each |
| Story 10 · Journey stage 8 · Explore item 5 · Path 75 | | | once each |
| One-off learning pool (all of the above) | | | **2,620 → 2,720 unchanged / 3,220 with the change** |
| Island jobs (9 → 11) | 7–10, +4 first time | 320 at full pay | 2 full + 2 half per job, then a 1-coin tip; **and** the Training meter |
| Fishing (5 → 6 spots), garden | fish 4.0 mean, produce 2.4 | high | market full price to 40/day, then half; Training meter |
| Arcade rounds | caps 12/15/18/20, entry 3 | 72–138 net | Training meter |
| Pass Puzzles | 5 + stars, free | 288 | 24 first solves |
| Daily play | 30 | — | once a day |
| **Training meter** (`dailyMeter.ts`) | full pay until 60 paid, half pay until 120 paid, then 1-coin tips | | one budget per day across jobs, arcade, market and trade-ins |

### What players earn and when they finish (20-seed means, 200 days)

Casual = 15 min every day; engaged = 45 min every day (the sim's "keen"); regular (20 min daily) is kept for comparison with the 28 Sep numbers. Coins per day are the days 8–30 mean; a week is 7 play days.

| Player | Config | Coins / day | Coins / week | Learning share | First book (day) | Days of income per book | All cards (day) | **Own everything (day)** | Empty sessions before done |
|---|---|---|---|---|---|---|---|---|---|
| Casual 15 min | before | 74 | 526 | 43% | 2 | 1.3 | 106 | **121** | 4 |
| | after, no change | 75 | 524 | 43% | 2 | 1.3 | 103 | **128** | 8 |
| | **after + ball 10 (applied)** | **81** | **570** | **48%** | 2 | 1.2 | 99 | **121** | 6 |
| Regular 20 min | before | 103 | 718 | 46% | 1 | 1.0 | 74 | **84** | 0 |
| | after, no change | 103 | 721 | 46% | 1 | 1.0 | 74 | **90** | 1 |
| | **after + ball 10** | **111** | **781** | **50%** | 1 | 0.9 | 71 | **85** | 1 |
| Engaged 45 min | before | 175 | 1,242 | 43% | 1 | 0.6 | 43 | **50** | 0 |
| | after, no change | 173 | 1,236 | 44% | 1 | 0.6 | 41 | **52** | 0 |
| | **after + ball 10** | **188** | **1,335** | **49%** | 1 | 0.5 | 39 | **49** | 0 |

The 28 Sep casual player (10 min, 4 days a week) still never finishes inside 200 days. That player is meant to stay open-ended and is never stuck (0–3 empty sessions). No archetype is ever flooded before owning everything. After completion, engaged players pile up coins again; that is the endgame-sink question in [§7 of the proposal](ECONOMY_PROPOSAL.md#7-optional-phase-2-an-endgame-sink-not-in-the-sim), unchanged.

## 3. The questions asked

**Do 2 more jobs raise the daily income ceiling?** Not meaningfully. The per-job cap (2 full + 2 half) was never the real limit. Since 28 Sep the Training meter has been one **total daily budget** across all jobs, arcade payouts, market sales and trade-ins: 60 at full pay, half pay until 120 has been paid, then a 1-coin tip per earning. With 9 jobs a player could already fill it (29 of 36 possible shifts). With 11 jobs it fills in 25 shifts. Everything above that is 1-coin tips, so the jobs-only ceiling goes from **127 to 139 coins a day** (120 of budget plus tips), and the extra is only tips at about 1 coin per 1.5 minutes. **Decision:** no change. The per-job cap stays as a friendly nudge toward a *different* job (a different football lesson), and the meter is the budget. Turning the per-job cap into a cross-job budget would duplicate the meter.

**Does the Deep Sea Boat create a farming loop?** No. Its mean catch (3.94) is the same as the shore (4.01), the rare 16–18 coin fish are weighted 1.2 against 40 for commons, and every fish is sold at Rosa's stand through the market allowance and the Training meter. The stand is a flight away from the boat. **Decision:** fish values unchanged.

**Does the bigger "own everything" need more earning or price tweaks?** The 4 books add 400 coins of goals; left alone, completion slips 6–7 days for daily players and the regular player lands at day 90, the edge of the target. Cutting book prices would weaken "books are a real goal" and would have to touch every book. Raising a *learning* reward keeps books at 100, and the ball hunt is the part that grew. **Decision:** hidden ball 5 → 10 (+500 over the whole hunt). Everything else unchanged.

**Is learning still rewarded above grinding?** Yes, and more than before. The learning share of coins rises from 43–46% to 48–50%. Per minute, a lesson quiz (≈239/h) stays best, a hidden ball (≈171/h) now beats every arcade round (≤138/h), and all learning coins are unmetered.

**Books real but reachable?** Yes. A book is 1.2 days of a casual player's income and half a day for an engaged player, and the first book arrives on day 1–2. The 36 books are 64% of the non-pack sink, so they stay the long goal.

## 4. What changed (applied)

| File | Change | Why |
|---|---|---|
| `lib/town/learnCoins.ts` | `LEARN_COINS.ball` **5 → 10** | Offsets the +400 book sink, pays for the far Coral Cay balls (a flight to another island) and puts the ball hunt above the arcade per minute while keeping it below lessons |
| `scripts/economy-sim.cjs` | Configs `before` (9 jobs, 80 balls with the fox at 80, 32 books, shore fish only, ball 5), `after,no-change`, `current` (live code), `after+snacks` (+ Match-day snacks at pay 8). New `casual15` archetype, `averaged()` 20-seed means, `jobCeiling()`, `learnPool()`, `fishEV(spots)`; sinks count books and special balls live | Before/after evidence for this update and future expansions |
| `tests/economy.cjs` (new, in `npm test`) | Guard rails: ball 10 and learning > arcade per minute; the meter bounds job income whatever the job count; boat ≈ shore; the only new sink is +400 books; completion no slower than before (+3 days tolerance); regular inside 60–90 days; ≤ 2 days of income per book; no flood | Keeps the goals checked when the next island lands |
| `tests/arcade-wallet-spending.cjs` | Ball pays 10; new forward-only check: an old save's 5-coin ball keeps its 5, is never paid again, and a new ball pays 10 | Save compatibility |

**Save compatibility.** Learning coins are `creditOnce` runs (`learn:ball:<spotId>`): an id that was already paid is never paid again or changed, and `sanitizeArcadeWallet` clamps learn runs only to the 75 cap. Saves keep every coin they have, balls found before today keep their 5, and new balls pay 10. There is no wallet or ledger version change and nothing is re-locked. No prices changed, so no spend or pack receipt is affected (they store their own cost anyway).

**Not changed (and why):** `VENDING_PRICES` and `BOOK_PRICE` (the sink growth is covered by the ball change, and the books-100 user decision stands); fish prices; the market allowance; the Training meter; `STARTER_COINS` and `DAILY_PLAY_COINS`; pack prices (Astra).

## 5. Handed over (the `lib/town/jobs/*` files are being edited by the Coral Cay agent)

1. **Match-day snacks pay:** `JOB_BASE_PAY['match-day-snacks']: 8` (any value from 7 to 10 is fine; `tests/economy.cjs` checks every job is in the 7–10 band). Keep `FULL_PAY_PER_DAY=2, HALF_PAY_PER_DAY=2, TIP_COINS=1, FIRST_JOB_BONUS=4` unchanged.
2. **Optional fairness fix: stop the Training meter from eating the first-job bonus.** Today the +4 first-time bonus is inside the metered `island-job:` run, so a player who tries a new Coral Cay job after a full day of chores gets 1 coin instead of 12, and the bonus is gone for good (`lifetime>0`). Every existing save meets the two new jobs this way. The fix pays the bonus as its own unmetered, idempotent run (`island-job-first:` does not match `dailyMeter`'s `^island-job:`):
   ```ts
   // lib/town/jobs/jobWallet.ts, payJob()
   const credited=await credit(`island-job:${id}:${localDay(t)}:${shift}`,coins-bonus,`Island job · ${title}`)
    +(bonus?await credit(`island-job-first:${id}`,bonus,`First shift bonus · ${title}`):0);
   ```
   ```js
   // tests/island-jobs.cjs line 58: the shift run now holds the pay without the bonus
   assert.equal(await wallet.credit(`island-job:leaf-rake:${E.localDay(clock)}:1`,paid.coins-paid.bonus,'replay'),0);
   ```
   This is forward-only (old runs untouched) and adds at most 4 coins per job, once ever.

## 6. Open notes

- **Pre-existing, not caused by Coral Cay:** past the meter's half line, every sale pays a 1-coin tip, so picking one garden fruit and selling it at the stand 50 m away earns about a coin every 20–30 s. It is tedious and capped by 39 regrowing spots, but it is the closest thing to a loop left. If it is ever seen in play, the fix belongs in `dailyMeter.ts` (for example, a market tip only for baskets of 5 or more). Not changed now.
- `npx tsc --noEmit` currently fails in `lib/town/match/matchSim.ts` (the beach-match agent's in-progress `LiveVenue` / `'beach'` format). That is unrelated to this change.
- Times per activity are still estimates (see [§9 of the proposal](ECONOMY_PROPOSAL.md#9-model-assumptions-and-limits)). Coral Cay travel time is not modelled; the ball-minutes curve (2 → 6.75 min per ball) stands in for it.

## Drink machines (29 Sep 2026)

Two outdoor drink machines, one beside each Konbini's vending machine (`lib/town/drinkMachines.ts`, docs/vending-machines.md
"Drink machines"). They add a **small, paced everyday sink** and **no new source**.

| | Value | Why |
|---|---|---|
| Drinks | 12 (6 per machine) | Water, teas, milk, sports drink, warm cocoa · coconut water, water, sports drink, pineapple juice, lemon water, yoghurt soda |
| Prices | 3–6 coins (water/teas 3 · milk, juice, lemon 4 · sports, cocoa, coconut 5 · soda 6) | Cheaper than any gear; the "treat" drinks cost more than water, which nudges toward water |
| Cost of the whole set | **50 coins** (23 + 27) | Under one casual day (~81) and half a book (100) |
| Daily limit | **3 machine drinks a day**, its own `drinks` bucket | Separate from the food "tummy full" limit, so drinks and snacks don't crowd each other out |
| Time to collect all 12 | ≥ 4 play days; about 1–2 weeks for a casual player who doesn't reach Coral Cay daily | The limit, not the price, sets the pace |
| Purchases | Repeat-safe consumables through the Konbini ledger (`konbini:food:<item>:<purchase id>`, charged once per id) | Same wallet; no owned-once rule |
| Rewards | None (collection progress only) | No income loop; learning coins stay the best earner |

`tests/economy.cjs` §6 checks the price band, that the full set costs less than a casual day, that the limit spreads it over
4–14 play days, and that a full day of the priciest drinks is under a quarter of a book. The sim's own-everything totals above do
not include consumables (food or drinks), by design: they are re-buyable treats, not a completion goal.

`node tests/economy.cjs` passes with §6 (29 Sep 2026).

## 7. Konbini food and the Konbini Collection (29 Sep 2026)

The walk-in Konbinis (`/konbini?door=main|cay`, `lib/konbini/*`) sell Japanese to-go food at the counter and from the shelves.
It is a **small, paced everyday sink** with **no new source type** (only a few one-off learning coins, below).

| | Value | Why |
|---|---|---|
| Menu | **30 items**: Island Square 18 unique (3 Spam musubi, 4 onigiri, tamago sando, karaage, nikuman, oden, yaki imo, cup noodles, bento, melon pan, daifuku, green tea, milk), Coral Cay 10 unique (teriyaki / katsu / double-decker Spam musubi, tropical fruit sando, loco moco bento, mango mochi, dorayaki, malasada, pineapple juice, coconut water), 2 staples in both (water, sports drink) | Each store is worth visiting; a collection across two islands |
| Prices | **3–11 coins**: drinks and onigiri 3–4, most snacks 4–6, musubi 5–8, bento 10–11 | Everyday treats, far below gear (20–70) and books (100) |
| Daily limit | **3 food items a day** (the "tummy full" limit, its own `food` bucket; the drink machines have their own `drinks` bucket) | The cashier says "You're fuelled up for today!" |
| Cost to collect everything | **151 coins** (Island Square 84 + Coral Cay 60 + staples 7) | Under two casual days of income (~81/day), spread over the whole collection |
| Time to collect everything | **≥ 10 play days** at 3 a day (30 items); about 1.5–2 weeks for a casual player who doesn't visit Coral Cay daily | The limit, not the price, sets the pace |
| Most a day can cost | **29 coins** (the three priciest items); a typical day ~15 | Under half a casual day and under a third of a book |
| Book delay | Buying the whole collection over ~2 weeks moves a casual player's next book by about 2 days in total | Food never competes with books |
| Purchases | Repeat-safe consumables: one idempotent wallet spend per purchase, `konbini:food:<item>:<purchase id>` (the purchase id is made once per deliberate Buy, so a double tap or retry charges once) | Same arcade wallet; no owned-once rule; eat now or save up to 3 in the Snacks pouch |
| Rewards | **10 learning coins** for the Island Square set, **10** for the Coral Cay set, **10** for everything (`learn:explore:konbini-set-*`, once ever); **5** for the magazine stamp card (`learn:explore:konbini-stamp-card`, once) | 35 one-off coins against 151 of spending: a thank-you, not a loop |
| Gear at the counter | Regular stock only (three regular balls and the 3-card pack per store) through the same vending ledger and prices as the machines | Convenience, not a new sink (matches §1) |
| Perk | **None.** Eating shows a nutrition lesson and a bite animation; no stamina or speed boost | A paid boost would be pay-to-win |

`tests/konbini.cjs` checks the 3–12 price band, that collecting everything costs under two casual days, that the daily limit makes
it a 7–14 day goal, that the most a day can cost stays under half a casual day, that the set rewards return well under a third of
the cost, and that each purchase is charged exactly once through the real arcade wallet (double tap, retry, refused buy,
not-enough-coins). The sim's own-everything totals in §2 still exclude consumables, by design.

## 8. East Pier / East Jetty (29–30 Sep 2026)

The East Pier, reworked into the spiral East Jetty on 30 Sep (`lib/town/eastPier.ts`), adds **no new sink and no repeatable source**.

| | Value | Why |
|---|---|---|
| Fishing spot "East Jetty Spiral" | mean catch ≈ **4.05** coins (shore 4.0) | Existing species only; sold through the same 40-coin full-price market allowance and the Training meter. The spiral's fishing curve is ~240 m of walking from Rosa's stand, so no fast sell loop |
| Jetty Shooting Challenge | **5 learning coins once ever** (`learn:explore:east-pier-target`, `creditOnce`, never metered) | A one-off thank-you for the first ring hit, the same size as an explore item. Later hits give only a toast and a local stat (hits, best streak), so there is no daily or repeatable payout |
| Islanders | card offers only (existing `earnForNpc`) | No coins |

The one-off 5 coins are not in the sim's learning pool; they move completion by well under a day. `tests/economy.cjs` passes unchanged; `tests/east-pier.cjs` asserts the one-off reward and `tests/fishing.cjs` the pier's mean catch.
