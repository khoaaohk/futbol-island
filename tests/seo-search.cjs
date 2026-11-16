// /learn search (seo-extras, Nov 15 2026; lib/site/searchIndex.ts, app/(site)/learn/search-index.json, components/site/LearnSearch.tsx):
//  1. The index is built from the registries: every type present, every path a real sitemap page (or a glossary anchor), short
//     snippets, small (< 40 KB gzipped), served static.
//  2. Ranking: plain coach/kid queries find the right page first in its group; groups follow the best hit.
//  3. The page: /learn?q= renders (only with q: plain /learn still redirects to /), noindex,follow, reads ?q= on load, a labelled
//     role=search form, a polite live status, keyboard moves (ArrowDown/ArrowUp/Escape), no network beyond the index.
//  4. The home page's WebSite JSON-LD has a SearchAction to /learn?q={search_term_string}.
// usage: node tests/seo-search.cjs
const assert=require('node:assert/strict'),zlib=require('node:zlib');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
(async()=>{
 const si=L('lib/site/searchIndex.ts'),paths=L('lib/site/paths.ts');
 const PATHS=new Set(paths.sitePaths().map(p=>p.path)),idx=si.buildSearchIndex(),json=JSON.stringify(idx);
 for(const t of si.SEARCH_TYPES)assert(idx.some(e=>e.t===t),`index has ${t}`);
 for(const e of idx){
  const base=e.p.split('#')[0];assert(PATHS.has(base),`${e.n}: ${e.p} is a real page`);
  if(e.p.includes('#'))assert.equal(base,'/learn/soccer-terms',`${e.p}: only glossary anchors`);
  assert(e.s&&e.s.length<=161,`${e.p}: a short snippet`);assert(!/<|>/.test(e.n+e.s),'plain text');
 }
 const gz=zlib.gzipSync(json).length;assert(gz<40_000,`index is small (${gz} B gzipped)`);
 assert(/export const dynamic='force-static'/.test(read('app/(site)/learn/search-index.json/route.ts')),'index is built at build time');
 const top=(q,t)=>si.searchEntries(idx,q).find(g=>g.type===t)?.items[0]?.p;
 assert.equal(top('offside','Rule'),'/learn/soccer-rules/offside');
 assert.equal(top('throw in','Rule'),'/learn/soccer-rules/throw-in');
 assert.equal(top('striker','Position'),'/learn/soccer-positions/striker');
 assert(/4-3-3/.test(top('4-3-3','Formation')),'4-3-3 finds the formation');
 assert(/rondo/.test(top('rondo','Drill')),'rondo finds a drill');
 assert.equal(si.searchEntries(idx,'Offside')[0].type,'Rule','the best group comes first');
 assert.deepEqual(si.searchEntries(idx,'   '),[]);assert.deepEqual(si.searchEntries(idx,'zzqqxx'),[]);
 assert.equal(si.fold('Fútbol  4-3-3!'),'futbol 4 3 3','accent and punctuation folding');
 // page
 const P=L('app/(site)/learn/page.tsx');assert.deepEqual(P.metadata.robots,{index:false,follow:true},'the search page is noindex,follow');
 const h=render(React.createElement(P.default));
 assert(/<form role="search" action="\/learn" method="get"/.test(h),'a real GET form (works as a plain link target)');
 assert(/<label for="learn-q"/.test(h)&&/id="learn-q"[^>]*type="search"|type="search"[^>]*id="learn-q"/.test(h),'a labelled search box');
 assert(/role="status" aria-live="polite"/.test(h),'a polite live status');
 assert(/aria-labelledby="browse"/.test(h),'hubs listed without JavaScript');
 const c=read('components/site/LearnSearch.tsx');
 assert(/new URLSearchParams\(window\.location\.search\)\.get\('q'\)/.test(c),'reads ?q= on load');
 for(const k of ["'ArrowDown'","'ArrowUp'","'Escape'"])assert(c.includes(k),`keyboard: ${k}`);
 assert.equal((c.match(/fetch\(/g)||[]).length,1,'one fetch: the index');assert(/fetch\((?:es\?SEARCH_INDEX_PATH_ES:)?SEARCH_INDEX_PATH\)/.test(c));
 assert(!/sendBeacon|analytics|track\(/.test(c),'no analytics');
 assert(c.includes("from '@/lib/site/searchCore'")&&!/^import/m.test(read('lib/site/searchCore.ts')),'the client imports only the import-free core (no registries in the bundle)');
 const cfg=await import(require('node:path').join(root,'next.config.mjs'));const red=(await cfg.default('phase-production-build').redirects()).find(r=>r.source==='/learn');
 assert.deepEqual(red.missing,[{type:'query',key:'q'}],'plain /learn still redirects; /learn?q= is the search');assert.equal(red.destination,'/');
 assert(read('app/(site)/learn/lessons/page.tsx').includes('<LearnSearchForm/>'),'the lesson index has a search box');
 // SearchAction
 const seo=L('lib/site/seo.ts'),w=seo.websiteLd(),a=w.potentialAction;
 assert.equal(a['@type'],'SearchAction');assert.equal(a.target['@type'],'EntryPoint');assert.equal(a.target.urlTemplate,'https://futbolisland.app/learn?q={search_term_string}');assert.equal(a['query-input'],'required name=search_term_string');
 assert(read('app/(site)/page.tsx').includes('<JsonLd data={websiteLd()}/>'),'the home page carries it');
 console.log(`seo-search: ok (${idx.length} entries, ${json.length} B, ${gz} B gzipped)`);
})().catch(e=>{console.error(e);process.exit(1);});
