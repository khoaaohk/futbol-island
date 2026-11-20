import {pageModified} from '@/lib/site/lastmod';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {MoreToLearn} from '@/components/site/LessonHub';
import {Promises,ShortFaq,TrustTiles} from '@/components/site/PageParts';
import {safePromises} from '@/components/site/SafeLook';
import {DEFINITION,HUB_COUNTS,SAFE_GUIDE} from '@/lib/site/hubs';
import {SAFE_FACTS,SAFE_FAQ,SAFE_TRUST} from '@/lib/site/safety';
import {abs,breadcrumbLd,faqLd,KIDS_AUDIENCE,pageMeta,PLAY_PATH,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../site.module.css';

/** The parents' guide (SEO, Nov 8 2026): only the verified safety facts (lib/site/safety.ts, each one in the privacy policy).
 *  Visual pass b5 (Nov 17 2026): the trust tiles under the title, each promise beside a screenshot of it in the game (or its icon),
 *  and an FAQ that shows the short answer and keeps the rest of the same answer under "More" instead of repeating the cards. */
export const dynamic='force-static';
export const metadata=pageMeta(SAFE_GUIDE.title,SAFE_GUIDE.description,SAFE_GUIDE.path);
const CRUMBS=[{name:'Home',path:'/'},{name:SAFE_GUIDE.crumb,path:SAFE_GUIDE.path}];
export default function SafeGuide(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'WebPage',name:SAFE_GUIDE.h1,url:abs(SAFE_GUIDE.path),description:SAFE_GUIDE.description,inLanguage:'en',
   dateModified:pageModified(SAFE_GUIDE.path,SITE_UPDATED.hubs),audience:{'@type':'Audience',audienceType:'Parents, carers and coaches'},about:{'@type':'VideoGame',name:SITE_NAME,url:abs(PLAY_PATH),audience:KIDS_AUDIENCE},
   isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER}}/>
  <JsonLd data={faqLd(SAFE_FAQ)}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>{SAFE_GUIDE.h1}</h1>
   <p className={styles.lead}>{DEFINITION} It teaches positions, passing, tactics and the rules of 7v7, 9v9, 11v11 and futsal in {HUB_COUNTS.lessons} short lessons with quizzes. This guide is for parents, carers and coaches: what the game does and does not do.</p>
   <a className={styles.cta} href={PLAY_PATH}>Play Futbol Island</a>
  </header>
  <TrustTiles items={SAFE_TRUST} label="Futbol Island at a glance"/>
  <section className={styles.section} aria-labelledby="facts"><h2 className={styles.h2} id="facts">What parents should know</h2>
   <Promises items={safePromises(SAFE_FACTS,'en')}/>
   <p>The full detail, including what is kept and for how long, is in the <a href="/privacy">privacy policy</a>. More about who makes the game is on the <a href="/about">about page</a>.</p>
  </section>
  <ShortFaq id="faq" title="Questions parents ask" faq={SAFE_FAQ} more="More"/>
  <MoreToLearn except={SAFE_GUIDE.path}/>
  <p className={styles.end}><a className={styles.cta} href={PLAY_PATH}>Play Futbol Island</a></p>
 </>;
}
