import JsonLd from '@/components/seo/JsonLd';
import LearnSearch from '@/components/site/LearnSearch';
import {FORMAT_LABEL,FORMAT_ORDER,LESSONS,lessonPath} from '@/lib/site/lessons';
import {playLessonHref} from '@/lib/site/playLinks';
import {hubsFor,HUBS} from '@/lib/site/hubs';
import {guidesForLesson} from '@/lib/site/guides';
import {lessonSiblings} from '@/lib/site/related';
import {LESSON_DATA_UPDATED,SITE_PUBLISHED,SITE_UPDATED} from '@/lib/site/updated';
import {abs,breadcrumbLd,faqLd,PLAY_PATH,SITE_NAME} from '@/lib/site/seo';
import {lessonLd} from '@/lib/site/learningLd';
import {hasEs,toEs} from '@/lib/i18n/esPaths';
import {ES_FORMATIONS,ES_HUBS,ES_POSITIONS,ES_RULES,ES_TERMS} from '@/lib/i18n/es/registry';
import {ES_LESSONS,esLesson,formatPhraseEs,lessonDescriptionEs,lessonTitleEs,type EsLesson} from '@/lib/i18n/es/lessons';
import {DEFINITION_ES,HUB_COMMON_FAQ_ES,SAFE_TRUST_LINE_ES} from '@/lib/i18n/es/safety';
import {esHubLink as hubLink} from '@/lib/i18n/es/hubs';
/** Only hubs that already have a Spanish page. */
const esHubLink=(enPath:string)=>hasEs(enPath)?hubLink(enPath):null;
import {esMeta} from '@/lib/i18n/es/seo';
import {ES_UI} from '@/lib/i18n/es/ui';
import {EsBreadcrumbs,EsCheckedLine,EsPlayEnd,EsPrintSheet,EsReadNext,QA,esCrumbs} from '@/components/es/EsParts';
import {esLd} from './GuidesEs';
import type {EsRoute} from '../routes';
import styles from '@/app/(site)/site.module.css';
import fx from '@/components/site/siteForms.module.css';
/**
 * The Spanish lessons (Spanish round D, Nov 16 2026): /es/learn/lessons (index), /es/learn/lessons/<id> (96 reading pages) and
 * the Spanish guide search /es/learn?q= (not a sitemap page; noindex, like /learn). Same sections and classes as
 * app/(site)/learn/lessons/*, Spanish words from lib/i18n/es/lessons.ts. A lesson page never marks the right answer: options are
 * listed A-Z and the explanations carry no verdict (as in English). The game itself is English for now; the page says so.
 */
const INDEX='/learn/lessons',INDEX_ES=toEs(INDEX);
const CHECKED=LESSON_DATA_UPDATED>SITE_UPDATED.lessons?LESSON_DATA_UPDATED:SITE_UPDATED.lessons;
const PARENTS=toEs('/safe-football-game-for-kids');
const crumbIndex={name:ES_UI.lessons,path:INDEX_ES};
const cap=(s:string)=>s?s[0].toUpperCase()+s.slice(1):s;
const fmtWord=(f:string)=>f==='Futsal'||f==='futsal'?'futsal':f;
/** A Spanish name for a guide page that teaches from a lesson (formations, positions, rules, terms); null when it has none. */
function guideLinkEs(path:string):{path:string;name:string}|null{
 if(!hasEs(path))return null;
 const f=ES_FORMATIONS().find(x=>x.path===path);if(f)return {path:f.esPath,name:`Formación ${f.name}`};
 const p=ES_POSITIONS().find(x=>x.path===path);if(p)return {path:p.esPath,name:cap(p.name)};
 const r=ES_RULES().find(x=>x.path===path);if(r)return {path:r.esPath,name:r.h1};
 const t=ES_TERMS().find(x=>x.path===path);if(t)return {path:t.esPath,name:t.h1};
 return null;
}
const ParentsLine=()=><p className={styles.caption}>{SAFE_TRUST_LINE_ES} {hasEs('/safe-football-game-for-kids')?<a href={PARENTS}>Lee la guía para padres</a>:<a href="/safe-football-game-for-kids">Lee la guía para padres (en inglés)</a>}.</p>;

// ---- one lesson ---------------------------------------------------------------------------------------------------------------
const LESSON_FAQ=[{q:'¿Cómo juego esta lección?',a:'Abre Futbol Island en futbolisland.app/play y empieza una isla o sigue con un código de guardado. En el juego, la voz de un entrenador muestra cada idea en una cancha con jugadores que se mueven, paso a paso, y una prueba rápida la repasa. El juego está en inglés por ahora.'},...HUB_COMMON_FAQ_ES];
export function LessonEsPage({l}:{l:EsLesson}){
 const crumbs=esCrumbs(crumbIndex,{name:l.title,path:l.esPath});
 const sib=lessonSiblings(l),same=sib.same.map(x=>({x:esLesson(x.id)!,tag:''})),prev=esLesson(sib.prev.id)!,next=esLesson(sib.next.id)!;
 const fw=fmtWord(l.formatLabel),group=l.categoryEs?`Más lecciones de ${l.categoryEs.toLowerCase()} en ${fw}`:l.chapterEs?`Más lecciones de ${fw}: ${l.chapterEs.toLowerCase()}`:`Más lecciones de ${fw}`;
 const hubs=hubsFor(l.id).map(h=>esHubLink(h.path)).filter((x):x is NonNullable<typeof x>=>!!x);
 const guides=guidesForLesson(l.id).map(g=>guideLinkEs(g.path)).filter((x):x is NonNullable<typeof x>=>!!x);
 const eyebrow=[`Lección de ${fmtWord(l.formatLabel)}`,l.chapterEs,l.difficultyEs].filter(Boolean).join(' · ');
 return <>
  <JsonLd data={esLd(lessonLd({name:l.title,path:l.esPath,description:l.concept,teaches:l.concept,level:l.difficulty,about:formatPhraseEs(l.formatLabel),
   keywords:[l.formatLabel,l.categoryEs,l.chapterEs].filter(Boolean).join(', '),published:SITE_PUBLISHED,modified:CHECKED,questions:l.questions}))}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={faqLd(LESSON_FAQ)}/>
  <header className={styles.intro}>
   <EsBreadcrumbs crumbs={crumbs}/>
   <p className={styles.eyebrow}>{eyebrow}</p>
   <h1 className={styles.title}>{l.title}</h1>
   <p className={styles.lead} data-answer="">{l.concept}</p>
   <p>“{l.title}” es una lección y prueba gratis de {formatPhraseEs(l.formatLabel)} para niños de 7 a 12 años en Futbol Island, un juego para aprender que se juega en el navegador. El juego está en inglés por ahora.</p>
   <ParentsLine/>
   <a className={styles.cta} href={playLessonHref(l.id)} data-play-cta="">Juega esta lección</a>
  </header>
  <EsPrintSheet path={l.esPath} what="hoja de la lección" has="la idea, los pasos y las preguntas"/>
  <section className={styles.section} aria-labelledby="coach"><h2 className={styles.h2} id="coach">Lo que dice el entrenador</h2>
   <div className={styles.card}><ol>{l.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></div>
  </section>
  {l.questions.length>0&&<section className={styles.section} aria-labelledby="quiz"><h2 className={styles.h2} id="quiz">Preguntas de la prueba</h2>
   <p className={styles.caption}>Intenta responder antes de leer la explicación del entrenador. En la isla respondes cada una en la cancha.</p>
   <ol className={styles.stack}>{l.questions.map((q,i)=><li key={i} className={styles.card}>
    <p className={styles.eyebrow}>Pregunta {i+1}</p>
    <h3 className={styles.h3}>{q.q}</h3>
    {q.options.length>0&&<ul className={styles.options}>{q.options.map((o,j)=><li key={j}>{o}</li>)}</ul>}
    {q.explain&&<p><b>Explicación del entrenador:</b> {q.explain}</p>}
   </li>)}</ol>
  </section>}
  <section className={styles.section} aria-labelledby="siblings"><h2 className={styles.h2} id="siblings">{group}</h2>
   <ul className={styles.list}>{[...same,{x:prev,tag:'Lección anterior · '},{x:next,tag:'Lección siguiente · '}].map(({x,tag})=><li key={x.id}><a href={x.esPath}><span className={styles.itemTitle}>{x.title}</span><span className={styles.itemMeta}>{tag}{x.concept}</span></a></li>)}</ul>
  </section>
  {hubs.length>0&&<section className={styles.section} aria-labelledby="related"><h2 className={styles.h2} id="related">Más lecciones como esta</h2>
   <ul className={styles.list}>{hubs.map(h=><li key={h.path}><a href={h.path}><span className={styles.itemTitle}>{h.name}</span></a></li>)}</ul>
  </section>}
  {guides.length>0&&<section className={styles.section} aria-labelledby="guides"><h2 className={styles.h2} id="guides">Guías relacionadas</h2>
   <ul className={styles.list}>{guides.map(g=><li key={g.path}><a href={g.path}><span className={styles.itemTitle}>{g.name}</span></a></li>)}</ul>
  </section>}
  <QA id="faq" title="Preguntas de los adultos" faq={LESSON_FAQ}/>
  <div className={styles.endNote}><p className={styles.caption}>{ES_UI.guideFoot}</p><EsCheckedLine date={CHECKED}/></div>
  <EsPlayEnd href={playLessonHref(l.id)} label="Juega esta lección en la isla" bar={`Juega “${l.title}”`}/>
  <EsReadNext order={[{path:INDEX_ES,name:'Lecciones de fútbol para niños'},...ES_LESSONS().map(x=>({path:x.esPath,name:x.title}))]} path={l.esPath}/>
 </>;
}

// ---- the index ----------------------------------------------------------------------------------------------------------------
export const LESSONS_INDEX_ES={title:'Lecciones y pruebas de fútbol para niños',
 desc:`Las ${LESSONS.length} lecciones de fútbol de Futbol Island para niños: posiciones, pases, defensa y reanudaciones en 7v7 a 11v11 y futsal, con pruebas.`};
const LEAD=`${DEFINITION_ES} Aquí están sus ${LESSONS.length} lecciones: posiciones, forma del equipo, pases, defensa y reanudaciones en 7v7, 9v9, 11v11 y futsal, cada una con una prueba corta. En la isla cada lección se juega en una cancha con jugadores que se mueven; aquí puedes leer las palabras del entrenador y las preguntas.`;
/** The plain no-JavaScript search form, to /es/learn?q= (as components/site/LearnSearchForm.tsx). */
function EsSearchForm(){
 return <form role="search" action={toEs('/learn')} method="get" className={fx.searchFormCentred}>
  <label htmlFor="learn-search-q" className={`${styles.caption} ${fx.srOnly}`}>Busca en las guías</label>
  <input id="learn-search-q" name="q" type="search" required placeholder="Busca en las guías: fuera de juego, pared, 4-3-3" enterKeyHint="search" className={fx.searchInput}/>
 </form>;
}
export function LessonsIndexEsPage(){
 const crumbs=esCrumbs(crumbIndex),all=ES_LESSONS();
 const topics=HUBS.map(h=>esHubLink(h.path)).filter((x):x is NonNullable<typeof x>=>!!x);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`Lecciones de fútbol de ${SITE_NAME}`,numberOfItems:all.length,
   itemListElement:all.map((l,i)=>({'@type':'ListItem',position:i+1,name:`${l.title} (${l.formatLabel})`,url:abs(l.esPath)}))}}/>
  <header className={styles.intro}>
   <EsBreadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>Lecciones de fútbol para niños</h1>
   <p className={styles.lead} data-answer="">{LEAD}</p>
   <ParentsLine/>
   <a className={styles.cta} href={PLAY_PATH}>Juega las lecciones en la isla</a>
   <EsSearchForm/>
  </header>
  {topics.length>0&&<section className={styles.section} aria-labelledby="topics"><h2 className={styles.h2} id="topics">Lecciones por tema</h2>
   <ul className={styles.list}>{topics.map(h=><li key={h.path}><a href={h.path}><span className={styles.itemTitle}>{h.name}</span><span className={styles.itemMeta}>{h.blurb}</span></a></li>)}</ul>
  </section>}
  {FORMAT_ORDER.map(f=>{const list=all.filter(l=>l.format===f);return <section key={f} className={styles.section} aria-labelledby={`fmt-${f}`}>
   <h2 className={styles.h2} id={`fmt-${f}`}>Lecciones de {fmtWord(FORMAT_LABEL[f])} <span className={styles.count}>({list.length})</span></h2>
   <ul className={styles.list}>{list.map(l=><li key={l.id}><a href={l.esPath}><span className={styles.itemTitle}>{l.title}</span><span className={styles.itemMeta}>{l.concept}</span></a></li>)}</ul>
  </section>;})}
  <div className={styles.endNote}><p className={styles.caption}>{ES_UI.guideFoot}</p><EsCheckedLine date={CHECKED}/></div>
  <EsPlayEnd label="Juega las lecciones en la isla" bar="Juega las lecciones en la isla"/>
 </>;
}

// ---- the search page (/es/learn?q=) -------------------------------------------------------------------------------------------
export function SearchEsPage(){
 const hubs=[...HUBS.map(h=>esHubLink(h.path)).filter((x):x is NonNullable<typeof x>=>!!x),{path:ES_HUBS.rules.path,name:ES_HUBS.rules.h1},{path:ES_HUBS.terms.path,name:ES_HUBS.terms.h1},
  {path:ES_HUBS.positions.path,name:ES_HUBS.positions.h1},{path:ES_HUBS.formations.path,name:ES_HUBS.formations.h1},{path:INDEX_ES,name:'Lecciones de fútbol para niños'}];
 return <>
  <header className={styles.intro}>
   <EsBreadcrumbs crumbs={esCrumbs({name:'Buscar',path:toEs('/learn')+'?q='})}/>
   <h1 className={styles.title}>Busca en las guías de fútbol</h1>
   <p className={styles.lead} data-answer="">Encuentra una regla, una palabra del fútbol, una posición, una formación, un ejercicio, un plan o una lección, con la respuesta corta.</p>
  </header>
  <LearnSearch lang="es"/>
  <section className={styles.section} aria-labelledby="browse"><h2 className={styles.h2} id="browse">Explora las guías</h2>
   <ul className={styles.list}>{hubs.map(h=><li key={h.path}><a href={h.path}><span className={styles.itemTitle}>{h.name}</span></a></li>)}</ul>
  </section>
 </>;
}

// ---- routes -------------------------------------------------------------------------------------------------------------------
const L=INDEX+'/';
export function lessonsEsRoute(enPath:string):EsRoute|null{
 if(enPath==='/learn')return {meta:()=>({...esMeta('Busca en las guías de fútbol | Futbol Island','Busca en las guías gratis de fútbol de Futbol Island para niños y entrenadores: reglas, términos, posiciones, formaciones, ejercicios, planes y lecciones.','/learn'),
  alternates:{canonical:toEs('/learn')},robots:{index:false,follow:true}}),render:()=><SearchEsPage/>};
 if(!hasEs(enPath))return null;
 if(enPath===INDEX)return {meta:()=>esMeta(LESSONS_INDEX_ES.title,LESSONS_INDEX_ES.desc,enPath),render:()=><LessonsIndexEsPage/>};
 if(enPath.startsWith(L)){const l=esLesson(enPath.slice(L.length));if(!l)return null;
  return {meta:()=>esMeta(lessonTitleEs(l),lessonDescriptionEs(l),enPath),render:()=><LessonEsPage l={l}/>};}
 return null;
}
export const lessonPathEs=(id:string)=>toEs(lessonPath(id));
