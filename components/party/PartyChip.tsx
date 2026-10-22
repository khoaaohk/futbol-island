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
