#!/usr/bin/env node
/**
 * Local SEO crawl of a running production build (Nov 14 2026, seo-boost): fetches /sitemap.xml, then every URL in it, and checks
 *  - every sitemap URL answers 200;
 *  - each page has exactly one self-referencing absolute canonical (https://futbolisland.app/<path>, no trailing slash, no query);
 *  - every <script type="application/ld+json"> parses, and no @type appears twice on a page;
 *  - every internal link on every page resolves (200 or a redirect to a page that does);
 *  - no orphans: every sitemap URL is linked from at least one OTHER page;
 *  - (with --families) the unique text per page family vs the text shared by the family's template.
 * Usage: node scripts/seo-crawl.cjs [base=http://localhost:9010] [--families] [--json out.json]
 * Quiet: prints one summary line per check plus at most 20 problems each. Exit 1 on any failure.
 */
const base = (process.argv.find(a => /^https?:\/\//.test(a)) || 'http://localhost:9010').replace(/\/$/, '');
const SITE = 'https://futbolisland.app';
const families = process.argv.includes('--families');
const jsonOut = process.argv[process.argv.indexOf('--json') + 1];
const strip = s => s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
const text = html => { const m = html.match(/<main[\s\S]*<\/main>/i); return strip(m ? m[0] : html).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim(); };
async function get(path, redirect = 'manual') { const r = await fetch(base + path, { redirect }); return { status: r.status, loc: r.headers.get('location'), body: r.status === 200 ? await r.text() : '' }; }
async function pool(items, n, fn) { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } })); return out; }
const FAMILY = [
  ['drill', /^\/learn\/soccer-drills\/[^/]+$/], ['plan', /^\/learn\/soccer-practice-plans\/[^/]+$/], ['formation', /^\/learn\/soccer-formations\/[^/]+$/],
  ['rule', /^\/learn\/soccer-rules\/[^/]+$/], ['position', /^\/learn\/soccer-positions\/[^/]+$/], ['term', /^\/learn\/soccer-terms\/[^/]+$/],
  ['lesson', /^\/learn\/lessons\/[^/]+$/], ['tool', /^\/tools\/.+$/], ['game', /^\/games\/[^/]+$/], ['card', /^\/cards\/[^/]+$/], ['fish', /^\/fish\/[^/]+$/], ['exhibit', /^\/exhibits\/[^/]+$/],
];
const familyOf = p => (FAMILY.find(([, re]) => re.test(p)) || ['other'])[0];
(async () => {
  const sm = await get('/sitemap.xml');
  const urls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const paths = urls.map(u => u.replace(SITE, '') || '/');
  const problems = { status: [], canonical: [], jsonld: [], broken: [], orphan: [] };
  const inbound = new Map(paths.map(p => [p, new Set()]));
  const linkStatus = new Map(), pages = {};
  await pool(paths, 8, async p => {
    const r = await get(p);
    if (r.status !== 200) { problems.status.push(`${p} ${r.status}${r.loc ? ' → ' + r.loc : ''}`); return; }
    const html = r.body;
    const canon = [...html.matchAll(/<link[^>]+rel="canonical"[^>]*>/g)].map(m => (m[0].match(/href="([^"]+)"/) || [])[1]);
    const want = SITE + (p === '/' ? '' : p);
    if (canon.length !== 1 || (canon[0] !== want && canon[0] !== want + '/' && !(p === '/' && canon[0] === SITE + '/'))) problems.canonical.push(`${p}: ${canon.join(', ') || 'none'}`);
    const types = [];
    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      try { const j = JSON.parse(m[1]); for (const x of (Array.isArray(j) ? j : j['@graph'] || [j])) types.push([].concat(x['@type']).join('+')); }
      catch (e) { problems.jsonld.push(`${p}: parse ${e.message}`); }
    }
    const dup = types.filter((t, i) => types.indexOf(t) !== i); if (dup.length) problems.jsonld.push(`${p}: duplicate ${dup.join(',')}`);
    const links = new Set();
    for (const m of html.matchAll(/<a\b[^>]*href="([^"#]*)(#[^"]*)?"/g)) {
      let h = m[1].replace(/&amp;/g, '&'); if (!h) continue;
      if (h.startsWith(SITE)) h = h.slice(SITE.length) || '/';
      if (!h.startsWith('/') || h.startsWith('//')) continue;
      links.add(h);
    }
    for (const h of links) { const k = h.split('?')[0].replace(/(.)\/$/, '$1'); if (k !== p && inbound.has(k)) inbound.get(k).add(p); }
    pages[p] = { links: [...links], types, text: families ? text(html) : '' };
  });
  const allLinks = [...new Set(Object.values(pages).flatMap(x => x.links))].filter(h => !inbound.has(h));
  await pool(allLinks, 8, async h => {
    let r = await get(h), hops = 0, at = h;
    while (r.status >= 300 && r.status < 400 && r.loc && hops++ < 4) { at = r.loc.replace(/^https?:\/\/[^/]+/, '') || '/'; r = await get(at); }
    linkStatus.set(h, r.status);
    if (r.status !== 200) problems.broken.push(`${h} → ${r.status} (from ${Object.keys(pages).find(p => pages[p].links.includes(h))})`);
  });
  for (const [p, s] of inbound) if (p !== '/' && pages[p] && s.size === 0) problems.orphan.push(p);
  const summary = { urls: paths.length, ...Object.fromEntries(Object.entries(problems).map(([k, v]) => [k, v.length])) };
  console.log(`seo-crawl: ${JSON.stringify(summary)}`);
  for (const [k, v] of Object.entries(problems)) if (v.length) console.log(`  ${k}:\n    ` + v.slice(0, 20).join('\n    ') + (v.length > 20 ? `\n    … +${v.length - 20}` : ''));
  const fam = {};
  if (families) {
    const by = {}; for (const p of Object.keys(pages)) (by[familyOf(p)] ||= []).push(p);
    for (const [f, ps] of Object.entries(by)) {
      if (ps.length < 3) continue;
      const sents = ps.map(p => pages[p].text.split(/(?<=[.!?:])\s+/).map(s => s.trim()).filter(s => s.length > 12));
      const df = new Map(); sents.forEach(ss => new Set(ss).forEach(s => df.set(s, (df.get(s) || 0) + 1)));
      const rows = ps.map((p, i) => { const words = s => s.split(' ').length; const all = sents[i].reduce((a, s) => a + words(s), 0); const uniq = sents[i].filter(s => df.get(s) === 1).reduce((a, s) => a + words(s), 0); return { p, all, uniq }; });
      rows.sort((a, b) => a.uniq - b.uniq);
      const avg = k => Math.round(rows.reduce((a, r) => a + r[k], 0) / rows.length);
      fam[f] = { n: ps.length, avgWords: avg('all'), avgUnique: avg('uniq'), minUnique: rows[0].uniq, minPage: rows[0].p };
    }
    console.log('families (words: all / unique-to-page, min):');
    for (const [f, x] of Object.entries(fam)) console.log(`  ${f.padEnd(10)} n=${String(x.n).padEnd(4)} ${x.avgWords} / ${x.avgUnique}  min ${x.minUnique} ${x.minPage}`);
  }
  if (jsonOut && !jsonOut.startsWith('--')) require('fs').writeFileSync(jsonOut, JSON.stringify({ summary, problems, fam, inbound: Object.fromEntries([...inbound].map(([k, v]) => [k, v.size])) }, null, 1));
  process.exit(Object.values(problems).some(v => v.length) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
