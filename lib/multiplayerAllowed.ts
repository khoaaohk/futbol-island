// Not under lib/multiplayer on purpose: that folder never touches localStorage (tests/mp-client.cjs privacy check).
// Grown-up lock (Settings, behind the parent gate). Public island (Nov 11 2026, docs/multiplayer-public-island-plan-2026-11-11.md):
// three values in the SAME key: 'all' (default: other players and friends' parties), 'friends' (public play off, parties allowed),
// 'off' (no multiplayer at all). Backward compatible: before Nov 11 the key held 'off' or nothing (Allowed); both still mean the same.
export const ALLOWED_KEY = 'fi2-multiplayer-allowed-v1';
const ALLOWED_EVENT = 'fi2-multiplayer-allowed-change';
export type MultiplayerLock = 'all' | 'friends' | 'off';
export const MULTIPLAYER_LOCKS: readonly MultiplayerLock[] = ['all', 'friends', 'off'];

/** Any stored value -> a lock. Missing / unknown / an old "Allowed" -> 'all'; 'off' (any case) -> 'off'; 'friends' -> 'friends'. */
export function parseLock(raw: string | null | undefined): MultiplayerLock {
  const v = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return v === 'off' ? 'off' : v === 'friends' ? 'friends' : 'all';
}
function store(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
}
const notify = () => { try { window.dispatchEvent(new Event(ALLOWED_EVENT)); } catch { /* no window */ } };

/** The grown-up lock right now ('all' without storage). */
export function multiplayerLock(): MultiplayerLock {
  try { return parseLock(store()?.getItem(ALLOWED_KEY)); } catch { return 'all'; }
}
export function setMultiplayerLock(v: MultiplayerLock): void {
  try {
    const s = store();
    if (v === 'all') s?.removeItem(ALLOWED_KEY); else s?.setItem(ALLOWED_KEY, v);
  } catch { /* private mode */ }
  notify();
}
/** Any multiplayer (parties) allowed: the lock is not 'off'. Unchanged meaning for every existing caller. */
export function multiplayerAllowed(): boolean { return multiplayerLock() !== 'off'; }
/** Players who do not know each other may share the island: only with the lock on 'all'. */
export function publicAllowed(): boolean { return multiplayerLock() === 'all'; }
/** Old two-way switch: on = 'all', off = 'off'. */
export function setMultiplayerAllowed(on: boolean): void { setMultiplayerLock(on ? 'all' : 'off'); }
export function subscribeMultiplayerAllowed(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(ALLOWED_EVENT, fn); window.addEventListener('storage', fn);
  return () => { window.removeEventListener(ALLOWED_EVENT, fn); window.removeEventListener('storage', fn); };
}

// ---- the player's own presence choice (the people button: "Just me" / "With other players") ----
// Device key, already classified in lib/saves/snapshot.ts by Agent E. 'others' | 'solo'; nothing stored = the holdout default
// (lib/multiplayer/holdout.ts). Read by lib/multiplayer/presenceMode.ts, which never names localStorage itself.
export const PRESENCE_KEY = 'fi2-presence-mode-v1';
export type PresenceChoiceWire = 'others' | 'solo';
export function readPresenceChoice(): 'public' | 'solo' | null {
  try { const v = store()?.getItem(PRESENCE_KEY); return v === 'others' ? 'public' : v === 'solo' ? 'solo' : null; } catch { return null; }
}
export function writePresenceChoice(m: 'public' | 'solo'): void {
  try { store()?.setItem(PRESENCE_KEY, m === 'public' ? 'others' : 'solo'); } catch { /* private mode */ }
}
