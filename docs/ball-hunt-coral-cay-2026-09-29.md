# Ball hunt: 100 balls, with 20 on Coral Cay (Sep 29, 2026)

The hunt grows from 80 to 100 balls. The 20 new balls sit along the Coral Cay causeway (8), on its two sandbar stops (4) and on the cay itself (8). Each one teaches a football idea that none of the first 80 balls teaches. This work follows the curriculum, audit and fact-checking rules in [the lesson rebuild](ball-hunt-lessons-2026-09-15.md), [the content audit](ball-hunt-content-audit-2026-09-15.md) and [the confirmation](ball-hunt-content-confirmation-2026-09-15.md). It was built locally and has not been committed or deployed.

## Where the code lives

- `lib/town/coralCayBalls.ts` holds the 20 spots. Every position comes from the stable Coral Cay helpers in `lib/town/coralCay.ts`: `causewayPoint(t)`, `causewayWaterline`, `SANDBARS`, `CAY_LANDMARKS` (welcome arch, Sharks Beach, hostel, lifeguard tower), `CAY_HOUSES`, `BEACH_COURT` and `FARM`. No world coordinates are typed in, so a reshaped causeway or cay moves the balls with it. The file also has some small derived rules:
  - The deck offset follows the road's own tangent.
  - A bank ball goes to the widest beach bank in a range of the road.
  - The buoy is placed by searching the whole over-water road on both sides for the spot farthest from every shark loop (`SHARK_LOOPS`). It must be 8 m off the rail (6–10 m allowed) where there is no beach bank for 8 m either way, so there is a rail, and away from the sandbars. The kicking spot (`kickFrom`) is the deck edge beside it.
  - A sandbar ball is pulled toward the bar's centre until it stands on walkable sand. This is the same rule `coralCayWorld.ts` uses for its own props.
- `lib/town/coinQuest.ts` appends the spots after the 80 existing balls, so saved IDs keep their order. The type gains `buoy?` and `kickFrom?`.
- The lessons are in `lib/town/ballHuntLessons.ts`: 20 lessons, 20 practice prompts and three new families (Rules of the game, Player health, Beach soccer). The scenes are in `lib/town/ballLessonScenes.ts`: 20 new three-step scenes.
- Sources are in `lib/town/ballHuntSources.ts`. Only the tests and this doc read that file, so it adds nothing to the bundle.

## The 20 balls

| # | ID | Place | How you find it | Lesson (family · level) | Scene |
|---|---|---|---|---|---|
| 81 | cay-warmup | Causeway, south pavement just past the coast | hidden bag | Warm up before you play (Player health · 1) | warm-up |
| 82 | cay-line | Causeway, north pavement at the first bend | kick parcel | The whole ball must cross the line (Rules · 1) | whole-ball-line |
| 83 | cay-bank-pad | Causeway, widest south beach bank at the second bend | landing pad (land or kick) | Use both feet (On the ball · 1) | both-feet |
| 84 | cay-bank-kick | Causeway, widest north beach bank before Turtle | kick parcel | Keeper, pick the right throw (Goalkeeping · 1) | keeper-throw |
| 85 | manhole-causeway | Causeway road, halfway (by road length) between the two sandbar spurs | manhole: fly over, then drop | Play on: the advantage (Rules · 2) | advantage |
| 86 | cay-arch | Welcome arch, east face of the south pier | round high target (east-facing) | Manage the game when you lead (Zones and thirds · 2) | lead-manage |
| 87 | sky-causeway | 90 m above the middle of the causeway | sky ball: parachute only | Read the wind (On the ball · 3) | wind |
| 88 | cay-buoy | Red-and-white buoy in the sea 8 m off the causeway rail, placed as far as possible from the shark loops | **new:** kick it from the chalk mark on the deck (or glide down with the parachute) | Defend a corner with zones and markers (Set pieces · 3) | zonal-corner |
| 89 | cay-barefoot | Starfish Sandbar, sand away from the road | hidden bag | Play barefoot on sand (Beach soccer · 1) | barefoot |
| 90 | cay-no-offside | Starfish Sandbar, east end | kick parcel | No offside on the sand (Beach soccer · 1) | no-offside |
| 91 | cay-kick-in | Turtle Sandbar, east of the boardwalk | kick parcel | Kick-in or throw-in: you choose (Beach soccer · 1) | kick-in |
| 92 | cay-surfaces | Turtle Sandbar, far end | landing pad | Every surface plays differently (On the ball · 1) | surfaces |
| 93 | cay-court | Behind the west goal of the Sharks Beach court | kick parcel | Pass in the air on sand (Beach soccer · 1) | sand-lift |
| 94 | cay-overhead | Sharks Beach sand | hidden bag | The overhead kick, safely (Beach soccer · 1) | overhead-kick |
| 95 | cay-club | Court scoreboard wall (north side of the court), east half | round high target | The keeper joins the attack (Beach soccer · 2) | keeper-joins |
| 96 | cay-surf-roof | Surf Shop roof | rooftop bag | Small island, big team (Team shape · 2) | island-team |
| 97 | cay-fuel | Coconut Café, beside its west wall | hidden bag | Fuel up before you play (Player health · 1) | fuel |
| 98 | cay-rest | Coral Cay Hostel, grass in front of the verandah | hidden bag | Rest makes you better (Player health · 1) | rest-sleep |
| 99 | cay-water | Coral Cay Farm, east of the water tank | kick parcel | Drink in the heat (Player health · 1) | drink-heat |
| 100 | cay-heading | Lifeguard tower, eastern headland | landing pad | Heading and young players (Player health · 1) | heading-safe |

The mechanics include every existing kind plus one new variation:
- 6 hidden bags on the ground
- 1 rooftop bag
- 6 kick parcels
- 3 landing pads
- 1 manhole
- 2 high wall targets
- 1 sky ball
- 1 buoy ball

Levels follow the existing rule for how hard a ball is to find:
- Ground balls are level 1: 7v7 words, at most 16 per step.
- Roof, manhole and wall balls are level 2: at most 18 words.
- Aerial balls are level 3: 11v11 ideas, at most 22 words.

That makes 14, 4 and 2 of the new balls, and 32, 49 and 19 across the whole hunt.

**Reachability and safety.** `tests/coral-cay-balls.cjs` builds the real town (`world.ts` together with `coralCayWorld.ts`) and checks each placement:
- Every ground ball is on `isOnCayLand`. Its box is clear of every obstacle and building and stands fully on the ground.
- A hidden bag's pickup point is walkable.
- A kick parcel can be approached from at least 4 of 16 sides.
- A wall target is mounted on real geometry and has a clear shooting approach from 2.5 to 9 m.
- The rooftop bag sits on a roof of exactly its height, clear of the roof edges and roof props.
- Both aerial balls are inside the causeway flight corridor.
- The buoy floats in open water, 6–10 m off the rail, with its ball resting on top (at most 0.5 m gap). A chalk-marked deck spot 6–13 m away is walkable. A shot from there reaches it, a shot 3.5 m wide misses, and the parachute still collects it within 4.5 m. Sharks pass at least 10 m away: the current layout gives 14.5 m. After the ball is found, the buoy stays as solid scenery.

Every new ball is at least 10 m from every other ball; the closest pair is 11.0 m apart. The two east-facing and parachute additions also pass the existing ball-physics fixtures in `tests/coin-solids.cjs`: the arch target opens only from the east, and the aerial balls are collected only by an open parachute at their height.

Coordination with the Coral Cay agent:
- The hostel neighbourhood was added while this work was in progress. The rest ball uses the exported `CAY_LANDMARKS.hostel`, 2.2 m further south, which clears the verandah rail that the first test run found.
- No ball sits on the lawn among the thatched huts.
- The welcome-arch target mirrors `coralCayWorld.ts`, which stands the piers 5.9 m either side of the road line, 1.1 m square, at `WELCOME_ARCH.x`. These values are not exported yet. The test checks that the target is mounted on a real obstacle, and it caught the arch's move to x 541 and ±5.9 m during this work.

## Similarity check against the first 80 lessons

The existing topics (lesson title, then scene) are:

<details><summary>All 80</summary>

1 Look before it arrives (scan-shoulder) · 2 Pick the open corner · 3 Make the pitch wide · 4 Dribble to open a lane · 5 Don’t all chase the ball · 6 Open up on the half-turn · 7 Keep the team connected · 8 Pass into the space ahead · 9 Give and go · 10 Arrive, don’t wait · 11 First touch into space · 12 Pass, then move · 13 Make a triangle · 14 Don’t hide behind a teammate · 15 Step out of the shadow · 16 One ahead, one behind · 17 Run in behind the defence · 18 Protect the middle · 19 Slow, then fast · 20 Go away to come back · 21 Be first to the second ball · 22 Overlap around the outside · 23 Play in a diamond · 24 Find the pocket between the lines · 25 Drag a defender away · 26 Run when the passer can see you · 27 Use your keeper · 28 Follow your shot · 29 Curve your run to stay onside · 30 Win it back straight away · 31 Dribble past a line · 32 Know how much time you have · 33 Pin a defender · 34 Tell a teammate what you see (“Man on!”, “Time!”) · 35 Shoot when the window is open · 36 Run inside the winger · 37 Two against one · 38 Get between them and your goal · 39 Shield the ball · 40 Stay on your feet · 41 Stay compact between the lines · 42 The third-player run · 43 Press, cover, balance · 44 Drop deep to drag a defender · 45 Up, back, through · 46 Use the half-spaces · 47 One short, one long · 48 Curve your press · 49 Track your runner · 50 Step up together · 51 Cross into the gap · 52 The keeper sweeps behind · 53 Big with the ball, small without it · 54 Crowd one side, attack the other · 55 The pocket at the top of the box · 56–80 (manholes) Find the free teammate · Stand behind the gap · Look forward first · Keep someone back · One player per lane · Know your third · Move on the blind side · Defend two against one · Show them the sideline · Fill three spaces in the box · Pull it back from the end line · Look forward when you win it · Use the build-out line · The thrower is often free · Stand in the passing lane · Pass quickly to move the defence · Press on a heavy touch · Slide across together · Run with the ball into space · Switch to the free side · Keeper: close the angle · Share the goal with the wall · Delay, then recover · Take a quick free kick · Look for a better-placed teammate.

</details>

Several suggested topics are already taught, so they were **not** used:
- scanning over the shoulder (#1, store)
- the third-man run (#42)
- recovery runs (#38, #78)
- on-pitch calls such as "man on" and "time" (#34)
- channels and lanes (#46 half-spaces, #60 one player per lane, #36 underlap)

A causeway ball about "play through the channels" would have repeated #46 and #60, so the causeway teaches the wind, the lines and the advantage instead.

| New lesson | Closest existing lesson(s) | Why it is different |
|---|---|---|
| Warm up before you play | none (no health lesson existed) | Injury prevention before play, not a match decision |
| The whole ball must cross the line | The thrower is often free | A Law 9 in/out ruling while play is live, not a restart tactic |
| Use both feet | Shield the ball; Show them the sideline | The attacker's foot choice beats a defender who shows one side |
| Keeper, pick the right throw | Use your keeper; Use the build-out line; The keeper sweeps behind | The keeper's own distribution technique (roll or overarm), chosen by distance and marking |
| Play on: the advantage | Take a quick free kick | Play is never stopped: a Law 5 referee decision, not a fast restart |
| Manage the game when you lead | Know your third; Big with the ball, small without it | A scoreline-driven choice to keep possession in their half, with the fair-play limit (a caution for delaying the restart) |
| Read the wind | Pass into the space ahead | Weather changes pass height and weight; no existing lesson covers conditions |
| Defend a corner with zones and markers | Share the goal with the wall; Fill three spaces in the box; Track your runner | Defensive corner organisation (zonal plus player marking), not a wall, an attacking cross or open-play tracking |
| Play barefoot on sand | none | Beach technique and balance (FIFA Beach Soccer Law 4) |
| No offside on the sand | Curve your run to stay onside; Run in behind the defence | The rule is absent in beach soccer, so the defending consequence is the lesson |
| Kick-in or throw-in: you choose | The thrower is often free | Choosing the restart type by marking and distance (a beach-only law) |
| Every surface plays differently | none | Adapting to sand, hard ground and futsal (low-bounce ball, Futsal Law 2) |
| Pass in the air on sand | Cross into the gap; Stand behind the gap | Surface-driven aerial passing to feet, not crossing or a split ground pass |
| The overhead kick, safely | Follow your shot; Shoot when the window is open | An acrobatic technique with a Law 12 dangerous-play safety check |
| The keeper joins the attack | Use your keeper | The keeper leaves the goal to create an extra player (5 v 4), with the empty-goal risk. Use your keeper is a pass back to a keeper who stays |
| Small island, big team | Don’t all chase the ball; Make a triangle | Football culture (Tahiti, two World Cup finals) and team spirit, not a spacing shape |
| Fuel up before you play | none | Meal timing; no diet or weight talk |
| Rest makes you better | none | Sleep hours and rest days |
| Drink in the heat | none | Hydration and Law 7 drinks and cooling breaks |
| Heading and young players | none | Heading guidance for children (England, USA) |

The tests enforce these rules:
- Each ball's scene kind, card title, all 300 step texts and all 100 practice prompts are unique.
- The near-duplicate detector compares every pair of the 100 scenes (4,950 pairs) across all 15 phone and landscape layouts.
- `tests/coral-cay-balls.cjs` also asserts that no new scene kind matches one of the first 80.

## Fact checking and sources

Each claim was checked against a primary or authoritative source (IFAB and FIFA law books, the FIFA Training Centre, national associations, and paediatric or sleep-medicine bodies). There are no invented statistics. The two figures used are:
- "about half as many injuries": the 11+ Kids trial measured a 48% lower injury rate.
- "9 to 12 hours of sleep": the AASM range for ages 6–12.

Diet guidance is timing only (a meal a few hours before and a small snack like fruit), with no amounts per kilogram and no weight talk.

| Lesson | Sources |
|---|---|
| Warm up | [Rössler et al. 2018, Sports Medicine: 11+ Kids trial](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5948238/) (48% fewer injuries overall); [FIFA 11+ Kids manual](https://ubortho.com/wp-content/uploads/2020/02/FIFA-11-for-kids.pdf) |
| Whole ball over the line | [IFAB Law 9](https://www.theifab.com/laws/latest/the-ball-in-and-out-of-play/): out only when the whole ball has passed wholly over the line |
| Both feet | [Carey et al. 2001, J Sports Sci: footedness at France ’98](https://pubmed.ncbi.nlm.nih.gov/11695507/) |
| Keeper throws | [FIFA Training Centre: goalkeeping throws](https://www.fifatrainingcentre.com/en/game/tournaments/u20fwwc/group-stage-review/8-goalkeeping-throws.php) |
| Advantage | [IFAB Law 5](https://www.theifab.com/laws/latest/the-referee/): play continues when the fouled team benefits; the original offence is penalised if the advantage does not follow within a few seconds |
| Leading | [IFAB Law 12](https://www.theifab.com/laws/latest/fouls-and-misconduct/) (caution for delaying the restart); [FIFA Training Centre: controlled possession](https://www.fifatrainingcentre.com/en/practice/grassroots/4-to-8/controlled-possession.php) |
| Wind | [Asai et al. 2007, Sports Engineering: soccer-ball aerodynamics](https://www.researchgate.net/publication/225711147_Fundamental_aerodynamics_of_the_soccer_ball); [IFAB Law 8](https://www.theifab.com/laws/latest/the-start-and-restart-of-play/) (choosing ends at the toss) |
| Zonal and player marking | [FIFA Training Centre: defending corners, zonal or player-to-player](https://www.fifatrainingcentre.com/en/game/game-analysis/set-plays/corners/defending-corners-zonal-or-player-to-player.php) (no evidence either is intrinsically better; mixed systems are common); [beach soccer mixed marking](https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-3/mixed-marking.php) |
| Barefoot | [FIFA Beach Soccer Laws 2024-25](https://www.the-aiff.com/media/uploads/2024/11/Beach-Soccer-Laws-of-the-Game-2024-25.pdf) (Law 4: played barefoot); [FIFA Beach Soccer Coaching Manual](https://www.fifatrainingcentre.com/en/environment/resources/beach-soccer/beach-soccer-manual.php) |
| No offside | FIFA Beach Soccer Laws 2024-25; [FIFA beach soccer rules guide](https://www.fifa.com/en/tournaments/mens/beachsoccerworldcup/articles/beach-soccer-rules-guide-how-to-play) |
| Kick-in or throw-in | FIFA Beach Soccer Laws 2024-25 (the restart can be a throw-in or a kick-in) |
| Surfaces | [FIFA Futsal Laws 2024-25, Law 2](https://digitalhub.fifa.com/m/7b1da24ec7a25f67/original/Futsal-Laws-of-the-Game-2024-2025.pdf) (the first rebound is 50–65 cm from a 2 m drop, a low-bounce ball); [FIFA Training Centre: beach passing on uneven sand](https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-1/passing.php) |
| Pass in the air on sand | [FIFA Training Centre: beach passing](https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-1/passing.php) (passes in the air, flick-ups and volleyed passes; land the ball at the receiver's feet) |
| Overhead kick | [FIFA Training Centre: scissor and bicycle kicks](https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-1/scissor-and-bicycle-kicks.php); IFAB Law 12 (a scissors or bicycle kick is allowed if it is not dangerous to an opponent) |
| Keeper joins the attack | [FIFA Training Centre: the role of the goalkeeper in beach soccer](https://www.fifatrainingcentre.com/en/game/tournaments/fifa-beach-soccer-world-cup/2025/technical-study-group-articles/emerging-trends-the-role-of-the-goalkeeper-in-beach-soccer.php); [build-up from defence](https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-5/build-up-from-defence.php) |
| Small island, big team | [FIFA match centre: 2017 final, Tahiti v Brazil](https://www.fifa.com/en/match-centre/match/500/276973/278261/300392031); [OFC: Tahiti at the Beach Soccer World Cup](https://www.oceaniafootball.com/revived-tahiti-target-the-title/) (runners-up in 2015 and 2017) |
| Fuel | [FIFA Nutrition for Football](https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf) (pre-match meal 3–4 h before, a lighter snack nearer the time) |
| Rest and sleep | [AASM 2016 paediatric sleep consensus](https://jcsm.aasm.org/doi/10.5664/jcsm.5866) (ages 6–12: 9–12 h); [AAP 2024: overuse, overtraining and burnout](https://publications.aap.org/pediatrics/article/153/2/e2023065129/196435/Overuse-Injuries-Overtraining-and-Burnout-in-Young) (1–2 days off a week) |
| Drink in the heat | [AAP 2011: climatic heat stress and exercising children](https://publications.aap.org/pediatrics/article/128/3/e741/30624/Climatic-Heat-Stress-and-Exercising-Children-and) (drink at regular intervals); [IFAB Law 7](https://www.theifab.com/laws/latest/the-duration-of-the-match/) (drinks breaks of up to 1 minute, cooling breaks of 90 s to 3 min) |
| Heading | [The FA heading guidance, 2020](https://www.thefa.com/news/2020/feb/24/updated-heading-guidance-announcement-240220) (no heading in training for primary-age children); [US Soccer 2015 guidelines via US Club Soccer](https://usclubsoccer.org/headinjuries/) (no heading for ages 10 and under) |

## Progress, rewards and saved games

- **Save version 5.** The hunt appends the 20 new balls, so saved `collected` and `revealed` lists stay valid.
- **Grandfathering.** A save older than version 5 that has found all 80 pre-Coral Cay balls (`PRE_CORAL_CAY_IDS`) keeps `rewardUnlocked` (the Matchday Fox) and `allCostumesUnlocked`. The unlock is written back as version 5, so it survives every later save.
  - Its `celebrated` flag resets, so the player sees the new "All 100 balls found!" finale when they reach 100.
  - This protects players whose saved JSON had 80 collected but never persisted `rewardUnlocked: true`. Previously that state was only derived from `collected.length === total`, which is no longer true at 80.
  - The older 40-ball and 55-ball migrations are unchanged. The 55-ball list now excludes the Coral Cay IDs.
- **Costume milestones.** The rule is still three club costumes per 10 balls. The existing groups stay on their milestones, so nothing re-locks:
  - three at each of 10 through 70 balls
  - the last two club costumes (Botafogo, Sutton) at 80 balls
  - the Matchday Fox ("every ball") at 100 balls
  - `costumeMilestones()` derives the list [10, 20, …, 80, 100]. 90 unlocks nothing, so "next costumes at…" and the milestone toast skip it and point from 80 to 100. At 100 the toast announces the fox.
- **Copy.** The counters (`n/100` in the lesson header, the Ball Hunt summary, the costume wardrobe, the fox card and the vending locks) already derived the total from `COIN_QUEST.length`. Two strings still had hard-coded numbers:
  - The Matchday Fox card said "Find all 55 balls". It now reads "Every 10 balls unlocks club costumes; find all {total} for the Matchday Fox."
  - The island starter book's "explore" page said "eighty hidden matchday balls". It now says "a hundred". Only that page's Coach Bella narration was regenerated, with the same local Kokoro pipeline (`scripts/build-book-narration.py`, voice `af_bella`), and merged into `public/voice/books/island/narration.json` with cache-buster `v=coach-bella-2`. Its text hash matches (`tests/book-narration.cjs`).
- **Learning coins** pay once per ball through `learn:ball:<id>`, so the new balls pay like the old ones and nothing is paid twice.

## Heat and rendering

- **No new loops or timers.** The 20 balls join the existing `createCoinHunt` entries. The per-frame work is the existing loop over entries, so 20 more cheap distance checks, and spinning is still gated to 64 m.
- **Shared assets.** The balls reuse the shared packed ball geometry and material. Each parcel is still baked into one packed draw.
  - The buoy is its own static scenery mesh: all buoys are baked into one packed draw (+1 draw call), outside the hunt root like the manhole covers, so it stays after the ball is found. The ball's parcel keeps only the chalk mark on the deck. There is no animation or bobbing. It adds one palette colour, still one packed material.
  - The causeway cover joins the existing instanced manhole covers (count 26), so it adds no draw call.
- **Shadows.** The Coral Cay parcels are kept out of the shadow pass. That would otherwise add 15 casters, from 23 to 38, above the existing "tiny hunt details" budget of 30.
- **Draw calls for the buoy.** The persistent buoy scenery is one extra packed draw (+1), outside the hunt root. The unfound ball's parcel is now only the deck chalk mark.
- **Visibility.** The balls use per-mesh frustum culling, like the cay scenery, which is shown only while its region is in view. Nothing new is shown or hidden.
- **Lessons.** Lesson scenes still load only with the lesson card. They use the same bounded, step-triggered animation.
- **Draw calls near the causeway.** These were measured in dev Chromium, as the median of 20 frames over the first causeway bend (near the `cay-line` parcel). "Before" had the 20 Coral Cay balls marked collected, which hides them; "after" had all 20 in the world.

  | Viewport | Before: draw calls / triangles | After: draw calls / triangles |
  |---|---|---|
  | 1280×800 | 98 / 34,938 | 99 / 35,350 (+1 packed parcel in view) |
  | 390×844 | 72 / 23,532 | 72 / 23,532 (+0) |
- This is reduced and bounded work measured in desktop Chromium, not a measured iPhone temperature result.

## Tests

- New: `tests/coral-cay-balls.cjs`, added to `npm test`. It checks:
  - the count of 100, unique and appended IDs, the regional spread and the mechanic mix
  - a lesson, a new scene, a practice prompt and a source for each ball
  - every placement against the built world, and spacing
  - the 80-ball migration
- Updated for 100 balls:
  - `tests/ball-hunt-lessons.cjs`: counts, levels and new families, plus semantic checks for the throw choice, no offside, the drinks break, the keeper joining and the ball on the line
  - `tests/coin-quest.cjs`: milestones 80 → 100, 90 skipped, and 80-ball saves
  - `tests/coin-solids.cjs`: nine east targets, seven parachute balls
  - `tests/manhole-balls.cjs`: junction covers plus one causeway cover
  - `tests/ball-target-spacing.cjs` and `tests/manhole-target.cjs`: loaders resolve coinQuest's new import
- Browser check (Playwright against the dev server on :8092, 1280×800 and 390×844, no page errors):
  - I collected three new balls at each size: `cay-warmup` on the causeway, `cay-barefoot` on Starfish Sandbar and `cay-fuel` on the cay. Each lesson card opened, stepped through to Got it, and its header read "Ball found · 1/100", "2/100" and "3/100".
  - I also checked the buoy, the Surf Shop roof bag, the café bag and the causeway cover in world screenshots.
  - The script is a scratch file and is not committed. Screenshots are in the session scratchpad under `ballhunt100/`.


## Buoy fix and ocean kicks (Sep 29, 2026, later the same day)

**Bug.** The buoy ball "floats beside the buoy" and could not be collected.

**Root cause.** The buoy and its ball were in the same group, so they could not drift apart. But the ball hovered 6 m above the buoy (`y: 6`), and the follow camera looks down at an angle, so on screen the ball appeared several metres off to the side, over the water where the sharks swim. The only way to collect it was a low parachute pass over the sea. A kick could never reach it either, because `blocked()` treats open water as solid, so the walking ball stopped at the deck edge. The Coral Cay reshaping was not the cause.

**Fix.**
- The ball rests on the buoy (`y: 0`, ball bottom 0.91 m, buoy top 0.89 m).
- The buoy moved to a shark-clear spot, 8 m off the rail (see above).
- There is a chalk ring and arrows on the deck where the kicker stands. The clue now says you can shoot it from the rail.
- The kick assist turns a roughly aimed shot toward the buoy, up to 14 m away.
- A shot that reaches within 2.2 m of the buoy, below 3.2 m high, collects the ball at once. The parachute pickup remains, with a generous radius (4.5 m across, a 6 m height band).
- After collection the buoy stays, both in the session and after a reload. It is a solid the ball bounces off, gives no second reward and shows no toast.
- The lesson (zones and markers at corners) is unchanged.

**Ocean kicks** (user: "allow kicking the ball out to the ocean"). In `lib/town/ballSea.ts`, `ballGround(x,z)` classifies a point as land, open sea inside the flyable zone, or beyond its edge. Then:
- In `components/Town.tsx`, the walking ball's `blocked` callback no longer treats open water as a wall during a shot. Over water, only real solids stop it: the found buoy and any obstacle in the ball's obstacle grid. Coin-hunt hits still run first. Goals, job contacts, umbrellas, trees and vending kicks are untouched on land.
- `lib/town/walkBall.ts` uses the sea level (−0.43) as the floor over open water. On touching it:
  - It fires one pooled splash (`ballEffects.splash`: two rings from the existing impact-ring pool, one flat on the water) and the fishing splash sound cue (`fi2-path-cue` `undock`).
  - The ball then floats, bobbing ±5 cm and drifting to a stop. It never drifts onto land or out past the edge.
  - After 2.1 s it returns to the player through the existing `recall()` / `return` mode. It comes back sooner if the player walks 4 m further away, and kicking or juggling resets it at once.
  - A ball that reaches the flyable edge is recalled immediately, so no ball is ever lost at sea.
- The first splash of each island session shows one line (5 s) in the ball-hunt hint slot: "Out of play! On a real pitch the ball is out once the WHOLE ball crosses the line: throw-in, goal kick or corner." (IFAB Law 9, cited in `ballSea.ts`.)
- **Heat.** There are no new loops. The float and bob run inside the ball's existing update only while it is wet. The splash reuses the pooled rings. The note uses a single one-shot timeout.
- **Rails.** The causeway rails are visual only (no collision data), so a ball flies over them, as players do not. The seawall and other solids keep their existing collisions on land.
- `simulation.ts` is not changed: the sea test lives in the ball's own callback.
- **Test.** `tests/ball-sea.cjs` (in `npm test`) drives the real `walkBall` with the real land/sea test. It checks:
  - four main-island beaches and three causeway spots: one splash on the water, a gentle float, and a return to the feet
  - kick and walk-away give early returns
  - full-power shots always come back
  - land shots are unchanged
  - a real shot from the buoy's chalk mark collects it, and the next shot bounces off the buoy with no second reward

  Goals and parcels are still covered by `charged-shot`, `ball-actions`, `wall-juggle`, `game-engine-upgrade` and `coin-solids`, which all pass.
