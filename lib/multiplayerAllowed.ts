// Not under lib/multiplayer on purpose: that folder never touches localStorage (tests/mp-client.cjs privacy check).
// Grown-up switch (Settings, behind the parent gate): "Play with friends: Allowed / Off". Default Allowed.
export const ALLOWED_KEY = 'fi2-multiplayer-allowed-v1';
const ALLOWED_EVENT = 'fi2-multiplayer-allowed-change';
export function multiplayerAllowed(): boolean {
  try { return typeof localStorage === 'undefined' || localStorage.getItem(ALLOWED_KEY) !== 'off'; } catch { return true; }
}
export function setMultiplayerAllowed(on: boolean): void {
  try { if (on) localStorage.removeItem(ALLOWED_KEY); else localStorage.setItem(ALLOWED_KEY, 'off'); } catch { /* private mode */ }
  try { window.dispatchEvent(new Event(ALLOWED_EVENT)); } catch { /* ignore */ }
}
export function subscribeMultiplayerAllowed(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(ALLOWED_EVENT, fn); window.addEventListener('storage', fn);
  return () => { window.removeEventListener(ALLOWED_EVENT, fn); window.removeEventListener('storage', fn); };
}
