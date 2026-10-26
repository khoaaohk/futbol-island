# QA audit 3: outdoor island and play side, Oct 25-26 2026

Round 2 of the overnight QA, the outdoor lane (round 1 is docs/QA_AUDIT_OCT25.md; its back button, offline screen, 320 px sheets,
explore/swim, jobs, bug catching and reef balls are not repeated). Driven in headless Chrome (ANGLE/Metal, `--mute-audio`)
against a dev server on its own port and dist dir, phone portrait 390x844 touch first, then 700x840 (fold), 820x1180 (tablet) and
1280x800 (desktop). Relay off (no `NEXT_PUBLIC_MULTIPLAYER`), fresh local saves per scenario. Scenario scripts teleport with the
dev hook `window.__fi2` (location / rooftop.reset) and then play with the on-screen buttons or keys.

Severity: **P0** blocks play, **P1** a kid will hit it and be confused, **P2** polish, **P3** cosmetic / dev-only.
Status: FIXED (commit), OPEN (reason), NOT A BUG (re-verified).

## Findings

| # | Sev | Area | Finding | Repro | Status |
|---|-----|------|---------|-------|--------|
| 1 | P1 | Pitches | Standing anywhere in the middle or north/west half of Eleven Park (11v11) showed **no pitch card** (no "Start lesson 1"): the clipped pitch projection returns Infinity when one corner of the 63 x 99 m pitch is behind the camera, and Town skipped the pitch even though the owner rule (Oct 24) is "the card shows while you stand in that pitch's space". 7v7, 9v9 and futsal were fine (smaller). | Walk to the centre spot of Eleven Park (135,100) | FIXED 6b766875: the score is clamped (`Math.min(score,1e3)`), so the pitch you stand in always wins. Re-verified at 6 spots on phone and desktop. Test: tests/qa-audit3-play.cjs |
| 2 | P1 | Sea edge | Round 1 #14 re-verified: swimming out to the edge of the swimmable sea (e.g. west of the island at x = -152) the swimmer silently stops / slides along an invisible wall, with nothing telling a kid why | Swim west from the west beach and keep pushing | FIXED a9a44634: after ~1 s of pushing into the edge a note "Far enough! The sea is too big to swim across. Swim back to the island, or fly to the far reefs." (again after 20 s). Pure check `swimEdgePush` in waterDepth.ts. Test: tests/qa-audit3-play.cjs |
| 3 | P2 | Pitch lesson | A lesson started from the pitch card (Start lesson 1 → Done) returns to the Paths sheet, not to the pitch; on a cold dev server the sheet shows only its title for ~1.5 s while it lazy-loads | 7v7 card → Go → Done | OPEN (design: every path lesson closes back to Paths, Town.tsx FieldLearning onClose; the blank moment is a dev compile) |
| 4 | P3 | Ball hunt | Reloading while a found-ball lesson is open skips the lesson: the ball stays collected and the card offer comes back, but the lesson card itself is gone (the queue lives in React state) | Walk into the Store gardens ball (78,-47.5), reload mid-lesson | OPEN (persisting the lesson queue touches the save format; left for the owner) |
| 5 | P2 | Minimap | On phones the minimap folds when the full map opens and stays folded after it closes: re-opening the map takes Expand map + View map | Open the map, Done, look at the corner | NOT A BUG (Oct 22 rule: the minimap folds under any dialog; the toggle opens it again) |
| 6 | — | Rides | Moped "trapped" next to the Classrooms corner in the corner sweep | It was the 3.4 s crash recovery after bumping an NPC ("You good?"); re-probed with moped / bike / walk: all leave | NOT A BUG |
| 7 | — | Geometry | 7 "trapped" points between close obstacle pairs (café terrace at (-25.5,-0.3), Summit rock clusters at (705,189) and (544,51)) | Teleport into the gap | NOT A BUG: walk-in probes from 8 directions cannot reach them (enclosed by tables / overlapping rocks); only a teleport puts you there |
| 8 | — | Keep-ups | A tap probe reported the streak stuck at 1 | Probe re-queried the button between taps; with real touch taps and J the count goes 1, 2, 3 in the window | NOT A BUG (probe) |
| 9 | — | Arcade door | Standing at the Arcade door shows "Talk to Haruto", not Enter | docs/ui/HUD_STACK.md: a nearby NPC's Talk outranks a door | NOT A BUG |
| 10 | P3 | Dev env | Something outside this lane stopped every dev server on the Mac every ~10 min (exit 0); copied `scripts/check-*` scripts are stale here (need a Playwright-installed browser / `PW_CHANNEL`, and one stops the server on its port) | — | OPEN (environment; a watchdog restarted the QA server; "ERR_CONNECTION_REFUSED" console lines in some runs are those restarts) |
| 11 | P3 | Heap | Dev build heap 620-700 MB on the phone soak (React dev + three.js); flat over 5 min | 5-min soak | NOT A BUG (no growth; production is far smaller per round 1) |

## Scenarios played (44)

Pitches, lessons, matches
1. Pitch card at the entrance and centre of all four pitches (futsal roof, 7v7, 9v9, 11v11), phone.
2. Eleven Park card at 6 in-pitch spots before / after the fix (#1), phone and desktop; all 12 pitch spots on desktop.
3. 7v7 card → lesson (camera, Choose plays, transcript, steps) → Done → Paths "Continue where you left off" (#3), phone and desktop.
4. NPC matches on all four pitches: walking through the live match for 6 s each (no push-outs, no errors, culling stats sane).
5. Rooftop Knockout: queue pad join, countdown 2-1, "Free-for-all · 7 left · 3 hits", Kick / Dodge, walking off the roof edge (knocked out, back to the island HUD).

Ball, keep-ups, tricks
6. Dribble (ball stays 0.5-0.7 m ahead), Shoot (wind-up → shot 23 m), back to the feet.
7. Keep-ups by touch taps and J in the window (1, 2, 3 …) and the auto-return after a miss (#8).
8. Sky keep-up hold (mode sky, apex ~7 m, lands, streak kept).
9. Sky keep-up next to 16 thin fences / walls facing the wall: 0 landing marks behind the obstacle; 9 spots fall back to a normal touch (no valid landing), as designed.
10. Shot into the sea from the east beach: flies ~115 m, floats and drifts back.
11. Emotes with Maya: Wave, High five, Pass it, Juggle with me, Dance, Show off (effects run and end; no overlaps).

NPCs
12. Talk to Maya: options, clip, "Tell me about another game", Done; Talk prompt returns.
13. NPC Talk vs door priority at the Arcade / Store doors (#9).
14. Contextual prompts appear and clear at 10 spots (Coaches, Arcade, Store, Konbini roof vending, Museum, Kit Shop, Maya, Coach Rosa, zipline, Summit Kick), both by teleport and walking away.

Rides and travel
15. Wander bot, randomised 8-way stick, walk / bike / moped from the square, Eleven Park and the south-west: ~5 km, 0 trapped.
16. Moped into a hidden ball mid-ride → ball lesson opens and the ride waits (not a trap).
17. Jetpack: take-off, cruise at 28 m, forward flight across the island.
18. Landing from the jet (switch to Walk) on the Konbini roof, a town block, the Arcade roof, the futsal roof, the Coral Cay hostel roof (zip deck), the east sea and the north beach sea (splash-down into swim).
19. Blast up and parachute: 207 m, steady descent, HUD buttons.
20. Zipline Summit → Coral Cay: prompt on the tower steps, ride HUD (Wave, Tuck, Spin), landing on the hostel roof, walk off.
21. Manta ride at Coral Cay: Hang on, steer 14 s, Let go back to swimming.
22. Swim to the open-sea edge (#2) before and after the fix.
23. Building corners: 64 buildings x 4 corners, pushed into the corner then all four directions, on foot and on the moped: 0 trapped (#6).
24. Narrow obstacle gaps (17), walk-in reachability probes (#7).
25. Travel map: all 10 destinations (Summit 5s, 4 pitches, Arcade, Coaches, Coral Cay, Museum, Kit Shop) teleport and land with the right prompt.
26. Minimap fold after the map (#5).

Ball hunts and cards
27. Island Store gardens hidden ball: collect, lesson (3 steps), "Pick a card", Open this card, Added to your binder, reload: ball stays collected, no offer.
28. Reload in the middle of the ball lesson (#4).
29. Coral Cay parcels: 3 hidden balls collected with lessons and cards (the 4 kick / landing ones need a kick or a landing).
30. Summit Isle: 4 collected (hut, cave, lookout, orchard).
31. East Jetty / Sharks beach: 1 collected (kick / landing / ferry parcels left).

World, audio, performance, layout
32. Time of day via Settings (Day / Sunset / Night buttons; Night saved and rendered).
33. Music: plays on land and swimming, Settings → Background music off / on, ducked and paused in a lesson, back after; tab hidden / visible suspends and resumes.
34. 5-minute phone soak at night (walk, bike, scooter, moped, jetpack, keep-ups): 60 fps cap held (p95 16.8 ms), heap flat 620-700 MB (dev), geometries plateau 1355, textures 88, programs 105, DOM ~1970, 12 points (no particle growth), no console errors.
35. Prompt overlap / off-screen / under-32-px sweep at 10 spots x 4 viewports (phone, fold, tablet, desktop): none.
36. Fold and tablet screenshots in Eleven Park (card, minimap, action grid fit).
37. `?party=CODE` with the relay off: the code leaves the address bar, no friends UI, no errors.
38. Customizer opens when tapping your own player (observed while probing; by design).
39. Konbini roof vending prompt on the roof (17.2 m) and leaving it.
40. Futsal rooftop (6 m) walk-on / walk-off and Coach Rosa's prompt below it.
41. Swim HUD while riding a manta ("Pace yourself" card single, Let go button).
42. Hidden-ball pickup reach: standing 0.85 m from the pickup point does not collect, 0.25 m does (a kid walks into it; fine).
43. Desktop 1280x800 pass: pitch cards, lesson from the card, Done.
44. Server restarts during play (dev only): the island keeps running; no game error.

## Not covered

Bus / truck riding, ferry boarding, the Summit Kick challenge rounds, beach-court live match, East Pier shooting ring, fishing
(round 1), sharks, whale-shark ride (manta only), weather (the island has none; only fishing has a water mood), slow-3G load.
