# Gashapon capsule-toy machines

Owner request, Nov 8 2026. Fourteen capsule-toy machines bought with island coins, each with its own six collectible toys
(84 in all). This round is the **data layer only** (no 3D, no viewer, no UI): `lib/gashapon/machines.ts`, `lib/gashapon/toys.ts`,
`lib/gashapon/store.ts`, `tests/gashapon-data.cjs`. The tables below are generated from those files; the code is the source of truth.

## Rules

- **Price:** 20 coins per spin, flat (`lib/economy.ts` `GASHAPON.price`). Coins come from the arcade wallet, the only balance.
- **Repeat toy:** a toy you already own still counts (`n` goes up) and gives **5 coins back** (`GASHAPON.repeatRefund`).
- **Odds:** each machine has 3 common (22 % each), 2 uncommon (12 % each) and 1 rare (10 %): weights sum to 100. No pity counter,
  and no guaranteed-new-toy rule (owner decision).
- **Safety:** at most 12 spins a day across all machines (`GASHAPON.spinsPerDay`, local play day) and 1.5 s between spins
  (`GASHAPON.minSpinMs`, the capsule animation). A same-tab busy gate and the wallet's cross-tab lock stop double taps.
- **Every toy links to football, the island or Japan** (owner, Nov 8 2026): `link.kind` is `soccer`, `island` or `japan`
  (Konbini food counts as island or japan) with a short note. Generic names, kid-level, no real brands or real people; good-luck
  figures (daruma, maneki-neko, torii, ema) are cute figurines, never jokes. The four Konbini machines lean on food and Japan;
  the arcade and outdoor machines mix football and island life.

## Coins: idempotent, never negative

One spin = one press = one `spinId` (a UUID made by the UI). Inside the store's lock:

1. A receipt for this `spinId` already exists: return it (same toy, no charge, no second toy). If it was a repeat toy whose
   refund did not land, ask the wallet again (the credit is once-only per id).
2. Daily cap and cool-down checks.
3. The toy is rolled from a hash of `machineId|spinId` (`spinRoll`), so a retry rolls the same toy.
4. `spend('gashapon:<spinId>', 20)` on the arcade wallet: refused when the balance is short (never below 0); the same id never
   charges twice (the wallet's own rule).
5. Save the collection. If the save fails, the coins are already recorded under that id: the UI says "tap again" and the
   retry (same id) finishes the spin without a new charge.
6. Repeat toy: `creditOnce('gashapon-refund:<spinId>', 'island', 5)`: once ever per spin id. It is not a Training-meter run.

## Save and account sync

- Key `fi2-gashapon-v1` (SYNC in `lib/saves/snapshot.ts` and `docs/accounts-design.md` table A), so it travels with the account
  snapshot exactly like the Konbini Collection (`fi2-konbini-collection-v1`). **No new Supabase table and no migration**: the
  account save stores the allowlisted keys as one snapshot.
- Shape: `{version:1, owned:{<toyId>:{n, first}}, spins:{<spinId>:{m, toy, at, dup, refund}} (newest 40), day, today, last}`.
  `sanitizeGashapon` drops unknown toys and machines, bad counts and mismatched receipts. Corrupt JSON reads as empty. Every read
  and write is in a try/catch. A few KB at most.

## Placement

The Konbini pairs come from the store's vending-machine spot (`konbiniMachineSpot`) **mirrored across the sliding doors'
centre line**. So they sit west of the doors, flush against the shopfront with the same back line, facing out (yaw 0), clear of
the doorway Enter strip and inside the 10 m shopfront. The vending and drink pair stands east of the doors. The arcade pair stands
against the back wall between Island Strikers and Breakaway Run (room coordinates). The 8 outdoor spots were searched on the town
the game builds and are re-checked by the test: on land, at least 1.4 m from every building and collider, off roads, narrow walk
paths, gardens, courts and pitches, at least 4.5 m from every vending machine, at least 40 m apart, and on flat summit or cay
ground where it applies.

**Coral Cay Konbini made room (round 2, Nov 8 2026):** the potted plant west of the doors, where the pair goes, was removed
(as the east one was dropped for the vending pair on Sep 29 2026) and the bench in front of the west window moved 2 m west
(x − 5.4), off the pair's buying spot. The test checks the pair against every collider with no exemption.

## Heat plan (AGENTS.md: mobile heat is a primary requirement)

- **One shared machine mesh** for the 12 island machines: a single `InstancedMesh` (or one merged geometry per material) with
  per-instance colour from `color`/`accent`. No per-machine materials, no lights, no shadows beyond the island's existing
  setup, no animation loop. The arcade pair is two instances in the arcade's merged prop batches.
- **Toy meshes are built only when the viewer opens** (a few primitives per toy from `colors`) and **disposed on close**
  (geometry, materials, any canvas texture). Nothing is prebuilt for the 84 toys, and the island loads no toy assets.
- **Audio is synthesised** (Web Audio oscillators plus a short noise burst, following each `sound` recipe), started only on a
  touch, one short voice at a time. No audio files and no idle audio.
- The viewer renders on demand (only while a toy is being touched or the capsule is opening), not in a continuous loop. The
  proximity prompt reuses the vending machines' existing nearest-machine check, with no new per-frame scan.

## Round 2: machines in the world and the buy flow (Nov 8 2026)

- **Mesh:** one shared builder, `lib/graphics/gashaponMesh.ts` (cabinet in `color`, cream front with crank + coin slot, tray,
  accent collar, 13 two-tone capsules in a glass globe, cap, a small themed topper per machine: onigiri, daruma, trophy, bug…).
  Island: `lib/town/gashaponWorld.ts` inside `buildTown`: the solid pieces go through `put`, so they join the existing 50 m
  vertex-colour paint batches; the globes share one transparent material, merged per 50 m cell. Measured (tests/gashapon-world.cjs):
  1177 → 1188 town meshes (+10 globe batches for 12 machines, +1 paint batch in the Eleven Park cell, which had none). Live, at the
  Island Square Konbini: 235 draws desktop / 131 phone, the pair's globes are 1 of them (`scripts/check-gashapon-browser.cjs`).
  Arcade: the pair is one merged vertex-coloured mesh + one glass mesh in `lib/arcade/arcadeRoomProps.ts` (2 draws). No lights,
  no textures, no animation; culled with the town's batches.
- **Colliders:** each cabinet's footprint (+3 cm) is an island obstacle / an arcade prop collider; walk-up spots (0.9 m in front)
  and the Konbini doorways are checked clear.
- **Prompt:** `lib/graphics/gashaponPrompt.ts`, 12 squared distances per frame, HUD-stack key `gashapon` (kind 'enter'); the arcade
  room reports the nearest of its two machines on a change (`onGashaponNear`).
- **Panel:** `components/GashaponPanel.tsx` (lazy-loaded): name, price, coins, Spin, "X of 6 toys found", capsules left today,
  honest errors (not enough coins, daily cap, cool-down, a failed save keeps the spin id: "Try again (no extra coins)"). The drop
  is CSS once per spin; reduced motion skips the travel. Sounds: `lib/gashapon/gashaponSound.ts` (shared AudioContext, muted with
  the island). The reveal card art is a placeholder from the toy's colours; "Look closer" calls `openToyViewer(toyId)` (round 3).
- **Browser store:** `lib/gashapon/gashaponBrowser.ts` (same pattern as the Konbini collection, `fi2-gashapon-v1`, arcade wallet
  spend + once-only refund). No analytics yet.

## Round 3A: the toy viewer, the builder kit and the Toy Shelf (Nov 8 2026)

- **Viewer** (`components/GashaponToyViewer.tsx` + `lib/gashapon/toyViewer.ts`): full screen, the museum ball viewer's recipe
  (own canvas + renderer, studio sweep, contact-shadow texture, drag with throw inertia, sleeps when idle / hidden, ≤ 1.5× DPR on
  phones). Toys spin on a turntable (yaw free, camera pitch clamped), pinch / wheel zoom. Hold = squeeze (squash + squeak, its
  squeeze reaction on let-go), tap = poke by part (the head region plays the tap reaction). Idle breath ~8 s after the last
  touch, then the loop stops; reduced motion: 30 % amplitude, no idle, no inertia. Haptics via guarded `navigator.vibrate`.
  Opens from the result card ("Look closer") and the Toy Shelf; only owned toys. Keys: arrows spin, +/− zoom, Space poke, S squeeze.
- **Island cost while open: none.** `lib/videoPlayback.ts holdIslandCover()` stops the island loop and world sound (not counted as
  'films' time); the Arcade room `setCovered`. Measured live: 0 island frames while the viewer is open, the island resumes on close.
- **Builder kit** (`lib/gashapon/toyKit.ts`): `toyModels/<machine-id>.ts` default-exports `{[toyId]: (k) => ToyBehaviour}`. Parts
  are named pivots; primitives (sphere, capsule, box, rbox, cyl, cone, torus, lathe, extrude, roundTri, face) are written in one model
  space; each part merges into one vertex-coloured mesh (toon material + optional shiny one), so draws ≈ parts. Reactions
  (`lib/gashapon/toyReactions.ts`: squash, stretch, jiggle, hop, bounce, spin, twirl, wobble, rock, tip, bow, nod, shake, sway, swim,
  glide, loop, flip, kickup, blink, wink, wiggle, swish, wave, flap, clap, peek, pop, kick, tilt, glow, sparkle, puff, bubbles,
  petal) are referenced as `name` or `name:partA+partB`; voices (`lib/gashapon/toySound.ts`, Web Audio presets, `preset:pitch`).
  Unbuilt toys use the generic capsule figure (`toyModels/generic.ts`), whose reactions and voices are read from the toy's own words.
- **Built so far:** all 84 toys (6 per machine, 14 machines, each its own model in lib/gashapon/toyModels/): at most 12 draws and 8.9k triangles each, 36+ reactions and synthesized voices; QA Nov 8 fixed viewer fit, stacked taps, context loss, hidden-tab sound
  (tests/gashapon-viewer.cjs prints them); budget ≤ 40 draws, ≤ 9k triangles. Freed on close (geometries, materials, the toon ramp,
  textures, the particle mesh, the renderer and its context); two lights; no real-time shadows; voices throttled (80 ms) and capped (4).
- **Toy Shelf** (`components/GashaponToyShelf.tsx`): every machine's six toys, "N / 84", CSS icons from the toy colours (no WebGL
  per tile), silhouettes with "?" for toys not found. From the backpack (beside the Konbini Collection) and the panel's Toy Shelf button.
- **Machines 1.2×** (`lib/graphics/gashaponMesh.ts` GASHA_SCALE): heights, globe, cap and topper 1.2×, the cabinet's width/depth 1.075×
  so it stays inside its unchanged collider; same pieces, same draws (town 1177 → 1188 meshes, as in round 2).
- **Analytics** (`lib/analytics/gashaponEvents.ts`, ids `gs:*` in countIds.ts, generic counters: no table or migration): spins (per
  machine, per toy, rarity word, new/repeat, coins spent and refunded as sums), viewer opens by source and toy, squeeze/poke/tap
  (≤ 3 of each per open), shelf opens with a found band. Silent while the tracker is off (dev, DNT/GPC, bots…). No admin card yet.

## Round 3B: toy kinds, the studio viewer and the Onigiri Pals pilot (Nov 9 2026)

Owner (Nov 9): "when squeezing, letting go it still squeezes the toy" · "improve the visuals of each toy and also the quality ·
have the gashapon be different types: some you can take apart and put back together like a puzzle, some are squishy · freeze
everything on the island and use that power to make each of the toy interactions better".

**The squeeze bug (fixed for all 84).** Two causes: (1) the let-go reaction of many toys was itself a squash (`squash`,
`e_juicysquish`, `d_widen`, `c_pixelshrink`, `beat1-3`), so the toy squashed again after the finger was up; those are now dropped
from the let-go list (`releaseRefs`, `jiggle` if nothing else moves). (2) Releases could be missed: up / cancel are now WINDOW
listeners, plus lost pointer capture, blur, a hidden tab and the last touch ending (`lib/gashapon/toyGestures.ts`, a pure gesture
state machine the component feeds). The squeeze pressure is a damped spring (k 256, c 16): ~16 % overshoot wobble, at rest in ~0.5 s.
Tested in node for every toy × 6 ways of letting go (up, up outside, cancel, a second finger, blur, hidden tab: all back at rest in
600 ms) and in Chrome with real mouse / touch input (scripts/check-gashapon-toys-browser.cjs: 315–577 ms). A round 3A toy's own
stretch reaction (Mochi's snap-back) may still be finishing at 600 ms; no squash is left by 1 s.

### What real capsule toys do (research, Nov 9 2026)

- Bandai's own catalogue groups are variety, living things, collectibles and kids; the common types are character figures (the
  biggest group), miniature food and objects, animal figures, keychain / bag charms and rings ([Tokyo Cheapo](https://tokyocheapo.com/editorial/gashapon-guide/),
  [Metropolis](https://metropolisjapan.com/japan-gachapon-capsule-toy-craze/), [Japanese Clothing](https://japanese-clothing.com/?p=77875)).
- **Snap-together and puzzle capsules:** figures split into parts to fit the capsule and click together without tools; Bandai even
  sold capsules whose only prize is the puzzle of opening them ([SoraNews24](https://soranews24.com/2023/03/15/japans-newest-capsule-toys-capsules-that-absolutely-wont-open%e3%80%90photos%e3%80%91/amp/)).
- **Squishies:** mochi / foam squeeze toys, often slow-rising (they hold the dent, then puff back), some water-filled for a jelly feel
  ([Sanrio capsule squishies](https://sanrio.com/products/hello-kitty-and-friends-sushi-capsule-squishies-series-4), [Have a Good Holiday](https://www.haveagood-holiday.com/en/articles/suyasuya-mochitto-animals-capsule-toy)).
- **Wind-ups:** zenmai capsule walkers (a twist, then they toddle off; some glow in the dark) ([Flying Pig Toys](https://flyingpigtoys.com/products/yoshi-wind-ups-blind-box.oembed)).
- **Working parts:** lids that open on hidden treasure, miniatures with moving parts ([IHCSA](https://ihcsacafe-en.ihcsa.or.jp/?p=6172)).
- **Variants and secrets:** many lines have normal / metallic / clear versions and a "secret" figure; opaque capsules keep the
  contents hidden ([Toy People](https://www.toy-people.com/en?p=113870), [Wikipedia: Gashapon](https://en.wikipedia.org/wiki/Gashapon)).
- **Delight comes from:** a pose that plays with its surroundings (Kitan Club's cup-edge Fuchiko), real detail at tiny scale, the
  blind-box surprise and swapping to complete a set ([Otaku Mode](https://otakumode.com/news/566f7eb865c288ea1659d4dc/Capsule-Toy-Fuchico-on-the-Cup-Out-in-Force!-Kitan-Club-10th-Anniversary-Exhibition-Report),
  [Nippon.com](https://www.nippon.com/en/japan-topics/g01212/)). Not found in the sources: spinning-top and bobblehead capsule lines
  specifically (they are common toy forms; kept as kinds on that basis).

### Toy kind taxonomy (`lib/gashapon/toyKinds.ts`)

| Kind | Real thing | In the viewer | Hint chip | Keys |
| --- | --- | --- | --- | --- |
| squish | foam / mochi squishy | hold: volume-keeping squash (soft body), let go: spring back + wobble; tap: a dent at the touch point; rub during a hold: jiggle | Squeeze me | hold S |
| jelly | clear / water jelly | squish with a translucent jelly finish and a looser wobble | Squeeze me | hold S |
| puzzle | snap-together / layered food | drag pieces off (tug, then pop free), they drop on the tray and slide to a slot; near the socket a glow ring; let go: click in; all back: confetti + chime | Pull me apart | A / R |
| windup | zenmai walker, pull-back | drag the key or hold to wind (ratchet), let go: it walks a figure-eight, the key unwinds, it creeps home and settles | Wind me up | hold W |
| spintop | spinner | a fast flick on the toy spins it about itself; friction, a growing wobble, a settle | Flick to spin | F |
| bobble | bobblehead | the head (or a top knot) on an angular spring: bumps, spins and steps set it nodding | Bump my head | B |
| capsule | secret / capsule-in-capsule | the rare arrives in a second capsule: twist the top past ~110° and it pops, halves land on the tray, the toy springs out; tap a half to pack it back | Twist me open | O |
| mechanism | working parts | drag a lid / lever / button / crank / wheels (round 3C, below) | the part's own: Open me, Pull me, Push me, Crank me | M, ↑ ↓ |
| charm | ball-chain mascot | hangs on a verlet ball chain, grab the ring and swing (round 3C) | Swing me | C |
| figure | posed figurine | tap / drag an arm or the head between preset poses, Star pose, a victory idle (round 3C) | Pose me | P, V, Space |

Every kind also has visible action buttons and a polite live status line (screen readers), and every grab target is at least
22 px in radius on screen (a 44 px target) through enlarged hit spheres. Haptics per event (snap, pop, complete, ratchet, reveal…).

### Every toy's kind (main + bonus; rares: secret capsule + finish)

| Machine | Toys (kind + bonus) |
| --- | --- |
| Onigiri Pals (live, HD) | Ollie puzzle+squish · Melon Pan squish+spin · Nikuman squish+bobble · Karaage wind-up+squish · Oden puzzle+bobble · **Golden Onigiri** capsule (gold)+squish |
| Lucky Little Japan | Daruma puzzle (daruma-otoshi)+bobble · Maneki squish+mechanism · Origami mechanism+charm · Koi spin+charm · Ema charm+mechanism · **Torii** capsule (pearl)+figure |
| Sweet Shop Treats | Taiyaki puzzle+squish · Mochi squish (slow-rise)+bobble · Dango puzzle+spin · Ramune jelly+mechanism · Dorayaki mechanism+squish · **Kakigori** capsule (clear)+jelly |
| Bento Box Buddies | Bento puzzle+mechanism · Tamago squish+mechanism · Curry Bun squish+bobble · Banana mechanism+bobble · Juice Box bobble+mechanism · **Sushi Roll** capsule (glitter)+puzzle |
| Cabinet Heroes | Sparky wind-up+bobble · Bolt bobble+wind-up · Tess squish+charm · Finn mechanism+spin · Pip puzzle+mechanism · **Claw Bean** capsule (glitter)+squish |
| Pixel Pitch | Pixel Ball squish+spin · Keeper puzzle+bobble · Ref wind-up+bobble · Ticket mechanism+charm · Puck spin+mechanism · **High Score** capsule (gold)+puzzle |
| Beach Day | Beach Ball squish+spin · Sandcastle puzzle+mechanism · Flip-Flop mechanism+charm · Surfboard wind-up+bobble · Sunhat spin+charm · **Lifeguard** capsule (pearl)+mechanism |
| Shell Seekers | Starfish squish+spin · Hermit puzzle+wind-up · Sand Dollar spin+mechanism · Conch charm+mechanism · Seagull bobble+wind-up · **Sea Glass** capsule (clear)+jelly |
| Boots & Kits | Golden Boot wind-up+mechanism · Shin Pad squish+mechanism · Glove Frog bobble+squish · Armband squish+charm · Kit Shirt puzzle+charm · **Corner Flag** capsule (glitter)+charm |
| Trophies & Legends | Cup puzzle+mechanism · Medal charm+spin · Whistle mechanism+charm · Scarf squish+charm · TV Ball spin+puzzle · **Stadium** capsule (gold)+mechanism |
| Rides & Rollers | Scooter wind-up+mechanism · Bike mechanism+wind-up · Moped bobble+wind-up · Jetpack puzzle+spin · Ferry squish+wind-up · **Lighthouse** capsule (pearl)+mechanism |
| Bug Squad | Ladybug mechanism+wind-up · Grasshopper wind-up+squish · Ant puzzle+wind-up · Dragonfly spin+charm · Firefly jelly+charm · **Monarch** capsule (glitter, a chrysalis)+mechanism |
| Reef Friends | Shark wind-up+bobble · Clownfish squish+charm · Octo jelly+squish · Manta charm+spin · Turtle puzzle+wind-up · **Whale** capsule (pearl)+squish |
| Summit Orchard | Mango squish+spin · Papaya puzzle+squish · Avo mechanism+bobble · Orange spin+squish · Cairn puzzle (stone stack)+bobble · **Summit Goal** capsule (gold)+mechanism |

Mix rule (tested): every machine has ≥ 1 puzzle, 1–2 squishy (squish / jelly), ≥ 1 mechanical (wind-up / spin / mechanism), and its
rare (only) is a secret capsule with a rare finish and an extra part.

### The freed power: the HD viewer (only while it is open; `lib/gashapon/toyViewer.ts`, `toyKit.ts` `hd`, `toyInteract.ts`)

- **Materials:** one `MeshPhysicalMaterial` per finish used: vinyl (clearcoat), matte PVC, soft (sheen: rice, buns, cloth), nori,
  ink (glossy eyes), jelly (transmission-lite: transparent + clearcoat, no extra render pass), clear (capsule plastic), gold
  (metal), glitter (a 64² generated noise normal map), pearl (iridescence). Neutral tone mapping for HD toys only.
- **Light:** a studio rig of 4 (warm key with ONE soft shadow map, 1024² desktop / 512² phones, PCF soft; cool fill; warm rim from
  behind; low hemisphere), the shadow on a ShadowMaterial turntable floor plus the round 3A contact ellipse, and a generated PMREM
  reflection of three's tiny RoomEnvironment (built on the first HD show, disposed on close). Round 3A toys keep their toon look
  and their two lights (the rigs swap per toy).
- **Geometry:** HD segments ~2.6× (sized by radius), smooth Catmull-Rom lathes, tubes (grooves, pleats), noise-displaced blobs
  with per-vertex crust shading (fried batter), indexed meshes.
- **Soft body:** CPU deformation of every mesh of the toy in model space by damped spring modes: a volume-preserving squash
  (bulging most at mid-height), a jelly sway that grows with height (kicked by spins, taps, rubs, steps), a vertical jiggle and up to
  4 dents at touch points; normals follow the squash; rest positions are restored exactly once it is still, then it sleeps.
- **Rigid-ish pieces, wind-up, spin, springs, capsule:** see the taxonomy above (gravity, bounce, tray slots, snap easing, a glow
  ring at the socket, the figure-eight walk, friction + precession wobble, angular springs).
- **Sound:** the toy keeps its own voice; kind sounds under it (`k_*` in `toySound.ts`: squelch, puff-back, dent, crackle, pop,
  snap click, drop, blocked, completion chime, ratchet, whirr, tick, twist creak, reveal, close). Still ≤ 4 voices.
- **Budgets:** HD ≤ 120 draws / 60k triangles / 10 materials per toy (pilot: 7–17 draws, 13.5k–35k triangles); round 3A ≤ 40 / 9k.
- **Heat:** everything only while the viewer is open; the island draws 0 frames meanwhile. 60 fps cap (`frameCapSlot`), 30 fps under
  reduced motion, heat tier ≥ 1 (`tierSettings().cap30Everywhere`) or a low-end phone (≤ 4 cores or ≤ 3 GB); DPR ≤ 1.5 on phones
  and the tier's cap; the loop still sleeps ~8 s after the last touch. Leak checks: 50 shows in one viewer free every geometry,
  material and texture (node) and keep `renderer.info.memory` flat (Chrome: 9 geometries / 4 textures at show 6 and 50); 50 open /
  close cycles leave no canvas and no WebGL context warnings. Not measured on a real iPhone yet (no thermal claim).

### The pilot: Onigiri Pals rebuilt (`lib/gashapon/toyModels/gs-square-snacks.ts`)

Onigiri Ollie comes apart (nori wrap → the top of the rice → a glossy plum filling; order enforced both ways), Melon Pan Mimi is a
soft bun under a crackly cookie crust with a pressed diamond grid and sugar (flick to spin), Nikuman Nico is a very soft tall bun
with 14 swirled pleats and a bobbling twist (steam on let-go), Karaage Kai is a fried-batter wind-up walker with a gold key and
sneakers, Oden Odie's konnyaku, egg and daikon come off the skewer over a little pot of broth and go back in order, and the rare
Golden Onigiri arrives in a pearl-and-gold secret capsule with a star: twist it open for a glitter-gold onigiri on a red cushion
(the extra part). Checks: `node tests/gashapon-viewer.cjs`; `FUTBOL_BASE_URL=… OUT=… node scripts/check-gashapon-toys-browser.cjs`
(on the dev-only `/toy-lab`, every toy owned).

## Round 3C: working parts, ball-chain charms, poseable figures (Nov 9 2026)

The framework the remaining rollout batches use for `mechanism`, `charm` and `figure` (and any bonus of those kinds), plus the
slow-rise foam and the capsule halves. Kit API in `lib/gashapon/toyKit.ts` (declared on the kit, stored on `rig.extras`), runtime in
`lib/gashapon/toyInteract.ts`, UI in `components/GashaponToyViewer.tsx`. Declare the part (its pivot = the hinge line / the hub)
first; axes are part-local (= model space when the parents are not rotated); angles in radians, travel in model units.

| Call | Use | Plays |
| --- | --- | --- |
| `k.hinge(part,{axis,min,max,detents,shut,label,hint})` | lid, flap, door, wing | drag: "up opens" (the grab point's rest-pose direction on screen), a spring follows the finger; detents tick and hold, the end stop clicks and bounces, let go within `shut` (0.32 rad) of closed: it snaps shut with a clack; otherwise it stays |
| `k.lever(part,{axis,max,fires})` | lever, paw, pull switch | springs back on let-go (≈ 0.35 s); past `fires.at` (0.8 of travel) it pops `fires.part` |
| `k.slider(part,{axis:[x,y,z],max,release})` | button, plunger, drawer | push it, a thunk at the bottom; `release:'return'` (default) springs back, `'stay'` for a drawer |
| `k.crank(part,{axis,drives:[{part,ratio,axis?,slide?}]})` | handle, key, pedal | drag in a circle round the hub; drives turn gears / other parts by `ratio` (or slide them); a ratchet tick every 1/8 turn; it coasts |
| `k.wheels([parts],{radius,dir,range})` | cars, scooters, carts | push it: the toy rolls along `dir` on the turntable (wheels turn by distance / radius), slows, rolls home |
| `fires:{part,lift?,scale?,hidden?,hold?}` | a flag pops up, a goal net bulges, a lid treasure appears | springy pop to 1, holds `hold` s (1.4), sinks back |
| `k.chain({mode:'hang',links,length,at,bead,color})` | main `charm`: the toy hangs on a ball chain under a key ring (part `ring`) | a verlet pendulum at 120 Hz whose taut rod is the chain (a heavy keychain keeps it taut), beads (≤ 12 links, 2 beads each, ONE instanced draw) laid along it with a sag that follows the swing (a full N-link verlet chain was tried first: the light links whipped and curled round the toy); grab the ring and swing (≤ 0.42 from home, a hand's swing), it springs home on let-go, the toy swings, settles and sleeps EXACTLY at rest; a fast table spin swings it; a rare tinkle; the body keeps its squeeze |
| `k.chain({mode:'dangle',from,at,tag,length})` | bonus charm: a tag on a short chain off a part | the tag part (declare its pivot at `at` − length in y) hangs from the chain end |
| `k.pose(name,{part:{rot,at}},{label,grab,voice})` | `figure`: 3–4 preset poses | tap / drag a part listed in `grab`: blends (eased 0.36 s, or under the finger) into the next pose that moves it; release past 40 %: it carries on, else back; names `star` (Star pose button, V) and `victory` (a one-time idle cheer 3.2 s after rest, not under reduced motion); a "ta-da" per pose (`k_pose` at rising pitches, or `voice`) |
| `soft:{slow:true}` | slow-rising mochi foam | the squash holds ~0.2 s after let-go, then rises on a slow curve (rest by ~2.4 s), no overshoot, no wobble; dents recover slowly |

Kind specs: `{kind:'mechanism'}`, `{kind:'charm'}` (with a hang chain; `chain:'part'` alone still swings one part on a spring),
`{kind:'figure'}`. Examples (the five dev-only samples in `lib/gashapon/toyModels/_labSamples.ts`, shown on `/toy-lab` only):

```ts
// a boot box: lid, side button, a lever that pops the corner flag
k.part('lid',{at:[0,.44,-.3]});k.rbox(.94,.07,.64,.035,{part:'lid',at:[0,.465,0]});
k.hinge('lid',{axis:[-1,0,0],max:1.9,detents:[1.05],hint:'Open me'});
k.slider('button',{axis:[-1,0,0],max:.035});
k.lever('lever',{max:.9,fires:{part:'flag',lift:[0,.12,0],hidden:true,hold:1.6}});
// a cart: wheels + a crank that spins a gear (×−2) and the ball (×1.5)
k.wheels(['wheelFL','wheelFR','wheelBL','wheelBR'],{radius:.13,dir:[0,0,1],range:.42});
k.crank('crank',{axis:'x',drives:[{part:'gear',ratio:-2},{part:'ball',ratio:1.5}]});
// a keychain charm
k.chain({mode:'hang',links:10,length:.46,at:[0,.66,0]});return {kind:{kind:'charm'},soft:{soft:.5},…};
// a figure
k.pose('save',{armL:{rot:[0,0,-1.5]},armR:{rot:[0,0,1.5]}},{label:'Diving save',grab:['armL','armR']});
k.pose('star',{armL:{rot:[0,0,-2.2]},armR:{rot:[0,0,2.2]},legL:{rot:[0,0,-.45]},legR:{rot:[0,0,.45]}});
k.pose('victory',{armR:{rot:[0,0,2.95]}},{grab:['head']});return {kind:{kind:'figure'},…};
```

- **Controls:** buttons per working part (Open lid / Close lid, Pull lever, Push button, Crank handle, Push wheels; up to 3),
  Next pose / Star pose, Swing; keys M (work the next part), ↑ / ↓ (move it), P (next pose), V (star), C (swing). The hint chip
  is the first part's own (`hint`: "Open me", "Push me", "Crank me", "Pull me"), "Swing me", "Pose me". A quick tap on a part
  works it (opens / closes, presses, pulls), never a poke as well. Every part, the ring and posable arms grab from ≥ 22 px.
- **Sounds:** `k_click` (end stop), `k_clack` (shut), `k_detent`, `k_thunk` (plunger), `k_spring` (pop-up), `k_roll`,
  `k_tinkle` (rare), `k_pose`. Still ≤ 4 voices.
- **Capsule halves (owner QA):** they land the right way up and sit flat on the tray (the dome on its rim, the cup on its foot,
  a tilt only in flight); the surprise floats up out of the capsule, hovers with a little turn, and settles (≈ 1.5 s).
- **Analytics:** `gs:act_<kind>` (puzzle, windup, spintop, bobble, capsule, mechanism, charm, figure): one total per kind
  interaction, ≤ 3 per kind per open, only for the toy's kind or bonus (lib/analytics/gashaponEvents.ts). Totals only.
- **Heat:** everything sleeps: joints snap to rest (or hold still) and stop asking for frames, the chain sleeps exactly at rest,
  poses only animate while blending; the chain is ONE instanced draw (≤ 22 beads); no timers, no loops of their own.
- **Drag mapping, hinge:** "up opens" uses the grab point's direction of travel at the REST pose (past 90° a lid's tip moves in
  depth and a live tangent flips, which felt broken in tests); px per radian = the lever arm on screen, floored at 70 px.
- **Release timing:** the plunger and lever are back at rest ≤ 600 ms after letting go (Chrome ~300 ms); a hinge snapping shut
  settles in ≤ 600 ms; wheels coast and roll home (~4 s), a crank coasts, a charm swings and settles (several seconds) by design.
- **Checks:** `node tests/gashapon-viewer.cjs` (the samples by synthetic pointer: hinge open / stays / snaps shut with a clack,
  lever fires and is back in 600 ms, plunger back in 600 ms, wheels roll home, crank ratio + ticks, charm swings / settles /
  sleeps at rest / still squeezes, poses by tap and drag, the victory idle once, slow foam, capsule halves flat, 50-show leak
  check); `scripts/check-gashapon-toys-browser.cjs` part 4 (real mouse / touch in Chrome, shots of the hinge open, the chain
  swinging and a pose; 50 open / close cycles).

### Rollout plan (the other 13 machines)

Each batch: rebuild the machine file with the HD kit, add it to `HD_MACHINES` and `KIND_LIVE`, give every model its planned kind
(the test checks the model's kind matches the plan), run both checks. Suggested batches of 3 machines (≈ one Opus agent each,
build + a separate verify agent): (1) Sweet Shop Treats, Bento Box Buddies, Summit Orchard (food: squish / puzzle reuse the pilot);
(2) Lucky Little Japan, Shell Seekers, Reef Friends (needs the `mechanism` and `charm` drag interactions first: a hinge drag and a
pendulum grab); (3) Boots & Kits, Trophies & Legends, Rides & Rollers; (4) Bug Squad, Cabinet Heroes, Pixel Pitch + Beach Day.

## Machines

| # | Machine id | Name | Theme | Zone | x | z | y | Facing |
|---|---|---|---|---|---|---|---|---|
| 1 | `gs-square-snacks` | Onigiri Pals | Konbini snacks with faces | konbini-square: outside the Island Square Konbini, west of the sliding doors | 68.26 | -52.42 | 0 | 0° (+z, out of the shop / into the room) |
| 2 | `gs-square-lucky` | Lucky Little Japan | Cute Japanese good-luck figurines | konbini-square: outside the Island Square Konbini, west of the sliding doors | 67.34 | -52.42 | 0 | 0° (+z, out of the shop / into the room) |
| 3 | `gs-cay-sweets` | Sweet Shop Treats | Japanese sweets and fizzy drinks | konbini-cay: outside the Coral Cay Konbini, west of the sliding doors | 521.26 | -177.42 | 0 | 0° (+z, out of the shop / into the room) |
| 4 | `gs-cay-bento` | Bento Box Buddies | Konbini hot food and lunch boxes | konbini-cay: outside the Coral Cay Konbini, west of the sliding doors | 520.34 | -177.42 | 0 | 0° (+z, out of the shop / into the room) |
| 5 | `gs-arcade-heroes` | Cabinet Heroes | Characters from the arcade games | arcade: in the Arcade, on the back wall beside Breakaway Run | -3.6 | -10.25 | 0 | 0° (+z, out of the shop / into the room) |
| 6 | `gs-arcade-pixel` | Pixel Pitch | Retro 8-bit football | arcade: in the Arcade, on the back wall beside Breakaway Run | -4.52 | -10.25 | 0 | 0° (+z, out of the shop / into the room) |
| 7 | `gs-westbeach` | Beach Day | Beach soccer and sunny sand | outdoor: on the west beach, a short walk east of the Beach Kitchen machine | -55 | 92 | 0 | 26° (towards the island camera) |
| 8 | `gs-northbeach` | Shell Seekers | Shore creatures and beach finds | outdoor: on the North Beach sand, past the North Beach machine | 76.3 | -194.17 | 0 | 26° (towards the island camera) |
| 9 | `gs-eleven` | Boots & Kits | Football gear with faces | outdoor: beside the Eleven Park touchline machine | 100.33 | 117.5 | 0 | 26° (towards the island camera) |
| 10 | `gs-oldtown` | Trophies & Legends | Cups, medals and matchday | outdoor: by the Old Town Ground, west of its machine and clear of the entrance walk | 3.17 | -46.71 | 0 | 26° (towards the island camera) |
| 11 | `gs-jetty` | Rides & Rollers | Island rides and vehicles | outdoor: on the East Jetty plaza, west of the lighthouse | 338 | 68 | 0 | 26° (towards the island camera) |
| 12 | `gs-cayplaza` | Bug Squad | Island bugs that play football | outdoor: on the Coral Cay plaza | 594 | -159 | 0 | 26° (towards the island camera) |
| 13 | `gs-sharks` | Reef Friends | Sea life from the island waters | outdoor: on the Sharks Beach sand, along from its machine | 670.62 | -211.77 | 0 | 26° (towards the island camera) |
| 14 | `gs-summit` | Summit Orchard | Mountain fruit and summit landmarks | outdoor: on the summit terrace, a short walk south of the lookout flag and cairn | 608.89 | 114.79 | 50 | 26° (towards the island camera) |


## Toys

Six per machine, 84 ids, all unique. The link column gives each toy's football, island or Japan tie. Touch reactions (squeeze / poke / tap head) and the sound recipe are plans for the viewer round.

### Onigiri Pals (`gs-square-snacks`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `onigiri-ollie` | Onigiri Ollie | common | A calm rice ball who never drops a pass. | japan: A Konbini rice ball wrapped in seaweed | squishes flat, then puffs back round / wobbles and giggles / bows a tiny bow | a soft "mm-hm" bloop, low then high |
| `melon-pan-mimi` | Melon Pan Mimi | common | A sweet bun with a crunchy grid on top, always cheerful. | japan: The Konbini melon bread bun | crackles like a crust / spins once / sprinkles sugar sparkles | three crispy clicks and a bright "pip" |
| `nikuman-nico` | Nikuman Nico | common | A steamy bun who is warm-hearted and a bit sleepy. | japan: The steamed bun from the Konbini counter | lets out a puff of steam / yawns / wakes with a hop | a breathy "fwoo" puff then a yawn slide |
| `karaage-kai` | Karaage Kai | uncommon | A golden crispy bite who loves a quick one-two. | island: Hot food from the Island Square Konbini | crunches and bounces / sizzles / does a little kick-up | a short sizzle hiss and a pop |
| `oden-odie` | Oden Odie | uncommon | A cosy stick of oden friends who never leaves a teammate. | japan: Konbini oden pot snack on a stick | the three pieces sway / one piece waves / they all cheer together | three warm boops, one after another |
| `golden-onigiri` | Golden Onigiri | rare | The shiniest rice ball on the island, rare and lucky. | island: A Konbini rice ball, in shiny gold | glows and chimes / twinkles / rings like a little bell | a sparkly chime run going up |

### Lucky Little Japan (`gs-square-lucky`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `daruma-dash` | Daruma Dash | common | A round wish-doll who always gets back up after a tumble. | japan: A daruma wish doll: fall down, get up | rocks and rolls upright / tips over and pops back / winks one painted eye | a wooden "tok" then a wobbly roll |
| `maneki-mika` | Maneki Mika | common | A beckoning cat who waves friends over for a match. | japan: A maneki-neko waving cat figurine | paw waves faster / purrs / rings her collar bell | a tiny bell "ting" and a purr rumble |
| `origami-orin` | Origami Orin | common | A paper crane who folds into a new shape when happy. | japan: An origami crane folded from paper | wings fold and flap / paper rustle / takes a short glide | a soft paper rustle and a flap-flap |
| `koinobori-koi` | Koi Kite Kaito | uncommon | A carp streamer who swims in the wind like a winger. | japan: A koinobori carp streamer | tail ripples / flutters / swims a loop in the air | a whoosh of wind and a bubbly blip |
| `ema-emi` | Ema Emi | uncommon | A wooden wish plaque who hopes for a team win. | japan: A small ema wish plaque, as a cute figurine | creaks gently / its string swings / shows a drawn football | a wooden knock and a hopeful hum |
| `torii-tomo` | Torii Tomo | rare | A little red gate figure who welcomes everyone in. | japan: A torii gate shape, as a cute figurine | stands tall and proud / glows warmly / a petal floats down | a calm low bell and a soft breeze |

### Sweet Shop Treats (`gs-cay-sweets`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `taiyaki-tai` | Taiyaki Tai | common | A fish-shaped cake who swims through defences. | japan: The fish-shaped sweet cake | flips its tail / blows a bubble / swims a wiggle | a bubbly "blub-blub" and a tail flick |
| `mochi-momo` | Mochi Momo | common | A stretchy rice cake, the bounciest keeper on the cay. | japan: A soft mochi rice cake | stretches long and snaps back / boings / bounces three times | a rubbery "boing" going up |
| `dango-trio` | Dango Trio | common | Three sweet dumplings on a stick who pass in a triangle. | japan: Three-colour dango on a stick | all three squish in turn / the top one giggles / they spin like a passing triangle | three rising "doo-dee-dah" notes |
| `ramune-rin` | Ramune Rin | uncommon | A fizzy bottle with a marble that rattles when she laughs. | japan: A fizzy marble-topped soda bottle (generic) | fizz bubbles rise / the marble rattles / pops her cap with a fizz | a glass marble clink and a fizzy hiss |
| `dorayaki-doug` | Dorayaki Doug | uncommon | Two pancakes and a sweet middle, solid like a back two. | japan: The pancake sandwich sweet from the Konbini | squeezes sweet filling a peek / pats his tummy / claps his two halves | a soft double "pat-pat" and a chuckle |
| `kakigori-kiki` | Kakigori Kiki | rare | A shaved-ice mountain who keeps cool under pressure. | island: Shaved ice for hot Coral Cay days | crunchy ice crackle / drips a tiny drop / sparkles in rainbow syrup | an icy tinkle and a crunchy shuffle |

### Bento Box Buddies (`gs-cay-bento`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `bento-ben` | Bento Ben | common | A tidy lunch box who brings a balanced snack to every match. | island: The Coral Cay Konbini lunch box | lid pops up / rattles his chopsticks / opens to show a smile | a lid "pop" and a chopstick click |
| `tamago-tama` | Tamago Tama | common | A rolled-egg slice, sunny and quick on the turn. | japan: Tamagoyaki rolled egg from a bento | rolls up and unrolls / wobbles / does a sunny spin | a buttery "flop" and a happy "ta-da" |
| `curry-bun-cooper` | Curry Bun Cooper | common | A crispy bun with a warm heart and a big shot. | japan: The Konbini curry bun | crunch and a warm puff / says "hot hot!" / blows on himself to cool down | a crunchy "krsh" then a puff of air |
| `banana-bolt` | Banana Bolt | uncommon | A banana who fuels up the team after the final whistle. | island: The Konbini’s after-game snack tip: a banana | peels a little and zips back / bends like a curler / points to the goal | a springy "boing" and a zip |
| `juice-box-jun` | Juice Box Jun | uncommon | A little fruit-juice box who reminds you to drink water too. | island: The drink machines’ hydration lessons | slurps from his straw / gurgles / raises his straw like a flag | a straw slurp and a bubbly gurgle |
| `sushi-roll-sora` | Sushi Roll Sora | rare | A seaweed roll who keeps every ingredient together, like a captain. | japan: A rolled sushi snack (veggie) | rolls in a circle / spins on the spot / unrolls a tiny captain band | a rolling drum patter and a cheer |

### Cabinet Heroes (`gs-arcade-heroes`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `striker-sparky` | Striker Sparky | common | The Island Strikers hero who celebrates every goal with a slide. | soccer: The Island Strikers cabinet | does a knee-slide / flexes / scores a tiny goal | an arcade "ding-ding" and a crowd cheer burst |
| `breakaway-bolt` | Breakaway Bolt | common | The Breakaway Run runner who dodges every tackle. | soccer: The Breakaway Run cabinet | sprints on the spot / side-steps / jumps a sliding tackle | fast footsteps and a whoosh |
| `tennis-tess` | Tennis Tess | common | A Futbol Tennis ace who controls every first touch. | soccer: The Futbol Tennis cabinet | juggles a ball / heads it back / volleys over a net | a "pok" bounce, two times |
| `flipper-finn` | Flipper Finn | uncommon | A Futbol Pinball flipper who reads every rebound. | soccer: The Futbol Pinball cabinet | flips up / boings a ball away / lights his bumpers | a pinball "clack" and a bumper bong |
| `puzzle-pip` | Puzzle Pip | uncommon | A Pass Puzzles tile who always sees the space. | soccer: The Pass Puzzles cabinet | slides into place / draws a passing line / clicks a perfect pass | a tile slide and a "click" chime |
| `claw-club-bean` | Claw Club Bean | rare | The lucky bean buddy who escaped the claw machine. | island: The Arcade’s Claw Club machine | gets grabbed and wriggles free / dangles / waves from the prize chute | a claw whirr and a happy "yay" |

### Pixel Pitch (`gs-arcade-pixel`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `pixel-ball` | Pixel Ball | common | A blocky 8-bit football who bounces in squares. | soccer: A retro pixel football | squashes into a smaller square / blinks / bounces in a square path | an 8-bit "bip" bounce |
| `pixel-keeper` | Pixel Keeper | common | An 8-bit goalkeeper who dives left, then right. | soccer: A retro pixel goalkeeper | dives to the side / catches a pixel / punches the ball away | a chiptune dive "bwip" and a save "ta" |
| `pixel-ref` | Pixel Ref | common | A fair 8-bit referee with a beeping whistle. | soccer: A retro pixel referee | blows his whistle / shows a green card for kindness / points to the centre spot | a square-wave whistle "freeet" |
| `ticket-twirl` | Ticket Twirl | uncommon | A curly prize ticket who loves the prize counter. | island: The Arcade’s ticket rolls and prize counter | unrolls a ticket / curls up / prints a little ticket | a ticket printer chatter |
| `puck-pal` | Puck Pal | uncommon | An air hockey puck who glides and never stops smiling. | island: The Arcade’s air hockey table | spins flat / slides away and back / glows at the rail | an air-hockey "clack" and a glide hum |
| `high-score-hero` | High Score Hero | rare | A golden trophy with a blinking score screen. | soccer: The arcade high-score tables | flashes NEW RECORD / counts up points / does a victory spin | a fast chiptune fanfare going up |

### Beach Day (`gs-westbeach`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `beachball-bea` | Beach Ball Bea | common | A bouncy beach ball who plays every game barefoot. | soccer: Beach soccer on soft sand | squishes and boings / rolls in the sand / bounces off your head | a hollow "bonk" and a sandy shuffle |
| `sandcastle-sam` | Sandcastle Sam | common | A sandcastle with goal posts for towers. | soccer: A beach goal built from sand | loses a little sand, then fixes it / a flag pops up / his door opens with a goal | a soft sand pour and a tiny cheer |
| `flip-flop-flo` | Flip-Flop Flo | common | A beach sandal who slaps the sand at kick-off. | island: West beach by the surf shop | flaps up and down / slaps / does a little dance step | a "flip-flop" slap rhythm |
| `surfboard-sid` | Surfboard Sid | uncommon | A surfboard who rides every wave like a winger down the line. | island: The surf shop on the west beach | bends like a wave / tilts / surfs a small wave | a wave swish and a "woo!" |
| `sunhat-sunny` | Sunhat Sunny | uncommon | A sunhat who reminds everyone about shade and water breaks. | island: Sunny beach days and water breaks | brim flops / tips her hat / spins in the breeze | a warm breezy hum and a "pip" |
| `lifeguard-lou` | Lifeguard Lou | rare | A tiny lifeguard tower who watches over every swim. | island: The lifeguard tower on the beach | its flag waves / blows a soft whistle / raises a safety flag | a short whistle and a seagull call |

### Shell Seekers (`gs-northbeach`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `starfish-stella` | Starfish Stella | common | A five-armed starfish who points to every open teammate. | island: Starfish found while beachcombing | curls all five arms in / points one arm / spins like a star | a squishy "blip" and a twinkle |
| `hermit-hank` | Hermit Hank | common | A hermit crab wearing tiny football boots. | island: Hermit crabs on the beachcombing sand | hides in his shell / peeks out / scuttles sideways | a shell "clack" and tiny tip-taps |
| `sand-dollar-dee` | Sand Dollar Dee | common | A flat white sand dollar who rolls like a coin. | island: Empty sand dollars on the beach | gets a tiny crack sound, then is fine / rolls on her edge / flips heads-up | a coin roll and a soft "ting" |
| `conch-connie` | Conch Connie | uncommon | A spiral shell who toots a kick-off horn. | island: The conch shell beach find | toots / echoes / plays a little tune | a breathy horn "toooo" with an echo |
| `seagull-sully` | Seagull Sully | uncommon | A cheeky seagull who heads every high ball. | island: Seagulls along the North Beach | flaps and squawks / ruffles feathers / does a header | a "kyaa" squawk and a flap |
| `sea-glass-gem` | Sea Glass Gem | rare | A smooth green sea-glass pebble who glows in sunlight. | island: Sea glass from beachcombing | glows / clinks / shines a rainbow spot | a glassy clink and a soft shimmer |

### Boots & Kits (`gs-eleven`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `golden-boot-gus` | Golden Boot Gus | common | A shiny boot who laces up for every match. | soccer: Football boots and the top-scorer award | laces wiggle / taps his toe / does a keepy-up | a lace "zip" and a ball "tok" |
| `shin-pad-shay` | Shin Pad Shay | common | A brave shin pad who always keeps legs safe. | soccer: Shin pads keep players safe | bends and pops back / knocks like armour / stands proud | a padded "thump" and a "ready!" beep |
| `glove-frog` | Goalie Glove Frog | common | A frog in big keeper gloves who loves a diving save. | soccer: A goalkeeper’s gloves | ribbits and claps his gloves / leaps / catches a fly ball | a "ribbit" and a glove clap |
| `armband-andi` | Armband Andi | uncommon | A captain’s armband who helps the team speak up. | soccer: The captain’s armband | stretches / says "together!" / glows a bright C | a rubbery stretch and a rally "hup!" |
| `kit-shirt-kip` | Kit Shirt Kip | uncommon | A tiny team shirt who swaps with friends after the match. | soccer: The Kit Shop’s jerseys | waves his sleeves / shows his number / spins to show his back | a fabric flap and a cheer |
| `corner-flag-cora` | Corner Flag Cora | rare | The corner flag of Eleven Park, who waves for every corner kick. | soccer: The 11v11 pitch’s corner flags | bends and springs back / flutters / waves her flag wide | a springy "twang" and a flag flutter |

### Trophies & Legends (`gs-oldtown`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `cup-captain` | Cup Captain | common | A little trophy who loves a team photo. | soccer: A football cup trophy | its handles wiggle / rings like a bell / lifts itself high | a bright trophy "ting" and a crowd "hooray" |
| `medal-milo` | Medal Milo | common | A shiny medal who is proud of every teammate. | soccer: Winners’ and runners-up medals | swings on his ribbon / spins / shines | a medal clink and a ribbon swish |
| `whistle-wyn` | Whistle Wyn | common | A friendly referee’s whistle who keeps the game fair. | soccer: The referee’s whistle | toots / rattles his pea / blows full time | a two-tone whistle toot |
| `scarf-skye` | Scarf Skye | uncommon | A striped supporters’ scarf who sings in the stands. | soccer: Matchday scarves at Old Town Ground | twirls overhead / waves / sings a chant | a soft "la-la-la" hum and a swish |
| `tv-ball-tico` | TV Ball Tico | uncommon | A black-and-white panel ball from long ago, made for TV. | soccer: The 1970 TV-style ball in the Konbini history lesson | spins his panels / bounces / shows black and white panels | an old radio crackle and a bounce |
| `stadium-stan` | Stadium Stan | rare | A tiny stadium whose floodlights blink on at kick-off. | soccer: Old Town Ground and its 7v7 pitch | crowd wave ripples / floodlights blink / plays a kick-off cheer | a stadium roar swell and a whistle |

### Rides & Rollers (`gs-jetty`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `scooter-skip` | Scooter Skip | common | A zippy kick scooter who loves the jetty boards. | island: Scooters from the vending machines | rolls forward and back / dings his bell / does a tail-whip | a wheel whirr and a bell "ding" |
| `bike-bram` | Bike Bram | common | A bicycle who always signals before turning. | island: Island bikes from the vending machines | pedals spin / rings his bell / pops a tiny wheelie | a chain tick-tick and a bell ring |
| `moped-mo` | Moped Mo | common | A little moped who putters around the island roads. | island: Mopeds from the vending machines | putters / beeps / does a lap | a putt-putt engine and a "meep" |
| `jetpack-jo` | Jetpack Jo | uncommon | A jetpack who lifts off for an overhead kick. | island: The jetpack ride | hovers up a little / sputters / zooms a loop | a soft whoosh and a sparkle trail |
| `ferry-fern` | Ferry Fern | uncommon | The island ferry who carries everyone to match day. | island: The ferry and its boarding dock | horn toots / bobs on water / sails in a circle | a deep "boo-oop" horn and wave lapping |
| `lighthouse-lumi` | Lighthouse Lumi | rare | The East Jetty lighthouse who guides boats home at night. | island: The East Jetty lighthouse | lamp sweeps around / blinks / beams a big light | a low foghorn and a soft hum |

### Bug Squad (`gs-cayplaza`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `ladybug-libby` | Ladybug Libby | common | A spotty ladybug in goalie gloves. | island: The island bugs in the Bug book | opens her wing cases / counts her spots / flies a short hop | a tiny buzz and a click |
| `grasshopper-gil` | Grasshopper Gil | common | A full-back grasshopper who jumps into every tackle. | island: Grasshoppers in the Bug book | legs spring / chirps / hops high | a springy chirp-chirp |
| `ant-ace` | Ant Ace | common | A strong little ant who carries the team’s water bottles. | island: Ants in the Bug book | lifts a crumb / waves her antennae / marches in place | a tiny tap-tap march |
| `dragonfly-dax` | Dragonfly Dax | uncommon | A quick midfield dragonfly who changes direction in a blink. | island: Dragonflies in the Bug book | wings buzz / hovers / darts left and right | a fast wing buzz and a zip |
| `firefly-fia` | Firefly Fia | uncommon | A firefly who lights up night matches. | island: Fireflies in the Bug book | glows brighter / blinks / flashes a little pattern | a soft twinkle chime |
| `monarch-mara` | Monarch Mara | rare | A butterfly captain with orange wings. | island: The monarch butterfly in the Bug book | wings fold together / flutters / opens her wings wide | a light flutter and a high glissando |

### Reef Friends (`gs-sharks`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `reef-shark-remi` | Reef Shark Remi | common | A friendly reef shark who only chases footballs. | island: Sharks Beach and its reef sharks | swishes his tail / grins / circles once | an underwater "bwomm" and bubbles |
| `clownfish-coco` | Clownfish Coco | common | A stripy clownfish who hides in the anemone between plays. | island: Reef fish around Coral Cay | wiggles / blows bubbles / darts into a hiding spot | a bubbly "blip-blop" |
| `octo-otto` | Octo Otto | common | An octopus who can juggle eight balls at once. | island: Octopuses on the reef dives | curls his arms / squirts a tiny ink puff / juggles four balls | a squelchy "bloop" and a pop |
| `manta-maya` | Manta Maya | uncommon | A gentle manta ray who glides like a long pass. | island: The manta rays that loop by the reef | flaps her wings / glides / does a slow loop | a long low whoosh |
| `turtle-tali` | Turtle Tali | uncommon | A sea turtle who takes her time and never panics. | island: Sea turtles near the Turtle Sandbar | tucks into her shell / blinks slowly / paddles | a slow "plip-plop" paddle |
| `whale-wendell` | Whale Wendell | rare | A big gentle whale who sings the island to sleep. | island: The whales off the island coast | spouts water / hums / sings a whale song | a deep rising whale call and a spout hiss |

### Summit Orchard (`gs-summit`)

| Toy id | Name | Rarity | Personality | Link | Squeeze / poke / tap head | Sound recipe |
|---|---|---|---|---|---|---|
| `mango-max` | Mango Max | common | A ripe mango who never stops running. | island: The Summit Isle fruit trees | squishes juicy / wobbles / rolls downhill a little | a juicy "splorp" and a bounce |
| `papaya-pia` | Papaya Pia | common | A papaya who shares her seeds like assists. | island: Summit Isle papaya trees | opens to show seeds / giggles / spins | a soft "pop" and seeds rattling |
| `avo-kicker` | Avo Kicker | common | An avocado who kicks with his round seed. | island: Summit Isle avocado trees | his seed pops out and back / rocks / does a bicycle kick | a hollow "tunk" and a whoosh |
| `orange-orbit` | Orange Orbit | uncommon | A round orange who curls shots around the wall. | island: Summit Isle orange trees | squirts a zesty mist / spins / curls through the air | a zesty spray hiss and a "wheee" |
| `cairn-carl` | Cairn Carl | uncommon | A stack of stones from the lookout who never topples. | island: The summit lookout’s flag and cairn | stones wobble but stay / clacks / his flag waves on top | stone clacks and a breezy whistle |
| `summit-goal-gigi` | Summit Goal Gigi | rare | The little goal from the Summit 5s, the highest pitch on the island. | soccer: The Summit 5s pitch on top of the mountain | net ripples / posts ping / a ball flies into her net | a net swish and a post "ping" echo |
