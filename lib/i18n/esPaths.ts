/**
 * Which English pages have a Spanish counterpart (Spanish round 1, Nov 15 2026; docs/i18n/HANDOFF.md). Plain data with no imports,
 * so the language switch (components/site/LangSwitch.tsx, a client island) and lib/site/seo.ts (hreflang on English pages) can
 * use it without pulling the translations in. URL strategy: the Spanish page is `/es` + the English path, English slugs kept
 * (1:1 mapping, no slug table to keep in sync); `/` -> `/es`. tests/es-pages.cjs checks this list against the Spanish data
 * (lib/i18n/es/registry.ts): a page listed here must render, and every translated record must be listed.
 */
export const ES_PREFIX='/es';
const R='/learn/soccer-rules',T='/learn/soccer-terms',P='/learn/soccer-positions';
export const ES_RULE_SLUGS=['offside','throw-in','goal-kick','corner-kick','handball','fouls-and-free-kicks','penalty-kick','yellow-and-red-cards','back-pass-rule','build-out-line','kick-off','drop-ball','advantage','substitutions-and-game-length','heading-rules-for-kids','futsal-rules'] as const;
export const ES_TERM_SLUGS=['give-and-go','third-man-run','overlap','through-ball','switching-play','two-v-one','cutback','cross','first-touch','pressing','marking','goal-side','tackle','counterattack','set-piece','nutmeg','clean-sheet','hat-trick'] as const;
export const ES_POSITION_SLUGS=['goalkeeper','center-back','fullback','wingback','defensive-midfielder','central-midfielder','attacking-midfielder','winger','striker'] as const;
/** English paths with a Spanish page. */
export const ES_PAGES:readonly string[]=['/','/about','/about/how-we-check-facts',R,...ES_RULE_SLUGS.map(s=>`${R}/${s}`),T,...ES_TERM_SLUGS.map(s=>`${T}/${s}`),P,...ES_POSITION_SLUGS.map(s=>`${P}/${s}`)];
const SET=new Set(ES_PAGES);
export const hasEs=(enPath:string)=>SET.has(enPath);
export const toEs=(enPath:string)=>enPath==='/'?ES_PREFIX:ES_PREFIX+enPath;
/** /es/learn/x -> /learn/x, /es -> / (null when the path is not a Spanish one). */
export const toEn=(esPath:string)=>esPath===ES_PREFIX||esPath===ES_PREFIX+'/'?'/':esPath.startsWith(ES_PREFIX+'/')?esPath.slice(ES_PREFIX.length):null;
/** hreflang alternates for a page pair, the same on both language versions (x-default = English). */
export const languageAlternates=(enPath:string)=>({en:enPath,es:toEs(enPath),'x-default':enPath});
