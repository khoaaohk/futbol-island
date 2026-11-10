'use client';
import styles from './error.module.css';

/**
 * The last-resort screen when the ROOT layout itself fails (Nov 10 2026). Next.js replaces the whole document with this file,
 * so it brings its own <html> and <body> and no global CSS: only app/error.module.css (the same island card as app/error.tsx).
 * Static: no WebGL. "Try again" reloads the page (a root failure is usually a failed download); "Home" goes to /. The kid's save
 * lives in local storage / the save server and is untouched.
 */
export default function GlobalError({error}:{error:Error&{digest?:string};reset:()=>void}){
 void error;
 return <html lang="en"><body style={{margin:0}}>
  <main className={styles.page}><div className={styles.card} role="alert" data-game-error="">
   <h1 className={styles.title}>Oops! The island tripped over the ball.</h1>
   <p className={styles.text}>Tap Try again to jump back in. Your island is saved.</p>
   <div className={styles.links}>
    <button type="button" className={styles.button} onClick={()=>window.location.reload()}>Try again</button>
    <a className={`${styles.link} ${styles.linkQuiet}`} href="/">Home</a>
   </div>
  </div></main>
 </body></html>;
}
