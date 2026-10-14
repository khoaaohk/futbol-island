'use client';
import {useEffect,useRef,type CSSProperties,type KeyboardEventHandler,type ReactNode,type RefObject} from 'react';
import ExperienceBack from '../ExperienceBack';
import {ISO_CSS} from './iso-kit';
import type {Item,Part} from './figure';
import s from './PaperStage.module.css';

/**
 * The Paper room (Oct 12 2026 anatomy restyle): the frame var-2018 stands in (cards-1970 and backpass-1992 used it until they were replaced on Oct 12 2026).
 * The first screen IS the game: a short wall label beside Back, then one big rounded paper card that takes all the height left
 * (100dvh minus the label and the controls) and the full width, then the controls. The wall text, history and sources sit
 * below the fold. Escape leaves; the game's keys are heard anywhere in the room.
 * (Moved here from cards-1970/paper.tsx in the Oct 12 2026 consolidation. PaperRoom.tsx is the sibling room the laws-1863,
 * futsal-1989 and wwc-1991 exhibits use; both share the Paper tokens of paper-kit.tsx.)
 */
export function Room({id,label,onClose,onKeyDown,accent,data,head,stage,dock,children}:{id:string;label:string;onClose:()=>void;
 onKeyDown?:KeyboardEventHandler<HTMLElement>;accent:string;data?:Record<`data-${string}`,string|number|boolean|undefined>;
 head:ReactNode;stage:ReactNode;dock:ReactNode;children?:ReactNode}){
 const root=useRef<HTMLElement>(null),close=useRef(onClose),keys=useRef(onKeyDown);close.current=onClose;keys.current=onKeyDown;
 useEffect(()=>{root.current?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();close.current();return;}
   if(e.target===document.body&&keys.current)keys.current(e as unknown as Parameters<KeyboardEventHandler<HTMLElement>>[0]);};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} data-museum-experience={id}
  className={`iso ${s.room}`} data-theme="light" onKeyDown={onKeyDown} style={{'--accent':accent} as CSSProperties} {...data}>
  <style dangerouslySetInnerHTML={{__html:ISO_CSS}}/>
  <ExperienceBack onClose={onClose}/>
  <div className={s.scroll}>
   <div className={s.screen} data-play-screen>
    <header className={s.head}>{head}</header>
    <div className={s.card} data-play-area>{stage}</div>
    <div className={s.dock}>{dock}</div>
   </div>
   {children!=null&&<div className={s.below}>{children}</div>}
  </div>
 </section>;
}

/** The four corner labels of the card (Fig n · title · hint · live readout), anatomy style. */
export function Corners({fig,title,hint,readout,readoutRef}:{fig:ReactNode;title:ReactNode;hint?:ReactNode;readout?:ReactNode;readoutRef?:RefObject<HTMLSpanElement>}){
 return <div className={s.corners} aria-hidden="true">
  <span data-corner="fig">{fig}</span><span data-corner="title">{title}</span>
  {hint!=null&&<span data-corner="hint">{hint}</span>}<span data-corner="readout" ref={readoutRef}>{readout}</span>
 </div>;
}

/** An overlay sheet inside the card (story intro, results). */
export function Sheet({children,label,wide}:{children:ReactNode;label:string;wide?:boolean}){
 return <div className={s.sheet} role="group" aria-label={label}><div className={s.sheetIn} data-wide={wide||undefined}>{children}</div></div>;
}

/** The card's size (paper-kit useBox: [ref, {w, h}], the SVG viewBox is exactly this) and the frame loop (the ONE shared Paper
 *  loop, paper-loop.ts: wake() starts it, it stops when the tick returns false, parks off-screen / hidden, cancelled on unmount). */
export {useBox} from './paper-kit';
export {useFrames} from './paper-loop';

const GLOW={red:'#e4322b',yellow:'#f2c230',green:'#1f8a5b',blue:'#2a5bd7'};
/** Shared SVG defs: the soft floor shadow and a lamp glow per colour. */
export function PaperDefs({id}:{id:string}){
 return <defs>
  <radialGradient id={`${id}-shadow`}><stop offset="0" stopColor="#4a4a44" stopOpacity=".34"/><stop offset=".6" stopColor="#4a4a44" stopOpacity=".16"/><stop offset="1" stopColor="#4a4a44" stopOpacity="0"/></radialGradient>
  {(['red','yellow','green','blue'] as const).map(c=><radialGradient key={c} id={`${id}-glow-${c}`}><stop offset="0" stopColor={GLOW[c]} stopOpacity=".55"/><stop offset=".45" stopColor={GLOW[c]} stopOpacity=".18"/><stop offset="1" stopColor={GLOW[c]} stopOpacity="0"/></radialGradient>)}
 </defs>;
}
export function Shadow({id,cx,cy,rx,ry,o=1}:{id:string;cx:number;cy:number;rx:number;ry:number;o?:number}){
 return <ellipse className={s.shadow} cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} opacity={o}/>;
}

const f1=(n:number)=>Math.round(n*10)/10;
/** Paint items (already depth-sorted): capsules, balls, flat polygons (cards), studs. */
export function Items({items}:{items:Item[]}){
 return <>{items.map((it,i)=>{
  if(it.kind==='cap'){const d=`M${f1(it.a[0])} ${f1(it.a[1])}L${f1(it.b[0])} ${f1(it.b[1])}`,r=Math.max(1.2,it.r),hx=-r*.28,hy=-r*.34;
   return <g key={i} className={s.cap} data-tone={it.tone}>
    <path d={d} className={s.capEdge} strokeWidth={r*2+1.3}/>
    <path d={d} className={s.capBody} strokeWidth={r*2}/>
    <path d={`M${f1(it.a[0]+hx)} ${f1(it.a[1]+hy)}L${f1(it.b[0]+hx)} ${f1(it.b[1]+hy)}`} className={s.capLight} strokeWidth={r*.9}/>
   </g>;}
  if(it.kind==='ball'){const r=Math.max(1.5,it.r);
   return <g key={i} className={s.ball} data-tone={it.tone}>
    <circle cx={f1(it.c[0])} cy={f1(it.c[1])} r={r+.65} className={s.ballEdge}/>
    <circle cx={f1(it.c[0])} cy={f1(it.c[1])} r={r} className={s.ballBody}/>
    <circle cx={f1(it.c[0]-r*.22)} cy={f1(it.c[1]-r*.26)} r={r*.66} className={s.ballLight}/>
    {it.id==='ball'&&<>{[0,1,2].map(n=>{const a=(it.spin??0)+n*2.094;return <circle key={n} cx={f1(it.c[0]+Math.cos(a)*r*.52)} cy={f1(it.c[1]+Math.sin(a)*r*.52)} r={r*.2} className={s.ballPatch}/>;})}</>}
   </g>;}
  if(it.kind==='poly')return <path key={i} className={s.poly} data-tone={it.tone} d={`M${it.pts.map(p=>`${f1(p[0])} ${f1(p[1])}`).join('L')}Z`}/>;
  return <g key={i} className={s.studs}>{it.pts.map((p,n)=><circle key={n} cx={f1(p[0])} cy={f1(p[1])} r={it.r}/>)}</g>;
 })}</>;
}

const LENS:Record<'red'|'yellow'|'green',string>={red:'#e4322b',yellow:'#f2c230',green:'#1f8a5b'};
/** Paint static bench parts in order (kit solids: fill, four shades, top, crease, bevel, inner seams, outline). */
export function Parts({parts,id}:{parts:Part[];id:string}){
 return <>{parts.map((p,i)=>{
  if(p.kind==='halo')return <path key={i} className="iso-halo" d={p.d}/>;
  if(p.kind==='solid'){const x=p.paths,c=p.crease??'faint';
   return <g key={i} className="iso-solid" data-lit={p.lit?'':undefined}>
    {p.halo&&<path className="iso-halo" d={x.fill}/>}
    <path className="iso-fill" d={x.fill}/>
    {x.shades.map((d,n)=>d?<path key={n} className="iso-shade" data-shade={n} d={d}/>:null)}
    {x.top&&<path className="iso-top" d={x.top}/>}
    {c!=='none'&&x.crease&&<path className="iso-line" data-tone={c} d={x.crease}/>}
    {c!=='none'&&x.bevel&&<path className="iso-line" data-tone={c} d={x.bevel}/>}
    {p.inner&&<g dangerouslySetInnerHTML={{__html:p.inner}}/>}
    {x.outline&&<path className="iso-line iso-edge" data-tone={p.tone??'hi'} d={x.outline}/>}
   </g>;}
  if(p.kind==='line')return p.d?<path key={i} className="iso-line" data-tone={p.tone??'lo'} data-free={p.free?'':undefined} d={p.d}/>:null;
  if(p.kind==='dots')return <g key={i} className="iso-dots" data-tone={p.tone??'mid'}>{p.pts.map((q,n)=><circle key={n} cx={f1(q[0])} cy={f1(q[1])} r={p.size??.6}/>)}</g>;
  if(p.kind==='text')return <text key={i} className="iso-face-text" data-tone={p.ink?'hi':'mid'} transform={p.transform} fontSize={p.size} style={p.ink==='accent'?{fill:'var(--accent)'}:undefined}>{p.text}</text>;
  if(p.kind==='items')return <Items key={i} items={p.items}/>;
  const on=p.on===p.colour;
  return <g key={i}>
   {on&&<circle cx={f1(p.glow[0])} cy={f1(p.glow[1])} r={p.r*3.4} fill={`url(#${id}-glow-${p.colour})`}/>}
   <path d={p.d} fill={on?LENS[p.colour]:'#cfcfc8'} stroke="var(--anatomy-hi)" strokeWidth=".8"/>
  </g>;
 })}</>;
}
