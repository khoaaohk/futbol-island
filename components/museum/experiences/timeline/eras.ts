import {timelineOrder,type Exhibit} from '@/lib/endgame/museum';
/**
 * The eras on the timeline: the museum's own cases in timelineOrder(), each with ONE line quoted word for word from that case's
 * facts (picked by index, so the text can never drift from lib/endgame/museum.ts). No new facts here.
 * Anatomy restyle (Oct 12 2026): ONE accent for the whole exhibit (blue, the museum's primary palette); chapters are told by
 * their numbers and titles, not by colour.
 */
export const FACT_LINE:Readonly<Record<string,number>>={
 'laws-1863':0,      // the FA wrote down one set of rules
 'penalty-1891':0,   // William McCrum's idea
 'shirts':0,         // numbered shirts, 1928 / 1939
 'worldcup-1930':1,  // Uruguay beat Argentina 4–2
 'laced-leather':0,  // brown leather, laces, heavy in the rain
 'cards-1970':1,     // Ken Aston and the traffic lights
 'telstar-1970':1,   // black and white for black-and-white TV
 'futsal-1989':1,    // first Futsal World Cup, Brazil won
 'wwc-1991':1,       // USA 2–1 Norway
 'backpass-1992':0,  // the back-pass rule
 'var-2018':1,       // what VAR may help with
 'hall-of-fame':0,   // your certificates hang here
};
/**
 * The story's chapters (Oct 9 2026): a 7–12-year-old reads the timeline as five chapters and an ending, not twelve loose dates.
 * Framing words only (no new facts): each title sums up the cases under it.
 */
export const CHAPTERS:readonly {n:number;title:string;ids:readonly string[]}[]=[
 {n:1,title:'Writing the rules',ids:['laws-1863','penalty-1891']},
 {n:2,title:'The game grows up',ids:['shirts','worldcup-1930','laced-leather']},
 {n:3,title:'The whole world is watching',ids:['cards-1970','telstar-1970']},
 {n:4,title:'Everyone joins in',ids:['futsal-1989','wwc-1991']},
 {n:5,title:'A faster, fairer game',ids:['backpass-1992','var-2018']},
 {n:6,title:'Your turn',ids:['hall-of-fame']},
];
export const chapterOf=(id:string)=>CHAPTERS.find(c=>c.ids.includes(id))??null;
/** The exhibit's one accent (the museum's primary blue). */
export const ACCENT='#2a5bd7';
export const accentOf=(_id:string)=>ACCENT;
export type Era={exhibit:Exhibit;fact:string;tick:string;accent:string};
/** The tick label under the year rail: the year, or a short form of "Before the 1960s". */
export const tickLabel=(year:string)=>/before/i.test(year)?`<${year.match(/\d{4}s?/)?.[0]??year}`:year;
export function eras(list?:readonly Exhibit[]):Era[]{
 return timelineOrder(list).map(e=>({exhibit:e,fact:e.facts[FACT_LINE[e.id]??0]??e.facts[0]??'',tick:tickLabel(e.year),accent:accentOf(e.id)}));
}
