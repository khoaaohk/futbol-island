# FootGolf Island: direction (Nov 21 2026)

Owner: "also build footgolf. make sure this game has realism and depth, but still have the style of the arcade games" and, for the
new games, "these next two games need to have more dimension and not be so flat". Built unplaced: `/arcade?game=footgolf` only.

## What it is
Real footgolf: kick a football round a course into a big cup in as few kicks as you can. Nine holes (par 34), each set at a place
on the island, on real 3D ground: a low-poly heightfield with hills, hollows, banks and water you can fall into.

| # | Hole | Par | Metres | What is in the way | Lesson |
| - | - | - | - | - | - |
| 1 | Lighthouse Jetty | 3 | 54 | a headland, sea both sides, one bunker | laces to get there, inside of the foot to finish |
| 2 | Palm Beach | 3 | 60 | the beach is one long bunker, the green leans to the sea | sand plugs the ball: chip out |
| 3 | Town Plaza | 4 | 92 | stone path (fast), garden walls, the fountain | weight of pass along the ground; use the wall |
| 4 | The Farm | 4 | 100 | rolling hills, a fence with a gap, hay bales, a pond | chip over or pass through: read the ground |
| 5 | The Boardwalk | 4 | 96 | a river: the bridge (safe) or the carry (brave) | pick a safe target |
| 6 | Museum Gardens | 3 | 58 | hedges, two bunkers, a steep green | read the green: the arrows show downhill |
| 7 | Coral Cay | 3 | 48 | an island green, cross wind | the wind moves a high ball; backspin holds it |
| 8 | The Summit | 5 | 135 | uphill all the way, rocks, a false front, head wind | uphill needs more weight |
| 9 | Island Stadium | 5 | 140 | downhill, a moat, the gate, the centre circle | all of it |

## Realism (lib/arcade/footgolf/core.ts, fixed 1/120 s steps, seeded, no library)
- **Four kicks:** Long kick (laces, 12-27 m/s, 27 degrees: about 40 m carry, 60 m with the run), Chip (under the ball, 6-18 m/s, 50
  degrees, backspin: up to 30 m and it checks), Pass (inside of the foot, 3-18 m/s, along the ground: up to about 34 m), Putt (inside of the
  foot, 0.5-9 m/s, starts rolling: up to about 13 m). The lie matters: rough and sand take pace off.
- **Flight:** gravity, drag against the moving air (so wind pushes a high ball and not a low one), a Magnus side force from the
  curl, a little lift from backspin. **Bounce:** off the real slope under the ball; each surface has its own bounce and grip, and
  backspin checks the ball on landing. **Roll:** gravity down the slope against the surface's friction; a ball will not stop on a
  slope steeper than the grass can hold. Sand plugs, rough drags, stone runs. Walls, rocks, trunks and bales bank the ball; leaves
  kill it. Water and out of bounds: one penalty kick and a drop where you kicked from.
- **The cup** (real footgolf: 53 cm across, radius 0.265 m; a size 5 ball, radius 0.11 m, a hollow sphere; changed from the first draft's 0.42 m / 0.16 m to the real sizes): the ball drops only if it is slow enough for the width of cup it crosses. Too quick across
  the edge is a lip-out that turns the ball; much too quick hops over. A slow ball on the edge wobbles round the rim, then drops.
- **Wind:** a flag at the cup that flies with it, and an arrow in the HUD turned to the camera.
- **Forgiving:** 8 kicks a hole, then pick up. A full flight preview on holes 1-3, 60% on 4-6, 35% on 7-9.

## Camera (lib/arcade/footgolf/view.ts)
A flyover from the green back to the tee at the start of each hole (tap to skip), a behind-the-ball aim view per kick (lower for a
putt), a chase in flight that rises with the ball, and a low view beside the cup when a rolling ball gets near it.

## Controls
Pick the kick (four buttons; the game suggests one). Drag back from anywhere like a catapult: the pull is the power, the angle is
the aim, let go to kick. Curl: a five-step dial (inside / outside of the foot). Turn buttons swing the view round.
Desktop: mouse the same; Left / Right aim, Up / Down power, Space kicks, 1-4 pick the kick, Q / E curl, P pauses.

## Scoring
Kicks against par, as golf (Ace, Eagle, Birdie, Par, Bogey). For the board each hole pays 500 points at par and 200 a kick either
side (50 at worst, 0 for a pick-up), +300 for flying it in, +100 for holing from 8 m or more. The nine-hole total goes on ONE
all-time top-20 board `footgolf` (no daily board). Daily Hole: one hole a day, seeded (cup, wind and green tilt), same on every
device, saved on the device with a streak. Best kicks per hole are kept on the device. Coins as other screen games: it never charges.

## Teaching
A line at each tee, the part of the foot named on every kick, a word on every event (SPLASH, PLUGGED, LIP OUT), and one tip after
each hole chosen from what happened: weight of pass, chip or drive, reading the ground, a safe target, laces or inside of the foot.

## Look (house comic print style, lib/arcade/comic)
Banded light, violet halftone shade on every slope (so the ground reads as ground), ink hulls baked into scenery and trees, a
painted ground sheet (mown stripes, inked fairway edge, bunker lips, tree shadows) draped over the heightfield, fog to the horizon,
a painted island coast all round, the sea below. Palette: sun #ffc83a, red #f0452e, teal #19b5a5, paper #fff3d6, ink #231a2e,
fairway #5cc063, green #8ee07a, rough #3f9a50, sand #f3d990, water #27b0c8. HUD: a scorecard strip, comic word bursts, a wind
sock badge, the kick picker as boot badges. Buttons in the UI sans, weight 800.

## Sound
Leather thump by power, a soft putt tick, turf thud, sand puff, splash, leaves, wall knock, the rim rattle and the cup "clonk",
a rising whistle for birdie or better. Synthesised, one limiter, nothing before the first tap.

## Heat
One scene, one hole at a time. One sun + a hemisphere, no shadow map (a blob under the ball, tree shadows painted into the ground),
terrain under 6k triangles, scenery baked into one mesh per hole, trees one instanced draw per kind, fixed pools, nothing allocated
per frame, pixel ratio 1.5 and 30 fps on phones, the loop sleeps on cards, pause and a hidden tab. Numbers: docs/performance-guide.md.

## Built (Nov 21 2026) and what changed from this draft
- Real cup and ball sizes (above). The flag lifts out when the ball is within 10 m of the cup, as players take it out to putt.
- Penalty: one kick and the next kick from where the last one was taken (stroke and distance, simplest for 7-12 year olds).
- The low cup camera is used only for approaches from more than 7 m; a short putt keeps a low chase view (the cup view flew over the ball).
- The aim view on an upright phone is framed above the kick picker with a sheared frustum (no zoom, no cost).
- Daily Hole uses a 35% preview, like holes 7-9. Board minimum time is 60 s (a nine-hole round cannot be quicker).
