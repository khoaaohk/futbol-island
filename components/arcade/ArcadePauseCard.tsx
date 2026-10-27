'use client';
import styles from './ArcadePauseCard.module.css';

/** One keycap row entry: the key(s) and what they do, e.g. ['W A S D','move']. */
export type ArcadeKey=readonly [string,string];

/**
 * The one arcade pause card (owner, Oct 27 2026: "do the same for the pause modal. keep them consistent as possible";
 * docs/ARCADE_CHROME_OCT27.md). Paused title, an optional one-line score, ONE big Resume, a small row with Arcade (exit),
 * an optional extra (Pass Puzzles: Puzzles) and Restart when the game supports it, and the game's keys as keycaps on
 * mouse / keyboard devices only (hidden on pointer:coarse by CSS). Same size, radius, colours and backdrop in every game.
 */
export function ArcadePauseCard({game,score,onResume,onExit,onRestart,restartDisabled,extra,keys,status}:{
 game:string;score?:string;onResume:()=>void;onExit:()=>void;onRestart?:()=>void;restartDisabled?:boolean;extra?:{label:string;onClick:()=>void};
 keys?:readonly ArcadeKey[];status?:string}){
 return <div className={styles.overlay} data-arcade-paused={game}>
  <section className={styles.card} role="dialog" aria-modal="false" aria-label="Paused">
   <h2 className={styles.title}>Paused</h2>
   {score&&<p className={styles.score} data-arcade-pause-score>{score}</p>}
   {status&&<p className={styles.status} role="status">{status}</p>}
   <button type="button" className={styles.resume} onClick={onResume} data-arcade-resume>Resume</button>
   <div className={styles.row}>
    <button type="button" className={styles.small} onClick={onExit} data-arcade-exit>Arcade</button>
    {extra&&<button type="button" className={styles.small} onClick={extra.onClick}>{extra.label}</button>}
    {onRestart&&<button type="button" className={styles.small} onClick={onRestart} disabled={restartDisabled} data-arcade-restart>Restart</button>}
   </div>
   {keys&&keys.length>0&&<ul className={styles.keys} aria-label="Keyboard controls">{keys.map(([k,what])=><li key={k}><kbd>{k}</kbd>{what}</li>)}</ul>}
  </section>
 </div>;
}
