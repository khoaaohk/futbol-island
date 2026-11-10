import {preloadIslandBrush} from '@/lib/islandBrushPreload';
import SiteNav from '@/components/site/SiteNav';
import styles from './site.module.css';
/**
 * The static reading pages (Oct 16 2026: "make the site easier to find through ChatGPT, Claude and search"): `/` (home), /about,
 * /learn/lessons, /fish, /cards and /exhibits. Plain prerendered HTML with one small stylesheet: no three.js, no game code, no client
 * components of their own (AGENTS.md, phone heat). One exception (Nov 2 2026, owner): the home page `/` (the feature tour, at /learn until Nov 3), adds small client islands
 * from components/learn for motion, clips and filters; its words are still all prerendered. The game itself is at /play (Nov 3 2026; it was `/`): each page has one gold "Play" button (near the
 * top of index pages, at the end of detail pages). Shared type and spacing scale: site.module.css and docs/seo/DESIGN.md.
 */
export default function SiteLayout({children}:{children:React.ReactNode}){
 preloadIslandBrush();
 return <div className={styles.page} data-reading-page="">
  <style>{'html,body{background:#fbf7ee;color-scheme:light}'}</style>
  {/* Nov 10 2026 (owner: "fix all these pages to match more with the main site"): the home page's bar, static (SiteNav). This
      replaces the Oct 16 "brand only, no section navigation" header. It stays a direct <header> child: the home page and
      /marketing bring their own bar and hide this one (learn.module.css / marketing.module.css, `>header`). */}
  <header className={styles.header}><div className={styles.headerInner}><SiteNav/></div></header>
  <main className={styles.main}>{children}</main>
  <footer className={styles.footer}><div className={styles.footerInner}>
   <span>Futbol Island · a free football learning game for kids.</span>
   <a href="/">What’s inside</a>
   <a href="/privacy">Privacy</a>
  </div></footer>
 </div>;
}
