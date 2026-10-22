// Client-side looks for the server-assigned colours: a hex colour per NAME_COLOURS entry (same order). Pure table, no storage. Hex values are Okabe-Ito-leaning and readable on grass, sand and sea; the relay hands colours out
// in COLOUR_ORDER (protocol/names.ts) so a party of up to 6 always gets the six best-separated ones.
import { NAME_COLOURS } from '../../multiplayer/protocol';

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

export const colourHex = (idx: number): string => COLOUR_HEX[idx] ?? '#FFFFFF';
export const colourName = (idx: number): string => NAME_COLOURS[idx] ?? 'Friend';
