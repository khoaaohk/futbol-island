'use client';
/**
 * The stadium seat race's note (Nov 13 2026; lib/town/stadiumSeatShare.ts): "Someone sat there too!" when a friend who tapped my seat
 * at the same instant kept it and I shuffled along. In the HUD stack's toast spot through the one-message lane (id 'seat'); a note
 * that cannot get the lane within SEAT_NOTE_MS is dropped (it is about right now). Tap closes it. One hide timeout while it shows.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import styles from './CostumeMilestoneToast.module.css';
import HudSlot from './HudStack';
import { toastLane, useToastLaneBusy } from '@/lib/ui/toastLane';

export const SEAT_LANE = 'seat';
export const SEAT_NOTE_MS = 3500;
let note: { text: string; at: number } | null = null;
const subs = new Set<() => void>();
/** Town (stadiumSit's toast port): show this note now. */
export function showSeatNote(text: string, nowMs = Date.now()) { note = { text, at: nowMs }; subs.forEach((f) => f()); }
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const get = () => note;

export default function SeatBumpToast() {
  const n = useSyncExternalStore(subscribe, get, () => null);
  const busy = useToastLaneBusy(SEAT_LANE);
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    if (!n || shown) return;
    if (Date.now() - n.at > SEAT_NOTE_MS) { note = null; toastLane.cancel(SEAT_LANE); return; }
    if (toastLane.held || !toastLane.request(SEAT_LANE)) return;
    note = null; setShown(n.text);
  }, [n, shown, busy]);
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(null), SEAT_NOTE_MS);
    return () => { clearTimeout(t); toastLane.release(SEAT_LANE); };
  }, [shown]);
  useEffect(() => () => { toastLane.cancel(SEAT_LANE); }, []);
  if (!shown) return null;
  return <HudSlot><button type="button" className={`${styles.toast} ${styles.water}`} data-hud-slot="toast" role="status" data-seat-bump="" onClick={() => setShown(null)}>
    <span className={styles.list}>{shown}</span>
  </button></HudSlot>;
}
