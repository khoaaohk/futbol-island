'use client';
/**
 * Public island UI helpers (Agent C, Nov 11 2026; docs/multiplayer-public-island-plan-2026-11-11.md). Light: no three.js, no React.
 *
 *  - Who is near: Town calls publicTick(t, x, z, busy) from its existing frame (next to partyFrame): two assignments per frame and,
 *    at most twice a second and only in a public world, one loop over the store's members. Remote spots come from the poses the
 *    connection already decodes (onPoses, decimetres). Used for the first-time card (another real player within FIRST_NEAR_M) and the
 *    panel's roster order (nearest first).
 *  - busy: a lesson, quiz or live match is running (Town's own flags). The first-time card never opens while it is true.
 *  - The one-time marks on this device (key fi2-public-hint-v1, classified in lib/saves/snapshot.ts): 'card' (the first-time card was
 *    shown) and 'hint' (the people button's pulse for existing players). Each is shown at most once.
 * No timers, no polling: subscribers are told only when `near` or `busy` flips.
 */
import { onPoses, partyStore, type Member } from '@/lib/multiplayer';
import { isPublic } from '@/lib/multiplayer/publicWorld';
import { isHiddenStranger } from '@/lib/multiplayer/strangers';
import { PUBLIC_MATCH_LINES } from '@/lib/multiplayer/publicCopy';

export const FIRST_NEAR_M = 25;
export const HINT_KEY = 'fi2-public-hint-v1';
const SAMPLE_MS = 500;
const spots = new Map<number, { x: number; z: number }>();
const me = { x: 0, z: 0, ok: false };
let busy = false, near = false, nextAt = 0, offPoses: (() => void) | null = null;
const subs = new Set<() => void>();
const emit = () => { for (const f of Array.from(subs)) f(); };

function listen() {
  if (offPoses) return;
  offPoses = onPoses((id, b) => { let s = spots.get(id); if (!s) { s = { x: 0, z: 0 }; spots.set(id, s); } s.x = b[0] / 10; s.z = b[2] / 10; });
}

/** Town's frame (island metres). `isBusy`: a lesson, quiz or live match. */
export function publicTick(t: number, x: number, z: number, isBusy: boolean): void {
  me.x = x; me.z = z; me.ok = true;
  if (isBusy !== busy) { busy = isBusy; emit(); }
  if (near || t < nextAt) return;
  nextAt = t + SAMPLE_MS;
  if (!isPublic()) return;
  listen();
  const s = partyStore.get();
  for (let i = 0; i < s.members.length; i++) {
    const m = s.members[i];
    if (m.id === s.you || m.room >= 0 || isHiddenStranger(m.id)) continue;
    const p = spots.get(m.id);
    if (p && (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) < FIRST_NEAR_M * FIRST_NEAR_M) { near = true; emit(); return; }
  }
}

export const publicNear = {
  /** Another real player came within FIRST_NEAR_M of this one at least once this visit. */
  near: () => near,
  busy: () => busy,
  subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; },
  /** Tests. */
  reset() { near = false; busy = false; nextAt = 0; spots.clear(); me.ok = false; offPoses?.(); offPoses = null; },
};

/** Squared distance from me (Infinity when unknown). */
const d2 = (id: number) => { const p = spots.get(id); return p && me.ok ? (p.x - me.x) ** 2 + (p.z - me.z) ** 2 : Infinity; };
/** The roster's order: nearest first (unknown spots last, store order kept among them), at most `max`. */
export function nearestFirst<T extends Pick<Member, 'id'>>(list: readonly T[], max: number): T[] {
  return list.map((m, i) => ({ m, i, d: d2(m.id) })).sort((a, b) => a.d - b.d || a.i - b.i).slice(0, max).map((e) => e.m);
}

/** Phase 2 (Nov 12 2026): who this device was when public play first reached it. 'old' = the island tour was already finished on
 *  the first flag-on visit (an island from before public play: the one-time people-button hint), 'new' = a brand-new player (the
 *  tour runs in Just me, then the first-time card). Decided once and kept (device key fi2-public-since-v1, lib/saves/snapshot.ts). */
export const SINCE_KEY = 'fi2-public-since-v1';
export type PlayerSince = 'old' | 'new';
let since: PlayerSince | null = null;
export function playerSince(tourDone: () => boolean): PlayerSince {
  if (since) return since;
  try { const v = localStorage.getItem(SINCE_KEY); if (v === 'old' || v === 'new') return (since = v); } catch { /* blocked: decide for this visit */ }
  since = tourDone() ? 'old' : 'new';
  try { localStorage.setItem(SINCE_KEY, since); } catch { /* this visit only */ }
  return since;
}
/** Tests. */
export function resetPlayerSince(): void { since = null; }

/** The one-time marks (never throws: storage can be blocked). */
export function seenMark(which: 'card' | 'hint'): boolean {
  try { return (localStorage.getItem(HINT_KEY) ?? '').split(' ').includes(which); } catch { return false; }
}
export function setMark(which: 'card' | 'hint'): void {
  try { const cur = (localStorage.getItem(HINT_KEY) ?? '').split(' ').filter(Boolean); if (!cur.includes(which)) localStorage.setItem(HINT_KEY, [...cur, which].join(' ')); } catch { /* this visit only */ }
}

/** Mid-match lines: matchLink's friend wording, swapped for a neutral line while this page is in a public world (or `wasPublic`:
 *  the match was shared in a world that has just been left, e.g. "Just me" mid-match closes the socket before the line is said). */
export function strangerLine(text: string, wasPublic = false): string {
  if (!isPublic() && !wasPublic) return text;
  if (text.startsWith('Lost your friends')) return PUBLIC_MATCH_LINES.lost;
  if (text.startsWith('Your friend left')) return PUBLIC_MATCH_LINES.ownerLeft;
  return text;
}
/** Wraps the live-match join so its `say` goes through strangerLine (everything else is the same object, through the prototype).
 *  matchLink calls friendsChanged() on every roster change and once after a teardown, so it samples isPublic() while the shared
 *  match is live: the teardown line ("Lost your friends' match") said after a switch to Just me still gets the stranger wording. */
export function strangerJoin<J extends { say(text: string, seconds?: number): void; friendsChanged(): void }>(join: J): J {
  const w = Object.create(join) as J;
  let pub = false;
  w.say = (text: string, seconds?: number) => join.say(strangerLine(text, pub), seconds);
  w.friendsChanged = () => { pub = isPublic(); join.friendsChanged(); };
  return w;
}
