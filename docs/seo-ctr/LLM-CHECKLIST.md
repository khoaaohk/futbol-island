# Writing pages for search snippets and AI assistants (Nov 16 2026)

Owner: "make sure all these pages are written for LLM searches as well". AI crawlers are already allowed (`app/robots.ts`,
checked by tests/seo-pages.cjs) and `/llms.txt` is built from data (`lib/site/llms.ts`). These rules are for the words.
`tests/seo-answers.cjs` checks rules 1-3 for every term, rule, position and drill-guide page.

1. **Answer first.** The first sentence (the `answer` or `lead` field, rendered with `data-answer`) answers the page's main
   query on its own, in 45 words or fewer, and says "soccer" (or futsal / football). Write it so it can be quoted with no
   context: "A through ball in soccer (football) is a pass ...", not "It is a pass ...".
2. **Name the thing.** A term page's first sentence names the term or one of its `also` names, in the words people type
   (hat trick and hat-trick, cutback and cut back, 2v1 and two v one).
3. **Question-shaped headings and FAQs.** H2s and FAQ questions match real queries ("What number is a center back?",
   "How long is a soccer game?") and end with "?". 3-5 FAQs per page; each answer is a full sentence that stands alone.
   FAQPage JSON-LD comes from `faqLd()` where the page family already emits it. Do not invent new schema types.
4. **Short facts in lists and tables.** Numbers, distances, ages and durations go in a list or a `DataTable` (one header
   row, one header cell per row), with units in both systems where the site already does (10 yards, 9.15 m).
5. **Cite the source and the date.** Facts come from the IFAB Laws, FIFA Futsal Laws, U.S. Soccer or US Youth Soccer, named
   in the data file's SOURCES comment with the date checked. Pages end with `GuideEnd checked=...` ("Last checked" + "How we
   check facts"). No statistics, records or named players unless verified.
6. **Titles.** Main query first, plain words, 30-60 characters, no clickbait; the page families' tests enforce length and
   uniqueness. Descriptions 120-155 characters, leading with the query where it reads naturally.
7. **One page per question.** Before adding a page, check the glossary, the comparisons and the existing tables; improve an
   existing page rather than writing a near-duplicate.
8. **List it.** New pages go through the family registry (sitemap, search index, read-next chain, lastmod via
   `scripts/gen-lastmod.cjs`). A page that answers a common question also goes in the "Short answers" list in
   `lib/site/llms.ts` (ANSWER_TERMS / ANSWER_RULES). App shells that are noindex (/scan, /coach) are named in llms.txt as
   plain text, never linked as pages.
9. **Spanish.** When the family has Spanish data (`lib/i18n/es/*`), add the Spanish record and the slug in
   `lib/i18n/esPaths.ts`; otherwise list the path in `ES_PENDING` (`lib/i18n/esScope.ts`).
