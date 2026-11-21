# Hold the Line: direction (Nov 21 2026)

You are the defence. An original game for the arcade (id `holdtheline`), built in the house comic print style with the island's beans.
Status: built on branch `game-holdtheline` (on top of `game-safehands`), NOT pushed, NOT in the room yet (see "Room placement").
Open it with `/arcade?game=holdtheline`.

## What it teaches (AGENTS.md: every feature teaches football)
Each mechanic is one real defending idea, said in kid words on the team cards, the hints, the coach line and the results card
(wording follows lib/site/rules.ts "offside" and lib/site/terms.ts "press").

| Idea | In the game |
| --- | --- |
| The offside line | Your second-last defender (the keeper is usually the last). It is drawn across the whole pitch, as the site's diagrams do, and the assistant referee runs the touchline level with it. |
| Judged when the ball is PLAYED | The world holds for a beat at the kick (early matches) with the line and the runner labelled: OFFSIDE / ONSIDE / LEVEL = ONSIDE / OWN HALF = ONSIDE. A step after the kick is too late. |
| Step up together | Drag up during the passer's wind-up and the whole line steps as one: the runner is left behind it. |
| Level is onside | The clever striker bends her run along the line and stays level: the flag stays down. |
| Your own half | A runner in his own half cannot be offside: a line pushed past halfway catches nobody, and a long ball from deep needs a drop, not a step. |
| Stay compact | The back line is tied by a rope and moves as one unit. The only gap is the one a presser leaves (drawn in red). |
| Drop | A passer far back in his own half hits it long: drag down and the ball is swept up. Sit too deep and they shoot from distance. |
| Slide to the ball side | A ball out wide or a switch of play: drag across or the winger is free. |
| When to press, and what it costs | Tap a defender to press. It wins the ball on a heavy touch or a passer who waits. On a plain pass they play into the gap. |

## The loop
A match is twelve attacks ("waves") against one team. Each wave: passes in midfield, then ONE key moment with a clear tell, and one right answer.

| Wave (core `WaveKind`) | The tell | Right answer | Wrong answer |
| --- | --- | --- | --- |
| Through ball `thru` | head up, leg back, a ring fills round the passer (the wind-up) | step up during the wind-up: OFFSIDE | hold or step late: the runner is through, one on one (78% goal) |
| Decoy `decoy` | one runner checks short, one goes | step: only the runner the ball is played to is judged | as above |
| Runner from deep `deep` | the runner starts metres behind the line and arrives at speed | step: he is still past the line at the kick | as above |
| Long ball `long` | the passer is in his own half, his runner too | drop to 17 m or less: swept up | step: no flag (own half), he is through (80% goal) |
| Out wide `wide`, switch `switch` | the ball travels to a winger (a switch goes to the FAR one, in the air) | slide so a defender is within 2.5 m across (4 m for a back three): shut out | the winger is free: he cuts in and shoots (62% goal) |
| Heavy touch `heavy` | the ball runs away from the passer's feet (a red ring) | tap the nearest defender: tackle. Or step on the wind-up that follows | he recovers and plays a quick through ball |
| Bent run `bend` | the captain (armband) runs along the line; the passer waits with a foot on the ball | press the passer: tackle. Or drop and take the long shot | step: she stays level = onside, through |
| One-two `double` | a wind-up, a pass to feet, a lay-off, a second shorter wind-up | step on the second wind-up (stepping on the first is harmless) | the second runner is through |

Other rules: while the line is still stepping up the passer does not shape ("step too early and the runner holds his run"); a line at
18 m or less invites a long shot (the keeper saves 96% from 25 m, about half from 15 m); a press on a wind-up that arrives in time is a
tackle, on a long shot a block; a press on a plain pass is passed round into the gap (a shot from the edge of the line).
Luck: one number per wave, fixed by the seed, decides the shots and one on ones, so a wave plays the same for everyone. A correct
read never needs it.

Controls: drag anywhere = move the line (up / down the pitch, across it; the line follows at 6.5 m/s). Tap one of your defenders =
press. Keys: W-S / up-down, A-D / left-right, 1-4 press that defender, Space the nearest, P / Escape pause, Enter / Space on cards.

## Offside: the implementation and its edge cases (core `judgeOffside`, tests/holdtheline-core.cjs)
`judgeOffside({attackerY, ballY, defendersY, half})`, y = metres from your goal line. `defendersY` is every defending player, the
keeper included; the line is the SECOND smallest y, whoever that is. Checked in this order:
1. attacker at or beyond halfway (y >= 36) -> onside, `ownhalf` (on the line counts as his own half).
2. attacker level with or behind the ball -> onside, `behindball`.
3. attacker at least 0.15 m short of the line -> `onside`; within 0.15 m either side -> `level` (onside); past it -> `offside`.
Edge cases tested: one defender left behind plays everyone onside (the line is the second-last, not the highest); the keeper off his
line can BE the offside line (when he is one of the last two) or not count at all (when two defenders are behind him); fewer than two
defenders: nobody can play the attacker onside; level by a hair; the halfway line.
It is called once, at the kick, with the receiver only: a decoy standing offside is not the player the ball is played to (not
interfering). The snapshot (`state.snap`: the line, the runner, the reason) is what the view draws, so the picture and the call cannot differ.
A runner times his run to be 0.4 m onside (0.3 in the Island Premier) of where the line WAS when the wind-up began: the line has to
move up 0.55 m or more before the kick. Not modelled: offside from a deflection or a save, a throw-in / goal kick / corner (no offside),
"interfering with play" beyond "the ball was played to him".

## Teams (lib/arcade/holdtheline/core.ts `TEAMS`; the same ten in both leagues)
| # | Team | Style | Deck (9 of the 12 waves; 3 more are dealt from it again) | Lesson |
| --- | --- | --- | --- | --- |
| 1 | Coconut Rovers (back three) | straight runners | 7 through, 2 decoy | Step up together |
| 2 | Sandy Bay Wanderers (back three) | out wide | 4 wide, 2 switch, 3 through | Slide to the ball side |
| 3 | Lighthouse Athletic | long ball | 5 long, 2 through, 2 deep | Drop for the long ball |
| 4 | Tiki-Taka Tide | 5 to 7 short passes | 3 one-two, 2 through, 2 wide, 2 decoy | Stay compact. Be patient. |
| 5 | Mango Counter | counter-attack (your line starts at 29 m) | 4 deep, 3 long, 2 through | Mind the space behind you |
| 6 | Palm Wing FC | wing play | 5 switch, 2 wide, 2 through | Slide across together |
| 7 | Captain Coral's XI | the clever striker | 4 bend, 2 heavy, 2 through, 1 decoy | Press the passer who waits |
| 8 | Harbour Hawks | direct and rough | 3 heavy, 2 long, 2 deep, 2 switch | When to press |
| 9 | Reef Rondo | pass and move | 3 one-two, 2 bend, 2 switch, 2 decoy | Two balls in behind |
| 10 | Island All-Stars | everything | one of each | Read it, then choose |

## Tuning table (core `tuning(league, match)`; values run from match 1 to match 10)
| League | Wind-up | Pass | Switch flight + first touch | Heavy touch lasts | Onside margin | Helper | Goals you may let in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Coast League (beach ground) | 1.05 -> 0.68 s | 0.75 -> 0.60 s | 1.35 -> 1.10 s + 0.45 | 1.6 -> 1.3 s | 0.4 m | matches 1-3: dashed line always on + a 0.95 s hold at the kick; 4-6: a 0.65 s hold; 7-10: the line only at the kick, no hold | 3 (matches 1-3), 2 (4-6), 1 (7-10) |
| Island Premier (stadium, lights) | 0.72 -> 0.56 s | 0.55 -> 0.45 s | 1.05 -> 0.90 s + 0.38 | 1.25 -> 1.0 s | 0.3 m | none: the line shows only at the kick | 1 |
| Match of the Day | 0.8 s | 0.6 s | 1.15 s + 0.4 | 1.35 s | 0.4 m | a 0.65 s hold at the kick | 2 |

Score per stop: offside 150, tackle 120, block 120, slide 100, sweep 90, a keeper's save 40 (+40 for covering a winger mid-wave), x (1 +
0.1 per stop in a row, to x1.5) x 1.25 in the Island Premier. Full time: +300 for a win, +150 with one goal against, +500 for a clean
sheet. Stars: clean sheet 3, one goal 2, a win 1. Medals 1,400 / 2,400 / 3,400 (gold needs the Premier or a perfect Coast match
plus). Board ceiling 8,000. Coins: 1 per 400 points, capped at 12 like the other machines.

## Bot numbers (`node tests/holdtheline-bots.cjs --bots`; the bots only use what a player can see: `g.look()`)
Averages over the ten teams, 24 seeded matches each (the per-match rows: 30 each).
| Bot | Coast League: wins / goals a match / clean sheets / mean score | Island Premier: wins / goals / clean sheets / mean score |
| --- | --- | --- |
| ideal (reads every wave, answers 0.20 s later) | 100% / 0.00 / 100% / 2,887 | 100% / 0.00 / 100% / 3,609 |
| expert (0.30-0.40 s, 3% missed reads, presses 90% of heavy touches) | 97% / 0.41 / 65% / 2,593 | 80% / 0.72 / 48% / 2,781 |
| mid (0.40-0.58 s, 9% missed, presses 60%, a bad press in 6% of waves) | 73% / 1.13 / 30% / 1,868 | 19% / 1.75 / 6% / 1,006 |
| careful first-timer (0.50-0.72 s, 11% missed, presses 40%) | 58% / 1.48 / 16% / 1,473 | 3% / 1.97 / 0% / 336 |
| late (the same reads, steps 0.08 s AFTER the kick) | 18% / 2.65 / 1% / 568 | 6% / 1.93 / 1% / 492 |
| always drop (sits at 8 m) | 11% / 2.69 / 0% / 266 | 3% / 1.97 / 0% / 230 |
| random (random drags and presses) | 13% / 2.74 / 0% / 358 | 0% / 2.00 / 0% / 251 |

Wins by match, Coast League (matches 1 to 10): careful 97 100 100 63 90 80 23 17 0 3 %; mid 100 100 100 93 93 83 57 63 13 20 %;
expert 100 100 100 100 100 100 97 100 87 90 %. Island Premier: mid 33 47 60 0 20 13 0 3 0 0 %; expert 80 100 90 70 77 83 90 83 60 57 %.
Season, matches won in a row from the start: careful 4.5 of 10 on first tries (6.2 with three tries a match); mid 5.7 (8.2); expert
8.9 (10.0). Island Premier: mid 0.5 (1.8), expert 4.1 (9.8). Match of the Day: ideal 100% wins, expert 98%, mid 75%, careful 32%, random 10%.
A missed read is modelled as more likely with a shorter wind-up (x (1.05 / wind-up)^2.4). The ideal bot's 0 goals in every match of
both leagues IS the fairness proof (asserted in tests/holdtheline-bots.cjs and, wave by wave over 1,440 waves, in holdtheline-core.cjs).
The "late" and "always drop" wins come from the two teams whose waves they happen to answer (late still slides: Palm Wing, Harbour;
drop still sweeps: Lighthouse). The losers concede their goals in fewer waves because a match ends when the limit is passed.
A match is 114 s of play for the ideal bot in the Coast League (91 s in the Premier), plus the holds at the kick and the cards:
2 to 2.5 minutes in the browser (the scripted reader: 12 waves in about 125 s on the phone profile).
Real browser, real touch gestures (`scripts/check-holdtheline-browser.cjs --mobile --tour`): the guided first step ends in an offside,
the reader script wins match one 0 goals / 12 stops / 3,275 points, match two and the Match of the Day reach full time.

## Come-back hooks (kid-safe: no day streaks, no timers, no notifications, nothing is lost by staying away)
1. Match of the Day: twelve attacks with every kind of wave, fixed by `holdthelineDailySeed` (the arcade's FNV-1a daily seed of
   `holdtheline:<local day>`), the same for everyone that day, scored out of three stars. Free replays; the pattern is the same on a
   replay, so a child can learn it ("You know what is coming now").
2. The season: ten matches in the Coast League, one team and one problem at a time (win to meet the next team; stars per match on
   the season map), then promotion to the Island Premier: the same teams with less time to read them. Saved in `fi2-holdtheline-v1`.
3. The clean-sheet run: matches in a row without a goal against, with a personal best (a count that restarts on a goal, never on a
   calendar day), on the start card and the results card.
4. The trap book: twelve pages for feats (first flag, flag hat-trick, perfect slide, clean tackle, brave block, swept up, twice
   bitten, brick wall, clean sheet, no way through (a clean sheet against Mango Counter), three stars, promotion), shown on the start
   card as a shelf with empty slots.
Hook for a future cross-arcade card system (NOT built here): `HL_FEAT_IDS` / `HL_FEATS` in core.ts, and `save.book` in `fi2-holdtheline-v1`.

## Look and sound
One comic page: the pitch from above and behind your goal (slight tilt: far things a little smaller), your goal and net nearest. Your
back line is the player's own island bean (body, skin, hair) seen from behind, numbered 1-4, each on a paper ring, tied by a rope.
The other team faces you in its kit (it switches to its away colours if they are too close to yours). The assistant referee in black
runs the right touchline with a red and yellow flag: the recurring character (also on the start card and as the trap book's icon).
Kit hex values only (ink #231a2e, paper #fff3d6, sun, orange, red, teal), Ben-Day dots, hard shadows, no gradients / blur / glow.
Venues by league: Coconut Beach ground (sand), Lighthouse Stadium under the lights, Harbour Ground for the Match of the Day.
Sound (audio.ts, synthesised, one limiter): pea whistle, soft boot ticks for passes, a rising creak for the wind-up (the cue to step),
the SNAP of the flag + the whistle for offside, studs and leather for a tackle, a long boot for a sweep, short crowd swells, the net
and a drum for a goal, glockenspiel for pages and medals. No music, no loops. Fully playable muted (every cue has a drawn twin).

## Heat
Canvas 2D: one static canvas (painted once per size / venue) + one moving canvas; DPR capped at 2; no particles, no timers in the
game (one 7 s timeout clears a hint). The loop runs only while a wave is on: start card, team card, the guided hold, pause, results
and a hidden tab draw 0 frames (checked by the browser script: 0 rAF calls in 1 to 2 s on each). 30 draws a second on phones, 60 on
desktop. Measured in headless Chrome on the M-series Mac: phone profile 390x844 @2x, rules + draw 0.31 ms a frame on
average, 3.5 ms worst, over 3,650 frames at 30 draws a second; desktop 1440x900, 0.29 ms average, 3.5 ms worst, over 7,024 frames at
60. Desktop numbers, not an iPhone temperature claim. Audio probe (`scripts/check-arcade-audio.cjs holdtheline`): one connection to
the destination, menu and pause silent (RMS 0), kick-off / pass / flag / full time audible.

## Room placement (owner decision pending; the room is untouched)
Like Safe Hands, the game is in the catalog as `arcadeUnplaced` (lib/arcade/arcadeCatalog.ts): playable by link, counted in
analytics, with its board, but no machine, no change to the room or to any "eleven games" line. The back row is full (10 uprights),
and Safe Hands' proposal already asks for the east wall at x 11.6, z -1. Proposals for this one:
- A (recommended): the WEST wall, the mirror of Safe Hands' spot: a touchline bench with the assistant referee's flag standing in
  a holder and the screen as the "tactics board" behind it. No machine moves; costs one machine's meshes and its prompt.
- B: a twelfth / thirteenth cabinet in the back row (everything re-spaces).  - C: it takes over a machine.
To place it: move the entry from `arcadeUnplaced` into `arcadeCabinets` (+ `ARCADE_ROW` for B), add it to `HALL_MACHINES`, the coins
panel `earning` line, `arcadeCabinetAttract` TITLES and the room tests; every "N games" line then counts it by itself.

## Owner: one paste
`docs/arcade-aaa/holdtheline-supabase.sql` (board id `holdtheline` + analytics key `arcade_holdtheline`; idempotent; names every
earlier board and key itself, Safe Hands' included, so it works with or without safehands-supabase.sql; ends "OK, Hold the Line
installed"). Until then the game works: everything saves on the device and the island board just does not take the score.
Migration copies (not applied): supabase/migrations/20261207_holdtheline_boards.sql, 20261208_analytics_holdtheline.sql. If the
other new game of this batch also adds 20261207 / 20261208 files, renumber one pair when the branches meet (and the "newest file"
pins in tests/runner-daily-boards.cjs, admin-analytics-coverage.cjs, admin-analytics-day.cjs, game-saves.cjs, puzzle-polish-nov8.cjs).

## Not done / weaker than wanted
- No machine in the room and no entry in the room's game list: reachable only by `/arcade?game=holdtheline` until the owner picks a spot.
- No /games page, media or SEO yet (the next agent): lib/site/games.ts ALL_GAME_PAGES, gameMedia.ts / gameMedia.json, videos.ts,
  drillLinks.ts, learnFeatures.ts, the capture scripts (scripts/capture-game-shots-players.cjs, docs/seo/build-game-images.py),
  scripts/gen-lastmod.cjs output, tests/seo-games.cjs and tests/seo-games-gate.cjs (the gate today only knows Safe Hands as unlisted).
- Human tuning is from bots, not from children: the drag gain (1.25), the tap radius, the wind-up lengths and the late Coast League
  limit (one goal) need a real playtest on a phone. The human-like bots are guesses about reaction time and missed reads.
- One answer per wave: the attack does not continue after a stop (no second phase, no recovery runs, no set pieces), the keeper is
  automatic, and defenders never mark a runner or recover individually. The line is always perfectly straight (staying compact is
  taught by the rope and the presser's gap, not by a line the child has to straighten).
- Beans are simple 2D capsules (your own bean's colours, no outfit or headwear); poses are a lean and speed lines, no run cycle.
  The pitch below the line is plain grass: true to the idea (the space behind you) but not rich scenery.
- The long shot, the one on one and the free winger are decided by one seeded number, not by a keeper the child controls.
- Offside details not modelled: deflections and saves, restarts with no offside, "interfering" without receiving the ball.
- Sound was checked through the Web Audio graph (levels, routing, silence on menus), never listened to.
- Not measured on a real iPhone.
