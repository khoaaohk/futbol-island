import type {Metadata} from 'next';
import JsonLd from '@/components/seo/JsonLd';
import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import OpenBook from '@/components/site/books/OpenBook';
import {FactIcon} from '@/components/site/FactIcons';
import {BookMark,coverTone,GuideCover,SPREAD_H,SPREAD_W,spreadSrc} from '@/components/site/books/BookParts';
import {QA} from '@/components/site/LessonHub';
import {QuickAnswer,type Fact} from '@/lib/site/GuideParts';
import {EsBreadcrumbs,EsCheckedLine,EsPlayEnd,esLibCrumbs} from '../EsParts';
import {BOOKS_PATH,BUILT_BOOKS,bookBySlug,bookImage,bookPath,byPosition,chapterAnchor,readerBook,relatedBooks,shelf,SITE_BOOKS,type SiteBook} from '@/lib/site/books';
import {regionId} from '@/lib/site/railNavCollections';
import {hubRail,pageRail,sec} from '@/lib/site/railNavMore';
import {roleGuide} from '@/lib/site/related';
import {cardPath} from '@/lib/site/cards';
import {exhibitById,exhibitPath} from '@/lib/site/exhibits';
import {SITE_FISH} from '@/lib/site/fish';
import {checkedOn} from '@/lib/site/checked';
import {sitePaths} from '@/lib/site/paths';
import {SITE_PUBLISHED,SITE_UPDATED} from '@/lib/site/updated';
import {abs,breadcrumbLd,faqLd,KIDS_AUDIENCE,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import {pageModified} from '@/lib/site/lastmod';
import {esMeta} from '@/lib/i18n/es/seo';
import {esBook,type BookEs} from '@/lib/i18n/es/books';
import {hasEs,toEs} from '@/lib/i18n/esPaths';
import styles from '@/app/(site)/site.module.css';
import b from '@/components/site/books/books.module.css';
/**
 * The Spanish pop-up book pages (round E, Nov 22 2026): /es/books (the shelf) and /es/books/<id> (one story), the same layout
 * and classes as app/(site)/books and components/site/books/BookParts.tsx, Spanish words from lib/i18n/es/books/<id>.json (the
 * whole story translated chapter by chapter, its lessons, facts and FAQ). Chapter pictures are the English page's stills (they
 * have no words). The 3D reader and its narration are in English: the page says so before the button. Rendered on first request
 * like every /es page.
 */
const HUB_ES=toEs(BOOKS_PATH);
const REGION_ES:Record<string,string>={'South America':'Sudamérica',Europe:'Europa',Africa:'África',Asia:'Asia','North America and Oceania':'Norteamérica y Oceanía'};
const pathEs=(id:string)=>toEs(bookPath(id));
const es=(x:SiteBook)=>esBook(x.id)!;
const enNote=(label:string)=>`“${label.replace(/“/g,'‘').replace(/”/g,'’')}” (en inglés)`;
/** A typographic cover with the Spanish subtitle and chapter count (BookParts BookCover, same classes). */
function CoverEs({book,tone,size='md',as:Tag='div',sub=true}:{book:SiteBook;tone:string;size?:'md'|'lg';as?:'div'|'span';sub?:boolean}){
 return <Tag className={b.cover} data-tone={tone} data-size={size} aria-hidden="true">
  <span className={b.coverName}>{book.title}</span>
  {sub&&<span className={b.coverSub}>{es(book).subtitle}</span>}
  <span className={b.coverFoot}><BookMark/>{book.chapters.length} capítulos</span>
 </Tag>;
}
function ShelfEs({books,start=0}:{books:SiteBook[];start?:number}){
 return <ul className={b.shelf}>{books.map((x,i)=><li key={x.id} className={b.shelfItem}>
  <a className={b.shelfLink} href={pathEs(x.id)}><CoverEs book={x} tone={coverTone(start+i)} as="span" sub={false}/>
   <span className={b.shelfName}>{x.title}: {es(x).subtitle}</span><span className={b.shelfMeta}>Leer la historia</span></a>
 </li>)}</ul>;
}
function ChaptersEs({book,w}:{book:SiteBook;w:BookEs}){
 return <ol className={b.chapters}>{book.chapters.map((c,i)=>{const t=w.chapters[i];
  return <li key={c.id} id={chapterAnchor(c.id)} className={b.chapter} data-side={i%2?'right':'left'}>
   <div className={b.chapterArt}><img className={b.artImg} src={spreadSrc(book.id,c.id)} width={SPREAD_W} height={SPREAD_H} alt={`Página desplegable de papel de “${t.title}” (${t.year}), del libro de ${book.player}`}
    loading={i?'lazy':undefined} decoding="async"/></div>
   <div className={b.chapterBody}>
    <p className={b.year}><span className={b.yearDot} aria-hidden="true"/>{t.year}</p>
    <h3 className={b.chapterTitle}>{t.title}</h3>
    {t.paragraphs.map((p,j)=><p key={j}>{p}</p>)}
    <aside className={b.lesson} aria-label={`Lo que enseña: ${t.title}`}>
     <p className={b.lessonHead}><BookMark size={18}/>Lo que enseña</p>
     <p>{t.lesson}</p>
    </aside>
    {c.source&&<p className={b.source}>Fuente: <a href={c.source.url}>{enNote(c.source.label)}</a></p>}
   </div>
  </li>;})}</ol>;
}
const ROLE_ES:Record<string,{name:string;meta:string}>={goalkeeper:{name:'Qué hace un portero',meta:'Posiciones del fútbol'},fullback:{name:'Qué hace un lateral',meta:'Posiciones del fútbol'},
 centerback:{name:'Qué hace un defensa central',meta:'Posiciones del fútbol'},midfielder:{name:'Qué hace un mediocampista central',meta:'Posiciones del fútbol'},
 winger:{name:'Qué hace un extremo',meta:'Posiciones del fútbol'},striker:{name:'Qué hace un delantero',meta:'Posiciones del fútbol'},coach:{name:'Las formaciones que usan los entrenadores',meta:'Formaciones con diagramas'}};
type Tile={path:string;name:string;meta?:string;icon:'cards'|'shirt'|'law'|'deck'};
/** "Sigue leyendo" (books.ts bookLinks in Spanish): the player's card (English page), the position guide (Spanish), a museum case, the shelf. */
function linksEs(x:SiteBook):Tile[]{
 const out:Tile[]=[];
 if(x.card)out.push({path:cardPath(x.card.number),name:`La carta de ${x.card.displayName} (en inglés)`,meta:`Carta n.º ${x.card.number}`,icon:'cards'});
 const guide=x.card?roleGuide(x.card.role):undefined,gw=x.card?ROLE_ES[x.card.role]:undefined;
 if(guide&&gw)out.push({path:hasEs(guide.path)?toEs(guide.path):guide.path,name:gw.name,meta:gw.meta,icon:'shirt'});
 for(const id of x.page?.exhibits??[]){const e=exhibitById(id);if(e)out.push({path:exhibitPath(e.id),name:enNote(e.title),meta:/^\d{4}$/.test(e.year)?`Museo · ${e.year}`:"Museo de la isla",icon:'law'});}
 for(const y of relatedBooks(x))out.push({path:toEs(bookPath(y.slug)),name:`${es(y).title}: ${es(y).subtitle}`,meta:`Cuento desplegable · ${REGION_ES[y.region]??y.region}`,icon:'deck'});/* Nov 23 2026: three more stories */
 out.push({path:HUB_ES,name:'Todos los cuentos desplegables',meta:`${SITE_BOOKS.length} historias reales de fútbol`,icon:'deck'});
 return out;
}
function TilesEs({links}:{links:Tile[]}){
 return <ul className={b.tiles}>{links.map(l=><li key={l.path}><a className={b.tile} href={l.path}>
  <FactIcon kind={l.icon} size={26}/><span className={b.tileName}>{l.name}</span>{l.meta&&<span className={b.tileMeta}>{l.meta}</span>}
 </a></li>)}</ul>;
}
/** "Historia de Lionel Messi para niños: libro desplegable" when it fits in 60 characters, else the book title. */
export const bookTitleEs=(x:SiteBook)=>{const t=`Historia de ${x.player} para niños: libro desplegable`;return t.length<=60?t:`${x.title}: cuento desplegable para niños`;};
/** Nov 23 2026 (seo-books-games): the snippet leads with the player (the description's own words after "Libro desplegable gratis
 *  para niños sobre "), then the lesson from the summary; 70-155 characters or the old description. */
const ES_PREFIX='Libro desplegable gratis para niños sobre ';
const restEs=(w:BookEs)=>w.description.startsWith(ES_PREFIX)?w.description.slice(ES_PREFIX.length):'';
const lessonEs=(w:BookEs)=>w.summary.match(/La historia enseña[^.]*\./)?.[0]??'';
export function bookDescriptionEs(w:BookEs):string{
 const r=restEs(w),l=lessonEs(w).replace(/^La historia enseña/,'Enseña');if(!r)return w.description;
 return [l?`${r} ${l}`:'',`${r} Cuento desplegable gratis para niños.`,`${r} Libro desplegable gratis.`].find(d=>d.length>=70&&d.length<=155)??w.description;
}
function bookLdEs(x:SiteBook,w:BookEs,modified:string){
 const path=pathEs(x.id),wiki=x.sources.find(s=>/wikipedia\.org\/wiki\//.test(s.url));
 return {'@context':'https://schema.org','@type':'WebPage','@id':abs(path)+'#page',url:abs(path),name:bookTitleEs(x),description:bookDescriptionEs(w),inLanguage:'es',
  isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,dateModified:modified,
  /* Nov 23 2026: the Spanish edition is its own Book (its @id and url on this page, inLanguage es), a translation of the English one;
     it used to reuse the English Book's @id with Spanish names. */
  mainEntity:{'@type':'Book','@id':abs(path)+'#book',name:`${x.title}: ${w.subtitle}`,alternateName:x.fullTitle,url:abs(path),description:w.summary,inLanguage:'es',
   translationOfWork:{'@type':'Book','@id':abs(bookPath(x.id))+'#book',inLanguage:'en',url:abs(bookPath(x.id))},
   ...(lessonEs(w)?{teaches:lessonEs(w).replace(/^La historia enseña (que )?/,'').replace(/\.$/,'')}:{}),typicalAgeRange:'7-12',
   isAccessibleForFree:true,bookFormat:'https://schema.org/EBook',numberOfPages:x.chapters.length,genre:'Biografía infantil',audience:KIDS_AUDIENCE,
   datePublished:x.page?.published,dateModified:modified,...(x.chapters[0]?{image:abs(bookImage(x))}:{}),
   about:{'@type':'Person',name:x.player,...(wiki?{sameAs:wiki.url}:{})},author:PUBLISHER,publisher:PUBLISHER,
   citation:x.sources.map(s=>({'@type':'CreativeWork',name:s.label,url:s.url})),
   hasPart:x.chapters.map((c,i)=>({'@type':'Chapter',name:w.chapters[i].title,position:i+1,url:`${abs(path)}#${chapterAnchor(c.id)}`}))}};
}
export function BookEsPage({book}:{book:SiteBook}){
 const guide=book.card?roleGuide(book.card.role):undefined,gw=book.card?ROLE_ES[book.card.role]:undefined;
 const w=es(book),path=pathEs(book.id),crumbs=esLibCrumbs({name:'Cuentos desplegables',path:HUB_ES},{name:book.title,path});
 const modified=sitePaths().find(p=>p.path===bookPath(book.id))?.lastmod??SITE_UPDATED.books;
 const facts:Fact[]=book.page!.facts.map((f,i)=>({icon:f.icon,label:w.facts[i].label,value:w.facts[i].value,href:f.href&&hasEs(f.href)?toEs(f.href):f.href}));
 const rail=pageRail('En esta página',{href:HUB_ES,name:'Todos los cuentos'},[sec('read-book','El libro desplegable'),sec('story','La historia'),sec('sources','Fuentes'),sec('faq','Preguntas'),sec('keep','Sigue leyendo')],true);
 return <>
  <JsonLd data={bookLdEs(book,w,modified)}/>
  <JsonLd data={faqLd(w.faq)}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <RailNav rail={rail} current="#top"/>
  <header className={`${styles.intro} ${b.head}`} id="top">
   <EsBreadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{book.title}: {w.subtitle}<span className={b.sr}> — </span><span className={b.h1Tail}>un cuento desplegable para niños</span></h1>
   <QuickAnswer lead={w.summary} facts={facts}/>
  </header>
  <section className={`${b.bookBlock} ${tgt.target}`} aria-labelledby="read" id="read-book">
   <CoverEs book={book} tone="gold" size="lg"/>
   <div className={b.bookText}>
    <h2 className={styles.h2} id="read">Léelo como libro desplegable</h2>
    <p>Pasa las páginas, toca cada dibujo para hacer su acción de papel y escucha a Coach Bella leer la historia. El libro desplegable y su narración están en inglés.</p>
    <OpenBook book={readerBook(book)} label="Abrir el libro desplegable (en inglés)" busyLabel="Abriendo el libro…"/>
    <p className={b.openNote}>Las mismas {book.chapters.length} páginas del libro de la isla. Abajo está toda la historia en español.</p>
   </div>
  </section>
  {/* Nov 23 2026 (seo-books-games): the page's own paragraph, as in English: who, the story's turn, the lesson, the ages, the position */}
  <section className={styles.section} aria-labelledby="about">
   <h2 className={styles.h2} id="about">Sobre este libro</h2>
   <p>{restEs(w)?<>Este libro cuenta la historia de {restEs(w).replace(/\.$/,'')}. </>:null}{lessonEs(w)} Está escrito para niños de 7 a 12 años, se lee en unos 4 minutos y Coach Bella lo lee en voz alta (en inglés).{guide&&gw&&<> Su posición en el campo: <a href={hasEs(guide.path)?toEs(guide.path):guide.path}>{gw.name.toLowerCase()}</a>.</>}</p>
  </section>
  <section className={`${styles.section} ${tgt.target}`} aria-labelledby="story-title" id="story">
   <h2 className={styles.h2} id="story-title">La historia</h2>
   <ChaptersEs book={book} w={w}/>
  </section>
  <section className={styles.section} aria-labelledby="sources">
   <h2 className={`${styles.h2} ${tgt.target}`} id="sources">Fuentes</h2>
   <p>Cada dato de esta historia viene de estas fuentes. Las lecciones de “Lo que enseña” y las acciones de cada página las escribe Futbol Island; no son citas.</p>
   <ul>{book.sources.map(s=><li key={s.url}><a href={s.url}>{enNote(s.label)}</a></li>)}</ul>
   <EsCheckedLine date={checkedOn('books')}/>
  </section>
  <QA id="faq" title={`Preguntas sobre la historia de ${book.title}`} faq={w.faq}/>
  <section className={styles.section} aria-labelledby="keep">
   <h2 className={`${styles.h2} ${tgt.target}`} id="keep">Sigue leyendo</h2>
   <TilesEs links={linksEs(book)}/>
  </section>
  <EsPlayEnd label="Encuentra más libros en la isla" bar="Léelo en la isla"/>
 </>;
}
/* ---- the shelf ---- */
const N=()=>SITE_BOOKS.length;
const HUB=()=>({title:'Cuentos de fútbol para niños: libros desplegables gratis',
 description:`${N()} cuentos desplegables gratis para niños sobre jugadores de fútbol reales, de Cafu y Marta a Salah y Kerr: seis capítulos cortos, con fuentes.`,
 h1:'Cuentos de fútbol para niños: libros desplegables',
 lead:`Futbol Island tiene ${N()} libros desplegables gratis para niños, cada uno una historia real y corta sobre un jugador de fútbol, en seis capítulos. Cada capítulo termina con lo que enseña, como seguir adelante después de un no o estar listo desde la banca, y cada dato se revisa con sus fuentes. Las historias están en español en esta página; el libro desplegable y su narración están en inglés.`});
const POSITION_PLURAL_ES:Record<string,string>={goalkeeper:'Porteros',fullback:'Laterales',centerback:'Defensas centrales',midfielder:'Mediocampistas',winger:'Extremos',striker:'Delanteros'};
export function BooksHubEsPage(){
 const h=HUB(),crumbs=esLibCrumbs({name:'Cuentos desplegables',path:HUB_ES}),featured=bookBySlug(BUILT_BOOKS[0]??''),groups=shelf();let start=0;
 const facts:Fact[]=[{icon:'deck',label:'Libros',value:`${N()} historias reales`},{icon:'steps',label:'Cada libro',value:'6 capítulos, una lección cada uno'},
  {icon:'clock',label:'Tiempo de lectura',value:'Unos 4 minutos'},{icon:'tag',label:'Precio',value:'Gratis'}];
 const rail=hubRail('Cuentos en esta página',[{items:[...(featured?[sec('first-book','Empieza aquí')]:[]),...groups.map(g=>sec(regionId(g.region),REGION_ES[g.region]??g.region)),sec('guides','Guías de la isla'),sec('how','Cómo se hacen')]}],true);
 const ld={'@context':'https://schema.org','@type':'CollectionPage',name:h.h1,url:abs(HUB_ES),description:h.description,inLanguage:'es',datePublished:SITE_PUBLISHED,
  dateModified:pageModified(BOOKS_PATH,SITE_UPDATED.books),isAccessibleForFree:true,audience:KIDS_AUDIENCE,isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,
  mainEntity:{'@type':'ItemList',numberOfItems:BUILT_BOOKS.length,itemListElement:BUILT_BOOKS.map((id,i)=>{const x=bookBySlug(id)!;return {'@type':'ListItem',position:i+1,name:`${x.title}: ${es(x).subtitle}`,url:abs(pathEs(id))};})}};
 return <>
  <JsonLd data={ld}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <RailNav rail={rail} current="#top"/>
  <header className={`${styles.intro} ${b.head}`} id="top">
   <EsBreadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{h.h1}</h1>
   <QuickAnswer lead={h.lead} facts={facts}/>
  </header>
  {featured&&<section className={`${b.feature} ${tgt.target}`} aria-labelledby="first" id="first-book">
   <a className={b.coverLink} href={pathEs(featured.id)} tabIndex={-1} aria-hidden="true"><CoverEs book={featured} tone="gold" size="lg" as="span"/></a>
   <div className={b.featureText}>
    <h2 className={b.featureTitle} id="first">Empieza con {featured.title}: {es(featured).subtitle}</h2>
    <p>{es(featured).summary}</p>
    <a className={b.openBtn} href={pathEs(featured.id)}>Lee la historia de {featured.title}</a>
   </div>
  </section>}
  {groups.map(g=>{const s=start;start+=g.books.length;const id=regionId(g.region);
   return <section key={g.region} className={styles.section} aria-labelledby={id}>
    <h2 className={`${styles.h2} ${tgt.target}`} id={id}>Jugadores de {REGION_ES[g.region]??g.region}</h2>
    <ShelfEs books={g.books} start={s}/>
   </section>;})}
  {/* Nov 23 2026: the same books by position, as in English */}
  <section className={styles.section} aria-labelledby="by-position">
   <h2 className={`${styles.h2} ${tgt.target}`} id="by-position">Libros por posición</h2>
   <p>Todos los cuentos, agrupados por la posición de la carta del jugador. El enlace de cada posición explica lo que hace ese jugador en el campo.</p>
   <ul>{byPosition().map(g=><li key={g.role}><strong>{g.guide?<a href={hasEs(g.guide.path)?toEs(g.guide.path):g.guide.path}>{POSITION_PLURAL_ES[g.role]}</a>:POSITION_PLURAL_ES[g.role]}</strong>: {g.books.map((x,i)=><span key={x.id}>{i?', ':''}<a href={pathEs(x.id)}>{x.player}</a></span>)}</li>)}</ul>
  </section>
  <section className={styles.section} aria-labelledby="guides">
   <h2 className={`${styles.h2} ${tgt.target}`} id="guides">Guías de la isla</h2>
   <ul className={b.shelf}><li className={b.shelfItem}>
    <a className={b.shelfLink} href="/fish"><GuideCover name="Fishbook" sub="Animales del mar y fútbol" foot={`${SITE_FISH.length} animales del mar`} tone="sky"/>
     <span className={b.shelfName}>Fishbook: {SITE_FISH.length} animales del mar, cada uno unido a un club o una historia del fútbol (en inglés)</span><span className={b.shelfMeta}>Abrir el Fishbook</span></a>
   </li></ul>
  </section>
  <section className={styles.card} aria-labelledby="how">
   <h2 className={`${styles.h2} ${tgt.target}`} id="how">Cómo se hacen los libros</h2>
   <p>Cada historia se escribe para niños de 7 a 12 años a partir de fuentes publicadas, que aparecen al final de cada libro. Los datos sobre un jugador son solo lo que dicen esas fuentes; nunca inventamos citas. La lección de “Lo que enseña” y la acción de papel de cada página son ideas nuestras de entrenamiento.</p>
   <p>En la isla, los libros están en máquinas expendedoras por el pueblo; abre uno para verlo desplegarse en 3D. En este sitio, cada página tiene la historia completa en español, las fuentes y un lector desplegable con la misma voz, en inglés.</p>
  </section>
  <EsPlayEnd label="Encuentra los libros en la isla" bar="Léelos en la isla"/>
 </>;
}
export function booksEsRoute(enPath:string):{meta:()=>Metadata;render:()=>JSX.Element}|null{
 if(enPath===BOOKS_PATH){const h=HUB();return {meta:()=>esMeta(h.title,h.description,enPath),render:()=><BooksHubEsPage/>};}
 if(!enPath.startsWith(BOOKS_PATH+'/'))return null;
 const book=bookBySlug(enPath.slice(BOOKS_PATH.length+1));if(!book||!esBook(book.id))return null;
 const w=es(book);
 return {meta:()=>esMeta(bookTitleEs(book),bookDescriptionEs(w),enPath,book.chapters[0]?{url:bookImage(book),alt:`Página desplegable del libro de ${book.player}`}:undefined),render:()=><BookEsPage book={book}/>};
}
