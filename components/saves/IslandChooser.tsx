'use client';
/**
 * "Which island do you want?" (docs/accounts-design.md §4.4; Oct 10 2026): two devices both played since the last save. One
 * card per island with its summary; the one not chosen is kept on this device for 7 days ("Undo swap" in Settings).
 */
import {useEffect,useState} from 'react';
import {keepThisIsland,loadConflict,chooseSavedIsland,type Conflict} from '@/lib/saves/client';
import {summaryLine} from '@/lib/saves/summary';
import styles from './SaveCode.module.css';

export default function IslandChooser({onDone}:{onDone:()=>void}){
 const [c,setC]=useState<Conflict|null|'error'>(null),[busy,setBusy]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{let live=true;loadConflict().then(r=>{if(live)setC(r??'error');});return()=>{live=false;};},[]);
 if(c===null)return <div className={styles.box}><h3 className={styles.title}>Which island do you want?</h3><p className={styles.status} role="status">Getting both islands…</p></div>;
 if(c==='error')return <div className={styles.box}><h3 className={styles.title}>Which island do you want?</h3>
  <p className={styles.copy}>We can’t reach the saved island right now. Keep playing: we’ll ask again next time.</p>
  <div className={styles.row}><button type="button" className={styles.secondary} onClick={onDone}>OK</button></div></div>;
 return <div className={styles.box} data-island-chooser>
  <h3 className={styles.title}>Which island do you want?</h3>
  <p className={styles.copy}>You played on this device and on another one. Pick one island to keep playing.</p>
  <div className={styles.islands}>
   <article className={styles.island} data-island="here"><h4>This device</h4><p>{summaryLine(c.here)}</p>
    <button type="button" className={styles.primary} data-keep-this disabled={busy} onClick={async()=>{setBusy(true);const ok=await keepThisIsland(c);setBusy(false);if(ok)onDone();else setFailed(true);}}>Keep this one</button></article>
   <article className={styles.island} data-island="saved"><h4>Saved island</h4><p>{summaryLine(c.saved)}</p>
    <button type="button" className={styles.primary} data-use-saved disabled={busy} onClick={()=>{setBusy(true);chooseSavedIsland(c);}}>Use the saved one</button></article>
  </div>
  {failed&&<p className={`${styles.status} ${styles.warn}`} role="status">That didn’t save. Try again in a moment.</p>}
  <p className={styles.small}>The island you don’t pick stays on this device for 7 days. You can undo in Settings.</p>
 </div>;
}
