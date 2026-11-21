# Hold the Line: direction (Nov 21 2026; verified and trimmed the same day)

You are the defence. An original arcade game (id `holdtheline`) in the house comic print style with the island's beans. Built on
branch `game-holdtheline`; released Nov 21 2026 on `games-nov21` with a machine in the arcade room. Open it with `/arcade?game=holdtheline`.

## What it teaches (AGENTS.md)
The offside line is your second-last defender (drawn across the pitch; the assistant referee runs level with it); offside is judged
when the ball is PLAYED (the world holds for a beat at the kick in early matches, the runner labelled OFFSIDE / ONSIDE / LEVEL =
ONSIDE / OWN HALF = ONSIDE); level is onside (the captain's bent run); a runner in his own half cannot be offside; step up TOGETHER
(one defender left behind plays him onside: the game says so when a returning presser does it); drop for a long ball (but sit too deep
and they shoot); slide to the ball side; press a heavy touch or a passer who waits, and a press leaves a gap. Wording follows
lib/site/rules.ts "offside" and lib/site/terms.ts "press".

## The loop
Twelve attacks ("waves") a match against one team: passes in midfield, then ONE key moment with a visible tell and one right answer.
| Wave | Tell | Right answer | Wrong answer |
| --- | --- | --- | --- |
| `thru` / `decoy` / `deep` | the passer's wind-up (leg back, a ring fills) | step up during the wind-up: OFFSIDE | runner through, one on one |
| `long` | the passer far back in his own half | drop to 17 m or less: swept up | through |
| `wide` / `switch` | the ball goes to a winger (a switch: the far one, in the air) | slide so a defender is within 2.5 m across (4 m for a back three) | the winger shoots |
| `heavy` | the ball runs away from the passer (red ring) | tap a defender: tackle (or step on the wind-up that follows) | through ball |
| `bend` | the captain runs along the line; the passer waits | press the passer: tackle (or drop and face a long shot) | she is level = onside |
| `double` | a pass to feet, then a second wind-up | step on the second wind-up (or far enough on the first: offside at the pass to feet) | through |

Luck: one number per wave, fixed by the seed (the same for everyone), decides shots and one on ones. The right read never asks it.
A nearly-right read is graded (verify pass): a step during the wind-up that was too small -> 60% goal (78% for no step); a slide that
got within 2.5 m of covering -> 45% (62%); a drop that got within 3 m of the sweep line -> 55% (80%).
Controls: drag anywhere = move the line (x1.25 of the thumb's travel, measured from touch-down; 15 px a metre up the pitch at
390x844, so a clear 2.6 m step is about 30 px of thumb). Tap a defender (radius 26 px or more; under 10 px of wobble and 450 ms) =
press. Keys: W-S, A-D, 1-4 press, Space the nearest, P / Escape pause.

## Offside: the implementation and its edge cases (core `judgeOffside`, tests/holdtheline-core.cjs)
`judgeOffside({attackerY, ballY, defendersY, half})`, y = metres from your goal line. `defendersY` is every defending player, the
keeper included; the line is the SECOND smallest y, whoever that is. In order:
1. attacker at or beyond halfway (y >= 36) -> onside, `ownhalf` (on the halfway line = his own half).
2. attacker level with or behind the ball (within 0.15 m) -> onside, `behindball`.
3. attacker at least 0.15 m short of the line -> `onside`; within 0.15 m -> `level` (onside); past it -> `offside`.
Called at the moment the ball is played to the runner: the through ball, the long ball AND (verify pass) the pass to the runner's
feet in a one-two. Only the receiver is judged: a decoy standing past the line is not involved and is never flagged (at the kick he is
labelled NOT IN THE PLAY, so a child sees why). The ball's
position is the ball at the passer's feet. There are no restarts (goal kick / throw-in / corner) in the game.
Verify pass: 200,000 random positions matched a plain re-implementation of Law 11 with 0 differences; edge cases checked: keeper
upfield or off his line (he is then not one of the last two), one defender dropped (plays everyone onside), behind / level with the
ball, the halfway line exactly, level within the tolerance. Engine scan (800 matches of random input, 16,564 passes, 2,092 kicks): no
pass is ever played to a midfielder or winger standing offside, every call equals the plain rule; the keeper is always the last man at
a kick; in 6 kicks a returning presser was the second-last defender (the note then says "One defender was behind your line").
A runner times his run to be 0.4 m onside (0.3 in the Premier) of where the line was when the wind-up began.

## Teams (core `TEAMS`; the same ten in both leagues)
Coconut Rovers (back three; through balls), Sandy Bay Wanderers (back three; wide), Lighthouse Athletic (long ball), Tiki-Taka Tide
(short passes, one-twos), Mango Counter (counter; your line starts at 29 m), Palm Wing FC (switches), Captain Coral's XI (bent runs,
heavy touches), Harbour Hawks (heavy touches, long, deep), Reef Rondo (one-twos, bends), Island All-Stars (one of each).

## Tuning (core `tuning(league, match)`; match 1 -> 10)
| League | Wind-up | Pass | Switch + first touch | Onside margin | Helper | Goals allowed |
| --- | --- | --- | --- | --- | --- | --- |
| Coast League | 1.05 -> 0.68 s | 0.75 -> 0.60 s | 1.35 -> 1.10 + 0.45 s | 0.4 m | 1-3: dashed line + 0.95 s hold; 4-6: 0.65 s hold; 7-10: line at the kick only | 3 / 2 / 1 |
| Island Premier | 0.82 -> 0.64 s (verify pass; was 0.72 -> 0.56) | 0.55 -> 0.45 s | 1.05 -> 0.90 + 0.38 s | 0.3 m | none | 1 |
| Match of the Day | 0.8 s | 0.6 s | 1.15 + 0.4 s | 0.4 m | 0.65 s hold | 2 |
Score: offside 150, tackle / block 120, slide 100, sweep 90, keeper's save 40; x1 to x1.5 for stops in a row; x1.25 in the Premier.
Full time +300 a win, +150 one goal against, +500 clean sheet. Medals 1,400 / 2,400 / 3,400. Coins 1 per 400 points.

## Bot numbers (`node tests/holdtheline-bots.cjs --bots`, verify pass; bots only use what a player can see: `g.look()`)
| Bot | Coast League: wins / goals / clean sheets / score | Island Premier: wins / goals / clean sheets / score |
| --- | --- | --- |
| ideal (answers 0.20 s after each read) | 100% / 0.00 / 100% / 2,887 | 100% / 0.00 / 100% / 3,609 |
| expert | 97% / 0.37 / 69% / 2,614 | 90% / 0.48 / 62% / 3,073 |
| mid | 76% / 1.05 / 32% / 1,935 | 40% / 1.48 / 12% / 1,591 |
| careful first-timer | 62% / 1.40 / 18% / 1,531 | 18% / 1.77 / 5% / 916 |
| late (steps 0.08 s after the kick) | 18% / 2.65 / 1% / 568 | 6% / 1.93 / 1% / 492 |
| always drop | 14% / 2.66 / 1% / 297 | 3% / 1.96 / 1% / 259 |
| random | 14% / 2.73 / 0% / 374 | 0% / 2.00 / 0% / 296 |
Wins by match, Coast: careful 97 100 100 67 93 90 33 20 0 3 %; mid 100 100 100 93 93 87 57 63 30 30 %. Premier: careful 37 23 57 0
20 27 0 3 0 0 %; mid 40 63 67 37 37 67 7 37 3 7 %; expert 97 100 93 77 87 90 93 93 83 87 %. Match of the Day: expert 100%, mid 77%,
careful 37%. Independent fairness search (verify pass): 1,056 waves (both leagues, all ten matches, the daily), 41 input strategies
each: every wave has at least one read that ends in a stop with no luck. The one read that can come too late is a long ball in the
Premier against a high line (Mango Counter): dropping on the wind-up is not always enough; dropping when the deep passer gets the ball is.

## Come-back hooks (kid-safe: no day streaks, no timers, no notifications)
Match of the Day (daily seed, same for everyone, three stars, free replays of the same pattern); the season (ten teams, then the
Island Premier); the clean-sheet run (restarts on a goal, never on a day); the trap book (12 feats, shown on the results card as "New
trap book page: ..."). Save key `fi2-holdtheline-v1`; `HL_FEAT_IDS` exported for a future cross-arcade card.

## Heat
Two canvases (static painted once per size / venue + moving), DPR capped at 2, 30 draws a second on phones, 60 on desktop. 0 frames on
the start card, team card, guided hold, pause, results and a hidden tab. Verify pass (headless Chrome, M-series Mac, not an iPhone):
phone 0.12 ms a frame average, 1.5 ms worst over 3,583 frames.

## Room placement, owner paste, migrations
Placed Nov 21 2026 in `arcadeCabinets`: the spot and the room budget are in docs/arcade-aaa/NEW-GAMES-NOV21.md.
Owner paste: `docs/arcade-aaa/new-games-nov21-supabase.sql` (Keepy-Uppy Beat and Hold the Line) (idempotent; until it is pasted everything saves on the device and the island
board does not take the score). Migration copies: 20261209_holdtheline_boards.sql, 20261210_analytics_holdtheline.sql (renumbered Nov 21 2026 from 20261207/20261208 when
this branch met Keepy-Uppy Beat, which keeps those dates; the "newest file" pins in the tests were moved too).

## Not done / weaker than wanted
- No room machine yet (see docs/arcade-aaa/NEW-GAMES-NOV21.md). /games page (Nov 21 2026, integration): `/games/soccer-defending-game`,
  built complete but noindex, out of the sitemap, the hub and every count until placed (tests/seo-games-gate.cjs covers every subset of
  the two new games). Media: clip (Coast League OFFSIDE, 10 s) + four stills (OFFSIDE with the line drawn, a press at night, a switch
  met by the slide, the season map), share picture. Placing it also links it from the pressure-and-cover-2v2 and recover-goal-side drills.
- Human tuning is from bots, not children: drag gain, tap radius and wind-ups need a real phone playtest.
- One answer per wave; keeper automatic; the line is always straight; beans are simple capsules.
- Sound checked through the Web Audio graph only; this branch's scripts/check-arcade-audio.cjs runs unmuted, so the verify pass skipped it.
