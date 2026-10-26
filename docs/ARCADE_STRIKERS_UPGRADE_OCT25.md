# Island Strikers upgrade, Oct 25 2026

Cabinet: Island Strikers (`live`). Files: `lib/arcade/striker*.ts`, `components/LiveArcadeMatch.tsx` (+ `.module.css`).
Owner request: better gameplay, graphics, sounds and more detailed player animation.

## Audit (before changes)

Strikers is the deepest cabinet already: 4 teaching rounds, Island Cup, set pieces, skill moves, a shot gauge, hit-stop,
replay, team spirit and pass-chain sounds. What was wrong or flat:

1. **Unplayable on phones (blocker).** Since Oct 24 the app is portrait-only on phones (`components/RotateLock.tsx` covers a
   sideways phone with "Turn your phone upright"). Strikers still gated portrait with its own "Turn sideways to play" card. A phone
   held upright was told to rotate, and a rotated phone was told to turn upright: no orientation could play. The scene already had
   a portrait camera (pitch rotated, Gold attacks up, stick axes mapped), so only the gate and the layout were missing.
2. **Tiny players upright.** Portrait kept the fixed whole-pitch camera (the follow cam was off in portrait), so bodies were ~20 px.
3. **Celebrations repeat.** Every goal: the scorer airplanes then knee-slides, one teammate high-fives. The pass that made the goal
   (the habit the game teaches) is never acknowledged by the players themselves; `thankPasser` and `fistBump` moves exist but are unused.
4. **Full time is frozen.** The final whistle stops the loop; bodies freeze mid-stride under the result card. No win/lose/draw body reaction.
5. **Goals all read the same.** No brace / hat-trick / equaliser / winner call-outs, which are free football vocabulary for kids.
6. **Pitch lacks the markings the rules use.** No penalty areas, spots or corner arcs, although fouls in the box give a penalty
   (`STRIKER_BOX_X`) and corners are a set piece. No corner flags or floodlights; the arena is plain stands.
7. **Sound is cue-only.** A crowd bed, and drums only in big attacks. No light music groove, no "Olé" for a long passing move,
   no full-time win/lose sting, no crowd clap after a goal.

Kid friction also seen: keyboard instructions shown on the phone start card; the coach message and meters sat under the thumb buttons.

## Changes

**Gameplay / onboarding**
- Phones play upright. The "Turn sideways" gate is gone (`LiveArcadeMatch.tsx`); the existing portrait camera and stick mapping are used.
  New portrait-phone CSS block (end of `LiveArcadeMatch.module.css`): the canvas runs to the bottom, the coach line is a pill above the
  thumb buttons, the meters are one row under them, idle buttons hide behind the start/result card, the card scrolls inside itself, and
  keyboard instructions plus the long round tip are hidden on phones (the tip stays on the start card blurb). Landscape rules are untouched.
- Portrait follow cam (`strikerScene.ts`): zoom 1.5 on phones, pans slightly past the pitch ends so the attacked goal clears the HUD
  and Gold's goal clears the buttons; the pitch is lifted 5.5% above the buttons.
- Goal call-outs (`strikerMatch.ts`, `strikerGoalHeadline` + `STRIKER_HEADLINES`): brace, hat-trick, equaliser, go-ahead (last 45 s),
  golden goal replace "GOAL!" in the banner with a one-line meaning. The sim now latches `assister` (last completed pass) and a
  per-player `goalsBy` tally. Score/leaderboard schema and coin payouts unchanged.

**Animation** (`lib/arcade/strikerCelebrate.ts`, pure and allocation-free)
- Assisted goal: the scorer airplanes, then turns and points back with `thankPasser`; the passer high-fives; other outfielders fist-bump,
  staggered. Solo goals keep the knee slide. (Teaches: a goal belongs to the team.)
- Full-time outro (2.6 s, skipped under reduced motion): winners celebrate, their top scorer airplanes then knee-slides, teammates
  high-five, the losing side drops its heads, a draw ends in fist bumps. Bodies stand still (no stride) while it plays. The result
  card and high-score entry wait for it; a tap skips. Loop keeps rendering only for the outro, then sleeps as before.
- Keepers drop into a set position (full anticipation crouch) whenever an opponent is charging a shot.

**Graphics**
- Penalty spots and centre spot, corner arcs, four corner flags that ripple faster as the crowd gets loud, four floodlight towers with
  faint additive beams that flare on a goal. Three staggered firework bursts over the scoring end (shared 80-particle pool).
- Cost: 17 static meshes on shared geometry/materials (+ 4 poles, 4 lamp heads, 4 beams); per frame four flag rotations and one
  opacity write, none under reduced motion.

**Sound** (`strikerAudio.ts`, still no files or timers)
- Island groove under play when music is on: syncopated marimba-style bass (C, Am, F, G) and a pentatonic pluck that joins as attacks
  build, plus hats at higher energy; the old big-attack drums ride the same 0.2 s step sequencer. Voice cap respected (groove skips
  when fewer than 4 voices are free).
- "Olé!" crowd chant on every second pass from four in a row, three crowd claps after each goal, a fanfare for call-out goals, and
  full-time win / lose / draw stings after the whistles (the lose sting is soft, not mocking).

## Tests
- New `tests/striker-celebrate.cjs` (chained at the end of `npm test`): celebration roles, outro poses, star choice, call-outs, a sim
  run that scores twice with one player (assist latched, brace), and wiring checks (no landscape gate, portrait CSS, outro gating).
- `tests/striker-feedback.cjs` updated: the follow cam no longer excludes portrait.
- `scripts/check-island-strikers-browser.cjs` and `scripts/play-island-strikers-browser.cjs` no longer rotate the phone. Note: the check
  script times out at "elapsed > .2" after Kick off on desktop and mobile alike against a fresh dev server (coin-entry fixture), before
  and after this change; its portrait-only part was not re-verified end to end.

## Risks / to try on a phone
- Portrait is new for this game: try a whole Round 1 upright, both thumbs; check the coach pill never hides the ball near Gold's goal.
- Groove loudness against the crowd on a real speaker; it is off with the island music toggle.
- Outro plus card delay is 2.75 s; if it feels slow, `STRIKER_OUTRO` is one constant.
