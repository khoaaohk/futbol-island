'use client';
// The light party chip for room pages (docs/multiplayer-rooms-design.md 3.3; owner decision 3: LEAVE ONLY in rooms, the host sheet
// stays on the island). Your colour dot + "2 here", the emote wheel (the same six-plus presets and rate limits as the island), and a
// tap opens the read-only roster: what each friend is doing, Hide / Mute, and Leave. No invites, codes, kicks, locks or End here.
import { useEffect, useState } from 'react';
import { displayName, usePartyState, type Member } from '@/lib/multiplayer';
import { partyConnection, setHiddenFriends, setMutedFriends, hiddenFriends, mutedFriends } from '@/lib/multiplayer/roomParty';
import { presenceIcon, presenceText, roomText } from '@/lib/multiplayer/presence';
import { RoomCode, Zone } from '../../multiplayer/protocol';
import EmoteWheel from './EmoteWheel';
import { Glyph } from './PartyChip';
import type { RoomPartyHandle } from './useRoomParty';
import styles from './party.module.css';

const ZONE_LINE: Record<number, string> = { [Zone.Main]: 'On the island', [Zone.Cay]: 'At Coral Cay', [Zone.Summit]: 'At the Summit', [Zone.Sea]: 'In the sea' };
/** As PartyHost's memberActivityLine (not imported: the room bundle stays free of the island's party sheet). */
const activityLine = (m: Pick<Member, 'presence' | 'activity'>): string => { const t = presenceText(m.presence, m.activity); return t ? `${presenceIcon(m.presence, m.activity)} ${t}` : ''; };
const KONBINIS = [RoomCode.Konbini, RoomCode.KonbiniCay] as number[];
/** The line under a friend's name in a room's roster (pure, exported for tests/mp-rooms.cjs). Same room: "Here with you"; another
 *  room: its name ("In the other Konbini" between the two shops); the island: their zone, or what they are busy with. */
export function roomMemberLine(m: Pick<Member, 'presence' | 'activity' | 'room' | 'zone'>, room: number): string {
  if (m.presence === 'away') return activityLine(m);
  if (m.room === room) return 'Here with you';
  if (m.room >= 0) return KONBINIS.includes(m.room) && KONBINIS.includes(room) ? 'In the other Konbini' : roomText(m.room);
  if (m.presence === 'busy' || m.presence === 'indoors') return activityLine(m);
  return ZONE_LINE[m.zone] ?? '';
}

/** `align`: which edge the wheel / roster open from (the chip's side of the header; the Konbini keeps its HUD on the left). */
export default function RoomPartyChip({ party, hidden = false, align = 'left', emoteDock = false }: { party: RoomPartyHandle; hidden?: boolean; align?: 'left' | 'right'; emoteDock?: boolean }) {
  const state = usePartyState();
  const [open, setOpen] = useState<'none' | 'roster' | 'wheel'>('none');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [hid, setHid] = useState<ReadonlySet<number>>(() => hiddenFriends());
  const [mut, setMut] = useState<ReadonlySet<number>>(() => mutedFriends());
  useEffect(() => { if (hidden) { setOpen('none'); setConfirmLeave(false); } }, [hidden]);
  const live = state.status === 'live' || state.status === 'reconnecting';
  if (!live) return null;
  const me = state.members.find((m) => m.id === state.you);
  const others = state.members.filter((m) => m.id !== state.you);
  const here = others.filter((m) => m.room === party.room && !hid.has(m.id)).length;
  const toggle = (set: ReadonlySet<number>, id: number, apply: (s: ReadonlySet<number>) => void, keep: (s: ReadonlySet<number>) => void) => {
    const next = new Set(set); if (next.has(id)) next.delete(id); else next.add(id); apply(next); keep(next);
  };
  const leave = () => { partyConnection().leave(); setOpen('none'); setConfirmLeave(false); };
  const label = `Party: ${here} ${here === 1 ? 'friend' : 'friends'} here${state.status === 'reconnecting' ? ', reconnecting' : ''}`;
  return (
    <div className={styles.roomParty} data-room-party data-align={align} data-hidden={hidden || undefined} aria-hidden={hidden || undefined}>
      <button type="button" className={styles.roomChip} data-room-party-chip data-here={here} data-reconnecting={state.status === 'reconnecting' || undefined}
        aria-label={label} aria-expanded={open === 'roster'} aria-haspopup="dialog" onClick={() => { setConfirmLeave(false); setOpen(open === 'roster' ? 'none' : 'roster'); }}>
        <span className={styles.dot} style={{ background: me?.colourHex ?? '#fff' }} aria-hidden="true" />
        <b>{here}</b><small>here</small>
      </button>
      {!emoteDock && <button type="button" className={styles.roomEmote} data-room-emote aria-label="Emotes" aria-expanded={open === 'wheel'} onClick={() => setOpen(open === 'wheel' ? 'none' : 'wheel')}>
        <Glyph name="smile" size={24} />
      </button>}
      {!emoteDock && open === 'wheel' && <div className={styles.roomWheel}><EmoteWheel onPick={(e) => party.emote(e)} onClose={() => setOpen('none')} /></div>}
      {open === 'roster' && (
        <section className={styles.roomSheet} role="dialog" aria-label="Your party" data-room-roster>
          <ul className={styles.members}>
            {others.map((m) => (
              <li key={m.id} className={styles.member} data-away={m.away ? '1' : undefined} data-room-member={m.room === party.room ? 'here' : 'away'}>
                <span className={styles.dot} style={{ background: m.colourHex }} aria-hidden="true" />
                <span className={styles.mname}>{displayName(m)}<small className={styles.activity} data-party-activity>{roomMemberLine(m, party.room)}</small></span>
                <button type="button" className={styles.mini} aria-pressed={hid.has(m.id)} aria-label={`${hid.has(m.id) ? 'Show' : 'Hide'} ${displayName(m)}`} onClick={() => toggle(hid, m.id, setHiddenFriends, setHid)}><Glyph name="eyeoff" size={20} /></button>
                <button type="button" className={styles.mini} aria-pressed={mut.has(m.id)} aria-label={`${mut.has(m.id) ? 'Unmute' : 'Mute'} emotes from ${displayName(m)}`} onClick={() => toggle(mut, m.id, setMutedFriends, setMut)}><Glyph name="mute" size={20} /></button>
              </li>
            ))}
            {!others.length && <li className={styles.small}>No friends in the party right now.</li>}
          </ul>
          {confirmLeave
            ? <div className={styles.row}><button type="button" className={styles.secondary} onClick={() => setConfirmLeave(false)}>Stay</button><button type="button" className={styles.primary} data-room-leave-confirm onClick={leave}>Yes, leave</button></div>
            : <button type="button" className={styles.secondary} data-room-leave onClick={() => setConfirmLeave(true)}>Leave party</button>}
          <p className={styles.small}>Invite, codes and host buttons are on the island.</p>
        </section>
      )}
    </div>
  );
}

/** The Konbini's Emote button (owner, Oct 22 2026): a full-size round island action button (`.touch-emote`, sized by the parent's
 *  `--action-size`) in the bottom-right action cluster instead of the header chip (RoomPartyChip `emoteDock`). Shown only while the
 *  party is live; the wheel opens upward from the cluster (styles: KonbiniRoom.module.css `.emoteWheel`). */
export function RoomEmoteDock({ party, hidden = false, wheelClass }: { party: RoomPartyHandle; hidden?: boolean; wheelClass?: string }) {
  const state = usePartyState();
  const [open, setOpen] = useState(false);
  useEffect(() => { if (hidden) setOpen(false); }, [hidden]);
  const live = state.status === 'live' || state.status === 'reconnecting';
  if (!live || hidden) return null;
  return (
    <>
      <button type="button" className="touch-emote" data-room-emote data-room-emote-dock aria-label="Emotes" title="Emotes" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
        <Glyph name="smile" size={28} />
      </button>
      {open && <div className={wheelClass} data-room-emote-wheel><EmoteWheel onPick={(e) => party.emote(e)} onClose={() => setOpen(false)} /></div>}
    </>
  );
}
