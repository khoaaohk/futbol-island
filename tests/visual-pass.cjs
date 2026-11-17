// Visual pass, batch 1 (Nov 17 2026; owner: "pages read like a wall of text ... break each section up"). Renders the REAL page
// modules (tests/lib/tsLoad.cjs, no build) and checks the shared parts on the rule, term, position and tool templates, EN and ES:
//  1. Quick answer: the answer lead sits in a [data-quick-answer] card with a [data-key-facts] list of 3-4 facts, each with an
//     aria-hidden icon; the answer is still the first <p> after the h1; every #jump link in the facts has its target on the page.
//  2. FAQ: one list of native <details>/<summary> rows (the question an h3 inside the summary), the first open, the answer text in
//     the HTML; the FAQPage JSON-LD names the same questions in the same order; the cards page has ONE FAQ (side questions merged).
//  3. DataTable: the phone-card markup ([data-stack] on the wrap, data-label on every value cell); the CSS stacks it under 560 px.
//  4. Folded "more detail" sections: a real h2 inside the <summary>, the body in the HTML.
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
console.log(`visual-pass: ${n} checks OK`);
