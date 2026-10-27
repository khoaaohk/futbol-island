/** App orientation on phones (Oct 26 2026, owner, docs/STRIKERS_LANDSCAPE_OCT26.md). The app is portrait-only on phones
 *  (components/RotateLock.tsx), with one exception: Island Strikers plays sideways. A screen that wants landscape calls
 *  requestLandscape() while mounted; RotateLock then shows its "turn sideways" card for upright phones instead of the
 *  "turn upright" card for sideways ones, and pauses the game the same way (a window blur). Releasing it restores portrait.
 *  No polling: one tiny subscriber list, notified only when the mode changes. */
export type OrientationMode = 'portrait' | 'landscape';

/** Phones held sideways (touch, short side): the portrait-only app shows "Turn your phone upright". */
export const PORTRAIT_ONLY_QUERY = '(pointer:coarse) and (orientation:landscape) and (max-height:500px)';
/** Phones held upright (touch, narrow side): Strikers shows "Turn your phone sideways". Tall tablets (wider than 500 px) still
 *  play upright with the portrait tuning. */
/** Narrow, tall mouse windows and upright tablets never see a card (round 3, Oct 26 2026, docs/ARCADE_STRIKERS_R3_OCT26.md): Strikers
 *  letterboxes a landscape game frame there instead (LiveArcadeMatch.module.css "Landscape frame"), so the pitch is always sideways. */
export const LANDSCAPE_ONLY_QUERY = '(pointer:coarse) and (orientation:portrait) and (max-width:500px)';

/** The media query that shows the wrong-orientation card in a mode. */
export const wrongOrientationQuery = (mode: OrientationMode) => mode === 'landscape' ? LANDSCAPE_ONLY_QUERY : PORTRAIT_ONLY_QUERY;

let mode: OrientationMode = 'portrait', holders = 0;
const listeners = new Set<() => void>();

export const getOrientationMode = () => mode;
export function subscribeOrientationMode(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }

/** Installed apps (and fullscreen) get a real lock where the browser allows it; elsewhere the card does the job. */
export function lockScreenOrientation(next: OrientationMode) {
  try { (screen.orientation as unknown as { lock?: (o: string) => Promise<void> })?.lock?.(next)?.catch(() => {}); } catch { /* not allowed outside fullscreen or an installed app */ }
}

function setMode(next: OrientationMode) {
  if (next === mode) return;
  mode = next;
  if (typeof document !== 'undefined') { if (next === 'landscape') document.documentElement.dataset.orientation = 'landscape'; else delete document.documentElement.dataset.orientation; }
  lockScreenOrientation(next);
  for (const listener of listeners) listener();
}

/** Ask for landscape while a screen is mounted; returns the release. Counted, so a remount never leaves the app sideways. */
export function requestLandscape() {
  holders++; setMode('landscape');
  let released = false;
  return () => { if (released) return; released = true; holders = Math.max(0, holders - 1); if (!holders) setMode('portrait'); };
}
