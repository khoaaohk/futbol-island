'use client';
import {useEffect,useRef,useState} from 'react';
import MiniCard,{CardBack} from './MiniCard';
import {CARD_ENTRIES,cardNumber} from '@/lib/town/cardCollection';
import {useArcadeWallet,purchaseMysteryPack} from '@/lib/arcade/arcadeWallet';
import {MYSTERY_PACK_OPTIONS,LEGEND_PACK_CANDIDATES,legendFor} from '@/lib/arcade/legendPacks';
import styles from './LegendPackStore.module.css';
const regularCards=CARD_ENTRIES.filter(card=>card.era==='current'&&!legendFor(card.name)).map(card=>card.name);
export default function LegendPackStore(){
 const reveal=useRef<HTMLElement>(null),wallet=useArcadeWallet(),lock=useRef(false),[busy,setBusy]=useState<3|5|null>(null),[error,setError]=useState(''),[selected,setSelected]=useState<string|null>(null);
 const receipt=wallet.packs.find(pack=>pack.id===selected);
 useEffect(()=>{if(!selected)return;reveal.current?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});},[selected]);
 async function buy(size:3|5){if(lock.current)return;lock.current=true;setBusy(size);setError('');try{const result=await purchaseMysteryPack(size,LEGEND_PACK_CANDIDATES,regularCards);if(result.ok)setSelected(result.pack.id);else setError(result.reason);}catch{setError('The pack could not be opened. Check your saved collection before trying again.');}finally{lock.current=false;setBusy(null);}}
 return <section className={styles.root} data-store-item="packs:legend" aria-label="Mystery card packs">
  <div className={styles.balance}><span>Arcade coins</span><strong aria-label={`${wallet.balance} arcade coins`}>{wallet.balance}</strong></div>
  <div className={styles.offers}>{MYSTERY_PACK_OPTIONS.map(offer=>{const short=Math.max(0,offer.price-wallet.balance);return <article className={styles.offer} key={offer.size} data-pack-size={offer.size}>
   <div className={styles.packArt}><CardBack mystery className={styles.largeCard}/><span>{offer.size} CARDS<br/>1 LEGEND GUARANTEED</span></div>
   <div className={styles.offerText}><p className={styles.eyebrow}>Mystery cards</p><h3>{offer.size}-card pack</h3><p>{offer.size===3?'One legend and two player cards.':'Five cards, including at least one legend.'}</p><p className={styles.terms}>{offer.size===5?'25% chance of two legends.':'One legend in every pack.'} Every legend includes a mental-strength note.</p><button type="button" disabled={busy!==null||short>0} onClick={()=>buy(offer.size)}>{busy===offer.size?'Opening…':`Open ${offer.size}-card pack · ${offer.price} coins`}</button><p className={styles.hint}>{short>0?`Earn ${short} more coins.`:'No duplicate cards within a pack. Previously collected cards may appear.'}</p></div>
  </article>;})}</div>
  <p role="status" aria-live="polite" className={styles.error}>{error}</p>
  {receipt&&<section ref={reveal} className={styles.packReveal} key={receipt.id} aria-label="Your opened pack"><h3>Your {receipt.packSize}-card pack</h3><p>Saved to your player collection · {receipt.cost} coins</p><div className={styles.revealedCards}>{(receipt.cards??[receipt.player]).map(name=>{const legend=legendFor(name),entry=CARD_ENTRIES.find(card=>card.name===name);return <article key={name} className={styles.revealCard}><MiniCard name={name} number={cardNumber(name)} era={legend?'allTime':entry?.era??'current'} got className={styles.smallCard}/><h4>{name}</h4>{legend?<><b>Legend · {legend.theme}</b><p>{legend.note}</p></>:<small>{entry?.roleLabel??'Player card'}</small>}</article>;})}</div><small>Coaching notes are original Futbol Island writing, not player quotes.</small></section>}
 </section>;
}
