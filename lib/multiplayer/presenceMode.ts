// Public island (Nov 11 2026, docs/multiplayer-public-island-plan-2026-11-11.md): the presence mode. One island, three ways to be on it:
// 'solo' (Just me: no socket), 'public' (With other players: a world socket), 'party' (With friends: today's party by code).
// This file is the state only (pure resolution + a tiny store); publicWorld.ts drives the connection from it. No timers, no network.
// The stored choice and the grown-up lock live in lib/multiplayerAllowed.ts (this folder never names browser storage).
import { useSyncExternalStore } from 'react';
import { publicWorldEnabled } from './publicFlag';
import { holdoutDefaultMode } from './holdout';
import { multiplayerLock, readPresenceChoice, writePresenceChoice, subscribeMultiplayerAllowed, type MultiplayerLock } from '../multiplayerAllowed';
import { inSharedMatch, onSharedMatch } from './sharedMatch';

export type PresenceMode = 'solo' | 'public' | 'party';
/** What the people button remembers: 'public' is stored as 'others'. */
export type PresenceChoice = 'solo' | 'public';
/** Why the effective mode is not the choice. null = it is the choice (or a party). */
export type PresenceReason =
  | 'flag'            // the build flag is off (NEXT_PUBLIC_MULTIPLAYER + NEXT_PUBLIC_PUBLIC_WORLD)
  | 'locked-friends'  // a grown-up set "Friends only"
  | 'locked-off'      // a grown-up turned multiplayer off
  | 'tutorial'        // the island tutorial is not finished yet
  | 'closed'          // the relay said public play is closed (open:false, close 4007)
  | 'unavailable'     // an old relay, the world full, or the relay unreachable: quiet retry later
  | null;
/** What the relay last said about public worlds. */
export type RelayWorld = 'unknown' | 'open' | 'closed' | 'unavailable';
export interface PresenceInputs {
  flag: boolean; lock: MultiplayerLock; tutorialDone: boolean; relay: RelayWorld;
  /** A pending / stored / live private party (a link, a title-screen code, a resumable session). */
  party: boolean;
  choice: PresenceChoice;
}

/** The decision table (tests/mp-presence.cjs). A party always wins over public, but not over a grown-up's Off. */
export function resolvePresence(i: PresenceInputs): { mode: PresenceMode; reason: PresenceReason } {
  if (i.lock === 'off') return { mode: 'solo', reason: 'locked-off' };
  if (i.party) return { mode: 'party', reason: null };
  if (!i.flag) return { mode: 'solo', reason: 'flag' };
  if (i.lock === 'friends') return { mode: 'solo', reason: 'locked-friends' };
  if (i.choice === 'solo') return { mode: 'solo', reason: null };
  if (!i.tutorialDone) return { mode: 'solo', reason: 'tutorial' };
  if (i.relay === 'closed') return { mode: 'solo', reason: 'closed' };
  if (i.relay === 'unavailable') return { mode: 'solo', reason: 'unavailable' };
  return { mode: 'public', reason: null };
}

export interface PresenceState {
  /** The player's choice (what the switch shows as selected). */
  choice: PresenceChoice;
  /** No stored choice: the choice is the holdout arm's default (90% public, 10% solo). */
  defaulted: boolean;
  /** The effective mode, and why it differs from the choice. */
  mode: PresenceMode; reason: PresenceReason;
  lock: MultiplayerLock; flag: boolean; tutorialDone: boolean; relay: RelayWorld; party: boolean;
  /** A world socket is live now. */
  connected: boolean;
  /** Others in my world (not me): the lobby's n before connecting, S.World while connected. Null = unknown. */
  count: number | null;
  /** In a shared live match (switching is an implicit Leave: warn first). */
  sharedMatch: boolean;
}

/** Events for counters (Town maps them to lib/analytics/publicEvents.ts: this folder never imports analytics). */
export type PresenceEvent =
  | { type: 'arm'; arm: 'on' | 'hold'; back?: boolean }
  | { type: 'connect' }
  | { type: 'seen' }
  | { type: 'switch'; to: PresenceChoice }
  | { type: 'hide' }
  | { type: 'report'; reason: 'following' | 'inmyway' | 'waves' | 'other' }
  | { type: 'fallback'; why: 'full' | 'unreachable' }
  | { type: 'match_join' };

let state: PresenceState | null = null;
let tutorialDone = false, relay: RelayWorld = 'unknown', party = false, connected = false, count: number | null = null;
const subs = new Set<() => void>();
const eventSubs = new Set<(e: PresenceEvent) => void>();
let offLock: (() => void) | null = null, offMatch: (() => void) | null = null;

function compute(): PresenceState {
  const flag = publicWorldEnabled(), lock = multiplayerLock(), stored = readPresenceChoice();
  // The holdout seed is made only when the feature exists in this build (flag on) and nothing was chosen yet.
  const choice: PresenceChoice = stored ?? (flag ? holdoutDefaultMode() : 'solo');
  const r = resolvePresence({ flag, lock, tutorialDone, relay, party, choice });
  return { choice, defaulted: stored === null, mode: r.mode, reason: r.reason, lock, flag, tutorialDone, relay, party, connected, count, sharedMatch: inSharedMatch() };
}
function same(a: PresenceState, b: PresenceState): boolean {
  for (const k of Object.keys(a) as (keyof PresenceState)[]) if (a[k] !== b[k]) return false;
  return true;
}
function update(): void {
  const next = compute();
  if (state && same(state, next)) return;
  state = next;
  for (const f of Array.from(subs)) f();
}

export const presence = {
  /** The state now. Without subscribers (nothing listens for lock changes) it is re-read on every call; identity kept when unchanged. */
  get(): PresenceState { if (!state) state = compute(); else if (!subs.size) update(); return state; },
  subscribe(fn: () => void): () => void {
    subs.add(fn);
    if (!offLock) offLock = subscribeMultiplayerAllowed(update); // the lock and the choice (another tab) change: recompute
    if (!offMatch) offMatch = onSharedMatch(update);
    return () => { subs.delete(fn); if (!subs.size) { offLock?.(); offLock = null; offMatch?.(); offMatch = null; } };
  },
  /** The player's tap on the people button. Stored ('others' | 'solo'), counted once per real change. */
  setChoice(c: PresenceChoice): void {
    const before = presence.get().choice, wasDefault = presence.get().defaulted;
    writePresenceChoice(c);
    update();
    if (c !== before || wasDefault) emitPresenceEvent({ type: 'switch', to: c });
  },
  /** Signals (publicWorld.ts / the UI). */
  setTutorialDone(on: boolean): void { if (on !== tutorialDone) { tutorialDone = on; update(); } },
  setRelay(r: RelayWorld): void { if (r !== relay) { relay = r; update(); } },
  setParty(on: boolean): void { if (on !== party) { party = on; update(); } },
  setLive(on: boolean, n: number | null): void { if (on !== connected || n !== count) { connected = on; count = n; update(); } },
  /** Re-read the lock and the stored choice (after a change this tab did not make through these helpers). */
  refresh(): void { update(); },
  onEvent(fn: (e: PresenceEvent) => void): () => void { eventSubs.add(fn); return () => { eventSubs.delete(fn); }; },
  /** Tests. */
  reset(): void { state = null; tutorialDone = false; relay = 'unknown'; party = false; connected = false; count = null; },
};
export function emitPresenceEvent(e: PresenceEvent): void { for (const f of Array.from(eventSubs)) { try { f(e); } catch { /* a counter must never break play */ } } }

/** React: the presence state (re-renders only when a field changes). */
export function usePresence(): PresenceState {
  return useSyncExternalStore(presence.subscribe, presence.get, presence.get);
}
/** A room page may resume this tab's world slot: the feature is on, the lock allows strangers and the player chose public. */
export function worldResumeAllowed(): boolean {
  const s = presence.get();
  return s.flag && s.lock === 'all' && s.choice === 'public';
}
