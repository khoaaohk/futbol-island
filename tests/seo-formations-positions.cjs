// The guide clusters (SEO, Nov 10 2026): formations and positions reading pages (lib/site/guides.ts, formations.ts, positions.ts).
// No build needed: the REAL page modules are transpiled and rendered to static HTML here, then checked.
//  1. Every guide page is in the sitemap, has a unique title (<= 60) and description (120-155), its own canonical and a diagram
//     picture that exists; the page files are force-static server modules.
//  2. Rendered HTML: one h1 that leads with "soccer" (or futsal), "football" near the top, JSON-LD that parses (BreadcrumbList,
//     FAQPage that matches the visible questions, Article on detail pages, an ItemList on hubs), no script except JSON-LD,
//     a diagram with the right number of players for its format (7, 9, 11, 5) with <title> and <desc>, real substance
//     (word count), no paragraph repeated across pages beyond the shared lines, every internal link resolves.
//  3. The PNG diagrams render; lessons link back ("Related guides"); llms.txt, "More to learn" and the home list name the hubs.
//  4. LAST: the old /learn/<id> redirect (next.config.mjs) must leave the single-segment guide pages alone.
// usage: node tests/seo-formations-positions.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');process.chdir(root);
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

// ---- loader: the real modules, TypeScript/TSX transpiled in this realm (so React can render them) -----------------------------
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

const guides=L('lib/site/guides.ts'),formations=L('lib/site/formations.ts'),positions=L('lib/site/positions.ts'),pitch=L('lib/site/pitch.ts');
const paths=L('lib/site/paths.ts'),lessons=L('lib/site/lessons.ts');
const PATHS=new Set(paths.sitePaths().map(p=>p.path));
const A='app/(site)/learn';

// ---- 1. registry, sitemap, metadata -------------------------------------------------------------------------------------------
const WANT_F={'7v7':['2-3-1','3-2-1','2-2-2','3-1-2'],'9v9':['3-2-3','3-3-2','2-3-2-1','3-1-3-1','4-3-1'],'11v11':['4-3-3','4-4-2','4-2-3-1','3-5-2'],futsal:['2-2','1-2-1','3-1']};
for(const [fmt,shapes] of Object.entries(WANT_F))assert.deepEqual(formations.formationsIn(fmt).map(f=>f.shape),shapes,`${fmt} formations`);
assert.deepEqual(positions.POSITIONS.map(p=>p.slug),['goalkeeper','center-back','fullback','wingback','defensive-midfielder','central-midfielder','attacking-midfielder','winger','striker'],'the nine positions');
for(const p of ['/learn/soccer-formations','/learn/soccer-positions','/learn/7v7-soccer-formations','/learn/9v9-soccer-formations','/learn/11v11-soccer-formations'])assert(guides.GUIDE_HUBS.some(g=>g.path===p),`${p} is a guide hub`);
assert.equal(guides.GUIDE_PAGES.length,5+16+9,'5 hub-level pages, 16 formations, 9 positions');
assert.equal(new Set(guides.GUIDE_PAGES.map(g=>g.path)).size,guides.GUIDE_PAGES.length,'unique paths');
const PAGE_FILES=[`${A}/soccer-formations/page.tsx`,`${A}/soccer-formations/[slug]/page.tsx`,`${A}/soccer-positions/page.tsx`,`${A}/soccer-positions/[slug]/page.tsx`,
 `${A}/7v7-soccer-formations/page.tsx`,`${A}/9v9-soccer-formations/page.tsx`,`${A}/11v11-soccer-formations/page.tsx`,`${A}/diagrams/[file]/route.tsx`];
for(const f of PAGE_FILES){const s=read(f);
 assert.match(s,/export const dynamic='force-static';/,`${f} is force-static`);
 if(/\[[a-z]+\]/.test(f)){assert.match(s,/export const dynamicParams=false;/,`${f}: unknown ids 404`);assert.match(s,/generateStaticParams/,`${f} prerenders every id`);}}
for(const f of [...PAGE_FILES,'lib/site/guides.ts','lib/site/formations.ts','lib/site/positions.ts','lib/site/pitch.ts','lib/site/PitchDiagram.tsx','lib/site/pitchImage.tsx','lib/site/GuideParts.tsx','lib/site/FormatGuideView.tsx']){
 const s=read(f);assert(!/['"]use client['"]/.test(s),`${f} is a server module`);assert(!/useEffect|useState|requestAnimationFrame|<canvas|<animate|@keyframes/.test(s),`${f}: no client code or animation (phone heat)`);}

/** path -> [page module, params] */
const route=p=>{
 let m=/^\/learn\/soccer-formations\/(.+)$/.exec(p);if(m)return [`${A}/soccer-formations/[slug]/page.tsx`,{slug:m[1]}];
 m=/^\/learn\/soccer-positions\/(.+)$/.exec(p);if(m)return [`${A}/soccer-positions/[slug]/page.tsx`,{slug:m[1]}];
 return [`${A}${p.replace(/^\/learn/,'')}/page.tsx`,undefined];};
const titles=new Map(),descs=new Map(),html=new Map();
for(const g of guides.GUIDE_PAGES){
 assert(PATHS.has(g.path),`${g.path} is in the sitemap`);
 const [file,params]=route(g.path),mod=L(file),meta=params?mod.generateMetadata({params}):mod.metadata;
 assert.equal(meta.title,g.title,`${g.path}: the title is not cut or suffixed`);
 assert(g.title.length<=60,`${g.path}: title ${g.title.length} > 60: ${g.title}`);
 assert(g.description.length>=120&&g.description.length<=155,`${g.path}: description is ${g.description.length} characters (120-155)`);
 assert.equal(meta.description,g.description,`${g.path}: description not altered`);
 assert(!titles.has(g.title),`${g.path}: title repeats ${titles.get(g.title)}`);titles.set(g.title,g.path);
 assert(!descs.has(g.description),`${g.path}: description repeats ${descs.get(g.description)}`);descs.set(g.description,g.path);
 assert.equal(meta.alternates.canonical,g.path,`${g.path}: canonical`);
 assert(/soccer|futsal/i.test(g.title),`${g.path}: the title says soccer (or futsal)`);
 const og=meta.openGraph.images[0].url;assert.equal(og,g.image,`${g.path}: og:image is its diagram`);
 assert(guides.DIAGRAM_FILES.includes(og.replace(guides.DIAGRAM_DIR+'/','')),`${g.path}: ${og} is a prerendered diagram`);
 html.set(g.path,renderToStaticMarkup(React.createElement(mod.default,{params})));
}
const sp=paths.sitePaths();for(const g of guides.GUIDE_PAGES)assert.equal(sp.find(x=>x.path===g.path).lastmod,L('lib/site/updated.ts').SITE_UPDATED.guides,`${g.path}: lastmod is the guides content date`);

// ---- 2. rendered HTML ---------------------------------------------------------------------------------------------------------
const text=h=>h.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<(title|desc)[\s\S]*?<\/\1>/g,' ').replace(/<[^>]+>/g,' ').replace(/&#x27;|&#39;/g,'’').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const SERVED=new Set(['/play','/privacy',...guides.DIAGRAM_FILES.map(f=>`${guides.DIAGRAM_DIR}/${f}`)]);
const paraPages=new Map();let words=0;
for(const g of guides.GUIDE_PAGES){
 const h=html.get(g.path),where=g.path;
 const h1=h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g)||[];assert.equal(h1.length,1,`${where}: one h1`);
 assert(/soccer|futsal/i.test(text(h1[0])),`${where}: the h1 says soccer (or futsal)`);
 const body=text(h);
 assert(/soccer/i.test(body.slice(0,500)),`${where}: "soccer" in the first sentences`);
 assert(/football/i.test(body.slice(0,1200)),`${where}: "football" once near the top`);
 const n=body.split(' ').length;words+=n;assert(n>=(g.hub?330:400),`${where}: real substance (${n} words)`);
 // scripts: JSON-LD only, and it parses
 const scripts=h.match(/<script[^>]*>[\s\S]*?<\/script>/g)||[];
 const ld=scripts.map(s=>{assert(/type="application\/ld\+json"/.test(s),`${where}: no script except JSON-LD`);return JSON.parse(s.replace(/^<script[^>]*>|<\/script>$/g,''));});
 const types=ld.map(x=>x['@type']);
 assert(types.includes('BreadcrumbList')&&types.includes('FAQPage'),`${where}: BreadcrumbList and FAQPage`);
 const crumbs=ld.find(x=>x['@type']==='BreadcrumbList').itemListElement;
 assert.equal(crumbs[crumbs.length-1].item,'https://futbolisland.app'+g.path,`${where}: last crumb is the page`);
 for(const c of crumbs)assert(PATHS.has(c.item.replace('https://futbolisland.app','')||'/'),`${where}: crumb ${c.item} exists`);
 const faq=ld.find(x=>x['@type']==='FAQPage').mainEntity;assert(faq.length>=3&&faq.length<=5,`${where}: 3-5 questions`);
 for(const q of faq){assert(body.includes(q.name.replace(/'/g,'’')),`${where}: FAQ question is on the page: ${q.name}`);assert(q.acceptedAnswer.text.length>=60,`${where}: a real answer to ${q.name}`);}
 if(g.hub){const c=ld.find(x=>x['@type']==='CollectionPage');assert(c&&c.mainEntity['@type']==='ItemList'&&c.mainEntity.numberOfItems>=4,`${where}: ItemList on the hub`);
  for(const it of c.mainEntity.itemListElement)assert(PATHS.has(it.url.replace('https://futbolisland.app','')),`${where}: list item ${it.url} exists`);assert(c.audience,`${where}: audience`);}
 else{const a=ld.find(x=>x['@type']==='Article');assert(a&&a.audience&&a.datePublished&&a.dateModified&&a.headline===g.title,`${where}: Article with audience and dates`);
  assert.equal(a.image,'https://futbolisland.app'+g.image,`${where}: Article image is the diagram`);}
 // diagrams
 const svgs=h.match(/<svg[\s\S]*?<\/svg>/g)||[];assert(svgs.length>=1,`${where}: has a diagram`);
 for(const s of svgs){const fmt=/data-diagram="([^"]+)"/.exec(s)[1],players=(s.match(/data-player=/g)||[]).length;
  assert.equal(players,pitch.PLAYERS_PER_TEAM[fmt],`${where}: a ${fmt} diagram shows ${pitch.PLAYERS_PER_TEAM[fmt]} players`);
  assert(/<title[^>]*>[^<]{10,}<\/title>/.test(s)&&/<desc[^>]*>[^<]{60,}<\/desc>/.test(s)&&/role="img"/.test(s),`${where}: diagram has title, desc and role`);
  assert(!/<animate|<script|<foreignObject/.test(s),`${where}: a still picture`);}
 const ids=h.match(/ id="[^"]+"/g)||[];assert.equal(new Set(ids).size,ids.length,`${where}: no duplicate ids`);
 /* the main diagram prints its description as a caption; the small ones on the formation hubs carry it in <desc> (checked above) */
 if(!g.hub||g.path==='/learn/soccer-positions')assert(/<figcaption[^>]*>Diagram of /.test(h),`${where}: the diagram has a visible text alternative`);
 const f=formations.FORMATIONS.find(x=>x.path===g.path),p=positions.POSITIONS.find(x=>x.path===g.path);
 if(f){assert.equal(/data-diagram="([^"]+)"/.exec(svgs[0])[1],f.format,`${where}: drawn on a ${f.format} pitch`);assert.equal(svgs.length,3,`${where}: base, attacking and defending diagrams`);
  if(f.format!=='futsal')assert(body.includes(`1-${f.shape}`),`${where}: names the goalkeeper-first notation 1-${f.shape}`);
  assert(f.roles.length>=3&&f.strengths.length>=3&&f.weak.length>=3&&f.lessons.length>=3,`${where}: roles, strengths, weak spots, lessons`);}
 if(p){assert(p.withBall.length===3&&p.withoutBall.length===3&&p.habits.length===3,`${where}: three of each`);assert(/\/cards\/\d+/.test(h),`${where}: links to player cards`);
  assert(formations.formationBySlug(p.diagram).lines.some(l=>l.spots.some(s=>s.pos===p.slug)),`${where}: its diagram contains the position`);
  assert(formations.formationsUsing(p.slug).length>0,`${where}: at least one formation uses it`);}
 // one way into the game, internal links resolve
 assert.equal((h.match(/class="cta"/g)||[]).length,1,`${where}: one Play button`);
 const links=[...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);assert(links.length>=8,`${where}: internal links`);
 for(const l of links){assert(l.startsWith('/'),`${where}: internal link ${l}`);assert(PATHS.has(l.split('#')[0])||SERVED.has(l),`${where}: link target ${l} exists`);}/* a #fragment is allowed: the lineup builder deep link */
 assert(links.some(l=>l.startsWith('/learn/lessons/')),`${where}: links to lessons`);
 for(const m of h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)){const t=text(m[1]);if(t.length>=90){if(!paraPages.has(t))paraPages.set(t,new Set());paraPages.get(t).add(g.path);}}
}
const SHARED=new Set([guides.GUIDE_FOOT,guides.GUIDE_NAMES].map(s=>s.replace(/'/g,'’')));
for(const [t,set] of paraPages)if(!SHARED.has(t))assert(set.size<=2,`a paragraph repeats on ${set.size} pages (${[...set].slice(0,3).join(', ')}): ${t.slice(0,80)}`);
// every hub-level page is reachable from the others, every detail page from its hub
for(const f of formations.FORMATIONS){assert(html.get('/learn/soccer-formations').includes(`href="${f.path}"`),`hub links ${f.path}`);
 if(f.format!=='futsal')assert(html.get(`/learn/${f.format}-soccer-formations`).includes(`href="${f.path}"`),`${f.format} guide links ${f.path}`);}
for(const p of positions.POSITIONS)assert(html.get('/learn/soccer-positions').includes(`href="${p.path}"`),`hub links ${p.path}`);
assert.equal((html.get('/learn/soccer-positions').match(/data-number=/g)||[]).length,11,'the numbers 1 to 11');
for(const g of formations.FORMAT_GUIDES)assert(/<table/.test(html.get(g.path))&&html.get(g.path).includes(g.pickTitle),`${g.path}: comparison table and the "which one" answer`);

// ---- 3. pictures, lesson links, llms.txt, hub lists ---------------------------------------------------------------------------
(async()=>{
 const img=L('lib/site/pitchImage.tsx'),{ImageResponse}=require('next/og');
 assert.equal(guides.DIAGRAM_FILES.length,25);
 for(const f of guides.DIAGRAM_FILES)assert(img.diagramFor(f),`${f} has a picture`);
 assert.equal(img.diagramFor('nope-formation.png'),null);
 for(const f of ['7v7-2-3-1-formation.png','futsal-3-1-formation.png','wingback-position.png']){
  const b=Buffer.from(await new ImageResponse(img.diagramFor(f),img.IMAGE_SIZE).arrayBuffer());
  assert(b.length>5000&&b.subarray(1,4).toString()==='PNG',`${f} renders as a PNG`);}
 // lessons link back to the guides that teach from them
 const lessonPage=L(`${A}/lessons/[slug]/page.tsx`);
 const lh=renderToStaticMarkup(React.createElement(lessonPage.default,{params:{slug:'learn7_roles'}}));
 assert(/Related guides/.test(lh)&&lh.includes('href="/learn/soccer-formations/7v7-2-3-1"')&&lh.includes('href="/learn/7v7-soccer-formations"'),'a formation lesson links to its guide pages');
 for(const l of lessons.LESSONS)assert(guides.guidesForLesson(l.id).length<=4);
 assert(lessons.LESSONS.filter(l=>guides.guidesForLesson(l.id).length).length>=40,'many lessons link into the clusters');
 // llms.txt, "More to learn" and the home page list name every hub-level guide
 const llms=L('lib/site/llms.ts').llmsText();
 for(const g of guides.GUIDE_HUBS){assert(llms.includes(`(https://futbolisland.app${g.path})`),`llms.txt lists ${g.path}`);assert(g.blurb,`${g.path} has a blurb`);}
 const more=renderToStaticMarkup(React.createElement(L('components/site/LessonHub.tsx').MoreToLearn,{}));
 for(const g of guides.GUIDE_HUBS)assert(more.includes(`href="${g.path}"`),`"More to learn" links ${g.path}`);
 assert(!/GUIDE_HUBS|soccer-formations|soccer-positions|soccer-rules|soccer-terms/.test(read('app/(site)/page.tsx')),'Nov 10 2026 (owner): the home page does NOT link the search guide pages');
 console.log(`seo-formations-positions: ${guides.GUIDE_PAGES.length} pages rendered and checked (${words} words, ${guides.DIAGRAM_FILES.length} diagram pictures)`);

 // ---- 4. the old-lesson redirect leaves the guide pages alone (next.config.mjs) -------------------------------------------------
 const red=read('next.config.mjs').match(/source: '\/learn\/:slug\((.*)\)', destination/);assert(red,'lesson redirect');const re=new RegExp('^/learn/(?:'+red[1]+')$');
 const caught=guides.GUIDE_PAGES.map(g=>g.path).filter(p=>re.test(p));
 assert.deepEqual(caught,[],`next.config.mjs still redirects these guide pages to /learn/lessons/<slug>: add their slugs to the exclusion list of the /learn/:slug redirect`);
 console.log('seo-formations-positions: ok');
})().catch(e=>{console.error(e.message||e);process.exit(1);});
