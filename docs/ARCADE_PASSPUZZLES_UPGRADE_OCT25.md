# Pass Puzzles upgrade (Oct 25 2026)

Cabinet `puzzle`: `components/games/PassPuzzleGame.tsx` (+ module css), `lib/passPuzzle/*`, `lib/arcade/passPuzzleScene.ts`, `lib/arcade/passPuzzleAudio.ts`.

## Audit (before changes)

What already works well: the freeze/draw/play loop, live lane read (clear/tight/blocked), Scan, two-tier hints, rewind, coach's route replay, failure stop mark with camera lean, star goals, offside teaching. The engine, economy and board are solid; this pass is about feel.

What feels flat:
- **No momentum between passes.** A completed pass only plays a chime. Nothing on screen says "one-two!" or "that's three in a row", so the combination play the levels teach is not celebrated while it happens.
- **No reward across puzzles.** Solving several puzzles on the first try earns nothing visible; there is no streak.
- **Celebrations are rushed and samey.** Every goal plays `airplane` (scorer) and `thankPasser` (everyone else) squeezed into 1.5 s, although the authored moves last 2.2 to 2.6 s (bug: the poses run at ~1.7x speed and snap back to idle when cut). Teammates celebrate facing wherever they were facing, not toward the scorer.
- **The receiver is passive in flight.** The intended receiver only reacts on contact; there is no body opening up to receive while the ball travels.
- **Attackers have no reaction to a failed move.** Defenders cheer nothing, the passer and receiver do not show disappointment; the keeper does not react after a save.
- **Idle attackers are statues.** Defenders scan while the child thinks; attackers do not.
- **Goal impact is small.** 2-power stage burst plus two rings; no confetti, no crowd.
- **Sound is thin at the big moments.** The goal reuses the generic arcade cue; there is no crowd, no net swish, no shot whoosh, no "ooh" on a block, and no combo sting.

Bugs / kid friction:
- Celebration timing bug above.
- Nothing tells a child what "one-two" means at the moment they make one (the teaching word appears only in briefs).

## Changes

Gameplay (`lib/passPuzzle/combo.ts`, view):
- Live combo callouts during play (not in replays): "Nice pass!", "Keep it moving!", "One-two!" (receiver gives back to the player who passed to them), "First time!" (one-touch), "Tiki-taka x3+", and goal callouts ("GOAL! 3-pass move", "GOAL! Straight in"). Each callout carries a short teaching line ("Pass and move: you got it back").
- First-try streak across puzzles this visit: solving on try 1 without a rewind grows the streak; the result card shows "Streak x N". Session only: no change to saved progress, coins or the leaderboard.

Animation (`passPuzzleScene.ts`):
- Celebrations use each move's authored duration (`SKILL_MOVES[type].seconds`), scorer alternates `kneeSlide` / `airplane`, the last passer does `highFive`, others `fistBump` / `thankPasser`; teammates turn to face the scorer; scorer and assister look happy.
- Receiver opens up (receive approach pose, `receiveProgress` 0) while the ball travels to them.
- Failed move: passer and intended receiver react `dejected`; the intercepting defender and a saving keeper do a `fistBump` after their reaction; defenders no longer stay frozen.
- Idle attackers scan gently while the child thinks (same bounded idle window as defenders; none with reduced motion).

Graphics:
- Pooled goal confetti: one 48-instance `InstancedMesh` (single plane geometry, instance colours), fluttering for ~2.2 s then hidden; no allocation per frame, skipped with reduced motion.
- Bigger goal burst; a completed-pass sparkle ring at the receiver's feet (one pooled ring).

Sound (`passPuzzleAudio.ts`, still one-shots, no loops or timers):
- `puzzleGoalRoar` (bandpassed crowd swell + net swish), `puzzleCrowdOoh` (block/save), `puzzleShotWhoosh` (shots), `puzzleCombo(tier)` (rising sting for one-two/tiki-taka), `puzzleStreak(n)`.

Perf: all new visuals are pooled and only animate inside existing busy windows (goal, flight, reactions); the loop still sleeps on the result card after `RESULT_SETTLE_MS`. Voice cap (8) unchanged.

Kid friction fixed:
- The leaderboard name-entry sheet opened the instant a goal landed and covered the celebration, stars and "Why it worked". It now waits 2.6 s on the result card (score and board logic unchanged).
- The result card's settle window grows from 1.7 s to 2.9 s so the authored celebrations finish before the loop sleeps (still a hard stop; verified the canvas frame counter stops afterwards).
- Earned stars pop in one by one on the result card (CSS only, off with reduced motion).

## Tests

- `tests/pass-puzzle-combo.cjs`: pure combo/streak/celebration rules; every coach's route through the real engine (62 passes called, 24 named, 2 one-twos, 36 goal callouts); source wiring (live-only callouts, streak never saved, authored celebration lengths, reduced-motion confetti, voice gate on new sounds). Chained at the end of `npm test`.
- Existing puzzle tests (engine, scenarios, challenges, direct shots, offside, youth, packs, daily, explain, header, space, feel), arcade-stage-dispose, arcade-leaderboard, ui-spec: pass. `npx tsc --noEmit` clean.
- Browser (390x844 touch, own dev port): Give and Go solved with real touch strokes. Callouts "Nice pass!", "One-two!", "GOAL! 2-pass move"; 48 confetti live, scorer airplane + assister high five; loop sleeps on the result card; the next puzzle solved first try shows "Streak x2"; no page errors.

Not measured: real-phone heat. Added runtime cost is bounded to the goal (48 instanced flecks for 2.2 s) and a 0.5 s ring per pass.
