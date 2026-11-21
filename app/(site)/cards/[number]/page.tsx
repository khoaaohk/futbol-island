import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import {cardRail} from '@/lib/site/railNavCollections';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import RelatedLinks from '@/components/site/RelatedLinks';
import {cardByNumber,cardPath,eraWord,SITE_CARDS} from '@/lib/site/cards';
import {cardArticleLd,cardNote,cardNoteDrill,noteCredit} from '@/lib/site/cardNotes';
import {lessonPath} from '@/lib/site/lessons';
import {cardRelated,roleLesson,rolePlural} from '@/lib/site/related';
import {breadcrumbLd,creativeWorkLd,firstSentence,ogPath,pageMeta,fullDescription} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {checkedOn} from '@/lib/site/checked';
import {bookForCard,cardTopicLinks} from '@/lib/site/crossLinks';
import {CheckedLine,PlayEnd} from '@/lib/site/GuideParts';
import {PLAY_PACKS_HREF} from '@/lib/site/playLinks';
import {CardTileGroup,CareerTimeline,Chips,StatStrip,type Stat} from '@/components/site/cards/CardParts';
import {GameCard} from '@/components/site/cards/GameCard';
import gc from '@/components/site/cards/GameCard.module.css';
import styles from '../../site.module.css';

/** One player (or coach) card as plain text: position, country, blurb, strengths and career. No photo (see lib/site/cards.ts).
 *  Nov 10 2026 (SEO): + the iconic play and the idea it teaches (when the player has a film), the lesson for the card's position
 *  (the lesson's own concept text), data-driven links (lib/site/related.ts) and the page's own share picture (og.png/route.tsx).
 *  Nov 14 2026 (SEO): cards with notes (lib/site/cardNotes.ts) add "Why they matter", "Learn from them" (a drill link) and
 *  "Did you know?" (checked facts, plain-text credit), and describe themselves as an Article about the Person.
 *  Nov 17 2026 (visual pass, AUDIT.md #2): the share picture as the hero <img>, the facts as icon tiles, strengths as chips, clubs
 *  as a timeline and the related cards as small card faces (components/site/cards/CardParts.tsx). Same words, same links. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_CARDS.map(c=>({number:String(c.number)}));
const card=(p:{number:string})=>/^\d+$/.test(p.number)?cardByNumber(Number(p.number)):undefined;
export function generateMetadata({params}:{params:{number:string}}){
 const c=card(params);if(!c)return {};
 /* Nov 20 2026 (SEO foundation): noindex, follow (lib/site/paths.ts NOINDEX_CARD_PATHS): reached by links, not listed in search. */
 return {robots:{index:false,follow:true},...pageMeta(`${c.displayName} Football Card #${c.number}`.length<=44?`${c.displayName} Football Card #${c.number}`:`${c.displayName} (card #${c.number})`,/* Nov 17 2026: says what the page is (Search Console: "… football cards" queries); the number stays in the picture alt */fullDescription(firstSentence(c.blurb||`${c.displayName}, ${c.roleLabel}.`),[`See the position, strengths and clubs on Futbol Island card #${c.number}.`,'See the position, strengths and clubs on the card.','On a Futbol Island card.']),cardPath(c.number),
  {image:{url:ogPath(cardPath(c.number)),alt:`${c.displayName}, Futbol Island card #${c.number}: ${c.roleLabel}`}})};
}
export default function CardPage({params}:{params:{number:string}}){
 const c=card(params);if(!c)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Cards',path:'/cards'},{name:c.displayName,path:cardPath(c.number)}];
 const book=bookForCard(c);
 const lesson=roleLesson(c),related=cardRelated(c),note=cardNote(c),drill=note&&cardNoteDrill(note);
 const stats:Stat[]=[{icon:'position',label:'Position',value:c.roleLabel},...(c.country?[{icon:'country' as const,label:'Country',value:c.country}]:[]),
  ...(c.national?[{icon:'national' as const,label:'National team',value:c.national}]:[]),{icon:'binder',label:'In the binder',value:`${eraWord(c)}, card #${c.number} of ${SITE_CARDS.length}`}];
 const person={'@type':'Person',name:c.displayName,jobTitle:c.coach?'Football coach':`Football ${c.futsal?'(futsal) ':''}player · ${c.roleLabel}`,...(c.country?{nationality:{'@type':'Country',name:c.country}}:{})};
 return <>
  <JsonLd data={note?cardArticleLd({c,n:note,path:cardPath(c.number),description:c.blurb||note.why,image:ogPath(cardPath(c.number)),modified:SITE_UPDATED.cards,person})
   :creativeWorkLd({name:`${c.displayName} · Futbol Island card #${c.number}`,path:cardPath(c.number),description:c.blurb,image:ogPath(cardPath(c.number)),about:person})}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={cardRail({coach:!!c.coach,why:!!note,career:c.career.length>0,play:!!c.play,learn:!!(note&&drill),know:!!(note&&note.facts.length>0)})} current="#top"/>
  {/* Nov 20 2026 (owner: "the players card still doesn't have the actual card from the game"): the head shows the game's own
      card (components/site/cards/GameCard.tsx, the binder's MiniCard) beside the H1 on wide screens, under the summary on phones.
      It replaces the share-picture banner (Hero); that picture stays the page's og:image only. */}
  <header className={`${styles.intro} ${gc.head}`} id="top">
   <Breadcrumbs crumbs={crumbs}/>
   <p className={styles.eyebrow}>Card #{c.number} · {c.roleLabel} · {eraWord(c)}</p>
   <h1 className={styles.title}>{c.displayName}</h1>
   {c.blurb&&<p className={styles.lead}>{c.blurb}</p>}
   <GameCard c={c}/>
  </header>
  <section className={styles.card} aria-labelledby="facts">
   <span className={styles.label}>Real football fact</span>
   <h2 className={`${styles.h2} ${tgt.target}`} id="facts">On the card</h2>
   <StatStrip stats={stats}/>
   {c.strengths.length>0&&<><h3 className={styles.h3}>Strengths</h3><Chips items={c.strengths}/></>}
  </section>
  {note&&<section className={styles.section} aria-labelledby="why" data-card-notes>
   <h2 className={`${styles.h2} ${tgt.target}`} id="why">Why {c.coach?'this coach matters':'they matter'}</h2>
   <p>{note.why}</p>
  </section>}
  {c.career.length>0&&<section className={styles.card} aria-labelledby="career">
   <h2 className={`${styles.h2} ${tgt.target}`} id="career">{c.coach?'Coaching career':'Clubs'}</h2>
   <CareerTimeline lines={c.career}/>
  </section>}
  {c.play&&<section className={styles.card} aria-labelledby="play">
   <h2 className={`${styles.h2} ${tgt.target}`} id="play">Iconic play: {c.play.title}</h2>
   <p><b>What it teaches:</b> {c.play.theme}{/[.!?]$/.test(c.play.theme)?'':'.'}</p>
   <p className={styles.caption}>In the game, this card plays the moment as a short drawn film.</p>
  </section>}
  {note&&drill&&<section className={styles.card} aria-labelledby="learn">
   <span className={styles.label}>Practise it</span>
   <h2 className={`${styles.h2} ${tgt.target}`} id="learn">Learn from {c.displayName}</h2>
   <p>{note.learn.text}</p>
   <p><a href={drill.path}>Try the drill: {drill.name}</a></p>
  </section>}
  {note&&note.facts.length>0&&<section className={styles.card} aria-labelledby="know">
   <span className={styles.label}>Real football fact</span>
   <h2 className={`${styles.h2} ${tgt.target}`} id="know">Did you know?</h2>
   {note.facts.length>1?<ul>{note.facts.map(f=><li key={f.text}>{f.text}</li>)}</ul>:<p>{note.facts[0].text}</p>}
   <p className={styles.caption}>Checked against: {noteCredit(note)}.</p>
   <CheckedLine date={checkedOn('cards',note.checked)}/>
  </section>}
  <section className={styles.section} aria-labelledby="lesson">
   <h2 className={`${styles.h2} ${tgt.target}`} id="lesson">{c.coach?'A lesson every coach starts with':`A lesson for ${rolePlural(c.role)}`}</h2>
   <p>{lesson.concept}</p>
   <p><a href={lessonPath(lesson.id)}>Read the {lesson.formatLabel} lesson: {lesson.title}</a></p>
  </section>
  {/* Nov 20 2026 (SEO foundation): + the player's pop-up book and two topic pages for the position (lib/site/crossLinks.ts) */}
  <RelatedLinks related={{...related,read:[...(book?[{path:book.path,name:book.name,meta:book.line}]:[]),...related.read.slice(1),...cardTopicLinks(c).map(l=>({path:l.path,name:l.name,meta:l.line}))].filter((x,i,a)=>a.findIndex(y=>y.path===x.path)===i)}} heading="More cards like this" readHeading="Keep reading" renderGroup={g=><CardTileGroup g={g}/>}/>
  <PlayEnd href={PLAY_PACKS_HREF} label="Collect cards on the island" bar="Open card packs on the island"/>
 </>;
}
