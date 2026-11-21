import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import {bookRail} from '@/lib/site/railNavCollections';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {QA} from '@/components/site/LessonHub';
import {CheckedLine,PlayEnd,QuickAnswer,type Fact} from '@/lib/site/GuideParts';
import {BOOKS_PATH,BUILT_BOOKS,bookBySlug,bookLd,bookLinks,bookPath,readerBook} from '@/lib/site/books';
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
/** "Cafu: a pop-up story for kids · Futbol Island" (the site's title shape, under 60 characters; the h1 carries the subtitle). */
const headline=(t:string)=>`${t}: a pop-up story for kids`;
export function generateMetadata({params}:{params:{slug:string}}){
 const book=bookBySlug(params.slug);if(!book)return {};
 return pageMeta(headline(book.title),book.page!.summary,bookPath(book.slug));
}
export default function BookPage({params}:{params:{slug:string}}){
 const book=bookBySlug(params.slug);if(!book||!book.page)notFound();
 const path=bookPath(book.slug),crumbs=libraryCrumbs({name:'Pop-up books',path:BOOKS_PATH},{name:book.title,path});/* Nov 20 2026: through the Library */
 const modified=sitePaths().find(p=>p.path===path)?.lastmod??SITE_UPDATED.books;
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
