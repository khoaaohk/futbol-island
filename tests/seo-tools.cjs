// The free coach tools and printables (Nov 10 2026; lib/site/tools/registry.ts, app/(site)/tools). Same method as
// tests/seo-rules-terms-sizes.cjs: no build, the REAL page modules are transpiled and rendered to static HTML, then checked.
//  1. Registry: the 19 pages, all in the sitemap, unique titles (30-60) and descriptions (120-155), canonical, og:image that exists.
//  2. Rendered HTML: one h1 that says soccer or futsal, "football" near the top, JSON-LD that parses (BreadcrumbList everywhere;
//     WebApplication, free, SportsApplication, no ratings on tools; CreativeWork + ImageObject on printables; FAQPage that
//     matches the visible questions), no script but JSON-LD, one button, every internal link resolves, the privacy line on the
//     tools, the licence line on the printables, a real default diagram or plan without JavaScript.
//  3. The home page links none of them (owner: SEO-only pages); guides, hubs, llms.txt and llms-full.txt do.
//  4. The lineup link code: round trip, hostile input, `#f=` deep links; the client components call no network and no timers.
//  5. Printable files: every .svg and .png is listed for the static route, the SVG carries the credit and licence, PNGs render.
//  6. The image sitemap lists real pages and pictures; robots.txt names it; /play's game entity has screenshots and no ratings.
// usage: node tests/seo-tools.cjs
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
const reg=L('lib/site/tools/registry.ts'),pr=L('lib/site/tools/printables.ts'),lineup=L('lib/site/tools/lineup.ts'),sheet=L('lib/site/tools/sheet.ts'),shapes=L('lib/site/tools/shapes.ts'),
 guides=L('lib/site/guides.ts'),paths=L('lib/site/paths.ts'),seo=L('lib/site/seo.ts'),forms=L('lib/site/formations.ts');
const PATHS=new Set(paths.sitePaths().map(p=>p.path)),T='app/(site)/tools',PAGES=reg.TOOL_PAGES;
const text=h=>h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g,' ').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();

// ---- 1. registry, sitemap, metadata ---------------------------------------------------------------------------------------
const WANT=['/tools','/tools/soccer-lineup-builder','/tools/7v7-lineup-builder','/tools/9v9-lineup-builder','/tools/11v11-lineup-builder','/tools/futsal-lineup-builder',
 '/tools/soccer-playing-time-calculator','/tools/7v7-substitution-rotation','/tools/9v9-substitution-rotation','/tools/soccer-field-diagrams',
 ...['blank-7v7-soccer-field','blank-9v9-soccer-field','blank-11v11-soccer-field','blank-futsal-court','7v7-soccer-formations-cheat-sheet','9v9-soccer-formations-cheat-sheet','11v11-soccer-formations-cheat-sheet','futsal-formations-cheat-sheet','soccer-positions-and-numbers'].map(s=>`/tools/soccer-field-diagrams/${s}`)];
assert.deepEqual(PAGES.map(p=>p.path),WANT,'the tool pages');
assert.deepEqual(reg.TOOL_HUBS.map(p=>p.path),['/tools','/tools/soccer-lineup-builder','/tools/soccer-playing-time-calculator','/tools/soccer-field-diagrams'],'hub-level pages');
const SERVED=new Set([...guides.DIAGRAM_FILES,...guides.REFERENCE_FILES].map(f=>`/learn/diagrams/${f}`).concat(pr.PRINT_FILE_NAMES.map(f=>`${pr.FILES_DIR}/${f}`)));
{const all=[...guides.ALL_GUIDE_PAGES,...PAGES];
 assert.equal(new Set(all.map(p=>p.title)).size,all.length,'titles are unique across guides and tools');assert.equal(new Set(all.map(p=>p.description)).size,all.length,'descriptions are unique');}
for(const p of PAGES){
 assert(PATHS.has(p.path),`${p.path} is in the sitemap`);
 assert(p.title.length>=30&&p.title.length<=60,`${p.path}: title length ${p.title.length}`);assert(p.description.length>=120&&p.description.length<=155,`${p.path}: description length ${p.description.length}`);
 assert(/soccer|futsal/i.test(p.title)&&/soccer|futsal/i.test(p.name),`${p.path}: says soccer (or futsal) in the title and h1`);
 assert(p.blurb&&p.image&&SERVED.has(p.image),`${p.path}: a blurb and a picture that exists (${p.image})`);
}
const file=p=>p.path===reg.TOOLS_PATH?`${T}/page.tsx`:p.kind==='printables'?`${T}/soccer-field-diagrams/page.tsx`:p.kind==='printable'?`${T}/soccer-field-diagrams/[sheet]/page.tsx`:`${T}/[slug]/page.tsx`;
const params=p=>p.kind==='printable'?{sheet:p.path.split('/').pop()}:{slug:p.path.split('/').pop()};
for(const f of new Set(PAGES.map(file))){const s=read(f);assert(/export const dynamic='force-static';/.test(s),`${f} is force-static`);if(/\[/.test(f))assert(/dynamicParams=false/.test(s)&&/generateStaticParams/.test(s),`${f}: unknown slugs 404`);}
assert.deepEqual(L(`${T}/[slug]/page.tsx`).generateStaticParams().map(x=>x.slug),WANT.slice(1,9).map(p=>p.split('/').pop()),'tool slugs');
assert.deepEqual(L(`${T}/soccer-field-diagrams/[sheet]/page.tsx`).generateStaticParams().map(x=>x.sheet),WANT.slice(10).map(p=>p.split('/').pop()),'printable slugs');

// ---- 2. rendered pages ----------------------------------------------------------------------------------------------------
const html=new Map(),paraPages=new Map();let words=0;
for(const p of PAGES){const where=p.path,mod=L(file(p)),meta=mod.metadata??mod.generateMetadata({params:params(p)});
 assert.equal(meta.title,p.title,`${where}: the title is used whole`);assert.equal(meta.description,p.description,`${where}: description`);assert.equal(meta.alternates.canonical,p.path,`${where}: canonical`);
 assert.equal(meta.openGraph.images[0].url,p.image,`${where}: og:image`);assert.equal(meta.twitter.images[0],p.image);assert.equal(meta.openGraph.url,p.path);
 const h=renderToStaticMarkup(React.createElement(mod.default,{params:params(p)}));html.set(p.path,h);const body=text(h);words+=body.split(' ').length;
 const h1=h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g)||[];assert.equal(h1.length,1,`${where}: one h1`);assert.equal(text(h1[0]),p.name,`${where}: h1`);
 assert(h.indexOf('<h1')<h.indexOf('<h2'),`${where}: the h1 is the first heading`);
 assert(/football/.test(body.slice(0,900)),`${where}: says football once near the top`);
 assert(body.split(' ').length>=(p.kind==='printable'?260:330),`${where}: real content (${body.split(' ').length} words)`);
 const scripts=h.match(/<script[^>]*>/g)||[];assert(scripts.every(s=>s==='<script type="application/ld+json">'),`${where}: no script but JSON-LD`);
 const ld=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])),types=ld.map(x=>x['@type']);
 const crumbs=ld.find(x=>x['@type']==='BreadcrumbList');assert(crumbs,`${where}: BreadcrumbList`);
 assert.equal(crumbs.itemListElement[crumbs.itemListElement.length-1].item,`https://futbolisland.app${p.path}`,`${where}: the last crumb is the page`);
 for(const c of crumbs.itemListElement)assert(PATHS.has(c.item.replace('https://futbolisland.app','')||'/'),`${where}: crumb ${c.item} exists`);
 assert(!/aggregateRating|"review"|ratingValue/.test(JSON.stringify(ld)),`${where}: no ratings or reviews are invented`);
 if(p.kind==='lineup'||p.kind==='planner'){const app=ld.find(x=>x['@type']==='WebApplication');assert(app,`${where}: WebApplication`);
  assert.equal(app.applicationCategory,'SportsApplication');assert.equal(app.offers.price,0);assert.equal(app.isAccessibleForFree,true);assert.equal(app.url,`https://futbolisland.app${p.path}`);assert(app.featureList.length>=4);
  assert(body.includes('Names stay on your device. Nothing you type is sent to Futbol Island or stored on a server.'),`${where}: the privacy line`);
  assert(/data-tool="(lineup|rotation)"/.test(h),`${where}: the tool is server-rendered`);}
 if(p.kind==='lineup'){assert(/<svg[^>]*data-diagram=/.test(h)&&(h.match(/data-player=/g)||[]).length>=5,`${where}: a default formation diagram without JavaScript`);assert(/Who plays where|Every formation you can build/.test(body)&&/How to build your lineup/.test(body),`${where}: roles and instructions`);
  for(const b of ['Print','Download picture','Copy link'])assert(h.includes(`>${b}</button>`),`${where}: ${b} button`);}
 if(p.kind==='planner'){assert(/<table[\s\S]*?<th scope="col">Goalkeeper<\/th>/.test(h)&&/data-minutes=/.test(h),`${where}: a default plan without JavaScript`);assert(/Why equal playing time matters/.test(body)&&/2 halves of 25 min/.test(body)&&/your league may differ/.test(body),`${where}: the football point and sourced game lengths`);
  for(const b of ['Print','Copy as text','Copy link'])assert(h.includes(`>${b}</button>`),`${where}: ${b} button`);}
 if(p.kind==='printable'){const cw=ld.find(x=>x['@type']==='CreativeWork');assert(cw&&cw.isAccessibleForFree===true&&cw.image.length>=1,`${where}: CreativeWork`);
  for(const im of cw.image){assert.equal(im['@type'],'ImageObject');assert(SERVED.has(im.contentUrl.replace('https://futbolisland.app','')),`${where}: ${im.contentUrl} exists`);assert(im.license&&im.creditText==='Futbol Island'&&im.width>0);}
  assert(body.includes(sheet.LICENCE),`${where}: the licence line`);const use=pr.printableBySlug(p.path.split('/').pop()).use.join(' ').split(/\s+/).length;assert(use>=100&&use<=200,`${where}: 100-200 words on how coaches use it (${use})`);
  assert(/<svg[^>]*data-sheet=/.test(h),`${where}: the sheet is on the page`);assert(h.includes('.png" download')&&h.includes('.svg" download'),`${where}: PNG and SVG downloads`);}
 if(p.kind!=='printable'){const faq=ld.find(x=>x['@type']==='FAQPage');assert(faq&&faq.mainEntity.length>=3&&faq.mainEntity.length<=5,`${where}: FAQPage 3-5`);
  for(const q of faq.mainEntity)assert(body.includes(q.name)&&body.includes(q.acceptedAnswer.text),`${where}: FAQ is visible: ${q.name}`);}
 if(p.kind==='hub'||p.kind==='printables')assert(types.includes('CollectionPage'),`${where}: CollectionPage`);
 for(const s of h.match(/<svg[^>]*role="img"[\s\S]*?<\/svg>/g)||[])assert(/<title[^>]*>[^<]+<\/title><desc[^>]*>[^<]{40,}<\/desc>/.test(s),`${where}: diagram title and description`);
 assert.equal(new Set(h.match(/ id="[^"]+"/g)||[]).size,(h.match(/ id="[^"]+"/g)||[]).length,`${where}: unique ids`);
 assert.equal((h.match(/class="cta"/g)||[]).length,1,`${where}: one gold button`);assert(!/IslandBrush/.test(h));
 const links=[...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);assert(links.length>=8,`${where}: links`);
 for(const l of links){assert(l.startsWith('/')&&!l.includes('?'),`${where}: internal link ${l}`);assert(PATHS.has(l.split('#')[0])||SERVED.has(l),`${where}: link target ${l} exists`);}
 for(const m of h.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)){assert(SERVED.has(m[1]),`${where}: image ${m[1]} exists`);assert(/ alt="[^"]{8,}"/.test(m[0])&&/ width="\d+"/.test(m[0]),`${where}: image alt and size`);}
 assert(links.some(l=>l!==p.path&&PAGES.some(x=>x.path===l)),`${where}: links to another tool page`);
 for(const m of h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)){const t=text(m[1]);if(t.length>=90){if(!paraPages.has(t))paraPages.set(t,new Set());paraPages.get(t).add(p.path);}}
}
/* no thin duplicates: a long paragraph may repeat only if it is one of the shared lines (privacy, names, licence, method) */
{const SHARED=[reg.TOOL_NAMES,guides.GUIDE_FOOT,sheet.LICENCE,'Names stay on your device','To print, use your browser','Tap a player, then tap another','Children learn the game by playing it','US youth soccer moved to small-sided games','A plan is a starting point','Typical US youth standards','Made with futbolisland.app'.padEnd(40,' ')];
 for(const [t,set] of paraPages)if(!SHARED.some(s=>t.startsWith(s.slice(0,40).trim())))assert(set.size<=1,`a paragraph repeats on ${set.size} pages (${[...set].slice(0,3).join(', ')}): ${t.slice(0,80)}`);}
for(const p of PAGES.slice(1))assert(html.get('/tools').includes(`href="${p.path}"`),`/tools links ${p.path}`);
for(const p of pr.PRINTABLES)assert(html.get('/tools/soccer-field-diagrams').includes(`href="${p.path}"`),`the printables hub links ${p.path}`);

// ---- 3. who links here -----------------------------------------------------------------------------------------------------
{const home=read('app/(site)/page.tsx')+fs.readdirSync(path.join(root,'components/learn')).filter(f=>/\.tsx?$/.test(f)).map(f=>read('components/learn/'+f)).join('\n');
 assert(!/['"`]\/tools|TOOL_PAGES|TOOL_HUBS|tools\/registry/.test(home),'the home page does NOT link the tool pages (owner, Nov 10 2026)');}
{const A='app/(site)/learn',page=(f,params)=>renderToStaticMarkup(React.createElement(L(f).default,{params}));
 for(const f of forms.FORMATIONS){const h=page(`${A}/soccer-formations/[slug]/page.tsx`,{slug:f.slug}),want=`/tools/${f.format}-lineup-builder#f=${f.slug}`;assert.equal(reg.lineupLinkFor(f.slug),want);assert(h.includes(`href="${want}"`)&&h.includes('Build this lineup'),`${f.path}: "Build this lineup" deep link`);}
 assert(page(`${A}/soccer-rules/[slug]/page.tsx`,{slug:'substitutions-and-game-length'}).includes(`href="${reg.PLANNER_PATH}"`),'the substitutions rule page links the planner');
 assert(!page(`${A}/soccer-rules/[slug]/page.tsx`,{slug:'offside'}).includes(reg.PLANNER_PATH),'other rule pages do not');
 for(const c of ['soccer-ball-size-by-age','soccer-field-size-by-age','soccer-age-groups'])assert(renderToStaticMarkup(React.createElement(L(`${A}/ChartView.tsx`).default,{slug:c})).includes(`href="${reg.PLANNER_PATH}"`),`${c} links the planner`);
 for(const f of ['7v7','9v9','11v11'])assert(renderToStaticMarkup(React.createElement(L('lib/site/FormatGuideView.tsx').default,{format:f})).includes(`href="${pr.cheatSheetPath(f)}"`),`the ${f} formations guide links its cheat sheet`);
 assert(page(`${A}/soccer-formations/page.tsx`,{}).includes('href="/tools/soccer-field-diagrams"'),'the formations hub links the cheat sheets');
 const more=renderToStaticMarkup(React.createElement(L('components/site/LessonHub.tsx').MoreToLearn,{}));for(const t of reg.TOOL_HUBS)assert(more.includes(`href="${t.path}"`),`"More to learn" links ${t.path}`);
 const llms=L('lib/site/llms.ts').llmsText();for(const t of reg.TOOL_HUBS)assert(llms.includes(`(https://futbolisland.app${t.path})`),`llms.txt lists ${t.path}`);}

// ---- 4. the lineup link code and the client components -----------------------------------------------------------------------
{const S=shapes.SHAPES;assert.equal(S.length,forms.FORMATIONS.length);for(const f of Object.values(lineup.DEFAULT_FORMATION))assert(shapes.shapeBySlug(f),`default formation ${f} exists`);
 const l={f:'9v9-3-2-3',team:'Tiburones ⚽',note:'Kick-off 9:30.\nField 4 — white shirts',on:['Zoë','José','李','Ava','Ben','Cal','Dee','Eli',''],bench:['Fay','Gus']};
 const code=lineup.encodeLineup(l);assert(/^[A-Za-z0-9_-]+$/.test(code),'the code is URL-fragment safe');assert.deepEqual(lineup.decodeLineup(code,S),l,'a lineup survives the link, accents and all');
 assert.deepEqual(lineup.readHash(`#l=${code}`,S),l);assert.deepEqual(lineup.readHash('#f=futsal-3-1',S),lineup.emptyLineup(shapes.shapeBySlug('futsal-3-1')));assert.equal(lineup.readHash('#f=nope',S),null);assert.equal(lineup.readHash('',S),null);
 for(const bad of ['','%%%','e30','W10'])assert.equal(lineup.decodeLineup(bad,S),null,`garbage link ${JSON.stringify(bad)}`);
 const b64=s=>Buffer.from(s).toString('base64url'),hostile=lineup.decodeLineup(b64(JSON.stringify([1,'7v7-2-3-1','<script>alert(1)</script>','x'.repeat(5000),Array(99).fill('<b>'+'n'.repeat(99)),Array(99).fill('z')])),S);
 assert.equal(hostile.on.length,7);assert(hostile.on.every(n=>n.length<=24));assert.equal(hostile.bench.length,lineup.MAX_BENCH);assert.equal(hostile.note.length,lineup.MAX_NOTE);assert(!/[<>]/.test(JSON.stringify(hostile)),'a hostile link is cleaned');
 assert.equal(lineup.decodeLineup(b64(JSON.stringify([1,'no-such-formation','','',[],[]])),S),null);
 const sw=lineup.swap(l,{k:'on',i:0},{k:'bench',i:1});assert.equal(sw.on[0],'Gus');assert.deepEqual(sw.bench,['Fay','Zoë']);
 const toBench=lineup.swap(l,{k:'on',i:1},{k:'bench',i:2});assert.equal(toBench.on[1],'');assert.deepEqual(toBench.bench,['Fay','Gus','José'],'a player can go to a new bench place');
 const w=lineup.withFormation(l,shapes.shapeBySlug('7v7-2-3-1'));assert.equal(w.on.length,7);assert.deepEqual(w.bench,['Eli','Fay','Gus'],'a smaller shape keeps the squad on the bench');
 const svg=sheet.toSvgString(lineup.lineupSheet(l,shapes.shapeBySlug(l.f)));assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')&&svg.includes('>Zoë<')&&svg.includes('>Fay<')&&svg.includes('Tiburones')&&svg.includes('futbolisland.app'),'the picture carries names, bench, team and credit');
 assert(!sheet.toSvgString(lineup.lineupSheet({...l,team:'<x>&"'},shapes.shapeBySlug(l.f))).includes('<x>'),'text is escaped in the SVG');}
for(const f of ['components/site/tools/LineupBuilder.tsx','components/site/tools/RotationPlanner.tsx']){const s=read(f),code=s.replace(/\/\*[\s\S]*?\*\//g,'');
 assert(/^'use client';/.test(s),`${f} is a client component`);
 assert(!/fetch\(|sendBeacon|XMLHttpRequest|WebSocket|analytics|track\(|supabase|setInterval|setTimeout|requestAnimationFrame|getContext\('webgl|from 'three'|formations'|lessons'|registry'/.test(code),`${f}: no network, no analytics, no timers or loops, no heavy data`);
 assert(/#[lr]=\$\{/.test(code)&&!/[?&][lr]=\$\{/.test(code),`${f}: the link carries state in the fragment, never the query`);
 for(const m of code.matchAll(/localStorage\.(get|set)Item/g))assert(/try\{[^}]*$/.test(code.slice(Math.max(0,m.index-160),m.index)),`${f}: localStorage is wrapped in try/catch`);}

// ---- 5 + 6. files, image sitemap, robots, /play -------------------------------------------------------------------------------
(async()=>{
 const route=L(`${T}/soccer-field-diagrams/files/[file]/route.tsx`),names=route.generateStaticParams().map(x=>x.file);
 assert.deepEqual(names,[...pr.PRINT_FILE_NAMES]);assert.equal(new Set(names).size,names.length);assert.equal(names.length,2*pr.PRINT_FILES.length);assert(pr.PRINT_FILES.length>=30,`${pr.PRINT_FILES.length} sheets`);
 assert(/export const dynamic='force-static';/.test(read(`${T}/soccer-field-diagrams/files/[file]/route.tsx`))&&/dynamicParams=false/.test(read(`${T}/soccer-field-diagrams/files/[file]/route.tsx`)),'the file route is static');
 for(const f of ['7v7','9v9','11v11'])for(const v of ['blank','thirds','zones'])for(const o of ['portrait','landscape'])assert(names.includes(`${f}-soccer-field-${v}-${o}.svg`)&&names.includes(`${f}-soccer-field-${v}-${o}.png`),`${f} ${v} ${o}`);
 assert(names.includes('7v7-soccer-field-no-build-out-lines-portrait.png')&&names.includes('futsal-court-zones-landscape.svg'));
 for(const f of pr.PRINT_FILES){const s=f.sheet(),svg=sheet.toSvgString(s);assert(s.title&&s.desc.length>=40,`${f.name}: title and description`);
  assert(svg.includes(sheet.CREDIT)&&svg.includes(sheet.LICENCE),`${f.name}: credit and licence on the sheet`);assert(/landscape/.test(f.name)?s.w>s.h:s.h>s.w,`${f.name}: orientation`);assert(!/NaN|undefined|Infinity/.test(svg),`${f.name}: clean numbers`);}
 {const dashed=n=>(sheet.toSvgString(pr.printFile(n).sheet()).match(/stroke-dasharray/g)||[]).length;
  assert.equal(dashed('7v7-soccer-field-blank-portrait'),2,'7v7: two build-out lines');assert.equal(dashed('7v7-soccer-field-no-build-out-lines-portrait'),0);assert.equal(dashed('11v11-soccer-field-blank-portrait'),0);
  assert.equal(dashed('11v11-soccer-field-thirds-landscape'),2,'thirds: two lines');assert.equal(dashed('11v11-soccer-field-zones-portrait'),6,'11v11 zones: thirds and five channels');assert.equal(dashed('futsal-court-zones-portrait'),4,'futsal zones: nine boxes');}
 {const res=await route.GET(new Request('http://x'),{params:{file:'9v9-soccer-field-blank-landscape.svg'}});assert.equal(res.status,200);assert(/image\/svg\+xml/.test(res.headers.get('content-type')));assert((await res.text()).startsWith('<svg'));
  assert.equal((await route.GET(new Request('http://x'),{params:{file:'nope.png'}})).status,404);assert.equal((await route.GET(new Request('http://x'),{params:{file:'../x.svg'}})).status,404);
  for(const n of ['11v11-soccer-field-zones-portrait.png','9v9-soccer-formations-cheat-sheet.png','soccer-positions-and-numbers.png']){const b=Buffer.from(await (await route.GET(new Request('http://x'),{params:{file:n}})).arrayBuffer());
   assert(b.length>8000&&b.subarray(1,4).toString()==='PNG',`${n} renders as a PNG`);assert.equal(b.readUInt32BE(16),1275,`${n}: US Letter at 150 dpi`);}}
 {const si=L('lib/site/tools/sheetImage.tsx'),svg=Buffer.from(si.shapesDataUri(pr.printFile('7v7-soccer-field-blank-portrait').sheet()).split(',')[1],'base64').toString();
  assert(/<rect/.test(svg)&&/<circle/.test(svg)&&/<polyline/.test(svg)&&/stroke-dasharray/.test(svg)&&!/<text/.test(svg),'the PNG draws the field from the sheet SVG (a picture), with the words laid over it');
  const t=si.sheetImage(pr.printFile('soccer-positions-and-numbers').sheet());assert.equal(t.width,1275);assert.equal(t.height,1650);}
 const im=L('lib/site/tools/imageSitemap.ts'),entries=im.imageEntries(),listed=new Set(entries.flatMap(e=>e.images));
 for(const e of entries){assert(PATHS.has(e.path),`image sitemap page ${e.path} is in the sitemap`);assert(e.images.length>=1&&e.images.every(i=>i.startsWith('/')));}
 assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'one image entry per page');
 for(const f of pr.PRINT_FILES)assert(listed.has(pr.fileUrl(f.name,'png')),`image sitemap lists ${f.name}.png`);
 for(const f of [...guides.DIAGRAM_FILES,...guides.REFERENCE_FILES])assert(listed.has(`/learn/diagrams/${f}`),`image sitemap lists ${f}`);
 {const fish=L('lib/site/fish.ts'),cards=L('lib/site/cards.ts'),ex=L('lib/site/exhibits.ts');
  assert(listed.has(fish.fishArtPath(fish.SITE_FISH[0].id))&&listed.has(`/cards/${cards.SITE_CARDS[0].number}/og.png`)&&listed.has(`/exhibits/${ex.SITE_EXHIBITS[0].id}/og.png`),'fish, card and exhibit pictures');
  for(const d of ['fish/[id]/art.png','fish/[id]/og.png','cards/[number]/og.png','exhibits/[id]/og.png'])assert(fs.existsSync(path.join(root,'app/(site)',d)),`${d} route exists`);}
 const xml=im.imageSitemapXml();assert(xml.startsWith('<?xml')&&xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')&&xml.trim().endsWith('</urlset>'));
 assert.equal((xml.match(/<url>/g)||[]).length,entries.length);assert.equal((xml.match(/<image:loc>https:\/\/futbolisland\.app\/[^<]+<\/image:loc>/g)||[]).length,entries.reduce((a,e)=>a+e.images.length,0));
 assert((await L('app/sitemap-images.xml/route.ts').GET().text())===xml&&/force-static/.test(read('app/sitemap-images.xml/route.ts')));
 const robots=L('app/robots.ts').default();assert.deepEqual(robots.sitemap,['https://futbolisland.app/sitemap.xml','https://futbolisland.app/sitemap-images.xml'],'robots.txt names both sitemaps');
 const play=seo.playLd();for(const t of ['WebApplication','VideoGame'])assert(play['@type'].includes(t),`/play: ${t}`);
 assert.equal(play.url,'https://futbolisland.app/play');assert.deepEqual(play.genre,['Educational','Sports']);assert.equal(play.gamePlatform,'Web browser');assert.equal(play.isAccessibleForFree,true);assert.equal(play.inLanguage,'en');
 assert.equal(play.audience.suggestedMinAge,7);assert.equal(play.audience.suggestedMaxAge,12);assert.equal(play.publisher.name,'Futbol Island');assert(play.image&&play.name&&play.description);
 assert(play.screenshot.length>=1);for(const s of play.screenshot)assert(fs.existsSync(path.join(root,'public',s.contentUrl.replace('https://futbolisland.app',''))),`/play screenshot ${s.contentUrl} is a real file`);
 assert(!/aggregateRating|review|ratingValue/i.test(JSON.stringify(play)),'/play: no ratings or reviews are invented');assert(/playLd\(\)/.test(read('app/play/page.tsx')),'/play renders the game entity');
 const full=await L('app/llms-full.txt/route.ts').GET().text();for(const p of PAGES)assert(full.includes(`https://futbolisland.app${p.path}`),`llms-full.txt lists ${p.path}`);
 console.log(`seo-tools: ok (${PAGES.length} pages rendered, ${words} words, ${names.length} printable files, ${entries.length} image sitemap entries)`);
})().catch(e=>{console.error(e.message||e);process.exit(1);});
