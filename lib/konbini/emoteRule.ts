// The Konbini Emote button's show rule (owner, Oct 22 2026): "only appear if there is an npc or multi player nearby; the cashier
// doesn't count because he's behind a counter". Pure; the scene samples it at ~4 Hz (konbiniScene.ts) and pushes the flag to the dock.
export const EMOTE_NEAR_M = 8;
/** The scene's own check rate (Hz); not per frame. */
export const EMOTE_CHECK_HZ = 4;
export interface EmoteSubject { x: number; z: number; busy?: boolean; id?: string; role?: string }
export interface EmoteRuleOpts {
  /** The party is live (friends can count only then). */
  live: boolean;
  /** Battery saver: the friend layer draws nothing, so friends do not count. */
  batterySaver?: boolean;
  maxM?: number;
}
/** True when `id`/`role` name the clerk behind the counter, who never counts however close. */
export function isCashier(s: { id?: string; role?: string }): boolean {
  return s.role === 'cashier' || s.role === 'clerk' || (s.id ?? '').startsWith('konbini-cashier') || /^(cashier|clerk)/.test(s.id ?? '');
}
const within = (px: number, pz: number, s: EmoteSubject, r2: number) => (s.x - px) * (s.x - px) + (s.z - pz) * (s.z - pz) <= r2;
/** (a) a live-party friend in this room within range and not busy, or (b) a non-cashier NPC (customer/shopper) within range.
 *  The Konbini has no customer NPCs today (only the clerk), so `npcs` is normally empty and only friends count. */
export function emoteCandidate(px: number, pz: number, friends: ArrayLike<EmoteSubject> | null, npcs: ArrayLike<EmoteSubject> | null, o: EmoteRuleOpts): boolean {
  const r = o.maxM ?? EMOTE_NEAR_M, r2 = r * r;
  if (o.live && !o.batterySaver && friends) for (let i = 0; i < friends.length; i++) { const f = friends[i]; if (!f.busy && within(px, pz, f, r2)) return true; }
  if (npcs) for (let i = 0; i < npcs.length; i++) { const n = npcs[i]; if (!isCashier(n) && within(px, pz, n, r2)) return true; }
  return false;
}
