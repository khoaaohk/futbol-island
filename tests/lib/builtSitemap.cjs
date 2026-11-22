// The built sitemap's page URLs (Nov 21 2026): /sitemap.xml is a sitemap index (lib/site/sitemaps.ts), so this reads the index in
// <dist>/server/app/sitemap.xml.body and returns the text of every family sitemap it names (sitemaps/<family>.xml.body), joined,
// for tests that match <loc>…</loc>. An old single <urlset> sitemap is returned as it is.
const fs = require('fs'), path = require('path');
module.exports = function builtSitemap(app) {
  const index = fs.readFileSync(path.join(app, 'sitemap.xml.body'), 'utf8');
  if (!/<sitemapindex\b/.test(index)) return index;
  return [...index.matchAll(/<loc>[^<]*?\/(sitemaps\/[^<]+\.xml)<\/loc>/g)].map(m => fs.readFileSync(path.join(app, m[1] + '.body'), 'utf8')).join('\n');
};
