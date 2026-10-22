// Seated townsfolk stand up for an emote (user, Oct 22 2026: "bench still an issue, have the npc get off the bench to make it easier"). Pure state
// machine, no three.js: seated -> rising (lean forward, ~.55 s) -> stepping (off the bench along its open front side to a clear spot) -> reacting
// (faces you and plays the normal emote set, so the camera, kicks and juggles happen in the open) -> waiting -> returning (walks back) -> sitting
// (sit-down animation, no pop) -> seated, with a cooldown so she is not yanked off the bench again at once.
// The seat pose itself (npcSeatPose.ts, tests/seat-fit.cjs) is untouched: only its blend `w` and a torso lean are driven (the rig's `trick.w`).
export type SeatState = 'seated' | 'rising' | 'stepping' | 'reacting' | 'waiting' | 'returning' | 'sitting';
export const SEAT_TIMES = {rise: .55, sit: .6, wait: .8, speed: 1.5, cooldown: 20, reactMax: 6, awayRange: 16} as const;
/** How far in front of the seat she steps (m: the island's bench collision padding keeps the first ~1.4 m in front of a bench unwalkable, so the spot starts at 1.5), tried in order, each straight ahead then up to 60 degrees either side. */
export const FRONT_DISTANCES: readonly number[] = [1.5, 1.7, 2];
export const FRONT_TURNS: readonly number[] = [0, .5, -.5, 1, -1];
export interface SeatSM {
  state: SeatState; t: number;
  /** The seat (home) and the facing of the open side (rad); the spot she steps to. */
  hx: number; hz: number; yaw: number; fx: number; fz: number;
  /** Where she is now (written every step) and the pose blend: `w` over the seat pose (1 = sitting), `lean` extra forward torso pitch (rad). */
  x: number; z: number; w: number; lean: number;
  /** Heading while walking back (rad); her facing is only forced in the seat-facing states. */
  walkYaw: number;
  emoteSeen: boolean;
  /** Seconds before she may be asked to stand again. */
  cool: number;
}
export const createSeatSM = (hx: number, hz: number, yaw: number): SeatSM => ({state: 'seated', t: 0, hx, hz, yaw, fx: hx, fz: hz, x: hx, z: hz, w: 1, lean: 0, walkYaw: yaw, emoteSeen: false, cool: 0});
const smooth = (v: number) => { const t = v < 0 ? 0 : v > 1 ? 1 : v; return t * t * (3 - 2 * t); };
/** Find a spot `d` m ahead (then to the sides) that is walkable and free of other people; writes it to `out`. */
export function openFront(hx: number, hz: number, yaw: number, isWalkable: (x: number, z: number) => boolean, others: readonly {x: number; z: number}[], out: {x: number; z: number}): boolean {
  for (const d of FRONT_DISTANCES) for (const turn of FRONT_TURNS) {
    const dx = Math.sin(yaw + turn), dz = Math.cos(yaw + turn);
    let ok = true;
    for (let r = d - .25; r <= d + 1e-9 && ok; r += .25) if (!isWalkable(hx + dx * r, hz + dz * r)) ok = false; // the spot and the step before it (the bench's own padding is not a wall)
    if (!ok || !isWalkable(hx + dx * d, hz + dz * d)) continue;
    for (const o of others) if (Math.hypot(o.x - (hx + dx * d), o.z - (hz + dz * d)) < 1 || Math.hypot(o.x - (hx + dx * d * .6), o.z - (hz + dz * d * .6)) < .8) { ok = false; break; }
    if (ok) { out.x = hx + dx * d; out.z = hz + dz * d; return true; }
  }
  return false;
}
/** Start standing up (only from `seated`, off cooldown). `front` = the clear spot from `openFront`. */
export function standUp(sm: SeatSM, fx: number, fz: number): boolean {
  if (sm.state !== 'seated' || sm.cool > 0) return false;
  sm.fx = fx; sm.fz = fz; sm.state = 'rising'; sm.t = 0; sm.emoteSeen = false; return true;
}
/** Is she free to be picked: sitting off cooldown (she will stand), or already standing in front (reacting). */
export const seatPickable = (sm: SeatSM): boolean => sm.state === 'reacting' || sm.state === 'seated' && sm.cool <= 0;
/** Advance dt seconds. `fxActive` = she is playing an emote now; `playerNear` = the player is still within range. Writes sm.x / z / w / lean. */
export function stepSeat(sm: SeatSM, dt: number, fxActive: boolean, playerNear: boolean): SeatSM {
  sm.cool = Math.max(0, sm.cool - dt);
  const T = SEAT_TIMES;
  switch (sm.state) {
    case 'seated': sm.x = sm.hx; sm.z = sm.hz; sm.w = 1; sm.lean = 0; break;
    case 'rising': {
      sm.t += dt; const k = sm.t / T.rise;
      sm.w = 1 - smooth(k); sm.lean = .35 * Math.sin(Math.PI * Math.min(1, k));
      const m = .25 * smooth((k - .5) / .5); sm.x = sm.hx + (sm.fx - sm.hx) * m; sm.z = sm.hz + (sm.fz - sm.hz) * m;
      if (sm.t >= T.rise) { sm.state = 'stepping'; sm.t = 0; sm.w = 0; sm.lean = 0; }
      break;
    }
    case 'stepping': {
      sm.w = 0; sm.lean = 0; const dx = sm.fx - sm.x, dz = sm.fz - sm.z, d = Math.hypot(dx, dz), s = Math.min(d, T.speed * dt);
      if (d > 1e-6) { sm.x += dx / d * s; sm.z += dz / d * s; }
      if (d - s < .02) { sm.x = sm.fx; sm.z = sm.fz; sm.state = 'reacting'; sm.t = 0; sm.emoteSeen = false; }
      break;
    }
    case 'reacting':
      sm.t += dt; sm.w = 0; sm.lean = 0;
      if (fxActive) sm.emoteSeen = true;
      if (sm.emoteSeen && !fxActive || !sm.emoteSeen && sm.t > T.reactMax || !playerNear) { sm.state = 'waiting'; sm.t = 0; }
      break;
    case 'waiting':
      sm.t += dt; sm.w = 0; sm.lean = 0;
      if (fxActive && playerNear) { sm.state = 'reacting'; sm.t = 0; sm.emoteSeen = true; }
      else if (sm.t >= T.wait) { sm.state = 'returning'; sm.t = 0; }
      break;
    case 'returning': {
      sm.w = 0; sm.lean = 0; const dx = sm.hx - sm.x, dz = sm.hz - sm.z, d = Math.hypot(dx, dz), s = Math.min(d, T.speed * dt);
      if (d > 1e-6) { sm.x += dx / d * s; sm.z += dz / d * s; sm.walkYaw = Math.atan2(dx, dz); }
      if (d - s < .02) { sm.x = sm.hx; sm.z = sm.hz; sm.state = 'sitting'; sm.t = 0; }
      break;
    }
    case 'sitting': {
      sm.t += dt; const k = sm.t / T.sit; sm.x = sm.hx; sm.z = sm.hz; sm.w = smooth(k); sm.lean = .3 * Math.sin(Math.PI * Math.min(1, k));
      if (sm.t >= T.sit) { sm.state = 'seated'; sm.w = 1; sm.lean = 0; sm.cool = T.cooldown; }
      break;
    }
  }
  return sm;
}
/** In these states she keeps the seat's facing (rising, stepping, sitting, seated); walking back she faces her way; reacting / waiting she faces the player. */
export const seatFacing = (sm: SeatSM): 'seat' | 'walk' | 'player' => sm.state === 'returning' ? 'walk' : sm.state === 'reacting' || sm.state === 'waiting' ? 'player' : 'seat';
