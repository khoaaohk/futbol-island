// Player photo masks and splash art are small static files: let browsers and the CDN reuse them for a week (a replaced
// photo refreshes in the background within a day via stale-while-revalidate) instead of re-checking on every card view.
// Public assets (Oct 7 2026 scaling pass). Without a rule Next sends `max-age=0, must-revalidate`, so every return visit
// re-checked every clip. When several rules match, the LAST one wins, so broad rules come first:
//  1. Audio, stories, lessons, museum, plays, music, models, vending, voice: one day, then served stale for a week while it refreshes.
//     NOT immutable: e.g. public/voice/kokoro_<coach>/<hash>.m4a is named by the FNV hash of the line TEXT and
//     scripts/plays/kokoro-lessons.py re-voices files in place under the same name.
//  2. JSON under those folders (lesson data, timelines, narration timing) changes between deploys under the same name: 5 min + SWR.
//  3. Content-addressed files (name = hash of the bytes or of every encoding input, never rewritten): one year, immutable.
//     stories/eleven/<film>/<part>-<sha256[:12]>.m4a (scripts/build-eleven-narration.py skips existing targets) and
//     stories/paths/chapters/ink-<sha256(bytes)[:12]>.webp (scripts/bake-path-art.mjs).
const ASSET_DIRS = 'voice|stories|lessons|museum|plays|music|models|vending|arcade-loading|fonts';
const cacheAssets = [
  { source: `/:dir(${ASSET_DIRS})/:path*`, headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
  { source: `/:dir(${ASSET_DIRS})/:path*.json`, headers: [{ key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=86400' }] },
  { source: '/stories/eleven/:film/:file([a-z0-9]+-[0-9a-f]{12}\\.m4a)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
  { source: '/stories/paths/chapters/:file(ink-[0-9a-f]{12}\\.webp)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
];
const cacheStatic = [
  ...cacheAssets,
  { source: '/players/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
  // /learn stills and clips (Nov 2 2026 QA): only the files, never the /learn page or /learn/lessons routes. Nov 3: a week + a
  // month of SWR so a return visit plays at once (the names are not content-hashed, so not `immutable`: a recapture under the
  // same name reaches everyone within a week).
  { source: '/learn/:file([a-z0-9_]+\\.webp)', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }] },
  { source: '/learn/video/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }] },
  { source: '/splash/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
  // Admin analytics (Oct 7 2026): never indexed, never cached.
  { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
  { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
  { source: '/api/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
];
// The game is at /play (Nov 3 2026, owner: the feature tour is the home page `/`, the game moved from `/`). /play is prerendered
// static (CDN-cached). The only query it used to read on the server, ?from=arcade|konbini|museum|shop (spawn outside that door,
// walking, return loading screen), is a rewrite to the equally static /island-return, so neither page renders per request. The
// URL in the address bar stays /play?from=…; ?store=, ?panel=, ?party=, ?coffee= … are read on the client (they always were).
const GAME_FROM = 'arcade|konbini|museum|shop|e2e';// lib/rootView.ts GAME_FROM
const rewrites = { beforeFiles: [{ source: '/play', has: [{ type: 'query', key: 'from', value: '^(arcade|konbini|museum|shop)$' }], destination: '/island-return' }] };
// Links the game made before Nov 3 2026 pointed at `/` with a query only the game reads: a saved arcade/shop return, a Stripe
// success/cancel URL (?coffee=, ?panel=about), a shared party invite (?party=), the Konbini store (?store=), a lesson link
// (?lesson=), and the dev/test switches (?preview=, ?unlock=, ?testCoins=). Each redirects to /play with the SAME query (Next
// passes the query through). Any other `/?…` (e.g. the printed QR card's /?from=flyer, a visit-counter tag) stays on the home page.
const GAME_QUERY_TO_PLAY = [
 { type: 'query', key: 'from', value: `^(${GAME_FROM})$` },
 ...['panel', 'party', 'store', 'coffee', 'lesson', 'preview', 'unlock', 'testCoins'].map(key => ({ type: 'query', key })),
].map(has => ({ source: '/', has: [has], destination: '/play', permanent: true }));
// Nov 2 2026: /learn became the feature tour and the lesson index moved to /learn/lessons. Old lesson URLs /learn/<id> keep
// working with a permanent redirect (search results and shared links); /learn/lessons itself is excluded from the pattern.
// Nov 3 2026: the feature tour moved to the home page, so /learn itself is a permanent redirect to `/`.
const redirects = [{ source: '/learn', destination: '/', permanent: true }, { source: '/learn/:slug((?!lessons$)[A-Za-z0-9_-]+)', destination: '/learn/lessons/:slug', permanent: true }, ...GAME_QUERY_TO_PLAY];
export default phase => ({ reactStrictMode: true, distDir: process.env.NEXT_DIST_DIR || (phase === 'phase-development-server' ? '.next-dev' : '.next'), async headers() { return cacheStatic; }, async rewrites() { return rewrites; }, async redirects() { return redirects; } });
