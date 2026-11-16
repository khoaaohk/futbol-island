import {LOGO_COLOURS} from '@/lib/site/marketing';
import {PLAY_PATH} from '@/lib/site/seo';
import {toEs} from '@/lib/i18n/esPaths';
import LangSwitch from '@/components/site/LangSwitch';
import done from '@/components/DoneButton.module.css';
import styles from '@/app/(site)/site.module.css';
/** The Spanish pages' top bar: components/site/SiteNav.tsx with Spanish labels, Spanish destinations where they exist, and EN | ES. */
const NAV:readonly (readonly [string,string])[]=[[toEs('/learn/soccer-rules'),'Reglas'],[toEs('/learn/soccer-terms'),'Términos'],[toEs('/learn/soccer-positions'),'Posiciones'],[toEs('/about'),'Acerca de']];
const NAME='Futbol Island';
export default function SiteNavEs(){
 return <nav className={styles.nav} aria-label="Sitio">
  <a className={styles.brand} href={toEs('/')} aria-label={`${NAME}: inicio`}><span aria-hidden="true">{[...NAME].map((ch,i)=>ch===' '?' ':<span key={i} style={{color:LOGO_COLOURS[i%LOGO_COLOURS.length]}}>{ch}</span>)}</span></a>
  <ul className={styles.navLinks}>{NAV.map(([href,label])=><li key={href}><a href={href}>{label}</a></li>)}<li><LangSwitch compact/></li></ul>
  <details className={styles.menu}>
   <summary className={styles.menuBtn} aria-label="Menú"><span className={styles.menuIco} aria-hidden="true"><i/><i/></span></summary>
   <div className={styles.menuPanel}><ul className={styles.menuList}>{NAV.map(([href,label])=><li key={href}><a href={href}>{label}</a></li>)}<li><LangSwitch compact/></li></ul></div>
  </details>
  <a className={`${styles.play} ${done.button}`} href={PLAY_PATH} aria-label="Jugar"><span className={done.label} aria-hidden="true">Jugar</span></a>
 </nav>;
}
