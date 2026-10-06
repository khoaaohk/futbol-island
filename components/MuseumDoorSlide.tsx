import styles from './MuseumDoorSlide.module.css';
/**
 * The History Museum's door transition (Oct 3 2026; the Konbini door slide's pattern, CSS only, one-shot, no JS loop).
 * - `enter` (island side): the tall wooden doors swing open and warm gallery light fills the screen before the page changes.
 * - `arrive` (museum side): the light fades to reveal the hall, doors already open (held until the first frame is drawn).
 * - `leave` (museum side): the doors swing shut, then the island loads.
 * Reduced motion: no animation (arrive is hidden; enter/leave are a plain light cut).
 */
export default function MuseumDoorSlide({mode,ready=true}:{mode:'enter'|'arrive'|'leave';ready?:boolean}){
 return <div className={styles.slide} data-mode={mode} data-ready={ready} data-museum-doors={mode} aria-hidden="true">
  <i className={styles.light}/>
  <i className={`${styles.door} ${styles.left}`}><b/></i><i className={`${styles.door} ${styles.right}`}><b/></i>
 </div>;
}
