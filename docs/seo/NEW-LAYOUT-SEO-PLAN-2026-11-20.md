# SEO plan for the new layout (Nov 20 2026)

Owner, Nov 20 2026: "This new layout is how i want to move forward. Go back and fix any SEO issues to improve this new layout and
direction. We won't mind the change in traffic. this is the way to go for best UX. build and update SEO around this, Title,
descriptions, tags, whatever you need to do. We need to boost traffic to these three main pages, Island, games, and library,
these should get the most traffic." Then: "Also play".

Four priority pages: **Island** = `/`, **Games** = `/games`, **Library** = `/library`, **Play** = `/play`.
On-site work only (no outreach of any kind). Data: `data/seo/snapshot.json` (Search Console, data through Nov 17 2026, 28 days:
42 clicks, 1,869 impressions, average position 32). Audit method: the preview build of branch `layout-nov20` (localhost:9032)
and the live site, fetched with a Googlebot user agent; headings, tags and JSON-LD read from the server HTML (no JavaScript run).

## 1. The four pages today

| | Island `/` | Games `/games` | Library `/library` | Play `/play` |
|---|---|---|---|---|
| Title (chars) | Futbol Island: Free Football Game and Lessons for Kids (54) | Free Soccer Games for Kids: Play Online, No Ads (47) | Futbol Island Library: Lessons, Drills, Rules, Games (52) | Play Futbol Island: Free Football Learning Game (47) |
| Description | "Futbol Island is a free football (soccer) game for kids 7 to 12, with lessons and quizzes. No pop-up or tracking ads, no accounts, no open chat." (144) | "Eleven free soccer games for kids to play online: pinball, snake, air hockey, a runner, a shooter, tennis, swipe, merge and puzzles. No ads." (140) | "Everything Futbol Island teaches, on one page: free football lessons, rules, positions, drills, practice plans, games and story books for kids 7 to 12." (151) | "Start your island or continue with your save code. Learn 7v7, 9v9, 11v11 and futsal in short lessons, play with friends using safe emotes. No pop-up ads." (153) |
| H1 | Learn football for kids, the fun and safe way. | Free soccer games for kids | The Futbol Island library | Play Futbol Island |
| Canonical / robots | `/`, indexable | `/games`, indexable | `/library`, indexable | `/play`, indexable, no X-Robots-Tag |
| hreflang | en / es / x-default | none (no Spanish page) | en / es / x-default | none |
| og / twitter | site default picture, summary_large_image | own picture (`/games/free-soccer-games-for-kids-og.jpg`) | site default picture | site default picture |
| JSON-LD | WebSite (+SearchAction), Organization, WebApplication+VideoGame, FAQPage | BreadcrumbList, ItemList, FAQPage | BreadcrumbList, CollectionPage (+ItemList of 15 sections) | WebApplication+VideoGame (screenshots) |
| Words in `<main>` | ~950 | ~1,700 | ~990 | ~420 (title screen + "For grown-ups") |
| Search Console (28 d) | 34 clicks, 67 impr., pos. 2.7 (brand: "futbol island" pos. 4.4, "futbal island" pos. 2) | 1 click, 27 impr., pos. 6.7 | new page (live `/library` is 404 until deploy; `/learn` 308s to it on this branch) | 0 clicks, 25 impr., pos. 3.2 (brand-type searches) |

The site's measured demand is long-tail (rules and terms pages: yellow card, 2v1, through ball, futsal rules). None of the four
pages has measurable non-brand queries yet, so the target sets below come from what each page truthfully offers and the words
the snapshot shows people use ("soccer" far more than "football").

### Target queries and intent

| Page | Owns (intent) |
|---|---|
| Island `/` | brand ("futbol island", misspellings), "soccer game for kids", "football game for kids", "free soccer game for kids", "learn soccer game", "soccer learning game" (parents looking for a safe, free game that teaches) |
| Games `/games` | "free soccer games for kids", "football games for kids", "soccer games online", "soccer arcade games", "soccer games for school / Chromebook" (only as the FAQ already states: works where the school filter allows futbolisland.app; never "unblocked") |
| Library `/library` | "learn soccer", "learn soccer for kids", "soccer lessons for kids", "soccer rules for kids" (broad; the rules hub owns the specific rule queries), "football for kids guide", "soccer for beginners" |
| Play `/play` | "play soccer game online free", "3D soccer game browser", "free soccer game no download", brand + "play" (people ready to play now) |

## 2. `/play`

- Indexable: no robots meta, no X-Robots-Tag, self canonical `/play`, in `/sitemap.xml` at priority 0.3 (lastmod Nov 12).
- What a crawler gets (live and preview, Googlebot UA): a real `<title>`, description, og/twitter, one h1 "Play Futbol Island",
  the title screen's text ("Futbol Island is a free football learning game for kids aged 7 to 12 ...", "save code") and the
  "For grown-ups" panel (why, what your child learns, privacy, partners): about 420 words, server-rendered. So there is
  already an SSR text block that the game covers once it boots. No `<noscript>` needed.
- Links out of `/play`: only `/privacy` and `/learn/lessons` ("Guides"); no link to `/`, `/games` or `/library` (the title screen has no
  site header by design).
- Tests: `tests/seo-pages.cjs` requires `/play` to be indexable, have one h1, the words "free football learning game" and "save
  code", and the title screen + game markers; it puts `/play` below `/about` in sitemap priority (Nov 3 "low priority" decision,
  now overruled by "Also play"). No test forbids Play links or text in the static HTML; the reading pages' gold Play buttons must
  go to `/play` (seo-design), which helps.
- Right way to rank it without touching the game: a sharper title/description ("3D soccer game", "in your browser", "no download"),
  sitemap priority raised to match the other three, the existing VideoGame schema kept and given `sameAs` (its itch.io page).
  Adding words or links to the title screen itself changes the game's first screen: owner decision.

## 3. Internal links (preview, one page of every type)

Every page links to all four from the header (Island/Games/Library/Play; anchors "Island", "Games", "Library", "Play") and the
footer columns; the four never get body links from most templates:

| Page type | Body link to `/library` | Body link to `/games` | Body link to `/play` | Body link to `/` |
|---|---|---|---|---|
| Guide pages (rules, terms, positions, formations) | "Everything in the Library" (onward row) | none | "Try it in the game", "Play free" | none |
| Hubs (lessons, rules, tools, age groups, videos, cards, books, fish, museum) | only the rail's "Back" | none | yes ("Play it on the island" etc.) | none |
| Drills, practice plans, tools, lessons, cards, books, fish, exhibits detail | none | none | yes | none |
| Game pages | none | "All eleven free soccer games" | "Play the whole island" | none |
| `/library` | – | "See all 11 games" | "Play the game" | none |
| `/games` | none (header only) | – | "Play Futbol Island" | none |
| `/`, `/about`, `/marketing` | none | none | "Start Playing" | – |
| `/play` | none | none | – | none |

Plan: one contextual card to the Library and one to the Games hub inside the existing **Keep reading** grid (used by guide,
drill, card, book and fish pages and the hubs), with descriptive anchors ("Learn soccer: the whole Library", "Free soccer games
for kids"), skipped where the grid already links there. The home page and the title screen are layouts the owner rules on
(see decisions). Anchor "Everything in the Library" is the owner's onward-row wording from today and stays.

## 4. Cannibalisation

| Pair | Finding | Decision |
|---|---|---|
| `/` vs `/about` | "Futbol Island: Free Football Game and Lessons for Kids" vs "About Futbol Island: A Free Football Game for Kids": near-identical | Retitle `/` around "soccer game for kids to learn football"; `/about` stays the "about" page |
| `/play` vs `/marketing` | "Free Football Learning Game" in both | Retitle `/play` ("Free 3D Soccer Game in Your Browser"); `/marketing` keeps "Overview" |
| `/library` vs `/learn/lessons` | "Lessons" in both titles | Library takes the broad "Learn soccer for kids"; lessons keeps "Football Lessons and Quizzes for Kids" |
| `/library` vs `/learn/football-rules-for-kids`, `/learn/soccer-rules` | rule queries | Leave: the rules pages own rule queries; the Library links to them |
| `/games` vs `/games/<game>` | game pages own "soccer X game" | Leave |
| `/safe-football-game-for-kids` vs `/` | "safe football game for kids" only on the parents' guide | Leave |
| `/learn` | 308 to `/library` (and `/learn?q=` stays the noindex search); `/es/learn` 308s to `/es/library` | Leave; not in the sitemap |
| Spanish | `/es` and `/es/library` pair correctly with `/` and `/library` (hreflang en/es/x-default both ways, self canonicals) | `/es/library` og:type is "article": make it "website" like `/es` |

## 5. Technical items from the new layout

- Sitemap: `/library` and `/es/library` are listed with hreflang and lastmod Nov 20, priority 0.8; `/games` 0.8; `/play` 0.3.
  Raise all three (and `/es/library`) to 0.9 so the four are the top entries after `/` (Google ignores priority, other crawlers
  read it; cheap and matches the owner's direction).
- Breadcrumbs: visible and JSON-LD come from the same `crumbs` array on every page, so they already match. Guide pages read
  Home › Lessons › Soccer rules › Offside (`guideCrumbs`, `lib/site/guides.ts`). With the Library as the hub, Home › Library ›
  Soccer rules › Offside fits the new structure: owner decision (visible change on hundreds of pages; the side-nav audit is in progress).
- `/games` schema: ItemList only; make it a CollectionPage whose mainEntity is the ItemList (as `/library`).
- WebSite SearchAction points at `/learn?q=` (still the working search). Google retired the sitelinks search box; harmless, kept.
  SiteNavigationElement has no search feature; not added.
- og images: `/games` has its own; `/`, `/library`, `/play` use the site default. A Library share picture needs a picture: owner
  decision / pictures lane.
- `llms.txt`: no line for `/library`; add it at the top of "About" next to Home and Play.
- Nothing among the four is noindexed; no reverse case found.

## 6. Ranked actions

| # | Action | Files | Effect | Risk | Owner? |
|---|---|---|---|---|---|
| 1 | New titles/descriptions/og for the four (+ `/es/library`) | `lib/site/seo.ts`, `lib/site/games.ts`, `lib/site/library.ts`, `app/play/page.tsx`, `components/es/pages/LibraryEs.tsx` | CTR and relevance for the target sets; ends `/`–`/about` and `/play`–`/marketing` overlap | low | no |
| 2 | Library H1 "Learn soccer: the Futbol Island library" (EN/ES) | `lib/site/library.ts`, `components/es/pages/LibraryEs.tsx`, `tests/library.cjs` | H1 matches the main query | low | no |
| 3 | Keep reading gets Library + Games cards | `components/site/KeepReading.tsx` | descriptive body links to two priority pages from every guide/hub/detail type | low (one more card) | no |
| 4 | Sitemap priority 0.9 for `/games`, `/library`, `/play` | `lib/site/paths.ts`, `tests/seo-pages.cjs` | crawl hint | none | no |
| 5 | `/games` CollectionPage; `/play` game `sameAs` | `lib/site/games.ts`, `lib/site/seo.ts` | clearer entities | low | no |
| 6 | llms.txt Library line; `/es/library` og:type website | `lib/site/llms.ts`, `lib/i18n/es/seo.ts` | AI answers name the hub | none | no |
| 7 | Breadcrumbs Home › Library › section › page | `lib/site/guides.ts` and the other crumb builders, tests | hierarchy signal for the hub | medium (visible, many tests) | **yes** |
| 8 | Home body links to Library and Games (e.g. in "Learn the game" / "Even more to explore") | `app/(site)/page.tsx` | strongest internal page passes weight to the hubs | low, but home layout | **yes** |
| 9 | Title screen links/words for `/play` (a small "Library · Games" text row in "For grown-ups") | `components/landing/*` | `/play` passes weight on; more text | touches the game's first screen | **yes** |
| 10 | Share pictures for `/library`, `/play` | pictures lane | better social/Discover cards | none | **yes** (picture choice) |
| 11 | Home H1 "Learn football for kids" → mention "soccer" | home hero | US query wording | home hero copy | **yes** |

## Status (end of Nov 20 2026)

Done, one commit each: actions 1 (titles/descriptions EN + `/es/library`), 2 (Library H1 EN/ES, `/games` section "The eleven soccer
arcade games"), 3 (Keep reading Library + Games cards, EN/ES), 4 (sitemap .9), 5 (`/games` CollectionPage, game `sameAs`), 6 (llms.txt,
`/es/library` og:type). Open, waiting for the owner: 7 to 11. Not done: the `/es` home title/description (already "juego de fútbol
gratis para niños"; left as is), a phone/desktop look at the Keep reading grid with its two new cards.
