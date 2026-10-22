// The high five pose layer (user, Oct 22 2026). Kept as the entry point the three players call; the whole-body handshake writer
// (lib/graphics/handshakePose.ts) does the work for high fives, thanks and well played. Call right after `rig.update`; allocates nothing.
import type * as T from 'three';
import {applyHandshake} from './handshakePose';

/**
 * Poses `root` for handshake `v`, half 0 (you / a friend) or 1 (the townsperson), at `age` seconds on the shared clock. `side` is the five
 * arm (+1 right, -1 left); `faceYaw` the heading to turn toward (NaN = keep); `scale` the body's height scale; `gap` the distance to the
 * partner (NaN = none). Returns the sequence's blend 0..1 (0 = nothing was written).
 */
export function applyHighFive(root: T.Object3D, v: number, half: 0 | 1, age: number, side: -1 | 1, faceYaw: number, scale = 1, gap = NaN): number {
  return applyHandshake(root, v, half, age, side, faceYaw, scale, gap);
}
