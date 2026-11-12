// Identity = a server-assigned unique colour + the typed first name (REQUIRED for new clients; normalizeNick below): letters only,
// 2 to 12, owner decision, see docs/multiplayer-design.md. Parties: no animals. Public worlds (relay v2.0): [colour, animal], below.
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

// ---- Relay v2.0 (public worlds, Nov 11 2026): generated names for strangers, [colour, animal] ----
/**
 * The 32 animal nouns of a world name ('Teal Otter'), index = NameIdx[1]. Reviewed Nov 11 2026: every word is a gentle, familiar
 * animal; none is rude or slang in UK / US English, none is scary or a pest, none teases a body shape or a trait (no pig, cow,
 * donkey, monkey, chicken, sloth, snail, whale), and none is a football club's or national team's nickname that could start teasing
 * (no Wolves, Foxes, Lions, Eagles, Magpies, Owls, Canaries, Seagulls, Hornets, Bees, Robins, Swans, Rams, Tigers, Zebras).
 * Exactly RESERVED_NAME_SLOTS long, so every index fits the wire range old and new parsers already accept (0..31).
 */
export const WORLD_ANIMALS: readonly string[] = [
  'Otter', 'Panda', 'Koala', 'Puffin', 'Penguin', 'Seal', 'Hedgehog', 'Rabbit',
  'Hamster', 'Turtle', 'Parrot', 'Flamingo', 'Narwhal', 'Giraffe', 'Llama', 'Alpaca',
  'Butterfly', 'Squirrel', 'Meerkat', 'Lemur', 'Gecko', 'Starfish', 'Seahorse', 'Octopus',
  'Kitten', 'Puppy', 'Pony', 'Lamb', 'Toucan', 'Pelican', 'Chipmunk', 'Ladybird',
];
/** Colours a world name may use: COLOUR_ORDER without Yellow, Peach, Brown, Black and White, so a colour + animal pair can never read
 *  as a remark about skin. 15 colours x 32 animals; the animal alone is unique per world (WORLD_HARD 24 < 32). */
export const WORLD_COLOUR_ORDER: readonly number[] = COLOUR_ORDER.filter((c) => !['Yellow', 'Peach', 'Brown', 'Black', 'White'].includes(NAME_COLOURS[c]));

/** 'Teal Otter' for a world member; a party name (animal slot 0 ignored) reads as the colour only, like nameFor. */
export function worldNameFor(idx: NameIdx): string {
  const c = NAME_COLOURS[idx[0]], a = WORLD_ANIMALS[idx[1]];
  return c && a ? c + ' ' + a : c ?? 'Friend';
}

/**
 * Picks a world name: a random animal nobody in the world has (always possible under WORLD_HARD), and a random colour from
 * WORLD_COLOUR_ORDER, preferring one no member has. Random on every fresh join, so a stranger's name changes every visit.
 * `rand` returns [0,1).
 */
export function pickWorldName(taken: NameIdx[], rand: () => number): NameIdx {
  const usedA = new Set<number>(), usedC = new Set<number>();
  for (const t of taken) { usedA.add(t[1]); usedC.add(t[0]); }
  const pick = (pool: number[]): number => pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];
  const freeA: number[] = [];
  for (let i = 0; i < WORLD_ANIMALS.length; i++) if (!usedA.has(i)) freeA.push(i);
  const freeC = WORLD_COLOUR_ORDER.filter((c) => !usedC.has(c));
  const a = pick(freeA.length ? freeA : WORLD_ANIMALS.map((_s, i) => i));
  const c = pick(freeC.length ? freeC : WORLD_COLOUR_ORDER.slice());
  return [c, a];
}
