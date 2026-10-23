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
  // Ride emotes v2 (in-place vehicle tricks, lib/town/rideEmotes.ts)
  'ride-donut': 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  'ride-pop': 'M4 19a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zM8 16l8-9M16 7h-4M16 7v4',
  'ride-salute': 'M6 21v-7l3-3 3 2M12 13l5-7M17 6l2 1M9 11V5',
  'ride-horn': 'M4 10v4h3l6 4V6l-6 4zM16 9c1 1 1 5 0 6M19 7c2 2 2 8 0 10',
  'ride-whip': 'M12 4v10M7 18h10M7 10a5 3 0 1 0 10 0',
  'ride-flamingo': 'M12 3v10l-4 5M12 13h6M8 21h8',
  'ride-kick': 'M5 18h10M15 18l2-10M8 12l-4-2M8 12l3 4',
  'ride-bunny': 'M9 4v6M15 4v6M6 18a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zM13 18a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zM5 13h14',
  'ride-stoppie': 'M15 19a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zM4 10a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zM7 12l6 3 4 1',
  'ride-nohands': 'M6 3l3 6M18 3l-3 6M9 9h6v5H9zM8 20a2 2 0 1 0 4 0M12 20a2 2 0 1 0 4 0',
  'juggle-air': 'M12 3.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM6 20.5v-6m0 0-2.5 2.5M6 14.5l2.5 2.5M18 20.5v-6m0 0-2.5 2.5M18 14.5l2.5 2.5',
  'show-off': 'M9.5 12.2a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8zM7.6 14.6l1.9 1.4 1.9-1.4M9.5 16v3M17.5 2.5l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1zM14 13l2.5-1.5',
  // Moving emotes (lib/town/moveEmotes.ts): a running figure punching up, skipping arcs, cool shades, a hand with speed lines.
  'move-jog': 'M15 4.5a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 0 0-3.2 0zM5 21l3.5-5 3 2.2V22M8.5 16l2.3-6.5 3.2 2.5 3.5-1.2M10.8 9.5 7.5 9l-2 2.2M17.5 10.8l1.6-4.3',
  'move-skip': 'M2 20c2.3-5.5 4.7-5.5 7 0 2.3-5.5 4.7-5.5 7 0 1.8-4.2 3.6-4.2 6 0M9.5 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM8 12l3.5 1.5L15 12',
  'move-strut': 'M3 9h18M5 9l1 3.6a2.8 2.8 0 0 0 5-.8L11.6 9M12.4 9l.6 2.8a2.8 2.8 0 0 0 5 .8L19 9M10.5 11h3M8 17c2.5 1.5 5.5 1.5 8 0',
  'move-five': 'M11 12V5.5a1.5 1.5 0 0 1 3 0V11m0-5a1.5 1.5 0 0 1 3 0v6m-6 0-1.3-1.6a1.5 1.5 0 0 0-2.3 1.9L11 17c1 2.5 2 4 4.5 4 2.8 0 4.5-2 4.5-5.5V9a1.5 1.5 0 0 0-3 0M2 9h4M2 13h3M3 17h3',
  wind: 'M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7a2.5 2.5 0 1 1-2.5 2.5',
  // Change name (Your party > List, own row).
  pencil: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4',
};
export function Glyph({ name, size = 22 }: { name: string; size?: number }) {
  const d = GLYPHS[name];
  if (!d) return <Icon name={name} size={size} />;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={d} /></svg>;
}

/** Icon-only round chip in a fixed corner: stacked faces and a count. Dims while reconnecting. */
export default function PartyChip({ count, reconnecting, open, onClick }: { count: number; reconnecting: boolean; open: boolean; onClick: () => void }) {
  const label = reconnecting ? 'Party, reconnecting' : `Party, ${Math.max(0, count - 1)} ${count === 2 ? 'friend' : 'friends'}`;
  return (
    <button type="button" className={styles.chip} data-party-chip data-reconnecting={reconnecting ? '1' : undefined} aria-label={label} aria-expanded={open} aria-haspopup="dialog" onClick={onClick}>
      <Icon name="people" size={22} />
      <span className={styles.count} aria-hidden="true">{count}</span>
      {reconnecting && <span className={styles.dim} aria-hidden="true" />}
    </button>
  );
}
