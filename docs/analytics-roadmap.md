# Admin analytics: what to measure next (research, Oct 8 2026)

**Oct 22 2026:** Play with friends, emotes and the sponsor report have their own plan, [docs/analytics-multiplayer-plan.md](analytics-multiplayer-plan.md).
Phase A (the `mp:` / `em:` counters, the "Friends & parties" and "Emotes" admin sections, the privacy-policy wording) is built;
Phase B (relay counters, sponsor report) and C (retention, virality) are not.

Research only; nothing below is built yet. Privacy rules: fixed ids, totals only, no event order, no IDs, no typed text, no fingerprinting, no third-party SDKs.

**Foundation (1–2 days):** a generic allowlisted counter channel. `count(id,n)` in lib/analytics/tracker.ts, drained into the existing beat as `k:{id:n}` (≤64 keys); an optional `f` flags field on `start`; validation in core.ts; a `counts` jsonb column on analytics_beats; a rollup of `counts` + `countSessions` (sessions with id ≥1, which makes funnels work without IDs).

## Ranked proposals
1. **Lesson funnel per lesson:** opened → watched → quiz started → finished → all correct. Hooks in components/FieldLearning.tsx (select ~65, startQuiz ~70, nextQuestion/earnForQuiz ~84, finished ~95). 96 lessons × 5 stages.
2. **Quiz item analysis:** first-try % correct and distractor choice per question (FieldLearning.tsx:71 `choose`). Classical test theory: target p ≈ 0.30–0.92; distractors under 3% aren't plausible. Discrimination is impossible without IDs, which is accepted.
3. **Onboarding funnel:** per-step dismiss rate (IslandOnboarding.tsx steps; lib/town/onboarding.ts), plus "first lesson opened in the same session".
4. **Errors:** window error / unhandledrejection / webglcontextlost on the island / WebGL unavailable (Town.tsx:382) / chunk_load / catalog_load / audio_fail. Fixed classes only, never messages or stacks.
5. **Load time and heat:** time-to-island-ready buckets (Town.tsx setSceneReady), time per heat tier and tier changes (lib/graphics/heatTier.ts), frame-time histogram from ThermalGovernor windows, battery-saver share.
6. **Returning-visitor bucket:** read `fi2-last-visit-day-v1` (lib/town/welcomeBack.ts) once at start, before checkWelcomeBack overwrites it; send new / same day / 1d / 2–7d / 8–30d / 30+. Use hasSavedProgress for "new". Conditions:
   - disclose it in the grown-ups / privacy copy;
   - add a "Don't count my visits" toggle;
   - flag lifetime ≤13 months;
   - never use it for streak or comeback nudges (AADC Std 13).
   COPPA internal-operations notice and retention policy (2025 Rule §312.4(d), §312.10); EU ePrivacy 5(3) with the CNIL audience-measurement exemption; UK PECR statistical exception.
7. **Progress-depth bucket on start:** lessons completed 0 / 1–3 / 4–11 / 12+, and graduations.
8. **Paths format share and graduations per day;** warm-up reviews.
9. **Content completion:** card offers by kind, card films finished, pop-up books finished, ball-hunt finds, museum opens, fishing catches by rarity, jobs done.
10. **Coin economy:** earn vs spend by source/sink (arcadeWalletCore.ts, vendingWallet.ts, jobWallet.ts).
11. **Arcade outcomes:** plays and furthest level/stars buckets.
12. **Settings at start:** a bitmask of muted / music / voice / controls, plus the coach voice. Voice-off is a learning risk.

**Order:**
- Quick wins after the foundation: 1, 2, 3, 7, 8, 12, then 9 and 11.
- Bigger: 4, 5, 6, 10.
- Suppress dashboard cells under 5 sessions/day.

**Don't track:**
- event sequences or per-session vectors;
- install IDs;
- typed text or player names;
- fingerprint signals (GPU renderer, exact screen, timezone, languages);
- raw errors or URLs;
- city or exact timestamps;
- third-party SDKs (Apple 1.3 / 5.1.4);
- persistent A/B assignment.

## Sources
- COPPA §312.2: https://www.law.cornell.edu/cfr/text/16/312.2
- 2025 COPPA amendments: https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule
- EDPB Guidelines 2/2023: https://edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf
- CNIL audience measurement: https://www.cnil.fr/en/sheet-ndeg16-use-analytics-your-websites-and-applications
- ICO Children's code: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/code-standards/
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Retention benchmarks (GameAnalytics medians D1 ~22%, D7 ~4%, D30 ~0.7%, all genres): https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks
- Item statistics: https://assess.com/item-statistics-classical-test-theory/

This is not legal advice. The 2025 COPPA text and the UK commencement date were checked from secondary sources only.

## Start page tracking (Oct 9 2026)
- **Oct 9 2026 update:** the title screen moved from /start to `/` (/start was removed). The taps count while `/` shows the title
  screen (VisitTracker: `pathname==='/'` and the root view is `landing`, lib/rootView.ts); the Stripe return is `/?coffee=thanks`;
  "Began on /start" now only covers sessions recorded before the move. The notes below are as first written.
- **What:** /admin → "Start page" (after the headline numbers): visitors and sessions to /start, its countries / sources /
  referrers / campaigns / devices, the title-screen funnels (Start → code made → code check → Play; I have a save code →
  restored / failed → Play; returning → Play; saving break → Play), For grown-ups (each link, Donate → grown-up check → $5/$10/$15/$25,
  donations completed on the Stripe return `/start?coffee=thanks`) and Privacy (opened from the link vs from For grown-ups, contents taps).
- **How:** fixed counter ids on the existing beat channel (`lib/analytics/startIds.ts`: `st:*`, `sg:*`, `sp:*`, all on the
  allowlist in countIds.ts; the COUNT_KEY_RE grammar was enough). ONE passive capture click listener on window
  (`lib/analytics/startEvents.ts`, mounted by VisitTracker on /start only) counts the `data-track` id of the tapped element;
  Play buttons count by their card. Outcomes (code made, restore ok/failed, which-word first pick, card shown, gate pass/cancel)
  are one call where they happen. No new requests, no timers, nothing read from the page but those attributes.
- **Storage:** taps need no migration (the SQL ingest checks only an id's shape). The /start-only visitor split does:
  `supabase/migrations/20261009_analytics_start.sql` (additive: replaces analytics_day_rollup, adds a `start` object, schema 4;
  last row `OK, start page installed (analytics schema 4)`). Until it runs, /admin shows the banner and the taps.
- **Privacy:** totals per fixed id, exact numbers in /admin since Nov 6 2026 (the sponsor tab still withholds totals under 5 sessions as "<5"); privacy policy §7 gained one bullet.
- **Tests:** tests/admin-analytics-start.cjs (ids, listener, hooks, funnel maths, /start subset incl. SQL = TypeScript, suppression,
  no free text).

## Live matches (Nov 5 2026)

Owner request: how often players visit and play the 7v7, futsal, 9v9, 11v11 and beach matches, and for how long.

- **Events** (`lib/analytics/liveMatchEvents.ts`, ids `lm:` in `countIds.ts` LIVE_MATCH_COUNT_IDS, 118 fixed ids): on the
  existing beat counter channel (`k`), so the same consent rules apply (nothing under DNT / GPC, bots, preview, labs, admin,
  localhost) and **no migration** is needed (analytics_ingest already accepts any well-formed id the server allowlists).
  Per format: `visit` (the Learn + Play bar appeared; once per visit, a step-off under 60 s is the same visit), `join` +
  `role_<gk|def|mid|fwd>`, `leave`, `min` + `sec` (foreground time, exact to the second, capped at 2 h a match; banked as whole
  minutes when the tab hides), `len_*` (8 length bands), `with_*` (other humans on the match: 0 / 1 / 2–3 / 4+), `end_*`
  (Leave/Esc, pulled off, tab closed via the tracker's pagehide hook); `lm:reach_1/3/10` per tab session.
- **Fired** from Town (bar shown, venue change: transitions only) and `lib/town/liveJoinRuntime.ts` `api.onMatch` (join after
  the slot is taken, friends roster change, leave). The runtime imports no analytics; Town wires it. Zero per-frame cost.
- **Admin**: tab "Live matches" (`app/admin/LiveMatchesSection.tsx`, report `lib/analytics/liveMatchReport.ts`): headline
  tiles, per-format panels + table, matches by day, how often, length bands, roles, friends, endings. `<5` suppression like the
  other gameplay sections; median read inside the bands, longest = top band reached.
- **Not done**: matches per *person* per week. The rollups only know tab sessions; joining match play to the keyed player id
  is the same kind of linkage as the party retention report (Phase C) and waits for the same legal sign-off.
- Test: `tests/admin-analytics-live-matches.cjs`.

## Fishing funnel (Nov 6 2026)

Owner request (fishing audit item 4): where do players drop out between tapping Fish and landing a catch?

- **Events** (`lib/analytics/fishingEvents.ts`, ids `fi:` in `countIds.ts` FISHING_COUNT_EVENTS): `start` (the Fish button),
  `cast`, `bite`, the existing `hook_spin` and `land`; misses split `miss_early` / `miss_late` (`fi:miss` stays registered for the
  days before, no longer sent); `land_<common|uncommon|rare|legendary>` (the rarity word only, never the species or spot);
  `new_species`, `basket_full`, `tutorial_done` / `tutorial_skip`, `sold` (the number of fish in a sale: `fishSold(n)`, called
  by the stand for Rosa, Mele and the boat captains). Same beat counter channel `k`, the same consent / DNT / GPC / bot rules,
  no ingest migration; the `lm:` precedent for a server-built report.
- **Admin**: the Fishing section (`app/admin/FishingSection.tsx`, report `lib/analytics/fishingFunnel.ts` → `report.fishingFunnel`):
  Fish tapped → Cast → Bite → Hooked → Landed as sessions per step with the drop-off, plus early vs late misses, rarity mix,
  basket full, tutorial completion and fish sold. **Exact counts** (owner rule, Nov 5 2026: no `<5`), including the fights per
  session buckets.
- **SQL** (`supabase/migrations/20261106_analytics_fishing_sessions.sql`, additive: one new function, the Oct 17
  `analytics_fishing_summary` untouched): `analytics_fishing_sessions` counts every session that fished (tapped Fish, cast,
  fought or landed), so sessions that never hooked a fish are bucket `0` (the old summary's HAVING dropped them). /admin falls
  back to the old function and shows a banner naming the file until it has run.
- Test: `tests/admin-analytics-fishing.cjs` (ids, listener, loader, funnel report, both SQL functions on a throwaway Postgres).

## Investor page visits (Nov 5 2026)

Owner: "for the marketing tab in admin, add a section to show what state and time they came, and how long they stayed on the
marketing site." New section **Investor page visits** at the foot of /admin's Marketing tab (app/admin/MarketingVisitsSection.tsx,
shown with or without tour-page data). Counts the unlisted **/marketing** page only (not `/`, not the overview PDF).

- Browser (lib/analytics/marketingVisit.ts, started by components/VisitTracker.tsx while the path is /marketing; the page stays
  script-free): `mm:view`, foreground seconds as `mm:min` + `mm:sec10` + `mm:sec1` (exact, visibility-aware, booked on every hide
  and on pagehide, capped at 30 min per view) and one stay band `mm:t_<band>` (<10 s, 10–30 s, 30–60 s, 1–3 min, 3–10 min, 10+ min)
  at the first hide / pagehide (the same "first look" rule as the tour page's mk:t_ bands).
- Server (lib/analytics/marketingVisitGeo.ts, called by the ingest on every beat): from `x-vercel-ip-country` /
  `x-vercel-ip-country-region` and the beat's arrival time it adds `mm:g_<geo>` (visits), `mm:gm_<geo>` + `mm:gx_<geo>` (stay
  minutes + tens of seconds, ±5 s per beat) and `mm:h_<weekday>_<hour>` (Pacific, the dashboard's clock). `<geo>` is a fixed set:
  `us_<state>` (50 states + DC), `us` (no state), `o_<ISO country>`, `other` (no/unknown header). Never an IP, city, postcode or
  coordinate; the browser cannot send these ids (not on the client allowlist). Hour = first beat's arrival (within ~4 min).
- Report (lib/analytics/marketingVisitReport.ts → report.marketingVisits): exact counts; average exact to the second, median
  estimated inside its band, bounce = share of banded visits under 10 s; places with visits and average stay; 24 Pacific hours;
  weekday × hour table (island heat ramp); visits by day.
- No SQL migration, env or worker change: the ids ride `analytics_beats.counts` and the existing rollups (they match the counts
  regex; a beat keeps at most 64 ids). Tests: tests/admin-analytics-marketing-visits.cjs.

## Daily data layer and export (Nov 6 2026)

Owner request: "make the analytics trend-ready and the export comprehensive" (steps 2 and 4; the visual dashboard rebuild is a
later job that reads this layer). Built on the audit's corrected definitions ([analytics-audit-2026-11-06.md](analytics-audit-2026-11-06.md)).

**The layer** (`lib/analytics/daily.ts`, pure; server loader `lib/analytics/dailyAdmin.ts`):

- `loadDailyLayer(store, {from,to}, now)` → `{layer, medianSessionMs, peopleStatus}`: loads every day's rollup from
  `TRACKING_START` to `to` with the report's own loader (`report.ts loadRangeMerged`: frozen, live-computed or UTC stand-in days),
  the hourly session starts of the range's raw-retained days (`store.hourly`), and per-day people once the proposed SQL runs.
- `buildDailyLayer({rollups, from, to, today, mode?, hourly?, people?})` → `DailyLayer`:
  `{version:1, from, to, today, timeZone, partialDay, days, utcDays, loadedFrom, series: DailySeries[], hours, gaps, notExported}`.
- `DailySeries`: `{key, section, metric, part, label, unit, agg:'sum'|'ratio'|'avg', scale?, how, source, trackedSince, fullSince,
  sinceFrom, points: DailyPoint[], prior: DailyPoint[]}`; `DailyPoint`: `{day:'2026-11-05', value:number|null, partial?, utcDay?, num?, den?}`.
  `key` = `section.metric[.part]`, e.g. `audience.players_per_day`, `engagement.games.live`, `time.where_time_goes.fishing`,
  `live_matches.joins.beach`, `counters.fi:start.total`. `points` = the range's days; `prior` = loaded days before it.
- Helpers: `seriesByKey(layer,key)`, `totalOf(series[,from,to])` / `aggregate(series,points)` (sum: days added, today so far
  included; ratio: Σnum ÷ Σden × scale; avg: mean of complete days), `previousPeriod(series,from,to,today)` (same number of
  COMPLETE days; `not-tracked` when any previous day is before `trackedSince` or has no data field), `weekly(series)`
  (Monday–Sunday, `complete`/`partial`), `byWeekday(series)` (0 = Sunday), `introducedOn(id)`, `counterLabel(id)`.
- Sections: `audience` (players per day, sessions, page views, bounce rate, session minutes, average session, minutes per player,
  sessions by country / region / source / referrer / campaign / device / entry), `engagement` (every Overview card and part from
  `sponsor.ts SPONSOR_DEFS`, walking emotes included, cards by number), `kit` (designs saved, purchases), `time` (area, activity
  and place minutes; `where_time_goes`: island, matches, fishing, arcade, arcade games, learning, friends: overlapping views,
  not a split), `learning` (stage totals, per lesson, first tries), `live_matches` (per format + all: pitch visits, joins,
  finished, match seconds, average, players), `fishing` (funnel sessions + events per step), `marketing` (tour page `/`, investor
  page: visits, stay, by place), `counters` (EVERY `FIXED_COUNT_IDS` id: total and sessions), `people` (once the SQL runs).
- `trackedSince`: the day the counter was introduced (git history of countIds.ts → `countSince.generated.ts`, regenerate with
  `node scripts/gen-count-since.cjs` after adding counters; the test fails until you do), or the first day with data when
  earlier, never before the first day with a session; days before are `null`. A total whose parts started on different days
  has `fullSince` (e.g. Games played: Summit Kick from Oct 14, arcade games from Oct 20).
- `hours`: session starts by Pacific hour (raw days only, the last 14) and the investor page's weekday × hour grid (`mm:h_`).
  No other counter has a time of day.
- Exact numbers (owner decision for the export: admin-only, no personal data). The dashboard cards keep their `<5`.
- Shared rules now live in one place: `sponsor.ts SPONSOR_DEFS` (cards and parts), `liveMatchReport.ts lmSeconds`,
  `marketingVisitReport.ts mmSeconds` are read by both the tabs and the layer; the audit's numbers are unchanged.

**The export** (`GET /api/admin/export?kind=summary|daily|definitions|hours|zip|json&from=&to=`, admin session only, reads only;
`lib/analytics/exportCsv.ts`, `lib/analytics/zip.ts`): the Overview's **Export** panel (date range + Summary CSV / Daily CSV /
Definitions CSV / All files (ZIP); `app/admin/ExportControl.tsx`). The older "Download CSV" button (client-side `sponsorCsv`)
is unchanged.

- Summary: one row per metric and part: `Metric, Part, Total, Unit, Window, Previous period, Previous total, Change, How it is
  counted`. Window = the range, or `<trackedSince> to <to> (not tracked before <date>)`; Players (distinct) and Returning say
  "last 14 days of raw rows"; the previous period is the same number of complete days, or "not tracked before <date>".
- Daily (tidy): `date,section,metric,part,value,unit,tracked_since,partial_day`; empty value = not tracked; the raw `counters`
  section lists ids with a non-zero day in the range (Definitions lists every id).
- Definitions: `section, metric, part, key, label, how_counted, unit, aggregation, window, source, tracked_since,
  fully_tracked_since, tracked_since_rule, in_daily_csv`, then the tracking gaps and the not-exported families
  (`q:` / `o:` per-question ids: exported as first-try totals).
- ZIP: the three plus `hours.csv` (stored, no compression, no dependency).

**Tracking gaps** (listed in the layer's `gaps` and the Definitions CSV): distinct players and returning / new sessions per day,
D1/D7 cohorts (all need `docs/analytics-proposed/analytics_daily_people.sql`, PROPOSED, NOT APPLIED, kept out of
supabase/migrations; tested on a throwaway Postgres); D30 (raw rows live 14 days: owner + policy decision); live-match goals,
replays and bot counts (no `lm:` ids); hour of day for counters; party retention on UTC days (audit item).

Test: `tests/admin-analytics-daily.cjs`.

## Dashboard rebuild: trends, story, player drill-in (Nov 6 2026)

Owner: "rebuild it so I can see trends better … tell a visual story … daily players, returning, sessions, minutes per player …
drill into each player. No goals for now." Every new number comes from the daily data layer above (the export's layer), so
dashboard == export for the same range (tests/admin-dashboard.cjs checks it on the audit's synthetic dataset).

- **Data**: `GET /api/admin/dashboard?range=…` (`lib/analytics/dashboardAdmin.ts`): the layer trimmed to the series the tabs draw
  (`lib/analytics/dashboard.ts` `wantSeries`, ~165 series, ~80 kB for 30 days), plus the people status, D1/D7 cohorts and feature
  start days (from `countSince.generated.ts`) for chart markers. `/admin` server-renders it with the report (in parallel) and
  now opens on **the last 30 days** (was Today; a pull-to-refresh comes back to it). The minute auto-refresh reloads the
  trend data every fifth tick only. The layer's arithmetic moved to `lib/analytics/dailyMath.ts` (re-exported by daily.ts) so
  the browser runs the same rules (sum / ratio / mean of complete days, previous period, weeks, weekdays).
- **Header (every tab)**: Today, Yesterday, 7, 14 (new preset), 30, 90 days, All, Custom; Compare (offered only when the previous
  period is fully tracked, else "Not tracked before <date>"; the switch hides every trend delta); Refresh; partial-day note;
  Pacific label; the Export panel.
- **Tabs**: Overview, Players and retention, Learning, Island and games, Live matches, Fishing, Marketing, Live now, Sponsor
  report. Old `#engagement` etc. still open the right tab. Every old section is kept; each tab opens with trend tiles
  (`app/admin/TrendTiles.tsx`: value, change, complete-day sparkline, "How it's counted" → its Definitions row).
- **Overview story** (`app/admin/OverviewStory.tsx`): a takeaway sentence built from the numbers; ten tiles (players per day,
  distinct players a day, returning share, sessions, average session, minutes per player = session minutes ÷ player-days, shown
  on the tile, live matches, fish landed, cards, minutes with friends); players + sessions by day / week with feature-start
  markers; where time goes (a true split by area, stacked, plus the overlapping activities inside it); weekday and hour heat
  strips (hours: raw rows, 14 days); onboarding / fishing / match funnels (counted over the days every step was tracked); D1/D7
  cohorts (D30: not available, raw rows 14 days); what changed: biggest movers (base ≥ 5) and unusual days (> 2 scaled MADs and
  ≥ 20% from the median day; first tracked day skipped). Then the old "What players do" cards, Definitions, the metric index.
- **Metric index** (`lib/analytics/metricIndex.ts`, 53 entries: the audit inventory + every old section): each id is a
  `data-metric` in its new place; the test scans the sources and the screenshot run checked all 53 in a real browser.
- **Players** (`app/admin/PlayersExplorer.tsx`): the list (search by id prefix, returning / new, first-seen cohort, sort by last
  seen, minutes, sessions, days, first seen) and a player's detail: first / last seen, days played, sessions per day (14 days),
  minutes by area (island, fishing, learning, arcade, shops), returning pattern, progress counts, device class, country /
  region; "Every session" opens the Oct 16 slide-out. Same reads and privacy as before (no name, IP, UA, code). Live-match and
  friends minutes are not kept per player (said on the panel).
- **People function**: still proposed (`docs/analytics-proposed/analytics_daily_people.sql`, not applied). Until it exists the
  people tiles and the cohort table say "needs the people function" (the older range totals still show). A local preview's
  memory store answers the same question from its raw rows (`lib/analytics/memoryPeople.ts`; `ANALYTICS_LOCAL_PEOPLE=off` shows
  the production state), as it now does for the players list and one player.
- **New live-match counters** (no migration): `lm:<f>_goal_for`, `_goal_against` (goals while the player was on, totals only),
  `_replay`, `_replay_skip`, `_slots_bot`, `_slots_human` (slots at the join, capped at 22): `countIds.ts LM_MATCH_EVENTS`,
  sent by `liveMatchEvents.ts` from `liveJoinRuntime.ts` transitions (Town wiring unchanged); in the layer
  (`live_matches.goals|goals_for|goals_against|replays|replay_skips|bot_slots|human_slots.<f|all>`) and the Live matches tab
  ("Goals, replays and who was on"). From Nov 6 2026.
- Fixed on the way: the investor heat table's screen-reader span pushed a 390 px phone page 230 px sideways (`.mvSr` left/top).
- Tests: `tests/admin-dashboard.cjs` (new); deliberate assertion updates in admin-sponsor (nine tabs), admin-pull-refresh
  (30-day default), admin-analytics-live-matches (six runtime events, slots), admin-analytics-party (wrapped sections).
