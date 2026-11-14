import notes from './cardNotes.json';
import {drillBySlug,type Drill} from './drills';
import {abs,KIDS_AUDIENCE,PUBLISHER,SITE_NAME,SITE_URL} from './seo';
import {SITE_PUBLISHED} from './updated';
import type {SiteCard} from './cards';
/**
 * Card pages' own words (SEO, Nov 14 2026: Search Console listed the card pages as "Crawled – currently not indexed", about 200
 * words each, mostly shared). Per card, in lib/site/cardNotes.json (keyed by the card's roster name):
 *  - why: why the player or coach matters (style, position, what a kid can copy);
 *  - learn: one skill or habit, tied to a drill page on the site;
 *  - facts: 1-2 career facts, each checked on 14 Nov 2026 against the source URLs beside it (Wikipedia plus an official, club or
 *    federation page where one confirmed it). Kids see a plain-text "Checked against" credit, never a link
 *    (the Fishbook rule). Every URL is also listed in docs/card-content-sources.md (scripts/gen-content-sources.cjs).
 * Rules (owner, Nov 14 2026): real people, so no fact without a source; nothing that goes stale (no "current club"); no
 * controversies, personal life, money or injuries; no heading advice. Cards without notes keep the shorter page.
 */
export type CardFact={text:string;src:string[]};
export type CardNote={why:string;learn:{drill:string;text:string};facts:CardFact[];checked:string};
export const CARD_NOTES=notes as unknown as Record<string,CardNote>;
export const cardNote=(c:Pick<SiteCard,'name'>):CardNote|undefined=>CARD_NOTES[c.name];
export function cardNoteDrill(n:CardNote):Drill{
 const d=drillBySlug(n.learn.drill);if(!d)throw new Error(`cardNotes: drill ${n.learn.drill} does not exist`);return d;
}
/** Plain-text names of the sites a fact was checked against (no links for kids). */
const SITE_LABEL:Record<string,string>={'wikipedia.org':'Wikipedia','uefa.com':'UEFA','fifa.com':'FIFA','inside.fifa.com':'FIFA','olympics.com':'Olympics.com',
 'premierleague.com':'Premier League','bundesliga.com':'Bundesliga','laliga.com':'LaLiga','legaseriea.it':'Serie A','ussoccer.com':'U.S. Soccer',
 'thefa.com':'The FA','englandfootball.com':'England Football','canadasoccer.com':'Canada Soccer','britannica.com':'Britannica'};
export function sourceLabel(url:string):string{
 try{const h=new URL(url).hostname.replace(/^www\./,'');
  const k=Object.keys(SITE_LABEL).find(s=>h===s||h.endsWith('.'+s));return k?SITE_LABEL[k]:h;}catch{return 'source on file';}
}
export const noteSources=(n:CardNote)=>[...new Set(n.facts.flatMap(f=>f.src))];
export const noteCredit=(n:CardNote)=>[...new Set(noteSources(n).map(sourceLabel))].join(', ');
/** Wikipedia page for the person (sameAs in the JSON-LD), when a fact cites their own English Wikipedia article. */
export const noteWikipedia=(n:CardNote)=>noteSources(n).find(u=>/^https:\/\/en\.wikipedia\.org\/wiki\/[^#?]+$/.test(u));
/** An enriched card's JSON-LD (Nov 14 2026): an Article about the Person (in place of the plain CreativeWork), dated, citing
 *  the fact sources. No ratings. */
export function cardArticleLd(o:{c:SiteCard;n:CardNote;path:string;description:string;image:string;modified:string;person:Record<string,unknown>}){
 const wiki=noteWikipedia(o.n);
 return {'@context':'https://schema.org','@type':'Article',headline:`${o.c.displayName}: why they matter and what kids can learn`,name:`${o.c.displayName} · ${SITE_NAME} card #${o.c.number}`,
  url:abs(o.path),mainEntityOfPage:abs(o.path),description:o.description,image:abs(o.image),inLanguage:'en',isAccessibleForFree:true,
  datePublished:SITE_PUBLISHED,dateModified:o.modified,audience:KIDS_AUDIENCE,learningResourceType:'Profile',educationalLevel:'Beginner',
  author:PUBLISHER,publisher:PUBLISHER,isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},
  about:{...o.person,...(wiki?{sameAs:wiki}:{})},citation:noteSources(o.n)};
}
