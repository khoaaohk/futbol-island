# Breakaway: Bean Buddies integration audit — September 26

The runner now uses Claude's Bean Buddies character skin and existing island joint solver. This pass preserves that implementation and audits the arcade adapter against it.

## Confirmed integration defects and corrections

- Defender role colours previously changed hidden `MeshStandardMaterial` jerseys. The visible bean shader never received those colours, so purple jockey / coral tackler / blue sweeper instructions did not match what a player saw. Runner now caches three deterministic `BeanDress` outfits and applies them only when a pooled defender changes role. The visible body tint and kit both identify the role; regular, wide and tall builds differentiate their silhouettes. Goal blockers also receive a deliberate defender outfit.
- Legacy custom tackle edits replaced hip/knee/ankle angles and rotated the whole body after the island solver's ground guard. That bypassed Claude's updated slide foot placement and could push the bean's body or boots through the court. Removed those overrides and nonuniform whole-rig scaling; the actual island slide controls lead boot extension, folded trailing leg, body layback and ground clearance. The intentional 0.7 m forward tackle advance remains.
- Gate blockers now stand in an actual ready stance with zero locomotion. A saved shot triggers the authored planted `blockTackle` at contact and recovers over the existing reaction duration, replacing walking in place and a generic shot animation.
- Jockeys now use the authored `pokeTackle` move and sweepers use `blockTackle`, replacing their previous generic shooting motion. Each cached skill object reaches extension with the simulation’s active tackle window and recovers over its existing recovery window. The simulation remains authoritative for root travel, ball interactions and collision reach.
- Runner jump and landing feed the island solver’s authored jump progress while physics retains root height. Dribble contact sampling stops while airborne or sliding, so the ball does not follow a stale planted-foot contact.
- Mobile charge capture exposed the ball hidden directly behind the bean from the trailing camera. The loaded ball now settles 0.3 m toward the striking boot; the real projectile starts at that same offset and the rig receives matching local contact coordinates. This does not recenter the projectile cosmetically or change lane target widths.
- Removed the old hidden-skeleton kit stripe and three now-unnecessary classic material allocations/disposals. Outfit data is cached at setup; role changes do not allocate geometry, add loops or alter sleep/frame policy.

## Verification

Simulation regression passes: shot collection/cooldown, swept challenge and goal collisions, charged penetration, defender tell/reach, jump and slide escapes, finished sleep, ten-minute bounded pools.

Browser fixture now checks the visible bean body, three distinct actual shader shirt rows, and world-space tackling boot extension/ground clearance instead of asserting an arbitrary post-solver hip angle. Desktop and 390×844 mobile fixtures pass: actual touch swipe/lane press, jump/slide, charge/cancel/blast, challenge clear, precision goal, exploding goal reset, pause/finished sleep, restart and exit. The low tackling boot reaches 1.48 m forward; ankle heights remain 0.116–0.148 m above the court. All three shader shirt rows differ. Captures show the wide coral sliding body, upright purple jockey and tall blue sweeper; the runner slide is visibly low with arms balancing. The final mobile fixture also passes the boot-side loaded-ball origin assertion and standing gate block regression. Final charge/strike screenshots visibly show the ball beside the boot, then traveling down that same line. Ordinary-input outcomes are recorded below.

Emulated mobile correctness is not a physical-device thermal test or a subjective claim of improved fun.

## Reviewed captures

- `/tmp/fi-breakaway-mobile-defender-roles.png` — three visible kits/builds and readable coral threat cue.
- `/tmp/fi-breakaway-mobile-low-tackle.png` — low body and long leading boot, no ground penetration.
- `/tmp/fi-breakaway-mobile-slide.png` and `-jump.png` — actual solver actions via touch controls.
- `/tmp/fi-breakaway-mobile-charged.png` and `-strike.png` — visible boot-side loaded ball and released blast.
- `/tmp/fi-breakaway-mobile-gate-block.png` — planted coral blockers and open gold lane.

These are deliberately staged action fixtures. They prove trigger/pose/contact correctness, not ordinary-play difficulty.

## Ordinary-input play

Mobile (390×844, actual swipe/tap events, no simulation writes): PASS. 600.37 m, 11 lane changes, 3 precision goals, score 12,950, all 3 lives; 114 samples of committed defenders and maximum 0.80 m lateral defender travel. The route-following driver deliberately avoids hazards, so its survival is not evidence that a new human player finds the game easy. Reviewed the ordinary goal/explosion capture at `/tmp/breakaway-play-mobile-60.png`.

The expanded move catalogue was reviewed: `pokeTackle` and `blockTackle` fit the existing defensive actions. Dribbling tricks such as croqueta/inside-cut also author ball and root paths; adding their pose alone to fixed lane changes would break contact, so this pass keeps the authored gait and truthful ball contacts instead of adding cosmetic tricks.

Desktop ordinary controls: PASS. 595.71 m, 11 lane changes, 3 precision goals, score 7,800, 2 lives at the end of the route; 104 committed defender samples and 0.80 m maximum travel. The run then stopped responding, naturally lost the remaining lives, and retried using the real Play again button. The restarted run had 3 lives, 0 score and distance below 10 m. No browser runtime errors.

Final checks: TypeScript passes; runner simulation suite passes including boot-origin and all-three-lane precision goals. Desktop/mobile browser fixtures pass; final mobile fixture additionally checks the visible loaded-ball origin and stationary gate block. Production build and other game checks are coordinated by the root agent. No deployment performed.

## Defender returns and lateral pressure

Defenders now keep shuffling within their own lane until the last 12 metres, then commit their aim so a late lane cut remains effective. Jockeys/sweepers shift further and faster; tacklers have a smaller lateral pattern. Native jockey footwork follows actual lateral velocity, with no artificial forward walking.

A centred normal shot intercepted 12–38 metres ahead is trapped at the defender's boot. The defender plants for a 0.3-second wind-up, then uses a controlled kick to return that same pooled ball toward the runner's position at interception. The ball never homes after release. Jumping or changing lanes avoids it; a hit costs one chance with the existing invulnerability period. Edge contacts and power blasts beat the block. Knocked-out defenders cannot release a held ball. Existing four-shot pool is reused; no new renderer, effect loop or mesh.

Tests cover returned-shot hits, lateral evasion, timed jump, power counter, fixed aim, bounded side-to-side shifts and old mechanics at 30/60/120 Hz. Desktop and touch fixtures pass with actual Shoot and lane controls; contact/release captures reviewed. Ordinary-input return checks are recorded separately below.

Ordinary-input return play passes on desktop and mobile: the driver reads encounters but never changes game state, shoots through real controls, provokes a block/return and changes lanes. Both runs survived with three chances remaining. The mobile return happened in the first ~48 m; desktop encountered edge clears and power counters before a centred return around 234 m. This confirms returns happen naturally, not on every shot. Dedicated setup fixtures remain separate from these runs.
