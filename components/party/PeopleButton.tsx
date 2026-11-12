'use client';
// Public island (Agent C, Nov 11 2026; phase 2 Nov 12 2026): the HUD people button while the build flag is on (components/IslandSettings.tsx
// renders today's button, unchanged, when the flag is off). It opens PartyHost (openPartyMenu): the "Who's here?" panel, or the party sheet
// in a party. In a party: today's member-count badge. In a public world: a live count under the button ("8 on now", "lots on now" above
// 24, nothing at 0), read from presence.count, which only changes when the socket says so (no timer, no poll).
// Until the island tour is done (presence.tutorialDone) it is exactly today's button: a new player sees no change.
// Existing players (publicNear.playerSince 'old': the tour was already done on the first flag-on visit) get ONE hint beside the button
// the first time they are really in a world: others can be here now, and how to play alone (tap here, Just me). Through the one-message
// lane; OK or a tap on the button closes it (else it closes itself after HINT_MS); never again on this device (fi2-public-hint-v1 'hint').
// New players get the first-time card instead (PublicFirstCard.tsx), never both. The hint is portalled to <body> and placed once from
// the button's rect when it opens, so the HUD row's own markup (and its :first-child / :last-child ordering) stays exactly as before.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/Icon';
import { openPartyMenu } from '@/lib/multiplayer/invite';
import { usePartyState, usePresence } from '@/lib/multiplayer';
import { shouldShowIslandOnboarding } from '@/lib/town/onboarding';
import { toastLane, useToastLaneBusy } from '@/lib/ui/toastLane';
import { PUBLIC_EXISTING_HINT, peopleBadge, peopleButtonLabel } from '@/lib/multiplayer/publicCopy';
import { playerSince, seenMark, setMark } from './publicNear';
import styles from './party.module.css';

export const HINT_LANE = 'pub-hint';
const HINT_MS = 12000;
const BADGE: CSSProperties = { position: 'absolute', right: -4, bottom: -4, minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: '#1f8a4c', color: '#fff', font: '700 12px/20px system-ui,sans-serif', textAlign: 'center' };

export default function PeopleButton({ className }: { className: string }) {
  const party = usePartyState(), ps = usePresence();
  const partyLive = party.kind !== 'world' && (party.status === 'live' || party.status === 'reconnecting');
  const pub = ps.tutorialDone && !partyLive && party.kind === 'world' && ps.mode === 'public' && ps.connected;
  const others = pub ? ps.count ?? 0 : 0;
  // Who this device was when public play reached it (read after mount: localStorage). Decided once, kept.
  const [existing, setExisting] = useState(false);
  useEffect(() => { setExisting(playerSince(() => !shouldShowIslandOnboarding()) === 'old'); }, []);
  const [hint, setHint] = useState(false);
  const laneBusy = useToastLaneBusy(HINT_LANE);
  const want = existing && pub && !hint && !seenMark('hint') && !seenMark('card');
  useEffect(() => {
    if (!want) return;
    toastLane.want(HINT_LANE);
    if (!toastLane.settle(HINT_LANE) || !toastLane.request(HINT_LANE)) return; // settle: never over a note still animating out
    setMark('hint'); setHint(true);
  }, [want, laneBusy]);
  const close = () => { setHint(false); toastLane.release(HINT_LANE); };
  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(close, HINT_MS);
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', key);
    return () => { clearTimeout(t); window.removeEventListener('keydown', key); toastLane.release(HINT_LANE); };
  }, [hint]);
  useEffect(() => () => toastLane.cancel(HINT_LANE), []);
  const label = partyLive ? `Your party, ${party.members.length} playing` : ps.tutorialDone ? peopleButtonLabel(pub ? others : null) : 'Play with friends';
  const count = !partyLive && pub ? peopleBadge(others) : null;
  const btn = useRef<HTMLButtonElement>(null);
  const [at, setAt] = useState<CSSProperties | null>(null);
  useEffect(() => {
    if (!hint) { setAt(null); return; }
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const w = Math.min(272, window.innerWidth - 32);
    setAt({ top: r.bottom + (count ? 22 : 10), left: Math.max(16, Math.min(r.left + r.width / 2 - 28, window.innerWidth - 16 - w)), width: w });
  }, [hint]); // eslint-disable-line react-hooks/exhaustive-deps -- placed once when it opens
  return (
    <button ref={btn} type="button" className={`${className}${hint ? ' ' + styles.peoplePulse : ''}`} data-party-open data-party-live={partyLive ? 'true' : undefined} data-public-count={pub ? others : undefined}
      aria-label={label} aria-describedby={hint ? 'people-hint' : undefined} onClick={() => { if (hint) close(); openPartyMenu(); }}
      style={partyLive || count ? { position: 'relative', overflow: 'visible' } : undefined}>
      <Icon name="people" size={24} />
      {partyLive && <span data-party-badge aria-hidden="true" style={BADGE}>{party.members.length}</span>}
      {count && <span className={styles.peopleCount} data-public-badge aria-hidden="true">{count}</span>}
      {hint && at && createPortal(
        <div id="people-hint" className={styles.peopleHint} style={at} role="status" data-public-hint>
          <p>{PUBLIC_EXISTING_HINT.line} {PUBLIC_EXISTING_HINT.solo}</p>
          <button type="button" className={styles.primary} data-public-hint-ok onClick={(e) => { e.stopPropagation(); close(); }}>{PUBLIC_EXISTING_HINT.ok}</button>
        </div>, document.body)}
    </button>
  );
}
