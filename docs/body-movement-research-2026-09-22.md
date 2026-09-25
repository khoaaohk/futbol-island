# Body movement research and implementation plan — September 22, 2026

## Recommendation

Keep the current Three.js rig, batching, simulation authority and contact clocks. Improve the motion generator with explicit strike trajectories, anticipated foot placement and transitions that preserve velocity. Then evaluate a small library of licensed, retargeted motion curves. This is an engineering recommendation based on the repository and the primary sources below; none of these external libraries or datasets has been integrated or benchmarked in the app.

The learning purpose is visible football technique: distinguish passing from shooting, show weight transferring onto the support leg, and make preparation, balance and recovery readable.

## What our current implementation already does

`lib/graphics/player.ts` already has distance-driven gait, two-leg analytical IK, world-space support anchors, brake/cut plants, directional locomotion, role/body proportions, hip/chest opposition and ball attention. `poseResponse.ts` adds analytical damped upper-body response. `fieldRuntime.ts`, teaching motion and walking ball code coordinate action progress with `PLAYER_KICK_CONTACT = .36`. These should be extended rather than rebuilt or duplicated.

The source audit identifies these remaining opportunities:

| Current behavior | Proposed improvement | Expected visible result |
| --- | --- | --- |
| Ordinary kicks use the same forward foot curve for pass, shot and loft; height and some hip rotation differ. | Separate inside-foot, instep and loft profiles with contact orientation and follow-through. | Viewers can identify the technique without watching the ball. |
| The forward strike curve reaches its maximum at contact, then retreats. Both adjoining smoothstep derivatives are zero there. | A constrained curve with nonzero forward contact velocity; reach maximum extension after contact. | A strike travels through the ball instead of looking like a poke. |
| The striking leg uses a different lateral treatment from the support IK. | Solve a 3D foot target with a stable knee bend direction and separate boot orientation. | Opening the hip for a pass does not accidentally move the contact point away from the ball. |
| Upper-body joints continuously track a position target through a spring. | Compare transition-only inertialization or velocity-aware tracking. | Preserve useful sharpness and arm excursion while removing discontinuities. |
| Turn response largely follows measured changes in travel. | Feed known next direction and stopping distance into a bounded preparation step. | The player visibly loads the outside leg before pushing into a cut. |
| Backpedal is blended into the procedural gait with shorter stride and different posture. | Add explicit retreat-to-open-hip-to-run transitions. | Defenders can watch the ball, retreat, then turn to chase coherently. |

The strike diagnosis is about the local forward target, not a claim that the final world-space boot has zero total velocity: root translation, pelvis motion and vertical motion also contribute. A numerical evaluation of the current formula gives forward target .39 at phase .36 and .38036 at .42, confirming immediate retreat. A rendered world-space contact-velocity test should accompany the fix. Charged walking shots also have a later pose override, so changing the ordinary strike curve alone will not unify every shooting path.

## Shooting

Use explicit preparation, support touchdown, leg acceleration, contact, follow-through and recovery phases. Keep the existing .36 release marker initially. Parameterize the boot trajectory around it; do not delay the simulation to accommodate animation.

A useful implementation is a small piecewise Hermite curve: specify the contact position and positive contact tangent, continue forward after impact, then recover toward the next reachable step. Shot power affects backswing, tangent magnitude and recovery, while the support boot stays grounded. These are proposed animation parameters, not measured human constants.

Biomechanical evidence supports treating the support leg and pelvis as active parts of a strike. Inoue et al. measured support-leg knee absorption followed by extension and pelvis rotation preceding the swing-leg sequence. Map that into a brief support-leg compression, pelvis drive and later leg extension, rather than rotating every segment together. [Support-leg study](https://pubmed.ncbi.nlm.nih.gov/24575753/).

Coordination research also describes the thigh moving forward while the knee remains flexed before the later extension. Use this ordering as an animation reference, with opposing arm balance and a recovery step; it does not prescribe one universal pose or angle. [Instep coordination study](https://pmc.ncbi.nlm.nih.gov/articles/PMC5154722/).

Approach angle should influence preparation and pelvis orientation. The 2024 study specifically investigated different approach angles and multiplanar sequencing; it supports testing several approaches rather than applying one straight-on kick everywhere. Only the accessible abstract/search record was reviewed here, not its full statistical results. [Study](https://doi.org/10.1016/j.jbiomech.2023.111920).

Acceptance: both feet, multiple body profiles, stationary/moving shots and angled approaches; boot contact within an initially proposed 3 cm tolerance; forward motion persists through impact; support-foot drift remains below an initially proposed 2 cm during the settled contact interval. These tolerances are project targets to validate, not research findings.

## Passing, crosses and receiving

Author an inside-foot pass with an open hip/knee plane, medial boot surface facing the outgoing direction, compact backswing and forward continuation. Give a driven pass a longer continuation without turning it into the shot profile. High crosses/switches need a distinct below-center contact and upward continuation; avoid teaching that loft is just excessive backward torso lean. These are proposed football-animation designs to check against captured/reference motion.

Represent contact as a position, boot orientation, desired outgoing direction and event time. Solve the leg to that contact and apply ankle orientation afterward. Choose the kicking foot from ball side and reachable support state, with a short commitment window to prevent foot swapping. Preserve authored lesson choices.

For a reception, start opening the body before arrival, allow a small foot movement with the incoming ball, then transfer into the next dribble/pass. A fixed release event and separate support/strike states make this testable. Local phase research demonstrates the usefulness of asynchronous contact state across limbs and objects; its 2020 demo is basketball, so it is an architectural reference, not soccer biomechanics evidence. [Local Motion Phases](https://github.com/sebastianstarke/AI4Animation/blob/master/AI4Animation/SIGGRAPH_2020/ReadMe.md).

## Running, leaning, cutting and backpedaling

Keep distance-driven phase. Extend starts/stops with remaining-distance curves and bounded stride adjustment. Epic's distance matching drives animation from distance; its orientation/stride warping separates travel direction from facing and adjusts foot spacing to speed. Translate the principles into our procedural targets; Unreal nodes are not browser dependencies. [Distance matching](https://dev.epicgames.com/documentation/en-us/unreal-engine/distance-matching-in-unreal-engine), [pose warping](https://dev.epicgames.com/documentation/en-us/unreal-engine/pose-warping-in-unreal-engine).

Make shifty movement respond to an intended cut: shorten the preparatory step, transfer weight to the outside foot, rotate pelvis and chest with a bounded offset, then extend into the new direction. Small decorative sway can remain secondary. Planning-time research found different preparatory foot placement and trunk/pelvis behavior for anticipated versus unanticipated sidesteps. This supports distinct planned and reactive transitions; it was an Australian Rules cohort, not a source of exact soccer animation angles. [Sidestep study](https://pubmed.ncbi.nlm.nih.gov/35612593/).

Separate low-speed defensive jockeying from fast backward running. Research reports different backward-running mechanics and greater step frequency, but does not justify applying a universal low-bounce posture at every speed. Preserve ball attention while retreating, then use a planted opening step into a forward chase. [Backward-running study](https://pubmed.ncbi.nlm.nih.gov/22162855/).

Avoid smoothing contact targets after IK: that can undo the contact constraint. Smooth the transition or desired trajectory first, apply bounded body adjustments, and solve the support/strike constraints last. Preserve the independent sampled-pose path for lesson seeking and existing resets for offscreen resumes.

## GitHub shortlist

| Resource | Verified capabilities / terms | Adoption decision |
| --- | --- | --- |
| [GenoView-InverseKinematics](https://github.com/orangeduck/GenoView-InverseKinematics/) and [explanation](https://theorangeduck.com/page/inverse-kinematics-foot-locking) | Foot/toe constraints and contact locking with inertialized transitions; repository LICENSE is MIT. | Highest-value reference for improving our existing locks and their release. Retain bounded reach and avoid unnecessary pelvis sinking. |
| [Spring-It-On](https://github.com/orangeduck/Spring-It-On), specifically [tracking.c](https://github.com/orangeduck/Spring-It-On/blob/main/tracking.c) | MIT code for spring/tracking techniques; [article](https://theorangeduck.com/page/perfect-tracking-springs) explains tracking velocity/acceleration as well as position. | A/B against our current response on run → pass, receive → sprint and abrupt cuts. Improved signal tracking is a hypothesis until measured here. |
| [ossos](https://github.com/sketchpunklabs/ossos) | MIT web animation library with Three.js examples, limb IK, swing/twist and retargeting. [Limb solver inspected](https://raw.githubusercontent.com/sketchpunklabs/ossos/main/src/ikrig/solvers/LimbSolver.ts). | Closest language/platform fit. Use as a reference or isolated retargeting prototype. Its armature conventions differ from our rigid mesh groups; its sample assets need separate review. |
| [ozz-animation](https://github.com/guillaumeblanc/ozz-animation/) | MIT C++ animation tools, sampling/blending, compression and [two-bone IK](https://guillaumeblanc.github.io/ozz-animation/samples/two_bone_ik/). | Good offline pipeline and solver reference. A runtime port/WASM bridge adds integration work; unnecessary for two current legs. |
| [Three.js CCDIKSolver](https://threejs.org/docs/pages/CCDIKSolver.html) | Iterative IK for a SkinnedMesh skeleton. | Useful if we later adopt a skinned character. Our current analytical two-bone solve has a more bounded cost; this is not a drop-in for its mesh-group rig. Current online docs were inspected; version-specific availability must be checked against our installed r169. |
| [Motion-Matching](https://github.com/orangeduck/Motion-Matching) | MIT example code; linked motion database has CC BY-NC-ND terms. | Later prototype once a suitable clip library exists. Do not mistake permissive code licensing for animation-data permission. |
| [AI4Animation](https://github.com/sebastianstarke/AI4Animation) | Includes football-dribbling research and multi-contact animation. README limits the project to research/education, not freely available commercial use/redistribution; motion data CC BY-NC. | Strong conceptual reference for contact phases and layered control. Do not import its data, models or implementation into a shipping build under an assumption of unrestricted reuse. |

Motion matching needs sufficiently varied source motion before it can select convincing poses. Ubisoft's learned variant addresses database memory through learned components; it does not remove the need for data, training and integration. It is a later option, not evidence that an ML model will improve our current phone runtime. [Ubisoft research explanation](https://www.ubisoft.com/en-us/studio/laforge/news/6xXL85Q3bF2vEj76xmnmIu/introducing-learned-motion-matching).

## Motion data we can realistically inspect

CMU's official subject index lists subject 10 with six soccer-kick trials and subject 11 with one; it also lists running subjects. Its site permits inclusion in commercial products but prohibits directly reselling the data, including converted data, and requests acknowledgment. It warns about noisy toe/hand channels. Start by manually inspecting one kick and one run, then retarget offline, correct contacts and bake compact curves for our existing rig. The specific trial files were not downloaded or evaluated; the subject detail pages failed to fetch during this review. [CMU terms](https://mocap.cs.cmu.edu/), [subject index](https://mocap.cs.cmu.edu/subjects.php).

Adobe's FAQ permits royalty-free use of Mixamo animations in games. This is another source to inspect for locomotion after selecting actual clips; no specific soccer clip or suitability was verified. Our separate rigid body pieces are not automatically compatible with its auto-rigging requirements. A separate source skeleton plus offline retargeting is the more plausible path. [Adobe FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html).

## Implementation sequence and gates

1. Fix the contact trajectory and define pass/shot/loft profiles; cover ordinary live kicks, charged walking shots and authored lessons. Add contact-position, contact-velocity and support-drift checks before tuning cosmetic motion.
2. Improve 3D strike targeting and planted-to-swing transitions. Keep per-rig cached state and two bounded leg solves. Compare source and output knee direction/sole orientation.
3. Add anticipated start/stop/cut intent and retreat-to-chase transitions. Known AI trajectories can supply anticipation; player controls should remain responsive with bounded visual prediction.
4. Compare transition-only inertialization against the existing spring. Measure contact timing, angular velocity discontinuity and motion amplitude at 30/60/120 Hz; lower acceleration alone does not establish realism.
5. Inspect and retarget a small licensed clip set. Evaluate contact-normalized curve playback on the current rig before considering a new skeleton, animation database or learned model.

Review each phase front/side/rear and at actual match camera distance, with both striking feet, role proportions, ball approaches, pauses and lesson seeks. Keep the existing 22-player batching and offscreen sleeping. Proposed runtime work is constant-sized per visible posed actor; no per-player inference, all-pitch queries, extra render loop or runtime mocap parsing. Benchmark before making any CPU or thermal claim; desktop mobile emulation is not a phone-temperature measurement.

This second research pass changes documentation only. Earlier engine improvements and their validation are recorded separately in `game-engine-upgrade-2026-09-22.md`. Research findings above are recommendations, not claims that the next animation pass is already implemented.

Implementation follow-up: the five stages above have now been applied to the existing rig; see [implementation, validation and tradeoffs](body-movement-implementation-2026-09-22.md). This preserves the research record above, including what had not yet been downloaded at the time of review.
