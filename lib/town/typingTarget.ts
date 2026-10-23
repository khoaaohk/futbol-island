/**
 * Game hotkeys never fire while the player types in a text box (E2E finding, Oct 22 2026, scripts/check-mp-e2e.cjs): the island's
 * window keydown handler read every key, so typing a first name in the party card ("Rory": R cycles the ride, E talks to a nearby
 * townsperson) or a party code with an M (opens the map over the Join card) drove the game behind the card. Phone soft keyboards
 * send the same keydown events. Pure: tests/typing-keys.cjs.
 */
const NON_TEXT = new Set(['button', 'checkbox', 'radio', 'range', 'color', 'file', 'image', 'reset', 'submit']);
export function typingTarget(t: EventTarget | null): boolean {
  const el = t as { tagName?: string; type?: string; isContentEditable?: boolean } | null;
  if (!el || typeof el.tagName !== 'string') return false;
  const tag = el.tagName.toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') return !NON_TEXT.has(String(el.type || 'text').toLowerCase());
  return el.isContentEditable === true;
}
