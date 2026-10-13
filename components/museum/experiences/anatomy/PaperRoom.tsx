'use client';
import {forwardRef,useEffect,useRef,type CSSProperties,type HTMLAttributes,type KeyboardEvent,type ReactNode,type Ref} from 'react';
import ExperienceBack from '../ExperienceBack';
import {PaperStyle} from './paper-kit';
import s from './paper.module.css';

/**
 * The anatomy Paper room (Oct 12 2026; add-only shared piece for the museum's play exhibits). The first screen is the game:
 * a slim header with the wall label beside the shared Back corner, ONE big rounded paper card (the drawing fills it), the
 * controls under it. The history scrolls below. The exhibit keeps its own dialog contract (role, aria-modal, data hooks,
 * Escape) by passing them in `rootProps`.
 */
export const paper=s;
type RoomProps={
 id:string;accent:string;ariaLabel:string;onClose:()=>void;
 rootProps?:Record<string,string|number|boolean|undefined>;
 head:ReactNode;card:ReactNode;dock?:ReactNode;children?:ReactNode;onKeyDown?:(e:KeyboardEvent<HTMLElement>)=>void;
};
export function PaperRoom({id,accent,ariaLabel,onClose,rootProps,head,card,dock,children,onKeyDown}:RoomProps){
 return <section className={s.room} role="dialog" aria-modal="true" aria-label={ariaLabel} data-museum-experience={id} data-paper {...rootProps}
  style={{'--accent':accent} as CSSProperties} onKeyDown={onKeyDown}>
  <PaperStyle/>
  <ExperienceBack onClose={onClose}/>
  <div className={s.scroll}>
   <div className={s.screen} data-paper-screen>
    <header className={s.head}>{head}</header>
    {card}
    {dock!=null&&<div className={s.dock} data-paper-dock>{dock}</div>}
   </div>
   {children!=null&&<div className={s.more}>{children}</div>}
  </div>
 </section>;
}

type CardProps={fig:ReactNode;title:ReactNode;hint:ReactNode;readout:ReactNode;readoutRef?:Ref<HTMLSpanElement>;
 note?:ReactNode;banner?:ReactNode;cover?:ReactNode;children:ReactNode}&Omit<HTMLAttributes<HTMLDivElement>,'title'>;
/** The big paper card: the corner labels (Fig, title, hint, live readout), the drawing, an optional note, banner and cover. */
export const PaperCard=forwardRef<HTMLDivElement,CardProps>(function PaperCard({fig,title,hint,readout,readoutRef,note,banner,cover,children,...rest},ref){
 return <div ref={ref} className={`${s.card} iso`} data-theme="paper" data-paper-card {...rest}>
  {children}
  <span className={s.corner} data-c="fig" aria-hidden="true">{fig}</span>
  <span className={s.corner} data-c="title" aria-hidden="true">{title}</span>
  <span className={s.corner} data-c="hint" aria-hidden="true">{hint}</span>
  <span className={s.corner} data-c="readout" ref={readoutRef} aria-hidden="true">{readout}</span>
  {note!=null&&note!==false&&<div className={s.note} aria-live="polite" data-paper-note>{note}</div>}
  {banner}
  {cover}
 </div>;
});

export function Banner({kind,big,line}:{kind:'good'|'ok'|'bad'|'info';big:ReactNode;line?:ReactNode}){
 return <div className={s.banner} data-kind={kind} role="status" data-paper-banner={kind}><b>{big}</b>{line!=null&&<span>{line}</span>}</div>;
}
export type Beat={readonly when:string;readonly head:string;readonly text:string};
/** The story intro, over the card: kicker, a big title, a deck, the beats, a start button. */
export function Intro({kicker,title,deck,beats,onStart,startLabel}:{kicker:ReactNode;title:ReactNode;deck:ReactNode;beats:readonly Beat[];onStart:()=>void;startLabel:string}){
 // Focus the start button without scrolling the cover to it (autoFocus scrolled a tall phone intro past its own title).
 const start=useRef<HTMLButtonElement>(null);useEffect(()=>{start.current?.focus({preventScroll:true});},[]);
 return <div className={s.cover} data-paper-intro>
  <div className={s.coverIn}>
   <p className={s.kicker}>{kicker}</p>
   <h2 className={s.title}>{title}</h2>
   <p className={s.deck}>{deck}</p>
   <ol className={s.beats}>{beats.map(b=><li key={b.when}><small>{b.when}</small><b>{b.head}</b><span>{b.text}</span></li>)}</ol>
   <div className={s.row}><button type="button" className={s.btn} data-tone="acc" data-museum-own-cue data-paper-start onClick={onStart} ref={start}>{startLabel}</button></div>
  </div>
 </div>;
}
/** The score, over the card: kicker, the big number, notes, buttons and the exhibit's quick check / ending (children). */
export function ScoreCover({kicker,score,unit,notes,buttons,children}:{kicker:ReactNode;score:ReactNode;unit:ReactNode;notes?:ReactNode;buttons?:ReactNode;children?:ReactNode}){
 return <div className={s.cover} data-paper-score>
  <div className={s.coverIn}>
   <p className={s.kicker}>{kicker}</p>
   <div className={s.score}><b>{score}</b><span>{unit}</span></div>
   {notes&&<div className={s.notes}>{notes}</div>}
   {buttons&&<div className={s.row}>{buttons}</div>}
   {children&&<div className={s.panel}>{children}</div>}
  </div>
 </div>;
}
export function Pips({results,total,label}:{results:readonly (string|undefined)[];total:number;label:string}){
 return <span className={s.pips} role="img" aria-label={label}>{Array.from({length:total},(_,i)=><i key={i} data-r={results[i]??(i===results.filter(Boolean).length?'now':undefined)}/>)}</span>;
}
export function Chips({items}:{items:{k:string;label:ReactNode;value:ReactNode}[]}){
 return <span className={s.chips}>{items.map(i=><span key={i.k} className={s.chip} data-chip={i.k}>{i.label}<b>{i.value}</b></span>)}</span>;
}
export function Seg<T extends string>({label,value,options,onChange,disabled}:{label:string;value:T;options:{v:T;label:ReactNode;aria?:string}[];onChange:(v:T)=>void;disabled?:boolean}){
 return <span className={s.seg} role="group" aria-label={label}>{options.map(o=><button key={o.v} type="button" aria-pressed={value===o.v} aria-label={o.aria} disabled={disabled}
  data-seg={o.v} onClick={()=>onChange(o.v)}>{o.label}</button>)}</span>;
}

/** The space the card's note takes at the top (its bottom edge + a margin), so a scene can fit below it. Measured live. */
export function noteSpace(card:HTMLElement|null,fallback=40){
 const n=card?.querySelector<HTMLElement>('[data-paper-note]');if(!n||!card)return fallback;
 if(card.hasAttribute('data-wide-note')&&card.getBoundingClientRect().width>=1100&&innerWidth>=1140)return fallback;
 const c=card.getBoundingClientRect(),r=n.getBoundingClientRect();return Math.round(r.bottom-c.top+10);
}
