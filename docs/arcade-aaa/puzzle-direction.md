# Pass Puzzles direction: "The Tactics Pitch" (comic house style, Nov 10 2026)

One sentence: a training pitch on the Breakaway coast at golden hour, printed like a comic page; you read the frozen moment and
ink the pass with one brush stroke. Supersedes "The Coach's Table" (felt and wood): the owner ruled the arcade takes Breakaway
Run's look ("update the pass puzzle game to match the style of the breakaway game"). First conversion; pattern for Pinball and Tennis.

## Shared with Breakaway (one implementation)
- 3D: `lib/arcade/comic/` (band shading, halftone turn, violet shadows, sun rim, ink edge, inverted-hull props, impact star,
  `comicLook`). HUD: `components/games/comic/` (`comicRoot` tokens + shared pause card, boards, score pill).
- Palette (hex): ink `#231a2e`, paper `#fff3d6`, sun `#ffc83a`, orange `#ff8a3c`, red `#f0452e`, teal `#19b5a5`, blue `#2f6fb0`,
  turf `#57b56a` / `#49a660`, verge `#86c867`, sand `#f4d08c`, sea `#1f8f96` / `#2b6fa3`, glitter `#fff1b0`.

## Its own world
- Pitch: flat turf in two printed mowing bands, paper lines with an ink copy offset under them, a red-and-white kerb all round.
- Pitch side (one receiving mesh + one casting mesh per level, ink hulls baked in): beach, surf line and banded sea with a glitter
  path beyond the far end, advertising boards behind the goal (sunlit: they and the far kerb print in the light band), palms, parasols, a sail boat, the coach's cones, ball bag and
  spare balls on the near side. The coast is laid out in the view frame, so the sea is always up-screen. On an upright
  phone the painted horizon (sea strip, sun, headlands) stands just behind the boards, square to the lens, so the sky is in frame.
- Light: one white sun, 24 degrees up, far and 35 degrees left of the view, re-aimed per level: long violet shadows rake toward
  the coach and break into Ben-Day dots at their edges. No tone mapping, no fog haze, no vignette.
- Players (Nov 10, owner: "the pass puzzle should be using the bean characters"): the island's real bean rigs, the shared arcade
  rigs from the stage (`stage.player`, as Breakaway and Pinball), in print kits (attack sun yellow with paper trim, defence blue,
  keeper red with gloves; attacker 0 is the child's own bean) with the kit's bands, sun rim and ink edge. They run to position,
  plant and draw the leg back in the wind-up, strike through, cushion on the foot, chest / thigh / head the ball, lunge or slide to
  intercept, dive (the rig's own dive), celebrate with the authored skill moves and bow on a fail. Number badges are caption discs
  pinned over each head.
- Heat for the rigs: no rig mesh casts a shadow (one instanced low-poly proxy does); materials are cloned once per source; the back
  number is off the camera layer; body and limbs draw through coarser index views of the shared geometry (body 1920 to 480
  triangles, limbs 3032 to about 1830, same vertex buffers); a rig is posed only while it moves or for 0.5 s after, then sleeps.

## The pass and the states
- Drawn pass: a bold brush stroke (dark ink edge baked into the atlas, the core tinted clear / tight / blocked, dry bristle gaps and
  split ends). Lifted passes thin out with beads in the air. Completed passes stay as thinner ink. The ball trails speed streaks.
- Threats: red ink hatching, red arrows, a red cross. Fail: an ink splat lands under the cross, the card label is a cracked red panel.
- Goal: the kit's impact star at the net, confetti in print colours, the splash word (red or teal star burst, sun lettering).
- Kept and restyled: offside line and flag, intent tags, sweeper zone, hint ring, called-run arrows, cup tints, wet pitch (teal
  turf), first-time clock, scan lanes, brief card, multi-pass, landscape.

## HUD
- Kit chrome for the pill, pause key, pause card, boards and high-score entry. Mode keys are bold inked keys (48 px, capitals,
  chosen = sun with dots, pressed in, teal focus ring). Cards are tilted paper panels with a block shadow; labels are ink captions; headings condensed italic
  capitals; stars sun yellow with an ink edge. Buttons: UI sans 800. No fonts declared (the stationery `@font-face` set is gone).

## Sound (synthesised one-shots, one trim + limiter bus, 8 voices)
- Cajon tap for the strike and first touch, steel-pan / kalimba note per pass on a pentatonic, brush swish while drawing, a dab on
  lock-on, print thud for stars, a short hand-played goal phrase with two claps. Calm on purpose: no loop, no crowd.
- Probe (`scripts/check-arcade-audio.cjs --port=<n> puzzle`): draw 0.004, pass complete 0.038, solved 0.061 peak RMS; menu 0.

## Endless Run (Nov 10, the main arcade entry; `lib/passPuzzle/endless.ts`, `tests/pass-puzzle-endless.cjs`)
- Puzzle after puzzle with no menu, three lives (a failed puzzle or a Skip costs one; a fail serves the same puzzle again), score
  in stars on the one `puzzle` board. Each puzzle is an authored scenario picked by measured difficulty and remixed (mirror, shift,
  up to two added defenders, one pressing); served only after its route solves it in the engine with heading on and off.
- Ramp: levels 1-2 gentle openers, Scan on; 5+ no Scan (hint key only); 6+ a thinking clock, 45 s shortening 2 s a level to 15 s;
  7+ one added defender; 10+ no hints; 12+ the added defender presses; 15+ two added defenders; rating window climbs to the
  expert chains by level 22. Stars: 1 solve + 1 the taught move + 1 first try, +1 on every fifth first-try solve in a row.
- HUD: level stamp, three lives, clock bar (one CSS animation), Skip; the concept line shows in a caption for 2 s while the next
  puzzle is already live; an ink wipe covers the 0.15 s load. Full-time card, then the shared high-score entry.

## Aim anywhere in the goal (Nov 11, owner: "allow to shoot anywhere on the goal ... top bins and in the corners")
- Input (one gesture, no extra step): the stroke is drawn as before; where the finger's ray meets the goal face is the spot. On the
  grass in front of the line it is the plain low shot, exactly as before (every level and Endless route unchanged); on the net it is a
  placed shot: left / right and low / mid / high, continuous, top corners included; above the bar or outside a post is an honest miss.
  A goal smaller than 64 px on screen aims as if it were 64 px tall, so a thumb reaches the top. The Shoot key's Height slider is the
  same placed shot without pointing. Lifting the finger shoots: nothing to confirm, no pause in Endless.
- Aim panel (`data-aim-panel`): a paper panel beside the finger, like a text loupe, with the goal face as the camera sees it, the
  keeper, a sun reticle and a dashed ring as wide as the scatter (orange when the edge of the ring would not score, red when the spot
  is off the frame) and one word (LOW CORNER, TOP BINS, HIGH, OVER, WIDE). On the pitch: the same reticle and ring stand on the goal
  face (two draws, only while a placed shot is aimed) and the paper beads show the arc. Filled on input; no loop, no animation.
- One-time cue (`data-aim-cue`, flag `aimCue` inside `fi2-pass-puzzles-v1`): the first time a finish is on, a small sticker draws the
  stroke going up to the corner with the words "Draw onto the net". It is the one exception to the clean pitch, shown once.
- Engine (`lib/passPuzzle/aim.ts`, `Kick.place`): scatter radius = (0.15 + 0.85 x height share) x (0.016 x metres out + 0.45 x
  pressure), capped 1.5 m; pressure is 0 with the nearest defender 3.5 m away and 1 at 1 m; the offset is a hash of the state and
  the aim (deterministic, replays match). The aim preview is the clean strike; the dice are only in the ring. The keeper against a
  placed shot: from 0.9 m up to 2.0 m his reach shrinks by up to 50% and his move across slows by up to 55%. Centred keeper, half
  power: a low corner scores from up to 20 m, the top corner from up to 24 m; at the keeper never.
- Feedback: the net bulges where the ball went in, a top-corner goal gets the star half as big again, the word "GOAL! Top bins", a
  brushed net ripple and a goal beat that leans up to the net; POST! / BAR! with a woodwork knock and sparks at the frame; OVER! /
  WIDE! / SAVED! for the other misses; the keeper dives to the height the shot is going to. The result card (and the Endless note on
  a miss) carries one coaching line: "Low into the corner: the keeper could not get down in time", "Too close to the keeper: pick a
  corner away from them", "Over the bar: you were stretching. Far out or under pressure, keep it low".
- Heat: 0 added draws at rest and in flight; +2 while the finger is on the net. Three extra look-aheads per preview (at most every
  80 ms, on input) for the risk colour. Shots: `shots/puzzle-aim.png`, `puzzle-topbins.png`, `puzzle-post.png`.
- Falls short: the scatter is a hash of the aim, so the same spot from the same state always lands the same way (a child may learn a
  spot, not the habit); the panel hides part of the score bar when the goal is near the top of a phone; curl is not shown in the
  panel; the Shoot key and its slider now overlap with pointing and could be retired.

## Budget (phone profile, dev server, desktop Chrome: no phone temperature measured)
- First puzzle (5 players): 38 draws / 22.8k triangles / 15 textures (rigid figures 30 / 18.7k / 13; pre-rebuild beans 95 / 63.9k).
- Largest puzzle (Two Hunters, 11 players): 55-56 draws (61 for 0.6 s in a goal beat) / 40.3k triangles (42.3k max).
- Menu 0 frames; aiming idle 3 frames in 5 s; 0 frames 4 s after a result. Limit for later passes: about 55 / 45k / 16.

## Falls short (ranked)
1. On a phone the sun sits behind the Arcade key and the score pill; boards that fill the top of a tight crop leave little sky.
2. Bean faces ignore the head joint, and the receive / chest / thigh touches are short at this camera distance.
3. Endless variation is mirror, shift and added defenders; roles are not swapped and no pitch is generated from nothing.
4. Desktop still frames the sea, not the horizon panel (phone only so far).
