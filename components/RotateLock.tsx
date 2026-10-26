'use client';
import { useEffect } from 'react';
import styles from './RotateLock.module.css';

/** Portrait only on phones (owner, Oct 24 2026: landscape had too many issues). Installed apps get a real orientation lock where the
 *  browser allows it; everywhere else a phone held sideways shows this card and the game waits behind it. CSS decides when it shows. */
/** Same query as the CSS rule in RotateLock.module.css that shows the card (tests/qa2-rotate-pause.cjs keeps them equal). */
export const ROTATE_LOCK_QUERY = '(pointer:coarse) and (orientation:landscape) and (max-height:500px)';
export default function RotateLock() {
  useEffect(() => { try { (screen.orientation as unknown as { lock?: (o: string) => Promise<void> })?.lock?.('portrait')?.catch(() => {}); } catch { /* not allowed outside fullscreen or an installed app */ } }, []);
  // QA round 2 (Oct 25 2026): the card covered the screen but arcade games kept running behind it (Strikers conceded, Breakaway Run
  // lost hearts). Turning the phone sideways now sends the same window `blur` the games and the island already treat as "the player
  // looked away": they pause and let go of held thumbs. One media-query listener, no polling.
  useEffect(() => {
    const mq = window.matchMedia?.(ROTATE_LOCK_QUERY); if (!mq) return;
    const change = () => { if (mq.matches) window.dispatchEvent(new Event('blur')); };
    mq.addEventListener?.('change', change); return () => mq.removeEventListener?.('change', change);
  }, []);
  return <div className={styles.lock} role="alert" aria-live="polite"><div className={styles.phone} aria-hidden="true" /><p>Turn your phone upright to play</p></div>;
}
