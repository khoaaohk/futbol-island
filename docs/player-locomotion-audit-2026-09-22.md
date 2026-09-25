# Directional player locomotion audit — September 22

The rig previously used one speed-driven running cycle for forward, backward and lateral travel. Its forward lean topped out around eight degrees, lateral motion used the same high swing as running, and defensive facing was largely limited to low simulation velocities. The .42 live playback speed also reduced visual running effort, even when simulation players were sprinting.

Implemented continuous blends for jogging, sprinting, backpedalling, lateral shuffling and defensive containment. Live normalized running effort is supplied separately from travelled distance: speed controls posture while distance still controls the step cycle. Sprinting leans farther forward with stronger arm drive and swing clearance. Retreating and lateral defenders lower their centre of mass, take shorter and lower steps, and hold wider arms for balance. Lateral steps open and gather without crossing the feet. Acceleration/deceleration and turning continue to drive forward/braking lean and lateral balance.

Nearby defenders face the attacker at containment pace and open toward travel as speed rises into pursuit. Kick and receiving preparation retain priority. Existing stance anchors, bounded leg solve, head stabilization, opposed pelvis/chest motion, teaching sample determinism, reduced-motion behaviour and ride overrides remain.

Full-rig direction fixtures measured mean torso lean of .121 radians jogging, .315 sprinting, .015 backpedalling and .100 shuffling. Defensive pelvis height was about .73m versus .83m jogging; shuffle swing clearance was about .052m versus .300m sprinting. Left and right shuffles maintained positive foot separation. These are controlled rig fixtures, not biomechanics validation or real-device performance measurements.

Validation: full-rig support/pivot/seek tests, live contact and defensive intent tests, ride regression, batching regression and production build. Browser audit exercises active matches across all four formats. Changes remain local, not deployed.
