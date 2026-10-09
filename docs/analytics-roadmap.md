# Admin analytics: what to measure next (research, Oct 8 2026)

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
