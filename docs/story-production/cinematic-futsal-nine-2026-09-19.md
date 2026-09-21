# Futsal and 9v9 cinematic illustration pass

Local implementation; not deployed. Scripts, narration files, timing and progression are unchanged.

`lib/paths/films/cinematicFutsalNine.ts` supplies six narration-led scene callbacks to the shared cinematic engine. Each ten-second chapter stages two or three actions through bounded phase ramps. Generic anonymous footballers illustrate the spoken football cue; no fictional character plot is introduced.

| Film | Illustration progression |
| --- | --- |
| The Chalk Line | Begin a chalk mark; explore branching marks; control a first touch; scan pressure/support; notice an oversized touch; pass and try again. |
| The Woven Court | Support a stretched strand; connect threads; pass then offer support; change forward/support roles; recover around the goal; connect and pass. |
| The Kite That Turned | Notice a blocked route; turn a kite with the wind; breathe and look again; keep a close touch; pass then move; retain the kite's connection while adjusting. |
| Different Tides | Notice different learning actions; watch separate tide pools fill at different rates; shoulder-scan; practise the scan before receiving; compare an earlier attempt; connect the pools without equalising their levels. |
| The Harbour at Night | Pause after playing; fold a boat's sails at its mooring; notice mental noise settle; speak to a coach; make space for bed and reading; check in before opening the sail. |
| The Unfinished Map | Notice a blocked pass; revise a pencilled map; ask a coach for detail; check the blocker and change angle; preserve the person while the ball leaves; revise and try again. |

The palette and large cut-paper objects follow the actual Grit and Regulating Emotions Canvas films. Boots include laces, soles and studs; balls have panels; figures have articulated limbs and scanning heads. Oversized backgrounds cover the viewport. The shared engine supplies print grain, camera pushes and expanding-object transitions.

## Work and checks

No image/network assets, timers, additional canvas or animation loop are introduced. Paths are drawn directly with bounded loops; tide pools use filled ellipse segments instead of clipping masks. Existing player pause/visibility/reduced-motion scheduling remains responsible for frame work. This is more illustration work per frame than the former generic forms; no physical-phone heat claim is made.

- Isolated TypeScript compile of scene module and shared engine passes.
- Actual Chromium renders180 raw phase samples (six films × six chapters × five phases) without drawing errors.
- Shared-engine checks render216 phase/transition samples at390×844 and another216 at1440×900.
- All36 scenes at both sizes produce identical reduced-motion pixels across changes to external time/progress, using a deterministic readback test context. The application retains its ordinary render context.
- Contact sheet and representative phone/desktop frames were inspected. Fixed duplicate first-touch ball, night hull contrast, head occlusion and tide-pool rendering during review.

Evidence: `/tmp/fi-cinematic-six-contact.png`, `/tmp/fi-drawChalkScene-390.png`, `/tmp/fi-drawRestScene-390.png`, `/tmp/fi-drawMapScene-390.png`, and corresponding1440px frames. Test harness `/tmp/fi-cinematic-six-audit.cjs`. These check the real shared engine and Canvas drawing in Chromium; full routed-player checks belong to the integration audit.
