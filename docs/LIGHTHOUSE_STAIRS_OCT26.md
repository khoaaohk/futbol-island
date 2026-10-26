# East Jetty lighthouse: stair removed, ladder added, gallery kept (Oct 26 2026)

(File name kept from the first version.) Owner requests, in order the same day: a spiral staircase (commit ff360f6c); then
"remove it, it looks too busy, keep the wider top, make the railings white"; then "instead of no way up, add a simple LADDER on
one side, with real climbing, a slide down, and the lamp above the railing".

## What changed
- **Removed:** the spiral stair and everything that came with it: treads, stringers, stair rails, brackets, stair lamps, window
  slits, the landing, the "CLIMB UP • SCAN THE PITCH" sign, the stair's walking and riding surface, its invisible rails and
  plaza walls, the thumb assist, the stair speed cap (`lighthouseStairs.ts`, `lighthouseStairsWorld.ts` and their two tests).
- **Restored to before the stair:** the door and two windows on the west face, the name board at the foot facing the walkway,
  the benches at 5 m, and the jetty-lighthouse hunt ball at 5.3 m south-west (Law 8, the coin toss; reachable on foot). The plinth
  keeps a round 3.1 m footprint, so the foot of the tower is a plain tower.
- **Kept:** the widened gallery: a flared corbel under a 3.2 m deck at 13.6 m, railed all round in **white** (`#f3ecdc`, the
  tower's own off-white: no new colour or material) except a 0.9 m **gate** where the ladder arrives.
- **Added:** a slim **white ladder** (two side rails, rungs every 0.3 m, five stand-off brackets back to the tower, grab handles
  1 m above the deck) on the tower's camera side (bearing 1.05 rad, south-south-east), standing just outside the deck edge.
- **Lamp raised:** the lantern now sits on a short white watch room: lamp (and the beam's apex) at 15.6 m, its glass from 14.85 m,
  1 m above the railing's top (14.6 m). Within the gallery the beam's lowest edge is ~15.1 m, so it never crosses the railing or
  the deck; it has no shadow and no scene light. Tower height 17.8 m (was 16.6).

## Playing it (`lib/town/lighthouseLadder.ts`, run inside `rooftopTravel.update`)
- **Up:** walk to the ladder's foot and push the stick up (toward the tower), or tap **Climb**. Speed follows the stick (1.8 m/s
  full: about 7.5 s to the top); release and you hold on. At the top you step through the gate onto the gallery.
- **Down:** at the gate, push the stick down (out) or tap **Climb down**: you back out onto the ladder facing it. A light stick
  climbs down rung by rung; **holding down firmly** for 0.35 s **slides**: hands on the side rails, speed ramping (8 m/s²) to
  7 m/s, a whoosh (`sound.boost`), and a squat landing with a thud at the foot. Let go mid-slide and the hands grip again (< 0.5 s).
- **Rides can't climb:** pushing a scooter, bike or moped into the foot shows "Park your ride to climb" (once per push, at most
  every 6 s) and nothing else. Choosing a ride or Fly while on the ladder lets go (the normal fall / take-off takes over).
- **Fly and land:** unchanged. A jetpack or parachute landing over the lighthouse lands on the gallery ring only (1.75 to 2.7 m
  from the axis), never in the tower or on the lantern; Fly from the gallery takes off from 13.6 m.
- **Ball:** the tower by height, the railing (not the gate) and the ladder as a thin slab: a ball cannot pass between the rungs.
- **Camera:** the ladder faces the fixed follow camera, so the climber is always in front of the tower and the camera never
  passes it; the hidden-player marker (`lighthouseHides`) still covers anything behind the tower.
- **Multiplayer:** friends get your position, height and facing as always (you rise up the ladder facing the tower), but in
  the standing pose: a climbing pose on the wire would need a new pose field, skipped.

## The climbing pose (`lib/graphics/ladderPose.ts`)
Fills the rig's optional full-body TrickPose each frame (no allocation). Hand over hand with the opposite foot; the rhythm is a
signed cycle of two rungs, so a planted foot stays on its rung going up or down; the stepping foot lifts clear of the rung; a
slight hip sway (none with reduced motion); the head looks up climbing and down descending. Slide: both hands out on the rails,
feet crossed off the rungs, body straight, looking down. Top: a leg swings over onto the deck (and back on the way down).
Landing: a squat, deeper after a fast slide.

## Perf
Stair + gallery: 17,718 vertices. Now gallery + ladder: 4,818 (−73%), 4 pieces in the tower's colour, merged into the plaza
chunk's existing batch; one fewer canvas sign. Per tick: the ladder's state machine is a few comparisons unless you are on it;
the gallery's floor and railing tests only near / at its height. No per-frame allocation (tests check the step and the pose).

## Tests
- `tests/lighthouse-gallery.cjs`: no stair left, plain tower at the plaza, landings on the ring, walking and riding round the
  gallery stays on it, railing white and closed to walking, the lantern above the railing, geometry budget, ball, hunt ball.
- `tests/lighthouse-ladder-climb.cjs`: climb by pushing and by the button, speed follows the stick, step out, back in at the gate,
  tap down without sliding, the slide's hold, ramp, cap and squat, letting go grips again, rides blocked with one note, the pose
  (planted feet stay put both ways, sway off with reduced motion, slide grip), the drawing (rails, rungs, nothing in the gap or
  the tower), ball slab, camera side, the beam clear of the railing, and the wiring.
- Live (headless Chrome, `--mute-audio`): phone 390×844 climbing (y 5.3 m after 3.2 s of up), desktop at the top at night with
  the beam, and a slide from the top; no page errors.

## Eyeball on a phone
Walk to the ladder and push up: does the hand-over-hand read at phone size? Step out at the top, walk round, then push down at
the gate and HOLD down to slide: is the slide fun and the squat gentle? Try a scooter into the foot (the note). At night, check
the beam starts above the railing.
