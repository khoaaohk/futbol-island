import JsonLd from '@/components/seo/JsonLd';
import ClipPlay from '@/components/site/ClipPlay';
import {QA} from '@/components/site/LessonHub';
import {HUB_COUNTS} from '@/lib/site/hubs';
import {chartBySlug,CHARTS} from '@/lib/site/sizes';
import {TOOLS_HUB} from '@/lib/site/tools/registry';
import {diagramUrl} from '@/lib/site/guides';
import {guideVideo} from '@/lib/site/guideVideos';
import {learnUrl} from '@/lib/site/learnMedia';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {scene} from '@/lib/site/scenes';
import {abs,articleLd,breadcrumbLd,collectionLd,faqLd,KIDS_AUDIENCE,PLAY_PATH,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {hasEs,toEs} from '@/lib/i18n/esPaths';
import {esMeta} from '@/lib/i18n/es/seo';
import {ES_UI} from '@/lib/i18n/es/ui';
import {ES_HUBS} from '@/lib/i18n/es/registry';
import {ES_LESSON_HUB_PATHS,ES_LESSON_HUBS,esHub,TEAM_SIZES_ES,type EsHub} from '@/lib/i18n/es/hubs';
import {CHART_FIELDS_ES,CHARTS_ES,LINKS_ES} from '@/lib/i18n/es/charts';
import {SAFE_FACTS_ES,SAFE_FAQ_ES,SAFE_GUIDE_ES,SAFE_TRUST_LINE_ES,ES_SAFE_GUIDE} from '@/lib/i18n/es/safety';
import {Promises,ShortFaq,TrustTiles} from '@/components/site/PageParts';
import {safePromises,SAFE_TRUST_ES} from '@/components/site/SafeLook';
import {Bullets,DataTable,EsBreadcrumbs,EsGuideEnd,EsIntro,EsSceneDiagram,LinkList,Section,esCrumbs,esLessonLinks} from '@/components/es/EsParts';
import KeepReading from '@/components/site/KeepReading';
import {Band,CardGrid,groupIcon,Hero,lessonIcon} from '@/components/site/HubParts';
import {esLd} from './GuidesEs';
import type {EsRoute} from '../routes';
import styles from '@/app/(site)/site.module.css';
/**
 * Spanish round D (Nov 16 2026): the five lesson hubs (components/site/LessonHub.tsx), the three size charts
 * (app/(site)/learn/ChartView.tsx) and the parents' guide (app/(site)/safe-football-game-for-kids), same sections, markup and
 * classes as English, Spanish words from lib/i18n/es/hubs.ts, charts.ts and safety.ts. Links go to Spanish pages only
 * (English-only targets such as player cards and the games list are left off).
 */
const LESSONS_ES_PATH=toEs('/learn/lessons');
const hubCrumbsEs=(h:{crumb:string;path:string})=>esCrumbs({name:ES_UI.lessons,path:LESSONS_ES_PATH},{name:h.crumb,path:h.path});
const linkEs=(enPath:string,hash='')=>{if(!hasEs(enPath))return null;const w=LINKS_ES[enPath];return w?{path:toEs(enPath)+hash,name:w.name,line:w.line}:null;};
const present=<T,>(xs:(T|null)[])=>xs.filter((x):x is T=>!!x);

/** "See it in the game": GuideVideo with Spanish words (same clip, same markup). Nov 18 2026: no VideoObject here any more; the
 *  clip's one structured-data home is its English watch page (/videos/<slug>, lib/site/videos.ts). No Spanish watch pages yet. */
function GuideVideoEs({enPath,words}:{enPath:string;words?:{name:string;description:string}}){
 const v=guideVideo(enPath);if(!v||!words)return null;
 const id=`clip-${v.key}`;
 return <section className={styles.section} aria-labelledby={id} data-guide-video={v.key}>
  <h2 className={styles.h2} id={id}>Míralo en el juego</h2>
  <ClipPlay name={words.name} poster={learnUrl(v.poster)} webm={v.webm&&learnUrl(v.webm)} mp4={learnUrl(v.mp4!)} width={v.width} height={v.height} describedBy={`${id}-d`} lang="es"/>
  <p className={styles.caption} id={`${id}-d`}>{words.description} {v.seconds} segundos, sin sonido.</p>
 </section>;
}

/** "Más para aprender": the other Spanish hubs, guide hubs, charts, the lessons index and the parents' guide. */
function MoreToLearnEs({except}:{except?:string}){
 const H=ES_HUBS;
 const links=[...ES_LESSON_HUBS().filter(h=>h.enPath!==except).map(h=>({path:h.path,name:h.h1,en:h.enPath})),
  {path:H.rules.path,name:H.rules.h1,en:H.rules.enPath},...CHARTS.map(c=>({path:toEs(c.path),name:CHARTS_ES[c.slug].h1,en:c.path})),
  {path:H.terms.path,name:H.terms.h1,en:H.terms.enPath},{path:H.positions.path,name:H.positions.h1,en:H.positions.enPath},{path:H.formations.path,name:H.formations.h1,en:H.formations.enPath},
  ...(hasEs(TOOLS_HUB.path)?[{path:toEs(TOOLS_HUB.path),name:'Herramientas gratis para entrenadores de fútbol',en:TOOLS_HUB.path}]:[]),
  {path:LESSONS_ES_PATH,name:'Todas las lecciones de fútbol',en:'/learn/lessons'},{path:ES_SAFE_GUIDE.path,name:'Para padres: un juego de fútbol seguro',en:SAFE_GUIDE_ES.enPath}]
  .filter(l=>l.en!==except&&hasEs(l.en));
 return <KeepReading lang="es" id="more" title="Más para aprender" groups={[{id:'more-topics',links:links.map(l=>({path:l.path,name:l.name}))}]}/>;
}

// ---- lesson hubs ------------------------------------------------------------------------------------------------------------------
function LessonHubEs({hub,children}:{hub:EsHub;children?:React.ReactNode}){
 const crumbs=hubCrumbsEs(hub),items=hub.groups.flatMap(g=>g.lessons);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(collectionLd({name:hub.h1,path:hub.path,description:hub.description,published:SITE_UPDATED.hubs,modified:SITE_UPDATED.hubs,
   items:items.map(l=>({name:`${l.title} (${l.formatLabel})`,path:l.esPath}))}))}/>
  <JsonLd data={faqLd(hub.faq)}/>
  <Hero video={guideVideo(hub.enPath)&&hub.video?<GuideVideoEs enPath={hub.enPath} words={hub.video}/>:null}>{/* batch 3, as English (components/site/LessonHub.tsx) */}
  <header className={styles.intro}>
   <EsBreadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{hub.h1}</h1>
   <p className={styles.lead} data-answer="">{hub.lead}</p>
   <p className={styles.caption}>{SAFE_TRUST_LINE_ES} <a href={ES_SAFE_GUIDE.path}>Lee la guía para padres</a>.</p>
   <a className={styles.cta} href={PLAY_PATH}>{ES_UI.playIsland}</a>
  </header>
  </Hero>
  {children}
  {hub.groups.map((g,i)=><Band key={g.title} id={`g-${i}`} title={g.title} line={g.line} tone={i%2?'paper':'tint'} icon={groupIcon(g.lessons)}
   count={hub.showQuestion?`${g.lessons.length} ${g.lessons.length===1?'cuestionario':'cuestionarios'}`:`${g.lessons.length} ${g.lessons.length===1?'lección':'lecciones'}`}>
   <CardGrid lang="es" cards={g.lessons.map(l=>({path:hub.showQuestion?`${l.esPath}#quiz`:l.esPath,name:l.title,icon:lessonIcon(l.category),
    meta:hub.showQuestion?`${l.formatLabel} · ${l.questions.length} ${l.questions.length===1?'pregunta':'preguntas'}`:`Lección de ${l.formatLabel==='Futsal'?'futsal':l.formatLabel}`,line:hub.showQuestion?l.questions[0]?.q:l.concept}))}/>
  </Band>)}
  <QA id="faq" title="Preguntas y respuestas" faq={hub.faq}/>
  <MoreToLearnEs except={hub.enPath}/>
  <p className={styles.end}><a className={styles.cta} href={PLAY_PATH}>{ES_UI.playIsland}</a></p>
 </>;
}
function FutsalExtra(){
 const links=present([{path:toEs('/learn/soccer-rules/futsal-rules')+'#futsal-vs-soccer',name:'Futsal y fútbol: las reglas lado a lado',line:'Saques de banda con el pie, cuatro segundos, sin fuera de juego y faltas acumuladas',en:'/learn/soccer-rules/futsal-rules'},
  {path:toEs('/learn/soccer-formations/futsal-2-2'),name:'Formaciones de futsal',line:'El 2-2, el rombo y el 3-1',en:'/learn/soccer-formations/futsal-2-2'}].map(l=>hasEs(l.en)?l:null));
 return <Section id="futsal-more" title="Reglas y formaciones del futsal"><LinkList links={links}/></Section>;
}
function TeamSizesEs(){
 const T=TEAM_SIZES_ES,links=present(['/learn/soccer-field-size-by-age','/learn/soccer-ball-size-by-age','/learn/7v7-soccer-formations','/learn/9v9-soccer-formations','/learn/11v11-soccer-formations'].map(p=>linkEs(p)));
 return <Section id="compare" title={T.title}>
  <DataTable label={T.title} head={T.head} rows={T.rows}/>
  <p className={styles.caption}>{T.note}</p>
  <LinkList links={links}/>
 </Section>;
}

// ---- size charts ------------------------------------------------------------------------------------------------------------------
function ChartEsPage({slug}:{slug:string}){
 const c=chartBySlug(slug)!,e=CHARTS_ES[slug],path=toEs(c.path),crumbs=hubCrumbsEs({crumb:e.crumb,path});
 const fields=CHART_FIELDS_ES.scenes.map((s,i)=>scene({format:i?'11v11':'7v7',title:s.title,who:'',caption:s.caption}));
 const related=present([...c.links.map(l=>linkEs(l.path)),linkEs('/tools/soccer-playing-time-calculator')]);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(articleLd({headline:e.title,path,description:e.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:e.h1,teaches:e.lead,image:diagramUrl(c.picture)}))}/>
  <JsonLd data={faqLd(e.faq)}/>
  <EsIntro crumbs={crumbs} h1={e.h1} lead={e.lead} more={e.more}/>
  {c.tables.map((t,i)=>{const x=e.tables[i];return <Section key={t.id} id={t.id} title={x.title}>
   {x.intro&&<p>{x.intro}</p>}
   <DataTable label={x.title} head={x.head} rows={x.rows}/>
   <p className={styles.caption}>{x.note}</p>
  </Section>;})}
  {c.fields&&<Section id="fields" title={CHART_FIELDS_ES.title}>
   <div className={styles.pair}>{fields.map((f,i)=><div key={f.title}><h3 className={styles.h3}>{f.title}</h3><EsSceneDiagram id={`f${i}`} scene={f} small/></div>)}</div>
  </Section>}
  {c.sections.map((s,i)=><Section key={s.id} id={s.id} title={e.sections[i].title}><Bullets items={e.sections[i].items}/></Section>)}
  <QA id="faq" title={`Preguntas sobre: ${e.crumb.toLowerCase()}`} faq={e.faq}/>
  <KeepReading lang="es" groups={[{id:'lessons',label:'Lección gratis',icon:'steps',links:esLessonLinks(c.lessons)},{id:'related',links:related}]}/>
  <EsGuideEnd checked={FAMILY_CHECKED.sizes}/>
 </>;
}

// ---- the parents' guide -------------------------------------------------------------------------------------------------------------
function SafeGuideEsPage(){
 const G=SAFE_GUIDE_ES,path=ES_SAFE_GUIDE.path,crumbs=esCrumbs({name:G.crumb,path});
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'WebPage',name:G.h1,url:abs(path),description:G.description,inLanguage:'es',
   dateModified:SITE_UPDATED.hubs,audience:{'@type':'Audience',audienceType:'Padres, cuidadores y entrenadores'},about:{'@type':'VideoGame',name:SITE_NAME,url:abs(PLAY_PATH),audience:KIDS_AUDIENCE},
   isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER}}/>
  <JsonLd data={faqLd(SAFE_FAQ_ES)}/>
  <header className={styles.intro}>
   <EsBreadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{G.h1}</h1>
   <p className={styles.lead} data-answer="">{G.lead(HUB_COUNTS.lessons)}</p>
   <a className={styles.cta} href={PLAY_PATH}>Juega Futbol Island</a>
  </header>
  <TrustTiles items={SAFE_TRUST_ES} label="Futbol Island de un vistazo"/>
  <section className={styles.section} aria-labelledby="facts"><h2 className={styles.h2} id="facts">Lo que los padres deben saber</h2>
   <Promises items={safePromises(SAFE_FACTS_ES,'es')}/>
   <p>Todos los detalles, incluido qué se guarda y por cuánto tiempo, están en la <a href="/privacy">política de privacidad (en inglés)</a>. Hay más sobre quién hace el juego en la página <a href={toEs('/about')}>Quiénes somos</a>.</p>
  </section>
  <ShortFaq id="faq" title="Preguntas que hacen los padres" faq={SAFE_FAQ_ES} more="Más"/>
  <MoreToLearnEs except={G.enPath}/>
  <p className={styles.end}><a className={styles.cta} href={PLAY_PATH}>Juega Futbol Island</a></p>
 </>;
}

// ---- routes -----------------------------------------------------------------------------------------------------------------------
const CHART_BY_PATH=new Map(CHARTS.map(c=>[c.path,c.slug]));
export function hubsEsRoute(enPath:string):EsRoute|null{
 if(ES_LESSON_HUB_PATHS.includes(enPath)){
  const slug=enPath.replace(/^\/learn\//,''),h=esHub(slug)!;
  const extra=slug==='futsal-for-kids'?<FutsalExtra/>:slug==='7v7-9v9-11v11'?<TeamSizesEs/>:null;
  return {meta:()=>esMeta(h.title,h.description,enPath),render:()=><LessonHubEs hub={h}>{extra}</LessonHubEs>};
 }
 const chart=CHART_BY_PATH.get(enPath);
 if(chart){const c=chartBySlug(chart)!,e=CHARTS_ES[chart];
  return {meta:()=>esMeta(e.title,e.description,enPath,{url:diagramUrl(c.picture),alt:e.pictureTitle}),render:()=><ChartEsPage slug={chart}/>};}
 if(enPath===SAFE_GUIDE_ES.enPath)return {meta:()=>esMeta(SAFE_GUIDE_ES.title,SAFE_GUIDE_ES.description,enPath),render:()=><SafeGuideEsPage/>};
 return null;
}
