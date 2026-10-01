'use client';
import dynamic from 'next/dynamic';
import {useState} from 'react';
import {pathProgressFrom} from '@/lib/town/cardTiers';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {GRAD_TITLES,GRADUATION_FORMATS,ferryUnlocked,graduatedFormats} from '@/lib/endgame/graduationModel';
import {openEndgame,useGraduations} from '@/lib/endgame/graduationStore';
import {starterLessons} from '@/lib/endgame/graduationSync';
import {PATH_ORDER} from '@/lib/paths/pathContinue';
import EndgameDialog from './EndgameDialog';
import {OPENING_SOON_LABEL} from '@/lib/town/openingSoon';
import styles from './Endgame.module.css';
const MatchdayFinale=dynamic(()=>import('./MatchdayFinale'),{ssr:false,loading:()=><div className={styles.card}><p role="status">The ferry is getting ready…</p></div>});

/**
 * The Matchday Ferry (Lane 2, Sep 30 2026). Locked: "Opening soon — finish your paths!" with each path's progress and how to
 * graduate it. Open (all four paths graduated): board for the Matchday final (MatchdayFinale, loaded only on boarding). After
 * the final: ride again to practise, or open the Island Diploma. The Academy island is still future content.
 */
export default function FerryPreview({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
 const [boarded,setBoarded]=useState(false);
 const close=()=>{setBoarded(false);onOpenChange(false);};
 return <EndgameDialog open={open} label="ferry" title="Matchday Ferry" onClose={close} onBack={boarded?()=>setBoarded(false):undefined}>
  {boarded?<MatchdayFinale onDone={close}/>:<Harbour onBoard={()=>setBoarded(true)}/>}
 </EndgameDialog>;
}

function Harbour({onBoard}:{onBoard:()=>void}){
 const record=useGraduations(),evidence=useQuestEvidence(),answers=useQuizCompletions();
 const progress=pathProgressFrom(new Set(evidence.steps),answers).byFormat;
 const unlocked=ferryUnlocked(record),done=graduatedFormats(record).length;
 return <div className={styles.ceremony} data-ferry={unlocked?'open':'locked'}>
  <div className={styles.card}>
   {unlocked?<>
    <span className={styles.badge}>{record.finale?'Champion':'Now boarding'}</span>
    <h3>{record.finale?'Ride again for another Matchday':'Your Matchday final is ready'}</h3>
    <p>{record.finale?'Every ride is a new coach’s exam from your four paths: great practice before a real game.':'You graduated on all four pitches. Board the ferry for the coach’s exam, the trophy ceremony and your credits.'}</p>
    <div className={styles.actions}><button type="button" className={styles.primary} onClick={onBoard}>{record.finale?'Ride again':'Board the ferry'}</button>
     {record.finale&&<button type="button" className={styles.secondary} onClick={()=>openEndgame({target:'certificate',id:'diploma'})}>See my Island Diploma</button>}</div>
   </>:<>
    <span className={`${styles.badge} ${styles.badgeMuted}`}>{OPENING_SOON_LABEL}</span>
    <h3>Graduate all four paths to board</h3>
    <p>The ferry leaves for your Matchday final when you finish the 12 starter lessons on every path: futsal, 7v7, 9v9 and 11v11. You have graduated {done} of 4.</p>
   </>}
   <ul className={styles.harbour} aria-label="Path graduations">{GRADUATION_FORMATS.map(f=>{const grad=!!record.formats[f],total=starterLessons(f).length,have=grad?total:Math.round((progress[f]??0)*total);
    return <li key={f}><span className={`${styles.tick} ${grad?styles.tickDone:''}`} aria-hidden="true">{grad?'✓':have}</span><span style={{minWidth:64}}>{GRAD_TITLES[f]}</span><progress value={have} max={total} aria-label={`${GRAD_TITLES[f]}: ${have} of ${total} starter lessons`}/><small>{grad?'Graduated':`${have}/${total}`}</small></li>;})}</ul>
   {!unlocked&&<div className={styles.actions}><button type="button" className={styles.primary} onClick={()=>openEndgame({target:'paths',format:PATH_ORDER.find(f=>!record.formats[f as keyof typeof record.formats])})/* QA11 C-5: the main 7v7 track first, futsal last */}>Open Paths</button></div>}
  </div>
  <div className={styles.card}><span className={styles.eyebrow}>Next horizon</span><p>The Academy island is still being built. When it is ready, this ferry will take you there to train as an academy player.</p></div>
 </div>;
}
