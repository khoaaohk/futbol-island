# Futbol Pinball — September 25, 2026

Local work only; not deployed.

Resumed the existing arcade rewrite and preserved the physical table, corner-placement scoring, alternating-flipper combinations, progressive defenders and pooled trail. The desktop and phone layouts were visually reviewed at 1280×800 and 390×844.

## Completed in this continuation

The shared arcade controller now lets keyboard users hold Enter or Space on a focused Pinball control. Flippers stay raised until release; Launch charges while held and fires on release. Moving focus away cancels the keyboard hold. Pointer capture, simultaneous fingers and touch cancellation retain their existing behavior. This fixes controls that previously responded only to pointer events when focused through Tab.

The Pinball browser check now covers an idle table sleeping, keyboard activation of a focused flipper, real simultaneous touch inputs with independent release and cancellation, tap launch, a charged soft launch from the focused Launch button, alternating-foot scoring, pause/resume and disposal on exit. It waits for the HUD before screenshots so the captured score and coaching text reflect the simulated combination.

## Validation

- `node scripts/check-soccer-pinball.mjs`: passed rails, defenders, keeper, scoring, both flippers, restart, frame-rate independence, twenty deterministic stress runs, placement bonus, keeper acceleration, collision scratch reuse and combination rewards.
- `node scripts/check-soccer-pinball-browser.cjs --mobile`: passed at 390×844; zero page errors; both touch flippers held, one independently released, remaining touch canceled; idle/paused frame counters unchanged. Tap power 0.68, charged soft launch about 0.18. Screenshot `/tmp/fi-pinball-mobile.png`.
- `node scripts/check-soccer-pinball-browser.cjs`: passed at 1280×800 after the accessibility change; zero page errors; idle/pause sleep, focused keyboard flipper, tap/soft launch, combination HUD, resume and exit cleanup passed. Screenshot `/tmp/fi-pinball-desktop.png`.

## Runtime and performance

No additional animation loop, polling, rendering effects or physics work was added. Keyboard handlers only run in response to input. Existing ready/pause sleep and renderer disposal were verified. The three-defender snapshot reports 155 render calls on phone emulation and 210 on desktop; these are observed counts, not a comparative optimization or a physical iPhone temperature measurement. Integration build is coordinated by the main agent.


## Gameplay and craft pass using the game-developer skill

Thesis: read the rebound, time the flipper contact, switch feet and place the finish beyond the keeper.

### Critique and implementation

The old presentation understated an already capable physics simulation. The ball and table were small on phones, goal pockets looked like thin pitch markings, and a velocity-extrapolated trail could point through a rail after a rebound. Alternating flippers earned an isolated number without changing the next decision.

- Shared camera/UI work now devotes more vertical room to the playing surface; phone action was reviewed at 390×844.
- Cream collision rails separate the table boundary from the turf. A coral drain mouth makes failure readable. Thick goal-pocket bands turn gold when a chance opens, and quiet field arrows direct attention from flippers toward the shot lanes.
- The plunger lane displays a seven-segment physical power ladder; no extra HUD meter.
- Three inset lamps correspond to build, switch, finish. A real strike lights the build step. Striking with the other flipper within the existing six-second combination window lights the goal for fourteen seconds. Scoring in that window earns +750 initially, rising by 250 per completed move to a capped +1500. Normal goals remain 500 and corners retain their +150 placement reward. The reward is consumed on scoring and lost on expiry/drain; completed moves appear alongside goals and balls.
- The ball trail stores actual positions in a fixed Float32Array, with at most six desktop or three mobile dots (roughly 100 ms), and resets between balls. It no longer invents a straight path through collision geometry. Reduced motion disables it.
- Existing 480 Hz contact physics, keeper limits and flipper timing were preserved. A controlled contact audit confirmed different pivot/tip contacts already produce distinct speed and direction; changing these without evidence would weaken the established skill.

### Evidence categories

Engine correctness: the existing simulation suite passes, plus finishing-window activation, expiry, one-time conversion, corner bonus composition and mastery reward cases. Desktop and phone browser fixtures pass controls, two-finger release/cancel, ready/pause sleep, launch charge, objective HUD, resume and disposal.

Player experience: `scripts/play-soccer-pinball-browser.cjs` drives ordinary keyboard or CDP touch inputs. It only reads ball state to choose a flipper; it never mutates physics. A forty-second run produced 18 strikes, one goal and one completed move on desktop; phone touch produced 14 strikes, one goal, one completed move and one lost ball. These are automated input observations, not a claim that human players find the game polished. Screenshots were captured during play at `/tmp/fi-pinball-play-desktop.png` and `/tmp/fi-pinball-play-mobile.png`.

A second complete-session run also observed natural failure and retry: after forty seconds of active play, the driver released all flippers and let every remaining ball drain, reached game over, pressed Play again and launched successfully. Desktop recorded 13 strikes / 1 goal / 1 completed move; touch recorded 16 strikes / 2 goals / 2 completed moves. Both completed a retry with zero page errors.

Performance: the pass adds ten static lamp/gauge meshes and five static lane/drain bars plus three lamp housings; geometry is created once. The trail keeps its single instanced draw and fixed storage. No new loop, background work or simulation allocation was added. These costs and phone emulation do not establish physical iPhone temperature behavior. Local only; not deployed.


## Motion and contact pass

The motion review found several disconnected reactions: ball scale depended on speed but not the surface it struck; the goalkeeper used a generic kick for a save; defenders walked at a constant speed; and goals stopped the ball with no net response.

The existing physical trajectories remain intact. Collision resolution now records a normal and a short impulse-sized contact pulse. Rendering aligns a small squash with that normal, then recovers to velocity-aligned flight. The football markings roll independently inside the oriented shell. Flippers have a brief bounded spring recoil.

Keeper motion uses actual lateral velocity, incoming-shot anticipation and an isolated 0.4-second save recovery, rather than replaying a kick whenever another object is hit. Defender stride now follows measured patrol movement; near-ball anticipation and contact recovery feed the shared player motion system. Contact cooldowns recover during goal/loss beats rather than freezing mid-pose. A scored ball settles against the net, which gives locally at the impact position and relaxes. The goalkeeper stops striding once its physical motion stops.

No rules or contact impulses were retuned. The pass adds no render draw calls or animation loops. It adds one transform group for ball rolling, fixed actor-motion storage, three contact scalars, and bounded updates to the existing net vertex buffer only during a goal and the final reset. Reduced motion suppresses squash, flipper recoil, net deformation and goal bounce. Existing 30 fps phone budget and settled-state sleeping remain intact.

Tests: simulation verifies impact direction, pulse expiry and recovery through goal pause alongside the existing physics/progression suite. Browser fixtures capture three goal frames and two anticipation/save frames per viewport; net depth changes then recovers, ball settling remains finite, keeper makes the save, and existing keyboard/touch/charge/pause/cleanup checks remain included. Screenshots use `/tmp/fi-pinball-goal-{mobile,desktop}-{0,1,2}.png` and `/tmp/fi-pinball-save-{mobile,desktop}-{0,1}.png`. Ordinary-input results after integration are recorded below. These checks do not establish physical phone heat or human-rated game feel. Local only; no deployment.

Integrated ordinary-input sessions passed: desktop keyboard recorded 16 strikes / 3 goals / 1 completed move; phone touch recorded 13 strikes / 1 goal. Both then released the flippers, naturally reached game over, retried and launched successfully. Zero page errors. Desktop/mobile motion fixture checks also passed after the shared rig landed; keeper body pitch changed from ~0.02 rad anticipation to ~0.11–0.14 rad save recovery, while the net flexed from -1.10 to approximately -1.38/-1.47 then relaxed toward -1.20/-1.29. These observed motion samples are not human play ratings.

## Reactive defense and table response follow-up

Replaced purely visual defensive anticipation with bounded ball-lane tracking (100ms decisions, limited acceleration/offset) and committed380ms foot blocks with800ms recovery. Collision capsules extend along the same committed block direction. Rendering now reads the actual simulation defender positions rather than overwriting them with a fresh patrol sample. Defenders turn into travel between blocks; gait effort matches their small-scale walking speed instead of nearly idle legs under moving bodies.

Keeper reads every120ms, pushes into a close-shot dive, commits direction, extends the save capsule on that side and recovers before another dive. The rendered body rolls and lifts with reaching arms and bent knees. Corner pockets remain reachable. Rail/flipper/defender/save events produce a bounded, exponentially damped table displacement (maximum2.5px lateral,1.6px vertical,.12deg); reduced-motion disables this vibration. No hardware vibration is assumed.

Simulation suite passes ball physics/stress plus new approach/block/recovery and committed dive cases. Mobile browser fixture verifies off-upright dive/lift, impact transform, multi-touch and canceled holds, save/goal motion and sleep/retry. Ordinary mobile play:4launches,12flipper strikes,1goal,2losses and natural game-over/retry; zero browser errors. These demonstrate actual input paths, not human judgments of fun. Changes local, not deployed.

## Missed foot block: dazed defender

Outfield defenders now have separate boot and torso contact shapes. An extended boot reflects the ball and keeps its player active; a torso hit produces a2second knockdown, removes the defender from collision/blocking during recovery, and displays three gold stars. The fallen position is held before blending back into patrol during the final400ms. The goalkeeper is explicitly exempt: its save/dive code is unchanged. The HUD explains the opened lane or successful foot block.

Nine pooled star meshes share one geometry/material, created once. Stars orbit only during daze; reduced motion retains static star markers. Recovery continues between balls and then returns to normal ready-state sleep. Simulation regressions cover foot versus torso contact, no repeated collision against a downed player, recovery and keeper exemption.

Mobile browser verification passed the actual knocked-down body angle, exactly three visible stars, recovered-state disappearance, keeper exclusion, and existing pause/restart/save/goal checks. Reviewed `/tmp/fi-pinball-dazed-mobile.png`; corrected knockback away from contact and stars over the fallen head. Production build passes. No deployment.
