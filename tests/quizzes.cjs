// The quiz pages (Nov 23 2026; lib/site/quizBank.ts, lib/i18n/es/quizBank.ts, lib/site/quizzes.ts, components/site/quiz/):
//  1. Every quiz has 8-12 questions; every question has 2-4 distinct options, exactly one right answer, an explanation and a
//     "learn more" page that is a real sitemap page (in the quiz's language when a Spanish page exists).
//  2. English and Spanish match question by question: same slugs, same count, same kind, same right answer, same pictures.
//  3. Titles <= 60, descriptions 70-155, all unique per language; Spanish words never say "portería".
//  4. The hub, the Library card (after Lessons in RAIL_ORDER), the footer, the sitemap family, hreflang (Spanish slugs), llms.txt.
//  5. The pages: the answer key is server-rendered inside a <details>, the quiz widget is the only client part, Quiz JSON-LD names
//     the right answer for every question, the "Test yourself" card shows on mapped rule/term/position pages.
const assert=require('node:assert/strict');
const {root,L,read,render,React}=require('./lib/tsLoad.cjs');process.chdir(root);
(async()=>{
 const Z=L('lib/site/quizzes.ts'),EP=L('lib/i18n/esPaths.ts'),paths=L('lib/site/paths.ts');
 const PATHS=new Set(paths.sitePaths().map(p=>p.path));
 const real=p=>{const en=p.startsWith('/es/')||p==='/es'?EP.toEn(p):p;return PATHS.has(en)&&(!p.startsWith('/es/')||EP.hasEs(en));};
 assert.equal(Z.QUIZZES.length,10,'ten quizzes');assert.equal(Z.QUIZZES_ES.length,10,'ten Spanish quizzes');
 for(const [lang,list] of [['en',Z.QUIZZES],['es',Z.QUIZZES_ES]]){
  const titles=new Set(),descs=new Set();
  for(const q of list){
   assert(q.questions.length>=8&&q.questions.length<=12,`${lang} ${q.slug}: ${q.questions.length} questions`);
   assert(q.title.length<=60,`${lang} ${q.slug} title ${q.title.length}`);assert(q.desc.length>=70&&q.desc.length<=155,`${lang} ${q.slug} desc ${q.desc.length}`);
   assert(!titles.has(q.title)&&!descs.has(q.desc),`${lang} ${q.slug}: unique title and description`);titles.add(q.title);descs.add(q.desc);
   assert(q.faq.length>=3&&q.faq.length<=5,`${lang} ${q.slug}: 3-5 FAQ`);assert(q.sources.length>=1,`${lang} ${q.slug}: sources`);
   assert(real(q.path),`${lang} ${q.slug}: its own page ${q.path} is a sitemap page`);
   for(const x of q.questions){
    assert(x.options.length>=2&&x.options.length<=4,`${q.slug} "${x.q}": 2-4 options`);assert.equal(new Set(x.options).size,x.options.length,`${q.slug} "${x.q}": distinct options`);
    assert(Number.isInteger(x.correct)&&x.correct>=0&&x.correct<x.options.length,`${q.slug} "${x.q}": exactly one right answer`);
    assert(x.explain&&x.explain.length>=10,`${q.slug} "${x.q}": explanation`);
    assert(real(x.more.href),`${lang} ${q.slug} "${x.q}": learn-more ${x.more.href} is a real page`);
    if(lang==='es'&&EP.hasEs(EP.toEn(x.more.href)??x.more.href))assert(x.more.href.startsWith('/es'),`${q.slug}: Spanish link when there is a Spanish page`);
    assert(x.more.name,`${q.slug}: learn-more name`);
   }
   if(lang==='es')assert(!/porter[ií]a/i.test(JSON.stringify(q)),`${q.slug}: no "portería" (the site says "arco")`);
  }
 }
 // 2: parity
 Z.QUIZZES.forEach((e,k)=>{const s=Z.QUIZZES_ES[k];assert.equal(s.slug,e.slug);assert.equal(s.topic,e.topic);assert.equal(s.questions.length,e.questions.length,`${e.slug}: same count`);
  e.questions.forEach((x,i)=>{const y=s.questions[i];assert.equal(y.kind,x.kind,`${e.slug} #${i} kind`);assert.equal(y.correct,x.correct,`${e.slug} #${i}: same right answer`);
   assert.equal(y.options.length,x.options.length,`${e.slug} #${i} options`);assert.equal(y.pic?.src,x.pic?.src,`${e.slug} #${i} picture`);assert.equal(EP.toEn(y.more.href)??y.more.href,x.more.href,`${e.slug} #${i}: same page`);});});
 // right answers are not always in the same place
 const at=Z.QUIZZES.flatMap(q=>q.questions.filter(x=>x.kind==='choice'||x.kind==='picture').map(x=>x.correct));assert(new Set(at).size>=3&&at.filter(a=>a===0).length<at.length*.6,'right answers spread across positions');
 // 4: hub, library, footer, sitemap, hreflang, llms
 assert(PATHS.has('/learn/quizzes'),'hub in the sitemap');assert.equal(EP.toEs('/learn/quizzes'),'/es/learn/preguntas-de-futbol');assert.equal(EP.toEn('/es/learn/preguntas-de-futbol/quiz-del-fuera-de-juego'),'/learn/quizzes/offside-quiz');
 assert.equal(EP.enOfEs('/learn/quizzes'),null,'/es/learn/quizzes is not a page (the Spanish slug is)');
 const sm=L('lib/site/sitemaps.ts');assert.equal(sm.familyOf('/learn/quizzes/offside-quiz'),'quizzes');assert.equal(sm.familyOf(EP.toEs('/learn/quizzes/offside-quiz')),'es-quizzes');assert.equal(sm.familyOf('/learn/quizzes'),'core');
 for(const h of [Z.QUIZ_HUB.en,Z.QUIZ_HUB.es]){assert(h.title.length<=60,`hub title ${h.title.length}`);assert(h.desc.length>=120&&h.desc.length<=155,`hub desc ${h.desc.length}`);}
 const RO=L('lib/site/railNav.ts').RAIL_ORDER;assert.equal(RO[RO.indexOf('/learn/lessons')+1],'/learn/quizzes','Library menu: Quizzes right after Lessons');
 const foot=L('lib/site/footerHubs.ts');assert(foot.FOOTER_HUBS.some(x=>x[0]==='/learn/quizzes'),'footer link');
 assert(L('lib/site/library.ts').libraryGroups().flatMap(g=>g.cards).some(c=>c.href==='/learn/quizzes'&&c.count===`${Z.QUIZZES.length} quizzes`),'Library card with the real count');
 assert(/\/learn\/quizzes/.test(L('lib/site/llms.ts').llmsText()),'llms.txt names the quiz hub');
 for(const [p,s] of Object.entries(Z.QUIZ_FOR)){assert(PATHS.has(p),`Test yourself on a real page: ${p}`);assert(Z.quizBySlug(s),`${p}: quiz ${s}`);}
 // 5: pages
 const QP=L('components/site/quiz/QuizPages.tsx'),q=Z.quizBySlug('offside-quiz');
 const html=render(React.createElement(QP.QuizPageView,{quiz:q,lang:'en'}));
 assert(/<details[^>]*data-answer-key/.test(html),'answer key in a <details>');for(const x of q.questions)assert(html.includes(x.explain.replace(/’/g,'’')),`answer key has: ${x.explain.slice(0,30)}`);
 assert(html.includes('data-quiz-play'),'the quiz widget renders on the server (first question as HTML)');
 const ld=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const main=ld.find(x=>x.hasPart?.['@type']==='Quiz');assert(main,'Quiz JSON-LD (repo pattern: Article/LearningResource hasPart Quiz)');
 assert.equal(main.hasPart.hasPart.length,q.questions.length);main.hasPart.hasPart.forEach((x,i)=>assert.equal(x.acceptedAnswer.text,q.questions[i].options[q.questions[i].correct]));
 assert(ld.some(x=>x['@type']==='BreadcrumbList')&&ld.some(x=>x['@type']==='FAQPage'),'breadcrumbs and FAQ');
 const es=render(React.createElement(QP.QuizPageView,{quiz:Z.quizBySlug('offside-quiz','es'),lang:'es'}));assert(es.includes('Respuestas')&&!/porter[ií]a/i.test(es),'Spanish page');
 const hub=render(React.createElement(QP.QuizHubView,{lang:'en'}));for(const x of Z.QUIZZES)assert(hub.includes(`href="${x.path}"`),`hub links ${x.slug}`);
 const card=render(React.createElement(QP.TestYourself,{enPath:'/learn/soccer-rules/offside'}));assert(card.includes('href="/learn/quizzes/offside-quiz"'),'Test yourself card');
 assert.equal(render(React.createElement(QP.TestYourself,{enPath:'/learn/soccer-rules/nope'})),'','no card without a quiz');
 const src=read('components/site/quiz/QuizPlay.tsx');assert(/^'use client'/.test(src)&&!/setInterval|autoplay/i.test(src.replace(/no autoplay/gi,'')),'client widget: no interval, no autoplay');
 assert(!/font[^;{}]*IslandBrush/.test(read('components/site/quiz/quizPlay.module.css')),'buttons use the UI sans');
 console.log(`quizzes: ${Z.QUIZZES.length} quizzes, ${Z.QUIZ_QUESTIONS} questions each language, ${Object.keys(Z.QUIZ_FOR).length} Test-yourself pages: ok`);
})().catch(e=>{console.error(e.message);process.exit(1);});
