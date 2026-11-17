import type {ReactNode} from 'react';
import {FactIcon,type FactIconKind} from './FactIcons';
import site from '../../app/(site)/site.module.css';
import s from './PageParts.module.css';

/**
 * Visual pass, batch 5 (Nov 17 2026; owner: "pages are a wall of text, make them visual"): the parts that break up the about,
 * safety, trust, Fishbook, drill and practice-plan pages. Server-rendered, no script. Every word stays in the HTML; pictures are
 * the game's own screenshots (public/learn, public/marketing) with fixed width/height so nothing jumps while they load.
 */

/** A real game screenshot already in public/ (sizes from public/learn/manifest.json and the files themselves). */
export type Shot={src:string;width:number;height:number};
export const SHOTS={
 boards:{src:'/marketing/stadium/boards.webp',width:1280,height:720},
 emotes:{src:'/learn/emotes.webp',width:780,height:1688},
 saveCode:{src:'/learn/save_code.webp',width:780,height:1688},
 grownUp:{src:'/learn/friend_step1.webp',width:1600,height:900},
 lessons:{src:'/learn/slide_stories.webp',width:1600,height:900},
 cards:{src:'/learn/wide_cards.webp',width:1920,height:1080},
 fishing:{src:'/learn/wide_fishing.webp',width:1920,height:1080},
 museum:{src:'/learn/wide_museum.webp',width:1920,height:1080},
} as const satisfies Record<string,Shot>;
const Img=({shot,alt,className}:{shot:Shot;alt:string;className?:string})=>
 <img className={className} src={shot.src} width={shot.width} height={shot.height} alt={alt} loading="lazy" decoding="async"/>;

/** The trust row under the title (Free / No pop-up ads / No open chat / No accounts / Ages 7 to 12): an icon, a word, a line. */
export type Trust={icon:FactIconKind;title:string;line:string};
export function TrustTiles({items,label}:{items:readonly Trust[];label:string}){
 return <ul className={s.trust} aria-label={label} data-trust-tiles="">{items.map(t=><li key={t.title} className={s.trustTile}>
  <FactIcon kind={t.icon} size={30}/><b className={s.trustTitle}>{t.title}</b><span className={s.trustLine}>{t.line}</span></li>)}</ul>;
}

/** The promises, one card each: with a screenshot of the promise in the game beside it, or with its icon. */
export type PromiseItem={icon:FactIconKind;title:string;text:ReactNode;shot?:Shot;alt?:string};
export function Promises({items}:{items:readonly PromiseItem[]}){
 return <ul className={s.promises} data-promises="">{items.map(p=>{
  const tall=!!p.shot&&p.shot.height>p.shot.width;
  return <li key={p.title} className={`${s.promise} ${p.shot?(tall?s.promiseTall:s.promiseWide):s.promiseIcon}`}>
   <div className={s.promiseText}><h3 className={`${site.h3} ${s.iconH}`}>{!p.shot&&<FactIcon kind={p.icon} size={26}/>}<span>{p.title}</span></h3><p>{p.text}</p></div>
   {p.shot&&<Img className={s.shot} shot={p.shot} alt={p.alt??''}/>}
  </li>;})}</ul>;
}

/** A list of short points, each led by its icon (how it works, our rules, the coach notes). */
export type IconItem={icon:FactIconKind;title?:ReactNode;text:ReactNode};
export function IconList({items,two}:{items:readonly IconItem[];two?:boolean}){
 return <ul className={`${s.iconList} ${two?s.iconTwo:''}`} data-icon-list="">{items.map((it,i)=><li key={i}>
  <FactIcon kind={it.icon} size={28}/><p>{it.title&&<><b>{it.title}</b> </>}{it.text}</p></li>)}</ul>;
}
/** Coaching points as a checklist: a green tick before each line. */
export const Checklist=({items}:{items:readonly string[]})=>
 <ul className={s.checks} data-checklist="">{items.map(t=><li key={t}><FactIcon kind="tick" size={22}/><span>{t}</span></li>)}</ul>;

/** Picture tiles that link somewhere (what the game teaches): the game's own screenshot, a title and one line. */
export type Tile={href:string;title:string;line:ReactNode;shot:Shot;alt:string};
export function PictureTiles({items}:{items:readonly Tile[]}){
 return <ul className={s.tiles} data-picture-tiles="">{items.map(t=><li key={t.href}><a className={s.tile} href={t.href}>
  <Img className={s.tileImg} shot={t.shot} alt={t.alt}/><span className={s.tileTitle}>{t.title}</span><span className={s.tileLine}>{t.line}</span></a></li>)}</ul>;
}

/** "At a glance" as chips (drills, practice plans): icon, the detail's name and its value; a long value takes a full row. */
export type Chip={icon:FactIconKind;label:string;value:ReactNode};
export function Glance({items,label}:{items:readonly Chip[];label:string}){
 return <dl className={s.glance} aria-label={label} data-glance="">{items.map(c=><div key={c.label} className={typeof c.value==='string'&&c.value.length>24?`${s.chip} ${s.chipWide}`:s.chip}>
  <dt><FactIcon kind={c.icon} size={22}/><span>{c.label}</span></dt><dd>{c.value}</dd></div>)}</dl>;
}

/** Numbered steps, each with an icon (how to catch a fish). A real <ol>, so the order is read out. */
export function IconSteps({items}:{items:readonly {icon:FactIconKind;text:ReactNode}[]}){
 return <ol className={s.steps} data-icon-steps="">{items.map((it,i)=><li key={i}><FactIcon kind={it.icon} size={28}/><p>{it.text}</p></li>)}</ol>;
}

/** The short answer of an FAQ: its first sentence (two when the first is only a word or two); the rest opens under "More". */
export function splitAnswer(a:string):[string,string]{
 const parts=a.match(/[^.!?]+[.!?]+(?:\s+|$)/g);if(!parts||parts.join('')!==a)return [a,''];
 let head='',i=0;while(i<parts.length&&(head.trim().length<40||i===0)){head+=parts[i];i++;}
 return [head.trim(),parts.slice(i).join('').trim()];
}
/** An FAQ that does not repeat the cards above it word for word: each question with its short answer showing, and the rest of
 *  the same answer under it. With more to read, the short line IS the <summary> (tap it to open; the "More" cue is drawn by CSS
 *  from data-more), so the page text reads short + rest exactly as the FAQPage JSON-LD does. */
export function ShortFaq({id,title,faq,more}:{id:string;title:string;faq:readonly {q:string;a:string}[];more:string}){
 return <section className={site.section} aria-labelledby={id}><h2 className={site.h2} id={id}>{title}</h2>
  <div className={s.faq} data-short-faq={id}>{faq.map(f=>{const [head,rest]=splitAnswer(f.a);
   return <div key={f.q} className={s.faqRow}><h3 className={s.faqQ}>{f.q}</h3>
    {rest?<details className={s.faqMore}><summary data-more={more}><span className={s.faqA}>{head}</span></summary><p>{rest}</p></details>:<p className={s.faqA}>{head}</p>}</div>;})}</div>
 </section>;
}
