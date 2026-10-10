'use client';
import {useState} from 'react';
import TacticsBoard from './coaches-board/TacticsBoard';
import ProgressTab from './coaches-board/ProgressTab';
import s from './coaches-board/TacticsBoard.module.css';
import t from './coaches-board/Tabs.module.css';

/**
 * Coaches Centre → Coaches Board (lazy-loaded with the centre). Two tabs: the Tactics board (a magnetic board for drawing
 * and playing through moves; opens by default) and Progress (graduation badges, next goals and the team shapes learned,
 * Lane 2, Sep 30 2026). Nothing runs while it is closed; the tactics board animates only while something moves.
 */
export default function CoachesBoard(){
 const [tab,setTab]=useState<'tactics'|'progress'>('tactics');
 const tabs=<div className={t.tabs} role="tablist" aria-label="Coaches Board">
  <button type="button" role="tab" id="cb-tab-tactics" aria-controls="cb-panel" aria-selected={tab==='tactics'} className={`${s.pill} ${t.tab}`} onClick={()=>setTab('tactics')} data-cb="tab-tactics">Tactics board</button>
  <button type="button" role="tab" id="cb-tab-progress" aria-controls="cb-panel" aria-selected={tab==='progress'} className={`${s.pill} ${t.tab}`} onClick={()=>setTab('progress')} data-cb="tab-progress">Progress</button>
 </div>;
 return <div data-coaches-board id="cb-panel" role="tabpanel" aria-labelledby={tab==='tactics'?'cb-tab-tactics':'cb-tab-progress'}>
  {tab==='tactics'?<TacticsBoard tabs={tabs}/>:<><div className={t.progressTop}>{tabs}</div><ProgressTab/></>}
 </div>;
}
