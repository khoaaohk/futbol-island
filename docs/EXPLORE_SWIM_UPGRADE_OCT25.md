# Explore + swimming upgrade (Oct 25 2026)

Owner ask: "continue to fix the explore area with swimming to improve that experience ... intuitive, engaging, better mechanics for
the body". Audited by playing it in a headless 390 x 844 phone browser (`scripts/check-dive-browser.cjs`, rewritten, plus two
scratch scripts for close-up pose clips and edge cases), on top of the integration branch with the reef chest balls.

## How the audit was played

1. Start on the real shore nearest Paul's Grotto (computed from `landmass.ts`), look out to sea.
2. Swim out, get the Explore prompt, explore, swim to the goal relic, the coral, the clam and the chest's hidden ball (its animated
   lesson card), hold the up button to come up, catch a breath, explore again, swim out across the zone's edge.
3. Check every zone's Explore prompt.
4. Edge cases: breath low and out, the "catch your breath" prompt, a tab switch while holding the up button, R (jetpack) from the reef.
5. Close-up clips of the swimmer treading, crawling, sprinting, turning, duck-diving, coasting.

## Findings

| # | What a kid hits | Status |
|---|---|---|
| 1 | `check-dive-browser.cjs` started out at sea (the pre-Oct 21 beach), waited for a "Dive" label (now "Explore"), tapped the removed pink Surface button and the old matchday coin | Fixed: real shore start, current flow, chest ball lesson, edge exit |
| 2 | Under the reef the arm strokes were silent: the reef fed the sound a stroke clock of 0 | Fixed (`dive.strokePhase`) |
| 3 | "Something shimmers over there ... Follow the arrow!" stayed up after the kid had already reached the zone, sitting over the Explore prompt | Fixed: the hint goes inside that zone's patch |
| 4 | A hint for a *different* zone, queued at the surface, showed under the water (the hint tick sleeps while diving) and held the one toast lane, so the arrival and low-breath notes waited behind it | Fixed: no hint while over a zone, a waiting hint is dropped when a dive starts, the toast frees the lane when cleared |
| 5 | Breath ran out in a reef: "Well done! You floated up for a breath." was wiped by `leave()` before it could show | Fixed |
| 6 | A tab switch / phone call while holding Swim fast or the reef's up / down left them stuck on (the release never arrives) | Fixed: blur lets go |
| 7 | Letting go of the stick at the surface: the body carries on for about a second but the crawl kept churning | Added: a surface glide (arms ahead together, the kick eases, the stroke clock slows) |
| 8 | Coming up from a dive the swimmer just shook their head | Added: two deep breaths (chest heave, chin up) after a duck-dive of 1.5 s+ or a reef dive |
| 9 | With every reef task done, Dot (the buddy fish) had nowhere to lead and the secret ball gave no clue | Added: Dot circles you and one gentle note a dive ("this reef still hides one more secret. Peek inside things!"); it never leads to the ball |
| 10 | Wading in at a beach did not count for the reef hint (only swimming / flying), so a kid heading out got no pointer until deeper | Changed: wading counts |
| 11 | The buddy's hover lead built arrays every frame (`progress(s).found`) | Fixed (reads the save directly) |

Checked and fine: Explore prompt in all 7 zones; the room renders ~15 draws / 39k triangles and is disposed on surfacing; the island
stops rendering under and resumes; Seamless Explore out across the edge; R from the reef takes off; the rest prompt; the chest ball's
lesson card opens and closes; no page or console errors.

## Not changed (open questions for the owner)

- The zones sit 54 m (Paul's Grotto, Ray Meadow, Turtle Pool) to 112 m from land, so from the beach a kid cannot see a buoy (the
  follow camera sees about 25 m ahead). The minimap markers and the once-per-zone hint (now also on wading) are the only pointers.
  A tappable reef marker on the travel map ("swim there" / "fly there") would make entry obvious; that is a design decision.
- The secret note's copy ("Peek inside things!") hints at the chest without naming it; the owner may want it plainer or quieter.
- Disk: the shared 16 GB Mac ran out of disk during the audit (dev caches of several agents, 2.5 to 5 GB each).

## Files

- `scripts/check-dive-browser.cjs` (rewritten)
- `lib/town/water/diveRuntime.ts` (stroke phase, the secret nudge, the out note, no per-frame arrays)
- `lib/town/water/reefDiscovery.ts`, `components/ReefHintToast.tsx`, `components/Town.tsx` (hint rules, blur, gasp, stroke sound)
- `lib/town/water/waterState.ts` (`GLIDE`, `GASP`, `gasp()`), `lib/graphics/swimPose.ts` (`glide`, `gasp` pose fields)
- `tests/explore-swim-oct25.cjs` (new, appended to `npm test`); `tests/reef-discovery.cjs` (eligibility pin updated)

Heat: nothing new per frame beyond a few multiplies in the pose; no new meshes, materials, particles or timers.
