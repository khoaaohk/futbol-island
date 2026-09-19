# Quiz outcome consistency pass — September 12, 2026

Reviewed all 193 shipped questions across 96 lessons. This bounded pass read each question, correct option, primary explanation, incorrect-option feedback, and outcome narration. Automated checks independently compared those choice mappings with the authored decision and outcome geometry. No confirmed content or renderer mapping defect was found, so catalogs and runtime were left unchanged.

Per-question observations and remaining status are recorded in [quiz-outcome-review.json](quiz-outcome-review.json). Existing [play-standards-inventory.json](play-standards-inventory.json) question statuses now distinguish this completed pass from pending individual playback acceptance.

## Checks completed

- All193 questions have exactly one spatial correct option, aligned with the textual option index. Every provided per-option `why` matches the associated choice explanation. Forty-six short correct-choice explanations differ from the fuller main explanation in wording; first-pass reading found them complementary, not contradictory.
- Every outcome is the immediately following authored beat: no skipped intermediate pose or unrelated outcome index.
- All158 path choices match their demonstrated result: 61 passes reach the selected ball destination; 89 runs and8 dribbles start at the intended actor and finish at the selected target.
- All61 correct pass outcomes were sampled at81 fractions with opponents moving on their planned paths. Minimum opposing actor-center clearance was1.488m. This exceeds the0.9m test threshold; finite sampling does not prove all continuous interception/contact realism.
- All17 player choices identify an existing actor who moves or receives in the outcome. All14 spot choices are reached along an outcome path; all4 zone choices contain an outcome actor or ball.
- Every quiz feedback highlight, callout anchor and referenced line/angle actor resolves to the lesson roster.
- `node tests/quiz-outcomes.cjs` passes all193 questions. Existing playback/motion tests remain separate.

## Reviewed flag preserved

`dbz_7_dontballwatch`, question0: a simple endpoint-only check flagged the chosen spot at120,315 because the defender finishes at140,315. Reviewing the full sequence shows the defender crosses the chosen spot while following a runner moving from120,285 to150,285. The option says to move toward the runner, not to stop permanently at the spot. The existing route and explanation are consistent; no speculative edit was made.

## Remaining scope

This is first-pass semantic consistency and automated mapping acceptance, not a fresh browser/audio review of all193 question outcomes or all918 instruction beats. The earlier representative browser evidence remains representative. Per-item tactical effectiveness, timing of every defender reaction, wrong-choice causal animation, and complete narration-to-visible-cue acceptance remain pending. Sports-rule accuracy across governing bodies was not independently re-researched in this consistency pass.

No lesson text, question options, geometry, runtime UI, camera, or voice assets were changed by this pass. The parent handled the separate voice-reference completion and deployment.
