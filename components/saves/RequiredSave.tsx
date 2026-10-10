'use client';
/**
 * "Save your island" for a player who already has an island but no save code (user decision, Oct 9 2026: a code is required
 * before playing). Shown by SaveSync on the island's start, over everything, until the player makes a code or types one. Their
 * progress is kept: "Get my code" saves this device's island as it is. If saving is down it says "Saving is taking a break —
 * you can still play today", lets them play, and asks again on a later visit.
 */
import {useState} from 'react';
import SaveCodeCreate from './SaveCodeCreate';
import SaveCodeRestore from './SaveCodeRestore';
import styles from './SaveCode.module.css';

export default function RequiredSave({onDone}:{onDone:()=>void}){
 const [view,setView]=useState<'create'|'restore'>('create');
 return <div className={styles.box} data-required-save={view}>
  {view==='create'?<>
   <SaveCodeCreate required onHaveCode={()=>setView('restore')} onDone={()=>onDone()}/>
  </>:<SaveCodeRestore required onCancel={()=>setView('create')} onDone={restored=>{if(!restored)onDone();}}/>}
 </div>;
}
