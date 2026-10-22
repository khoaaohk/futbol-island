// Identity = a server-assigned unique colour + the typed first name (REQUIRED for new clients; normalizeNick below): letters only,
// 2 to 12, owner decision, see docs/multiplayer-design.md. No animals any more.
import type { NameIdx } from './types';

export const NAME_COLOURS: readonly string[] = [
  'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Teal',
  'Gold', 'Silver', 'Coral', 'Mint', 'Navy', 'Lime', 'Sky', 'Peach',
  'Brown', 'Maroon', 'White', 'Black',
];
/** Wire compatibility only: the roster's NameIdx still has a second slot (it used to be an animal index, 0..31). It is reserved: the relay always sends 0, receivers accept 0..31 and ignore it. */
export const RESERVED_NAME_SLOTS = 32;

/** A friend with no typed name is shown by colour only ('Red'). */
export function nameFor(idx: NameIdx): string {
  return NAME_COLOURS[idx[0]] ?? 'Friend';
}

/** Colour indexes in the order the relay hands them out: the first 6 are the best separated; 20 colours cover the whole party cap, also for colour-blind kids. */
export const COLOUR_ORDER: readonly number[] = [1, 4, 6, 2, 3, 0, 5, 7, 14, 13, 12, 10, 8, 11, 15, 9, 16, 17, 18, 19];
/**
 * Picks the colour for a joiner: always the next free one in COLOUR_ORDER (unique within the party, so rings and dots never clash).
 * The second slot is reserved and always 0. Only if all 20 colours are taken (impossible under the party cap) does it reuse one.
 * `rand` returns [0,1).
 */
export function pickNameWith(taken: NameIdx[], rand: () => number): NameIdx {
  const used = new Set<number>();
  for (const t of taken) used.add(t[0]);
  for (const c of COLOUR_ORDER) if (!used.has(c)) return [c, 0];
  return [Math.min(NAME_COLOURS.length - 1, Math.floor(rand() * NAME_COLOURS.length)), 0];
}

export function pickName(taken: NameIdx[], rand: () => number): NameIdx {
  return pickNameWith(taken, rand);
}

const NICK_RE = /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]{2,12}$/;
const NICK_LETTER_RE = /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]$/;
export const NICK_MAX = 12;

/**
 * The typed first name: trimmed, letters only (A-Z, a-z, Latin-1 accented), 2 to 12 long; first letter upper case, the rest lower.
 * Anything else (digits, spaces, hyphens, symbols, emoji, URLs, wrong types) returns null. Never throws. No block-list by owner decision.
 * Shared by the client and the relay; idempotent.
 */
export function normalizeNick(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > 64) return null;
  const t = raw.trim();
  if (!NICK_RE.test(t)) return null;
  const first = t.charAt(0), up = first.toUpperCase();
  const head = up.length === 1 && NICK_LETTER_RE.test(up) ? up : first;
  const out = head + t.slice(1).toLowerCase();
  return NICK_RE.test(out) && out.length === t.length ? out : null;
}
