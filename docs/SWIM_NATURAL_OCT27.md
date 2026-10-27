# Natural swimming (Oct 27 2026)

Owner ask: "Improve the swimming mechanics to be more natural. Also improve the swimming mechanics while swimming under water
normally and also while in the reef." Three swims: (a) at the surface, (b) the open-water duck-dive, (c) the reef rooms (Explore).

All the new maths is in one pure module, `lib/town/water/swimMotion.ts` (no three.js, no DOM, no allocation), unit-tested by
`tests/swim-natural-oct27.cjs` (in the `npm test` chain after `explore-swim-oct25.cjs`).

## What changed

| Swim | Before | Now |
|---|---|---|
| (a) Surface: turning | the velocity blended straight to the stick (a reversal went through a dead stop) | the **heading** turns at a limited rate (4.2 rad/s slow, 2.4 at top speed): a U-turn is a tight arc, a hard turn sheds up to 35 % pace (`swimVelocity`, `turnHeading`, `turnKeep`). From still water the push goes straight off along the stick. |
| (a) Surface: stroke | a steady speed; the stroke clock followed the speed only | each arm's pull gives a small **surge** (±8 %, mean 1: no faster on average; `strokeSurge`); the stroke clock speeds with the stick *or* the speed (a light push = a lazy stroke; `strokeRate`) so arms and the flutter kick match the pace |
| (a) Surface: body | the root sat at a fixed line | a gentle **bob** (3.5 cm over 2.6 s, smaller at speed, a small heave with each stroke) and a **bank** into turns from the real turn rate (≤ 0.28 rad, more at speed), both on the pose (`SwimRigPose.bob` / `.bank`): the root and the camera stay level |
| (a) Camera | — | **Swim fast** eases the FOV open ≤ 3° and back (`fovKick`, `easeFov`); no roll |
| (b) Duck-dive | the head-down / head-up tilt was a formula of the progress (could jump at the ends) | the dive arc plus the body following a climb of the drawn seabed, **rate-limited** (≤ 1.6 rad/s, `pitchToward`, `diveArcPitch`, `climbPitch`); flat once settled |
| (b) Buoyancy | a linear rise | brisk from the bottom of the dive (×1.45), easing as the head nears the top (×0.55) (`buoyancyRate`) |
| (b) Glide | the surface drag under the water too | a let-go stick under the water glides further (drag × 0.55) |
| (c) Reef: turning | the yaw followed the stick directly; the bank followed the stick | the turn has **angular momentum** (`reefYawRate`: the rate eases in and out); the bank follows the real turn rate and the speed (`bankFor`) |
| (c) Reef: near coral | the same swim everywhere (but the find slow-down) | low over the reef bed (clearance 0.9 → 0.3 m) the swim is up to 20 % slower, the turn eases 60 % quicker and the drag is up to 1.5×: tight, precise control where the coral is (`reefNear`); the find slow-down and this take the larger, not both |
| (c) Reef: pitch | an eased follow of the climb | rate-limited (`pitchToward`) |
| (c) Reef: current | only the plants / plankton swayed | while swimming, a gentle push along the room's current (≤ 0.12 m/s × the effort, × the swell). At rest nothing: no creep to the edge, the rest frame still holds |
| (c) Reef: solids | the inward speed was removed (a slide) | the same slide plus a soft scrape (90 % of the speed kept per contact move), never a stop |
| (c) Reef camera | a fixed 58° | a burst (a full kick, a held ▲ rise) eases the FOV open ≤ 3° and back |

Unchanged on purpose: speeds (`SWIM_SPEED` 4.8, `SWIM_SPRINT` 8.2, `DIVE_SPEED` 3.2), the breath / depth rules, the swim card, rides,
sharks, dive balls, the edge note, the glide and gasp poses, the reef's stroke clock and its sound.

## Tuning constants (`SWIM_MOTION`)

`turn {slow 4.2, fast 2.4, ease 9, shed .35, still .6}` · `surge {amp .08}` · `stroke {tread 2.2, min 3.4, max 6.2, fast 9, under .72}` ·
`bob {amp .035, period 2.6, move .55, heave .012}` · `drag {glide .55}` · `pitch {rate 1.6, ease 5, climb .35, max .5}` ·
`buoy {deep 1.45, top .55}` · `reefTurn {ease 5.5, bank .5}` · `reefNear {far .9, near .3, speed .2, turn .6, drag .5}` ·
`current {push .12}` · `contact {keep .9}` · `fov {kick 3, ease 2.5, eps .02}`.

The surface bank cap (0.28 rad) and its full turn rate (2.4 rad/s) are passed from `waterState.ts`; the reef's use `DIVE_BANK` / `DIVE_TURN`.

## Heat

- No new meshes, materials, draw calls, particles, timers or listeners. The existing bubble paths (the duck-dive's ring every
  `DIVE.bubble` s, the reef's breath bubbles in the one Points draw) are reused unchanged.
- Per frame: a few dozen multiplies and one `atan2` pair in the swim step, a `sin` for the bob, one `diveSwell` in the reef step.
  Nothing allocates (the test greps the helpers).
- The FOV ease calls `updateProjectionMatrix` only while the offset is moving; at rest (and whenever it is off) nothing. Off with
  reduced motion, heat tier 2+, Battery saver and the slow governor (the island's `waterFxOn()`; the room's `lite` / `calm`), and
  in a lesson.
- The bob and the bank are pose numbers only (off with reduced motion); the root, the clear disc and the camera do not bob.
- Not measured on an iPhone (no thermal claim).

## Files

`lib/town/water/swimMotion.ts` (new) · `lib/town/water/waterDepth.ts` (`swimStep`: `surge`, `under` arguments) ·
`lib/town/water/waterState.ts` (stroke clock, bob, bank, rate-limited pitch, buoyancy) · `lib/graphics/swimPose.ts` (`bob`, `bank`) ·
`lib/town/water/diveSession.ts` (reef turn, bank, near-coral, current, scrape, pitch) · `lib/graphics/diveRoom.ts` (FOV ease) ·
`components/Town.tsx` (the surge / under into `swimStep`, the Swim fast FOV) · tests: `tests/swim-natural-oct27.cjs` (new),
`tests/water-swim.cjs` (the `swimStep` call pin), `tests/explore-delight.cjs` (full speed far from a find, less a little low over a reef).
