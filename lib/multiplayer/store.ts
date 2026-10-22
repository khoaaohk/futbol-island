// Party state for React. Emits only on membership / status / emote / ping / error changes (and a member's zone or away
// flag flipping), never because a Poses message arrived.
import { useSyncExternalStore } from 'react';
import { S, nameFor, type Emote, type ErrorCode, type Look, type MemberId, type MemberInfo, type PingKind, type ServerMsg, type Zone } from '../../multiplayer/protocol';
import type { PartyStatus } from './connection';
import { animalGlyph, colourHex } from './names';

export type Member = { id: MemberId; name: string; colourIdx: number; animalIdx: number; colourHex: string; animalGlyph: string; look: Look; isHost: boolean; zone: Zone; away: boolean };
export type PartyState = {
  status: PartyStatus; code: string | null; codeExpiresAt: number; you: MemberId | null; isHost: boolean; locked: boolean;
  members: Member[]; lastEmote: { id: MemberId; emote: Emote; at: number } | null;
  pings: { id: MemberId; kind: PingKind; x: number; z: number; until: number }[]; error: ErrorCode | null;
};

export const PING_SHOW_MS = 8000;

const initial = (): PartyState => ({
  status: 'idle', code: null, codeExpiresAt: 0, you: null, isHost: false, locked: false, members: [], lastEmote: null, pings: [], error: null,
});

function toMember(m: MemberInfo): Member {
  const pose = m[4];
  return { id: m[0], name: nameFor(m[1]), colourIdx: m[1][0], animalIdx: m[1][1], colourHex: colourHex(m[1][0]), animalGlyph: animalGlyph(m[1][1]), look: m[2], isHost: m[3] === 1, zone: (pose ? pose[6] : 0) as Zone, away: pose ? (pose[7] & 2) !== 0 : false };
}

let state: PartyState = initial();
const subs = new Set<() => void>();
const emit = () => { for (const fn of Array.from(subs)) fn(); };
const set = (next: PartyState) => { state = next; emit(); };

export const partyStore = {
  get(): PartyState { return state; },
  subscribe(fn: () => void): () => void { subs.add(fn); return () => { subs.delete(fn); }; },
  /** Extra (not in the design API): connection status, and the code being joined. Emits only on change. */
  setStatus(status: PartyStatus, code?: string | null): void {
    const c = code === undefined ? state.code : code;
    if (status === state.status && c === state.code) return;
    set({ ...state, status, code: c });
  },
  apply(m: ServerMsg, nowMs: number): void {
    switch (m[0]) {
      case S.Welcome: {
        const members = m[7].map(toMember);
        set({ ...state, status: 'live', you: m[2], codeExpiresAt: m[4], locked: m[6] === 1, members, error: null,
          isHost: members.some((x) => x.id === m[2] && x.isHost) });
        return;
      }
      case S.Joined: {
        const mem = toMember(m[1]);
        set({ ...state, members: [...state.members.filter((x) => x.id !== mem.id), mem].sort((a, b) => a.id - b.id) });
        return;
      }
      case S.Left:
        set({ ...state, members: state.members.filter((x) => x.id !== m[1]), pings: state.pings.filter((p) => p.id !== m[1]) });
        return;
      case S.Poses: {
        // Only a zone / away flip is visible state. Nothing changes (and nothing emits) for ordinary movement.
        let list: Member[] = state.members;
        let changed = false;
        for (let i = 2; i + 8 < m.length; i += 9) {
          const id = m[i] as number, zone = m[i + 7] as Zone, away = ((m[i + 8] as number) & 2) !== 0;
          const cur: Member | undefined = list.find((x) => x.id === id);
          if (cur && (cur.zone !== zone || cur.away !== away)) {
            list = list.map((x) => (x.id === id ? { ...x, zone, away } : x));
            changed = true;
          }
        }
        if (changed) set({ ...state, members: list });
        return;
      }
      case S.Emote:
        set({ ...state, lastEmote: { id: m[1], emote: m[2], at: nowMs } });
        return;
      case S.Ping: {
        const live = state.pings.filter((p) => p.until > nowMs && p.id !== m[1]);
        set({ ...state, pings: [...live, { id: m[1], kind: m[2], x: m[3] / 10, z: m[4] / 10, until: nowMs + PING_SHOW_MS }] });
        return;
      }
      case S.Host:
        set({ ...state, isHost: m[1] === state.you, members: state.members.map((x) => ({ ...x, isHost: x.id === m[1] })) });
        return;
      case S.Code:
        set({ ...state, code: m[1], codeExpiresAt: m[2] });
        return;
      case S.Ended:
        set({ ...state, status: 'ended' });
        return;
      case S.Error:
        set({ ...state, error: m[1] });
        return;
      default:
        return; // Beat
    }
  },
  /** Optimistic: the host sees "locked" at once (the relay sends no echo). */
  setLocked(locked: boolean): void { if (state.locked !== locked) set({ ...state, locked }); },
  reset(): void { set(initial()); },
};

export function usePartyState(): PartyState {
  return useSyncExternalStore(partyStore.subscribe, partyStore.get, partyStore.get);
}
