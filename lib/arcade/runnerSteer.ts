/** Breakaway Run stick steering (owner, Oct 27 2026: "the joystick instead [of the left/right buttons] to match the other games").
 *  The runner has three discrete lanes with a spring between them (runnerGame tickRunner), so the stick is not analog: pushing
 *  past ON steps one lane that way, holding it there steps again every REPEAT seconds (left lane → right lane in one push), and
 *  the stick must come back inside OFF before the same side fires again. The x input is the shaped stick value
 *  (lib/town/walkControl shapeStick), so Strikers' radial dead zone applies first. */
export const RUNNER_STEER = { on: .5, off: .3, repeat: .3 } as const;

export type RunnerSteerState = { dir: number; at: number };
export const runnerSteerState = (): RunnerSteerState => ({ dir: 0, at: 0 });

/** Feed the stick x (−1…1) and the time in seconds; returns the lane step to apply now (−1, 0 or 1). */
export function runnerSteer(s: RunnerSteerState, x: number, now: number): number {
  const want = x >= RUNNER_STEER.on ? 1 : x <= -RUNNER_STEER.on ? -1 : Math.abs(x) < RUNNER_STEER.off ? 0 : s.dir;
  if (want === 0) { s.dir = 0; return 0; }
  if (want !== s.dir) { s.dir = want; s.at = now; return want; }
  if (Math.abs(x) >= RUNNER_STEER.on && now - s.at >= RUNNER_STEER.repeat) { s.at = now; return want; }
  return 0;
}
