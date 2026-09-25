# Upper-body research and implementation assessment

The user reports straight pendulum arms and an apparently rigid stomach/chest during plays. Code inspection confirms a `pelvis → torso` hierarchy, one rigid lathed shirt mesh, and shoulder/elbow/hand joints. The shirt has no independent lumbar/chest deformation. Existing IK, exact damped responses, transition inertialization and captured upper-body accents already exist; adding them again is not the missing solution.

## Evidence consulted

- [Preece et al., 2016](https://pubmed.ncbi.nlm.nih.gov/26618444/): 28 runners, coordinated pelvis/lumbar/thorax movement in three planes. The reported transverse-plane pelvis slightly lagged the thorax. This does **not** support a universal rule that the chest must always lag the hips. Our previous 0.18rad chest delay is an artistic parameter, not a validated physiological constant. Phase relationships should be evaluated per gait, speed and plane.
- [Franz et al., 2009](https://pubmed.ncbi.nlm.nih.gov/19124245/): 73 adults, hip/pelvis coordination differs between walking and running. A single amplitude/timing preset is insufficient evidence for all modes. No clinical angle prescriptions are taken from this study.
- [Spring-It-On article](https://theorangeduck.com/page/spring-roll-call) and [source](https://github.com/orangeduck/Spring-It-On): exact spring integration, velocity continuity, inertialization and quaternion response. Good reference for targeted transitions; our code already implements analytic responses. Do not low-pass every channel and lose the intended excursion.
- [Motion-Matching source](https://github.com/orangeduck/Motion-Matching): inspect pose/velocity/future-trajectory features and transition handling. Its README distinguishes MIT code from its NC-ND motion-data source. Do not import the demo database into this product. Motion matching would also need a useful licensed football clip library; it cannot synthesize all missing actions by itself.
- [Ubisoft's explanation](https://www.ubisoft.com/en-us/studio/laforge/news/6xXL85Q3bF2vEj76xmnmIu/introducing-learned-motion-matching): pose selection, inertialization and foot IK are complementary. Relevant architecture, not a drop-in browser solution.
- [IK and Foot Locking](https://theorangeduck.com/page/inverse-kinematics-foot-locking): preserve pose while constraining contact points; contacts must remain authoritative as the torso changes. Existing implementation follows that principle.
- [AI4Animation](https://github.com/sebastianstarke/AI4Animation): research/reference for learned character control; not integrated or trained here.
- [PositionBasedDynamics](https://github.com/InteractiveComputerGraphics/PositionBasedDynamics): possible constraint-solver research source for future secondary motion. A full-body dynamics replacement is not necessary to expose chest/waist movement and is not being added to phone runtime.
- [Three.js SkinnedMesh](https://threejs.org/docs/#api/en/objects/SkinnedMesh): a potential implementation route for a deformable torso. Its interaction with the current rigid-mesh batching must be evaluated rather than assuming unchanged draw cost.

## Mathematics that fits this engine

1. **Coupled phase curves:** shared distance-driven gait phase with separate amplitudes and phase offsets for pelvis yaw/roll, lumbar bend, chest yaw/roll, shoulder sweep and elbow flexion. Fit offsets from suitable references instead of independent random oscillations. Sampled lessons must derive the same pose directly from the timeline, including backward scrubs.
2. **Velocity-preserving transitions:** decay pose/velocity differences at state changes; use cubic Hermite endpoint velocities for feet transitioning to a fixed support anchor. This is partly implemented now. Preserve contact timing and do not filter the kick through ball impact.
3. **Small spine chain:** pelvis → lumbar → chest, with smoothly distributed shirt weights. Allow side bend, flexion and twist rather than rotating the entire shirt as one block. Keep shoulders, head, collars, clothing and costume bindings coherent. This is the structural next step, **not implemented in this pass**.
4. **Constraint-based arm targets:** a bounded hand arc and two-link arm IK can coordinate humerus rotation, elbow bend and forearm movement while respecting torso clearance. Implement only after checking the current authored multi-axis arm changes visually; more joint motion alone is not automatically better.
5. **Optional angular-momentum heuristic:** use estimated limb angular motion to bias torso counter-rotation within small bounds. This would be animation control, not a physically validated conservation solver. Do not introduce a heavyweight simulator just to tune a visible sway.

## Implemented while researching

The current rig has more visible chest yaw/sway and gait flexion, shoulder elevation/yaw/abduction and independently phased elbow bending. Extra torso expression fades during braking and ball actions so balance/contact remains stable. A sampled-play test at 3m/s measures approximate local-axis excursions of21.8° torso yaw (hip+chest proxy),9.2° chest roll,14.9° shoulder yaw and49.6° elbow flexion. These are authored results, not physiological target ranges. Deterministic seek and paused playback pass.

The island walking ball was a separate controller still using0.95m lead, which explains the screenshot despite live-match fixes. Its rendered attached-ball state now synchronizes to the current boot contact after posing, with existing footprint/stair support checks; the fallback lead is0.56m. Charging, windup, shooting and juggling remain separate. Relevant ball/stair/wall-juggle regressions pass.

No external library or dataset was installed for this research. No new physics simulator, trained model or physical-phone validation is claimed. A weighted spine is the proposed structural improvement; the present changes still use the rigid shirt.

Latest preview `dpl_9juhava6TTSE9EHcN2yy76fRNnec` is READY at https://futbol-island-bx2hc76fg-khoa0aohk.vercel.app/motion-lab. Vercel build passes (home570kB / lab262kB first load), authenticated HTTP200 and dribble-review controls verified. Sign-in protection retained. Production unchanged.

## Implementation follow-up

The recommended small spine is now implemented with independently articulated lumbar/chest joints and shared weighted morph surfaces, preserving individual and instanced rendering. Existing spring/inertial/contact mechanisms remain in place. See the deformable-spine entry in the performance guide for approximation bounds, runtime cost and verification. Earlier “not implemented” statements above describe the research checkpoint, not the current implementation. No motion database or physics library was imported. Real-device validation remains outstanding.

Deformable-spine preview `dpl_2F41LCik632jyawEvgraR1sGJkWE` is READY at https://futbol-island-bp7810q6k-khoa0aohk.vercel.app/motion-lab. Local build passed (home569kB/lab262kB first load); Vercel build passed (home571kB/lab263kB). Authenticated preview response and expected review controls verified. Existing sign-in protection retained. Production unchanged.
