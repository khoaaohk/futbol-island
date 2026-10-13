'use client';
import {useState,type ReactNode} from 'react';
import s from './modern.module.css';
/**
 * The shared one-at-a-time quick check (docs/museum-modern-style.md, Oct 10 2026): one question at a time in the sans, answers as plain
 * outlined pills, the right answer fills with the exhibit's --accent, then a one-line why. No timers, no loops; the only motion
 * is the pill's CSS colour change. `onPick` lets an exhibit play its own sound; `renderDone` draws the exhibit's own ending.
 * Additive shared piece: other exhibits may import it, so keep the props backwards compatible.
 */
export type CheckItem={q:string;options:readonly string[];right:number;why:string};
export default function StepCheck({items,kicker,onPick,onNext,onDone,renderDone,nextLabel,doneLabel,className}:{
 items:readonly CheckItem[];
 /** The small line above the question, e.g. (i,n)=>`Quick check · ${i+1} of ${n}`. */
 kicker?:(i:number,n:number)=>ReactNode;
 onPick?:(right:boolean)=>void;onNext?:()=>void;
 /** Called once with the score when the last question is answered and the visitor moves on. */
 onDone?:(score:number)=>void;
 renderDone?:(score:number,again:()=>void)=>ReactNode;
 nextLabel?:string;doneLabel?:string;className?:string;
}){
 const [i,setI]=useState(0),[picked,setPicked]=useState<number|null>(null),[score,setScore]=useState(0),[done,setDone]=useState(false);
 const item=items[Math.min(i,items.length-1)];
 const again=()=>{setI(0);setPicked(null);setScore(0);setDone(false);};
 if(done&&renderDone)return <>{renderDone(score,again)}</>;
 const pick=(n:number)=>{if(picked!=null)return;setPicked(n);const ok=n===item.right;if(ok)setScore(v=>v+1);onPick?.(ok);};
 const next=()=>{onNext?.();if(i+1<items.length){setI(i+1);setPicked(null);}else{setDone(true);onDone?.(score);}};
 return <div className={`${s.check}${className?' '+className:''}`} data-quick-check={i+1}>
  {kicker&&<p className={s.labelMeta}>{kicker(i,items.length)}</p>}
  <p className={s.checkQ} key={'q'+i}>{item.q}</p>
  <div className={s.pills} role="group" aria-label={item.q} key={'o'+i}>
   {item.options.map((o,n)=><button key={o} type="button" className={s.pill} onClick={()=>pick(n)} disabled={picked!=null} aria-pressed={picked===n} data-museum-own-cue
    data-a={picked==null?undefined:n===item.right?'right':n===picked?'wrong':undefined}>{o}</button>)}
  </div>
  <p className={s.why} role="status">{picked!=null&&<><b>{picked===item.right?'Right. ':'Not quite. '}</b>{item.why}</>}</p>
  {picked!=null&&<div className={s.pills}><button type="button" className={s.pill} data-next onClick={next} data-museum-own-cue>{i+1<items.length?(nextLabel??'Next question'):(doneLabel??'See your result')}</button></div>}
 </div>;
}
