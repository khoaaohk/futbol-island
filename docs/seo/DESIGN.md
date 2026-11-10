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
  `#5b675f`, gold `#e9c16b`, gold ink `#8a6620`, pitch `#1d6b55`, hairline `rgb(20 34 29 / .12)`, buttons from `--btn-*`.
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
