import HtmlShell from '@/components/site/HtmlShell';
import SiteNavEs from '@/components/es/SiteNavEs';
import LangSwitch from '@/components/site/LangSwitch';
import FooterHubs from '@/components/site/FooterHubs';
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
import {toEs} from '@/lib/i18n/esPaths';
import styles from '../(site)/site.module.css';
/**
 * The Spanish reading pages (/es/…, Spanish round 1, Nov 15 2026; docs/i18n/HANDOFF.md): <html lang="es"> and the (site) layout's
 * header and footer in Spanish. Same stylesheet, same static markup. Pages: app/es/[[...path]]/page.tsx.
 */
/* Nov 20 2026: the guide links are the English footer's four Library groups in Spanish (components/site/FooterHubs.tsx); the
   fact-check page that used to sit in that row moved to the small row. */
export default function EsLayout({children}:{children:React.ReactNode}){
 preloadIslandBrush();
 return <HtmlShell lang="es"><div className={styles.page} data-reading-page="">
  <style>{'html,body{background:#fbf7ee;color-scheme:light}'}</style>
  <header className={styles.header}><div className={styles.headerInner}><SiteNavEs/></div></header>
  <main className={styles.main}>{children}</main>
  <footer className={styles.footer}>
  <FooterHubs es/>
  <div className={styles.footerInner}>
   <span>Futbol Island · un juego gratis para aprender fútbol, para niños.</span>
   <a href={toEs('/')}>Qué hay en la isla</a>
   <a href={toEs('/about')}>Acerca de</a>{/* Nov 20 2026: About and Safety left the header (SiteNavEs.tsx) */}
   <a href={toEs('/safe-football-game-for-kids')}>Seguridad</a>
   <a href={toEs('/about/how-we-check-facts')}>Cómo revisamos los datos</a>
   <a href="/privacy">Privacidad (en inglés)</a>
   <LangSwitch/>
  </div>
  </footer>
 </div></HtmlShell>;
}
