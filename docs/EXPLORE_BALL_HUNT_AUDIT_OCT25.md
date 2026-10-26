# Explore ball hunt audit (Oct 25 2026)

User: "Do an audit on the different explore sites and make sure to add ball hunt in each of these spots. instead of the pearl in the treasure chest. have it be a ball. make sure to have a ball for each site and have it follow the same pattern as other ball hunt. when collected give a mini lesson and allow to choose a card."

Sites come from the travel map's **E** (Explore) marks (the seven reef zones, `lib/town/water/diveSpots.ts`), the far islands, and the place items of the Explore checklist (`lib/town/exploreChecklist.ts`, `exploreZones.ts`).

| Site | Hunt ball before | Where now | Lesson | First collect: lesson + card choice? |
|---|---|---|---|---|
| Captain's Cup Wreck | Hidden ball in the coral garden; chest held a "matchday coin" | **In the treasure chest** (6, −15) | its own real fact (diveBalls.ts) | Yes (was: lesson card only) |
| Paul's Grotto | Behind the sunken goal; chest coin | **In the chest** (4, −10) | its own real fact (diveBalls.ts) | Yes |
| Kelp Forest Wreck | Between kelp stands; chest coin | **In the chest** (−6, −16) | its own real fact (diveBalls.ts) | Yes |
| Ray Meadow | In a seagrass patch; chest coin | **In the chest** (5, −14) | its own real fact (diveBalls.ts) | Yes |
| Moon Arch | Past the rock arch; chest coin | **In the chest** (−7, −12) | its own real fact (diveBalls.ts) | Yes |
| Ball Crate Reef | Among the spilled crates; chest coin | **In the chest** (−8, −16) | its own real fact (diveBalls.ts) | Yes |
| Turtle Pool | In the turtles' pool; chest coin | **In the chest** (6, −13) | its own real fact (diveBalls.ts) | Yes |
| Coral Cay | 20 balls (`coralCayBalls.ts`) | unchanged | 20 Coral Cay lessons | Yes (BallHuntLesson + earnForBall) |
| Summit Isle | 15 balls (`summitBalls.ts`) | unchanged | 15 Summit lessons | Yes |
| East Jetty ("Walk the East Jetty") | **None** | **New**: `jetty-lighthouse`, loose on the lighthouse plaza (`eastJettyBalls.ts`) | The coin toss before kick-off (IFAB Law 8) | Yes (it is a COIN_QUEST ball) |
| History Museum, the four fields, vending / Konbini | Island balls already at or by them (`museum`, `museum-roof`, `club`, `coaches`, `high-clubgrounds`, `store`…) | unchanged | island lessons | Yes |

## What changed

- **Reef chests.** The `treasure` coin find (3 coins, "Island story") is gone from every zone, with its mesh and spin. Each zone's explore ball (same look, same real-fact lesson, 5 coins) now sits in the open chest (`DIVE_BALL_CHEST_Y` 0.5 m, over the rim, so it shows from the 3.2 m prompt range). The chest is drawn at the ball find; the layout keeps the chest's old spot (no coral, rock or pickup moved); the chest stays a waypoint of the guided path, so the 8 pickups and the zone friend keep their places. The ball is still a secret: the buddy never leads to it and it is not a reef task, so a zone's journey is now 11 tasks (8 pickups + relic, coral, clam), was 12.
- **Reef ball collect.** First pick-up: the find card is headed **Mini lesson · Real football fact**, and `earnForDiveBall` (`cardRewardTriggers.ts`) earns the card choice (`kind:'ball'`, `id:'dive:<zone>'`, once ever, nothing when card rewards are off). The find card holds card offers (`cardOfferHold.ts`) while it shows, so the choice opens after the child closes the lesson. Coins stay the dive's own 5 (no extra learning coins).
- **East Jetty.** One loose ball on the plaza beside the lighthouse (derived from `eastPier.ts` anchors), appended to `COIN_QUEST` (116 balls; save version 7: a save that had all 115 keeps the Matchday Fox and every costume, and its finale waits for the 116th). Lesson `coin-toss` (Rules of the game, level 1) with its own three-step scene and practice prompt; source in `ballHuntSources.ts` (IFAB Law 8, docs and tests only).

## Not changed / open

- The full BallHuntLesson diagram card is not used underwater (its lessons are COIN_QUEST diagrams); the dive card, now labelled a mini lesson, carries the reef balls' facts.
- The four fields, museum and shops already had nearby island balls, so no new balls there.
