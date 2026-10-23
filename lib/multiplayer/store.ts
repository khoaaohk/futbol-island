// Party state for React. Emits only on membership / status / emote / ping / error changes (and a member's zone or away
// flag flipping), never because a Poses message arrived.
import { useSyncExternalStore } from 'react';
import { S, nameFor, presenceOf, activityOf, roomOf, type Presence, type Emote, type ErrorCode, type Look, type MemberId, type MemberInfo, type PingKind, type ServerMsg, type Zone } from '../../multiplayer/protocol';
import type { PartyStatus, TabState } from './connection';
import { colourHex } from './names';
import { roomActivity } from './presence';

/** name = the colour name ('Red', always present); nick = the typed first name or null. Show displayName(member). */
export type Member = { id: MemberId; name: string; nick: string | null; colourIdx: number; colourHex: string; look: Look; isHost: boolean; zone: Zone; away: boolean;
  /** Presence (design 4.4.1): playing, busy (lesson / quiz / menu), indoors (Museum...) or away; activity = the Activity code (0 when playing). */
  presence: Presence; activity: number;
  /** The room code they are in (docs/multiplayer-rooms-design.md 2.2: a room pose), -1 on the island or at a legacy door pose. */
  room: number };
export type PartyState = {
  status: PartyStatus; code: string | null; codeExpiresAt: number; you: MemberId | null; isHost: boolean; locked: boolean;
  members: Member[]; lastEmote: { id: MemberId; emote: Emote; at: number } | null;
  pings: { id: MemberId; kind: PingKind; x: number; z: number; until: number }[]; error: ErrorCode | null;
  /** Party rejoin (Oct 22 2026): which tab owns the party ('elsewhere' / 'moved' = another tab of this browser), and whether a
   *  resume found its slot lapsed (the menu then offers Join with the code filled in). From the connection, local only. */
  tab: TabState; lapsed: boolean;
};

/** What to call a friend: their typed first name, else the colour name ('Red'). */
export const displayName = (m: Pick<Member, 'name' | 'nick'>): string => m.nick || m.name;

export const PING_SHOW_MS = 8000;

const initial = (): PartyState => ({
  status: 'idle', code: null, codeExpiresAt: 0, you: null, isHost: false, locked: false, members: [], lastEmote: null, pings: [], error: null, tab: null, lapsed: false,
});

/** A friend walking in a room is 'indoors' with no Activity on the wire (the speed byte is the room code): read the room as the
 *  activity, so the party list says "In the Konbini" for them too (old senders: the Busy Activity, as before). */
const activityFor = (mode: number, speedQ: number, room: number): number => (room >= 0 ? roomActivity(room) : activityOf(mode, speedQ));

function toMember(m: MemberInfo): Member {
  const pose = m[4], room = pose ? roomOf(pose) : -1;
  return { id: m[0], name: nameFor(m[1]), nick: m[5] ?? null, colourIdx: m[1][0], colourHex: colourHex(m[1][0]), look: m[2], isHost: m[3] === 1, zone: (pose ? pose[6] : 0) as Zone, away: pose ? (pose[7] & 2) !== 0 : false,
    presence: pose ? presenceOf(pose[5], pose[6], pose[7]) : 'active', activity: pose ? activityFor(pose[5], pose[4], room) : 0, room };
}

let state: PartyState = initial();
/** Friends on the map (Oct 23 2026): each member's last ISLAND spot in metres (a room pose keeps the spot where they went in, the
 *  door). Mutated in place as poses arrive, never emitted (no re-render per pose); the maps read it on their own slow timers. */
export type FriendSpot = { x: number; z: number };
const spots = new Map<MemberId, FriendSpot>();
function keepSpot(id: MemberId, body: ArrayLike<number>): void {
  if (roomOf(body) >= 0) return;
  const x = (body[0] as number) / 10, z = (body[2] as number) / 10, s = spots.get(id);
  if (s) { s.x = x; s.z = z; } else spots.set(id, { x, z });
}
const scratch: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
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
  /** Self rename (Your party > List): show my new first name right away (the relay's S.Joined echo confirms it; an old relay never
   *  sends one, so this is all the old-relay fallback has). Memory only. */
  setOwnNick(nick: string): void {
    const you = state.you;
    if (you === null || !state.members.some((x) => x.id === you && x.nick !== nick)) return;
    set({ ...state, members: state.members.map((x) => (x.id === you ? { ...x, nick } : x)) });
  },
  apply(m: ServerMsg, nowMs: number): void {
    switch (m[0]) {
      case S.Welcome: {
        spots.clear();
        for (const info of m[7]) if (info[4]) keepSpot(info[0], info[4]);
        const members = m[7].map(toMember);
        set({ ...state, status: 'live', you: m[2], codeExpiresAt: m[4], locked: m[6] === 1, members, error: null,
          isHost: members.some((x) => x.id === m[2] && x.isHost) });
        return;
      }
      case S.Joined: {
        const mem = toMember(m[1]);
        if (m[1][4]) keepSpot(mem.id, m[1][4]);
        set({ ...state, members: [...state.members.filter((x) => x.id !== mem.id), mem].sort((a, b) => a.id - b.id) });
        return;
      }
      case S.Renamed:
        set({ ...state, members: state.members.map((x) => (x.id === m[1] ? { ...x, nick: null } : x)) });
        return;
      case S.Left:
        spots.delete(m[1]);
        set({ ...state, members: state.members.filter((x) => x.id !== m[1]), pings: state.pings.filter((p) => p.id !== m[1]) });
        return;
      case S.Poses: {
        // Only a zone / away / presence flip is visible state. Nothing changes (and nothing emits) for ordinary movement.
        let list: Member[] = state.members;
        let changed = false;
        for (let i = 2; i + 8 < m.length; i += 9) {
          const id = m[i] as number, zone = m[i + 7] as Zone, flags = m[i + 8] as number, away = (flags & 2) !== 0;
          scratch[0] = m[i + 1] as number; scratch[1] = m[i + 2] as number; scratch[2] = m[i + 3] as number; scratch[4] = m[i + 5] as number; scratch[6] = zone; // roomOf reads y, the speed byte and the zone
          const room = roomOf(scratch);
          if (room < 0) keepSpot(id, scratch);
          const presence = presenceOf(m[i + 6] as number, zone, flags), activity = activityFor(m[i + 6] as number, m[i + 5] as number, room);
          const cur: Member | undefined = list.find((x) => x.id === id);
          if (cur && (cur.zone !== zone || cur.away !== away || cur.presence !== presence || cur.activity !== activity || cur.room !== room)) {
            list = list.map((x) => (x.id === id ? { ...x, zone, away, presence, activity, room } : x));
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
        // Meet here / Follow me are island-only: a ping from a friend whose last pose is in a room is ignored (design 2.2).
        if (state.members.some((x) => x.id === m[1] && x.room >= 0)) return;
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
  /** Party rejoin: the connection's tab / lapsed (emits only on change). */
  setLocal(tab: TabState, lapsed: boolean): void { if (tab !== state.tab || lapsed !== state.lapsed) set({ ...state, tab, lapsed }); },
  /** Optimistic: the host sees "locked" at once (the relay sends no echo). */
  setLocked(locked: boolean): void { if (state.locked !== locked) set({ ...state, locked }); },
  reset(): void { spots.clear(); set(initial()); },
  /** A member's last island spot (metres), or undefined before their first island pose. Read-only for callers; never emits. */
  spot(id: MemberId): Readonly<FriendSpot> | undefined { return spots.get(id); },
};

export function usePartyState(): PartyState {
  return useSyncExternalStore(partyStore.subscribe, partyStore.get, partyStore.get);
}
