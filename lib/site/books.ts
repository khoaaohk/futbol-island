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
 * - Detail pages exist only for the books listed in BOOK_PAGES (the approved sample first); the hub lists every book.
 */
export const BOOKS_PATH='/books';
/** Books in shelf order (the catalog's order), without the island starter book (it is about the game, not a player). */
export const BOOK_IDS=(Object.keys(PLAYER_BOOKS) as PlayerBookId[]).filter(id=>id!=='island'&&Object.prototype.hasOwnProperty.call(BOOKS,id));

/** The chapter pictures drawn for the web pages (components/site/books/ChapterArt.tsx). A book page names one per chapter. */
export type Motif='street'|'cards'|'gate'|'overlap'|'swap'|'trophy';
export type BookFaq={q:string;a:string};
export type BookFact={icon:'tag'|'shirt'|'clock'|'steps'|'cards'|'deck';label:string;value:string;href?:string};
/** The editorial layer of a built detail page: only wording and pictures; every fact in it is in the book's own text. */
type BookPageSpec={summary:string;facts:BookFact[];faq:BookFaq[];motifs:Motif[];exhibits?:string[];published:string};

/* Cafu sources checked Nov 17 2026 against Wikipedia (the CNN page answered HTTP 451 from here): every fact on this page is
 * there except the book's last two sentences (a foundation in Jardim Irene, "everything he has, he owes to Jardim Irene"), which
 * Wikipedia does not state, so the FAQ leaves them out; the story text keeps the book's words (owner to confirm). */
/** Cafu (the sample, Nov 17 2026): the clearest single lesson (five clubs said no, then yes), a real position change that the
 *  positions guide teaches (right-back, the overlap) and three World Cup finals; every chapter has a source. */
const BOOK_PAGES:Partial<Record<PlayerBookId,BookPageSpec>>={
 cafu:{
  published:'2026-11-17',
  summary:'Cafu: Told no, again and again is a free six-chapter pop-up story for kids about Cafu, the Brazilian right-back who was turned down at trials by five big clubs before his hometown club, São Paulo, said yes in 1988. He went on to play in three World Cup finals in a row. The story teaches that one coach’s no is not the end of your story.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'shirt',label:'Position',value:'Right-back',href:'/learn/soccer-positions/fullback'},
   {icon:'clock',label:'Born',value:'1970, São Paulo'},
   {icon:'steps',label:'Club',value:'São Paulo, from 1988'},
   {icon:'cards',label:'World Cup finals',value:'1994, 1998 and 2002'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Which clubs told Cafu no?',a:'As a boy, Cafu went to trials at some of Brazil’s biggest clubs. Corinthians, Palmeiras, Santos, Atlético Mineiro and Portuguesa all said no. Cafu could have given up. Instead, he kept training and kept trying, and in 1988 his hometown club, São Paulo, said yes.'},
   {q:'Why is he called Cafu?',a:'His real name is Marcos. Friends called him Cafu, after a Brazilian winger called Cafuringa.'},
   {q:'How did Cafu become a right-back?',a:'Cafu was a right-sided midfielder. His coach at São Paulo, Telê Santana, moved him back to right-back, a position he had never played. It suited him: he defended, then sprinted forward on the overlap to attack. With Cafu at right-back, São Paulo won the Copa Libertadores in 1992 and 1993.'},
   {q:'How many World Cup finals did Cafu play in?',a:'Three in a row, and no other player has ever done that. In 1994 he came on from the bench in the final against Italy and Brazil won. In 1998 Brazil lost the final to France. In 2002 he was Brazil’s captain, and Brazil beat Germany 2–0.'},
   {q:'What did “100% Jardim Irene” mean?',a:'When Cafu lifted the World Cup trophy in 2002, his shirt said 100% Jardim Irene, for the poor part of São Paulo where he grew up.'},
  ],
  motifs:['street','cards','gate','overlap','swap','trophy'],
  exhibits:['worldcup-1930'],
 },
};
/** The books that have their own page now (the hub links only these). */
export const BUILT_BOOKS=BOOK_IDS.filter(id=>!!BOOK_PAGES[id]);

/** Regions for the shelf, from the country of the player's card (lib/town/playerAppearance.json). A player without a card on the
 *  site yet takes the national team named in the island's own player data (FALLBACK_COUNTRY), never a guess. */
export const REGIONS=['South America','Europe','Africa','North America and Oceania'] as const;
export type Region=typeof REGIONS[number];
const REGION_OF:Record<string,Region>={Brazil:'South America',Argentina:'South America',Italy:'Europe',France:'Europe',Netherlands:'Europe',Croatia:'Europe',
 Portugal:'Europe',Spain:'Europe',England:'Europe',Belgium:'Europe',Sweden:'Europe',Norway:'Europe',Denmark:'Europe',Egypt:'Africa',Liberia:'Africa',
 'Ivory Coast':'Africa',Senegal:'Africa',Nigeria:'Africa',Canada:'North America and Oceania',Australia:'North America and Oceania'};
const FALLBACK_COUNTRY:Partial<Record<PlayerBookId,string>>={vardy:'England',eriksen:'Denmark',rashford:'England',nadim:'Denmark',kante:'France'};

export type BookChapter={id:string;year:string;title:string;
 /** The page text as paragraphs, without the paper-action sentence (see the file comment). */
 paragraphs:string[];
 /** The full text as the island book has it (the reader shows this). */
 text:string;lesson:string;prompt:string;response:string;steps:number;source:{label:string;url:string}|null;motif?:Motif};
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
  chapters:b.pages.map((p,i)=>({id:p.id,year:p.year,title:p.title,paragraphs:storyParagraphs(p),text:p.text,lesson:p.lesson,prompt:p.prompt,response:p.response,
   steps:p.steps??1,source:p.source==null?null:b.sources[p.source]??null,motif:spec?.motifs[i]}))};
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
export function bookLd(b:SiteBook,o:{modified:string}){
 const path=bookPath(b.slug),wiki=b.sources.find(s=>/wikipedia\.org\/wiki\//.test(s.url));
 return {'@context':'https://schema.org','@type':'Book','@id':abs(path)+'#book',name:b.fullTitle,url:abs(path),mainEntityOfPage:abs(path),
  description:b.page?.summary??b.blurb,inLanguage:'en',isAccessibleForFree:true,bookFormat:'https://schema.org/EBook',numberOfPages:b.chapters.length,
  genre:'Children’s biography',audience:KIDS_AUDIENCE,datePublished:b.page?.published,dateModified:o.modified,
  about:{'@type':'Person',name:b.player,...(wiki?{sameAs:wiki.url}:{})},author:PUBLISHER,publisher:PUBLISHER,
  citation:b.sources.map(s=>({'@type':'CreativeWork',name:s.label,url:s.url})),
  hasPart:b.chapters.map((c,i)=>({'@type':'Chapter',name:c.title,position:i+1,url:`${abs(path)}#${chapterAnchor(c.id)}`})),
  isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'}};
}
export const chapterAnchor=(id:string)=>`chapter-${id}`;
/** What the client reader needs (and nothing more: the reader chunk never imports the registry). */
export type ReaderBook={id:string;title:string;subtitle:string;narration:string;chapters:Pick<BookChapter,'id'|'year'|'title'|'text'|'prompt'|'response'|'steps'|'motif'>[]};
export const readerBook=(b:SiteBook):ReaderBook=>({id:b.id,title:b.title,subtitle:b.subtitle,narration:b.narration,
 chapters:b.chapters.map(({id,year,title,text,prompt,response,steps,motif})=>({id,year,title,text,prompt,response,steps,motif}))});
