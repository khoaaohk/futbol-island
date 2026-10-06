# Breakaway Run — September 25, 2026

Resumed and verified the existing arcade upgrade: collect a bounded inventory of footballs, shoot obstacles to clear space, and aim for the highlighted goal opening. Walking through a goal does not score. Boosts, planted-foot shooting, jump/slide evasions and goal streaks retain their football learning purpose: scan ahead, move into space and choose when to finish.

The existing implementation uses four reusable projectiles and thirty prebuilt object visuals. No new rendering loop, geometry allocation during play, polling or ongoing animation was introduced in this continuation.

## Changes in this continuation

- Shared `ArcadeGame3D.tsx` now stores the active canvas pointer in a ref cleared by the common input release path. Pause, focus loss, restart and unmount clear the gesture and release pointer capture, preventing an interrupted drag from surviving into a later play session. This also applies to Futbol Tennis.
- Expanded `scripts/check-breakaway-browser.cjs` to exercise mobile Shoot/Jump/Slide buttons and actual touch swipes, desktop keyboard controls, focus loss while a pointer is held, pause/resume, finished rendering sleep, restart state and renderer cleanup on exit. Score/collision checks wait for state rather than assuming fixed wall-clock animation timing.

## Verification

- `node scripts/check-arcade-runner.mjs`: pass. Inventory cap, grounded shooting, cooldown, nearest swept obstacle collisions, aimed goals, boost goals, no walk-in goals, slide/jump, finished simulation sleep and ten-minute bounded object/projectile pools.
- `node scripts/check-breakaway-browser.cjs`: pass at 1280 × 800.
- `node scripts/check-breakaway-browser.cjs --mobile`: pass at 390 × 844 with touch enabled. Both profiles score 425 from obstacle clearance, collection and a goal; preserve all three chances; restart with one ball, three chances and zero score; and exit without page errors.
- Pause and full-time screens render no additional frames during the measured 300 ms rest windows. Screenshots: `/tmp/fi-breakaway-desktop.png`, `/tmp/fi-breakaway-mobile.png`.
- Sample goal-frame draw calls were 152 desktop / 71 mobile; transient particles mean this count varies across frames. These checks demonstrate behavior and bounded work, not real-device iPhone temperature.

Local development verification only. Not deployed.

## Gameplay development pass

Applied the `game-developer` skill after the request for a substantial upgrade. Thesis: **read a defensive line, take the open route, then time a finish**. The earlier loop offered isolated random objects, a small floor tile for the goal opening and an ambiguous joystick. Correct collision fixtures did not establish a satisfying repeated exchange.

### Play changes

- Authored defensive-line families replace independent random obstacles. Three footballs arrive before their line and mark a lane with no defender or cone. Lane choices rotate; later stages add a second challenge to the switch pattern. Tests cover eighteen pattern variants, distinct occupied lanes and a reachable clear trail.
- First goal arrives after 90 metres; subsequent goals are 180 metres apart. A bounded approach window suppresses fresh obstacles without deleting objects already visible. Goal approaches provide three footballs in the correct lane. This creates a route-reading beat followed by a finishing beat.
- Early shots remain valid. Waiting until the goal is 8–22 metres away and aligning accurately earns a +150 precision bonus. The full-height gold aperture gently pulses during this window and the contextual cue says `FINISH NOW`; reduced motion keeps the aperture still. The bonus is attached to the shot at release, so a late collision cannot retroactively turn an early shot into a precision finish.
- Six clean collections, clearances or successful skill evasions raise scoring to ×2; twelve raise it to ×3. A tackle, saved shot or missed goal ends the run. Timed hurdles/slides earn 40 base points; a tackle also resets clean-touch boost progress. Stage pace increases every 360 metres, capped at 18 m/s before the existing boost.
- Cream lane paint moves with the pitch; a gold shot sightline makes the current aim explicit. Coral footballers replace solid goal-blocking cubes, and the scoring aperture is visible above the ground. The root integration replaces the runner's joystick with discrete lane controls and compacts the HUD.

### Evidence and limits

Engine correctness: `scripts/check-arcade-runner.mjs` passes the existing collisions/inventory/pool tests plus authored-route fairness, combo/reset, skill reward, safe approach and early-versus-timed finishing cases. The final injected browser sequence now scores **575** (100 clearance +25 collection +450 timed goal); desktop and touch browser suites pass controls, failure/restart, pause/finished sleep and disposal without page errors.

Player experience: `scripts/play-breakaway-browser.cjs` chooses visible routes by reading state and acts only through real arrow keys or touch swipes plus the Shoot button. It never changes game state. Separate desktop and touch runs each covered roughly **602 metres**, scored **three deliberate precision finishes**, and retained all three chances by changing lanes. This demonstrates repeatable technique through ordinary controls; an automated policy does not establish subjective fun or prove real-device touch behavior. A first playthrough revealed excessive empty approach time, which was shortened from 58 to 28 metres without deleting visible obstacles.

Action captures reviewed: `/tmp/breakaway-play-mobile-20.png` (defensive line and marked route), `/tmp/breakaway-play-mobile-60.png` (timed goal approach), and corresponding desktop images. `--failure` on the ordinary-input script additionally stops reacting and waits for natural full time, then retries through the menu.

The complete touch run with `--failure` passed: 662 metres, 12 lane changes, three precision finishes and 13,325 points before deliberately stopping reactions; natural full time and a normal-menu retry then completed successfully.

Runtime: four shot slots and 26 decorated scene-object slots (6 defenders, 6 cones, 12 balls, 2 goals). Ten-minute simulation peaks were **3 defenders, 2 cones, 6 balls, 1 goal**. Lane paint uses one geometry; sightline and endpoint add two simple draws. Goalkeeper rigs add visible geometry during goal approaches; reducing the unused goal pool from six to two bounds their retained assets. Paused/finished sleep remains verified. No new render loop or per-frame geometry construction. No claim of measured phone cooling; not deployed.

## Movement and animation pass

The next request targeted fluid action rather than more rules. Lane cuts now use an exact critically damped spring: lateral velocity carries through a reversal, then settles without overshoot. The renderer receives actual velocity and a damped lean, instead of tilting a rigid upright figure based only on lane error.

Jumping now lands once. The earlier shared jump helper bounced the runner after contact like a ball; Runner consumes that contact and plants both feet, with a short landing-compression signal. Jump anticipation and slide entry/recovery have bounded blend values for the shared articulated rig. The old manual whole-body slide tilt and damage blinking are removed, allowing the rig's extended-leg slide and stagger poses to remain visible.

A shared external stride phase couples the dribble to the legs; the phase slows during a planted kick or slide. Kicks have immediate contact/follow-through, and the next inventory ball stays hidden during the strike. Defenders and goalkeepers turn toward the approach. A single instanced projectile-wake mesh provides three fading marks per active shot on mobile, five on desktop (maximum twelve/twenty); it is disabled for reduced motion and has zero active instances without shots. The camera remains stable.

Simulation checks pass 30/60 Hz lane-position equivalence, prompt reversal, bounded lane positions, one planted jump landing without rebound, and smooth slide entry/recovery. Existing scoring/collision tests still pass; this pass adds no scoring rules. Visual/action checks are reported below after the shared rig integration.

After integration, both desktop and touch ordinary-input runs passed: approximately 587/597 metres respectively, eleven deliberate lane changes each, three precision finishes and no lost chances. The desktop and mobile browser suites also passed. The slide check now waits for the **rig's actual** slide blend above .8 and checks lowered pelvis plus bent leg joints, instead of only checking the gameplay timer. Reviewed unobscured jump/slide captures: `/tmp/fi-breakaway-mobile-jump.png`, `/tmp/fi-breakaway-mobile-slide.png` and desktop counterparts. Passed goal meshes stop rendering after moving behind the runner, avoiding a retired net crossing in front of the player. Existing pause, full-time sleep, restart and exit checks still pass.

Mobile lane-button verification additionally holds a real touch down, asserts the lane has already changed **before release**, then releases and confirms it changed exactly once. Returning with the opposite button and using swipes both pass. Portrait remains the intended runner composition; no forced orientation change is needed for its forward course.

## Reactive defenders, running mechanics and held blast

The next explicit requests targeted standing defenders, robotic running, goal-shot animation and hold-to-shoot power. The yellow forward aiming line was removed as requested; charge feedback stays beside the player/ball.

- Defenders now patrol laterally, read the approaching runner at 22 metres, visibly prepare for .45 seconds, and commit to a bounded lateral lunge. Their committed aim is fixed, so a late lane cut beats the read. Actual moved X is used for both shot and runner collisions. Maximum deviation is .8 metres within their defended lane; the authored clear route remains clear.
- Runner-only foot trajectories now separate grounded stance (58% of the cycle) from lifted recovery. Two-segment leg solving keeps the support foot on the turf. Charge and strike preserve a support foot while loading/extending the kicking leg; the existing shared rig still handles slide, airborne pose, torso and recovery.
- Hold Shoot or Space to charge over 1.1 seconds; release fires. Quick taps remain normal kicks. A charge of at least 80% produces a larger, faster power shot that pierces two challenges and can then score using the existing power-goal reward. One ball is consumed only on release. One pointer owns the charge; cancellation, blur and pause discard it without firing.
- A local charge ring, ball swell, percentage/ready cue, stronger bounded projectile wake and release impact communicate charge. Successful goals now leave a short-lived ball inside the net and deform its prebuilt net geometry around the hit. Saved shots trigger the relevant keeper's block pose. Net geometry only updates during its finite reaction/recovery.

### Verification

`scripts/check-arcade-runner.mjs` passes full-charge inventory/penetration/goal, cancellation, defender lane bounds, reaction delay and fixed committed-aim tests, alongside the previous gameplay/movement tests. `npx tsc --noEmit --pretty false` passed before final browser verification.

Desktop and mobile `check-breakaway-browser.cjs` pass real hold/release and cancellation. A fully held shot clears two cones and reaches the goal for **850 points**; canceling a partial charge retains the ball and creates no projectile. Existing quick shots, lane controls, jump/slide, pause, restart and disposal checks still pass.

Ordinary touch play passes: **598.49 metres, 11 lane changes, three precision goals, 12,950 points, all three chances retained**. This run uses normal touch swipes and Shoot taps without mutating game state. Reviewed final-control captures: `/tmp/fi-breakaway-mobile-charged.png` and `/tmp/fi-breakaway-mobile-blast.png`; the yellow forward line is absent. The follow-up ordinary-play script also records defender lateral travel and committed frames for repeatable movement evidence.

No new loop or unbounded effects. Two pooled caught-ball meshes are retained with the two goal visuals; only an active net reaction shows one. Goal net uploads are bounded to the .65-second impact. Main-app circular textured controls were integrated by the root agent. Still local; not deployed.

### Remaining game-developer findings

1. **Power decisions overlap.** The ordinary quick-tap run already receives power goals from five-ball automatic boosts. Proposed: reserve the strongest piercing ability for held shots, or restrict automatic boosts to movement. Current tests demonstrate functionality, not that this tradeoff is optimally balanced.
2. **Later challenge remains predictable.** The ordinary policy survives nearly 600 metres untouched because the ball trail is always safe and defenders stay in their own lanes. Proposed: later-stage, clearly telegraphed lane-crossing challenges with over a second of commitment and one guaranteed escape.
3. **Action feedback can distinguish intent better.** Shared sound remains generic, and the rear camera sometimes hides the held ball behind the runner silhouette. Proposed: stage the loaded foot/ball slightly laterally, add distinct charge/kick/net sounds, and optionally use a short supported haptic. These are observed limitations and proposed follow-ups, not implemented claims.

## Gate explosion and defender archetypes

The subsequent explicit request adds an outward goal explosion and different opponents that actually tackle.

- **Purple jockey:** compact upright silhouette, faster side-to-side footwork, a standing poke/block. A jump, slide, shot or lane cut can beat it.
- **Coral tackler:** broader, shorter silhouette with a horizontal shirt stripe. A low preparation pose and `CORAL TACKLER · jump, shoot or cut away` cue precede an extended-leg slide tackle. Sliding into this low challenge no longer counts as an evasion; jumping clears it.
- **Blue sweeper:** taller narrow silhouette with a vertical stripe, stronger lateral movement and a wider side-foot tackle. Changing lanes or sliding past remains effective.

Authored patterns rotate the roles. The initial read starts 32 metres away, with a .5-second preparation (.65 for the tackler) and fixed committed aim. The actual tackle starts inside nine metres, extends briefly and recovers; the defender remains visible during recovery instead of disappearing at contact. Movement stays within .8 metres of its lane centre so a marked escape lane remains available.

Collision uses the active leg's envelope: tackler forward reach 2.1 metres, sweeper lateral reach 1.15 metres, jockey a smaller standing poke. Tests establish contact before the torso reaches the runner, failure when sliding into the low tackle, successful jumping over the extended foot, and at least one second from initial warning to contact even at maximum boosted speed. Reach descriptors are reused constants, not per-frame allocations.

On a scored goal, the intact crossbar/net and gold gate marker disappear. Six existing frame pieces, three prebuilt crossbar sections and three clipped net panels fly outward, arc/spin briefly and retire after 1.2 seconds. They do not return to the running route. Reduced motion uses a small static scatter with no bounce/spin. All twelve pieces restore their saved transforms when the pooled goal is reused; the six extra chunks remain hidden before the next score. No runtime geometry creation or new loop is introduced. Three runner-only kit materials are explicitly disposed on exit even after a pooled defender changes roles. The root integration adds a short goal thump/net rattle using transient sound sources.

Verification: updated simulation passes all three role variants, extended-tackle contact/evasion and maximum-speed warning cases. Desktop and mobile browser suites pass twelve visible outward debris chunks, hidden intact goal, complete pooled goal reset after retry, and the existing controls/charged blast/lifecycle gates. Reviewed `/tmp/fi-breakaway-mobile-goal-explosion.png` and `/tmp/fi-breakaway-mobile-defender-roles.png` show the outward burst and three distinct phone-scale opponents.

The root's ordinary-input mobile check passes **595.67 metres, eleven lane changes, three goals and all three chances**, sampling 111 committed-defender frames and .8 metres maximum lateral travel. This automated driver deliberately follows the escape route; it does not measure human difficulty. Root production build passes. Local work only; not deployed.

The final `node scripts/check-breakaway-browser.cjs --mobile --reduced` also passes. It compares debris local positions/rotations across 180 ms to prove the reduced-motion scatter stays still, and asserts the actual low-tackle rig reaches a slide blend above .75, advances its root over .6 metres and extends the leading hip beyond −1 radian. Captures: `/tmp/fi-breakaway-mobile-reduced-low-tackle.png`, `/tmp/fi-breakaway-mobile-reduced-goal-explosion.png`.

The frontal low-tackle capture exposed foreshortening: the correct joint values still read as sitting upright. A final runner-only refinement adds a .52-radian lateral torso lean and counterbalancing arms during the active tackle, producing a clearer diagonal silhouette without changing contact rules.

## Island-character integration checks

The subsequent request replaces the arcade runner with the actual island character/animation system. The root agent owns that integration. The browser regression now requires the island-rig marker and named pelvis, hips, knees and ankles; it samples the actual standing pelvis/knee and compares them with the mid-slide pose. This avoids treating the earlier arcade rig's diagnostic arrays as proof that the island character is animating correctly. Defender checks also require the island rig after the request expanded to all games.

Integration contracts reviewed: `PlayerMotion.kick` is forward-normalized action progress and contact is at `PLAYER_KICK_CONTACT = .36`; held `shotCharge` must become undefined on release; `ballContact`/`dribbleContact` produce world coordinates and must include the final treadmill/jump transform; gait must receive continuous virtual travel, with reset/resume handling. `PlayerRig.dispose()` owns refcounted spine surfaces and must run before generic scene geometry disposal. Browser visual and ordinary-touch results will be appended after the adapter is ready.

The actual island-rig integration passes desktop and mobile `check-breakaway-browser.cjs`: named-joint identity for runner and defender, actual pelvis lowering and knee articulation during slide, jump, charging/cancellation, quick shot and penetrating blast, goal explosion/reuse, pause/full-time sleep, restart and exit. Inspected `/tmp/fi-breakaway-mobile-slide.png` shows a grounded extended-leg slide with hand balance; `-jump.png` shows tucked airborne legs, and `-charged.png` shows the island character's loaded-foot stance and saved appearance. Diagnostic goal frames report 92 mobile /172 desktop draw calls (transient frame samples, not a controlled performance comparison or phone temperature measurement).

Review also caught shot power being lost when input charge reset on release; the root adapter now retains release power during follow-through and resets virtual/action state on retry. The root adapter disposes the island rigs before generic scene resources. Ordinary-play navigation initially timed out before entering gameplay during concurrent recompilation; the run was retried after compilation.

The retried ordinary touch run passes with the actual island characters: **647.70 metres, twelve lane changes, three precision goals, 13,175 points and all three chances**; 115 committed-defender samples and .8 metres maximum lateral travel. Reviewed `/tmp/breakaway-play-mobile-20.png` for running/dribbling and the approaching island-rig defender. All Runner browser processes exited successfully before the root continued the remaining games' serial verification.

## Feel pass, October 4 2026 (A2)

What the player feels:
- **Music and crowd.** There's now a synthesized soundtrack. Tempo follows running pace (about 100 to 128 BPM), and layers grow by stage: pluck from stage 2, clap from stage 3.
  - A crowd murmur builds through goal approaches and roars on a goal. It gives an "ooh" on a save, plus a whistle and an "aww" at full time.
  - Cuts get a swish, jumps and slides have their own cues, and collecting plays a rising note while touches stay clean.
- **Beat the tackle.** If you stand in a committed tackle's path late and then cut away clean, you get "Beat the tackle! +25". Chained escapes earn kind streak copy, a whoosh, a speed-line flash and 0.1 s of slow-mo.
- **Telegraphs.** Every reading defender gets a role-coloured read arc that fills during its read. A ground strip shows exactly where and how far the committed tackle reaches.
- **Green presser (stage 3+).** It reads you, then sprints out of its line to close you down before a poke. It stays inside its lane band, and its warning still runs ≥1 s at maximum boosted speed.
- **Fairness.** A link ball now sits just past every gap, so a greedy ball-follower is never lured into an early cut. The simulation verifies zero hits at stages 1–6. Link balls reload but don't build the power-run meter.
- **Timing.**
  - Slide in the air fast-falls into the buffered slide.
  - Pace now ramps smoothly with distance instead of stepping at each stage.
  - Losing a chance eases the pace for about 1.6 s.
- **Fail moment.** The last chance triggers a 1.35 s full-time beat: hit-stop, shake, a stumble into a dejected stop, the world coasting to a halt and a whistle. Only then does the result card appear.
- **Juice.**
  - Plant dust on cuts, landings, slides and hits.
  - Goal confetti.
  - A camera that gently follows your lane, with FOV that widens with speed and boost.
  - Sparing shake on hits and blasts.
  - Hit-stop on tackles and goals.
- **Scenery.** Recycled crowd stands change density and colours by district: empty on the Boardwalk, terraces in Old Town, full stands at Club Grounds. They always fill for a goal approach, and the crowd bobs harder as a goal nears.

Files:
- `lib/arcade/runnerGame.ts` (engine)
- `lib/arcade/runnerFx.ts` (new)
- `components/games/runnerAudio.ts` (`createRunnerSoundtrack`)
- small runner-only hooks in `lib/arcade/arcadeGames.ts`
- one audio-context argument in `ArcadeGame3D.tsx`

Tests:
- `tests/runner-feel.mjs` (wrapped by `tests/runner-feel.cjs`, which is in `npm test`)
- the existing runner suites
- `scripts/check-breakaway-browser.cjs` in desktop, mobile, mobile reduced-motion and returns modes

Note: `components/games/BreakawayRun.tsx`, `runnerRig.ts` and `runnerScenery.ts` are the older Babylon build. Nothing mounts them.

## Round 2 depth pass, October 4 2026 (G2)

**Decision:** the user chose power-run option (b). It takes 8 clean touches and gives a 3 s burst plus the power shot. It rides exactly one tackle; it is no longer full invincibility.

**New this round** (each one is a real football decision):
- **Skill moves.** The Skill button (E) names the counter for the defender ahead:

  | Defender | Skill move |
  |---|---|
  | jockey | step-over |
  | presser | roulette |
  | low tackler | drag-back |
  | sweeper | rainbow flick |
  | gold wall | nutmeg |
  | pink pair | croqueta |
  | back line | body feint |

  - A move counts inside a timed window (perfect band +40). Pressing too early fails visibly.
  - The rig plays the real move from `skillMoves.ts`.
- **Closer (stage 3+).** A defender steps into the trail lane after a read. Its strip previews where it will step, and there is no link ball, so you have to read it.
- **The trail fades** from stage 4.
- **Pink pair (stage 5+).** Two defenders squeeze the gap between them.
- **Puddles.** Jump to lift the ball over.
- **Teammate one-two.** It takes the next defender out and gives a burst of pace.
- **Keeper goals (stage 2+).**
  - A set keeper sways; shoot the other side. Placed and power shots need different gaps.
  - A rushing keeper must be chipped or rounded.
  - The wing route ends in a cross, which you volley in.
- **Route fork.** Wing (safer, cross) or middle (busy, goals ×2).
- **Back-line boss.** From stage 2, before every second goal. The first one in a run is a single line. It shifts as a unit and holds its shape inside 18 m, and it costs at most one chance.
- **Missions.** There are 18 missions in 6 sets of 3 (`lib/arcade/runnerMissions.ts`).
  - Completing a set unlocks a ball with a true story.
  - The cards show the missions and a 6-stamp mission path.
  - Storage is written only on completion.
- **Pacing.**
  - The pace climbs gently to 20 m/s after 18 m/s.
  - Spacing between lines tightens with the stage.
  - Two-line patterns are spread out between single lines.
  - After a lost chance, the next encounter is simple.
  - Landscape phones get a closer camera.

**Simulation** (`scratchpad/arcade-loop/breakaway/sim2.mjs`, 60 runs):

| | Before | After |
|---|---|---|
| A bot that only follows the balls | Never lost (4 min+) | Median 106 s |
| Kid-like bot | Median past 4 min | Median 151 s; hits/min by stage 0.19, 0.43, 1.47, 1.07, 1.86, 1.39 |

**Files:**
- `lib/arcade/runnerGame.ts`, `runnerFx.ts`, `runnerHud.ts` (new), `runnerMissions.ts` (new)
- `components/games/RunnerMissionCard.tsx` (+ css, new), `runnerAudio.ts`
- Runner-only hooks in `arcadeGames.ts`
- The Skill button and the mission card in `ArcadeGame3D.tsx` (+ css)

**Tests:**
- `tests/runner-moves.mjs` (new; runs inside `tests/runner-feel.cjs`)
- `tests/runner-depth.mjs`, `tests/runner-feel.mjs` and `scripts/check-arcade-runner.mjs`, updated for the fading trail, the 8-touch shield and the reading requirement from stage 2
