'use client';
import {openCardOffer,useCardOffers} from '@/lib/town/cardRewardStore';
import styles from './CardOffer.module.css';

/** Pending card picks, shown where the child looks for cards. Each renders nothing when no pick is waiting (or rewards are off). */
const label=(n:number)=>`${n} card ${n===1?'pick':'picks'} waiting`;

/** On the Collect cards tile (inside its button: visual only, the tile opens the binder where the pill opens the pick). */
export function CardOfferTileBadge(){const n=useCardOffers().length;return n?<span className={styles.tileBadge}>{n===1?'1 card to choose':`${n} cards to choose`}</span>:null;}
/** A small count on the Paths button (decorative: the button's own label carries the count, see pendingPicksLabel). */
export function CardOfferDot(){const n=useCardOffers().length;return n?<span className={styles.dot} aria-hidden="true">{n}</span>:null;}
export const usePendingPicks=()=>useCardOffers().length;
export const pendingPicksLabel=(n:number)=>n?`, ${label(n)}`:'';
/** Above the binder's dock: opens the first waiting pick. */
export function CardOfferPill(){const n=useCardOffers().length;return n?<button type="button" className={styles.pill} onClick={openCardOffer} aria-label={`Pick a card: ${label(n)}`}><span aria-hidden="true">{n}</span>Pick a card</button>:null;}
