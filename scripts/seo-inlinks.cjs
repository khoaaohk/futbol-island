#!/usr/bin/env node
/**
 * Internal inlinks of a running production build (SEO foundation, Nov 20 2026). Starts from /sitemap.xml, follows every
 * internal <a href> it finds (so the noindex single card pages are crawled too), and counts, for each page, how many OTHER
 * pages link to it: in total, from English pages only, and from inside <main> (not the header or footer).
 * Usage: node scripts/seo-inlinks.cjs http://localhost:9022 [path ...]   (no paths: the SEO target pages and the /books pages)
 *        add --json <file> to save every page's counts.
 */
const base = (process.argv[2] || '').replace(/\/$/, '');
if (!/^https?:\/\//.test(base)) { console.error('usage: node scripts/seo-inlinks.cjs <base url> [path ...]'); process.exit(2); }
const args = process.argv.slice(3), ji = args.indexOf('--json'), jsonOut = ji >= 0 ? args.splice(ji, 2)[1] : '';
const TARGETS = args.length ? args : ['/learn/soccer-rules/yellow-and-red-cards', '/tools/soccer-playing-time-calculator', '/learn/soccer-rules/heading-rules-for-kids',
  '/learn/soccer-positions', '/learn/soccer-terms/two-v-one', '/learn/soccer-terms/through-ball', '/learn/soccer-terms/cutback', '/learn/soccer-terms/give-and-go', '/learn/soccer-terms/pressing'];
const SITE = 'https://futbolisland.app';
const norm = h => { h = h.replace(/&amp;/g, '&').split('#')[0].split('?')[0]; if (h.startsWith(SITE)) h = h.slice(SITE.length) || '/'; if (h.startsWith(base)) h = h.slice(base.length) || '/'; return h.length > 1 ? h.replace(/\/$/, '') : h; };
const isPage = h => h.startsWith('/') && !h.startsWith('//') && !/\.[a-z0-9]{2,5}$/i.test(h) && !/^\/(api|admin|_next)(\/|$)/.test(h);
const hrefs = html => [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(m => norm(m[1])).filter(isPage);
(async () => {
  const sm = await (await fetch(base + '/sitemap.xml')).text();
  const queue = [...new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => norm(m[1])))], seen = new Set(queue), sitemap = new Set(queue);
  const all = new Map(), en = new Map(), main = new Map(), add = (m, to, from) => { if (!m.has(to)) m.set(to, new Set()); m.get(to).add(from); };
  let done = 0;
  const work = async () => { for (;;) { const p = queue.shift(); if (p === undefined) return;
    let r; try { r = await fetch(base + p, { redirect: 'manual' }); } catch { continue; }
    if (r.status !== 200 || !/text\/html/.test(r.headers.get('content-type') || '')) continue;
    const html = await r.text(); done++;
    const m = /<main\b[\s\S]*<\/main>/.exec(html), inMain = new Set(m ? hrefs(m[0]) : []);
    for (const h of new Set(hrefs(html))) { if (h === p) continue;
      add(all, h, p); if (!p.startsWith('/es')) add(en, h, p); if (inMain.has(h)) add(main, h, p);
      if (!seen.has(h) && !/^\/(play|arcade|museum|shop|konbini|coffee|plan|scan|coach|controller)(\/|$)/.test(h)) { seen.add(h); queue.push(h); } } } };
  await Promise.all(Array.from({ length: 8 }, work));
  const n = (m, p) => (m.get(p) || new Set()).size;
  console.log(`inlinks: ${done} pages crawled (${sitemap.size} in the sitemap)`);
  console.log('page | all | from English pages | from <main>');
  for (const t of TARGETS) console.log(`${t} | ${n(all, t)} | ${n(en, t)} | ${n(main, t)}`);
  const books = [...sitemap].filter(p => /^\/books\/./.test(p)).map(p => n(all, p)).sort((a, b) => a - b);
  if (books.length) console.log(`/books/* (${books.length} pages): min ${books[0]}, median ${books[books.length >> 1]}, max ${books[books.length - 1]}`);
  const orphans = [...sitemap].filter(p => p !== '/' && n(all, p) === 0);
  console.log(`sitemap pages with no inlink: ${orphans.length}${orphans.length ? ' (' + orphans.slice(0, 5).join(', ') + ')' : ''}`);
  if (jsonOut) require('node:fs').writeFileSync(jsonOut, JSON.stringify(Object.fromEntries([...seen].map(p => [p, [n(all, p), n(en, p), n(main, p)]]))));
})();
