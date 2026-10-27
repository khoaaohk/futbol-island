# QA audit 4: areas never covered, Oct 26 2026

Round 3 of the QA play-test (rounds 1-3: docs/QA_AUDIT_OCT25.md, QA_AUDIT2_OCT25.md, QA_AUDIT3_OCT25.md). Headless Chrome
(Playwright's headless shell, ANGLE/Metal, `--mute-audio`) against a **production build** (`next start`, port 8133,
`NEXT_DIST_DIR=.next-agent-8133`): the dev server on this Mac is stopped every ~10 min by something outside the repo (QA3 #10), and
a cold dev compile of the island took longer than that. Local save codes ran on the memory store (`SAVE_LOCAL_FILE` +
`SAVE_CODE_PEPPER`, local preview only). Phone 390x844 touch first, then 820x1180 (tablet) and 600x800 (fold). Fresh saves; the
island hook `window.__fi2` (teleport, rides, summitFun, games) moves the player, the on-screen controls do the playing.

Severity: **P0** blocks play, **P1** a kid will hit it and be confused, **P2** polish, **P3** cosmetic / dev-only.
Status: FIXED (commit), OPEN (reason), NOT A BUG (re-verified).

## Part 1 gaps (from the brief)

| # | Area | Status |
|---|------|--------|
| a | Strikers upright: coach pill over the right half of the box above Gold's goal | FIXED f898fc18: the pill is centred at 40.8% of the canvas, the one band neither box reaches at any follow-cam pan/zoom (tests/strikers-portrait-tip.cjs projects both boxes with the scene's camera maths on 360-820 px portrait screens). Measured live: 162-382 x 366-404 on 390x844 |
| b | Payday card could flash before "Pick a card" | FIXED 3cd013c5: IslandJobs earns a first job's Explore card in the same effect that sets payday (the ledger write ticks the checklist synchronously), and payday waits while any offer is open or pending (`paydayWaits`, lib/town/cardOfferHold.ts). tests/payday-after-pick.cjs |
| c | Tests that "need newer Node" | FIXED 14a9e25d: the .mjs sims failed on Node 20 only because `scripts/register-local-ts.mjs` used `module.registerHooks` + native type stripping (Node 22.18+). On older Node it now registers async loader hooks (`scripts/local-ts-hooks.mjs`, transpiles with the repo's `typescript`). `tennis-circuit.mjs` imports its sim dynamically. `coin-solids.cjs` was not a Node issue: it was stale (rides glance off solids since Oct 15; 10 floating balls since Summit Isle). pinball-divisions/possession, tennis-circuit, coin-solids, check-soccer-tennis pass on Node 20 and 25; the first four now run in `npm test`. `tests/pass-puzzle-arcade.cjs` takes `PORT` (default 8092) |

## Findings

| # | Sev | Area | Finding | Repro | Status |
|---|-----|------|---------|-------|--------|
| 1 | P0 | Summit Kick | After a new high score the "Save my score / Skip" form could not be tapped at all (both Skips, Save, letters): the round was stuck behind it. The board dialog mounts inside the click-through Summit HUD (`.hud{pointer-events:none}`) and a top-layer `<dialog>` still inherits pointer-events from its DOM parent | Play one round with any score > 0 on a fresh device | FIXED 58916f68 (`Leaderboard.module.css .dialog{pointer-events:auto}`); re-verified: Save, board Done, Play again, round 2, Skip, Done all work |
| 2 | P2 | Strikers upright | The first coach line ("Pass, move, receive…") had already faded behind the ready card by kick-off (its 5 s fade started when the card showed) | Read the card > 5 s, Kick off | FIXED fe0c801c (the pill re-keys when play starts); re-verified opacity 1 at kick-off |
| 3 | P2 | Jersey studio | Front / Back chips half hidden under the phone/tablet sheet (the resizable sheet laps 22 + 26 px over the stage; the chips sat 32 px up) | Open the Jersey studio on 390x844 or 820x1180 | FIXED 764676d5 (58 px); re-measured: chips end 10 px above the sheet on both |
| 4 | P2 | Slow 3G | Cold start on Slow 3G: title 2.8 s, Start 11.4 s, code 15.3 s, island ready 48.5 s. The water pill shows "Loading…" for the first ~20 s (fine), then the loader's tan hand-off sheet stays plain tan for ~25 s with nothing moving | DevTools Slow 3G, cache off, fresh profile, Start → Get my code → I saved it | FIXED beaa0925: in tan mode the loader's track fades in after 2.5 s (darker for the tan); a normal load is gone before then. (744c13c4 added one to the title's sheet too; reverted in 2fda926d, that sheet lasts ~1 s) |
| 5 | P2 | Whale shark | Once, while the test harness stalled the page (Playwright's scroll/stability wait before a tap), a steered ride ended `shore` and the rider and shark moved ~80 m in one frame, then the tap (the ride slot, "fly up") launched the jetpack. Raw touch taps on the same slot during a ride only show the "Hanging on" hint; a 10 s ride without input is smooth | Summit whale shark, ride ~5 s, `locator.tap()` on the ride slot | FIXED Oct 26: every ride movement clamps its step to `RIDE_DT_MAX` .05 s (was .25), NaN-safe; the swim back hands over at the nearest loop point; a stopped shore brake re-reads the open side (tests/ride-dt-clamp.cjs) |
| 6 | P3 | Save codes | A code made on device A and loaded at once on device B brings an empty island (0 coins) until A sends a copy (milestones, or leaving the page). After A closes, B loads 40 coins + 3 cards as expected | Two fresh contexts | NOT A BUG (sync is on milestones / pagehide by design) |
| 7 | P3 | Beach court (Coral Cay) | Match wakes when you arrive (10 rigs, 60 fps), sleeps when you leave; sim clock ran ~0.5x wall time (11.5 s in 24 s) | Walk to the touchline, watch 24 s | FIXED Oct 26: periods, the full-time beat and the feed's m:ss read `MatchSim.clock` (real seconds = sim dt / windupScale); the sim's pace is unchanged (tests/beach-clock.cjs) |
| 8 | P3 | Kit Shop | On arrival the "KIT SHOP" header pill sits over the "JERSEY STUDIO" wall sign | Open /shop on a phone | OPEN (cosmetic) |
| 9 | P3 | Jersey studio | The name on the back ("KHOA") is very faint on the default Lagoon hoops (light lettering on light stripes) | Step 6, type a name | OPEN (design: contrast / outline for names) |
| 10 | P3 | Whale shark | "Pace yourself" swim card shows while hanging on to the shark (no swimming effort) | Grab the shark | OPEN (it fades at 4.2 s since 1e777601) |

## Scenarios run (all clean of console errors unless listed above)

1. Landing → Start → Get my code (three words + number) → I saved it → island, phone and tablet: 60 fps idle.
2. Save code made on A, A leaves, loaded on B ("Welcome back! 40 coins · 3 cards"), B plays with 40 coins.
3. Whale shark (Summit Isle): Hang on!, ride (60 fps), Let go returns to swimming; a raw tap on the ride slot while riding = hint.
4. Summit Kick: start post, how-to card, two rounds with tap and hold kicks, high-score form (#1), Play again, Skip, Done → idle.
5. East Pier ring from the head: six shots (tap and holds); the miss coaching ("Just missed. Look at the ring…") shows; no hit
   landed headless (the shot heading follows the camera-relative stick, so the harness could not aim reliably).
6. Coral Cay beach court: watch, wake and sleep (#7).
7. Strikers (portrait phone) to full time: pill position (a), full-time line, high-score form then Rounds / Play again / Leaderboard.
8. Soccer Tennis to full time on the phone: Serve / Lob / Drop, match over in 41 s, Retry court / Leaderboard / Back to arcade.
9. Jersey studio, phone / tablet / fold: tap the wall (walks there, opens), all 7 steps with Next, draw a stroke, name + number,
   Save ("Saved in slot 1"), Back to the shop.
10. Museum deep check: all 23 cases (Next case to 23/23 and Previous case to the start), See exhibit on each and its first
    control (Stitch the Telstar, Run plant kick, the analyser, floodlight rig, tactics machine, keeper crank, spin lab, the
    1863 laws bench, the World Cup bracket, VAR cams, the 1891 penalty…); no console errors.
11. Slow 3G cold load (#4), before and after the fix.
12. Fold 600x800 and tablet 820x1180: island HUD, map, Settings, Paths: no overlapping or off-screen controls (only dialogs over
    the HUD behind them).

Not covered: **buses** (the island has no buses; street traffic is the pickups you land on, not ridden this round) and the
**ferry** preview (tapping the boat needs it framed on screen; the harness's camera placement never framed it). Oct 26 follow-up: checked headless (phone + desktop: the tap opens the locked preview; the East Pier foot ring is flat 10 cm over the deck), pinned by tests/ferry-pier-ring.cjs.

## Tests

- tests/strikers-portrait-tip.cjs (a), tests/payday-after-pick.cjs (b), tests/qa-audit4.cjs (#1, #3, #4), updated
  tests/strikers-portrait-controls.cjs (#2) and tests/jobs-oct26.cjs (b); coin-solids and the three .mjs sims join `npm test`.
- The scenario scripts are throwaway (scratchpad); the fixes are covered by the unit tests above.
