/**
 * Coach's notes (SEO, Nov 14 2026, seo-boost: "Crawled – currently not indexed" on template pages): the per-item words that only
 * one page has. Every formation, position, rule, glossary term and drill page shows a "Coach's notes" section built from these:
 *  - coach: one coaching point specific to the item (what to say or do with players);
 *  - match: one line on how it shows up in a real youth match;
 *  - ages: 2-4 age-group notes, [label, note], the label U6, U8, U10, U12 or "U13 and up" (US Youth Soccer / U.S. Soccer
 *    small-sided formats: 4v4 to U8, no keepers, no offside; 7v7 at U9-U10 with keepers and the build-out line; 9v9 at U11-U12;
 *    11v11 from U13; no heading at 10 and under, limited heading practice at 11 and 12: lib/site/sizes.ts, lib/site/rules.ts);
 *  - mistakes (formations and positions only, which had none): two common mistakes.
 * The words live in lib/site/notesGuides.ts and lib/site/notesDrills.ts; checkNotes throws at build time when an item has none,
 * so a new page cannot ship without its own notes. Accuracy rules: Laws of the Game as IFAB writes them, US youth formats as
 * U.S. Soccer / US Youth Soccer set them, no statistics, no named players, no invented numbers.
 */
export type AgeNote=readonly [label:string,note:string];
export type CoachNotes={coach:string;match:string;ages:readonly AgeNote[];mistakes?:readonly string[]};
const LABEL=/^(U6|U8|U10|U12|U13 and up)$/;
const sentences=(s:string)=>(s.match(/[^.!?]+[.!?]+(?=\s|$)/g)||[]).length;
/** Throws when a slug has no notes, a note is empty or too long, or an age label is not one of the five. */
export function checkNotes(family:string,slugs:readonly string[],notes:Readonly<Record<string,CoachNotes>>,o:{mistakes?:boolean}={}){
 for(const s of slugs){
  const n=notes[s],w=`${family} ${s}`;
  if(!n)throw new Error(`${w}: no coach's notes (lib/site/coachNotes.ts)`);
  for(const [k,v] of [['coach',n.coach],['match',n.match]] as const)if(!v||v.length<40||sentences(v)<1||sentences(v)>3)throw new Error(`${w}: ${k} must be 1-3 full sentences`);
  if(n.ages.length<2||n.ages.length>4)throw new Error(`${w}: 2-4 age notes`);
  for(const [l,t] of n.ages)if(!LABEL.test(l)||t.length<25)throw new Error(`${w}: age note ${l} is not valid`);
  if(new Set(n.ages.map(a=>a[0])).size!==n.ages.length)throw new Error(`${w}: an age label is listed twice`);
  if(o.mistakes&&(n.mistakes?.length??0)<2)throw new Error(`${w}: two common mistakes`);
 }
 for(const s of Object.keys(notes))if(!slugs.includes(s))throw new Error(`${family}: notes for ${s}, which has no page`);
}
