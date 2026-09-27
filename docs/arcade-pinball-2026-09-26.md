# Pinball bean-character review — September 26, 2026

Local changes; not deployed. Reviewed the bean-character contract and performance guide and used the game-developer workflow. Claude's bean skin, team looks, defender blocking/knockdown, keeper commitment and table effects are retained.

## Findings and changes

The previous keeper pose rotated the whole root and manually extended hidden joints after the island motion solver. It skipped the new bean keeper's planted setup, push-off, landing and get-up. Pinball now passes its existing committed dive progress/direction into the shared island solver, with a low-height side parry and keeper ready stance. Direct shots at the body use the solver’s standing parry/recovery instead of a generic stumble. Collision timing and commitment duration remain the same.

Defender boot blocks now request a controlled pass-strength contact, with the target scaled to the character's size. A successful block no longer also triggers a stumble. Dazed players stop incidental kicking. Their existing game-owned fall and bent knees remain, with explicit pose finalization before the star attachment reads joint positions; the bean limbs and body therefore share the same finalized world pose.

Three continuity defects were corrected:

- A keeper at its patrol limit retained a velocity that claimed it was moving beyond the limit. Velocity is now zero there, and collision response uses the actual clamped displacement.
- Defender block/cooldown timers stopped while dazed or between balls. They now recover on the existing simulation clock throughout these phases.
- Ready-state defender rendering dropped the AI's lateral offset. It now preserves that offset, and the last part of a downed defender's return eases in/out instead of changing velocity abruptly.

## Validation

The Pinball simulation suite passes, including body hit versus boot block, temporary open lane, recovery, keeper exemption, post-limit velocity and timer recovery while waiting/down. Browser checks target the bean mesh and pelvis dive rather than the removed root-roll implementation, and let dazed recovery run on the real animation loop before relaunching. Desktop (1280×800), mobile (390×844) and reduced-motion mobile fixtures all passed with zero page errors. Authored dive moved the visible bean pelvis to about -1.42 radians; reduced motion retained the meaningful dive pose but lowered its lift (~0.528 versus ~0.646 local units). Downed defenders displayed three stars, recovered through the actual animation loop, and cleared their stars. Corner goals, net motion (suppressed under reduced motion), launch charge, two-finger independent release/cancel, keyboard controls, idle/pause sleep, resume and exit cleanup passed. Desktop/mobile dive and daze captures were visually inspected.

These fixture poses are injected engine states. Their results establish geometry/pose and control behavior, not normal-play scoring. Separate forty-second ordinary-input sessions also passed: keyboard desktop recorded 9 strikes, 2 goals, 1 completed move and 1 lost ball during active play; actual emulated touch recorded 16 strikes, 3 goals and 2 completed moves. Both drivers then stopped defending, naturally reached game over, pressed Play again and launched successfully. Neither changed physics state during play, and both reported zero page errors. Their action captures (`/tmp/fi-pinball-play-desktop.png`, `/tmp/fi-pinball-play-mobile.png`) were inspected. A separate short Tennis check could run concurrently during this round, so no performance comparison is inferred from these sessions.

No new render loop, polling or mesh was added. The dive and recovery use existing rig/simulation work; the finalization updates the affected rig's transforms only when downed and its star anchor is read. This is a behavior review, not a physical iPhone temperature measurement.
