// High five (user, Oct 22 2026): the ten variations, plus THANKS and WELL PLAYED, are now full-body handshake choreographies in
// lib/town/emoteHandshakes.ts ("the handshakes need to be like the arcade ones where it's more complex"). This module keeps the API the
// three players already call (you in Town.tsx, townsfolk in islandNpcs.ts, friends in remoteAvatars.ts): a variation `v` is a GLOBAL
// handshake index (0..9 high fives, 10..14 thanks, 15..19 well played), so `HIGH_FIVES[v]`, the hits, the spark and the pose all work
// for the three emotes. Pure; no allocation after module load.
import {EMOTE} from './emoteReact';
import {HANDSHAKES, HIGH_FIVE_SEQS, HS_STRIDE, createHsBag, createHsBags, handshakePlan, hsEnvelope, nextInBag, sampleHandshake, type HandshakeDef, type HsBag, type HsBags} from './emoteHandshakes';

export const HF_COUNT = HIGH_FIVE_SEQS.length, HF_STRIDE = HS_STRIDE;
export type HighFiveDef = HandshakeDef;
/** Old arcade-window type (the full-body keys own the rig now; no variation has windows). */
export interface HfSeg { type: 'highFive' | 'fistBump'; t0: number; dur: number; side: 1 | -1 }
/** Every handshake by global index (the first HF_COUNT are the high fives). */
export const HIGH_FIVES: readonly HighFiveDef[] = HANDSHAKES;
export const HF_FADE = .2;
export const hfEnvelope = hsEnvelope;
export const sampleKeys = sampleHandshake;
/** The arcade skill windows are gone (whole-body keys instead): always 0 / false, kept so the callers stay unchanged. */
export const segBlend = (d: HighFiveDef, age: number): number => { void d; void age; return 0; };
export function highFiveSkill(out: {type: HfSeg['type']; progress: number; side: 1 | -1}, v: number, half: 0 | 1, age: number): boolean { void out; void v; void half; void age; return false; }

/** Index of the hit crossed while the clock went from `from` (exclusive) to `to` (inclusive), or -1. */
export function hitCrossed(d: HighFiveDef, from: number, to: number): number {
  for (let i = 0; i < d.hits.length; i++) if (d.hits[i] > from && d.hits[i] <= to) return i;
  return -1;
}

/** Shuffled bags (one per handshake emote): every variation before a repeat, never the same twice in a row. In place, no allocation. */
export interface HighFiveBag extends HsBag { bags: HsBags }
export function createHighFiveBag(): HighFiveBag { return {...createHsBag(HF_COUNT), bags: createHsBags()}; }
/** The next high five (0..9) from the bag. */
export const nextHighFive = (rand: () => number, bag: HighFiveBag): number => nextInBag(rand, bag);
/** Which handshake plays for an emote: -1 = none (not High five / Thanks / Well played, or reduced motion: just the bubble and a single raised arm). */
export function highFivePlan(emote: number, reduced: boolean, rand: () => number, bag: HighFiveBag): number {
  return handshakePlan(emote, reduced, rand, bag.bags, bag);
}
/** Seconds the sequence runs (the pose and bubble last this long). */
export const highFiveSeconds = (v: number): number => HIGH_FIVES[v].duration;
/** True when `v` is one of the high fives (not a thanks / well played). */
export const isHighFiveVariation = (v: number): boolean => v >= 0 && v < HF_COUNT && HANDSHAKES[v].emote === EMOTE.HighFive;

/** Character height (m, at scale 1) the `hitY` fractions are taken from. */
export const HF_BODY_HEIGHT = 1.75;
/**
 * Where the spark ring pops at hit `hit`: the midpoint between the two characters (a at ax,ay,az; b the partner), or, with no
 * partner, an "air five" a little in front of the player toward `faceYaw` (the camera side). Writes `out`, allocates nothing.
 */
export function sparkPoint(out: {x: number; y: number; z: number}, d: HighFiveDef, hit: number, ax: number, ay: number, az: number, aScale: number,
  hasB: boolean, bx: number, by: number, bz: number, bScale: number, faceYaw: number): void {
  const f = d.hitY[Math.max(0, Math.min(d.hitY.length - 1, hit))] * HF_BODY_HEIGHT;
  if (hasB) { out.x = (ax + bx) / 2; out.z = (az + bz) / 2; out.y = (ay + f * aScale + by + f * bScale) / 2; }
  else { out.x = ax + Math.sin(faceYaw) * .55; out.z = az + Math.cos(faceYaw) * .55; out.y = ay + f * aScale; }
}
