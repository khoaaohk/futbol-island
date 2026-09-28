# Daily active-play coins

Local implementation, not deployed by this pass.

**Economy pass (28 Sep 2026):** the bonus is now **30** (`DAILY_PLAY_COINS`). Receipts saved at 40 before the change are kept whole (`LEGACY_DAILY_PLAY_MAX=40` in `sanitizeArcadeWallet`), so no balance shrinks. The toast reads the constant.

Players earned 40 coins (now 30) once per browser-local calendar day after 30 seconds of on-foot island movement. Both direction input and actual displacement are required. Walking/dribbling qualifies; opening the island, waiting, watching matches, camera motion, loading, menus, hidden tabs, flying and riding an automatic truck do not. This first integration does not count arcade or stationary fishing time.

The existing Town frame callback supplies capped active deltas to `lib/town/dailyPlay.ts`; there is no timer, polling, extra render loop or React update while accumulating. A date boundary is calculated on demand. Unfinished progress is session-local; reloading starts that day's unfinished 30 seconds again. Completed rewards persist.

The wallet stores `daily-play:YYYY-MM-DD` as a distinct Island earning with a 40-coin cap. Regular island rewards remain capped at20. The existing50,000 testing grant is preserved. Daily IDs are reserved from ordinary credit calls. Payment requires the shared browser lock and durable storage, so concurrent tabs pay once and storage failure never creates temporary money. Failed claims may retry after five further active seconds. There is no payout from wallet load.

A successful new grant dispatches one event into the existing IslandJobs toast. It updates the normal wallet and briefly shows '+40 daily play coins' without blocking play. Existing toast timeout is reused; no new animation or audio loop.

Validation: `tests/daily-play.cjs` covers no-on-load payment, idle/hidden exclusion, suspended-frame delta cap,30-second qualification, local midnight reset, reload idempotency, two wallets/tabs under the shared lock, persistence failure/retry and reserved IDs/ordinary caps. Shared wallet and home-ledger suites passed; TypeScript and diff checks passed. `scripts/check-daily-play-browser.cjs` passed:31 seconds idle earned nothing; the normal R control landed the character, ordinary WASD movement earned40, and reload retained exactly one receipt. Initial flight-only movement also earned nothing as intended. Screenshot: `/tmp/daily-play-earned.png`. Native-phone heat is not measured.
