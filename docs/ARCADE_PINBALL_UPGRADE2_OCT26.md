# Futbol Pinball upgrade 2: full-screen cabinet, action camera, thumb pads (Oct 26 2026)

Owner feedback (phone, portrait): the table was small with dead space above and below; Left / Launch / Right were small
circles in a strip under the table; the tip pill sat above them. Follows `ARCADE_PINBALL_UPGRADE_OCT25.md`.

## What changed

**Fill the screen** (`lib/games/soccerPinballCamera.ts`, `pinballCameraLayout`). The camera is solved on resize only:
the goal crossbar sits just under the HUD and the flipper tips just above the thumb pads, at the lowest pitch (most
cabinet depth) that still fits the playfield rails edge to edge. Tall phones are width-limited, so the solver goes more
overhead (up to 74°) and splits any spare height. The cabinet apron and the drain corners bleed off the edges. The drain
strip below the flippers is behind the translucent pads, and the HUD row floats over the top of the cabinet.

**Action camera** (same module, per frame, no allocation). The game state picks a shot and the camera eases to it with
damped, rate-capped values (zoom 0.62/s, pan 12 u/s, tilt 0.32 rad/s):
- `launch`: each new ball starts low behind the plunger lane (dolly toward the lane, -7.5° pitch), then eases to the table
  as the ball runs up the lane.
- `flippers`: the ball coming down pushes in, anchored on the flipper line, so the flippers keep their place on screen.
- `goal`: the action up top pushes in toward the goal mouth.
- `play` / `multiball`: centred on the look-ahead point (ball + 0.14 s of velocity); multiball stays wide on both balls.
- `celebrate`: a goal gets a 0.95 s push on the net, then settles wide.

A safety pass runs after composing. It pans just enough to keep every live ball inside the screen, under the HUD and
above the pads. It keeps the goal framed while the ball is up top and the flippers framed while it is lower down. Every
shot except the flipper push and the celebration keeps both ends of the table: if no pan fits both, the zoom backs off
(bisection, on those frames only). Reduced motion keeps the home framing fixed, with only a gentle pan to lift the
plunger ball above the pads. A settled launch camera reports `moving()=false`, so the waiting table still sleeps.

**Thumb pads** (`ArcadeGame3D.tsx` / `.module.css`, scoped to `[data-arcade-kind=pinball]`). The controls overlay the
table instead of sitting in a strip:
- Left and Right pads are 120 px tall rounded pads (96 px with a desktop mouse) that fill the lower corners. They are
  translucent so the drain strip shows through.
- A 150–168 × 64 Launch pill sits between them, with a charge fill (`--charge` = launch power, written by the frame loop
  only when it changes, `transform: scaleX`). It becomes a 52 px Nudge pill during play.
- `[data-held]` mirrors the live flipper, so the pads light up and shrink whether the press came from a pad, a
  half-screen touch zone or a key.
- Presses fire on pointerdown, one pointer per pad, so both thumbs work at once. Cancel, lost capture, blur and pause all
  clear the flippers, and a cancelled press never flicks.
- The tip sits above the Launch pill over the drain strip, never over the flippers, and fades after about 3 s (coach
  lines stay).

**Feel:** flipper presses add a 5 ms haptic tick (Android, throttled, off under reduced motion). Sounds are unchanged:
the solenoid thunk, plunger spring and bumper pops already share the capped voice pool.

## Cost
Per frame: about 10–25 `Vector3.project` calls on scratch vectors, plus a 7-step bisection only on frames where both
ends don't fit. The home solve runs on resize only. There are no new draw calls, lights or DOM writes per frame (the
charge variable is written only when it changes; pads update through attributes on press). There is no new animation
loop: the CSS tip fade is a one-shot animation.

## Tests / QA
- `tests/pinball-camera-oct26.cjs`: home framing at 7 sizes; the flipper and goal pushes keep the flippers above the
  pads; zoom rate cap; multiball stays wide; goal push then settle; launch camera, with the ready table going to sleep;
  reduced motion stays fixed; no per-frame allocation.
- `tests/pinball-controls-oct26.cjs`: markup, pointerdown with multi-touch, nothing stuck, every rule scoped to pinball,
  the camera's pad band matches the CSS, and the tip fades.
- Headless Chrome (`--mute-audio`) at 390×844, 430×932, 360×740, 820×1180 (touch) and 1440×900 (mouse): screenshots at
  ready, charge, launch and play. Synthesized multi-touch: both pads together, one thumb lifted, touchcancel, a
  half-zone press lighting its pad, and blur while held. Nothing is clipped and there are no page errors. Phones show the
  rotate lock in landscape, so landscape was checked as a 900×480 mouse window.
- `scripts/check-soccer-pinball-browser.cjs` passes its framing, sleep and two-thumb steps, then stops at its `/FINISH/`
  combination-message step. That step is stale: no pinball module contains "FINISH" any more. The script is not in
  `npm test`.

## Eyeball on a real phone
- Thumb comfort: the 120 px pads and the Launch pill in Safari with the toolbar shown (about 390×664).
- How the launch close-up eases to the table, and whether the flipper push feels helpful rather than busy.
- The haptic tick on Android.
- The pads' translucency over the drain strip in bright light.
