/** Phone frame cap for the island render loop (see docs/performance-guide.md, "Phone 30 fps cap").
 *
 * Rendered frames sit on a fixed grid of `interval` ms slots. A rAF callback renders when it reaches the next slot
 * (minus a small tolerance for vsync jitter), and the slot then advances by exactly one interval, so the grid never
 * creeps toward `now` and the rate can never exceed 1000 / interval. After a missed slot (a long frame, a dropped
 * vsync run or waking from sleep) the grid restarts at `now` instead of bursting to catch up.
 *
 * Works for 60 Hz (every 2nd vsync), 90 Hz (every 3rd) and 120 Hz ProMotion (every 4th) timestamps. The simulation's
 * `dt` is still measured from the previous rendered frame's real timestamp, so physics timing does not change. */
export const PHONE_FRAME_MS = 1000 / 30;
/** Early-arrival allowance for jittery timestamps. Well below one 120 Hz vsync (8.3 ms), so the 3rd 120 Hz vsync
 * (25 ms after a slot) can never pass for the 33.3 ms slot. */
export const FRAME_SLOT_TOLERANCE_MS = 3;

/** Returns the slot to store when the frame at `now` should render, or -1 to skip it.
 * `slot` is the value returned for the previous rendered frame (0 before the first one). */
export function frameCapSlot(now: number, slot: number, interval = PHONE_FRAME_MS, tolerance = FRAME_SLOT_TOLERANCE_MS): number {
  if (!(slot > 0) || !Number.isFinite(slot)) return now;
  const gap = now - slot;
  if (gap < interval - tolerance) return -1;
  if (gap < 2 * interval - tolerance) return slot + interval;
  return now;
}
