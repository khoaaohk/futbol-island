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
  <Breadcrumbs crumbs={crumbs}/>
  <p className={styles.tag}>Card #{c.number} · {c.roleLabel} · {eraWord(c)}</p>
  <h1>{c.displayName}</h1>
  <p className={styles.lead}>{c.blurb}</p>
  <section className={styles.card} aria-labelledby="facts">
   <h2 id="facts">On the card</h2>
   <ul>
    <li><b>Position:</b> {c.roleLabel}</li>
    {c.country&&<li><b>Country:</b> {c.country}</li>}
    {c.national&&<li><b>National team:</b> {c.national}</li>}
   </ul>
   {c.strengths.length>0&&<><h3>Strengths</h3><ul>{c.strengths.map(s=><li key={s}>{s}</li>)}</ul></>}
  </section>
  {c.career.length>0&&<section className={styles.card} aria-labelledby="career">
   <h2 id="career">{c.coach?'Coaching career':'Clubs'}</h2>
   <ul>{c.career.map(s=><li key={s}>{s}</li>)}</ul>
  </section>}
  <p><a className={styles.play} href="/">Collect cards on the island</a></p>
  <p><a href="/cards">All cards</a></p>
 </>;
}
