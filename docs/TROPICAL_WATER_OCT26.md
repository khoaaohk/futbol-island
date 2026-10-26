# Tropical shore water — October 26, 2026 (local, not deployed)

Owner request: up close (walking, scooter, bike, moped along the shore) the water should be hypnotic, peaceful and a joy to look at:
more light on the water (sun glitter), a tropical blue feel (turquoise shallows into deeper blue, sandy bottom and caustic light in
the shallows, soft edge). Owner rule on top: **no added heat — every render path must cost the same or less than before**.

## Audit (before)

- **Camera:** one fixed follow view (Town.tsx): offset (16–18, 23, 30–33) from the player, fov 40°, ~42 m away, ~32° over the
  water. Walking and riding never zoom; only a landscape phone dollies in (`cameraDollyFor`, ride/walk) and the emote camera. So the
  "closest zoom" in portrait is the default view, where 1 phone pixel is ~4 cm of water (desktop 1280×800 ~7 cm).
- **Why it looked flat up close:** the shallows were a muted grey-teal; over the clear water window (alpha .14 at the edge) the tan
  sand turned the edge olive-khaki, and the strip thinned the skirt's water by 55 % there, so the band at the waterline read as
  olive, not lagoon. No sparkle anywhere since Oct 20 (the old blinking specks were removed; `waterGlimmer` was dead code). The
  strip's sheet had no light on it; the desktop-only glints never ran on phones.

## Changes

- **Colour ramp** (constants only): ocean shallows `(.04,.62,.7)` → `(.02,.44,.64)` over 0.3–5 m, deep sea mixes toward cerulean
  `(.015,.2,.47)`; the strip's sheet `(.1,.72,1)` / shallows `(.02,.5,.78)` (bluer: the golden sunset light greens anything cyan);
  thin foam tint `(.74,.95,.93)` to match. Clear window edge alpha .14 → .2 and the strip skirt thinning .55 → .35, so the edge
  reads turquoise over the sand while the coral further out (alpha .42) is unchanged. Slow hue drift: not done (would cost ALU).
- **Sun glitter** (`waterGlitter`, waterSurface.ts): one ~0.55 m cell layer, one hash, a sharp core with a small four-point
  cross, in drifting clumps (sea noise + ripple tile), denser/brighter toward the sun's reflection, white-gold from the sun light.
  Each speck swells in and out on a smooth cosine at 0.3–0.65 Hz (no strobing; limit 3 Hz). Runs only inside the light net's
  near-camera branch (`reachS>0`), off the swash, and fades out before a speck's core drops under ~1.5 px (pixel footprint
  .055–.11 m), so it is gone far away / at low resolution.
- **Strip shallows** (islandShore.ts, inside the existing near lace branch `vFar<.999`): a caustic web from the already-fetched
  lace (contour of the big-lace noise at a level breathing with the bubble noise), the old desktop glints now on phones too, a faint
  sky sheen on freshly wet sand. No extra fetch.
- **Paying for it:** (1) the light net's Voronoi (`waterRibbon`) used two `glimHash` per cell (18 per layer); now one `glimHash2`
  per cell (same look, ~118 ops fewer per layer). (2) The strip fragment no longer reads the island field: the noises, beach flag
  and fishing-box fade come from the vertex shader (`vSh`; 1 m vertex grid over a 2 m bilinear field), and the band fades /
  mean run-up / noisy waterline are hoisted too (`vBand`). Vertex side: +1 field fetch and ~40 ops per strip vertex (~1.3k
  vertices per 128 m tile, 1–4 tiles in view: a few thousand vertices vs ~10^5 strip fragments on a phone).
- **Gates** (`uSunGlitter`, `sunGlitterLevel`, set once per frame next to `setWaterDetail`): 1 when cool; 0 at heat tier ≥ 2,
  governor "slow", Battery saver and reduced motion. The still path (detail 0: reduced motion, tiers 3–4, slow) draws no glitter or
  caustics and is now cheaper than before. Shore foam (shoreFoamFx) untouched apart from the tint.
- Fishing strip (`lib/town/fishing/shoreWater.ts`) and the clear-window seabed untouched.

## Cost before → after (per fragment, `tests/water-tropical-glslcost.cjs` estimate: ALU ops / texture reads)

| Path | Before | After |
|---|---|---|
| Ocean, far (outside the light-net reach) | 767 / 4 | 766 / 4 |
| Ocean, near, phone (glitter on, worst pixel) | 1262 / 4 | 1257 / 4 |
| Ocean, near, phone hot (tier 2: glitter off) | 1262 / 4 | 1144 / 4 |
| Ocean, near, desktop | 1723 / 5 | 1601 / 5 |
| Ocean, still (reduced motion, tiers 3–4) | 1124 / 4 | 1006 / 4 |
| Strip, still | 333 / 1 | 300 / 0 |
| Strip, far (past 65 m) | 564 / 1 | 525 / 0 |
| Strip, near, phone | 568 / 2 | 566 / 1 |
| Strip, near, phone hot | 568 / 2 | 529 / 1 |
| Strip, near, desktop | 589 / 2 | 566 / 1 |

The estimate counts each arithmetic op / comparison as 1, weights builtins (sin/cos/exp 4, pow 6, smoothstep 5, mix 3, length 4…),
expands loops and user functions, ignores vector width, and counts every early-out branch's body (worst pixel). Draw calls,
meshes, materials, textures: unchanged (0 added). CPU per frame: one extra scalar uniform write and a few compares
(`sunGlitterLevel`); 0 allocations (heap flat over 200k calls). GPU timing was not measured on a device: this is reduced or equal
work by estimate, not a measured phone-temperature claim.

## Validation

`npx tsc --noEmit`; `npm run test:quiet`; `npm run build:quiet`; `tests/water-tropical-cost.cjs` (per-path cost ≤ baseline,
texture/draw counts, LOD and heat / saver / reduced-motion gates, twinkle < 1 Hz, no allocation). `tests/shore-foam-cost.cjs`
and `tests/swim-clear.cjs` pins updated (field read now per vertex, glints on phones behind the gate, ocean cache key v10).
Headless screenshots (dev server, tier 0): phone 390×844 and desktop 1280×800 at the north boardwalk beach (x 60, z 218) and on
the East Pier straight (x 262, z 98), before and after; no shader errors.

## Eyeball on a phone

1. Walk the boardwalk beach: the edge band should read lagoon turquoise (not olive), clear aqua further out, cerulean past it.
2. Small white-gold star glints drifting in clumps on the water near you, each fading in and out slowly; none far away.
3. A faint moving light web on the thin water over the sand at the swash edge; wet sand just above the water a touch glossy.
4. Battery saver, or a hot phone (tier 2+), or reduced motion: no glints or caustics, calm water.
