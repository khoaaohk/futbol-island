import type {ReactNode} from 'react';
import {exhibitById} from '@/lib/site/exhibits';
import type {LinkGroup} from '@/lib/site/related';
import s from './cards.module.css';
import {CardThumbGrid} from './GameCard';
/**
 * Picture parts of the card and exhibit reading pages (visual pass, Nov 17 2026, AUDIT.md #2 and #8). Server-only, no script:
 * - Hero: the page's own share picture (og.png, built at build time) as one <img> with its real size, so nothing shifts.
 * - Stats: the facts as tiles with 16 px icons drawn like the game's fuel bolt (components/FuelCount.tsx FuelIcon).
 * - Timeline: a vertical list of dated steps (a card's clubs, an exhibit's dated story), only from the page's own words.
 * - Tiles: related exhibits as small tiles led by their year; related cards are the game's own cards (GameCard.tsx, Nov 20 2026).
 */
/** The share picture's size (lib/site/ogImage.tsx OG_SIZE; not imported, so the page module stays free of the og renderer). */
const OG={width:1200,height:630};
const FILL='#f2b632',LINE='#7a4e12';
const ICONS:Record<string,ReactNode>={
 position:<path d="M5.5 2 2 4.2l1.2 3 1.8-.9V14h6V6.3l1.8.9L14 4.2 10.5 2C10 3 9.1 3.6 8 3.6S6 3 5.5 2Z"/>,
 country:<><path d="M3.5 2.5h9l-2 3 2 3h-9Z"/><path d="M3.5 1.5V15" fill="none"/></>,
 national:<path d="M8 1.6l1.9 4 4.4.6-3.2 3 .8 4.4L8 11.5l-3.9 2.1.8-4.4-3.2-3 4.4-.6Z"/>,
 binder:<><path d="M3 2.5h8.5a1.5 1.5 0 0 1 1.5 1.5v10H4.5A1.5 1.5 0 0 1 3 12.5Z"/><path d="M6 2.5v11.5" fill="none"/></>,
 energy:<path d="M9 1 3 9h4l-1 6 7-9H9l1-5Z"/>,
 year:<><path d="M2 3.5h12V14H2Z"/><path d="M2 7h12M5 1.8v3M11 1.8v3" fill="none"/></>,
 gallery:<><path d="M1.5 6 8 2.2 14.5 6Z"/><path d="M3.5 7.5v5M8 7.5v5M12.5 7.5v5M1.5 14h13" fill="none"/></>,
};
export function StatIcon({name,size=16}:{name:keyof typeof ICONS;size?:number}){
 return <svg className={s.icon} viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" shapeRendering="crispEdges"
  fill={FILL} stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">{ICONS[name]}</svg>;
}

/** The share picture as the page's first picture. It sits above the fold on phones, so it loads eagerly at high priority. */
export function Hero({src,alt}:{src:string;alt:string}){
 return <figure className={s.hero}>
  <img src={src} alt={alt} width={OG.width} height={OG.height} decoding="async" fetchPriority="high"/>
 </figure>;
}

export type Stat={icon:keyof typeof ICONS;label:string;value:ReactNode};
/** Facts as tiles: label (with a hidden colon, so the page reads "Position: Striker" as text) over the value. */
export function StatStrip({stats}:{stats:Stat[]}){
 return <ul className={s.stats}>{stats.map(t=><li key={t.label} className={s.stat}>
  <StatIcon name={t.icon}/><b className={s.statKey}>{t.label}<span className={s.sr}>:</span></b> <span className={s.statValue}>{t.value}</span>
 </li>)}</ul>;
}

export function Chips({items,icon='energy'}:{items:string[];icon?:keyof typeof ICONS}){
 return <ul className={s.chips}>{items.map(t=><li key={t} className={s.chip}><StatIcon name={icon} size={14}/>{t}</li>)}</ul>;
}

/** "LTK Luhansk, 2010–2011" → the club, then its years under it (the comma stays in the text for readers and crawlers). */
const splitCareer=(line:string):{what:string;when?:string}=>{const m=line.match(/^(.*),\s*([^,]*\d[^,]*)$/);return m?{what:m[1],when:m[2]}:{what:line};};
export function CareerTimeline({lines}:{lines:string[]}){
 return <ol className={s.timeline}>{lines.map(l=>{const {what,when}=splitCareer(l);
  return <li key={l} className={s.step}><span className={s.stepHead}>{what}</span>{when&&<span className={s.stepWhen}><span className={s.sr}>, </span>{when}</span>}</li>;})}</ol>;
}

/** A story step is dated when its head names a year ("1863", "1950s", "13 July 1930"). */
export const isDated=(head?:string)=>!!head&&/\b(1[5-9]\d\d|20\d\d)s?\b/.test(head);
export function StoryTimeline({lines}:{lines:{head?:string;text:string}[]}){
 return <ol className={s.timeline}>{lines.map((l,i)=><li key={i} className={`${s.step} ${isDated(l.head)?s.dated:''}`}>
  {l.head&&<b className={s.stepHead}>{l.head}<span className={s.sr}>: </span></b>}<span className={s.stepText}>{l.text}</span>
 </li>)}</ol>;
}

/** The museum label under an exhibit's picture: the year large, then its gallery. */
export function ExhibitStamp({year,gallery}:{year:string;gallery:string}){
 return <dl className={s.stamp}>
  <div className={s.stampYear}><dt><StatIcon name="year"/><span>Year</span></dt><dd>{year}</dd></div>
  <div className={s.stampGallery}><dt><StatIcon name="gallery"/><span>Gallery</span></dt><dd>{gallery}</dd></div>
 </dl>;
}

/** RelatedLinks renderGroup for card pages ("More cards like this"): the game's own cards at thumbnail size (GameCard.tsx
 *  CardThumbGrid; Nov 20 2026, owner: "the players card still doesn't have the actual card from the game"; was text tiles). */
export function CardTileGroup({g}:{g:LinkGroup}){
 return <div className={s.group}><h3 className={s.groupTitle}>{g.title}</h3><CardThumbGrid links={g.links}/></div>;
}
/** RelatedLinks renderGroup for exhibit pages: each case as a tile led by its year. */
export function ExhibitTileGroup({g}:{g:LinkGroup}){
 return <div className={s.group}><h3 className={s.groupTitle}>{g.title}</h3><ul className={s.tiles}>{g.links.map(l=>{
  const e=exhibitById(l.path.split('/').pop()??'');
  return <li key={l.path}><a href={l.path} className={`${s.tile} ${s.exTile}`}>
   {e&&<span className={s.tileYear} aria-hidden="true">{e.year}</span>}
   <span className={s.tileName}>{l.name}</span>{l.meta&&<span className={s.tileMeta}>{l.meta}</span>}
  </a></li>;})}</ul></div>;
}
