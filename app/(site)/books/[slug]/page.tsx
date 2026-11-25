import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import {bookRail} from '@/lib/site/railNavCollections';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {QA} from '@/components/site/LessonHub';
import {CheckedLine,PlayEnd,QuickAnswer,type Fact} from '@/lib/site/GuideParts';
import {BOOKS_PATH,BUILT_BOOKS,bookBySlug,bookDescription,bookIntro,bookKeyFacts,bookLd,bookLinks,bookPath,bookStoryLine,readerBook,type SiteBook} from '@/lib/site/books';
import {bookGameLink} from '@/lib/site/crossLinks';
import {cardPath} from '@/lib/site/cards';
import {exhibitById,exhibitPath} from '@/lib/site/exhibits';
import {FactTable,type FactRow} from '@/components/site/FactTable';
import {breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {sitePaths} from '@/lib/site/paths';
import {checkedOn} from '@/lib/site/checked';
import {SITE_UPDATED} from '@/lib/site/updated';
import {BookCover,BookLinkTiles,StoryChapters} from '@/components/site/books/BookParts';
import OpenBook from '@/components/site/books/OpenBook';
import styles from '../../site.module.css';
import b from '@/components/site/books/books.module.css';
import {libraryCrumbs} from '@/lib/site/libraryPath';
/**
 * One pop-up book as a reading page (Nov 17 2026): the answer-first summary and key facts, the book block (its cover and the
 * "Open the pop-up book" button, which loads the web reader only on tap), the whole story as text chapter by chapter (year,
 * picture, words, "What it teaches"), the sources with the check date, questions answered from the book, keep reading, Play.
 * JSON-LD: Book (with its chapters and citations), FAQPage (the questions shown), BreadcrumbList.
 */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>BUILT_BOOKS.map(slug=>({slug}));
/** "Cafu Book for Kids: a Free Pop-Up Story" (Nov 23 2026, seo-unindexed: people search "<player> book for kids"; was
 *  "Cafu: a pop-up story for kids"; under 60 characters; the h1 carries the subtitle). */
/** SEO batch F (Nov 25 2026): + "Facts" for the "<player> facts for kids" searches; "<player> Book for Kids" stays first (the
 *  "rashford book" query). 47-56 characters, so the title stands whole (no " · Futbol Island", lib/site/seo.ts fitTitle). */
const headline=(t:string)=>{const f=`${t} Book for Kids: Facts and a Free Pop-Up Story`;return f.length<=60?f:`${t} Book for Kids: a Free Pop-Up Story`;};
/** The "Key facts" rows (lib/site/books.ts bookKeyFacts): only the page's own checked facts, then the links that carry them on. */
function keyFactRows(book:SiteBook):FactRow[]{
 const F=book.page!.facts,v=(i:number)=>F[i].value,lv=(i:number)=>/^(club|position|sport|born|country)$/i.test(F[i].label)?F[i].value:`${F[i].label}: ${F[i].value}`;
 const rows:FactRow[]=[];
 for(const r of bookKeyFacts(book)){
  if(r.kind==='born')rows.push({label:'Born',value:r.idx.map(v).join('; ')});
  else if(r.kind==='country'){const c=r.idx.length?r.idx.map(v).join('; '):book.country;if(c)rows.push({label:'Country',value:c});}
  else if(r.kind==='position'){const t=r.idx.length?r.idx.map(v).join(' · ')+(r.idx.every(i=>/^sport$/i.test(F[i].label))&&book.card?` · ${book.card.roleLabel}`:''):book.card?.roleLabel??'';
   if(t)rows.push({label:'Position',value:r.href?<a href={r.href}>{t}</a>:t});}
  else if(r.kind==='clubs')rows.push({label:r.idx.length>1?'Clubs':'Club',value:<>{r.idx.map(lv).join('; ')}{book.card&&<> · <a href={cardPath(book.card.number)}>every club on the player card</a></>}</>});
  else if(r.kind==='life')rows.push({label:r.label!,value:r.idx.map(v).join('; ')});
  else if(r.kind==='famous')rows.push({label:'Famous for',value:r.idx.map(lv).join('; ')});
  else if(r.kind==='story')rows.push({label:'The story',value:bookStoryLine(book)});
 }
 if(book.card&&!rows.some(r=>r.label==='Club'||r.label==='Clubs')){const at=rows.findIndex(r=>r.label==='Position')+1||rows.findIndex(r=>r.label==='Country')+1;/* right after the position, as on a book that names a club */
  rows.splice(at,0,{label:'Clubs',value:<a href={cardPath(book.card.number)}>{book.card.displayName}’s player card lists every club</a>});}
 const ex=(book.page!.exhibits??[]).map(exhibitById).filter((e):e is NonNullable<ReturnType<typeof exhibitById>>=>!!e);
 if(ex.length)rows.push({label:'In the museum',value:<>{ex.map((e,i)=><span key={e.id}>{i>0&&'; '}<a href={exhibitPath(e.id)}>{e.title}</a></span>)}</>});
 const g=bookGameLink(book);if(g)rows.push({label:'Play the position',value:<a href={g.path}>{g.name}</a>});
 rows.push({label:'Sources',value:<><a href="#sources">{book.sources.length} {book.sources.length===1?'source':'sources'}</a>, listed under the story</>});
 return rows;
}
export function generateMetadata({params}:{params:{slug:string}}){
 const book=bookBySlug(params.slug);if(!book)return {};
 return pageMeta(headline(book.title),bookDescription(book),bookPath(book.slug));/* Nov 23 2026: player + story + lesson (was the summary cut at 155) */
}
export default function BookPage({params}:{params:{slug:string}}){
 const book=bookBySlug(params.slug);if(!book||!book.page)notFound();
 const path=bookPath(book.slug),crumbs=libraryCrumbs({name:'Pop-up books',path:BOOKS_PATH},{name:book.title,path});/* Nov 20 2026: through the Library */
 const modified=sitePaths().find(p=>p.path===path)?.lastmod??SITE_UPDATED.books;
 const intro=bookIntro(book);
 const facts:Fact[]=book.page.facts.map(f=>({icon:f.icon,label:f.label,value:f.value,href:f.href}));
 return <>
  <JsonLd data={bookLd(book,{modified})}/>
  <JsonLd data={faqLd(book.page.faq)}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={bookRail()} current="#top"/>
  <header className={`${styles.intro} ${b.head}`} id="top">
   <Breadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{book.fullTitle}<span className={b.sr}> — </span><span className={b.h1Tail}>a pop-up story for kids</span></h1>
   <QuickAnswer lead={book.page.summary} facts={facts}/>
  </header>
  <section className={`${b.bookBlock} ${tgt.target}`} aria-labelledby="read" id="read-book">
   <BookCover book={book} tone="gold" size="lg"/>
   <div className={b.bookText}>
    <h2 className={styles.h2} id="read">Read it as a pop-up book</h2>
    <p>Turn the pages, tap each picture to do its paper action, and press Listen to hear Coach Bella read the story aloud.</p>
    <OpenBook book={readerBook(book)}/>
    <p className={b.openNote}>The same {book.chapters.length} pages as the book on the island. The whole story is also written out below.</p>
   </div>
  </section>
  {/* Nov 23 2026 (seo-books-games): a paragraph of its own per book: who, the turn of the story, the lesson, the ages, the position */}
  <section className={styles.section} aria-labelledby="about">
   <h2 className={styles.h2} id="about">About this book</h2>
   <p>{intro.who} {intro.tail&&<>In six short chapters: {intro.tail} </>}{intro.lesson} It is written for children aged 7 to 12, takes about four minutes to read, and Coach Bella can read it aloud.{intro.guide&&intro.role&&<> To learn the position, read <a href={intro.guide.path}>{intro.guide.name.toLowerCase()}</a> on the pitch.</>}</p>
  </section>
  {/* SEO batch F (Nov 25 2026): the key facts as one table (born, country, position, clubs, famous for), each from the book's own checked facts */}
  <FactTable id="key-facts" title={`${book.title} facts for kids`} label={`Key facts about ${book.player}`} head={['Fact','Detail']} rows={keyFactRows(book)}
   intro={<>The key facts about {book.player} that this book’s sources confirm. A fact the sources do not state is left out.</>}/>
  <section className={`${styles.section} ${tgt.target}`} aria-labelledby="story-title" id="story">
   <h2 className={styles.h2} id="story-title">The story</h2>
   <StoryChapters book={book}/>
  </section>
  <section className={styles.section} aria-labelledby="sources">
   <h2 className={`${styles.h2} ${tgt.target}`} id="sources">Sources</h2>
   <p>Every fact in this story comes from these sources. The “What it teaches” lessons and the page actions are written by Futbol Island; they are not quotes.</p>
   <ul>{book.sources.map(s=><li key={s.url}><a href={s.url}>{s.label}</a></li>)}</ul>
   <CheckedLine date={checkedOn('books')}/>
  </section>
  <QA id="faq" title={`Questions about ${book.title}’s story`} faq={book.page.faq}/>
  <section className={styles.section} aria-labelledby="keep">
   <h2 className={`${styles.h2} ${tgt.target}`} id="keep">Keep reading</h2>
   <BookLinkTiles links={bookLinks(book)}/>
  </section>
  <PlayEnd label="Find more books on the island" bar="Read it on the island"/>
 </>;
}
