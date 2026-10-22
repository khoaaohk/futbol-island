// Reviewed, kid-friendly name parts. Clients only ever send indexes; nobody can type a name.
import type { NameIdx } from './types';

export const NAME_COLOURS: readonly string[] = [
  'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Teal',
  'Gold', 'Silver', 'Coral', 'Mint', 'Navy', 'Lime', 'Sky', 'Peach',
];
export const NAME_ANIMALS: readonly string[] = [
  'Zebra', 'Panda', 'Koala', 'Otter', 'Fox', 'Tiger', 'Lion', 'Hippo',
  'Giraffe', 'Penguin', 'Dolphin', 'Turtle', 'Rabbit', 'Owl', 'Eagle', 'Falcon',
  'Parrot', 'Monkey', 'Camel', 'Llama', 'Seal', 'Whale', 'Gecko', 'Frog',
  'Bear', 'Wolf', 'Moose', 'Badger', 'Beaver', 'Hedgehog', 'Puffin', 'Lemur',
];

export function nameFor(idx: NameIdx): string {
  const c = NAME_COLOURS[idx[0]];
  const a = NAME_ANIMALS[idx[1]];
  return c && a ? c + ' ' + a : 'Friend';
}

/** Colour indexes in the order the relay hands them out: the first 6 (the party cap) are the best separated, also for colour-blind kids. */
export const COLOUR_ORDER: readonly number[] = [1, 4, 6, 2, 3, 0, 5, 7, 14, 13, 12, 10, 8, 11, 15, 9];
/** The friendly subset the join picker shows (indexes into NAME_ANIMALS); the server accepts any of the 32. */
export const PICKER_ANIMALS: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 23, 24];

/** Is `n` a valid animal index (0..NAME_ANIMALS.length-1)? */
export function validAnimal(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < NAME_ANIMALS.length;
}

/**
 * Picks a name for a joiner. The COLOUR is always the next free one in COLOUR_ORDER (unique within the party, so rings and dots
 * never clash); the animal is `animalWanted` when valid (two kids may share an animal), else a random one. Only if all 16 colours
 * are taken (impossible under the party cap) does it fall back to any unused pair. `rand` returns [0,1).
 */
export function pickNameWith(taken: NameIdx[], rand: () => number, animalWanted?: number | null): NameIdx {
  const nA = NAME_ANIMALS.length;
  const usedColours = new Set<number>();
  for (const t of taken) usedColours.add(t[0]);
  for (const c of COLOUR_ORDER) {
    if (usedColours.has(c)) continue;
    const a = validAnimal(animalWanted) ? animalWanted : Math.min(nA - 1, Math.floor(rand() * nA));
    return [c, a];
  }
  return pickAnyPair(taken, rand);
}

/** Old behaviour (no animal wish). */
export function pickName(taken: NameIdx[], rand: () => number): NameIdx {
  return pickNameWith(taken, rand, null);
}

function pickAnyPair(taken: NameIdx[], rand: () => number): NameIdx {
  const nA = NAME_ANIMALS.length;
  const total = NAME_COLOURS.length * nA;
  const used = new Set<number>();
  for (const t of taken) used.add(t[0] * nA + t[1]);
  const free = total - used.size;
  if (free <= 0) {
    const k = Math.min(total - 1, Math.floor(rand() * total));
    return [Math.floor(k / nA), k % nA];
  }
  let k = Math.min(free - 1, Math.floor(rand() * free));
  for (let i = 0; i < total; i++) {
    if (used.has(i)) continue;
    if (k === 0) return [Math.floor(i / nA), i % nA];
    k--;
  }
  return [0, 0];
}
