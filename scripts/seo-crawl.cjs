#!/usr/bin/env node
/**
 * Local SEO crawl of a running production build (Nov 14 2026, seo-boost): fetches /sitemap.xml, then every URL in it, and checks
 *  - every sitemap URL answers 200;
 *  - each page has exactly one self-referencing absolute canonical (https://futbolisland.app/<path>, no trailing slash, no query);
 *  - every <script type="application/ld+json"> parses, and no @type appears twice on a page;
 *  - (Nov 17 2026, Search Console "Practice Problems") every Question inside a Quiz has an acceptedAnswer whose text is on the page;
 *  - every internal link on every page resolves (200 or a redirect to a page that does);
 *  - no orphans: every sitemap URL is linked from at least one OTHER page;
 *  - click depth (Nov 15 2026): every sitemap URL is at most 3 clicks from / (breadth-first over the pages' own links);
 *  - (with --families) the unique text per page family vs the text shared by the family's template.
 *  - (with --thin [N], Nov 15 2026) the N thinnest pages site-wide (default 30) by words unique to the page: words in sentences
 *    that appear on no other built page (template lines, footers and shared captions drop out), plus distinct words.
 * Usage: node scripts/seo-crawl.cjs [base=http://localhost:9010] [--families] [--thin [N]] [--json out.json]
 * Quiet: prints one summary line per check plus at most 20 problems each. Exit 1 on any failure.
 */
const base = (process.argv.find(a => /^https?:\/\//.test(a)) || 'http://localhost:9010').replace(/\/$/, '');
const SITE = 'https://futbolisland.app';
const families = process.argv.includes('--families');
const thinAt = process.argv.indexOf('--thin'), thin = thinAt > 0 ? (Number(process.argv[thinAt + 1]) || 30) : 0;
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
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
  const problems = { status: [], canonical: [], jsonld: [], broken: [], orphan: [], depth: [] };
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
      try {
        const j = JSON.parse(m[1]);
        for (const x of (Array.isArray(j) ? j : j['@graph'] || [j])) types.push([].concat(x['@type']).join('+'));
        const quizzes = []; const walk = o => { if (!o || typeof o !== 'object') return; if ([].concat(o['@type']).includes('Quiz')) quizzes.push(o); Object.values(o).forEach(walk); }; walk(j);
        const bare = t => t.replace(/&[a-z#0-9]+;/gi, '').replace(/[^\p{L}\p{N}]+/gu, ''), shown = bare(text(html));
        for (const z of quizzes) for (const q of [].concat(z.hasPart || [])) {
          const a = q.acceptedAnswer && q.acceptedAnswer.text;
          if (!a) problems.jsonld.push(`${p}: Quiz question "${q.name}" has no acceptedAnswer`);
          else if (!shown.includes(bare(a).slice(0, 40))) problems.jsonld.push(`${p}: acceptedAnswer "${a.slice(0, 40)}" not shown`);
        }
      }
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
    pages[p] = { links: [...links], types, text: families || thin ? text(html) : '' };
  });
  const allLinks = [...new Set(Object.values(pages).flatMap(x => x.links))].filter(h => !inbound.has(h));
  await pool(allLinks, 8, async h => {
    let r = await get(h), hops = 0, at = h;
    while (r.status >= 300 && r.status < 400 && r.loc && hops++ < 4) { at = r.loc.replace(/^https?:\/\/[^/]+/, '') || '/'; r = await get(at); }
    linkStatus.set(h, r.status);
    if (r.status !== 200) problems.broken.push(`${h} → ${r.status} (from ${Object.keys(pages).find(p => pages[p].links.includes(h))})`);
  });
  for (const [p, s] of inbound) if (p !== '/' && pages[p] && s.size === 0) problems.orphan.push(p);
  const depth = new Map([['/', 0]]); let frontier = ['/'];
  while (frontier.length) { const nxt = []; for (const p of frontier) for (const h of (pages[p]?.links || [])) { const k = h.split('?')[0].replace(/(.)\/$/, '$1'); if (inbound.has(k) && !depth.has(k)) { depth.set(k, depth.get(p) + 1); nxt.push(k); } } frontier = nxt; }
  const hist = {}; for (const p of paths) { const d = depth.has(p) ? depth.get(p) : 'unreached'; hist[d] = (hist[d] || 0) + 1; if (d === 'unreached' || d > 3) problems.depth.push(`${p}: ${d}`); }
  console.log(`click depth from /: ${JSON.stringify(hist)}`);
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
  let thinRows = [];
  if (thin) {
    const split = t => t.split(/(?<=[.!?:])\s+/).map(s => s.trim()).filter(s => s.length > 12);
    const sents = Object.fromEntries(Object.keys(pages).map(p => [p, split(pages[p].text)]));
    const df = new Map(); for (const ss of Object.values(sents)) new Set(ss).forEach(s => df.set(s, (df.get(s) || 0) + 1));
    const wordsOf = s => s.toLowerCase().match(/[a-z\u00c0-\u024f0-9’'-]+/g) || [];
    thinRows = Object.keys(pages).map(p => { const own = sents[p].filter(s => df.get(s) === 1); return { p, family: familyOf(p), unique: own.reduce((a, s) => a + wordsOf(s).length, 0), distinct: new Set(own.flatMap(wordsOf)).size }; })
      .sort((a, b) => a.unique - b.unique).slice(0, thin);
    console.log(`thinnest ${thinRows.length} pages (words unique to the page / distinct words):`);
    for (const r of thinRows) console.log(`  ${String(r.unique).padStart(4)} / ${String(r.distinct).padStart(4)}  ${r.family.padEnd(9)} ${r.p}`);
  }
  if (jsonOut && !jsonOut.startsWith('--')) require('fs').writeFileSync(jsonOut, JSON.stringify({ summary, problems, fam, thin: thinRows, inbound: Object.fromEntries([...inbound].map(([k, v]) => [k, v.size])), depth: Object.fromEntries(depth), linksOut: Object.fromEntries(Object.entries(pages).map(([k, v]) => [k, v.links.length])) }, null, 1));
  process.exit(Object.values(problems).some(v => v.length) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
