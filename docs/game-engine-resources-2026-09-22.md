# Football engine resources and adoption decisions — September 22, 2026

The best immediate fit is a small, explicit football decision layer over the existing simulator, with reusable movement intent and contact physics. The app already has a Three.js renderer, shared rig batching, deterministic lesson sampling, tactical profiles and mobile sleeping/culling. A full simulator replacement would require redoing those integrations. The choices below are engineering judgments from the current repository and the linked primary sources, not benchmarks of imported packages.

## Useful resources

| Resource | What it supplies | Fit for Futbol Island |
| --- | --- | --- |
| [Yuka](https://github.com/Mugen87/yuka), especially its [Kickoff showcase](https://mugen87.github.io/yuka/showcases/) | JavaScript game AI: state/goal-driven agents, steering, perception and navigation. Kickoff demonstrates hierarchical team-sport decisions. Yuka lists MIT licensing. | Best architecture reference for team intent → player role → movement. Evaluate a small steering/decision prototype separately before adding a runtime dependency; existing movement already handles momentum and foot planting. |
| [Friends of Tracking / LaurieOnTracking](https://github.com/Friends-of-Tracking-Data-FoTD/LaurieOnTracking) | Tracking analysis, player velocity, pitch control, expected possession value and passing-option tutorials. | Most useful football-intelligence reference. Compare receiver/defender arrival times at a handful of candidate landing points. A complete dense pitch-control surface is unnecessary in the phone render loop. Check repository/data permissions before copying or redistributing; no code/data imported. |
| [socceraction](https://github.com/ML-KULeuven/socceraction) and its [documentation](https://socceraction.readthedocs.io/en/latest/documentation/faq.html) | Python SPADL event normalization and action valuation with VAEP/xT. Documentation states MIT licensing and requests attribution. | Offline evaluation of pass/carry/shot choices; useful for tuning an event log and a small exported value table. The Python analytics pipeline belongs in tooling, not the browser bundle. |
| [Google Research Football](https://github.com/google-research/football) | Football RL environment, academy scenarios and full-game benchmarks; top-level [Apache-2.0 license](https://github.com/google-research/football/blob/master/LICENSE). | Reference for repeatable drills and tactical-agent evaluation. Its native simulator/training environment is a separate system, not a drop-in Three.js module. Review bundled asset/dependency terms separately before reuse. |
| [StatsBomb Open Data](https://github.com/hudl/open-data) | JSON events, lineups and selected 360 match data. The repository describes research use and attribution requirements. | Offline evidence for pass lengths, crosses, switch frequency and shot locations. It is not an unrestricted motion-capture or skeletal-animation dataset. No data is bundled in the game. |
| [Motion Matching / The Orange Duck](https://github.com/orangeduck/Motion-Matching) | C++ motion-matching examples and explanations of animation-driven displacement. | Useful reference for trajectory matching and pose continuity. The README explicitly distinguishes MIT code from the linked Ubisoft animation dataset's CC BY-NC-ND terms. Do not ship that animation database as a commercial-ready asset; use suitably licensed clips for any future prototype. |
| [Rapier JavaScript](https://rapier.rs/docs/user_guides/javascript/getting_started_js/) | A WASM rigid-body physics integration for JavaScript. | Worth a focused benchmark if the game later needs general rigid-body ball/scene interactions. Current goal-frame impacts are a few swept sphere/capsule tests, so adding a second full physics world is not yet justified by this task. |

## Applied in this pass

No third-party package, model, motion database or tracking data was imported. New logic is authored in the project. The aerial-option selector takes inspiration from the general pitch-control idea: predict a short reaction interval, estimate each player's arrival time, and prefer an onside receiver with a useful margin over defenders. It evaluates only plausible crosses/switches when the carrier can act, with a cooldown; no all-pitch grid or ML inference.

The simulator now distinguishes high crosses into the box and switches away from a crowded side. They use different apex heights, lead the receiving runner, and use the existing air-drag model to schedule arrival. Futsal keeps its compact ground-first identity. Existing shots and clear chances retain priority.

Other engine work: dribble lead ahead of the stride; goal-sized upper-corner shot placement; shared continuous goal-frame collision tests with playable post/crossbar rebounds; visible live-ball panels and distance-based ground spin; stronger opposed hip/chest twist, turn lean and a lower, slightly forward backpedal stance. All keep the existing renderer and simulation clocks.

## Next useful integration

1. Record compact events (action kind, candidate target, pressure, estimated arrival margin, outcome) from seeded matches, outside normal gameplay.
2. Build a small offline evaluation set of wide overloads, unmarked box runners, screened targets, offside traps and second balls. Compare against the current heuristic before adopting a larger AI library.
3. Prototype Yuka's team/player state organization behind the existing movement-intent interface. Keep animation and contact timing owned by the current rig.
4. If authored animation clips are added, verify commercial redistribution rights, then compare a few locally retargeted run/backpedal/turn clips against the procedural rig at phone distance and frame rate.

Validation and local deployment status are recorded in `game-engine-upgrade-2026-09-22.md`. Real-device thermal measurements remain separate from desktop emulation and arithmetic/work-count checks.
