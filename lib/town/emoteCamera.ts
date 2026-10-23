// The gentle emote camera (user, Oct 22 2026). A tiny controller around the island's eased shot camera (lib/town/shotCamera.ts): ease in to a
// closer three-quarter framing of the player (and the partner townsperson), hold for the emote, ease back to EXACTLY the follow camera.
// Rules (emoteCameraMath.ts): never fights the player (any input, a menu, a ride, a job, tapping the screen cancels and eases out at once),
// reduced motion skips it, a short cooldown stops rapid taps pumping the camera, a new emote extends the zoom. The world keeps running.
// Town.tsx calls: begin() from the emote handler, restore() just before the follow camera moves, apply() right after it, tap() on pointerdown.
// Allocation-free per frame (the output objects are made once).
import type * as T from 'three';
import {createShotCamera, type Shot} from './shotCamera';
import {YAW_TRIES, eyeBlocked, viewClear, type Solid} from './emoteCamClear';
import {EMOTE_CAM, MOVE_NUDGE, YAW_RATE, angleDiff, bestEmoteYaw, emoteCamBlocked, emoteCamSkip, emoteLayout, frameEmote, rideWideFor, type EmoteCamState, type V3} from './emoteCameraMath';

/** The island follow camera's heading (rad): the view the player already has, so the emote view turns as little as it can from it. */
const FOLLOW_YAW = Math.atan2(16, 33);

/** Is the sight line from the eye to the target clear of buildings and trees? (Town: the wall / obstacle grids.) And the ground under a point. */
export interface EmoteCamWorld {clear(ex: number, ey: number, ez: number, tx: number, ty: number, tz: number): boolean; floorAt(x: number, z: number): number;
  /** The solid boxes (buildings, big props) near (x, z) within r: with it the camera runs the multi-ray test (emoteCamClear.ts), tries other headings / pitches and eases out if a wall comes between. */
  solids?(x: number, z: number, r: number): readonly Solid[]}

export function createEmoteCamera(makeShot: typeof createShotCamera = createShotCamera) {
  const shot = makeShot(EMOTE_CAM.inSeconds, EMOTE_CAM.outSeconds);
  const out = {eye: {x: 0, y: 0, z: 0}, target: {x: 0, y: 0, z: 0}, fov: EMOTE_CAM.fov} as Shot & {eye: V3; target: V3};
  const p = {x: 0, y: 0, z: 0}, q = {x: 0, y: 0, z: 0}, qe = {x: 0, y: 0, z: 0}, follow = {x: 0, y: 0, z: 0};
  // qw = how much the partner counts (0..1, eased so a reaction that starts a moment later, or an NPC that is left behind, never jerks the shot); yaw eases to the best heading
  let hasQ = false, qw = 0, qGoal = 0, yaw: number = EMOTE_CAM.yaw, yawGoal: number = EMOTE_CAM.yaw, pitch: number = EMOTE_CAM.pitch, yawBias = 0, axisAng = 0, watch = 0, worldNow: EmoteCamWorld | null = null, wide = 0, aspectNow = 1.6, factor = 1, hold = 0, why = '', cooldown = 0, holding = false, restoring = false, tapped = false;
  const effQ = () => { qe.x = p.x + (q.x - p.x) * qw; qe.y = p.y + (q.y - p.y) * qw; qe.z = p.z + (q.z - p.z) * qw; };
  const frame = (aspect: number): Shot => { effQ(); aspectNow = aspect; frameEmote(out, p.x, p.y, p.z, hasQ, qe.x, qe.y, qe.z, aspect, factor, yaw, wide, pitch); return out; };
  const stop = () => { if (holding) { holding = false; hold = 0; cooldown = EMOTE_CAM.cooldown; shot.end(); } };
  return {
    /** An emote starts: zoom in (or extend the zoom that is running) for `seconds`. Returns whether the camera is zooming. */
    begin(s: EmoteCamState, px: number, py: number, pz: number, partner: V3 | null, seconds: number, world: EmoteCamWorld | null, aspect = 1.6, riding = false, ballPass = false, facing?: number, ride = ''): boolean {
      if (holding) { // each new emote extends the zoom instead of restarting it
        if (emoteCamBlocked(s)) { stop(); return false; }
        hold = Math.max(hold, seconds); return true;
      }
      if (cooldown > 0 || shot.active || emoteCamSkip(s)) return false;
      p.x = px; p.y = py; p.z = pz; hasQ = !!partner; wide = riding ? (ride ? rideWideFor(ride) : EMOTE_CAM.rideWide) : 0; // a rider: + the vehicle's footprint (emoteCameraMath.ts rideWideFor) aspectNow = aspect;
      if (partner) { q.x = partner.x; q.y = partner.y; q.z = partner.z; }
      qw = qGoal = partner ? 1 : 0; axisAng = partner ? Math.atan2(q.x - px, q.z - pz) : 0;
      const wideGap = hasQ && Math.hypot(q.x - px, q.z - pz) > 5, basePitch = emoteLayout(aspect).pitch + (wideGap ? .35 : 0) /* a wide pair (Juggle with me): look down from above the rooftops */, tries = [basePitch, basePitch + .24, basePitch + .54];
      // The heading: across the line between the two (side by side on the screen), the clear side first (the multi-ray test is part of the choice),
      // the smallest turn from the follow camera; alone: a three-quarter front-side view. Pass it: a diagonal / side view so the ball between the feet is seen.
      const tmp = {eye: {x: 0, y: 0, z: 0}, target: {x: 0, y: 0, z: 0}}, wallList = world && world.solids ? world.solids(hasQ ? (px + q.x) / 2 : px, hasQ ? (pz + q.z) / 2 : pz, EMOTE_CAM.wideMaxDist * EMOTE_CAM.shrink[EMOTE_CAM.shrink.length - 1] + 6) : null;
      const clearAt = wallList && world ? (y: number) => { frameEmote(tmp, px, py, pz, hasQ, q.x, q.y, q.z, aspect, 1, y, wide, basePitch); return tmp.eye.y > world.floorAt(tmp.eye.x, tmp.eye.z) + 1 && viewClear(wallList, tmp.eye.x, tmp.eye.y, tmp.eye.z, {x: px, y: py, z: pz}, hasQ, q, y); } : undefined;
      yaw = yawGoal = bestEmoteYaw(px, py, pz, hasQ, q.x, q.y, q.z, aspect, wide, ballPass ? 9 : 1.8, FOLLOW_YAW, facing, clearAt);
      // Do not clip into trees / buildings: a gentler zoom until the sight line is clear; none at all if it never is.
      // With `world.solids`: the first framing (heading, then gentler zoom, then higher pitch) whose eye is clear and whose rays see both characters.
      let ok = !world; factor = 1; pitch = basePitch; yawBias = 0; worldNow = world; watch = EMOTE_CAM.inSeconds + .25; // no wall watch while the camera is still easing in (a far eye passes through buildings on the way)
      if (world && world.solids) {
        const best = yaw, list = world.solids(hasQ ? (px + q.x) / 2 : px, hasQ ? (pz + q.z) / 2 : pz, EMOTE_CAM.wideMaxDist * EMOTE_CAM.shrink[EMOTE_CAM.shrink.length - 1] + 6);
        search: for (const pt of ballPass ? tries.slice(1) : tries) for (const f of EMOTE_CAM.shrink) for (const dy of YAW_TRIES) {
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
      // A pair that cannot both fit even at the farthest allowed distance (a wide Juggle pair on a portrait phone): stay on the follow camera, which already shows both.
      if (wideGap && frameEmote(tmp, px, py, pz, true, q.x, q.y, q.z, aspect, factor, yaw, wide, pitch) >= EMOTE_CAM.wideMaxDist - 1e-6) return false;
      holding = true; hold = seconds; tapped = false; shot.begin(frame); return true;
    },
    /** Every frame while it runs: the player now, and the partner (null = none / out of reach). A partner that appears later fades into the framing. */
    track(px: number, py: number, pz: number, partner: V3 | null) {
      p.x = px; p.y = py; p.z = pz;
      if (partner) { q.x = partner.x; q.y = partner.y; q.z = partner.z; if (!hasQ) { hasQ = true; qw = 0; q.x = partner.x; q.z = partner.z; } const ang = Math.atan2(partner.x - px, partner.z - pz); if (qGoal === 0 || Math.abs(angleDiff(ang, axisAng)) > .5) { axisAng = ang; yawGoal = bestEmoteYaw(px, py, pz, true, partner.x, partner.y, partner.z, aspectNow, wide, 1.8, yaw - yawBias) + yawBias; } }
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
      if (holding) { const k = Math.min(1, dt * 4); qw += (qGoal - qw) * k; const d = angleDiff(yawGoal, yaw), cap = YAW_RATE * dt; yaw += Math.max(-cap, Math.min(cap, d * k)); /* no whipping when the partner moves */ }
      if (holding) { if (tapped || emoteCamBlocked(s)) { why = tapped ? 'tap' : emoteCamBlocked(s); stop(); } else { hold -= dt; if (hold <= 0) stop(); } }
      tapped = false;
      if (holding && worldNow?.solids) { // a wall came between (the characters moved, the partner stepped): ease back out
        watch -= dt;
        if (watch <= 0) {
          watch = .15; effQ(); const l = worldNow.solids(p.x, p.z, EMOTE_CAM.wideMaxDist * 2.5);
          if (!viewClear(l, out.eye.x, out.eye.y, out.eye.z, p, hasQ, qe, yaw) || eyeBlocked(l, camera.position.x, camera.position.y, camera.position.z, 0)) { why = 'wall'; stop(); }
        }
      }
      follow.x = camera.position.x; follow.y = camera.position.y; follow.z = camera.position.z; restoring = true;
      const changed = shot.apply(camera, dt, reduced);
      if (!shot.active) restoring = false;
      return changed;
    },
    get zooming() { return holding; },
    /** Why the last zoom ended early ('tap', a blocked rule, 'wall'), for play-tests. */
    get why() { return why; },
    get active() { return holding || shot.active; },
    cancel: stop,
  };
}

/**
 * The moving-emote nudge (user, Oct 22 2026): the follow camera keeps following; this only slides it a little toward the player (`goal`, a
 * fraction <= MOVE_NUDGE.max from moveNudgeGoal) and back, eased at MOVE_NUDGE.rate. Like the zoom above: restore() just before the follow
 * camera moves (so the nudge never feeds back into it), apply() right after it. Allocation-free.
 */
export function createMoveNudge() {
  const saved = {x: 0, y: 0, z: 0};
  let k = 0, applied = false;
  return {
    restore(camera: T.PerspectiveCamera) { if (applied) { camera.position.set(saved.x, saved.y, saved.z); applied = false; } },
    apply(camera: T.PerspectiveCamera, dt: number, goal: number, tx: number, ty: number, tz: number): boolean {
      k += (Math.min(MOVE_NUDGE.max, Math.max(0, goal)) - k) * Math.min(1, dt * MOVE_NUDGE.rate);
      if (k < 1e-4) { k = 0; return false; }
      const p = camera.position; saved.x = p.x; saved.y = p.y; saved.z = p.z; applied = true;
      p.x += (tx - p.x) * k; p.y += (ty - p.y) * k; p.z += (tz - p.z) * k; return true;
    },
    get amount() { return k; },
  };
}
