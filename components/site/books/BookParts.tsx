import type {ReactNode} from 'react';
import {chapterAnchor,type SiteBook} from '@/lib/site/books';
import {FactIcon} from '@/components/site/FactIcons';
import ChapterArt from './ChapterArt';
import s from './books.module.css';
/**
 * Server parts of the books pages (/books, /books/<slug>; Nov 17 2026). Plain HTML, no script: the cover, the chapters (the
 * whole story as text, each chapter with its year, picture and "What it teaches" card), the sources and the keep-reading row.
 * Tokens from app/(site)/site.module.css (.page); radii from --r-* only; flat fills, no rules, no shadows at rest.
 */
/** Six cover colours from the island's paper set, dealt along the shelf so neighbours differ. */
const TONES=['gold','pitch','blue','coral','mint','sky'] as const;
export const coverTone=(i:number)=>TONES[i%TONES.length];

/** A typographic book cover: the player's name large, the book's subtitle, a small open-book mark. No photos. */
export function BookCover({book,tone,size='md',as:Tag='div',sub=true}:{book:SiteBook;tone:string;size?:'md'|'lg';as?:'div'|'span';sub?:boolean}){
 return <Tag className={s.cover} data-tone={tone} data-size={size} aria-hidden="true">
  <span className={s.coverName}>{book.title}</span>
  {sub&&<span className={s.coverSub}>{book.subtitle}</span>}
  <span className={s.coverFoot}><BookMark/>{book.chapters.length} chapters</span>
 </Tag>;
}
/** The energy-bar style mark (gold fill, brown key line, like components/site/cards/CardParts.tsx StatIcon). */
export function BookMark({size=16}:{size?:number}){
 return <svg className={s.mark} viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false" fill="#f2b632" stroke="#7a4e12" strokeWidth="1.4" strokeLinejoin="round">
  <path d="M8 4.2C6.4 3 4.2 2.6 1.6 2.8v9.6c2.6-.2 4.8.2 6.4 1.4 1.6-1.2 3.8-1.6 6.4-1.4V2.8C11.8 2.6 9.6 3 8 4.2Z"/><path d="M8 4.2v9.6" fill="none"/>
 </svg>;
}

/** The whole story, chapter by chapter: a timeline down the side on wide screens, the picture alternating sides. */
export function StoryChapters({book}:{book:SiteBook}){
 return <ol className={s.chapters}>{book.chapters.map((c,i)=><li key={c.id} id={chapterAnchor(c.id)} className={s.chapter} data-side={i%2?'right':'left'}>
  <div className={s.chapterArt}><ChapterArt motif={c.motif} steps={c.steps}/></div>
  <div className={s.chapterBody}>
   <p className={s.year}><span className={s.yearDot} aria-hidden="true"/>{c.year}</p>
   <h3 className={s.chapterTitle}>{c.title}</h3>
   {c.paragraphs.map((p,j)=><p key={j}>{p}</p>)}
   <aside className={s.lesson} aria-label={`What it teaches: ${c.title}`}>
    <p className={s.lessonHead}><BookMark size={18}/>What it teaches</p>
    <p>{c.lesson}</p>
   </aside>
   {c.source&&<p className={s.source}>Source: <a href={c.source.url}>{c.source.label}</a></p>}
  </div>
 </li>)}</ol>;
}

/** Keep reading: three or four tap tiles with an icon (the player's card, the position guide, a museum case, the shelf). */
export function BookLinkTiles({links}:{links:{path:string;name:string;meta?:string;icon:'cards'|'shirt'|'law'|'deck'}[]}){
 return <ul className={s.tiles}>{links.map(l=><li key={l.path}><a className={s.tile} href={l.path}>
  <FactIcon kind={l.icon} size={26}/><span className={s.tileName}>{l.name}</span>{l.meta&&<span className={s.tileMeta}>{l.meta}</span>}
 </a></li>)}</ul>;
}

export function BookShelf({books,start=0,children}:{books:SiteBook[];start?:number;children?:ReactNode}){
 /* Every book has its own page (Nov 17 2026, all 36 built; tests/books-site.cjs checks it), so every cover is a link. */
 return <ul className={s.shelf}>{books.map((b,i)=><li key={b.id} className={s.shelfItem}>
  <a className={s.shelfLink} href={b.path??`/books/${b.id}`}><BookCover book={b} tone={coverTone(start+i)} as="span" sub={false}/>
   <span className={s.shelfName}>{b.title}: {b.subtitle}</span><span className={s.shelfMeta}>Read the story</span></a>
 </li>)}{children}</ul>;
}
