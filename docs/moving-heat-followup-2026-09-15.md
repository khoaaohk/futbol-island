# Movement heat follow-up — September 15

User reports no increasing heat while stationary, but warming during travel. Physical device: iPhone 17 Pro Max. This follow-up profiles the current production build and compares the earlier deployment used in previous investigations.

## Diagnosis and limits

A ten-second production CPU profile did not isolate a movement-specific JS spike. Stationary flight field-update median was 1.4ms; the cruise route was 0.6ms as it left the fields. This moving route sees different scenery, so it is not a causal idle/motion comparison. Town rendered zero additional HUD updates while stationary and six across the cruise sample; joystick visuals already avoid React state updates. Do not reintroduce those old optimizations as new fixes.

Earlier deployment `futbol-island-2xu2quk45-khoa0aohk.vercel.app` versus current production `dpl_BCbYycM4ZE3jrUUJYYaPopetRQZi`, same 440×760 / DPR2 views at flight height28:

| View | Earlier draw calls / triangles | Current draw calls / triangles |
|---|---:|---:|
| Square | 449 / 165307 | 396 / 211019 |
| Town | 337 / 364194 | 219 / 401124 |
| Coast | 331 / 198741 | 206 / 258836 |

Current CPU render time is lower, but triangles are higher. These live scenes are not deterministic pixel comparisons and have content differences; they do not prove which single feature caused the user's warming. Fewer draw calls alone do not establish lower GPU power.

## Concrete wasted work and fix

`fieldRuntime.ts` was submitting every player on any visible live pitch to a global instanced batch. `playerBatch` disables normal object frustum culling because its instances span multiple fields; it does not cull individual instances. Thus a small visible corner of a field could cause both teams to render outside the screen.

Before submitting a live player, check a conservative radius7 + 2×elevation sphere centred at (x+1.5, elevation+1.5, z−1). It includes body motion and the fixed sunset shadow extent. Skip only the instance submission if that entire sphere misses the camera frustum. Keep match simulation, rig animation, hit handling and ball-contact calculations intact. Teaching sessions bypass this culling completely. No LOD, lower resolution, frame target, shadow quality, or altered gameplay.

`games.stats.culledPlayers` records work skipped. `games.setPlayerCulling(false)` is a diagnostic toggle for same-frame parity and paired timing checks.

## Results

Six same-frame before/after comparisons yielded **zero changed pixels**, including shadows. Examples:

- Square: 14→1 submitted players; 215204→131900 triangles.
- Town: 46→16 players; 400935→208695 triangles (48% fewer total triangles).
- Field flight: 22→13 players; 234010→176338 triangles.
- Coast control: unchanged 10 players and 265164 triangles.

Alternating baseline / enabled / enabled / baseline six-second GPU samples in the same town flight view:

| Mode | GPU median | Field update median | Total triangles |
|---|---:|---:|---:|
| Baseline 1 | 6.460ms | 2.2ms | 401011 |
| Enabled 1 | 3.786ms | 1.5ms | 201219 |
| Enabled 2 | 3.932ms | 1.5ms | 214203 |
| Baseline 2 | 5.779ms | 2.2ms | 400315 |

About 37% lower mean-of-run GPU median across these paired samples, at unchanged DPR2 and approximately30fps. Simulation continued, so exact triangles vary between timed samples. This measures GPU work on desktop Chromium Metal, not iPhone temperature or battery use.

## Verification

Production build, stable live frame fixture, teaching contact (918beats/217passes), and quiz outcomes (193questions/61passes) pass. Same-frame rendering fixture `/tmp/fi2-live-player-culling.cjs`; alternating GPU fixture `/tmp/fi2-live-culling-gpu.cjs`; release comparison `/tmp/fi2-release-compare.cjs`; CPU profiler `/tmp/fi2-moving-heat-profile.cjs`. Extended field-edge sweep results and deployment status appended below.

Extended validation: all 18 sequential flight-edge views passed zero-pixel-change comparisons, including shadows, with 23–31 offscreen players excluded in those samples. Combined with the six-view fixture this covers 24 parity comparisons. Candidate queued for production deployment; final status follows.

Final safety refinement: rooftop pitches use radius7 + 2×elevation to conservatively retain shadows reaching ground below the roof. Eight final fixed/roof-edge views pass exact pixel parity. This retains more rooftop players: final town sample 46→22 players, 400935→247143 triangles (38% reduction). Initial timing table above predates this wider margin; final timings will be appended rather than misrepresenting the initial 37% as the final result.

Final alternating GPU samples with rooftop margin: baseline5.270/5.015ms; enabled4.018/3.953ms. Mean-of-run medians improve about22.5%; field-update median2.1→1.6ms. Frame target and DPR remain unchanged. Final build passes.

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
