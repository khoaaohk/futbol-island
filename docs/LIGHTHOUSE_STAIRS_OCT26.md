# East Jetty lighthouse spiral stair (Oct 26 2026)

Owner request: a spiral staircase up the East Jetty lighthouse that you can walk and ride (scooter, bike, moped) up and down,
stand on at the top, fly from and drop back onto.

## What it is
- An open-tread stair wrapped round the **outside** of the tower: two full turns in a 1.6 m band (3.3 to 4.9 m from the axis),
  from the plaza's south side (y 0) up to the gallery (y 13.6), then a short flat landing. The tower is too narrow for an inside
  stair (2.3 to 1.35 m radius), and the fixed follow camera sees an outside one.
- The climb runs south, west, north, east: over the keeper's hut at 4.6 m or more. The door moved under the second turn, the name
  board moved up the west face, and the benches and the jetty-lighthouse hunt ball moved out (6.5 m and 5.95 m) to keep a walking
  ring round the stair. The ball's lesson (Law 8, the coin toss) is unchanged.
- The gallery is now 3.2 m wide on a flared corbel, railed all round except the opening onto the landing. A sign at the foot reads
  "CLIMB UP • SCAN THE PITCH": the view from the top, linked to scanning (looking all round before the ball arrives).

## How it works (`lib/town/lighthouseStairs.ts`, pure)
- **Level-aware floor** `lighthouseFloor(x, z, from)`: the band overlaps itself, so the floor is the highest stair or gallery level
  within 0.6 m above the rider's own height (from the sky: the top). The walking surface is a continuous ramp (rise 1.08 m per
  radian, grade about 0.26 on the walking line). The drawn treads step about 0.17 m, so wheels never catch a riser.
- **Rails** `lighthouseConstrain()`: after each step the rider is projected back between the rails (band), into the gallery ring,
  through the opening, or against the landing's end wall, keeping the velocity along the rail. Rides slide smoothly and cannot get
  wedged. At plaza level the stair's side is a wall where it is 0.45 to 2.4 m up. Higher than that you can walk underneath.
- **Thumb assist** `createLighthouseAssist()`: once the stick picks up or down, holding it in any direction keeps following the
  helix. The radial part picks a lane, and turning the stick well round reverses. Rides get the hill slow-down and a 6.5 m/s cap on
  the stair; a fast arrival brakes quickly. Ride collision radius is 0.4 m near the lighthouse, as on other narrow stairs.
- **Landing** `lighthouseLanding()`: a jetpack or parachute landing over the lighthouse lands only on the gallery ring at 13.6 m,
  never inside the tower, on the lantern or on the stair band. Take off from the gallery with the normal Fly (it climbs to cruise
  from 13.6 m), then Land to drop back onto the gallery or the plaza.
- **Ball and jet dash** `lighthouseSolid()`: the tower by height, gallery railing, treads (a 0.45 m slab) and rails. The ball's
  floor uses the stair level under it (plus one tick of a fast fall, so it cannot tunnel through a tread). The square tower
  footprint is now round and is skipped by the ball, so a ball works on the gallery.
- **Camera**: the follow camera sits 23 m up and about 36 m out, so it never enters the tower. When the tower hides the rider
  (walking or riding), the existing hidden-player marker shows (`lighthouseHides`).

## Wiring
`rooftopTravel.ts` (surface, canLand, the assist and speed cap, ride radius, rails), `Town.tsx` (ball floor and solids, jet dash,
ride wheel pose on the rider's level, hidden marker), `eastPierWorld.ts` (scenery), `lighthouseStairsWorld.ts` (merged geometry).

## Tests
- `tests/lighthouse-stairs-physics.cjs`: the height function (monotonic, continuous, no gaps, top level, headroom). Walk, scooter,
  bike and moped go up and down through `createRooftopTravel` with one held stick, never falling or wedging, between the rails.
  Also: the gallery footprint, the landing wall, the plaza wall and headroom, walking round the plaza both ways, a fast run-up
  capped, jetpack landings, and ball solids and floors.
- `tests/lighthouse-stairs-world.cjs`: the merged geometry (pieces, vertex budget, treads match the ramp, the opening clear) and
  the wiring.
- Live check (headless Chrome, desktop, keys held): walk up 15 s and down 15 s; scooter, bike and moped up about 9 s and down
  about 9 s; no falls. Fly from the gallery reached 28 m, and Land put the player back on the gallery (r 2.2 m, 13.6 m).

## Eyeball on a phone
Walk, scooter, bike and moped up and down with the joystick. Stand at the top and walk round the gallery. Fly from the gallery,
then Land. Check the rider is visible (or marked) behind the tower on the far side.
