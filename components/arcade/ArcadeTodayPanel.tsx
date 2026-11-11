'use client';
import {useEffect,useRef} from 'react';
import {DoneButton} from '../DoneButton';
import {arcadeCabinets,type ArcadeCabinetId} from '@/lib/arcade/arcadeCatalog';
import {dailyRunOpen,requestTodayLaunch,useArcadeToday} from '@/lib/arcade/arcadeToday';
import {PENNANT_DAYS,pennantLit,todayChallenges,todayPlayButton,weekDays} from '@/lib/arcade/arcadeTodayCore';
import {localPlayDay} from '@/lib/town/dailyPlay';
import {LEARN_COINS} from '@/lib/economy';
import panel from '../ArcadeCoinsPanel.module.css';
import styles from './ArcadeTodayPanel.module.css';

/**
 * "Today in the arcade" (Nov 10 2026): one daily challenge per cabinet, the same for everyone today (arcadeTodayCore.ts), with
 * its football point, done / not done, and a Play button that opens the cabinet in the right mode. Same side-sheet look as
 * the Coins panel (its CSS module is reused). Static: no timers, no animation beyond the sheet's own arrival.
 */
export default function ArcadeTodayPanel({onClose,onPlay}:{onClose:()=>void;onPlay:(id:ArcadeCabinetId)=>void}){
 const save=useArcadeToday(),dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const restore=document.activeElement as HTMLElement;dialog.current?.showModal();close.current?.focus();return()=>restore?.focus?.();},[]);
 const day=localPlayDay(Date.now()),done=new Set(save.done[day]??[]),week=Math.min(PENNANT_DAYS,weekDays(save,day)),lit=pennantLit(save,day),runnerOpen=dailyRunOpen();
 return <dialog id="arcade-today-panel" ref={dialog} className={panel.dialog} aria-labelledby="arcade-today-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <header><h2 id="arcade-today-title" className={styles.title}>Today in the arcade</h2><DoneButton ref={close} onDone={onClose}/></header>
  <div className={panel.body}>
   <p className={styles.intro}>One challenge on every machine, the same for everyone today. Each one done pays {LEARN_COINS.arcade} learning coins.</p>
   <ul className={styles.list}>{todayChallenges(day).map(c=>{const cab=arcadeCabinets.find(m=>m.id===c.cabinet)!,isDone=done.has(c.cabinet),locked=c.cabinet==='runner'&&!runnerOpen,btn=todayPlayButton(c.cabinet,{done:isDone,runnerOpen});
    return <li key={c.cabinet} className={styles.row} data-today={c.cabinet} data-done={isDone||undefined} style={{['--cabinet' as string]:cab.color}}>
     <div className={styles.top}><h3>{cab.name}</h3><b className={styles.state}>{isDone?'Done today':`+${LEARN_COINS.arcade} coins`}</b></div>
     <p className={styles.line}>{c.line}</p>
     <p className={styles.point}>{c.point}</p>
     {locked&&<p className={styles.point}>Opens after 1 ★ on Warm-up or Breakaway.</p>}
     <button type="button" className={styles.play} aria-label={btn.today?`${btn.label} ${cab.name}`:`Play ${cab.name}`} onClick={()=>{if(btn.today)requestTodayLaunch(c.cabinet);onPlay(cab.id);}}>{btn.label}</button>
    </li>;})}</ul>
   <section className={styles.pennant} data-lit={lit||undefined} aria-label="Weekly pennant">
    <svg viewBox="0 0 40 48" width="40" height="48" aria-hidden="true"><path d="M5 3v43" stroke="#c9bddc" strokeWidth="3" strokeLinecap="round"/><path d="M7 5h28l-8 10 8 10H7z" fill={lit?'#ffe58c':'#3a3452'}/></svg>
    <div><h3>{lit?'Pennant lit this week':'Weekly pennant'}</h3>
     <p>{lit?'You practised on 3 different days. Little and often is how players get better.':`Do a challenge on ${PENNANT_DAYS} different days this week to light it. Any days work.`}</p>
     <p className={styles.days} aria-label={`${week} of ${PENNANT_DAYS} days this week`}>{Array.from({length:PENNANT_DAYS},(_,i)=><i key={i} data-on={i<week||undefined}/>)}</p>
    </div>
   </section>
  </div>
 </dialog>;
}
