# Island jobs, Community Garden and the coin economy

> **Coin numbers updated 14 Oct 2026:** see [economy.md](economy.md) (the one table is `lib/economy.ts`). Values below may predate it.


Built 27 Sep 2026. Local only (not committed or deployed). Code: `lib/town/jobs/*`, `lib/town/market/*`, `components/IslandJobs.tsx`. Town has six small hooks, all marked in `components/Town.tsx` by the `jobs.` calls. Tests: `tests/island-jobs.cjs`, which is part of `npm test`.

Every job teaches work ethic plus one football skill or club value (AGENTS.md). Coins are in-game only. The design avoids anything that punishes or pressures the player: there are no streaks, no countdowns that cost coins, no odds, no lost progress and no guilt messages.

## 1. Research: football jobs that teach hard work

Each job is tied to one real football lesson. ✅ = built in phase 2.

| Job | Where on the island | Football lesson (one line) |
|---|---|---|
| ✅ Rake the leaves (groundskeeper) | 7v7 Old Town Ground | Wet leaves make a pitch slippery and make a rolling pass skid or stop. A clean pitch gives truer passes and safer footing. |
| ✅ Paint the centre circle (groundskeeper) | 11v11 centre circle | The circle is 9.15 m (10 yds) from the centre mark, and opponents stay outside it at kick-off (IFAB Laws 1 and 8). Lines count as part of the area they mark. |
| ✅ Wall rebounds (practice partner) | Coaches Centre rebound wall | Every rebound is a pass and a first touch. Using both feet makes you harder to defend. |
| ✅ Ball kid | 11v11 touchline | Quick restarts win matches. On 7 May 2019 at Anfield, ball boy Oakley Cannonier (14) returned a ball fast, Alexander-Arnold took a quick corner and Origi scored to finish Liverpool 4–0 Barcelona. |
| ✅ Set out the cones (coach's assistant) | 9v9 Club Grounds, on the grass beside the pitch (§14) | A 10 m channel gives passers time. Narrow gates reward close control. The right space makes practice feel like a match. |
| ✅ Court clean-up (club volunteer / recycling) | Rooftop futsal court | Respect. After beating Germany at the 2022 World Cup, Japan's players left their dressing room spotless with a thank-you note and origami cranes, and Japanese fans tidied the stands. |
| ✅ Community Garden picking → market | Community Garden, then Rosa's stand | Nutrition and club culture (see §4). |
| Fix divots | Any pitch | Repairing divots keeps the ball rolling true, which is the same lesson as the leaves. Left as a variant. |
| Clear puddles / fork the pitch | 11v11 | Standing water stops the ball dead, which is why pitches drain. |
| ✅ Kit room (hang shirts by number) | Clubhouse, Island Square | Squad numbers started as positions in 1928: 1 keeper, 2/3 full-backs, 7/11 wingers, 9 centre-forward, 10 inside-left → playmaker (§3b). |
| ✅ Pump the balls | Eleven Park, behind the north goal | Law 2: a match ball is 0.6–1.1 atm at sea level (§3b). |
| ✅ Anchor the goals (groundskeeper) | Old Town Ground (7v7), behind both goals | Law 1: goals must be anchored securely to the ground; never swing on a crossbar (§3b). |
| Carry water / bibs | Any training | Hydration breaks, and bibs make teams readable. |
| ✅ Flag the offside (assistant referee) | Referee practice strip south of the Coaches Centre rebound lawn | Law 11, kid-simple: offside position = opponents' half + nearer the goal line than the ball and the second-last opponent at the moment of the pass; level is onside (§3b). |
| Programme / ticket seller | 11v11 gates | Club finances. It needs crowds, so it was not built. |
| Stand sweep after a match | 11v11 stands | Same lesson as the court clean-up. The rooftop court was chosen because the stands are collision boxes. |

Sources: [Oakley Cannonier (Wikipedia)](https://en.wikipedia.org/wiki/Oakley_Cannonier), [LFC](https://www.liverpoolfc.com/news/meet-academy-oakley-cannonier-famous-ball-boy-point-prove); [CBS: Japan dressing room](https://www.cbsnews.com/news/japan-upset-win-over-germany-japanese-players-leave-dressing-room-spotless/), [FourFourTwo](https://www.fourfourtwo.com/features/world-cup-2022-japan-didnt-just-clean-up-the-stadium-after-beating-germany-they-left-a-gift-in-the-dressing-room); [IFAB Law 1](https://www.theifab.com/laws/latest/the-field-of-play/).

## 2. Economy research

**How children's games pace earning:**
- **Club Penguin** gave new penguins 500 coins ([wiki](https://clubpenguin.fandom.com/wiki/Coin)). That was enough for one or two cheap clothing items on day one, and early mini-games paid tens to low hundreds of coins per play. The start was generous enough that nothing felt locked, but earning mattered right away.
- **Animal Crossing: New Horizons** starts with 0 Bells ([Nintendo Life](https://www.nintendolife.com/guides/animal-crossing-new-horizons-bells-how-to-make-bells-fast-nook-miles-and-money-explained)) and teaches earning in the first minutes. Its daily limits are soft, not walls: money rocks and fossils refresh each day. Nothing is lost by skipping a day.
- **Roblox** experiences vary widely. The kid-friendly ones use a small starter purse, repeatable fixed-price jobs and a daily bonus that does not punish missed days.
- **Toca Boca** has no currency at all. Everything is play. This is a reminder that currency must support play, not gate it.

**Principles taken from these games:**
1. Give a small welcome purse.
2. Make the first reward arrive within a minute.
3. Pay a fixed, visible amount for effort.
4. Use diminishing returns rather than hard walls.
5. Refresh daily with no streaks.
6. Keep prices a few activities apart, so saving is meaningful but never a grind.

> **Economy pass applied 28 Sep 2026** ([ECONOMY_PROPOSAL.md](economy/ECONOMY_PROPOSAL.md)): welcome coins 40, card packs 40 / 60, vending ball 20,
> special ball 35, scooter 30, bike 40, moped 50, flight 70, animal 30 (books 100). Arcade plays cost 3 (Pass Puzzles free; first
> solve 5 + stars, repeat 0). New **Training meter** (`lib/town/dailyMeter.ts`): job pay, arcade payouts, market sales and card
> trade-ins pay in full until 60 coins a day, then half until 120, then a 1-coin tip per earning; resets at local midnight and is
> shown in the island pocket. The per-job soft cap and the market's 40-coin allowance below still apply first. Learning coins
> (lessons 12 +6 perfect first try, hidden balls 5, stories 10, journey stages 8, explore items 5, paths 75) are never capped.
> The figures below are the 27 Sep originals.

**Prices in code before the economy pass (checked 27 Sep):**
- Arcade plays are **free** and *earn* coins, capped per round: Breakaway 12, Pinball 15, Tennis 18, Live match 20, Puzzle 4 + stars (`ARCADE_COIN_CAPS`). A good 2–3 minute round earns about 5–12 coins, so skilled play earns about 3–5 coins a minute.
- Card packs cost 30 (3 cards) or 50 (5 cards) (`lib/arcade/legendPacks.ts`).
- Vending machines (proposal in `lib/town/vendingCatalog.ts`): ball 15, costume 20, scooter 20, special ball 25, bike 25, moped 30, jetpack 40. The spendable balance is the arcade wallet minus vending spend (`lib/town/vendingWallet.ts`).

**Recommendation (implemented):**

| Setting | Value | Reasoning |
|---|---|---|
| Starting balance | **30 coins** (user decision, Sep 27 2026; buys exactly one 3-card pack), once, for new players and existing players whose spendable balance is 0 | Buys one small vending item (15–20), or two 5-coin arcade tries if the arcade ever charges. It is less than the 30-coin pack, so the first job (8–14 coins) immediately feels meaningful: "one job away from a pack". This mirrors Club Penguin's 1–2-item start. |
| Job pay | 7–10 base (cones 7, clean-up 7, leaves 8, line 8, ball kid 10); wall rebounds 26 since 30 Sep 2026, because it became a ~3.5-min drill (§11) | A job takes 30–60 s of real play, roughly the arcade's per-minute rate. A 30-coin pack takes 3–4 jobs; the cheapest vending item takes 2. |
| First-time bonus | +4 on each job's first completion | Encourages trying every job. It matches the arcade's +4 first puzzle solve. |
| Daily soft cap (per job) | 2 full-pay shifts → 2 half-pay shifts → 1-coin thank-you tips | There are no walls: the job is always playable. A friendly note explains the change ("The pitch is spotless! Come back tomorrow for full pay"). It resets at local midnight. There is no streak. |
| Daily ceiling | About 250 coins if a child does all ten jobs 4 times each (about 40 min; the test bounds it at 20–34 coins per job) | Casual play (each job once) earns about 80 coins plus bonuses: 2–3 packs a day. The per-job soft cap is unchanged; adding jobs adds variety, not a faster grind per job. |
| Market prices | Produce 1–2 coins each since 14 Oct 2026 (was 2–3); basket of 20; same-kind ladder ([economy.md](economy.md)) | A full basket of mixed produce is worth about 20–25 coins at full price. |
| Market soft cap | Full price until 40 coins of sales in a day, then half price (at least 1 coin); resets tomorrow | This is shared by produce and fish (`lib/town/market/market.ts`). |

**If the user wants arcade plays to cost coins:** charge 3–5 coins per play (not built, because that is Astra's file). The round caps (12–20) mean a decent round refunds its cost, which keeps the arcade skill-positive and avoids feeling like a slot machine.

## 3. Jobs built

Each job has a sign with the job's colour and title. Walk within 5 m: a gold ground ring lights up and the **"Island job · role / title — Go"** prompt appears (touch: tap; keyboard: **G**, because **J** is Juggle). That opens an intro card showing the pay (tier and bonus shown honestly), with *Start job* / *Not now*. While working, a compact HUD shows progress plus *Stop job* (no penalty). A beacon arrow marks the next goal. Every pickup plays the existing path "pop" cue. At the end, the payday card shows the coins earned with a coin burst (hidden under reduced motion), the chiptune finish cue, the football lesson, the soft-cap note, your time and your personal best (no time limit), and *Nice!* / *Work again*. Starting a job from a vehicle asks the ride to land/switch to walking.

| Job | Mini-task | Goal |
|---|---|---|
| Rake the leaves | Walk over 12 leaf piles spread across the 7v7 pitch, then empty the bag in the compost bin | 12 piles + bin |
| Wall rebounds | Stand in the painted box, face the wall and **Juggle**: the real wall-juggle mechanic (alternating feet) counts 10 clean returns. Then **Shoot** 3 passes into the painted target square (a real ball contact with the wall, `jobs.ballContact`) | 10 passes + 3 target shots |
| Ball kid | Run to each loose ball (behind the touchline and goal line), carry it back to the ball-kid spot on the halfway line, and repeat | 5 balls |
| Set out the cones | Step onto 8 glowing spots beside the 9v9 pitch to place cones for a 10 m passing channel and two dribbling gates (§14) | 8 cones |
| Paint the centre circle | Follow 16 faded dashes around the 9.15 m circle **in order**; each dash turns bright white | 16 dashes |
| Court clean-up | Pick up 10 bottles on the rooftop futsal court, then drop the bag in the recycling bin | 10 bottles + bin |

### 3b. Four more jobs (27 Sep 2026, user decision B)

Same engine (`lib/town/jobs/jobRules.ts`), economy, daily caps, first-time bonus (+4) and payday card. New job kinds: `sort` (kit room), `offside` (replays + a call) and `pump` (gauge); the goal anchors reuse `collect` with placed pegs. Task jobs show their buttons in the job HUD (one row) and a short feedback line. A wrong answer only explains and lets you try again: no coins or progress are ever lost.

| Job | Where | Pay | Mini-task (≈30–60 s) | Lesson on the payday card | Source (docs only) |
|---|---|---|---|---|---|
| Kit room (kit assistant) | Sign and kit hamper by the Clubhouse in Island Square (80, −40); a chalk mini-pitch with five position pegs laid out as a team attacking toward the Clubhouse | 8 | Take a shirt (9, 1, 7, 3, 10) from the hamper, read the clue ("Number 9 is the classic centre-forward…"), hang it on the right peg (GOALKEEPER, LEFT BACK, RIGHT WING, PLAYMAKER, STRIKER). No arrow while carrying; after one wrong peg the arrow shows the right one. Started from the sign or from the Clubhouse visit. | Numbers started as positions: Arsenal and Chelsea first wore numbers in league games on 25 Aug 1928; 1 goalkeeper, 2/3 full-backs, 7/11 wingers, 9 centre-forward; people still say "a number 9" and "a number 10". | [Squad number (Wikipedia)](https://en.wikipedia.org/wiki/Squad_number_(association_football)) — 2-3-5 numbering 1–11 and the 1928 first use |
| Flag the offside (assistant referee) | Referee practice strip on the open lawn south of the Coaches Centre rebound area (sign 138, −12.5 on the lawn north of the strip; flag spot 150, 2.2 on the near touchline. Moved 30 Sep 2026: both were inside the High School east wing, so the sign never offered; `tests/job-boards.cjs`). A painted strip (touchlines, halfway, goal line, small goal) is used instead of a real pitch because every real pitch has a live match on it. | 9 | Stand on the touchline spot: the camera eases to an assistant-referee view across the strip. Five 3-second replays (red attackers, blue defenders, yellow keeper, white ring on the attacker to watch). After each pass: **Raise the flag** or **Keep flag down**. Then the replay freezes at the moment of the pass with the yellow offside line and the explanation; a wrong call offers **Watch again**. Clips: level (onside), through ball (offside), timed run after the pass (onside), own half (onside), one step past (offside). The test recomputes each answer from the clip positions with Law 11. | Offside position = in the other team's half and nearer their goal line than both the ball and the second-last defender, when a team-mate passes. Level is onside; never offside in your own half; no offside from a throw-in, goal kick or corner. | [IFAB Law 11](https://www.theifab.com/laws/latest/offside/) |
| Pump the balls (kit assistant) | Eleven Park, behind the north goal (station 150, 44.5; sign 158, 43.5) | 10 (was 7, §14) | Five soft balls. Since 1 Oct 2026 (§14): many small **Pump** strokes (8 → 24 per ball), a slow leak when you stop, a green zone that narrows inside 0.6–1.1, **Let air out** (−0.15), **Ball ready** only in the zone. Outside it a gentle "squeeze test" says too soft / too hard. | Law 2: a match ball must be 0.6–1.1 atmospheres at sea level; too soft dies on your foot, too hard bounces away. | [IFAB Law 2](https://www.theifab.com/laws/latest/the-ball/) |
| Anchor the goals (groundskeeper) | Old Town Ground (7v7), sign at the north end (22, −110.5); three peg spots behind each goal | 8 | Step on the six glowing spots to hammer in a ground peg (a peg appears; you walk the length of the pitch between goals). | Law 1: goals must be anchored securely to the ground, and portable goals may only be used if they are; never swing or climb on a crossbar. | [IFAB Law 1](https://www.theifab.com/laws/latest/the-field-of-play/) |

Placement checks (`tests/island-jobs.cjs`): every sign is more than 10 m from every other sign and more than 8 m from the vending machines, the fishing posts and the Clubhouse door; the offside strip stays north of the buildings on its south side.

**Heat:** props exist only while a job runs and are disposed at the end. Kit room: one merged mesh (chalk lines + peg stands), one peg-label quad mesh and five small shirt quads sharing one 1024×256 canvas texture. Offside: one merged line mesh, one 5-instance capsule `InstancedMesh`, ball, ring, offside line and flag; matrices are rewritten only while a replay plays (≈3 s per clip) or when the phase changes. Pump: one merged station mesh plus a 5-instance ball rack, repainted only on a button press. The static sign mesh grew by four signs (still one draw) and the label atlas grew to 1024×640 (still one draw). The only new camera work is the shared `lib/town/shotCamera.ts` blend while a replay view is active (idle: one early return).

## 4. Community Garden and farmers market (user follow-up)

- The **existing Community Garden** east of the Coaches Centre (12 timber beds) now has **24 bed spots** (strawberries, tomatoes, carrots) and **15 tree fruits** (oranges on two trees, cherries on one). Walk up to ripe produce to pick it into the shared basket. Picked spots regrow in 3 min (beds) or 4 min (trees). About one in three spots starts "not ripe yet": the note says "Not ripe yet — this strawberry needs about 2 more minutes". Nothing is lost and there is no penalty. When the basket is full (20 items), the game says to sell it.
- **Selling:** at **Rosa's farmers-market stand** (fishing agent: `components/MarketStand.tsx`, stall at x 230, z 35), which has Fish / Produce / Cards tabs. Both agents share one registry, **`lib/town/market/goods.ts`** (produce section: jobs agent; fish section: generated from `lib/town/fishing/fishCatalog.ts`), and one basket/sell engine, **`lib/town/market/market.ts`**, paid through `lib/town/jobs/islandWallet.ts`.
- **Football tie-ins (verified):**
  - Half-time oranges: a youth tradition, mostly water plus quick sugar ([The Conversation](https://theconversation.com/how-and-why-did-half-time-oranges-in-junior-sports-become-a-tradition-234919)).
  - AFC Bournemouth are "the Cherries": cherry orchards beside Dean Court when the club moved there in 1910, plus cherry-red stripes ([Wikipedia](https://en.wikipedia.org/wiki/AFC_Bournemouth)).
  - Fruit carbohydrates fuel sprints.
  - Vegetables give vitamins for recovery.
  - A real meal plus water after training helps recovery.
- **Other gathering activities considered:** litter and recycling around the stands is covered by the **Court clean-up** job. Harvesting to sell for a youth-team kit fund is a good next step (for example, an optional "donate to the kit fund" jar at Rosa's stand that unlocks a team shirt). It needs a product decision, so it was not built.

## 5. Wallet integration and needed changes (Astra, arcade owner)

- The arcade wallet only accepts capped "runs" of its five games. Until it has an island source, **job, starter and market coins are credited as `live` runs** (cap 20 per run, larger credits split) with reasons "Island job · …", "Welcome coins · …" and "Farmers market · …". They are real, spendable coins and can buy packs (tested). Every run id is deterministic (`island-job:<id>:<day>:<shift>`, `island-starter-coins`, `market:<day>:<sale>`), so replays never pay twice.
- **Requested change in `lib/arcade/arcadeWalletCore.ts`:** add an `island` source (for example, cap 40) to `ArcadeCoinGame`, `ARCADE_COIN_CAPS`, `games` and `byGame`, and show history rows without a cabinet by their reason in `ArcadeCoinsPanel`. `jobWallet.ts` detects `ARCADE_COIN_CAPS.island` and switches automatically. Until then, the Coins panel counts island coins under **Live match** ("earned") in `byGame`.
- The island HUD balance shows the **spendable** balance (arcade wallet minus vending spend). Astra's Coins panel still shows the raw wallet balance. That is for the vending agent and Astra to reconcile.

## 6. Heat and runtime cost

- **Idle:** the ten job signs, bins, the kit hamper and rebound-wall paint are **one merged vertex-colour mesh**, and the sign labels are **one atlas mesh** (1024×640 canvas since the Sep 27 jobs): 2 draw calls, no animation, no per-frame work. One distance check against 10 signs runs every 0.25 s, plus one garden-range check every 0.1 s. The offer ring is a static mesh that is shown or hidden.
- **While a job runs:** props are one `InstancedMesh` of targets (plus one of placed cones for the cone job), a beacon (2 meshes) and a carried ball. They are built on start and disposed at the end. Per frame: at most 16 distance checks plus the beacon bob (static under reduced motion).
- **Garden:** one 39-instance `InstancedMesh`, visible only within 55 m of the garden. Instances are repainted only when you enter, every 5 s while inside (for regrowth) and on a pick. There is no per-frame animation.
- **HUD:** React only re-renders when the job view changes. The only timers are toast timeouts. Menus hide the HUD, and the scene pauses its update when the island is paused.
- This is desktop evidence only; phone temperature has not been measured.

## 7. Decisions for the user

1. Should the arcade charge coins per play (suggested: 3–5)? Today plays are free and earn coins.
2. Is 25 welcome coins right? The alternative is 30, which exactly buys a 3-card pack but makes the first pack free.
3. Is the soft cap right? Current: 2 full + 2 half shifts per job per day.
4. Should Astra add an `island` wallet source so the Coins panel lists jobs separately?
5. ~~Next jobs~~ Built 27 Sep: kit room, offside flag, ball pump, goal anchors (§3b). Still open: the youth kit-fund jar, and boot studs (firm vs soft ground) as a second kit-room round.
6. The offside job uses a painted practice strip rather than a real pitch, because the four pitches all run live matches. If you would rather it sat on a real pitch, the live match there would need to pause and hide during the replays (fieldRuntime change).

## 8. Clubhouse exterior (September 27 update)

The former Boot Room feature was removed. The building remains in Island Square, labelled CLUBHOUSE. Its former interior, coach story, Enter prompt, camera hooks and runtime are removed. The outdoor kit-assistant job keeps its existing progress and rewards, now identified as Clubhouse, Island Square. It is started from its job sign. The shared shot-camera utility remains for the assistant-referee activity. No new render loop, geometry or interior is added.

> **Sep 29 2026:** the Kit room job (kit assistant, Island Square cage court) was removed at the user's request. The generic `sort` task engine stays in jobRules/jobScene for future jobs.

## 6. Coral Cay Farm: Harvest day (29 Sep 2026, local, not deployed)

**Why it exists:** the user asked for a farm job ("that's why we are building this"). The farm is on Coral Cay, south of the beach-soccer court (`lib/town/coralCay.ts` `FARM`; built in `coralCayWorld.ts`).

| Job | Where | Pay | Mini-task | Lesson on the payday card | Source (docs only) |
|---|---|---|---|---|---|
| Harvest day (farm hand) | The Farm, Coral Cay. Sign inside the west gate (602.5, −115.5), facing the dirt track. | 8 (+4 first time) | Walk to the 10 glowing ripe crops, one of each kind: maize, greens, tomatoes, sweet potatoes, peppers, pineapples, melons, mango, orange, banana. Then bring the basket to the farm stand (611, −98). Uses the existing `collect` + deliver engine and a new `produce` prop (instanced, coloured per crop). | Food is fuel. Carbohydrate foods (maize, sweet potatoes, rice, bananas) are the main energy for running. Fruit and vegetables bring vitamins for recovery. Eat a proper meal a few hours before you play, and drink water, especially on a hot beach. | [FIFA, Nutrition for Football](https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf); also used by the farmers: Better Health Channel "Sporting performance and food" and Sports Dietitians Australia "What to eat before, during and post exercise". |

- **Economy:** unchanged rules. The job was added to `JobId`/`JOB_IDS` with `JOB_BASE_PAY` 8, and its done-line is "The harvest is in and the stand is full!".
- **Placement:** checked by `tests/island-jobs.cjs`.
  - The sign is more than 10 m from every other job sign.
  - It is more than 8 m from every vending machine (including the four new ones: north beach, causeway bend, Coconut Café, Sharks Beach), every fishing post and the Clubhouse doorway.
  - All targets are on open farm ground between the rows and trees, reachable through the fence gates (`tests/coral-cay.cjs` flood-fills them).
- **Heat:** the sign joins the merged job-sign mesh and the label atlas (5 rows for 10 jobs). The crop markers and basket exist only while the job runs.
- **Browser check:** desktop and 390×844. Offer at the sign → intro → start → 10/10 picked → stand → payday +12 (8 + 4 first-time bonus, lesson shown) → "Work again" → +8, with the done-line.
- **Since built:** the "Match-day snacks" sort job (§7).

## 7. Coral Cay Farm: Match-day snacks (29 Sep 2026, local, not deployed)

| Job | Where | Pay | Mini-task | Lesson | Source (docs only) |
|---|---|---|---|---|---|
| Match-day snacks (farm stand) | The Farm, Coral Cay: board at (618.2, −106.8), basket at (603, −104.8), crates at x 604 / 608.5 / 613, z −108.2 | 8 (+4 first time) | Sort 6 farm foods into 3 crates: PRE-MATCH MEAL, HALF-TIME, RECOVERY | Eat a proper meal 2–3 hours before, a quick carb snack at half-time, and protein plus carbs after | Sports Dietitians Australia fact sheets (URL in `jobCatalog.ts` `lessonSource`) |

- **Sort engine generalised.** `SortItem` gained `label` and `color`, and the sort task gained `style`, `source`, `itemNoun` and `slotNoun`. `jobScene.ts` gained a `produce` prop and `buildCrates`. As a result, the kit-room shirt job and the snacks job share one engine, and `jobRules.ts` wording is neutral.
- **Economy.** `JOB_BASE_PAY['match-day-snacks']` is 8. The done-line is "Every snack is in the right crate!".
  - The first-time bonus is now its own wallet run, `island-job-first:<id>` (`jobWallet.ts`), outside the daily training cap.
  - `tests/economy.cjs` and `tests/island-jobs.cjs` cover it.
- **Heat.** Same as Harvest day: the board joins the merged sign mesh and label atlas, and the crates and produce exist only while the job runs.
- **Browser check.** Desktop and 390×844: offer → intro → a wrong crate is rejected with a hint → 6/6 packed → payday. Screenshots are in `scratchpad/new-island/v3/{desktop,mobile}-snacks-*.png`.

## 9. Actions and animations for every job, and the physical Harvest day (30 Sep 2026, local, not deployed)

**Why:** the user asked for each job to have "some type of action and animation", not "walk to the glowing spot", and for
Harvest day picking to be harder and more physical, with the harvest showing up as fruit to sell.

**Rules (pure, `lib/town/jobs/jobRules.ts`).** A job's `work` (in `jobCatalog.ts`) lists the steps at each target and the one
action at the drop-off. Standing on a target only *arms* it; the HUD shows one action button. `tap` steps take `count` presses,
`hold` steps fill while the button (or Enter/Space) is held and keep their progress if you let go. Mistakes only explain.

| Job | Action (button) | Animation (`jobScene.ts`, `jobFx.ts`) |
|---|---|---|
| Rake the leaves | Hold to rake (1.1 s) → Bag it → Empty the bag at the bin | Pile swirls and tightens, leaves flutter; pile flies into a bag at your side that bulges; bag tossed into the bin |
| Wall rebounds | Juggle / Shoot (unchanged ball play) | White ring pulse where the ball hits the wall; the target square flashes on a target pass |
| Ball kid | Pick up the ball → Roll it back at your spot | Ball lifts into your hands; thrown in an arc to a player on the pitch, then rolls |
| Set out the cones | Place cone | A cone stack rides at your side; each cone drops onto its mark and settles with a wobble |
| Paint the centre circle | Hold to paint and walk | A line-marker trolley follows you; fresh white paint is laid under the wheel only while held and on the line (gaps otherwise, "Off the line!") |
| Court clean-up | Pick up → Toss in the bin | Bottle flies into a recycling bag that fills; bag tossed into the bin |
| Flag the offside | Raise the flag / Keep flag down (unchanged) | Flag arm raises with a whistle; green/red ring for a right/wrong call |
| Pump the balls | Pump / Let air out / Ball ready (unchanged) | Pump handle strokes; hiss and a puff when letting air out; squeak when over-pumped; green ring when ready |
| Anchor the goals | Hammer ×3 per peg | Hammer swings, the peg sinks a notch per hit, dust, a clank and a ring when anchored |
| Match-day snacks | Take a snack (basket) → Drop it in (crate) | Card lifts from the basket; tossed into the crate; lid flips and wobbles; red ring and shake for the wrong crate |

**Harvest day** (`kind:'harvest'`, `harvestScene.ts`): goal = **5 fruit + 5 veg** ("Fruit 2/5 · Veg 1/5" in the panel).
- *Fruit*: ripe mangoes, oranges and bananas hang on five orchard trees (3 each). Tap **Shake the tree** fast (3 quick taps; the
  energy drains if you stop). The tree sways (a slightly larger copy of its canopy tilts around the trunk top, because the real
  trees are merged scenery), leaves flutter, and 1–2 fruit fall with an arc and bounce (20 % chance of none, but never two empty
  shakes in a row). Walk over fallen fruit to pick it up (pickable after 0.8 s).
- *Root veg* (sweet potatoes): **Hold to pull**; the leafy top stretches and wobbles while the meter fills. Let go in the green
  (0.8–1.1) and it pops out with a soil puff and hops onto the ground to pick up; too early or too long and it springs back.
- *Staked veg* (tomato, pepper): **Twist & pick** a red one; two green ones jiggle and say "not ready yet" (no beacon on them).
- *Leafy greens*: **Snip** twice within 1.4 s; leaves fly up.
- Then **Unload the basket** at the farm stand. Sounds: `fi2-job-cue` voices in `lib/audio/islandSound.ts` (rustle, thud, pop,
  spring, twist, snip, cut …, rate-limited). Light haptic (`tapHaptic`) on each action. Reduced motion: no sway, arcs or
  bursts; items appear at their end place, the mechanics are identical.

**The farmer's share (harvest → sellable produce).** Delivering pays the job exactly as before (8, +4 the first time) **and** puts a
share of what you picked into the market basket: 3 / 2 / 1 items for a full / half / tip shift (`harvestShare.ts`), a mix of
different crops (≤ 8 coins at full price). New produce goods: banana, mango, pepper, leafy greens, sweet potato (verified
nutrition lessons ≤ 85 chars, FIFA nutrition guide). The share is granted with the shift's run id as key
(`market.ts grantGoods`, remembered in `granted`), so a replayed payday or a reload never adds it twice; a full basket takes what
fits. The Job done card lists the share; the HUD produce counter and the Pocket show it.
**Selling on Coral Cay:** at the farm stand (on foot, no job running) a "Coral Cay Farm Stand · Sell fruit & veg" button opens the
market stand in `place='farm'` mode: produce only, same prices, same daily allowance and Training meter (one shared market state).
Match-day snacks neither consumes nor gives produce (its snacks are the farm's, not the player's basket).

**Heat.** Nothing runs without an active job. While one runs: the props are 3–7 small meshes (measured visible job meshes: harvest 6,
snacks 6, rake 5, cones 5, hammer job 7, line painter 7, bottles 4, pump 4, offside 4, ball kid 3), plus one hidden particle pool.
Per-frame work only follows the player (bag, cone stack, marker) and sways/pulls while active; arcs, hops, wobbles and bursts are
bounded tweens (≤ 0.8 s) that end; props are disposed ≤ 1.2 s after the job ends. The HUD view is republished only when a small
state key changes (armed target, hold, note, meter step), not every frame.

**Tests.** `tests/island-jobs.cjs`: every job completes only through its actions (walking alone does nothing), 3 hammer hits per
peg, rake before bag, balls rolled back; Harvest shake → drop → pick-up, drain, no double miss, pull too early / too long / green,
unripe twist, snip timing, the 5 + 5 mix, 10 sellable crops, seeded determinism, < 2 min; farmer's share tiers, mix, value ≤ pay,
idempotent grant (replay, reload, full basket, bounded memory), pay unchanged, snacks pays; farm produce sells under the shared
allowance. Browser play-tests (desktop 1280×800 and phone 390×844, muted): every job except the aim-dependent rebound shots
completed through the HUD with frame strips; Harvest end to end incl. sale at the farm stand; leave-the-area stops the job;
keyboard hold (Space) and G/Enter work; reduced motion run passes.

## 10. Jobs are on foot, with the job's own buttons and a character that does the work (30 Sep 2026, local, not deployed)

**Why:** the user asked that farm work "only allow walking with the ball", with the three action buttons changed to farm actions,
the animation back to default when leaving the farm, free hands, the main character in the pull, and the ball set aside for work.
Follow-ups: Shake became **Kick the tree** (a football move), bigger farm reaches, then the same approach for every job.

- **Walking only** (`lib/town/jobs/jobMoves.ts rideAllowed`, `Town.tsx selectRide`): while any job runs, a ride request (R key,
  ride button, vending/customizer equip) is refused with a panel note ("Island jobs are on foot…", `jobScene.note`, 4 s).
- **The job's own buttons** (`jobButtons`, `components/JobActionButton.tsx`): they take the Shoot / Juggle / Ride slots (same size,
  colours, ≥ 58 px), with an icon (`TravelIcon`) and one word; keys Space / J / R; hold steps press on down, release on up; a
  button that is not armed stays tappable (aria-disabled) for a hint. The job panel no longer repeats the action buttons.
  Harvest day: **Kick the tree** (Space) · **Pull / Twist / Snip** (J, Pull = hold) · **Pick up / Unload** (R). Other jobs: Rake·Bag·Empty,
  Throw it back·Pick up, Place cone, Paint (hold), Pick up·Toss, Raise the flag·Keep flag down·Next, Pump·Let air out·Ball ready,
  Hammer, Drop it in·Take a snack; jobs with fewer than three show an "On foot" button in the ride slot. **Wall rebounds keeps
  Juggle / Shoot** (it is a ball drill).
- **The ball set aside** (`createJobMoves`): any hands pose sets the player's ball down beside the right foot; it rolls back to
  the feet once they walk on (> 0.6 m). Kicks, juggles and charged shots are off while the job buttons are up.
- **Restore**: when the job ends for any reason (Stop job, completion, walking out of the area — `outsideJobArea`, now in
  `jobRules.ts`), `Town.tsx` resets the poses, puts the ball back at the feet and the default buttons return; rides work again.
- **Kick the tree**: the player steps to a kicking spot 2.2 m from the trunk, sets the ball 1.6 m out, takes two steps back, steps
  in and passes it into the trunk (the rig's kick; contact at 0.36). On impact the rules get `kick` = one full shake (same
  20 % miss / never two misses), the tree sways, fruit falls; the ball rebounds to the feet with a first-touch pose. ~1.7 s, one at
  a time. Tip line: "Kick the tree: pass it firmly into the trunk, then control the rebound." Reduced motion: no steps back, ~0.3 s.
- **Poses** (`lib/graphics/jobPoses.ts`, `player.ts poseJob`): keyframes over a two-bone leg solve (boots on the grass, or a knee
  down) and the arms; fade in 0.1 s, out 0.15 s. Harvest: pull (crouch, both hands on the leaves, leaning back with the meter,
  tugs in rhythm), pop-back stumble (green), slip (early/late), twist & pick, "not ready" shake, snip, bend to pick up. Other jobs:
  two-handed rake sweeps (held), stuff the bag, swing it into the bin, scoop the ball, carry it at the chest, **throw-in** (both feet
  down, two hands, from behind the head; tip teaches the rule), cone stack on one arm and crouch to place, both hands on the
  line-marker bar, bend for a bottle, overhead mallet per hit, take/drop a snack, flag held → raised straight up (flag) or a
  "play on" signal, kneel and pump (lean in on each stroke), first-touch balance on each wall rebound. Held props sit in the hands
  (`jobScene.holdProps`: rake, flag, mallet, carried ball/card, cone stack, marker in front).
- **Farm reaches** (`HARVEST`): trees 2.5 → 4.5 m, veg 1.5 → 2.25 m, walk-over pick-up 1.15 → 1.8 m, Pick up button 3 m; the armed
  spot switches only to one 0.6 m nearer (overlapping orchard trees never flicker).
- **Heat:** no new loop. Per frame only while a job runs: one small `update` (a few ops), a hand-position read and ≤ 6 prop
  transforms; poses are one-shots ≤ 0.9 s or run only while a button is held / a thing is carried; nothing outside a job.

## 11. Wall rebounds: 50 passes, 15 target shots from a moving circle, new sign spot (30 Sep 2026)

- The sign moved from (143.5, −11.5), where the building in front hid it, to open grass by the lamp post at **(138.5, −26.5)**.
- Goals: **50 wall passes** (from anywhere near the wall, as before) then **15 target shots**. Each shot counts only when struck from
  inside a glowing circle (r 1.4 m, the job beacon's ring resized: one mesh, moved; static in reduced motion). After every attempt
  from the circle, hit or miss, it moves: 6–14 m from the target, ≤ 55° off square, on the lawn, ≥ 3 m from the last one, clear of
  Andre and Sofia (`nextReboundSpot`, seeded). Shots from outside say "Step into the glowing circle…"; the tip after each attempt:
  "New angle: open your body to the target before you strike." An edge arrow points to the circle when it is off screen (HUD tick).
- **Pay (raised 30 Sep 2026, user-approved):** the job takes about 1 min of wall passes plus ~2.5 min of shots (~3.5 min, was ~30 s).
  At 8 coins it paid ~2 coins a minute, the lowest of all jobs. `JOB_BASE_PAY['wall-rebounds']` is now **26**, which puts its coins
  per minute at the middle (median) of the other jobs. The rules are unchanged: +4 the first time, then 26, 26, 13, 13 and 1-coin
  tips, and the Training meter still caps the day.

  | Job | Pay | Play (min) | Shift (min, + 0.6 overhead) | Coins / min |
  |---|---|---|---|---|
  | Wall rebounds | **26** (was 8) | 3.5 | 4.1 | **6.34** (was 1.95) |
  | Median of the other ten | 7–10 | 0.45–1.8 | 1.05–2.4 | 6.29 (range 3.40–7.27) |

  The play minutes are estimates (`JOB_MINUTES` in `jobEconomy.ts`): each route at walking pace plus its actions. The 0.6-min
  overhead (walk to the sign, intro card, payday card) makes the short jobs average 1.5 min a shift, the sim's long-standing job
  time. `tests/island-jobs.cjs` pins 26, the tiers, and parity within 10% of the median. The economy sim now times each job
  separately (`jobMin`), and the child picks the best pay per minute among the jobs that fit the time left. Owning everything:
  casual 121 → 123, **regular 85 → 85**, engaged 49 → 49 days, so per-minute parity leaves income where it was.

## 12. "JOB" badges over every sign (30 Sep 2026)

A gold pixel-pill "¢ JOB" with a glow halo floats over every job sign and the Community Garden (`jobBadges.ts`): one instanced quad
mesh and one canvas texture (one draw), billboarded, a slow bob and pulse, a minimum on-screen size at distance. Only badges within
115 m and inside the camera frustum are updated; with none in range the mesh is hidden and nothing animates. Reduced motion: no
bob/pulse. **Decision:** hidden while that job runs; **dimmed (grey, smaller) once done today**, since later shifts pay less, so
children are steered to a fresh full-pay job, but can still find it.

## 13. Garden shift: the Community Garden as a paid job, with picking animations (30 Sep 2026, local, not deployed)

**Why:** user decision: the Community Garden becomes a paid "Garden shift" job, and the character visibly picks.

| Job | Where | Pay | Mini-task | Lesson on the payday card |
|---|---|---|---|---|
| Garden shift (gardener) | Community Garden. Sign on the grass just east of the COMMUNITY GARDEN gate sign at **(217.5, 5.5)**, facing south; the **garden crate** is inside the gate at (214, 2) | **10** (+4 first time) | Pick **8** ripe items with **at least 2 fruit and 2 veg** (fruit: strawberries, oranges, cherries; veg: tomatoes, carrots) with the **Pick** button, then **Drop in crate** | Only the garden's own produce lessons (`goods.ts`: strawberry, tomato, carrot, orange): fruit is sprint fuel, colourful veg helps you recover between matches, a real meal after training, half-time oranges rehydrate |

- **Rules** (`jobRules.ts`, `kind:'garden'`): standing in reach only *arms* the nearest unpicked spot (a ripe one wins over a green one up to 1 m further; 0.4 m hysteresis). Pick on a green one = "Not ripe yet" (nothing lost, never on the arrow). The last basket places are kept for the missing kind ("Your basket needs 2 more veg…"; the arrow then points at veg only). The first pick of each crop shows its nutrition lesson; otherwise the panel shows the tip "Mix colours on your plate: fruit is your muscles' sprint fuel, and colourful veg gives vitamins and minerals that help you recover between matches."
- **Never a dead end** (`garden.ts shiftRipeness`): the shift starts from the real garden's ripeness. If fewer than 12 items (5 fruit, 5 veg, 3 tree fruit) are ripe, the unripe spots closest to ripening are made ripe *for this shift only* until that holds; the rest stay green. Shift picks are saved to the garden (`markPicked`) and regrow on the normal 3 / 4-min timers.
- **Free picking outside a shift: kept.** Walking up to ripe produce still puts it in your market basket (it is the zero-coin fuel path and the garden's free play). **No double pay:** during a shift free picking is off; shift picks go to the crate (not the basket) and regrow before they can be picked again; only the gardener's share reaches the basket. Free picks now take one item per pick pose (0.8 s apart).
- **Gardener's share** (`harvestShare.ts`): 2 / 1 / 1 items (full / half / tip shift) from what you picked, a mix, ≤ 6 coins at full price; granted once per shift run id like the farmer's share. The payday card says "Gardener's share…".
- **Like the other jobs:** on foot only (rides wait), **Pick** / **Drop in crate** replace the ball buttons (the ride slot shows On foot), the ball is set aside for each pick and comes back when you walk on, the sign glows, the JOB badge and the map J come from the catalog. **The floating Community Garden badge was removed** (the sign has its own). The shift **stops 15 m outside the garden** (`areaMargin`, not the usual 45 m, because the Coaches Centre lawn is close).
- **Animations** (`jobPoses.ts`, `jobMoves.ts`; shift and free picking alike, one-shots ≤ 0.9 s, action-triggered, no loop): *bed crop* `gpick`: crouch and reach down, two small tugs, rise and bring it across to the basket in the left hand; *tree fruit* `reachpick`: up on tiptoe (new `toe` ankle pitch), eyes up, arm straight up, pluck, down into the basket; *not ripe* `headshake`: lean in and look, then a gentle head shake (new head-yaw `hy`); *crate* `tipbasket`: lean in and tip the basket. While walking the basket hangs from the left hand (`carrybasket`, upper body only). Free picks play the same poses with a balancing left arm and no basket. Reduced motion: shorter poses, a look without the shake, the picked item appears in the basket at once.
- **Props / heat:** a basket (3 small meshes) with **1–3 fruit** (one 3-instance mesh on the garden's shared fruit geometry; 1, 2, 3 fruit after 1, 3, 6 picks), built on start and disposed at the end; one hidden "flying item" mesh (shared fruit geometry) for the pick arc; the crate is part of the static merged sign mesh. No new per-frame loop: the basket follows the hand in the existing `holdProps`; arcs/tips are bounded `jobFx` tweens. The label atlas grew to 6 rows (1024×768, still one draw).
- **Economy:** see `docs/economy/ECONOMY_UPDATE_2026-09-30.md` (Garden shift). 10 coins / 1.6-min shift = 6.25 coins a minute (median of the jobs); regular player owns everything on day 85 with or without the job.
- **Tests:** `tests/island-jobs.cjs` (catalog, sign clear of beds/paths/glasshouse/benches/Hugo, crate, shift ripeness from an emptied garden, a full shift by hand incl. not-ripe / mix / lessons / crate, pay tiers + per-minute parity, the share once, auto-stop, rides, ball parked/restored, keyframes, scene wiring, badge from the catalog); `tests/economy.cjs` §10.
- **Browser check** (desktop 1280×800 and phone 390×844, muted): sign offer (glow on) → intro (14 coins) → ride refused → bed crouch-pick, tree reach-up pluck, not-ripe head shake (frame strips) → 8/8 → Drop in crate → first-job card reward → payday +14 and a 2-item share → Work again → walking out past 15 m stops the shift and gives the buttons and ball back → free pick outside a shift with the pose. Screenshots: `scratchpad/garden-shift/`.

## 14. Cones beside the pitch, a harder ball pump (1 Oct 2026, local, not deployed)

**Why:** user, from phone screenshots: the cone marks sat inside the 9v9 pitch where the match is played, and the ball pump was
over in three taps.

**Set out the cones.** The session moved to the grass band east of the Club Grounds touchline (pitch x 138.9–181.1, z −144.8 to
−75.2; the east road's sidewalk starts at x 190), between the touchline trees at (188, −82 / −104 / −125) and the lamp at
(189, −85.5). Marks: a 10 × 5 m **passing channel** (183, −110), (188, −110), (188, −120), (183, −120) and two 2 m **dribbling
gates** (184.5 / 186.5, −94) and (184.5 / 186.5, −99.5). Every mark is ≥ 1.8 m outside the touchline, ≥ 2 m from the sidewalk and
≥ 1.6 m from every obstacle. The **sign** moved from (167, −72) (behind the north goal line) to **(185.5, −89)** on the same grass,
facing north toward the road the players come from. The intro now says the cones go "on the grass beside the pitch, so the match
can keep going", and the lesson adds "set up beside the pitch, never on it while a game is being played". The job area (45 m
margin) still covers every mark. `tests/job-boards.cjs` checks each mark on the real town against every pitch rectangle,
`world.obstacles` and `world.roads`; `tests/island-jobs.cjs` checks the catalog against the venue and the known obstacles.

**Pump the balls.** Each **Pump** tap adds only a little air, and air seeps back slowly once you stop for 0.6 s (2.5 s once the
needle is in the green, so there is always time to press Ball ready; never below the ball's start, never from an over-pumped ball). The green zone stays inside the Law 2 range and narrows toward its middle ball by
ball (game rule, not a Law: a careful kit assistant aims for the middle). **Ball ready** counts only inside the zone. No fail state:
stopping only costs more taps.

| Ball | Start (atm) | Air per tap | Green zone | Taps to the green | Leak once you stop |
|---|---|---|---|---|---|
| 1 | 0.20 | 0.050 | 0.60–1.10 | 8 | 0.03 atm/s |
| 2 | 0.20 | 0.040 | 0.64–1.06 | 11 | 0.04 atm/s |
| 3 | 0.15 | 0.035 | 0.68–1.02 | 16 | 0.05 atm/s |
| 4 | 0.15 | 0.030 | 0.71–0.99 | 19 | 0.06 atm/s |
| 5 | 0.10 | 0.028 | 0.75–0.95 | 24 | 0.07 atm/s |

Over-pumping past the zone squeaks and hisses once and needs **Let air out** (−0.15). The gauge (the existing meter) shows this
ball's green zone and its label reads "Ball 3/5 · 0.52 atm · green 0.68–1.02 · ~5 to go"; the hint line counts the strokes
left and teaches the Law 2 range (the job's own lesson: 0.6–1.1 atm at sea level, too soft dies on your foot, too hard bounces
away). The Pump button is the job's action button: it acts on touch-down (no 300 ms delay, `touch-action: manipulation`) and keeps
its press look. The kneel-and-pump pose leans in on every stroke (one bounded 0.28 s tug), and the pump handle now has at most one
stroke tween: a new tap restarts it from the fixed rest height (before, fast taps stacked tweens and the handle crept down).
**Heat:** no new loop. The leak is a few arithmetic ops in the job's existing per-frame step; the panel republishes only when the
needle moves 0.02 atm (a few times a second while leaking, never while idle at the start).

**Pay:** play time .45 → .85 min (walk ~3 s, ~85 taps at ~3 a second ≈ 28 s, five checks and Ready presses ≈ 20 s), pay 7 → 10:
6.67 → 6.90 coins a minute, inside the 7–10 band; the short jobs still average 1.5 min a shift and every economy guard passes.


**Ball kid (same day, from phone screenshots).** The loose balls lie *around* the 11v11 pitch, ≥ 3 m outside the lines: over the
east touchline (169.5, 76), (169.5, 124), (169.5, 146) and behind both goal lines (150, 154), (144, 46.5), clear of the trees,
benches, stand and roads (`tests/job-boards.cjs` on the real town). One ball at a time: Pick up → carry it → **Put it in the ball
box** (an open blue box beside the halfway line at (169.5, 103.5), arms from 2.2 m) → the ball settles in the box and the next loose
ball pops up with a ring. The old throw-back (which landed the ball on the pitch mid-match) is gone; the pose is a set-down.
**Arrow:** the beacon arrow is 1.5× bigger, and the off-screen edge arrow (was Wall rebounds only) now points at every job's
beacon goal: the loose ball, the box while carrying, the next cone mark, the pump station, a ripe crop.

**Job panel (all jobs).** Two rows: title + count with Stop job, then one hint line (the role eyebrow and the unit line are gone;
the unit is in the accessible name). After 3.5 s (longer for a long hint, up to 9 s) it fades (.3 s) to a chip "Ball kid 1/5" plus a
round 44 px × Stop; tapping the chip opens it again, and any progress / phase / hint change shows it again. It stays open while a
meter (pump gauge, pull meter) or its own buttons are in use, while an offside replay is explained and while a sorting clue is in
the hands. A hidden live line keeps announcing progress. Reduced motion: no fade. Landscape docking keeps the chip top-left.

## 15. Summit Isle's Bug squad: one job, bugs by day, fireflies at night (20 Oct 2026, local, not deployed)

User: "add new jobs on the mountain island. catching butterflies and other bugs. tie the bugs into the concept of futbol. for
nighttime add catching fireflies instead since it's night time." Then, the same day: "don't have two separate jobs, the bug squad
changes to catching the fireflies if switching to night mode", "place the bug job at the top of the mountain on the south west end",
"for bug squad, it doesn't make sense to have the on foot button, add another action for that related to walking around with a net"
and "release bugs doesn't work, when tapping that it will have animation to zoom in on the main character releasing all the bugs and
then zoom out to see them spread out and fly away". Data: `lib/town/jobs/bugScout.ts`; catalog: `jobCatalog.ts` (`bugJobFor`,
`jobVariant`, `canonicalJobId`); runtime: `jobScene.ts`; test: `tests/summit-bugs.cjs`.

- **One job, one sign:** id `bug-scout`, role Bug scout, one sign and one Bug book. The sign stands on the flat south-west corner of
  the summit terrace (606, 130), west of the Summit 5s fence and a few metres off the trail's arrival, facing south (north is -z on
  the map, west is -x). Its two drop-offs stand behind it on the same flat: the bug hotel (604.5, 126.5) and the lantern goal
  (607.6, 126). The map's "J" follows the sign by itself (JOBS). The bugs and fireflies stay out on the slopes and the meadow below
  (their spots belong to the roster; the content work spreads them across height bands, so a summit sign is fine).
- **Sets follow the Time of day:** the player's own Day / Sunset / Night setting (`fi2-time-of-day`, never the real clock).
  `activeSet(timeOfDay)` returns `'bugs'` (Day, Sunset) or `'fireflies'` (Night); `bugRoster(set)` returns that set's species list
  and `BUG_SETS` its title, look (`prop`), drop-off and unit. `bugJobFor(set)` builds each set's definition from the roster (targets,
  hints, notes: any length, no fixed count) and memoises it; the catalog lists the bugs set. The intro card shows the set for the
  current time and the line "Changes at night: ..." (`nightNote`).
- **Switching mid-shift** swaps the set without ending the shift (board tick, ≤ 0.25 s): the old set's bugs lift and shrink away over
  0.7 s (their last matrices, then disposed), the new set grows in over 0.8 s, and the panel title changes ("Bug squad" / "Night
  squad: fireflies") with a note that the other set is saved. Each set keeps its own progress within the shift (`setStash`); either
  set finished and released completes the shift. Never mid-release: the release finishes first.
- **Bugs (prop `bug`):** the 7v7 squad plus the referee (goalkeeper, centre-back, full-back, midfielder, winger, captain, striker,
  Referee Bumblebee, Law 5). Hold Net (0.8 s, "like a soft first touch"); release the squad at the bug hotel. Bugs are never hurt.
- **Fireflies (prop `firefly`):** each flashes a football call (Man on!, Time!, Turn!, Square!, Switch!, Away!, Keeper's!, Mine!).
  Hold Cup the jar (0.7 s), then light up the lantern goal and let them fly free.
- **Buttons:** Hold Net / Cup the jar (Space), Release / Light up (J), and in the third slot, where the ride / "On foot" button sat,
  the net toggle (R): **Net down** = the stalk (net held low and forward, the walk slowed to 55 %, bugs drift less and settle into the
  jar 1.35× faster) / **Net up** = carried on the shoulder. Available while roaming (`jobRules.STALK`, `walkScale` read by Town).
- **Release fix:** the Release button was armed only within 1.8 m of the drop-off and a tap on it anywhere else did nothing at all
  (Town ignored unarmed taps silently, except Kick). Now the drop-off reach is 2.8 m (`deliverReach`) and any unarmed job button
  answers with a hint ("Walk right up to the bug hotel (follow the arrow), then tap Release the squad.", `disabledHint`).
- **Release cinematic:** the tap holds the controls (`locked`, `walkScale` 0), eases a shot camera in on the player (two
  `createShotCamera`s, like the assistant-referee view), lifts the jar over the head, pops the lid with a sparkle, pours the set out
  and fans it on curved paths that shrink away with distance, then eases a second shot up and out over the slope; at Night the lantern
  goal lights up. After ~4.7 s the shift completes and pays as before. A tap anywhere (or Space / Enter / Esc) skips to the end;
  reduced motion is the quick jar release with no camera; quitting, leaving the area or a time switch can never strand the camera
  (the shots ease back by themselves). It reuses the shift's own instanced draw (≤ the roster size, the on-map cap) and the pooled
  job FX: no new meshes, nothing while idle.
- **Pay:** 5 coins (lib/economy.ts JOB_PAY), the usual full / half / tip tiers and the Training meter; a bugs or a fireflies
  shift each pay like one shift.
- **Old id:** `firefly-floodlights` (its own job until the merge) resolves to `bug-scout` (`BUG_JOB_ALIASES`, `canonicalJobId`,
  `jobById`); the job ledger folds its today / lifetime counts into `bug-scout` and keeps the faster best time
  (`JOB_ID_ALIASES`, `sanitizeJobLedger`). Server earning ids only check the id shape (no migration).
- **Heat:** nothing exists while no shift runs (the sign, hotel and lantern goal are part of the merged static sign mesh). During a
  shift: one instanced draw of the set (plus one additive glow draw for fireflies); ≤ 2 × roster matrices per frame, frozen under
  reduced motion; for 0.7 s after a swap one more draw (the old set fading); disposed at the end.
- **Analytics:** `su:bug_catch`, `su:bug_squad` (bugs set), `su:firefly_catch`, `su:firefly_shift` (fireflies set), shown in /admin's
  Summit Isle card as the Bug squad's Day and Night sets.

### Bug extras: the Bug book, wild meadow bugs, job sounds (20 Oct 2026, local, not deployed)

User: "also do these". Test: `tests/bug-extras.cjs`.

- **Bug book** (`lib/town/jobs/bugBook.ts`, `components/BugBook.tsx`): every bug and firefly call caught on a shift is counted in
  `fi2-bug-book-v1` (SYNC_KEYS; two arrays of eight counts and a reward flag, at most ~130 bytes). The book uses the Fishbook /
  Shellbook drawer (side drawer on desktop, full screen on phones), opened with the "Bug book" button on the Bug squad's intro and
  payday cards (`OPEN_BUG_BOOK`). Sixteen pages: each bug's name, football position and lesson, each firefly's call and its
  meaning; locked pages are flat silhouettes saying where to catch them. Completing all sixteen shows the "Full squad" sticker on
  the cover and pays a one-time learning bonus (`learn:book:bug-book`, LEARN_COINS.book = 5, creditOnce: once ever, never metered;
  `lib/town/jobs/bugBookReward.ts`), paid on the 16th catch and checked again whenever the book opens. The island has no shared
  badge system, so the sticker lives in the book.
- **Wild bugs** (superseded by "Bug flight" below; `lib/graphics/wildBugs.ts`, rules in `wildBugsCore.ts`): butterflies and bugs flutter round the meadow by Day and
  Sunset, a few fireflies blink at Night (the player's own setting). One InstancedMesh with the job's shared bug shape
  (`lib/town/jobs/bugShape.ts`), built only within 70 m of the meadow and disposed beyond 90 m; 12 at heat tier 0, 6 at tiers 1–2,
  none at tiers 3–4 / Battery saver / reduced motion, half as many fireflies; 15 Hz matrix updates unless within 35 m; hidden
  while a job runs; a fixed bounding sphere; no textures and no per-frame allocation. Walking within 2.6 m makes one flutter away
  and drift back; the first time in a visit a note says bugs are caught on the Bug squad shift. Not catchable outside a shift.
  Runtime cost while near: one draw of ≤ 12 instances (≤ 12 matrix writes per update); nothing anywhere else on the island.
- **Sounds** (`lib/audio/islandSound.ts` job cues): `net` (Bug squad hold), `cup` (firefly hold), `jar` (a bug drifting in, the jar
  opening), `squad` (release: a rising four-note cheer) and `firefly-0…7` (each call chimes its own pentatonic note,
  FIREFLY_CHIME_HZ). Synthesized, through the master gain (mute and volume apply), counted as audible like every cue.
- **Analytics:** `su:bugbook_open`, `su:bugbook_complete`, `su:wild_flutter` (at most once per bug per 8 s) in /admin's Summit card.
  No migration: the SQL only checks the id shape.

### Bug flight: real bug models and Animal Crossing motion (20 Oct 2026, local, not deployed)

User: "each bug needs to look realistic and fluid motion when flying", "Animal Crossing" feel; the wild bugs and the job bugs are
the same bugs, spread over Summit Isle. Test: `tests/bug-flight.cjs` (plus the updated `tests/bug-extras.cjs` section 3).

- **Models** (`lib/graphics/bugModels.ts`): one merged low-poly vertex-colour geometry per BUG_SPECIES entry and the firefly
  (500-1100 triangles each, ~730 on average; no textures): head / thorax / abdomen, six legs (eight on the spider), antennae and
  species wings and patterns (monarch veins and dotted borders with a gold "armband", swallowtail bars, tails and eye-spot, morpho
  iridescent blue, luna-moth tails, the ladybird's seven spots, beetle horns / antler jaws, the dragonfly's four glassy wings and
  ringed tail, bumblebee bands, the physio honeybee's tiny red cross). The futbol accent is a small white disc with a dark
  pentagon on the back. Far silhouette (26 triangles, tinted per instance) beyond 14-20 m of the player.
- **Shader** (`bugMaterial.ts`): one MeshStandardMaterial program for all bugs; the vertex shader flaps fore / hind wings (hind
  lagging), lifts wing cases and spreads folded hind wings, walks legs, from two per-instance vec4s; the fragment adds the morpho /
  dragonfly sheen and the firefly lantern. Fireflies also get one additive camera-facing glow sprite each.
- **Motion** (`bugFlight.ts`, pure): velocity-integrated, eased steering on curved paths round the BUG_HOMES spot (top speed 7 m/s,
  so no step can teleport), yaw from velocity, pitch from climb or slope, roll into turns; 15 movement profiles (butterfly glides,
  moth flutter, bee buzz-and-hover, dragonfly hover-and-dart, beetle trundle with clumsy flights, hop arcs, ant march, inchworm,
  stick-insect sway, mantis scan, spider jumps, firefly drift). Perch / land / take off are eased, never snapped.
- **Sneaking**: running (> 2.4 m/s) is noticed at the species' `alert` metres; walking slowly shrinks it to alert × sneak × 0.7 and
  standing still to × 0.35, so commons let you walk right up and rare bugs are skittish. A startled bug flies / scurries / hops away
  (the side farthest from the player within its leash), then eases home.
- **Swarm** (`bugSwarm.ts`, wrapped by `wildBugs.ts`; Town unchanged except passing `sunset`): built within 250 m of Summit Isle,
  pickBugsOnMap's set (12 / 10 / 8 by heat tier), the eight fireflies at Night (8 / 6 / 4), none at tiers 3-4 / Battery saver /
  reduced motion. Day draws: 1 far draw + 1 per species within FULL range (measured ≤ 2 over 347 island spots); Night: 2.
  Per frame within 35 m, 15 Hz beyond, frozen and hidden beyond 120 m; no per-frame allocation. Day / Night switches fade out,
  rebuild and fade in. Still hidden while a bug job runs (`busy`) until the job catches from the swarm.
- **API for the catching lane**: `query(x, y, z, r)` (reused array, nearest first: id, kind, species / call, x y z, dist, flying),
  `startle(id, {x, z})`, `catch(id)` → {id, kind, species, call, x, y, z} (the bug disappears and a new one turns up at home after
  45 s), `setSet('bugs' | 'fireflies')`, `position(id, out)` and `heading(id)` for the zoom camera. In the page: `__fi2.wildBugs`.
  Added by the catching lane: `pin(id, at)`, `reseed(seed)`, `recall(x, z)`, and the frame's `job` set.

### Catching lane: Animal Crossing swings from the swarm (20 Oct 2026, local, not deployed)

User: "it needs to be more like animal crossing ... the net needs to have a swing ... make the radius for catching the bug bigger",
"the net looks like a cone", "when catching animate and zoom into the bug being caught", "each bug caught should have a story related
to futbol like catching fish", then "allow to switch to scooter, bike riding, and moped with the net. not flying", "you must walk to
catch the bugs", "it shouldn't end the job unless I start to enter the water or hit end job" and "add a hint button next to the close
button". Rules: `lib/town/jobs/bugCatch.ts`; net: `bugNet.ts`; runtime: `jobScene.ts`; tests: `tests/summit-bugs.cjs` (rewritten),
`tests/bug-extras.cjs`; browser: `scripts/check-bug-squad-browser.cjs`.

- **From the swarm:** the job owns no bug meshes. Town passes the swarm (`bugs:()=>wildBugs`) and keeps it visible during the shift
  (`busy` only for other jobs, `job: jobs.swarmJob`): the shift's set is always out, even at heat tiers 3-4 / reduced motion (at the
  tier-2 count). Each shift reseeds `pickBugsOnMap` (`shiftSeed`: the best of 8 seeds for species missing from the squad). When no
  bug is within 40 m for 2 s, the farthest one is called over to a free home spot within 90 m (`swarm.recall`).
- **Roster:** the 20 species (11 starters, subs, staff) at their homes; fireflies = the 8 calls. A shift catches `SHIFT_GOAL` (6 bugs /
  5 fireflies, or all that are out); the pill counts the squad (N/20; fireflies N/8) and the panel shows "Today's jar n/6 · squad
  n/20". Each species fills the squad once per completion; the 20th starts a new squad and the release shows the 20-bug formation
  (4-3-3 + bench and staff, `FORMATION_CAP` 20 / 14 / 11 by heat tier, one temporary instanced draw of the shared bug shape). Pay
  unchanged (5); a species' first catch ever pays `NEW_SPECIES_COINS` (1, creditOnce `learn:book:bug-new-<id>`); all 20 bugs and all
  8 fireflies each pay LEARN_COINS.book once.
- **Swing:** Swing net (Space) or a tap near a bug: wind-up 0.16 s, sweep with a swoosh ribbon, hit frame 0.3 s, recovery to 0.62 s.
  Sweep sphere `NET_SWEEP_RADIUS` 2.4 m (2 × the old 1.2 m reach) round a point 1.3 m ahead (± 2.6 m vertical), Net down × 1.15;
  auto-aim to the nearest bug within 5 m in a ±75° cone; a locked target lunges the sweep up to 3.6 m out with 1.35 × slack; taps
  reach 6.5 m. A miss startles the nearest bug. Poses: `netswing`, `netcatch` (one-shots), `netcarry` / `netsneak` (held, upper body,
  both hands on the pole, swaying with the walk).
- **Net:** a merged frame (wooden pole, rubber grip, dark collar band, 0.42 m hoop, a little football on the butt) and a deep mesh bag
  (stretched hemisphere, vertex-colour mesh lines) on a spring that lags through swings and turns and flips closed on a catch. The
  pole runs through both hands (`NET_GRIP`, `NET_HAND_FOLLOW`); riding, it rests on the backpack's side socket (see "Bug polish").
- **Catch:** the bug is pinned in the bag (`swarm.pin`), a shot camera eases in (0.9 s), holds 1.1 s with the bug wiggling, sparkle +
  confetti bursts from the pooled job FX and a ground pulse, then eases out; the bug goes into the jar (`swarm.catch`, jar pop) and the
  story card (name, role, NEW, +coin, squad n/20, "Real football fact" rotating by catch count) slides in for 7 s. Controls are held
  only during the zoom; a tap skips; reduced motion = no zoom (the card fades). Quit / set swap / leaving end it safely (`endZoom`).
- **Rides:** Ride (R) cycles walk / scooter / bike / moped, never the jetpack (`BUG_FLY_NOTE`). Bugs are caught on foot: riding, the
  swing button reads "Hop off" and dismounts. Net down / up moved to E (a chip in the job panel).
- **Ending:** never by area radius, trail, slopes or riding: only stepping into the sea (`water.inWater`), leaving the island another
  way (> 25 m past the coastline: zipline, ferry, teleport) with a toast, or End job (asks once more when the jar has bugs).
- **Hint:** the pill's ➤ button (and "Nearest bug" in the panel): the nearest uncaught bug (or its home) for 7 s with a pulsing ground
  chevron, the beacon and edge arrow and "Name, N m"; 3 s cooldown; ends within 3 m or on a catch.
- **Analytics:** `su:bug_swing`, `su:bug_miss`, `su:bug_story`, `su:bug_hint` (allowlist + /admin Summit card; no migration: the SQL
  only checks the id shape). Bug book: same key, version 2 keyed by species id, v1 index arrays migrated (≤ ~1 KB).
- **Heat:** one swarm query per swing, the arrow / hint at 4 Hz, the recall check every 2 s; the net is 3 draws (frame, bag, swoosh
  only while swinging) + the hint chevron while shown; release flyers one draw for ~5-6 s. No per-frame allocation.

### Bug polish: net carry on the backpack, the walking hold, bugs near the player (20 Oct 2026, local, not deployed)

User: "have it be to the side of the backpack" (riding), "fix the body mechanics to hold the net while walking", "while walking
around with the net, have it held with both hands", "can't see bugs to catch when walking around". Tests: `tests/bug-net-hold.cjs`,
`tests/bug-local.cjs` (both in `npm test`), `tests/summit-bugs.cjs` (riding section rewritten); browser:
`scripts/check-bug-net-browser.cjs` (side + back close-ups, density at 8 spots).

- **Riding carry** (`bugNet.pack`): the pole rests on `backpack-side-right` (docs/backpack.md; Town hands the jobs the socket and the
  pack's morph with `jobs.setBackpack`), `NET_PACK.strap` 0.42 m up the pole, 3.5 cm out from the socket, tilted back from vertical
  by `BACKPACK_RIDE_OFFSETS[ride].poleTilt` (scooter .35, bike .55, moped .6 rad), whatever the rider's lean; the hoop rides 0.7-1.0 m
  behind and ~0.45 m over the head, the bag streaming back and lagging on turns. The test checks pole and hoop points against the
  rider's body (+12 %), the pack box and every ride mesh. While the pack opens into the jetpack (morph > `NET_HIDE_MORPH` .02; the
  shift refuses flying, this covers a take-off at the very start / end of a shift) the net hides.
- **Walking hold** (`jobPoses.netGrip`, `player.ts poseNetGrip`): the pole line is set first (rig-local, riding with the chest so
  the lean, the crouch and the build carry it) and both arms are solved onto it with the zipline's two-bone solve (elbows out and
  down): the mittens stay within ~2 cm of the pole through the walk cycle, so no hand floats off it and nothing stretches. Carry =
  a relaxed diagonal across the body (rear hand low by the hip, front hand at the chest), the hoop up front and to the side, ~2.1 m
  up and ~1 m ahead, ≥ 0.95 m from the face; still = low and ready (pole tipped forward); sprinting tucks it up. The pole's tail stays
  outside the body and the pack (`NET_GRIP_BY_MODE`: hands 0.27 m up the pole carrying, 0.15 m in Net down). The torso
  counter-rotates against the steps and leans with speed, the hold sways and bobs on the walk phase (replacing the arm swing); the
  bag lags on turns and swings on starts and stops (a spring on the hands' acceleration). Net down: knees bent (pelvis 8 cm lower,
  `NET_SNEAK_CROUCH`) under the stepping legs, leaning in, the net forward and low (hoop ~1.7 m ahead, just over the grass).
- **Blends:** job poses cross-fade between kinds over `NET_BLEND_S` 0.2 s (carry ↔ sneak ↔ wind-up / swing ↔ catch ↔ carry; the legs
  fade between walking and posed), the grip eases in and out over the same time, and the net's hand-follow / grip ease too: no
  snapping (the test's largest per-frame hand move at a switch is 14 cm, from the raised catch back to the carry).
- **Bugs near the player** (`bugSwarm.ambient`, `BUG_LOCAL`): the 20 species keep their homes by band, but during a shift the swarm
  keeps at least 9 bugs (the asked-for 8 plus one spare; never more than are out) within 35 m, checked every 0.5 s (replacing the
  recall). When short it re-homes the best others: uncaught species first, those whose band matches the terrain here first
  (`bugBandAt`: trail / high / water / meadow), farthest first; caught ones only as a fallback, shown with a green check ("already in
  your jar", not counted twice). Spawns land 14-30 m away on Summit Isle ground (north end only on the sand), ≥ 5 m apart, outside the
  camera's view (`swarm.setCamera`; headless: 100 % on phone, ~93 % on desktop, else the farthest in-view spot) and fade in. Heat caps
  unchanged (12 / 10 / 8 by tier; 8 during a shift at tiers 3-4, ≥ `BUG_LOCAL.floor` 4). Measured headless at 10 spots over all four
  bands: 9-10 within 40 m (phone and desktop cameras); walking 60 s, never below 8.
- **Spotting FX** (`lib/graphics/bugSpotFx.ts`, only during a bugs shift): a soft contact-shadow dot under each flying bug (smaller
  and fainter the higher it flies), a gentle glint every 2.4 s (staggered) on uncaught bugs within 25 m, a check over a caught
  species' bug, and for 2.5 s after a bug turns up near the player a pulsing ground ring and a bouncing "!". Two pooled instanced
  draws (ground ≤ 2 × the set, marks ≤ the set), no textures, no per-frame allocation; nothing without a shift.
- **Heat:** the local density is O(slots × 24) twice a second; the FX are ≤ 24 + 12 instance writes per frame and 2 draws while a
  shift runs; the net hold adds one two-bone solve per arm per frame while carrying.


### Bug visible: bodies, one cue, a bigger net (20 Oct 2026, local, not deployed)
User playtest: "some of the bugs have check marks. they need to look like bugs", "unable to catch butterfly", "can't see bugs, catch
radius is smaller ... the check marks and shadows with sparkles is confusing", "there are exclamation points for the bugs".
- **Cause of the missing bodies (measured):** each species' near model (`bugSwarm.ts`, drawn within FULL_IN_M) kept the culling
  sphere built round its first home; local density and recalls move bugs 50-150 m away, so three.js frustum-culled the body and only
  the check / shadow drew. The sphere now follows the bug every frame.
- **Readable bugs:** `bugVisualSize` × 1.6 (2.7 instead of 1.7), a warm rim light + a little self-light in the shared bug material,
  a plumper far silhouette (still 26 tris) that grows up to × 1.45 by 40 m (smallest species ≈ 51 px tall at 40 m on a phone).
- **One cue:** `bugSpotFx.ts` is now a single pulsing halo on the nearest uncaught bug within 30 m (one instance, one draw). The
  contact shadows, spawn rings, "!" marks, glints and checks are gone. Caught species are never sent over by local density.
- **Catching:** sweep 2.4 → 3.5 m, vertical 2.6 → 4 m, auto-aim 5 → 8 m all round (nearest uncaught first, one behind costs 2 m),
  tap 6.5 → 10 m (slop .24), lunge 5.6 m. The locked bug holds still until the hit frame (`swarm.hold`), and the target is sampled
  3 times (SWING_SAMPLES) between the wind-up and the hit. Calmer bugs: notice radius walking × .5 / still × .25, flee boost 1.6.
  Swing is never greyed on a shift (in the jar-full phase too: the catch goes to the Bug book); the greyed Swing + Release in the
  user's shots match the jar-full (deliver) phase. Release looks live once the jar has a bug and says where to go away from the
  hotel. Sim (tests/bug-local.cjs §6): 100% at ≤ 6 m, 99% mean / 90% fast-flier min at 8 m.
- **Pill:** not reproduced in headless Chrome (visible and uncovered at every step, phone + desktop). Hardening: a ball-hunt id
  with no lesson stayed queued and kept Town's HUD stack hidden (BallHuntLesson rendered null); it now dismisses itself. Esc ends a
  Bug squad shift (same two-step ask). Browser check: `scripts/check-bug-visible-browser.cjs`.
- Draws by day during a shift: 1 far + near models (0-4) + 1 halo; night unchanged (2).

### Catch stage and one UI thing at a time (21 Oct 2026, local, not deployed)
User (screenshot of the catch zoom: net bag over the face, a head-sized ant sprawled on the bag, the job panel covering the shot):
"fix the catching animation", then "this needs to zoom in on the character first then show the actual catching ... an isolated
animation to show the catch, it doesn't need to have the background on it", and "this UI with bug squad and the bug info is too
much. only show one at a time". Rules: `bugCatch.ts` (CATCH_STAGE, stageShot, catchScale), stage: `lib/graphics/catchStage.ts`,
runtime: `jobScene.ts` (beginStage / stageFrame / exitStage), HUD rules: `bugUi.ts`; tests: `tests/bug-catch-stage.cjs` (in
`npm test`), `tests/summit-bugs.cjs`; browser frames: `scripts/check-bug-catch-stage-browser.cjs` (→ /tmp/bug-catch-anim).
- **Causes:** after the 0.9 s `netcatch` one-shot the arms went back to the walking carry while the net stayed in 'raise' mode
  (85 % following the hands), so the hoop and bag sat in front of the face; the zoom camera was in front of the player on the bug's
  side, low, with no occlusion check; `bagCentre` ignored the bag's flip, so the pinned bug (still at its island size, ×1.6 for
  readability) sat on top of the closed bag; the zoom started after the hit, so it showed a bug already caught.
- **When:** at swing start the locked target's hit test is decided (`predictCatch`: the target holds still once locked). A catch
  plays as the stage; a miss (or no target) keeps the island swing; an unlocked swing that still meets a bug, and reduced motion,
  count it at once on the island (no camera move, the card fades in).
- **Sequence (4.95 s, Tap to skip / Space / Enter / Esc jump to the card):** push-in 0.6 s along the follow camera's own line of
  sight to the head (`pushInShot`: never closer to anything it could not already see past, kept ≥ 0.9 m over the ground); the
  island dissolves into the stage colour (0.22 s); on the stage: settle 0.25 s, the swing (wind-up, swoosh, hit at 0.58 s of the
  swing), 70 ms hit-stop, the bug sucked into the hoop on a spiral while shrinking to fit (0.4 s), the bag flips closed (0.3 s), the
  net raised beside the head with a hop (0.45 s), hold 1 s (wiggle, name label, star burst), the story card (0.8 s), dissolve back
  (0.5 s) and the push-in eases out. The catch counts at the stage's hit frame.
- **Stage:** a gradient backdrop + fading floor disc with a soft contact shadow + pollen / star specks (Day warm cream, Sunset
  peach, Night deep blue; not tone mapped), two lights, the player's own rig (moved in like the dive room, put back after), the net,
  one model of the caught species with the swarm's shader (fireflies + glow sprite) and a 16-star burst. Camera: three-quarter from
  the front-left (the net is on the right), 17° down, pulled back until the feet, head, the raised net, the presented net and the
  bug are inside 90 % of the frame and the character is ≤ 48 % of the height (`stageShot`; tests: 16 angles × phone + desktop).
- **Pose:** `netshow` (jobPoses.ts): both hands solved onto the pole (netGrip's show keys): presented = hoop out in front at arm's
  length on the right at shoulder height (1.4 m ahead), raised = beside and above the head (0.78 m to the side), face clear; the net
  follows the hands exactly. Blends 0.2 s between carry → swing → show.
- **Bug size:** on the stage the bug flies at ≤ 0.5 m long; caught, its longest side is ≤ 60 % of the hoop's diameter
  (`catchScale`), wings folded and legs wiggling inside the semi-transparent bag (opacity .55); `bagPoint` follows the flip.
- **HUD:** while the push-in and the stage play, `html[data-catch-stage]` hides everything but the stage, the story card and Tap to
  skip (pill, coin bar, buttons, minimap, arrows). The pill is one line (`Bug squad n/20` + ➤ + ×); the first shift ever shows a
  one-line tip for 8 s; a tap opens the full panel (help, today's jar, Net down) for 6 s. Notes (miss, repeat catch, set swap, the
  nearest bug) are one short line in the single toast slot (2.5 s), never in the pill. One message surface at a time (`pickSurface`:
  story card > payday > toast; the others wait); the new-species coin is on the story card (no "New in the Bug book" banner).
- **Heat:** while the stage plays the island is neither stepped nor drawn: one stage render (≈ 4-6 draws + the rig and the net);
  nothing allocated per frame; the stage is built at the push-in and disposed at the end; no textures.
- **Not done (then):** the fireflies were caught with the net; done in "Bug gaps" below (the firefly jar).

### Bug gaps: the firefly jar, believable bug sizes, the night swoosh, End on the buttons (21 Oct 2026, local, not deployed)
User: "also do these" (the firefly jar isn't built; island bugs still drawn large; the night swoosh is pale on the blue backdrop; End
job not on the action buttons). Tests: `tests/bug-net-hold.cjs` §4, `tests/bug-catch-stage.cjs` §4b, `tests/summit-bugs.cjs` (night
tool), `tests/bug-local.cjs` §5; browser: `scripts/check-bug-catch-stage-browser.cjs [--night|--sunset] [--mobile]`.
- **Firefly jar** (`lib/town/jobs/bugJar.ts`, same API as the net, chosen by `jobScene` when `def.prop==='firefly'`): a glass jar
  (r .115 m, h .25 m: transparent glass, a brass neck ring, a football sticker) with a red hinged lid (cream knob, three air holes),
  merged vertex-colour meshes, no textures. Held in both hands at its sides (`jobPoses` `jarGrip`, solved by `player.ts` like the
  net's grip; `JAR_HAND_GAP` .28 m): carry in front of the chest, Jar low (the stalk, the old Net down) lower and further out. The
  **Cup** (button "Cup the jar", word Cup, `cup` icon; Space as before) is the scoop: the jar low on the right, swept up and over
  in front at head height with the mouth tipping forward and down over the firefly, then righted (`jarcup` pose: body keys +
  the jar path; the hands stay on the jar throughout). Catch radius, auto-aim, lunge and samples are the net's (bugCatch.ts
  unchanged). On the stage (night) the firefly hovers .72 m ahead at 1.42 m, is drawn into the jar, the lid snaps shut (a spring
  with a little overshoot), the firefly glows inside (glass emissive + one additive camera-facing sprite, no lights), and the jar
  is presented then held up with a hop (`jarshow`); the island catch pose is `jarcatch` (held up in both hands). The jar glows
  softly on the island with the fireflies caught so far. Riding, it hangs upright on `backpack-side-right`, lid shut.
  Copy: the night intro, how-to, hint and pill tip say Cup; Net down / up read Jar low / up at night; the Bug book's firefly
  pages say "Cup it in the glass jar". Draws while a night shift runs: glass, trim, lid (+ glow sprite once a firefly is in,
  + the trail during a Cup) instead of the net's frame + bag.
- **Island bug sizes** (`wildBugsCore.bugVisualSize`): look.size (the species' relative size: spider .2 … dragonfly .7) × a gentle
  readability boost from × 1.3 (tiniest) to × 1.0 (biggest): .26-.70 m instead of (size + .25) × 2.7 (a 1.5 m ladybird). The far
  silhouette keeps its × 1.45 by 40 m (smallest ≈ 11 px at 40 m on a phone). Finding them is the halo's job: `bugSpotFx.haloSize`
  (≥ 1.6 m, ≈ 65 px at its 30 m range on a phone) plus the hint arrow. The catch stage keeps the earlier scale (`bugStageSize`).
- **Swoosh** (`lib/town/jobs/bugSwoosh.ts`, shared by the net and the jar): a three-row ribbon with soft edges and a bright core,
  revealed along the sweep with a comet tail by a uniform. Night (island + stage): additive, warm near-white core with amber edges;
  island by day: additive warm white; the stage's cream (Day) / peach (Sunset) backdrops: normal blending, a golden core with
  amber / orange edges (additive light vanishes on them). Checked in frames on all three backdrops.
- **End on the action buttons:** a small quiet round button (44 px, door icon, "End"; aria-label "End job") just left of the
  cluster's top row (left of Ride), so it is on the far side from Swing / Cup (bottom-right on phones, the right end on desktop);
  measured at 1280×800, 390×844 and 360×740, no overlaps. It uses IslandJobs' two-tap ask (events `fi2-bug-end` /
  `fi2-bug-end-ask`; "Sure?" in red on the first tap when the jar has bugs). The pill's × and Esc stay. Hidden during the stage.

### Firefly lessons and the permanent Bug squad top bar (21 Oct 2026, local, not deployed)

User: "when catching some of the firefly. it doesn't tie in any futbol fact or lesson"; "there need to be a bar at the top to ask for
hint and end the bug squad, both night and day time"; "remove the end btn in the actions area".

- **Firefly lessons.** Each of the 8 calls (`FIREFLY_SET`, bugSpecies.ts) now has `idea`, a one-line coaching idea (<= 110 chars, the
  lesson a kid can use, e.g. "Square! A team-mate is level with you: pass it sideways and keep the ball.") and 2 real facts that show
  that call in play (rondo + the shielding law for Man on!, Xavi's scanning for Time!, Cruyff + Marseille turns, Queen's Park's
  passing game + tiki-taka for Square!, Maxi Rodriguez 2006 + pitch width for Switch!, Stones 2019 + the corner-kick law for Away!,
  the two keeper rules, blind football's "voy" + Law 12's verbal-distraction caution for Mine!). The six facts that did not fit
  their call (shin pads, Law 7, 1872, Telstar, nets, 1930 balls) left the set. Facts and sources: docs/bug-story-facts.md.
- **Catch card.** `fireflyCard(id,count)` (bugCatch.ts) builds title (the call) + idea + one fact rotating by the call's Bug book
  count (no new save key). registerCatch sends `title`/`idea` for every firefly catch, dup and repeat included, so the lesson is
  always on the card; the fact is clamped to 3 lines, the idea to 2, with a short source site. Bug book firefly pages: call +
  meaning, the coaching idea and every fact unlocked so far (`storiesUnlocked`).
- **Top bar.** The Bug squad pill is no longer in the HUD stack: for every squad run (day and night) it renders in its own fixed
  `.pillDock[data-bug-bar]` under the coins bar with the title + count, the hint (cooldown state) and End x (two-tap Sure?). Only
  the catch stage and the release hide it (`bugBar()` in bugUi.ts, `data-staged`, `html[data-catch-stage]`). The stack moves below
  it (`html[data-bug-bar-on] .hud-stack`, `--bug-bar-h` measured by a ResizeObserver). The 2 Hz watchdog (pillWatch) and the
  action-cluster End button + count badge (previous section) are removed; Esc still ends the shift. Root cause of the "missing
  bar" reports: the pill lived inside the HUD stack, which any calm/covered flag (`stackCovered` in Town.tsx, e.g. a stuck vending
  leaving flag) or a stack-wide CSS rule hides as a whole, taking the count, hint and End with it. Tests: tests/firefly-lessons.cjs,
  tests/bug-pill.cjs; browser: scripts/check-bug-bar-browser.cjs (Day + Night, 1288x717 and 390x844).

## 16. Jobs upgrade: coaching, streaks, par, the finish cheer and the body (25 Oct 2026, local, not deployed)

See docs/JOBS_UPGRADE_OCT25.md: the per-job phone audit, the one-line next step between actions (lib/town/jobs/jobCoach.ts), the progress meter, Stop job asks once, the area warning and "Job stopped" toast, the cosmetic rhythm streak and par time (pay unchanged), the finish cheer, and the reworked rake / marker / carry / pick / cone / hammer / pump / flag poses.
