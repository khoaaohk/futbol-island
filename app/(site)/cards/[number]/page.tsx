import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {cardByNumber,cardPath,eraWord,SITE_CARDS} from '@/lib/site/cards';
import {breadcrumbLd,creativeWorkLd,firstSentence,pageMeta} from '@/lib/site/seo';
import styles from '../../site.module.css';

/** One player (or coach) card as plain text: position, country, blurb, strengths and career. No photo (see lib/site/cards.ts). */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_CARDS.map(c=>({number:String(c.number)}));
const card=(p:{number:string})=>/^\d+$/.test(p.number)?cardByNumber(Number(p.number)):undefined;
export function generateMetadata({params}:{params:{number:string}}){
 const c=card(params);if(!c)return {};
 return pageMeta(`${c.displayName} (card #${c.number})`,firstSentence(c.blurb||`${c.displayName}, ${c.roleLabel}.`),cardPath(c.number));
}
export default function CardPage({params}:{params:{number:string}}){
 const c=card(params);if(!c)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Cards',path:'/cards'},{name:c.displayName,path:cardPath(c.number)}];
 return <>
  <JsonLd data={creativeWorkLd({name:`${c.displayName} · Futbol Island card #${c.number}`,path:cardPath(c.number),description:c.blurb,
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
   </ul>
   {c.strengths.length>0&&<><h3 className={styles.h3}>Strengths</h3><ul>{c.strengths.map(s=><li key={s}>{s}</li>)}</ul></>}
  </section>
  {c.career.length>0&&<section className={styles.card} aria-labelledby="career">
   <h2 className={styles.h2} id="career">{c.coach?'Coaching career':'Clubs'}</h2>
   <ul>{c.career.map(s=><li key={s}>{s}</li>)}</ul>
  </section>}
  <p className={styles.end}><a className={styles.cta} href="/">Collect cards on the island</a></p>
 </>;
}
