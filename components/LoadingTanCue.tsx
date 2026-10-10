import styles from './IslandLoading.module.css';

/**
 * The tan sheet's "still getting the island ready" cue (preload pass, Oct 9 2026): a little football bouncing on its shadow, in
 * the middle of the plain tan sheet the title screen hands over (<html data-island-handoff="tan">). CSS only: hidden by default,
 * shown in tan mode after a 0.9 s delay (a warmed island is usually there before it, and the first tan frame stays the title's last
 * one); transform/opacity keyframes, which do not run in a hidden tab; reduced motion shows the ball still. Server-safe (no hooks), so
 * the prerendered placeholder (IslandLoadingStatic) and Town's IslandLoading both carry it.
 */
export default function LoadingTanCue(){
 return <span className={styles.tanCue} aria-hidden="true">
  <i className={styles.tanCueShadow}/>
  <svg className={styles.tanCueBall} viewBox="0 0 40 40" width="40" height="40" focusable="false">
   <circle cx="20" cy="20" r="17" fill="#fff8e6" stroke="#153f43" strokeWidth="2.6"/>
   <path d="M20 12.5l7.1 5.2-2.7 8.3h-8.8l-2.7-8.3z" fill="#153f43"/>
   <path d="M20 3v9.5M27.1 17.7l9-2.9M24.4 26l5.5 7.6M15.6 26l-5.5 7.6M12.9 17.7l-9-2.9" stroke="#153f43" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
 </span>;
}
