# Arcade rebuild — September 19, 2026

## Direction

Keep Futbol Tennis, Futbol Pinball, Breakaway Run and Live Match. Rebuild the first three around a shared Three.js scene and give Live Match a stadium presentation. Each game keeps its football learning purpose: positioning and touch; contact angles; reading space; passing and team shape.

The reference is the supplied reconstruction of Sundown Showdown: `/Users/khoado/Downloads/game.js`, with `shell.html`, `three-bundle.min.js` and `index.original.html`. Symbol names in the reconstructed file are inferred, not the author's original source. The original was run locally in Chrome and inspected alongside its code. No reference game code or vendored renderer bundle was imported.

## What makes the reference work

- **Movement:** `Brawler.animate`, around line 3180, combines speed-driven leg strides, counter-swinging arms, body bob, smoothed facing, leaning, kick/recoil and brief scale changes. Small layers make a simple model feel responsive.
- **Camera:** the loop around line 6198 uses a consistent pitched perspective, portrait-aware distance, damped follow and restrained aim look-ahead. Framing and readable silhouettes matter more than adding polygons.
- **Light and scenery:** `Lighting`, around lines 1010–1254, coordinates background, sun, fill, exposure and lamp emission. The day-to-night change is a palette change across the scene. Grounded shadows and nearby landmarks explain depth.
- **Effects:** `ParticlePool`, around line 3750, reuses bounded storage. Impacts receive short effects tied to actual events, rather than continuous decoration everywhere.
- **AI:** `BotBrain`, around line 4621, has distinct intentions, grid pathing and line-of-sight checks. For football, adapt those ideas to support, close down, intercept, recover and create space—not combat targeting.
- **Budgets:** quality presets around line 275 and the benchmark around line 6314 limit rendering cost. The reference still uses expensive AO, bloom, shadow updates and a synchronous readback benchmark. Those are not necessary to start improving our games.

## Implemented

`lib/arcade/arcadeStage.ts` owns shared rounded geometry/materials, articulated characters, footballs, goals, island scenery, one shadow-casting sun, palette progression, picking and an 80-slot impact pool. It disposes scene resources on exit. This is an original implementation using the app's existing Three.js dependency.

`lib/arcade/arcadeGames.ts` connects that scene to the existing Tennis and Pinball simulations. Tennis retains ball height/spin, AI returns, one-bounce rules and first-to-seven scoring. Pinball retains the high-frequency collision simulation, charging, independent flippers, defenders, keeper and three-ball rules. Renderer replacement does not replace their physics.

`lib/arcade/runnerGame.ts` rebuilds the runner around three lanes, obstacles, jump/slide, five-touch boosts and an explicitly marked open goal lane. Existing jump, lane-smoothing, goal-scoring and swept-contact helpers are reused. The saved best-score key is preserved. District names remain; the scenery is currently a shared island palette rather than unique district art.

`components/games/ArcadeGame3D.tsx` provides consistent cream cards, brush headings, colored controls, keyboard/touch input, pause/resume and short synthesized contact sounds respecting sound settings. Games lazy-load from the Arcade. Paused, hidden and finished games stop requesting frames; Tennis and Pinball also sleep in settled ready states. Resize/input wakes them. Mobile caps are 30fps, DPR1.5 and a1024 sun shadow map; desktop caps are 60fps, DPR2 and2048. Live Match remains30fps with its existing lower DPR cap.

`lib/arcade/matchScenery.ts` adds stands, turf variation and dusk lighting to the existing Live Match simulation. Phone-controller integration and game rules remain in place. Its renderer now sleeps when inactive.

No GTAO, bloom, PCSS shader patching, lamp shadow pool or synchronous GPU benchmark was added. Decorative lamps are emissive surfaces, not extra dynamic lights. The previous game source files remain available for comparison; they are no longer imported by the Arcade menu.

## Validation and limits

- Tennis simulation: serve, rally, return, net, bounces, out, scoring, reset, movement bounds and deterministic AI.
- Pinball simulation: launch, rails, defenders, keeper, goals, independent flippers, drain/restart, frame-rate independence and stress runs.
- Runner simulation: swept contacts, slide/jump distinctions, boosts, goal lanes, finished-state freeze and bounded object counts over ten minutes.
- Production compilation and type checking pass.
- Chromium screenshots at390px and1440px inspected. Corrected the runner camera after the first pass placed the player outside the frame, and reduced overly washed-out lighting.

This is a local rebuild, not a production deployment. Desktop Chromium mobile emulation does not establish iPhone heat, Safari stability or real-device touch quality. Live phone pairing needs a second-device check. Rendering is more expensive than the old2D courts; the bounded scene and sleeping loops reduce unnecessary work but do not establish a measured thermal improvement.

## A new soccer arena game later

A suitable adaptation of the reference's arena concept is **Last Goal Standing**: short rounds in a compact street pitch, seven AI opponents, a shared ball and changing open goals. A receding playable boundary can become closing pitch gates rather than poison gas. Actions are dribble, tackle, pass and shoot; special abilities should represent football skills and have readable recovery times. Start with possession, interception and support AI, a fixed camera and one sun. Add night lamps or selective postprocessing only after physical-phone profiling. Build this after validating the rebuilt existing games, rather than mixing a new ruleset into their migration.
