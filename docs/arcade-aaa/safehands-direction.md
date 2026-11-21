# Safe Hands: direction (Nov 21 2026)

You are the goalkeeper. An original game for the arcade (id `safehands`), built in the house comic print style with the island's beans.
Status: built on branch `game-safehands`, NOT pushed, NOT in the room yet (see "Room placement"). Open it with `/arcade?game=safehands`.

## What it teaches (AGENTS.md: every feature teaches football)
Each mechanic is one real goalkeeping idea, said in kid words on the round cards, the hints, the coach line and the results card.

| Idea | In the game |
| --- | --- |
| Set position | Before the kick, drag the keeper onto the line between the ball and the middle of the goal. A spot on the grass turns teal when it is right (Sunday league). |
| Narrow the angle | Drag up to step off the line: the angle cone's "gate" at your feet gets smaller, so a dive reaches the corner. Too far on a long shot and the ball is chipped over you. |
| Be set | Your feet lock when the referee whistles: position first, then react. |
| Read the striker | The run-up shows real tells in the close-up panel: the approach, a glance, the hips opening, the PLANTED FOOT (always true: it points where the shot goes), the lean (chest up = high, head down = low) and the wind-up (a big backswing = a hard shot). |
| Catch vs parry vs punch | A soft shot is caught and held. A hard shot (or any firm shot with a wet ball) is spilled if you try to catch it: push it wide with a dive, or tip it over. A spill gives a rebound to save. |
| Stay big | In a one on one, come out and stay on your feet: standing tall off the line blocks much more. Only dive at the feet when the ball runs away from the striker (a heavy touch). Get too close and she goes round you. |
| The wall | Free kick: pick 2, 3 or 4 beans (ball in the middle: more; out wide: fewer). The wall guards the near post, you stand in the open side. Too few leaves a gap; too many and you cannot see the planted foot. |
| Command your area | Cross: catch it if it lands free in your small box, punch it in a crowd, stay on your line if it is far out (then save the header). The wrong call is punished the way it is in a match. |
| Penalties | The keeper stays on the line until the kick (dragging up does nothing at a penalty). In the shoot-out a stopped kick is over: no rebounds. |

## The loop
SET (drag: left-right along the line, up to step out) -> WHISTLE (feet set) -> the RUN-UP shows the tells -> ONE action -> the ball is saved if
the keeper's reach covers it when it arrives. Reach grows with the time since the action (0.75 m of body + 6.5 m/s, at most 3.35 m), so an
early correct read reaches the corner and a late one does not. Actions: swipe left / right = dive low, up-left / up-right = dive high,
up = tip over, down = low block, no swipe = stay and catch. Decisions (wall size, the cross, a loose ball) are big thumb buttons.
Keys: A-D / arrows shuffle, W-S step out and back; after the whistle left / right dive low, Q / E high, up tips over, Space dives on a loose
ball; 2-4 pick the wall, 1-3 answer a cross; P / Escape pause; Enter / Space on the cards.

## Tuning table (lib/arcade/safehands/core.ts `TIERS`, `SH`)
| Round | Venue | Shots (6) | Tell window (planted foot before the kick) | Shot speed | Aids | Tricks |
| --- | --- | --- | --- | --- | --- | --- |
| 1 Sunday league | park at sunset | penalties, one on ones | 0.80 s | x0.85 | angle cone, ideal spot, tells labelled in words | none |
| 2 Academy | academy pitch | + long shots (and rebounds from spills) | 0.62 s | x1.0 | angle cone | stutter run-ups, a striker who looks away |
| 3 First team | floodlit stadium | + free kicks with the wall, + crosses | 0.50 s | x1.1 | cone only on free kicks | + strikers who wait for you to move, deflections 35% |
| 4 Cup final | stadium at night, rain | everything, ends on a penalty from the captain | 0.40 s | x1.2 | cone only on free kicks | all, deflections 45%, wet ball (hold limit 0.5 instead of 0.72) |

Three goals end the run; a round with no goals gives one back (never more than three). Clearing the Cup final ends the run with a bonus.
Score per save: 100 (+40 held, +60 fingertips, up to +80 for an early read, +40 good position, +60 the right call, +50 a rebound) x (1 + 0.25
per round) x (1 + 0.1 per save in a row, to x2). Round bonus 300 x round (+200 clean). Cup 1,000 + 300 a goal left. Medals 2,500 / 6,000 / 11,000.
Fairness rule: a save is always possible with the right read. The planted foot and the lean never lie; a "waiting" striker only switches
if you move BEFORE the foot is planted; deflections never change the side and never pass the corner.

## Bot numbers (`node tests/safehands-bots.cjs --bots`, 120-200 seeded runs each; the bots only use what a player can see)
| Bot | Saves: Sunday / Academy / First / Cup | Rounds cleared in a real run 0 / 1 / 2 / 3 / cup | Mean score | Run |
| --- | --- | --- | --- | --- |
| oracle (perfect spot, moves 0.20 s after the foot) | 100 / 100 / 100 / 100 % | cup 100% | 17,400 | 148 s |
| reader "reads tells" (0.25 s) | 100 / 100 / 100 / 100 % | cup 100% | 17,000 | 148 s |
| expert (0.30 s, few wrong reads, knows favourites) | 98 / 94 / 91 / 88 % | 0 / 3 / 8 / 16 / 73 % | 12,500 | 141 s |
| mid (0.40 s, some wrong reads and calls) | 90 / 80 / 69 / 50 % | 1 / 16 / 55 / 25 / 3 % | 5,300 | 106 s |
| careful first-timer (0.50 s, stands roughly right) | 88 / 73 / 50 / 35 % | 3 / 38 / 57 / 3 / 0 % | 3,200 | 83 s |
| random (random spot, random move, random time) | 18 / 18 / 23 / 21 % | 98 / 2 / 0 / 0 / 0 % | 140 | 26 s |
Daily Shootout, saves out of 5: reader 5.0, mid 3.3, careful 2.1, random 0.9. Wrong reads are modelled as rarer where the tells are labelled
(x0.3 in Sunday league) and more common with no aid (x1.5). The oracle's 100% at every round IS the fairness proof (asserted in the test).
Real browser, real touch gestures (`scripts/check-safehands-browser.cjs --mobile --full`): the tell-reading script won the cup in 145 s,
24 saves, 0 goals, 18,420 points.

## Come-back hooks (kid-safe: no day streaks, no timers, no notifications, nothing is lost by staying away)
1. Daily Shootout: five penalties from five named takers, the same for everyone that day (`safehandsDailySeed` = the arcade's FNV-1a daily
   seed of `safehands:<local day>`), about a minute, shown as saves out of 5 with "Tomorrow: five new takers. Can you save N?". Free replays.
2. Career ladder: Sunday league -> Academy -> First team -> Cup final, ticked on the start card; a cleared round unlocks "Start at".
3. Glove shelf: 12 pairs for feats (first save, three low saves to the left, a clean round, a tricked penalty saved, fingertips, five held,
   five early reads, a free kick behind the right wall, two right calls on crosses, a dive at feet, 5/5 in a shoot-out, the cup). The shelf
   with its empty slots is on the start card; the keeper wears the newest pair.
4. Scouting cards: 10 named strikers with fixed habits (Rosa "Rocket" always goes low to your left after a long run-up; Nia "No-Look" looks
   away from her target; Mei waits for you to move...). A habit is written on the card after it is seen twice, so coming back makes you read
   them earlier (an early read scores more). The Daily Shootout card lists the day's takers with what you have scouted.
Hook for a future cross-arcade card system (NOT built here): `SH_FEAT_IDS` / `SH_FEATS` in core.ts, and `save.gloves` in `fi2-safehands-v1`.

## Look and sound
Two comic panels on one upright page: the pitch from behind and above the goal (net and frame nearest, the keeper = the player's own island
bean from behind in gloves, the angle cone, the wall, the cross's landing ring), and an inset close-up of the striker big enough to read on
a phone. Kit hex values only (ink #231a2e, paper #fff3d6, sun, orange, red, teal), Ben-Day dots, hard shadows, no gradients / blur / glow.
Sound (audio.ts, synthesised, one limiter): pea whistle, leather thump, glove slaps (soft catch, sharp parry, light fingertips), net and
drum for a goal, short crowd swells, glockenspiel for rounds and gloves. No music, no loops. Close call: one 340 ms hold on a fingertip save.

## Heat
Canvas 2D: one static canvas (painted once per size / venue) + one moving canvas; net and close-up backdrop cached; DPR capped at 2; no
particles, no timers. The loop runs only while a shot is on: start card, round cards, pause, results and a hidden tab draw 0 frames
(checked by the browser script: 0 rAF calls in 1.5 to 3 s on each). 30 draws a second on phones, 60 on desktop. Measured in headless Chrome on the M-series Mac, phone
profile 390x844 @2x: rules + draw 0.13 ms a frame on average, 1.5 ms worst, over 4,318 frames. Desktop numbers, not an iPhone temperature claim.

## Room placement (owner decision pending; the room is untouched)
The back row is full: 10 uprights at 2.44 m (0.54 m between bodies). An eleventh would re-space the row to 2.2 m, move every machine and
add a cabinet's draws, so Safe Hands is in the catalog as `arcadeUnplaced` (lib/arcade/arcadeCatalog.ts): playable by link, counted in
analytics, with its board, but no machine, no change to the room or to any "eleven games" line. Mock: `docs/arcade-aaa/shots/safehands-room-proposal.svg`.
- A (recommended): the east wall at x 11.6, z -1, the mirror of the Air Futbol table: a small goal frame with the screen in its mouth and a
  pair of gloves on the post. No machine moves; costs one machine's meshes and its prompt.
- B: eleventh cabinet in the back row (everything re-spaces).  - C: it takes over a machine.
To place it: move the entry from `arcadeUnplaced` into `arcadeCabinets` (+ `ARCADE_ROW` for B), add it to `HALL_MACHINES`, the coins panel
`earning` line, `arcadeCabinetAttract` TITLES and the room tests; every "N games" line then reads twelve by itself.

## Owner: one paste
`docs/arcade-aaa/safehands-supabase.sql` (board id `safehands` + analytics key `arcade_safehands`; idempotent; ends "OK, Safe Hands installed").
Until then the game works: everything saves on the device and the island board just does not take the score.

## Not done / weaker than wanted
- No machine in the room and no entry in the room's game list: reachable only by `/arcade?game=safehands` until the owner picks a spot.
- /games page (Nov 21 2026, verify pass): /games/soccer-goalkeeper-game is built complete (copy, FAQ, clip, four stills, share
  picture, JSON-LD) but UNLISTED while the game is in `arcadeUnplaced`: noindex, out of the sitemap, llms.txt, the hub, the Library
  and the drill links, and no count changes (lib/site/games.ts ALL_GAME_PAGES vs GAME_PAGES). Placing the game in the room (moving
  the entry into `arcadeCabinets`) lists it everywhere and makes every count twelve with no site edit (tests/seo-games-gate.cjs).
  After placing: run `node scripts/gen-lastmod.cjs` and move the UNPLACED row of docs/seo/build-game-images.py into GAMES if the
  hub picture should count it.
- The keeper uses the player's saved bean colours (body, skin, hair) drawn in 2D, not the 3D rig with its outfit and headwear.
- Animation is pose-based (ready, dive, tip, block, hold): no in-between frames; strikers share one body with different tops.
- Tells are honest by design; "hips" and "approach" are subtle and unlabelled, so most kids will read only the foot and the lean.
  Verify pass (Nov 21 2026): the planted boot now gets a thick sun outline (Sunday league: while the foot is down, gently pulsing,
  static with reduced motion; Academy: a 0.35 s flash as it lands; First team on: none), and the very first career run opens with a
  guided penalty (shown once, `intro` in the save): "Watch the striker's planted foot up there", then the world holds on the planted
  foot (the loop sleeps: 0 frames) with "The foot points LEFT. Swipe left to dive!" and a moving finger (CSS only) until the child
  swipes the right way. The guided shot is a plain low one to a side (core `intro`, no extra random draws).
- Human tuning is from bots, not from children: the swipe threshold (22 px) and the tell windows need a real playtest on a phone.
- Deflections are mostly drama (they never change the side). The wet ball only changes what can be held.
- Not measured on a real iPhone.
