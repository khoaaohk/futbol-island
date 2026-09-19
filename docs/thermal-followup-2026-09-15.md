# Thermal follow-up — September 15, 2026

## Implemented locally

The newest rooftop game used six individually rendered character rigs (162 visible meshes). It now uses the established shared player batch path (204 unmerged body parts in 14 batches). Appearance, animations, shadows, shield timing, possession and game rules remain unchanged. A conservative arena visibility envelope pauses unseen, unjoined simulation and uploads; joined games continue regardless of camera direction.

The first batching attempt left per-batch frustum culling disabled and added roughly 44,000 offscreen triangles in the east-side view. This regression was caught and corrected before completion. Each active arena batch now computes its bounding sphere and uses Three's independent main-camera and shadow-camera culling.

## Production-build browser comparison

Baseline was the existing local production build corresponding to the recent deployed code; optimized builds were served separately. Chromium/Metal mobile emulation, 440×760 CSS pixels, actual renderer DPR2, six-second samples after view settling. These are stationary flight views, not an instrumented physical iPhone session or a full moving-route benchmark. NPC/match animation timing differs slightly across runs.

| View | Calls before → final | Triangles before → final | Median render CPU before → final | FPS before → final |
|---|---:|---:|---:|---:|
| North flight, x110/z-140 | 77 → 77 | 141,979 → 141,963 | 1.4 → 1.5 ms | 29.99 → 30.00 |
| Above rooftop, x66/z157 | 412 → 268 | 278,979 → 279,955 | 3.7 → 2.6 ms | 30.00 → 29.99 |
| East of rooftop, x110/z150 | 234 → 236 | 358,703 → 358,795 | 3.2 → 2.4 ms | 30.00 → 29.99 |

Roof-view calls fell about35%. This describes measured renderer submissions, not a percentage reduction in battery usage or temperature. GPU medians also changed (north2.598→1.720ms, roof4.950→2.881ms, east6.792→2.772ms), but the unchanged north control became substantially faster too. Do not attribute the entire GPU delta to this patch; caching/system variability and scene evolution require repeated paired physical-device measurements.

The historical September14 north-flight sample had ~1.6–1.7ms render CPU and2.57–2.67ms GPU. The new north baseline does not demonstrate a broad far-from-cage regression. It cannot identify the user's exact earlier comfortable release or rule out sustained moving-route and device-specific issues.

## Validation and status

Production build passed. `tests/live-knockout-work.cjs` covers batch counts, local transforms, shadows, culling bounds, offscreen sleep, resume, participation continuity and disposal. `tests/rooftop-knockout.cjs` passed. Browser gameplay verified moving-ball collection, fall/recovery, five-second protection, third-hit queue teleport and next-round return. Benchmark script: `/tmp/fi2-thermal-sept15.cjs`; raw before/intermediate/final JSONs are in `/tmp/fi2-thermal-*.json`.

Not deployed. No measured physical-phone temperature or battery result.

## Parallel audits

- [Whole-app performance and staged-loading audit](performance-audit-2026-09-15.md): current-screen/next-content loading, inactive games, previews, live-field allocations and lifecycle checks.
- Rooftop gameplay audit is a separate suggestions-only task; its mechanics recommendations are not silently bundled into this thermal patch.
