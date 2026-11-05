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
- **Privacy:** totals per fixed id, cells under 5 sessions shown as "<5"; privacy policy §7 gained one bullet.
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
