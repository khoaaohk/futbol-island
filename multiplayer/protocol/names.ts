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

/** Returns an unused (colour, animal) pair; `rand` returns [0,1). Falls back to any pair if all 512 are taken. */
export function pickName(taken: NameIdx[], rand: () => number): NameIdx {
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
