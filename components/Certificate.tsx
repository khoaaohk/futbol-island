'use client';
import {useState,type CSSProperties} from 'react';
import {saveCertificate,type CertificateSpec} from '@/lib/endgame/certificate';
import styles from './Endgame.module.css';

/** A certificate as paper on screen (DOM only). The PNG for saving, sharing or printing is drawn only when asked. */
export function CertificateCard({spec}:{spec:CertificateSpec}){
 return <article className={styles.cert} style={{'--ink':spec.ink,'--accent':spec.accent} as CSSProperties} data-certificate={spec.id} aria-label={`${spec.title} certificate`}>
  <div className={styles.certInner}>
   <Seal ink={spec.ink} accent={spec.accent}/>
   <span className={styles.eyebrow}>{spec.kicker}</span>
   <h3>{spec.title}</h3>
   <p>{spec.subtitle}</p>
   <ul className={styles.certList}>{spec.lines.map(line=><li key={line}>{line}</li>)}</ul>
   <p className={styles.certDate}>{spec.date}</p>
  </div>
 </article>;
}
export function Seal({ink,accent}:{ink:string;accent:string}){
 return <svg className={styles.seal} viewBox="0 0 72 72" aria-hidden="true"><path d="m24 48-6 20 18-8 18 8-6-20" fill={ink}/><circle cx="36" cy="30" r="26" fill={accent} stroke={ink} strokeWidth="4"/><circle cx="36" cy="30" r="18" fill="none" stroke={ink} strokeWidth="2" strokeDasharray="4 3"/><path d="m36 18 3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1-7.2-3.8-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2z" fill={ink}/></svg>;
}
/** Save / share with a grown-up / print. No personal data is on the picture. */
export function CertificateActions({spec}:{spec:CertificateSpec}){
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 const run=async(mode:'save'|'share'|'print')=>{if(busy)return;setBusy(true);setStatus(mode==='print'?'Getting it ready to print…':'Making your picture…');
  const r=await saveCertificate(spec,mode);setBusy(false);
  setStatus(r==='shared'?'Shared!':r==='saved'?'Saved as a picture. Show it to a grown-up!':r==='printed'?'Print window opened.':r==='cancelled'?'':'That didn’t work this time. Try Save picture.');};
 const canShare=typeof navigator!=='undefined'&&'share' in navigator;
 return <><div className={styles.actions}>
  <button type="button" className={styles.primary} disabled={busy} onClick={()=>run('save')}>Save picture</button>
  {canShare&&<button type="button" className={styles.secondary} disabled={busy} onClick={()=>run('share')}>Share with a grown-up</button>}
  <button type="button" className={styles.secondary} disabled={busy} onClick={()=>run('print')}>Print</button>
 </div><p className={styles.status} role="status" aria-live="polite">{status}</p></>;
}
