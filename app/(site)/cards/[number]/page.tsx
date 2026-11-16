import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import RelatedLinks from '@/components/site/RelatedLinks';
import {cardByNumber,cardPath,eraWord,SITE_CARDS} from '@/lib/site/cards';
import {cardArticleLd,cardNote,cardNoteDrill,noteCredit} from '@/lib/site/cardNotes';
import {lessonPath} from '@/lib/site/lessons';
import {cardRelated,roleLesson,rolePlural} from '@/lib/site/related';
import {breadcrumbLd,creativeWorkLd,firstSentence,ogPath,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {checkedOn} from '@/lib/site/checked';
import {CheckedLine} from '@/lib/site/GuideParts';
import styles from '../../site.module.css';

/** One player (or coach) card as plain text: position, country, blurb, strengths and career. No photo (see lib/site/cards.ts).
 *  Nov 10 2026 (SEO): + the iconic play and the idea it teaches (when the player has a film), the lesson for the card's position
 *  (the lesson's own concept text), data-driven links (lib/site/related.ts) and the page's own share picture (og.png/route.tsx).
 *  Nov 14 2026 (SEO): cards with notes (lib/site/cardNotes.ts) add "Why they matter", "Learn from them" (a drill link) and
 *  "Did you know?" (checked facts, plain-text credit), and describe themselves as an Article about the Person. */
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
 const lesson=roleLesson(c),related=cardRelated(c),note=cardNote(c),drill=note&&cardNoteDrill(note);
 const person={'@type':'Person',name:c.displayName,jobTitle:c.coach?'Football coach':`Football ${c.futsal?'(futsal) ':''}player · ${c.roleLabel}`,...(c.country?{nationality:{'@type':'Country',name:c.country}}:{})};
 return <>
  <JsonLd data={note?cardArticleLd({c,n:note,path:cardPath(c.number),description:c.blurb||note.why,image:ogPath(cardPath(c.number)),modified:SITE_UPDATED.cards,person})
   :creativeWorkLd({name:`${c.displayName} · Futbol Island card #${c.number}`,path:cardPath(c.number),description:c.blurb,image:ogPath(cardPath(c.number)),about:person})}/>
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
  {note&&<section className={styles.section} aria-labelledby="why" data-card-notes>
   <h2 className={styles.h2} id="why">Why {c.coach?'this coach matters':'they matter'}</h2>
   <p>{note.why}</p>
  </section>}
  {c.career.length>0&&<section className={styles.card} aria-labelledby="career">
   <h2 className={styles.h2} id="career">{c.coach?'Coaching career':'Clubs'}</h2>
   <ul>{c.career.map(s=><li key={s}>{s}</li>)}</ul>
  </section>}
  {c.play&&<section className={styles.card} aria-labelledby="play">
   <h2 className={styles.h2} id="play">Iconic play: {c.play.title}</h2>
   <p><b>What it teaches:</b> {c.play.theme}{/[.!?]$/.test(c.play.theme)?'':'.'}</p>
   <p className={styles.caption}>In the game, this card plays the moment as a short drawn film.</p>
  </section>}
  {note&&drill&&<section className={styles.card} aria-labelledby="learn">
   <span className={styles.label}>Practise it</span>
   <h2 className={styles.h2} id="learn">Learn from {c.displayName}</h2>
   <p>{note.learn.text}</p>
   <p><a href={drill.path}>Try the drill: {drill.name}</a></p>
  </section>}
  {note&&note.facts.length>0&&<section className={styles.card} aria-labelledby="know">
   <span className={styles.label}>Real football fact</span>
   <h2 className={styles.h2} id="know">Did you know?</h2>
   {note.facts.length>1?<ul>{note.facts.map(f=><li key={f.text}>{f.text}</li>)}</ul>:<p>{note.facts[0].text}</p>}
   <p className={styles.caption}>Checked against: {noteCredit(note)}.</p>
   <CheckedLine date={checkedOn('cards',note.checked)}/>
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
