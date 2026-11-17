// Visual pass, batch 1 (Nov 17 2026; owner: "pages read like a wall of text ... break each section up"). Renders the REAL page
// modules (tests/lib/tsLoad.cjs, no build) and checks the shared parts on the rule, term, position and tool templates, EN and ES:
//  1. Quick answer: the answer lead sits in a [data-quick-answer] card with a [data-key-facts] list of 3-4 facts, each with an
//     aria-hidden icon; the answer is still the first <p> after the h1; every #jump link in the facts has its target on the page.
//  2. FAQ: one list of native <details>/<summary> rows (the question an h3 inside the summary), the first open, the answer text in
//     the HTML; the FAQPage JSON-LD names the same questions in the same order; the cards page has ONE FAQ (side questions merged).
//  3. DataTable: the phone-card markup ([data-stack] on the wrap, data-label on every value cell); the CSS stacks it under 560 px.
//  4. Folded "more detail" sections: a real h2 inside the <summary>, the body in the HTML.
// Batch 3 (Nov 17 2026):
//  5. Keep reading: ONE [data-keep-reading] grid instead of stacked link lists; at most 8 cards before "Show N more", every card
//     with an aria-hidden icon; the old lesson / drill links are all still there.
//  6. Desktop two-column layout: detail pages render "On this page" ([data-toc]) right after the intro; the CSS turns that into
//     a reading column + sticky side column from 1100 px only.
//  7. Hubs: lesson hubs (futsal, quizzes) and the rules / positions hubs render chapter bands ([data-band]) with an h2, a count,
//     6 cards and "Show all N" (every lesson / rule link in the HTML); the rules hub's five lines are icon rows. EN and ES.
// usage: node tests/visual-pass.cjs
const assert=require('node:assert/strict');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
const routes=L('components/es/routes.tsx'),ep=L('lib/i18n/esPaths.ts');
const page=(file,slug)=>render(React.createElement(L(file).default,{params:{slug}}));
const es=enPath=>{const r=routes.esRoute(enPath);assert(r,`${enPath}: a Spanish route`);return render(r.render());};
const A='app/(site)/learn';
const SAMPLES=[
 ['rule',`${A}/soccer-rules/[slug]/page.tsx`,'yellow-and-red-cards','/learn/soccer-rules/yellow-and-red-cards'],
 ['rule',`${A}/soccer-rules/[slug]/page.tsx`,'futsal-rules','/learn/soccer-rules/futsal-rules'],
 ['term',`${A}/soccer-terms/[slug]/page.tsx`,'two-v-one','/learn/soccer-terms/two-v-one'],
 ['term',`${A}/soccer-terms/[slug]/page.tsx`,'hat-trick','/learn/soccer-terms/hat-trick'],
 ['position',`${A}/soccer-positions/[slug]/page.tsx`,'center-back','/learn/soccer-positions/center-back'],
 ['tool','app/(site)/tools/[slug]/page.tsx','soccer-playing-time-calculator','/tools/soccer-playing-time-calculator'],
 ['tool','app/(site)/tools/[slug]/page.tsx','11v11-lineup-builder','/tools/11v11-lineup-builder'],
];
const ids=h=>new Set([...h.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]));
function check(h,where,kind){
 // 1. quick answer + key facts
 const q=/<div class="quick" data-quick-answer="">([\s\S]*?)<\/dl><\/div>/.exec(h);ok(q,`${where}: quick-answer card`);
 ok(/<p class="lead"/.test(q[1]),`${where}: the lead is inside the quick-answer card`);
 if(kind!=='tool'||/data-answer=""/.test(q[1])){const after=h.slice(h.indexOf('</h1>')),p=after.match(/<p\b[^>]*>/);if(kind!=='tool')ok(p&&/data-answer/.test(p[0]),`${where}: the answer is still the first paragraph after the h1`);}
 const facts=[...q[1].matchAll(/<div class="fact">([\s\S]*?)<\/div>/g)].map(m=>m[1]);
 ok(facts.length>=3&&facts.length<=4,`${where}: 3-4 key facts (${facts.length})`);
 for(const f of facts){ok(/<dt><svg[^>]*aria-hidden="true"/.test(f),`${where}: each fact has an aria-hidden icon`);ok(/<dd>[\s\S]+<\/dd>/.test(f),`${where}: each fact has a value`);}
 const have=ids(h);for(const m of q[1].matchAll(/href="#([^"]+)"/g))ok(have.has(m[1]),`${where}: key-fact jump link #${m[1]} has its target`);
 // 2. one collapsible FAQ that matches the JSON-LD
 const lists=[...h.matchAll(/<div class="faqList" data-faq="([^"]+)">([\s\S]*?)<\/div><\/details><\/div>/g)];
 ok(lists.length===1,`${where}: exactly one FAQ list (${lists.length})`);
 const rows=[...lists[0][2].matchAll(/<details class="faqItem"([^>]*)><summary class="faqSum"><h3 class="faqQ">([^<]+)<\/h3>/g)];
 ok(rows.length>=3,`${where}: FAQ rows are <details> with the question in the summary`);
 ok(/\bopen=""/.test(rows[0][1])&&rows.slice(1).every(r=>!/\bopen=""/.test(r[1])),`${where}: the first question starts open, the rest closed`);
 const faq=ldOf(h).find(x=>x['@type']==='FAQPage');ok(faq,`${where}: FAQPage JSON-LD`);
 const shown=rows.map(r=>r[2].replace(/&#x27;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"'));
 ok(faq.mainEntity.every((x,i)=>shown[i]===x.name),`${where}: the FAQPage questions lead the list, same order`);
 for(const x of faq.mainEntity)ok(h.replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').includes(x.acceptedAnswer.text),`${where}: answer in the HTML: ${x.name}`);
 // 4. folded sections
 for(const m of h.matchAll(/<section class="section fold"[^>]*aria-labelledby="([^"]+)"[^>]*><details class="foldBox"><summary class="foldSum"><h2 class="h2" id="([^"]+)">/g))ok(m[1]===m[2],`${where}: folded section ${m[1]} keeps its h2`);
 if(!/futsal-rules/.test(where))ok(/<section class="section fold"/.test(h),`${where}: at least one "more detail" section is folded`);/* futsal: both tables are the page's search answers, kept open */
 // 5. one "Keep reading" grid
 keep(h,where);
 // 6. the desktop side column on guide detail pages (tools have their own screen layout)
 if(kind!=='tool')ok(/<\/header><nav class="toc"[^>]*data-toc=""/.test(h),`${where}: "On this page" follows the intro`);
}
function keep(h,where){
 const k=[...h.matchAll(/<section class="keep" aria-labelledby="([^"]+)" data-keep-reading="(\d+)">([\s\S]*?)<\/section>/g)];
 ok(k.length===1,`${where}: one Keep reading grid (${k.length})`);
 const body=k[0][3],cards=[...body.matchAll(/<li class="item"/g)].length,first=body.split('<details')[0];
 ok(cards===+k[0][2],`${where}: every link is a card (${cards})`);
 ok([...first.matchAll(/<li class="item"/g)].length<=8,`${where}: at most 8 cards before "Show N more"`);
 ok((cards>8)===body.includes('<details class="more">'),`${where}: the rest under one disclosure`);
 ok([...body.matchAll(/<span class="ico"><svg[^>]*aria-hidden="true"/g)].length===cards,`${where}: each card has an aria-hidden icon`);
 ok(!/<ul class="list">/.test(h.slice(h.indexOf('data-faq='))),`${where}: no stacked link lists after the FAQ`);
}
for(const [kind,file,slug,enPath] of SAMPLES){
 check(page(file,slug),enPath,kind);
 check(es(enPath),ep.toEs(enPath),kind);
}
// the cards page: one FAQ holds the side questions too, and they are not in the FAQPage
{const h=page(`${A}/soccer-rules/[slug]/page.tsx`,'yellow-and-red-cards'),c=L('lib/site/cardRules.ts').CARD_RULES;
 ok(!h.includes(`aria-labelledby="${c.side.id}"`),'cards page: no second FAQ section');
 for(const s of c.side.items)ok(h.includes(`<h3 class="faqQ">${s.q.replace(/'/g,'&#x27;')}</h3>`),`cards page: side question in the FAQ list: ${s.q}`);}
// 3. DataTable and the playing-time plan: phone-card markup, CSS under 560 px, print and desktop keep the table
{const G=L('lib/site/GuideParts.tsx'),h=render(React.createElement(G.DataTable,{label:'T',head:['Game','Yellow','Red'],rows:[['A','b','c']]}));
 ok(/class="tableWrap"[^>]*data-stack=""/.test(h),'DataTable: data-stack on the wrap');
 ok(/<th scope="row">A<\/th><td data-label="Yellow">b<\/td><td data-label="Red">c<\/td>/.test(h),'DataTable: each value cell carries its column name');
 const css=read('app/(site)/site.module.css');
 ok(/@media screen and \(max-width:559px\)\{[\s\S]*?\.tableWrap\[data-stack\] tr\{display:grid/.test(css),'site CSS: rows become cards under 560 px, screen only');
 ok(/\.tableWrap\[data-stack\] \.table td::before\{content:attr\(data-label\)/.test(css),'site CSS: the column name shows over each value');
 const rp=read('components/site/tools/RotationPlanner.tsx');
 ok(/aria-label=\{es\?W\.region:'Rotation table'\} data-stack=""/.test(rp)&&(rp.match(/data-label=\{es\?/g)||[]).length===3,'playing-time plan: phone-card markup');
 for(const c of ['.quick','.facts','.fact','.faqList','.faqItem','.faqSum','.foldSum','.notesH','.plus'])ok(new RegExp(`(^|\\n|\\})${c.replace('.','\\.')}\\{`).test(css),`${c} styled`);
 ok(/prefers-reduced-motion:reduce\)\{\.faqBody,\.plus\{transition:none\}/.test(css),'FAQ motion respects reduced motion');}
// 5. the old lesson and drill links are all in the grid (rule, term, position)
{const R=L('lib/site/rules.ts').RULES.find(r=>r.slug==='yellow-and-red-cards'),h=page(`${A}/soccer-rules/[slug]/page.tsx`,R.slug),dl=L('lib/site/drills.ts');
 for(const l of R.lessons)ok(h.includes(`href="/learn/lessons/${l.id}"`),`rule page: lesson ${l.id} still linked`);
 for(const d of dl.drillLinksFor(R.path))ok(h.includes(`href="${d.path}"`),`rule page: drill ${d.path} still linked`);
 const css=read('components/site/keep.module.css');ok(/\.tag::before\{content:attr\(data-tag\)\}/.test(css),'keep CSS: the group word is drawn from data-tag');}
// 6. desktop layout CSS: two columns from 1100 px, side column sticky, Keep reading spans both
{const css=read('app/(site)/site.module.css'),k=read('components/site/keep.module.css');
 ok(/@media screen and \(min-width:1100px\)\{\n \.main:has\(>\[data-toc\]\)\{[^}]*grid-template-columns:minmax\(0,var\(--col\)\) var\(--side\)/.test(css),'site CSS: .main:has([data-toc]) is two columns from 1100 px');
 ok(/\[data-keep-reading\]\{grid-column:1\/-1\}/.test(css),'site CSS: Keep reading spans both columns');
 ok(/@media\(min-width:1100px\)\{\n \.toc\{display:grid;[^}]*position:sticky/.test(k)&&/^\.toc\{display:none\}/m.test(k),'keep CSS: the side column shows from 1100 px only, sticky');}
// 7. hubs as chapter bands, EN and ES
const bands=(h,where,min)=>{const b=[...h.matchAll(/<section class="band" data-tone="(tint|paper)" aria-labelledby="([^"]+)" data-band="">([\s\S]*?)<\/section>/g)];
 ok(b.length>=min,`${where}: ${min}+ chapter bands (${b.length})`);
 for(const [,,id,x] of b){ok(new RegExp(`<h2 class="h2" id="${id}">`).test(x),`${where}: band ${id} has its h2`);
  const shown=[...x.split('<details')[0].matchAll(/<li class="item"/g)].length,all=[...x.matchAll(/<li class="item"/g)].length;
  ok(shown<=Math.max(6,all===shown?all:6),`${where}: band ${id} shows at most 6 (${shown})`);
  ok((all>shown)===/<details class="more"><summary class="moreSum"><span>(Show all|Ver las) \d+<\/span>/.test(x),`${where}: band ${id}: "Show all N" only when there are more`);}
 return b;};
for(const slug of ['futsal-for-kids','soccer-quiz-for-kids','passing-and-support']){
 const hub=L('lib/site/hubs.ts').hubBySlug(slug),en=page(`${A}/${slug}/page.tsx`),esH=es(hub.path);
 for(const [h,where] of [[en,hub.path],[esH,ep.toEs(hub.path)]]){
  const b=bands(h,where,hub.groups.length);ok(b.length===hub.groups.length,`${where}: one band per lesson group`);
  for(const x of b)ok(/<p class="count">\d+ /.test(x[3]),`${where}: band count`);
  for(const l of hub.groups.flatMap(g=>g.lessons))ok(h.includes(`/learn/lessons/${l.id}`),`${where}: lesson ${l.id} linked`);
  keep(h,where);}}
{const RH=L('lib/site/rules.ts').RULES_HUB,PH=L('lib/site/positions.ts');
 for(const [h,where] of [[page(`${A}/soccer-rules/page.tsx`),'/learn/soccer-rules'],[es('/learn/soccer-rules'),'/es/learn/soccer-rules']]){
  bands(h,where,RH.groups.length);ok(/<ul class="rows" data-icon-rows="">(<li>[\s\S]*?<\/li>){5}<\/ul>/.test(h),`${where}: the five lines as icon rows`);
  ok(h.indexOf('id="picture"')<h.indexOf('id="basics"'),`${where}: the diagram comes before the five lines`);
  for(const r of RH.groups.flatMap(g=>g.rules))ok(h.includes(`/learn/soccer-rules/${r.slug}"`),`${where}: rule ${r.slug} linked`);
  keep(h,where);}
 for(const [h,where] of [[page(`${A}/soccer-positions/page.tsx`),'/learn/soccer-positions'],[es('/learn/soccer-positions'),'/es/learn/soccer-positions']]){
  bands(h,where,1);for(const p of PH.POSITIONS)ok(h.includes(`/learn/soccer-positions/${p.slug}"`),`${where}: position ${p.slug} linked`);keep(h,where);}}
console.log(`visual-pass: ${n} checks OK`);
