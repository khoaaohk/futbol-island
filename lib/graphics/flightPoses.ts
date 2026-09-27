import { MathUtils } from 'three';

/**
 * Expressive free-flight body poses (Superman, one-arm Superman, glide, dive,
 * climb/boost, hover). Chosen from flight state, blended with one shared
 * damping rate so the weights never sum above 1 and nothing snaps.
 * Runs inside flightMotion.update (the existing frame update); no allocation
 * per frame, no timers of its own, and it does not advance while dt is 0
 * (paused/sleeping loop).
 */
export type FlightAction = 'idle' | 'dash' | 'charge' | 'blast' | 'parachute' | 'fall';
export type FlightVariant = 0 | 1 | 2 | 3;
/** Pose slots, in table order. */
export const FLIGHT_POSES = ['superman', 'oneArmL', 'oneArmR', 'glide', 'dive', 'climb', 'hover', 'orbit'] as const;
const SUPERMAN = 0, ONE_L = 1, ONE_R = 2, GLIDE = 3, DIVE = 4, CLIMB = 5, HOVER = 6, ORBIT = 7, COUNT = 8;
/** Slot of the banked-orbit pose (sustained circling). */
export const ORBIT_POSE = ORBIT;
export type FlightStyle = {
  /** Blended weight per FLIGHT_POSES slot, 0..1, sum ≤ 1. */
  weights: Float32Array;
  /** Sum of weights (how much the style overrides the base flight pose). */
  total: number;
  /** Signed, smoothed turn lean (-1..1) used for arms/torso banking. */
  bank: number;
  /** Root pitch the style asks for (already blended with its total). */
  pitch: number;
  /** Current cruise variant (0 superman, 1 one-arm left, 2 one-arm right, 3 glide). */
  variant: FlightVariant;
  /** Name of the dominant pose, for debugging/tests. */
  dominant: (typeof FLIGHT_POSES)[number] | 'base';
  /** Signed orbit direction, -1..1 (+ = yaw increasing, turning toward local +x where the side +1 limbs are). Picks the inside/outside limb continuously. */
  orbitTurn: number;
  /** Seconds of sustained same-direction turning (hysteresis integrator, 0..ORBIT_CHARGE_MAX). */
  orbitCharge: number;
};

/** Rig channels. Body channels read limb set 0. */
export const FC = { torsoX: 0, headX: 1, hipX: 2, hipZ: 3, knee: 4, ankle: 5, shoulderX: 6, shoulderZ: 7, elbow: 8, handX: 9 } as const;
const CH = 10;
// [pose][limbSet 0|1][channel]. hipZ/shoulderZ are multiplied by the limb's side (+ = outward).
// Set 0 is the left limb, except one-arm poses where set 0 is the leading (reaching) arm.
// prettier-ignore
const TABLE = new Float32Array([
  // superman: both fists overhead in line with a horizontal body, legs together and trailing, toes pointed
  -.06,-1.05, .05,-.015,.06,1.1, -2.95,-.1,-.06,.1,
  -.06,-1.05, .05,-.015,.06,1.1, -2.95,-.1,-.06,.1,
  // one-arm left: left fist forward, right arm along the side, trailing knee a little bent
  -.05,-1.0, .05,-.01,.08,1.05, -2.95,-.06,-.05,.1,
  -.05,-1.0, .12,-.01,.28,.9, .14,.12,-.28,0,
  // one-arm right (set 0 = right arm leads)
  -.05,-1.0, .05,-.01,.08,1.05, -2.95,-.06,-.05,.1,
  -.05,-1.0, .12,-.01,.28,.9, .14,.12,-.28,0,
  // glide: arms swept back and out like wings, gentle leg spread
  -.04,-.8, .1,.06,.14,.85, .45,.78,-.14,-.2,
  -.04,-.8, .1,.06,.14,.85, .45,.78,-.14,-.2,
  // dive: streamlined, arms tucked back along the body, head looking ahead-down
  .04,-.3, .04,-.012,.05,1.0, .38,.06,-.08,0,
  .04,-.3, .04,-.012,.05,1.0, .38,.06,-.08,0,
  // climb / launch: both arms reaching overhead, body upright, legs straight
  -.05,-.35, .06,-.012,.08,.8, -2.98,-.12,-.05,.1,
  -.05,-.35, .06,-.012,.08,.8, -2.98,-.12,-.05,.1,
  // hover: relaxed float, loose arms, uneven dangling knees
  .03,-.02, -.1,.06,.38,.15, .08,.32,-.45,.1,
  .03,-.02, .05,.05,.16,.05, -.05,.28,-.3,.05,
  // orbit (sustained circling), set 0 = INSIDE limbs (toward the turn centre), set 1 = OUTSIDE limbs:
  // chest a little forward, eyes up along the curve; inside knee tucked up, outside leg trailing long;
  // outside arm out to the side for balance, inside arm folded in close to the body.
  .1,-.3, -.5,.02,1.05,.5, .12,.1,-1.05,.14,
  .1,-.3, .34,.18,.3,.95, -.22,1.02,-.2,-.1,
]);
/** Root pitch per pose (radians, + leans the body forward). The orbit slot is speed-dependent (orbitPitch). */
const PITCH = [1.38, 1.3, 1.3, 1.0, .8, -.1, .06, .5];
/** Sustained-turn hysteresis: |steer| (≈ yaw rate / 2 rad/s) must stay above ENTER for ~CHARGE_ON s before the orbit shows. */
export const ORBIT_ENTER = .3, ORBIT_EXIT = .16, ORBIT_CHARGE_ON = .8, ORBIT_CHARGE_FULL = 1.6, ORBIT_CHARGE_MAX = 1.75;
/** Orbit body pitch: nearly upright when slow/hovering, ~30° forward in a fast circle (never the flat Superman). */
export function orbitPitch(speed: number) { return .14 + .4 * smooth((speed - 4) / 22); }
/** Twin jet and Iron Man lie flat; the helicopter pack keeps its rotor upright-ish. */
const smooth = (v: number) => { const t = MathUtils.clamp(v, 0, 1); return t * t * (3 - 2 * t); };
export function flightPitchLimit(kind: string) { return kind === 'helicopter' ? .95 : 1.45; }
export function expressiveFlight(kind: string) { return kind === 'classic' || kind === 'helicopter' || kind === 'ironman'; }

export function createFlightPoses(random: () => number = Math.random) {
  const style: FlightStyle = { weights: new Float32Array(COUNT), total: 0, bank: 0, pitch: 0, variant: 0, dominant: 'base', orbitTurn: 0, orbitCharge: 0 };
  const target = new Float32Array(COUNT);
  let lastX = 0, lastZ = 0, lastHeight = 0, seeded = false, speed = 0, climbRate = 0, hold = 5, holding = 0, orbitDir = 0, orbit = 0;
  const pickVariant = () => {
    // Superman most often, then the wing glide, then a one-arm flourish on either side.
    const r = random();
    let next: FlightVariant = r < .38 ? 0 : r < .7 ? 3 : r < .85 ? 1 : 2;
    if (next === style.variant) next = ((next + 1 + Math.floor(random() * 3)) % 4) as FlightVariant;
    style.variant = next; hold = 4 + random() * 5;
  };
  function update(dt: number, x: number, z: number, height: number, phase: 'takeoff' | 'cruise' | 'landing', progress: number,
    steer: number, drive: number, action: FlightAction, kind: string, reduced: boolean) {
    if (!seeded) { lastX = x; lastZ = z; lastHeight = height; seeded = true; }
    if (dt <= 0) return style; // loop asleep or paused: hold everything.
    const inst = Math.min(140, Math.hypot(x - lastX, z - lastZ) / dt), vy = MathUtils.clamp((height - lastHeight) / dt, -80, 200);
    lastX = x; lastZ = z; lastHeight = height;
    speed = MathUtils.damp(speed, inst, 8, dt); climbRate = MathUtils.damp(climbRate, vy, 8, dt);
    target.fill(0);
    if (!expressiveFlight(kind) || action === 'parachute' || action === 'fall') {
      // Vehicles and parachute/crash own the body: clear immediately (those are discontinuities anyway).
      style.weights.fill(0); style.total = 0; style.bank = 0; style.pitch = 0; style.dominant = 'base'; holding = 0;
      orbit = orbitDir = style.orbitTurn = style.orbitCharge = 0;
      return style;
    }
    const moving = smooth((speed - 3) / 14);
    // Sustained-turn integrator (hysteresis): charges while the turn stays above ENTER in one direction,
    // holds in the dead band, drains below EXIT and drains fast on a reversal. Linear in dt, so it is
    // frame-rate independent. A quick direction change never charges long enough to show the orbit.
    const turn = Math.abs(steer), dir = steer > 0 ? 1 : -1;
    if (turn > ORBIT_ENTER && (dir === orbitDir || style.orbitCharge <= 0)) { orbitDir = dir; style.orbitCharge = Math.min(ORBIT_CHARGE_MAX, style.orbitCharge + dt); }
    else if (turn > ORBIT_ENTER) style.orbitCharge = Math.max(0, style.orbitCharge - 3 * dt);
    else if (turn < ORBIT_EXIT) style.orbitCharge = Math.max(0, style.orbitCharge - 2 * dt);
    const orbitGate = phase === 'cruise' && action === 'idle' && Math.abs(climbRate) <= 9 ? 1 : 0;
    const orbitWant = orbitGate * smooth((style.orbitCharge - ORBIT_CHARGE_ON) / (ORBIT_CHARGE_FULL - ORBIT_CHARGE_ON));
    // Settles over ~1 s into a long circle; leaves faster when a dash/climb/landing takes over.
    orbit = MathUtils.damp(orbit, orbitWant, orbitWant > orbit ? 2.6 : orbitGate ? 2 : 7, dt);
    if (orbit < 1e-4 && orbitWant === 0) orbit = 0;
    style.orbitTurn = MathUtils.damp(style.orbitTurn, orbitDir, 5, dt);
    if (action === 'charge') {
      // Existing crouch-and-load owns the body; relax toward it.
    } else if (action === 'blast') target[CLIMB] = 1;
    else if (action === 'dash') target[SUPERMAN] = 1;
    else if (phase === 'takeoff') target[CLIMB] = 1 - smooth((progress - .75) / .25);
    // Landing: a quick head-first dive out of the cruise, handing back to the feet-first brace well before touchdown (.72).
    else if (phase === 'landing') target[DIVE] = 1 - smooth((progress - .12) / .3);
    else if (climbRate < -9) target[DIVE] = smooth((-climbRate - 9) / 8);
    else if (climbRate > 9) target[CLIMB] = smooth((climbRate - 9) / 8);
    else {
      // Steady cruise: rotate between Superman variants every several seconds.
      const turning = Math.abs(steer) > .35, boosting = drive > .45;
      if (!reduced && moving > .9 && !turning && !boosting) { holding += dt; hold -= dt; if (hold <= 0 && holding > 1.2) pickVariant(); }
      else holding = 0;
      if (reduced) target[GLIDE] = moving; // one calm pose, no switching
      else if (boosting) target[SUPERMAN] = moving;
      else target[style.variant === 0 ? SUPERMAN : style.variant === 1 ? ONE_L : style.variant === 2 ? ONE_R : GLIDE] = moving;
      target[HOVER] = 1 - moving;
      if (orbit > 0) { for (let i = 0; i < COUNT; i++) target[i] *= 1 - orbit; target[ORBIT] = orbit; }
    }
    // One shared rate keeps Σw ≤ 1; ~0.45 s to settle (gentler when reduced).
    const rate = reduced ? 4.5 : phase === 'landing' ? 10 : 7;
    let total = 0, pitch = 0, best = 0, bestIndex = -1;
    for (let i = 0; i < COUNT; i++) {
      const w = style.weights[i] = MathUtils.damp(style.weights[i], target[i], rate, dt);
      total += w; pitch += w * (i === ORBIT ? orbitPitch(speed) : PITCH[i]);
      if (w > best) { best = w; bestIndex = i; }
    }
    const limit = flightPitchLimit(kind) * (reduced ? .55 : 1);
    style.total = Math.min(1, total);
    style.pitch = MathUtils.clamp(pitch, -.2, limit);
    style.bank = MathUtils.damp(style.bank, reduced ? 0 : MathUtils.clamp(steer, -1, 1), 6, dt);
    style.dominant = bestIndex >= 0 && best > .5 ? FLIGHT_POSES[bestIndex] : 'base';
    return style;
  }
  function reset() { style.weights.fill(0); style.total = 0; style.bank = 0; style.pitch = 0; style.dominant = 'base'; seeded = false; speed = climbRate = 0; holding = 0; hold = 5; orbit = orbitDir = style.orbitTurn = style.orbitCharge = 0; }
  return { style, update, reset, pickVariant };
}

/**
 * Blend one rig channel: the base flight value keeps (1 - total) and each pose adds its weight.
 * `side` is -1 (left limb) or 1 (right limb); side-mirrored channels are multiplied by it.
 */
export function flightChannel(style: FlightStyle | undefined, channel: number, side: -1 | 1, base: number) {
  if (!style || style.total < 1e-4) return base;
  const w = style.weights, mirrored = channel === FC.hipZ || channel === FC.shoulderZ ? side : 1;
  let value = base * (1 - style.total);
  for (let p = 0; p < COUNT; p++) {
    const weight = w[p]; if (weight < 1e-4) continue;
    if (p === ORBIT) {
      // Continuous inside/outside mix. Yaw increasing (orbitTurn +1) turns toward +x, where the side +1 limbs sit,
      // so they are fully "inside"; in the opposite turn they are fully outside. 0 → symmetric average.
      const inside = MathUtils.clamp((1 + side * style.orbitTurn) / 2, 0, 1), row = p * 2 * CH + channel;
      value += weight * (inside * TABLE[row] + (1 - inside) * TABLE[row + CH]) * mirrored;
      continue;
    }
    const set = p === ONE_L ? (side < 0 ? 0 : 1) : p === ONE_R ? (side > 0 ? 0 : 1) : side < 0 ? 0 : 1;
    value += weight * TABLE[(p * 2 + set) * CH + channel] * mirrored;
  }
  return value;
}
