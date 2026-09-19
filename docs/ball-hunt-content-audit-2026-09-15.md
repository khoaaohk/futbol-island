# Ball hunt content audit — September 15, 2026

Scope: all 50 `COIN_QUEST` teaching summaries, all 50 `BALL_HUNT_LESSONS` captions/actions, the three generated diagram frames for each entry, and the discovery Practice idea links. Content/implementation audit; no lesson changes or deployment in this audit.

## Result

The hunt does not yet provide 50 sufficiently distinct visual lessons. It has 29 diagram kinds but only **28 distinct three-frame sequences**: `scan` and `touch` generate the same frames. Twelve groups reuse an identical sequence across 34 tips; the remaining 16 sequences each serve one tip. Reuse of a visual language is useful, but identical situations/actions do not demonstrate several claimed differences.

There are **10 priority content replacements** below. Other related lessons can remain as deliberate progression only after their illustrations show the distinct cue or decision. Collectibles can be found in any order, so each tip must also make sense independently.

Practice routing is also coarse: 25 entries point to support, 19 to movement, and 6 to width. Museum is included in the support data count but its practice button is hidden. Thus the 49 visible practice buttons route to only three categories, not 49 exercises tailored to their tips. These are category IDs, not evidence that the destination contains only three total plays.

## Complete lesson disposition

“Replace” is an audit recommendation, not an implemented change. The ten newest targets remain about spacing.

| Ball ID | Current learning goal | Disposition / distinct goal |
|---|---|---|
| store | Scan before receiving | Keep: find pressure before the pass |
| coaches | Inside-foot accuracy | Keep: standing foot, contact surface, target |
| garden | Attacking width | Keep: stretch defenders sideways |
| market | Open a passing lane | Replace: the ball carrier dribbles sideways to open a new passing angle; distinguish from receiver movement |
| museum | Club/community identity | Keep: football culture |
| terrace | Balance for next touch | Keep; show balance/body orientation instead of the generic receiving diagram |
| roof | Team shape/triangles | Replace: identify defensive, midfield and attacking lines in a team shape |
| ferry | Pass weight | Keep; show short/long stopping points and controllable arrival |
| beach | Ground-pass contact | Keep; show low contact/rolling route, not the same pass-weight diagram |
| north | Time the receiving run | Keep; show early/on-time/late arrival relative to release |
| wall-right | Practise both feet | Keep: paired left/right attempts |
| garden-cafe | Pass then support | Keep; move to a new support angle without automatically receiving a return |
| market-north | Repeat scanning | Keep as progression; visibly move the defender between scans |
| school | First touch sets up next action | Keep: touch into a route for the next pass |
| northwest | Receive side-on | Keep; illustrate body opening and two visible options |
| pier | Switch play | Keep: direct switch to the far side |
| club | Lead a moving receiver | Keep; show the passer selecting ahead of the runner, unlike north's run timing |
| dock-entry | Support behind | Keep: safe return when forward routes close |
| west-market | Change pace | Keep; visual must show slow/fast timing, not just a cut |
| library | Change direction | Keep: change route to separate from marker |
| store-roof | Receive on far foot | Keep; show feet, pressure side and ball protection |
| arcade-roof | Give-and-go | Keep: returned pass beyond defender; distinct from general support |
| junior-roof | Passing triangle | Keep as the single introductory triangle lesson |
| books-roof | Receive between lines | Keep as introductory pocket lesson |
| museum-roof | Decoy run | Keep: marker follows, teammate uses released lane |
| grass-west | Check away then back | Keep: two-part movement tied to passer availability |
| grass-junior | Time an onside run | Keep; retain simplified-rule qualification |
| grass-garden | Third-player combination | Keep; A–C route blocked, B connects to moving C |
| grass-community | Escape cover shadow | Keep as the single receiver-side shadow lesson |
| ramp-gap | Meet ball rather than chase | Replace: anticipate a second ball/rebound and move to its landing space |
| wall-books | Choose pass height | Keep: blocked ground lane versus lofted route |
| wall-nova | First-time pass | Keep; show contact/no control touch and contrast with needing an extra touch |
| wall-garden | Touch away from pressure | Replace: cushion a firm pass by withdrawing the receiving foot; ball slows into control |
| wall-library | Show passer a target | Replace generic lane movement with clear near-foot/far-foot request and corresponding pass |
| wall-arts | Disguise pass | Keep: gaze differs from final accurate pass |
| wall-community | Curved run | Keep; show staying outside defender's shadow through the curved route |
| parcel-north | Useful support distance | Keep; compare too close, too far, useful distance rather than just spreading wide |
| parcel-west | Pass instead of carry | Keep; illustrate decision based on teammate's better position, not just another pass |
| parcel-school | Early communication | Keep; warning precedes receiver's decision |
| parcel-south | Watch an off-ball run | Replace: react after losing possession—nearest player delays, teammates recover |
| high-humanities | Forward/backward depth | Keep: stretch team vertically while retaining return option |
| high-school | Stagger support | Keep; visibly show a defender screening aligned options and choosing between staggered depths |
| high-classrooms | Compact defending | Keep; press and cover shift as ball moves |
| high-visitor | Hold width | Replace: stretch the last defensive line with one high player to create space underneath |
| high-mercado | Spacing in a 2v1 | Keep; animate defender commitment before release |
| high-nova | Separate channels | Keep: wide player plus inside support |
| high-deli | Rebuild triangle after pass | Keep as progression from junior-roof; two supports adjust around new carrier |
| high-apartments | Far-side switch option | Replace: use a supporting pivot to switch when the direct cross-field route is blocked |
| high-clubgrounds | Find a pocket | Replace: vacate an occupied pocket so a teammate can arrive into it; avoid both crowding same gap |
| high-promenade | Diagonal passing support | Replace: goal-side defensive spacing—stay between attacker and goal while seeing the ball |

## Exact visual reuse groups

These are byte-identical generated three-frame data, not a subjective text similarity score:

- Width: high-visitor, garden, parcel-north.
- Switch: high-apartments, pier.
- Between lines: high-clubgrounds, books-roof.
- Passing lane: high-promenade, market, grass-community, wall-library.
- Scan/touch: store, terrace, market-north, school, northwest, store-roof, wall-garden.
- Triangle: roof, junior-roof.
- Pass: ferry, beach, parcel-west.
- Lead: north, club, ramp-gap.
- Return: garden-cafe, arcade-roof.
- Direction/pace: west-market, library.
- Decoy: museum-roof, parcel-south.
- Third player/one touch: grass-garden, wall-nova.

## Priority visual mismatches

- market-north says the defender moved between scans; its defender remains fixed.
- store-roof teaches a specific receiving foot; its generic diagram has no feet.
- west-market teaches pace; its frames are identical to change-direction library.
- ferry teaches pass weight; the drawing offers no weight comparison.
- garden-cafe and arcade-roof show the same returned pass despite different objectives.
- wall-nova teaches one-touch redirection but reuses third-player frames without a contrasting control touch.

## Acceptance criteria for revision

1. Assign each tip a single observable goal: cue → choice → consequence. Similar vocabulary is fine; repeating the same choice with a new title is not.
2. Update summary, three captions, two action labels and diagram together. Changing the title alone does not resolve overlap.
3. Reuse SVG components and finite transitions, but demonstrate different routes, defender reactions, timing, contact or positioning when the learning goal differs.
4. Connect Practice idea to a relevant exercise/decision when available; do not imply a generic category is a custom drill.
5. Preserve collectible IDs, world positions, saved progress, fixed modal size, optional Got it dismissal and replay.
6. Keep lessons lazy-loaded and animations learner-triggered. No island-time loops or extra 3D assets are needed.

No external research was necessary to identify these concrete duplicates. New factual/rules content should be checked against appropriate primary sources when implemented.
