'use client';
/**
 * Public island phase 3 (Nov 12 2026; lib/multiplayer/islandLife.ts): the one note for "the island is alive", in the HUD stack's toast
 * spot and through the one-message lane (lib/ui/toastLane.ts, id 'life'): it waits for Welcome back, the arrival quiet, cards and other
 * notes, and settle() keeps it from opening over a note that is still animating out.
 *  - Match o'clock: once per Match o'clock (per hour) per visit, while in a public world and not in a match, lesson or menu (`blocked`).
 *    "Kids are meeting at <pitch>. Follow the gold light and join the match." plus one football tip and, when known, the island goal.
 *  - The island goal reached: once per day per visit.
 * Tap closes it. One hide timeout while it shows; no loop, nothing saved.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import styles from '../CostumeMilestoneToast.module.css';
import HudSlot from '../HudStack';
import { toastLane, useToastLaneBusy } from '@/lib/ui/toastLane';
import { islandLife, ISLAND_GOAL_TARGET } from '@/lib/multiplayer/islandLife';
import { ISLAND_GOAL_COPY, MATCH_OCLOCK, MATCH_OCLOCK_TIPS } from '@/lib/multiplayer/publicCopy';
import { liveVenueById } from '@/lib/town/venues';
import { publicNear } from './publicNear';

export const LIFE_LANE = 'life';
export const LIFE_TOAST_MS = 7000;
type Note = { kind: 'clock' | 'goal'; key: string; title: string; body: string; extra: string | null };
let shownKeys = new Set<string>(); // this visit only
/** Tests only. */
export function resetLifeToast(): void { shownKeys = new Set(); }

/** What the note would say now (null: nothing due). Pure, so tests can pin it. */
export function lifeNote(s: ReturnType<typeof islandLife.get>, dayMs: number): Note | null {
  if (!s.inWorld) return null;
  const day = Math.floor(dayMs / 86_400_000);
  if (s.goal !== null && s.goal >= ISLAND_GOAL_TARGET && !shownKeys.has('goal:' + day))
    return { kind: 'goal', key: 'goal:' + day, title: ISLAND_GOAL_COPY.doneTitle, body: ISLAND_GOAL_COPY.doneBody(ISLAND_GOAL_TARGET), extra: null };
  if (s.clock.on && !shownKeys.has('clock:' + s.clock.hour)) {
    const tip = MATCH_OCLOCK_TIPS[((s.clock.hour % MATCH_OCLOCK_TIPS.length) + MATCH_OCLOCK_TIPS.length) % MATCH_OCLOCK_TIPS.length];
    return { kind: 'clock', key: 'clock:' + s.clock.hour, title: MATCH_OCLOCK.title, body: MATCH_OCLOCK.body(liveVenueById(s.clock.field).name),
      extra: s.goal !== null && s.goal < ISLAND_GOAL_TARGET ? ISLAND_GOAL_COPY.line(s.goal, ISLAND_GOAL_TARGET) : tip };
  }
  return null;
}

export default function IslandLifeToast({ blocked: held }: { blocked: boolean }) {
  // a lesson, quiz or live match (Town's flags through publicNear): wait until it is over
  const playing = useSyncExternalStore(publicNear.subscribe, publicNear.busy, () => false), blocked = held || playing;
  const life = useSyncExternalStore(islandLife.subscribe, islandLife.get, islandLife.get);
  const busy = useToastLaneBusy(LIFE_LANE);
  const [shown, setShown] = useState<Note | null>(null);
  const due = useRef<Note | null>(null);
  due.current = shown ? null : lifeNote(life, Date.now());
  const dueKey = due.current?.key ?? '';
  useEffect(() => {
    const n = due.current;
    if (!n) { toastLane.cancel(LIFE_LANE); return; }
    toastLane.want(LIFE_LANE);
    if (blocked || toastLane.held || !toastLane.settle(LIFE_LANE) || !toastLane.request(LIFE_LANE)) return;
    shownKeys.add(n.key); setShown(n);
  }, [dueKey, blocked, busy]);
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(null), LIFE_TOAST_MS);
    return () => { clearTimeout(t); toastLane.release(LIFE_LANE); };
  }, [shown]);
  // Left the world while it showed: close at once (frees the lane).
  useEffect(() => { if (shown && !life.inWorld) setShown(null); }, [shown, life.inWorld]);
  useEffect(() => () => { toastLane.cancel(LIFE_LANE); }, []);
  if (!shown) return null;
  return <HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" role="status" data-island-life={shown.kind} onClick={() => setShown(null)}>
    <b>{shown.title}</b>
    <span className={styles.list}>{shown.body}</span>
    {shown.extra && <span className={styles.list}>{shown.extra}</span>}
  </button></HudSlot>;
}
