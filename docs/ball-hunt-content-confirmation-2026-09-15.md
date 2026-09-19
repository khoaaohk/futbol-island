# Ball hunt revision and second audit

Local implementation, not deployed. Follows `ball-hunt-content-audit-2026-09-15.md`.

## Changes

Implemented all ten recommended concept replacements, including summaries, stage captions, action labels and SVG situations. Existing collectible IDs, locations and progress remain unchanged. Revised the related illustrations to demonstrate their specific technique, timing, pressure and movement rather than relying on different text.

Practice idea now opens a lesson-specific prediction prompt in the same fixed-size modal. Each of the 50 entries has its own prompt; 49 football practice buttons are exposed (museum remains story replay). Learners predict then reveal the existing stages. This is guided practice, not a scored test. It no longer routes unrelated techniques or defending tips into one of three generic quests. Got it remains available throughout, replay resets, and discoveries remain saved.

## Second audit method and findings

Reviewed all summaries/captions/actions against their diagrams. Compared every three-stage sequence twice: first the complete data, then node positions/roles/orientations, runs, ball routes and zones with all labels and notes excluded. Both comparisons now return 50 distinct patterns. Automated uniqueness is a guard against relabelled reuse, not proof of educational effectiveness.

Manual pattern review additionally changed:

- Receiver escaping a cover shadow: sideways movement, fixed passer.
- Carrier changing the passing angle: sideways dribble, fixed receiver.
- Curved receiving run: an arc through a new intermediate position and a different forward destination, not the same sideways endpoint.
- One-touch passing: straight relay with one contact; third-player combination: indirect triangular connection around a blocked A–C route.
- Basic triangle: forward and backward options; width: two wide attacking options; moving triangle: supports adjust around the new carrier.
- General pass-and-support: receiver retains the ball; give-and-go: a returned pass beyond the marker.
- Pace: visibly unequal distances across successive stages; direction change: a changed route.
- Communication initially still duplicated first touch after labels were removed. Fixed to show approaching pressure, a separate caller and receiver response.

Concepts necessarily share football fundamentals. Passing and receiving appear in many lessons, but the lesson cue and demonstrated action must differ. No requirement that every elementary pass use a novel shape: a straight accurate pass remains appropriate for technique, while timing, contact, support or pressure must visibly distinguish the situation.

## Verification

- `tests/ball-hunt-lessons.cjs`: all 150 stages bounded, stage transitions, 50 distinct labelled and unlabelled patterns, 50 distinct prediction prompts, and semantic checks for scanning, carrier movement, support, pace, pass weight, goal-side recovery, pocket exchange and existing offside/depth/press-cover behavior.
- `tests/coin-quest.cjs`: all 50 saved IDs, reward migration, persistence and collection behavior pass.
- Production build passes; modal data remains lazy-loaded, no new animation loops or 3D assets. Main initial bundle remains 389 kB / 477 kB first load in the build report.
- Mobile Chromium production verification passed all 50 replays / 150 stages, fixed outer modal dimensions, 49 specific practice actions, prediction/reveal and dismissal with no page errors. Selected angle/curve/third-player/relay/goal-side screenshots were inspected. Final scan-stage position refinement was rechecked with the diagram semantic tests. No physical-device cooling result is claimed.

Deployment confirmed: `dpl_BCbYycM4ZE3jrUUJYYaPopetRQZi`, aliased to https://futbolisland.app. Production browser passed all 50 replays / 150 stages and specific practice flow. Subsequent live-player thermal culling is a separate local change, not part of this deployment.
