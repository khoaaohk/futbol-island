# Roll It In (`rollball`): direction (Nov 17 2026)

Owner: "a game where you are a soccer ball that rolls around ... puzzles means rolling the ball on things to unlock something
else ... different surfaces and terrains, different topography heights ... more realistic but still the same arcade style."
It will replace Clear the Box (`clearbox`) once the coordinator removes that cabinet.

## The game
- You ARE the football, rolling freely (momentum, slopes, friction; fixed 1/120 s physics in `lib/arcade/rollball/core.ts`).
- One thumb: a floating stick anywhere on the stage (`lib/arcade/useFloatingStick.ts`), or arrows / WASD, or a mouse drag.
  Camera behind and above the ball, looking along the course, so heights and drops read at a glance. Portrait.
- A level = 1 to 6 hand-made puzzle MODULES chained by a seeded generator, then the goal. Each module: entry at z 0, exit at
  z = len, both at height 0, a difficulty rating 1-9, its mechanics, a par time and a scripted bot solution.
- 21 modules, four themes: training pitch (6), beach (5), rooftops (5), stadium at night (5). Levels 1-17 each bring exactly one
  new module (the lowest-rated one not met yet), alone or after one warm-up; later levels mix met modules, easy ones drop out.
- Surfaces (accel / drag / bounce): short grass, long grass (slow), sand (very slow, leaves a track), wet tiles (slippery), mud
  (sticky), planks (fast, narrow), metal ramps, stone roofs, rubber bumpers.
- Topography: smooth hills (`hillZ`), mounds and dips (`bumpZ`), banked slopes (`bankX`) next to the straight ramps, steps (0.2 m, climbable; anything over 0.26 m is a wall), ramps, raised roofs, a half-pipe, gaps to jump,
  a moving lift, a drained pool. Water all round: falling in costs a heart and restarts that module (its puzzle resets too).
- Puzzles (signals): latch plates, heavy plates (only a crate counts), timed plates (race the gate), stay plates (hold 1.5 s),
  ordered plates (1-2-3, a wrong press resets), cone stacks (hit hard enough), lever switches, a whistle key to a lock;
  receivers: gates, bridges, a lift, a draining pool, a fan updraft. Night Shift, Final Third and the four Nov 17 chains (Over the Hill: crate -> heavy plate -> bridge -> hill cone + plate -> gate; Sandbar Relay: dune switch -> drained pool key -> lock -> bridge, timed plate -> gate; Chimney Run: 1-2-3 across a lift -> fan, stay plate -> gate; Floodlit Valley: training ball rolled into a dip onto a hold plate -> bridge -> key on a bank -> lock -> gate) chain three or more.
- Retry (button / R) restarts the current puzzle for free, so a stuck crate is never a dead end.
- Hearts 3; a level clock from level 4 (par x 2.2 shrinking 0.04 a level to x 1.15, + 10 s); running out costs a heart.
- Score: 50 a module, 200 a goal (x level factor up to 3), 10 a second under par, 100 a star (off the main path), goals
  without a lost heart build a streak (x1.25 ... x3 on the goal bonus). Medals 1,500 / 6,000 / 20,000 (bot data in
  `tests/rollball-core.cjs --bots`: a drifting-thumb bot scores about 1,100-15,000; the exact bot never ends).
- Daily Roll on the start card (same seed for everyone that day); one all-time island board (top 20); "beat your best" line.
- Lesson on the cabinet: "Look before you roll. Plan the next touch." Results tips teach the weight of a pass and pitch types.

## Look (polish pass Nov 17: realistic-but-arcade)
- Terrain is subdivided and shaded in vertex colours (hillshade to the sun, a rim where ground drops, contact shade under a higher
  neighbour, noise), with a rounded lip over rough cliffs drawn only where the ground really drops; sea cliffs widen into the water.
- Toon sea shader (bands, moving crests), shore foam strips round every waterline, pools use the same water; splash rings.
- Every plate / switch / cone / lock has a dashed cable on the ground to what it opens, flowing and lit when its signal is on.
  Gates: posts, lamps (red / green), a rail-and-bar frame that sinks. Bridges unfold plank by plank. Lifts on rails. Fans blow streaks.
- Grass tufts on lips and in long grass, shells on sand, puddles on mud (instanced); a coloured rolled track on sand, mud and long grass.
- Scenery per theme (trees, ad boards, benches, goals; palms, umbrellas, deckchairs, lifeguard towers; buildings, water towers,
  washing lines, chimneys; floodlights, stands, flags) merged into three meshes a module, plus a far painted ring per theme.
- three.js, procedural only: canvas prints per surface (mowed stripes, sand ripples, plank grain, diamond plate, tiles),
  toon shading (three-step ramp), ink lines on every terrain edge, ink hulls on the ball, crates, cones and posts.
- The ball: a 2,000-face sphere coloured as a real truncated icosahedron (12 black pentagons, seams), panels turn by the
  distance rolled; a squash on hard landings; a blob shadow straight below for height plus one sun shadow that follows the ball.
- Themes: sky colour, fog, water print, side material (soil / sandstone / brick / concrete) and scenery on islands round each
  module (trees and ad boards, palms and umbrellas, lit buildings and tanks, floodlight towers and stands). The goal wears the
  level's last theme. Comic lettering (POW!, CLICK!, GOAL!, SPLASH!) via the shared comic kit, pinned to the 3D spot.

## Sound
Synth only (`audio.ts`): a rolling voice whose filter and level follow speed and surface (hiss on sand, squeak on tiles,
knock on planks), landing thump, splash, plate clunk + note, gate slide, cone clatter, lever click, whistle pickup, lock clack,
star bells, goal whistle + net swish + crowd swell, full-time whistle. One limiter; nothing before the first tap.

## Heat
Low-power WebGL, pixel ratio 1.5 on a phone (2 desktop), one shadow map (512 on a phone), no post-processing, terrain merged
per module and surface, modules disposed two behind the ball, pooled dust / splash / sand track, frames capped at 60 and
nothing drawn on the cards, pause or a hidden tab. Measured in headless Chrome (swiftshader), phone: before the polish 60-76 draw calls / 5-7k triangles on the heaviest old modules
(136 on a new chained module); after: 40-65 draw calls / 9-17k triangles a module, 81-93 calls / 19-23k triangles on three-module
levels. Only the ball's module, the one behind (first 8 m) and two ahead are drawn.

## Improve pass (Nov 17 2026, batch 1)
- Slopes read from the chase camera: hillshade gradient x2.4, every slope shaded a band darker than flat tops, mowing-stripe UVs laid
  by the ground's length on hills; the contact shadow tilts to the slope under the ball; the camera rises (up to 1.8 m) on climbs.
- Cone stacks are three tall training cones (0.62 m, white band, 12 x 4 segments: same triangles as before); fan streaks are
  wider, crossed and opaque with blue edges; shore foam stops halfway across a narrow channel instead of stacking.
- First minutes: the first plate pressed in a session flashes its cable; a fall on levels 1-3 (RB.gentle) respawns on the last
  firm spot sampled 0.4-0.8 s earlier with the puzzle kept, and costs no heart on level 1. Drifting-thumb bot after this change
  (its script restarts from the respawn spot): 750-11,300 (was 1,100-9,500 at HEAD); medal lines unchanged.
- Budget, Knock the Cones + Over the Hill, phone: 76 / 85 draws, 18.1k / 18.3k tris before; 76 / 84, 18.1k / 18.3k after.
