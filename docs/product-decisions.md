# Product decisions

No active decisions recorded here. The three preferences entered on September 17 were withdrawn by the user.

## Game-audit quick wins (30 Sep 2026, lane 1; local, not committed or deployed)

These are implementation choices from the audit's "do all". The user can reverse any of them.

- **First path: 7v7** (the simplest). Futsal stays available as tab 04. See `docs/format-path-learning-design.md`.
- **Daily bonus:** any steered ride counts, and sessions still start on the jetpack. See `docs/daily-play.md`.
- **Quiz card:** stays first-try only (the user's rule), but a paused quiz keeps its run. See `docs/quiz-design.md`.
- **Test flags and lab pages are developer-only:**
  - `?preview=all` and `&testCoins=50000` need a non-production build on localhost (`lib/town/vendingPreview.ts`, reusing `lib/dev/devUnlockGate.ts`).
  - `/motion-lab`, `/skill-lab` and `/splash-lab` answer 404 in production builds (`lib/dev/labRoutes.ts`).
  - `?cardpath`, `?ridepaths`, `?cards` and `?cardtrade` were already production-gated.
  - `/controller` (the phone gamepad) and `/coffee` are real pages and stay.
  - Harmless view flags stay public: `?characters=`, `?heat=1` readout, `?debugGames=1`, `?dots=`, `?lesson=space`, `?panel=about`, `?store=`, `?game=`.
- **Grown-up check before money and outside links:**
  - About → Support shows one "For grown-ups" button, and the donation links appear after the shared ParentGate (`components/DonationLinks.tsx`).
  - `/coffee` wraps its tiers the same way.
  - Every link that leaves the site (music credits, card and costume sources, clips, news) is stopped by `components/ExternalLinkGate.tsx` (mounted in `app/layout.tsx`) until a grown-up passes. The pass is remembered in memory for 10 minutes; nothing is stored.
- **One "complete" rule for lessons (QA11 B-3 / C-8, the recommended default).**
  - A lesson is complete when every quiz question has been answered correctly on this device (a lesson with no quiz: every step watched). This is `lessonEvidence(...).complete` in `lib/paths/formatPaths.ts`, and every surface reads it: Paths (stops, "n / 12 starter lessons", Continue), graduation and the Ferry (`pathProgressFrom`), For grown-ups ("lessons understood", the report), IDP homework and the Coaches Board.
  - Lessons may be opened out of order from IDP homework, the ball hunt's "Watch it", Spot it, welcome back and reviews. The Paths lock only guides the order on the Paths screen; it does not stop those launches.
  - Passing one out of order counts everywhere at once: Paths shows it Completed (never Locked) even when earlier stops are not, and it counts towards the path's progress and graduation. Continue still points at the first unfinished starter stop. Pinned by `tests/new-player-flow.cjs`.
- **Production gating (QA11 follow-up):**
  - `/coffee/checkout` answers only navigations started on the site (the gated tier links after a grown-up pass). A typed, pasted or outside link is redirected to `/coffee`, which asks the grown-up question first (`Sec-Fetch-Site`, falling back to a same-origin Referer). The Stripe hand-off after a pass is unchanged.
  - Outside links carry no real `href` until the gate opens them (`components/ExternalLinkGate.tsx` moves it to `data-gated-href`), so long-press "Open in New Tab", the right-click menu and dragging a link can't skip the check.
  - The dev card and ride flags (`?cardpath`, `?cards`, `?cardtrade`, `?ridepaths`) now need a non-production build on localhost, like `?unlock=all` (`lib/dev/devUnlockGate.ts`).
  - The parent gate's 3-try cooldown lives in module memory (`lib/parentGate.ts`), so closing and reopening a gate doesn't restart it.
- **Known and acceptable in production (reviewed QA11, left as they are):**
  - `window.__fi2` is assigned unconditionally in `components/Town.tsx`. It exposes game internals (quiz answer callback, location, renderer), so someone with devtools could answer quizzes or teleport. Nothing is stored server-side or paid for real money through it, and the QA and heat scripts rely on it. Recommendation if it ever matters: expose it only when `devUnlockHostAllowed` passes or with an explicit `?debug` flag.
  - `?heat=1` (`lib/graphics/islandHeat.ts`) shows a pointer-events-none heat readout in production. It is harmless and is useful for real-device heat checks on the live site.
  - `/api/lan` returns the server's LAN/container IPv4 addresses. It serves the phone-controller pairing on a LAN and is a minor information leak on Vercel. Recommendation: return 404 when `VERCEL` is set or `NODE_ENV==='production'`, if the controller is never paired against the deployed site.
- **Destinations that aren't ready** read "Opening soon · finish your paths!" (`lib/town/openingSoon.ts`) instead of "Coming soon". Lane 2 replaces each notice as it ships (the Museum already has).


## Analytics: Vercel Web Analytics instead of Google Analytics (Sep 30 2026)

Futbol Island is played by children, so visit counting uses Vercel Web Analytics (`<Analytics/>` from `@vercel/analytics/next` in `app/layout.tsx`): no cookies, no personal identifiers, aggregate page views only. The Google tag (G-9NS6SZ3FEN, added Sep 29) was removed: GA sets cookies and identifiers, which for under-13 players raises COPPA and kids'-category store concerns. The parents' "About this game" copy says the same. Web Analytics must be enabled in the Vercel project (Analytics tab) for the counts to appear.
