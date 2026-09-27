// Player photo masks and splash art are small static files: let browsers and the CDN reuse them for a week (a replaced
// photo refreshes in the background within a day via stale-while-revalidate) instead of re-checking on every card view.
const cacheStatic = [
  { source: '/players/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
  { source: '/splash/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
];
export default phase => ({ reactStrictMode: true, distDir: phase === 'phase-development-server' ? '.next-dev' : '.next', async headers() { return cacheStatic; } });
