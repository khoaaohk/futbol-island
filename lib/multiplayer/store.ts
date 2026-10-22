// Party state for React. Emits only on membership / status / emote / ping / error changes (and a member's zone or away
// flag flipping), never because a Poses message arrived.
import { useSyncExternalStore } from 'react';
import { S, nameFor, presenceOf, activityOf, type Presence, type Emote, type ErrorCode, type Look, type MemberId, type MemberInfo, type PingKind, type ServerMsg, type Zone } from '../../multiplayer/protocol';
import type { PartyStatus } from './connection';
import { colourHex } from './names';

/** name = the colour name ('Red', always present); nick = the typed first name or null. Show displayName(member). */
export type Member = { id: MemberId; name: string; nick: string | null; colourIdx: number; colourHex: string; look: Look; isHost: boolean; zone: Zone; away: boolean;
  /** Presence (design 4.4.1): playing, busy (lesson / quiz / menu), indoors (Museum...) or away; activity = the Activity code (0 when playing). */
  presence: Presence; activity: number };
export type PartyState = {
  status: PartyStatus; code: string | null; codeExpiresAt: number; you: MemberId | null; isHost: boolean; locked: boolean;
  members: Member[]; lastEmote: { id: MemberId; emote: Emote; at: number } | null;
  pings: { id: MemberId; kind: PingKind; x: number; z: number; until: number }[]; error: ErrorCode | null;
};

/** What to call a friend: their typed first name, else the colour name ('Red'). */
export const displayName = (m: Pick<Member, 'name' | 'nick'>): string => m.nick || m.name;

export const PING_SHOW_MS = 8000;

const initial = (): PartyState => ({
  status: 'idle', code: null, codeExpiresAt: 0, you: null, isHost: false, locked: false, members: [], lastEmote: null, pings: [], error: null,
});

function toMember(m: MemberInfo): Member {
  const pose = m[4];
  return { id: m[0], name: nameFor(m[1]), nick: m[5] ?? null, colourIdx: m[1][0], colourHex: colourHex(m[1][0]), look: m[2], isHost: m[3] === 1, zone: (pose ? pose[6] : 0) as Zone, away: pose ? (pose[7] & 2) !== 0 : false,
    presence: pose ? presenceOf(pose[5], pose[6], pose[7]) : 'active', activity: pose ? activityOf(pose[5], pose[4]) : 0 };
}

let state: PartyState = initial();
const subs = new Set<() => void>();
const emit = () => { for (const fn of Array.from(subs)) fn(); };
const set = (next: PartyState) => { state = next; emit(); };

/** Connection health (median RTT ms, drops recovered), read on demand and never emitted: no re-render per heartbeat. */
export type PartyHealth = { rttMs: number | null; reconnects: number };
let healthSource: (() => PartyHealth) | null = null;

export const partyStore = {
  get(): PartyState { return state; },
  /** The bound connection's health right now (index.ts bindConnection registers the source). */
  health(): PartyHealth { try { return healthSource?.() ?? { rttMs: null, reconnects: 0 }; } catch { return { rttMs: null, reconnects: 0 }; } },
  setHealthSource(fn: (() => PartyHealth) | null): void { healthSource = fn; },
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
      case S.Renamed:
        set({ ...state, members: state.members.map((x) => (x.id === m[1] ? { ...x, nick: null } : x)) });
        return;
      case S.Left:
        set({ ...state, members: state.members.filter((x) => x.id !== m[1]), pings: state.pings.filter((p) => p.id !== m[1]) });
        return;
      case S.Poses: {
        // Only a zone / away / presence flip is visible state. Nothing changes (and nothing emits) for ordinary movement.
        let list: Member[] = state.members;
        let changed = false;
        for (let i = 2; i + 8 < m.length; i += 9) {
          const id = m[i] as number, zone = m[i + 7] as Zone, flags = m[i + 8] as number, away = (flags & 2) !== 0;
          const presence = presenceOf(m[i + 6] as number, zone, flags), activity = activityOf(m[i + 6] as number, m[i + 5] as number);
          const cur: Member | undefined = list.find((x) => x.id === id);
          if (cur && (cur.zone !== zone || cur.away !== away || cur.presence !== presence || cur.activity !== activity)) {
            list = list.map((x) => (x.id === id ? { ...x, zone, away, presence, activity } : x));
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
