import JsonLd from '@/components/seo/JsonLd';
import RailNav from '@/components/site/shell/RailNav';
import {QA} from '@/components/site/LessonHub';
import {CardGrid,type HubCard} from '@/components/site/HubParts';
import {GuideEnd,GuideIntro,LinkList,Section,type Fact} from '@/lib/site/GuideParts';
import {EsGuideEnd,EsIntro,esLibCrumbs} from '@/components/es/EsParts';
import {guideCrumbs} from '@/lib/site/guides';
import {hubRail,pageRail,sec} from '@/lib/site/railNavMore';
import {onwardFor} from '@/lib/site/railNav';
import {quizPart} from '@/lib/site/learningLd';
import {abs,articleLd,breadcrumbLd,collectionLd,faqLd} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {QUIZ_FOR_WHO,QUIZ_HUB,QUIZ_HUB_FAQ,QUIZ_TOPICS,QUIZZES_PATH,inLang,quizBySlug,quizForPage,quizzesIn,type Lang,type SiteQuiz} from '@/lib/site/quizzes';
import QuizPlay from './QuizPlay';
import styles from '@/app/(site)/site.module.css';
import q from './quizPages.module.css';
/**
 * The quiz page and the quiz hub, one template for English and Spanish (Nov 23 2026, owner-approved design): H1 and a short
 * intro, the quiz played in place (QuizPlay, the page's only client island), the answer key written out in a closed <details>
 * (server-rendered, so every question, answer and reason is in the HTML), FAQ, more quizzes, sources. Side nav per the site
 * rule: Back + Overview + the page's own sections (lib/site/railNavMore.ts pageRail).
 */
const T={
 en:{hub:QUIZ_HUB.en.crumb,play:'Play the quiz',key:'Answer key',order:'Right order',keyOpen:(n:number)=>`Show all ${n} questions and answers`,right:'Right answer',why:'Why',more:'Learn more',faq:'Questions',
  others:'More quizzes',sources:'Sources',ages:'Ages',agesV:'7 to 12',qs:'Questions',qsV:(n:number)=>`${n} questions`,topic:'Topic',allQuizzes:'All soccer quizzes',
  test:'Test yourself',testLine:(n:number)=>`${n} quick questions with answers. Free, no account.`,takeQuiz:'Take the quiz',
  railQuiz:'Quiz',railKey:'Answers',railFaq:'Questions',railMore:'More quizzes',railSources:'Sources',onPage:'Quiz: on this page',
  covers:'What this quiz covers',railCovers:'What it covers',coversLine:(n:number)=>`It tests ${n===1?'one topic':`${n} topics`}. Each one links to the page that teaches it:`,qN:(n:number)=>n===1?'1 question':`${n} questions`,
  practise:'Practise it: games and tools',railPractise:'Practise it'},
 es:{hub:QUIZ_HUB.es.crumb,play:'Juega el quiz',key:'Respuestas',order:'Orden correcto',keyOpen:(n:number)=>`Ver las ${n} preguntas con sus respuestas`,right:'Respuesta correcta',why:'Por qué',more:'Aprende más',faq:'Preguntas',
  others:'Más quizzes',sources:'Fuentes',ages:'Edades',agesV:'7 a 12 años',qs:'Preguntas',qsV:(n:number)=>`${n} preguntas`,topic:'Tema',allQuizzes:'Todos los quizzes de fútbol',
  test:'Ponte a prueba',testLine:(n:number)=>`${n} preguntas rápidas con respuestas. Gratis, sin cuenta.`,takeQuiz:'Haz el quiz',
  railQuiz:'Quiz',railKey:'Respuestas',railFaq:'Preguntas',railMore:'Más quizzes',railSources:'Fuentes',onPage:'Quiz: en esta página',
  covers:'Qué repasa este quiz',railCovers:'Qué repasa',coversLine:(n:number)=>`Repasa ${n===1?'un tema':`${n} temas`}. Cada uno enlaza a la página que lo explica:`,qN:(n:number)=>n===1?'1 pregunta':`${n} preguntas`,
  practise:'Practica: juegos y herramientas',railPractise:'Practica'}};
/** Spanish JSON-LD: every inLanguage is es (as components/es/pages/GuidesEs.tsx esLd; not imported, to keep the import graph flat). */
const esLd=<X,>(x:X):X=>JSON.parse(JSON.stringify(x),(k,v)=>k==='inLanguage'?'es':v);
const topicName=(t:SiteQuiz['topic'],lang:Lang)=>{const x=QUIZ_TOPICS.find(y=>y.id===t)!;return lang==='es'?x.es:x.en;};
const hubPath=(lang:Lang)=>inLang(QUIZZES_PATH,lang);
const crumbsFor=(lang:Lang,tail?:{name:string;path:string})=>{const hub={name:T[lang].hub,path:hubPath(lang)};const list=tail?[hub,tail]:[hub];return lang==='es'?esLibCrumbs(...list):guideCrumbs(...list);};

export function QuizPageView({quiz,lang}:{quiz:SiteQuiz;lang:Lang}){
 const t=T[lang],es=lang==='es',crumbs=crumbsFor(lang,{name:quiz.name,path:quiz.path}),n=quiz.questions.length;
 const facts:Fact[]=[{icon:'kid',label:t.ages,value:t.agesV},{icon:'quiz',label:t.qs,value:t.qsV(n),href:'#play'},{icon:'tag',label:t.topic,value:topicName(quiz.topic,lang),href:`${hubPath(lang)}#${quiz.topic}`}];
 const rail=<RailNav rail={pageRail(t.onPage,{href:hubPath(lang),name:t.allQuizzes},[sec('play',t.railQuiz),sec('covers',t.railCovers),...(quiz.practise.length?[sec('practise',t.railPractise)]:[]),sec('answers',t.railKey),sec('faq',t.railFaq),sec('more-quizzes',t.railMore),sec('sources',t.railSources)],es)} current="#top"/>;
 /* SEO batch E (Nov 25 2026): the next quizzes of the same topic in turn (wrapping round), then one quiz of each other topic picked
    by this quiz's place, so every quiz gets links from its neighbours instead of the first few taking them all */
 const same=quizzesIn(quiz.topic,lang),at=same.findIndex(x=>x.slug===quiz.slug),others=[...same.slice(at+1),...same.slice(0,Math.max(at,0))];
 const more=[...others.slice(0,3),...[...QUIZ_TOPICS].flatMap(g=>{if(g.id===quiz.topic)return [];const l=quizzesIn(g.id,lang);return l.length?[l[at%l.length]]:[];}),...others.slice(3)].slice(0,5).map(x=>({path:x.path,name:x.h1,line:t.qsV(x.questions.length)}));
 /* SEO batch F (Nov 25 2026, tests/seo-boost.cjs: "Article without image"): the quiz's first picture, as its og:image, else the site picture */
 const ld={...articleLd({headline:quiz.title,path:quiz.path,description:quiz.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:quiz.name,image:quiz.questions.find(x=>x.pic)?.pic?.src??'/opengraph-image.png'}),
  learningResourceType:'Quiz',educationalUse:'assessment',typicalAgeRange:'7-12',
  hasPart:quizPart({path:quiz.path,anchor:'answers',name:quiz.name,about:quiz.name.replace(/^Quiz (de|del) /,'').replace(/ quiz$/i,''),questions:quiz.questions.filter(x=>x.kind!=='order')/* multiple choice only: an order question has no one right option */})};
 const Intro=es?EsIntro:GuideIntro;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={es?esLd(ld):ld}/>
  <JsonLd data={faqLd(quiz.faq)}/>
  <Intro top rail={rail} onward={onwardFor(null,es)} crumbs={crumbs} h1={quiz.h1} lead={quiz.intro} facts={facts}/>
  <section className={styles.section} aria-labelledby="play" data-quiz-section="">
   <h2 className={styles.h2} id="play">{t.play}</h2>
   <QuizPlay slug={quiz.slug} name={quiz.name} lang={lang} questions={quiz.questions} url={abs(quiz.path)}/>
  </section>
  {/* SEO batch E (Nov 25 2026): who the quiz is for, the pages it tests (one link per topic), and games and tools to practise it */}
  <Section id="covers" title={t.covers}><p>{QUIZ_FOR_WHO[quiz.topic][es?1:0]} {t.coversLine(quiz.covers.length)}</p>
   <LinkList links={quiz.covers.map(c=>({path:c.path,name:c.name,line:t.qN(c.n)}))}/></Section>
  {quiz.practise.length>0&&<Section id="practise" title={t.practise}><LinkList links={quiz.practise}/></Section>}
  <section className={styles.section} aria-labelledby="answers">
   <h2 className={styles.h2} id="answers">{t.key}</h2>
   <details className={q.key} data-answer-key="">
    <summary className={q.keySum}>{t.keyOpen(n)}</summary>
    <ol className={q.keyList}>{quiz.questions.map(x=><li key={x.q}>
     <h3 className={q.keyQ}>{x.q}</h3>
     {x.seq?<><p><b>{t.order}:</b></p><ol className={q.keyOpts} data-order="">{x.seq.map(j=><li key={j} data-right="">{x.options[j]}</li>)}</ol></>
      :<ul className={q.keyOpts}>{x.options.map((o,j)=><li key={o} data-right={j===x.correct?'':undefined}>{o}{j===x.correct&&<b> ({t.right})</b>}</li>)}</ul>}
     <p>{x.explain}{x.fact?` ${x.fact}`:''} <a href={x.more.href}>{t.more}: {x.more.name}</a></p>
    </li>)}</ol>
   </details>
  </section>
  <QA id="faq" title={t.faq} faq={quiz.faq}/>
  <Section id="more-quizzes" title={t.others}><LinkList links={[...more,{path:hubPath(lang),name:t.allQuizzes,line:es?QUIZ_HUB.es.h1:QUIZ_HUB.en.h1}]}/></Section>
  <Section id="sources" title={t.sources}><ul>{quiz.sources.map(x=><li key={x.url+x.name}><a href={x.url} rel="noopener">{x.name}</a></li>)}</ul></Section>
  {es?<EsGuideEnd/>:<GuideEnd path={quiz.path}/>}
 </>;
}

export function QuizHubView({lang}:{lang:Lang}){
 const t=T[lang],es=lang==='es',H=QUIZ_HUB[lang],crumbs=crumbsFor(lang),path=hubPath(lang),all=QUIZ_TOPICS.flatMap(g=>quizzesIn(g.id,lang));
 const rail=<RailNav rail={hubRail(es?'Quizzes de fútbol':'Soccer quizzes',[{items:[...QUIZ_TOPICS.map(g=>sec(g.id,es?g.es:g.en)),sec('faq',t.railFaq)]}],es)} current="#top"/>;
 const Intro=es?EsIntro:GuideIntro;
 const facts:Fact[]=[{icon:'kid',label:t.ages,value:t.agesV},{icon:'quiz',label:es?'Quizzes':'Quizzes',value:String(all.length)},{icon:'steps',label:t.qs,value:String(all.reduce((a,x)=>a+x.questions.length,0))}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={(()=>{const c=collectionLd({name:H.h1,path,description:H.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:all.map(x=>({name:x.h1,path:x.path}))});return es?esLd(c):c;})()}/>
  <JsonLd data={faqLd(QUIZ_HUB_FAQ[lang])}/>
  <Intro top cta={false} toc={false} rail={rail} onward={onwardFor(null,es)} crumbs={crumbs} h1={H.h1} lead={H.lead} facts={facts}/>
  {QUIZ_TOPICS.map(g=>{const list=quizzesIn(g.id,lang);if(!list.length)return null;
   const cards:HubCard[]=list.map(x=>({path:x.path,name:x.h1,meta:`${t.qsV(x.questions.length)} · ${t.agesV}`,line:x.intro,icon:'quiz'}));
   return <Section key={g.id} id={g.id} title={es?g.es:g.en}><p>{g.line[es?1:0]}</p><CardGrid cards={cards} show={12} lang={lang}/></Section>;})}
  <QA id="faq" title={t.faq} faq={QUIZ_HUB_FAQ[lang]}/>
  {es?<EsGuideEnd/>:<GuideEnd path={path}/>}
 </>;
}

/** "Test yourself" (owner brief): one small card on a rule, term or position page that has a quiz (lib/site/quizzes.ts QUIZ_FOR). */
export function TestYourself({enPath,lang='en'}:{enPath:string;lang?:Lang}){
 const quiz=quizForPage(enPath,lang);if(!quiz)return null;const t=T[lang];
 return <aside className={q.test} aria-labelledby="test-yourself" data-test-yourself="">
  <h2 className={q.testTitle} id="test-yourself">{t.test}: {quiz.h1.toLowerCase().startsWith('quiz')?quiz.h1:quiz.h1.toLowerCase()}</h2>
  <p className={q.testLine}>{t.testLine(quiz.questions.length)}</p>
  <a className={q.testBtn} href={quiz.path}>{t.takeQuiz}</a>
 </aside>;
}
export {quizBySlug};
