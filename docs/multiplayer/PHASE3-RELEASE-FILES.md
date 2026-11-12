# Public island phase 3: release files (Nov 12 2026)

Ship together with the phase 1 and phase 2 batches (`PHASE1-RELEASE-FILES.md`, `PHASE2-RELEASE-FILES.md`), with
`NEXT_PUBLIC_PUBLIC_WORLD` OFF until the owner switches it on. With the flag off nothing here is drawn, shown or sent (the shimmer fix
adds `toastLane.settle()`, but only public-island UI calls it, so flag-off timing is unchanged). The relay hunks ride the SAME `wrangler deploy` as relay v3 in
`PUBLIC-OWNER-STEPS.md` step 2: no new binding, migration, secret or route. Not part of this batch: Coaches Corner / IDP, the water
shader files, `components/WelcomeBack.module.css` + `tests/oct1-ui.cjs` (the owner's coins-note line), all untouched.

## A. New files (whole file)
- `lib/multiplayer/islandLife.ts` (Match o'clock clock, the island goal count, busy pitches, `glowFields`)
- `lib/graphics/activityGlow.ts` (the static gold light over a pitch)
- `components/party/IslandLifeToast.tsx` (the one note: Match o'clock / island goal reached)
- `tests/mp-public-phase3.cjs` (in `TEST_CORE_CHAIN`)
- `scripts/check-mp-phase3-browser.cjs` (headless check, dev only)
- `docs/multiplayer/PHASE3-VERIFY.md`, `docs/multiplayer/PHASE3-RELEASE-FILES.md`
- Screenshots: `docs/qa/phase3-match-oclock-phone.png`, `phase3-match-oclock-desktop.png`, `phase3-goal-panel-phone.png`,
  `phase3-goal-panel-desktop.png`, `phase3-glow-phone.png`, `phase3-glow-desktop.png`

## B. The shimmer fix
- `lib/ui/toastLane.ts`: `EXIT_GAP_MS`, `releasedAt` set in `release()`, the new `settle(id)`, `reset()` clears it. The whole diff
  against origin/main is this hunk. No other lane user changes behaviour (only callers of `settle()` wait).
- `components/party/PublicFirstCard.tsx`, `components/party/PeopleButton.tsx` (phase 1/2 files): `toastLane.settle(...)` before
  `toastLane.request(...)`, one line each.

## C. Phase 1/2 files changed again (whole file: they are public-island files already)
- `multiplayer/protocol/types.ts`: `Cap.Goal` 2048 (in `CAPS_WORLD`, never in `CAPS_ALL`), `ISLAND_GOAL`, `C.Goal` 61, `S.Goal` 43,
  `CGoal` / `SGoal` types
- `multiplayer/protocol/validate.ts`: parse `C.Goal` `[61]` and `S.Goal` `[43, n]`
- `multiplayer/relay/src/roomCore.ts`: world goal count (`goalDay` / `goalN`, `goal()`, `goalToday()`, `restoreGoal()`, `goalCount`,
  `onGoal`), S.Goal in `worldHints` (1 Hz, on change), per-member `goalBucket` / `goalSent`
- `multiplayer/relay/src/partyRoom.ts`: world keeps `'goal'` `{day, n}` in storage (`onGoal`), restored on wake (`buildWorld`)
- `lib/multiplayer/connection.ts`: `sendGoal()`
- `lib/multiplayer/publicCopy.ts`: `MATCH_OCLOCK`, `MATCH_OCLOCK_TIPS`, `ISLAND_GOAL_COPY`, added to `allPublicCopy()`
- `components/party/PresenceChoice.tsx`: the island goal line in the panel (world only)
- `tests/mp-public-ui.cjs`: the dispose pin allows `offLife();`

## D. Shared files, phase 3 hunks only
- `components/Town.tsx`: (1) the import line after `publicNear` (`islandLife`, `activityGlow`, `IslandLifeToast`); (2) in the
  public-world effect `const offLife=attachIslandLife(...)` and `offLife();` in its cleanup; (3) after
  `liveJoin.onMatch=e=>liveMatch.on(e);/* join / leave transitions only */` the `if(publicWorldEnabled()){...noteTeamGoal()...}`
  wrapper and the `activityGlows` / `refreshGlows` / `offGlows` / `disposers.add` lines; (4) in the `if(publicWorld.current){...}`
  frame block `lifeFrame(t,Date.now());` and the `glowPlaying` check; (5) `{publicWorldEnabled()&&ready&&!failed&&<IslandLifeToast .../>}`
  after the `PlayerCard` line.
- `package.json`: `node tests/mp-public-phase3.cjs` after `mp-public-phase2.cjs` in `TEST_CORE_CHAIN`.

## E. Not part of the batch
`tsconfig.json` (if Next added an include line for `.next-p3`, it was removed at clean-up).
