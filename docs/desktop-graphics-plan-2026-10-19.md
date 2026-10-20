# Desktop graphics plan: "Standard" for phones, "High" for capable computers (Oct 19 2026, research only)

User question: *"Is it possible to have two variations of the game? For mobile, keep it like it is, but for desktop, improve the graphics dramatically?"*

**Answer: yes.** One codebase and one site, with a **graphics profile** chosen per device: `standard` (today's renderer, byte-for-byte
unchanged for phones and tablets) and `high` (an extra, desktop-only layer of looks). The `high` code sits in its own lazily loaded chunk,
so phones never download it, and it is chosen by capability detection plus a settings toggle, with an automatic fall back to Standard
when frames slow down. Nothing in this document has been built. Effort figures are estimates; GPU costs are reasoned from similar
three.js scenes, not measured on this island (see "Measure first" in P0).

---

## 1. What the game already does (code facts, Oct 19 2026)

| Area | Where | Phones / tablets | Desktop today |
|---|---|---|---|
| Device split | `lib/graphics/quality.ts` `phoneGraphicsFor` / `dynamicResolutionEnabled` | `(pointer: coarse)` **or** DPR > 2 | fine pointer and DPR ≤ 2 |
| Pixel ratio | same | 1.75 still, 1.5 moving (`MotionResolution`), tiers cap to 1.5 / 1.25 | `min(dpr, 2)`, no motion drop |
| Sun shadow map | same + `heatTier.ts` TIERS | 1536² at tier 0, 1024² at tiers 1+ | 2048², fitted to the view (`islandShadows.ts` `createIslandShadowFit`) |
| Shadow filter | `components/Town.tsx` ~l.467 | `PCFSoftShadowMap` | same |
| MSAA | context `antialias` from `graphicsQuality()` (Town l.454, `lib/town/islandWarm.ts` l.52) | on (`PHONE_ANTIALIAS_OFF_AT_DPR2=false`) | on |
| Tone mapping / colour | Town l.467 | ACES Filmic, exposure 1.0, sRGB output | same |
| Frame cap | Town l.1117-1125, `heatTier.ts` | 30 fps, 20 fps idle (ride, float, standing 3 s), 24 at tier 4 | **uncapped** while moving, 20 fps idle caps still apply |
| Thermal governor | `ThermalGovernor` in `heatTier.ts`, `createIslandHeat({governed: quality.phone})` Town l.723 | governed (tiers 0-4) | **not governed**; only Battery saver (tier 4) or a test force |
| Water detail | `setWaterDetail(stillWater?0:quality.phone?1:2)` Town l.1491; `waterSurface.ts`, `shoreWater.ts`, `underwater.ts` | `uWaterDetail` 1: one ripple read, one caustic read, no sway, no glints | 2: two ripple layers, two-layer caustics, coral sway, sun glints |
| Sky / haze | `horizonHaze.ts`; `scene.background` is a flat `Color` shared with a linear `Fog` | same | same; camera fov 40, far 500 (Town l.476) |
| Lighting | `islandLighting.ts` presets day / sunset / night, hemisphere + one directional | same | same; no environment map (IBL) |
| Post-processing | none (three `examples/jsm/postprocessing` ships in `node_modules`, unused by the island) | none | none |
| Materials | 70 files use `MeshStandardMaterial`, 17 Lambert, 38 use vertex colours, **0 texture loads**; 32 `onBeforeCompile` patches in 25 files, 28 `ShaderMaterial` uses | shared | shared |
| Settings | `components/IslandSettings.tsx` "Battery" card (`setBatterySaver`), also `GrownUps.tsx` | localStorage `fi2-battery-saver` | same |
| Code splitting | Town reached through `components/root/Game.tsx` via `gameLoader.ts`; panels use `next/dynamic` | | |

So desktop already gets more (DPR 2, 2048² shadows, uncapped fps, water detail 2), but the *look* is the same scene graph, materials and
lighting. "Dramatically better" has to come from new rendering layers, not from bigger numbers on the existing ones: DPR is already at 2
and more than 2 is wasted pixels.

## 2. Architecture

### 2.1 One codebase, two profiles (not two builds)

```
lib/graphics/profile.ts          tiny, in the main bundle: detect + store + subscribe ('standard' | 'high')
lib/graphics/high/index.ts       loaded ONLY by `await import()` when the profile is 'high'
  ├─ composer.ts                 post stack (pmndrs `postprocessing`)
  ├─ sky.ts, water.ts, ao.ts, foliage.ts ...   each registers its own hooks
  └─ defines.ts                  `#define FI_HIGH` shader chunks injected through the existing onBeforeCompile patches
```

- Town asks `profile()` once at mount. On `'high'` it calls `import('@/lib/graphics/high')` and hands it `{renderer, scene, camera, sun,
  world}`; the module returns `{render(), resize(), dispose(), downgrade()}`. On `'standard'` the import never runs, webpack keeps the
  chunk (and the `postprocessing` dependency) out of every phone download. A test should assert this (section 4.2).
- `renderer.render(scene, camera)` at Town l.1584 becomes `high ? high.render() : renderer.render(scene, camera)`. That is the only edit
  inside the hot loop.
- High-only shader detail goes in as **`#define`s added by the High module**, not as new `uWaterDetail > 2.5` branches in the shared GLSL.
  Phones then compile exactly today's programs (same cache keys, same `islandWarm.ts` pre-warm), which is the cleanest "phones unchanged"
  guarantee. Desktop High pays one extra compile per patched program the first time (warm it in `islandWarm.ts` behind the same gate).
- Keep the WebGL context identical to today (`antialias` as `graphicsQuality()` chooses, `powerPreference:'default'`). The composer
  draws into its own multisampled target (`samples: 4`, WebGL2), so a fall back from High to Standard needs **no new context**, no
  re-creation of the warm renderer (`islandWarm.ts` l.90 disposes a renderer whose antialias differs) and no flash.

### 2.2 Why not two separate builds or sites

- **Maintenance:** every feature (rides, fishing, jobs, NPCs, quests) would need landing twice or a shared package; the island is one
  1,700-line Town plus ~120 graphics modules that change daily, often by several agents in parallel.
- **Saves:** the save already syncs across devices (save codes, Supabase). One site means one save format and no "desktop save won't open
  on the iPad" problem. The graphics choice is per *device* (localStorage), never written into the save.
- **Tests:** 211 node tests plus the Playwright device matrix (`playwright.config.ts`: iPhone SE/15, iPad gen7/Pro 11, Pixel 7,
  desktop-chromium 1280×800) run once. Two builds double the matrix and the deploy work.
- **Kids switch devices** (school Chromebook, home laptop, a parent's phone). One URL, one game, the device just looks nicer or plainer.

### 2.3 What must stay identical between profiles

Gameplay, physics, ball flight, collisions, swim / boat / ride water heights read on the CPU, NPC and car **counts that carry gameplay**
(townsfolk carry conversations: heat pass 5 noted hidden townsfolk lose them), quests, coins, cards, timers, saves, seeded/deterministic
layouts (e.g. `tests/fishing.cjs` determinism) and all UI. Rule: **High code may read the simulation, never write to it.** Any wave
displacement on High is visual-only, small, and never moves what the swimmer, boat or ball reads. No High feature may change what is drawn
per frame in a way that pops (the deploy-4 flashing lesson in `heatTier.ts`): fall back once, then stay down until reload.

### 2.4 Choosing the profile

Order of decision, evaluated before the island renderer is warmed (title screen, `islandWarm.ts`):

1. **Settings choice** wins: Settings > Graphics: `Auto` (default) / `Standard` / `High`. Stored per device (`fi2-graphics`).
   Battery saver ON forces Standard (and tier 4, as today).
2. **Never auto-High** when any is true: `(pointer: coarse)`, DPR > 2, `navigator.maxTouchPoints > 0` **and** a Mac UA (iPadOS reports
   "Macintosh"; an iPad with a Magic Keyboard trackpad can report a fine pointer and DPR 2, so it would otherwise pass the current
   desktop test; this gap exists today too), `hardwareConcurrency < 8`, `navigator.deviceMemory < 8` (Chrome/Edge only; absent elsewhere),
   reduced motion, or a known weak GPU string.
3. **GPU string** from `WEBGL_debug_renderer_info` (`UNMASKED_RENDERER_WEBGL`): allow-list for auto-High: NVIDIA GeForce GTX 10xx+/RTX,
   AMD Radeon RX / Pro, Apple M1 Pro/Max and any M2+ (Chrome reports "ANGLE (Apple, ANGLE Metal Renderer: Apple M2 ...)"); deny-list:
   Intel UHD / HD, Mali, Adreno, PowerVR, SwiftShader / llvmpipe (software), "Mesa Intel" (most Chromebooks). Safari answers "Apple GPU"
   and Firefox masks it, so for those the benchmark decides.
4. **Micro-benchmark** (about 1.5 s, invisible): the first seconds on the island on a High candidate run High at a 60 fps cap; if the
   median frame interval over 90 frames is > 18 ms (or p90 > 28 ms) it falls back to Standard and remembers `fi2-graphics-auto=standard`
   for that device for 14 days. A "High" that the user chose explicitly is also governed but shows a small one-time note
   ("Switched to Standard graphics to keep the game smooth") instead of silently forgetting the choice.
5. **Desktop governor for High only:** reuse `ThermalGovernor` logic with a 60 fps budget: sustained creep (≥ 1.3× baseline for 10 s) or
   severe (p90 ≥ 40 ms) → `high.downgrade()` (first drops AO / foliage density, second step goes to Standard). No automatic step back
   up in the same session (avoid visible flapping). Standard desktop stays ungoverned as today.

School Chromebooks and old laptops: these are *desktop* by today's test but will almost always land on Standard through steps 2-4. That is
the point of capability detection rather than "desktop = High".

## 3. Upgrade menu (ranked by wow per cost for a stylised kid island)

Target look: Wind Waker / Animal Crossing / Sea of Stars: saturated but soft, glowing sun and lamps, readable silhouettes, toy-diorama
depth. Cost columns: extra GPU ms per frame at 1440×900 DPR 2 (≈ 5.2 Mpx). "Integrated" = Intel Iris Xe / M1 class (the weakest machine
High should ever run on); "discrete" = GTX 1660 / M2 Pro class. Effort in agent-days (one build agent session, ≈ 150-300k tokens).

| # | Upgrade | three.js approach | GPU integrated / discrete | Effort | Risk | Wow |
|---|---|---|---|---|---|---|
| 1 | **Post "look" pass**: soft bloom (sun glints, lamps at night, coins, sparkles), colour grade per time of day (LUT), soft vignette, AgX or tuned ACES at the end, SMAA/MSAA kept | pmndrs `postprocessing` (merges effects into ONE fullscreen pass; three's `EffectComposer` chains passes and costs more) + `LUT3DEffect`, `BloomEffect` (mipmap, luminance threshold), `VignetteEffect`, `ToneMappingEffect`; render target `HalfFloatType`, `samples: 4` | 1.5-3 ms / < 0.7 ms | 2-3 | Medium: colour shift (tone mapping moves to the end; three applies fog after tone mapping today and `horizonHaze.ts` relies on fog colour = background colour, so the horizon must be re-matched) | **High** |
| 2 | **Painted sky dome + clouds** with sun disc and horizon gradient; fog colour taken from the sky's horizon; PMREM environment from the same sky for gentle reflections on balls, cars, windows | `ShaderMaterial` sphere (gradient + 2 noise cloud layers, slowly drifting), `PMREMGenerator.fromScene` once per time-of-day change (not per frame) | 0.3 ms / 0.1 ms | 2 | Low-medium: night/sunset presets in `islandLighting.ts` must be re-tuned together | **High** |
| 3 | **Ambient occlusion** (contact darkening under trees, roofs, characters, kerbs: the "toy diorama" look) | `N8AO` (npm `n8ao`, works with pmndrs) or pmndrs `SSAOEffect`, half resolution, uses the composer's depth, no extra scene pass | 2-4 ms / 0.5-1 ms | 1.5-2 | Medium: haloing on thin poles / zipline; tune radius in metres | **High** |
| 4 | **Water High**: depth-based colour and soft foam where water meets sand/rocks/piers, slight refraction wobble of the seabed, sky-dome reflection with Fresnel, bloom catching the existing glints | extends `waterSurface.ts` / `shoreWater.ts` via `#define FI_HIGH`; reads the composer's depth texture (needs the ocean drawn after opaques, as the clear-window path already does) | 1-2 ms / 0.3 ms | 3-4 | Medium-high: the water files are under active work by other agents; clear-window / swim-disc / fishing water each own the ocean in places | **High** |
| 5 | **Wind and near-camera grass**: trees and palms sway (vertex shader, per-instance phase), instanced grass tufts within ~25 m of the player on grass ground, flowers on lawns | `InstancedMesh` chunks rebuilt as the player moves (bounded count, e.g. 20k blades); sway via an `onBeforeCompile` vertex chunk on foliage materials | 1.5-3 ms / 0.5 ms (vertex-bound) | 3-4 | Medium: pitches must stay clean (no grass on the markings), clipping into balls/characters | **High** |
| 6 | Shadows: 4096² sun map, softer penumbra (PCF with larger kernel or PCSS-lite), optional 2-cascade (near crisp, far coarse) | `light.shadow.mapSize` 4096, `radius`/`blurSamples` with `VSMShadowMap` or a PCSS chunk; cascades = second directional light shadow (three `CSM` addon) but conflicts with `createIslandShadowFit` | 1-2 ms / 0.3 ms (+ CPU for cascades: second depth pass) | 2 (no cascades) / 4 (cascades) | Medium: shadow acne, `normalBias` tuning, static shadow cache (`staticShadowCache.ts`) | Medium |
| 7 | God rays / light shafts at sunset and through trees | pmndrs `GodRaysEffect` from the sun disc mesh (screen-space radial blur) | 1-1.5 ms / 0.3 ms | 1 | Low-medium: looks wrong when the sun is behind the camera; gate by angle | Medium-high (sunset only) |
| 8 | Draw distance + horizon: far plane 500 → 900 m, haze pushed out, other islands visible from the beach; a lower-detail far set (reuse the fishing backdrop builder) | `camera.far`, `hazeRange`, backdrop LOD from `fishingBackdrop.ts` | CPU: + draws; GPU 0.5-1 ms | 2-3 | Medium: more draw calls (desktop views already 150-500 draws) | Medium |
| 9 | Richer particles: spray and splashes, footstep dust on sand, leaves, butterflies, sparkles on coins | instanced point/billboard systems in the High module, all budgets bounded | 0.3-1 ms | 2 | Low | Medium |
| 10 | Weather and clouds overhead: passing cloud shadows on the ground, occasional light rain at the Summit | cloud-shadow noise term in the ground shader (define), rain as instanced streaks | 0.5-1 ms | 2-3 | Medium: must never affect gameplay or lessons; kids may dislike rain: user taste | Medium |
| 11 | Ink outlines (Wind Waker edge) | pmndrs edge detection on depth + normals, or inverted-hull on characters only | 1-2 ms / 0.4 ms | 2 | **High (art direction change)**: user must approve | High if wanted |
| 12 | Tilt-shift / subtle depth of field in menus, photo moments, card reveals only | pmndrs `TiltShiftEffect` / `DepthOfFieldEffect` | 1-2 ms | 1 | Medium: blur hurts readability for kids if always on | Low-medium |
| 13 | Crowd density: extra *non-interactive* background islanders on beaches/stands | instanced townsfolk without conversations (`npcShadowBatch.ts` batches exist) | CPU-heavy | 2-3 | High: must not change gameplay NPCs | Low-medium |
| 14 | High-res PBR textures / normal maps | new asset pipeline (the island has 0 textures today, all vertex colour) | memory + bytes | 8+ | High: changes the art style, `public/` is already 617 MB | Low per cost: **skip** |
| 15 | DPR above 2, or 120 fps uncapped | already DPR 2; 120 fps on a 120 Hz MacBook doubles fan/battery for little visible gain | large | 0 | Battery, fans | Low: **cap High at 60 fps** |
| 16 | WebGPU renderer | `three/webgpu` + TSL; all 32 `onBeforeCompile` patches and 28 `ShaderMaterial`s must be ported to TSL nodes | n/a | 15-25 | Very high | Indirect only |

Top 5 by wow per cost: **#1 post look pass, #2 sky dome + IBL, #3 ambient occlusion, #7 sunset god rays (cheap), #4 water High**
(#5 grass/wind is the biggest single "alive" upgrade but costs more). A High frame with #1-#5 lands around 6-12 ms extra on an
integrated GPU, which is why integrated laptops must be benchmarked and why the downgrade step drops AO and grass first.

Library choice: pmndrs `postprocessing` (MIT, actively maintained, works with plain three r169, no React) is the right base: one merged
effect pass, built-in SMAA, mipmap bloom, LUT, tone mapping, god rays, tilt-shift, and `n8ao` plugs into it. Expected size ~60-90 KB
gzipped in the High chunk only (verify with the build's chunk report). three's own `EffectComposer` (already in `node_modules`) is the
no-new-dependency fallback but chains a full-screen pass per effect.

## 4. Phases

### P0: profile, setting, governor, and the "look" pass (≈ 5 agent-days, ≈ 1.2-1.8M tokens)

Build (3 agents, split build → verify):
- **A. Profile plumbing (1.5 d, Sonnet):** `lib/graphics/profile.ts` (detection of 2.4, localStorage, subscribe, `window.__fi2.graphics.force()`
  test hook), Settings > Graphics `Auto / Standard / High` card next to Battery in `IslandSettings.tsx` (and `GrownUps.tsx`), Battery saver
  forces Standard, the desktop High governor, the dynamic `import()` seam in Town (render, resize, dispose), and the empty High module.
- **Measure first (0.5 d, inside A):** with the empty seam, record draws and GPU ms (`EXT_disjoint_timer_query_webgl2` on Chrome) at the
  ledger's 7 views on this Mac at 1440×900, so every later feature has a before number in `docs/performance-guide.md`.
- **B. Look pass (2-3 d, Opus, taste work):** composer with MSAA target, bloom, LUTs for day/sunset/night (lerped with `islandLighting`),
  vignette, end tone mapping, fog/horizon re-match; plus #2 sky dome (it is cheap and changes the look the most together with the grade).
- **C. Verify (0.5-1 d, Sonnet/Haiku low effort):** screenshots and tests below.

What it will look like: same island, but it glows. Sun sparkles on the sea and the white ripple lines bloom softly, lamps and windows
glow at night, the sunset turns warm gold with a graded sky and clouds instead of a flat colour, edges fade gently to a vignette, and
the far haze blends into a real sky gradient. Compare against `docs/water/clear-window-desktop.png`, `docs/water/swim-clear-desktop.png`
and `docs/seo/fish-1280.png` (desktop today) and `docs/water/clear-window-phone.png` / `swim-clear-phone.png` (must not change).

### P1: water and shadows (≈ 6-7 agent-days)

- #4 water High (3-4 d, Opus) **after the current water agents land** (clear window, swim disc, fishing water share the ocean).
- #3 ambient occlusion (1.5-2 d) and #6 softer 4096² shadows without cascades (2 d); #7 god rays (1 d).

What it will look like: shallow water you can read like a lagoon (sand fading to turquoise with soft foam edges, the seabed wobbling
through it), trees and houses sitting in soft contact shadow, crisp shadows under players, sunbeams at sunset. Compare with
`docs/water/clear-window-high.png` (jetpack view), `docs/water/clear-window-desktop.png` and `docs/fishing-visuals-ref.png`.

### P2: world density and life (≈ 8-10 agent-days)

- #5 wind + near grass + flowers (3-4 d), #8 draw distance with a far LOD set (2-3 d), #9 particles (2 d), optional #10 weather (2-3 d).

What it will look like: the island moves: palms and trees sway, grass tufts ripple around the player, leaves and butterflies drift,
the other islands are visible across the sea from the beach. Compare with `shots/mid-1024.png` and the lawn/plaza ledger views.

### P3 (optional, not recommended now): WebGPU

15-25 agent-days to port 32 shader patches and 28 shader materials to TSL, with a WebGL2 fallback still needed for Chromebooks and older
Safari. Gains (compute particles, cheaper many-light) do not show up in this art style. Revisit only if a P2 feature truly needs compute.

### 4.1 Risks

- **Visual regressions on Standard**: mitigated by the `#define` approach (phone shader sources unchanged) and a pixel-diff test.
- **Colour shift**: tone mapping moves into the composer and fog is applied after tone mapping today; every time of day and the horizon
  seam need re-tuning (sunset and night are the hard ones).
- **Weak "desktops"**: Chromebooks, Intel-iGPU laptops, Firefox/Safari (no GPU string). Detection + benchmark + governor; default Auto
  leans Standard when unsure.
- **Battery and fans on laptops**: High caps at 60 fps, keeps the existing 20 fps idle caps, respects Battery saver. No Battery Status API
  outside Chrome, so we cannot detect "unplugged" reliably; say so in the setting's hint.
- **Safari (Mac)**: WebGL2 is fine, but no GPU timer query and a masked GPU name: benchmark-only decision; check HalfFloat render targets
  and MSAA targets on Safari 17/18 explicitly.
- **iPad with keyboard / trackpad**: block auto-High with the `maxTouchPoints` + Mac UA guard; allow manual High on iPad Pro only if the
  user wants it (decision below), always governed.
- **Bundle size**: High chunk only; a test proves phones never request it. Desktop first entry pays ~60-90 KB + shader compiles (warm
  them on the title screen).
- **Test matrix doubles for desktop only** (Standard and High); phones keep one profile.
- **Concurrent agents**: water and shadow files change daily; P1 water must be sequenced after the current water work.

### 4.2 How we test

- `tests/graphics-profile.cjs` (node): detection table (UA, pointer, DPR, touch points, cores, memory, GPU strings incl. Chromebook,
  SwiftShader, Apple, iPad-as-Mac) → expected profile; Battery saver forces Standard; governor steps; no High import on Standard.
- **Phones unchanged:** Playwright iPhone SE / 15 / Pixel 7 / iPad projects: a network assertion that no `high` chunk is requested, and a
  pixel-diff of fixed views against a baseline captured before P0 (threshold ≈ 0).
- **Screenshots per profile:** desktop-chromium 1280×800 and a 1440×900 view at Standard and High, one shot per view (north beach, plaza,
  lawn pitch, Coral Cay, sunset, night, underwater), using the ledger's teleport method; plus one phone shot per feature (token rule).
- **Frame-time budget:** headless SwiftShader is not representative; run headed Chrome on the Mac's real GPU at 1440×900 for 10 s per view,
  record median / p90 frame interval, draws, triangles, GPU ms; budget: High ≤ 10 ms GPU at the 7 views on this Mac, and the forced
  "integrated" case (Chrome `--use-angle=swiftshader` or a throttled run) must trigger the fall back within 3 s.
- Update `docs/performance-guide.md` with every feature's measured cost, per AGENTS.md "Performance continuity".

### 4.3 What the user must decide

1. **Default for capable computers:** Auto (turns High on by itself where detection passes) or opt-in only (everyone starts on Standard).
2. **Setting wording:** "Graphics: Standard / High" (plus Auto), and whether it lives only in Settings or also in Grown-ups.
3. **Art direction latitude:** colour grade per time of day yes/no; ink outlines (#11) yes/no; weather/rain (#10) yes/no.
4. **Frame cap on High:** 60 fps (recommended) or uncapped like Standard desktop today.
5. **iPad Pro:** may a parent choose High manually (governed), or never on tablets?
6. **Which phases to fund** (P0 alone already changes the look the most per day of work) and whether High ships behind a dev flag first.
