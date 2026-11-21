import type {CSSProperties,ReactNode} from 'react';
import {FactIcon} from './FactIcons';
import type {LibraryCard,LibraryGroup,LibraryPic} from '@/lib/site/library';
import {PLAY_PATH} from '@/lib/site/seo';
import site from '@/app/(site)/site.module.css';
import l from './library.module.css';
import LibraryMenuSpy from './LibraryMenuSpy';
/**
 * The Library page (/library and /es/library; owner, Nov 20 2026: "a page that houses all the items at the bottom of the
 * footer", then "make the new hub page visually appealing"). Server-rendered; the only script is LibraryMenuSpy (the group menu's highlight). A hero with two pictures from the
 * game, then one band per group: the group's first card is large, the others sit beside it, and every other band swaps
 * sides. A group menu (chips under the hero; a sticky left column from 1280 px) jumps to each band. Each card is one link with the section's own lead picture (lib/site/library.ts LIBRARY_PICS), its name, a count from
 * the data and one plain line. Only the hero pictures load eagerly; the rest are lazy with their real width and height.
 */
function Pic({c}:{c:LibraryCard}){
 if(!c.pic)return <span className={l.pic} data-icon=""><FactIcon kind={c.icon} size={56}/></span>;
 const d=c.pic.diagram,vars=d?{'--pa':`${d}/${c.pic.h}`,'--pc':`${(d/2/c.pic.w*100).toFixed(2)}%`,'--px':`${((1-d/c.pic.w)*100).toFixed(2)}%`} as CSSProperties:undefined;
 return <span className={l.pic} data-diagram={d?'':undefined} style={vars}><img src={c.pic.src} alt={c.alt} width={c.pic.w} height={c.pic.h} style={c.pic.pos?{objectPosition:c.pic.pos}:undefined} loading="lazy" decoding="async"/></span>;
}
function Card({c,big}:{c:LibraryCard;big:boolean}){
 return <li className={big?l.feature:l.card}><a href={c.href}>
  <Pic c={c}/>
  <span className={l.body}>
   <h3 className={l.name}>{c.name}</h3>
   {c.count&&<span className={l.count}>{c.count}</span>}
   <span className={l.line}>{c.line}</span>
  </span>
 </a></li>;
}
export default function LibraryPage({crumbs,h1,lead,play,playTitle,playLine,hero,groups,menuLabel='Library groups'}:{crumbs:ReactNode;h1:string;lead:string;play:string;playTitle:string;playLine:string;
 menuLabel?:string;hero:{main:LibraryPic;inset:LibraryPic;mainAlt:string;insetAlt:string};groups:readonly LibraryGroup[]}){
 return <div className={l.page}>
  <div className={l.shelf}>
   {/* the group menu (Nov 20 2026, owner: "add the left nav to the library"; then "the left nav should be locked on the left
       side. the content on the right is the only thing that scrolls"): from 1280 px a rail locked under the header from the top
       of the page, beside the hero too; below that a row of chips under the hero (the hero comes first by CSS order). Plain
       anchor links; LibraryMenuSpy only marks the band on screen. */}
   <nav className={l.menu} id="library-menu" aria-label={menuLabel}>
    <ul>{groups.map(g=><li key={g.id}><a href={`#group-${g.id}`}>{g.title}</a></li>)}</ul>
   </nav>
   <LibraryMenuSpy menu="library-menu"/>
   <div className={l.shelfMain}>
  <div className={l.hero} data-library-hero="">
   <header className={l.heroText}>
    {crumbs}
    <h1 className={l.h1}>{h1}</h1>
    <p className={l.lead} data-answer="">{lead}</p>
    <a className={site.cta} href={PLAY_PATH}>{play}</a>
   </header>
   <div className={l.heroArt}>
    <img className={l.heroMain} src={hero.main.src} alt={hero.mainAlt} width={hero.main.w} height={hero.main.h} decoding="async"/>
    <img className={l.heroInset} src={hero.inset.src} alt={hero.insetAlt} width={hero.inset.w} height={hero.inset.h} decoding="async"/>
   </div>
  </div>
  {groups.map((g,i)=>{const pair=g.cards.length===2;return <section key={g.id} id={`group-${g.id}`} className={l.band} data-tone={i%2===0?'tint':'paper'} aria-labelledby={`lib-${g.id}`} data-library-group={g.id}>
   <div className={l.head}><h2 className={l.h2} id={`lib-${g.id}`}>{g.title}</h2><p>{g.line}</p></div>
   <ul className={l.grid} data-rows={g.cards.length-1} data-flip={!pair&&i%2===1?'':undefined} data-pair={pair?'':undefined}>
    {g.cards.map((c,k)=><Card key={c.href} c={c} big={k===0||pair}/>)}
   </ul>
  </section>;})}
  <section className={l.close} aria-labelledby="lib-play">
   <div><h2 className={l.h2} id="lib-play">{playTitle}</h2><p>{playLine}</p></div>
   <a className={site.cta} href={PLAY_PATH}>{play}</a>
  </section>
   </div>
  </div>
 </div>;
}
