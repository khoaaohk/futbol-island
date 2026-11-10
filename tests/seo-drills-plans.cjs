// Guide cluster 3 (SEO, Nov 10 2026): soccer drills, their age and skill guides, and practice plans (lib/site/drills.ts,
// drillGuides.ts, plans.ts; registered in lib/site/guides.ts COACH_PAGES). Same method as tests/seo-rules-terms-sizes.cjs: no
// build, the REAL page modules are transpiled and rendered to static HTML here, then checked.
//  1. Every page is in the sitemap with a unique title (30-60) and description (120-155), its canonical and a picture that exists.
//  2. Rendered HTML: one h1 that says soccer, "soccer" in the first sentences and "football" near the top, JSON-LD that parses
//     (BreadcrumbList, FAQPage 3-5 that matches the page, Article / CollectionPage), no script but JSON-LD, tables with header
//     cells, a setup diagram with <title> and <desc>, one button, every internal link resolves, no external links, no paragraph
//     repeated across pages, and NO link from the home page (owner, Nov 10).
//  3. Content shape and safety: every drill has ages, space, equipment, steps, cues and a lesson link; no heading drill; no
//     goalkeeper drill before U10; every "out" has a way back; age guides only list drills tagged for that age; plan clock
//     tables add up to the stated length, run play-practice-play and have water breaks; plans carry the print rules.
//  4. Pictures render as PNG; llms.txt and llms-full.txt list the pages; lessons and existing guides link in.
//  5. LAST: the old /learn/<id> redirect (next.config.mjs) must leave the two single-segment hubs alone.
// usage: node tests/seo-drills-plans.cjs
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
const guides=L('lib/site/guides.ts'),drills=L('lib/site/drills.ts'),dg=L('lib/site/drillGuides.ts'),plans=L('lib/site/plans.ts'),paths=L('lib/site/paths.ts'),lessons=L('lib/site/lessons.ts');
const PATHS=new Set(paths.sitePaths().map(p=>p.path)),A='app/(site)/learn',PAGES=guides.COACH_PAGES;
const DH='/learn/soccer-drills',PH='/learn/soccer-practice-plans',SINGLE=[DH,PH];

// ---- 1. registry, sitemap, metadata -------------------------------------------------------------------------------------------
assert(drills.DRILLS.length>=40&&drills.DRILLS.length<=50,`40-50 drills (${drills.DRILLS.length})`);
assert.deepEqual(dg.DRILL_GUIDES.map(g=>g.slug),['u6','u8','u10','u12','at-home','passing','dribbling','shooting','first-touch','goalkeeper'],'four age guides and six skill guides');
assert.equal(plans.PLANS.length,12,'twelve plans');
for(const a of drills.AGES){const ps=plans.plansForAge(a);assert.equal(ps.length,3,`${a}: three plans`);assert(ps.some(p=>/first-practice$/.test(p.slug)),`${a}: a first practice of the season`);assert(drills.drillsForAge(a).length>=12,`${a}: enough drills`);}
for(const s of drills.SKILLS)assert(drills.drillsBySkill(s.id).length>=2,`skill ${s.id} has drills`);
for(const n of ['sharks-and-minnows','red-light-green-light','pirates-and-treasure','knockout','rondo-3v1','rondo-4v2','gates-dribbling','wall-passing','one-v-one-to-end-zones','numbers-game','world-cup-shooting-game','two-v-one-to-goal','three-team-keep-away',
 'cone-weave-dribbling','toe-taps-and-foundations','turn-and-go','receive-across-the-body','give-and-go','crossing-and-finishing','goalkeeper-footwork-and-set','goalkeeper-catching-w-and-basket'])assert(drills.drillBySlug(n),`the classic ${n} has a page`);
assert.equal(PAGES.length,2+dg.DRILL_GUIDES.length+drills.DRILLS.length+plans.PLANS.length,'two hubs, the guides, the drills, the plans');
assert.equal(new Set(guides.ALL_GUIDE_PAGES.map(g=>g.path)).size,guides.ALL_GUIDE_PAGES.length,'unique paths across all clusters');
for(const p of SINGLE)assert(guides.GUIDE_HUBS.some(g=>g.path===p),`${p} is hub-level`);
assert.deepEqual(PAGES.filter(g=>g.hub).map(g=>g.path),SINGLE,'only the two hubs are hub-level (llms.txt, More to learn)');
const PAGE_FILES=[`${A}/soccer-drills/page.tsx`,`${A}/soccer-drills/[slug]/page.tsx`,`${A}/soccer-practice-plans/page.tsx`,`${A}/soccer-practice-plans/[slug]/page.tsx`];
const DATA_FILES=['lib/site/drills.ts','lib/site/drillsA.ts','lib/site/drillsB.ts','lib/site/drillsC.ts','lib/site/drillsD.ts','lib/site/drillGuides.ts','lib/site/plans.ts','lib/site/drillLinks.ts'];
for(const f of PAGE_FILES){const s=read(f);
 assert.match(s,/export const dynamic='force-static';/,`${f} is force-static`);
 if(/\[[a-z]+\]/.test(f)){assert.match(s,/export const dynamicParams=false;/,`${f}: unknown ids 404`);assert.match(s,/generateStaticParams/,`${f} prerenders every id`);}}
for(const f of [...PAGE_FILES,...DATA_FILES,'lib/site/grid.ts','lib/site/GridDiagram.tsx','lib/site/gridImage.tsx','lib/site/DrillParts.tsx']){
 const s=read(f);assert(!/['"]use client['"]/.test(s),`${f} is a server module`);assert(!/useEffect|useState|requestAnimationFrame|<canvas|<animate|@keyframes|onClick/.test(s),`${f}: no client code or animation (phone heat)`);}
for(const f of DATA_FILES)assert(/SOURCES \(.*checked Nov 10 2026/i.test(read(f)),`${f}: source list with the date checked`);
for(const f of ['lib/site/drills.ts','lib/site/plans.ts'])assert(/play-practice-play_model\.pdf/.test(read(f))&&/How%20to%20Write%20a%20Training%20Session%20Plan\.pdf/.test(read(f)),`${f}: cites the U.S. Soccer and US Youth Soccer documents`);
const route=p=>{
 let m=/^\/learn\/soccer-drills\/(.+)$/.exec(p);if(m)return [`${A}/soccer-drills/[slug]/page.tsx`,{slug:m[1]}];
 m=/^\/learn\/soccer-practice-plans\/(.+)$/.exec(p);if(m)return [`${A}/soccer-practice-plans/[slug]/page.tsx`,{slug:m[1]}];
 return [`${A}${p.replace(/^\/learn/,'')}/page.tsx`,undefined];};
const earlier=[...guides.GUIDE_PAGES,...guides.REFERENCE_PAGES],titles=new Map(earlier.map(g=>[g.title,g.path])),descs=new Map(earlier.map(g=>[g.description,g.path])),html=new Map();
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
 assert(/soccer/i.test(g.title),`${g.path}: the title says soccer`);
 const og=meta.openGraph.images[0].url;assert.equal(og,g.image,`${g.path}: og:image is its picture`);
 assert(guides.COACH_FILES.includes(og.replace(guides.DIAGRAM_DIR+'/','')),`${g.path}: ${og} is a prerendered picture`);
 html.set(g.path,renderToStaticMarkup(React.createElement(mod.default,{params})));
}
const sp=paths.sitePaths();for(const g of PAGES)assert.equal(sp.find(x=>x.path===g.path).lastmod,L('lib/site/updated.ts').SITE_UPDATED.guides,`${g.path}: lastmod`);

// ---- 2. rendered HTML ---------------------------------------------------------------------------------------------------------
const text=h=>h.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<(title|desc)[\s\S]*?<\/\1>/g,' ').replace(/<[^>]+>/g,' ').replace(/&#x27;|&#39;/g,'’').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const SERVED=new Set(['/play','/privacy',...[...guides.DIAGRAM_FILES,...guides.REFERENCE_FILES,...guides.COACH_FILES].map(f=>`${guides.DIAGRAM_DIR}/${f}`)]);
const paraPages=new Map();let words=0,tables=0,diagrams=0;
const kind=p=>SINGLE.includes(p)?'hub':p.startsWith(PH+'/')?'plan':drills.drillBySlug(p.slice(DH.length+1))?'drill':'guide';
const MIN={hub:500,guide:450,drill:420,plan:400};
for(const g of PAGES){
 const h=html.get(g.path),where=g.path,k=kind(g.path);
 const h1=h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g)||[];assert.equal(h1.length,1,`${where}: one h1`);
 assert(/soccer/i.test(text(h1[0])),`${where}: the h1 says soccer`);
 const body=text(h);
 assert(/soccer/i.test(body.slice(0,500)),`${where}: "soccer" in the first sentences`);
 assert(/football/i.test(body.slice(0,1400)),`${where}: "football" once near the top`);
 const n=body.split(' ').length;words+=n;assert(n>=MIN[k],`${where}: real substance (${n} words, at least ${MIN[k]})`);
 const scripts=h.match(/<script[^>]*>[\s\S]*?<\/script>/g)||[];
 const ld=scripts.map(s=>{assert(/type="application\/ld\+json"/.test(s),`${where}: no script except JSON-LD`);return JSON.parse(s.replace(/^<script[^>]*>|<\/script>$/g,''));});
 const types=ld.map(x=>x['@type']);
 assert(types.includes('BreadcrumbList')&&types.includes('FAQPage'),`${where}: BreadcrumbList and FAQPage`);
 assert(types.includes(k==='hub'?'CollectionPage':'Article'),`${where}: its own JSON-LD type (${types})`);
 const crumbs=ld.find(x=>x['@type']==='BreadcrumbList').itemListElement;
 assert.equal(crumbs[crumbs.length-1].item,'https://futbolisland.app'+g.path,`${where}: last crumb is the page`);
 for(const c of crumbs)assert(PATHS.has(c.item.replace('https://futbolisland.app','')||'/'),`${where}: crumb ${c.item} exists`);
 const faq=ld.find(x=>x['@type']==='FAQPage').mainEntity;assert(faq.length>=3&&faq.length<=5,`${where}: 3-5 questions (${faq.length})`);
 for(const q of faq){assert(body.includes(q.name.replace(/'/g,'’')),`${where}: FAQ question is visible: ${q.name}`);assert(q.acceptedAnswer.text.length>=20,`${where}: answer to ${q.name}`);}
 for(const t of h.match(/<table[\s\S]*?<\/table>/g)||[]){tables++;assert(/<thead><tr>(<th scope="col">[^<]+<\/th>)+<\/tr><\/thead>/.test(t),`${where}: table column headers`);
  const rows=t.match(/<tr>[\s\S]*?<\/tr>/g).slice(1);assert(rows.length>=1&&rows.every(r=>/^<tr><th scope="row">/.test(r)),`${where}: each row starts with a header cell`);}
 const svgs=h.match(/<svg[\s\S]*?<\/svg>/g)||[];diagrams+=svgs.length;
 assert(svgs.length>=1,`${where}: a setup diagram`);
 for(const s of svgs){assert(/<title[^>]*>[^<]+<\/title><desc[^>]*>[^<]{40,}<\/desc>/.test(s),`${where}: diagram title and description`);assert(/role="img"/.test(s)&&/data-diagram="grid"/.test(s)&&/data-grid="\d+x\d+"/.test(s)&&/data-size=""[^>]*>\d+ x \d+ yd \(\d+ x \d+ m\)</.test(s),`${where}: a grid with its size in yards and metres`);
  assert(/data-player=/.test(s)&&(s.match(/data-cone=/g)||[]).length>=4,`${where}: players and corner cones`);}
 assert.equal(new Set((h.match(/ id="[^"]+"/g)||[])).size,(h.match(/ id="[^"]+"/g)||[]).length,`${where}: unique ids`);
 assert.equal((h.match(/class="cta"/g)||[]).length,1,`${where}: one button`);
 const links=[...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);assert(links.length>=10,`${where}: links`);
 const ids=new Set([...h.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]));
 for(const l of links){
  if(l.startsWith('#')){assert(ids.has(l.slice(1)),`${where}: anchor ${l} exists`);continue;}
  assert(l.startsWith('/'),`${where}: no external link (${l})`);
  const [p,hash]=l.split('#');assert(PATHS.has(p)||SERVED.has(p),`${where}: link target ${l} exists`);
  if(hash)assert(html.get(p)&&html.get(p).includes(` id="${hash}"`),`${where}: anchor ${l} exists on the target page`);}
 assert(links.some(l=>l.startsWith('/learn/lessons/')),`${where}: links to lessons`);
 assert(links.some(l=>l!==g.path&&PAGES.some(x=>x.path===l)),`${where}: links to another page of the cluster`);
 assert(links.some(l=>earlier.some(x=>x.path===l)),`${where}: links to a rule, position, term, formation or size guide`);
 for(const m of h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)){const t=text(m[1]);if(t.length>=90){if(!paraPages.has(t))paraPages.set(t,new Set());paraPages.get(t).add(g.path);}}
}
const SHARED=new Set([guides.GUIDE_FOOT,guides.GUIDE_NAMES,drills.DRILL_SAFETY_LINE,plans.PPP_LINE,dg.DRILL_GUIDES[0].facts.note,plans.PLAN_SAFETY_LINE,'Times are minutes from the start of practice. Tap an activity for its setup diagram and coaching points.'].map(s=>s.replace(/'/g,'’')));
for(const [t,set] of paraPages)if(!SHARED.has(t)&&![...SHARED].some(s=>t.endsWith(s)))assert(set.size<=2,`a paragraph repeats on ${set.size} pages (${[...set].slice(0,3).join(', ')}): ${t.slice(0,80)}`);
// hubs reach every page; the home page links none of them (owner, Nov 10 2026: SEO-only pages)
for(const d of drills.DRILLS)assert(html.get(DH).includes(`href="${d.path}"`),`drills hub links ${d.path}`);
for(const g of dg.DRILL_GUIDES)assert(html.get(DH).includes(`href="${g.path}"`),`drills hub links ${g.path}`);
for(const s of drills.SKILLS)assert(html.get(DH).includes(`href="#${s.id}"`)&&html.get(DH).includes(` id="${s.id}"`),`drills hub has the anchor section ${s.id}`);
for(const p of plans.PLANS)assert(html.get(PH).includes(`href="${p.path}"`),`plans hub links ${p.path}`);
{const home=read('app/(site)/page.tsx');assert(!/COACH_PAGES|GUIDE_HUBS\.map|soccer-drills|soccer-practice-plans/.test(home),'the home page does not link the drill or plan pages');
 for(const f of fs.readdirSync(path.join(root,'components/learn')).filter(f=>/\.tsx?$/.test(f)))assert(!/soccer-drills|soccer-practice-plans/.test(read(`components/learn/${f}`)),`components/learn/${f} does not link the drill or plan pages`);}

// ---- 3. content shape and safety ------------------------------------------------------------------------------------------------
const two=s=>(s.match(/[^.!?]+[.!?]+(?=\s|$)/g)||[]).length;
for(const d of drills.DRILLS){const where=d.path,h=html.get(d.path),b=text(h);
 assert(d.ages.length>=1&&d.ages.every(a=>drills.AGES.includes(a)),`${where}: ages`);
 assert(/^\d+ x \d+ yd \(\d+ x \d+ m\)/.test(d.space),`${where}: space in yards and metres (${d.space})`);
 assert(d.equipment.length>=10&&d.players.length>=1&&/minute/.test(d.time),`${where}: equipment, players and time`);
 for(const label of ['Ages','Players','Space','Equipment','Time'])assert(new RegExp(`<th scope="row">${label}</th>`).test(h),`${where}: facts box row ${label}`);
 assert.equal(two(d.answer),2,`${where}: a two-sentence answer`);assert(b.includes(d.answer.replace(/'/g,'’')),`${where}: the answer is on the page`);
 assert(d.steps.length>=4&&d.cues.length>=3&&d.cues.length<=4&&d.mistakes.length>=3&&d.easier.length>30&&d.harder.length>30&&d.game.length>120,`${where}: steps, cues, versions, mistakes, game moment`);
 assert(/<ol>(<li>[\s\S]*?<\/li>){4,}<\/ol>/.test(h),`${where}: numbered steps`);
 for(const c of d.cues)assert(c.length<=60,`${where}: a cue is short enough to say out loud: ${c}`);
 assert(d.lessons.length>=2&&d.lessons.every(l=>lessons.lessonById(l.id)),`${where}: lessons from the catalog`);
 assert(new RegExp(`class="cta" href="/learn/lessons/${d.cta.id}"`).test(h),`${where}: the button opens its lesson`);
 assert(/Why it matters in a game/.test(h)&&h.includes(`The lesson that teaches it: <a href="/learn/lessons/${d.cta.id}"`),`${where}: the game moment links the lesson that teaches it`);
 assert(d.related.length>=3&&d.related.every(r=>h.includes(`href="${DH}/${r}"`)),`${where}: related drills are linked`);
 if(d.home)assert(/Do it at home/.test(h),`${where}: at-home section`);
 const n=b.split(' ').length;assert(n<=1250,`${where}: no filler (${n} words)`);
 // safety: no heading, no goalkeeper before U10, nobody sits out, no laps
 const own=[d.answer,...d.steps,...d.cues,d.easier,d.harder,d.game,d.home||''].join(' ');
 assert(!d.heading&&!/\bhead (it|the ball)\b|\bheaders?\b/i.test(own),`${where}: no heading in a drill (U.S. Soccer: none at 10 and under)`);
 if(d.skill==='goalkeeper'){assert(!d.ages.includes('U6')&&!d.ages.includes('U8'),`${where}: goalkeeper drills start at U10`);assert(/underarm|roll|soft|gentl/i.test(own),`${where}: soft service`);}
 assert(!/\blaps?\b/i.test(own)&&!/push-?ups|punish/i.test(own),`${where}: no laps or punishment`);
 if(/knocked out|eliminat|sits? out|leaves the square|loses the ball fetches/i.test(d.steps.join(' ')))assert(/back in|rejoin|comes? straight|carr(y|ies) on|keep(s)? (playing|counting)|joins the sharks/i.test(d.steps.join(' ')),`${where}: an "out" has a way back in`);
}
assert(drills.DRILLS.filter(d=>d.home).length>=10,'at least ten drills have an at-home version');
for(const g of dg.DRILL_GUIDES){const h=html.get(g.path);
 assert(g.picks.length>=8&&g.picks.length<=10,`${g.path}: 8-10 drills`);
 for(const p of g.picks){assert(h.includes(`href="${p.drill.path}"`),`${g.path}: links ${p.drill.slug}`);if(g.age)assert(p.drill.ages.includes(g.age),`${g.path}: ${p.drill.slug} is tagged ${g.age}`);}
 if(g.kind==='age'){assert(/laps/i.test(text(h))&&/lines/i.test(text(h))&&/lectures/i.test(text(h)),`${g.path}: what to avoid (laps, lines, lectures)`);assert(g.facts&&/can and cannot do yet/.test(h)&&/Attention span and group sizes/.test(h),`${g.path}: age guide sections`);
  for(const p of plans.plansForAge(g.age))assert(h.includes(`href="${p.path}"`),`${g.path}: links its plan ${p.slug}`);
  if(g.age!=='U12')assert(g.picks.every(p=>p.drill.skill!=='goalkeeper')||g.age==='U10',`${g.path}: no goalkeeper drills before U10`);}}
{const home=dg.drillGuideBySlug('at-home');for(const p of home.picks)assert(p.drill.home,`at-home guide: ${p.drill.slug} has an at-home version`);}
const sizes=L('lib/site/sizes.ts'),fieldRows=sizes.chartBySlug('soccer-field-size-by-age').tables[0].rows;
for(const p of plans.PLANS){const where=p.path,h=html.get(p.path);
 assert.equal(p.rows.reduce((a,r)=>a+r.minutes,0),p.minutes,`${where}: the clock table adds up to ${p.minutes} minutes`);
 assert.equal(p.rows[p.rows.length-1].end,p.minutes);assert.equal(p.minutes,plans.PRACTICE_MINUTES[p.age],`${where}: the length for ${p.age}`);
 assert(p.title.includes(String(p.minutes))||text(h).includes(`${p.minutes} minutes`),`${where}: states its length`);
 const st=p.rows.filter(r=>r.stage==='Play'||r.stage==='Practice').map(r=>r.stage);assert(st[0]==='Play'&&st[st.length-1]==='Play'&&st.includes('Practice'),`${where}: play, practice, play`);
 assert(p.rows.filter(r=>r.stage==='Break'&&/water/i.test(r.activity)).length>=2,`${where}: water breaks`);
 assert(p.rows.filter(r=>r.drill).length>=3,`${where}: activities link to drill pages`);
 for(const r of p.rows){if(r.drill){assert(r.drill.ages.includes(p.age),`${where}: ${r.drill.slug} suits ${p.age}`);assert(h.includes(`<a href="${r.drill.path}">`),`${where}: the clock table links ${r.drill.slug}`);}
  assert(text(h).includes(`${plans.clock(r.start)} to ${plans.clock(r.end)}`),`${where}: clock row ${r.start}`);}
 assert((h.match(/<tr>/g)||[]).length>=p.rows.length+1,`${where}: a row per activity`);
 assert(p.equipment.length>=5&&p.notes.length>=3&&p.swap.sign&&p.swap.instead.length>40&&/If it is going badly/.test(h),`${where}: equipment, notes and a swap`);
 assert(/class="printPage"/.test(h)&&/class="noPrint"/.test(h)&&h.indexOf('class="noPrint"')>h.indexOf('If it is going badly'),`${where}: the plan part prints, the rest does not`);
 assert(!/\blaps?\b/i.test(p.rows.map(r=>r.activity+' '+r.purpose).join(' ')),`${where}: no laps`);
 assert(text(h).includes(plans.PPP_LINE.replace(/'/g,'’')),`${where}: says how it is built`);
 // the final game's format and field come from lib/site/sizes.ts (U.S. Soccer small-sided standards)
 const row=fieldRows.find(r=>r[0].includes(p.age));assert(row&&p.field.includes(row[1]),`${where}: the final game is ${row&&row[1]} as in lib/site/sizes.ts`);
 if(p.age==='U6'||p.age==='U8')assert(/no goalkeepers/.test(p.field),`${where}: no goalkeepers at ${p.age}`);else assert(p.field.includes(row[3].replace(' yd',' yards')),`${where}: field length from lib/site/sizes.ts`);
}
{const css=read('app/(site)/site.module.css');assert(/@media print\{[\s\S]*\.noPrint\{display:none!important\}[\s\S]*\.printPage \.table/.test(css),'print rules for the plan pages');assert(/\.printPage,\.noPrint\{display:contents\}/.test(css),'the print wrappers change nothing on screen');}
{const t=text(html.get(PH));for(const [a,len] of [['U6','45 minutes'],['U8','45 to 60 minutes'],['U10','60 to 75 minutes'],['U12','75 minutes']])assert(t.includes(`${a} ${len}`),`plans hub: ${a} practice length`);assert(/Play-Practice-Play/.test(t)&&/U\.S\. Soccer/.test(t));}
// diagram features: every kind of mark is drawn somewhere, and the three arrows differ
{const all=[...html.values()].join('');for(const m of ['data-cone','data-goal','data-zone','data-ball','data-pass','data-run','data-dribble'])assert(all.includes(m+'=""'),`a diagram draws ${m}`);
 const s=html.get(`${DH}/give-and-go`);assert(/data-pass=""[^>]*stroke="#ffffff"/.test(s)&&/data-run=""[^>]*stroke-dasharray/.test(s),'pass arrows are solid, run arrows dashed');
 assert(/data-dribble="" d="M[^"]+" fill="none" stroke="#e9c16b"/.test(html.get(`${DH}/sharks-and-minnows`)),'dribble arrows are wavy gold paths');
 const grid=L('lib/site/grid.ts');assert.throws(()=>grid.grid({w:10,l:10,title:'t',caption:'no full stop'}));assert.throws(()=>grid.grid({w:10,l:10,title:'t',caption:'Ok.',who:'A@300,2'}));assert.equal(grid.gridSize({w:20,l:30}),'20 x 30 yd (18 x 27 m)');}

// ---- 4. pictures, llms, links in from lessons and existing guides ----------------------------------------------------------------
(async()=>{
 const img=L('lib/site/gridImage.tsx'),{ImageResponse}=require('next/og'),pitch=L('lib/site/pitchImage.tsx');
 for(const f of guides.COACH_FILES)assert(img.drillDiagramFor(f),`${f} has a picture`);
 assert.equal(img.drillDiagramFor('nope-drill.png'),null);assert.equal(pitch.diagramFor('sharks-and-minnows-drill.png'),null,'the route falls through to the drill picture');
 assert(/diagramFor\(params\.file\)\?\?drillDiagramFor\(params\.file\)/.test(read(`${A}/diagrams/[file]/route.tsx`))&&/COACH_FILES/.test(read(`${A}/diagrams/[file]/route.tsx`)),'the diagrams route serves the drill pictures');
 for(const f of ['sharks-and-minnows-drill.png','rondo-4v2-drill.png','build-out-game-drill.png']){
  const b=Buffer.from(await new ImageResponse(img.drillDiagramFor(f),pitch.IMAGE_SIZE).arrayBuffer());
  assert(b.length>5000&&b.subarray(1,4).toString()==='PNG',`${f} renders as a PNG`);}
 const llms=L('lib/site/llms.ts').llmsText();
 for(const g of PAGES.filter(x=>x.hub)){assert(llms.includes(`(https://futbolisland.app${g.path})`),`llms.txt lists ${g.path}`);assert(g.blurb,`${g.path} has a blurb`);}
 const full=await L('app/llms-full.txt/route.ts').GET().text();
 for(const g of PAGES)assert(full.includes(`https://futbolisland.app${g.path}`),`llms-full.txt lists ${g.path}`);
 const more=renderToStaticMarkup(React.createElement(L('components/site/LessonHub.tsx').MoreToLearn,{}));
 for(const p of SINGLE)assert(more.includes(`href="${p}"`),`"More to learn" links ${p}`);
 const lessonPage=L(`${A}/lessons/[slug]/page.tsx`).default;
 const lh=renderToStaticMarkup(React.createElement(lessonPage,{params:{slug:'learn7_carry'}}));
 assert(/href="\/learn\/soccer-drills\/[a-z0-9-]+"/.test(lh),'a lesson links to a drill that trains it ("Related guides")');
 for(const l of lessons.LESSONS)assert(guides.guidesForLesson(l.id).length<=4,`${l.id}: at most four related guides`);
 assert(lessons.LESSONS.filter(l=>guides.guidesForLesson(l.id).some(g=>g.path.startsWith(DH+'/'))).length>=30,'many lessons link to a drill');
 // existing guides link to the drills (positions, rules, glossary)
 const render=(file,slug)=>renderToStaticMarkup(React.createElement(L(file).default,{params:{slug}}));
 assert(render(`${A}/soccer-rules/[slug]/page.tsx`,'throw-in').includes(`href="${DH}/throw-in-game"`),'the throw-in rule links the throw-in drill');
 assert(render(`${A}/soccer-rules/[slug]/page.tsx`,'heading-rules-for-kids').includes(`href="${DH}/thigh-and-chest-control"`),'the heading rule links the no-heading control drill');
 assert(render(`${A}/soccer-terms/[slug]/page.tsx`,'give-and-go').includes(`href="${DH}/give-and-go"`),'the give-and-go term links the drill');
 assert(render(`${A}/soccer-terms/[slug]/page.tsx`,'first-touch').includes(`href="${DH}/receive-across-the-body"`),'the first touch term links a drill');
 assert(render(`${A}/soccer-positions/[slug]/page.tsx`,'goalkeeper').includes(`href="${DH}/goalkeeper-catching-w-and-basket"`),'the goalkeeper position links goalkeeper drills');
 assert(render(`${A}/soccer-positions/[slug]/page.tsx`,'winger').includes(`href="${DH}/one-v-one-to-end-zones"`),'the winger position links 1v1 drills');
 for(const [p,list] of Object.entries(L('lib/site/drillLinks.ts').GUIDE_DRILLS)){assert(PATHS.has(p),`GUIDE_DRILLS: ${p} is a page`);for(const s of list)assert(drills.drillBySlug(s),`GUIDE_DRILLS: ${s} is a drill`);}
 console.log(`seo-drills-plans: ${PAGES.length} pages rendered and checked (${drills.DRILLS.length} drills, ${dg.DRILL_GUIDES.length} guides, ${plans.PLANS.length} plans, ${words} words, ${tables} tables, ${diagrams} diagrams, ${guides.COACH_FILES.length} pictures)`);

 // ---- 5. the old-lesson redirect leaves the two hubs alone (next.config.mjs; the coordinator edits that file) -------------------
 const red=read('next.config.mjs').match(/source: '\/learn\/:slug\((.*)\)', destination/);assert(red,'lesson redirect');const re=new RegExp('^/learn/(?:'+red[1]+')$');
 const caught=SINGLE.filter(p=>re.test(p));
 assert.deepEqual(caught,[],'next.config.mjs still redirects these pages to /learn/lessons/<slug>: add soccer-drills and soccer-practice-plans to the exclusion list of the /learn/:slug redirect');
 console.log('seo-drills-plans: ok');
})().catch(e=>{console.error(e.message||e);process.exit(1);});
