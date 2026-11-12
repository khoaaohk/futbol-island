// Public island (Nov 11 2026, docs/multiplayer-public-island-plan-2026-11-11.md "Safety"): the local Hide list for strangers and the
// client-side emote cap. Memory only, for this page session (never stored, never sent: Report is the only thing that leaves, as
// C.Report from connection.ts). Used only while the connection is in a public world; a party keeps its own Hide / Mute (PartyHost).
// Ids are reused by the relay after a member really leaves, so a hide remembers the generated name the member had: a different
// name on the same id later (S.Joined / S.Welcome) is a different kid, and the hide is dropped for that id.
import type { MemberId } from '../../multiplayer/protocol';

/** At most this many emotes per sender per window reach the scene (the relay's own buckets come first). */
export const STRANGER_EMOTES_PER_MIN = 6;
export const STRANGER_EMOTE_WINDOW_MS = 60_000;

const hiddenIds = new Map<MemberId, string>(); // id -> name key when hidden ('' = not known yet)
const names = new Map<MemberId, string>(); // id -> the name key last seen for it
const reportedIds = new Set<MemberId>(); // reported this visit: hidden for good (never offered "Show again"; a report cannot be undone)
const emoteTimes = new Map<MemberId, number[]>(); // per sender: the last STRANGER_EMOTES_PER_MIN arrival times
const subs = new Set<() => void>();
let snapshot: ReadonlySet<MemberId> = new Set();
const emit = () => { snapshot = new Set(hiddenIds.keys()); for (const f of Array.from(subs)) f(); };

export function hideStranger(id: MemberId): void {
  if (hiddenIds.has(id)) return;
  hiddenIds.set(id, names.get(id) ?? '');
  emit();
}
export function unhideStranger(id: MemberId): void { if (reportedIds.has(id)) return; if (hiddenIds.delete(id)) emit(); }
/** Report = hide that can never be undone this visit (the roster lists reported players nowhere, not even under Show again). */
export function reportStranger(id: MemberId): void { reportedIds.add(id); if (hiddenIds.has(id)) emit(); else hideStranger(id); }
export function isReportedStranger(id: MemberId): boolean { return reportedIds.has(id); }
/** The hidden ids (a new Set object on every change: safe for useSyncExternalStore and reference checks). */
export function hiddenStrangers(): ReadonlySet<MemberId> { return snapshot; }
export function isHiddenStranger(id: MemberId): boolean { return hiddenIds.has(id); }
export function onHiddenStrangers(fn: () => void): () => void { subs.add(fn); return () => { subs.delete(fn); }; }

/** connection.ts: the name a member id carries now (S.Welcome / S.Joined in a world). A new name on a hidden id unhides it. */
export function noteStrangerName(id: MemberId, key: string): void {
  names.set(id, key);
  const h = hiddenIds.get(id);
  if (h === undefined) return;
  if (h === '') hiddenIds.set(id, key);
  else if (h !== key) { hiddenIds.delete(id); reportedIds.delete(id); emoteTimes.delete(id); emit(); }
}

/** True when an emote from `id` may reach the scene: not hidden, and under the per-minute cap (drops count toward nothing). */
export function admitStrangerEmote(id: MemberId, nowMs: number): boolean {
  if (hiddenIds.has(id)) return false;
  let t = emoteTimes.get(id);
  if (!t) { t = []; emoteTimes.set(id, t); }
  while (t.length && nowMs - t[0] >= STRANGER_EMOTE_WINDOW_MS) t.shift();
  if (t.length >= STRANGER_EMOTES_PER_MIN) return false;
  t.push(nowMs);
  return true;
}

/** Tests / a new page session. */
export function resetStrangers(): void { hiddenIds.clear(); reportedIds.clear(); names.clear(); emoteTimes.clear(); emit(); }
