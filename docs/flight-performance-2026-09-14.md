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

## September19 continuation: grip/pose correctness and light settling

Ground-riding arm IK now targets the rendered1.12-scaled handlebars for scooter and bike, as it already did for moped. Walking resets shoulder yaw inherited from flight. Lighting finishes its tiny interpolation tail at2.9seconds within existing menu render grace; no extra frame, geometry, light or animation loop. Existing targeted suites pass;1280desktop and390touch-emulated browser checks verify landing, stationary hand alignment and lighting/menu sleep. Evidence and limits are documented in `character-vehicle-audit-2026-09-19.md` and `night-lighting-2026-09-19.md`. Local, not deployed; no thermal inference.

### September 22 follow-up — ground-foot articulation

Local shared-player change: full parent-rotation compensation keeps support soles level during wide stances and hip banking; squared-sine swing height eases foot lift/landing without lowering peak clearance. Baseline controlled shuffle/ready fixtures measured 27.58°/14.57° unintended lateral sole tilt; corrected fixtures are level to floating-point precision. Runtime adds three cached rotation objects per rig and bounded per-foot arithmetic only. Existing instancing remains 22 actors / 10 batches; body, contact, ride/flight and seam regressions and production build pass. Browser checks exercise four live formats and desktop/390px teaching poses. Not deployed. No GPU timing or real-device temperature claim.

### September 22 follow-up — upper-body continuity

Added bounded damped response to chest/arm/head poses, leaving hip support and ball contact immediate. Fixed cost: 28 doubles per rig and 14 scalar channels per existing visible pose update, no new render loops/allocations per frame. At 60 Hz the controlled transition fixture's maximum joint step decreased .476 -> .147 rad and angular acceleration 1,542 -> 182 rad/s², retaining 92% arm excursion. Held-target integration agrees across 30/60/120 Hz. Pose/contact/ride/batch regressions and production build pass. Desktop/phone-width close-up captures cover run/receive and cut/stop; live browser checks cover four formats. Local, not deployed; no real-device thermal measurement.
# September 22 follow-up — football engine and research (local)

Completed the accumulated motion/ball pass: dribble clearance, upper-corner shots, swept goal-frame rebound contacts, shared patterned live balls with distance-based spin, stronger cut/body response, and receiver-arrival-based high crosses/switches. Final production build passes (home route 462 kB, first-load JS 550 kB). Default tests and focused ball/body/engine regressions pass; controlled desktop and phone-width browser checks cover both upper corners and post/bar outcomes in all four formats. The 96 seeded-match sample and bounded runtime costs are documented in `game-engine-upgrade-2026-09-22.md`; it is not a paired baseline comparison. No deployment or physical-phone thermal result.

The subsequent body-motion research is in `body-movement-research-2026-09-22.md`, including the current strike curve's zero forward target velocity at contact, candidate improvements and verified source/licensing distinctions. No external motion data or runtime library was imported.

### September 22 — contact mechanics, anticipation and reference motion (local)

The next shared-rig pass replaces zero-speed strike contact with forward-through-impact pass/shot/loft curves and a cached analytical 3D striking-leg solve. Desired travel prepares cuts/stops; retreat gradually opens into chase. Transition-only upper-body inertialization preserves full gait excursion. Small offline CMU run/kick curves add restrained upper-body accents; procedural support and ball contacts remain authoritative. Source terms and the estimated contact-frame limitation are documented in `body-mechanics/motion-reference-provenance.md`.

Fixed buffers now total 768 bytes per rig (672 response + 96 reference), plus cached solver scratch objects. Bounded curve sampling and strike-only solving add no meshes, render loops, runtime parsing or per-frame helper allocations. Batching stays 22 players / 10 batches. Controlled contact, body, seam, pause, teaching, ride and game-engine regressions pass, as do desktop/phone-width technique browser checks. The new response retains more arm excursion but has higher peak acceleration than the previous continuous spring; measured comparisons are in `body-movement-implementation-2026-09-22.md`. Local only, no physical-phone thermal claim.


### September 22 — five story voices and subtle bottle surf (local)

The explicit voice-replacement request covers all 22 riso stories: 114 chapter clips plus the three continuous films (Futsl, Grit, Regulating Emotions). Offline ElevenLabs synthesis uses all five supplied voice IDs; 117 successful requests contain 18,722 input characters and report a summed character-cost header of 10,304 units (not a currency amount; subscription-read permission is unavailable). New AAC assets have content-hashed URLs; original recordings remain available for rollback. No API credential, voice model or synthesis request enters the client.

A small narration adapter maps new media times onto the existing authored art clock, with chapter phrase anchors and continuous-film caption anchors. Captions, headlines and chapter-seek boundaries follow the replacement audio. Playback retains one audio element and the existing sleeping canvas loop. A chapter keeps its previous reflection length when possible and gives the final painted passage .65 seconds; longer speech extends it rather than speeding it up. Unit tests cover invertible timing, original text, chapter seam endpoints and track caption/headline boundaries. The seam-review tool now loads the adapter.

Bottle ambience uses a cached 16-second mono surf buffer with three asymmetric breaking/receding waves, a 180 Hz rumble cut, restrained foam and .22 source gain. Envelope controls are generated at 100 Hz outside the sample loop; playback adds no timers or network requests. Fade-in is 1.8 seconds; closing, mute, zero volume, page-hidden and disposal behavior are preserved. Buffer work/size are bounded (about 3 MB at 48 kHz), with no new buffer on reopening. Tests verify distinct crests and quiet gaps, no clipping, zero loop endpoints and lifecycle/cache reuse. See `story-production/ELEVENLABS-2026-09-22.md` and its JSON provenance. Local only; no physical-phone temperature measurement.

Browser validation for the completed narration set: all 22 stories pass at 390×850 and 1440×850 (44 views), checking playback, seeking, pause/sleep and source cleanup. The futsal track also passes 320×568 and 844×390, with touch feedback and transcript controls checked across all four viewports. Visible title corrected to “Love Futsal”; internal story ID remains `futsl`.

Final validation: production build passes (home route 473 kB; first-load JS 561 kB). The prior engine-pass build was 462/550 kB; this working-tree build includes the motion/reference and narration changes. All 22 adapted stories pass the seam review (117 boundaries, 1,060 samples, zero pixel differences/draw errors). Live browser verification confirms the “Love Futsal” heading, replacement media URL, advancing playback and release on close. Default town tests and narration/movement regressions pass. Local only; not deployed.

### September 22 follow-up — narration pace and Paths particles (local)

Slower recordings now receive offline, pitch-preserving FFmpeg `atempo` processing, with one rate per story derived from its source narration timing and capped at 1.20. Already brisk stories keep rate 1.0. New content-hashed files are made directly from cached original MP3s; no further ElevenLabs calls or credits were used. Character/caption anchors are scaled by the same tempo. Chapter duration now follows actual processed media plus the existing .65-second painted transition instead of preserving old silent reflection padding. Example total durations: Love Futsal 78.7 → 72.5 seconds; Kite 90.2 → 75.9; Quiet Lantern 82.2 → 69.3; Mental Toughness 84.8 → 71.3. A Place in the Picture keeps its speech speed but loses excess chapter padding (60.0 → 52.1 seconds). No voice or script changes. This supersedes the prior reflection-padding policy.

The top-left Paths button reuses its two CSS particle layers for a staggered 4.8-second loop, with four dots per layer and .82 peak opacity (increased after user review). Only opacity/transform animate; no JS frame loop, canvas, timer, network asset or new React state. A visibility listener pauses the layers on hidden pages, and CSS pauses them behind any open dialog. Reduced motion disables the effect. The learning purpose is to keep the route to lessons, quizzes and stories discoverable. No physical-phone thermal claim.

Narration mapping and installed media checks pass for all22 stories, including the .65-second chapter-tail constraint. Adapted visual seam review passes all22 stories with zero seam differences or draw errors. Browser/build results follow below.

Pacing/particle final checks: six representative live story views pass (Futsal, Kite, Place in the Picture at 390×850 and 1440×850). Particle browser checks pass continuous movement, modal pause/resume and reduced-motion suppression, including the brighter user-requested treatment. Production build passes at 473 kB home / 561 kB first-load JS. No deployment.

### September 22 — remove floodlights from plays and quizzes (local)

Isolated learning views now hide the floodlight poles and lamp banks and immediately set the four pooled spotlights to zero intensity. Existing ambient/day-night fill keeps the teaching field readable. Fixtures and normal pitch selection restore when returning to island exploration. Visibility changes touch a cached fixture list only on entry/exit; no new objects, timers or render loops, and the stable shader light count is preserved. This clears visual obstructions around instructional plays and quizzes. All-format day/night isolation, restoration, resource disposal and lighting-idle checks pass; production build passes. Local only, not deployed; no phone thermal measurement.

### September 22 — football quotes and sound-driven bottle water (local)

Daily bottle messages now rotate through ten short, sourced quotations from football players and coaches. Each note shows the speaker, role and a keyboard-accessible source link. Wording follows the linked publisher's English text; the catalog is `lib/content/bottleQuotes.ts`. Dates retain local-calendar selection and repeat consistently within a day. The purpose is encouragement through football, teamwork, persistence and enjoyment. The quotes are static bundled content, with no external requests until a source link is opened.

The existing 24 fps water canvas now samples the same 16-second swell envelope used to synthesize the ocean audio, driven by the active audio context's source clock. With sound unavailable/muted it uses a local visual clock. Wave height increases with each breaking wash. Bottle displacement and rocking use spring buoyancy, lateral restoring force and drag, integrated with bounded 1/120-second substeps (at most10 per draw). The old independent repeating CSS drift is replaced; the entrance/opening animation remains. Audio shares its clock only while its ocean source is alive, and ordinary UI sounds cannot overwrite it.

Added cost: one cached swell object, six scalar physics values, bounded arithmetic and two CSS transform-property writes per existing draw; no new RAF loop, physics dependency, analyser node, canvas, raycast or per-frame React update. A cached React ref avoids DOM queries in the drawing loop. Page hiding resets integration timing and suspends rendering/audio; reduced motion disables bottle displacement and travelling waves. Focus trapping includes the new source link.

Checks pass acoustic/lifecycle regressions, sound-clock ownership and cleanup, physics bounds/paused state at24/60/120Hz, and mobile Chromium quote/source/focus/close checks with animation on and reduced motion. All sourced excerpts are at most25words per linked article. Local only; no physical-phone thermal measurement.

Bottle follow-up: the bottle now travels across the full viewport, makes full rotations and receives angular impulses on rebounds. Collision bounds follow its rotated dimensions with no inset margin; the SVG viewBox is cropped around the bottle so unused canvas space does not cause premature bounces. Mobile motion (≤600px) is 40% faster. Hover/keyboard focus holds it for opening. Bounds are read once per resize; a few trigonometric/scalar operations keep it onscreen each existing24fps tick. Compact320×568 browser sampling confirms visible edge contact, repeated rebounds and no clipping. Physics fixtures confirm more mobile rebounds at equal bounds. The earlier centered spring-drift description is superseded by this screen-space current/drag motion.

Female appearance follow-up: hide the Coast outfit's cream chest stripe on female characters, including previews, using the existing appearance update. No new resources or frame work.

Final build passes (home474kB, first-load562kB), with existing player/costume/ride regressions passing after the female outfit correction. Bottle source-clock, audio lifecycle, mobile edge-bounce and reduced-motion checks pass. Local only; not deployed.

Bottle edge/reveal correction: collisions now project the glass outline and cork corners (including stroke) into screen space at the actual rotation, rather than using the SVG rectangle. This removes transparent-corner gaps during diagonal spins. The fixed16-point hull is checked during bounded physics substeps without allocations or layout reads. Tests cover exact painted-edge contact at six rotations. The tap-to-message delay is140ms (was360ms), followed by a240ms fade (was550ms); reduced motion remains immediate.

Resize follow-up: refresh the wave background origin/width and cached bottle bounds on canvas resize, and reset integration timing. Browser checks pass mobile → 1440×900 desktop → 844×390 landscape → 320×568 → 390×850, both while drifting and with the quote open. Painted bottle bounds stay inside the viewport; canvas size, quote width, Done control, restored desktop HUD and page-error checks pass. Background measurements run only on resize; no new animation loop. Local browser coverage, not a physical-device test.

Live futsal pace / aerial readability: futsal uses a 0.48 live clock (was 0.32), with the same clock applied to simulation, vertical ball physics, rendered travel/dribble speed and real-time kick recovery. Other formats stay at 0.32. Futsal AI and player shots receive a further 1.3 velocity multiplier. Purple (#b877ff) now identifies lofted live passes/crosses/switches; shots retain their existing tint. No new geometry, particles, loops or allocations; futsal advances more simulation time and can require additional bounded substeps when updates are batched. Existing distant throttling is retained. Field-contact checks cover each format’s elapsed time and consistent recovery. Live-effects checks pass all formats; goal-frame/upper-finish checks pass with the new futsal clock, plus ball-physics and match-clock regressions. Local only; no physical-phone thermal measurement or deployment.

Goal-frame impact cue: live post/crossbar collisions record the surface contact and trigger a warm, 420 ms ring with eight small fading sparks, anchored to the frame after rebound. Two pooled bursts per match reuse geometry/materials; each active burst adds two draw calls (ring plus instanced sparks), with no lights, textures, new animation loop or per-frame allocations. Idle bursts skip work, hidden impacts are consumed without replay, pause freezes age, and reduced motion uses a stationary 180 ms ring without sparks. Checks pass all-format impact lifecycle, rooftop coordinates, goals/frame rebounds, and a browser-rendered futsal impact with no page errors. Production build passes (home475kB / first-load563kB). Local only; no deployment or physical-phone thermal claim.

Paths HUD icon cycle: the existing button now cycles bolt → storybook → play every three seconds, with a brief shake and up to 2px blur confined to the 24px symbol. Three existing SVG icons use CSS animation; no timers, React updates or animation loop. Animations pause with document hiding or an open dialog; reduced motion keeps the bolt static. Existing surrounding particles and button behavior remain. Browser checks pass sequence/repeat, shake/blur, dialog pause, reduced motion and no page errors. Local only; no measured phone-heat claim.

Paths icon refinement: the whole button now shakes briefly (±2px / ±5°) before the inner icon blurs and swaps. The nine-second icon sequence stays synchronized with a three-second button animation. The button animation also pauses behind dialogs/on page hide and is disabled for reduced motion. Browser sequence, button-transform, icon-blur and accessibility checks pass. No JS timers or additional loops; local only.

Onboarding Find your path: restored the original lesson paragraph (stories remain in the colored note). The note symbol now cycles bolt → open book → play with the Paths shake/blur timing. Three existing 28px SVGs animate only on this open step; leaving removes the animated icons, page hiding pauses them, and reduced motion leaves a static bolt. No added timers or frame loop. Browser checks pass restored copy, order/repeat, shake/blur, reduced motion and cleanup. Local only.

Production release — September 22, 2026: deployed the current working tree as dpl_7nrGrrPzMDBPuBTjxV9T7ihk7N54 (https://futbol-island-n4ieab7w0-khoa0aohk.vercel.app), aliased to https://futbolisland.app. Vercel build passed (home477kB / first-load565kB). Live mobile-width Chromium check passed restored onboarding copy, bolt/book/play cycling, shake/blur, reduced motion, cleanup, four initialized live formats and frame-impact effect presence, with no page errors. Updated Love Futsal narration returned HTTP200. Earlier local-only notes describe historical checkpoints; these changes are now deployed. No physical-phone thermal measurement.

Post-release onboarding fit: step 2 now uses up to 460px height on narrow phones and a wider, two-column card on short landscape viewports. Compact padding preserves 14px body copy and navigation targets. Existing viewport/gap placement is reused; no additional observers or loops. Browser checks show zero body overflow at 320×568, 360×640, 375×667, 390×844, 430×932, 667×375 and 844×390. This follow-up is local and not part of deployment dpl_7nrGrrPzMDBPuBTjxV9T7ihk7N54.

Mobile interaction follow-up (local, after September 22 production release):
- Path chooser retains a fixed 100px mobile / 120px desktop layout slot while its cards compact over160ms. Cached docking boundaries are recomputed on layout changes; passive scrolling compares scrollTop, with2px hysteresis, without per-scroll DOM geometry reads or RAF. The bounded local card animation no longer shifts the long illustrated path. Dock/undock and tap/swipe selection sounds reuse the gesture-unlocked island audio context, its volume/mute rules, cooldown and cleanup; no new AudioContext per scroll cue.
- Story loading leaves the existing path visible until the module is ready; the title/loading card is removed, with retry/close still available for genuine load failures. The player owns focus/inert state after mounting. Phones use180ms entry and160ms exit fades instead of the1.85s printed circle entry/.78s exit. Story Done skips the shared240ms navigation delay and closing stops playback without repainting an expensive final frame. Identical resize/initial visibility callbacks no longer redraw the same opening frame.
- Mobile captions paginate into two measured lines, retaining every word and the full Read transcript. Pages advance proportionally within the existing narration paragraph timing (not word-level forced alignment). Canvas text measurement runs only for changed text, font or width, not per playback tick. Existing250ms clock updates drive page selection; the caption height stays two lines. Desktop retains full paragraphs.
- Desktop Land on truck remains visible with the field Go card, aligned under Go with12px clearance. Bounds are cached by viewport/field and measured when the candidate appears, not every frame. Mobile prompt precedence remains.
- Foundation top lowered from-.12m to-.18m, increasing clearance under the-.112m lawn from8mm to68mm to address depth fighting at shallow airborne views. Lawn, road, shoreline, camera, shadows and mesh counts are unchanged. Browser comparisons cover the north-coast flight view; this is not a physical-iPhone verification.
Validation so far: stable path offset through docking; shared dock/undock/selection audio; two-line caption samples and complete-word/timing fixtures; both chapter and track story opening/closing; desktop truck clearance at800/1280px; field lighting/disposal and audio regressions. Different Tides passes playback, touch, sleep, transcript focus and audio cleanup at390×850,320×568,844×390 and1440×850. Typecheck and diff checks pass. These follow-up changes are not deployed.

Final follow-up verification: all22stories pass at mobile390×850 and desktop1440×850 (44views), including two-line mobile captions, playback, chapter seeking and cleanup. Four-size Different Tides lifecycle/touch checks also pass. Production build passes (home476kB / first-load564kB). Shared-player Done now starts closing immediately rather than waiting240ms for button navigation animation. These changes remain local; deployment dpl_7nrGrrPzMDBPuBTjxV9T7ihk7N54 is still the earlier release.

Production follow-up release — September 22, 2026: dpl_CZCHGRnDi3pBNZuE8whRt3bWLPsz, https://futbol-island-jt7z0phg0-khoa0aohk.vercel.app, is READY and aliased to https://futbolisland.app. Vercel build passed (home478kB / first-load566kB). Live mobile-browser verification passed stable dock layout, shared dock/undock/format sound cues, removal of the loading screen, two-line captions, chapter/track story transitions, restored path interaction and grass/foundation clearance. Done-to-removal measured175ms in this Chromium check for Different Tides and Love Futsal. All local follow-up changes above, including onboarding fit and desktop truck prompt spacing, are now deployed. Physical-iPhone grass/scroll smoothness remains a device check, not established by emulation.


### September 22 — path painting and story background work (local)

The phone report showed blank/cut-off path artwork during scrolling and heating during stories. The long map was one 3824–4024px SVG plus a full-height multiply grain layer. It now uses independent chapter SVGs (largest 1230px in all four paths), short connecting-road SVGs and 512px grain strips. Filter seeds, coordinates, textures, stops, typography and the overall map dimensions remain intact. No delayed mounting/scroll observer or extra requests; the bounded sections let the browser rasterize smaller surfaces. This adds 19–20 SVG roots and 8 grain elements per path instead of one large SVG/pseudo-element. Browser screenshots retain the artwork, but real-iPhone blank-tile behavior still needs verification.

A local 390×844 Chromium profile of Love Futsal confirmed the island renderer stayed frozen while the story played, but the covered journey sun/ball/flag and logo animations kept running. Those animations now pause while a riso story exists and resume on close. The story tray now measures via ResizeObserver only when its dimensions change. A direct-child MutationObserver reconnects that observer when Read mode replaces/restores the tray; headline and clock text no longer trigger geometry reads. Narration, scene drawing, 24fps cap and DPR 1.5 remain unchanged.

Eight-second before/after sample: world renders 119→119 in both; story draws 161 vs 160; ongoing tray bounds reads 20→0; running background animations 5→0; layout passes 491→13; layout time 57.6ms→3.6ms; style recalc 82.3ms→9.3ms; main-thread TaskDuration 949ms→654ms. Script time was noisier/increased 314ms→436ms, so these are local samples, not a universal speedup or a measured phone-temperature reduction. No GPU power/physical-phone measurement.

All-format scroll checks preserve 17/18 stops and map height; before/after screenshots visually reviewed. Largest sampled RAF gap~20ms before/~17ms after on this desktop; not an iOS smoothness claim. Caption fixtures, typecheck and diff checks pass. All 22 stories pass mobile/desktop playback, seeking, captions, pause and cleanup (44 views). Different Tides additionally passes touch bursts, sleeping playback, Read/return focus and audio cleanup at 390×850, 320×568, 844×390 and 1440×850. Production build passes (home 476kB / first load 564kB). Story drawing and seam code were not modified. Local only, not deployed.

Deployment verification follow-up: production mobile checks exposed the nearby field lesson prompt’s `learnEntryPulse` behind stories (depends on the player’s initial field position). Pause that prompt’s CSS animations while `[data-riso-story]` is mounted; resume automatically on close. No timers, observers or rendering-quality changes. Publishing this additional correction with the path/story performance release.

Production performance release — September 22, 2026: dpl_Cz2YyzDPpfYrpGgqeyLf3832pngT is READY at https://futbol-island-gutc9rlxf-khoa0aohk.vercel.app and aliased to https://futbolisland.app. Vercel build passes (home 478kB / first load 567kB). Live mobile Chromium checks pass all four bounded path maps (largest SVG 1230px), active story playback with the world frozen (122 renders unchanged while story draws advanced 46→106), no running background animations, explicit field-prompt pause, paused canvas sleep, Read/return and closing, with no page errors. This includes the field-prompt CSS correction caught during the first deployment check; it supersedes dpl_J5dPbTHBhfpsAn4UAz2aq6Ly9UDq. Phone scrolling and temperature still require physical-device verification.


### September 23 — mobile path rasterization, format navigation and narration buffering (local)

The physical-phone report persisted after SVG splitting. Chapter backgrounds now use pre-rendered copies of the existing filtered SVG artwork, at 2× resolution for mobile and desktop. The browser no longer executes chapter turbulence/displacement filters while scrolling. All four current-path images load eagerly and request decode on mounting; identical assets are content-hashed and shared across formats. There are 16 unique WebP assets, about 4.5MB on disk, with about 902KB transferred for a cold Futsal mobile map. This trades a bounded image download/decoded-image memory for procedural filter work. Other formats reuse matching assets; only the active format’s four backgrounds are mounted. Headings, roads and lesson controls remain live accessible DOM. The generator is `scripts/bake-path-art.mjs`; dev-only localStorage `fi2-path-art-source=true` exposes the source SVG for regeneration. A manifest geometry check falls back to source SVG if lesson layout changes until regenerated. No runtime image conversion or new animation loop. Physical iPhone scrolling still needs verification.

Settings resets its scroll body after showModal as well as on opening, avoiding the browser’s restored scroll position. Format changes slide the outgoing map 35% over240ms and the incoming map from55% over480ms; reduced motion switches immediately. One cancellable Web Animation operates on the current map, with no duplicate path tree. Switching from deep in a map returns to its start below the selector. Horizontal single-touch swipes use the same directional shared-context sound cue as taps; vertical movement, touch cancellation and accidental clicks after a swipe are handled. Pinned mobile format tabs now paint an opaque textured cover up through the header gap, hiding scrolled lesson content behind the title/navigation.

Chapter narration prefetches one next clip after the current clip starts playing. A single fetch/blob lookahead feeds the existing Audio element, with cancellation on seek/close, blob revocation, deduplication and network fallback. No second player, whole-catalog preload, extra ElevenLabs generation or polling. The visual clock waits with a buffering narration rather than advancing and snapping back; genuinely failed/missing narration retains silent playback. Repeated identical-time story frames are skipped during buffering, while touch feedback remains active. Track-mode stories retain their one continuous source.

Validation so far: all22stories pass mobile/desktop playback, captions, seeking, pause and cleanup (44 views); dedicated delayed-network browser check passes initial-audio hold, next-clip fetch during playback, cached blob playback and cleanup. Mobile browser checks pass settings reopen at scrollTop0, four baked backgrounds/no chapter filters in all formats, swipes in both directions, vertical-scroll rejection and sound cues. Screenshot confirms opaque mobile navigation cover. Narration-buffer lifecycle fixtures and typecheck pass. Four-viewport Different Tides lifecycle checks also pass, including touch, Read/return and audio cleanup. Final navigation refinements are recorded below. Local only, not deployed.

September 23 navigation refinements: the incoming path waits for its requested artwork to decode while the current path remains visible, then slides/fades in over480ms after a240ms exit. Removed content-column overflow clipping; the viewport is the outer boundary. Visible road segments draw top-to-bottom from180–640ms into entry, using their existing SVG strokes and finite dash-offset animations. Visible stops begin at700ms, one every280ms with240ms settling animations, so they do not overlap. Offscreen stops remain settled; no delayed full-map reveal or scroll animation loop. Each onscreen stop gets one85ms soft sine pop through the existing island audio context, honoring mute/volume/visibility. Animations, stroke overrides and sound timers are cancelled on new selection, story opening or unmount. Reduced motion switches immediately without the reveal sequence.

The opaque pinned cover now applies to mobile and desktop and follows the actual button row rather than its larger layout slot. A14px feather and an18px-high,3px backdrop-blur strip sit immediately below the buttons. The small strip adds bounded compositor work during scrolling; it replaces the distracting hard edge/empty gap without revealing content behind the title. The cover uses the existing backdrop. Removed visible chapter headings “Find your unit and receive” and “Find your connection”; lesson content and progress remain intact.

Final desktop/mobile navigation checks pass uncropped travel,240ms/480ms slide phases, line completion before the first stop, individually spaced pop events using the shared context, reduced motion, and pinned-cover coverage with14px clearance beneath the actual tabs. Narration-buffer and audio lifecycle fixtures pass; all22-story sweep and four-viewport lifecycle checks pass. Production build passes (home 478kB / first load 567kB). Local only, not deployed; real-device scrolling, playback stalls and temperature remain an iPhone verification.

Opening-story spacing: moved the initial story stop up40px in every format, including its connecting-line origin, to separate its metadata from the first chapter’s printed island. Chapter geometry, baked artwork, subsequent stops and progress are unchanged. No additional runtime work.

September 23 hover correction: desktop format buttons keep their hit geometry stationary during hover/press; shadow and inner-art feedback remain. Removing hover translation/press scaling prevents the bottom edge from repeatedly leaving/re-entering a stationary pointer and retriggering hover sound. Scoped to the four format tabs on fine-pointer hover devices; no new runtime work. Browser checks pass all four expanded and docked buttons: one pointer enter, zero pointer leaves, constant bounds over750ms at the bottom edge. Local only, not deployed.


### September 23 — stationary route transitions and navigation audit

The final transition replaces the earlier side slides: the background stays still while the current foreground fades out over220ms. The new route draws first, followed by visible story/play stops at280ms intervals with the existing soft pop sound. Each format has its own bounded curve amplitude, frequency and bend; chapter art geometry is unchanged. No duplicate map snapshot, background animation or continuous animation loop. Offscreen stops stay settled. Cancellation covers rapid choices, resize, hidden page, dialog close, story entry and reduced motion. Format titles are now20px on desktop/17px on mobile, with progress counts removed from the tabs; lesson progress itself is retained.

Audit fixes: artwork decode has a900ms fallback so a stalled asset cannot block format changes; landscape touch layouts receive full pinned-header coverage; story portal gestures cannot switch the underlying path; narration retries reload a failed source and pausing cancels pending delayed autoplay. Browser checks pass mobile/desktop distinct curves, stationary map, rapid selection and reduced motion. Narration-buffer and shared sound regression fixtures pass. Local only, not deployed. Desktop emulation does not establish iPhone temperature improvement.

Final validation: all44 story views (22 stories at390px and1440px), Different Tides lifecycle at320/390/844/1440px, all four navigation/audio bug regressions, typecheck and production build pass. Home478kB / first load567kB. No deployment performed.


September 23 production deployment: `dpl_8yieEraqPpSpYAw6xbowaDg9iCKJ` is READY at https://futbol-island-imr19very-khoa0aohk.vercel.app, aliased to https://futbolisland.app. Deployment succeeded with explicit `--scope khoa0aohk` after the unscoped request returned Not authorized. Vercel production build passed (home480kB / first load569kB). Live390px and1440px browser checks passed: enlarged titles, no tab counts, four distinct route curves, stationary background, rapid format switching and reduced motion. This supersedes local-only status for the September23 changes above. Physical iPhone temperature remains unmeasured.


September23 story Done-button correction (local, not deployed): removed the story player's `immediate` bypass so its existing shared button fades the label, shrinks76px→44px and reveals a checkmark before the240ms navigation callback. The existing170ms mobile story exit and reduced-motion immediate close remain. No new loop, assets or rendering changes. Targeted browser checks passed at390px and1440px (width44.48px and checkmark opacity0.71 at190ms; story still mounted), then successful dismissal and immediate reduced-motion dismissal. Typecheck passed.


September23 procedural articulation (local, not deployed): direction-aware retreat braking and foot anchors, wider recovery steps, knee-pole locomotion IK, grounded sole preservation, airborne ankle detail, shoulder/pelvis motion and articulated wrists/forearms. Defensive support-centre balance uses bounded pendulum-inspired correction with an exact damped spring; free-leg reach has exponential soft saturation. Implementation, sources, rejected unrestricted balance experiment and costs are in [the articulation report](body-movement-articulation-2026-09-23.md). Existing live22-player batching remains10 batches; response/reference storage rises400 bytes/rig to1168 bytes. Previously merged unbatched rigs can gain two separate hand draws. Desktop-only22-rig pose benchmark median0.440ms/p950.470ms excludes rendering and does not prove phone cooling. Body/contact/seam/profile/batching/ride tests,30/60/120Hz retreat fixtures, all-format live browser checks and desktop technique views pass.

Story Done correction validation is complete: all44 story views, four-viewport lifecycle and all22 stories' seam/draw review pass. No story scene/cue edits. Still local since the last deployment.

Final articulation validation: phone-width movement contact sheet passes; production build passes (home479kB / first load567kB), typecheck and diff whitespace check pass. No deployment performed for this pass.


### September 23 — first biomechanics study milestone

The current-rig study now has eight reproducible six-second sequences, a 192-case mirrored/profile/frame-rate audit, stored baseline/refined reports, and an isolated `/motion-lab` review route. Three sequence findings were fixed: stationary post-kick support-foot release, abrupt brake-loading pitch (now an exact critically damped response), and overextended retreat-to-chase stance release. Synthetic peak post-kick recovery displacement decreased from20.82cm to5.60cm for passing and4.20cm for shooting; this low-height ankle proxy includes lift-off and landing, not just planted-foot sliding. Remaining goalkeeper shuffle/startup flags need contact-state and visual assessment. See [study protocol and results](body-mechanics/biomechanics-study-2026-09-23.md).

Runtime delta for this milestone is16bytes/rig (1184bytes response/reference storage), with no added gameplay meshes, raycasts or animation loops. The lab reuses one renderer, pauses on backgrounding, renders only on demand while paused, and releases GPU resources on unmount. It is separate from full-game performance measurement.

Validation: typecheck, diff whitespace check, 192-case regression, body mechanics/fluidity/batching, field contacts/dribbling, 918 teaching beats/217 passes, and ride poses pass. Lab browser checks pass at390px and1440px: playback, pause, all eight sequences, scrub endpoints, single canvas, and diagnostic export. Production build passes; home first load568kB, lab260kB. Shared chunk redistribution makes the home route-size column incomparable to the previous build, so use total first-load size. A CSS alignment compatibility warning was corrected before preview deployment. Physical iPhone review, thermal observations and reference-footage curve comparison have not been performed; this is the first milestone, not a completed2–4week study. Production remains on the preceding release; preview status follows.


Preview verification: deployment `dpl_8HoSCeSjpPuFctzoCvsVXNFwA9rs` is READY at https://futbol-island-7jkjkefhd-khoa0aohk.vercel.app/motion-lab. Vercel build passed without the corrected CSS warning (home569kB first load; lab261kB). The preview retains existing Vercel sign-in protection; unauthenticated requests redirect to sign-in. Production at futbolisland.app was not changed. Physical-phone testing remains outstanding.

Authenticated preview verification returned HTTP200 and the expected movement-review controls.


### September 23 — support-contact refinement (second milestone)

The remaining shuffle/startup flags exposed two constraints: a slow gait could retain a stance beyond physical reach while waiting for the opposite boot, and a fixed0.3m lateral limit clipped a reachable wide shuffle. Exhausted gait stance now uses the existing lifted release regardless of speed; shuffle lateral room blends0.3→0.5m, still bounded by actual leg reach. No new meshes, loops, raycasts, buffers or production diagnostics.

The audit now instruments its in-memory rig module to distinguish consecutive fully locked samples with unchanged support anchors from lift-off, replant and striking frames. Across the same192 cases, peak actual locked-support drift for shuffle falls6.85cm→numerical noise; start-stop5.82cm→numerical noise. All six locomotion sequences pass a1mm locked-drift ceiling. This does not mean all contact motion is perfect: receive/pass still has up to5.1mm locked drift, and low airborne/landing shuffle steps still reach11.51cm at30Hz. The longest both-ankles-above10cm interval for shuffle remains0.142s across the matrix; one forward-profile60Hz case increases by0.033s. This is a clearance proxy, not proof of ground reaction forces or absence of hopping. Reports: `docs/body-mechanics/study-results/support-{baseline,refined}-2026-09-23.json`.

Validation:192-case motion regression, body mechanics, retreat balance, fluidity, strike contact (96plus72extended cases),208range branches, seams, field contact/dribbling, batching and ride poses pass. Typecheck passes. Movement-lab390/1440browser checks pass. Physical-phone testing remains outstanding. Preview/build status follows.

Second-milestone local production build passes (home568kB / lab260kB first load). The12-frame goalkeeper shuffle contact sheet was visually inspected after correcting the capture harness to use compositor screenshots; no blank capture frames remain. This inspection covers sampled frames, not a physical-phone or motion-capture validation.

Second-milestone preview `dpl_7FGQtbcikcFztWUxRt1RfDCcr5X3` is READY at https://futbol-island-juefrrm5r-khoa0aohk.vercel.app/motion-lab. Vercel build passes (home569kB / lab261kB first load), authenticated HTTP200 and expected review controls verified. Existing sign-in protection retained. Production unchanged.


### September 23 — toe-off and trunk timing (third milestone)

Gait release previously added a fixed0.02m heel clearance at its first frame. Clearance now rises from zero through a smoothstep envelope over the first15% of the release blend, then follows the existing decay. A broader parabolic replacement was rejected because it changed moving-kick support behavior. The failing kick regression also exposed a stale release: capturing a grounded boot as kick support did not clear its previous gait replant. The support capture now cancels that old replant and lift-off flag, keeping its world anchor authoritative.

Across192synthetic sequences the largest measured first-release vertical step decreased from2.10cm to0.52cm; shuffle, acceleration and both cuts fall to numerical noise at that transition. This is a specific onset measurement, not a claim that total foot acceleration or every landing improved: peak acceleration elsewhere remains high and the shuffle's low-height swing displacement remains. A6mm regression ceiling now protects the measured onset across all profiles/rates/mirrors, alongside unchanged planted-contact and kick-support budgets.

The chest counter-rotation has a0.18rad gait-phase delay relative to the hip coil (about2.9% of a cycle). It retains its amplitude and existing transition response; this is an authored timing adjustment, not a measured human constant. No extra player state, geometry, render passes or animation loops; one additional sine evaluation per posed rig.

Validation so far:192-case study; body mechanics and flat soles; retreat balance;30/60/120Hz fluidity;208range branches; strike contacts; seams and moving-kick supports; field/dribble contact;918teaching beats/217passes; batching and ride poses pass. Typecheck passes. Physical-phone review and reference-footage comparison remain outstanding. Browser/build/preview details follow.

Third-milestone validation:390px/1440px movement-lab checks pass, the12-frame shuffle contact sheet was inspected, and the production build passes (home568kB / lab260kB first load). Desktop-only22-rig pose benchmark median0.452ms / p950.546ms; this excludes rendering and is not a phone thermal measurement. Preview deployment pending; production unchanged.

Third-milestone preview `dpl_Gg86BikZMbvo7iqvPmxUTuqxjGpt` is READY at https://futbol-island-ivltob8fp-khoa0aohk.vercel.app/motion-lab. Vercel build passed (home570kB / lab261kB first load). Authenticated HTTP200 and review controls verified; existing Vercel sign-in protection retained. Production unchanged.


### September 23 — high-step landing timing (fourth milestone)

The acceleration trace located a cut-preparation landing that brought an airborne ankle down roughly28cm in34ms. Its duration used horizontal travel only. High approaches now add0.2seconds per metre above0.18m to the existing reach time, capped at0.14s. Ordinary low plants keep their quick timing. These are tuned animation constants, not a biological landing law. Experiments extending every plant and easing yaw sooner were rejected because the existing45-degree planted-turn regression failed; its threshold was preserved.

Across the192-case matrix, peak foot acceleration during90-degree cuts falls1735→1481m/s² (about15%);45-degree cuts1680→1637m/s². These discrete second differences remain high and depend on sample rate; they are artifact-screening metrics, not human forces or evidence that all landings are realistic. The maxima for low-height displacement and both-ankles-raised duration remain unchanged for these two scenario sets. The1mm locked-support and6mm release-onset budgets remain. A1550m/s² empirical90-degree-cut ceiling now guards this regression. Reports are in `study-results/landing-{before,after}-2026-09-23.json`.

Reference inspection now has a reproducible offline command: `node scripts/analyze-motion-reference.cjs /tmp/fi-mocap-reference`. It verifies the existing CMU trial hashes and reuses the existing importer's skeleton parsing without rewriting game curves. For the selected0.733s run excerpt, knee-flexion ranges are0–116° left and0–105° right; the0.75s kick excerpt has33–69° left and25–84° right. These are single-clip observations under the existing120Hz/parser assumptions, not normative limits or direct calibration targets. Root-relative ankle height is explicitly not ground clearance. No new raw captures or cut/shuffle references were acquired, and no motion-reference asset was changed. Report: `study-results/reference-observations-2026-09-23.json`.

Runtime delta: bounded arithmetic only when selecting a cut replant; no new rig storage, render work or background loops. Movement study, body/sole mechanics, range, seam/kick support, fluidity and strike tests pass; typecheck passes. Physical-phone review remains outstanding. Further validation/build/deployment follows.

Fourth-milestone validation complete: field/dribble/teaching contact, batching and ride tests pass;390px/1440px lab playback checks pass;12cut frames visually inspected. Local production build passes (home568kB / lab260kB first load), whitespace check passes. No physical-phone or thermal results. Preview deployment pending; production unchanged.

Fourth-milestone preview `dpl_HjB2LmEcXPWLWoHG184Df8U5SEQA` is READY at https://futbol-island-p400o5yqt-khoa0aohk.vercel.app/motion-lab. Vercel build passed (home570kB / lab261kB first load); authenticated HTTP200 and review controls verified. Existing sign-in protection retained. Production unchanged.


### September 23 — swing momentum and closer dribbling (fifth milestone)

Anchored replanting now uses a bounded cubic Hermite start tangent: the prior foot velocity contributes `u(1-u)^2 * duration * velocity`, decaying to zero at the fixed landing anchor. Anchored steps advance by the current timestep immediately, avoiding a one-frame freeze at handoff. Incoming velocity is capped at6×root-scale m/s; grounded and authored reset paths clear it. Existing world locks and strike targets remain authoritative. Compared with the fourth milestone's same192cases, peak shuffle acceleration falls741→526m/s² (29%); start-stop815→645m/s² (21%). Cut90 remains1481m/s². These are synthetic finite-difference measures, not measured human forces.

The user's new dribbling report exposed a disconnected ball animation: live ball position previously oscillated0.85–1.15m ahead independently of the rig. Live and teaching dribbling now select/blend the visible leading boot's contact point, with a0.5×root-scale forward floor. The blend chooses an actual boot point once the feet separate enough, so touches can visibly meet the ball. This is close-control visual coupling, not newly simulated ball impulses; it does not claim physically correct free flight between every touch. Receiving/striking retain their existing contact paths. The fallback without a rig uses0.5–0.62m ahead. The old0.85m clearance tests were updated to the user's closer-control requirement; added actual-toe-distance checks pass nine speed/scale/turn trajectories.

The review lab adds a ninth sequence, Close-control dribble, with the existing patterned match ball visible and rolling. The audit now covers216cases. It keeps the prior locked-support, toe-off and cut-landing budgets. No changes to teaching content or narration.

Runtime costs: four persistent Vector3 objects for swing/replant velocity and two for dribble contacts (144bytes of numeric payload plus object overhead); no per-frame allocations from these changes. A visible owner now refreshes rig world matrices and transforms two ankle points for ball contact. No new main-game meshes or loops; the isolated lab adds one ball mesh/texture, disposed on exit. Desktop-only22-rig benchmark median0.461ms / p950.593ms excludes rendering and cannot establish phone heat. Body/sole,216-case study, range, seam/support, fluidity, strike, field/dribble,918teaching beats/217passes, batching and ride tests pass.390/1440lab checks pass and the dribble contact sheet was inspected. Physical-phone validation remains outstanding.


### September 23 — island dribble and visible play expression

The screenshot revealed the island walking ball still used a separate0.95m lead. `walkBall.syncDribble` now adopts the current posed rig's boot-driven contact before drawing, preserving ball-footprint floor/stair clearance; ordinary fallback lead is0.56m. A reusable player record avoids new per-frame object allocation. Live-match and teaching close control remain as in the fifth milestone. Charging/windup/shot/juggle paths are excluded from this synchronization. Ball-actions and wall-juggle regressions pass, including terrain and charging isolation.

Added visible chest yaw, sway/flexion and larger shoulder yaw/elevation/abduction with independently phased elbow flexion. Extra expression fades during braking/ball actions; an initial braking-hand regression was fixed without loosening its bound. Sampled-play expression test measures21.8° hip+chest yaw proxy,9.2° chest roll,14.9° shoulder yaw and49.6° elbow excursion; seek and pause reproduce poses. These are animation settings, not physiological norms. The shirt remains one rigid mesh; a deformable lumbar/chest chain is a research recommendation, not implemented. See [upper-body research](body-mechanics/upper-body-research-2026-09-23.md) for primary biomechanics, GitHub references, math choices and dataset restrictions. In particular a universal chest-lags-hips claim is not supported by the cited running study.

The changes add arithmetic and a walking-owner matrix refresh/foot transform; no new gameplay meshes or loops.216-case study, teaching-expression, body/sole, range, seams, fluidity, strike/field/dribble/teaching contact, batching and rides pass. Typecheck passed. Browser/build/preview status follows; physical iPhone heat remains unmeasured.

Latest validation: actual island walking controller browser check passes (attached ball0.569m ahead, zero horizontal difference from computed boot contact in the sampled frame); articulation contact sheet inspected. Local production build passes (home568kB / lab261kB first load), typecheck and whitespace check pass. Preview pending, production unchanged.

Latest preview `dpl_9juhava6TTSE9EHcN2yy76fRNnec` is READY at https://futbol-island-bx2hc76fg-khoa0aohk.vercel.app/motion-lab. Vercel build passes (home570kB / lab262kB first load), authenticated HTTP200 and dribble-review controls verified. Sign-in protection retained. Production unchanged.


### September 23 — deformable spine and smoother close control

Implemented a carrier → lumbar → chest hierarchy. Head, collar, neck and shoulders follow the chest; the waistband remains with the carrier/pelvis. The shirt now uses smooth height weights and twelve signed rotation morph samples (two joints × three axes × two directions). This is a bounded small-angle approximation to weighted skinning, not a physics simulator or learned model. Across the sampled run the upper surface follows the collar within 2.51mm. Lower-spine bend, twist and sway use gait-specific phase/amplitude factors for running, backpedalling and shuffling; the existing analytic inertial response preserves transition momentum. Reduced motion and special ride/action poses clear the additional spine expression. Existing authored strike lean and contact solvers remain authoritative. Plush costume torso shells retain their rigid carrier binding; their head/limbs follow the articulated joints.

Male/female surfaces are shared and reference-counted. Standard Three.js morph targets cover individual meshes, shadows and instanced crowds. Crowd batching remains 10 batches for22 players; each actor carries its own weights, including after reorder/shrink/reappearance. Morph storage starts at32 rows and doubles when needed instead of uploading1024 unused actor rows; unchanged weights skip texture updates. A32-row texture uses1664bytes. Each shirt now has336 vertices/600 triangles versus126/200 previously; two shared sets of position/normal morph deltas total193536bytes of typed-array payload. Each rig adds two groups and36 doubles (288bytes) for transition response. No new animation loop or per-frame vertex rewriting. Desktop22-rig pose benchmark median0.545ms/p950.742ms excludes rendering and is not a phone-temperature result.

Dribbling now softens the leading-foot handoff from0.16 to0.32×scale, applies a continuous forward-clearance function with a0.55×scale floor and0.025×scale lead allowance, and compresses lateral motion into a bounded0.12×scale lane. At30/60/120Hz and1.5/3/5m/s, the worst lateral handoff step is at most60.4% of the previous calculation (at least39.6% lower); observed side excursion remains below9.5cm. This is deterministic geometry-based smoothing, so seeks/pauses do not accumulate filter lag. Boot-derived centre contact stays within8cm periodically across nine scaled turning trajectories; the previous4cm exact-centre tolerance was intentionally relaxed for the narrower lane, still below half the ball radius. No free-flight ball impulse simulation is claimed.

Validation: new spine deformation/hem/collar, shared disposal,70-slot growth, instanced weights and deterministic seek tests; dribble smoothness;216-case movement study; body/sole, seams/support, range, fluidity,168 strike cases, field contact,918 teaching beats/217 passes, profile/batching, rides, ball actions and wall juggling pass. The flight-reset test now compares absolute zero so equivalent IEEE-754 negative zero is accepted.390/1440 browser lab pause/seek checks pass; articulation sheet inspected; live instanced rendering has no shader/WebGL errors. Island dribble browser check passes (sample0.570m ahead, zero difference from the computed smoothed contact). Typecheck/whitespace pass. Build/preview status follows. Production unchanged; real-phone motion/heat review remains outstanding.

Deformable-spine preview `dpl_2F41LCik632jyawEvgraR1sGJkWE` is READY at https://futbol-island-bp7810q6k-khoa0aohk.vercel.app/motion-lab. Local build passed (home569kB/lab262kB first load); Vercel build passed (home571kB/lab263kB). Authenticated preview response and expected review controls verified. Existing sign-in protection retained. Production unchanged.


### September 23 — residual dribble jitter, rolling and technique refinement

The prior narrow dribble lane still sampled every IK foot placement directly. Live/island rigs now critically damp the two normalized player-relative offsets once per pose (rates48 lateral /75 forward). Translation follows the player directly, so the ball does not lag behind the runner. Repeated contact reads are pure; pause holds state, reacquisition/teleport resets, and authored samplePose seeks continue to compute direct deterministic contacts. This last distinction matters: the new temporal smoothing applies to live/island movement, not history-dependent lesson scrubbing. The existing8cm periodic boot-contact bound passes unchanged after tuning the response. Across nine30/60/120Hz and1.5/3/5m/s checks, the largest filtered lateral step is at most55.8% of the prior narrow-lane target step. This is a synthetic positional metric, not proof that every perceived glitch is eliminated.

The island's previous rolling expression added1.2rad/s even at rest and used player speed rather than ball displacement. Attached/charging/windup ground rotation now uses a reusable world-axis quaternion from actual rendered x/z travel divided by ball radius. Idle balls stop spinning; reversal reverses roll, and teleports/mode entry prime the history. Juggle/flight spin remains separately authored. No extra meshes or loops. Cost: four doubles (32bytes) plus one scratch Vector3 per rig, one owner matrix refresh during dribble posing instead of each contact read; the island roll helper owns two vectors and one quaternion with no per-frame allocation.

Running swing recovery now advances slightly earlier through a bounded sinusoidal phase remap, while stance and swing endpoints remain fixed. Shot/loft backswing clearance increases knee folding before extension; contact atphase0.36 and its forward tangent remain unchanged. The opposite arm opens during load and returns during follow-through, with smaller amplitudes for passing. Existing pelvis/chest transfer and support-foot constraints remain in place. These are authored biomechanics-inspired refinements, not motion-capture fitting or a new physics simulation.

Validation:216-case movement audit;168 strike contact cases;918 teaching beats/217 passes; range, seams, body/sole, fluidity, spine, batching and ride regressions pass. Dribble contact, repeated-read, pause, teleport, smoothing and roll tests pass; ball actions and wall juggling pass. Island browser sample is0.609m ahead with zero mismatch from the filtered contact. Running articulation and72 strike frames across front/side/rear captured; side sheet inspected and contact error below3e-14m. Typecheck/whitespace pass. No real-iPhone thermal measurement. Build/preview status follows; production unchanged.

Refinement preview `dpl_7qXkFbSRrVGGk5G1DqEMgnJfsuRQ` is READY at https://futbol-island-396yskvji-khoa0aohk.vercel.app. Local build passed (home570kB/lab262kB first load), Vercel build passed (home572kB/lab263kB). Authenticated HTTP200 and movement-review content verified. Sign-in protection retained; production unchanged.


### September 23 — strike weight transfer and recovery landing

Loading now adds a bounded support-side hip shift driven by the strike load/drive envelopes (smaller for passes). Lumbar and chest yaw articulate separately through the load and follow-through; the torso's drive contribution fades before the action ends instead of remaining fully advanced into the final phase. Existing ankle targets and contactphase0.36 remain unchanged.

At the end of a continuous slow/stationary kick (speed below0.8m/s), the striking foot now takes a0.18s Hermite landing step0.14m forward with a small speed-based lead. The old support foot remains held through this landing, then hands back to normal stance. This uses the existing replant solver and incoming foot velocity. A double-foot recovery hold must not be mistaken for braking: the braking branch now excludes this short recovery interval. Seeks, reduced motion, rides, a new touch and other non-football poses cancel/reset the added recovery state. Sampled teaching poses retain deterministic phase-based evaluation; the stateful extra landing is for continuous playback.

Rejected experiment: forcing the extra landing while already running reduced grounded support in the moving-pass regression. Keep the running gait's existing next stride instead; the original grounded-frame requirement passes unchanged. This is a tuned animation refinement, not a force simulation.

Runtime delta: one scalar recovery timer per rig plus bounded arithmetic, reusing existing foot anchors and spine response buffers. No new geometry, draw calls, raycasts, allocations per frame, or animation loops. Validation:216-case motion study;168 strike contacts;918 teaching beats/217passes; body/sole, range, seams, field contact, spine, ride/mechanics, dribble and rolling tests pass. New recovery tests cover18 profile/side/rate combinations, verify a forward grounded landing, pause during landing, seek reset, and an interrupted opposite-foot strike. Maximum sampled per-frame recovery displacement is4.82cm across30/60/120Hz; this is a regression measure, not human biomechanics data. Browser technique captures (72 frames) and mobile/desktop lab checks pass;12 final-strike/recovery frames inspected. Typecheck and whitespace pass. Build/preview status follows; production unchanged and real-phone thermal validation remains outstanding.


### September 23 — steady dribble lane, truck ramps and field light collision

Dribbling now follows a central forward lane (0.60–0.625m lead), independent of animated ankle displacement. This supersedes the earlier ankle-target spring: removed its buffer and scratch vectors, and narrowed the dribbling foot lane by0.055m so the boot approaches the ball. Existing8cm contact regression still passes;18 straight/turn/rate cases show numerical-zero lateral offset. Browser attached ball target gap is0, forward lead0.614m. This removes gait-driven wobble without adding a second ball simulation.

The desktop truck landing button is centered below the entire field banner (verified1440/1000px). Shadow normalBias increases from0.035 to0.12, retaining depth bias-0.0002, map dimensions and shadow caching. Controlled cafe comparisons removed diagonal self-shadow striping while retaining railing/furniture shadows; larger depth bias was rejected for losing detail. Normal offset may soften/detach very close contact shadows; real-phone review remains needed.

Driven pickups sample both tire lanes at each axle against ground ramps. Support sets height and pitch; gravity releases the truck off the lip and returns it to the ground. Elevated roof launchers are excluded. Rider bed position uses the truck's full rotation and translation, and the rider inherits pitch/roll without interpolation lag. Added bounded ramp samples for driven/rejoining trucks only, no raycasts, geometry, lights or extra loop. Existing traffic and personal-ride behavior tests pass, including ten-minute traffic flow; new ramp tests cover30/60/120Hz, orientations, stationary support, reverse, pause, takeoff and landing. Browser verified0.675m support,-0.221rad tilt and exact rider/bed alignment; screenshot inspected.

All20 field floodlight pedestals now have0.75m collision bodies sourced from the same layout as their rendering. Ground poles enter the existing obstacle grid; futsal and knockout roof poles enter height-filtered roof obstacles so they do not block streets underneath. No new rendering work; only20 static grid entries at construction. Collision tests cover240 walking/bike/moped approaches and roof separation. These changes preserve exploration access to football activities. Desktop validation does not establish lower phone temperatures. Build/preview status follows; production unchanged.

Validation complete: typecheck, whitespace and local production build passed (home570kB first load). Preview dpl_5C2qBwypbq4ZkZv1sGsekofTb7ZD is READY at https://futbol-island-davf44obk-khoa0aohk.vercel.app; Vercel build passed (home573kB). Production unchanged; preview sign-in protection retained.

September23 follow-up on the remaining diagonal roof line: reproduced the stripe/diagonal boundary with normalBias0.035 on the lower cafe terrace, then compared0.12 and disabled receiving shadows at the same camera/scene state. Current0.12 removes the roof artifact in the inspected desktop lower/upper terrace views and390px touch viewport; furniture/rail shadows remain. No further rendering changes made. This is local browser visual evidence for the settings already shipped to preview dpl_5C2qBwypbq4ZkZv1sGsekofTb7ZD, not confirmation of the user screenshot’s deployment or all camera angles. Public production still lacks the preview adjustment.

Production deployment September23: dpl_6oHyck2isnuYx7cZw8NxTwuPV2QR is READY and aliased to https://futbolisland.app. Vercel production build and type checks passed; public homepage verified HTTP200. Build reports629kB home first-load JS for the current workspace release. This supersedes the previous preview-only status.
