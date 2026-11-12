'use client';
// Public island in a room (Agent C, Nov 11 2026; owner: strangers in the Arcade, Shop, Museum and Konbini in phase 1). The small
// "N players here" chip (others in this room, hidden ones not counted) opens the same roster as the island panel: generated names,
// Hide / Report (ReportSheet), hidden ones with Show again, and "Just me" (the presence choice: leaves the world here and is
// remembered for the island). Never party controls: no code, invite, host tools, Mute, Leave party or End.
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePartyState, type Member } from '@/lib/multiplayer';
import { partyConnection } from '@/lib/multiplayer/roomParty';
import { hidden as hiddenSet, hideMember, reported, setMode, unhideMember } from '@/lib/multiplayer/publicWorld';
import { onHiddenStrangers } from '@/lib/multiplayer/strangers';
import { PUBLIC_HIDE, PUBLIC_REPORT, PUBLIC_ROOM, PUBLIC_ROSTER, publicRoomChip } from '@/lib/multiplayer/publicCopy';
import ReportSheet from './ReportSheet';
import styles from './party.module.css';

export default function RoomPublicChip({ room, hidden = false, align = 'left' }: { room: number; hidden?: boolean; align?: 'left' | 'right' }) {
  const state = usePartyState();
  const hid = useSyncExternalStore(onHiddenStrangers, hiddenSet, hiddenSet);
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<Member | null>(null);
  const pop = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const el = pop.current; if (!el) return;
    el.style.translate = '';
    const r = el.getBoundingClientRect(), g = 16, w = window.innerWidth;
    const dx = r.left < g ? g - r.left : r.right > w - g ? Math.max(g - r.left, w - g - r.right) : 0;
    if (dx) el.style.translate = `${Math.round(dx)}px 0`;
  }, [open, report]);
  const here = state.members.filter((m) => m.id !== state.you && m.room === room);
  const shown = here.filter((m) => !hid.has(m.id)), hiddenHere = here.filter((m) => hid.has(m.id) && !reported(m.id));
  const me = state.members.find((m) => m.id === state.you);
  const close = () => { setOpen(false); setReport(null); };
  // QA Nov 12 2026: no "0 players here". With nobody else in the room (hidden ones aside: Show again lives here) there is no chip;
  // a report already open stays until Done.
  const empty = !shown.length && !hiddenHere.length && !report;
  useEffect(() => { if (empty) setOpen(false); }, [empty]);
  const solo = () => { setMode('solo'); const c = partyConnection(); if (c.kind === 'world') c.leave(); close(); };
  if (hidden || empty) return null;
  return (
    <div className={styles.roomParty} data-room-party data-room-public data-align={align}>
      <button type="button" className={styles.roomChip} data-room-party-chip data-here={shown.length} aria-label={publicRoomChip(shown.length)}
        aria-expanded={open} aria-haspopup="dialog" onClick={() => { setReport(null); setOpen(!open); }}>
        <span className={styles.dot} style={{ background: me?.colourHex ?? '#fff' }} aria-hidden="true" />
        <b>{shown.length}</b><small>{shown.length === 1 ? 'player here' : 'players here'}</small>
      </button>
      {open && (
        <section ref={(el) => { pop.current = el; }} className={styles.roomSheet} role="dialog" aria-label={PUBLIC_ROOM.title} data-room-roster data-room-public-roster
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); if (report) setReport(null); else close(); } }}>
          {report ? <ReportSheet id={report.id} name={report.name} hex={report.colourHex} onDone={() => setReport(null)} /> : <>
            <ul className={styles.members}>
              {shown.map((m) => (
                <li key={m.id} className={styles.member} data-acts="1" data-public-member={m.id}>
                  <span className={styles.dot} style={{ background: m.colourHex }} aria-hidden="true" />
                  <span className={styles.mname}>{m.name}</span>
                  <span className={styles.rowActions} data-row-actions>
                    <button type="button" className={styles.act} data-act="public-hide" aria-label={`${PUBLIC_HIDE.hide}, ${m.name}`} onClick={() => hideMember(m.id)}>{PUBLIC_HIDE.hide}</button>
                    <button type="button" className={styles.act} data-act="public-report" aria-label={`${PUBLIC_REPORT.button}, ${m.name}`} onClick={() => setReport(m)}>{PUBLIC_REPORT.button}</button>
                  </span>
                </li>
              ))}
              {!shown.length && <li className={styles.small}>{PUBLIC_ROOM.empty}</li>}
            </ul>
            {hiddenHere.length > 0 && <>
              <p className={styles.small}><b>{PUBLIC_ROSTER.hiddenTitle}</b></p>
              <ul className={styles.members} data-public-hidden>
                {hiddenHere.map((m) => (
                  <li key={m.id} className={styles.member} data-acts="1" data-away="1">
                    <span className={styles.dot} style={{ background: m.colourHex }} aria-hidden="true" />
                    <span className={styles.mname}>{m.name}</span>
                    <span className={styles.rowActions}><button type="button" className={styles.act} data-act="public-unhide" aria-label={`${PUBLIC_HIDE.unhide}, ${m.name}`} onClick={() => unhideMember(m.id)}>{PUBLIC_HIDE.unhide}</button></span>
                  </li>
                ))}
              </ul>
            </>}
            <button type="button" className={styles.secondary} data-room-public-solo onClick={solo}>{PUBLIC_ROOM.solo}</button>
          </>}
        </section>
      )}
    </div>
  );
}
