import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import {booksHubRail,regionId} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {QuickAnswer,PlayEnd,type Fact} from '@/lib/site/GuideParts';
import {BOOKS_PATH,BUILT_BOOKS,SITE_BOOKS,bookBySlug,shelf} from '@/lib/site/books';
import {breadcrumbLd,collectionLd,pageMeta} from '@/lib/site/seo';
import {SITE_PUBLISHED,SITE_UPDATED} from '@/lib/site/updated';
import {BookCover,BookShelf,GuideCover} from '@/components/site/books/BookParts';
import {SITE_FISH} from '@/lib/site/fish';
import styles from '../site.module.css';
import b from '@/components/site/books/books.module.css';
import {libraryCrumbs} from '@/lib/site/libraryPath';
/**
 * The pop-up books shelf (Nov 17 2026): every player book on the island, grouped by where the player is from. Every book has
 * its own page (lib/site/books.ts BOOK_PAGES, all 36 since Nov 17 2026), so every cover links to it. Server-only, no script.
 */
export const dynamic='force-static';
const N=SITE_BOOKS.length;
const LEAD=`Futbol Island has ${N} free pop-up books for kids, each a short true story about a real football player in six chapters. Every chapter ends with what it teaches, like keeping going after a no or being ready from the bench, and every fact is checked against its sources.`;
export const metadata=pageMeta('Football pop-up books for kids',
 `${N} free pop-up story books for kids about real football players, from Cafu and Marta to Salah and Kerr: six short chapters each, read aloud, with sources.`,BOOKS_PATH);
const CRUMBS=libraryCrumbs({name:'Pop-up books',path:BOOKS_PATH});/* Nov 20 2026: through the Library */
const FACTS:Fact[]=[
 {icon:'deck',label:'Books',value:`${N} true stories`},
 {icon:'steps',label:'Each book',value:'6 chapters, one lesson each'},
 {icon:'clock',label:'Reading time',value:'About 4 minutes, or listen'},
 {icon:'tag',label:'Price',value:'Free to read'},
];
export default function BooksHub(){
 const featured=bookBySlug(BUILT_BOOKS[0]??'');let start=0;
 return <>
  <JsonLd data={collectionLd({name:'Football pop-up books for kids',path:BOOKS_PATH,description:LEAD,published:SITE_PUBLISHED,modified:SITE_UPDATED.books,
   items:BUILT_BOOKS.map(id=>bookBySlug(id)!).map(x=>({name:x.fullTitle,path:x.path!}))})}/>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={booksHubRail(!!featured,shelf().map(g=>g.region))} current="#top"/>
  <header className={`${styles.intro} ${b.head}`} id="top">
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>Football pop-up books for kids</h1>
   <QuickAnswer lead={LEAD} facts={FACTS}/>
  </header>
  {featured&&<section className={`${b.feature} ${tgt.target}`} aria-labelledby="first" id="first-book">
   <a className={b.coverLink} href={featured.path!} tabIndex={-1} aria-hidden="true"><BookCover book={featured} tone="gold" size="lg" as="span"/></a>
   <div className={b.featureText}>
    <h2 className={b.featureTitle} id="first">Start with {featured.fullTitle}</h2>
    <p>{featured.page!.summary}</p>
    <a className={b.openBtn} href={featured.path!}>Read {featured.title}’s story</a>
   </div>
  </section>}
  {shelf().map(g=>{const s=start;start+=g.books.length;const id=regionId(g.region);
   return <section key={g.region} className={styles.section} aria-labelledby={id}>
    <h2 className={`${styles.h2} ${tgt.target}`} id={id}>Players from {g.region}</h2>
    <BookShelf books={g.books} start={s}/>
   </section>;})}
  <section className={styles.section} aria-labelledby="guides">
   <h2 className={`${styles.h2} ${tgt.target}`} id="guides">Island field guides</h2>
   <ul className={b.shelf}><li className={b.shelfItem}>
    <a className={b.shelfLink} href="/fish"><GuideCover name="Fishbook" sub="Sea animals and football" foot={`${SITE_FISH.length} sea animals`} tone="sky"/>
     <span className={b.shelfName}>Fishbook: {SITE_FISH.length} sea animals, each linked to a real football club or story</span><span className={b.shelfMeta}>Open the Fishbook</span></a>
   </li></ul>
  </section>
  <section className={styles.card} aria-labelledby="how">
   <h2 className={`${styles.h2} ${tgt.target}`} id="how">How the books are made</h2>
   <p>Each story is written for children aged 7 to 12 from published sources, which are listed at the end of every book. Facts about a player are only what those sources say; we never invent quotes. The “What it teaches” lesson and the paper action on each page are our own coaching ideas.</p>
   <p>On the island, the books stand in vending machines around the town; open one to see it pop up in 3D. On this site, each story page has the full text, the sources and a pop-up reader with the same voice.</p>
  </section>
  <PlayEnd label="Find the books on the island" bar="Read them on the island"/>
 </>;
}
