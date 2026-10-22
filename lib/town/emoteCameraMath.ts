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
  minDist: 3.2, maxDist: 18,
  /** Back the fitted distance off a little (user, Oct 22 2026: "for the emote zoom out just a bit more"). */
  backoff: 1.6,
  /** Tried in order when something stands between the camera and the characters: a gentler zoom (distance x factor). */
  shrink: [1, 1.35, 1.8] as readonly number[],
  /** Rapid taps do not pump the camera: no new zoom for this long after one ends. */
  cooldown: .6,
  /** The follow camera is already this close (m): indoors / arcade / shop rooms use their own cameras, so skip. */
  closeCameraDist: 14,
  /** The characters' framed top (raised hands, a hop) and feet (m), the target lift and the room kept for the HUD / controls (multipliers). */
  top: 2.45, feet: -.1, targetLift: 1.15, marginH: 1.12, marginV: 1.3,
  /** Riding (scooter / bike / moped): the emote keeps going up to this speed (m/s); turning faster than `rideSteer` (rad/s) ends it; the characters are this much wider (m). */
  rideMaxSpeed: 16, rideSteer: 1.8, rideWide: .5,
  /** A character's half width including the arms out (m). */
  halfWidth: .85,
} as const;

const COS_P = Math.cos(EMOTE_CAM.pitch), SIN_P = Math.sin(EMOTE_CAM.pitch);
const TAN_V = Math.tan(EMOTE_CAM.fov * Math.PI / 360);
/** The camera-to-subject direction (unit) for a heading `yaw`. */
export const emoteDir = (yaw: number = EMOTE_CAM.yaw): V3 => ({x: Math.sin(yaw) * COS_P, y: SIN_P, z: Math.cos(yaw) * COS_P});

/**
 * The close framing for the player at (px, py, pz) and, when `hasQ`, the partner at (qx, qy, qz), seen from heading `yaw`: `target` is the
 * middle of the two, `eye` sits the returned distance from it. The distance is solved exactly: the feet and the raised hands (top corners,
 * `halfWidth` + `wide` either side) of BOTH characters stay inside the frame at `aspect` (width / height), with room for the HUD above and the
 * controls below. `factor` > 1 is a gentler zoom, `wide` (m) widens each character (a rider and the vehicle).
 */
export function frameEmote(out: {eye: V3; target: V3}, px: number, py: number, pz: number, hasQ: boolean, qx: number, qy: number, qz: number, aspect: number, factor = 1, yaw: number = EMOTE_CAM.yaw, wide = 0, pitch: number = EMOTE_CAM.pitch): number {
  const COS_P = Math.cos(pitch), SIN_P = Math.sin(pitch);
  const mx = hasQ ? (px + qx) / 2 : px, mz = hasQ ? (pz + qz) / 2 : pz, my = (hasQ ? (py + qy) / 2 : py) + EMOTE_CAM.targetLift;
  const sy = Math.sin(yaw), cy = Math.cos(yaw), dx0 = sy * COS_P, dz0 = cy * COS_P, hw = EMOTE_CAM.halfWidth + wide, a = Math.max(.3, aspect);
  let need: number = EMOTE_CAM.minDist;
  for (let c = 0; c < (hasQ ? 2 : 1); c++) {
    const ox = (c ? qx : px) - mx, oz = (c ? qz : pz) - mz, oy = (c ? qy : py) - (my - EMOTE_CAM.targetLift);
    for (let i = 0; i < 4; i++) {
      const side = i & 1 ? 1 : -1, y = (i & 2 ? EMOTE_CAM.top : EMOTE_CAM.feet) - EMOTE_CAM.targetLift + oy;
      const dx = ox + side * hw * cy, dz = oz - side * hw * sy; // the character's width along the camera's right vector
      const right = dx * cy - dz * sy, up = y * COS_P - (dx * sy + dz * cy) * SIN_P, dot = dx * dx0 + y * SIN_P + dz * dz0;
      need = Math.max(need, Math.abs(right) * EMOTE_CAM.marginH / (TAN_V * a) + dot, Math.abs(up) * EMOTE_CAM.marginV / TAN_V + dot);
    }
  }
  const dist = Math.min(EMOTE_CAM.maxDist, need * EMOTE_CAM.backoff) * Math.max(1, factor);
  out.target.x = mx; out.target.y = my; out.target.z = mz;
  out.eye.x = mx + dx0 * dist; out.eye.y = my + SIN_P * dist; out.eye.z = mz + dz0 * dist;
  return dist;
}

/** The heading (rad) that frames the pair closest: the default three-quarter view, or up to ~1.6 rad around it when that fits a closer shot (the pair side by side on a portrait phone). */
export function bestEmoteYaw(px: number, py: number, pz: number, hasQ: boolean, qx: number, qy: number, qz: number, aspect: number, wide = 0, sideWeight = 1.8): number {
  if (!hasQ) return EMOTE_CAM.yaw;
  const o = {eye: {x: 0, y: 0, z: 0}, target: {x: 0, y: 0, z: 0}};
  let best: number = EMOTE_CAM.yaw, bestScore = Infinity;
  for (let i = -8; i <= 8; i++) {
    const yaw = EMOTE_CAM.yaw + i * .2, score = frameEmote(o, px, py, pz, true, qx, qy, qz, aspect, 1, yaw, wide) + Math.abs(i) * .35
      + sideWeight * Math.abs((qx - px) * Math.sin(yaw) + (qz - pz) * Math.cos(yaw)); // one character in front of the other is bigger and hides it: prefer side by side
    if (score < bestScore) { bestScore = score; best = yaw; }
  }
  return best;
}

/** Does a point at offset (dx, dy, dz) from the camera target land inside the frame at `dist` / `aspect` (heading `yaw`)? */
export function insideFrame(dx: number, dy: number, dz: number, dist: number, aspect: number, yaw: number = EMOTE_CAM.yaw): boolean {
  const sy = Math.sin(yaw), cy = Math.cos(yaw);
  const right = dx * cy - dz * sy;
  const up = dy * COS_P - (dx * sy + dz * cy) * SIN_P;
  const depth = dist - (dx * sy * COS_P + dy * SIN_P + dz * cy * COS_P);
  if (depth <= .1) return false;
  return Math.abs(right) <= depth * TAN_V * aspect && Math.abs(up) <= depth * TAN_V;
}

/** What the island knows when an emote starts / while it runs. */
export interface EmoteCamState {
  reduced: boolean;
  /** Anything but walking on foot: a ride, a vehicle, a zipline. */
  riding: boolean;
  /** On a scooter, bike or moped (a ground ride): emotes work; `rideSpeed` m/s, `steer` rad/s (turn rate), `rideChanged` = dismounted / changed ride since the emote began. */
  onRide: boolean; rideSpeed: number; steer: number; rideChanged: boolean;
  swimming: boolean; flying: boolean;
  /** A context emote is running (lib/town/emoteContexts.ts): a FLYING one is allowed while flying / on the jetpack ride, a SWIM one while swimming; neither is cancelled by the movement that goes with it. */
  ctx?: 'fly' | 'swim' | '';
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
  if (s.riding) return 'riding'; // (a flying emote: Town leaves the jetpack ride out of `riding`, only a truck / zipline ride counts)
  if (s.swimming && s.ctx !== 'swim') return 'swimming';
  if (s.flying && s.ctx !== 'fly') return 'flying';
  if (s.ctx === 'fly' && !s.flying) return 'landed';
  if (s.ctx === 'swim' && !s.swimming) return 'left the water';
  if (s.inJob) return 'job';
  if (s.cutscene) return 'cutscene';
  if (s.lesson) return 'lesson';
  if (s.menuOpen) return 'menu';
  if (s.onRide) {
    if (s.rideChanged) return 'dismount';
    if (s.rideSpeed > EMOTE_CAM.rideMaxSpeed) return 'fast';
    if (s.steer > EMOTE_CAM.rideSteer) return 'steering';
    return '';
  }
  if (s.moving && !s.ctx) return 'moving';
  return '';
}
/** To START: the cancel rules plus "the camera is already close" (an indoor / room camera). */
export const emoteCamSkip = (s: EmoteCamState): string => emoteCamBlocked(s) || (s.cameraDist < EMOTE_CAM.closeCameraDist ? 'close' : '');
