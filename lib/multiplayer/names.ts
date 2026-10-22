// Client-side looks for the server-assigned names: a hex colour per NAME_COLOURS entry (same order) and an emoji per NAME_ANIMALS
// entry. Pure tables, no storage. Hex values are Okabe-Ito-leaning and readable on grass, sand and sea; the relay hands colours out
// in COLOUR_ORDER (protocol/names.ts) so a party of up to 6 always gets the six best-separated ones.
import { NAME_ANIMALS, NAME_COLOURS } from '../../multiplayer/protocol';

export const COLOUR_HEX: readonly string[] = [
  '#D62828', // Red
  '#0072B2', // Blue
  '#009E73', // Green
  '#F0E442', // Yellow
  '#E69F00', // Orange
  '#7B3FA0', // Purple
  '#CC79A7', // Pink
  '#1B9AAA', // Teal
  '#B8860B', // Gold
  '#AEB7C0', // Silver
  '#FF6F61', // Coral
  '#7FD8B0', // Mint
  '#1D2F6F', // Navy
  '#8BC34A', // Lime
  '#56B4E9', // Sky
  '#FFB997', // Peach
];

export const ANIMAL_GLYPH: readonly string[] = [
  '\u{1F993}', '\u{1F43C}', '\u{1F428}', '\u{1F9A6}', '\u{1F98A}', '\u{1F42F}', '\u{1F981}', '\u{1F99B}', // Zebra Panda Koala Otter Fox Tiger Lion Hippo
  '\u{1F992}', '\u{1F427}', '\u{1F42C}', '\u{1F422}', '\u{1F430}', '\u{1F989}', '\u{1F985}', '\u{1F426}', // Giraffe Penguin Dolphin Turtle Rabbit Owl Eagle Falcon
  '\u{1F99C}', '\u{1F435}', '\u{1F42B}', '\u{1F999}', '\u{1F9AD}', '\u{1F433}', '\u{1F98E}', '\u{1F438}', // Parrot Monkey Camel Llama Seal Whale Gecko Frog
  '\u{1F43B}', '\u{1F43A}', '\u{1F98C}', '\u{1F9A1}', '\u{1F9AB}', '\u{1F994}', '\u{1F986}', '\u{1F412}', // Bear Wolf Moose Badger Beaver Hedgehog Puffin Lemur
];

export const colourHex = (idx: number): string => COLOUR_HEX[idx] ?? '#FFFFFF';
export const colourName = (idx: number): string => NAME_COLOURS[idx] ?? 'Friend';
export const animalName = (idx: number): string => NAME_ANIMALS[idx] ?? 'Friend';
export const animalGlyph = (idx: number): string => ANIMAL_GLYPH[idx] ?? '';
