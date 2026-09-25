# Body movement implementation — September 22, 2026

Applied the five implementation stages in [the research review](body-movement-research-2026-09-22.md) to the existing shared rig. The learning purpose is to make support-foot placement, striking surfaces, weight transfer and recovery readable during play and lessons.

- Pass, driven shot and loft now have distinct contact-normalized trajectories. The boot travels forward through impact and follows through afterward; charged walking shots use the same profiles.
- An analytical 3D two-bone solve targets the selected striking surface at the ball, with a committed striking foot and eased departure from the planted pose. Extended contacts shift the pelvis toward the ball within bounded reach.
- Desired movement direction and remaining travel distance prepare cuts and stops before actual velocity changes. Retreating players progressively open their hips into a chase. Keyboard and joystick intentions use the same world-space transform as movement.
- Transition-only inertial offsets replace continuous upper-body filtering. Continuous gait retains its excursion while changes of intent blend chest, arms and head. Pauses and authored lesson samples remain deterministic.
- A small offline CMU run/kick reference contributes restrained upper-body accents. The existing procedural root, support feet and contact targets remain authoritative. Source provenance, terms, hashes and the estimated kick-contact frame are recorded under [body-mechanics](body-mechanics/motion-reference-provenance.md). The contact frame is a kinematic proxy, not a recorded ball event.

No new animation framework, runtime motion parser, learned model or external dependency was added. Motion matching and a skinned-character migration remain future options, not suitable drop-in upgrades for this rigid-part rig. Restricted research datasets were not imported.

## Validation and tradeoffs

The contact fixture passes 96 neutral role/technique/side/heading combinations and 72 extended/lateral contacts (3 cm tolerance for the latter). It verifies forward boot motion at impact, committed-foot continuity, cut preparation and retreat recovery. These controlled fixtures do not establish a universal contact error for every moving live scenario.

Body mechanics, range, seams, profiles, support soles, motion/ride overrides, field/teaching contacts, batching, charged shots, ball actions, juggling, game-engine, live-pattern and role-movement checks pass. Shared batching remains 22 players / 10 batches. Live browser checks pass across futsal, 7v7, 9v9 and 11v11. Desktop and phone-width browser technique checks each cover 72 poses across front/side/rear; desktop and phone-width fluidity checks each cover 264 frames of run/receive and cut/stop transitions.

At 60 Hz, the controlled fixture measures maximum upper-joint step of .4743 rad without response, .1414 with the previous continuous spring, and .1495 with transition-only inertialization. Corresponding maximum sampled acceleration is 1535.9, 178.7 and 491.1 rad/s². Arm excursion is 1.6021, 1.4774 and 1.6021 rad. The new response preserves amplitude but has higher peak acceleration than the previous spring; it is not a universal smoothness win. Checks also pass at 30/120 Hz.

Runtime work stays on the existing visible-player update. Per rig, response and reference buffers total 768 bytes, plus cached solver vectors/quaternions. Two compact 25-row reference curves are sampled with bounded arithmetic; the 3D solve runs for the striking leg. No additional meshes, scene traversals, raycasts, background loops or per-frame helper allocations. Offscreen sleeping and reduced-motion behavior remain. Local implementation; no deployment or physical-phone thermal measurement.

Final validation: production build passes (home route 473 kB; first-load JS 561 kB). The prior engine-pass build was 462/550 kB; this working-tree build includes the motion/reference and narration changes. All 22 adapted stories pass the seam review (117 boundaries, 1,060 samples, zero pixel differences/draw errors). Live browser verification confirms the “Love Futsal” heading, replacement media URL, advancing playback and release on close. Default town tests and narration/movement regressions pass. Local only; not deployed.
