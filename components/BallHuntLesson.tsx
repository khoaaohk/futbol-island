'use client';
import {pathText} from '@/lib/paths/pathText';
import {useEffect,useId,useRef,useState} from 'react';
import {COIN_QUEST} from '@/lib/town/coinQuest';
import {dismissCoinCelebration,useCoinProgress} from '@/lib/town/coinProgress';
import {BALL_HUNT_LESSONS,BALL_HUNT_PRACTICE,ballLessonFrame} from '@/lib/town/ballHuntLessons';
import styles from './BallHuntLesson.module.css';

export default function BallHuntLesson({spotId,onDismiss,replay=false,practice=false}:{spotId:string;onDismiss:()=>void;replay?:boolean;practice?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),[step,setStep]=useState(0),[hidden,setHidden]=useState(false),id=useId().replace(/:/g,''),progress=useCoinProgress();
 const spot=COIN_QUEST.find(item=>item.id===spotId),lesson=BALL_HUNT_LESSONS[spotId];
 useEffect(()=>{const node=dialog.current,previous=document.activeElement as HTMLElement|null;node?.showModal();const visibility=()=>setHidden(document.hidden);visibility();document.addEventListener('visibilitychange',visibility);return()=>{document.removeEventListener('visibilitychange',visibility);node?.close();previous?.focus?.({preventScroll:true});};},[]);
 useEffect(()=>setStep(0),[spotId]);
 if(!spot||!lesson)return null;
 const frame=ballLessonFrame(lesson.kind,step),title=spot.teaching.slice(0,spot.teaching.indexOf('.')),tip=spot.teaching.slice(spot.teaching.indexOf('.')+1).trim(),complete=!replay&&progress.collected.length===COIN_QUEST.length&&!progress.celebrated;
 const dismiss=()=>{if(complete)dismissCoinCelebration();onDismiss();};
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`} onCancel={event=>{event.preventDefault();event.stopPropagation();}} onKeyDown={event=>event.stopPropagation()} data-hidden={hidden}>
  <section className={styles.panel}>
   <header className={styles.header}><p>{practice?'Practice idea':replay?'futbo discovery':'Ball found'} · {progress.collected.length}/{COIN_QUEST.length}</p><h2 id={`${id}-title`}>{title}</h2></header>
   <div className={styles.body}>
    <p className={styles.tip}>{pathText(practice?BALL_HUNT_PRACTICE[spotId]:tip)}</p>
    <div className={styles.illustration}>
     <div className={styles.diagramHeading}><span>{practice?'Predict, then reveal':lesson.kind==='community'?'Connect the story':'See it on the pitch'}</span><span>{step+1} / 3</span></div>
     <svg viewBox="0 0 330 248" role="img" aria-labelledby={`${id}-graphic-title ${id}-graphic-desc`} className={styles.field}>
      <title id={`${id}-graphic-title`}>{title}: step {step+1}</title><desc id={`${id}-graphic-desc`}>{pathText(lesson.steps[step])} Solid arrows show the ball route. Dashed arrows show a player run.</desc>
      <defs><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#436953"/></marker></defs>
      {lesson.kind!=='community'&&<g className={styles.pitchLines}><rect x="14" y="22" width="302" height="212" rx="8"/>{frame.side?<path d="M25 199H305"/>:<><path d="M14 127H316"/><circle cx="165" cy="127" r="32"/></>}</g>}
      {frame.zone&&<rect x={frame.zone[0]} y={frame.zone[1]} width={frame.zone[2]} height={frame.zone[3]} rx="15" className={styles.space}/>}
      <g className={styles.routes}>{frame.paths.map((path,index)=><path key={path} d={path} markerEnd={`url(#${id}-arrow)`} className={styles.route}/>)}{frame.run&&step>0&&<path d={frame.run} markerEnd={`url(#${id}-arrow)`} className={styles.run}/>}</g>
      {frame.nodes.map(node=><g key={node.id} className={`${styles.token} ${styles[node.role]}`} style={{transform:`translate(${node.x}px,${node.y}px)`}}>
       {node.role==='ball'?<g className={styles.ballArrival}><circle r="7"/><path d="M-2-3L3-2L4 2L0 5L-4 1Z"/></g>:<>
        {((lesson.kind==='feet'||lesson.kind==='feet-both')&&(node.id==='left'||node.id==='right')||(['far-foot','request-foot'].includes(lesson.kind)&&['a','b'].includes(node.id))||(lesson.kind==='cushion'&&node.id==='a'))?<path className={styles.foot} d="M-9 13Q-15 0-9-14Q-5-23 2-18L10 3Q15 19 1 19Z" style={{transform:`rotate(${node.id==='left'?-25:25}deg)`}}/>:<circle r={node.role==='club'?23:13}/>}
        {node.role==='team'&&lesson.kind!=='community'&&lesson.kind!=='feet'&&lesson.kind!=='feet-both'&&<path d="M0-9L5 2H-5Z" className={styles.facing} style={{transform:`rotate(${node.angle??0}deg)`}}/>}
        <text y={node.role==='club'?4:29} textAnchor="middle">{node.label}</text>
       </>}
      </g>)}
      {frame.note&&<text className={styles.note} x="165" y="17" textAnchor="middle">{frame.note}</text>}
     </svg>
     <div className={styles.legend}>{lesson.kind==='community'?'People + traditions = club identity':<>● Teammates <span>● Pressure</span> <b>▰ Open space</b></>}</div>
     <p className={styles.caption} aria-live="polite">{pathText(lesson.steps[step])}</p>
     <button className={styles.secondary} type="button" onClick={()=>setStep(value=>(value+1)%3)}>{step<2?lesson.actions[step]:'Try it again'} <span aria-hidden="true">↗</span></button>
    </div>
    {complete&&<p className={styles.reward}><strong>All {COIN_QUEST.length} balls found!</strong> All costumes are unlocked in the Store. Choose your favorite and keep exploring.</p>}
   </div>
   <footer className={styles.footer}><button type="button" className={styles.primary} onClick={dismiss} autoFocus>Got it</button></footer>
  </section>
 </dialog>;
}
