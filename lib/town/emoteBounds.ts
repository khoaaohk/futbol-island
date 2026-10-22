// Emote bounds (user, Oct 22 2026: "let's not have any emotes leave the screen because it impacts the zoom"). Every emote, for you, a friend and a
// townsperson, must stay inside this envelope so the emote camera (emoteCameraMath.ts) can frame the pair tightly and nothing leaves the frame.
// Pure constants + checks; tests sample each emote's poses and ball paths against them.
export const EMOTE_BOUNDS = {
  /** Largest horizontal distance (m) a character's root may travel from where its emote started (hops, slides, spins in place included). */
  rootRadius: 1.4,
  /** Largest gap (m) between the two characters of a pair emote while it plays (centre to centre). */
  pairMaxGap: 4.5,
  /** Highest point (m above the ground) of a body part or the ball: jumps, flips, juggles. */
  maxHeight: 3.2,
  /** The ball may travel at most this far (m) from the midpoint of the pair. */
  ballRadius: 3.0,
} as const;
export const withinRoot = (dx: number, dz: number): boolean => Math.hypot(dx, dz) <= EMOTE_BOUNDS.rootRadius + 1e-9;
export const withinPair = (gap: number): boolean => gap <= EMOTE_BOUNDS.pairMaxGap + 1e-9;
