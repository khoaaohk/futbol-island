# Admin sponsor insights (Oct 20 2026)

Owner's brief: "add more to the admin portal to capture behaviour to sell sponsorships: how many games played, how many t-shirts designed, cleats designed, player cards found, videos/stories watched, books purchased, read duration, quizzes taken. Fix the admin portal so it's easier to find this. Design it so the data is simple, then drill in to see additional information."

## Where it is

`/admin` now opens on four tabs:

- **Overview**: the sponsor view.
- **Engagement**: the old Engagement, Product usage and Detail sections.
- **Players**: the old Headline, Acquisition and Save health sections.
- **Live**: on now, today's players, players in the range.

The date range (Today / Yesterday / 7 / 30 / 90 days / **All** / Custom) applies to every tab. "All" starts on 2026-10-07, the day analytics began. The tab is kept in the URL hash, so `/admin#engagement` opens that tab.

The Overview has three rows:

1. **Who plays:**
   - Players: distinct anonymous player ids.
   - Players per day.
   - Returning players.
   - Average session length.
2. **Eight metric cards.** Each card shows:
   - the total for the range;
   - the change against the same number of days just before;
   - a trend line (for ranges shorter than a week, the 7 days ending on the last day of the range).
3. **"How these are counted"**: a footnote for each metric.

**Download CSV** saves every metric, its parts, the previous period, the change and how each one is counted.

Tapping a card opens a slide-out with:

- the day-by-day breakdown;
- averages and rates;
- breakdowns by item;
- device and country;
- the counting rule.

## The metrics

| Metric | How it is counted | Counters (lib/analytics/countIds.ts) | Since |
|---|---|---|---|
| Games played | One play each time an arcade cabinet starts (Island Strikers, Breakaway Run, Futbol Tennis, Futbol Pinball, Pass Puzzles), plus each Summit Kick round. Replays count again. | `en:game_<live/runner/tennis/pinball/puzzle>` (new), `su:kick_play` | arcade: new build; Summit Kick: Oct 15 |
| T-shirts designed | A jersey design saved to a slot in the Jersey Studio (re-saves count). Detail: studio opens, saves per open, jerseys bought, saves by pattern. | `sh:save_jersey`, `sh:open_jersey`, `sh:buy_jersey`, `en:jerseyp_<pattern>` (new) | Oct 15 (pattern: new) |
| Cleats designed | A boot design saved to a slot in the Boot Studio. Detail: opens, saves per open, bought, by boot model and by pattern. | `sh:save_boots`, `sh:open_boots`, `sh:buy_boots`, `en:bootm_<model>`, `en:bootp_<pattern>` (new) | Oct 15 (style: new) |
| Player cards found | A card that was NOT already in the binder joins it: picked from an offer (hidden ball, islander gift, perfect quiz, exploring, Learning Journey, story, path), from a pack, or from the starter kit. Duplicates do not count. Detail: how found, tier, most-found cards (by binder number, named on the server). | `en:card_<source>`, `en:cardtier_<tier>`, `en:cardn_<n>` (all new) | new build |
| Videos & stories watched | Watched to the end: a lesson video, a card film, a pop-up book read to its last spread, or the Island Tutorial. "Started" = lessons opened, films and books opened, tutorial opened. | `le:*`, `lo:*`, `tu:finish`, `tu:open`, `en:film_open`, `en:film_end`, `en:bookopen_<book>`, `en:bookend_<book>` | lessons Oct 9, tutorial Oct 16, films/books: new |
| Books purchased | A pop-up book bought with coins from a vending machine (each costs 100 coins; the free starter book is not counted). Detail: by book. | `en:bookbuy_<book>` (new) | new build |
| Read time | Foreground minutes with a pop-up book open: the tab is visible, and hidden or idle time does not count. This is the same clock as "Where they spend time". Detail: the length of each reading visit (under 1 minute / 1–3 / 3–10 / 10+), the most-opened books, and the average minutes per open. | activity `book` (since Oct 8), `en:read_<bucket>` and `en:bookopen_<book>` (new) | minutes Oct 8; buckets and opens: new |
| Quizzes taken | A lesson quiz started (replays count). Detail: finished, finished per start, all right first try, first-try answers right, and the most-taken quizzes with their finish rate. | `ls:*`, `lf:*`, `la:*`, `q:*`, `o:*` | Oct 9 |

The Players row:

- **Players**: `/api/admin/players`. These are anonymous player ids (a save code, else one device), from the last 14 days of raw rows.
- **Players per day**: the average of each day's unique visitors, over complete days only.
- **Returning**: the share of sessions from a device that had played before (`is_returning`), over the last 14 days.
- **Average session**: foreground time divided by sessions.

## Trust rules

- **Sums only.** Every number adds up counters the game already sends on its anonymous beat (`k:{id:n}`), and the same daily rollups feed every other card. Nothing is estimated, sampled or projected.
- **Small numbers are hidden.** A total resting on fewer than 5 different sessions shows as "<5". "Different sessions" means the sessions of the busiest counter behind the total, so 5 counters from one session are never enough. An item under 5 sessions is left out of its breakdown, and the panel says how many were left out.
- **Not tracked yet.** The `en:` counters only exist from the build made on Oct 20 2026. Until the first one arrives in the range (or in the period before it), every part that depends on them shows **"Not tracked yet"** instead of 0, and a banner says so. A partly tracked metric shows a "Partly tracked" badge and names what is missing. Example: Games played counts Summit Kick, but the arcade games are not counted yet.
- **No meaningless changes.** The change is left blank when the previous period is withheld or zero, or when it falls before analytics began.
- **Pacific days.** Days are Pacific days, as on the rest of the dashboard.

## Privacy

- Every new id is a fixed bucket:
  - an arcade game by name;
  - a saved design's pattern or boot model (never its colours, name, number or drawing);
  - how a card was found, its tier, and its binder number (public footballers, from a fixed list);
  - a book's fixed key;
  - a reading visit's length in four bands.
- No new storage keys and no new requests.
- The call sites are one-line map increments (`lib/analytics/sponsorEvents.ts`). They do nothing when the tracker is off (dev, DNT/GPC, bots, admin, localhost).
- The privacy policy (§ What we count) gained one bullet.

## What the owner must apply

1. **Deploy the build.** The new client counters need no migration: `analytics_ingest` only checks an id's shape, and the rollups sum every id. Counting starts when the build is live.
2. **Run `supabase/migrations/20261021_analytics_sponsor_split.sql`** in the Supabase SQL editor (paste the whole file, after `20261019_analytics_day_sessions.sql`). The last row must read `OK, sponsor split installed`, and running it twice is safe.
   - What it does: it adds the read-only function `analytics_sponsor_split(from, to)` (service_role only), which powers the "By device and country" part of each slide-out.
   - Until it runs, that part of the slide-out names the file. Everything else works without it.

## Known gaps and limits

- **Games** do not include island matches, Rooftop Knockout, beach soccer or fishing. Fishing has its own section on the Engagement tab.
- **Device and country** come from raw session rows, so they cover the last 14 days only. Older days keep daily totals but not each session's device or country, and the panel says so. Groups under 5 sessions are folded into a "left out" line.
- **Players and Returning** also cover the last 14 days only, for the same reason. Visitor counts rotate their salt daily by design, so "unique players over 30 days" cannot be counted from visits.
- **Read time per book** is not split by book: there is one `book` activity clock. The opens are counted per book, and so is the length of each visit (in bands).
- **Card films** are counted as a total, not per film.
- **"All"** is capped at 400 days by the range code. That is fine until late 2027.
- **History.** Counts from before the build only exist for the old counters: Summit Kick, Kit Shop saves, lessons, quizzes, the tutorial and book minutes.

## Files

- **Counters**:
  - `lib/analytics/countIds.ts`: the `ENGAGE_*` lists and `ENGAGE_CARD_NUMBER_RE`.
  - `lib/analytics/sponsorEvents.ts`: the call-site helpers and the reading clock.
  - Call sites:
    - `components/ArcadeRoom.tsx`
    - `components/shop/JerseyStudio.tsx`
    - `components/shop/BootStudio.tsx`
    - `lib/town/cardRewardStore.ts`
    - `lib/arcade/arcadeWallet.ts`
    - `lib/town/backpackStore.ts`
    - `components/CardFilmPlayer.tsx`
    - `components/PlayerPopUpBook.tsx`
    - `components/VendingMachine.tsx`
- **Report**:
  - `lib/analytics/sponsor.ts`: the metric rules, `buildSponsor` and the CSV.
  - `lib/analytics/sponsorLabels.ts`: names, server only.
  - `lib/analytics/report.ts`: sets `report.sponsor`.
  - The `all` range is in `lib/analytics/core.ts`.
- **Drill-down**:
  - `lib/analytics/sponsorSplit.ts`: the shape and the TypeScript reference.
  - `lib/analytics/sponsorAdmin.ts`: the loader. It uses the local store when `ANALYTICS_LOCAL_FILE` is set.
  - `app/api/admin/sponsor-split/route.ts`
  - `supabase/migrations/20261021_analytics_sponsor_split.sql`
- **UI**:
  - `app/admin/SponsorOverview.tsx`
  - `app/admin/SponsorOverview.module.css`
  - The tabs are in `app/admin/AnalyticsDashboard.tsx`.
- **Tests**: `tests/admin-sponsor.cjs`. It checks:
  - the ids and that the repeated lists match the game;
  - the call sites;
  - the rules and suppression;
  - the CSV;
  - the reading clock;
  - that the SQL matches the TypeScript (on a throwaway Postgres).
- **Screenshots**:
  - `docs/admin/sponsor-overview-desktop.png`
  - `docs/admin/sponsor-overview-phone.png`
  - `docs/admin/sponsor-drilldown-phone.png`

  They were taken locally on seeded synthetic data, not real players.

## Phase B (Oct 22 2026): social and emote cards, the weekly Sponsor report, relay health

- **Two more Overview cards** (`SPONSOR_METRICS` in `lib/analytics/sponsor.ts`): **Minutes with friends** (`mp:min`; stats: share of
  island minutes in a party, average party size, parties per active player, sessions in a party) and **Emotes used** (`em:e<n>` by
  group; stats: emotes per active player, sessions that emoted, emotes per emoting session, townsperson answer rate). Both say
  "Not tracked yet" until the first `mp:` / `em:` id arrives (`PARTY_SINCE`, `lib/analytics/countIds.ts`). They are not in the SQL
  device / country split yet (that needs a migration, Phase C); the slide-out says so.
- **Sponsor report tab** (`app/admin/SponsorReport.tsx`, `/api/admin/sponsor-report?week=YYYY-Www`, `lib/analytics/sponsorReport.ts`):
  one ISO week of combined totals: reach (rounded to 10 under 1,000, else 100), engagement minutes, social engagement, emote
  engagement, return rate (raw 14 days only), learning engagement, party sizes and top emotes. Anything resting on fewer than
  **10** sessions / parties / players is withheld as "<10", on screen and in the CSV. The page and the CSV carry the banner
  **"Internal draft: do not share outside the company until the privacy policy wording is approved."** Print → Save as PDF uses
  the print stylesheet in the component (A4, two cards per row, buttons hidden).
- **Relay health** ("Health" in Friends & parties, "Parties now" in the live panel): set **`RELAY_STATS_URL`** (the relay's
  `/stats` address) and **`RELAY_STATS_TOKEN`** (its `STATS_TOKEN` secret) in the server environment (never `NEXT_PUBLIC_`).
  Without them the admin shows "Relay stats not configured". The payload contract is `lib/analytics/relayStatsTypes.ts`;
  `RELAY_STATS_FIXTURE=1` (not in production) serves the fixture for a local preview.
