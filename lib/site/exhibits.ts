import {EXHIBITS,GALLERIES,timelineOrder,type Exhibit} from '@/lib/endgame/museum';
import * as ballCurve from '@/components/museum/experiences/ball-curve/content';
import * as copa from '@/components/museum/experiences/copa-america-1916/content';
import * as firstIntl from '@/components/museum/experiences/first-international-1872/content';
import * as floodlights from '@/components/museum/experiences/floodlights-1878/content';
import * as freeKick from '@/components/museum/experiences/free-kick-wall/content';
import * as futsal from '@/components/museum/experiences/futsal-1989/content';
import * as keeper from '@/components/museum/experiences/keeper-hands-1912/content';
import * as offside from '@/components/museum/experiences/offside-rules/content';
import * as penalty from '@/components/museum/experiences/penalty-1891/content';
import * as telstar from '@/components/museum/experiences/telstar-1970/content';
import * as throwIn from '@/components/museum/experiences/throw-in/content';
import {EXTRA_FACTS as shirtsExtra} from '@/components/museum/experiences/shirts/data';
/* Nov 15 2026 (SEO thin pages: these exhibits had no story text on their reading page): the same sourced words their
 * experiences already show, data modules only (no scene, no client code). */
import * as wc1930 from '@/components/museum/experiences/worldcup-1930/data';
import * as wwc from '@/components/museum/experiences/wwc-1991/data';
import * as varCase from '@/components/museum/experiences/var-2018/content';
import {MILESTONES as LAW_MILESTONES} from '@/components/museum/experiences/laws-1863/laws';
import {BEATS as LAW_BEATS} from '@/components/museum/experiences/laws-1863/story';
import {ERAS as BOOT_ERAS} from '@/components/museum/experiences/boots/facts';
import {BEATS as LEATHER_BEATS} from '@/components/museum/experiences/laced-leather/content';
import {TROPHIES} from '@/components/museum/experiences/hall-of-fame/trophies';
import {ERAS as SHAPE_ERAS} from '@/components/museum/experiences/formations-history/model';
/**
 * The History Museum as plain reading pages (/exhibits, /exhibits/<id>; /museum itself stays the game's 3D hall). Read-only
 * views of lib/endgame/museum.ts (title, year, gallery, facts, "take it to your game", sources) plus the story text the
 * full-screen experiences carry in their own content modules (components/museum/experiences/<id>/content.ts). Only words:
 * the interactive parts (machines, quizzes, practice games) stay in the game. Sources are plain-text titles, no links.
 */
export type StoryLine={head?:string;text:string};
type Raw=unknown;
/** Normalises the content modules' shapes: string[], {tag|head|when, text}[], or a record of strings. */
function lines(v:Raw):StoryLine[]{
 if(Array.isArray(v))return v.flatMap(x=>typeof x==='string'?[{text:x}]:x&&typeof x==='object'&&typeof (x as {text?:unknown}).text==='string'
  ?[{head:[(x as {when?:string}).when,(x as {head?:string}).head??(x as {tag?:string}).tag].filter(Boolean).join(' · ')||undefined,text:(x as {text:string}).text}]:[]);
 if(v&&typeof v==='object')return Object.values(v as Record<string,unknown>).filter((s):s is string=>typeof s==='string').map(text=>({text}));
 return [];
}
const STORY:Record<string,Raw[]>={
 'ball-curve':[ballCurve.MORE],'copa-america-1916':[copa.EXTRA],'first-international-1872':[firstIntl.STORY,firstIntl.WHY_PASS?[firstIntl.WHY_PASS]:[]],
 'floodlights-1878':[floodlights.EXTRA],'free-kick-wall':[freeKick.HISTORY],'futsal-1989':[futsal.MORE_FACTS],'keeper-hands-1912':[keeper.EXTRA],
 'offside-rules':[offside.MILESTONES,[offside.KID_RULE]],'penalty-1891':[penalty.HISTORY,penalty.RESEARCH],'telstar-1970':[telstar.EXTRA],
 'throw-in':[throwIn.HISTORY],'shirts':[shirtsExtra],
 'worldcup-1930':[wc1930.CASE_FACTS,wc1930.PORTS.map(p=>({head:p.date?`${p.name} · ${p.date}`:p.name,text:p.text})),wc1930.SEA_NOTES.map(n=>({head:n.title,text:n.text}))],
 'wwc-1991':[wwc.EDITIONS.slice(0,1).flatMap(e=>[{text:e.note},{text:e.starWhy}]),wwc.BANS.map(b=>({head:`${b.country}, ${b.from} to ${b.to}`,text:`${b.banned} ${b.before} ${b.after}`}))],
 'var-2018':[varCase.CASE_FACTS,[{head:`${varCase.REAL_CASE.when} · ${varCase.REAL_CASE.match}`,text:varCase.REAL_CASE.story.join(' ')}],[varCase.TOURNAMENT_NUMBERS]],
 'laws-1863':[LAW_BEATS,LAW_MILESTONES.map(m=>({when:String(m.year),text:`${m.headline}.`}))],
 'boots':[BOOT_ERAS.map(e=>({when:e.when,head:e.title,text:e.what}))],
 'laced-leather':[LEATHER_BEATS.filter(b=>b.when!=='Your turn')],
 'hall-of-fame':[TROPHIES.map(t=>({head:t.name,text:[`${t.tournament}: ${t.firstNote}.`,t.made,t.story].filter(Boolean).join(' ')}))],
 'formations-history':[SHAPE_ERAS.map(e=>({when:e.when,head:`${e.shape}: ${e.name}`,text:`${e.why} ${e.who}.`}))],
};
/** Search words (SEO phase 2, Nov 20 2026): the case titles are museum labels ("Under the lights", "Numbers and colours"), short
 *  and close to each other, so a search result did not say what the page is about. Each case gets a page title (60 characters
 *  at most, used whole) and an h1 that name the subject, the year and the sport in the words people type. Every word comes from
 *  the case's own facts in lib/endgame/museum.ts; the short label stays on tiles, breadcrumbs and lists. A case with no row
 *  throws at load. Tests: tests/seo-media.cjs. */
const SEARCH:Record<string,[title:string,h1:string]>={
 'laws-1863':['The First Football Rules, 1863: Laws of the Game for Kids','The first Laws of the Game, 1863'],
 'penalty-1891':['History of the Penalty Kick in Soccer, from 1891','The penalty kick, in the Laws since 1891'],
 'var-2018':['What Is VAR in Soccer? The Video Assistant Referee','VAR: the video assistant referee'],
 'worldcup-1930':['The First World Cup, 1930 in Uruguay: History for Kids','The first World Cup: Uruguay, 1930'],
 'wwc-1991':['The First Women’s World Cup, 1991: History for Kids','The first Women’s World Cup: China, 1991'],
 'futsal-1989':['History of Futsal: From 1930 to the 1989 World Cup','Futsal and its first World Cup, 1989'],
 'stadiums':['Famous Soccer Stadiums of the World: Facts for Kids','Famous football stadiums of the world'],
 'laced-leather':['Old Leather Soccer Balls and Ball Sizes Today','Laced leather footballs and ball sizes'],
 'telstar-1970':['The Telstar: The Black and White 1970 World Cup Ball','The Telstar, the 1970 World Cup ball'],
 'boots':['History of Football Boots: Heavy Leather to Light Knit','Football boots through time'],
 'shirts':['Why Soccer Shirts Have Numbers: Shirt Numbers Since 1928','Shirt numbers and team colours'],
 'hall-of-fame':['Famous Football Trophies at True Size: The Trophy Room','The trophy room: football’s great trophies'],
 'ballon-dor':['Ballon d’Or History for Kids: The Golden Ball Since 1956','The Ballon d’Or, the Golden Ball since 1956'],
 'first-international-1872':['The First International Football Match, 1872','The first international football match, 1872'],
 'offside-rules':['History of the Offside Rule in Soccer, from 1863','How the offside rule changed through time'],
 'formations-history':['History of Soccer Formations: From 2-3-5 to 4-4-2','Soccer formations through time'],
 'floodlights-1878':['The First Football Match Under Floodlights, 1878','The first football match under floodlights, 1878'],
 'copa-america-1916':['Copa América History: The First Tournament, 1916','The Copa América: how it began in 1916'],
 'keeper-hands-1912':['Where Can a Goalkeeper Use Their Hands? The 1912 Rule','The goalkeeper’s hands and the 1912 rule'],
 'free-kick-wall':['Free Kicks and the Wall in Soccer: The 9.15 Metre Rule','Free kicks and the wall: the 9.15 metre rule'],
 'ball-curve':['Why Does a Soccer Ball Curve? The Magnus Effect for Kids','Why a spinning ball curves'],
 'throw-in':['The Throw-In in Soccer: How to Take One, Since 1863','The throw-in: how to take one'],
};
export type SiteExhibit=Exhibit&{galleryTitle:string;galleryBlurb:string;story:StoryLine[];seoTitle:string;h1:string};
export const SITE_EXHIBITS:SiteExhibit[]=timelineOrder(EXHIBITS).map(e=>{
 const g=GALLERIES.find(x=>x.id===e.gallery),facts=new Set(e.facts);
 const story=(STORY[e.id]??[]).flatMap(lines).filter(l=>!facts.has(l.text));
 const words=SEARCH[e.id];if(!words)throw new Error(`exhibits: ${e.id} has no search title`);
 return {...e,galleryTitle:g?.title??e.gallery,galleryBlurb:g?.blurb??'',story,seoTitle:words[0],h1:words[1]};
});
export const exhibitById=(id:string)=>SITE_EXHIBITS.find(e=>e.id===id);
export const exhibitPath=(id:string)=>`/exhibits/${id}`;
export {GALLERIES};
