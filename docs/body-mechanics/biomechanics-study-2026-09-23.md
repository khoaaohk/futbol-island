# Biomechanics-led movement study

Started September23,2026. This is the first measured refinement milestone of the requested study, not a completed multi-week biomechanics validation. Physical-device observations and repeated visual acceptance are outstanding.

## Evidence and interpretation

The reference work uses published movement studies, not freshly recorded human motion capture. No reference footage was digitized, no muscles/forces were measured in the game, and the rig is not a musculoskeletal model. Synthetic motion scripts reproduce situations to expose animation failures; their paths and parameter values are authored tests rather than measured human constants.

| Reference | Useful observation | Application to this rig |
|---|---|---|
| [Kinematics, ground reaction force, and muscle balance produced by backward running](https://pubmed.ncbi.nlm.nih.gov/18796926/) | Backward locomotion has its own kinematic and loading characteristics. | Assess retreat, braking and opening into a chase separately from forward running. |
| [Lower extremity joint kinetics and energetics during backward running](https://pubmed.ncbi.nlm.nih.gov/2072839/) | Knee/ankle functional roles differ between forward and backward running. | Do not reverse the forward run pose or reuse its braking direction unchanged. |
| [Whole body mechanics differ among running and cutting maneuvers in skilled athletes](https://pubmed.ncbi.nlm.nih.gov/25149902/) |25 soccer athletes showed angle-dependent preparation:90° cuts emphasized approach braking more than45° cuts. | Separate45°/90° sequences and retain intended-heading preparation. Do not claim the synthetic turn duration reproduces the study. |
| [Dynamics of the support leg in soccer instep kicking](https://pubmed.ncbi.nlm.nih.gov/24575753/) | Support-leg loading and pelvic rotation participate in the kick. | Test approach, support, strike and recovery as a continuous sequence. Preserve exact strike contacts while refining recovery. |

These papers guide qualitative sequencing. They do not establish universal joint-angle targets for this stylized rigid-part character, children, or every football technique.

## Repeatable protocol

`lib/graphics/study/scenarios.ts` defines eight six-second sequences: accelerate/stop, retreat/stop, retreat/turn/chase, anticipated45° and90° cuts, shuffle/reverse, receive/pass, and approach/shot/recovery. Integrated smoothstep velocity supplies continuous positions and avoids injecting one-frame direction teleports into the baseline.

`node scripts/audit-motion-study.cjs <output.json>` measures192 cases:8 sequences ×4 profiles ×3 simulation rates (30/60/120Hz) ×2 mirrored directions. Knee flexion is measured from world-space hip/knee/ankle vectors; trunk pitch is the summed local sagittal pelvis/chest rotation (a screening approximation during multiplanar turns). Ground-level displacement counts successive ankle samples below.09×profile-height metres. This proxy includes toe-off/landing frames and is NOT a measurement of true contact friction or foot sliding alone. Compare equal scenarios/rates; a per-frame displacement is not interchangeable across frame rates.

Baseline and refined JSON reports are in `study-results/`. The baseline starts from the prior local articulation pass, not deployed production. The complete baseline was reconstructed by reverting only this study's three behavior edits in the audit loader: stationary support-foot release, spring-controlled brake loading, and reach release during retreat-to-chase. Its source hash consequently also reflects comment differences; it is not an independent historical deployment.

`node tests/motion-study.cjs` reruns the matrix and protects empirical ceilings for braking pitch steps, chase release and post-strike recovery. These thresholds are regression budgets, not clinical ranges.

## Findings and accepted refinements

1. **Stationary post-kick support release:** the old handoff expected a moving gait to take over. At a standstill there was no gait lock/lift-off, so a support boot could jump to the neutral target. It now uses the existing anchored, arcing release step before settling.
2. **Braking pitch:** a fixed-speed sit-back ramp changed chest angular velocity abruptly. Brake loading now uses the existing exact critically damped spring at rate20s⁻¹. Support/brake contact logic and the simulation clock are unchanged. This is a tuned animation rate, not a measured tissue constant.
3. **Retreat-to-chase reach:** the slow-speed support rule could hold a boot beyond comfortable reach while the hips opened into a run. The opening phase can now release that exhausted stance into the existing lifted recovery, avoiding a forced ground drag. Ordinary slow shuffles retain their support rule.

The measured peak metrics below are maxima across the same profiles, rates and mirrored cases. They are synthetic screening results, not estimates of human performance:

| Sequence / metric | Baseline | Refined |
|---|---:|---:|
| start-stop / pitchStep | 13.42° | 8.54° |
| cut90 / pitchStep | 12.11° | 7.14° |
| retreat-chase / groundStep | 16.48cm | 7.02cm |
| receive-pass / recoveryGroundStep | 20.82cm | 5.60cm |
| shot / recoveryGroundStep | 20.82cm | 4.20cm |

Post-strike recovery is the3.0–3.7s interval; groundStep covers the full sequence after initial0.5s. Residual flags remain: the30Hz goalkeeper shuffle reaches13.1cm between low-height samples, and some initial acceleration samples exceed10cm. These require contact-state/visual assessment rather than hiding the metric or treating every low-height sample as a planted boot. The accepted changes do not resolve every stiffness issue.

## Review page and physical-phone handoff

`/motion-lab` is an unlinked, no-index review page using the same `createPlayer` rig. It has8 sequences, four profiles, mirrored directions, front/side/rear/three-quarter views, normal/half-speed playback, deterministic fixed60Hz replay for scrubbing, and local diagnostic export. View changes reuse one renderer. Playback starts only on demand, stops after6s, sleeps while paused/hidden, and disposes GPU resources on leaving. No telemetry is uploaded. The page is separate from normal gameplay and does not reproduce full island rendering load.

For the primary iPhone/Chrome target:

1. Start cool, note phone/browser/OS, power mode, brightness, battery and ambient conditions. Use comparable conditions for successive builds.
2. At normal speed review retreat/stop, retreat/chase, both cuts and shuffle from front and side. Repeat mirrored. Note sequence/time/profile/side for any slip, snap or stiff pose.
3. Review receive/pass and shot recovery, then inspect the same instant at half speed or with the slider. Export diagnostics for any problematic sequence. Use screen recording when useful; account for its extra load separately.
4. Confirm pause and backgrounding stop playback. Rotate the phone and scrub to both timeline endpoints. Return to the island.
5. Separately play live futsal and11v11 for5–10minutes under the same conditions, reporting perceived responsiveness and warming. Lab timing does not predict full-game heat. Diagnostic export does not measure temperature or battery consumption.

The assistant has not performed these physical-device steps. Browser emulation is recorded separately below.

## Work still required before calling the study complete

- Human visual review of full sequences and iterative tuning based on actual phone observations.
- Resolve/classify remaining low-height shuffle/startup displacement flags with contact-state evidence.
- Compare cadence, torso/hip timing and recovery silhouettes against suitable licensed reference footage; published abstracts alone are insufficient for precise curve fitting.
- Repeat real-phone live-game runs after accepted tuning. Keep the2–4week estimate as a planning range, not elapsed work or a delivery guarantee.

This milestone preserves the existing motion-reference curves, contact solver, teaching timelines and rendering quality. The brake spring adds16bytes per rig (response/reference storage now1184bytes); no extra gameplay animation loop, mesh or raycast. The lab adds an isolated route and on-demand renderer, not per-player runtime work.


## Validation of this milestone

The 192-case regression, body mechanics/fluidity/batching, field contacts and dribbling, teaching contacts (918beats/217passes), and ride poses pass. Typecheck and whitespace checks pass. Browser checks at390px and1440px pass all eight sequences, pause/scrub endpoints, one canvas, diagnostic export and error capture. These are desktop browser runs, including a touch viewport, not physical iPhone results. Production build passes (home568kB first load; isolated lab260kB first load). A CSS alignment compatibility warning was corrected before deployment.


Preview verification: deployment `dpl_8HoSCeSjpPuFctzoCvsVXNFwA9rs` is READY at https://futbol-island-7jkjkefhd-khoa0aohk.vercel.app/motion-lab. Vercel build passed without the corrected CSS warning (home569kB first load; lab261kB). The preview retains existing Vercel sign-in protection; unauthenticated requests redirect to sign-in. Production at futbolisland.app was not changed. Physical-phone testing remains outstanding.

Authenticated preview verification returned HTTP200 and the expected movement-review controls.


### September 23 — support-contact refinement (second milestone)

The remaining shuffle/startup flags exposed two constraints: a slow gait could retain a stance beyond physical reach while waiting for the opposite boot, and a fixed0.3m lateral limit clipped a reachable wide shuffle. Exhausted gait stance now uses the existing lifted release regardless of speed; shuffle lateral room blends0.3→0.5m, still bounded by actual leg reach. No new meshes, loops, raycasts, buffers or production diagnostics.

The audit now instruments its in-memory rig module to distinguish consecutive fully locked samples with unchanged support anchors from lift-off, replant and striking frames. Across the same192 cases, peak actual locked-support drift for shuffle falls6.85cm→numerical noise; start-stop5.82cm→numerical noise. All six locomotion sequences pass a1mm locked-drift ceiling. This does not mean all contact motion is perfect: receive/pass still has up to5.1mm locked drift, and low airborne/landing shuffle steps still reach11.51cm at30Hz. The longest both-ankles-above10cm interval for shuffle remains0.142s across the matrix; one forward-profile60Hz case increases by0.033s. This is a clearance proxy, not proof of ground reaction forces or absence of hopping. Reports: `docs/body-mechanics/study-results/support-{baseline,refined}-2026-09-23.json`.

Validation:192-case motion regression, body mechanics, retreat balance, fluidity, strike contact (96plus72extended cases),208range branches, seams, field contact/dribbling, batching and ride poses pass. Typecheck passes. Movement-lab390/1440browser checks pass. Physical-phone testing remains outstanding. Preview/build status follows.

Second-milestone local production build passes (home568kB / lab260kB first load). The12-frame goalkeeper shuffle contact sheet was visually inspected after correcting the capture harness to use compositor screenshots; no blank capture frames remain. This inspection covers sampled frames, not a physical-phone or motion-capture validation.

Second-milestone preview `dpl_7FGQtbcikcFztWUxRt1RfDCcr5X3` is READY at https://futbol-island-juefrrm5r-khoa0aohk.vercel.app/motion-lab. Vercel build passes (home569kB / lab261kB first load), authenticated HTTP200 and expected review controls verified. Existing sign-in protection retained. Production unchanged.


### September 23 — toe-off and trunk timing (third milestone)

Gait release previously added a fixed0.02m heel clearance at its first frame. Clearance now rises from zero through a smoothstep envelope over the first15% of the release blend, then follows the existing decay. A broader parabolic replacement was rejected because it changed moving-kick support behavior. The failing kick regression also exposed a stale release: capturing a grounded boot as kick support did not clear its previous gait replant. The support capture now cancels that old replant and lift-off flag, keeping its world anchor authoritative.

Across192synthetic sequences the largest measured first-release vertical step decreased from2.10cm to0.52cm; shuffle, acceleration and both cuts fall to numerical noise at that transition. This is a specific onset measurement, not a claim that total foot acceleration or every landing improved: peak acceleration elsewhere remains high and the shuffle's low-height swing displacement remains. A6mm regression ceiling now protects the measured onset across all profiles/rates/mirrors, alongside unchanged planted-contact and kick-support budgets.

The chest counter-rotation has a0.18rad gait-phase delay relative to the hip coil (about2.9% of a cycle). It retains its amplitude and existing transition response; this is an authored timing adjustment, not a measured human constant. No extra player state, geometry, render passes or animation loops; one additional sine evaluation per posed rig.

Validation so far:192-case study; body mechanics and flat soles; retreat balance;30/60/120Hz fluidity;208range branches; strike contacts; seams and moving-kick supports; field/dribble contact;918teaching beats/217passes; batching and ride poses pass. Typecheck passes. Physical-phone review and reference-footage comparison remain outstanding. Browser/build/preview details follow.

Third-milestone validation:390px/1440px movement-lab checks pass, the12-frame shuffle contact sheet was inspected, and the production build passes (home568kB / lab260kB first load). Desktop-only22-rig pose benchmark median0.452ms / p950.546ms; this excludes rendering and is not a phone thermal measurement. Preview deployment pending; production unchanged.

Third-milestone preview `dpl_Gg86BikZMbvo7iqvPmxUTuqxjGpt` is READY at https://futbol-island-ivltob8fp-khoa0aohk.vercel.app/motion-lab. Vercel build passed (home570kB / lab261kB first load). Authenticated HTTP200 and review controls verified; existing Vercel sign-in protection retained. Production unchanged.


### September 23 — high-step landing timing (fourth milestone)

The acceleration trace located a cut-preparation landing that brought an airborne ankle down roughly28cm in34ms. Its duration used horizontal travel only. High approaches now add0.2seconds per metre above0.18m to the existing reach time, capped at0.14s. Ordinary low plants keep their quick timing. These are tuned animation constants, not a biological landing law. Experiments extending every plant and easing yaw sooner were rejected because the existing45-degree planted-turn regression failed; its threshold was preserved.

Across the192-case matrix, peak foot acceleration during90-degree cuts falls1735→1481m/s² (about15%);45-degree cuts1680→1637m/s². These discrete second differences remain high and depend on sample rate; they are artifact-screening metrics, not human forces or evidence that all landings are realistic. The maxima for low-height displacement and both-ankles-raised duration remain unchanged for these two scenario sets. The1mm locked-support and6mm release-onset budgets remain. A1550m/s² empirical90-degree-cut ceiling now guards this regression. Reports are in `study-results/landing-{before,after}-2026-09-23.json`.

Reference inspection now has a reproducible offline command: `node scripts/analyze-motion-reference.cjs /tmp/fi-mocap-reference`. It verifies the existing CMU trial hashes and reuses the existing importer's skeleton parsing without rewriting game curves. For the selected0.733s run excerpt, knee-flexion ranges are0–116° left and0–105° right; the0.75s kick excerpt has33–69° left and25–84° right. These are single-clip observations under the existing120Hz/parser assumptions, not normative limits or direct calibration targets. Root-relative ankle height is explicitly not ground clearance. No new raw captures or cut/shuffle references were acquired, and no motion-reference asset was changed. Report: `study-results/reference-observations-2026-09-23.json`.

Runtime delta: bounded arithmetic only when selecting a cut replant; no new rig storage, render work or background loops. Movement study, body/sole mechanics, range, seam/kick support, fluidity and strike tests pass; typecheck passes. Physical-phone review remains outstanding. Further validation/build/deployment follows.

Fourth-milestone validation complete: field/dribble/teaching contact, batching and ride tests pass;390px/1440px lab playback checks pass;12cut frames visually inspected. Local production build passes (home568kB / lab260kB first load), whitespace check passes. No physical-phone or thermal results. Preview deployment pending; production unchanged.

Fourth-milestone preview `dpl_HjB2LmEcXPWLWoHG184Df8U5SEQA` is READY at https://futbol-island-p400o5yqt-khoa0aohk.vercel.app/motion-lab. Vercel build passed (home570kB / lab261kB first load); authenticated HTTP200 and review controls verified. Existing sign-in protection retained. Production unchanged.


### September 23 — swing momentum and closer dribbling (fifth milestone)

Anchored replanting now uses a bounded cubic Hermite start tangent: the prior foot velocity contributes `u(1-u)^2 * duration * velocity`, decaying to zero at the fixed landing anchor. Anchored steps advance by the current timestep immediately, avoiding a one-frame freeze at handoff. Incoming velocity is capped at6×root-scale m/s; grounded and authored reset paths clear it. Existing world locks and strike targets remain authoritative. Compared with the fourth milestone's same192cases, peak shuffle acceleration falls741→526m/s² (29%); start-stop815→645m/s² (21%). Cut90 remains1481m/s². These are synthetic finite-difference measures, not measured human forces.

The user's new dribbling report exposed a disconnected ball animation: live ball position previously oscillated0.85–1.15m ahead independently of the rig. Live and teaching dribbling now select/blend the visible leading boot's contact point, with a0.5×root-scale forward floor. The blend chooses an actual boot point once the feet separate enough, so touches can visibly meet the ball. This is close-control visual coupling, not newly simulated ball impulses; it does not claim physically correct free flight between every touch. Receiving/striking retain their existing contact paths. The fallback without a rig uses0.5–0.62m ahead. The old0.85m clearance tests were updated to the user's closer-control requirement; added actual-toe-distance checks pass nine speed/scale/turn trajectories.

The review lab adds a ninth sequence, Close-control dribble, with the existing patterned match ball visible and rolling. The audit now covers216cases. It keeps the prior locked-support, toe-off and cut-landing budgets. No changes to teaching content or narration.

Runtime costs: four persistent Vector3 objects for swing/replant velocity and two for dribble contacts (144bytes of numeric payload plus object overhead); no per-frame allocations from these changes. A visible owner now refreshes rig world matrices and transforms two ankle points for ball contact. No new main-game meshes or loops; the isolated lab adds one ball mesh/texture, disposed on exit. Desktop-only22-rig benchmark median0.461ms / p950.593ms excludes rendering and cannot establish phone heat. Body/sole,216-case study, range, seam/support, fluidity, strike, field/dribble,918teaching beats/217passes, batching and ride tests pass.390/1440lab checks pass and the dribble contact sheet was inspected. Physical-phone validation remains outstanding.


### September 23 — island dribble and visible play expression

The screenshot revealed the island walking ball still used a separate0.95m lead. `walkBall.syncDribble` now adopts the current posed rig's boot-driven contact before drawing, preserving ball-footprint floor/stair clearance; ordinary fallback lead is0.56m. A reusable player record avoids new per-frame object allocation. Live-match and teaching close control remain as in the fifth milestone. Charging/windup/shot/juggle paths are excluded from this synchronization. Ball-actions and wall-juggle regressions pass, including terrain and charging isolation.

Added visible chest yaw, sway/flexion and larger shoulder yaw/elevation/abduction with independently phased elbow flexion. Extra expression fades during braking/ball actions; an initial braking-hand regression was fixed without loosening its bound. Sampled-play expression test measures21.8° hip+chest yaw proxy,9.2° chest roll,14.9° shoulder yaw and49.6° elbow excursion; seek and pause reproduce poses. These are animation settings, not physiological norms. The shirt remains one rigid mesh; a deformable lumbar/chest chain is a research recommendation, not implemented. See [upper-body research](body-mechanics/upper-body-research-2026-09-23.md) for primary biomechanics, GitHub references, math choices and dataset restrictions. In particular a universal chest-lags-hips claim is not supported by the cited running study.

The changes add arithmetic and a walking-owner matrix refresh/foot transform; no new gameplay meshes or loops.216-case study, teaching-expression, body/sole, range, seams, fluidity, strike/field/dribble/teaching contact, batching and rides pass. Typecheck passed. Browser/build/preview status follows; physical iPhone heat remains unmeasured.

Latest validation: actual island walking controller browser check passes (attached ball0.569m ahead, zero horizontal difference from computed boot contact in the sampled frame); articulation contact sheet inspected. Local production build passes (home568kB / lab261kB first load), typecheck and whitespace check pass. Preview pending, production unchanged.

Latest preview `dpl_9juhava6TTSE9EHcN2yy76fRNnec` is READY at https://futbol-island-bx2hc76fg-khoa0aohk.vercel.app/motion-lab. Vercel build passes (home570kB / lab262kB first load), authenticated HTTP200 and dribble-review controls verified. Sign-in protection retained. Production unchanged.


### September 23 — deformable spine and smoother close control

Implemented a carrier → lumbar → chest hierarchy. Head, collar, neck and shoulders follow the chest; the waistband remains with the carrier/pelvis. The shirt now uses smooth height weights and twelve signed rotation morph samples (two joints × three axes × two directions). This is a bounded small-angle approximation to weighted skinning, not a physics simulator or learned model. Across the sampled run the upper surface follows the collar within 2.51mm. Lower-spine bend, twist and sway use gait-specific phase/amplitude factors for running, backpedalling and shuffling; the existing analytic inertial response preserves transition momentum. Reduced motion and special ride/action poses clear the additional spine expression. Existing authored strike lean and contact solvers remain authoritative. Plush costume torso shells retain their rigid carrier binding; their head/limbs follow the articulated joints.

Male/female surfaces are shared and reference-counted. Standard Three.js morph targets cover individual meshes, shadows and instanced crowds. Crowd batching remains 10 batches for22 players; each actor carries its own weights, including after reorder/shrink/reappearance. Morph storage starts at32 rows and doubles when needed instead of uploading1024 unused actor rows; unchanged weights skip texture updates. A32-row texture uses1664bytes. Each shirt now has336 vertices/600 triangles versus126/200 previously; two shared sets of position/normal morph deltas total193536bytes of typed-array payload. Each rig adds two groups and36 doubles (288bytes) for transition response. No new animation loop or per-frame vertex rewriting. Desktop22-rig pose benchmark median0.545ms/p950.742ms excludes rendering and is not a phone-temperature result.

Dribbling now softens the leading-foot handoff from0.16 to0.32×scale, applies a continuous forward-clearance function with a0.55×scale floor and0.025×scale lead allowance, and compresses lateral motion into a bounded0.12×scale lane. At30/60/120Hz and1.5/3/5m/s, the worst lateral handoff step is at most60.4% of the previous calculation (at least39.6% lower); observed side excursion remains below9.5cm. This is deterministic geometry-based smoothing, so seeks/pauses do not accumulate filter lag. Boot-derived centre contact stays within8cm periodically across nine scaled turning trajectories; the previous4cm exact-centre tolerance was intentionally relaxed for the narrower lane, still below half the ball radius. No free-flight ball impulse simulation is claimed.

Validation: new spine deformation/hem/collar, shared disposal,70-slot growth, instanced weights and deterministic seek tests; dribble smoothness;216-case movement study; body/sole, seams/support, range, fluidity,168 strike cases, field contact,918 teaching beats/217 passes, profile/batching, rides, ball actions and wall juggling pass. The flight-reset test now compares absolute zero so equivalent IEEE-754 negative zero is accepted.390/1440 browser lab pause/seek checks pass; articulation sheet inspected; live instanced rendering has no shader/WebGL errors. Island dribble browser check passes (sample0.570m ahead, zero difference from the computed smoothed contact). Typecheck/whitespace pass. Build/preview status follows. Production unchanged; real-phone motion/heat review remains outstanding.

Deformable-spine preview `dpl_2F41LCik632jyawEvgraR1sGJkWE` is READY at https://futbol-island-bp7810q6k-khoa0aohk.vercel.app/motion-lab. Local build passed (home569kB/lab262kB first load); Vercel build passed (home571kB/lab263kB). Authenticated preview response and expected review controls verified. Existing sign-in protection retained. Production unchanged.


### September 23 — residual dribble jitter, rolling and technique refinement

The prior narrow dribble lane still sampled every IK foot placement directly. Live/island rigs now critically damp the two normalized player-relative offsets once per pose (rates48 lateral /75 forward). Translation follows the player directly, so the ball does not lag behind the runner. Repeated contact reads are pure; pause holds state, reacquisition/teleport resets, and authored samplePose seeks continue to compute direct deterministic contacts. This last distinction matters: the new temporal smoothing applies to live/island movement, not history-dependent lesson scrubbing. The existing8cm periodic boot-contact bound passes unchanged after tuning the response. Across nine30/60/120Hz and1.5/3/5m/s checks, the largest filtered lateral step is at most55.8% of the prior narrow-lane target step. This is a synthetic positional metric, not proof that every perceived glitch is eliminated.

The island's previous rolling expression added1.2rad/s even at rest and used player speed rather than ball displacement. Attached/charging/windup ground rotation now uses a reusable world-axis quaternion from actual rendered x/z travel divided by ball radius. Idle balls stop spinning; reversal reverses roll, and teleports/mode entry prime the history. Juggle/flight spin remains separately authored. No extra meshes or loops. Cost: four doubles (32bytes) plus one scratch Vector3 per rig, one owner matrix refresh during dribble posing instead of each contact read; the island roll helper owns two vectors and one quaternion with no per-frame allocation.

Running swing recovery now advances slightly earlier through a bounded sinusoidal phase remap, while stance and swing endpoints remain fixed. Shot/loft backswing clearance increases knee folding before extension; contact atphase0.36 and its forward tangent remain unchanged. The opposite arm opens during load and returns during follow-through, with smaller amplitudes for passing. Existing pelvis/chest transfer and support-foot constraints remain in place. These are authored biomechanics-inspired refinements, not motion-capture fitting or a new physics simulation.

Validation:216-case movement audit;168 strike contact cases;918 teaching beats/217 passes; range, seams, body/sole, fluidity, spine, batching and ride regressions pass. Dribble contact, repeated-read, pause, teleport, smoothing and roll tests pass; ball actions and wall juggling pass. Island browser sample is0.609m ahead with zero mismatch from the filtered contact. Running articulation and72 strike frames across front/side/rear captured; side sheet inspected and contact error below3e-14m. Typecheck/whitespace pass. No real-iPhone thermal measurement. Build/preview status follows; production unchanged.

Refinement preview `dpl_7qXkFbSRrVGGk5G1DqEMgnJfsuRQ` is READY at https://futbol-island-396yskvji-khoa0aohk.vercel.app. Local build passed (home570kB/lab262kB first load), Vercel build passed (home572kB/lab263kB). Authenticated HTTP200 and movement-review content verified. Sign-in protection retained; production unchanged.


### September 23 — strike weight transfer and recovery landing

Loading now adds a bounded support-side hip shift driven by the strike load/drive envelopes (smaller for passes). Lumbar and chest yaw articulate separately through the load and follow-through; the torso's drive contribution fades before the action ends instead of remaining fully advanced into the final phase. Existing ankle targets and contactphase0.36 remain unchanged.

At the end of a continuous slow/stationary kick (speed below0.8m/s), the striking foot now takes a0.18s Hermite landing step0.14m forward with a small speed-based lead. The old support foot remains held through this landing, then hands back to normal stance. This uses the existing replant solver and incoming foot velocity. A double-foot recovery hold must not be mistaken for braking: the braking branch now excludes this short recovery interval. Seeks, reduced motion, rides, a new touch and other non-football poses cancel/reset the added recovery state. Sampled teaching poses retain deterministic phase-based evaluation; the stateful extra landing is for continuous playback.

Rejected experiment: forcing the extra landing while already running reduced grounded support in the moving-pass regression. Keep the running gait's existing next stride instead; the original grounded-frame requirement passes unchanged. This is a tuned animation refinement, not a force simulation.

Runtime delta: one scalar recovery timer per rig plus bounded arithmetic, reusing existing foot anchors and spine response buffers. No new geometry, draw calls, raycasts, allocations per frame, or animation loops. Validation:216-case motion study;168 strike contacts;918 teaching beats/217passes; body/sole, range, seams, field contact, spine, ride/mechanics, dribble and rolling tests pass. New recovery tests cover18 profile/side/rate combinations, verify a forward grounded landing, pause during landing, seek reset, and an interrupted opposite-foot strike. Maximum sampled per-frame recovery displacement is4.82cm across30/60/120Hz; this is a regression measure, not human biomechanics data. Browser technique captures (72 frames) and mobile/desktop lab checks pass;12 final-strike/recovery frames inspected. Typecheck and whitespace pass. Build/preview status follows; production unchanged and real-phone thermal validation remains outstanding.
