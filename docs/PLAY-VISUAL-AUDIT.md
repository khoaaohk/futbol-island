# Bounded Watch presentation review — September 12, 2026

This is a fresh representative browser review of the current island, not visual acceptance of all 96 lessons, 918 beats, or 193 questions. No runtime or catalog files were changed. The interactive quiz implementation and camera gestures are being verified separately.

## Rules and precedence

Source: `../futbol-island/AGENTS.md`, Play realism and Play clarity and presentation. Requirements include coordinated movement, full-path spacing, narration-specific highlights, gold/blue team identity, readable anchored labels, instructional arrows and outcomes, neutral quiz choices, and stable explicit Broadcast. The original rules also request Guided camera changes and review with an instruction panel open.

Later user requests explicitly removed the Watch instruction drawer and requested centered fields without clipping. Therefore this review uses the current drawer-free Watch flow. Its stationary full-field Standard camera is an intentional centering choice, not automatically a bug merely because it differs from original Guided behavior. Older claims in PLAY-STANDARDS-AUDIT.md about current Guided Watch transitions no longer describe the current implementation. Readability remains an acceptance requirement.

## Fresh evidence

All cases entered through Settings → Open full map → destination → Learn Plays → Choose plays → first lesson. Real recorded narration was playing, and playback advanced naturally from beat 1 to beat 2; these were not debug seeks. Screenshots were inspected at both viewports. The first two beats of these lessons were reviewed, not the complete lessons.

| Format | Lesson | Viewports | Actual voice / natural advance | Full field / fixed Broadcast |
| --- | --- | --- | --- | --- |
| 7v7 | `learn7_roles` | 390×844, 1100×844 | Pass | Pass |
| 9v9 | `learn9_shape` | 390×844, 1100×844 | Pass | Pass |
| 11v11 | `learn11_shape` | 390×844, 1100×844 | Pass | Pass |
| Futsal | `learnf_roles31` | 390×844, 1100×844 | Pass | Pass |

No page errors occurred in these eight cases. Explicit Broadcast was tested across a subsequent step change: residual settling was below 0.035 world metres in every case. Standard stayed essentially fixed across authored camera metadata changes, as expected from its current full-field implementation. No claim of listening acceptance is made: the browser verified recorded media advancing; narration text was compared to visible cues.

The selected formation explanations matched the displayed player counts and roles. Gold labels/rings stayed on our players; an additional receiving example showed blue opponent CM and gold our CM simultaneously. Labels were legible; actor and arrow legibility needs improvement below.

Six additional selected-beat replay checks, three at each viewport, verified actual geometry and inspected screenshots:

- `learn7_roles`, beat 12: right defender support movement, ghost-trail geometry present (6 line vertices).
- `learn7_receive`, beat 4: our forward movement and opponent response, two move routes plus one space fill (18 line vertices).
- `learn9_receive`, beat 10: fresh support angle and ghost trail (36 line vertices).

These were manual-equivalent step seeks followed by playback, not full uninterrupted lessons. They establish the cue types render, not complete action or narration acceptance.

Evidence: [machine observations](play-visual-audit.json). Browser runners are `/tmp/fi2-play-visual-audit.cjs` and `/tmp/fi2-play-visual-rare.cjs`. Screenshots are `/tmp/fi2-visual-{format}-{390,1100}-{start,next}.png` and `/tmp/fi2-visual-rare-{ghostTrail,space,angle}-{390,1100}.png` on the audit machine.

## Remaining concrete findings

1. **Mobile Watch action detail is too small on the larger fields.** At 390×844, projected playable-field height is about 328px (7v7), 352px (9v9), and 343px (11v11). The 11v11 bodies are only approximately 7–10 pixels tall in the screenshot; seeing feet, ball contact, and defensive reactions is difficult despite readable fixed-size role text. Futsal bodies are clearer. Reproduce by opening `learn11_shape` on mobile and letting beat 2 play. Preserve the centered overview, but add learner-controlled Watch zoom or a constrained instructional closer view that keeps relevant opponents and cues visible. This is separate from the new quiz-only zoom/pan.

2. **Callouts can obscure the geometry they explain.** Mobile `learn9_receive`, beat 10: the wide “Fresh support angle” callout sits directly over much of the short angle/route geometry. The renderer avoids player-body and label rectangles but does not score overlaps with explanatory routes. The angle exists structurally, yet is hard to read visually. Move route/angle labels off their diagram, retain an anchor, and verify at mobile size. Similar density makes `learn7_roles` beat 2's “Midfield” and CM role text crowd one another. These are shared cue-layout issues, so no speculative catalog edits were made while another agent owns that renderer.

3. **Teaching ball actions lack the live renderer's contact and flight effects.** Source confirmation in `lib/town/fieldRuntime.ts`: teaching rigs receive no kick action and no dribbling flag; ball height is fixed at 0.295; live effects are disabled while teaching. All six selected-beat samples confirmed ball height 0.295 and effects hidden. Authored 2D ball movement and route arrows work, but this does not demonstrate foot contact, lofted flight, or continuous ball trails. Add teaching-specific action state tied to the authored beat and verify pass/run/shot examples. Do not simply enable live-match effects, which follow a different simulation.

These findings were reported to the parent for a subsequent implementation pass. They were not changed in this bounded audit to avoid conflicting with active quiz/camera edits.

## Re-run checks and acceptance limits

- `node tests/lesson-presentation.cjs`: pass, all 918 beats sampled; minimum actor clearance 1.112m, maximum sampled speed 4.306m/s.
- `node tests/quiz-outcomes.cjs`: pass, all 193 mappings; 61 pass outcomes, minimum sampled opposing-actor clearance 1.488m.
- Playback uses `max(3 seconds, authored duration × 5)` and waits for pending narration before advancing. Actual natural advancement was observed in all eight browser cases.

These finite geometry samples do not prove continuous collision freedom or every actor's tactical realism. The existing 50 lessons with held actors still need contextual coaching review. Full original highlight merging, wrong-choice causal animations, and per-beat narration/subject coverage remain separate pending work. End-of-play button positioning was fixed and tested by the parent; this audit did not repeat the forced-end UI checks. No production deployment was performed by this agent.
