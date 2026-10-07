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
  { source: '/splash/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
  // Admin analytics (Oct 7 2026): never indexed, never cached.
  { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
  { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
  { source: '/api/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
];
// `/` is prerendered static (CDN-cached). The only query it used to read on the server, ?from=arcade|konbini|museum (spawn
// outside that door, walking, return loading screen), is a rewrite to the equally static /island-return, so neither page
// renders per request. The URL in the address bar stays /?from=…; ?store= is read by Town on the client (it always was).
const rewrites = { beforeFiles: [{ source: '/', has: [{ type: 'query', key: 'from', value: '^(arcade|konbini|museum)$' }], destination: '/island-return' }] };
export default phase => ({ reactStrictMode: true, distDir: phase === 'phase-development-server' ? '.next-dev' : '.next', async headers() { return cacheStatic; }, async rewrites() { return rewrites; } });
