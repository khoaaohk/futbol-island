/** The editorial layer of one book's web page (/books/<id>): only wording and pictures; every fact in it is in the book's own
 *  text (lib/books/stories/<id>.ts) and checked against its sources. One file per book so books can be written in parallel. */
export type BookFaq={q:string;a:string};
export type BookFact={icon:'tag'|'shirt'|'clock'|'steps'|'cards'|'deck';label:string;value:string;href?:string};
export type BookPageSpec={summary:string;facts:BookFact[];faq:BookFaq[];
 exhibits?:string[];published:string;
 /** What the source check found that the page leaves out or words carefully (for the owner; never shown). */
 sourceNotes?:string};
