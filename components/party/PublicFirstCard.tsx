'use client';
// Public island (Agent C, Nov 11 2026): the one-time "Other kids are here!" card, when another real player first comes within 25 m
// (publicNear.ts). Once per device (fi2-public-hint-v1 'card'). It goes through the island's one-message lane (lib/ui/toastLane.ts):
// it waits while another note owns the lane or a card holds it (Welcome back, the arrival quiet, the dive's find card), and while it
// shows it holds the lane so nothing stacks on it. Never during a lesson, quiz, live match or an open menu (`blocked` from Town +
// publicNear.busy()). New players only (phase 2: publicNear.playerSince 'new'). OK closes; "Just me" switches to Just me (no reload) and closes. Escape = OK.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { toastLane, useToastLaneBusy } from '@/lib/ui/toastLane';
import { isPublic, setMode } from '@/lib/multiplayer/publicWorld';
import { PRESENCE_CHOICES, PUBLIC_FIRST_CARD } from '@/lib/multiplayer/publicCopy';
import { playerSince, publicNear, seenMark, setMark } from './publicNear';
import { shouldShowIslandOnboarding } from '@/lib/town/onboarding';
import styles from './party.module.css';

export const FIRST_CARD_LANE = 'pub-card';
const SOLO_LABEL = PRESENCE_CHOICES.find((c) => c.id === 'solo')!.label;

export default function PublicFirstCard({ blocked, onShown }: { blocked: boolean; onShown?: () => void }) {
  const near = useSyncExternalStore(publicNear.subscribe, publicNear.near, () => false);
  const busy = useSyncExternalStore(publicNear.subscribe, publicNear.busy, () => false);
  const laneBusy = useToastLaneBusy(FIRST_CARD_LANE);
  const [open, setOpen] = useState(false);
  const done = useRef(false);
  const ok = useRef<HTMLButtonElement>(null);
  const shownCb = useRef(onShown); shownCb.current = onShown;
  // Phase 2 (Nov 12 2026): for NEW players only (their tour ran in Just me; others appear after it). A device that already had an island
  // on its first flag-on visit gets the people button's one-time hint instead (PeopleButton.tsx). Classified here first: PartyHost mounts
  // with the island, before a new player's tour can finish.
  useEffect(() => { done.current = seenMark('card') || seenMark('hint') || playerSince(() => !shouldShowIslandOnboarding()) === 'old'; }, []);
  useEffect(() => {
    if (open || done.current || !near || !isPublic()) return;
    toastLane.want(FIRST_CARD_LANE);
    if (blocked || busy || toastLane.held || !toastLane.settle(FIRST_CARD_LANE) || !toastLane.request(FIRST_CARD_LANE)) return; // settle: never over a note still animating out (the shimmer)
    done.current = true; setMark('card'); setOpen(true); shownCb.current?.();
  }, [near, blocked, busy, laneBusy, open]);
  useEffect(() => {
    if (!open) return;
    toastLane.hold(FIRST_CARD_LANE, true);
    ok.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    window.addEventListener('keydown', key, true);
    return () => { window.removeEventListener('keydown', key, true); toastLane.hold(FIRST_CARD_LANE, false); toastLane.release(FIRST_CARD_LANE); };
  }, [open]);
  useEffect(() => () => toastLane.cancel(FIRST_CARD_LANE), []);
  if (!open) return null;
  return (
    <section className={styles.firstCard} role="dialog" aria-modal="false" aria-labelledby="pub-first-title" aria-describedby="pub-first-body" data-public-first-card>
      <h2 id="pub-first-title">{PUBLIC_FIRST_CARD.title}</h2>
      <p id="pub-first-body">{PUBLIC_FIRST_CARD.body}</p>
      <p>{PUBLIC_FIRST_CARD.solo}</p>
      <div className={styles.row}>
        <button ref={ok} type="button" className={styles.primary} data-public-first-ok onClick={() => setOpen(false)}>{PUBLIC_FIRST_CARD.ok}</button>
        <button type="button" className={styles.secondary} data-public-first-solo onClick={() => { setMode('solo'); setOpen(false); }}>{SOLO_LABEL}</button>
      </div>
    </section>
  );
}
