import type {CSSProperties,ReactNode} from 'react';
import FaqEnhance from '@/components/learn/FaqEnhance';
import {GAME_PAGES,type GamePage} from '@/lib/site/games';
import {gameStills} from '@/lib/site/gameMedia';
import {LIBRARY_HERO,LIBRARY_PICS,type LibraryPic} from '@/lib/site/library';
import site from '@/app/(site)/site.module.css';
import lib from '@/components/site/library.module.css';
import g from './games.module.css';
/**
 * The lower sections of /games (layout batch 3, Nov 20 2026; owner: "these should be their own space and not two columns. if we
 * need to add imagery to both. it's too tight and wall of text"). Each is its own full-width band with the Library's band spacing
 * (library.module.css .band/.head, alternating tone), a heading and a one-line lede, and pictures the site already has: the games'
 * own phone stills, the island from above (the Library's hero picture) and the guides' diagrams (lib/site/library.ts LIBRARY_PICS).
 * Server-rendered; the only script is the FAQ's existing FaqEnhance. Every picture is lazy with its real width and height.
 */
/* Nov 20 2026 night (review: the menu still lit "Ball Blaster" with "Which game to start with" on screen): the menu's anchor id sits on the
   whole band, not on its H2, so the spy's middle line finds it while any part of the band is there; scroll-margin (library.module.css
   .shelfMain [id]) still lands the band under the header. */
function Band({id,title,line,tone,children}:{id:string;title:string;line:string;tone:'tint'|'paper';children:ReactNode}){
 return <section id={id} className={`${lib.band} ${g.lband}`} data-tone={tone} aria-labelledby={`${id}-h`} data-own-grid="" data-games-lower={id}>
  <div className={lib.head}><h2 className={lib.h2} id={`${id}-h`}>{title}</h2><p>{line}</p></div>
  {children}
 </section>;
}
/** The games named in a sentence, in the order they appear, each name a link to its card on this page. */
const BY_NAME=[...GAME_PAGES].sort((a,b)=>b.name.length-a.name.length);
const NAME_RE=new RegExp(`(${BY_NAME.map(x=>x.name.replace(/[.*+?^${}()|[\]\\!]/g,'\\$&')).join('|')})`,'g');
function linked(text:string):{nodes:ReactNode[];games:GamePage[]}{
 const games:GamePage[]=[];
 const nodes=text.split(NAME_RE).map((part,i)=>{const game=BY_NAME.find(x=>x.name===part);if(!game)return part;games.push(game);
  return <a key={i} href={`#game-${game.id}`}>{part}</a>;});
 return {nodes,games};
}
/** "Which game to start with": every pick as a card, the game's phone still(s), the label in bold, the reason with the names linked. */
export function PickBand({id,title,line,picks}:{id:string;title:string;line:string;picks:readonly (readonly [string,string])[]}){
 return <Band id={id} title={title} line={line} tone="tint">
  <ul className={g.picks}>{picks.map(([label,why])=>{const {nodes,games}=linked(why);
   return <li key={label} className={g.pick}>
    <span className={g.pickPics} data-n={Math.min(2,games.length)}>{games.slice(0,2).map(x=>{const s=gameStills(x.id,2)[1]??gameStills(x.id,1)[0];
     // eslint-disable-next-line @next/next/no-img-element
     return s?<img key={x.id} src={s.src} alt={`${x.name} on a phone: ${label.toLowerCase()}`} width={s.w} height={s.h} loading="lazy" decoding="async"/>:null;})}</span>
    <span className={g.pickWords}><b className={g.pickLabel}>{label}</b><span>{nodes}</span></span>
   </li>;})}</ul>
 </Band>;
}
/** "For parents and coaches": the island from above beside the four points, each a short bold label and its sentence. */
export function SafeBand({id,title,line,points,guide,foot}:{id:string;title:string;line:string;points:readonly (readonly [string,string])[];guide:ReactNode;foot:string}){
 const p=LIBRARY_HERO.main;
 return <Band id={id} title={title} line={line} tone="paper">
  <div className={g.safe}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img className={g.safePic} src={p.src} alt="Futbol Island seen from above: the town square, a small caged pitch and children walking between them" width={p.w} height={p.h} loading="lazy" decoding="async"/>
   <div className={g.safeWords}>
    <ul className={g.points}>{points.map(([k,v])=><li key={k}><b>{k}</b><span>{v}</span></li>)}</ul>
    <p className={g.guideLink}>{guide}</p>
    <p className={g.foot}>{foot}</p>{/* the closing line that sat alone under the lower sections until batch 3 */}
   </div>
  </div>
 </Band>;
}
/** "Questions about the games": the site's accordion (site.module.css .faqList, FaqEnhance) at a reading width on the content edge.
 * The questions are the FAQPage data unchanged. */
export function FaqBand({id,title,line,faq}:{id:string;title:string;line:string;faq:readonly {q:string;a:string}[]}){
 return <Band id={id} title={title} line={line} tone="tint">
  <div className={`${site.faqList} ${g.faq}`} data-faq={id}>{faq.map((f,i)=><details key={f.q} className={site.faqItem} open={i===0||undefined} data-x={i===0?'':undefined}>
   <summary className={site.faqSum}><h3 className={site.faqQ}>{f.q}</h3><span className={site.plus} aria-hidden="true"/></summary>
   <div className={site.faqBody}><div className={site.faqIn}><p>{f.a}</p></div></div></details>)}</div>
  <FaqEnhance selector={`[data-faq="${id}"]`}/>
 </Band>;
}
/** A guide's picture, as the Library's small card shows it (a diagram shows its pitch panel whole; LibraryPage.tsx Pic). */
function Pic({pic,alt}:{pic:LibraryPic;alt:string}){
 const d=pic.diagram,vars=d?{'--pa':`${d}/${pic.h}`,'--pc':`${(d/2/pic.w*100).toFixed(2)}%`,'--px':`${((1-d/pic.w)*100).toFixed(2)}%`} as CSSProperties:undefined;
 // eslint-disable-next-line @next/next/no-img-element
 return <span className={lib.pic} data-diagram={d?'':undefined} style={vars}><img src={pic.src} alt={alt} width={pic.w} height={pic.h} loading="lazy" decoding="async"/></span>;
}
/** "Learn the ideas behind the games": six guide cards in the Library's small-card style, three across on wide screens. */
export function GuidesBand({id,title,line,links}:{id:string;title:string;line:string;links:readonly {path:string;name:string;line:string;pic:string;alt:string}[]}){
 return <Band id={id} title={title} line={line} tone="paper">
  <ul className={g.guides}>{links.map(l=>{const pic=LIBRARY_PICS[l.pic];
   return <li key={l.path} className={lib.card}><a href={l.path}>
    {pic&&<Pic pic={pic} alt={l.alt}/>}
    <span className={lib.body}><h3 className={lib.name}>{l.name}</h3><span className={lib.line}>{l.line}</span></span>
   </a></li>;})}</ul>
 </Band>;
}
