# Coin economy (rebalance of 14 Oct 2026)

User: *"improve the economy to make it harder to buy things since it's easier to find, shake, and fish now"*.

Every tunable coin number now lives in **one file, `lib/economy.ts`**. The game modules re-export from it, so existing imports and screens keep working.

- Reproduce the session numbers: `node scripts/economy-sessions.cjs`.
- Reproduce the 200-day collection pace: `node scripts/economy-sim.cjs`.
- Guard rails: `node tests/economy.cjs` (§11 is this rebalance).

Earlier passes, still valid for their reasoning: [economy/ECONOMY_PROPOSAL.md](economy/ECONOMY_PROPOSAL.md) (28 Sep), [economy/ECONOMY_UPDATE_2026-09-29.md](economy/ECONOMY_UPDATE_2026-09-29.md), [economy/ECONOMY_UPDATE_2026-09-30.md](economy/ECONOMY_UPDATE_2026-09-30.md) and [economy/FUEL_2026-09-30.md](economy/FUEL_2026-09-30.md).

## 1. Short version

- **Before:** a typical 15-minute session earned about **93–100 coins**. That bought a Kit Shop ball in 1.5 sessions and a jersey in 3, and a 3-card pack took under half a session.
- **After:** the same session earns about **73 coins**. That is one 3-card pack plus about ten 3-coin arcade plays. A Kit Shop ball now takes **2.2 sessions**, boots **3.3**, a jersey **4.6**.
- **Grinders feel it most.** A 45-minute fish, fruit and jobs session drops from about 150 coins to about 96, and the daily cap on repeatable earning drops from 120 to 80.
- **Learning now pays clearly best per minute.** A lesson pays about 4.7 coins a minute and a hidden ball about 3.4. Every fish, fruit or beach grind pays 2.5 or less.
- **How:**
  - Lower faucets: what fish, fruit and beach finds sell for, job pay, Summit Kick pay, the daily kick-off, and the Training meter.
  - Diminishing returns at Rosa's: *"Rosa already has plenty of mangoes today"*.
  - Slightly dearer Kit Shop items (ball 160, boots 240, jersey 330).
  - Learning coins went up a little (quiz 15, ball 12).
- **Nothing already earned or bought changes.** Every saved coin and every purchase keeps its saved amount (§8).

## 2. Audit: every coin source

"Cap" means the limit before the Training meter. The meter is the one daily budget over every **repeatable** earning: jobs, market sales, arcade payouts, Summit Kick and card trade-ins. It pays full until a number of coins, then half until a second number, then a 1-coin thank-you tip per earning. Learning coins and the daily kick-off are never metered.

| Source | Where | Before (14 Oct, pre-rebalance) | After | How often / cap |
|---|---|---|---|---|
| Welcome coins | `STARTER_COINS` | 40 | 40 | once ever |
| Daily kick-off | `DAILY_PLAY_COINS` | 30 | **20** | once a local day, after 30 s of active play |
| Lesson quiz | `LEARN_COINS.quiz` (+ `quizPerfect`) | 12 (+6 perfect first try) | **15** (+6) | once per lesson ever (96) |
| Hidden ball | `LEARN_COINS.ball` | 10 | **12** | once per ball ever (100) |
| Story / journey stage / explore item / path | `LEARN_COINS` | 10 / 8 / 5 / 75 | unchanged | once each |
| Daily warm-up / book check | `LEARN_COINS.review` / `.book` | 2 (max 3 a day) / 5 | unchanged | warm-up 6 a day max; book check once per book |
| Island jobs (13) | `JOB_PAY` | short jobs 7–10, wall rebounds 26 | **4–7, wall rebounds 16** | per job per day: 2 full, 2 half, then 1-coin tips; +4 the first time ever; metered |
| Fishing | `fishSellValue` | species price: commons 2–4, uncommon 5–6, rare 9–10, legendary 12–18 (mean catch ≈ 3.9) | **× ½ / 0.6 / 0.7 / 0.8 by rarity**: commons 1–2, uncommon 3–4, rare 6–7, legendary 10–14 (mean catch ≈ 2.3) | 18 spots (Oct 14: two deep-sea boats, Drop-off Ledge), about one cast every 0.6 min; sold at Rosa's (market rules below); metered. Deep-sea boats and hotspots: §4b |
| Garden, orchard and forage produce | `PRODUCE_SELL` | 2–3 | **everyday fruit and veg 1; mango, coconut, papaya, guava, avocado 2** | garden: 39 spots regrowing; Summit Isle trees: `FORAGE_DAILY_CAP` 8 fruit a day; sold at Rosa's or the farm stand; metered |
| Beach finds | `beachFindValue` (`BEACH_FIND_VALUE`) | placeholders 2 / 3 / 5 / 10 | **1 / 2 / 4 / 8**; living animals put back: 1 (one-off kindness) | the rotation itself: 23 finds a day over three islands; sold at Rosa's; metered |
| Harvest day / garden shift share | `harvestShare.ts` | 3/2/1 and 2/1/1 items | unchanged item counts, now worth 1–2 each | per shift, through the market |
| Market allowance | `MARKET.allowance` | full price until 40 coins sold today, then half (at least 1) | **30, then half; same-kind ladder (§5)** | daily, resets at local midnight |
| Summit Kick | `SUMMIT_KICK_COINS` | 2 a hoop + 4 for 5/5 (max 14) | **1 a hoop + 3 (max 8)** | per 90-s round; metered; the first 5/5 ever also pays 5 learning coins |
| Arcade rounds | `ARCADE_COIN_CAPS` | caps 12 / 15 / 18 / 20, Pass Puzzles 5 + stars | unchanged (also the save clamp, never lowered) | per round; metered |
| Card trade-ins | `CARD_TRADE` | 2 coins, 3 a day | unchanged | metered |
| **Training meter** | `TRAINING` | full to **60**, half to **120**, then 1-coin tips | full to **40**, half to **80**, then tips | one budget a day across all repeatable earning |

## 3. Audit: every coin sink

| Sink | Where | Price before | After |
|---|---|---|---|
| 3-card / 5-card pack | `PACK_PRICES` | 40 / 60, 3 packs a day | unchanged |
| Ball / special ball | `VENDING_PRICES` | 20 / 35 | unchanged |
| Scooter / bike / moped / flight | `VENDING_PRICES` | 30 / 40 / 50 / 70 (unlocked by finished paths) | unchanged |
| Island animal | `VENDING_PRICES.costume` | 30 (unlocked by hidden balls) | unchanged |
| Pop-up book | `BOOK_PRICE` | 100 (user decision) | unchanged |
| Arcade play | `ARCADE_PLAY_COST` | 3 (Pass Puzzles free) | unchanged: stays cheap |
| Kit Shop ball (plain) | `BALL_PRICES.base` | 150 | **160** (extras unchanged: up to +270) |
| Kit Shop boots (plain) | `BOOT_PRICES.base` | 200 | **240** (extras unchanged) |
| Kit Shop jersey (plain) | `JERSEY_PRICES.base` | 300 | **330** (extras unchanged) |
| Konbini food / drink machines | `lib/konbini/food.ts`, `lib/town/drinkMachines.ts` | 3–11 / 3–6, 3 food + 3 drinks a day | unchanged: consumables; the bands live in `lib/economy.ts` |
| Rides and fuel | `lib/town/fuel.ts` | no coin cost; refuelling uses Konbini food or free fruit | unchanged |

Why vending, packs and books keep their prices: the faucet cut already makes them cost about a quarter more play time. A 3-card pack should stay a one-session treat. The Kit Shop studios are the big goals, so they got the modest price rise. The user's floors (jersey 300+, boots 200+, ball 150+) are kept and checked in `tests/economy.cjs`.

## 4. Session model (`scripts/economy-sessions.cjs`)

The model plays one session on a fresh day:
- learning first;
- then jobs, arcade and Summit Kick;
- then gathering;
- then everything is sold at Rosa's with the **real** market quote and the **real** Training meter.

Catches and finds are drawn from the real spot and beach weights (60 seeded sessions averaged). Minutes per activity are estimates, not playtest data:

| Activity | Minutes per unit |
|---|---|
| Lesson | 4 |
| Hidden ball | 3.5 |
| Fishing, per cast | 0.6 now (0.75 before the 16 spots and quicker cast); 80% land |
| Summit Isle fruit | 0.5, incl. walking between trees and the trip to a stand |
| Garden pick | 0.2 |
| Beach find | 0.5 |
| Job shift | `JOB_MINUTES` + 0.6 |
| Arcade round | 3 (Strikers 3.8) |
| Summit Kick round | 1.5 |

Profiles (minutes):

| Profile | Daily kick-off | Lessons | Hidden balls | Jobs | Fishing | Fruit | Garden | Beach | Arcade | Kick |
|---|---|---|---|---|---|---|---|---|---|---|
| Typical kid, 15 min | 0.5 | 4 | 3.5 | 1.6 | 3 | 2.2 | | | | |
| Grinder, 15 min | 0.5 | | | 3.5 | 7 | 4 | | | | |
| Typical kid, 45 min | 0.5 | 12 | 7 | 5 | 7 | 4 | | 3 | 3 | 3.5 |
| Grinder, 45 min | 0.5 | | | 10 | 16 | 5 | 3 | 6 | | 4.5 |

Configs:
- **Before (11 Oct):** before the recent boosts: 13 fishing spots and the older cast, no fruit trees, Summit Kick or beachcombing. Fruit time went to the garden then.
- **Now:** 14 Oct, pre-rebalance.
- **After:** `lib/economy.ts` as it is now.

### Coins per session

| Profile | Before (11 Oct) | Now (pre-rebalance) | **After** | After: learning / daily / jobs / market / arcade / kick |
|---|---|---|---|---|
| Typical kid, 15 min | 102 | 93 | **73** | 31 / 20 / 5 / 17 / 0 / 0 |
| Grinder, 15 min | 100 | 96 | **64** | 0 / 20 / 16 / 28 / 0 / 0 |
| Typical kid, 45 min | 174 | 174 | **150** | 79 / 20 / 22 / 19 / 4 / 6 |
| Grinder, 45 min | 146 | 150 | **96** | 0 / 20 / 41 / 27 / 0 / 8 |

The model says the recent boosts did not raise per-session totals much: the Training meter already capped grinders, and the old garden (2–3 coins a pick) was already the hottest faucet. Their effect was breadth. There were more places and ways to earn, with less travel: fishing went from 4.2 to 5.1 coins a minute, and fruit trees (5.5), Summit Kick (4.0) and beachcombing (3.6) were all new. The real problem was that **everything paid too much against the new Kit Shop goals**: before, a 15-minute session bought a Kit Shop ball in 1.5 sessions.

### Sessions to buy (no spending in between)

| Profile | 3-card pack | Arcade plays | Kit ball | Kit boots | Kit jersey |
|---|---|---|---|---|---|
| Typical 15 min, now | 0.43 | 30 | 1.6 | 2.2 | 3.2 |
| **Typical 15 min, after** | **0.55** | **24** | **2.2** | **3.3** | **4.6** |
| Grinder 15 min, after | 0.63 | 21 | 2.5 | 3.8 | 5.2 |
| Typical 45 min, after | 0.27 | 50 | 1.1 | 1.6 | 2.2 |
| Grinder 45 min, after | 0.42 | 32 | 1.7 | 2.5 | 3.4 |

How each target turned out:
- **"A casual 15-minute session buys 1–2 small treats":** met. 73 coins is one pack plus about ten plays, or two packs over two days.
- **"Ball 2–3 sessions, boots 3–4, jersey 4–6":** met, for the learner and the grinder alike.
- **Longer sessions:** a 45-minute player gets there in about half the sessions, but in about 1.5× the minutes per coin of before.
- **Once lessons run out:** the grinder-15 row is what a 15-minute player earns. It is still inside every target.

### Coins a minute: learning pays best

| Activity | Full price, now | Full price, after | 15-min block on a fresh day, after (market rules + meter) |
|---|---|---|---|
| Lesson quiz | 4.0 | **4.7** | **4.7** |
| Hidden ball | 2.9 | **3.4** | **3.4** |
| Jobs (median / best) | 6.3 / 7.3 | 3.9 / 4.6 | 3.2 |
| Fishing | 5.1 | 3.1 | 2.5 |
| Summit Isle fruit | 5.5 | 3.3 | 2.4 (8 a day, then the garden) |
| Garden | 11.9 | 5.0 (first 4 of a kind) | 2.2 |
| Beachcombing | 3.6 | 2.1 | 1.4 |
| Summit Kick | 4.0 | 2.0 | 2.1 |
| Best arcade round (net of the play) | 2.3 | 2.3 | n/a |

- Before the rebalance, every chore and grind paid more per minute than a lesson. Now a lesson beats everything, and a hidden ball beats every fish, fruit and beach grind.
- The one full-price exception is the first four garden picks of a kind (1 coin each in 12 s). The ladder halves them after that, so a garden session pays 2.2 a minute.
- `tests/economy.cjs` §11c asserts all of this.

### 4b. Deep-sea boats, hotspots and spooked water (Oct 14 2026)

User: *"increase the probability of bigger fish on boats since it's in deep sea"* and *"cast in certain spots to try and catch bigger fish. not cast in the same spot"*.

| Lever | Where | Value |
|---|---|---|
| Deep-sea boost (both boats) | `fishCatalog.ts` `DEEP_BOOST` | weights × common 0.85, uncommon 1.15, rare 1.6, legendary 1.6. Rare + legendary catches on a boat: 9.4 → 15.5 in 100. Every catch also rolls bigger (size never changes the price). |
| Slower deep-water bite (the compensation) | `DEEP_BITE_DELAY` | +8 s on every wait at a boat (the fish rise from far below) |
| Hotspot boost (all spots) | `fishingOdds.ts` `HOTSPOT_BOOST` | uncommon × 1.25, rare and legendary × 1.75, commons × 1 |
| Cap (boat + hotspot) | `BOOST_CAP` | no rarity's weight is multiplied by more than 2 in total |
| Spooked water | `fishingAim.ts` | a cast within 2.5 m of one in the last 90 s: up to 2.5 × the wait, smaller fish, and the hotspot boost is cancelled there |

Why a slower bite rather than a fee to board: a boat catch is worth about 2.89 coins (shore 2.29), so the boats really do pay more per fish, but the extra 8 s per cast brings coins a minute back to about 3.15 against the shore's 3.06 at full price (+3 %). On a hotspot every cast, the worst case, a boat pays 3.36 and the shore 3.25 a minute, both below a hidden ball (3.43) and a lesson quiz (4.72). Spooked water stops anyone farming one patch, and the market's daily allowance and ladder still cap what a day of fishing can sell for. `tests/economy.cjs` §3 checks all of it.

## 5. Diminishing returns at Rosa's stand

The rules live in `lib/economy.ts` (`MARKET`, `marketUnitValue`, `payFromTally`) and are applied in `lib/town/market/market.ts` (`quoteSale`).

1. **Same-kind ladder ("Rosa already has plenty of mangoes today").** Each good is counted per local day:
   - the first 4 sold today fetch full price;
   - the next 4 fetch ½;
   - the rest fetch ¼.

   Mixing kinds pays better. For example, 4 mangoes + 4 papayas + 4 guavas = 24 coins, but 12 mangoes = 14. Rare and legendary fish and finds are exempt, so rare items stay valuable.
2. **Daily allowance.** Full prices until 30 coins of goods are sold today (was 40), then everything is worth half.
3. **Rosa's tally (part-coins).** A 1-coin strawberry at ½ is worth half a coin. Rosa keeps a per-good tally and pays a whole coin each time it fills ("2 for 1 coin", "4 for 1 coin"). Nothing is rounded away and nothing is rounded up, so selling one at a time pays exactly what "Sell all" pays. The old "at least 1 coin per item" floor meant a 1-coin good ignored every soft cap. That loophole is closed.
4. **The Training meter** then applies to the coins of the sale (40 full, half to 80, then tips).

**UI honesty:**
- Every basket line on the stand shows the live price: "2 coins each", "1 coin each" or "2 for 1 coin".
- When the ladder applies, a kind note appears under the line: *"Rosa already has plenty of mangoes today: 1 coin each. Fresh tomorrow!"*
- The sale message says so too and suggests selling something different.
- The allowance bar explains both rules.
- The island pocket shows the same per-item text.
- The catch card and the Fishbook show the new fish values.
- The arcade coins panel reads the pack and play prices from `lib/economy.ts`.
- The Kit Shop studios already read `bootPrice` / `ballPrice` / `jerseyPrice`, which now read `lib/economy.ts`.

## 6. Long-run pace (`scripts/economy-sim.cjs`, 5-seed means, 250 days)

This sim covers owning every vending item and every book. It does not include the Kit Shop.

| Player | Own everything, before | After |
|---|---|---|
| Casual, 15 min daily | day 121 | day 162 |
| Regular, 20 min daily | day 85 | day 99 |
| Engaged, 45 min daily | day 49 | day 60 |

- The regular-player target moves from 60–90 days to **85–120 days** (`tests/economy.cjs`, `PACE`).
- Saving-up sessions are now allowed to fill up to a fifth of the sessions before completion (casual: 26 of about 160).
- Both follow from the user's request: buying should feel earned, and the Kit Shop goals are on top of this.
- Learning is about 60% of all coins in days 8–30 (was 48–51%).

## 7. Centralised numbers: where to tune

`lib/economy.ts` is the one table:

| Area | Constants |
|---|---|
| Learning and grants | `LEARN_COINS`, `STARTER_COINS`, `DAILY_PLAY_COINS` |
| Training meter | `TRAINING` |
| Jobs | `JOBS`, `JOB_PAY`, `JOB_PAY_BAND` |
| Market | `MARKET` (allowance, ladder, basket), `FISH_SELL_FACTOR` / `fishSellValue`, `PRODUCE_SELL` / `produceSellValue`, `BEACH_FIND_VALUE` / `beachFindValue` |
| Island activities | `FORAGE_DAILY_CAP`, `SUMMIT_KICK_COINS` |
| Arcade and trade-ins | `ARCADE_PLAY_COST`, `ARCADE_COIN_CAPS`, `PUZZLE_FIRST_SOLVE_COINS`, `CARD_TRADE` |
| Prices | `VENDING_PRICES`, `PACK_PRICES`, `PACKS_PER_DAY`, `BOOK_PRICE`, `KIT_SHOP_MIN`, `JERSEY_PRICES`, `BOOT_PRICES`, `BALL_PRICES`, `KONBINI_PRICE_BAND`, `DRINK_PRICE_BAND` |

The modules that read it:
- `learnCoins.ts`, `dailyPlay.ts`, `dailyMeter.ts`, `jobs/jobEconomy.ts`;
- `market/goods.ts`, `market/market.ts`, `market/marketStand.ts`, `market/pocket.ts`, `market/cardSelling.ts`;
- `summitForage.ts` (cap only), `summitKick.ts`, `beachcombing.ts` (values only);
- `arcade/arcadeWalletCore.ts`, `arcade/legendPacks.ts`, `vendingCatalog.ts`, `books/catalog.ts`;
- `shop/jersey.ts`, `shop/boots.ts`, `shop/ball.ts`.

`tests/economy.cjs` §11g fails if any of them drifts from the table.

**For the in-flight agents (14 Oct 2026):**
- **Fruit trees** (`summitForage.ts`, `summitOrchard.ts`): all eight fruit kinds are priced in `PRODUCE_SELL`. A new kind must be added there; until then `goods.ts` prices it at about half its literal (1–2), and the test lists missing kinds. `FORAGE.dailyCap` reads `FORAGE_DAILY_CAP`. Placement and animation are untouched.
- **Beachcombing** (`beachcombing.ts`): the rows keep their original `value:` literals as design notes, but `BEACH_FINDS` maps each row through `beachFindValue`. Tune values in `BEACH_FIND_VALUE`; a new find without a row gets 1 / 2 / 4 / 8 by rarity, 1 for a living animal, 0 for look-only. Placement is untouched.
- `goods.ts` produce `price:` literals are only fallbacks. Add new goods to `PRODUCE_SELL`.

## 8. Saves: nothing is taken away

- **Coins already earned:** every coin is a saved wallet run with its own `paid`, and every purchase stores its own cost.
  - Lowering pay or sell values changes only future runs.
  - The saved-run clamps (`ARCADE_COIN_CAPS`, the learn cap 75 and `LEGACY_DAILY_PLAY_MAX` 40) were not lowered, so old 30- and 40-coin daily receipts, 26-coin wall-rebound shifts, 18-coin quizzes and 10-coin balls load whole.
  - `tests/economy.cjs` §11h and `tests/arcade-wallet-spending.cjs` load such a save and check the balance.
- **Learning ids pay once ever.** A lesson or ball paid at the old value keeps it and is never re-paid at the new one.
- **Kit Shop items** bought at 150 / 200 / 300 keep their saved price (`fi2-shop-owned-v1`).
- **No new storage key.** The ladder's per-good counts and Rosa's tallies are two optional fields (`byGood`, `tally`) inside the existing **synced** key `fi2-market-v1`:
  - **Synced** because a second device must not reset Rosa's ladder, and the key already syncs.
  - Like `soldToday`, they reset at local midnight.
  - An old save without them loads with 0 sold today.
  - Documented in `lib/saves/snapshot.ts` and `docs/accounts-design.md`; `tests/game-saves.cjs` passes.

## 9. Tests touched (numbers deliberately updated)

| Test | Change |
|---|---|
| `economy.cjs` | ball 12; job band 4–7; allowance 30; harvest 6, garden shift 6; pace target 85–120 days and saving sessions ≤ 1/5; drink set ≤ 1.25 casual days; warm-up bound relative; new §11 (sessions, targets, diminishing returns, learning first, Kit Shop floors, one table, no balance reduced) |
| `island-jobs.cjs` | new pays and tiers; produce 1–2; the ladder and tally in the market checks; per-minute check that every job pays less than a lesson |
| `fishing.cjs` | fish sell values from `fishSellValue`; new stand amounts; same-kind ladder, legendary exemption, sell-one = sell-all |
| `arcade-wallet-spending.cjs` | meter 40/80; quiz 15, ball 12; forward-only check for old receipts |
| `daily-play.cjs` | 20 a day, old 30- and 40-coin receipts kept |
| `summit-kick.cjs` | 1 a hoop + 3, max 8 |
| `summit-life.cjs` | trail clean-up in the 4–7 band |
| `shop-ball.cjs` | base 160 (read from `PRICE.base`) |
| `sell-shop.cjs` | half price with the tally |
| `island-pocket.cjs` | half price with the tally |
| `fuel.cjs` | pace target 85–120 |
