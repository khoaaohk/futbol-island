# Shore foam pass — October 26, 2026 (local, not deployed)

Owner request: audit the wave foam washing onto the shore, make it more dynamic, realistic and interactive, with equal or lower
heat / GPU / CPU cost.

## Audit (before)

- **Where:** `lib/graphics/islandShore.ts` (island-wide strip, baked once at mount), shared GLSL in `lib/graphics/waterSurface.ts`
  (`SHORE_GLSL`, ocean swell lines), fishing copies in `lib/town/fishing/shoreWater.ts` / `underwater.ts`.
- **Geometry:** one strip mesh along every shore (1 m grid, −2.4…+2.6 m band), split into 22 tiles of 128 m (frustum-culled, usually
  1–4 draws in view, ~54k triangles total). One shared transparent `MeshLambertMaterial`, no shadows, no depth write.
- **Textures:** the 518×313 half-float shore field (distance, two noises, beach flag) and a 64² RGBA8 lace noise — with the SAME
  value copied into all four channels (three channels wasted).
- **Per fragment (detail ≥ 1):** 1 field read + 1 lace read; swash on a fixed 5.6 s cycle (`uWaterTime/SWASH_P`), per-wave height
  from a hash, wet sand drying, a breaker line. Detail 0 (reduced motion, governor slow, heat tiers 3–4): field read only, static.
- **Per frame CPU:** none (one shared clock uniform). No allocations.
- **What looked flat:** a metronomic 5.6 s period with no sets; the foam edge was a soft stripe that stayed the same shape in rush and
  backwash; nothing was left on the sand after a wave except a uniform damp band; foam was the same opaque white when thin; the foam
  ignored the player and the ball completely (only separate ripple rings on open water).

## Changes

- **Irregular waves + sets:** one swash clock `uSwashClock = t/5.6 + 0.22·sin(2πt/31.25)` computed ONCE per frame on the CPU
  (`swashClock`, set in `stepWaterTime`), so wave gaps drift ~4.5–7.5 s; `waveSet(ci)` makes ~2 of every ~7 waves run up to 34 %
  further (reach capped inside the strip band). The ocean's crest lines, the island strip and the fishing strip all read the same
  clock, so swells and swash stay in step. The warp period divides the 3500 s clock wrap (seamless).
- **High-water mark:** after each wave tops out, a darker damp line stays at its reach, edged with bubbles that pop over ~2.5 s;
  faded before the next wave (no seam at the wrap).
- **Lacy foam:** the edge breaks into patches as the wave slows and slides back (big-lace × bubble noise threshold driven by the
  rush), trailing foam gets bubble holes; thin foam is see-through aqua, thick foam white. Desktop (detail 2) only: a few glints.
- **Interaction** (`lib/graphics/shoreFoamFx.ts`, wired once in `Town.tsx`): foam parts round the player's ankles in the swash and
  bunches in a soft ring outside; footsteps and the ball rolling / dropping in the swash leave spreading foam rings (4-slot ring
  buffer); a ball dropping in triggers ONE pooled `ballEffects.splash` (existing rings), at most every 0.6 s.
- **Gating:** Battery saver / heat tier ≥ 3 → off; tier 2 → rings, no spray; reduced motion → calm (parting only, no rings, no
  spray; the strip is on its static detail-0 path anyway). Off before the shore bake, on decks/rocks, mid-air, and with the camera
  > 70 m from the player. `uFoamFxOn = 0` when nothing is live, so the shader skips the block on a uniform branch.
- **Cheaper far away:** past 45–65 m view depth the strip fades the lace to its mip-average grey and skips the lace fetch entirely
  (`STRIP_FAR`; gradients taken outside the branch).
- **Kids wading:** not done (NPCs never stand in the swash today; would need NPC routing changes). Swim / dive / water-entry logic
  and collisions untouched.

## Cost before → after

| | Before | After |
|---|---|---|
| Draw calls | strip tiles in view (1–4) | same (no mesh, no material, no texture added) |
| Triangles | ~54k strip total | same |
| Textures | field + 64² lace (16 KB, 1 useful channel) | same two, lace now 4 useful channels (still 16 KB) |
| Strip texture reads / fragment | 2 (detail ≥ 1), 1 (detail 0) | 2 near, **1 past 65 m**, 1 (detail 0) |
| Strip ALU | baseline | + ~25 ops (mark, break-up, tint); + 4-ring loop only while `uFoamFxOn` |
| Ocean / fishing fragment | `uWaterTime/SWASH_P` divides | replaced by a uniform (−1–2 ops); + `waveSet` on ocean crests (~6 ops, detail ≥ 1 only) |
| CPU / frame | 0 | 1 `sin` (swash clock) + `shoreFoamFx.update`: 2–4 bilinear field lookups, 6 uniform writes |
| Allocations / frame | 0 | 0 (tested: heap flat over 60k frames) |
| Particles | — | 0 new; ≤ 1 pooled existing splash per 0.6 s |

In-page smoke (production build, headless, beach at x 60 z 218): phone 93 draws / 157k triangles, desktop 163 draws / 217k
triangles, no shader or page errors. GPU timing was not re-measured (no EXT_disjoint_timer_query run this pass); reduced work only,
no phone-temperature claim.

## Validation

`npx tsc --noEmit`; `npm run test:quiet` (296/296 after fixing a cleanup-order regex in heat-tiers / swim-clear);
`npm run build:quiet`; `tests/shore-foam-cost.cjs` (cost caps, one lace fetch, far skip, uniform branch, clock monotonic and
seamless, gating, interaction cases, no allocation). Screenshots: one phone + one desktop on the north boardwalk beach.

## Eyeball on a phone

1. Watch a beach for ~40 s: wave gaps should vary and every so often two bigger waves run further up.
2. After each wave: a thin darker line where it topped out with bubbles popping, gone before the next wave.
3. Backwash: the foam edge breaks into lace, not a sliding white stripe.
4. Walk along the swash: foam parts round the ankles, small rings at each step; kick the ball into the swash: a ring + one splash.
5. Reduced motion / Battery saver: calm static shore, no rings.
