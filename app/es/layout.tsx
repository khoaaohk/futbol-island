import HtmlShell from '@/components/site/HtmlShell';
import SiteNavEs from '@/components/es/SiteNavEs';
import LangSwitch from '@/components/site/LangSwitch';
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
import {toEs} from '@/lib/i18n/esPaths';
import styles from '../(site)/site.module.css';
/**
 * The Spanish reading pages (/es/…, Spanish round 1, Nov 15 2026; docs/i18n/HANDOFF.md): <html lang="es"> and the (site) layout's
 * header and footer in Spanish. Same stylesheet, same static markup. Pages: app/es/[[...path]]/page.tsx.
 */
const FOOTER:readonly (readonly [string,string])[]=[[toEs('/learn/soccer-rules'),'Reglas'],[toEs('/learn/soccer-terms'),'Términos del fútbol'],[toEs('/learn/soccer-positions'),'Posiciones'],
 [toEs('/about/how-we-check-facts'),'Cómo revisamos los datos'],['/learn/lessons','Lecciones (en inglés)']];
export default function EsLayout({children}:{children:React.ReactNode}){
 preloadIslandBrush();
 return <HtmlShell lang="es"><div className={styles.page} data-reading-page="">
  <style>{'html,body{background:#fbf7ee;color-scheme:light}'}</style>
  <header className={styles.header}><div className={styles.headerInner}><SiteNavEs/></div></header>
  <main className={styles.main}>{children}</main>
  <footer className={styles.footer}><div className={styles.footerInner}>
   <span>Futbol Island · un juego gratis para aprender fútbol, para niños.</span>
   <a href={toEs('/')}>Qué hay en la isla</a>
   <a href="/privacy">Privacidad (en inglés)</a>
   <LangSwitch/>
  </div>
  <nav className={styles.footerInner} aria-label="Guías">{FOOTER.map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav>
  </footer>
 </div></HtmlShell>;
}
