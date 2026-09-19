export const JUMP_V = 15;
const GRAVITY = -42;
const RESTITUTION = 0.32;
const MIN_BOUNCE_V = 2.5;

export interface JumpState { y: number; vy: number; jumping: boolean }

/** Mutate the pooled player state; return landing speed for visual/audio feedback. */
export function stepJump(state: JumpState, dt: number): number {
  if (!state.jumping) return 0;
  state.vy += GRAVITY * dt;
  state.y += state.vy * dt;
  if (state.y > 0 || state.vy >= 0) return 0;
  const impact = -state.vy;
  state.y = 0;
  if (impact > MIN_BOUNCE_V) state.vy = impact * RESTITUTION;
  else { state.vy = 0; state.jumping = false; }
  return impact;
}

export function smoothLane(current: number, target: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-12 * dt));
}

/** Swept interval catches collectibles even when an entire pickup is crossed in one step. */
export function crossesPickup(previousZ: number, nextZ: number) {
  return previousZ >= -0.9 && nextZ <= 0.9;
}

export function goalPoints(boosting: boolean, streak: number) {
  return (boosting ? 500 : 150) * Math.max(1, Math.min(3, streak));
}
