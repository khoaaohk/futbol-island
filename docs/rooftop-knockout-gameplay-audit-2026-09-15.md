# Rooftop knockout gameplay audit — September 15, 2026

Read-only gameplay audit requested as the third parallel agent. No game implementation or deployment in this task. The thermal agent is independently changing rendering; findings below describe the gameplay code inspected today, not a controlled comparison with yesterday's release.

The strongest next improvement is to make movement, aiming, and possession predictable. More effects are lower priority. Preserve the live rooftop game, six persistent balls, three-hit elimination, five-second protection, existing fall/daze/teleport sequences, corner queues, and return countdown.

## Evidence and scope

Inspected `lib/games/rooftopKnockout.ts`, `knockoutAnimation.ts`, `lib/graphics/liveKnockout.ts`, Town's input/update integration, rooftop movement, travel settings, cage and stair construction, and the performance guide. Ran `node tests/rooftop-knockout.cjs`: all existing checks passed, including autonomous completion, moving-ball collection, cage/cover rebounds, possession, and shields. This was not a physical-device playtest. Risks identified by code inspection are labeled separately from tested behavior.

Existing mechanics already worth retaining: swept ball substeps, exponential rolling resistance, finite shared ball/effect pools, auto-collection of passing or receding shots, exclusive possession, and protected recovery. Do not propose these as new features. Current timing is two-second normal recovery, elimination transfer at 2.7 seconds, half-second arrival, and five-second shield beginning at impact.

## Fix first: current inconsistencies

| Priority | Finding and code evidence | Proposed correction and acceptance check |
| --- | --- | --- |
| P0 | Cage controls inherit ordinary island instructions. Town's shoot button advertises holding for a higher/stronger kick; its hold handler computes power, but cage integration discards `shotPower`, and `kick()` always uses speed 19. Juggle remains displayed although the cage branch discards it. | Give this game its own action labels/state. Initially use a clear Kick button with no charge promise and remove the inactive Juggle action. Test touch, mouse and keyboard; no displayed action should do nothing or contradict its instruction. |
| P0 | Human and bots do not use the same movement/collision path. Live integration copies the Town position into the simulation and calls `game.update(...,{x:0,z:0})`; the pure simulator's human speed 6 is therefore not the live human speed. Town walk is 3.7, sprint 6, bots 4.3, with different acceleration/radii. | Define an explicit cage movement profile and use it for both input paths. Preserve thumb analog control. Verify full-stick touch versus keyboard travel time, turn and stop distance against the intended bot challenge. Pure simulation movement tests alone do not verify live control parity. |
| P0 | Human collision with queue pens appears absent: their rail meshes are only .08 thick, and automatic roof obstacle extraction skips width or depth below .5. They are not explicitly in `arenaRails`. Bots/balls, however, block the complete queue rectangles via `ARENA_QUEUES`. | Reproduce entering each pen while alive in-browser, then add shared explicit arena collision definitions if confirmed. Test human/bot/ball agreement at every pen and cover edge, while preserving queue teleports and stair gate access. This is a code-inspection defect candidate, not a browser-confirmed fix. |
| P1 | Pickup is processed in player array order. Each `collect()` selects its own closest ball and assigns it immediately; it does not arbitrate the closest player. A lower-ID player within 1.45 can claim ahead of a nearer later-ID player. | Gather candidates per ball, choose nearest eligible player, then resolve ties deterministically without always favoring player 0. Retain one ball per player and incoming-hit priority. Test mirrored contested pickups with reordered IDs. |
| P1 | Bots deliberately seek only `heldBy<0 && life<=0` balls. Moving misses can be collected opportunistically but are ignored as navigation goals. | Reuse the same safe-to-trap predicate for bot goals and predict a short intercept point. Bots should visibly chase a safe rolling rebound without waiting for it to stop; dangerous incoming shots should still trigger avoidance. |
| P1 | Kick uses the rendered character yaw, which may lag desired movement facing. There is no dedicated cage aim cue. Holding the existing button does not solve this. | Store intended aim independently from visual turning. Show a short ground arrow while carrying; release direction and displayed arrow must agree. Test quick 90-degree changes, standing shots, simultaneous joystick/kick, and release after interrupted touches. |

## Make opponents feel like players

Current AI picks the nearest living target, orbits according to a sine wave, and nudges only positive X/Z when blocked. It checks line of sight before firing but has no route around cover and no explicit separation from other players. The nearest target may be shielded: shooting is suppressed, but the bot does not choose a different exposed target. These are limitations of the current rules, not evidence that every round gets stuck; the existing autonomous-round test passes.

Recommended small state machine: **find a ball → approach/intercept → make space → aim → kick → recover**. Add separate evade and hit-recovery states. Use a small precomputed waypoint graph around the five covers and four pens, plus short-range steering; a full general-purpose navigation engine is unnecessary for this fixed rooftop. Replan only when a goal changes or progress stalls, and stagger bot decisions around 5–10 Hz while keeping movement smooth on the existing simulation clock.

Give bots a visible, brief kick preparation (trial 150–250 ms), a finite turn rate, and a modest aiming error on the introductory setting. They currently turn instantly toward a target before firing. Choose an unshielded visible target when possible; otherwise reposition or retrieve. Add gentle separation so several bodies do not occupy one spot. Detect lack of progress over roughly one second and select another waypoint instead of pushing a corner indefinitely.

Tests: every start location can reach each ball region; no bot remains pushing one wall for over two seconds; changing the target to shielded does not freeze useful decisions; repeat seeded rounds with an inactive human, an evasive human, and two final opponents. Record time spent without a ball, failed shots into cover, and stationary time before changing difficulty.

## Controls and football movement

Start with one-stick movement and one Kick button. Add modest optional aim assistance within a narrow forward cone, constrained by cover and shield state. Show the selected direction before firing; do not silently rotate a shot toward someone behind the player. A trial 10–15 degree cone is a tuning proposal, not a validated value. Let advanced players disable assistance. An optional drag-to-aim gesture on Kick can come later, with tap-to-kick still available; avoid making a second precision stick mandatory on phones.

Use snappy acceleration and deceleration without instant direction reversal. Animate planted-foot turning and a short shooting step, but let gameplay input respond immediately rather than wait for a decorative windup. Keep the requested longer knockdown; the five-second shield already leaves about three seconds of protected movement after the two-second recovery. Clearly display that remaining protection so the player knows when to find space.

For a meaningful second action, consider a controlled **First touch** after the basic controls are proven: direct a collected ball slightly into open space before carrying it. This can teach receiving away from pressure. A generic invulnerable dodge would be less closely connected to football and would add another protection rule to learn.

Microsoft's game accessibility guidance supports difficulty assists such as auto-aim and separate difficulty options. It supports offering an assist, not any specific cone or tuning proposed here. [Xbox Accessibility Guideline 108](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/108).

## Ball physics and fair possession

1. **Keep the current lightweight planar physics initially.** Balls already bounce and persist. A rigid-body library, complex spin physics, cloth net simulation, or extra per-ball lights would increase cost without first solving input and fairness.
2. **Use one explicit simulation cadence.** Town moves the human in fixed 1/60 steps, but the cage sim receives one render-frame delta, clamped to .05. Long frames therefore advance the two paths differently. Integrate cage physics into the same bounded fixed-step schedule and interpolate visuals; avoid unbounded catch-up. Validate trajectories, hit counts and five-second protection at 30/60 rendering FPS and with injected hitches. Fixed-step separation and bounded catch-up are established techniques, explained by the original author in [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/). This is a consistency proposal, not proof that raising simulation frequency would cool the phone.
3. **Define dangerous versus collectible explicitly.** `life` is now effectively a rolling flag, not a countdown, and `owner` also excludes the shooter from every hit until the shot stops or is collected. Decide whether self-rebounds remain harmless; that is a design choice, not automatically a bug. Show danger through trail shape/brightness and collectible state through a small ground marker, with no color-only distinction.
4. **Clarify shield contacts.** A protected player with empty hands can collect an incoming shot; with a ball already held, a shot contacting the shield stops dead. Consider one consistent shield deflection rule plus a deliberate trap rule. Test that protection never consumes a ball or grants an unexplained second possession.
5. **Improve attachment visually without changing ownership.** The ball now stays at a rigid .75 offset, falling back to the body center if blocked. Add a bounded foot-touch offset and choose a clear side near cover; never embed it in the player's body or let it pass through a wall. Use the same shared six balls.
6. **Use exact segment/rectangle intersection for sight checks if needed.** Current lanes sample every .4 and do not test every endpoint; align aim previews, bot visibility, and ball colliders using shared geometric definitions. Add grazing-face and corner tests before changing rebound coefficients further.

## Round pacing and feedback

Joining and leaving currently recreate the entire round. A player can also change travel mode to leave the on-foot test. That may be acceptable for joining an ambient demonstration, but repeatedly leaving/re-entering can reset progress. Define the rule explicitly: initial join may start a fair new round; subsequent re-entry should preserve the current match or wait for its next countdown. Reset input holds during knockout, transfer, departure and new round so a held button cannot surprise-fire on return.

There is no round time limit or sudden-death implementation despite a comment describing bounded rounds. The existing autonomous completion test covers one deterministic setup. First measure 100 seeded scenarios, then trial a gentle 90-second warning and 120-second end decision if long queues are common. Preserve the three-hit rule; a timer tiebreak or clearly announced result is easier to explain than silently changing damage. These durations are proposed starting points. Let eliminated players leave the spectator queue without waiting for the round, and optionally show a short prediction such as “Which open lane can the last two players use?”

Above players, use three small hit pips and a readable protection countdown or ring. Add brief, distinct feedback for collecting, shooting, shield contact, damaging hit and elimination. Show the winner's name/character before return, and a compact result for the player: controlled touches, successful hits, rebound hits and one learning takeaway. Do not add persistent flashing or camera shake; reuse pooled effects and existing audio ownership. Keep the camera stable enough to see incoming balls rather than follow every bounce.

## Football learning and return motivation

Present this as a playful **ball-control and awareness challenge**. Hitting opponents is an arcade rule, not what football teaches players to do in a real match. The transferable skills are scanning before receiving, controlling a moving ball, creating a shooting lane, using a wall for a rebound, and moving away from pressure.

Connect progress to three optional quest stamps: **Find space** (receive then move into a clear lane), **First touch** (collect a moving missed ball), and **Read the rebound** (make an intentional bank shot). Start with a short visual demonstration at the cage edge and one contextual cue at a time. A bank-shot line should illustrate the contact and outgoing angle; a first-touch cue should show a small open-space wedge. Avoid another compulsory modal tour.

Reward mastery of those skills with existing cosmetic/store progress, never a faster ball, extra shield duration, or stronger damage from a purchased/equipped costume. Keep rewards accessible to assisted play. Track learning actions with meaningful geometric checks and cooldowns, not only match wins or repeated knockouts. No reward hook was found in the inspected cage integration; add an explicit completion event instead of polling all quest data every frame.

## Suggested implementation order and validation

1. Fix action labels, aim direction, live movement parity, queue collision parity and contested pickup.
2. Improve bot ball interception, routes around cover, targeting and visible preparation.
3. Unify simulation timing; add possession/danger feedback and clarify shield/self-rebound rules.
4. Measure round duration, then add concise results and football skill quests.

Preserve render quality and existing thermal optimizations. Prefer shared geometry, fixed-size effect pools, event-driven HUD updates, cached navigation and staggered AI thinking. Avoid adding particles as a substitute for readable controls. Compare the same five-minute physical iPhone route including spectating, playing and leaving the roof; record frame-time tails, battery/temperature conditions and perceived control latency. A successful desktop test cannot establish comfortable phone temperature.

This document contains suggestions only. No game code changed, no new tuning values accepted as final, and nothing deployed by this audit.
