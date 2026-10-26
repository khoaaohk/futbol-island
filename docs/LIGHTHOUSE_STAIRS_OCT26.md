# East Jetty lighthouse: stair removed, gallery kept (Oct 26 2026)

Owner request (first): a spiral staircase up the East Jetty lighthouse (commit ff360f6c). Owner request (later the same day):
remove the stair, it looks too busy; keep the wider top so you can fly up and land on it; make the railings white.

## What changed
- **Removed:** the spiral stair and everything that came with it: treads, stringers, stair rails and balusters, brackets, the
  stair lamps, the window slits, the landing, the "CLIMB UP • SCAN THE PITCH" sign and its posts, the stair's walking and riding
  surface, its invisible rails and plaza-level walls, the thumb assist, the stair speed cap and the stair ride radius
  (`lib/town/lighthouseStairs.ts` and `lighthouseStairsWorld.ts` are gone, with their two tests).
- **Restored to before the stair:** the door and two windows on the west face, the "EAST JETTY LIGHTHOUSE" board at the foot
  facing the walkway, the benches at 5 m, and the jetty-lighthouse hunt ball at 5.3 m south-west (Law 8, the coin toss; reachable
  on foot, `tests/lighthouse-gallery.cjs` walks to it). The plinth keeps the round footprint (3.1 m), so walking round the
  foot of the tower behaves like a plain tower; rides go round outside the benches, as before the stair.
- **Kept:** the widened gallery: a flared corbel under a 3.2 m deck at 13.6 m. The railing (posts, a top rail, a mid rail) is
  now **white**, in the tower's own off-white `#f3ecdc` (no new colour or material).

## Getting up and down (landing-only)
- **Up:** only by flying. A jetpack or parachute landing over the lighthouse lands on the gallery ring (1.75 to 2.7 m from the
  axis), never inside the tower or on the lantern (`lighthouseLanding`; `findLanding` moves a landing aimed at the lantern
  onto the ring).
- **Walking round up there:** the railing and the lantern wall hold walkers and rides (`lighthouseConstrain`, only at the
  gallery's height); rides are capped at 6.5 m/s on the 2 m ring.
- **Down:** Fly (the normal take-off from 13.6 m), or walk out through the railing's **one opening, to the west** (1.4 m wide,
  over the plaza where the walkway arrives). That is a normal roof drop: a short hang, the fall, a short recovery on the plaza.
  Chosen over a fully closed railing so a kid with no fuel, or one who switched to walking, is never stuck at the top.

## Code
`lib/town/lighthouseGallery.ts` (pure: gallery floor, railing, landing, ball/jet solids, the hidden-player test),
`lib/town/lighthouseGalleryWorld.ts` (the merged white railing, deck and corbel), wired in `rooftopTravel.ts`, `Town.tsx`
(ball floor and solids, jet dash, ride wheel pose, hidden-player marker) and `eastPierWorld.ts`.

## Perf
Stair + gallery: 17,718 vertices. Gallery only: 2,718 (−85%), 3 pieces in the plaza chunk's existing batch, one fewer canvas
sign. Per tick near the lighthouse: one radius test, plus the railing projection only at the gallery's height; no allocation.

## Tests
`tests/lighthouse-gallery.cjs`: no stair code or surface left, no stair walls at the plaza, walk and rides round the tower's
foot, fly-up landings only on the ring, walking and riding round the gallery stays on it, the west opening drops every mode to
the plaza, the railing holds everywhere else, white geometry and vertex budget, ball solids, the hunt ball's spot and reach,
and the wiring.

## Eyeball on a phone
Fly up and land on the gallery (aim at the lantern too: you should land on the ring). Walk round it; the white railing should
read clean against sky and in the tower's shadow. Walk out of the west opening and drop to the plaza. Fly off again.
