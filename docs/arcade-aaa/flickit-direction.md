# Flick It: direction (Nov 21 2026)

Owner: "make that a flick game. make the flicking mechanic really fun and dynamic. make the targets not just goals, but different
objects. the game needs to have more depth and angles." It takes the slot of the rejected goalkeeper game. Not a goalkeeper game.

## What it is
A 3D trick-shot game. One ball on the ground, one finger. Swipe up through the ball and it flies into a real scene full of things
to hit: can pyramids, bottles on a wall, bins, hoops, a swinging tyre, balloons, barrels, a bell, shed shutters, a coach's whistle
sign, a rolling trolley, and sometimes a goal with a wind-up keeper behind a wall of mannequins. Six places on the island, each seen
from a different camera, plus one seeded stage a day.

## The flick (lib/arcade/flickit/core.ts `flickToShot`)
Only the last 280 ms of the finger path counts, so a slow drag followed by a snap is a snap.
- **Power** = finger speed (screen widths a second). Slow = a pass, fast = a drive (9.5 to 26 m/s).
- **Aim** = the direction the swipe STARTS in, mapped through the camera (the view measures the ball's place and the horizon).
- **Curl** = how far the swipe's direction turns between its start and its end. Bend the finger right and the ball bends right.
- **Lift** = swipe length. A short stab stays low, a long sweep gets up.
- **Dip / float** = the finger speeding up (laces through the top half: it dips) or slowing down (a soft chip: it hangs).
Flight: gravity, a little drag, a Magnus side force from the curl that fades, a dip force. Fixed 1/120 s steps, seeded, no library.

## Depth and angles
Targets sit at 5 to 22 m, from the grass to 4 m up, left and right, some behind others. Obstacles stand in front: mannequin walls
(curl round), a fence (lift over), a keeper (beat). Every stage has its own camera and the camera flies in over the layout at the start,
chases the ball in flight and cuts back for the next flick.

| # | Place | Camera | Lesson |
| - | - | - | - |
| 1 | Back Garden | behind the ball, eye level | pick one target; laces = straight |
| 2 | Town Square | low and wide, looking up | lift comes from the follow-through |
| 3 | Training Pitch | side-on from the right | inside of the foot bends it round the wall |
| 4 | Palm Beach | high over the shoulder | weight of shot: barrels need a firm strike, bins a soft one |
| 5 | Rooftop Cage | long lens from far back | up and over the fence: dip it |
| 6 | Island Stadium (night) | low, close, dramatic | all of it |

## Targets and reactions (cheap rigid bodies: boxes, spheres, capsules, rings)
Cans, crates, bottles, cones and barrels are bodies: hit them and they fly, tumble, bounce and knock their neighbours; anything that
loses the thing it stood on falls. Barrels need weight (a slow ball only wobbles them). Balloons pop without slowing the ball (thread
several). Hoops and tyres score through the middle and ping off the rim. Bins score from above. The bell, sign, shutters and trolley
ring, spin, swing and stop. Crossbar and posts ping. No glass: bottles are plastic, shutters swing.

## Scoring
Each target has points. One flick's 2nd, 3rd... hit is worth x1.5, x2, up to x4 (chain reactions count). Trick bonuses once a flick:
Curled it (150), Round the wall (250), Up and over (200), Bank shot (200), Long range (100). Clearing with flicks to spare: 150 each.
Stars at 30 / 60 / 100 percent of the stage's target points. The Tour plays the six stages in order (one star to go on); its total
goes on the one all-time top-20 board. Daily Flick is one seeded stage, the same on every device, saved on the device (no daily board).

## Teaching
A line at the start of each stage, a word on every trick, and one tip on the results card chosen from what just happened
("Curled it! Strike across the ball with the inside of your foot"). The foot is named on every curled kick: laces, inside, outside.

## Look (house comic print style, lib/arcade/comic)
Banded light, violet halftone shade, ink hulls baked into the geometry. Palette: sun #ffc83a, red #f0452e, teal #19b5a5, paper
#fff3d6, ink #231a2e, plus each place's own ground and sky. The island coast is painted into every backdrop. HUD: flicks left as a
row of little balls, the level's stars as a track, comic word bursts on hits, a foot badge. Buttons in the UI sans, weight 800.

## Sound
A boot thump scaled by power and a whoosh scaled by curl; tin for cans, wood for crates, a hollow plastic bonk for barrels, a pop,
a bell, a post ping, a net swish, a marimba step per combo. Synthesised, one limiter, nothing before the first tap.

## Heat
One scene, one sun + a hemisphere, blob shadows (no shadow map), one vertex-colour material, each place baked into one mesh, every
target kind one instanced draw, fixed pools, pixel ratio 1.5 on phones, 30 fps on phones, the loop sleeps on cards and pause.
