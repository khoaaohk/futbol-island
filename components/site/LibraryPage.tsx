import type {ReactNode} from 'react';
import {FactIcon} from './FactIcons';
import type {LibraryPic,LibrarySection} from '@/lib/site/library';
import {PLAY_PATH} from '@/lib/site/seo';
import site from '@/app/(site)/site.module.css';
import l from './library.module.css';
import RailNav from './shell/RailNav';
import {railOrder} from '@/lib/site/railNav';
/**
 * The Library page (/library and /es/library; owner, Nov 20 2026: "a page that houses all the items at the bottom of the
 * footer"; Nov 20 2026 night: "each of the side nav should smooth scroll the user down to that section. each section is a little
 * information about that section then cta to drill into internal page"). Server-rendered; the only script is LibraryMenuSpy (the
 * menu's highlight and glide). A hero with two pictures from the game, then fifteen sections, one per item, in the menu's order
 * (lib/site/railNav.ts RAIL_ORDER), each the same template (Section below) on the Library's alternating bands, then one way into the
 * game. Only the hero pictures load eagerly; the rest are lazy with their real width and height.
 */
function Pic({c}:{c:LibrarySection}){
 if(!c.pic)return <span className={l.secPic} data-icon=""><FactIcon kind={c.icon} size={72}/></span>;
 // a diagram (1200 x 630, pitch panel left, title right) is shown whole, never cropped; a photo or game still fills the frame
 return <span className={l.secPic} data-diagram={c.pic.diagram?'':undefined}><img src={c.pic.src} alt={c.alt} width={c.pic.w} height={c.pic.h} style={c.pic.pos?{objectPosition:c.pic.pos}:undefined} loading="lazy" decoding="async"/></span>;
}
/** One section, the same template every time (owner, Nov 20 2026 night: no mirrored layouts): the picture (left from 900 px, on top
 * below), then the name with its count, a few plain sentences, a few example pages and one mint button into the section. */
function Section({s,tone,exLabel}:{s:LibrarySection;tone:'tint'|'paper';exLabel:string}){
 return <section id={s.id} className={`${l.band} ${l.sec}`} data-tone={tone} aria-labelledby={`lib-${s.id}`} data-library-section={s.id}>
  <Pic c={s}/>
  <div className={l.secText}>
   <div className={l.secHead}><h2 className={l.h2} id={`lib-${s.id}`}>{s.name}</h2>{s.count&&<span className={l.count}>{s.count}</span>}</div>
   <p className={l.about}>{s.line} {s.more}</p>
   {s.examples.length>0&&<ul className={l.examples} aria-label={`${s.name}: ${exLabel}`}>{s.examples.map(e=><li key={e.href}><a href={e.href}>{e.name}</a></li>)}</ul>}
   <a className={l.go} href={s.href}>{s.cta}</a>
  </div>
 </section>;
}
export default function LibraryPage({crumbs,h1,lead,play,playTitle,playLine,hero,sections,menuLabel='Library sections',topLabel='Overview',exLabel='a few to start with'}:{crumbs:ReactNode;h1:string;lead:string;play:string;playTitle:string;playLine:string;
 menuLabel?:string;topLabel?:string;exLabel?:string;hero:{main:LibraryPic;inset:LibraryPic;mainAlt:string;insetAlt:string};sections:readonly LibrarySection[]}){
 const list=railOrder([...sections]);
 return <div className={l.page}>
  <div className={l.shelf}>
   {/* the group menu (Nov 20 2026, owner: "add the left nav to the library"; then "the left nav should be locked on the left
       side. the content on the right is the only thing that scrolls"): from 1280 px a rail locked under the header from the top
       of the page, beside the hero too; below that a row of chips under the hero (the hero comes first by CSS order). Plain
       anchor links; LibraryMenuSpy only marks the band on screen. */}
   {/* Nov 20 2026 night (owner: "we need to ungroup the side nav and place all of them on the left nav. instead of collect
       and explore. have players cards, fishbooks, museum, storybooks"): the menu lists Overview (this page) and then every
       section by name, each a link to that section's own page; the same list the section hubs show. */}
   {/* Nov 20 2026 night (owner: "each of the side nav should smooth scroll the user down to that section"): Overview (#top) and the
       fifteen sections as in-page anchors, in the menu's order; LibraryMenuSpy lights the section on screen and glides to it on a tap.
       The section hubs' rails still link to the pages (lib/site/railNav.ts libraryRail). */}
   <RailNav id="library-menu" current="#top" rail={{label:menuLabel,up:[],groups:[{items:[{href:'#top',name:topLabel},...list.map(x=>({href:`#${x.id}`,name:x.name}))]}]}}/>
   <div className={l.shelfMain}>
  <div className={l.hero} id="top" data-library-hero="">
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
  {list.map((x,i)=><Section key={x.id} s={x} tone={i%2===0?'tint':'paper'} exLabel={exLabel}/>)}
  <section className={l.close} aria-labelledby="lib-play">
   <div><h2 className={l.h2} id="lib-play">{playTitle}</h2><p>{playLine}</p></div>
   <a className={site.cta} href={PLAY_PATH}>{play}</a>
  </section>
   </div>
  </div>
 </div>;
}
