// The arcade games' search pages (Nov 10 2026, owner: "we also need separate SEO pages for these games"; lib/site/games.ts,
// app/(site)/games). Same method as tests/seo-tools.cjs: no build, the REAL page modules are transpiled and rendered to static
// HTML, then checked.
//  1. Registry: every cabinet of the arcade catalog has a page and nothing else does; seven URLs in the sitemap; unique titles
//     (30-60) and descriptions (120-155) across guides, tools and games; "soccer" in title and h1, "football" near the top.
//  2. Metadata: canonical is the page's own path, the share picture is the game's 1200x630 file.
//  3. Rendered HTML: one h1, JSON-LD that parses (BreadcrumbList; VideoGame: free, web browser, kids, publisher, screenshots, NO
//     ratings; FAQPage that matches the visible questions; ItemList on the hub), no script but JSON-LD, every picture exists with
//     its real width and height, alt text and loading=lazy, the Play button opens the deep link, links to the hub and the other
//     five games, every internal link resolves, 450-1250 words of visible text (lists and FAQ included), no Island Strikers.
//  4. The home page and the game UI link none of them; guides, hubs, llms.txt and llms-full.txt do.
//  5. Sitemap, image sitemap, robots, redirects; /arcade stays noindex with the canonical /arcade for every ?game= link.
// usage: node tests/seo-games.cjs
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
const games=L('lib/site/games.ts'),catalog=L('lib/arcade/arcadeCatalog.ts'),guides=L('lib/site/guides.ts'),tools=L('lib/site/tools/registry.ts'),paths=L('lib/site/paths.ts'),seo=L('lib/site/seo.ts');
const PATHS=new Set(paths.sitePaths().map(p=>p.path)),G='app/(site)/games',PAGES=games.GAME_PAGES,HUB=games.GAMES_HUB,ALL=games.GAME_LISTINGS;
const text=h=>h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g,' ').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
/** Width and height of a WebP (lossy VP8, lossless VP8L or extended VP8X) or a JPEG, read from the file's own header. */
function size(file){
 const b=fs.readFileSync(file);
 if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'){const k=b.toString('ascii',12,16);
  if(k==='VP8 ')return {w:b.readUInt16LE(26)&0x3fff,h:b.readUInt16LE(28)&0x3fff};
  if(k==='VP8L'){const n=b.readUInt32LE(21);return {w:(n&0x3fff)+1,h:((n>>14)&0x3fff)+1};}
  if(k==='VP8X')return {w:b.readUIntLE(24,3)+1,h:b.readUIntLE(27,3)+1};}
 if(b[0]===0xff&&b[1]===0xd8){let i=2;while(i<b.length){if(b[i]!==0xff){i++;continue;}const m=b[i+1];if(m>=0xc0&&m<=0xcf&&m!==0xc4&&m!==0xc8&&m!==0xcc)return {w:b.readUInt16BE(i+7),h:b.readUInt16BE(i+5)};i+=2+b.readUInt16BE(i+2);}}
 throw new Error('unknown picture format: '+file);
}
const pub=p=>path.join(root,'public',p);

// ---- 1. registry, catalog, sitemap, titles --------------------------------------------------------------------------------
const WANT=['/games','/games/soccer-swipe-game','/games/soccer-snake-game','/games/soccer-runner-game','/games/soccer-tennis-game','/games/soccer-pinball','/games/soccer-passing-puzzle-game'];
assert.deepEqual(ALL.map(p=>p.path),WANT,'the seven game URLs, hub first');
assert.deepEqual(PAGES.map(g=>g.id).sort(),catalog.arcadeCabinets.map(c=>c.id).sort(),'every cabinet that stands in the arcade room has a page, and only those');
for(const g of PAGES){const c=catalog.arcadeCabinets.find(x=>x.id===g.id);
 assert.equal(g.name,c.name,`${g.path}: the cabinet's name`);assert.equal(g.play,`/arcade?game=${g.id}`,`${g.path}: the deep link`);assert.equal(g.path,`/games/${g.slug}`,`${g.path}: path`);}
{const all=[...guides.ALL_GUIDE_PAGES,...tools.TOOL_PAGES,...ALL];
 assert.equal(new Set(all.map(p=>p.title)).size,all.length,'titles are unique across guides, tools and games');assert.equal(new Set(all.map(p=>p.description)).size,all.length,'descriptions are unique');
 assert.equal(new Set(all.map(p=>p.path)).size,all.length,'no URL is used twice');}
for(const p of ALL){
 assert(PATHS.has(p.path),`${p.path} is in the sitemap`);
 assert(p.title.length>=30&&p.title.length<=60,`${p.path}: title length ${p.title.length}`);assert(p.description.length>=120&&p.description.length<=155,`${p.path}: description length ${p.description.length}`);
 assert(/soccer/i.test(p.title)&&/soccer/i.test(p.name)&&/free/i.test(p.title),`${p.path}: says soccer in the title and h1, free in the title`);
 assert.equal(seo.fitTitle(p.title,true),p.title,`${p.path}: the title is used whole`);assert.equal(seo.fitDescription(p.description),p.description,`${p.path}: the description is used whole`);
 assert(p.blurb&&p.images.length>=2,`${p.path}: a blurb and pictures`);
 for(const i of p.images)assert(fs.existsSync(pub(i)),`${p.path}: picture ${i} exists`);
}
for(const g of PAGES){assert(g.h1.startsWith('Soccer ')&&g.h1.endsWith(g.name),`${g.path}: the h1 says what the game is first, its name second`);
 for(const l of g.guides)assert(PATHS.has(l.path),`${g.path}: guide link ${l.path} is a real page`);
 assert(g.guides.length>=3&&g.tips.length>=3&&g.tips.length<=5&&g.faq.length>=4&&g.faq.length<=6&&g.shots.length>=2,`${g.path}: guides, 3-5 tips, 4-6 questions, screenshots`);
 assert(/free/i.test(g.faq[0].q)&&g.faq.some(f=>/phone/i.test(f.q)&&/Chromebook/i.test(f.q))&&g.faq.some(f=>/^How do you play/.test(f.q))&&g.faq.some(f=>/What age/.test(f.q)),`${g.path}: the four questions people search`);}
// total weight of the pictures (brief: about 1.2 MB for all), and no stray file
{const dir=pub('games'),bytes=fs.readdirSync(dir).reduce((n,f)=>n+fs.statSync(path.join(dir,f)).size,0);assert(bytes<1.25*1024*1024,`public/games weighs ${Math.round(bytes/1024)} KB`);
 const used=new Set(ALL.flatMap(p=>p.images).map(i=>path.basename(i)));for(const f of fs.readdirSync(dir))assert(used.has(f),`public/games/${f} is used by a page`);}

// ---- 2 + 3. metadata and rendered HTML -------------------------------------------------------------------------------------
const hubMod=L(`${G}/page.tsx`),pageMod=L(`${G}/[slug]/page.tsx`);
assert.equal(hubMod.dynamic,'force-static');assert.equal(pageMod.dynamic,'force-static');assert.equal(pageMod.dynamicParams,false);
assert.deepEqual(pageMod.generateStaticParams().map(x=>x.slug),PAGES.map(g=>g.slug),'game slugs');
const html=new Map();
function check(p,meta,el,game){
 const where=p.path;
 assert.equal(meta.title,p.title,`${where}: title`);assert.equal(meta.description,p.description,`${where}: description`);assert.equal(meta.alternates.canonical,p.path,`${where}: canonical`);
 const og=meta.openGraph.images[0];assert(og.url.endsWith('-og.jpg')&&og.alt.length>20&&meta.twitter.images[0]===og.url,`${where}: share picture`);
 assert.deepEqual(size(pub(og.url)),{w:1200,h:630},`${where}: the share picture is 1200x630`);assert(!meta.robots,`${where}: indexable`);
 const h=renderToStaticMarkup(el);html.set(p.path,h);
 assert.equal((h.match(/<h1[ >]/g)||[]).length,1,`${where}: one h1`);assert(h.includes(`>${p.name}</h1>`),`${where}: the h1 is the registry's`);
 const t=text(h);assert(/football/i.test(t.slice(0,700)),`${where}: "football" near the top`);
 const n=t.split(" ").length;if(process.env.WORDS)console.log(where,n);assert(n>=450&&n<=1250,`${where}: ${n} words`);
 assert(!/Strikers/.test(h),`${where}: Island Strikers is not an arcade game any more`);
 assert(!/aggregateRating|ratingValue|reviewCount|millions? of players/i.test(h),`${where}: no ratings, no invented numbers`);
 assert(!/<(canvas|video|iframe|audio)\b/.test(h),`${where}: no game canvas, video or frame (phone heat)`);
 const scripts=[...h.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];assert(scripts.every(s=>/application\/ld\+json/.test(s[1])),`${where}: no script but JSON-LD`);
 const ld=scripts.map(s=>JSON.parse(s[2]));const by=k=>ld.find(x=>x['@type']===k);
 const crumbs=by('BreadcrumbList');assert(crumbs&&crumbs.itemListElement.length===(game?3:2),`${where}: BreadcrumbList`);
 crumbs.itemListElement.forEach((c,i)=>{assert.equal(c.position,i+1);assert(PATHS.has(c.item.replace(seo.SITE_URL,'')||'/'),`${where}: crumb ${c.item} exists`);});
 assert.equal(crumbs.itemListElement.at(-1).item,seo.abs(p.path),`${where}: the last crumb is the page`);
 const faq=by('FAQPage'),src=game?game.faq:HUB.faq;assert(faq&&faq.mainEntity.length===src.length,`${where}: FAQPage`);
 faq.mainEntity.forEach((q,i)=>{assert.equal(q['@type'],'Question');assert.equal(q.name,src[i].q);assert.equal(q.acceptedAnswer.text,src[i].a);assert(t.includes(src[i].q)&&t.includes(src[i].a),`${where}: the question is on the page: ${src[i].q}`);});
 // pictures
 const imgs=[...h.matchAll(/<img\b([^>]*)>/g)].map(m=>Object.fromEntries([...m[1].matchAll(/([a-z-]+)="([^"]*)"/g)].map(a=>[a[1],a[2].replace(/&#x27;/g,"'").replace(/&amp;/g,'&')])));
 assert(imgs.length>=(game?2:6),`${where}: pictures`);
 for(const i of imgs){assert(i.src.startsWith('/games/')&&fs.existsSync(pub(i.src)),`${where}: ${i.src} exists`);const s=size(pub(i.src));
  assert(Number(i.width)===s.w&&Number(i.height)===s.h,`${where}: ${i.src} states its real size ${s.w}x${s.h}`);assert(i.alt&&i.alt.length>=30,`${where}: ${i.src} has alt text`);assert.equal(i.loading,'lazy',`${where}: ${i.src} is lazy`);}
 assert.equal(new Set(imgs.map(i=>i.alt)).size,imgs.length,`${where}: every alt text is its own`);
 // links
 const links=[...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replace(/&amp;/g,'&'));
 for(const l of links){if(/^\/arcade\?game=/.test(l)){assert(PAGES.some(g=>g.play===l),`${where}: deep link ${l}`);continue;}
  assert(l.startsWith('/'),`${where}: ${l} is an internal link`);assert(PATHS.has(l.split('#')[0])||l==='/safe-football-game-for-kids',`${where}: link target ${l} exists`);}
 assert(!links.includes('/play'),`${where}: the buttons open the games, not the island`);
 return {h,t,ld,links,by};
}
{const r=check(ALL[0],hubMod.metadata,React.createElement(hubMod.default),null);
 const list=r.by('ItemList');assert(list&&list.numberOfItems===6&&list.itemListElement.length===6,'hub: ItemList of six');
 list.itemListElement.forEach((x,i)=>{assert.equal(x.position,i+1);assert.equal(x.url,seo.abs(PAGES[i].path));assert.equal(x.name,PAGES[i].name);});
 for(const g of PAGES){assert(r.links.includes(g.path)&&r.links.includes(g.play),`hub links ${g.path} and its deep link`);assert(r.t.includes(g.name),`hub names ${g.name}`);}
 assert(/free soccer games for kids/i.test(r.t)&&/no ads/i.test(r.t)&&/no accounts?/i.test(r.t),'hub: the free / no ads / no account promise');}
for(const g of PAGES){
 const p=ALL.find(x=>x.path===g.path),r=check(p,pageMod.generateMetadata({params:{slug:g.slug}}),pageMod.default({params:{slug:g.slug}}),g);
 const v=r.by('VideoGame');assert(v,`${g.path}: VideoGame`);
 assert.equal(v.name,g.name);assert.equal(v.url,seo.abs(g.path));assert.equal(v.description,g.description);assert.equal(v.image,seo.abs(g.og));
 assert(Array.isArray(v.genre)&&v.genre.length>=2&&v.gamePlatform==='Web browser'&&/web browser/i.test(v.operatingSystem)&&v.applicationCategory==='Game',`${g.path}: genre, platform, category`);
 assert(v.offers['@type']==='Offer'&&v.offers.price===0&&v.offers.priceCurrency==='USD'&&v.isAccessibleForFree===true,`${g.path}: free`);
 assert.deepEqual(v.audience,seo.KIDS_AUDIENCE,`${g.path}: audience`);assert.deepEqual(v.publisher,seo.PUBLISHER,`${g.path}: publisher`);assert.equal(v.isFamilyFriendly,true);
 assert(v.screenshot.length===g.shots.length&&v.screenshot.every((s,i)=>s.contentUrl===seo.abs(g.shots[i].src)),`${g.path}: screenshots`);
 assert(!('aggregateRating' in v)&&!('review' in v),`${g.path}: no ratings`);
 // the button, the hub and the other five
 const play=[...r.h.matchAll(/<a class="cta" href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];assert(play.length===2&&play.every(m=>m[1].replace(/&amp;/g,'&')===g.play&&m[2]===`Play ${g.name}`),`${g.path}: the Play button (top and end) opens ${g.play}`);
 assert(r.links.includes(HUB.path),`${g.path}: links the hub`);for(const o of PAGES)if(o!==g)assert(r.links.includes(o.path),`${g.path}: links ${o.path}`);
 for(const l of g.guides)assert(r.links.includes(l.path),`${g.path}: links its guide ${l.path}`);
 for(const k of ['How to play','What it teaches','Tips to score higher','How the difficulty grows','For parents and coaches','On a phone','On a computer'])assert(r.t.includes(k),`${g.path}: section "${k}"`);
 assert(/no ads/i.test(r.t)&&/no account/i.test(r.t)&&/no open chat/i.test(r.t)&&!/\bno chat\b/i.test(r.t),`${g.path}: the parents' promise`);
}
// tennis is described without match-length rules (its endless mode was built the same day)
assert(!/first to \d|best of (three|five|\d)|\d+ points? (wins?|to win)|sets? to \d|\d+ (sets?|games) /i.test(text(html.get('/games/soccer-tennis-game'))),'tennis: no exact match-length rule');
assert(/nine/.test(text(html.get('/games/soccer-tennis-game'))),'tennis: nine courts');
// no paragraph is repeated across the six pages
{const seen=new Map();for(const g of PAGES)for(const x of [...g.about,...g.teaches,...g.tips,...g.harder,...g.rules]){assert(!seen.has(x),`"${x.slice(0,40)}…" is on ${seen.get(x)} and ${g.path}`);seen.set(x,g.path);}}

// ---- 4. who links them ------------------------------------------------------------------------------------------------------
{const home=read('app/(site)/page.tsx')+fs.readdirSync(path.join(root,'components/learn')).filter(f=>/\.tsx?$/.test(f)).map(f=>read('components/learn/'+f)).join('\n');
 assert(!/['"`]\/games|GAME_PAGES|GAMES_HUB|GAME_LISTINGS|site\/games/.test(home),'the home page does NOT link the game pages (owner, Nov 10 2026: SEO-only pages)');
 const ui=['components/ArcadeRoom.tsx',...fs.readdirSync(path.join(root,'components/games')).filter(f=>/\.tsx?$/.test(f)).map(f=>'components/games/'+f)].map(read).join('\n');
 assert(!/['"`]\/games[\/'"`]|site\/games/.test(ui),'the game UI does not link the game pages');}
{const A='app/(site)/learn',R=(file,params)=>{const m=L(file);return renderToStaticMarkup(params?m.default({params}):React.createElement(m.default));};
 const inbound=[[`${A}/soccer-formations/page.tsx`,null,'snake'],[`${A}/soccer-positions/page.tsx`,null,'snake'],[`${A}/soccer-rules/[slug]/page.tsx`,{slug:'offside'},'puzzle'],
  [`${A}/soccer-drills/[slug]/page.tsx`,{slug:'shoulder-check-colors'},'kitrush'],[`${A}/soccer-drills/[slug]/page.tsx`,{slug:'wall-passing'},'pinball'],[`${A}/soccer-drills/[slug]/page.tsx`,{slug:'first-touch-gates'},'tennis'],[`${A}/soccer-drills/[slug]/page.tsx`,{slug:'dribble-and-shoot'},'runner']];
 const reached=new Set();for(const [file,params,id] of inbound){const g=games.gameById(id);assert(R(file,params).includes(`href="${g.path}"`),`${file} ${params?params.slug:''} links ${g.path}`);reached.add(id);}
 assert.equal(reached.size,PAGES.length,'every game page has a link from a guide page (no orphans)');
 const more=renderToStaticMarkup(React.createElement(L('components/site/LessonHub.tsx').MoreToLearn,{}));assert(more.includes('href="/games"'),'"More to learn" links the games hub');}
{const llms=L('lib/site/llms.ts').llmsText();for(const p of ALL)assert(llms.includes(`(https://futbolisland.app${p.path})`),`llms.txt lists ${p.path}`);
 assert(/GAME_LISTINGS\.map/.test(read('app/llms-full.txt/route.ts')),'llms-full.txt lists the game pages');}

// ---- 5. sitemaps, robots, redirects, /arcade ----------------------------------------------------------------------------------
{const sm=L('app/sitemap.ts').default().map(x=>x.url);for(const p of ALL)assert(sm.includes(seo.abs(p.path)),`sitemap.xml has ${p.path}`);
 const im=L('lib/site/tools/imageSitemap.ts'),xml=im.imageSitemapXml(),entries=im.imageEntries();
 for(const p of ALL){const e=entries.find(x=>x.path===p.path);assert(e&&e.images.length===p.images.length,`image sitemap has ${p.path}`);assert(xml.includes(`<loc>${seo.abs(p.path)}</loc>`));
  for(const i of e.images){assert(fs.existsSync(pub(i)),`image sitemap: ${i} exists`);assert(xml.includes(`<image:loc>${seo.abs(i)}</image:loc>`),`image sitemap lists ${i}`);}}
 const robots=L('app/robots.ts').default();for(const r of robots.rules)for(const d of [].concat(r.disallow||[]))assert(!'/games'.startsWith(d)&&!d.startsWith('/games'),`robots.txt leaves /games open (${d})`);
 assert(!fs.existsSync(path.join(root,'app/games')),'no second /games route outside (site)');
 const arcade=read('app/arcade/page.tsx');assert(/noindexMeta\([^;]*'\/arcade'\)/.test(arcade),'/arcade: noindex, canonical /arcade (so ?game= deep links are never indexable copies)');assert(!/Strikers/.test(arcade),'/arcade metadata names no retired game');}
(async()=>{
 const cfg=(await import(require('node:url').pathToFileURL(path.join(root,'next.config.mjs')).href)).default('phase-production-build');
 for(const r of await cfg.redirects()){const hostOnly=(r.has||[]).some(h=>h.type==='host');assert(hostOnly||r.source==='/'||r.source==='/learn'||r.source.startsWith('/learn/'),`redirect ${r.source} cannot swallow /games`);}
 for(const r of [].concat((await cfg.rewrites()).beforeFiles||[]))assert(!r.source.startsWith('/games'),'no rewrite on /games');
 console.log(`seo-games: ${ALL.length} pages, ${PAGES.reduce((n,g)=>n+g.faq.length,0)+HUB.faq.length} questions, ${fs.readdirSync(pub('games')).length} pictures ok`);
})().catch(e=>{console.error(e);process.exit(1);});
