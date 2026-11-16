import ReadNext from '@/components/site/ReadNext';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {PlayEnd} from '@/lib/site/GuideParts';
import {playLessonHref} from '@/lib/site/playLinks';
import {QA} from '@/components/site/LessonHub';
import {hubsFor,SAFE_GUIDE} from '@/lib/site/hubs';
import {guidesForLesson} from '@/lib/site/guides';
import {lessonSiblings} from '@/lib/site/related';
import {HUB_COMMON_FAQ,SAFE_TRUST_LINE} from '@/lib/site/safety';
import {LESSON_DATA_UPDATED,SITE_PUBLISHED,SITE_UPDATED} from '@/lib/site/updated';
import {formatPhrase,LESSONS,lessonById,lessonDescription,lessonPath,lessonTitle} from '@/lib/site/lessons';
import {breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {lessonLd} from '@/lib/site/learningLd';
import styles from '../../../site.module.css';

/** One lesson as plain text. The quiz shows its questions, options and explanations, never which option is correct. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>LESSONS.map(l=>({slug:l.id}));
export function generateMetadata({params}:{params:{slug:string}}){
 const l=lessonById(params.slug);if(!l)return {};
 return pageMeta(lessonTitle(l),lessonDescription(l),lessonPath(l.id),{whole:true});
}
export default function LessonPage({params}:{params:{slug:string}}){
 const l=lessonById(params.slug);if(!l)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Lessons',path:'/learn/lessons'},{name:l.title,path:lessonPath(l.id)}];/* no /learn crumb: it redirects to / */
 const guides=guidesForLesson(l.id);/* formations and positions pages that teach from this lesson (lib/site/guides.ts) */
 const sib=lessonSiblings(l),hubs=hubsFor(l.id),faq=[{q:'How do I play this lesson?',a:'Open Futbol Island at futbolisland.app/play and start an island or continue with a save code. In the game, a coach voice shows each idea on a pitch with moving players, step by step, and a quick quiz checks it.'},...HUB_COMMON_FAQ];
 return <>
  <JsonLd data={lessonLd({name:l.title,path:lessonPath(l.id),description:l.concept,teaches:l.concept,level:l.difficulty,about:`${l.formatLabel} football`,keywords:[l.formatLabel,l.category,l.chapter].filter(Boolean).join(', '),published:SITE_PUBLISHED,modified:LESSON_DATA_UPDATED>SITE_UPDATED.lessons?LESSON_DATA_UPDATED:SITE_UPDATED.lessons,questions:l.questions})}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={faqLd(faq)}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={crumbs}/>
   <p className={styles.eyebrow}>{l.formatLabel} lesson{l.chapter?` · ${l.chapter}`:''}{l.difficulty?` · ${l.difficulty}`:''}</p>
   <h1 className={styles.title}>{l.title}</h1>
   <p className={styles.lead}>{l.concept}</p>
   <p>{l.title} is a free {formatPhrase(l.formatLabel)} lesson and quiz for kids aged 7 to 12 in Futbol Island, a learning game played in the web browser.</p>
   <p className={styles.caption}>{SAFE_TRUST_LINE} <a href={SAFE_GUIDE.path}>Read the parents’ guide</a>.</p>
   <a className={styles.cta} href={playLessonHref(l.id)} data-play-cta="">Play this lesson</a>
  </header>
  <section className={styles.section} aria-labelledby="coach"><h2 className={styles.h2} id="coach">What the coach says</h2>
   <div className={styles.card}><ol>{l.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></div>
  </section>
  {l.questions.length>0&&<section className={styles.section} aria-labelledby="quiz"><h2 className={styles.h2} id="quiz">Quiz questions</h2>
   <p className={styles.caption}>Try to answer before you read the coach’s explanation. On the island you answer each one on the pitch.</p>
   <ol className={styles.stack}>{l.questions.map((q,i)=><li key={i} className={styles.card}>
    <p className={styles.eyebrow}>Question {i+1}</p>
    <h3 className={styles.h3}>{q.q}</h3>
    {q.options.length>0&&<ul className={styles.options}>{q.options.map((o,j)=><li key={j}>{o}</li>)}</ul>}
    {q.explain&&<p><b>Coach’s explanation:</b> {q.explain}</p>}
   </li>)}</ol>
  </section>}
  {/* Nov 14 2026 (seo-boost): sibling lessons (lib/site/related.ts lessonSiblings), so every lesson links to its neighbours. */}
  <section className={styles.section} aria-labelledby="siblings"><h2 className={styles.h2} id="siblings">Keep going: {sib.groupName}</h2>
   <ul className={styles.list}>{[...sib.same.map(x=>({x,tag:''})),{x:sib.prev,tag:'Previous lesson · '},{x:sib.next,tag:'Next lesson · '}].map(({x,tag})=><li key={x.id}><a href={lessonPath(x.id)}><span className={styles.itemTitle}>{x.title}</span><span className={styles.itemMeta}>{tag}{x.concept}</span></a></li>)}</ul>
  </section>
  {hubs.length>0&&<section className={styles.section} aria-labelledby="related"><h2 className={styles.h2} id="related">More lessons like this</h2>
   <ul className={styles.list}>{hubs.map(h=><li key={h.path}><a href={h.path}><span className={styles.itemTitle}>{h.h1}</span></a></li>)}</ul>
  </section>}
  {guides.length>0&&<section className={styles.section} aria-labelledby="guides"><h2 className={styles.h2} id="guides">Related guides</h2>
   <ul className={styles.list}>{guides.map(g=><li key={g.path}><a href={g.path}><span className={styles.itemTitle}>{g.name[0].toUpperCase()+g.name.slice(1)}</span></a></li>)}</ul>
  </section>}
  <QA id="faq" title="Questions grown-ups ask" faq={faq}/>
  <PlayEnd href={playLessonHref(l.id)} label="Play this lesson on the island" bar={`Play “${l.title}”`}/>
  <ReadNext path={lessonPath(l.id)}/>
 </>;
}
