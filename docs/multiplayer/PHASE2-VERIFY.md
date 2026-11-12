# Public island phase 2: build + verify (Nov 12 2026)

Scope (plan "Later phases", line 2): default on for everyone, onboarding card, existing-player hint, live count badge, holdout
reading. Built in the working tree only (nothing pushed or deployed), behind the same build flags (`NEXT_PUBLIC_MULTIPLAYER=1` +
`NEXT_PUBLIC_PUBLIC_WORLD=1`). Flag off = the live site, unchanged (checked in the browser, below). Not touched: the Konbini tap issue
(owner decision pending), Coaches Corner / IDP, the water shader files. Files: [PHASE2-RELEASE-FILES.md](PHASE2-RELEASE-FILES.md).

## What was already there from phase 1 (found, finished, not duplicated)
- Default on: `presenceMode.ts` already resolved "no stored choice" to the holdout arm's default (90% With other players, 10% Just
  me), with the tour forcing Just me (`reason 'tutorial'`) and the lock / Just me winning. Phase 2 changes no rule; it pins them.
- The first-time card (`PublicFirstCard.tsx`, 25 m, once, through the one-message lane) and a 5 s pulse + bubble for "existing"
  players (anyone whose tour was done at page load), shown only once others were in the world. Badge = a bare number.
- The holdout arm (seed in `fi2-holdout-v1`) and its two totals `mp:pub_arm_on` / `mp:pub_arm_hold`; no reading side.

## What phase 2 built
1. **Default on (unchanged rule, now pinned).** Flag on + nothing stored = With other players (arm on). A brand-new player plays the
   tour in Just me (no socket, today's "Play with friends" label) and others appear after it. Grown-up Off beats everything (even a
   party), Friends only and Just me beat public. `tests/mp-public-phase2.cjs` §1.
2. **New vs existing, decided once.** New device key `fi2-public-since-v1` ('old' / 'new', `publicNear.playerSince`), written on the
   first flag-on island visit: 'old' if the island tour was already finished then (an island from before public play), else 'new'.
   Kept for good, so a new player who finishes the tour stays 'new'. Classified as a device key in `lib/saves/snapshot.ts` and in
   table B of `docs/accounts-design.md` (never synced).
3. **Onboarding card, new players only.** Same card and wording as reviewed in `PUBLIC-COPY-REVIEW.md` (the plan's sentences plus
   "the game makes up their names"); now never for 'old' devices and never after the hint.
4. **Existing-player hint.** For 'old' devices, once, the first time they are really in a world (count can be 0): a bubble under the
   people button: "Other kids can be on your island now. To play on your own, tap here and pick Just me." with an OK button. OK
   closes it (does not open the panel); a tap on the people button closes it and opens the panel; Escape closes; it closes itself
   after 12 s (the phase 1 bubble's own timeout, lengthened; it holds the one-message lane while open, so it cannot sit forever).
   Portalled to `<body>`, so the HUD row's markup and its first/last-child ordering are byte-for-byte as before.
5. **Live count badge.** An island-green pill (`--btn-green`; the screenshots show the earlier brighter green, before the token fix) under the people button: "8 on now", "lots on now" above 24, nothing at 0 (the panel keeps
   "Nobody else right now"). Source: `presence.count`, set only by the socket's own count messages (`S.World` / lobby `n`). No
   timer, poll or request added. In a party the old member-count badge is unchanged.
6. **Holdout reading (OFF).** New flag `NEXT_PUBLIC_PUBLIC_HOLDOUT_READING=1` (on top of the public flags;
   `publicFlag.holdoutReadingEnabled()`), default unset. When on, the client adds four totals: `mp:pub_hx_<on|hold>_min` (whole
   foreground island minutes in a tab that STARTED in that arm, sampled from Town's existing frame like `publicFrame`) and
   `mp:pub_hx_<on|hold>_back` (a tab on a device whose holdout seed already existed: a returning visit). The admin report
   (`lib/analytics/holdoutReport.ts`, `report.holdout`) compares the arms: visits, island minutes per visit, share returning,
   the hold share (expected ~10%). Off: the report answers `status:'off'` without reading the counts and `HoldoutCard` renders
   nothing. Counts only; no id, name, world or position; the seed never leaves the device. The ids are allowlisted now (the SQL
   ingest regex already accepts them; `countSince` regenerated) so switching on needs no migration.

## Results
| Check | Result |
|---|---|
| `tests/mp-public-phase2.cjs` (new, in `TEST_CORE_CHAIN`): 9 groups | PASS |
| `tests/mp-public-ui.cjs` (badge and Town pins updated), `mp-public-copy.cjs` (flag-off policy / safety / play / site hashes unchanged) | PASS 10 / 16 |
| `NODE_OPTIONS=--max-old-space-size=6144 npx tsc --noEmit` | clean (relay not touched: `tsc -p multiplayer/relay` not needed) |
| `npm run lint` | 0 errors (83 old warnings, unchanged count) |
| `npm run test:quiet -- --timeout 900` | 1023/1026 on the first run: `oct1-ui.cjs` (known, parked coach copy) plus `mp-ui.cjs` and `ui-spec.cjs`, both tripped by the new count pill's raw hex / `system-ui` font; fixed to island tokens (`--btn-green`, `--btn-ink-on-dark`, `--btn-font`) and both re-run green (30/30, 102/102). Only `oct1-ui.cjs` remains |
| Browser, flag ON (dev relay 8801 world mode, Next dev 8167, headless Chrome `--mute-audio`, world bots) `check-mp-public-browser.cjs --profile=phone,new,desktop` | 29/29 ok (a post-launch player: card once, alone, never the hint; panel, Hide, Report, switches, lock, Arcade chip, `/control` close silent; new player: nothing before the tour ends) |
| Browser, flag ON, `--profile=existing,existing-desktop` | 12/13: classified 'old'; hint with OK on screen, "16 on now" = the socket count; OK closes, panel shut; never the card; hint never twice (phone); desktop's last reload step lost the dev server (killed from outside, as in phase 1), the same step passed on the phone |
| Browser, flag OFF (Next dev 8168, `--profile=off`) | 2/2 ok: today's "Play with friends" button, menu and Allowed / Off toggle, no errors |

Screenshots: `docs/qa/phase2-existing-hint-phone.png`, `phase2-existing-hint-desktop.png`, `phase2-first-card-phone.png`,
`phase2-first-card-desktop.png`.

## Findings not fixed
- (Low, phase 1 behaviour) Desktop screenshot: the first-time card opened while the "Something shimmers over there" exploration
  banner was still fading out at the top of the screen, so the two overlapped for a moment. That banner seems not to use the
  one-message lane. Left alone (not phase 2 code); worth a look with the toast-lane owner.
- (Info) The desktop dev run showed the Next dev "7 errors" overlay once, right as the dev server was killed from outside; the
  console-error checks of every completed run were 0. Same pattern as phase 1 gap 8.
- (Info) Island minutes per arm undercount equally in both arms when Town's frame loop sleeps (idle island); fine for a comparison,
  not an absolute play-time figure.

## Owner steps
1. Lawyer: question 5 (is the holdout arm "profiling"?) now also covers the two new per-arm totals (island minutes, returning
   visits). If yes to reading: add a line to the policy's section 7 usage list (proposed: "and, for the 1-in-10 comparison, island
   minutes and returning visits for each group, as totals") and set `NEXT_PUBLIC_PUBLIC_HOLDOUT_READING=1` on Vercel. Until then
   leave it unset: the arm itself still runs with the public flag, as in phase 1.
2. Copy review: add the hint line ("Other kids can be on your island now. To play on your own, tap here and pick Just me.") and the
   badge form ("8 on now") to `PUBLIC-COPY-REVIEW.md` sign-off.
3. Release phase 2 with phase 1 (flag OFF), per `PHASE2-RELEASE-FILES.md`. Everything else in `PHASE1-VERIFY.md` "Owner's checklist"
   is unchanged (relay deploy, preview flag, billing alert, family beta) and still comes before switching on.
4. Family beta: check on a real phone that an existing child sees the hint once and a brand-new child sees the card once after the tour.
