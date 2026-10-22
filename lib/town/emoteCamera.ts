// The gentle emote camera (user, Oct 22 2026). A tiny controller around the island's eased shot camera (lib/town/shotCamera.ts): ease in to a
// closer three-quarter framing of the player (and the partner townsperson), hold for the emote, ease back to EXACTLY the follow camera.
// Rules (emoteCameraMath.ts): never fights the player (any input, a menu, a ride, a job, tapping the screen cancels and eases out at once),
// reduced motion skips it, a short cooldown stops rapid taps pumping the camera, a new emote extends the zoom. The world keeps running.
// Town.tsx calls: begin() from the emote handler, restore() just before the follow camera moves, apply() right after it, tap() on pointerdown.
// Allocation-free per frame (the output objects are made once).
import type * as T from 'three';
import {createShotCamera, type Shot} from './shotCamera';
import {PITCH_TRIES, YAW_TRIES, eyeBlocked, viewClear, type Solid} from './emoteCamClear';
import {EMOTE_CAM, bestEmoteYaw, emoteCamBlocked, emoteCamSkip, frameEmote, type EmoteCamState, type V3} from './emoteCameraMath';

/** Is the sight line from the eye to the target clear of buildings and trees? (Town: the wall / obstacle grids.) And the ground under a point. */
export interface EmoteCamWorld {clear(ex: number, ey: number, ez: number, tx: number, ty: number, tz: number): boolean; floorAt(x: number, z: number): number;
  /** The solid boxes (buildings, big props) near (x, z) within r: with it the camera runs the multi-ray test (emoteCamClear.ts), tries other headings / pitches and eases out if a wall comes between. */
  solids?(x: number, z: number, r: number): readonly Solid[]}

export function createEmoteCamera(makeShot: typeof createShotCamera = createShotCamera) {
  const shot = makeShot(EMOTE_CAM.inSeconds, EMOTE_CAM.outSeconds);
  const out = {eye: {x: 0, y: 0, z: 0}, target: {x: 0, y: 0, z: 0}, fov: EMOTE_CAM.fov} as Shot & {eye: V3; target: V3};
  const p = {x: 0, y: 0, z: 0}, q = {x: 0, y: 0, z: 0}, qe = {x: 0, y: 0, z: 0}, follow = {x: 0, y: 0, z: 0};
  // qw = how much the partner counts (0..1, eased so a reaction that starts a moment later, or an NPC that is left behind, never jerks the shot); yaw eases to the best heading
  let hasQ = false, qw = 0, qGoal = 0, yaw: number = EMOTE_CAM.yaw, yawGoal: number = EMOTE_CAM.yaw, pitch: number = EMOTE_CAM.pitch, yawBias = 0, watch = 0, worldNow: EmoteCamWorld | null = null, wide = 0, aspectNow = 1.6, factor = 1, hold = 0, cooldown = 0, holding = false, restoring = false, tapped = false;
  const effQ = () => { qe.x = p.x + (q.x - p.x) * qw; qe.y = p.y + (q.y - p.y) * qw; qe.z = p.z + (q.z - p.z) * qw; };
  const frame = (aspect: number): Shot => { effQ(); aspectNow = aspect; frameEmote(out, p.x, p.y, p.z, hasQ, qe.x, qe.y, qe.z, aspect, factor, yaw, wide, pitch); return out; };
  const stop = () => { if (holding) { holding = false; hold = 0; cooldown = EMOTE_CAM.cooldown; shot.end(); } };
  return {
    /** An emote starts: zoom in (or extend the zoom that is running) for `seconds`. Returns whether the camera is zooming. */
    begin(s: EmoteCamState, px: number, py: number, pz: number, partner: V3 | null, seconds: number, world: EmoteCamWorld | null, aspect = 1.6, riding = false, ballPass = false): boolean {
      if (holding) { // each new emote extends the zoom instead of restarting it
        if (emoteCamBlocked(s)) { stop(); return false; }
        hold = Math.max(hold, seconds); return true;
      }
      if (cooldown > 0 || shot.active || emoteCamSkip(s)) return false;
      p.x = px; p.y = py; p.z = pz; hasQ = !!partner; wide = riding ? EMOTE_CAM.rideWide : 0; aspectNow = aspect;
      if (partner) { q.x = partner.x; q.y = partner.y; q.z = partner.z; }
      qw = qGoal = partner ? 1 : 0; yaw = yawGoal = bestEmoteYaw(px, py, pz, hasQ, q.x, q.y, q.z, aspect, wide, ballPass ? 9 : 1.8); // Pass it: a diagonal / side view so the ball between the feet is seen
      // Do not clip into trees / buildings: a gentler zoom until the sight line is clear; none at all if it never is.
      // With `world.solids`: the first framing (heading, then gentler zoom, then higher pitch) whose eye is clear and whose rays see both characters.
      let ok = !world; factor = 1; pitch = EMOTE_CAM.pitch; yawBias = 0; worldNow = world; watch = 0;
      if (world && world.solids) {
        const best = yaw, list = world.solids(hasQ ? (px + q.x) / 2 : px, hasQ ? (pz + q.z) / 2 : pz, EMOTE_CAM.maxDist * EMOTE_CAM.shrink[EMOTE_CAM.shrink.length - 1] + 6);
        search: for (const pt of ballPass ? PITCH_TRIES.slice(1) : PITCH_TRIES) for (const f of EMOTE_CAM.shrink) for (const dy of YAW_TRIES) {
          frameEmote(out, p.x, p.y, p.z, hasQ, q.x, q.y, q.z, aspect, f, best + dy, wide, pt);
          if (out.eye.y > world.floorAt(out.eye.x, out.eye.z) + 1 && viewClear(list, out.eye.x, out.eye.y, out.eye.z, p, hasQ, q, best + dy)) { ok = true; factor = f; pitch = pt; yaw = yawGoal = best + dy; yawBias = dy; break search; }
        }
      } else {
        for (let i = 0; i < EMOTE_CAM.shrink.length && !ok; i++) {
          factor = EMOTE_CAM.shrink[i]; frameEmote(out, p.x, p.y, p.z, hasQ, q.x, q.y, q.z, aspect, factor, yaw, wide);
          ok = world!.clear(out.eye.x, out.eye.y, out.eye.z, out.target.x, out.target.y, out.target.z) && out.eye.y > world!.floorAt(out.eye.x, out.eye.z) + 1;
        }
      }
      if (!ok) return false;
      holding = true; hold = seconds; tapped = false; shot.begin(frame); return true;
    },
    /** Every frame while it runs: the player now, and the partner (null = none / out of reach). A partner that appears later fades into the framing. */
    track(px: number, py: number, pz: number, partner: V3 | null) {
      p.x = px; p.y = py; p.z = pz;
      if (partner) { q.x = partner.x; q.y = partner.y; q.z = partner.z; if (!hasQ) { hasQ = true; qw = 0; q.x = partner.x; q.z = partner.z; } if (qGoal === 0) yawGoal = bestEmoteYaw(px, py, pz, true, partner.x, partner.y, partner.z, aspectNow, wide) + yawBias; }
      qGoal = partner ? 1 : 0;
    },
    /** A tap / click on the screen: cancel and ease out at once. */
    tap() { tapped = true; },
    /** Just before the follow camera moves: put back the follow camera's own position (so the zoom never feeds back into it). */
    restore(camera: T.PerspectiveCamera) { if (restoring) camera.position.set(follow.x, follow.y, follow.z); },
    /** Right after the follow camera is placed: advance the hold, cancel on conflicts, apply the eased framing. Returns whether it changed the camera. */
    apply(camera: T.PerspectiveCamera, dt: number, s: EmoteCamState, reduced: boolean): boolean {
      if (cooldown > 0 && !shot.active) cooldown = Math.max(0, cooldown - dt); // counts from the moment the camera is back
      if (!holding && !shot.active) { restoring = false; tapped = false; return false; }
      if (holding) { const k = Math.min(1, dt * 4); qw += (qGoal - qw) * k; yaw += (yawGoal - yaw) * k; }
      if (holding) { if (tapped || emoteCamBlocked(s)) stop(); else { hold -= dt; if (hold <= 0) stop(); } }
      tapped = false;
      if (holding && worldNow?.solids) { // a wall came between (the characters moved, the partner stepped): ease back out
        watch -= dt;
        if (watch <= 0) {
          watch = .15; effQ(); const l = worldNow.solids(p.x, p.z, EMOTE_CAM.maxDist * 2.5);
          if (!viewClear(l, out.eye.x, out.eye.y, out.eye.z, p, hasQ, qe, yaw) || eyeBlocked(l, camera.position.x, camera.position.y, camera.position.z, 0)) stop();
        }
      }
      follow.x = camera.position.x; follow.y = camera.position.y; follow.z = camera.position.z; restoring = true;
      const changed = shot.apply(camera, dt, reduced);
      if (!shot.active) restoring = false;
      return changed;
    },
    get zooming() { return holding; },
    get active() { return holding || shot.active; },
    cancel: stop,
  };
}
