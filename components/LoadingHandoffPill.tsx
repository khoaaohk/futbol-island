import title from './landing/Title.module.css';
import styles from './IslandLoading.module.css';

/**
 * A restored save's reload (Nov 5 2026, user: no tan sheet before the island): the title screen ends on its sea with only the full
 * "Loading…" water pill left (components/landing/waterLaunch.ts runPillExit), and the reload's loader starts as exactly that frame:
 * this copy of the pill (the title's own classes, the water full) at the same viewport box, which the pre-paint boot script hands
 * over as --handoff-pill-* on <html data-island-handoff="pill"> (islandLoadingBoot.ts). Hidden in every other mode (CSS). Static
 * markup, no JS, so the server-rendered loader (IslandLoadingStatic) and Town's IslandLoading both carry it.
 */
export default function LoadingHandoffPill(){
 return <div className={styles.handoffPill} aria-hidden="true">
  <span className={`${title.start} ${title.waterPill}`} data-loading="">
   <i className={title.water}><i className={title.waterFill} style={{transform:'none'}}>
    <svg className={`${title.waterCrest} ${title.waterCrestBack}`} viewBox="0 0 240 24" preserveAspectRatio="none" focusable="false"><path d="M0 12C20 4 40 4 60 12S100 20 120 12 160 4 180 12 220 20 240 12V24H0Z"/></svg>
    <svg className={title.waterCrest} viewBox="0 0 240 24" preserveAspectRatio="none" focusable="false"><path d="M0 12C20 4 40 4 60 12S100 20 120 12 160 4 180 12 220 20 240 12V24H0Z"/></svg>
   </i></i>
   <span>Loading…</span>
  </span>
 </div>;
}
