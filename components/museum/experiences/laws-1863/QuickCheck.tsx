'use client';
import {useState} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import s from './Experience.module.css';

/**
 * laws-1863 · "Quick check" (Oct 9 2026 story pass): the ending. Three questions on what the rulebook just showed, one at a time.
 * Tap an answer: a right one draws a tick, a wrong one shakes and the right one lights up; either way one line says why. The next
 * question rises in on a spring. After the third, a seal draws itself round the score. No loop: CSS one-shots only.
 */
export type Q={q:string;options:readonly string[];answer:number;why:string};
export const CHECK:readonly Q[]=[
 {q:'What did the goal get first, to give it a top?',options:['A crossbar','A tape'],answer:1,
  why:'A tape went across the posts in 1866. A tape can sag, so a solid crossbar became a must in 1882.'},
 {q:'Which 1863 rule is still a rule today?',options:['Swap ends after every goal','Race for the throw-in','No tripping'],answer:2,
  why:'Tripping was against the Laws in 1863 and it still is. Today teams swap ends only at half-time, and the throw-in goes to the other team.'},
 {q:'Who looks after the Laws of the Game today?',options:['Each club makes its own','The IFAB','The two captains'],answer:1,
  why:'Since 1886 the IFAB has looked after the Laws, so a game is played the same way all over the world.'},
];
export const checkVerdict=(n:number,total:number)=>n===total?'Every one right! You could write the next Law.':n>=total-1?'Nearly perfect! Have another look at the rulebook.':'Good try! Drag the year again and watch what changes.';

export default function QuickCheck(){
 const [picks,setPicks]=useState<number[]>([]);
 const k=picks.length,done=k===CHECK.length,right=picks.filter((p,i)=>p===CHECK[i].answer).length;
 const pick=(i:number,o:number)=>{if(i!==k)return;setPicks(p=>[...p,o]);if(i===CHECK.length-1)museumSfx.reveal();else if(o===CHECK[i].answer)museumSfx.stamp();else museumSfx.look();};
 return <section className={s.check} aria-labelledby="check-title">
  <p className={s.finaleKicker}>Quick check</p>
  <h2 id="check-title" className={s.checkTitle}>Three questions on the Laws</h2>
  <ol className={s.checkList}>
   {CHECK.slice(0,Math.min(k+1,CHECK.length)).map((c,i)=>{const p=picks[i],answered=p!=null;
    return <li key={i} className={s.checkQ} data-answered={answered||undefined}>
     <p className={s.checkAsk}><span aria-hidden="true">{i+1}</span>{c.q}</p>
     <div className={s.checkOpts} role="group" aria-label={c.q}>
      {c.options.map((o,j)=>{const state=!answered?undefined:j===c.answer?'right':j===p?'wrong':'off';
       return <button key={j} type="button" className={s.checkOpt} data-state={state} disabled={answered} aria-pressed={answered?j===p:undefined} onClick={()=>pick(i,j)}>
        {state==='right'&&<svg aria-hidden="true" viewBox="0 0 16 16"><path pathLength={1} d="M3 8.5l3.2 3.2L13 4.5"/></svg>}{o}</button>;})}
     </div>
     {answered&&<p className={s.checkWhy} role="status"><b>{p===c.answer?'Right!':'Not quite.'}</b> {c.why}</p>}
    </li>;})}
  </ol>
  {done&&<div className={s.checkDone} role="status">
   <span className={s.seal} aria-hidden="true"><svg viewBox="0 0 80 80"><path pathLength={1} d="M40 6a34 34 0 1 1-.1 0"/></svg><b>{right}/{CHECK.length}</b>right</span>
   <p className={s.finaleLine}>{checkVerdict(right,CHECK.length)}</p>
   <button type="button" className={s.finaleBtn} onClick={()=>setPicks([])}>Try again</button>
  </div>}
 </section>;
}
