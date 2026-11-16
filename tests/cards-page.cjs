// The yellow and red cards page (Nov 16 2026; lib/site/cardRules.ts, components/site/CardDeck.tsx, RefCallGame.tsx):
//  1. Content: exactly 7 yellow and 7 red offences, each with a name, icon, explanation, example and "what happens next";
//     ids unique; Spanish (lib/i18n/es/cardRules.ts) has the same ids, colours, icons, order and 1:1 lists.
//  2. Server HTML (English and Spanish page): every offence's name, explanation, example and next line is in the markup (the
//     deck enhances a real list), the yellow vs red comparison is a real <table>, title <= 60, description <= 155, lead 40-60
//     words, FAQPage JSON-LD is valid and equals the questions shown, links to fouls / penalty kick / handball.
//  3. Deck: carousel region with a label, a polite live region and keyboard arrows in the source, every card a labelled group,
//     reduced motion drops the flip turn and the slide travel (CSS), print keeps the list (CSS).
//  4. Game: 12-15 scenarios, every answer yellow / red / none, the three choices with distinct swipes, levels start at 0;
//     shuffle keeps every scenario; levelFor picks the right level; the game sends nothing (no fetch / beacon / storage).
// usage: node tests/cards-page.cjs
const assert=require('node:assert/strict');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
const C=L('lib/site/cardRules.ts'),ES=L('lib/i18n/es/cardRules.ts'),RC=L('lib/site/refCall.ts');
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
const decode=h=>h.replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
// ---- 1. content ----
for(const [tag,c] of [['en',C.CARD_RULES],['es',ES.CARD_RULES_ES]]){
 const y=c.offences.filter(o=>o.color==='yellow'),r=c.offences.filter(o=>o.color==='red');
 ok(y.length===7&&r.length===7&&c.offences.length===14,`${tag}: 7 yellow + 7 red offences (${y.length}+${r.length})`);
 ok(new Set(c.offences.map(o=>o.id)).size===14,`${tag}: offence ids unique`);
 for(const o of c.offences)for(const k of ['name','explain','example','next'])ok(typeof o[k]==='string'&&o[k].trim().length>2,`${tag}/${o.id}: ${k}`);
 ok(c.compare.rows.every(row=>row.length===c.compare.head.length),`${tag}: table rows match the head`);
 RC.checkCallGame(c.game);n++;
}
const en=C.CARD_RULES,es=ES.CARD_RULES_ES;
ok(JSON.stringify(en.offences.map(o=>[o.id,o.color,o.icon]))===JSON.stringify(es.offences.map(o=>[o.id,o.color,o.icon])),'Spanish offences: same ids, colours, icons, order');
ok(JSON.stringify(en.game.scenarios.map(s=>[s.id,s.answer]))===JSON.stringify(es.game.scenarios.map(s=>[s.id,s.answer])),'Spanish game: same scenarios and answers');
ok(JSON.stringify(en.game.choices.map(c=>[c.id,c.swipe]))===JSON.stringify(es.game.choices.map(c=>[c.id,c.swipe])),'Spanish game: same choices and swipes');
for(const k of ['side','compare'])ok((en[k].items||en[k].rows).length===(es[k].items||es[k].rows).length,`Spanish ${k}: 1:1`);
ok(en.next.yellow.points.length===es.next.yellow.points.length&&en.next.red.points.length===es.next.red.points.length,'Spanish next: 1:1');
ok(en.game.levels.length===es.game.levels.length&&en.game.levels.every((l,i)=>l.min===es.game.levels[i].min),'Spanish levels: same thresholds');
ok(en.sources.links.every(l=>/^https:\/\//.test(l.url))&&en.sources.links.some(l=>/theifab\.com\/laws\/latest\/fouls-and-misconduct/.test(l.url)),'sources cite IFAB Law 12');
ok(/checked Nov 16 2026/.test(read('lib/site/cardRules.ts')),'cardRules.ts states its check date');
// ---- 2. server HTML ----
const P=L('app/(site)/learn/soccer-rules/[slug]/page.tsx'),rules=L('lib/site/rules.ts'),R=rules.ruleBySlug('yellow-and-red-cards');
const words=s=>s.trim().split(/\s+/).length;
ok(R.title.length<=60&&/yellow and red cards in soccer/i.test(R.title)&&/yellow card means/i.test(R.title),`title query-led and <= 60: ${R.title}`);
ok(R.desc.length<=155&&/what does a yellow card mean in soccer/i.test(R.desc),`description query-led and <= 155 (${R.desc.length})`);
ok(words(R.answer)>=40&&words(R.answer)<=60,`answer 40-60 words (${words(R.answer)})`);
for(const q of ['What does a yellow card mean in soccer?','How do you get a red card in soccer?','What happens after a red card in soccer?'])ok(R.faq.some(f=>f.q===q),`FAQ asks: ${q}`);
const routes=L('components/es/routes.tsx');
const pages=[['en',decode(render(React.createElement(P.default,{params:{slug:'yellow-and-red-cards'}}))),en,R],
 ['es',decode(render(routes.esRoute('/learn/soccer-rules/yellow-and-red-cards').render())),es,L('lib/i18n/es/registry.ts').esRule('yellow-and-red-cards')]];
for(const [tag,h,c,r] of pages){
 for(const o of c.offences)for(const k of ['name','explain','example','next'])ok(h.includes(o[k]),`${tag} HTML has ${o.id}.${k}`);
 ok(/data-card-deck=""/.test(h)&&/role="region" aria-roledescription="carousel" aria-label="[^"]+"/.test(h),`${tag}: deck is a labelled carousel region`);
 ok((h.match(/role="group" aria-roledescription="card" aria-label="[^"]+"/g)||[]).length===14,`${tag}: 14 labelled card groups`);
 ok(!/inert=""/.test(h)&&!/data-ready/.test(h),`${tag}: server HTML is the plain list (nothing hidden, no deck mode)`);
 const t=h.indexOf('aria-labelledby="yellow-vs-red"');ok(t>0&&/<table[\s\S]*?<th scope="col">/.test(h.slice(t,t+4000)),`${tag}: comparison is a real <table> with column headers`);
 for(const row of c.compare.rows)ok(h.includes(row[0]),`${tag}: table row ${row[0]}`);
 for(const s of c.side.items)ok(h.includes(s.q)&&h.includes(s.a),`${tag}: side question ${s.q}`);
 ok(h.includes(c.game.words.title)&&h.includes(c.game.words.start),`${tag}: game title and Start button`);
 const ld=ldOf(h),faq=ld.find(x=>x['@type']==='FAQPage');
 ok(faq&&faq.mainEntity.length===r.faq.length,`${tag}: FAQPage JSON-LD with every question`);
 for(const [i,e] of faq.mainEntity.entries()){ok(e['@type']==='Question'&&e.name===r.faq[i].q&&e.acceptedAnswer['@type']==='Answer'&&e.acceptedAnswer.text,`${tag}: FAQ ${i} valid`);ok(h.includes(e.name),`${tag}: FAQ ${i} shown`);}
 for(const s of ['fouls-and-free-kicks','penalty-kick','handball'])ok(new RegExp(`href="(/es)?/learn/soccer-rules/${s}"`).test(h),`${tag}: links to ${s}`);
 ok(/data-print-sheet=""/.test(h),`${tag}: print sheet`);
}
// ---- 3. deck source ----
const deck=read('components/site/CardDeck.tsx'),dcss=read('components/site/cardDeck.module.css');
ok(/ArrowRight/.test(deck)&&/ArrowLeft/.test(deck),'deck: keyboard arrows');
ok(/aria-live="polite"/.test(deck)&&/words\.position/.test(deck),'deck: live region "Card n of N"');
ok(/onPointerDown/.test(deck)&&/onPointerUp/.test(deck)&&/onPointerCancel/.test(deck),'deck: pointer swipe');
ok(/<button type="button"[^>]*aria-pressed/.test(deck)&&/aria-label=\{words\.prev\}/.test(deck)&&/aria-label=\{words\.next\}/.test(deck),'deck: real Flip, previous and next buttons');
ok(/touch-action:pan-y/.test(dcss),'deck: vertical page scroll still works over the deck');
const rm=dcss.slice(dcss.indexOf('prefers-reduced-motion:reduce'));
ok(/\.track\{transition:none\}/.test(rm)&&/transform:none!important/.test(rm)&&/opacity/.test(rm),'deck: reduced motion = no flip or slide travel, a cross-fade');
ok(/@media print\{[\s\S]*\.controls[\s\S]*display:none/.test(dcss)&&/@media screen\{/.test(dcss),'deck: deck styles are screen-only, print shows the list');
ok(/aria-labelledby=card-rules/.test(read('components/site/printSheet.module.css')),'print sheet keeps the card rules list');
// ---- 4. game ----
const g=en.game;let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const sh=RC.shuffled(g.scenarios,rnd);ok(sh.length===g.scenarios.length&&new Set(sh.map(s=>s.id)).size===g.scenarios.length,'shuffle keeps every scenario');
ok(RC.levelFor(g.levels,0,15).min===0&&RC.levelFor(g.levels,15,15).min===1&&RC.levelFor(g.levels,8,15).min===.5,'levelFor');
ok(['yellow','red','none'].every(a=>g.scenarios.some(s=>s.answer===a)),'game uses all three calls');
const game=read('components/site/RefCallGame.tsx');
ok(!/fetch\(|sendBeacon|localStorage|sessionStorage|track\(/.test(game+deck),'deck and game send and store nothing');
ok(/aria-live="polite"/.test(game)&&/ArrowUp/.test(game)&&/onPointerUp/.test(game),'game: live region, keyboard and swipe');
ok(/game\.choices\.map\(c=><button/.test(game),'game: the three buttons are real buttons');
console.log(`cards-page: ${n} checks OK`);
