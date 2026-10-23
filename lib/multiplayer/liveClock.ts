// Live feel (Oct 23 2026): puts every S.Live snapshot on the SENDER's timeline and picks the render delay.
// A relay v1.2 stamps each pose / ball with its relay clock (t) and age, so a snapshot's local time is
//   t - age + offset, offset = the smallest (localNow - t) seen (the fastest frame), creeping up slowly for clock drift.
// Frames that arrive late (jitter) no longer bunch: their snapshots keep their real spacing. The render delay covers the relay's
// half-tick wait (<= 100 ms), one sender interval (100 ms) and the measured jitter, and slews gently (no visible time jump).
// An old relay (no S.Live): snapshots are stamped on arrival and the delay is LEGACY_DELAY_MS, long enough for a 5 Hz sender
// behind a 5 Hz relay (a snapshot can be up to 400 ms after the previous one), so the friend never runs out of snapshots and
// stops / snaps (the old 250 ms delay ran out every few frames: the "regular small jumps").
export const LIVE_BASE_DELAY_MS = 240;
export const LIVE_MIN_DELAY_MS = 230;
export const LIVE_MAX_DELAY_MS = 500;
export const LEGACY_DELAY_MS = 380;
/** How fast the offset may creep up (ms per ms): 0.05 % (0.5 ms a second) covers real clock drift and a route that got slower. */
const DRIFT = 0.0005;
/** The delay moves toward its target at most this fast (ms per ms of real time): a 4 % slow-down / speed-up, not a jump. */
const SLEW = 0.04;

export interface LiveClock {
  /** Local time (same base as localNow) of a snapshot the relay stamped `ageMs` before its clock `serverT`; frames arrive at localNow. */
  map(serverT: number, ageMs: number, localNow: number): number;
  /** The render delay to use now (ms); slews toward the target. */
  delay(localNow: number): number;
  /** True once an S.Live arrived (a v1.2 relay); false again after reset(). */
  readonly live: boolean;
  /** The jitter estimate (ms). */
  readonly jitter: number;
  reset(): void;
}

export function createLiveClock(): LiveClock {
  let live = false, off = 0, lastAt = 0, jit = 0, cur = LEGACY_DELAY_MS, curAt = -1;
  const target = () => (live ? Math.min(LIVE_MAX_DELAY_MS, Math.max(LIVE_MIN_DELAY_MS, LIVE_BASE_DELAY_MS + jit)) : LEGACY_DELAY_MS);
  return {
    map(serverT, ageMs, localNow) {
      const o = localNow - serverT;
      if (!live) { live = true; off = o; jit = 0; } // the delay slews from the legacy value (delay())
      else {
        off = Math.min(o, off + DRIFT * Math.max(0, localNow - lastAt));
        const j = o - off; // how late this frame is against the fastest one
        jit = j > jit ? j : jit + (j - jit) * 0.02; // peaks at once, decays over ~50 frames (5 s)
      }
      lastAt = localNow;
      return serverT - ageMs + off;
    },
    delay(localNow) {
      const want = target();
      if (curAt < 0) { cur = want; curAt = localNow; return cur; }
      const step = SLEW * Math.max(0, Math.min(100, localNow - curAt));
      curAt = localNow;
      cur = want > cur ? Math.min(want, cur + step) : Math.max(want, cur - step);
      return cur;
    },
    get live() { return live; },
    get jitter() { return jit; },
    reset() { live = false; off = 0; jit = 0; cur = LEGACY_DELAY_MS; curAt = -1; lastAt = 0; },
  };
}

/** The page's one clock (the island and a room page share the party connection, so they share its timeline). */
export const liveClock: LiveClock = createLiveClock();
