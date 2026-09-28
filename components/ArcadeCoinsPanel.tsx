'use client';
import {useEffect,useRef} from 'react';
import {DoneButton} from './DoneButton';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {arcadeCabinets,type ArcadeCabinetId} from '@/lib/arcade/arcadeCatalog';
import styles from './ArcadeCoinsPanel.module.css';
const earning:Record<ArcadeCabinetId,string>={runner:'2 per goal · 1 per 5 balls',pinball:'3 per goal · 2 per completed passing move',tennis:'1 per 3 clean returns · 2 per point · 4 per win',live:'1 per 3 passes · 3 per goal · finish and win bonuses',puzzle:'Free to play · 5 for a first solve · 1 per new best star'};
export default function ArcadeCoinsPanel({ready,onClose,onPlay,onWalk,onStore}:{ready:boolean;onClose:()=>void;onPlay:(id:ArcadeCabinetId)=>void;onWalk:(id:ArcadeCabinetId)=>void;onStore:()=>void}){
 const wallet=useArcadeWallet(),dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const restore=document.activeElement as HTMLElement;dialog.current?.showModal();close.current?.focus();return()=>restore?.focus?.();},[]);
 return <dialog id="arcade-coins-panel" ref={dialog} className={styles.dialog} aria-labelledby="arcade-coins-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <header><h2 id="arcade-coins-title">Your coins</h2><DoneButton ref={close} onDone={onClose}/></header>
  <div className={styles.body}>
   <div className={styles.balance}><strong>{wallet.balance}</strong><span>coins to spend</span><small>{wallet.lifetimeEarned} earned on the island</small></div>
   <section className={styles.pack}><h3>Play. Learn. Meet a legend.</h3><p>Choose a 3-card pack for 40 coins or a 5-card pack for 60. Both guarantee a legend and a mental-strength note.</p><button type="button" className={styles.storeLink} onClick={onStore}>Visit store</button></section>
   <section aria-label="Choose your arcade machine"><h3>Earn on the machines</h3><p className={styles.detail}>Each play costs 3 coins (Pass Puzzles are free). Goals, good touches and better decisions earn coins. Each round has a limit; start another to keep playing.</p>{arcadeCabinets.map(c=><article key={c.id} className={styles.machine} style={{'--cabinet':c.color} as React.CSSProperties}><div><h4>{c.name}</h4><b>{wallet.byGame[c.id]} earned</b></div><p>{earning[c.id]}</p><div><button onClick={()=>onWalk(c.id)} disabled={!ready} aria-label={`${c.name} · Walk over`}>Walk over</button><button onClick={()=>onPlay(c.id)} aria-label={`Play ${c.name}`}>Play</button></div></article>)}</section>
   {wallet.history.length>0&&<section><h3>Recent earnings</h3><ul className={styles.history}>{wallet.history.slice(0,8).map(h=><li key={h.id}><span>{h.game==='island'?'Island activities':arcadeCabinets.find(c=>c.id===h.game)?.name}<small>{h.reason}</small></span><b>+{h.amount}</b></li>)}</ul></section>}
   <p className={styles.detail}>Progress saves in this browser. Coins are earned through play.</p>
  </div>
 </dialog>;
}
