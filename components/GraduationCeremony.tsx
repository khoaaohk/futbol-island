'use client';
import {useMemo,useState,type CSSProperties} from 'react';
import {GRAD_TITLES,GRADUATION_FORMATS,NEXT_FORMAT,capRewardFor,ferryUnlocked,type GradFormat,type GraduationRecord} from '@/lib/endgame/graduationModel';
import {openEndgame} from '@/lib/endgame/graduationStore';
import {certificateSpec,type CertificateId} from '@/lib/endgame/certificate';
import {starterLessons} from '@/lib/endgame/graduationSync';
import {PATH_ORDER} from '@/lib/paths/pathContinue';
import {CertificateActions,CertificateCard} from './Certificate';
import styles from './Endgame.module.css';

const lessonNames=(f:GradFormat)=>starterLessons(f).map(l=>l.name);
const CONFETTI=['#f8d651','#ff48b0','#8fc3dc','#fff1d3','#66e69e'];
/** Finite confetti burst (CSS, 1.6 s, none under reduced motion). */
export function Confetti(){return <div className={styles.confetti} aria-hidden="true">{Array.from({length:22},(_,i)=><i key={i} style={{'--x':`${4+i*4.3}%`,'--d':`${(i%6)*.08}s`,'--r':`${i*37}deg`,'--c':CONFETTI[i%CONFETTI.length]} as CSSProperties}/>)}</div>;}

/**
 * The graduation moment (lazy-loaded by GraduationHost). `formats` are the new graduations to celebrate (more than one when a
 * save graduates several paths at once, e.g. retroactively on the first load after this update): one ceremony with a tab per
 * certificate, never a queue of popups. `view` shows a single saved certificate (from the backpack, museum or Coaches Board).
 */
export default function GraduationCeremony({record,formats,view}:{record:GraduationRecord;formats:GradFormat[];view:CertificateId|null}){
 const [tab,setTab]=useState(0);
 const ids:CertificateId[]=view?[view]:formats.map(f=>`grad:${f}` as CertificateId);
 const id=ids[Math.min(tab,ids.length-1)];
 const spec=useMemo(()=>id?certificateSpec(id,record,lessonNames):null,[id,record]);
 if(!spec)return <div className={styles.card}><p>This certificate isn’t on this device yet.</p></div>;
 if(view)return <div className={styles.ceremony}><CertificateCard spec={spec}/><div className={styles.card}><CertificateActions spec={spec}/></div></div>;
 const all=ferryUnlocked(record),next=nextFormat(record,formats);
 return <div className={styles.ceremony} data-graduation={formats.join(' ')}>
  <div className={`${styles.stage} ${styles.pop}`}><Confetti/>
   <span className={styles.badge}>Graduation day</span>
   <h3>{formats.length>1?`${formats.length} paths graduated!`:`${GRAD_TITLES[formats[0]]} Graduate!`}</h3>
   <p>{formats.length>1?`You finished every starter lesson in ${list(formats.map(f=>GRAD_TITLES[f]))}. Here are your certificates.`:`You finished all 12 starter lessons on the ${GRAD_TITLES[formats[0]]} path. Here is what you learned.`}</p>
  </div>
  {ids.length>1&&<div className={styles.tabs} role="group" aria-label="Choose a certificate">{formats.map((f,i)=><button key={f} type="button" aria-pressed={tab===i} onClick={()=>setTab(i)}>{GRAD_TITLES[f]}</button>)}</div>}
  <CertificateCard spec={spec}/>
  <div className={styles.card} style={{marginTop:20}}>
   <span className={styles.eyebrow}>Your rewards</span>
   <ul className={styles.rewards}>
    {formats.map(f=>{const cap=capRewardFor(f);return <li key={f}><span className={styles.swatch} style={{'--c1':cap.color,'--c2':cap.color2} as CSSProperties} aria-hidden="true"/><span><b>{cap.label} cap colours</b>{cap.why} Wear them: tap your player → Make it yours → More → Headwear colour.</span></li>;})}
    <li><span className={styles.swatch} style={{'--c1':'#fff1d3','--c2':'#22366b'} as CSSProperties} aria-hidden="true"/><span><b>{formats.length>1?'Certificates':'A certificate'} for your backpack</b>Save it as a picture, print it, or share it with a grown-up. It never shows your name.</span></li>
    <li><span className={styles.swatch} style={{'--c1':'#f8d651','--c2':'#477c6a'} as CSSProperties} aria-hidden="true"/><span><b>Hall of Fame</b>Your certificate now hangs in the History Museum, and your badge is on the Coaches Board.</span></li>
   </ul>
   <p>Finishing a path also opens a new ride and an Icon card pick.</p>
   {all?<div className={styles.nextUp}><p>All four paths graduated. The Matchday Ferry is open for your Matchday final!</p><button type="button" className={styles.primary} onClick={()=>openEndgame({target:'ferry'})}>Board the ferry</button></div>
    :next&&<div className={styles.nextUp}><p>Next up: the {GRAD_TITLES[next]} path. {nextWhy(next)}</p><button type="button" className={styles.primary} onClick={()=>openEndgame({target:'paths',format:next})}>Go to {GRAD_TITLES[next]}</button></div>}
   <CertificateActions spec={spec}/>
  </div>
 </div>;
}
const list=(items:string[])=>items.length<2?items.join(''):`${items.slice(0,-1).join(', ')} and ${items[items.length-1]}`;
export function nextFormat(record:GraduationRecord,just:readonly GradFormat[]):GradFormat|null{
 // QA11 C-5: with no just-graduated path, follow the main track (PATH_ORDER: 7v7 → 9v9 → 11v11, futsal last).
 const last=just[just.length-1],order:readonly GradFormat[]=last?NEXT_FORMAT[last]:PATH_ORDER as readonly GradFormat[];
 return order.find(f=>!record.formats[f])??(PATH_ORDER as readonly GradFormat[]).find(f=>!record.formats[f])??null;
}
const nextWhy=(f:GradFormat)=>({'7v7':'Seven a side: more touches for everyone.','9v9':'A bigger pitch, a back three and more space to share.','11v11':'The full-size game with the size 5 ball.',futsal:'Five a side on a hard court: quick feet and quick thinking.'} as Record<GradFormat,string>)[f];
