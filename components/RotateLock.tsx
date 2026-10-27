'use client';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { PORTRAIT_ONLY_QUERY, getOrientationMode, lockScreenOrientation, subscribeOrientationMode, wrongOrientationQuery } from '@/lib/orientationMode';
import styles from './RotateLock.module.css';

/** Portrait only on phones (owner, Oct 24 2026: landscape had too many issues). Installed apps get a real orientation lock where the
 *  browser allows it; everywhere else a phone held sideways shows this card and the game waits behind it. CSS decides when it shows.
 *  Exception (owner, Oct 26 2026, docs/STRIKERS_LANDSCAPE_OCT26.md): Island Strikers asks for landscape (lib/orientationMode.ts);
 *  while it is open the card flips: an UPRIGHT phone sees "Turn your phone sideways to play". */
/** Same query as the CSS rule in RotateLock.module.css that shows the portrait-only card (tests/qa2-rotate-pause.cjs keeps them equal). */
export const ROTATE_LOCK_QUERY = PORTRAIT_ONLY_QUERY;
const serverMode = () => 'portrait' as const;
export default function RotateLock() {
  const mode = useSyncExternalStore(subscribeOrientationMode, getOrientationMode, serverMode);
  const switched = useRef(false);
  useEffect(() => { lockScreenOrientation(getOrientationMode()); }, []);
  // QA round 2 (Oct 25 2026): the card covered the screen but arcade games kept running behind it (Strikers conceded, Breakaway Run
  // lost hearts). Turning the phone the wrong way now sends the same window `blur` the games and the island already treat as "the
  // player looked away": they pause and let go of held thumbs. One media-query listener for the current mode, no polling.
  useEffect(() => {
    const mq = window.matchMedia?.(wrongOrientationQuery(mode)); if (!mq) return;
    const change = () => { if (mq.matches) window.dispatchEvent(new Event('blur')); };
    // A mode switch while already held the wrong way (leaving Strikers sideways) shows the card at once: pause behind it too.
    if (switched.current) change(); switched.current = true;
    mq.addEventListener?.('change', change); return () => mq.removeEventListener?.('change', change);
  }, [mode]);
  return <div className={styles.lock} data-mode={mode} role="alert" aria-live="polite"><div className={styles.phone} aria-hidden="true" />{mode === 'landscape' ? <><p className={styles.turn}>Turn your phone sideways to play</p><p className={styles.wide}>Make this window wider to play</p></> : <p>Turn your phone upright to play</p>}</div>;
}
