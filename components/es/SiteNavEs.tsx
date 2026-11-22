import {LOGO_COLOURS} from '@/lib/site/marketing';
import {PLAY_PATH} from '@/lib/site/seo';
import {ES_LIBRARY,toEs} from '@/lib/i18n/esPaths';
import LangSwitch from '@/components/site/LangSwitch';
import done from '@/components/DoneButton.module.css';
import styles from '@/app/(site)/site.module.css';
import {NAV_SLIDE,navChip,navLinks} from '@/components/site/SiteNav';
/** The Spanish pages' top bar: components/site/SiteNav.tsx with Spanish labels, Spanish destinations where they exist, and EN | ES. */
/* Nov 20 2026 evening (owner): the same three links as the English bar. Aprender is the Spanish lessons (the old bar's first link),
   Juegos is /es/games (round E, Nov 22 2026), Biblioteca the Spanish Library. Rules, terms, positions, drills, plans,
   tools and About are all on the Biblioteca and in the footer. Selected copies as in components/site/SiteNav.tsx. */
const NAV:readonly (readonly [string,string,('games'|'library'|'island')?])[]=[['/es','Isla','island'],[toEs('/games'),'Juegos','games'],[toEs(ES_LIBRARY),'Biblioteca','library']];
const NAME='Futbol Island';
const links=()=>navLinks(NAV);
export default function SiteNavEs(){
 return <nav className={`${styles.nav} ${styles.navEs}`} aria-label="Sitio">
  <a className={styles.brand} href={toEs('/')} aria-label={`${NAME}: inicio`}><span aria-hidden="true">{[...NAME].map((ch,i)=>ch===' '?' ':<span key={i} style={{color:LOGO_COLOURS[i%LOGO_COLOURS.length]}}>{ch}</span>)}</span></a>
  <ul className={styles.navLinks} data-nav-links="">{links()}<li><LangSwitch compact/></li>{navChip}</ul>
  <script dangerouslySetInnerHTML={{__html:NAV_SLIDE}}/>
  <details className={styles.menu}>
   <summary className={styles.menuBtn} aria-label="Menú"><span className={styles.menuIco} aria-hidden="true"><i/><i/></span></summary>
   <div className={styles.menuPanel}><ul className={styles.menuList}>{links()}<li><LangSwitch compact/></li></ul></div>
  </details>
  <a className={`${styles.play} ${done.button}`} href={PLAY_PATH} aria-label="Jugar"><span className={done.label} aria-hidden="true">Jugar</span></a>
 </nav>;
}
