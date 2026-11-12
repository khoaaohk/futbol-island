'use client';
// Public island, tap on a player (phase 1, Nov 11 2026): the small cream card beside another player (usePlayerTap.ts opens it).
// A stranger: colour dot + generated name, Wave / Hide / Report (Report opens the existing ReportSheet; reporting hides at once).
// A party friend (flag on, private party): colour dot + their party label, Wave / Hide only (their roster controls stay in the party
// menu). No typing anywhere. Desktop: anchored just above their head, kept on screen. Phones (<= 600 px wide, or a coarse pointer):
// docked above the thumb controls, never under a thumb. Closes on a tap elsewhere, Escape, Done, when they are > 35 m away, leave,
// are hidden, or the mode changes; and when `blocked` (a lesson, quiz, match or menu) turns on. Rechecks once a second while open only.
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePartyState, displayName } from '@/lib/multiplayer/store';
import { hideMember } from '@/lib/multiplayer/publicWorld';
import { isHiddenStranger, onHiddenStrangers } from '@/lib/multiplayer/strangers';
import { hiddenFriends, onFriendFilters, setHiddenFriends } from '@/lib/multiplayer/roomParty';
import { strangerLabel } from '@/lib/graphics/remotePublic';
import { CLOSE_M } from '@/lib/graphics/remotePick';
import { PUBLIC_HIDE, PUBLIC_PLAYER_CARD, PUBLIC_REPORT, playerCardLabel } from '@/lib/multiplayer/publicCopy';
import { DoneButton } from '@/components/DoneButton';
import ReportSheet from './ReportSheet';
import { playerCard } from './usePlayerTap';
import styles from './party.module.css';
import card from './playerCard.module.css';

const GAP = 16, WAVE_MS = 2000;

export default function PlayerCard({ blocked = false, onHideFriend }: { blocked?: boolean; onHideFriend?: (hidden: ReadonlySet<number>) => void }) {
  const at = useSyncExternalStore(playerCard.subscribe, playerCard.get, () => null);
  const party = usePartyState();
  const [report, setReport] = useState(false);
  const [waved, setWaved] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [docked, setDocked] = useState(true);
  const box = useRef<HTMLElement>(null), first = useRef<HTMLButtonElement>(null);
  const reportRef = useRef(false); reportRef.current = report;
  const id = at?.id ?? -1;
  const live = at ? party.members.find((x) => x.id === id) : undefined;
  // A reported player leaves the roster at once: the thanks line keeps their name and dot from when the card opened.
  const snap = useRef<typeof live>(undefined); if (live) snap.current = live; else if (!at) snap.current = undefined;
  const m = live ?? (report && snap.current?.id === id ? snap.current : undefined);

  // A new card: fresh state, the anchor from the tap, focus on Wave (no scroll).
  useEffect(() => { setReport(false); setWaved(false); setAnchor(at?.anchor ?? null); if (at) first.current?.focus({ preventScroll: true }); }, [at]);
  // Closes when they leave, the mode changes, or a lesson / quiz / match / menu opens.
  useEffect(() => { if (at && ((!m && !reportRef.current) || party.kind !== at.kind || party.status !== 'live' || blocked)) playerCard.close(); }, [at, m, party.kind, party.status, blocked]);
  // Hidden (here or from the roster): closes; a report's thanks line stays until OK.
  useEffect(() => {
    if (!at) return;
    const check = () => { if (reportRef.current) return; if (at.friend ? hiddenFriends().has(at.id) : isHiddenStranger(at.id)) playerCard.close(); };
    check();
    const a = onHiddenStrangers(check), b = onFriendFilters(check);
    return () => { a(); b(); };
  }, [at]);
  // Once a second while open (never otherwise): further than 35 m, or not drawn for 2 s (gone indoors, hidden, out of sight) closes it.
  useEffect(() => {
    if (!at) return;
    let missed = 0;
    const t = setInterval(() => {
      const l = playerCard.locate(at.id);
      if (!l) { if (++missed >= 2 && !reportRef.current) playerCard.close(); return; }
      missed = 0;
      if (l.d > CLOSE_M && !reportRef.current) { playerCard.close(); return; }
      setAnchor(l.anchor);
    }, 1000);
    return () => clearInterval(t);
  }, [at]);
  // Escape, and a tap anywhere outside the card.
  useEffect(() => {
    if (!at) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); playerCard.close(); } };
    const down = (e: PointerEvent) => { if (box.current && e.target instanceof Node && box.current.contains(e.target)) return; playerCard.close(); };
    window.addEventListener('keydown', key, true); document.addEventListener('pointerdown', down, true);
    return () => { window.removeEventListener('keydown', key, true); document.removeEventListener('pointerdown', down, true); };
  }, [at]);
  useEffect(() => { if (!waved) return; const t = setTimeout(() => setWaved(false), WAVE_MS); return () => clearTimeout(t); }, [waved]);
  // Where it sits: docked on phones (CSS), otherwise above the head, clamped inside the screen.
  useLayoutEffect(() => {
    const el = box.current; if (!el || !at) return;
    const phone = window.innerWidth <= 600 || window.matchMedia('(pointer: coarse)').matches;
    if (phone || !anchor) { setDocked(true); setPos(null); return; }
    const w = el.offsetWidth, h = el.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    let top = anchor.y - h - 12; if (top < GAP) top = Math.min(vh - h - GAP, anchor.y + 12);
    setDocked(false); setPos({ left: Math.max(GAP, Math.min(vw - w - GAP, anchor.x - w / 2)), top: Math.max(GAP, top) });
  }, [at, anchor, report]);

  if (!at || !m) return null;
  const friend = at.friend;
  const name = friend ? displayName(m) : strangerLabel(m.nameIdx, m.colourHex);
  const label = playerCardLabel(name, friend);
  const hide = () => {
    if (friend) { const next = new Set(hiddenFriends()); next.add(m.id); if (onHideFriend) onHideFriend(next); /* Town: counts the party hide, then setHiddenFriends */ else setHiddenFriends(next); }
    else hideMember(m.id);
    playerCard.close();
  };
  const wave = () => { if (waved) return; if (playerCard.wave()) setWaved(true); };
  const done = () => playerCard.close();

  return (
    <section ref={box} className={card.card} role="dialog" aria-modal="false" aria-label={label} data-player-card={m.id} data-player-card-kind={friend ? 'friend' : 'stranger'}
      data-docked={docked ? '1' : undefined} data-room={at.room ? '1' : undefined} style={pos ? { left: pos.left, top: pos.top } : undefined}>
      <header className={card.head}>
        <span className={styles.dot} style={{ background: m.colourHex }} aria-hidden="true" />
        <span className={card.name} data-player-card-name aria-hidden="true">{name}</span>
        <DoneButton onDone={done} data-player-card-done />
      </header>
      {report ? (
        <ReportSheet id={m.id} name={name} hex={m.colourHex} onDone={() => { if (isHiddenStranger(m.id)) playerCard.close(); else setReport(false); }} />
      ) : (
        <div className={card.actions} role="group" aria-label={label}>
          <button ref={first} type="button" className={styles.act} data-act="card-wave" aria-label={`${PUBLIC_PLAYER_CARD.wave}, ${name}`} aria-disabled={waved || undefined} onClick={wave}>
            {waved ? PUBLIC_PLAYER_CARD.waved : PUBLIC_PLAYER_CARD.wave}
          </button>
          <button type="button" className={styles.act} data-act="card-hide" aria-label={`${PUBLIC_HIDE.hide}, ${name}`} onClick={hide}>{PUBLIC_HIDE.hide}</button>
          {!friend && <button type="button" className={styles.act} data-act="card-report" aria-label={`${PUBLIC_REPORT.button}, ${name}`} onClick={() => setReport(true)}>{PUBLIC_REPORT.button}</button>}
        </div>
      )}
      <span className={styles.srOnly} role="status" aria-live="polite">{waved ? PUBLIC_PLAYER_CARD.waved : ''}</span>
    </section>
  );
}
