# Island jobs, Community Garden and the coin economy

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
| ✅ Set out the cones (coach's assistant) | 9v9 Club Grounds | A 10 m square gives passers good angles and time. Narrow gates reward close control. The right space makes practice feel like a match. |
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
| Job pay | 7–10 base (cones 7, clean-up 7, leaves 8, wall 8, line 8, ball kid 10) | A job takes 30–60 s of real play, roughly the arcade's per-minute rate. A 30-coin pack takes 3–4 jobs; the cheapest vending item takes 2. |
| First-time bonus | +4 on each job's first completion | Encourages trying every job. It matches the arcade's +4 first puzzle solve. |
| Daily soft cap (per job) | 2 full-pay shifts → 2 half-pay shifts → 1-coin thank-you tips | There are no walls: the job is always playable. A friendly note explains the change ("The pitch is spotless! Come back tomorrow for full pay"). It resets at local midnight. There is no streak. |
| Daily ceiling | About 250 coins if a child does all ten jobs 4 times each (about 40 min; the test bounds it at 20–34 coins per job) | Casual play (each job once) earns about 80 coins plus bonuses: 2–3 packs a day. The per-job soft cap is unchanged; adding jobs adds variety, not a faster grind per job. |
| Market prices | Produce 2–3 coins each; basket of 20 | A full basket is worth about 40–50 coins at full price. |
| Market soft cap | Full price until 40 coins of sales in a day, then half price (at least 1 coin); resets tomorrow | This is shared by produce and fish (`lib/town/market/market.ts`). |

**If the user wants arcade plays to cost coins:** charge 3–5 coins per play (not built, because that is Astra's file). The round caps (12–20) mean a decent round refunds its cost, which keeps the arcade skill-positive and avoids feeling like a slot machine.

## 3. Jobs built

Each job has a sign with the job's colour and title. Walk within 5 m: a gold ground ring lights up and the **"Island job · role / title — Go"** prompt appears (touch: tap; keyboard: **G**, because **J** is Juggle). That opens an intro card showing the pay (tier and bonus shown honestly), with *Start job* / *Not now*. While working, a compact HUD shows progress plus *Stop job* (no penalty). A beacon arrow marks the next goal. Every pickup plays the existing path "pop" cue. At the end, the payday card shows the coins earned with a coin burst (hidden under reduced motion), the chiptune finish cue, the football lesson, the soft-cap note, your time and your personal best (no time limit), and *Nice!* / *Work again*. Starting a job from a vehicle asks the ride to land/switch to walking.

| Job | Mini-task | Goal |
|---|---|---|
| Rake the leaves | Walk over 12 leaf piles spread across the 7v7 pitch, then empty the bag in the compost bin | 12 piles + bin |
| Wall rebounds | Stand in the painted box, face the wall and **Juggle**: the real wall-juggle mechanic (alternating feet) counts 10 clean returns. Then **Shoot** 3 passes into the painted target square (a real ball contact with the wall, `jobs.ballContact`) | 10 passes + 3 target shots |
| Ball kid | Run to each loose ball (behind the touchline and goal line), carry it back to the ball-kid spot on the halfway line, and repeat | 5 balls |
| Set out the cones | Step onto 8 glowing spots to place cones for a 10 m square and two dribbling gates | 8 cones |
| Paint the centre circle | Follow 16 faded dashes around the 9.15 m circle **in order**; each dash turns bright white | 16 dashes |
| Court clean-up | Pick up 10 bottles on the rooftop futsal court, then drop the bag in the recycling bin | 10 bottles + bin |

### 3b. Four more jobs (27 Sep 2026, user decision B)

Same engine (`lib/town/jobs/jobRules.ts`), economy, daily caps, first-time bonus (+4) and payday card. New job kinds: `sort` (kit room), `offside` (replays + a call) and `pump` (gauge); the goal anchors reuse `collect` with placed pegs. Task jobs show their buttons in the job HUD (one row) and a short feedback line. A wrong answer only explains and lets you try again: no coins or progress are ever lost.

| Job | Where | Pay | Mini-task (≈30–60 s) | Lesson on the payday card | Source (docs only) |
|---|---|---|---|---|---|
| Kit room (kit assistant) | Sign and kit hamper by the Clubhouse in Island Square (80, −40); a chalk mini-pitch with five position pegs laid out as a team attacking toward the Clubhouse | 8 | Take a shirt (9, 1, 7, 3, 10) from the hamper, read the clue ("Number 9 is the classic centre-forward…"), hang it on the right peg (GOALKEEPER, LEFT BACK, RIGHT WING, PLAYMAKER, STRIKER). No arrow while carrying; after one wrong peg the arrow shows the right one. Started from the sign or from the Clubhouse visit. | Numbers started as positions: Arsenal and Chelsea first wore numbers in league games on 25 Aug 1928; 1 goalkeeper, 2/3 full-backs, 7/11 wingers, 9 centre-forward; people still say "a number 9" and "a number 10". | [Squad number (Wikipedia)](https://en.wikipedia.org/wiki/Squad_number_(association_football)) — 2-3-5 numbering 1–11 and the 1928 first use |
| Flag the offside (assistant referee) | Referee practice strip on the open lawn south of the Coaches Centre rebound area (sign 152.5, 7; flag spot 150, 4.2). A painted strip (touchlines, halfway, goal line, small goal) is used instead of a real pitch because every real pitch has a live match on it. | 9 | Stand on the touchline spot: the camera eases to an assistant-referee view across the strip. Five 3-second replays (red attackers, blue defenders, yellow keeper, white ring on the attacker to watch). After each pass: **Raise the flag** or **Keep flag down**. Then the replay freezes at the moment of the pass with the yellow offside line and the explanation; a wrong call offers **Watch again**. Clips: level (onside), through ball (offside), timed run after the pass (onside), own half (onside), one step past (offside). The test recomputes each answer from the clip positions with Law 11. | Offside position = in the other team's half and nearer their goal line than both the ball and the second-last defender, when a team-mate passes. Level is onside; never offside in your own half; no offside from a throw-in, goal kick or corner. | [IFAB Law 11](https://www.theifab.com/laws/latest/offside/) |
| Pump the balls (kit assistant) | Eleven Park, behind the north goal (station 150, 44.5; sign 158, 43.5) | 7 | Five soft balls. **Pump** (+0.15 atm), **Let air out** (−0.2), **Ball ready**. The gauge shows the green zone 0.6–1.1; outside it a gentle "squeeze test" says too soft / too hard. | Law 2: a match ball must be 0.6–1.1 atmospheres at sea level; too soft dies on your foot, too hard bounces away. | [IFAB Law 2](https://www.theifab.com/laws/latest/the-ball/) |
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
