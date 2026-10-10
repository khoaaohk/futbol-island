import styles from './IslandLoading.module.css';
import LoadingIslandArt from './LoadingIslandArt';
import LoadingBeanCast from './LoadingBeanCast';
import {HANDOFF_BOOT} from './islandLoadingBoot';

/**
 * The island loading screen as plain server-rendered HTML (no JS): `/` prerenders it beside the title screen (app/page.tsx), and
 * the pre-paint <html data-root-view> flag shows one of the two (lib/rootView.ts). A tab already in the game sees this from the
 * first paint while the game's code loads; then components/root/RootSwitch.tsx swaps in Town's own <IslandLoading/>, which
 * continues these CSS animations (continueLoaderFrom), so nothing restarts. Same markup as IslandLoading.tsx; the cast is `lite`.
 * The hand-off boot script is inlined here too: a restored save's reload into the game starts as the plain tan sheet.
 */
export default function IslandLoadingStatic(){
 return <div className="town-app" data-root-loader>
  <div data-main-island-loading className={`town-loading ${styles.screen}`} role="status">
   <script dangerouslySetInnerHTML={{__html:HANDOFF_BOOT}}/>
   <div className={styles.art} aria-hidden="true"><LoadingIslandArt/></div>
   <LoadingBeanCast lite/>
   <div className={styles.copy}>
    <span className={styles.eyebrow}>PLAY · LEARN · GROW</span>
    <h2>Futbol Island</h2>
    <span className="island-loading-track" aria-hidden="true"><span/></span>
   </div>
  </div>
 </div>;
}
