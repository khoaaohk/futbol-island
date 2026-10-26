# Breakaway Run upgrade — October 25 2026

Cabinet: Breakaway Run (`runner`). Live path: `lib/arcade/arcadeGames.ts` (runner branch) + `lib/arcade/runner*.ts` +
`components/games/runnerAudio.ts` (soundtrack). `components/games/BreakawayRun.tsx` / `runnerRig.ts` are the older
Babylon build and are not mounted by `ArcadeRoom` (left untouched).

## Audit (before changes)

The cabinet is already deep (seven defender roles, skill moves, keeper goals, one-two, back-line boss, missions, first-run
coach, winding route, crowd stands, pop words, frame-scheduled music). What still felt flat or unfair, read from code:

Gameplay / kid friction
- One saved shot wiped the whole clean-play combo (`s.combo=0` on every save and on running past a goal). A kid on a
  ×3 multiplier lost everything for one wrong lane, which is the same penalty as nothing at all at ×1. Tackles already
  reset it; a save is a smaller mistake and should cost less.
- The multiplier (×2 at 6 clean plays, ×3 at 12) was invisible in the 3D view: only a short arpeggio said it went up.
  Kids could not see the reward they were building, or learn what builds it.

Animation
- The keeper only swayed and dived. No set position as the runner closes in, no reaction after conceding, no reaction
  after a save, so the keeper had no personality and gave no "read the keeper" cue.
- One-two teammates stood still until the pass. A real teammate calls for the ball ("to me!").
- Runner: lane cuts did not plant the outside foot, jump landings / strikes / tackles had no body squash-and-stretch,
  although the island rig supports both (`plant`, `squash`) — the arcade adapter never passed them.

Graphics
- Goals had confetti and net burst, but the stands did not react visually beyond a bob.
- Nothing under the runner showed a hot streak.

Sound
- No footsteps or dribble taps: the run had music but no body rhythm.
- Goal had a crowd roar only (no musical stinger, no net swish); saves had a crowd "ooh" but no glove; full time had the
  whistle but no closing jingle; a lost multiplier tier was silent.
- Music had no harmony layer: the goal approach built crowd noise but the music stayed the same.

Bugs found: none blocking. (Old Babylon files are dead code for this cabinet; noted, not removed.)

## What changed

Gameplay (`lib/arcade/runnerGame.ts`)
- `dropTier(s)`: a save, a smothered shot or running past a goal now costs ONE multiplier tier (×3 → ×2, ×2 → ×1)
  instead of the whole combo. Tackles still reset it (`loseChance`). `s.comboDrops` counts tier drops for the
  cues below. Coins are unchanged (`arcadeWalletCore` pays from goals and balls collected, not score); the leaderboard
  schema is unchanged. Scores can run a little higher for players who miss shots.
- The SAVED! word now says the multiplier that is left ("Combo now ×2. Shoot where the keeper is not").

Graphics (`lib/arcade/runnerFx.ts`, all pooled, built once, hidden when idle)
- Combo aura: one additive disc under the runner, cyan at ×2 and gold at ×3, pulsing (static under reduced motion),
  flaring when a tier is reached. Tier-up word `COMBO ×2!` / `COMBO ×3!` with a teaching line ("Clean touches build
  your multiplier"), queued behind a bigger word such as GOAL! so neither is lost.
- Crowd camera flashes: one 24-quad instanced draw in the visible stand on a goal (14 on phone) or a new best,
  staggered over ~1.1 s, then hidden. Skipped under reduced motion (no flashing lights). Counts in `active()` so
  frames run only while flashes live.

Animation
- Keeper (`runnerFx.depth`): set position deepens as the runner closes in (anticipate .45 → 1 from 40 m to 10 m),
  a late beaten dive toward the ball's side when you score, and an arm-raised fist pump after a save.
- One-two teammates raise an arm and call for the ball ("to me!") until the pass is played.
- Runner body impulses: lane cuts send a `plant` impulse (outside-boot plant on the island rig); landings (−2.4),
  tackles (−3.4) and shield rides squash the body; shots (+2.2, blasts +3.6), skill moves and goals stretch it. Wired
  through two new optional `ArcadePoseOptions` fields (`plant`, `squash`/`squashSerial`) and three passthrough
  assignments in `islandArcadePlayer.ts`; other cabinets never set them, so their poses are unchanged.

Sound (`components/games/runnerAudio.ts`, same bus, voice cap 28 kept)
- Footsteps from the stride phase (soft panned thud + grass crunch, about 3 a second, louder on a power run) and a
  ball tap every other step while dribbling; silent in the air, sliding or after full time.
- Goal: net swish plus a four-note fanfare on the music bus (silent if music is off). Save: glove thump before the
  crowd "ooh". Full time: a warm rising four-note close and a short applause after the whistle. Tier drop: a soft
  two-note "aw".
- Music: a held harmony pad each bar through a goal approach or power run (3 voices), and a bright off-beat
  counter-melody at ×3.

Runtime cost: +2 meshes (aura, flashes), each one draw call only while visible; no per-frame allocation (colours are
preallocated, flashes rewrite a fixed Float32Array). Audio adds about 3 short voices per footstep, inside the cap.
No iPhone thermal claim: verified in desktop Chrome phone emulation only.

## Verification

- `npx tsc --noEmit` passes. `node tests/runner-feel.cjs` (all eight runner suites) and
  `node tests/runner-track-dispose.cjs` pass. New `tests/runner-upgrade-oct25.cjs` (chained at the end of
  `npm test`): tier-drop maths and a real wrong-lane save, stride footsteps (silent in the air / sliding), new cues
  inside the voice cap, pooled aura/flash source contract, plant/squash wiring.
- 390×844 emulated phone (dev server on its own port and dist dir): gold aura visible under the runner at ×3, no
  page errors; a staged goal with stands visible turned the flash pool on for ~1.1 s, then it slept.

## Not done / follow-ups
- A running "airplane" celebration would need an arms-only trick pose; the island `trick` pose also overrides the
  pelvis, which would freeze the gait, so it was not used.
- `components/games/BreakawayRun.tsx` and its Babylon helpers are dead code for this cabinet (candidate for removal).
