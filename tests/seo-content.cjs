// SEO content pass (Nov 15 2026, Search Console data): answer-first paragraphs, query-led FAQs, titles and descriptions, the
// "Last checked" line and the trust page. Same method as tests/seo-rules-terms-sizes.cjs: no build, the REAL page modules are
// transpiled and rendered to static HTML here, then checked.
//  1. Titles <= 60 and descriptions <= 155 characters, unique across every registry-driven page (guides, tools, games, hubs).
//  2. Rules, terms and positions: the first paragraph after the h1 is the answer (data-answer), 40-60 words, the data's text.
//  3. FAQPage JSON-LD: exactly one, valid shape, 3-5 unique questions, each visible on the page with its answer.
//  4. Every rule, term, position, formation and drill page shows "Last checked" with its family's data date and links the trust
//     page; the trust page is in the sitemap, renders one h1 and its own FAQ-free JSON-LD; contentDates.json is well-formed.
// usage: node tests/seo-content.cjs
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
const guides=L('lib/site/guides.ts'),rules=L('lib/site/rules.ts'),terms=L('lib/site/terms.ts'),positions=L('lib/site/positions.ts'),formations=L('lib/site/formations.ts'),
 drills=L('lib/site/drills.ts'),tools=L('lib/site/tools/registry.ts'),games=L('lib/site/games.ts'),hubs=L('lib/site/hubs.ts'),paths=L('lib/site/paths.ts'),checked=L('lib/site/checked.ts');
const A='app/(site)/learn',words=s=>s.split(/\s+/).filter(Boolean).length;
const text=h=>h.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<(title|desc)[\s\S]*?<\/\1>/g,' ').replace(/<[^>]+>/g,' ').replace(/&#x27;|&#39;/g,'’').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const norm=s=>s.replace(/'/g,'’').replace(/\s+/g,' ').trim();
const render=(file,params)=>renderToStaticMarkup(React.createElement(L(file).default,params?{params}:{}));

// ---- 1. titles and descriptions ------------------------------------------------------------------------------------------------
const metas=[...guides.ALL_GUIDE_PAGES.map(g=>[g.path,g.title,g.description]),...tools.TOOL_PAGES.map(t=>[t.path,t.title,t.description]),
 ...games.GAME_LISTINGS.map(g=>[g.path,g.title,g.description]),...hubs.HUBS.map(h=>[h.path,h.title,h.description]),[hubs.SAFE_GUIDE.path,hubs.SAFE_GUIDE.title,hubs.SAFE_GUIDE.description]];
{const fm=L('app/(site)/about/how-we-check-facts/page.tsx').metadata;metas.push([checked.FACTS_PATH,fm.title,fm.description]);}
const seenT=new Map(),seenD=new Map();
for(const [p,t,d] of metas){
 assert(t&&t.length<=60,`${p}: title ${t&&t.length} > 60: ${t}`);assert(d&&d.length<=155,`${p}: description ${d&&d.length} > 155`);
 assert(!seenT.has(t),`${p}: title repeats ${seenT.get(t)}: ${t}`);seenT.set(t,p);assert(!seenD.has(d),`${p}: description repeats ${seenD.get(d)}`);seenD.set(d,p);}
// the Search Console wording (gsc data, Nov 15 2026; 2v1, heading and tennis re-led Nov 18 2026) stays in the titles of the pages people found
// Nov 22 2026 (CTR round): the cards rule page is the rules deep-dive; the term pages answer "what does a yellow card mean".
const WANT={'/learn/soccer-rules/yellow-and-red-cards':/yellow and red card rules in soccer/i,'/learn/soccer-terms/two-v-one':/^2v1 in soccer: what it means/i,/* Nov 24 2026: "2v1" at 2.6 with 0 clicks, re-led for the click */'/learn/soccer-rules/heading-rules-for-kids':/^heading rules in youth soccer/i,'/games/soccer-tennis-game':/^soccer tennis game/i,'/learn/soccer-rules/futsal-rules':/futsal rules vs soccer/i,
 '/tools/soccer-playing-time-calculator':/playing time calculator/i,'/learn/soccer-terms':/soccer terms a to z/i,'/learn/soccer-rules/back-pass-rule':/back[- ]pass rule in soccer/i};
for(const [p,re] of Object.entries(WANT))assert(re.test((metas.find(m=>m[0]===p)||[])[1]||''),`${p}: title keeps the search wording`);

// ---- 2-4. rendered detail pages ------------------------------------------------------------------------------------------------
const PAGES=[
 ...rules.RULES.map(r=>({fam:'rules',path:r.path,file:`${A}/soccer-rules/[slug]/page.tsx`,slug:r.slug,answer:r.answer,faq:r.faq})),
 ...terms.TERM_PAGES.map(t=>({fam:'terms',path:t.path,file:`${A}/soccer-terms/[slug]/page.tsx`,slug:t.slug,answer:t.answer,faq:t.faq})),
 ...positions.POSITIONS.map(p=>({fam:'positions',path:p.path,file:`${A}/soccer-positions/[slug]/page.tsx`,slug:p.slug,answer:p.answer,faq:p.faq})),
 ...formations.FORMATIONS.map(f=>({fam:'formations',path:f.path,file:`${A}/soccer-formations/[slug]/page.tsx`,slug:f.slug,faq:f.faq})),
 ...drills.DRILLS.map(d=>({fam:'drills',path:d.path,file:`${A}/soccer-drills/[slug]/page.tsx`,slug:d.slug,faq:d.faq})),
];
let nAnswers=0,nFaq=0;
for(const g of PAGES){const h=render(g.file,{slug:g.slug}),where=g.path;
 // answer first
 const after=h.slice(h.indexOf('</h1>'));const firstP=after.match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
 assert(firstP&&/data-answer/.test(firstP[0]),`${where}: the first paragraph after the h1 is the answer`);
 if(g.answer){const a=text(firstP[1]);assert.equal(a,norm(g.answer),`${where}: the answer paragraph is the data's answer`);
  assert(words(a)>=40&&words(a)<=60,`${where}: answer is ${words(a)} words (40-60)`);nAnswers++;}
 // FAQPage JSON-LD
 const lds=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const faqs=lds.filter(x=>x['@type']==='FAQPage');assert.equal(faqs.length,1,`${where}: exactly one FAQPage`);
 const types=lds.map(x=>x['@type']).flat();assert.equal(new Set(types).size,types.length,`${where}: no JSON-LD type twice`);
 const f=faqs[0];assert.equal(f['@context'],'https://schema.org');assert(Array.isArray(f.mainEntity)&&f.mainEntity.length>=3&&f.mainEntity.length<=5,`${where}: 3-5 questions`);
 assert.equal(new Set(f.mainEntity.map(q=>q.name)).size,f.mainEntity.length,`${where}: no repeated question`);
 const body=text(h);
 for(const q of f.mainEntity){assert(q['@type']==='Question'&&typeof q.name==='string'&&q.name.endsWith('?'),`${where}: Question shape`);
  assert(q.acceptedAnswer&&q.acceptedAnswer['@type']==='Answer'&&q.acceptedAnswer.text.length>=20,`${where}: Answer shape for ${q.name}`);
  assert(body.includes(norm(q.name))&&body.includes(norm(q.acceptedAnswer.text)),`${where}: FAQ visible: ${q.name}`);nFaq++;}
 assert.deepEqual(f.mainEntity.map(q=>q.name),g.faq.map(q=>q.q),`${where}: FAQPage = the page's FAQ`);
 // last checked + trust page
 const want=checked.FAMILY_CHECKED[g.fam];assert(new RegExp(`data-checked="${want}"`).test(h),`${where}: Last checked ${want}`);
 assert(body.includes(`Last checked: ${checked.longDate(want)}`),`${where}: visible Last checked date`);
 assert(h.includes(`href="${checked.FACTS_PATH}"`),`${where}: links the trust page`);}
// the query-led questions people search for (gsc data)
const q=(slug,list)=>list.find(x=>x.slug===slug).faq.map(x=>x.q);
for(const [slug,want] of [['yellow-and-red-cards','What are the yellow card rules in soccer?'],['yellow-and-red-cards','How do you get a red card in soccer?'],['back-pass-rule','What is the back pass rule in soccer?'],
 ['handball','What is a handball in soccer?'],['futsal-rules','How are futsal rules different from soccer rules?']])assert(q(slug,rules.RULES).includes(want),`${slug}: FAQ "${want}"`);
// trust page
{const h=render('app/(site)/about/how-we-check-facts/page.tsx');assert.equal((h.match(/<h1/g)||[]).length,1,'trust page: one h1');
 assert(paths.sitePaths().some(p=>p.path===checked.FACTS_PATH),'trust page in the sitemap');
 assert(!/href="https?:/.test(h),'trust page: no links out of the site');
 for(const d of Object.values(checked.FAMILY_CHECKED))assert(/^2026-(1[0-2])-\d{2}$|^20(2[7-9]|[3-9]\d)-\d{2}-\d{2}$/.test(d),`contentDates: ${d} is a real date`);}
assert.equal(checked.longDate('2026-11-05'),'November 5, 2026');assert.equal(checked.checkedOn('cards','2026-11-14'),'2026-11-14');assert.equal(checked.checkedOn('cards',undefined),checked.FAMILY_CHECKED.cards);
console.log(`seo-content: ${metas.length} titles/descriptions unique, ${PAGES.length} pages (${nAnswers} answers, ${nFaq} FAQs), trust page ok`);
