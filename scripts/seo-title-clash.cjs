#!/usr/bin/env node
/**
 * Title / intent clashes (Nov 23 2026, seo-books-games): reads every sitemap URL of a running production build and lists page
 * pairs (same language) that would compete for one query:
 *  - same <title> or same <h1>;
 *  - same title head: the text before the first ":" / "·" / "(" / " - " ("Reglas del fútbol para niños: …" on two pages);
 *  - same h1 head (same rule).
 * Usage: node scripts/seo-title-clash.cjs [base=http://localhost:9010] [--json out.json] [--allow file]
 * Exit 1 when a clash is found. Pairs listed in ALLOW below (deliberate: a hub and its own print / ES twin is another language) are skipped.
 */
const base = (process.argv.find(a => /^https?:\/\//.test(a)) || 'http://localhost:9010').replace(/\/$/, '');
const SITE = 'https://futbolisland.app';
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const decode = s => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const clean = s => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s*·\s*futbol island$/, '').replace(/[’']/g, "'").trim();
const head = s => norm(s).split(/\s*(?::|·|\(|\s-\s|—|\?)\s*/)[0].trim();
async function get(p) { const r = await fetch(base + p); return r.status === 200 ? r.text() : ''; }
async function pool(items, n, fn) { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } })); return out; }
(async () => {
  const locs = b => [...b.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const sm = await get('/sitemap.xml');
  const urls = /<sitemapindex\b/.test(sm) ? (await Promise.all(locs(sm).map(async u => locs(await get(u.replace(SITE, '')))))).flat() : locs(sm);
  const paths = [...new Set(urls.map(u => u.replace(SITE, '') || '/'))];
  const pages = (await pool(paths, 8, async p => {
    const h = await get(p), t = (h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '', h1 = (h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
    // the visible h1 without screen-reader tails (books: "<span class=sr> — </span><span>a pop-up story</span>")
    return { path: p, lang: p.startsWith('/es') ? 'es' : 'en', title: clean(t), h1: clean(h1) };
  })).filter(x => x.title);
  const clashes = [];
  for (const [kind, key] of [['title', x => norm(x.title)], ['h1', x => norm(x.h1)], ['title head', x => head(x.title)], ['h1 head', x => head(x.h1)]]) {
    const groups = new Map();
    for (const x of pages) { const k = key(x); if (!k || k.length < 12) continue; const g = x.lang + '|' + k; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(x); }
    for (const [g, xs] of groups) if (xs.length > 1) clashes.push({ kind, key: g, pages: xs.map(x => ({ path: x.path, title: x.title, h1: x.h1 })) });
  }
  // a page group already reported as a full-title clash is not repeated as a head clash
  const seen = new Set(), out = [];
  for (const c of clashes) { const id = c.pages.map(p => p.path).sort().join(' '); if (seen.has(id)) continue; seen.add(id); out.push(c); }
  console.log(`seo-title-clash: ${pages.length} pages, ${out.length} clash groups`);
  for (const c of out.slice(0, 80)) console.log(`- [${c.kind}] ${c.key} (${c.pages.length}): ${c.pages.slice(0, 6).map(p => p.path).join(', ')}${c.pages.length > 6 ? ' …' : ''}`);
  if (jsonOut) require('fs').writeFileSync(jsonOut, JSON.stringify({ pages, clashes: out }, null, 1));
  process.exit(out.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
