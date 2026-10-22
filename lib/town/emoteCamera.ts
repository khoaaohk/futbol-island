// The gentle emote camera (user, Oct 22 2026). A tiny controller around the island's eased shot camera (lib/town/shotCamera.ts): ease in to a
// closer three-quarter framing of the player (and the partner townsperson), hold for the emote, ease back to EXACTLY the follow camera.
// Rules (emoteCameraMath.ts): never fights the player (any input, a menu, a ride, a job, tapping the screen cancels and eases out at once),
// reduced motion skips it, a short cooldown stops rapid taps pumping the camera, a new emote extends the zoom. The world keeps running.
// Town.tsx calls: begin() from the emote handler, restore() just before the follow camera moves, apply() right after it, tap() on pointerdown.
// Allocation-free per frame (the output objects are made once).
import type * as T from 'three';
import {createShotCamera, type Shot} from './shotCamera';
import {EMOTE_CAM, emoteCamBlocked, emoteCamSkip, frameEmote, type EmoteCamState, type V3} from './emoteCameraMath';

/** Is the sight line from the eye to the target clear of buildings and trees? (Town: the wall / obstacle grids.) And the ground under a point. */
export interface EmoteCamWorld {clear(ex: number, ey: number, ez: number, tx: number, ty: number, tz: number): boolean; floorAt(x: number, z: number): number}

export function createEmoteCamera(makeShot: typeof createShotCamera = createShotCamera) {
  const shot = makeShot(EMOTE_CAM.inSeconds, EMOTE_CAM.outSeconds);
  const out = {eye: {x: 0, y: 0, z: 0}, target: {x: 0, y: 0, z: 0}, fov: EMOTE_CAM.fov} as Shot & {eye: V3; target: V3};
  const p = {x: 0, y: 0, z: 0}, q = {x: 0, y: 0, z: 0}, follow = {x: 0, y: 0, z: 0};
  let hasQ = false, factor = 1, hold = 0, cooldown = 0, holding = false, restoring = false, tapped = false;
  const frame = (aspect: number): Shot => { frameEmote(out, p.x, p.y, p.z, hasQ, q.x, q.y, q.z, aspect, factor); return out; };
  const stop = () => { if (holding) { holding = false; hold = 0; cooldown = EMOTE_CAM.cooldown; shot.end(); } };
  return {
    /** An emote starts: zoom in (or extend the zoom that is running) for `seconds`. Returns whether the camera is zooming. */
    begin(s: EmoteCamState, px: number, py: number, pz: number, partner: V3 | null, seconds: number, world: EmoteCamWorld | null, aspect = 1.6): boolean {
      if (holding) { // each new emote extends the zoom instead of restarting it
        if (emoteCamBlocked(s)) { stop(); return false; }
        hold = Math.max(hold, seconds); return true;
      }
      if (cooldown > 0 || shot.active || emoteCamSkip(s)) return false;
      p.x = px; p.y = py; p.z = pz; hasQ = !!partner; if (partner) { q.x = partner.x; q.y = partner.y; q.z = partner.z; }
      // Do not clip into trees / buildings: a gentler zoom until the sight line is clear; none at all if it never is.
      let ok = !world; factor = 1;
      for (let i = 0; i < EMOTE_CAM.shrink.length && !ok; i++) {
        factor = EMOTE_CAM.shrink[i]; frameEmote(out, p.x, p.y, p.z, hasQ, q.x, q.y, q.z, aspect, factor);
        ok = world!.clear(out.eye.x, out.eye.y, out.eye.z, out.target.x, out.target.y, out.target.z) && out.eye.y > world!.floorAt(out.eye.x, out.eye.z) + 1;
      }
      if (!ok) return false;
      holding = true; hold = seconds; tapped = false; shot.begin(frame); return true;
    },
    /** A tap / click on the screen: cancel and ease out at once. */
    tap() { tapped = true; },
    /** Just before the follow camera moves: put back the follow camera's own position (so the zoom never feeds back into it). */
    restore(camera: T.PerspectiveCamera) { if (restoring) camera.position.set(follow.x, follow.y, follow.z); },
    /** Right after the follow camera is placed: advance the hold, cancel on conflicts, apply the eased framing. Returns whether it changed the camera. */
    apply(camera: T.PerspectiveCamera, dt: number, s: EmoteCamState, reduced: boolean): boolean {
      if (cooldown > 0 && !shot.active) cooldown = Math.max(0, cooldown - dt); // counts from the moment the camera is back
      if (!holding && !shot.active) { restoring = false; tapped = false; return false; }
      if (holding) { if (tapped || emoteCamBlocked(s)) stop(); else { hold -= dt; if (hold <= 0) stop(); } }
      tapped = false;
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
