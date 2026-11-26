import JsonLd from '@/components/seo/JsonLd';
import LearnSearch from '@/components/site/LearnSearch';
import {FORMAT_LABEL,FORMAT_ORDER,LESSONS,lessonPath} from '@/lib/site/lessons';
import {playLessonHref} from '@/lib/site/playLinks';
import {hubsFor,HUBS} from '@/lib/site/hubs';
import {guidesForLesson} from '@/lib/site/guides';
import {lessonSiblings} from '@/lib/site/related';
import {meshLinks} from '@/lib/site/mesh';
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
import {esDrill,esDrillGuide,esDrillLinksFor,drillLineEs} from '@/lib/i18n/es/drillsRegistry';
import {ES_UI} from '@/lib/i18n/es/ui';
import {EsBreadcrumbs,EsCheckedLine,EsPlayEnd,EsPrintSheet,EsReadNext,QA,esCrumbs,esLibCrumbs} from '@/components/es/EsParts';
import {esLd} from './GuidesEs';
import type {EsRoute} from '../routes';
import {CoachChapters,LearnCard} from '@/components/site/lessons/LessonParts';
import LessonQuiz from '@/components/site/lessons/LessonQuiz';
import lx from '@/components/site/lessons/lesson.module.css';
import styles from '@/app/(site)/site.module.css';
import fx from '@/components/site/siteForms.module.css';
import RailNav from '@/components/site/shell/RailNav';
import {lessonRail,lessonsIndexRail} from '@/lib/site/railNavMore';
import rt from '@/components/site/railTarget.module.css';
import HubQuizLinks from '@/components/site/quiz/HubQuizLinks';
/**
 * The Spanish lessons (Spanish round D, Nov 16 2026): /es/learn/lessons (index), /es/learn/lessons/<id> (96 reading pages) and
 * the Spanish guide search /es/learn?q= (not a sitemap page; noindex, like /learn). Same sections and classes as
 * app/(site)/learn/lessons/*, Spanish words from lib/i18n/es/lessons.ts. A lesson page plays its quiz in place with the answer key
 * below (Nov 23 2026, components/site/lessons/LessonQuiz, as in English). The game itself is English for now; the page says so.
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
/* Nov 23 2026 (seo-unindexed): Google crawled the Spanish lesson pages and did not index them; they were the Spanish family with the
   most shared template text (the same three FAQs on all 97 pages, one intro pattern, no drill to run at practice). Each page now gets a
   lesson-specific intro, key points from its own quiz explanations, drills to practise it, the format's Spanish names (fútbol 7,
   fútbol sala…) and a FAQ whose first answers come from the lesson's own data. */
const FORMAT_CONTEXT_ES:Readonly<Record<string,{line:string;path:string;name:string}>>={
 '7v7':{line:'En Estados Unidos el 7v7 es el partido de U9 y U10; en España y en buena parte de Latinoamérica este formato se llama fútbol 7 y es el más común en las categorías infantiles.',path:'/learn/7v7-soccer-formations',name:'Formaciones de fútbol 7 (7v7)'},
 '9v9':{line:'En Estados Unidos el 9v9 es el partido de U11 y U12, el paso entre el fútbol 7 y el fútbol 11; en otros países se le dice fútbol 9, y algunas ligas usan el fútbol 8 para ese mismo paso.',path:'/learn/9v9-soccer-formations',name:'Formaciones de fútbol 9 (9v9)'},
 '11v11':{line:'El 11v11 es el fútbol 11, el partido completo en la cancha grande, que en Estados Unidos empieza en U13.',path:'/learn/11v11-soccer-formations',name:'Formaciones de fútbol 11 (11v11)'},
 futsal:{line:'En España se llama fútbol sala; en Latinoamérica, futsal o fútbol de salón. Se juega cinco contra cinco en una cancha dura, con un balón más pesado que rebota menos.',path:'/learn/futsal-for-kids',name:'Futsal para niños'}};
const fmtKey=(f:string)=>/futsal/i.test(f)?'futsal':f;
/** Drills that practise a lesson: the drill page its guide list names, then the drills tied to its rule/term guides, then the drill guide for its topic. */
const TOPIC_GUIDE:Readonly<Record<string,string>>={Attacking:'passing',Defending:'defending',Finishing:'shooting',Transition:'passing','Set Piece':'first-touch','Rules of the Game':'passing'};
function lessonDrillsEs(l:EsLesson):{path:string;name:string;line?:string}[]{
 const out:{path:string;name:string;line?:string}[]=[],seen=new Set<string>(),add=(x:{path:string;name:string;line?:string}|null)=>{if(x&&!seen.has(x.path)){seen.add(x.path);out.push(x);}};
 const D='/learn/soccer-drills/';
 for(const g of guidesForLesson(l.id)){
  if(g.path.startsWith(D)){const s=g.path.slice(D.length),d=esDrill(s);if(d)add({path:d.esPath,name:`${d.name} (ejercicio)`,line:drillLineEs(d)});else{const gg=esDrillGuide(s);if(gg)add({path:gg.esPath,name:gg.h1});}}
  else for(const x of esDrillLinksFor(g.path))add(x);
 }
 const t=esDrillGuide(TOPIC_GUIDE[l.category??'']??(fmtKey(l.format)==='futsal'?'first-touch':'passing'));if(t)add({path:t.esPath,name:t.h1});
 return out.slice(0,4);
}
const firstSentenceEs=(s:string)=>{const m=s.match(/^.*?[.!?](\s|$)/);return (m?m[0]:s).trim();};
function lessonIntroEs(l:EsLesson){
 const f=formatPhraseEs(l.formatLabel),lvl=l.difficultyEs?` de nivel ${l.difficultyEs.toLowerCase()}`:'',topic=l.categoryEs?` sobre ${l.categoryEs.toLowerCase()}`:l.chapterEs?` del capítulo “${l.chapterEs}”`:'';
 return `En “${l.title}”, una lección de ${f}${lvl}${topic} para niños de 7 a 12 años, la idea es esta: ${l.concept.replace(/^(\p{Lu})(?=\p{Ll})/u,c=>c.toLowerCase())} El entrenador la explica en ${l.steps.length} ${l.steps.length===1?'paso':'pasos'} y ${l.questions.length>0?`${l.questions.length} ${l.questions.length===1?'pregunta la repasa':'preguntas la repasan'}`:'la cancha la muestra'}.`;
}
function lessonFaqEs(l:EsLesson,drills:{name:string;line?:string}[]){
 const f=formatPhraseEs(l.formatLabel),ctx=FORMAT_CONTEXT_ES[fmtKey(l.format)];
 const own=[{q:`¿Qué aprende un niño en “${l.title}”?`,a:`${l.concept} Es una lección de ${f}${l.categoryEs?` sobre ${l.categoryEs.toLowerCase()}`:''}${l.difficultyEs?`, de nivel ${l.difficultyEs.toLowerCase()}`:''}, con ${l.steps.length} pasos del entrenador${l.questions.length?` y ${l.questions.length} preguntas de prueba`:''}.`}];
 if(drills.length)own.push({q:`¿Cómo se practica “${l.title}” en el entrenamiento?`,a:`Lleva la idea a la cancha con ${drills.slice(0,2).map(d=>d.name.replace(/ \(ejercicio\)$/,'')).join(' o ')}. ${drills[0].line??''} Antes de empezar, repite en voz alta la idea de la lección: ${firstSentenceEs(l.concept)}`.replace(/\s+/g,' ').trim()});
 if(ctx)own.push({q:`¿Sirve esta lección si mi hijo juega ${fmtKey(l.format)==='futsal'?'fútbol sala':fmtKey(l.format)==='7v7'?'fútbol 7':fmtKey(l.format)==='9v9'?'fútbol 9 o fútbol 8':'fútbol 11'}?`,a:`Sí. ${ctx.line} La lección usa ese mismo número de jugadores, así que la idea se puede llevar tal cual al partido del fin de semana.`});
 return [...own,...LESSON_FAQ];
}
const LESSON_FAQ=[{q:'¿Cómo juego esta lección?',a:'Abre Futbol Island en futbolisland.app/play y empieza una isla o sigue con un código de guardado. En el juego, la voz de un entrenador muestra cada idea en una cancha con jugadores que se mueven, paso a paso, y una prueba rápida la repasa. El juego está en inglés por ahora.'},...HUB_COMMON_FAQ_ES];
export function LessonEsPage({l}:{l:EsLesson}){
 const crumbs=esLibCrumbs(crumbIndex,{name:l.title,path:l.esPath});
 const sib=lessonSiblings(l),same=sib.same.map(x=>({x:esLesson(x.id)!,tag:''})),prev=esLesson(sib.prev.id)!,next=esLesson(sib.next.id)!;
 const fw=fmtWord(l.formatLabel),group=l.categoryEs?`Más lecciones de ${l.categoryEs.toLowerCase()} en ${fw}`:l.chapterEs?`Más lecciones de ${fw}: ${l.chapterEs.toLowerCase()}`:`Más lecciones de ${fw}`;
 const hubs=hubsFor(l.id).map(h=>esHubLink(h.path)).filter((x):x is NonNullable<typeof x>=>!!x);
 const guides=guidesForLesson(l.id).map(g=>guideLinkEs(g.path)).filter((x):x is NonNullable<typeof x>=>!!x);
 const drills=lessonDrillsEs(l),faq=lessonFaqEs(l,drills),ctx=FORMAT_CONTEXT_ES[fmtKey(l.format)];
 const keys=l.questions.map(q=>firstSentenceEs(q.explain)).filter((x,i,a)=>x.length>45&&a.indexOf(x)===i).slice(0,4);
 const mesh=meshLinks(lessonPath(l.id),{lang:'es',skip:[...[...sib.same,sib.prev,sib.next].map(x=>lessonPath(x.id)),...hubs.map(h=>h.path),...guides.map(g=>g.path)]});
 return <>
  <JsonLd data={esLd(lessonLd({name:l.title,path:l.esPath,description:l.concept,teaches:l.concept,level:l.difficulty,about:formatPhraseEs(l.formatLabel),
   keywords:[l.formatLabel,l.categoryEs,l.chapterEs].filter(Boolean).join(', '),published:SITE_PUBLISHED,modified:CHECKED}))}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={faqLd(faq)}/>
  <RailNav rail={lessonRail({quiz:l.questions.length>0,hubs:hubs.length>0,guides:guides.length>0},true)} current="#top"/>
  <header className={`${styles.intro} ${rt.target}`} id="top">
   <EsBreadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{l.title}</h1>
   <LearnCard lang="es" id={l.id} concept={l.concept} formatLabel={fmtWord(l.formatLabel)} difficulty={l.difficulty} difficultyLabel={l.difficultyEs} questions={l.questions.length} chapter={l.chapterEs} answer/>
   <p>{lessonIntroEs(l)} {ctx?ctx.line:''}</p>
   <p>Es gratis en Futbol Island, un juego para aprender fútbol que se juega en el navegador. El juego está en inglés por ahora; esta página tiene toda la lección en español.</p>
   <ParentsLine/>
   <a className={styles.cta} href={playLessonHref(l.id)} rel="nofollow" data-play-cta="">Juega esta lección</a>
  </header>
  <EsPrintSheet path={l.esPath} what="hoja de la lección" has="la idea, los pasos y las preguntas"/>
  {keys.length>0&&<section className={styles.section} aria-labelledby="keys"><h2 className={styles.h2} id="keys">Puntos clave de la lección</h2>
   <ul>{keys.map(k=><li key={k}>{k}</li>)}</ul>
  </section>}
  <section className={`${styles.section} ${lx.wide}`} aria-labelledby="coach"><h2 className={`${styles.h2} ${rt.target}`} id="coach">Lo que dice el entrenador</h2>
   <CoachChapters lang="es" id={l.id} format={l.format} formatLabel={fmtWord(l.formatLabel)} steps={l.steps}/>
  </section>
  {l.questions.length>0&&<section className={`${styles.section} ${lx.wide}`} aria-labelledby="quiz"><h2 className={`${styles.h2} ${rt.target}`} id="quiz">Preguntas de la prueba</h2>
   <p className={styles.caption}>Toca una respuesta y luego Comprobar. En la isla respondes cada una en la cancha.</p>
   <LessonQuiz lang="es" id={l.id} name={`Quiz de “${l.title}”`} url={abs(l.esPath)} questions={l.questions}
    more={guides[0]?{href:guides[0].path,name:guides[0].name}:{href:playLessonHref(l.id),name:'Juega esta lección en la isla'}}/>
  </section>}
  <section className={styles.section} aria-labelledby="siblings"><h2 className={`${styles.h2} ${rt.target}`} id="siblings">{group}</h2>
   <ul className={styles.list}>{[...same,{x:prev,tag:'Lección anterior · '},{x:next,tag:'Lección siguiente · '}].map(({x,tag})=><li key={x.id}><a href={x.esPath}><span className={styles.itemTitle}>{x.title}</span><span className={styles.itemMeta}>{tag}{x.concept}</span></a></li>)}
    {/* Nov 21 2026 (linking mesh, lib/site/mesh.ts): as English, in Spanish */}
    {mesh.map(m=><li key={m.path} data-mesh=""><a href={m.path}><span className={styles.itemTitle}>{m.name}</span>{m.line&&<span className={styles.itemMeta}>{m.line}</span>}</a></li>)}</ul>
  </section>
  {hubs.length>0&&<section className={styles.section} aria-labelledby="related"><h2 className={`${styles.h2} ${rt.target}`} id="related">Más lecciones como esta</h2>
   <ul className={styles.list}>{hubs.map(h=><li key={h.path}><a href={h.path}><span className={styles.itemTitle}>{h.name}</span></a></li>)}</ul>
  </section>}
  {guides.length>0&&<section className={styles.section} aria-labelledby="guides"><h2 className={`${styles.h2} ${rt.target}`} id="guides">Guías relacionadas</h2>
   <ul className={styles.list}>{guides.map(g=><li key={g.path}><a href={g.path}><span className={styles.itemTitle}>{g.name}</span></a></li>)}</ul>
  </section>}
  {drills.length>0&&<section className={styles.section} aria-labelledby="practice"><h2 className={styles.h2} id="practice">Practícalo en el entrenamiento</h2>
   <p className={styles.caption}>Ejercicios en español para llevar “{l.title}” a la cancha con tu equipo o en casa.</p>
   <ul className={styles.list}>{drills.map(d=><li key={d.path}><a href={d.path}><span className={styles.itemTitle}>{d.name}</span>{d.line&&<span className={styles.itemMeta}>{d.line}</span>}</a></li>)}
    {ctx&&hasEs(ctx.path)&&<li><a href={toEs(ctx.path)}><span className={styles.itemTitle}>{ctx.name}</span></a></li>}</ul>
  </section>}
  <QA id="faq" title={`Preguntas sobre “${l.title}”`} faq={faq}/>
  <div className={styles.endNote}><p className={styles.caption}>{ES_UI.guideFoot}</p><EsCheckedLine date={CHECKED}/></div>
  <EsPlayEnd href={playLessonHref(l.id)} label="Juega esta lección en la isla" bar={`Juega “${l.title}”`}/>
  <EsReadNext order={[{path:INDEX_ES,name:'Lecciones de fútbol para niños'},...ES_LESSONS().map(x=>({path:x.esPath,name:x.title}))]} path={l.esPath}/>
 </>;
}

// ---- the index ----------------------------------------------------------------------------------------------------------------
export const LESSONS_INDEX_ES={title:'Lecciones de fútbol para niños gratis, con preguntas'/* SEO batch E, Nov 25 2026; was "Lecciones y pruebas de fútbol para niños" */,
 desc:`Las ${LESSONS.length} lecciones de fútbol de Futbol Island para niños: posiciones, pases, defensa y reanudaciones en 7v7 a 11v11 y futsal, con pruebas.`};
const LEAD=`Las ${LESSONS.length} lecciones de fútbol para niños de Futbol Island: posiciones, forma del equipo, pases, defensa y reanudaciones en 7v7, 9v9, 11v11 y futsal, cada una con una prueba corta. ${DEFINITION_ES} En la isla cada lección se juega en una cancha con jugadores que se mueven; aquí puedes leer las palabras del entrenador y las preguntas.`;
/** The plain no-JavaScript search form, to /es/learn?q= (as components/site/LearnSearchForm.tsx). */
function EsSearchForm(){
 return <form role="search" action={toEs('/learn')} method="get" className={fx.searchFormCentred}>
  <label htmlFor="learn-search-q" className={`${styles.caption} ${fx.srOnly}`}>Busca en las guías</label>
  <input id="learn-search-q" name="q" type="search" required placeholder="Busca en las guías: fuera de juego, pared, 4-3-3" enterKeyHint="search" className={fx.searchInput}/>
 </form>;
}
export function LessonsIndexEsPage(){
 const crumbs=esLibCrumbs(crumbIndex),all=ES_LESSONS();
 const topics=HUBS.map(h=>esHubLink(h.path)).filter((x):x is NonNullable<typeof x>=>!!x);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`Lecciones de fútbol de ${SITE_NAME}`,numberOfItems:all.length,
   itemListElement:all.map((l,i)=>({'@type':'ListItem',position:i+1,name:`${l.title} (${l.formatLabel})`,url:abs(l.esPath)}))}}/>
  <RailNav rail={lessonsIndexRail(null,true)} current="#top"/>
  <header className={`${styles.intro} ${rt.target}`} id="top">
   <EsBreadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>Lecciones de fútbol para niños</h1>
   <p className={styles.lead} data-answer="">{LEAD}</p>
   <ParentsLine/>
   <a className={styles.cta} href={PLAY_PATH}>Juega las lecciones en la isla</a>
   <EsSearchForm/>
  </header>
  {topics.length>0&&<section className={styles.section} aria-labelledby="topics"><h2 className={`${styles.h2} ${rt.target}`} id="topics">Lecciones por tema</h2>
   <ul className={styles.list}>{topics.map(h=><li key={h.path}><a href={h.path}><span className={styles.itemTitle}>{h.name}</span><span className={styles.itemMeta}>{h.blurb}</span></a></li>)}</ul>
  </section>}
  <HubQuizLinks slug="lessons" lang="es"/>{/* SEO batch E */}
  {FORMAT_ORDER.map(f=>{const list=all.filter(l=>l.format===f);return <section key={f} className={styles.section} aria-labelledby={`fmt-${f}`}>
   <h2 className={`${styles.h2} ${rt.target}`} id={`fmt-${f}`}>Lecciones de {fmtWord(FORMAT_LABEL[f])} <span className={styles.count}>({list.length})</span></h2>
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
