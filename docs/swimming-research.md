# Swimming, wading, splash-downs, sea rides and diving spots: research and design

Written 15 Oct 2026. This is research and design only. No source file was changed and nothing was committed. Another agent is editing `lib/town/fishing/*` and `components/Fishing*` (removing the derby, weather and records, and building a new reel). Those files were read but not written, and the line numbers cited from them may move.

User request (15 Oct 2026, verbatim):

> "take a look at ability to walk near the shore, swim, and land in water. have animations for that. animations for dropping and splashing into the water. while in the water change the actions that fits with that. key thing with all of this is to reduce heat. Add animation for landing near sharks they circle you and character says oh crap. landing on a whale sharks and rays allows you to hang on to them for a ride. also look into actions for diving and swimming in the water. how we can make do this without making the phone heat up. this will be special diving spots. which will allow us to expand this world"

Constraints every proposal below was checked against:
- **AGENTS.md:** every feature teaches football. Mobile heat is a primary requirement. Prefer bounded work, shared assets and sleeping content. Never claim iPhone cooling from desktop emulation.
- **`docs/performance-guide.md`:** the approved phone defaults (DPR 1.5, 1024² shadows, MSAA, 30 fps), the thermal tiers 0–4, the "Experiments not to repeat" table, the water rules ("Water ripples animate offsets of a prebuilt repeating texture…"), "no new loops, timers or audio", and offscreen posing skipped.
- **`docs/flight-performance-2026-09-14.md`:** phones are GPU-bound in flight, and shadows dominate the measured GPU time, more than particles.
- **Kid safety** (`docs/fishing.md`, `docs/card-rewards.md`): players are 7 to 12. Nothing is ever lost, there are no odds, and there are no clickable links. Facts are labelled **Real football fact** with a plain-text credit, and island fiction is labelled separately.

---

## 1. What the island does today at the water's edge (survey)

### 1.1 Land vs water

- **There is one land test:** `onLand(x,z)` in `lib/town/landmass.ts:10` is `onIsland || onFerryBoarding || onCayLand || onLandableDeck || onSummitLand`.
- **Distance to land:** `distanceToLand(x,z)` (`landmass.ts:12-14`) is analytic. It is 0 on land, otherwise the minimum of the per-landmass distances.
  - The main island's `distanceToShore` is a brute-force pass over the 160-point Catmull-Rom `ISLAND_SHORE` (`lib/town/shoreline.ts:10, :27`).
  - Coral Cay has `distanceToCayLand` (`coralCay.ts:148`), and Summit Isle has `distanceToSummitLand` (`summitIsle.ts:238`).
  - A call costs about 30 µs (`rooftopTravel.ts:162` comment).
- **Walking:** `simulation.ts:48` `blocked` and `:56` `groundBlocked`. Summit ground (`onSummitGround`, `summitIsle.ts:231`) is walkable at any slope, but landing needs `onSummitLand` (`:236`, slope ≤ 0.62).
- **Flight:** `flightBlocked` (`simulation.ts:22`) is only the `FLIGHT_BOUNDS` rectangle with 60 m rounded corners, so **the whole sea is flyable**.
- **Water level:** the ocean plane sits at **y = −0.43** (`lib/town/world.ts:132`, `ballSea.ts:11` `SEA_LEVEL`, `walkBall.ts:34`, and `WATER` in `caySharks.ts:13`, `cayMantas.ts:26`, `whaleShark.ts:20`). The shore bake uses −0.42 (`islandShore.ts:5`).
- **There is no real seabed under the open sea.**
  - The main beach's sand ribbon slopes from −0.125 at the outline to −0.5 at 1.4 m offshore (`fields.ts:80-83`, `SKIRT=1.4`).
  - The cay and sandbar skirts slope to −0.47 (`coralCayWorld.ts:253-268`).
  - Past that there is only the opaque ocean plane. The turquoise-to-teal "depth" is painted by the shore field's distance channel.
  - `fieldSurfaceHeight` (`venues.ts:60`) returns **0** over open sea, not a depth.
- **The shore field is GPU-only at run time.** `islandShore.ts` bakes `sdf`, `vis` and `lift` as Float32 CPU arrays at 1 m. They are locals of `bake()` (`:230-234`) and are dropped afterwards.
  - What survives is a 518×313 RGBA half-float `DataTexture`: 2 m texels, origin (−156, −322). R holds the drawn-waterline distance.
  - No CPU sampler exists.
  - So **the only cheap runtime depth source is the analytic `distanceToLand`**, mapped through a virtual seabed slope (§2.1).

### 1.2 Walking into the sea, and arriving from the air

- **Walking:** `Town.tsx:874` → `rooftopTravel.ts:108` → `stepPlayer(...)` (`simulation.ts:153`). The coast is not an obstacle, so `contactNormal` returns null (`:96-103`).
  - The axis-separated step zeroes the blocked axis (`:185-186`). **The walker stops at the polygon and slides along it.**
  - The only feedback is `sound.boundary()` (`Town.tsx:864`, throttled to 0.7 s at `islandSound.ts:226`).
  - Rides stop at the coast too.
  - The Deep Sea Boat's deck edge works the same way (`docs/fishing.md`, "the existing water rule stops you at the deck's edge").
- **Jetpack landing:**
  - `findLanding` (`rooftopTravel.ts:166`) searches rings or an aimed arc of `canLand`, so **it always returns land**.
  - It is called at `Town.tsx:718, 775, 792, 1174`, and by the landing marker (`:1177`). Every touchdown is re-validated (`:787`, `:799`).
- **Parachute:** the target comes from `findLanding`, re-aimed on a timer (`jetpackActions.ts:53-95`).
- **Cut parachute or fall over the sea:**
  - The player falls to `floor` (0 over the sea), then is **teleported** to `findLanding` with `crashed:true`, which plays the crater effect and `ROOF_RECOVERY_TIME` 4.2 s (`jetpackActions.ts:47-51`, `Town.tsx:788`).
  - If no land is found the player hovers at floor + 0.5 (`:49`).
  - **So today, dropping toward the sea ends with an invisible teleport to the nearest beach.**
- **Rooftop gap jumps and launches** require `q.canLand` (`rooftopJump.ts:121, :159`).
- **Ride ramps** are stopped by `blocked` at a coast (`rideRamps.ts:51`).
- **Knockdown** (`lib/graphics/knockdown.ts:49`) only keeps the body on the floor.
- **The zipline** ends on the hostel roof (`lib/graphics/zipline.ts:402`). **The ball cannon** teleports you into its seat and back out (`Town.tsx:624`). **The roundabout** is road geometry only (`coralCay.ts:328-330`). None of them can put the player in water.
- **The ball does reach the sea.** `ballGround` returns `'land'|'sea'|'edge'` (`ballSea.ts:14`). At sea the ball clamps to −0.33, its speed drops to ×0.12, it floats, bobs and drifts, then recalls after 2.1 s (`walkBall.ts:141-145, :161-162`).
  - Its splash is `ballEffects.splash`, two pooled rings (`lib/graphics/ballEffects.ts:17`, `Town.tsx:932`), plus `OUT_OF_PLAY_NOTE` (`ballSea.ts:21`).
- **Nothing swims, wades or splashes.** A grep for swim, wade, splash, underwater and dive across `lib/` and `components/` finds only keeper dives, NPC text, manta loops and ball or cannon splashes.

### 1.3 The rig

- `PlayerMotion` is at `lib/graphics/player.ts:26-124`. The poses relevant here:
  - keeper `dive` (:105-142, posed from :555)
  - `jump` (:712)
  - jetpack free flight (:1580-1630)
  - `parachute` (:1633)
  - `zipline` (`poseZipBody`/`poseZipArms` at :777/:788, applied at :1660/:1711)
  - `rooftopPose:'hang'|'fall'|'dizzy'` (:1661)
  - `wallSplat` (:1687)
  - `trick` sit/lie/bow (:1752)
  - `mopedSuperman`: a prone, arms-forward pose, the nearest existing shape to a front crawl or a ray ride
- **Root and feet:** `update` sets `root.position.set(x,0,z)` (`:1805`), then Town sets `player.root.position.y=groundY` (`Town.tsx:1099`). The pelvis rests at 0.88 (`:341`), and the feet are placed relative to the root (`:1288`).
- **The bean skin** (`beanSkin.ts:8-26`) is 4 shared instanced meshes driven by hidden joints plus one data row. Any new pose written to the joints is drawn for free. `beanGearFit.ts` mirrors the shell for gear (`RIDE_POSE` :61, `FLIGHT_TORSO_REST` :80).
- **Body-mechanics contract** (`docs/body-mechanics/BODY_MECHANICS.md`): no new animation loops, no per-frame scene queries, offscreen posing stays skipped, instancing and rigid-part merging stay intact, and reduced motion stays calm.

### 1.4 Sea life that already exists (the sharks, whale shark and rays the user means)

| Animal | Where | Build | Draws / triangles | Sleep |
| --- | --- | --- | --- | --- |
| **Sharks**, 6 causeway + 3 Summit | `SHARK_LOOPS` `coralCay.ts:281-284`; `SUMMIT_SHARK_LOOPS` `summitSeaLife.ts:20-24` | `lib/graphics/caySharks.ts`: ONE instanced fin + tail-tip mesh and ONE translucent top-view body silhouette per region. Arc-length loop following with sway (`:66-80`); the body shows "shallow" now and then. | 2 per region in view | drawn < 220 m, moved < 140 m and on screen; frozen at dt 0 or static ambience; Summit count thins by tier (`summitSeaLifeCounts`) |
| **Manta rays**, 7 loops desktop, 6 phone | `MANTA_LOOPS` `mantaLoops.ts:62-71` | `lib/graphics/cayMantas.ts`: 92-triangle manta, wing wave in the vertex shader (`WING_WAVE` :60), one instanced dark silhouette per island, plus a **1-instance opaque "surfacing" mesh** for a breach or wingtip (≤ 3.2 s, every 22–50 s) | +1 draw per island, +92–460 tris | same rules (`:141-154`) |
| **Whale shark**, 1 | `WHALE_SHARK_LOOP` `summitSeaLife.ts:29` (off Summit Isle's west coast, 42–58 m out, 0.9 m/s) | `lib/graphics/whaleShark.ts`: ONE mesh of ~260 tris, top half only. The pattern is a fragment-shader term and the tail sweep a vertex term. Drawn as a flat silhouette (scale y 0.04, `MeshBasicMaterial` opacity 0.36, `:94-95`). | 1 | hidden > 260 m, moved < 140 m and on screen |

- **Wiring:** `world.ts:1636-1641`, updated every frame by `updateCoralCay` (`world.ts:1708`) from `Town.tsx:1332` with `world.updateSharks(active&&!learning?dt:0, reduced||heat.staticAmbience, camera, location)`.
- **Sharks Beach** (`coralCay.ts:266-271`) has a sign and a "BLUE SHARKS = CAPE VERDE" board (`coralCayWorld.ts:540-541`), but **its own bay has no shark patrol**. The sharks patrol the causeway.
- **Fishing models** (`lib/town/fishing/fishModels.ts`) cover 64 species with procedural, flat-shaded geometry of 150–1,412 triangles each.
  - That includes 22 sharks (generic `shark()` :213-231; `whale-shark` :461-466 with spots and stripe tubes), `ray()` for the stingray and cownose ray (:307-322), and an 8-arm octopus.
  - There are **no bones**. The tail wag is one vertex-shader term (`fishingVisuals.ts:86-100`) driven by per-species `anim`.
  - They are **not instanced**: the visuals swap geometry on 3 plain meshes. `speciesModel(id)` (:600) caches one geometry per species.
  - Riders attach by **mesh transform plus an offset**. The wag is near zero at the head, so a rider near the head does not need to follow the bend.
- **Fish schools** (`fishSchools.ts`):
  - ONE instanced draw for fish, crabs, rays, turtles and their shadows. 33 instances on desktop, 24 on phones.
  - Steering runs at 10 Hz (`STEER_DT=.1`, :31).
  - There is a scatter impulse (:338).
  - The only orbit is deep mode's bait ball (:263-274). **There is no general "circle a target" behaviour.**
- **The catalog:** the whale shark is a **catchable Legendary at South Pier** (`fishSpecials.ts:53-54`, Elmina Sharks FC). So are the stingray (west-pier) and cownose ray (west-cove). **Mantas are not catchable** and appear only in the world.

### 1.5 Underwater rendering today

- **No camera ever goes under the surface.** The "see-through" water seen while fishing works like this:
  - the shore strip's shader follows the view ray to a virtual seabed (`shoreWater.ts:148-155`, one closed-form step per vertex);
  - the island ocean stops writing depth and draws late (`createOceanClear`, `underwater.ts:188-203`);
  - everything below tints itself by depth through `patchUnderwater` (`underwater.ts:145`);
  - there is no `THREE.Fog`.
- **The Deep Sea Boat's deep look** (`deepSeaScene.ts:82`) is ONE merged additive mesh: light shafts, plankton and 2 jellyfish, all moved in the vertex shader. Its `frame` is one uniform write.
- **Measured cost while fishing** (`docs/performance-guide.md`, "Fishing polish" and "Fishing backdrop"):
  - Deep Sea Boat on the phone profile: 57 draws, 79k triangles, render CPU 2.65 ms, GPU about 1.9 ms.
  - Reef spots: 73–124 draws.
- **`WATER_UNIFORMS`** (`waterSurface.ts:27-36`): `uWaterDetail` is 2 on desktop, 1 on phones, and 0 on the still path (reduced motion, static ambience at tiers 3–4, or governor "slow"). It is set at `Town.tsx:1330`.
- **The splash pool** lives in `fishingOverlay.ts:83`: ONE `InstancedMesh` of quads with `RINGS=7, DROPS=18, BUBBLES=8, MARKS=4`, plus `ring()`, `burst()` and `drip()`. **It is session-scoped and owned by fishing** (being edited now).
- **`fishingLife(tier, reduced, detail)`** (`fishingLife.ts:14-17`) turns off decorative particles at tier ≥ 2, with reduced motion, or at detail 0. Gameplay rings are never gated. This is the gate to copy.
- **Focus mode** (`focusMode.ts:36`, `enter(x,z,useBackdrop)`) is generic.
  - The easel already reuses it without the backdrop (`Town.tsx:974-985`).
  - It holds far matches, traffic and townsfolk still, and draws far cells as the one-draw-per-region backdrop.

### 1.6 Heat machinery

- **Tiers** (`heatTier.ts:22-28`; the guide's table still lists four, but the code has five):

| Tier | Settings |
| --- | --- |
| 0 | phones 30 fps, DPR 1.5, 1024² |
| 1 | DPR 1.5, 1024² |
| 2 | DPR 1.25 |
| 3 | + `staticAmbience` |
| 4 | + 24 fps |

- Battery saver forces the lowest tier (`setBatterySaver`, `:101`). `islandHeat.ts` exposes `staticAmbience`, `setFocus`, `hold(on)` and the `?heat=1` readout.
- **20 fps caps:**
  - `idleRide.ts:13-16`: 20 fps after 4 s of no input or travel, **on rides and the jetpack only, never while walking**.
  - The easel when seated (`paintEasel.ts:191-192`, `Town.tsx:966`).
  - The shop's NPC-only mode.
  - **Correction to the brief:** fishing has **no** 20 fps cap today, only focus mode plus the normal 30 fps or tier cap. `docs/fishing.md` "Heat" just points to the performance guide.
- **`renderStats`** = `{rendered, skipped, sleeps, idleRide}` (`Town.tsx:642`, a getter on `window.__fi2` at :626).
- **Tests:**
  - `tests/heat-*.cjs` (idle, pass3–6, render, tiers) mix source-regex asserts against Town.tsx with vm-transpiled runtime checks.
  - `tests/idle-ride.cjs` is the model for a cap test.
  - `scripts/check-fishing-browser.cjs` is the Playwright model for a phone flow.

### 1.7 Voice, sound and the HUD

- **Speech:** there are **no speech bubbles and no exclamations**. Falls are wordless: a `surprised → beaten → happy` face (`knockdown.ts:56-69`) and `sound.fall()`.
  - On-screen lines today are `role="status"` notes and toasts: the zipline note, the cannon cheer, `OUT_OF_PLAY_NOTE` and the fishing lesson toast.
  - NPC chat is text only (`NpcConversation.tsx`).
  - Kokoro voices exist only for coaches, lessons and stories (`useLessonVoice.ts:6`, `public/voice/*`).
- **Sound:** everything in `islandSound.ts` is synthesized with `tone()` and `hiss()` (`:104-116`), with document-event cue families `fi2-job-cue`, `fi2-vending-cue` and `fi2-story-cue`.
  - There is **no splash cue**. Fishing reuses `undock` as its plop and `swipe` + `swish` for a plunge (`fishingStore.ts:33-43`).
  - There are **no music stings**. There is one music track.
  - The shared AudioContext suspends 2 s after silence.
- **HUD actions** (`Town.tsx:1507`): three slots, `.touch-shoot`, `.touch-juggle` and `.travel-mode`. Context swaps go through `actionCluster = zipRiding ? ZIP_BUTTONS : jobButtons` (`:327`) and render `JobActionButton.tsx` (tap or hold). Fishing and the cannon bring their own HUDs.

---

## 2. Design

### 2.1 Shore walking and entering the water (P0)

**The depth model (no physics, no new bake).**
- `depth(x,z) = min(D_MAX, SHELF·d)`, where `d = distanceToLand(x,z)` and `SHELF ≈ 0.45 m per m`. This is a gentle virtual beach: chest-deep at about 2.7 m out.
- `D_MAX` is 1.6 m, which is "swimming" everywhere past the shelf.
- It uses the same idea as the fishing strip's virtual seabed (`uwDepthAt`, `shoreWater.ts:155`), so what you see roughly agrees with what you feel.
- It is called **only when the walker is within 1 m of the coast or already in the water**:
  - on land, `groundBlocked` already answers, and a coast-probe hit is the trigger;
  - in the water it is called at **10 Hz** (≈ 0.3 ms/s at 30 µs a call), and the 60 Hz step interpolates.
- Optional later: keep the shore bake's 2 m `sdf` as a Float32 array (~650 KB) for an O(1) lookup. This is not needed for P0, and it touches `islandShore.ts`, so it is left out.

**Zones and what the rig does.** The visual cut is free: the opaque ocean plane at −0.43 already hides whatever is under it. So "wading" is simply lowering the root onto the virtual seabed, with no clipping planes, stencils or second render.

| Zone | Depth | Speed (walk 3.7, sprint 6 in `travelModes.ts:4`) | Rig | Effect |
| --- | --- | --- | --- | --- |
| Ankle | 0–0.25 m | ×0.9 | normal walk, knees a little higher | small ripple ring every other step |
| Knee | 0.25–0.6 m | ×0.7, no sprint | high-knee wade: knee lift +, shorter stride, arms out a little | ring per step |
| Waist | 0.6–1.0 m | ×0.5 | push-through: torso lean 10°, arms sweep the surface | one slow ring trailing the hips |
| Swim | > 1.0 m (chest) | swim 1.8, fast crawl 2.6 | swim pose set (§2.3) | wake ring every stroke |

- **Root height:**
  - `groundY = −0.12 − depth` while wading (feet on the virtual seabed);
  - swimming: `groundY = −0.43 − 0.95` (pelvis 0.88 below the shoulders), so the head and shoulders ride just above the surface.
  - Blend 0.25 s between zones, never a pop.
- **Ripples:** one new tiny pool (§2.7: `swimFx.ts`), with rings at y −0.42 where the body crosses the surface plane. On the still path the rings are drawn once and do not grow.
- **Walking out:** the same zones in reverse. Leaving the swim zone into the knee zone switches back to the wade pose; at depth 0, normal walking resumes. The player gets a 0.6 s "drip" of 3 drops (decorative, so gated like `fishingLife`).
- **Rides:** scooter, bike, moped and truck still stop at the waterline as today (decision 11). The jetpack can take off from the water (§2.3).
- **Swim zone:** up to **60 m from land**. Past it, a gentle current eases you back (the stick's outward component is scaled toward 0). The **Back to shore** button auto-swims to `findLanding`'s nearest beach. `flightBlocked` still bounds everything.

### 2.2 Landing in water from height (P0)

**What changes.** Today every arrival is moved onto land (§1.2). Proposed rules:
- **Cut parachute or a fall over open sea within the swim zone:** splash down where you are, instead of `crashed:true` plus a teleport.
- **Jetpack "switch to walk" over the sea:** `findLanding` is still tried first within its normal ring. If the hover is over open sea deeper than knee depth, offer splash-down (the travel button reads **Drop in**) instead of hopping to the beach.
- **Guided landings, landing markers and aimed parachute targets** stay land-first (decision 4).
- **Rooftop launches** may end in the sea only from beach-front decks where the arc's end is ≥ 1.5 m deep (`planRoofLaunch` gets a `canSplash` alternative to `canLand`). P0 can skip this.

**The sequence:**
1. **Drop.** Parabolic, reusing the existing fall pose (`rooftopPose:'fall'`).
2. **Entry.** Choose an entry style from the pitch at impact:
   - **Clean dive:** the head is down within 35° of vertical, as from a jetpack dive or a high launch. Arms go together over the head, the body is a straight line, and the entry gives a narrow splash.
   - **Belly-flop:** a flat body, as from a cut parachute or a low fall. Arms and legs spread, the splash is wide, and there is a comic "slap" sound and a dazed face for 0.4 s (the `knockdown.ts` face set). **No damage and no recovery lockout.** The existing `ROOF_RECOVERY_TIME` 4.2 s is not used in water.
   - **Feet first** (from wading height or a short drop): the default.
3. **Splash.** In the `swimFx` pool:
   - 2 rings (inner fast, outer slow);
   - a spray of 8 drops on phones and 14 on desktop, in one parabola each;
   - entry size scales with fall height, capped.
4. **Dip.** The root sinks to −0.43 − 1.6 over 0.35 s and rises back over 0.5 s, with 4–6 bubble quads rising.
   - The opaque sea hides the body during the dip. That is the point: "under" for 0.6 s without an underwater render.
5. **Surface.** A head-shake (a neck yaw wobble) and a small ring. The state goes to treading water.
6. **Camera.**
   - The follow camera's target height eases down 1.2 m and back with the dip (an eased offset on the existing target, so no new camera).
   - A belly-flop adds a 120 ms shake of at most 0.08 m.
   - **The camera never goes under the plane.** Clamp the eye to ≥ −0.2 so the opaque ocean never shows its underside.
7. **The "under" moment.** A full-screen DOM tint (aqua, opacity 0 → 0.35 → 0) for 450 ms, on the compositor (opacity only), as one element.
   - **No `backdrop-filter`.** That is `tests/heat-pass3.cjs`'s rule over a moving canvas.

**Reduced motion:** no camera dip and no shake. The splash is one static ring that fades. The dip is replaced by a 0.3 s cross-fade to treading water. There is no tint flash, and the sound stays.

**Sound:** new synthesized cues `splash(size)` (a noise burst plus a falling tone), `slap` (belly-flop) and `bloop` (surface), added to `islandSound.ts` the way the job cues are. There is no new AudioContext and no audio files.

### 2.3 Swimming (P0)

**Pose set.** A new `lib/graphics/swimPose.ts`, applied from one optional `PlayerMotion.swim` field. It follows the `poseZipBody`/`poseZipArms` pattern: keyframe tables are module constants, there are no allocations, and offscreen posing stays skipped.

| Pose | When | Shape |
| --- | --- | --- |
| **Tread** (idle) | stick released | upright, slow eggbeater legs, sculling hands at the surface, head up; bob ±4 cm on the swim phase |
| **Breaststroke** (slow) | stick < 60 % | head up, kid-readable, frog kick; the "look around" stroke |
| **Front crawl** | stick ≥ 60 % or the Swim fast hold | prone (from `mopedSuperman`'s prone frame), alternating arm recovery over the surface, flutter kick, head turns to breathe every 3rd stroke |
| **Turn** | heading change > 40° | the existing `turnSmoothing` with a roll into the turn |
| **Duck-dive** | Dive tap | pike at the hips, legs up, slide under for 1.2 s, surface (as §2.2's dip) |
| **Float** | Float tap | on the back, star shape, slow drift; the "rest" pose |
| **Climb out** | at knee depth | wade pose; on a deck edge, a hands-on-deck pull-up (the `rooftopPose:'hang'` arms) |

- **Speeds:** breaststroke 1.2 m/s, crawl 1.8, **Swim fast** (hold) 2.6. Acceleration is 3 and braking 2 (water carries momentum).
- **Joystick mapping:** the same stick with the same camera-relative mapping. The body faces the travel direction after a 0.3 s turn.
- **Sim:** `stepPlayer(... mode='swim')` with its own `TRAVEL_MODES` entry. The coast test is inverted: open water is allowed and land past knee depth ends the swim.

**HUD in the water** (the three existing slots, through the `actionCluster` mechanism, `Town.tsx:327`, with a new `SWIM_BUTTONS` like `ZIP_BUTTONS`):

| Slot | On land | In the water | Near a rideable animal | Riding |
| --- | --- | --- | --- | --- |
| `.touch-shoot` (Kick) | Shoot | **Swim fast** (hold) / **Dive** at a dive spot | **Hold on** | **Let go** (jump off) |
| `.touch-juggle` | Juggle | **Float** (toggle) | Float | Wave |
| `.travel-mode` | Ride | **Back to shore** (auto-swim); with the jetpack equipped, **Fly out** (takeoff from the water, using the existing takeoff) | same | — |

- **Disabled in the water:** kicking and juggling, rides other than the jetpack, ball actions, NPC hit reactions and field collision (no pitches in the sea).
- **The ball (recommended):** it **stays on the sand**. When you enter swim depth, the walking ball is parked at the last dry point (it already "recalls"), and it is waiting when you climb out. This costs nothing while swimming: the ball's charge and trail already sleep when hidden, as in flight.
  - The alternative is a floating ball you can nudge with a header while swimming ("head it to the beach"). It is fun but adds ball physics in the water. It is decision 3.

**Idle heat win:** treading water or floating with no input for 4 s goes to **20 fps**, as with idle rides. `idleRide.ts`'s `interval(now, riding)` is called with `riding || swimmingIdle`. Walking is still never capped.

### 2.4 Diving at special diving spots (P2)

**Spots on the island:** a red-and-white dive flag on an orange buoy, in ONE instanced draw for all buoys, with no shadows, hidden beyond 220 m like the sharks. Swim within 3 m and the shoot slot reads **Dive**.

**The underwater "room":** a small, sealed, separate scene. This is not a camera under the island ocean.
- **Island off:** while you dive, the island render is **skipped entirely**, the way paused menus park it. The island simulation holds like focus mode.
  - The renderer draws only the room scene.
  - Island draws go to 0. The ocean, shore strip and shadows are not rendered.
- **Room budget:**
  - ≤ 15 draws and ≤ 20k triangles on phones.
  - **No shadow map** (blob decals instead), one hemisphere light plus one directional, `THREE.Fog` (a cheap per-fragment linear term) at 8–22 m, and no reflections or refraction.
  - Bounded by a dark-blue fog wall and a sloping seabed, so there are no far views.
  - Pieces:
    - seabed: one merged vertex-coloured mesh, built like `underwater.ts`'s seabed (coral, rock and sand from the spot's reef theme);
    - sea life: one instanced draw (a copy of the `fishSchools` pattern, or a new `diveLife.ts` that imports the stable `speciesModel()` read-only for 2–4 hero species);
    - light shafts and plankton: one additive draw (a copy of the `deepSeaScene.ts` pattern);
    - the relic and the plaque: one merged mesh;
    - the player rig, with a swim-under pose;
    - one bubble pool.
- **Frame rate:** 30 fps while swimming in the room, **20 fps after 4 s without input** (the idle rule), and the tier caps on top.
- **Entering and leaving:** a 0.4 s DOM fade. The island is not unloaded, so leaving is instant and puts you back at the buoy, treading water.
- **The alternative** is a document boundary like the Konbini (`/dive?spot=...`). The Konbini measured 11 draws and 0 island frames, but the page navigation costs load time and breaks the "dive from where you are" moment. It is decision 5.

**What you find (per spot):**
- **Reef fish** from the catalog. They swim; they are not caught (the catch stays a fishing thing).
- **A relic** (for example a sunken goal frame, an old leather ball, a ship's bell with a club crest).
- **A fact plaque** (the spot's **Real football fact**, with a plain-text credit).
- **A hidden ball** for the ball hunt. It is found once and counts like a collected ball.
- The Fishbook could later add a "Seen while diving" tick: a seen-not-caught tick, so no coins.

**Breath meter = pace lesson.**
- One breath lasts **45 s**, shown as a ring around the HUD's Dive button. It updates on island frames, and its CSS variable is written at most 10 times a second.
- Swimming fast drains it 2× and gliding slowly 0.6×. This is the lesson that **pace is a resource**: a midfielder who sprints everywhere has nothing left at the end.
- A short "kick-glide" rhythm (tap, then glide) is the most efficient.
- At 20 % a calm cue says "Time to head up". At 0 you **float up automatically** with "Good dive!". **Nothing is lost** and there is no fail state.
- Copy: "Swim smooth and steady, like pacing a match: sprint when it matters, glide when it doesn't." This is a coaching metaphor, labelled as one.

**Candidate diving spots (expansion surface).** Each reuses a fact **already verified in the repo** (`docs/fishing.md` tables). New facts would follow the polite-fetch verification rules. Positions must be checked against the shark, manta and whale-shark loops and the fishing floats, as `tests/summit-sealife.cjs` does.

| # | Spot (island fiction) | Where (near) | What you find | Football lesson | Real football fact (already verified) |
| --- | --- | --- | --- | --- | --- |
| 1 | **Coral Garden Reef** (starter, shallow) | off Coral Garden Beach (514.8, −226.5), seaward of the float | tangs, clownfish, a hidden ball | **Scanning**: reef fish check all around before they move; look over your shoulder before you receive | Squid ink ↔ the **vanishing spray**, first used at a World Cup in 2014 (`deepSeaFish.ts`, Wikipedia) |
| 2 | **The Sunken Goal** | Channel Bend (359.2, −176.1), the deepest water between the islands | an old wooden goal frame with a barnacled crossbar | **Law 1**: the goal is 7.32 m wide and 2.44 m high (8 yd × 8 ft). *New fact: verify against IFAB Laws of the Game before shipping* | (new; see the left column) |
| 3 | **Shark Shelf** | Sharks Beach bay (697, −200) (decision 7: give the bay its own patrol) | sharks circling at a distance (§2.5), a "BLUE SHARKS" crest | **Keep your head up under pressure, find the open side** | **Cape Verde, the "Tubarões Azuis" (Blue Sharks)**, first match 19 April 1978 v Guinea (Wikipedia; already on the Sharks Beach board) |
| 4 | **Lantern Deep** | under the Deep Sea Boat (335, −5); a dark room with glowing lanternfish | lanternfish lights, an old floodlight bulb relic | **Playing under the lights** | **Bramall Lane**, the first floodlit match, Sheffield, 14 Oct 1878, over 20,000 people (Wikipedia) |
| 5 | **Giant's Bay** | the whale shark's loop off Summit Isle's west coast | the whale shark gliding overhead, remoras | **Patience in possession**: a big, calm player who keeps the ball | **Elmina Sharks FC**, from Ghana's coast, began as Coconut Grove Sharks (Wikipedia) |
| 6 | **Paul's Grotto** | North Beach Rocks (60, −238) | an octopus den, an old prediction box | **Reading the game** (and that luck is not skill) | **Paul the Octopus** picked 8 out of 8 at the 2010 World Cup (Wikipedia) |

### 2.5 Sharks circle you (P1)

**Trigger:**
- swimming, splashing down, or riding within **14 m of a shark fin's current position** (a region already awake and on screen);
- at most once per 40 s per region, and never inside a dive room;
- swim-zone only: sharks loop 9–22 m off the causeway banks, so a kid who swims out or drops in from a jetpack meets them.

**Behaviour** (a new pure `sharkAttention.ts` plus a small `attend()` API on `caySharks.ts`):
- The 1–2 nearest sharks in that region leave their loop on a smooth arc and **orbit the player** at radius 4.5 → 3.5 m, at 2.2 m/s, in opposite directions if there are two.
- The fins cut the water and the body silhouette shows "shallow". These are the same instanced meshes: **0 new draws**, and at most 2 extra matrix composes per frame (the region already uploads its instance matrix every awake frame).
- **The character's line**, shown as a speech bubble over the head for 2.2 s: **"Oh crap!"**, the user's wording and the default as asked.
  - A kid-safe alternative is listed as decision 1: **"Uh oh!"** (or "Yikes!").
  - The face is `surprised`, then a nervous grin.
- **Sting:** a two-note synthesized "da-dum" (a low tone, a semitone up, repeated twice with an accelerando), ≤ 2.5 s, through the shared context. Music ducks 50 % for 2 s.
- **Football cue** (toast, once per session): "Defenders are closing in! Keep your head up and swim to the open side." **Swimming away from the circle's open gap** (the side with no fin within 90°) ends it faster.
- **Resolution, never harm:**
  - the sharks lose interest after **8 s**, or 3 s after you leave a 10 m radius, or as soon as you climb out or take off;
  - they return to their loops along a blended arc;
  - there is no health, no damage, no knockback, and no bite animation;
  - kid-readable copy follows the Nia/NOAA tone already used for mantas: "These sharks are just curious."
- **Reduced motion and static ambience:** the sharks hold their places as they do today. Still show the bubble and the toast; skip the sting's accelerando.

**The speech bubble** (new, reusable): one absolutely positioned DOM element.
- Its transform is written on island frames only while it is visible (≤ 2.5 s), using the projected head point. That is the same pattern as prompt tracking, rounded to half pixels.
- It is removed afterwards: no running animation and no React re-render per frame.
- It doubles as the hook for future character lines (for example "Whoa!" on a belly-flop).

### 2.6 Riding a whale shark or a ray (P1)

**What can be ridden:**
- **The Summit whale shark:** its `WHALE_SHARK_LOOP` already exists, and its back is about 0.6 m above its waterline (`STATIONS`, `whaleShark.ts:23`).
- **Manta rays**, on their existing loops.
- **Never stingrays or sharks:** stingrays have a barb, and sharks are the "circle you" event. The manta's "no stinging barb" fact is already Nia's topic.

**Mount:**
- Swim within 3 m of the animal's head or back, or land from the air within 4 m of it (splash-down with a "grab"). The shoot slot reads **Hold on**.
- On press, the rig attaches to the animal's **track transform**: the CPU already computes the position and yaw on its loop each frame, plus a fixed offset. There are **no bones**:
  - whale shark: the offset is the back at station x≈2.2, just behind the head, where the tail-sweep vertex term is near zero;
  - manta: the centre of the disc.
- **Pose:** prone and holding on, built from `mopedSuperman`'s prone frame with the hands forward and gripping, the legs trailing, and a small wave on the Wave button.

**While riding:**
- The whale shark swaps its silhouette material for an **opaque lit material on the same geometry** (scale y 1, not 0.04), so its back reads as a body you sit on. +0 draws: it is the same mesh with a material swap.
- A manta uses its **existing 1-instance surfacing mesh** (`cayMantas.ts`), held "surfaced" for the ride, and its silhouette instance is skipped.
- The animal speeds up from 0.9 to 1.6 m/s along its own loop. It is not steerable in P1 (decision 10); the loop is the ride.
- The follow camera uses the existing ride follow, offset 6 m behind and 3 m up, with a slow yaw ease.
- **Idle rule:** a ride is travel (> 0.35 m/s), so it stays at 30 fps. That is correct, because the scene moves.

**Dismount:** **Let go** gives a small hop and a feet-first splash (§2.2), and you tread water. Taking off with the jetpack also works.
- An auto-dismount happens if the loop would carry you past 60 m from land, or after one lap (≈ 90 s for the whale shark). The line is "Thanks for the ride!" in a bubble.
- **Hold-on lesson** (toast): "Hold on like a keeper holding a catch", reusing fishing's `PULL_HINT` wording. Toast copy is not a file edit. The metaphor is already taught there.

**Coexisting with the catalog (recommendation): friendly giants are separate from the catch.**
- The world animals (the causeway and Summit sharks, the mantas, the Summit whale shark) are **"island friends"**. They are never hooked and never cost or pay coins.
- The fishing catalog keeps its species as they are, including the whale shark Legendary at South Pier.
- A kid can tell them apart because the friends have names:
  - the whale shark is **"Big Gentle"**;
  - the mantas get names from Nia;
  - the speech and Fishbook copy say "a wild whale shark you can't catch".
- Decision 2 asks whether to make the catalog's whale shark catch-and-release (as the fishing research's C1 legends are), so the same animal is never both sold and ridden.

### 2.7 Heat budget (the key constraint)

All numbers are budgets to check, not measurements. Every item: **no new requestAnimationFrame, timer, interval, render target, AudioContext or per-frame scene query.**

| Feature | Draws | Triangles | Shader | CPU per frame | Sleeps / gates | Reuses |
| --- | --- | --- | --- | --- | --- | --- |
| Wade + swim | **+0** for the body (same rig); `swimFx` **+1 only while rings or drops are alive** | rings and drops ≤ 40 quads ≈ 80 tris | `swimFx`: one unlit quad shader, one branch on kind (ring / drop / bubble), all motion from per-instance start time + one time uniform (as `fishingOverlay`) | `distanceToLand` at 10 Hz (≈ 0.3 ms/s); pose from constant tables inside `player.update`; ≤ 3 instance writes per new ring | pool `visible=false` when empty; decorative drops and drips off at tier ≥ 2, reduced motion, or `uWaterDetail` 0 (copy `fishingLife`) | the opaque ocean hides submerged parts for free; existing root height path; `actionCluster` HUD |
| Idle in the water | — | — | — | — | **20 fps after 4 s** without input (the `idleRide` rule) | `idleRide.ts` |
| Splash-down | +1 for ≤ 1.2 s (same pool) | ≤ 60 quads | same | one parabola per drop | as above; reduced motion = one static ring | fall pose, knockdown faces, the camera target offset |
| Under-flash tint | DOM, opacity only | — | — | 1 class toggle | none needed (450 ms, then removed) | — |
| Shark circle | **+0** (same instanced fins and bodies) | 0 | none | ≤ 2 extra matrix composes and an orbit angle step | only while the region is awake (already < 140 m and on screen); none at dt 0 or static ambience | `caySharks.ts` region meshes |
| Speech bubble | DOM, 1 element ≤ 2.5 s | — | — | 1 transform write per island frame while shown | removed after | prompt-tracking pattern |
| Sting and splash sounds | — | — | — | one-shot oscillators | the shared context's 2 s suspend | `islandSound.ts` `tone()`/`hiss()` |
| Whale shark ride | **+0** (material swap on the same mesh) | 0 (≈ 260 tris already drawn) | lit material instead of basic: a few ALU ops | rider matrix from the track's position (already computed) | the ride ends past 60 m or after one lap | `whaleShark.ts`, `mopedSuperman` frame |
| Manta ride | **+0** (the existing 1-instance surfacing mesh) | 0 | — | 1 extra matrix | as the manta region | `cayMantas.ts` surfacing mesh |
| Dive buoys | +1 per view with buoys | ≤ 6 × 120 tris | palette shader | 0 (static) | hidden > 220 m | instanced, like the sharks |
| Dive room | **island 0 draws**; room ≤ 15 | ≤ 20k (phone) | Fog + `patchUnderwater`-style tint; caustics only on desktop as ALU (`uWaterDetail` 2), none on phones | room sea life 10 Hz steering; one uniform write for shafts | 20 fps idle; tier caps; parks with menus | seabed builder pattern, `deepSeaScene` shafts, `speciesModel()` read-only |

**Expected net effect:**
- Swimming adds about the cost of one small instanced draw for a second at a time.
- Treading water idle is *cheaper* than standing on land, because of the 20 fps cap.
- A dive replaces a 60–220-draw island frame with a ≤ 15-draw room, which should be the cheapest gameplay scene on the island after the Konbini.
- The one real risk is long riding at 30 fps over open water. That is the same cost as flying slowly, and it is bounded by the one-lap auto-dismount.

**Explicitly NOT to do:**
- **Real water physics:** fluid sims, buoyancy integration, cloth or soft-body water, wave displacement of the ocean mesh on the CPU.
- **Screen-space or planar reflections, a refraction render target, a second scene pass** for "underwater from above", or a framebuffer copy (the mobile framebuffer cache was already rejected: 10.2 ms vs 7.5 ms).
- **Caustics loops** on phones, or projected caustic textures updated per frame.
- **Per-frame raycasts** against the island or sea-life meshes for depth or for mounting. Use the analytic distance at 10 Hz and the loop tracks the CPU already has.
- **New audio contexts, music tracks or long audio files.** Stings and splashes are synthesized one-shots.
- **Per-swimmer or per-NPC swimming** (no townsfolk in the sea in this pass), and no wake trails (the user had the sharks' wake streaks removed).
- **Shadows in the dive room;** the player casting a shadow map onto the ocean while swimming (keep the existing dynamic shadow as is; do not add receivers).
- **`backdrop-filter`** or blur on any underwater overlay.
- **Lowering resolution or frame rate silently** to "pay" for any of this (performance guide rule).

**How to validate:**
- **Node tests**, in the `tests/idle-ride.cjs` and `heat-tiers.cjs` style: vm-transpiled TS plus source regex.
  - `swim-water.cjs`: depth zones, swim zone, no allocations in step functions.
  - `swim-pose.cjs`: a golden that leaves joint output unchanged when `swim` is absent, as `player-dive-jump.cjs` does.
  - `swim-fx.cjs`: the pool sleeps when empty; the decorative gate by tier, reduced motion and detail 0.
  - `heat-swim.cjs`: no `requestAnimationFrame`, `setInterval`, `WebGLRenderTarget`, `AudioContext` or `backdrop-filter` in the new files; the idle 20 fps wiring; the dive room's draw and triangle budget built in node with three.
  - `shark-attention.cjs`: the orbit stays in water, the timeout, and the release back to the loop.
  - `sea-ride.cjs`: mount radius, attach offset, auto-dismount.
  - `dive-spots.cjs`: clearance from shark, manta and whale-shark loops and fishing floats; every spot has a fact, credit and lesson; no links in kid UI.
- **Browser:** a new `scripts/check-swim-browser.cjs` (Playwright, the `check-fishing-browser.cjs` pattern), 390×844 touch, DPR 2, 4× CPU:
  - wade in, swim, Float, idle 4 s (assert `renderStats.idleRide` = 50), Back to shore;
  - a jetpack Drop in over the sea;
  - a shark circle at the causeway;
  - a ride on the whale shark;
  - a dive in and out.
  - Read `__fi2.renderer.info` draws and triangles and `renderStats`, and collect console errors.
- **A/B by the heat-audit method** (`docs/performance-guide.md`, Heat audit Oct 13): production builds, interleaved reps, busy % at 4× and 6×, with the danger line at main-thread busy ≤ 50 % and the frame interval ≤ 37.3 ms. Scenarios: beach-walk (before and after), swim-idle, swim-moving, splash-down, ride, dive room.
- **Be honest:** all of that is reduced work in emulation. Thermal claims need the **five-minute physical iPhone session** with a Safari Web Inspector timeline (performance guide, "Validation and update procedure" step 5): the same route, not charging, a comparable start. Record it in the guide's dated log.

---

## 3. Teaching (AGENTS.md)

Each water feature names its football purpose in the UI. Wording that is a coaching metaphor is labelled as such, not as fact.

| Feature | Football link | Copy (draft) | Type |
| --- | --- | --- | --- |
| Treading water | **Stay on your toes**: a keeper's ready stance, never flat-footed (matches `KEEPER_LESSONS`) | "Treading water keeps you ready, like a keeper on their toes." | coaching metaphor |
| Breath and stroke rhythm | **Pace and rhythm**: manage energy over 90 minutes | "Breathe with your stroke. Players pace their runs the same way." | coaching metaphor |
| Head-up breaststroke | **Scanning**: look up before you receive | "Head up! Good players look around before the ball arrives." | coaching metaphor |
| Shark circle | **Under pressure, find the open side** | "Defenders are closing in! Keep your head up and swim to the open side." | coaching metaphor |
| Riding a giant | **Hold the ball like a keeper holds a catch** (the existing `PULL_HINT`) | "Hold on like a keeper." | coaching metaphor |
| Clean dive vs belly-flop | **Body shape matters**, like a striker's body over the ball | "Arms together, body straight: clean entry!" | coaching metaphor |
| Pool recovery | Many pro clubs use pool sessions for recovery | *Needs a verified source before shipping* (polite-fetch rules; for example a club's own training-ground page). Not shown until verified. | real fact (to verify) |
| Diving spots | one **Real football fact** per spot (§2.4 table), plain-text credit, no links | as in the table | real fact |

Every spot name, every animal name ("Big Gentle") and every relic story is **Island story**, labelled like fishing's spot blurbs.

---

## 4. Plan

### Phases

| Phase | Scope | Estimate (agent dev-days) |
| --- | --- | --- |
| **P0** | Depth model, wade zones, swim state and poses, splash-down from a fall, parachute cut and jetpack Drop in, the `swimFx` pool, splash sounds, the water HUD (`SWIM_BUTTONS`), the ball parked on the sand, idle 20 fps in the water, tests, browser check, A/B | **7–9** |
| **P1** | Shark attention and orbit, the speech bubble, the sting, whale shark and manta rides (attach, opaque swap, dismount), a Sharks Beach patrol if approved, tests, A/B | **5–7** |
| **P2** | Dive buoys, the dive room engine, the breath meter, the first 2 spots (Coral Garden Reef, Sunken Goal), finds and plaque, then +1 day per further spot, tests, A/B, iPhone run | **8–10** for two spots, **+1 each** after |

### Lanes (parallel without editing the same files)

**Town.tsx is shared by everything and is huge, so one glue lane owns it per phase and lands last.**

| Lane | Phase | Owns (new files preferred) | Touches (minimal, additive) | Tests |
| --- | --- | --- | --- | --- |
| **A: water model** | P0 | `lib/town/swim/swimWater.ts` (`depthAt`, zones, swim zone, `canSplashDown`), `lib/town/swim/swimState.ts` (walk ↔ wade ↔ swim ↔ dip ↔ surface ↔ climb-out; entry type; breath), `lib/town/swim/swimLines.ts` (copy, lessons) | `lib/town/travelModes.ts` (+`swim` entry), `lib/town/simulation.ts` (`stepPlayer` mode `'swim'`) | `swim-water.cjs`, `swim-state.cjs` |
| **B: rig** | P0, P1 | `lib/graphics/swimPose.ts` (tread, breaststroke, crawl, duck-dive, float, climb, belly-flop and clean-dive entries, hold-on) | `lib/graphics/player.ts` (one optional `swim` field + one call, as `zipline`) | `swim-pose.cjs`, plus the existing `player-motion`, `player-dive-jump` and `bean-skin` goldens |
| **C: effects and sound** | P0 | `lib/graphics/swimFx.ts` (one instanced pool), `components/UnderFlash.tsx` (+ CSS module) | `lib/audio/islandSound.ts` (a new `fi2-swim-cue` family: splash, slap, bloop, shark sting) | `swim-fx.cjs`, `heat-swim.cjs` (part) |
| **D: glue** | P0 (then each phase) | `lib/town/swim/swimRuntime.ts` (one per-frame `step()` Town calls) | `components/Town.tsx` (movement, landing branch, camera dip, `SWIM_BUTTONS` cluster, idle rule), `lib/town/rooftopTravel.ts`, `lib/town/jetpackActions.ts` (splash branch), `lib/town/idleRide.ts` (a `swimmingIdle` input) | `heat-swim.cjs` wiring regexes, `idle-ride.cjs` extension, `scripts/check-swim-browser.cjs` |
| **E: sharks and speech** | P1 | `lib/town/swim/sharkAttention.ts` (pure orbit planner), `components/SpeechBubble.tsx` | `lib/graphics/caySharks.ts` (`attend(target)` / release), `lib/town/coralCay.ts` (a Sharks Beach loop, if approved) | `shark-attention.cjs`, `coral-cay.cjs`, `summit-sealife.cjs` |
| **F: sea rides** | P1 | `lib/town/swim/seaRides.ts` (rideable list, mount radius, offsets, speeds, auto-dismount) | `lib/graphics/whaleShark.ts` (an opaque ride look, exposed track pose), `lib/graphics/cayMantas.ts` (hold-surfaced for a rider, exposed track pose) | `sea-ride.cjs`, `manta-rays.cjs` |
| **G: dive engine** | P2 | `lib/dive/diveRoom.ts`, `lib/dive/diveLife.ts`, `lib/dive/diveSession.ts`, `lib/graphics/diveBuoys.ts`, `components/DiveHost.tsx` (+ CSS) | `lib/town/world.ts` (add the buoys), Town glue (render switch), via lane D | `dive-room.cjs` (budget, dispose), `heat-swim.cjs` |
| **H: dive content** | P2 | `lib/dive/diveSpots.ts` (positions, theme, finds, fact, credit, lesson, island story) | none | `dive-spots.cjs` |

- **Hands off:** `lib/town/fishing/*` and `components/Fishing*` (the other agent's), except for a **read-only import** of `speciesModel` from `fishModels.ts` in lane G.
- **No lane writes `docs/performance-guide.md`** except to append its own dated measured section at the end of its work. Order the appends through lane D.
- **Agent hygiene** (user memory): each agent uses its own `NEXT_DIST_DIR`, kills its servers and browsers, and never touches port 8092 or `.next-dev`.

---

## 5. Decisions for the user

1. **The shark line.** "Oh crap!" (your wording, the current default) or a kid-safe line such as **"Uh oh!"** or "Yikes!"? The players are 7–12, and the rest of the game's copy avoids even mild swearing. Recommendation: "Uh oh!" for kids. Say if "Oh crap!" should stay.
2. **Friendly giants vs the catch.** Recommended: the ridable whale shark and mantas are named "island friends", never hooked. Should the catalog's **whale shark** (Legendary, South Pier, sold at Rosa's) become catch-and-release, so the same animal is never both sold and ridden?
3. **The ball in the water.** Recommended: it stays parked on the sand while you swim. The alternative is that it floats and can be headed along (more fun, more physics).
4. **Where you can splash down.** Recommended: falls, cut parachutes and the jetpack **Drop in** splash down anywhere within 60 m of land; guided landings and markers stay land-first. Or should the landing marker also aim at water?
5. **The dive room.** In-page sealed scene (recommended: instant, keeps "dive from here") or a separate page like the Konbini (a full island unload, but a load wait)?
6. **Breath length and the end of a dive.** 45 s with an automatic gentle float up and nothing lost (recommended), or longer or shorter for younger players?
7. **A shark patrol at Sharks Beach?** Today its sharks are only at the causeway and Summit Isle. Add one or two loops in the bay (+0 draws: same region mesh).
8. **Rays.** Mantas only as rides, never stingrays (barb). Agree?
9. **Swim speed.** Breaststroke 1.2, crawl 1.8, Swim fast 2.6 m/s, against walking 3.7 and sprint 6. Slower feels real; faster feels better on a big map.
10. **Steering a ride.** P1 rides follow the animal's loop (cheap and safe). Should kids be able to steer a little later?
11. **Rides into the water.** Scooter, bike, moped and truck stop at the waterline as today (recommended), and only the jetpack takes off from the water. Agree?
12. **Unlocks.** Should swimming or diving be open to all from the start, or be gated like rides (`rideUnlocks.ts`) behind Paths?
13. **The first two dive spots** for P2 (recommended: Coral Garden Reef and The Sunken Goal), and whether Lantern Deep's dark room is fine for younger kids.

---

## 6. P0 implemented (15 Oct 2026)

Lane A + B + D of §4 (and the `swimFx` pool of lane C replaced by a reuse), on the files below. P1 (sharks circling, the speech bubble, rides on the whale shark and mantas) and P2 (dive spots) are not started; they wait for the fishing rework in flight. Nothing in `lib/town/fishing/*`, `components/Fishing*`, the easel files or the cave files was touched.

**Decisions taken (user, 15 Oct 2026), each a named constant:**

1. The shark line is **"Uh oh!"** (P1; no constant yet, it lands with the speech bubble).
2. The ridable whale shark and mantas are separate **"island friends"** (P1).
3. **The ball stays on the sand**: `BALL_STAYS_ON_SAND` (`lib/town/water/waterDepth.ts`). When the feet go in, the walking ball is parked at the last dry spot (`waterState.ts` `state.park`, its 0.56 m lead turned to stay on land) and `Town.tsx` feeds that spot to `walkBall` instead of the swimmer; climbing out, the ball rolls back to the feet (the ball's own `return` blend).
4. **Splash-downs over any open water** (widened the same day, see the second feedback round): `SPLASH_ANYWHERE` and `canSplashDown(x,z)` (open water, inside the flyable world, at least knee-deep, however far from land). Falls, cut parachutes, the jetpack **Drop in**, rooftop jumps and ride launches that end there become water landings. Guided landings and the landing marker stay land-first. (P0 shipped a 60 m `SPLASH_RANGE`; a far drop then left a kid standing in the open sea with the land HUD.)
5. Dives happen in the same page (P2; no constant yet).

**Files.** New: `lib/town/water/waterDepth.ts` (the shelf depth, zones + hysteresis, the probe, `canSplashDown`, `swimStep`), `lib/town/water/waterState.ts` (land → wade → swim → under → surface, Float, Swim fast, Back to shore, the parked ball, the pose descriptor, time buckets), `lib/town/water/waterHud.ts` (`WATER_BUTTONS` / `WADE_BUTTONS`, `waterStore`, `waterActions`, keys, the lesson copy), `lib/graphics/swimPose.ts` (tread, crawl, float, entry + head-shake; a damped held copy per joint, no per-frame allocation), `components/SwimLessonToast.tsx`, `lib/analytics/waterEvents.ts`, `app/admin/WaterSection.tsx`, `supabase/migrations/20261017_analytics_water.sql`, `tests/water-depth.cjs`, `tests/water-swim.cjs`, `tests/heat-water.cjs`. Changed: `components/Town.tsx` (glue: movement, landing branches, root height, camera dip, cluster swap, idle rule, analytics), `lib/graphics/player.ts` (`PlayerMotion.swim`, one poser, five guards), `lib/town/simulation.ts` (`stepPlayer` optional `water` test, consulted only after the ground says blocked), `lib/town/rooftopTravel.ts` (`update(…, water)`, `setSplashTest`), `lib/town/rooftopJump.ts` (`canSplash` lets a launch end over splashable water), `lib/town/jetpackActions.ts` (`env.splash` → `landed:true, splash:true`; `cut`/`crash` keep the drop height), `lib/graphics/ballEffects.ts` (`ripple()` on the existing ring pool), `components/TravelIcon.tsx`, `components/JobActionButton.tsx`, `app/globals.css` (the under tint, the Drop in button), `lib/analytics/countIds.ts` / `islandIds.ts` / `overview.ts`, `app/admin/AnalyticsDashboard.tsx`, `tests/idle-ride.cjs`, `tests/zipline.cjs`, `tests/admin-analytics-coverage.cjs`.

**The depth model (as §2.1):** `depth = min(1.6, 0.45 · distanceToLand)`; ankle 0–0.25, knee 0.25–0.6, waist 0.6–1.0, swim > 1.0, with 0.05 m hysteresis on every line. `createWaterProbe` asks `distanceToLand` at most 10× a second while in the water and never on land (onLand is read every tick: polygon tests only). The walker's `stepPlayer` consults the probe's `allowed(x,z)` (off land, inside the flyable world, within `SWIM_RANGE` 60 m by the cached distance as a bound) only where the ground said blocked, so walking on land costs nothing extra. Root height: wading `−0.12 − depth` (the feet on the shelf), swimming `−0.43 − 1.27` (shoulders at the line), blended over 0.25 s. Speeds: ankle ×0.9, knee ×0.7 (no sprint), waist ×0.5; swim 1.8 m/s, Swim fast 2.6, acceleration 3, braking 2, a current slowing the last 6 m before the 60 m edge.

**What was reused instead of added:** the ball effects' five pooled rings (`ballEffects.ripple` / `splash`) for every ripple and splash (the design's `swimFx` pool was not built); `idleRide` for the 20 fps treading-water cap (`idleRide.interval(now, riding || water.resting())`); `sound.land()` + the ball's `undock` plop for the splash (no new audio); the knockdown face set for the belly-flop daze; the `actionCluster` mechanism and `JobActionButton` for the water HUD; `rooftop.findLanding` for Back to shore; the toast lane + `CostumeMilestoneToast` styles for the lesson; the fishingLife-style gate (reduced motion / static ambience / governor slow / tier ≥ 2) for decorative ripples. Not built in P0: the wade poses (the body simply lowers onto the shelf), breaststroke, the drip on walking out, bubbles (no existing pool outside fishing). (The sized splash, its cue and the jetpack take-off from the water landed in the feedback rounds below.)

**Analytics (`lib/analytics/waterEvents.ts`, ids in `countIds.ts` `WATER_COUNT_EVENTS`, admin "Water" section):** `wa:first_wade`, `wa:first_swim` (once per device, `fi2-water-firsts-v1`), `wa:swim_start`, `wa:splash_fall` / `wa:splash_roof` / `wa:splash_launch` / `wa:splash_dropin`, `wa:shore`, `wa:fast`, `wa:float`, `wa:time_10s` / `wa:time_30s` / `wa:time_60s` / `wa:time_120s` / `wa:time_long` (a swim's seconds, bucketed when it ends), `wa:idle_cap` (the 20 fps cap engaging while treading water), `wa:lesson`. Time in the sea is the new `swim` activity in "What they're doing" (`islandFrame(…, 'swim')`), which needs `supabase/migrations/20261017_analytics_water.sql` (the counters ride the existing `k` channel and need no migration).

**Teaching:** the first swim shows `SWIM_LESSON` once per device (`fi2-swim-lesson-v1`): "Swim smooth and steady, like pacing a match: sprint when it matters, glide when it doesn't." labelled *Coaching idea* (§3's pool-recovery fact stays unshown until verified).

Heat numbers and the browser validation are in `docs/performance-guide.md`, "Wading, swimming and splash-downs (P0)".

**Feedback round (15 Oct 2026, user after trying it: "when swimming have the face pop up and also add animation for the water moving. the action swim fast isn't moving faster", then "for the action to shore, allow switching to jetpack to fly up"):**
- **Face up:** the crawl is a head-up crawl now (`swimPose.ts`: hips at the water line, the back out of the water, the body pitched 1.0 rad instead of 1.22, the head pitched up −1.45 rad so the face looks ahead and up at the follow camera; a glance to the side every third stroke instead of a face-down breath). Treading water lifts the shoulders out (pelvis 1.0 above the root) with the face up and a 5 cm bob.
- **The water moving:** a wake from the same five pooled rings (`ballEffects.ripple` gained a `size`): a bow ripple 1.1 m ahead and a V pair 0.9 m behind every `WAKE_STEP` 0.38 s (0.26 s on Swim fast, bigger rings), and a small splash where each arm enters, once per stroke (`events.stroke` ±1, from the stroke clock); treading water: a soft ring every 1.6 s (floating 2.4 s). ≤ 7 rings per stroke, nothing at rest beyond the pelvis bob, none with reduced motion / static ambience / governor slow / tier ≥ 2 (the stroke clock stands still with reduced motion, so there are no arm splashes either).
- **Swim fast:** `SWIM_FAST_SPEED` 2.6 → **3.1 m/s (1.72× the 1.8 crawl)**, `SWIM_FAST_ACCEL` 4.5 (3 normally), stroke rate 9 (5.5), the wake quicker and bigger. Two real causes were fixed too: the desktop `Space` key was swallowed by the focused-button rule after any HUD tap (the water keys now run before it), and a pressed Swim fast raised its analytics event on a tick that cleared it (presses are pending until the next step). Measured in the browser: see the guide.
- **Fly up:** a two-choice in the ride slot (`WATER_BUTTONS_FLY`): the first tap of **To shore** starts the auto-swim; while it runs and the jetpack may start (fuel, `fuelStore.canUse('jetpack')`), the same slot reads **Fly up** (the jetpack icon) and a tap takes off straight out of the water: a splash and two drips from the ring pool, the swim state ends (`takeOff()` → `flew`), the ride switches to the jetpack with the climb starting from the water line (`rooftop.reset(x, z, rootY)` before the ride change reads the height). Without fuel the choice is hidden, never disabled (To shore stays). Landing back on the water is the Drop in splash-down. Keys: E / R / 3 = To shore, then Fly up. The base jetpack has no unlock (the island starts in flight; `rideUnlocks.ts` gates the vending-machine variants only), so fuel is the only gate. *(Superseded the same day: see the next round. To shore is gone; the ride slot is the switcher.)*

**Feedback round 2 (15 Oct 2026, user: "when crash from above to water, update to splash animation and sound. don't allow walking, biking, scooter or moped. change icon to swimming and jetpack only", then a screenshot far out in the open sea with the land HUD, and "change the two right actions to float on back and if holding swimming faster. holding floats makes you float in a circle"):**
- **The splash** (`ballEffects.splashDown(x,y,z,size,reduced)`): the ring pool's five rings as the crown (a wide foam ring on the water, two upright crown rings lifted 0.35·s and 0.75·s m, two later foam rings spreading at +0.22 s and +0.45 s), plus a spray burst from the pool's 14 ghost spheres (the column thrown up) and 8 charge spheres (droplets flung wider), on gravity arcs for `SPLASH_BURST_S` 0.95 s, fading and shrinking, cut off at the water line. The burst borrows those meshes only while the ball is neither shot nor charging (it is parked on the sand whenever anyone is in the sea) and recolours their materials to water, restored through `lastColor` when it ends; the per-droplet seeds live in one `Float32Array` made once, so the hit allocates nothing. **Size** = (0.6 + 0.9·power) × `SPLASH_SCALE[entry]` (feet 0.8 < belly 1 < clean 1.25; power = 0.35 + drop/20 as before), so a feet-first hop is a small plop and a clean dive from ≥ 12 m the biggest crown. Surfacing adds `drips()` (the droplets, small and close, falling off the head) with a `path-pop` plip. Reduced motion: one foam ring and the sound. Instance budget: the pool's existing 27 meshes, no new materials or pools (tests/heat-water.cjs).
- **The sound** (`waterHud.ts` `SPLASH_CUES`, played by Town's `playCues`): a cue set per entry through the island sound's existing `fi2-job-cue` / `fi2-path-cue` channels (the fishing cues' mechanism): feet = thud + undock plop + swish; belly = thud + clank (the slap) + plop + hiss + swish; clean = thud + swipe-left + plop + hiss + swish. The staggered ones (≤ 4 per splash, ≤ 320 ms) are the only timers the sea runs, cleared on unmount. No new audio context, voice or file; `islandSound.ts` untouched. A `fi2-water-splash` DOM event (entry, source, size) lets a page probe count splashes. Analytics ids unchanged (`wa:splash_<source>`).
- **Swimming and the jetpack only.** In the sea the land rides are not selectable (`selectRide` returns while `inWater`; R goes to the water keys first). The cluster, left to right: the **ride switcher** (`RIDE_SWIM` / `RIDE_SWIM_NO_FUEL`, id `swimride`, the new `swim` icon = the current ride; a tap is the only other choice, the **jetpack**, taking off straight out of the water as before, offered while `fuelStore.canUse('jetpack')`, otherwise the same swim icon is aria-disabled and a tap shows `SWIM_RIDE_NOTE` in the job-note lane), **Sprint** (hold: the fast crawl, Space / 1) and **Float** (Q / 2; tap = on the back as before; **hold** past `FLOAT_HOLD_S` 0.28 s = the lazy circle: on the back, drifting round `CIRCLE_RADIUS` 1.2 m once every `CIRCLE_PERIOD` 7 s (≈ 1.1 m/s, `CIRCLE_INPUT` as the swim step's stick), bobbing, a soft ring every 1.1 s, the stick ignored; release = treading). The travel icon in the water is the swim icon; walking out restores the land choices. **To shore is gone** from the cluster and the state machine (no auto-swim left: the jetpack and plain swimming cover it); `wa:shore` is no longer raised. The water buttons stay icon-only (`WATER_IDS`).
- **A mid-ride drop** (a scooter / bike / moped launch ending in the sea): `splashInto` puts the kid in the swim state (`rideRef` → walk) and remembers the ride in `rideBeforeWater`; the first dry step (`ev.left`) hands it back if it is still allowed (job, fuel). Cheaper than parking it on the sand like the ball: nothing to draw, nothing to walk back to. A jetpack fall is not remembered (you land as a swimmer and fly up again from the switcher).
- **Deep water is always the swim state** (the screenshot bug): the root cause was decision 4's 60 m range: a fall over the sea farther out was not a splash-down, so the walker landed on the sea "floor" and stood there with the land HUD. `canSplashDown` has no range now (every fall, jump, launch, cut canopy and Drop in over knee-deep open water inside the flyable world splashes), and the water state's own rule stands: any non-airborne position past the swim line is `inWater && swimming` whatever put the body there (walking, a teleport, a map trip, a landing). A swimmer dropped beyond `SWIM_RANGE` 60 m may only swim inward (`probe.allowed`: no farther from land than the last sample, 2 cm of slack), so the current never strands anyone. Tests: `tests/water-swim.cjs` "any position past wading depth is the swim state, by every route" and `tests/water-depth.cjs` (no range; inward only beyond it).

## 7. P1a implemented: sharks circle the swimmer (15 Oct 2026)

User: "when near sharks, have the sharks circle around the character when in the water". Decisions: the line is **"Uh oh!"** (`SHARK_LINE`), no health or harm, the sharks lose interest or let go at the shore; football hook: the defenders are closing in.

- **Files.** New: `lib/town/water/sharks.ts` (pure: trigger, pick, ring, timers), `tests/water-sharks.cjs`. Changed: `lib/graphics/caySharks.ts` (`attend(circle)`, `schools` read straight from the instance matrices, the ring applied inside `place()`; a circling region still moves with reduced motion), `components/Town.tsx` (create + attach, the tick in the water step, the bubble placement, `__fi2.sharkCircle`), `components/SwimLessonToast.tsx` (`which="shark"`), `lib/town/water/waterHud.ts` (`sharkLesson`), `lib/audio/islandSound.ts` (`sting` job cue), `app/globals.css` (`.shark-bubble`), `lib/analytics/waterEvents.ts` / `countIds.ts`, `app/admin/WaterSection.tsx`.
- **Behaviour.** Swimming (past wading depth) within `SHARK_TRIGGER` 14 m of an awake region's fin: up to `SHARK_MAX` 3 of the nearest sharks within 26 m whose straight line to their slot has no land join a ring of `SHARK_RING` 4.6 m (shrunk to stay `SHARK_SHORE_GAP` 0.7 m off the nearest land by the probe's distance, never below 2.4 m), slots staggered at 0 / 2.25 / 4.15 rad and ×1 / 1.12 / 0.9 radius, turning counter-clockwise at 1.2 m/s with the fins heading along the ring and the ring centre easing after the swimmer (2.2/s). They blend on over 1.8 s and off over 2.4 s back to wherever their loop has reached. They end after `SHARK_HOLD` 12 s ("lost interest"), or at once at wading depth, a jetpack take-off or leaving the sea; then a 25 s cooldown. Summit sharks circle the same way.
- **The moment it starts:** the "Uh oh!" bubble over the head for 1.5 s; a two-note sting (110 Hz then a semitone up, triangle); the once-per-device lesson "Defenders closing in: Keep your head up and find the open side." (`SHARK_LESSON`, *Coaching idea*, key `fi2-shark-lesson-v1`); a 0.12 s camera nudge (the belly-flop shake), skipped with reduced motion.
- **Analytics:** `wa:sharks_circle`, `wa:sharks_escape` (shore, take-off or lost interest), on the `k` channel (no migration), shown in the admin Water section.
- **Not built:** a surprised face or pose (swimPose.ts belongs to another lane), the open-gap "escape faster" rule of §2.5, music ducking. Heat and the browser numbers: `docs/performance-guide.md`, "Sharks circle a swimmer".

## 8. P1b implemented: hang on to a manta or the whale shark (15 Oct 2026)

User: "when near a manta ray or whale shark, have a btn that comes up to say hang on, on click the drag the character through the water faster". Decision: the ridable mantas and whale shark are separate **"island friends"**, never hooked by fishing (the catalogue's whale shark stays as it is).

- **Files.** New: `lib/town/water/animalRides.ts` (pure: the 10 Hz proximity pick, grab, the ride step along the loop, one-lap end, Let go, the constants and the lesson), `tests/water-rides.cjs`. Changed: `lib/graphics/cayMantas.ts` (`friends`: every manta loop; `ridden` holds it surfaced on the island's 1-instance surfacing mesh, the silhouette instance hidden, no wingtip / breach while held, the island kept awake), `lib/graphics/whaleShark.ts` (`friend`), `lib/graphics/swimPose.ts` (the `hold` shape: prone on the back, head up, both arms reaching forward to the grip, legs trailing with a lazy flutter, the body rolling into the turns), `lib/town/water/waterHud.ts` (`RIDING_BUTTONS`: Let go + the disabled swim icon; `WaterView.riding` / `rideLesson`), `components/Town.tsx` (glue), `components/JobActionButton.tsx` + `components/TravelIcon.tsx` (the icon-only `letgo`), `components/SwimLessonToast.tsx` (`which="ride"`), analytics (`waterEvents.ts`, `countIds.ts`, `app/admin/WaterSection.tsx`), `tests/water-swim.cjs` (one regex allows `letgo`), `package.json`.
- **Behaviour.** Swimming (past wading depth) within `RIDE_RANGE` 5 m of the body (`RIDE_BODY`: manta 2.6 m, whale shark 6 m from the centre): the floating **"Hang on!"** prompt over the animal (the same `store-enter-prompt` button as Talk / Fish / Sell, through the HUD arbiter; E also grabs while it shows). A tap: the rig holds on at the grip point (the manta's disc centre, the whale shark's back 2.2 m ahead of centre), the animal eases up (`RIDE_EASE`) to `RIDE_MULT` × `SWIM_FAST_SPEED` (manta 1.6× = 9.9 m/s, whale shark 1.3× = 8.1 m/s) along its own loop (the ride owns the loop position, the mesh follows it exactly), a bigger wake from the ring pool (`RIDE_WAKE` 1.7× / 2.3×), the camera's follow 1.1 m higher. The water cluster becomes the single icon-only **Let go** (Space / E / 1 / 3; the ride slot keeps the disabled swim icon, a tap explains). After ONE lap it lets go by itself; Let go early is the same: a small feet-first splash, the swimmer glides on at 35 % of the ride speed and treads water where it ended. A map trip or the swim ending (any route) lets go too; sharks do not circle a rider.
- **Teaching (once per device, `fi2-ride-lesson-v1`):** "Ride the wave: a counter-attack is fastest when you move with the play, not against it." (*Coaching idea*, no fact claim).
- **Analytics:** `wa:ride_manta`, `wa:ride_whale` (grabbed on), `wa:ride_lap` (finished the lap), `wa:ride_off` (let go early), on the `k` channel (no migration), in the admin Water section.
- **Not built:** steering (decision 10), the 60 m auto-dismount (every friend loop is inside the swim range), the "Thanks for the ride!" bubble and the whale shark's opaque look while ridden (it stays the shadow silhouette: no material swap). Heat and the browser numbers: `docs/performance-guide.md`, "Rides on a manta or the whale shark".

## 9. P2 implemented: one spot (16 Oct 2026)

User (16 Oct 2026): "For the diving spots, have some type of marker on the top of the water, and also the water spot for the diving area should also be a different shade … build one to test first to see how it works, then we can add more diving spots throughout the maps." and "make sure the under water scene is robust with coral and fish swimming around." Decisions taken: the dive happens in the same page with the island asleep (decision 5); no harm and no health; kid-safe copy; spots are data.

- **The spot.** **Paul's Grotto**, candidate 6 of §2.4: (84, −272), radius 9 m, 29 m off North Beach Rocks on the main island, 24 m east of that spot's fishing float, ≥ 170 m from every shark, manta and whale-shark loop (tests/water-dive.cjs checks the whole patch is swimming depth and clear of every float and loop). Its **Real football fact** is the one already verified in the repo (`fishCatalog.ts` octopus): "At the 2010 World Cup, Paul the Octopus from Sea Life Oberhausen picked the winner of all seven Germany matches and the final: 8 out of 8!" (Source: Wikipedia, "Paul the Octopus", plain text). The octopus living under the sunken goal is labelled *Island story*. Candidate 1 (Coral Garden Reef) is on Coral Cay, not the main island.
- **Surface cues.** (a) An orange float with a mast and the red-and-white "diver down" flag, one instanced draw for all buoys, bobbing in the vertex shader on the water clock. (b) A lighter turquoise disc with a soft edge and a faint rim, as a uniform in the existing ocean shader (2 slots for the two nearest zones, rewritten on the HUD tick; every other zone within 260 m gets a flat shoal decal, one draw for all: Oct 20 2026 shared layout, docs/performance-guide.md). Both are visible from the beach and the follow camera (docs/water/dive-1, dive-2).
- **Dive.** Swimming into the patch shows the floating **Dive** prompt (the Hang on! button style, through the HUD arbiter; E works too). A tap: the P0 under-tint flash and a clean-entry splash, then the island stops rendering and the sealed room opens (lib/graphics/diveRoom.ts; numbers in the performance guide). Controls: the stick turns and swims (slow, floaty), auto-level over the sand (lower near a find); on desktop Q / Z rise and sink. One icon-only action, **Surface** (Space, and Escape).
- **The room.** Rippled sand, a ring of soft rocks closing the view, ~100 coral pieces of five kinds (branching, brain, table, tube, finger) in the island palette, swaying sea fans, anemones, kelp and seagrass, 7 schools (76 fish on phones, 80 on desktop: anchovy, blue and yellow tang, snapper, bigeye, trevally, anthias) on loops and lazy figure-eights at different depths, a cownose ray gliding overhead, a grouper, a big parrotfish and the octopus (no reptiles or mammals), bubbles from the diver and a vent, god rays, fog, one hemisphere light.
- **Interactive areas (floating prompts within 2.6 m):** the **sunken goal** with Paul's two flag boxes (Look: the fact card); a **coral head** (Touch: 14 damselfish burst out, then circle home; *Coaching idea*: press together); a **giant clam** (Open: the lid lifts to show a pearl, visual only; *Coaching idea*: wait for your moment); the **matchday coin** in a chest (Take: **3 coins once ever**, a `dive:` wallet run metered by the Training meter, like a beachcombing find and well under a hidden ball's 12). **Skipped:** a hidden ball of the island hunt, because adding one to `COIN_QUEST` changes the hunt's total (the all-balls costume, the milestone ladder) and needs a new collection mechanic underwater; that is invasive for a test spot.
- **Breath = the pace lesson.** 45 s at an easy swim, 75 s gliding (×0.6), 25 s with the stick pushed all the way (×1.8); a calm "time to head up" note at 20 %; at 0 the diver floats up gently ("Good dive!"). Nothing is lost and there is no harm. It refills at the surface over 6 s, and a new dive waits for a quarter breath ("Catch your breath"). The ring is one CSS variable written ≤ 10 Hz. Lesson toast once per device (`fi2-dive-lesson-v1`): "Pace your breath: Glide slowly and your breath lasts longer. Sprint everywhere and it runs out fast, like a midfielder's legs in a long match." (*Coaching idea*).
- **Surfacing.** A drift up (0.6 s), then back at the buoy treading water with a splash and drips from the existing ring pool and the surfacing plip; the island resumes; the room is disposed (nothing stays allocated: tests/water-dive.cjs). A map trip or unmount while under comes up at once.
- **Saves and analytics.** Finds: SYNC key `fi2-dive-finds-v1` (docs/accounts-design.md table A); lesson flag: DEVICE key `fi2-dive-lesson-v1`. Ids on the `k` channel (no migration): `wa:dive_start`, `wa:dive_surface`, `wa:dive_find` (first use of each find), `wa:dive_breath_out`, `wa:dive_lesson`, shown in a **Dives** tile in the admin Water section.
- **Adding the next spot** is data: a row in `DIVE_SPOTS` (centre, radius, tint, surface point, theme, finds with room positions, the fact and its credit). The shader has 2 slots (`DIVE_SLOTS`; farther zones are the shoal decal), the buoys are one instanced draw, the room is built from the theme. Where everything sits comes from the zone's shared layout (`lib/town/water/diveLayout.ts`), read by the room, the shoal preview, the decal and the above-water pieces. Each new fact must be verified before it ships.
- **Validation.** tests/water-dive.cjs (14 groups); the browser driver `scripts/check-dive-browser.cjs` (production build, 390×844 touch): swim into the patch, Dive, swim to all four finds and use them, Surface with the button, catch a breath, dive again, Escape; zero page or console errors; screenshots in docs/water/. Phone heat was NOT measured (cloud only).


## 10. Explore v2: swim feel, the reef journey, the frozen island (21 Oct 2026, local)

Critique first (headless phone + desktop, Paul's Grotto, Captain's Cup, Kelp Forest Wreck): the diver was drawn upright (a tread / head-up
crawl, so it read as walking in fog), the top of the screen was one flat pale band, the god rays were hard glass slabs, there was no
caustic light, nothing moved past you (no motes), fish ignored you, nothing guided you to the four finds and there was no progress, and the
island's music kept playing under the reef bed. Built, in order of impact:
- **Swimming.** The body lies along the swim (the crawl's under-water shape, `under` 1, pitched with the climb): a flutter-kick crawl
  while swimming, a slow glide flutter when the stick is let go (a lower drag, `DIVE_GLIDE_DRAG`, so a kick carries), a gentle hover bob,
  banking into turns (`DIVE_BANK` 0.5 rad). **Dart** (the orange button beside ▲ ▼ on phones, one thumb; F / Shift on desktop): a burst
  to 5.4 m/s for 0.7 s, 1.1 s cooldown, 1.2 % breath (the pace lesson: a sprint has a price), a longer bubble trail, a 6° FOV kick, sand
  puffs low over the sand. The camera sits a little lower and looks farther ahead, and is kept over the sand under it and halfway to the
  diver (never inside a rising reef).
- **The reef journey (diveJourney.ts).** Each zone has 8 pickups on a guided path through its finds (from the zone's own data, never
  hard-coded positions): 4 bits of litter (a can, a bottle, a lost net, a bottle cap) and 4 treasures (a spiral shell, a starfish, sea
  glass, a lost kit badge) that twinkle. Swim through one to collect it (no button): it spins up and away, a short note ("You cleared an
  old can: the reef says thank you!"). The **Reef n/12** chip counts pickups + finds; the coral's colour comes back as it fills (uReef 0.72
  → 1). At 12/12 the zone is **restored**, once ever: a *Real football fact* card (Forest Green Rovers, the first club certified carbon
  neutral by the UN, 2018; source Wikipedia), a "Reef Keeper" sticker line, **3 coins** (`dive:<zone>:reef`, Training-metered, once ever:
  at most 21 over all seven zones) and the zone's biggest school swims into a turning football in front of you for 8 s.
- **Dot, the buddy fish.** A small damselfish swims beside you; hover for 2 s and it swims toward the nearest thing left to find and back
  (it leads), so a young child always has a next step. No arrows, no map.
- **Underwater football (the pitch zone, Paul's Grotto).** A ball on the old centre spot: nudge it with your body (water drag, a slow sink,
  soft sand bounces) into the sunken goal: "GOAL!" and a *Coaching idea* card (a soaked pitch slows the ball: pass firmer). The ball
  resets after 3 s. No coins (play only).
- **Fish and plants react.** Schools part round the diver (more on a dart) and close up behind; fans, kelp and grass bend away as you swim
  through. All in the vertex shaders.
- **Water.** The room's water colour now follows the camera's place in the water column (clear turquoise near the surface, the zone's own
  tint low over the rim; waterTokens ROOM_SHALLOW / ROOM_SHALLOW_MIX), the surface from below is a clear aqua window with moving shimmer
  lines fading into that colour, caustic light lines move over the sand and the reef, the rays are soft and breathe, plankton motes drift
  past (parallax: you can feel yourself move), a soft static vignette.
- **Calm by design.** No fail states: the breath still floats you up gently; no timers on the journey; nothing scary.
- **Saves / analytics.** `fi2-dive-reef-v1` (SYNC, docs/accounts-design.md table A): each zone's collected pickup indices and the restored
  zones. `wa:dive_dart` / `wa:dive_pick` (once per dive), `wa:dive_restore`, `wa:dive_goal` on the `k` channel (countIds.ts registry,
  admin Water tile): **no migration**.
- **Freeze.** While in the room the whole island is suspended (docs/performance-guide.md "Explore v2").
- **Validation.** tests/explore-v2.cjs (frozen-island source checks, rest, swim feel, journey, runtime restore, room caps and colour),
  tests/water-dive.cjs, tests/dive-layout.cjs, full suite, `build:quiet`, headless phone + desktop shots (/tmp/explore-v2), 0 console errors.
- **Not done / next.** A whale-shadow surprise, per-zone friend emotes (wave / high five), a daily sparkle spot and a photo mode were left
  out to keep the draw budget; the Dart button could pulse once on the first dive. iPhone heat not measured.
