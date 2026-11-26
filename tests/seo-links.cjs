// Internal links, hubs, comparisons, read-next chains and lastmod (SEO, Nov 15 2026, branch seo-links).
//  1. Collection hubs (lib/site/collections.ts): each one a sitemap page with a route file, title <= 60 and description
//     110-160, unique, links only to sitemap pages, none twice; linked from /cards or /fish; every card on its role hub and
//     every fish on the spots hub; the checked name lists (lib/site/cardGroups.ts) match the cards' own text.
//  2. Contextual links per page type: card pages read 3-6 links (lesson, position guide, hubs, drill or fish), fish pages
//     2-3 (group hub, fishing spot, cards or lessons), position pages link 6 cards + their hub + drills + comparisons.
//  3. Comparisons (lib/site/comparisons.ts): sitemap pages with full tables, linked from both compared pages and the hub; the
//     futsal and team-size tables live on the existing pages (no near-duplicate page).
//  4. No duplicate canonical: every sitemap path once, every title once among the guide, hub and comparison pages.
//  5. lastmod: one per path from lib/site/lastmod.generated.json, a real date, not after today, not all equal; and, when the
//     tree is clean, the file matches scripts/gen-lastmod.cjs.
//  6. Read next (lib/site/readNext.ts): every guide detail page is in exactly one chain; walking "next" from the first page
//     visits every page once and ends at the hub (no loop, no dead end); prev mirrors next; each route renders <ReadNext>.
//  7. Click depth (a model of the built site's links; scripts/seo-crawl.cjs measures the real one): every sitemap page is
//     at most 3 clicks from /.
// usage: node tests/seo-links.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const {load}=(()=>{const ts=require('typescript'),vm=require('node:vm'),cache=new Map();
 function load(file){
  if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};cache.set(file,mod);
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
  vm.runInNewContext(out,{Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,URL,URLSearchParams,Intl,
   process:{env:{NODE_ENV:'production'},cwd:()=>root},exports:mod.exports,module:mod,require:id=>{
   if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
   const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
  return mod.exports;
 }
 return {load};})();
const L=rel=>load(path.join(root,rel));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const code=rel=>read(rel).replace(/\/\*[\s\S]*?\*\//g,'');
const paths=L('lib/site/paths.ts'),SP=paths.sitePaths(),PATHS=new Set([...SP.map(x=>x.path),...paths.NOINDEX_PATHS]);/* Nov 20 2026: single card pages, Nov 21 2026: common and uncommon fish pages are real pages, noindex and out of the sitemap */
const col=L('lib/site/collections.ts'),cmp=L('lib/site/comparisons.ts'),rel=L('lib/site/related.ts'),cards=L('lib/site/cards.ts'),fish=L('lib/site/fish.ts');
const groups=L('lib/site/cardGroups.ts'),positions=L('lib/site/positions.ts'),rn=L('lib/site/readNext.ts'),guides=L('lib/site/guides.ts');
const isPage=p=>PATHS.has(p.split('#')[0]);

// ---- 1. collection hubs ----------------------------------------------------------------------------------------------------
assert.equal(new Set(col.COLLECTIONS.map(c=>c.path)).size,col.COLLECTIONS.length,'hub paths are unique');
for(const c of col.COLLECTIONS){
 assert(PATHS.has(c.path),`${c.path} is in the sitemap`);
 assert(fs.existsSync(path.join(root,`app/(site)${c.path}/page.tsx`)),`${c.path}: route file`);
 assert(c.title.length<=60&&c.title.length>=20,`${c.path}: title length ${c.title.length}`);
 assert(c.description.length>=110&&c.description.length<=160,`${c.path}: description length ${c.description.length}`);
 assert(c.intro.length>=80&&c.h1&&c.crumb,`${c.path}: h1, crumb and an intro`);
 const links=c.groups.flatMap(g=>g.links);assert(links.length>=10,`${c.path}: at least 10 links`);
 for(const g of c.groups)assert(g.title&&g.links.length>0,`${c.path}: no empty group`);
 for(const l of [...links,...c.learn])assert(isPage(l.path),`${c.path}: ${l.path} is a sitemap page`);
 if(c.slug!=='spots')assert.equal(new Set(links.map(l=>l.path)).size,links.length,`${c.path}: no card or fish listed twice`);
}
for(const [file,list] of [['app/(site)/cards/page.tsx','CARD_COLLECTIONS'],['app/(site)/fish/page.tsx','FISH_COLLECTIONS']])
 assert(new RegExp(`<CollectionLinks list=\\{${list}\\}`).test(code(file)),`${file} links its hubs`);
for(const c of cards.SITE_CARDS)assert(col.cardCollections(c).length>=1&&col.cardCollections(c)[0]===col.roleCollection(c.role),`card ${c.number}: on its role hub, listed first`);
for(const f of fish.SITE_FISH)assert(col.fishCollections(f).some(h=>h.slug==='spots'),`fish ${f.id}: on the spots hub`);
for(const f of fish.SITE_FISH)assert(!col.FISH_COLLECTIONS.some(h=>h.slug===f.id),`no fish id clashes with a hub slug`);
{const byName=new Map(cards.SITE_CARDS.map(c=>[c.name,c])),notes=require(path.join(root,'lib/site/cardNotes.json'));
 const all=[...groups.WOMEN,...groups.WORLD_CUP_MEN,...groups.WORLD_CUP_WOMEN,...groups.WORLD_CUP_FUTSAL,...groups.WORLD_CUP_COACHES];
 for(const n of all)assert(byName.has(n),`${n} is a card`);
 const she=cards.SITE_CARDS.filter(c=>/\b(she|her)\b/i.test(c.blurb+' '+JSON.stringify(notes[c.name]??''))).map(c=>c.name).sort();
 assert.deepEqual(JSON.parse(JSON.stringify([...groups.WOMEN].sort())),JSON.parse(JSON.stringify(she)),'WOMEN is exactly the cards whose text says she/her');
 for(const n of groups.WORLD_CUP_WOMEN)assert(groups.WOMEN.includes(n),`${n}: a women's World Cup winner is on the women's hub`);
 for(const n of [...groups.WORLD_CUP_MEN,...groups.WORLD_CUP_WOMEN,...groups.WORLD_CUP_FUTSAL,...groups.WORLD_CUP_COACHES])
  if(n!=='Cafu')assert(/World Cup|Women’s World Cup/.test(byName.get(n).blurb),`${n}: the card's own text names the World Cup`);
 for(const n of groups.WORLD_CUP_FUTSAL)assert(byName.get(n).futsal,`${n}: a futsal card`);
 for(const n of groups.WORLD_CUP_COACHES)assert(byName.get(n).coach,`${n}: a coach card`);}

// ---- 2. contextual links per page type -------------------------------------------------------------------------------------
const stats={card:[],fish:[]};
for(const c of cards.SITE_CARDS){const r=rel.cardRelated(c),read=r.read.map(l=>l.path);
 assert(read.length>=3&&read.length<=6,`card ${c.number}: ${read.length} reading links (3-6)`);stats.card.push(read.length);
 const g=rel.roleGuide(c.role);if(g)assert(read.includes(g.path),`card ${c.number}: links its position guide`);
 assert(read.includes(col.roleCollection(c.role).path),`card ${c.number}: links its collection hub`);
 for(const l of r.read)assert(l.name.length>8&&!/^(click|here|read more)$/i.test(l.name),`card ${c.number}: descriptive anchor text`);}
for(const f of fish.SITE_FISH){const read=rel.fishRelated(f).read.map(l=>l.path);
 assert(read.length>=2&&read.length<=3,`fish ${f.id}: ${read.length} reading links (2-3)`);stats.fish.push(read.length);
 assert(read.some(p=>p.startsWith('/fish/spots#spot-')),`fish ${f.id}: links its fishing spot`);
 if(f.group!=='fish')assert(read.some(p=>col.FISH_COLLECTIONS.some(h=>h.path===p&&h.slug!=='spots')),`fish ${f.id}: links its animal group hub`);}
{const s=code('app/(site)/learn/soccer-positions/[slug]/page.tsx');
 assert(/roleCollection\(p\.cardRole\)/.test(s)&&/comparisonsFor\(p\.path\)/.test(s),'position pages link the card hub and the comparisons');
 for(const p of positions.POSITIONS)assert(col.roleCollection(p.cardRole),`${p.slug}: a card hub for its role`);}

// ---- 3. comparisons --------------------------------------------------------------------------------------------------------
for(const c of cmp.COMPARISONS){
 assert(PATHS.has(c.path),`${c.path} in the sitemap`);assert(fs.existsSync(path.join(root,`app/(site)${c.path}/page.tsx`)),`${c.path}: route file`);
 assert(c.title.length<=60&&c.desc.length>=110&&c.desc.length<=160,`${c.path}: title and description length`);
 assert(c.rows.length>=5&&c.rows.every(r=>r.length===3&&r.every(x=>x&&x.length>0)),`${c.path}: a full table`);
 assert(c.head.every(h=>h.length>0),`${c.path}: every column has a header`);
 for(const l of c.links)assert(isPage(l.path),`${c.path}: ${l.path} is a page`);
 for(const l of c.links.slice(0,2))assert(cmp.comparisonsFor(l.path).includes(c),`${l.path} links back to ${c.path}`);
}
assert(/FUTSAL_VS_SOCCER/.test(code('app/(site)/learn/soccer-rules/[slug]/page.tsx'))&&/TEAM_SIZES/.test(code('app/(site)/learn/7v7-9v9-11v11/page.tsx')),'the futsal and team-size tables sit on the existing pages');
/* Nov 26 2026 (owner: "queue 1 and 2"): /learn/futsal-vs-soccer is the one owner-requested exception, a fuller page (16 rows with
   "what it means for you", the court drawn to scale) aimed at "futsal vs soccer"; the futsal rules page keeps its short table for
   "futsal rules vs soccer rules" and links to it. Team sizes stay one page. */
assert(!SP.some(x=>/7v7-vs|9v9-vs/.test(x.path)||(/futsal-vs-soccer/.test(x.path)&&x.path!=='/learn/futsal-vs-soccer')),'no separate near-duplicate comparison page for futsal or team sizes');

// ---- 4. no duplicate canonical ---------------------------------------------------------------------------------------------
assert.equal(new Set(SP.map(x=>x.path)).size,SP.length,'every sitemap path once');
{const titles=[...guides.ALL_GUIDE_PAGES.map(g=>g.title),...col.COLLECTIONS.map(c=>c.title),...cmp.COMPARISONS.map(c=>c.title)];
 assert.equal(new Set(titles.map(t=>t.toLowerCase())).size,titles.length,'no two guide, hub or comparison pages share a title');}
for(const f of [...col.COLLECTIONS.map(c=>`app/(site)${c.path}/page.tsx`),...cmp.COMPARISONS.map(c=>`app/(site)${c.path}/page.tsx`)])
 assert(/hubMeta\(|compareMeta\(/.test(code(f)),`${f}: metadata with its own canonical`);
assert(/alternates:\{canonical:path\}/.test(code('lib/site/seo.ts')),'pageMeta sets the canonical');

// ---- 5. lastmod ------------------------------------------------------------------------------------------------------------
{const LM=require(path.join(root,'lib/site/lastmod.generated.json')),now=new Date(),today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 for(const x of SP){assert.equal(x.lastmod,LM[x.path],`${x.path}: lastmod from the generated file`);assert(/^2026-\d\d-\d\d$|^20[2-9]\d-\d\d-\d\d$/.test(x.lastmod)&&x.lastmod<=today&&x.lastmod>='2026-09-01',`${x.path}: a real date`);}
 assert(new Set(SP.map(x=>x.lastmod)).size>=2,'lastmod is not the same date everywhere');
 let clean=false;try{clean=execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim()===''&&execFileSync('git',['rev-parse','--is-shallow-repository'],{cwd:root,encoding:'utf8'}).trim()==='false';}catch{}
 if(clean)execFileSync('node',[path.join(root,'scripts/gen-lastmod.cjs'),'--check'],{cwd:root,stdio:'pipe'});}

// ---- 6. read next ----------------------------------------------------------------------------------------------------------
{const detail=[...guides.ALL_GUIDE_PAGES.filter(g=>!g.hub).map(g=>g.path),...L('lib/site/lessons.ts').LESSONS.map(l=>`/learn/lessons/${l.id}`)];
 const inChain=new Set(rn.CHAINS.flatMap(c=>c.pages.map(p=>p.path)));
 for(const p of detail)assert(inChain.has(p),`${p}: has a read-next chain`);
 for(const ch of rn.CHAINS){
  assert(PATHS.has(ch.hub.path),`${ch.id}: the hub is a page`);
  let at=ch.pages[0].path;const seen=new Set();
  assert.equal(rn.readNext(at).prev.path,ch.hub.path,`${ch.id}: the first page's previous is the hub`);
  while(at!==ch.hub.path){assert(!seen.has(at),`${ch.id}: loop at ${at}`);seen.add(at);const r=rn.readNext(at);assert(r&&r.next.path,`${ch.id}: dead end at ${at}`);
   assert(PATHS.has(r.next.path),`${at}: next ${r.next.path} is a page`);if(r.next.path!==ch.hub.path)assert.equal(rn.readNext(r.next.path).prev.path,at,`${ch.id}: prev mirrors next at ${r.next.path}`);at=r.next.path;}
  assert.equal(seen.size,ch.pages.length,`${ch.id}: the walk visits every page once`);
 }
 const rules=rn.readNext('/learn/soccer-rules/yellow-and-red-cards'),terms=rn.readNext('/learn/soccer-terms/two-v-one');
 assert.equal(rules.next.path,'/learn/soccer-rules/fouls-and-free-kicks');assert.equal(rn.readNext(rules.next.path).next.path,'/learn/soccer-rules/penalty-kick');
 assert.equal(terms.next.path,'/learn/soccer-terms/give-and-go');assert.equal(rn.readNext(terms.next.path).next.path,'/learn/soccer-terms/through-ball');
 for(const d of ['soccer-rules','soccer-terms','soccer-positions','soccer-formations','soccer-practice-plans','lessons'])
  assert(/<ReadNext path=\{/.test(code(`app/(site)/learn/${d}/[slug]/page.tsx`)),`${d}: renders ReadNext`);
 assert.equal((code('app/(site)/learn/soccer-drills/[slug]/page.tsx').match(/<ReadNext path=\{/g)||[]).length,2,'drill and drill-guide pages render ReadNext');}

// ---- 7. click depth (model) ------------------------------------------------------------------------------------------------
{assert(/<FooterHubs\/>/.test(code('app/(site)/layout.tsx')),'the footer renders lib/site/footerHubs.ts (Nov 20 2026)');const footer=[...code('lib/site/footerHubs.ts').matchAll(/\['(\/[^']*)','[^']+'\]/g)].map(m=>m[1]);
 for(const p of ['/cards','/fish','/exhibits','/learn/lessons','/learn/soccer-positions','/learn/soccer-formations','/learn/soccer-rules','/learn/soccer-terms','/learn/soccer-drills'])
  assert(footer.includes(p),`${p} is in the footer on every page (depth 1)`);
 const D=new Map([['/',0]]);const set=(p,d)=>{p=p.split('#')[0];if(PATHS.has(p)&&(!D.has(p)||D.get(p)>d))D.set(p,d);};
 footer.forEach(p=>set(p,1));
 const R=L('lib/site/rules.ts'),T=L('lib/site/terms.ts'),F=L('lib/site/formations.ts'),Dr=L('lib/site/drills.ts'),Pl=L('lib/site/plans.ts'),ex=L('lib/site/exhibits.ts'),les=L('lib/site/lessons.ts');
 const kids={'/cards':[...cards.SITE_CARDS.map(c=>cards.cardPath(c.number)),...col.CARD_COLLECTIONS.map(c=>c.path)],'/fish':[...fish.SITE_FISH.map(f=>fish.fishPath(f.id)),...col.FISH_COLLECTIONS.map(c=>c.path)],
  '/exhibits':ex.SITE_EXHIBITS.map(e=>ex.exhibitPath(e.id)),'/learn/lessons':les.LESSONS.map(l=>les.lessonPath(l.id)),'/learn/soccer-rules':R.RULES.map(r=>r.path),'/learn/soccer-terms':T.TERM_PAGES.map(t=>t.path),
  '/learn/soccer-positions':[...positions.POSITIONS.map(p=>p.path),...cmp.COMPARISONS.filter(c=>c.kind==='position').map(c=>c.path)],'/learn/soccer-formations':[...F.FORMATIONS.map(f=>f.path),...cmp.COMPARISONS.filter(c=>c.kind==='formation').map(c=>c.path),...F.FORMAT_GUIDES.map(g=>g.path)],
  '/learn/soccer-drills':Dr.DRILLS.map(d=>d.path),'/learn/soccer-practice-plans':Pl.PLANS.map(p=>p.path),
  '/videos':L('lib/site/videos.ts').allWatchVideos().map(v=>v.path)/* the watch pages (Nov 18 2026) */,
  '/books':L('lib/site/books.ts').SITE_BOOKS.filter(b=>b.path).map(b=>b.path),'/games':L('lib/site/games.ts').GAME_LISTINGS.map(g=>g.path)/* Nov 20 2026: the footer hubs list every book and game page */,
  '/tools':L('lib/site/tools/registry.ts').TOOL_PAGES.map(t=>t.path).filter(p=>p!=='/tools')/* Nov 22 2026: /tools links every tool page (a card or a sub-link, tests/tools-cards.cjs) */};
 for(const [hub,list] of Object.entries(kids))for(const p of list)set(p,(D.get(hub)??9)+1);
 const deep=[...D.entries()].filter(([,d])=>d>3);assert.equal(deep.length,0,`deeper than 3: ${deep.slice(0,5).join(' ')}`);
 const modelled=SP.filter(x=>D.has(x.path)).length;assert(modelled/SP.length>=.9/* Nov 20 2026: the 450 single card pages left the sitemap, so /books and /games children are modelled to keep the bar */,`the model covers ${modelled}/${SP.length} pages (the crawl checks the rest)`);}

const avg=a=>(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
console.log(`seo-links: ${col.COLLECTIONS.length} hubs, ${cmp.COMPARISONS.length} comparisons, ${rn.CHAINS.length} read-next chains (${rn.CHAINS.reduce((a,c)=>a+c.pages.length,0)} pages); reading links per card ${Math.min(...stats.card)}-${Math.max(...stats.card)} (avg ${avg(stats.card)}), per fish ${Math.min(...stats.fish)}-${Math.max(...stats.fish)}; ${new Set(SP.map(x=>x.lastmod)).size} distinct lastmod dates — ok`);
