# Night atmosphere — September 19, 2026

Local implementation; not deployed. This pass improves night landmarks around football learning venues while retaining the existing renderer, frame-rate/DPR policy and shadow system.

## Implementation

- Night hemisphere intensity changes from 0.85 to 0.67, with cooler upper/lower colors. The existing moonlike directional light stays at 0.95 and exposure at 0.9 so directional shape and player readability remain. The existing gradual transition and settled-light sleep continue unchanged.
- Three existing dark glass colors retain their daytime vertex colors and share one warm emissive material at night. The material is grouped by the existing 50 m spatial batches: 37 window chunks across the complete island, rather than three distinct window materials per chunk. Existing ferry glass uses the source materials and receives the same mode update.
- Existing sign textures also serve as emissive maps; no duplicate canvas or texture is created. Day preserves the arcade signs' prior emissive values. Night raises low-emission signs to 0.75. The emissive-map shader remains present in every mode, avoiding a shader-feature toggle when changing time.
- Ten compact lamps sit beside selected civic/learning venues and approaches. Candidate positions overlapping existing obstacles are skipped. Posts join the ordinary static batches and have small collision footprints.
- Ten soft, eight-metre ground pools use eight spatially culled instanced chunks, one shared plane geometry and one 32×32 radial texture generated once. Their additive material has depth testing and no depth writes, with no shadow casting or receiving. They approximate illuminated pavement; they do not illuminate passing characters or dynamically project light onto walls.
- `updateTrafficSignals(mode)` changes only emissive uniforms and pool visibility alongside its existing lens update. There is no additional frame loop, timer, polling, canvas repaint or animated light. Pools are hidden outside night.
- A scenery root contains the mode-controlled pool group, so isolated-field hiding/restoring cannot accidentally reveal daytime pools. Disposal releases the instanced meshes, shared pool geometry, material and texture.

## Added work and limits

The fixtures add approximately 1,040 triangles and the ground pools 20 triangles island-wide. Pool instance matrices contain 640 bytes before driver overhead; the single texture is 4 KiB at its base level, approximately 5.3 KiB including mip levels. There are eight possible additional pool draws, locally culled; separated window batches also increase color-pass draw count where visible. Signs add an emissive texture sample while reusing their existing texture. Ordinary fixture geometry participates in the existing shadow pass; no light, shadow map, postprocessing pass, bloom chain or network asset is added.

These counts describe bounded added work, not measured frame time, load time, phone temperature or battery use. Transparent pools add some overdraw near the selected lamps. Emissive windows and signs are surface appearance, not physical local illumination. Any desktop/mobile render measurements must use comparable cameras, viewport, DPR and mode; real iPhone heat still requires real-device testing.

Coordinator-provided before snapshot: desktop night 614 draw calls, 282,386 triangles, 34 textures and 686 geometries. This is a single view, not an island-wide geometry count. The coordinator owns the after screenshot and comparable runtime measurements.

## Validation

- Repository TypeScript check passed.
- Existing lighting-idle, static-shadow-batches, shadow-visibility and live-field-frame suites passed.
- A local structural world-build check verifies 10 accepted lamps, eight pool chunks, 37 shared window chunks, 20 pool triangles and zero added real lights.
- The structural check verifies night/day mode changes, isolated scenery hide/restore in both modes, no pool shadow/depth-write flags and exactly-once shared geometry/material/texture disposal plus every instanced-mesh disposal.
- Browser visual comparison and gameplay checks completed as recorded below. The combined production build and deployment remain with the coordinator. No thermal or Safari claim is made by these checks.

## Final local browser audit

Chrome, local development server on port 8092, desktop 1280×850, same startup night view. The original baseline JSON and screenshot were preserved. The repeated audit uses the original fixture, with output filenames changed to avoid overwriting baseline evidence.

| Metric | Before | After | Interpretation |
| --- | ---: | ---: | --- |
| Color/render calls reported by renderer | 614 | 632 | +18, approximately 2.9% in this view |
| Triangles reported by renderer | 282,386 | 282,092 | Moving actors/culling differ; not evidence of a geometry saving |
| Resident textures | 34 | 35 | One ground-pool texture |
| Resident geometries | 686 | 704 | Additional spatial batches and fixtures |
| rAF interval median | 16.7 ms | 16.7 ms | Browser cadence, not GPU timing |
| rAF interval p95 | 16.7 ms | 16.8 ms | 120-frame sample; not a sustained performance/thermal test |
| Lights / shadow-casting lights | 2 / 1 | 2 / 1 | Existing light count retained |

Visual inspection confirms warmer windows, readable storefront signs and soft pools around selected civic lamps, with the main player and road edges still readable. Actual steering produced a head turn of approximately 0.22 radians and a finite knee pose, and normal landing finished in walk mode at height zero. No page errors occurred.

At mobile-emulated 390×844 with browser device scale 3, the renderer retained its DPR cap of 2. A night snapshot reported 368 calls, 113,245 triangles and two lights. Day mode hid the pools; returning to night restored them. After the existing day-light transition settled inside Settings, the renderer frame counter advanced zero times during a 700 ms observation. Scooter, bike and moped each triggered their intended character-contact reaction in the live 7v7 scene. No page errors occurred. These mobile figures have no matched pre-change mobile baseline and must not be compared to the desktop figures.

Temporary evidence: `/tmp/fi-night-baseline.json`, `/tmp/fi-night-after.json`, `/tmp/fi-night-before.png`, `/tmp/fi-night-after.png`, `/tmp/fi-night-mobile-after.png`, `/tmp/fi-night-mobile-audit.json`. Recreate fixtures if temporary files disappear. Source review and structural checks confirmed mode-only material updates, spatial culling, isolated-field visibility and pool disposal. No additional defect required a code change during this final audit. No deployment or real-phone heat measurement was performed.

## Follow-up: stronger cool/warm separation

A second visual audit found that the first pass remained broadly grey despite its illuminated windows. The follow-up keeps the hemisphere at0.67 for shadow-side readability, changes the night sky to`#0d1830`, uses cooler upper/lower fill (`#829cdf`/`#20314f`) and changes the existing moonlike directional light to`#a0bdf4` at0.82. Exposure stays0.9. Day and sunset presets are unchanged, and the same lighting interpolation/sleep mechanism is retained.

Night windows now emit warm amber (`#ffc176`), returning to their original emission color outside night. Existing lamp lenses use warmer light at night. The same ten ground-pool instances expand from8m to10m and use a slightly stronger warm radial falloff. These pools remain localized to their fixtures and selected venue approaches. No added draw calls, geometries, textures, lights, shadows or network assets. Their bounding area increases56%, so transparent fill work can increase near visible pools even though draw counts are unchanged. No extra update loop, material recompilation, bloom or other postprocessing is introduced.

The after screenshots show cooler roads and rooftops against amber windows and pools, with readable crossing paint, pitch markings, venues and character silhouettes. Pools still approximate light on pavement; they do not physically light the player.

Fresh matched Chromium runs on the same development server and startup cameras:

| View / metric | Current pass before refinement | After refinement |
| --- | ---: | ---: |
|1280×850 calls|632|632|
|1280×850 textures / geometries|35 /704|35 /704|
|1280×850 triangles|281,960|282,068|
|390×844 calls (renderer DPR2)|367|367|
|390×844 textures / geometries|21 /501|21 /501|
|390×844 triangles|113,283|113,243|
|Both views lights / shadow lights|2 /1|2 /1|
|Both views rAF median|16.7ms|16.7ms|
|Both views rAF p95|16.7ms|16.8ms|

Actor movement changes the triangle snapshots; no geometry saving is claimed. These are120-frame rAF samples, not GPU timing or sustained heat measurements. Local Settings-ready times were desktop7.370→7.175s and phone7.065→7.001s, including the existing loading animation and development-server overhead; this does not establish a load-time improvement. There are no new asset requests in this refinement.

Both views switched through Day→Sunset→Night and retained the expected pool visibility. Each mode settled in Settings with zero rendered frames across a700ms observation. World scenery hiding also hid the night group and restored it afterward. No page errors occurred.

`tests/night-atmosphere.cjs` now checks ten lamps/eight pool chunks/20pool triangles/37shared window chunks, mode colors/intensities, unchanged material versions across modes,10m instance scale, isolated visibility and exactly-once shared geometry/material/texture plus instance disposal. Lighting-idle, static-shadow-batches, shadow-visibility, shadow-coverage and live-field-frame suites pass. The full project typecheck initially encountered an unrelated concurrent GritFilm/StoryPlaybackBar`cue`prop mismatch; integration typechecking remains with the coordinator.

Evidence: `/tmp/fi-night-before-review.json`, `/tmp/fi-night-after-review.json`, `/tmp/fi-night-before-1280.png`, `/tmp/fi-night-after-1280.png`, `/tmp/fi-night-before-390.png`, `/tmp/fi-night-after-390.png`. Reproducible browser fixture: `/tmp/fi-night-atmosphere-review.cjs before|after`. Still local, not deployed; no real-device temperature, battery or Safari claim.

## Destination coverage follow-up — September19, local

Road sampling left the pier, North Beach, farmers market and community garden underlit. Added32 explicitly placed fixtures:8 along the pier,10 near beach approaches/furniture,7 beside the market promenade and7 around garden paths. Total civic fixtures58→90, still below the96-site cap. Minimum12m spacing, traffic/junction rejection and obstacle checks remain. The garden entrance, beach path centers and5m market promenade remain clear.

New poles use the actual local surface offset: sand, paving or wooden deck. The pier's3m-deep glow lies entirely within its8m deck; the only exception to the shoreline guard is a bounded known deck rectangle. Other sites must pass `onIsland`. The static lamp geometry joins the existing material/spatial batches, with no new real lights or shadow casters. Ground pools reuse the existing32px texture and material. Pool chunks36→50; pool geometry is still shared, with180 total instance triangles. No new timers, render loops, image requests or textures. More visible batches and transparent pixels are an added cost, not a thermal optimization.

Chromium1280×850 and390×850 captures cover the hub and all four regions with no page errors. Independent page-load comparisons showed region draw increases of1–16; textures were unchanged for corresponding views. Actors can differ between page loads, so triangle differences are not isolated lamp-only measurements. Regional screenshots are `/tmp/fi-lamp-{pier,north-beach,market,garden}-{1280,390}-{before,after}.png`; measurements are `/tmp/fi-lamp-regions-{before,after}.json`. The earlier root street audit used a different capture setup, so its636/370→670/379 counts should not be subtracted from these regional captures.

Structural tests assert destination coverage, bounded count, spacing, road clearance, deck containment, correct new ground offsets, clear beach/market/garden entrances, no new actual lights, unchanged material versions on mode switches, isolated scenery visibility and disposal of every pool instance/shared resource. Typecheck and night-atmosphere, lighting-idle and field-lighting suites pass.

The daylight complaint persisted after the first correction. A second same-camera comparison lowered daytime hemi1.65→1.25, sun2.35→1.8 and exposure0.95→0.88 while preserving palette colors. Warm stone remains readable and greens/terracotta retain more separation; sunset/night are unchanged. Comparison references are `/tmp/fi-day-richer-reference-{1280,390}-{before,after}.png`. This changes uniforms only and adds no work. No physical-phone heat claim and no deployment.

Final visual review found the newer East Coast deck covering the market glow planes. Market sites on that deck now use0.025m, while the northern paved site uses−0.022m; tests distinguish both surfaces. Final screenshots confirm the glows render above the planks. All ten regional browser views pass with zero page errors; final TypeScript passes.

## Continuation: transition completion and current palette

Retained the latest warm daylight, rose sunset and brighter warm night presets from current source. Day uses hemisphere2/sun3/exposure1; sunset1.45/2.05/.92; night1.15/1.05/.98. These supersede older palette experiments above. No palette or fixture change in this continuation.

The exponential light transition now completes its imperceptible tail at2.9seconds, inside Town's existing three-second Settings render allowance. Previously the numerical transition remained unfinished when rendering slept. Mode changes reset this age; settled updates still return immediately. No extra frames, lights, shadows or timers. The regression confirms exact target values by three seconds and no color writes on the next update.

Lighting-idle and field-lighting suites pass. Desktop1280 and touch-emulated390 browser checks verify Night/Sunset/Day all return to zero rendered frames in settled Settings, with no page errors. Current daylight and pier screenshots at1280/390 were inspected (`/tmp/fi-day-latest-*.png`, `/tmp/fi-lamp-pier-*-continued.png`). Browser evidence: `/tmp/fi-movement-continuation.json`. Local only; physical-device thermals unmeasured.

Combined production build passed after the movement, lighting and Woven continuation.

## Latest sunset correction: coral and pink golden hour

The first brighter golden preset was rejected for resembling Day. The retained sunset now uses sky `#f29cac`, upper fill `#ffd4c6`, lower rose bounce `#ad6f91`, and orange sunlight `#ffad70`, with hemisphere1.7, sun2.95 and exposure1. This makes the warm light visibly coral against the daytime palette while retaining the pink sky and rose fill. Day and night are unchanged.

Lighting-idle regression passes. Matched frozen390/1280 plaza comparisons against actual Day show warmer coral buildings/paving, with equal calls, triangles, textures, geometries and lights; Settings continues sleeping after transitions. Captures: `/tmp/fi-coral-sunset-vs-day-{390,1280}-plaza-{before,after}.png`; report `/tmp/fi-coral-sunset-vs-day-review.json`. Existing camera views show little sky, so these captures primarily validate surface lighting. Uniform/palette changes only; no new runtime lights, loops or effects. Local, not deployed; physical-phone temperature unmeasured.
