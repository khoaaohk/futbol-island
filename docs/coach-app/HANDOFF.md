# Coach app (/coach), Nov 16 2026

Owner: "these tools need to feel like individual apps … simple for coaches to open on a phone while the game is happening."
Branch `coach-app` (from `spanish-r1`), not pushed.

## What it is
- **Route `/coach`** (`app/coach/layout.tsx`, `page.tsx`): no site header/footer, bottom tab bar Team · Lineup · Game · Summary,
  opens where the coach left off (a running game reopens the live screen after a reload). noindex: `robots` meta +
  `X-Robots-Tag` header (`next.config.mjs`). Not in the sitemap. The `/tools` lineup and planner pages are its SEO front doors
  ("Open the coach app" pill under the title; Spanish `/es/tools/...` link to `/coach?lang=es`).
- **Own manifest** `app/coach/manifest.webmanifest/route.ts` (id/start_url/scope `/coach`, icons in `public/coach/`). Next's
  file manifest (`app/manifest.ts`, the game) is linked on every page and beats `metadata.manifest`, so the layout runs an inline
  script that points the link at the coach manifest and CoachApp removes the duplicate React re-adds. Verified in a production
  build: first manifest link = `/coach/manifest.webmanifest`.
- **Service worker** `public/coach-sw.js`, registered only by CoachApp with `scope:'/coach'`; `inScope()` guard; network-first
  page with cached fallback, cache-first `/_next/static`. Verified: `/coach` controlled, `/play` and `/` have no registration,
  offline reload of `/coach` works.
- **Data** `lib/coach/store.ts`: one localStorage record `fi-coach-v1` (version 1; unknown versions ignored, every read cleaned:
  numbers 0–99 unique and required, names optional ≤24 chars, ≤30 players). Nothing leaves the device. Share link = plan in
  `#s=` fragment. CSV: BOM, CRLF, quoted, formula-defused.
- **Engine** `lib/coach/engine.ts` (pure): presets (4v4 4×10 no GK, 5v5 4×10, 7v7 2×25, 9v9 2×30, 11v11 2×35, futsal 2×20
  rolling; ages from the sourced chart in `lib/site/sizes.ts`), opening plan = `planRotation` (calculator) relabelled so the
  coach's lineup starts, spots follow players, re-plan (water-filling to level totals + greedy most-owed; the running block keeps
  players still owed time; rotating keepers' periods are reserved first), clock from timestamps, live-game reducers
  (kickOff, applyChange, delay, skip, setStatus hurt/left/late/ok, endCurrentPeriod), undo stack (30).
- **Counters**: `ca:open`, `ca:game`, `ca:sub` (totals only) in `lib/analytics/countIds.ts` + labels in `daily.ts`;
  `countSince.generated.ts` regenerated.
- **Words** `lib/coach/words.ts` (en/es, glossary terms, "tú"; "banca" for bench). Language: `?lang=`, saved choice, then phone
  language; toggle in the top bar; sets `<html lang>` client-side (the app is one static page).

## Tests / checks
- `tests/coach-app.cjs` (in the npm test chain after tools-rotation): storage sanitize/versioning, plan property sweep over all
  presets × squad sizes × keeper modes (full field, totals = game × field, spread ≤ one block), 300-case re-plan sweep, injury
  re-plan, clock pause/resume/reload, scripted 2-period 7v7 game with an injury and a late arrival (everyone else 35–38 min),
  share round trip + garbage, CSV, presets vs chart, noindex/manifest/SW scope (runs the SW's `inScope`), Spanish keys + banned
  words, front-door links. `COACH_SIM=1 node tests/coach-app.cjs` prints the simulated game log.
- `tests/seo-tools.cjs` allows `/coach` as a link target. tsc, `eslint . --quiet`, seo-tools, es-pages, tools-rotation,
  admin-analytics(-coverage, -daily), security-headers pass. Production build OK; `seo-crawl` 1200 URLs, 0 issues.
- Screenshots: `scratchpad/coach-shots/` (script `scratchpad/coach-shots.cjs <base> <worktree>`, Playwright + system Chrome
  with a fake clock: team → drag on pitch → plan → live → injury → reload → full game → summary → Spanish → front doors).

## Open / next
- Rotating-keeper games with an injury land around 32–38 min (one keeper's whole period is a big block); the meter calls a
  spread over one change interval + 90 s "uneven". A smarter keeper choice (look ahead at owed time) would tighten it.
- Late arrivals are marked from the live bench sheet ("Not here yet" → "Arrived"); there is no pre-game "late" toggle on Team.
- Formations for 4v4/5v5 are one built-in shape each (no formation pages exist for them).
- One team per device (no team switcher). Undo history is in memory (lost on reload; the game itself is not).
- iOS ignores the manifest swap for name/icon in some versions; `apple-mobile-web-app-title` "Coach" + `/coach/icon-180.png`
  cover it. Screen Wake Lock falls back to a note where unsupported.
- The live clock is the phone's; the referee's watch wins: "+1 min" and "End half" are always one tap.
