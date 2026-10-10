# Pass Puzzle + readable-intent upgrade: contract (Sep 25 2026)

This work draws on the mechanics research into flicco.io. We build our OWN version: no Flicco code, art, names, level names or level text is copied. Mechanics and ideas only, in the Futbol Island art style, and every piece teaches football (AGENTS.md). Phone heat is a primary requirement (docs/performance-guide.md). Nothing is committed or deployed without the user.

## Scope (recommendations 1–6 and 8; #7 faces and #9 celebrations are OUT)

1. Draw-the-pass aiming with a live predicted path and a threat preview (defenders who could intercept), in lessons and in the new arcade game.
2. The receiver calls for the ball (arm wave), and the marker shows a ready stance.
3. Event → action layer, so touch types look different: chest, thigh, header, heavy touch → stumble, deflect, slide, dejected.
4. A volume-preserving squash spring on contact (receive, strike, header).
5. The wind-up scales with how far the kicker must turn.
6. A slow-motion replay (0.38×) of a lesson or puzzle attempt.
8. Scenario format: brief + hint + 3 attempts + minimum passes + bonus, with wording scaled 7v7 → 9v9 → 11v11.

## File ownership (one owner per file; ask the lead before touching another lane's file)

| Lane | Owns |
|---|---|
| **A rig** | `lib/graphics/player.ts`, new `tests/player-reactions.cjs` |
| **B live glue** | `lib/town/match/matchSim.ts`, new `lib/town/match/choreo.ts`, `lib/town/fieldRuntime.ts`, new `tests/choreo.cjs` |
| **C engine** | new `lib/passPuzzle/` (everything except `scenarios.ts`), new `tests/pass-puzzle-engine.cjs` |
| **D scenarios** | new `lib/passPuzzle/scenarios.ts`, new `tests/pass-puzzle-scenarios.cjs` |
| **E arcade game** | new `components/games/PassPuzzleGame.tsx` + `.module.css`, new `lib/arcade/passPuzzleScene.ts`, `components/Arcade.tsx` (menu card + route only), `components/Arcade.module.css` if needed, new `tests/pass-puzzle-arcade.cjs` |
| **F lessons** | lesson files: `lib/town/learning*.ts`, `components/CoachLesson.tsx`, `components/FieldLearning.tsx`, and the lesson wiring in `components/Town.tsx` (only the lesson code paths) |

Everyone else reads these files and never edits them.

## Interfaces

### A ← B, E, F: new optional `PlayerMotion` fields (lib/graphics/player.ts)

```ts
/** 0..1: an arm-raised "to me!" call for the ball; the rig eases in and out. */
called?: number;
/** 0..1: a marker's ready stance (knees bent, on the toes, arms out for balance). */
ready?: number;
/** One-shot reaction pose. Progress runs 0→1 over the action; undefined = none. */
reaction?: 'chest'|'thigh'|'header'|'stumble'|'deflect'|'slide'|'dejected';
reactionProgress?: number;
/** Squash-spring impulse. The rig applies `squash` once each time `squashSerial` changes.
 *  Negative = squash (receive), positive = stretch (strike/header). Typical range −3.5 … +4. */
squash?: number;
squashSerial?: number;
```

All fields are optional. When they're absent, the output must be identical to today's (the existing tests prove this). The spring is torso-group scale only `(1/√s, s, 1/√s)`, with no geometry change, so instancing and `playerBatch` keep working. There are no new per-frame loops, and offscreen posing is still skipped.

### C → D, E, F: `lib/passPuzzle/types.ts` (the engine lane writes it first, within its first steps)

```ts
export type Vec2={x:number;z:number};
export type Format='7v7'|'9v9'|'11v11';
export type KickKind='pass-feet'|'pass-space'|'header'|'shot';
export type Scenario={
  id:string; pack:string; title:string;
  concept:string;                      // e.g. 'third-man', 'overlap', 'switch', 'cutback'
  brief:Record<Format,string>;         // kid wording scaled by format
  hint:Record<Format,string>;
  pitch:{halfWidth:number;length:number;goalWidth:number};  // metres; the attacking goal is at +z
  carrier:number;                      // index into attackers
  attackers:{x:number;z:number;run?:{delay:number;path:Vec2[];speed?:number}}[];
  defenders:{x:number;z:number;mark?:number;press?:boolean}[]; // mark = attacker index
  keeper?:{x:number;z:number};
  attempts:number;                     // usually 3
  require:{minPasses:number;finish:'goal'|'reach-zone';zone?:{x:number;z:number;r:number}};
  bonus?:{kind:'curl'|'chip'|'header'|'first-time'|'scorer';scorer?:number;label:string};
  lesson:string;                       // what the child learned, shown after success
};
```

Engine API (C), pure TS, no DOM and no three.js, fixed step 1/120:
- `createPuzzle(s:Scenario)` → a world with `snapshot()`, `restore(snap)` and `step(dt)`. It emits events `kick|receive|intercept|save|heavy_touch|deflect|parry|goal|out`.
- `readStroke(points:{x,z,t}[], world)` → `{kind:KickKind, target:Vec2, receiver?:number, curl:number /* −1..1 */, loft:number /* 0..1, from holding still at the end ≥0.25 s */, power:number}`.
- `predict(world, kick)` → `{path:Vec2&{y:number}[], end:'goal'|'out'|'rest'|'intercept', threats:number[] /* defender indices who can reach the path first */}`. It is bounded to a single pass of at most 4 s of sim.
- `windupSeconds(turnRadians)` = `0.26 + |turn|/π × 0.3`. Lane B uses the same formula in live play.
- `replay(snapshot, inputs, speed=0.38)` is a deterministic re-run.
- The ball has gravity, drag, spin curl (a Magnus-style term), bounce restitution ~0.45, and post cylinders.

## Gates

- `npm run -s typecheck`, `npm test`, each lane's new test file, and the existing player, live and play-film tests stay green.
- Lane B also runs `scripts/sim-balance.mjs` and stays within the balance tolerances in docs/body-mechanics/BODY_MECHANICS.md.
- E and F take screenshots at 390×844 and 1280×800 and look at them.
- Use the existing design system (IslandBrush, cream cards, gold pills, dark see-through dialogs). No one-off styles.
- The dev server is already on :8092. Don't restart it.
- When your lane is done, append a short "Lane X — status" section at the end of this file.

## Lane C — status (engine, Sep 25 2026)

Done and not committed. Files: `lib/passPuzzle/{types,physics,sim,world,stroke,index}.ts` and `tests/pass-puzzle-engine.cjs` (`node tests/pass-puzzle-engine.cjs` prints `PASS_PUZZLE_ENGINE_PASS`). The engine is pure TS with no DOM or three.js. It is deterministic (no random, no clock), runs a fixed 1/120 s tick, and moves the players at 60 Hz (every other tick) to save CPU. Typecheck is clean for `lib/passPuzzle`. When I last ran it, `tsc` errors came only from lane F's in-progress `components/Town.tsx`.

**Frame.** The play area is x ∈ ±halfWidth and z ∈ ±length/2. The attacking goal line is at z = +length/2, centred on x = 0. The crossbar height comes from the goal width: ≥7 m → 2.44 m, ≥6 m → 2.13 m, otherwise 1.98 m. **The world is frozen while aiming.** The action clock `state.t` runs only during windup and flight, so `run.delay` counts action time from the first kick and pauses at each new aim.

**API** (import from `@/lib/passPuzzle`):
- `createPuzzle(s)` → `PuzzleWorld`. Its fields:
  - `state` is plain data. Treat it as read-only.
  - `step(dt)` clamps dt to 0.25 s.
  - `kick(k)` returns false unless the phase is aiming.
  - `snapshot()`, `restore(snap)` (exact continuation), `drain()`, `on(fn)` → unsubscribe.
  - `retry()` starts the next attempt from the scenario start. It returns false after a success or when no attempts are left.
  - `attemptStart()` + `inputs()` are exactly what `replay()` needs.
  - `turnFor(k)` → `{turn, windup}`, for showing the turn cost.
- `state.phase`: `'aiming'|'windup'|'flight'|'success'|'fail'`. A receive goes back to `aiming` with a new `state.carrier`. Other state: `attempt` (1-based), `attemptsLeft`, `passes` (clean receives by a different attacker; a ball a defender or the keeper touched doesn't count), `result {outcome, reason?, passes, bonus}` with `reason ∈ intercept|save|out|rest|too-few-passes|timeout`, `ball.atHead` (a header is the next touch), and `pending` (windup progress: `left/total`).
- Success rules:
  - `finish:'goal'`: a goal with passes ≥ minPasses. A goal with fewer passes fails with `too-few-passes`.
  - `'reach-zone'`: a receive inside `zone` with passes ≥ minPasses.
- Bonus rules:
  - curl: any kick with |curl| ≥ 0.35.
  - chip: any lofted kick that isn't a header or a cross to the head.
  - header: goal finish = the scoring kick was a header; zone finish = any header in the move.
  - first-time: the final kick was taken ≤1.5 s of aiming after the receive (headers always count).
  - scorer: the goal scorer, or the final receiver for a zone finish, is `bonus.scorer`.
- Events (`PuzzleEvent`): `{type, tick, t, at:{x,y,z}, speed, attacker?, defender?, keeper?, kind?, touch?, turn?, windup?}`.
  - `touch` ∈ feet|thigh|chest|header, set from the ball height (≤0.55 / ≤0.95 / ≤1.35 / above).
  - `kick` carries the turn and the windup it cost.
  - `deflect` comes from a slide or an unready body block. The ball stays live.
  - `parry` happens when the ball is ≥22 m/s, or ≥16 m/s on a dive. The ball stays live.
  - `heavy_touch` happens when the ball arrives faster than 18 m/s at the feet, 13 m/s on the chest/thigh or 24 m/s on the head. The ball pops away and the same player chases it.
- `readStroke(points, world)` → `Kick`:
  - The end point decides the kind:
    - Within 1.4 m of a teammate: `header` if loft ≥ 0.5, otherwise `pass-feet`. The target snaps to the teammate.
    - Otherwise, within 1 m of the goal line and inside the posts ±0.6 m: `shot`, with the target on the line.
    - Otherwise: `pass-space`, with `receiver` = the teammate who can get there first.
  - Loft: 0 if held still for less than 0.25 s. From 0.25 s it starts at 0.15 and ramps to 1 over 0.45 s ("still" = within 0.4 m).
  - Power = the length of the moving part of the stroke / 30 m.
  - Curl = the largest perpendicular bow from the chord (a 0.35 m dead zone), divided by 0.22 × chord length, then clamped. **Sign: curl > 0 bows toward (d.z, −d.x), which is the +x side for a kick up the pitch.** The ball swings out to that side and bends back onto the target (the aim solver makes sure it passes over the target).
- `predict(world, kick)` → `{path, end, threats, keeperThreat, receiver?, receiveAt?, hitsPost?}`.
  - It clones the frozen state and runs the real rules through the windup plus ≤4 s of one flight. It stops at the first touch, goal or out, so `end` agrees with what the world will do.
  - `threats` = defenders who could reach any path point before the ball (reaction 0.28 s, 6.3 m/s, 0.75 m reach up to 2.05 m high, or a 1.35 m slide reach for a ball below 0.35 m).
  - `path` is sampled every 1/30 s and truncated at the touch.
  - The last answer is memoised while the world is frozen. Don't mutate it.
- `windupSeconds(turn)` = `0.26 + |turn|/π × 0.3` (the contract formula).
- `replay(snapshot, inputs, speed=0.38)` → `{world, speed, done, advance(realDt) → events, run() → events}`. It is a deterministic re-run: its events are identical to the original's (tested, even when the original used jittery dts). Frozen aiming time is skipped instantly.

**Physics:**
- Gravity; drag k = 0.0133 (a = −k|v|v).
- Magnus-style lateral term: 0.08 × spin × |v| ⟂ v, where spin = curl × 10. It is 0.4× on the ground and decays with τ = 2.5 s.
- Bounce restitution 0.45; rolling friction 1.1 m/s².
- Post and crossbar cylinders (r = 0.06, restitution 0.6).
- A goal needs the whole ball over the line, inside the posts and under the bar. Out is the side lines, the back line or over the goal line wide of the goal. A net box catches the ball after a goal.

**Deviations and additions:**
1. `predict().path` is typed `Vec3[]` (= `(Vec2&{y})[]`). The contract's `Vec2&{y:number}[]` parses as an intersection with an array.
2. Headers wind up at 0.4× the formula, because the ball is held at head height.
3. `Kick.receiver` is optional and can be set for `pass-space` too.
4. Additional types in `types.ts`: `Vec3, StrokePoint, Kick, PuzzleEvent(Type), Touch, Phase, FailReason, Attacker/Defender/KeeperState, BallState, PuzzleState, PuzzleSnapshot, PuzzleInput, PuzzleWorld, Prediction, Replay, PuzzleResult`.
5. Rig hints for lanes A/E:
   - defender `mode:'intercept'` + `slide` → the slide reaction; `mode:'press'`/`'mark'` → ready stance.
   - keeper `mode:'dive'`, `dive` 0..1, `diveDir`.
   - attacker `mode:'meet'` → called/arm wave.
6. Receivers run onto `pass-space` balls, attack the aimed spot for a header, meet a chip once it drops to chest height (within 2.5 m of the target), and come to meet ground passes.
7. The keeper claims only inside a 5.5 m-deep area.

**Tuning notes for lane D:**
- A marker 1.3 m goal-side reads a pass to their man's feet or near space well.
- Passes that work: into space away from the marker's goal-side line, chips over a *close* defender (a chip over a defender halfway down a 16 m lane gets run down), curls around a lane, or early runs (`delay` ≈ 0).
- A soft shot (power ≲ 0.3) at the keeper is caught. A 30 m/s shot is parried.

**Measured cost** (node 20, 10-core Mac under heavy shared load: load average 22–47):
- `predict`: ≈0.6–1.0 ms CPU for 5v4 + keeper, ≈0.9–1.5 ms CPU for 11v10 + keeper. That breaks down as clone 0.03 + aim solve 0.05 + path 0.1–0.15 ms, with the rest in the flight sim.
- `readStroke`: ≈0.03 ms.
- An idle machine should be about half of that. On a phone, budget roughly 3–5× desktop: about 2–4 ms per call.
- The test asserts a noise-tolerant bound (<3 ms / <4 ms).
- Callers (E, F) should call `predict` at most once per animation frame, and only while the pointer is down and the stroke end has moved ≥0.2 m (or loft/curl changed). There is no idle cost: the world only does work when `step()` is called. While aiming, `step()` is nearly free (it only advances `tick` and `aimTime`), so keep calling it. The first-time bonus depends on `aimTime`.

## Lane A — status (Sep 25 2026, done; nothing committed)

The contract's `PlayerMotion` fields are in `lib/graphics/player.ts` exactly as specified. When the fields are absent, output is **bit-identical** to the pre-change rig. I checked every joint's world matrix over 11 scripted scenarios (sprint, brake, cut, kick, receive, jockey, ready, reduced, juggle, bike, plant).

- **`called`**: the rig eases it in and out (damp 6.5/s). At onset it picks the ball-side arm from `lookX/Z` (default +x/"right"). The arm rises through the side to above the head, in the frontal plane so it still reads from the elevated match camera, and waves side to side (static in reduced motion). The other arm opens a little.
- **`ready`**: a graded version of the existing `stance:'ready'` (knees bent, heels up, arms out). `ready:1` gives exactly the same pose as `stance:'ready'`. Like the stance, it fades out above ~1–2.5 m/s.
- **`reaction` + `reactionProgress`**: the poses are the exported `reactionPose()` / `REACT` channel table.
  - Pelvis pitch/roll/yaw/drop go in before the leg IK, so planted boots stay put. Torso, spine, head and arm targets go in after it.
  - **thigh**: the other boot becomes a world-planted support (the kick-support mechanism). The lifted boot returns horizontally first and sets down last, then the gait takes it back.
  - **slide**: releases both locks, since the boots slide by design.
  - If the host clears a reaction, it fades out over 0.15 s. A new reaction cross-fades over the old one. Progress dropping by more than 0.3 counts as a restart. Rides, parachute, rooftop, stun, wall splat, shotStep and juggle ignore reactions. Reduced motion plays them at 60 %.
  - Suggested durations: chest .8 s, thigh .85, header .7 (contact at p≈.45), stumble .8, deflect .6, slide 1.0 (the host decelerates the root), dejected 1.6.
- **`squash` + `squashSerial`**: a velocity impulse into a spring (ω 14, ζ .6) with ≤1/60 s substeps, capped at 6 per frame. It scales the torso group `(1/√s, s, 1/√s)` on top of the profile/appearance shape scale, so there is no geometry change and instancing is unaffected. −3.5 gives ~9 % squash and +4 gives ~10 % stretch. It settles in ~0.72 s, snaps exactly to the shape scale, then sleeps. It freezes when dt is 0 and resets on a seek.
- There are no new loops, allocations per frame or meshes. The extra state is a 34-double `Float64Array` plus a few scalars per rig.
- Tests: new `tests/player-reactions.cjs` passes (distinct poses, gait settle, zero foot slide in chest/thigh standing and at 1 m/s, spring volume/settle/serial-once/coarse-dt, absent-vs-neutral identity, blends, rides ignore). Typecheck, `npm test`, all other `player-*` tests, field-contact, live-ball/field-frame/effects, travel-modes, teaching-contact, quiz-outcomes and all 353 play-film tests pass.
- Four tests fail **identically with the untouched baseline rig**, so they are not caused by the rig: `player-body-review` (support-height 1.7 cm on lateral walks), `live-match-patterns` ("short pass opens a purposeful run"), `live-knockout-work` and `movement-work`. These most likely come from in-progress sim/runtime edits.

### Lane C — update: fixes for lane D's engine notes (Sep 25 2026)

The API is unchanged. Additions are optional, and nothing is committed.

1. **No more moonballs.**
   - A lofted ball keeps its natural pace-driven arc unless that arc would peak above a cap. Then it is re-solved by `solveLob` (physics.ts), which sets the vertical speed from the apex and solves the horizontal speed so the ball comes down through the target height over the target.
   - Foot lofts are capped at `apexFor(loft,d)` = min(1.2 + 6.8·loft, 0.9 + 0.3·d) m. Crosses to the head are capped at `crossApex` = min(3 + 5·loft, 8, 1.5 + 0.3·d). Chip shots are capped at min(2.5 + 4·loft, 0.9 + 0.3·d).
   - Measured peaks: 30 m at loft 0.5 → 4.0 m; 40 m at loft 0.5 → 3.9 m; 40 m at loft 1 → 6.7 m; a 40 m cross → 6.2 m. Short lofts that were already realistic keep their old arc, so the air scenarios are unchanged.
2. **Pass and move.** New optional `run.afterPass:true` on a `Scenario` attacker.
   - The run starts `delay` s after that player's own pass (`AttackerState.passedAt`). It survives him receiving and passing, which makes a one-two authorable.
   - Runs without the flag behave exactly as before.
3. **Weighted passes into space.**
   - A ground `pass-space` is struck so it is still rolling at `spaceArrive(power)` = 3 + 8·power m/s when it reaches the target: 8 m → launch 7.2 / arrive 5.2; 15 m → 10.6 / 7.0; 25 m → 16 / 9.7.
   - A meeting receiver now plans with `travelFrom()`, which starts from his current speed toward the point. A runner in stride, 14 m short of the spot, collects the ball (tested).
4. **Chips to feet.**
   - `readStroke` gives `header` only when loft ≥ 0.5 **and** the stroke ends within `HEAD_R` = 0.8 m of the teammate (the head zone). A held chip that ends 0.8–1.4 m from him is `pass-feet`, and the target still snaps to him.
   - In the world, the intended receiver of a lofted `pass-feet` lets it drop, so the `receive` event's `touch` is `chest`, `thigh` or `feet`, never `header`. Header crosses still arrive at 1.75 m.
5. **Keeper start honoured.**
   - He holds his authored spot, set and watching, until the first ball of the attempt is struck.
   - After each kick he re-positions only once he has reacted (0.2 s), at a 3 m/s shuffle. Saves and dives are unchanged.

**Scenario solutions this breaks.** 4 of 20; lane D needs to retune these. All other scenarios pass fully: stored, drawn, naive stopped and flagged, sloppy ≥ n−1. Until they're retuned, `tests/pass-puzzle-scenarios.cjs` stops at the first one, `fp-find-a-friend`.

| Scenario | Cause | What happens now |
|---|---|---|
| `fp-find-a-friend` | fix 5 (keeper start) | The keeper is now where D put him when a1 strikes the far-post shot (−2.6, 25, power 0.55), so it's parried and a0 picks up the rebound. It used to score because he had drifted during the windup. Sloppy 1/4. |
| `fp-run-onto-it` | fix 3 (weighted space pass) | The power-0.32 through ball now arrives at about 5.6 m/s instead of about 11, and marker d0 intercepts. Sloppy 0/4. |
| `tm-pull-it-back` | fix 3 | The slower power-0.34 pass reaches a2 later, the defence has recovered, and the cutback shot is deflected by d1. Sloppy 1/4. |
| `bp-in-behind` | fix 3 | The power-0.58 ball behind the line is slower, and d1/d2 get back to it. Sloppy 0/4. |

A likely retune for the three space-pass puzzles: start the runner earlier (`delay` ≈ 0), aim the space further from the marker's goal-side line, or use a slightly longer stroke. A longer stroke gives more power, and so more pace.

## Lane D — status (scenarios, Sep 25 2026)

Done and not committed. Files: `lib/passPuzzle/scenarios.ts` and `tests/pass-puzzle-scenarios.cjs` (`node tests/pass-puzzle-scenarios.cjs` prints `PASS_PUZZLE_SCENARIOS_PASS`). Typecheck is clean.

**Exports.** `SCENARIOS` (20, in pack order), `PACKS` (4, `{id, order, title, blurb}`), `scenarioById(id)`, `scenariosInPack(pack)`. `SCENARIO_SOLUTIONS[id] = {solution: Kick[], naive: Kick}` sits outside the `Scenario` type, so the game never shows it.

**Packs.**
1. First Passes: `fp-find-a-friend` (pass into feet), `fp-run-onto-it` (pass into space), `fp-bend-it-round` (curl), `fp-up-and-over` (chip, reach-zone), `fp-far-corner` (shot placement).
2. Team Moves: `tm-give-and-go` (one-two), `tm-third-friend` (third-man run), `tm-round-the-outside` (overlap), `tm-switch-it` (switch, reach-zone), `tm-pull-it-back` (cutback).
3. Beat the Press: `bp-bounce-pass` (bounce pass / lay-off), `bp-keeper-starts-it` (build from the back, reach-zone), `bp-through-the-gap` (line-breaking pass), `bp-back-to-go-forward` (recycle then switch, reach-zone), `bp-in-behind` (through ball behind a high line).
4. In the Air: `air-near-post`, `air-far-post`, `air-flick-on`, `air-knock-down`, `air-corner-flick` (near-post flick to a far-post header).

Every scenario has three brief and hint wordings (7v7 short everyday words → 9v9 names the idea → 11v11 tactical vocabulary), attempts 3, minPasses, a finish, a `lesson`, and a bonus on 14 of them.

**What the test proves.** It checks the schema (unique ids and titles, one concept each, all three wordings present and different) and the reading level (7v7 sentences ≤12 words and no jargon; 9v9 ≤18; 11v11 ≤22). Then, for every scenario:
- The solution succeeds twice: once as stored kicks (what lane E's dev hook `__passPuzzle.solution(id)` uses), and once redrawn as a real finger stroke through `readStroke`. The stroke starts at the ball, power is stroke length / 30, loft comes from the hold and curl from the bow, and shots drag 2 m past the line. Kinds, receivers, power, loft and curl must all match the stored values.
- The bonus is earned.
- Replay gives the same events on the same ticks.
- The naive direct option is intercepted, blocked or saved, both stored and drawn. It is never a goal or a counted pass, and `predict()` flags it.
- The solution survives a sloppy finger: the stroke end moved 0.4 m in each direction, and the hold ±0.08 loft. At most one variant may fail; 94/96 pass now.

**Retune after lane C's engine fixes (Sep 25 2026).** All 20 pass again: stored, drawn, naive stopped and flagged, and sloppy 94/96.
- Fixed the four broken scenarios.
  - `fp-find-a-friend`: the receiver moves to (8.5, 16) for a better far-post angle against the keeper, who now holds his spot.
  - `fp-run-onto-it`: now a real through ball. The runner starts at (4, 12) and runs to (0, 16), the screening marker is at (3, 9.5), and the weighted pass goes to (0, 15). The brief now says "the space ahead of them" in 7v7 and "the space ahead of their run" in 9v9.
  - `tm-pull-it-back`: the cutback spot is (5, 15.5), and the runner arrives there.
  - `bp-in-behind`: the passer moves up to z 6 and the back line opens a wider channel (−9 / −2 / 8 at z 14). The slower weighted ball goes through it to (3, 20.5).
- Used the new fixes.
  - `tm-give-and-go` is a true pass-and-move one-two. a0 has a `run.afterPass` run, so he passes to the wall, sprints past the presser and takes the return pass into space at about (1.5, 17), then scores. The original pass-and-run brief, hint and lesson are back.
  - `tm-switch-it` uses loft 0.7 and `bp-back-to-go-forward` uses a loft 0.6 pass into space. Both are realistic switches that peak at about 5 m.
  - `fp-far-corner` has no blocker now. The keeper's authored start at (2, 23.8), shading the near post, does the job: the near-post shot is parried and the far corner scores. The original keeper wording is back.
- No open engine issues from lane D. Two things to keep in mind, both by design:
  - A `press` defender still deflects forward passes made by the player he presses.
  - Headed shots from 6–10 m nearly always score.

## Lane F — status (lessons, Sep 25 2026)

Done and not committed. Recommendations 1, 6 and 8 are in the island's existing "Make yourself an option" coach lesson (`?lesson=space`, `components/CoachLesson.tsx` driven by `components/Town.tsx`).

**Files.** New: `lib/town/learningPass.ts` and `tests/lesson-draw-pass.cjs` (`node tests/lesson-draw-pass.cjs`). Edited: `lib/town/learning.ts` (`LessonPhase` adds `'aim' | 'replay'`), `components/CoachLesson.tsx`, the lesson code paths in `components/Town.tsx`, and a few `.phase-aim` / `.lesson-formats` / `.lesson-hint` rules next to the existing coach-lesson rules in `app/globals.css`. These reuse the existing card, pixel-button, lesson-secondary, lane-status and lesson-steps styles. Also in Town.tsx, at the coordinator's request: `player.setShirtNumber(DEFAULT_PLAYER_NUMBER)`, and the two lesson rigs wear 8 (passer) and 4 (marker).

**Flow.** Practice → "Call for the pass" freezes play, and the child's avatar gets `PlayerMotion.called = 1`. The child then strokes from the ball on the canvas. As they draw, a predicted path shows as a flat ground ribbon: green when clear, orange when threatened. A red ring appears on any defender who can intercept, and a gold ring marks where the ball ends. Releasing the stroke plays the pass. The passer's `kick` progress follows the engine's windup, and the marker gets `ready: 1`.

A miss sends the child back to practice at the same spot, so they can move and try again. After 3 misses the card offers the demo. A success goes to "complete". After a miss or a success, **"Watch again in slow motion"** re-runs the attempt through `replay(start, inputs, 0.38)`.

The brief, hint, threat, clear, miss and success text is worded per format (7v7 → 9v9 → 11v11). The format defaults to the child's `fi2-path-format-v1` and can be changed with the in-card "Explain it for" choice (`fi2-lesson-format-v1`). The hint unlocks after the first miss or on request. For keyboard and switch users, "Aim straight at me" previews a pass and "Play this pass" / Space plays it.

**Engine use.** Lane C does all the football. The lesson builds a 1-attacker-pair + 1-marker `Scenario` (`lessonScenario`) and adapts coordinates at one boundary: `toPitch`/`fromPitch` is a half-turn about world (11, 13.5), so the goal is at +z and curl keeps its sign. From there:
- `readStroke` reads the stroke. Loft is forced to 0, because this lesson teaches ground passing lanes.
- `predict` gives the path and threats.
- `world.kick` / `step` play the live pass.
- `replay` plays "Watch again".

The engine's threats agree with the lesson's existing `passingLane` rule. The lane opens at about 1.5 m clearance from the marker, on both sides.

**Heat.** Stroke reading and prediction run only in the pointer-move handler (and the keyboard preview). The test proves they never run in the frame loop. The frozen aim state makes the Town loop sleep like a waiting quiz: `aimWaiting` gives a 1.2 s grace, then it sleeps, and each stroke change (`aimRevision`) wakes it for one short burst. The ribbon is one fixed 74-vertex buffer, rewritten only when the stroke changes. During the ~1–2 s pass or the replay, the engine steps three players at 1/120. There are no new loops or timers.

**Gates.** `npm run -s typecheck` is clean. `npm test` passes. These pass too: `tests/lesson-draw-pass.cjs`, `tests/shirt-numbers.cjs`, `learning-journeys`, `lesson-beats`, `lesson-catalog`, `lesson-cues`, `lesson-gestures`, `lesson-presentation` and `ball-hunt-lessons`. `tests/card-rewards.cjs` fails on "cards are shown face-up". That test covers card files, not lesson files.

Browser screenshots at 390×844 and 1280×800 cover these states: intro, aim with threat, missed with hint, aim clear, passing, complete, and the 0.38× replay. The full flow ran in headless Chrome with no page errors.

**Phone framing.** On a portrait phone, the coach card covered the passer and marker. So while a coach lesson is active (and only when `camera.aspect < .85`), the follow camera centres on the passer / marker / receiver triangle, at the same view angle, and places it above the card. The aim card on phones also hides the heading, the coach row and the format choice to stay compact. Desktop framing is unchanged.

**Not done / notes.** `tests/lesson-draw-pass.cjs` runs against lane C's live engine, so engine tuning can move its numbers. The test already allows for receivers stepping forward to meet the pass. The FieldLearning journey lessons are tap-a-spot quizzes with no pass input, so they are unchanged. Whether the rig visibly shows `called` / `ready` depends on lane A's implementation. This lesson only passes the fields.

## Lane B — status (Sep 25 2026)

Done. Nothing is committed or deployed.

- **`lib/town/match/choreo.ts` (new)** is the event → action layer. `touchActions(event)` is a pure map. A receive picks header ≥1.45 m, chest ≥.85, thigh ≥.4, otherwise a foot touch (keepers just catch). An intercept is a slide when the defender is running, a deflect when the ball is pacey. On a tackle the winner slides and the carrier stumbles. A heavy touch → stumble; a parry → keeper deflect; a goal → everyone on the conceding side is dejected, staggered. A kick → stretch squash. `createChoreo()` does the per-match bookkeeping: progress runs on real match time (it holds while paused), there is one `squashSerial` bump per touch, and it keeps the called receiver and a ready marker (the nearest outfield opponent within 26 u, with 3 u hysteresis; the ready stance fades at a run). It has no loops of its own. `windupSeconds(turn)` is defined here (the same formula as §C); switch the import to lib/passPuzzle once it exports it.
- **`matchSim.ts`** changes are additive:
  - It emits touches through a preallocated 8-slot ring (`touches` / `touchSerial`): receive, intercept, tackle, heavy, parry, goal and kick, each with height/speed/heavy.
  - `callFor` gives the target of the kick being wound up, or of the pass in flight (even one that's being cut out). `kickWindup` is also exposed.
  - Every AI kick chosen inside `ballLogic` winds up for `windupSeconds(turn) × windupScale` sim s (.32; futsal .48, which fieldRuntime sets from `liveGameSpeed`). Direct `doPass` calls (tests) stay immediate, and the human's kicks aren't delayed. A tackle can rob the kicker during the wind-up.
  - To keep the tempo, the composure beat already absorbs a 60° wind-up (`WINDUP_LEAD_TURN`).
  - A dropping cross can be met at head height (≤2.1 m) by its target.
- **Balance compensation:** the wind-up gives keepers and lane defenders a beat to get set, so finishing is eased: `WINDUP_FINISH` futsal 1.75, 7v7 1.3, 9v9 1.45, 11v11 1.15.
- **`fieldRuntime.ts`:**
  - It consumes the choreo each frame (even offscreen) and applies it per posed live player.
  - The wind-up pose turns toward the target first, then swings from phase 0 to `PLAYER_KICK_CONTACT`. The foot and action are committed at the start of the swing and kept through the release.
  - A chest, thigh or head control drops the owned ball from the touch height to the feet over the cushion.
  - A high ball being approached is met in the air rather than pulled down to the boot.
  - It adds shirt numbers (`classicShirtNumber`).
- **Balance** (`sim-balance.mjs`, 96 seeds from #24, compared with the same seeds before Lane B):

  | Format | Goals/game | Switches/min |
  |---|---|---|
  | 11v11 | 3.82 → 3.76 (−1.6 %) | 10.42 → 10.42 (0 %) |
  | 9v9 | 4.07 → 3.94 (−3.3 %) | 8.31 → 8.48 (+2.0 %) |
  | 7v7 | 3.91 → 4.01 (+2.7 %) | 11.96 → 11.82 (−1.2 %) |
  | futsal | 5.43 → 4.94 (−9.0 %) | 14.26 → 14.12 (−1.0 %) |

  Other movement: turnovers +9…+29 % (futsal most), passes −2…−9 %, oneSided counts 16/15/17/22 → 20/18/22/24.

  On the 24 gate seeds, 7v7 goals read +20 % (3.75 → 4.50), but that's seed noise (+2.7 % on 96 seeds, the same effect BODY_MECHANICS.md documents). Note that the committed balance-before.txt is itself out of date: before this lane, futsal was already at 5.7 goals against 3.9 there.
- **Gates:**
  - Passing: `tests/choreo.cjs` (new), typecheck, `npm test`, shirt-numbers, and the live, player and body-mechanics tests.
  - `tests/body-mechanics-glue.cjs`: `freeze()` now also clears the brake sample so each block starts clean. Its first "cruising" sample depended on the sim state after 150 frames.
  - Failing before this lane: `player-body-review`, `live-knockout-work` and `movement-work` fail the same way on a pure `git archive HEAD` tree.
- **Browser** (:8092, headless, 1280×800): burst captures of the live 11v11 show a receiver calling with his arm raised while his marker crouches ready, the wind-up swing, chest control, a defender's slide, a stumble, a keeper's deflect, and the conceding keeper dejected after a goal. No page errors.
- **Runtime cost:** per visible match per frame, one ≤22-player marker scan plus reading the new touches. No new loops, geometry or allocations per touch.

## Lane E — status (arcade game, Sep 25 2026; nothing committed or deployed)

**Pass Puzzles** is the new Arcade card (tag "DRAW THE PASS") at http://localhost:8092 → Arcade → Pass Puzzles.

- Files: `components/games/PassPuzzleGame.tsx` + `.module.css`, `lib/arcade/passPuzzleScene.ts`, `components/Arcade.tsx` (one card + the `puzzle` route), `components/Arcade.module.css` (one `.art[data-game=puzzle]` line), `tests/pass-puzzle-arcade.cjs`.
- Uses lane C's engine (`createPuzzle`, `readStroke`, `predict`, `replay`) and lane D's `SCENARIOS` / `PACKS`. `SCENARIO_SOLUTIONS` is only used by the dev/test hook.
- Flow: a level list grouped by pack, with stars per level. Stars are saved in `fi2-pass-puzzles-v1`, and every access sits in try/catch. Each pack unlocks one level at a time. A format picker defaults to the child's IDP-plan format (`loadIdp`), else 9v9. Then the brief card (format wording, a hint on demand, the bonus), then AIM → WINDUP → FLIGHT → result.
- Stars: ★ for solving, ★ for the bonus, ★ for a first-try solve. The success card lists these three and the `lesson`. The fail card gives the reason, the tries left and the hint, with Try again. **Watch again** replays the attempt through `replay(attemptStart(), inputs(), .38)` at 0.38×, and the camera eases toward the attempt's key event (goal, save or intercept). Skip is available.
- Aim: the stroke always starts at the ball. It shows a dotted, fading path (instanced dots, with ground shadows when the ball is in the air) and the end marker (goal / out / rest). Every predicted threat gets a red ring, and so does the keeper when `keeperThreat` is true. A cream ring marks the receiver, who does the `called` wave. A loft meter follows the finger while the end of the stroke is held.
- Motion: the lane A fields are driven from the event layer. Chest, thigh and header touches → `reaction`, heavy touch → `stumble`, intercept → `slide`/`deflect`, goal → defenders `dejected`. `squash`/`squashSerial` fire on kick, receive and save. The windup plays the kick pose over `pending.total`. The keeper dive is a root roll and lift from `keeper.dive`/`diveDir`. The kick, touch and goal sounds are short, gesture-unlocked blips in the same style as ArcadeGame3D.
- Shirt numbers (coordinator request): `shirtNumbersFor(scenario)` in `lib/arcade/passPuzzleScene.ts` is a pure function. It gives classic position numbers from where each player stands: 1 keeper, 2/3 full-backs, 4/5 centre-backs, 6/8 midfield, 10 playmaker, 7/11 wingers, 9 striker. The attackers' right is −x. The numbers go on `rig.setShirtNumber`, and small number tags show above heads while aiming, because back numbers are too small to read from the match camera. **Lane D:** briefs can say "find your 9" when they use these numbers. Run the function on a scenario to check a number before writing it.
- Camera: a broadcast view from behind the attack, aligned with the play's principal axis. On a portrait screen the play runs up the screen, and a wide cross gets a camera out on the wing. Only the goal mouth and the players are framed; the goal is left out for reach-zone finishes. The fit is solved on load and resize only. There is no pinch/drag.
- Heat: one rAF loop at 30 fps on mobile (`frameCapSlot`) and 60 on desktop. It renders only during windup/flight/replay, while a stroke is being drawn or held (up to about 1.2 s of loft hold), and for short, bounded tails: the called wave (1.4 s) and reactions (≤1.3 s). Aiming idle sleeps with zero frames. The result card stops hard after 1.2 s. The loop also pauses when the page is hidden. Rigs, textures and materials are pooled or cached per level, and everything is disposed on exit. Added runtime cost: up to 12 `createPlayer` rigs per level. No physical-device measurement.
- Gates: `npm run -s typecheck` ✓. `npm test` ✓. `node tests/pass-puzzle-arcade.cjs` ✓ at 390×844 and 1280×800. The test covers the arcade card, level → brief → freeze, idle sleep, a drawn stroke (path + receiver ring + called), the loft meter, a red threat ring, a short stroke that doesn't kick, a cut-out pass → fail card + hint + Try again, the solution solving the level, stars saved, result sleep, the replay at 0.38× with camera push-in and sleep after it, and no console errors. Screenshots were saved to `$PASS_PUZZLE_SHOTS` (default `/tmp`) and reviewed.
- Known: other lanes' edits trigger Fast Refresh in dev, which remounts the game and resets it to the level list. A compile error elsewhere, such as the IslandSettings.module.css "not pure" error seen once, shows up as a 500 in the no-console-errors check. Rerun the test when the dev build is clean.

## G5 — status (Oct 4 2026, arcade loop; nothing committed or deployed)

Additive engine changes. Every field is optional, and the coach lesson (`lib/town/learningPass.ts`) is unaffected because none of these rules are on for it.

**Rules**
- `require.offside`: Law 11, judged when the ball is played (second-last opponent; implied keeper on the goal line; level is onside; own half is never offside), penalised on the offside player's first touch.
  - New event `offside`, fail reason `'offside'`.
  - `predict()` adds `end:'offside'`, `offside[]` and `offsideLine`.
  - Every arcade puzzle sets it, and all 35 routes are onside.
- `require.noHeading`: the youth rule. Attackers never touch the ball above chest height; header kicks become chips to feet; a header bonus becomes first-time. `lib/passPuzzle/youth.ts` holds `youthScenario()` and the youth routes and copy.
- `require.clock`: the counter-attack limit in action seconds (fail reason `timeout`).

**Players and pitch**
- Defenders: `trap` (metres the line steps up as a pass is struck), `hunt` (presses each receiver), `recover` (sprints goal-side once play starts).
- Keeper: `sweeper` (claims up to 16 m out).
- `weather: {wind, wet}`: wind acts on a ball in the air; the wet pitch skids (roll ×0.55, bounce ×0.8).
- Bonus kind `placement`: low into the corner away from where the keeper started.

**World API**
- `world.callRun(i, to|null)`: a called run that starts with the next kick. It is recorded in `PuzzleInput.calls` and replayed.
- `FIRST_TIME` is now 2.5 s. The arcade steps real aiming time into the world at release, which fixes the first-time bonus always being free.

**New modules**
- `packs.ts`: 4 packs, 12 puzzles, step routes with calls.
- `coach.ts`: the coach's route.
- `daily.ts`: the seeded, engine-validated daily remix.
- `catalog.ts`: every pack and puzzle, pack gates, routes, the daily pool, difficulty pips.
- `curve.ts`: generated by `scripts/pass-puzzle-curve.cjs`.

**Tests (all in `npm test`)**
- `pass-puzzle-engine`, `-scenarios`, `-challenges`, `-direct-shots`, `-gesture` (existing);
- `-offside`, `-youth`, `-packs`, `-daily` (new).
- Browser checks: `tests/pass-puzzle-arcade.cjs`, `scripts/check-pass-puzzle-controls.cjs` and `tests/pass-puzzle-challenges-browser.cjs`. The last now seeds 36 stars, because the pack map opens Match Problems at 34.

## Oct 9 2026 — coaching pass (aim read, replay calls, hints, takeaway; nothing committed or deployed)

**Engine (additive, optional fields).** `Prediction.threatAt[]` (parallel to `threats`: where each threat defender reaches the ball), `Prediction.cut` (where the ball is first stopped: intercept, deflection, save, parry) and `Prediction.closest` (`{defender, slack, at}`: the defender who comes nearest, with the spare time in seconds; negative = they get there first). `sim.ts` `defenderSlack()` is one O(path) scan per defender with the same reach rules as `planDefender`. Nothing else in the rules changed.

**`lib/passPuzzle/explain.ts` (new, pure).** `laneStatus()` reads a prediction as clear / tight (slack < 0.35 s) / blocked / save / offside; `laneWords()` says it in 7v7 or 9v9+ words and names the defender by shirt number; `noteFor()` records each release (receiver, loft, curl, defenders beaten, the defender in the straight lane, called runs, first time, onside margin); `explainSuccess()` turns the notes into up to two "why it worked" lines; `explainFail()` gives "why it didn't" plus "Try this"; `replayCall()` is the replay commentary ("#9 runs… #10 passes to #9", "#4 cuts it out!", "GOAL! #9 scores").

**Arcade.**
- Aim: the dotted path is green (clear), amber (tight) or red (blocked); a red arrow runs from each threat defender to the spot they would reach, a red cross marks where the ball is stopped, and a tight lane shows the near-miss defender in amber. The tip becomes the coach's live read.
- Hints in tiers: the book button gives the words, then "Show me where" (a glowing spot for the next pass of the coach's route and, when the route needs it, a mint arrow for the run to drag first), then hides. The fail card offers "Show me where next try". If the child's move has left the route, the words say to start again. No star penalty.
- Replay: a commentary line per event, a short freeze-frame on the deciding moment (0.7 s, 0.35 s with reduced motion), and arrows on called and scripted runs while they happen.
- Result: "Why it worked" (two lines) above the lesson; a miss names who stopped it and what to try.

**Content.** `wr-aim-off` (Wind & Rain, "Aim Off": lift a switch upwind of the winger in a crosswind) is new and original; route proven through `readStroke`, sloppy 4/4, youth mode, naive option fails. Timing & Runs is reordered by the measured curve (Beat the Trap → Decoy Run → Make the Run → Get Back Onside); Wind & Rain ends with Aim Off. `curve.ts` regenerated; `tests/pass-puzzle-daily.cjs` now also requires every pack to open with a puzzle rated ≤ 65. Offside stays on in every puzzle; no heading stays the 7v7 default.

**Defaults picked for the open questions.** Star gates unchanged (3/6/10/14/18/22/28/34). Daily puzzle: stars only, no coins (unchanged; avoids a daily coin farm). Up and Over: the route stays a held stroke on the teammate. With heading off (the 7v7 default) it is the youth chip to feet; a chip-to-feet route below loft 0.5 is cut out by the halfway defender and making the puzzle `noHeading` breaks the heading-on route, so neither was shipped.

**Tests.** New `tests/pass-puzzle-explain.cjs` (all 36 routes explained in three formats, every naive pass flagged before release with the defender named, fails explained, replay calls, Prediction field invariants). `tests/pass-puzzle-arcade.cjs` adds the red arrow, red path, the lane read, the fail "why", the tier-2 hint spot, the success "why" and the replay call; the browser checks launch with `--mute-audio` and wait for `domcontentloaded` (the shared dev server was too loaded for `load`).
