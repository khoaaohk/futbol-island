# Player movement and mechanics audit — September 22, 2026

The strongest next improvements are predictable shot charging, precise joystick control, and consistent movement under slow frames. Existing collision, stair, landing and animation tests passed. This audit changes no gameplay behavior.

Scope: exploration player walking/sprinting, ball actions, scooter/bike/moped, truck control, flight, roof travel and landings. Match AI and every arcade game are outside this audit. Source inspection, 13 existing test files, a live Chromium mobile-viewport input check, and isolated numerical probes were used. Browser input used mouse pointer events against the mobile joystick, not a physical thumb. No iPhone thermal or real-device feel claim.

The companion [live match, play and quiz audit](live-player-motion-audit-2026-09-22.md) covers shared body animation, passing, kicking, turning and replay consistency.

## Prioritized findings

| Priority | Finding | Evidence | Recommended improvement |
| --- | --- | --- | --- |
| 1 | Shot behavior changes abruptly just past the tap threshold | `Town.tsx:176,513` and `walkBall.ts:113–114`: any hold over 180 ms produces positive charge, disables directional assistance, changes airborne drag and switches return limits from 2 seconds / 65 m to 9 seconds / 360 m. | Blend assistance, drag and return limits continuously with charge, or introduce a clearly signaled deliberate power-shot threshold. Keep collectible/super-shot behavior available. |
| 2 | Joystick has no neutral dead zone | `Town.tsx:824` maps every pixel directly to input. A 2 px held offset moved the player approximately 0.294 m in 1.5 seconds; steady speed was 0.206 m/s. | Add a small radial dead zone, initially trial 4–5 px, with a continuous remap to full speed. Test delicate steering and diagonal motion on a phone. |
| 3 | Slow frames reduce simulation speed | `Town.tsx:543` caps elapsed time at 0.05 seconds before filling the fixed-step accumulator. At sustained 15 FPS only 0.75 seconds of simulation advances per real second. | Decouple elapsed simulation time from render timing with a bounded catch-up budget. Keep hidden-tab reset and avoid unbounded catch-up work. Align shot-charge timing with the chosen simulation clock. |
| 4 | Vehicle braking/turning feel is inconsistent | `simulation.ts:47–60` damps velocity directly toward the requested direction. Moped velocity reverses sign in 0.117 s; release takes 0.483 s to get below 0.1 m/s and travels 2.10 m. `streetTraffic.ts:73` stops the truck immediately on neutral input. | Trial speed-dependent steering and a short bounded truck braking curve. Preserve immediate walking response and collision stops; avoid making the game cumbersome for realism. |
| 5 | Falls impose long loss of control | `rooftopTravel.ts:8,33–42,59`: one second hanging before falling, then 4.2 seconds recovery for drops over 1.5 m. Total loss of control exceeds 5.2 seconds including fall time. | Scale recovery with drop severity, shorten ordinary falls, and optionally let an intentional input finish getting up after a short minimum. Preserve dramatic feedback for major crashes. |
| 6 | Ordinary dribbling has little touch/weight feedback | `walkBall.ts:23–36,83` attaches the ball about 0.65 m ahead and resets velocity to zero each attached update. The character has gait and kicking animation, but the exploration ball is not driven by individual dribble touches. | Add short controlled touch-and-receive phases: close touches at walking speed and slightly longer touches while sprinting. Use the existing simulation loop and collision queries. This would give exploration a clearer ball-control lesson. |

Priorities 1–3 are reproducible behavior issues. Items 4–6 are design recommendations grounded in implementation; the current arcade feel may be intentional.

## Measurements and implications

Clear-ground synthetic walking at full speed covered 7.40 m over two seconds at 60, 30 and 20 FPS with the current elapsed-time cap, but 5.55 m at 15 FPS and 3.70 m at 10 FPS. This reproduces the cap mathematically; it does not establish that a particular phone currently runs at those rates.

Isolated shot probes, using flat ground and no walls or targets:

| Charge | Approximate corresponding hold | First automatic return, including windup | Maximum distance before return | Peak ball height |
| --- | --- | --- | --- | --- |
| 0 | Up to 180 ms | 2.47 s | 56.77 m | 0.59 m |
| 0.01 | 198 ms | 9.45 s | 127.18 m | 0.73 m |
| 0.5 | 1.08 s | 9.45 s | 291.28 m | 32.96 m |
| 1 | 1.98 s | 9.45 s | 357.01 m | 117.33 m |

The full-charge height is evidence of a deliberately exaggerated exploration mechanic, not by itself a defect. The discontinuity between a tap and a nearly identical short hold is the more actionable issue. A separate controlled ground-pass action would also better support teaching passing weight; that is an optional feature rather than an audit fix.

All shots also have a 0.46 s windup after release (`walkBall.ts:11,102`). Preserve visible foot contact, but consider a shorter windup for light passes while keeping the larger power-shot preparation. Validate this by watching contact timing, not just reducing the constant.

Aim assistance chooses visible targets within roughly 16 degrees and 24 m (`shotAssist.ts:3–10`), with collectible aiming taking precedence. A small target cue during aiming would make this behavior easier to understand. No claim that aim assist is currently broken.

## Existing behavior worth preserving

- Swept movement at 0.15 m increments prevents fast rides tunneling through thin fences; sliding along obstacles is covered.
- Fixed 60 Hz ground ticks and visual interpolation work independently of the normal 30 FPS mobile render cap.
- Distance-driven gait, shortest-angle turning, receive-to-kick blending, ride grips and reduced-motion poses have tests.
- Roof/stair clearance handles mounting close to rails, adjacent taller walls and small raised surfaces.
- Flight checks the offshore boundary, finds safe shore/roof landings and follows moving pickup beds during assisted touchdown.
- Wall juggling has ballistic rebound/receive phases, adaptive wall selection and costume clearance.
- Browser release and window-blur checks reduced velocity to effectively zero. No stuck-input failure was reproduced.
- Existing effects use shared resources and bounded lifetimes. Improvements should retain these properties.

## Validation and reproducibility

Passed: `player-motion`, `travel-modes`, `terrain`, `rooftop-travel`, `ride-stair-pose`, `ride-ramps`, `ball-actions`, `ball-reactions`, `truck-collisions`, `offshore-flight`, `parachute-landing`, `landing-marker`, and `wall-juggle` test files under `tests/`.

Run `node scripts/audit-player-movement.cjs` from the project root to reproduce clear-ground braking, reversal, shot and slow-frame probes. Raw results are in `player-movement-audit-2026-09-22.json`. The one-off browser runner is `/tmp/futbol-movement-audit.cjs`; its recorded measurements are included in that JSON.

Suggested first implementation pass: smooth the shot threshold and add the joystick dead zone. Then address slow-frame timing with explicit catch-up limits and performance measurements. Review steering, recovery and touch-based dribbling separately so their effects on feel can be assessed individually. Physical iPhone testing should cover one-handed precision, multi-touch shooting, direction changes near stairs, and several minutes of travel.
