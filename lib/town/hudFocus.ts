/**
 * HUD focus rule (Oct 16 2026: "Space on desktop sometimes opens the menu instead of shooting").
 *
 * A mouse or touch press on a HUD button (ride, settings, map toggle, pocket, Paths, Fishbook, lure, job buttons…) left keyboard
 * focus on that button, so the next Space / Enter was a native button activation (the ride changed, the map toggled, a panel
 * opened) instead of the game's kick. The standard game-UI rule: pointer presses never leave focus on a HUD control. Keyboard
 * users keep normal focus: Tab marks keyboard modality, and a button focused that way still activates on Space / Enter.
 *
 * - After a pointer click (event.detail > 0) the clicked button is blurred once its handlers ran.
 * - While the last input was a pointer, focus the app moves back onto a HUD button by script (a panel restoring focus to the
 *   button that opened it) is blurred too.
 * Controls inside dialogs, menus, forms, text fields, and anything under [data-keep-focus] keep their focus.
 */
const KEEP = 'dialog,[role=dialog],[role=alertdialog],[role=menu],[role=listbox],form,input,textarea,select,[contenteditable=""],[contenteditable=true],[data-keep-focus]';
const CONTROL = 'button,[role=button],a[href]';

export const HUD_FOCUS_ROOT = '.town-app';

/** The HUD control a pointer must not leave focused, or null. */
export function hudFocusTarget(target: EventTarget | null, root: string = HUD_FOCUS_ROOT): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const control = target.closest<HTMLElement>(CONTROL);
  if (!control || !control.closest(root) || control.closest(KEEP)) return null;
  return control;
}

/** Installs the rule on `doc` (once per page; a second call returns the first one's cleanup). */
export function installHudFocusRule(doc: Document = document, root: string = HUD_FOCUS_ROOT): () => void {
  const w = doc.defaultView as (Window & { __fi2HudFocus?: () => void }) | null;
  if (!w) return () => {};
  if (w.__fi2HudFocus) return w.__fi2HudFocus;
  let modality: 'pointer' | 'keyboard' = 'pointer', pressing = false;
  const blurLater = (el: HTMLElement) => { w.setTimeout(() => { if (doc.activeElement === el && !el.closest(KEEP)) el.blur(); }, 0); };
  const down = () => { modality = 'pointer'; pressing = true; };
  const up = () => { pressing = false; };
  const key = (e: KeyboardEvent) => { if (e.key === 'Tab') modality = 'keyboard'; };
  // detail 0 = a keyboard (or script) activation: leave focus where the user put it.
  const click = (e: MouseEvent) => { if (e.detail === 0) return; const el = hudFocusTarget(e.target, root); if (el) blurLater(el); };
  // Focus moved onto a HUD button by script after a pointer interaction (a panel closing restores focus to its opener).
  const focusin = (e: FocusEvent) => { if (modality !== 'pointer' || pressing) return; const el = hudFocusTarget(e.target, root); if (el) blurLater(el); };
  doc.addEventListener('pointerdown', down, true); doc.addEventListener('pointerup', up, true); doc.addEventListener('pointercancel', up, true);
  doc.addEventListener('keydown', key, true); doc.addEventListener('click', click, true); doc.addEventListener('focusin', focusin, true);
  const dispose = () => {
    doc.removeEventListener('pointerdown', down, true); doc.removeEventListener('pointerup', up, true); doc.removeEventListener('pointercancel', up, true);
    doc.removeEventListener('keydown', key, true); doc.removeEventListener('click', click, true); doc.removeEventListener('focusin', focusin, true);
    if (w.__fi2HudFocus === dispose) delete w.__fi2HudFocus;
  };
  w.__fi2HudFocus = dispose;
  return dispose;
}
