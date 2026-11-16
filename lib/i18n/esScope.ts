/**
 * Spanish round-1 scope (owner, Nov 15 2026; docs/i18n/HANDOFF.md). tests/es-pages.cjs: every sitemap page either has a Spanish
 * version (lib/i18n/esPaths.ts), is out of scope for now, or belongs to a PENDING family listed here. A family leaves PENDING
 * when its pages are added to ES_PAGES.
 */
/** Later rounds (not in round 1): cards, fish, collection hubs of cards and fish, exhibits, games pages, the game, admin. */
export const ES_OUT_OF_SCOPE:readonly RegExp[]=[/^\/(play|privacy|marketing|games|cards|fish|exhibits)(\/|$)/];
/** In scope, not translated yet: [family, pattern]. */
export const ES_PENDING:readonly (readonly [string,RegExp])[]=[
];
export const esPendingFamily=(path:string)=>ES_PENDING.find(([,re])=>re.test(path))?.[0]??null;
