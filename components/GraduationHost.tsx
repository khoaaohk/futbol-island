'use client';
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import {pathProgressFrom} from '@/lib/town/cardTiers';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {markGraduationsSeen,unseenGraduations,GRAD_TITLES,type GradFormat} from '@/lib/endgame/graduationModel';
import {ENDGAME_OPEN,updateGraduations,useGraduations,type EndgameOpen} from '@/lib/endgame/graduationStore';
import {syncGraduations} from '@/lib/endgame/graduationSync';
import {isCertificateId,type CertificateId} from '@/lib/endgame/certificate';
import EndgameDialog from './EndgameDialog';
import styles from './Endgame.module.css';
// QA11 C-4: a placeholder in the Ferry's style while the ceremony/certificate code loads, so the dialog is never blank.
const GraduationCeremony=dynamic(()=>import('./GraduationCeremony'),{ssr:false,loading:()=><div className={styles.card}><p role="status">Getting your certificate ready…</p></div>});

/**
 * Mounted once in Town (Lane 2, Sep 30 2026). Watches the same path stores the Paths screen reads and saves a graduation the
 * first time a format's 12 starter lessons are complete, including retroactively on load for saves that finished paths
 * before this update. The ceremony opens at the next calm moment (`blocked` false) and is marked seen when closed, so it
 * shows exactly once per format. It also opens saved certificates on request (ENDGAME_OPEN 'certificate'). No timers, no
 * polling; the ceremony code loads only when there is something to show. `onOpenChange` lets Town sleep the island.
 */
export default function GraduationHost({blocked,onOpenChange}:{blocked:boolean;onOpenChange:(open:boolean)=>void}){
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),record=useGraduations();
 const finished=pathProgressFrom(new Set(evidence.steps),answers).finished.join('|');
 useEffect(()=>{syncGraduations(finished?finished.split('|'):[]);},[finished]);
 const [ceremony,setCeremony]=useState<GradFormat[]|null>(null),[view,setView]=useState<CertificateId|null>(null);
 const unseen=unseenGraduations(record).join('|');
 useEffect(()=>{if(!ceremony&&!view&&!blocked&&unseen)setCeremony(unseen.split('|') as GradFormat[]);},[ceremony,view,blocked,unseen]);
 useEffect(()=>{const open=(e:Event)=>{const d=(e as CustomEvent<EndgameOpen>).detail;if(d?.target==='certificate'&&isCertificateId(d.id))setView(d.id);};
  window.addEventListener(ENDGAME_OPEN,open);return()=>window.removeEventListener(ENDGAME_OPEN,open);},[]);
 const showing=!!ceremony||!!view;
 useEffect(()=>{onOpenChange(showing);},[showing,onOpenChange]);
 const close=()=>{if(ceremony)updateGraduations(r=>markGraduationsSeen(r,ceremony));setCeremony(null);setView(null);};
 // Leaving through "Go to 9v9" / "Board the ferry" also closes (and counts as seen).
 useEffect(()=>{if(!ceremony)return;const leave=(e:Event)=>{const d=(e as CustomEvent<EndgameOpen>).detail;if(d&&d.target!=='certificate')close();};
  window.addEventListener(ENDGAME_OPEN,leave);return()=>window.removeEventListener(ENDGAME_OPEN,leave);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[ceremony]);
 const title=view?'Certificate':ceremony&&ceremony.length===1?`${GRAD_TITLES[ceremony[0]]} Graduation`:'Graduation';
 // Bug audit B12: the dialog stays mounted and closes through `open`, so EndgameDialog's close branch restores focus to the
 // trigger (returning null unmounted it mid-open and dropped focus to <body>). Its children render only while open, so the
 // ceremony code still loads only when there is something to show.
 return <EndgameDialog open={showing} label="graduation" title={title} onClose={close}><GraduationCeremony record={record} formats={ceremony??[]} view={view}/></EndgameDialog>;
}
