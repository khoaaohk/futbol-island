# Spanish version: handoff (round 1, Nov 15 2026)

Branch `spanish-r1` (not pushed). Owner brief: US Latino neutral Spanish, "tú", glossary-driven, English is the source of truth.

## Architecture (decided, keep)

- **URLs**: `/es` + the English path, English slugs kept (1:1, no slug table). `/` -> `/es`. Registry of translated pages:
  `lib/i18n/esPaths.ts` (`ES_PAGES`, `hasEs`, `toEs`, `toEn`, `languageAlternates`). Plain data, no imports (the client
  language switch uses it).
- **`<html lang>`**: `app/layout.tsx` is a pass-through (metadata, viewport, global CSS). `components/site/HtmlShell.tsx` renders
  `<html lang>`/`<body>` + the global islands (visit counter, gates, notices). Every top-level section layout renders
  `<HtmlShell lang="en">` (14 new one-line layouts, 7 wrapped), `app/es/layout.tsx` renders `lang="es"`. `app/not-found.tsx`
  and `app/error.tsx` bring their own `<html>`. A NEW top-level route folder needs a layout with `<HtmlShell lang="en">`
  (tests/es-pages.cjs fails otherwise). Why: a root layout cannot see the URL without making every page dynamic, and Next's
  multiple-root-layouts pattern would have moved every route folder (485 test path references).
- **Rendering / build cost**: one dispatcher, `app/es/[[...path]]/page.tsx` -> `components/es/routes.tsx` (`esRoute(enPath)`).
  `generateStaticParams` returns `[]`, `dynamicParams=true`, `revalidate=false`: nothing Spanish is prerendered at build;
  each page renders on first request and is cached until the next deploy. Unknown /es paths -> `app/es/not-found.tsx`.
- **Data**: translations live in `lib/i18n/es/<family>.ts`, typed by `lib/i18n/es/types.ts`, keyed by the English slug, holding
  only words. `lib/i18n/es/registry.ts` merges them over the English records (diagram coordinates, lessons, dates stay English)
  and throws if one is missing. Arrays are 1:1 with English (tests check lengths).
- **Spanish UI parts**: `components/es/EsParts.tsx` (intro, breadcrumbs, scene diagram, end block, coach's notes, print sheet,
  read next) reuse the English CSS classes; English components are untouched except optional `lang="es"` props on the client
  islands `GuideQuiz`, `PlayBar`, `MotionToggle` (English output identical without the prop). Shared words: `lib/i18n/es/ui.ts`.
  Spanish quizzes: `lib/i18n/es/quiz.ts` (same recipe and hash as lib/site/guideQuiz.ts). Diagram labels: `esLines` /
  `describeEs` in registry.ts (POR, DFC, LD/LI, MC, MCO, ED/EI, DC...).
- **SEO**: `esMeta` (lib/i18n/es/seo.ts): self canonical `/es/...`, hreflang en/es/x-default (x-default = English), OG `es_US`.
  English `pageMeta` adds the same `languages` set when `hasEs(path)` (only change to English output, plus the footer switch).
  JSON-LD: English helpers wrapped by `esLd()` (forces every `inLanguage` to "es"). Sitemap (`app/sitemap.ts`): the Spanish
  entry follows its English one, both with the same xhtml:link alternates.
- **Language switch**: `components/site/LangSwitch.tsx` (client, usePathname, prerendered): `EN | ES` in the English reading
  footer and in the Spanish header + footer, only where a counterpart exists. No redirects of any kind.
- **Analytics**: unchanged; /es pages are counted by path like any page (same HtmlShell tracker).
- **Glossary**: `lib/i18n/es-glossary.ts` (choices + `ES_BANNED`). Regate (not gambeta), penal (not penalti), arco, cancha,
  balón, portero, fuera de juego, saque de banda, U-labels and 7v7/9v9/11v11 kept as in US leagues.

## Done (round 1)

Home `/es`, `/es/about`, `/es/about/how-we-check-facts`, rules hub + 16 rules, terms hub (full A-Z glossary) + 18 terms,
positions hub + 9 positions. Each: title/desc/H1/answer-first lead/body/FAQ + FAQPage JSON-LD/coach's notes/quiz/diagram
captions and aria/breadcrumbs/related/Last checked/buttons/print sheet/read next.
Sections deliberately left off Spanish guide pages until their families exist: lesson lists (English lesson titles), drills,
player cards, museum/arcade links, formation links, comparisons. Add them back as each family lands (GuidesEs.tsx `esLink`).

## Pending (by family; tests/es-pages.cjs prints the counts; patterns in lib/i18n/esScope.ts)

1. comparisons (3): fullback-vs-wingback, striker-vs-winger, 4-3-3-vs-4-4-2 (lib/site/comparisons.ts).
2. formations (hub + 17 + 7v7/9v9/11v11 guides + 7v7-9v9-11v11) (lib/site/formations.ts, FORMATION_NOTES).
3. drills (hub + 56) (lib/site/drills*.ts, drillGuides.ts, notesDrills.ts).
4. practice plans (hub + 12) (lib/site/plans.ts).
5. lessons (index + 96 reading pages) (lib/site/lessons.ts + public/lessons JSON).
6. guide hubs and charts: football-rules-for-kids, soccer-quiz-for-kids, passing-and-support, futsal-for-kids, ball/field size,
   age groups, safe-football-game-for-kids.
7. tools (hub + 7 tools + field diagrams 10): copy and page-level tool UI labels.
8. Spanish search on /es/learn (a Spanish index from the registry, same LearnSearch UI with Spanish labels).
Out of scope (later rounds): cards, fish, exhibits, games pages, /play, admin, privacy.

Recipe per family: add `XxxEs` type -> `lib/i18n/es/xxx.ts` (translator brief: glossary, 1:1 arrays, title <= 60, desc 70-155,
answer 40-60 words) -> merge in registry.ts -> page component in components/es/pages -> route in routes.tsx -> slugs in
esPaths.ts (ES_PAGES) -> remove the family from ES_PENDING -> `node tests/es-pages.cjs`.

## Build cost (measured locally, `next build`, NEXT_DIST_DIR=.next-es, 16 GB Mac)

| build | wall time | peak RSS (largest process) |
|---|---|---|
| origin/main b631f5de | 129.0 s | 4.49 GB |
| spanish-r1 | 129.0 s / 129.9 s | 5.04 GB / 5.19 GB |
| spanish-r1 without app/es | 129.3 s | 4.85 GB |

Time is unchanged, peak memory is +12-15% (over the +10% budget; run-to-run noise about 3%). About half comes from the
per-section layouts, half from compiling the /es route; /es prerenders nothing. NEXT STEP: check the real Vercel build peak;
if it is tight, ideas: let `app/es` import the page data lazily per family (`import()` inside routes.tsx), or merge the 14
one-line lab layouts into fewer route groups.

## Unsure terms (for a native reviewer)

- goal-side "lado del arco"; cutback "centro atrás"; third-man run "tercer hombre"; jockeying "temporizar"; rest defense
  "equilibrio defensivo"; clean sheet "arco en cero" (also "valla invicta"); nutmeg "caño" (also "túnel"); hat-trick "triplete".
- Futsal goal clearance "saque de portero" (FIFA Spanish says "saque de meta", which would erase the English distinction).
- Positions: striker "delantero centro" (DC), holding midfielder "mediocampista de contención", box-to-box "de área a área",
  inverted winger "extremo a pierna cambiada"; quiz `suits` opening is "Es ideal para ".
- Punt / drop-kick "despejar de volea / de bote pronto"; high school "preparatoria"; sin bins "exclusiones temporales".
- Game UI names stay English with a gloss ("Play with friends" (jugar con amigos)): the game itself is English for now.
- Age label "U13 and up" is kept as the data key and shown as "U13 y mayores" (EsCoachNotes).
