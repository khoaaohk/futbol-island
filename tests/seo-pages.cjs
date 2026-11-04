// The static reading pages and crawl plumbing (Oct 16 2026: "make the site easier to find through ChatGPT, Claude and search").
//  1. Sources: the pages are server components with force-static, no client code of their own, no env reads; the data views
//     (lib/site/*) load in Node and cover every lesson, fish, card and exhibit; lesson views never carry the correct answer.
//  2. A built site (NEXT_DIST_DIR or .next, when it holds these pages): every sitemap page has a title "… · Futbol Island",
//     a description, a canonical https://futbolisland.app URL and (generated pages) JSON-LD; lesson pages never reveal the
//     answer; no page carries personal-data strings; robots.txt allows the AI and search bots and blocks /admin and /api;
//     the sitemap lists every page; every llms.txt link resolves to a built page or file.
//  3. Home `/` and the game /play (Nov 3 2026, owner: the feature tour is the home page, the game moved to /play, /learn
//     redirects to `/`): title <= 60 and description <= 155 characters, one h1, canonical and og:url, JSON-LD that parses
//     (WebSite, Organization, WebApplication/VideoGame, FAQPage from the page's own FAQ), Play links go to /play, internal
//     links to /learn/lessons, /about and /privacy; /play is indexable with its own title and a real h1 and text.
// usage: node tests/seo-pages.cjs        (build first for part 2: NEXT_DIST_DIR=.next-agent-<port> npm run -s build:quiet)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const SITE='https://futbolisland.app';

// ---- loader: the REAL modules, TypeScript transpiled into a vm ----------------------------------------------------------------
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,URL,URLSearchParams,
  setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'},cwd:()=>root},exports:mod.exports,module:mod,require:id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');}};
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));

// ---- 1. sources ---------------------------------------------------------------------------------------------------------------
const walk=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${d}/${e.name}`):[`${d}/${e.name}`]);
const SITE_FILES=[...walk('app/(site)'),...walk('lib/site'),'components/seo/JsonLd.tsx','components/site/Breadcrumbs.tsx','app/robots.ts','app/sitemap.ts','app/llms-full.txt/route.ts'].filter(f=>/\.tsx?$/.test(f));
for(const f of SITE_FILES){const s=read(f);
 assert(!/^\s*['"]use client['"]/.test(s),`${f} is a server module`);
 assert(!/process\.env|supabase|stripe|from 'three'|@babylonjs/i.test(s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1')),`${f} reads no env, server keys or 3D code`);}
for(const f of SITE_FILES.filter(f=>/\/page\.tsx$/.test(f)))assert.match(read(f),/export const dynamic='force-static';/,`${f} is force-static`);
for(const f of SITE_FILES.filter(f=>/\[[a-z]+\]\/page\.tsx$/.test(f))){const s=read(f);assert.match(s,/export const dynamicParams=false;/,`${f}: unknown ids 404`);assert.match(s,/generateStaticParams/,`${f} prerenders every id`);}
const lessons=L('lib/site/lessons.ts'),fish=L('lib/site/fish.ts'),cards=L('lib/site/cards.ts'),exhibits=L('lib/site/exhibits.ts'),paths=L('lib/site/paths.ts');
const TABLE=L('lib/analytics/learningIds.generated.ts').LESSON_TABLE;
assert.equal(lessons.LESSONS.length,TABLE.length,'one page per lesson in LESSON_TABLE');
assert.equal(new Set(lessons.LESSONS.map(l=>l.id)).size,lessons.LESSONS.length);
for(const l of lessons.LESSONS){
 assert(l.title&&l.concept&&l.steps.length>0,`${l.id} has a title, concept and teaching text`);
 for(const q of l.questions){
  assert(!('correct' in q),`${l.id}: no correct index`);
  assert.deepEqual(q.options,[...q.options].sort((a,b)=>a.localeCompare(b,'en')),`${l.id}: options A–Z, not in the data's order`);
  assert(!lessons.VERDICT_OPENER.test(q.explain),`${l.id}: explanation opens without a verdict: ${q.explain.slice(0,40)}`);}}
assert.equal(fish.SITE_FISH.length,L('lib/town/fishing/fishCatalog.ts').FISH.length,'every Fishbook species');
for(const f of fish.SITE_FISH){assert(f.club.fact&&fish.fishCredit(f),`${f.id} has a fact and a plain credit`);assert(!/^https?:/.test(fish.fishCredit(f)),`${f.id}: credit is plain text`);}
assert.equal(cards.SITE_CARDS.length,L('lib/town/cardCollection.ts').CARD_ENTRIES.length,'every card');
for(const c of cards.SITE_CARDS)assert(c.blurb&&c.roleLabel,`card ${c.number} has a blurb and position`);
assert.equal(exhibits.SITE_EXHIBITS.length,L('lib/endgame/museum.ts').EXHIBITS.length,'every exhibit');
const PATHS=paths.sitePaths().map(p=>p.path);
assert.equal(new Set(PATHS).size,PATHS.length,'no duplicate paths');
for(const p of ['/','/about','/privacy','/play','/learn/lessons','/fish','/cards','/exhibits'])assert(PATHS.includes(p),p+' in the sitemap');
assert(!PATHS.includes('/learn'),'/learn redirects to / (next.config.mjs), so it is not listed');
{const sp=paths.sitePaths(),pr=p=>sp.find(x=>x.path===p).priority;assert.equal(pr('/'),1,'/ is the main entry');assert(pr('/play')<pr('/about')&&pr('/play')>0,'/play listed, low priority');assert(sp.find(x=>x.path==='/').lastmod,'/ has a lastmod');}
assert(!PATHS.some(p=>p==='/'+'start'),'the removed landing page is not listed');
assert.equal(PATHS.length,8+lessons.LESSONS.length+fish.SITE_FISH.length+cards.SITE_CARDS.length+exhibits.SITE_EXHIBITS.length);
// robots.ts names every bot and closes the private routes (checked again on the built file below).
const robotsSrc=read('app/robots.ts');
const BOTS=['GPTBot','ClaudeBot','Claude-Web','anthropic-ai','PerplexityBot','Google-Extended','CCBot','Bingbot','Googlebot'];
for(const b of BOTS)assert(robotsSrc.includes(`'${b}'`),`robots.ts names ${b}`);
// the game's routes are untouched by the group: no (site) page shadows a game route.
for(const r of ['museum','arcade','konbini','shop','privacy','admin','api','controller','coffee','plan'])assert(!fs.existsSync(path.join(root,'app/(site)',r)),`(site) leaves /${r} alone`);
// llms.txt: a title line, a summary, and the sections.
const llms=read('public/llms.txt');
assert.match(llms,/^# Futbol Island\n\n> .{200,}/,'title line and one-paragraph summary');
for(const s of ['About','Learn','Fish','Cards','Museum','Privacy'])assert(new RegExp(`^## ${s}$`,'m').test(llms),`llms.txt has ## ${s}`);
const llmsLinks=[...llms.matchAll(/\]\((https:\/\/futbolisland\.app[^)]*)\)/g)].map(m=>m[1].slice(SITE.length)||'/');
assert(llmsLinks.length>=8);
console.log(`seo sources ok: ${lessons.LESSONS.length} lessons, ${fish.SITE_FISH.length} fish, ${cards.SITE_CARDS.length} cards, ${exhibits.SITE_EXHIBITS.length} exhibits, ${PATHS.length} sitemap paths`);

// ---- 2. the built site --------------------------------------------------------------------------------------------------------
const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),app=path.join(dist,'server/app');
if(!fs.existsSync(path.join(app,'about.html'))||!fs.existsSync(path.join(app,'robots.txt.body'))){console.log(`  SKIP built-site checks: no build with these pages in ${path.relative(root,dist)} (run a build, or set NEXT_DIST_DIR)`);process.exit(0);}
const fileFor=p=>p==='/'?path.join(app,'index.html'):path.join(app,p.slice(1)+'.html');
const html=p=>fs.readFileSync(fileFor(p),'utf8');
const text=h=>h.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ');
// Sitemap: every expected path, nothing else, and each one is built.
const sitemap=fs.readFileSync(path.join(app,'sitemap.xml.body'),'utf8');
const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.deepEqual(locs.map(u=>u.slice(SITE.length)||'/').sort(),[...PATHS].sort(),'the sitemap lists every page');
assert(locs.every(u=>u.startsWith(SITE+'/')),'absolute https URLs');
// Personal data: emails, phone numbers, IPs, secrets, storage keys must never be in a page.
const PERSONAL=[/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/,/\b\d{3}[-. ]\d{3}[-. ]\d{4}\b/,/\b(?:\d{1,3}\.){3}\d{1,3}\b/,/sk_(live|test)_|service_role|SUPABASE|eyJhbGci/,/fi2-player-cards|localStorage/];
const GENERATED=PATHS.filter(p=>p!=='/privacy');
for(const p of PATHS){
 assert(fs.existsSync(fileFor(p)),`${p} is prerendered`);
 const h=html(p);
 assert.match(h,/<html lang="en"/,`${p}: lang="en"`);
 assert.match(h,/<title>[^<]+<\/title>/,`${p}: title`);
 if(p!=='/'&&p!=='/play')assert.match(h,/<title>[^<]+ · Futbol Island<\/title>/,`${p}: "X · Futbol Island"`);
 assert.match(h,/<meta name="description" content="[^"]{20,}"/,`${p}: description`);
 assert(h.includes(`<link rel="canonical" href="${p==='/'?SITE:SITE+p}"/>`),`${p}: canonical`);
 if(GENERATED.includes(p)){const ld=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  assert(ld.length>0,`${p}: JSON-LD`);
  const types=ld.flatMap(x=>[].concat(x['@type']));
  if(p==='/'||p==='/about'||p==='/play')for(const t of ['WebApplication','VideoGame'])assert(types.includes(t),`${p}: ${t}`);
  if(p==='/'||p==='/about'){const g=ld.find(x=>[].concat(x['@type']).includes('VideoGame'));assert.equal(g.audience.suggestedMinAge,7);assert.equal(g.audience.suggestedMaxAge,12);assert.equal(g.isAccessibleForFree,true);assert.equal(g.applicationCategory,'GameApplication');assert(g.educationalUse&&g.publisher);}
  if(/^\/learn\/lessons\/./.test(p)){const r=ld.find(x=>x['@type']==='LearningResource');assert(r&&r.educationalLevel&&r.learningResourceType&&r.teaches&&r.audience,`${p}: LearningResource`);}
  if(/^\/(fish|cards|exhibits)\/./.test(p)){const r=ld.find(x=>x['@type']==='CreativeWork');assert(r&&r.about,`${p}: CreativeWork with about`);}
  if(['/learn/lessons','/fish','/cards','/exhibits','/about'].includes(p))assert(types.includes('BreadcrumbList'),`${p}: BreadcrumbList`);
  if(p!=='/'&&p!=='/play')assert.match(h,/aria-label="Breadcrumb"/,`${p}: breadcrumbs`);}
 const t=text(h).split('jeremiah@whitesportventures.com').join('');/* the partnership's published business contact, shown on the main page About chapter (owner, Nov 4) */for(const re of PERSONAL)assert(!re.test(t),`${p}: no personal-data string (${re}): ${(t.match(re)||[])[0]}`);
}
// Lesson pages never reveal the answer: no markers, options A–Z as in the view, no verdict-led explanation.
for(const l of lessons.LESSONS){const h=html(lessons.lessonPath(l.id));
 assert(!/data-correct|aria-checked|✓|✔|\(correct\)|Correct answer|Answer:/i.test(h),`${l.id}: no answer marker`);
 const lists=[...h.matchAll(/<ul class="[^"]*options[^"]*">([\s\S]*?)<\/ul>/g)].map(m=>[...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(x=>text(x[1]).trim()));
 assert.equal(lists.length,l.questions.filter(q=>q.options.length).length,`${l.id}: every question's options are listed`);
 for(const o of lists)assert.deepEqual(o,[...o].sort((a,b)=>a.localeCompare(b,'en')),`${l.id}: options A–Z`);
 for(const m of h.matchAll(/Coach’s explanation:<\/b> ([^<]*)/g))assert(!lessons.VERDICT_OPENER.test(m[1]),`${l.id}: explanation opens with a verdict`);}
// robots.txt: the bots are allowed, the private routes are closed for each of them and for everyone.
const robots=fs.readFileSync(path.join(app,'robots.txt.body'),'utf8');
const groups=robots.split(/\n\s*\n/).map(g=>({ua:(g.match(/^User-Agent: (.+)$/mi)||[])[1],allow:[...g.matchAll(/^Allow: (.+)$/gm)].map(m=>m[1]),dis:[...g.matchAll(/^Disallow: (.+)$/gm)].map(m=>m[1])})).filter(g=>g.ua);
for(const b of [...BOTS,'*']){const g=groups.find(x=>x.ua===b);assert(g,`robots.txt has a group for ${b}`);assert(g.allow.includes('/'),`${b} allowed /`);
 for(const d of ['/admin','/api','/coffee/checkout',...L('lib/dev/labRoutes.ts').LAB_ROUTES])assert(g.dis.includes(d),`${b} disallowed ${d}`);
 for(const p of ['/','/play','/about','/learn/lessons','/fish','/cards','/exhibits'])assert(!g.dis.some(d=>p.startsWith(d)),`${b} may read ${p}`);}
assert.match(robots,new RegExp(`^Sitemap: ${SITE}/sitemap\\.xml$`,'m'),'robots.txt points at the sitemap');
// llms.txt links resolve to a built page or file.
for(const p of llmsLinks){const ok=PATHS.includes(p)||fs.existsSync(path.join(app,p.slice(1)+'.body'))||fs.existsSync(path.join(root,'public',p.slice(1)));assert(ok,`llms.txt link ${p} resolves`);}
assert(fs.existsSync(path.join(app,'llms-full.txt.body'))&&/## Lessons/.test(fs.readFileSync(path.join(app,'llms-full.txt.body'),'utf8')),'llms-full.txt is built with the lesson index');
// ---- 3. home `/` and the game /play ----
assert(html('/play').includes('data-root-landing')&&html('/play').includes('data-root-game'),'/play is the title screen and the game');
assert(!html('/').includes('data-root-game')&&html('/').includes('id="learn-root"'),'/ is the feature tour, not the game');
assert(!fs.existsSync(path.join(app,'learn.html')),'no /learn page (it redirects to /)');
const attr=(h,re)=>{const m=h.match(re);return m?m[1].replace(/&#x27;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"'):'';};
for(const p of ['/','/play']){const h=html(p),title=attr(h,/<title>([^<]*)<\/title>/),desc=attr(h,/<meta name="description" content="([^"]*)"/);
 assert(title.length>0&&title.length<=60,`${p}: title <= 60 characters (${title.length}): ${title}`);
 assert(desc.length>=50&&desc.length<=155,`${p}: description 50-155 characters (${desc.length})`);
 assert.equal((h.match(/<h1[\s>]/g)||[]).length,1,`${p}: exactly one h1`);
 assert(h.includes(`<meta property="og:url" content="${p==='/'?SITE:SITE+p}"/>`),`${p}: og:url`);
 assert.match(h,/<meta name="twitter:card" content="summary_large_image"\/>/,`${p}: Twitter card`);
 assert(!/<meta name="robots" content="[^"]*noindex/.test(h),`${p}: indexable`);}
assert.notEqual(attr(html('/'),/<title>([^<]*)<\/title>/),attr(html('/play'),/<title>([^<]*)<\/title>/),'/ and /play have distinct titles');
{const h=html('/'),ld=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])),types=ld.flatMap(x=>[].concat(x['@type']));
 for(const t of ['WebSite','Organization','WebApplication','VideoGame','FAQPage'])assert(types.includes(t),`/: ${t} JSON-LD`);
 const faq=ld.find(x=>x['@type']==='FAQPage'),shown=[...h.matchAll(/<details[^>]*><summary>([^<]+)</g)].map(m=>m[1].replace(/&#x27;/g,"'"));
 assert(faq.mainEntity.length>=3&&faq.mainEntity.length===shown.length,'FAQPage = the FAQs shown on the page');
 for(const q of faq.mainEntity)assert(shown.includes(q.name)&&q.acceptedAnswer.text.length>10,`FAQ "${q.name}" is on the page with its answer`);
 assert.equal(ld.find(x=>[].concat(x['@type']).includes('VideoGame')).url,SITE+'/play','the game JSON-LD points at /play');
 const hrefs=[...h.matchAll(/<a [^>]*href="([^"]*)"/g)].map(m=>m[1]);
 // Nov 3 (owner): no Lessons / About links in the footer; those pages are reached through the sitemap and llms.txt
 for(const l of ['/privacy','/play'])assert(hrefs.includes(l),`/ links to ${l}`);
 assert(!hrefs.includes('/learn'),'no link to the old /learn');
 assert(/<main[\s>]/.test(h)&&/<nav[^>]*aria-label="On this page"/.test(h)&&/<footer[\s>]/.test(h),'/: main, nav and footer landmarks');
 const heads=[...h.matchAll(/<h([1-6])[\s>]/g)].map(m=>+m[1]);assert.equal(heads[0],1,'/: the h1 comes first');
 for(let i=1;i<heads.length;i++)assert(heads[i]<=heads[i-1]+1,`/: headings never skip a level (h${heads[i-1]} then h${heads[i]})`);
 for(const m of h.matchAll(/<img [^>]*>/g))assert(/\balt="[^"]+"/.test(m[0])||/aria-hidden="true"|alt=""/.test(m[0]),`/: every image has alt text: ${m[0].slice(0,80)}`);}
{const t=text(html('/play'));assert(/free football learning game/i.test(t)&&/save code/i.test(t),'/play has crawlable text');}
// The reading pages' gold Play buttons (class "cta") go to the game at /play (the museum pages straight into the /museum room).
{let ctas=0;for(const p of PATHS.filter(p=>p!=='/play'))for(const m of html(p).matchAll(/<a class="[^"]*_cta__[^"]*" href="([^"]*)"/g)){ctas++;assert(m[1]==='/play'||(m[1]==='/museum'&&p.startsWith('/exhibits')),`${p}: Play goes to /play (exhibits: straight into /museum), not ${m[1]}`);}
 assert(ctas>PATHS.length/2,`the gold Play buttons were found (${ctas})`);}
console.log(`seo built site ok: ${PATHS.length} pages checked in ${path.relative(root,dist)}`);
