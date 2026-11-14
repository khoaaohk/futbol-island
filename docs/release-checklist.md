# Release checklist (before any push to main)

Added Nov 13 2026. On Nov 5 and Nov 12 nobody could fish (0 Fish taps, 0 casts, 0 fishing minutes over 38-57 sessions) while
1,000+ node unit tests stayed green, because none of them plays the real game in a browser. A push now needs one command:

```sh
npm run release:check
```

It runs, in order, and stops at the first failure:

1. `npm run test:quiet`: the whole node suite (scripts/run-tests.cjs).
2. `npm run build:quiet`: a production build (into `NEXT_DIST_DIR`, default `.next`).
3. `npm run smoke:fishing`: **can a kid fish?** (scripts/smoke-fishing.mjs, about 1.5 minutes).

Agents and parallel sessions: give the build and the smoke their own dist dir and port, and never use 8092 or `.next-dev`:

```sh
NEXT_DIST_DIR=.next-release SMOKE_PORT=8984 npm run release:check
```

(`next build` adds the dist dir's types to `tsconfig.json`; `git checkout tsconfig.json` afterwards unless it is `.next`.)
Don't run it while other agents run a suite or a build on a 16 GB Mac; stagger them.

## smoke:fishing

Plays a production build (`next start`, started and stopped by the script) in headless Chromium (`--mute-audio`) through
Playwright, as a brand-new player, on a phone (390x844, touch) and a desktop (1440x900):

| Step | What must happen |
| --- | --- |
| open /play as a new player and skip the welcome | Start → Play (saving reads as "taking a break") → Skip |
| get on foot | the travel-mode button is tapped until the ride is `walk` (a new player arrives on the jetpack) |
| go to `<spot>` | `window.__fi2.teleport` to the spot's stand (positions read from lib/town/fishing/fishSpots.ts) |
| Fish button shows | the real `[data-fish-enter]` button is visible, enabled, on screen, not covered, and for that spot |
| tap Fish: fishing starts | the fishing HUD reaches `ready` |
| cast: the float lands | a tap on the reel casts, and `fishing-live` (float and line) is in the scene |
| bite / reel in | waits for the bite, hooks it and spins the reel (touch or mouse) until the fish lands; a fish that gets away is retried (3 at most) |
| the catch shows and goes in the Fishbook | the catch card shows and `fi2-fishbook-v1` is saved |
| stop fishing | the "Catch a fish" card offer is answered and Stop closes the HUD |
| analytics counted fi:start, fi:cast and fi:land | one of each per spot, read from `window.__fi2.counts` |

Spots: `south-pier` (a classic shore spot) and `park-pond` (the Stadium Park pond). Change them with
`SMOKE_SPOTS=south-pier,north-point`; one viewport with `SMOKE_ONLY=phone`; an already-running server with
`SMOKE_URL=http://localhost:8984`.

On a failure it prints `smoke:fishing FAIL at step "<viewport> · <step>"` with the reason and a screenshot path
(`SMOKE_SHOTS`, default a new temp folder), and exits 1.

**Nothing reaches a real server.** The visit counter is off anyway (it only mounts on Vercel production and skips automated
browsers and localhost); the script also answers `/api/visit`, `/api/error-report`, `/api/csp-report` and `/api/save/*`
itself, so even a build with the save server's keys never makes a save code.

### Test-only hooks it uses

- `window.__fi2.teleport` (existing, Nov 8 2026): off on production hosts (lib/dev/debugHooks.ts `debugMoveHooksAllowed`).
- `window.__fi2.counts()` (Nov 13 2026): the analytics count probe. `count()` in lib/analytics/tracker.ts also tallies every
  allowlisted id into a probe map, but only after `startCountProbe()` runs, which components/Town.tsx does only when
  lib/dev/debugHooks.ts `countProbeAllowed(hostname, window.__fiCountProbe)` says so: never on a production host, and only when
  the page set `window.__fiCountProbe = true` before it loaded (the smoke's init script). tests/debug-hooks.cjs checks both gates.

### More "can a kid reach X" checks

scripts/smoke/kid-steps.mjs holds the reusable steps: `startServer`, `preparePage`, `newIsland`, `onFoot`, `gotoSpot`,
`waitHud`, `tapHud`, `pointer` (finger or mouse), `answerPopups`, `counts`, `screenshot`, and `createRun().step(name, fn)` for
named steps. A new check (say `smoke:arcade`) is a short script on top of them; add it to `release:check` after `smoke:fishing`.
