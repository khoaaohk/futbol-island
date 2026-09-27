# Futbol Tennis — September 25, 2026

Status: local development changes; not deployed. Browser checks used the development server at `http://localhost:8092`.

## Resumed work

The existing arcade fluidity pass uses analog velocity input with prompt braking, normalized diagonal speed and settled pointer destinations. Contact eligibility now covers the former waist-height gap; buffered kicks expire after 0.32 seconds. Net collision height is interpolated at the crossing, and flight prediction follows spin decay. The presentation keeps a fixed 14-dot trail pool and throttles incoming-ball landing prediction to 10 Hz. These changes were already present when this continuation resumed and were retained and verified.

Football learning remains positioning before contact, watching the incoming ball, selecting a lob/drop/drive and placing a return into space. Rules are deliberately simplified arcade singles: one bounce, one return, first to seven.

## Fix found during this continuation

The desktop browser check caught a player frozen with residual velocity `0.0258155` after releasing movement. The render sleep predicate allowed stopping below speed 0.03, while the movement simulation only snapped velocity to zero below 0.025. Depending on frame timing, the simulation slept before its final braking step.

The serve sleep predicate now waits until velocity is exactly zero. This permits the last braking step, then sleeps as before. A regression follows `tennisNeedsFrames` at 24, 30, 60, 90 and 120 Hz and confirms both exact rest and bounded time to sleep. It does not keep ticking after the game says it can sleep.

The mobile browser check now moves with a real emulated touch on the joystick and taps Serve, rather than using desktop keyboard input in a phone viewport. Browser waiting uses the actual stopped state instead of an arbitrary 500 ms delay.

## Validation

- `node scripts/check-soccer-tennis.mjs`: passes simulation, complete match, deterministic AI, score/reset, net/out/bounce rules, analog/diagonal motion, release/arrival, contact window, input buffer, swept net, cadence and sleep regressions.
- `node scripts/check-soccer-tennis-browser.cjs`: passes keyboard movement/release, exact rest, idle serve sleep, serve/rally, pause sleep and no JavaScript errors at 1280 × 800. Sample: x=1.7247, vx=0; 134 draw calls during rally.
- `node scripts/check-soccer-tennis-browser.cjs --mobile`: passes touch joystick movement/release, exact rest, idle serve sleep, Serve tap/rally, pause sleep and no JavaScript errors at 390 × 844. Sample: x=1.5769, vx=0; 88 draw calls during rally.
- Reviewed the mobile screenshot `/tmp/fi-tennis-mobile.png`: court and controls fit, the score and teaching message are readable.
- Production build is coordinated by the parent arcade integration task.

No additional animation loop, geometry pool or background work was introduced by the sleep fix. It adds only the final braking frame(s) before an idle serve sleeps. Chromium phone emulation is not a measurement of iPhone heat or native Safari gesture behavior.

## Gameplay redesign after the game-developer review

Thesis: arrive balanced, choose the space the rival cannot cover, then recover for the return.

The previous game selected the opposite side automatically and randomly converted good touches to drives. That obscured the player's influence. Horizontal movement now establishes persistent shot placement; releasing movement keeps that placement while allowing the player to plant. Tapping the opponent's court selects an exact horizontal aim without moving the player through the net. The gold target and HUD direction show the chosen angle. Clean, planted low contacts consistently drive; stretched contacts remain less accurate. Human contact quality no longer deteriorates merely because a rally has lasted longer.

The rival deliberately drops into the space in front of a deep player, lobs over a player camping near the net, attacks an open wing otherwise, and recovers toward a central supporting position. Reaction delays and finite movement speed remain. Return messages identify short, deep and wide threats. Clean return totals and best rally appear at match end to make a rematch goal concrete without adding an extra power system.

The ball radius is visually increased from 0.22 to 0.30 for readability. Court boundaries are flat cream paint rather than thin rounded rails; both halves share teal tones. Sparse placement marks, a gold selected target, a persistent receiving-position ring and a shrinking coral landing ring connect anticipation to contact. All added geometry is created at mount, and the landing predictor remains throttled to 10 Hz. The parent task owns closer aspect-aware camera framing and the shared HUD.

Engine validation: the simulation suite now also verifies left/right placement after releasing input, reliable planted drives, lower quality for stretched contact, and rival drop/lob choices against deep/net camping. TypeScript validation passed. These fixtures establish mechanic correctness, not subjective enjoyment.

Player-experience validation uses `node scripts/check-soccer-tennis-browser.cjs --play` and the `--mobile --play` variant. The driver reads live state to choose inputs but interacts exclusively through keyboard or CDP touch joystick plus button taps; it never injects a ball, score, player position or clock. It captures incoming play, plays through match end and retries. Desktop completed 7–0 with a best rally of 24 and 35 clean returns. This demonstrates achievable deliberate returns through the input path, not a claim about subjective fun or human win rate. A later version of the check intentionally leaves returns unanswered after 45 seconds to cover visible failure as well as sustained play.

Runtime additions are five small static ring meshes (three painted placement marks, selected target, landing countdown), plus the existing pooled trail and contact markers. No additional renderer, physics loop, recurring timer or unbounded effect was introduced. Desktop/mobile screenshots are `/tmp/fi-tennis-incoming-desktop.png` and `/tmp/fi-tennis-incoming-mobile.png`.

Final stable mobile touch run passed: a 33-touch rally and 15 clean returns before the driver deliberately stopped returning after 45 seconds; the rival then won 7–1. Game-over summary, Play again reset and an intentionally unanswered first return after retry all passed without injected state or JavaScript errors. Final captures include `/tmp/fi-tennis-result-mobile.png` and `/tmp/fi-tennis-missed-return-mobile.png`. The initial shorter long-play attempt hit its wall-time guard while shared development files were still changing; the final harness detects hot-reloaded runtimes and resumes legitimate browser-blur pauses before testing further.

Final desktop smoke and mobile full-play runs also reconfirmed exact stopping, settled-serve sleep and pause sleep. Production build remains the parent integration gate; no deployment or physical-device temperature claim is made.

## Motion continuity pass

The next review focused on sequences: the former pose began at 70% kick extension, peaked late after the ball had already left, and rotated toward the departing ball throughout recovery. Its receiving preparation was passed as a negative kick value, which the shared rig clamped to zero. The ball also computed side rotation as current spin multiplied by total match time, creating a visible orientation jump whenever spin changed.

Tennis now supplies receiving anticipation and real planar velocity to the shared rig, records the outgoing strike facing, holds it through a 0.42-second smooth contact/recovery envelope, and faces travel during recovery while watching the ball when receiving. Point announcements retain movement back toward the baseline instead of freezing both players before the next-serve reset. Side spin integrates continuously, and the enlarged ball sits on the court at its visual radius. The existing trail samples at a bounded 30 Hz and hides under reduced motion.

New engine checks cover stable strike orientation, sustained recovery and movement toward the baseline during a point. The browser `--play --sequence` option captures pre-contact and five subsequent frames, plus a timing/pose JSON file, through the ordinary input path. Shared rig changes and loop timing remain owned by the parent integration task.

Sequence review found a final contact-facing issue: simply tracking a ball that had moved behind the player left the body about 70 degrees away from the strike direction just after contact in the desktop capture. Receiving stance now opens toward the intended return within the final two metres. In the later mobile sequence, yaw was 3.077 radians about 58 ms after contact versus a strike direction near 3.129, then smoothly settled through 3.126 and 3.129. Kick recovery decreased continuously from 0.362 to 0.262, 0.162, 0.028 and zero while the ball continued its flight. These are observed sequence samples, not a controlled performance benchmark.

Captures: `/tmp/fi-tennis-motion-desktop-0.png` through `-5.png`, `/tmp/fi-tennis-motion-mobile-0.png` through `-5.png`, and the corresponding `fi-tennis-motion-*.json` timing records. The mobile sequence was visually inspected for receiving preparation, planted strike, ball separation and recovery. The desktop sequence predates the final receiving-facing correction; the mobile sequence includes it.

A bounded 0.2-second visual tail lets rig damping settle after physical movement stops, then the serve sleeps. The mobile check now explicitly cancels a real CDP touch and checks both neutral input and recentered thumb feedback. Shared controls fire Tennis actions on press, eliminating the previous wait for touch release. Portrait remains the intended Tennis orientation so the full court depth and both thumb controls stay readable.

Final motion-pass validation: simulation suite (including new motion regressions) and TypeScript passed. Desktop sustained play reached a best rally of 16 with 9 clean returns before intentional missed-return testing; mobile reached 26 with 15 clean returns. Both completed failure/game-over/retry paths and maintained idle/pause sleep. Mobile additionally passed canceled-touch input/visual reset. These automated drivers read live state to choose real inputs; they do not inject possession, points or ball positions. No physical-device thermal or native Safari gesture conclusion is implied.
