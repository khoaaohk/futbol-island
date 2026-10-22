// Emote camera: the pure rules (user, Oct 22 2026: "when the emote happens have it animate and zoom in to see it better ... when done zoom
// back out"). Framing math, start / cancel rules and the numbers. No three.js, no DOM, no allocation (callers pass the output objects).
export interface V3 {x: number; y: number; z: number}

export const EMOTE_CAM = {
  /** Ease in / out (s): the in-ease is 0.35-0.5 s, the way back 0.4-0.6 s. */
  inSeconds: .45, outSeconds: .5,
  /** Three-quarter view: heading (rad, the follow camera sits at atan2(16, 33) = .45) and pitch above the horizon (rad). */
  yaw: .62, pitch: .36,
  /** The camera's vertical field of view (deg, Town's follow camera). */
  fov: 40,
  /** Closest / farthest the camera sits from the framed point (m). Farther than `maxDist` is no real zoom (the follow camera sits ~43 m away). */
  minDist: 3.7, maxDist: 15,
  /** Tried in order when something stands between the camera and the characters: a gentler zoom (distance x factor). */
  shrink: [1, 1.35, 1.8] as readonly number[],
  /** Rapid taps do not pump the camera: no new zoom for this long after one ends. */
  cooldown: .6,
  /** The follow camera is already this close (m): indoors / arcade / shop rooms use their own cameras, so skip. */
  closeCameraDist: 14,
  /** The characters' framed height (m): chest-high target, room for raised hands, a hop and the feet. */
  halfHeight: 1.6, targetLift: 1.05,
  /** A character's half width including the arms out (m). */
  halfWidth: .85,
} as const;

const C = Math.cos(EMOTE_CAM.pitch);
/** The camera-to-subject direction (unit). */
const DIR: V3 = {x: Math.sin(EMOTE_CAM.yaw) * C, y: Math.sin(EMOTE_CAM.pitch), z: Math.cos(EMOTE_CAM.yaw) * C};
const TAN_V = Math.tan(EMOTE_CAM.fov * Math.PI / 360);
export const emoteDir = (): V3 => ({x: DIR.x, y: DIR.y, z: DIR.z});

/**
 * The close three-quarter framing for the player at (px, py, pz) and, when `hasQ`, the partner at (qx, qy, qz): `target` is the middle
 * of the two (chest high), `eye` sits `dist` metres from it along the view direction. Both characters fit inside the frame at
 * `aspect` (width / height) for the returned distance (unless it hits `maxDist`). `factor` > 1 is a gentler zoom. Returns the distance.
 */
export function frameEmote(out: {eye: V3; target: V3}, px: number, py: number, pz: number, hasQ: boolean, qx: number, qy: number, qz: number, aspect: number, factor = 1): number {
  const mx = hasQ ? (px + qx) / 2 : px, mz = hasQ ? (pz + qz) / 2 : pz, my = (hasQ ? (py + qy) / 2 : py) + EMOTE_CAM.targetLift;
  // Half the characters' spread across the screen (the camera's right vector is (cos yaw, 0, -sin yaw)) plus their own half width.
  const spread = hasQ ? Math.abs((qx - px) * Math.cos(EMOTE_CAM.yaw) - (qz - pz) * Math.sin(EMOTE_CAM.yaw)) / 2 : 0;
  const rise = hasQ ? Math.abs(qy - py) / 2 : 0;
  // The nearer character sits closer to the camera (bigger, lower on screen): add their depth offset.
  const fwd = hasQ ? Math.abs((qx - px) * Math.sin(EMOTE_CAM.yaw) + (qz - pz) * Math.cos(EMOTE_CAM.yaw)) / 2 : 0;
  const dv = (EMOTE_CAM.halfHeight + rise + fwd * .5) / TAN_V + fwd, dh = (spread + EMOTE_CAM.halfWidth) * 1.1 / (TAN_V * Math.max(.3, aspect)) + fwd;
  const dist = Math.min(EMOTE_CAM.maxDist, Math.max(EMOTE_CAM.minDist, dv, dh)) * Math.max(1, factor);
  out.target.x = mx; out.target.y = my; out.target.z = mz;
  out.eye.x = mx + DIR.x * dist; out.eye.y = my + DIR.y * dist; out.eye.z = mz + DIR.z * dist;
  return dist;
}

/** Does a point at offset (dx, dy, dz) from the camera target land inside the frame at `dist` / `aspect`? */
export function insideFrame(dx: number, dy: number, dz: number, dist: number, aspect: number): boolean {
  const right = dx * Math.cos(EMOTE_CAM.yaw) - dz * Math.sin(EMOTE_CAM.yaw);
  const up = dy * Math.cos(EMOTE_CAM.pitch) - (dx * Math.sin(EMOTE_CAM.yaw) + dz * Math.cos(EMOTE_CAM.yaw)) * Math.sin(EMOTE_CAM.pitch);
  const depth = dist - (dx * DIR.x + dy * DIR.y + dz * DIR.z);
  if (depth <= .1) return false;
  return Math.abs(right) <= depth * TAN_V * aspect && Math.abs(up) <= depth * TAN_V;
}

/** What the island knows when an emote starts / while it runs. */
export interface EmoteCamState {
  reduced: boolean;
  /** Anything but walking on foot: a ride, a vehicle, a zipline. */
  riding: boolean; swimming: boolean; flying: boolean;
  inJob: boolean; cutscene: boolean; lesson: boolean;
  /** A menu, dialog, map, shop or the Explore room is open (Town's `active` is false). */
  menuOpen: boolean;
  /** Any movement input (stick, keys). */
  moving: boolean;
  /** The distance from the follow camera to the player (m). */
  cameraDist: number;
}
/** Why the zoom must not run (or must stop at once): '' = it may run. Reduced motion: no zoom at all, just the bubble. */
export function emoteCamBlocked(s: EmoteCamState): string {
  if (s.reduced) return 'reduced';
  if (s.riding) return 'riding';
  if (s.swimming) return 'swimming';
  if (s.flying) return 'flying';
  if (s.inJob) return 'job';
  if (s.cutscene) return 'cutscene';
  if (s.lesson) return 'lesson';
  if (s.menuOpen) return 'menu';
  if (s.moving) return 'moving';
  return '';
}
/** To START: the cancel rules plus "the camera is already close" (an indoor / room camera). */
export const emoteCamSkip = (s: EmoteCamState): string => emoteCamBlocked(s) || (s.cameraDist < EMOTE_CAM.closeCameraDist ? 'close' : '');
