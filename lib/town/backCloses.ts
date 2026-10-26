/**
 * Back closes the open sheet (QA audit Oct 25 2026, docs/QA_AUDIT_OCT25.md #5).
 *
 * The island lives at `/` with no history entry of its own, so the phone's back button (Android, or a back swipe) with the map,
 * pocket, settings or Paths open left the game for the title screen or the previous site instead of closing the sheet a kid was
 * looking at. While the island is mounted it keeps one guard entry on top of its own (same URL; Next's patched pushState copies
 * its router state, so popping back to the real entry is a plain restore). On back:
 *  - a dialog is open → the topmost one gets the Escape it already closes on, and the guard goes back on;
 *  - nothing is open → the back carries on exactly as before (one more history.back()).
 * No timers: one popstate listener.
 */
export const BACK_GUARD_KEY = 'fi2BackGuard';
const DIALOGS = '[role=dialog],[role=alertdialog],dialog[open],[aria-modal=true]';

function shown(el: Element): boolean {
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1 || el.closest('[hidden],[inert]')) return false;
  const cs = getComputedStyle(el);
  return cs.visibility !== 'hidden' && cs.display !== 'none';
}

/** The topmost open dialog (last in document order), or null. */
export function topDialog(doc: Document): HTMLElement | null {
  const all = [...doc.querySelectorAll<HTMLElement>(DIALOGS)].filter(shown);
  return all.length ? all[all.length - 1] : null;
}

/**
 * What a real Escape does to `d`: a native modal <dialog> gets `cancel` (a synthetic keydown never fires it; the pocket drawer
 * animates shut from its onCancel), closing when nobody prevents it; any other dialog gets the Escape keydown its own listener
 * already handles, from the focused control inside it when there is one.
 */
export function closeLikeEscape(d: HTMLElement, doc: Document): void {
  if (typeof HTMLDialogElement !== 'undefined' && d instanceof HTMLDialogElement) {
    const ev = new Event('cancel', { cancelable: true });
    let modal = true; try { modal = d.matches(':modal'); } catch { /* older engines: treat as modal */ }
    if (d.dispatchEvent(ev) && d.open && modal) d.close();
    return;
  }
  const target = d.contains(doc.activeElement) ? (doc.activeElement as HTMLElement) : d;
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
}

/** Installs the guard on `win` (once per page; a second call returns the first one's cleanup). */
export function installBackCloses(win: Window = window): () => void {
  const w = win as Window & { __fi2BackCloses?: () => void };
  if (w.__fi2BackCloses) return w.__fi2BackCloses;
  const doc = win.document, h = win.history;
  const guarded = () => !!(h.state && (h.state as Record<string, unknown>)[BACK_GUARD_KEY]);
  let home = '';
  const push = () => { if (!guarded()) { home = win.location.href; h.pushState({ ...(h.state || {}), [BACK_GUARD_KEY]: 1 }, ''); } };
  const onPop = () => {
    if (guarded()) return; // forward onto the guard again
    if (win.location.href !== home) return; // some other page's entry (a soft navigation): never chain further back
    const d = topDialog(doc);
    if (!d) { h.back(); return; }
    closeLikeEscape(d, doc);
    // The guard goes straight back on: a sheet that animates shut, or one that ignores Escape (closed with its own Done), keeps
    // the next back press for the island too. (Oct 25: a 220 ms "did it close?" check misread closing animations as ignored.)
    push();
  };
  push();
  win.addEventListener('popstate', onPop);
  const dispose = () => { win.removeEventListener('popstate', onPop); if (w.__fi2BackCloses === dispose) delete w.__fi2BackCloses; };
  w.__fi2BackCloses = dispose;
  return dispose;
}
