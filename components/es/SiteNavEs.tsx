import {LOGO_COLOURS} from '@/lib/site/marketing';
import {PLAY_PATH} from '@/lib/site/seo';
import {ES_LIBRARY,toEs} from '@/lib/i18n/esPaths';
import LangSwitch from '@/components/site/LangSwitch';
import done from '@/components/DoneButton.module.css';
import styles from '@/app/(site)/site.module.css';
/** The Spanish pages' top bar: components/site/SiteNav.tsx with Spanish labels, Spanish destinations where they exist, and EN | ES. */
/** Nov 16 2026: 8 links (+ EN | ES) do not fit the 641-1099 px bar, so the Spanish bar keeps the phone menu up to 1099 px (.navEs). */
const NAV:readonly (readonly [string,string])[]=[[toEs('/learn/lessons'),'Lecciones'],[toEs('/learn/soccer-rules'),'Reglas'],[toEs('/learn/soccer-terms'),'Términos'],[toEs('/learn/soccer-positions'),'Posiciones'],[toEs('/learn/soccer-drills'),'Ejercicios'],[toEs('/learn/soccer-practice-plans'),'Planes'],[toEs('/tools'),'Herramientas'],[toEs('/about'),'Acerca de'],[toEs(ES_LIBRARY),'Biblioteca']]/* Nov 20 2026 (owner): the Library, after About */;
const NAME='Futbol Island';
/* The Library link is rendered twice, like the English bar's (components/site/SiteNav.tsx): the copy shown on the Library carries
   aria-current="page", the copy shown everywhere else does not; CSS shows one (site.module.css, [data-library-hero]). */
const LIB=toEs(ES_LIBRARY);
const links=()=>NAV.map(([href,label])=><li key={href}><a href={href} data-nav-page={href===LIB?'':undefined}>{label}</a>{href===LIB&&<a href={href} data-nav-home="" aria-current="page">{label}</a>}</li>);
export default function SiteNavEs(){
 return <nav className={`${styles.nav} ${styles.navEs}`} aria-label="Sitio">
  <a className={styles.brand} href={toEs('/')} aria-label={`${NAME}: inicio`}><span aria-hidden="true">{[...NAME].map((ch,i)=>ch===' '?' ':<span key={i} style={{color:LOGO_COLOURS[i%LOGO_COLOURS.length]}}>{ch}</span>)}</span></a>
  <ul className={styles.navLinks}>{links()}<li><LangSwitch compact/></li></ul>
  <details className={styles.menu}>
   <summary className={styles.menuBtn} aria-label="Menú"><span className={styles.menuIco} aria-hidden="true"><i/><i/></span></summary>
   <div className={styles.menuPanel}><ul className={styles.menuList}>{links()}<li><LangSwitch compact/></li></ul></div>
  </details>
  <a className={`${styles.play} ${done.button}`} href={PLAY_PATH} aria-label="Jugar"><span className={done.label} aria-hidden="true">Jugar</span></a>
 </nav>;
}
