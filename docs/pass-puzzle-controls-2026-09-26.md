# Pass Puzzle controls and navigation — September 26

Thesis: spot the free teammate or space, draw the intended pass, then learn from its visible outcome.

## Defects found in code

- The navigation header sat below the fullscreen chooser/brief/result overlay (z-index 3 versus 4), so Back could be visible but unclickable. Its behavior also changed between leaving the game and opening the puzzle list.
- The 7v7/9v9/11v11 buttons changed coaching wording, but did not explain that distinction. Twenty puzzle cards appeared together across four topics.
- Drawing stopped accepting positions after 400 samples, ignored the release position, and withheld the raw stroke until a prediction existed. Fixed world-distance filtering looked coarser in some camera regions. A canceled gesture could survive a window blur or navigation.

## Changes

Persistent Arcade navigation calls the supplied exit callback from every view; the separate Puzzles control opens the chooser. The header is above all puzzle cards. Coaching formats now have descriptive labels and explain their effect; four named topic selectors expose one group of five puzzles at a time. Start puzzle describes the primary action directly.

Pointer drawing accepts bounded coalesced samples, retains the exact latest/release endpoint, and compacts old samples instead of freezing. The fixed 256-vertex visual stroke uses midpoint interpolation while physics continues to read the original gesture. Raw ink updates separately from prediction, which is capped at one update per 80 ms while moving/charging. No new render loop is added. Blur, hidden state, lost capture and navigation cancel without kicking; settled chooser/brief states explicitly sleep even when entered during flight.

## Validation

- TypeScript passes.
- New bounded drawing test retains origin, live endpoint and sample order over 2,000 samples with at most 128 retained points.
- Existing engine suite passes, including deterministic simulation, stroke kinds/curl/loft/power, replay and prediction.
- All 20 scenario solutions pass; every naive option is stopped; existing sloppy-stroke cases pass 94/96.
- Direct-route desktop/touch browser test: `scripts/check-pass-puzzle-controls.cjs` covers exit/reentry, coaching/topic selection, curve preview endpoint, held loft, cancellation, ordinary failure/retry/pass/finish and chooser sleep. PASS on both desktop and 390×844 touch emulation, executed by the root agent. Real drawing produced a 46-vertex smooth preview ending exactly at pitch coordinate (8.5,16); ordinary input caused a failure, retry, completed pass and goal. Cancellation, chooser sleep and exit/reentry passed. No browser errors. The initial approval wait was aborted before launch; the later root execution is the verification evidence.

Local only. Desktop emulation does not establish physical phone temperature or native Safari behavior.

## Captures

`/tmp/pass-puzzle-controls-mobile-chooser.png`, `-draw.png`, and `-success.png`; matching `desktop` captures show the same navigation, direct drawing and ordinary result flow.
