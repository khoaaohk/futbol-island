# Game engine improvement pass — September 22, 2026

Implemented locally: smoother upper-body transitions; level support soles; softer swing-foot landings; stronger opposed hip/chest twist and cut lean; compact, slightly forward backpedal posture; dribble ball ahead of the stride; upper-corner shots; continuous post/crossbar collision with rebounds; shared patterned live balls with distance-based ground spin; high crosses and switches to onside receivers with an estimated arrival advantage.

These changes extend the existing procedural rig and simulator. No external package, trained model or animation dataset was imported. See `game-engine-resources-2026-09-22.md` for tactical/engine references and `body-movement-research-2026-09-22.md` for the subsequent body-motion research and next implementation priorities.

## Validation

- Production build and default town/goal/learning test pass.
- Focused body, seam, range, profile, fluidity, teaching/contact, ball-action, charged-shot, wall-juggle, goal-collision, live-ball, match-story and player-batching checks pass.
- Engine fixtures cover 24 swept goal-frame intersections, 24 walking-ball rebounds, 32 powered walking upper-corner finishes and 24 live goal/post/bar scenarios across venue ends/formats. Aerial fixtures cover available/covered receivers, offside and cooldown behavior.
- Desktop and phone-width Chromium engine checks pass upper-left, upper-right, post and crossbar cases in all four formats. The shared ball texture is present. These are controlled fixture outcomes, not natural-match frequency measurements.
- Upper-body browser captures cover running → receiving and cut → stop. The analytical response preserves paused pose and is timestep invariant for a held target; actual rig fixtures cover 30/60/120 Hz.
- 96 seeded matches: 24 seeds per format, three simulated minutes each. Outdoor switches occurred; crosses remained occasional; futsal remained ground-focused. No paired pre-change baseline was collected for this pass, so this sample does not establish a balance improvement.

| Format | Goals/game | Shots/game | Crosses/game | Switches/game | Frame contacts/game |
| --- | ---: | ---: | ---: | ---: | ---: |
| Futsal | 4.083 | 31.67 | 0 | 0 | 3.17 |
| 7v7 | 3.750 | 25.92 | .29 | 8.33 | 1.25 |
| 9v9 | 3.750 | 15.13 | 1.08 | 12.75 | .79 |
| 11v11 | 4.042 | 16.21 | .71 | 13.17 | .75 |

## Runtime costs and limits

The upper-body response uses 28 doubles per rig (224 bytes), with cached quaternion helpers for support orientation. Live balls share one static 256×128 texture and use 16×12 sphere geometry. Texture generation occurs once per field runtime, not per frame; there is no extra ball draw call. Goal-frame tests use a broadphase and bounded capsule sweeps with reusable outputs. Aerial choice evaluates plausible targets only when the carrier can act and uses cooldowns. Existing visibility, sleeping, batching and simulation clocks remain.

This remains a lightweight football simulator with authored shot placement, not a general physically simulated character engine. Contact fixtures verify the stated cases, not every possible rebound chain or collision configuration. The follow-up research identifies additional strike-trajectory and transition work; passing tests does not establish human-level biomechanics.

Status: local changes only, not deployed. No physical-phone temperature measurements or thermal-improvement claim.
