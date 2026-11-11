# Breakaway Run: art and sound direction (builder, Nov 10 2026)

**One line:** a golden-hour dribble along an island coast road, printed like a comic page: ink, flat colour, Ben-Day dots, one enormous low sun.

## References (for the feel, not to copy)
- Printed adventure comics and their animated-feature descendants: inked silhouettes, two-tone shadow shapes, dots only where light turns.
- Mid-century coast-road travel posters (a sun cut as stacked discs, sea as flat bands) and sports manga impact pages (speed lines, star burst, one loud word).

## Palette (hex)
- Ink `#231a2e` (never pure black). Paper `#fff3d6`. Sun core `#fff1b0`, sun rings `#ffc24a` / `#ff8a3c`.
- Sky bands: `#2f5fa8` top, `#f08a5a` mid, `#ffcf7a` haze. Sea `#1f8f96` near, `#2b6fa3` far, glitter `#fff1b0`.
- Road: warm asphalt `#6d5a6a`, kerb paper, lane paint `#fff3d6`. Shadow tint is violet `#8f78b8` (multiply), light tint `#fff0d2`.
- Village: whitewash `#fff0dc`, terracotta `#d9623b`, shutter blue `#2f6fb0`, palm green `#2f8a5a` / shade `#1d5a55`.
- Signals (read by silhouette first, colour second): tackle red `#f0452e`, skill teal `#19b5a5`, goal gold `#ffc83a`.
- Variants are new scenes, not recolours: **Night** (moon, stars, lit lamps throwing warm pools on the road, `#141a44` sky),
  **Storm front** (slate `#39465a` cloud shelf with one burning slit of sunset under it, ink rain, lightning as a white panel),
  **Cup Final dusk** (magenta afterglow `#c8457a`, lamps half lit), **Legend** (a blood-red sun `#ff4a3a` on violet `#2a1650`).

## Type
- Lettering: heavy condensed italic capitals with an ink outline and a hard offset block shadow (CSS text-stroke, no image fonts);
  hand-cut numerals in IslandBrush for the big score and distance only.
- Small text and every button label: the UI sans, weight 800 (project rule). Caption boxes are paper with an ink border, square corners,
  a 3 px hard shadow; no pills, no blur, no glow.

## Materials and line
- One comic shading pass lives inside every runner material (chained onto the route-bend shader edit, so no post pass and no extra draw):
  light is quantised into shadow / light / hot bands, the turn between bands is a 45 degree halftone screen in screen space,
  shadows are tinted violet instead of darkened, and characters and balls get a warm rim on the sun side plus an ink edge at grazing angles.
- Props (houses, palms, lamps, sea wall) carry their ink outline baked into the same geometry as an inverted hull: outline for 0 draws.
- Road, kerb, verge, beach, surf line and the sea are one mesh and one shader; the sea has banded colour, a foam edge and a glitter path
  that points at the sun. Each terrain zone keeps its rules and gets a drawn surface (boards, cobbles, sand ripples, chalk, wet mud).

## Lighting
- One sun, very low (about 15 degrees) and ahead-left, so every runner, cone and palm throws a long shadow raking across the lanes
  toward the player; hemisphere fill is neutral because the bands decide colour. No tone mapping (print colour, nothing washed out).
- The sun drifts along the horizon as the route turns; the shadow direction follows it.

## Camera language
- Lower chase camera than before so the horizon sits about a third down the screen: sea, sun, headlands and clouds are always in frame.
- Parallax stack: road props, sea wall and palms, village terraces on the hillside, two headland silhouettes, cut clouds, gulls.

## Upright phones (Nov 11 2026, owner: "the break away game should not be turned sideways to play")
- Upright is the phone default; sideways and desktop keep the framings above. No turn-your-phone card either way (`requestAnyOrientation`).
- `lib/arcade/runnerFrame.ts` solves the tall frame once per resize: fov 48, horizon 36 % down (32 % on screens under 560 px tall) so the
  sun, headland, lighthouse and clouds fill the top third; the runner's feet sit 26 px above the 174 px thumb cluster; 0.115 x width px per
  metre at the runner (side lanes 22 % of the width off centre). 390x664: camera 4.6 m up, 16.2 m back, pitched 7.2 degrees down.
- Fairness: a 1.7 m tackler is 24 px tall 36 m ahead at 390x664 (46 m at 390x844, 29.5 m at 375x553 and 360x560) against 27.4 m sideways.
- Controls: swipe left / right anywhere on the road (up = jump, down = slide), the same floating stick bottom left, the same four discs at
  the same sizes packed round Shoot bottom right. Shots: `shots/runner-upright*.png`, `shots/runner-landscape-check.png`.

## HUD concept
- A comic page: score in a tilted caption box, a margin strip under it with hearts, balls and distance as inked icons and numerals.
- Controls are inked discs with a paper face and a hard shadow that collapses when pressed; Shoot is the big sun-yellow one and fills
  like a printed gauge while charging. The only in-play word stays the goal / tackle flash, now a splash panel.

## Sound palette
- Chase groove on hand percussion: cajon kick and slap, shaker, claps, palm-muted nylon guitar ostinato; a steel-pan lead and a
  brass stab join at higher multipliers. Footfalls change with the surface (grass thud, sand hiss, boards knock, cobble click).
- Near miss: a pitched air whoosh. Struck ball: a dry leather crack with a low thump. Goal: crack, net swish, gull-like whistle up.

## Signature moments
1. **The strike splash:** hit-stop, a star burst behind the ball, an inked panel frame snaps over the screen and GOAL! lands as lettering.
2. **The bend reveal:** bunting on the outside of the bend, the sun slides behind a headland and the sea opens up again.
3. **Near miss:** speed lines cut across the frame as ink strokes and the shadowed tackler slides through your long shadow.
4. **Night lamps:** pools of warm light on a blue road, one after another, marking the rhythm of the run.

## Runtime cost (phone profile, `scripts/measure-arcade-games.cjs runner`, desktop Chrome only: no phone temperature measured)
- Foundation 56-59 draws / 45-48k triangles / 11 textures; pass 1: 52 draws (max 66) / 59.3k (max 73.8k); pass 2 (final): 43 draws (max 54) / 39-40k (max 51-52k) / 12 textures. No new pass, light or render target; details in `docs/performance-guide.md` (Nov 10 2026 entry).
