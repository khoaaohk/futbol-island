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

## Oct 1 2026 UI requests (user decisions; local, not committed or deployed)

- **"My football" removed completely.** The mastery screen (stage bars and lesson list per format) and every entry to it are gone:
  its tab in the learning drawer, the buttons on the welcome-back card, the Paths Review card and the backpack header. The **daily
  Warm-up stays** (spaced retrieval of passed quizzes, its own learning value and coins): the drawer now holds only the warm-up, is
  titled "Warm-up" and opens from the Paths Review card when lessons are due. Saves are untouched (`fi2-lesson-review-v1` is still
  used by the warm-up, book checks and island ticks; For grown-ups still shows the stages); earned coins are kept. Details in
  `docs/learning/spaced-review.md`. Side effect: the three pilot journeys were only reachable from that tab and are unreachable
  again until they get a new home.
- **Welcome-back card is a note, not a menu.** No Go / My football / Later buttons; it hides on its own after 6 s on screen
  (`WELCOME_BACK_SHOW_MS`; the dwell restarts if a menu or overlay covers the HUD) or on a tap. The next lesson stays one tap away
  via Paths → Continue. The daily-play line wraps into two balanced lines. See `docs/ui/HUD_STACK.md`.
- **One NPC name tag.** Only the townsperson closest to the player (the one "Talk to …" opens) shows a name tag, within the
  existing 12 m (phone) / 14 m (desktop) range, held with the HUD arbiter's 1.5 m hysteresis; none while flying, in the vending
  close-up, or for an off-screen townsperson (`lib/graphics/npcTagFocus.ts`).

## NPC match scores: football-data.org instead of ESPN (Oct 1 2026; local, not committed or deployed)

ESPN's `site.api.espn.com` answers **HTTP 403 to every request from Vercel** (production log: `[island-news] source HTTP 403
site.api.espn.com`), so production showed no scores. User decision: use **football-data.org v4** (free tier), fetched only on
the server, so players' devices never contact a sports site.

- **Code:** `lib/town/footballDataServer.ts` (provider, limiter, parser) used by `lib/town/islandNewsServer.ts`; the response
  shape the NPC components read (`items`, `lastResults`, `season`, `unavailable`, `partial`) is unchanged, plus `attribution`
  and `lastUnavailable`. Tests: `tests/news-football-data.cjs`, `tests/news-request-budget.cjs`, `tests/news-last-match.cjs`.
- **Coverage (league → provider):** eng.1→PL, esp.1→PD, ita.1→SA, ger.1→BL1, fra.1→FL1, uefa.champions→CL, bra.1→BSA come from
  football-data.org (all in its free tier, football-data.org/coverage). eng.w.1 (WSL), usa.1 (MLS) and jpn.1 (J.League) are
  paid-tier there, so they stay on **ESPN**, which may work from some regions or later. ESPN is also the secondary source when
  football-data.org fails or no token is set. If every source fails, NPCs give the friendly "can't check the last results"
  copy and still offer the league's curated clips.
- **Requests:** past week + next 48 h = one request (`/v4/competitions/{code}/matches?dateFrom=&dateTo=`, under ten days; it
  returns results, live games and fixtures together). Only when that week has no verified result: `status=FINISHED` for this
  season (newest round within the four-month lookback; last season's list if the new one has not started), then
  `status=SCHEDULED` for the next match date (between seasons). At most four requests per league per cache period. The
  verified rule is unchanged: FINISHED with both full-time scores, kicked off already, not postponed/suspended/cancelled
  (shoot-out goals are not added to the score). The free tier has **delayed scores and no scorers**, so stories say "some
  scorer or minute details are unavailable"; there is no public match page, so rows have no outbound link.
- **Rate limit:** free tier is 10 requests/minute. The server keeps the 5-minute feed cache and the 30-minute last-results
  cache (30 s / 1 min after failures), shares in-flight requests (many NPCs asking at once = one request), and a FIFO budget
  of **9 per rolling minute** (one spare); a request that would wait more than 12 s fails fast to ESPN instead of holding
  the API route. On **429** (or `X-Requests-Available-Minute: 0`) it pauses for `X-RequestCounter-Reset` seconds (default 60).
  The budget is per server instance; with several Vercel instances, the 429 backoff is the backstop.
- **Config:** `FOOTBALL_DATA_TOKEN` (server only; never `NEXT_PUBLIC_`, never logged, sent only as `X-Auth-Token`). Missing
  token: logged once per instance, ESPN used. Locally in `.env.local`; on Vercel:
  `vercel env add FOOTBALL_DATA_TOKEN production --scope team_Xkp00QpGjUrfFY2uOFUrHoIS`, then redeploy. See `.env.example`.
- **Attribution:** football-data.org's terms (section 7.1) require "Football data provided by the Football-Data.org API" in a
  visible place. The scores list shows "Scores: Football data provided by the Football-Data.org API." and match stories end
  with the same credit whenever its data is shown.
