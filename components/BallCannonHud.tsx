'use client';
/**
 * The Ball Cannon's HUD (Summit Isle, Oct 14 2026): the world-anchored "Sit in the ball cannon" prompt (placed by
 * lib/graphics/ballCannon.ts like the telescope's) and, while seated, the controls: drag anywhere to aim (or the arrow keys),
 * a big Fire button (Space), Release disc (R), Pull for two (P), Back (Escape). No score, no coins: a little "Nice!" when a disc
 * is knocked out, that is all. The island HUD (stick, ride buttons, map, the stack) steps aside while you sit (CSS :has).
 * Reads lib/town/ballCannonStore.ts (written only on changes); pointer events only while dragging; no timers or loops.
 */
import {useEffect,useRef,useSyncExternalStore,type PointerEvent} from 'react';
import {BackButton} from './BackButton';
import {cannonStore,cannonActions} from '@/lib/town/ballCannonStore';
import styles from './BallCannonHud.module.css';

const AIM_KEYS=new Set(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d']);
export default function BallCannonHud(){
 const v=useSyncExternalStore(cannonStore.subscribe,cannonStore.get,cannonStore.server);
 const drag=useRef<{id:number;x:number;y:number}|null>(null);
 useEffect(()=>{if(!v.seated)return;
  // Captured first: Escape leaves, Space/F fires, R releases a disc, P pulls two. Only the aim keys reach the island (its key set
  // turns the barrel); the island's other keys (ride, map, kick, juggle, talk) wait until you stand up. Tab and Enter still work.
  const key=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();
   if(k==='escape'){e.preventDefault();e.stopPropagation();cannonActions.leave();return;}
   if(k===' '||k==='f'){e.preventDefault();e.stopPropagation();cannonActions.fire();return;}
   if((k==='r'||k==='p')&&!e.repeat){e.preventDefault();e.stopPropagation();cannonActions.release(k==='p'?2:1);return;}
   if(!AIM_KEYS.has(k)&&k!=='tab'&&k!=='enter')e.stopPropagation();};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);},[v.seated]);
 const down=(e:PointerEvent<HTMLDivElement>)=>{if(e.target!==e.currentTarget)return;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* not capturable */}};
 const move=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;cannonActions.aim(e.clientX-d.x,e.clientY-d.y);d.x=e.clientX;d.y=e.clientY;};
 const up=()=>{drag.current=null;};
 return <>
  <button type="button" className="store-enter-prompt" data-ball-cannon-sit aria-label="Sit in the ball cannon" hidden onClick={()=>cannonActions.sit()}>Sit in the ball cannon</button>
  {v.seated&&<div className={styles.hud} data-ball-cannon-hud role="application" aria-label="Ball cannon. Drag to aim." onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}>
   <div className={styles.back}><BackButton aria-label="Get out of the ball cannon" onBack={()=>cannonActions.leave()}/></div>
   {v.shots===0&&<p className={styles.hint} aria-live="polite">Drag or use the stick to aim. <b>Release disc</b>, then <b>Fire</b> to knock it out of the sky!</p>}
   {v.hits>0&&v.word&&<div key={v.hits} className={styles.cheer} aria-hidden="true" data-ball-cannon-cheer>{v.word}</div>}
   <div className={styles.controls}>
    <div className={styles.discs}>
     <button type="button" className={styles.disc} data-ball-cannon-release onClick={()=>cannonActions.release(1)}>Release disc<kbd>R</kbd></button>
     <button type="button" className={styles.disc} data-ball-cannon-pull aria-label="Pull: release two discs" onClick={()=>cannonActions.release(2)}>Pull × 2<kbd>P</kbd></button>
    </div>
    <button type="button" className={styles.fire} data-ball-cannon-fire aria-label="Fire a ball" onClick={()=>cannonActions.fire()}>Fire<kbd>Space</kbd></button>
   </div>
  </div>}
 </>;
}
