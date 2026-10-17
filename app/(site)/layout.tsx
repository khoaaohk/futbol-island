import {preloadIslandBrush} from '@/lib/islandBrushPreload';
import styles from './site.module.css';
/**
 * The static reading pages (Oct 16 2026: "make the site easier to find through ChatGPT, Claude and search"): /about, /learn,
 * /fish, /cards and /exhibits. Plain prerendered HTML with one small stylesheet: no three.js, no game code, no client
 * components of their own (AGENTS.md, phone heat). The game itself stays at `/`: each page has one gold "Play" button (near the
 * top of index pages, at the end of detail pages). Shared type and spacing scale: site.module.css and docs/seo/DESIGN.md.
 */
export default function SiteLayout({children}:{children:React.ReactNode}){
 preloadIslandBrush();
 return <div className={styles.page}>
  <style>{'html,body{background:#fff8e7;color-scheme:light}'}</style>
  <header className={styles.header}><div className={styles.headerInner}>
   <a className={styles.brand} href="/">Futbol Island</a>
   {/* Oct 16 2026 (user): no section navigation. These are reference pages for search engines and AI assistants; a visitor who
       lands on one sees that page and the way into the game, not a browsable mini-site. The sitemap and llms.txt connect them. */}
  </div></header>
  <main className={styles.main}>{children}</main>
  <footer className={styles.footer}><div className={styles.footerInner}>
   <span>Futbol Island · a free football learning game for kids. No ads, no chat.</span>
   <a href="/privacy">Privacy</a>
  </div></footer>
 </div>;
}
