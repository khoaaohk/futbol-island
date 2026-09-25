# Performance reference for future Futbol Island updates

Last reviewed: September 14, 2026. This is the maintained implementation guide; [the dated performance log](flight-performance-2026-09-14.md) contains measurements and experiment history. Check current code before proposing an optimization: many suggestions have already been implemented.

## Purpose and evidence

The user reported warming on an iPhone 17 Pro Max after roughly 3–5 minutes, especially during flight, boost and moving-truck landings. They reported improvement after earlier updates and cooling when stationary. Preserve football learning, visuals, responsive controls and reliable interactions while reducing unnecessary work.

Desktop mobile emulation is useful for regression checks, CPU/GPU timings and work counts. It does **not** measure iPhone temperature, battery use, or establish that warming is resolved. Avoid translating a reduction in draw calls or matrix operations into an equal reduction in heat.

## Rendering and shadows already optimized

- Mobile baseline: DPR 2, about 30 rendered frames/second, 2048 shadow maps. Player simulation remains 60 Hz. Do not silently lower resolution, shadow quality, effects or frame rate to claim a performance win.
- Static scenery uses 50 m spatial chunks. Compatible opaque palette materials share linear vertex colors; textured, emissive/animated and incompatible surfaces retain their material paths. Ground layering/order must remain correct.
- Static opaque shadow geometry is batched separately from paint colors. Original shadow flags/proxy visibility are restored in `finally` blocks. Transparent, alpha-tested, displaced, clipped and custom-depth objects keep their original path.
- Shadow-volume culling includes offscreen objects whose shadows can enter the view. Dynamic character/vehicle shadows remain supported. Moving flight cameras align shadow coverage to texels.
- Static scenery and shadow proxies cache fixed transforms. `hiddenTransformGate.ts` skips invisible registered groups during the scene traversal only; explicit world-matrix updates still work, and newly visible branches force refresh. Do not break picking, bounds or reappearance.
- **The framebuffer-copy shadow cache is disabled on mobile.** Desktop retains it, with camera invalidation and renderer-owned framebuffer restoration instead of synchronous GL state queries.

Relevant code: `lib/town/world.ts`, `lib/graphics/staticShadowBatches.ts`, `shadowVisibility.ts`, `staticShadowCache.ts`, `hiddenTransformGate.ts`, `islandShadows.ts`, `components/Town.tsx`.

## Characters, traffic and simulation

- Character meshes cache rigid local matrices; animated joints/world transforms still advance. Appearance changes refresh cached transforms. Costumes attach to the existing rig and preserve the underlying character.
- For individually rendered rigs, fixed same-material head, knee and elbow pieces are merged **within their own joint**: seven fewer meshes per rig, unchanged triangle count. Clothing/hair switches remain independent; picking metadata is retained. Do not merge across animated joints or independently toggled parts. Live-match and coach-practice rigs pass `mergeRigidParts=false` to preserve shared instancing across players.
- Island characters outside an expanded camera frustum skip joint posing, activity/ride animation and label painting. Their routines/root positions remain valid. Nearby characters, interaction partners and hit reactions need immediate updates. Existing distance-based pose throttling and reusable neighborhood/partner containers are already present.
- Distant unseen live matches accumulate roughly 100 ms between simulation calls. Visible, selected and nearby matches update immediately; MatchSim retains safe substeps and elapsed time. Quizzes/lessons keep their teaching path. A paused match must not accumulate a catch-up burst.
- Movement, roof, truck, ball-ground, ball-wall and ball-roof queries use spatial collision lookups. Preserve live dynamic/breakable obstacles, swept collisions and full aiming reach.
- Traffic positions sample cached road routes at 20 cm spacing into reusable vectors. Rebuild samples on every route change, including rejoining roads after free driving. Original curve tangents retain headings. Synthetic tests found up to 0.05055 m positional deviation: this is approximate, not pixel-exact.
- Traffic rejects neighbors more than 8 m away before detailed yielding checks. Ordinary cars over 100 m from the player check yielding at 10 Hz; all positions still advance every frame. Pickups, nearby cars, driven trucks and road-return logic retain immediate updates. This is **not** a blanket reduction of player physics or traffic movement frequency.
- Truck landing fixes avoid repeated hidden ground-landing searches while attached. Preserve generous landing acquisition, smooth approach, seated riding, driving/boost/reverse/honk, dismount and autonomous road return.

Relevant code: `lib/graphics/player.ts`, `batchMeshes.ts`, `islandNpcs.ts`, `streetTraffic.ts`, `lib/town/trafficRouteSamples.ts`, `obstacleGrid.ts`, `components/Town.tsx`.

## HUD, menus, previews and mobile input

- Player position lives in `positionStore.ts`; `MovingIslandMap.tsx` subscribes separately from the large Town HUD. Position publishing is approximately every 150 ms; zone state changes only when crossing regions. Hidden/minimized map consumers unsubscribe and read the latest position on reopening.
- Field classification runs at 10 Hz, with reusable clipping vectors in `pitchVisibility.ts`. Prompt placement still tracks smoothly; coordinates are rounded to half pixels and unchanged styles/text are not rewritten. Nearest-building selection uses a scan rather than filter/sort lists.
- Normal paused menus stop the island after the first cleanup frame. Resize/appearance changes invalidate the frozen frame. Time-of-day changes retain their three-second lighting transition; onboarding retains camera motion. Resume without a large simulation catch-up.
- Previews dispose their renderer on close, pause while offscreen, reject hidden resize draws and only reapply appearance/background when changed.
- Joystick feedback updates CSS/transform values directly rather than React state. Preserve the bounded rim pulse and faded arc; avoid an infinite extra animation loop or broad expensive filter.
- **Attach native non-passive gesture blockers after the joystick mounts.** Town's joystick mounts only when ready; installing them inside initial scene setup previously did nothing because its ref was null. Keep blockers scoped to the control and preserve pointer capture, multi-touch action buttons, blur/pagehide/cancel recovery and second-finger tip dismissal. Test iOS double-tap-then-hold on a real device; Chromium cannot prove native magnifier behavior.

## Effects, water and audio

- Exhaust/trail/collection particles use finite pools and skip work when disabled/empty. Known pool budgets: exhaust 112, flight trail 64, walking-ball particles 24, collection particles 72. Verify current definitions before changing budgets.
- Walking-ball charge/trail geometry sleeps when the ball is hidden during flight. Inactive rings/ghosts skip transforms. Colors are cached and only changed when equipment changes. Box/collection effects stop updating after their lifetime; sonic bursts sleep after expiration.
- Water ripples animate offsets of a prebuilt repeating texture. Do not replace this with per-frame canvas redraws, texture uploads, expensive reflections or a new independent render loop without measuring the cost.
- Continuous engine sounds reuse oscillator voices; parameter updates are throttled to about 10 Hz. Muted/zero-volume effects stop sources and avoid silent allocations. Keep the shared music context running; zero effects volume must not stop music.
- Ride hum stops during parachute/fall phases, even though the selected ride remains a flight item.
- Defaults are music 4%, effects 50%, with one-time migration `fi2-audio-mix=4-50-v1`; preserve later user preferences. Volume changes are UX choices, not evidence of reduced GPU heat.
- Match-news requests happen when a participating conversation opens and share a five-minute cached response. They are not polled from the flight/render loop. News unavailability is a separate service issue.

## Experiments not to repeat without new evidence

| Experiment | Finding / decision |
| --- | --- |
| 25 m scenery chunks instead of 50 m | Fewer triangles, but 74–84% more draw calls in tested scenes. Reverted. |
| Mobile framebuffer-copy shadow caching | Local controlled GPU median: normal 7.455 ms, culled 6.790 ms, cached 10.182 ms. Keep mobile cache disabled. |
| Assuming boost particles are the main cause | Sampled particle disabling had negligible/noisy impact; shadow disabling had a larger effect. This is not proof for every device/view. |
| Broad NPC batching experiment | Earlier attempt was discarded. The newer retained change only merges invariant pieces within individual character joints; distinguish the two. |
| Treating lower mesh/CPU counts as proven cooling | Work savings require real-device thermal validation before making that claim. |

## Validation and update procedure

1. Read this guide and relevant code; identify what is genuinely new. Record baseline build, route, ride, viewport, DPR, shadows and frame-rate target.
2. Change one subsystem at a time. Preserve teaching cues, quizzes, collisions, costumes, pickup landings and responsive controls. Keep only changes with useful evidence; document tradeoffs.
3. Run relevant existing tests and a production build for implementation changes. Use same-scene comparisons for rendering; distinguish color-only counters from color-plus-shadow counters. Do not compare unrelated routes as if they were controlled GPU measurements.
4. For movement changes, check walking/rides/boost, both pickup landings, driving and dismount. For rendering changes, include costume/character variants, shadows and picking. Verify lesson/quiz controls and hidden-menu pause/resume when affected.
5. For heat conclusions, repeat a roughly five-minute session on the physical iPhone using a consistent route and settings. Record device/browser, charging status and comparable starting conditions. Do not call heating solved from emulation alone.
6. Append results to the dated log and update this guide if implementation or recommendations change. Record local versus deployed status and the deployment ID when actually verified.

Useful repository checks (run those relevant to the change):

- `node tests/player-batch.cjs`: shared match batch count, unchanged color uploads and reorder/hide/reappear behavior.
- `node tests/movement-work.cjs`: character geometry/mesh count, road sampling error, 1,000 field projection parity cases.
- `node tests/player-motion.cjs`, `node tests/npc-behavior.cjs`, `node tests/ride-ramps.cjs`: movement, rig customization, NPC and ramp behavior.
- `node tests/wall-juggle.cjs`, `node tests/ball-actions.cjs`, `node tests/obstacle-grid.cjs`: juggling/ball behavior and collision grids.
- `node tests/static-shadow-batches.cjs`, `node tests/shadow-visibility.cjs`, `node tests/hidden-transform-gate.cjs`: shadow/transform behavior and safe restoration.
- `node tests/position-store.cjs`, `node tests/match-update-clock.cjs`: independent map subscriptions and match cadence.
- `node tests/boost-render-work.cjs`, `node tests/idle-flight-effects.cjs`, `node tests/coin-effects.cjs`: bounded active effects and idle sleep.
- `node tests/engine-voice-reuse.cjs`, `node tests/music-continuity.cjs`: sound reuse and shared music lifecycle.
- `npm run build`: production compilation, lint and type validation.

Browser scripts mentioned in the dated log live under `/tmp` and may disappear. Treat them as historical fixtures, not permanent available infrastructure; recreate or promote them into repository scripts when needed. Debug information is available under `window.__fi2`, including renderer, traffic stats, hidden-transform stats, position store and HUD renders.

## Resolved batching regression and follow-up

The joint-merging change initially increased a 22-player match fixture from 10 to 118 batches because generated geometry UUIDs prevented sharing across players. This is now corrected locally: field and coach-practice rigs explicitly disable per-rig merging, while individually rendered characters retain it. `tests/player-batch.cjs` verifies **22 players / 10 batches**. Keep this cross-player check alongside per-rig geometry checks.

Player batch colors now compare actual Float32 RGB values at each instance slot. Stable colors skip `setColorAt` and GPU upload; changed colors upload the affected range. Comparing slot data preserves correct colors when players are reordered, hidden, reappear or change appearance. Empty batches do not request buffer uploads. Animated matrix uploads remain active.

Town and Breakaway joysticks cache their rectangle for a gesture through `useJoystickBounds.ts`. New gestures, release/cancel, element resize, window resize/orientation and viewport/scroll changes invalidate it. Preserve native gesture blocking and multi-touch recovery. This is separate from the earlier direct-CSS feedback optimization.

Jetpack sound uses two reused sine voices with a quieter, gently detuned upper harmonic and soft startup sweeps. Latest tuning uses base hum gain .009 and upper harmonic .002, with startup gains .012/.003. Parameter updates retain the existing 10 Hz cadence; music/effect preferences and parachute/fall muting remain unchanged.

## Latest recorded status

At this note's creation, the character-joint batching, route samples, distant yielding decisions and reusable field projection changes are **local, not deployed**. Production build and relevant tests passed. A four-second mobile-emulated production sample rendered 120 frames and deferred 402 of 1,080 traffic yielding scans (37.2% fewer scans in that sample). Both pickup landings and driving passed without JavaScript errors. This percentage describes yielding scans only, not total CPU, GPU or heat reduction.

Older sections in the dated log say “local” as a historical snapshot. Do not infer today's deployment status from those labels; verify the release before reporting something as live.

### Truck collision safeguard added after the latest pass

Preserve `trafficSeparation.ts`: autonomous route advances and free driving check oriented vehicle footprints. Existing overlaps may separate without allowing new or deeper intersections. Do not restore a blanket rejection of every overlapped candidate, which trapped landed trucks, or make overlapping autonomous cars yield forever. Truck passengers are not pedestrians for traffic-stop checks. Keep the nearby rejection before SAT overlap work and reuse footprint objects. Regression check: `node tests/traffic-separation.cjs`; browser checks covered overlap escape and both pickup landings. Local, not deployed.

## Live rooftop knockout

The rooftop game shares Town's renderer and clock; it has no separate modal, canvas, audio loop or animation loop. Six island opponents seek six reusable field balls. Players must approach a loose ball to kick; stopped shots remain available, teaching scanning, aiming and finding space around cover. The ordinary attached-ball simulation is bypassed while participating. Offscreen distant arena updates sleep. Ball visuals share one instance buffer, teleport rings share geometry/material, and countdown textures are created once rather than repainted each frame. Effects expire after each knockout/return.

The south stair uses continuous side collision barriers rather than height-dependent segments that can activate around a rider partway up a tread. Keep the top gate open and retain safe mounting clearance. Validation: rooftop travel and knockout simulation tests, browser walking/bike/moped ascent and descent, knockout queue teleport, return teleport and countdown. These changes are local, not deployed; no physical iPhone thermal measurements were taken.

Knockout now counts three unprotected hits before elimination. The first two hits grant three seconds of protection, rendered with a single shared instanced blue-shield mesh (maximum seven instances, hidden when empty). Cage rebounds reflect both velocity axes at corners using swept ball steps and match the visible cage extents. The fixed six-ball pool persists through impacts and shot expiry; the player's ordinary attached ball stays hidden on the roof and raised arena obstacles. Tests cover all four wall rebounds, shield duration, third-hit elimination and an autonomous round finishing. Browser verification covered first/second-hit survival, blocked repeat hits, third-hit queue teleport and next-round return. Local, not deployed.

Cage-ball possession: approaching a loose ball automatically attaches that existing ball at the player's feet (one per player). The ball follows movement and facing until kicked; a shot releases ownership, and elimination drops it. Both the main character and opponents use this rule. Keep the ordinary island ball hidden: possession reuses the same six instanced cage balls and adds no renderer or effect loop. `tests/rooftop-knockout.cjs` covers pickup, following/aiming, exclusive ownership, shot release and elimination drops alongside shield/rebound rules.

Latest cage-ball rebound tuning: obstacle and queue faces now reflect shots instead of stopping them. Reflected penetration plus a 2 mm separation prevents repeated contact trapping. Cage contacts retain 92% of the normal velocity; obstacle contacts retain 86%. Exponential rolling drag replaces the fixed ten-second stop, settling below 1.2 m/s into a collectible ball. The existing swept steps and six-ball pool remain; no additional render loop or physics dependency. Regression tests cover obstacle faces/corners/queues, wall rebounds, no embedding, gradual settling, possession and shield rules. Build passed; local, not deployed.

Hit animation update: first/second hits play a 1.4-second fall, get-up and dazed recovery. Movement, pickup and kicking pause during recovery; the three-second protection timer still begins on impact. Orbiting daze stars continue briefly after standing. Third-hit elimination has its own fall/twist, stretching shrink-out, transfer at 1.8 seconds and half-second arrival in the queue. `knockoutAnimation.ts` owns shared timing for the main character and opponents. Shield bubbles expand/pulse/fade, and event-only effects use fixed pools of 21 stars and 112 particles, with fewer particles and no knockout twist for reduced motion. Empty pools hide and skip matrix uploads. No independent loop or dynamic lights were added. Tests: `knockout-animation.cjs`, `rooftop-knockout.cjs`; browser verified falling, frozen recovery, upright daze/shield particles, third-hit queue teleport and return countdown. Local, not deployed; physical-device thermals remain unmeasured.

Latest tuning supersedes the earlier hit timings: normal recovery lasts 2 seconds with a longer ground hold; third-hit teleport occurs at 2.7 seconds, followed by a half-second queue arrival. `SHIELD_DURATION` is now 5 seconds and drives both damage protection and visual timing.

Cage balls now have cream-colored tapering trails from a single 72-instance pool (12 per ball). Trails sample actual movement, persist through rebounds, fade within .35 seconds after collection/stopping, reset between rounds, and stop uploading when empty. Reduced motion suppresses emission. Tests: `knockout-ball-trails.cjs`; browser verified rebound trails and their fade.

Moving-ball collection no longer requires zero velocity. Nearby passing/receding shots can be trapped directly onto the feet; trajectory checks preserve direct incoming body hits. A .35-second release guard prevents immediately recapturing one's own kick. Collection clears velocity and preserves the same six-ball pool. Tests cover moving misses/rebounds, hit priority and release. Latest timing/collection/trail changes are local, not deployed.

Stair-ball clearance: attached, charging and windup touches now sample the existing spatial surface lookup beneath the ball footprint, rather than reusing the character's lower tread height. Touch reach shortens near walls too tall to step onto. Shot and juggling paths retain their own physics. `tests/ball-actions.cjs` covers both stair directions and all three attached modes. The knockout landing's solid green panels are replaced with open rails; collision guards remain unchanged, and the blank green entrance panel is removed. Local, not deployed.

Rides on elevated stairs now use `rideSurfacePose.ts`: front/rear support sets pitch, and wheel-circle/deck samples raise the ride clear of individual treads. The rider uses the same height and pitch. The result object is reused; flat roof spans exit after the front/rear checks, and flight, falls, truck riding and ramp airtime retain their existing paths. Ground-level pitch remains unchanged. `tests/ride-stair-pose.cjs` covers wheel clearance and both directions for scooter, bike and moped, plus flat-roof height. Local, not deployed.

Exact stair seams now retain support: `roofAt` uses a one-micrometre footprint tolerance only for step-access surfaces. Strict open rectangles previously returned ground height at some shared tread boundaries, dropping rides into the stair mass. The stair-seam regression is in `tests/rooftop-travel.cjs`; browser riding checks now pass for scooter, bike and moped with matching rider/vehicle tilt. This supplements wheel support rather than altering solid-object collisions.

## Production release — September 14, 2026 (Pacific)

Deployed the accumulated updates, including live rooftop knockout, possession/rebounds/trails, five-second shields and hit/teleport animations, façade cleanup, stair-ball clearance and ride/tread-seam fixes. Vercel production build passed; deployment `dpl_DZ6T9PkmcpN23y7pDFZrqcTCDP35` is READY and aliased to https://futbolisland.app. Alias verification returned HTTP 200. Deployment URL: https://futbol-island-a3mkiv5x9-khoa0aohk.vercel.app. Prior “local, not deployed” entries above are historical and superseded by this release. Device thermal validation is still separate from release/build checks. This release record was appended locally after deployment.

## September15 local thermal follow-up

See [the measured follow-up](thermal-followup-2026-09-15.md). Live rooftop opponents now share14 character batches instead of162 individual visible meshes. Keep unmerged source rig geometry for cross-player sharing, detached local source transforms, and computed instance bounds with `frustumCulled=true` so color and shadow passes cull independently. The first no-culling attempt added offscreen geometry and was corrected. Unjoined unseen arena work sleeps; participant continuity is preserved. `tests/live-knockout-work.cjs` is the permanent regression check. Same-settings production emulation reduced rooftop-view rendering calls412→268; this is not a measured heat percentage. Local, not deployed.

The [whole-app audit](performance-audit-2026-09-15.md) includes a staged-loading plan. Current50m world chunks are procedural rendering units, not lazy downloads. Prioritize selected-category/visible-preview preparation and current/next narration before architectural world streaming. Preserve lightweight world collision/map/route metadata and predictive shadow/view margins; avoid repeated construction/upload spikes.

### September 15: collected-ball lessons (local, not deployed)

Collection tips now hand off from `coinHunt` only after the finite `coinEffects` pool settles. This uses simulation completion, not a wall-clock timer: background tabs and paused menus cannot bring up the lesson while the collection is unfinished. Simultaneous collections queue their lesson IDs. The new lesson component is dynamically imported only when a completed collection needs it, and joins Town's existing paused-menu path; proximity guidance no longer subscribes to progress or runs dismissal timers. Preserve the completion ordering and idle-world pause when revising the lesson UI. `tests/coin-solids.cjs` covers the once-only, pause-safe handoff; `tests/coin-effects.cjs` covers bounded pools and zero idle effect mutations. No iPhone thermal claim follows from these checks.

### September 15: knockout ground clearance (local, not deployed)

`knockoutGrounding.ts` supports fallen rigs above the rooftop instead of rotating half their body below the foot pivot. It caches visible mesh references at the start of each fall and reuses geometry bounds; active hit/transfer frames project those bounds onto world Y without vertex scans or new frame allocations. This accounts for animated limbs and large mascot heads for both the main character and detached batched opponents. Normal gameplay and settled queue poses skip the support work. Preserve the two-second recovery, five-second shield, 2.7-second elimination transfer and shared rendering batches. `tests/knockout-grounding.cjs` checks actual transformed vertices in 4,656 samples across male/female characters, costumes, merged/batched rigs, normal/reduced motion, recovery and teleport. Existing animation and gameplay tests passed. This visual correctness change is not a measured thermal improvement.

### September 15: rooftop countdown score styling (local, not deployed)

`knockoutCountdown.ts` matches the live goal badge's pink (`#f3a6c4`) and plum (`#502b40`) colors, brief pop/rise and soft gold lightning edges. Four numeral/GO textures and one feathered burst texture are painted once; two reusable sprites update only during the existing three-second countdown and .8-second GO window. No per-frame canvas painting, dynamic lights, new animation loop or timers. Reduced motion uses a stationary badge and quiet halo. Finished countdowns leave transforms/materials untouched; the parent arena still sleeps when unjoined and unseen. `tests/knockout-countdown.cjs` covers the sequence, visual palette, reduced motion, cached texture count, inactive work and disposal; `tests/live-knockout-work.cjs` still verifies 14 character batches and offscreen sleep. No measured phone cooling claim.

Ground-clearance follow-up: final production build passed. Mobile Chromium exercised loose-ball pickup, normal knockdown/recovery, five-second protection, third-hit queue teleport and return countdown successfully. The prone screenshot `/tmp/fi2-grounded-hit-fall.png` shows the full character above the roof. These checks are local; no deployment performed.

### September 15: live-field, traffic and volleyball follow-up (local)

- `liveFieldFrame.ts` retains live roster tokens, position references, reaction scratch state and motion objects. Roster replacement rebuilds the cache; each reception/facing/kick/stun field resets before reuse. Field runtime no longer creates live maps/sets/pose objects or foot-contact vectors each frame. Teaching/quiz poses remain separate. `tests/live-field-frame.cjs`, teaching-contact and quiz-outcome checks pass.
- `trafficTangentCache.ts` retains two exact tangent samples per immutable route object (current and proposed). A new route gets a fresh cache, including truck reentry. This changes no heading approximation. The ten-minute synthetic road test compares cached/uncached trajectories exactly: 316,306 actual evaluations, 647,756 cache hits (about 67% fewer evaluations).
- Junction ownership now holds priority through a turn so crossing vehicles wait outside the junction instead of mutually blocking. The initial synthetic test exposed an existing 67-second standstill; after priority, ten simulated minutes produced a maximum stop of about 4.3 seconds and all vehicles progressed. Driven-truck road return and overlap separation tests pass. A stopped player-driven truck can still physically block a lane; this is not a guarantee against every arbitrary obstruction.
- Volleyball uses per-player batches only when the complete character is within view: a fully visible court falls from112 to62 submissions including the ball, with identical triangles. At screen edges, original merged rigs retain per-part culling; the first all-court14-batch attempt was rejected because it added offscreen geometry. Source rigs retain picking identity, hover pause and hit reactions. See `volleyball-performance-2026-09-15.md` and `tests/volleyball-batch.cjs`.

These are work-reduction and correctness measurements, not physical iPhone temperature results. No deployment performed in this follow-up.

Actual-island traffic validation: production Chromium ran ten accelerated simulated minutes on the authored 26-node road network. Every car/pickup advanced; longest stop was 6.07 seconds, and cached tangent evaluations were 306,457 versus 649,750 avoided repeats. This exercises autonomous intersection priority on real roads, in addition to the synthetic pickup-driving/reentry fixture. It does not promise clearance when a user deliberately parks in a lane.

### September 15: occupied knockout box energy walls (local, not deployed)

`knockoutQueueWalls.ts` adds translucent red corner-box boundaries that fade to zero alpha at 4.8 m, with rising red sparks. Only boxes containing a teleported-out participant activate. All walls share one 16-instance batch and update matrices only on occupancy changes; sparks share one 48-instance pool (12 per occupied box), updating at 20 Hz. No textures, dynamic lights, new loops, per-frame allocations or collision changes. Paused, empty and offscreen arena work sleeps; reduced motion keeps the static fading walls without moving particles. Characters remain visible through the boundaries. `tests/knockout-queue-walls.cjs` verifies arrival/occupancy gates, transparency, upper fade, caps, cadence, pause and cleanup; the live arena work test still passes with 14 character batches. This is a bounded visual addition, not a measured cooling improvement.

Final verification: production build passes. Mobile Chromium checks passed loose-ball pickup, hit/shield recovery, elimination, red-wall/particle activation after arrival, queue teleport, return teleport and visible pink countdown. This confirms lifecycle/rendered objects, not physical-device temperatures. Loader uses a transform-only CSS indicator, removed with the loading screen; text-to-indicator gap is 10px with paragraph margins removed. No extra render loop or staged world-loading rewrite. Not deployed.

### September 15: distinct ball-hunt lessons and practice (local, not deployed)

Replaced ten overlapping concepts and differentiated the remaining diagrams; 50 three-stage patterns remain distinct even with labels removed. Practice idea opens a per-tip prediction/reveal in the existing lazy modal instead of generic quest routing. No new render loop, timers, 3D assets or eagerly loaded lesson data. Collection IDs/progress and fixed modal lifecycle are preserved. All 150 mobile stages and 49 practice entry points checked; production build and progress/semantic fixtures pass. See `ball-hunt-content-confirmation-2026-09-15.md`. This is educational refinement, not a measured cooling change.

### September 15: offscreen live-player instance culling

Live field batches used to submit entire teams when any part of a pitch entered view. `fieldRuntime.ts` now checks a conservative radius7 + 2×elevation body/shadow sphere per player before batch submission. Simulation, pose updates, contacts, and teaching participants stay unchanged. Six fixed and 18 sequential edge views are pixel-identical with culling toggled; final town GPU samples improve from 5.0–5.3ms to 3.95–4.02ms at unchanged DPR2/~30fps. See `moving-heat-followup-2026-09-15.md`. Do not infer physical cooling or a proven single historical culprit from these desktop measurements.

Heat fix deployed and verified: `dpl_Af6TFaZWjuVGUJF3JLEsLnAKKXxa` / https://futbolisland.app. Production town/field/rooftop checks passed exact pixel and shadow parity with offscreen instances omitted. New Paths/stories are local-only and excluded from this isolated release. Physical iPhone retest remains necessary.

### September 15: populated player matrix uploads (local)

After the offscreen-player release, the user reported the iPhone still warms, but less. This is improvement feedback, not resolution. The new production movement profile still shows transforms/render submission among active CPU costs; its cruise route leaves the fields, so idle/cruise totals are not a controlled same-view thermal comparison.

`playerBatch.ts` now limits instance-matrix update ranges to `mesh.count * 16` floats. Previously every nonempty frame uploaded all 1,024 reserved matrix slots per batch, including unused capacity. All populated slots are still rewritten each frame, so animations, reordering, shadows, growth and reappearance are unchanged. First buffer allocation remains full capacity. Empty batches skip uploads.

Built mobile-emulated browser comparison instrumented actual WebGL bufferSubData bytes during the same frozen frame, forcing full player matrix uploads for the baseline:

| View | Full upload bytes | Populated upload bytes | Changed pixel components |
| --- | ---: | ---: | ---: |
| Town (103,90), height28 | 679552 | 66432 | 0 |
| Field (132,105), height28 | 663424 | 31104 | 0 |
| Rooftop (11,18), height28 | 671488 | 37248 | 0 |

Counts include buffer uploads during each sampled render, not total application/network traffic. Roughly 90–95% less sampled upload data is NOT a 90–95% GPU-time or thermal reduction. Render calls and triangles stayed identical. Physical iPhone validation remains outstanding. Scripts/results: /tmp/fi2-player-upload-review.cjs and .json. Regression checks cover short/full crowds, empty frames, unchanged colors, reordered colors, matrix validity and full reappearance. Player batch, live field, live knockout, Paths and learning-journey tests passed; production build passed. Not deployed; Paths/stories are also local preview only.

### September 15: distinct costume head silhouettes (local)

`clubCostume.ts` now authors species-specific skull proportions, rounded puma ears, lynx tufts/ruff, floppy dog ears, folded pig ears, goat horn bends, long zebra ears, distinct bird bills/eyes and orca face patches. Repeated lions, wolves, foxes and orcas also differ structurally. Existing oversized head scale and raised shoulder-clearance offset are preserved. These are construction-time meshes merged into the existing five head material buckets; no textures, timers, lights, animation loops or per-frame allocation were added. Maximum whole-costume mesh and triangle counts remain 29 and 4,680 (same maxima as the prior version; individual costumes vary).

`tests/costume-heads.cjs` checks 24 head geometry signatures independent of palette, male/female rigs, ride transforms, cached attachment, existing scale/offset and disposal. Desktop/mobile store previews render all24; contact sheet `/tmp/fi2-costumes-distinct-heads.png`. Typecheck passed. Local only; this is visual differentiation, not a measured thermal improvement.

### Pixel stories (September 15)
Story illustration transitions use finite .65s CSS transform animations and one finite sparkle, with reduced-motion and hidden-document handling. No RAF or background timer was added. Retro sound cues reuse createIslandSound and its existing volume/mute/hidden checks and voice cleanup; the document event listener is removed on dispose. Story assets remain lazy per opened story. This is not evidence of physical iPhone cooling.

### Playable story scene
lib/paths/pixelStoryGame.ts replaces story illustration playback with a small on-demand canvas simulation. One cached background canvas and one lazy transparent sprite sheet per open scene. RAF stops at idle, caps paint around30Hz, hidden cancels it; dispose removes input/visibility listeners and ResizeObserver. Bubbles receive position CSS variables during active draw only. Desktop/mobile browser checks verified unchanged draw counts during idle; no physical iPhone thermal claim.

Knockout waiting pens: removed the opaque green wall meshes. All four red wall outlines stay visible with one static instance upload; rising particles remain limited to occupied pens, with existing20Hz/reduced-motion/offscreen rules. Queue-wall tests passed. Story simulation is now watch-only, with scripted movement and finite autoplay timers; no scene input handlers. Scripted kicks do not start a second RAF chain. Desktop/mobile browser checks passed. No new physical-device heat measurement.

Story navigation is manual again: Back/Next, with Replay on the final scene. No autoplay advance timer. Dialogue collapse/expand is a finite CSS scale effect, with no added JS frame loop. Sprite facing/walk frame selection reuses the existing active scene paint. Heating work remains unverified on physical iPhone until the pending upload optimization is deployed and compared.

### Story scene choreography (September 15)
Story animations use finite per-page timelines rather than shared generic states. One Canvas2D render loop caps at roughly 30Hz, stops at the end of the sequence, and pauses for hidden documents. Resize only stages and invalidates a frame. Timelines, gestures and small contextual cues share that loop; no extra timers, particle loops or network assets. Route tests cover 60 bounded distinct scenes. Preserve scene idle sleep when adding future story movements. This is a work-bound guarantee, not a measured iPhone thermal improvement.

### September 15: movement HUD and minimap layer (local)
See [measurements and tradeoffs](hud-minimap-performance-2026-09-15.md). Cache Town viewport dimensions in existing resize handlers; only write HUD hidden state when it changes, and resolve projected building visibility once. Floating prompt movement uses independent CSS translate with existing anchor transforms preserved. Minimap terrain now scrolls as one HTML compositor layer containing the unchanged SVG, retaining smooth motion and fixed player marker. Do not revert to animating the SVG group: alternating diagnostic measurements tied it to roughly60 layout passes/second. Final mobile-emulated four-second movement/boost samples fall to2/3 layout passes from241/222. This is not a total CPU, GPU or temperature percentage. Preserve reduced-motion handling, paused/minimized subscriptions, offshore zoom and boundary, and full-map click targets. Build, resize, prompt click/position and three map visual comparisons passed. Not deployed; physical-device thermals and layer-memory tradeoff remain unverified.

### September 15: cached character render-group bindings (local)
`playerBatch.ts` retains each mesh's render-group binding instead of rebuilding and looking up the geometry/roughness/side string every visible frame. Geometry or material replacement, roughness and side changes invalidate the binding. RGB comparisons, ancestor visibility checks, world matrices, shadow flags and active-prefix uploads are unchanged. This avoids repeated grouping strings/lookups, not character animation or simulation.

Alternating synthetic production-module benchmark:70 real rigs,300 batching frames per trial,six trials. Median grouping/draw CPU time 190.77ms→132.49ms (about30.5% lower for this isolated operation, approximately0.194ms saved per frame in that fixture). This is NOT an overall frame-time or heat percentage. Before/after buffers match exactly across25 frames including position changes, culling, geometry/material/color/side changes. Raw timings: `player-batch-binding-2026-09-15.json`; benchmark `/tmp/fi2-batch-binding-review.cjs`. Permanent player-batch regression checks cache invalidation, visibility and all prior range/color invariants. Typecheck and live-field/live-knockout fixtures passed. Local only, alongside the still-undeployed minimap/HUD fixes. No physical iPhone measurements.

### Production release: minimap/HUD and character binding optimizations
September15 deployment `dpl_FJZj19iaNYWRA3iKvQnzg2J2H9ub` is READY and aliased to https://futbolisland.app (https://futbol-island-6fwcov2lt-khoa0aohk.vercel.app). Supersedes the local-only status of the immediately preceding HUD/minimap and character-binding entries. Local and Vercel builds passed. Live mobile-emulated hover/movement/boost checks verified the new map layer, zero page-size reads and redundant hidden writes, 0/2/3 layout passes in four-second samples, and correct760×440 landscape camera aspect. Raw verification: `performance-release-2026-09-15.json`. Physical iPhone thermal outcome remains unmeasured.

## Explore activity tracking — September 16, 2026 (local)

Explore now tracks truck touchdown, target reveals, parachute deployment, completed roof drops, successful player ball hits (20), and joined knockout round wins (5). Tracking runs at existing successful event transitions; there is no new timer, render loop, or animation. Counters cap at their checklist target and stop persistence writes after completion. Existing saved activity migrates with false/zero defaults for new fields. Preview mode does not earn progress. TypeScript and the Explore regression test passed; this is not a measured thermal improvement or a deployed change.

Explore's Shoot 5 targets checklist derives its count from distinct revealed wall-target IDs in existing ball-hunt progress, so previous target hits count and repeats cannot inflate progress. It subscribes to existing saved events, adds no polling or separate per-hit storage writes, and preserves legacy single-target credit. All 16 activities remain automatic; target threshold/deduplication regression and TypeScript checks cover this update.

Knockout now keeps only the northwest and southeast waiting boxes. Eliminations choose the least occupied remaining box (at most three of the six eliminated players per box), preserving teleport slots. Wall capacity drops from 16 to 8 faces and particles from 48 to 24. The red floor uses two static planes with one shared 28%-opacity material, with depth writes disabled. No additional animation loop is introduced. Gameplay/queue-wall regression tests and TypeScript checks validate the local change.

## September 16: unselected ride animation work (local, not deployed)

`vehicle.ts` now updates helicopter rotor transforms, classic pack flames/compression, and flying-car exhaust only while that model is selected. `flightExtras.ts` likewise skips hidden plane propeller transforms and unselected armor repulsor scaling. Scalar phase clocks keep advancing exactly as before, so switching back preserves the original animation phase. Shared vehicle paint color is parsed/set only when the final selected color changes. No changes to resolution, frame rate, scene population, physics, particles, or visible animation timing.

Comparison `/tmp/fi2-vehicle-parity.cjs` ran 1,080 frames across walking, all flight types, ground rides, and reselecting helicopter/plane against captured pre-change source. Visible mesh world matrices/colors matched exactly on every frame. Rotation writes fell from 5,940 to 2,250 in that fixture (62% fewer for the vehicle update, NOT total frame work). TypeScript and `tests/idle-flight-effects.cjs` passed. This is a modest CPU-work reduction, not a measured phone-temperature result or proof of the original thermal culprit.

### September 16 follow-up: settled lighting, hidden labels, expired impacts (local)

- `islandLighting.ts` skips all work after reaching a lighting preset. Mode changes wake the existing smooth transition; reduced-motion immediate changes still apply. Convergence snaps only below 1e-7 in linear color/intensity/exposure, far below displayed color precision. Initial day lighting now performs zero lerps during unchanged frames (2,400 color lerps avoided across a 600-frame fixture).
- `islandNpcs.ts` delays canvas label repaint/texture upload when the label itself is hidden. The current status is painted when the label becomes visible. Movement/routine simulation is unchanged.
- `ballReactions.ts` stops particle transforms after the .7-second impact pulse expires while retaining knockback, stars, recovery and cleanup. Active particle loops no longer allocate sliced child arrays.

`tests/lighting-idle.cjs` covers idle sleep, wake, transition and immediate modes. Ball-reaction tests cover expiry with particle transform methods guarded against writes, plus existing hit/recovery/cleanup; NPC behavior tests pass. TypeScript passes. These remove avoidable CPU and texture work; no physical-phone temperature measurement or deployment has been performed.

### September 16: packed parachute and empty ground-trail sleep (local)

The packed parachute previously reset all eight canopy mesh scales, four ropes' visibility and material opacity every rendered frame. It now returns while closed after its release animation has finished. Opening, inflation, discarded pack, rope attachment, landing release, cutaway and reduced motion remain intact. Ground trails stop scanning their 48-particle pool when disabled and empty, retaining movement history, teleport/reduced-motion resets and normal expiration of live particles.

`/tmp/fi2-effects-sleep-parity.cjs` compared captured prior source against the new code: 2,520 parachute frames (open/land/cut/reopen and reduced motion) had identical visible transforms/opacities and covering state. Canopy scale writes fell from 20,380 to 4,900 in this mostly packed fixture. 1,350 trail frames across three styles and repeated enable/disable cycles had identical populated instance matrices/counts. `tests/idle-flight-effects.cjs` now guards against packed canopy writes and verifies reopening/landing. TypeScript passes. These are scoped work savings, not total frame/phone-temperature reductions. Not deployed.

### September 16: invisible character highlight (local)

`characterGlow.ts` previously animated 18 sparks and three orbit arcs every frame with no hover. It now skips their transforms/material updates below its existing visibility threshold, and only updates shell visibility when that threshold changes. The scalar animation clock and fade still advance, preserving the exact phase on hover/rehover. `/tmp/fi2-glow-parity.cjs` compared 1,800 idle/hover/fade/rehover frames including reduced motion: visible matrices, opacity and shader strength matched exactly; spark position writes fell from 32,400 to 4,644 in that fixture. `tests/character-glow-idle.cjs` verifies sleep/wake/fade/reduced-motion/disposal; TypeScript passes. No frame-rate, visual or thermal-result claim; not deployed.

### September 16: active trail buffer upload ranges (local)

`jetExhaust.ts`, `flightTrail.ts`, `parachuteTrail.ts`, and `rideTrail.ts` now mark only active instance-matrix prefixes for upload (`count * 16` floats), and colored trails mark only their active RGB prefixes (`count * 3`). First GPU buffer allocation still uses full capacity. Every active slot continues to be written; expiry, compaction, style changes, reactivation, particle budgets and visuals are unchanged. Empty effects do not flag uploads. This extends the previously validated player-batch approach to trail buffers.

`tests/trail-upload-ranges.cjs` covers 360 frames per effect, boost/style changes, expiry and restart. Summed requested upload ranges versus full reserved-buffer sizes: exhaust 1,265,172 / 2,162,048 bytes (41% less), flight 521,344 / 1,077,248 (52%), parachute 722,152 / 1,969,920 (63%), ground 51,328 / 752,640 (93%). These are synthetic requested-range totals, not captured GPU traffic or total frame/heat improvements. Idle-flight regression and TypeScript checks pass. Not deployed; real-device cooling remains unverified.

### September 16: recurring joint lookup and hidden landing-marker work (local)

Cached island skateboarders' left shoulder alongside their existing right shoulder instead of recursively searching both every pose. Powered armor caches the underlying player's head when binding a rig, alongside its existing limb anchors, instead of searching the hierarchy every active frame. The underlying player head is stable across appearance/costume changes; binding a new rig refreshes the cache. The landing marker skips scale/opacity pulse updates once its existing fade falls below visibility, while retaining its time/fade state for reactivation.

Ironman helmet regression passes across 23 mascots plus default, with head restoration and animated alignment. Landing-marker tests now forbid transforms/surface queries while hidden and verify reactivation, existing fade and floor placement; NPC behavior and TypeScript checks pass. Traffic was inspected but not altered: rigid material batches already disable local matrix rebuilding, so a broad duplicate traffic-transform optimization was not justified. These are small CPU reductions with no measured thermal claim; not deployed.

### September 16 GPU diagnostic resumed

User-requested `/tmp/fi2-major-gpu-audit.cjs` ran the existing frozen-flight GPU timer diagnostic in local mobile Chromium at unchanged rendering settings. Fifteen samples per mode: full median 2.347207 ms; diagnostic shadows-off 2.000499 ms; diagnostic flight-effects-off 3.301374 ms. This single-view, desktop-hosted run is noisy (removing effects was slower), and does not justify a large thermal-saving claim or a production visual downgrade. Shadows/effects were restored and no rendering setting was changed. It does not measure iPhone temperatures.

### Building-target presentation and facing

Six existing ball-hunt IDs moved to east walls (Books, Rua Nova, Local Library, Community Hall, Corner Deli, Coast Apartments); saved discovery IDs remain intact. Wall facing drives geometry rotation and front-only hit detection. Debris starts at the actual wall position; pickups/clues match the new approach. High targets use muted brass/cream and smaller round faces, omit KICK labels and ground arrows, and retain forgiving hit areas. No new timer, animation loop, or texture asset; fewer attached high-target label meshes. Coin hit/collection/effect tests cover east and south approaches. Local, not deployed.

Building-target spacing follow-up: relocated six more wall discoveries to eliminate nearby clusters, retaining only the practice-wall and futsal-parking pairs. All 20 wall targets now have at least 35.47m horizontal separation outside those exceptions. Eight face east. Smaller muted tan/brass markings reduce contrast; original forgiving hit areas remain. Names, clues, detailed directions, pickup locations and world hint markers all use the same updated COIN_QUEST entries; original IDs/order preserve saved progress. `tests/ball-target-spacing.cjs`, coin-solids charged-shot/direction/pickup checks, coin persistence tests and TypeScript pass. No added runtime polling or effects; local only.

Store simplification: item cards no longer render keyboard/action strips or Path badges/links. Path completion retains learning feedback but no longer advertises badges, equipment or Store rewards; the completion screen no longer loads Store previews. Gear and base characters are independent of quiz/Path progress, with future requirement metadata removed. The separate 50-ball costume policy and existing collection saves remain intact. Customization, learning-progress, coin-progress tests and TypeScript pass. Local only.

### September 16: aerial discoveries and umbrella feedback (local, not deployed)

Five parachute-only balls bring the catalog to 55, using the existing distance-gated ball animation and pooled collection effect. They add no parcel geometry, colliders, independent timer or animation loop. Collection requires parachute phase and a generous 3m horizontal / 2.5m vertical tolerance. Five new lesson concepts and diagram sequences load through the existing lazy lesson modal. Version-3 progress preserves costumes already earned by completing the previous 50.

Umbrella canopies retain individual meshes so a kicked umbrella can fold and spring open in 1.45 seconds. Poles and furniture remain statically batched. Only active reactions write transforms, repeated hits cannot restart the fold, reduced motion stays still, and disposal releases the retained geometries. This trades a small number of canopy draw calls for interaction; it is not a verified heat saving. Unit checks cover idle sleep, folding/restoration, collection gating, migration and distinct lesson sequences. TypeScript passes; real-device visual/thermal testing remains outstanding.

Aerial balls now use staggered altitudes 60/80/100/120/140m. While parachuting nearby, a shared unlit gold torus highlights each remaining aerial ball and its visual scale increases; no bloom, lights or particle emitter is added. Rings hide outside 150m horizontally or 160m vertically and after collection. Umbrella ground-hit radius now reaches table/chair edges so furniture collisions can trigger the fold before the ball reaches the pole; upper-floor checks remain. Local regression tests cover these gates.

Umbrella timing refinement: 0.12s snap shut, 1s folded spring buildup, small opening bounces and a final broad stretch; settles by 2.35s. An on-demand shared-geometry particle pool emits ten small flecks per opening, capped at thirty concurrent meshes, with 0.7s lifetime and no shadows. Reduced motion skips the reaction and particles. No new render loop or idle transform writes.

Beach umbrella mats/loungers now share the owning canopy reaction using one-time cached rotated bounds. Furniture stays statically batched; one canopy cooldown avoids duplicate folding. Broadleaf canopy collisions, potted shrubs and rooftop small trees now shed small fluttering leaves through the existing 48-particle pool; palms retain their narrow fronds. Tree checks remain collision-triggered, with no extra per-frame mesh animation or free-flight scanning. Tests cover linked mat edges, upper-floor exclusion, canopy hits and fixed-pool expiry. Local only.

Leaf responsiveness: reduced impact speed threshold to 1.2, shortened per-tree cooldown from 0.8s to 0.3s, and increased initial leaf descent speed. Shortened lifetimes to 1.9s (leaves) / 2.5s (palm fronds) to offset more frequent hits; pool remains capped at 48 with collision-only activation. Tests cover immediate light-kick response and repeat cooldown.

### September 16: distinct island conversations, rankings and on-demand clips (local only)

- All 60 talkable characters (54 roaming/resident, two wall-practice, four volleyball) have distinct names and greetings. Authored resident/roamer encounters replace copied mentor topics. Purpose labels reuse the existing visible-label repaint gate; no additional character meshes, particles, render loops or simulation frequency are introduced. Shared locomotion rigs remain shared.
- Twenty match-story residents have explicit competition assignments, two each across Premier League, La Liga, J1, Ligue 1, Serie A, Bundesliga, Brazilian Série A, Champions League, WSL and MLS. Each pair has a different first-match offset and viewing focus. No cross-league fallback; unavailable goal details stay explicitly unknown.
- ESPN soccer date-range queries returned HTTP 400 during live verification. Scoped feeds now request individual dates (past seven days through tomorrow), at most three server-side requests concurrently. Browser requests still return one bounded feed. Five-minute browser/server caches and pending-request coalescing prevent repeated work when reopening or sharing a conversation. Removed NpcNews's minute polling interval. Scores only load when a conversation needs them, never while roaming.
- Noor alone offers an on-demand ranking component: reorder ten candidates, highlight your first five, compare Messi/Cristiano Ronaldo and team eras. Rankings are explicitly personal, not official, and reset with the conversation. This is React state changed on taps, with no animations or background work.
- Video discovery is separate from score fetching. Official YouTube Atom feeds are fetched only after choosing a clip action, cached for ten minutes and capped at five suggestions. The source list is fixed, not user-supplied. Clip publication must be within seven days; popular means view-count order within the returned recent uploads, not a verified global viral chart. UEFA/Brazil general feeds are restricted by competition title terms. The CBF source may have no Série A clip on a given day.
- Match clips require the same competition, both team names (limited explicit aliases), highlight wording and an upload after kickoff within 48 hours. A conservative mismatch shows no clip. This may omit a legitimate clip with an unfamiliar abbreviation rather than attach the wrong match.
- Thumbnails load lazily after requesting clips. The youtube-nocookie iframe is created only on Play, never autoplayed on opening a conversation. Only one iframe plays at once. Closing the video/chat, changing clips, hiding the document or scrolling its card out of view removes it. No YouTube API script runs while exploring. Embedding/territory restrictions remain publisher-controlled; a YouTube link is always available.
- Validation: TypeScript; personality uniqueness across all 60; league coverage and offsets; existing NPC behavior/match-story tests; news parsing and scorer details; clip freshness/allowlist/match filtering; coalescing/cache/concurrency tests; mobile browser ranking, no idle requests, tap-only player and cleanup. Live local checks returned J1, Ligue 1, Brazilian Série A, Champions League scores and official Premier League video entries. Desktop browser verification is not an iPhone temperature measurement.

Source notes: league/publisher channel IDs were resolved from their canonical YouTube channel metadata on September 16. Official links include https://www.premierleague.com/en/news/1301094, https://www.laliga.com/en-ES/news/la-liga-channel-surpasses-100-million-youtube-views, https://www.jleague.jp/en/, https://www.cbf.com.br/a-cbf/noticias (links @brasil), and the Serie A digital guidelines at https://img.legaseriea.it/vimages/66bc6cc3/Digital%20Guidelines%20-%20Lega%20Serie%20A.pdf.

### Child-facing video safeguard (September 16, local)

The video publication gate now requires an individually reviewed ID in `lib/town/approvedIslandClips.ts`, exact approved publisher ID, a nonempty review note, a valid review timestamp and an expiry no more than 72 hours after review. Uploads older than 72 hours are excluded. The registry intentionally starts empty: no unseen video has been marked reviewed. With no current approvals for a league, the route returns no clips without contacting YouTube or the scoreboard. Source allowlisting alone is not a content safety assessment.

Publication approval is checked server-side each time a card opens and again when Play is tapped, with no client result cache; underlying source feeds still use their ten-minute server cache and concurrent requests coalesce. Late Play responses cannot mount a player after the conversation changes or closes. Approval removal/expiry takes effect on the next request. Tests cover unreviewed, wrong-source, expired, future, malformed and stale-upload exclusions. A human reviewer must watch the full clip and audio and check its title/thumbnail before adding an approval; do not approve from metadata or popularity. Embedded YouTube ads/recommendations cannot be guaranteed kid-safe by this app; a fully controlled child video library would require appropriately licensed, reviewed first-party playback.

### Ten on-demand video desks (September 16, local only)

Added ten dispersed residents with distinct teaching prompts: five UEFA concepts, three ESPN FC topics, a UEFA Champions League final recap desk and CBS Sports Golazo final discussion. Existing distance/frustum pose gates and shared character routines are preserved; ten additional rigs still add memory and nearby rendering cost. No automatic score request, feed polling, video preload, new animation loop or autoplay is attached to these residents. A single existing lazy player opens only after an explicit clip request and Play approval recheck.

Topic metadata comes from the individually reviewed registry, filtered by exact publisher ID, specific concept, publication within 72 hours and valid review expiry, with at most five results. Empty registry returns no clips and performs no external source requests. This is a curated publication workflow, not an automatic claim that unseen videos are safe. Final recaps must be dated and reviewed for any latest-final claim; no fabricated final scores are displayed. ESPN FC and CBS Sports Golazo channel IDs were checked against their canonical YouTube about-page metadata. Human clip review remains required before any topic video appears.

AGENTS.md now makes low mobile heat an explicit requirement for every change, including non-graphics features. Local tests cover unique conversations, topic/source gates, request bounds and TypeScript. Real-device thermal improvement is not established; not deployed.

### Teaching cue clarity (local)

Positioned teaching highlights now have one owner in lessonCues: removed the independent fieldRuntime highlight-ring draw, merged concentric spotlight/zone/feedback markers, and gave quiz targets priority while preserving their hit areas. Arrow shafts terminate inside their arrowheads; movement routes use one terminal arrowhead. Reuses existing buffers, fills and update loop, with fewer duplicate draws and no new animation or polling. Teaching captions and end actions now share normal layout flow above playback controls to prevent mobile overlap. Cue, picking, pause/seek and route tests pass; no claim of measured phone cooling.

Teaching cleanup follow-up: world construction caches its scene roots, so one transition-only visibility call hides every retained dynamic object (including ferry and umbrellas) along with static scenery, then restores them on exit. No per-frame scene scan was added. Removed the unused 22-mesh highlight pool. Quiz choices use small unboxed numbers and keep only player labels named in the question; choices disappear during outcome playback. Hidden teaching-beat UI no longer polls. Quiz replay shares layout flow with controls, while redundant disabled quiz transport and counters are omitted.

Map travel now restarts the existing 3.5-second arrival effect for district and field destinations; no new geometry, timers or animation loop. Arrival uses the original camera-facing angle. Five secondary buildings reuse roundedBlock with 1.5m corners and matching collision/roof metadata, remaining in static scenery batches. Live kickoff waits for own-half readiness (opponents outside the centre area), checked only during restart; regression covers both teams in all four formats. TypeScript and teaching-cue tests pass. Local only; no measured thermal claim.

Charged-shot reliability: a nonzero released charge can start a new windup even if the previous kick is still winding up or airborne. Late zero-power taps cannot overwrite it. Cancelled/released button holds suppress the follow-on click (including zero-detail synthetic clicks), preventing a cancelled mobile hold becoming a low tap shot. Existing simulation handles the launch; no extra timer, polling or particles. Charged-shot regressions cover repeated launches during windup/flight and full-height trajectories; ball actions and TypeScript pass. iOS hardware interaction still needs confirmation.

### Video playback restored at user request

Removed the mandatory empty per-video approval gate and upload-age cutoff from public clip routes. Source allowlisting, exact channel IDs, valid video IDs and future-date rejection remain. Topic desks now request UEFA, ESPN FC or CBS Sports Golazo feeds only when opened, sharing ten-minute channel caches and pending requests (one-minute failure cache). Topic matching remains conservative; no matching upload is shown as such rather than mislabelled. Maximum five cards; one tap-to-play iframe; hidden/closed cleanup unchanged. Publisher age/region/embed restrictions remain outside app control. Official-source clips are not individually reviewed or guaranteed child-appropriate. Previous review-registry notes describe a superseded workflow. Local only.

### Additional rounded buildings and official video discovery — September 16
- Rounded ten existing buildings using the existing static rounded geometry and matching collision metadata. No extra buildings, animations or per-frame scans; dimensions and positions retained. Small static geometry increase remains in existing scenery batches.
- Official YouTube feeds now sort by publication date. Empty topic/result matches offer explicitly labeled recent channel uploads; they are not represented as the requested match or lesson. On-demand fetches, shared ten-minute server caches and single tap-to-play iframe remain. No background polling added.
- Validation: TypeScript and clip/topic/request-budget checks passed; local UEFA scanning endpoint returned recent official uploads with channel-fallback labeling. No iPhone thermal claim. Not deployed.

### Video playback fallback — September 16
- Load official YouTube IFrame API only after Play. Player onError switches to a recent ESPN FC or CBS Sports Golazo upload, preferring a different publisher. Backup is explicitly labeled as potentially a different match/topic. Manual Try another source covers restrictions that do not emit errors. No claim that every clip is US playable; availability is publisher-controlled at playback.
- Backup metadata fetches reuse existing per-channel ten-minute caches and pending requests. At most three automatic player attempts; failed IDs excluded within a conversation. Destroy the prior player before switching, on hide/offscreen and close. No idle player/API requests or retry polling.
- Verified TypeScript, request-budget tests and Chromium mocked error 150: switches source, one iframe only, close destroys iframe, no idle feed requests. Actual US-region playback and iPhone heat not established. Not deployed. Reference: https://developers.google.com/youtube/iframe_api_reference#Events

### Recent-only video requirement — September 16
- All public clips and backups limited to uploads in the last 14 days, newest first. Shared recentIslandClips rechecks cached results at response time and removes duplicate video IDs. No older fallback. ESPN FC goals/analysis and CBS Sports Golazo provide multiple backup candidates through shared channel caches, without additional background work.
- Tests cover the 14-day boundary, cached expiry, future dates, duplicates and chronological ordering; TypeScript passed. Local live backup endpoint validated for recent-only unique clips. Not deployed.

### Player career highlights and exclusive video playback — September 16
- Current/all-time profiles now include an on-demand player highlight section. Career searches allow older uploads and prefer 4+ minute videos sorted by view count, with duration as tie-breaker. Backups remain specific to the player. News keeps its 14-day rule.
- Career search needs server-only YOUTUBE_API_KEY with YouTube Data API v3 enabled (set in local .env.local and deployment environment; never NEXT_PUBLIC). No key is currently configured. Without it, show an honest unavailable state, no unrelated clips or broad feed crawl. Two bounded US/embeddable searches plus one metadata request per uncached player; 24-hour cache and request coalescing. Only allowlisted official publishers; validate US regional restrictions/public/embeddable metadata. View ranking is among matching retrieved official clips, not a claim of exhaustive YouTube-wide ranking.
- Video ownership pauses/cancels the Town animation loop, all simulation driven by it, music media playback, and sound context. Resuming resets delta/accumulator and respects existing modal pauses; no catch-up simulation. Pause/end/error/close releases ownership. Nested/overlapping ownership cannot prematurely resume another player. Player rendering exists only while playing, not during profile browsing. Background lesson narration pauses too.
- Unit checks cover older clips, 4-minute minimum, views, regional/embed/source restrictions, exact player filtering and overlapping pause ownership. TypeScript passed. No measured iPhone thermal result. Not deployed.
- Browser validation passed with a simulated YouTube error: backup switches once, one iframe remains, island render count stays fixed during playback, music is paused, sound context is blocked, and closing removes the iframe and releases the sound pause.

### No-API career library and truck impacts — September 16
- Supersedes the API-key career-search requirement above. Player endpoints now read a saved server-side JSON catalog only. No key, search calls or third-party metadata requests while opening profiles. Offline collector stops further network requests on HTTP 429; cached-data auditor can work without network. See player-highlight-coverage.md for incomplete coverage and verification limits. News stays recent-only. Existing exclusive video playback pause retained.
- Driven trucks check character impacts at 10 Hz with a swept oriented body to catch boost and reverse movement. Reuse existing finite ball-hit bounce/daze effects with truck cause and 3.3 m bounded displacement. Only the driven truck activates checks; static goals reject truck movement through their footprint. Elevation excludes rooftop goals/characters from street collisions.
- Live matches have a separate collision-pause reason until all truck-hit players finish recovery; user and hover pause reasons are preserved. Island characters, volleyball players and practice characters share existing stunned routines. No extra render loop or continuous effect added.
- TypeScript and swept truck/goal checks passed, along with existing 192 walking/riding goal approaches. No phone-temperature measurement. Not deployed.

### Truck witnesses keep moving — September 16
- Collision pause stops match simulation/ball, not standing-player body animation. Nearby players face the incident and make light hand/body gestures; hit characters retain bounce/daze/get-up. Island witnesses pause their routes while gesturing, then return to their previous routine.
- Speech is event-triggered, max three lazily created/reused 512×192 canvas textures, five-second lifetime and eight-second burst cooldown. Text uploads only on a new burst; active sprites follow anchors. No separate RAF or React state loop. Hidden lessons suppress bubbles, inactive menus/video pause existing Town updates, and disposal releases textures/materials.
- Truck checks remain gated to driven movement at 10 Hz. Extra match-reaction lookup short-circuits when there are no hit states. TypeScript passed; browser integration checks the match clock remains fixed while standing players still animate. No real-device thermal claim.

- Truck speech now selects text per speaker: live-match players use pitch/match jokes; island residents use pedestrian/errand jokes, even beside a pitch. Separate phrase rotation, same three reused bubbles and cooldown; no new animation or polling work.

### Procedural movement refinement — September 16
- Walking leg solves are skipped when ride, flight or seated truck poses fully overwrite them. Shared movement clocks stay intact. 1,800 old/new pose comparisons passed across bike, scooter, moped, jetpack, truck and parachute, including reduced motion.
- Receiving weight yields to the existing kick envelope without shifting ball contact. Bounded torso/head turn anticipation and optional nearby ball attention reuse existing joints; gaze is restricted to involved actors and disabled for costumes, rides, reduced motion and reaction poses. No new geometry, independent timers or animation loops.
- Live-match pose evaluation now uses the existing generous body/shadow frustum before joint work. Teaching actors, ball owners, receptions, kicks, reactions and protesting players remain immediate. Culled roots retain simulation positions; resuming resets locomotion integration to avoid catch-up sprinting.
- Browser partial-pitch check skipped 13 poses; disabling culling resumed all with finite transforms. Existing motion, batching, match clock, stairs, ramp, ball-action and 918 teaching-contact beat checks passed, plus new gaze/pause/transition tests and TypeScript. These are correctness/work-count results, not measured iPhone cooling. Local only, not deployed.

### Shared play / quiz visual simplification — September 16
- Removed floating coaching labels across all formats. Role names no longer cover plays or result replays; unanswered quizzes retain only player labels explicitly referenced in the question and every selectable numbered answer.
- Plays and quiz demonstrations share a cached presentation plan and one coaching caption in the existing control area. Authored beat captions take priority; older steps sequence their callouts using the existing seekable progress clock. No new animation loop or network request.
- Instructional markings are limited to two emphasized areas, one movement trail and bounded supporting routes, with focus following the active caption. Answer choices are exempt so options remain visible and selectable. Completed play steps clear instructional overlays. No actor positions, answer correctness or ball timing changed.
- Validation: all 918 steps and 193 questions retain teaching geometry and every neutral quiz target; play-label/fill limits, pause/seek, choice hit areas, quiz outcomes and replay checks pass. Production build passes. Local only; no measured iPhone cooling claim.

### Future ferry marker and path introduction — September 16
- Added a single 1,404-vertex gold lock mesh above the Matchday Ferry. Shares an existing palette material, casts no shadow, and rotates only in the renderer's visible-mesh callback using the existing ferry clock. No particles, lights, independent timer or frustum scan. Reduced motion keeps it still; existing ferry disposal owns its geometry.
- Browser check verified rotation, reduced-motion reset, retained dynamic parent and no shadow. TypeScript passed. Static Paths introduction explains first-island preparation for the future academy; no future destination is playable or unlocked by this change. Local only; phone thermal impact not measured.

Ferry marker follow-up: lock now uses building-highlight green (#35ed8b) at 38% opacity. Twelve soft particles share one Points draw and a small shader; fixed seeds never upload per frame, time uniform updates only when rendered. No lights or shadows, particles hidden with reduced motion, all resources included in ferry disposal. TypeScript and browser checks passed for tint, opacity, count, rotation and reduced motion. Adds one bounded transparent draw; no real-device thermal measurement.

### Four format starter paths — September 16
- Replaced three pilot chapters as the main Paths view with four canonical format paths: 12 starter lessons each, 48 optional depth lessons, all 96 existing lessons retained. Compact static metadata only; existing promise-cached format catalog fetch happens at lesson launch, not while browsing Paths. Stories stay dynamic/on-demand.
- Completion derives from all canonical played-step facts plus all correct quiz facts, preserving existing saves and allowing help/retries. Continue resumes the first missing played step or quiz question. Optional stories/depth/pilot practice do not gate starter completion; existing narrow pilot application/review evidence stays separate. Correct quiz writes merge persisted other-tab answers before saving.
- Existing five stories appear at curriculum anchors; story progress merges previous saved IDs. Four-format selection persists. Existing pilot practice remains reachable as optional practice. No new review scheduler, timers, asset preloads, challenges or future-island gameplay.
- Onboarding refreshed by delegated agent in onboarding-only TSX/CSS: six brief steps, tan modal, selected character continuity, four formats, exploration and future ferry language. Existing costume preview and spotlight mechanisms retained.
- Ferry lock now pink (#ef8fb3), 22% rest opacity / 90% hover, 12 matching particles. Shared hover ray uses one box test; tap opens standard modal explaining all four starter paths plus all hidden balls are prerequisites for future academy travel. Dialog joins the existing world-pause condition. No new effect loop.
- Validation: production build and TypeScript; 96-ID curriculum/evidence/launch tests; quiz persistence and two-writer merge checks; mobile browser four tabs, canonical lesson launch, return to selected format, embedded-story Escape/focus, no horizontal overflow, and lock hover opacity. 1st island remains playable; ferry travel not implemented. Local only, not deployed. No physical iPhone thermal claim.

### Single quiz panel — September 16
Combined question, short feedback and replay/next controls into one panel above chat/radar. Answer replaces question; wrong answers offer demonstration and retry, correct answers offer replay/pause and next. Full explanations remain in transcript. Reset view sits beside camera; removed duplicate coaching caption and separate top question panel. Replay UI interval now exists only while a demonstration is running and stops when paused/finished. Mobile browser verified one panel, incorrect retry, correct next, question advancement and no chat overlap; canonical quiz replay/outcome tests pass. No extra render loop or asset load. Local only.

## Mental-toughness film prototype — September 16, 2026

The reset story now uses an offline-rendered 30-second film from the actual upstream hand-drawn-canvas-animation engine. All 17 files/license are vendored; see docs/story-film-review/README.md for reproduction and inspected contact sheets. Offline dependencies are excluded from deployment uploads.

Runtime loads a poster only and attaches the 720px MP4 on Play. Native media events update captions/progress; no canvas loop, generated textures, audio score synthesis or upstream engine download runs on the phone. Pause/hidden/offscreen/close stop playback and unmount clears the source. Existing media ownership suspends background island/audio work while playing. Initial sound respects saved mute/volume. Desktop/mobile browser checks passed for loading, pause, replay, early exit and completion. Reduced live drawing work is not measured iPhone cooling. Not deployed.

Abstract story revision: richer textures and connected zoom/iris transitions are
baked into the same 720px 30-second video, with no runtime texture or transition
rendering. All eleven scene boundaries match exactly in the exported PNG frames.
Other stories remain unchanged; not deployed.

### Mental-toughness color/emotion revision
The prototype is now 60 seconds, with full-frame print textures and expressive illustrated player poses. These are rendered offline; no new runtime canvas, particles or animation loop. Longer media increases bytes and playback duration, while retaining on-demand loading and background pause. Device thermal behavior is unmeasured. Not deployed.

### September 17 story illustration and motion
Replaced dense full-frame halftones with bold flat illustration and selective patterns. Added animated concept lettering, distinct scene layouts, independent body/botanical motion and connected camera transitions, all baked into the existing 720px/24fps H264 movie. No added runtime renderer or animation loop; 60-second duration and on-demand video lifecycle remain unchanged. Eleven scene boundaries match exactly in source renders. Real-device thermal outcome remains unmeasured. Not deployed.

September 17 texture refinement: fixed-seed grain, dots and hatch patterns are baked into the mental-toughness MP4; no runtime texture generation or added render loop. More detail may increase encoded media bytes. Existing on-demand load and pause behavior remains. Not deployed; no device-temperature claim.

September 17 futbol mural revision: elongated expressive figures, procedural pitch/murals/palms, handwritten titles and irregular scuffs are baked into the existing 60-second H264 asset. No live scene renderer, extra image requests or animation loops were added. Playback stays user-initiated and pauses background island activity. Texture detail affects encoded bytes; device heat has not been measured. Not deployed.

Story smooth-motion refinement: native 24 unique frames/sec replace duplicated 12fps art within the same 720px/24fps playback format. Offline renderer samples unchanged core at half-frame times. Hierarchical limb transforms and simultaneous scene motion are baked into MP4. No added runtime loop; background pause/on-demand loading remain. Media size can change; this is not measured device cooling. Not deployed.

Validation correction: earlier exact-boundary comparisons used RGBA difference bounding boxes and were not reliable because the alpha channel was unchanged. RGB validation of the current smooth export confirms 24/24 sampled adjacent frames are distinct. Across all 11 boundaries, mean per-channel pixel differences are 3.45–5.45 out of 255; boundary frames deliberately retain motion, rather than duplicate. Browser checks pass for on-demand load, pause, replay, early close and completion on mobile/desktop.

Story atlas revision: actual user-supplied sprites and Knewave font are read only by the offline rendering page. Main app still requests just the poster and one on-demand video; no atlas decoding, font loading, particle simulation or parallax loop added to gameplay. Layered backgrounds and narrative shape morphs are baked at 720px/24fps. Not deployed; thermal impact unmeasured.

### September 17 — immersive 11v11 Grit film
The Grit path slot now opens a viewport-sized top-layer dialog, including when launched from Paths. Mental-toughness work is paused and its existing film is unchanged. Grit uses the supplied tree storyboard and TreeMetaphor narration, rendered offline into portrait 720×1280 and landscape 1280×720 H264 films, approximately 76.4 seconds. Only one source is chosen on Play (9.1 MB portrait / 8.6 MB landscape); no runtime canvas, source-sheet decoding, animation timer, or second-video preload. Native media events drive captions/progress. Existing video ownership pauses island work; hidden/offscreen/unmount pause and release playback. Controls remain above the artwork with safe-area spacing. The contact-sheet source limits enlarged sharpness; extracted artwork is reframed, with moving textured soil/leaves and organic zoom reveals, not a fully articulated tree rig. Captions use authored approximate cue times for the supplied audio; final football practice takeaway appears at completion.

Validation: TypeScript and production build pass. Chrome 430×900 and 1280×800 checks verified viewport coverage, no MP4 before Play, selected portrait/landscape source, pause stability, early-close without progress, completed-film progress, and no page errors. Screenshots inspected. Local only, not deployed. No measured phone-temperature claim.

### September 17 — Grit procedural animation and recorded voice cues
Replaced the contact-sheet crop film with JavaScript Canvas geometry: progressively growing tapered roots, an obstacle they bend around, shifting earth, shoot breakthrough, branch-attached unfolding leaves, growing fruit, wind, and a jointed player taking a practice touch. A continuous world camera moves between these details; seed and fruit/sun transitions share a full-screen colored object. Fixed-seed texture is cached during offline rendering. No source artwork bitmaps are read by the new authoring script.

Local faster-whisper transcription supplied phrase/word timing (no audio upload). Growth and teaching callouts now follow the narration; captions use the same phrase timings. Supplied audio is unchanged. The recording's last spoken phrase ends around 71.6s; the remaining time holds a football practice takeaway.

Current media: 1080×1920 portrait and 1920×1080 landscape, 24 unique fps, approximately 30 MB each, 76.4s with H264/AAC. Full-HD and detailed grain increase media transfer/decode cost compared with the previous 720px film; only one on-demand movie is loaded. Rendering, texture generation and transcription remain offline. Island playback ownership/hidden/offscreen cleanup are preserved; no real-device thermal measurements.

Validation: TypeScript and production build pass. Browser checks verified full viewport, no MP4 before Play, one correct-resolution source per orientation, timed darkness caption at 30.8s, no authoring JS/atlas requests, pause stability, early-close without completion, and successful completion. Inspected portrait/landscape frames. RGB comparisons at the two hidden joins: seed boundary 0 mean channel difference; fruit/sun boundary 1.48–1.71 out of 255, preserving continuity. Local only, not deployed.

About Us navigation follow-up: existing back button moved into the header before the title, duplicate body button removed. Reuses existing navigation state, icon and hover styling; no new timers, effects, assets or render work.

### Grit scenery, camera and mobile control follow-up
Grounded the scenery with a continuous undergrowth band extending below soil; varied shrub contours, tree silhouettes and skyline roofs/windows. Crown now has layered irregular foliage and fruit on both branch sides. Recorded down/up phrases get close camera moves; the dark/heavy section is framed entirely below ground and the light section entirely above it. Mobile callouts wrap and balance in a narrower safe area. These changes are baked; no extra on-device animation work.

The opening uses a 1.4-second camera push. Orientation-specific stills are exported from the exact first source frame and selected by a native picture element, visible until playback starts. Current H264/AAC files are 24.28 MB portrait and 24.09 MB landscape (decimal), full HD/24fps. First decoded frame versus corresponding JPEG poster has mean RGB difference 2.31/2.34 out of 255 from encoding, with matching composition.

Story controls now use the quiz-bar layout: play/pause at left, sound icon at right, permanently visible balanced captions beneath. No caption toggle or separate transport strip. Fixed a global mobile `dialog[open]>section:first-of-type` rule expanding the bar over the whole movie: the caption region is now a div with an accessible region role, outside that generic panel selector. Browser verified bar height below 240px initially and 300px for the tested long caption, lower-screen placement, visible running video, clickable close, pause and completion. Screenshot inspected at 430×900; desktop lifecycle also passes. About header navigation passed earlier. Local only, not deployed; no physical thermal measurement.

### Grit click-to-play and stable mobile bar
Opening Grit now requests unmuted playback in the mount layout effect, following the user's story click. Story sound starts enabled even if island sound is muted or its saved volume is zero (fallback 50%); the island's saved preferences are not changed. Source loading still begins only when the story is opened. Manual pause/mute remain available; browser-denied playback leaves the Play action available, and canceled/unmounted play promises do not update state. Existing video ownership and hidden/offscreen cleanup remain. No polling or extra animation loop.

Mobile caption bar now reserves 224px, with a 170px compact landscape rule. Its caption area flexes/scrolls internally instead of resizing the region when words change or Finish appears. These are CSS-only layout changes. No device heat claim; local only.

### Grit immersive responsive framing — September 17
Replaced baked movie titles with one responsive DOM text layer driven by native `timeupdate`; removed duplicate direction/callout labels. ROOTS MIRROR FRUIT sits at the soil/sky boundary. Growth terms appear as a single term/explanation pair while the camera visits the relevant roots or canopy. Brush font is shared; balanced wrapping and bounded font sizes avoid scaling lettering with video crops.

Story artwork now covers the whole viewport behind the controls. Three separately composed exports (portrait, square, landscape) minimize cropping across phone/tablet/desktop ratios; only the closest ratio is loaded. Resizing across framing thresholds preserves playback time and paused state, replacing the one media source. Background scenery extends beyond the central subject. Extreme aspect ratios can still crop peripheral scenery. Captions reserve 144px on mobile, 128px desktop, 116px short landscape, with internal overflow for long text. Replay shares the control row; Close stays circular.

Added narrated camera movement for gravity/light, moving light beams, soil particles, upward energy and canopy pollen; leaf and root-sap motion now use real story time even when growth slows. Lonely-face/dark-earth zoom and desktop wider framing are baked offline. No extra runtime animation loop or canvas; existing island pause/media cleanup remains. Current movies are 26.58 MB portrait, 17.74 MB square, 26.58 MB landscape at 24fps, with original narration. Posters match frame zero. Local only; physical phone temperature unmeasured.

Validation: production build passed; mobile autoplay with sound, manual pause/mute, stable reduced bar through completion, replay positioning and close behavior passed. Responsive viewport/text checks performed separately. Superseded temporary render folders were removed after disk exhaustion; complete exports were rebuilt before installation.

Follow-up validation: full-screen bounds, single title and compact bars passed at 320×568, 390×844, 768×1024, 1280×800 and 1920×1080. Resize initially stalled because `preload=none` requires explicit `load()` after replacing a paused source; fixed with preserved seek/resume intent and generation guards. Playing desktop→phone→tablet→desktop→phone checks now pass with advancing, preserved timestamps. Added missing RESISTANCE, complete opening question, and lower placement for gravity/deeper-underground labels. These remain native-event DOM/CSS changes.

### Grit browser-stability follow-up
After a user-reported browser crash, lowered playback assets from 1080p to 720p (55.6% fewer decoded pixels/frame), retained 24fps and sharp independent DOM text, and capped video rate at 2.5 Mbps. Only one format is loaded. Resizing now waits 300ms after the last resize before switching sources, preserving time/playing intent; this avoids repeated decoder replacement while dragging window edges. Island media ownership is held for the full story dialog lifetime, including pauses/source changes, so background simulation cannot restart during a switch. Hidden/offscreen still pauses video and close clears its source.

Tears now roll down without arms; matching blue droplets and an expanding water surface connect the lonely face to water moving along roots. Exported offline in sequence, not concurrent runtime effects. These mitigations reduce known work but do not establish the cause of the reported browser crash or prove a thermal fix. Real-device heat/stability testing remains necessary. Local only.

Grit transition refinement: removed the full-screen blue iris. The face/tears now dissolve as matching small droplets appear on roots, with a continuous camera pullback and gradual dark-soil lighting recovery. Re-exported only affected offline frames into the same bounded 720p/24fps assets (immersive-12); no new browser animation work. The repeated gravity caption now reads INTO THE DARK / Roots keep growing down on the later narration beat. User reports the earlier crash no longer occurs; this is not a measured thermal result.

Tear continuity follow-up (immersive-13): six tracked droplets now depart cheek coordinates, land on nearby root curves and continue along those same curves; the wider water flow fades in after arrival. Dark soil stays visible. All 245 affected frames rendered successfully per format before installing the sequential 720p exports. No added runtime work.

Centered face/root morph (immersive-14): face follows the camera center during pullback; cheek drops dissolve into the central root rather than traveling laterally. The head contour narrows/elongates into a tapered root, sprouts branches and shifts toward the root color while facial features fade. Re-exported all three bounded 720p movies and visually inspected a portrait transition frame. Runtime costs and playback lifecycle unchanged.

Grit scenery/entry/path revision (immersive-15): colored sky ribbons extend above frame bounds; removed oversized leaf decals on both broad-leaf background trees. Replaced head/root morph with a downward shrinking circular face; independently retained tears converge/dissolve into root droplets. Sequential full exports retain 720p/24fps and the video bitrate cap.

Grit now launches from the first 7v7 chapter; Mental Toughness occupies the former 11v11 Grit slot. Story IDs and saved completion remain unchanged. The Grit entrance captures the clicked button bounds/color, expands one temporary CSS circle, then fades it into the film; reduced-motion uses a short fade. No persistent animation loop. Background world ownership stays paused throughout the dialog. Local only.

Grit transport polish: top-left title is now simply Grit. Entrance begins with a 240ms visual button shake before the existing expansion/fade. Closing pauses playback immediately and uses a 500ms reverse circle animation back to the launch button before unmounting. Reduced-motion skips the shake and uses short transitions. These one-shot CSS animations add no persistent loop or device haptics.

Latest Grit polish: intro expansion is slower, with a small cached PNG grain tile and a stationary button face over the shaking underlay. Playback starts as the expanded shape reveals the first frame; delayed start is canceled on unmount, and reduced-motion skips the long entrance. Caption text is centered; Replay is an accessible icon beside Sound with 20px spacing. Closing still uses the matching button dimensions/corners and a brief shake. No persistent effects loop.

Art updates remain offline: smooth extended sky curves, lowered skyline behind plants, no oversized tree leaf decals or closing-field foreground leaves, alternating three-color fruit distributed across both sides, soft canopy sunlight instead of yellow rays, dark face shrinking into soil, and tear droplets spreading to roots on both sides. Playback stays 720p/24fps with the existing bitrate cap and world pause.

Caption layout: added a flex caption area beneath controls; short captions use automatic vertical margins to center in the remaining space, while long captions can scroll within the same fixed-height bar. CSS-only; no text measurement loop. TypeScript passes. Current artwork media revision is immersive-16.

### Paths, Done controls and Coach Bella narration — September 17
Desktop Paths remains full viewport with its original 720px content width and a short opacity transition. Grit is the first 9v9 stop; Regulating emotions is the first 7v7 stop, removed from its old later position. Saved story IDs are unchanged.

Play/quiz and film header Done buttons now shrink from 76px to a 44px circle while text crossfades to the close icon, then invoke the existing dismissal after 300ms. A guarded, cleaned-up timeout and one CSS transition run only on click; reduced-motion dismisses immediately. Browser checked the intermediate width, circular height, 7v7 first stop, existing Grit playback/close/reopen/completion behavior and compact desktop caption bar. TypeScript passed.

Grit narration now uses the existing local Kokoro af_bella Coach Bella model, generated offline from the unchanged narration-cues text. Phrase starts and film duration are retained; small offline tempo adjustments fit the existing scenes. All three movies copy the existing video packets and replace only audio; one native video player remains. The final football takeaway remains a caption over the closing pause, as before. No music has been added while options are being reviewed. Local only, no deployment or physical thermal measurement.

### Shared warm storyteller and licensed score
Per user direction, Grit and Regulating Emotions use a custom local Kokoro female blend (70% af_heart, 30% af_sarah), synthesized at 0.9x, replacing Bella without rewriting the scripts. This is an offline voice blend, not a newly trained model or a cloned human voice. Grit extends tight beats to about 79.7 seconds rather than compressing narration. `gritNarrationTiming.json` maps media time back to the original artwork timeline for responsive labels and captions, driven only by native timeupdate.

Wildflowers by Scott Buckley is mixed offline beneath both stories, normalized low, ducked by voice, faded at entry/exit. CC BY 4.0 attribution appears in About; source/terms/change notices are documented in STORY-MUSIC.md. Final MP4 mux copies video packets for the music pass. Still one video/audio decoder, no runtime music element or audio graph. Local only; no device-temperature claim.

### Regulating emotions film — September 17
7v7's opening Regulating emotions story now uses a full-screen native film player following Grit's lifecycle. Nineteen script-aligned beats are rendered offline, then exported sequentially as portrait/square/landscape 720p H264/AAC, 24fps, 2.5Mbps capped video. The supplied packs are flattened small raster board crops (confirmed by their READMEs); they inform original procedural artwork, rather than being enlarged as blurry layers. New warm storyteller voice follows the user's later replacement direction; unchanged script, speed0.9, natural pauses, no temporal compression. Captions/callouts are responsive DOM text; compact stable caption dock and Done morph reuse existing styles/component.

One video/source loads on story open. The full dialog lifetime holds world playback pause; source changes debounce300ms and preserve position/playing intent. Hidden/offscreen pause, source cleanup and canceled delayed entry are retained. Runtime does not fetch authoring code or draw Canvas. Validation: TypeScript and Chrome five-size layout/playback checks passed, including autoplay with sound, fixed dock, resize continuity, early close and completion. Visual inspection prompted centering close-up faces for narrow phones. Local only; no physical phone heat measurement. See `docs/story-film-review/REGULATING-EMOTIONS.md` for asset limitations/rebuild details.

British narrator follow-up: the current shared voice blend is 70% `bf_emma` / 30% `bf_isabella`, using `en-gb` and synthesis speed 0.9. This supersedes the earlier American Heart/Sarah blend. Both scripts remain unchanged; audio timing and corresponding visual/caption timing are rebuilt before final music mixing.

Regulating emotions direction update: the user requested British narration and fewer moving players. Final voice uses the local bf_emma/bf_isabella blend at0.9 in en-gb; narration remains unchanged, with natural phrase timing (70.6547s). Thirteen middle beats now use abstract emotional collage artwork with no player; the remaining player anchors are still. All motion remains offline in bounded videos, with no added browser work.

Final British Grit playback checks passed after music mux; three aspect variants remain one H264/AAC player at 24fps, 79.263-second duration. Regulating Emotions now uses predominantly abstract emotional artwork (13 of 19 beats without a player), with still player anchors and artwork-to-artwork reveals; its current British narration lasts about 70.65 seconds. Both stories retain the exact script, fixed caption dock and low-runtime-cost offline rendering.

User-paced Grit script supersedes the prior unchanged-script revision. Canonical `gritScript.json` now carries the user's exact revised wording, 33 spoken segments and deliberate pauses. Offline British narration stays at 0.9, while movies and timing map extend to about95.31s. Darkness, resistance, pressure and dirt have separate visual beats. No runtime animation or extra player was added. Regulating Emotions' score changes to Ascension (Scott Buckley, CC BY 4.0) with its own About credit; Grit retains Wildflowers.

Regulating objects revision: removed all face/body drawing. Word-aligned boot/pass/interception/net/glove close-ups replace generic player scenes; abstract middle remains. Local offline Whisper supplied action word anchors without uploading audio. Actual-ball zoom and central artwork dissolves replace uniform circular wipes. Motion changes remain entirely offline, with existing native-video runtime budget unchanged.

Regulating Samantha import: verified the corrected user recording03:40:41 against every approved narration word, then copied the source MP3 unchanged. New66.6383s timing drives captions and individual football action anchors; no TTS regeneration or speed change. The earlier03:19:24 recording was a different script and was not installed. Distinct frustration/fear/anger compositions plus moving feeling/space/support elements replace repeated quiet compositions. Rendering remains offline and sequential; native single-player runtime budget is unchanged.

### Supplied ElevenLabs recordings — September 18
Grit now uses the user's Adam Stone MP3 (03:25:28), verified against the revised script word-for-word with offline transcription. Original artwork is retimed at phrase boundaries to the recording, preserving natural speech speed and pauses, with a 4.37-second closing takeaway (69.10 seconds total). A cropped transcription corrected a zero-duration PRESSURE word timestamp. `scripts/import-grit-recording.py` validates exact words and monotonic timing before installing all three exports. Native DOM captions use the updated media/artwork map. Playback, separate darkness/resistance/pressure/dirt labels, autoplay, controls, closing and completion passed the browser check. The offline mixer uses installed narration.mp3 for both stories, avoiding the superseded synthesized WAV. Existing one-player 720p/24fps runtime and world pause guarantees remain unchanged. Local only.

### Love Futsl opening story — September18
Added futsal's opening film without removing tactical lessons. Reuses the existing single native-video lifecycle: full-dialog world pause, one closest-aspect720p24fps source, hidden/offscreen pause, debounced resize with preserved position and close cleanup. Captions/headlines use native timeupdate and shared fixed dock. Artwork is offline only; no runtime Canvas loop or secondary audio element. Supplied Adam narration remains at original speed. Streaming offline frames directly to ffmpeg replaces accumulating temporary PNGs after disk pressure during initial export. No new music layer. Local only; no physical thermal claim. See story-film-review/LOVE-FUTSL.md.

Love Futsl validation: five responsive viewport sizes, unmuted autoplay, stable dock, playing resize, early close/completion and no runtime authoring-script fetch all passed. Opening court shrinks from a larger scale; matching shape/color transitions remain offline. Supplied audio speed is unchanged.

Dismissal controls now share the same dark green background and cream icon/text across modal, drawer, transcript and story Done controls, including hover. Styling only: local sizes, focus outlines and Done-to-circle animation remain intact. Browser computed-color checks passed for Paths close and story Done, alongside existing playback checks. No new runtime work.

## Island paths story artwork

The paths modal uses a full-width scrolling body with the existing 672px content width plus 24px gutters (720px footprint) on desktop. Textured blue, pink, cream, green and gold SVG curves belong to that scroll surface via `background-attachment: local`, so the artwork travels with the lessons. Narrow screens scale the same full-width artwork; text sections retain cream reading surfaces. The static SVG embeds the existing small film grain bitmap; there are no SVG filters, canvas loops, animation timers, new audio, or per-frame work. Buttons, lesson order and actions are unchanged. Chromium checks at 320, 390, 1280 and 1920px verified no horizontal overflow, full-width scrolling and preserved desktop content width; screenshots checked texture and readable labels. Local only; physical-device thermals unmeasured.

Final combined story/path changes pass the production build (September18). Love Futsl retains its original supplied54.57s narration and uses the larger-to-smaller opening court, one hero football and textured shape transitions. Grit Adam and Regulating Emotions Samantha recordings are installed; Regulating Emotions music remux reads the corrected MP3. Responsive browser checks cover the story players and Paths at narrow mobile through desktop widths. Changes remain local; no deployment or real-device temperature measurement.

Paths background follow-up: replaced side-only ornaments with full-width solid blue/green/yellow diagonal bands, gently curved and textured with the existing embedded grain. Artwork still scrolls locally with the full-width modal body; centered content width and controls are unchanged. Cream reading surfaces retain contrast over each band. Four viewport checks (320/390/1280/1920) passed, including no horizontal overflow. Static cached SVG/CSS only.

### September 18 — abstract island loading artwork

- The ready-status loader uses `IslandLoading` with static SVG coast/football-route artwork, responsive portrait and wide compositions, a cached existing grain tile and the existing brush font. No canvas, video, SVG filters, timers or new animation loops were added. The existing small CSS progress indicator and reduced-motion behavior remain; ready/error lifecycle is unchanged.
- Desktop artwork uses a complete wide composition below top-centered copy; mobile uses the portrait composition. Text is `PLAY · LEARN · GROW`. Chrome checks at 390×844 and 1440×900 confirmed readable top text and visible island/pitch, with artwork intentionally clipped at viewport edges on mobile. This is layout evidence, not a physical-device thermal measurement. Local only; parent runs the combined build.

### Settings journey cards — September 18
Settings now groups navigation, lighting, sound and narration into textured journey-style cards. Reuses the cached story grain image; hover/press transitions run only during interaction and respect reduced motion. No timers, canvas, audio contexts or polling added. Existing toggles, sliders and callbacks retained. Typecheck passed; desktop/mobile browser checks cover layout and music toggling. Local changes only; no device thermal claim.

### September 18: full-screen island venues
Store, Arcade menu, Coaches Centre and Pick your patch now use full-viewport CSS layouts with the shared static textured path artwork. Content remains bounded to 1120px on desktop; the existing single body scroller, lazy game mounts, store previews and map callbacks are retained. Hover/press transitions are short and respect reduced motion; no render loops, canvas layers or background timers were added. Chromium checks at 320, 390, 768 and 1440px confirm full viewport bounds, no horizontal overflow, category switching and close behavior. This is local layout validation, not a device temperature measurement.

### Shared control and venue styling — September 18
Main island controls and pitch camera/chat/transport/radar now share a gold/cream control surface; close controls match. Venue backdrops use distinct static SVG compositions, and item previews use one cached tan grain surface. Costume cards and onboarding reuse existing components and event lifecycles. Mobile shortcuts are accessible without the former viewport redirect, with Back in the header logo slot. Changes add no rendering loops or new preview renderers. Four viewport venue checks, typecheck, and Settings music-toggle checks passed locally; no deployment or phone thermal measurement.
The Paths control is now a pink rounded square. Its two CSS particle layers animate twice on mount and once per hover, then sleep; reduced motion disables them. Joystick thumb changes are surface-only and preserve the direct pointer-driven transform. Kick/action buttons have distinct mint/coral surfaces. Mobile onboarding now overrides the broad fullscreen-section rule with its calculated card dimensions, keeping its footer on screen; mobile open/advance/skip checks pass.

### Daily bottle and upcoming stories — September 18
The island logo opens an interactive message bottle with60 authored positivity notes, indexed by the local calendar date; reopening on the same date shows the same note. Waves reuse the current modal's static patterned SVG and draw on one canvas at24fps, DPR capped1.5, only while open/visible; reduced motion draws a static frame. Entrance/exit layers push and restore the underlying view. Ocean sound is a bounded12-second synthesized noise swell through the existing shared sound context/master volume, stopped on dismissal or normal sound suspension. No extra audio context, network requests for narration, or idle polling. Twelve researched stories are optional path stops opening full-screen Coming soon placeholders; they do not award completion or block lessons. Local browser verified bottle open/reopen/close and placeholder open/close; typecheck passed. No deployment or thermal measurement.

### September 18 UI consistency audit

Shared Done/Back controls use one guarded 300ms timer per activation and a CSS width/opacity transition; reduced motion invokes navigation immediately. Timers are cleared on unmount. Header/wardrobe/playbook art remains static CSS/SVG; no new render loop, polling or preview renderer was added. Desktop/mobile emulation checked responsive header anchors and controls at320/390/1440px; see `docs/ui-style-audit.md`. These local checks do not establish phone temperature improvement or deployment status.
Bottle wave refinement: Island Paths bands now render as crisp canvas vector edges with two gentle traveling sine swells, rather than shearing a rasterized background. Rendering remains24fps, now DPR capped2 for sharpness; grain is a subtle cached overlay. Canvas persists through exit, avoiding image reload/flicker; motion eases back to the original background origin. Continuous motion exists only while this user-opened scene is visible. Reduced-motion still disables swells and bottle bobbing.
Final pre-deploy follow-up: ocean ambience now loops using one shared-context buffer while the bottle is open, suppresses background music, and fades for1.25seconds when dismissed. It respects mute/hidden state and survives ordinary window blur. Bottle opening uses an existing-context cork-pop cue. Paths alone retains the interactive island logo; other headers omit it. Done/Back remain collapsed through dismissal rather than restoring their labels mid-exit. Store category tabs never wrap at any width. Final production build passed.

Mobile bottle waves draw their vector surface immediately, without decoding an SVG into a canvas pattern. Only the optional grain bitmap loads asynchronously. The existing capped DPR and 24fps loop remain; no physical-device thermal measurements were performed. Settings contain overscroll and use a scroll-attached background to avoid iOS local-background repaint gaps.

September 18 release audit: ocean noise buffers are reused, zero-volume ambience allocates no source, and volume restoration/unmute resumes the requested ocean. Wave page transforms are written only when they change. Chromium production-build checks show no 3D renders behind settled Settings or the bottle, a two-second wave sample of 40 draws, and no wave draws after closing. Fourteen focused suites and town simulation pass; see release-audit-2026-09-18.md for scope and limits. Physical iPhone thermals unmeasured.

Deployment verified READY in Vercel: `dpl_DLhmWL7Y62brq5VKaLeKbyQuyqjV`, production alias https://futbolisland.app (September 18, 2026).

September 18 follow-up (local build): native non-passive touch events feed the existing pitch gesture math; touch pointer events are ignored to prevent duplicate movement. Listener cleanup and drag/pinch/cancel tests pass. Header scroll fading uses a static CSS mask plus a shallow 5px backdrop blur limited to the top 112px (104px mobile); no scroll listener or animation loop. This adds header compositing during scrolling and still needs physical iPhone verification. Completed-path feedback is interaction-only. Story entrance now sets backgroundColor rather than the background shorthand so the existing shared texture can render. Production build/typecheck pass; follow-up deployment pending.

Follow-up deployed READY: dpl_FCU3DG5Q14G7DgXfiMuLAkJL4Eew, https://futbolisland.app. Production build, typecheck, town simulation, native gesture tests, paths/customization/exploration/ball-hunt/audio suites passed. Chromium checked onboarding, category scroll end, centered picker collapse, mobile camera drag, Paths and mobile/desktop scrolling fade without page errors. Physical iPhone scrolling/thermal validation remains unmeasured.


### September 19: parachute actions and character/conversation styling (local)
Parachuting now maps the two existing action controls to Sky scan (hold to accelerate a visual turn, capped at 4.5 radians/second with eased release) and Juggle/Stop juggling (alternating foot taps and ball arcs during descent). Steering, normal9m/s descent, collision checks, safe landing and cut-to-fall remain intact. Timers advance only in the existing simulation update, with no new frame loop, geometry, audio or particle pool. Reduced motion skips spin and reduces foot/ball movement. Air juggling reuses the existing player ball mesh/material and two cached contact vectors; the walking ball simulation is untouched. Arms retain the parachute grip; only legs receive the tap pose. No extra particles are created. The HUD publishes parachute mode only on phase changes. Both actions clear on cut, crash and reset; pointer release/cancel/lost capture and keyboard release stop hold acceleration; blur uses existing input cleanup.

The wardrobe is a full-screen fading modal with the existing single on-demand preview; conversations retain their existing single-scroller drawer and lazy clips. Their textured backgrounds are static shared-grain CSS layers; button motion is interaction-only with reduced-motion overrides. No polling or additional preview renderer. Unit checks cover parachute hold acceleration, speed cap, eased release, juggling toggle, pause, canopy grip and safe landing cleanup, steering and cancellation, flight landing/fall, customization persistence and idle effect sleep; typecheck passes. Chromium at390×844 and1440×900 verifies the full-viewport wardrobe, saved selection, Done, both parachute action buttons and NPC open/reply/close. Spin feeds the player’s existing facing interpolation, so release resumes from the same internal yaw. These changes are local; no physical iPhone temperature claim or deployment is made.

September 19 loading/UI follow-up (local): minimum loader dwell is three seconds from mount, followed by a2.05s staged exit (80ms reduced motion). Scene readiness is still required before exiting. The existing island SVG is split into static vector groups: details/copy fade while the complete artwork zooms into its tan center, then the loading surface fades into the scene. The former green center is tan and the outer band is light turquoise water. The tan overlay morphs into the viewport with one bounded settling bounce before fading. Artwork arrival runs once for three seconds; no new animation frame loop. Full-canvas blur is limited to a480ms one-time reveal. Shared font, grain, Paths/Settings/Coaches artwork and island mark are warmed once; films, audio and lesson catalogs remain on demand. Loader timers clean up on unmount. Chromium390px and1440px checks verify no text blur, at least three seconds before exit, a2.06s staged exit, and fully opaque viewport-filling tan geometry before reveal. The settled playbook uses normal blending with brighter colors. Physical iPhone thermal impact has not been measured.

September 19 spiral follow-up (local): holding Sky scan now widens a steered spiral to a capped3.2m radius; release contracts smoothly, and the radius fades before landing. Movement is collision-swept in <=0.25m steps. Additional floor queries run only while a spiral is active. The existing rig counter-twists hips/torso, banks and transfers weight during alternating airborne ball touches; canopy lines still attach to actual hand positions. Reduced motion suppresses the orbit and spin pose. No additional renderer, animation loop, mesh or particles. Unit checks cover widening/cap/release/collisions/landing/reduced motion, raised hands and continuous juggling endpoints. Mobile Chromium verifies simultaneous hold-spin and juggling, continued descent, release contraction and cut cleanup. No physical-device thermal measurement. Shared customization/onboarding toggle uses a CSS transform only during selection; equal-height desktop panels use CSS grid. Loading copy and favicon changes add no runtime work. All changes remain local pending deployment.

Loading detail exit (local): each existing SVG detail has a transform wrapper so its bounce/shrink preserves authored SVG positioning. A staggered, finite340ms transform/opacity animation runs with delays up to420ms; zoom begins at800ms, after details disappear. Total exit remains2.05s. No new animation loop/assets; reduced motion disables these bounces. Typecheck passes.

September 19 venue/shadow fix: Museum and Matchday Ferry use centered cream reading cards in their existing full-screen scrollers. Isolated field viewing disables shadow reception on the lower island foundation and shore, preserving pitch/player shadows and restoring reception when returning to exploration. This prevents elevated futsal shadows appearing a second time below the court. No added render passes, geometry or loops. Shadow coverage/visibility and live-field-frame tests pass; Chromium390/1440px verifies centered cards, pitch shadow reception, lower-ground suppression and restoration. Production build passes; deployment follows.

Deployed September19: dpl_AVaMyb8TFxwTKA8cRsXwiKi82enn is READY and aliased to https://futbolisland.app (https://futbol-island-3mg5r1ra4-khoa0aohk.vercel.app). Live Chromium checks at390px and1440px passed centered Museum/Ferry reading cards, preserved pitch shadows, suppressed lower-ground shadows and restored exploration shadow reception, with no page errors. This release includes the preceding local loading, customization, parachute and UI updates. Physical iPhone heat remains unmeasured.

### September 19 arcade rebuild (local, not deployed)
Tennis and Pinball retain their tested simulations under a shared Three.js scene; Runner uses a bounded three-lane simulation with existing jump/contact helpers. Rounded geometry and materials are shared, impact effects use80 pooled instances, and scenery is constructed once. One shadow-casting sun, no postprocessing chain or additional lamp lights. Mobile30fps/DPR1.5/1024shadow; desktop60fps/DPR2/2048shadow. Live Match remains30fps with its existing DPR cap, adds stadium scenery and sleeps outside play. New arcade loops stop paused/hidden/finished and settled ready states, with input/resize wake and full resource cleanup. Three focused simulation suites and production build pass. Chromium390/1440px screenshots and pause checks cover presentation. See `arcade-rebuild-2026-09-19.md` for reference findings, implementation and limits. New3D courts cost more than the old2D renderers; physical iPhone heat and Safari behavior remain unmeasured. No production deployment for this rebuild.

### September 19 mental films, character motion and night audit

The twelve mental-concept films lazy-load by format. One Canvas2D player draws at24fps with DPR capped at1.5; paused, offscreen, hidden and finished films stop their animation loop. Reduced motion draws one stable composition per beat. One cached384px print plate and a per-context pattern supply texture; geometry is bounded and no extra renderer or polling loop is added. One HTML audio element is reused across six clips, released on close. `holdVideoPlayback` suspends the island and music during a film. Generated storyboard PNGs are authoring references excluded from deployment, and the neural voice model/runtime remain outside the repository. Only compressed AAC clips ship, requested as their film plays.

The player uses a unified caption/transport tray. Browser checks cover all12 films at390px and1440px, landscape fit, seeking, pause sleep, transcript focus and source cleanup. Drawing checks cover72 animated beats, reduced-motion stability and exact continuous chapter endpoints. Physical phone heat remains unmeasured.

Flight adds damped limb response, main-character articulated hands and landing compression within the existing update loop. Small-vehicle contacts reuse the existing reaction pipeline. Sixteen regression suites plus structural checks and actual browser contacts passed; see `character-vehicle-audit-2026-09-19.md`.

Night uses emissive windows/signs and batched ground light pools without new actual lights or shadow passes. At the controlled desktop view, calls increased614→632 and textures34→35; rAF median remained16.7ms. This is not GPU timing or temperature evidence. Mobile emulation verified mode switching and settled Settings render sleep. Details and limitations: `night-lighting-2026-09-19.md`. Deployment status is recorded separately after the final release.

### September 19 phrase-timed mental-film visual revision (local)

All fifteen concept explainers now use word-onset visual scores (298 moments within the existing90 AAC/caption segments), abstract material transformations and cropped objects; the previous full-body illustration modules are no longer in the draw dispatch. The existing24fps/DPR1.5 player, sleeping rules, reused audio element and completion flow are unchanged. Each frame evaluates one bounded illustration, or at most two during a420ms material zoom/dissolve. The same cached384px print plate supplies texture; no per-frame DOM nodes, timers, additional render surfaces or image decoding. See `story-production/phrase-visual-rebuild-2026-09-19.md` and `phrase-render-checks.json` for phase/boundary/reduced-motion checks and batched CPU draw-submission measurements. These do not measure GPU completion or physical iPhone heat. Local only; final build/UI validation is recorded by the integrating task.

### September 19 pitch floodlights (local, not deployed)

Four visible corner floodlight banks per format explain the nighttime pitch illumination. Four shared non-shadow spotlights follow the selected/relevant visible pitch; fixed light count and zero daytime intensity avoid mode-switch shader churn. Fixtures belong to field roots, preserving isolated visibility and the existing lower-ground shadow fix. Grass retains its original rich green after the lighter tint proved washed out; nighttime fill is 0.025 and grass spot strength is 50% of the initial pass. Each of the four real corner lights uses half the previous two-light per-source strength, preserving total source intensity; futsal fill is unchanged. Daytime hemi/sun/exposure are reduced to1.65/2.35/.95 to retain richer color, with no extra rendering work. Decorative pitch pools and approach bollards were removed. Per visible field: two batched draws and 560 triangles; total ten geometries across five courts, two shared materials, no new textures or shadow passes. Four additional light calculations remain a shader cost even with daytime intensity zero. Existing loop/sleep rules are preserved; no extra timers or animation loops. Targeted field, idle, live-frame and shadow tests pass. See `pitch-lighting-2026-09-19.md` for browser checks and four-corner illumination and daytime balance. No physical-device thermal claim.


Rooftop Knockout lighting follow-up (local): the rooftop is a fifth target for the existing four-spot pool; joining the game gives it priority without adding lights. Four corner fixtures fit within the roof/cage footprint, outside play lines. Isolated lessons hide rooftop fixtures and keep field priority. Adds two batched draws/560 triangles when visible, two geometries, no new materials/textures/shadows/loops. Daytime switches all pooled spots off; night restores them. See the pitch-lighting note for tests and browser evidence.


Pitch landing continuity (local): player occupancy now precedes camera-only pitch selection, because11v11 corners crossed the near plane after landing and released every pooled light. Reuses the player position vector and existing120ms selector; a4m height tolerance and2m entry/5m exit margins preserve rooftop separation and edge stability. Isolated lessons/joined Knockout retain priority. Futsal source strength and fill are reduced18%; other lighting values unchanged. No extra lights, draws, allocations or loops. Actual flight→landing→walk reproduction and regression evidence are in `pitch-lighting-2026-09-19.md`.

September19 destination lamps (local): explicitly cover pier8, North Beach10, market7 and garden7, increasing civic fixtures58→90 under the96 cap. Existing static batches/shared32pxpooltexture, no new actual lights/shadows/timers. Pool chunks36→50; regional desktop/phone-width comparisons add1–16draws with unchanged corresponding texture counts. Pier pools are narrow3m footprints inside the deck; other sites retain shoreline/traffic/obstacle guards and correct ground offsets. Tests cover walkway/gate clearance, isolated visibility, mode uniforms and disposal. Daytime is further balanced to hemi1.25/sun1.8/exposure.88 after the prior correction still looked washed out; night/sunset unchanged. Details/evidence in `night-lighting-2026-09-19.md`. No deployment or physical-device thermal claim.

### Woven Court image-led trial (local)

Woven alone now uses a single on-demand1619×971 generated transparent atlas (about6MB decoded), with bounded sprite/camera interpolation in the existing sleeping24fps canvas. Optional film preparation delays audio until artwork loads and supports retry. No added animation loops or WebGL resources. Other stories are unchanged. See `story-production/woven-court-image-trial.md`; no physical-device thermal claim or deployment.

Sunset palette follow-up (local): rose-pink sky, pale peach upper fill, muted mauve ground bounce and coral-peach sunlight. Reduced sunset intensities/exposure to1.45/2.05/.92 to preserve surface color. Uses the same existing lights and interpolation; no additional render work. Day/night presets unchanged. Lighting transition/idle test passed.

Daylight palette follow-up (local): lighter powder-blue sky, near-neutral sky fill and ground bounce, and ivory sunlight replace the stronger cyan/yellow tint. Day intensities1.35/2.15 and exposure.93 restore sunny brightness with directional definition. Same light count and settled-mode sleep; transition regression passes. Visual tuning remains subject to in-app review.

Latest daylight direction (local): original golden sunset brightness (hemi2/direct3/exposure1) now supplies daylight, with slightly cooler peach sky and less yellow-orange light. Supersedes the powder-blue daylight trial. Pier lamps moved to the landward bench/volleyball edge at z208.9; one x position adjusted clear of a bench. Same fixture budget and shared pools.

### September19 continuation: pose alignment and bounded light transitions

Scooter/bike hand targets now include the same1.12 ground-vehicle scale already handled for mopeds. Walking clears flight shoulder yaw. No new pose loop, geometry or allocations. Light interpolation snaps its imperceptible tail at2.9seconds, before the existing three-second Settings sleep; mode palettes and render budgets are unchanged. Targeted motion/ride/batching/collision/shadow and lighting suites pass. Desktop1280 and touch-emulated390 browser checks cover actual flight landing, three stationary ride grip alignments, all three lighting modes and settled menu render sleep without page errors. See character-vehicle and night-lighting September19 notes. Local only; no physical iPhone temperature claim.

### Woven abstract style continuation

Woven Court now uses one1536×1024 abstract atlas modeled on Regulating Emotions (approximately6MiB decoded). Short Canvas ribbon transitions connect its six compositions using two curved edges and the existing cached print grain. Existing on-demand loading,24fps/DPR1.5 cap, reduced-motion stills and pause/hidden/close sleep remain. No new renderer, polling or animation loop. Phone390/desktop1440 playback checks pass; combined production build passes. See the Woven production note for visual scope and boundary validation. This is a local Woven revision, not an all-film rollout or deployment; physical-phone thermals unmeasured.

### Woven phrase-by-phrase JavaScript revision

Woven now draws crisp Canvas vectors across36 word-aligned visual cues. It no longer requests or decodes its runtime illustration atlas (previously about6MiB decoded); prior source assets remain preserved. Thirteen reusable glyph families and static layouts use the existing24fps/DPR1.5 canvas and cached grain. Per-phrase object interpolation adds bounded vector path work; no new renderer, frame loop, audio element or polling. Debug cue attributes update only when the cue changes. Woven's visual clock follows the existing narration element; fallback timing, other films and pause/hidden/offscreen/close behavior remain. Reduced motion shows a stable representative composition per paragraph. Build,390/1440 playback and36-cue Canvas checks pass. See `story-production/woven-phrase-storyboard-2026-09-19.md`. Local only; no real-device thermal claim.

### Regulate-style camera continuation and coral sunset

Woven retains36 phrase cues but removes full-body figures, using the actual Regulate cropped boot/glove and ribbon language. Major connections use camera dives into a bounded source-material region and a matching-color reveal; vectors remain sharp at enlarged scales. One existing24fps/DPR1.5 canvas, cached grain, no raster artwork request or extra loop. Larger clipped path coordinates replace ordinary object slides during the short dives; no thermal saving is inferred. Audio-clock following now yields to elapsed time during the existing post-audio chapter padding, allowing real chapter dives to finish. Reduced-motion stills and pause/hidden/close behavior remain.

Sunset's latest correction uses stronger orange sunlight with coral-pink sky and rose fill (see night-lighting note), superseding the too-daylike brighter golden trial. It changes only existing color/intensity uniforms. Lighting regression and matched390/1280 frozen comparisons pass with unchanged resources and menu sleep. These revisions are local; deployment and real-device heat remain unverified.

### Woven: direct Regulating Emotions construction

Supersedes the extreme camera-dive revision above. Six sustained vector compositions now adapt the reference's actual pressure walls, ribbon paths, petals, loops, connections, football and gloves to Woven narration.36 phrase markers remain metadata; they no longer trigger separate layout replacements. The reference's modest scale/dissolve uses at most two scene evaluations during the final second of each chapter. Decorative background drift is frozen. Most scenes use a small fixed number of paths; the final relaxing loops use six paths with181 points each. Existing cached grain, one24fps/DPR1.5 canvas, reused narration element and sleeping lifecycle remain. No new render surface, media source, polling or artwork request. Cue/scene/camera DOM attributes update only when changed.

Production build,36-cue boundary checks and stable reduced-motion frames pass.390/1440 artwork captures were inspected for legibility; contrast corrections restore the source's navy pressure field, dark weave backing and cream glove silhouettes. Local only. Desktop checks do not establish physical-phone thermal behavior.

Woven semantic-audit follow-up: the original passer now moves into support, teammates recover goal-side while the lost ball stays away, and inward-facing gloves share the ball without a new tangle. Removing the six181-point loop paths reduces work in the final scene; a small cropped ear replaces ambiguous sound-only marks. Woven overpasses clip/repaint their actual strand curves. Two chapter boundaries now use a1.6-second camera approach and pullback through the actual matching football, evaluating one scene per frame; other boundaries retain at most two scenes for their short dissolve. No extra render surfaces, loops, media or requests. The existing24fps/DPR cap and sleeping lifecycle remain. See `story-production/woven-meaning-audit-2026-09-19.md`; local only, with no measured phone-temperature claim.

Latest Woven artwork refinement: zoom destinations now use a broad ribbon close-up and angular defensive panels. Most backgrounds draw only two reference ribbons; the macro view is plain navy. Shared row geometry removes mismatched weave overpasses. Filled speech bubbles and abstract cupped palms reuse the existing cached grain pattern inside bounded silhouette clips, adding a few Canvas fills without textures, surfaces or loops. Literal glove fingers, badges and cuffs are removed. Build and continuity/reduced-motion checks pass;390/1440 captures confirm distinct compositions and clearer foreground contrast. Local only; no physical-device heat measurement.

Screenshot follow-up: full-opacity length reveals replace translucent weave-crossing coats, removing rectangular alpha patches. Tactical links and passing paths are straight and grow with the existing narration phases. Previous Regulate glove geometry/colors are restored at user request, with existing print grain retained. Bounded path/clip work on the same24fps canvas; no new surfaces, assets, timers or loops.390/1440 captures and the36-cue continuity/reduced-motion audit pass. Local only.

Woven zoom pacing follow-up: selected handoffs use0.60s accelerating approaches and0.72s quick releases with a deeper1.45×viewport-corner coverage target. This replaces two1.6s eases that stopped at the seam. Changes only bounded camera arithmetic in the existing24fps draw; no new loops, layers, assets or polling. Typecheck and scene-boundary/reduced-motion checks pass. Local only; no physical-device thermal claim.

Forward-through correction: the outgoing football's growing central pentagon clips a preview of the next composition during the0.60s approach. That destination continues increasing in scale across the seam instead of pulling back. This evaluates two bounded scenes during those selected approaches, then one on arrival; it adds one five-vertex Canvas clip, without another canvas, loop, asset or media source. Existing24fps cap, cached grain, reduced-motion stills and sleeping player behavior remain. Local only; no physical-device thermal measurement.

### Forward passages across the story catalog

All15Canvas stories now use material-based forward passages at selected major chapter boundaries. Fourteen stories register convex interiors of their existing artwork with `forwardPassage.ts`; Woven retains its approved panel drawing. The helper is inert outside departures. During0.60s approaches, one source and one clipped destination are evaluated on the existing canvas; arrival evaluates one scene. Bounded matrix/polygon work replaces reverse zooms, without another surface, loop, request or media element. The same24fps/DPR1.5 player, cached texture and inactive sleep remain. No physical-device thermal improvement is inferred.

Cross-story audit:30exact seams match,28new material apertures reveal the next view before the seam, reduced-motion frames stay identical, zero standalone requests. All15films pass actual390/1440playback, pause/sleep, transcript/focus and cleanup checks. Original Grit/Regulate/Futsal movies receive offline source updates and all-aspect re-exports through a one-frame streaming encoder with existing audio copied and hashed. See `story-production/forward-passage-rollout-2026-09-19.md` for final asset delivery status. Local only, not deployed.

### Individual story artwork rebuild, September 20

The transition-only rollout above was rejected on visual grounds. Fourteen Canvas stories now have new paragraph compositions and clause-timed actions; Grit and Love Futsal have new offline-authored artwork and all-format movies. Regulating Emotions and Woven remain the visual references. The replacement removes miniature scenic worlds and decorative animation in favor of bounded vector shapes that explain the narration. Full details and individual review links are in `story-production/story-rebuild-audit-2026-09-20.md`.

All Canvas stories now use the existing narration-synchronized clock, with the existing elapsed-time fallback and post-audio padding. The 24 fps / DPR 1.5 cap, one audio element, cached grain and pause/hidden/offscreen/close sleep remain. Selected passages evaluate two scenes for 0.60 seconds; other chapter joins use a 0.65-second opaque straight material reveal, also at most two scenes on the same canvas. No new runtime surfaces, polling, image decoding or animation loops. The original-film print helper is offline authoring code; in-app playback remains one native video. No physical-phone thermal claim.

All 15 Canvas stories pass actual 390px/1440px playback, 320px controls, chapter navigation, captions, pause sleep, transcript focus and media cleanup. Narration-linked review captures cover 388 sampled clause/settled states; all 75 chapter endpoints match. Cross-author reviews corrected tactical routes through blockers, missing retries/support outcomes, floating contacts, and pale foreground/background collisions. Technical checks supplement direct artwork review, rather than substitute for it. Final original-video delivery and build evidence is recorded in the individual rebuild note. Local only, not deployed.

### Story motion and compact-mobile composition, September20

The15 Canvas stories now use authored short actions with contact/response during narration, plus selective larger material forms. Grit's detailed connected tree/leaf growth and Love Futsal's actions are encoded offline into all three video formats; playback remains one video. Canvas keeps24fps/DPR1.5, one audio element, cached grain and the existing pause/hidden/offscreen/close sleep. Added paths and interpolation are bounded; no new surface, loop, polling or artwork download. Shared `filmComposition.ts` uses constant-size arithmetic for compact portrait safe space and a landscape artwork/control split. Additional branch/leaf detail is paid during offline export, not by a live mobile Canvas.

All15 Canvas films pass actual playback/cleanup checks at320×568,390×667,390×850,844×390 and1440×850. The3 original films pass phone/desktop playback,320px controls, preserved captions and cleanup.30selected Canvas passages and75chapter endpoints pass;388narration-linked samples supplement independent visual reviews. See `story-production/story-motion-mobile-2026-09-20.md` for export, motion and composition evidence. No new device-temperature claim; local only.

### September 21 — screenshot-requested scenery and access fixes (local)

Removed the picnic table/seats at (36, 2) beside the futsal ramp, extended its six-metre-wide entrance path from z45 to the sidewalk at z59, and trimmed the western road's unused southern spur back to the junction at z65. Ground ride ramps now sit farther outside sidewalks and reject footprints overlapping paths or roads with 0.6 m clearance. Planning runs only during scene setup; both ground ramps remain available. Southern grass now reaches the existing coastal sand ribbon, filling the bare pier/knockout approach areas while preserving paths, seating pads, volleyball sand and the boardwalk. The shared outline also updates the map; no extra ground mesh, texture, animation or frame-loop work is added.

Validation: production build and existing ride-ramp tests passed. Live local browser assertions passed for removed furniture, the continuous entrance path, the shortened street and both ground ramps' pavement clearance. Reviewed five rendered views covering futsal, the western junction, coastal approach, pier cafés and museum. Local changes only; no deployment or physical-device thermal measurement.

### September 22 — pedestrian clearance and lawn cleanup (local)

Eight South Pier lamps moved from the deck to the inland grass at z205.5. Street lamp candidates now sit outside sidewalk edges; a bounded setup-only search relocates entrance lamps off paths and sand courts, with 0.65 m paving clearance. Pole collision footprints move with the lamps. Existing static batches and instanced light-pool textures are retained; no new lights or animation loop. Browser audit verified all 86 installed street lamps clear road/sidewalk, junction and path rectangles, including all eight pier lamps.

Removed the Community Park playground, collision footprint and its two approach paving pieces, plus the contrasting park lawn overlays so the tree strips use the existing island grass. Removed the volleyball court's western side path. Straightened the beach promenade and connected its eastern end to the street sidewalk. Reviewed rendered pier, park and beach views. Final production build, typecheck and browser geometry checks passed. The floating Post-match Tables sign now has a wooden backing, two ground-reaching posts and a matching collision footprint, all using static scenery batches. Local only, not deployed; device heat not measured.

### September 22 — museum, ferry and terrace follow-up (local)

Simplified the museum forecourt to one rectangle and added a four-metre connection to the pier, with furniture moved away from its entrance. Replaced the dock-side patio's short wooden bridge/interior rails with a level paved connection; aligned its southern path and moved the pier bench clear. Extended the dock polygon across the full gangway mouth, matching plank ends and perimeter rail openings, and removed obsolete rails inside the joined boardwalk. Extended the coastal path north to the beach promenade, moving the bordering palm clear; removed the duplicate path beside the western building row.

Added six short lamps to Cafe by the Sea's upper and lower terraces (three per level). They reuse emissive lens materials, static geometry batches and the existing cached/instanced night-pool texture. Each roof pool is bounded to 5 × 5 m and placed at its terrace height; lamp collision is elevation-aware. Added runtime cost is six static pool instances and batched lamp geometry, with no real-time lights, new textures or animation loops. Terrain and rooftop travel tests pass. Local browser review includes museum/pier clearance, removed interior dock rail, six terrace lamps, street-lamp paving clearance and rendered ferry/patio/terrace views. No deployment or device-temperature claims.

### September 22 — warmer golden sunset (local)

Sunset palette now uses an apricot sky (#efb477), honey-gold sunlight (#ffbf72), warm sky fill (#ffdda6) and ochre ground bounce (#ad8254). Light intensities, exposure, shadow direction, day/night presets and transition/sleep behavior are unchanged. This edits existing color uniforms only; no added rendering work or resources. Compared matching plaza and pier browser captures; production build, field-lighting tests and lighting-idle tests pass (updated the latter's expected sunset sky). Local only, not deployed.

### September 22 — distinct daytime palette (local)

Day mode now uses a clear blue sky (#a9d4ed), cool-neutral sky fill (#eaf4ff), natural ground bounce (#929887) and near-white sunlight (#fff5e6), removing the previous amber daylight cast. Intensities, exposure, fixed shadows and sunset/night palettes are retained. Existing color uniforms only: no added lights, resources or recurring work. Production build, lighting-idle and field-lighting tests pass; plaza and pier browser captures reviewed. Local only, not deployed.

### September 22 — player mechanics, contacts and purposeful live play (local)

The shared rig now uses deterministic authored teaching samples for repeatable quiz/seek poses, distinct pass/shot/loft mechanics with hip-before-chest rotation, action-linked weight shift and gait counter-sway, bounded planted-foot pivots/replanting, and lateral leg solving that keeps the supporting boot grounded. Defensive and goalkeeper poses use the same joints. Two cached support points plus fixed-size vector/quaternion arithmetic replace foot sliding; there are no per-foot raycasts, new geometries or animation loops. Existing reduced-motion, ride/flight overrides, culling and instancing remain.

Ball rendering now normalizes the live kick countdown correctly, caches actual release/arrival boot anchors once per teaching beat, previews the same receiving-foot plan used by the simulation, joins the selected left/right foot at control, grounds ordinary dribble rolls and displays goalkeeper possession at the hands. A teaching beat samples and restores at most two existing contact rigs; it creates no extra rigs. Quiz outcomes and paused live games stop pose integration. Endpoint caches are scoped to the current beat/lesson/clock, and live ball offsets clear on ownership changes.

Live AI retains existing formations, support triangles, team identities, brain cadence and safe substeps. It adds one bounded pass-and-run intention per match, conditional return passes, three-corridor carry decisions, moving first touches, stable press handoffs and goal-side cover. Futsal uses shorter rotations, closer support and compact defensive bands. Additional work is bounded roster arithmetic on existing clocks; no new timers, polls or rendering assets. See `live-match-engine-improvements-2026-09-22.md` for seeded evidence and model limitations.

Validation includes new full-runtime contact/arrival tests, full-rig deterministic and bilateral planted-foot tests, existing teaching/quiz/ride/juggle/batch/clock regressions, and twelve seeded three-minute matches across all four formats. Batching remains 22 actors / 10 batches in the existing check. Desktop and 390px Chromium captures cover preparation, release, flight and receipt without page errors. The existing effects test canvas stub was completed so all four seeded effect simulations can run. Local only; no deployment or physical-phone temperature measurement.

### September 22 — live post-pass glide correction (local)

The .45-second simulation kick countdown was rendered across the slowed .42 match clock, holding the strike pose and pass-facing direction for roughly 1.07 real seconds while the passer translated. Live presentation now maps that countdown to a .32-second recovery, smoothly turns toward travel during follow-through, then releases the kick override so distance-driven steps and foot planting resume. Simulation decisions and authored teaching timings are unchanged. This adds only bounded scalar arithmetic to the existing pose update, with no timers, assets or extra render loops. Full-runtime contact tests cover recovery metadata, both-foot alternating strides and grounded support, alongside release/arrival continuity. Local only; not deployed.

### September 22 — coordinated whole-body range (local)

Added stance-phase lateral hip transfer, stronger opposed pelvis/chest rotation, upper-body counterbalance, head stabilization, shoulder motion on three axes, independently phased elbow flexion and greater swing-foot clearance. Receiving/striking shifts weight toward the supporting leg. Existing bounded leg solves and stance anchors keep soles grounded; reduced-motion and ride overrides remain. All additions are scalar operations in the existing rig update; no new objects per frame, render loops, meshes or raycasts. Body/contact, ride, juggling and batching regressions pass (22 actors / 10 batches). No deployment or physical-phone thermal claim.

### September 22 — directional locomotion (local)

Added continuously blended sprint, backpedal and lateral-shuffle posture/stride mechanics. Live running effort is normalized before playback scaling; actual distance still drives gait. Containing defenders face the attacker, opening into travel at chase pace. All work is bounded scalar arithmetic per existing posed actor; no new rigs, meshes, timers, polling or allocations per frame. Existing view culling, sleeping matches and batching remain. Full-rig, contact, ride and batch checks and production build pass. See `player-locomotion-audit-2026-09-22.md` for findings and measured fixture ranges. Not deployed; no phone thermal measurement.

### September 22 — calmer live-game pacing (local)

Reduced the shared live simulation multiplier from .42 to .32 (about 24% slower). Player travel, ball flight and tactical decisions remain on the same clock across all formats; distance-driven gait and real-time .32-second kick recovery remain synchronized. Authored lessons and quizzes keep their own timing. No additional rendering or simulation work; no deployment. Contact/recovery fixtures read the shared multiplier so they verify actual real-time recovery after pace changes.

Live ball flight trail (September 22, 2026): each venue's `createMatchEffects` now owns one `createBallEffects` (the walking character's shot trail: a 20-point line, 14 ghosts sharing one geometry/material, pooled sparkles and 5 launch rings) instead of the 48-point vertex-colour ribbon. `fieldRuntime` feeds it the rendered ball after placement (`e.effects.trail`), so the trail head sits on the ball (the old ribbon sampled raw sim positions before the release/receive offsets and left a gap). It updates only for visible, non-teaching venues, draws only while the ball is in flight, and reduced motion hides it. Added cost while a live ball flies: roughly 15–20 extra small draw calls in the visible venue. Not measured on an iPhone.

### September 22 — level support soles and softer step landings (local)

Corrected the ordinary gait/support ankle orientation using the complete pelvis–hip–knee rotation. Previously only pitch was cancelled, leaving a measured 27.58° sideways boot tilt in a shuffle and 14.57° in a stationary ready stance. The feet now remain level laterally while the hips lean and abduct; deliberate toe pitch and striking/receiving boot mechanics remain. Swing-foot height uses a squared sine for zero vertical velocity at both endpoints with unchanged peak clearance, softening lift-off and touchdown. This reinforces readable supporting-foot placement in defending and striking.

Cost: two cached quaternions and one cached Euler per existing rig; bounded quaternion operations for at most two ordinary/support feet per pose update, plus one scalar multiply per swing. No per-frame objects, scene traversals, raycasts, new meshes, render loops or changes to culling. Existing batching remains 22 players / 10 batches. Added full-transform sole tests cover 2,353 near-ground samples across four profiles and mirrored shuffles, plus both striking sides. Existing body, seam, range, profile, ball-contact, ride/flight and batching suites pass; production build passes. Local Chromium checks cover all four live formats and desktop/phone-width teaching contact poses. No deployment or physical-phone thermal measurements.

### September 22 — fluid upper-body transitions (local)

The chest, shoulders, elbows and head now use an allocation-free critically damped response, with independent response rates. The hips and support-foot lateral counterbalance remain contact-driven, so upper-body follow-through does not delay movement or slide planted boots. Teaching samples, reduced motion, teleports/offscreen resumes and special ride/action poses reset the response; ordinary paused frames retain both its pose and velocity. No change to AI, root travel or ball-release timing.

`poseResponse.ts` integrates a held target analytically. Each rig adds a fixed 28-double buffer (224 bytes) and 14 bounded scalar response channels in its existing update. No extra loop, scene query, object per frame, mesh or background work. In a controlled running/receiving/jockey fixture at 60 Hz, maximum sampled upper-joint frame change fell from .476 to .147 radians; maximum sampled angular acceleration fell from 1,542 to 182 rad/s². Arm excursion retained 92% of the unfiltered fixture. These are fixture measurements, not universal realism or phone-performance claims. Equivalent checks pass at 30/120 Hz; the response to a held target is timestep invariant.

Validation: `player-fluidity`, body mechanics/review/seams/range/profiles, player motion including ride/flight overrides, field/teaching contact, glue and batching regressions, and production build. `check-player-fluidity-browser.cjs` captures running-to-receiving and cutting-to-stopping at desktop/phone-width viewports using the actual shared player. All four live formats are covered by the locomotion browser check. Local only, not deployed; physical-phone heat unmeasured.

### September 22 — ball contact, goal frames and aerial choices (local)

Dribbling stays ahead of the stride; shots use venue-sized upper-corner placement; post/crossbar rebounds use bounded swept sphere/capsule tests. Live balls share one static 256×128 panel texture (no per-frame canvas work or additional ball draw calls), with 16×12 sphere geometry and distance-based rolling. Aerial decisions score plausible onside receivers against defender arrival times when a carrier can act, with cooldowns; no dense pitch-control grid or model inference. All use existing update clocks, visibility and cached collision outputs. Player turn lean/twist/backpedal refinements add scalar operations to existing poses.

Final production build, focused regression checks and controlled desktop/phone-width browser cases pass. A 96-match seeded sample and detailed validation are recorded in `game-engine-upgrade-2026-09-22.md`. No new external dependency, deployment or real-phone thermal measurement. The subsequent `body-movement-research-2026-09-22.md` is a research plan, not an additional implemented animation system.

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

## Card binder page turn and card lift — September 24, 2026 (local, not deployed)

- **Page turn (components/BinderLeaf.tsx, CardCollection.tsx):**
  - Each strip's shade and gloss, and the cast shadow under the page, now sit on their own compositor layers. Before this, changing their opacity every frame repainted every strip, and the GPU became the bottleneck: 21 frames drawn in 1.3 s on desktop.
  - The gloss no longer uses `mix-blend-mode`.
  - Strip copies only render the pockets they show, and are inert.
  - The strip count is lower: 5 on the spread and 4 on phone, down from 7 and 5.
  - The turn clock starts on the first rAF, so the mount frame no longer skips motion.
- **Card lift:** the viewer card is eagerly loaded when the binder opens, not lazy. The flight is one FLIP transform on a composited layer, measured once. The binder no longer re-renders while the card flies back.
- **Measurements** (headless Chrome, 2× scale, dev build; median / p95 / max frame ms):

  | | Before | After |
  |---|---|---|
  | Desktop turn | 49.9 / 100 / 117 | 16.7 / 16.8 / 50 |
  | Phone turn | 16.7 / 50 / 67 | 16.7 / 16.7 / 16.8 |
  | Lift | 16.7 / 16.8 / 34 | 16.7 / 16.8 / 34–50 |

  The lift had been stable already. What changed is that it no longer has hidden, doubled or popping frames.
- **Remaining:** one frame of about 50 ms while the sheets mount at the start of a desktop turn. This was fixed by the prebuilt turn below.
- **Prebuilt next turn (follow-up, same day):**
  - **What gets prebuilt:** the binder builds the one likely next turn ahead of time. That is the turning sheets, the page they uncover, and the page-turn shadows.
  - **Triggers:**
    - In idle time after each turn lands.
    - When hover or keyboard focus reaches a page arrow.
    - When a finger lands on a page in the two-page view.
  - **How it stays hidden:** the prebuilt turn sits at opacity .001. It is marked `data-prep` and `aria-hidden`.
  - **At turn start:** only these pieces are made visible, with the same React keys, so nothing mounts. The resting pages switch after the sheet has landed.
  - **The `:has()` cost:** mounting the shadows at turn start used to restyle about 2,400–3,800 elements because of the dialog's `:has()` rules, taking 10–45 ms. That now happens during the prebuild, and the restyle at turn start is about 1 ms.
  - **Mini cards** now skip re-rendering when nothing about them changed.
  - **Limits:** at most one prebuilt turn exists, and it is dropped when the page, binder, viewport or layout changes. It is built in small interruptible slices, so nothing runs at rest.
  - **Cost:** a few MB of GPU memory for the hidden sheet and the page copy.
- **First frames of a turn** (dev server, heavily loaded machine, so treat as relative):
  - Desktop: 67–217 ms before, now 17 ms when prebuilt and 33–67 ms when the turn wasn't predicted (e.g. ← key).
  - Phone emulation (390×844, 4× CPU throttle): 283–417 ms before, now 17–33 ms.
  - Long frames of 50–83 ms remain about 1 s into a desktop turn, after the sheet has landed. They come from the page swap and from building the next prebuilt turn, and they are not visible as stutter.
  - As above, these are not iPhone thermal measurements.
- **Scripts:** the benchmark scripts are in the session scratchpad: bench.mjs, liftprobe.mjs, trace.mjs.
- **Not a thermal claim:** these are desktop numbers, not iPhone measurements, so they don't show lower phone temperature.

## Cards, binder and films runtime audit — September 24, 2026 (local, not deployed)

**Method.** Local production builds (`next build` + `next start` on :8093), headless Chrome 152. Desktop at 1280×800 DPR 2. Phone emulation at 390×844 DPR 3 with touch, 4× CDP CPU throttle and a throttled network. The work counts come from CDP `Performance.getMetrics` (task, style, layout) and trace events: `Display::DrawAndSwap` for compositor frames and `FinishPaintRenderPass` for GPU render-pass time. `window.__fi2.renderStats` shows whether the island renders.

The machine was heavily loaded during the runs, from other agents and the Kokoro re-voicing (load average 6–22). Absolute timings are therefore noisy. The reliable evidence is the work counts and the A/B toggles made in the same session. Scripts are in the session scratchpad under `perf/`: `audit.mjs`, `gpuprobe.mjs`, `cardidle.mjs`, `sceneshot.mjs` and `binderopen.mjs`.

This section covers desktop and emulation numbers only. It makes no iPhone temperature claim.

**What was fine.**
- **Films are code-split.** Each of the 308 films is its own lazy chunk, and no film chunk loads with the island.
- **The film player stops cleanly.** On stop, close and tab hide it leaves no canvas and no rAF, and it pauses and releases its audio (src removed, `readyState` 0).
- **Nothing leaks.** Memory was checked across 10 card open/close cycles and 20 page turns:
  - Heap: 98.6 → 99.0 MB.
  - DOM nodes: 3008 → 3020.
  - Listeners: 651 → 651.
  - Live audio nodes: 4 → 4.
- **The binder is quiet at rest:** 0 running animations and 0 paints.
- **MiniCard masks are sized right.** They are 320×400 webp, which suits the pockets. The binder opening decodes 32 images in 13–39 ms.
- **Tilt and foil do no work at rest.**

**Changes.**
1. **The island loop sleeps behind menus** (`components/Town.tsx`, `wakeLoop`).
   - Paused menus already skipped rendering, but the rAF chain kept firing at 60/s. That forced a main-thread frame every tick, and every running CSS animation above the island restyled on each one, composited or not.
   - The loop now stops requesting frames after its frozen frame. Any Town render (menu open or close, appearance, time of day) and any resize wake it.
   - Result, binder open and idle: app rAF went from 60/s to 0/s, and main-thread time from 2.6–3% to 0.1–0.3% on desktop. The island still rendered 0 frames behind Paths, the binder and the card.
   - The lighting-idle test passes.
2. **Card live scenery is composited** (`components/PlayerArt.tsx` `LiveScenery`, `PlayerArt.module.css`).
   - Before, 22 CSS animations ran on SVG children, and each one restyled, laid out and repainted the scene every frame. Chrome never composites animations on SVG elements.
   - Each moving shape is now a small HTML box holding its own `<svg>`, on a 240-unit stage scaled like the `slice` viewBox. The scale is measured only on resize.
   - Transform origins are set inline in px, replacing `transform-box: fill-box`.
   - The short alternate loops are folded into long iterations with identical per-half easing: wings 10 flaps per 8.4 s, flag 5 ripples per 11 s. A composited animation still wakes the main thread at every iteration.
   - Card open at rest, same session, scenery running vs paused:

     | | Before | After |
     |---|---|---|
     | Desktop main thread | 14.4% (paused 3.3%) | 0.6% |
     | Phone 4× main thread | 25.1% (paused 15.5%) | 1.7% |
     | Layouts in 4 s | 240 | 0 |

   - Parity: frozen frames of 7 players × 2 times × 2 viewports differ by at most 0.47% of pixels, all anti-aliasing. After the keyframe folding, the frames are byte-identical.
3. **The live scenery rests** (lead's request after a real-device warmth report).
   - The scenery moves for 6 s after the card appears and after any interaction on the page (pointer, wheel, key, focus). It then freezes on its current frame: class `paused`, `data-scenery="rest"`.
   - To wake it without an input event (for example spin momentum), call `window.dispatchEvent(new Event('fi-scenery-wake'))`. The event name is exported as `SCENERY_WAKE_EVENT` from `components/PlayerArt.tsx`.
   - With reduced motion it stays still, as before.
   - Phone 4×: 60.3 compositor frames/s and 151 ms of GPU passes per 3 s while awake, then **0 frames/s and 0 ms at rest**.
4. **Backdrop blurs are removed.**
   - The card viewer's `blur(13px) saturate(1.1)` is replaced by the existing flat `#183b34d9` scrim.
   - The IslandSettings `fullModal` `::backdrop` `blur(3px)` is dropped after its 140 ms entry. The panel is opaque and full-screen, so that blur was never visible, but it was recomputed on every frame.
   - Same-session A/B (phone 4×, card open, scenery running), GPU render-pass time per 3 s:

     | Blurs | GPU time |
     |---|---|
     | Both | 260 ms |
     | No viewer blur | 187 ms |
     | No `::backdrop` blur | 206 ms |
     | Neither | 128 ms |

5. **CardFilmPlayer uses the story player's budget.**
   - 24 fps drawing, which is 20 fps effective on a 60 Hz display.
   - Canvas DPR 1.5, down from 2. At 390 px the canvas went from 646×824 to 426×530. Part of that is a card-size change made in parallel.
   - It skips redrawing an unchanged clock.
   - Compositor frames during a film: about 29/s → about 18–20/s.
   - The film is still CPU-bound in the riso engine's JS: about 5.6 ms per draw on desktop dev, mostly `athlete.ts` hull and limb drawing. At 4× it takes 75–95% of one throttled core. The engine was not changed.
6. **The position guide loads lazily.** `Town.tsx` now loads `PositionGuide` (and with it PlayerCard, PlayerArt, the photo manifests, the film registry and the riso player) with `next/dynamic`.
   - It prefetches on idle 6 s after the island is ready and then mounts closed.
   - The `CardCollection` chunk is prefetched when Paths opens.
   - Home first-load JS: 632 → 571 kB. Page chunk: 1164 → 903 KB raw.
   - The binder then opens in about 320 ms from click to pockets in the DOM, most of it the existing Paths navigation delay.
   - First guide tap: an interleaved A/B against a static-import build measured median ~0.63 s static vs ~0.82 s lazy, before the warm mount was added. That time is dominated by the existing pointerdown handler and the React render.

**Left for later.**
- The film engine's per-frame JS cost.
- Page-turn frames under load: phone max 50–83 ms, 1–3 frames over 34 ms. The same as before within the noise.
- Search: 30–60 ms per key on desktop, 50–200 ms at 4× for the first letters (40 thumbnails).
- `tests/card-collection.cjs` and `tests/iconic-play-ui.cjs` fail on other agents' recent UI changes: the hidden "Flip card" button, and Donnarumma now having a film. They are not caused by this pass.

**Follow-up: the Paths landing art** (`components/JourneyArrivalArt.tsx`, `IslandQuests.tsx`, `IslandJourney.module.css`, `lib/sceneryRest.ts`).
- **Composited pieces.** The sun halo, sun core, ball pattern and flag each moved into its own HTML layer, holding a full-art `<svg>` with the same viewBox as the static art. The browser snaps each layer to exactly the pixels the single SVG used.
  - An earlier try with small per-piece boxes was off by up to about 0.4 CSS px at fractional positions, because the SVG root rects are pixel-snapped. It was rejected.
  - Transform origins are set in px on resize only.
- **Rest after 6 s.** The art uses the same 6 s rest as the card scenery: the shared `useSceneryRest` hook and the `fi-scenery-wake` event.
  - The Paths header badge's `background-color` cycle is not composited, so it repainted every frame. It now rests with the art: `dialog:has([data-scenery=rest])`.
  - The covered field-lesson prompt's box-shadow pulse now pauses behind any open dialog.
  - With reduced motion the art is still, and screenshots match the old art exactly (max pixel difference 1).
- **Parity.** Frames frozen at 0, 1.3, 3.1 and 5.2 s, at 1280×800, 390×844 and 844×390: at most 0.75% of pixels change by more than 24/255, mean difference 0.11–0.56, max 98. All of it is anti-aliasing at edges.
- **A/B** of two prod builds, identical except for this change (phone 4×; the machine was heavily loaded):

  | | Before | After |
  |---|---|---|
  | Paths open, first 3 s | 9–24 layouts, 19–57 ms paint | 0 layouts, 0 paint |
  | Paths at rest, 7–10 s | still about 61 compositor frames/s and 181–196 ms of GPU passes per 3 s | **0 frames/s and 0 ms** |

- **Correction to the earlier "about 30%" figure.** It was measured while the island's idle rAF chain still forced main-thread frames. With the Town loop sleeping (change 1 above), the art's own main-thread cost was layouts and paints every few frames, plus continuous compositor and GPU work. The rest removes the compositor and GPU work.


## Player card back, hover tilt, flip sparks — September 24, 2026 (local, not deployed)

- **Back:** one flat card-stock face (same grain, trim and shadow as the front) with Strengths / Top Plays / History tabs. History (`lib/town/playerCareers`) and the Play Moment list (`iconicPlays.json`, ~90 kB) are dynamic imports loaded only when their tab shows on the back. Highlight clips (`components/CardHighlights.tsx`) fetch only while the Top Plays tab is showing; thumbnails are 80 px `mqdefault` with `loading=lazy decoding=async`; one iframe at a time (`fi2-video-play`), removed on tab change, turning the card or a hidden page. The old strengths/highlights sheets were removed.
- **Hover tilt (mouse only, `(hover: hover) and (pointer: fine)`):** ±14° X / ±18° Y through a critically damped spring written to `.flip` once per frame. The rAF loop runs only while the spring moves and sleeps as soon as it catches up, even with the pointer resting on the card. Leaving is judged against the card's flat box, via a document `pointermove` listener attached only while hovering. Touch and pen never tilt. Perspective is now 1400 px, so a tilted card stays on screen at 1280×800.
- **Flip:** always the CSS transition between the two faces, so it can't stop edge-on. The card is 4–6 px thick: 3 rim slices and 4 side strips, static preserve-3d layers. About 16 tiny sparks ride the leading edge inside the turning element for about 0.4 s each and unmount afterwards. They don't run with reduced motion. The drag and flick spin was removed at the user's request.
- **Measured** in headless Chrome at 2× (median / p95 / max frame ms): hover sweep 16.7 / 16.7 / 16.8; top-bar flip 16.7 / 16.8 / 16.8–33. There were 0 rAF calls in the second after rest, both while hovering still and after leaving, and 0 on the phone at rest.
- **Not a thermal claim:** these are desktop numbers, not iPhone measurements.

## Card flip turn light, viewer bar presses — September 24, 2026 (local, not deployed)

- **Flip particles removed.** After several rounds, the user rejected the edge sparks and trail streaks. Their DOM, CSS and notes are gone.
- **Turn light replaces them** (`PlayerCard.tsx` `TurnLight`, `LIFT`; `.turnLight`/`.catchLight` in `PlayerCard.module.css`). The flip curve puts the card edge-on at about 90 ms, so the turn is split there.
  - **Glare sweep:** a diagonal glare band crosses the face turning away (0–95 ms), getting brighter toward edge-on. The face turning in then carries it across and fades it (80–500 ms). The band follows the turn direction.
  - **Shade:** the leaving face darkens as it turns away, and the arriving face clears.
  - **Catch light:** two strips on the card's side thickness flash cream/gold around edge-on (0.3 s).
  - **Lift:** the card scales to 1.04 and lifts 4 px through the turn, then settles with a small overshoot. The ground shadow widens and softens while the card is up. This is done with Web Animations on the individual `scale`/`translate` properties, so it composes with the CSS transform and hover tilt.
- **Cost:** per flip, 6 small layers (2 per face plus 2 edge strips) and 2 Web Animations. Only transform and opacity change, with no filter. The layers unmount when the incoming sweep ends (about 0.5 s), and the Web Animations finish at 0.7 s. Nothing runs at rest; checked with 0 turn-light nodes after the flip.
- **Reduced motion:** a plain instant flip. No layers mount and there is no lift.
- **Viewer bar.**
  - Done now uses the shared NavigationButton collapse: a 240 ms shrink to the round check, then it fades with the closing viewer. It was `immediate` before, and it is keyed on the lift phase so a tap during the lift can't stick.
  - Flip and Play get the paper-pill hover (−2 px, 7 px drop, `hover:hover` only) and press (+3 px, 2 px drop). These are `translate`/`box-shadow` transitions of 0.16 s, and there are none with reduced motion.
- **Checks.** Paused mid-flip frames at 390×844 and 1280×800 (every animation paused at 40/90/160/260 ms, both directions) show the sweep, shade, catch light and lift. `tsc`, `npm test` and `tests/iconic-play-ui.cjs` pass. No phone thermal claim.

## "Pick a card" deck, reveal and covered scenery — September 24, 2026 (local, not deployed)

- **What still ran behind the offer.** Headless Chrome at 390×844, sampled for 3 s with the dialog open (`document.getAnimations()`, wrapped `requestAnimationFrame`/`setTimeout`, `renderStats.rendered`):
  - **Ball offer (island behind):** already quiet. The island loop sleeps through `cardOfferOpen` in `settingsRef` (+0 frames), and there were no rAF callbacks, no timers and no CSS loops outside the dialog. Browsing cards, the film and the reveal also added +0 island frames.
  - **Offer over Paths (Journey stage, story or quiz end):** 5 infinite CSS loops kept running behind the dialog: the Paths landing art (`sunGlow`, `sunPulse`, `ballRoll`, `flagFlap`) and the IslandBottle badge colour cycle (a background-colour repaint). The cause was that `useSceneryRest` woke on any pointer, key or `focusin` on the page, including the dialog's own focus and every tap and arrow press inside it.
  - **Fix (`lib/sceneryRest.ts`, one guard).** If the event's target (or, for the window wake event, the focused element) is inside a modal `<dialog>` that doesn't contain the art, the art rests at once and the event doesn't wake it. After the fix there are 0 loops behind the offer, including after arrow keys, arrow taps and pointer moves, and the art wakes normally when the offer closes and focus returns to Paths.
  - **Music keeps playing** under the offer. This is the app's existing modal behaviour: music ducks only for the field catalog, lessons, the bottle and video. Island sound effects start 0 sources while the offer is open.
- **The dialog's own cost.**
  - Static MiniCards on the flat scrim.
  - Changing the front card is one 0.3 s transform transition. Stacking and the dim filter switch in one step mid-move, so nothing else animates.
  - Choosing fades the other cards once (0.24 s), and the spin is one WAAPI transform animation on PlayerCard's `.flip` (0.85 s).
  - The revealed PlayerCard's looping scenery is paused by the offer's CSS, so the dialog has no endless animation. Its film, hover tilt and foil turn behave as in the binder.
  - PlayerCard's chunk is imported only once an offer is open.
  - There are no animations with reduced motion.
- **Checks:** `scratchpad/pickcard/ui.mjs` at 390×844, 375×667, 1280×800 and reduced motion, plus `bg-probe.mjs` for the ball and Paths cases. No phone thermal claim.

## New cards, binder and quiz features: second runtime round — September 24, 2026 evening (local, not deployed)

**Method.**
- **Build:** a local production build (`next build`, then `next start` on :8093) of a snapshot of `app/`, `components/` and `lib/` copied to the session scratchpad. `public/` and `node_modules` were symlinked. The snapshot kept the build stable while other agents edited files. It was rebuilt once at 17:04 to pick up the bug sweep's later edits: the ghost card's `pointer-events`, the choice `:disabled` colours, and the scroll into view after an answer.
- **One test-only patch.** `cardDevEarn()` ignores `?cards=earn` in production builds, so the snapshot dropped its `NODE_ENV` guard. Without that, the offer and the greyed cards can't be reached. The repository is unchanged.
- **Emulation:** headless Chrome 152.
  - Phone: 390×844, DPR 3, touch, 4× CDP CPU throttle.
  - Desktop: 1280×800, DPR 2.
- **What was recorded:**
  - Frame times: rAF deltas, given as median / p95 / max in ms.
  - Long tasks.
  - Trace sums: `Paint`, `RasterTask`, `Layerize`, `UpdateLayoutTree`, and GPU `FinishPaintRenderPass` for render-pass time.
  - `window.__fi2.renderStats.rendered`.
  - Running `document.getAnimations()`.
  - Wrapped rAF, timeouts and intervals.
  - Heap after forced GC, DOM nodes and listeners.
- **Machine load** was 1.6–3 for the numbers below. An earlier pass at load 8–11 produced 50–300 ms long tasks on the phone profile in every feature, and none of them reproduced at low load.
- **Scripts:** in the session scratchpad under `perf2/`: `offer.mjs`, `binder.mjs`, `ghostab.mjs`, `cardflip.mjs`, `quiz.mjs`, `quizdrag.mjs`, `quizrest.mjs`, `gap.mjs` and `backturn3.mjs`, with shared code in `lib.mjs`.
- **Not a thermal claim:** these are emulation numbers, not iPhone temperature measurements.

**Results** (phone 4× unless noted; frames are median / p95 / max ms):

| Feature | Measurement |
|---|---|
| Pick a card: browse (2 arrows, ← key, swipe, 2 arrows) | 16.7 / 16.7 / 16.8, 0 long tasks. Desktop the same. |
| Pick a card: choose + 0.85 s spin | 16.7 / 16.8 / 16.8. Worst over 4 offers: 33.2. |
| Pick a card: flip + flip back in the reveal | 16.7 / 16.7 / 16.8, 0 turn-light nodes afterwards. |
| Pick a card: film, 4 s | 16.7 / 16.7 / 16.8. Worst over 4 offers: 33.4. |
| Island while an offer is open | +0 rendered frames in each of 4 offers. |
| Offer or reveal at rest | 0 running animations, 0 rAF, 0 timers, 0–0.2% main thread, 0 compositor frames. |
| Memory after closing offers | DOM nodes 1929 → 1929 and listeners 498 → 498 over 4 offers. Heap +2.4 MB after the first offer (PlayerCard and film chunks), then about +1.4 MB per new card's film module. The same offer 7 times levels off (99.2 → 100.3 MB), so nothing leaks. |
| Binder turns, greyed (all 36 pockets filtered) vs full collection | Forward 16.7 / 16.8 / 50 vs 16.7 / 16.8 / 33.4. Back 16.7 / 16.8 / 33.4 vs the same. Paint 175 / 274 vs 182 / 278 ms, raster 11.8 / 10.5 vs 12.2 / 10.5 ms, GPU 29.5 / 29.3 vs 30.1 / 28.3 ms per 4 turns. |
| Same-session A/B per turn: shipped / no `grayscale` / no filter and no opacity | Phone: main 255 / 253 / 256 ms, paint 55 / 55 / 55, raster 2.5 / 2.3 / 2.3, GPU 7.1 / 7.2 / 7.5. Desktop: main 232 / 238 / 220 ms, raster 7.6 / 6.8 / 8.7. |
| Card lift, grey viewer vs collected | 16.7 / 16.8 / 50 for both, with one 62–64 ms task at 4× (PlayerCard mount). Lift out 16.7 / 16.7 / 16.8. |
| Grey viewer | GPU 32 ms per 3 s while the scenery is awake (collected card: 27). At rest (7–10 s): 0 frames, 0 rAF. Filter on vs off, same session: 102 vs 100 ms phone, 170 vs 173 ms desktop. |
| Foil turn, 6 flips in the binder viewer | 16.7 / 16.8 / 16.8, 0 long tasks, desktop the same. 0 turn-light layers afterwards, and 0 animations, rAF or timers at rest. |
| Visual quiz, 16 answers over 2 rounds (wrong + Try again on each lesson's first question) | 16.7 / 16.8 / 150. The 3 frames over 34 ms all fell on the first lesson's first answers (first loads). Round 1 → 2: DOM nodes 2343 → 2343, listeners 563 → 563, heap 96.4 → 96.9 MB. |
| Visual quiz: drag the token, 30 touch moves | 16.7 / 16.8 / 16.8. The first touch costs one 108 ms task at 4×. |
| Island after closing each feature | Back to its baseline: one rAF chain (the island loop, 30 rendered frames/s on phone), the same 7 infinite HUD animations as before opening, 0 timers and 0 intervals. |

**Conclusions.**
- **No regressions in the new features, so no code was changed.**
- **The grey pockets cost nothing measurable during turns.**
  - Removing `filter:grayscale(1)`, or both the filter and the opacity, changed per-turn main-thread, paint, raster and GPU time only within noise, on phone and desktop.
  - Chrome rasterizes the filtered pockets once, when the page and the prebuilt turn are painted. After that the turn only moves layers.
  - The cheaper alternatives (desaturating the art once, a layer per page, or dropping the filter on strip copies) would save nothing, so the look stays as it is.

**Left over (not fixed).**
- **Desktop back turns.** Consecutive back turns (for example pages 8 → 6 → 4 → 2) show one frame of 67–117 ms about 170–220 ms into the turn. It happens with the full collection too.
  - Traces show the GPU thread's `SwapBuffers` waiting 83–113 ms (`WaitForCommandsToBeScheduled`), with no main-thread task.
  - Forward turns and alternating next/prev turns don't show it. Phone emulation doesn't show it either.
  - It is desktop Chrome GPU scheduling of the newly shown sheet, and it says nothing about WebKit on iPhone.
  - To reproduce: `gap.mjs` with `SEQ=1`.
- **After a turn lands.** Frames of 50–83 ms about 1.0–1.2 s after a desktop turn starts. These are the page swap plus the next prebuild, as noted earlier, and nothing is moving at that point.
- **Quiz questions.** While any quiz question waits for an answer, the island still renders 30 frames/s of a static scene: at most 120 px changed in 6 s, and 9% main thread at 4×.
  - This is the existing field-lesson loop, not something the visual questions added.
  - Sleeping it while a visual (SVG) question waits is the next heat saving worth trying. It needs a Town loop change that keeps the post-answer replay and the 3D tap questions working. (Done: see "Quiz questions sleep the 3D loop while waiting" below.)

## Quiz questions sleep the 3D loop while waiting — September 24, 2026 late (local, not deployed)

**What changed.** While a lesson quiz question waits for an answer, `Town.tsx`'s `animate()` now uses the same sleep path as the menus (`paused` / `idleSince` / `loopSleeping` / `wakeLoop`). No new loop was added.
- **Condition.** The loop sleeps when `fieldSession.current.quiz` is set and `answer === null`. This covers visual (SVG) questions and the 3D "tap the pitch" (`interact`) questions.
- **When it sleeps.** It waits until the camera has stopped moving and 1.2 s have passed. The camera counts as moving if its position, rotation or zoom changed in the last rendered frame. The 1.2 s lets the players' poses finish blending after a launch; with 0.5 s the first settled frame differed from a fresh render by about 200–460 px on the players' limbs.
- **What resets the settle timer.**
  - A change of lesson, question or camera angle.
  - A resize or orientation change (the existing `resizeRevision`).
  - A gesture on the canvas. `pointerdown`, a `pointermove` with a button held, `wheel`, `touchstart` and `touchmove` bump `quizInput` and call `wakeLoop()`.
- **Waking from the quiz UI.** `FieldLearning` takes a new `onWake` prop and calls it after every render, the same pattern Town uses. An answer (SVG, keyboard or pitch tap), Try again, Next question, the camera button, Back and Done all re-render it, so the loop wakes. A wake with nothing changed goes straight back to sleep without rendering.
- **After an answer.** `answer !== null`, so the loop runs as before: `feedback.highlight`, the "Show me" / autoplay `QuizReplay` and the camera move to the feedback shot all animate.
- **Taps and hovers on 3D questions.** A tap works while the loop is asleep. The camera keeps the pose of the last rendered frame, so `games.pickQuiz` hits what the child sees, and the tap's `pointerdown` wakes the loop anyway. Hover has no 3D effect in a quiz: live-player inspection is off during a field session, and the quiz choices have no hover highlight. That is why a mouse move without a button held doesn't wake the loop.

**Render counts** (dev server :8092, phone 390×844 DPR 3 touch with 4× CPU throttle, `perf2/quizrest.mjs`, load 1.7–2.6; `window.__fi2.renderStats.rendered` over 3 s, measured 4 s after launch):

| State | Before | After |
|---|---|---|
| Island idle (reference) | 91 | 91 |
| Visual question waiting (`learnf_roles31` q4, trueFalse) | 90 frames, 9.3% main thread, GPU 1.8 ms | 0 frames, 0% main thread, 0 swaps |
| 3D tap question waiting (`learnf_roles31` q1) | 90 frames, 9.5% main thread | 0 frames, 0% main thread, 0 swaps |

The loop keeps rendering for about 3–5 s after a question appears while the camera settles, then renders nothing until the child acts. On desktop (1280×800) it renders at 60 fps during that settle, then 0.

**Checks** (`perf2/quizsleep.mjs m|d`, all pass on phone and desktop):
- A visual question stops increasing `rendered` once settled.
- The camera button, a rotate to landscape and back, Try again and Next question each wake the loop, animate, and settle back to sleep.
- A wrong answer wakes the loop.
- A right answer shows its highlight.
- Back to live game returns to the full rate.
- On a 3D question the loop sleeps; a drag rotates the view from sleep; tapping a wrong option answers it; "Show me" plays the replay (`outcomeProgress` 0 → 0.26 in 1 s); Try again goes back to sleep; the right tap autoplays the replay; Next settles back to sleep.
- **No stale frame:** after each sleep, a forced re-render (a resize event) differs from the slept frame by 0–65 px out of 2.9 M. That is anti-aliasing and shadow noise on limbs.
- **Gates:** tsc, `npm test`, quiz-replay, quiz-outcomes, lesson-cues, lesson-presentation and visual-quiz all pass.

**Tradeoffs.**
- The small idle motion of the posed players stops while the loop sleeps. That is the "at most 120 px in 6 s" noted above, and it is the same freeze the menus use.
- Other venues' background matches pause while the loop sleeps, as they do behind menus.
- The answered or feedback state still renders at 30 fps (phone) until the next question or close. That is unchanged and could be a follow-up once the replay ends.
- These are emulation render counts, not iPhone temperature measurements.
