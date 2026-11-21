import {LOGO_COLOURS} from '@/lib/site/marketing';
import {LESSONS_INDEX} from '@/lib/site/lessons';
import {PLAY_PATH} from '@/lib/site/seo';
import {LIBRARY_PATH} from '@/lib/site/libraryPath';
import done from '@/components/DoneButton.module.css';
import styles from '@/app/(site)/site.module.css';
/**
 * The reading pages' top bar (owner, Nov 10 2026: "fix all these pages to match more with the main site"): the home page's bar
 * (app/(site)/page.tsx + components/learn/learn.module.css .subnav) as a static, server-rendered variant. Same 68px bar, the
 * multicolour IslandBrush wordmark, three labels (below) and the gold Play pill (the game's navigation button face,
 * DoneButton.module.css, as a plain link). No client code (AGENTS.md, phone heat): the letters keep one colour each
 * (LOGO_COLOURS, as on /marketing) instead of LogoWord's timers, there is no current-chapter chip, no scroll listener, and the
 * phone menu is a bare <details> that opens and closes natively.
 */
/* Nov 20 2026 evening (owner: "Learn, Game, and Library. Learn keeps existing page, game goes to a page for games ... library
 * will go to all the other items"): three links and Play. Explore, Friends, Safety and About left the bar; About and the safety
 * page are in the footer (app/(site)/layout.tsx). Games and Library are each rendered twice: the plain copy everywhere, the copy
 * with aria-current="page" (data-nav-cur) only on its own pages, which mark themselves ([data-games-page] in GameIntro,
 * [data-library-hero] in LibraryPage) so CSS shows one copy (site.module.css). A hidden link is not in the accessibility
 * tree, so a screen reader meets exactly one. Still no client code. */
const NAV:readonly (readonly [string,string,('games'|'library')?])[]=[[LESSONS_INDEX,'Learn'],['/games','Games','games'],[LIBRARY_PATH,'Library','library']];
const NAME='Futbol Island';
export const navLinks=(nav:readonly (readonly [string,string,string?])[])=>nav.map(([href,label,cur])=><li key={href}><a href={href} data-nav-page={cur}>{label}</a>{cur&&<a href={href} data-nav-cur={cur} aria-current="page">{label}</a>}</li>);
const links=()=>navLinks(NAV);
export default function SiteNav(){
 return <nav className={styles.nav} aria-label="Site">
  <a className={styles.brand} href="/" aria-label={`${NAME} home`}><span aria-hidden="true">{[...NAME].map((ch,i)=>ch===' '?' ':<span key={i} style={{color:LOGO_COLOURS[i%LOGO_COLOURS.length]}}>{ch}</span>)}</span></a>
  <ul className={styles.navLinks}>{links()}</ul>
  <details className={styles.menu}>
   <summary className={styles.menuBtn} aria-label="Menu"><span className={styles.menuIco} aria-hidden="true"><i/><i/></span></summary>
   <div className={styles.menuPanel}><ul className={styles.menuList}>{links()}</ul></div>
  </details>
  <a className={`${styles.play} ${done.button}`} href={PLAY_PATH} aria-label="Play"><span className={done.label} aria-hidden="true">Play</span></a>
 </nav>;
}
