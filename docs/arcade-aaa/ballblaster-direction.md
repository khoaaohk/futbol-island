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
- World: a small stadium: painted crowd (canvas), roofs, four floodlight pylons, advert boards ("PICK YOUR TARGET", "STRIKE
  THROUGH THE BALL"), flat comic sky with inked clouds, our goal behind the kicker. Camera high behind the goal, 50-54° fov.
- Machines are toys: cream robot with a red chest plate and a wind-up key, orange cone-bots with googly eyes, yellow dummies on
  a spring, teal drones, blue-shield bots, pink dodgers, grey armour with yellow stripes, a red-and-white Mega Mannequin.
- Hits: instance flash + squash, comic starburst, pre-made chunks (instanced, coloured per material), dust puffs, ball speed
  dots, gentle shake (none with reduced motion), slow-mo and a camera pull on a boss knockout.
- HUD: shared top bar (score), a paper strip (hearts, best, combo), bottom-left ball rack + power-up chip, bottom-right wave tag,
  a charge bar while holding, DOM comic bursts placed at the projected hit point.

## Sound (lib/arcade/ballblaster/audio.ts)
Leather boot thump (deeper with charge), curl whoosh, tin clank, robot wind-down spring, crate splinters, glass tinkle, hollow
cone clonk, wet barrel pop, shield tonk, a marimba that climbs with the combo, a ref whistle when a machine gets through.

## Heat
One canvas made per mount, low-power context, pixel ratio 1.5 on phones (2 desktop), one shadow-casting sun, no post pass.
Instanced: one draw per machine / prop kind, balls, pieces (220), dust (48), trail (90), aim dots (40). Loop only while playing,
at most 60 draws a second (a deviation from the HANDOFF's 30 fps cap: the aim needs it; the cap is one constant in the shell,
`now-drawn.current>=15.5`). Measured in headless Chrome (swiftshader) at 390x844: about 95-102 draw calls (shadow pass included),
13-15k triangles.
