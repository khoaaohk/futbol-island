'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {paper as s} from '../anatomy/PaperRoom';
import d from './startDock.module.css';
/**
 * The intro over a Paper card WITHOUT a button of its own, and the ONE centred start button in the dock (Oct 14 2026 museum rule:
 * one start button, centred, its line under it; no second copy above). Additive shared piece (free-kick-wall, ball-curve,
 * throw-in). The intro reuses the Paper cover look (anatomy/paper.module.css) so it matches laws-1863, futsal-1989 and wwc-1991.
 */
export type IntroBeat={readonly when:string;readonly head:string;readonly text:string};
export function IntroPanel({kicker,title,deck,beats}:{kicker:ReactNode;title:ReactNode;deck:ReactNode;beats:readonly IntroBeat[]}){
 return <div className={s.cover} data-paper-intro>
  <div className={s.coverIn}>
   <p className={s.kicker}>{kicker}</p>
   <h2 className={s.title}>{title}</h2>
   <p className={s.deck}>{deck}</p>
   <ol className={s.beats}>{beats.map(b=><li key={b.when+b.head}><small>{b.when}</small><b>{b.head}</b><span>{b.text}</span></li>)}</ol>
  </div>
 </div>;
}
export function StartDock({label,line,onStart}:{label:string;line:ReactNode;onStart:()=>void}){
 // Focus the start button without scrolling (autoFocus scrolled a tall phone intro).
 const b=useRef<HTMLButtonElement>(null);useEffect(()=>{b.current?.focus({preventScroll:true});},[]);
 return <div className={d.dock} data-start-dock>
  <button ref={b} type="button" className={`${s.btn} ${d.start}`} data-tone="acc" data-start data-museum-own-cue onClick={onStart}>{label}</button>
  <p className={d.line}>{line}</p>
 </div>;
}
