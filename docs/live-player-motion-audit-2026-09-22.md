# Live match, play and quiz player motion audit — September 22, 2026

The highest-value corrections are synchronized kick timing, stable pass-release positions, and ground-based dribble contacts. The shared rig already has substantial leg, hip, torso, arm and head animation; adding more generic movement would obscure the more important contact and body-orientation issues.

Scope: `fieldRuntime.ts`, `teachingMotion.ts`, the shared procedural player rig, MatchSim, and the existing motion/contact tests. This is an independent source and numerical audit requested by the user. It changes no runtime behavior. Browser visual severity and physical-phone heat were not measured by this review. Exploration mechanics are covered separately in `player-movement-audit-2026-09-22.md`. The parent audit separately checks playback, seeking and quiz-pause integration.

## Prioritized findings

### 1. Confirmed: live kicks hold the contact pose far too long

Sources: `lib/town/match/matchSim.ts:760`, `:779`, `:1017`; `lib/town/fieldRuntime.ts:17`, `:68`; `lib/graphics/player.ts:181` and `:234`.

MatchSim sets `kick = 1` on release and decays this normalized value by `dt / .45`. The renderer interprets it as a .35-second countdown using `.36 + .64 * clamp(1 - live.kick / .35)`. Consequently the pose remains exactly `.36`, the contact pose, until the normalized countdown falls below .35. The ball has already left.

Measured directly from these equations:

| Sim kick value | Rendered kick phase |
| --- | --- |
| 1.0 | .36 |
| .9 | .36 |
| .65 | .36 |
| .35 | .36 |
| .2 | .6343 |
| 0 | 1.0, although runtime stops supplying the action at zero |

The hold lasts .2925 simulation seconds, or about .696 seconds at the live match speed of .42. The complete .45-second countdown lasts about 1.071 wall seconds. This is a unit mismatch, not just a preference for slower movement.

Recommendation: give the rig a correctly normalized post-contact phase from the existing sim countdown. Separately decide whether to introduce a brief visible preparation before release for AI actions. Preserve immediate interactive response; do not delay controls merely to accommodate a long wind-up. Record the release direction and striking foot on the action rather than derive them from a later ball velocity. Add a regression asserting that the leg is already following through shortly after release.

### 2. Confirmed: teaching pass origins continue moving after release

Sources: `lib/town/teachingMotion.ts:38`, `:42`; `lib/town/fieldRuntime.ts:98–101`.

Teaching release occurs at phase .18. On every following frame, however, the renderer reconstructs the starting point from the passer's **current** root and heading, then interpolates from that changing position to the receiving foot. The source is not sampled at release. Thus a passer's support run can pull an already airborne/in-flight ball away from its release trajectory.

Catalog probe: `9v9 / nx9_twostrikers`, zero-based step 7, passer `st`, moves 4.4012 m between phase .18 and .50. At phase .50 travel is .5, so source translation alone contributes about 2.2006 m to the current interpolated ball position versus a fixed release origin, holding the endpoint and orientation contribution equal. This is a geometric calculation, not a browser measurement. The step has no sub-beat change between these samples.

Recommendation: calculate the release anchor once from the deterministic authored release frame, including contact-side offset; use it throughout that pass. Pick an arrival contact anchored to the receiver's intended arrival pose and join to the receiving motion continuously. Recompute from authored data when seeking so backwards replay does not depend on a mutable cached frame. Keep ball/overlay endpoints aligned. Add a test where the passer immediately runs away after passing.

### 3. Confirmed behavior, likely visual improvement: live ground dribbles follow the swinging boot vertically

Sources: `lib/town/fieldRuntime.ts:104`; `lib/graphics/player.ts:226–262`, `:454–455`; `lib/town/match/matchSim.ts:1165–1191`.

Once reception finishes, the renderer uses full weight on `ballContact` for an outfield owner's ball. `ballContact` follows the animated ankle with a minimum forward/height clamp. This attaches the ball to the leg throughout the swing, rather than releasing it at a touch and allowing a brief ground roll. MatchSim's separate ball position continues easing toward its own dribble spot, so rendered and authoritative positions can differ.

A six-second straight-run rig probe at 60 Hz, with `dribbling: true`, root height .105 m, and samples after the first second, gave:

| Root speed | Ball center height range | Forward offset range |
| --- | --- | --- |
| 1 m/s | .295–.295 m | .480–.604 m |
| 3 m/s | .295–.362 m | .480–.723 m |
| 5 m/s | .295–.439 m | .480–.825 m |

The ground ball center is .295 m at that elevation, so the fastest sample lifts a normal controlled ball roughly 14 cm clear of its ground center without an authored chip. Whether the stylized bounce should be retained is a design decision; the full foot attachment is confirmed.

Recommendation: represent contact, short roll and next approach using a tiny per-owner state or deterministic gait phase. Keep normal touches grounded, shorten spacing under pressure, and allow slightly longer touches at speed. Use the same intended touch position for simulation and presentation where practical. Preserve the existing first-touch cushion rather than replacing it with a hard snap. No physics engine or per-foot raycasts are needed on flat pitches.

### 4. Confirmed limitation: a paused teaching rig is not determined solely by the authored sample

Sources: `lib/graphics/player.ts:155–176`, `:191–213`; `tests/teaching-contact.cjs`.

Speed, gait phase and turn/attention smoothing are stored inside each rig. Setting `dt=0` does not clear prior speed, and position changes can still advance phase when they remain below the discontinuity threshold. The current deterministic test exercises `teachingMotion()` objects, not complete rig transforms after different playback histories.

An isolated two-rig probe used the same ID, position (0, 3.6), time 2, facing 0 and `receive:1`. One rig first walked 120 frames at 1.8 m/s; the other was initialized directly at the paused sample. At `dt=0`, their left-hip rotations were -.1235 and -.3250 radians respectively; torso and head transforms also differed. This establishes pose-history dependence; it does not prove every lesson replay exhibits a visible error.

Recommendation: expose an explicit teaching seek/reset path and separate temporal smoothing from deterministic sampled poses. Use it when entering a question, restarting a play, or jumping to a step. Preserve naturally continuous gait during uninterrupted playback.

The parent integration review also confirmed a pause-gating mismatch in `fieldRuntime.ts:87`: having an outcome step supplies nonzero `dt` to the rig even when `outcomePaused` freezes outcome progress. The same gate remains open after outcome progress reaches 1. A separate rig probe walked 30 frames at 3 m/s, then held position and pose clock fixed while supplying 60 further 1/60-second updates. Thirty-four position/quaternion components changed as the pose settled. This reproduces the rig response to the runtime gate, not a browser observation of a particular quiz. Gate pose integration with the actual outcome playback state and separately support deterministic seeks; merely passing zero delta does not resolve the history dependence above. Existing `quiz-replay`, `quiz-outcomes` (193 prompts) and `quiz-progress` tests passed, but do not cover this full-rig pause behavior.

## Body-mechanics opportunities

These are design improvements grounded in the implementation, not claims that the current arcade style is broken.

| Area | Existing behavior | Specific improvement and learning purpose |
| --- | --- | --- |
| Turning and planted feet | Shortest-angle damped root turning and modest torso/head lead already exist (`player.ts:167–214`). Foot phase advances from distance; stationary yaw has no pivot step. A 90° stationary turn moved a measured ankle .153 m sideways without a step. | Add a bounded stationary pivot and a small outside-foot plant for sharp cuts. Show the difference between turning with possession and opening to receive. Use fixed pitch height and two cached support anchors, with no new scene queries. |
| Head and scanning | Head has idle yaw, turn lead and selective horizontal ball attention (`player.ts:214–215`, `:275–285`). Field attention is limited mainly to carriers, current receivers and active teaching contacts (`fieldRuntime.ts:82–85`). There is no vertical target input. | Before reception, briefly look toward the next option or shoulder pressure, then return to the arriving ball. Supply authored scan cues in teaching; use only the intended receiver/carrier in live play. Add bounded pitch for lofted balls. This communicates scanning rather than random head motion. |
| Torso and hips | Pelvis counter-rotation, running coil, turn bank and receive-to-kick blend are already present (`player.ts:204–213`). | Make the preparation clearly load the support leg, then rotate pelvis before chest through contact. Start with passes and shots as separate small curves; preserve clear silhouettes at match camera distance. |
| Legs and acceleration | Two-bone sagittal leg solving, distance-driven stride, swing clearance, reverse/side stepping and bob compensation exist (`player.ts:219–262`). The lateral component rotates the hip after the sagittal solve and support feet are not world-locked. | Improve support locking first; then validate side steps and diagonal cuts for slide/crossed legs. Couple braking to one short compression step instead of only damped root velocity. Do not replace current gait with more clock-driven oscillation. |
| Passing versus shooting | Field runtime forwards the same generic `kick` curve for all releases. The shared rig's `powerKick` branch exists for other modes, but this field pipeline does not select it (`player.ts:380–391`; `fieldRuntime.ts:68–72`). | Add a small action kind such as inside-foot pass, driven shot or lofted pass. Adjust support-foot offset, striking ankle, hip rotation and follow-through. Share curves across actors and keep ball release at a defined contact phase. |
| Reception | Geometry already chooses open hips and far/near receiving foot in teaching and live play (`teachingMotion.ts:17–26`; `matchSim.ts:1092–1154`). | Preserve that work. Make the selected boot visibly cushion backward along incoming travel and then push into the next action. Avoid adding a separate pose that fights the existing kick-priority blend. |
| Defensive stance and keepers | Defenders can face the ball while traveling, but use the same standing/running base; keeper speed changes for a shot, while no keeper-specific catch/dive action is passed into the shared rig (`fieldRuntime.ts:66–87`; `matchSim.ts:2118–2124`). | Later add a low jockey pose and short tackle/recovery cue, then a set stance and compact catch/reach for goalkeepers. These clarify defending and shot-stopping decisions without requiring full ragdolls. |

Teaching source facing remains aimed at the pass direction even after the kick ends (`teachingMotion.ts:38`). After fixing release anchoring, review when the passer should resume facing their support run. Near-ball actors and defenders intentionally face the ball; retain that useful open-body/backpedal behavior rather than forcing every actor to face travel.

## Suggested implementation order

1. Correct the live kick countdown and stabilize teaching release origins. Add regression samples around contact and moving-passer releases.
2. Establish reliable quiz/play pause and seek poses in conjunction with the integration findings.
3. Introduce grounded dribble contacts and simple support-foot pivots; review straight, sideways, backwards, accelerating and stopping motion.
4. Add distinct pass/shot mechanics and selected pre-reception scans. Review at normal camera distance before adding finer detail.
5. Consider keeper/jockey actions after the core ball-contact transitions are convincing.

## Validation completed and limits

Passed locally:

- `node tests/player-motion.cjs`
- `node tests/teaching-contact.cjs` — 918 sampled lesson steps, 217 passes, both receiving feet.
- `node tests/player-batch.cjs` — 22 players / 10 batches, bounded matrix updates and stable color uploads.
- `node tests/match-update-clock.cjs`
- `node tests/teaching-routes.cjs`
- `node tests/lesson-beats.cjs`

Additional isolated probes transpiled the real TypeScript modules with the same VM loader pattern used in the tests. They measured the kick mapping, rig history dependence, stationary turn ankle displacement, dribble contact bounds and moving teaching-pass origin described above. Existing tests passing does not establish realistic motion: the contact suite mainly checks finite transforms, deterministic motion metadata, facing, and front-of-body/minimum-height bounds. It does not constrain support-foot drift, ball release continuity or live follow-through timing.

For implementation, add temporal assertions at preparation, contact, follow-through, arrival and recovery; compare continuous playback with seeking; verify mirrored feet, reduced motion, pause, offscreen reappearance and both phone/desktop viewports. Preserve shared instancing, culling, the existing renderer/clock and offscreen throttling. No new loops, per-player raycasts, textures, or continuous offscreen posing are justified by these recommendations. Measure extra visible-actor arithmetic and retain the current batching check. A physical iPhone session is required for heat claims.

Documentation only; no runtime changes, deployment or production build was performed by this independent review.

## Authorized implementation follow-up

After the audit, the user requested implementation. The contact pipeline now normalizes the live kick countdown correctly; samples actual source and selected receiver boot positions once per teaching beat; carries the ball with a moving passer before release; fixes the release origin during flight; and joins the actual receiving foot continuously at arrival. Contact sampling uses the existing rigs and immediately restores their deterministic current poses. The authored root samples live in the existing lesson-plan cache. Backwards seeking reproduces the same endpoints.

Live reception now uses `MatchSim.receptionPlan()` for both preview and committed first touch. This is the previous simulator geometry extracted into one method, not a second rule for presentation. Intended receivers and interceptors open toward their next action and present the appropriate foot before control. The approaching ball reaches that actual foot at the control-zone boundary, starts ownership at the same contact, then cushions into a grounded short roll. Mirrored live and teaching fixtures verify both feet; the simulator's `R` vector intentionally corresponds to negative rig side because its field-coordinate convention is reversed from the rig's positive-side vector.

Controlled outfield dribbles remain grounded and use a bounded distance-driven roll. Live release preserves the preceding visible contact rather than jumping to the simulated root. Controlled goalkeeper possession is shown between the actual hands; release height is retained. Live action/scan/jockey/keeper metadata resets when no longer applicable, ball gaze height is ground-relative, paused initialized live rigs retain their pose, and paused/completed quiz outcomes do not advance pose time.

The parent agent implements and validates the shared body's deterministic sampling, support-foot pivots, action curves and torso/head changes. Another delegated agent owns later tactical engine improvements; this contact follow-up changes no AI decisions.

Contact validation: `tests/field-contact-motion.cjs` passes using the actual runtime with stubbed canvas drawing. It checks live kick progression, grounded roll bounds, both mirrored selected feet, moving-source release anchoring, exact boot arrival, backwards seek, live ownership-handoff continuity, zero root-centre release pop, outcome time gating, metadata clearing and keeper hand possession. Existing `teaching-contact`, `player-motion`, `player-body-mechanics`, `player-batch`, `live-field-frame`, `match-update-clock`, `lesson-beats`, `teaching-routes` and `match-story` tests also pass. The separate pre-existing `live-game-effects` test has an incomplete canvas stub (`c.save` missing); no match-effects code was changed by this work. Final production build/browser results are recorded by the parent task.

Runtime cost remains bounded: no extra renderer, loop, physics raycasts, textures or character rigs. Two contact actors are sampled/restored only when a teaching beat changes. Live reception planning runs for the selected visible target/interceptor; no all-player target search was added by presentation. Local only, not deployed. Physical-phone heat remains unmeasured.
