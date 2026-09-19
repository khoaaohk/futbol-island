# Passing, receiving and directional footwork — September 12, 2026

Implemented shared procedural-rig footwork and field-runtime integration for Watch lessons, correct quiz outcomes, and live games. Authored actor coordinates, quiz answers, and live simulation ownership remain unchanged.

## Changes

- New `teachingMotion.ts` derives the passer, receiver, incoming direction, and next authored action from the lesson geometry. Open hips use the incoming/next-action bisector. The far foot receives unless nearby pressure behind the body calls for a shielding near-foot touch. Mirrored situations select mirrored feet; there is no universal right-foot reception. A directly opposed direction uses the original live engine's next-action fallback, with shortest-angle smoothing during playback.
- Passes hold the ball ahead during the windup, release at 18% of the beat, and arrive at 82%. The receiving endpoint comes from the rig's selected boot. Player positions retain their original timing and paths. Correct quiz outcomes use this same presentation instead of a separate action rule.
- `player.ts` exposes a boot contact point and uses local forward/lateral movement for footwork while maintaining an independently chosen body heading. Backward, sideways and diagonal movement no longer all use a forward stride. Existing body proportions and articulated joints remain intact.
- Contact points stay at least 0.48m in front of the body. This prevents a backswing or rearward stride from pulling the attached ball between the legs. Essential poses remain active with reduced motion. Paused seeks apply the requested heading immediately and preserve a frozen pose clock.
- Live games now consume the existing `MatchSim.recv` open-body direction, cushioning phase and selected foot, including its pressure-aware shielding logic. Its field-space R foot maps to rig side -1 because the two coordinate systems have opposite right-side bases. Passing recovery uses the release direction instead of turning toward an unrelated subsequent ball owner. Controlled balls use the selected boot point after the first-touch cushion.
- Runtime publishes the actual rendered ball position after pose/contact evaluation. The parent integrated this with the pass-arrow tail so it follows displayed movement rather than an old actor-center trajectory.

## Verification

`tests/teaching-contact.cjs` passes all 918 beats, including 220 inferred transfers, both receiving feet, mirrored body/foot selection, angle wrapping, deterministic repeated phase sampling, forward/back/lateral/diagonal finite poses, and immediate paused-seek facing. `tests/player-motion.cjs` passes. Typecheck passes.

Existing full sampled-motion and quiz-mapping checks still pass: 918 beats, minimum actor gap 1.112m; 193 quiz mappings and 61 correct-pass paths, minimum opposing-player clearance 1.488m. These check authored/planned geometry, not a proof against every rendered ball-body intersection.

Real browser coverage: 390×844 and 1100×844 for all four formats. Each case waited for an actual live reception, checked selected foot/open-body/cushion integration, then inspected a Watch transfer at release, arrival and completion, plus a correct quiz outcome. No page errors occurred. Live L and R receptions were both observed. At the sampled completed teaching receptions, the ball was 0.564m ahead and 0.595m from the actor center, outside the legs. Rendered-ball coordinates matched the arrow input.

- 7v7 `learn7_roles`, beat 6.
- 9v9 `learn9_shape`, beat 7.
- 11v11 `learn11_shape`, beat 11.
- Futsal `learnf_roles31`, beat 10.

[Browser observations](receiving-browser-audit.json) retain all eight cases. Runners: `/tmp/fi2-receiving-browser.cjs` and `/tmp/fi2-receiving-closeup.cjs`. Screenshots: `/tmp/fi2-receiving-{format}-{390,1100}.png`. An additional close-up of the futsal receiver (`/tmp/fi2-receiving-closeup.png`) was visually inspected: ball sits outside the selected boot, legs remain connected, and the body is open to the play.

## Scope limits

This implements and verifies the shared mechanics across all modes; it is not individual audiovisual acceptance of every lesson and question. Eight representative browser cases and sampled catalog checks do not establish that every authored tactical turn or shoulder check is ideal. Live shots/flight still use the simulation's ball path; keeper hand claims retain their existing behavior. Full teaching loft, continuous flight trails, and hand-catching animation are separate from this contact fix. No deployment was performed by this agent.
