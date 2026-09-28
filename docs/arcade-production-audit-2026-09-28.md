# Arcade production audit — 28 September 2026

Scope: all five arcade games, desktop and touch. Work remains local; do not restart :8092. Preserve concurrent island, vending and story changes.

## Acceptance

Use the game-developer skill with the arcade-production-polish checklist. Test ordinary input exchanges separately from injected edge-case fixtures. Prioritize responsive movement, understandable passing/shot intent, fair opponents, readable contact/recovery and pause/exit cleanup. Existing island control sizes and safe areas are the reference. No extra perpetual effects or dynamic lights. Browser performance is not a physical-phone thermal certification.

## Round 1

| Game | Current audit focus | Evidence / next action |
| --- | --- | --- |
| Island Strikers | Passing while moving, receive assistance, movement transitions, defender readability | Ordinary-input script used obsolete arcade picker. Updated route to current game deep link and seeded entry coins only; match state remains untouched. Mobile baseline in progress. |
| Futbol Tennis | Intercept timing, analog movement, stroke selection and recovery | Inspect existing five-court progression and run ordinary rally / aerial play. |
| Futbol Pinball | Flipper contact, charge/release, launch recovery, table readability | Inspect existing division mechanics and play real controls. |
| Breakaway Run | Lane changes, buffered actions, defender returns, charged finish | Inspect six-stage route/return behavior and play real controls. |
| Pass Puzzle | Mouse/touch intent, power, preview truth, first-shot freedom, keeper recovery | Inspect stroke/prediction pipeline and complete ordinary-input puzzles. |

## Validation log

- The new local `arcade-production-polish` skill adds production acceptance criteria; it does not claim AAA certification or bug-free software.
- Bundled skill validator currently cannot start because Python environment lacks PyYAML. Frontmatter/content can be checked independently; this is not a gameplay blocker.

## Round 1 changes and observed outcomes

- **Strikers:** receiver lead accounts for the movement held when control transfers, acceleration and ball friction; departing teammates get sufficient pass pace. The flight remains ballistic (no homing), and manual direction changes still override the predicted run. Faster human acceleration/braking removes the long neutral-stick slide; outward velocity is cleared at the boards. New 30/60/120Hz checks cover analog, full stick, sprint, diagonal, 8/18/28m receptions and stopping/reversal. Ordinary desktop play: 55 seconds, 1 completed pass, 6 shots, 5 goals. Baseline mobile before changes: 55 seconds, 1 pass, 4 shots, 1 goal. These are separate runs, not a controlled difficulty comparison.
- **Tennis:** receiving marker persists after the first bounce and targets descending foot-height contact, using existing throttled prediction. Full mobile match: best rally 10, 11 clean returns; intentional non-defending phase reaches defeat, retry and missed-return checks pass. Serve and pause sleep verified; 51 draw calls in the sampled scene.
- **Pinball:** Nudge acts on press; Launch still charges and fires on release. A press remembers its original meaning so a held nudge cannot turn into an accidental launch. Touch cancellation and pause cancel launch holds. Real mobile play: 15 strikes, natural loss/retry. Separate visual fixtures verify dazed defenders, keeper dive, goal net and table vibration; sampled 81 calls. New ordinary-input timing check confirms nudge happens before touch release.
- **Breakaway:** swipes commit at the distance threshold instead of waiting for release. One swipe makes one decision, even if the finger keeps moving; canceled taps do not shoot. Baseline mobile run: 3 goals, 8 lane changes, no lost lives. New input timing check verifies a lane cut and jump before release, no second cut on release, and cancellation.
- **Pass Puzzle:** smoothing ignores repeated coalesced timestamps and stale events; invalid samples cannot poison the filter. Enforce 80ms preview cadence while dirty (previously dirty bypassed the limit), retain the latest pending preview, and let a stationary held gesture sleep after its loft feedback settles. Mobile ordinary-input cancellation, failure/retry, pass and finish passed before scheduling adjustment; desktop regression in progress.

## Round 1 follow-ups (completed below)

- Retest Strikers mobile after changes; inspect pass contact/first touch and advanced-round pressure.
- Inspect tennis post-bounce guide and aerial contact on desktop; verify muted/reduced-motion paths.
- Check pinball beginner timing readability and whether feedback teaches alternating feet clearly.
- Retest Breakaway gameplay after early swipe commitment, including returned shots and charge cancellation.
- Measure puzzle preview update rate and settled held-gesture sleeping; recheck mobile after scheduling change.
- Run TypeScript, device/heat guards and full suite after integration. Physical-phone heat remains unverified.

## Round 2: contact, input ownership and new requested mechanics

- Strikers: 220ms visual first-touch cushion uses existing rig receiving poses; movement and first-time passing remain available. Mobile ordinary run after changes completed 55 seconds, one pass, two shots, 1–1.
- Tennis and Strikers: release/cancel from a second pointer cannot neutralize the joystick owner's finger. Real CDP two-finger tests pass on portrait tennis and landscape Strikers, including cancel/blur cleanup.
- Breakaway: early swipe still commits once; Up/W/J now all jump, Down/S/K slide. Ordinary timing tests pass for touch and keyboard.
- Pinball: passive timing lights identify the approaching left/right flipper without automatic strikes. Requested defender possession cushions soft balls, scans an open teammate, makes at most two physical passes, then attacks a reachable lower flipper lane. Fast body hits still daze; goalkeeper remains separate. Existing rings mark carrier/receiver; first touch/wind-up/kick use existing rigs. Nudge releases a held ball. Deterministic checks pass for all three defenders at 30/60/120Hz; mobile browser fixture completed the two-pass exchange, counter-shot and an ordinary touch return; pause slept.
- Pass Puzzle: Shoot no longer forces all attempts low. Independent goal-height control includes a one-tap Top bins setting, preserves power and drives the same preview/flight/replay. Actual desktop and touch input both completed top-corner goals. Physics checks cover both corners, low/mid/high finishes, three goal sizes, 8–30m plus bounded long-range speed/apex. Mobile screenshot reviewed at 390×844.
- Puzzle preview scheduling measured minimum 98.5ms between expensive predictions in the sampled mobile run; stationary held input sleeps and movement wakes it.

A quick-tap browser check exposed flipper down/up events being lost between frames. A bounded 65ms simulation pulse now preserves each press and is cleared on cancel/pause; tap strokes settle at 30/60/120Hz.

All changes remain local; no server restart, commit or deployment. Added work reuses active-game update loops and materials; no background timers, extra lights or canvas blur. Physical-device temperature remains unmeasured.

## World follow-ups during arcade audit

School terrace hangout and vending nook finished: north-side pergola, cushions/tables, static warm bulbs, plants and tile nook. Both stair routes and walking beneath the pergola pass the actual movement solver; roof guards still stop edge crossings. Greenhouse uses one landing exclusion; nine interior samples reject aerial landing and redirect outside while both doorways remain walkable. Tinted lawn overlay removed to match shared grass. No new animation loops.

Rosa's market is now 7.5×9m (previously7×6), taller coral/cream canopy and enlarged west-facing name sign, extended counter, produce displays and raised sell sign. Existing front approach and selling preserved; browser verified visible market action. Map now has five circled F markers, named Rosa's Market and eight V markers at actual machine coordinates; removed obsolete Shop pin. Initial SVG title hydration warning found and fixed by providing one string child.

Final browser checks still underway: context hover fixture originally targeted the Plays overlay rather than canvas; now selects unobscured building face. Cinematic fixture Play entry requires waiting for paid entry to finish; next-court and initial entry waits corrected. Do not count incomplete checks as passes.


## Final acceptance — local work complete

All five games received engine inspection, targeted improvements and actual-input checks. Evidence separates controlled fixtures from ordinary play:

| Requirement | Current evidence |
| --- | --- |
| Fluid movement and assisted passing | Strikers movement/reception matrix at30/60/120Hz, analog/diagonal/sprint,8/18/28m, manual override, braking and first touch pass. Ordinary desktop/mobile runs complete passes and goals. Advanced-round pressure/third-player cover/compact-block tests pass. |
| Intuitive touch/desktop controls | Joystick pointer ownership and Shoot/Sprint hold ownership checked with two real touch contacts, cancel and blur. Runner swipe threshold commits before release; keyboard jump/slide equivalents pass. Pinball65ms tap pulses survive down/up between frames and settle. |
| Tennis contact/readability | Ordinary mobile match achieves10-touch rally and11 clean returns, then loss/retry. Desktop/mobile actual Kick on a high-ball fixture triggers slam angle, camera recovers, pause sleeps, next court persists. Reduced motion has stable camera/no haptic. |
| Pinball response and opponents | Soft-ball control/two-pass counterattack tested for each defender at30/60/120Hz. Mobile fixture completes exchange and real tap return. Ordinary play covers natural loss/retry. Full390×844 table screenshot reviewed after aspect-aware framing; controls and feedback remain below. |
| Breakaway player choice | Post-change ordinary mobile run:3 goals,8 lane changes,31combo; committed defenders move up to0.8m. Natural failure and retry pass. Separate ordinary touch run provokes a defender return, changes lane and earns Return avoided. Normal/reduced charge cameras and cancellation recover correctly. |
| Puzzle gesture, power and shot height | Mouse/touch controls complete pass/finish and top-corner goal; cancellation and retry checked. Coalesced timestamps and invalid samples safe. Prediction/replay agree across low/mid/high corners, goal widths/distances and30/60/120Hz. Preview min98.5ms sampled; stationary held gesture sleeps. |
| World requests alongside games | Rooftop hangout/stairs, greenhouse ground walking and aerial exclusion, matching grass, enlarged Rosa stall and map markers checked. Desktop/mobile contextual-action browser now passes proximity, leaving field, unobscured building hover and roof vending with exactly one action visible. |
| Integration/performance | Final npx tsc --noEmit and npm test pass, including device/heat guards. No new perpetual loops, dynamic shadow lights or blur added. Cinematic/hold/pause checks retain sleeping states. Server8092 kept running; no commit/deploy. |

Browser scripts use entry-wallet fixtures where payment would otherwise prevent testing; ordinary gameplay runs do not inject scoring or player state. Controlled high-ball/possession fixtures prove their named exchange only. Native Safari/physical-phone temperature and subjective player enjoyment remain outside these automated checks; no AAA or bug-free claim.
