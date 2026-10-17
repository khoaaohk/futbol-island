import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {LESSONS,lessonById,lessonPath} from '@/lib/site/lessons';
import {abs,breadcrumbLd,firstSentence,KIDS_AUDIENCE,pageMeta,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import styles from '../../site.module.css';

/** One lesson as plain text. The quiz shows its questions, options and explanations, never which option is correct. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>LESSONS.map(l=>({slug:l.id}));
export function generateMetadata({params}:{params:{slug:string}}){
 const l=lessonById(params.slug);if(!l)return {};
 return pageMeta(`${l.title} (${l.formatLabel} lesson)`,firstSentence(l.concept),lessonPath(l.id));
}
export default function LessonPage({params}:{params:{slug:string}}){
 const l=lessonById(params.slug);if(!l)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Learn',path:'/learn'},{name:l.title,path:lessonPath(l.id)}];
 return <>
  <JsonLd data={{'@context':'https://schema.org','@type':'LearningResource',name:l.title,url:abs(lessonPath(l.id)),description:l.concept,
   inLanguage:'en',isAccessibleForFree:true,educationalLevel:l.difficulty??'Beginner',learningResourceType:['Lesson','Quiz'],
   teaches:l.concept,about:{'@type':'Thing',name:`${l.formatLabel} football`},keywords:[l.formatLabel,l.category,l.chapter].filter(Boolean).join(', '),
   audience:KIDS_AUDIENCE,isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER}}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <Breadcrumbs crumbs={crumbs}/>
  <p className={styles.tag}>{l.formatLabel} lesson{l.chapter?` · ${l.chapter}`:''}{l.difficulty?` · ${l.difficulty}`:''}</p>
  <h1>{l.title}</h1>
  <p className={styles.lead}>{l.concept}</p>
  <p><a className={styles.play} href="/">Play it on the island</a></p>
  <section aria-labelledby="coach"><h2 id="coach">What the coach says</h2>
   <ol>{l.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>
  </section>
  {l.questions.length>0&&<section aria-labelledby="quiz"><h2 id="quiz">Quiz questions</h2>
   <p className={styles.muted}>Try to answer before you read the coach’s explanation. On the island you answer each one on the pitch.</p>
   <ol>{l.questions.map((q,i)=><li key={i} className={styles.card}>
    <h3>{q.q}</h3>
    {q.options.length>0&&<ul className={styles.options}>{q.options.map((o,j)=><li key={j}>{o}</li>)}</ul>}
    {q.explain&&<p><b>Coach’s explanation:</b> {q.explain}</p>}
   </li>)}</ol>
  </section>}
  <p><a href="/learn">All lessons</a></p>
 </>;
}
