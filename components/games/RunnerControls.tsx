'use client';
import {useEffect,useRef,type PointerEvent} from 'react';
import {useFloatingStick} from '@/lib/arcade/useFloatingStick';
import {runnerSteer,runnerSteerState} from '@/lib/arcade/runnerSteer';
import styles from './RunnerControls.module.css';

type Press={onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>void;onClick:(e:{detail:number})=>void};
type Hold=Press&{onPointerUp:(e:PointerEvent<HTMLButtonElement>)=>void;onPointerCancel:(e:PointerEvent<HTMLButtonElement>)=>void;onLostPointerCapture:(e:PointerEvent<HTMLButtonElement>)=>void};
type RunnerPadHud={coach?:string;skillLabel?:string;skillReady?:boolean;flash?:string;flashId?:number};

/**
 * Breakaway Run touch pad (owner, Oct 27 2026: "the joystick instead to match with the other games").
 * Left thumb: Island Strikers' floating stick (lib/arcade/useFloatingStick): press anywhere on the left of the track, push
 * sideways to change lane (lib/arcade/runnerSteer: one lane per push, hold to keep stepping). Right thumb: a Strikers-style
 * cluster of round buttons around the big Shoot in the corner (Jump above, Slide to its left, Skill on the diagonal).
 * Everything fires on touch-down (handlers from ArcadeGame3D). While playing, the only text is a short flash after a goal or
 * a tackle (runnerHud flash). Mouse windows hide the pad and use the keyboard.
 */
export function RunnerControls({hud,steer,pressAction,shoot}:{hud:RunnerPadHud;steer:(d:number)=>void;pressAction:(id:number)=>Press;shoot:Hold}){
 const steerState=useRef(runnerSteerState()),lastX=useRef(0),repeat=useRef(0);
 const step=(x:number)=>{lastX.current=x;const d=runnerSteer(steerState.current,x,performance.now()/1000);if(d)steer(d);};
 const stick=useFloatingStick((x)=>{step(x);clearInterval(repeat.current);if(x)repeat.current=window.setInterval(()=>step(lastX.current),80);},()=>true);
 useEffect(()=>()=>{clearInterval(repeat.current);},[]);
 const coachStick=hud.coach==='left'||hud.coach==='right';
 return <div className={styles.pad} data-runner-pad>
  <div className={styles.zone} aria-hidden="true" data-runner-stick-zone {...stick.zone}/>
  <div className={`touch-controls ${styles.movement}`}><div ref={stick.joy} className="joystick" data-floating="true" data-runner-stick data-coach={coachStick||undefined} role="group" aria-label="Change lane: press anywhere on the left and push left or right"><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span/></div></div>
  <div className={styles.cluster} role="group" aria-label="Actions">
   <button className={`${styles.btn} ${styles.skill}`} data-runner-skill data-ready={hud.skillReady||undefined} data-coach={hud.coach==='skill'||undefined} aria-label={`Skill move: ${hud.skillLabel??'Skill'}`} {...pressAction(6)}><span>{hud.skillLabel??'Skill'}</span></button>
   <button className={`${styles.btn} ${styles.jump}`} data-runner-jump data-coach={hud.coach==='jump'||undefined} {...pressAction(1)}><b aria-hidden="true">⤒</b><span>Jump</span></button>
   <button className={`${styles.btn} ${styles.slide}`} data-runner-slide {...pressAction(2)}><b aria-hidden="true">⤓</b><span>Slide</span></button>
   <button className={`${styles.btn} ${styles.shoot}`} data-runner-shoot data-coach={hud.coach==='shoot'||undefined} {...shoot}><b aria-hidden="true">⚽</b><span>Shoot</span></button>
  </div>
  {hud.flash&&<p key={hud.flashId} className={styles.flash} data-runner-flash role="status" aria-live="polite">{hud.flash}</p>}
 </div>;
}
