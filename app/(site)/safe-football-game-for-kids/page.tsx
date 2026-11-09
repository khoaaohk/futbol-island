import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {MoreToLearn,QA} from '@/components/site/LessonHub';
import {DEFINITION,HUB_COUNTS,SAFE_GUIDE} from '@/lib/site/hubs';
import {SAFE_FACTS,SAFE_FAQ} from '@/lib/site/safety';
import {abs,breadcrumbLd,faqLd,KIDS_AUDIENCE,pageMeta,PLAY_PATH,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../site.module.css';

/** The parents' guide (SEO, Nov 8 2026): only the verified safety facts (lib/site/safety.ts, each one in the privacy policy). */
export const dynamic='force-static';
export const metadata=pageMeta(SAFE_GUIDE.title,SAFE_GUIDE.description,SAFE_GUIDE.path);
const CRUMBS=[{name:'Home',path:'/'},{name:SAFE_GUIDE.crumb,path:SAFE_GUIDE.path}];

export default function SafeGuide(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'WebPage',name:SAFE_GUIDE.h1,url:abs(SAFE_GUIDE.path),description:SAFE_GUIDE.description,inLanguage:'en',
   dateModified:SITE_UPDATED.hubs,audience:{'@type':'Audience',audienceType:'Parents, carers and coaches'},about:{'@type':'VideoGame',name:SITE_NAME,url:abs(PLAY_PATH),audience:KIDS_AUDIENCE},
   isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER}}/>
  <JsonLd data={faqLd(SAFE_FAQ)}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>{SAFE_GUIDE.h1}</h1>
   <p className={styles.lead}>{DEFINITION} It teaches positions, passing, tactics and the rules of 7v7, 9v9, 11v11 and futsal in {HUB_COUNTS.lessons} short lessons with quizzes. This guide is for parents, carers and coaches: what the game does and does not do.</p>
   <a className={styles.cta} href={PLAY_PATH}>Play Futbol Island</a>
  </header>
  <section className={styles.section} aria-labelledby="facts"><h2 className={styles.h2} id="facts">What parents should know</h2>
   <ul className={styles.stack}>{SAFE_FACTS.map(f=><li key={f.title} className={styles.card}><h3 className={styles.h3}>{f.title}</h3><p>{f.text}</p></li>)}</ul>
   <p>The full detail, including what is kept and for how long, is in the <a href="/privacy">privacy policy</a>. More about who makes the game is on the <a href="/about">about page</a>.</p>
  </section>
  <QA id="faq" title="Questions parents ask" faq={SAFE_FAQ}/>
  <MoreToLearn except={SAFE_GUIDE.path}/>
  <p className={styles.end}><a className={styles.cta} href={PLAY_PATH}>Play Futbol Island</a></p>
 </>;
}
