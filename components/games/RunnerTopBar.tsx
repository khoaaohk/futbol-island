'use client';
import {BackButton} from '../BackButton';
import {Icon} from '../Icon';
import styles from './RunnerTopBar.module.css';

/**
 * Breakaway Run top bar (owner, Oct 27 2026: "same consistent pause modal, score bar"), built like Island Strikers' header:
 * Back on the left, ONE centre pill with the primary number (points) and one short word, Pause on the right. No second
 * detail line (hearts, balls, route state are in the scene and on the full-time card). Kept runner-only so a later job can
 * fold all five games into one shared bar. headerClass / pauseClass come from ArcadeGame3D so the frame and the round
 * Pause button stay identical to the other arcade games.
 */
export function RunnerTopBar({score,phase,headerClass,pauseClass,onBack,onPause}:{score:string;phase:'ready'|'playing'|'paused'|'over';headerClass:string;pauseClass:string;onBack:()=>void;onPause:()=>void}){
 return <header className={`${headerClass} ${styles.bar}`} data-runner-bar>
  <BackButton onBack={onBack} label="Arcade"/>
  <p className={styles.pill} aria-live="off" data-runner-score><b key={score} className={styles.bump}>{score}</b><span>pts</span></p>
  <button className={pauseClass} onClick={onPause} disabled={phase==='ready'||phase==='over'} aria-label={phase==='paused'?'Resume game':'Pause game'}><Icon name={phase==='paused'?'play':'pause'} size={22}/></button>
 </header>;
}
