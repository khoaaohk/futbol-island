import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './error.module.css';

/**
 * The branded 404 (Nov 10 2026, security/QA audit: an unknown address showed Next's plain black page). The island error card
 * (app/error.module.css), static: no WebGL, no client script, no tracking of its own. Three ways back: Home, Play, Lessons.
 * IslandBrush for the title only; the buttons are the UI sans at weight 800 (AGENTS.md, Nov 4 2026).
 */
export const metadata:Metadata={title:'Page not found | Futbol Island',robots:{index:false,follow:true}};

export default function NotFound(){
 return <main className={styles.page}><div className={styles.card}>
  <h1 className={styles.title}>This pitch is empty</h1>
  <p className={styles.text}>We could not find that page. It may have moved, or the address has a typo.</p>
  <nav className={styles.links} aria-label="Ways back">
   <Link className={styles.link} href="/play">Play</Link>
   <Link className={`${styles.link} ${styles.linkQuiet}`} href="/learn/lessons">Lessons</Link>
   <Link className={`${styles.link} ${styles.linkQuiet}`} href="/">Home</Link>
  </nav>
 </div></main>;
}
