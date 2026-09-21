# Character and vehicle final local audit

Scope: existing changes in `flightMotion.ts`, `player.ts`, `truckReactions.ts`, `truckCollisions.ts`, and their integration in Town. No story modules or player UI were edited in this audit. No production deployment.

The flight pose now carries damped acceleration and turning information. The player applies distinct lag to hips, knees, ankles, torso, head and hands, with landing compression and explicit hand/ankle reset on returning to walking. Articulated hand meshes are enabled for the main explorer; ordinary and shared match rigs retain their previous batching path. The persistent joint state uses 30 Float64 values per rig; flight follow work stays within the existing update. No additional animation loop or timer is introduced.

Scooter, bike and moped use narrow, height-aware swept character contact at the existing contact cadence. The helper excludes warps over 12 m and separates rooftop/ground characters. Contact reuses the existing bounded recovery and witness-bubble systems. The existing truck path and shared match batching remain covered by regression checks.

## Evidence

- `player-motion`, `truck-collisions`, `traffic-separation`, `player-batch`, `idle-flight-effects`, `jetpack-actions`, `movement-work`, `offshore-flight`, `parachute-landing`, `ride-ramps`, `ride-stair-pose`, and `customization` suites passed.
- Related `lighting-idle`, `static-shadow-batches`, `shadow-visibility` and `shadow-coverage` suites passed. A separate night-world structural fixture verifies light count, mode activation, scenery visibility and cleanup.
- The shared-match invariant remains 22 players / 10 batches. Existing character geometry parity and seven fewer ordinary-rig meshes remain intact across appearance variants.
- Existing motion tests cover cruise knee motion, acceleration response, head-leading/hip-trailing turns, hand movement, pause preservation, landing absorption, settled landing and walking reset. They also cover reduced motion, canopy grips, continuous alternating foot taps and appearance changes.
- Actual desktop Chrome steering showed a finite knee pose and visible head-turn state; normal landing reached walk mode at height zero, with no page errors.
- Actual mobile-emulated Chrome exercised scooter, bike and moped contact in the 7v7 scene. All three produced the existing character-contact reaction without page errors. This directly checks integration beyond the collision helper.
- Repository TypeScript and relevant whitespace checks passed.

No concrete additional defect was found, so the final audit did not modify implementation. Browser fixtures use debug state to arrange reproducible contact scenarios; they do not establish touch ergonomics or real-device Safari behavior. Ramp, reverse, roof-height and teleport coverage comes from the listed regression suites, not all from browser interactions. Neither physical-phone heat nor a sustained GPU benchmark was measured. See `night-lighting-2026-09-19.md` for the before/after night snapshot and its limits.

## Continuation: ground grips and flight-to-walk alignment

Fixed scooter and bicycle hand targets to account for Town's existing1.12 vehicle scale, matching the moped's correction. The old travel test assumed unscaled bars; it now measures the actual rendered handlebar geometry at the runtime scale. That revised test reproduced the scooter failure before the correction. Walking also explicitly clears shoulder yaw left by flight/parachuting. A regression exercises cruise twist followed by walking. Both changes reuse the existing pose calculation, without geometry, allocations or additional loops.

Travel modes, player motion, ramps, stair poses, player batching, truck collisions and shadow coverage/visibility pass. Desktop1280 and touch-emulated390 browser checks performed actual steering and flight-to-walk landing, verified neutral shoulder yaw and measured each ground ride's hand endpoint against its scaled handlebar (vertical/forward error below0.0003 world units). Browser fixtures arrange stationary ride positions; these checks do not establish moving grip ergonomics or physical-phone behavior. Evidence: `/tmp/fi-movement-continuation.cjs` and `.json`. Local only.

Combined production build passed after the movement, lighting and Woven continuation.
