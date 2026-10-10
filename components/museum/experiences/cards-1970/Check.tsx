'use client';
import {useState} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {CHECK,CHECK_SFX} from './content';
import styles from './Experience.module.css';

/**
 * cards-1970 · Full time quick check (Oct 9 2026 story pass): three history questions, drawn as a quiz-show page of the manga.
 * Pick an answer and a quiz-show sound effect stamps on the panel (ピンポン DING / ブブー BZZT), the right answer lights in
 * colour and a one-line why explains it. The calls tested the Law; this checks the story (traffic lights, language, two yellows).
 * Motion: CSS keyframes on the shared --spring curve (one-shot); none under reduced motion. No timers, no loop.
 */
export default function QuickCheck({reduced}:{reduced:boolean}){
 const [i,setI]=useState(0),[picked,setPicked]=useState<number|null>(null),[right,setRight]=useState(0);
 const done=i>=CHECK.length,item=CHECK[Math.min(i,CHECK.length-1)];
 const pick=(n:number)=>{if(picked!=null)return;setPicked(n);if(n===item.right){setRight(r=>r+1);museumSfx.reveal();}else museumSfx.card();};
 const next=()=>{museumSfx.tick();setI(i+1);setPicked(null);};
 if(done)return <div className={styles.check} data-done="true">
  <p className={styles.checkHead}><span>Quick check</span><b>{right}/{CHECK.length}</b></p>
  <p className={styles.checkWhy}>{right===CHECK.length?'Full marks! You know where the cards came from.':'Good try! The story is in the panels above: read it again any time.'}</p>
  <button type="button" className={styles.btn} onClick={()=>{setI(0);setPicked(null);setRight(0);museumSfx.tick();}}>Check again</button>
 </div>;
 const good=picked!=null&&picked===item.right,sfx=picked==null?null:good?CHECK_SFX.right:CHECK_SFX.wrong;
 return <div className={styles.check} data-reduced={reduced||undefined}>
  <p className={styles.checkHead}><span>Quick check · {i+1}/{CHECK.length}</span><b>{right}</b></p>
  <p className={styles.checkQ} key={'q'+i}>{item.q}</p>
  <div className={styles.checkOpts} role="group" aria-label={item.q} key={'o'+i}>
   {item.options.map((o,n)=><button key={o} type="button" data-museum-own-cue className={styles.checkOpt} style={{['--i' as string]:n}} onClick={()=>pick(n)}
    disabled={picked!=null} aria-pressed={picked===n} data-state={picked==null?undefined:n===item.right?'right':n===picked?'wrong':undefined}>{o}</button>)}
   {sfx&&<span className={styles.checkSfx} data-good={good||undefined} aria-hidden="true" key={'s'+i}>{sfx.ja}<small>{sfx.en}</small></span>}
  </div>
  {picked!=null&&<p className={styles.checkWhy} role="status" key={'w'+i}><b>{good?'Right! ':'Not quite. '}</b>{item.why}</p>}
  {picked!=null&&<button type="button" className={`${styles.btn} ${styles.primary}`} onClick={next}>{i+1<CHECK.length?'Next question':'See my score'}</button>}
 </div>;
}
