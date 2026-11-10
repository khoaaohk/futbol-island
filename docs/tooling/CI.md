# CI (GitHub Actions), Nov 10 2026

`.github/workflows/ci.yml` runs on every push to any branch and on pull requests. It only checks: no deploy steps, no
secrets, only `actions/checkout@v4` and `actions/setup-node@v4`. Vercel still deploys every push to `main` by itself,
so CI tells you whether a commit is good; it does not stop the deploy (turn on branch protection + PRs if you want that).
Permissions `contents: read`; a newer push to the same branch cancels the older run; each job times out at 25 minutes.

## Jobs (run in parallel, Node 20 = the local `node -v`; there is no `.nvmrc` or `engines`)

| Job | Command | Local time (M-series Mac, Nov 10) |
|---|---|---|
| Typecheck (app) | `npx tsc --noEmit -p .` | ~9 s |
| Typecheck (relay) | `npx tsc --noEmit -p multiplayer/relay` (excluded from the root tsconfig) | <1 s |
| Lint | `npm run lint` (rules: docs/tooling/LINT.md) | ~42 s cold, a few s with the cache |
| Core tests | `npm run test:quiet -- --core --jobs 3` (412 tests) | 324 s, 412/412 passed |

Each job also spends ~30-60 s on `npm ci` (npm cache restored by setup-node). Expect a GitHub run of ~7-9 minutes,
bounded by the test job (hosted runners are slower than an M-series Mac).

## Test job details

- The `runner-*` suites (runner-feel, runner-upgrade-oct25, runner-polish-nov8, breakaway-r3-routes) need Node >= 23
  for TypeScript hooks and look for it in `$NODE22` (locally `/opt/homebrew/bin/node`). The job installs Node 24 first,
  exports its path as `NODE22`, then installs Node 20 for everything else.
- The SQL parts of admin-analytics*, game-saves, arcade-leaderboard etc. start a throwaway Postgres if `initdb`/`pg_ctl`/
  `psql` exist; ubuntu-latest ships PostgreSQL in `/usr/lib/postgresql/<v>/bin`, which the tests already search. Set
  `SKIP_PG_TESTS=1` on the step if that ever breaks.
- Browser checks self-skip: shop-ball/shop-sheet only launch Playwright when `BALL_LAB_URL`/`SHEET_LAB_URL` is set,
  card-collection runs with `FI_SKIP_BROWSER=1` (manifest `env`), bean-skin is not in the core set. Tests that need the
  dev server on :8092 are already in `tests/quarantine.json`.
- The TypeScript transpile cache goes to `~/.npm/_fi-ts-transpile` (`FI_TS_CACHE_DIR`) so setup-node's npm cache carries
  it; the test job's cache key also hashes `tests/manifest.json` so it gets its own entry. tennis-hold-power runs without
  the cache (manifest `noCache`). gashapon-viewer can flake under load; the runner retries a failure once alone.

## Excluded on CI

`tests/manifest.json` has a `ciSkip` map (`file: reason`) that `scripts/run-tests.cjs` honours only when `CI=true`
(GitHub sets it). It is **empty today**: a full `CI=true` core run passed 412/412 locally and a grep of the core set for
chromium/playwright/puppeteer/localhost:8092//opt/homebrew//Users//sips found only gated or false-positive hits. Add an
entry (instead of editing or deleting a test) when a test needs something a hosted runner lacks.

## Run the same checks locally

    npm run check                          # typecheck + typecheck:relay + lint, stops at the first failure
    npm run test:quiet -- --core --jobs 3  # core tests
    CI=true npm run test:quiet -- --core --list   # what CI would run

## Notes

- CI uses the committed `package-lock.json` (`npm ci`): commit it together with `package.json` (eslint was added Nov 10)
  or every job fails at install.
- GitHub Actions minutes: the repo is public today (free, unlimited standard runners). If it is made private, these four
  jobs bill against the account's included minutes (2,000/month on Free) at roughly 4 x run length per push.
