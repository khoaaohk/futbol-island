import styles from './site.module.css';
/**
 * The static reading pages (Oct 16 2026: "make the site easier to find through ChatGPT, Claude and search"): /about, /learn,
 * /fish, /cards and /exhibits. Plain prerendered HTML with one small stylesheet: no three.js, no game code, no client
 * components of their own (AGENTS.md, phone heat). The game itself stays at `/` and is linked from every page.
 */
const NAV=[['/','Home'],['/learn','Learn'],['/fish','Fish'],['/cards','Cards'],['/exhibits','Museum'],['/about','About']] as const;
export default function SiteLayout({children}:{children:React.ReactNode}){
 return <div className={styles.page}>
  <style>{'html,body{background:#fff8e7}'}</style>
  <header className={styles.header}><div className={styles.headerInner}>
   <a className={styles.brand} href="/">Futbol Island</a>
   <nav aria-label="Site"><ul className={styles.nav}>{NAV.map(([href,label])=><li key={href}><a href={href}>{label}</a></li>)}</ul></nav>
  </div></header>
  <main className={styles.main}>{children}</main>
  <footer className={styles.footer}><div className={styles.footerInner}>
   <span>Futbol Island · a free football learning game for kids. No ads, no chat.</span>
   <a href="/">Play on the island</a><a href="/about">About</a><a href="/privacy">Privacy</a>
  </div></footer>
 </div>;
}
