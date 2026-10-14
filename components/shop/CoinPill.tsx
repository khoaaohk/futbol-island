'use client';
import type {HTMLAttributes} from 'react';
import styles from './CoinPill.module.css';

/**
 * The Kit Shop's one coin-balance pill (Oct 13 2026, user: "make all the coins the same ... consistent in position, size, and
 * style"). Styled exactly like the Kit Shop room's `.coins` pill: cream background, the gold coin icon, the same weight, size,
 * padding, radius and shadow — used in the room header and in all three studio headers (Jersey, Ball, Boots) so the four read
 * identically. Always shows the player's live WALLET balance (never an item's price: prices stay on the Buy button).
 * Display-only (a <span>, not a button), so it carries no tap-target rule; its number reads as "N coins" to a screen reader.
 */
type Props=Omit<HTMLAttributes<HTMLSpanElement>,'children'|'aria-label'>&{balance:number};
export default function CoinPill({balance,className,...rest}:Props){
 return <span {...rest} className={className?`${styles.coinPill} ${className}`:styles.coinPill} aria-label={`${balance} coins`}>
  <i className={styles.coin} aria-hidden="true"/>{balance}
 </span>;
}

/** The same gold coin on its own, for prices (Buy buttons, receipts, confirm sheets) so every coin in the shop matches. */
export function CoinIcon({size=20}:{size?:number}){
 return <i className={styles.coin} style={{width:size,height:size}} aria-hidden="true"/>;
}
