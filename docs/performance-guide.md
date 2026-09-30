# Performance reference for future Futbol Island updates

## Travel-map interrupted drags — September 30, 2026 (local, not deployed by this pass)

`IslandTravelMap` keeps the last painted pan position when a pointer is cancelled or loses capture. Previously a coordinate-free cancellation jumped the map 460 CSS pixels in the desktop reproduction. Only the primary pointer can start a drag, and an additional contact cannot replace it. Closing clears drag state and capture. The trailing drag click is suppressed until consumed or the next pointer press, while keyboard activation remains available; this removes the previous zero-delay click-reset timer.

This preserves reliable access to the map's football destinations. Runtime cost is one last-position reference per active drag and event-driven cleanup; no animation loop, polling, rendering-quality change or idle timer is added. `tests/e2e/travel-map.spec.ts` starts drags through browser mouse/CDP touch input, injects a coordinate-free cancellation and secondary pointer, explicitly releases capture, and checks stable placement, retry and Escape. The final regression passes in desktop Chromium, Pixel 7 Chromium and iPhone 15 WebKit; TypeScript passes. Chromium's Pixel profile uses touch movement; the iPhone WebKit profile uses mouse movement at phone dimensions. These checks do not establish physical-iPhone gesture or thermal behavior.

## Walk-in Konbini (Island Square + Coral Cay) — September 29, 2026 (local, not deployed)

Both Konbinis are enterable through their sliding doors (`/konbini?door=main|cay`, `components/KonbiniRoom.tsx`,
`lib/konbini/*`). Like the Arcade it is a **document boundary**: entering saves the door's departure
(`lib/konbini/konbiniDoors.ts`, the Arcade's `islandReturnPosition` record) and navigates, so the island is fully unloaded
while you shop. The scene module is dynamically imported when the page mounts.

**How the cost is kept down.**
- **Island: zero frames inside.** Measured: `window.__fi2` is undefined inside (no island runtime at all) in every browser run.
- **One engine, two data-driven interiors** (`konbiniVariants.ts`): the same atlas and meshes with different placements and colours.
- **Static geometry:**
  - every box is ONE merged vertex-coloured Lambert mesh;
  - every printed thing (magazines, posters, signs, beach decor) is ONE merged unlit mesh on one canvas atlas (`konbiniAtlas.ts`);
  - **shelf products are low-poly 3D** (Sep 29 2026, `lib/konbini/productMeshes.ts`; user: "the items on the shelf need to be isometric too"): every food, drink and shelf-stock item is a flat-shaded vertex-coloured mesh (built once per key per visit, avg ≈ 44 triangles, back/bottom faces never built) cloned into the SAME merged static Lambert mesh, so they add **no draw calls**. ~500–530 products per store (fridge 3 deep, rice case 2, gondola aisle side 2, back side 1, seeded jitter). A tapped product lifts as ONE reusable mesh (one extra draw only while highlighted); magazines and the eat animation keep the atlas sprite. Floor tiles became 2-triangle quads (−1.9k tris) to pay for part of it. Measured (phone, 4× CPU): 11 calls before and after; triangles 11.6k → 32.7k (Island Square), 11.9k → 33.7k (Coral Cay); one throttled render 0.29 → 0.39 ms / 0.26 → 0.34 ms; still 30 fps capped while walking and 0 idle rAF. Desktop idle: 16 calls / 17.4k → 16 / 38.6k (main), 15 / 17.2k → 15 / 38.8k (cay); zoomed shelf 4 calls / 5.7k → 4 / ≈ 32.7k (the merged mesh is drawn whole). Budget test: `tests/konbini-shelf.cjs`. Tradeoff: more vertices per frame in one draw; not validated on a real iPhone;
  - **iso item art** (Sep 29 2026, `lib/konbini/isoArt.ts` + `foodArt.ts`, drinks in `lib/graphics/drinkArt.ts`): every food and drink is original isometric Canvas 2D art, seeded (deterministic) and painted once per use: the atlas stays 1024×512 RGBA (2 MiB, unchanged; ~85 ms to paint once per visit in desktop Chrome), collection/pouch tiles blit a bitmap from a 48-entry LRU (`foodBitmap`, ≤ ~7 MB worst case at 96 px × DPR 2), and the reveal keeps its bounded one-shot rAF (no new loops). Tests: `tests/konbini.cjs` §2b (cell bounds, determinism, shadows, layer sequences, cache/atlas bounds).
  - the fridge glass is one mesh; the sliding doors are one 2-instance mesh.
- **Lighting:** two lights and no shadow maps (fake contact discs).
- **Ball:** the player's own ball, with its 6 patches merged into 1 mesh.
- **Sleeping:** the loop runs only while something moves (walking, ball rolling, doors, greeting, eating, zoom tween or camera settle), then sleeps with no rAF.
- **Caps:** phones are capped at 30 fps (`frameCap`), with the heat tier's pixel ratio (≤ 1.5 on phones) and frame caps.
- **Shelf zoom** (the vending pattern): an eased ~1 s orthographic camera move onto the real shelf.
  - Near-plane clipping hides the aisles in front: no extra geometry and no second render.
  - Tap targets are DOM buttons over the projected products.
  - Idle zoomed views sleep.
- **Overlays:** the reveal, coins, receipt, stamp, greeting bubble and brush wipe are DOM/CSS or one 2D canvas that animates only while the build plays (≈ 0.36 s per layer + 0.6 s finish), then goes static.
- **Audio:**
  - One AudioContext.
  - The in-store music is an original loop rendered once into a buffer: no sequencer timers. It fades out and suspends when hidden or after 30 s idle.
  - Effects are one-shot oscillators or noise bursts.
  - Everything is closed on exit (`typeof window.__konbiniMusic` is undefined back on the island).

**Measured** (`scripts/check-konbini-perf.cjs`; headless Chromium; phone = 390×844 touch, DPR 3, CPU throttled 4×; walking 5 s):

| Scene | Draw calls | Triangles | One render (throttled) | Rendered fps while walking | Idle rAF |
|---|---|---|---|---|---|
| Island Square (phone) | 145 | 113k | 14.9 ms | 29.2 (30 cap) | — |
| Arcade room (phone) | 48 | 134k | — | — | — |
| **Konbini, Island Square (phone)** | **11** | **11.6k** | **0.29 ms** | 30.2 (30 cap) | **0 in 3 s** |
| **Konbini, Coral Cay (phone)** | **11** | **11.9k** | **0.26 ms** | 30.2 (30 cap) | **0 in 3 s** |
| Konbini zoomed on a shelf (phone) | 4 | 5.7k | 0.17 ms | 30 tween frames, then 0 | 0 in 2 s |
| Island Square (desktop 1280×800) | 311 | 261k | 12.4 ms | 29.8 | — |
| Arcade room (desktop) | 82 | 155k | — | — | — |
| Konbini, main / cay (desktop) | 16 / 15 | 17.4k / 17.2k | 0.23 / 0.26 ms | 60 (uncapped desktop) | 0 |

Arcade frame rate was not captured: its draw counter did not advance under the sideways-walk probe. Its calls and triangles come
from `__arcadeRoom.state.render`.

**Other checks:**
- `scripts/check-konbini-browser.cjs` passes at 390×844 touch and 1280×800 for both stores (and `--flight`). It asserts that the idle store schedules no frames, that the island is absent inside and renders again outside, and that no store music remains outside.
- The building highlight for both Konbinis reuses `createBuildingGlow` (a new single-box `konbini` kind) and only runs when near, as for the Arcade.

Emulation only; nothing here was measured on an iPhone, and no cooling claim is made.

## Vending: real depth behind the glass, four books per machine — September 30, 2026, later (local, not deployed)

The user reported "the perspective of the shelves and books doesn't match that of the machines" and asked "shouldn't each vending machine have multiple books?" / "each machine should have 4 books".

- **Real bay while zoomed** (`buildCloseUp` in `lib/graphics/vendingMachines.ts`, all 15 machines including both drink machines). On `focus()` the zoomed machine and its side-by-side neighbour change for the length of the zoom. Their cabinet front face and printed glass are cut away: 12 vertices are collapsed and later restored exactly. A recessed bay is added in the shared machine material, lit like the cabinet: back wall, side walls, header block and two shelf slabs. The printed panels (header, rails, LED, coin, tray) are painted once into one canvas, as before. The page-one products stand as cut-out sprites on the slabs, `VENDING_BAY.product` (0.15 m) behind the glass. Balls and bottles turn to face the close-up camera, and books and packs have thin real boxes. A faint glass pane sits in front. Nothing changes at rest: one draw call per machine, and `check-vending-browser` measured +2 draws at Island Square and a 0.72 µs idle update.
- **Zoomed cost** (desktop Chromium): +4 draw calls per machine while zoomed (+8 for a Konbini + drink pair). Painting the close-up takes 1–27 ms once, on the first frame of the zoom; the highest figure is the first plaza zoom of a session. The texture is 3.1–11.9 MB (single machine or pair, at 390×844@3 to 1280×800@2) and is freed when the zoom-out ends. There is no per-frame canvas work.
- **In-use face with the same depth.** `faceCssMatrix` gives the HTML face the zoom camera's true CSS 3D placement (`matrix3d` with perspective). `.face[data-depth]` then uses `preserve-3d`, the product windows use `translateZ(-(product + proud))`, the painted glass and fake side returns are gone, and the face no longer fades in, because opacity would flatten the 3D. Products, shelves and tap areas therefore line up with the real bay from any angle. The close-up's own products hide the moment the camera arrives, and the HTML face then shows the live stock.
- **Flat distant front.** The atlas glass no longer paints side returns or bevelled shelves. Packs are drawn as real foil card packs, and books as flat covers with no painted page block.
- **Books.** `MACHINE_BOOKS` in `lib/town/vendingCatalog.ts` gives every shop machine exactly four books, its home books first. All 36 sellable books are covered; the starter book stays free. Each book is ONE item wherever it is sold, so ownership, "Read" and the own-everything total are unchanged, and no save migration is needed.
- Checks: `tests/vending-machines.cjs` covers the books, per-book ownership across machines and the all-machine close-up/tap mapping. The full `npm test`, `tsc`, `check-vending-browser` and `check-book-machines-browser` (desktop and phone) passed. Not measured on an iPhone.

## Vending close-up: sharp faces, true ball pictures, one hardware design — September 30, 2026 (local, not deployed)

The user reported the balls "seen from above like a coconut", that "the balls need to be the same as the real balls", that the faces go blurry when zooming in, and that the coin display and PUSH flap differ between machines.

- **Ball pictures.** `components/StorePreviews.tsx` now renders a ball as the walking ball is lit. It uses the island's daytime hemisphere and sun (`ISLAND_LIGHT_PRESETS`/`ISLAND_SUN_POSITION`, exported from `lib/graphics/islandLighting.ts`), ACES tone mapping and sRGB output. The camera looks from 12° up, from the island camera's side. The ball is turned (`BALL_VIEW`, a per-style override for the laced ball) so one of the six `addBallPatches` patches faces front and none sits on the pole. A soft contact shadow is added underneath. `scripts/capture-vending-products.cjs` bakes `ball-<style>.png` at 91×103 px and 13–19 KB: the ball plus its shadow strip. The vending face, its tray and the backpack now show that same PNG (`BallPicture`), standing on the shelf line. A CSS `--ball-widen` undoes the close-up's width foreshortening. An in-game side-by-side for all 14 styles matched in pattern, colour and markings.
- **High-res close-up face** (`buildHiRes` in `lib/graphics/vendingMachines.ts`). On `focus()`, the zoomed machine and its side-by-side neighbour (the Konbini and drink pairs) are painted ONCE into one canvas with the same painters as the atlas. The canvas is sized to the on-screen face × min(DPR, 2), capped at 2048 px, and shown by one thin overlay mesh per machine (+1–2 draw calls, only while zoomed). It is disposed when the zoom-out ends, on `cancel()` and on `dispose()`, so at most one such texture is alive. Nothing is redrawn per frame. Measured in desktop Chromium: 1–8 ms to paint. The texture is 1466×1064 (6.2 MB) for a pair at 390×844@3 and 2026×1472 (11.9 MB) at 1280×800@2, or half that for a single machine.
- **Atlas memory.** The full-size emissive copy of the atlas is gone: it changed nothing on screen because printed texels are unlit through the shader patch. That saves 4 MB plus mipmaps (~5.6 MB GPU) and a 4 MB canvas. The atlas keeps its mipmaps, and its anisotropy is now 4 (was 2). Resting total is ~5.6 MB GPU, down from ~11.2 MB.
- **One hardware design.** The LED, coin panel and tray are painted in their true proportions (`paintLed`/`paintCoin`/`paintTray`) to match the HTML face. The coin digits sit below the glass bezel's lower lip, which clipped them before, and show the player's real balance (`createVendingMachines(scene,{coins})` in Town). The balance is read at build and on each zoom in and out only; a change re-uploads the atlas once. The HTML face now shows the COINS label as well.
- Checks: `tests/vending-machines.cjs`, `tests/drink-machines.cjs`, `tests/vending-kick.cjs`, the full `npm test`, `tsc` and `scripts/check-vending-browser.cjs` passed (+2 draw calls at Island Square at rest, idle update 0.21 µs). Not measured on an iPhone.

## Vending ball pictures match the real balls — September 29, 2026 (local, not deployed)

The glass fronts now show each ball's own baked picture, `public/vending/products/ball-<style>.png`, one for each of the 14 balls. The pictures are keyed by ball, so a ball looks the same on every machine. Before this change, each machine had one per-machine photo (`<machine>-ball.png`), and plaza's Telstar photo was out of date. Machines without one drew a generic tinted football. `scripts/capture-vending-products.cjs` bakes the pictures from the vending face's own shop snapshots (`components/StorePreviews.tsx`), trimmed to the ball: 93×93 px, 9–14 KB each. Re-run it after a ball skin changes. The shop snapshots and the walking ball now share `addBallPatches` (`lib/graphics/ballAppearance.ts`), so the face, backpack and glass all show the six dark patches of the ball you dribble.

**Added runtime cost:** none per frame. The atlas build requests at most one small PNG per ball on a machine's first page (browser-cached and shared between machines), draws it once into the existing 1024² atlas and re-uploads that one texture, as the old photos did. There is no new texture, material, draw call or renderer. A ball missing from `BAKED_BALL_PICTURES` falls back to the canvas miniature, so no picture ever 404s. `tests/vending-machines.cjs` checks every ball's picture and the per-machine requests. Checked in desktop Chromium at 1280×800 and 390×844, with no 4xx responses. Not measured on an iPhone.

## Kicking a vending machine — September 29, 2026 (local, not deployed)

A shot that hits a vending machine's body makes it shake, buzz and flicker, then fires a signal flare that bursts into a low-poly football and a star. The machine's display then shows the shot power and one rotating shooting tip, with a "save it for the goal" nudge. The code is in `lib/graphics/vendingKick.ts`, wired from the walking ball's `blocked` callback in `components/Town.tsx`.

**Trigger.**
- The ball must be in `shot` or `wall-juggle` mode and collide with a machine's footprint below its top. Its horizontal speed must be at least 9 m/s; shots leave the foot at 38–60 m/s.
- Each machine has a 3.5 s cooldown, timed on the effect clock, which only runs on awake frames that are not paused.
- A dribbled or attached ball never collides, so walking up to buy can't set it off. The browser check walked the ball into the plaza Konbini for 3 s: 0 triggers.

**Added runtime cost.**
- **Idle:** one flag check per frame, measured at 0.36–0.60 µs per `update` in a tight loop. It makes no transform writes and has a hidden signal group. When the island sleeps, nothing runs.
- **Shake:** writes the transform of the one machine mesh only while it shakes (0.8 s), then restores it exactly.
- **Flicker:** swaps the machine to one pre-built material twin for 0.36 s. The twin uses the same shader hook and cache key, so it needs no new program.
- **Signal:** one pooled five-mesh group, built once. It uses unlit basic materials, casts no shadows, adds no lights and ignores fog, and it is visible only for about 2.1 s.
  - Draw calls: +5 in the same frame (measured with the signal on vs off). The two double-sided billboards use `forceSinglePass`, which avoids three.js's second pass for them.
  - Size and placement: the apex is fitted once per kick with at most 16 projections (≤45 m high, burst below the top HUD). The size scales with camera distance.
- **Display bubble:** one DOM element, created on the first kick. It is placed once at the burst and faded by a single Web Animation (compositor opacity/transform), so it adds no per-frame JS.
- **Allocation:** a kick allocates no geometry, material, texture or mesh.
- **Sound:** reuses existing cues: the vending `thunk`, `boost('up')` for the rising whoosh, and the existing ball `bounce`.
- **Timing:** all JS and GPU work is idle again 2.2–2.5 s after the hit. Only the text's compositor fade runs on, to about 3.9 s, so kids can read it.

**Measured** with `scripts/check-vending-kick-browser.cjs` at the plaza Konbini (headless Chromium, vsync-bound, so frame time is not a discriminating measure):

| View | Idle draws | Same shot, reaction off | Shot with reaction | Kick `update` mean (active) | Idle again after |
| --- | --- | --- | --- | --- | --- |
| Desktop 1280×800, sunset | 221 | 272 | 269 | 29 µs/frame | 2.23 s |
| Desktop 1280×800, night | 231 | 286 | 287 | 40 µs/frame | 2.22 s |
| Phone 390×844 touch emulation, sunset | 119 | 154 | 169 | 68 µs/frame | 2.30 s |
| Phone 390×844 touch emulation, night | 123 | 158 | 176 | 34 µs/frame | 2.25 s |

- **Draw calls:** the extra draws during a shot come from the existing ball trail and ghost effects. The kick adds +5 (same-frame delta).
- **Frame time:** the median frame time was 16.7 ms in every state.
- **After the effect:** once idle again, there were 0 active kick updates.

Emulation only; not measured on an iPhone.

## Coral Cay, its causeway, sandbars, farm and hostel — September 29, 2026 (local, not deployed)

A tropical island (Coral Cay) east of the Community Hall, reached by a winding, beach-lined causeway with two sandbar stops.

**Code.**
- Shapes: `lib/town/coralCay.ts` (pure data).
- Build: `lib/town/coralCayWorld.ts`.
- Sharks: `lib/graphics/caySharks.ts`.
- Shallows: `lib/town/shallows.ts`.
- Walkable-land union: `lib/town/landmass.ts`.
- Floating-deck hook: `lib/town/landableDecks.ts`.
- Map flight outline: `lib/town/flightOutline.ts` plus the generated `flightOutline.data.ts`.

**What was built.**
- **Coral Cay:**
  - an irregular coast: 25.0% of the main island's area, with an uneven beach all round;
  - a boulevard, plaza, café, surf shop and guesthouse (the Beach Soccer Club building was later removed at the user's request, replaced by a court scoreboard);
  - a FIFA Law 1 beach-soccer court at "Sharks Beach";
  - a large tropical farm (crop rows, orchard, pineapples, melons, a thatched farmhouse and stand) with the **Harvest day** job (see `docs/island-jobs.md` §6);
  - the Coral Cay Hostel with six homes;
  - 17 islanders, plus the 3 farmers.
- **Causeway:**
  - 308 m over water (1.86× the first version) in S-curves;
  - sand banks in tapered stretches, sloped stone skirts, and foam plus fading shallows;
  - rails with capped ends, and 13 lamps.
- **Six friendly sharks** patrol both sides of the causeway.
- **Flight:**
  - The main island's water margin is now 50 m (was 35).
  - The corridor is a broad band: north edge 40 m beyond the road's northmost point within ±40 m, smoothed. South edge: the user's red line (z −55, with a rounded corner into the main margin).
  - The sandbar halos are clipped to that line.
  - The maps draw one outline traced from `flightBlocked` itself.

**How the cost is kept down.**
- **Static scenery.** Everything is built with the island's own helpers inside `buildTown`, so it joins the 50 m spatial paint batches. That includes the causeway strips (≤24 m pieces), the cay, the farm (crops and vegetation are low-poly icosahedra, cones and boxes), the hostel and homes, lamps and signs.
  - The cay's foundation, sand ring, lawn and shore rings are built relative to its centre, so they never widen a main-island batch.
- **Coral Cay region gate.** One frustum-box test per frame hides the ~200 static batches east of x 250 whenever that whole region is out of view.
  - This saved about 0.15 ms of throttled render time at Palm Coast (A/B in one page).
  - `world.setVisible` isolation still wins.
- **Shallows.** One shared lit material with RGBA vertex colours (alpha 0.85 → 0.4 → 0), `depthWrite` off, sitting 1.4 cm above the sea.
  - It replaced two opaque bands, and runs round the main coast, the causeway, the sandbars and the cay.
  - The pieces batch per chunk.
  - Overdraw is one blended strip about 5 m wide at each shore, instead of two opaque strips of about 4.3 m. Blending costs slightly more per fragment on a similar area. A/B at Palm Coast: about 0.05 ms throttled.
- **Sharks.**
  - One instanced fin mesh and one instanced body mesh, shared geometry and materials, no shadows. The fin and tail only; the wake and bow pieces were removed at the user's request.
  - They move only inside the island's frame update, and only when the causeway region is within 140 m and on screen. Beyond 220 m they are hidden entirely.
  - Measured: 6 updates per sample when flying the causeway, 0 elsewhere.
- **Islanders.** The 20 cay islanders use the existing sleep rules: no routine beyond 88/112 m, no draw beyond 72/96 m, and off-screen islanders step at 10 Hz. From the main island, 0 are drawn.
- **No new loops, timers or audio.** The heat probe found identical timer and rAF sources to HEAD (only the island loop's rAF).
- **Movement and flight** add a few comparisons per query:
  - `blocked` rejects cay land with a single x test on the main island.
  - The causeway lookup is a binary search on its monotonic x plus a ±30-sample window.
  - The corridor is a 1 m lookup table.
  - Edge sliding (QA fixes, Sep 29 2026): a jetpack step that `flightBlocked` rejects estimates the edge normal from 8 `flightBlocked` samples on a 2 m ring (reused within 0.75 m, so a long slide re-samples every few frames) and moves along the tangent. Free flight is unchanged; the cost exists only while pushing into an edge (node: ~0.5 ms/frame worst case at the cay's east margin, where each `flightBlocked` call is the most expensive). `tests/flight-slide.cjs`.
- **Beach match off screen** (QA fixes, Sep 29 2026). The court's live match (`fieldRuntime`) is dormant whenever it is out of the frustum + 240 m test, at any distance (the main-island pitches keep the radius + 60 m rule). From the cay plaza, looking away, its clock used to run (3.9 s per 8 s); now it is 0, and the idle phone sample there dropped from about 1.5 to 1.0 s CPU per 8 s (headless, not a thermal claim). It wakes the frame the court is in view, exactly where it stopped (`tests/beach-match.cjs` §7, `scripts/check-beach-match-browser.cjs`).
- **Farm job.** Its props join the existing job scene (the label atlas grows to 5 rows for 10 jobs). Nothing runs while the job isn't active.

**Heat audit** (headless Chromium, 390×844 @2x, **CPU throttled 4×**, 6 s samples while steering). HEAD 06d33ac ran from a temporary worktree on :8093 (removed afterwards).

Main island against HEAD (clean run, low machine load):

| View | Draws HEAD → now | Triangles HEAD → now | Render p50 ms HEAD → now | Script ms/6 s HEAD → now |
| --- | --- | --- | --- | --- |
| Island Square | 146 → 148 | 132,424 → 132,504 | 5.2 → 5.0 | 1,725 → 1,581 |
| Community Hall junction (causeway start in view) | 57 → 62 | 30,007 → 31,111 | 2.5 → 2.9 | 818 → 883 |
| Idle, Palm Coast (far from the cay) | 87 → 89 | 144,849 → 144,929 | 3.1 → 3.2 | 1,143 → 1,181 |

New views, measured at the end of the day. Load averaged about 2.6 because another agent's browser was running, so timings read high: the same build's Island Square read 6.8 ms p50 in this run.

| View | Draws | Triangles | Render p50 / p95 ms | fps (30 cap) | Shark updates | Cay NPCs drawn |
| --- | --- | --- | --- | --- | --- | --- |
| Flying the causeway (from the Community Hall) | 76 | 36,044 | 5.2 / 6.3 | 30.7 | 6 | 1 |
| Starfish Sandbar | 55 | 32,964 | 4.2 / 5.2 | 30.5 | 6 | 1 |
| Turtle Sandbar | 74 | 36,670 | 5.2 / 6.1 | 30.5 | 6 | 1 |
| Sharks Beach court | 38 | 54,364 | 4.2 / 5.4 | 30.5 | 0 (bay behind the camera) | 6 |
| Farm | 93 | 141,952 | 5.2 / 6.7 | 30.5 | 0 | 5 |
| Farm job active | 87 | 128,594 | 5.2 / 6.2 | 30.5 | 0 | 7 |
| Hostel neighbourhood | 99 | 119,030 | 5.1 / 7.1 | 30.5 | 0 | 4 |
| Island Square (same run) | 148 | 133,072 | 6.8 / 8.2 | 30.2 | 0 | 0 |

- **Main island.** Draw calls and triangles are unchanged within a few draws. Timings match HEAD in the clean run.
- **On the cay.** Every cay view costs less than Island Square.
- **Frame rate.** Frame interval p95 stayed at about 35 ms (the 30 fps cap) in every view.
- **Remaining costs.**
  - The farm is the cay's heaviest view in triangles (about 142k, comparable to Palm Coast's 145k). Its crops and vegetation are low-poly; phones could trim decorative density through the heat tier if a real iPhone shows it matters.
  - 14 cay signs keep their own canvas materials (one draw each when in view).

**Validation.**
- **Coral Cay test.** `node tests/coral-cay.cjs`, part of `npm test`, covers:
  - area and irregular shape;
  - walk/scooter/bike/moped along the curve and onto both sandbars, banks and deck edges;
  - corridor flight, the red line, and off-corridor blocked;
  - the traced outline matching `flightBlocked`;
  - corridor landings and the landable-deck hook;
  - sharks in open water and the shark model;
  - farm access through its gates;
  - hostel placement;
  - the stable anchors;
  - Law 1 court dimensions.
- **Updated tests:**
  - `tests/night-atmosphere.cjs`: `cay-lamp` sites and cay window batches, main island still 37;
  - `tests/island-jobs.cjs`: the farm job, the 10-job catalog and the new vending positions;
  - `tests/town.cjs`: module loaders.
- `npm test` and `npx tsc --noEmit` pass.
- **Browser checks** (desktop 1280×800 and mobile 390×844):
  - walk and moped the curved causeway, and onto both sandbars and a bank;
  - fly the corridor from the old boundary corner;
  - the south edge stops the jetpack about 70 m from the Turtle bend;
  - the main margin still holds at 50 m;
  - the minimap draws one continuous outline;
  - travel to Coral Cay works;
  - talk to Nia and Coach Marina;
  - the Harvest day job runs end to end and pays out.

These are emulation work counts, not iPhone temperature measurements.

### Coral Cay v3 additions (same day)

This round added:
- causeway street traffic with a one-way roundabout on the cay; its arms flare into the ring as one asphalt surface;
- two extra cars, only when the cay extension exists (11 in total);
- a second Konbini with a varied exterior;
- the Match-day snacks job;
- farm decor thinning on warm heat tiers;
- the beach court moved east onto a continuous beach; the club building was replaced by a scoreboard wall;
- a farm gateway;
- causeway seam fixes: a landfall beach at the cay and tapered shallows ends;
- the south-east sea flight fill (the user's second red line).

**Cost.** Everything is static palette geometry in the existing 50 m batches. The only additions to the draw-call count are:
- 4 instanced farm-decor meshes;
- the 2 extra car meshes;
- the shared shallows material (one more band draw per chunk it touches).

`findLanding` searches up to 360 m, starting at the distance to the nearest land. **Correction (code review, Sep 29 2026):** it does *not* only run on a landing. The parachute called it every frame to re-aim, and the landing preview about every 0.12 s while flying over water. With full rings ≤3 m apart (~630 checks per ring at 300 m) that was about 2.3 ms per parachute frame over open sea on a desktop (worst frame 12.5 ms), several times that on a phone. Fixed the same day:
- the parachute re-aims only after moving 2 m or every 0.25 s (`PARACHUTE_REAIM_METRES` / `PARACHUTE_REAIM_SECONDS` in `jetpackActions.ts`), and the landing preview in `Town.tsx` uses the same budget;
- far from land (>48 m) the search first scans an arc ±48 m wide aimed at the nearest land (minus the gradient of `distanceToLand`, 4 calls), centre first, for 40 rings. If the direction is ambiguous (about equally far from two shores) or nothing there is landable, it falls back to whole rings;
- no ring does more than 64 `canLand` checks (`LANDING_RING_CAP`), so rings are 3 m apart up to r ≈ 30 m and sparser beyond.

Measured in Node (empty obstacle grids, M-series desktop, not a phone; `scratchpad/fix/landing-bench.cjs` from the review fix):

| | before | after |
|---|---|---|
| parachute over open sea at (610, 250), mean per frame | 2.33 ms | 0.027 ms |
| same, worst frame in 20 s | 12.5 ms | 1.07 ms |
| one `findLanding`, 2,124 flyable-water points: mean / p95 / max | 0.55 / 1.45 / 4.1 ms | 0.29 / 0.51 / 2.3 ms |
| landing distance beyond the true nearest landable point (worst) | 2.4 m | 2.6 m |

Landing still finds the East Pier decks, the deep-sea boat deck and the farthest flyable water (~300 m out on an 8 m grid); `tests/east-pier.cjs` covers the far water and the re-aim budget. This is reduced CPU work, not an iPhone temperature result.

Other heat fixes from the same review (reduced work only, validated by node tests and the Konbini browser check, no device measurement):
- **Landable decks:** each deck check does a box reject ((w+d)/2 around the centre) before the trig, since the East Pier decks are always registered.
- **Coral Cay sharks:** a near, on-screen region no longer re-uploads its two instance matrices while frozen (dt 0: map open, lessons) or with static ambience; it re-places once when the reduced setting changes.
- **Coral Cay region gate:** the gate box starts at x 220 (was 230) because chunk `island-chunk-5:-4` reaches x ≈ 226.
- **Konbini tap-to-walk:** an unreachable tap (behind the counter) walks to the closest reachable cell, and a target that stops getting 5 cm closer for 0.5 s is dropped, so the room's loop idles again (`lib/konbini/konbiniPath.ts`). The A* now uses a binary heap and a closed set: a whole-floor search is about 3–16 ms in Node instead of ~60 ms.
- **Konbini music:** a tab hidden and shown while the music is idle stays suspended until the next input; otherwise the idle timer is re-armed.

**Heat audit.** Same method as above: 390×844, CPU throttled 4×, 6 s per view. Other agents' browsers were running at the same time, so treat timings as noisy and compare draw calls.

| View | fps | render p50 / p95 ms | draw calls (before) | triangles |
|---|---|---|---|---|
| Island Square | 23.7 | 21.1 / 26.0 | 147 (148) | 133k |
| Community Hall junction | 29.3 | 12.2 / 16.1 | 64 (64) | 33k |
| Causeway, traffic, mid-route (new) | 30.7 | 11.8 / 15.1 | 65 | 30k |
| Roundabout + Konbini (new) | 29.7 | 16.1 / 22.0 | 56 | 71k |
| Beach court on the east beach, live match playing (new) | 27.5 | 16.9 / 20.5 | 70 | 161k |
| Farm (tier 0, all 106 decor plants) | 29.3 | 13.7 / 16.2 | 90 (93) | 146k |
| Farm job active | 26.7 | 19.3 / 27.2 | 96 (87) | 142k |
| Hostel neighbourhood | 29.0 | 17.2 / 21.1 | 105 (99) | 119k |
| Palm Coast, idle, far from the cay | 30.7 | 12.7 / 15.4 | 90 (89) | 146k |

**Reading the numbers:**
- Main-island draw calls are unchanged: the cay region gate still hides every cay chunk away from the cay.
- The Island Square render-time jump is machine load: its calls and triangles are unchanged.
- Farm decor thinning cuts plants 40 → 20 → 12 per decor mesh by heat tier. It changes the instance count only, with no rebuild.
- The beach-court triangles include the live 5-a-side match (another feature).

## Fishing spots and market stand — September 27, 2026 (local, not deployed; reworked the same day into live in-world fishing)

Five fishing posts, live fishing in the island view, and Rosa's market stand ([details](fishing.md), [visuals hand-off](fishing-visuals-HANDOFF.md)).

**Always present (static).**
- The five posts are one merged, vertex-coloured mesh (one colour draw, one shadow caster).
- The five marker floats are one `InstancedMesh`.
- The stand adds two static meshes and one 512×96 canvas texture.
- One shared `buildingGlow` (kind `cabinet`) moves to the active post, and one (kind `ferry`, scaled) sits on the stand. Both are invisible (no draws) when inactive.

**Idle away from the water.**
- Each frame does about 15 distance checks, plus six ray–box tests on desktop hover.
- The live-fishing visuals (`fishingVisuals.ts`) **do not exist**. They are created when the player comes within 45 m of a spot, and disposed at 80 m once idle.
- Measured in headless Chromium: at the square, the scene has no `fishing-live` or foam objects; near West Cove, both exist.

**Near a spot.**
- The shoreline foam, shallow band and ripple lines are static merged meshes (three draws), visible only within 45 m.
- The marker floats bob only within 45 m, never with reduced motion.

**While fishing.**
- The island loop keeps running as normal, because fishing is not in `settingsRef` and the governor is unchanged.
- Per frame:
  - one state-machine step;
  - rod and line placement (a 12-point line);
  - at most five fading rings, one shadow and one held fish;
  - the camera blend;
  - one label placement.
- The HUD re-renders only on phase changes. The only timeout is the lesson toast.
- Sounds reuse the island sound cues, so no new audio context is created.
- With no taps, the line reels in after three fish swim off.

**Dialogs.** The Fishbook and market stand are lazy dialogs with solid backdrops (no `backdrop-filter`, `tests/heat-pass3.cjs`), and they pause the island like other dialogs.

**Sep 28 2026 expansion (56 species, varied approaches, rarity reeling).** Added runtime cost is only while fishing:
- `planApproach` runs **once per shadow**, not per frame: at most 24 tries of about 60 open-water point checks (each `onIsland` plus `distanceToShore`, early exit on the first dry point).
- Per frame the shadow walks along its stored route (a few additions); no new meshes, materials, textures or draws. Shadow sizes come from the existing `SHADOW_LENGTH` scale (one new `giant` size, 1.9 m).
- While reeling, the world calls `session.handle()` each frame so a pull-back can move the meter; it publishes only when the whole-tap count changes, so the HUD re-renders at most about once a second from a pull, never per frame.
- Idle away from the water: unchanged (no new per-frame work when not fishing). The Fishbook adds 46 small inline SVGs, rendered only while it is open.

These are reductions in work seen in emulation, not a measured iPhone temperature.

## Four book machines and four new pop-up books — September 29, 2026 (local, not deployed)

Four more vending machines (North Beach; the causeway bend before Turtle Sandbar; the Coconut Café and Sharks Beach on Coral
Cay), each selling one new hardship pop-up book: Cafu, Nadia Nadim, N'Golo Kanté and Asisat Oshoala
([details and sources](books-2026-09-29.md)). **Added runtime cost:**
- **Machines:** four more merged meshes in the existing `vending-machines` group (one colour draw and one shadow caster each,
  frustum-culled, <800 vertices), on the same shared `MeshStandardMaterial` and the same 1024² atlas (their glass tiles use the
  atlas's free third row), the same shared hover glow and Go prompt. No new material, texture, light, loop or timer. Idle frames
  do 12 distance checks instead of 8. Coral Cay positions are computed once at module load from Coral Cay's anchors
  (`lib/town/vendingPlaces.ts`).
- **Measured** (`scripts/check-vending-browser.cjs`, desktop Chrome): +1 draw call at Island Square (226 vs 225), idle
  `update` 0.54 µs, idle `applyCamera` 0.04 µs. At each new machine (`scripts/check-book-machines-browser.cjs`): the island with
  vs without the machines is +1 draw call everywhere (desktop 65/90/80/51, phone 77/48/56/39 at North Beach / causeway /
  café / Sharks Beach).
- **Books:** spreads load lazily per book (`library.loadSpreads`, one chunk each), same plate density (150/112 px per unit),
  12–28 pieces per spread. In the reader while Coach Bella narrates page 2: 31–34 draw calls, 100–106 triangles, 81–90 live
  textures (current spread plus the prefetched neighbour), against 31–32 draw calls and 76–110 textures for the existing Davies
  and Weah books measured the same way. Paper frames stop when narration is paused and the island stays asleep (0 island frames),
  checked in both viewports.

Emulation only (desktop Chromium and 390×844 touch emulation); not measured on an iPhone.

## Island vending machines — September 27, 2026 (local, not deployed)

Eight vending machines replace the Store ([details](vending-machines.md)). **Added runtime cost:** one merged, frustum-culled mesh per machine (one colour draw, one shadow caster, ~280 vertices). All eight share one `MeshStandardMaterial` with one 512×1024 canvas atlas used as both map and emissive map, so the lit sign and shelves need no lights. One `buildingGlow` (kind `vending`) is shared and moved to the targeted machine. Idle frames do eight distance checks, plus eight ray/box tests only while a desktop pointer hovers. Measured 0.39 µs per idle `update` and 0.03 µs per idle `applyCamera`, and +1 draw call at Island Square (197 vs 196), all in desktop Chrome with `scripts/check-vending-browser.cjs`. The glow, prompt placement and camera blend run only while a machine is targeted, fading or zooming. The dialog keeps the old Store's pause (`storeOpen` in `settingsRef`), uses no backdrop blur, and its only motion is a one-shot 0.9 s dispense drop. Miniatures render once per visit in one temporary context. Not measured on an iPhone.

## Arcade bean-motion integration — September 26, 2026 (local, not deployed)

Game-developer pass across Breakaway, Tennis, Pinball and Strikers preserves the bean shader/mesh architecture and shared island solver. The adapter now carries latched strike targets, action kind and power, authored dive/jump/skill channels, and state-driven face expressions. Game simulations still own ball release and root travel. Breakaway removes manual post-solver tackle rotations and hidden-classic role materials; visible bean outfits update on pooled role changes. Pinball reuses save structs and updates world matrices only when locating a downed player's star anchor. Strikers differentiates pass/shot/save and resets rig channels on retry. No new render loops, effect pools, lights or geometry. See [the integration review](arcade-bean-review-2026-09-26.md) for evidence and limitations. Mobile browser checks are emulation, not measurements of physical phone heat.

## Card film stall on a real iPhone (deploy 3) — September 26, 2026

Evidence: a Safari Web Inspector timeline of the live deploy-3 build, the Nadine Angerer film at 385–420 s. From about 391 s the film's rAF chain stops re-requesting frames (0–2 `animation-frame-requested` per 5 s, against ~55 before). Rendering frames last 0.8–6 s with composites up to 1.3 s, while WebContent CPU is ~6%. So the film was not drawing at all; rAF was not throttled, and the island's WebGL loop was already asleep. Root cause, reproduced in Playwright WebKit: the card's picture window changed height whenever the caption wrapped to a different number of lines (3 resizes in 12 s), and every resize reallocated the film canvas and its four plate canvases. With DPR-2 surfaces, iOS's lazily released canvas memory and the island's WebGL canvas, that churn stalls compositing. A plate canvas iOS refuses (null 2D context) threw in `paint()` outside its try, which ended the rAF loop silently while Stop still showed. Fixes: a fixed four-line caption box (`.filmBio p{height:5.6em}`), so the window keeps one size for the whole film (1 resize, at the start); `CardFilmPlayer` paints through a guard that frees the plates, steps the DPR down (1.5, then 1) and retries, ending the film cleanly after four failures in a row; `releaseSheet()` frees plate memory on resize and stop, and the visible canvas is zeroed on unmount; phones and tablets (coarse pointer) cap the film at DPR 1.5 (desktop 2, within heat-pass-4's `filmDprCap()`); animations under a playing film are paused (`.window:has(>canvas[data-card-film]) :not(canvas)`). The iterating CSS animations in the recording are the rest-timed scenery and HUD loops, which the user's taps during the film kept waking. Verified: WebKit iPhone emulation draws ~18.5 frames/s at DPR 1.5 with a stable canvas; riso output unchanged (190/190 frames); 360 film tests, cards e2e 4/4 and iconic-play UI green. Still to confirm on the device.

## Card film sharpness: DPR 2 and "dots off the action" — September 26, 2026 (for deploy 3)

User: the card stories looked blurry; the halftone dots were the main cause. Card films now print with `DotMode` 'action' (`lib/paths/riso/sheet.ts`, set per canvas by `CardFilmPlayer` via `setSheetDots`; `?dots=riso|off|action|fine` switches and remembers it for comparison). In 'action' mode these tints print flat: figures (`drawAthlete`/`groundShadow`/`motionSmear` raise `sheet._flat`), every ribbon, helper-built shapes under a fifth of the short side (bounds recorded in `pathExtent` by `polyPath`/`circlePath`/`rectPath`/`ribbon`/`crescent`), the two lightest levels (nets, mist, shadows) and paper knockouts. Large fields keep a fine, low-contrast screen (60% flat tint plus about 1.6 css px dots). Speckle is 0.55×, grain 0.8× and registration 0.7× of the spec, and plates register on whole device pixels. Path stories stay classic 'riso' (the bible's halftone art direction at full-screen size) and are pixel-identical to before. The card canvas cap is DPR 2, stepping down once to 1.5 if drawing holds under 17 fps over a 2 s window (a pause restarts the window). Measurements: DPR 3 was too heavy in phone emulation (14–18 fps and 39–82 long tasks for Banks, Rossi and Güler); DPR 2 is in the DPR 1.5 range. In WebKit (script plus raster), 'action'@2 took p50 17–21 ms against riso@1.5's 22–24 ms, because flat fills are cheaper than pattern fills. Comparison sheets (original, A dots off, B action, C fine) were reviewed by the user, who chose B. Tests: tsc, npm test, 360 film tests, 0 seam diffs (22 stories), cards e2e 4/4, iconic-play UI green. `tests/iconic-play-ui.cjs` now waits for the card's turn to settle (`turnSettled`) instead of a fixed 300 ms: a phone flip takes 950 ms, and a face caught mid-turn has no rendered text. The old wait failed on a loaded machine with the pre-round code as well.

## Card Play Moment films ("a little laggy") — September 26, 2026 (local, not deployed)

Profiled in headless Chrome, phone emulation (390×844, DPR 3, 4× CPU throttle) and desktop 1280×800. This is emulation, not an iPhone. What was already right: canvas 426×530 backing store for a 284×353 css window (DPR cap 1.5), one rAF loop, draws capped at 24 fps (20 fps at 60 Hz), the island's loop asleep (`holdVideoPlayback`), the card tilt off during a film, no per-frame `getImageData`, filters or `shadowBlur`. What was wrong:

1. **Whole-document style recalcs under the film.** Every caption change re-rendered `PlayerCard`; `PlayerArt` then remounted ~50 SVG groups of its print (`FigureValues` defines its parts inline), and the caption swapped its `<mark>` in and out. Each node insert/remove under `<body>` trips the page's `body:has(…)`/`.town-app:has(…)` rules into a recalc of all ~3,400 elements: 35–135 ms each at 4×, about once a caption. Fixed in the card host: the portrait element is memoised (`useMemo`), and the caption always has the same three nodes (text, mark, text, with a zero-width space for an empty part; an unused mark is `data-empty`, hidden), so a cue only rewrites text. In a 14 s trace there is now no big recalc after the first second. Follow-ups the same day: `FigureValues` in `PlayerArt.tsx` now calls its paint parts as plain functions instead of defining components in render, so the portrait never remounts on a parent re-render anywhere (print-SVG markup and pixels of 5 drawn portraits identical); ModalShell's header rule matches `:has(button[data-navigation=back])` instead of `aria-label^="Back"` (every Back there is a `BackButton`), so label changes such as Play → Stop no longer recalc the whole page. Still open: the scenery-rest `data-scenery` toggle (`body:has([data-hud-triggers][data-scenery…])`) costs one such recalc; a film start pays ~2 for inserting the canvas and caption. Ricardinho's small in-app gain (41→38 missed vsyncs) was machine load (load average ~30); on a quiet machine, back to back: 6/11 → 3/1, garbage 57→42 MB/s. It is the lightest of the six films; nothing specific to it.
2. **The film's JS scene building** (~75% of the main thread at 4×; athlete figures ~35–50% of it). Engine-level, pixel-identical: `key`/`keyPath`/`camKeys` read padded key values in place instead of re-padding every key list per call (was up to 13% of a frame); `ribbon` computes its `smoothPts → wob` centreline and edges in reused flat buffers; the athlete `hull` uses a comparator-free stable merge sort (~2×). `sheet.ts`: halftone/speckle/grain/mottle tiles are drawn once per session and shared by all films (a new film no longer rebuilds them on its first frames); pattern transforms are set once per transform change instead of per fill (getTransform + inverse + setTransform per fill: 80–110 → ~20 per frame); knockout/speckle/multiply skip a plate that is still empty. `CardFilmPlayer` checks the caption on drawn frames (not every display refresh) and splits each narration into sentences once.

Validation: 190 frames of 19 films/stories at fixed timestamps are pixel-identical before/after (max channel diff 0); `review-riso-story.mjs` 0 seam diffs (22 stories); `tests/riso-engine-perf.cjs` compares the fast paths with the originals (278k exact comparisons). Same-page interleaved A/B of the engine alone: Chrome 1.14× (Banks 1.46×), WebKit 1.20×. In-app phone emulation, 10 s per film, before → after: missed vsyncs Messi 37→9, Zidane 43→4, Ricardinho 41→38, Banks 219→49, Rossi 140→40, Güler 74→9; long tasks 41 (3.2 s) → 14 (0.9 s); paint p95 25→22, 16→12, 18→15, 44→30, 38→25, 30→22 ms. Desktop was already smooth (paint 5–8 ms). Not tried: lower card DPR (WebKit raster cost did not change between DPR 1 and 1.5, it is path-bound), rendering in a worker (OffscreenCanvas; bigger change). Baking paper/bands/grain stays rejected (pass 2 row 9).

## Bean character skin (lane A) — September 25, 2026 (local, not deployed)

The bean characters (`docs/bean-characters/CONTRACT.md`) are a skin on the unchanged motion solver: `lib/graphics/beanSkin.ts`, `beanLook.ts`, `characterStyle.ts`, extended `playerBatch.ts`, and the hook at the end of `createPlayer`. `?characters=classic` renders the old body, for A/B comparisons in the browser.

**How it stays cheap.**
- **Four meshes per character**, shared by every rig: body, limbs, hair and hat. The same geometry, programs and textures serve every rig.
- **Body.** One bean geometry covers every build. The shape and the weighted lumbar/chest bend are evaluated in the vertex shader. The body fragment shader paints the kit bands, the face (one shared 1120×640 face atlas, a cell chosen per character) and the back number (the existing shirt digit atlas). The face and number cost no extra draw, and both fade out when tiny, like the jersey numbers.
- **Limbs.** Four noodle tubes, two mittens and two boots in one geometry. The tubes are bent in the vertex shader from the solver's shoulder/elbow/hand and hip/knee/ankle joints along a straight → arc → straight curve that cannot cusp. Thumbs vanish when the character is under about 34 px tall.
- **Hair and hats.** Every style lives in one geometry each; the selected style keeps its vertices and the rest collapse outside the clip volume. Hair casts no shadow.
- **Per-character data** is a 46-texel row:
  - An individually rendered rig sends it as a uniform array. three.js caches it, so it is re-sent only when it changes, with no texture upload.
  - `playerBatch` gives each bean batch two float textures with one row per instance (`gl_InstanceID`). The appearance texels (colours, face cell, number, shape) re-upload only when a look changes. The pose texels (2 per body/hair/hat row, 30 per limbs row) upload each moving frame: about 18 KB per frame for 32 characters, instead of about 50 KB with a single texture.
- The pose row is refreshed once per render (`onBeforeRender`/`onBeforeShadow`, guarded by the renderer frame) or by the batch after its `updateMatrixWorld`. That is about 16 matrix reads per character, with no new loop or timer and no per-frame allocation.

**Measured (emulation, not iPhone temperature).** Setup: dev server :8092, headless Chrome with ANGLE/Metal on the Mac. Phone profile: 390×844, DPR 3, touch, 4× CDP CPU throttle. Desktop: 1280×800, DPR 1. Values are medians of five alternating classic/bean runs of 60 renders each. "Town" is the app's own camera after load; "live 11v11" is the match camera over the 11v11 pitch with the simulation stepping. Draw calls and triangles include the shadow pass. Timings are one `renderer.render()` call (CPU), and the same plus a 1-pixel `readPixels` sync (GPU finished).

| View | Style | Draw calls | Triangles | render() CPU | render + GPU sync |
|---|---|---:|---:|---:|---:|
| Town, phone | classic | 353 | 114k | 15.0 ms | 20.9 ms |
| Town, phone | bean | **213** | 118k | 11.0 ms | 16.5 ms |
| Live 11v11, phone | classic | 106 | ~178k | 10.5 ms | 14.6 ms |
| Live 11v11, phone | bean | **98** | ~189k | 7.1 ms | 11.7 ms |
| Town, desktop | classic | 687 | 311k | 4.2 ms | 9.7 ms |
| Town, desktop | bean | **416** | 334k | 2.9 ms | 8.2 ms |
| Live 11v11, desktop | classic | 247 | 319k | 2.2 ms | 6.9 ms |
| Live 11v11, desktop | bean | **189** | 345k | 2.2 ms | 7.4 ms |

- 32 characters in one batch (`tests/bean-skin.cjs`, real `renderer.info`): classic 21 draws (colour + shadow), bean 5.
- Town draw calls fall about 40%: an individually rendered NPC is 4 draws instead of about 18 merged classic meshes. Live-match draws fall 8–23%; the rest of the scene dominates that view.
- **Tradeoff:** counted triangles rise 4–8%. `renderer.info` counts the hair/hat styles that are collapsed and never rasterised. Per character, the rasterised cost is about 1.9k (body) + 3.0k (limbs) + one style's 0.25–1k triangles, against about 6.8k classic.
- The run-to-run spread was large (machine load about 2–12, other agents building). Treat the timing columns as "not worse", not as a measured saving.
- Validation: `tests/bean-skin.cjs` (below), plus tsc, `npm test` and the player, shirt-number, choreo, live, heat and frame-cap tests in their default (classic Node) fixtures.
- Headless Node, and fixtures that only mock `document`, keep the classic body so the existing mesh-count tests keep their fixtures. With bean forced in, every motion test passes. Only the classic-geometry counts differ (batch counts, jersey morph texture, classic number panel).
- `player-body-review`, `movement-work`, `live-knockout-work` and `volleyball-batch` fail identically in classic style. They fail from earlier or parallel work: `live-knockout-work` already showed `13 !== 14` at 13:41 today, before this lane.

## Player pop-up books: all eight books — September 27, 2026 (local, not deployed)

Seven more books share the Messi engine. Nothing new runs while a book is closed.

- **Loading:** each book's spreads are a separate chunk (`lib/books/library.ts` `loadSpreads`), imported only when that book opens. Narration manifests are small JSON files, and the audio is fetched only after Play.
- **Plate density:** plates paint at 150 px per world unit on desktop and 112 on phones (`createPlateCache(px)`), to cut paint time and texture memory on phones.
- **Build time:** measured build per spread (desktop Chromium, warm JIT, `data-build-ms`) is about 200–290 ms. Builds happen at open, and during idle prefetch of the next page after each turn. A backward turn to a page that isn't prefetched builds during the turn.
  - Falcão's author measured 560–820 ms cold, first spread; Messi was 340–460 ms measured the same way.
  - Real phone CPUs will be slower. This has not been measured on an iPhone.
- **Frame behaviour is unchanged:**
  - bounded open, turn, close and action tweens;
  - at most 30 fps while narrating;
  - zero frames at rest or while paused (browser checks for Messi).
- **Disposal:** everything is released on close.

## Pop-up book: seamless end of page turn — September 28, 2026 (local, not deployed)

The user saw a glitch at the end of each page turn on an iPhone (Chrome iOS). Per-frame canvas readback in WebKit (iPhone 15) and Chromium showed two causes, both in `components/PlayerBookScene.tsx`:
- **Old scenery bleeding through the landing leaf.** The old spread lies flat under the descending leaf. Its brad arms and flaps sit about 0.013 above the page, the same height as the leaf's lift, so they poked through the leaf for the last ~100 ms. They vanished on the final frame when the old spread was hidden (final-frame diff 8–23, against about 1 for the frame before).
  - **Fix:** once the leaf is within ~3.6° of the page (`LANDING`), the old spread is hidden and the page underneath takes the new print. The leaf covers both at that point.
- **Camera and action snap on a revisited page.** During the turn the new spread was posed at rest with no action. The idle frame then applied the page's action state and camera focus, for example a focus of 0.6 on phones: the frame diff was 129.5 and the camera jumped 5.7 units.
  - **Fix:** the new spread is now posed with its settled beat throughout the turn. The camera eases from the old page's focus (`focusFrom`) to the whole spread, and then to the new page's settled focus. The old frame-compounding `aim(view.focus*…)` decay is gone.

Two turn-start stalls were also removed:
- **Music-box phrase.** `lib/books/bookAudio.ts` synthesised the new page's phrase inside the first frames of a turn: ~110 ms in V8 and ~600 ms in WebKit headless. It now uses a phasor recurrence and shared envelopes, which is about 20× faster (~2 ms) with a maximum sample difference of 1.5e-8.
- **Texture uploads.** Idle prefetch now uploads the prefetched spread's textures with `renderer.initTexture`, so they no longer upload on the first turn frame.
- **Prefetch direction.** Prefetch picks the neighbour in the reading direction: the previous page after a backward turn. It still keeps at most one neighbour resident.

**Known gap:** the first backward turn after reading forward still builds that spread on tap, before the turn starts, so the turn itself doesn't jump. That build took 1.1–2.3 s in headless WebKit, which uses a software canvas. Safari has no `requestIdleCallback`, so its prefetch uses the 400 ms timeout fallback.

**Test-only trace:** `window.__bookTrace`, when a script installs it, receives per-frame state. Nothing runs without it.

**Heat rules unchanged:** frames are drawn only while paper moves, capped at 30 fps while narrating, and everything is disposed on close.

**Evidence:** frame strips and logs are in the session scratchpad `book-turn-glitch/`. Captures covered WebKit and Chromium at 390×844, 844×390 and 1280×800, across the Messi, Falcão, Marta and Pelé books, turning forward, back, onto a revisited acted page, and while narrating. No end-of-turn spikes remain. Not measured on a physical iPhone.

## Messi pop-up book: paper engine — September 27, 2026 (local, not deployed)

One WebGL context exists only while the book is open. It uses DPR ≤1.75 on desktop and ≤2 on phones, no tone mapping and no post-processing.

- **Shadows:** one PCF soft shadow map from a directional light, 2048 on desktop and 1024 on phones.
- **Draw calls and textures:** about 50–65 draw calls and 140–170 triangles. Each cut-out is one alpha-to-coverage plane, and the current spread plus one idle-prefetched neighbour stay resident. 29–45 textures were measured across the six spreads, and the count did not grow over repeated turns.
- **Frames are drawn only while paper moves:**
  - opening 2.1 s;
  - turn 3.0 s;
  - close 1.0 s;
  - action tween 0.9 s.
  - These run at up to 60 fps. They are bounded. (The close fold was shortened to 0.6 s on Sep 28.)
  - While narration plays, frames run at ≤30 fps.
  - Otherwise one frame is drawn per seek, resize or visibility wake. The browser check measured 30 renders/s playing and 0 paused.
- **Plates:** Canvas painting runs once per spread (tens of ms), not per frame. Plates are ref-counted and disposed with their spread, and everything is released on close, including `forceContextLoss`.
- **Reduced motion:** transitions are instant, and narration beats snap per sentence without a loop.
- The island stays asleep behind the reader (browser-checked).

This is not an iPhone temperature measurement.

## Manhole ball hunt — September 25, 2026 (local, not deployed)

Twenty-five football manhole covers, one at every `world.roadJunctions` centre, each hiding a Ball hunt ball (55 → 80) opened only by flying over and dropping onto it (`lib/graphics/manholeCovers.ts`, `coinHunt.ts`, data in `coinQuest.ts`, 25 "from above" lessons in `ballHuntLessons.ts`, tests `tests/manhole-balls.cjs`). **Added runtime cost:** three instanced draws (rims, covers, glints; the glint mesh is hidden unless a flyer is within 45 m of an unfound cover), one baked 128² colour and bump `DataTexture` shared by every cover, receive-only shadows, no colliders. Per frame there is no new loop: arming, glint and hint checks run inside the existing ball-hunt proximity loop, and matrices upload only during a 0.6 s one-shot opening tween or when a glint toggles. The glint mesh has `frustumCulled=false` because its instances start at zero scale. Not measured on an iPhone.

**September 28, 2026 (local, not deployed):** the Sep 26 "walk or ride onto it" shortcut was removed at the user's request. Only a flight drop opens a cover: `land(p,true)` from the jetpack or parachute touchdown, inside 3.5 m, after the flyer armed it by passing over above 2.5 m. Walking, scooter, bike, moped, the truck, ramp landings, roof falls and a grounded jetpack leave it closed, and the ground hint now says "Fly over it, then drop down onto it to open it." Removing it drops a per-cover branch from the proximity loop; nothing new runs per frame. Tests: `tests/manhole-ride.cjs` (in `npm test`), `tests/manhole-balls.cjs`.

## Heat audit — September 25, 2026 (local, not deployed)

User report: "the phone is still warm at times." This section covers reduced work measured in emulation. It is **not** a measured iPhone temperature drop.

**Method.** Dev server :8092, headless Chrome (Playwright), phone profile 390×844 DPR 3 with touch and a 4× CDP CPU throttle, machine load about 2. An init script counts rAF callbacks (attributed by callback), WebGL/2D draw frames per canvas, timers, live WebGL contexts, AudioContext states and playing media. CDP `Performance.getMetrics` gives Script/Task/Style/Layout ms per second. A trace gives compositor swaps (`Display::DrawAndSwap`), Paint and GPU `FinishPaintRenderPass` time per 4 s window. Scripts are in the session scratchpad under `heat/` (`lib.mjs`, `s1`–`s4.mjs`, `hudab.mjs`, `bottleab.mjs`, `strikers.mjs`, `prof.mjs`).

**Already quiet (no change needed):** the island sleeps (0 frames, 0 rAF) behind Paths, the binder, the card viewer, the arcade menu, Pass Puzzles, the card offer, a waiting or answered quiz, a draw-the-pass aim and a story film. The binder, the card viewer (after its 6 s scenery rest) and Paths all measure 0 swaps at rest. Pass Puzzles renders nothing on its level list, brief, aim or result, and about 28 fps only while the ball flies. Backgrounding stops island renders and suspends audio. In a CPU profile of live 11v11 watching, choreo took 6 ms of 7.5 s. The 3D shirt numbers are one instanced mesh (22 instances) with no per-frame upload. Island DPR 2 / 30 fps, story and arcade DPR 1.5, bottle DPR 2.

**Implemented.**
1. **Bottle wave grain moved out of the per-frame canvas** (`components/IslandBottle.tsx`, `IslandBottle.module.css` `.waveGrain`). The 24 fps loop had filled the whole 780×1688 canvas with a `multiply` grain pattern on every draw. An A/B with only that fill skipped showed it was about 90% of the scene's main-thread time. The grain is now one static CSS layer (`mix-blend-mode:multiply`, opacity .36, the same image at the same CSS-pixel scale and origin). JS clips it to the drawn water with `clip-path`, writing only when the edge moves (during entry and exit).
   - Parity: reduced-motion settled frames before and after differ by at most 8/255, mean 0.41, 0 pixels over 24. The mid-entrance frame was checked by eye.
   - Bottle floating: TaskDuration 784–866 → 29 ms/s. Script 5–7 → 3–4 ms/s. Swaps unchanged at 20/s. GPU pass 3.3–8.8 → 6.2–6.6 ms per 4 s.
2. **Bottle loop stops with its dialog.** Escape (or Android back) with the quote showing closed Paths itself. The bottle stayed mounted with a zero-size canvas, its rAF chain ran on at 60/s behind the island, and the ocean event never ended. Now the loop stops on a zero-size canvas and restarts on resize, and the bottle closes when its host `<dialog>` fires `close`. After Escape: 60 → 0 wave rAF/s.
3. **Covered Paths art rests under the bottle** (`lib/sceneryRest.ts`). Taps inside the bottle (an in-page `[role=dialog][aria-modal=true]` inside the Paths `<dialog>`) woke the hidden landing art and the badge colour repaint behind it. The cover check now includes in-page modal layers. Quote showing: 5 → 0 running loops, TaskDuration 853 → 11.5 ms/s. The card viewer's own scenery is inside its modal layer, so it still wakes normally.
4. **HUD loops pause under Island Strikers** (`components/LiveArcadeMatch.tsx` `data-fullscreen-game`, `IslandSettings.module.css`). Strikers is a full-screen `<section>`, not a `<dialog>`, so the Paths button shake, sparkle and icon cycle (and the field prompt pulse) kept the compositor at 60 fps under it. Portrait "turn sideways" screen: 59.9 → 0 swaps/s, GPU 10.7 → 0 ms and paint 15.8 → 0 ms per 4 s, 7 → 0 animations. Landscape play is now 31.5 swaps/s at its 30 fps loop.
- Tests: `tests/heat-idle.cjs` (new, source checks). `tests/card-rewards.cjs` has its scenery-guard regex updated. `tsc`, `npm test`, bottle-motion, bottle-audio, frame-cap and lighting-idle pass.

**Approved follow-up, implemented the same day (user approved proposals 5–8).** Before and after use the same scripts and the same phone profile (`heat/hudrest.mjs`, `offer2.mjs`, `s2.mjs live`). The load average was about 2.5.
5. **HUD loops and field prompt pulse rest 6 s after the last input** (`components/IslandSettings.tsx` `useSceneryRest(triggers, hudRest, hudSettle)`, `IslandSettings.module.css` `.hudRest`, `app/globals.css`).
   - Any pointer, wheel, key or focus event wakes them.
   - `useSceneryRest` gained an optional `settle(el)` delay. The HUD uses it to freeze only between swaps and shakes (250–2350 ms into the button's 3 s cycle), so a rest never shows a half-blurred icon or a tilted button.
   - The sparkle dots fade out (a 0.5 s `filter:opacity(0)` transition) instead of freezing mid-fade.
   - The field card's pulse pauses via `body:has([data-hud-triggers][data-scenery=rest])`. Only the pulse pauses; the entry fade keeps running.
   - Checked across four rests: one icon fully shown, `transform:none`, 0 running animations. It wakes on a pointer move and rests again after Paths closes.
   - Island idle by the pitch, 8–17 s after input:

     | | Before | After |
     |---|---|---|
     | Swaps/s | 60 | 30 |
     | GPU per 4 s | 42–49 ms | 3.9–4 ms |
     | Paint per 4 s | 61–68 ms | 0 |
     | Style | 59–61 ms/s | 0 |
     | TaskDuration | 526–558 ms/s | 366–380 ms/s |

   - The first 4 s after input (loops awake): GPU 50 → 20 ms per 4 s, mostly from change 6.
   - Trade-off: the discoverability loops stop while the child is idle and restart on the next touch or key.
6. **Field card: no backdrop blur.** `rgba(244,232,193,.95)` replaces `.86` plus `blur(6px)` (the hover state already used .95). Card crops before and after: mean difference 3.1/255, 0.16% of pixels over 24 (the scene behind shows through slightly less).
7. **Pick-a-card stars rest** (`CardOffer.tsx` `Sparkles` with `useSceneryRest`, `CardOffer.module.css` `.sparklesRest`).
   - The 18 stars freeze on their current frame (still visible) 6 s after they appear or after the last input, on the deck and around the revealed card. Arrows and pointer moves wake them.
   - The reveal's scenery-pause rule now excludes `[data-sparkles]`.
   - Deck at rest and reveal at rest: 60 → 0 swaps/s, 13–17 → 0 ms GPU per 4 s.
8. **No lesson-beat timer without a lesson** (`FieldLearning.tsx`: `FieldVisualBeat` is hidden while `!chosen`).
   - Live watching: 3 intervals at 11 wakeups/s → 2 at 2.5/s.
   - The beat still appears once a play is chosen (browser-checked).
- Gates: `tsc`, `npm test`, `tests/heat-idle.cjs` (extended) and `tests/card-rewards.cjs` pass, with two source regexes updated for the new selectors. `lighting-idle` also passes.

**Still open (not implemented):**

| Cause | Measured cost | Option |
|---|---|---|
| Arcade `renderer.dispose()` without `forceContextLoss()` | The WebGL context lingers until GC after leaving a game (memory, not per-frame work) | Not safe in the shared stage: Pass Puzzles and ArcadeGame3D reuse their React canvas (and Strict Mode remounts), and a lost context would break the next renderer. Only safe where the canvas is created fresh (Strikers). |
| `FieldTranscript` refreshes the live match summary at 2 Hz | 2 small re-renders/s while watching | Minor; left as is. |
| Riso story film: one offscreen plate canvas per ink plus the visible canvas, both about 20 fps | TaskDuration 148 ms/s, 25 swaps/s | Engine-owned art pipeline; no change. |

Notes: the second island WebGL context seen in dev is React Strict Mode's discarded first mount (dev only). Flight was not touched; another agent owns the flight files.

## Heat audit pass 2: 3D rendering — September 25, 2026 (local, not deployed)

**These are emulation measurements, not iPhone temperatures.** Reduced work in headless Chrome on a Mac does not prove a cooler phone. The desktop GPU also switches clock states during a run, so the same frame can take 1.6 or 2.7 ms. Only interleaved A/B runs in the same session are compared below, and effects smaller than about 10% are called "not measurable".

**Method.** Dev server :8092. Headless Chrome (Playwright), 390×844 CSS at DPR 3, touch, and a 4× CDP CPU throttle (1× for the parity and capture scripts). Load average was 2–5.
- A wrapper around `renderer.render` counts colour and shadow draw calls and triangles per frame, since three's own `info` resets after the shadow pass.
- It also records the CPU time inside `render()`, the time of Town's `animate()` callback, and `EXT_disjoint_timer_query_webgl2` GPU time for the shadow pass and the colour pass.
- CDP `Performance.getMetrics` gives task and script ms/s. Traces give swaps and GPU passes. The CDP sampling profiler gives per-function costs.
- Scripts are in the session scratchpad under `heat2/`:
  - `lib2.mjs`, `scen.mjs`: the per-scenario measurements.
  - `prof.mjs`: CPU profiles.
  - `calls.mjs`: draw calls broken down by object.
  - `ab.mjs`: interleaved A/B of render settings.
  - `parity.mjs`: same-frame pixel diffs.
  - `tod.mjs`: time-of-day switch hitches.
  - `shots.mjs`, `compose.py`: proposal screenshots.
  - `story.mjs`, `riso-perf2.mjs`: the film.

**Baseline per scenario** (before this pass; GPU is the median per rendered frame; the island renders at 30 fps):

| Scenario | Draw calls, colour / shadow | Triangles, colour / shadow | `render()` CPU | `animate()` | GPU shadow + colour | Task ms/s |
|---|---|---|---|---|---|---|
| Idle hover at spawn | 380 / 356 | 120k / 137k | 7.8 ms | 11.4 ms | 0.98 + 4.29 ms | 418 |
| Flying (default cruise, heads out over the sea) | 119 / 108 | 44k / 54k | 4.2 | 6.8 | 0.90 + 3.06 | 311 |
| Beach and ocean, hover / flying | 292 / 230 · 285 / 322 | 230k / 239k | 6.0 · 8.1 | 9.6 · 11.5 | 0.78 + 2.97 · 1.22 + 4.49 | 303 · 447 |
| Walking idle / running in town | 300 / 354 · 245 / 353 | 96k / 139k | 6.7 | 9.7 · 9.9 | 1.01 + 3.53 · 1.02 + 3.76 | 321 · 371 |
| Moped driving | 180 / 246 | 55k / 94k | 5.8 | 8.5 | 0.99 + 3.58 | 315 |
| Live 11v11, watching (isolated field view) | 35 / 12 | 162k / 151k | 0.9 | 3.4 | 0.84 + 2.86 | 117 |
| Night, idle / flying | 390 / 356 · 124 / 106 | same as day | 7.6 · 4.4 | 11.2 · 6.8 | 0.98 + 4.41 · 0.89 + 2.98 | 403 · 298 |

- Pass Puzzles: 0 frames on its level list, aim and result. About 28 fps only while the ball flies (task 151 ms/s, GPU passes 1.4 ms per 4 s).
- A story film (Love Futsal): 20 fps canvas, task 90–129 ms/s, script 66–89 ms/s, GPU passes 4–5 ms per 4 s.
- Render resolution:
  - The island draws 780×1688 into a 390×844 canvas: DPR is capped at 2 on a DPR 3 phone.
  - `FrameBudget` is constructed in Town but never sampled, so there is no dynamic resolution.
  - MSAA (`antialias:true`), ACES tone mapping, no fog, no postprocessing.
- Shadows:
  - One 2048² PCFSoft sun shadow map. `autoUpdate` is on (the mobile framebuffer shadow cache stays disabled; see the rejected experiments).
  - The frustum is fitted per elevation to about 268 × 99 m.
  - 4 spot lights never cast shadows.
- Programs: 23 in the day and 36 after visiting night.
- Frame cap: the 30 fps slot cap holds. Frames are skipped entirely only when nothing is alive (menus, quizzes, aim). An idle hover is not unchanged: townsfolk, traffic, water and matches keep moving.
- GC: 1.9 ms/s of garbage collection while walking (4×). Per-frame allocation churn is not a measurable cost.
- Audio: 0 oscillators and 0 buffer sources while hovering or walking idle. (Corrected in pass 4: the shared context actually stayed running for the whole visible session; it now suspends when nothing is audible.)

**Ranked findings** (idle hover unless noted; savings are per rendered frame at 30 fps):

| # | Scenario | Cause | Measured cost | Estimated saving | Visual risk | Status |
|---|---|---|---|---|---|---|
| 1 | All daytime and sunset island views | 4 pooled pitch spot lights kept at intensity 0 by day, but still evaluated in every lit fragment | Colour pass 4.3 → 2.8 ms; forcing them on in a frozen frame costs +54% | −18% to −35% colour-pass GPU | None (same-frame diff ≤ 17 px at 1/255) | **Implemented** |
| 2 | Resolution, all island views | DPR 2 cap on DPR 3 phones means 1.32 Mpx | 1.5 → 0.74 Mpx (−44% fragments) | −6% to −25% frame GPU in emulation; likely larger on a fill-bound phone GPU | Softer edges and text on signs | **Proposal A** |
| 3 | Idle, walking | NPC walkability checks: the rooftop landing surfaces wrapped every static roof prop in getters, so the obstacle grid scanned them all on every query | `canTravel` 37.9 ms/s (4×), 9% of `animate()` | 37.9 → 19.0 ms/s; `islandNpcs.update` 61 → 50 ms/s | None (20,000-point parity) | **Implemented** |
| 4 | All | Shadow pass CPU: 356 depth draws/frame, mostly the 25–45 meshes of each townsperson rig | 1.6 ms of `render()` CPU (21%) + 1.0 ms GPU | See #5 and proposals B/D | — | Partly addressed |
| 5 | Beach, town edges | Moving shadow casters (rigs, rides, cars) whose shadow cannot reach the view were still drawn into the shadow map | 0–26 extra shadow draws/frame | 0–5% of draws | None (0 px diff, 6 views) | **Implemented** |
| 6 | Shadows | 2048² PCFSoft map | 0.98 ms | −0.26 to −0.4 ms with 1024² | Blurrier shadows | **Proposal B** |
| 7 | Scenery materials | `MeshStandardMaterial` on all static scenery | — | Not measurable to −16% colour (inconsistent between runs) | Flatter shading | **Proposal C (weak)** |
| 8 | Characters | Tiny parts (hands, elbows, ponytails) cast their own shadows | About 70 shadow draws/frame | No measurable GPU change | Missing hand shadows up close | **Proposal D (weak)** |
| 9 | Story film | The riso JS scene construction (`wob`, `smoothPts`, `ribbon` paths) dominates. Plate compositing is small: `drawImage` 7 ms/s | Script 66–89 ms/s at 4× | Baking the paper, stock bands and grain into one cached layer: no measurable in-app change | 3/255 rounding | Tried, **not kept** |
| 10 | Live 11v11 | Sim, poses, numbers, trail | 3.4 ms `animate()`; `matchSim` about 16 ms/s | — | — | Fine as is |
| 11 | MSAA | `antialias:true` at DPR 2 | Not measurable here (clock noise larger than the effect); tile GPUs resolve MSAA on-chip | — | Jaggies | Not proposed |

**Implemented (pixel-identical, gates below).**
1. **Pitch spot pool leaves the shader outside night** (`lib/town/fieldLighting.ts`).
   - `lightRoot.visible = night || blend > 0`. In day and sunset, once the fade has settled, the four zero-intensity spots are not in the light list, so every lit material compiles without them.
   - Within night, the pool stays visible even in zero-intensity teaching views, so lessons never switch shader variants.
   - Cost: the first switch into night in a session compiles the second variant, one 117 ms frame at 4× CPU behind the Settings sheet. Later switches measured ≤ 16.8 ms frames (both variants cached: 36 programs). A saved-night start compiles as before.
   - Same-frame parity in 5 views: at most 17 of 1.32 M pixels differ, each by 1/255.
   - GPU colour pass, interleaved in one session: idle 3.48 → 2.84 ms, beach 3.96 → 2.57 ms; day after a round trip 3.8–4.4 → 2.7–2.8 ms. Night is unchanged (4.4 ms), as expected.
2. **Dynamic shadow-caster culling** (`lib/graphics/shadowVisibility.ts` `addDynamicRoots`; Town registers `islandNpcs.root` and `streetTraffic.root`).
   - Each direct child (a rig, a ride or a car) gets a bounding sphere measured once around its origin, padded by 2.5 m for poses (minimum 3 m).
   - Each shadow frame, that sphere is swept along the sunlight to y = −8 like the static chunks. A unit whose volume misses the view is hidden for the shadow pass only and restored in `finally`.
   - Parity: 0 differing pixels in idle, town, square, beach, walk and fly views.
   - Saves 0–26 shadow draws a frame (8 idle, 26 beach, 26 flying). Tightening the padding to 0.5 m would not cull more: the rigs beyond the colour frustum mostly do throw shadows into view.
3. **Rooftop landing surfaces index static roof props** (`lib/town/rooftopTravel.ts`).
   - Only dynamic or getter-backed props (the opening ball-hunt boxes) keep live getters. Static rails and roof props are copied once, so the obstacle grid indexes them instead of scanning roughly 100 getter objects on every `roofAt`.
   - `canLand` and `surface` are identical to the all-live path at 20,000 random points, and an opened dynamic box still updates.
   - Idle profile at 4×: `canTravel` 37.9 → 19.0 ms/s.

**Proposals that need the user's decision** (visible trade-offs, not implemented). Same-frame captures are in the session scratchpad at `heat2/shots/{idle,walk}/compare-<option>.png`. Each shows the full frame at half size and a 2× centre crop, current on the left.
- **A. Pixel ratio 1.5 on phones.** The user approved this as a dynamic version, now implemented; see "Proposal A implemented" below. The captures are `compare-pr15.png` and `compare-pr175.png`.
- **B. Shadow map 1024²**: shadow pass −0.26 to −0.4 ms. Visible: blurrier, blockier shadow edges, most at building bases (`compare-shadow1024.png`).
- **C. Lambert for static scenery**: GPU effect inconsistent (not measurable up to −16% colour). Visible: flatter, slightly different highlights (`compare-lambert.png`). Not recommended without a real-device measurement.
- **D. No shadows from hands, elbows and ponytails**: about 70 fewer depth draws a frame (CPU), with no measurable GPU change. Visible only up close (`compare-noSmall.png`). Low value.
- **Not a visual trade-off, but a large change: batch townsfolk rigs into shared instanced draws**, like the volleyball and knockout crowds. This is where most colour and shadow draws, and most `render()` CPU, go. It needs picking, hover, labels, costumes and per-part culling kept, and an earlier broad NPC batching attempt was discarded, so it would be its own project.

**Proposal A implemented: dynamic resolution while moving (user-approved).**

Code: `lib/graphics/quality.ts` `MotionResolution` and `dynamicResolutionEnabled`, plus additive lines in `components/Town.tsx`: the helper next to the existing `graphicsQuality()` setup, a `__fi2.motionResolution` debug hook, and three lines just before `renderer.render`. The unused `FrameBudget` helper averages frame times to degrade permanently, so it did not fit this switch and was left alone (`Pitch.tsx` still uses it).

- **Where.** It is enabled only on phones and tablets (coarse pointer or DPR > 2). Desktop is unchanged: fine pointer at DPR ≤ 2 is never enabled, and the helper returns no switch. A DPR 1.5 device has nothing to drop.
- **Rule.** Moving drops the island to a 1.5 pixel ratio on the same frame. It returns to the existing sharp cap (`min(DPR, 2)`) after 500 ms of continuous stillness. Menus, quizzes and the draw-the-pass aim return to sharp at once, so a paused menu's single frozen frame, a quiz and screenshots are always sharp. Jittery move/still input never goes back to sharp before a full 500 ms still: the test alternates every 100 ms for 5 s and gets exactly one switch.
- **"Moving" means any of these:**
  - The camera moved since the last rendered frame (> 1 mm, or a rotation above about 0.05 px).
  - The player's speed is over 0.1 m/s.
  - An isolated field view is showing live play or a teaching play, without a quiz.
- **Switch.** `renderer.setPixelRatio` is called at the frame boundary, right before drawing, and the viewport is re-applied. The canvas CSS size never changes, so there is no layout; only the drawing buffer (with its MSAA storage) is reallocated.
- **Switch-frame cost** (4× CPU): `animate()` took 13.5–18.6 ms on switch frames, against a p95 of 7.9 ms on ordinary frames at lower load. That is about 6–10 ms extra, still inside the 33 ms phone slot, with no dropped frames seen. The first switch in one run took 44 ms. Under heavy machine load, switch frames (32–50 ms) were indistinguishable from ordinary ones (p95 35.6 ms). The buffer reallocation on a real iPhone is unmeasured.
- **Frequency.** Switches happen only when movement starts, and 0.5 s after the view settles: 8–10 switches across 12–16 scripted start/stop cycles. After releasing flight, the view returns to sharp about 1.45 s later, because the follow camera eases out for about 0.9 s first.
- **Checks** (phone profile): 1.5 while flying, sharp in the frozen Settings frame (and 0 frames while the menu is open), sharp after 1.5 s still while walking. Desktop reports disabled and stays at 2 throughout. Every frame of the live 11v11 dynamic rounds rendered at 1.5.
- **GPU per rendered frame.** Interleaved, same session, dynamic vs forced 2×; the machine load average was 12–31, so these numbers are noisy:

  | Scenario | Dynamic (buffer 585×1266) | Fixed 2× (buffer 780×1688) | Change |
  |---|---|---|---|
  | Flying | 1.20–2.86 ms | 1.74–4.37 ms | −31% / −34% (two runs) |
  | Walking | 3.47 ms | 4.05 ms | −14% |
  | Live 11v11 watching | 1.77 · 3.74 ms | 2.35 · 3.56 ms | −25% / +5% (two runs) |

  Desktop GPU clocks drop when the work drops, so a desktop timer understates fill savings. The buffer has 44% fewer pixels, and a fill-bound phone GPU should gain more, but that needs a real device.
- **Trade-off (accepted by the user).** Softer edges and sign text while moving, and a visible sharpening step about 0.5 s after the view settles.
- **Tests.** `tests/heat-render.cjs` section 4:
  - Enable conditions.
  - Desktop never switches.
  - Movement → 1.5 at once, no early return to sharp, sharp after the settle time.
  - Menus/quizzes sharp at once.
  - No thrash.
  - Source checks of Town's wiring and of the frame-boundary switch.

**Gates.** `tsc`, `npm test` (includes `frame-cap`) and the new `tests/heat-render.cjs` pass. That test covers:
- The spot pool is hidden in day and sunset, kept in night and in night lessons, and hidden again only once the fade settles.
- Dynamic culling, restoring after an exception, and a rig walking back into view.
- Rooftop parity and a live dynamic box.

These also pass:
- `heat-idle`, `field-lighting` (updated to assert that the pool is hidden in the day), `lighting-idle`, `shadow-visibility`, `static-shadow-batches`, `hidden-transform-gate`.
- `npc-behavior`, `npc-personalities`, `cafe-routes`, `rooftop-travel`, `rooftop-knockout`, `obstacle-grid`, `traffic-separation`, `ride-ramps`.
- `live-field-frame`, `live-game-effects`, `live-match-patterns`, `live-ball-physics`, `player-batch`, `player-motion`, `match-update-clock`.

Pre-existing failures, the same with this pass's library files reverted to HEAD: `live-knockout-work` (canvas stub lacks `rect`), `night-atmosphere` (92 lamps, expected 86) and `movement-work` (mesh-merge count). The riso engine is unchanged, so the film gates were not needed. The trial edit to `sheet.ts` was reverted.

**Not done.** No real-device check. The next step is a five-minute Safari Web Inspector timeline on a 60 Hz iPhone and a ProMotion iPhone, comparing day against night: night keeps the four spot lights, so it should cost more. No commit, push or deploy.

## Heat audit pass 3: compositor and overlays — September 26, 2026 (local, not deployed)

User report: "still a little warm" on iPhone/iPad. **These are emulation measurements, not iPhone temperatures.** Reduced work in headless Chrome on a Mac does not prove a cooler phone.

**Method.** The pass 2 harness plus three additions: GPU upload counters (texture and buffer bytes per rendered frame), a census of visible `backdrop-filter` elements that overlap the island canvas, and running-animation lists. The setup is the same as before: 390×844, DPR 3, touch, 4× CPU throttle and traces for compositor swaps and GPU passes. Scripts are in the session scratchpad under `heat3/`:
- `scen3.mjs`: every scene.
- `hudfly.mjs`, `flytouch.mjs`: steering A/B, with a real held touch on the joystick through CDP at 60 Hz.
- `transcript.mjs`, `breakaway.mjs`: blur A/B.
- `shadowab.mjs`: shadow pass A/B.
- `shots3.mjs`: captures.

The load average was 2–5 for the baseline and 17–18 for part of the after run, because other agents were building. Only interleaved A/B runs in the same session are compared.

**Scenes (baseline, 4×).** GPU values come from the desktop timer, which is unreliable (see finding 6).

| Scene | Island fps | Compositor swaps/s | Draw calls, colour/shadow | `animate()` | Task ms/s | Uploads/frame | Backdrop blur over canvas | Sleeps? |
|---|---|---|---|---|---|---|---|---|
| Idle hover, HUD rested | 30 | 30 | 220/121 | 12 ms | 398 | 5.7 KB buffers | none | No: ambience is alive (by design) |
| Flying (steering) | 30 | **60** | 93/42 | 9.6 ms | 448 | 6.3 KB | none | — |
| Walking (steering) | 30 | **60** | 36/23 | 8 ms | 359 | 1.5 KB | none | — |
| Live 11v11 watching | 30 | 30 | 23/5 | 8.5 ms | 303 | 4 textures / 18–28 KB (bean pose) | none | — |
| Live futsal watching | 30 | 30 | 27/3 | 4.7 ms | 177 | 3 textures / 17 KB | none | — |
| Live match, transcript open | 30 | 30 | — | — | 457–535 | — | **blur(22px) saturate(1.4), 340×333 px** | — |
| Store / binder / Make it yours | 0 | 0.5–0.7 | — | — | 15–103 | 0 | dialog `::backdrop` over the frozen frame | Yes |
| Card reveal (animating → rest) | 0 | 60 → 0 | — | — | 95 → 1.7 | 0 | none | Yes (stars rest after 6 s) |

**Ranked findings.**
1. **Steering doubled the compositor rate (60 swaps/s over a 30 fps island).** This happens during all active play: walking, riding, flying. There were three causes:
   - The Paths button loops (shake, icon swap, and the sparkle `::before`/`::after`) woke on every joystick `pointermove` and key repeat, so they never rested while playing. Style cost 60–90 ms/s.
   - The minimap layer eased a 160 ms CSS `transform` transition on every 150 ms position publish, a continuous compositor animation at display rate.
   - The joystick thumb was painted on every touch event (60–120 Hz).

   Pausing the first two alone (flying, 4×) gave 60 → 30 swaps/s, compositor GPU 11–12 → 5–6 ms per 3 s, style 64–74 → 0 ms/s and task −30%. **Implemented** (changes 1–3).
2. **Transcript panel blur over the live match.** `backdrop-filter: blur(22px) saturate(1.4)` sits over a canvas that changes 30 times a second, so it is re-blurred every frame (on iOS, a known heavy path). Interleaved: compositor GPU 9.1–10.4 → 5.2–6.5 ms per 3 s without it. **Implemented** (change 4).
3. **Live 11v11 CPU.** `fieldRuntime.update` takes 121 ms/s at 4×: rig poses 60, batch matrices 42, sim about 10. All 22 players are on screen, so rate or pose LOD would be visible. Hidden fields already skip every rig: `if(!visible)continue` comes before any `createPlayer`/`rig.update`, distant matches step on the 100 ms match clock, and choreo/combos/ball height do bookkeeping only. **No change.**
4. **Bean pose texture uploads:** 17–28 KB per frame while watching. Futsal uploads the whole 32-row texture for about 10 players. three r169 has no partial texture uploads (`Texture.updateRanges` is newer). Starting batches at 16 rows would save about 8 KB per frame (≈ 250 KB/s), which is negligible next to the render. **Not done.**
5. **Idle hover CPU:** 75% is `renderer.render` (scene projection, 220 colour + 121 depth draws). Each NPC scooter is a full player vehicle, 12 colour + 12 depth draws, and each skateboard is 5 + 5. Merging the skateboard parts would save about 12 draws per frame (≈ 0.2 ms at 4×). **Not done:** low value, and the scooter is the shared `vehicle.ts`.
6. **Apparent shadow-pass GPU jump (4.5–6.2 ms vs 0.98 in pass 2): not real.** Classic and bean alternated in back-to-back runs, and both swung between 0.7 and 5.3 ms in the same way. That is desktop GPU clock and contention noise from other agents. The shadow pass has fewer draws than in pass 2 (121 vs 356).
7. **Already quiet (verified):**
   - The island sleeps (0 frames) under the Store, the binder, Make it yours, the card offer and reveal, NPC conversations and the map.
   - Every dialog `::backdrop` blur sits over that frozen frame.
   - Audio suspends when hidden. (Pass 4 correction: while visible the shared context never suspended; it now does when nothing is audible.)
   - No per-frame texture uploads in town.
   - GC is not a measurable cost (pass 2).
   - Breakaway's in-play button blurs do not apply on phones (the census shows none), and an A/B showed no difference.

**Implemented.**
1. **The HUD loops rest while the child steers** (`lib/sceneryRest.ts` gets an optional `hold(event)`; `components/IslandSettings.tsx` adds `hudHold`).
   - A `pointerdown` on `.touch-controls/.joystick/.touch-actions/.travel-actions`, or a held movement, kick or juggle key (WASD, arrows, space, J, Shift), starts a hold. While any hold is down, the loops rest on a clean frame (the existing `hudSettle`), and that pointer's moves and key repeats never wake them.
   - Releasing the last hold wakes them for the usual 6 s. Other taps wake them as before, and window blur drops stale holds. Without `hold` the hook behaves as before (card stars, bottle and others are unchanged).
   - Trade-off: the discoverability shake, icon swap and sparkle play when the child pauses, not while steering.
2. **The minimap moves on island frames** (`lib/town/positionStore.ts` gets `frame`/`subscribeFrame`; `components/MovingIslandMap.tsx`; `components/IslandOverview.tsx`; one call after `renderer.render` in `Town.tsx`).
   - The local minimap layer writes its own transform, with the same formula, once per rendered frame when the position changed. It has `transition:none`, and React no longer writes its transform.
   - No listener means one Set iteration per frame.
   - The map moves at the island's 30 fps instead of easing at display rate. Reduced-motion users previously saw 150 ms jumps and now also get the smooth 30 fps follow.
3. **Joystick thumb paints are coalesced into the island frame** (`Town.tsx` `setStick`).
   - Input values still update on every touch event, so gameplay input is unchanged. Only the thumb graphic is painted right after the next island render.
   - A reset to centre, or an island that has not drawn for 100 ms (asleep, video), paints at once.
   - Trade-off: the thumb follows the finger at 30 fps, the same rate as the character.
4. **Transcript panel without backdrop blur** (`components/FieldTranscript.module.css` `.panel`): `rgba(46,55,39,.97)`, the uniform colour the old navy .74 + blur + saturate settled to above the pitch.
   - Same-frame crops (match paused, 390×844 DPR 3): mean difference 1.8/255, 0 pixels over 24 (`heat3/shots/transcript-compare.png`).
   - Over a very different backdrop (night, futsal court) the old glass would have tinted differently. The new panel keeps the pitch-green look.

**After** (steering with a held 60 Hz touch, interleaved with an emulation of the old behaviour: the minimap transition restored plus a HUD wake every 100 ms; 3 rounds, 4×):

| Scene | Swaps/s | Compositor GPU per 3 s | Style ms/s | Task ms/s | Running animations |
|---|---|---|---|---|---|
| Flying, before (emulated) | 52–60 | 12.2–14.8 ms | 71–76 | 303–341 | 0–1 (8 when woken) |
| Flying, after | **30** | **4.8–7.4 ms** | 16–18 | 222–328 | 0 |
| Walking, before (emulated) | 60 | 14.1–15.7 ms | 72–81 | 388–432 | 0–1 |
| Walking, after | **30** | **5.5–7.0 ms** | 14–20 | 292–349 | 0 |

- The genuine baseline (`scen3`, keyboard flight before the change) was flying at 60 swaps/s, 7 animations, style 61 ms/s and 38 ms GPU passes per 4 s. After: 30.1 swaps/s, style 19 ms/s, 19.7 ms per 4 s. Walking went from 59.9 swaps/s with style 58 to 30.4 with style 9. These ran under different machine loads (2.8 vs 17), so use them only as a direction.
- Releasing the joystick: the loops wake (6 animations) and rest again after 6 s (0).
- The emulation's "before" already includes the coalesced thumb, so the real before was at least as costly.

**Tests.** New `tests/heat-pass3.cjs`, added to `npm test`:
- The hold logic in a fake DOM: rests at once, moves never wake it, a second pointer is held, the last release wakes it, it rests again after 6 s, keys behave the same, other taps wake it, blur clears holds, listeners are removed, and it is unchanged without `hold`.
- `hudHold`'s selector names Town's real control classes.
- The `positionStore` frame channel, with source checks of the Town render line, the thumb coalescing and the transition-free minimap layer.
- An allowlist of every remaining `backdrop-filter` rule per CSS file: a new blur fails with a message to use a solid background or blur only a paused view. The transcript panel is checked explicitly.
- Hidden fields `continue` before any rig work and use the throttled match clock.
- The five main menus pause the island, and a paused island cancels its rAF.

`tests/heat-idle.cjs` has its HUD regex updated to accept the fourth argument.

**Gates.**
- `npx tsc --noEmit` passes.
- `npx playwright test --project=iphone-15`: 13/13 pass.
- These pass: `heat-pass3`, `heat-render`, `heat-idle`, `frame-cap`, `lighting-idle`, `idle-audio`, `ride-unlocks`, `bean-skin` (browser), `bean-looks`, `bean-costumes`, `bean-vehicles`, `card-rewards`, `choreo`, `match-combos`, `skill-moves`, `live-field-frame`, `live-game-effects`, `live-match-patterns`, `live-ball-physics`, `match-update-clock`, `match-story`, `player-batch`, `position-store`, `field-lighting`, `field-light-collisions`, `striker-match`.
- `npm test` currently stops at `device-guards` on `CharacterCustomizer.tsx:67` (a `<select>` under 16 px). That file belongs to the character-preview agent's in-progress work.
- `live-knockout-work` fails as before (13 !== 14, recorded in pass 2).

**Not done, and why.**
- **20 fps for idle ambience** (about −33% of idle work). This is a visible cadence change and needs the user's decision. The user also reports cooling when stationary, so idle is not the warm case.
- **Animation LOD for live players:** visible in the match view, where everyone is on screen.
- **Shadow proposals B and D from pass 2** are still awaiting the user.
- **Partial bean-pose uploads:** needs a three upgrade, and the gain is negligible.
- **NPC ride mesh merging:** about 0.2 ms at 4×, and the scooter lives in the shared `vehicle.ts`.
- **For the character-preview owner:** "Make it yours" now keeps a 60/s rAF chain drawing at about 20 fps while open. An hour earlier it measured 0.2 rAF/s and 0.5 swaps/s. Worth checking that the new celebrations and preview animation sleep when idle.

**Quality-gated trade-offs (user: "do the heat trade-off if it doesn't impact quality").** Each pending trade-off was evaluated at 390×844 DPR 3 and 1280×800 DPR 2 and implemented only if visually indistinguishable during normal play, with motion smoothness counted as quality. **None qualified, so nothing changed.** Scripts are `heat3/idlemotion.mjs`, `lod.mjs` and `shadowB.mjs`; sheets are in `heat3/shots/`.
- **20 fps idle ambience: skipped.** The rule allows it only where nothing visibly moves. The pixels changed between consecutive rendered frames were read back right after `render()`, 15 frame pairs per view, at 5 spots per viewport:
  - Hovering, the player's own jetpack bob and exhaust change 1,500–3,600 px inside the player's box on every frame, at every spot, on both viewports. 0 of 15 consecutive frames were identical.
  - Walking, busy spots change 13–22k px per frame (NPCs, traffic, water). Even the emptiest spots (−40,−150 and 80,−200) change 5–900 px per frame: the player's idle breathing plus distant motion.
  - No island view is still. Lowering the rate would reduce the smoothness of motion that is on screen. The saving would have been about 33% of idle work in the rare still case.
- **Pose LOD for live players: skipped (nothing qualifies).** On-screen heights of every posed field rig and NPC rig were measured at 10 spots per viewport. The smallest was **11 CSS px** (33 device px on the phone); field rigs go down to 11 px and NPC rigs to 14 px, and none was under 8 px. The camera distance is fixed, and offscreen or far (> 240 m) fields are already skipped before any rig work. A player "a few pixels tall" never occurs, and at 11–13 px a stride or kick still spans several pixels, so a reduced rate would read as choppier running.
- **Shadow proposal B (1024² map): skipped.** Both maps were rendered in the same task, so the scene state is identical:
  - Phone: mean difference 0.29–0.67/255, 4.7–10% of pixels changed.
  - Desktop: mean difference 0.63–1.12/255, 10–17.5% of pixels changed.
  - By eye (`sheetB-phone.png`, `sheetB-desktop.png`): diagonal shadow-acne stripes on flat roofs, softer balcony and bench shadows, and blurrier lamppost and palm edges. The saving would have been 0.26–0.4 ms of shadow-pass GPU (pass 2).
- **Shadow proposal D (no hand, elbow or ponytail shadows): obsolete.** Bean characters draw hands inside the single limbs mesh (one depth draw with the tubes), and hair already casts no shadow, so there are no tiny caster meshes left to drop. It would only apply to `?characters=classic`.
- Guard: `tests/heat-pass3.cjs` asserts that the sun shadow map stays at 2048² and that the phone frame cap has a single 30 fps interval. Changing either needs a new quality review.

No real-device check, commit, push or deploy. The next step is still a five-minute Safari Web Inspector timeline on an iPhone, flying with the joystick held, where the compositor should now show about 30 frames per second instead of 60.

## Budget-reallocation pass: cut invisible work, reinvest on screen — September 27, 2026 (local, not deployed)

The user's direction: "People only care about what they can see, not anything outside of that view." Phones and tablets only.
- Numbers are phone emulation (390×844, DPR 3; iPad Pro 11), not iPhone temperatures.
- The machine's load average was 15–20, from other agents, so GPU timers were unusable. Costs are given as triangles, draws and pixel or texel counts.
- Scripts are in `heat4/`: `invisible.mjs`, `beanparts.mjs`, `styleparity.mjs`, `shadow1536.mjs`.

**Invisible-work audit, ranked by cost.**

| # | Invisible work | Measured | Action |
|---|---|---|---|
| 1 | Bean hair and hat geometries hold **every style**, and the unused ones are collapsed in the vertex shader. A batched player spent ~60% of its hair and hat vertex work, and its hat shadow, on styles nobody sees. | Watch view 11v11, one frame: **300.5k → 232.2k triangles (−23%)**, colour + shadow | **Cut** (below) |
| 2 | Live players just off screen, still drawn by the batch (it has no frustum culling; the per-player sphere is oversized so their shadows reach the view) | Pitch-side: 15–18% of the colour triangles | Kept: those players' shadows fall on screen |
| 3 | The 25 manhole covers are instanced and always drawn | ~9.8k triangles, 2–4 draws | Kept: negligible |
| 4 | Everything else in the colour pass off screen | 0–4% (static chunks are frustum-culled per 50 m chunk; objects without culling are hidden pools or batches) | — |
| 5 | Menus, modals and the card viewer | The island already sleeps (0 fps; heat passes 1–3) | Verified |
| 6 | Sea and sky beyond the horizon | Ocean 2 draws, no sky mesh (clear colour) | — |
| 7 | Off-screen animation and poses | Already skipped: posing off screen, dormant far fields, 10 Hz off-screen routines (pass 5) | — |
| 8 | Far buildings at full detail | Vertex work only; the phone is fill-bound, and LOD would change silhouettes | Not done |
| 9 | Townsfolk (individually rendered) share one hair/hat geometry, collapsed styles included | Townsfolk hair/hat: 28.8k → 4.1k triangles in town, 34.5k → 5.2k at the square (colour + shadow) | **Cut** (NPC style views, below) |

**Cut (pixel-identical).** `lib/graphics/playerBatch.ts` `styleIndexRange`.
- Hair and hat styles are built one after another, so each style is one contiguous index range (the style id is in `beanAnchor.w`).
- Batches key hair and hat by the rig's style (row texel 10 for hair, 11 for hat) and draw only that range. The depth material uses the same geometry, so the hat shadow shrinks too.
- If a style were ever not contiguous, the whole geometry is drawn, as before.
- Same-frame parity: **0 of 1,007,314 pixels differ** (watch view and town).
- Cost: a few more draws, one per hair or hat style in use: watch view 36 → 40 draws. In `tests/bean-skin.cjs` the fixture goes from 423k to 333k counted triangles for 32 characters, and the draw budget there was raised to 14. It also checks that each style batch draws exactly its style's whole range.

**Cut, townsfolk (pixel-identical): NPC style views.** `lib/graphics/beanSkin.ts` `beanStyleView`, keyed back in `lib/graphics/playerBatch.ts`.
- Townsfolk are individually rendered rigs, so a draw range has to live on the geometry each mesh holds. A view is a `BufferGeometry` that shares the base hair or hat geometry's attribute and index objects (the same GPU buffers: no copy, no upload) and bounds, with its own draw range: that style's contiguous index range (`styleIndexRange`).
- One view per style, cached and never disposed. `writeStatic` puts the view on the hair and hat meshes whenever the look changes. Style 0 (none, mesh hidden) and a non-contiguous style keep the base geometry.
- The shadow pass draws the same mesh geometry with its depth material, so the hat shadow shrinks too. Hair still casts no shadow, as before.
- **Batches are unchanged:** `playerBatch` keys, finds the style range and clones by `geometry.userData.beanStyleBase`, so the key is the base geometry's, as before. There is one batch per style in use, never one per view or rig.
- **Picking is unchanged:** hair and hat meshes raycast against the whole base geometry (`raycastBase`), exactly as before, so NPC tap targets do not move.
- Looks, costumes (the view stays; only visibility changes), animation, collision, the 10 Hz off-screen routines, released hidden-classic geometry and the classic style are untouched. Other individually rendered bean rigs (previews, the volleyball fallback) get the same saving.
- **Measured** (`npc-styles/measure.mjs` in the session scratchpad): 390×844 at DPR 3 in headless Chromium, emulation counts rather than iPhone temperatures. One frozen frame, colour + shadow, compared with the same frame rendered with every townsperson's hair and hat set back to the full geometry.

| View | Draw calls | Triangles | Townsfolk hair/hat triangles | Pixels different |
|---|---|---|---|---|
| Busy town (spawn) | 348 → 348 | 257.8k → 233.1k (−9.6%) | 28.8k → 4.1k (−86%) | **0 of 1,007,314** |
| Square | 253 → 253 | 243.8k → 214.6k (−12.0%) | 34.5k → 5.2k (−85%) | **0 of 1,007,314** |

- Shadow pass alone: town 138.3k → 126.7k, square 115.0k → 103.4k triangles.
- A re-render of the same frame drifts 0 pixels, so the zero difference is exact.
- Screenshots: `npc-styles/after-town.png`, `npc-styles/after-square.png`, plus `before-*.png` from the unchanged code.
- The live-match watch view still matches pixel for pixel between the ranged and full batches (`heat4/styleparity.mjs`, 0 pixels). Its draw count depends on the match's styles in use.
- **Tests.** `tests/npc-style-batches.cjs` is added to `npm test`. It checks that:
  - each of the 66 townsfolk (dressed as `islandNpcs` does) draws exactly its own style's whole range, sharing the base buffers and bounds (90 hair and hat meshes: 121k of 739k indices, 84% fewer);
  - look changes, a covering hat over short hair, and a costume round trip keep the right view;
  - a mixed batch has one batch per style in use, and each draws only its range;
  - picking matches the whole base on 216 rays.
  `tests/bean-skin.cjs` is unchanged and still passes: 10 draws and 333k triangles for 32 characters.

**Reinvested on screen.**
- **Shadow map 1536² while cool.** Phones start at 1536² (`PHONE_SHADOW_SIZE`); tiers 1+ cap it at 1024², so a warming phone drops to 1024² together with resolution 1.5.
  - With the tight fit this is about 8.5 cm per texel in town, and about 9 cm on the watched pitch.
  - Cost: 2.25× the shadow-map texels, in a shadow pass whose triangles fell by up to 23% (above).
  - Crops: `sh-phone-town-sheet.png`, `sh-ipad-town-sheet.png`. Parapet and lamp shadows are finer, with no acne at the 2-texel bias (≈ 17 cm).
  - When a tier changes the map size, the adapter keeps the bias at 2 texels.
- **Already reinvested in the quality pass:** resolution 1.75 while cool, the tight shadow fit, the 5× sharper watch-view fit, and 4× anisotropy. MSAA stays on.
- **Not enabled: resolution 2.0 while cool.** That is +31% pixels over 1.75. The phone is GPU-bound: ~50 ms flying frames in the recordings, and heat was the original complaint. The savings found here are vertex work, not the fill 2.0 would add, so there is no measured headroom to pay for it. It is a one-constant change (`PHONE_PIXEL_RATIO`) if a real-device timeline shows headroom.
- **Not done: more character segments up close.** It adds vertex work to the most numerous draw, and the user rejected changes to the bean look.

**Net.** Watch view: −23% triangles; the shadow map is 1536² while cool, 1024² once warm. Town: −10 to −12% triangles from the townsfolk style views, with the same draws; shadow texels 2.25× while cool. The governor still steps down on a rising frame-time trend.

## Quality-recovery pass — September 26, 2026 (local; part in deploy p49yyvzbx)

The user reported "Heat is solved, but visual quality dropped noticeably on the phone". Measurements are phone emulation (390×844, DPR 3), not iPhone temperatures. Crops are in the session scratchpad under `heat4/shots/` (`q-*`, `bias-*`).

**A. Governor: trend, not absolute slowness** (`lib/graphics/heatTier.ts`).
- The iPhone renders ~50 ms frames while flying even when cool. The pass-4 rule (p90 > 41.7 ms = "slow") therefore put a cool phone at tier 1, **resolution 1.25**, within seconds. That was most likely the visible quality drop.
- The governor now learns a baseline median per tier and scene-load bucket (the lowest window median in the last 5 minutes, trusted after 14 s).
  - **Step down:** frames stay at ≥ 1.3 × baseline for 12 s (a rising trend, i.e. throttling), or are severe (p90 ≥ 100 ms).
  - **Step up:** after **75 s** calm (median ≤ 1.12 × baseline), doubling after each relapse up to 20 min.
- Tests: a cool iPhone flying at 44–58 ms stays at tier 0 for 20 minutes. The recording's 51 → 99 ms creep steps down within 20–45 s, one tier at a time. There are also tests for severe frames, load and view changes, gaps, the 75 s step-up, and flap backoff.
- **Hidden readout:** open the island with `?heat=1` to see a small overlay: tier, resolution, fps, median, baseline and the governor's state.
- **In the app:** 4× for 70 s and 12× for 140 s in town stayed at tier 0 and 1.75. The island is still capped at 30 fps there, so there is no trend.

**Adaptive 1.75 (user-approved, enabled).**
- Phones start at resolution **1.75** (`PHONE_PIXEL_RATIO`). `MotionResolution` stays a no-op on phones (Town passes the phone base as its moving ratio).
- Ladder: tier 0 = 1.75 (desktop unchanged); 1 = 1.5; 2 = 1.25 with card film DPR 1.5; 3 = still water; 4 = 24 fps (also Battery saver). No tier changes what is drawn per frame (the flashing hotfix).
- Cost: 682 × 1477 = 1.01 Mpx, **1.36×** the pixels of 1.5. From the stable pass-4 A/B (DPR 2 vs 1.5 = +31% GPU for 1.78× the pixels), that is about **+15% GPU** while cool.
- **Heat risk, honestly:** a GPU-bound phone does ~15% more work until the governor sees a 30% frame-time rise sustained for 12 s. In recording 2 that would take roughly 20–35 s of heating. Warmth builds a little before the step to 1.5, and a hot phone then steps to 1.5 and lower as before.
- Crops: `q-live-pr-sheet.png`, `q-town-pr-sheet.png` (1.5 / 1.75 / 2).

**B. Crisper shadows at the same 1024² map** (`lib/graphics/islandShadows.ts`).
- The fit now covers only the visible receivers: each view corner ray at the ground and at roof height, receivers 0–24 m, with a 4 m margin, instead of a y = −8 plane with ±8 m margins.
  - Phone at the spawn: 268 × 99 → 244 × 77 m.
  - Walking: 140 × 71 → 98 × 47 m, i.e. **1.4–1.5× sharper**.
- **Watch view:** the high camera made the view-based fit ~683 × 192 m (67 cm per texel under the players). It now fits the watched pitch: **132 × 79 m, ≈ 13 cm per texel, 5× sharper**, and player shadows are defined instead of blobs (`q-live-shadow-sheet.png`).
- **Bias:** `normalBias` follows the texel. At 0.92 texel the tighter fit showed vertical acne on roof parapets; at **2 texels** (≈ the previous 0.24 m) the stripes are gone on phone and iPad (`bias-phone-sheet.png`, `bias-ipad-sheet.png`).
- `tests/quality-pass.cjs` checks that every receiver on the corner and edge rays (0–20 m) is inside the frustum at four aspects and elevations.

**C. Anisotropic filtering** (`sharpenSceneTextures`, `lib/graphics/lambertScenery.ts`): 4× (capped by the device) on the 104 mipmapped scene textures, set once at setup. Mipmaps were already on for those. The ground, roads, pitches and buildings are vertex-coloured, not textured, so this mainly sharpens the ocean ripple tile and sign or stripe maps at grazing angles (`q-beach-aniso-sheet.png`).

**D. Other softening checked.**
- The canvas buffer equals the CSS size × resolution (682 × 1477 for 390 × 844 at 1.75), with no CSS transform or scaling.
- `MotionResolution` is disabled on phones (no drop while flying: 1.75 measured in flight).
- The card film is capped at DPR 1.5 on phones by the card-film agent (`CardFilmPlayer.tsx` `PHONE_DPR`), with tier 2+ also 1.5. Left to them.
- MSAA stays on.

**Status.** Parts A–C and the 1.75 tier were already in the tree when deploy p49yyvzbx was snapshotted. The watch-view pitch fit (`fitShadowsToBox`), the 2-texel bias (the snapshot had 0.92) and `tests/quality-pass.cjs` came after.

## Heat audit pass 5: view-based work on phones — September 26, 2026 (local, not deployed)

The user's direction was: "on mobile the space is small; pause work on things outside the view and only load what's needed." Everything below looks identical on screen, and tests guard that.
- Numbers are phone emulation at 4× CPU, reduced work, **not iPhone temperatures**.
- The desktop GPU timer was dominated by noise on this shared machine: a frozen-frame A/B with no actual change read −25%. GPU effects are therefore given as pixel, draw and frame proxies.
- Scripts are in the session scratchpad under `heat4/`: `subsys.mjs`, `geobytes*.mjs`, `options.mjs`, `lever5.mjs`, `npctap.mjs`.

**Invisible changes (implemented)**

1. **Dormant far, off-screen live fields** (`lib/town/fieldRuntime.ts`).
   - A field that is not in view and is more than radius + 60 m from the camera does no work at all: no match clock, sim step, choreo or combo bookkeeping, ball physics or effects. It resumes exactly where it paused.
   - Wake: inside radius + 50 m (hysteresis), or as soon as the frustum + 240 m visibility test sees it. That test runs before anything is drawn, so a field in view is never dormant.
   - At the spawn 2 of 4 fields sleep; flying over the sea, all 4.
   - Idle: `fieldRuntime` 36 → 32 ms/s, `matchSim` 16.3 → 12.7. Flying: `fieldRuntime` 24 → 16.6, `matchSim` 10.4 → 6.7.
   - Scores of a sleeping field pause. Nothing shows them while you are away.
2. **Off-screen townsfolk step their routines at 10 Hz** (`lib/graphics/islandNpcs.ts`). This matches the stepper's own 0.1 s clamp. Anyone on screen (frustum + margin), near, stunned, frozen or in a conversation still steps every frame. Posing was already skipped off screen. Routines: idle 16.4 → 13.7 ms/s, flying 9.3 → 4.3.
3. **Hidden townsfolk geometry released.**
   - Each townsperson built the full classic body under the bean skin: 3,347 meshes in the townsfolk group, 80 visible at the spawn.
   - Their appearance is set once and never takes a costume, so the skin-hidden classic meshes now share one empty geometry.
   - JS geometry memory at start: **69.9 → 45.2 MB (−24.7 MB)**. Unique geometries: 4,470 → 2,227. The iPhone timeline had logged memory-pressure "critical" events.
   - NPC taps still open conversations (checked). A scooter rider that does not respond to taps behaves the same before and after.
4. **Audit F19:** the knockout arena's batch bounds are one fixed arena sphere (radius 40 m, arena-local), assigned once. Before, every mesh's bounds were recomputed over all instances each frame.
5. **Audit F23:** a field's live frame is re-synced only when its sim steps (and once for a fresh field).
6. **Governor fix (affects the live hotfix).** At a 24 fps slot (tier 3), every healthy frame is 41.7 ms. That read as "slow" against the 33.3 ms budget, so the governor stepped down, and never as "calm", so it never stepped back up. Samples are now normalised to the active frame slot. `tests/heat-tiers.cjs` §13 fails without the fix and passes with it.

**Not done, and why.**
- **Proximity streaming of districts and venues:** nothing is downloaded for the island. It is procedural, with no GLBs or large textures. The largest deferrable item, the hidden classic geometry (above), is done. The hidden-at-start volleyball game (3 MB, 177 meshes) could be created on approach, but that means Town setup edits while another session is changing Town.
- **Off-screen traffic at a low tick rate:** traffic costs 3–4 ms/s at 4×, and slower stepping risks collision timing with the player.
- **Audit F12** (teaching rebuild allocations): medium effort, teaching-only.
- **Audit F14/F15/F17/F21:** each changes the look or sound slightly.
- **Audit F16/F18:** arcade files owned by another session.
- **Audit F20:** instancing the translucent ghosts changes how they blend.
- **Audit F22/F24:** per-frame `Town.tsx` literals and cursor writes, left alone while another session edits Town.
- **Memory after 5 minutes:** the development build's JS heap (340–1,020 MB, including React dev and source maps) is not representative. Geometry bytes were measured instead.

**Visible options: prepared, OFF** (`HEAT_OPTIONS` in `lib/graphics/heatTier.ts`, all false). A development-only override for captures is `window.__fiHeatOptions`. The screenshots are 390×844 in `heat4/shots/`.

| Option | What it does | Measured (4×) | Look |
|---|---|---|---|
| `spectate24` | 24 fps while spectating on phones (watch view, or standing still with live players on screen) | 20% fewer frames; pitch-side task 263/267 → 179/228 ms/s | Motion cadence 24 instead of 30 while watching; stills are identical |
| `spectateDpr125` | DPR 1.25 while spectating | 31% fewer pixels (585×1266 → 487×1055) | Slightly softer players and lines (`crop-opt-dpr125-view.png`, `crop-opt-dpr125-side.png`) |
| `fewerAmbient` | 40% of townsfolk and ordinary cars not drawn on phones | Idle draws 219/121 → 184/92; walking 147/106 → 110/78, task 199/194 → 167/169 ms/s | Visibly emptier town. Hidden townsfolk lose their conversations (`sheet-opt-ambient.png`). Enabling it for real also needs the cars out of the traffic sim. |
| `lambertScenery` | MeshLambert for static scenery chunks | GPU not measurable here (pass 2: 0 to −16%) | **Visible regression:** windows and awnings turn dark green, colours shift (`crop-opt-lambert.png`). Not recommended as implemented. |

**Tests.**
- `tests/heat-pass5.cjs`, added to `npm test`, covers:
  - dormancy with hysteresis, after the visibility decision;
  - 10 Hz off-screen routines;
  - the geometry release (hidden meshes only);
  - the arena bounds;
  - options off in production, ignoring the dev override;
  - Lambert on scenery chunks only.
- `tests/e2e/offscreen-work.spec.ts`, device suite:
  - dormant fields do not advance, and a watched field resumes without fast-forwarding;
  - over 120 frames flying across the fields and 120 pitch-side, every live player and townsperson whose body projects on screen is posed and drawn.
- `tests/e2e/live-players.spec.ts`: the flashing guard, tiers 0–3.

## Hotfix after deploy 4: "players on the live games are flashing" — September 26, 2026 (local)

**Cause.** The pass-4 thermal tiers switched per-frame drawing on the real iPhone. The phone was already at ~50 ms frames, so the governor reached tiers 2–3 within about 35 s. There, three levers produced blinking:
- **Shadow map every 2nd/3rd frame.** At 15–20 fps, player shadow blobs lagged and snapped at ~5–7 Hz. In `heat4/shots/strip-shadow-old-vs-fix.png` (8 consecutive frames, old cadence on top, fix below), the old cadence shows shadows detaching from the feet, and blobs with no player.
- **Distance-based NPC/traffic hiding (40 m / 60 m).** It had no hysteresis, so walkers pacing near the line popped in and out. Hidden cars also kept driving and could still hit the player.
- **DPR 1.0.** Sub-pixel limbs on 11–13 px players blinked.

**Ruled out.** None of these reproduced in Chromium or WebKit emulation, in the watch view or pitch-side, at any tier:
- **The hidden-classic-mesh matrix skip.** Limb continuity over 60 frames is identical to the full `updateMatrixWorld` path. The contact helpers call `updateWorldMatrix(true,true)` first.
- **Batch visibility and instance counts.** Every frame over 300: 0 changes and 0 zero-scale instances.
- **Pixels.** 0 of 5,280 player-frames were missing from the canvas.

**Fix** (`lib/graphics/heatTier.ts`). The tier ladder now uses only uniform levers:
- **Tier 1:** DPR 1.25 and card film DPR 1.5.
- **Tier 2:** adds static water, waves and ferry.
- **Tier 3:** adds a uniform 24 fps cap (`frameCapSlot(…,heat.frameMs)`).

Shadows are refreshed every frame at every tier, nothing is hidden by distance, and the pixel ratio never drops below 1.25. The Battery saver line now reads "Keeps your device cooler with slightly softer graphics, a gentler frame rate and calm water."

**Tests.**
- `tests/heat-tiers.cjs`: no tier may refresh shadows less than every frame, hide NPCs or traffic, or go below DPR 1.25. The adapter hides nothing at any tier.
- New device-suite test `tests/e2e/live-players.spec.ts`: in the 11v11 watch view at tiers 0–3, over 300 consecutive frames each, no live player's drawn state toggles, bean batch counts are stable, there are no zero-scale instance matrices, and body pixels are present on every checked frame.

## Heat audit pass 4: iPhone timeline, approved phone defaults, thermal fallback — September 26, 2026 (local, not deployed)

The user reported that the phone still heats up, "even just watching a live game standing idle". This pass had four inputs:
- Phone emulation of the current build (390×844, DPR 3, 4× CPU; interleaved A/B only).
- Playwright WebKit.
- The static audit `docs/heat-audit-2026-09-26.md`.
- **Two real Safari Web Inspector timelines from an iPhone** (deploy 3). Recording 1 is 160 s; recording 2 adds a later session.

Emulation numbers are reduced work, **not iPhone temperatures**. The iPhone timelines are real device evidence of frame timing, not of temperature. Scripts are in the session scratchpad under `heat4/`:
- `watch.mjs`, `lines.mjs`: the live-match scene and line-level profiles.
- `tiers.mjs`, `govcheck.mjs`: tier savings and the governor in the app.
- `defaults.mjs`: legacy vs new phone defaults, with screenshots.
- `rec.py`: the per-second breakdown of the timeline.
- `radar.mjs`, `viewer.mjs`, `wkviewer.cjs`, `behave.mjs`, `rigparity.mjs`: the individual checks.

### What the iPhone timeline shows

These come from `heat4/rec.py`, which streams the 359 MB export into a per-second table with screenshots every 5 s.
- **Flying (0–60 s): the phone is GPU-bound.**
  - Rendering frames had a median of 48–60 ms (p90 up to 196), so rAF delivered 16–20/s instead of 30.
  - WebContent CPU was ~20–30%, and the main thread ~20–25%. The frames wait on the GPU process, which Safari's CPU instrument does not count.
  - Recording 2 (300–370 s, flying over the fields) shows frame medians creeping 51 → 55 → 83 → 99 ms over ~70 s at a similar scene load, with CPU steady at 30–37%. That is thermal throttling of the GPU.
- **Animation restarts: gameplay taps.**
  - `animationstart` came in bursts of 8–28/s that follow `pointerdown`. Joystick-only seconds show 60–120 `touchmove`/s with 0–2 `animationstart`/s.
  - The most-painted quad was (28,26)–(52,50), the 24 px Paths icon, 10–25 paints/s. The next was the tapped action button.
  - Cause: heat pass 3's "release wakes the HUD loops". Every Blast or parachute tap's release restarted the shake, sparkle and blur icon swap, and the `filter: blur` swap repaints.
- **Message events (~4–6/s while flying): React's scheduler.** The minimap re-rendered on every 150 ms position publish.
- **Card viewer and binder (60–160 s): no rAF, and no continuous paints.**
  - The paint bursts (60–190 in one second) are the film playing and page turns.
  - While idle, most seconds have 0 paints. The rest are single frames that line up with taps (Play, Flip).
  - Emulation and WebKit both show every card-art loop (rays, clouds, flag, birds, wings) resting after ~6 s, with 0 running animations.
  - No change was needed. The film part of recording 2 went to the card-film agent.

### The priority scene: watching a live match, standing still

Baseline, 4× CPU, 5 s samples, 30 fps in every case:

| Scene | Task ms/s | `animate()` | Draws (colour/shadow) | Uploads/frame | DOM mutations/s |
|---|---|---|---|---|---|
| Pitch-side 11v11 (walk, idle) | 318 | 9.5 ms | 98/39 | 17 KB (bean pose) | 0 |
| Pitch-side futsal (rooftop, idle) | 323 | 9.8 ms | 119/46 | 18 KB | 0 |
| Watch view 11v11 | 194 | 5.8 ms | 24/4 | 18 KB | 0 |
| Watch view futsal | 95 | 2.4 ms | 14/3 | 17 KB | 0 |

Watch view 11v11, by subsystem (inclusive ms/s at 4×):
- `fieldRuntime.update`: 105, of which the rig solve (`player.update` plus its inlined code) ≈ 75 and batch matrices ≈ 30.
- Render: 34.
- NPC routines: 16.
- `matchSim`: 10.

`fieldRuntime`'s own logic, choreo, combos and skill moves are each under 0.5 ms/s. The line profile spreads the solver's cost with no hot line; the top line is 0.6 ms/s.

The coordinator's candidates for this scene:
- **30 fps cap:** already on for phones.
- **Field collision while idle:** not in the profile. Skipping it would let players run through a standing child, so it was not done.
- **Solve skills/choreo only for active players, reuse idle poses:** both already under 1 ms/s, and live players are rarely idle.
- **Batch the pose uploads:** already batched, 3–4 textures a frame. three r169 has no partial texture uploads.
- **Feed and DOM updates:** 0 DOM mutations/s. The closed transcript still polled at 2 Hz, now gated (below).
- **Does the sim step faster than needed?** It is about 10 ms/s. Changing the step would change the sim, so it was not done.
- **Hidden UI re-rendering per frame:** none found.
- **Static shadow cache with a player-only pass:** it is the rejected mobile framebuffer cache, and the watch view's shadow pass is only 4–5 draws.

The wins for this scene are therefore:
- The hidden classic meshes (audit F8, below): −14 ms/s CPU at 4×.
- The approved GPU defaults: watch-view GPU **−45%**, pitch-side −24%.
- The music idle pause and the audio-context suspend.
- The thermal tiers.

### Approved phone defaults (user decision, September 26, 2026)

Phones and tablets (coarse pointer or DPR > 2; `lib/graphics/quality.ts` `phoneGraphicsFor`) get:
- **Pixel ratio 1.5 at all times.** The sharp-when-still switch becomes a no-op because `MotionResolution` disables itself.
- **A 1024² sun shadow map.**

Desktop is unchanged: DPR ≤ 2, 2048², MSAA, uncapped.

**MSAA stays on.** The approved "antialias off on DPR ≥ 2" was checked (`heat4/shots/sheet-phone-watch.png`, `sheet-ipad-idle.png`). At DPR 1.5 without MSAA, thin pitch lines broke into dashes (the centre circle read as dotted even at full-frame scale). Sign lettering, roof edges and railings stair-stepped, with moiré on roofs on the iPad. That is the "clearly jagged" case, so AA was kept, as the user asked for that outcome. The lever is `PHONE_ANTIALIAS_OFF_AT_DPR2`, read at renderer creation. With MSAA at 1.5, the look stays clean: solid pitch lines, slightly softer sign text and small rooftop shadows (`crop-phone-watch.png`, `crop-phone-idle.png`).

**Shadow bias.** The 1024² map first showed the diagonal acne stripes on flat roofs that pass 3 had flagged (visible on the iPad). The sun's `normalBias` now scales with the texel (`.12 × 2048 / size`, also when a tier changes the size). The stripes are gone in the recaptures (`crop-ipad-idle.png`). What remains is the approved softness: small rooftop shadows are fainter.

GPU per rendered frame, legacy (DPR 2 still, 2048², MSAA) against new, in alternating page loads (4×, 30 fps held):

| Scene | Legacy, shadow + colour | New, shadow + colour | Change |
|---|---|---|---|
| Town idle | 0.99 + 2.86 ms (780×1688) | 0.83 + 2.11 ms (585×1266) | **−24%** |
| Flying (1.5 already while moving) | 0.69 + 1.30 ms | 0.41 + 1.23 ms | **−18%** |
| Watch view 11v11 | 0.63 + 1.20 ms | 0.37 + 0.61 ms | **−45%** |

The iPad Pro 11 went from 1668×2388 to 1251×1791. The development-only `window.__fiLegacyQuality` restores the old defaults for A/B captures.

**Music and audio (approved).**
- Music fades out (~1 s) after 30 s with no pointer, key or wheel input (`lib/audio/islandMusic.ts` `MUSIC_IDLE_MS`). A held joystick's `pointermove` counts as input.
- It fades back in on the next input, inside the gesture as iOS requires.
- The shared AudioContext (`islandSound.ts`) suspends 2 s after nothing is audible: no music, one-shots, truck engine or ride hum.
- An input unlock resumes it. So does any sound the game wants to play: `ready()` resumes an idle-suspended context and schedules the sound.
- Browser check (`behave.mjs music`): after 31 s idle, music is paused at volume 0 and the context is `suspended`. A tap brings back `running` and volume 0.04.
- **Correction:** the earlier line "the shared context runs only for music" was wrong (audit F5). It ran for the whole visible session.

### Fixes (no visible change unless noted)

1. **HUD loops no longer restart on gameplay taps** (`lib/sceneryRest.ts`). Releasing a held gameplay pointer or key ends the hold but does not wake the art. The loops wake only on other input (HUD buttons, menus, focus) or `SCENERY_WAKE_EVENT`.
   - `HUD_HOLD_SELECTOR` adds `.town-scene`, so canvas taps and drags count as gameplay (audit F7).
   - Check: six action-button taps leave the HUD resting with 0 running animations; a HUD tap wakes it.
   - Trade-off: the discoverability loops play after menu or HUD interaction, not after gameplay taps.
2. **Minimap re-renders only at the shoreline** (`MovingIslandMap.tsx`). Its layer already moves on island frames (pass 3), so React subscribes to the island/sea state instead of every publish.
3. **Teaching buffers** (audit F4; `teachingGround.ts` `uploadPrefix`, `lessonCues.ts`) upload only the used prefix, and nothing when the rebuilt prefix is unchanged. A teaching play went from **≈484 KB to 5.1 KB/frame** of buffer uploads, the same as live watching.
4. **Pitch radar** (audit F3).
   - It updates on island frames (`lib/town/islandFrames.ts`, `emitIslandFrame` after the render in Town), with no own rAF, and writes SVG attributes only on change.
   - Its frame has no backdrop blur. `IslandMapFrame.module.css` uses `rgba(46,55,45,.97)`, the colour the .74 navy over `blur(5px)` settled to.
   - Same-frame crops: mean difference 2.4/255, 0 pixels over 24.
   - Radar open: swaps 42 → **30/s** and rAF 120 → **60/s** (audit baseline vs now); compositor GPU with the blur restored vs now: 5.9–7.3 → **1.2–1.6 ms** per 4 s.
   - The `heat-pass3` allowlist entry was corrected (it had treated the radar as over a paused view).
5. **Transcript** (audit F11): the 2 Hz match poll runs only while the panel is shown, and re-renders only when the score or the feed changes.
6. **Island Strikers thumb** (audit F13): the rect is read once per gesture, and the thumb paints on the game frame instead of on each move event.
7. **Hidden classic body meshes** (audit F8).
   - The bean skin marks the childless classic meshes it hides (`userData.beanHidden`; joints are Groups and never flagged). `playerBatch.updateRigMatrices` skips them.
   - Those are 40 of 45 meshes per live rig.
   - Matrix walk for 22 rigs: 0.147 → 0.030 ms per frame without throttle, i.e. **≈ −14 ms/s at 4×** in the watch view.
   - Parity: 88 bean pose rows and 65 visible meshes identical (max difference 0) to `updateMatrixWorld(true)`.
8. **Bottle waves** (audit F9): the 24 fps wave canvas holds its frame once the note is shown and restarts on leaving. This is visible: the sea is still behind the note.
9. **Onboarding** (audit F10).
   - The island pauses behind the tour except on the NPC-highlight step. The loop wakes when that step starts. Measured: 0 island frames on steps 1, 2 and 4, 30 fps on step 3, and asleep behind the welcome card after load.
   - The 350 ms `querySelectorAll` + `getBoundingClientRect` poll is gone: highlights are measured on the step, 300 and 900 ms later, and on resize, and set only on change.
   - The NPC spotlight's 100 ms follow sets state only when its rounded box changes.

### Thermal fallback and Battery saver

`lib/graphics/heatTier.ts` holds the tiers, the governor and the shared state. `lib/graphics/islandHeat.ts` applies them to the island and feeds the governor after each render. `__fi2.heat` exposes `tier`, `settings`, `governor.log` and `force(t)`.

| Tier | When | Settings (on top of tier 0) |
|---|---|---|
| 0 | default | Phones: 30 fps, DPR 1.5, 1024², MSAA. Desktop: uncapped, DPR ≤ 2, 2048². Shadows every frame, all NPCs and traffic drawn, card film DPR 2. |
| 1 | warm | DPR ≤ 1.25, card film DPR 1.5, 30 fps on every device |
| 2 | hot | + shadow map every 2nd frame; ambient NPCs beyond 40 m and ordinary traffic beyond 60 m not drawn (routines and driving continue; pickups and the ridden truck always drawn) |
| 3 | hottest, or **Battery saver** | + DPR 1.0, shadow map every 3rd frame at ≤ 1024², static water, waves and ferry |

**How the governor works.**
- It governs phones and tablets only. Desktop reaches a lower tier only through Battery saver or a forced tier.
- Each rendered frame feeds it the interval since the last frame, the frame's work time, the draw calls and the view.
- A 2 s window is **slow** when any of these hold:
  - p90 interval > 1.25 × 33.3 ms (slots missed);
  - p90 work > 0.8 × budget;
  - the median interval has crept to 1.3 × the best median at this load in the last minute.
- A window is **calm** when p90 interval ≤ 1.05 × budget and p90 work ≤ 0.45 × budget.
- A load change over 35% or a view change restarts the clocks, so a heavier scene is not mistaken for a hot phone. Gaps over 250 ms (sleep, menus) are ignored.
- **Step down:** one tier after 10 s of slow windows, then a 12 s dwell.
- **Step up:** one tier after 180 s calm. A step-down within 120 s of a step-up doubles the calm needed, up to 20 min.
- These thresholds were tuned on recording 2's 51 → 99 ms creep.

**Tests** (`tests/heat-tiers.cjs`):
- A cool phone stays at tier 0 for 20 min.
- 2 s bursts, load or view changes and sleep gaps never step down.
- Sustained slowdowns step one tier at a time, 1 → 2 → 3.
- The recording pattern reaches tier 1 in under 12.5 s and tier 3 in under 70 s.
- Stepping up needs 180 s calm.
- A phone that is slow at tier 0 and fine at tier 1 flaps at most 9 times in an hour, with the calm needed growing 180 → 360 → 720 → 1200 s.

**In the app** (`govcheck.mjs`, final build):
- At 4× for 70 s it stays at tier 0 in the watch view and town.
- In town at 30× (an emulated hot phone) it steps to tier 1 (DPR 1.25), then to tier 2 about 36 s later. The log reads "sustained slowdown: p90 interval 166.6 ms, work 166.4 ms".
- The watch view no longer misses slots at 20× since the CPU fixes, so it correctly stays at tier 0.
- The governor keys on phone detection (`quality.phone`), not on `MotionResolution.enabled`. That is now off on phones because sharp = moving = 1.5, and an intermediate build had silently switched the governor off this way; a source test guards it.

**Battery saver** (Settings → Battery; `IslandSettings.tsx`, the standard `.toggle`/`.switch`):
- It forces tier 3 on any device.
- It is off by default, remembered per viewer in `localStorage` `fi2-battery-saver`.
- The explanation line: "Keeps your device cooler with slightly simpler graphics, fewer far-away walkers and cars, and calm water."

**Tier savings** (forced tiers, interleaved, 4×; before the tier re-base, when tier 1 was DPR 1.5; the desktop GPU timer is noisy):
- Rendered pixels: 1.32 → 0.74 → 0.51 Mpx at DPR 2 / 1.5 / 1.25. Tier 3 is now 0.33 Mpx at DPR 1.0.
- Idle town shadow draws: 121 → 62–66 at every 2nd frame, 29–34 at every 3rd.
- Pitch-side 11v11 task: 282–378 → 220–263 ms/s at tier 2.
- Desktop: 60 → 30 fps from tier 1.

### Gates and status

- `npx tsc --noEmit` passes.
- `npm test` passes, now including `heat-tiers` and `heat-pass4`.
- These also pass: `heat-render` and `heat-pass3` (regexes updated for the new calls), `heat-idle`, `frame-cap`, `lighting-idle`, `idle-audio`, `music-continuity`, `engine-voice-reuse`, `bean-skin` (browser), `bean-looks`, `bean-costumes`, `bean-vehicles`, `card-rewards`, `choreo`, `match-combos`, `skill-moves`, the `live-*` tests, `match-update-clock`, `player-batch`, `player-motion`, `position-store`, `field-lighting`, `shadow-visibility`, `static-shadow-batches`, `striker-match`, `npc-behavior`.
- `live-knockout-work` fails as before (13 !== 14).

**Held for the user, not changed:** none remain from the audit list; all were decided on September 26. **Not done:**
- AA off: kept on after the visual check; the lever is ready.
- Lambert materials (weak evidence).
- A blob-shadow rewrite.
- Freezing off-camera sims (it would change the scores).

No commit, push or deploy from this pass. The next step is a Safari timeline on the iPhone with this build: flying and pitch-side, looking at the rendering-frame medians (target ≈ 33 ms) and `__fi2.heat.governor.log`.

## September 25 game-developer overhaul (local, not deployed)

See [the four-game critique and implementation report](arcade-game-developer-review-2026-09-25.md). This supersedes the earlier verification-only continuation below. Tennis adds deliberate shot placement and tactical returns; Pinball adds visible build/switch/finish chances; Breakaway adds authored readable routes and timed finishing; Strikers adds portrait-oriented play, matching controls, pass/support cues and readable defensive commitment.

Shared court cameras fit into HUD/control margins only at resize, with no per-frame projection search. The UI leaves more of the game visible. Strikers' joystick thumb uses direct CSS instead of pointer-frequency React state. Its warning/receiver rings, ball shadow and pass line are fixed meshes, updated in the existing loop; its eight-player simulation keeps bounded substeps. Keeper targeting samples at 240 ms, tackles show a 260 ms commitment, and off-ball players retain width on loose balls. Flat reused turf planes remove seams without increasing the patch count.

Individual notes record fixed mesh/pool additions and engine checks. All four have desktop and emulated-touch input evidence; Tennis, Pinball and Breakaway additionally complete ordinary-play failure/retry sessions. Strikers' final 55-second touch run completes a pass, creates two shots and scores once; injected goal/lifecycle checks are separately identified. The final integrated production build, type check, normal test command and four simulation suites pass. Paused/finished sleep and existing resolution/frame-rate budgets are retained. Do not interpret this as physical-phone thermal evidence or deployment.

## September 25 arcade continuation (local, not deployed)

Four game-specific reviews resumed the existing arcade changes. [Tennis](arcade-tennis-2026-09-25.md) now waits for exact zero velocity before sleeping, preventing a frozen residual movement state. [Breakaway](arcade-breakaway-2026-09-25.md) clears interrupted canvas pointer capture on pause, blur and restart. [Pinball](arcade-pinball-2026-09-25.md) supports focused Enter/Space hold controls with blur cancellation. These changes add no animation loops or background work; Tennis permits its final braking frames before resting.

[Island Strikers](arcade-rebuild-2026-09-19.md) replaces the earlier full-field Live Match with a dedicated eight-player arcade simulation. The shared scene retains one sun and pooled effects. Its portrait camera previously put the entire pitch beyond the fixed fog range; stadium-corner fitting and camera-relative fog/far limits now run only at initialization/resize. Keyboard and touch charged shots, goals, pause/resume, full-time rendering sleep and restart pass the new `scripts/check-island-strikers-browser.cjs` at desktop and phone sizes. Phone-controller pairing still needs a second-device check.

All four simulation suites and desktop/mobile Chromium checks pass. The integrated `npm run build`, TypeScript check and `npm test` also pass. Mobile checks use actual emulated touch controls, including Pinball's simultaneous flippers. These are behavior and work checks, not physical iPhone temperature measurements. No deployment was performed.

Last reviewed: September 14, 2026. This is the maintained implementation guide; [the dated performance log](flight-performance-2026-09-14.md) contains measurements and experiment history. Check current code before proposing an optimization: many suggestions have already been implemented.

## Purpose and evidence

The user reported warming on an iPhone 17 Pro Max after roughly 3–5 minutes, especially during flight, boost and moving-truck landings. They reported improvement after earlier updates and cooling when stationary. Preserve football learning, visuals, responsive controls and reliable interactions while reducing unnecessary work.

Desktop mobile emulation is useful for regression checks, CPU/GPU timings and work counts. It does **not** measure iPhone temperature, battery use, or establish that warming is resolved. Avoid translating a reduction in draw calls or matrix operations into an equal reduction in heat.

## Rendering and shadows already optimized

- Mobile baseline (since heat pass 4, user decision Sep 26 2026): phones and tablets draw at DPR 1.5 at all times with a 1024² sun shadow map and MSAA, about 30 rendered frames/second; the thermal governor (`lib/graphics/heatTier.ts`) steps lower only after a sustained slowdown, and Battery saver forces the lowest tier. Desktop: DPR ≤ 2, 2048², uncapped. Player simulation remains 60 Hz. Do not silently lower resolution, shadow quality, effects or frame rate to claim a performance win.
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
- Junction boxes (Sep 28 2026 jam fix, local): 2-link corners and dead ends are now owned one car at a time, like 3+ way junctions. Every turn curve bends through the node centre, so unguarded L-corner left/right turners met nose to nose and the queue behind them locked for good (~15 simulated minutes on the real roads). Guarded nodes under 24 m apart share one owner, and a car leaving a box never waits for ownership, which also covers a pickup that rejoins the road at a junction. The per-node lookups are precomputed once, with no new per-frame allocations or scans. Regression check: `node tests/traffic-junctions.cjs` runs 30 + 10 + 10 simulated minutes on the island roads, a dense 3x3 grid, a short link and a pickup parked in a junction. It checks body overlap and requires no stop over 20 s.
- Truck landing fixes avoid repeated hidden ground-landing searches while attached. Preserve generous landing acquisition, smooth approach, seated riding, driving/boost/reverse/honk, dismount and autonomous road return.
- Keeper dive / jumping header / slide ground guard (lane B, Sep 25 2026, local): the dive and jump pose from `dive.progress`/`jump.progress` inside the existing `update` (no new loop, no timers, no allocation per frame; choreo reuses one motion object per action). The ground guard runs only while a rig is diving, jumping, sliding or stumbling: ~16 exact ellipsoid-low tests on joint chain matrices (`updateMatrix` on ≤ 6 parents each), no world-matrix traversal or scene query. Fields absent ⇒ joint output identical to before (golden test `tests/player-dive-jump.cjs`). Offscreen posing stays skipped; a resumed rig re-poses the dive from its clock. Signature moves (bicycle, scissor, diving header, volley, back heel, sole roll, flick-up) and keeper save types reuse the same paths: keyframe tables are module constants, leg moves write the existing reaction channels, airborne moves pose post-solve, and the guard runs only while a move plays. Choreo reads the sim ahead with one bounded ≤160-step prediction per lofted ball, and none when there is no aerial. Measured cost not profiled on device.

Relevant code: `lib/graphics/player.ts`, `batchMeshes.ts`, `islandNpcs.ts`, `streetTraffic.ts`, `lib/town/trafficRouteSamples.ts`, `obstacleGrid.ts`, `components/Town.tsx`.

## HUD, menus, previews and mobile input

- Player position lives in `positionStore.ts`; `MovingIslandMap.tsx` subscribes separately from the large Town HUD. Position publishing is approximately every 150 ms; zone state changes only when crossing regions. Hidden/minimized map consumers unsubscribe and read the latest position on reopening.
- Field classification runs at 10 Hz, with reusable clipping vectors in `pitchVisibility.ts`. Prompt placement still tracks smoothly; coordinates are rounded to half pixels and unchanged styles/text are not rewritten. Nearest-building selection uses a scan rather than filter/sort lists.
- Normal paused menus stop the island after the first cleanup frame. Resize/appearance changes invalidate the frozen frame. Time-of-day changes retain their three-second lighting transition; onboarding retains camera motion. Resume without a large simulation catch-up.
- Previews dispose their renderer on close, pause while offscreen, reject hidden resize draws and only reapply appearance/background when changed.
- **While steering, only the 30 fps island may produce compositor frames** (heat pass 3): the joystick thumb and the local minimap are painted right after the island render, the HUD loops rest while a gameplay pointer or key is held, and nothing over the moving canvas uses `backdrop-filter` (`tests/heat-pass3.cjs` allowlist).
- Joystick feedback updates CSS/transform values directly rather than React state. Preserve the bounded rim pulse and faded arc; avoid an infinite extra animation loop or broad expensive filter.
- **Attach native non-passive gesture blockers after the joystick mounts.** Town's joystick mounts only when ready; installing them inside initial scene setup previously did nothing because its ref was null. Keep blockers scoped to the control and preserve pointer capture, multi-touch action buttons, blur/pagehide/cancel recovery and second-finger tip dismissal. Test iOS double-tap-then-hold on a real device; Chromium cannot prove native magnifier behavior.

## Effects, water and audio

- Exhaust/trail/collection particles use finite pools and skip work when disabled/empty. Known pool budgets: exhaust 112, flight trail 64, walking-ball particles 24, collection particles 72. Verify current definitions before changing budgets.
- Walking-ball charge/trail geometry sleeps when the ball is hidden during flight. Inactive rings/ghosts skip transforms. Colors are cached and only changed when equipment changes. Box/collection effects stop updating after their lifetime; sonic bursts sleep after expiration.
- Water ripples animate offsets of a prebuilt repeating texture. Do not replace this with per-frame canvas redraws, texture uploads, expensive reflections or a new independent render loop without measuring the cost.
- Continuous engine sounds reuse oscillator voices; parameter updates are throttled to about 10 Hz. Muted/zero-volume effects stop sources and avoid silent allocations. Zero effects volume must not stop music. Since heat pass 4 the shared context suspends 2 s after nothing is audible (music idle-paused after 30 s without input, no one-shots, engine or hum) and resumes on input or on demand.
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

Four visible corner floodlight banks per format explain the nighttime pitch illumination. Four shared non-shadow spotlights follow the selected/relevant visible pitch; fixed light count and zero daytime intensity avoid mode-switch shader churn. Fixtures belong to field roots, preserving isolated visibility and the existing lower-ground shadow fix. Grass retains its original rich green after the lighter tint proved washed out; nighttime fill is 0.025 and grass spot strength is 50% of the initial pass. Each of the four real corner lights uses half the previous two-light per-source strength, preserving total source intensity; futsal fill is unchanged. Daytime hemi/sun/exposure are reduced to1.65/2.35/.95 to retain richer color, with no extra rendering work. Decorative pitch pools and approach bollards were removed. Per visible field: two batched draws and 560 triangles; total ten geometries across five courts, two shared materials, no new textures or shadow passes. Four additional light calculations remain a shader cost even with daytime intensity zero. (Superseded by heat audit pass 2: outside night the pool is now hidden, so day and sunset shaders skip the four lights; only entering and leaving night switch variants.) Existing loop/sleep rules are preserved; no extra timers or animation loops. Targeted field, idle, live-frame and shadow tests pass. See `pitch-lighting-2026-09-19.md` for browser checks and four-corner illumination and daytime balance. No physical-device thermal claim.


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
- **Hover tilt (mouse only, `(hover: hover) and (pointer: fine)`):** ±14° X / ±18° Y through a critically damped spring written to `.flip` once per frame. The rAF loop runs only while the spring moves and sleeps as soon as it catches up, even with the pointer resting on the card. Leaving is judged against the card's flat box, via a document `pointermove` listener attached only while hovering. (Touch tilt was later restored; see the touch tilt section below.) Perspective is now 1400 px, so a tilted card stays on screen at 1280×800.
- **Flip:** always the CSS transition between the two faces, so it can't stop edge-on. The card is 4–6 px thick: 3 rim slices and 4 side strips, static preserve-3d layers (the rim slices are now rings shown only while turning; see the blue-back fix below). (Those earlier edge sparks were replaced; see the motion sparks section below.) The drag and flick spin was removed at the user's request.
- **Measured** in headless Chrome at 2× (median / p95 / max frame ms): hover sweep 16.7 / 16.7 / 16.8; top-bar flip 16.7 / 16.8 / 16.8–33. There were 0 rAF calls in the second after rest, both while hovering still and after leaving, and 0 on the phone at rest.
- **Not a thermal claim:** these are desktop numbers, not iPhone measurements.

## Player card touch tilt, slower phone flip, motion sparks — September 24, 2026 (local, not deployed)

- **Touch tilt is back** (user: "add that gesture back"). It is tilt and parallax only, with no spin, flip or momentum. It lives in `components/PlayerCard.tsx` (`onDown`). A finger pressed on the card that moves more than 10 px tilts the card toward the finger, using the hover mapping (±14° X / ±18° Y), the same spring, planes and glare. `pointermove` only sets the spring's target, so the one sleeping rAF loop batches the writes. The card box is cached at pointerdown. Three passive document listeners (`move`, `up`, `cancel`) exist only for one gesture. On release or cancel the card springs back flat from zero velocity and hands its transform back to CSS.
  - Below 10 px nothing is touched, so taps reach Flip, Play, the back tabs, highlights and links exactly as before.
  - A click that ends a tilt is swallowed (capture, within 400 ms), so dragging across a link doesn't open it.
  - There is no tilt with reduced motion, during a film, or within the turn plus 100 ms.
  - The grey uncollected card never gets a pointerdown (`pointer-events:none`).
  - Device orientation isn't used, because iOS asks for permission.
- **touch-action:** the card measures its nearest scroll area (a ResizeObserver on the area and its children, with no loop).
  - Where that area can scroll, the card keeps `pan-y`: a vertical drag scrolls (Chrome sends `pointercancel`, and the card springs back) and a sideways drag tilts.
  - Where it can't scroll (the binder viewer, the card reveal, and the position guide at phone sizes today), the card uses `pinch-zoom`, so every drag tilts.
  - The back's tab panel remains its own `pan-y` scroller.
- **Slower flip on phones** (`(hover: none), (pointer: coarse)`): 0.95 s on `cubic-bezier(.4,.15,.25,1.1)`, compared with 0.7 s on desktop.
  - Edge-on moves from about 90 ms to about 320 ms, and the edge crosses at about 0.5°/ms instead of about 0.85°/ms.
  - The turn light is retimed through CSS variables on `.card` (`--turn`, `--edge-out`, `--edge-in`, `--sweep-in`, `--shade-in`, `--catch`), and the lift and shadow keyframes through `PHONE_TURN`.
  - The desktop timing is unchanged.
- **Motion sparks** (`TurnSparks`):
  - **What:** 22 specks of 1–2 px (16 from the near edge, 6 dimmer ones from the far edge), emitted only from about 85° to about 140° of the turn. Their times and positions come from the real flip curve and the 1400 px perspective.
  - **Motion:** each speck is kicked ahead of its edge, outward past the opening card, as a short streak (scaleX 6→1) that slows and fades in 300–500 ms.
  - **Layer:** one layer per flip at `translateZ(320px) scale(.7714)`, so the turning card never hides a speck. It is pre-built DOM with Web Animations on transform and opacity only. It unmounts when the last speck ends, and there are none with reduced motion.
  - **Checked:** frames scrubbed at 390 and 1280 (toBack and toFront) show horizontal streaks leaving the moving edge in the direction of travel, and 0 spark nodes after the flip.
- **Verified** with Playwright at 390×844, `hasTouch` and `isMobile`, using CDP `Input.dispatchTouchEvent`:
  - **Tilt:** the card tilts mid-drag (px/py about −0.8, rotateX about 12°, rotateY about −15°) and returns to rest on release.
  - **Taps:** a 3 px wiggle tap does nothing. Flip, History and Top Plays taps work. A tilt that starts on a tab doesn't press it. The back tilts around 180°.
  - **Still cases:** the grey card and reduced motion don't tilt.
  - **Desktop:** hover gives exactly 8.4° / −10.8° at (0.2, 0.2) and rests after leaving.
  - **Position guide:** it tilts sideways. When its scroll area overflows, it switches to `pan-y` and a vertical drag scrolls it (+185 px).
  - **Idle:** 0 rAF calls in 1 s at rest.
- **"Solid blue back" fix:** after the card resized (the reveal's bottom sheet hiding or showing, a window resize), Chrome's compositor sometimes drew the card's flag-coloured rim slab over the showing face, and kept it there. The DOM and computed transforms were correct. The failure was intermittent but, once in, persistent: in bad runs 100 % of flips at 1280 in the reveal. None of these cured it: moving the back 30 px forward, `backface-visibility`, `will-change`, nudging the rim's transform, moving the rim first in paint order, or removing its nested `preserve-3d` wrapper. Only hiding or flattening the rim did.
  - **Fix:** the three rim slices (now direct `.rim` children of `.flip`, as are the four `.side` strips) are 14 px rings rather than full slabs, so they can never cover a face. They are also `visibility:hidden` unless the card is turning (`data-turning`, set for the turn plus 80 ms by one timer, and for a host's own spin found on mount). Edge-on, a ring has the same outline as a slab, and at rest the faces and trim covered the rim anyway.
  - **Verified:** 0 blue backs and 0 fronts showing through across 32 backs per viewport in both the binder viewer and the reveal, at 390 (touch) and 1280, with the card resized every 4 flips, plus the reveal agent's `r.mjs` runs.
- **Added runtime cost:** during a touch drag, the same spring loop hover uses. During a flip, 22 short compositor animations on one layer. Nothing at rest. These are emulation checks, not iPhone temperature measurements.

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
  - Choosing fades the other cards once (0.24 s), and the chosen card flies into the reveal (1 s of WAAPI transform/opacity; superseded by the September 25 flight below).
  - The revealed PlayerCard's looping scenery is paused by the offer's CSS, so the dialog has no endless animation. Its film, hover tilt and foil turn behave as in the binder.
  - PlayerCard's chunk is imported only once an offer is open.
  - With reduced motion there is no flight or twinkle, only the reveal's 180 ms opacity fade (September 25).
- **Checks:** `scratchpad/pickcard/ui.mjs` at 390×844, 375×667, 1280×800 and reduced motion, plus `bg-probe.mjs` for the ball and Paths cases. No phone thermal claim.

### Choose → reveal flight — September 25, 2026 (local, not deployed)

- **Complaint:** "the card seems to stretch and isn't smooth" after choosing.
- **Cause, from recorded frames:**
  - The old spin put `scale()` inside the 3D turn on `.flip` (`rotateY(-360deg) scale(.62)` → `rotateY(-180deg) scale(.9)` → `rotateY(0) scale(1)`). At 1280×800, between the back and the second edge-on, the back face widened past the screen edges for 2–3 frames when it should have narrowed.
  - The deck's MiniCard was cut to a smaller (×0.62) PlayerCard at a different place and aspect ratio (5:7 vs 5:7.6).
  - The top bar, heading, note and stars popped in on the same frame.
- **Fix (`components/CardOffer.tsx`, `CardOffer.module.css`; PlayerCard unchanged): a FLIP flight, `FLY_MS` 1000, `cubic-bezier(.42,0,.22,1)`.**
  - One shared progress drives four WAAPI animations with identical timing:
    - the card's individual `translate`/`scale`: uniform, applied after its own `perspective()`, so the projected card scales and never skews;
    - `rotateY` alone on `.flip`, −360° → 0°;
    - an opacity step on PlayerCard's stage;
    - the MiniCard's own transform, with the same lens scaled to its height.
  - The MiniCard turns 0 → 90° from its deck rect. At edge-on (p = .25) the PlayerCard takes over at −270° with matched height, so the aspect change never shows. It lands with a 1.8 % overshoot.
  - The flight is built paused in the commit that mounts the PlayerCard. PlayerCard's host-spin check therefore sees it and shows the rim rings for the whole turn. It plays two frames later, after that first paint.
  - The deck stays mounted (inert) under the reveal until landing. The note, caption, Choose and arrows fade in 0.2 s.
  - The reveal's top bar, Play pill, heading and note fade in 0.28 s after landing. The stars mount on landing.
  - Before the flight, `warm()` awaits the PlayerCard module and fonts, and waits at most 150 ms for the webp decodes. The masks are already cached from the MiniCard and are fixed-size, so they can't reflow. The first cap was 700 ms, and a fresh decode alone took about 225 ms at 4× CPU.
  - `--sheet-h` is now measured in a layout effect, so the card's final size is known before the flight measures it.
  - Nothing runs after landing: all four animations use `fill:none` (the hidden MiniCard, `forwards`, unmounts with the deck).
  - Reduced motion: no flight, only a 180 ms WAAPI opacity fade on the reveal. `globals.css` sets `*{animation:none!important}` under reduced motion, so a CSS keyframe fade wouldn't run.
- **Validation:**
  - Recorder: `scratchpad/revealanim/rec.cjs`, a CDP screencast at 0.25× animation rate. Contact sheets: `sheet-{before,after}-{390,1280}.jpg`.
  - Frame timing during the motion window (rAF): phone 390×844 with touch and 4× CPU is 16.7 / 16.7 / 16.8; desktop is 16.7 / 16.7 / 16.8. There are 0 frames over 20 ms in the motion and 0 running animations afterwards.
  - Tap to motion at 4× CPU is about 130–220 ms, including one 83 ms PlayerCard mount frame during the paused lead-in. Unthrottled it is about 80 ms.
  - `touchtilt/blueback.cjs 16 reveal`: 0 blue backs at 390 and 1280. The back stays cream through the flight in the frames.
  - `revealanim/behave.cjs`:
    - Escape is ignored before and during the flight, and works as Done after it.
    - Focus goes to Done.
    - The rim shows mid-flight and is gone at rest.
    - The reduced-motion fade runs.
  - Not a thermal claim.

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
- The answered or feedback state still renders at 30 fps (phone) until the next question or close. That is unchanged and could be a follow-up once the replay ends. (Done: see "Answered quiz questions sleep once the replay ends" below.)
- These are emulation render counts, not iPhone temperature measurements.

## My card removed — September 25, 2026 (local, not deployed)

The user asked to remove the "Your card" feature (the child's own card on the binder's inside front cover, added September 24). Its creator, IndexedDB store, on-device riso print, cover page, PlayerCard `custom` prop and PlayerArt `masks` prop are gone, so none of their runtime costs remain. Both binders open on their first card page again.

## Binder card viewer: static heavy blur — September 25, 2026 (local, not deployed)

The user asked for the binder behind a lifted card to be blurred much more. The viewer's scrim stays a flat tint (a little darker, `#12302ae0`) with no `backdrop-filter`. A full-screen backdrop blur would be re-run on every frame the lifted card's live scenery and films redraw above it. Instead, while the card is flying in or open, the binder layer, the dock and the dialog's header panel get a plain `filter: blur(18px)` (a `:has()` rule on the viewer's `data-phase` / `data-flying`). All three are inert and static then (no page turn, no pulse), so the blur is painted once and reused. It eases off over 0.3 s as the card flies back, and there is no transition with reduced motion. Validation: headless Chrome screenshots at 1280 × 800 and 390 × 844, and `tests/card-collection.cjs`. This is reduced work in principle, not a measured iPhone temperature change.

## Player card flip spins one way — September 25, 2026 (local, not deployed)

Every Flip now turns the card the same way (user: like a coin), with the full turn light and sparks each time. The flip layer's angle (`--spin`) grows by 180° per Flip and is folded back to 0° / 180° with the transition off once the turn settles (before the tilt may start). This adds no work: one CSS variable write per Flip and one timer. The turn light, sparks and lift are the same one-shot bursts as before. Reduced motion still flips instantly with no burst. Validation: headless Chrome mid-turn frames for three Flips in a row at 1280 × 800 and 390 × 844, and `tests/card-collection.cjs`, `tests/card-rewards.cjs` and `tests/iconic-play-ui.cjs`.

## iPhone quick fixes — September 25, 2026 (local, not deployed)

- **Bottom gap:** the Paths/cards dialogs, the Pick-a-card dialog and the phone `.town-app` take their height from `inset:0` instead of `100dvh` (Safari could leave dvh at the toolbar-expanded height after the toolbar collapsed, showing the tan page below). `html, body` are now island green (`#244d40`). No runtime cost.
- **Bottom gap, follow-up (Sep 25 2026, local):** the phone/tablet rule in `app/globals.css` still forced `dialog[open]{height:100dvh!important}`, which beat the `height:auto` + `inset:0` fix on every touch device. It now uses `height:auto!important;max-height:none!important`, and the first panel uses `height:100%`. Guarded by `tests/device-guards.cjs` (checks 2/2b) and by the stale-dvh simulation in `tests/e2e/paths.spec.ts` / `cards.spec.ts`. The same pass added long-press callout guards and 44px hit areas (CSS only, no runtime cost), 16px form fields, and pitch-quiz cards that let taps through to the pitch (`data-pitch-pick`). See docs/testing-devices.md.
- **Binder search:** the dock hides while search is open and the search bar takes its place at the bottom of the visible area, above the keyboard (visualViewport `resize`/`scroll` listeners only while search is open, as before). Results are capped to fit above the field.
- **Page turn over the header:** the binder layer is split into a static art layer under the header (z 5) and a transparent, pointer-events-none binder layer over it (z 11), so a turning sheet passes over Back and Done. Nothing toggles when a turn starts.
- **Found pocket:** deep green ring with a white edge and a pink halo; its pulse runs 4 times and stops.

## Player card tilt: no repaint per frame — September 25, 2026 (local, not deployed)

The user found the card tilt laggy on an iPhone. Measured in headless Chrome (390 × 844, DPR 3, touch, 4× CPU throttle, a 3 s circular drag on the binder viewer's card; `scratchpad/tilt/perf.cjs`):

| | Paint events | Paint ms | Raster tasks | Style recalc ms | Touch moves handled |
|---|---|---|---|---|---|
| Before | 725 / 689 | 157 / 162 | 1031 / 969 | 729 / 752 | 91 / 85 |
| After | 6 | 1 | 249 | 126 (idle baseline 69) | 173 |

Causes and fixes (`PlayerCard.tsx`, `PlayerCard.module.css`, `PlayerArt.tsx`, `PlayerArt.module.css`):
- Every frame repainted the backdrop SVG plane, the parallax box and the page layer: the SVG planes were transformed as SVG roots, and `--px/--py` were written on `.card`, which restyled the whole card. The SVG planes now sit inside HTML boxes that take the transform, and the spring writes each plane's `translate3d` directly. Only the foils get `--px/--py`.
- The foil glare was a `radial-gradient` re-centred on `--mx/--my` (and a `background-position`), which repainted a full-card color-dodge layer each frame. It is now painted once, on oversized `::before`/`::after` layers that move by `transform` (`will-change` only while `data-motion`).
- The planes kept a 0.08 s transform transition during the spring, restarting every frame and trailing the finger; it is off while `data-motion`.
The look is unchanged (before/after screenshots at rest and tilted, legend and star). Frame times in headless were already ~16.7 ms, so the gain is main-thread and raster work, not a measured iPhone frame rate or temperature.

## Pick a card deck sparkle — September 25, 2026 (local, not deployed)

- 18 gold ✦ stars twinkle around the front card for as long as the choosing deck is open (user asked for them to keep going). This is the dialog's only endless animation: transform/opacity only (compositor), the island render loop is asleep behind the dialog, and the stars are removed once a card is chosen or the dialog closes. None with reduced motion.
- Added runtime cost: 18 small composited text layers while the deck is open; no rAF, timers or layout. Not measured on an iPhone.

## Answered quiz questions sleep once the replay ends — September 25, 2026 (local, not deployed)

**What changed.** The quiz sleep above now also covers an answered question once nothing on the pitch is moving. Same mechanism, no new loop.
- **Condition** (`Town.tsx` `animate()`, one line): the loop may sleep when a quiz question is waiting (`answer === null`) **or** answered with its pose no longer advancing: `!teachingPoseAdvances(quiz, quizOutcomeStep(quiz))`. That is false while an outcome replay plays (right answer, "Show me", "Replay", "Continue replay"), and true when the question has no replay, the replay has reached 1, or it is paused.
- **Settle.** The same 1.2 s grace and camera-still check apply, so the replay's last poses and the camera's move to the feedback shot finish before it sleeps. The idle key now includes `answer` and `outcomeProgress`, so an answer, the replay's end or a pause restarts the grace.
- **Waking.** Everything that woke the waiting question still wakes it (Try again and Next re-render `FieldLearning`, which calls `onWake`; canvas gestures bump `quizInput`; resize bumps `resizeRevision`; the camera button). `QuizReplay`'s own button (Show me / Pause / Replay / Continue replay) only re-renders itself, so it now calls a new `onWake` prop, which `FieldLearning` passes through.
- **Unchanged:** the replay always plays in full, because it only advances on rendered frames and the loop cannot sleep while it advances.

**Render counts** (dev server :8092, `perf2/quizafter.mjs m|d`, `learnf_roles31`: q4 visual trueFalse, q1 3D path tap; load 2.7–5; `window.__fi2.renderStats.rendered`). "Rest" is the 6 s window starting 2 s after the replay ends (or 2 s after the answer when there is no replay):

| Case | Phone before → after, rest 6 s | Desktop before → after, rest 6 s | During replay (unchanged) |
|---|---|---|---|
| Visual, wrong | 180 → 11 | 361 → 17 | no replay |
| Visual, right | 179 → 9 | 360 → 18 | no replay |
| 3D tap, wrong | 180 → 8 | 360 → 10 | no replay |
| 3D tap, wrong + Show me | 180 → 0 | 360 → 0 | phone 138 / 134 frames over ≈4.5 s, desktop 263 / 274 |
| 3D tap, right (autoplay) | 180 → 0 | 360 → 0 | phone 123 / 124 over ≈4.1 s, desktop 244 / 246 |

Phone is 390×844 DPR 3, touch, 4× CPU throttle; desktop is 1280×800 DPR 2. The few frames left in the rest window for the non-replay cases are the tail of the camera's move to the feedback shot. After that the count stays at 0 until the child acts.

**Checks** (all pass on phone and desktop):
- `quizafter.mjs`: each replay reaches `outcomeProgress` 1; the rested frame matches a forced fresh render (0–7 px, plus 21 px once on desktop, out of 2.9 M / 4.1 M); Replay, Try again and Next question each wake the loop.
- `qa-pause.mjs`: Pause mid-replay stops rendering (0 frames in 3 s, progress frozen); Continue replay wakes it and the replay finishes; then 0 frames. From the answered rest, the camera button, a drag on the pitch and a resize each wake it and it settles again (3.5 s, 3.5 s, 1.4 s).
- `quizsleep.mjs` (the pre-answer checks) passes on desktop and on two of three phone runs. The third phone run had one stale-frame check at 214 px (limit 200) on "3D after Try again", at load 7. That is the pre-answer path, which this change leaves alone. The earlier note measured 0–65 px of limb anti-aliasing noise there, and the reruns gave 57 and 82 px.
- Gates: tsc, `npm test`, lesson-gestures, quiz-replay, quiz-outcomes and visual-quiz pass. `card-rewards.cjs` fails on a source-slice assertion, because `CardOffer.tsx` was being restructured in parallel and its `:<div className={styles.stage}` marker no longer exists. That failure is unrelated to this change.

**Tradeoffs.** The feedback highlight, callouts and routes are drawn from the session state, so a slept frame shows them in full. The posed players' small idle motion stops, as it does before an answer. These are emulation render counts, not iPhone temperature measurements.

**Found in passing (not changed).** The phone 30 fps cap in `animate()` (`lastRendered=now-(now-lastRendered)%(1000/30)`) can lock at 60 fps. When the gap between rendered frames lands in [32.3, 33.3) ms, the remainder is the whole gap, so the next vsync passes the `< 1000/30-1` test again. A simulation with ±0.05 ms of vsync jitter averages 42.8 fps instead of 30. One dev-server run showed a sustained 60 rendered frames/s on the phone profile, and the next run did not. A fix could be `now-Math.max(0,(gap+1)%(1000/30)-1)`, which stays at 30.0 in the same simulation. It needs its own before/after measurement. (Fixed with a slot limiter instead: see "Phone 30 fps cap holds at 30" below.)

## Binder back turns: the prebuild follows the direction of travel — September 25, 2026 (local, not deployed)

**Cause of the desktop back-turn stutter** ("Left over" in the Sep 24 evening round). The idle prebuild always predicted "next" (`prepare(start<last?step:-step)`). A mouse turning back several pages keeps resting on the Previous arrow, so no new `pointerenter` prebuilds the back turn. Every back turn after the first was therefore unprebuilt, and desktop Chrome stalled one frame about 0.2 s in while it rasterised the newly shown sheet. `gap.mjs` was extended to log which turn was prebuilt at each click (`perf2/gap2.mjs`). It showed `prep=next` on every back turn that stalled, and `prep=prev` on the first back turn, which never stalled.

**Fix (`components/CardCollection.tsx`).**
- A `lastDir` ref is set when any turn starts (dock, keys, corners, drag, tab, queued taps).
- The idle prebuild uses that direction. At either end of the binder it falls back to the other direction. It resets to forward when the binder changes.
- Still at most one prebuilt turn, built by the same interruptible transition. Hover, focus and pointerdown prebuilds are unchanged.

**Phone end-of-turn sliver (`components/BinderLeaf.tsx`, `away` prop).**
- On a portrait phone the single page's hinge is at the screen edge. A forward-turned sheet past about p = .65 lies off-screen except for a 1–6 px sliver over the binder's left edge and rings. That sliver then vanished when the turn settled.
- That was the real content of `tests/card-collection.cjs`'s 1.9% phone snap difference. The page-corner buttons made up the rest.
- The leaf is now hidden there the same way a prebuilt sheet is (opacity .001, so its tiles are kept). A reversed back turn shows it again below .65.
- The switch happens where the sheet's right edge has reached x ≈ 2 px, so no pop is visible.
- It only applies when the binder reaches the screen edge (`(W-binderW-tab)/2+cover<=8`). A landscape phone, with room beside the binder, still shows the turned sheet.

**Measurements.**
- **Builds:** two production builds from snapshots that differ only in the prediction line (`scratchpad/perf3/snapB` on :8093 = before, `snapC` on :8097 = after), run interleaved. The machine load average was 5–11, so single frames are noisy; compare counts.
- **Scripts:** `perf2/gap2.mjs` (with `SEQ=1`, 4 next then 4 prev, hovering before each click) and `perf2/backrest.mjs` (4 forward, then back to page 1/the cover, then rest).

| Desktop 1280×800 DPR 2 | Before | After |
|---|---|---|
| Consecutive back turns 2–4, frames > 34 ms during the motion (gap2, 3 hover→click gaps × 2 runs) | 19 frames in 18 turns, 67–200 ms | 5 frames in 18 turns, 50–83 ms (all in the loaded first run; 0 in the second) |
| backrest back turns 2–4, frames > 34 ms in motion | 6 of 6 turns stalled (50–83 ms) | 0 of 8 |
| Prebuilt turn at click | `next` on every back turn after the first | `prev` on every back turn |
| Dev server, same script (before → after) | 50–133 ms on back turns 2–4 | 0 in 3 runs |

| Phone 390×844 DPR 3, 4× CPU | Before | After |
|---|---|---|
| Back turns (5, down to the cover), frames > 34 ms in motion | 9 and 2 frames (2 runs) | 2 and 3 frames (2 runs) |
| First back turn after going forward (touch has no hover) | Not prebuilt, 50–150 ms | Same: not prebuilt, 67–83 ms |

**Cost.**
- One prebuilt turn, as before. Composited layers at rest while travelling back: desktop 65 layers / 12.83 Mpx vs 64 / 12.53 with "next" prebuilt (about +0.3 Mpx, roughly 1.2 MB at 4 B/px). Phone 54 / 4.76 Mpx vs 56 / 4.95.
- At rest after the sequence, before and after alike: 0 rAF, 0 timers, 0 running animations, 0–0.4% main thread, and 0 swaps, paints and raster tasks in a 3 s trace.
- Prebuilding both neighbours was not needed and would double the hidden sheet and page copy, so it was not done.

**Not fixed.**
- The first back turn after forward turns on touch is still unprebuilt, because touch has no hover to predict it. On a spread, a finger landing on the left page already prebuilds it. A phone's single page doesn't.
- The frames after landing (page swap plus the next prebuild) are unchanged.

**Tests made robust.**
- `tests/card-collection.cjs` waits for conditions, not fixed sleeps:
  - Binder open: pockets present and a page announced.
  - The held marker `__fiBinderRelease`.
  - The settle marker: no `data-turning` and no unhidden leaf.
  - The prebuilt leaf.
  - All pocket portraits (CSS mask images) loaded and decoded.
- The page-corner buttons, which are hidden under the pages while a sheet turns, are the only masked region.
- Snap difference, now deterministic: 0.079% at 1440 and 0.125% at 390, where the phone had been 1.92–1.99%. The 2% limit is unchanged.
- Pass B's bundle-rewriting route no longer throws when a chunk is still loading at context close.
- `tests/iconic-play-ui.cjs` polls instead of sleeping:
  - The guide opening.
  - The card box settling.
  - The film running: a Stop label and N draws.
  - The next draw, up to 10 s, since narration can hold the clock under load.
  - All assertions are unchanged.

These are desktop and emulation numbers, not iPhone temperature measurements.

### September 25 — expressive flight poses (local, not deployed)

Free flight (twin jet, helicopter pack, Iron Man suit) now blends between seven body poses: Superman (both fists forward, body near horizontal, legs together), one-arm Superman (left or right), wing glide, dive (landing descent), climb/launch (take-off, blast) and a loose hover when still. A steady cruise switches between the Superman variants every 4–9 s at random; turns hold the pose and bank harder; the forward dash is always Superman. Flying car, mini plane, rocket board, parachute and fall keep their own poses.

- Code: `lib/graphics/flightPoses.ts` (selection + weights), called from the existing `flightMotion.update`; `player.ts` blends 10 joint channels inside the existing jetpack branch; Town only passes position, height, jet action and jetpack kind into the one `flightMotion.update` call (and exposes `__fi2.flightPoses` for debugging).
- Cost: no new loop, no per-frame allocation (fixed `Float32Array` weights, reused style object). All weights share one damping rate (~0.45 s, 0.3–0.6 s including joint lag) so they never sum past 1. With `dt = 0` (paused or sleeping loop) nothing advances and no variant is picked. Node micro-benchmark: about 5 µs per frame for selection and blending, plus about 4 µs per rig update. Phone profile (390×844, DPR 2, 4× CPU throttle, five A/B pairs while cruising): median rAF interval 16.7 ms and p95 33.4 ms both with and without poses; median script time per rAF 11.0 ms with poses and 11.7 ms without. That difference is window-to-window noise, not a saving.
- Reduced motion: one calm glide, lying less flat (pitch ≤ 0.8 rad), no bob and no switching.
- Regression check: `node tests/flight-poses.cjs`. `tests/movement-work.cjs` (mesh-merge count) and `tests/player-body-review.cjs` (walking support height) fail identically at HEAD without this change.

## Phone 30 fps cap holds at 30 — September 25, 2026 (local, not deployed)

**Bug.** The coarse-pointer cap in `Town.tsx` `animate()` (`if(coarse&&now-lastRendered<1000/30-1)return; lastRendered=now-(now-lastRendered)%(1000/30)`) let phones render up to twice as often as intended. When a rendered gap was just under 33.3 ms (including exact 2 × 16.67 ms vsyncs, through floating-point rounding), the remainder was the whole gap, `lastRendered` did not move forward, and the next vsync also passed.

**Fix.** A pure slot limiter, `lib/town/frameCap.ts` `frameCapSlot(now, slot)`, replaces those two lines (one line in `animate()` plus the import):
- Rendered frames sit on a fixed 33.3 ms grid. A frame renders once it reaches the next slot, with 3 ms of early tolerance for timestamp jitter. The slot then advances by exactly one interval, so the grid never creeps toward `now` and no second can hold more than 30 slots.
- If a slot is missed (a long frame, dropped vsyncs, or the first frame after a sleep), the grid restarts at `now`. It doesn't burst to catch up.
- This works for 60 Hz (every 2nd vsync), 90 Hz (every 3rd) and 120 Hz ProMotion (every 4th). The 3rd 120 Hz vsync arrives 25 ms after a slot, which is well outside the tolerance.
- **Physics unchanged.** `dt` is still the real time since the previous rendered frame (clamped to 50 ms as before), and movement still runs on the fixed 1/60 s accumulator. Desktop (not coarse) is uncapped as before.

**Simulation** (60 s of vsync timestamps, three seeds; `tests/frame-cap.cjs` and scratch `fcap/sim.cjs`):

| Timing | Old cap | Note's `(gap+1)%…-1` idea | New slot cap |
|---|---|---|---|
| 60 Hz, no jitter | 47.0 fps | 30.0, gaps alternate 16.7 / 50 ms | 30.0, even 33.3 ms gaps |
| 60 Hz, ±0.05–1 ms | 42–45.6 | 30.0 | 30.0 |
| 120 Hz, no jitter | 47.0 | 30.0, gaps 25 / 41.7 ms | 30.0, even 33.3 ms |
| 120 Hz, ±0.05–1 ms | 42–45.5 | 30.0 | 30.0 |
| 120 Hz, 20 ms frames | 37.6 | 30.0 | 30.0 |
| 60/90/120 Hz, 5% dropped vsyncs | 43.5–44.6 | 29.9–30.0 | 29.9–30.0 |

The new cap never exceeds 31 frames in any 1 s window.

**Browser measurement** (dev server :8092; phone profile is 390×844 DPR 3, `hasTouch`, `isMobile`, 4× CPU throttle; `window.__fi2.renderStats.rendered` per second; scratch `fcap/fps.mjs`):
- "60 Hz" and "120 Hz" replace `requestAnimationFrame` with a synthetic vsync. It delivers callbacks once per refresh with a grid timestamp ±0.3 ms, and a slow frame misses the next vsync.
- "Native" is headless Chrome's own rAF. Its timestamps are regular enough that the old cap already held 30 there.
- Distance is metres per second from `__fi2.location` while holding an arrow key.

| Phone profile | Before: rendered fps | After: rendered fps | Distance/s before → after (steady seconds) |
|---|---|---|---|
| 60 Hz, flying | 39.1 (up to 44.6) | 30.2 | 33.7–34.7 → 33.7–34.9 |
| 60 Hz, walking | 42.5 (up to 46.2) | 30.1 | 3.64–3.73 → 3.69–3.70 |
| 60 Hz, driving (moped) | 45.8 (up to 47.7) | 30.0 | see note |
| 60 Hz, jetpack hover | 38.2 | 30.1 | — |
| 120 Hz, flying | 37.4 (up to 43.3) | 26.7 (29.7–30.5 once load settled) | 32.7–34.9 → 32.8–34.0 |
| 120 Hz, walking | 36.1 (up to 41.1) | 28.0 (29.7–30.4 most seconds) | 3.66–3.68 → 3.57–3.80 |
| 120 Hz, driving | 42.9 (up to 48.8) | 30.0 | 23.4–27.6 → 23.2–28.5 |
| Native rAF, fly / walk / drive | 30.0 / 30.0 / 29.9 | 24.6 / 30.0 / 30.0 | 3.69 walk both |

- Seconds below 30 fps after the fix are frames that took longer than 33 ms under 4× throttle on a machine at load 12–18 (other agents were building). The cap only removes frames; it never delays a frame the device could draw on its slot.
- The moped run reaches an obstacle after 2–4 s in every run. Its first seconds match: 24.3 / 23.1 at the native 30 fps before, and 24.2 / 28.0 / 23.3 after.
- **Desktop** (1280×800, native rAF and synthetic 60 Hz) is still at 59.7–60.0 rendered fps for fly, walk and drive. Distances match the phone: 3.68–3.74 m/s walking and 33.6–34.4 m/s flying.
- **Input.** Arrow-key movement and speed are unchanged. The longest wait before a new input is drawn is still one 33.3 ms slot on phones.

**Sleeps still work** (phone profile):
- The map and settings modals render 0 frames in 3 s, and 90 frames per 3 s after closing.
- `perf2/quizsleep.mjs m`: ALL PASS. Waiting questions sleep; drag, tap, Try again and Next wake the loop; slept frames match fresh renders.
- `perf2/quizafter.mjs m`: ALL PASS. Replays play to the end at about 30 fps (133 frames over 4.45 s), then rest at 0 frames; Replay, Try again and Next wake the loop.

**Gates:** tsc, `npm test` (now includes `tests/frame-cap.cjs`), player-motion, flight-poses, offshore-flight, idle-flight-effects, jetpack-actions, parachute-landing and landing-marker all pass. `tests/movement-work.cjs` fails on the mesh-merge count (5 vs 7). That failure is from the parallel pose work and fails the same way without this change (see the note above).

**Effect.** When rAF timestamps jitter, as real iOS/Android vsync does, phones now render up to about a third fewer frames: about 30 instead of 36–46 rendered fps. This is **reduced render work in emulation, not a measured iPhone temperature**. A real-device check (Safari Web Inspector timeline on a 60 Hz iPhone and a 120 Hz ProMotion iPhone) is still to do.


### 2026-09-25 — arcade mobile and motion follow-up

Shared arcade poses reuse state/joint arrays and add no render loop. Mobile remains capped at30fps; fixed frame slots replace threshold timing for more even cadence. Net vertices update only during response/reset; effects remain bounded. Rotation pauses Strikers and clears held input. Paused/hidden/settled states retain sleep, with Tennis a bounded pose settle tail. Deterministic articulation checks pass at 30/60/120Hz; mobile browser checks are emulation, not physical phone heat evidence.

### Reactive Pinball and island-style arcade controls

Pinball adds three reused defender decision states, sampled at100ms, and one committed keeper-dive timer; existing480Hz collision substeps integrate bounded movements. Existing rigs articulate the block/dive; no extra meshes, render loop or particle pool. Impact feedback uses one bounded canvas transform in the existing render loop, decaying exponentially and disabled for reduced motion. Mobile ordinary touch play scored and completed failure/retry without errors; physical heat unmeasured. Arcade controls reuse the main app's cached paper-grain texture, cream rims and green/coral/lavender/blue palette, preserving touch sizes and safe areas. Local only.

### Pinball dazed outfield defenders

Separate boot/torso contacts reuse the existing bounded physics loop. Three fixed star groups (nine shared-geometry meshes total) are hidden outside a2second daze; reduced motion uses static stars. Fallen defenders skip blocking/collision, then recover. The ready-state sleep predicate permits this bounded recovery tail. Keeper logic is exempt. No new loop, timer, asset download or unbounded pool; local only, physical-phone heat unmeasured.

### Breakaway goal-impact audio

Goal bursts now add a short low-frequency impact and filtered net rattle through the existing gesture-unlocked AudioContext. One0.24second noise buffer is generated lazily and reused; transient nodes disconnect on completion. Existing mute/volume preferences apply, including zero volume. No audio loop, recurring timer or downloaded asset. Typecheck passes; automated browser checks exercise the callback but do not establish subjective sound quality or physical-phone heat.

### Breakaway varied tackles and goal disassembly

Three defender roles reuse the existing six-rig pool; kit materials are created only for Runner and explicitly disposed. Attack reach uses fixed reused role constants. Goals reuse their frame pieces plus three prebuilt net panels and three crossbar fragments per pooled goal. The1.2second burst resets transforms on reuse and then hides; reduced motion uses a small static scatter without bounce/spin. No new render loop or per-goal geometry creation. Simulation checks cover extended-foot collision, low-tackle jump/slide responses, role variety, warning time at maximum boost and bounded pools. Mobile fixtures confirm twelve burst pieces, hidden intact frame, outward movement and reset; ordinary touch run scored3goals over595.67m. Production build passes. Local only; no physical-phone thermal measurement.

### Shared island rigs in all four arcade games

Replaced arcade block figures with the main island `createPlayer` rig, retaining rigid-part merging and cached mesh transforms. Each actor owns reusable motion intent and virtual-travel state; no additional animation loop. The island solver supplies grounded gait and strike/slide poses. Breakaway removes its duplicate short-leg IK and follows the island dribble contact lane. Disposal releases rig-owned geometry, costumes and shared spine-surface references before the stage traverses remaining scenery.

Saved avatar customization is loaded once for the Breakaway hero. Shot power is cached across release, and restart clears adapter travel/action state without moving fixed actors. Main rig detail costs more visible render work: Runner fixture samples172 desktop/92 mobile calls; prior scenes differ, so these are budgets to monitor, not a controlled before/after benchmark. Renderer resolution/caps unchanged. Mobile Runner ordinary play completed3goals over647.70m; all4simulation suites pass. Physical-phone heat and native Safari remain unverified. Local only.

### Shirt back numbers (September 25, local, not deployed)

`lib/graphics/shirtNumbers.ts` puts Barlow Condensed Bold (SIL OFL; ten figure outlines generated into `shirtDigits.ts` by `scripts/gen-shirt-digits.py`, so there is no web-font load race) back numbers on the procedural rig. Every number on every rig shares one 880×128 digit atlas (baked once from Path2D in ~2 ms, mipmapped, anisotropy 4) and one ~180-vertex panel geometry per body shape; there are no per-player canvases or textures. The panel is a hidden child of the jersey that shares the jersey's spine morph weights (no per-frame work); its material colour carries a number/ink code, so `playerBatch` draws all visible numbers in a match as **one** extra instanced draw (instance colour = code) with no shadow pass (`userData.batchShadow=false`). The fragment shader lays out 1–2 digits (two digits ×0.9, tight tracking, flicco's luminance ink rule, a soft dark keyline for white ink) and compensates torso width scaling; the vertex shader moves the whole panel out of the clip volume when the digit would be under 6 CSS px tall (fade to 9 px), so distant players cost only a vertex pass over the small panel. Unnumbered rigs are unchanged (the panel stays hidden and is skipped). `tests/shirt-numbers.cjs` covers glyphs, atlas cells, ink, layout, jersey conformity, orientation from behind and single-batch drawing. No physical-phone thermal claim.

### Bean costumes (September 25, local, not deployed)

`lib/graphics/beanCostumes.ts` refits the animal club costumes for the bean skin (docs/bean-characters/CONTRACT.md, lane E).
- **Parts:** vertex-coloured and merged per joint, at most 7 meshes per costume (classic costumes used up to 29). They share one material for every costume. Geometry is cached per costume × build and shared by every wearer. There are no per-frame updates or rebuilds; the parts ride the solver's joints.
- **Onesie pattern:** one 256² canvas per costume, created on demand and shared by every wearer. It is sampled by a `BeanMaterial` subclass on the rig's own data row, so the face, expression and number cost nothing extra.
- **Hair and hats under the hood:** moved to layer 31 (not drawn, no shadow).
- **Added cost while a costume is worn:** up to 7 draws and about 4.2k triangles for the costumed rig. These are emulation numbers, not iPhone temperature measurements.
- **Colours (user decision, Sep 25 2026):** club home-kit colours (`CLUB_KIT_COLOURS`), no sashes (only a dog collar). No change in cost.

## Island audio: idle silence, no ocean (Sep 26 2026)

- **Ocean ambience removed (user request).** `lib/audio/islandSound.ts` no longer synthesizes, loops, restarts or fades an ocean buffer (the 16 s generated buffer, its source/filter/gain and the audio-clock hook are gone). The bottle intro's water and float still use the visual `sampleBottleOcean` envelope, now on page time; the cork pop and the music pause while the bottle is open are unchanged. This supersedes the ocean-loop notes above.
- **No idle clicks.** Hover/slide ticks need input in the last 400 ms. 3D scene hovers (character, NPC, buildings, ferry) go through `sound.sceneHover(flying)`: they need a pointer move (held keys sweep the camera and a resting cursor's ray) and are off in flight, so flying plays only the jetpack hum, music and direct-action sounds (boundary, landing, etc.).
- **Fades instead of cuts.** Ride hums, the truck engine and forced stops (blur/mute) ramp to zero over 40 ms before `stop()`; a hidden page still hard-stops because the context suspends at once.
- **Validation:** `tests/idle-audio.cjs` (in `npm test`), `tests/bottle-audio.cjs`, and `scripts/check-idle-audio-browser.cjs` (dev server on :8092): zero sound starts over the idle window at a pitch, traffic lane, NPC plaza, parked moped, flying idle and flying on held keys; zero abrupt cuts when parking. Cost is lower (no ocean buffer or source); no device temperature claim.

## Breakaway return-kick encounters — September 26, 2026 (local)

Lateral defender movement now follows actual velocity into native jockey footwork; close challenges commit instead of tracking late cuts. Normal centred shots can be trapped and returned after a 0.3 s wind-up, with a fixed interception-time aim. The existing four football meshes/shot records are reused for trap, outgoing and returned paths; no extra projectile pool, renderer or animation loop. Native kick/charge channels handle the body. Unit checks at 30/60/120Hz and actual desktop/touch return exchanges pass. Mobile testing is emulated, not thermal evidence. See arcade-breakaway-2026-09-26.md.

## Independent arcade and drawing controls — September 26, 2026 (local, not deployed)

The walkable arcade is a separate `/arcade` document, reached from Town with full navigation. Cold game links defer the room import, and opening a machine disposes its room renderer, crowd, audio and assets before mounting the selected game. Back recreates the room at the last cabinet. The physical entrance and Exit button fade into a document return to the island. Desktop and emulated-phone browser checks verify cold-route absence of island/world requests, no surviving island runtime after entry, hidden-room sleep, audio gesture unlock/mute/disposal, actual game play/back, and walking out with keyboard or touch input.

The larger room uses the same coordinates on desktop and mobile with a close follow camera. Visible NPCs, attract screens and marquee bulbs share the room clock: 60 fps desktop / 30 coarse-input while active, 15 fps visible ambience after twelve quiet seconds, zero when hidden or a game is open. Static scenery and furnishing parts merge by palette, marquee bulbs are instanced, and cabinet screens do not mount game previews. No postprocessing or realtime shadow maps. This intentionally adds visible ambient activity; it is not a measured phone-cooling improvement. Detailed scope and sample render counts are in [the room review](arcade-room-2026-09-26.md). Positional sound has one gesture-created context, at most eight short voices, no downloaded tracks or additional scheduler; see [sound lifecycle evidence](arcade-room-sound-2026-09-26.md).

Pass Puzzle keeps its sleeping renderer and 30 fps phone cap. Drawing retains up to 128 ordered input samples and uses a fixed 256-vertex visual line, preserving the origin and final release point instead of freezing at the previous 400-event limit. Prediction is capped at 12.5 Hz while the raw line follows input. Leaving active flight for a chooser/brief explicitly stops its loop. Desktop and touch checks cover cancellation, ordinary failure/retry/pass/goal, visible Arcade navigation and chooser sleep. See [the controls review](pass-puzzle-controls-2026-09-26.md). Tennis headers/scissors reuse the native rig and existing effect pools; see [the tennis review](arcade-tennis-2026-09-26.md).

Final activity refinements add five authored 256×192 cabinet previews, updated at most eight times per second only when their screen bounds intersect the camera frustum. They are lightweight canvas illustrations, not live game instances, and freeze under reduced motion. The claw carriage, air-hockey puck/paddles and vending cue add six moving palette meshes and reuse the existing room clock. Greetings reuse current rigs. NPC avoidance checks only the bounded three/five-person population and enforces body separation, verified over 100-second routes at 15/30/60 Hz. Cabinet highlights now reuse the island building's green edge/halo/rising-wash shader with cabinet-sized geometry; the original building branches are unchanged. Effects dispose with the room. See the cabinet-attract and crowd reviews for checks; physical-phone heat remains unmeasured.

## Arcade continuity, rewards and matching controls — September 26, 2026 (local)

See [arcade coins and continuity](arcade-coins-2026-09-26.md). Separate entry/return black transitions preserve document isolation. Return skips startup splash assets and waits for actual first render. Arcade music is one bounded original buffer in the existing context, suspended hidden and disposed on game entry. Coin persistence runs only at changed milestones; pack equipment previews stay off. Four native character actions reuse one skill pose; finite button/slideout/reveal transitions respect reduced motion. Portrait390×844 and landscape844×390 touch checks matched all four island button positions, dimensions, borders, backgrounds and shadows exactly; all four actions responded to actual taps. No radar added. Desktop/mobile purchases, persistence, unique second card and insufficient funds passed, along with wallet concurrency/failure fixtures and mobile cold isolation. These are browser-emulation checks, not physical-phone thermal measurements. Not deployed.

### Arcade audio boundary and Coins sleep follow-up (local)

The island music owner now has an explicit scene gate and pagehide pause. Arcade entry shuts it down before the fade and disposes island SFX; registered card-play/story/lesson narration is stopped, including pending play promises. This prevents island voices from surviving the transition. Coins suspends the room renderer while open, without losing requested auto-walk destinations when it closes. Mobile browser checks passed:15fps idle cadence, zero hidden draws, zero draws behind Coins, room/audio disposal during game play and no island requests in the standalone arcade. Return uses the shared static grain and CSS loading track, with no splash cast preload. Applaud reuses the native thankPasser pose. No physical-device temperature claim.

Arcade entry illustration follow-up: inline static SVG cabinets/characters, one cached grain texture and the already-preloaded brush font. Only the shared CSS loading bar loops; no additional canvas/WebGL context or player rig. Loading overlay unmounts after first actual room draw and a280ms fade. Desktop/mobile loading checks and TypeScript passed.

### Paired arcade actions — September 26, 2026 (local)

The four actions now choose the nearest visitor or prize attendant and perform a shared routine. Visitor signatures vary between high-fives, fist bumps, applause, hops and victory poses; the selected action changes the opening beat. These reinforce teammate acknowledgment and shared celebration. The attendant responds across the counter from its existing service aisle. Movement cancels an exchange, and completion releases the visitor back to its previous activity.

Approach planning runs only on action input: a bounded 57×45 grid, up to 16 candidate meeting points, furniture clearance and current body positions. Stalled routes cancel. Both existing rigs use one shared clock and reused native pose structs, with additive highFive/fistBump move data; the player solver is unchanged. One pooled floor ring identifies the partner, and a short contact cue uses the existing audio pool. No extra renderer, animation loop, audio context or asset download. Existing active/idle/hidden cadence remains in effect; physical-phone temperatures are unmeasured.

Validation: native skill/contact fixtures, crowd route/body-separation and social reserve/release fixtures, audio lifecycle fixtures, and TypeScript passed. Real desktop keyboard and emulated-mobile touch checks covered closest selection, distinct NPC routines, synchronized clocks, completion and movement cancellation; touch cancellation used the actual joystick. A separate keyboard walkthrough verified the attendant exchange completes at the front of the counter. Screenshots were inspected. Changes remain local, not deployed.

Return-loader artwork follow-up: the main splash's blue/grain, brush heading, gold track and landscape palette now frame the native cheer character holding a Back to Island sign. The 6.3KB baked character is embedded as a data URI for first-frame display; the SVG sign and landscape remain static after a single 650ms entrance (disabled for reduced motion). No rig, renderer, new audio or image fetch is added. Desktop and mobile real Exit checks passed, including the shared button collapse, first-render dismissal and return beside the arcade. TypeScript passed; local only.

### Facing, solo controls, keep-ups and shared loading cast (local follow-up)

NPC controls now require close range (2.6m, with a small exit margin), a clear approach and a forward-facing cone. The selected visitor turns toward the player and pauses; looking away releases attention and restores solo actions. The attendant uses a front-counter proximity point. Automatic cabinet walking does not stop NPCs in its path. Only target changes update React; the faint ring reuses the existing mesh. Each NPC/action cycles three authored exchanges, adding alternate-hand high-fives, double hops and turn-taking cheers. These use native pose structs and the existing clock.

One 20×14 ball mesh, one shared 256×128 generated panel texture and one shadow restore native dribbling. Paired keep-ups use the same ball and native foot-juggle channels: two touches, a chip to the partner, two return touches and a chip back. Selected routines allow additional space; the attendant does not juggle across furniture. Motion follows the existing capped room loop, with cached vectors and no added scheduler, renderer or audio context. Walking after the exchange retains the ball. CPU/render work is bounded; no physical-device cooling claim.

The arcade loader now shares `LoadingBeanCast` with the main splash, so the same baked beans occupy exactly the same responsive positions. This intentionally adds the five cached splash stills/inline placeholders to arcade entry; it does not load live character rigs for the illustration. A black shape behind the cabinets grows during a finite 650ms transition, then the screen fades for 280ms. Reduced motion skips the expansion. The island's cast markup/layout is preserved through the shared component.

Validation includes all crowd/body-separation fixtures and three variants per NPC/action, TypeScript, mobile actual joystick turning toward/away, contextual control bounds, repeated exchanges, shared keep-ups and solo ball retention. Desktop keyboard/mouse and portrait loader captures are checked separately. These changes are local and have not been deployed.

## Solid live-field players and townsfolk — September 26, 2026 (local, not deployed)

`lib/town/fieldCollision.ts` makes live-field players (all four venues) and island townsfolk solid for the main character: circle push-out with a tangential slide, a soft bump (small push-back, character squash/roll spring, render-only sidestep + lean on the other body), a rate-limited soft thud and 8–12 ms haptic. Never a knockdown; the player's own scooter/bike/moped no longer knock field players or townsfolk over (trucks still do).

Runtime cost: runs inside the existing 60 Hz movement tick. Skipped entirely for the jetpack, falls, lessons and the rooftop knockout. Fields: one AABB test per venue; players are visited only on (or within 1.5 m of) a pitch at its height, with a squared-distance reject. Townsfolk: one compare per NPC against the `distance` islandNpcs.update already measures each frame (broad phase 3 m), so no extra distance pass. The step allocates nothing per tick (reused context and event objects; a nudge record is created once per bumped body). Nudge drawing runs only while a bump is settling (≤ .45 s) and never touches the match sim or NPC route positions. Validation: `node tests/field-collision.cjs` (overlap, slide, no knockdown, off-field no-op, sim unchanged on four venues, NPC Talk range/route) and desktop + emulated-phone joystick captures. No device thermal measurement.
- **One idle controller, whole-mix fade (Sep 26 2026, user decision).** `createIslandMusic(..., {active,onIdle})` owns the 30 s idle timer (heat pass 4's music pause is now part of it). After 30 s with no *trusted* pointer/touch/key/wheel input, and nothing the child started still playing (`active`: a card/story film holding playback, an open lesson's voice line, or `fieldSession.playing`), the music fades out and `sound.setIdle(true)` ramps the sound master to 0 over 1.5 s, stops ride hums, then suspends the context. While idle nothing is scheduled, so waking replays nothing; the next real input resumes with a 0.25 s fade-in. Cost: one timer re-armed at most every 5 s.
- **Narration ownership (user report: "plays audio leaking when just standing there on the island").** The shared lesson-voice element kept its last line loaded after a lesson closed (only the `src` attribute was removed), so anything that resumed it (iOS interruption end, lock-screen/headphone play, a stray `play()`) replayed the play narration over the island with music underneath; `scripts/check-narration-browser.cjs` reproduced it with a resume after close. Now closing a lesson unloads the element (`load()`), and a `play` guard pauses it unless an open lesson asked it to speak. Music has the same guard (stops if not allowed), and `registerIslandNarration` pauses other registered voices when one starts (one narration at a time).

Retro-neon presentation and controls follow-up (local): room and loading art share midnight navy, cyan/magenta cabinet edges and warm gold prize accents. Cabinet rails, perimeter strips and 72 small carpet flecks join the existing static material batches; emissive materials and cached light-pool textures provide the glow without bloom, shadow maps or additional realtime lights. The original cabinet locations and green interaction highlights remain. The arcade-specific cast is baked from the native bean rig using `scripts/render-splash-characters.cjs --arcade`, with no balls, and shares the main loader's group coordinates. Tiny inline versions precede the cached WebPs. The darker textured loader uses an organic SVG black shape for its finite expansion. All four icon-only controls are now available on desktop as well as mobile; accessible names describe solo versus social actions. No visible action captions.

Final transition/sign follow-up: arcade entry holds for at least three seconds before the 650ms organic black expansion and 280ms reveal; slower scene initialization extends the hold. Return foreground is sand tan and scales to full coverage over 700ms before a 280ms reveal, with the owner retaining the overlay for 1050ms. Reduced motion uses a short fade. The marquee's 56 chasing bulbs are removed: two continuous rounded neon tube frames with static translucent jackets and baked glowing lettering replace them. There is no blinking or per-frame material modulation. Desktop icon controls and mobile keep-up walkthroughs passed; the desktop neon sign screenshot and full-tan transition frame were inspected. Desktop/mobile loader and Exit checks and TypeScript passed. No deployment performed.

Loader composition / store follow-up: arcade machines and the soft black shape move up together (desktop bottom14%, portrait39%); the shared bean grouping stays at its existing positions. Arcade-only baked outfits now use bright cyan, pink and violet kits with dark shorts; the main splash assets are unchanged. Render script also regenerates the tiny inline placeholders. The store uses only two pack offers (3/5 cards); no owned-card gallery is mounted. Reveals create at most five card components after purchase, and reward transactions run only on user action. Wallet correctness/partial-grant recovery and TypeScript pass; browser checks exercise mobile/desktop purchases and loading. Local, not deployed.

Transition easing follow-up (local): arcade shape expansion now lasts 1.05s, followed by a 650ms eased reveal, with overlay cleanup at 1.8s. The three-second minimum hold and reduced-motion behavior remain unchanged. This extends only finite CSS transforms/opacity; no renderer or scheduler is added. Store coin balance is left-aligned in a flat pale-blue panel, with the label above its value and no button border/shadow treatment.

Sequential loader departure: all foreground items (including the shared bean cast wrapper) fade together for 400ms; after 450ms the black shape begins its 1.05s expansion. Only after full coverage does the 650ms arcade reveal begin. Overlay cleanup waits 2250ms, preserving the existing three-second initial hold. The shape stays behind artwork during the first fade and moves above it only when expansion starts. Finite CSS animations only; reduced motion still skips the sequence.

Staggered arcade loader departure (local): three SVG cabinets independently bounce/shrink over500ms at180ms offsets. Beans fade individually after the cabinets, with portrait ordering left-to-right and desktop ordering across the two groups. At2.1s the organic shape expands in both axes over1.2s, then holds full coverage briefly before a650ms reveal at3.45s. Cleanup waits4.2s; the initial three-second hold remains. Only finite CSS transforms and opacity, with existing reduced-motion bypass; no new assets, render loops or effects contexts.

Balanced arcade wipe refinement (local): the organic SVG now interpolates from its original illustration bounds to a centered200vw×200vh rectangle. Both axes share one easing curve; the old low transform origin and16× zoom are removed. This keeps portrait/landscape coverage balanced and leaves opaque coverage before reveal. The isolated absolute SVG animates width/height/top only for the existing1.2s departure (a small finite layout cost); no polling or persistent frame loop. Staggered items and reduced-motion bypass remain unchanged.

Arcade stretch timing polish (local): expansion shortened from1.2s to850ms, with a small initial squash/stretch and a210%→196%→200% settle. Coverage stays opaque through the settle; reveal starts at3.05s and cleanup at3.8s. Existing stagger and finite CSS-only cost preserved.

Arcade ball controls (local): the four icon-only controls now trigger Shoot (Space), Freestyle/rainbow flick (F), Keep-ups (Q), and Step-over (C), also through touch. These use the native kick/juggle/skill channels and existing single textured ball and shadow. Freestyle and step-over sample the authored skill ball paths; keep-ups alternate feet. The practice shot uses a bounded forward/rebound path with an event-time furniture/person clearance scan. Movement, navigation, covering and visibility reset the action; no added renderer, timer, geometry, or continuous loop. Existing room frame caps and hidden sleep remain. Teaching purpose: finishing follow-through, alternating-foot control, and readable football feints. No physical-device thermal claim or deployment.

Loader bean departure follow-up (local): each character now shrinks to15% while fading over200ms, staggered120ms apart. Shape expansion begins at1.75s, reveal at2.7s, cleanup at3.45s. Same finite CSS-only animation and reduced-motion bypass. Ball-action browser checks passed via desktop keyboard and emulated-mobile taps for all four actions and Coins cancellation.

Arcade shooting parity and cabinet hits (local): shooting now directly reuses createWalkBall from the island, replacing the short scripted return arc. Pointer capture and keyboard down/up use the same180ms grace/1.8s charge curve. Shared windup, velocity, gravity, drag, floor/wall restitution, substeps and recall remain unchanged. Arcade adapters add room/furniture collision and a4.8m ceiling with the existing swept-frame response. Ball strikes reuse island ballReactions for visiting NPCs: fall, three stars, recovery, paused navigation; reactions stay in place to avoid pushing a prone rig through furniture. Shared impact audio stays in the arcade context. Cabinets have a480ms tinted-screen glitch, small screen displacement and existing light-pool modulation; sixteen instanced sparks share one reusable geometry/material and only update during an impact. Reduced motion suppresses sparks/shake and softens the tint. All work runs under the existing room clock/caps and sleeps hidden/covered; no island scene/assets/audio are mounted. Desktop keyboard and emulated-touch checks passed tap/held power, ceiling rebound, cabinet impact/sparks, recovery and covered hold cancellation; shared charged-shot, crowd separation, NPC knockdown and TypeScript checks passed. Physical-phone heat remains unmeasured; not deployed.

Exit presentation (local): the freestanding EXIT sign/posts are replaced by a see-through green doorway glow with centered EXIT lettering. A single768×384 baked canvas texture on one transparent plane provides the soft border and tint, without an animation loop, realtime light or postprocessing. Existing walk-out trigger and return transition remain unchanged.

Main loader tan expansion (local): the actual visible tan coastline is measured once when departure begins, and its shared path is reused in a viewport-level SVG. It expands from those exact bounds toward centered200vw×200vh coverage in both axes, with a small settle. This replaces the off-center whole-art zoom and rectangular tan cover/gleam. Existing item/cast exit timings and2.05s overlay lifetime stay intact. One departure-time layout read and finite700ms CSS animation; no ongoing listener or renderer.

Mobile tan wipe correction: frame inspection found the front-loaded ease reached nearly full-screen in150ms. Replaced width/height/top animation with a compositor transform from the measured coastline to the viewport center, with independent x/y scale factors and even ease-in/out. Existing700ms duration and reveal timing retained. No per-frame layout. Navigation audit: single Back on nested Paths/settings pages, store history, development plan and quizzes; Escape follows parent navigation in nested dialogs and the surviving Back receives focus. Legacy Academy About duplicate removed. Desktop/mobile navigation walkthroughs and TypeScript passed.

Exit cue removal (local, user request): removed the green doorway plane and its baked EXIT texture. The existing UI Exit button and physical walk-out trigger remain; this removes one texture/material/mesh from the room.

Arcade ball trail parity (local): wired the shared island createBallEffects into shot launch, bounce and charge. The20-point line and14 reused trailing ball meshes use equipped-ball color/style and strengthen with charge. Effects update on the existing room clock only during shooting/charging and a450ms tail, clear on coverage/blur, suppress trails under reduced motion and dispose with the room. No extra frame loop or light; fixed pooled geometry.

Held moving ball actions (local): scissors replaces the step-over and Freestyle is explicitly Rainbow flick. Q/F/C and captured action pointers repeat keep-ups/rainbow/scissors while held; release completes the current cycle, cancellation clears it. Actions no longer clear joystick/keyboard movement or cancel when walking starts. Native skill paths and the existing room loop remain. Shooting keeps release-to-charge semantics. Loader cast rotates through five lineups of the existing cached neon bean stills, retaining layout and departure timings; session selection avoids consecutive repeats with no additional artwork/renderers.

NPC context restoration and idle release (local): facing a nearby available visitor swaps all four icons/accessibility names to partner actions, and keyboard shortcuts follow the same context. Turning away restores the held ball moves; active ball actions keep their controls until completion. Knocked-down NPCs cannot be selected. Fifteen seconds of still, non-interacting attention releases the NPC and hides partner controls/ring; the same idle stance cannot immediately recapture them. Movement or a new action resets the gate. One bounded timer in the existing room update; no polling or new loop.

Arcade crowd congestion correction (local): removed continuously rotating lateral avoidance. Visitors now use distinct aisle waypoints, stable right-of-way and committed passing points with bounded lifetime; an occupied destination produces a wait instead of orbiting. Existing body separation, social reservations, idle attention timeout, knockdown recovery and frame caps remain. Passing targets allocate only on encounter, with no new scheduler or per-frame helper closures.220s blocked/cleared-aisle simulations at15/30/60Hz kept all bodies separated and every visitor completed5–6 cabinet visits; existing crowd/social/knockdown fixtures and TypeScript passed.

Arcade loader simplification (local, user request): removed the organic SVG and its expansion. The background is near-black with the existing cached grain; machine/character stagger and five cast variations remain, followed directly by a650ms fade into the ready room. Reveal begins at1.75s after the initial minimum hold, cleanup at2.5s. Removes the large expanding layer and keeps reduced-motion behavior.

Distinct NPC actions (local): replaced shared social fallbacks with72 authored exchanges (six NPCs×four actions×three variants). Each action/variant differs across visitors and all four buttons differ per visitor. Individual tempo, hop height and delayed non-contact partner responses break synchronized copies; high-five/fist-bump contacts and the fixed shared-ball keep-up clock remain coordinated. Counter attendant uses only upper-body routines. Authored data plus native pose sampling reuse the same rigs/clock and add no effects, assets or schedulers. All variety/counter constraints, crowd/knockdown/congestion tests and TypeScript passed.

### Arcade mobile framing and input feedback (2026-09-26)
- Tennis and pinball fit the actual court bounds into the usable HUD/control area; resize-only projection fitting centers asymmetric perspective bounds. Tennis uses the shared 132px island joystick and 58px action targets, with Serve/Kick above Scissor. Pinball's score replaces its title row.
- Pass Puzzle removes the redundant raw stroke line and its GPU buffer. Dirty gestures refresh the prediction once per existing rendered frame (30fps mobile); held loft previews remain throttled to 80ms. No additional animation loop. Engine fixture prediction measurements were 0.28–0.38ms wall time on this development machine; not phone thermal measurements.
- Pinball flipper/launch cues reuse the game audio context. Charge is one bounded oscillator with a rising pitch; release, cancellation, pause and unmount stop it. Mute/volume preferences apply. No audio assets, polling or extra contexts.
- Validation: TypeScript; desktop/mobile tennis play/pause/input checks; mobile pinball mechanics; mobile puzzle drag preview; bounded drawing and puzzle engine fixtures. Local changes, not deployed.

### Strikers controls, assisted passing and charged-shot focus (2026-09-26)
- Uses the island joystick markup/132px geometry, safe-area anchors and shared thumb/rim feedback. Gesture bounds stay cached and feedback paints in the existing game frame. Camera frames the pitch more closely; action controls sit at screen edges.
- Pass targeting weights clear lanes, scales kick speed by distance, and helps the selected receiver approach an incoming pass only with neutral directional input. Through balls still lead into space. Engine fixtures cover 8/18/28m receptions.
- A held shot progressively slows simulation to 35%, zooms toward the carrier, and uses the native charged-shot pose. Charge and match clock remain real-time; a strong release gets 180ms impact focus and a pooled expanding ring. Camera eases back; reduced-motion disables zoom/pulse/ring animation. No extra renderer, post-processing, audio context or animation loop. Two small reusable ring meshes added.
- Verified mobile Strikers play/charge/zoom/slowdown/release/pause flow, 30/60/120Hz charge timing and passing fixtures. Pinball audio trigger/mute browser check passed. Local only; no real-phone temperature claim.

### Retro neon courts and reactive glass floors (2026-09-26)
- All five games now share dark cabinet-world surfaces, cyan pitch lines, pink impact accents and yellow possession/charge signals. Constant lighting replaces the day-to-dusk transition. A static grid uses one line draw; no bloom, post-processing or extra shadow lights.
- Glass courts use one instanced tile draw plus one transparent surface (112 tiles normally, 192 for the scrolling runner). Color feedback follows the ball, charge, impact or planned pass. Pinball adds four low-opacity underglow layers, edge rails and flipper light/recoil feedback. Reuses existing 30fps mobile/60fps desktop loops; paused/hidden/settled states still sleep. Puzzle level changes dispose the replaced glass resources.
- Breakaway charge makes the projectile and trail larger; stronger release/impact adds two pooled expanding rings and a stronger existing particle burst. Reduced-motion skips the expanding rings.
- Pinball framing tightened again; tennis scoreboard replaces its title and uses the freed vertical space. Local validation: mobile pinball and Breakaway gameplay/input/pause checks passed; all five neon scenes opened without browser errors. Not deployed; physical phone temperature not measured.
- The arcade room now shares the glass-floor renderer (180 tiles, one instanced draw + one skin), replacing its checkerboard/confetti geometry. Lights follow dribbling/shot position and charge. Existing 15fps idle, 30fps mobile activity, 60fps desktop activity and covered/hidden shutdown remain unchanged; no new loop or lights.
- Final room verification limitation: the full held-actions browser check timed out navigating the dev server. The final whole-repository TypeScript run was blocked by an unrelated missing `public/plays/narration/varane-uruguay-2018/timing.json` import; earlier arcade TypeScript runs passed. Do not interpret this as a clean final repository-wide check.

- User reverted the arcade-room glass floor: restored its previous checkerboard/confetti geometry and removed room tile updates. The five games retain their illuminated glass floors.

### Arcade mechanics and neon refinement (2026-09-26)
- Tennis adds a Perfect Return for a planted, close touch 45–260ms after the first bounce: better contact accuracy and modest extra pace. Aerial input buffering expands to 480ms. Existing net/flight rules remain authoritative.
- Pinball gains one rescue nudge per launch, with cooldown and recharge from alternating-foot combinations. The existing Launch control becomes Nudge during play; no extra mobile target.
- Breakaway supports jump-and-shoot aerial volleys using the native volley pose and elevated projectile; airborne volleys beat a planted foot block. Shots still consume inventory and obey cooldown.
- Strikers buffers Pass/Through for 650ms before receiving. Neutral direction returns to the original passer for a one-two; directional input picks the next teammate. Switching player clears the buffer.
- Pass Puzzles offers one rewind of the last failed pass per attempt. Restores a bounded snapshot, clears stale event/replay state, and withholds the first-try star after a rewind. No saved progress or awarded coins are rolled back.
- Softer neon court spill uses one construction-time 128px canvas texture and one flat draw per floor; disposal covers the owned texture. Replaces four hard pinball underglow layers. No new lights, bloom, animation loops or render targets. The room retains its reverted original floor. Room Exit/Coins adopt cyan/pink navigation, with green floating Play and existing interactions.
- Validation: tennis/pinball/runner/Strikers existing engine suites, new mechanics at 30/60/120Hz, puzzle snapshot/physics suite, TypeScript, and mobile browser nudge/volley/rewind/pause checks. Local changes only; no physical-device thermal claim.
- Mobile tennis framing now derives camera tilt from available viewport proportions, uses tighter court bounds, and fills up to 98.5% of the available width. Tall phones use a more overhead view; short screens tilt the court to retain both baselines. Resize-only calculation, no additional frame work. Mobile tennis movement/serve/rally/cancel/pause checks passed; desktop framing retained.

### Arcade gameplay depth, feedback and room detail (2026-09-27)
- Strikers' four rounds vary pressure and central cover; tackles latch their aim and retain a recovery window. Goal-plane interpolation fixes crossbar decisions. Tactical work stays inside the existing 120Hz/eight-player step; no extra loops or meshes.
- Tennis adds five tactical courts, stable per-shot AI reads, physical tape clips and equal aerial recovery penalties. Breakaway adds six named stages, authored two-line routes, exact jump integration and swept contacts. Pinball adds four skill divisions and capped one-off rewards; existing 480Hz physics retained. Runner's ten-minute simulation peaked at 15 objects/four shots; shot penetration search is bounded to three contacts.
- Native rig poses remain authoritative. Tennis's 620ms slam/scissor camera beat slows simulation to 32%, then restores the fitted view. Breakaway's charged camera eases toward the player and back. Reduced motion retains the stable camera. The same render loop drives these transforms; no extra render target or post-processing.
- Event feedback reuses each game's gesture-unlocked AudioContext, max six short voices, with rate-limited optional vibration. Sound mute/zero volume, hidden state and reduced motion are respected. Charge notes occur only at thresholds. Saved personal records and unlocked courts/rounds use event-driven localStorage writes, no polling.
- Room static cabinet/furniture detail remains palette-batched. Two contact-light meshes and one ticket-strip group use the existing room clock; no new lights/shadows/RAF. NPC console timing varies by visitor. Original room floor and 1.4m service aisle retained.
- Validation: each game's existing and new engine suites; desktop/mobile gameplay checks; tennis camera/round persistence and real-touch runner charge/cancel checks; room ordinary movement/social/spacing, hidden and covered zero draws, 15fps idle, and disposal on game entry. Feedback/record tests cover mute, reduced motion, unsupported vibration and corrupted storage. Room sample draws were 82 desktop/59 mobile from different viewpoints, not a comparative performance benchmark.
- Scope limits: later-stage balance needs longer human play sessions. Physical-phone heat, native haptics and battery use were not measured. Changes are local, not deployed. See arcade-gameplay-review.md for game-specific evidence.

### Arcade loading, puzzle control and drawer refinement (2026-09-27)
- All five game chunk fallbacks use the existing dark grain, brush type and animated loading track. CSS-only presentation, no new rendering loop or enforced wait. Delayed-chunk browser checks verified each named fallback and successful game initialization.
- Pass Puzzle moves its counter into the header. Ground/Lift/Shoot and an optional 10–100% power slider share the same kick interpretation between prediction and release. Screen-space adaptive filtering suppresses small pointer jitter; signed curve area and a bounded 16-sample smooth-arc estimate replace single-sample spin and raw scribble energy. Pointer bounds are cached per gesture, cancellation clears input, and long strokes remain bounded.
- Clean opening foot-shots can solve goal puzzles; reach-zone and header objectives remain strict. Long-distance shots are capped at 18 + 20 × power m/s rather than manufacturing extreme speed to fit an arc. Existing authored routes and challenge solutions remain valid. Native keeper dives now own push-off, landing and recovery; the root is never rolled sideways.
- Flight trails reuse 24 instances and goal feedback reuses two rings plus existing net/particles. Aiming defenders scan and shift weight at 15fps (added visible idle work); active touch play remains 30fps, desktop 60fps. Results settle for at most 1.7s; chooser, brief, settled result and hidden states sleep. Reduced motion skips ambient aiming work and expanding/trailing effects.
- Coins drawer uses static grain and neon CSS with a scrolling flex body. Desktop tennis actions match island 72px circles, 12px gaps and 24px offsets. No new effects loops. Drawer desktop, portrait and landscape checks passed scrolling, bounds, closure and room sleep.
- Validation: TypeScript; puzzle engine, 20 authored solutions, three advanced challenges, opening-shot/replay tests at 30/60/120Hz, and filter/mode/power tests. Ordinary mouse and real browser touch events passed failure/retry, deliberate pass/goal, held loft, cancellation and exit. Local changes only; physical-phone heat and haptics remain unmeasured.
- Final visual checks waited for the entry overlay to disappear: puzzle toolbar/mode switching and power reset passed desktop/touch; a real Lift gesture produced the expected loft and live trail. A separate render-only keeper fixture confirmed dive and upright recovery (not evidence of ordinary save balance). Tennis control bounds passed at 1280px/601px desktop and 390px touch; desktop joystick now has a non-collapsing 132px base and centered 64px puck, with no action overlap.

## Island jobs and Community Garden (27 Sep 2026, local)

`lib/town/jobs/jobScene.ts` (docs/island-jobs.md). Idle: six job signs, bins and rebound-wall paint are one merged vertex-colour mesh plus one label-atlas mesh (2 draws, static); a 0.25 s throttled distance check over 6 signs and a 0.1 s garden-range check. Running job: one targets `InstancedMesh` (+ placed cones), a 2-mesh beacon and a carried ball, built on start and disposed on finish; ≤16 distance checks per frame; beacon bob frozen under reduced motion. Garden: one 39-instance `InstancedMesh`, visible only within 55 m, repainted on entry, on a pick and every 5 s inside. Update is skipped while the island is paused. The HUD (`components/IslandJobs.tsx`) re-renders only on view changes. Desktop checks only; no phone thermal measurement.

**27 Sep 2026 additions (docs/island-jobs.md §3b, §8).** Ten job signs now (still 2 static draws; atlas 1024×640). The kit room, offside and pump jobs build their props on start and dispose them at the end; the offside replay rewrites 5 capsule matrices only while a ~3 s clip plays and uses the shared `lib/town/shotCamera.ts` blend (idle: one early return). The **Boot Room visit** builds nothing until Enter: then one merged unlit vertex-colour mesh, one chalkboard texture and one still coach rig, disposed as soon as the camera is back outside; no lights added, no loop; the island rests while the story card is open. Idle cost: one door-distance check per frame (plus a desktop hover ray test). Desktop headless checks only; no phone thermal measurement.

### Fishing and vending art; arcade entry (2026-09-27)
- Fishing visual module now owns two 512×128 original canvas decals: blue shallow-water layers and broken foam strands with transparent gaps. Local shoreline geometry remains merged. Rod/reel/guide and red/cream float detail, a fish belly/eyes/fin, and 12 reused splash instances replace placeholders. Decorative water offset and splash work use the existing busy-only driver; no timers, extra RAF, blur, global-sea changes or fishing-rule changes. Thin ripple rings improve surface readability. Existing nearby creation / 80m disposal remains authoritative.
- Vending keeps one merged mesh per machine and one shared material. The shared atlas grows from 512×1024 to 1024×1024 (eight 256px-wide glass tiles, no per-machine texture or material); both colour and emissive maps remain shared. This increases bounded texture memory, not draw count. Real special names and original ball/foil-pack miniature art are shared with small canvases painted only when the interactive face mounts or its product changes. Plain cabinet texels stay lit; printed face texels preserve their source colours so HTML does not introduce a lighting-driven palette change.
- Cabinet trim, feet and vent detail remain below the existing 800-vertex-per-machine gate. Tray item and pickup label occupy separate regions. Garden zoom follows a 7m elevated arc and returns to the same final camera fit, avoiding the classroom corner.
- Runtime vending check: no placement/reachability issues; sampled 195 draws with machines vs194 without (+1), 0.51µs idle update and0.045µs inactive camera. This is one local scene sample, not a physical-phone thermal measurement. Portrait market flow passed purchase, tray pickup, insufficient-funds response, page navigation and exit, with no text below12px or buttons below44px.
- Fishing desktop West Cove and390×844 Harbour Wall captures passed cast, shadow, nibble, bite, catch and exit with no browser errors. Harbour Wall framing still clips the float near the phone’s bottom controls; camera code is expressly outside the visual handoff, so its correction awaits ownership approval.
- All five games now request a persisted3-coin payment for each new play; pause/resume is free, puzzle entry includes its built-in attempts, successful replay/new entry costs3. A shared hook prevents double-click charges. Wallet core adds idempotent debits and an island earning source, including migration of identifiable legacy job/welcome/market/card-trade run IDs. Debit persistence, reload, storage failure, affordability and cross-tab serialization tests pass. Vending/jobs adapter integration remains pending the ownership decision; existing vending-ledger spend is not yet migrated into core debits.
- Removed displayed pack odds and fixed the tennis select to16px. `npm test` passed all suites, including device guards and heat checks; TypeScript passed. Five-game browser entry checks confirmed3-coin charges and free resume; empty wallet stays on ready screen with an earning explanation. No commit, deployment or server restart.
- Final vending visual comparisons confirmed matching product identities/colours and separate label/price bands. Portrait and landscape label-overlap assertions passed; face bounds were367×454 and290×359 CSSpx respectively. Artwork is original procedural canvas drawing, with no external character assets.

### September 27 — repeated reeling and vending shelf refinement (local only)
- Fishing now hooks first and requires 6–12 separate reel taps, depending on fish size. A 120ms debounce and an eight-second inactivity escape prevent hold-to-win and idle rewards. Only final landing writes the catch. Reeling progress updates React only per accepted tap; the fish wriggle, taut line, approach and landing arc use the existing active frame callback and shared fish geometry. No timers or extra render loops. Reduced motion skips the wriggle and landing arc.
- Surrounding sea uses a blue palette; fishing shallows blend outward with lower opacity and vertex-alpha fades at both ends. Existing ocean ripple update and nearby-only fishing disposal are preserved.
- Vending sign, category strip and LED heights reduced; product slots gained height. Original store mesh snapshots replace generic ball miniatures; nine small baked product PNGs share the existing world atlas with load callbacks detached on disposal. Shelf selection, coin acceptance and tray settle are bounded CSS animations, disabled with reduced motion. Selection audio uses the existing muted/idle-aware sound engine. No extra world draw calls.
- Each machine has six exclusive specials: its existing ball and pack plus four premium home previews (book, print, lamp, trophy). Display items are blocked by both UI and purchase ledger, including a funded-wallet regression test. Existing sale prices are unchanged. Removed the found-count/footer labels and duplicate padlock; LOCKED remains on the price button.
- TypeScript and npm test passed. Browser purchase flow passed desktop, 390×844 portrait and 844×390 landscape with select/coin/thunk/pop audio counters and no errors. Final layout checks: slots 108×125, 81×94 and149×172 respectively; all buttons ≥44px, labels ≥12px, no label/price overlap. Fishing desktop and mobile repeated-tap catch/exit passed. No physical-phone temperature measurement, commit, deploy or server restart.

### September 27 — distinct vending control sounds (local only)
- Previous/next use descending/ascending two-note ticks; category uses a three-note chime; product selection, purchase confirmation, coin-slot press, equip and collection each have separate short timbres. Existing coin clinks, tray thumps and refusal cues remain.
- Dispatch lives in the controller so mouse, touch and keyboard share feedback without duplicate face-layer sounds. Existing AudioContext, mute/volume/visibility gates, 70ms per-cue throttling and source disposal are preserved. Each cue schedules at most three short voices; no audio files, loops or new timers.
- TypeScript, vending regression and idle-audio checks passed. Local changes only; no deployment or measured physical-phone thermal claim.

### September 27 — fish swim direction and articulated motion (local only)
- Corrected approaching-shadow heading by π: its local head is -Z while simulation headings use +Z. Reeling mesh keeps its separate -X nose convention toward the angler.
- Swimming silhouette uses a travelling bend in its existing position buffer. The caught/reeling fish shares articulated tail and paired side-fin geometry; two extra draws only for the visible fish while fishing. Tail beats, subtle body sway and fin motion respond to reel taps. Reduced motion keeps the fish still. All work stays in the active fishing callback, with existing nearby creation/disposal and no timers or new animation loops.
- TypeScript and fishing regression checks passed; no deployment or physical-device heat measurement.
- Live desktop direction check measured nose/travel alignment 1.000 (forward) and changing silhouette vertices; mobile catch/exit passed without browser errors. Heat regression passed.

### September 27 — centered wallet and split basket HUD (local only)
- The island wallet sits centered in the existing Paths/Settings row with the same 44px height and safe-area offset. Venue learning cards sit below; nearby NPC prompts move below visible venue cards. Vending wallet layout is unchanged.
- Fish and produce each use a small original SVG icon, count and accessible label. Two primitive external-store snapshots update only when their category total changes; no polling, timers or frame work.
- TypeScript passed. Browser checks at390×844 and 1280×800 verified exact centering, aligned tops, matching44px heights and separate seeded counts (3 fish,6 produce). The jobs suite currently fails its separate economy-bound assertion (284 total); this change does not modify job payouts. Local only, not deployed.

### September 27 — remaining integration pass (local only)
- Vending payments now debit the shared wallet; island and vending HUDs no longer subtract the old ledger again. Legacy debits migrate by stable identities and new receipts retain ownership through interrupted secondary writes. Purchases serialize through the existing wallet lock; the vending projection uses its own lock to avoid nested acquisition. No polling or timers were added.
- Harbour Wall portrait framing now keeps the cast float above the joystick region while preserving the raised view over the harbour wall. Other portrait spots use the same improved composition; desktop framing remains unchanged. Camera work remains within the existing active transition and resize path.
- Home placement/inventory implementation is staged behind HOME_DECOR_ENABLED=false. Its Settings entry is hidden, its dynamic chunk is not mounted, and decorations remain unpurchasable previews. The phone purchase/place/turn/reload/move/put-away flow passed before it was hidden; desktop home staging still needs visual review before enabling. Pure placement, ownership and wallet failure/concurrency tests pass.
- Updated the outdated six-job economy/catalog tests for the ten-job catalog and explicit task interactions, without changing payout amounts. The full npm suite passes again, including device and heat guards. TypeScript passed. Phone/desktop browser wallet checks confirm consistent balance, idempotent migration/reload, successful gear purchases and blocked home purchases. Harbour Wall phone cast/reel/catch/exit passed, with nose/travel alignment1.000 and no browser errors.
- No commit, deployment, server restart or real-phone thermal measurement. Remaining external validation: physical iPhone/Android touch, audio and sustained heat.

### September 27 — production deployment verified
- Deployed the current workspace with user approval to https://futbolisland.app; Vercel deployment dpl_H5AD5HhU3KRrQKFgTYy6cy1LZXqE is READY. Production build, TypeScript and the full pre-deployment npm test suite passed. No commit or development-server restart was performed.
- Isolated production browser checks passed at 390×844 and 1280×800: shared wallet balance, legacy migration, vending purchase, reload without double debit, hidden My Home entry and blocked decoration previews. The browser script now accepts FUTBOL_BASE_URL for repeatable production checks.
- Physical iPhone/Android touch, audio and sustained thermal testing remain unmeasured; browser emulation is not a physical-device heat test.

### September 27 — autonomous polish follow-up (local, after production deployment)
- Fishing uses a cached segmented rod, elastic bend and reel crank in the existing active callback. Fish are attached at their transformed mouth rather than their body/tail; escape silhouettes face their travel. Reused splash instances follow the fish. Back uses the shared exit animation, Cast/Reel and Fishbook use island action dimensions, and the hidden joystick releases any captured input. Desktop, 390×844 and 844×390 repeated-tap catch/exit checks passed; mouth endpoint error was below0.000004m. See `fishing-polish-pass.md`.
- Vending removes the redundant ISLAND SHOP sign and moves category/navigation into that space. Both world atlas and projected interactive face share the expanded layout, yielding about20% more portrait shelf height. The entry uses a finite420ms fade,680ms sweep and four glints, with no entry blur or continuous animation. The visit latch prevents replay on book return; canceled visits cannot deliver stale purchase animation into another machine. See `vending-polish-pass.md`.
- The finished Messi book is lazy loaded after purchase (or explicit testing preview). Six original riso SVG spreads have finite, input-triggered paper motions; only one spread mounts, with no timer, frame loop or WebGL context. Reduced motion disables transforms. The island sleeps while reading. Phone, desktop and short-landscape tests passed purchase once, bookmark/reopen, all spread interactions, focus and render sleep. Sources and implementation notes: `player-books-research.md`.
- `?preview=all` offers temporary vending equipment/card/book previews without writing purchases, grants, customization or collection progress. Only the completed Messi book is readable; unfinished stories remain previews. Adding `testCoins=50000` explicitly credits50,000 spendable testing coins once per saved wallet using an idempotent reserved grant. Reloads and concurrent requests cannot repeat it; failed persistence yields no temporary balance. Browser tests verified30→50,030 once and persistence outside preview; wallet tests cover spending, concurrency and failed storage. Normal earning caps remain unchanged.
- The former Boot Room interior/story/entry runtime is removed. Its existing exterior remains as Clubhouse, and the outdoor kit-assistant job retains its progress and reward. No replacement interior or rendering loop was added.
- These follow-up changes are local, not part of the earlier deployment. Browser emulation and draw/sleep checks do not establish physical-phone temperature improvements.
- Arcade follow-up: tennis timing cues now share the return-window predicate; pinball gets one bounded opening rescue; Breakaway buffers landing/recovery input without losing charged shots; Strikers keeper dives use actual contact direction. Puzzle coalesced input preserves original timestamps and its idle anticipation stops after four seconds. All changes reuse existing loops/geometry. `arcade-polish-pass.md` records per-game ordinary-input coverage separately from deterministic/injected checks and identifies remaining upper-level balance and physical-phone limits.
- Vending tray follow-up: pack pickup expands from its measured tray position into a full-size, one-card-at-a-time collection-art viewer. Tap/swipe/keyboard navigation and a bounded entry animation replace the small pack grid. A static filter blurs the sleeping world and inert face beneath a tinted overlay; there is no backdrop-filter, extra render loop or autoplay card film. Reduced motion bypasses the flight; close removes the filter and restores machine interaction. The user subsequently requested a dimensional book rebuild; the earlier SVG-book measurements above describe the prior implementation, pending revalidation of the replacement.
- Daily play reward: once per local calendar day,30 seconds of direction-controlled on-foot displacement credits40 coins under the wallet lock. Idle, background, menus, automatic movement and flying do not count. Qualification uses the existing Town frame, not a timer. A stable daily receipt prevents reload/cross-tab duplication; failed writes grant nothing. Pure tests and ordinary-input browser checks passed idle/no grant, walking/grant and reload/no duplicate; see `daily-play.md`.
- Book soundtrack: an original finite13-second music-box phrase is rendered into a24kHz mono buffer only on use, with at most two cached phrases. Paper swish/action chime buffers are reused. No music sequencer, polling or repeating timer; at most four short voices, context suspension after sound ends, hard stop on hidden/mute and disposal on close. `book-audio.cjs` verifies lazy allocation, bounds and lifecycle. Island media remains independently paused by playback ownership.

### September 27 — dimensional vending cabinet and shelves (local only)
- Close-up uses a level three-quarter camera with a broad visible cabinet side; short landscape uses a shallower angle to preserve touch targets. The existing four-corner projection keeps the interactive face attached to the world mesh.
- Category navigation is roughly30% shorter in the shared layout. The product display uses two continuous shelves, recessed side returns, contact shadows and integrated name/price rails. The world atlas uses the same layout. Back matches the story-screen anchor (18/16px phone,24/20px desktop plus safe areas) and retains the shared shrink exit.
- Raised cabinet/glass/tray rims and shelf lips stay inside the existing merged mesh and material: one draw per machine and fewer than800 vertices. No extra textures, idle animation loops, timers, lighting passes or blur are added. Small-screen controls retain minimum touch areas with bounded layout adjustment.
- Vending regression and the full npm test suite passed. Browser checks passed purchases, pickup, paging, Back anchors/exit, readable text and ≥44px buttons at390×844,844×390 and 1280×800. A subsequent visual correction removes the double-perspective shelf trapezoid and product badges/glows. Full TypeScript currently reports an unrelated concurrent popupEngine.ts type error; vending had passed before that book edit. No restart, commit, deployment or physical-device temperature claim.

- Vending glass refinement: a pointer-transparent front pane adds restrained sky reflections and layered edge thickness above the products. Stock settles once after paging; a dispense gives a short shelf/glass vibration; coin keys and pickup flap have physical press feedback. All new animation is finite, disabled under reduced motion, and adds no JS frame callback. Item highlighting remains removed.
- Display miniatures use a tightly framed128px canvas with a shared shelf baseline, no detached baked shadow, and consistent visible scale. Pack and ball previews are enlarged to compensate for source padding. The world atlas uses the same display-art baseline. Vending/heat regressions pass; ongoing book changes currently block the full TypeScript check outside vending files.

### September 28 — larger vending vehicle previews (local only)
- Vending snapshots trim transparent camera margins for scooters, bikes, mopeds and flight equipment, then fit the visible silhouette to a shared bottom baseline. Other store consumers and ball framing are unchanged.
- The existing one-time preview batch reuses two340×220 canvases for alpha bounds and resampling, releases them afterward, and keeps using the vending snapshot cache. No persistent renderer, polling or animation loop is added. Vending regression passed; phone vehicle-page screenshots verify the resulting presentation.

### September 28 — Fishbook drawer and protected catch reading (local only)
- Fishbook uses a right-hand drawer (full width on phones), the existing NPC coastal/grain textures and colorful collection cards. Native modal focus, Escape, outside click and focus restoration remain. Radar, movement/actions and fishing HUD stay hidden through the closing animation.
- Fishing sessions explicitly pause while Fishbook or the market is open; overlay entry no longer cancels the session when building-entry input is disabled. Fishing tap/key handlers detach while these drawers are open. The existing island loop sleeps behind the book; no new render loop or blur is added.
- Catch information survives repeated Reel taps. A new cast requires three seconds for the catch moment and a0.7-second pause in tapping, using existing simulation time with no new timer. The test holds a six-second tap burst without losing the fish, then checks an intentional recast; drawer input cannot cast. Fishing regression passes.

- Phone390×844 and desktop1280×800 browser checks passed drawer placement, ten species, hidden HUD, frozen island render count, Escape/Done closing and fishing-HUD restoration. TypeScript, fishing and heat guards passed. No deployment or physical-phone thermal measurement.
- Fishing HUD status and keeper tip now share one compact card below the navigation/wallet row. The tip expands within that card; duplicate lesson headings and stacked banners are removed. No new timers, rendering work or animation loops. TypeScript, fishing and device checks pass; local only.

### September 28 — Japanese convenience-store market exterior (local only)
- Replaced the Island Market house facade with a low Japanese7-Eleven-style storefront: orange/red/green wraparound fascia, flat canopy, aluminium-framed glazing, sliding-door artwork, stocked window shelves and a football match-day poster. The building retains its existing10×10m plot and collision footprint; its new roof height is registered in building metadata.
- Relocated the main plaza vending machine to74.2,-51.9, facing the paved approach beside the market doors. Its ID, stock, ownership and prices stay intact. Other machines remain in place. Existing generic placement tests now derive the main machine's coordinates from the catalog rather than its old location.
- Geometry uses the existing static material/spatial batches and sign-texture disposal. No point lights, transparency passes or animation loops were added. TypeScript, town and vending checks passed; phone portrait, landscape and desktop browser checks verified walk-up, entry, projected controls and readable targets. No deployment or measured physical-phone thermal claim.

## Konbini parking and Kit Room sign — September 28, 2026 (local, not deployed)

Renamed the convenience store Konbini. Its west-side parking court uses static boxes for three marked bays, wheel stops, an open drive entrance and a pedestrian crossing; all reuse the world material/batching lifecycle. No lights, animation loops or additional textures. Removed the Kit Room sign posts, board and label quads while preserving the activity. Town and island-job checks passed; no physical-phone temperature measurement.

Parking follow-up: trimmed the south edge back to z=-52 and removed the entrance arrow, exposing the existing grass/path border instead of projecting asphalt into the square. Static geometry only; town checks passed.

## Square futsal court — September 28, 2026 (local, not deployed)

Replaced the Clubhouse building with a 20×12 m pocket court spanning x76–96, directly between Konbini and the arcade. Static marked surface, two mini goals and fine mesh cage reuse spatial/material batching; fine wires do not cast shadows. Cage colliders have a 2.4 m front entrance. Removing the house also removes its building/roof collision. No animation loop, lights or new texture; town checks and TypeScript passed. This is an accessible practice space, not a new scored match mode.

## Cage freestylers, floodlights and ferry gateway — September 28, 2026 (local, not deployed)

Four fictional court residents use the existing NPC rig, culling, distance tiers, pause and disposal. Each stays in a separate practice area, with different authored foot/knee/shoulder/head/around-world sequences using the existing juggle contact solver. Each ball is one merged draw; no extra rAF, interval, physics simulation or trail. Talking uses the existing textured conversation drawer. Two curated clips load thumbnails only when the conversation opens and mount the shared video player only on a tap; closing/hidden-page stops playback. Existing video holds pause the island during playback. Desktop and 390×844 checks cover four residents inside the fence, moving balls, paused dialogue, clipping-free drawer, clip switching and closing. TypeScript and npm test passed before the final single-draw ball refinement; TypeScript rechecked afterward. These are browser checks, not physical-phone thermal measurements.

Four wall fixtures on Konbini/arcade use shared emissive lenses and four static floor light washes in the existing night pool batches. No additional dynamic lights or shadow passes. The ferry sign has two lamps outside its posts at x214.8/229.2, z190.6; procedural lamps are excluded from the lettering zone. The former Clubhouse rooftop collectible is relocated to Konbini with its stable save ID.

Clip references: [Andrew Henderson, FATV](https://www.youtube.com/watch?v=2hvClyF2j0I), [Erlend vs Brynjar Fagerli, Flair20 TV](https://www.youtube.com/watch?v=3Iq0Rtxt6K4). Publisher embeds remain subject to availability/region; the drawer includes direct source links and an error fallback. No downloaded/rehosted footage or unrelated news fallback.

## Island pocket balance drawer — September 28, 2026 (local, not deployed)

The centered coins/fish/produce bar is now one accessible 44px button that lazy-loads a colorful, textured native-dialog drawer. It shows the shared coin balance, separate basket categories/item quantities and total basket capacity, with short earning/spending explanations. Values subscribe to existing stores; no polling or new economy rules. The drawer joins Town's pause gate, hides movement/radar/fishing HUD and preserves an active cast through FishingHost's external pause flag. Its finite 320ms entrance/240ms exit supports reduced motion; focus returns to the bar. No backdrop blur. Desktop and touch 390×844 checks verify counts, no horizontal overflow, sleeping renderer, Done/Escape, focus restoration and fishing continuation. TypeScript, device guards, heat-pass3 and fishing tests passed. No physical-phone thermal claim.

## Arcade control and possession pass — September 28, 2026 (local)

Pass Puzzle prediction now honors an 80ms minimum interval even while pointer samples are dirty. The latest dirty sample stays pending, and a stationary held gesture sleeps after its feedback settles. A mobile browser run measured a minimum 98.5ms interval under the existing frame cap, then verified sleep and wake on movement. Shot-height selection shares the same bounded prediction/launch path and introduces no rendering loop.

Pinball soft possession uses the existing fixed physics step and three defender records. Recipient selection happens on receipt, is limited to three candidates, and permits at most two passes before a shot. Released balls use existing gravity/collision. Carrier and receiver feedback recolors existing ring materials; receive/kick motion uses existing player rigs. Flipper tap buffering is 65ms of simulation time, cleared on pause/cancel, with no timeout. Sounds use the existing capped event-voice context. Mobile controlled exchange and flipper return passed; pause rendering slept.

Strikers first-touch cushioning uses existing pose fields and ball draw position; it does not add colliders or render objects. Tennis's after-bounce receiving guide reuses its existing throttled prediction. No additional shadow lights, bloom, canvas blur or offscreen work were introduced. Browser checks do not establish physical-phone thermal behavior.

## Connected high school — September 28, 2026 (local)

The school uses five touching static volumes with 17/13/9m roofs, four north garden beds and 12 faceted shrubs. Benches and south beds were removed for clear walking routes. Six stairs provide 118 treads and six landings indexed by the existing rooftop collision grids. Landing art stops at the receiving cornice to avoid coplanar flicker while walk support stays continuous. Green perimeter rails have height-aware collision and open stair entrances. No additional animation loops, timers, lights or vegetation animation.

The purple cabinet keeps stable market ID at x135,z8,y17.23, reusing existing vending rendering and interaction. The live browser movement solver walked both sides through every level to (135,10.4), then back to ground, without blocked or falling steps. Central and outer rail checks stop the character at the roof edge. TypeScript, town and vending checks passed; close-up art was reviewed. No physical-phone thermal claim.

### September 28 follow-up: map landmarks and static market/school art (local)

Five fishing F badges and Rosa’s Market label live in the existing memoized SVG terrain; vending V badges use actual machine positions and the obsolete Shop pin is removed. No frame subscriptions, timers or map animation were added. Desktop/390×844 browser checks confirmed all markers and clean hydration. Rosa’s stall is taller and 7.5×9m, with static striped canopy, counters, produce and larger signs; shared geometry/material batching is retained and hover bounds match its new size. Its existing front approach and sell interaction still work.

School hangout adds compact north-side pergola seating and a tiled vending nook with individual roof-height furniture colliders, static bulbs and existing night-pool batches. No canopy collision box; actual solver checks traverse underneath and both stair routes. Greenhouse transparent panels share one non-refractive material; aerial landing exclusions redirect outside while both ground entrances remain walkable. No added background loops or blur. Desktop browser validation does not establish phone temperature.

Pinball mobile framing now computes an aspect-aware tilt during resize and reserves144px below the table for feedback/controls. No per-frame fit work. Reviewed390×844 possession/counterattack screenshots show readable full table above the controls; touch counter return and pause sleeping pass. Tennis/runner cinematic fixtures verified camera recovery/cancel and reduced-motion stability, with no haptics in reduced mode.

## Card films, card flips and pop-up books: background audit — September 29, 2026 (local, not deployed)

User: phones heat up while a card film plays, while flipping a card, and while reading a pop-up book. Probe: Playwright Chromium (390×844, CDP `Performance.getMetrics`, rAF/timer callbacks counted by source file, running `getAnimations()`, canvas sizes, AudioContext states; scratchpad `heat-probe/probe.cjs`). The island WebGL loop was already fully asleep behind both (0 island frames, no running CSS animations). What still ran, and the fixes:
- **HUD rest timer loop (bug).** `hudSettle` (`IslandSettings.tsx`) waited for the Paths button's 3 s cycle to reach a clean frame. Under a card or dialog that cycle is paused, so it re-armed a 216 ms timer forever (about 4.7 wakeups/s behind every open card). Now a cycle that is not `running` rests at once. Measured: 28 timer fires per 6 s → 0.
- **Card film frame pacing.** `CardFilmPlayer` drew 24 fps but requested every display frame (60–120/s). Between frames it now sleeps on a timer and requests a display frame only when the next one is due. Measured: 360 → 123 rAF callbacks per 6 s at 60 Hz.
- **Pop-up book narration pacing.** `PlayerBookScene` narration frames 30 → 24 fps (the films' rate), with timer sleeps between them; open/turn/close/action tweens keep display rate up to 60. Measured: 361 → about 209 rAF callbacks per 6 s; task time 0.51 → 0.10–0.14 s per 6 s.
- **Pop-up book DPR.** Phones (coarse pointer or short side < 600) 2 → 1.5, the cap approved for card films; desktop stays 1.75; a warm heat tier or Battery saver caps it via `filmDprCap()`. Canvas at 390×844: 780×1260 → 585×945 (−44% pixels, MSAA and PCF shadows included).
- **Island canvas under the book.** The reader is opaque and full-screen, so `body:has([data-player-book]:not([data-fading])) .town-scene canvas{visibility:hidden}` (globals.css) takes the asleep island canvas out of compositing; it shows again as the reader fades out.
- **Card dialog backdrop blur.** `PositionGuide` marks its player view (`data-card-view`); there the `::backdrop` is a plain tint instead of `backdrop-filter: blur(4px)`. A full-screen backdrop blur is re-sampled on every composited frame under it: each film frame and every frame of a flip.
- **Blend layers under a playing film.** Once the film's 0.3 s fade-in ends, the multiply-blended art planes beneath the opaque film and the colour-dodge foil are `visibility:hidden` (PlayerCard.module.css), so they are no longer blended under every film frame. They return at once when the film fades or ends (verified: hidden while playing, visible after).
- **Checked and left alone:** the card tilt spring sleeps when still; flips leave no running loop (only the flip's own ~0.8 s timers); the book's music-box AudioContext runs only for its 13 s phrase, then suspends; the island sound context is suspended during films and narration.

Validation: tsc; `tests/iconic-play-ui.cjs` green (film fits the window, caption, Stop/Flip/Escape/hidden fade back, reduced motion); probe screenshots of a playing film unchanged. Compositing savings (blur, blend layers, hidden canvas) are not visible to CDP metrics; not yet measured on a physical iPhone.

## Travel map: map-only, pannable — September 29, 2026 (local, not deployed)

`IslandTravelMap` is now only the map (destination list and intro sentence removed; the Island Square vending machine is the map's tappable "Vending machine" trip). The map covers the frame and pans with four edge arrows, arrow keys or a drag. **Added runtime cost:** none while closed; while open, one `ResizeObserver` on the frame (disconnected on close), one CSS `transform` transition (0.38 s) per arrow/key press, and one direct transform write per pointer move while dragging. No rAF loop, no timers while idle; the island still sleeps under the map. The stage is `will-change:transform` so pans only composite (layer ≈ map size × DPR, e.g. ~580×750 CSS px on a 390-wide phone). Validation: Playwright at 390×844 (touch), 844×390 and 1440×900 — map fills the frame, arrows clamp and disable at the edges, hidden on axes that fit, keys and drag pan, tapping a place travels. Not measured on an iPhone.

## Deep Sea Boat — September 29, 2026 (local, not deployed)

A moored fishing boat at (282.5, −93.5), about 38 m off the main island's east beach (the user's circled spot; earlier the same day at (370, −68), then (310, −72)), with its own deep-sea fishing spot ([details](fishing.md#deep-sea-boat-29-sep-2026)).

**Implementation.**
- One merged, vertex-coloured `MeshStandardMaterial` mesh for the whole boat (hull bands, deck, bulwarks, wheelhouse, rods, cooler, life ring, flag): **one draw**. It receives the player's shadow but `castShadow=false`, so it adds no shadow-map draw.
- Lazy: nothing exists until the player is within 260 m of the mooring; everything (geometry, material, the landable deck) is disposed beyond 340 m. At West Cove, the scene has no `deep-sea-boat` object.
- Bob: one group transform (±3.5 cm heave, <1° roll/pitch) written only while the player is within 150 m, the boat's bounding sphere is inside the camera frustum and reduced motion is off; otherwise nothing is written (a reset once when it stops). The deck floor height follows the heave, so a player on deck rides it. No timers, no loop of its own: `fishingWorld.update` calls it from the existing island loop.
- The deck uses the Coral Cay agent's `registerLandableDeck` hook (one rectangle test in `blocked`/`onLand`/`surface` while registered).
- Fishing on the boat reuses the existing live-fishing visuals, camera and HUD (no new art modules); the new fish are data plus inline Fishbook SVG shapes.

**Measured** (headless Chromium, Metal ANGLE, `window.__fi2.renderer.info.render.calls`, median of 20 frames; "without" = the boat group hidden in the same frame state, i.e. the pre-boat scene):

| View | 1280×800 with / without boat | 390×844 with / without boat |
| --- | --- | --- |
| Flying over the boat | 113 / 112 (+1) | 76 / 75 (+1) |
| Fishing on the deck | 84 | 61 |
| Main island east coast (205, −140), boat built ~190 m away (measured at the first position) | 122 / 123 (0, culled or noise) | 71 / 71 (0) |
| West Cove (boat not built) | 65 | 43 |

**Validation.** `tests/fishing.cjs` asserts the single merged mesh, no shadow casting, no timers or frame loops, the build/drop/bob ranges and the frustum gate. Browser checks at both sizes: fly, land on the deck, walk, fish, two catches, Fishbook, no errors. Reduced work only: no physical-iPhone temperature was measured.

## Ball hunt at 100: Coral Cay balls (Sep 29, 2026)

The 20 Coral Cay balls (`lib/town/coralCayBalls.ts`, [doc](ball-hunt-coral-cay-2026-09-29.md)) join the existing `createCoinHunt` entries, and each parcel is still one packed draw. The buoy is baked into its parcel, the causeway manhole uses the existing instanced covers (count 26), and there are no new loops, timers or animations. The Coral Cay parcels do not cast shadows, which keeps the hunt's casters at 23 instead of 38. Measured in dev Chromium over the first causeway bend: 98 → 99 draw calls at 1280×800 and 72 → 72 at 390×844. This is reduced, bounded work, not an iPhone temperature result.

## Live beach soccer at Coral Cay — September 29, 2026 (local, not deployed)

**What runs.** A fifth live match (`LIVE_VENUES` in `lib/town/venues.ts`: the four island pitches plus `BEACH_VENUE`, derived from `BEACH_COURT` in `coralCay.ts`) plays the new `'beach'` format of `lib/town/match/matchSim.ts` on the Sharks Beach court: 5 a side including the keepers, barefoot, no offside, sand friction (×1.3 on a rolling ball, air drag unchanged), lifted passes, keeper throws/rolls within 4 s (never a punt, and never a direct goal from the hands, a kick-in or a kick-off), keepers stepping up, chipped kick-ins, more volleys/overhead kicks, 3 × 60 s periods, 15 s extra time when level, then a 5-kick shoot-out and a fresh game. The court runs east–west, so the runtime maps sim space through `liveWorldX/Z/Yaw` (bit-identical expressions for the unturned pitches); choreo and the combo view take the venue yaw.

**Heat.** Nothing new runs per frame: the beach entry is one more item in `fieldRuntime`'s existing loop, with the same pooled rigs (created only the first time the court is seen), the instanced bean-skin batch, the shared ball geometry/material, and heat pass 5's dormant rule. From the main island the court (~500 m away) is dormant: no clock, sim, bookkeeping, effects or posing, and its sim clock is frozen exactly. No new render loops, timers, audio or DOM. The "Learn Beach Soccer" card was removed at the user's request (no prompt is registered or rendered for the beach venue). Live matches have no sounds on any venue, so the beach has none either.

**Measured** (headless Chrome, 390×844 DPR 3, touch, 4× CDP CPU throttle, 6 s windows after 3.5 s settle, machine load 16–22; draw calls counted per `render()` with colour + shadow passes; emulation, not iPhone temperature):

| Scene | Renders/s | Draw calls median (p95) | `render()` CPU median | Frame interval median / p95 | Task ms/s | Beach match |
|---|---|---|---|---|---|---|
| Main island, beach registered | 30.3 | 264 (269) | 13.6 ms | 16.7 / 16.8 ms | 677 | dormant, +0.00 s sim |
| Main island, beach entry removed (A/B) | 30.2 | 272 (281) | 15.2 ms | 16.7 / 16.7 ms | 708 | — |
| Main island, entry restored | 30.2 | 276 (281) | 14.3 ms | 16.7 / 16.8 ms | 665 | dormant, +0.00 s |
| Coral Cay court, match running | 30.2 | 118 (137) | 11.2 ms | 16.7 / 16.7 ms | 611 | 10 rigs, 9 drawn, +2.9 s sim |
| Back on the main island | 30.5 | 266 (274) | 15.2 ms | 16.7 / 16.8 ms | 767 | dormant, clock frozen |

The main-island rows differ only by noise (camera settle, townsfolk, load); the beach entry costs nothing there. Script: session scratchpad `beach-match/heat.cjs`.

**Balance** (480 seeds, 3 sim minutes): beach 3.13 goals/game, 15.24 switches/min, 54/480 one-sided (≥3), mean margin 1.21, 27.3 shots, 1.0 first-time finishes, 66 % of kicks lifted, 0 offside calls. The four island formats are byte-identical to the pre-beach sim (`tests/beach-match.cjs` snapshot; 480-seed `combo-balance` before = after).

**Validation.** `tests/beach-match.cjs` (in `npm test`), `scripts/check-beach-match-browser.cjs` (map travel to the cay, live match inside the court lines, position guide + player card from a live player, dormant again on the main island; 1280×800 and 390×844).

## East Pier — September 29, 2026 (local, not deployed)

A ~108 m timber pier from the east-coast seawall in front of the Farmers Market (on the market banner's axis, z 98) out to a 16.6 × 23 m T-head at x 346, with a fishing spot, a floating shooting-challenge ring and two islanders (`lib/town/eastPier.ts`, `eastPierWorld.ts`, `eastPierChallenge.ts`, `eastPierNpcs.ts`).

**Implementation.**
- **Scenery** is built inside `buildTown` with the shared helpers before the batching pass, so every piece joins the existing 50 m spatial paint batches (vertex colours, one shared material per chunk). Deck and seam boxes are 0.3 m thick on purpose: thin flat boxes keep their own material in `put()`, thick ones merge into the paint batch. The only new materials are four sign canvases (arch both ways, challenge board). No per-frame work, no animation.
- **Lamps** reuse the street-lamp pieces: the `#ffe8ae` lens is the shared emissive lamp lens and each of the 9 lamps adds a site (`region:'east-pier'`) to the existing instanced night-pool chunks. No real lights.
- **Coral Cay region gate:** the pier's chunks (x 250–350, z 50–150) are excluded from `cayChunks`, so the gate's single box test never hides the pier; they keep ordinary frustum culling. The cay chunk set is otherwise unchanged.
- **Floors:** two static `registerLandableDeck` rectangles (walkway, head) at y 0, registered once at import. `blocked`/`onLand`/`surface` pay one rectangle test each while on or near them; nothing runs per frame.
- **Shooting ring:** one merged, vertex-coloured mesh, `castShadow=false`, `matrixAutoUpdate=false`, never animated; it is moved only from the ball's existing splash callback when a shot lands in it. No loop, timer or state polling.
- **Islanders** (Nell the fisher, Ollie doing keep-ups) are ordinary entries in the townsfolk runtime: drawn/posed only within its draw distance, stepped at 10 Hz off screen (heat pass 5).
- **Fishing** reuses the existing post, float instance and live-fishing flow (one more instance in the merged posts / floats).

**Measured** (dev server, headless Chrome with Metal ANGLE, explicit `renderer.render` of the current frame, median of 15; colour + shadow passes; "without" = the pier's merged chunk meshes and ring hidden in the same frame):

| View | 390×844 touch DPR 3: before → after (without pier scenery) | 1280×800: before → after (without) |
| --- | --- | --- |
| Island Square (95, −35) | 147 → 147 (147) | 292 → 290–303 (292; townsfolk noise) |
| Promenade at the market (226, 98), facing the pier | 125 → 128 (122) | 188 → 195 (186) |
| Mid-pier (290, 98) | 57 → 70 (61) | 104 → 120 (106) |
| Pier head (340, 98) | 39 → 58 (49) | 69 → 92 (77) |

"Before" was the same positions over open water before the scenery existed. Near the pier the scenery costs +6 to +15 draw calls (paint batches, lamp lens batch and signs for 2–3 chunks, colour and shadow passes); the rest of the rise at the head is the fishing post, the two islanders and simply having something in view. Island Square is unchanged. Script: session scratchpad `east-pier/perf.cjs`, `perf2.cjs`.

**Validation.** `tests/east-pier.cjs` (in `npm test`) checks the static-only scenery, the ring's single shadowless mesh without loops, lamps in the pool batches and the gate exclusion. Browser walk-through (`east-pier/e2e.cjs`, 1280×800 and 390×844 touch): walk the market → pier → head with the rails holding, talk to Nell, kick into the ring (+5 learning coins once), scooter the full length, jetpack landing on the deck, fishing one catch at the new spot (`scripts/check-fishing-browser.cjs mobile east-pier`); no page errors. Reduced, bounded work only: no physical-iPhone temperature was measured.

### East Jetty rework — September 30, 2026 (local, not deployed)

The user asked for "more of a jetty" with a spiral end. The timber pier is replaced by a stone jetty: a 62 m straight walkway from the same seawall gap (z 98), then a nautilus spiral of 1.25 turns centred on (300, 76), winding inward from a 22 m to a 6 m radius into a round plaza (walkable radius 4.9 m) with a navigation beacon. The walkway is 4.8 m walkable (kerbs at 2.55–2.95 m from the centre line), 174 m long along its centre line; the far east curve reaches x ≈ 323.

**Implementation.**
- **Collision/floor:** ONE landable deck (a bounding rectangle, then `contains` = `onEastPier`). `jettyOffset` is a closed-form polar test: one or two coil angles per point, with the radial gap corrected for the pitch angle, plus the straight part and the plaza. No sample loops at runtime. `landableDecks.ts` gained the optional `contains` field; the rectangle test still runs first.
- **Scenery** (`eastPierWorld.ts`): the stone walkway, kerb tops and faces, the sloping rock armour and the foam line are ribbon strips over the shared centre-line samples, cut into ≤ 24 m pieces so each joins its own 50 m paint batch. About 170 riprap boulders are individual icosahedra that merge into the same paint batches, so they add no draws of their own. Shallows bands (the causeway's `fadeBand` and shared material) fade out from both flanks, including inside the coils. The beacon lantern uses the shared emissive lamp lens. There are 8 kerb lamps plus the beacon in the night-pool batch, and no new materials beyond the sign canvases.
- **Unchanged:** the ring (one static mesh, moved only on a hit), the islanders (townsfolk runtime), the fishing post and float instances, and the Coral Cay gate exclusion for the x 250–350, z 50–150 chunks.

**Measured** (same method as above, 390×844 touch DPR 3 / 1280×800; "without" = the jetty's merged chunk meshes and ring hidden in the same frame):

| View | Timber pier (29 Sep) | Jetty (30 Sep) | Jetty without its scenery |
| --- | --- | --- | --- |
| Island Square | 147 / 290–303 | 147 / 290 | 147 / 290 |
| Promenade at the market (226, 98) | 128 / 195 | 126 / 194 | 122 / 186 |
| On the straight (290, 98) | 70 / 120 | 72 / 127 | 62 / 111 |
| End: pier head (340, 98) → spiral centre (302.5, 76) | 58 / 92 | 66 / 117 | 55 / 103 |
| Spiral outer east curve (320, 76.4) | — | 63 / 107 | 54 / 95 |

The jetty's own scenery costs +4 to +16 draw calls near it (paint, shallows and lens batches over three chunks, colour and shadow passes). That is about the same as the timber pier on the straight; it is higher at the end because the spiral centre looks back over the whole spiral, the straight and the market. Island Square is unchanged. Script: session scratchpad `east-pier/jetty/perf-jetty.cjs`. This is reduced, bounded work only; no physical-iPhone temperature was measured.

**Validation.**
- `tests/east-pier.cjs` (rewritten for the spiral, in `npm test`): shape, smooth curvature, open water between the coils, walkable ±walkHalf everywhere, walk, scooter, bike and moped steering along the centre line to the spiral centre, both edges holding at five points round the curve for every mode, landing, flight zone and boat clearance.
- Browser (`east-pier/jetty/e2e.cjs`, 1280×800 and 390×844 touch):
  - walk and scooter from the market round the spiral to the centre (max offset 1.8–2.2 m of 2.4);
  - talk to Nell;
  - kick into the ring (+5 learning coins once);
  - jetpack landing on the west coil;
  - fishing one catch at the new spot at both sizes (`scripts/check-fishing-browser.cjs … east-pier`);
  - no page errors.

### Longer jetty and lighthouse — September 30, 2026 (local, not deployed)

The user asked to "make the spiral jetty longer and the lighthouse larger as well".
- **Jetty:** the straight section is now 105 m (x 237.75 → 343, still z 98). The spiral now has 1.75 turns, centred on (343, 68), winding from a 30 m to a 9 m radius; the coils are 12 m apart, leaving about 2.8 m of open sea between the rock flanks. The walkway is 322 m along its centre line and still 4.8 m walkable.
- **Plaza and lighthouse:** the plaza grew to a 7.5 m walkable radius. The small beacon is replaced by a 16.6 m lighthouse: a stone plinth, a tapered white tower in five frusta with two red bands, a gallery deck with 16 railing posts and a ring rail, a glazed lantern in the shared lamp-lens colour (so it glows at night through the existing emissive lens and has a 10 m pool in the night-pool batch), and a red cap with a finial. A keeper's hut stands on the east side, away from the walkway entrance.
- **Footprint:** the far edges are x 374.5 on the east and z 39.5 on the north, and it stays about 144 m clear of the Deep Sea Boat. It all lies inside the existing flyable zone (the south-east sea block), so the flight outline did not change.
- **Moved features:** the fishing spot is now at (371.6, 68) on the outer east curve. The kick spot is at (343, 42.7) on the outer north curve, and the rings are at (343, 19.2), (333, 21.2) and (353, 21.2).
- **Heat:** the lighthouse and hut are plain palette geometry, so they merge into their chunk's existing paint batch: no new material and no new shadow caster beyond that batch. The Coral Cay gate exclusion now covers chunk columns 4–7 and rows 0–2. There is no rotating beam; I left the light static because even a shader-driven cone would add a transparent draw and per-frame uniform writes.

| View (390×844 / 1280×800) | Jetty v1 (30 Sep) | Longer jetty | Without its scenery |
| --- | --- | --- | --- |
| Island Square | 147 / 290 | 147 / 290 | 147 / 290 |
| Promenade (226, 98) | 126 / 194 | 126 / 194 | 120 / 184 |
| On the straight (290, 98) | 72 / 127 | 70 / 121 | 59 / 104 |
| Spiral centre (v1 302.5, 76 → 338.5, 68) | 66 / 117 | 49 / 91 | 39 / 72 |
| Spiral outer east curve (v1 320, 76.4 → 371.2, 68.4) | 63 / 107 | 56 / 86 | 45 / 71 |

The jetty costs +6 to +19 draw calls near it; Island Square is unchanged. The ends are cheaper than v1 because the spiral sits further from the market, so less of the town is in view. The "without" column hides chunk meshes in columns 4–7 whose bounds reach past x 240.5, so it may slightly over-count the jetty's share. Script: session scratchpad `east-pier/jetty-v2/perf-v2.cjs`. This is reduced, bounded work only; no physical-iPhone temperature was measured.

**Validation.**
- `tests/east-pier.cjs` checks: 105 m straight, 1.75 turns, 30 m outer radius, a 14–18 m lighthouse with room around it, walk/scooter/bike/moped end to end, edges at five points round the curve, landing, flight zone, boat clearance, and fishing, ring and NPC reachability.
- `tests/night-atmosphere.cjs` passes: the lighthouse pool counts as a lamp site and stays inside the pool-size bound.
- Browser, both sizes: walk and scooter to the lighthouse, talk to Nell, a ring hit, a jetpack landing and a catch at the new spot; no page errors.
