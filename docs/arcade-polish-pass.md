# Arcade game-developer pass — September 27, 2026

Local changes only. No commit, deploy, server restart, wallet edits, new assets or new rendering loops. This pass applies the game-developer skill to the current neon games; earlier tactical stages, cinematics, bean rigs and physical ball systems were already present and were preserved.

## Game-specific critique and implemented response

| Game / satisfying skill | Finding and player consequence | Change / retained strengths |
| --- | --- | --- |
| Tennis: plant, judge the bounce and return into space | The Perfect Return reward already existed, but its narrow timing condition was hidden behind the generic gold contact ring. Players could earn it without understanding how. | Exported one authoritative `canTennisPerfect` predicate for scoring, the mint contact ring and `PERFECT WINDOW · kick now` HUD cue. Moving too quickly or arriving late removes the cue. Existing aerial poses, distinct shot trails, landing guide, five tactical courts and restrained slam camera remain. |
| Pinball: alternate feet, build a chance, place the finish | An immediate first-launch drain used a full ball before a beginner could learn the flipper timing. | One three-second opening grace rescue per run, counting only time in the playing field, preserves that ball and explains the relaunch. Relaunches cannot replenish it; a goal or expiry consumes it. Scores and later drains remain physical. Existing rotating-capsule flippers, dazed defenders, keeper commitment, nudge, corner pockets and divisions remain. |
| Breakaway: read the next lane and prepare the next action | Jump/slide presses just before landing disappeared. A charged release just before recovery finished also disappeared, wasting preparation and feeling unresponsive. | A 180 ms bounded landing buffer accepts the latest Jump/Slide. Early airborne input expires, preventing automatic hopping. A release in the last 160 ms of slide/cooldown preserves shot power until recovery completes. Cancel/pause clears pending moves and shots. Existing authored safe routes, telegraphed defenders, returned shots, power blasts and aerial volleys remain. |
| Strikers: make an angle, pass, move and finish | Keeper saves always requested the same upright save animation regardless of where the ball contacted. | Latch contact side, height and width before clearance moves the ball. Central stops stay upright; wide stops use the native directional side dive and recovery. Root rotation remains upright. Existing assisted receivers, first-time one-twos, cover shadows, committed tackles and charged close-up remain. |
| Pass Puzzles: draw a deliberate route, predict its consequence and learn from a retry | Coalesced pointer samples lost their individual timestamps; the engine could interpret a batched sweep as effectively simultaneous. Opening the chooser could retain an aim/replay focus. Defenders scanned indefinitely at 15 fps while a phone sat untouched. | Preserve monotonic coalesced event timing, cancel the active gesture and clear replay focus on chooser navigation. Ambient defensive scans settle after four seconds without interaction, then sleep. Pointer input, a new receipt or other deliberate control wakes the view. Existing Ground/Lift/Shoot, automatic/manual power, predicted dots, one rewind, readable number tags and native keeper/goal animation remain. |

## Loading, presentation and controls audit

- Each game uses the existing dark textured fallback, brush title and shared loading track. The fallback has no additional scene, rendering loop or artificial wait. Current browser routes entered the playable scene successfully; this pass did not redo prior delayed-chunk loader assertions.
- Mobile tennis action capture at 390×844 shows the court spanning nearly the available width, readable ball/contact guides and the circular joystick/actions inside the screen. A real touch joystick drove a deliberate returned ball. The action sequence shows native leg recovery while the ball leaves; no secondary root animation was added.
- Strikers retains its landscape requirement on phones. Touch holding produces the existing close camera/slow motion and releasing produces a physical shot; rotating to portrait pauses and sleeps.
- Puzzle chooser, brief, result and exit remain explicit. A failed ordinary gesture can be retried and solved without injecting a solution. The raw squiggly line remains hidden; only the predicted flight is rendered.
- Existing audio dispatch remains gesture-unlocked and respects mute/volume. No new contexts, sounds, timers or haptic loops were introduced. Physical speaker/headphone balance and native vibration were not evaluated remotely.

## Engine correctness

Passed:
- `node tests/arcade-polish.cjs`: rescue limit, no relaunch farming, landing buffers, expiry, preserved charged power, cancellation, perfect-window predicate and keeper contact direction at 30/60/120 Hz.
- `tests/arcade-new-moves.cjs`, `tests/striker-match.cjs`, `tests/striker-depth.cjs`, `tests/runner-depth.mjs`, `tests/tennis-circuit.mjs`, `tests/pinball-divisions.mjs`.
- `scripts/check-soccer-pinball.mjs`, `scripts/check-soccer-tennis.mjs`, `scripts/check-arcade-runner.mjs`; the pinball ordinary-drain fixture explicitly disables the new opening rescue, which has separate positive/negative coverage.
- `tests/pass-puzzle-gesture.cjs`.
- TypeScript passed after the concurrently developed book-reader module became available. Root owns final repository-wide integration checks.

## Player-experience evidence

Browser checks use isolated seeded coin storage only to pay entry. Ordinary-play observations below read state to select real keyboard/pointer/touch inputs; they do not inject goals or move actors. Test-adapted copies under `/tmp/arcade-polish-*` preserve the established scripts while supplying current paid-entry fixtures and direct arcade routes.

- **Tennis, desktop:** completed an ordinary keyboard match, including 10 clean returns and a nine-touch best rally; deliberate inactivity then produced a 3–7 loss. Retry and a subsequent natural missed return passed.
- **Tennis, phone:** opening serve, touch steering, planted deliberate return, cancellation, paused sleep and native recovery action screenshots passed. Screenshot sequence `/tmp/fi-tennis-motion-mobile-0.png` through `-5.png`; first contact frame visually inspected.
- **Pinball, phone:** ordinary touch launch and two timed flipper strikes passed. Stopping defence led to natural game over; paid retry and a new launch passed, with zero browser errors. No ordinary goal was scored in this short sample. The first retry harness raced the asynchronous entry debit; waiting for the playing phase fixed the test without changing product logic. Active table frame inspected.
- **Breakaway, phone:** ordinary swipes and shots reached 590 m with eight lane changes, three goals and 9,800 points; visible defender shifts and committed challenges observed. This successful run did not reach natural failure; failure/retry is covered by the existing engine checks, not claimed as fresh phone experience evidence.
- **Puzzle, desktop:** the added assertion confirmed a settled aiming screen stopped changing its frame counter after four seconds and woke for the next gesture. Mouse cancellation, failure/retry, pass/goal and chooser sleep also passed; goal-action frame inspected.
- **Puzzle, phone:** ordinary canceled gesture, hold lift, deliberate failure, retry, successful pass/goal, chooser sleep and exit passed without browser errors. Predicted path had 13 dots, raw stroke zero, and receiver cue visible.
- **Strikers, desktop:** 55 seconds of ordinary keyboard play completed an assisted pass and nine shots/goals without browser errors; the beginner round is deliberately forgiving. Sustained defending, full-time failure and upper-round balance were not established by this short run. Active match frame inspected.
- **Strikers, phone:** real touch charge/release, cinematic zoom/slowdown, orientation pause/sleep and resume passed. Keeper save and end/retry assertions use explicit fixtures and prove integration, not ordinary match balance.

## Runtime costs and limits

- New mechanics add only scalar state and bounded comparisons in existing update paths. The timing indicator recolors/resizes an existing ring. Keeper dives reuse the native rig and already allocated save structs. No geometry, materials, lights, post-processing, blur, background polling or RAF chains were added.
- Pass Puzzle reduces sustained idle work: four seconds of existing 15 fps defensive anticipation then zero frames until interaction. Active drawing and flights retain existing 30 fps touch / 60 fps desktop caps.
- Existing effects pools, reduced-motion behavior, hidden/paused sleep and disposal remain authoritative. No claim of lower physical iPhone temperature or native touch/haptic quality is made from Chromium emulation.
- Remaining design work is balance rather than feature count: longer human sessions in upper tennis courts and later runner/Strikers stages; whether the three-second beginner pinball rescue is sufficient; readability on a physical small phone in bright light. These need human/device observations, not more injected goals or particles.
