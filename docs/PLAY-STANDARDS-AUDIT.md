# Learn Plays presentation audit — September 12, 2026

Local changes only. Reviewed the current Futbol Island imports against PROJECT.md and the original island's AGENTS.md, overlays.ts, lessonPresentation.ts, and September 9 handoff. This is an exhaustive structural/sampled-geometry audit of the 96 shipped lessons plus representative browser review. It is not an exhaustive coaching acceptance of every narrated beat or quiz outcome.

## Scope and inventory

- 7v7: 18 lessons; 9v9: 27; 11v11: 20; futsal: 31.
- 918 instruction beats and 193 questions. `scripts/check-original-lesson-parity.mjs` confirms the original visible catalog snapshots remain exact; narration references are the only added catalog data.
- [Per-lesson and per-question inventory](play-standards-inventory.json) records every shipped item, findings, shared improvements, sampled movement, held actors, and pending individual review. The original island's retained/source-only 349-entry union is not shipped in this app and is outside this inventory.
- All 918 beats have explicit player cues; this establishes coverage, not that every spoken subject has been individually checked against its highlighted players.
- Imported overlay inventory: 542 lines/arrows, 334 callouts, 133 spotlights, 32 spaces, 28 ghost trails, 2 angles, and 559 `freezeHold` declarations. `freezeHold` is explicitly reserved in the original overlay contract; it is not an omitted working original effect. All 193 questions use supported path/player/spot/zone interactions and have authored outcome-step references.

## Verified gaps fixed

1. **Crossing bodies.** The original renderer's cached `planLessonRuns` planner was missing. Ported it into `formatLessons.ts`: small preplanned curved detours preserve actor IDs, authored starts/endpoints, ball carriers and frozen quiz geometry. Six directly interpolated lessons previously sampled below 0.75 m: `nx9_midfieldhelper`, `nx9_twobackcover`, `exp11_wingbackcue`, `exp11_droppingnine`, `expf_denypivot`, and `expf_delay2v1`. The new gate samples every actor at 81 fractions per beat: all 918 beats pass 0.9 m clearance, minimum 1.112 m and maximum sampled speed 4.306 m/s. It checks every authored boundary exactly. These are finite samples, not a mathematical continuous-collision proof.
2. **Authored cameras.** Guided now honors wide, closeup, sideline, tactical, broadcast, top and aerial shot metadata instead of treating nearly everything as one angle. Frames include intermediate route positions, relevant defenders and all neutral quiz options. Correct quiz feedback uses the authored outcome beat for framing. Explicit Broadcast remains fixed across playback, step changes and entering quizzes. Manual Standard/Overhead/Sideline/Goalkeeper choices remain available.
3. **Unreadable/stale labels.** Text textures use sRGB and bypass scene tone mapping. Callouts are no longer multiplied by team color a second time. Role textures refresh when a new lesson reuses an actor ID with a different label. Visible role labels use readable screen sizing and sit above bodies; actor emphasis and team colors remain tied to roster identity. Simultaneous callouts/answer badges are separated in screen space, keep clear of bodies and upper controls, and retain anchor lines when displaced.
4. **Duplicate feedback arrows.** 94 authored feedback routes exactly duplicate an interactive answer path. Those now share the interaction's single colored route instead of drawing twice. Quiz decisions remain neutral; feedback route colors do not recolor team identity.

## Verification

- `node tests/lesson-catalog.cjs --structure-only`: 96 lessons, 918 beats, 193 questions; finite playback, roster/reference/option mapping pass.
- `node scripts/check-original-lesson-parity.mjs`: all 96 visible snapshots match original.
- `node tests/lesson-presentation.cjs`: all 918 beats, 81 fractions/beat, all actors, exact endpoints, body clearance and speed pass.
- `npm run typecheck`: pass.
- Representative browser flow at 390px mobile and 1100px desktop for each format's first lesson: discovery through Choose plays, Watch with panel visible and recorded media responding, screen-readable cue textures, fixed Broadcast through a step change, neutral quiz targets inside the actual lesson viewport, on-field correct answer tap, feedback, no page errors. `/tmp/fi2-standards-browser.cjs` and `/tmp/fi2-standards-browser.json` record the cases.
- Real recorded Watch playback in `learn7_roles` at 390px and 1100px: audio currentTime advanced while unpaused; the lesson advanced automatically to the next instruction; Guided camera position and angle changed, with the instruction panel visible throughout. `/tmp/fi2-guided-watch-audit.cjs`, screenshots `/tmp/fi2-guided-{390,1100}-{before,after}.png`.
- Mobile first-futsal lesson on-field quiz and authored correct ball outcome, followed by cue cleanup on leaving, passed `/tmp/fi2-teaching-cues-audit.cjs`.

- Additional mobile spot checks discovered through Choose plays and replayed the selected beat with the panel visible: `learn7_roles` step11 ghost trail, `learn7_receive` step3 space shading/routes, `learn9_receive` step9 angle arc/trail. Screenshots inspected; pooled geometry, correct cue kind and label/fill presence passed `/tmp/fi2-rare-cues-audit.cjs`. These selected-beat checks are not full-lesson narration acceptance.

## Limits and remaining acceptance

- Voice reference gap resolved September 12: linked 251 already-generated recordings into the current catalogs using exact narration-text checks. Full catalog gate now passes all 6,760 references across four coach voices; original lesson/quiz content parity still passes. No new synthesis was necessary. Individual listening acceptance remains separate from file/reference validation.
- Fifty lessons contain one or more actors held across their authored sequence. A stationary goalkeeper, shape anchor or practice context is not automatically wrong; these require individual tactical review. The original runtime's ambient team behavior is not fully ported. No arbitrary movement was added merely to clear a static-actor counter.
- Representative playback does not establish all 193 outcomes or every one of 918 spoken-subject/cue relationships is pedagogically correct. Those per-item statuses remain pending in the inventory. Wrong answers currently keep the decision scene with explanatory feedback; they do not have the original engine's full alternative causal animation system.
- Existing pooled highlight rings/space translucency remain; the original renderer's complete highlight-union/blending and full ball-action/contact engine have not been reproduced. No claim of complete original renderer parity is made.
- High-quality mobile graphics changes are owned and verified separately by the parent agent.

## Subsequent bounded quiz consistency pass

All193 questions now have a completed first-pass read of question/options/explanations/outcome narration plus automated spatial mapping checks. No confirmed mismatch required a catalog or runtime edit. `tests/quiz-outcomes.cjs` passes; all61 correct pass outcomes have sampled opposing-player clearance of at least1.488m. See QUIZ-OUTCOME-REVIEW.md and per-question JSON. This upgrades text/mapping verification only; it does not convert pending individual live audiovisual/tactical review into full acceptance.

### Direct field quiz interaction follow-up (2026-09-12)

Removed the large quiz option-list panel. Questions now use a compact top prompt with neutral lettered choices on the pitch, exact answer feedback, a sticky Next question action, and Reset view. The parent integrates full-viewport framing and drag/pinch/wheel controls. Field selection accepts the letter target, the actual route line, or the player/space anchor; keyboard letter answers remain available without a visible answer list. Transcript question/options/feedback remain readable with voice muted.

Browser checks exercised discovery through Choose plays and actual field clicks for path, player, spot, and zone interactions at 390px and 1100px. These covered correct responses, a wrong player response, and progression to the next question. A separate 320px check tapped the route midpoint itself and produced the correct response. Tests used a debug jump to Watch completion to reach Quiz Yourself; they do not constitute complete narrated Watch reviews. Representative screenshots were visually inspected for prompt/transport separation. The all-193-question outcome mapping gate and TypeScript check passed.

Remaining standard gap: wrong answers retain the neutral decision pose with authored explanatory feedback and colored route/cue emphasis. Only the correct authored outcome currently animates in this runtime. This change does not claim animated failure-outcome parity or individual audiovisual acceptance of all 193 questions.
