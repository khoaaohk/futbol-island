import {LOGO_COLOURS} from '@/lib/site/marketing';
import {LESSONS_INDEX} from '@/lib/site/lessons';
import {SAFE_GUIDE} from '@/lib/site/hubs';
import {PLAY_PATH} from '@/lib/site/seo';
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
const NAV:readonly (readonly [string,string])[]=[[LESSONS_INDEX,'Learn'],['/#explore','Explore'],['/#together','Friends'],[SAFE_GUIDE.path,'Safety'],['/about','About']];
const NAME='Futbol Island';
export default function SiteNav(){
 return <nav className={styles.nav} aria-label="Site">
  <a className={styles.brand} href="/" aria-label={`${NAME} home`}><span aria-hidden="true">{[...NAME].map((ch,i)=>ch===' '?' ':<span key={i} style={{color:LOGO_COLOURS[i%LOGO_COLOURS.length]}}>{ch}</span>)}</span></a>
  <ul className={styles.navLinks}>{NAV.map(([href,label])=><li key={href}><a href={href}>{label}</a></li>)}</ul>
  <details className={styles.menu}>
   <summary className={styles.menuBtn} aria-label="Menu"><span className={styles.menuIco} aria-hidden="true"><i/><i/></span></summary>
   <div className={styles.menuPanel}><ul className={styles.menuList}>{NAV.map(([href,label])=><li key={href}><a href={href}>{label}</a></li>)}</ul></div>
  </details>
  <a className={`${styles.play} ${done.button}`} href={PLAY_PATH} aria-label="Play"><span className={done.label} aria-hidden="true">Play</span></a>
 </nav>;
}
