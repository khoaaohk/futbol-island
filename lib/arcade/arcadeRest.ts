// Arcade hub rest (heat QA, Oct 22 2026). The hub used to run 60 fps for 12 s after every input (and on entry), then 15 fps forever
// (60 rAF callbacks a second, never asleep). Now: full rate while you move plus a short tail, the 15 fps ambient life (crowd walks,
// attract screens) while you are around; HUB_CALM_S seconds without input the visitors stop starting new walks (one under way finishes
// at a cabinet), and after HUB_REST_S seconds the loop SLEEPS (0 rAF) at the first moment no visitor walks on screen (nobody freezes
// mid-step; a walk off screen does not hold frames). Any input, a friend's pose, an
// emote or the tab coming back wakes it. While it sleeps, the cabinet motifs keep playing from a slow timer (no frames).
/** Seconds of full-rate frames after your last motion / input (was 12 s; your own movement still runs at 60 / 30 fps). */
export const HUB_ACTIVE_TAIL_S = 4;
/** Seconds after entry at the full rate (was 12 s: the camera settles in well under a second). */
export const HUB_ENTRY_ACTIVE_S = 1.5;
/** No input for this long: visitors stop starting new walks (a walk under way finishes at a cabinet), so the hub can settle. */
export const HUB_CALM_S = 12;
/** No input for this long: the hub may sleep (crowd and attract screens hold their last frame). */
export const HUB_REST_S = 20;
/** While asleep, the cabinet motifs' sound tick (ms): one timer, no rendering. */
export const HUB_REST_SOUND_MS = 1300;

export interface HubRestInput {
  /** Seconds since the last input (wake). */ idle: number;
  /** Full-rate window left (s). */ activity: number;
  /** A friend's motion window left (s). */ remoteHold: number;
  /** Something of yours is animating: an emote / its bubble, a ball effect, a knocked visitor, cabinet sparks or glitches. */ busy: boolean;
  /** A visitor is walking inside the camera view. */ walkerInView: boolean;
}
/** Pure: may the hub stop its loop after this frame? */
export function hubCanRest(s: HubRestInput): boolean {
  return s.idle >= HUB_REST_S && s.activity <= 0 && s.remoteHold <= 0 && !s.busy && !s.walkerInView;
}
