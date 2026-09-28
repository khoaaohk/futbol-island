'use client';
import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import MiniCard from './MiniCard';
import {IslandSelect} from './IslandSelect';
import {CARD_ENTRIES,ROLE_LABELS,ROLE_ORDER} from '@/lib/town/cardCollection';
import {CARD_ADDED} from '@/lib/town/cardRewardStore';
import {CARD_TRADE_COINS,CARD_TRADES_PER_DAY,tradesLeft} from '@/lib/town/market/cardSelling';
import {CARD_REMOVED,cardTrade} from '@/lib/town/market/cardSellingStore';
import styles from './MarketCardsSection.module.css';

/**
 * The Cards section of the farmers-market sell stand (docs/sell-shop.md). The stand (components/FishMarket.tsx, fishing
 * agent) renders it as its third section next to Fish and Produce: `<MarketCardsSection active={tab==='cards'} onSold={…}/>`.
 * Cards are earned by learning, so this section protects the binder first: trade-ins ship switched off (CARD_TRADE_MODE),
 * and when they are on, each one is a low flat price, asks for a confirmation, and Icons and pack legends are never listed.
 * Heat: renders nothing and reads nothing while `active` is false; no timers; the coin burst is a one-shot CSS animation.
 */
type Props={active:boolean;onSold?:(coins:number,name:string)=>void};
const ENTRY=new Map(CARD_ENTRIES.map(c=>[c.name,c]));
/** The kit-man's football-business facts (docs/sell-shop.md "Football tie-in" has the sources). */
const FACTS=[
 'Football cards and stickers go back a long way: Panini made its first World Cup sticker album for Mexico 1970, and fans have swapped "got, got, need" ever since.',
 'When a professional player moves to a new club while still under contract, the new club pays the old club a transfer fee.',
 'FIFA\'s solidarity rule shares 5% of an international transfer fee with the clubs that trained the player between the ages of 12 and 23, so a first club gets a thank-you too.',
 'Clubs earn money from tickets, shirts and TV, and many spend part of it on their youth academy: coaches, pitches and kit for young players.',
];
const factOfTheDay=()=>{const d=new Date();return FACTS[(d.getFullYear()*372+d.getMonth()*31+d.getDate())%FACTS.length];};

export default function MarketCardsSection({active,onSold}:Props){
 const [version,setVersion]=useState(0),[role,setRole]=useState('all'),[confirm,setConfirm]=useState<string|null>(null);
 const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);
 const [note,setNote]=useState<{text:string;coins:number;id:number}|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!active)return;const bump=()=>setVersion(v=>v+1);window.addEventListener(CARD_ADDED,bump);window.addEventListener(CARD_REMOVED,bump);window.addEventListener('storage',bump);const off=cardTrade.subscribe(bump);
  return()=>{window.removeEventListener(CARD_ADDED,bump);window.removeEventListener(CARD_REMOVED,bump);window.removeEventListener('storage',bump);off();};},[active]);
 const view=useMemo(()=>{
  if(!active||!mounted)return null;
  const mode=cardTrade.mode(),ledger=cardTrade.ledger(),cards=cardTrade.tradeable().map(n=>ENTRY.get(n)).filter((c):c is NonNullable<typeof c>=>!!c).sort((a,b)=>a.number-b.number);
  return {mode,left:tradesLeft(ledger),cards};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[active,mounted,version]);
 const fact=useMemo(factOfTheDay,[]);
 if(!active||!view)return null;
 const roles=[{value:'all',label:`All cards (${view.cards.length})`},...ROLE_ORDER.map(r=>({value:r,label:`${ROLE_LABELS[r]??r} (${view.cards.filter(c=>c.role===r).length})`})).filter(o=>!o.label.endsWith('(0)'))];
 const shown=view.cards.filter(c=>role==='all'||c.role===role).slice(0,60);
 async function trade(name:string){
  if(busy)return;setBusy(true);
  const result=await cardTrade.trade(name);setBusy(false);setConfirm(null);
  setNote({text:result.message,coins:result.ok?result.credited||result.coins:0,id:Date.now()});
  if(result.ok)onSold?.(result.coins,result.name);
 }
 const pending=confirm?ENTRY.get(confirm):undefined;
 return <section className={styles.section} aria-label="Sell cards" data-market-cards data-trade-mode={view.mode}>
  <div className={styles.keeper}>
   <span className={styles.badge} aria-hidden="true">Kit</span>
   <div><strong>Remi the kit-man</strong><p>{fact}</p></div>
  </div>
  {note&&<p key={note.id} className={styles.note} role="status" data-card-trade-note>
   {note.coins>0&&<span className={styles.burst} aria-hidden="true">{[0,1,2,3,4].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</span>}
   {note.coins>0&&<b>+{note.coins} coins</b>} {note.text}
  </p>}
  {view.mode==='off'?<div className={styles.safe} data-cards-safe>
   <h3>Your cards stay in your binder</h3>
   <p>You earned every card by learning: lessons, quizzes, ball hunts and chats. There are no duplicates, so each one is part of your collection, and the stand does not buy cards.</p>
   <p className={styles.small}>Want more cards? Finish a path lesson or a quiz with every answer right.</p>
  </div>:<>
   <div className={styles.rules}>
    <span className={styles.chip}>Any card: {CARD_TRADE_COINS} coins</span>
    <span className={styles.chip} data-trades-left={view.left}>{view.left?`${view.left} of ${CARD_TRADES_PER_DAY} trade-ins left today`:'No trade-ins left today'}</span>
   </div>
   <p className={styles.small}>A traded card leaves your binder. The game&apos;s greatest players and legends from packs always stay yours, so they are not listed.</p>
   {view.cards.length>0&&<IslandSelect label="Show" value={role} options={roles} onChange={setRole} className={styles.select}/>}
   {shown.length?<ul className={styles.list}>
    {shown.map(c=><li key={c.name} className={styles.row}>
     <MiniCard name={c.name} number={c.number} era={c.era} got compact thumb className={styles.thumb}/>
     <span className={styles.who}><b>{c.name}</b><small>{c.roleLabel}</small></span>
     <button type="button" className={styles.sell} disabled={!view.left||busy} onClick={()=>setConfirm(c.name)} aria-label={`Trade in ${c.name} for ${CARD_TRADE_COINS} coins`}>Trade in<span>{CARD_TRADE_COINS}</span></button>
    </li>)}
   </ul>:<p className={styles.empty}>No cards to trade here yet. Keep learning to fill your binder!</p>}
  </>}
  {pending&&<div className={styles.confirm} role="alertdialog" aria-modal="false" aria-labelledby="market-card-confirm" data-card-confirm>
   <MiniCard name={pending.name} number={pending.number} era={pending.era} got className={styles.big}/>
   <div>
    <h3 id="market-card-confirm">Trade in {pending.name} for {CARD_TRADE_COINS} coins?</h3>
    <p>This card will leave your binder. You might find it again in a future card pick, but it is not guaranteed.</p>
    <div className={styles.actions}>
     <button type="button" className={styles.keep} onClick={()=>setConfirm(null)} autoFocus>Keep it</button>
     <button type="button" className={styles.yes} disabled={busy} onClick={()=>void trade(pending.name)}>Trade in</button>
    </div>
   </div>
  </div>}
 </section>;
}
