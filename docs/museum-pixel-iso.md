# Museum pixel-iso style guide (Oct 10 2026; scope narrowed Oct 12 2026)

> **Scope now: the penalty-1891 cabinet only.** On Oct 12 2026 the user asked for every other exhibit to be in the anatomy
> Paper style ("these games should not be the pixel style. only the penalty kick should be pixel game"), so the eleven
> exhibits that were pixel-iso games (telstar-1970, laced-leather, shirts, cards-1970 (now stadiums), var-2018, backpass-1992 (now boots), laws-1863,
> futsal-1989, wwc-1991, hall-of-fame, timeline) are now Paper: see `docs/museum-paper-style.md`. worldcup-1930 and the World
> Cup balls display (`wc-balls`) keep their own looks.
>
> What this guide still governs: the pixel look of the penalty kick's arcade cabinet (`penalty-1891/Cabinet.tsx` and its CSS,
> which has its own renderer and loop and does not import the kit). The `pixeliso/` kit described below is kept as a reference
> kit with its dev demo and test; no exhibit imports it. The exhibit-helper folder `pixeliso-laws/` was deleted. Anything below
> that speaks of "every exhibit" describes the Oct 10 plan and no longer applies.

- Kit: `components/museum/experiences/pixeliso/` (`index.ts` exports the pure parts; `Stage.tsx`, `Cabinet.tsx` and `hooks.ts` are the React parts); used by no exhibit since Oct 12
- Demo: `/museum-lab/pixeliso`, dev only (`app/museum-lab/pixeliso/page.tsx`, `pixeliso/demo/`)
- Tests: `tests/museum-pixeliso-kit.cjs` (part of `npm test`)
- References:
  - the penalty-1891 arcade cabinet (`penalty-1891/Cabinet.tsx` and its CSS): palette, fonts, HUD and score screen

## Palette

Every colour comes from the **Sega Mega Drive 9-bit palette**, the same one the penalty cabinet's dither pass reduces to. Each channel takes one of 8 levels: `00 24 48 6c 90 b4 d8 fc`. Nothing else is drawn inside a stage, and the test checks every hex value in `palette.ts` plus every pixel of the demo. For a colour that comes from data, such as a historic kit, use `toMegaDrive(hex)`.

**UI**, with the same names as the penalty cabinet's CSS variables:

| name | hex | use |
|---|---|---|
| k | `#000000` | outlines, hard edges |
| ink | `#fcfcfc` | text, window rims |
| soft | `#b4d8fc` | secondary text |
| win / win2 / fill | `#000090` / `#00006c` / `#000048` | windows, deck, screen background |
| bevel | `#2448d8` | window bevel |
| gold / gold2 | `#fcd824` / `#b49000` | primary action, Fig chip, kicker, readout |
| reach | `#48d8fc` | "ok" / keeper / info |
| goal / goal2 | `#6cfc48` / `#24b424` | success |
| miss / miss2 | `#fc6c48` / `#b42400` | failure |

**Material ramps.** Each ramp has 4 tones, dark to light: `[0]` outline-side shade, `[1]` right face, `[2]` left face, `[3]` top.

| ramp | tones |
|---|---|
| grass | `#002400 #246c24 #489048 #6cb46c` (alt stripe `#48b448`) |
| line | `#6c906c #b4d8b4 #d8fcd8 #fcfcfc` |
| white (posts) | `#6c6c90 #b4b4d8 #d8d8fc #fcfcfc` |
| steel | `#242448 #48486c #6c6c90 #9090b4` |
| wood | `#482400 #6c4824 #906c48 #b49048` |
| brick | `#480000 #6c2424 #904848 #b46c48` |
| stone | `#484848 #6c6c6c #909090 #b4b4b4` |
| paper | `#906c48 #d8b490 #fcd8b4 #fcfcd8` |
| night | `#000024 #000048 #00006c #000090` |
| red / blue / gold / green / sky | see `RAMPS` in `palette.ts` |

**Swatches:**

- skin, in three ramps: light `#fcd8b4`, mid `#d8906c`, dark `#904824`, each with its shades
- hair: `#242424 #482400 #d8b448 #b44824`
- boots: `#242424`
- net: `#d8d8fc`
- shadow: `#002400`, dithered
- lamp: core `#fcfcd8`, glow `#fcd86c`
- LED: `#fcb424` and `#6cfc48` on a screen of `#002400`

**Team kits** (`KITS`): red, blue, white, gold, green, keeper (gold), keeperGreen and ref. Each kit has a 3-tone shirt, a trim, 2-tone shorts and socks, and gloves for keepers.

## Pixel grid

- **One art pixel = one buffer pixel.** The `<canvas>` buffer is the art, and the browser shows it at a **whole-number pixel size P of 2, 3 or 4 CSS px** with `image-rendering: pixelated`. This is the penalty cabinet's 2–4 rule.
- `PixelStage` picks P with `fitGrid`: the largest P at which the scene's `min` art size fits the box. The buffer then grows up to `max`, so wider screens see more world at the same pixel size.
- **Standard stage: `min=[160,160]`, `max=[304,184]`.** At 390 × 844 this gives 168 × 184 art px at P = 2 (336 × 368 CSS). At 1440 × 900 it gives 304 × 184 at P = 3 (912 × 552).
- **Design every scene to read inside 160 × 160 around its centre.** Anything outside that is a bonus on wide screens.
- **A compact scene may frame itself on desktop** (Oct 12 2026): lower `min`'s height so P = 4 fits a 900 px-tall window, and pass `maxAt={{4:[w,h]}}` to cap the buffer at that pixel size, so bigger pixels frame the scene instead of adding empty world. The timeline's time lab does this (`min=[160,136]`, `maxAt={{4:[232,144]}}`). Still whole-number pixels only.
- **Anything a child must read** (instructions, numbers, answers) goes in the DOM HUD in the pixel fonts. Inside the drawing, use only short 3 × 5 glyph words: a scoreboard, a dial, a date, a shirt number.

## Isometric angle

The anatomy kit's camera is azimuth 45° and elevation 30°. At exactly that camera the floor projects at **2:1**, the pixel artist's isometric line: two pixels across for one down.

- **1 m of floor = one 16 × 8 px tile** (`TILE_W × TILE_H`). **1 m up = 10 px** (`Z_PX`; the true value is 9.8).
- World axes:
  - x runs to the screen's lower right
  - y runs to the lower left
  - z is up
  - the viewer looks toward −x, −y, so a bigger x + y is nearer
- `toScreen` always rounds to whole pixels. `toWorld(cam, sx, sy, z)` turns a buffer pixel back into the point under it on a plane, for drags.
- **Light comes from the upper left**, as in anatomy:
  - top = `ramp[3]`
  - left face (+y) = `ramp[2]`
  - right face (+x) = `ramp[1]`
  - silhouette = `ramp[0]`, or black with `ink: true`
  - a lit top-front edge
- **Painter's order** (`Scene.order`): layer first (floor → decal/shadow → solid → light → marker), then depth key `x + y` (+ z × 0.001), then the order the items were added.
  - A part that wraps another is split into back and front halves. `goal()` returns `[net, bar, post, post]`, so a ball in the net sorts between them.
  - Each post sorts on its own foot, so a player in front of a post covers it.
  - Large structures that people walk around should be cut into several blocks, each with its own key.

## Players

- Players are procedural sprites (`figureSprite` + `figureKeys`, or the `figure()` part) on one **14 × 20 grid**: an **18 px** body (1.8 m) inside a 1-px black outline.
- The body is built from:
  - a 4-px head with hair, and two eye pixels in the skin shade
  - a 6-px shirt in the kit's 3 tones: light column left, dark column right
  - a trim collar on the front, or a number block on the back
  - shorts, 2-px legs, socks and boots
- **Read order: team colour first, then pose, then face.** Two teams on screen should never share a shirt ramp.
- Poses:
  - `stand`
  - `run` (2 frames)
  - `kick`
  - `ready` (keeper: knees bent, gloves out)
  - `cheer`
  - `point`
  - `dive` (lying on its side; `flip` picks the side)
- Facings: `front` (toward the viewer) and `back` (toward the far end). `flip` mirrors the sprite left–right.
- Each figure brings its own dithered floor shadow.
- **Scale is honest except for the ball.** The ball is 5 × 5 px, where 0.22 m would be 2 px, because it is the thing the child watches. Its shadow shrinks and fades with height. Use `leather: true` for pre-1960s balls.

## Parts

All parts are pure functions in `parts.ts`. Each returns an `Item`, or an array of them, to `scene.add(...)`. Give an item an `id` and it becomes tappable through the pick buffer: `scene.pick(pm, x, y, slop)`.

- **Floor:**
  - `pitch` (mown bands plus grass dither)
  - `floor`
  - `floorLine`, with `arcPoints`
  - `spot`
  - `shadow`
- **Solids:**
  - `block` (box)
  - `slab`
  - `cylinder`
  - `pole`
  - `flag`
  - `panel`: a board, sign or machine face, with a lit `screen` and 3 × 5 `text` sheared to the face
- **Football:**
  - `figure`
  - `ball`
  - `goal` (with an optional net `bulge`)
- **Light:** `lamp`, a core plus a dithered halo, with an off state.
- **Markers** (always on top):
  - `reticle`
  - `path` (a dotted aim or flight line)
  - `at` (one-off pixel art at a world point)
- **Rasteriser** (`Pixmap`):
  - `poly`, with the pixel-centre rule (shared edges never gap)
  - `line` (Bresenham)
  - `ellipse`
  - `rect`
  - `sprite` (string grids)
  - `text`
  - `outline`
  - Bayer `dither` paints `{a, b, level}`
- Build machines the anatomy way: **many small precise parts** (bolts as single pixels, a label plate, a lamp, a screen, feet). Every part sits on another part. A bare block is unfinished work.

## HUD

- **`<Cabinet>`** is the penalty cabinet's bezel and windows with the anatomy card's grammar:
  - **Fig** chip (gold) at the top left, **title** at the top right
  - the screen, with its stage and a scanline veil
  - **hint** at the bottom left, with a blinking dot that blinks 6 times and then stops
  - **live readout** at the bottom right: gold Press Start, `aria-live`, written per frame with `useReadout().say` and no re-render
- Under the screen is the **dock**. Two covers can fill the whole face: `StoryIntro` and `ScoreScreen`.
- Pieces:
  - `Stats`: label, big number and a bar, as in penalty's On target / Keeper / Goal
  - `Pips`: round dots
  - `Toggle`: a segmented switch
  - `ActionButton`: the big yellow button with the 12-segment gauge; hold-to-charge when given `onRelease`
  - `PixelButton`: primary or ghost
  - `Banner`: GOAL / SAVED / MISS, or any word, over the screen (it wraps inside the screen with a safe gutter, so a long reason line never clips on a phone)
  - `Say`
  - `Note`
  - `Row`
- Fonts: **Press Start 2P** (`--arcade`) for labels, numbers and buttons; **Pixelify Sans** (`--pixel`) for sentences a child reads, at 15–17 px.
  - Both are referenced from `/museum/experiences/penalty-1891/fonts/` and never copied.
- Touch targets are at least 44 px: toggles 44, buttons 52, the action button 58, answers 48.

## Score screen

`ScoreScreen` is a cover over the whole cabinet face, scrolling inside itself. It contains, in order:

1. a gold kicker ("Full time · five kicks")
2. a big score with `/of` and a unit in Press Start
3. one or two `Note`s (what your result means; the same play under the other rule)
4. **one `QuickCheck` question**, which turns green or red with a one-line why
5. buttons ("Five more" as primary, "Look at the pitch" or "Read the story" as ghost)

The exhibit calls `onComplete` only at the real end: after a round **and** its quick check. Either use `modern/Ending` with `reached`, or call it directly. Never call it on mount.

## Motion

- **0 requestAnimationFrame at rest.** `PixelStage` draws on demand through `invalidate()`, a microtask, never a rAF.
- Animation comes only from a `PlayLoop` (`usePlayLoop`):
  - it is woken by an action (`loop.wake()`)
  - it stops by itself when `tick` returns false
  - it is put to sleep off-screen by its IntersectionObserver
  - it is disposed on unmount
  - it is safe under React's dev double-mount
- Use `fps: 30` for sprite cadence, like the penalty cabinet. Only `loop.ts` may call `requestAnimationFrame`, and the test enforces it.
- Calm, eased motion, using `spring` / `stepSpring` / `follow` / `rubber` / `easeOut` / `flight`:
  - springs snap exactly to rest so the loop can sleep
  - drags write straight through with a rubber band past the bounds
  - flicks hand their velocity to a spring
- DOM UI motion is sprite-like (`steps()`), one-shot, and never loops forever.
- **`prefers-reduced-motion`:**
  - the loop never starts: `wake()` runs the simulation to its end in one pass, so the result shows at once
  - hold-to-charge becomes tap-only
  - every CSS animation is dropped
  - each game must still be fully playable this way, as a turn-based or static version: aim, then the result

## Input

All input works in **buffer pixels**: `stage.local(clientX, clientY)`, then `toWorld` for metres.

- `useDrag(stage, { onStart, onMove, onEnd })`:
  - uses pointer capture, with `touch-action: none` on the canvas
  - smooths velocity for flicks
  - zeroes the velocity after a pause
  - `onStart` returning false refuses the drag
- `useTap(stage, pick, onTap)`: tap a part by id, with finger slop of about 22 CSS px for touch and 6 for a mouse.
- `useHold({ onCharge, onRelease })`: a press under 170 ms is a tap; otherwise the charge goes from 0 to 1 over 1.15 s. Enter or Space on the button counts as a tap.
- `useKeys({ left, right, up, down, action, escape })`: arrows or WASD, Enter or Space, Escape, with Shift for fine steps. Put it on the `Cabinet` (`onKeyDown`).

## Do

- Make the exhibit's idea the machine the child operates. Examples:
  - a laws-1863 rule press
  - a 1970 card the ref shows at the right moment
  - VAR lines dragged onto a frozen frame
  - a back-pass the keeper must not pick up
- Keep a short story intro (2–4 beats, skippable), a game that is the centre of the exhibit, and a quick check at the end.
- Keep every verified fact and source from the exhibit's `content.ts` / `facts.ts`, and show them in notes, the score screen or the story.
- Use real numbers from a small pure `model.ts`. The readout, the motion and the result all come from the same model, as with the demo's `outcome()`, `reachOf()` and `heightOf()`.
- Give parts `id`s so tapping works. Write `data-*` hooks for tests (`data-phase`, `data-result`, …).
- Check every scene at 390 × 844 and at 1440 × 900: no horizontal scroll, crisp pixels, targets of at least 44 px.

## Don’t

- Don't anti-alias, use gradients, blur, use `border-radius` inside the cabinet, or scale by fractions.
- Don't use a colour from outside the palette, or a font other than the two pixel faces.
- Don't run an idle animation loop. A breathing lamp, a waving flag or a crowd shuffle happens only while the game is in motion; a still pitch is still.
- Don't put long text inside the drawing, or leave leader lines, arrows or labels floating in the air.
- Don't draw a player bigger than the scale, or change the grid per exhibit. The family is one grid.
- Don't let a quiz stand in for the game, or call `onComplete` on mount.
- Don't copy the penalty fonts or edit the penalty, worldcup-1930 or wc-balls exhibits, or the hall (`lib/museum/*`, `MuseumRoom*`).

## Using the kit in an exhibit

```tsx
const stage=useRef<StageApi>(null),screen=useRef<HTMLDivElement>(null);
const st=useRef(initialState());                 // per-frame state lives in a ref
const render=useCallback((pm:Pixmap,s:StageSize)=>buildScene(st.current).paint(pm,cameraFor(s.w,s.h)),[]);
const loop=usePlayLoop(dt=>{step(st.current,dt);stage.current?.draw();return !st.current.done;},{el:screen,fps:30});
const drag=useDrag(stage,{onMove:p=>{/* toWorld(...) → st.current */stage.current?.invalidate();},onEnd:()=>loop.wake()});
return <Cabinet fig="1863" title="Write the first laws" hint="Drag a rule onto the press" readoutRef={readout.ref} dock={…} cover={…}>
 <div ref={screen}><PixelStage ref={stage} min={[160,160]} max={[304,184]} render={render} label="…" {...drag}/></div>
</Cabinet>;
```
