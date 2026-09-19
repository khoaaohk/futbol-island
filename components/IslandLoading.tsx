import styles from './IslandLoading.module.css';

/** Static artwork: the island can finish loading without another rendering loop. */
export default function IslandLoading(){
  return <div className={`town-loading ${styles.screen}`} role="status">
    <div className={styles.art} aria-hidden="true"><picture><source media="(min-width: 701px)" srcSet="/stories/paths/loading-island-wide.svg"/><img src="/stories/paths/loading-island.svg" alt="" fetchPriority="high"/></picture></div>
    <div className={styles.copy}>
      <span className={styles.eyebrow}>PLAY · LEARN · GROW</span>
      <h2>Your island. <br/>Your adventure.</h2>
      <span className="island-loading-track" aria-hidden="true"><span/></span>
    </div>
  </div>;
}
