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
export type SiteExhibit=Exhibit&{galleryTitle:string;galleryBlurb:string;story:StoryLine[]};
export const SITE_EXHIBITS:SiteExhibit[]=timelineOrder(EXHIBITS).map(e=>{
 const g=GALLERIES.find(x=>x.id===e.gallery),facts=new Set(e.facts);
 const story=(STORY[e.id]??[]).flatMap(lines).filter(l=>!facts.has(l.text));
 return {...e,galleryTitle:g?.title??e.gallery,galleryBlurb:g?.blurb??'',story};
});
export const exhibitById=(id:string)=>SITE_EXHIBITS.find(e=>e.id===id);
export const exhibitPath=(id:string)=>`/exhibits/${id}`;
export {GALLERIES};
