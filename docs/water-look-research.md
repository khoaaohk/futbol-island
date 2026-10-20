# Open-sea look (Tide Bound reference) and a visible swimming body: research

Written 19 Oct 2026. Research only; no source changed. Reference: six screenshots of "Tide Bound" (stylised see-through sea,
a seabed of coral blobs and sea grass, drifting light-ripple bands, white-network caustics on the sand, sparkle specks, soft
shadow under the boat, swimmer visible below the surface).

## 1. What the reference does (and what is cheap about it)

1. **The sea is see-through everywhere**, with depth shown by colour: pale turquoise over sand, deeper blue past a drop-off.
2. **A seabed exists** and is simple: flat sand with a caustic network, chunky low-poly coral blobs, sea-grass tufts. Props are
   few, large and flat-coloured; they fade into the blue with distance.
3. **Surface light = soft horizontal ripple bands** drifting slowly, plus a few white specks. No real waves, no reflections.
4. **Things under the surface are tinted and blurred by the water**: bodies and boat shadow go bluer and softer with depth.
5. Splash = a ring of white shard sprites. Wake = the same shards trailing.

## 2. What we already have (so most of this is reuse, not new tech)

- **Island ocean** (`waterSurface.ts` `patchOceanMaterial`): ONE opaque plane at y -0.43, painted ripple tile (1 read phone,
  2 desktop), depth gradient from the baked whole-island shore field, swell lines, desktop glints. It is **opaque**, which is why
  nothing under it can be seen.
- **Fishing underwater look** (`lib/town/fishing/underwater.ts`): the whole recipe the reference shows already exists, but only
  inside a fishing session box: `patchUnderwater` (caustics from one noise read, depth absorption and tint, surface-over-object
  blend), the ocean flips to `depthWrite:false` + late `renderOrder` via `createOceanClear`, a per-spot merged vertex-coloured
  seabed (ONE mesh), ONE instanced fish draw. Measured: 57-124 draws, GPU about 1.9 ms on the phone profile.
- **Heat gating** exists: `uWaterDetail` 2/1/0, held clock at tiers 3-4, `fishingLife` gate for decorative sprites.

## 3. Recommended design: "clear water window", not a clear ocean

Making the whole 2100 x 1700 m ocean see-through would mean a seabed everywhere and transparent sorting for the whole screen.
Do NOT do that. Instead make the sea clear only in a **moving window round the player/camera (about 30-40 m)**, and keep the
current opaque ocean everywhere else. The edge fades back to opaque teal over the last 10 m so there is no visible border, and
far-away sea reads as the same painted blue as today.

| Piece | How | Heat |
|---|---|---|
| Clear window | Reuse `createOceanClear` (2 render-state flags) while within ~35 m of the player and outside rides at speed; ocean fragment alpha = 1 - window mask, mask from one distance-to-player uniform | None extra: same draw, one uniform write |
| Seabed | One merged vertex-coloured sand sheet (2 m cells, depth from the existing `uwDepthAt`) that follows the player in 16 m snaps, plus caustic noise already in `uwCaustic` | 1 draw, about 2-4k tris, 1 noise read phone |
| Coral and sea grass | Scatter from a seeded grid in the window: reuse the fishing reef prop kit, capped at about 40 formations, ONE InstancedMesh per kind, static, no animation except the vertex sway already in `patchUnderwater` | 2-3 draws, static; skipped at tier >= 2 beyond 15 m |
| Ripple bands + specks | Add a third, very low-frequency stretched sample of the existing ripple tile to the ocean fragment (a UV scale, not a new texture); specks = existing `waterGlint` threshold | +0 reads on phone (reuse layer A with different scale) |
| Depth colour | Already `shallowC` gradient; add a deeper blue past ~8 m | free |
| Tiers | Tier 0-1 full; tier 2 no coral beyond 15 m, one caustic read; tier 3-4 and Battery saver: window off (today's opaque sea) | strictly lower than fishing |

Estimated added cost: about 4-6 draws and 10-15k triangles in the window, GPU +0.4-0.8 ms on the fishing-profile numbers. This
is a hypothesis from desktop profiling; **no heat claim without an iPhone test** (AGENTS.md).

Risks: (a) the transparent ocean over the shore strip and beach sand must keep today's sort order (`renderOrder .25` worked for
fishing); (b) wake/ball/NPC sprites drawn before the ocean would vanish under it (check ball splash, boats, ferry, sharks);
(c) the seabed must hide at the waterline where the strip draws foam; (d) jetpack/flight camera heights where the window is
pointless: turn it off above about 12 m.

## 4. Swimming: why the body is hidden and the fix

**Cause.** `swimPose.ts` puts the rig root `SWIM_ROOT_DEPTH` 1.27 m under the water line ("The opaque sea hides whatever is under
the line"). So the legs, hips and the front-crawl kick are literally inside the opaque plane and are never drawn.

**Fix (reuses section 3).**
1. While `swim.w > 0`, turn the clear window on **locally, a 6-8 m disc under the swimmer** even if the global window is off
   (tier 3-4 included: it is one disc, not a scene), via the same `createOceanClear` flags.
2. Draw the rig with `patchUnderwater` colouring below the water line: absorption tint, desaturation, caustic ripple across the
   body, so the submerged half looks blue, soft and slightly wobbly (the sway in `uwWobble`). The bean skin is 4 shared instanced
   meshes, so this is ONE material patch applied to those four, not per-limb work.
3. Raise the root slightly (SWIM_ROOT_DEPTH 1.27 to about 1.0) and keep the pelvis pitch, so the kick and legs are in the
   clear band (0.3-1.2 m) where tint is light enough to read the pose.
4. A soft dark ellipse on the seabed under the swimmer (one quad, 0.6 opacity), like the boat shadow in the reference.
5. Splash shards at the waterline from the existing splash pool; no new sprite system.

Effort: window + body tint is the same mechanism, so it is one build lane. Rough estimate: swimming-body fix about 1 day;
full clear-window sea (seabed, coral scatter, tiers, tests, iPhone check) about 3-4 days.

## 5. Order and decisions for the user

1. Build the swimmer-only disc first (fixes the reported bug, proves sort order and cost). 
2. Then widen to the 35 m window with seabed and a small coral set.
3. Test on a real phone: 5 min swimming in clear water, 5 min walking the beach, 20 min on cellular.
Decisions: coral density (about 40 vs about 80 formations), whether jetpack flight keeps the clear sea, and whether the clear
window should respect Battery saver (recommended: yes, off).
