# Reference pages design (Oct 17 2026)

The static reference pages under `app/(site)/` (about, learn + 96 lessons, fish + 97 species (Nov 6 2026; grows with the Fishbook), cards + 450 cards, exhibits + 22
exhibits) exist for search engines and AI assistants. They teach the same football as the island (positions, tactics, rules, club
history), so they should read clearly. Since Nov 10 2026 (owner: "fix all these pages to match more with the main site") they share the home
page's bar and look; the Oct 16 "no section navigation" rule is retired. Each page still has one gold "Play" button of its own
(near the top of index pages, at the end of detail pages). SEO pieces (titles, descriptions, canonicals, JSON-LD, breadcrumb markup) are
unchanged, and lessons never show the correct quiz answer.

All styling is in one module, `app/(site)/site.module.css`. Pages use its named classes only. They add no scripts and no animation,
and the one shared image is the button grain the title screen already uses (phone heat, AGENTS.md).

## Look (Nov 10 2026): one site with the home page

The home page `/` (`app/(site)/page.tsx`, `components/learn/learn.module.css`) is the design source of truth. Reading pages add
no visual language of their own: no other fonts, colours, radii or shadows than home uses. The Oct 17 look (cream `#fff8e7`,
green ink, dark green header, IslandBrush title with a gold shadow, beige outlined cards) is gone.

- **Shell** (`app/(site)/layout.tsx`): `components/site/SiteNav.tsx` is the home bar as static HTML: 68 px sticky bar on paper
  with a hairline, the IslandBrush wordmark with one logo colour per letter, Learn / Explore / Friends / Safety / About, and the
  gold Play pill (`DoneButton.module.css` face on a plain link to `/play`). Phones (640 px and under): menu button, logo, Play;
  the menu is a native `<details>`. Links go to the hubs (`/learn/lessons`, the parents' guide, `/about`) or a home chapter
  (`/#explore`, `/#together`). The footer is the one home ends on. The header must stay a direct `<header>` child: `/` and
  `/marketing` bring their own bar and hide it.
- **Colour**: paper `#fbf7ee`, tint `#ecefdf` (cards, tables), well `#efe8d7` (picture panels), ink `#14221d`, soft ink
  `#5b675f`, gold `#e9c16b`, gold ink `#85621f`, pitch `#1d6b55`, hairline `rgb(20 34 29 / .12)`, buttons from `--btn-*`.
- **Type**: the system sans (no download). Title `clamp(38px, 3.6vw + 24px, 72px)`, weight 600, tracking -.028em, line-height
  1.04. Section h2 28 / 36, weight 600, -.025em. h3 19 / 22, weight 700. Body 17 / 18, line-height 1.55. Lead 20 / 24, weight
  500, soft ink. Caption 15. Label 13, sentence case. IslandBrush is the wordmark only; never on buttons (AGENTS.md).
- **Layout**: one centred reading column of 736 px; the page head (`intro`: breadcrumb, title, lead, button) is centred and
  spreads to about 1016 px from 1100 px wide. Gutters 16 on phones, 24 from 720 px. 40 / 56 between sections, 16 inside.
- **Parts**: `card` is a tint step with a 24 radius, no outline, no shadow. `art` is the home media frame (well, large radius,
  soft shadow). `list` is home's link list: plain rows, title underlined in gold, two columns from 720 px. Links in running
  text are ink with a gold underline. `cta` is home's gold button. Tables sit in a tint `tableWrap` that scrolls sideways on
  its own; the page never does. Pitch diagrams: pitch-green grass, white lines, gold numbered players, white goalkeeper.
- **Classes** (names are stable; pages use these only): `intro`, `crumbs`, `eyebrow`, `title`, `lead`, `section`, `h2`, `h3`,
  `count`, `caption`, `card`, `stack`, `label`, `art`, `list`/`itemTitle`/`itemMeta`, `cta`, `end`, `pager`, `bare`, `options`,
  `figure`, `pair`, `tableWrap`/`table`.

## Rules that did not change

- Static pages: `force-static`, server components only, no client JavaScript, no video, no WebGL, no animation loops, no
  scroll listeners (AGENTS.md, phone heat). The bar is not blurred and nothing in it moves.
- Tap targets at least 44 px, body text at least 16 px, no horizontal page scroll (checked at 390 px on 13 page types).
- `color-scheme: light` on the pages and on html/body. Breadcrumbs sit above the title; the H1 is the first heading.
- Content rules: fact / fiction labels, CTA placement (index pages near the top, detail pages at the end), no duplicate
  back-links beside the breadcrumbs.

## Guide clusters (Nov 10 2026)

Search-targeted reading pages under `/learn`. They lead with "soccer" (title, H1, first sentence) and say "football" once near
the top. They are SEO-only: not linked from the home page; reached from lesson pages ("Related guides"), "More to learn" on
the hubs, `llms.txt` / `llms-full.txt`, the sitemap and each other.

| Cluster | URLs | Data module | Test |
|---|---|---|---|
| Formations | `/learn/soccer-formations`, `/learn/soccer-formations/<slug>`, `/learn/{7v7,9v9,11v11}-soccer-formations` | `lib/site/formations.ts` | `tests/seo-formations-positions.cjs` |
| Positions | `/learn/soccer-positions`, `/learn/soccer-positions/<slug>` | `lib/site/positions.ts` | same |
| Rules | `/learn/soccer-rules`, `/learn/soccer-rules/<slug>` (16) | `lib/site/rules.ts` | `tests/seo-rules-terms-sizes.cjs` |
| Size charts | `/learn/soccer-ball-size-by-age`, `/learn/soccer-field-size-by-age`, `/learn/soccer-age-groups` | `lib/site/sizes.ts` (view: `app/(site)/learn/ChartView.tsx`) | same |
| Glossary | `/learn/soccer-terms` (A-Z, one anchor per term, `DefinedTermSet`), `/learn/soccer-terms/<slug>` (18) | `lib/site/terms.ts` | same |

- Registry: `lib/site/guides.ts`. `GUIDE_PAGES` = formations + positions, `REFERENCE_PAGES` = rules, charts, glossary,
  `ALL_GUIDE_PAGES` = both (sitemap, llms, lesson back-links).
- Diagrams: `lib/site/PitchDiagram.tsx` (inline SVG) and `lib/site/pitchImage.tsx` (PNG at `/learn/diagrams/<file>.png`).
  Formations place a team from `lib/site/pitch.ts`. Rules and terms use a scene (`lib/site/scenes.ts`): dots for two teams
  (gold attacks up, dark green defends), a ball, an optional dashed line, an optional shaded zone, run and pass arrows. Each
  scene has a hand-written caption that is also the SVG `<desc>`.
- Shared sections: `lib/site/GuideParts.tsx` (`GuideIntro`, `Section`, `Diagram`, `SceneDiagram`, `DataTable`, `LessonList`,
  `LinkList`, `GuideEnd`). Tables always have column and row header cells. Classes from `site.module.css` only.
- To add a page: add one entry to the data module (the module throws on a wrong lesson or exhibit id, and a rule's answer
  must be exactly two sentences). The route, sitemap, llms files and picture follow. A new single-segment `/learn/<slug>`
  must also go in the exclusion list of the `/learn/:slug` redirect in `next.config.mjs`.
- Facts: each data module starts with its source list and the date checked. Laws from theifab.com, US youth standards from
  U.S. Soccer and US Youth Soccer, futsal from FIFA's Futsal Laws. Where organisations differ the page says so and names the
  source per row. Detail pages may link out to the cited law only.

## Coach tools and printables (Nov 10 2026)

Free tools under `/tools`, built to be bookmarked, shared and linked: `/tools` (hub), the lineup builder
(`/tools/soccer-lineup-builder` + `7v7-`, `9v9-`, `11v11-`, `futsal-lineup-builder`), the playing-time planner
(`/tools/soccer-playing-time-calculator` + `7v7-` and `9v9-substitution-rotation`) and the printables
(`/tools/soccer-field-diagrams`, one page per sheet, files under `/tools/soccer-field-diagrams/files/<name>.svg|.png`).
Like the guide clusters they are not linked from the home page.

- Registry: `lib/site/tools/registry.ts` (`TOOL_PAGES`, `TOOL_HUBS`, all page words, JSON-LD helpers). It feeds the sitemap,
  `llms.txt`, `llms-full.txt`, "More to learn" and `/sitemap-images.xml` (`lib/site/tools/imageSitemap.ts`; Next 14.2 has no
  `images` field in `MetadataRoute.Sitemap`). Test: `tests/seo-tools.cjs`.
- The two tools are client components (`components/site/tools/LineupBuilder.tsx`, `RotationPlanner.tsx`): the one allowed
  exception to "no client JavaScript on reading pages", because the coach drives them. Rules: SVG and pointer / key events
  only, no timers, no animation loops, no WebGL, no network, no analytics of anything typed. State lives in the component,
  in `localStorage` (try/catch) and, only on "Copy link", in the URL fragment (`#l=` / `#r=`), never the query string. The
  server renders the default diagram or plan, so the page is real content without JavaScript. They must not import
  `lib/site/formations.ts` (it reads the lesson catalog from disk): the page passes `SHAPES` in as a prop.
- The scheduler is a pure function, `lib/site/tools/rotation.ts` (test: `tests/tools-rotation.cjs`).
- Sheets: `lib/site/tools/sheet.ts` holds a printable as data (shapes and text on a US Letter page). One layout, three
  renderers: inline SVG (`SheetSvg.tsx`), the `.svg` file (`toSvgString`) and the `.png` (`sheetImage.tsx`). Printables are
  black on white with the licence line and a `futbolisland.app` credit on the sheet. Printing a tool or printable page
  prints the sheet alone (`tools.module.css`: `.screen` / `.printOnly`).
- Look: `components/site/tools/tools.module.css` adds controls only (inputs, chips, dark pill buttons at weight 800 in the UI
  sans) from the same variables; everything else uses `site.module.css`.

## Design + engagement pass (Nov 15 2026, owner items 6, 7, 8, 10, 11)

Owner: "use the design taste skills to fix the pages", "make sure this all works on mobile; spacing, colors and fonts are
consistent". The look above is unchanged; the pass made it one system and added four small client islands. Test:
`tests/seo-design.cjs`.

- **Tokens** (`site.module.css` `.page`): spacing `--s1..--s5`, type `--t-title/h2/h3/body/lead/cap/label`, radii `--r-lg` 24 /
  `--r-md` 16 / `--r-sm` 12 / `--r-pill`, box padding `--pad-box` (20 / 28), tap size `--tap` 44. `tools.module.css` and
  `games.module.css` use the same radii. No inline style one-offs on reading templates.
- **One style each**: the answer lead (`.lead[data-answer]`: full ink, left-aligned on phones), FAQ and mix-ups (`card`),
  Coach's notes (`Section panel`: the well tone), the end block (`endNote`: the guide line + "Last checked"), Read next and
  card / fish neighbours (`pager`: two tap blocks, a small word over the title, next first on phones), tables (`tableWrap`,
  the row header sticks while a wide table scrolls on phones), link grids (`list`), breadcrumbs (`crumbs`).
- **Client islands, the only exceptions besides the coach tools.** Each is small, has no timers or scroll listeners, sends
  nothing, and the page reads fully without it:
  - Animated scene diagrams (`SceneDiagram animate`, `lib/site/sceneMotion.ts`, `components/site/MotionToggle.tsx`): the
    scene's own arrows become CSS keyframes on the existing SVG dots (2v1, give-and-go, through ball, cutback, overlap,
    pressing, offside). A Pause button; paused off screen (IntersectionObserver); prefers-reduced-motion and print show the
    still picture, which is the same drawing as the PNG in `/sitemap-images.xml`. Caption, `<title>` and `<desc>` unchanged.
  - The end-of-guide quiz (`components/site/GuideQuiz.tsx`, `lib/site/guideQuiz.ts`) on rules, terms and positions pages:
    three questions built only from the page's own words (mix-ups, meanings, how-to vs mistakes, where / who / letters).
    The game's lesson quizzes are not reused, so lesson pages still never give their answers away.
  - The phones' "Play free" bar (`components/site/PlayBar.tsx`, via `PlayEnd` / `GuideEnd`): under 768 px only, after the
    intro, hidden while an in-page Play button shows, pads the page, "Hide" for the visit (sessionStorage). Not on tools.
- **"Play this in the game"**: a detail page's gold button opens `/play?go=lesson:<id>` (guides, drills, lessons) or
  `/play?go=fish:<shore spot>` ("Catch it at <spot>"); card pages open the pack shop (`/play?store=packs`; cards have no
  island location). The island validates `go=` against its own lessons and spots (`lib/play/deepLink.ts`) after boot,
  runs it through the Welcome back card's actions, ignores anything else, and removes the param. The lesson's reading page
  stays linked in "Lessons that teach it".

## Games pages with gameplay footage (Nov 16 2026)

Owner: "fix /games to include more screenshots of the game and videos of the game. Make this page more visual and engaging."
The one exception to "no video" on reading pages, and only on `/games` and `/games/<slug>` (`lib/site/gameMedia.ts`).

- **Media**: real captures of the production build (CDP screencast in headless Chrome): one silent loop per arcade game, a
  three-phone hero loop, and island loops (walk, jetpack, stadium, fishing bite + trophy card, arcade room; museum, beach match,
  Kit Shop studio and plaza re-cut from the Nov 3 /learn captures). 720 px long side, H.264 MP4 + VP9 WebM, poster WebP from a
  sharper still. Sizes and durations live in `lib/site/gameMedia.json`. Files: `public/games/clips`, `public/games/shots`.
- **LoopClip** (`components/site/games/LoopClip.tsx`): server HTML is the poster `<img>` (real size, so no shift) and a 48 px
  Play/Pause button. The `<video>` is created on the client only when it may play: the hub hero once on screen; every other
  clip on hover (mouse) or tap. Never with prefers-reduced-motion or Save-Data on the hero; paused off screen and when the tab
  is hidden; one clip plays at a time. Muted, playsInline, loop, preload="none". No third-party player.
- **Hub layout**: intro, the hero loop on a pitch-green field with the gold "Play Kit Rush now", one block per game (clip,
  name, kind, what it teaches, three stills, gold "Play <game>" pill) alternating sides from 860 px, "Inside the island" as a
  sideways scroll-snap row, "Pick a game and play" (one gold pill per game), then the original parents / FAQ / guides. Wide bands
  break out of the 736 px column to 1180 px (`.bleed`). The hero poster is the LCP: preloaded, eager, fetchpriority high.
- **SEO**: VideoObject per clip (the hub's as `CollectionPage.video`; each game's as `VideoGame.trailer`), all clips in
  `/sitemap-video.xml`, stills in `/sitemap-images.xml` and `VideoGame.screenshot` (up to four per game).
