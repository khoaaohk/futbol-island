# Procedural articulation — September 23, 2026

Implemented in the shared player rig to make retreating, defending, weight transfer and football technique easier to read. Local changes; not deployed.

## What changed

- Braking now opposes the direction of travel. Retreating no longer inherits the forward runner's backward chest lean or forward-only foot anchors. Hips and bracing steps follow the travel vector; forward sprint braking remains intact.
- Feet have separate lateral lanes, wider defensive recovery steps and a small outward swing arc. Slightly lower hips at jogging pace leave more room for bent knees. Sprint height is retained.
- The existing analytical two-bone solver also guides locomotion knees outward into the stance and toward a prepared cut. It solves the existing ankle target, preserving support-foot placement. Knees bend through the chain instead of receiving arbitrary sideways rotations.
- Boots gain modest toe-out and airborne ankle roll. Roll fades to zero near landing, with grounded soles cancelling the full parent rotation. Striking-foot contact orientation remains authoritative.
- Added pelvis weight-transfer roll and shoulder elevation linked to the gait. Hands are articulated by default, with forearm rotation and delayed wrist flexion/deviation. Eight extra inertial channels preserve follow-through when movement intent changes.

## Mathematical approach

The rig remains a kinematic procedural controller, not a physically simulated ragdoll or a trained motion model.

1. **Analytical IK:** the law of cosines determines the knee bend for the ankle target. A knee pole defines the bend plane, allowing hip rotation without moving the support foot. [Unity's two-bone constraint documentation](https://docs.unity3d.com/Packages/com.unity.animation.rigging@1.2/manual/constraints/TwoBoneIKConstraint.html) describes this target/hint distinction.
2. **Support-aware defensive balance:** previous-frame grounded feet estimate the local support centre. A small offset uses `h*a/g`, with lateral acceleration estimated from speed × turn rate. A critically damped spring filters the result. The correction is capped at3.5cm, fades under strong acceleration/actions, and applies to defensive motion. It is a visual approximation inspired by [inverted-pendulum running control](https://graphics.cs.cmu.edu/projects/run_control_IPM/), not that paper's full dynamic controller. Applying it to all locomotion caused a scaled-rig startup skid; the accepted version preserves the existing sprint-start solution.
3. **Soft free-leg reach:** above a soft-zone boundary `s`, reach follows `s + k*(1-exp(-(r-s)/k))`. This has matching value and first derivative at the boundary and asymptotically approaches the reach limit. The soft-zone weight follows swing clearance. Exact support/strike targets retain their existing safety clamp. [Holden's IK and foot-locking article](https://theorangeduck.com/page/inverse-kinematics-foot-locking) explains soft extension limits and why contact constraints matter.
4. **Analytical spring/inertial decay:** support correction uses the existing exact critically damped response; wrist/forearm transitions use existing transition-only inertialization. This retains the continuous gait excursion while smoothing changes of intent. [Spring reference](https://theorangeduck.com/page/spring-roll-call). No numerical Euler spring integration or independent animation clock was added.

## Validation and costs

- Retreat brake regression initially reproduced a-.1605rad chest pitch (about9.2° backward). The corrected fixture stays slightly forward across30/60/120Hz and four profiles.
- Articulation fixture: minimum retreat ankle separation approximately.477m, wrist excursion.279rad and forearm excursion.318rad. These are controlled rig-local measurements, not universal bounds on every live pose.
- Existing body, grounded sole, range, startup/stop/cut seams, fluidity, strike, teaching/live contact, dribbling clearance, profile, batching and ride checks pass. Held playback freezes the new wrist/forearm channels.
- Live browser locomotion checks pass all four formats. Desktop movement contact sheet and72 front/side/rear technique poses pass; visual review checks the stance and directional braking.
- Live batching remains22 players/10 batches. Hands use the existing meshes with two additional transform groups. Previously merged unbatched rigs may gain two independent hand meshes; do not claim zero draw-call change in every scene.
- Response/reference buffers now total1168 bytes per rig, up400 bytes. Two locomotion-leg solves, eight inertial channels and one spring channel add bounded arithmetic within the existing visible-player update. No runtime dependency, raycast, extra render loop, or per-frame helper allocation was added.
- A desktop Node probe of22 retreating rigs measured median0.440ms/p950.470ms for pose updates, excluding world matrices, rendering and the rest of the game. This is not an iPhone FPS/thermal result.

Further research worth considering after device review: a true foot/toe joint for heel-to-toe rollover, offline motion-matched locomotion poses retargeted to this rig, and a constrained full-body IK solve for extreme reaches. These need separate silhouette/contact/performance validation; they are not implemented in this pass. The existing hand geometry has no individual finger rig.

Final articulation validation: phone-width movement contact sheet passes; production build passes (home479kB / first load567kB), typecheck and diff whitespace check pass. No deployment performed for this pass.
