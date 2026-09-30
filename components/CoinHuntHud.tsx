'use client';
import styles from './CoinQuest.module.css';
/** Proximity guidance only; collected-ball lessons mount after the 3D effect ends. */
export default function CoinHuntHud({near}:{near:string}){
 if(!near)return null;
 return <aside className={styles.hud} data-coin-hint aria-live="polite"><div className={styles.near}>{near}</div></aside>;
}
