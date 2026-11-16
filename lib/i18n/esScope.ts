/**
 * Spanish round-1 scope (owner, Nov 15 2026; docs/i18n/HANDOFF.md). tests/es-pages.cjs: every sitemap page either has a Spanish
 * version (lib/i18n/esPaths.ts), is out of scope for now, or belongs to a PENDING family listed here. A family leaves PENDING
 * when its pages are added to ES_PAGES.
 */
/** Later rounds (not in round 1): cards, fish, collection hubs of cards and fish, exhibits, games pages, the game, admin. */
export const ES_OUT_OF_SCOPE:readonly RegExp[]=[/^\/(play|privacy|marketing|games|cards|fish|exhibits)(\/|$)/];
/** In scope, not translated yet: [family, pattern]. */
export const ES_PENDING:readonly (readonly [string,RegExp])[]=[
 ['lessons',/^\/learn\/(lessons(\/.*)?|7v7-9v9-11v11)$/],
 ['guide hubs and charts',/^\/(learn\/(football-rules-for-kids|soccer-quiz-for-kids|passing-and-support|futsal-for-kids|soccer-ball-size-by-age|soccer-field-size-by-age|soccer-age-groups)|safe-football-game-for-kids)$/],
 ['tools',/^\/tools(\/.*)?$/],
];
export const esPendingFamily=(path:string)=>ES_PENDING.find(([,re])=>re.test(path))?.[0]??null;
