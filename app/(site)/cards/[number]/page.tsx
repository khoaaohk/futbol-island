import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import RelatedLinks from '@/components/site/RelatedLinks';
import {cardByNumber,cardPath,eraWord,SITE_CARDS} from '@/lib/site/cards';
import {lessonPath} from '@/lib/site/lessons';
import {cardRelated,roleLesson,rolePlural} from '@/lib/site/related';
import {breadcrumbLd,creativeWorkLd,firstSentence,ogPath,pageMeta} from '@/lib/site/seo';
import styles from '../../site.module.css';

/** One player (or coach) card as plain text: position, country, blurb, strengths and career. No photo (see lib/site/cards.ts).
 *  Nov 10 2026 (SEO): + the iconic play and the idea it teaches (when the player has a film), the lesson for the card's position
 *  (the lesson's own concept text), data-driven links (lib/site/related.ts) and the page's own share picture (og.png/route.tsx). */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_CARDS.map(c=>({number:String(c.number)}));
const card=(p:{number:string})=>/^\d+$/.test(p.number)?cardByNumber(Number(p.number)):undefined;
export function generateMetadata({params}:{params:{number:string}}){
 const c=card(params);if(!c)return {};
 return pageMeta(`${c.displayName} (card #${c.number})`,firstSentence(c.blurb||`${c.displayName}, ${c.roleLabel}.`),cardPath(c.number),
  {image:{url:ogPath(cardPath(c.number)),alt:`${c.displayName}, Futbol Island card #${c.number}: ${c.roleLabel}`}});
}
export default function CardPage({params}:{params:{number:string}}){
 const c=card(params);if(!c)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Cards',path:'/cards'},{name:c.displayName,path:cardPath(c.number)}];
 const lesson=roleLesson(c),related=cardRelated(c);
 return <>
  <JsonLd data={creativeWorkLd({name:`${c.displayName} · Futbol Island card #${c.number}`,path:cardPath(c.number),description:c.blurb,image:ogPath(cardPath(c.number)),
   about:{'@type':'Person',name:c.displayName,jobTitle:c.coach?'Football coach':`Football ${c.futsal?'(futsal) ':''}player · ${c.roleLabel}`,...(c.country?{nationality:{'@type':'Country',name:c.country}}:{})}})}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={crumbs}/>
   <p className={styles.eyebrow}>Card #{c.number} · {c.roleLabel} · {eraWord(c)}</p>
   <h1 className={styles.title}>{c.displayName}</h1>
   {c.blurb&&<p className={styles.lead}>{c.blurb}</p>}
  </header>
  <section className={styles.card} aria-labelledby="facts">
   <span className={styles.label}>Real football fact</span>
   <h2 className={styles.h2} id="facts">On the card</h2>
   <ul className={styles.bare}>
    <li><b>Position:</b> {c.roleLabel}</li>
    {c.country&&<li><b>Country:</b> {c.country}</li>}
    {c.national&&<li><b>National team:</b> {c.national}</li>}
    <li><b>In the binder:</b> {eraWord(c)}, card #{c.number} of {SITE_CARDS.length}</li>
   </ul>
   {c.strengths.length>0&&<><h3 className={styles.h3}>Strengths</h3><ul>{c.strengths.map(s=><li key={s}>{s}</li>)}</ul></>}
  </section>
  {c.career.length>0&&<section className={styles.card} aria-labelledby="career">
   <h2 className={styles.h2} id="career">{c.coach?'Coaching career':'Clubs'}</h2>
   <ul>{c.career.map(s=><li key={s}>{s}</li>)}</ul>
  </section>}
  {c.play&&<section className={styles.card} aria-labelledby="play">
   <h2 className={styles.h2} id="play">Iconic play: {c.play.title}</h2>
   <p><b>What it teaches:</b> {c.play.theme}{/[.!?]$/.test(c.play.theme)?'':'.'}</p>
   <p className={styles.caption}>In the game, this card plays the moment as a short drawn film.</p>
  </section>}
  <section className={styles.section} aria-labelledby="lesson">
   <h2 className={styles.h2} id="lesson">{c.coach?'A lesson every coach starts with':`A lesson for ${rolePlural(c.role)}`}</h2>
   <p>{lesson.concept}</p>
   <p><a href={lessonPath(lesson.id)}>Read the {lesson.formatLabel} lesson: {lesson.title}</a></p>
  </section>
  <RelatedLinks related={{...related,read:related.read.slice(1)}} heading="More cards like this" readHeading="Keep reading"/>
  <p className={styles.end}><a className={styles.cta} href="/play">Collect cards on the island</a></p>
 </>;
}
