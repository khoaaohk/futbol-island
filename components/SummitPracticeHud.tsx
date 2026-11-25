'use client';
/**
 * The Summit 5s practice area's HUD (owner, Nov 24 2026; runtime lib/graphics/summitPractice.ts, rules lib/town/summitPractice.ts).
 * While practising: the live games' camera button (top left, same look and behaviour), Exit (top right, the live match's Leave
 * pill), the drill card (name, its one-line coaching point, Shuffle drill, Edit) and the entry toast. In the editor: the edit card,
 * the add tray (three cones, a mannequin, a ball), the selected prop's Rotate / Colour / Remove, Reset drill and Done.
 * Reads lib/town/summitPracticeStore.ts (written only on changes); no timers or loops of its own (the toast is a CSS animation).
 */
import {useEffect,useSyncExternalStore} from 'react';
import {registerBackCloser} from '@/lib/town/backCloses';
import {practiceStore,practiceActions} from '@/lib/town/summitPracticeStore';
import {PRACTICE_LIMITS,CONE_HEX,type ConeColor} from '@/lib/town/summitPractice';
import live from './LiveJoinHud.module.css';
import styles from './SummitPractice.module.css';

const CONES:{c:ConeColor;label:string}[]=[{c:'orange',label:'Orange cone'},{c:'yellow',label:'Yellow cone'},{c:'blue',label:'Blue cone'}];
const KIND_NAME={cone:'Cone',man:'Mannequin',ball:'Ball'} as const;

function ConeIcon({c}:{c:string}){return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M12 3 18 19H6z" fill={c}/><rect x="3.5" y="18.5" width="17" height="3" rx="1" fill="#7a7466"/></svg>;}
function ManIcon(){return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><circle cx="12" cy="4.6" r="2.6" fill="#f3c623"/><rect x="7.5" y="8" width="9" height="7.5" rx="1.2" fill="#f3c623"/><rect x="7.5" y="10" width="9" height="1.6" fill="#1d3557"/><rect x="11" y="15.5" width="2" height="4" fill="#7a7466"/><rect x="7" y="19.5" width="10" height="2.2" rx="1" fill="#3b3f46"/></svg>;}
function BallIcon(){return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="#ffffff" stroke="#3b3f46" strokeWidth="1.6"/><path d="m12 8.2 3.4 2.5-1.3 4H9.9l-1.3-4z" fill="#3b3f46"/></svg>;}

export default function SummitPracticeHud(){
 const v=useSyncExternalStore(practiceStore.subscribe,practiceStore.get,practiceStore.server);
 const on=v.mode!=='off',editing=v.mode==='edit';
 // The phone's Back leaves the editor first, then the practice pitch (instead of leaving the island).
 useEffect(()=>on?registerBackCloser(()=>editing?practiceActions.done():practiceActions.exit()):undefined,[on,editing]);
 if(!on)return null;
 return <div className={styles.hud} data-practice-hud data-mode={v.mode}>
  {!editing&&<>
   {/* The live games' camera button (components/LiveJoinHud.tsx): top left, each tap cycles the angle; C on a keyboard. */}
   <button type="button" data-practice-cam className={live.cam} onClick={()=>practiceActions.camera()} title={`Camera: ${v.cam} · C`} aria-label={`Camera angle: ${v.cam}`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="2.5" y="7" width="13" height="10" rx="2.5"/><path d="m15.5 10.5 6-3.5v10l-6-3.5"/></svg>
   </button>
   <button type="button" data-practice-exit className={live.leave} onClick={()=>practiceActions.exit()} title="Exit practice · Back" aria-label="Exit practice">Exit</button>
   <section className={styles.card} aria-label={`Practice drill: ${v.name}`} data-practice-card>
    <p className={styles.title}><strong data-practice-drill={v.drill}>{v.name}</strong><span className={styles.cam} aria-live="polite">{v.cam} view</span></p>
    <p className={styles.tip}>{v.tip}</p>
    <div className={styles.row}>
     <button type="button" className={styles.btn} data-practice-shuffle onClick={()=>practiceActions.shuffle()}>Shuffle drill</button>
     <button type="button" className={`${styles.btn} ${styles.mint}`} data-practice-edit onClick={()=>practiceActions.edit()}>Edit</button>
    </div>
   </section>
   <p key={v.hello} className={styles.toast} role="status" data-practice-toast>Practice pitch: kick around!</p>
  </>}
  {editing&&<>
   <section className={styles.card} aria-label={`Editing ${v.name}`} data-practice-editcard>
    <p className={styles.title}><strong>Edit: {v.name}</strong></p>
    <p className={styles.tip}>Drag a prop to move it. Tap one to turn or remove it. Two fingers (or right-drag and the wheel) move the view.</p>
   </section>
   <div className={styles.tray} data-practice-tray>
    {v.selected&&<div className={styles.row} data-practice-selected={v.selected}>
     <span className={styles.sel}>{KIND_NAME[v.selected]}</span>
     {v.selected!=='ball'&&<button type="button" className={`${styles.btn} ${styles.mint}`} data-practice-rotate onClick={()=>practiceActions.rotate()}>{v.selected==='man'?'Turn':'Colour'}</button>}
     <button type="button" className={`${styles.btn} ${styles.mint}`} data-practice-remove onClick={()=>practiceActions.remove()}>Remove</button>
    </div>}
    <div className={styles.row} role="group" aria-label="Add to the drill">
     {CONES.map(({c,label})=><button key={c} type="button" className={styles.add} data-practice-add={`cone-${c}`} disabled={v.cones>=PRACTICE_LIMITS.cone} onClick={()=>practiceActions.add('cone',c)} aria-label={`Add ${label.toLowerCase()}`} title={`Add ${label.toLowerCase()}`}><ConeIcon c={CONE_HEX[c]}/></button>)}
     <button type="button" className={styles.add} data-practice-add="man" disabled={v.men>=PRACTICE_LIMITS.man} onClick={()=>practiceActions.add('man')} aria-label="Add a mannequin" title="Add a mannequin"><ManIcon/></button>
     <button type="button" className={styles.add} data-practice-add="ball" disabled={v.balls>=PRACTICE_LIMITS.ball} onClick={()=>practiceActions.add('ball')} aria-label="Add a ball" title="Add a ball"><BallIcon/></button>
    </div>
    <div className={styles.row}>
     <button type="button" className={`${styles.btn} ${styles.mint}`} data-practice-reset disabled={!v.edited} onClick={()=>practiceActions.reset()}>Reset drill</button>
     <button type="button" className={styles.btn} data-practice-done onClick={()=>practiceActions.done()}>Done</button>
    </div>
   </div>
  </>}
 </div>;
}
