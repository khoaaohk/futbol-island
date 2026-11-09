import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {FORMAT_LABEL,FORMAT_ORDER,LESSONS,lessonPath} from '@/lib/site/lessons';
import {abs,breadcrumbLd,pageMeta,SITE_NAME} from '@/lib/site/seo';
import {DEFINITION,HUBS,SAFE_GUIDE} from '@/lib/site/hubs';
import {SAFE_TRUST_LINE} from '@/lib/site/safety';
import styles from '../../site.module.css';

export const dynamic='force-static';
const DESC=`All ${LESSONS.length} Futbol Island football lessons for kids: positions, team shape, passing, defending and restarts in 7v7, 9v9, 11v11 and futsal, each with a short quiz.`;
// the search-result description is kept under 155 characters; the page lead stays the full sentence
const META=`All ${LESSONS.length} Futbol Island football lessons for kids: positions, passing, defending and restarts in 7v7 to 11v11 and futsal, with quizzes.`;
export const metadata=pageMeta('Football Lessons and Quizzes for Kids',META,'/learn/lessons');
const CRUMBS=[{name:'Home',path:'/'},{name:'Lessons',path:'/learn/lessons'}];/* no /learn crumb: it redirects to / */

export default function LearnIndex(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`${SITE_NAME} football lessons`,numberOfItems:LESSONS.length,
   itemListElement:LESSONS.map((l,i)=>({'@type':'ListItem',position:i+1,name:`${l.title} (${l.formatLabel})`,url:abs(lessonPath(l.id))}))}}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>Football lessons for kids</h1>
   <p className={styles.lead}>{DEFINITION} {DESC} On the island each lesson plays out on a real pitch with moving players; here you can read the coach’s words and the quiz questions.</p>
   <p className={styles.caption}>{SAFE_TRUST_LINE} <a href={SAFE_GUIDE.path}>Read the parents’ guide</a>.</p>
   <a className={styles.cta} href="/play">Play the lessons on the island</a>
  </header>
  <section className={styles.section} aria-labelledby="topics"><h2 className={styles.h2} id="topics">Lessons by topic</h2>
   <ul className={styles.list}>{HUBS.map(h=><li key={h.path}><a href={h.path}><span className={styles.itemTitle}>{h.h1}</span><span className={styles.itemMeta}>{h.blurb}</span></a></li>)}</ul>
  </section>
  {FORMAT_ORDER.map(f=>{const list=LESSONS.filter(l=>l.format===f);return <section key={f} className={styles.section} aria-labelledby={`fmt-${f}`}>
   <h2 className={styles.h2} id={`fmt-${f}`}>{FORMAT_LABEL[f]} lessons <span className={styles.count}>({list.length})</span></h2>
   <ul className={styles.list}>{list.map(l=><li key={l.id}><a href={lessonPath(l.id)}><span className={styles.itemTitle}>{l.title}</span><span className={styles.itemMeta}>{l.concept}</span></a></li>)}</ul>
  </section>;})}
 </>;
}
