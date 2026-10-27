# Breakaway Run, round 3 (October 26 2026)

Cabinet: Breakaway Run (`runner`). Owner goals: hard levels, better graphics, kid controls, a cleaner menu, and later
asks for cinematic camera beats, terrain types with real elevation, and a more dynamic run. Football lesson kept
central: every new piece names a real decision (read the moving defender, jump the tackle then slide, shoot the side
the keeper leaves, small touches on cobbles, change lane early on snow).

## Audit (before)
- One endless run, one difficulty. No finish, no boss, no way for a strong player to pick a harder run.
- The menu was the shared text card: long help paragraph, full mission list, Play, Leaderboard, Back, all stacked.
- Touch pad: lane arrows 44-48 px, Jump/Slide/Skill 48-52 px, Shoot 58-66 px (below the 56/80 px kid targets).
- **Bug found:** the runner terrain mesh (`runnerTrack.ts`) was wound clockwise seen from above, so it was
  back-face culled and never drawn: the land beside the road was just sky. Fixed (index order); the ground now shows.
- Hills existed (Oct 9) but were small (1.6-6 m rises) and the horizon correction flattened them.

## What changed

### Routes (difficulty ladder) - `lib/arcade/runnerModes.ts`
| Route | Hearts | Pace | Gaps | Start | Modifiers | Finish |
|---|---|---|---|---|---|---|
| Warm-up (default for new players) | 5, +1 per goal | 0.86x | 1.14x | stage 1 | low hills, generous windows (buffer .30 s, coyote .14 s, lane grace .14 s) | 900 m, open goal |
| Breakaway (classic, unchanged rules) | 3, +1 per 3 goals | 1x | 1x | stage 1 | terrain zones | endless |
| Night Derby (HARD) | 3 | 1.10x | 0.88x | stage 3 | drifting defenders, rolling balls, double jump, steeper hills, night sky | 1500 m, boss keeper |
| Storm Final (HARDEST) | 3 | 1.16x | 0.82x | stage 4 | + jump-then-slide gauntlets, the steepest hills, rain and lightning | 1800 m, boss keeper |

- Top speed stays at the old fairness ceiling x min(1.1, pace), so read windows stay above ~0.9 s.
- Drifting defenders sway between two lanes and SET 26 m out (over a second before contact); a lane is always open.
- Gauntlet: three slide tacklers across the pitch (jump), then a line 22 m later (slide or jump again); only on a
  clear pitch and never in a goal run-up.
- Final hill: no new goals 300 m out, a clear climb from 200 m (balls refilled to 3), then the goal-line goal. Boss
  keeper: faster, wider sway (1.9 s, 2.15 m) and a wider gap needed; three tries, then the route ends kindly.
- Stars per route (new key `fi2-runner-routes-v1`, written once per run end): finish / beat the boss (or 2 goals on the
  Warm-up) / keep every heart; classic: stage 3 / 5 goals / stage 6. Night Derby opens with 2 stars on Warm-up or
  Breakaway, or for anyone whose existing record reached stage 3; Storm Final opens with 2 Night Derby stars.
  No existing save is migrated or changed. Coins are unchanged (`arcadeCoinTarget`: goals + footballs, same caps).
- Classic run untouched: same seed, same lane order, same pattern spacing. All round 1/2 tests pass unchanged except
  two that pinned incidental details (a magnet power-up adds one object to a pattern; a terrain caption can follow a
  bend caption).

### Kid-friendly play - `lib/arcade/runnerGame.ts`
- Coyote time (a jump pressed just as the tackle lands still clears it) and lane-cut grace (a cut already on its way
  out counts), per route; input buffer per route (.18-.30 s). "JUST IN TIME!" says it worked.
- Hearts refill gently after goals; a loose ball only costs a football, never a heart.
- Adaptive help: each lost heart eases pace by up to 7 % (fades over ~20 s); scoring streaks add up to 1.5 %.
- Magnet power-up (pink orb, every sixth wave from wave 4): footballs curve into your lane for 6 s.
- Non-classic routes shuffle the lane order per run from wave 6 (seeded: deterministic for tests).

### Terrain and elevation - `components/games/runnerRoute.ts`, `lib/arcade/runnerTrack.ts`
- Eight terrains: grass pitch, sand beach, cobbled street, snow, wet mud, neon stadium, rooftops, bridge. Each has a
  road/land colour, a shader pattern (stripes, ripples, cobbles, sparkle, mud patches, neon grid, tiles, planks),
  props palette (bridge railings and cable posts, rooftop chimneys), a footstep sound, and a surface feel
  (speed .93-1.04, grip .84-1.0, blended over 14 m). Zones are 240 m; each route has its own sequence.
- `routeHeight(s)`: one cheap function (prefix sums of segment rises) used by the shader table and tests.
  Rises are bigger (classic 2.2-6.4 m per 60 m segment; Night x1.35, Storm x1.7, capped 8.6 m: grade < 22 %).
  Finite routes end on a three-segment climb to a level goal line.
- Slope pace now 0.86x-1.14x (was 0.9-1.1). Jumps carry up to 25 % more on descents and over crests ("BIG AIR!").
- Land tint by height: green valleys, rocky ridges, snowy peaks; far land rolls into hills beyond 22 m (vertex
  offset only past every prop). Horizon correction lowered (.35 -> .2 of the grade) so hills read clearly.

### Graphics and camera - `lib/arcade/runnerFx.ts`, `lib/arcade/runnerWeather.ts`, `lib/arcade/runnerCinema.ts`
- Stadium run-in: KICK-OFF gate at 8 m and a camera sweep from high and wide (1.6 s, skippable).
- Goal line: GOAL LINE arch with a chequered line; boss keeper drawn 1.45x with a gold ring.
- Skies per route (night darker, storm grey-blue with rain streaks and lightning flicker + thunder); the horizon glow
  drifts with the terrain (sunset on the beach and roofs, blue hour on the bridge).
- Dynamic chase camera: pulls back with speed, swings wide on bends, rises on climbs (pitched to keep the runner in
  place) and pulls back/looks down on descents, dips for slides, lifts for jumps. Damped, no roll, pitch <= .06 rad,
  FOV clamped to +-12 % of the base.
- Cinematic beats (`runnerCinema.ts`): dodge/hurdle punch-in at 0.40-0.45x for ~0.3 s; big air; power-up flare;
  goal push-in; the goal-line duel (low hero shot, 0.5x across the shot decision); the finish replay (0.35x).
  Caps: one slow beat per 6 s, slow >= 0.35x, beat <= 1.8 s, any input skips (except the duel/finish), never under the
  first-run coach's own slow motion, and slow motion only after the input resolved (or across the whole duel, which
  only widens the real-time window). Reduced motion: no slow-mo, zoom, camera offsets, rain or lightning.
- Words: terrain names, FINAL HILL!, JUMP + SLIDE!, MAGNET!, DOUBLE JUMP!, BIG AIR!, JUST IN TIME!, +1 HEART, BOSS BEATEN!

### Controls - `components/games/RunnerControls.*`
Thumb-arc pad: lane arrows 72 px (left thumb); Shoot 88 px in the corner, Jump 64 px above it, Slide 64 px to its
left, Skill 64 px on the diagonal (right thumb). Touch-down handlers, multi-touch and cancel handling are the existing
ArcadeGame3D ones; `touch-action:none` on the pad; keyboard unchanged (A/D, W/S, Space, E). The coaching line moved
under the header so it never covers the runner or the pad.

### Menu - `components/games/RunnerMenu.*`, `RunnerMissionCard.*`
One card for ready / pause / full time: badge, title (or score + route stars + three short lines), a 2x2 route picker
(icon, name, stars, HARD/HARDEST tag or lock hint), one 64 px Play button, and four 52 px icon buttons (Missions,
Help, Scores, Arcade). Missions and help open in place; the first-run hint shows once. 390x844: the card is ~470 px
tall, no scrolling.

## Cost (desktop Chrome, swiftshader, 390x844 emulation; `renderer.info` per frame)
- Classic run, steady play at 205 m: 107 calls, 50.3k triangles; the new scenery adds **0** calls (gates hidden
  after the run-in, no rain, no power-up in view). The terrain mesh was always submitted (it was culled by winding);
  it now shades the ground, and the sky dome behind it is depth-rejected, so fill is roughly a swap.
- Storm: +1 call for the rain buffer (70 streaks on phones), +4 meshes for the goal-line arch in its last 150 m,
  +2 for a rolling ball, +2 for the magnet orb. Hard routes show more defenders (more rig draws): that is gameplay.
- Per frame: no allocation in scenery update, cinema step, camera or terrain uniforms (asserted in tests). Terrain
  colours change only when the visible zone pair changes.
- No iPhone thermal claim; verified in desktop emulation only.

## Tests
`tests/breakaway-r3-routes.cjs` (runs `tests/runner-r3-routes.mjs`, end of `npm test`): height continuity and slope =
grade, slope cap, hard routes steeper, final hill, terrain table and blending, route ladder values, refills, coyote and
lane grace, double jump, big air, gauntlet answers, drifting defenders set 26 m out, magnet, rollers, the boss keeper
finish (win, three misses, Warm-up open goal), seeded shuffle, stars/unlock ladder, cinematic beat caps and reduced
motion, long runs reach full time with bounded objects, pad sizes and menu targets.

## Eyeball on a real phone
1. First open: Warm-up selected, hint shown once, nothing scrolls; Play is one tap.
2. Thumb pad: can you hit Shoot/Jump/Slide without looking? Lane arrows easy with the left thumb?
3. Hills: Storm Final at ~950 m (climb) and ~770 m (descent): is the slope obvious and is the runner always visible?
4. Slow-mo beats: never annoying, never during a decision you must make; tap skips them.
5. Night Derby goal line: the boss keeper duel (low shot, slow-mo) and the BOSS BEATEN finish.
6. Storm rain + lightning: heat after 5 minutes vs the classic run (rain is one line buffer).
7. Snow/sand/mud readability under each sky.
