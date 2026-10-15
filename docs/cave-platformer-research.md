> **Status (Oct 15 2026): superseded and removed from the code.** The user's decision: "remove the cave game. instead make this a different world."
> The 2D 8-bit Training Tunnels platformer this document designed was deleted (lib/cave, components/cave, app/cave, its tests, analytics and hooks).
> A 3D underground world replaces it; its design lives in `docs/underground-world-research.md`. This file is kept for history only.

# Training Tunnels: a pixel platformer under Summit Isle (research and design, Oct 15 2026)

> **Status: built as the MVP on Oct 15 2026 (see §14b for the decisions taken and the power-ups added).** Sections 1–14 are the
> research and design as written before the build; where they differ from §14b, §14b is what the code does. Line numbers refer to the working tree on Oct 15 2026.

User (Oct 15 2026): "Research implementing a mini game for the main mountain. after collecting the balls from the cave. there are
two caves. entering the caves opens up a mini game like the original super mario brothers. where they travel underground and
navigate through a mini game to collect soccer balls instead of coins. the view should be pixels like the original super mario
game. entering one tunnel enters you in and when finishes exits out. 2D side-scrolling platformer that has the futbol island
concepts. The character should feature 8-bit pixel art designed on graph paper."

Follow-up: "in this mini game have it load separately from the rest of the island. have a done btn top right to exit out anytime".

The user attached the full map of Super Mario Bros. World 1-2 as a reference. **We use it for structure and pacing lessons only.**
No Nintendo art, sprites, tiles, enemies, names, sounds or layouts are copied. Everything in the game is original Futbol Island
art (see "Copyright").

## 1. Short version

- **Name:** the *Training Tunnels*. There are two tunnels: the **Hill Tunnel**, entered from the hillside cave, and the **Sea Tunnel**,
  entered from the sea cave. Each is a 2D side-scrolling pixel platformer. You collect **training balls**, not coins.
- **Gating (recommended):** a cave's tunnel opens once that cave's hidden ball has been collected. You pick that ball up just
  inside the cave mouth, so in practice: walk in, take the ball, read its lesson, and then the tunnel at the back lights up. The
  minigame does not replace the hidden-ball hunt.
- **Loading (recommended):** use a **separate route, `/cave`**, which is the same document boundary the Arcade, Museum, Konbini
  and Kit Shop use. Entering saves a departure and calls `window.location.assign('/cave?in=hill')`. The island unloads completely:
  no WebGL context, no island loop and no island audio. Leaving goes to `/?from=cave`, which reloads the island at a cave mouth.
- **The screen:** one Canvas2D buffer at a whole-number pixel scale with `image-rendering: pixelated`. The level is 14 tiles
  (224 px) tall. It is designed for a portrait phone (192 × 224 art px at P = 2), and landscape and desktop see more of the level.
  Both orientations are supported. **Done** sits top right: the shared `DoneButton`.
- **The character:** the player's own bean as a 16 × 24 sprite drawn as a graph-paper text grid. Its kit, skin, hair and body
  colours come from `customization.ts`, snapped to the museum's Mega Drive 9-bit palette.
- **MVP:** one level (played from either cave, exiting at the other), one defender type, training balls, fact crates, corner-flag
  checkpoints, Done, scoring, a saved best, and metered coins. About **9 dev days**. The fuller version adds a second level, a kick
  for the wall pass, the keeper room, a secret route, a bonus room, the junction chamber and a time-attack best. That is about
  **10 more days**.

## 2. What it teaches (AGENTS.md)

Each level has one clear learning purpose. Each mechanic is a football idea you *do*, not a label stuck on a jump.

| Mechanic | Football idea | How it is taught |
|---|---|---|
| Hop over a **Slider's** tackle at the right moment | *Ride the tackle*: a dribbler hops a sliding leg and keeps the ball | The Slider crouches for 0.5 s before it slides (a telegraph), so jumping early or late is visible. First tackle: "Ride the tackle: hop the leg, keep going." |
| Defenders are passed, never stomped | *Play the ball, not the player* (Law 12; the island's `law12-careless-challenge` ball says the same) | Landing on a defender does nothing to them: you hurdle and land beyond. No defeat animations. |
| Bump a **fact crate** from below; the ball pops out, bounces once and rolls toward the stream | *Win the second ball*: react first after a header or a clearance | The ball is lost into the stream if you are slow. The crate shows one real fact (§7). |
| **Corner flags** are the checkpoints | Corners restart play | Touching a flag plants it. Falling into the stream restarts you at the last flag. No lives are lost. |
| **Wall pass** (fuller version): kick your ball off a rebound board to hit a switch across a gap | *The one-two*: pass, run, get it back | A board, a switch and a bridge. The lesson line: "Pass, move, receive: that's a one-two." |
| **Keeper room** (fuller version): a rival on a ledge feints, then shoots; jump to catch the shot, not the feint | *Stay set, don't dive early*: the fishing lesson (Bar-Eli et al. 2007, docs/fishing.md) | Jumping on a feint gives "Dived too early", and the ball goes past (no penalty, no bonus). |
| **Junction chamber** (fuller version): three tunnel mouths labelled DEFENCE · MIDFIELD · ATTACK | Where each line of a 4-3-3 stands and what it does | Each short room lays out its balls in that line's shape (a flat four, a midfield triangle, a front three) with one sentence about the line's job. All three exit to the island. |
| **The Overlap** (fuller version): the secret route along the tunnel roof | *Overlap round the outside* (the Arcade-roof ball already teaches it, coinQuest.ts:81) | Finding it shows "You overlapped round the outside!" |

Per-level purpose:

- **Level 1, Hill Tunnel ("downhill"): timing.** Ride the tackle, and win the second ball.
- **Level 2, Sea Tunnel ("uphill", fuller version): combination play.** The one-two and staying set.

**Game fiction is labelled separately**, as in docs/fishing.md. The tunnels, the defenders and the crates are *Island story*. The
crate facts are *Real football fact*, with a plain-text source and no links.

## 3. Summit Isle's caves today, and what "after collecting the balls from the cave" should gate

### What exists (cited)

- **The two caves are data in `lib/town/summitBalls.ts:56-64`.** They are `SUMMIT_CAVES`, `hill` (Hillside cave, x 706, z 191, the
  mouth facing downhill) and `sea` (Sea cave, x 746, z 237, the mouth facing the nearest waterline). The shape constants are
  `CAVE_SIDE = 2.2`, `CAVE_BACK = 3.4` and `CAVE_BALL_IN = .9`.
- **They are built in `lib/town/summitIsleWorld.ts:401-445`.** Each cave is boulders baked into the island's existing sector prop
  pieces (no new draw call, no hole in the terrain). A dark rock fills the recess at `P(-2.3, 0)` (line 443), and a capstone covers
  only the back half, so the follow camera can see in. **That dark back rock is the natural tunnel mouth.**
- **Each cave holds one hidden ball** (`summitBalls.ts:115-123`). These are `summit-hill-cave` (concept `law4-shin-guards`) and
  `summit-sea-cave` (concept `law17-corner-goal`). Both are `kind:'hidden', loose:true`, sitting `CAVE_BALL_IN` in from the centre
  toward the mouth, so walking in collects them. They belong to the 115-ball hunt (`coinQuest.ts:115-119`, appended last for save
  order). They pay `LEARN_COINS.ball` = 12 once (`economy.ts:35`, `cardRewardTriggers.ts:23-28`) and count toward the costume
  milestones (`coinQuest.ts` `costumeUnlockBalls`).
- The two caves are about 61 m apart (hill is up the south-east slope, sea is on the south-east beach). **A tunnel joining them is
  geographically honest**: the Hill Tunnel runs downhill to the sea, and the Sea Tunnel climbs back up.

### Two readings of the request

1. **The tunnel unlocks once the cave's hidden ball is found** (recommended).
2. **The platformer is how you collect the cave balls.** Rejected:
   - It would move two of the 115 hunt balls behind a skill game.
   - A child who can't finish a platformer would be locked out of the Matchday Fox (every ball) and a costume milestone.
   - It would break `tests/summit-balls.cjs` and the save migration that keys on `SUMMIT_BALL_IDS`.
   - It would mix the hunt's unique, one-off balls with a repeatable game.

**Recommendation: gate each tunnel on its own cave's hidden ball** (`CoinProgress.collected` includes `summit-hill-cave` or
`summit-sea-cave`).

- Because the ball sits just inside the mouth, the gate costs the player nothing extra. It only orders the experience: hidden-ball
  lesson first, then the tunnel.
- The prompt reads "Enter the tunnel". Before the ball is found, the back rock shows the hint "Something round is in here. Find it
  first!"
- **The training balls in the platformer are a separate, repeatable count.** They never add to the 115 or to the milestones. The
  HUD calls them *training balls* so nobody confuses them with hidden balls.

## 4. How full-screen experiences load and how the island sleeps (cited)

| Pattern | Where | What it does | Fit for the tunnels |
|---|---|---|---|
| **Document boundary (route)** | `Town.tsx:225-228` (Konbini, Arcade), `:246` (Museum), `:250` (Kit Shop) | Save a departure (`saveIslandReturnPosition`, `lib/arcade/islandReturnPosition.ts:4-22`, tab-local `fi2-arcade-departure-v1`), `musicRef.setSceneActive(false)`, `stopIslandNarration()`, stop the move/truck loops (`leaveIslandSound`, `Town.tsx:224`), then `window.location.assign(url)` after 380 ms (120 ms with reduced motion). The whole island runtime is released by the browser. | **Best.** It guarantees "no island render while in the cave" on phones with zero cleanup risk. The user asked for "load separately". |
| Return | `next.config.mjs:28-31` rewrites `/?from=arcade\|konbini\|museum\|shop` to the static `/island-return`. `app/island-return/page.tsx` mounts `<Town returningFromArcade/>`. `Town.tsx:419` reads the departure, `:1515` shows `IslandReturnLoading`. | The island rebuilds at the saved spot, on foot, with the follow camera. | Add `cave` to the rewrite regex. The cave page writes the departure for the exit mouth before leaving (like `refreshShopDeparture`, `lib/shop/shopDoors.ts:47-51`). |
| First-byte colour | `app/shop/layout.tsx` (`html,body{background:…}`) | No white flash between the island and the room. | `app/cave/layout.tsx` paints the tunnel's dark rock colour. |
| In-island overlay that sleeps the island | Fishing focus (`globals.css:160` hides `.travel-actions`, `.touch-controls` …), dialogs via `settingsRef` (`Town.tsx:297`) | The island keeps its WebGL context and scene in memory, and the loop sleeps or throttles. | Rejected for the tunnels. The island's renderer, textures and audio graph stay resident (memory pressure on iPhone), and the "sleep" relies on every subsystem honouring the flag. |
| Arcade games | `components/games/*`, `lib/arcade/arcadeStage.ts:9-12` (a three.js `WebGLRenderer`, shadows, DPR ≤ 1.5) inside `/arcade` | Heavy 3D stage shared by the cabinets. | Not reused: the tunnels need no three.js at all. |
| Museum pixel exhibits | `penalty-1891/Cabinet.tsx:33,42` (`pixelFor`: 2–4 CSS px per buffer px), `pixeliso/Stage.tsx:8-17`, `pixeliso/loop.ts:1-12` | Crisp integer-scaled pixels, an on-demand draw, and a single rAF chain that stops at rest and parks when hidden. | **Reuse the method** (and possibly the code; see §8). |
| Riso films | `components/StoryFilmPlayer.tsx:17` ("one canvas, one Audio, 24 fps cap, DPR ≤ 1.5, sleeps when paused / hidden / offscreen"), the `tick` guard at `:75` | The sleeping-loop discipline. | Same guard shape: `if(disposed‖document.hidden‖!visible‖paused) return`. |
| Island Tutorial | `components/IslandTutorial.tsx:16-19` | Mounted by next/dynamic only on tap; no rAF; CSS loops pause when hidden. | The model for the controls tutorial card. |

**Recommendation: `/cave` as its own static route.**

- `app/cave/page.tsx` renders `components/cave/CaveGame.tsx`. The route *is* the code split: the island bundle never contains the
  game, and the cave page never imports three.js. A static-test guard enforces this (§12).
- The page reads `?in=hill|sea` on the client, the same way Town reads `?store=`, so it stays prerendered.
- A direct visit with no departure saved still works: exits fall back to the cave mouths.
- **Leaving, with the user's rule:**
  - **Finished:** depart from the *other* cave's mouth. Hill → sea exits at the sea cave; sea → hill exits at the hill cave.
  - **Done mid-level:** depart from the cave you entered.
  - The exit point is about 2.5 m out from the mouth, facing out, on foot, with the follow camera behind. This mirrors
    `shopExitPoint` / `shopDeparture` (`shopDoors.ts:40-45`). `tests/summit-balls.cjs`-style checks keep the point on walkable
    summit ground, outside the cave's boulder colliders and inside `FLIGHT_BOUNDS`.
- **The celebration:** before leaving, the cave writes a tab-local `fi2-cave-result-v1` record in sessionStorage
  (`{tunnel, balls, coins, cleared}`). Town reads it once after the return load and shows the existing coin toast plus a short
  "Tunnel cleared! 54 training balls" card. No new loop.
- **Island-side changes (small):**
  - A cave-mouth prompt in Town's door check (`Town.tsx:1105-1110` builds `nearMuseum`, `nearShop` …; the button pattern is
    `:1484`). Note that the `Math.abs(groundY)<1` test there assumes sea-level ground, so the cave check must compare against
    `summitGround` instead.
  - A `caveOpen` effect that copies the shop's (`:250`).
  - The tunnel-mouth art: a timber frame and a lantern baked at the back rock in `summitIsleWorld.ts:443`. It stays baked, so it
    adds no draw call. Only the prompt changes with the gate.
- **Controls hidden:** nothing to hide. The island's joystick and travel actions do not exist on `/cave`. The cave page has its own
  pads.

## 5. Existing pixel and character pieces we can reuse (cited)

- **Integer pixel scaling:**
  - `penalty-1891/Cabinet.tsx:33` snaps the canvas to whole buffer pixels and upscales with `image-rendering: pixelated`
    (`Cabinet.module.css:20`).
  - The `pixeliso` kit (`components/museum/experiences/pixeliso/`, kept as a reference kit since Oct 12, docs/museum-pixel-iso.md)
    has the following:
    - `fitGrid(availW, availH, min, max)`: the largest whole P that fits the `min` art, with the buffer growing to `max`.
    - `Pixmap`: an indexed buffer, Bayer dither and a pick buffer (`raster.ts:16-30`).
    - `createPlayLoop`: one rAF, 0 frames at rest, `setVisible` parking, a `fps` cap (`loop.ts`).
    - `palette.ts`: the Mega Drive 9-bit levels `00 24 48 6c 90 b4 d8 fc` and the `UI` colours.
    - `sprites.ts`: footballers as procedurally drawn character grids with letter keys (`h` hair, `s` skin, `L/j/J` shirt, `p/P`
      shorts, `o` socks, `b` boots, `k` outline). **This is exactly the graph-paper method.**
- **Breakaway runner** (`components/games/BreakawayRun.tsx`):
  - The keyboard map is at `:1109-1131`: ←/A and →/D lane, ↑/W jump, Space/B/↓/S boost, Esc/P pause. It listens on `window` with
    capture, skips editable targets and ignores repeats.
  - It reuses the island's fixed thumb control (`useJoystickBounds`, `paintJoystick`, `:1133-1145`).
  - Its exit is a `BackButton` (`:1194`).
  - `BreakawayRun.module.css:185-200` has a pixel-cut `clip-path` button.
- **The bean:**
  - `lib/town/customization.ts:10-16`: `bodyColor`, `skinTone`, `hair`, `hairColor`, `eyes`, `mouth`, `build`, `headwear`,
    `clothing`.
  - `beanLookFor()` (`:113-116`) and `playerOutfit()` (`:121-124`) turn these into hex colours: `shirt`, `shirt2`, `shorts`,
    `socks`, `socks2`, `boots`, number 10.
  - `lib/arcade/islandArcadePlayer.ts:15-16` shows how the arcade puts the player's own look in team colours (`teamedLook`).
- **Club kit colours** (`lib/town/costumes.ts:180`, `CLUB_KIT_COLOURS`): `body` / `accent` per club. A costume-wearing player's
  sprite can use `body` as the shirt and `accent` as the trim.
- **Synthesised sound:** `lib/arcade/passPuzzleAudio.ts` and `strikerAudio.ts` make all their sound with oscillators on one
  `AudioContext`, with capped voices and no files. Chiptune SFX fit that pattern directly.

## 6. NES-era technicals, and recreating the *feel* with our own numbers

### The hardware we are evoking (not copying)

- **Screen:** the NES outputs 256 × 240. NTSC TVs showed about 224 lines (overscan), so games kept their play area inside about
  256 × 224.
- **Tiles:** hardware tiles are **8 × 8**. SMB builds its levels from **16 × 16 metatiles** (four 8 × 8 tiles), and background
  palettes are assigned per 16 × 16 area. (The brief had these the other way round.)
- **Colour:** each sprite uses one of **4 sprite palettes of 3 colours plus transparent**. The background has **4 palettes** of 3
  colours plus a shared backdrop. At most 8 sprites per scanline and 64 in total.
- **Timing:** about 60 frames a second, fixed-step logic (one update per frame).
- **Our take:** keep 16-px tiles, a 224-px-tall level, chunky outlined sprites and a small palette per sprite. **Relax** the
  3-colour sprite rule to **at most 8 colours per sprite**, so the bean keeps hair, skin, body, eyes and a full kit. Draw every
  colour from one master palette: the Mega Drive 9-bit levels the penalty cabinet and pixeliso already use. The museum's pixel art
  and the tunnels then share one look.

### What makes SMB feel good (sources at the end of this section)

- **Momentum.** There are separate walk and run top speeds (SMB holds B to run), real acceleration, and a **skid** when you
  reverse. Speed carries into jumps, and air control is weaker than ground control.
- **Variable jump height.** Holding the button keeps gravity low while rising. Letting go (or reaching the apex) switches to a much
  stronger gravity, so a tap is a hop and a hold is a big arc. A running start jumps a little higher.
- **Falling faster than rising.** It feels snappy, not floaty.
- **Forgiving hitboxes.** The enemy hurt-boxes are smaller than the sprites.
- **Tile-perfect level geometry.** Gaps and stairs are sized to the jump.
- SMB has *no* coyote time or input buffering. **We add both for kids** (Celeste's "forgiveness" approach).

Approximate SMB values from the TASVideos SMB resource page (verify before quoting in-game):

- Walk top speed is about 1.5 px/frame and run top speed about 2.5 px/frame.
- Holding A while rising gives roughly a quarter to a third of the released gravity.

**We do not reuse these figures.** We tune our own from height and time, as Pittman recommends.

### Our numbers (original, tuned by playtest; 1 tile = 16 px, 60 Hz fixed step)

Jump maths (Pittman, GDC 2016): for a jump of height `h` reaching its apex in time `t`, gravity `g = 2h / t²` and launch speed
`v₀ = 2h / t`.

| Quantity | Value | Notes |
|---|---|---|
| Walk top speed | 5 tiles/s (80 px/s, 1.33 px/frame) | joystick past 30 % |
| Run top speed | 8.5 tiles/s (136 px/s, 2.27 px/frame) | joystick past 80 %, or hold Shift/X on a keyboard |
| Ground acceleration | 400 px/s² to walk, then 300 px/s² to run | walk speed reached in 0.2 s |
| Release friction / skid | 600 px/s² / 900 px/s² | a skid shows the skid frame and puffs dust |
| Air control | 65 % of ground acceleration | momentum is kept, so there is no skid in the air |
| Full jump | **4.25 tiles** (68 px), apex at **0.40 s** | g_rise = 850 px/s², v₀ = 340 px/s |
| Fall gravity | 1700 px/s² (2 × rise) | also applied the moment jump is released |
| Jump cut | on release, upward speed is clamped to 200 px/s | minimum hop ≈ **1.1 tiles** |
| Running jump | v₀ × 1.08 at run speed | ≈ 5 tiles high |
| Air time (full jump) | 0.40 s up + 0.28 s down ≈ 0.68 s | |
| Longest jump across | walking ≈ 3.4 tiles, running ≈ 5.8 tiles | **design rule: required gaps ≤ 70 %** (2 tiles walking, 4 running), always with a landing ledge |
| Terminal fall | 300 px/s (5 px/frame) | less than 1/3 tile per step, so nothing can pass through a tile |
| Coyote time / jump buffer | 0.1 s each (6 frames) | kid forgiveness |
| Corner correction | nudge up to 4 px round a ceiling corner | as in Celeste |
| Player collider | 10 × 20 px in a 16 × 24 sprite | |
| Defender hurt-box | sprite minus 3 px each side | |
| Ball pickup radius | 7 px | |
| Tackled | 0.6 s stumble, knocked back 1 tile, blinking | **no lives, nothing is lost** |
| Fall into the stream | splash, then back at the last corner flag after 0.8 s | |

**Sources:**

- TASVideos, "Super Mario Bros." game resources (NES/SuperMarioBros): movement and subpixel values.
- Kyle Pittman, "Math for Game Programmers: Building a Better Jump", GDC 2016.
- Steve Swink, *Game Feel* (Morgan Kaufmann, 2008).
- Maddy Thorson, "Celeste & Forgiveness" (2018): coyote time, jump buffering and corner correction.
- NESdev Wiki (PPU, palettes, OAM): hardware limits.

## 7. What the SMB 1-2 map teaches us (structure only)

Reading the attached map as structure, from left to right. **Our version** follows each point.

1. **An outside approach, then a way in.** The level begins above ground and you go in through a pipe. **Ours:** the real
   island cave mouth *is* the approach. Entering plays a short 8-bit "walk into the dark" transition (the mouth framed by our
   rock).
2. **A banded frame.** A solid ceiling band and a solid floor band make the world readable at once: you are underground.
   **Ours:** a granite ceiling band in rows 0–1 and a floor in rows 12–13. We use the summit cave tones
   (`summitIsleWorld.ts:437`: `#9b9e90 #878b7e #b1b3a6` hill, `#a39c8c #8e887a #b4ad9e` sea), snapped to the 9-bit palette.
   Moss, roots and lanterns sit on top. There are no blue bricks.
3. **A safe start.** The first screen has flat floor, no enemy, and blocks overhead that invite the first jump. **Ours:** 24 tiles
   with no defender. Two fact crates overhead teach "jump into it from below". One loose ball sits on a low step.
4. **Enemies in small groups on flat ground.** You learn a threat where nothing else is happening. **Ours:** the first Presser
   walks slowly on a flat run with a long run-up, so you can see it coming.
5. **Staircases that teach jump height.** Columns rise one tile at a time. **Ours:** rock *terraces*, like the summit's terrace
   banks, rising 1, 2, 3 and 4 tiles. The 4-tile step needs a full jump. A ball sits on every step, so the stairs draw you up.
6. **Pickup clusters that draw the path.** Coins sit where the designer wants you to go: arcs over jumps, pockets above
   platforms, rows along the safe line. **Ours:** training balls trace the route, as arcs over every Slider (the ideal hurdle
   line), rows along ledges and a little pocket behind a crate.
7. **Blocks you break or bump from below**, with hidden rewards. **Ours:** fact crates (a timber crate with a stitched-ball
   emblem, never a "?" mark). They bump, pop a "second ball" and show a fact. There are no breakable bricks in the MVP.
8. **Pipes as hazards and doors.** Some have a timed threat. **Ours:** stone *tunnel mouths* in the walls (horizontal culverts
   with a timber frame). Press ↓ (or the joystick down) to go in. No plant hazards. The timing hazard is the Slider's telegraphed
   tackle.
9. **The gap section with lifts.** Moving platforms over a pit. **Ours:** the *underground stream*. Mossy stepping stones and,
   in Level 2, a lowering bridge opened by the one-two. Falling in is a splash and a restart at the last corner flag: no death, no
   lava.
10. **The ceiling route.** Experienced players climb onto the ceiling band and run along the top past the exit, to a hidden room.
    **Ours:** *The Overlap*. Hidden root steps lead onto the roof, and a run along the outside drops you into the junction
    chamber's top gallery with a 10-ball bonus (fuller version).
11. **The end room with several exits.** It is a reward for exploring, and the choice itself is the reward. **Ours:** the
    *junction chamber*, with three tunnel mouths labelled DEFENCE · MIDFIELD · ATTACK. Each leads to a short room laid out in that
    line's shape. All lead out to the island, so there is no wrong answer, only a lesson (fuller version). In the MVP the level
    ends with the *players' tunnel*: a short walk up toward daylight and a crowd murmur, then you are out at the other cave.

## 8. Rendering crisp pixels on the web

- **One canvas whose buffer is the art.** The canvas element is `buffer × P` CSS px, with `image-rendering: pixelated` (plus
  `crisp-edges` as a fallback), and `imageSmoothingEnabled = false` on the 2D context.
- **Choosing P per device pixel, not per CSS pixel.** Compute `Pdev = floor(availH × dpr / 224)`, clamped to at least 2 × dpr.
  Size the canvas element to `buffer × Pdev / dpr` CSS px. On a DPR 2.625 Android phone, a whole CSS P would still land on uneven
  device pixels. This rule keeps every art pixel the same size. On an iPhone (DPR 3), P = 2 CSS is simply 6 device px.
- **Buffer size (the pixeliso `min/max` rule):**

  | Device | Buffer | Scale | Notes |
  |---|---|---|---|
  | Portrait phone (390 × 844) | **192 × 224** | P = 2 | 384 × 448 CSS. The whole level height is visible and there is no vertical scroll. 12 tiles across. |
  | Landscape phone (844 × ≈340 visible in Safari) | ≈ 400 × 168 | P = 2 | The camera follows vertically with a dead zone. 25 tiles of look-ahead. |
  | Desktop (1440 × 900) | 400 × 224 | P = 3 | 1200 × 672 CSS |

  **Design rule:** everything a child must react to reads inside 12 × 10 tiles around the player, with the camera leading
  8 tiles ahead (the player is held at about 1/3 from the left while moving right). At run speed that is about 1 s of warning.
- **Snap the camera to whole art pixels** every frame: `camX = Math.round(targetX)`. Sprites are drawn at `Math.round(x - camX)`.
  Physics stays in floats, and only the draw is rounded. This avoids the shimmer of sub-pixel scrolling.
- **Pre-baked art, cheap frames.**
  - At load, each sprite grid is turned into a small offscreen canvas (or an `ImageBitmap`) *in the player's colours*, once.
  - The tilemap is pre-rendered into strips 256 px wide (each strip about 230 KB, well under iOS canvas memory limits).
  - Each frame then draws 1–2 strip slices, about 10–30 sprites, and a few animated tiles (lantern flicker every 8 frames, the
    stream's 2-frame ripple). Around 40 `drawImage` calls in all, with no `putImageData`.
  - The alternative, the pixeliso `Pixmap` (indexed buffer → RGBA → `putImageData`, about 90 k pixels a frame), also works. It
    costs more CPU per frame and needs no art bake. **Recommendation: pre-baked bitmaps.** Keep `Pixmap` for tests (render a
    frame in Node and compare).
- **HUD in the DOM, not the canvas** (the pixeliso rule: "anything a child must read goes in the DOM HUD"). The training-ball
  count, the flag count and fact cards are DOM, updated only when they change. The fact card is a dark see-through card in the
  existing modal style. The only text inside the canvas is short glyph numbers on the scoreboard sign at the exit.

### The graph-paper method

Each sprite is a text grid, one character per pixel. An artist draws it on 16 × 24 graph paper with a colour key and types it in.
`lib/cave/sprites.ts` holds the grids. `lib/cave/palette.ts` maps keys to colours per player.

**Key:**

| Key | Meaning | Key | Meaning |
|---|---|---|---|
| `.` | transparent | `k` | outline |
| `h` | hair | `b` | bean body colour (top of head, arms, legs) |
| `s` | face panel (skin) | `e` | eye |
| `r` | blush | `J` | shirt |
| `n` | shirt trim / number (`shirt2`) | `p` | shorts |
| `o` | socks | `O` | sock band (`socks2`) |
| `f` | boots | `w` | ball white |
| `g` | ball shade | | |

**The bean, idle, facing right (16 × 24).** Rendered and checked; it reads as the island bean in a red home kit.

```
................
.....kkkkk......
....khhhhhkk....
...khhhhhhhhk...
...khhhhhhhhhk..
..kbhhhhhsssshk.
..kbbhssssssssk.
..kbbsssesssesk.
..kbbsssesssesk.
..kbbssssssssk..
..kbbsssssrrsk..
..kbbbssssssbk..
..kbbbbbbbbbbk..
..kJJJJJJJJJnk..
..kJJJJJJJJJnk..
.kbkJJJJJJJJkbk.
.kbkJJJJJJJJkbk.
..kkppppppppkk..
...kppppppppk...
...kbbk..kbbk...
...kook..kook...
...kOOk..kOOk...
..kfffk..kfffk..
..kkkkk..kkkkk..
```

**A training ball (12 × 12 inside a 16 × 16 cell).** A dark centre panel, partial panels on the rim, and shade on the
lower right.

```
................
................
......kkkk......
....kkwkkwkk....
...kwwwkkwwwk...
...kwwwwwwwwk...
..kkwwwkkwwwgk..
..kkkwkkkkwggk..
..kkwwkkkkwwgk..
..kwwwwkkwwwgk..
...kwwwwwwwgk...
...kkwwwwwggk...
....kkkwwgkk....
......kkkk......
................
................
```

**How the player's colours map in.** At load, `palette.ts` builds the per-player colour table:

- `b` ← `beanLookFor(c).body`, `s` ← `.skin`, `h` ← `.hair.color`, `r` ← `.blush`.
- `J/n/p/o/O/f` ← `playerOutfit(c)`: `shirt`, `shirt2`, `shorts`, `socks`, `socks2`, `boots`.
- Wearing a club costume: `J` ← `CLUB_KIT_COLOURS[id].body`, `n` ← `.accent`.
- Every colour is snapped per channel to the nearest Mega Drive level (`MD_LEVELS`). Two keys that snap to the same colour as their
  neighbour (for example a navy shirt on a navy body) get one-level-lighter shading, so the silhouette never merges.
- Hair styles (crop, tuft, curls, ponytail, bun, puffs, long, none) are 4–6 row *overlays* on the head rows. Headwear (cap,
  beanie, headband, keeper) is one more overlay. That gives 8 + 4 small grids, not a grid per combination.
- `build` changes the frame height (short 22 rows, regular 24, tall 24 with a 1-px longer torso, wide 18 px wide).
- **Defenders** are the same bean grid in the *rival* kit: the away kit if the player wears home, and the other way round.
  Each gets a fixed rival hair and skin set, so they read as "the other team" at a glance.

**The frame list** (each is a grid):

- idle (2-frame breathing)
- run (4)
- skid (1)
- jump up (1) and fall (1)
- header (1: head forward, eyes shut)
- tackled stumble (2)
- celebrate (2: arms up)
- enter tunnel (1: back view)

Defenders: walk (2), slide telegraph (1), slide (1), turn (1). Rival striker (fuller version): wind-up, feint, shot.

**Tiles (16 × 16 grids, original):**

- granite block (2 variants) and moss-topped ledge (one-way platform)
- root steps (secret)
- timber prop beam
- lantern (2 frames)
- stone tunnel mouth (2 × 2 tiles)
- fact crate, and the plank it becomes once bumped
- corner flag (planted / unplanted)
- stream water (2 frames)
- rebound board and switch (fuller version)
- the junction-chamber signs (DOM-labelled)

**One background palette per area, 4 colours each:** hill granite, sea sandstone, moss and roots, water. No lava anywhere.

## 9. Controls

| Action | Phone | Keyboard | Gamepad (optional) |
|---|---|---|---|
| Move | Left thumb: **the island's joystick** (`useJoystickBounds` + `paintJoystick`, as Breakaway does), horizontal only. Past 30 % walks, past 80 % runs. | ← → / A D. Hold **Shift** or **X** to run. | D-pad / left stick |
| Jump (hold for higher) | Right thumb: big **JUMP** pixel button | **Space**, ↑, W, Z | A (south) |
| Kick (fuller version: wall pass) | Second right button **KICK** | **J** or **C** (J is the island's ball key) | X (west) |
| Enter a tunnel mouth | Push the joystick down | ↓ / S | down |
| Pause | – (Done is always there) | **Esc** / P (Breakaway's keys) | Start |
| Leave | **Done**, top right | – | – |

- **Conventions kept:**
  - Keys are captured on `window` and ignored when the target is editable, as in Breakaway (`:1111-1121`).
  - `preventDefault` on arrows and Space.
  - Held buttons use pointer capture and `-webkit-touch-callout:none` / `user-select:none` (device guard 1).
  - Buttons are at least 44 px (guard 3), and the fixed bars use `env(safe-area-inset-*)` (guard 5).
  - The overlay uses `inset:0`, never `100dvh` (guard 2). The design passes the guards with no allowlist entries.
- **Buttons:**
  - The island's gold paper buttons (`--btn-gold`, `--btn-rim`, `--btn-press` tokens, `app/globals.css:561-562`) with the pixel
    corner cut from `BreakawayRun.module.css:185-200`.
  - The press is the shared `translate: 0 var(--btn-press)` (`DoneButton.module.css`).
  - **Done** is the shared `DoneButton` (`components/DoneButton.tsx:8-33`: `data-navigation="done"`, the label collapses to the
    check icon over 240 ms, then `onDone`), placed `position:fixed; top: max(12px, env(safe-area-inset-top)); right: max(12px,
    env(safe-area-inset-right))`.
  - `onDone` stops the loop and audio, credits the run, writes the departure and result, and calls
    `location.assign('/?from=cave')`. There is no "are you sure" step: "exit out anytime".
- **Gamepad API** is polled inside the same rAF tick, only while playing. No polling timer.
- **Teaching the controls:** a first-time card per device (DEVICE key `fi2-cave-tutorial-v1`), following `FishingTutorial.tsx:1-12`.
  The dotted "ghost hand" shows the gesture on the joystick, then on JUMP, then "hold for a higher jump". DOM and one-shot CSS
  only. It ends on the first fact crate bumped, or on Skip.

### Layouts

**Portrait phone (recommended design target; both orientations supported):**

```
┌──────────────────────────────┐
│ ⚽ ×12   ⚑ 1/3        [Done] │  DOM HUD + DoneButton (top right)
│┌────────────────────────────┐│
││   ▓▓▓▓▓▓ ceiling ▓▓▓▓▓▓▓▓▓ ││
││        [▣]   o o o         ││  192 × 224 art px at P = 2
││   ⚽         ▀▀▀▀▀          ││  (384 × 448 CSS)
││  ☺→      ▄▄       ☻←       ││
││ ▓▓▓▓▓▓▓▓▓▓▓▓ floor ▓▓▓▓▓▓▓ ││
│└────────────────────────────┘│
│                              │
│    ( ◉ )              (JUMP) │  island joystick      gold pixel buttons
│   joystick            (KICK) │  (left thumb)         (right thumb)
└──────────────────────────────┘
```

**Landscape phone:**

```
┌──────────────────────────────────────────────────────────┐
│ ⚽ ×12  ⚑ 1/3                                     [Done] │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ceiling ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ≈ 400 × 168 art px at P = 2,
│      [▣]  o o o        ▄▄▄       o o                     │  vertical camera follow
│ ( ◉ )   ☺→      ▀▀▀▀       ☻←          ⚑         (JUMP) │  pads see-through over the
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ floor ▓▓▓▓▓▓▓ ~~~ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  dark edges        (KICK)
└──────────────────────────────────────────────────────────┘
```

**Recommendation:** support both and never force a rotation. Design the level for the portrait window. It is the stricter view,
it keeps the thumbs off the art, and it is how the island is often held. Landscape then gets 2 × the look-ahead for free. A
portrait player sees a one-time line: "Tip: turn your phone for a wider tunnel."

## 10. Flow

1. On Summit Isle, walk into the hillside cave. You collect `summit-hill-cave` and its lesson card shows (existing behaviour).
2. Stand at the back rock. The prompt "Enter the tunnel" appears. Tap it, press E, or press Enter.
3. Town saves the departure *at this cave's mouth* and quiets music, narration and loops (the shop recipe). After 380 ms it goes to
   `/cave?in=hill`.
4. `/cave` paints dark rock from the first byte (layout) and loads its chunk (no three.js), with a pixel "Into the tunnel…" card.
   - The sprites are baked in the player's colours.
   - A 0.6 s iris-in shows the bean walking in from the left out of a tunnel mouth.
5. Play. Done is always top right.
   - **Done mid-level:** balls collected so far are kept and paid (§11). You return to the *entry* cave.
   - **Finish:** at the end, the players' tunnel walk-out plays (0.8 s; skipped with reduced motion). You return at the *other*
     cave's mouth (the sea cave). The island loads with `IslandReturnLoading` and shows the result card.
6. **Sea cave → Sea Tunnel** in the fuller version. In the MVP, the sea cave's tunnel plays the same level (labelled "Training
   Tunnel"), and finishing exits at the hill cave. The exit rule holds both ways.

## 11. Economy, saves and analytics

### Coins (consistent with docs/economy.md and lib/economy.ts)

- **Learning stays the best pay.**
  - A lesson quiz pays about 4.7 coins a minute and a hidden ball about 3.4 (docs/economy.md §4).
  - Every repeatable grind is at or below about 3.2: jobs median 3.2, fishing 2.5, Summit Kick 2.0 (a round pays at most 8:
    `economy.ts:137-139`, `summitKick.ts:102-111`).
- **Proposed numbers** (`lib/economy.ts`, new `CAVE` block):
  - `CAVE_COINS = {perBalls: 10, finish: 2, allBalls: 1, runCap: 10, paidRunsPerDay: 3}`.
  - **1 coin for every 10 training balls**, plus **2 for reaching the exit** and **1 for every ball in the level**, capped at
    **10 a run**.
  - A level has about 60 field balls plus 6 crate balls (about 76 with the fuller version's secret), so a full clear pays
    6–7 + 2 + 1 ≈ 10.
  - A clear takes about 3–4 minutes, so the best case is about **2.5–3.3 coins a minute**: under a hidden ball and well under a
    lesson.
- **Metered.**
  - Runs are island wallet runs `cave-run:<tunnel>:<nonce>`, credited once at exit (idempotent `creditRun`).
  - Add `cave-run:` to `TRAINING_ISLAND_RUN` (`dailyMeter.ts:20`), so the Training meter (40 full / 80 half, then a 1-coin tip)
    applies.
  - The first `paidRunsPerDay` runs a day pay. Later runs earn the meter's 1-coin thank-you, and the game is still fully playable.
  - The 10-coin cap is under the wallet's `ARCADE_COIN_CAPS.island = 20` save clamp (`economy.ts:144`).
- **One-off learning rewards (never metered):**
  - The first clear of each tunnel: `learn:explore:cave-hill` / `cave-sea` = `LEARN_COINS.explore` (5).
  - Finding The Overlap the first time: `learn:explore:cave-overlap` (5, fuller version).
- **Free to play.** It is exploration, not an arcade machine: no `ARCADE_PLAY_COST`.
- **Training balls never touch `CoinProgress`.** The 115 hunt, the costume milestones and the Matchday Fox are unchanged.

### Saves

- **`fi2-cave-v1` (SYNC key; add it to `SYNC_KEYS`, `lib/saves/snapshot.ts:16-54`):**
  - `{cleared: {hill, sea}, best: {hill: {balls, ms}, sea: …}, overlap: boolean, factsSeen: string[], paid: {day, runs}}`.
  - `paid` is synced so a second device can't reset the daily runs (the `fi2-market-v1` precedent).
- **The per-level best** could instead ride `fi2-arcade-record-cave-hill-v1`. That matches `ARCADE_RECORD_KEY`
  (`snapshot.ts:54`), so it syncs automatically and could feed a leaderboard later. However, `readArcadeRecord` clamps `unlocked`
  to 1–6 and has no time field (`arcadeRecords.ts:1-9`). **Recommendation: one `fi2-cave-v1` key.**
- **DEVICE key `fi2-cave-tutorial-v1`:** the controls card seen.

### Analytics (`lib/analytics/tracker.ts:96` `count()`; fixed ids only)

- Add to `SUMMIT_COUNT_EVENTS` (`countIds.ts:62-71`, `su:` prefix):
  - `cave_enter_hill`, `cave_enter_sea`
  - `cave_clear`, `cave_done` (left with Done)
  - `cave_fact` (crate opened), `cave_overlap`, `cave_tackled`
- Optionally add a `cave` activity id for time spent. Like the summit place ids (`islandIds.ts:22-23`), it needs its allowlist
  migration before it counts.
- **Totals only**, never which crate or where.

### Fact crates (examples; short, kid-safe, no links; the source is shown as plain text)

| Fact | Source |
|---|---|
| A goal only counts when the whole ball crosses the whole goal line. | IFAB Laws of the Game, Law 10 |
| A match is two halves of 45 minutes. | Laws of the Game, Law 7 |
| The penalty mark is 11 metres from the goal line. | Laws of the Game, Law 1 (matches the penalty-1891 exhibit) |
| A full-size ball is 68 to 70 cm round. | Laws of the Game, Law 2 |
| You can't be offside straight from a throw-in, a goal kick or a corner. | Laws of the Game, Law 11 |
| At a penalty, the keeper keeps part of one foot on the goal line until the kick. | Laws of the Game, Law 14 |
| Young players head the ball less: US Soccer says no heading for players aged 10 and under. | US Soccer, 2015 concussion guidance (verify the current wording) |

## 12. Heat and performance

- **No island while in the tunnel.** The route boundary frees the island's WebGL context, scene, textures and audio graph. `/cave`
  creates **no WebGL context**: one Canvas2D, about 40 `drawImage` calls a frame, and DOM updates only on change.
- **One rAF chain** (the pixeliso `createPlayLoop` shape):
  - A fixed 60 Hz simulation with an accumulator (at most 4 catch-up steps, then the backlog is dropped).
  - Render at most 60 fps: on 120 Hz screens, skip every other frame.
  - If the heat tier or a frame-time governor says "slow", **render at 30 fps while still simulating at 60**. The feel is kept.
- **Sleeps:**
  - On `visibilitychange` / `pagehide` / `blur`: the loop parks (0 rAF) and the `AudioContext` suspends.
  - The pause screen and the fact card (it pauses the game the first time a fact is read; later reads are a 3 s toast) give
    0 rAF.
  - Reduced motion removes the iris, the walk-out and screen shake. The game itself stays playable.
- **No per-frame allocation:**
  - Entities live in fixed pools (defenders ≤ 8 active, balls in a typed array with a `taken` bitset).
  - The tilemap is a `Uint8Array`, and collision reads it directly.
  - Sprite bitmaps are baked once and colours are never recomputed in the loop.
- **Audio:** synthesised square and noise SFX on one context with capped voices (the `passPuzzleAudio.ts` pattern): jump, ball,
  crate, flag, splash, tackle, cheer. Music is off in the MVP (decision 7).
- **Estimate (to be measured, not claimed):**
  - The island in the same area measures about 13–15 % main-thread busy at 4× throttle, 3.6 CPU ms/frame, about 100–180 draws and
    30 fps (docs/performance-guide.md heat table, "Summit: trail walk" and "Summit Kick round").
  - The tunnel should sit nearer the museum hall walking row (1.5 % busy): roughly 1–3 % busy at 4× and well under 1 ms CPU a
    frame, at 60 fps, with a trivial GPU composite.
  - Measure with the same harness and record in the performance guide. **No iPhone cooling claim without a device trace.**
- **Load:** an estimated 25–45 KB gzipped for the game chunk (engine, levels as text and sprite grids), with no images or audio
  files. The return trip pays one island rebuild (the existing `IslandReturnLoading` path), which the user accepted with "load
  separately".

## 13. Copyright: what we avoid and what is fine

**Avoid (Nintendo's protected expression and marks):**

- Mario, Luigi or any look-alike (a red cap, a moustache, overalls).
- Goomba, Koopa, Piranha Plant, Bullet Bill, Lakitu, Bowser or any look-alike.
- The "?" block art, the SMB brick and ground tiles, the 1-2 blue palette, the pipe art (a green cylinder with a lip), the
  flagpole-and-castle ending, mushrooms, fire flowers, stars and 1-UPs.
- The words "Warp Zone", "World 1-2", "1-UP" and "Thank you".
- Any music or sound effect that resembles theirs (the underground theme, the coin "ding", the jump "boing", the pipe sound).
- Any tile-for-tile or screen-for-screen level layout. The attached map informs only the *pacing ideas* in §7.

**Fine (genre ideas and mechanics):**

- Side-scrolling, running and variable-height jumping.
- Blocks bumped from below, collectables that trace a path, tunnels as transitions, hidden routes and bonus rooms.
- An end room with a choice, checkpoints, and pixel art itself.

**Why:**

- US copyright protects expression, not ideas, procedures or methods (17 U.S.C. §102(b)). *Data East v. Epyx* (9th Cir. 1988):
  similarities that come from the genre (karate moves) did not infringe.
- But *Tetris Holding v. Xio* (D.N.J. 2012) found the *look* of a game protectable when it is copied closely. *Spry Fox v.
  LOLApps* (W.D. Wash. 2012) let a clone claim proceed on its expressive details.
- So the risk is in copying art, sound, names and layouts, which we don't do. (Not legal advice. Have someone with legal training
  look before release if the user wants certainty.)

**Our own vocabulary:** Training Tunnels, training balls, fact crate, tunnel mouth, corner flag, Presser, Slider, The Overlap,
junction chamber, players' tunnel. **A test greps** the cave sources for Nintendo names (§14).

## 14. Scope, files and tests

### MVP (about 9 dev days)

**Contents:**

- One level ("Training Tunnel", about 160 tiles, 14 rows) entered from either cave, exiting at the other.
- Run, jump (variable), header-bump.
- One defender type (the Presser, which walks and turns at ledges). The Slider is optional if the time allows (+0.5 day).
- Training balls, 6 fact crates, 3 corner flags, the stream gap, and the players'-tunnel exit.
- The DOM HUD, Done, pause, the controls card, and synthesised SFX.
- The best (balls and time) saved, metered coins, analytics, the island prompt and gate, the return celebration.

| Work | Days |
|---|---|
| Engine: fixed step, tile collision, jump, coyote and buffer, camera | 2 |
| Sprites and palette: bean grids, hair overlays, kit mapping, tiles, the bake | 1.5 |
| Level design as a text map, plus the solvability test | 1.5 |
| Route, page, HUD, controls, Done, sleep, departure and return, island prompt and gate, tunnel-mouth art | 2 |
| Economy, save, analytics wiring | 0.5 |
| Tests, device guards, heat measurement | 1 |
| Feel pass and SFX | 0.5 |
| **Total** | **9** |

### Fuller version (about +10 days)

| Work | Days |
|---|---|
| Level 2 (Sea Tunnel) | 2 |
| Kick and wall pass (board, switch, bridge) | 1.5 |
| Slider and the keeper room | 1.5 |
| The Overlap and the bonus "boot room" | 1 |
| Junction chamber and the three line rooms | 1 |
| Time-attack best and the result card | 0.5 |
| Celebration frames, art pass, lantern and water animation | 1.5 |
| Optional original chiptune loop | 1 |

### New files

| File | Contents |
|---|---|
| `lib/cave/engine.ts` | Pure fixed-step physics, tile collision and the entity pools (runs in Node) |
| `lib/cave/tilemap.ts` | Text-map parser and tile kinds |
| `lib/cave/levels/trainingTunnel.ts` | MVP level |
| `lib/cave/levels/seaTunnel.ts` | Fuller version |
| `lib/cave/sprites.ts` | Graph-paper grids |
| `lib/cave/palette.ts` | 9-bit snap, player and rival colour tables |
| `lib/cave/render.ts` | Bake and draw |
| `lib/cave/facts.ts` | Crate facts with sources |
| `lib/cave/caveDoors.ts` | Mouths, exit points, departure, `CAVE_URL`, `CAVE_RETURN_URL = '/?from=cave'`, `tunnelOpen(progress, id)` |
| `lib/cave/caveRun.ts` | Coins for a run, run ids, the daily paid-run count (numbers from `lib/economy.ts`) |
| `lib/cave/caveStore.ts` | `fi2-cave-v1` |
| `lib/cave/caveAudio.ts` | Synthesised SFX |
| `components/cave/CaveGame.tsx` + `.module.css`, `CaveControls.tsx`, `CaveHud.tsx`, `CaveTutorial.tsx` | The page's game, controls, HUD and tutorial card |
| `app/cave/page.tsx`, `app/cave/layout.tsx` | The route and its first-byte colour |

**Small edits to existing files:**

- `next.config.mjs:31` (add `cave` to the regex)
- `components/Town.tsx` (prompt, `caveOpen` effect, result card)
- `lib/town/summitIsleWorld.ts:443` (tunnel-mouth art)
- `lib/economy.ts` (`CAVE_COINS`)
- `lib/town/dailyMeter.ts:20` (`cave-run:`)
- `lib/saves/snapshot.ts` (`fi2-cave-v1` SYNC, `fi2-cave-tutorial-v1` DEVICE)
- `lib/analytics/countIds.ts` (events)

### Level text-map format (an original example: the safe start)

**Legend:**

| Char | Tile | Char | Tile |
|---|---|---|---|
| `#` | granite | `=` | moss ledge (one-way) |
| `o` | training ball | `C` | fact crate |
| `F` | corner flag | `p` | Presser |
| `T` | tunnel mouth | `@` | start |
| `~` | stream | `L` | lantern |

Every row is the same width. There are 14 rows.

```
########################################
########################################
                                        
        L               L               
                                        
            C   C                       
                                o o     
                              =====     
                    o                   
                   ###        ###       
 @        o       #####      #####    F 
                 #######    #######     
########################################
########################################
```

### Tests (plain node, like `tests/fishing-fight.cjs`)

- **`tests/cave-physics.cjs`:**
  - Tap, full and running jump heights and time-to-apex are within ±3 % of the table.
  - Coyote and buffer windows are exactly 6 frames.
  - No tunnelling at terminal speed.
  - Corner correction works.
  - A recorded input script replays to the identical end state (determinism).
- **`tests/cave-levels.cjs`:**
  - Every row has the same width, there are 14 rows, and only legend characters appear.
  - A start and an exit exist.
  - The safe start has no defender within 24 tiles.
  - There is a flag at least every 40 tiles.
  - Every required gap is ≤ 70 % of the walking or running reach.
  - **Solvability:** a breadth-first search over standable cells uses the engine's own jump envelope (or brute-forces short input
    sequences through `engine.ts`). It proves start → exit, and that every ball and crate is reachable.
  - Every fact has a source.
  - **The Nintendo-name grep** (mario, luigi, goomba, koopa, piranha, warp zone, 1-up, mushroom, bowser) finds nothing in
    `lib/cave`, `components/cave` or `app/cave`.
- **`tests/cave-heat.cjs` (static):**
  - Nothing under `app/cave`, `components/cave` or `lib/cave` imports `three`.
  - Exactly one `requestAnimationFrame` site.
  - A `visibilitychange` / `pagehide` handler that parks it.
  - No `setInterval`.
  - The canvas buffer does not scale with DPR.
  - The audio context suspends on hide.
- **`tests/cave-economy.cjs`:**
  - A full clear pays ≤ `runCap` ≤ `ARCADE_COIN_CAPS.island`.
  - `isTrainingRun('cave-run:…','island')` is true.
  - Best-case coins a minute < the hidden ball's 3.4.
  - Training balls never change `CoinProgress`.
- **`tests/cave-doors.cjs`:**
  - Exit points are on walkable summit ground, outside the cave colliders and inside `FLIGHT_BOUNDS`.
  - `validIslandReturnPosition` accepts them.
- **`tests/device-guards.cjs`** runs unchanged, with **no allowlist entries** added.

## 14b. Decisions and power-ups (user, Oct 15 2026) — what was built

**Decisions (final):** 1 gate on the cave's own hidden ball (`lib/cave/caveDoors.ts` `CAVE_GATE_MODE='own'`); 2 one level played
from both caves, exiting at the other (`lib/cave/levels/tunnel1.ts`, `level.ts` `start`/`exit` per cave); 3 both orientations,
portrait-first, never a forced rotation (`components/cave/CaveGame.module.css`); 4 blocks are hit with a **foot flick-up**, never a
header (`engine.ts` `RULES.FLICK_NOT_HEAD`; no header frame exists in `sprites.ts`); 5 coins metered as `cave-run:` island runs,
1 per 10 training balls + 2 for the exit, max 10 a run, 3 paid runs a day, then the meter's 1-coin thank-you (`lib/economy.ts`
`CAVE_COINS`), and the first clear is a celebration card, not coins; 6 no lives (corner flags); 7 SFX only; 8–9 names and the
Mega Drive palette as recommended.

**Power-ups (user: "the character needs to shrink and grow, shoot flaming soccer balls", "follow the same game dynamics").**
Three states, `RULES.POWER_UPS`:

| State | Sprite | Collider | How | Lose it |
|---|---|---|---|---|
| SMALL | 16 × 16 | 10 × 14 | the start | a hit sends you back to the last corner flag (no lives counter) |
| BIG ("grown") | 16 × 32 | 10 × 28 | the **Half-time orange** (`G` crate): "A slice of orange at half time: you grow big and strong." | a hit → SMALL, 1.5 s blink |
| FIRE | BIG + `FIRE_SWAP` kit | 10 × 28 | the **Fire boots** (`H` crate): "Press the kick button to fire flaming training balls." | a hit → BIG |

Items emerge the classic way (rise out of the flicked crate over 32 frames, uncollectible until out, then move along the ground,
bouncing off walls). Flaming balls (X/Z/J/C or KICK; pooled, 2 at most) bounce along the floor and knock a Presser out; landing
on a Presser from above knocks it out too ("tackle from above: time your jump", `RULES.STOMP_KO`). Falling in the stream = back to
the last flag. Every flag is a checkpoint; the first flag is the start. Island story, labelled as such; the facts are real.

**Tracking (`lib/analytics/countIds.ts` `CAVE_COUNT_EVENTS`, prefix `cv:`; call sites `lib/analytics/caveEvents.ts`; admin
section `app/admin/CaveSection.tsx`; the `/cave` page is its own area `cave` with activity `cave_tunnel`, migration
`supabase/migrations/20261017_analytics_cave.sql`):** `enter_hill` `enter_sea` `start` `finish` `done` `balls` (sum per run)
`crate` `fact` `grow` `fire` `shot` `ko` `stomp` `hit` `return` `time_s` (whole seconds, finished runs) `coins` (paid). Totals only.

**Files:** `lib/cave/{types,engine,level,render,input,caveAudio,caveDoors,caveRun,caveStore,facts}.ts`, `lib/cave/levels/tunnel1.ts`,
`lib/cave/{sprites,palette,spriteBake}.ts` (art agent), `components/cave/CaveGame.tsx` + `.module.css`, `app/cave/{page,layout}.tsx`,
tests `tests/cave-{physics,level,economy,return,heat,sprites}.cjs` (+ `cave-harness.cjs`). Small edits: `next.config.mjs`,
`components/Town.tsx` (cave prompts + `caveOpen` effect), `lib/economy.ts`, `lib/town/dailyMeter.ts`, `lib/saves/snapshot.ts`,
`lib/analytics/{countIds,overview,core,tracker,islandIds}.ts`, `app/admin/AnalyticsDashboard.tsx`. Not built in the MVP: the
tunnel-mouth art baked into the island cave, the island-side result toast (the celebration shows in the cave before leaving), hair
styles / headwear / builds on the sprite, the controls ghost-hand card (a one-time text hint instead), gamepad.

## 15. Open decisions for the user

1. **Gate:** open each tunnel when *that* cave's hidden ball is found (recommended), or only after *both* cave balls are found,
   or no gate at all?
2. **MVP direction:** one level played from either cave, exiting at the other (recommended), or only the Hill Tunnel in the MVP
   with the sea cave's tunnel opening later?
3. **Orientation:** support both with a portrait-first design (recommended), or require landscape?
4. **The header and youth heading rules:** keep the genre's head-bump with the heading fact on the first crate (recommended), or
   make the bump a *chest* bump or a *flick-up* with the foot, given the youth heading guidance?
5. **Coins:** metered, 1 per 10 training balls plus 2 for the exit, at most 10 a run, 3 paid runs a day (recommended), or no
   coins at all (only the one-off explore reward)?
6. **Failure:** no lives, with corner-flag checkpoints and a tackle that only knocks you back (recommended), or classic lives?
7. **Music:** SFX only in the MVP (recommended), or an original chiptune loop from day one?
8. **Names:** "Training Tunnels", "Hill Tunnel" / "Sea Tunnel", "training balls": keep them, or pick others?
9. **Palette:** reuse the Mega Drive 9-bit palette shared with the penalty cabinet (recommended), or a separate NES-style palette
   for a more "8-bit" look?
10. **Fuller-version order:** the wall pass and keeper room first (the teaching depth), or the secret Overlap and the junction
    chamber first (the exploration)?

## Sprites, Oct 15 2026

**Built** (art agent): `lib/cave/sprites.ts`, `lib/cave/palette.ts`, `lib/cave/spriteBake.ts`, `scripts/cave-sprite-sheet.cjs`,
`tests/cave-sprites.cjs`. All art is original; the test greps the sources for Nintendo names.

- **Format.** Each sprite is a literal text grid in `sprites.ts`, one character per art pixel, as typed from graph paper. `.` is
  transparent; every other character is a palette slot from `lib/cave/types.ts` (`BEAN_KEYS`, `TILE_KEYS`, `ITEM_KEYS`), coloured
  at bake time, so one grid serves every player. Characters face right and carry an anchor (`ax`, `ay` = the bottom outline row
  between the feet). Sizes: BIG player 16 × 32 and SMALL player 16 × 16 (idle 2, run 4, skid, jump, fall, flick, stumble 2,
  celebrate 2, enter, grow, shrink); defender 16 × 24 (walk 2, turn, out, plus `DEFENDER_SQUASH`); tiles and items 16 × 16; the
  flaming ball 8 × 8 (4 frames); the tunnel mouth is 2 × 2 tiles, or 2 × 3 with `tunnelML/MR` for the 32 × 48 mouth. Extras beyond
  the contract are in `TILE_PROPS` (ceiling, floor, back wall, net scrap, crate popping, tall 2-frame flag 16 × 32, rolling ball
  ×4, HUD ball and flag 8 × 8) and `ITEM_PROPS` (each item's second bob frame).
- **Palette.** Every colour is on the Mega Drive 9-bit levels (`snapHex`, the pixeliso rule). Scenery keeps the NES rule: each
  tile uses one 3-colour palette from `TILE_GROUPS` (rock, moss, water, lantern; plus the prop palettes stone, crate, flag and
  ball) with the shared outline `k` and cave depth `d`. Hill granite is a cool slate and sea sandstone a warm brown
  (`TILE_TABLES`, `CAVE_BACKDROP`). Characters use the doc's full bean key (up to 12 slots), not 3 colours, so the bean keeps its
  hair, skin, body and whole kit.
- **Recolour.** `playerTable(custom)` reads `beanLookFor` and `playerOutfit`; a club costume's `CLUB_KIT_COLOURS` body and accent
  become the shirt and trim; hair style `none` uses the body colour. The fallback is `DEFAULT_CUSTOMIZATION`. Keys that touch are
  moved one level apart when they snap to the same colour. `defenderTable` dresses the Presser in the club kit that contrasts
  most with the player's shirt and body, with a fixed rival face and a body colour away from the player's. `FIRE_SWAP` turns the
  kit flame-coloured. `cavePalettes(cave, custom)` returns every table for one run.
- **Bake.** `packSheet(caveSheetEntries(CAVE_SPRITES, tables, extras), {mirror:true})` returns one RGBA sheet and a rect for
  each name (`player.run.2`, `fire.jump.0`, `small.idle.1`, `defender.out.0`, `tile.rock`, `item.fireball3`, a `<` suffix for
  facing-left). Bake it once at load. Each frame then only calls `drawImage` with prebuilt rects.
- **Adding a sprite from graph paper.** Draw it on a grid of the target size with the key above, using `k` for the outline. Type
  each row as a string, the same width, `.` for empty. Add it to the record for its palette (tiles must stay inside one
  `TILE_GROUPS` palette), then run `node tests/cave-sprites.cjs` and `node scripts/cave-sprite-sheet.cjs <dir>`, and look at the
  PNGs. Not done yet: hair-style and headwear overlays, and `build` heights. Every bean draws the regular build with a crop-style
  hair shape in the player's hair colour.
