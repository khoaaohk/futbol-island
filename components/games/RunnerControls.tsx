'use client';
import type {PointerEvent} from 'react';
import {Icon} from '@/components/Icon';
import styles from './RunnerControls.module.css';

type Press={onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>void;onClick:(e:{detail:number})=>void};
type Hold=Press&{onPointerUp:(e:PointerEvent<HTMLButtonElement>)=>void;onPointerCancel:(e:PointerEvent<HTMLButtonElement>)=>void;onLostPointerCapture:(e:PointerEvent<HTMLButtonElement>)=>void};
type RunnerPadHud={coach?:string;skillLabel?:string;skillReady?:boolean};

/**
 * Breakaway Run touch pad (round 3): kid-sized, thumb-arc layout.
 * Left thumb: two big lane arrows (72 px). Right thumb: Shoot is the biggest button (88 px) in the corner, Jump sits
 * right above it, Slide to its left and Skill on the diagonal, so the thumb rolls between them without looking.
 * Every button fires on touch-down (the handlers come from ArcadeGame3D), the pad sets touch-action:none, and the
 * coach highlight (data-coach) and the live Skill name are kept.
 */
export function RunnerControls({hud,pressLane,pressAction,shoot}:{hud:RunnerPadHud;pressLane:(d:number)=>Press;pressAction:(id:number)=>Press;shoot:Hold}){
 return <>
  <div className={styles.lanes} role="group" aria-label="Change lane">
   <button className={`${styles.btn} ${styles.lane}`} aria-label="Move one lane left" data-coach={hud.coach==='left'||undefined} {...pressLane(-1)}><Icon name="back" size={34}/></button>
   <button className={`${styles.btn} ${styles.lane}`} aria-label="Move one lane right" data-coach={hud.coach==='right'||undefined} {...pressLane(1)}><Icon name="arrow" size={34}/></button>
  </div>
  <div className={styles.arc} role="group" aria-label="Actions">
   <button className={`${styles.btn} ${styles.skill}`} data-runner-skill data-ready={hud.skillReady||undefined} data-coach={hud.coach==='skill'||undefined} aria-label={`Skill move: ${hud.skillLabel??'Skill'}`} {...pressAction(6)}><span>{hud.skillLabel??'Skill'}</span></button>
   <button className={`${styles.btn} ${styles.jump}`} data-runner-jump data-coach={hud.coach==='jump'||undefined} {...pressAction(1)}><b aria-hidden="true">⤒</b><span>Jump</span></button>
   <button className={`${styles.btn} ${styles.slide}`} data-runner-slide {...pressAction(2)}><b aria-hidden="true">⤓</b><span>Slide</span></button>
   <button className={`${styles.btn} ${styles.shoot}`} data-runner-shoot data-coach={hud.coach==='shoot'||undefined} {...shoot}><b aria-hidden="true">⚽</b><span>Shoot</span></button>
  </div>
 </>;
}
