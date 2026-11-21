import {LOGO_COLOURS} from '@/lib/site/marketing';
import {LESSONS_INDEX} from '@/lib/site/lessons';
import {SAFE_GUIDE} from '@/lib/site/hubs';
import {PLAY_PATH} from '@/lib/site/seo';
import {LIBRARY_PATH} from '@/lib/site/libraryPath';
import done from '@/components/DoneButton.module.css';
import styles from '@/app/(site)/site.module.css';
/**
 * The reading pages' top bar (owner, Nov 10 2026: "fix all these pages to match more with the main site"): the home page's bar
 * (app/(site)/page.tsx + components/learn/learn.module.css .subnav) as a static, server-rendered variant. Same 68px bar, the
 * multicolour IslandBrush wordmark, the same five labels and the gold Play pill (the game's navigation button face,
 * DoneButton.module.css, as a plain link). No client code (AGENTS.md, phone heat): the letters keep one colour each
 * (LOGO_COLOURS, as on /marketing) instead of LogoWord's timers, there is no current-chapter chip, no scroll listener, and the
 * phone menu is a bare <details> that opens and closes natively.
 * Links are real destinations: the hubs where a reading page exists, else the home chapter (`/#id`, the ids in page.tsx NAV).
 */
/* The third item (Nov 20 2026, owner: "when on the library page and clicking on the other navigation, it should go back to the main
 * page and scroll to that section"): the home chapter this link stands for (ids in app/(site)/page.tsx NAV). Such a link is
 * rendered twice, to its reading page and to the home chapter, and only one is shown: the reading page everywhere, the home
 * chapter on the Library (site.module.css, [data-library-hero]). Both are real hrefs and there is still no client code.
 * The Library's own link uses the same pair for aria-current="page": the copy shown on the Library carries it, the copy shown
 * everywhere else does not (a hidden link is not in the accessibility tree, so a screen reader meets exactly one). */
const NAV:readonly (readonly [string,string,string?])[]=[[LESSONS_INDEX,'Learn','/#learn'],['/#explore','Explore'],['/#together','Friends'],[SAFE_GUIDE.path,'Safety','/#safe'],['/about','About','/#about'],[LIBRARY_PATH,'Library',LIBRARY_PATH]]/* Nov 20 2026 (owner): Library, the hub of every footer section, after About */;
const NAME='Futbol Island';
const links=()=>NAV.map(([href,label,home])=><li key={href}><a href={href} data-nav-page={home?'':undefined}>{label}</a>{home&&<a href={home} data-nav-home="" aria-current={home===href?'page':undefined}>{label}</a>}</li>);
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
