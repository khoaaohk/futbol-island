import type {ReactNode} from 'react';
import {FactIcon,type FactIconKind} from './FactIcons';
import h from './hub.module.css';
/**
 * Topic and section hubs as chapters (visual pass batch 3, Nov 17 2026; audit rank 3 and 9; owner rule: /learn pages read as
 * Apple-style chapters). Server-rendered, no script:
 *  - Band: one chapter, full width, every other one on the tint; its head (an icon or a small diagram, the h2, the one-line
 *    "what you'll learn" and the count) beside a grid of link cards.
 *  - CardGrid: the cards, `show` visible and the rest under one "Show all N" <details> (every link stays in the HTML).
 *  - IconRows: short facts as icon rows ("The game in five lines").
 *  - Hero: the hub's intro beside its game clip (GuideVideo) on wide screens, stacked on phones.
 */
export type HubCard={path:string;name:string;meta?:string;line?:string;icon:FactIconKind;badge?:string};
const WORDS={en:{all:(n:number)=>`Show all ${n}`},es:{all:(n:number)=>`Ver las ${n}`}};

export function Hero({children,video}:{children:ReactNode;video:ReactNode}){
 if(!video)return <>{children}</>;
 return <div className={h.hero} data-hub-hero="">{children}<div className={h.heroArt}>{video}</div></div>;
}
function Card({c}:{c:HubCard}){
 return <li className={h.item}><a href={c.path}>
  <span className={h.ico}>{c.badge?<b className={h.badge}>{c.badge}</b>:<FactIcon kind={c.icon} size={26}/>}</span>
  <span className={h.name}>{c.name}</span>
  {c.meta&&<span className={h.meta}>{c.meta}</span>}
  {c.line&&<span className={h.line}>{c.line}</span>}
 </a></li>;
}
export function CardGrid({cards,show=6,lang='en'}:{cards:readonly HubCard[];show?:number;lang?:'en'|'es'}){
 const first=cards.slice(0,show),rest=cards.slice(show);
 return <div className={h.cards}>
  <ul className={h.grid}>{first.map(c=><Card key={c.path} c={c}/>)}</ul>
  {rest.length>0&&<details className={h.more}><summary className={h.moreSum}><span>{WORDS[lang].all(cards.length)}</span><span className={h.plus} aria-hidden="true"/></summary>
   <ul className={h.grid}>{rest.map(c=><Card key={c.path} c={c}/>)}</ul></details>}
 </div>;
}
/** One chapter. `art` replaces the icon with a picture (a small pitch diagram); `tone` 'tint' puts the band on the tint. */
export function Band({id,title,line,count,icon,art,tone,children}:{id:string;title:string;line?:string;count?:string;icon?:FactIconKind;art?:ReactNode;tone?:'tint'|'paper';children:ReactNode}){
 return <section className={h.band} data-tone={tone??'paper'} aria-labelledby={id} data-band="">
  <div className={h.inner}>
   <div className={h.head}>
    {!art&&icon&&<span className={h.bigIco}><FactIcon kind={icon} size={40}/></span>}
    <h2 className={h.h2} id={id}>{title}</h2>
    {line&&<p className={h.lead}>{line}</p>}
    {count&&<p className={h.count}>{count}</p>}
    {art&&<div className={h.art}>{art}</div>}
   </div>
   <div className={h.body}>{children}</div>
  </div>
 </section>;
}
export function IconRows({items}:{items:readonly {icon:FactIconKind;text:ReactNode}[]}){
 return <ul className={h.rows} data-icon-rows="">{items.map((x,i)=><li key={i}><span className={h.ico}><FactIcon kind={x.icon} size={26}/></span><span>{x.text}</span></li>)}</ul>;
}
/** A lesson's concept icon, from its category in the game data (public/lessons/*.json). */
export function lessonIcon(category?:string):FactIconKind{
 switch(category){
  case 'Defending':return 'shield';
  case 'Transition':return 'swap';
  case 'Set Piece':return 'flag';
  case 'Rules of the Game':return 'law';
  case 'Finishing':return 'goal';
  default:return 'arrow';
 }
}
/** The icon most of a group's lessons share (a chapter's head). */
export function groupIcon(lessons:readonly {category?:string}[]):FactIconKind{
 const n=new Map<FactIconKind,number>();for(const l of lessons){const k=lessonIcon(l.category);n.set(k,(n.get(k)??0)+1);}
 return [...n.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]??'arrow';
}
/** A position's shirt numbers as a card badge: "4 and 5" / "4 y 5" -> "4·5". */
export const shirtBadge=(numbers:string)=>numbers.replace(/\s+(and|y|or|o)\s+/g,'·').replace(/,\s*/g,'·');
