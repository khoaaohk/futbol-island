# Flight performance comparison — September 14, 2026

Compared September 13 deployment `dpl_AMTMNmj3YDNrmULTbiEuKSiXgnon` (`futbol-island-2xu2quk45-khoa0aohk.vercel.app`) with September 14 live deployment `dpl_2bHG3PrW34DNtU666CF3XpG44Jw2`.

Authenticated access loaded the protected historical release without changing deployment protection. Both builds were tested sequentially in Chromium on this Mac, with a 440×760 touch viewport, device scale factor 3, default jetpack, altitude 28, identical fixed locations, and settled cameras. Both actually used pixel ratio 2 (880×1520 buffer) and approximately 30 FPS. Older documentation mentioning a 1.5 mobile cap did not describe yesterday's release.

## Release comparison

Average main color-pass draw calls over four-second samples (Three's default info reset excludes the preceding shadow pass):

| Flight view | September 13 | September 14 | Increase |
|---|---:|---:|---:|
| Square (103,-8) | 449 | 508 | 13% |
| Town (103,90) | 337 | 387 | 15% |
| Coast (220,160) | 330 | 384 | 16% |

Scene mesh count increased from 4,598 to 5,370. The newer scene contains additional buildings/terraces, props, hunt objects, vehicles and effects; these counts do not assign the increase to one feature. Desktop submission-time samples varied considerably, so they are not reported as proof of phone GPU or temperature improvement.

## Implemented local improvement

Opaque, static scenery shadow geometry is combined within existing spatial chunks, independent of paint color. Original meshes still render the color image. Temporary proxy visibility and original shadow flags are restored in a finally block after each shadow pass. Transparent, alpha-tested, displaced, clipped and custom-depth materials keep their original path. Mobile only; desktop's existing behavior remains unchanged. No framebuffer copies, synchronous GL queries, lower shadow resolution, reduced FPS or removed scenery.

Same-frame original-versus-optimized renders, with automatic render-info reset disabled to count color AND shadows:

| View | Original calls | Optimized calls | Reduction | Original triangles | Optimized triangles | Changed screenshot pixels |
|---|---:|---:|---:|---:|---:|---:|
| Square | 1,293 | 925 | 28% | 424,280 | 450,341 | 0 |
| Town | 1,022 | 529 | 48% | 837,522 | 856,001 | 0 |
| Coast | 974 | 538 | 45% | 508,422 | 519,881 | 0 |

Grouping adds 2–6% shadow-inclusive triangle work and additional static geometry storage, in exchange for substantially fewer submissions. Pixel parity was exact for these three settled flight views; it is not a universal guarantee for all camera conditions. Moving characters and vehicles retain their normal dynamic shadow path. The previous NPC batching experiment was discarded, and the earlier framebuffer-copy cache remains disabled on mobile.

Also retained the small local flight optimizations: precomputed exhaust colors, trail color changes only on equipment changes, and cached geometry batching keys for match players. Exhaust instance/color buffers match the prior implementation exactly across cruise, boost and stop.

## Validation and limits

Production build and type checks passed. `tests/static-shadow-batches.cjs` checks grouping, transparency fallback, shadow flag restoration including exceptions, disabled path and disposal. `/tmp/fi2-shadow-batch-check.cjs` measured the table above and screenshot parity. `tests/boost-render-work.cjs` passed. Local only; not deployed in this comparison task.

This is a rendering-work reduction, not a measured iPhone thermal fix. Repeat the user's five-minute flight session on the physical iPhone after deployment before concluding the warming is resolved.

## Additional scenery batching pass

Plain, non-emissive palette materials now use linear vertex paint colors and share compatible materials within the same 50 m neighborhood and shadow flag. Material settings are compared with `toJSON`, excluding identity and paint color. Textured surfaces, glowing/animated signs and signal lenses retain their original materials. Non-shadow-casting ground surfaces keep their original batches to preserve layered paving order. No geometry is simplified, and textures, lighting, resolution and FPS settings remain unchanged. Temporary source geometries are disposed after merging as before.

With both improvements enabled, settled mobile flight samples measured total calls of 810 (square), 359 (town), and 358 (coast), versus 925 / 529 / 538 with shadow batching alone: a further 12–33% reduction. Main color-pass averages were 394 / 218 / 203 calls. Shadow-inclusive triangles were 476,708 / 883,802 / 549,424 (about 3–6% more than the shadow-only improvement because larger batches have coarser culling). This tradeoff still needs physical iPhone validation.

A deterministic standalone town render compared the saved prior `world.ts` and new code: identical total 554,832 vertices and 310,417 triangles; mesh count 1,533 → 590. Same seed, camera, sun, shadow settings and canvas were used. Images are not pixel-identical: changed pixels were 0.17–0.49%, with mean RGB differences 0.032–0.068 on the 0–255 scale, concentrated on overlapping surface edges and shadow edges after draw reordering. The full-game shadow-only toggle still produced exact pixel parity in all three views. Browser fixtures and captures: `/tmp/fi2-paint-parity.cjs`, `/tmp/fi2-paint-parity.json`, `/tmp/fi2-paint-{square,town,coast}-{0,1}.png`, `/tmp/fi2-shadow-batch-check.cjs`.

Box break and collection effects now skip all per-frame pool/scene updates once their finite animation lifetime ends. New collections wake the existing pools. `tests/coin-effects.cjs` verifies no scene visibility writes while idle, bounded simultaneous particles, expiration and subsequent restart. These changes remain local until deployment is requested.

## Rigid character transform caching

Character body meshes now compose their fixed local matrices once. Animated joint groups and world matrices still update normally. Costume changes refresh the cached mesh matrices; fixed costume attachment groups also cache their local matrices. No triangle, lighting, shadow, frame-rate or resolution changes.

Mobile Chromium comparison at 440×760, device density 3 (actual render DPR 2), three flight views: toggling body-mesh caching removed 2,440 of 5,260 local matrix compositions per render (46%). Screenshots were byte-identical in all three views; draw calls and triangle counts were identical. `/tmp/fi2-transform-cache.cjs` performs the same-frame comparison. This measures eliminated CPU calculations, not a 46% reduction in overall CPU time or phone temperature. Physical iPhone thermal validation remains necessary.

`tests/player-motion.cjs` verifies cached local and world matrices through body/gender/costume changes and bike, moped, parachute and splat poses. The latest mobile camera framing check (`/tmp/fi2-mobile-center.cjs`) also passed for scooter, bike, moped, flight boost and truck driving: the character's torso stayed within 7% of screen width from center in sampled motion. Desktop camera behavior remains unchanged. These additions are local, not yet deployed.

## Follow-up: off-screen work and scenery tradeoffs

- Island characters outside an expanded camera frustum skip joint posing, activity/ride animation and label painting. Their routines and root positions continue updating. Nearby characters and hit reactions keep their normal path. A conservative sphere includes the body and its projected shadow reach; elevated characters receive a larger margin. Mobile flight checks skipped 1–4 otherwise eligible characters in sampled views. Same-frame on/off renders were pixel-identical with identical draws and triangles (`/tmp/fi2-offscreen-parity.cjs`).
- Static scenery chunks and shadow proxies retain their fixed world matrices. Body joints and moving scenery continue updating normally.
- Pitch polygon classification now runs at most 10 times/second instead of every rendered frame. Prompt exit animations still update each frame, and opening menus hides field entries immediately. Positioned interface elements round to half pixels to avoid tiny redundant style writes. Building/truck prompt tracking stays per-frame for smooth motion. The minimap already uses the earlier memoization/150 ms HUD cadence.
- Tested 25 m scenery chunks versus existing 50 m chunks in a deterministic town scene. Triangles decreased 8–15%, but draw calls increased 74–84% (420→756, 399→733, 417→727). Rejected the smaller chunks; retained 50 m and the established shadow batching. This experiment does not establish physical GPU energy usage; it avoids an unproven regression.

Audio defaults updated to music 4% and effects 50%, with one-time migration and later slider preferences retained. Store keyboard badges are hidden on coarse pointers and viewports up to 600 px; action descriptions remain visible. Changes remain local pending deployment.

## Additional idle work pass (local, not deployed)

- Normal menus now settle for 500 ms before stopping island simulation/rendering, instead of three seconds. Time-of-day changes retain a three-second lighting transition; onboarding remains animated. Resize and appearance changes still invalidate the frozen frame.
- Hidden walking-ball effects stop processing charge/trail geometry during flight. Visible trails retain their existing appearance; inactive charge, ghost and solar-ring transforms are skipped, and ball colors update only when changed.
- Empty disabled exhaust/trail pools return without per-particle work; sonic bursts sleep after their lifetime. Effects restart on activation.
- NPC neighborhood arrays and hover sets are reused, and partner lookups use a persistent map.

Validation: production build, NPC behavior tests, and `tests/idle-flight-effects.cjs` pass. Mobile store browser check observed rendered-frame count unchanged (113 → 113) while open, then advancing to 134 after close.

GPU timer experiment (`EXT_disjoint_timer_query_webgl2`, local Chromium/Metal, mobile 440×760 viewport, existing DPR): freeze a boost frame, render the identical scene under three configurations, discard three warmups and compare 15 samples per configuration. Shadow/effect disabling is test-only and is restored afterward.

| Boost snapshot | Full GPU median | Shadows disabled | Flight effects disabled |
| --- | ---: | ---: | ---: |
| Jetpack, 69 exhaust instances | 3.597 ms | 2.733 ms | 3.545 ms |
| Flying car, 31 trail instances | 4.138 ms | 3.000 ms | 4.166 ms |

These snapshots implicate shadow rendering more strongly than the sampled flight particles. The small particle differences are within measurement noise. They are not sustained iPhone measurements, temperature estimates, or proof of savings on every view. No shadow quality, resolution, frame-rate target, or visible particle count was reduced in this pass.

## Shadow visibility and immediate menu pause follow-up (local)

Implemented conservative scenery shadow-volume culling. A fixed caster's bounds are swept along sunlight to below the lowest island surface, padded by one metre, and checked against the viewer frustum. An off-screen building is retained whenever its shadow volume could enter the view. Original cast flags are restored even after a rendering exception. Character and other dynamic shadow casters are untouched.

Three same-frame mobile browser comparisons produced exact pixel parity:

| View | Original total calls | Culled total calls | Original triangles | Culled triangles |
| --- | ---: | ---: | ---: | ---: |
| Square | 903 | 880 | 498164 | 440192 |
| Town | 340 | 311 | 888746 | 826538 |
| Coast | 337 | 323 | 563454 | 519922 |

Counts include color and shadow passes. This measures these specific views, not all island angles or phone power use.

Reworked the existing stationary shadow cache to restore framebuffer bindings from renderer state without synchronous GL state queries, invalidate on camera changes, and cooperate with scenery batching. Corrected cache passed exact pixel comparisons in all three views. However, a controlled flying-car GPU comparison returned median 7.455 ms normal, 6.790 ms culled, and 10.182 ms cached (15 samples each, local Chromium/Metal). Therefore mobile keeps the cache DISABLED: its full-sized color/depth copies are not justified by this measurement. Desktop retains its existing cache with the correctness/state-query fixes. No mobile shadow-resolution reduction was made.

Normal paused menus now stop the background after the initial frame that clears controls and movement audio, with no 500 ms grace. Lighting changes retain their transition window, and onboarding remains animated. Closing menus resumes the island.

Validation: `tests/shadow-visibility.cjs` checks distant rejection, retained off-screen shadows, and restoration after errors; existing shadow-batching tests pass. Browser scripts `/tmp/fi2-shadow-cache-parity.cjs`, `/tmp/fi2-culling-parity.cjs`, `/tmp/fi2-gpu-cache.cjs`, and `/tmp/fi2-menu-idle.cjs` cover visual parity, GPU comparison, and menu resume.

## Match, ball-collision, audio and preview pass (local)

- Distant, unseen live matches accumulate approximately 100 ms between simulation updates. Visible, selected and nearby matches remain immediate. MatchSim still subdivides elapsed time into safe steps (at most 34 ms); accumulated time is retained, not discarded, and pauses do not accrue extra time. Teaching and quizzes retain their original update path. Distant simulation positions can now refresh in batches while unseen, so outcomes are not promised to be bit-identical to the old time partitioning.
- Walking/landing/truck movement already had spatial collision grids. Added grids to the remaining ball wall/ground/roof collision paths and replaced repeated building-array searches with footprint lookups. Dynamic/breakable boxes retain live footprints through the existing grid behavior. Aim checks retain full-range reach.
- Existing idle travel voices already stopped when inactive. Zero-volume effects now also stop existing sources and skip creation of silent sources. The shared audio context stays running for music; raising the effects slider resumes sounds normally.
- Character previews already disposed their renderer on close and paused when offscreen. Their draw function now rejects hidden resize draws and only reapplies appearance/background colors when customization changes.

Checks: production build and `tests/match-update-clock.cjs`, `tests/engine-voice-reuse.cjs`, `tests/obstacle-grid.cjs` passed. The clock test reduced 300 distant update opportunities to 100 calls with elapsed time preserved. A 2.5-second mobile browser sample observed 23 calls each for distant futsal/9v9 matches versus 75 for visible 7v7 and nearby 11v11; this is call frequency, not a measured percentage reduction in total CPU or heat. Browser preview-close test confirmed renderer canvas removal and no runtime errors. Physical iPhone thermal testing remains outstanding.

## Movement-only profiling follow-up

Compared 4-second hover, movement, and boost samples in local Chromium mobile emulation using the DevTools CPU sampler (`/tmp/fi2-moving-profile.cjs`). These were development builds and moving routes expose different scenery; the data cannot quantify iPhone GPU power or establish a causal thermal difference.

The largest named JavaScript costs in all three samples were Three.js world-transform updates, matrix multiplication, and scene projection. `updateMatrixWorld` sampled 174 ms hover, 164 ms moving, 158 ms boost; no obvious boost-specific JavaScript spike appeared in this short sample. Moving samples additionally surfaced React element creation and minimap/UI work. Town updates position state every 150 ms, causing the large HUD component to render during movement. Recommended next controlled experiment: isolate the moving map marker/location display from the rest of the Town UI, and compare production GPU/rendering cost on the same view. Do not present these development CPU samples as proof that particles, rendering, or device heating are solved.

The new conversational match-news requests occur only when opening a participating character's chat and share a five-minute cached response; no news fetching was added to movement or animation loops.

## Independent position HUD and hidden-transform updates (local production build)

Implemented a small position store consumed by the moving minimap and open full map. Position changes no longer set state on the entire Town component. Town still updates when the field/square layout zone changes, and the Settings learning action reads the latest position directly. Closed/minimized maps unsubscribe and get the current snapshot when reopened. Removed an unused movement state that also triggered Town renders.

During the renderer's scene refresh, registered hidden groups skip their transform subtrees. Explicit rig/bounds updates are preserved. A group which was skipped forces a complete refresh when visible again, including parent movement that happened while hidden. This does not cull visible objects, lower resolution, alter materials, or reduce particles. Newly created groups without registration use Three's normal update behavior.

Same-frame production comparisons, with identical pixel output and matching draw/triangle counts:

| View | Normal local matrix compositions | Hidden-group skipping | Hidden groups skipped |
| --- | ---: | ---: | ---: |
| Square | 2820 | 817 | 135 |
| Town | 2820 | 627 | 116 |
| Coast | 2820 | 643 | 119 |

These are local matrix-compose counts, not total transform cost or percentages of heat saved.

Controlled local production comparison (Next start on 8093, Chromium/Metal, 440×760 CSS pixels, actual DPR 2, unchanged 30 FPS target). Ten seconds hovering and ten seconds flying back and forth near x110/z-140; 100/99 asynchronously collected GPU timer samples. Camera movement necessarily changes some visible geometry, so this is a representative same-area comparison, not pixel-identical GPU workloads.

| Mode | FPS | Median render CPU | Median GPU | 95th percentile frame interval | Town renders |
| --- | ---: | ---: | ---: | ---: | ---: |
| Hover | 29.997 | 1.600 ms | 2.572 ms | 34.8 ms | 0 |
| Moving | 29.695 | 1.700 ms | 2.673 ms | 34.7 ms | 10 |

Movement still causes meaningful HUD changes such as entering/leaving a field region, but coordinate updates only reach the map consumers. Both minimap and full-map opening-position checks pass. No large GPU spike appeared in this short local comparison; this is not a sustained physical iPhone temperature or power test.

Validation: production build; `tests/position-store.cjs`; `tests/hidden-transform-gate.cjs` (hidden work skipped, parent movement respected on reveal, explicit hidden updates, restoration); `/tmp/fi2-hidden-parity.cjs`; `/tmp/fi2-production-motion.cjs`. Changes are not deployed.

## Character drawing and movement work follow-up (local, not deployed)

- Merged invariant same-material meshes on each character's head, knees and elbows. Seven fewer meshes per rig; triangles, animated joints, colors and independent clothing/hair switches are preserved. Merged meshes retain player picking metadata. Geometry tests compare both versions across male, female, captain and explorer rigs, including movement; small Float32 rounding differences are allowed.
- Traffic caches arc-length route positions at 20 cm sample spacing, rebuilding only on route changes, including return from free driving. Samples write into reusable vectors. Original curve tangents retain steering headings. The synthetic curved/straight route test measured a maximum position difference of 0.05055 m; this is approximate positional sampling, not exact pixel parity.
- Traffic yielding rejects cars beyond an eight-metre radius before detailed tests. Ordinary cars over 100 m away check yielding at 10 Hz. All car positions continue advancing every frame; pickups, nearby traffic, controlled trucks and road-return logic keep immediate updates. Player physics remains at 60 Hz. This implements the distant-decision portion of the simulation recommendation without reducing movement precision.
- Field projection uses reusable clipping vectors instead of arrays/cloned vectors per field check. Compared against the previous algorithm over 1,000 views with matching selection scores. Building entry selection uses a single nearest-candidate scan instead of filter/sort allocations.

Validation: production build; player motion, NPC behavior, ball actions, ramps and movement-work tests passed. A local production browser at 440×760/DPR 2 rendered 120 frames in a four-second sample; traffic performed 678 yielding scans and deferred 402 of 1,080 opportunities (37.2% fewer scans in that view). Both pickup trucks accepted an offset landing and stayed attached while driven, with no fall state or JavaScript errors. These are work counts and local browser checks, not measured iPhone temperature or battery improvements.

## Match batching correction, upload caching and joystick bounds (local)

Follow-up review found that merging joints per character introduced unique geometry UUIDs into the shared match renderer: 22 players increased from 10 to 118 batches. This was missed by the per-rig geometry checks. Field and coach-practice rigs now disable per-rig merging; individual island/preview rigs retain it. The new multi-player regression test verifies 22 players / 10 active batches.

Instance colors compare Float32 slot values before writing/uploading. Stable colors do not increment their buffer version; reordered colors update the dirty range. Empty batches skip uploads. Matrix updates continue for animated players. Tests cover reorder, hidden batches and reappearance.

Both island and Breakaway joystick rectangles now cache for a gesture and invalidate on new gesture/release, resize, orientation and viewport/scroll changes. Native gesture blockers remain mounted at the correct lifecycle point.

Production build, movement-work, player-batch and engine-voice-reuse checks pass. The walkthrough button container is unboxed. Jetpack startup and sustained hum are softer and more electronic using the same two reusable voices and existing parameter cadence. No deployment or new physical-device heat measurement was performed.

Joystick browser verification passed: 30 movement events used one layout read, and resize triggered one fresh read. Double-tap/hold, cancellation, blur/pagehide and second-finger tip dismissal also passed in mobile Chromium. This does not substitute for physical iOS magnifier validation.

User requested further jetpack subtlety: base hum gain lowered from .016 to .009, upper harmonic from .0045 to .002, and startup gains from .021/.007 to .012/.003 with gentler pitch rises. Master effects preference is unchanged.

## Truck overlap recovery (local)

Vehicle collision checks now use padded oriented footprints for car-to-car contact. Free driving and autonomous route advances reject new intersections but permit movement out of an existing overlap when it does not deepen penetration and increases separation. Overlapping cars can pull apart instead of yielding forever; truck passengers are excluded from pedestrian-stop logic. Static obstacle checks remain enforced. Nearby rejection precedes detailed overlap checks, with reusable footprint scratch objects.

`tests/traffic-separation.cjs` covers reverse escape, forward departure, exact overlap, blocked new overlaps and rotated cases. Browser overlap fixture: truck moved from z=-120 to -126.46 while the leading car moved from -117 to -111.26. Both pickup landings/driving and the build passed. The fixture checks recovery, not every possible traffic jam.
