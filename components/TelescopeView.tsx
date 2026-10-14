'use client';
/**
 * The lookout telescope's eyepiece (Summit Isle, Oct 12 2026): the world-anchored "Look through the telescope" prompt and, while
 * looking, a round framed view over the island's own camera (lib/graphics/summitActivities.ts narrows its FOV). Drag anywhere to
 * pan (or use the stick / arrow keys), Zoom toggles the lens, Back or Escape returns to the normal camera. When a landmark is
 * centred its name and how to get there show; holding a glint in the centre spots it (the ring fills).
 * Pointer events only while dragging; no timers or loops of its own.
 */
import {useEffect,useRef,useSyncExternalStore,type PointerEvent} from 'react';
import {BackButton} from './BackButton';
import {scopeStore,summitActions} from '@/lib/town/summitStore';
import styles from './SummitActivities.module.css';

const PAN_KEYS=new Set(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d']);
export default function TelescopeView(){
 const v=useSyncExternalStore(scopeStore.subscribe,scopeStore.get,scopeStore.server);
 const drag=useRef<{id:number;x:number;y:number}|null>(null);
 // While looking through the eyepiece the island HUD (coin/fish/fruit/fuel pocket, entry prompts) steps aside (user, Oct 13 2026:
 // "when using telescope, remove the coins, fish, fruit and energy bar at the top"); CSS in app/globals.css keys off this flag.
 useEffect(()=>{if(!v.active)return;document.documentElement.dataset.telescope='on';return()=>{delete document.documentElement.dataset.telescope;};},[v.active]);
 useEffect(()=>{if(!v.active)return;
  // Escape leaves the eyepiece and Z zooms (captured first). Only the pan keys reach the island (its key set feeds the pan); the
  // island's other keys (ride, map, kick, juggle, talk) wait until the eyepiece is down. Default actions (Tab, Enter) still work.
  const key=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();
   if(k==='escape'){e.preventDefault();e.stopPropagation();summitActions.exitScope();return;}
   if(k==='z'&&!e.repeat){e.stopPropagation();summitActions.zoom();return;}
   if(!PAN_KEYS.has(k)&&k!=='tab'&&k!=='enter')e.stopPropagation();};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);},[v.active]);
 const down=(e:PointerEvent<HTMLDivElement>)=>{if(e.target!==e.currentTarget)return;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}};
 const move=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;summitActions.pan(e.clientX-d.x,e.clientY-d.y);d.x=e.clientX;d.y=e.clientY;};
 const up=()=>{drag.current=null;};
 const ring=v.spotting?.progress??0,C=2*Math.PI*28;
 return <>
  <button type="button" className="store-enter-prompt" data-telescope-open aria-label="Look through the telescope" hidden onClick={()=>summitActions.openScope()}>Look through the telescope</button>
  {v.active&&<div className={styles.scope} data-telescope-view role="application" aria-label="Telescope view. Drag to look around." onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}>
   <div className={styles.rim}/>
   <div className={styles.cross}/>
   {v.spotting&&<svg className={styles.ring} viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="none" stroke="#fff3df55" strokeWidth="5"/><circle cx="32" cy="32" r="28" fill="none" stroke="#9ff0b8" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${C*ring} ${C}`} transform="rotate(-90 32 32)"/></svg>}
   {v.label&&<div className={styles.label} role="status" data-telescope-label={v.label.id}><strong>{v.label.name}</strong>{v.label.line}</div>}
   <div className={styles.scopeTop}>
    <BackButton aria-label="Stop looking through the telescope" onBack={()=>summitActions.exitScope()}/>
    <span className={styles.found} data-telescope-found aria-label={`Glints spotted: ${v.found} of ${v.total}`}>✦ Glints {v.found}/{v.total}</span>
   </div>
   <div className={styles.scopeActions}>
    <button type="button" className={styles.zoom} data-telescope-zoom aria-label={v.zoom?'Zoom out':'Zoom in'} onClick={()=>summitActions.zoom()}>{v.zoom?'−':'+'} Zoom</button>
   </div>
   {v.note&&!v.label&&<p className={styles.scopeNote} key={v.notes} aria-live="polite">{v.note}</p>}
  </div>}
 </>;
}
