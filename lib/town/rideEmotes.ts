// Ride emotes v2 (owner, Oct 22 2026: "go back and fix the emotes for the scooter, bikes, and moped. don't have them ride away. it's impacting
// the zoom and going out of frame. create emotes using the different bike, scooter, and moped types so they are all different and unique").
// Pure data + pose math, no three.js. Every ride emote happens IN PLACE: if you are rolling, the vehicle first brakes smoothly to a stop
// (BRAKE: 0.4-0.8 s, about a metre), then the trick plays on the spot (wheelies, hops, spins, a burnout donut, sways) and control comes straight
// back. The trick never moves the ride: it is a visual offset of the rider + vehicle (sampleRideTrick, trickRootOffset) that stays inside
// EMOTE_BOUNDS (lib/town/emoteBounds.ts), so the emote camera frames the rider tightly and nothing leaves the frame.
// Five tricks per vehicle, each built from what that vehicle really does (a pedal bike, a kick scooter, a moped with an engine).
// Local ids 60-74; friends receive an existing protocol value (`wire`, 1..9, never 0 = Wave, never 3 / 6 = the ball emotes) and their avatar
// picks the same trick from the SENDER'S ride mode (emoteContexts.ts flourishForWire), so old clients still see a bubble.
export const RIDE_EMOTE = {
  MopedRev: 60, MopedDonut: 61, MopedWheelie: 62, MopedSalute: 63, MopedHorn: 64,
  ScooterTailWhip: 65, ScooterHop180: 66, ScooterOneFoot: 67, ScooterKick: 68, ScooterPivot: 69,
  BikeBell: 70, BikeWheelie: 71, BikeBunnyHop: 72, BikeStoppie: 73, BikeNoHands: 74,
} as const;
export type RideEmote = (typeof RIDE_EMOTE)[keyof typeof RIDE_EMOTE];
export type RideKind = 'moped' | 'scooter' | 'bike';
export const isRideEmote = (e: number): e is RideEmote => e >= 60 && e <= 74;

/** Braking before the trick: a rolling ride stops in `minS`..`maxS` seconds (speed eases out as (1 - t/T)^2, so it travels v0 * T / 3 m); below `still` m/s it is already stopped. */
export const BRAKE = {minS: .4, maxS: .8, stopDist: 1, still: .3} as const;
const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
export const brakeSeconds = (v0: number): number => v0 <= BRAKE.still ? 0 : Math.min(BRAKE.maxS, Math.max(BRAKE.minS, 3 * BRAKE.stopDist / v0));
export const brakeSpeed = (v0: number, T: number, t: number): number => T <= 0 ? 0 : v0 * (1 - clamp01(t / T)) ** 2;
export const brakeDistance = (v0: number): number => v0 * brakeSeconds(v0) / 3;

/** A one-shot cue during the trick: a bell ding, the moped horn, an engine rev (sound + sparks in Town). */
export type RideCue = 'bell' | 'horn' | 'rev';
export interface RideScript {
  emote: RideEmote; ride: RideKind; label: string; icon: string; emoji: string;
  /** Length of the trick itself (s, after any braking) and the protocol value friends receive. */
  seconds: number; wire: number;
  /** The friend path (lib/graphics/remoteAvatars.ts -> celebrations.applyRideEmote): `arm` = this emote's id (the whole-body ride pose), from `armFrom` s. */
  arm: number; armFrom: number;
  /** Sound / spark cues at these trick seconds. */
  cues: readonly {at: number; cue: RideCue}[];
  /** How a townsperson answers (they face you, no stepping): 0 Wave for the calm tricks, 1 Cheer for the big ones. */
  npc: 0 | 1;
}
const S = (emote: RideEmote, ride: RideKind, label: string, icon: string, emoji: string, seconds: number, wire: number, npc: 0 | 1, cues: RideScript['cues'] = []): RideScript =>
  ({emote, ride, label, icon, emoji, seconds, wire, arm: emote, armFrom: 0, cues, npc});
export const RIDE_SCRIPTS: readonly RideScript[] = [
  // MOPED (an engine): rev with exhaust puffs, a burnout donut, a wheelie pop, the kickstand salute, the horn.
  S(RIDE_EMOTE.MopedRev, 'moped', 'Rev it up', 'ride-rev', '\u{1F4A8}', 3.6, 1, 0, [{at: .35, cue: 'rev'}, {at: 1.05, cue: 'rev'}, {at: 1.75, cue: 'rev'}]),
  S(RIDE_EMOTE.MopedDonut, 'moped', 'Burnout donut', 'ride-donut', '\u{1F369}', 3.6, 4, 1, [{at: .2, cue: 'rev'}]),
  S(RIDE_EMOTE.MopedWheelie, 'moped', 'Wheelie pop', 'ride-pop', '\u{1F680}', 3.2, 2, 1, [{at: .25, cue: 'rev'}, {at: 1.95, cue: 'rev'}]),
  S(RIDE_EMOTE.MopedSalute, 'moped', 'Kickstand salute', 'ride-salute', '\u{1FAE1}', 3.6, 9, 0),
  S(RIDE_EMOTE.MopedHorn, 'moped', 'Beep beep', 'ride-horn', '\u{1F4E2}', 3.2, 7, 0, [{at: .3, cue: 'horn'}, {at: .75, cue: 'horn'}]),
  // SCOOTER (a kick scooter): tail-whip, hop 180 and back, one-foot flamingo wave, kick-push bounce, nose pivot 360.
  S(RIDE_EMOTE.ScooterTailWhip, 'scooter', 'Tail-whip', 'ride-whip', '\u{1F300}', 2.8, 4, 1),
  S(RIDE_EMOTE.ScooterHop180, 'scooter', 'Hop 180', 'ride-hop', '\u{1F504}', 3.2, 2, 1),
  S(RIDE_EMOTE.ScooterOneFoot, 'scooter', 'Flamingo wave', 'ride-flamingo', '\u{1F9A9}', 3.6, 5, 0),
  S(RIDE_EMOTE.ScooterKick, 'scooter', 'Kick bounce', 'ride-kick', '\u{1F6F4}', 3.2, 7, 0),
  S(RIDE_EMOTE.ScooterPivot, 'scooter', 'Nose pivot', 'ride-spin', '\u{1F4AB}', 3, 8, 1),
  // BIKE (a pedal bike): bell with a look-around, wheelie hold, bunny hop, stoppie, no-hands cheer.
  S(RIDE_EMOTE.BikeBell, 'bike', 'Ring-a-ding', 'ride-bell', '\u{1F514}', 3.4, 9, 0, [{at: .3, cue: 'bell'}, {at: .62, cue: 'bell'}]),
  S(RIDE_EMOTE.BikeWheelie, 'bike', 'Wheelie', 'ride-wheelie', '\u{1F4AA}', 3.2, 4, 1),
  S(RIDE_EMOTE.BikeBunnyHop, 'bike', 'Bunny hop', 'ride-bunny', '\u{1F430}', 2.8, 2, 1),
  S(RIDE_EMOTE.BikeStoppie, 'bike', 'Stoppie', 'ride-stoppie', '\u{1F6D1}', 2.8, 8, 1),
  S(RIDE_EMOTE.BikeNoHands, 'bike', 'No hands!', 'ride-nohands', '\u{1F64C}', 3.2, 1, 1),
];
export const rideScriptFor = (emote: number): RideScript | undefined => RIDE_SCRIPTS.find(s => s.emote === emote);
export const rideScriptsFor = (ride: string): RideScript[] => RIDE_SCRIPTS.filter(s => s.ride === ride);
/** The trick a friend on `ride` plays for the protocol value `wire` (undefined = their ordinary emote). */
export const rideScriptForWire = (ride: string, wire: number): RideScript | undefined => RIDE_SCRIPTS.find(s => s.ride === ride && s.wire === wire);
/** Vehicle length (m, nose to tail, at the island's 1.12 scale): the emote camera adds this footprint to the rider (emoteCameraMath.ts rideWideFor). */
export const RIDE_LENGTH: Record<RideKind, number> = {scooter: 1.3, bike: 1.8, moped: 1.9};

/** Why a running ride emote must end ('' = keep going): real input, a dismount / another ride, water / a crash, the stop is blocked, traffic, or it ran its length. */
export function rideScriptStop(s: {age: number; seconds: number; realInput: boolean; rideNow: string; rideWas: string; blockedAhead: boolean; trafficNear: boolean; water: boolean; crashed: boolean}): string {
  if (s.realInput) return 'input';
  if (s.rideNow !== s.rideWas) return 'dismount';
  if (s.water || s.crashed) return 'hazard';
  if (s.blockedAhead) return 'blocked';
  if (s.trafficNear) return 'traffic';
  return s.age >= s.seconds ? 'done' : '';
}

// ---- The trick pose: one Float32Array of channels per frame (no allocation). ----
/** Whole ride (rider + vehicle, about the root on the ground): pitch (rad, + = nose down), roll, yaw (extra, rad), lift (m);
 *  PIVOT / YPIV = the local z (m, + = forward) the pitch / the yaw turns about (rear axle for a wheelie, front axle for a stoppie or a donut);
 *  VYAW = the vehicle alone (tail-whip), RLIFT = the rider alone above the deck, WHEEL = extra wheel spin (m/s), STAND = moped stand-up 0..1, PUFF = smoke / exhaust 0..1. */
export const RT = {PITCH: 0, ROLL: 1, YAW: 2, LIFT: 3, PIVOT: 4, YPIV: 5, VYAW: 6, RLIFT: 7, WHEEL: 8, STAND: 9, PUFF: 10,
  /** Rider joints (targets with a weight; the graphics blend them over the ride pose): right / left shoulder x, z, elbow x and the arm weight. */
  RSX: 11, RSZ: 12, REX: 13, RW: 14, LSX: 15, LSZ: 16, LEX: 17, LW: 18,
  /** Head yaw / pitch (+ = look down) and weight, chest lean (added: x + = forward, z = sideways). */
  HY: 19, HX: 20, HW: 21, CX: 22, CZ: 23,
  /** Legs: hip x (- = forward, + = back), hip z (out to the side), knee bend, weight; left then right. */
  LHX: 24, LHZ: 25, LKN: 26, LLW: 27, RHX: 28, RHZ: 29, RKN: 30, RLW: 31} as const;
export const RT_CH = 32;
const TAU = Math.PI * 2;
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
/** 0 -> 1 -> 0 over [a, b] (a sine arch). */
const arch = (t: number, a: number, b: number) => t <= a || t >= b ? 0 : Math.sin(Math.PI * (t - a) / (b - a));
/** A plateau: eases in over `r` s from `a`, holds, eases out over `r` s before `b`. */
const hold = (t: number, a: number, b: number, r = .3) => smooth((t - a) / r) * smooth((b - t) / r);
const arm = (o: Float32Array, right: boolean, sx: number, sz: number, ex: number, w: number) => {
  if (right) { o[RT.RSX] = sx; o[RT.RSZ] = sz; o[RT.REX] = ex; o[RT.RW] = w; } else { o[RT.LSX] = sx; o[RT.LSZ] = -sz; o[RT.LEX] = ex; o[RT.LW] = w; }
};
const leg = (o: Float32Array, right: boolean, hx: number, hz: number, kn: number, w: number) => {
  if (right) { o[RT.RHX] = hx; o[RT.RHZ] = hz; o[RT.RKN] = kn; o[RT.RLW] = w; } else { o[RT.LHX] = hx; o[RT.LHZ] = -hz; o[RT.LKN] = kn; o[RT.LLW] = w; }
};
/** Wave high to the side (the ride wave), a fist up, a V, a salute, a thumbs up, arms out for balance: shoulder x, z, elbow x. */
const WAVE = (t: number) => [-.3, 2.62 + .2 * Math.sin(t * 9), -.2 - .1 * Math.sin(t * 9)] as const;
const FIST = (t: number) => [-2.85 - .15 * Math.sin(t * 8), .42, -.25 - .3 * Math.max(0, Math.sin(t * 8))] as const;

/** Writes the trick pose at trick-age `t` (s) into `o` (length RT_CH) and returns it. Zeros outside the emote. */
export function sampleRideTrick(emote: number, t: number, o: Float32Array): Float32Array {
  o.fill(0);
  const sc = rideScriptFor(emote); if (!sc) return o;
  const T = sc.seconds, f = hold(t, 0, T, .3);
  if (t < 0 || t > T) return o;
  switch (emote) {
    case RIDE_EMOTE.MopedRev: { // three throttle blips: the moped shudders, the nose lifts a touch, exhaust puffs; then a big wave
      let rev = 0; for (const a of [.35, 1.05, 1.75]) rev = Math.max(rev, arch(t, a, a + .5));
      o[RT.ROLL] = .035 * Math.sin(t * 38) * (.3 + rev) * f; o[RT.PITCH] = -.06 * rev; o[RT.PIVOT] = -.6; o[RT.PUFF] = rev > .2 ? 1 : 0; o[RT.WHEEL] = 9 * rev;
      o[RT.CX] = -.12 * rev; o[RT.HX] = -.15 * rev; o[RT.HW] = f;
      const w = WAVE(t); arm(o, true, w[0], w[1], w[2], hold(t, 2.3, T, .25));
      break;
    }
    case RIDE_EMOTE.MopedDonut: { // one burnout donut round the front wheel: rear wheel spinning, smoke, leaning in, left foot down
      const s = smooth((t - .35) / 2.6);
      o[RT.YAW] = TAU * s; o[RT.YPIV] = .42; o[RT.ROLL] = -.2 * f; o[RT.WHEEL] = 16 * hold(t, .2, 3.1, .3); o[RT.PUFF] = t > .25 && t < 3.05 ? 1 : 0;
      o[RT.CZ] = -.12 * f; o[RT.CX] = .1 * f; o[RT.HY] = .45 * f; o[RT.HW] = f;
      leg(o, false, -.55, .55, .25, hold(t, .25, T - .25, .3)); // the dab
      break;
    }
    case RIDE_EMOTE.MopedWheelie: { // pop, bounce on the back wheel, drop; a second small pop
      const up = Math.max(.6 * hold(t, .3, 1.7, .3), .32 * arch(t, 1.95, 2.75));
      o[RT.PITCH] = -up * (1 + .06 * Math.sin(t * 11)); o[RT.PIVOT] = -.62; o[RT.PUFF] = (t > .25 && t < .6) || (t > 1.95 && t < 2.2) ? 1 : 0; o[RT.WHEEL] = 6 * up;
      o[RT.CX] = -.3 * up; const fi = FIST(t); arm(o, true, fi[0], fi[1], fi[2], hold(t, .6, 1.8, .2));
      break;
    }
    case RIDE_EMOTE.MopedSalute: { // the kickstand: the moped leans onto its stand, the rider stands up and salutes, a nod
      o[RT.ROLL] = -.16 * f; o[RT.STAND] = hold(t, .2, T - .15, .45);
      arm(o, true, -1.55, 1.3, -1.95, hold(t, .9, T - .35, .25)); o[RT.HX] = .25 * arch(t, 1.6, 2.2); o[RT.HW] = f;
      arm(o, false, -.15, .25, -.1, .6 * hold(t, .5, T - .3, .3)); // the free hand hangs relaxed
      break;
    }
    case RIDE_EMOTE.MopedHorn: { // beep beep: suspension bounce, a happy wiggle, a fist shake
      const b = Math.abs(Math.sin(t * 7)) * f;
      o[RT.LIFT] = .13 * b; o[RT.ROLL] = .07 * Math.sin(t * 5.5) * f; o[RT.PITCH] = .04 * Math.sin(t * 7) * f; o[RT.PIVOT] = 0;
      const fi = FIST(t * 1.4); arm(o, true, fi[0], fi[1], fi[2], hold(t, 1, T, .25));
      o[RT.HY] = .25 * Math.sin(t * 5.5) * f; o[RT.HW] = f; o[RT.CZ] = .1 * Math.sin(t * 5.5) * f;
      break;
    }
    case RIDE_EMOTE.ScooterTailWhip: { // hop, the deck whips round its stem under the rider, catch it, land
      const h = arch(t, .45, 1.45);
      o[RT.LIFT] = .5 * h; o[RT.VYAW] = TAU * smooth((t - .55) / .8); o[RT.RLIFT] = .18 * h;
      leg(o, false, -.95, .1, 1.5, h); leg(o, true, -.95, .1, 1.5, h); o[RT.CX] = .2 * h;
      arm(o, true, -.4, 1.4, -.2, hold(t, 1.5, T, .2)); // arm out on the landing: "ta-da"
      break;
    }
    case RIDE_EMOTE.ScooterHop180: { // hop half round, a wave facing back, hop back round
      const h1 = arch(t, .3, 1), h2 = arch(t, 1.9, 2.6);
      o[RT.LIFT] = .42 * Math.max(h1, h2); o[RT.YAW] = Math.PI * smooth((t - .35) / .6) + Math.PI * smooth((t - 1.95) / .6);
      leg(o, false, -.6, .05, 1, Math.max(h1, h2)); leg(o, true, -.6, .05, 1, Math.max(h1, h2));
      const w = WAVE(t); arm(o, true, w[0], w[1], w[2], hold(t, 1.05, 1.9, .2));
      break;
    }
    case RIDE_EMOTE.ScooterOneFoot: { // flamingo: back foot up behind, balancing sway, a wave
      const k = hold(t, .2, T - .2, .4);
      leg(o, true, .95, .2, .35, k); o[RT.ROLL] = (.05 + .07 * Math.sin(t * 2.6)) * k; o[RT.CX] = .25 * k;
      const w = WAVE(t); arm(o, true, w[0], w[1], w[2], hold(t, .7, T - .1, .25));
      o[RT.HY] = .2 * k; o[RT.HW] = k;
      break;
    }
    case RIDE_EMOTE.ScooterKick: { // kick-push on the spot: the back foot swings and taps, the deck bounces, a little hop at the end
      const k = hold(t, .1, 2.4, .25), ph = Math.sin(t * 7.5);
      leg(o, true, .25 + .65 * Math.max(0, ph), .05, .35 + .55 * Math.max(0, -ph), k);
      o[RT.LIFT] = .05 * Math.abs(ph) * k + .35 * arch(t, 2.45, 3.05); o[RT.PITCH] = -.06 * Math.max(0, ph) * k + -.15 * arch(t, 2.45, 3.05); o[RT.PIVOT] = -.4;
      o[RT.CX] = .18 * k; o[RT.HX] = .15 * k; o[RT.HW] = k;
      break;
    }
    case RIDE_EMOTE.ScooterPivot: { // nose pivot: back wheel up, swing a full turn round the front wheel, set it down
      const k = hold(t, .2, 2.7, .35);
      o[RT.PITCH] = .3 * k; o[RT.PIVOT] = .48; o[RT.YAW] = -TAU * smooth((t - .4) / 2); o[RT.YPIV] = .48;
      o[RT.CX] = .3 * k; o[RT.ROLL] = .1 * k; leg(o, true, .5, .25, .3, .7 * k);
      break;
    }
    case RIDE_EMOTE.BikeBell: { // ding-ding, then a look left, a look right, and a wave
      o[RT.HY] = 1.1 * arch(t, .85, 1.75) - 1.1 * arch(t, 1.7, 2.6); o[RT.HW] = f;
      if (t < 1.2) arm(o, true, -1.05, .05, -1.25, hold(t, .2, .9, .15)); // thumb on the bell
      else { const w = WAVE(t); arm(o, true, w[0], w[1], w[2], hold(t, 2.45, T, .2)); }
      o[RT.ROLL] = .05 * Math.sin(t * 2.2) * f; o[RT.CZ] = .15 * (arch(t, .85, 1.75) - arch(t, 1.7, 2.6));
      break;
    }
    case RIDE_EMOTE.BikeWheelie: { // a long front-wheel-up wheelie with a balancing wobble
      const k = hold(t, .25, 2.85, .4);
      o[RT.PITCH] = -.62 * k + .05 * Math.sin(t * 4.3) * k; o[RT.PIVOT] = -.62; o[RT.ROLL] = .07 * Math.sin(t * 3.1) * k;
      o[RT.CX] = -.35 * k; o[RT.HX] = .2 * k; o[RT.HW] = k;
      break;
    }
    case RIDE_EMOTE.BikeBunnyHop: { // two bunny hops: front up first, both wheels in the air, a higher second hop
      const h1 = arch(t, .35, .95), h2 = arch(t, 1.35, 2.1);
      o[RT.LIFT] = .45 * h1 + .62 * h2; o[RT.PITCH] = -.25 * (arch(t, .25, .75) + arch(t, 1.25, 1.85)) + .1 * (arch(t, .7, 1) + arch(t, 1.8, 2.15)); o[RT.PIVOT] = -.62;
      leg(o, false, -.9, .05, 1.3, Math.max(h1, h2)); leg(o, true, -.9, .05, 1.3, Math.max(h1, h2)); o[RT.CX] = .25 * Math.max(h1, h2);
      break;
    }
    case RIDE_EMOTE.BikeStoppie: { // front brake: the back wheel lifts high, the rider leans back over it
      const k = hold(t, .25, 2.45, .35);
      o[RT.PITCH] = .48 * k + .04 * Math.sin(t * 5) * k; o[RT.PIVOT] = .62; o[RT.CX] = -.4 * k; o[RT.HX] = -.2 * k; o[RT.HW] = k;
      leg(o, false, .1, .05, .5, .6 * k); leg(o, true, .1, .05, .5, .6 * k);
      break;
    }
    case RIDE_EMOTE.BikeNoHands: { // both hands off the bars, arms up in a V and pumping, balancing wobble
      const k = hold(t, .3, T - .2, .3), p = Math.sin(t * 7);
      arm(o, true, -2.55 - .2 * p, .55, -.15 - .25 * Math.max(0, p), k); arm(o, false, -2.55 + .2 * p, .55, -.15 - .25 * Math.max(0, -p), k);
      o[RT.ROLL] = .08 * Math.sin(t * 2.4) * k; o[RT.CX] = -.3 * k; o[RT.HX] = -.25 * k; o[RT.HW] = k;
      break;
    }
  }
  return o;
}

export interface V3 {x: number; y: number; z: number}
/** The world offset of the ride's root for a trick pose at heading `yaw` (rad): the pitch turns about its axle and the yaw about its wheel, so the
 *  wheel on the ground stays put (no root travel apart from that). Writes `out` (x, z on the ground, y = the lift) and returns it. */
export function trickRootOffset(p: Float32Array, yaw: number, out: V3): V3 {
  const th = p[RT.PITCH], pz = p[RT.PIVOT], q = p[RT.YPIV], ps = p[RT.YAW], a = yaw + ps;
  const dy = pz * Math.sin(th), dz = pz * (1 - Math.cos(th));
  out.x = q * (Math.sin(yaw) - Math.sin(a)) + Math.sin(a) * dz;
  out.z = q * (Math.cos(yaw) - Math.cos(a)) + Math.cos(a) * dz;
  out.y = p[RT.LIFT] + dy;
  return out;
}
/** A point (local x, y, z on the ride; z forward) after the trick: rotation YXZ (heading + yaw, pitch, roll) then the root offset. For tests and the camera bounds. */
export function trickPoint(p: Float32Array, yaw: number, lx: number, ly: number, lz: number, out: V3, vehicle = false): V3 {
  const r = p[RT.ROLL], th = p[RT.PITCH], a = yaw + p[RT.YAW] + (vehicle ? p[RT.VYAW] : 0);
  let x = lx * Math.cos(r) - ly * Math.sin(r), y = lx * Math.sin(r) + ly * Math.cos(r), z = lz;
  const y2 = y * Math.cos(th) - z * Math.sin(th), z2 = y * Math.sin(th) + z * Math.cos(th); y = y2; z = z2;
  const wx = x * Math.cos(a) + z * Math.sin(a), wz = -x * Math.sin(a) + z * Math.cos(a);
  const o = trickRootOffset(p, yaw, {x: 0, y: 0, z: 0});
  out.x = wx + o.x; out.y = y + o.y + (vehicle ? 0 : p[RT.RLIFT]); out.z = wz + o.z; return out;
}
