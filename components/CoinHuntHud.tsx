'use client';
import styles from './CoinQuest.module.css';
import HudSlot from './HudStack';
/** Proximity guidance only; collected-ball lessons mount after the 3D effect ends. It sits in the HUD stack's focus slot
 *  (docs/ui/HUD_STACK.md) when the arbiter gives it the focus: a nearer action wins, and it outranks the ambient Learn card. */
export default function CoinHuntHud({near}:{near:string}){
 if(!near)return null;
 return <HudSlot><aside className={styles.hud} data-hud-slot="focus" data-coin-hint aria-live="polite"><div className={styles.near}>{near}</div></aside></HudSlot>;
}
