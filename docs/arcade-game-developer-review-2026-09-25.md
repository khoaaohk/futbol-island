# Arcade gameplay review and upgrade

User brief: all four games feel amateur and basic; improve them substantially and add a game-development skill to assess them. Installed and validated the reusable skill at `/Users/khoado/.codex/skills/game-developer/SKILL.md`. Four agents worked on the four games, with shared camera and control work integrated centrally.

## Diagnosis

Passing functional tests was insufficient. The courts occupied too little of the phone screen, the small actors obscured contact, and the score feedback often did not reveal what the player had done well. Tennis automated shot placement instead of making it a decision. Pinball had useful contact physics but weak target readability. Breakaway offered disconnected random objects. Strikers squeezed a horizontal stadium into portrait and relied on immediate pressure and long loose-ball chases.

Art direction: sunlit island football grounds, cream painted rules and boundaries, teal playing surfaces, gold opportunities and coral warnings. The signature is a readable football exercise inside a small island court. The main rejected default was an oversized toy environment with an undersized game in its centre. No asset-generation service, engine replacement or new graphics dependency was needed.

## Implemented

- [Tennis](arcade-tennis-2026-09-25.md): deliberate placement, reliable planted contacts, tactical rival returns, larger ball, landing countdown and clear court/aim/contact markings.
- [Pinball](arcade-pinball-2026-09-25.md): build with one flipper, switch feet, then convert a timed scoring chance. Physical table lamps, visible goal pockets, legible plunger power and a sampled ball trail explain the technique.
- [Breakaway](arcade-breakaway-2026-09-25.md): authored defensive lines with a marked clear route, progressive pace, timed finishing and clean-action multipliers. Gold goal aperture, coral defenders and discrete lane buttons clarify the decisions.
- **Island Strikers:** mobile play now requests landscape for a readable wide pitch; rotating upright pauses and releases input. Local keyboard and joystick controls follow the camera. Larger player silhouettes and ball replace the distant stadium view. The actual preferred receiver is marked, with a matching passing lane. Teammates provide width, forward support and a run after passing. Defensive players cover lanes instead of all following a fixed trailing point. Shots show their true goal-directed aim.

Strikers also now has 260 ms AI tackle warnings, a short 320 ms receipt grace, recoverable ground-ball friction and goalkeeper decisions sampled at 240 ms rather than perfect continuous prediction. Opponent running speed is 7.2 m/s versus the selected player's 8 m/s (12 m/s sprint), leaving room to use space. Off-ball players hold separate lanes during loose-ball recovery instead of recursively marking each other into a crowd. Completing a pass and attempting a shot are recorded in the end summary. Two code-review defects were fixed: switching could return to the original player, and a pending tackle could fire after its owner gained possession. Flat pitch strips remove the dark seams from thin rounded turf boxes, and shot trails retain their intended small scale.

The shared camera fits court bounds between the HUD and touch controls at resize time. Compact scoreboards and smaller teaching cues expose more of the field. Breakaway uses left/right lane buttons; Tennis retains analog movement. The gameplay rules and controls are explained in the opening cards.

## Evidence

Deterministic simulation checks establish collisions, scoring, input semantics, role behavior and bounded pools. Browser fixture suites separately establish visible camera bounds, touch controls, pause/sleep, restart and cleanup.

Ordinary-input playtests read game state to choose actions but never inject ball positions, scores or time:

- Tennis: desktop completed a match with a 24-touch best rally and 35 clean returns. Touch reached a 33-touch rally and 15 clean returns, then deliberately missed returns to verify losing, match end and retry.
- Pinball: full keyboard and touch sessions converted build-switch-finish chances, then let remaining balls drain and retried. The final touch run scored two goals and completed two moves.
- Breakaway: the full touch run covered 662 metres with twelve lane changes and three precision finishes, then stopped reacting to verify natural failure and retry.
- Strikers: 36-second keyboard and touch sessions both completed a pass and created a shot through dribbling, sprinting and charging. Initial attempts with a naive straight-line driver created no shots; investigation exposed excessive loose-ball travel and led to clearer defensive commitment. The final 55-second touch run completed a pass, attempted two shots and scored a goal (1–0). It moves around nearby defenders and uses quick shots under pressure instead of holding every charge. This demonstrates ordinary goal reachability, not a human win-rate or difficulty assessment.

These are automated interaction observations, not human judgments of fun. The geometry remains intentionally simple; this pass improves composition, decision-making and feedback rather than claiming finished commercial game art. Physical iPhone heat, native Safari gesture behavior remain unverified; second-device pairing was removed as requested. All changes are local; no deployment performed.

Final integration: `npm run build`, `npm run typecheck`, `npm test`, all four simulation suites and `git diff --check` pass. Desktop/mobile browser checks and the ordinary-input results above were reviewed separately. The installed skill passes the skill-creator validator.

## Runtime costs

Camera fitting runs on initialization/resize only. Strikers adds a fixed receiver ring, passing line, ball shadow and eight warning rings; poses remain in its existing loop. Its joystick feedback now writes a CSS transform instead of React state per pointer move. Ground-ball integration stays bounded at up to 120 Hz; prediction and receiver searches consider only eight players. Other game costs and pool bounds are recorded in their linked notes. No additional continuous render loop, polling, unbounded effect or background service was added. Paused/hidden/finished states retain their sleeping behavior.


## Mobile and motion follow-up

All four games expose local touch controls with touch-specific help. Strikers requires landscape on coarse-pointer devices, with an animated rotation prompt; returning to portrait pauses rather than continuing unseen. Removed phone pairing and the top header background. Tennis, Pinball and Breakaway retain portrait-friendly play. Actions respond on pointer-down, held controls cancel safely, and the joystick recenters on cancellation. Safe-area margins keep controls clear of screen edges.

Shared articulation now uses two-segment leg solving, reach-aware pelvis height, stance/swing foot phases, ankle toe-off, opposing arms, acceleration lean, charge anticipation and smooth recovery. Per-game motion adds Tennis receiving stance and strike-facing recovery, Pinball directional contact compression and net response, Runner continuous lane cuts and single-contact landings, and Strikers charge weight shift, committed follow-through, tackle/recovery, celebrations, dribble cadence and damped goal nets. Decorative motion respects reduced-motion settings. Existing render loops retain 30fps mobile caps and pause/hidden sleep; fixed frame slots remove avoidable pacing drift.

Regression evidence includes foot clearance and recovery at 30/60/120Hz; actual mobile touch and canceled input; landscape prompt, rotation pause, resume, charged shot, goal, full-time and retry. Other game reports distinguish ordinary play from injected visual fixtures. AAA craft is the audit target, not a claim of AAA asset fidelity or human playtest approval. Real-device thermal and Safari checks remain outstanding.

Latest ordinary landscape touch run:55.0match seconds,1completed pass,1shot,0–1score,zero browser errors. This verifies usable inputs and shot creation, not a winning strategy or subjective fun.

## Shared island character migration

All arcade `stage.player` actors now use the actual island `createPlayer` rig through `islandArcadePlayer.ts`: continuous gait/foot contacts, torso and arm counterrotation, shot load/contact/recovery and authored slide/stumble reactions. This includes Tennis players, Pinball defenders/keeper, Strikers squads, and Breakaway hero/defenders/gatekeepers. Team colors remain distinct; Breakaway loads the same validated saved customization as the island.

The adapter maintains continuous virtual travel for treadmill play, then places the rig at the visible arcade location. Natural shot progress begins at the island strike contact when the existing simulation releases its ball, while hold-to-charge uses the island's loaded pose. Release caches charged power through the follow-through. Breakaway's former short-leg custom IK is removed; its dribble ball uses the island contact lane. Existing keeper dives, defender blocks, dazed stars and goal feedback are layered on the real rig. Reset clears virtual/action state while preserving actor placement.

Rig-owned disposal runs before generic scene disposal so shared spine surfaces retain their reference counts and the main island character remains valid. Mobile caps, sleeping loops, existing action timings and collision rules stay in place. The realistic silhouettes are slimmer than the former block figures; increased rig detail adds visible render work, not a performance optimization. Actual-phone thermal behavior remains unmeasured.

Migration gates: all four simulation suites pass; Tennis, Pinball and Strikers mobile browser checks pass, as do Breakaway desktop/mobile actual-joint checks and its ordinary touch run (three goals over647.70m). Pinball save capture now waits for the save event rather than assuming180ms of wall time equals simulation time. After visual review, Tennis actors use1.25scale, Pinball .9/.95 and Strikers1.8 to compensate for slimmer island silhouettes; Runner keeps1.15, close to the island's1.12. Pinball dazed stars follow the real head joint. No deployment.
