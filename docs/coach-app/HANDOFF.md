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
  Nov 16 pm: players who must play now are ranked by slack (field time owed beyond the field time left outside their own blocks
  in goal; "must" = short by more than half a block for a keeper-to-be, else by any); a rotating keeper for a later period is
  picked with a look-ahead (not kept yet, owed at least the period, leftover field time fits whole changes, most owed).
  `confirmChange` (the Done button) re-levels when a change is made 30 s or more off its time. `planWithLate` = the plan with late
  players brought in at their expected minute, exactly as the live re-plan on "Arrived" (test checks they match); arrivals are
  kept in `game.joined` and left out of the summary spread. Fairness meter limit: one change interval (the +90 s is gone).
- **Team "Late"**: the Coming pill cycles Coming → Late → Not coming; Late shows "Arrives around" (Not sure / every change
  interval). Store `late: {id: minute|null}` (only players coming; cleaned). Late players are not in the lineup; the live game
  starts from the players here (`startPlan`) with late ones "Not here yet"; the Plan tab shows `planWithLate`.
- **Sticky Start game**: sits in the flow on a paper band (gradient) 65 px + safe area above the tab bar; at the end of every
  tab the last item ends above the tab bar and the last change above the button (checked in the build).
- **Counters**: `ca:open`, `ca:game`, `ca:sub` (totals only) in `lib/analytics/countIds.ts` + labels in `daily.ts`;
  `countSince.generated.ts` regenerated.
- **Words** `lib/coach/words.ts` (en/es, glossary terms, "tú"; "banca" for bench). Language: `?lang=`, saved choice, then phone
  language; toggle in the top bar; sets `<html lang>` client-side (the app is one static page).

## Tests / checks
- `tests/coach-app.cjs` (in the npm test chain after tools-rotation): storage sanitize/versioning, plan property sweep over all
  presets × squad sizes × keeper modes (full field, totals = game × field, spread ≤ one block), 300-case re-plan sweep, injury
  re-plan, clock pause/resume/reload, scripted 2-period 7v7 game with an injury and a late arrival (everyone else 35–38 min),
  simulated 7v7 2×25, 11 players, keeper each half, injury 8:00 + late arrival 12:00: everyone there all game 31.5–36.5 min
  (was 31–36.5); 396-game sweep (formats × squad +1..+6 × keeper modes × injury/arrival timings): none over 1.5 intervals, none
  over one with nothing happening (before: 105 over one interval, worst 35 min); lagged Done (40 s) ≤ 1.25 intervals; late plan,
  share round trip + garbage, CSV, presets vs chart, noindex/manifest/SW scope (runs the SW's `inScope`), Spanish keys + banned
  words, front-door links. `COACH_SIM=1 node tests/coach-app.cjs` prints the simulated game log.
- `tests/seo-tools.cjs` allows `/coach` as a link target. tsc, `eslint . --quiet`, seo-tools, es-pages, tools-rotation,
  admin-analytics(-coverage, -daily), security-headers pass. Production build OK; `seo-crawl` 1200 URLs, 0 issues.
- Nov 16 pm re-verify (production build, port 9043): `scratchpad/coach-shots2/` (script `scratchpad/coach-shots2.cjs`): one
  manifest link `/coach/manifest.webmanifest`, Start game contrast 9.6, front-door pill 15.4, bottoms clear on every tab.
- Screenshots: `scratchpad/coach-shots/` (script `scratchpad/coach-shots.cjs <base> <worktree>`, Playwright + system Chrome
  with a fake clock: team → drag on pitch → plan → live → injury → reload → full game → summary → Spanish → front doors).

## Open / next
- Limits left: an injury or arrival mid-block can still cost up to ~1.4 intervals in 9v9/11v11 (10-min blocks) or small squads
  (blocks are whole); the meter then says "check", which is honest. Runs over time (stoppage) go to whoever is on at the end.
- A late player whose expected minute is a change time joins at the next change after it (as the live game does).
- Formations for 4v4/5v5 are one built-in shape each (no formation pages exist for them).
- One team per device (no team switcher). Undo history is in memory (lost on reload; the game itself is not).
- iOS ignores the manifest swap for name/icon in some versions; `apple-mobile-web-app-title` "Coach" + `/coach/icon-180.png`
  cover it. Screen Wake Lock falls back to a note where unsupported.
- The live clock is the phone's; the referee's watch wins: "+1 min" and "End half" are always one tap.
