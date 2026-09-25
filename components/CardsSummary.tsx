'use client';
import {useEffect,useState} from 'react';
import {Icon} from './Icon';
import {CARD_ENTRIES,readCollection} from '@/lib/town/cardCollection';
import {CardOfferTileBadge} from './CardOfferBadges';
import {useCardOffers} from '@/lib/town/cardRewardStore';
import styles from './CoinQuest.module.css';
/** Base-camp tile for the player-card collection, styled like its Ball hunt neighbour. */
export function CardsSummary({onCards}:{onCards:()=>void}){
 const [count,setCount]=useState(0),offers=useCardOffers();
 // Re-read when a pick is chosen (the pending offers change), so the count stays current.
 useEffect(()=>{setCount(readCollection().length);},[offers]);
 return <button type="button" className={styles.summaryCard} onClick={onCards} aria-haspopup="dialog">
  <span className={styles.summaryTitle}><strong>Collect cards</strong></span><span className={styles.summaryArrow}><Icon name="arrow" size={24}/></span>
  <span className={styles.summaryCount}>{count} / {CARD_ENTRIES.length} <span data-count-word="">collected</span></span>
  <CardOfferTileBadge/>
 </button>;
}
