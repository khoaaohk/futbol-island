# Arcade character integration review — September 26, 2026

Local implementation; not deployed. Preserve Claude's bean skin, costumes and motion solver. Game-developer review focuses on contact, readable opponent roles and action recovery, not adding visual noise.

| Game / skill | Integration defect | Change |
| --- | --- | --- |
| Breakaway / read a defender, choose a route, time the finish | Role recoloring targeted hidden classic meshes; additional joint edits overrode the new tackle solver | Visible bean role dresses; use authored slide, airborne leg/arm and landing channels; physics owns jump height |
| Tennis / plant, place a return, recover | Every return aimed the boot at a fixed point with identical strength | Latch actual local contact and action power throughout follow-through; distinguish soft passes and driven returns |
| Pinball / alternate feet and exploit openings | Old keeper root roll and manual limb edits competed with new save animation; patrol timers/velocity could disagree with actual movement | Authored side/standing saves, coherent block/daze recovery and actual keeper velocity |
| Strikers / create passing angles and finish | Passes animated as shots; keepers turned along lateral travel and kicked every save; retry retained rig action channels | Different pass/shot intent and power, keeper ball-facing ready/save poses, clear rig state on retry |

Shared adapter latches contact coordinates, action kind and strength at the existing gameplay contact. It never delays ball release for animation. Optional dive/jump channels delegate articulation and ground handling to the existing solver. Jump lift remains simulation-owned so it is not applied twice. Pooled actors can change visible dresses without rebuilding rigs. Intentional daze overlays can refresh world transforms before positioning stars.

Runtime constraints: reused per-player pose objects; no extra render loops, geometry, lights or effects. Existing fixed effect pools and paused/hidden sleep remain. New joint/world refresh is limited to the game-owned overlay attachment path. No claims about physical phone temperature or native Safari are supported by desktop emulation.

Validation is recorded below after desktop/touch browser runs. Deterministic fixtures and real-input play are separate evidence.

## Verified integration checks

- `npm test`: passed, including device guards, frame cap, sleeping HUD/arcade behavior and heat policy regressions.
- TypeScript check: passed during integration (final check repeated after last source changes).
- New `tests/island-arcade-player.cjs`: preserves contact/power/action through follow-through, forwards native move channels, keeps jump height simulation-owned, resets actions and supports pooled outfits.
- Runner, Tennis, Pinball and Strikers simulation suites: passed. These are engine evidence, not claims about subjective feel.
- Native `player-dive-jump`, `skill-moves` and `bean-skin` suites: passed. Bean browser shader check required an unsandboxed local test server; GPU/CPU limb IoU 0.9838. No skin or solver code was edited in this pass.
- Strikers desktop and touch fixtures: shot release, save collision/bean presence, complete-pitch framing, orientation gate, paused/end-state sleep and retry passed without browser errors. Save captures reviewed at 1280×800 and 844×390. Mobile framing was subsequently tightened and actor scale raised from 1.8 to 2.05 for readability; final mobile validation follows below.
- Runner and Pinball per-game evidence appears in their September 26 review notes. All screenshot review uses action frames, with fixtures labeled separately from ordinary-input play.

The expanded move library is integrated selectively: Runner uses authored jump/landing, slide, poke tackle and block tackle; Tennis uses the volley for a high-ball slam; Pinball and Strikers use save families. Ball-carrying tricks are not overlaid on unrelated simulation paths: those moves also require their matching root travel and ball trajectory to keep contact credible. Expressions now follow anticipation, charging, celebration and daze through the existing cached face atlas.

Final ordinary-control evidence so far: Breakaway desktop and mobile both scored three goals with repeated precision finishes and lane changes; desktop then naturally lost and retried successfully. Tennis keyboard and touch both produced confirmed physical returns and visible recovery; its separate desktop/mobile volley fixtures passed. Pinball desktop ordinary play produced two goals, one completed build-switch-finish move, a natural game-over and retry. See per-game notes for full details; none of these are physical-phone thermal measurements.

Pinball's mobile ordinary run also passed (16 strikes, three goals, two completed moves, natural game-over/retry). Strikers' 55-second ordinary touch run completed a pass and two shots, with a 0–1 score and no errors: this demonstrates playable exchanges, not a claim that the user-side scoring balance is solved. The final landscape phone camera shifts the pitch left by 7.5% of the canvas width to leave space for right-thumb actions; no control axes, physics or desktop framing changed.

Final mobile Strikers fixture passed again after the camera offset, with no page errors. Reviewed the new landscape save capture: the characters are larger, the pitch moves away from the dense right-action cluster and goals stay in frame. TypeScript passes on the final source. Existing desktop shader/geometry tests are correctness evidence; no frame-rate improvement is claimed from these browser runs.

Final desktop Strikers ordinary-input run passed: 55.03 simulated seconds, one completed pass, 12 shots and an 8–1 score, zero browser errors. Desktop and touch drivers produced different match outcomes (touch 0–1); these runs are control-path/correctness evidence and do not establish equal difficulty or subjective fun across devices. All browser processes from this review have exited. No deployment was performed.
