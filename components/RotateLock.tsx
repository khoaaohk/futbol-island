'use client';
import { useEffect } from 'react';
import styles from './RotateLock.module.css';

/** Portrait only on phones (owner, Oct 24 2026: landscape had too many issues). Installed apps get a real orientation lock where the
 *  browser allows it; everywhere else a phone held sideways shows this card and the game waits behind it. CSS decides when it shows. */
export default function RotateLock() {
  useEffect(() => { try { (screen.orientation as unknown as { lock?: (o: string) => Promise<void> })?.lock?.('portrait')?.catch(() => {}); } catch { /* not allowed outside fullscreen or an installed app */ } }, []);
  return <div className={styles.lock} role="alert" aria-live="polite"><div className={styles.phone} aria-hidden="true" /><p>Turn your phone upright to play</p></div>;
}
