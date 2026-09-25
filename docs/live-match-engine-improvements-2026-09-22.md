# Live match engine improvements — September 22, 2026

Local implementation, not deployed. Learning purpose: make the consequences of passing, support runs, first touches and coordinated defending visible in ordinary live matches.

## What changed

`lib/town/match/matchSim.ts` retains the existing formation engine, team philosophies, support triangles, third-man runs, shooting model, user controls and bounded simulation substeps. Improvements extend those mechanisms rather than substituting a canned passing sequence.

- **Pass and move:** a suitable short pass creates one bounded wall-pass intention. The original passer runs beyond the receiver; a safe return can select that previous passer, previously excluded from penetrating pass selection. The return requires forward progress, an onside receiver, sufficient receiving space and a clear lane. A blocked lane or tight marker cancels the intention; unrelated passes, shots, turnovers, restarts and expiry also end it. Return passes do not immediately re-arm the same exchange.
- **Read space and carry:** the existing action decision checks three forward corridors, including both diagonal half-spaces. An open corridor earns a short commitment instead of rerolling a carry into a pass every 0.4 seconds. New pressure or a blocked corridor still interrupts it. The last-man risk guard remains.
- **Prepare before receiving:** shared `receptionPlan` anticipates the next movement or wall return instead of facing the backward chase toward an incoming ball. A safe receiver continues into the open corridor while cushioning, with at most a 0.28-second action cooldown. A pre-read wall return requires only a 0.12-second touch. An unpressed one-touch receiver also steps through contact. Nearby pressure retains shielding/composure; human steering is unchanged. Renderer preview and committed reception use the same plan and selected foot.
- **Defensive coordination:** modest distance changes retain the pressing player; a substantially better-positioned teammate takes over. Cover selection penalizes players stranded beyond the ball and favors goal-side support. Cover stays separated from the first presser; zonal markers bias toward the goal side of their opponent. Existing deeper balance, line-height response, screening and recovery remain active.
- **Futsal identity:** shorter, quicker wall-pass rotations (28 field units and 2.2-second intent, versus 38 and 2.8 outdoors), pivot linking, shorter third-man runs, closer supporting depth and smaller midfield/forward defensive-band gaps. Carry reads look 36 units ahead rather than 45 and commit for shorter spells. This is a distinct tactical policy, not a rules change or merely a pace multiplier.

`tacticalIntent` exposes the current combination, carry direction, pressure/cover/balance assignments and reason on demand for diagnosis. It does not add interface jargon or work to the frame loop. `stats.combinationReturns` counts a return pass released without a preselected interception, not guaranteed subsequent control.

## Verification

`node tests/live-match-patterns.cjs` verifies safe return selection, blocked-return cancellation, forward support movement, diagonal carry selection, stable pressing/handoff, goal-side cover selection, shorter futsal rotations, receipt velocity continuity over the first 200 ms and restart reset. It also simulates seeds 7, 19 and 43 for 180 simulation seconds in each format (12 games total).

Aggregate results from the final run:

| Format | Passes | Sustained carries | Return passes | Defensive regains* | Shots | Longest interval without pass/tackle/shot | Moving outfield samples |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Futsal | 406 | 192 | 38 | 22 | 99 | 7.53 s | 91.9% |
| 7v7 | 384 | 206 | 13 | 16 | 94 | 7.03 s | 92.4% |
| 9v9 | 528 | 183 | 18 | 17 | 43 | 6.87 s | 93.4% |
| 11v11 | 481 | 181 | 9 | 33 | 45 | 6.77 s | 90.9% |

*Regains combine the existing turnover counter, lane interceptions and opposing loose-ball recoveries. The turnover counter includes offside events. Motion samples are taken every simulation second; holding a useful position is allowed and is preferable to arbitrary swaying or constant running. These figures establish activity and boundedness, not competitive AI quality or visual polish.

Additional passing regressions: `field-contact-motion`, `live-field-frame`, `kickoff-ready`, `live-game-effects`, `match-update-clock`, `match-story`; TypeScript checks pass. Parent integration owns final production build and rendered review.

## Runtime cost and limits

No new timers, rendering assets, polling or animation loops. One combination per match; existing decision cadence does three bounded opponent scans for carries. Cover uses one existing-sized roster scan; pressing hysteresis uses constant work. The existing 2–4 Hz player brain, offscreen match throttling, pause behavior, safe substeps and player batching are preserved. Final headless runs took approximately 0.44–1.24 seconds CPU/wall execution per three-game format batch on the development machine; these are diagnostic timings, not browser performance or phone temperature measurements.

The underlying model still decides interceptions and AI shot outcomes at release; this patch does not replace that intentional model with full physical contested trajectories. It improves causal tactical decisions within it. Physical-phone feel, long-duration balance and visual review remain separate from these deterministic checks.

## 7v7 build-out follow-up

`lib/town/buildOut.ts` shares the 10 m penalty-area depth and build-out coordinates between field drawing and simulation. Each line is halfway between the penalty-area edge and midfield: local z ±8.0625 m, model y approximately 141.3636 and 258.6364. `fields.ts` adds physical dashed segments to the existing pitch-line geometry/material, with no additional draw call, texture or animation.

During a 7v7 goal kick or goalkeeper possession, opponents move back beyond the relevant line into their own staggered formation, while the goalkeeper's teammates provide wide short outlets and midfield options. The AI waits for the retreat, then distributes. Opponents may advance immediately when the ball is released, including while it is still inside the penalty area. A human goalkeeper may choose a quick release. Retreating players temporarily bypass the existing personal-space repulsion, as committed loose-ball chasers already do; otherwise stationary buildup opponents can physically trap a retreating player and deadlock the restart. Positions still integrate at their ordinary bounded speeds. Normal spacing resumes on release.

The policy follows the [Connecticut State Referee Program build-out guidance](https://www.ctreferee.net/build-out-line-final-answer/), checked September 22, 2026. The change covers buildup retreat/markings, not the separate 7v7 offside rule. Centre kickoffs and all other formats retain their prior behavior.

`seven-build-out.cjs` verifies both directions, ordinary keeper control, overdue goal kicks, actual walking retreat and release without teleports, and format/kickoff isolation. `seven-build-out-fields.cjs` constructs the real fields and checks both dashed lines against shared coordinates; other pitches have no added dashes. Contact, field-lighting, kickoff and typecheck regressions pass. The 12-match seed suite still passes; updated 7v7 aggregate is 383 passes, 199 carries, 15 return passes, 29 defensive regains, 69 shots, 7.0 s longest no-event interval and 87.2% moving outfield samples. Other formats produce identical aggregates. Local only; no deployment or phone thermal claim.
