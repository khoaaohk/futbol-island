# Kick reactions audit (Nov 13 2026)

Owner: "Audit the island and add animations for when kicking objects. For example, lamps and street lights need to react if the
ball is kicked against them. Find other objects that need this interaction." And: "when kicking the gashapon machine, it should shake."

How it works: `lib/graphics/propReactions.ts` (one table of styles, one updater). A shot (or wall-juggle) that the walking ball's
`blocked` / goal-frame hook stops calls `propReactions.hit`; the prop's vertex runs in the merged chunk buffers move for under a
second and are restored bit for bit. New here: a Kick press next to a compact prop (`lib/town/propKick.ts`, the flag kick's
pattern) plays the tree-kick pose and the same reaction. Reduced motion now plays the gentle version (`REDUCED_GAIN` 0.3, no leaf
shimmer, no lamp flicker) with the usual sound.

Counts are from the headless town build (`tests/kick-audit.cjs`, `tests/prop-reactions.cjs`). "Kick" = the Kick press also works.

## Reacting

| Kind | Count | Collider | Before → after |
|---|---|---|---|
| Street lamps (town streets, rooftops, Coral Cay, East Pier) | 128 | y | sway + pool flicker → sway + the head swings (`shake`), Kick |
| DRIP FC Stadium lamp posts (plaza, apron, trails) | 44 | y | none → lamp sway, head swing, pool flicker, Kick |
| Stadium stair bollards, wall and gate uplights | 50 | y | none → bollard shiver, Kick |
| East Pier bollards | 7 | y | shiver → shiver, Kick |
| Traffic signals | 46 | y | sway → sway + the heads swing |
| Court / practice light poles, field floodlights | 4 + 20 | y | sway → sway + head swing, Kick |
| Pier shade structures (cone on a pole) | 2 | y | none → sway (`pole`), Kick |
| District, park, info and trail signs | 26 | y | wobble + spring cue (unchanged) |
| LILY POND sign (Stadium Park) | 1 | y | none → wobble + spring cue |
| Plaza flags | 20 | y | flag sway + Kick (flagKick.ts, unchanged) |
| Coral Cay beach flags | 4 | y | flag sway (unchanged) |
| Stadium corner flags | 4 | **n → y** (0.12 m) | none → flag sway + spring cue |
| Benches | 59 | y | thunk + rock (unchanged) |
| Picnic and cafe tables | 35 | y | jolt (unchanged) |
| Trees, palms, bushes | 241 / 207 / 15 | y | rustle (unchanged); Summit trees keep their tree kick |
| Planters and flower beds | 50 | y | rustle (unchanged) |
| Fences and rails | 8 | y | ripple (unchanged) |
| School bike rack | 1 | y | none → ripple (`fence`) |
| Small nets (Coral Cay goals, volleyball) | 4 | y | billow (unchanged) |
| Island pitch goals (fields.ts) | 8 | y | net billows, frame shivers (unchanged) |
| Stadium goals | 2 | y | none → net billows, frame shivers (`goal`, frame + net run) |
| East Pier lifebuoy stands | 4 | y | sway (unchanged), Kick |
| Lifebuoy rings on the beach fence | 2 | y (the fence) | none → the ring swings, Kick |
| Crates, bikes, lifeguard chairs | 6 / 2 / 2 | y | jolt (unchanged) |
| Island Shuttle shelter (roof, posts, sign) | 1 | y | none → shiver (`post`) |
| Rosa's fish stall | 1 | y | stall wobble + splash (unchanged) |
| Beach umbrellas and loungers | all | y | umbrellaReaction (unchanged) |
| Vending and drink machines | all | y | vendingKick wobble + thunk (unchanged) |
| **Gashapon machines** | 16 | y | none → the machine shakes, the globe more, the capsules rattle, `rattle` cue, Kick |

## Skipped

| Kind | Why |
|---|---|
| Stadium pitchside boards | the sponsor art is a separate mesh; moving the dark back would part it from its art |
| Stadium masts, screen posts, roof posts, gate pillars, stand walls | massive steel / concrete: a sway would read as broken |
| Stone gate piers, colonnade piers, greenhouse and garden beds, museum walls | masonry and buildings |
| Practice-court training cones | no collider on purpose (dribbling cones the ball runs through) |
| Track starting blocks | low kerb-height blocks; the ball rolls over or stops, nothing to animate |
| Boats, buoys | on the water (the buoy has its own ball solid); boats move already |
| Bins, hydrants, mailboxes, phone booths | none exist on the island |

## Cost

No new draw calls, materials, textures or audio files. Idle: one counter check per frame (propReactions) plus one property read
(propKick: the target search runs only on a new Kick press, over one 3×3 block of 8 m grid cells). While a reaction runs: at most
4 props at once for ≤ 1 s, each rewriting only its own vertex runs (a gashapon is ~5.3k vertices, a lamp ~150) and uploading
those ranges. The 'rattle' cue is synthesized like the other island cues. Gashapon open/close (`gashaponStatic.hide/show`) first
settles any running reaction, so the swap never sees moved vertices.

Tests: `tests/kick-audit.cjs` (every "react" kind has PropSpecs; each new reaction starts on a ball hit, moves only its own runs,
settles bit for bit, is gentler in reduced motion; the Kick press; the corner-flag colliders).
