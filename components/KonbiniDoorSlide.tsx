import styles from './KonbiniDoorSlide.module.css';
/**
 * The Konbini sliding-door transition (CSS only, one-shot, no JS animation loop).
 * - `enter` (island side): two glass doors slide apart and bright shop light fills the screen before the page changes.
 * - `arrive` (Konbini side): the light fades to reveal the interior, doors already open.
 * - `leave` (Konbini side): the doors slide shut, then the island loads.
 */
export default function KonbiniDoorSlide({mode,ready=true}:{mode:'enter'|'arrive'|'leave';
 /** arrive: keep the door light up until the store's first frame is drawn (no flash of an empty page). */
 ready?:boolean}){
 return <div className={styles.slide} data-mode={mode} data-ready={ready} data-konbini-doors={mode} aria-hidden="true">
  <i className={styles.light}/>
  <i className={`${styles.door} ${styles.left}`}><b/></i><i className={`${styles.door} ${styles.right}`}><b/></i>
 </div>;
}
