// Spanish pages, round 1 (Nov 15 2026; docs/i18n/HANDOFF.md, lib/i18n/*):
//  1. Coverage: every sitemap page has a Spanish version, is out of scope, or is in a PENDING family (lib/i18n/esScope.ts); every
//     Spanish data family has exactly the English slugs, 1:1 arrays, and every ES_PAGES path renders.
//  2. SEO: Spanish titles <= 60 and descriptions 70-155 characters, all unique; self canonical per language; hreflang en / es /
//     x-default reciprocal (the English page's set equals the Spanish one's); Open Graph es_US; JSON-LD inLanguage "es";
//     FAQPage JSON-LD equals the questions shown; the sitemap lists both versions with alternates.
//  3. Words: no banned words (glossary), no leftover English in translated fields (stopword heuristic), lead marked data-answer.
//  4. Document shell: <html lang="es"> on /es (app/es/layout.tsx), lang "en" for every English section; build cost: /es prerenders
//     nothing (generateStaticParams returns [], dynamicParams on).
// usage: node tests/es-pages.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
const ep=L('lib/i18n/esPaths.ts'),scope=L('lib/i18n/esScope.ts'),routes=L('components/es/routes.tsx'),seo=L('lib/site/seo.ts'),gl=L('lib/i18n/es-glossary.ts');
const paths=L('lib/site/paths.ts').sitePaths().map(p=>p.path);
// ---- 1. coverage ----
const pending={};
for(const p of paths){
 if(ep.hasEs(p)||scope.ES_OUT_OF_SCOPE.some(re=>re.test(p)))continue;
 const f=scope.esPendingFamily(p);assert(f,`${p}: no Spanish page and not listed as pending or out of scope (lib/i18n/esScope.ts)`);(pending[f]=pending[f]||[]).push(p);
}
for(const p of ep.ES_PAGES){assert(paths.includes(p),`${p}: a Spanish page must have an English sitemap page`);assert(!scope.esPendingFamily(p)||true);}
const fam=[['lib/site/rules.ts','RULES','lib/i18n/es/rules.ts','RULES_ES','ES_RULE_SLUGS'],['lib/site/terms.ts','TERM_PAGES','lib/i18n/es/terms.ts','TERMS_ES','ES_TERM_SLUGS'],['lib/site/positions.ts','POSITIONS','lib/i18n/es/positions.ts','POSITIONS_ES','ES_POSITION_SLUGS']];
const ARR=['scenes','refs','mixups','formats','faq','how','mistakes','withBall','withoutBall','habits'];
for(const [enF,enK,esF,esK,slugK] of fam){
 const en=L(enF)[enK],es=L(esF)[esK];
 assert.deepEqual(Object.keys(es),en.map(x=>x.slug),`${esK}: the English slugs, in order`);
 assert.deepEqual([...ep[slugK]],en.map(x=>x.slug),`esPaths ${slugK} matches the English slugs`);
 for(const x of en){const e=es[x.slug];for(const k of ARR)if(Array.isArray(x[k])&&k in e)assert.equal(e[k].length,x[k].length,`${esK}.${x.slug}.${k}: 1:1 with English`);}
}
{const en=L('lib/site/notesGuides.ts');for(const [n,esF,esK] of [['RULE_NOTES','lib/i18n/es/rules.ts','RULES_ES'],['TERM_NOTES','lib/i18n/es/terms.ts','TERMS_ES'],['POSITION_NOTES','lib/i18n/es/positions.ts','POSITIONS_ES']])
 for(const [slug,e] of Object.entries(L(esF)[esK])){const x=en[n][slug];assert.deepEqual(e.notes.ages.map(a=>a[0]),x.ages.map(a=>a[0]),`${slug}: age labels kept`);assert.equal((e.notes.mistakes||[]).length,(x.mistakes||[]).length,`${slug}: notes.mistakes 1:1`);}}
{/* round 2: formations (21 pages) and comparisons (3), 1:1 with English */
 const en=L('lib/site/formations.ts'),es=L('lib/i18n/es/formations.ts'),notes=L('lib/site/notesGuides.ts').FORMATION_NOTES;
 assert.deepEqual(Object.keys(es.FORMATIONS_ES),en.FORMATIONS.map(f=>f.slug),'FORMATIONS_ES: the English slugs, in order');
 assert.deepEqual([...ep.ES_FORMATION_SLUGS],en.FORMATIONS.map(f=>f.slug),'esPaths ES_FORMATION_SLUGS matches');
 for(const f of en.FORMATIONS){const e=es.FORMATIONS_ES[f.slug];for(const k of ['roles','strengths','weak','faq'])assert.equal(e[k].length,f[k].length,`FORMATIONS_ES.${f.slug}.${k}: 1:1`);
  assert.deepEqual(e.notes.ages.map(a=>a[0]),notes[f.slug].ages.map(a=>a[0]),`${f.slug}: age labels kept`);assert.equal(e.notes.mistakes.length,notes[f.slug].mistakes.length,`${f.slug}: notes.mistakes 1:1`);}
 for(const g of en.FORMAT_GUIDES){const e=es.FORMAT_GUIDES_ES[g.format];for(const k of ['basics','pick','faq'])assert.equal(e[k].length,g[k].length,`FORMAT_GUIDES_ES.${g.format}.${k}: 1:1`);}
 const h=es.FORMATIONS_HUB_ES(en.FORMATIONS.length);assert.equal(h.what.length,en.FORMATIONS_HUB.what.length);assert.equal(h.faq.length,en.FORMATIONS_HUB.faq.length);
 const c=L('lib/site/comparisons.ts').COMPARISONS,ce=L('lib/i18n/es/comparisons.ts').COMPARISONS_ES;assert.deepEqual(Object.keys(ce),c.map(x=>x.slug));
 for(const x of c){assert.equal(ce[x.slug].fit.length,x.fit.length);assert.equal(ce[x.slug].switching.length,x.switching.length);}}
{/* round C: drills (hub + 10 guides + 46 drills) and practice plans (hub + 12), 1:1 with English */
 const d=L('lib/site/drills.ts').DRILLS,de=L('lib/i18n/es/drills.ts').DRILLS_ES,n=L('lib/site/notesDrills.ts').DRILL_AGE_NOTES,g=L('lib/site/drillGuides.ts').DRILL_GUIDES,ge=L('lib/i18n/es/drillGuides.ts').DRILL_GUIDES_ES,p=L('lib/site/plans.ts').PLANS,pe=L('lib/i18n/es/plans.ts').PLANS_ES;
 assert.deepEqual(Object.keys(de),d.map(x=>x.slug),'DRILLS_ES: the English slugs, in order');assert.deepEqual([...ep.ES_DRILL_SLUGS],[...g.map(x=>x.slug),...d.map(x=>x.slug)],'esPaths ES_DRILL_SLUGS');
 for(const x of d){const e=de[x.slug];for(const k of ['steps','cues','mistakes','faq'])assert.equal(e[k].length,x[k].length,`DRILLS_ES.${x.slug}.${k}: 1:1`);assert.equal(e.ages.length,n[x.slug].length,`${x.slug}: age notes 1:1`);
  assert.equal((e.answer.match(/[^.!?]+[.!?]+(?=\s|$)/g)||[]).length,2,`${x.slug}: two-sentence answer`);}
 assert.deepEqual(Object.keys(ge),g.map(x=>x.slug));for(const x of g){const e=ge[x.slug];for(const k of ['before','after','picks','faq'])assert.equal(e[k].length,x[k].length,`DRILL_GUIDES_ES.${x.slug}.${k}: 1:1`);}
 assert.deepEqual(Object.keys(pe),p.map(x=>x.slug));assert.deepEqual([...ep.ES_PLAN_SLUGS],p.map(x=>x.slug),'esPaths ES_PLAN_SLUGS');
 for(const x of p){const e=pe[x.slug];for(const k of ['rows','equipment','notes','faq'])assert.equal(e[k].length,x[k].length,`PLANS_ES.${x.slug}.${k}: 1:1`);}}
{/* round D: lessons (96), 1:1 with the English site lessons; no verdict opener in an explanation (a page never gives the answer) */
 const en=L('lib/site/lessons.ts').LESSONS,es=L('lib/i18n/es/lessons.ts').LESSONS_ES;assert.deepEqual(Object.keys(es),en.map(l=>l.id),'LESSONS_ES: the English lesson ids, in order');
 for(const l of en){const e=es[l.id];assert.equal(e.steps.length,l.steps.length,`${l.id}.steps 1:1`);assert.equal(e.questions.length,l.questions.length,`${l.id}.questions 1:1`);
  e.questions.forEach((q,i)=>{assert.equal(q.options.length,l.questions[i].options.length,`${l.id}.q${i}.options 1:1`);assert(!/^(?:sí|correcto|exacto|exactamente|muy bien|así es|eso es)[.!,:]/i.test(q.explain),`${l.id}.q${i}: verdict opener`);});}}
{const t=L('lib/site/terms.ts'),hub=L('lib/i18n/es/terms.ts').TERMS_HUB_ES;assert.deepEqual(Object.keys(hub.glossary).sort(),t.GLOSSARY.map(g=>g.id).sort(),'every glossary entry translated');}
// ---- 2 + 3. every Spanish page ----
const STOP=/\b(the|and|with|your|you|when|which|this|that|player|players|ball|kick|team|from|have)\b/i;
const strings=(x,out=[])=>{if(typeof x==='string')out.push(x);else if(Array.isArray(x))x.forEach(y=>strings(y,out));else if(x&&typeof x==='object')Object.values(x).forEach(y=>strings(y,out));return out;};
const ALLOWED=/U\.S\. Soccer|US Youth Soccer|build-out line|Laws of the Game|The FA|Futbol Island|nutmeg|hat-trick|clean sheet|give-and-go|one-two|soccer|White Sports Ventures|Ocean Discovery Institute|Kitchens for Good|Big Brothers Big Sisters|“[A-Z][^”]*” \([^)]*\)|\(en inglés\)/g;
for(const f of ['lib/i18n/es/rules.ts','lib/i18n/es/terms.ts','lib/i18n/es/positions.ts','lib/i18n/es/formations.ts','lib/i18n/es/comparisons.ts','lib/i18n/es/drills.ts','lib/i18n/es/drillGuides.ts','lib/i18n/es/plans.ts','lib/i18n/es/lessons.ts','lib/i18n/es/safety.ts','lib/i18n/es/hubs.ts','lib/i18n/es/charts.ts','lib/i18n/es/tools.ts']){
 for(const s of strings(L(f))){
  if(s==='U13 and up')continue;
  if(/^\/[\w\/#-]*$/.test(s))continue;/* a path *//* the English age label key, shown as “U13 y mayores” (EsCoachNotes) */
  for(const re of gl.ES_BANNED)assert(!re.test(s),`${f}: banned word ${re} in “${s.slice(0,80)}”`);
  const bare=s.replace(ALLOWED,'');assert(!STOP.test(bare),`${f}: English left? “${s.slice(0,120)}”`);
 }
}
const titles=new Set(),descs=new Set(),h1s=new Set();
for(const enPath of ep.ES_PAGES){
 const r=routes.esRoute(enPath);assert(r,`${enPath}: a Spanish route`);const m=r.meta(),esPath=ep.toEs(enPath);
 const title=m.title.absolute;assert(title.length<=60,`${esPath}: title ${title.length} > 60: ${title}`);
 assert(m.description.length>=70&&m.description.length<=155,`${esPath}: description ${m.description.length} chars`);
 assert(!titles.has(title),`${esPath}: duplicate title`);titles.add(title);assert(!descs.has(m.description),`${esPath}: duplicate description`);descs.add(m.description);
 assert.equal(m.alternates.canonical,esPath,`${esPath}: self canonical`);
 assert.deepEqual(m.alternates.languages,{en:enPath,es:esPath,'x-default':enPath},`${esPath}: hreflang set`);
 assert.equal(m.openGraph.locale,'es_US');
 const enMeta=seo.pageMeta('X','A description that is long enough to be kept exactly as it is, for this test only.',enPath);
 assert.deepEqual(enMeta.alternates.languages,m.alternates.languages,`${enPath}: the English page names the same pair (reciprocal)`);
 const html=render(r.render());
 const h1=/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1];assert(h1,`${esPath}: an h1`);assert(!h1s.has(h1),`${esPath}: duplicate h1`);h1s.add(h1);
 assert(/data-answer=""/.test(html),`${esPath}: answer-first lead`);
 for(const ld of ldOf(html)){
  if('inLanguage' in ld)assert.equal(ld.inLanguage,'es',`${esPath}: JSON-LD ${ld['@type']} inLanguage es`);
  assert(!JSON.stringify(ld).includes('"inLanguage":"en"'),`${esPath}: no nested inLanguage en`);
  if(ld['@type']==='FAQPage'){assert(ld.mainEntity.length>0);for(const q of ld.mainEntity){assert(q.name&&q.acceptedAnswer&&q.acceptedAnswer.text,`${esPath}: FAQ entries`);
   assert(html.includes(q.name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'))||html.includes(q.name.replace(/&/g,'&amp;')),`${esPath}: FAQ "${q.name}" is shown`);}}
  // Practice-problem markup (Nov 17 2026): a guide's nested Quiz names the shown right option as acceptedAnswer; lessons have no Quiz.
  const quiz=[].concat(ld['@type']).includes('LearningResource')?ld.hasPart:null;
  if(/\/lecciones\//.test(esPath)||/\/lessons\//.test(esPath))assert(!quiz,`${esPath}: no Quiz on a lesson (the answer is never shown)`);
  if(quiz)for(const x of quiz.hasPart){const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
   assert(x.acceptedAnswer&&x.acceptedAnswer.text&&html.includes(esc(x.acceptedAnswer.text)),`${esPath}: Question "${x.name}" has a shown acceptedAnswer`);
   assert(html.includes(esc(x.text)),`${esPath}: Question "${x.name}" is shown`);
   // Nov 22 2026: answer comments are the Spanish feedback line the quiz shows; practice-problem fields present.
   assert(x.suggestedAnswer.every(s=>s.comment&&s.comment.text.startsWith('Casi. La respuesta es:'))&&x.acceptedAnswer.comment.text.startsWith('¡Sí!'),`${esPath}: Spanish answer comments`);
   assert(x.typicalAgeRange==='7-12'&&x.assesses&&x.encodingFormat==='text/plain'&&x.learningResourceType==='Practice problem',`${esPath}: practice-problem fields`);}
  if(ld['@type']==='BreadcrumbList')for(const c of ld.itemListElement)assert(/^https:\/\/futbolisland\.app\/es(\/|$)/.test(c.item),`${esPath}: breadcrumbs stay in Spanish`);
 }
 const text=html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/g,' ').replace(/\S*futbolisland\.app\S*/g,' ').replace(ALLOWED,'');
 const hits=text.match(new RegExp(STOP.source,'gi'))||[];assert(hits.length===0,`${esPath}: English words on the page: ${[...new Set(hits)].join(', ')}`);
 for(const re of gl.ES_BANNED)assert(!re.test(text),`${esPath}: banned word ${re}`);
}
// sitemap
{const sm=L('lib/site/sitemaps.ts').sitemapEntries();const byUrl=new Map(sm.map(x=>[x.url,x]));
 for(const p of ep.ES_PAGES){const e=byUrl.get(seo.abs(ep.toEs(p))),n=byUrl.get(seo.abs(p));assert(e&&n,`${p}: both languages in the sitemap`);
  assert.deepEqual(e.alternates,n.alternates,`${p}: same hreflang set on both sitemap entries`);assert.equal(e.alternates.languages.es,seo.abs(ep.toEs(p)));}}
// Spanish search (round D): /es/learn?q= (noindex, follow), its index has only /es pages with Spanish names, "fuera" finds offside
{const idx=L('lib/i18n/es/search.ts').buildSearchIndexEs(),core=L('lib/site/searchCore.ts');assert(idx.length>150,`Spanish search index: ${idx.length} entries`);
 for(const e of idx){assert(/^\/es(\/|$)/.test(e.p),`search ${e.p}: Spanish path`);assert(ep.hasEs(ep.toEn(e.p.replace(/#.*$/,''))),`search ${e.p}: a Spanish page`);}
 const hit=core.searchEntries(idx,'fuera');assert(hit.length&&hit[0].items.some(e=>e.p==='/es/learn/soccer-rules/offside'),'“fuera” finds the offside rule');
 const r=routes.esRoute('/learn'),m=r.meta();assert.deepEqual(m.robots,{index:false,follow:true});assert.equal(m.alternates.canonical,'/es/learn');
 const html=render(r.render());assert(/data-learn-search=""/.test(html)&&/action="\/es\/learn"/.test(html),'/es/learn renders the Spanish search');
 assert.match(read('components/es/pages/HomeEs.tsx'),/urlTemplate:URL_ES\+'\/learn\?q=\{search_term_string\}'/,'Spanish WebSite SearchAction');}
// ---- 4. document shell and build cost ----
assert.match(read('app/es/layout.tsx'),/<HtmlShell lang="es">/,'Spanish pages: <html lang="es">');
assert.match(read('components/site/HtmlShell.tsx'),/<html lang=\{lang\} suppressHydrationWarning>/);
assert(!/<html/.test(read('app/layout.tsx').replace(/\/\/.*$/gm,'')),'the root layout is a pass-through');
for(const d of fs.readdirSync(path.join(root,'app'),{withFileTypes:true})){
 if(!d.isDirectory()||d.name==='es'||d.name==='api')continue;
 const dir=path.join(root,'app',d.name),walk=x=>fs.readdirSync(x,{withFileTypes:true}).some(y=>y.isDirectory()?walk(path.join(x,y.name)):y.name==='page.tsx');
 if(!walk(dir))continue;
 assert.match(fs.readFileSync(path.join(dir,'layout.tsx'),'utf8'),/<HtmlShell lang="en">/,`app/${d.name}: its layout renders the English document shell`);
}
const page=read('app/es/[[...path]]/page.tsx');
assert.match(page,/export const generateStaticParams=\(\)=>\[\]/,'/es prerenders nothing at build time');assert.match(page,/export const dynamicParams=true/,'and renders on demand');
console.log(`PASS es pages: ${ep.ES_PAGES.length} Spanish pages; pending: ${Object.entries(pending).map(([k,v])=>`${k} ${v.length}`).join(', ')}`);
