# Island graphics plan: better terrain, water and swimming with no extra heat (Nov 17 2026, research and plan only)

Owner: "see where we can enhance the graphics for this game without increasing heat, especially for mobile ... terrain, water, and
different surfaces ... How can we make the swimming graphics look even better."

**Update, Nov 17 2026 (later the same day): Batch A "In the water" (S1, S2, S3) is built on branch `island-gfx`; see section 8 at the end. Everything else is still a plan.** When this was written nothing was built: the only code added was the measuring script `scripts/gfx-budget.cjs`. Cost figures for the
proposals are reasoned from the shaders and from three r169's source, not measured on a phone. Nothing here claims a thermal result
(AGENTS.md: no heat claim without a real iPhone).

**The short answer.** The island already uses most of what good-looking, cool-running mobile games use in 2025-2026: a baked
shore-distance field instead of a depth pre-pass (the same trick Unity's *Survival Kids* team describes), no post-processing, no
reflections, no image textures, merged static chunks, a 30 fps cap, a sleeping loop and a thermal governor. So the gains left are
not "add technique X". They are of three kinds:
1. **Swimming contact detail** that lives inside draws that already exist (the water line on the body, ripples and a wake drawn *in*
   the water instead of flat rings on top of it, spray from the strokes). Biggest visible change for the owner's question, close to free.
2. **Savings nobody has taken yet** that pay for everything else: the sun shadow filter reads the shadow map 16 times for every lit
   pixel; the ground and the ocean run full PBR lighting they do not visibly use; a few island-wide meshes are drawn in every view.
3. **Baked ground light and a detail tile** (soft contact shade round buildings and trees, grain that survives on a warm phone), paid
   for by (2).

---

## 1. Today's pipeline (code facts, branch `island-gfx` = origin/main 21153462)

| Area | What it is | Where |
|---|---|---|
| Renderer | `WebGLRenderer`, three 0.169, `powerPreference:'default'`, MSAA on (context `antialias`), `PCFSoftShadowMap`, sRGB output, **ACES Filmic**, exposure 1 (0.98 at night). No post-processing, no environment map. | `lib/town/islandWarm.ts:41-53`, `components/Town.tsx:630-645` |
| Pixel ratio | Phones (coarse pointer or DPR > 2): 1.75 still, 1.5 moving, 1.5 after 8 s rest; tiers cap 1.5 / 1.25. Desktop `min(dpr, 2)`. | `lib/graphics/quality.ts:9-31` |
| Heat tiers | 0 cool .. 4 Battery saver: 30 fps (24 at tier 4), pixel ratio caps, 1536² shadow map at tier 0 then 1024², static water at 3+. Governor reacts to a rising frame-time trend. Rule: no tier may change what is drawn per frame. | `lib/graphics/heatTier.ts:1-24`, `lib/graphics/islandHeat.ts` |
| Frame cap / sleep | 30 fps slot grid on phones, 20 fps idle, loop sleeps when nothing changes. | `lib/town/frameCap.ts`, `components/Town.tsx:1804-1816` |
| Camera | fov 40, far 500 m, fixed follow view about 42 m away and 32° down. Never goes under the water (`Town.tsx:2273`). | `components/Town.tsx:662`, `:2235-2273` |
| Sky / fog | Flat `scene.background` colour; linear fog of the same colour only reaches the picture from height. No sky dome. From the follow camera the sky is almost never on screen. | `lib/graphics/horizonHaze.ts:22-27` |
| Light | One hemisphere + one sun, three presets (day / sunset / night). Sun shadow box fitted to the view; static shadow cache on desktop only. | `lib/graphics/islandLighting.ts:3-14`, `lib/graphics/islandShadows.ts:88`, `components/Town.tsx:664`, `:684` |
| Terrain | No image textures. `MeshStandardMaterial` (roughness .85-1) with vertex colours, merged into 50 m chunks. Ground kinds (grass, sand, path, land, mixed, asphalt) get a shader patch: 3-sine world-space mottle, grass hue drift, sand darkening toward the water line by height, a hash grain and drifting cloud shade (**grain and clouds at tier 0 only**). | `lib/graphics/groundTint.ts:15-66`; users `lib/town/fields.ts:76-82`, `lib/town/westPark.ts:82`, `lib/town/stadiumWorld.ts:194-197`, `lib/town/coralCayWorld.ts:327`, `lib/town/summitIsleWorld.ts:110` |
| Ground detail | Three instanced decal draws per island (stones, tufts, flowers, ≤ 1200) plus macro features (dunes, driftwood, clumps). Static, no shadows. Pitches: mowing stripes in geometry. Buildings: baked wall-foot and underside light in vertex colours. | `lib/graphics/groundDecals.ts:5-18`, `lib/town/macroDetail.ts:4-11`, `lib/graphics/pitchStripes.ts:33-53` |
| Stadium | West region behind one frustum-box gate; crowd is ONE instanced Lambert draw (74k triangles); lily pond has its own see-through water with 4 analytic ripple rings. | `lib/town/world.ts:1861`, `lib/town/stadiumCrowd.ts:223-224`, `lib/graphics/pondWater.ts:6-19`, `lib/town/westPark.ts:147` |
| Ocean | ONE plane, two triangles, 2100 x 1700 m, `MeshStandardMaterial` + shader patch: one ripple-tile read on phones, one read of a whole-island signed shore-distance texture baked at load, depth colour ramp, swell trains, wind lanes, light net, sun glitter, night tint. Static estimate (tests/water-tropical-cost.cjs): about **790 ALU far, 1280 ALU near on a phone, 4 texture reads**. | `lib/town/world.ts:147-156`, `lib/graphics/waterSurface.ts:26-45`, `:114`, `:262-279`, `:314`, `lib/graphics/waterRipples.ts:3-9` |
| Shore | A 1 m grid strip along every coast: swash, foam lace (one 64² RGBA noise), wet sand sheen, caustic web; reacts to the player's ankles and the ball. | `lib/graphics/islandShore.ts:26-43`, `:332-339`, `lib/graphics/shoreFoamFx.ts:4-13` |
| Clear shallows | Tiers 0-1: the ocean alpha-blends over the shallows near the look point and shows one seabed sheet, instanced coral and sea grass; shut above 25 m camera height and at tier 2+. | `lib/town/water/clearWindow.ts:12-25`, `:51-52`, `lib/graphics/waterSurface.ts:214` |
| Swimming | State machine land / wade / swim / under / surface. While swimming the **whole ocean switches to blending** with a 9.5 m clearer disc round the swimmer; an opaque seabed quad with a shadow ellipse sits under the disc; the body below the water line is tinted blue-green with a two-sine caustic. Ripples are **6 separate ring meshes**, one per arm entry, a stretched pair for the fast-swim V. Splash-down: ring pool + 14 spray spheres. Camera FOV eases on a burst. | `lib/town/water/waterState.ts:1-10`, `lib/graphics/swimClear.ts:4-17`, `:33-39`, `lib/graphics/waterSurface.ts:199`, `lib/graphics/beanSkin.ts:648-663`, `lib/graphics/swimRipples.ts:1-12`, `lib/graphics/ballEffects.ts:30-51`, `components/Town.tsx:892`, `:1232` |
| Sea life | Sharks, mantas, whale shark, humpback, turtle: instanced, drawn "through the water" by one shared depth-squeeze patch; sharks circle a swimmer at 10 Hz logic. | `lib/graphics/seaVeil.ts:1-14`, `lib/town/water/sharks.ts:1-12` |
| Ride splash | One instanced draw of droplet / ring quads when a ride crosses the swash; hidden otherwise. | `lib/graphics/rideSplash.ts:4-16` |

**three 0.169: what is and is not there.**
- There: `WebGLRenderer` with `ACESFilmic`, `AgX`, `Neutral` (Khronos PBR Neutral) and `CustomToneMapping`; `InstancedMesh`,
  `BatchedMesh`; `renderer.compileAsync`. `build/three.webgpu.js` and the TSL node system ship in the package.
- Not usable here: `WebGPURenderer` does not run `onBeforeCompile` patches or `ShaderMaterial` (the island has about 32 patches and
  28 shader materials, Oct 19 count), and at r169 it is still experimental. `lib/graphics/staticShadowCache.ts` depends on the r169
  `WebGLRenderer` framebuffer layout. The soft shadow filter is done in the fragment shader (16 compares), not by the hardware.
- KTX2 / Basis, mip bias, texture atlasing: **not relevant**. The island loads no image textures; its 26-68 live textures are small
  canvas and data textures.

---

## 2. Baseline budget (`scripts/gfx-budget.cjs`, unchanged branch, Nov 17 2026)

`node scripts/gfx-budget.cjs` against a dev server on port 9023. Headless system Chrome, 390x844 touch, DPR 1, staff device flag
(no analytics), daytime, forced heat tier, seeded `Math.random`. Four teleports; 40 island frames each; medians.
**SwiftShader (software GL): draw calls, triangles, programs, textures and geometries are exact; "render ms" is CPU submit time on
this Mac and says nothing about GPU cost or heat.** Triangles include the shadow pass. Two runs at tier 0 agreed to within 1 draw
call at town, 4 at swim, 0 at stadium.

Tier 0 (cool phone):

| view | draw calls (min-max) | triangles | programs | textures | geometries | render ms (CPU) | ocean blended |
|---|---|---|---|---|---|---|---|
| town (Island Square spawn, 103, -20) | 155 (155-156) | 175,660 | 42 | 26 | 1140 | 1.5 | no |
| shore (Palm Coast Beach water line) | 105 (84-112) | 181,716 | 63 | 63 | 1231 | 1.4 | yes |
| swim (23 m off that beach, phase `swim`) | 102 (98-103) | 181,436 | 68 | 64 | 1239 | 1.3 | yes |
| stadium (Stadium Plaza arrival, facing the gate) | 77 (76-81) | 202,128 | 78 | 68 | 1254 | 1.1 | no |

Tier 2 (hot phone, `GFX_TIER=2`):

| view | draw calls (min-max) | triangles | programs | textures | geometries | ocean blended |
|---|---|---|---|---|---|---|
| town | 151 (150-152) | 167,078 | 42 | 26 | 1140 | no |
| shore | 95 (74-103) | 152,132 | 60 | 62 | 1223 | no |
| swim | 94 (92-95) | 148,242 | 67 | 63 | 1232 | yes |
| stadium | 70 (68-72) | 148,058 | 76 | 67 | 1246 | no |

Programs, textures and geometries are cumulative over the run (the views are visited in this order), so compare the same row
before and after, never one row against another. Options: `GFX_TIER`, `GFX_TIME=day|sunset|night`, `GFX_FRAMES`,
`GFX_SHOTS=<dir>` (a PNG per view), `GFX_JSON=<file>`.

What the script cannot see: per-pixel shader cost and overdraw, which is where a phone's heat comes from. For those use the static
estimate in `tests/water-tropical-cost.cjs` (extend it to the ground and shadow chunks, batch B) and a real iPhone.

**Where the triangles go (one-off scene walk, approximate, not part of the script):** in town about half are townsfolk beans (limbs
33k, hair 26k, bodies 21k, hats 14k); at the stadium plaza the crowd is 74k in one draw although the bowl is mostly out of view;
`fishing-posts` (11.5k), `fishing-floats` (5.3k, `frustumCulled=false`, `lib/town/fishing/fishingWorld.ts:215`), `farm-decor-blob`
(5.2k), manhole covers and rims (5.1k) and the stone decals of the *other* islands (4.8k) showed up in all three views walked. To
be confirmed by hiding each and re-running the script.

---

## 3. Ranked changes

Marks: **ZERO-HEAT** (inside existing draws, no new texture read, a handful of shader instructions on few pixels),
**NEGATIVE-HEAT** (removes work), **NEEDS-BUDGET** (adds per-pixel work; the paying saving is named).
"ALU" = arithmetic instructions per fragment as the repo's estimator counts them.

### 3.1 Swimming

**S1. Ripples and a wake drawn in the water, not on it. NEGATIVE-HEAT (draws), near ZERO per pixel.** Rank 1.
- Player sees: each arm entry sends a ring that bends the light net and glitter and has a bright crest and a dark trough, instead
  of a flat pale ring lying on the surface; a moving swimmer drags a short foam V whose arms open with speed and a churned patch
  behind the feet; rings from sharks circling and NPC swimmers look the same.
- Technique: analytic rings, as the lily pond (`pondWater.ts` `uPondRip`) and the shore foam (`shoreFoamFx.ts`, 4-slot ring buffer)
  already do. A swimmer is one point, so a render-target ripple simulation (the usual "interactive water" answer) buys nothing here
  and would add a pass.
- Files: `lib/graphics/waterSurface.ts` (a `swimFx` block next to `SWIM_CLEAR_GLSL`: 6 x vec4 ring uniforms + one vec4 wake =
  position, heading, speed; evaluated only inside the swim disc radius, behind a `uSwimFxOn` uniform branch),
  `lib/graphics/swimRipples.ts` (sink writes uniforms), `lib/graphics/ballEffects.ts:30-31,48-49,88` (the 6 ring meshes and
  materials go), `components/Town.tsx:1232`.
- Cost: minus up to 6 blended draws and 6 materials while swimming; plus roughly 6 x 10 ALU for ocean pixels within about 10 m of
  the swimmer only (0 elsewhere: uniform branch). No texture read, no vertex.
- Tiers: 0-1 six rings + wake; tier 2 two rings, no wake (today's "lite" mode); tier 3+ and reduced motion one static soft ring.
- Risk: low. The ring look changes from "drawn line" to "water"; owner sign-off on a screenshot. `tests/water-tropical-cost.cjs`
  allowance must hold with the block off and be re-pinned with it on.
- Verify: `gfx-budget` swim row: draw calls ≤ 102 at rest and lower mid-stroke; cost test; `tests/swim-clear`, `water-swim`,
  `heat-water`.

**S2. A water line on the body, and legs that wobble under it. ZERO-HEAT.** Rank 2.
- Player sees: a thin bright foam line with a small lapping motion exactly where the body, arms and head cut the surface (today
  the tint just starts); below it the legs shimmer a few millimetres side to side as if seen through moving water; the caustic
  light on the legs matches the sea's net instead of a separate two-sine pattern.
- Files: `lib/graphics/beanSkin.ts:648-663` (`BEAN_UNDER`: a `smoothstep` band at `uh` = 0 ± 1.5 cm lifted by one
  `sin(x*k+t)`; reuse `cs`), `:642-647` (`BEAN_WORLD_VERTEX`: an x/z offset of `sin(y*9+t*3)*.012*beanUnder` below the line).
- Cost: about 8 ALU on the swimmer's pixels only (a few hundred pixels), inside the existing `beanUnder > 0` branch; 3 vertex ops.
  No draw, no texture.
- Tiers: wobble off with reduced motion and when the water is still (tier 3+); the line stays (static).
- Risk: low. Hair and hat use the same patch: check a head half under during the splash-down.
- Verify: close screenshots of tread, crawl, fast, duck-dive; `tests/swim-clear`.

**S3. Spray from the strokes and the kick. ZERO-HEAT.** Rank 7 (with W3).
- Player sees: a few droplets thrown forward as each hand enters, a low white churn at the feet on Swim fast, a short drip trail
  for 2 s after walking out of the sea.
- Files: `lib/graphics/rideSplash.ts` (accept a "swimmer" source: same pool, same cap), `components/Town.tsx` (feed the stroke
  event `events.stroke`, `lib/town/water/waterState.ts:242`).
- Cost: none new. The pool is one instanced draw that is hidden when empty; a rider in the swash and a swimmer never coexist, so
  the cap is shared, not raised.
- Tiers: as the ride splash today (half at tier 2, off at 3+ and Battery saver, ring only for reduced motion).
- Risk: low. Keep droplets under about 10 per stroke so it stays calm (owner's "peaceful" water brief, Oct 26).

**S4. Swim without blending the whole sea. NEGATIVE-HEAT, needs an iPhone A/B.** Rank 9.
- Today every ocean pixel on screen is blended while swimming (`SWIM_CLEAR.deepAlpha` .86). On tile-based deferred GPUs (every
  iPhone) blending switches off hidden-surface removal for those pixels. The fix is already designed in
  `docs/performance-guide.md` ("Opaque ocean + blended disc (rec. b)": an 8-triangle opaque frame plus a 2-triangle blended hole).
- Player sees: nothing if the thinning outside the disc is dropped (the open sea is opaque blue again, as on land).
- Risk: medium (three holders share the blend state). Only worth doing with a phone measurement; listed so the budget is known.

### 3.2 Water

**W1. Cheaper light for the ocean and the shore strip. NEGATIVE-HEAT.** Rank 5 (as part of the pay-down).
- The ocean is a `MeshStandardMaterial` (`SEA_WATER_LOOK`, roughness .52, metalness .02, `waterSurface.ts:78`): every ocean pixel
  runs three's full PBR light loop, then the patch adds its own glints, sheen and glitter. For a phone-sized stylised sea, reference
  shaders sit near 140 instructions; ours is 790-1280. Move the base to Lambert plus the patch's own sun term (keep the look, drop
  GGX and the environment BRDF).
- Player sees: nothing, if matched. The broad soft sun highlight must be rebuilt as one `pow` term.
- Files: `lib/town/world.ts:148`, `lib/graphics/waterSurface.ts:314+`, `lib/graphics/pondWater.ts:40`, `lib/graphics/swimClear.ts`
  (the seabed quad shares the material), `tests/water-tropical-cost.cjs` (new lower baseline).
- Cost: estimated minus 100-200 ALU on every ocean pixel (to be confirmed by the estimator); programs unchanged in number.
- Risk: medium: three dated looks (Oct 26 tropical, Nov 10, Nov 11 sea state) were tuned on the Standard highlight. Side-by-side
  shots at day / sunset / night, shore, open sea and flight.

**W2. Foam collars where things stand in the water. NEEDS-BUDGET (+1 draw), paid by S1 (-6 draws).** Rank 7.
- Player sees: pier and jetty posts, mooring poles, rocks, boat hulls, buoys and the causeway piers get a small lapping foam ring,
  so they sit *in* the sea instead of ending at a clean line. This is the most common "contact" cue in stylised water, normally
  done with a depth texture; here the spots are known at build time, so no depth read is needed.
- Files: new `lib/graphics/waterCollars.ts` (ONE `InstancedMesh` of 2-triangle quads, ring drawn in the fragment like
  `rideSplash.ts`, phase off `uWaterTime`), sites collected in `lib/town/world.ts` / `eastPierWorld.ts` / `coralCayWorld.ts` where
  the posts are placed.
- Cost: +1 draw while a coast is in view, ≤ 150 instances, small blended quads (0.5-2 m), no texture.
- Tiers: static (no lapping) at 3+; the mesh is frustum culled per 50 m chunk group.
- Risk: low-medium: boats that bob need the collar on the hull's water line; start with fixed posts and rocks.

**W3. Not recommended (and why).**
- *Vertex waves (Gerstner / sum of sines).* The ocean is two triangles and gameplay reads a flat water line. A camera-following
  grid costs little, but from a camera 32° above the water displacement barely reads; what reads is shading, which the swell bands
  and light net already fake per pixel. The swimmer, boats and animals already bob. Skip.
- *Planar or screen-space reflection, refraction of the scene.* A second scene render or a full-screen copy. Never on phones.
- *Fresnel sky tint.* The view angle is nearly constant, so fresnel is nearly a constant; the pond and strip already carry a sheen.
- *Ripple simulation in a render target.* An extra pass every frame for something S1 does with 7 uniforms.
- *A second caustic texture projected on the seabed.* The clear window already has one caustic read on phones.

### 3.3 Terrain and surfaces

**T1. A lighter soft-shadow filter. NEGATIVE-HEAT. The main budget source.** Rank 3.
- Fact: with `PCFSoftShadowMap`, three r169 compares the shadow map 16 times (plus bilinear mixes) for every pixel of every
  shadow-receiving material: all ground, buildings, characters. The Nov 10 note rejected `PCFShadowMap` (17 taps, no saving) and
  `BasicShadowMap` (1 tap, hard edges). A custom kernel in between was not tried.
- Proposal: replace the soft block of `ShaderChunk.shadowmap_pars_fragment` once, before the first compile, with one bilinear
  lookup (4 reads) or a 5-tap cross. On a 1536² map fitted to the view the edge stays soft at the phone's pixel size.
- Player sees: nothing intended. Shadow edges become very slightly less feathered.
- Files: `lib/town/islandWarm.ts:41` (`configureIslandRenderer`), a small `lib/graphics/shadowKernel.ts`, `tests/heat-tiers.cjs`.
- Cost: 16 → 4 or 5 texture reads per lit pixel. Zero draws, zero programs.
- Tiers: same kernel at every tier (a tier switch would recompile every lit program; the Nov 10 note explains why that is a hitch).
- Risk: medium. `ShaderChunk` is global: the shop, arcade room and preview renderers on the same page compile from it, so either
  apply it only while the island owns the page or accept it everywhere. Thin casters (goal nets, poles, zipline) and the moving
  shadow box can shimmer more with fewer taps: needs a walking video on an iPhone, not a still.
- Verify: A/B dev flag; zoomed crops of a goal net, a palm, the player; the shadow-pass tests (`static-shadow-batches`).

**T2. Ground without PBR. NEGATIVE-HEAT.** Rank 5.
- Ground kinds are roughness .94-1 non-metals; the GGX highlight contributes almost nothing visible, yet ground is the largest
  share of land pixels. Swap only the ground-tint materials (not buildings: that was the held `lambertScenery` lever, a visible
  change) to `MeshLambertMaterial` with the same patch.
- Files: `lib/graphics/groundTint.ts:51` (accept Lambert), `lib/town/fields.ts:76-82`, `summitIsleWorld.ts:110`,
  `stadiumWorld.ts:197`, `tintGroundMesh` callers.
- Cost: fewer ALU on every ground pixel (estimate to be produced by extending the cost test to `ground-tint-*` programs).
- Risk: low-medium: sunset grazing light on sand may lose a faint sheen; compare at sunset on a beach.

**T3. Baked ground light: soft contact shade round buildings, walls, trees and kerbs. NEEDS-BUDGET (1 texture read on ground
pixels), paid by T1 (11-12 reads saved on the same pixels).** Rank 4.
- Player sees: lawns and plazas darken softly toward walls, under trees and palms, along kerbs and stands; worn lighter earth along
  the desire lines of paths. The "toy diorama" depth the Oct 19 desktop plan wanted from screen-space AO, without a pass.
- Technique: the ground is a few huge flat polygons, so vertex colours cannot carry it. Bake ONE island light texture at load
  (512², R = contact shade from building, wall and trunk footprints blurred 1-3 m, G = wear, B = slow colour drift), the same way
  `islandShore.ts:339` bakes the shore field, and read it once in the ground patch by world x/z.
- Files: new `lib/graphics/groundLight.ts` (bake from `obstacles`, building footprints, tree colliders: data that
  `lib/town/openSpaces.ts` already scans), `lib/graphics/groundTint.ts` (one read, one multiply), `lib/town/islandWarm.ts` (bake in
  the warm slices so the first frame is not longer).
- Cost: +1 read and about 4 ALU per ground pixel; about 1.4 MB of GPU memory with mips; one bake at load (target under 30 ms,
  sliced). No draw.
- Tiers: on at every tier (it is static; switching it would change the picture, which the tier rule forbids).
- Risk: medium. 2 m texels blur thin features: aim it at buildings and trees, not at fences. The real sun shadow already darkens
  one side; keep the bake at ≤ 18 % so the two do not stack into black. Coral Cay and Summit Isle need their own box or a second
  small texture.
- Verify: `gfx-budget` textures +1 (or +3) and draw calls unchanged; before/after plaza and lawn shots.

**T4. A detail tile instead of the hash grain. ZERO-HEAT at tier 0, NEEDS-BUDGET at tiers 1-2 (paid by T1/T2).** Rank 6.
- Today the fine grain is one hash per 0.29 m cell: it cannot be mip-filtered, so it is switched off from tier 1 and a warm phone
  shows flat lawns and sand. Replace the hash and the per-pixel cloud maths with ONE read of a tileable 64² RGBA tile built like
  `laceNoise()` (`islandShore.ts:26-32`): R grass clumps, G sand ripples, B speckle and gravel, A broad cloud shade.
- Player sees: grass that reads as tufted, sand with faint wind ripples, speckled paths; the same on a warm phone as on a cool one;
  no shimmer while moving (mips).
- Files: `lib/graphics/groundTint.ts:49-66`, `GROUND_GRAIN_OFF_TIER` (`:31`).
- Cost: tier 0: 1 read replaces about 16 ALU and 3 `sin`; tiers 1-2: +1 read where there was nothing. 16 KB texture. No hex or
  stochastic tiling (3 reads per pixel) and no triplanar (the ground is flat; Summit cliffs keep vertex colours).
- Risk: low. Tiling must not show from the jetpack: fade the tile out with pixel footprint as the strip does (`islandShore.ts:42`).

**T5. Surfaces that say what they are: planks, slabs, kerbs. ZERO-HEAT on those pixels after T2.** Rank 8.
- Player sees: pier and jetty decks show board gaps and per-board tone; stadium concourse and plaza show slab joints; path edges
  get a darker kerb line; wet planks near the water darken like the sand does.
- Technique: world-space `fract` lines and a per-board hash (about 10 ALU), selected by ground kind (`plank`, `slab` added to
  `GroundKind`). Pieces merged into the shared paint batch (`lib/town/world.ts:1681`) need a per-vertex marker, as
  `islandWind.ts` marks swaying vertices.
- Files: `lib/graphics/groundTint.ts`, `lib/town/eastPierWorld.ts`, `stadiumWorld.ts:194-195`, `westPark.ts:82`, `world.ts:1681`.
- Cost: about 10 ALU on deck and slab pixels; possibly +1 program per new kind (warm it in `islandWarm.ts`).
- Risk: low-medium: thin lines alias at distance: fade by pixel footprint; never on pitches or courts.

**T6. Colour: a tone curve that keeps the palette. ZERO-HEAT, owner decision.** Rank 6 (tie; cheap to try).
- ACES Filmic pulls bright saturated colours toward white and shifts hues (the Oct 26 note "the golden sunset light greens anything
  cyan" is this). three 0.169 ships Khronos PBR Neutral, built to keep authored colours, and `CustomToneMapping`, which lets one
  function in the output chunk be the game's own curve: Neutral plus a per-time-of-day lift, contrast and saturation from three
  uniforms. That is a "grading LUT" with no pass and no texture, at the same or lower cost than ACES.
- Player sees: truer kit, grass and water colours, a warmer sunset, a deeper night; or, if the owner prefers today's softness,
  nothing (keep ACES).
- Files: `lib/town/islandWarm.ts:42`, `components/Town.tsx:645`, `lib/graphics/islandLighting.ts` (presets carry the grade).
- Risk: **high for taste, zero for heat.** Every colour was tuned under ACES; expect a retune of exposure and a few palettes.
  Decide from a 6-shot A/B sheet before any other colour work. Shop snapshots share the presets (`StorePreviews.tsx`).

**T7. Stop drawing what is not there. NEGATIVE-HEAT (vertex work).** Rank 10.
- Stadium crowd: 74k triangles whenever the west gate box is in view; give it a per-stand frustum test or a 2-triangle-per-fan
  far shape outside the bowl. Island-wide instanced meshes with one giant bound or `frustumCulled=false` (fishing floats and
  posts, farm blobs, manholes, other islands' decals): split per region or per 50 m chunk.
- Player sees: nothing. Vertex work is a small part of phone heat next to pixels, so this is hygiene, but it is free triangles
  (possibly 30-70k of 175-200k per frame) and shows directly in `gfx-budget`.
- Risk: low. Confirm each with the script before and after.

**Looked at and rejected for phones:** grass shells or dense instanced blades (layers of overdraw or tens of thousands of
vertices; the existing ≤ 1200 tufts and macro clumps are the right scale), a sky dome (the follow camera almost never shows sky),
`mediump` fragment precision (world coordinates reach ±800 m: the mottle and waves would break), any post-processing pass (bloom,
SSAO, LUT pass, FXAA), image textures with KTX2 (a new asset pipeline for a look the game does not have), matcaps (the scene is
lit by a moving time of day).

---

## 4. Build batches (one agent each, about a day; in this order)

**Batch A: "In the water" (S1, S2, S3).** Highest visible payoff for the owner's swimming question, lowest risk, removes draws.
- Done means: ring meshes gone from `ballEffects.ts`; rings and wake come from ocean uniforms; water line and leg wobble on the
  body; stroke droplets through the ride-splash pool; reduced motion and tiers 2 / 3+ behave as listed; `gfx-budget` swim row at
  tiers 0 and 2 has draw calls ≤ baseline (102 / 94), programs and textures not higher; `tests/water-tropical-cost.cjs` passes with
  its allowance re-pinned and explained; `swim-clear`, `water-swim`, `heat-water`, `swim-natural-oct27` pass; performance guide
  entry written. Not done: any thermal claim.
- Shots: swim (phone 390x844 + desktop 1280x800), before and after, mid-stroke; one Swim-fast frame for the wake.

**Batch B: "Pay-down and colour" (T1, T2, W1, T6 as an A/B sheet, T7).** Creates the budget; each item behind a dev flag
(`window.__fiGfx`, like `__fiHeatOptions`) until the owner picks.
- Done means: the cost test covers `ground-tint-*` and the shadow chunk and prints before / after reads and ALU; shadow kernel,
  ground Lambert and ocean Lambert each switchable for A/B; tone-curve sheet (ACES vs Neutral vs graded Neutral, day / sunset /
  night) delivered for the owner; crowd and island-wide meshes culled with `gfx-budget` triangles lower in the affected rows and
  draw calls not higher; nothing switched on by default without the owner's choice; an iPhone checklist written (walking video
  for shadow shimmer, 10 minutes at the beach for temperature).
- Shots: town and stadium (phone + desktop) before and after with all savings on; the 6-shot tone sheet.

**Batch C: "Ground and surfaces" (T3, T4, T5, W2).** Spends part of what B saved.
- Done means: island light texture baked in the warm slices (bake time reported), detail tile live at tiers 0-2, plank / slab
  kinds on the piers and the stadium concourse, foam collars on fixed posts and rocks; `gfx-budget`: draw calls ≤ baseline + 1
  (the collars) at shore, unchanged elsewhere, textures + 2 to 4; the extended cost test shows ground reads per pixel after B and
  C together **at or below today's** (16 shadow reads → 4-5, + 2 ground reads); tests `quality-pass`, `heat-*`, `water-*` pass.
- Shots: town (plaza lawn against a building) and shore (pier posts), phone + desktop, before and after.

S4 (swim without blending the sea) is deliberately outside the batches until there is a phone to measure on.

---

## 5. Tech stack recommendation

**Stay on three 0.169 `WebGLRenderer`. Do not move the island to `WebGPURenderer` / TSL now, and add no rendering library.**
- *It would not cool the phone.* The island's cost is pixels (fill, blending, per-pixel light and shadow reads). WebGPU lowers CPU
  draw overhead and adds compute; neither is the bottleneck at 77-155 draws. The same fragment work costs the same heat.
- *Reach.* WebGPU is on by default in Safari only from iOS / iPadOS 26 (Sept 2025). Every older iPhone and many Android phones
  would run `WebGPURenderer`'s WebGL2 fallback, a younger code path than the `WebGLRenderer` the game is tuned on.
- *Cost.* Every `onBeforeCompile` patch and `ShaderMaterial` (about 60) must be rewritten in TSL: the Oct 19 plan estimated 15-25
  agent-days, with a regression risk in every water, bean and ground look, for no visible gain. The static shadow cache and the
  warm-compile path depend on r169 `WebGLRenderer` internals. The node system adds bundle weight to a page that already has a
  ~790 ms setup task.
- *Maturity.* Forum reports of `WebGPURenderer` being 2-4x slower than `WebGLRenderer` on many-mesh scenes (r173, Feb 2025) were
  still being discussed for r183 in May 2026.
- *Libraries.* pmndrs `postprocessing` and N8AO mean a full-screen pass: desktop "High" profile only, as the Oct 19 plan says.
  `three-hex-tiling` is 3 reads per map. three's `Water` / `Reflector` render the scene twice. None belong on the phone path.
- *Revisit when* analytics show nearly all players on WebGPU-capable browsers **and** a feature needs compute (thousands of
  simulated particles, GPU-driven crowds). Then prototype one isolated room (the reef dive room is the natural candidate: its own
  scene, loaded on demand) rather than the island.
- *Do not bump three for its own sake.* Pin 0.169 until a specific fix is needed; `staticShadowCache.ts` says why.

---

## 6. Could not find out

- Real GPU cost and temperature of anything here: no phone in this job. Every "saves" above is instruction and read counts.
- The actual ALU saved by T1, T2 and W1: the repo's estimator covers only the water programs today; extending it is the first
  step of batch B.
- Whether a 4-5 tap shadow kernel shimmers on thin casters while walking: needs a video on a device.
- Whether the island-wide instanced meshes are really submitted in every view (my scene walk approximates three's culling and
  ignores the view gate); the script will settle it.
- Independent iOS benchmarks of `WebGPURenderer` against `WebGLRenderer`: none found, only vendor-style claims.
- Night and sunset baselines were not run (`GFX_TIME` supports them).

---

## 7. Sources

- WebKit, "WebKit features in Safari 26.0" (WebGPU shipping on macOS, iOS, iPadOS, visionOS): https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- web.dev, "WebGPU is now supported in major browsers": https://web.dev/blog/webgpu-supported-major-browsers
- three.js manual, WebGPURenderer (ShaderMaterial and onBeforeCompile not supported; WebGL2 fallback): https://threejs.org/manual/en/webgpurenderer
- three.js forum, "Why WebGPURenderer performance significantly lower than WebGLRenderer?": https://discourse.threejs.org/t/why-webgpurenderer-performance-significantly-lower-than-webglrenderer/77629
- three.js forum, onBeforeCompile under WebGPU: https://discourse.threejs.org/t/how-to-make-the-onbeforecompile-of-the-previous-webgl-version-compatible-in-the-webgpu-version-of-three-js/79895
- Imagination (PowerVR), "Do not use alpha blend unnecessarily": https://docs.imgtec.com/starter-guides/powervr-architecture/html/topics/rules/do-not-use-alpha-blend-unnecessarily.html
- Imagination (PowerVR), "Do not use discard": https://docs.imgtec.com/starter-guides/powervr-architecture/html/topics/rules/do-not-use-discard.html
- Arm, "Console quality game rendering on mobile" (transparency order, overdraw): https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/console-quality-game-rendering-on-mobile
- Khronos Vulkan guide, tile-based rendering best practices: https://docs.vulkan.org/guide/latest/tile_based_rendering_best_practices.html
- Unity, "Graphics and rendering tips from Survival Kids" (baked coastline distance field drives waves, foam, wake and caustics; a depth-based coast did not work): https://unity.com/blog/graphics-and-rendering-tips-from-survival-kids
- Azur Games, "Realistic water in midcore games: balancing FPS and visual appeal" (mobile water budgets): https://azurgames.com/blog/realistic-water-in-midcore-games-balancing-fps-and-visual-appeal
- Unreal forum, stylised water shader tutorial (about 140 instructions on a Snapdragon 855): https://forums.unrealengine.com/t/tutorial-how-we-built-a-stylized-water-shader-in-unreal-engine-5-no-plugins-needed/2622477
- three.js forum, "What's the most performant way to make grass?": https://discourse.threejs.org/t/whats-the-most-performant-way-to-make-grass/39774
- Codrops, "How to make the fluffiest grass with three.js": https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/
- keaukraine, "Efficient WebGL vegetation rendering" (vertex shaders as the bottleneck on low-end Android): https://keaukraine.medium.com/efficient-webgl-vegetation-rendering-b09a7fa904cc
- three-hex-tiling (up to 3 fetches per map per fragment): https://www.npmjs.com/package/three-hex-tiling
- Unity, "Procedural stochastic texturing" (3 samples per fragment plus a lookup): https://unity.com/blog/engine-platform/procedural-stochastic-texturing-in-unity
- In-repo: `docs/performance-guide.md`, `docs/desktop-graphics-plan-2026-10-19.md`, `docs/TROPICAL_WATER_OCT26.md`, `docs/water-look-research.md`, `docs/swimming-research.md`; three r169 source `node_modules/three/src/renderers/shaders/ShaderChunk/shadowmap_pars_fragment.glsl.js`, `src/constants.js:58-60`.

---

## 8. Batch A built (Nov 17 2026, branch `island-gfx`, local, not deployed, no phone test)

Built: S1 (rings + V wake in the ocean shader, ring meshes gone), S2 (water line + leg wobble on the swimmer), S3 (stroke, kick and
entry spray through the ride-splash pool). Details, tiers and the cost statement: `docs/performance-guide.md`, "Nov 17 2026:
swimming graphics, batch A". Screenshots: `swim-before-phone.png`, `swim-after-phone.png`, `swim-after-night-phone.png`,
`swim-after-desktop.png`.

Differences from the plan above
- Rings: 5 pooled + 1 "contact collar" (a small foam ring that stays at the swimmer's hips) instead of 6 pooled. The collar was
  added because from the follow camera the body's own water line is only a few pixels (the torso rides above the water; only
  the legs cut the surface), so the contact had to read on the water side too.
- The fx block is gated by a bounds circle round whatever is live, not by the swim disc radius, because the swimming islanders'
  rings are not at the player.
- Programs in the swim view are +1, not equal: the existing ride-splash program compiles the first time a swimmer sprays.
- The opaque-program estimate is +1 ALU on every path (the gate), not +0. The pay-back is in the blended program (one disc mask
  instead of two), which the estimator does not count.
- The Stadium Park pond's rings moved to the ride-splash pool (they used the removed meshes); the pond diver's water line now
  uses the pond's level.
- Not built from S3: the 2 s drip trail after walking out of the sea.

`gfx-budget`, before and after, same machine, same day. Draw calls (min-max) / triangles / programs / textures.

**Camera at rest (`GFX_SETTLE=14000`, an option added to the script in this batch).** The section 2 baseline waits 4 s after each
teleport, but the follow camera needs about 10 s to arrive after a long teleport, so those rows measure a camera still in flight
and small timing changes move what is in view. With the camera at rest the before and after views are the same picture:

| view | tier 0 before | tier 0 after | tier 2 before | tier 2 after |
|---|---|---|---|---|
| town | 162 (153-162) / 176,780 / 42 / 26 | 162 (153-162) / 176,780 / 42 / 26 | 149 (149-158) / 162,126 / 42 / 26 | 158 (149-158) / 168,198 / 42 / 26 |
| shore | 113 (102-113) / 186,944 / 63 / 63 | 108 (102-109) / 186,622 / 63 / 63 | 103 (99-103) / 157,442 / 60 / 62 | 99 (99-99) / 157,122 / 60 / 62 |
| swim | 110 (104-112) / 189,024 / 67 / 64 | 100 (98-102) / 182,232 / 68 / 64 | 100 (96-100) / 154,714 / 64 / 63 | 94 (94-94) / 154,234 / 65 / 63 |
| stadium | 78 (76-80) / 202,382 / 77 / 68 | 78 (76-80) / 202,382 / 78 / 68 | 70 (68-72) / 148,058 / 73 / 67 | 70 (68-72) / 148,302 / 74 / 67 |

Reading it: swim is 10 draw calls lower at tier 0 and 6 lower at tier 2, shore 4-5 lower (the swimming islander's rings were
meshes too); triangles lower in both; textures equal. Programs are +1 from the swim view on (cumulative): the ride-splash program,
see above. Town and stadium at tier 0 are identical to the draw call and the triangle. The tier-2 town row has the same range
(149-158) with a different median and the tier-2 stadium row is +244 triangles: townsfolk walking through a 14 s wait. One run
each; the tier-0 baseline needed a second attempt (the first timed out loading the page after the code swap).

**Default 4 s wait (comparable with section 2, camera still moving).**

| view | tier 0 before (section 2) | tier 0 after (two runs) | tier 2 before (three runs) | tier 2 after (four runs) |
|---|---|---|---|---|
| swim draw calls | 102 (98-103) | 98 (96-100), 99 (96-102) | 94 (92-95) each time | 91 (88-100), 90 (88-91), 92 (90-101), 91 (88-94) |
| swim triangles | 181,436 | 181,116, 182,232 | 148,242 each time | 150,954, 147,922, 152,874, 150,954 |
| swim programs / textures | 68 / 64 | 69 / 64, 71 / 64 | 67 / 63 | 68 / 63 each time |

Median draw calls are lower in every run. Triangles and the maximum draw calls are sometimes above the baseline in this mode
(up to +4,632 triangles, max 101 against 95): the after build reaches a slightly different point of the camera's flight when the
40 frames are taken, and the view at rest holds more than the view in flight (154,714 against 148,242 before the change). The
at-rest table is the like-for-like one. Town, shore and stadium in this mode: within 1 draw call and 800 triangles of section 2.

Still to do for Batch A: an iPhone check (5 minutes of swimming, before and after), the owner's eye on the ring / wake look, and
the drip trail if wanted.
