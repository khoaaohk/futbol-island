import {PLAYER_BOOKS,type PlayerBookId} from '@/lib/books/catalog';
import {BOOKS} from '@/lib/books/library';
import type {BookData,BookPage} from '@/lib/books/types';
import {SITE_CARDS,cardPath,type SiteCard} from './cards';
import {roleGuide,type SiteLink} from './related';
import {exhibitById,exhibitPath} from './exhibits';
import {PUBLISHER,KIDS_AUDIENCE,SITE_NAME,SITE_URL,abs,firstSentence} from './seo';
/**
 * The island's player pop-up books as reading pages (/books, /books/<slug>; Nov 17 2026, owner: "bring the books to the website,
 * SEO and LLM friendly, visual"). Server-only: it reads the generated book registry (every story's text and narration manifest),
 * so a client component must never import this file; the reader gets its one book as props.
 * - Every story fact comes from the book itself (lib/books/stories/*.ts, attributed to its sources); nothing here adds a fact.
 * - The page text is the book's text with the paper-action sentence taken out ("Flip the five cards." is the pop-up's
 *   instruction, not part of the story on a flat page); the reader keeps the full text and turns that sentence into its button.
 * - Every book has a detail page from its BOOK_PAGES spec (Cafu was the approved sample; all 36 built Nov 17 2026); the hub
 *   lists and links every book.
 * SOURCES checked Nov 17 2026 (each book's own source list). An edit to this file that changes no fact does not move this date
 * (scripts/content-dates.cjs reads it here; before, the date followed the file's last commit).
 */
export const BOOKS_PATH='/books';
/** Books in shelf order (the catalog's order), without the island starter book (it is about the game, not a player). */
export const BOOK_IDS=(Object.keys(PLAYER_BOOKS) as PlayerBookId[]).filter(id=>id!=='island'&&Object.prototype.hasOwnProperty.call(BOOKS,id));

export type {BookFaq,BookFact} from './bookPages/types';
import type {BookPageSpec} from './bookPages/types';
import {BOOK_PAGES} from './bookPages/index';

/** The books that have their own page (all of them since Nov 17 2026; a new book shows on the hub once its spec exists). */
export const BUILT_BOOKS=BOOK_IDS.filter(id=>!!BOOK_PAGES[id]);

/** Regions for the shelf, from the country of the player's card (lib/town/playerAppearance.json). A player without a card on the
 *  site yet takes the national team named in the island's own player data (FALLBACK_COUNTRY), never a guess. */
export const REGIONS=['South America','Europe','Africa','Asia','North America and Oceania'] as const;
export type Region=typeof REGIONS[number];
const REGION_OF:Record<string,Region>={Brazil:'South America',Argentina:'South America',Italy:'Europe',France:'Europe',Netherlands:'Europe',Croatia:'Europe',
 Portugal:'Europe',Spain:'Europe',England:'Europe',Belgium:'Europe',Sweden:'Europe',Norway:'Europe',Denmark:'Europe',Egypt:'Africa',Liberia:'Africa',
 'Ivory Coast':'Africa',Senegal:'Africa',Nigeria:'Africa',Canada:'North America and Oceania',Australia:'North America and Oceania',
 // Nov 21 2026 books: Asia is its own shelf (Son, then Sawa).
 Colombia:'South America',USA:'North America and Oceania','United States':'North America and Oceania',Japan:'Asia','South Korea':'Asia',
 'Czech Republic':'Europe',Wales:'Europe',Algeria:'Africa',Cameroon:'Africa','Bosnia and Herzegovina':'Europe'};
const FALLBACK_COUNTRY:Partial<Record<PlayerBookId,string>>={vardy:'England',eriksen:'Denmark',rashford:'England',nadim:'Denmark',kante:'France',
 caicedo:'Colombia',mahrez:'Algeria',baggio:'Italy',formiga:'Brazil',milla:'Cameroon'};

export type BookChapter={id:string;year:string;title:string;
 /** The page text as paragraphs, without the paper-action sentence (see the file comment). */
 paragraphs:string[];
 /** The full text as the island book has it (the reader shows this). */
 text:string;lesson:string;prompt:string;response:string;steps:number;source:{label:string;url:string}|null};
export type SiteBook={id:PlayerBookId;slug:string;path:string|null;player:string;title:string;subtitle:string;fullTitle:string;
 country:string;region:Region;blurb:string;chapters:BookChapter[];sources:readonly {label:string;url:string}[];card?:SiteCard;
 narration:string;page?:BookPageSpec};

/** The action sentence ("Flip the five cards.") out of a paragraph, only when it is the prompt word for word. */
export function storyParagraphs(p:Pick<BookPage,'text'|'prompt'>):string[]{
 const cut=p.prompt.trim().replace(/\.$/,'')+'.';
 return p.text.split(/\n\n+/).map(par=>{const i=par.indexOf(cut);return i<0?par:(par.slice(0,i)+par.slice(i+cut.length)).replace(/\s{2,}/g,' ').trim();}).filter(Boolean);
}
const cardFor=(b:BookData,id:PlayerBookId)=>{const names=[b.player,PLAYER_BOOKS[id].player];return SITE_CARDS.find(c=>!c.coach&&(names.includes(c.name)||names.includes(c.displayName)));};
function build(id:PlayerBookId):SiteBook{
 const b=BOOKS[id],spec=BOOK_PAGES[id],card=cardFor(b,id),country=card?.country??FALLBACK_COUNTRY[id]??'';
 return {id,slug:id,path:spec?bookPath(id):null,player:PLAYER_BOOKS[id].player,title:b.title,subtitle:b.subtitle,fullTitle:`${b.title}: ${b.subtitle}`,
  country,region:REGION_OF[country]??'Europe',blurb:firstSentence(b.pages[0]?.text??'',150),sources:b.sources,card,narration:`/voice/books/${id}/narration.json`,page:spec,
  chapters:b.pages.map(p=>({id:p.id,year:p.year,title:p.title,paragraphs:storyParagraphs(p),text:p.text,lesson:p.lesson,prompt:p.prompt,response:p.response,
   steps:p.steps??1,source:p.source==null?null:b.sources[p.source]??null}))};
}
export const bookPath=(id:string)=>`${BOOKS_PATH}/${id}`;
export const SITE_BOOKS:SiteBook[]=BOOK_IDS.map(build);
export const bookBySlug=(slug:string)=>SITE_BOOKS.find(b=>b.slug===slug&&!!b.page);
/** The shelf: every book, grouped by region in REGIONS order, catalog order inside a group. */
export const shelf=()=>REGIONS.map(region=>({region,books:SITE_BOOKS.filter(b=>b.region===region)})).filter(g=>g.books.length>0);

/** "Keep reading" for a book page: the player's card, the guide for their position, a museum case, the shelf. */
export function bookLinks(b:SiteBook):(SiteLink&{icon:'cards'|'shirt'|'law'|'deck'})[]{
 const out:(SiteLink&{icon:'cards'|'shirt'|'law'|'deck'})[]=[];
 if(b.card)out.push({path:cardPath(b.card.number),name:`${b.card.displayName}’s player card`,meta:`Card #${b.card.number} · ${b.card.roleLabel}`,icon:'cards'});
 const guide=b.card?roleGuide(b.card.role):undefined;if(guide)out.push({...guide,icon:'shirt'});
 for(const id of b.page?.exhibits??[]){const e=exhibitById(id);if(e)out.push({path:exhibitPath(e.id),name:e.title,meta:`Museum · ${e.year}`,icon:'law'});}
 out.push({path:BOOKS_PATH,name:'All the pop-up books',meta:`${SITE_BOOKS.length} true football stories`,icon:'deck'});
 return out;
}

/** schema.org Book for one story page: the book is the page's main thing, about one real person, citing its sources, its six
 *  chapters as hasPart Chapter. Only properties schema.org defines on Book / CreativeWork; no ratings, no ISBN (none exist). */
/** A book's own picture: its first chapter's spread (public/books/spreads/<book>/<chapter>.webp, 960 x 600). */
export const bookImage=(b:Pick<SiteBook,'id'|'chapters'>)=>`/books/spreads/${b.id}/${b.chapters[0].id}.webp`;
export function bookLd(b:SiteBook,o:{modified:string}){
 const path=bookPath(b.slug),wiki=b.sources.find(s=>/wikipedia\.org\/wiki\//.test(s.url));
 return {'@context':'https://schema.org','@type':'Book','@id':abs(path)+'#book',name:b.fullTitle,url:abs(path),mainEntityOfPage:abs(path),
  description:b.page?.summary??b.blurb,inLanguage:'en',isAccessibleForFree:true,bookFormat:'https://schema.org/EBook',numberOfPages:b.chapters.length,
  genre:'Children’s biography',audience:KIDS_AUDIENCE,datePublished:b.page?.published,dateModified:o.modified,
  ...(b.chapters[0]?{image:abs(bookImage(b))}:{}),/* Nov 20 2026: the first chapter's pop-up picture (tests/books-site.cjs checks the file exists) */
  about:{'@type':'Person',name:b.player,...(wiki?{sameAs:wiki.url}:{})},author:PUBLISHER,publisher:PUBLISHER,
  citation:b.sources.map(s=>({'@type':'CreativeWork',name:s.label,url:s.url})),
  hasPart:b.chapters.map((c,i)=>({'@type':'Chapter',name:c.title,position:i+1,url:`${abs(path)}#${chapterAnchor(c.id)}`})),
  isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'}};
}
export const chapterAnchor=(id:string)=>`chapter-${id}`;
/** What the client reader needs (and nothing more: the reader chunk never imports the registry). */
export type ReaderBook={id:string;title:string;subtitle:string;narration:string;chapters:Pick<BookChapter,'id'|'year'|'title'|'text'|'prompt'|'response'|'steps'>[]};
export const readerBook=(b:SiteBook):ReaderBook=>({id:b.id,title:b.title,subtitle:b.subtitle,narration:b.narration,
 chapters:b.chapters.map(({id,year,title,text,prompt,response,steps})=>({id,year,title,text,prompt,response,steps}))});
