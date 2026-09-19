# FIFACHER animation research

Research only, September 16, 2026. No app changes or performance measurements. Reviewed upstream commit `e82344ae1b18e7aeed7eed0bb7ca7230d04e72f5` (July 31, 2026), local `AGENTS.md`, `performance-guide.md`, and current animation/caller code. Runtime costs below are structural estimates, not measured milliseconds or phone temperature changes.

## Recommendation

Keep Futbol Island's existing rig, contact solvers, batching and update gates. Borrow small animation ideas; first remove pose calculations whose results are immediately overwritten, then improve action blending and football attention cues. Nothing found supports replacing the renderer or character architecture for mobile efficiency.

## What upstream actually does

[FIFACHER players.js](https://github.com/acherm/fifacher/blob/e82344ae1b18e7aeed7eed0bb7ca7230d04e72f5/src/players.js#L1822) uses sparse normalized action tracks, smoothstep sampling, mirrored actions, and fade envelopes over locomotion. Head tracking is angle/range limited and damped. Turning has a speed-dependent angular-rate limit. After posing, ground correction forces world-matrix updates, samples soles and can rewrite the pose/update matrices again. All players update in the team loop; foot contact patches share an instance buffer. Its coordinate axes and joint signs differ from Futbol Island's.

[FIFACHER match.js](https://github.com/acherm/fifacher/blob/e82344ae1b18e7aeed7eed0bb7ca7230d04e72f5/src/match.js#L178) schedules kick release after a short action delay, snapshots velocity/spin and cancels a possession-dependent release when possession is lost. The delay constants are separate from animation keys; their presence does not prove exact foot/ball contact.

[FIFACHER main.js](https://github.com/acherm/fifacher/blob/e82344ae1b18e7aeed7eed0bb7ca7230d04e72f5/src/main.js#L32) runs simulation at 120 Hz, including team posing. This is not a mobile heat optimization. The [README's desktop performance report](https://github.com/acherm/fifacher/tree/e82344ae1b18e7aeed7eed0bb7ca7230d04e72f5#measured) is an upstream report, not independently reproduced here and not iPhone evidence.

## Already present locally

- `lib/graphics/player.ts:150`: shortest-path yaw damping, acceleration lean, distance-driven gait, stance/swing feet, pelvis compensation and analytic two-segment leg solves; shortened dribbling stride, kick support and receiving poses. Do not propose these as missing.
- `player.ts:255`: riding already solves feet to pedals/deck and hands to grips, with bounded turn lean, suspension, truck response and parachute poses. Essential locomotion survives reduced motion.
- `lib/graphics/islandNpcs.ts:45`: distance/frustum pose gates, immediate nearby/reaction updates and accumulated pose time already exist.
- `lib/town/fieldRuntime.ts:36` and `lib/graphics/playerBatch.ts`: whole-match visibility, distant simulation scheduling, per-player draw culling, shared instancing, cached mesh bindings and bounded matrix upload ranges already exist. Drawing fewer characters and evaluating fewer poses are separate operations.

## Ranked next steps

| Rank | Concrete change and learning value | Expected work | Risks and limits |
| --- | --- | --- | --- |
| 1 | **Select the base pose before solving limbs.** `player.ts` currently calculates walking leg angles/arm swing, then overwrites them for riding. Preserve shared speed/yaw/phase integration, but calculate only the chosen base pose; apply exceptional actions afterward. Ride posture stays readable while eliminating discarded calculations. This is a local finding, not an upstream optimization. | Potentially removes two unused walking leg solves and associated transform writes per ride pose. No new meshes, textures or loops. | Later branches may depend on base channels. Preserve all rotations, pelvis components, pause, reduced motion, truck/flight/trick overrides and teleport behavior; compare final transforms across modes before accepting. |
| 2 | **Sparse, shared action definitions with bounded blending.** Adapt the upstream track/envelope idea for a few transitions, initially receive → pass and charge → follow-through. Define contact time once and mirror foot-specific channels at initialization. Reuse a small pose buffer; sample only active tracks. Clear weight transfer teaches the supporting leg and follow-through. | A handful of interpolations per active action; small constant per-rig state. Zero action sampling when inactive. | Local kicks already blend. Improve visible discontinuities rather than rewrite every action. Preserve lesson seek determinism and input responsiveness; ride mounting needs grip/foot constraints during blending. Do not copy upstream axis values. |
| 3 | **Bounded football head attention.** Add an optional target supplied by the owning scene, initially for the receiver/ball carrier or focused lesson actor. Turn the existing head toward the ball before contact; ease back after. Teach watching the incoming ball and scanning before receiving. | Two target angles and damping on eligible visible rigs; no raycasts, scene scans, neck bones or additional geometry. Targets can refresh only when play context changes. | Do not imply every player must stare at the ball. Avoid extreme downward head angles, costume clipping and overriding action/reaction poses. Respect pause and reduced motion. |
| 4 | **Turn anticipation from actual angular velocity.** Existing lean uses damped target-yaw error. Experiment with bounded yaw-change/dt for lean and a short torso/head lead during sharp turns, while preserving movement direction. Helps a learner see preparation for a change of direction. | Several scalar operations per posed rig; reuse existing joints. | An upstream-style strict yaw cap could make joystick steering feel slow. Test this as a visual change first; preserve root collision, aim, ride heading and wraparound. Clamp dt and reset on teleport/reappearance. |
| 5 | **Skip safe offscreen live-match poses before evaluation.** In a visible match, the per-player frustum test currently comes after `rig.update`. Reuse its shadow-expanded sphere before posing; exempt teaching actors, ball-contact owners, receptions, kicks and active reactions. Keep simulation/root positions current. | Can remove full joint evaluation for eligible hidden players; benefit depends on camera framing. No benefit for a fully visible pitch. | Must account for shadow reach, hit/pick roots and foot-attached ball visuals. Track accumulated movement/time so reappearance does not look like a sprint or reset gait. Existing whole-match/NPC culling must remain. |

## Ball contact and reuse

Local `PLAYER_KICK_CONTACT`, teaching release poses and walking-ball windup already supply contact semantics. Live-match rendering starts its kick at the contact portion (`fieldRuntime.ts:68`), so improving pre-contact anticipation there would require an explicit simulation event; do not add an arbitrary visual delay that changes tactical outcomes. If implemented, one simulation-owned event should govern pose phase, possession cancellation and ball release. Replay/seek must compute the same result without wall-clock timers.

Reuse action definitions across rigs, not a single final pose: different gait phases, velocities, targets and contacts need distinct results. Pose lookup tables are a lower-priority experiment only if profiling identifies trigonometry as material; interpolation could introduce foot sliding, and matrix traversal/uploads may dominate instead.

## Avoid importing

Do not import the 120 Hz posing loop, skinned-body rebuild, repeated whole-rig ground-lock passes, per-foot contact-patch rendering, perpetual terrain IK or physics. Local stance compensation and fixed-cost analytic limb solves already cover the flat-ground/ride case. Added contact patches would introduce transparent drawing and matrix uploads despite existing dynamic shadows. Preserve the documented mobile DPR, render rate, simulation rate and shadows.

## Validation for any subsequent implementation

Start with one ranked change. Use existing `player-motion`, `player-batch`, `npc-behavior`, `ride-ramps`, `ball-actions` and `match-update-clock` checks as applicable, plus production build. Compare walking start/stop/reverse, turns, both feet at contact, bike/moped/scooter, truck mounting/driving/dismount, costumes, lessons, seek/pause and offscreen return. For rank 1, compare final joint transforms against the previous evaluator before profiling.

Measure pose calls, discarded solves, matrix traversals/uploads, allocations and CPU p50/p95 on an identical route with unchanged rendering settings. Record color-plus-shadow work if rendering changes. Only a controlled physical iPhone session of roughly five minutes, with comparable starting conditions and charging status, can support a thermal conclusion. This research establishes neither measured speedup nor reduced heat; nothing was deployed.
