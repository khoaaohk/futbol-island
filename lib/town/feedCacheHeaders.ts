// CDN caching for the public score/news/clip feeds. Responses depend only on the URL (query string included in the CDN key),
// never on cookies or the visitor, so the shared CDN copy is safe. Good feeds: 5 minutes, then served stale for up to 10
// while one background request refreshes it. Unavailable feeds and errors: 30 seconds, so a recovery shows up quickly.
export const FEED_CACHE_OK='public, s-maxage=300, stale-while-revalidate=600';
export const FEED_CACHE_SHORT='public, s-maxage=30';
export const feedCacheHeaders=(ok:boolean)=>({'Cache-Control':ok?FEED_CACHE_OK:FEED_CACHE_SHORT});
