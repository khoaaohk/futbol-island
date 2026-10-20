# The worn backpack and its jetpack morph (20 Oct 2026, local, not deployed)

User: "the main character always wears a backpack … when flying it transforms into a jetpack."

## What it is

- `lib/graphics/backpack.ts` (`createBackpack()`): a small football backpack on the town's main character, parented to the
  rig's `armor-torso` joint, so every pose (idle, walk, sprint, kick, swim, scooter, bike, moped, jobs, zipline) carries it.
  Body in the kit's **shorts** colour, pocket / flap / fins in the **shirt** colour, a white disc with the black
  **pentagon** of the classic 32-panel ball (12 pentagons + 20 hexagons) on the pocket, a carry loop, and flat shoulder
  straps laid on the bean's shell (`beanGearFit.beanStrapPaths`, the same straps the jet harness used).
- **One mesh, one draw call**, vertex colours, no textures (1,920 triangles incl. straps and folded jet parts).
- **Jetpack morph**: the jet parts (two tanks with orange bands and domed tops, nozzles, fins) sit hidden inside the closed
  pack in the base positions and in their flying places in a single three.js morph target. `morphTargetInfluences[0]`
  (0 = backpack, 1 = twin jet) eases over `MORPH_SECONDS` (.35 s, smoothstep) on take-off and back on landing; the flap
  lifts and tilts, the pocket drops, the body swells 5–8 %. Reduced motion: instant swap.
- Flames: two cone meshes on the `backpack-nozzle-*` sockets (the classic jet's flames, now on the morphed nozzles), shown
  only once the morph is > .92 and powered. The downwash (`jetExhaust.ts`) reads `gearState.packBack` written from the
  pack's nozzle depth. Fuel, sonic bursts, trails and jet actions are unchanged.
- Variants: `classic` morphs; `rocketboard` keeps the folded pack on; `helicopter`, `ironman`, `flying-car`, `mini-plane`
  hide it (own back gear or a seat). Parachute / fall phases fold it. Swimming tucks it 30 % flatter. In the town the old
  classic jet group in `vehicle.ts` stays hidden (`vehicle.setBackpackJet(true)`); shop previews keep it.
- Kit changes call `backpack.setKit(playerOutfit(c))` (rewrites the colour attribute only); a build change re-fits the
  pack and straps to the new shell (rebuild only on change).
- The bean skin hides every classic mesh in the rig on appearance changes; gear meshes flagged `userData.rigGear`
  (the pack, its flames) are skipped (`beanSkin.ts attachBeanSkin`).
- Interiors (shop, konbini, museum, arcade room) and portrait renders do not wear it (not attached there).

## Cost (heat)

Walking / riding: +1 draw call, no per-frame matrix work (torso child). Flying: 3 draw calls in place of the old classic
pack's 10 (box, 2 tanks, 2 nozzles, 2 flames, 3 harness belts). `update()` is allocation-free (tests check the source):
a shape compare of 7 floats, one eased number, two flame scales.

## Sockets for props (bug net carry etc.)

| Name (`rig.getObjectByName`) | Where |
|---|---|
| `player-backpack` | the pack group (origin = pack body centre, torso-local ≈ (0, .32, -.27) on the regular build; +z into the body) |
| `backpack-side-left` / `backpack-side-right` | pack-local (∓.225, -.02, -.01): beside the pack at mid-pack height, where a net pole rests while riding (rig left = -x) |
| `backpack-nozzle-left` / `backpack-nozzle-right` | pack-local (∓.205, -.22, -.015): the thruster mouths |

Hands for a two-handed hold (`HAND_JOINTS`): `left-shoulder`/`right-shoulder` (on `player-chest`) → `left-elbow`/`right-elbow`
(.28 below) → `left-hand`/`right-hand` (.265 below the elbow; the mitten's middle is 2 cm further down). The town rig is
built with articulated hands, so a prop can be parented to `right-hand` and aimed at `left-hand` each frame.

Per ride (`BACKPACK_RIDE_OFFSETS`): scooter / bike / moped need no seat or lean change (`seatDy 0`, `leanAdd 0`; the test
checks no pack point sits inside any saddle, cargo box or body). Pole tilt back from vertical when resting on
`backpack-side-right`: scooter .35, bike .55, moped .6 rad. Used by the Bug squad net (`bugNet.pack`, wired through
`jobs.setBackpack` in Town; docs/island-jobs.md §15 "Bug polish"), which also hides the net while the pack morphs (> .02).

## Tests

`tests/backpack-wear.cjs` (in `npm test`): worn in every ride state, hidden for back-gear jets, no clipping into rides,
morph 0 (all jet parts inside the pack) and 1 (tanks beside, nozzles below), take-off mid-morph and open after .4 s,
parachute fold, landing fold, reduced-motion swap, swim tuck, kit colour, build refit, draw calls 1/3, sockets, no
allocation in `update()`.
