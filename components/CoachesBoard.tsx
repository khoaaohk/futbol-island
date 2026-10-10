'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import TacticsBoard from './coaches-board/TacticsBoard';
import ProgressTab from './coaches-board/ProgressTab';
import s from './coaches-board/TacticsBoard.module.css';
import t from './coaches-board/Tabs.module.css';

/**
 * Coaches Centre → Coaches Board (lazy-loaded with the centre). Two tabs: the Tactics board (a magnetic board for drawing
 * and playing through moves; opens by default) and Progress (graduation badges, next goals and the team shapes learned,
 * Lane 2, Sep 30 2026). Nothing runs while it is closed; the tactics board animates only while something moves.
 *
 * Full screen (Oct 10 2026): the Tactics board covers the whole screen, like Miro or Figma. It is portalled into the
 * Coaches Centre's <dialog> (the top layer, so it sits above the centre's header and stays modal), the centre underneath
 * is made inert while it shows, and its own Back (top left) returns to the centre. Progress stays in the centre's panel.
 */
export default function CoachesBoard({onBack}:{onBack?:()=>void}){
 const [tab,setTab]=useState<'tactics'|'progress'>('tactics');
 const anchor=useRef<HTMLSpanElement>(null);
 const [host,setHost]=useState<HTMLElement|null>(null);
 useLayoutEffect(()=>{setHost(anchor.current?.closest('dialog')??document.body);},[]);
 // The centre's own header and panel stay out of the tab order and screen readers while the board covers them.
 useEffect(()=>{if(tab!=='tactics'||!host)return;const panel=anchor.current?.closest('section');if(!panel)return;panel.inert=true;return ()=>{panel.inert=false;};},[tab,host]);
 const tabs=<div className={t.tabs} role="tablist" aria-label="Coaches Board">
  <button type="button" role="tab" id="cb-tab-tactics" aria-controls="cb-panel" aria-selected={tab==='tactics'} className={`${s.pill} ${t.tab}`} onClick={()=>setTab('tactics')} data-cb="tab-tactics">Tactics board</button>
  <button type="button" role="tab" id="cb-tab-progress" aria-controls="cb-panel" aria-selected={tab==='progress'} className={`${s.pill} ${t.tab}`} onClick={()=>setTab('progress')} data-cb="tab-progress">Progress</button>
 </div>;
 return <div data-coaches-board id="cb-panel" role="tabpanel" aria-labelledby={tab==='tactics'?'cb-tab-tactics':'cb-tab-progress'}>
  <span ref={anchor} hidden/>
  {tab==='tactics'?host&&createPortal(<div className={s.fullscreen} data-coaches-board-full><TacticsBoard onBack={onBack}/></div>,host)
   :<><div className={t.progressTop}>{tabs}</div><ProgressTab/></>}
 </div>;
}
