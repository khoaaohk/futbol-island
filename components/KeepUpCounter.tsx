import type {HTMLAttributes} from 'react';
import styles from './KeepUpCounter.module.css';
/**
 * The keep-ups pill ("Keep-ups: 3  best 9"), ONE component for the Konbini (components/KonbiniRoom.tsx, which adds its own
 * position above the ball buttons) and the island (components/Town.tsx, in the HUD stack's task slot). Owner, Oct 22 2026:
 * "the kickup on the main screen should act just like the one in the kombini where it counts your kickups". The look is the
 * Konbini's (cream grain pill, brush numeral, a one-shot star sparkle on a new best, static with reduced motion); the count
 * and the shared best come from lib/town/keepUps.ts. Purely presentational: no timers, no storage.
 */
export type KeepUpCounterProps={n:number;live:boolean;best:number;newBest?:boolean;newBestClassName?:string;/** 'island': in the HUD stack's flow. */placement?:'island'}&Omit<HTMLAttributes<HTMLParagraphElement>,'children'>&{[k:`data-${string}`]:unknown};
export default function KeepUpCounter({n,live,best,newBest,className,newBestClassName,placement,...rest}:KeepUpCounterProps){
 return <p {...rest} className={`${styles.pill}${placement==='island'?' '+styles.island:''}${className?' '+className:''}`} data-keepup-counter={n} data-live={live||undefined} data-best={newBest||undefined} role={live?undefined:'status'}>
  Keep-ups: <b>{n}</b>{newBest?<span className={`${styles.newBest}${newBestClassName?' '+newBestClassName:''}`}>★ New best!</span>:best>0?<small>best {best}</small>:null}</p>;
}
