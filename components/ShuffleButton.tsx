'use client';
import styles from './ShuffleButton.module.css';

/** Re-rolls the whole starter look (Oct 23 2026): same cream pill as CharacterToggle, big enough for small thumbs. */
export function ShuffleButton({onShuffle,className}:{onShuffle:()=>void;className?:string}){
 return <button type="button" className={`${styles.shuffle}${className?` ${className}`:''}`} onClick={onShuffle} data-shuffle-look aria-label="Shuffle: pick a surprise look">
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h3.5c2 0 3.2 1 4.3 2.6l2.4 4.8c1.1 1.6 2.3 2.6 4.3 2.6H21"/><path d="M3 17h3.5c1.4 0 2.4-.5 3.2-1.3M14.3 8.3c.8-.8 1.8-1.3 3.2-1.3H21"/><path d="m18 4 3 3-3 3M18 14l3 3-3 3"/></svg>
  <span>Shuffle my look</span>
 </button>;
}
