import styles from './ShopDoorSlide.module.css';
/**
 * The Kit Shop's door transition (Oct 12 2026; the Museum and Konbini door slides' pattern, CSS only, one-shot, no JS loop).
 * - `enter` (island side): the glass doors slide apart and the shop's white light fills the screen before the page changes.
 * - `arrive` (shop side): the light fades to reveal the store, doors already open (held until the first frame is drawn).
 * - `leave` (shop side): the doors slide shut, then the island loads.
 * Reduced motion: no animation (arrive is hidden; enter/leave are a plain light cut).
 */
export default function ShopDoorSlide({mode,ready=true}:{mode:'enter'|'arrive'|'leave';ready?:boolean}){
 return <div className={styles.slide} data-mode={mode} data-ready={ready} data-shop-doors={mode} aria-hidden="true">
  <i className={styles.light}/>
  <i className={`${styles.door} ${styles.left}`}><b/></i><i className={`${styles.door} ${styles.right}`}><b/></i>
 </div>;
}
