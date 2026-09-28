'use client';
import {pathText} from '@/lib/paths/pathText';
import {useEffect,useId,useLayoutEffect,useRef,useState,type KeyboardEvent} from 'react';
import {COIN_QUEST} from '@/lib/town/coinQuest';
import {dismissCoinCelebration,useCoinProgress} from '@/lib/town/coinProgress';
import {BALL_HUNT_LESSONS,BALL_HUNT_PRACTICE,LANDSCAPE,ballLessonFrame,diagramLayout,type DiagramLayout} from '@/lib/town/ballHuntLessons';
import {advanceLesson,canFinishLesson,canGoBack,forwardLessonStep,lessonPrimaryLabel,lessonStepKey,previousLessonStep,startLessonStepper} from '@/lib/town/ballLessonStepper';
import {NavigationButton} from './DoneButton';
import BallLessonDiagram from './BallLessonDiagram';
import navStyles from './DoneButton.module.css';
import styles from './BallHuntLesson.module.css';

/**
 * A found ball's lesson card. The child plays every diagram step with the bottom button before "Got it" replaces it,
 * so the play is watched, not skipped. Escape never dismisses (as before); each step is one press, so the card is
 * never a keyboard trap. Previous/arrow keys revisit steps already played.
 */
export default function BallHuntLesson({spotId,onDismiss,replay=false,practice=false}:{spotId:string;onDismiss:()=>void;replay?:boolean;practice?:boolean}){
 const spot=COIN_QUEST.find(item=>item.id===spotId),lesson=BALL_HUNT_LESSONS[spotId],stepCount=lesson?.steps?.length??0;
 const dialog=useRef<HTMLDialogElement>(null),primary=useRef<HTMLButtonElement>(null),[stepper,setStepper]=useState(()=>startLessonStepper(stepCount)),[hidden,setHidden]=useState(false),id=useId().replace(/:/g,''),progress=useCoinProgress();
 useEffect(()=>{const node=dialog.current,previous=document.activeElement as HTMLElement|null;node?.showModal();const visibility=()=>setHidden(document.hidden);visibility();document.addEventListener('visibilitychange',visibility);return()=>{document.removeEventListener('visibilitychange',visibility);node?.close();previous?.focus?.({preventScroll:true});};},[]);
 useEffect(()=>setStepper(startLessonStepper(stepCount)),[spotId,stepCount]);
 // Previous and Next grow to fit the longer label (≈22 px each side, 128 px minimum) and stay the same width (docs/ui/BUTTONS.md);
 // if that is wider than the room, both take the room and the labels wrap onto two balanced lines. Measured on label or size change.
 const footer=useRef<HTMLElement>(null),measure=useRef<CanvasRenderingContext2D|null>(),primaryText=lesson?lessonPrimaryLabel(stepper,lesson.actions):'';
 useLayoutEffect(()=>{const el=footer.current;if(!el)return;
  // Single-line text widths from the labels' own font (independent of the wrapped state, so the fit never oscillates).
  const fit=()=>{const ctx=(measure.current??=document.createElement('canvas').getContext('2d')),labels=[...el.querySelectorAll<HTMLElement>('button > span:first-child')].filter(l=>l.textContent?.trim());
   const need=Math.max(128,...labels.map(l=>{if(!ctx)return 128;const cs=getComputedStyle(l);ctx.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;return Math.ceil(ctx.measureText(l.textContent!.trim()).width)+44;}));
   const cs=getComputedStyle(el),inner=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),n=el.querySelectorAll('button').length;
   const room=Math.floor(n>1?(inner-(parseFloat(cs.columnGap)||12))/2:inner),width=Math.min(need,room);
   el.style.setProperty('--lesson-btn',`${width}px`);el.toggleAttribute('data-wrap',need>room);
   // Wrapped labels can take a third line on the narrowest phones: both pills take the taller height.
   el.style.removeProperty('--lesson-btn-h');if(need>room){const tall=Math.max(...[...el.querySelectorAll<HTMLElement>('button')].map(b=>b.offsetHeight));el.style.setProperty('--lesson-btn-h',`${tall}px`);}};
  fit();if(typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(fit);observer.observe(el);return ()=>observer.disconnect();},[primaryText,stepper.count]);
 // Upright phones: the pitch is redrawn to the diagram's free box (a taller view box, lib/town/ballLessonScenes.ts pitchMap).
 // Measured on open and on resize/rotation only (no observer on step changes, so the layout never shifts mid-lesson).
 const illustration=useRef<HTMLDivElement>(null),[layout,setLayout]=useState<DiagramLayout>(LANDSCAPE);
 // (A passive effect: it runs after the open effect's showModal, so the box has its real size.)
 useEffect(()=>{const el=illustration.current;if(!el||typeof window==='undefined')return;const upright=window.matchMedia?.('(max-width:600px) and (orientation:portrait)');
  const fit=()=>{const box=el.querySelector(`.${styles.field}`)?.getBoundingClientRect(),next=upright?.matches&&box?diagramLayout(box.width,box.height):LANDSCAPE;setLayout(prev=>prev.w===next.w&&prev.h===next.h?prev:next);};
  fit();window.addEventListener('resize',fit);upright?.addEventListener?.('change',fit);return ()=>{window.removeEventListener('resize',fit);upright?.removeEventListener?.('change',fit);};},[spotId]);
 if(!spot||!lesson)return null;
 const step=Math.min(stepper.step,stepper.count-1),finished=canFinishLesson(stepper),frame=ballLessonFrame(lesson.kind,step,layout),caption=lesson.steps?.[step]??'';
 const title=spot.teaching.slice(0,spot.teaching.indexOf('.')),tip=spot.teaching.slice(spot.teaching.indexOf('.')+1).trim(),complete=!replay&&progress.collected.length===COIN_QUEST.length&&!progress.celebrated;
 const dismiss=()=>{if(!finished)return;if(complete)dismissCoinCelebration();onDismiss();};
 const pressPrimary=()=>{if(finished)dismiss();else setStepper(advanceLesson);};
 const previous=()=>{const next=previousLessonStep(stepper);setStepper(next);if(!canGoBack(next))primary.current?.focus({preventScroll:true});};
 const keys=(event:KeyboardEvent<HTMLDialogElement>)=>{
  event.stopPropagation();
  const target=event.target as HTMLElement,action=lessonStepKey(event.key,!!target.closest('button,a,input,select,textarea,[contenteditable="true"]'));
  if(!action)return;
  event.preventDefault();
  if(action==='primary')pressPrimary();else if(action==='previous'){if(canGoBack(stepper))previous();}else setStepper(forwardLessonStep);
 };
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`} onCancel={event=>{event.preventDefault();event.stopPropagation();}} onKeyDown={keys} data-hidden={hidden}>
  <section className={styles.panel}>
   <header className={styles.header}><p>{practice?'Practice idea':replay?'Ball hunt tip':'Ball found'} · {progress.collected.length}/{COIN_QUEST.length}</p><h2 id={`${id}-title`}>{title}</h2></header>
   <div className={styles.body}>
    <p className={styles.tip}>{pathText(practice?BALL_HUNT_PRACTICE[spotId]:tip)}</p>
    <div ref={illustration} className={styles.illustration}>
     <div className={styles.diagramHeading}><span>{practice?'Predict, then reveal':`${lesson.family} · level ${lesson.level}`}</span><span className={styles.counter} data-step-counter="">{step+1} / {stepper.count}</span></div>
     <BallLessonDiagram frame={frame} step={step} id={id} title={title} desc={pathText(caption)}/>
     <div className={styles.legend}>● Teammates <span>● Opponents</span> <b>▰ Open space</b> <i>- - run  — pass</i></div>
     <p className={styles.caption} aria-live="polite">{pathText(caption)}</p>
    </div>
    {complete&&finished&&<p className={styles.reward}><strong>All {COIN_QUEST.length} balls found!</strong> All costumes are unlocked. Find them in the vending machines and keep exploring.</p>}
   </div>
   <footer ref={footer} className={styles.footer}>
    {stepper.count>1&&<div className={styles.stepNav}><NavigationButton back immediate label="Previous step" className={styles.previous} disabled={!canGoBack(stepper)} onNavigate={previous}/></div>}
    <button ref={primary} type="button" className={`${styles.next} ${navStyles.button}`} data-navigation="done" data-lesson-primary={finished?'done':'step'} onClick={pressPrimary} autoFocus><span className={navStyles.label}>{lessonPrimaryLabel(stepper,lesson.actions)}</span></button>
   </footer>
  </section>
 </dialog>;
}
