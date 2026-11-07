# /admin analytics accuracy audit (Nov 6 2026)

Owner request: "audit and make sure the data is correct. Log in, take screenshots and compare all the data. Make sure the
numbers line up and are accurate and built correctly."

## How it was done, and what could not be done

- **No production data was read.** This checkout has no `ADMIN_PASSWORD` and no `SUPABASE_SERVICE_ROLE_KEY` (only the
  public anon key, which the analytics tables correctly refuse: `42501 permission denied` on `analytics_daily_pt`,
  `analytics_beats`, `analytics_sessions`, `analytics_salts`, `analytics_daily`, checked with zero-row requests). So the live
  numbers (Players 208, 18.3 a day, …) could not be recomputed from the database. Nothing was written anywhere.
- Instead: a **synthetic dataset with a known answer** (13 Pacific days Oct 25 – Nov 6, 327 sessions, a DST change on Nov 1,
  sessions at 00:05 and 23:55 Pacific, every headline counter, live matches from Nov 5, investor-page visits, walking emotes)
  was loaded into the project's own memory store (`ANALYTICS_LOCAL_FILE`). A plain script computed the truth independently;
  the project's `buildReport` and the real `/admin` UI (own dev server, port 8137, own `NEXT_DIST_DIR`, a throwaway local
  password) were compared against it, and every tab was screenshotted. The Supabase-only panels (Players count, Returning
  share, device/country split, Live, party retention, relay health) say "Not available here" on a memory store; their SQL is
  covered by the existing throwaway-Postgres tests (`admin-analytics-day.cjs`, `admin-analytics-live.cjs`, …), re-run green.
- The owner's export (`futbol-island-engagement-2026-10-07-to-2026-11-06.csv`) was checked for internal consistency and
  against the code that writes it.

## Inventory (headline numbers)

| Tab | Number | Definition (as built) | Source | Verified | Seen vs truth (synthetic) |
|---|---|---|---|---|---|
| Overview | Players | distinct `player_id` (save code, else device) with a session started in range; raw rows only (last 14 days); sessions without an id are left out | SQL `analytics_players` (20261019_analytics_day_sessions.sql:258) via /api/admin/players | SQL by test; n/a locally | — (needs Supabase) |
| Overview | Players per day | average of daily unique visitors over complete days, from the first tracked day | report.ts:63 `perDayOf` → sponsor.ts:234 | yes | **was 13.23, truth 13.08 → fixed, 13.1** |
| Overview | Returning sessions | sessions with `is_returning` true ÷ (true + false), unknown left out; raw rows only | SQL `analytics_sources_summary` (20261018_analytics_live.sql:173) | SQL by test | — |
| Overview | Avg session | Σ foreground ms ÷ sessions (range, today so far included) | sponsor.ts:235 | yes | 5.28 min = 5.28 |
| Overview | Sessions (CSV) | sessions that started in the range's Pacific days | core.ts:405 `rollupDay`, :482 `mergeRollups` | yes | 327 = 327 |
| Overview | Games played | Σ `en:game_*` + `su:kick_play` | sponsor.ts:111 | yes | 128 = 128 |
| Overview | Cards found | Σ `en:card_*` (new cards only; starter kit counts each card) | sponsor.ts:129, sponsorEvents.ts:19 | yes | 289 = 289 |
| Overview | Videos & stories | Σ `le:*` + `en:film_end` + `en:bookend_*` + `tu:finish` | sponsor.ts:135 | yes | 130 = 130 |
| Overview | Quizzes taken | Σ `ls:*` (starts, replays count) | sponsor.ts:157 | yes | 106 = 106 |
| Overview | Minutes with friends | Σ `mp:min` | sponsor.ts:164 | yes | 296 = 296 |
| Overview | Emotes used | Σ `em:e<n>` over the emote groups | sponsor.ts:86–88 | yes | **was 61, truth 94 → fixed** |
| Overview | T-shirts / cleats | Σ `sh:save_jersey` / `sh:save_boots` | sponsor.ts:116,122 | yes (0 = 0) | 0 = 0 |
| Overview | Change vs prior N days | same-length period before, like-for-like cut when the range ends today | report.ts:89–115 | yes | **was "new vs (0)" / CSV 0 with no data before → fixed: "nothing to compare"** |
| Players | Player-days, ≈ a day | Σ daily visitors; ≈ = perDayOf | OverviewSection.tsx:52–56 | yes | 172 = 172; 13 = 13.08 |
| Players | Visitors/sessions/page views chart | per Pacific day (hour for one day) | core.ts:519,535 | yes | daily rows match |
| Engagement | Median visit / average / bounce | median interpolated inside 22 length buckets (an estimate); bounce = ≤1 page and <10 s | core.ts:458, 385 | yes | avg 5 min 17 s = truth |
| Live matches | Pitch visits / joins / players | Σ `lm:<f>_visit`, Σ `lm:<f>_join`, sessions with `lm:reach_1`; exact (MIN 1) | liveMatchReport.ts:50–95 | yes | 37/26/26 = truth |
| Live matches | a week, play share | joins ÷ days × 7; players ÷ sessions | liveMatchReport.ts:58,91–92 | yes | **was 14 a week over 13 days and 8%; truth 91 over 2 days and 42% → fixed** |
| Live matches | Minutes, average, median | 60·min + sec over finished matches; median read inside length bands ("about") | liveMatchReport.ts:43,59 | yes | 65 min, 2 min 30 s = truth |
| Marketing page | views, avg time, bounce, play funnel | `mk:*`, exact | marketingReport.ts:37–66 | code read; no synthetic mk data | — |
| Marketing page | Investor page visits, avg stay, places, hours | `mm:*` (+ server `mm:g_/gm_/gx_/h_`), exact | marketingVisitReport.ts:45–64, marketingVisitGeo.ts:45 | yes | 54 visits, 83 s = truth |
| Live | On now | sessions with a start or beat in the last 5 min | store.ts:110 / SQL `analytics_live` | code read | 0 (no recent data) |
| Sponsor report | weekly KPIs | merged week vs merged previous week; groups <10 hidden | sponsorReport.ts:95–152, route | yes | **in-progress week was compared with a whole week (−26% on Friday) → fixed** |
| Engagement sections | Island, Learning, Summit, Fishing, Water, Friends, Emotes, Party retention | counter sums, `<5` under 5 sessions | overview.ts, learning.ts, partyReport.ts, partyRetention.ts | existing tests green | not seeded |

## Discrepancies found, cause, fix

1. **Players per day disagreed between tabs** (Overview + CSV vs Players tab). sponsor.ts divided all visitor-days by all
   days, including today's partial day (and would include pre-launch days), while the Players tab and the "How these are
   counted" text use complete days only. The owner's 18.3 is therefore visitor-days ÷ 31 with Nov 6 partial; the
   complete-days figure is a little different. Fix: report.ts passes `perDayOf` into `buildSponsor`.
2. **"Emotes used" left out walking/running emotes** (wire ids 50–59, added Oct 23) while the Emotes section counts
   `em:pick`. The owner's "50" is low by however many moving emotes were played. Fix: a "Walking or running" part.
3. **"Previous period 0" was not real.** Counting began Oct 7 (`TRACKING_START`), so Sep 6 – Oct 6 has no rows; the CSV
   printed 0 and the cards "new vs (0)". Fix: a previous period with no session on any day is no previous period (tiles say
   "nothing to compare with …", the CSV leaves it blank and its header says so).
4. **Live matches "a week" and "% of sessions"** divided by the whole range (e.g. 31 days) although counting began Nov 5,
   so a 30-day view read ~15× too low. Fix: both use the days (and sessions) since `LM_SINCE`.
5. **Live matches header promised "<5"** while every count is exact (MIN 1) and rendered "fewer than 1 sessions". Fixed text.
6. **Weekly Sponsor report** compared the week so far with all of last week. Fix: changes withheld (with a note) until the
   week has ended.
7. Labels: the "Returning players" tile is a share of sessions → "Returning sessions" (matches the CSV); "— no the same 12
   days … to compare" → "— nothing to compare with …".

Regression tests: tests/admin-sponsor.cjs (walking emotes, in-progress week), tests/admin-analytics-pacific.cjs (players per
day equal across tabs, no previous period before tracking, CSV), tests/admin-analytics-live-matches.cjs (partial range,
no "<5"), tests/admin-save-metrics.cjs (fixture gets a session before its week; "nothing before" asserted).

## Not fixed (and why)

- **Party retention runs on UTC "today"** (`analytics_party_retention`, 20261022_analytics_party_retention.sql:35–37, and
  partyRetention.ts:71) while sessions are Pacific days: after 4–5 pm Pacific, today's partial day counts as complete, so
  D1 rates read low in the evening. Needs a new SQL migration; no migrations in this audit.
- **Opening the dashboard writes**: `loadPartyRetention` calls `analytics_sponsor_week_snapshot` (an idempotent insert).
  Harmless, but /admin is not strictly read-only.
- **`<5` remains** on Overview cards/parts, Players tab, Learning, Summit/Kit, Water, Friends, Emotes, Fishing rows from
  `overview.fishing` (FishingSection.tsx is being changed by the fishing agent) and the weekly report (`<10`). It is the
  privacy-policy rule; making them exact is an owner + policy decision. Live matches, Marketing page, Investor page visits
  and the new fishing funnel are exact.
- Rounding: per-format minutes are rounded one by one, so they can sum to ±1 of the total (66 vs 65 in the test data).

## Data-quality caveats for the owner

- The export mixes windows: Players and Returning are the **last 14 days only** (raw rows), everything else is the range.
- Players exclude sessions without a player id; Returning ignores sessions that did not send the flag.
- Returning is a share of **sessions** (heavy players weigh more), from a device mark, not a person.
- Medians are **estimated** inside bands (session length, match length, page stay); averages are exact.
- Starter-kit cards (135 of 315) are one per card given, not per player choice.
- Counters ride the beat (≤64 ids, ≤50 per id per beat, carried to the next beat); a tab closed abruptly can lose its last
  minute of counters. DNT/GPC, bots, previews, admin tabs and localhost are never counted, so all totals are floors.
- Save-code tiles run on **UTC** dates; everything else is Pacific.
- Small-number thresholds differ: sponsor/overview 5, Sources SQL 3, weekly report 10, Live matches/Marketing none.
- Owner CSV checks out internally: games 21 = 7 + 14 in five "<5" parts, cards 315 = 308 + 7, videos 67 = 64 + 3, emotes
  50 = 37 + 13 (but see item 2: walking emotes were missing from that 50).

## Fishing (separate, other agent's lane)

The fishing funnel (`fishingFunnel.ts`) is exact and its tests pass; the older fishing rows in FishingSection still use
`<5`. Not seeded, not edited here.

## Re-run the audit

1. `node <scratch>/audit/seed.cjs <dir> <nowIso>` writes `store.json` + `truth.json` (synthetic, with the expected numbers).
2. `node <scratch>/audit/check.cjs <repo> <dir> <nowIso>` builds the report with the project's code: every row must say OK.
3. For the UI: `ADMIN_PASSWORD=<throwaway> ANALYTICS_LOCAL_FILE=<dir>/live-store.json NEXT_DIST_DIR=.next-audit npx next dev -p <own port>`,
   then `node <scratch>/audit/shots.cjs <repo> <dir>` (signs in, picks All, screenshots each tab at 1280×800 and 390×844,
   saves the CSV). Kill the server by port, delete the dist dir, remove the tsconfig include Next adds.
4. Against production: needs `ADMIN_PASSWORD` (sign in) and, for an independent recount, `SUPABASE_SERVICE_ROLE_KEY` with
   read-only `select analytics_days(…)` / `analytics_players(…)` calls; compare with the Overview CSV for the same range.
5. Tests: `npx tsc --noEmit`, `node tests/admin-analytics*.cjs tests/admin-sponsor.cjs tests/admin-save-metrics.cjs`,
   `npm run test:quiet`.
