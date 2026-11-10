// Guide cluster 2 (SEO, Nov 10 2026): rules, size charts and the glossary (lib/site/rules.ts, sizes.ts, terms.ts; registered
// in lib/site/guides.ts REFERENCE_PAGES). Same method as tests/seo-formations-positions.cjs: no build, the REAL page modules
// are transpiled and rendered to static HTML here, then checked.
//  1. Every page is in the sitemap with a unique title (30-60) and description (120-155), its canonical and a picture that exists.
//  2. Rendered HTML: one h1 that says soccer (or futsal), "soccer" in the first sentences and "football" near the top, JSON-LD
//     that parses (BreadcrumbList, FAQPage 3-5 that matches the page, Article / CollectionPage / DefinedTermSet), no script but
//     JSON-LD, tables with header cells, a diagram with <title> and <desc>, one button, every internal link resolves, external
//     links only to the cited sources, no paragraph repeated across pages, and NO link from the home page (owner, Nov 10).
//  3. Content shape: rule answers are two sentences; size tables carry a source column and the season; glossary size.
//  4. Pictures render as PNG; llms.txt and llms-full.txt list the pages.
//  5. LAST: the old /learn/<id> redirect (next.config.mjs) must leave the single-segment pages alone.
// usage: node tests/seo-rules-terms-sizes.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');process.chdir(root);
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const cache=new Map();
const cssProxy=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const req=id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');}};
  if(/\.css$/.test(id))return {__esModule:true,default:cssProxy};
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);};
 new Function('exports','module','require',out)(mod.exports,mod,req);
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const {renderToStaticMarkup}=require('react-dom/server'),React=require('react');
const guides=L('lib/site/guides.ts'),rules=L('lib/site/rules.ts'),sizes=L('lib/site/sizes.ts'),terms=L('lib/site/terms.ts'),paths=L('lib/site/paths.ts');
const PATHS=new Set(paths.sitePaths().map(p=>p.path)),A='app/(site)/learn',PAGES=guides.REFERENCE_PAGES;

// ---- 1. registry, sitemap, metadata -------------------------------------------------------------------------------------------
const WANT_RULES=['offside','throw-in','goal-kick','corner-kick','handball','fouls-and-free-kicks','penalty-kick','yellow-and-red-cards','back-pass-rule','build-out-line','kick-off','drop-ball','advantage','substitutions-and-game-length','heading-rules-for-kids','futsal-rules'];
assert.deepEqual(rules.RULES.map(r=>r.slug),WANT_RULES,'the sixteen rules');
assert.deepEqual(sizes.CHARTS.map(c=>c.path),['/learn/soccer-ball-size-by-age','/learn/soccer-field-size-by-age','/learn/soccer-age-groups']);
assert(terms.TERM_PAGES.length>=15&&terms.TERM_PAGES.length<=25,`15-25 term pages (${terms.TERM_PAGES.length})`);
assert(terms.GLOSSARY.length>=60&&terms.GLOSSARY.length<=110,`glossary size (${terms.GLOSSARY.length})`);
assert.equal(PAGES.length,2+3+rules.RULES.length+terms.TERM_PAGES.length,'two hubs, three charts, the rules, the term pages');
assert.equal(new Set(guides.ALL_GUIDE_PAGES.map(g=>g.path)).size,guides.ALL_GUIDE_PAGES.length,'unique paths across both clusters');
const SINGLE=['/learn/soccer-rules','/learn/soccer-ball-size-by-age','/learn/soccer-field-size-by-age','/learn/soccer-age-groups','/learn/soccer-terms'];
for(const p of SINGLE)assert(guides.GUIDE_HUBS.some(g=>g.path===p),`${p} is hub-level`);
const PAGE_FILES=[`${A}/soccer-rules/page.tsx`,`${A}/soccer-rules/[slug]/page.tsx`,`${A}/soccer-terms/page.tsx`,`${A}/soccer-terms/[slug]/page.tsx`,...sizes.CHARTS.map(c=>`${A}/${c.slug}/page.tsx`)];
for(const f of PAGE_FILES){const s=read(f);
 assert.match(s,/export const dynamic='force-static';/,`${f} is force-static`);
 if(/\[[a-z]+\]/.test(f)){assert.match(s,/export const dynamicParams=false;/,`${f}: unknown ids 404`);assert.match(s,/generateStaticParams/,`${f} prerenders every id`);}}
for(const f of [...PAGE_FILES,`${A}/ChartView.tsx`,'lib/site/rules.ts','lib/site/sizes.ts','lib/site/terms.ts','lib/site/scenes.ts','lib/site/PitchDiagram.tsx','lib/site/GuideParts.tsx']){
 const s=read(f);assert(!/['"]use client['"]/.test(s),`${f} is a server module`);assert(!/useEffect|useState|requestAnimationFrame|<canvas|<animate|@keyframes/.test(s),`${f}: no client code or animation (phone heat)`);}
for(const f of ['lib/site/rules.ts','lib/site/sizes.ts','lib/site/terms.ts'])assert(/SOURCES \(.*checked Nov 10 2026/i.test(read(f)),`${f}: source list with the date checked`);
const route=p=>{
 let m=/^\/learn\/soccer-rules\/(.+)$/.exec(p);if(m)return [`${A}/soccer-rules/[slug]/page.tsx`,{slug:m[1]}];
 m=/^\/learn\/soccer-terms\/(.+)$/.exec(p);if(m)return [`${A}/soccer-terms/[slug]/page.tsx`,{slug:m[1]}];
 return [`${A}${p.replace(/^\/learn/,'')}/page.tsx`,undefined];};
const first=L('lib/site/guides.ts').GUIDE_PAGES,titles=new Map(first.map(g=>[g.title,g.path])),descs=new Map(first.map(g=>[g.description,g.path])),html=new Map();
for(const g of PAGES){
 assert(PATHS.has(g.path),`${g.path} is in the sitemap`);
 const [file,params]=route(g.path),mod=L(file),meta=params?mod.generateMetadata({params}):mod.metadata;
 assert.equal(meta.title,g.title,`${g.path}: the title is not cut or suffixed`);
 assert(g.title.length>=30&&g.title.length<=60,`${g.path}: title is ${g.title.length} characters (30-60): ${g.title}`);
 assert(g.description.length>=120&&g.description.length<=155,`${g.path}: description is ${g.description.length} characters (120-155)`);
 assert.equal(meta.description,g.description,`${g.path}: description not altered`);
 assert(!titles.has(g.title),`${g.path}: title repeats ${titles.get(g.title)}`);titles.set(g.title,g.path);
 assert(!descs.has(g.description),`${g.path}: description repeats ${descs.get(g.description)}`);descs.set(g.description,g.path);
 assert.equal(meta.alternates.canonical,g.path,`${g.path}: canonical`);
 assert(/soccer|futsal/i.test(g.title),`${g.path}: the title says soccer (or futsal)`);
 const og=meta.openGraph.images[0].url;assert.equal(og,g.image,`${g.path}: og:image is its picture`);
 assert(guides.REFERENCE_FILES.includes(og.replace(guides.DIAGRAM_DIR+'/','')),`${g.path}: ${og} is a prerendered picture`);
 html.set(g.path,renderToStaticMarkup(React.createElement(mod.default,{params})));
}
const sp=paths.sitePaths();for(const g of PAGES)assert.equal(sp.find(x=>x.path===g.path).lastmod,L('lib/site/updated.ts').SITE_UPDATED.guides,`${g.path}: lastmod`);

// ---- 2. rendered HTML ---------------------------------------------------------------------------------------------------------
const text=h=>h.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<(title|desc)[\s\S]*?<\/\1>/g,' ').replace(/<[^>]+>/g,' ').replace(/&#x27;|&#39;/g,'’').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const SERVED=new Set(['/play','/privacy',...[...guides.DIAGRAM_FILES,...guides.REFERENCE_FILES].map(f=>`${guides.DIAGRAM_DIR}/${f}`)]);
const SOURCES=/^https:\/\/(www\.theifab\.com\/laws\/latest\/[a-z-]+\/|the-aiff\.com\/media\/uploads\/2025\/09\/Futsal-Laws-of-the-Game-2025-2026_EN\.pdf)$/;
const paraPages=new Map();let words=0,tables=0;
const kind=p=>p.startsWith('/learn/soccer-rules/')?'rule':p.startsWith('/learn/soccer-terms/')?'term':/soccer-(rules|terms)$/.test(p)?'hub':'chart';
for(const g of PAGES){
 const h=html.get(g.path),where=g.path,k=kind(g.path);
 const h1=h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g)||[];assert.equal(h1.length,1,`${where}: one h1`);
 assert(/soccer|futsal/i.test(text(h1[0])),`${where}: the h1 says soccer (or futsal)`);
 const body=text(h);
 assert(/soccer/i.test(body.slice(0,500)),`${where}: "soccer" in the first sentences`);
 assert(/football/i.test(body.slice(0,1400)),`${where}: "football" once near the top`);
 const n=body.split(' ').length;words+=n;assert(n>=(k==='term'?330:400),`${where}: real substance (${n} words)`);
 const scripts=h.match(/<script[^>]*>[\s\S]*?<\/script>/g)||[];
 const ld=scripts.map(s=>{assert(/type="application\/ld\+json"/.test(s),`${where}: no script except JSON-LD`);return JSON.parse(s.replace(/^<script[^>]*>|<\/script>$/g,''));});
 const types=ld.map(x=>x['@type']);
 assert(types.includes('BreadcrumbList')&&types.includes('FAQPage'),`${where}: BreadcrumbList and FAQPage`);
 assert(types.includes(g.path==='/learn/soccer-terms'?'DefinedTermSet':g.path==='/learn/soccer-rules'?'CollectionPage':'Article'),`${where}: its own JSON-LD type (${types})`);
 if(k==='term')assert(types.includes('DefinedTerm'),`${where}: DefinedTerm`);
 const crumbs=ld.find(x=>x['@type']==='BreadcrumbList').itemListElement;
 assert.equal(crumbs[crumbs.length-1].item,'https://futbolisland.app'+g.path,`${where}: last crumb is the page`);
 for(const c of crumbs)assert(PATHS.has(c.item.replace('https://futbolisland.app','')||'/'),`${where}: crumb ${c.item} exists`);
 const faq=ld.find(x=>x['@type']==='FAQPage').mainEntity;assert(faq.length>=3&&faq.length<=5,`${where}: 3-5 questions (${faq.length})`);
 for(const q of faq){assert(body.includes(q.name.replace(/'/g,'’')),`${where}: FAQ question is visible: ${q.name}`);assert(q.acceptedAnswer.text.length>=20,`${where}: answer to ${q.name}`);}
 // tables have header cells
 for(const t of h.match(/<table[\s\S]*?<\/table>/g)||[]){tables++;assert(/<thead><tr>(<th scope="col">[^<]+<\/th>)+<\/tr><\/thead>/.test(t),`${where}: table column headers`);
  const rows=t.match(/<tr>[\s\S]*?<\/tr>/g).slice(1);assert(rows.length>=1&&rows.every(r=>/^<tr><th scope="row">/.test(r)),`${where}: each row starts with a header cell`);}
 // diagrams
 const svgs=h.match(/<svg[\s\S]*?<\/svg>/g)||[];
 if(k==='rule'||k==='term'){assert(svgs.length>=1,`${where}: a diagram`);assert(/data-player=/.test(svgs[0])&&/data-ball=/.test(h),`${where}: players and a ball`);}
 for(const s of svgs){assert(/<title[^>]*>[^<]+<\/title><desc[^>]*>[^<]{40,}<\/desc>/.test(s),`${where}: diagram title and description`);assert(/role="img"/.test(s));}
 assert.equal(new Set((h.match(/ id="[^"]+"/g)||[])).size,(h.match(/ id="[^"]+"/g)||[]).length,`${where}: unique ids`);
 // one way into the game or a lesson, links resolve
 assert.equal((h.match(/class="cta"/g)||[]).length,1,`${where}: one button`);
 const links=[...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);assert(links.length>=8,`${where}: links`);
 const ids=new Set([...h.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]));
 for(const l of links){
  if(l.startsWith('#')){assert(ids.has(l.slice(1)),`${where}: anchor ${l} exists`);continue;}
  if(l.startsWith('http')){assert(SOURCES.test(l),`${where}: external link ${l} is a cited source`);continue;}
  assert(l.startsWith('/'),`${where}: link ${l}`);assert(PATHS.has(l)||SERVED.has(l),`${where}: link target ${l} exists`);}
 assert(links.some(l=>l.startsWith('/learn/lessons/')),`${where}: links to lessons`);
 assert(links.some(l=>l!==g.path&&PAGES.some(x=>x.path===l)),`${where}: links to another page of the cluster`);
 for(const m of h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)){const t=text(m[1]);if(t.length>=90){if(!paraPages.has(t))paraPages.set(t,new Set());paraPages.get(t).add(g.path);}}
}
const SHARED=new Set([guides.GUIDE_FOOT,guides.GUIDE_NAMES,`${rules.RULE_LEAGUE_LINE} ${rules.RULE_SOURCE_LINE}`].map(s=>s.replace(/'/g,'’')));
for(const [t,set] of paraPages)if(!SHARED.has(t))assert(set.size<=2,`a paragraph repeats on ${set.size} pages (${[...set].slice(0,3).join(', ')}): ${t.slice(0,80)}`);
// hubs reach every detail page; the home page links none of them (owner, Nov 10 2026: SEO-only pages)
for(const r of rules.RULES)assert(html.get('/learn/soccer-rules').includes(`href="${r.path}"`),`rules hub links ${r.path}`);
for(const t of terms.TERM_PAGES)assert(html.get('/learn/soccer-terms').includes(`href="${t.path}"`),`glossary links ${t.path}`);
for(const g of terms.GLOSSARY)assert(html.get('/learn/soccer-terms').includes(` id="${g.id}"`),`glossary anchor ${g.id}`);
{const home=read('app/(site)/page.tsx');assert(!/GUIDE_HUBS\.map|soccer-rules|soccer-terms|size-by-age|soccer-age-groups/.test(home),'the home page does not link the guide pages');}

// ---- 3. content shape ---------------------------------------------------------------------------------------------------------
for(const r of rules.RULES){const where=r.path,h=html.get(r.path);
 assert(r.refs.length>=4&&r.mixups.length>=3&&r.formats.length>=1&&r.lessons.length>=3&&r.scenes.length>=1,`${where}: referee list, mix-ups, formats, lessons, diagram`);
 assert(text(h).includes(r.answer.replace(/'/g,'’')),`${where}: the answer is on the page`);
 assert(/^https:\/\/www\.theifab\.com\/laws\/latest\//.test(r.lawUrl),`${where}: law link`);
 if(r.cta)assert(new RegExp(`class="cta" href="/learn/lessons/${r.cta.id}"`).test(h),`${where}: the button opens its lesson`);}
assert.equal(rules.ruleBySlug('offside').scenes.length,2,'offside shows onside and offside');
assert(/data-line=/.test(html.get('/learn/soccer-rules/offside'))&&/data-zone=/.test(html.get('/learn/soccer-rules/goal-kick')),'offside line and shaded zone are drawn');
for(const c of sizes.CHARTS){const h=html.get(c.path);assert(c.tables.length>=1,`${c.path}: a table`);
 for(const t of c.tables){assert.equal(t.head[t.head.length-1],'Source',`${c.path}: ${t.id} has a source column`);for(const r of t.rows){assert.equal(r.length,t.head.length,`${c.path}: ${t.id} row width`);assert(/USSF|USYS|IFAB|FIFA/.test(r[r.length-1]),`${c.path}: ${t.id} row source`);}}
 assert(text(h).includes(sizes.SIZES_SEASON)&&/your league may differ/.test(text(h))&&text(h).includes(sizes.SIZES_CHECKED),`${c.path}: season, date checked and the league caveat`);}
{const rows=sizes.chartBySlug('soccer-age-groups').tables[0].rows;assert.equal(rows.length,14,'U6 to U19');
 const f=n=>rows.find(r=>r[0]===`U${n}`);assert.equal(f(6)[2],'Aug 1, 2020 to Jul 31, 2021');assert.equal(f(12)[2],'Aug 1, 2014 to Jul 31, 2015');
 assert.deepEqual([8,9,10,11,12,13].map(n=>f(n)[3]),['4v4','7v7','7v7','9v9','9v9','11v11'],'age to format');assert.deepEqual([8,9,12,13].map(n=>f(n)[4]),['3','4','4','5'],'age to ball');}
for(const t of terms.TERM_PAGES)assert(t.how.length>=4&&t.mistakes.length===3&&t.lessons.length>=3&&t.short.length<=170,`${t.path}: steps, mistakes, lessons`);

// ---- 4. pictures, llms ----------------------------------------------------------------------------------------------------------
(async()=>{
 const img=L('lib/site/pitchImage.tsx'),{ImageResponse}=require('next/og');
 for(const f of guides.REFERENCE_FILES)assert(img.diagramFor(f),`${f} has a picture`);
 assert.equal(img.diagramFor('nope-rule.png'),null);
 for(const f of ['offside-rule.png','futsal-rules-rule.png','give-and-go-term.png','soccer-field-size-by-age-chart.png']){
  const b=Buffer.from(await new ImageResponse(img.diagramFor(f),img.IMAGE_SIZE).arrayBuffer());
  assert(b.length>5000&&b.subarray(1,4).toString()==='PNG',`${f} renders as a PNG`);}
 const llms=L('lib/site/llms.ts').llmsText();
 for(const g of PAGES.filter(x=>x.hub)){assert(llms.includes(`(https://futbolisland.app${g.path})`),`llms.txt lists ${g.path}`);assert(g.blurb,`${g.path} has a blurb`);}
 const full=await L('app/llms-full.txt/route.ts').GET().text();
 for(const g of guides.ALL_GUIDE_PAGES)assert(full.includes(`https://futbolisland.app${g.path}`),`llms-full.txt lists ${g.path}`);
 const more=renderToStaticMarkup(React.createElement(L('components/site/LessonHub.tsx').MoreToLearn,{}));
 for(const g of PAGES.filter(x=>x.hub))assert(more.includes(`href="${g.path}"`),`"More to learn" links ${g.path}`);
 const lh=renderToStaticMarkup(React.createElement(L(`${A}/lessons/[slug]/page.tsx`).default,{params:{slug:'gap11_runoncue'}}));
 assert(lh.includes('href="/learn/soccer-rules/offside"'),'a lesson links back to its rule page');
 console.log(`seo-rules-terms-sizes: ${PAGES.length} pages rendered and checked (${words} words, ${tables} tables, ${terms.GLOSSARY.length} glossary terms, ${guides.REFERENCE_FILES.length} pictures)`);

 // ---- 5. the old-lesson redirect leaves the single-segment pages alone (next.config.mjs; the coordinator edits that file) -------
 const red=read('next.config.mjs').match(/source: '\/learn\/:slug\((.*)\)', destination/);assert(red,'lesson redirect');const re=new RegExp('^/learn/(?:'+red[1]+')$');
 const caught=SINGLE.filter(p=>re.test(p));
 assert.deepEqual(caught,[],'next.config.mjs still redirects these pages to /learn/lessons/<slug>: add their slugs to the exclusion list of the /learn/:slug redirect');
 console.log('seo-rules-terms-sizes: ok');
})().catch(e=>{console.error(e.message||e);process.exit(1);});
