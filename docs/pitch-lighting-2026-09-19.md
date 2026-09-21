# Night pitch lighting — September 19, 2026

Local implementation; not deployed. Warm-white corner floodlight banks make playable pitches readable after dusk. Each of the four formats has four poles just outside its corners, three luminous panels per bank, visible upper diffuser rims, no decorative ground pools or approach bollards. Structures remain attached to their field roots, so isolated learning views retain the relevant fixtures and hide the other fields normally. Night island lighting is unchanged; the daytime follow-up is recorded below.

Grass keeps its original rich green (`#6e9678`) at night, with restrained neutral emission (`#d0ccb7`) at 0.025. The initial lighter/desaturated surface looked washed out and was removed after screenshot review. Grass spot strength is now 50% of the initial pass (down from the intermediate 78%); neutral fill is down from the intermediate 0.09. Futsal retains its original surface hue; a later brightness adjustment reduced its source strength and material fill by18% (fill0.3→0.246). Markings and goals retain nighttime readability; daytime colors and zero emission are restored.

## Lighting budget and tradeoff

There are exactly four shared, non-shadow-casting spotlights: one at each corner bank of the currently relevant visible pitch, or the explicitly selected learning pitch. Each light targets inward across the playing area. The earlier two-diagonal-light pool was replaced because the user wanted all four fixtures to contribute actual illumination. Each new light uses half the previous per-light strength, initially keeping total source intensity unchanged while distributing it across four corners; the later futsal adjustment reduces its total by18%. All four visible banks share the same emissive intensity and visible upper diffuser rims. Decorative corner footprints and approach lights remain removed. Distant pitches retain material fill and luminous fixtures instead of separate dynamic lights for their players.

All four real lights remain in the shader light list with zero intensity in day/sunset. This avoids mode-switch shader compilation but adds four light calculations to affected material shaders, twice the earlier two-light pool. No new shadow maps, shadow lights, postprocessing, network assets, timers or animation loops are added. Selection uses the existing frame loop and pitch-visibility scoring at most every 120 ms outside an explicit selected field. Uniform changes fade with the existing mode transition; paused island rendering still sleeps.

Each visible field adds two batched fixture meshes: two draw calls, 560 triangles. Five-court construction, including Rooftop Knockout, adds ten geometries and two shared materials, with no new textures or transparent pool overdraw. These are resource/work counts, not measured phone temperature or load-time improvements.

## Verification

`tests/field-lighting.cjs` covers all four formats, fixed four-light budget, no new shadow casters, absence of decorative pitch accents, grass-only strength reduction, selected and hidden field behavior, day restoration, stable material versions, transitions and disposal. Live-field-frame, lighting-idle, shadow-coverage and shadow-visibility suites pass. TypeScript passes.

The local browser audit uses actual field selection at 1280×850 and 390×844 (mobile renderer DPR2), then pauses the live match for a controlled same-camera comparison. It checks selected-field light placement, isolated scenery, day/sunset intensity zero, constant program count through repeated mode changes, settled Settings render sleep and zero page errors. Captures and measurements are `/tmp/fi-pitch-{format}-{width}-{before|after}.png` and `/tmp/fi-pitch-lighting-review.json`. Resident texture/geometry totals in that report are cumulative session totals, not isolated before/after memory measurements. Physical iPhone heat, battery use and Safari performance were not measured.


## Daytime color follow-up

Daytime retains its warm palette but reduces hemisphere intensity 2.1→1.65, sun intensity 3.2→2.35, and exposure 1→0.95. This reduces bright compression and restores separation in turf, trees and masonry without adding saturation filters or darkening night. Sunset and night presets remain unchanged. Same-camera before/after browser renders at 1280px and 390px cover the island and all three grass formats, with no page errors. `/tmp/fi-day-review.json` confirms unchanged draw/triangle counts; comparison captures are `/tmp/fi-day-{island,7v7,9v9,11v11}-{1280,390}-{before,after}.png`. Mode restoration and sleeping tests assert the new exact day values.


## Rooftop Knockout

The main-island rooftop is a fifth target for the same four-light pool, not a new renderer or an extra set of global lights. Four 8m poles stand outside the 24×44m playing lines but within the 28×50.5m roof/cage bounds. They use the existing shared fixture materials and add two merged meshes/560 triangles, with no textures or shadow casters. An actively joined Knockout game takes lighting priority; otherwise the roof participates in the existing visible-court selection. Isolated teaching pitches override that priority and hide the roof fixtures. The roof surface retains its existing material. Tests check all four real sources, exact roof bounds, teaching-view priority, day-off behavior and disposal.

Rooftop Chromium checks at1280×850 and390×850 joined the actual game, verified four positive non-shadow lights on the rooftop target, switched Night→Day→Night, and confirmed paused Settings rendering sleeps with zero page errors. Captures are `/tmp/fi-rooftop-{1280,390}-{day,night}.png`; `/tmp/fi-rooftop-lighting-review.json` records the source positions, intensities and render counters. Existing four-format night checks also passed both viewport sizes with the four-light pool, fixed program counts across mode changes and no page errors.


## Landing continuity and futsal softening

An actual flight→landing→walking browser reproduction found11v11 losing all four lights on49/49 grounded samples: camera-only selection rejected its projected corners at the near plane. Selection now gives the player's occupied pitch priority before camera scoring, using the existing player position vector without per-frame allocations. A4m vertical tolerance avoids claiming elevated courts from ground level; a2m entry/5m exit margin avoids edge flicker. Explicit teaching pitch and joined Rooftop Knockout priorities remain stronger. Leaving the pitch releases occupancy and resumes camera scoring; no extra lights, geometry or timers are added. Unit checks exercise invalid camera projections on all four formats, edge hysteresis, releasing priority and standing below elevated futsal. Futsal source strength and material fill are reduced18%; grass values stay unchanged.

Baseline reproduction: `/tmp/fi-landing-lighting-before.json`. Post-fix actual flight/landing/walk checks and samples: `/tmp/fi-landing-lighting.json`; screenshots `/tmp/fi-land-{format}-{1280,390}.png`.

Post-fix result: all eight flight→landing→walk cases (four formats at1280px and390px) retained positive intensity on all four lights throughout48–49 grounded samples each and subsequent walking, with zero page errors. The prior11v11 desktop run had49/49 grounded samples unlit. Typecheck, field-lighting, lighting-idle and live-field-frame suites pass after this correction. No rendering resources or shader light count changed.
