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
import {meshLinks} from '@/lib/site/mesh';
import {HUB_COMMON_FAQ,SAFE_TRUST_LINE} from '@/lib/site/safety';
import {LESSON_DATA_UPDATED,SITE_PUBLISHED,SITE_UPDATED} from '@/lib/site/updated';
import {formatPhrase,LESSONS,lessonById,lessonDescription,lessonPath,lessonTitle} from '@/lib/site/lessons';
import {breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {lessonLd} from '@/lib/site/learningLd';
import {CoachChapters,LearnCard,QuizCards} from '@/components/site/lessons/LessonParts';
import lx from '@/components/site/lessons/lesson.module.css';
import styles from '../../../site.module.css';
import RailNav from '@/components/site/shell/RailNav';
import {lessonRail} from '@/lib/site/railNavMore';
import rt from '@/components/site/railTarget.module.css';
import {libraryCrumbs} from '@/lib/site/libraryPath';

/** One lesson as plain text with pictures from its own data (components/site/lessons). The quiz shows its questions, options and explanations, never which option is correct. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>LESSONS.map(l=>({slug:l.id}));
export function generateMetadata({params}:{params:{slug:string}}){
 const l=lessonById(params.slug);if(!l)return {};
 return pageMeta(lessonTitle(l),lessonDescription(l),lessonPath(l.id),{whole:true});
}
export default function LessonPage({params}:{params:{slug:string}}){
 const l=lessonById(params.slug);if(!l)notFound();
 const crumbs=libraryCrumbs({name:'Lessons',path:'/learn/lessons'},{name:l.title,path:lessonPath(l.id)});/* Nov 20 2026: through the Library *//* no /learn crumb: it redirects to / */
 const guides=guidesForLesson(l.id);/* formations and positions pages that teach from this lesson (lib/site/guides.ts) */
 const sib=lessonSiblings(l),hubs=hubsFor(l.id),mesh=meshLinks(lessonPath(l.id),{skip:[...[...sib.same,sib.prev,sib.next].map(x=>lessonPath(x.id)),...hubs.map(h=>h.path),...guides.map(g=>g.path)]}),faq=[{q:'How do I play this lesson?',a:'Open Futbol Island at futbolisland.app/play and start an island or continue with a save code. In the game, a coach voice shows each idea on a pitch with moving players, step by step, and a quick quiz checks it.'},...HUB_COMMON_FAQ];
 return <>
  <JsonLd data={lessonLd({name:l.title,path:lessonPath(l.id),description:l.concept,teaches:l.concept,level:l.difficulty,about:`${l.formatLabel} football`,keywords:[l.formatLabel,l.category,l.chapter].filter(Boolean).join(', '),published:SITE_PUBLISHED,modified:LESSON_DATA_UPDATED>SITE_UPDATED.lessons?LESSON_DATA_UPDATED:SITE_UPDATED.lessons})}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={faqLd(faq)}/>
  <RailNav rail={lessonRail({quiz:l.questions.length>0,hubs:hubs.length>0,guides:guides.length>0})} current="#top"/>
  <header className={`${styles.intro} ${rt.target}`} id="top">
   <Breadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{l.title}</h1>
   {/* Nov 17 2026 (visual pass): the concept and the old eyebrow's format / chapter / level now live in the learn card's facts. */}
   <LearnCard lang="en" id={l.id} concept={l.concept} formatLabel={l.formatLabel} difficulty={l.difficulty} questions={l.questions.length} chapter={l.chapter}/>
   <p>{l.title} is a free {formatPhrase(l.formatLabel)} lesson and quiz for kids aged 7 to 12 in Futbol Island, a learning game played in the web browser.</p>
   <p className={styles.caption}>{SAFE_TRUST_LINE} <a href={SAFE_GUIDE.path}>Read the parents’ guide</a>.</p>
   <a className={styles.cta} href={playLessonHref(l.id)} data-play-cta="">Play this lesson</a>
  </header>
  <section className={`${styles.section} ${lx.wide}`} aria-labelledby="coach"><h2 className={`${styles.h2} ${rt.target}`} id="coach">What the coach says</h2>
   <CoachChapters lang="en" id={l.id} format={l.format} formatLabel={l.formatLabel} steps={l.steps}/>
  </section>
  {l.questions.length>0&&<section className={`${styles.section} ${lx.wide}`} aria-labelledby="quiz"><h2 className={`${styles.h2} ${rt.target}`} id="quiz">Quiz questions</h2>
   <p className={styles.caption}>Try to answer before you open the coach’s explanation. On the island you answer each one on the pitch.</p>
   <QuizCards lang="en" questions={l.questions}/>
  </section>}
  {/* Nov 14 2026 (seo-boost): sibling lessons (lib/site/related.ts lessonSiblings), so every lesson links to its neighbours. */}
  <section className={styles.section} aria-labelledby="siblings"><h2 className={`${styles.h2} ${rt.target}`} id="siblings">Keep going: {sib.groupName}</h2>
   <ul className={styles.list}>{[...sib.same.map(x=>({x,tag:''})),{x:sib.prev,tag:'Previous lesson · '},{x:sib.next,tag:'Next lesson · '}].map(({x,tag})=><li key={x.id}><a href={lessonPath(x.id)}><span className={styles.itemTitle}>{x.title}</span><span className={styles.itemMeta}>{tag}{x.concept}</span></a></li>)}
    {/* Nov 21 2026 (linking mesh, lib/site/mesh.ts): the closest other lessons and 2-3 guide pages on the same idea */}
    {mesh.map(m=><li key={m.path} data-mesh=""><a href={m.path}><span className={styles.itemTitle}>{m.name}</span>{m.line&&<span className={styles.itemMeta}>{m.line}</span>}</a></li>)}</ul>
  </section>
  {hubs.length>0&&<section className={styles.section} aria-labelledby="related"><h2 className={`${styles.h2} ${rt.target}`} id="related">More lessons like this</h2>
   <ul className={styles.list}>{hubs.map(h=><li key={h.path}><a href={h.path}><span className={styles.itemTitle}>{h.h1}</span></a></li>)}</ul>
  </section>}
  {guides.length>0&&<section className={styles.section} aria-labelledby="guides"><h2 className={`${styles.h2} ${rt.target}`} id="guides">Related guides</h2>
   <ul className={styles.list}>{guides.map(g=><li key={g.path}><a href={g.path}><span className={styles.itemTitle}>{g.name[0].toUpperCase()+g.name.slice(1)}</span></a></li>)}</ul>
  </section>}
  <QA id="faq" title="Questions grown-ups ask" faq={faq}/>
  <PlayEnd href={playLessonHref(l.id)} label="Play this lesson on the island" bar={`Play “${l.title}”`}/>
  <ReadNext path={lessonPath(l.id)}/>
 </>;
}
