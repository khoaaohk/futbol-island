// SEO boost (Nov 14 2026, Search Console: ~222 "Crawled – currently not indexed", 3 "Duplicate without user-selected canonical").
//  1. Sources: non-HTML copies are never indexed or name their page as canonical (RSC payloads, llms*.txt, printable files);
//     every formation, position, rule, term and drill has its own coach's notes; every lesson page has sibling links; the site
//     footer and /play link to the guide hubs; the game / tool JSON-LD builders carry the fields Google's types want.
//  2. A built site (NEXT_DIST_DIR or .next): for EVERY sitemap URL, one self-referencing absolute canonical; JSON-LD that parses,
//     no @type twice on a page, required fields per type, FAQPage questions visible in the page; a Related/Keep-reading block with
//     3+ internal links on every child page; breadcrumbs that match the BreadcrumbList; no orphans (every sitemap URL is linked
//     from another built page); and a minimum of words unique to each page in every guide family.
// usage: node tests/seo-boost.cjs   (build first for part 2: NEXT_DIST_DIR=.next-seo npm run -s build:quiet)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8'),SITE='https://futbolisland.app';
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,URL,URLSearchParams,
  setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'},cwd:()=>root},exports:mod.exports,module:mod,require:id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');}};
  if(id==='next/og')return {ImageResponse:class{}};
  if(id.endsWith('.css'))return new Proxy({},{get:(_,k)=>String(k)});
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));

// ---- 1. sources -----------------------------------------------------------------------------------------------------------------
(async()=>{
 const cfg=await import(path.join(root,'next.config.mjs')),rules=await cfg.default('phase-production-build').headers();
 const robotsOf=(src,has)=>rules.filter(r=>r.source===src&&JSON.stringify(r.has??null)===JSON.stringify(has??null)).flatMap(r=>r.headers).find(h=>h.key==='X-Robots-Tag')?.value;
 assert.equal(robotsOf('/:path*',[{type:'header',key:'rsc'}]),'noindex','RSC payloads (RSC header) are never indexed');
 assert.equal(robotsOf('/:path*',[{type:'query',key:'_rsc'}]),'noindex','RSC payloads (?_rsc=) are never indexed');
 assert.equal(robotsOf('/:file(llms\\.txt|llms-full\\.txt)'),'noindex','llms files are read, not listed');
 assert(!rules.some(r=>r.headers.some(h=>h.key==='X-Robots-Tag')&&!r.has&&/^\/(:path\*)?$/.test(r.source)),'no blanket noindex');
 const pr=L('lib/site/tools/printables.ts');
 for(const f of pr.PRINT_FILES)assert(pr.printFilePage(f.name),`${f.name}: a sheet page to name as canonical`);
 assert.match(read('app/(site)/tools/soccer-field-diagrams/files/[file]/route.tsx'),/Link:`<\$\{abs\(page\.path\)\}>; rel="canonical"`/,'printable files send rel=canonical');

 // coach's notes on every guide family
 const N=L('lib/site/notesGuides.ts'),C=L('lib/site/coachNotes.ts');
 const fam=[['formation',L('lib/site/formations.ts').FORMATIONS,N.FORMATION_NOTES,true],['position',L('lib/site/positions.ts').POSITIONS,N.POSITION_NOTES,true],
  ['rule',L('lib/site/rules.ts').RULES,N.RULE_NOTES,false],['term',L('lib/site/terms.ts').TERM_PAGES,N.TERM_NOTES,false]];
 for(const [f,list,notes,mistakes] of fam){C.checkNotes(f,list.map(x=>x.slug),notes,{mistakes});
  const texts=list.map(x=>notes[x.slug].coach+notes[x.slug].match);assert.equal(new Set(texts).size,texts.length,`${f}: every page's notes are its own`);}
 const D=L('lib/site/drills.ts');
 for(const d of D.DRILLS)assert.equal(D.drillAgeNotes(d).map(a=>a[0]).join(),d.ages.join(),`${d.slug}: one age note per age`);
 const allNotes=[...fam.flatMap(([,list,notes])=>list.map(x=>notes[x.slug])).flatMap(n=>[n.coach,n.match,...n.ages.map(a=>a[1]),...(n.mistakes??[])]),...D.DRILLS.flatMap(d=>D.drillAgeNotes(d).map(a=>a[1]))];
 for(const t of allNotes){assert(!/\bhead (?:it|the ball)\b|\bheaders?\b(?! the)/i.test(t)||/never|no heading|not head|do not|don’t/i.test(t),`no heading advice: ${t.slice(0,60)}`);
  assert(!/\d+\s?%|percent/i.test(t),`no statistics: ${t.slice(0,60)}`);}
 for(const page of ['soccer-formations','soccer-positions','soccer-rules','soccer-terms','soccer-drills'])assert.match(read(`app/(site)/learn/${page}/[slug]/page.tsx`),/<CoachNotesSection /,`${page} pages show the coach's notes`);

 // lesson siblings
 const lessons=L('lib/site/lessons.ts').LESSONS,R=L('lib/site/related.ts');
 for(const l of lessons){const s=R.lessonSiblings(l),ids=[...s.same,s.prev,s.next].map(x=>x.id);
  assert(!ids.includes(l.id)&&new Set(ids).size===ids.length&&ids.length>=5,`${l.id}: 5 distinct sibling links`);
  assert([...s.same,s.prev,s.next].every(x=>x.format===l.format),`${l.id}: siblings in the same format`);}
 // hubs from everywhere
 const layout=read('app/(site)/layout.tsx');
 for(const h of ['/learn/lessons','/learn/soccer-drills','/learn/soccer-practice-plans','/learn/soccer-formations','/learn/soccer-positions','/learn/soccer-rules','/learn/soccer-terms','/tools','/games'])assert(layout.includes(`'${h}'`),`footer links ${h}`);
 assert.match(read('components/landing/Landing.tsx'),/href="\/learn\/lessons">Guides<\/a>/,'/play links to the guides');
 // JSON-LD builders
 const seo=L('lib/site/seo.ts'),play=seo.playLd(),site=seo.siteLd();
 for(const g of [play,site]){assert.equal(g.operatingSystem,'Web browser');assert.equal(g.isFamilyFriendly,true);assert.equal(g.offers.price,0);assert.equal(g.audience.suggestedMinAge,7);assert.equal(g.audience.suggestedMaxAge,12);
  assert.equal(g.inLanguage,'en');assert(!('aggregateRating' in g)&&!('review' in g),'no ratings');assert.equal(g['@id'],SITE+'/play#game');}
 const games=L('lib/site/games.ts');
 for(const g of games.GAME_PAGES){const v=games.videoGameLd(g);assert.equal(v.operatingSystem,'Web browser');assert.equal(v.isFamilyFriendly,true);assert.equal(v.applicationCategory,'Game');assert(!('aggregateRating' in v),'no ratings');}
 assert.equal(L('lib/site/tools/registry.ts').webAppLd({name:'x',path:'/tools/x',description:'d',features:[]}).operatingSystem,'Web browser');
 assert.equal(seo.PUBLISHER.logo.url,SITE+'/icon.png','publisher has a logo');
 {const a=seo.websiteLd().potentialAction;assert(a&&a['@type']==='SearchAction'&&a.target.urlTemplate==='https://futbolisland.app/learn?q={search_term_string}','SearchAction to the /learn search (seo-extras)');}

 // ---- 2. built site ---------------------------------------------------------------------------------------------------------------
 const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),app=path.join(dist,'server/app');
 if(!fs.existsSync(path.join(app,'sitemap.xml.body'))||!fs.existsSync(path.join(app,'learn/soccer-drills.html'))){console.log(`  SKIP built-site checks: no build in ${path.relative(root,dist)}`);console.log('seo-boost: source checks OK');return;}
 const urls=[...fs.readFileSync(path.join(app,'sitemap.xml.body'),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replace(SITE,'')||'/');
 const html=p=>{const f=path.join(app,p==='/'?'index.html':p.slice(1)+'.html');return fs.existsSync(f)?fs.readFileSync(f,'utf8'):null;};
 const strip=s=>s.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<svg[\s\S]*?<\/svg>/g,' ');
 const textOf=h=>{const m=h.match(/<main[\s\S]*<\/main>/);return strip(m?m[0]:h).replace(/<[^>]+>/g,' ').replace(/&#x27;|&#39;/g,'\'').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();};
 const norm=s=>s.replace(/[’']/g,'\'').replace(/\s+/g,' ').trim();
 const REQ={Article:['headline','description','datePublished','dateModified','author','publisher','image'],VideoGame:['name','description','genre','offers','audience','inLanguage','isFamilyFriendly','operatingSystem'],
  WebApplication:['name','description','applicationCategory','operatingSystem','offers'],LearningResource:['name','description','educationalLevel','learningResourceType'],
  BreadcrumbList:['itemListElement'],FAQPage:['mainEntity'],Organization:['name','url','logo'],WebSite:['name','url']};
 const inbound=new Map(urls.map(u=>[u,0])),texts={},problems=[];
 const CHILD=/^\/(learn\/(soccer-(drills|formations|rules|positions|terms|practice-plans)|lessons)\/[^/]+|tools\/[^/]+(\/[^/]+)?|games\/[^/]+)$/;
 for(const p of urls){
  const h=html(p);if(!h){if(p!=='/play'&&p!=='/privacy')problems.push(`${p}: not prerendered`);continue;}
  const canon=[...h.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(m=>m[1]);
  if(canon.length!==1||canon[0]!==SITE+(p==='/'?'':p))problems.push(`${p}: canonical ${canon.join(',')||'none'}`);
  const lds=[...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch{problems.push(`${p}: JSON-LD does not parse`);return {};}});
  const types=lds.map(x=>[].concat(x['@type']).join('+'));
  if(new Set(types).size!==types.length)problems.push(`${p}: duplicate JSON-LD ${types}`);
  const text=norm(textOf(h));
  for(const ld of lds)for(const t of [].concat(ld['@type']))for(const k of REQ[t]??[])if(ld[k]===undefined||ld[k]==='')problems.push(`${p}: ${t} without ${k}`);
  const faq=lds.find(x=>x['@type']==='FAQPage');
  if(faq)for(const q of faq.mainEntity)if(!norm(strip(h).replace(/<[^>]+>/g,' ').replace(/&#x27;/g,'\'').replace(/&amp;/g,'&').replace(/&quot;/g,'"')).includes(norm(q.name)))problems.push(`${p}: FAQ question not on the page: ${q.name.slice(0,50)}`);
  const bc=lds.find(x=>x['@type']==='BreadcrumbList');
  if(bc){const last=bc.itemListElement.at(-1).item;if(last!==SITE+(p==='/'?'/':p))problems.push(`${p}: breadcrumb ends at ${last}`);
   const nav=h.match(/<nav[^>]*aria-label="Breadcrumb"[\s\S]*?<\/nav>/i);if(!nav)problems.push(`${p}: BreadcrumbList without visible breadcrumbs`);}
  const links=new Set([...h.matchAll(/<a\b[^>]*href="(\/[^"#?]*)/g)].map(m=>m[1].replace(/(.)\/$/,'$1')));
  for(const l of links)if(l!==p&&inbound.has(l))inbound.set(l,inbound.get(l)+1);
  if(CHILD.test(p)){const rel=h.match(/id="(related|siblings|more)"[\s\S]*?<\/section>/g)?.join('')??'';const n=new Set([...rel.matchAll(/href="(\/[^"#]+)"/g)].map(m=>m[1])).size;
   if(n<3)problems.push(`${p}: related block has ${n} links`);}
  texts[p]=text;
 }
 for(const [u,n] of inbound)if(u!=='/'&&n===0)problems.push(`${u}: orphan (no other page links to it)`);
 // unique words per family: words in sentences found on no other page of the family
 const FAM={drill:/^\/learn\/soccer-drills\/[^/]+$/,plan:/^\/learn\/soccer-practice-plans\/[^/]+$/,formation:/^\/learn\/soccer-formations\/[^/]+$/,rule:/^\/learn\/soccer-rules\/[^/]+$/,
  position:/^\/learn\/soccer-positions\/[^/]+$/,term:/^\/learn\/soccer-terms\/[^/]+$/,lesson:/^\/learn\/lessons\/[^/]+$/,game:/^\/games\/[^/]+$/};
 const MIN={drill:500,plan:550,formation:600,rule:600,position:700,term:400,lesson:290,game:600};
 for(const [f,re] of Object.entries(FAM)){const ps=Object.keys(texts).filter(p=>re.test(p)),sents=ps.map(p=>texts[p].split(/(?<=[.!?:])\s+/).filter(s=>s.length>12)),df=new Map();
  sents.forEach(ss=>new Set(ss).forEach(s=>df.set(s,(df.get(s)||0)+1)));
  ps.forEach((p,i)=>{const u=sents[i].filter(s=>df.get(s)===1).reduce((a,s)=>a+s.split(' ').length,0);if(u<MIN[f])problems.push(`${p}: ${u} unique words (${f} minimum ${MIN[f]})`);});}
 assert.deepEqual(problems.slice(0,30),[],`${problems.length} built-site problems`);
 console.log(`seo-boost: source checks OK; ${urls.length} built pages: canonicals, JSON-LD, FAQ, breadcrumbs, related links, no orphans, unique text OK`);
})().catch(e=>{console.error(e.message);process.exit(1);});
