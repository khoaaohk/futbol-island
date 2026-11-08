// Jetpack idle gestures (owner, Nov 8 2026: "when flying and idled like this, animate the character to wave his and do a few variations with the hands").
// Hovering on the jetpack with no input for IDLE_DELAY s starts a little loop of arm gestures: a friendly wave first, then seeded-random variations
// (never the same one twice in a row), each GESTURE_SECONDS long with an eased blend, separated by GAP_MIN..GAP_MAX s of the normal hover pose.
// Anything else (input, boost, swim, ball, emote, another pose) blends the gesture out in CANCEL_FADE s. Reduced motion: no gestures.
// Pure state, no three.js / DOM; one state object per character, mutated in place (no allocation per frame). Posed by lib/graphics/jetpackIdlePose.ts.
// Friends: lib/graphics/remoteAvatars.ts runs the same machine on their mode + speed (already in the pose frame), so no new network fields.
export const IDLE_GESTURE = {Wave: 0, BothWave: 1, FistPump: 2, Swirl: 3, Salute: 4, Hips: 5, Cheer: 6} as const;
export const IDLE_GESTURE_COUNT = 7;
/** Seconds of each gesture, by IDLE_GESTURE id. */
export const GESTURE_SECONDS: readonly number[] = [2.6, 2.4, 2, 3, 2, 2.6, 2.2];
export const IDLE_DELAY = 2.5, GAP_MIN = 2, GAP_MAX = 4, BLEND_IN = .35, BLEND_OUT = .35, CANCEL_FADE = .15;
/** Below this ground speed (m/s) the hover counts as idle. */
export const IDLE_SPEED = .3;

export interface IdleWave {
  /** Seconds idle so far (0 when not idle). */ idle: number;
  /** The gesture playing (-1 none), its age and length (s). */ kind: number; age: number; dur: number;
  /** Seconds of plain hover still to wait before the next gesture. */ gap: number;
  /** The last gesture played this idle spell (-1 none): the next one never repeats it. */ last: number;
  /** The weight to pose with (0..1). */ w: number;
  /** Fading out after a cancel. */ fading: boolean;
  /** The seeded random state. */ seed: number;
}
export function createIdleWave(seed = 1): IdleWave {
  return {idle: 0, kind: -1, age: 0, dur: 0, gap: 0, last: -1, w: 0, fading: false, seed: (seed >>> 0) || 1};
}
/** Seeded random in [0, 1) (mulberry32), advancing the state in place. */
export function idleRandom(s: IdleWave): number {
  s.seed = (s.seed + 0x6D2B79F5) >>> 0;
  let t = s.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
/** The next gesture: a wave to open the spell, then any other gesture but `last` (never the same twice in a row). */
export function pickGesture(last: number, r: number): number {
  if (last < 0) return IDLE_GESTURE.Wave;
  const k = Math.min(IDLE_GESTURE_COUNT - 2, Math.floor(r * (IDLE_GESTURE_COUNT - 1)));
  return k >= last ? k + 1 : k;
}
const smooth = (v: number) => { const t = v < 0 ? 0 : v > 1 ? 1 : v; return t * t * (3 - 2 * t); };
/**
 * One frame. `idleOk` = on the jetpack, hovering (cruise), no movement / boost input, near-zero speed and nothing else posing the arms.
 * Returns the gesture weight (also in s.w); s.kind / s.age say which gesture and where in it.
 */
/* Nov 8 2026 QA (cancel measured ~0.5 s wall-clock, spec 0.15 s): the frame dt is clamped to FRAME_DT_MAX (1/15 s), so on a slow or
 * throttled frame game time runs behind the clock and the 0.15 s fade stretched. `wallDt` (the real, unclamped frame time) drives the
 * cancel fade, so the weight reaches 0 within CANCEL_FADE of real time on any frame rate. Defaults to dt. */
export function stepIdleWave(s: IdleWave, dt: number, idleOk: boolean, reduced: boolean, wallDt: number = dt): number {
  if (!idleOk || reduced) {
    s.idle = 0; s.last = -1; s.gap = 0;
    if (s.kind >= 0 && !reduced) { s.fading = true; s.age += dt; s.w = Math.max(0, s.w - Math.max(dt, wallDt) / CANCEL_FADE); if (s.w > 0) return s.w; }
    s.kind = -1; s.w = 0; s.fading = false; return 0;
  }
  if (s.fading) { s.fading = false; s.kind = -1; s.w = 0; }
  s.idle += dt;
  if (s.kind < 0) {
    if (s.idle < IDLE_DELAY) return s.w = 0;
    if (s.gap > 0) { s.gap -= dt; return s.w = 0; }
    s.kind = pickGesture(s.last, idleRandom(s)); s.age = 0; s.dur = GESTURE_SECONDS[s.kind];
  } else s.age += dt;
  if (s.age >= s.dur) { s.last = s.kind; s.kind = -1; s.gap = GAP_MIN + (GAP_MAX - GAP_MIN) * idleRandom(s); return s.w = 0; }
  return s.w = Math.min(smooth(s.age / BLEND_IN), smooth((s.dur - s.age) / BLEND_OUT));
}
