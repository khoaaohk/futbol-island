# Ball Blaster: direction (Nov 17 2026)

Owner ask: "some type of shooter game that shoots soccer balls to destroy things and enemies. graphics on this should look good too."
It replaces Street Dash (`streetdash`) once the coordinator removes that cabinet. Id `ballblaster`, page `/games/soccer-shooting-game`.
Lesson on the cabinet: "Pick your target. Strike through the ball."

## The game
A gallery shooter on a training pitch, played upright with one thumb. Wind-up training machines march down the pitch toward the
player's goal; the player kicks footballs to break them before they reach the goal line. Three hearts; one lost per machine
that gets through. Endless waves, faster and denser, one new machine kind at a time, a boss (Mega Mannequin) every fifth wave.
Nothing alive is hurt: robots, cone-bots, practice dummies, drones and props break into pieces with comic lettering.

- Control: press anywhere to aim (the ring sits 64 px above a finger), drag to move it, let go to kick. Hold = power (0.45 to 1;
  0.9+ is a "power shot" that hits twice as hard). A sideways flick in the last 90 ms before release curls the ball (and the aim
  stays where it was before the flick). Mouse the same; keys: arrows aim, Space holds and kicks, Q / E held = curl, P pauses.
- Aim assist: a press near a machine locks the ring onto it and leads it by its walking speed (shell, `aimFrom`).
- Physics (core): gravity 13 m/s², ground bounce 0.52, slanted advert boards along the narrowing touchlines (balls ricochet),
  ricochets off what they hit, a curl that starts wide and bends back onto the aim point (so it arrives from the side).
- Chains: a cone tower falls 2.6 m along the ball's path and knocks what it lands on; a water barrel bursts (2.7 m).
- Depth: rack of 6 balls refilling every 0.68 s; gold crates drop a power-up (multi-ball, fire ball through everything, giant
  ball, slow-mo); shields block straight shots (curl / ricochet / fire); armour takes two hits; dodgers sidestep incoming balls;
  boss phases (walks, then calls cone-bots, then dodges and speeds up).
- Score: points per break x combo (+0.25 per quick break, up to x3), trick bonus for 2+ breaks with one ball, an accuracy bonus
  per cleared wave. Medals from the bots (tests/ballblaster-core.cjs --bots): Bronze 8,000, Silver 30,000, Gold 100,000.
- Daily Blast on the start card (seed from the day), one all-time island board, device save `fi2-ballblaster-v1`.

## Look
- Comic print house style (lib/arcade/comic): banded light, violet halftone shadows, ink hulls baked into every prop.
- Palette: sky #8fd4ee, grass #4fb85c / #5fc76a mown bands, line paper #fff3d6, ink #231a2e, kit red #f0452e, teal #19b5a5,
  sun #ffc83a, barrel blue #2f8fd8, crate wood #c98a4b.
- World (polish pass, Nov 17): a small stadium that turns day / sunset / night every three waves (sky canvas repainted, sun, hemi
  and fog retinted, floodlight glow cards brighter at night): six-tier stands with a two-frame crowd that cheers harder after big
  breaks, a sponsor banner under the roof, invented island sponsors on the boards (Palm Pop Soda, Reef Radio 98, Mango Moo Milk...),
  four lattice floodlight towers, a goal and net at the far end, an island skyline with palms painted into the sky, mown checks with
  blade flecks and darker turf outside the boards so the lane reads as the stage. Camera low and close behind the kicker (phone
  5.3 m up, 60° fov; desktop stage 6 m, 40-50°), so machines loom as they come; a short push on power shots.
- Machines are toys drawn 1.3x their rules size, each its own silhouette and colour: cream robot (red chest plate, grille mouth,
  antenna, mitts), orange cone-bots with waving arms, yellow dummies on a coil spring, teal drones with spinning rotors, shield bots
  peeking over a riot shield, pink dodgers on one wheel, grey armour with hazard stripes and angry brows, the Mega Mannequin.
  Googly eyes (one instanced mesh) follow the ball in flight, blink, and pop on a hit; wind-up keys turn on their backs.
  Hit: white flash, squash and a tilt back, eyes pop. Break: chunky inked pieces in the machine's colours plus springs and bolts,
  ink-rimmed dust puffs, a comic star kept at a readable size, crowd hype. Blob shadows under machines and props.
- Ball: ink outline baked into the ball geometry, stretch along its speed, a comic streak trail (fire ball burns red and gold,
  giant ball gold); turf puffs on hard bounces. Hit-stop (60-170 ms, the rules clock pauses) on boss, x3+ combo and trick breaks.
- HUD: shared top bar (score), a paper strip (hearts, best, combo chip that grows with the chain and a meter draining over the combo
  window), bottom-left ball rack + power-up chip, bottom-right wave tag, a charge bar while holding, DOM comic bursts placed at the
  projected hit point (fully opaque, kept inside the stage, stacked upward so they never cover each other), a one-line coach that
  goes after the second kick.

## Sound (lib/arcade/ballblaster/audio.ts)
Leather boot thump (deeper with charge), curl whoosh, tin clank, robot wind-down spring, crate splinters, glass tinkle, hollow
cone clonk, wet barrel pop, shield tonk, a marimba that climbs with the combo, a ref whistle when a machine gets through.

## Heat
One canvas made per mount, low-power context, pixel ratio 1.5 on phones (2 desktop), one shadow-casting sun (only the kicker, the
balls and the boss cast; machines and props use blob shadows), no post pass. The stadium is baked into a few merged meshes; one
draw per machine kind, one each for eyes, keys, rotors, balls, chunks, springs, dust, trail, aim dots; empty instanced meshes are
hidden and live particles are packed so a pool costs only what is alive. Frame cap (HANDOFF rule): 30 draws a second on phones
(`frameCapSlot`, pointer: coarse), 60 on desktop like ArcadeGame3D, and a press or a kick draws on the next vsync.
Measured headless Chrome (swiftshader) 390x844 in play, waves 2-5: 20-27 draw calls median (max 36), 8-11k triangles median
(max 16k). Before the polish pass: 100 / 103 draw calls, 15.7k / 18.2k triangles.

## Improve pass (Nov 17 2026, batch 1)
- Night reads as night with uniform swaps only: turf x0.34 under an emissive map of five warm floodlight pools, crowd dimmed,
  machine eyes glow (instance colour 1.9 on the eye mesh), the ball trail turns additive and 35% bigger.
- Between waves the next wave lines up at the far end as dark silhouettes marching on the spot (the new kind hops in full colour)
  and three stray balls roll back to the rack; both reuse the machine and ball instanced meshes (no new draw).
- Mega Mannequin rebuilt: 5 m tall, helmet, shoulder/thigh plates and a chest frame baked into three body variants swapped per phase
  (plates clatter off as grey chunks), a glowing chest dial weak spot (one basic disc, pulses faster and redder each phase),
  eyes moved into the instanced eye mesh (boss scene 25 -> 23-25 draws).
- Desktop 1440x900 checked: lane, HUD and aim arc sit well in the portrait stage; no camera change.
