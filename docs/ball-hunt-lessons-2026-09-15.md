# Ball hunt: a football idea after every discovery

The collected ball finishes its existing world celebration before a lesson opens. Root integration uses the effect pool's actual settled state, not a wall-clock estimate. Multiple completed discoveries queue instead of overwriting each other. The lesson pauses the island using its existing paused-menu path.

Each of the 40 existing, different football tips now has a specific three-stage illustration. Labeled dots stand for teammates and opponents; a small patterned ball, gold space, solid passing arrows and dashed runs connect the abstract model to a football situation. Foot-placement examples use foot silhouettes. The community discovery connects supporters, youth teams and traditions around a club rather than pretending club history is a passing drill. The lofted-pass example explicitly uses a side view. Offside timing is identified as a simplification, not a complete rule lesson.

## Research applied

- The US Institute of Education Sciences' [Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/practiceguide/1) recommends pairing graphics with verbal explanations and connecting abstract and concrete representations. We apply this with a short football tip, nearby diagram labels, and captions that explain exactly what changes. The guide supports the instructional approach; it does not validate this app's specific diagrams.
- Richard Mayer's [Segmenting Principle](https://www.cambridge.org/core/books/abs/multimedia-learning/segmenting-principle/37240877DDA0362355ADB39936027982) describes learner-paced segments. Each diagram starts with a situation, then the player taps a football action to change it, and taps again to see the outcome. The final control replays the sequence. There is no time pressure or required quiz before dismissal.
- The [Cambridge Handbook of Multimedia Learning excerpt](https://assets.cambridge.org/052183/8738/excerpt/0521838738_excerpt.htm) cautions that animation/interactivity do not automatically improve learning over static diagrams. Movement is therefore limited to meaningful player/ball position changes and route disclosure, with explanatory text that remains readable after the movement finishes. Reduced-motion users get the same states without motion.

## Interaction and performance

- Every discovery uses the same 720 by 800 px maximum dialog, capped by the available viewport. The title and bottom **Got it** stay outside the scrolling content; changing steps never changes the outer dimensions.
- No top close icon or backdrop dismissal. Got it dismisses; the native modal traps focus and restores it on teardown. The final discovery also explains the original Matchday Fox reward and marks the celebration acknowledged.
- The component and 40 small lesson descriptions live behind the on-demand import. Only the active lesson mounts. There are no images, external requests, canvas, Three.js imports, WebGL contexts, animation libraries, independent RAF loops, or polling in this lesson feature.
- Entry opacity/translation and a small ball-settling motion run once. Player/ball movement uses finite CSS transforms on explicit interaction; new routes fade once. Nothing loops after settling. Hidden-page CSS animation pauses and reduced motion disables animation/transition. Listeners are removed on dismissal.
- Text and SVG stay accessible, with stage announcements and a graphic description. A single visible action button advances the model; this is a guided worked example rather than a simulation or scored test. Practice transfer should be checked with children before claiming learning gains.

Validation: `node tests/ball-hunt-lessons.cjs` checks coverage of all 40 discoveries, bounded frames, actual visual change at both steps, and specific support-behind/offside timing semantics. Root owns integration/browser/build checks. Local implementation; not deployed. Reduced rendering work is not a measured iPhone temperature result.

## Palm Street Futsal targets

The two former school parcels (`school` and `parcel-school`) move away from the expanded rooftop knockout building to the west/east ends of the south Palm Street Futsal frontage. Round football targets at x −1 and 23, y 6.7, z 46.95 flank the main sign at its height. Their ground collection points are x −1/23, y 0, z 49, outside the garage wall and clear of the east ramp. Existing IDs, teaching content and saved progress are preserved; clue names, detailed directions and the derived world hint marker use the new coordinates.

The optional `wall.round` shape reuses the existing sphere, torus, pentagon and label assets and packed material path. It adds no animation loop, assets or shadow casters. These locations no longer create ground parcel colliders. A circular hit area matches the target, with a small ball-radius allowance; collection retains the existing falling ball and settled-effect lesson handoff.

`tests/coin-solids.cjs` checks both actual held-shot trajectories from the south approach (z 59, charge 0.5), impact before the garage wall, rejection outside the round face, ground-level pickup and absence of a floor collider. Existing coin-progress tests pass, including persistence and all 40 IDs. Local, pending root browser/build validation; not deployed.

## Ten higher targets: 50 discoveries

Ten additional kick-only round targets teach football spacing. They reuse the existing wall-target rendering, collision checks, finite effects, lazy lesson dialog and discovery replay. No landing triggers, extra timers, particle pools or render loops were introduced. The ten new lesson records add depth, staggered support, compact defending, useful width, two-against-one spacing, shared channels, maintaining a triangle, the far-side option, pockets between lines and diagonal support. Six small diagram families cover concepts that would not fit the existing illustrations; existing diagrams remain unchanged.

| New target | Target center (x, y, z) | Ground pickup (x, z) |
| --- | --- | --- |
| Humanities | 111.8, 10.5, 22.9 | 111.8, 25.4 |
| Island High School | 135.8, 13.5, 22.9 | 135.8, 25.4 |
| Eastern Classrooms | 165.8, 10.5, 22.9 | 165.8, 25.4 |
| Park Visitor Centre | −1, 10.5, −126.6 | −1, −124.9 |
| Mercado | 16, 8.5, −126.6 | 16, −124.9 |
| Rua Nova | 30, 11.5, −126.6 | 30, −124.9 |
| Corner Deli | −64, 7.1, −47.6 | −64, −45.2 |
| Coast Apartments | −64, 7.5, 48.9 | −64, 51.3 |
| Club Grounds | 159, 7.1, −169.6 | 159, −167.2 |
| Promenade Café | −30, 9.3, 58.9 | −30, 61.3 |

Targets sit in front of the southern building faces. Campus pickup x positions fit between the colonnade piers; the northern pickups stay north of the road. Production browser validation confirms all ten targets are reachable through actual world collisions. The real ball simulation fixture confirms every target can be opened by a charged shot from 18 m south of the target, cannot be opened by a normal tap or landing, and releases a ground-level collectible.

The progress record now saves `version: 2` and `rewardUnlocked`. A legacy unversioned save containing **every original 40 ID** retains its previously earned Matchday Fox outfit. New sessions need all 50. The final 50-ball celebration is tracked separately from the grandfathered unlock, so existing completion never produces an incorrect “All 50” message at 40. The original IDs and collected/revealed lists are preserved, and unlock flags merge across tabs. Onboarding, quest summaries, counts and Store reward requirements derive the total from the catalog.

Validation: typecheck, `coin-quest.cjs`, `coin-solids.cjs` and `ball-hunt-lessons.cjs` passed. Migration coverage includes completed/partial legacy saves, new-save requirements, persistence, and the renewed finale; diagram checks include forward/backward support and press/cover switching. No deployment or physical-device thermal result is claimed.

Root validation: collection/effect/quest fixtures pass, including the actual completion callback and pause/resume handoff. Mobile Chromium production checks passed two truck collections, absence of a modal during the collection, equal 416 × 736 outer dimensions on a 440 × 760 viewport, interactive step changes/replay, Got it dismissal, and a visible footer at 375 × 560 with reduced motion. While the modal was settled, Town's rendered counter remained 312 across the measured interval (skipped frames advanced); illustrations do not wake the island. Screenshot: `/tmp/fi2-ball-lesson-mobile.png`. These browser checks establish layout and lifecycle behavior, not physical iPhone cooling. Final content refinement distinguishes the left-foot and right-foot practice stages.

Revisiting discoveries: found entries in Clues & discoveries expose **Watch tip again**, including the museum story. This conditionally loads the same lesson, resets it to step one, and preserves the underlying drawer/scroll position. Got it restores focus to the original button. Replay does not re-award or acknowledge the collection reward. The lesson's cancel event stops propagation so Escape cannot accidentally dismiss the parent drawer. Production mobile browser check passed collected-only availability, stage interaction, repeat reset, Escape behavior and focus return; no page errors.

Palm Street target relocation: preserved `school` and `parcel-school` IDs while replacing the two ground boxes by round kick targets flanking the south facade's sign at (-1,6.7,46.95) and (23,6.7,46.95). The parking P remains below the east target; collection points are on the walkway at z49,y0. Clues and hint metadata follow the new locations. Existing materials/packed geometry are reused. Final production build and browser high-shot→reveal→ground-pickup→lesson checks passed for both targets; snapshot `/tmp/fi2-futsal-targets.png`. Not deployed.

Final 50-ball validation: `/tmp/fi2-spacing-targets.cjs` passed charged shot → reveal → ground collection → lesson handoff for every `high-` target in the built island, with no page errors. Production build passes. Not deployed.
