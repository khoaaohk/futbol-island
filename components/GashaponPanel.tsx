'use client';
/**
 * The gashapon buy panel (round 2, Nov 8 2026; docs/gashapon-design.md), now for the ARCADE ROOM's pair only: the arcade is its
 * own small scene with no camera zoom path, so its machines keep this compact dialog. The island's machines are their own
 * interface since round 5 (components/GashaponMachineFace.tsx, owner Nov 9 2026: "not a modal. like the vending machine").
 * Both share the spin flow in components/useGashaponSpin.ts. The dialog for whichever machine
 * lib/gashapon/gashaponBrowser.ts `gashaponPanel` has open: the machine's name, the
 * price, your coins, a Spin button, "X of 6 toys found" and today's spins left. A spin is ONE store call with one spin id made
 * per press (a failed save keeps that id, so "Try again" can never charge twice), then a short capsule drop: the crank turns,
 * a capsule rolls into the tray, pops open, and the toy's card shows (NEW, or "Repeat · +5 coins back"). The card art is a
 * placeholder drawn from the toy's own two colours; "Look closer" opens the 3D toy viewer (`openToyViewer`, round 3A) and
 * "Toy Shelf" every machine's toys (`openToyShelf`). A finished spin is counted once (lib/analytics/gashaponEvents.ts).
 *
 * Heat: no loops or timers while idle; the drop is CSS (transform/opacity) plus three timeouts per spin. Reduced motion: no
 * travel, the card shows straight away. Sounds: lib/gashapon/gashaponSound.ts (muted with the island).
 */
import {useRef} from 'react';
import {gashaponMachine,type GashaponMachine} from '@/lib/gashapon/machines';
import {GASHAPON_PRICE,GASHAPON_REFUND,GASHAPON_SPINS_PER_DAY} from '@/lib/gashapon/store';
import {openToyShelf,openToyViewer,useGashaponPanel} from '@/lib/gashapon/gashaponBrowser';
import {useGashaponSpin,RARITY_LABEL} from './useGashaponSpin';
import ToyIcon from './ToyIcon';
import styles from './GashaponPanel.module.css';

export default function GashaponPanel(){
 const id=useGashaponPanel(),machine=id?gashaponMachine(id):undefined;
 return machine?<Panel key={machine.id} machine={machine}/>:null;
}

function Panel({machine}:{machine:GashaponMachine}){
 const spinButton=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDivElement>(null);
 // The spin flow, store calls, keyboard and focus rules: components/useGashaponSpin.ts (shared with the island's machine face).
 const {wallet,save,phase,shown,error,toys,found,left,busy,blocked,close,spin}=useGashaponSpin(machine,{root:dialog,spinButton});
 const capsule=shown?.toy.colors[0]??machine.color;
 return <div className={styles.scrim} data-gashapon-panel={machine.id} onPointerDown={e=>{if(e.target===e.currentTarget)close();}}>
  <div ref={dialog} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="gashapon-title" style={{'--machine':machine.color,'--accent':machine.accent} as React.CSSProperties}>
   <header className={styles.head}>
    <div><h2 id="gashapon-title" className={styles.title}>{machine.name}</h2><p className={styles.theme}>{machine.theme}</p></div>
    <button type="button" className={styles.close} onClick={close} disabled={busy} aria-label="Close the capsule machine" data-gashapon-close>×</button>
   </header>
   <div className={styles.stage} data-phase={phase} aria-hidden="true">
    <div className={styles.globe}><i/><i/><i/><i/><i/></div>
    <div className={styles.crank}><i/></div>
    <div className={styles.tray}/>
    <div className={styles.capsule} style={{'--cap':capsule} as React.CSSProperties}><b/><b/></div>
   </div>
   {shown&&phase==='reveal'?<section className={styles.card} data-gashapon-result={shown.toy.id} data-rarity={shown.toy.rarity} aria-live="polite">
     <ToyIcon id={shown.toy.id} size={76} className={styles.art}/>
     <div className={styles.cardText}>
      <h3 className={styles.toyName}>{shown.toy.name}</h3>
      <p className={styles.meta}><span className={styles.rarity}>{RARITY_LABEL[shown.toy.rarity]}</span>{shown.duplicate
       ?<span className={styles.repeat} data-gashapon-repeat>Repeat ({shown.count} now){shown.refund>0?` · +${shown.refund} coins back`:''}</span>
       :<span className={styles.fresh} data-gashapon-new>New!</span>}</p>
      <p className={styles.blurb}>{shown.toy.personality}</p>
      <p className={styles.link}>{shown.toy.link.note}.</p>
      <button type="button" className={styles.secondary} onClick={()=>openToyViewer(shown.toy.id,'result')} data-gashapon-look>Look closer</button>
     </div>
    </section>
   :<dl className={styles.facts}>
     <div><dt>Price</dt><dd>{GASHAPON_PRICE} coins</dd></div>
     <div><dt>Your coins</dt><dd data-gashapon-balance>{wallet.balance}</dd></div>
     <div><dt>Repeat toy</dt><dd>+{GASHAPON_REFUND} back</dd></div>
    </dl>}
   {error&&<p className={styles.error} role="alert" data-gashapon-error>{error.text}</p>}
   <button ref={spinButton} type="button" className={styles.spin} onClick={()=>void spin()} disabled={busy||!!blocked} data-gashapon-spin data-blocked={blocked??undefined}>
    {busy?'Turning…':blocked==='coins'?'Earn coins to spin':blocked==='cap'?'Back tomorrow':error?.retry?'Try again (no extra coins)':shown?`Spin again · ${GASHAPON_PRICE} coins`:`Spin · ${GASHAPON_PRICE} coins`}
   </button>
   <footer className={styles.foot}>
    <p className={styles.progress} data-gashapon-progress={found}><span className={styles.dots} aria-hidden="true">{toys.map(t=><i key={t.id} data-on={!!save.owned[t.id]} style={{'--dot':t.colors[0]} as React.CSSProperties}/>)}</span>{found} of {toys.length} toys found</p>
    <button type="button" className={styles.shelf} onClick={()=>openToyShelf()} disabled={busy} data-gashapon-shelf>Toy Shelf</button>
    <p className={styles.left} data-gashapon-left={left}>{left>0?`${left} of ${GASHAPON_SPINS_PER_DAY} capsules left today`:'No capsules left today. Back tomorrow!'}</p>
   </footer>
  </div>
 </div>;
}
