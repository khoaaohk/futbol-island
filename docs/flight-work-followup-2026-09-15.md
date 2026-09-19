# Flight work follow-up — September 15, 2026

Local implementation, not deployed. Preserve resolution (mobile DPR2), frame target, football teaching and controls.

## Implemented

- Reuse live-field roster/pose/motion data and foot-contact vectors. Reset optional motion fields before reuse; roster replacement invalidates cached rows. Teaching and quiz data stay on their own path.
- Cache two exact traffic tangent samples per route. New routes invalidate by object identity. Synthetic cached/uncached simulations match positions and headings exactly.
- Add junction ownership through turns. Initial tests exposed a pre-existing mutual-blocking turn deadlock, unchanged by the tangent cache. Reservation stops the competing vehicle before entering. Ten-minute synthetic maximum stop4.3s; actual26-node island maximum stop6.07s. All9 vehicles advance. User-driven pickup reentry and overlap recovery tests pass.
- Batch fully visible volleyball characters separately; original merged meshes render at screen edges. The initial all-court batching attempt was rejected because it submitted25,776 extra offscreen triangles in the sampled coastal view. Refined fixture: full court112→62 submissions with identical triangles; edge13→13 with identical triangles. Preserve source picking, shadows, hover pause and reactions.

## Browser comparison

Stationary flight-height28 views, Chromium Metal, viewport440×760, DPR2, ~30FPS. Six-second samples after settling; these are not moving-route or physical-iPhone tests. World simulation states differ slightly between runs.

| View | Before calls / triangles | Refined calls / triangles | Field update median before / after |
|---|---|---|---|
| Field (132,105) | 213 / 233379 | 213 / 233383 | 1.2 / 1.1ms |
| Coast (72,196) | 224 / 266401 | 223 / 266235 | 0.5 / 0.5ms |

GPU timing increased similarly in the unchanged field control and coastal view in the final run; CPU timing changes were small/noisy. Do not claim a GPU timing or thermal improvement from these samples. The reproducible evidence is stable data identity, fewer exact tangent evaluations, full-court submission reduction, preserved edge geometry and no simulated persistent junction deadlocks.

Raw reports: `/tmp/fi2-thermal-flight-savings-before.json`, `/tmp/fi2-thermal-flight-savings-after.json` (rejected all-court attempt), `/tmp/fi2-thermal-flight-savings-final.json`. Physical iPhone comfort still needs equivalent route/duration checks.

## Validation

`tests/live-field-frame.cjs`, `tests/traffic-flow.cjs`, `tests/traffic-separation.cjs`, `tests/volleyball-batch.cjs`, `tests/teaching-contact.cjs`, `tests/quiz-outcomes.cjs`; production build. Browser actual-island traffic fixture `/tmp/fi2-real-traffic-flow.cjs`. Collection replay remains optional; discoveries buttons now have12px spacing and label **Practice idea**.
