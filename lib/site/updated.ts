/**
 * When each section of the public site last changed IN SUBSTANCE (sitemap <lastmod>, and dateModified in the hub and lesson
 * JSON-LD). Hand-kept on purpose (SEO audit, Nov 8 2026): no build-time "now", so a redeploy never fakes freshness. Bump a date
 * only with a real content change to that section. Dates from the content's own last change (git log of its data files).
 */
export const SITE_UPDATED={
 home:'2026-11-08',// app/(site)/page.tsx: learning + safety copy, parents and coaches, links to the hubs
 play:'2026-11-08',// app/play + components/landing: h1 and first paragraph
 about:'2026-11-03',// app/(site)/about + lib/site/aboutCopy.ts
 privacy:'2026-10-22',// components/privacy/PrivacyPolicy.tsx (the policy text itself)
 marketing:'2026-11-08',// app/(site)/marketing: retitled for partners, press and coaches
 lessons:'2026-11-08',// /learn/lessons + lesson pages (template: trust line, Play this lesson, FAQ); lesson data public/lessons 2026-10-29
 hubs:'2026-11-08',// the topic hubs (lib/site/hubs.ts) and the parents' guide
 guides:'2026-11-10',// the guide clusters (lib/site/guides.ts): formations and positions with pitch diagrams; rules, size charts and the glossary
 fish:'2026-11-10',// lib/town/fishing (signature species waves); Nov 10: the drawing as a real picture, related links, share picture
 cards:'2026-11-10',// lib/site/cards.ts; Nov 10: iconic play + position lesson on every card page, related links, share picture
 exhibits:'2026-11-10',// lib/site/exhibits.ts; Nov 10: related links (lib/site/related.ts), share picture
} as const;
/** The lesson data itself (public/lessons/*.json): datePublished-style "content date" for lesson pages. */
export const LESSON_DATA_UPDATED='2026-10-29';
/** When the reading pages first went live (Oct 16 2026: the static reading pages). */
export const SITE_PUBLISHED='2026-10-16';
