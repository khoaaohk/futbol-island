'use client';
import { Icon } from '@/components/Icon';
import styles from './party.module.css';

/** Small icons the shared Icon set does not have (same 24px stroke style). */
const GLYPHS: Record<string, string> = {
  hand: 'M8 12V5.5a1.5 1.5 0 0 1 3 0V11m0-6.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V13m-9-1-1.5-1.8a1.5 1.5 0 0 0-2.3 1.9L8 17c1 2.5 2.5 4 5 4 3 0 5-2 5-5.5V10a1.5 1.5 0 0 1 3 0',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1',
  eyeoff: 'M3 3l18 18M10.6 6.2A9 9 0 0 1 21 12a13 13 0 0 1-3 3.5M6.5 7.5A13 13 0 0 0 3 12c2 4 5.5 6 9 6a9 9 0 0 0 3-.5',
  mute: 'M3 9h4l5-4v14l-5-4H3zM16 9l5 6m0-6-5 6',
  thumb: 'M7 11v9H4v-9zM7 11l4-7c1.7 0 2.5 1.2 2.2 2.8L12.8 10H19a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7',
  smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 10h.01M15.5 10h.01M8 14.5c1 1.6 2.4 2.5 4 2.5s3-.9 4-2.5',
  music: 'M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  thanks: 'M12 21c-4-3-7-5.5-7-9.5a4 4 0 0 1 7-2.6 4 4 0 0 1 7 2.6C19 15.5 16 18 12 21zM12 8v5m-2.5-2.5h5',
  point: 'M12 21V9m0 0V4m0 5-4 4m4-4 4 4M7 21h10',
  pass: 'M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM2.5 7.5h6m-2.6-2.6 2.6 2.6-2.6 2.6M21.5 16.5h-6m2.6-2.6-2.6 2.6 2.6 2.6',
  'ride-cruise': 'M3 12h14m-4-4 4 4-4 4M3 7h6M3 17h6',
  'ride-rev': 'M9 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM3 12h4M4 8h3M16 8l3-2m-3 4h4M12 15V9',
  'ride-eight': 'M12 12c-2-3-4-4.5-6-4.5a4.5 4.5 0 0 0 0 9c2 0 4-1.5 6-4.5s4-4.5 6-4.5a4.5 4.5 0 0 1 0 9c-2 0-4-1.5-6-4.5z',
  'ride-glide': 'M4 18h16M8 18l2-10h4M14 8l2 10M3 12h4M2 15h3',
  'ride-spin': 'M20 12a8 8 0 1 1-3-6.2M20 4v4h-4',
  'ride-hop': 'M12 20V6m0 0-5 5m5-5 5 5M6 21h12',
  'ride-bell': 'M6 17h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v5zM10 20h4',
  'ride-wheelie': 'M4 19a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zM15 14a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zM7 16l5-5 4 3M12 11l-1-5',
  'ride-weave': 'M3 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0',
  wind: 'M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7a2.5 2.5 0 1 1-2.5 2.5',
};
export function Glyph({ name, size = 22 }: { name: string; size?: number }) {
  const d = GLYPHS[name];
  if (!d) return <Icon name={name} size={size} />;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={d} /></svg>;
}

/** Icon-only round chip in a fixed corner: stacked faces and a count. Dims while reconnecting. */
export default function PartyChip({ count, reconnecting, open, onClick }: { count: number; reconnecting: boolean; open: boolean; onClick: () => void }) {
  const label = reconnecting ? 'Party, reconnecting' : `Party, ${count} ${count === 1 ? 'player' : 'players'}`;
  return (
    <button type="button" className={styles.chip} data-party-chip data-reconnecting={reconnecting ? '1' : undefined} aria-label={label} aria-expanded={open} aria-haspopup="dialog" onClick={onClick}>
      <Icon name="people" size={22} />
      <span className={styles.count} aria-hidden="true">{count}</span>
      {reconnecting && <span className={styles.dim} aria-hidden="true" />}
    </button>
  );
}
