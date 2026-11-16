# Scan Trainer (/scan), Nov 16 2026

Owner saw soccer-scanner.com (a phone on a cone flashes cues; the player checks the shoulder and calls them). This is our own
version of that common training idea: own words, own layout, own drills. Branch `scan-trainer` (from origin/main), not pushed.

## Route choice: its own app at `/scan`, not a tab in `/coach`
- Different moment: `/coach` is game day (lineup, subs clock, bottom tab bar); Scan Trainer is practice, with the phone propped
  on a cone, full screen. A fifth tab plus a full-screen mode would fight the coach app's tab bar and Start-game dock.
- Its own home-screen icon ("Scan") opens straight to Start. The shell is the coach app's pattern copied (layout, manifest route,
  SW), about 60 lines.

## What it is
- **App** `app/scan/{layout,page}.tsx`, `components/scan/ScanApp.tsx` + `scan.module.css`. Settings → 3-2-1 → full-screen cue
  (tap anywhere to pause: Resume / End session) → summary (cues shown, time, "12 of 14", new best / to beat) → Go again /
  Change settings. Wake Lock during a run (note in the pause sheet when unsupported), Fullscreen API on Start, WebAudio sounds
  (tick / pop / bell, created on the Start tap; 3-2-1 beeps), `?lang=es` / saved / phone language, `<html lang>` set client-side.
- **Modes** colours, numbers (1–9, 1–20, 0–99), arrows (any of 8 directions, ≥2), mix, **Pass it** (teammate number 1..N + the
  direction they stand in; ties to the passing-and-support lessons). Interval 1–6 s in 0.5 steps, session 60 s / 90 s / 3 min /
  endless, coloured background on/off (off = disc on black), colour name on screen (colour-blind players), coach score on/off.
- **Age presets** U8, U10, U12, U14+, Adult (`PRESETS` in `lib/scan/engine.ts`; never change the coach's colours). The front
  door's age table must equal these (tested).
- **Engine** `lib/scan/engine.ts` (pure): `cleanSettings`, `nextCue` (never repeats the cue on screen, also with a stuck random),
  `seeded`, the timestamp run clock (`startRun/pauseRun/resumeRun/phaseAt/cuesIn`), `tally`, `better`.
- **Data** `lib/scan/store.ts`: localStorage `fi-scan-v1` (settings, lang, last/best result per mode). NEVER_KEYS in
  `lib/saves/snapshot.ts`. Nothing sent.
- **Shell** `app/scan/manifest.webmanifest/route.ts` (id/start/scope `/scan`, display fullscreen, icons `public/scan/`),
  `public/scan-sw.js` (copy of coach-sw; scope `/scan`; `inScope` = `/scan` or `/scan/…`; cache `fi-scan-sw-v1`).
  `next.config.mjs`: X-Robots-Tag noindex on `/scan`, `/scan/*`, `/scan-sw.js` (no-cache).
- **Counters** `sn:start`, `sn:finish` (`SCAN_COUNT_EVENTS` in countIds.ts, labels in daily.ts, countSince regenerated).
  Page key `scan` in `lib/analytics/pageKeys.ts`.
- **Words** `lib/scan/words.ts` (en/es; US spelling "color"; Spanish per the glossary).

## SEO front door
- `/tools/soccer-scanning-trainer` (`app/(site)/tools/soccer-scanning-trainer/page.tsx`), body shared with Spanish
  (`components/site/tools/ScanTrainerPage.tsx`); words `lib/site/tools/scanTrainer.ts` + `lib/i18n/es/scanTrainer.ts` (1:1).
  Answer first ("What is scanning in soccer?"), drawn sample cues, how to use, interval-by-age table, settings, six original
  drills with grid diagrams (scan and call, check and turn, rondo with a caller, arrow turns, color sprint, pass it), tips,
  embed snippet, FAQ (5) and related lessons/drills/terms. JSON-LD: BreadcrumbList, WebApplication, HowTo, FAQPage.
- In `TOOL_PAGES` (kind `scan`, hub-level → sitemap, llms.txt, llms-full, search index, "More to learn"); `/tools` and
  `/es/tools` have a "Practice tools" section. Share picture `public/tools/soccer-scanning-trainer.png` (1200×630, drawn
  from the app's cue styles by `scratchpad/scan-og.cjs`). No scanning video clip exists, so none is used.
- Embed `/embed/soccer-scanning-trainer` (static segment beside `[tool]`): the app with `embed` (no SW, manifest swap or
  counters), privacy line, one attribution link; snippet `allow="screen-wake-lock"`.

## Tests
- `tests/scan-trainer.cjs` (npm test chain after coach-app): settings sanitize, presets, cue generator over every mode/range
  (1500 cues × 45 cases: settings respected, no immediate repeat, stuck random), colour/ink contrast ≥ 4.5, run clock, score,
  store, shell (noindex, manifest, SW scope incl. `/scanner`, `/coach`, `/play`), counters, front door EN + ES (FAQ/HowTo match
  the page, links resolve, ES parity + banned words), embed headers.
- `tests/seo-tools.cjs` updated for the 20th tool page.

## Open / next
- Sounds are synthesized; no voice ("call it out" is the player's job). A spoken cue for solo practice could be added.
- The OG picture is a drawing of the cue screens, not a device photo.
- Spanish embed is English (like the other embeds).
