# Futbol Island coin economy: audit and proposal (28 Sep 2026)

**Applied 28 Sep 2026 with user decisions: books 100, no calendar, trade-ins kept, light Icon gate.** Everything else in §5 and §8 is in the code: welcome 40, daily play 30 (old 40-coin receipts kept), learning coins, the Training meter (trade-ins count toward it), free Pass Puzzles, 3 NPC picks a day, the new pack and vending prices, 3 packs a day and the pack dead-end fix. `node scripts/economy-sim.cjs` now reads all of it from the code as `current`; `proposed` is the original overlay (calendar + 120-coin books) for comparison. The sections below are the original audit and proposal, unchanged except the new §6a results.
Simulation: `node scripts/economy-sim.cjs` (add `--days 60` or `--json` if needed). It loads the real constants from the game code, so it stays in step when prices change.

---

## 1. TL;DR

- **Overall pace is roughly right for a regular player, but where the coins come from is wrong.** A 20-minute daily player owns everything in about 70 days (85 days once all 32 books are written). But **learning pays 0 coins**. Every coin comes from jobs, the arcade, the market, the daily-play bonus and the 30 welcome coins. Lessons, quizzes, hidden balls, stories and paths pay cards only.
- **Keen players get flooded.** There is no daily limit across the game: the arcade has none, fish keep selling at half price, and jobs keep paying 1-coin tips. A 45-minute player has bought everything by day 37 and then earns about 220 coins a session with nothing to buy. In the sim they have about 10,500 unspent coins by day 90.
- **Bug: the binder can become impossible to finish.** Once the lessons run out, the last Icon cards can never be earned. NPC, ball, story and explore rewards never offer Icons, and a pack goes off sale once fewer than 2 of its legends are missing. In the sim a keen player is stuck at 443/450 forever.
- **Packs skip the Icon tier gate.** For 30 coins on day 1, every mystery pack gives one of the 6 legends, and all 6 are Icons. The regular slots can also give 12–17 other Icons. This conflicts with the Sep 25 rule that the biggest cards should come near the end of paths.
- **Proposal:**
  - Pay coins for learning, so learning earns 38–45% of all coins in the first month.
  - Add one gentle daily soft cap on repeatable activities: full pay to 60 coins, half pay to 120, then 1-coin tips.
  - Add a forgiving "Matchday calendar": every 5th day you play (the days don't have to be in a row) gives a free pack.
  - Raise prices about 30–50% to match the higher income. Machines restock packs every day (3 packs a day).
  - Keep a pack on sale while it can still give a new card.
  - Cut NPC card picks from 5 to 3 a day.
  - Result: regular players finish in about 69 days now (87 with 32 books), keen players in 39 (52), and no session before completion is ever empty or flooded.

---

## 2. Audit: what the code does today (read from source, 28 Sep)

### 2.1 How much content there is

| Content | Count | Where |
|---|---|---|
| Cards | **450**: 400 players (current + all-time, 11 roles incl. 77 futsal) + **50 coaches** | `lib/town/positionPlayers.json`, `cardRoster.json`, `cardCollection.ts` |
| Card tiers | **35 Icon · 81 Elite · 334 Regular** (demand ≥85 Icon, ≥72 Elite) | `cardTiers.json`, `cardRewards.ts` |
| Lessons with quizzes | **96** (4 paths × 12 core lessons = 48, plus 48 depth lessons); every quiz has ≥5 questions | `lib/paths/formatPaths.json`, `lib/town/quizManifest.json` |
| Paths | 4 (futsal, 7v7, 9v9, 11v11) | `lib/paths/formatPaths.ts` |
| Hidden balls (ball hunt) | **80** | `lib/town/coinQuest.ts` |
| Learning Journeys | 3 journeys × 6 stages = **18** | `lib/town/learningJourneys.ts` |
| Path stories | 6 + 16 upcoming = **22** | `lib/paths/stories.ts`, `upcomingStories.ts` |
| Explore items that pay a card | 6 of 16 | `exploreChecklist.ts`, `cardRewardTriggers.ts` |
| NPCs | 70 | `npcDialogues.ts` |
| Iconic plays (watchable) | 400 (no rewards attached) | `iconicPlays.json` |
| Arcade games | **5**: Strikers (180 s match), Breakaway, Tennis, Pinball, **Pass Puzzles (24 scenarios)** | `lib/arcade/arcadeCatalog.ts`, `lib/passPuzzle/scenarios.ts` |
| Island jobs | **10** | `lib/town/jobs/jobCatalog.ts` |
| Fishing | 10 species, 5 spots | `lib/town/fishing/fishCatalog.ts` |
| Garden | 39 pick spots (24 beds regrow in 3 min, 15 tree fruit in 4 min) | `lib/town/jobs/garden.ts` |
| Vending | 8 machines. Regular rows: 2 packs, 6 balls (1 free), 24 rides (4 free starters), 24 island animals. Specials: 8 special balls, 8 themed packs, **32 books (15 ready now, 17 "coming soon")** | `lib/town/vendingCatalog.ts`, `lib/books/catalog.ts` |

### 2.2 How cards are earned (every card is new, no duplicates)

| Source | Cards | Rule |
|---|---|---|
| Hidden ball found | 1 per ball (80) | Choose 1 of 3 face-down; never an Icon |
| Lesson quiz | 1 per lesson (96 max) | Only for **perfect on the first try**, once per lesson ever; missing it loses that card permanently |
| Explore item | 6 | Never an Icon |
| Journey stage | 18 | Icon possible |
| Story watched | 22 | Never an Icon |
| Path finished | 4 | Icons only |
| NPC chat | **5 per day, forever** (one per NPC per day) | Never an Icon |
| Mystery pack | 3 cards for 30 / 5 for 50 (25% chance of a 2nd legend) | 1 of the 6 mental-strength legends (all Icons) + fresh current players; **no tier gate** |
| Themed pack (1 per machine) | 3 cards for 30 | One all-time card of the role + two current cards; **no tier gate** |
| Card trade-in (removes a card) | −1 card, +2 coins | 3 per day; Icons and pack legends are protected |

A pack is on sale only while **≥2 of its legends and ≥size−1 of its regulars are still missing** (`vendingLedger.packFreshness`, `purchaseMysteryPack`).

### 2.3 Coin sources

Times per unit are estimates; the coin values, caps and rules are from the code.

| Source | Coins per unit | Min per unit | Coins/hour at full pay | Daily cap / cooldown |
|---|---|---|---|---|
| Welcome coins | 30 once (only if the wallet is empty) | — | — | once (`STARTER_COINS`) |
| Daily play | **40** after 30 s walking | 0.5 | — | once per local day (`DAILY_PLAY_COINS`) |
| Island job | 7–10 (avg 8.0); **+4** the first time for each job | ~1.5 incl. walking | ~320 | per job per day: 2 full, 2 half, then **1-coin tips forever**. Theoretical max ≈ 244 + tips |
| Fishing | 4.8 average per fish (3–12 by species) | ~0.6 per cast, 80% land | ~385 | market: full price until 40 coins sold per day, **then half price forever** (not really a cap) |
| Garden | 2–3 per fruit (full harvest = 93) | ~0.15 per pick | high, but only 39 spots | regrows in 3–4 min; shares the market's 40-coin allowance |
| Arcade Breakaway / Pinball / Tennis / Strikers | per-round caps 12 / 15 / 18 / 20; entry **3** | ~3 (Strikers ~3.8) | ~70–140 net | **no daily cap** |
| Pass Puzzles | first solve 4 + stars (7 max); repeat 1; entry **3** | ~1.5 | ~130 (first solves) | 24 first solves once; a repeat is net **−2** |
| Card trade-in | 2 | ~0.2 | — | 3 per day |
| **Lessons, quizzes, balls, stories, journeys, paths, NPC chats** | **0 coins** (cards only) | 1.5–4 | 0 | — |
| Testing grant | 50,000 | — | — | only via `?testCoins=50000` on the vending preview |

### 2.4 Coin sinks

| Item | Count buyable | Price | Total | Gate |
|---|---|---|---|---|
| Balls | 5 (classic free) | 15 | 75 | none |
| Special balls | 8 (one per machine) | 25 | 200 | none |
| Scooters / Bikes / Mopeds / Flight | 5 each (starter free) | 20 / 25 / 30 / 40 | 575 | **finished paths** (1 path opens rides 2, 2 opens 3, 3 opens 4, all 4 open 5–6) |
| Island animals | 24 | 20 | 480 | **hidden balls** (3 animals per 10 balls; the fox needs all 80) |
| Books | 15 ready now / 32 planned | 100 | 1,500 / 3,200 | ready story needed |
| Mystery / themed packs | 10 SKUs | 30 / 50 | as many as the card pools allow | ≥2 missing legends |
| Arcade entry | — | 3 per play | ongoing | — |
| **Total excluding packs** | | | **2,830** (15 books) / **4,530** (32 books) | |

---

## 3. What is wrong (evidence from the code and the sim)

1. **Learning pays no coins.** `creditRun` is only called by arcade games, jobs, the market, trade-ins, daily play and the starter grant. AGENTS.md says every system should steer toward learning football, but coins, the currency kids actually chase, come only from chores and arcade rounds.
2. **Nothing limits the daily total.** The arcade has no daily cap, fish sell at half price forever, and job tips never stop. In the sim a keen player earns about **220 coins a session** in days 31–90, has bought everything by **day 37**, and ends with about **10,500 idle coins**. There is no reason to earn after that point, and no reason to learn instead of grind.
3. **The binder can become impossible to finish** (a real bug). A keen player is stuck at 443/450 forever, missing Cristiano Ronaldo, Falcão, Buffon, Ronaldinho, Henry, Ibrahimović and Guardiola. Cause: once lessons, journeys and paths are used up, only NPC, ball and story offers remain, and those never offer Icons (`ICON_TRIGGERS`). Packs need **≥2** missing legends, so a pack with one missing Icon left goes off sale.
4. **Packs skip the Icon tier gate.** Every mystery pack guarantees one of the 6 legends, and all 6 are Icons. The regular slots can also give 12–17 other Icons and 36–45 Elites. So 30 coins on day 1 gets you what the path rules hold back until 80% of a path.
5. **Cards arrive quickly and mostly from packs.** In the sim, packs make up about **45–50%** of the binder. NPC chats can add 5 cards a day forever: that alone could fill 450 cards in 90 days.
6. **Daily play is most of a casual player's income.** 40 of their ~55 coins a session (about 73%) comes from walking for 30 seconds. That is a good return hook, but it pays more than the whole session's play.
7. **Puzzle repeats cost more than they pay** (3 to play, 1 back). That makes practising a football-thinking puzzle cost coins, which punishes the learning we want to encourage.
8. **Card trade-ins take learned cards out of the binder for 2 coins.** It is tiny, but it undoes a learning reward, and a traded card can be earned again, so the binder churns. RETENTION-RESEARCH.md recommends "no trading economy".
9. **Prices don't match effort.** A ride that needs a whole finished path (≈12 lessons, ≈50 minutes) costs 20–40 coins, less than a third of a book. An island animal that needs 10 found balls costs 20, less than a special ball that needs nothing.
10. **Edge case: lowering a constant can shrink old receipts.** `sanitizeArcadeWallet` clamps every saved run to the current caps: `DAILY_PLAY_COINS` for daily-play receipts and `ARCADE_COIN_CAPS` for game runs. Lowering either constant would silently shrink players' existing balances (see the §6 checklist).

What is already good (keep it): no real money, no duplicates, no expiry, no guilt copy, idempotent receipts, the per-job soft cap with friendly messages, fixed fish prices (never luck-sized), and first-job bonuses. Every player gets a first purchase in their first session (sim: pack on day 1 for every archetype).

---

## 4. Design targets

These come from common practice in kids' and casual games; they are not research findings.

| Target | Why | Metric in the sim |
|---|---|---|
| A meaningful reward in the **first session** (a pack within about 5 minutes) | Early success builds competence (self-determination theory); Animal Crossing teaches earning in the first minutes | first pack = day 1 |
| **Something new every session** (a card, an item or an unlock) | Children disengage when a visit gives nothing; "saving up" should last 1–2 sessions, not a week | empty sessions before completion ≈ 0; longest dry run ≤ 1 |
| **Learning pays best per minute**, with a card on top | AGENTS.md: steer toward football learning | learning share of coins in month 1 ≥ 35% |
| **Soft limits, not walls.** Pay goes from full to half to tips; nothing is ever blocked | Animal Crossing / kid-Roblox practice; avoids grind and "come back tomorrow" frustration | keen daily coins fall later on but never reach 0 |
| **Forgiving return reward** (days count, missing a day never resets anything) | Streak loss is a loss-aversion pattern that is unsuitable for 7–12 year-olds; a count of days played keeps the return hook without guilt | calendar pack every 5 play days |
| **Collection done in about 60–90 days for a regular player** (~45–60 for keen); casual keeps going for months | Long enough to stay a goal, short enough to feel possible | allCards / allBought day |
| **Never flooded before completion** | A pile of coins with nothing to buy makes coins meaningless | flooded-before-allBought = 0 |
| **No money loop, no duplicates** | Existing kid-safety rules (`noPackLoop`) | pack price > max trade value |

---

## 5. Recommendation

### 5.1 Coins per activity

| Activity | Today | **Proposed** | Notes |
|---|---|---|---|
| Welcome coins | 30 | **40** | Exactly one 40-coin pack in the first minute |
| Daily kick-off (30 s of walking) | 40 | **30** | Still more than a job, but no longer most of a session's income |
| **Matchday calendar** (new) | — | **free 3-card pack every 5th day played** | Counts days played, never resets, never expires. Shows 5 stamps with no countdown |
| **Lesson quiz, first completion** | 0 | **12** (+**6** if perfect on the first try) | Same trigger as the quiz card; once per lesson |
| **Hidden ball found** | 0 | **5** | Once per ball (80) |
| **Story watched to the end** | 0 | **10** | Once per story |
| **Journey stage** | 0 | **8** | Once per stage |
| **Explore card item** | 0 | **5** | The 6 that already pay a card |
| **Path finished** | 0 | **75** | Plus the Icon pick and the next ride unlock |
| NPC chat | 0 coins, 5 cards/day | 0 coins, **3 cards/day** | NPCs stay a card source |
| Island jobs | 7–10, 2 full + 2 half, +4 first time | **unchanged** | Per-job caps stay |
| Fishing / garden | as today | **unchanged prices**; market allowance stays at 40 | |
| Arcade rounds | caps 12/15/18/20, entry 3 | **unchanged** | |
| Pass Puzzles | entry 3, first solve 4 + stars, repeat 1 | **free entry**, first solve **5** + stars, repeat **0** | Puzzles are lessons; practice should never cost coins |
| Card trade-in | 2 coins, 3/day | 2 coins, 3/day, **or switch off** (user decision) | See §3.8 |
| **Daily soft cap** (new) | none | **Training meter:** repeatable earnings (jobs, arcade payouts, market sales, trade-ins) pay full to **60**/day, half to **120**, then 1-coin tips | Learning coins, the daily kick-off and the calendar are **never** capped. Resets at local midnight. Friendly copy, no countdown |

### 5.2 Prices

| Item | Today | **Proposed** | Count | Proposed total |
|---|---|---|---|---|
| 3-card pack (mystery, all-time greats, 8 themed) | 30 | **40** | — | — |
| 5-card pack | 50 | **60** (12 per card vs 13.3: a "saving pays" lesson) | — | — |
| Packs per day | unlimited | **3** ("machines restock at midnight") | — | — |
| Ball | 15 | **20** | 5 | 100 |
| Special ball | 25 | **35** | 8 | 280 |
| Scooter / Bike / Moped / Flight | 20 / 25 / 30 / 40 | **30 / 40 / 50 / 70** | 5 each | 750 |
| Island animal | 20 | **30** | 24 | 720 |
| Book | 100 | **120** | 15 now / 32 | 1,800 / 3,840 |
| Arcade entry | 3 | 3 (puzzles 0) | — | — |
| **Total excluding packs** | 2,830 / 4,530 | | | **3,850 / 5,890** |

### 5.3 Pack and card rules

1. **Keep a pack on sale while it can still give at least one new card.** Fill the other slots with other missing cards (still fresh-only). This fixes the dead-end in §3.3; in the sim every archetype can now finish the binder.
2. **Tier gate in packs (decision needed).** Keep the guaranteed mental-strength legend, since the user built packs around it, but **filter Icons out of the regular slots** until the player's tier gate opens (`tierGate(progress,'quiz').icon`). Alternatively, apply the gate to the legend slot too. The sim does not model this change; it only changes which cards appear, not how many.
3. NPC picks drop from 5 to 3 a day.

### 5.4 First session (what a new child sees)

1. **Welcome, +40** at the jobs board, and the first 30 s of walking gives **+30**. 70 coins after about a minute.
2. The first lesson or hidden ball pays coins **and** a card straight away (+12–18 / +5).
3. At the nearest machine they buy a **40-coin pack** (3 new cards), and usually a **20-coin ball** too.
4. The calendar shows stamp 1/5: "Play on 4 more days (any days) for a free pack."

Sim, day 1: casual +109 coins (1 pack), regular +139 (1 pack), keen +248 (2 packs, a book and a ball).

---

## 6. Simulation results (90 days, deterministic, `node scripts/economy-sim.cjs`)

"+32 books" means all planned books are written. Today 15 of the 32 are ready.

| Config | Player | Coins per session: day 1 / wk 1 / d8–30 / d31–90 | Learning % of coins (d1–30) | First pack / book / ride / animal (day) | Cards % d7 / d30 / d60 / d90 | Items % d30 / d60 / d90 | All cards | All bought |
|---|---|---|---|---|---|---|---|---|
| current | casual | 94 / 62 / 55 / 50 | 0 | 1 / 3 / 31 / 19 | 3 / 14 / 27 / 39 | 16 / 32 / 49 | — | — |
| current | regular | 106 / 84 / 68 / 84 | 0 | 1 / 2 / 11 / 5 | 10 / 40 / 85 / 100 | 39 / 72 / 100 | 69 | 70 |
| current | keen | 153 / 123 / 130 / **221** | 0 | 1 / 1 / 4 / 2 | 19 / 78 / 99 / **99 (stuck)** | 67 / 100 / 100 | **never** | 37 |
| **proposed** | casual | 109 / 72 / 62 / 61 | **27** | 1 / 3 / 34 / 13 | 3 / 17 / 32 / 46 | 15 / 31 / 47 | — | — |
| **proposed** | regular | 139 / 104 / 104 / 97 | **38** | 1 / 2 / 13 / 6 | 11 / 44 / 98 / 100 | 45 / 80 / 100 | 61 | 69 |
| **proposed** | keen | 248 / 221 / 176 / **149** | **45** | 1 / 1 / 3 / 4 | 22 / 88 / 100 / 100 | 79 / 100 / 100 | **35** | 39 |
| current +32 books | regular | 106 / 84 / 68 / 84 | 0 | 1 / 2 / 11 / 5 | 10 / 40 / 78 / 99 | 32 / 57 / 100 | never | 85 |
| current +32 books | keen | 153 / 123 / 132 / 220 | 0 | | 19 / 74 / 99 / 99 | 55 / 100 / 100 | never | 44 |
| **proposed +32 books** | regular | 139 / 104 / 104 / 97 | 38 | 1 / 2 / 13 / 6 | 11 / 44 / 87 / 100 | 37 / 65 / 100 | **70** | **87** |
| **proposed +32 books** | keen | 248 / 221 / 177 / 149 | 45 | | 22 / 82 / 100 / 100 | 61 / 100 / 100 | **41** | **52** |

Session quality. An **empty** session gave no new card, item or unlock. **Flooded** means ending with ≥150 coins and more than everything currently on sale.

| Config | Player | Empty sessions before completion | Longest dry run | Flooded before all bought | Peak idle coins (after completion) |
|---|---|---|---|---|---|
| current | casual | 0 / 52 | 0 | 0 | 0 |
| current | regular | 0 / 90 | 0 | 0 | 1,862 |
| current | keen | **53** (stuck binder) | **53** | 0 | **10,541** |
| proposed | casual | 1 / 52 (saving for a 120 book) | 1 | 0 | 0 |
| proposed | regular | 0 | 0 | 0 | 1,924 |
| proposed | keen | 0 | 0 | 0 | 6,557 |
| proposed +32 books | regular | 2 | 1 | 0 | 353 |
| proposed +32 books | keen | 0 | 0 | 0 | 4,885 |

What the numbers mean:
- **Casual (10 min, 4 days/week):** about 110 coins on the first day, then about 60 a session, a quarter of it from learning. They buy something or get a new card in 51 of 52 sessions; the one exception is a session spent saving for a book. The binder reaches about 17% / 32% / 46% at 30 / 60 / 90 days. This is an open-ended player for months, never stuck and never flooded.
- **Regular (20 min daily):** about 100 coins a day, 38% from learning in month 1. They buy something nearly every session. The binder is done around day 61 (70 with 32 books) and every item around day 69 (**87 with 32 books**), which is inside the 60–90 day target.
- **Keen (45 min daily):** in week 1 they earn about 220 a session, mostly from lessons. That is intended: learning pays. By month 2 they earn about 150, down from 221 today, because of the Training meter. Everything is done by day 39 (**52 with 32 books**), where today they finish by day 37 and then get stuck.
- **Still open:** once a keen player owns everything, coins pile up again (about 4,900 by day 90). Every finite catalogue ends this way. The fix is content, not prices: see §7.
- **Books set the pace.** Each new book adds 120 coins of goals. Releasing about 2 books a week keeps regular players inside the target without changing any numbers.

### 6a. Results as applied (28 Sep 2026, no calendar, books 100)

`node scripts/economy-sim.cjs` with `current` reading the applied constants (30 of 32 books ready at the time of the run, up from 15 when §6 was written; the ready-book count is read live, so these rows are not directly comparable with §6):

| Player | Coins per session d1 / wk1 / d8–30 / d31–90 | Learning % d1–30 | Cards % d30 / d60 / d90 | Items % d30 / d60 / d90 | All cards | All bought | Empty before done | Flooded before all bought | Peak idle |
|---|---|---|---|---|---|---|---|---|---|
| casual | 109 / 72 / 60 / 63 | 25 | 13 / 27 / 39 | 12 / 26 / 42 | — | — | 1 | 0 | 0 |
| regular | 139 / 105 / 104 / 96 | 39 | 43 / 86 / 100 | 40 / 71 / 100 | 71 | 80 | 0 | 0 | 935 |
| keen | 248 / 217 / 178 / 149 | 45 | 81 / 100 / 100 | 66 / 100 / 100 | 41 | 48 | 0 | 0 | 5,395 |

With all 32 books: regular all cards 71, all bought 82; keen 42 / 49. Without the calendar, casual players collect cards more slowly (39% at day 90 vs 46% in the proposal); regular and keen players are within a few days of the proposal. The sim still does not model trade-ins or the Icon gate in packs (it changes which cards appear, not how many).

---

## 7. Optional phase 2: an endgame sink (not in the sim)

These give completed players a reason to keep earning, and each teaches something:
- **Youth Academy fund:** donate coins to upgrade the island's kids' club (new nets, a floodlight, a kit), each with a real grassroots-football fact. Donations are visible on the island.
- **Trophy cabinet** (home decor exists, `HOME_DECOR_ENABLED`): 120–300 coin replica trophies, each with verified history (World Cup, Copa América, WSL, UEFA Futsal).
- **Kit designer:** buy your club's shirt colours and badge parts (teaches kit history: why Juventus wear stripes, and so on).

---

## 8. Change checklist (for when the user approves; nothing here is applied yet)

**Coins in**
- [ ] `lib/town/jobs/jobEconomy.ts`: `STARTER_COINS` 30 → **40** (update the comment; `tests/island-jobs.cjs`).
- [ ] `lib/town/dailyPlay.ts`: `DAILY_PLAY_COINS` 40 → **30**. **Also** `lib/arcade/arcadeWalletCore.ts` `sanitizeArcadeWallet`: clamp saved `daily-play:*` receipts to a separate `LEGACY_DAILY_PLAY_MAX=40`, otherwise existing 40-coin receipts shrink to 30 on the next load. Also update `tests/daily-play.cjs` and `docs/daily-play.md`.
- [ ] **Learning coins (new)**: add a `learn` source to `ArcadeCoinGame` / `ARCADE_COIN_CAPS` (cap ≥ 75, or credit through `splitCredit` chunks), with idempotent run ids that pay once ever:
  - `learn:quiz:<fmt>:<lessonId>`: 12, or 18 if perfect first try. Hook next to `earnForQuiz` (`lib/town/cardRewardTriggers.ts`) / quiz completion in `quizProgress.ts`.
  - `learn:ball:<spotId>`: 5, in `recordCoin(id,'collect')` (`lib/town/coinProgress.ts`).
  - `learn:story:<id>`: 10, where `earnForStory` is called (QuestLearningPath).
  - `learn:journey:<id>:<stage>`: 8, on `LEARNING_STAGE_COMPLETE`.
  - `learn:explore:<id>`: 5, in the `earnForExplore` watcher (CardOfferHost).
  - `learn:path:<format>`: 75, in the `earnForPath` watcher.
  - Toast copy: "+12 coins · You passed ‘…’".
- [ ] **Training meter (new, pure module, e.g. `lib/town/dailyMeter.ts`)**: full pay to 60, half to 120, then 1-coin tips; resets at local midnight; stored like the job ledger. Apply it in `jobWallet.credit`, the market credit (`islandWallet.ts`, `marketStand.sellOneGood`), arcade `creditRun` for runner/pinball/tennis/live/puzzle, and `cardSellingStore` credit. Show it in `ArcadeCoinsPanel` / IslandJobs as a meter with no countdown. Keep the per-job caps and the market's 40 allowance.
- [ ] **Matchday calendar (new)**: count distinct local play days (on the same daily-play qualification) and give a free 3-card pack on every 5th. `sanitizeArcadeWallet` drops packs with `cost<1`, so either allow `cost:0` for a `calendar:<n>` pack id or credit 40 coins as "Matchday calendar". Show a 5-stamp card.
- [ ] `lib/arcade/useArcadeEntry.ts` / `PassPuzzleGame.tsx`: skip `payArcadePlay` for `'puzzle'`. In `arcadeWalletCore.recordPuzzleBest`: first solve 4 → **5**, repeat 1 → **0** (and drop the 6-repeat visit counter).
- [ ] `lib/town/cardRewards.ts`: `NPC_PICKS_PER_DAY` 5 → **3** (`tests/card-rewards.cjs`).

**Prices**
- [ ] `lib/arcade/legendPacks.ts`: `MYSTERY_PACK_OPTIONS` → `{size:3,price:40}`, `{size:5,price:60}`; `LEGEND_PACK_PRICE` → 40. Themed packs follow automatically (`vendingCatalog.ts` reads `MYSTERY_PACK_OPTIONS`). `noPackLoop` still holds (max trade value 6 or 10 < 40 or 60). Update `tests/vending-machines.cjs` and `tests/sell-shop.cjs`.
- [ ] `lib/town/vendingCatalog.ts`: `VENDING_PRICES` → `{ball:20,specialBall:35,scooter:30,bike:40,moped:50,jetpack:70,costume:30}`.
- [ ] `lib/books/catalog.ts`: `BOOK_PRICE` 100 → **120**.
- [ ] Past purchases are safe: spends and packs store their own `cost`.
- [ ] Docs: `docs/vending-machines.md`, `docs/island-jobs.md` ("Market prices"), `docs/arcade-coins-2026-09-26.md`, and `docs/card-rewards.md` (packs section).

**Pack and card rules**
- [ ] **Packs restock daily**: `vendingLedger.buy` enforces 3 packs per local day (new `packDay` field) with the message "This machine restocks at midnight."
- [ ] **Dead-end fix**: `vendingLedger.packFreshness` + `arcadeWalletCore.purchaseMysteryPack`: a pack is available while `legends ∪ regular` still contains ≥1 missing card. Allow 0–2 legend slots, and fill the remaining slots with other missing cards (fresh-only, no duplicates). The wallet's `sanitizeArcadeWallet` multi-pack check (`legends.length>=1`) must accept a legend-less top-up pack. Add a test: a binder missing only 1 Icon can still finish.
- [ ] **Tier gate in packs (decision)**: filter `cardTier(name)==='icon'` out of the regular slots until `tierGate(progress,'quiz').icon`.
- [ ] Card trade-in: keep it at 2 coins × 3 a day, or set `CARD_TRADE_MODE='off'` (user decision).

**Verification after applying**
- [ ] `node scripts/economy-sim.cjs`: change `CURRENT` to read the new constants; it should then match `PROPOSED`.
- [ ] `npm test`, `tests/daily-play.cjs`, the arcade wallet suites, `tests/vending-machines.cjs`, `tests/sell-shop.cjs`, `tests/card-rewards.cjs`, `tests/island-jobs.cjs`, `tests/fishing.cjs`.
- [ ] Heat: all of these are event-driven ledger writes. There are no new timers, polling or render loops. The meter and calendar are computed on demand, like `dailyPlay.ts`.

---

## 9. Model assumptions and limits

- **Times are estimates, not playtest data:** lesson 4 min, NPC chat 1.5, story 4, journey stage 3, job 1.5 (incl. walking), fish cast 0.6 (80% land), garden pick 0.15, arcade round 3 (Strikers 3.8), puzzle 1.5, hidden balls 2 → 5 min as they get harder. First-try perfect quiz rate 65%. Arcade skill 45% / 55% / 70% of each round's cap (casual / regular / keen).
- **Time split** (share of minutes): casual balls 25, lessons 15, NPC 10, stories 3, jobs 15, arcade 17, fish 8, garden 7; regular 20 / 20 / 10 / 5 / 15 / 14 / 8 / 8; keen 15 / 20 / 7 / 5 / 18 / 17 / 9 / 9. Exhausted activities hand their time to the rest.
- **Spending:** a goal rotation (pack → newly unlocked ride or animal → book → pack → ball), buying the cheapest item in the goal category once affordable. Real children will differ. The policy counts purchases, not coins, so the pack share of the binder (~45%) barely changes with pack price. Treat the pack price as a feel and fairness decision; this sim does not measure it well.
- **Taken from code:** every coin value, cap, allowance, price, unlock gate, pack pool (real names and tiers), pack availability rule, tier gates and weights, NPC picks per day, fish weights and garden spots. `READY_BOOKS` is read live, so the "ready now" book count rises as book agents finish stories.
- **Not modelled:** card trade-ins, the tier-gate-in-packs change, the phase 2 endgame sinks, and multiple sessions per day. Everything here is desktop analysis, not device or playtest evidence.
