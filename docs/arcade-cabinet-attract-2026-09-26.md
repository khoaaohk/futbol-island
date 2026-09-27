# Cabinet attract illustrations — September 26, 2026

Local, not deployed. `lib/arcade/arcadeCabinetAttract.ts` supplies one 256×192 CanvasTexture per cabinet, using shared cream/gold/coral/teal miniature football artwork. These are authored illustrative loops, not running game simulations.

- Breakaway shows three lanes, advancing defenders, a lane dodge, charged shot and goal. Charge uses a ring, preserving the user's removal of the yellow aiming line.
- Tennis shows the net, incoming aerial arc, contact, a side-on scissor return and coral outgoing trail.
- Pinball shows its enclosed football table, bumpers, rebound path, two bottom bean players kicking, and a keeper leaning into a save.
- Pass Puzzles draws a segmented passing route, then plays the ball through reception and finish.
- Strikers shows a pass, runner beyond a defender's tackle, and a placed finish.

Each has game-specific title and action caption, a meaningful initialized still, and a frozen reduced-motion action frame. The room calls `update(dt,time,active,reduced)` using its own clock and visibility test. Active texture redraws cap at 8fps; inactive updates do no canvas work or texture upload. No RAF, timers, sound, game-runtime imports, or additional WebGL contexts. Canvas dimensions are released and texture disposed on room exit. Canvas trails/actions use fixed scalar calculations and constant paths.

`node tests/arcade-cabinet-attract.cjs` passes all five previews: unique artwork commands, finite full cycles, 8fps ceiling at60Hz input, zero hidden texture changes, frozen reduced frame, resume and idempotent disposal. TypeScript passed before the final equivalent draw substitutions for the no-aimline Runner and football-player Pinball. These are helper/lifecycle checks; actual cabinet-screen readability and frustum gating require the integrating room's browser review.
