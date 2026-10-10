'use client';
import {useEffect,useRef,useState} from 'react';
import LineMorph from './LineMorph';
import {PROLOGUE} from './drawings';
import s from './Experience.module.css';

/**
 * laws-1863 · the prologue (Oct 9 2026 story pass): why anybody wrote the Laws down, told in three line drawings that unfold as
 * they scroll into view. Each beat's drawing draws itself on, then moves into its second state (the ball carrier runs for the
 * posts, the sheet of paper grows into a rulebook page, Blackheath walks out); the words rise in on a spring a beat later.
 * Heat: one IntersectionObserver marks each beat seen once and is released; the drawings are LineMorph (sleeps at rest).
 * Every line is real history (sources in LAW_SOURCES): the FA was formed on 26 October 1863 at the Freemasons' Tavern in London;
 * the Laws were settled in December 1863; Blackheath left because it wanted to keep hacking and carrying.
 */
export const BEATS=[
 {when:'Before 1863',head:'Every school played its own game',text:'At Rugby School you could pick the ball up and run with it. At other schools you could only kick it. When two teams met, they argued about the rules.'},
 {when:'26 October 1863',head:'A meeting in a London tavern',text:'Men from London football clubs and schools met at the Freemasons’ Tavern and started the Football Association. Their plan: write down ONE set of rules for everyone.'},
 {when:'December 1863',head:'Thirteen Laws',text:'After weeks of arguing, thirteen Laws were printed. The Blackheath club walked out: it wanted to keep hacking (kicking shins) and carrying the ball.'},
] as const;

export default function Prologue({reduced}:{reduced:boolean}){
 const box=useRef<HTMLOListElement>(null),[seen,setSeen]=useState<number>(reduced?BEATS.length:0);
 useEffect(()=>{if(reduced){setSeen(BEATS.length);return;}const el=box.current;if(!el||typeof IntersectionObserver==='undefined'){setSeen(BEATS.length);return;}
  const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){const k=Number((e.target as HTMLElement).dataset.beat);setSeen(n=>Math.max(n,k+1));io.unobserve(e.target);}},{threshold:.4});
  el.querySelectorAll('[data-beat]').forEach(c=>io.observe(c));return()=>io.disconnect();},[reduced]);
 return <section className={s.prologue} aria-labelledby="prologue-title">
  <h2 id="prologue-title" className={s.proKicker}>How the Laws began</h2>
  <ol ref={box} className={s.proBeats}>
   {BEATS.map((b,k)=><li key={k} data-beat={k} className={s.proBeat} data-seen={k<seen||undefined}>
    <LineMorph className={s.proFig} vb={PROLOGUE[k].vb} drawing={PROLOGUE[k].a} then={PROLOGUE[k].b} thenAfter={1300} reduced={reduced} whenSeen/>
    <p className={s.proWhen}><span aria-hidden="true">{k+1}</span>{b.when}</p>
    <h3 className={s.proHead}>{b.head}</h3>
    <p className={s.proText}>{b.text}</p>
   </li>)}
  </ol>
  <p className={s.proNext} data-seen={seen>=BEATS.length||undefined}>Were their rules any good? <b>Guess which ones are still in today’s Laws.</b></p>
 </section>;
}
