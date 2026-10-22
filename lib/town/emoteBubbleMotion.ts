// The emote emoji above a character (user, Oct 22 2026: "the emoji icons above it should animate and dissipate into the air. remove the round
// background"). Pure timeline, no three.js: one COPY of the emoji pops in (a small overshoot), floats up with a sway, then dissipates (fades with a
// slight upward drift and a touch of growth). A 4 s emote emits several copies ~0.8 s apart. Reduced motion: no float, a brief fade in / out.
export const BUBBLE_LIFE = 1.7, BUBBLE_GAP = .8, BUBBLE_COPIES = 4, BUBBLE_POP = .22, BUBBLE_FADE_AT = .95;
export interface BubbleFrame {visible: boolean; dx: number; dy: number; scale: number; opacity: number}
const easeOutBack = (t: number) => { const c1 = 1.70158, c3 = c1 + 1, u = t - 1; return 1 + c3 * u * u * u + c1 * u * u; };
/** The start time (s after the emote began) of copy `i` for an emote of `seconds`, or -1 when that copy is not emitted. */
export function copyStart(i: number, seconds: number): number {
  const t = i * BUBBLE_GAP;
  return i < BUBBLE_COPIES && (i === 0 || t <= seconds - BUBBLE_GAP) ? t : -1;
}
/** How many copies an emote of `seconds` emits (1 for a short one, up to 4 for ~4 s). */
export const copyCount = (seconds: number): number => { let n = 0; while (n < BUBBLE_COPIES && copyStart(n, seconds) >= 0) n++; return n; };
/** One copy at `age` s since it started (`phase` varies the sway per copy). Writes `out` and returns it (no allocation). */
export function bubbleFrame(age: number, phase: number, reduced: boolean, out: BubbleFrame, life = BUBBLE_LIFE): BubbleFrame {
  if (age < 0 || age >= life) { out.visible = false; out.dx = out.dy = 0; out.scale = 1; out.opacity = 0; return out; }
  out.visible = true;
  if (reduced) { out.dx = out.dy = 0; out.scale = 1; out.opacity = Math.max(0, Math.min(1, age / .15, (life - age) / .25)); return out; }
  const pop = Math.min(1, age / BUBBLE_POP), fade = age > BUBBLE_FADE_AT ? (age - BUBBLE_FADE_AT) / Math.max(.2, life - BUBBLE_FADE_AT) : 0;
  out.scale = (age < BUBBLE_POP ? easeOutBack(pop) : 1) * (1 + .3 * fade * fade);
  out.dy = .5 * age + .35 * fade * fade; // floats up, then drifts a little faster as it dissipates
  out.dx = .12 * Math.sin(age * 4.2 + phase) * Math.min(1, age / .5);
  out.opacity = Math.min(1, age / .08) * (1 - fade * fade * (3 - 2 * fade)); // quick fade in, smooth fade out
  return out;
}
/** A friend's avatar has ONE sprite: it repeats the same copy through the emote, each cycle ~1.7 s so the last one dissipates exactly as the emote ends. */
export function cycleFrame(age: number, seconds: number, reduced: boolean, out: BubbleFrame): BubbleFrame {
  if (reduced) return bubbleFrame(age, 0, true, out, Math.max(.5, seconds));
  const n = Math.max(1, Math.round(seconds / BUBBLE_LIFE)), life = seconds / n, k = Math.min(n - 1, Math.floor(age / life));
  return bubbleFrame(age - k * life, k * 1.7, false, out, life);
}
