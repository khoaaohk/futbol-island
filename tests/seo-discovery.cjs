// Discovery, link structure and measurement (SEO, Nov 10 2026, docs/seo/DISCOVERY.md).
//  1. IndexNow: one key file public/<32 hex>.txt holding its own name; scripts/indexnow.mjs parses a sitemap, filters by
//     <lastmod>, batches at 10,000 and builds the payload; --dry-run sends nothing.
//  2. www → apex: the FIRST redirect, permanent, only for the host www.futbolisland.app (never the apex, a preview or localhost).
//  3. Internal links (lib/site/related.ts): every card, exhibit and fish page gets previous/next, "more like this" and a reading
//     link; 8-15 links in the page body, every one a real sitemap path, none to itself, none twice.
//  4. Pictures: each of the three page types names its own og.png in metadata and JSON-LD; the og routes are static; the fish
//     page shows one <img> with alt, width and height; lib/site/cardPlays.generated.json matches the film sources.
//  5. Search arrivals (lib/analytics/searchIds.ts, searchReport.ts): engine names from hosts, landing keys that read back
//     exactly, ids on the counter allowlist, a report with exact totals per engine, day, week and landing page + first seen.
// usage: node tests/seo-discovery.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,URL,URLSearchParams,Intl,
  setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'},cwd:()=>root},exports:mod.exports,module:mod,require:id=>{
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const J=x=>JSON.parse(JSON.stringify(x));// values built inside the vm have another realm's prototypes

(async()=>{
 // ---- 1. IndexNow ------------------------------------------------------------------------------------------------------------
 const keys=fs.readdirSync(path.join(root,'public')).filter(f=>/^[0-9a-f]{32}\.txt$/.test(f));
 assert.equal(keys.length,1,'exactly one IndexNow key file in public/');
 const key=keys[0].slice(0,32);assert.equal(read('public/'+keys[0]),key,'the key file holds the key and nothing else');
 const ix=await import(path.join(root,'scripts/indexnow.mjs'));
 assert.equal(ix.readKey(),key);assert.equal(ix.HOST,'futbolisland.app');assert.equal(ix.ENDPOINT,'https://api.indexnow.org/indexnow');assert.equal(ix.MAX_BATCH,10000);
 const xml='<?xml version="1.0"?><urlset><url><loc>https://futbolisland.app/</loc><lastmod>2026-11-08</lastmod><priority>1</priority></url>'+
  '<url><loc>https://futbolisland.app/cards/1</loc><lastmod>2026-10-16T00:00:00.000Z</lastmod></url><url><loc>https://futbolisland.app/fish/a-b</loc></url>'+
  '<url><loc>https://www.futbolisland.app/x</loc><lastmod>2026-11-09</lastmod></url><url><loc>https://example.com/</loc><lastmod>2026-11-09</lastmod></url><url><loc>https://futbolisland.app/</loc><lastmod>2026-11-08</lastmod></url></urlset>';
 const entries=ix.parseSitemap(xml);assert.equal(entries.length,6);
 assert.deepEqual(ix.selectUrls(entries),['https://futbolisland.app/','https://futbolisland.app/cards/1','https://futbolisland.app/fish/a-b'],'own host only, no duplicates');
 assert.deepEqual(ix.selectUrls(entries,{since:'2026-11-01'}),['https://futbolisland.app/'],'--changed-since keeps lastmod on or after the day; no lastmod = not changed');
 assert.deepEqual(ix.selectUrls(entries,{since:'2026-10-16'}).length,2);
 const many=Array.from({length:10001},(_,i)=>'https://futbolisland.app/p/'+i);
 assert.deepEqual(ix.batches(many).map(b=>b.length),[10000,1],'at most 10,000 URLs per call');
 assert.deepEqual(ix.payload(key,['https://futbolisland.app/']),{host:'futbolisland.app',key,keyLocation:`https://futbolisland.app/${key}.txt`,urlList:['https://futbolisland.app/']});
 {const tmp=path.join(require('node:os').tmpdir(),`indexnow-test-${process.pid}.xml`);fs.writeFileSync(tmp,xml);
  try{const out=execFileSync(process.execPath,[path.join(root,'scripts/indexnow.mjs'),'--dry-run','--sitemap',tmp,'--changed-since','2026-11-01'],{encoding:'utf8'});
   assert.match(out,/^indexnow: 1 of 6 sitemap URLs changed since 2026-11-01, key file \/[0-9a-f]{32}\.txt; dry run, nothing sent \(1 batch\)\.\n$/,'dry run prints one short line');}
  finally{fs.unlinkSync(tmp);}}
 assert.match(read('docs/seo/DISCOVERY.md'),/node scripts\/indexnow\.mjs/,'the post-deploy command is documented');

 // ---- 2. www → apex ----------------------------------------------------------------------------------------------------------
 const cfg=await import(path.join(root,'next.config.mjs'));
 for(const phase of ['phase-production-build','phase-development-server']){
  const reds=await cfg.default(phase).redirects(),w=reds[0];
  assert.deepEqual(w,{source:'/:path*',has:[{type:'host',value:'www\\.futbolisland\\.app'}],destination:'https://futbolisland.app/:path*',permanent:true},'the www rule is the first redirect');
  const re=new RegExp(`^${w.has[0].value}$`);// how Next matches a `has` value: the whole header
  assert(re.test('www.futbolisland.app'),'matches the www host');
  for(const h of ['futbolisland.app','localhost','localhost:3000','futbol-island-git-main-x.vercel.app','www.futbolisland.app.evil.com','wwwxfutbolisland.app','www.futbolisland.app:443','party.futbolisland.app','WWW.futbolisland.dev'])assert(!re.test(h),`does not match ${h}`);
  assert(!re.test(new URL(w.destination.replace(':path*','')).host),'the destination host never matches the rule: no loop');
  assert.equal(reds.filter(r=>(r.has||[]).some(x=>x.type==='host')).length,1,'no other host rule');
  assert(reds.slice(1).every(r=>!/^https?:/.test(r.destination)),'every other redirect stays on the same host');
 }

 // ---- 3. internal links ------------------------------------------------------------------------------------------------------
 const rel=L('lib/site/related.ts'),cards=L('lib/site/cards.ts'),exhibits=L('lib/site/exhibits.ts'),fish=L('lib/site/fish.ts'),paths=L('lib/site/paths.ts'),lessons=L('lib/site/lessons.ts');
 const PATHS=new Set(paths.sitePaths().map(p=>p.path));
 const check=(name,self,r,extra)=>{
  const all=[r.prev,r.next,...r.groups.flatMap(g=>g.links),...r.read];
  for(const l of all){assert(PATHS.has(l.path),`${name}: ${l.path} is a sitemap page`);assert(l.name&&l.path!==self,`${name}: no empty or self link`);}
  const inGroups=[...r.groups.flatMap(g=>g.links),...r.read].map(l=>l.path);assert.equal(new Set(inGroups).size,inGroups.length,`${name}: no page listed twice`);
  for(const g of r.groups)assert(g.title&&g.links.length>0,`${name}: no empty group`);
  const n=all.length+extra;assert(n>=8&&n<=15,`${name}: ${n} body links (8-15)`);return n;
 };
 // + the breadcrumb's two links and the one gold button
 let sum=0;for(const c of cards.SITE_CARDS){sum+=check('card '+c.number,cards.cardPath(c.number),rel.cardRelated(c),3);assert(PATHS.has(lessons.lessonPath(rel.roleLesson(c).id)));}
 for(const e of exhibits.SITE_EXHIBITS)check('exhibit '+e.id,exhibits.exhibitPath(e.id),rel.exhibitRelated(e),3);
 for(const f of fish.SITE_FISH)check('fish '+f.id,fish.fishPath(f.id),rel.fishRelated(f),3);
 for(const role of new Set(cards.SITE_CARDS.map(c=>c.role)))assert(rel.ROLE_LESSON[role],`a lesson for the ${role} cards`);
 // links spread: no card collects a pile of "more like this" links
 {const into=new Map();for(const c of cards.SITE_CARDS)for(const l of rel.cardRelated(c).groups.flatMap(g=>g.links))into.set(l.path,(into.get(l.path)||0)+1);
  assert(Math.max(...into.values())<=16,'no card is the target of a link pile (the busiest card has under 4% of the cards pointing at it)');assert(into.size>=cards.SITE_CARDS.length*.95,'nearly every card is linked from another card');}
 // a card ↔ fish link is a real shared club
 for(const c of cards.SITE_CARDS){const cf=rel.cardFish(c);if(cf)assert(c.clubs.includes(cf.club),`card ${c.number}: ${cf.club} is one of its clubs`);}
 const C=p=>read(p).replace(/\/\*[\s\S]*?\*\//g,'');
 for(const p of ['app/(site)/cards/[number]/page.tsx','app/(site)/exhibits/[id]/page.tsx','app/(site)/fish/[id]/page.tsx']){const s=C(p);
  assert(/<RelatedLinks related=/.test(s)&&/<Breadcrumbs crumbs=\{crumbs\}\/>/.test(s),`${p}: related links and a visible breadcrumb`);
  assert(/image:\{url:ogPath\(/.test(s)&&/image:ogPath\(/.test(s),`${p}: its own share picture in metadata and JSON-LD`);
  assert(!/<script|onClick|useState|useEffect/.test(s),`${p}: no client code`);}
 assert.match(read('components/site/RelatedLinks.tsx'),/rel="prev"[\s\S]*rel="next"/,'previous / next links');
 assert(!/^\s*['"]use client['"]/.test(read('components/site/RelatedLinks.tsx')),'RelatedLinks is a server component');

 // ---- 4. pictures ------------------------------------------------------------------------------------------------------------
 for(const p of ['app/(site)/cards/[number]/og.png/route.tsx','app/(site)/exhibits/[id]/og.png/route.tsx','app/(site)/fish/[id]/og.png/route.tsx','app/(site)/fish/[id]/art.png/route.tsx']){const s=read(p);
  assert(/export const dynamic='force-static';/.test(s)&&/export const dynamicParams=false;/.test(s)&&/generateStaticParams/.test(s),`${p}: built once, at build time`);}
 const seo=L('lib/site/seo.ts');
 assert.equal(seo.ogPath('/cards/45'),'/cards/45/og.png');
 assert.equal(seo.creativeWorkLd({name:'x',path:'/fish/a',description:'d',about:{},image:'/fish/a/og.png'}).image,'https://futbolisland.app/fish/a/og.png','JSON-LD image is absolute');
 assert(!('image' in seo.creativeWorkLd({name:'x',path:'/fish/a',description:'d',about:{}})),'no image key without a picture');
 {const s=read('app/(site)/fish/[id]/page.tsx');
  assert(/<img src=\{fishArtPath\(f\.id\)\} width=\{FISH_ART_SIZE\.width\} height=\{FISH_ART_SIZE\.height\}[^>]*\n?\s*alt=\{`Drawing of a /.test(s),'the fish page shows one real picture with alt, width and height');
  assert.equal(fish.fishArtPath('cod'),'/fish/cod/art.png');assert(fish.FISH_ART_SIZE.width>0&&fish.FISH_ART_SIZE.height>0);}
 execFileSync(process.execPath,[path.join(root,'scripts/gen-card-plays.mjs'),'--check'],{encoding:'utf8'});// throws when out of date
 {const withPlay=cards.SITE_CARDS.filter(c=>c.play);assert(withPlay.length>0,'cards carry their iconic play');
  for(const c of withPlay)assert(c.play.title.length>3&&c.play.theme.length>10,`card ${c.number}: play title and theme`);
  const reg=L('lib/plays/riso/registry.ts');for(const c of cards.SITE_CARDS)assert.equal(!!c.play,reg.hasPlayFilm(c.name),`card ${c.number}: a play on the page exactly when the game has the film`);}

 // ---- 5. search arrivals -----------------------------------------------------------------------------------------------------
 const si=L('lib/analytics/searchIds.ts'),ids=L('lib/analytics/countIds.ts'),sr=L('lib/analytics/searchReport.ts');
 for(const [h,e] of [['google.com','google'],['www.google.co.uk','google'],['gemini.google.com','gemini'],['bing.com','bing'],['copilot.microsoft.com','copilot'],['duckduckgo.com','duckduckgo'],['search.yahoo.com','yahoo'],
  ['ecosia.org','ecosia'],['search.brave.com','brave'],['yandex.ru','yandex'],['baidu.com','baidu'],['chatgpt.com','chatgpt'],['chat.openai.com','chatgpt'],['perplexity.ai','perplexity'],['www.perplexity.ai','perplexity'],
  ['claude.ai','claude'],['kagi.com','othersearch'],['perplexity','perplexity'],['facebook.com',null],['brave.com',null],['flyer',null],['notgoogle.com.evil.net',null],['',null],[null,null]])
  assert.equal(si.engineOf(h),e,`engineOf(${h})`);
 for(const need of ['google','bing','duckduckgo','yahoo','ecosia','brave','yandex','baidu','chatgpt','perplexity','copilot','claude','gemini'])assert(si.ENGINES.some(e=>e[0]===need),`engine ${need}`);
 for(const e of si.ENGINES)assert(/^[a-z]{2,12}$/.test(e[0]),`engine id ${e[0]} fits the counter shape`);
 for(const p of paths.sitePaths().map(x=>x.path)){const k=si.landingKey(p);
  assert(k!=='other',`${p}: a public page gets its own landing key`);assert.equal(si.landingPath(k),p,`${p}: the key reads back exactly`);
  const id=si.searchId(p,'google');assert(ids.COUNT_KEY_RE.test(id)&&ids.isCountId(id),`${id} is on the counter allowlist`);}
 {const long='/learn/'+'a'.repeat(45),id=si.searchId(long,'bing');// a long page id spills into the id's last part and reads back whole
  assert(ids.isCountId(id)&&id.split(':').length===4);assert.equal(si.landingPath(si.parseSearchId(id).key),long);assert.equal(si.landingKey('/learn/'+'a'.repeat(60)),'other');}
 assert.equal(si.landingKey('/cards/45?utm_source=x#top'),'C45','query and hash are dropped');
 for(const p of ['/admin','/api/visit','/controller/abcd','/coffee/checkout','/cards/45/extra/deep','/Cards/45','/cards/a b',''])assert.equal(si.landingKey(p),p===''?'home':'other',`${p||'(empty)'} is never named`);
 for(const bad of ['se:C45:altavista','se:C45','se:cards-45:google','se:C45:google:x','se:'+'a'.repeat(41)+':google'])assert(!ids.isCountId(bad),`${bad} is refused`);
 // the tracker counts one id at a session start that came from an engine, and reads no query text for it
 {const t=read('lib/analytics/tracker.ts');assert.match(t,/const eng=engineOf\(r\)\|\|engineOf\(u\.source\);if\(eng\)count\(searchId\(p,eng\)\);/,'tracker: one count per search arrival');}
 assert(!/location|document|window|localStorage|cookie/.test(C('lib/analytics/searchIds.ts').replace(/(^|[^:])\/\/.*$/gm,'$1')),'searchIds is pure');
 // the report
 assert.equal(sr.weekStart('2026-11-10'),'2026-11-09');assert.equal(sr.weekStart('2026-11-09'),'2026-11-09');assert.equal(sr.weekStart('2026-11-15'),'2026-11-09');assert.equal(sr.weekStart('2026-11-16'),'2026-11-16');
 const roll=(day,counts,referrer)=>({day,counts,dims:{referrer:Object.fromEntries(Object.entries(referrer||{}).map(([h,s])=>[h,{s,v:s,pv:s}]))}});
 const R=sr.buildSearch([
  roll('2026-11-16',{'se:C45:google':2,'se:home:chatgpt':1,'mk:view':9},{'google.com':2,'news.ycombinator.com':7}),
  roll('2026-11-14',{'se:C45:google':1,'se:FseaDbass:bing':3,['se:'+'H'+'a'.repeat(39)+':bing:bcd']:0},{'google.com':1,'bing.com':3,'gemini.google.com':1}),
  roll('2026-11-15',{},{})],
  [{day:'2026-11-11',counts:{'se:home:google':4}},{day:'2026-11-12',counts:{'se:C45:bing':1}}]);
 assert.equal(R.hasData,true);assert.equal(R.total,7);assert.equal(R.search,6);assert.equal(R.ai,1);
 assert.deepEqual(J(R.engines.map(e=>[e.id,e.sessions,e.kind])),[['google',3,'search'],['bing',3,'search'],['chatgpt',1,'ai']],'engines, exact, busiest first');
 assert.deepEqual(J(R.daily.map(d=>[d.key,d.total])),[['2026-11-14',4],['2026-11-15',0],['2026-11-16',3]],'one row per day, in order');
 assert.deepEqual(J(R.weekly.map(w=>[w.key,w.days,w.total,w.ai])),[['2026-11-09',2,4,0],['2026-11-16',1,3,1]],'Monday weeks');
 assert.deepEqual(J(R.landings.map(l=>[l.path,l.sessions,l.firstSeen])),[['/cards/45',3,'2026-11-12'],['/fish/sea-bass',3,'2026-11-14'],['/',1,'2026-11-11']],'landing pages with first seen (earlier days count)');
 assert.deepEqual(J(R.landings[0].engines),[{id:'google',label:'Google',sessions:3}]);
 assert.equal(R.hosts.total,7,'referrer hosts: google 3 + bing 3 + gemini 1, not Hacker News');assert.deepEqual(J(R.hosts.engines.map(e=>e.id).sort()),['bing','gemini','google']);
 assert.equal(R.total,R.daily.reduce((a,d)=>a+d.total,0));assert.equal(R.total,R.weekly.reduce((a,d)=>a+d.total,0));assert.equal(R.total,R.landings.reduce((a,d)=>a+d.sessions,0));
 assert.equal(sr.buildSearch([roll('2026-11-16',{'mk:view':3},{'facebook.com':2})]).hasData,false,'nothing from search: no data');
 {const s=read('app/admin/SearchSection.tsx'),m=read('app/admin/MarketingSection.tsx');
  assert(/<SearchSection report=\{report\}/.test(m),'the Search section sits on the Marketing tab');
  assert(/from '\.\/charts'/.test(s)&&/styles\.island/.test(s)&&/styles\.startTiles/.test(s),'it reuses the admin components and styles');
  assert(!/'<3'|<5|suppress/i.test(s),'exact numbers, no small-number hiding');}
 assert.match(read('lib/analytics/report.ts'),/report\.search=buildSearch\(rollups,earlier\);/,'the report carries it');
 console.log(`seo-discovery: ok (${cards.SITE_CARDS.length} cards avg ${(sum/cards.SITE_CARDS.length).toFixed(1)} links, ${exhibits.SITE_EXHIBITS.length} exhibits, ${fish.SITE_FISH.length} fish, ${PATHS.size} landing keys)`);
})().catch(e=>{console.error(e);process.exit(1);});
